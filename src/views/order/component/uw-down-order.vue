<template>
	<div>
		<!-- 完成情况 -->
		<el-dialog :title="statusDialogTitle" v-model="showOrderStatus" width="500px" @close="closeConfirm">
			<el-form label-width="0">
				<el-form-item>
					<el-radio-group v-model="downFormData.type">
						<el-radio label="1">{{ completeLabel }}</el-radio>
						<el-radio label="2">{{ incompleteLabel }}</el-radio>
					</el-radio-group>
				</el-form-item>
			</el-form>
			<template #footer>
				<span class="dialog-footer">
					<el-button @click="showOrderStatus = false, emit('close')">取消</el-button>
					<el-button :loading="loading" type="primary" @click="changeDownOrder">确定</el-button>
				</span>
			</template>
		</el-dialog>

		<!-- 完成表单 -->
		<el-dialog class="order-table-dialog" :title="orderTableTitle" draggable v-model="showOrderTable"
			:width="orderTableWidth" @close="emit('close')">
			<div class="left flex-1">
				<el-form label-width="100">
					<div v-if="orderInfo.type == 1">
						<h1 class="mb-[32px]"><b>故障维修说明</b></h1>
						<el-form-item label="故障类型">
							<el-select v-model="downFormData.repair_name" multiple placeholder="请选择故障类型">
								<el-option :label="item" :value="item" v-for="item in reasonList" :key="item" />
							</el-select>
						</el-form-item>
						<el-form-item label="故障现象">
							<el-input v-model="downFormData.repair_phenomenon" placeholder="请输入故障现象" type="textarea" />
						</el-form-item>
						<el-form-item label="故障原因分析">
							<el-input v-model="downFormData.repair_reason_analysis" placeholder="请输入故障原因分析" type="textarea" />
						</el-form-item>
						<el-form-item label="故障处理方式">
							<el-input v-model="downFormData.repair_process" placeholder="请输入故障处理方式" type="textarea" />
						</el-form-item>
					</div>
					<div v-if="orderInfo.type == 1 || orderInfo.type == 4 || orderInfo.type == 11">
						<div v-for="item in formValue" :key="item.id" class="mb-[32px]">
							<h1 v-if="item.is_cate" class="mb-[32px]"><b>{{ item.name }}</b></h1>
							<uwCeateOrderForm v-if="item.is_cate" :row="row" v-for="row in item.son" :key="row.id" />
							<uwCeateOrderForm v-else :row="item" />
						</div>
					</div>
					<div v-if="orderInfo.repair_type !== 2">
						<!-- 自定义表单 -->
						<div v-for="item in tableData" :key="item.id" class="mb-[32px]">
							<h1 v-if="item.is_cate" class="mb-[32px]"><b>{{ item.name }}</b></h1>
							<uwCeateOrderForm v-if="item.is_cate" :row="row" v-for="row in item.son" :key="row.id" />
							<uwCeateOrderForm v-else :row="item" />
						</div>
					</div>
					<div v-if="showWorkMetrics" class="work-metrics-section">
						<h1 class="mb-[24px]"><b>设备工作数据</b></h1>
						<div v-for="item in workMetricFields" :key="item.key" class="work-metric-item">
							<span class="work-metric-label">{{ item.label }}</span>
							<el-input-number v-model="workMetrics[item.key]" :min="0" :precision="2" :step="0.01" controls-position="right" />
							<span class="work-metric-unit">{{ item.unit }}</span>
						</div>
						<el-form-item label="工作数据说明">
							<el-input v-model="workMetricsNote" type="textarea" :rows="3" maxlength="1000" show-word-limit placeholder="请输入说明（选填）" />
						</el-form-item>
					</div>
				</el-form>
			</div>
			<div class="right flex-1" v-if="canShowBxData">
				<el-form>
					<h1 class="mb-[32px]"><b>报销资料</b></h1>
					<div v-for="item in downFormData.bx_data" :key="item">
						<el-form-item label="报销类型">
							<el-select v-model="item.name" placeholder="请选择报销类型">
								<el-option :label="option" :value="option" v-for="option in bxList" :key="option" />
							</el-select>
						</el-form-item>
						<el-form-item label="报销金额">
							<el-input v-model="item.money" placeholder="请输入报销金额" />
						</el-form-item>
						<el-form-item label="报销图片">
							<material-picker v-model="item.img" type="image" :limit="1" />
						</el-form-item>
					</div>
				</el-form>
				<el-button type="text" v-if="downFormData.bx_data.length < 3" @click="pushBxData">
					+添加报销明细
				</el-button>
				<el-button type="text" v-if="downFormData.bx_data.length > 0" @click="removeBxData">
					-移除报销明细
				</el-button>
			</div>
			<template #footer>
				<span class="dialog-footer">
					<el-button @click="showOrderTable = false, emit('close')">取消</el-button>
					<el-button v-if="canShowPreviousButton" plain type="primary" @click="showOrderTable = false, emit('close')">
						上一步
					</el-button>
					<el-button :loading="loading" type="primary" @click="confirm">确定</el-button>
				</span>
			</template>
		</el-dialog>
	</div>
