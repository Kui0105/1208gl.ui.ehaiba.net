<template>
	<div>
		<el-form class="uw-form" inline>
			<el-form-item label="审核状态">
				<el-select v-model="formData.status" placeholder="全部" clearable style="width: 160px;">
					<el-option label="待审核" :value="0"></el-option>
					<el-option label="已通过" :value="1"></el-option>
					<el-option label="已驳回" :value="2"></el-option>
				</el-select>
			</el-form-item>
			<el-form-item label="关键词">
				<el-input
					v-model="formData.keyword"
					placeholder="请输入设备名称/编号/用户昵称/手机号"
					clearable
				></el-input>
			</el-form-item>
			<el-form-item label="设备编号">
				<el-input v-model="formData.code" placeholder="请输入设备编号" clearable></el-input>
			</el-form-item>
			<el-form-item label="省市区">
				<el-cascader
					v-model="formData.region"
					:options="cityList"
					:props="cascaderProps"
					placeholder="请选择省市区"
					clearable
					style="width: 260px;"
				/>
			</el-form-item>
			<el-form-item>
				<el-button type="primary" @click="currentChange(1)">查询</el-button>
				<el-button @click="resetData">重置</el-button>
			</el-form-item>
		</el-form>

		<div class="uw-box">
			<el-table :data="tableData" v-loading="loading">
				<el-table-column label="设备信息" min-width="260">
					<template #default="{ row }">
						<div class="info-card">
							<div class="device-name">{{ row.name || '-' }}</div>
							<div class="info-code">{{ row.code || '-' }}</div>
							<div v-if="formatCateType(row) !== '-'" class="info-sub">{{ formatCateType(row) }}</div>
						</div>
					</template>
				</el-table-column>
				<el-table-column label="单位 / 联系方式" min-width="220">
					<template #default="{ row }">
						<div class="info-card">
							<div class="company-name">{{ row.company_name || '-' }}</div>
							<div class="person-name">{{ row.contact || '-' }}</div>
							<div class="info-sub">{{ row.mobile || '-' }}</div>
						</div>
					</template>
				</el-table-column>
				<el-table-column label="申请用户" min-width="180">
					<template #default="{ row }">
						<div class="info-card">
							<div class="person-name">{{ row.user_nickname || '-' }}</div>
							<div class="info-sub">{{ row.user_mobile || '-' }}</div>
						</div>
					</template>
				</el-table-column>
				<el-table-column label="设备地址" min-width="220" show-overflow-tooltip>
					<template #default="{ row }">
						<div class="address-text">{{ row.machine_full_address || '-' }}</div>
					</template>
				</el-table-column>
				<el-table-column prop="status_desc" label="审核状态" min-width="100">
					<template #default="{ row }">
						<el-tag :type="getStatusTagType(row.status)">
							{{ row.status_desc || '-' }}
						</el-tag>
					</template>
				</el-table-column>
				<el-table-column label="时间" min-width="180">
					<template #default="{ row }">
						<div class="info-card">
							<div class="info-sub"><span class="time-label">申请</span><span>{{ row.create_time || '-' }}</span></div>
							<div class="info-sub"><span class="time-label">审核</span><span>{{ row.update_time || '-' }}</span></div>
						</div>
					</template>
				</el-table-column>
				<el-table-column prop="remark" label="备注" min-width="160" show-overflow-tooltip>
					<template #default="{ row }">
						{{ row.remark || '-' }}
					</template>
				</el-table-column>
				<el-table-column label="操作" fixed="right" width="180">
					<template #default="{ row }">
						<el-button type="text" @click="openDetailDialog(row)">查看</el-button>
						<template v-if="Number(row.status) === 0">
							<el-button
								v-perms="['machine.machine_apply/audit']"
								type="text"
								:loading="auditLoadingId === row.id && auditStatus === 1"
								@click="handleApprove(row)"
							>
								通过
							</el-button>
							<el-button
								v-perms="['machine.machine_apply/audit']"
								type="text"
								:loading="auditLoadingId === row.id && auditStatus === 2"
								@click="openRejectDialog(row)"
							>
								驳回
							</el-button>
						</template>
						<span v-else class="operation-placeholder">-</span>
					</template>
				</el-table-column>
			</el-table>
			<div class="pagination-wrap">
				<el-pagination
					background
					layout="prev, pager, next"
					:total="totalCount"
					hide-on-single-page
					@current-change="currentChange"
				/>
			</div>
		</div>

		<el-dialog v-model="rejectDialogVisible" title="驳回审核" width="520px">
			<el-form ref="rejectFormRef" :model="rejectFormData" :rules="rejectRules" label-width="80px">
				<el-form-item label="驳回原因" prop="remark">
					<el-input
						v-model="rejectFormData.remark"
						type="textarea"
						:rows="4"
						maxlength="200"
						show-word-limit
						placeholder="请输入驳回原因"
					></el-input>
				</el-form-item>
			</el-form>
			<template #footer>
				<el-button @click="rejectDialogVisible = false">取消</el-button>
				<el-button type="primary" :loading="rejectSubmitting" @click="submitReject">确定</el-button>
			</template>
		</el-dialog>

		<el-dialog v-model="detailDialogVisible" title="设备绑定申请详情" width="980px">
			<div class="detail-grid">
				<div
					v-for="item in detailFields"
					:key="item.key"
					class="detail-item"
					:class="{ 'detail-item-wide': item.wide }"
				>
					<div class="detail-label">{{ item.label }}</div>
					<div class="detail-value">{{ formatDetailValue(item.key) }}</div>
				</div>
			</div>
		</el-dialog>
	</div>
