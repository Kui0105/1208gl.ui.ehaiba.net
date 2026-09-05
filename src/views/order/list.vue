<template>
	<div>
		<el-form class="uw-form" inline>
			<el-form-item label="工单编号">
				<el-input v-model="formData.order_sn" placeholder="请输入工单编号"></el-input>
			</el-form-item>
			<el-form-item label="单位名称">
				<el-input v-model="formData.company" placeholder="请输入单位名称"></el-input>
			</el-form-item>
            <el-form-item label="设备信息">
                <el-input v-model="formData.keyword" placeholder="请输入设备名称、编号"></el-input>
            </el-form-item>
			<el-form-item label="大区">
				<el-tree-select
					v-model="formData.dept_id"
					:data="deptOptions"
					:props="deptTreeProps"
					placeholder="请选择大区"
					clearable
					check-strictly
					filterable
					style="width: 220px;"
				/>
			</el-form-item>
			<el-form-item label="服务工程师">
				<el-select
					v-model="formData.engineer_id"
					placeholder="全部工程师"
					filterable
					clearable
					style="width: 260px;"
					popper-class="engineer-select-dropdown"
				>
					<el-option
						v-for="item in engineerOptions"
						:key="item.id"
						:label="getEngineerOptionLabel(item)"
						:value="item.id"
					>
						<div class="engineer-option">
							<div class="engineer-option-main">
								<span>{{ item.name }}</span>
								<span>{{ item.mobile || '-' }}</span>
							</div>
							<div class="engineer-option-sub">
								<span>类型：{{ item.type_str || '-' }}</span>
								<span>等级：{{ item.level_str || '-' }}</span>
							</div>
						</div>
					</el-option>
				</el-select>
			</el-form-item>

			<el-form-item label="工单类型">
				<el-select placeholder="请选择工单类型" style="width: 192px;" v-model="formData.type">
					<el-option label="全部" value=""></el-option>
					<el-option v-for="item in orderType" :label="item.label" :value="item.value"></el-option>
				</el-select>
			</el-form-item>
			<el-form-item label="状态类型">
				<el-select placeholder="请选择状态类型" style="width: 192px;" v-model="formData.step">
					<el-option label="全部" value=""></el-option>
					<el-option v-for="item in orderStatus" :label="item.label" :value="item.value"></el-option>
				</el-select>
			</el-form-item>
			<el-form-item label="时间筛选">
				<el-select v-model="formData.time_type" style="width: 140px;">
					<el-option
						v-for="item in timeTypeOptions"
						:key="item.value"
						:label="item.label"
						:value="item.value"
					/>
				</el-select>
				<el-date-picker v-model="formData.time_range" type="daterange" range-separator="至" start-placeholder="开始日期" end-placeholder="结束日期" value-format="YYYY-MM-DD" style="width: 300px;margin-left: 8px;" @change="currentChange(1)"></el-date-picker>
			</el-form-item>
			<el-form-item>
				<el-button type="primary" @click="currentChange(1)">查询</el-button>
				<el-button type="primary" plain @click="restData">重置</el-button>
				<export-data class="ml-2.5" :fetch-fun="getOrderLists" :params="formData" :page-size="10" />
				<export-data
					class="ml-2.5"
					:fetch-fun="getOrderLists"
					:params="{ ...formData, export_type: 'summary' }"
					:page-size="10"
					button-text="汇总导出"
					tips="导出数据为结束用车工单数据汇总，未结束用车工单不计入"
				/>
			</el-form-item>
		</el-form>
		<div class="uw-box">
			<div class="uw-box-tab">
				<el-tabs v-model="formData.status" class="demo-tabs" @tab-change="currentChange(1)">
					<el-tab-pane :label="`全部(${extend.all})`" name=""></el-tab-pane>
					<el-tab-pane :label="`待派单(${extend.wait_send})`" name="0"></el-tab-pane>
					<el-tab-pane :label="`待接单(${extend.wait_recieve})`" name="1"></el-tab-pane>
					<el-tab-pane :label="`进行中(${extend.ing})`" name="2"></el-tab-pane>
					<el-tab-pane :label="`待初审(${extend.first_audit})`" name="11"></el-tab-pane>
					<el-tab-pane :label="`待复审(${extend.re_audit})`" name="12"></el-tab-pane>
					<el-tab-pane :label="`待审核(${extend.audit})`" name="10"></el-tab-pane>
					<el-tab-pane :label="`已驳回(${extend.rejected})`" name="13"></el-tab-pane>
					<el-tab-pane :label="`已完成(${extend.finish})`" name="3"></el-tab-pane>
				</el-tabs>
				<div class="right">
					<el-button @click="openReminderConfig">催办设置</el-button>
					<el-button @click="createOrder">表单设计</el-button>
					<el-dropdown class="ml-[10px]" placement="bottom-start" @command="handleCommand">
						<el-button type="primary">创建工单</el-button>
						<template #dropdown>
							<el-dropdown-menu>
								<el-dropdown-item v-for="item in cateList" :key="item.type"
									:command="item.type">{{item.name}}</el-dropdown-item>
							</el-dropdown-menu>
						</template>
					</el-dropdown>
				</div>
			</div>
			<el-table :data="tableData">
				<el-table-column label="工单编号" width="180" show-overflow-tooltip>
					<template #default="{ row }">
						<span class="order-sn-link" @click="openWindow(row)">{{ row.order_sn }}</span>
					</template>
				</el-table-column>
				<el-table-column label="工单类型" show-overflow-tooltip>
					<template #default="{ row }">
						<el-tag :type="typeColorMap[row.type] || 'info'" effect="light">
							{{ row.type_desc }}
						</el-tag>
					</template>
				</el-table-column>
				<el-table-column label="设备名称" show-overflow-tooltip>
					<template #default="{ row }">
						{{ getMachineField(row, 'name') }}
					</template>
				</el-table-column>
                <el-table-column label="设备编号" show-overflow-tooltip>
					<template #default="{ row }">
						{{ getMachineField(row, 'code') }}
					</template>
				</el-table-column>
				<el-table-column label="单位名称" show-overflow-tooltip>
					<template #default="{ row }">
						{{ getMachineField(row, 'company_name') }}
					</template>
				</el-table-column>
				<el-table-column label="联系人" width="150">
					<template #default="{ row }">
						<div class="contact-box">
							<div class="name">{{ getMachineField(row, 'contact') }}</div>
							<div class="mobile">{{ getMachineField(row, 'mobile') }}</div>
						</div>
					</template>
				</el-table-column>
				<!-- <el-table-column prop="machine_info.contact" label="联系人"></el-table-column>
				<el-table-column prop="machine_info.mobile" label="联系电话"></el-table-column> -->

				<el-table-column prop="engineer_info.name" label="服务工程师"></el-table-column>
                <el-table-column label="公里数/核实公里数" min-width="170">
					<template #default="{ row }">
						<div class="mileage-cell">
							<span>累计：{{ formatMileageValue(row.total_m) }}</span>
							<span>核实：{{ formatMileageValue(row.audit_m) }}</span>
						</div>
					</template>
				</el-table-column>

				<!-- 工单状态 tag -->
				<el-table-column label="工单状态" width="150">
					<template #default="{ row }">
						<el-tag :type="orderStatusColorMap[row.engineer_status_desc] || 'info'" effect="dark">
							{{ row.engineer_status_desc }}
						</el-tag>
					</template>
				</el-table-column>

				<!-- 状态类型 tag -->
				<el-table-column label="状态类型" width="150">
					<template #default="{ row }">
						<el-tag :type="stepColorMap[row.step] || 'info'" effect="plain">
							{{ row.step_desc }}
						</el-tag>
					</template>
				</el-table-column>
				<el-table-column prop="create_time" label="创建时间"></el-table-column>
				<el-table-column prop="address" label="操作">
					<template #default="{row}">
						<el-button type="text" @click="openWindow(row)">详情</el-button>
						<el-button type="text" @click="removeItem(row)">删除</el-button>
					</template>
				</el-table-column>
			</el-table>
			<!-- 分页 -->
			<div style="display: flex;align-items: center;justify-content: center;margin-top: 18px;">
				<el-pagination background layout="prev, pager, next" :current-page="pageSize" :total="count" hide-on-single-page
					@current-change="currentChange" />
			</div>
		</div>
		<el-dialog v-model="reminderConfigVisible" title="工单催办设置" width="420px" destroy-on-close>
			<el-form label-width="150px">
				<el-form-item label="未接单通知管理层">
					<el-input-number v-model="reminderConfig.repair_unaccepted_manager_minutes" :min="1" :max="1440" :precision="0" />
					<span class="reminder-unit">分钟</span>
				</el-form-item>
				<el-form-item label="未接单通知管理员">
					<el-input-number v-model="reminderConfig.repair_unaccepted_admin_minutes" :min="1" :max="1440" :precision="0" />
					<span class="reminder-unit">分钟</span>
				</el-form-item>
				<el-form-item label="未出发通知管理层">
					<el-input-number v-model="reminderConfig.repair_unstarted_manager_minutes" :min="1" :max="1440" :precision="0" />
					<span class="reminder-unit">分钟</span>
				</el-form-item>
				<el-form-item label="未出发通知管理员">
					<el-input-number v-model="reminderConfig.repair_unstarted_admin_minutes" :min="1" :max="1440" :precision="0" />
					<span class="reminder-unit">分钟</span>
				</el-form-item>
				<el-form-item label="未完工通知所有人">
					<el-input-number v-model="reminderConfig.repair_unfinished_minutes" :min="1" :max="1440" :precision="0" />
					<span class="reminder-unit">分钟</span>
				</el-form-item>
			</el-form>
			<template #footer>
				<el-button @click="reminderConfigVisible = false">取消</el-button>
				<el-button type="primary" :loading="reminderConfigSaving" @click="saveReminderConfig">保存</el-button>
			</template>
		</el-dialog>
	</div>
