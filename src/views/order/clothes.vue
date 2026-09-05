<template>
	<div>
		<el-form class="uw-form" inline>
			<el-form-item label="申请编号">
				<el-input v-model="formData.replace_sn" placeholder="请输入申请编号"></el-input>
			</el-form-item>
			<el-form-item label="工单编号">
				<el-input v-model="formData.order_sn" placeholder="请输入工单编号"></el-input>
			</el-form-item>
			<el-form-item label="申请人">
				<el-input v-model="formData.name" placeholder="请输入申请人姓名"></el-input>
			</el-form-item>
			<!-- <el-form-item label="审核状态">
				<el-select placeholder="请选择审核状态" v-model="formData.status" style="width: 192px;">
					<el-option label="全部" value=""></el-option>
					<el-option label="待审核" value="1"></el-option>
					<el-option label="初审通过" value="2"></el-option>
					<el-option label="初审驳回" value="3"></el-option>
                    <el-option label="复审通过" value="4"></el-option>
                    <el-option label="复审驳回" value="5"></el-option>
				</el-select>
			</el-form-item> -->
			<el-form-item>
				<el-button type="primary" @click="handleClick(1)">查询</el-button>
				<el-button type="primary" plain @click="restData">重置</el-button>
				<export-data class="ml-2.5" :fetch-fun="getReplaceLists" :params="formData" :page-size="10" />
			</el-form-item>
		</el-form>
		<div class="uw-box">
			<div class="uw-box-tab">
				<el-tabs v-model="formData.status" class="demo-tabs" @tab-change="handleClick(1)">
					<el-tab-pane :label="`全部(${extendsx.all})`" name=""></el-tab-pane>
					<!-- <el-tab-pane :label="`待审核(${extendsx.wait})`" name="1"></el-tab-pane>
					<el-tab-pane :label="`审核通过(${extendsx.yes})`" name="2"></el-tab-pane>
					<el-tab-pane :label="`审核驳回(${extendsx.no})`" name="3"></el-tab-pane> -->
				</el-tabs>
				<div class="right">
					<el-button type="primary" @click="openAdd">免费换件</el-button>
				</div>
			</div>
			<el-table :data="tableData">
				<el-table-column prop="replace_sn" label="申请单号"></el-table-column>
				<el-table-column prop="engineer_name" label="申请人"></el-table-column>
				<el-table-column prop="order_sn" label="工单编号"></el-table-column>
				<el-table-column prop="machine_code" label="设备编号"></el-table-column>
				<el-table-column prop="machine_name" label="设备名称"></el-table-column>
				<el-table-column prop="remark" label="申请说明"></el-table-column>
				<!-- <el-table-column prop="status_str" label="状态">
					<template #default="{ row }">
						<el-tag :type="getStatusType(row.status)">
							{{ getStatusText(row.status) }}
						</el-tag>
					</template>
				</el-table-column> -->
				<el-table-column prop="create_time" label="申请时间"></el-table-column>
				<el-table-column prop="address" label="操作">
					<template #default="{row}">
						<el-button type="text" @click="openWindow(row)">查看</el-button>
						<!-- <el-button v-if="row.show_btn" type="text" @click="editOpen(row)">补充资料</el-button> -->
						<el-button type="text" @click="removeItem(row)">删除</el-button>
					</template>
				</el-table-column>
			</el-table>
			<!-- 分页 -->
			<div style="display: flex;align-items: center;justify-content: center;margin-top: 18px;">
				<el-pagination background layout="prev, pager, next" :total="countNum" hide-on-single-page
					@current-change="handleClick" />
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
	import { ref } from 'vue'
	import { useRouter } from 'vue-router'
	import { ElMessage, ElMessageBox } from 'element-plus'
	import { getReplaceLists, deleteReplace } from '@/api/order/order'
	const router = useRouter()
	const countNum = ref(0)
	const tableData = ref([])
	const extendsx = ref({
		all: 0,
		wait: 0,
		yes: 0,
		no: 0
	})
	const formData = ref({
		replace_sn: '',
		order_sn: '',
		status: '',
		name: ''
	})
	const pageNo = ref(1)
	const openAdd = () => {
		router.push({
			path: 'addclothes'
		})
	}

	const removeItem = (row : any) => {
		// 是否确认删除
		ElMessageBox.confirm('是否确定删除该条数据', '温馨提示', {
			confirmButtonText: '确定',
			cancelButtonText: '取消',
			type: 'warning',
		}).then(() => {
			deleteReplace({ id: row.id }).then((res) => {
				ElMessage({
					type: 'success',
					message: '删除成功',
				})
				getReplaceListsApi()
			})
		})
	}
	const handleClick = (page : any) => {
		pageNo.value = page
		getReplaceListsApi()
	}
	const restData = () => {
		formData.value = {
			replace_sn: '',
			order_sn: '',
			status: '',
			name: ''
		}
		handleClick(1)
	}
	const openWindow = (row : any) => {
		router.push({
			path: '/order/clothesdetail',
			query: {
				id: row.id
			}
		})
	}
	const editOpen = (row : any) => {
		router.push({
			path: '/order/clothesdetail',
			query: {
				id: row.id,
				edit: 1
			}
		})
	}
	const getReplaceListsApi = async () => {
		const { lists, count, extend } = await getReplaceLists({
			pageNo: pageNo.value,
			page_size: 10,
			...formData.value
		})
		tableData.value = lists
		countNum.value = count
		extendsx.value = extend
	}
	const getStatusType = (status : string | number) => {
		switch (Number(status)) {
			case 1:
				return 'warning'   // 待审核（黄）
			case 2:
				return 'success'   // 通过（绿）
			case 3:
				return 'danger'    // 驳回（红）
			default:
				return 'info'
		}
	}

	const getStatusText = (status : string | number) => {
		switch (Number(status)) {
			case 1:
				return '待审核'
			case 2:
				return '初审通过'
			case 3:
				return '审核驳回'
            case 4:
                return '审核通过'
            case 5:
                return '复审驳回'
			default:
				return '未知'
		}
	}
	onMounted(() => {
		getReplaceListsApi()
	})
</script>

<style scoped>
	::v-deep .el-tabs__header {
		border-bottom: none;
	}

	::v-deep .el-tabs__nav-wrap::after {
		height: 0 !important;
	}

	.uw-form {
		padding-left: 18px;
		padding-right: 18px;
		padding-top: 18px;
		background: #FFFFFF;
		/* box-shadow: 0px 0px 30px 0px rgba(245, 225, 228, 0.5); */
		border-radius: 16px 16px 16px 16px;
	}

	.uw-box {
		margin-top: 18px;
		background-color: #fff;
		padding: 18px;
		/* box-shadow: 0px 0px 30px 0px rgba(245, 225, 228, 0.5); */
		border-radius: 16px 16px 16px 16px;
	}

	.uw-box-tab {
		display: flex;
		align-items: center;
		justify-content: space-between;
	}
</style>
