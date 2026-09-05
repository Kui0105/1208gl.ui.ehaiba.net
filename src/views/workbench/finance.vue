<template>
    <div class="finance-container">
        <div class="filter-section">
            <el-form :inline="true" class="filter-form"
                ><el-form-item label="部门"
                    ><el-tree-select
                        v-model="filterForm.dept"
                        :data="departments"
                        node-key="id"
                        check-strictly
                        clearable
                        placeholder="全部部门"
                        style="width: 192px"
                        :props="{ label: 'name', children: 'children' }" /></el-form-item
                ><el-form-item label="工程师"
                    ><el-select
                        v-model="filterForm.engineer"
                        clearable
                        filterable
                        placeholder="全部工程师"
                        style="width: 192px"
                        ><el-option
                            v-for="engineer in engineerOptions"
                            :key="engineer.value"
                            :label="engineer.label"
                            :value="engineer.value" /></el-select></el-form-item
                ><el-form-item v-if="activeScope === 'normal'" label="工程师类型"
                    ><el-select
                        v-model="filterForm.type"
                        clearable
                        placeholder="全部工程师类型"
                        style="width: 192px"
                        ><el-option
                            v-for="option in engineerTypeOptions"
                            :key="option.value"
                            :label="option.label"
                            :value="option.value" /></el-select></el-form-item
                ><el-form-item v-if="activeScope === 'operation'" label="服务设备类型"
                    ><el-select
                        v-model="filterForm.operationMachineTypes"
                        multiple
                        collapse-tags
                        clearable
                        placeholder="全部设备类型"
                        style="width: 230px"
                        ><el-option
                            v-for="option in operationMachineTypes"
                            :key="option.value"
                            :label="option.label"
                            :value="option.value" /></el-select></el-form-item
                ><el-form-item v-if="activeScope === 'operation'" label="是否租赁"
                    ><el-select
                        v-model="filterForm.operationIsRent"
                        clearable
                        placeholder="全部"
                        style="width: 130px"
                        ><el-option label="自有设备" :value="0" /><el-option
                            label="租赁设备"
                            :value="1" /></el-select></el-form-item
                ><el-form-item v-if="activeScope === 'operation'" label="服务项目类型"
                    ><el-select
                        v-model="filterForm.operationProjects"
                        multiple
                        collapse-tags
                        clearable
                        placeholder="全部项目"
                        style="width: 190px"
                        ><el-option
                            v-for="project in operationProjects"
                            :key="project"
                            :label="project"
                            :value="project" /></el-select></el-form-item
                ><el-form-item label="时间范围"
                    ><el-date-picker
                        v-model="filterForm.dateRange"
                        type="daterange"
                        range-separator="至"
                        start-placeholder="开始日期"
                        end-placeholder="结束日期" /></el-form-item
                ><el-form-item
                    ><el-button type="primary" @click="handleSearch">查询</el-button
                    ><el-button @click="handleReset">重置</el-button
                    ><export-data
                        :fetch-fun="getFinanceList"
                        :params="exportParams"
                        :page-size="currentPagination.page_size" /></el-form-item
            ></el-form>
        </div>
        <el-tabs v-model="activeScope" class="scope-tabs" @tab-change="handleScopeChange"
            ><el-tab-pane label="非操作工程师" name="normal" /><el-tab-pane
                label="操作工程师"
                name="operation"
        /></el-tabs>
        <div v-if="activeScope === 'normal'" class="stats-section">
            <el-row :gutter="20" class="stats-row"
                ><el-col v-for="item in inspectionCards" :key="item.key" :span="4"
                    ><el-card shadow="hover" class="stat-card"
                        ><div class="stat-title">{{ item.title }}</div>
                        <template v-if="item.key !== 'completion_rate'"
                            ><div class="stat-detail">
                                管理台数：{{ inspectionStats[item.key]?.manage_count || 0 }} 台
                            </div>
                            <div class="stat-detail">
                                点检台数：{{ inspectionStats[item.key]?.check_count || 0 }} 台
                            </div></template
                        ><template v-else
                            ><div class="stat-value">
                                {{ inspectionStats.completion_rate?.rate || 0 }}%
                            </div>
                            <div class="stat-detail">
                                完成/已派单：{{
                                    inspectionStats.completion_rate?.completed_count || 0
                                }}
                                / {{ inspectionStats.completion_rate?.dispatched_count || 0 }}
                            </div></template
                        ></el-card
                    ></el-col
                ></el-row
            ><el-row :gutter="20" class="stats-row"
                ><el-col v-for="item in workOrderCards" :key="item.key" :span="4"
                    ><el-card shadow="hover" class="stat-card"
                        ><div class="stat-title">{{ item.title }}</div>
                        <div class="stat-detail">
                            工单数量：{{ workOrderStats[item.key]?.order_count || 0 }} 单
                        </div>
                        <div v-if="item.hasHours" class="stat-detail">
                            工时合计：{{ workOrderStats[item.key]?.hour_total || 0 }} 小时
                        </div></el-card
                    ></el-col
                ></el-row
            >
        </div>
        <div class="satisfaction-section">
            <el-card shadow="hover" class="satisfaction-card"
                ><div class="satisfaction-card-head">
                    <div>
                        <div class="stat-title">
                            {{
                                activeScope === 'operation'
                                    ? '操作工单满意度平均总分'
                                    : '非操作工单满意度平均总分'
                            }}
                        </div>
                        <div class="satisfaction-count">
                            有效评价 {{ activeSatisfaction.evaluated_count || 0 }} 条
                        </div>
                    </div>
                    <div class="satisfaction-total">
                        <span class="satisfaction-total-value">{{
                            activeSatisfaction.average_total_score || 0
                        }}</span
                        ><span class="satisfaction-total-unit"
                            >/ {{ activeScope === 'operation' ? 40 : 100 }} 分</span
                        >
                    </div>
                </div>
                <div ref="satisfactionChartRef" class="satisfaction-chart"
            /></el-card>
        </div>
        <div class="satisfaction-trend-section">
            <div class="satisfaction-trend-head">
                <div class="stat-title">
                    {{
                        activeScope === 'operation' ? '操作工单满意度趋势' : '非操作工单满意度趋势'
                    }}
                </div>
                <el-radio-group v-model="satisfactionTrendPeriod" size="small"
                    ><el-radio-button label="month">月度</el-radio-button
                    ><el-radio-button label="quarter">季度</el-radio-button></el-radio-group
                >
            </div>
            <el-card shadow="hover" class="satisfaction-trend-card"
                ><div ref="trendChartRef" class="satisfaction-trend-chart"
            /></el-card>
        </div>
        <div class="table-section">
            <div class="table-note">列表中的工单数量均按复审通过工单统计。</div>
            <el-table :data="currentTableData" size="small" style="width: 100%" v-loading="loading"
                ><el-table-column
                    prop="engineer_name"
                    label="工程师姓名"
                    min-width="110"
                /><el-table-column
                    prop="engineer_level"
                    label="工程师等级"
                    min-width="90"
                /><template v-if="activeScope === 'operation'"
                    ><el-table-column
                        prop="operation_order_count"
                        label="操作工单数量"
                        min-width="110"
                    /><el-table-column
                        prop="satisfaction_average_score"
                        label="满意度平均分"
                        min-width="110"
                        ><template #default="scope">{{
                            Number(scope.row.satisfaction_average_score || 0).toFixed(2)
                        }}</template></el-table-column
                    ><el-table-column
                        v-for="item in operationWorkloads"
                        :key="item.key"
                        :prop="item.key"
                        :label="item.label"
                        min-width="95"
                        ><template #default="scope">{{
                            scope.row[item.key] ?? 0
                        }}</template></el-table-column
                    ></template
                ><template v-else
                    ><el-table-column
                        prop="managed_machine_count"
                        label="管理设备数量"
                        min-width="105"
                    /><el-table-column
                        prop="inspection_order_count"
                        label="点检"
                        min-width="65"
                    /><el-table-column
                        prop="repair_order_count"
                        label="维修"
                        min-width="65"
                    /><el-table-column
                        prop="preventive_order_count"
                        label="预防性维修"
                        min-width="105"
                    /><el-table-column
                        prop="technical_order_count"
                        label="技改"
                        min-width="65"
                    /><el-table-column
                        prop="handover_order_count"
                        label="接机"
                        min-width="65"
                    /><el-table-column
                        prop="other_order_count"
                        label="其他"
                        min-width="65"
                    /><el-table-column
                        prop="acceptance_order_count"
                        label="交验"
                        min-width="65"
                    /><el-table-column
                        prop="total_order_count"
                        label="工单总数"
                        min-width="85"
                    /><el-table-column
                        prop="satisfaction_average_score"
                        label="满意度平均分"
                        min-width="110"
                        ><template #default="scope">{{
                            Number(scope.row.satisfaction_average_score || 0).toFixed(2)
                        }}</template></el-table-column
                    ></template
                ></el-table
            >
        </div>
        <div class="pagination-section">
            <el-pagination
                @size-change="handleSizeChange"
                @current-change="handleCurrentChange"
                :current-page="currentPagination.page_no"
                :page-sizes="[10, 20, 50, 100]"
                :page-size="currentPagination.page_size"
                layout="total,sizes,prev,pager,next,jumper"
                :total="currentPagination.total"
            />
        </div>
    </div>
