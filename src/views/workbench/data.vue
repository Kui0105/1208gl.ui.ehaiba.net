<template>
	<div class="workbench-data-container">
		<!-- 筛选条件 -->
		<div class="filter-container">
			<el-form :inline="true" class="demo-form-inline">
				<el-form-item label="部门">
					<el-tree-select v-model="filterForm.dept" :data="departments" node-key="id" check-strictly clearable
						placeholder="全部部门" style="width: 192px" :props="{ label: 'name', children: 'children' }" />
				</el-form-item>
				<el-form-item label="工程师">
					<el-select style="width: 192px;" v-model="filterForm.engineer" placeholder="全部工程师">
						<el-option label="全部工程师" value=""></el-option>
						<el-option v-for="engineer in engineers" :key="engineer.id" :label="engineer.name"
							:value="engineer.id"></el-option>
					</el-select>
				</el-form-item>
				<el-form-item label="工单类型">
					<el-select style="width: 192px;" v-model="filterForm.orderType" placeholder="全部工单">
						<el-option label="全部工单" value=""></el-option>
						<el-option v-for="types in orderTypes" :key="types.type" :label="types.name" :value="types.type"></el-option>
					</el-select>
				</el-form-item>
				<el-form-item label="时间段">
					<el-date-picker v-model="filterForm.dateRange" type="daterange" range-separator="至"
						start-placeholder="开始时间" end-placeholder="结束时间" />
				</el-form-item>
				<el-form-item>
					<el-button type="primary" @click="handleSearch" :loading="loading.search">查询</el-button>
					<el-button @click="handleReset">重置</el-button>
				</el-form-item>
			</el-form>
		</div>

		<!-- 响应时间指标 -->
		<div class="metrics-container">
			<div class="metric-item metric-item--accept">
				<div class="metric-head">
					<span class="metric-dot"></span>
					<span class="metric-label">接单响应时间</span>
					<el-tooltip effect="dark" placement="top" content="接单响应时间 = 工程师接单时间 − 工单派发时间，反映工程师从收到派单到确认接单的平均耗时。">
						<el-icon class="metric-tip"><QuestionFilled /></el-icon>
					</el-tooltip>
				</div>
				<div class="metric-value">{{ responseTimes.receive || 0 }}<span class="metric-unit">分钟</span></div>
			</div>
			<div class="metric-item metric-item--depart">
				<div class="metric-head">
					<span class="metric-dot"></span>
					<span class="metric-label">出发响应时间</span>
					<el-tooltip effect="dark" placement="top" content="出发响应时间 = 工程师出发时间 − 工程师接单时间，反映工程师从接单到启程前往现场的平均耗时。">
						<el-icon class="metric-tip"><QuestionFilled /></el-icon>
					</el-tooltip>
				</div>
				<div class="metric-value">{{ responseTimes.depart || 0 }}<span class="metric-unit">分钟</span></div>
			</div>
			<div class="metric-item metric-item--arrive">
				<div class="metric-head">
					<span class="metric-dot"></span>
					<span class="metric-label">到达响应时间</span>
					<el-tooltip effect="dark" placement="top" content="到达响应时间 = 工程师到达现场时间 − 工程师出发时间，反映工程师从出发到抵达设备现场的平均耗时。">
						<el-icon class="metric-tip"><QuestionFilled /></el-icon>
					</el-tooltip>
				</div>
				<div class="metric-value">{{ responseTimes.arrive || 0 }}<span class="metric-unit">分钟</span></div>
			</div>
			<div class="metric-item metric-item--complete">
				<div class="metric-head">
					<span class="metric-dot"></span>
					<span class="metric-label">完成响应时间</span>
					<el-tooltip effect="dark" placement="top" content="完成响应时间 = 工单完成时间 − 工程师到达现场时间，反映工程师从抵达现场到完成维修的平均耗时。">
						<el-icon class="metric-tip"><QuestionFilled /></el-icon>
					</el-tooltip>
				</div>
				<div class="metric-value">{{ responseTimes.complete || 0 }}<span class="metric-unit">分钟</span></div>
			</div>
		</div>

		<!-- 主要内容区域 -->
		<div class="main-content">
			<!-- 左侧内容 -->
			<div class="left-content">
				<!-- 一次性修复率 -->
				<div class="fix-rate-container">
					<div class="fix-rate-title">一次性修复率</div>
					<div class="fix-rate-chart">
						<div class="chart-circle" :style="fixRateCircleStyle">
							<div class="circle-inner">
								<div class="circle-percent">{{ fixRate.rate || 0 }}%</div>
							</div>
						</div>
						<div class="fix-rate-stats">
							<div class="stat-item">
								<div class="stat-value">{{ fixRate.fixed || 0 }}</div>
								<div class="stat-label">一次修复</div>
							</div>
							<div class="stat-item">
								<div class="stat-value">{{ fixRate.total || 0 }}</div>
								<div class="stat-label">总工单</div>
							</div>
						</div>
					</div>
				</div>

				<!-- 响应时间趋势 -->
				<div class="trend-container">
					<div class="trend-title">响应时间趋势 (最近7天)</div>
					<div class="trend-chart">
						<ResponseTrendChart :loading="loading.trend" :trend-data="trendData" />
					</div>
				</div>
			</div>

			<!-- 中间地图 -->
			<EngineerPositionMap :positions="engineerPositions" :map-key="txMapKey" />

		</div>

		<!-- 操作工程师列表（整行铺开，置于页面底部） -->
		<div class="engineer-section">
			<div class="section-head">
				<div class="engineer-list-title">操作工程师</div>
				<span class="engineer-count">共 {{ engineerPagination.total }} 人</span>
			</div>
			<el-skeleton :loading="loading.engineer" animated :count="1">
				<template #template>
					<div class="engineer-grid">
						<div class="skeleton-engineer-item" v-for="n in 8" :key="n">
							<div class="skeleton-name"></div>
							<div class="skeleton-phone"></div>
							<div class="skeleton-status"></div>
						</div>
					</div>
				</template>
				<template #default>
					<div class="engineer-grid" v-if="engineerList.length">
						<div class="engineer-card" v-for="engineer in engineerList" :key="engineer.id" @click="openEngineerDetail(engineer)">
							<div class="engineer-avatar" :class="'avatar-' + engineer.status">{{ (engineer.name || '工').slice(-1) }}</div>
							<div class="engineer-info">
								<div class="engineer-name">{{ engineer.name }}</div>
								<div class="engineer-phone">{{ engineer.phone }}</div>
							</div>
							<div class="engineer-status" :class="'status-' + engineer.status">
								<span class="status-dot" :class="'status-dot-' + engineer.status"></span>{{ engineer.statusText }}
							</div>
						</div>
					</div>
					<el-empty v-else description="暂无相关工程师" :image-size="90" />
				</template>
			</el-skeleton>
			<div class="engineer-pagination" v-if="engineerPagination.total > 0">
				<el-pagination v-model:current-page="engineerPagination.page_no"
					:page-size="engineerPagination.page_size" :total="engineerPagination.total"
					layout="prev, pager, next" @current-change="handleEngineerPageChange" small />
			</div>
		</div>
		<el-dialog v-model="engineerDetailVisible" title="操作工程师详情" width="min(1100px, 92vw)" destroy-on-close>
			<div v-loading="loading.engineerDetail" class="engineer-detail">
				<el-descriptions :column="4" border>
					<el-descriptions-item label="姓名">{{ engineerDetail.name || '-' }}</el-descriptions-item>
					<el-descriptions-item label="电话">{{ engineerDetail.mobile || '-' }}</el-descriptions-item>
					<el-descriptions-item label="工程师类型">{{ engineerDetail.type_str || '-' }}</el-descriptions-item>
					<el-descriptions-item label="技能等级">{{ engineerDetail.level_str || '-' }}</el-descriptions-item>
					<el-descriptions-item label="当前状态">
						<el-tag :type="engineerDetail.status === 2 ? 'danger' : 'success'" effect="light">
							{{ engineerDetail.status_text || '-' }}
						</el-tag>
					</el-descriptions-item>
				</el-descriptions>
				<div class="engineer-detail__section-title">已接单项目</div>
				<el-table :data="engineerProjects" empty-text="暂无已接单项目" max-height="420">
					<el-table-column prop="machine_code" label="设备编号" min-width="150" show-overflow-tooltip />
					<el-table-column prop="machine_model" label="设备型号" min-width="150" show-overflow-tooltip />
					<el-table-column prop="service_address" label="服务地址" min-width="220" show-overflow-tooltip />
					<el-table-column prop="entry_time" label="进场时间" min-width="170" />
				</el-table>
			</div>
		</el-dialog>
	</div>