</template>

<script setup lang="ts">
	import { nextTick, onMounted, ref } from 'vue'
	import { ElMessage, ElMessageBox } from 'element-plus'

	import { allRegion } from '@/api/perms/role'
	import { auditMachineApplyApi, getMachineApplyListsApi } from '@/api/device/device'

	const tableData = ref<any[]>([])
	const totalCount = ref(0)
	const pageNum = ref(1)
	const cityList = ref<any[]>([])
	const loading = ref(false)
	const auditLoadingId = ref<number | string>('')
	const auditStatus = ref<number>(0)

	const rejectDialogVisible = ref(false)
	const rejectSubmitting = ref(false)
	const rejectFormRef = ref()
	const detailDialogVisible = ref(false)
	const currentDetail = ref<Record<string, any>>({})

	const cascaderProps = {
		checkStrictly: true,
		showPrefix: false,
		expandTrigger: 'click' as const,
		emitPath: true,
		value: 'value',
		label: 'label',
		children: 'children'
	}

	const createSearchFormData = () => ({
		status: undefined as number | undefined,
		keyword: '',
		code: '',
		region: [] as Array<string | number>
	})

	const formData = ref(createSearchFormData())
	const rejectFormData = ref({
		id: '',
		remark: ''
	})

	const rejectRules = {
		remark: [{ required: true, message: '请输入驳回原因', trigger: 'blur' }]
	}
	const detailFields = [
		{ key: 'code', label: '设备编号' },
		{ key: 'name', label: '设备名称' },
		{ key: 'cate', label: '设备型号' },
		{ key: 'type', label: '设备类型' },
		{ key: 'company_name', label: '单位名称' },
		{ key: 'contact', label: '联系人' },
		{ key: 'mobile', label: '联系电话' },
		{ key: 'machine_full_address', label: '设备地址', wide: true },
		{ key: 'province', label: '省' },
		{ key: 'city', label: '市' },
		{ key: 'area', label: '区' },
		{ key: 'address', label: '详细地址', wide: true },
		{ key: 'born_date', label: '出厂日期' },
		{ key: 'over_date', label: '到期日期' },
		{ key: 'machine_status', label: '设备状态' },
		{ key: 'machine_remark', label: '设备备注', wide: true },
		{ key: 'user_nickname', label: '申请用户昵称' },
		{ key: 'user_mobile', label: '申请用户手机号' },
		{ key: 'status_desc', label: '审核状态' },
		{ key: 'create_time', label: '申请时间' },
		{ key: 'update_time', label: '审核时间' },
		{ key: 'remark', label: '审核备注', wide: true }
	]

	const formatCateType = (row: any) => {
		const cate = String(row.cate || '').trim()
		const type = String(row.type || '').trim()
		if (cate && type) return cate === type ? cate : `${cate} ${type}`
		return cate || type || '-'
	}

	const getStatusTagType = (status: number) => {
		const currentStatus = Number(status)
		if (currentStatus === 1) return 'success'
		if (currentStatus === 2) return 'danger'
		return 'warning'
	}

	const buildListParams = () => {
		const params: Record<string, any> = {
			page_size: 10,
			page_no: pageNum.value,
			status: formData.value.status,
			keyword: formData.value.keyword,
			code: formData.value.code
		}

		if (formData.value.region.length > 0) {
			params.province = formData.value.region[0] || ''
			params.city = formData.value.region[1] || ''
			params.district = formData.value.region[2] || ''
			params.area = formData.value.region[2] || ''
		}

		return params
	}

	const formatDetailValue = (key: string) => {
		const regionFieldMap: Record<string, string> = {
			province: 'province_str',
			city: 'city_str',
			area: 'area_str'
		}
		const value = currentDetail.value[regionFieldMap[key] || key]
		return value === '' || value === null || value === undefined ? '-' : value
	}

	const getLists = async () => {
		loading.value = true
		try {
			const { lists, count } = await getMachineApplyListsApi(buildListParams())
			tableData.value = lists || []
			totalCount.value = count || 0
		} finally {
			loading.value = false
		}
	}

	const getAllRegion = async () => {
		const res = await allRegion({})
		cityList.value = res || []
	}

	const currentChange = (page: number) => {
		pageNum.value = page
		getLists()
	}

	const resetData = () => {
		formData.value = createSearchFormData()
		currentChange(1)
	}

	const submitAudit = async (params: { id: number | string; status: number; remark: string }) => {
		auditLoadingId.value = params.id
		auditStatus.value = params.status
		try {
			await auditMachineApplyApi(params)
			ElMessage.success('审核成功')
			await getLists()
		} finally {
			auditLoadingId.value = ''
			auditStatus.value = 0
		}
	}

	const handleApprove = async (row: any) => {
		await ElMessageBox.confirm('确定通过该绑定申请吗？', '提示', {
			confirmButtonText: '确定',
			cancelButtonText: '取消',
			type: 'warning'
		})
		await submitAudit({
			id: row.id,
			status: 1,
			remark: ''
		})
	}

	const openRejectDialog = (row: any) => {
		rejectFormData.value = {
			id: row.id,
			remark: ''
		}
		rejectDialogVisible.value = true
		nextTick(() => {
			rejectFormRef.value?.clearValidate()
		})
	}

	const openDetailDialog = (row: any) => {
		currentDetail.value = { ...row }
		detailDialogVisible.value = true
	}

	const submitReject = async () => {
		if (!rejectFormRef.value) return
		const valid = await rejectFormRef.value.validate().catch(() => false)
		if (!valid) return

		rejectSubmitting.value = true
		try {
			await submitAudit({
				id: rejectFormData.value.id,
				status: 2,
				remark: rejectFormData.value.remark
			})
			rejectDialogVisible.value = false
		} finally {
			rejectSubmitting.value = false
		}
	}

	onMounted(() => {
		getLists()
		getAllRegion()
	})
