<template>
	<div class="error-device-container">
		<div class="notice-box">
			<el-alert type="info" :closable="false" show-icon>
				<template #title>
					<div class="notice-container">
						<div class="notice-header" @click="noticeExpanded = !noticeExpanded" style="cursor: pointer; user-select: none;">
							<span class="notice-title">注意事项</span>
							<span class="notice-toggle">{{ noticeExpanded ? '▼' : '▶' }}</span>
						</div>
						<div class="notice-items" v-show="noticeExpanded">
							<div class="notice-item">1. 三方获取设备是由发货单号获取，一个发货单号存在多个设备，重新拉取的时候会批量更新单号下的一系列设备信息，支持重复拉取</div>
							<div class="notice-item">2. 设备编号是唯一标识，不存在的设备编号会新增设备，存在的设备编号只会更新设备信息</div>
							<div class="notice-item">3. 重新拉取后会显示详细的处理结果，包括：发货单号、拉取设备总数、成功数量（新增/编辑）、失败数量及失败原因</div>
							<div class="notice-item">4. 常见失败原因：设备编号不存在、设备型号不存在、设备所在地区不存在等，请检查基础数据配置后重新拉取</div>
						</div>
					</div>
				</template>
			</el-alert>
		</div>
		<div class="filter-section">
			<el-form class="filter-form" inline>
				<div class="form-row">
					<el-form-item label="名称">
						<el-input v-model="formData.name" placeholder="请输入设备名称" clearable></el-input>
					</el-form-item>
					<el-form-item label="发货单号">
						<el-input v-model="formData.deliverNo" placeholder="请输入发货单号" clearable></el-input>
					</el-form-item>
					<el-form-item label="编号">
						<el-input v-model="formData.code" placeholder="请输入设备编号" clearable></el-input>
					</el-form-item>
					<el-form-item label="单位">
						<el-input placeholder="请输入单位名称" v-model="formData.company_name" clearable></el-input>
					</el-form-item>
					<el-form-item label="电话">
						<el-input placeholder="请输入联系电话" v-model="formData.mobile" clearable></el-input>
					</el-form-item>
					<el-form-item class="action-buttons">
						<el-button type="primary" @click="currentChange(1)" icon="Search">查询</el-button>
						<el-button @click="restData" icon="Refresh">重置</el-button>
					</el-form-item>
				</div>
			</el-form>
		</div>
		<div class="table-section">
			<div class="table-header">
				<span class="table-title">异常设备列表</span>
				<span class="table-count">共 {{ totalCount }} 条记录</span>
			</div>
			<el-table 
				:data="tableData" 
				stripe 
				border 
				v-loading="loading"
				class="custom-table"
				:header-cell-style="{ background: '#f5f7fa', color: '#606266', fontWeight: 'bold' }"
				:cell-style="{ padding: '12px 8px' }"
			>
                <el-table-column prop="deliverNo" width="150" label="发货单号" align="center">
					<template #default="{row}">
						<div class="deliver-no">{{ row.deliverNo || '-' }}</div>
					</template>
				</el-table-column>
				<el-table-column label="设备信息" width="200" align="center">
					<template #default="{row}">
						<div class="device-info">
							<div class="device-name">
								<el-tooltip :content="row.name" placement="top" v-if="row.name && row.name.length > 10">
									<span class="name-text">{{ row.name.slice(0, 10) }}...</span>
								</el-tooltip>
								<span v-else class="name-text">{{ row.name || '-' }}</span>
							</div>
							<div class="device-details">
								<span class="device-code">编号：{{ row.code || '-' }}</span>
								<span class="device-model">型号：{{ row.cate || '-' }}</span>
							</div>
						</div>
					</template>
				</el-table-column>
				<el-table-column label="单位信息" min-width="180" align="center">
					<template #default="{row}">
						<div class="company-info">
							<div class="company-name">
								<el-tooltip :content="row.company_name" placement="top" v-if="row.company_name && row.company_name.length > 15">
									<span class="company-text">{{ row.company_name.slice(0, 15) }}...</span>
								</el-tooltip>
								<span v-else class="company-text">{{ row.company_name || '-' }}</span>
							</div>
							<div class="contact-info">
								<span class="contact-person">{{ row.contact || '-' }}</span>
								<span class="contact-phone">{{ row.mobile || '-' }}</span>
							</div>
						</div>
					</template>
				</el-table-column>
				<el-table-column label="地址信息" min-width="180" align="center">
					<template #default="{row}">
						<div class="address-info">
							<div class="region">{{ row.addresss || '-' }}</div>
							<div class="detail-address">
								<el-tooltip :content="row.address" placement="top" v-if="row.address && row.address.length > 20">
									<span class="address-text">{{ row.address.slice(0, 20) }}...</span>
								</el-tooltip>
								<span v-else class="address-text">{{ row.address || '-' }}</span>
							</div>
						</div>
					</template>
				</el-table-column>
				<el-table-column prop="error_msg" label="异常描述" min-width="200" align="center">
					<template #default="{row}">
						<div class="error-msg-container">
							<el-tooltip :content="row.error_msg" placement="top" v-if="row.error_msg && row.error_msg.length > 25">
								<span class="error-msg">{{ row.error_msg.slice(0, 25) }}...</span>
							</el-tooltip>
							<span v-else class="error-msg">{{ row.error_msg || '-' }}</span>
						</div>
					</template>
				</el-table-column>
				<el-table-column prop="create_time" label="拉取时间" width="200" align="center"></el-table-column>
				<el-table-column label="操作" width="150" align="center" fixed="right">
					<template #default="{row}">
						<el-button type="primary" link size="small" @click="openWindow(row)" icon="View">详情</el-button>
						<el-button type="warning" link size="small" @click="reloadDevice(row)" icon="Refresh">重拉</el-button>
					</template>
				</el-table-column>
			</el-table>
			<!-- 分页 -->
			<div class="pagination-section">
				<el-pagination 
					background 
					layout="prev, pager, next, sizes, total" 
					:total="totalCount" 
					:page-sizes="[10, 20, 50, 100]"
					:page-size="10"
					@current-change="currentChange"
					@size-change="handleSizeChange"
					class="custom-pagination"
				/>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
	import { ref, onMounted } from 'vue';
	import { useRouter } from 'vue-router';
	import { ElMessage, ElMessageBox } from 'element-plus';
	import { getmachineErrorListsApi, reloadErrorDeviceApi } from '@/api/device/device'
	import { Search, Refresh, View } from '@element-plus/icons-vue'
	
	const router = useRouter();
	const tableData = ref([])
	const totalCount = ref(0)
	const pageNum = ref(1)
	const pageSize = ref(10)
	const loading = ref(false)
	const noticeExpanded = ref(false)
	const formData = ref({
		code: '',
		name: '',
        deliverNo: '',
		company_name: '',
		mobile: ''
	})
	const openWindow = (row) => {
		router.push({
			path: 'errordetald',
			query: {
				id: row.id
			}
		})
	}
	
	const reloadDevice = (row) => {
		ElMessageBox.confirm('确定要重新拉取该设备吗？', '提示', {
			confirmButtonText: '确定',
			cancelButtonText: '取消',
			type: 'warning',
		}).then(async () => {
			try {
				const result = await reloadErrorDeviceApi({ id: row.id })
				
				let messageHtml = `
					<div style="line-height: 1.8;">
						<div style="background: #f5f7fa; padding: 15px; border-radius: 8px; margin-bottom: 15px;">
							<div style="display: flex; align-items: center; margin-bottom: 10px;">
								<span style="font-size: 16px; font-weight: bold; color: #303133;">📋 发货单号：</span>
								<span style="font-size: 16px; color: #409EFF; font-weight: bold;">${result.kNo || '-'}</span>
							</div>
							<div style="display: flex; align-items: center;">
								<span style="font-size: 14px; color: #606266;">当前发货单号拉取设备：</span>
								<span style="font-size: 14px; color: #303133; font-weight: bold; margin-left: 5px;">${result.total_count || 0} 条</span>
							</div>
						</div>
						
						<div style="display: flex; gap: 15px; margin-bottom: 15px;">
							<div style="flex: 1; background: #f0f9ff; padding: 15px; border-radius: 8px; border-left: 4px solid #67C23A;">
								<div style="display: flex; align-items: center; margin-bottom: 8px;">
									<span style="font-size: 20px; margin-right: 8px;">✅</span>
									<span style="font-size: 16px; font-weight: bold; color: #67C23A;">成功</span>
								</div>
								<div style="font-size: 24px; font-weight: bold; color: #303133; margin-bottom: 5px;">${result.insert_count + result.update_count || 0} 条</div>
								<div style="font-size: 12px; color: #909399;">
									<span style="color: #67C23A;">新增：${result.insert_count || 0} 条</span>
									<span style="margin: 0 5px;">|</span>
									<span style="color: #409EFF;">编辑：${result.update_count || 0} 条</span>
								</div>
							</div>
							
							<div style="flex: 1; background: #fef0f0; padding: 15px; border-radius: 8px; border-left: 4px solid #F56C6C;">
								<div style="display: flex; align-items: center; margin-bottom: 8px;">
									<span style="font-size: 20px; margin-right: 8px;">❌</span>
									<span style="font-size: 16px; font-weight: bold; color: #F56C6C;">失败</span>
								</div>
								<div style="font-size: 24px; font-weight: bold; color: #303133; margin-bottom: 5px;">${result.error_count || 0} 条</div>
								<div style="font-size: 12px; color: #909399;">请查看下方失败原因</div>
							</div>
						</div>
				`
				
				if ((result.skip_count || 0) > 0) {
					messageHtml += `
						<div style="background: #f4f4f5; padding: 15px; border-radius: 8px; margin-bottom: 15px; border: 1px solid #dcdfe6;">
							<div style="display: flex; align-items: center; margin-bottom: 8px;">
								<span style="font-size: 16px; font-weight: bold; color: #606266;">跳过</span>
							</div>
							<div style="font-size: 24px; font-weight: bold; color: #303133; margin-bottom: 5px;">${result.skip_count || 0} 条</div>
							<div style="font-size: 12px; color: #909399;">省市区不完整且无法补全的设备会跳过，不再写入异常列表</div>
						</div>
					`
				}
				
				if (result.error_reasons && result.error_reasons.length > 0) {
					messageHtml += `
						<div style="background: #fff6f6; padding: 15px; border-radius: 8px; border: 1px solid #FDE2E2;">
							<div style="display: flex; align-items: center; margin-bottom: 12px;">
								<span style="font-size: 16px; font-weight: bold; color: #F56C6C;">⚠️ 失败原因：</span>
							</div>
							<div style="max-height: 200px; overflow-y: auto;">
					`
					result.error_reasons.forEach((reason, index) => {
						messageHtml += `
							<div style="padding: 8px 12px; margin-bottom: 8px; background: #fff; border-radius: 4px; border-left: 3px solid #F56C6C; font-size: 13px; color: #606266;">
								<span style="font-weight: bold; color: #F56C6C; margin-right: 8px;">${index + 1}.</span>${reason}
							</div>
						`
					})
					messageHtml += `
							</div>
						</div>
					`
				}
				
				messageHtml += `</div>`
				
				ElMessageBox.alert(messageHtml, '重新拉取结果', {
					dangerouslyUseHTMLString: true,
					confirmButtonText: '确定',
					customClass: 'reload-result-dialog'
				})
				
				getmachineErrorLists()
			} catch (error) {
				ElMessage.error('重新拉取失败')
			}
		})
	}
	
	const getmachineErrorLists = async () => {
		loading.value = true
		try {
			const { lists, count } = await getmachineErrorListsApi({
				page_size: pageSize.value,
				page_no: pageNum.value,
				...formData.value
			})
			tableData.value = lists
			totalCount.value = count
		} catch (error) {
			console.error('获取异常设备列表失败:', error)
			ElMessage.error('获取数据失败')
		} finally {
			loading.value = false
		}
	}
	
	const currentChange = (page: number) => {
		pageNum.value = page
		getmachineErrorLists()
	}
	
	const handleSizeChange = (size: number) => {
		pageSize.value = size
		pageNum.value = 1
		getmachineErrorLists()
	}
	
	const restData = () => {
		formData.value = {
			code: '',
			name: '',
			company_name: '',
            deliverNo: '',
			mobile: ''
		}
		pageNum.value = 1
		getmachineErrorLists()
	}

	onMounted(() => {
		getmachineErrorLists()
	})