</template>

<script setup lang="ts">
	import { computed, ref, onMounted } from 'vue'
	import { getWorkbenchDataSelect, getEngineerLists, getWorkbenchEngineerDetail, getWorkbenchDataIndex, getWorkbenchResponseTime } from '@/api/app'
	import { allRegion } from '@/api/perms/role'
	import EngineerPositionMap from './components/EngineerPositionMap.vue'
	import ResponseTrendChart from './components/ResponseTrendChart.vue'

	// 加载状态
	const loading = ref({
		search: false,
		trend: false,
		engineer: false,
		engineerDetail: false,
		overview: false
	})

	// 筛选表单
	const filterForm = ref({
		region: '',
		area: [],
		engineer: '',
		dept: '',
		orderType: '',
		dateRange: []
	})

	// 省市区联动选项
	const areaOptions = ref([])
	const departments = ref<any[]>([])

	// 工程师列表
	const engineers = ref([])

	// 工单类型列表
	const orderTypes = ref([])

	// 响应时间数据
	const responseTimes = ref({
		receive: 0,
		depart: 0,
		arrive: 0,
		complete: 0
	})

	// 一次性修复率数据
	const fixRate = ref({
		rate: 0,
		fixed: 0,
		total: 0
	})

	const fixRateCircleStyle = computed(() => {
		const rate = Math.min(100, Math.max(0, Number(fixRate.value.rate) || 0))
		return {
			background: `conic-gradient(#2563eb ${rate}%, #eef2f8 ${rate}%)`
		}
	})

	// 工程师列表数据
	const engineerList = ref([])
	const engineerDetailVisible = ref(false)
	const engineerDetail = ref<any>({})
	const engineerProjects = ref<any[]>([])

	// 工程师分页数据
	const engineerPagination = ref({
		page_no: 1,
		page_size: 13,
		total: 0
	})

	// 工程师位置数据
	const engineerPositions = ref<any[]>([])

	// 腾讯地图API密钥
	const txMapKey = ref<string>('')

	// 响应时间趋势
	const trendData = ref({
		dates: [],
		accept_times: [],
		dispatch_times: [],
		arrive_times: [],
		complete_times: []
	})

	// 格式化日期为 YYYY-MM-DD
	const formatDate = (date : Date) => {
		const year = date.getFullYear()
		const month = String(date.getMonth() + 1).padStart(2, '0')
		const day = String(date.getDate()).padStart(2, '0')
		return `${year}-${month}-${day}`
	}

	// 获取省市区数据
	const fetchRegionData = async () => {
		try {
			console.log('开始获取省市区数据...')
			const data = await allRegion()
			console.log('省市区数据:', data)
			console.log('省市区数据长度:', data.length)
			areaOptions.value = data || []
		} catch (error) {
			console.error('获取省市区数据失败:', error)
			// 清空数据
			areaOptions.value = []
		}
	}

	// 更新工程师列表
	const updateEngineerList = async () => {
		try {
			loading.value.engineer = true
			console.log('开始获取工程师列表...')
			const params : any = {
				type: 4,
				page_no: engineerPagination.value.page_no,
				page_size: engineerPagination.value.page_size
			}

			// 处理省市区筛选
			if (filterForm.value.area && filterForm.value.area.length > 0) {
				if (filterForm.value.area.length >= 1) {
					params.province_id = filterForm.value.area[0]
				}
				if (filterForm.value.area.length >= 2) {
					params.city_id = filterForm.value.area[1]
				}
				if (filterForm.value.area.length >= 3) {
					params.area_id = filterForm.value.area[2]
				}
			}

			const data = await getEngineerLists(params)
			console.log('工程师列表接口返回数据:', data)

			if (data && data.lists) {
				engineerList.value = data.lists.map((engineer : any) => ({
					id: engineer.id,
					name: engineer.name,
					phone: engineer.mobile,
					status: engineer.status, // 1为空闲，2为忙碌
					statusText: engineer.status === 1 ? '空闲' : '忙碌'
				}))
				engineerPagination.value.total = data.count || data.total || 0
				console.log('工程师列表数据:', engineerList.value)
				console.log('工程师总数:', engineerPagination.value.total)
			} else {
				engineerList.value = []
				engineerPagination.value.total = 0
				console.log('工程师列表数据为空')
			}
		} catch (error) {
			console.error('获取工程师列表失败:', error)
			engineerList.value = []
			engineerPagination.value.total = 0
		} finally {
			loading.value.engineer = false
		}
	}

	// 工程师列表分页切换
	const handleEngineerPageChange = (page : number) => {
		engineerPagination.value.page_no = page
		updateEngineerList()
	}

	const openEngineerDetail = async (engineer: any) => {
		engineerDetailVisible.value = true
		engineerDetail.value = {}
		engineerProjects.value = []
		loading.value.engineerDetail = true
		try {
			const data = await getWorkbenchEngineerDetail({ engineer_id: engineer.id })
			engineerDetail.value = data?.engineer || {}
			engineerProjects.value = data?.projects || []
		} finally {
			loading.value.engineerDetail = false
		}
	}

	// 获取下拉数据
	const fetchSelectData = async () => {
		try {
			console.log('开始获取下拉数据...')
			const data = await getWorkbenchDataSelect()
			departments.value = (data.dept_all || []).flatMap((department: any) => department.children || [])
			console.log('下拉数据:', data)
			console.log('工程师数据:', data.engineer_all)
			console.log('工单类型数据:', data.type_all)

			// 检查并调整工程师数据结构
			const engineerData = data.engineer_all || []
			console.log('原始工程师数据示例:', engineerData && engineerData[0] ? engineerData[0] : null)

			// 检查是否已经是 {label, value} 格式
			if (engineerData.length > 0 && engineerData[0].hasOwnProperty('label') && engineerData[0].hasOwnProperty('value')) {
				// 如果是 {label, value} 格式，则直接使用
				engineers.value = engineerData.map(item => ({
					id: item.value,
					name: item.label,
					phone: item.phone || item.mobile
				}))
			} else {
				// 否则按原有逻辑处理
				engineers.value = engineerData.map(item => ({
					id: item.id || item.engineer_id || item.uid, // 尝试多个可能的ID字段
					name: item.name || item.realname || item.nickname, // 尝试多个可能的名称字段
					phone: item.phone || item.mobile, // 尝试多个可能的手机号字段
					status: item.status
				})).filter(item => item.id && item.name) // 过滤掉缺少必要属性的项
			}

			// 检查并调整工单类型数据结构
			const orderTypeData = data.type_all || []
			console.log('原始工单类型数据示例:', orderTypeData && orderTypeData[0] ? orderTypeData[0] : null)

			// 检查是否已经是 {label, value} 格式
			if (orderTypeData.length > 0 && orderTypeData[0].hasOwnProperty('label') && orderTypeData[0].hasOwnProperty('value')) {
				// 如果是 {label, value} 格式，则直接使用
				orderTypes.value = orderTypeData.map(item => ({
					type: item.value,
					name: item.label
				}))
			} else {
				// 否则按原有逻辑处理
				orderTypes.value = orderTypeData.map(item => ({
					type: item.type || item.value || item.id, // 尝试多个可能的类型字段
					name: item.name || item.desc || item.title // 尝试多个可能的名称字段
				})).filter(item => item.type && item.name) // 过滤掉缺少必要属性的项
			}

			console.log('工程师下拉框数据长度:', engineers.value.length)
			console.log('工单类型下拉框数据长度:', orderTypes.value.length)

			// 处理工程师位置数据
			const positionData = data.engineer_position_all || []
			console.log('工程师位置数据:', positionData)

			// 过滤掉没有经纬度的工程师
			const validPositions = positionData.filter(item => item.latitude && item.longitude)
			console.log('有效工程师位置数据:', validPositions)
			console.log('有效工程师位置数据长度:', validPositions.length)

			// 使用接口返回的原始坐标
			engineerPositions.value = validPositions
			console.log('工程师位置数据长度:', engineerPositions.value.length)

			// 获取腾讯地图API key
			if (data.tx_map_key) {
				txMapKey.value = data.tx_map_key
				console.log('获取到腾讯地图API key:', txMapKey.value)
			} else if (data.engineer_position_all && data.engineer_position_all.length > 0 && data.engineer_position_all[0].tx_map_key) {
				// 从工程师位置数据中获取API key
				txMapKey.value = data.engineer_position_all[0].tx_map_key
				console.log('从工程师位置数据中获取到腾讯地图API key:', txMapKey.value)
			}
		} catch (error) {
			console.error('获取下拉数据失败:', error)
			// 清空数据
			engineers.value = []
			orderTypes.value = []
			engineerPositions.value = []
		} finally {
			// 更新工程师列表
			updateEngineerList()
		}
	}




	// 获取数据概览
	const fetchDataOverview = async () => {
		try {
			loading.value.overview = true
			const data = await getWorkbenchDataIndex({})
			console.log('数据概览:', data)

			// 更新响应时间数据
			responseTimes.value = {
				receive: data.accept_time || 0,
				depart: data.dispatch_time || 0,
				arrive: data.arrive_time || 0,
				complete: data.complete_time || 0
			}

			// 更新一次性修复率数据
			fixRate.value = {
				rate: data.one_finish_repair_order_rate ? parseFloat(data.one_finish_repair_order_rate) : 0,
				fixed: data.one_finish_repair_order_num || 0,
				total: data.finish_repair_order_num || 0
			}
		} catch (error) {
			console.error('获取数据概览失败:', error)
		} finally {
			loading.value.overview = false
		}
	}

	// 获取筛选后的数据
	const fetchFilteredData = async () => {
		try {
			loading.value.search = true
			const params : any = {}
			if (filterForm.value.dept) params.dept_id = filterForm.value.dept

			// 处理省市区筛选
			if (filterForm.value.area && filterForm.value.area.length > 0) {
				if (filterForm.value.area.length >= 1) {
					params.province_id = filterForm.value.area[0]
				}
				if (filterForm.value.area.length >= 2) {
					params.city_id = filterForm.value.area[1]
				}
				if (filterForm.value.area.length >= 3) {
					params.area_id = filterForm.value.area[2]
				}
			}

			// 处理工程师筛选
			if (filterForm.value.engineer) {
				params.engineer_id = filterForm.value.engineer
			}

			// 处理工单类型筛选
			if (filterForm.value.orderType) {
				params.type = filterForm.value.orderType
			}

			// 处理时间筛选
			if (filterForm.value.dateRange && filterForm.value.dateRange.length === 2) {
				// 格式化日期为 YYYY-MM-DD 格式
				const formatDate = (date : Date) => {
					const year = date.getFullYear()
					const month = String(date.getMonth() + 1).padStart(2, '0')
					const day = String(date.getDate()).padStart(2, '0')
					return `${year}-${month}-${day}`
				}

				params.create_time = [
					formatDate(new Date(filterForm.value.dateRange[0])),
					formatDate(new Date(filterForm.value.dateRange[1]))
				]
			}

			console.log('筛选参数:', params)
			const data = await getWorkbenchDataIndex(params)
			console.log('筛选后的数据:', data)

			// 更新响应时间数据
			responseTimes.value = {
				receive: data.accept_time || 0,
				depart: data.dispatch_time || 0,
				arrive: data.arrive_time || 0,
				complete: data.complete_time || 0
			}

			// 更新一次性修复率数据
			fixRate.value = {
				rate: data.one_finish_repair_order_rate ? parseFloat(data.one_finish_repair_order_rate) : 0,
				fixed: data.one_finish_repair_order_num || 0,
				total: data.finish_repair_order_num || 0
			}

			// 重新获取趋势数据
			await fetchTrendData()
		} catch (error) {
			console.error('获取筛选数据失败:', error)
		} finally {
			loading.value.search = false
		}
	}

	// 获取响应时间趋势
	const fetchTrendData = async () => {
		try {
			loading.value.trend = true
			const params : any = {}
			if (filterForm.value.dept) params.dept_id = filterForm.value.dept

			// 处理省市区筛选
			if (filterForm.value.area && filterForm.value.area.length > 0) {
				if (filterForm.value.area.length >= 1) {
					params.province_id = filterForm.value.area[0]
				}
				if (filterForm.value.area.length >= 2) {
					params.city_id = filterForm.value.area[1]
				}
				if (filterForm.value.area.length >= 3) {
					params.area_id = filterForm.value.area[2]
				}
			}

			// 处理工程师筛选
			if (filterForm.value.engineer) {
				params.engineer_id = filterForm.value.engineer
			}

			// 处理工单类型筛选
			if (filterForm.value.orderType) {
				params.type = filterForm.value.orderType
			}

			console.log('趋势数据参数:', params)
			const data = await getWorkbenchResponseTime(params)
			console.log('响应时间趋势数据:', data)

			// 处理返回的数据
			trendData.value = {
				dates: data.dates || [],
				accept_times: data.accept_times || [],
				dispatch_times: data.dispatch_times || [],
				arrive_times: data.arrive_times || [],
				complete_times: data.complete_times || []
			}

			console.log('处理后的趋势数据:', trendData.value)

		} catch (error) {
			console.error('获取响应时间趋势失败:', error)
			trendData.value = {
				dates: [],
				accept_times: [],
				dispatch_times: [],
				arrive_times: [],
				complete_times: []
			}
		} finally {
			loading.value.trend = false
		}
	}

	// 组件挂载时获取数据
	onMounted(async () => {
		// 先获取数据
		await fetchSelectData()
		await fetchRegionData()
		await fetchDataOverview()
		await fetchTrendData()
	})

	// 查询按钮点击事件
	const handleSearch = () => {
		console.log('查询条件:', filterForm.value)
		// 调用筛选数据接口
		fetchFilteredData()
	}

	// 重置按钮点击事件
	const handleReset = () => {
		filterForm.value = {
			region: '',
			area: [],
			engineer: '',
			dept: '',
			orderType: '',
			dateRange: []
		}
		// 重置后重新获取默认数据
		fetchDataOverview()
		fetchTrendData()
	}