</template>

<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, reactive, ref, watch } from 'vue'
import * as echarts from 'echarts'
import { getWorkbenchDataSelect, getFinanceList } from '@/api/app'
import { engineerTypeAll } from '@/api/perms/role'
import ExportData from '@/components/export-data/index.vue'
type Scope = 'normal' | 'operation'
const activeScope = ref<Scope>('normal'),
    loading = ref(false),
    departments = ref<any[]>([]),
    engineerOptions = ref<Array<{ label: string; value: number }>>([]),
    engineerTypeOptions = ref<any[]>([])
const operationMachineTypes = [
        { value: 1, label: '湿喷机' },
        { value: 2, label: '立拱装药台车' },
        { value: 3, label: '直臂凿岩台车' },
        { value: 7, label: '锚杆台车' },
        { value: 9, label: '曲臂凿岩台车' },
        { value: 10, label: '矿用设备' }
    ],
    operationProjects = ['基建', '水利', '矿山']
const filterForm = reactive<any>({
    dept: '',
    engineer: '',
    type: '',
    dateRange: [],
    operationMachineTypes: [],
    operationIsRent: '',
    operationProjects: []
})
const normalTableData = ref<any[]>([]),
    operationTableData = ref<any[]>([]),
    normalPagination = reactive({ page_no: 1, page_size: 10, total: 0 }),
    operationPagination = reactive({ page_no: 1, page_size: 10, total: 0 })
