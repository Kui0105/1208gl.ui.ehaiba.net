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
            <!-- 点检统计：环形完成率仪表 + 完成率主视觉 -->
            <div class="section-title">点检统计</div>
            <div class="inspect-grid">
                <div
                    v-for="row in inspectionRings"
                    :key="row.key"
                    class="ring-card"
                    :class="{ 'ring-card--warn': row.tone === 'warn' }"
                >
                    <div
                        class="gauge"
                        :class="'gauge--' + row.tone"
                        :style="{ '--val': row.rate }"
                    >
                        <div class="ring-hole">
                            <span class="ring-pct">{{ row.rate }}<i>%</i></span>
                            <span class="ring-cap">点检率</span>
                        </div>
                    </div>
                    <div class="ring-name">{{ row.title }}</div>
                    <div class="ring-meta">
                        <span>管理 {{ row.manage }}</span
                        ><span class="ring-sep" /><span>点检 {{ row.check }}</span>
                    </div>
                    <span class="ring-tag" :class="'tag--' + row.tone">{{ row.status }}</span>
                </div>
                <div class="ring-card ring-card--hero">
                    <div class="hero-cap">点检完成率</div>
                    <div class="hero-val">
                        {{ inspectionOverall.rate }}<span class="hero-unit">%</span>
                    </div>
                    <div class="hero-track">
                        <div class="hero-fill" :style="{ width: inspectionOverall.rate + '%' }" />
                    </div>
                    <div class="hero-detail">
                        完成 / 已派单
                        <b>{{ inspectionOverall.completed }} / {{ inspectionOverall.dispatched }}</b>
                    </div>
                </div>
            </div>
            <!-- 工单统计：按数量排序的横向条形排行榜 -->
            <div class="section-head">
                <div class="section-title">工单统计</div>
                <div class="section-meta">共 {{ orderRanking.total }} 单 · 按数量排序</div>
            </div>
            <div class="rank-list">
                <div v-for="row in orderRanking.rows" :key="row.key" class="rank-item">
                    <span class="rank-no" :class="{ 'rank-no--top': row.rank < 3 }">{{
                        row.rank + 1
                    }}</span>
                    <div class="rank-body">
                        <div class="rank-head">
                            <span class="rank-name">{{ row.title }}</span>
                            <span class="rank-metric"
                                ><b>{{ row.count }}</b> 单<template v-if="row.hasHours">
                                    · {{ row.hours }} h</template
                                >
                                · {{ row.pct }}%</span
                            >
                        </div>
                        <div class="rank-track">
                            <div
                                class="rank-fill"
                                :class="{ 'rank-fill--top': row.rank < 3 }"
                                :style="{ width: row.width + '%' }"
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <div class="charts-row">
            <div class="satisfaction-section">
                <el-card shadow="hover" class="satisfaction-card"
                    ><div class="satisfaction-card-head">
                        <div>
                            <div class="card-title">
                                {{
                                    activeScope === 'operation'
                                        ? '操作工单满意度平均总分'
                                        : '工单满意度平均总分'
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
                <el-card shadow="hover" class="satisfaction-trend-card"
                    ><div class="satisfaction-trend-head">
                        <div class="card-title">
                            {{
                                activeScope === 'operation'
                                    ? '操作工单满意度趋势'
                                    : '工单满意度趋势'
                            }}
                        </div>
                        <el-radio-group v-model="satisfactionTrendPeriod" size="small"
                            ><el-radio-button label="month">月度</el-radio-button
                            ><el-radio-button label="quarter">季度</el-radio-button></el-radio-group
                        >
                    </div>
                    <div ref="trendChartRef" class="satisfaction-trend-chart"
                /></el-card>
            </div>
        </div>
        <div class="table-section">
            <div class="table-head">
                <div class="section-title">工程师工作量明细</div>
                <div class="table-note">列表中的工单数量均按复审通过工单统计。</div>
            </div>
            <el-table
                :data="currentTableData"
                size="large"
                stripe
                style="width: 100%"
                :header-cell-style="{ background: '#f6f9fe' }"
                v-loading="loading"
                ><el-table-column prop="engineer_name" label="工程师姓名" min-width="150" fixed
                    ><template #default="scope"
                        ><div class="cell-engineer">
                            <span class="cell-avatar">{{
                                (scope.row.engineer_name || '工').slice(-1)
                            }}</span
                            ><span class="cell-engineer-name">{{
                                scope.row.engineer_name
                            }}</span>
                        </div></template
                    ></el-table-column
                ><el-table-column prop="engineer_level" label="工程师等级" min-width="110"
                    ><template #default="scope"
                        ><span class="level-tag">{{
                            scope.row.engineer_level
                        }}</span></template
                    ></el-table-column
                ><template v-if="activeScope === 'operation'"
                    ><el-table-column
                        prop="operation_order_count"
                        label="操作工单数量"
                        min-width="110"
                    /><el-table-column
                        prop="satisfaction_average_score"
                        label="满意度平均分"
                        min-width="120"
                        ><template #default="scope"
                            ><span
                                class="score-badge"
                                :class="scoreLevel(scope.row.satisfaction_average_score)"
                                >{{
                                    Number(scope.row.satisfaction_average_score || 0).toFixed(2)
                                }}</span
                            ></template
                        ></el-table-column
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
                    /><el-table-column prop="total_order_count" label="工单总数" min-width="95"
                        ><template #default="scope"
                            ><span class="total-num">{{
                                scope.row.total_order_count ?? 0
                            }}</span></template
                        ></el-table-column
                    ><el-table-column
                        prop="satisfaction_average_score"
                        label="满意度平均分"
                        min-width="120"
                        ><template #default="scope"
                            ><span
                                class="score-badge"
                                :class="scoreLevel(scope.row.satisfaction_average_score)"
                                >{{
                                    Number(scope.row.satisfaction_average_score || 0).toFixed(2)
                                }}</span
                            ></template
                        ></el-table-column
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
        { value: 2, label: '立拱装���台车' },
        { value: 3, label: '直臂凿岩台车' },
        { value: 7, label: '锚杆台车' },
        { value: 9, label: '曲臂凿岩台车' },
        { value: 10, label: '矿用设备' }
    ],
    operationProjects = ['基建', '��利', '矿山']
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
// 点检可视化：由 manage_count / check_count 派生点检率与状态（不改动数据结构）
const inspectionRings = computed(() => {
    const machines = inspectionCards.filter((c) => c.key !== 'completion_rate')
    const rows = machines.map((m) => {
        const s: any = inspectionStats.value[m.key] || {}
        const manage = Number(s.manage_count || 0)
        const check = Number(s.check_count || 0)
        const rate = manage ? Math.round((check / manage) * 100) : 0
        return { key: m.key, title: m.title, manage, check, rate }
    })
    const avg = rows.length ? rows.reduce((sum, r) => sum + r.rate, 0) / rows.length : 0
    return rows.map((r) => {
        let status = '达标',
            tone = 'good'
        if (r.rate < 75) {
            status = '需关注'
            tone = 'warn'
        } else if (r.rate < avg) {
            status = '低于均值'
            tone = 'normal'
        }
        return { ...r, status, tone }
    })
})
const inspectionOverall = computed(() => {
    const c: any = inspectionStats.value.completion_rate || {}
    return {
        rate: Number(c.rate || 0),
        completed: c.completed_count || 0,
        dispatched: c.dispatched_count || 0
    }
})
// 工单可视化：按数量排序 + 占比 + 条宽（按最大值缩放）
const orderRanking = computed(() => {
    const all = workOrderCards.map((c) => {
        const s: any = workOrderStats.value[c.key] || {}
        return {
            key: c.key,
            title: c.title,
            count: Number(s.order_count || 0),
            hours: Number(s.hour_total || 0),
            hasHours: c.hasHours
        }
    })
    const total = all.reduce((sum, o) => sum + o.count, 0)
    const max = all.reduce((m, o) => Math.max(m, o.count), 0) || 1
    return {
        total,
        rows: [...all]
            .sort((a, b) => b.count - a.count)
            .map((o, i) => ({
                ...o,
                rank: i,
                pct: total ? Math.round((o.count / total) * 1000) / 10 : 0,
                width: Math.round((o.count / max) * 100)
            }))
    }
})
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
    const barTop = group === 'operation' ? '#34d399' : '#f07a68',
        barBottom = group === 'operation' ? '#059669' : '#d74130',
        accentDeep = group === 'operation' ? '#047857' : '#b5321f'
    if (satisfactionChartRef.value) {
        satisfactionChart = echarts.init(satisfactionChartRef.value)
        satisfactionChart.setOption({
            tooltip: {
                trigger: 'axis',
                axisPointer: { type: 'shadow', shadowStyle: { color: 'rgba(37,99,235,0.06)' } },
                backgroundColor: 'rgba(15,23,42,0.92)',
                borderWidth: 0,
                padding: [8, 12],
                textStyle: { color: '#fff', fontSize: 12 }
            },
            grid: { top: 36, right: 20, bottom: 96, left: 44 },
            xAxis: {
                type: 'category',
                data: (satisfaction.dimensions || []).map(
                    (item: any) => satisfactionDimensionTitles[item.key] || item.key
                ),
                axisTick: { show: false },
                axisLine: { lineStyle: { color: '#e6ebf2' } },
                axisLabel: {
                    interval: 0,
                    rotate: 32,
                    margin: 12,
                    color: '#64748b',
                    fontSize: 11
                }
            },
            yAxis: {
                type: 'value',
                min: 0,
                max: 10,
                interval: 2,
                axisLabel: { color: '#94a3b8', fontSize: 11 },
                splitLine: { lineStyle: { color: '#eef2f8', type: 'dashed' } }
            },
            series: [
                {
                    type: 'bar',
                    barMaxWidth: 26,
                    barMinHeight: 2,
                    data: (satisfaction.dimensions || []).map((item: any) =>
                        Number(item.average_score || 0)
                    ),
                    itemStyle: {
                        borderRadius: [6, 6, 0, 0],
                        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                            { offset: 0, color: barTop },
                            { offset: 1, color: barBottom }
                        ])
                    },
                    emphasis: { itemStyle: { color: accentDeep } },
                    label: {
                        show: true,
                        position: 'top',
                        color: '#334155',
                        fontSize: 11,
                        fontWeight: 600
                    }
                }
            ]
        })
    }
    const trend = stats.satisfaction_trend?.[satisfactionTrendPeriod.value] || {}
    if (trendChartRef.value) {
        trendChart = echarts.init(trendChartRef.value)
        trendChart.setOption({
            tooltip: {
                trigger: 'axis',
                backgroundColor: 'rgba(15,23,42,0.92)',
                borderWidth: 0,
                padding: [8, 12],
                textStyle: { color: '#fff', fontSize: 12 }
            },
            grid: { top: 36, right: 20, bottom: 96, left: 44 },
            xAxis: {
                type: 'category',
                data: trend.labels || [],
                boundaryGap: false,
                axisTick: { show: false },
                axisLine: { lineStyle: { color: '#e6ebf2' } },
                axisLabel: { color: '#64748b', fontSize: 11, margin: 12 }
            },
            yAxis: {
                type: 'value',
                min: 0,
                max: group === 'operation' ? 40 : 100,
                interval: group === 'operation' ? 10 : 20,
                axisLabel: { color: '#94a3b8', fontSize: 11 },
                splitLine: { lineStyle: { color: '#eef2f8', type: 'dashed' } }
            },
            series: [
                {
                    type: 'line',
                    smooth: true,
                    connectNulls: false,
                    data: trend[group] || [],
                    symbol: 'circle',
                    symbolSize: 8,
                    showSymbol: true,
                    itemStyle: {
                        color: '#fff',
                        borderColor: accentDeep,
                        borderWidth: 2.5
                    },
                    lineStyle: {
                        width: 3,
                        color: new echarts.graphic.LinearGradient(0, 0, 1, 0, [
                            { offset: 0, color: barTop },
                            { offset: 1, color: accentDeep }
                        ])
                    },
                    areaStyle: {
                        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                            { offset: 0, color: group === 'operation' ? 'rgba(16,185,129,0.22)' : 'rgba(215,65,48,0.22)' },
                            { offset: 1, color: group === 'operation' ? 'rgba(16,185,129,0)' : 'rgba(215,65,48,0)' }
                        ])
                    },
                    label: {
                        show: true,
                        color: '#334155',
                        fontSize: 11,
                        fontWeight: 600
                    }
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
const scoreLevel = (score: any) => {
    const s = Number(score || 0)
    if (s >= 4.5) return 'score-high'
    if (s >= 4) return 'score-mid'
    return 'score-low'
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
    --wb-surface: #ffffff;
    --wb-border: #e6ebf2;
    --wb-ink: #1e293b;
    --wb-muted: #64748b;
    --wb-faint: #94a3b8;
    --wb-primary: #d74130;
    --wb-primary-deep: #b5321f;
    --wb-radius: 16px;
    --wb-shadow: 0 1px 2px rgba(15, 23, 42, 0.04), 0 12px 28px -14px rgba(15, 23, 42, 0.14);
    --wb-shadow-hover: 0 2px 6px rgba(15, 23, 42, 0.06), 0 20px 40px -18px rgba(15, 23, 42, 0.24);
    color: var(--wb-ink);
}

/* 卡片通用外观 */
.filter-section,
.scope-tabs,
.satisfaction-card,
.satisfaction-trend-card,
.table-section,
.pagination-section {
    background: var(--wb-surface);
    border: 1px solid var(--wb-border);
    border-radius: var(--wb-radius);
    box-shadow: var(--wb-shadow);
}

/* 区块标题：强调竖条 */
.section-title {
    position: relative;
    padding-left: 12px;
    margin-bottom: 14px;
    font-size: 15px;
    font-weight: 700;
    letter-spacing: 0.3px;
    color: var(--wb-ink);
}
.section-title::before {
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

/* 筛选区 */
.filter-section {
    padding: 18px 20px 4px;
    margin-bottom: 16px;
}
.filter-form {
    margin-bottom: 0;
}
.filter-form :deep(.el-form-item__label) {
    color: var(--wb-muted);
    font-weight: 500;
}

/* Tab 切换 */
.scope-tabs {
    padding: 4px 20px 0;
    margin-bottom: 16px;
}
.scope-tabs :deep(.el-tabs__header) {
    margin-bottom: 0;
}
.scope-tabs :deep(.el-tabs__item) {
    font-size: 15px;
    height: 48px;
    color: var(--wb-muted);
}
.scope-tabs :deep(.el-tabs__item.is-active) {
    color: var(--wb-primary);
    font-weight: 600;
}
.scope-tabs :deep(.el-tabs__active-bar) {
    background-color: var(--wb-primary);
    height: 3px;
    border-radius: 3px;
}

/* 统计区块 */
.stats-section {
    margin-bottom: 4px;
}
.section-head {
    display: flex;
    align-items: center;
    justify-content: space-between;
}
.section-head .section-title {
    margin-bottom: 14px;
}
.section-meta {
    font-size: 12px;
    color: var(--wb-faint);
    font-variant-numeric: tabular-nums;
}

/* 点检环形仪表卡片 */
.inspect-grid {
    display: grid;
    grid-template-columns: repeat(5, 1fr);
    gap: 16px;
    margin-bottom: 24px;
}
.ring-card {
    display: flex;
    flex-direction: column;
    align-items: center;
    background: var(--wb-surface);
    border: 1px solid var(--wb-border);
    border-radius: 14px;
    padding: 20px 16px 18px;
    transition: transform 0.25s ease, box-shadow 0.25s ease, border-color 0.25s ease;
}
.ring-card:hover {
    transform: translateY(-3px);
    border-color: rgba(215, 65, 48, 0.28);
    box-shadow: var(--wb-shadow-hover);
}
.ring-card--warn {
    border-color: rgba(215, 65, 48, 0.45);
    background: linear-gradient(180deg, rgba(215, 65, 48, 0.05), rgba(215, 65, 48, 0));
}
.gauge {
    position: relative;
    width: 104px;
    height: 104px;
    border-radius: 50%;
    background: conic-gradient(
        var(--ring-color) calc(var(--val) * 1%),
        #eef0f3 calc(var(--val) * 1%)
    );
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 14px;
}
.gauge--good {
    --ring-color: #d74130;
}
.gauge--normal {
    --ring-color: #ef8a5b;
}
.gauge--warn {
    --ring-color: #e0a021;
}
.ring-hole {
    width: 78px;
    height: 78px;
    border-radius: 50%;
    background: var(--wb-surface);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 2px;
}
.ring-card--warn .ring-hole {
    background: #fdf6f5;
}
.ring-pct {
    font-size: 24px;
    font-weight: 700;
    line-height: 1;
    color: var(--wb-ink);
    font-variant-numeric: tabular-nums;
    letter-spacing: -0.5px;
}
.ring-pct i {
    font-size: 12px;
    font-weight: 600;
    font-style: normal;
    color: var(--wb-faint);
    margin-left: 1px;
}
.ring-cap {
    font-size: 11px;
    color: var(--wb-faint);
}
.ring-name {
    font-size: 14px;
    font-weight: 600;
    color: var(--wb-ink);
    margin-bottom: 6px;
}
.ring-meta {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 12px;
    color: var(--wb-muted);
    font-variant-numeric: tabular-nums;
    margin-bottom: 10px;
}
.ring-sep {
    width: 1px;
    height: 11px;
    background: var(--wb-border);
}
.ring-tag {
    font-size: 11px;
    font-weight: 500;
    padding: 2px 10px;
    border-radius: 999px;
}
.tag--good {
    color: #16a34a;
    background: #ecfdf3;
}
.tag--normal {
    color: #b5321f;
    background: #fdecea;
}
.tag--warn {
    color: #b7791f;
    background: #fffaeb;
}

/* 完成率主视觉卡片 */
.ring-card--hero {
    justify-content: center;
    border: none;
    background: linear-gradient(140deg, #e8604f 0%, var(--wb-primary) 45%, var(--wb-primary-deep) 100%);
    box-shadow: 0 16px 32px -16px rgba(215, 65, 48, 0.6);
}
.ring-card--hero:hover {
    border: none;
    box-shadow: 0 18px 38px -16px rgba(215, 65, 48, 0.7);
}
.hero-cap {
    align-self: flex-start;
    font-size: 13px;
    color: rgba(255, 255, 255, 0.9);
    letter-spacing: 0.2px;
}
.hero-val {
    align-self: flex-start;
    display: flex;
    align-items: baseline;
    margin: 6px 0 14px;
    font-size: 46px;
    font-weight: 700;
    line-height: 1;
    color: #fff;
    font-variant-numeric: tabular-nums;
    letter-spacing: -1.5px;
}
.hero-unit {
    font-size: 20px;
    font-weight: 600;
    margin-left: 2px;
}
.hero-track {
    width: 100%;
    height: 6px;
    border-radius: 999px;
    background: rgba(255, 255, 255, 0.28);
    overflow: hidden;
    margin-bottom: 12px;
}
.hero-fill {
    height: 100%;
    border-radius: 999px;
    background: #fff;
    transition: width 0.6s ease;
}
.hero-detail {
    align-self: flex-start;
    font-size: 12px;
    color: rgba(255, 255, 255, 0.85);
    font-variant-numeric: tabular-nums;
}
.hero-detail b {
    color: #fff;
    font-weight: 600;
}

/* 工单横向条形排行榜 */
.rank-list {
    background: var(--wb-surface);
    border: 1px solid var(--wb-border);
    border-radius: 14px;
    padding: 8px 22px;
    margin-bottom: 4px;
}
.rank-item {
    display: flex;
    align-items: center;
    gap: 14px;
    padding: 15px 0;
}
.rank-item + .rank-item {
    border-top: 1px dashed var(--wb-border);
}
.rank-no {
    flex-shrink: 0;
    width: 24px;
    height: 24px;
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 12px;
    font-weight: 700;
    color: var(--wb-faint);
    background: #f1f5f9;
    font-variant-numeric: tabular-nums;
}
.rank-no--top {
    color: #fff;
    background: linear-gradient(135deg, #e8604f, var(--wb-primary-deep));
}
.rank-body {
    flex: 1;
    min-width: 0;
}
.rank-head {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    margin-bottom: 8px;
}
.rank-name {
    font-size: 13px;
    font-weight: 600;
    color: var(--wb-ink);
}
.rank-metric {
    font-size: 12px;
    color: var(--wb-muted);
    font-variant-numeric: tabular-nums;
}
.rank-metric b {
    font-size: 14px;
    font-weight: 700;
    color: var(--wb-ink);
}
.rank-track {
    height: 8px;
    border-radius: 999px;
    background: #eef0f3;
    overflow: hidden;
}
.rank-fill {
    height: 100%;
    border-radius: 999px;
    background: #d7cfce;
    transition: width 0.6s ease;
}
.rank-fill--top {
    background: linear-gradient(90deg, #f07a68, var(--wb-primary-deep));
}

/* 满意度 / 趋势：并排一行 */
.charts-row {
    display: flex;
    gap: 16px;
    margin-bottom: 16px;
}
.satisfaction-section,
.satisfaction-trend-section {
    flex: 1 1 0;
    min-width: 0;
    display: flex;
}
.satisfaction-card,
.satisfaction-trend-card {
    flex: 1;
    min-height: 430px;
    display: flex;
    flex-direction: column;
}
.satisfaction-card :deep(.el-card__body),
.satisfaction-trend-card :deep(.el-card__body) {
    padding: 22px;
    flex: 1;
    display: flex;
    flex-direction: column;
}
.satisfaction-card-head,
.satisfaction-trend-head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 8px;
    min-height: 46px;
}
.card-title {
    font-size: 15px;
    font-weight: 700;
    color: var(--wb-ink);
}
.satisfaction-count {
    margin-top: 6px;
    font-size: 12px;
    font-weight: 600;
    color: var(--wb-primary-deep);
    background: rgba(215, 65, 48, 0.08);
    padding: 3px 10px;
    border-radius: 999px;
    display: inline-block;
}
.satisfaction-total {
    display: flex;
    align-items: baseline;
}
.satisfaction-total-value {
    font-size: 40px;
    font-weight: 700;
    color: var(--wb-primary);
    font-variant-numeric: tabular-nums;
    letter-spacing: -1px;
}
.satisfaction-total-unit {
    margin-left: 6px;
    color: var(--wb-faint);
    font-size: 13px;
}
.satisfaction-chart,
.satisfaction-trend-chart {
    width: 100%;
    flex: 1;
    min-height: 320px;
}

/* 表格 */
.table-section {
    padding: 22px;
    margin-bottom: 16px;
}
.table-head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 16px;
}
.table-head .section-title {
    margin-bottom: 0;
}
.table-note {
    color: var(--wb-faint);
    font-size: 12px;
}
.table-section :deep(.el-table th.el-table__cell) {
    background: #f6f9fe;
    color: var(--wb-ink);
    font-weight: 600;
}
.table-section :deep(.el-table) {
    --el-table-border-color: var(--wb-border);
    --el-table-header-text-color: var(--wb-ink);
    --el-table-row-hover-bg-color: #fdf2f0;
    border-radius: 12px;
    overflow: hidden;
}
.table-section :deep(.el-table th.el-table__cell) {
    font-weight: 600;
    color: var(--wb-ink);
}
.table-section :deep(.el-table td.el-table__cell) {
    color: #475569;
}

/* 工程师姓名单元格 */
.cell-engineer {
    display: flex;
    align-items: center;
    gap: 10px;
}
.cell-avatar {
    width: 30px;
    height: 30px;
    flex-shrink: 0;
    border-radius: 9px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 13px;
    font-weight: 600;
    color: #fff;
    background: linear-gradient(135deg, #f07a68, #d74130);
}
.cell-engineer-name {
    font-weight: 600;
    color: var(--wb-ink);
}

/* 等级标签 */
.level-tag {
    display: inline-block;
    padding: 2px 10px;
    border-radius: 999px;
    font-size: 12px;
    font-weight: 500;
    color: var(--wb-primary-deep);
    background: rgba(215, 65, 48, 0.08);
    border: 1px solid rgba(215, 65, 48, 0.16);
}

/* 工单总数强调 */
.total-num {
    font-weight: 700;
    color: var(--wb-ink);
    font-variant-numeric: tabular-nums;
}

/* 满意度分数徽章 */
.score-badge {
    display: inline-flex;
    align-items: center;
    min-width: 46px;
    justify-content: center;
    padding: 2px 10px;
    border-radius: 999px;
    font-size: 12px;
    font-weight: 600;
    font-variant-numeric: tabular-nums;
}
.score-high {
    color: #16a34a;
    background: #ecfdf3;
}
.score-mid {
    color: #d97706;
    background: #fffbeb;
}
.score-low {
    color: #dc2626;
    background: #fef2f2;
}

/* 分页 */
.pagination-section {
    padding: 16px 22px;
    display: flex;
    justify-content: flex-end;
    margin-bottom: 0;
}

@media (max-width: 1200px) {
    .charts-row {
        flex-direction: column;
    }
    .satisfaction-total-value {
        font-size: 32px;
    }
}
</style>
