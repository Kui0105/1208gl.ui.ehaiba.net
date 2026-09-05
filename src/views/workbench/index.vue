<template>
	<div>
		<el-row :gutter="16">
			<el-col :span="18">
				<el-card>
					<template #header>
						<div class="el-card-header">
							<span>工单数据</span>
						</div>
					</template>
					<el-row class="el-row-list">
						<el-col :span="6">
							<h1>待接单工单</h1>
							<span>TO BE ASSIGNED</span>
							<p>{{info.top.wait_recieve}}</p>
						</el-col>
						<el-col :span="6">
							<h1>进行中工单</h1>
							<span>IN PROGRESS</span>
							<p>{{info.top.ing}}</p>
						</el-col>
						<el-col :span="6">
							<h1>已完成工单</h1>
							<span>COMPLETED</span>
							<p>{{info.top.finish}}</p>
						</el-col>
						<el-col :span="6">
							<h1>已超时工单</h1>
							<span>OVERDUE</span>
							<p>{{info.top.over}}</p>
						</el-col>
					</el-row>
				</el-card>
				<el-card class="mt-4">
					<template #header>
						<div class="el-card-header flex justify-between items-center">
							<span>工单趋势</span>
							<el-radio-group size="small" v-model="radiusType" @change="getRecharge">
								<el-radio-button :value="1">近7天</el-radio-button>
								<el-radio-button :value="2">近一月</el-radio-button>
								<el-radio-button :value="3">近一年</el-radio-button>
							</el-radio-group>
						</div>
					</template>
					<div>
						<v-charts ref="visitorChart" style="height: 220px;width: 100%;" :option="option" :autoresize="true" />
					</div>
				</el-card>
				<el-row :gutter="16" class="mt-4">
					<el-col  :span="12">
						<el-card style="height: 100%;">
							<template #header>
								<div class="el-card-header flex justify-between items-center">
									<span>维修工单故障类型排行TOP5</span>
									<p>工单量</p>
								</div>
							</template>
							<div class="order-item" v-for="(item,index) in info.error_top" :key="index">
								<div class="flex justify-between items-center">
									<div>
										<span>{{index + 1}}</span>
										{{item.repair_name}}
									</div>
									<p>{{item.num}}</p>
								</div>
							</div>
						</el-card>
					</el-col>
					<el-col :span="12">
						<el-card>
							<template #header>
								<div class="el-card-header flex justify-between items-center">
									<span>工单类型排行TOP5</span>
									<p>工单量</p>
								</div>
							</template>
							<div class="order-item" v-for="(item,index) in info.type_top" :key="index">
								<div class="flex justify-between items-center">
									<div>
										<span>{{index+1}}</span>
										{{item.type_desc}}
									</div>
									<p>{{item.num}}</p>
								</div>
							</div>
						</el-card>
					</el-col>
				</el-row>
			</el-col>
			<el-col :span="6">
				<div class="flex" style="flex-direction: column;height: 100%;">
					<el-card class="flex-1">
						<template #header>
							<div class="el-card-header flex justify-between items-center">
								<span>未读消息</span>
								<p>更多</p>
							</div>
						</template>
						<div class="news-item" v-for="item in info.message">
							<div class="flex justify-between items-center" @click="viewOpen(item)">
								<div class="left">
									<p>{{item.content}}</p>
									<p>{{item.create_time}}</p>
								</div>
								<div class="right">
									{{item.read_str}}
								</div>
							</div>
						</div>
					</el-card>
					<el-card class="mt-4" style="min-height: 248px;">
						<template #header>
							<div class="el-card-header flex justify-between">
								<span>快捷入口</span>
							</div>
						</template>
						<div class="flex-gard">
							<div class="flex items-center" v-for="item in info.menu" @click="openWindow(item)">
								<img :src="item.image">
								<span>{{item.name}}</span>
							</div>
						</div>
					</el-card>
				</div>
			</el-col>
		</el-row>
	</div>
</template>