</script>

<style scoped>
	.workbench-data-container {
		/* padding: 20px; */
		/* background-color: #f5f7fa; */
		min-height: 100vh;
	}

	.filter-container {
		background-color: #fff;
		padding: 20px;
		border-radius: 8px;
		margin-bottom: 20px;
		box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);

	}

	.metrics-container {
		display: flex;
		gap: 20px;
		margin-bottom: 20px;
	}

	.metric-item {
		flex: 1;
		background-color: #fff;
		padding: 20px;
		border-radius: 8px;
		text-align: center;
		box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
	}

	.metric-value {
		font-size: 24px;
		font-weight: bold;
		color: #1890ff;
		margin-bottom: 8px;
	}

	.metric-label {
		font-size: 14px;
		color: #666;
	}

	.main-content {
		display: flex;
		flex-wrap: wrap;
		gap: 20px;
		align-items: stretch;
	}

	.left-content {
		flex: 1;
		min-width: 300px;
		display: flex;
		flex-direction: column;
		gap: 20px;
	}

	.fix-rate-container {
		background-color: #fff;
		padding: 20px;
		border-radius: 8px;
		box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
	}

	.fix-rate-title {
		font-size: 16px;
		font-weight: bold;
		margin-bottom: 20px;
	}

	.fix-rate-chart {
		display: flex;
		align-items: center;
		gap: 40px;
	}

	.chart-circle {
		width: 120px;
		height: 120px;
		border-radius: 50%;
		background: conic-gradient(#1890ff 85%, #e8e8e8 85%);
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.circle-inner {
		width: 100px;
		height: 100px;
		border-radius: 50%;
		background-color: #fff;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.circle-percent {
		font-size: 24px;
		font-weight: bold;
		color: #1890ff;
	}

	.fix-rate-stats {
		display: flex;
		flex-direction: column;
		gap: 10px;
	}

	.stat-item {
		text-align: center;
	}

	.stat-value {
		font-size: 24px;
		font-weight: bold;
		color: #1890ff;
	}

	.stat-label {
		font-size: 14px;
		color: #666;
	}

	.trend-chart {
		margin-top: 16px;
		background-color: #fff;
		padding: 20px;
		border-radius: 8px;
		box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
		box-sizing: border-box;
		position: relative;
		overflow: visible;
	}

	.skeleton-engineer-item {
		padding: 12px;
		border-bottom: 1px solid #f0f0f0;
		display: flex;
		flex-direction: column;
		gap: 8px;
	}

	.skeleton-name {
		width: 80px;
		height: 16px;
		background-color: #f0f0f0;
		border-radius: 4px;
	}

	.skeleton-phone {
		width: 120px;
		height: 14px;
		background-color: #f0f0f0;
		border-radius: 4px;
	}

	.skeleton-status {
		width: 60px;
		height: 20px;
		background-color: #f0f0f0;
		border-radius: 10px;
		align-self: flex-start;
	}

	.trend-title {
		font-size: 16px;
		font-weight: bold;
		margin-bottom: 16px;
	}

	.trend-buttons {
		margin-bottom: 20px;
	}

	.chart-placeholder {
		position: relative;
		height: 300px;
		border-bottom: 1px solid #e8e8e8;
		border-left: 1px solid #e8e8e8;
		padding-top: 20px;
		padding-bottom: 20px;
	}

	.chart-line {
		position: absolute;
		bottom: 0;
		left: 0;
		width: 100%;
		height: 100%;
		display: flex;
		align-items: flex-end;
	}

	/* 接单响应时间线 */
	.accept-line {
		border-top: 2px solid #1890ff;
		background: linear-gradient(to top, rgba(24, 144, 255, 0.1), rgba(24, 144, 255, 0));
	}

	/* 出发响应时间线 */
	.dispatch-line {
		border-top: 2px solid #52c41a;
		background: linear-gradient(to top, rgba(82, 196, 26, 0.1), rgba(82, 196, 26, 0));
	}

	/* 到达响应时间线 */
	.arrive-line {
		border-top: 2px solid #faad14;
		background: linear-gradient(to top, rgba(250, 173, 20, 0.1), rgba(250, 173, 20, 0));
	}

	/* 完成响应时间线 */
	.complete-line {
		border-top: 2px solid #f5222d;
		background: linear-gradient(to top, rgba(245, 34, 45, 0.1), rgba(245, 34, 45, 0));
	}

	.line-points {
		position: absolute;
		width: 8px;
		height: 8px;
		border-radius: 50%;
		transform: translate(-50%, -50%);
		z-index: 10;
	}

	.line-connector {
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		z-index: 5;
	}

	.accept-line .line-points {
		background-color: #1890ff;
		border: 2px solid #1890ff;
	}

	.dispatch-line .line-points {
		background-color: #52c41a;
		border: 2px solid #52c41a;
	}

	.arrive-line .line-points {
		background-color: #faad14;
		border: 2px solid #faad14;
	}

	.complete-line .line-points {
		background-color: #f5222d;
		border: 2px solid #f5222d;
	}

	.chart-x-axis {
		position: absolute;
		bottom: -25px;
		left: 0;
		width: 100%;
		display: flex;
		justify-content: space-between;
		font-size: 12px;
		color: #999;
	}

	.chart-y-axis {
		position: absolute;
		left: -30px;
		top: 0;
		height: 100%;
		display: flex;
		flex-direction: column;
		justify-content: space-between;
		font-size: 12px;
		color: #999;
	}

	.chart-legend {
		display: flex;
		gap: 20px;
		margin-top: 20px;
		font-size: 12px;
	}

	.legend-item {
		display: flex;
		align-items: center;
		gap: 6px;
	}

	.legend-color {
		width: 12px;
		height: 12px;
		border-radius: 2px;
	}

	.right-content {
		flex: 1;
		background-color: #fff;
		padding: 20px;
		border-radius: 8px;
		box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
	}

	.engineer-list-title {
		font-size: 16px;
		font-weight: bold;
		margin-bottom: 16px;
	}

	.engineer-list {
		max-height: 590px;
		overflow-y: auto;
	}

	.engineer-pagination {
		margin-top: 16px;
		display: flex;
		justify-content: center;
	}

	.engineer-item {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 12px 0;
		border-bottom: 1px solid #f0f0f0;
		cursor: pointer;
	}

	.engineer-item:hover {
		background: #f5f7fa;
	}

	.engineer-name {
		font-weight: bold;
	}

	.engineer-phone {
		color: #666;
	}

	.engineer-status {
		padding: 4px 12px;
		border-radius: 12px;
		font-size: 12px;
	}

	.engineer-status.status-2 {
		background-color: #fff1f0;
		color: #ff4d4f;
	}

	.engineer-status.status-1 {
		background-color: #f6ffed;
		color: #52c41a;
	}

	.engineer-detail__section-title {
		margin: 20px 0 12px;
		font-size: 15px;
		font-weight: 600;
		color: #303133;
	}

	/* 响应式设计 */
	@media (max-width: 1200px) {
		.main-content {
			flex-direction: column;
		}

		.left-content,
		.right-content {
			flex: 1 1 100%;
		}

		.metrics-container {
			grid-template-columns: repeat(2, 1fr);
		}

		.map-content {
			order: -1;
		}
	}

	@media (max-width: 768px) {
		.filter-container {
			padding: 10px;
		}

		.metrics-container {
			grid-template-columns: 1fr;
		}

		.engineer-item {
			flex-direction: column;
			align-items: flex-start;
			gap: 8px;
		}

		.engineer-status {
			align-self: flex-start;
		}

		.fix-rate-chart {
			flex-direction: column;
			gap: 20px;
		}

		.chart-circle {
			width: 100px;
			height: 100px;
		}

		.circle-inner {
			width: 80px;
			height: 80px;
		}

		.circle-percent {
			font-size: 20px;
		}
	}

	/* 工作台数据页新版布局 */
	.workbench-data-container {
		--wb-surface: #ffffff;
		--wb-border: #e6ebf2;
		--wb-ink: #1e293b;
		--wb-muted: #64748b;
		--wb-faint: #94a3b8;
		--wb-primary: #2563eb;
		--wb-primary-deep: #1d4ed8;
		--wb-accept: #2563eb;
		--wb-depart: #16a34a;
		--wb-arrive: #d97706;
		--wb-complete: #dc2626;
		--wb-radius: 16px;
		--wb-shadow: 0 1px 2px rgba(15, 23, 42, 0.04), 0 12px 28px -14px rgba(15, 23, 42, 0.14);
		--wb-shadow-hover: 0 2px 6px rgba(15, 23, 42, 0.06), 0 20px 40px -18px rgba(15, 23, 42, 0.24);
		min-height: 100%;
		padding: 0;
		box-sizing: border-box;
		color: var(--wb-ink);
	}

	.filter-container,
	.metric-item,
	.fix-rate-container,
	.trend-container,
	.engineer-section {
		background-color: var(--wb-surface);
		border: 1px solid var(--wb-border);
		border-radius: var(--wb-radius);
		box-shadow: var(--wb-shadow);
	}

	.filter-container {
		padding: 18px 20px 6px;
		margin-bottom: 20px;
	}

	.demo-form-inline :deep(.el-form-item__label) {
		color: var(--wb-muted);
		font-weight: 500;
	}

	.metrics-container {
		display: grid;
		grid-template-columns: repeat(4, minmax(0, 1fr));
		gap: 18px;
		margin-bottom: 20px;
	}

	.metric-item {
		position: relative;
		padding: 20px 22px;
		overflow: hidden;
		text-align: left;
		transition: transform 0.25s ease, box-shadow 0.25s ease;
	}

	.metric-item::before {
		content: '';
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		height: 3px;
		background: var(--m-color, var(--wb-primary));
	}

	.metric-item:hover {
		transform: translateY(-3px);
		box-shadow: var(--wb-shadow-hover);
	}

	.metric-item--accept { --m-color: var(--wb-accept); }
	.metric-item--depart { --m-color: var(--wb-depart); }
	.metric-item--arrive { --m-color: var(--wb-arrive); }
	.metric-item--complete { --m-color: var(--wb-complete); }

	.metric-head {
		display: flex;
		align-items: center;
		gap: 8px;
		margin-bottom: 14px;
	}

	.metric-dot {
		width: 9px;
		height: 9px;
		border-radius: 3px;
		background: var(--m-color, var(--wb-primary));
	}

	.metric-label {
		font-size: 13px;
		color: var(--wb-muted);
		letter-spacing: 0;
	}

	.metric-tip {
		margin-left: 2px;
		font-size: 14px;
		color: var(--wb-faint);
		cursor: help;
		transition: color 0.2s ease;
	}

	.metric-tip:hover {
		color: var(--m-color, var(--wb-primary));
	}

	.metric-value {
		font-size: 34px;
		font-weight: 700;
		line-height: 1;
		color: var(--wb-ink);
		font-variant-numeric: tabular-nums;
		letter-spacing: 0;
	}

	.metric-unit {
		margin-left: 6px;
		font-size: 14px;
		font-weight: 500;
		color: var(--wb-faint);
		letter-spacing: 0;
	}

	.main-content {
		margin-bottom: 20px;
	}

	.left-content {
		min-width: 320px;
	}

	.fix-rate-container,
	.trend-container,
	.engineer-section {
		padding: 22px;
	}

	.fix-rate-title,
	.trend-title,
	.engineer-list-title {
		position: relative;
		padding-left: 12px;
		font-size: 15px;
		font-weight: 700;
		color: var(--wb-ink);
		letter-spacing: 0;
	}

	.fix-rate-title::before,
	.trend-title::before,
	.engineer-list-title::before,
	.engineer-detail__section-title::before {
		content: '';
		position: absolute;
		left: 0;
		top: 50%;
		transform: translateY(-50%);
		width: 4px;
		height: 15px;
		border-radius: 3px;
		background: linear-gradient(180deg, var(--wb-primary), var(--wb-primary-deep));
	}

	.fix-rate-title,
	.trend-title {
		margin-bottom: 20px;
	}

	.chart-circle {
		width: 132px;
		height: 132px;
		flex-shrink: 0;
		box-shadow: inset 0 0 0 1px rgba(15, 23, 42, 0.04);
	}

	.circle-inner {
		width: 104px;
		height: 104px;
		background-color: var(--wb-surface);
		box-shadow: 0 6px 16px -8px rgba(37, 99, 235, 0.4);
	}

	.circle-percent {
		font-size: 26px;
		font-weight: 700;
		color: var(--wb-primary);
		font-variant-numeric: tabular-nums;
	}

	.fix-rate-stats {
		gap: 16px;
		flex: 1;
	}

	.stat-item {
		display: flex;
		flex-direction: column;
		gap: 4px;
		padding: 14px 16px;
		background: #f6f9fe;
		border: 1px solid var(--wb-border);
		border-radius: 12px;
		text-align: left;
	}

	.stat-value {
		font-size: 26px;
		font-weight: 700;
		line-height: 1;
		color: var(--wb-ink);
		font-variant-numeric: tabular-nums;
	}

	.stat-label {
		font-size: 13px;
		color: var(--wb-muted);
	}

	.trend-container {
		flex: 1;
	}

	.trend-chart {
		margin-top: 12px;
		padding: 0;
		background: transparent;
		box-shadow: none;
	}

	.engineer-section {
		margin-bottom: 20px;
	}

	.section-head {
		display: flex;
		align-items: center;
		justify-content: space-between;
		margin-bottom: 18px;
	}

	.engineer-list-title {
		margin-bottom: 0;
	}

	.engineer-count {
		padding: 4px 12px;
		border-radius: 999px;
		background: rgba(37, 99, 235, 0.08);
		color: var(--wb-primary-deep);
		font-size: 12px;
		font-weight: 600;
	}

	.engineer-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
		gap: 14px;
	}

	.engineer-card {
		display: flex;
		align-items: center;
		gap: 12px;
		padding: 14px 16px;
		border: 1px solid var(--wb-border);
		border-radius: 14px;
		background: var(--wb-surface);
		cursor: pointer;
		transition: transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease;
	}

	.engineer-card:hover {
		transform: translateY(-2px);
		border-color: rgba(37, 99, 235, 0.35);
		box-shadow: var(--wb-shadow-hover);
	}

	.engineer-avatar {
		width: 42px;
		height: 42px;
		flex-shrink: 0;
		display: flex;
		align-items: center;
		justify-content: center;
		border-radius: 12px;
		font-size: 17px;
		font-weight: 600;
		color: #fff;
	}

	.engineer-avatar.avatar-1 {
		background: linear-gradient(135deg, #4f9bff, #2563eb);
	}

	.engineer-avatar.avatar-2 {
		background: linear-gradient(135deg, #f97362, #dc2626);
	}

	.engineer-info {
		display: flex;
		flex-direction: column;
		gap: 4px;
		min-width: 0;
		flex: 1;
	}

	.engineer-name {
		font-weight: 600;
		line-height: 1.2;
		color: var(--wb-ink);
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.engineer-phone {
		font-size: 12px;
		color: var(--wb-muted);
		font-variant-numeric: tabular-nums;
	}

	.engineer-status {
		display: inline-flex;
		align-items: center;
		gap: 6px;
		padding: 4px 12px;
		border-radius: 999px;
		font-size: 12px;
		font-weight: 600;
		white-space: nowrap;
		flex-shrink: 0;
	}

	.status-dot {
		width: 7px;
		height: 7px;
		border-radius: 50%;
	}

	.status-dot-1 {
		background-color: #16a34a;
		animation: status-pulse 1.8s ease-out infinite;
	}

	.status-dot-2 {
		background-color: #dc2626;
	}

	@keyframes status-pulse {
		0% { box-shadow: 0 0 0 0 rgba(22, 163, 74, 0.45); }
		70% { box-shadow: 0 0 0 6px rgba(22, 163, 74, 0); }
		100% { box-shadow: 0 0 0 0 rgba(22, 163, 74, 0); }
	}

	.engineer-status.status-2 {
		background-color: #fef2f2;
		color: #dc2626;
	}

	.engineer-status.status-1 {
		background-color: #ecfdf3;
		color: #16a34a;
	}

	.engineer-pagination {
		margin-top: 18px;
	}

	.skeleton-engineer-item {
		padding: 14px 16px;
		border: 1px solid var(--wb-border);
		border-radius: 14px;
	}

	.skeleton-name,
	.skeleton-phone,
	.skeleton-status {
		background-color: #eef2f7;
	}

	.engineer-detail__section-title {
		position: relative;
		margin: 22px 0 14px;
		padding-left: 12px;
		font-size: 15px;
		font-weight: 700;
		color: var(--wb-ink);
	}

	@media (max-width: 1200px) {
		.metrics-container {
			grid-template-columns: repeat(2, minmax(0, 1fr));
		}
	}

	@media (max-width: 768px) {
		.filter-container {
			padding: 14px 14px 4px;
		}

		.metrics-container,
		.engineer-grid {
			grid-template-columns: 1fr;
		}

		.engineer-card {
			min-width: 0;
		}

		.fix-rate-chart {
			flex-direction: column;
			gap: 20px;
		}

		.chart-circle {
			width: 120px;
			height: 120px;
		}

		.circle-inner {
			width: 94px;
			height: 94px;
		}

		.circle-percent {
			font-size: 22px;
		}
	}
</style>
