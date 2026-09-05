<template>
	<div class="uw-clothesdetail">
		<div class="page-title-wrap">
			<div class="page-title">免费换件详情</div>
			<img class="back" src="/src/assets/uwback.png" @click="$router.back()">
		</div>

		<div class="summary-card page-card">
			<div class="summary-grid">
				<div class="summary-item">
					<span class="summary-label">申请单号</span>
					<span class="summary-value summary-link">{{info.order_sn}}</span>
				</div>
				<div class="summary-item">
					<span class="summary-label">申请人</span>
					<span class="summary-value">{{info.engineer_name}}</span>
				</div>
				<!-- <div class="summary-item">
					<span class="summary-label">审核状态</span>
					<span class="summary-value">
						<span :class="['status-tag', `status-${info.status || 0}`]">{{info.status_str}}</span>
					</span>
				</div> -->
				<div class="summary-item">
					<span class="summary-label">申请时间</span>
					<span class="summary-value">{{info.create_time}}</span>
				</div>
				<div class="summary-item" v-if="info.status != 1">
					<span class="summary-label">审核人</span>
					<span class="summary-value">{{info.audit_name}}</span>
				</div>
				<div class="summary-item" v-if="info.status != 1">
					<span class="summary-label">审核时间</span>
					<span class="summary-value">{{info.audit_time}}</span>
				</div>
				<div class="summary-item summary-item-wide" v-if="info.status != 1">
					<span class="summary-label">审核备注</span>
					<span class="summary-value"><span class="summary-remark" @click="showBohuiStatus">{{info.audit_msg}}</span></span>
				</div>
			</div>
			<div class="summary-actions">
				<!-- <el-button type="primary" v-if="info.audit_btn" @click="dialogVisible=true">审核</el-button>
				<el-button type="primary" v-perms="['auth.admin/reordershenhe']" v-if="info.status == 2" @click="reAuditDialogVisible=true">复审</el-button> -->
			</div>
		</div>

		<div class="page-card section-card mt-[24px]">
			<div class="section-title">
				<span class="section-bar"></span>
				<span>设备信息</span>
			</div>
			<div class="info-grid section-body">
				<div class="info-item">
					<span class="info-label">工单编号</span>
					<span class="info-value">{{info.order_data?.order_sn}}</span>
				</div>
				<div class="info-item">
					<span class="info-label">设备编号</span>
					<span class="info-value">{{info.order_data?.machine_info?.code}}</span>
				</div>
				<div class="info-item">
					<span class="info-label">设备名称</span>
					<span class="info-value">{{info.order_data?.machine_info?.name}}</span>
				</div>
				<div class="info-item">
					<span class="info-label">联系人</span>
					<span class="info-value">{{info.order_data?.machine_info?.contact}}</span>
				</div>
				<div class="info-item">
					<span class="info-label">联系电话</span>
					<span class="info-value">{{info.order_data?.machine_info?.mobile}}</span>
				</div>
				<div class="info-item">
					<span class="info-label">使用地区</span>
					<span class="info-value">{{info.order_data?.machine_info?.full_address}}</span>
				</div>
				<div class="info-item info-item-wide">
					<span class="info-label">详细地址</span>
					<span class="info-value">{{info.order_data?.machine_info?.address}}</span>
				</div>
			</div>
		</div>

		<div class="page-card section-card mt-[24px]">
			<div class="section-title section-title-between">
				<div class="section-title-left">
					<span class="section-bar"></span>
					<span>配件明细</span>
				</div>
				<span class="section-count">共 {{info.replace_item?.length || 0}} 件配件</span>
			</div>
			<el-table border class="card-table" :data="info.replace_item" :span-method="spanMethod">
			<el-table-column prop="old_sn" label="序号"></el-table-column>
			<el-table-column prop="part_code" label="编码"></el-table-column>
			<el-table-column prop="part_name" label="配件名称"></el-table-column>
			<el-table-column prop="part_spec" label="规格型号"></el-table-column>
			<el-table-column prop="room" label="仓库"></el-table-column>
			<!-- <el-table-column prop="phone" label="旧件SN"></el-table-column> -->
			<el-table-column prop="num" label="数量"></el-table-column>
			<el-table-column prop="is_protec" label="是否在保"></el-table-column>
			<el-table-column prop="pro_time" label="质保到期时间"></el-table-column>
			<!-- 编辑才会有的内容 -->
			<el-table-column v-if="isEdit || info.fill_time" prop="new_sn" label="新件SN" width="192">
				<template #default="{row}">
					<el-input v-if="!info.fill_time" v-model="row.new_sn" placeholder="请输入新件SN"></el-input>
				</template>
			</el-table-column>
			<el-table-column v-if="(isEdit || info.fill_time) && info.show_it == 1" label="换件证明单" width="125">
				<template #default>
					<div style="padding: 20px 0;">
						<material-picker v-if="!info.fill_time" v-model="buchongFrom.zm_imgs" :limit="1" />
						<el-image preview-teleported v-else :preview-src-list="[buchongFrom.zm_imgs]" :src="buchongFrom.zm_imgs"></el-image>
					</div>
				</template>
			</el-table-column>
			<el-table-column v-if="(isEdit || info.fill_time)  && info.show_it == 1" label="换件物流单" width="125">
				<template #default>
					<div style="padding: 20px 0;">
						<material-picker v-if="!info.fill_time" v-model="buchongFrom.wl_imgs" :limit="1" />
						<el-image preview-teleported v-else :preview-src-list="[buchongFrom.wl_imgs]" :src="buchongFrom.wl_imgs"></el-image>
					</div>
				</template>
			</el-table-column>
		</el-table>
		</div>

		<div class="page-card section-card mt-[24px]">
			<div class="section-title">
				<span class="section-bar"></span>
				<span>收货信息</span>
			</div>
			<div class="info-grid receipt-grid section-body">
				<div class="info-item">
					<span class="info-label">收货人</span>
					<span class="info-value">{{info.contact}}</span>
				</div>
				<div class="info-item">
					<span class="info-label">设备类型</span>
					<span class="info-value">{{info.machine_type}}</span>
				</div>
				<div class="info-item">
					<span class="info-label">联系电话</span>
					<span class="info-value">{{info.mobile}}</span>
				</div>
				<div class="info-item">
					<span class="info-label">运输方式</span>
					<span class="info-value">{{info.trans}}</span>
				</div>
				<div class="info-item">
					<span class="info-label">紧急程度</span>
					<span class="info-value"><span class="level-tag">{{info.emergency}}</span></span>
				</div>
				<div class="info-item info-item-wide">
					<span class="info-label">收货地址</span>
					<span class="info-value">{{info.full_address}}</span>
				</div>
				<div class="info-item info-item-wide info-item-accent">
					<span class="info-label">详细地址</span>
					<span class="info-value">{{info.address}}</span>
				</div>
				<div class="info-item info-item-wide info-item-note">
					<span class="info-label">申请说明</span>
					<span class="info-value">{{info.remark}}</span>
				</div>
			</div>
		</div>

		<!-- <div style="display: flex;justify-content: center;" class="mt-[24px]" v-if="info.status == 4 && isEdit && info.recept_status == 1 && !info.fill_time">
			<el-button type="primary" @click="submitBuChong">提交</el-button>
		</div> -->
		<!-- 审核弹窗 -->
		<el-dialog v-model="dialogVisible" title="免费换件审核" width="500" :show-close="false">
			<el-form label-position="top">
				<el-form-item>
					<el-radio-group v-model="auidtFrom.audit_status">
						<el-radio label="2">通过</el-radio>
						<el-radio label="3">不通过</el-radio>
					</el-radio-group>
				</el-form-item>
				<el-form-item label="审核意见">
					<el-input type="textarea" v-model="auidtFrom.audit_msg" placeholder="若不通过则必填" />
				</el-form-item>
			</el-form>
			<template #footer>
				<div class="dialog-footer">
					<el-button @click="dialogVisible = false">取消</el-button>
					<el-button type="primary" @click="submitAuidt">确定</el-button>
				</div>
			</template>
		</el-dialog>
		<!-- 复审弹窗 -->
		<el-dialog v-model="reAuditDialogVisible" title="免费换件复审" width="500" :show-close="false">
			<el-form label-position="top">
				<el-form-item>
					<el-radio-group v-model="reAuidtFrom.audit_status">
						<el-radio label="2">通过</el-radio>
						<el-radio label="3">不通过</el-radio>
					</el-radio-group>
				</el-form-item>
				<el-form-item label="复审意见">
					<el-input type="textarea" v-model="reAuidtFrom.audit_msg" placeholder="若不通过则必填" />
				</el-form-item>
			</el-form>
			<template #footer>
				<div class="dialog-footer">
					<el-button @click="reAuditDialogVisible = false">取消</el-button>
					<el-button type="primary" @click="submitReAudit">确定</el-button>
				</div>
			</template>
		</el-dialog>
	</div>
