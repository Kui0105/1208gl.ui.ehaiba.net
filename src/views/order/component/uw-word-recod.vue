<template>
	<div>
		<el-dialog title="工作记录" v-model="dialogVisible" width="800" @close="emit('close')">
			<el-table :data="tableData">
				<el-table-column prop="work_date" label="日期" />
				<el-table-column prop="msg" label="工作记录" />
				<el-table-column prop="create_time" label="图片" >
					<template #default="{row}">
						<el-image preview-teleported v-for="img in row.imgs.split(',')" :src="img" style="width: 80px;height: 80px;" :preview-src-list="row.imgs.split(',')" />
					</template>
				</el-table-column>
				<el-table-column prop="create_time" label="添加时间"  />
				<el-table-column prop="msg" label="额外内容">
					<template #default="{row}">
						<div v-for="exttra in row.extra_data">{{exttra.name}}:{{exttra.value}}</div>
					</template>
				</el-table-column>
				<el-table-column label="操作" v-if="orderInfo.order_status == 2">
					<template #default="{row}">
						<el-button v-if="canEditByDate(row.work_date)" type="text" @click="change({fulldate:row.work_date}),showPopup=true">编辑</el-button>
					</template>
				</el-table-column>
			</el-table>
			<el-pagination
				class="mt-[18px]"
				background
				layout="prev, pager, next"
				:total="countTotal"
				@current-change="currentChange"
			/>
			<template #footer>
				<span class="dialog-footer">
					<el-button @click="dialogVisible = false,emit('close')">关闭</el-button>
					<el-button v-if="orderInfo.order_status == 2" type="primary" @click="showPopup=true">添加记录</el-button>
				</span>
			</template>
		</el-dialog>
		<!-- 添加记录 -->
		<el-dialog title="添加记录" v-model="showPopup" width="700" >
			<el-form :model="form" label-width="120px">
				<el-form-item label="记录日期">
					<uw-calendar 
						:showMonth="true"
						:insert="true"
						:start-date="startData"
						:end-date="endData"
						:showToDay="false"
						:selected="selected"
						:date="form.date"
						@change="change" 
					/>
				</el-form-item>
				<el-form-item label="工作量项目">
					<el-checkbox-group v-model="checkedExtraKeys" @change="syncExtraChecked">
						<el-checkbox
							v-for="item in form.extra_data"
							:key="getExtraKey(item)"
							:label="getExtraKey(item)"
						>
							{{ item.name }}
						</el-checkbox>
					</el-checkbox-group>
				</el-form-item>
				<el-form-item v-for="item in selectedExtraData" :key="getExtraKey(item)" :label="item.name">
					<el-input :placeholder="item.placeholder || `请填写${item.name}数量`" v-model="item.value"></el-input>
				</el-form-item>
				<el-form-item label="工作记录">
					<el-input v-model="form.msg" placeholder="请填写工作记录" type="textarea" />
				</el-form-item>
				<el-form-item label="上传图片">
					<material-picker type="image" v-model="form.imgs" :limit="10" />
				</el-form-item>
			</el-form>
			<template #footer>
				<span class="dialog-footer">
					<el-button @click="showPopup = false">取 消</el-button>
					<el-button :loading="loading" v-if="isEdit && orderInfo.order_status == 2" type="primary" @click="submit">确 定</el-button>
				</span>
			</template>
		</el-dialog>
	</div>
</template>