</template>

<script setup lang="ts">
	import { computed, ref, reactive, onMounted } from 'vue';
	import { ElMessage } from 'element-plus';
	import { getOrderForm, getAllReason, getAllBx, orderComplete, getOrderEditFill, orderEdit, orderOut } from '@/api/order/order';
	import uwCeateOrderForm from './uw-create-order-form.vue';
	import { buildTemplateFromFormKeys, restoreFormData } from '@/utils/util';

	const prop = defineProps({
		orderInfo: {
			type: Object,
			default: () => ({})
		},
		inspectionInfo: {
			type: Array,
			default: () => (null)
		}
	})
	const emit = defineEmits(['change', 'close'])

	const ORDER_TYPE_QITA = 10
	const ORDER_TYPE_JIAOYAN = 11
	const ORDER_TYPE_CAOZUO = 6
	const ORDER_TYPE_CAOZUOP = 7

	const downFormData = reactive({
		id: '',
		repair_name: [] as string[],
		repair_intro: '',
		repair_phenomenon: '',
		repair_reason_analysis: '',
		repair_process: '',
		type: '',
		form_data: [] as any[],
		bx_data: [] as any[],
		dj_data: [] as any[]
	})
	const workMetrics = reactive<Record<string, number | string>>({})
	const workMetricsNote = ref('')
	const workMetricDefinitions: Record<number, Array<{ key: string, label: string, unit: string }>> = {
		1: [
			{ key: 'pump_time', label: '泵送时间', unit: '小时' },
			{ key: 'pump_volume', label: '泵送方量', unit: '方' }
		],
		2: [{ key: 'system_work_time', label: '系统工作时间', unit: '小时' }],
		3: [
			{ key: 'engine_work_time', label: '开机时间', unit: '小时' },
			{ key: 'left_impact_time', label: '左臂凿岩机冲击时间', unit: '小时' },
			{ key: 'middle_impact_time', label: '中臂凿岩机冲击时间', unit: '小时' },
			{ key: 'right_impact_time', label: '右臂凿岩机冲击时间', unit: '小时' }
		],
		9: [
			{ key: 'engine_work_time', label: '开机时间', unit: '小时' },
			{ key: 'left_impact_time', label: '左臂凿岩机冲击时间', unit: '小时' },
			{ key: 'right_impact_time', label: '右臂凿岩机冲击时间', unit: '小时' }
		],
		7: [
			{ key: 'engine_work_time', label: '开机时间', unit: '小时' },
			{ key: 'left_impact_time', label: '左臂凿岩机冲击时间', unit: '小时' },
			{ key: 'right_impact_time', label: '右臂凿岩机冲击时间', unit: '小时' }
		],
		10: [
			{ key: 'engine_work_time', label: '开机时间', unit: '小时' },
			{ key: 'left_impact_time', label: '左臂凿岩机冲击时间', unit: '小时' },
			{ key: 'right_impact_time', label: '右臂凿岩机冲击时间', unit: '小时' }
		]
	}
	const machineType = computed(() => Number(prop.orderInfo.machine_oa_cate_id || prop.orderInfo.machine_info?.machine_oa_cate_id || 0))
	const workMetricFields = computed(() => workMetricDefinitions[machineType.value] || [])
	const showWorkMetrics = computed(() => [1, 2].includes(Number(prop.orderInfo.type)) && workMetricFields.value.length > 0)

	const reasonList = ref<string[]>([])
	const bxList = ref<string[]>([])
	const tableData = ref<any[]>([])
	const showOrderStatus = ref(false)
	const showOrderTable = ref(false)
	const loading = ref(false)
	const formValue = ref<any[]>([])

	const isOtherOrder = computed(() => Number(prop.orderInfo.type) === ORDER_TYPE_QITA)
	const isJiaoyanOrder = computed(() => Number(prop.orderInfo.type) === ORDER_TYPE_JIAOYAN)
	const canShowBxData = computed(() => prop.orderInfo.repair_type !== 2 && !isOtherOrder.value && !isJiaoyanOrder.value)
	const canShowPreviousButton = computed(() => !!prop.inspectionInfo && !isOtherOrder.value)
	const isRejectedForEdit = computed(() => Number(prop.orderInfo.audit_status) === 3
		|| (Number(prop.orderInfo.audit_status) === 2 && Number(prop.orderInfo.re_audit_status) === 3))
	const statusDialogTitle = computed(() => {
		if (prop.orderInfo.type == 4) return '技改状态'
		if (isJiaoyanOrder.value) return '交验状态'
		return '维修状态'
	})
	const completeLabel = computed(() => {
		if (prop.orderInfo.type == 4) return '技改完成'
		if (isJiaoyanOrder.value) return '交验完成'
		return '维修完成'
	})
	const incompleteLabel = computed(() => {
		if (prop.orderInfo.type == 4) return '未完成（二次技改）'
		if (isJiaoyanOrder.value) return '未完成（二次交验）'
		return '未完成（二次维修）'
	})
	const orderTableTitle = computed(() => {
		if (isOtherOrder.value) return '其他工单修改'
		if (prop.orderInfo.type == 4) return '技改完成'
		if (isJiaoyanOrder.value) return '交验完成'
		if (prop.orderInfo.type == ORDER_TYPE_CAOZUO || prop.orderInfo.type == ORDER_TYPE_CAOZUOP) return '退场'
		return '维修完成'
	})
	const orderTableWidth = computed(() => {
		if (isOtherOrder.value) return '500px'
		return prop.orderInfo.repair_type !== 2 ? '50%' : '500px'
	})

	const getRepairNameValue = (value: string[] | string) => {
		if (Array.isArray(value)) return value.filter(Boolean).join(',')
		return value || ''
	}
	const getRepairNameOptions = (value: unknown): string[] => {
		if (Array.isArray(value)) return value
		return value ? String(value).split(',').filter(Boolean) : []
	}
	const buildRepairIntroText = () => {
		return [
			downFormData.repair_phenomenon ? `故障现象：${downFormData.repair_phenomenon}` : '',
			downFormData.repair_reason_analysis ? `故障原因分析：${downFormData.repair_reason_analysis}` : '',
			downFormData.repair_process ? `故障处理方式：${downFormData.repair_process}` : ''
		].filter(Boolean).join('\n')
	}
	const splitPickerMediaValue = (value: any) => {
		if (Array.isArray(value)) {
			return value.flatMap((item) => {
				if (typeof item === 'string') {
					return item.split(',').map((uri) => uri.trim()).filter(Boolean)
				}
				if (item && typeof item === 'object') {
					const uri = item.tempFilePath || item.url || item.uri || item.value || ''
					return uri ? [uri] : []
				}
				return item ? [item] : []
			})
		}
		if (typeof value === 'string') {
			return value.split(',').map((item) => item.trim()).filter(Boolean)
		}
		return value ? [value] : []
	}
	const normalizePickerFieldValue = (field: any) => {
		if (!field || typeof field !== 'object') return field
		const smallType = Number(field.small_type)
		if ([4, 5, 12].includes(smallType)) {
			return {
				...field,
				value: splitPickerMediaValue(field.value)
			}
		}
		if (smallType === 3 && Array.isArray(field.value)) {
			return {
				...field,
				value: field.value[0] || ''
			}
		}
		if (smallType === 10 && Array.isArray(field.extra_data)) {
			return {
				...field,
				extra_data: field.extra_data.map((item: any) => ({
					...item,
					value: splitPickerMediaValue(item.value)[0] || ''
				}))
			}
		}
		return field
	}
	const normalizePickerFormData = (list: any[] = []) => {
		return list.map((item) => {
			if (item?.is_cate === true && Array.isArray(item.son)) {
				return {
					...item,
					son: item.son.map(normalizePickerFieldValue)
				}
			}
			return normalizePickerFieldValue(item)
		})
	}

	const closeConfirm = () => {
		if (showOrderTable.value) return
		emit('close')
	}

	const changeDownOrder = () => {
		if (!downFormData.type) return ElMessage.error('请选择完成状态')
		showOrderStatus.value = false
		showOrderTable.value = true
	}
	const pushBxData = () => {
		downFormData.bx_data.push({
			name: '',
			money: '',
			img: ''
		})
	}
	const removeBxData = () => {
		downFormData.bx_data.pop()
	}
	const getFormFieldValue = (fieldKey: string) => {
		for (const item of formValue.value) {
			if (item?.field_key === fieldKey) {
				return item.value ?? ''
			}
			if (Array.isArray(item?.son)) {
				const field = item.son.find((sonItem: any) => sonItem.field_key === fieldKey)
				if (field) {
					return field.value ?? ''
				}
			}
		}
		return ''
	}
	const confirm = async () => {
		downFormData.id = prop.orderInfo.id
		downFormData.form_data = normalizeImageValue(tableData.value)
		const submitData: any = {
			...downFormData,
			repair_name: getRepairNameValue(downFormData.repair_name),
			repair_intro: buildRepairIntroText() || downFormData.repair_intro,
			work_metrics: {
				...Object.fromEntries(Object.entries(workMetrics).filter(([, value]) => value !== '' && value !== null && value !== undefined)),
				...(workMetricsNote.value.trim() ? { work_metrics_note: workMetricsNote.value.trim() } : {})
			}
		}
		if (prop.orderInfo.type == 4 && downFormData.type == '1' && !getFormFieldValue('working_hours')) {
			ElMessage.error('请填写工作时间')
			return
		}
		if (prop.inspectionInfo) {
			submitData.dj_data = prop.inspectionInfo
		}
		loading.value = true
		try {
			if (isRejectedForEdit.value) {
				await orderEdit({ ...submitData, ...restoreFormData(formValue.value) })
			} else if (prop.orderInfo.type == ORDER_TYPE_CAOZUO || prop.orderInfo.type == ORDER_TYPE_CAOZUOP) {
				await orderOut(submitData)
			} else {
				await orderComplete({ ...submitData, ...restoreFormData(formValue.value) })
			}

			ElMessage.success('操作成功')
			showOrderTable.value = false
			emit('change')
		} catch (e) {
			loading.value = false
		}
	}
	const getOrderExtraFormValue = (type: number, extraData: any = {}) => {
		if (type == 1) {
			return {
				startup_time: extraData.startup_time ?? '',
				working_hours: extraData.working_hours ?? '',
				nameplate_photos: extraData.nameplate_photos ?? [],
				display_photos: extraData.display_photos ?? [],
				closeup_photos: extraData.closeup_photos ?? [],
				medium_photos: extraData.medium_photos ?? [],
				longshot_photos: extraData.longshot_photos ?? [],
				other_photos: extraData.other_photos ?? [],
				other_videos: extraData.other_videos ?? []
			}
		}
		if (type == 4) {
			return {
				working_hours: extraData.working_hours ?? '',
				completion_photos: extraData.completion_photos ?? [],
				completion_description: extraData.completion_description ?? ''
			}
		}
		return {}
	}
	const orderEditFill = async (id: any) => {
		const data = await getOrderEditFill({ id })
		downFormData.bx_data = (isOtherOrder.value || isJiaoyanOrder.value) ? [] : data.bx_data
		downFormData.repair_intro = data.extra_data.repair_intro
		downFormData.repair_phenomenon = data.extra_data.repair_phenomenon || data.extra_data.repair_intro || ''
		downFormData.repair_reason_analysis = data.extra_data.repair_reason_analysis || ''
		downFormData.repair_process = data.extra_data.repair_process || ''
		downFormData.repair_name = getRepairNameOptions(data.extra_data.repair_name)
		tableData.value = normalizePickerFormData(data.form_data || [])
		if (isOtherOrder.value) {
			formValue.value = []
			return
		}

		formValue.value = normalizePickerFormData(buildTemplateFromFormKeys({
			formValue: getOrderExtraFormValue(Number(prop.orderInfo.type), data.extra_data || {})
		}))
		Object.keys(workMetrics).forEach((key) => delete workMetrics[key])
		const storedWorkMetrics = { ...(data.extra_data?.work_metrics || {}) }
		workMetricsNote.value = storedWorkMetrics.work_metrics_note || ''
		delete storedWorkMetrics.work_metrics_note
		Object.assign(workMetrics, storedWorkMetrics)
	}
	onMounted(async () => {
		const { next_step, type, id, repair_type } = prop.orderInfo
		if (!isRejectedForEdit.value && (type == 1 || type == 4 || type == ORDER_TYPE_JIAOYAN) && repair_type != 2) {
			showOrderStatus.value = true
		} else {
			showOrderTable.value = true
		}

		const data = isOtherOrder.value ? {} : getOrderExtraFormValue(Number(type))
		formValue.value = isOtherOrder.value ? [] : normalizePickerFormData(buildTemplateFromFormKeys({ formValue: data }))
		workMetricFields.value.forEach((item) => { workMetrics[item.key] = '' })
		workMetricsNote.value = ''

		if (isRejectedForEdit.value) {
			await orderEditFill(id)
		} else {
			tableData.value = await getOrderForm({
				type,
				step: next_step
			})
		}

		reasonList.value = await getAllReason()
		bxList.value = await getAllBx()
	})
	function normalizeImageValue(list: any[]) {
		return list.map(item => {
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

<style>
	.order-table-dialog .el-dialog__body {
		max-height: 600px;
		overflow-y: auto;
	}
	.work-metrics-section {
		margin: 8px 0 32px;
		padding-top: 8px;
		border-top: 1px solid #ebeef5;
	}
	.work-metric-item {
		display: flex;
		align-items: center;
		margin-bottom: 16px;
	}
	.work-metric-label {
		width: 190px;
		color: #606266;
	}
	.work-metric-unit {
		margin-left: 8px;
		color: #909399;
	}
</style>