</template>

<script lang="ts" setup>
	import { ref, onMounted } from 'vue';
	import { getReplaceDetail , auditReplace , reAuditReplace , orderFill } from '@/api/order/order';
	import { useRoute } from 'vue-router';
	import { ElMessage } from 'element-plus';
	import { debounce } from 'lodash';
	const route = useRoute()
	const auidtFrom = ref({
		id:route.query.id,
		audit_status:'',
		audit_msg:''
	})
	const reAuidtFrom = ref({
		id:route.query.id,
		audit_status:'',
		audit_msg:''
	})
	const buchongFrom = ref({
		zm_imgs:'',
		wl_imgs:'',
		item_data:[]
	})
	const dialogVisible = ref(false)
	const reAuditDialogVisible = ref(false)
	const info = ref({
		replace_item:[]
	})
	const isEdit = route.query.edit || 0
	const spanMethod = ({ rowIndex, columnIndex } : { rowIndex : number, columnIndex : number }) => {
		const mergeColumnIndex = [9, 10]
		if (mergeColumnIndex.includes(columnIndex)) {
			if (rowIndex % info.value.replace_item.length === 0) {
				return {
					rowspan: info.value.replace_item.length,
					colspan: 1,
				}
			} else {
				return {
					rowspan: 0,
					colspan: 0,
				}
			}
		}
	}

	const submitAuidt = debounce(() => {
		if(!auidtFrom.value.audit_status){
			ElMessage.error('请选择审核状态')
			return
		}
		if(auidtFrom.value.audit_status == '3' && !auidtFrom.value.audit_msg){
			ElMessage.error('请填写审核意见')
			return
		}
		auditReplace(auidtFrom.value).then((res)=>{
			dialogVisible.value = false
			getReplaceDetail({id:route.query.id}).then((res)=>{
				info.value = res
			})
		})
	}, 500)

	const submitReAudit = debounce(() => {
		if(!reAuidtFrom.value.audit_status){
			ElMessage.error('请选择复审状态')
			return
		}
		if(reAuidtFrom.value.audit_status == '3' && !reAuidtFrom.value.audit_msg){
			ElMessage.error('请填写复审意见')
			return
		}
		reAuditReplace(reAuidtFrom.value).then((res)=>{
			reAuditDialogVisible.value = false
			getReplaceDetail({id:route.query.id}).then((res)=>{
				info.value = res
			})
		})
	}, 500)

	const submitBuChong = debounce(() => {
		for(const row of info.value.replace_item){
			if(!row.new_sn){
				ElMessage.error('请填写新件SN')
				return
			}
		}
		if(!buchongFrom.value.zm_imgs  && info.show_it == 1){
			ElMessage.error('请上传换件证明单')
			return
		}
		if(!buchongFrom.value.wl_imgs  && info.show_it == 1){
			ElMessage.error('请上传换件物流单')
			return
		}
		orderFill({...buchongFrom.value,item_data:info.value.replace_item,id:route.query.id}).then((res)=>{
			ElMessage.success('提交成功')
			getReplaceDetail({id:route.query.id}).then((res)=>{
				info.value = res
			})
		})
	}, 500)
	
	onMounted(()=>{
		getReplaceDetail({id:route.query.id}).then((res)=>{
			info.value = res
			buchongFrom.value.wl_imgs = res.wl_imgs
			buchongFrom.value.zm_imgs = res.zm_imgs
			buchongFrom.value.item_data = res.replace_item
		})
	})
