<template>
	<div class="uw-detail">
		<img class="back" src="/src/assets/uwback.png" @click="goBack">
		<div class="uw-detail-left uw-detail-lefts">
			<div
				ref="stepsWrapRef"
				class="order-steps-wrap"
				:class="{ 'is-dragging': stepsDragging }"
				:style="{ '--order-step-item-width': `${ORDER_STEP_ITEM_WIDTH}px` }"
				@mousedown="handleStepsDragStart"
				@mousemove="handleStepsDragMove"
				@mouseup="handleStepsDragEnd"
				@mouseleave="handleStepsDragEnd"
			>
				<el-steps class="order-steps" :active="orderInfo.step_now" align-center :style="{ minWidth: orderStepsWidth }">
					<el-step v-for="item in orderInfo.admin_step_all" :key="item.step || item.step_str" :title="item.step_str" />
				</el-steps>
			</div>
			<el-tabs v-model="leftActive" class="demo-tabs" @tab-click="handleClick">
				<el-tab-pane label="工单信息" name="order">
					<el-form >
						<el-form-item  label="工单编号：">{{orderInfo.order_sn}}</el-form-item>
						<el-form-item label="工单类型：">{{orderInfo.type_desc}}</el-form-item>
						<el-form-item label="工单状态：">{{orderInfo.engineer_status_desc}}</el-form-item>
						<el-form-item label="状态类型：">{{orderInfo.step_desc}}</el-form-item>
						<el-form-item label="使用地区：" v-if="orderInfo.type == 10">{{orderInfo.region_name}}</el-form-item>
						
						
						<!-- form表单自定义内容展示 -->
						<div v-for="item in orderInfo.create_form">
							<el-form-item v-if="item.is_cate" v-for="row in item.son" :label="`${row.name}：`">
								<div v-if="TEXT_TYPES.includes(row.small_type)">{{row.value}}</div>
								<div style="display: flex;gap: 10px;">
									<el-image
										v-for="img in getMediaList(row.value)"
										v-if="IMAGE_TYPES.includes(row.small_type)" 
										style="width: 80px;height: 80px;" 
										:preview-src-list="getMediaList(row.value)" 
										:src="img" 
									/>
								</div>
								<div v-if="row.small_type == 5">
									<el-button type="text" v-for="file in getMediaList(row.value)">
										<a :href="file" target="_blank" >查看文件</a>
									</el-button>
								</div>
								<div style="display: flex; gap: 10px;"  class="flex flex-wrap" v-if="row.small_type == 10">
									<div  v-for="img in getExtraMediaList(row.extra_data)">
										<el-image
											style="width: 80px;height: 80px;" 
											:preview-src-list="getExtraMediaPreviewList(row.extra_data)" 
											:src="img.value" 
										/>
										<div class="text-center">{{img.name}}</div>
									</div>
								</div>
							</el-form-item>
							<el-form-item :label="item.name" v-else>
								<div v-if="TEXT_TYPES.includes(item.small_type)">{{item.value}}</div>
								<div style="display: flex;gap: 10px;">
									<el-image
										v-for="img in getMediaList(item.value)"
										v-if="IMAGE_TYPES.includes(item.small_type)" 
										style="width: 80px;height: 80px;" 
										:preview-src-list="getMediaList(item.value)" 
										:src="img" 
									/>
								</div>
								<div v-if="item.small_type == 5">
									<el-button type="text" v-for="file in getMediaList(item.value)">
										<a :href="file" target="_blank" >查看文件</a>
									</el-button>
								</div>
								<div style="display: flex; gap: 10px;"  class="flex flex-wrap" v-if="item.small_type == 10">
									<div  v-for="img in getExtraMediaList(item.extra_data)">
										<el-image
											style="width: 80px;height: 80px;" 
											:preview-src-list="getExtraMediaPreviewList(item.extra_data)" 
											:src="img.value" 
										/>
										<div class="text-center">{{img.name}}</div>
									</div>
								</div>
							</el-form-item>
						</div>
						<!-- end -->
						<el-form-item label="工程师：">{{orderInfo.engineer_info.name}}</el-form-item>
						<el-form-item label="创建人：">{{orderInfo.create_name}}</el-form-item>
						<el-form-item label="创建时间：">{{orderInfo.create_time}}</el-form-item>
					</el-form>
					<div v-if="carTripList.length" class="trip-list-card">
						<div class="trip-list-header">
							<span class="trip-list-title">用车趟次列表</span>
							<span v-if="showTripMileageTip" class="trip-list-tip">总里程为各趟已结束用车里程累计</span>
						</div>
						<el-table :data="carTripList" border size="small" class="trip-list-table">
							<el-table-column label="第几趟" min-width="90">
								<template #default="{ row }">
									{{ formatTripNoText(row.trip_no) }}
								</template>
							</el-table-column>
							<el-table-column label="车牌" min-width="120">
								<template #default="{ row }">
									{{ formatDisplayValue(row.car_code) }}
								</template>
							</el-table-column>
							<el-table-column label="开始里程" min-width="100">
								<template #default="{ row }">
									{{ formatDisplayValue(row.start_m) }}
								</template>
							</el-table-column>
							<el-table-column label="结束里程" min-width="100">
								<template #default="{ row }">
									{{ formatDisplayValue(row.end_m) }}
								</template>
							</el-table-column>
							<el-table-column label="本趟公里数" min-width="110">
								<template #default="{ row }">
									{{ formatDisplayValue(row.total_m) }}
								</template>
							</el-table-column>
							<el-table-column label="状态" min-width="120">
								<template #default="{ row }">
									{{ formatDisplayValue(row.status_desc) }}
								</template>
							</el-table-column>
						</el-table>
					</div>
				</el-tab-pane>
				
				<el-tab-pane label="实时定位" name="location" v-if="orderInfo.near_position" style="height: 100%;">
					<div class="map-container">
						<div class="map-header">
							<span class="map-title">📍 工程师实时位置</span>
							<span class="map-info" v-if="orderInfo.engineer_info">
								工程师：{{orderInfo.engineer_info.name}} | 电话：{{orderInfo.engineer_info.mobile}}
							</span>
						</div>
						<div id="engineerMap" class="map-wrapper"></div>
					</div>
				</el-tab-pane>
				
				<el-tab-pane v-if="showDeviceTab" label="设备信息" name="device">
					<el-form label-width="82">
						<el-form-item label="设备编号：">{{orderInfo.machine_info.code}}</el-form-item>
						<el-form-item label="设备名称：">{{orderInfo.machine_info.name}}</el-form-item>
						<el-form-item label="出厂时间：">{{orderInfo.machine_info.born_date}}</el-form-item>
						<el-form-item label="单位名称：">{{orderInfo.machine_info.company_name}}</el-form-item>
						<el-form-item label="使用地区：">{{orderInfo.machine_info.full_address}}</el-form-item>
						<el-form-item label="负责人：">{{orderInfo.machine_info.contact}}</el-form-item>
						<el-form-item label="联系电话：">{{orderInfo.machine_info.mobile}}</el-form-item>
					</el-form>
				</el-tab-pane>
			</el-tabs>
			<uw-order-button v-if="orderInfo.admin_btn" :orderInfo="orderInfo" :btn="orderInfo.admin_btn" @change="getOrderDetailApi" />
		</div>
		<div class="uw-detail-right">
			<el-tabs v-model="activeName" class="demo-tabs" @tab-change="handleClickRight">
				<el-tab-pane label="动态信息" name="first">
					<el-scrollbar :style="{'height':`calc(100vh - 91px - 32px - 245px)`}" class="el-scrollbar-height">
						<el-timeline>
							<el-timeline-item v-for="(activity, index) in orderInfo.trends" :key="index" placement="top" :timestamp="activity.title">
								<el-card>
									<h4>{{activity.name}}</h4>
									<p>{{activity.intro}}</p>
									<p>{{activity.create_time}}</p>
								</el-card>
							</el-timeline-item>
						</el-timeline>
					</el-scrollbar>
				</el-tab-pane>
				<el-tab-pane v-for="items in orderInfo.log_list" :label="items.step_desc" :name="items.id">
					<el-scrollbar :style="{'height':`calc(100vh - 91px - 32px - 245px)`}" class="el-scrollbar-height">
						<el-form label-width="100">
							
							<!-- <el-form-item :label="`${items.step_desc.split('确认')[1] || items.step_desc.split('确认')[0]}时间：`">{{items.create_time}}</el-form-item> -->
							<div v-for="field in currentFields">
								<div v-if="!field.show || field.show(stepCtx)">
									<el-form-item :label="typeof field.label === 'function' ? field.label(stepCtx)  : field.label">
										<div v-if="!field.isImage && Array.isArray(field.value(stepCtx))" class="comment-survey-list">
											<span v-for="item in field.value(stepCtx)" :key="item" class="comment-survey-item">{{ item }}</span>
										</div>
										<span v-else-if="!field.isImage">{{ field.value(stepCtx) }}</span>
										<el-image
											v-for="img in getMediaList(field.value(stepCtx))"
											v-else
											style="width: 80px;height: 80px;" 
											:preview-src-list="getMediaList(field.value(stepCtx))" 
											:src="img" 
										/>
									</el-form-item>
								</div>
							</div>
							<div v-for="item in items.form_data">
								<div v-if="item.is_cate || item.is_cate == 1">
									<el-form-item v-for="row in item.son" :label="row.name">
										<div v-if="TEXT_TYPES.includes(row.small_type)">{{row.value}}</div>
										
										<div v-if="row.small_type == 10 || IMAGE_TYPES.includes(row.small_type)"  style="display: flex;gap: 10px;">
											<el-image
												v-for="img in getMediaList(row.value)"
												v-if="IMAGE_TYPES.includes(row.small_type)" 
												style="width: 80px;height: 80px;" 
												:preview-src-list="getMediaList(row.value)" 
												:src="img" 
											/>
											<el-image
												v-for="img in getExtraMediaList(row.extra_data)"
												v-if="row.small_type == 10"
												style="width: 80px;height: 80px;" 
												:preview-src-list="getExtraMediaPreviewList(row.extra_data)" 
												:src="img.value" 
											/>
										</div>
										<div v-if="row.small_type == 12">
											<video v-for="video in getMediaList(row.value)" :src="video" style="width: 120px;height: 120px;" controls />
										</div>
									</el-form-item>
								</div>
								<el-form-item :label="item.name" v-else>
									<div v-if="TEXT_TYPES.includes(item.small_type)">{{item.value}}</div>
									
									<div v-if="item.small_type == 10 || IMAGE_TYPES.includes(item.small_type)" style="display: flex;gap: 10px;">
										<el-image
											v-for="img in getMediaList(item.value)"
											v-if="IMAGE_TYPES.includes(item.small_type)" 
											style="width: 80px;height: 80px;" 
											:preview-src-list="getMediaList(item.value)" 
											:src="img" 
										/>
										<el-image
											v-for="img in getExtraMediaList(item.extra_data)"
											v-if="item.small_type == 10"
											style="width: 80px;height: 80px;" 
											:preview-src-list="getExtraMediaPreviewList(item.extra_data)" 
											:src="img.value" 
										/>
									</div>
									<div v-if="item.small_type == 12">
										<video v-for="video in getMediaList(item.value)" :src="video" style="width: 120px;height: 120px;" controls />
									</div>
								</el-form-item>
							</div>
							<div v-if="items.extra_data && items.step == 7 && orderInfo.type == 7">
								<el-form-item label="其他附件">
									<uw-other-file :value="items.extra_data.else_file"></uw-other-file>
								</el-form-item>
							</div>
							<el-form-item v-if="getNodeRemark(items)" label="备注">
								<span>{{ getNodeRemark(items) }}</span>
							</el-form-item>
							<el-form-item v-if="items.dj_data && items.dj_data.length">
								<div style="width: 100%;">
									<el-radio-group v-model="jdActive">
										<el-radio-button v-for="item in items.dj_data" :label="item.name" :value="item.id" />
									</el-radio-group>
									<div>
										<div v-for="jd in jdItme" style="border-bottom: 1px solid #f2f2f2;padding: 10px 0;">
											<b @click="jd.isShow=!jd.isShow" style="display: flex;justify-content: space-between;align-items: center;cursor: pointer;">
												{{jd.name}}
												<span style="margin-left: auto;" :style="{'color':jd.no_num > 0 ? '#d74130' : '#1CAC2A'}">{{jd.no_num > 0 ? '异常' : '正常'}}</span>
												<el-icon>
													<CaretRight v-if="!jd.isShow" />
													<CaretBottom v-else />
												</el-icon>
											</b>
											<div v-if="jd.isShow" v-for="checks in jd.checks">
												<h4 style="display: flex;justify-content: space-between;">{{checks.name}} <span :style="{'color':checks.check_status == 2 ? '#d74130' : '#1CAC2A'}">{{checks.check_status == 2 ? '异常' : '正常'}}</span></h4>
												<p v-if="checks.msg">异常说明：{{checks.msg}}</p>
												<div v-if="checks.imgs">
													<el-image
														v-for="img in getMediaList(checks.imgs)"
														style="width: 80px;height: 80px;" 
														:preview-src-list="getMediaList(checks.imgs)" 
														:src="img" 
													/>
												</div>
												<p v-if="checks.sug && checks.check_status != 2">处理方案：<span style="color: #d74130;">{{checks.sug}}</span></p>
											</div>
										</div>
									</div>
								</div>
							</el-form-item>
							<!-- 报销数据  -->
							<div v-if="items.step == 5">
								<div v-for="bx in items.bx_data">
									<el-form-item label="报销类型">{{bx.name}}</el-form-item>
									<el-form-item label="报销金额">{{bx.money}}</el-form-item>
									<el-form-item label="报销图片">
										<el-image
											v-for="img in getMediaList(bx.img)"
											style="width: 80px;height: 80px;" 
											:preview-src-list="getMediaList(bx.img)" 
											:src="img" 
										/>
									</el-form-item>
								</div>
							</div>
						</el-form>
					</el-scrollbar>
				</el-tab-pane>
			</el-tabs>
			<div class="button-buttom">
				<el-input v-model="orderInfo.remark" class="el-input-input" type="textarea" placeholder="请输入工单备注内容"></el-input>
				<el-button class="el-button-butotn mt-[12px]" type="primary" @click="addReamrk">添加备注</el-button>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
	import { ref, computed, onMounted, watch, nextTick } from 'vue'
	import { getOrderDetail , getRemark, getOrderWorkList } from '@/api/order/order'
	import uwOrderButton from './component/uw-order-button.vue'
	import { onBeforeRouteLeave, useRoute, useRouter } from 'vue-router';
	import { ElMessage } from 'element-plus';
	import { stepFieldMap , buildTemplateFromFormKeys } from '@/utils/util';
	import { CaretRight , CaretBottom} from '@element-plus/icons-vue';
	import uwOtherFile from '@/components/uw-other-file/uw-other-file.vue'
	import useTabsStore from '@/stores/modules/multipleTabs'
	const route = useRoute()
	const router = useRouter()
	const tabsStore = useTabsStore()
	const txMapKey = ref('')
	const orderInfo = ref<any>({
		admin_step_all: [],
		create_time: '',
		log_list: [],
		admin_btn: '',
		car_trip_list: [],
		machine_info: {
			code: '',
			name: '',
			born_date: '',
			company_name: '',
			contact: '',
			mobile: ''
		},
		engineer_info: {
			name: '',
			mobile: ''
		},
		near_position: {
			latitude: '',
			longitude: ''
		}
	})
	
	// 地图相关状态
	const mapScriptLoaded = ref(false)
	const mapLoading = ref(false)
	const mapInitialized = ref(false)
	const mapInstance = ref<any>(null)
	const mapMarker = ref<any>(null)
	const mapInfoWindow = ref<any>(null)
	const TEXT_TYPES = [1, 2, 6, 8, 11,9,13,'1','2','6','8','11','9','13']
	const IMAGE_TYPES = [3, 4,'3','4']
	const leftActive = ref('order')
	const activeName = ref('first')
	const tabsForm = ref([])
	const showDeviceTab = computed(() => Number(orderInfo.value.type) !== 10)
	const carTripList = computed(() => Array.isArray(orderInfo.value?.car_trip_list) ? orderInfo.value.car_trip_list : [])
	const showTripMileageTip = computed(() => carTripList.value.length > 0)
	const stepCtx = computed(() => ({
		orderInfo: orderInfo.value,
		form: tabsForm.value
	}))
	const ORDER_STEP_BASE_COUNT = 8
	const ORDER_STEP_ITEM_WIDTH = 130
	const stepsWrapRef = ref<HTMLElement | null>(null)
	const stepsDragging = ref(false)
	const stepsDragStartX = ref(0)
	const stepsDragScrollLeft = ref(0)
	const orderStepsWidth = computed(() => {
		const stepCount = orderInfo.value.admin_step_all?.length || 0
		return `${Math.max(stepCount * ORDER_STEP_ITEM_WIDTH, ORDER_STEP_BASE_COUNT * ORDER_STEP_ITEM_WIDTH)}px`
	})
	const handleStepsDragStart = (event: MouseEvent) => {
		if (!stepsWrapRef.value) return
		stepsDragging.value = true
		stepsDragStartX.value = event.pageX
		stepsDragScrollLeft.value = stepsWrapRef.value.scrollLeft
	}
	const handleStepsDragMove = (event: MouseEvent) => {
		if (!stepsDragging.value || !stepsWrapRef.value) return
		event.preventDefault()
		const distance = event.pageX - stepsDragStartX.value
		stepsWrapRef.value.scrollLeft = stepsDragScrollLeft.value - distance
	}
	const handleStepsDragEnd = () => {
		stepsDragging.value = false
	}
	const goBack = () => {
		router.push('/order/list')
	}
	const removeDetailTab = (fullPath: string) => {
		setTimeout(() => {
			tabsStore.removeTabRecord(fullPath)
		})
	}
	const currentFields = computed(() => {
		if (!tabsForm.value) return []
		return stepFieldMap[tabsForm.value.step] || []
	})
	const getMediaList = (value: unknown) => {
		if (Array.isArray(value)) {
			return value
				.map(item => typeof item === 'string' ? item.trim() : '')
				.filter(Boolean)
		}
		if (typeof value !== 'string') {
			return []
		}
		return value
			.split(',')
			.map(item => item.trim())
			.filter(Boolean)
	}
	const getExtraMediaList = (value: any) => {
		if (!Array.isArray(value)) {
			return []
		}
		return value.filter(item => item?.value && String(item.value).trim())
	}
	const getExtraMediaPreviewList = (value: any) => {
		return getExtraMediaList(value).map(item => String(item.value).trim())
	}
	const formatDisplayValue = (value: unknown) => {
		return value === undefined || value === null || value === '' ? '--' : String(value)
	}
	const formatTripNoText = (value: unknown) => {
		return value === undefined || value === null || value === '' ? '--' : `第${value}趟`
	}
	const jdActive = ref()
	const jdItme = ref(null)
	const handleClick = (tab) => {
		const currentTabName = tab.props.name
		
		// 当切换到实时定位标签时，初始化地图
		if (currentTabName === 'location') {
			// 添加延迟，确保标签页已经渲染完成
			setTimeout(() => {
				initMap()
			}, 300)
		}
	}
	const handleClickRight = () => {
		const form = orderInfo.value.log_list.find((val:any)=>val.id === activeName.value);
		if(form){
			tabsForm.value = form
			jdActive.value = form.dj_data[0]?.id
			jdItme.value = form.dj_data[0].sons
		}
	}
	watch(()=>jdActive.value,()=>{
		jdItme.value = orderInfo.value.log_list.find(val=>val.id === activeName.value)?.dj_data.find(val=>val.id === jdActive.value)?.sons
	})
	watch(showDeviceTab, (visible) => {
		if (!visible && leftActive.value === 'device') {
			leftActive.value = 'order'
		}
	})
	const loadWorkVolumeSummary = async (orderId: number | string) => {
		const pageSize = 100
		let pageNo = 1
		let totalCount = 0
		const summaryMap = new Map<string, { key: string, name: string, value: number }>()

		while (true) {
			const result = await getOrderWorkList({ id: orderId, page_no: pageNo, page_size: pageSize })
			const lists = Array.isArray(result?.lists) ? result.lists : []
			totalCount = Number(result?.count || 0)
			lists.forEach((record: any) => {
				const extraData = Array.isArray(record?.extra_data) ? record.extra_data : []
				extraData.forEach((item: any) => {
					const value = Number(String(item?.value ?? '').replace(/,/g, '').trim())
					if (!Number.isFinite(value)) return
					const name = String(item?.name || item?.key || '').trim()
					const key = String(item?.key || name)
					const current = summaryMap.get(key)
					if (current) current.value += value
					else summaryMap.set(key, { key, name, value })
				})
			})

			if (!lists.length || lists.length < pageSize || pageNo * pageSize >= totalCount) break
			pageNo += 1
		}

		return Array.from(summaryMap.values())
	}

	const getOrderDetailApi = async () => {
		getOrderDetail({id:route.query.id}).then(async res=>{
			
			if(res.type == 1 || res.type == 4){
				res.create_form.unshift(...buildTemplateFromFormKeys({formValue:res.extra_data}))
			}

			if (Number(res.type) === 6) {
				try {
					const workVolumeSummary = await loadWorkVolumeSummary(res.id)
					if (workVolumeSummary.length) {
						res.log_list.forEach((item: any) => {
							if (Number(item.step) !== 10) return
							item.extra_data = item.extra_data && typeof item.extra_data === 'object'
								? item.extra_data
								: {}
							if (!Array.isArray(item.extra_data.audit_num_list) || !item.extra_data.audit_num_list.length) {
								item.extra_data.audit_num_list = workVolumeSummary
							}
						})
					}
				} catch (error) {
					console.warn('加载工作记录方量汇总失败', error)
				}
			}
			
			res.log_list.forEach((item)=>{
				if((res.type == 1 || res.type == 4) && item.step == 5){
					item.form_data.unshift(...buildTemplateFromFormKeys({formValue:item.extra_data}))
				}
				item.label = item.step_desc
				item.value = item.id
			})
			console.log(res);
			orderInfo.value = res
			txMapKey.value = res.tx_map_key || ''
		}).catch(err=>{
			ElMessage.error(err)
		})
	}
	
	const addReamrk = () => {
		getRemark({order_id:route.query.id,remark:orderInfo.value.remark}).then(res=>{
			ElMessage.success('添加成功')
		})
	}

	const getNodeRemark = (items: any) => {
		let extraData = items?.extra_data
		if (typeof extraData === 'string') {
			try {
				extraData = JSON.parse(extraData)
			} catch {
				extraData = null
			}
		}
		const rollbackReason = extraData && typeof extraData === 'object'
			? extraData.cancelled_reason || extraData.rollback_reason || extraData.reason || ''
			: ''
		return rollbackReason || items.audit_msg || items.remark || items.msg || items.audit_remark || ''
	}
	
	const initMap = () => {
		if (!orderInfo.value.near_position || !orderInfo.value.near_position.latitude || !orderInfo.value.near_position.longitude) {
			return
		}
		
		if (!txMapKey.value) {
			return
		}
		
		if (typeof window.TMap === 'undefined') {
			loadTencentMapScript().then(() => {
				renderMap()
			}).catch(() => {
				// 静默处理错误
			})
		} else {
			renderMap()
		}
	}

	const loadTencentMapScript = () => {
		return new Promise((resolve, reject) => {
			// 如果地图已经加载，直接返回
			if (typeof window.TMap !== 'undefined') {
				resolve(window.TMap)
				return
			}
			
			// 如果正在加载，等待加载完成
			if (mapLoading.value) {
				const checkInterval = setInterval(() => {
					if (typeof window.TMap !== 'undefined') {
						clearInterval(checkInterval)
						resolve(window.TMap)
					}
				}, 100)
				return
			}
			
			mapLoading.value = true
			const script = document.createElement('script')
			script.src = `https://map.qq.com/api/gljs?v=1.exp&key=${txMapKey.value}`
			script.onload = () => {
				mapScriptLoaded.value = true
				mapLoading.value = false
				resolve(window.TMap)
			}
			script.onerror = (err) => {
				mapLoading.value = false
				reject(err)
			}
			document.head.appendChild(script)
		})
	}
	
	const createMap = (center, mapContainer) => {
		const map = new window.TMap.Map(mapContainer, {
			center: center,
			zoom: 15,
			viewMode: '2D'
		})
		
		const marker = new window.TMap.MultiMarker({
			map: map,
			styles: {
				marker: new window.TMap.MarkerStyle({
					width: 25,
					height: 35,
					anchor: { x: 12, y: 35 }
				})
			},
			geometries: [{
				id: 'marker',
				position: center,
				properties: {
					title: `工程师：${orderInfo.value.engineer_info.name || ''}`,
					phone: `电话：${orderInfo.value.engineer_info.mobile || ''}`
				}
			}]
		})
		
		const infoWindow = new window.TMap.InfoWindow({
			map: map,
			position: center,
			content: `<div style="padding: 10px;">
				<div style="font-weight: bold; margin-bottom: 5px;">工程师：${orderInfo.value.engineer_info.name || ''}</div>
				<div>电话：${orderInfo.value.engineer_info.mobile || ''}</div>
			</div>`,
			enableClose: true
		})
		
		marker.on('click', () => {
			infoWindow.open()
		})

		mapInstance.value = map
		mapMarker.value = marker
		mapInfoWindow.value = infoWindow
		
		// 标记地图已经初始化
		mapInitialized.value = true
	}

	const updateMapMarker = (center) => {
		if (!mapInitialized.value || !mapInstance.value || !mapMarker.value || !mapInfoWindow.value) {
			return
		}

		mapInstance.value.setCenter(center)
		mapMarker.value.setGeometries([{
			id: 'marker',
			position: center,
			properties: {
				title: `工程师：${orderInfo.value.engineer_info.name || ''}`,
				phone: `电话：${orderInfo.value.engineer_info.mobile || ''}`
			}
		}])
		mapInfoWindow.value.setPosition(center)
		mapInfoWindow.value.setContent(`<div style="padding: 10px;">
			<div style="font-weight: bold; margin-bottom: 5px;">工程师：${orderInfo.value.engineer_info.name || ''}</div>
			<div>电话：${orderInfo.value.engineer_info.mobile || ''}</div>
		</div>`)
	}
	
	const renderMap = () => {
		if (typeof window.TMap === 'undefined') {
			return
		}
		
		// 检查坐标是否存在
		if (!orderInfo.value.near_position || !orderInfo.value.near_position.latitude || !orderInfo.value.near_position.longitude) {
			return
		}
		
		// 转换坐标为数字类型
		const latitude = parseFloat(orderInfo.value.near_position.latitude)
		const longitude = parseFloat(orderInfo.value.near_position.longitude)
		
		// 检查坐标是否有效
		if (isNaN(latitude) || isNaN(longitude)) {
			return
		}
		
		// 腾讯地图的 LatLng 构造函数参数顺序是 (纬度, 经度)
		const center = new window.TMap.LatLng(latitude, longitude)

		if (mapInitialized.value) {
			updateMapMarker(center)
			return
		}
		
		// 添加延迟，确保地图容器已经完全渲染
		setTimeout(() => {
			// 确保地图容器有足够的高度
			const mapContainer = document.getElementById('engineerMap')
			if (!mapContainer) {
				return
			}
			
			// 检查地图容器的高度和宽度
			const rect = mapContainer.getBoundingClientRect()
			
			if (rect.width <= 0 || rect.height <= 0) {
				// 手动设置地图容器的高度和宽度
				mapContainer.style.width = '100%'
				mapContainer.style.height = '360px'
				// 再次添加延迟，确保样式已经应用
				setTimeout(() => {
					const newRect = mapContainer.getBoundingClientRect()
					if (newRect.width > 0 && newRect.height > 0) {
						createMap(center, mapContainer)
					} else {
						// 再次尝试，使用固定尺寸
						setTimeout(() => {
							const mapContainer = document.getElementById('engineerMap')
							if (mapContainer) {
								mapContainer.style.width = '500px'
								mapContainer.style.height = '360px'
								const finalRect = mapContainer.getBoundingClientRect()
								if (finalRect.width > 0 && finalRect.height > 0) {
									createMap(center, mapContainer)
								}
							}
						}, 200)
					}
				}, 200)
			} else {
				createMap(center, mapContainer)
			}
		}, 300)
	}
	
	watch(()=>orderInfo.value.near_position,()=>{
		if(orderInfo.value.near_position && txMapKey.value){
			initMap()
		}
	})
	
	watch(()=>txMapKey.value, () => {
		if (txMapKey.value && orderInfo.value.near_position) {
			initMap()
		}
	})
	
	onMounted(()=>{
		getOrderDetailApi()
	})
	onBeforeRouteLeave((to, from) => {
		if (to.path === '/order/list') {
			removeDetailTab(from.fullPath)
		}
	})