const currentTableData = computed(() =>
        activeScope.value === 'operation' ? operationTableData.value : normalTableData.value
    ),
    currentPagination = computed(() =>
        activeScope.value === 'operation' ? operationPagination : normalPagination
    )
const stats = reactive<any>({
        inspection_stats: {},
        work_order_stats: {},
        satisfaction_stats: {
            normal: { evaluated_count: 0, average_total_score: 0, dimensions: [] },
            operation: { evaluated_count: 0, average_total_score: 0, dimensions: [] }
        },
        satisfaction_trend: {
            month: { labels: [], normal: [], operation: [] },
            quarter: { labels: [], normal: [], operation: [] }
        }
    }),
    inspectionStats = computed(() => stats.inspection_stats || {}),
    workOrderStats = computed(() => stats.work_order_stats || {}),
    activeSatisfaction = computed(
        () => stats.satisfaction_stats?.[activeScope.value] || { dimensions: [] }
    ),
    satisfactionTrendPeriod = ref<'month' | 'quarter'>('month')
const satisfactionChartRef = ref<HTMLElement | null>(null),
    trendChartRef = ref<HTMLElement | null>(null)
let satisfactionChart: echarts.ECharts | null = null,
    trendChart: echarts.ECharts | null = null
const satisfactionDimensionTitles: Record<string, string> = {
    product_quality_reliability: '产品质量与可靠性',
    operation_maintenance_convenience: '操作与维护便利性',
    work_efficiency: '产品使用工作效率',
    delivery_timeliness: '产品交付及时性',
    sales_policy_finance: '销售政策与金融方案',
    parts_supply_timeliness: '配件供应及时性',
    parts_cost_performance: '配件性价比',
    after_sales_timeliness: '售后服务及时性',
    after_sales_skill: '售后服务技能水平',
    repurchase_recommendation: '复购与推荐意愿',
    service_attitude: '服务态度',
    service_skill: '服务技能',
    service_quality: '服务质量',
    training_effect: '培训效果'
}
const inspectionCards = [
        { key: 'wet_spray', title: '湿喷机' },
        { key: 'rock_drill', title: '凿岩台车' },
        { key: 'arch_charge', title: '立拱装药台车' },
        { key: 'mine', title: '矿用设备' },
        { key: 'completion_rate', title: '点检完成率' }
    ],
    workOrderCards = [
        { key: 'repair', title: '维修工单', hasHours: true },
        { key: 'technical', title: '技改工单', hasHours: true },
        { key: 'handover', title: '接机工单', hasHours: false },
        { key: 'acceptance', title: '交验工单', hasHours: false },
        { key: 'other', title: '其他工单', hasHours: false },
        { key: 'preventive', title: '预防性维修工单', hasHours: false }
    ],
    operationWorkloads = [
        { key: 'operation_work_anchor_rod', label: '锚杆' },
        { key: 'operation_work_excavation_volume', label: '开挖方量' },
        { key: 'operation_work_wet_spray_volume', label: '湿喷方量' },
        { key: 'operation_work_arch_meter', label: '立拱米数' },
        { key: 'operation_work_resin_anchor_rod', label: '树脂锚杆' },
        { key: 'operation_work_pipe_joint_anchor_rod', label: '管缝锚杆' },
        { key: 'operation_work_mesh_install', label: '网片安装' },
        { key: 'operation_work_other', label: '其它' }
    ]