</script>

<style scoped>
	.uw-form {
		padding-left: 18px;
		padding-right: 18px;
		padding-top: 18px;
		background: #ffffff;
		box-shadow: 0 0 30px 0 rgba(245, 225, 228, 0.5);
		border-radius: 16px;
	}

	.uw-box {
		margin-top: 18px;
		background-color: #fff;
		padding: 18px;
		box-shadow: 0 0 30px 0 rgba(245, 225, 228, 0.5);
		border-radius: 16px;
	}

	.pagination-wrap {
		display: flex;
		align-items: center;
		justify-content: center;
		margin-top: 18px;
	}

	.operation-placeholder {
		color: #c0c4cc;
	}

	.info-card {
		display: flex;
		flex-direction: column;
		gap: 6px;
		line-height: 1.45;
		padding: 4px 0;
	}

	.device-name,
	.company-name {
		color: #303133;
		font-size: 14px;
		font-weight: 600;
		line-height: 1.5;
		word-break: break-all;
	}

	.person-name {
		color: #303133;
		font-weight: 500;
		line-height: 1.5;
		word-break: break-all;
	}

	.info-code {
		font-size: 12px;
		color: #909399;
		line-height: 1.4;
		word-break: break-all;
	}

	.info-sub {
		font-size: 12px;
		color: #909399;
		display: flex;
		align-items: flex-start;
		gap: 6px;
		line-height: 1.4;
		word-break: break-all;
	}

	.address-text {
		line-height: 1.5;
		color: #606266;
		word-break: break-all;
	}

	.time-label {
		flex: 0 0 28px;
		color: #606266;
	}

	.detail-grid {
		display: grid;
		grid-template-columns: repeat(3, minmax(0, 1fr));
		gap: 14px 18px;
	}

	.detail-item {
		padding: 14px 16px;
		border-radius: 10px;
		background: #f8fafc;
	}

	.detail-item-wide {
		grid-column: span 3;
	}

	.detail-label {
		margin-bottom: 6px;
		font-size: 12px;
		color: #909399;
	}

	.detail-value {
		line-height: 1.6;
		color: #303133;
		word-break: break-all;
		white-space: pre-wrap;
	}
 </style>