<script lang="ts" setup name="workbench">
	import { getWorkbench, getRechargeChart } from '@/api/app';
	import { onMounted , ref } from 'vue';
	import vCharts from 'vue-echarts';
	import { useRouter } from 'vue-router';
	const router = useRouter()
	const radiusType = ref(1)
	const info = ref({
		top: {},
		error_top: [],
		type_top: [],
		message: [],
		menu: []
	})
	const option = ref({
		tooltip: {
			trigger: 'axis'
		},
		legend: {
			data: ['销量']
		},
		grid: {
			left: '3%',
			right: '4%',
			bottom: '3%',
			containLabel: true
		},
		xAxis: {
			type: 'category',
			boundaryGap: false,
			data: []
		},
		yAxis: {
			type: 'value'
		},
		series: [
			{
				name: '工单量',
				type: 'line',
				smooth: true,     // 平滑曲线
				data: [],
				areaStyle: {
					color: {
						type: 'linear',
						x: 0,
						y: 0,
						x2: 0,
						y2: 1,
						colorStops: [
							{
								offset: 0,
								color: 'rgba(215,65,48,0.5)'
							},
							{
								offset: 1,
								color: 'rgba(215,65,48,0)'
							}
						]
					}
				},

				// 线条颜色
				lineStyle: {
					color: '#d74130'
				},
				itemStyle: {
					color: '#d74130'
				},
				// 拐点
				symbol: 'circle',
				symbolSize: 6
			}
		]
	})

	const getRecharge = async () => {
		const data = await getRechargeChart({ type: radiusType.value })
		if(radiusType.value == 2){
			option.value.xAxis.data = data.map(item=>`${item.date.split('-')[item.date.split('-').length - 1]}日`)
		}else{
			option.value.xAxis.data = data.map(item=>item.date)
		}
		option.value.series[0].data = data.map(item=>item.num)
	}
	// 获取工作台主页数据
	const getData = async () => {
		info.value = await getWorkbench()
		console.log(info.value)
	}
	const openWindow = (item) => {
		router.push({
			path:item.url
		})
	}
	const viewOpen = ({extra,scene_id}) => {
		if (scene_id == 201) {
			router.push({ path: '/order/detail', query: { id: extra } })
		} else if (scene_id == 202) {
			router.push({ path: '/order/clothesdetail', query: { id: extra } })
		} else if (scene_id == 203) {
			router.push({ path: '/device/fluctuationdetail', query: { id: extra } })
		}
	}
	onMounted(() => {
		getData()
		getRecharge()
	})
</script>

<style lang="scss" scoped>
	.el-row-list {
		h1 {
			font-size: 17px;
			font-weight: 600;
			line-height: 1;
		}

		span {
			font-size: 12px;
			color: #999;
			margin-bottom: 8px;
		}

		p {
			font-size: 24px;
			font-weight: 600;
			color: var(--el-color-primary);
		}
	}

	.el-card-header {
		position: relative;

		span {
			font-size: 16px;
			font-weight: 600;
		}

		p {
			font-size: 12px;
			color: #999;
		}

		&:after {
			content: '';
			width: 3px;
			height: 16px;
			background: var(--el-color-primary);
			position: absolute;
			left: -8px;
			top: 50%;
			transform: translateY(-50%);
		}
	}

	.order-item {
		margin-bottom: 8px;

		span {
			display: inline-block;
			width: 16px;
			height: 16px;
			line-height: 16px;
			text-align: center;
			background: var(--el-color-primary);
			color: #fff;
			border-radius: 50%;
			margin-right: 8px;
		}

		p {
			font-size: 12px;
			color: #999;
		}
	}

	.news-item {
		margin-bottom: 8px;
		cursor: pointer;
		.left {
			p {
				font-size: 12px;
				color: #999;

				&:first-child {
					font-size: 14px;
					color: #333;
					margin-bottom: 4px;
				}
			}
		}

		.right {
			font-size: 12px;
			color: var(--el-color-primary);
		}
	}

	.flex-gard {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		gap: 32px 16px;
		padding-top: 15px;
		div {
			text-align: center;
			cursor: pointer;

			img {
				width: 40px;
				height: 40px;
				margin-right: 4px;
			}

			span {
				font-size: 12px;
				color: #999;
			}
		}
	}
</style>