const formatDate = (date: any) => {
    const d = new Date(date)
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}
const exportParams = computed(() => {
    const p: any = { scope: activeScope.value }
    if (filterForm.dept) p.dept_id = filterForm.dept
    if (filterForm.engineer) p.engineer_id = filterForm.engineer
    if (filterForm.dateRange.length === 2)
        p.create_time = [formatDate(filterForm.dateRange[0]), formatDate(filterForm.dateRange[1])]
    if (activeScope.value === 'normal' && filterForm.type) p.type = filterForm.type
    if (activeScope.value === 'operation') {
        if (filterForm.operationMachineTypes.length)
            p.operation_machine_types = filterForm.operationMachineTypes
        if (filterForm.operationIsRent !== '') p.operation_is_rent = filterForm.operationIsRent
        if (filterForm.operationProjects.length)
            p.operation_use_projects = filterForm.operationProjects
    }
    return p
})
const fetchFinanceList = async () => {
    loading.value = true
    try {
        const response: any = await getFinanceList({
            ...exportParams.value,
            page_no: currentPagination.value.page_no,
            page_size: currentPagination.value.page_size
        })
        if (activeScope.value === 'operation') {
            operationTableData.value = response?.lists || []
            operationPagination.total = response?.count || 0
        } else {
            normalTableData.value = response?.lists || []
            normalPagination.total = response?.count || 0
        }
        if (response?.extend) Object.assign(stats, response.extend)
        await renderCharts()
    } finally {
        loading.value = false
    }
}
const fetchDepartments = async () => {
        try {
            const data: any = await getWorkbenchDataSelect()
            departments.value = (data?.dept_all || []).flatMap((item: any) => item.children || [])
            engineerOptions.value = (data?.engineer_all || [])
                .map((item: any) => ({
                    label: item.label || item.name || item.realname || item.nickname,
                    value: Number(item.value ?? item.id ?? item.engineer_id ?? item.uid)
                }))
                .filter((item: any) => item.label && item.value > 0)
        } catch {
            departments.value = []
        }
    },
    fetchEngineerTypes = async () => {
        try {
            const data: any[] = await engineerTypeAll({})
            engineerTypeOptions.value = (data || [])
                .map((item: any) => ({
                    label: item.label || item.name || item.desc || item.title,
                    value: item.value ?? item.type ?? item.id
                }))
                .filter((item) => item.label && Number(item.value) !== 4)
        } catch {
            engineerTypeOptions.value = []
        }
    }
