<template>
	<div class="trend-panel">
		<div v-if="loading" class="trend-skeleton"></div>
		<template v-else>
			<div v-if="hasData" class="trend-chart-shell">
				<v-charts class="trend-echart" :option="chartOption" :autoresize="true" />
			</div>
			<div v-else class="trend-empty">
				<el-empty description="暂无趋势数据" />
			</div>
		</template>
	</div>
</template>

<script setup lang="ts">
	import { computed } from 'vue'
	import vCharts from 'vue-echarts'

	interface TrendChartData {
		dates: Array<string | number>;
		accept_times: Array<number | string>;
		dispatch_times: Array<number | string>;
		arrive_times: Array<number | string>;
		complete_times: Array<number | string>;
	}

	interface TrendRow {
		date: string;
		accept: number;
		dispatch: number;
		arrive: number;
		complete: number;
	}

	const props = withDefaults(defineProps<{
		loading: boolean;
		trendData: TrendChartData;
	}>(), {
		loading: false
	})

	const toNumber = (value : string | number | null | undefined) => {
		const numericValue = Number(value)
		return Number.isFinite(numericValue) ? numericValue : 0
	}

	const formatDateLabel = (value : string | number | null | undefined) => {
		if (value === null || value === undefined) return ''
		const text = String(value)
		if (text.includes('-') && text.length >= 10) {
			return text.slice(5, 10)
		}
		if (text.includes('/')) {
			const parts = text.split('/')
			return parts.slice(-2).join('/')
		}
		return text
	}

	const chartRows = computed<TrendRow[]>(() => {
		const dates = props.trendData?.dates || []
		const acceptTimes = props.trendData?.accept_times || []
		const dispatchTimes = props.trendData?.dispatch_times || []
		const arriveTimes = props.trendData?.arrive_times || []
		const completeTimes = props.trendData?.complete_times || []

		return dates.slice(-7).map((date, index) => {
			const startIndex = Math.max(dates.length - 7, 0)
			const sourceIndex = startIndex + index
			return {
				date: formatDateLabel(date),
				accept: toNumber(acceptTimes[sourceIndex]),
				dispatch: toNumber(dispatchTimes[sourceIndex]),
				arrive: toNumber(arriveTimes[sourceIndex]),
				complete: toNumber(completeTimes[sourceIndex])
			}
		})
	})

	const hasData = computed(() => chartRows.value.length > 0)

	const yAxisMax = computed(() => {
		const values = chartRows.value.flatMap(item => [item.accept, item.dispatch, item.arrive, item.complete])
		const maxValue = values.length ? Math.max(...values) : 0
		if (maxValue <= 10) return 10
		return Math.ceil(maxValue * 1.2)
	})

	const createSeries = (name : string, key : keyof Omit<TrendRow, 'date'>, color : string) => ({
		name,
		type: 'line',
		smooth: true,
		showSymbol: true,
		symbol: 'circle',
		symbolSize: 8,
		data: chartRows.value.map(item => item[key]),
		lineStyle: {
			color,
			width: 3
		},
		itemStyle: {
			color,
			borderColor: '#ffffff',
			borderWidth: 2
		},
		areaStyle: {
			opacity: 0.08,
			color
		}
	})

	const chartOption = computed(() => ({
		color: ['#1677ff', '#52c41a', '#faad14', '#f5222d'],
		tooltip: {
			trigger: 'axis',
			confine: true,
			backgroundColor: 'rgba(17, 24, 39, 0.9)',
			borderWidth: 0,
			textStyle: {
				color: '#ffffff'
			},
			formatter: (params : Array<{ axisValue: string; marker: string; seriesName: string; value: number }>) => {
				if (!params.length) return ''
				const lines = params.map(item => `${item.marker}${item.seriesName}: ${item.value} 分钟`)
				return [params[0].axisValue, ...lines].join('<br/>')
			}
		},
		legend: {
			top: 8,
			left: 'center',
			itemWidth: 12,
			itemHeight: 12,
			textStyle: {
				fontSize: 12,
				color: '#4b5563'
			}
		},
		grid: {
			left: 24,
			right: 20,
			top: 64,
			bottom: 56,
			containLabel: true
		},
		xAxis: {
			type: 'category',
			boundaryGap: false,
			data: chartRows.value.map(item => item.date),
			axisTick: {
				show: false
			},
			axisLine: {
				lineStyle: {
					color: '#d0d7de'
				}
			},
			axisLabel: {
				interval: 0,
				fontSize: 12,
				color: '#6b7280',
				margin: 14
			}
		},
		yAxis: {
			type: 'value',
			min: 0,
			max: yAxisMax.value,
			axisLine: {
				show: false
			},
			axisTick: {
				show: false
			},
			axisLabel: {
				fontSize: 12,
				color: '#6b7280',
				margin: 12
			},
			splitLine: {
				lineStyle: {
					color: '#eef2f7',
					type: 'dashed'
				}
			}
		},
		series: [
			createSeries('接单响应', 'accept', '#1677ff'),
			createSeries('出发响应', 'dispatch', '#52c41a'),
			createSeries('到达响应', 'arrive', '#faad14'),
			createSeries('完成响应', 'complete', '#f5222d')
		]
	}))
</script>

<style scoped>
	.trend-panel {
		width: 100%;
	}

	.trend-chart-shell {
		width: 100%;
		height: 420px;
	}

	.trend-echart {
		width: 100%;
		height: 100%;
	}

	.trend-skeleton {
		width: 100%;
		height: 420px;
		border-radius: 8px;
		background: linear-gradient(90deg, #eef2f7 25%, #f7f9fc 37%, #eef2f7 63%);
		background-size: 400% 100%;
		animation: trend-loading 1.4s ease infinite;
	}

	.trend-empty {
		height: 420px;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	@keyframes trend-loading {
		0% {
			background-position: 100% 50%;
		}

		100% {
			background-position: 0 50%;
		}
	}
</style>