</template>

<script setup lang="ts">
	import { ref, onMounted } from 'vue'
	import { onBeforeRouteLeave, useRouter } from 'vue-router'
	import { ElMessage, ElMessageBox } from 'element-plus'
	import { getOrderLists, getOrderSelectArr, deleteOrder, getOrderTypeAll, getEngineerLists, getOrderReminderConfig, setOrderReminderConfig } from '@/api/order/order';
	import { deptAll } from '@/api/org/department'
	const ORDER_LIST_SNAPSHOT_KEY = 'uw_order_list_snapshot'
	const typeColorMap : Record<number, any> = {
		1: 'danger',   // 维修（最重要）
		2: 'warning',  // 点检
		3: 'success',  // 预防性维护
		4: 'primary',  // 技改
		5: 'info',     // 接机
		6: '',         // 操作（默认）
		7: '',         // 拼装
		8: 'success',  // 终检
		9: 'warning',  // 守模
		10: 'info'     // 其他
	}
	const stepColorMap : Record<number, any> = {
		1: 'info',      // 创建
		2: 'warning',   // 接单
		3: 'warning',   // 出发
		4: 'primary',   // 到达
		5: 'success',   // 完成
		6: 'info',      // 用车结束
		7: 'danger',    // 派单（关键节点）
		8: 'primary',   // 进场
		9: 'info'       // 退场
	}
	const orderStatusColorMap : Record<string, any> = {
		'待派单': 'info',
		'待接单': 'warning',
		'进行中': 'primary',
		'待初审': 'warning',
		'待复审': 'warning',
		'待审核': 'warning',
		'已驳回': 'danger',
		'已完成': 'success'
	}
	const defaultExtend = {
		all: 0,
		wait_send: 0,
		wait_recieve: 0,
		ing: 0,
		first_audit: 0,
		re_audit: 0,
		audit: 0,
		rejected: 0,
		finish: 0
	}
	const normalizeExtend = (value?: Partial<typeof defaultExtend>) => ({
		...defaultExtend,
		...(value || {})
	})
	const emptyText = '-'
	const timeTypeOptions = [
		{ label: '创建时间', value: 'create_time' },
		{ label: '结束用车时间', value: 'end_car_time' },
		{ label: '复审时间', value: 're_audit_time' },
		{ label: '复审通过时间', value: 're_audit_pass_time' }
	]
	const router = useRouter()
	const count = ref(0)
	const tableData = ref<any[]>([])
	const pageSize = ref(1)
	const orderType = ref<any[]>([])
	const orderStatus = ref<any[]>([])
	const cateList = ref<any[]>([])
	const deptOptions = ref<any[]>([])
	const deptTreeProps = {
		label: 'name',
		value: 'id',
		children: 'children'
	}
	const engineerOptions = ref<
		Array<{
			id: number
			name: string
			mobile: string
			type_str: string
			level_str: string
		}>
	>([])
	const formData = ref({
		status: '',
		order_sn: '',
		company: '',
        keyword:'',
		dept_id: undefined as '' | number | undefined,
		engineer_id: undefined as '' | number | undefined,
		type: '',
		step: '',
		time_type: 'create_time',
		time_range: []
	})
	const extend = ref(normalizeExtend())
	const reminderConfigVisible = ref(false)
	const reminderConfigSaving = ref(false)
	const reminderConfig = ref({
		repair_unaccepted_manager_minutes: 15,
		repair_unaccepted_admin_minutes: 30,
		repair_unstarted_manager_minutes: 120,
		repair_unstarted_admin_minutes: 180,
		repair_unfinished_minutes: 1440
	})
	const createOrder = () => {
		// 跳转到创建工单页面
		router.push({ path: 'selectType' })

	}
	const openReminderConfig = () => {
		getOrderReminderConfig().then((res) => {
			reminderConfig.value = {
				repair_unaccepted_manager_minutes: Number(res?.repair_unaccepted_manager_minutes || 15),
				repair_unaccepted_admin_minutes: Number(res?.repair_unaccepted_admin_minutes || 30),
				repair_unstarted_manager_minutes: Number(res?.repair_unstarted_manager_minutes || 120),
				repair_unstarted_admin_minutes: Number(res?.repair_unstarted_admin_minutes || 180),
				repair_unfinished_minutes: Number(res?.repair_unfinished_minutes || 1440)
			}
			reminderConfigVisible.value = true
		})
	}
	const saveReminderConfig = () => {
		reminderConfigSaving.value = true
		setOrderReminderConfig(reminderConfig.value).then(() => {
			ElMessage.success('设置成功')
			reminderConfigVisible.value = false
		}).finally(() => {
			reminderConfigSaving.value = false
		})
	}
	const removeItem = (row : any) => {
		// 是否确认删除
		ElMessageBox.confirm('是否确定删除该条数据', '温馨提示', {
			confirmButtonText: '确定',
			cancelButtonText: '取消',
			type: 'warning',
		}).then(() => {
			deleteOrder({ order_id: row.id }).then(() => {
				ElMessage({
					type: 'success',
					message: '删除成功',
				})
				getOrderListsApi()
			})
		})
	}
	const openWindow = (row : any) => {
		router.push({
			path: '/order/detail',
			query: {
				id: row.id
			}
		})
	}
	const isOtherOrder = (row: any) => {
		return Number(row?.type) === 10
	}
	const getMachineField = (row: any, field: string) => {
		if (isOtherOrder(row)) return emptyText
		return row?.machine_info?.[field] || emptyText
	}
	const getEngineerOptionLabel = (item: {
		id: number
		name: string
		mobile: string
		type_str: string
		level_str: string
	}) => {
		return `${item.type_str || '-'} / ${item.level_str || '-'} / ${item.name} / ${item.mobile || '-'}`
	}
	const normalizeEngineerOptions = (lists: any[] = []) => {
		engineerOptions.value = lists
			.map((item) => ({
				id: Number(item.id ?? item.value ?? item.engineer_id ?? 0),
				name: item.name || item.label || item.realname || item.nickname || '',
				mobile: item.mobile || item.phone || '',
				type_str: item.type_str || item.type_desc || item.engineer_type_desc || item.engineer_type_name || '',
				level_str: item.level_str || item.level_desc || item.engineer_level_desc || item.engineer_level_name || ''
			}))
			.filter((item) => item.id > 0 && item.name)
	}
	const formatMileageValue = (value: unknown) => {
		return value === undefined || value === null || value === '' ? emptyText : String(value)
	}
	const currentChange = (page: number) => {
		pageSize.value = page
		getOrderListsApi()
	}
	const restData = () => {
		formData.value = {
			status: '',
			order_sn: '',
			company: '',
            keyword:'',
			dept_id: undefined,
			engineer_id: undefined,
			type: '',
			step: '',
			time_type: 'create_time',
			time_range: []
		}
		currentChange(1)
	}
	const getOrderListsApi = () => {
		getOrderLists({
			page_size: 10,
			page_no: pageSize.value,
			...formData.value
		}).then(res => {
			count.value = res.count
			tableData.value = res.lists
			extend.value = normalizeExtend(res.extend)
		})
	}
	const getOrderSelectArrApi = () => {
		getOrderSelectArr().then(res => {
			orderType.value = res.type_all
			orderStatus.value = res.step_all
		})
	}
	const getOrderTypeAllApi = () => {
		getOrderTypeAll().then(res => {
			cateList.value = res
		})
	}
	const getEngineerOptions = () => {
		getEngineerLists({
			page_no: 1,
			page_size: 9999
		}).then(res => {
			normalizeEngineerOptions(res?.lists || [])
		})
	}
	const saveOrderListSnapshot = () => {
		const snapshot = {
			count: count.value,
			tableData: tableData.value,
			pageSize: pageSize.value,
			orderType: orderType.value,
			orderStatus: orderStatus.value,
			cateList: cateList.value,
			deptOptions: deptOptions.value,
			engineerOptions: engineerOptions.value,
			formData: { ...formData.value },
			extend: { ...extend.value }
		}
		sessionStorage.setItem(ORDER_LIST_SNAPSHOT_KEY, JSON.stringify(snapshot))
	}
	const restoreOrderListSnapshot = () => {
		const snapshotText = sessionStorage.getItem(ORDER_LIST_SNAPSHOT_KEY)
		if (!snapshotText) return false
		try {
			const snapshot = JSON.parse(snapshotText)
			count.value = snapshot.count
			tableData.value = snapshot.tableData
			pageSize.value = snapshot.pageSize
			orderType.value = snapshot.orderType
			orderStatus.value = snapshot.orderStatus
			cateList.value = snapshot.cateList
			deptOptions.value = snapshot.deptOptions || []
			engineerOptions.value = snapshot.engineerOptions || []
			formData.value = { ...snapshot.formData }
			extend.value = normalizeExtend(snapshot.extend)
			sessionStorage.removeItem(ORDER_LIST_SNAPSHOT_KEY)
			return true
		} catch (err) {
			sessionStorage.removeItem(ORDER_LIST_SNAPSHOT_KEY)
			return false
		}
	}
	const handleCommand = (row : number) => {
		router.push({
			path: 'createOrder',
			query: {
				type: row
			}
		})
	}
	const normalizeDeptOptions = (lists: any[] = []) => {
		return lists.flatMap((item) => item?.children?.length ? item.children : [])
	}
	const getDeptOptions = () => {
		deptAll().then(res => {
			deptOptions.value = normalizeDeptOptions(res || [])
		})
	}
	onBeforeRouteLeave((to) => {
		if (to.path === '/order/detail') {
			saveOrderListSnapshot()
			return
		}
		sessionStorage.removeItem(ORDER_LIST_SNAPSHOT_KEY)
	})
	onMounted(() => {
		if (restoreOrderListSnapshot()) {
			if (!deptOptions.value.length) {
				getDeptOptions()
			}
			if (!engineerOptions.value.length) {
				getEngineerOptions()
			}
			return
		}
		getOrderTypeAllApi()
		getOrderSelectArrApi()
		getDeptOptions()
		getEngineerOptions()
		getOrderListsApi()
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

	.order-sn-link {
		color: var(--el-color-primary);
		cursor: pointer;
	}

	.order-sn-link:hover {
		text-decoration: underline;
	}

	.engineer-option {
		display: flex;
		flex-direction: column;
		gap: 4px;
		padding: 2px 0;
		line-height: 1.4;
	}

	.reminder-unit {
		margin-left: 8px;
		color: #606266;
	}

	.engineer-option-main {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 12px;
		color: #303133;
	}

	.engineer-option-sub {
		display: flex;
		flex-wrap: wrap;
		gap: 8px 16px;
		font-size: 12px;
		color: #909399;
		white-space: normal;
	}

	.mileage-cell {
		display: flex;
		flex-direction: column;
		gap: 4px;
		line-height: 1.4;
	}

	:deep(.engineer-select-dropdown .el-select-dropdown__item) {
		height: auto;
		line-height: normal;
		padding-top: 8px;
		padding-bottom: 8px;
	}
</style>

<style>
	.engineer-select-dropdown.el-select__popper {
		min-width: 520px !important;
	}

	.engineer-select-dropdown .el-select-dropdown__item {
		height: auto !important;
		line-height: normal !important;
		white-space: normal !important;
		padding-top: 8px;
		padding-bottom: 8px;
	}
</style>
