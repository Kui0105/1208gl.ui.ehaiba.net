<template>
	<div>
		<!-- 显示派单弹窗 -->
		<el-dialog title="派单" v-model="showDispatch" width="500px" @close="emit('close')">
			<el-form :rules="rules" :model="dispatchForm" label-width="80">
				<el-form-item :label="targetLabel" prop="send_engineer_name">
					<el-input v-model="formData.send_engineer_name" readonly :placeholder="`请选择${targetLabel}`"
						:suffix-icon="ArrowRight" @click="dialogVisible=true"></el-input>
				</el-form-item>
				<el-form-item v-if="isReassign || orderInfo.type == 7" :label=" orderInfo.type == 7 ? '技术交底' : '转派说明'">
					<el-input v-model="formData.reason" type="textarea"></el-input>
				</el-form-item>
				<el-form-item v-if="orderInfo.type == 7" label="其他附件">
					<material-picker type="image" v-model="formData.else_file" :limit="1" />
				</el-form-item>
			</el-form>
			<template #footer>
				<span class="dialog-footer">
					<el-button @click="showDispatch = false,emit('close')">取 消</el-button>
					<el-button type="primary" @click="submit">确 定</el-button>
				</span>
			</template>
		</el-dialog>
		<!-- 工程师列表 -->
		<!-- el-dialog -->
		<el-dialog :title="`选择${targetLabel}`" v-model="dialogVisible" width="50%">
			<template #header="{ titleId, titleClass }">
				<div class="my-header flex items-center">
					<h4 :id="titleId" :class="titleClass">选择{{ targetLabel }}</h4>
					<el-input class="ml-[24px]" v-model="keyword" clearable :placeholder="`请输入${targetLabel}姓名进行搜索`" style="width: 300px;" />
					<el-button class="ml-[12px]" type="primary" @click="searchEngineer">搜索</el-button>
				</div>
			</template>
			<el-table :data="tableData" style="width: 100%">
				<el-table-column align="center" prop="name" label="姓名" width="180" />
				<el-table-column align="center" prop="type_str" label="身份" width="120" />
				<el-table-column align="center" prop="mobile" label="联系方式" />
				<el-table-column align="center" label="上级">
					<template #default="{ row }">
						{{ row.parent_info?.name || '-' }}
					</template>
				</el-table-column>
				<el-table-column align="center" label="操作">
					<template #default="{row}">
						<el-button type="primary" @click="selectEngineer(row)">选择</el-button>
					</template>
				</el-table-column>
			</el-table>
			<div style="display: flex;align-items: center;justify-content: center;margin-top: 18px;">
				<el-pagination
					v-model:current-page="pageNo"
					background
					layout="prev, pager, next"
					:page-size="pageSize"
					:total="totalCount"
					@current-change="currentChange"
				/>
			</div>
		</el-dialog>
	</div>

</template>

<script setup lang="ts">
	import { computed, ref } from 'vue'
	import { ArrowRight } from '@element-plus/icons-vue';
	import { getEngineerLists, sendOrder } from '@/api/order/order'
	import { ElMessage } from 'element-plus'
	const prop = defineProps({
		orderId: {
			type: String,
			default: ''
		},
		isReassign:{
			type:Boolean,
			default:false
		},
		orderInfo: {
			type: Object,
			default: () => ({})
		},
	})
	const emit = defineEmits(['change','close'])
	const showDispatch = ref(true)
	const dialogVisible = ref(false)
	const dispatchForm = ref({
		region: ''
	})
	const tableData = ref([])
	const totalCount = ref(0)
	const pageNo = ref(1)
	const pageSize = 10
	const keyword = ref('')
	const searchKeyword = ref('')
	const formData = ref({
		id: '',
		send_engineer_id: '',
		reason: '',
		else_file: '',
		send_engineer_name: ''
	})
	const rules = {
		send_engineer_name: [
			{ required: true, message: '请选择处理人', trigger: 'blur' },
		],
	}
	const targetLabel = computed(() => {
		return [6, 7].includes(Number(prop.orderInfo?.type || 0)) ? '操作员' : '处理人'
	})
	const selectEngineer = (row : { id : string; name : string; }) => {
		formData.value.send_engineer_id = row.id
		formData.value.send_engineer_name = row.name
		dialogVisible.value = false
	}

	const getEngineerList = () => {
		getEngineerLists({
			page_no: pageNo.value,
			page_size: pageSize,
            order_id: prop.orderId,
			keyword: searchKeyword.value
		}).then((res) => {
			tableData.value = res.lists
			totalCount.value = res.count
		})
	}

	const currentChange = (page : number) => {
		pageNo.value = page
		getEngineerList()
	}

	const searchEngineer = () => {
		pageNo.value = 1
		searchKeyword.value = keyword.value
		getEngineerList()
	}

	getEngineerList()

	const submit = () => {
		if (!formData.value.send_engineer_id) return ElMessage.error(`请选择${targetLabel.value}`)
		sendOrder({
			id: prop.orderId,
			send_engineer_id: formData.value.send_engineer_id,
			reason: formData.value.reason,
			else_file: formData.value.else_file
		}).then((res) => {
			ElMessage.success('派单成功')
			emit('change')
		})
	}
</script>

<style>
</style>
