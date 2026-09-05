<template>
	<div class="uw-order-button">
		<el-button v-if="btn.replace_btn" plain v-perms="['auth.admin/orderbtn']" @click="openWindow">免费换件</el-button>
		<el-button v-if="orderInfo.type == 6 || orderInfo.type == 7 && orderInfo.order_status > 1" plain v-perms="['auth.admin/orderbtn']" @click="showWordRecord=true">工作记录</el-button>
		<el-button v-if="btn.recieve_btn" v-perms="['auth.admin/orderbtn']"  type="primary" @click="confirmJieDan">接单</el-button>
		<el-button v-if="btn.remote_btn" v-perms="['auth.admin/orderbtn']" type="primary" @click="handleRemote">远程指导</el-button>
		<el-button v-if="btn.go_btn" v-perms="['auth.admin/orderbtn']" type="primary" @click="confirmDepart">{{ departButtonText }}</el-button>
		<el-button v-if="btn.arrive_btn" v-perms="['auth.admin/orderbtn']" type="primary" @click="getTableData">到达</el-button>
		<el-button v-if="btn.complete_btn" v-perms="['auth.admin/orderbtn']" type="primary" @click="downOrder">完成工单</el-button>
		<el-button v-if="btn.end_car_btn" v-perms="['auth.admin/orderbtn']" type="primary" @click="getTableData">结束用车</el-button>
		<el-button v-if="btn.out_btn" v-perms="['auth.admin/orderbtn']" type="primary" @click="downOrder">退场</el-button>
		<el-button v-if="btn.in_btn" v-perms="['auth.admin/orderbtn']" type="primary" @click="showEntryOrder=true">进场</el-button>
		<el-button v-if="btn.audit_btn" v-perms="['auth.admin/ordershenhe']" type="primary" @click="openAudit">审核</el-button>
		<el-button v-if="btn.re_audit_btn" v-perms="['auth.admin/reordershenhe']" type="primary" @click="showReAudit=true">复审</el-button>
		<el-button v-if="btn.send_btn" v-perms="['auth.admin/ordershenhe']" type="primary" @click="dispatchorder(false)">派单</el-button>
		<el-button v-if="btn.re_send_btn" v-perms="['auth.admin/ordershenhe']" type="primary" @click="dispatchorder(true)">转派</el-button>
		<el-button v-if="btn.edit_btn" v-perms="['auth.admin/ordershenhe']" type="primary" @click="downOrder">修改</el-button>
		<el-button
			v-if="Number(btn.change_mileage_btn) === 1"
			v-perms="['auth.admin/orderbtn', 'auth.admin/ordermileageedit']"
			type="primary"
			@click="openChangeMileage"
		>
			更改出发和结束里程
		</el-button>
		<el-button
			v-if="btn.rollback_step_btn"
			v-perms="['auth.admin/orderbtn']"
			type="warning"
			:loading="rollbackLoading"
			@click="confirmRollbackStep"
		>
			撤回
		</el-button>
		
		<!-- 派单|转派 -->
		<uw-order-dispatch v-if="showDispatch" :isReassign="isReassign" :orderInfo="orderInfo" :orderId="orderInfo.id" @change="changeDispatch" @close="showDispatch=false" />
		<!-- 接单 -->
		<uw-accept-orders v-if="showAcceptOrder" :orderInfo="orderInfo" @change="changeAcceptOrder" @close="showAcceptOrder=false"/>
		
		<!-- 完成订单 -->
		<uw-down-order v-if="showOrderStatus" :inspectionInfo="inspectionInfo" :orderInfo="orderInfo" @change="changeDownOrder" @close="showOrderStatus=false"/>
		<!-- 点检工单完成前置步骤  -->
		<uw-downinspection-order v-if="showOrderInspection" :orderInfo="orderInfo" @change="changeDownInspection" @close="showOrderInspection=false" />
		
		<!-- 进场  -->
		<uw-entry-order v-if="showEntryOrder" :orderInfo="orderInfo" @change="changEntryOrder" @close="showEntryOrder=false" />
		
		<!-- 工作记录列表  -->
		<uw-word-recod v-if="showWordRecord" :orderInfo="orderInfo" @close="showWordRecord=false" />
		
		<!-- 通用表单提交 -->
		<el-dialog title="信息完善" v-model="showTablePopup" width="500px">
			<el-form label-width="100">
				<el-form-item v-if="orderInfo.next_step == 3 && orderInfo.type != 10" label="是否用车">
					<el-radio-group v-model="formData.use_car">
						<el-radio label="1">是</el-radio>
						<el-radio label="0">否</el-radio>
					</el-radio-group>
				</el-form-item>
				<el-form-item label="里程数" v-if="orderInfo.next_step == 3 && formData.use_car == '1'">
					<div class="last-mileage">上次结束里程：<span>{{ formatMileageText(orderInfo.last_end_m) }}</span></div>
					<el-input type="number" placeholder="请输入车辆里程数" v-model="formData.start_m" />
					<div class="mileage-tip">请仔细填写里程数，里程数数据将作为核算依据</div>
				</el-form-item>
				<el-form-item label="里程数" v-if="orderInfo.next_step == 6">
					<div class="last-mileage">出车里程：<span>{{ formatMileageText(getMileageValue('start_m')) }}</span></div>
					<el-input type="number" placeholder="请输入车辆里程数" v-model="formData.end_m" />
					<div class="mileage-tip">请仔细填写里程数，里程数数据将作为核算依据</div>
				</el-form-item>
				<el-form-item v-if="orderInfo.next_step == 3 && formData.use_car == '1' " label="车辆外观">
					<material-picker type="image" v-model="formData.car_photos" :limit="9" />
				</el-form-item>
				<el-form-item v-if="(orderInfo.next_step == 3 || orderInfo.next_step == 6) && formData.use_car == '1'" label="里程图片">
					<material-picker type="image" v-model="formData.mileage_photos" :limit="9" />
				</el-form-item>
				
				
				<div v-for="item in tableData" :key="item.id">
					<h1 v-if="item.is_cate" class="mb-[32px]">{{item.name}}</h1>
					<uwCeateOrderForm v-if="item.is_cate" :row="row" v-for="row in item.son" />
					<uwCeateOrderForm v-else :row="item" />
				</div>
			</el-form>
			<template #footer>
				<span class="dialog-footer">
					<el-button @click="showTablePopup = false">取 消</el-button>
					<el-button :loading="loading" type="primary" @click="submit">确 定</el-button>
				</span>
			</template>
		</el-dialog>
		<!-- 订单审核弹窗 -->
		<el-dialog title="订单审核" v-model="showAudit" width="500px">
			<el-form label-width="100">
				<el-form-item label="审核结果">
					<el-radio-group v-model="authFormData.audit_status" @change="changeAuditStatus">
						<el-radio label="2">审核通过</el-radio>
						<el-radio label="3">审核驳回</el-radio>
					</el-radio-group>
				</el-form-item>
				<el-form-item label="核实里程" v-if="authFormData.audit_status == '2' && hasHistoricalCarTrips && orderInfo.repair_type != 2">
					<el-input
						type="number"
						placeholder="默认回填累计公里数，可手动修改"
						v-model="authFormData.audit_m"
						@input="handleAuditMileageInput"
					/>
					<div class="mileage-detail">
						<span>累计公里数：{{ totalMileageText }}</span>
						<span v-if="showTripMileageTip">总里程为各趟已结束用车里程累计</span>
					</div>
				</el-form-item>
				<el-form-item
					v-if="showAuditTripMileageList"
					label="趟次里程"
				>
					<div class="audit-trip-list">
						<div
							v-for="item in auditTripRenderList"
							:key="item.optionKey"
							class="audit-trip-card"
						>
							<div class="audit-trip-head">
								<span class="audit-trip-title">{{ getTripOptionLabel(item) }}</span>
								<span v-if="item.status_desc" class="audit-trip-status">{{ item.status_desc }}</span>
							</div>
							<div v-if="!showAuditTripEditorEnabled || !item.editable" class="audit-trip-row">
								<span>开始里程：{{ formatMileageText(item.start_m) }}</span>
								<span>结束里程：{{ formatMileageText(item.end_m) }}</span>
							</div>
							<div v-else class="audit-trip-inputs">
								<el-input
									type="number"
									placeholder="请输入开始里程"
									v-model="item.edit_start_m"
								/>
								<el-input
									type="number"
									placeholder="请输入结束里程"
									v-model="item.edit_end_m"
								/>
							</div>
							<div v-if="showAuditTripEditorEnabled && !item.editable" class="audit-trip-edit-tip">未结束趟次不可编辑</div>
							<div v-if="item.startPhotos.length" class="audit-trip-photo-block">
								<div class="audit-trip-photo-label">开始里程图片</div>
								<div class="audit-mileage-photos">
									<el-image
										v-for="img in item.startPhotos"
										:key="img"
										:src="img"
										:preview-src-list="item.startPhotos"
										preview-teleported
										fit="cover"
										class="audit-mileage-photo"
									/>
								</div>
							</div>
							<div v-if="item.endPhotos.length" class="audit-trip-photo-block">
								<div class="audit-trip-photo-label">结束里程图片</div>
								<div class="audit-mileage-photos">
									<el-image
										v-for="img in item.endPhotos"
										:key="img"
										:src="img"
										:preview-src-list="item.endPhotos"
										preview-teleported
										fit="cover"
										class="audit-mileage-photo"
									/>
								</div>
							</div>
						</div>
					</div>
				</el-form-item>
				<div v-if="showAuditTripEditorEnabled && !canEditAuditTripMileage" class="mileage-tip mileage-tip--plain">仅已结束且存在趟次 ID 的趟次支持编辑</div>
				<div v-else-if="showAuditTripEditorEnabled" class="audit-trip-edit-tip">仅允许编辑已结束的趟次，提交后仍以后端校验结果为准</div>
				<el-form-item label="核实工时" v-if="authFormData.audit_status == '2' && (orderInfo.type == 1 || orderInfo.type == 4) && orderInfo.repair_type != 2">
					<el-input type="number" placeholder="请输入核实工时" v-model="authFormData.audit_hour" />
				</el-form-item>
				<el-form-item label="核实方量" v-if="authFormData.audit_status == '2' && orderInfo.type == 6 && orderInfo.repair_type != 2">
					<div v-if="workVolumeSummary.length" class="work-volume-summary__inputs">
						<div v-for="item in authFormData.audit_num_list" :key="item.key" class="work-volume-summary__input-row">
							<span>{{ item.name }}</span>
							<el-input type="number" placeholder="请输入核实方量" v-model="item.value" />
						</div>
					</div>
					<el-input v-else type="number" placeholder="请输入核实方量" v-model="authFormData.audit_num" />
					<div v-if="workVolumeLoading" class="work-volume-summary__loading">正在汇总工作记录方量...</div>
					<div v-else-if="workVolumeSummary.length" class="work-volume-summary">
						<div class="work-volume-summary__title">工作记录方量汇总</div>
						<div v-for="item in workVolumeSummary" :key="item.key" class="work-volume-summary__row">
							<span>{{ item.name }}</span>
							<span>{{ formatVolume(item.total) }}</span>
						</div>
						<div class="work-volume-summary__total">
							<span>方量合计</span>
							<span>{{ formatVolume(workVolumeTotal) }}</span>
						</div>
					</div>
				</el-form-item>
				<el-form-item label="审核备注" v-if="authFormData.audit_status">
					<el-input type="textarea" placeholder="请输入审核备注" v-model="authFormData.audit_msg" />
				</el-form-item>
			</el-form>
			<template #footer>
				<span class="dialog-footer">
					<el-button @click="showAudit = false">取 消</el-button>
					<el-button :loading="loading" type="primary" @click="submitAudit">确 定</el-button>
				</span>
			</template>
		</el-dialog>
		<!-- 订单复审弹窗 -->
		<el-dialog title="订单复审" v-model="showReAudit" width="500px">
			<el-form label-width="100">
				<el-form-item label="复审结果">
					<el-radio-group v-model="reAuditFormData.audit_status">
						<el-radio label="2">复审通过</el-radio>
						<el-radio label="3">复审驳回</el-radio>
					</el-radio-group>
				</el-form-item>
				<el-form-item label="复审备注" v-if="reAuditFormData.audit_status">
					<el-input type="textarea" placeholder="请输入复审备注" v-model="reAuditFormData.audit_msg" />
				</el-form-item>
			</el-form>
			<template #footer>
				<span class="dialog-footer">
					<el-button @click="showReAudit = false">取 消</el-button>
					<el-button :loading="loading" type="primary" @click="submitReAudit">确 定</el-button>
				</span>
			</template>
		</el-dialog>
		<el-dialog title="更改出发和结束里程" v-model="showChangeMileage" width="500px">
			<el-form label-width="100">
				<el-form-item label="用车趟次">
					<el-select
						v-model="selectedMileageTripKey"
						placeholder="请选择用车趟次"
						style="width: 100%;"
						@change="handleChangeMileageTripChange"
					>
						<el-option
							v-for="item in mileageTripOptions"
							:key="item.optionKey"
							:label="getTripOptionLabel(item)"
							:value="item.optionKey"
						/>
					</el-select>
					<div v-if="selectedMileageTrip" class="mileage-detail">
						<span>车牌：{{ formatMileageText(selectedMileageTrip.car_code) }}</span>
						<span>状态：{{ formatMileageText(selectedMileageTrip.status_desc) }}</span>
					</div>
				</el-form-item>
				<el-form-item label="出发里程">
					<el-input type="number" placeholder="请输入出发里程" v-model="changeMileageFormData.start_m" />
				</el-form-item>
				<el-form-item label="结束里程">
					<el-input type="number" placeholder="请输入结束里程" v-model="changeMileageFormData.end_m" />
				</el-form-item>
				<div v-if="showTripMileageTip" class="mileage-tip mileage-tip--plain">总里程为各趟已结束用车里程累计</div>
			</el-form>
			<template #footer>
				<span class="dialog-footer">
					<el-button @click="showChangeMileage = false">取 消</el-button>
					<el-button :loading="changeMileageLoading" type="primary" @click="submitChangeMileage">确 定</el-button>
				</span>
			</template>
		</el-dialog>
	</div>