</script>

<style scoped>
	.error-device-container {
		padding: 0 18px;
	}
	
	.notice-box {
		margin-bottom: 18px;
	}
	
	.notice-container {
		width: 100%;
	}
	
	.notice-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		cursor: pointer;
		user-select: none;
	}
	
	.notice-title {
		font-size: 14px;
		font-weight: 500;
		color: #606266;
	}
	
	.notice-toggle {
		font-size: 12px;
		color: #909399;
	}
	
	.notice-items {
		margin-top: 10px;
	}
	
	.notice-item {
		font-size: 13px;
		color: #909399;
		line-height: 1.6;
		margin-bottom: 6px;
	}
	
	.filter-section {
		background: #FFFFFF;
		padding: 18px;
		border-radius: 16px;
		box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
		margin-bottom: 18px;
	}
	
	.filter-form {
		display: flex;
		flex-direction: column;
	}
	
	.form-row {
		display: flex;
		flex-wrap: wrap;
		gap: 0 20px;
		align-items: flex-start;
		padding-bottom: 8px;
	}
	
	.form-row .el-form-item {
		margin-bottom: 0;
		flex-shrink: 0;
		white-space: nowrap;
	}
	
	.action-buttons {
		margin-left: auto;
		flex-shrink: 0;
		white-space: nowrap;
	}
	
	.table-section {
		background: #FFFFFF;
		padding: 18px;
		border-radius: 16px;
		box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
	}
	
	.table-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 16px;
		padding-bottom: 12px;
		border-bottom: 1px solid #ebeef5;
	}
	
	.table-title {
		font-size: 16px;
		font-weight: 600;
		color: #303133;
	}
	
	.table-count {
		font-size: 14px;
		color: #909399;
	}
	
	.custom-table {
		width: 100%;
		border-radius: 8px;
		overflow: hidden;
	}
	
	.custom-table .el-table__header {
		border-radius: 8px 8px 0 0;
	}
	
	/* 设备信息样式 */
	.device-info {
		display: flex;
		flex-direction: column;
		gap: 6px;
		padding: 4px 0;
	}
	
	.device-name {
		font-weight: 600;
		color: #303133;
		font-size: 14px;
		line-height: 1.4;
	}
	
	.name-text {
		font-weight: 500;
	}
	
	.device-details {
		display: flex;
		flex-direction: column;
		gap: 2px;
		font-size: 12px;
		color: #606266;
	}
	
	.device-code,
	.device-model {
		line-height: 1.3;
	}
	
	/* 单位信息样式 */
	.company-info {
		display: flex;
		flex-direction: column;
		gap: 6px;
		padding: 4px 0;
	}
	
	.company-name {
		font-weight: 600;
		color: #303133;
		font-size: 14px;
		line-height: 1.4;
	}
	
	.company-text {
		font-weight: 500;
	}
	
	.contact-info {
		display: flex;
		flex-direction: column;
		gap: 2px;
		font-size: 12px;
		color: #606266;
	}
	
	.contact-person {
		font-weight: 500;
	}
	
	.contact-phone {
		color: #409eff;
		font-weight: 500;
	}
	
	/* 地址信息样式 */
	.address-info {
		display: flex;
		flex-direction: column;
		gap: 4px;
		padding: 4px 0;
	}
	
	.region {
		font-weight: 600;
		color: #303133;
		font-size: 13px;
		line-height: 1.4;
	}
	
	.detail-address {
		font-size: 12px;
		color: #606266;
		line-height: 1.3;
	}
	
	.address-text {
		color: #606266;
	}
	
	/* 发货单号样式 */
	.deliver-no {
		font-weight: 600;
		color: #409eff;
		font-size: 13px;
		word-break: keep-all;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
		max-width: 100%;
	}
	
	/* 异常描述样式 */
	.error-msg-container {
		padding: 4px 0;
	}
	
	.error-msg {
		color: #f56c6c;
		font-weight: 600;
		font-size: 13px;
		background-color: #fef0f0;
		padding: 4px 8px;
		border-radius: 4px;
		border-left: 3px solid #f56c6c;
		cursor: pointer;
		display: inline-block;
		max-width: 100%;
		word-break: break-word;
		white-space: normal;
		line-height: 1.4;
	}
	
	.error-msg:hover {
		background-color: #fde2e2;
		color: #f56c6c;
		text-decoration: none;
	}
	
	.pagination-section {
		display: flex;
		justify-content: center;
		align-items: center;
		margin-top: 18px;
		padding-top: 16px;
		border-top: 1px solid #ebeef5;
	}
	
	.custom-pagination {
		margin: 0 auto;
	}
	
	:deep(.el-table--border) {
		border: 1px solid #ebeef5;
		border-radius: 8px;
	}
	
	:deep(.el-table--border .el-table__cell) {
		border-right: 1px solid #ebeef5;
	}
	
	:deep(.el-table--border .el-table__cell:last-child) {
		border-right: none;
	}
	
	:deep(.el-button--link) {
		padding: 4px 8px;
		font-size: 12px;
	}
	
	:deep(.el-button--link:hover) {
		background-color: #f5f7fa;
		border-radius: 4px;
	}
	
	:deep(.el-table__body tr:hover > td) {
		background-color: #f5f7fa !important;
	}
	
	:deep(.el-table--striped .el-table__body tr.el-table__row--striped td) {
		background-color: #fafafa;
	}
	
	:deep(.el-table--striped .el-table__body tr.el-table__row--striped:hover td) {
		background-color: #f0f2f5 !important;
	}
</style>

<style>
	.reload-result-dialog {
		width: 440px !important;
		max-width: 440px !important;
	}
	.reload-result-dialog .el-message-box__content {
		padding: 20px !important;
	}
	.reload-result-dialog .el-message-box__message {
		font-size: 14px;
	}
	.reload-result-dialog p {
		margin: 8px 0;
	}
</style>
