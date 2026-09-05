<template>
	<el-dialog v-model="showPopup" title="工单完成" width="900px" @close="emit('close')">
		<el-form label-position="top">
			<el-form-item label="点检部位">
				<el-radio-group v-model="tabActive">
					<el-radio-button v-for="item in djFormLabel" :label="item.id">{{item.name}}</el-radio-button>
				</el-radio-group>
			</el-form-item>
			<el-form-item label="检查部位">
				<el-radio-group v-model="buweiActive">
					<el-radio-button v-for="item in buweiList" :label="item.id">{{item.name}}</el-radio-button>
				</el-radio-group>
			</el-form-item>
			<el-form-item v-for="item in neirRongList">
				<div class="flex items">
					<div>{{item.name}}</div>
					<el-radio-group v-model="item.check_status">
						<el-radio :label="1">正常</el-radio>
						<el-radio :label="2">异常</el-radio>
					</el-radio-group>
				</div>
				<el-form-item v-if="item.check_status == 2" label="异常说明" class="mt-[18px]" style="width: 100%;">
					<el-input type="textarea" v-model="item.msg"></el-input>
				</el-form-item>
				<el-form-item v-if="item.check_status == 2" label="上传图片" class="mt-[18px]" style="width: 100%;">
					<material-picker type="image" v-model="item.imgs" :limit="10" />
				</el-form-item>
			</el-form-item>
		</el-form>
		<template #footer>
			<span class="dialog-footer">
				<el-button @click="showPopup = false,emit('close')">取 消</el-button>
				<el-button type="primary" @click="confirm">下一步</el-button>
			</span>
		</template>
	</el-dialog>
</template>

<script setup lang="ts">
	import { ref , onMounted ,computed } from 'vue';
	import { getDjForm, getOrderEditFill } from '@/api/order/order';
	import { ElMessage, ElMessageBox } from 'element-plus';
	const prop = defineProps({
		orderInfo: {
			type: Object,
			default: () => ({})
		}
	})
	const emit = defineEmits(['change','close'])
	const showPopup = ref(true)
	const isRejectedForEdit = computed(() => Number(prop.orderInfo.audit_status) === 3
		|| (Number(prop.orderInfo.audit_status) === 2 && Number(prop.orderInfo.re_audit_status) === 3))
	const djFormLabel = ref<any[]>([])
	const tabActive = ref<any>(null)
	const buweiActive = ref<any>(null)
	const buweiList = computed(()=>{
		const sons = djFormLabel.value.find(val=>val.id == tabActive.value)?.sons || []
		buweiActive.value = sons[0]?.id
		return sons
	})
	const neirRongList = computed(()=>{
		return buweiList.value.find((val: any) => val.id == buweiActive.value)?.checks || []
	})
	const normalizeInspectionImages = (value: any): string[] => {
		if (Array.isArray(value)) {
			return value.flatMap((item) => {
				if (typeof item === 'string') {
					return item.split(',').map((uri) => uri.trim()).filter(Boolean)
				}
				if (item && typeof item === 'object') {
					const uri = item.tempFilePath || item.url || item.uri || item.value || ''
					return uri ? [uri] : []
				}
				return item ? [String(item)] : []
			})
		}
		if (typeof value === 'string') {
			return value.split(',').map((uri) => uri.trim()).filter(Boolean)
		}
		return value ? [String(value)] : []
	}
	const normalizeDjForm = (formData: any[] = []) => {
		return formData.map((part) => ({
			...part,
			sons: (part?.sons || []).map((son: any) => ({
				...son,
				checks: (son?.checks || []).map((check: any) => ({
					...check,
					check_status: Number(check?.check_status) || 1,
					msg: check?.msg ?? '',
					imgs: normalizeInspectionImages(check?.imgs)
				}))
			}))
		}))
	}
	const confirm = () => {
		const data = JSON.parse(JSON.stringify(djFormLabel.value))
		for (const part of data) {
			for (const tab of part.sons || []) {
				for (const row of tab.checks || []) {
					if (row.check_status === 2) {
						if (!row.msg || !row.msg.trim()) {
							ElMessage.error(`【${part.name} - ${tab.name}】${row.name}：请输入异常说明`)
							return
						}
						if (!row.imgs || row.imgs.length === 0) {
							ElMessage.error(`【${part.name} - ${tab.name}】${row.name}：请上传异常图片`)
							return
						}
					}
					row.imgs = normalizeInspectionImages(row.imgs).join(',')
				}
			}
		}
		emit('change',data)
	}
	onMounted(async ()=>{
		if (isRejectedForEdit.value) {
			const editData = await getOrderEditFill({id:prop.orderInfo.id})
			const historyData = Array.isArray(editData?.dj_data) ? editData.dj_data : []
			// 修改时必须以历史点检报告为准，避免当前点检模板变更后无法回填。
			djFormLabel.value = historyData.length
				? normalizeDjForm(historyData)
				: normalizeDjForm(await getDjForm({id:prop.orderInfo.id}))
		} else {
			djFormLabel.value = normalizeDjForm(await getDjForm({id:prop.orderInfo.id}))
		}
		tabActive.value = djFormLabel.value[0]?.id
	})
</script>

<style scoped lang="scss">
	.items{
		justify-content: space-between;
		align-items: center;
		width: 100%;
		height: 56px;
		background: #FAFAFA;
		border-radius: 8px 8px 8px 8px;
		border: 1px solid #DFE5F1;
		padding: 0 16px;
		font-weight: 700;
		font-size: 14px;
		color: #333333;
		line-height: 20px;
	}
</style>