</template>

<script setup lang="ts">
	import { computed, reactive, ref, watch } from 'vue';
	import { useRouter } from 'vue-router';
	import { getOrderForm , orderGo , orderArrive , orderEndCar , auditOrder , reAuditOrder, orderRemote, orderChangeMileage, rollbackStep, getOrderWorkList } from '@/api/order/order';
	import { ElMessage, ElMessageBox } from 'element-plus'
	import uwOrderDispatch from './uw-order-dispatch.vue'
	import uwAcceptOrders from './uw-accept-orders.vue';
	import uwCeateOrderForm from './uw-create-order-form.vue';
	import uwDownOrder from './uw-down-order.vue';
	import uwDowninspectionOrder from './uw-downinspection-order.vue';
	import uwEntryOrder from './uw-entry-order.vue';
	import uwWordRecod from './uw-word-recod.vue';
	const router = useRouter()
	const prop = defineProps({
		btn:{
			type: Object,
			default: ()=>{}
		},
		orderInfo:{
			type: Object,
			default: ()=>{}
		}
	})
	const emit = defineEmits(['change'])
	type MileageTripItem = {
		optionKey: string
		id: string | number | null
		trip_no: string | number | null
		car_code: string
		start_m: any
		end_m: any
		total_m: any
		status_desc: string
		status?: string | number | null
	}
	type AuditTripMileageItem = MileageTripItem & {
		startPhotos: string[]
		endPhotos: string[]
	}
	type AuditTripEditItem = AuditTripMileageItem & {
		trip_id: string | number | null
		edit_start_m: string
		edit_end_m: string
		editable: boolean
	}
	type WorkVolumeSummaryItem = {
		key: string
		name: string
		total: number
	}
	type AuditNumItem = {
		key: string
		name: string
		value: string | number
	}
	const formData = reactive({
		id:'',
		use_car:'1',
		start_m:'',
		form_data:[] as any[],
		type:'',
		end_m:'',
		car_photos:[] as any[],
		mileage_photos:[] as any[]
	})
	const authFormData = reactive({
		order_id:"",
		audit_status:"",
		audit_msg:'',
		audit_m:'',
		start_m:'',
		end_m:'',
		audit_hour:'',
		audit_num:'',
		audit_num_list: [] as AuditNumItem[]
	})
	const reAuditFormData = reactive({
		order_id:"",
		audit_status:"",
		audit_msg:''
	})
	const selectedMileageTripKey = ref('')
	const changeMileageFormData = reactive({
		id: '',
		start_m: '',
		end_m: ''
	})
	const auditTripEditList = ref<AuditTripEditItem[]>([])
	const auditMileageManualOverride = ref(false)
	const showWordRecord = ref(false)
	const showEntryOrder = ref(false)
	const showAudit = ref(false)
	const showReAudit = ref(false)
	const showChangeMileage = ref(false)
	const showOrderInspection = ref(false)
	const showOrderStatus = ref(false)
	const loading = ref(false)
	const changeMileageLoading = ref(false)
    const rollbackLoading = ref(false)
	const tableData = ref<any>([])
	const showTablePopup = ref(false)
	const showAcceptOrder = ref(false)
	const isReassign = ref(false)
	const showDispatch = ref(false)
	const inspectionInfo = ref<any[]>([])
	const workVolumeSummary = ref<WorkVolumeSummaryItem[]>([])
	const workVolumeLoading = ref(false)
	const departButtonText = computed(() => (prop.btn?.remote_btn ? '确认出发' : '出发'))
	const auditPassMsg = '资料核验无误，审核予以通过'
	const rawCarTripList = computed(() => Array.isArray(prop.orderInfo?.car_trip_list) ? prop.orderInfo.car_trip_list : [])
	const hasHistoricalCarTrips = computed(() => rawCarTripList.value.length > 0)
	const showTripMileageTip = computed(() => rawCarTripList.value.length > 0)
	const mileageTripOptions = computed<MileageTripItem[]>(() => {
		const tripList = rawCarTripList.value
		if (tripList.length) {
			return tripList.map((item: any, index: number) => ({
				optionKey: String(item?.id ?? item?.trip_id ?? item?.trip_no ?? index),
				id: item?.id ?? item?.trip_id ?? null,
				trip_no: item?.trip_no ?? index + 1,
				car_code: item?.car_code ?? '',
				start_m: item?.start_m ?? '',
				end_m: item?.end_m ?? '',
				total_m: item?.total_m ?? '',
				status_desc: item?.status_desc ?? '',
				status: item?.status ?? null
			}))
		}
		const hasMileageSnapshot = hasValue(prop.orderInfo?.start_m) || hasValue(prop.orderInfo?.end_m) || hasValue(prop.orderInfo?.total_m)
		if (!hasMileageSnapshot) {
			return []
		}
		return [{
			optionKey: 'default',
			id: null,
			trip_no: prop.orderInfo?.trip_no ?? 1,
			car_code: prop.orderInfo?.car_code ?? '',
			start_m: getMileageValue('start_m'),
			end_m: getMileageValue('end_m'),
			total_m: getTotalMileageValue(),
			status_desc: prop.orderInfo?.status_desc ?? prop.orderInfo?.engineer_status_desc ?? '',
			status: prop.orderInfo?.status ?? null
		}]
	})
	const selectedMileageTrip = computed(() => {
		return mileageTripOptions.value.find((item) => item.optionKey === selectedMileageTripKey.value) || null
	})
	const tripStartLogs = computed(() => getTripMileageLogs(3, 'start_m'))
	const tripEndLogs = computed(() => getTripMileageLogs(6, 'end_m'))
	const auditTripMileageList = computed<AuditTripMileageItem[]>(() => {
		return mileageTripOptions.value.map((trip, index) => {
			const startLog = tripStartLogs.value[index]
			const endLog = tripEndLogs.value[index]
			const startPhotos = getTripPhotoList(trip, startLog, 'start')
			const endPhotos = getTripPhotoList(trip, endLog, 'end')
			return {
				...trip,
				start_m: hasValue(trip.start_m) ? trip.start_m : startLog?.extra_data?.start_m ?? startLog?.start_m ?? '',
				end_m: hasValue(trip.end_m) ? trip.end_m : endLog?.extra_data?.end_m ?? endLog?.end_m ?? '',
				startPhotos,
				endPhotos
			}
		})
	})
	const auditTripRenderList = computed(() => {
		if (auditTripEditList.value.length) {
			return auditTripEditList.value
		}
		return auditTripMileageList.value.map(createAuditTripEditItem)
	})
	const editableAuditTripList = computed(() => {
		return auditTripEditList.value.filter((item) => item.editable)
	})
	const canEditAuditTripMileage = computed(() => editableAuditTripList.value.length > 0)
	const changedAuditTripList = computed(() => {
		return auditTripEditList.value.filter((item) => item.editable && isAuditTripMileageChanged(item))
	})
	const calculatedAuditMileage = computed(() => {
		if (!auditTripRenderList.value.length) {
			return getDefaultAuditMileage()
		}
		const totalMileage = getAuditTripTotalMileage(auditTripRenderList.value)
		return totalMileage === '' ? getDefaultAuditMileage() : totalMileage
	})
	const totalMileageText = computed(() => formatMileageText(calculatedAuditMileage.value))
	const workVolumeTotal = computed(() => workVolumeSummary.value.reduce((total, item) => total + item.total, 0))
	const auditNumTotal = computed(() => authFormData.audit_num_list.reduce((total, item) => {
		const value = Number(item.value)
		return Number.isFinite(value) ? total + value : total
	}, 0))
	const showAuditTripMileageList = computed(() => {
		return authFormData.audit_status == '2'
			&& hasHistoricalCarTrips.value
			&& prop.orderInfo.repair_type != 2
			&& auditTripMileageList.value.length > 0
	})
	const showAuditTripEditorEnabled = computed(() => {
		return authFormData.audit_status == '2'
			&& hasHistoricalCarTrips.value
			&& prop.orderInfo.repair_type != 2
			&& rawCarTripList.value.length > 0
	})
	
	const openWindow = () => {
		router.push({
			path:'addclothes',
			query:{
				order_id:prop.orderInfo.id
			}
		})
	}

	const openChangeMileage = () => {
		if (!mileageTripOptions.value.length) {
			ElMessage.warning('当前工单暂无可编辑的用车趟次')
			return
		}
		const defaultTrip = mileageTripOptions.value[0]
		changeMileageFormData.id = prop.orderInfo.id
		selectedMileageTripKey.value = defaultTrip.optionKey
		syncChangeMileageForm(defaultTrip)
		showChangeMileage.value = true
	}
	
	const openAudit = () => {
		auditMileageManualOverride.value = false
		workVolumeSummary.value = []
		authFormData.order_id = prop.orderInfo.id
		authFormData.audit_status = prop.orderInfo.audit_status || ''
		authFormData.audit_msg = prop.orderInfo.audit_msg || ''
		authFormData.start_m = getEditableMileageValue('start_m')
		authFormData.end_m = getEditableMileageValue('end_m')
		authFormData.audit_m = getDefaultAuditMileage()
				authFormData.audit_hour = prop.orderInfo.audit_hour || ''
			authFormData.audit_num = prop.orderInfo.audit_num || ''
		const savedAuditNumList = Array.isArray(prop.orderInfo.audit_num_list)
			? prop.orderInfo.audit_num_list
			: [...(prop.orderInfo.log_list || [])].reverse().find((item: any) => Array.isArray(item?.extra_data?.audit_num_list))?.extra_data?.audit_num_list
		authFormData.audit_num_list = Array.isArray(savedAuditNumList)
			? savedAuditNumList.map((item: any) => ({ key: String(item.key || item.name), name: String(item.name || item.key), value: item.value ?? '' }))
			: []
		resetAuditTripEditState()
		changeAuditStatus(authFormData.audit_status)
		showAudit.value = true
		if (Number(prop.orderInfo.type) === 6) {
			loadWorkVolumeSummary()
		}
	}

	const changeAuditStatus = (value: string | number | boolean | undefined) => {
		if (value == 2) {
			authFormData.audit_msg = auditPassMsg
			if (authFormData.audit_m === '') {
				authFormData.audit_m = getDefaultAuditMileage()
			}
			if (Number(prop.orderInfo.type) === 6 && workVolumeSummary.value.length) {
				authFormData.audit_num_list = workVolumeSummary.value.map((item) => {
					const current = authFormData.audit_num_list.find((savedItem) => savedItem.key === item.key)
					return {
						key: item.key,
						name: item.name,
						value: current && current.value !== '' && current.value !== null && current.value !== undefined
							? current.value
							: formatVolume(item.total)
					}
				})
				if (authFormData.audit_num === '' || authFormData.audit_num === null || authFormData.audit_num === undefined) {
					authFormData.audit_num = formatVolume(workVolumeTotal.value)
				}
			}
			return
		}
		if (value == 3) {
			authFormData.audit_msg = ''
		}
	}

	const hasValue = (value: any) => value !== undefined && value !== null && value !== ''

	const getMileageValue = (field: 'start_m' | 'end_m') => {
		const extraData = prop.orderInfo?.extra_data || {}
		if (hasValue(extraData[field])) {
			return extraData[field]
		}
		if (hasValue(prop.orderInfo?.[field])) {
			return prop.orderInfo[field]
		}
		const step = field === 'start_m' ? 3 : 6
		const log = prop.orderInfo?.log_list?.find((item: any) => Number(item.step) === step && hasValue(item.extra_data?.[field]))
		return log?.extra_data?.[field] ?? ''
	}

	const getTotalMileageValue = () => {
		const extraData = prop.orderInfo?.extra_data || {}
		if (hasValue(extraData.total_m)) {
			return extraData.total_m
		}
		if (hasValue(prop.orderInfo?.total_m)) {
			return prop.orderInfo.total_m
		}
		return getAuditMileage()
	}

	const getDefaultAuditMileage = () => {
		const auditMileage = Number(prop.orderInfo?.audit_m)
		if (hasValue(prop.orderInfo?.audit_m) && Number.isFinite(auditMileage) && auditMileage > 0) {
			return String(prop.orderInfo.audit_m)
		}
		const totalMileage = getTotalMileageValue()
		return hasValue(totalMileage) ? String(totalMileage) : ''
	}

	const getMediaList = (value: any) => {
		if (Array.isArray(value)) {
			return value
				.map(item => {
					if (typeof item === 'string') return item.trim()
					return item?.url || item?.tempFilePath || item?.path || ''
				})
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
	const getTripPhotoKeys = (field: 'start' | 'end') => {
		return field === 'start'
			? ['start_mileage_photos', 'start_mileage_photo', 'start_m_photos', 'start_m_photo', 'start_photos', 'mileage_photos']
			: ['end_mileage_photos', 'end_mileage_photo', 'end_m_photos', 'end_m_photo', 'end_photos', 'mileage_photos']
	}
	const getPhotoListFromSource = (source: any, field: 'start' | 'end') => {
		for (const key of getTripPhotoKeys(field)) {
			const photos = getMediaList(source?.[key] ?? source?.extra_data?.[key])
			if (photos.length) {
				return photos
			}
		}
		return []
	}
	const getTripMileageLogs = (step: number, field: 'start_m' | 'end_m') => {
		const logs = Array.isArray(prop.orderInfo?.log_list) ? prop.orderInfo.log_list : []
		return logs.filter((item: any) => {
			return Number(item.step) === step
				&& (hasValue(item?.extra_data?.[field]) || hasValue(item?.[field]) || getPhotoListFromSource(item, field === 'start_m' ? 'start' : 'end').length > 0)
		})
	}
	const getTripPhotoList = (trip: MileageTripItem, log: any, field: 'start' | 'end') => {
		const tripPhotos = getPhotoListFromSource(trip, field)
		if (tripPhotos.length) {
			return tripPhotos
		}
		return getPhotoListFromSource(log, field)
	}

	const getEditableMileageValue = (field: 'start_m' | 'end_m') => {
		const auditField = field === 'start_m' ? 'audit_start_m' : 'audit_end_m'
		if (hasValue(prop.orderInfo?.[auditField])) {
			return prop.orderInfo[auditField]
		}
		return getMileageValue(field)
	}

	const getMileageNumber = (value: any) => {
		if (value === undefined || value === null || value === '') return null
		const number = Number(value)
		return Number.isFinite(number) ? number : null
	}
	const getTripMileageDelta = (startValue: any, endValue: any) => {
		const startMileage = getMileageNumber(startValue)
		const endMileage = getMileageNumber(endValue)
		if (startMileage === null || endMileage === null) return null
		return Math.round((endMileage - startMileage) * 100) / 100
	}

	const formatMileageText = (value: any) => {
		return value === undefined || value === null || value === '' ? '--' : value
	}

	const getAuditMileage = (startValue = getMileageValue('start_m'), endValue = getMileageValue('end_m')) => {
		const mileage = getTripMileageDelta(startValue, endValue)
		return mileage === null ? '' : String(mileage)
	}
	const getAuditTripTotalMileage = (tripList: AuditTripEditItem[]) => {
		let totalMileage = 0
		let hasValidTrip = false
		for (const trip of tripList) {
			const currentStartMileage = trip.editable ? trip.edit_start_m : trip.start_m
			const currentEndMileage = trip.editable ? trip.edit_end_m : trip.end_m
			if (!isFinishedTrip({
				...trip,
				start_m: currentStartMileage,
				end_m: currentEndMileage
			})) {
				continue
			}
			const tripMileage = getTripMileageDelta(currentStartMileage, currentEndMileage)
			if (tripMileage === null) {
				continue
			}
			totalMileage += tripMileage
			hasValidTrip = true
		}
		return hasValidTrip ? String(Math.round(totalMileage * 100) / 100) : ''
	}

	const normalizeMileageInput = (value: any) => String(value ?? '').trim()
	const isFinishedTrip = (trip: Partial<MileageTripItem>) => {
		const statusDesc = String(trip.status_desc ?? '').trim()
		return hasValue(trip.end_m)
			|| statusDesc.includes('结束')
			|| statusDesc.includes('完成')
	}
	const getTripOptionLabel = (trip: MileageTripItem) => {
		const tripNoText = trip.trip_no === undefined || trip.trip_no === null || trip.trip_no === '' ? '--' : `第${trip.trip_no}趟`
		const carCodeText = formatMileageText(trip.car_code)
		return `${tripNoText} / ${carCodeText}`
	}
	const createAuditTripEditItem = (trip: AuditTripMileageItem): AuditTripEditItem => {
		return {
			...trip,
			trip_id: trip.id,
			edit_start_m: formatMileageInputValue(trip.start_m),
			edit_end_m: formatMileageInputValue(trip.end_m),
			editable: hasValue(trip.id) && isFinishedTrip(trip)
		}
	}
	const resetAuditTripEditState = () => {
		auditTripEditList.value = auditTripMileageList.value.map(createAuditTripEditItem)
	}
	const syncChangeMileageForm = (trip: MileageTripItem | null) => {
		changeMileageFormData.start_m = trip ? formatMileageInputValue(trip.start_m) : ''
		changeMileageFormData.end_m = trip ? formatMileageInputValue(trip.end_m) : ''
	}
	const handleChangeMileageTripChange = (value: string) => {
		const trip = mileageTripOptions.value.find((item) => item.optionKey === value) || null
		syncChangeMileageForm(trip)
	}
	const formatMileageInputValue = (value: any) => {
		return hasValue(value) ? String(value) : ''
	}
	const handleAuditMileageInput = () => {
		auditMileageManualOverride.value = true
	}
	const isAuditTripMileageChanged = (trip: AuditTripEditItem) => {
		return normalizeMileageInput(trip.edit_start_m) !== formatMileageInputValue(trip.start_m)
			|| normalizeMileageInput(trip.edit_end_m) !== formatMileageInputValue(trip.end_m)
	}

	const validateMileageInput = (label: string, value: any) => {
		const inputValue = normalizeMileageInput(value)
		if (!inputValue) {
			ElMessage.error(`请填写${label}`)
			return false
		}
		const mileage = Number(inputValue)
		if (!Number.isFinite(mileage)) {
			ElMessage.error(`${label}请输入数字`)
			return false
		}
		if (mileage < 0) {
			ElMessage.error(`${label}不能小于0`)
			return false
		}
		return true
	}
	const validateAuditTripMileage = (trip: AuditTripEditItem) => {
		const tripLabel = getTripOptionLabel(trip)
		if (!validateMileageInput(`${tripLabel}出发里程`, trip.edit_start_m)) {
			return false
		}
		if (!validateMileageInput(`${tripLabel}结束里程`, trip.edit_end_m)) {
			return false
		}
		const startMileage = Number(normalizeMileageInput(trip.edit_start_m))
		const endMileage = Number(normalizeMileageInput(trip.edit_end_m))
		if (endMileage < startMileage) {
			ElMessage.error(`${tripLabel}结束里程不能小于出发里程`)
			return false
		}
		return true
	}
	const buildAuditTripMileagePayload = () => {
		if (!showAuditTripEditorEnabled.value) {
			return {}
		}
		const changedTripList = changedAuditTripList.value
		if (!changedTripList.length) {
			return {}
		}
		if (changedTripList.length === 1) {
			const trip = changedTripList[0]
			if (!hasValue(trip.trip_id)) {
				ElMessage.error('当前趟次缺少 trip_id，无法提交里程修改')
				return false
			}
			if (!validateAuditTripMileage(trip)) {
				return false
			}
			return {
				trip_id: trip.trip_id,
				start_m: normalizeMileageInput(trip.edit_start_m),
				end_m: normalizeMileageInput(trip.edit_end_m)
			}
		}
		const trip_list: Array<Record<string, any>> = []
		for (const trip of changedTripList) {
			if (!hasValue(trip.trip_id)) {
				ElMessage.error(`${getTripOptionLabel(trip)}缺少 trip_id，无法提交`)
				return false
			}
			if (!validateAuditTripMileage(trip)) {
				return false
			}
			trip_list.push({
				trip_id: trip.trip_id,
				start_m: normalizeMileageInput(trip.edit_start_m),
				end_m: normalizeMileageInput(trip.edit_end_m)
			})
		}
		return { trip_list }
	}
	watch(
		[() => authFormData.audit_status, calculatedAuditMileage],
		([auditStatus, mileageValue]) => {
			if (String(auditStatus) !== '2' || auditMileageManualOverride.value) {
				return
			}
			authFormData.audit_m = hasValue(mileageValue) ? String(mileageValue) : getDefaultAuditMileage()
		},
		{ immediate: true }
	)

	const submitChangeMileage = async () => {
		const selectedTrip = selectedMileageTrip.value
		if (!selectedTrip) {
			ElMessage.error('请选择用车趟次')
			return
		}
		if (!validateMileageInput('出发里程', changeMileageFormData.start_m)) return
		if (!validateMileageInput('结束里程', changeMileageFormData.end_m)) return

		changeMileageLoading.value = true
		try {
			const params: Record<string, any> = {
				id: changeMileageFormData.id,
				start_m: normalizeMileageInput(changeMileageFormData.start_m),
				end_m: normalizeMileageInput(changeMileageFormData.end_m)
			}
			if (hasValue(selectedTrip.id)) {
				params.trip_id = selectedTrip.id
			}
			await orderChangeMileage(params)
			ElMessage.success('操作成功')
			showChangeMileage.value = false
			emit('change')
		} catch {
		} finally {
			changeMileageLoading.value = false
		}
	}
	
	const dispatchorder = (value: boolean) => {
		isReassign.value = value
		showDispatch.value = true
	}
	const changeDispatch = () => {
		showDispatch.value = false
		emit('change')
	}
	const confirmJieDan = () => {
		showAcceptOrder.value = true
	}
	const handleRemote = async () => {
		await orderRemote({
			id: prop.orderInfo.id
		})
		ElMessage.success('操作成功')
		emit('change')
	}
    const confirmRollbackStep = async () => {
        let reason = ''
        try {
            const { value } = await ElMessageBox.prompt('请输入撤回备注', '撤回工单', {
                confirmButtonText: '确定撤回',
                cancelButtonText: '取消',
                inputType: 'textarea',
                inputPlaceholder: '请输入撤回备注',
                inputValidator: (value) => value?.trim() ? true : '请输入撤回备注',
                type: 'warning',
            })
            reason = value.trim()
        } catch {
            // 取消或关闭弹窗时不处理
            return
        }
        await submitRollbackStep(reason)
    }
    const submitRollbackStep = async (reason = '') => {
        reason = reason.trim()
        if (!reason) {
            ElMessage.error('请输入撤回备注')
            return
        }
        rollbackLoading.value = true
        try {
            await rollbackStep({
                id: prop.orderInfo.id,
                reason,
            })
            ElMessage.success('操作成功')
            emit('change')
        } finally {
            rollbackLoading.value = false
        }
    }
	const changeAcceptOrder = () => {
		showAcceptOrder.value = false
		emit('change')
	}
	const formatVolume = (value: any) => {
		const numberValue = Number(value)
		if (!Number.isFinite(numberValue)) return '0'
		return numberValue.toFixed(2).replace(/\.00$/, '').replace(/(\.\d)0$/, '$1')
	}
	const loadWorkVolumeSummary = async () => {
		if (Number(prop.orderInfo?.type) !== 6) return

		workVolumeLoading.value = true
		try {
			const pageSize = 100
			let pageNo = 1
			let totalCount = 0
			const summaryMap = new Map<string, WorkVolumeSummaryItem>()

			while (true) {
				const result = await getOrderWorkList({
					id: prop.orderInfo.id,
					page_no: pageNo,
					page_size: pageSize
				})
				const lists = Array.isArray(result?.lists) ? result.lists : []
				totalCount = Number(result?.count || 0)

				lists.forEach((record: any) => {
					const extraData = Array.isArray(record?.extra_data) ? record.extra_data : []
					extraData.forEach((item: any) => {
						const name = String(item?.name || '').trim()

						const value = Number(String(item?.value ?? '').replace(/,/g, '').trim())
						if (!Number.isFinite(value)) return

						const key = String(item?.key || name)
						const current = summaryMap.get(key)
						if (current) {
							current.total += value
						} else {
							summaryMap.set(key, { key, name, total: value })
						}
					})
				})

				if (!lists.length || lists.length < pageSize || pageNo * pageSize >= totalCount) break
				pageNo += 1
			}

			workVolumeSummary.value = Array.from(summaryMap.values())
			const savedValues = new Map(authFormData.audit_num_list.map((item) => [item.key, item.value]))
			authFormData.audit_num_list = workVolumeSummary.value.map((item) => ({
				key: item.key,
				name: item.name,
				value: savedValues.has(item.key) ? savedValues.get(item.key)! : formatVolume(item.total)
			}))
			if (String(authFormData.audit_status) === '2' && workVolumeSummary.value.length) {
				if (authFormData.audit_num === '' || authFormData.audit_num === null || authFormData.audit_num === undefined) {
					authFormData.audit_num = formatVolume(workVolumeTotal.value)
				}
			}
		} catch {
			workVolumeSummary.value = []
			ElMessage.warning('工作记录方量汇总失败，请手动填写核实方量')
		} finally {
			workVolumeLoading.value = false
		}
	}
	const changeDownOrder = () => {
		showOrderStatus.value = false
		showOrderInspection.value = false
		emit('change')
	}
	const changeDownInspection = (data:any[]) => {
		inspectionInfo.value = data
		showOrderStatus.value = true
	}
	const changEntryOrder = () => {
		showEntryOrder.value = false
		emit('change')
	}
	const downOrder = () => {
		const {repair_type,type,audit_status} = prop.orderInfo
		if(type == 2){
			showOrderInspection.value = true
			return
		}
		if((type == 1 || type == 4) && repair_type != 2){
			showOrderStatus.value = true
		}else{
			// 远程指导完成订单
			if(repair_type == 2){
				showOrderStatus.value = true
			}else{
				showOrderStatus.value = true
			}
		}
	}
	
	const submitAudit = async () => {
		authFormData.order_id = prop.orderInfo.id
		if(!authFormData.audit_status) return ElMessage.error('请选择审核结果')
		if(authFormData.audit_status == '3' &&!authFormData.audit_msg) return ElMessage.error('请填写审核备注')
		
		if(authFormData.audit_status == '2' && hasHistoricalCarTrips.value && authFormData.audit_m === '' && prop.orderInfo.repair_type != 2) return ElMessage.error('请确认核实里程')
		if(authFormData.audit_status == '2' && (prop.orderInfo.type == 1 || prop.orderInfo.type == 4) && !authFormData.audit_hour && prop.orderInfo.repair_type != 2) return ElMessage.error('请填写核实工时')
		if(authFormData.audit_status == '2' && prop.orderInfo.type == 6 && prop.orderInfo.repair_type != 2) {
			if (authFormData.audit_num_list.length) {
				if (authFormData.audit_num_list.some((item) => item.value === '' || item.value === null || item.value === undefined)) return ElMessage.error('请填写核实方量')
			} else if (!authFormData.audit_num) {
				return ElMessage.error('请填写核实方量')
			}
		}
		const tripMileagePayload = authFormData.audit_status == '2' ? buildAuditTripMileagePayload() : {}
		if (tripMileagePayload === false) return
		
		const payload: Record<string, any> = {
			order_id: authFormData.order_id,
			audit_status: authFormData.audit_status,
			audit_msg: authFormData.audit_msg,
			audit_m: authFormData.audit_m,
			audit_hour: authFormData.audit_hour,
			audit_num: authFormData.audit_num_list.length ? formatVolume(auditNumTotal.value) : authFormData.audit_num,
			audit_num_list: authFormData.audit_num_list
		}
		Object.assign(payload, tripMileagePayload)
		loading.value = true
		try{
			await auditOrder(payload)
			ElMessage.success('操作成功')
			showAudit.value = false
			loading.value = false
			emit('change')
		} catch(err){
			loading.value = false
		}
	}
	
	const submitReAudit = async () => {
		reAuditFormData.order_id = prop.orderInfo.id
		if(!reAuditFormData.audit_status) return ElMessage.error('请选择复审结果')
		if(!reAuditFormData.audit_msg) return ElMessage.error('请填写复审备注')
		loading.value = true
		try{
			await reAuditOrder(reAuditFormData)
			ElMessage.success('操作成功')
			showReAudit.value = false
			loading.value = false
			emit('change')
		} catch(err){
			loading.value = false
		}
	}
	
	/**confirmDepart 出发*/
	const confirmDepart = () => {
		ElMessageBox.confirm(prop.orderInfo.safe_desc, '安全须知', {
			confirmButtonText: '确定',
			cancelButtonText: '取消',
			type: 'warning',
		}).then(() => {
			getTableData()
		})
	}
	const getTableData = async () => {
		const { next_step , type } = prop.orderInfo
		tableData.value = await getOrderForm({
			type:type,
			step:next_step
		})
		if(tableData.value.length == 0 && next_step != 3 && next_step !=6){
			submit()
		}else{
			showTablePopup.value = true
		}
	}
	const submit = async () => {
		formData.id = prop.orderInfo.id
		const { next_step , order_status } = prop.orderInfo
		formData.form_data = normalizeImageValue(tableData.value)
		try{
			// 确认出发步骤
			if(next_step == 3 && order_status == 2){
				if(formData.use_car == '1' && !formData.start_m) return ElMessage.error('请填写车辆当前里程数')
				loading.value = true
				await orderGo(formData)
			}
			// 到达步骤
			if(next_step == 4 && order_status == 2){
				loading.value = true
				await orderArrive(formData)
			}
			if(next_step == 6 && order_status == 2){
				loading.value = true
				await orderEndCar(formData)
			}
			ElMessage.success('操作成功')
			showTablePopup.value = false
			loading.value = false
			emit('change')
		} catch(err){
			loading.value = false
		}
	}
	
	function normalizeImageValue(list: any[]) {
	    return list.map((item: any) => {
	        // 情况 1：分类节点，处理 son
	        if (item.is_cate === true && Array.isArray(item.son)) {
	            return {
	                ...item,
	                son: item.son.map((field: any) => {
	                    if (Array.isArray(field.value)) {
	                        return {
	                            ...field,
	                            value: field.value.join(',')
	                        }
	                    }
	                    return field
	                })
	            }
	        }

	        // 情况 2：普通字段，直接处理当前层
	        if (item.is_cate === false && Array.isArray(item.value)) {
	            return {
	                ...item,
	                value: item.value.join(',')
	            }
	        }

	        return item
	    })
	}
</script>

<style scoped lang="scss">
	.uw-order-button{
		display: flex;
		align-items: center;
		justify-content: flex-end;
	}
	.mileage-tip{
		margin-top: 6px;
		color: #f56c6c;
		font-size: 12px;
		line-height: 18px;
	}
	.mileage-tip--plain{
		margin-top: 0;
	}
	.last-mileage{
		width: 100%;
		margin-bottom: 6px;
		color: #606266;
		font-size: 12px;
		line-height: 18px;
		span{
			color: #e53935;
			font-size: 16px;
			font-weight: 600;
		}
	}
	.mileage-detail{
		width: 100%;
		margin-top: 6px;
		color: #606266;
		font-size: 12px;
		line-height: 18px;
		display: flex;
		gap: 16px;
		flex-wrap: wrap;
	}
	.audit-trip-list{
		width: 100%;
		display: flex;
		flex-direction: column;
		gap: 12px;
	}
	.audit-trip-editor{
		width: 100%;
	}
	.audit-trip-edit-tip{
		margin-top: 6px;
		font-size: 12px;
		line-height: 18px;
		color: #909399;
	}
	.audit-trip-card{
		padding: 12px;
		border: 1px solid #ebeef5;
		border-radius: 8px;
		background: #fafafa;
	}
	.audit-trip-head{
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 12px;
		margin-bottom: 8px;
	}
	.audit-trip-title{
		font-weight: 600;
		color: #303133;
	}
	.audit-trip-status{
		font-size: 12px;
		color: #909399;
	}
	.audit-trip-row{
		display: flex;
		flex-wrap: wrap;
		gap: 12px 24px;
		color: #606266;
		line-height: 20px;
	}
	.audit-trip-inputs{
		margin-top: 10px;
		display: grid;
		grid-template-columns: repeat(2, minmax(0, 1fr));
		gap: 12px;
	}
	.audit-trip-photo-block{
		margin-top: 10px;
	}
	.audit-trip-photo-label{
		margin-bottom: 8px;
		font-size: 12px;
		color: #909399;
	}
	.audit-mileage-photos{
		display: flex;
		gap: 8px;
		flex-wrap: wrap;
	}
	.audit-mileage-photo{
		width: 80px;
		height: 80px;
		border-radius: 4px;
		overflow: hidden;
		cursor: pointer;
	}
	.work-volume-summary{
		width: 100%;
		margin-top: 8px;
		padding: 8px 10px;
		border: 1px solid #ebeef5;
		border-radius: 4px;
		background: #f8f9fb;
		color: #606266;
		font-size: 12px;
		line-height: 20px;
	}
	.work-volume-summary__loading{
		margin-top: 6px;
		color: #909399;
		font-size: 12px;
		line-height: 18px;
	}
	.work-volume-summary__title{
		margin-bottom: 4px;
		color: #303133;
		font-weight: 600;
	}
	.work-volume-summary__row,
	.work-volume-summary__total{
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 16px;
	}
	.work-volume-summary__total{
		margin-top: 4px;
		padding-top: 4px;
		border-top: 1px solid #ebeef5;
		color: #303133;
		font-weight: 600;
	}
</style>