</script>

<style scoped lang="scss">
	.uw-clothesdetail {
		background: transparent;
		padding: 12px;
		width: 100%;
		min-height: calc(100vh - 91px - 32px);
		position: relative;

		.back {
			width: 24px;
			height: 24px;
			cursor: pointer;
			flex-shrink: 0;
		}

		.page-title-wrap {
			display: inline-flex;
			align-items: center;
			gap: 10px;
			margin-bottom: 18px;
		}

		.page-title {
			padding-left: 18px;
			font-size: 24px;
			font-weight: 700;
			line-height: 1.3;
			color: #1f2d3d;
			position: relative;

			&::before {
				content: '';
				position: absolute;
				left: 0;
				top: 5px;
				width: 4px;
				height: 22px;
				border-radius: 999px;
				background: var(--el-color-primary);
			}
		}

		.page-card {
			background: #ffffff;
			border-radius: 14px;
			box-shadow: 0 4px 18px rgba(24, 44, 73, 0.08);
		}

		.summary-card {
			padding: 22px 18px;
			display: flex;
			justify-content: space-between;
			align-items: center;
			gap: 18px;
		}

		.summary-grid {
			flex: 1;
			display: grid;
			grid-template-columns: repeat(6, minmax(0, 1fr));
			gap: 16px 24px;
		}

		.summary-item {
			display: flex;
			flex-direction: column;
			gap: 6px;
		}

		.summary-item-wide {
			grid-column: span 2;
		}

		.summary-label,
		.info-label {
			font-size: 12px;
			line-height: 18px;
			color: #8b98ab;
		}

		.summary-value,
		.info-value {
			font-size: 15px;
			line-height: 24px;
			font-weight: 500;
			color: #1f2d3d;
			word-break: break-all;
		}

		.summary-link {
			color: var(--el-color-primary);
		}

		.summary-remark {
			cursor: pointer;
		}

		.summary-actions {
			display: flex;
			gap: 12px;
			flex-wrap: wrap;
		}

		.status-tag {
			display: inline-flex;
			align-items: center;
			gap: 6px;
			padding: 2px 10px;
			border-radius: 12px;
			font-size: 12px;
			line-height: 20px;
			background: #f4f6fa;
			color: #8b98ab;

			&::before {
				content: '';
				width: 6px;
				height: 6px;
				border-radius: 50%;
				background: currentColor;
			}
		}

		.status-2 {
			background: #ebf9ec;
			color: #46a85f;
		}

		.status-3 {
			background: #fff1ef;
			color: #e05b49;
		}

		.status-4 {
			background: var(--el-color-primary-light-9);
			color: var(--el-color-primary);
		}

		.section-card {
			overflow: hidden;
		}

		.section-title {
			display: flex;
			align-items: center;
			gap: 10px;
			padding: 16px 18px;
			border-bottom: 1px solid #edf1f6;
			font-size: 18px;
			font-weight: 700;
			color: #1f2d3d;
		}

		.section-title-between {
			justify-content: space-between;
		}

		.section-title-left {
			display: flex;
			align-items: center;
			gap: 10px;
		}

		.section-bar {
			width: 10px;
			height: 10px;
			border-radius: 3px;
			background: linear-gradient(135deg, var(--el-color-primary-light-3) 0%, var(--el-color-primary) 100%);
			box-shadow: 0 0 0 3px var(--el-color-primary-light-9);
		}

		.section-count {
			font-size: 13px;
			font-weight: 400;
			color: #8b98ab;
		}

		.section-body {
			padding: 22px 18px;
		}

		.info-grid {
			display: grid;
			grid-template-columns: repeat(4, minmax(0, 1fr));
			gap: 18px 24px;
		}

		.receipt-grid {
			grid-template-columns: repeat(3, minmax(0, 1fr));
		}

		.info-item {
			display: flex;
			flex-direction: column;
			gap: 6px;
		}

		.info-item-wide {
			grid-column: span 2;
		}

		.info-item-accent {
			padding: 14px 16px;
			border-left: 3px solid var(--el-color-primary);
			background: #f9fbfe;
			border-radius: 8px;
		}

		.info-item-note {
			padding: 14px 16px;
			background: #fff8e8;
			border-radius: 8px;
		}

		.level-tag {
			display: inline-block;
			padding: 2px 10px;
			border-radius: 6px;
			background: var(--el-color-primary-light-9);
			color: var(--el-color-primary);
			font-size: 12px;
			line-height: 20px;
		}

		.card-table {
			margin: 18px;
			width: calc(100% - 36px);
		}

		:deep(.el-table) {
			--el-table-border-color: #edf1f6;
		}

		:deep(.el-table th.el-table__cell) {
			background: #f8fafc;
			color: #1f2d3d;
			font-weight: 600;
		}

		:deep(.el-table td.el-table__cell) {
			padding: 14px 0;
		}

		@media (max-width: 1200px) {
			.summary-grid {
				grid-template-columns: repeat(4, minmax(0, 1fr));
			}

			.receipt-grid,
			.info-grid {
				grid-template-columns: repeat(2, minmax(0, 1fr));
			}
		}

		@media (max-width: 768px) {
			.page-title {
				font-size: 20px;
			}

			.summary-card {
				flex-direction: column;
				align-items: flex-start;
			}

			.summary-grid,
			.receipt-grid,
			.info-grid {
				grid-template-columns: 1fr;
			}

			.summary-item-wide,
			.info-item-wide {
				grid-column: span 1;
			}

			.section-title-between {
				flex-direction: column;
				align-items: flex-start;
			}

			.card-table {
				margin: 12px;
				width: calc(100% - 24px);
			}
		}
	}
</style>