</script>

<style lang="scss" scoped>
	.uw-detail {
		background: #FFFFFF;
		box-shadow: 0px 0px 30px 0px rgba(245, 225, 228, 0.5);
		border-radius: 16px 16px 16px 16px;
		width: 100%;
		min-height: calc(100vh - 91px - 32px);
		display: flex;
		position: relative;
		.back {
			position: absolute;
			left: 20px;
			top: 20px;
		}
		&-lefts{
			flex: 0 0 60%;
			min-width: 0;
			padding-left: 64px;
			padding-right: 84px;
			padding-top: 48px;
			padding-bottom: 44px;
			display: flex;
			flex-direction: column;
			// ::v-deep .el-form-item{
			// 	margin-bottom: 6px;
			// 	.el-form-item__label{
			// 		align-items: center;
			// 		line-height: 1.5;
			// 	}
			// }
			.demo-tabs{
				margin-top: 35px;
				flex: 1;
			}
		}
		&-right{
			flex: 0 0 40%;
			box-shadow: 0px 0px 30px 0px rgba(245,225,228,0.5);
			padding: 35px 32px 32px;
			min-width: 356px;
			display: flex;
			flex-direction: column;
			// ::v-deep .el-form-item{
			// 	margin-bottom: 6px;
			// }
			.button-buttom{
				margin-top: auto;
				display: flex;
				flex-direction: column;
				padding: 12px;
				background: #FAFAFA;
				border-radius: 8px;
				.el-input-input{
					
				}
				.el-button-butotn{
					align-self: flex-end;
				}
			}
		}
	}

	.order-steps-wrap {
		width: 100%;
		overflow-x: auto;
		overflow-y: hidden;
		padding-bottom: 8px;
		scrollbar-width: none;
		-ms-overflow-style: none;
		cursor: grab;
		user-select: none;
	}

	.order-steps-wrap.is-dragging {
		cursor: grabbing;
	}

	.order-steps-wrap::-webkit-scrollbar {
		display: none;
	}

	.order-steps {
		width: 100%;
	}

	.order-steps-wrap ::v-deep(.el-step) {
		min-width: var(--order-step-item-width);
		flex-shrink: 0;
	}

	.trip-list-card {
		margin-top: 20px;
		margin-bottom: 24px;
	}

	.trip-list-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 12px;
		margin-bottom: 12px;
	}

	.trip-list-title {
		font-size: 15px;
		font-weight: 600;
		color: #303133;
	}

	.trip-list-tip {
		font-size: 12px;
		color: #909399;
	}

	.trip-list-table {
		width: 100%;
	}

	.comment-survey-list {
		display: flex;
		flex-direction: column;
		gap: 8px;
		width: 100%;
	}

	.comment-survey-item {
		display: block;
		width: 100%;
		max-width: 100%;
		padding: 4px 8px;
		line-height: 1.5;
		color: #303133;
		background: #f5f7fa;
		border: 1px solid #e4e7ed;
		border-radius: 4px;
		white-space: normal;
		word-break: break-word;
	}
	
	.map-container {
		width: 100%;
		height: 100%;
		display: flex;
		flex-direction: column;
		background: #f5f7fa;
		border-radius: 8px;
		padding: 12px;
	}
	
	.map-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 15px;
	}
	
	.map-title {
		font-size: 16px;
		font-weight: bold;
		color: #409EFF;
	}
	
	.map-info {
		font-size: 14px;
		color: #606266;
	}
	
	.map-wrapper {
		width: 100% !important;
		height: calc(100% - 40px) !important;
		border-radius: 8px;
		overflow: hidden;
	}
</style>