<script lang="ts" setup>
	import { computed, ref , onMounted } from 'vue';
	import uwCalendar from '@/components/uni-calendar/uni-calendar.vue';
	import { ElMessage } from 'element-plus';
	import { getOrderWorkDate , getOrderWorkInfo , orderWorkAdd , getOrderWorkExtra , orderWorkEdit , getOrderWorkList } from '@/api/order/order';
	type WorkExtraItem = {
		key?: string
		name: string
		placeholder?: string
		value: string
		checked?: boolean
	}

	const props = defineProps({
		orderInfo: {
			type: Object,
			default: () => ({})
		}
	})
	const emit = defineEmits(['close'])
	const dialogVisible = ref(true)
	const showPopup = ref(false)
	const form = ref({
		id:'',
		log_id:'',
		date:new Date().toLocaleDateString().replace(/\//g, '-'),
		msg:'',
		imgs:'',
		extra_data:[] as WorkExtraItem[]
	})
	const selected =ref([])
	const startData = ref('2026-01-01')
	const endData = ref(new Date().toLocaleDateString().replace(/\//g, '-'))
	const thatData = ref(new Date().toLocaleDateString().replace(/\//g, '-'))
	const extra_data = ref<WorkExtraItem[]>([])
	const checkedExtraKeys = ref<string[]>([])
	const isEdit = ref(true)
	const loading = ref(false)
	
	const pageNo = ref(1)
	const tableData = ref([])
	const countTotal = ref(0)
	const getOrderWorkListApi = async () => {
		const {lists,count} = await getOrderWorkList({
			id:props.orderInfo.id,
			page_no:pageNo.value,
			page_size:10
		})
		tableData.value = lists
		countTotal.value = count
	}
	const currentChange = (page: number) => {
		pageNo.value = page
		getOrderWorkListApi()
	}
	
	const getExtraKey = (item: WorkExtraItem) => item.key || item.name
	const selectedExtraData = computed(() => {
		return form.value.extra_data.filter((item) => item.checked)
	})

	const syncExtraChecked = (keys = checkedExtraKeys.value as string[]) => {
		form.value.extra_data.forEach((item) => {
			item.checked = keys.includes(getExtraKey(item))
			if (!item.checked) item.value = ''
		})
	}

	const buildExtraFormData = (savedData: WorkExtraItem[] = []) => {
		const savedMap = new Map(savedData.map((item) => [getExtraKey(item), item]))
		const options = extra_data.value.map((item) => {
			const saved = savedMap.get(getExtraKey(item))
			return {
				...item,
				value: saved?.value || '',
				checked: !!saved
			}
		})

		savedData.forEach((item) => {
			if (!options.some((option) => getExtraKey(option) === getExtraKey(item))) {
				options.push({
					...item,
					placeholder: item.placeholder || `请填写${item.name}数量`,
					checked: true
				})
			}
		})

		checkedExtraKeys.value = options.filter((item) => item.checked).map(getExtraKey)
		return options
	}

	const submit = async () => {
		const data = JSON.parse(JSON.stringify(form.value))
		data.imgs = String(data.imgs)
		loading.value = true
		try{
			data.log_id ? await orderWorkEdit({...data,id:props.orderInfo.id}) : await orderWorkAdd({...data,id:props.orderInfo.id})
			loading.value = false
			showPopup.value = false
			ElMessage.success(data.log_id ? '编辑成功' : '添加成功')
			getOrderWorkListApi()
			getOrderWorkDate({id:props.orderInfo.id}).then(res=>{
				selected.value = res
			})
		} catch(e){
			loading.value = false
		}
	}
	
	const change = ({fulldate}: {fulldate: string}) => {
		isEdit.value = canEditByDate(fulldate)
		form.value.date = fulldate
		getOrderWorkInfo({id:props.orderInfo.id,date:fulldate}).then((res)=>{
			if(Array.isArray(res) && res.length == 0){
				form.value = {
					id:'',
					log_id:'',
					date:fulldate,
					msg:'',
					imgs:'',
					extra_data:buildExtraFormData()
				}
			}else{
				Object.assign(form.value,res)
				form.value.id = props.orderInfo.id
				form.value.log_id = res.id
				form.value.extra_data = buildExtraFormData(res.extra_data || [])
			}
		})
	}
	
	/**
	 * 判断日期是否允许编辑（仅今天 / 昨天）
	 * @param dateStr yyyy-m-d | yyyy-mm-dd
	 */
	const canEditByDate = (dateStr: string): boolean => {
	    if (!dateStr) return false
	
	    // 统一成 yyyy-mm-dd，避免 iOS 解析问题
	    const safeDateStr = dateStr.replace(/-/g, '/')
	
	    const target = new Date(safeDateStr)
	    if (isNaN(target.getTime())) return false
	
	    const now = new Date()
	
	    // 归零时间，只比较日期
	    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
	    const targetDay = new Date(
	        target.getFullYear(),
	        target.getMonth(),
	        target.getDate()
	    )
	
	    const diffTime = today.getTime() - targetDay.getTime()
	    const diffDays = diffTime / (1000 * 60 * 60 * 24)
	
	    // 只允许今天(0) 和 昨天(1)
	    return diffDays === 0 || diffDays === 1
	}
	onMounted(async() => {
		getOrderWorkListApi()
		await getOrderWorkExtra({id:props.orderInfo.id}).then((res)=>{
			form.value.extra_data = res
			extra_data.value = res
		})
		getOrderWorkDate({id:props.orderInfo.id}).then(res=>{
			selected.value = res
		})
		change({fulldate:thatData.value})
	})
</script>

<style scoped lang="scss">
	::v-deep .el-popper{
		position: sticky !important;
		display: block !important;
	}
	::v-deep .el-input--prefix{
		display: none !important;
	}
	.edit{
		position: absolute;
		right: 10px;
		top: 10px;
		cursor: pointer;
	}
</style>