const renderCharts = async () => {
    await nextTick()
    const group = activeScope.value,
        satisfaction = activeSatisfaction.value
    satisfactionChart?.dispose()
    trendChart?.dispose()
    if (satisfactionChartRef.value) {
        satisfactionChart = echarts.init(satisfactionChartRef.value)
        satisfactionChart.setOption({
            tooltip: { trigger: 'axis' },
            grid: { top: 30, right: 24, bottom: 105, left: 70 },
            xAxis: {
                type: 'category',
                data: (satisfaction.dimensions || []).map(
                    (item: any) => satisfactionDimensionTitles[item.key] || item.key
                ),
                axisLabel: { interval: 0, width: 80, overflow: 'break', lineHeight: 18 }
            },
            yAxis: {
                type: 'value',
                min: 0,
                max: 10,
                interval: 2,
                name: '平均分',
                nameLocation: 'middle',
                nameGap: 44,
                nameRotate: 0,
                nameTextStyle: { lineHeight: 18 }
            },
            series: [
                {
                    type: 'bar',
                    data: (satisfaction.dimensions || []).map((item: any) =>
                        Number(item.average_score || 0)
                    ),
                    itemStyle: { color: group === 'operation' ? '#67c23a' : '#409eff' },
                    label: { show: true, position: 'top' }
                }
            ]
        })
    }
    const trend = stats.satisfaction_trend?.[satisfactionTrendPeriod.value] || {}
    if (trendChartRef.value) {
        trendChart = echarts.init(trendChartRef.value)
        trendChart.setOption({
            tooltip: { trigger: 'axis' },
            grid: { top: 30, right: 24, bottom: 65, left: 70 },
            xAxis: { type: 'category', data: trend.labels || [], boundaryGap: false },
            yAxis: {
                type: 'value',
                min: 0,
                max: group === 'operation' ? 40 : 100,
                interval: group === 'operation' ? 10 : 20,
                name: '评价总分',
                nameLocation: 'middle',
                nameGap: 46,
                nameRotate: 0,
                nameTextStyle: { lineHeight: 18 }
            },
            series: [
                {
                    type: 'line',
                    smooth: true,
                    connectNulls: false,
                    data: trend[group] || [],
                    itemStyle: { color: group === 'operation' ? '#67c23a' : '#409eff' },
                    lineStyle: { color: group === 'operation' ? '#67c23a' : '#409eff' },
                    label: { show: true }
                }
            ]
        })
    }
}
const handleSearch = () => {
        currentPagination.value.page_no = 1
        fetchFinanceList()
    },
    handleReset = () => {
        Object.assign(filterForm, {
            dept: '',
            engineer: '',
            type: '',
            dateRange: [],
            operationMachineTypes: [],
            operationIsRent: '',
            operationProjects: []
        })
        currentPagination.value.page_no = 1
        fetchFinanceList()
    },
    handleScopeChange = () => {
        currentPagination.value.page_no = 1
        fetchFinanceList()
    },
    handleSizeChange = (size: number) => {
        currentPagination.value.page_size = size
        currentPagination.value.page_no = 1
        fetchFinanceList()
    },
    handleCurrentChange = (page: number) => {
        currentPagination.value.page_no = page
        fetchFinanceList()
    }
watch([activeScope, satisfactionTrendPeriod], renderCharts)
onMounted(() => {
    fetchDepartments()
    fetchEngineerTypes()
    fetchFinanceList()
    window.addEventListener('resize', () => {
        satisfactionChart?.resize()
        trendChart?.resize()
    })
})
onBeforeUnmount(() => {
    satisfactionChart?.dispose()
    trendChart?.dispose()
})
</script>
<style scoped>
.finance-container {
    min-height: 100vh;
}
.filter-section,
.table-section,
.pagination-section {
    background: #fff;
    padding: 20px;
    border-radius: 4px;
    margin-bottom: 20px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.08);
}
.filter-form {
    margin-bottom: -18px;
}
.scope-tabs {
    background: #fff;
    padding: 0 20px;
    margin-bottom: 20px;
}
.stats-section {
    margin-bottom: 20px;
}
.stats-row {
    margin-bottom: 20px;
}
.stat-card {
    min-height: 100px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
}
.stat-title {
    font-size: 14px;
    color: #606266;
    margin-bottom: 8px;
}
.stat-value {
    font-size: 20px;
    font-weight: 600;
    color: #303133;
}
.stat-detail {
    font-size: 13px;
    line-height: 20px;
    color: #606266;
}
.satisfaction-section,
.satisfaction-trend-section {
    margin-bottom: 20px;
}
.satisfaction-card {
    min-height: 420px;
}
.satisfaction-card-head,
.satisfaction-trend-head {
    display: flex;
    align-items: center;
    justify-content: space-between;
}
.satisfaction-count {
    font-size: 13px;
    color: #909399;
}
.satisfaction-total {
    display: flex;
    align-items: baseline;
}
.satisfaction-total-value {
    font-size: 28px;
    font-weight: 600;
    color: #303133;
}
.satisfaction-total-unit {
    margin-left: 4px;
    color: #909399;
    font-size: 13px;
}
.satisfaction-chart {
    width: 100%;
    height: 330px;
}
.satisfaction-trend-card {
    min-height: 330px;
}
.satisfaction-trend-chart {
    width: 100%;
    height: 280px;
}
.table-note {
    margin-bottom: 12px;
    color: #909399;
    font-size: 13px;
}
.pagination-section {
    display: flex;
    justify-content: flex-end;
}
</style>
