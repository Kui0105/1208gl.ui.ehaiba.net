<template>
	<div class="uw-detail">
		<div class="back">
			<el-icon style="cursor: pointer;" :size="20" @click="$router.back()">
				<Back />
			</el-icon>
		</div>

		<div class="uw-detail-box" v-if="device">
			<div class="left">
				<h4>设备信息</h4>
				<div class="left-box">
					<div class="left-box-item" style="gap: 0 28px;">
						<div class="left-box-item">
							<span>设备名称：</span>
							<span>{{ device.name }}</span>
						</div>
						<div class="left-box-item" style="gap: 0;">
							<span style="min-width: auto;">状态：</span>
							<div style="display: flex; align-items: center; cursor: pointer;" @click="dialogVisible = true">
								<span style="color: #d74130; min-width: auto;">{{ device.status_desc }}</span>
								<el-icon color="#D74130">
									<EditPen />
								</el-icon>
							</div>
						</div>
					</div>
					<div class="left-box-item">
						<span>设备编号：</span>
						<span>{{ device.code }}</span>
					</div>
					<div class="left-box-item">
						<span>设备型号：</span>
						<span>{{ device.cate }}</span>
					</div>
					<div class="left-box-item">
						<span>设备类型：</span>
						<span>{{ device.type }}</span>
					</div>
					<div class="left-box-item"><span>是否租赁：</span><span>{{ device.is_rent === null || device.is_rent === '' ? '-' : Number(device.is_rent) === 1 ? '是' : '否' }}</span></div>
					<div class="left-box-item"><span>使用项目：</span><span>{{ device.use_project || '-' }}</span></div>
					<div v-for="item in workMetricFields" :key="item.key" class="left-box-item">
						<span>{{ item.label }}：</span>
						<span>{{ device[item.key] ?? 0 }}{{ item.unit }}</span>
					</div>
					<div v-if="device.work_metrics_note" class="left-box-item work-metrics-note">
						<span>工作数据说明：</span><span>{{ device.work_metrics_note }}</span>
					</div>
					<div class="left-box-item">
						<span>绑定负责人：</span>
						<span>{{ device.bind_engineer_name || '-' }}</span>
					</div>
					<div class="left-box-item">
						<span>负责人电话：</span>
						<span>{{ device.bind_engineer_mobile || '-' }}</span>
					</div>
					<div class="left-box-item">
						<span>出厂日期：</span>
						<span>{{ device.born_date }}</span>
					</div>
					<div class="left-box-item">
						<span>单位名称：</span>
						<span>{{ device.company_name }}</span>
					</div>
					<div class="left-box-item">
						<span>负责人：</span>
						<span>{{ device.contact }}</span>
					</div>
					<div class="left-box-item">
						<span>联系电话：</span>
						<span>{{ device.mobile }}</span>
					</div>
					<div class="left-box-item">
						<span>服务到期：</span>
						<span>{{ device.over_date }}</span>
					</div>
					<div class="left-box-item">
						<span>使用地区：</span>
						<span>{{ device.addresss }}</span>
					</div>
					<div class="left-box-item">
						<span>详细地址：</span>
						<span>{{ device.full_address }}</span>
					</div>
				</div>
			</div>
			<div class="right">
				<h4>备注信息</h4>
				<div class="right-box" v-html="device.remark"></div>
			</div>
		</div>

		<div class="button-group">
			<el-button type="primary" @click="dialogRemarkVisible = true">修改备注</el-button>
			<el-button type="primary" @click="openEditDialog">编辑设备信息</el-button>
		</div>

		<el-dialog title="设备状态" v-model="dialogVisible" width="30%">
			<el-form>
				<el-form-item>
					<el-radio v-model="statusNum" :value="1" label="正常"></el-radio>
					<el-radio v-model="statusNum" :value="0" label="禁用"></el-radio>
				</el-form-item>
			</el-form>
			<template #footer>
				<span class="dialog-footer">
					<el-button @click="dialogVisible = false">取消</el-button>
					<el-button type="primary" @click="submitStatus">确定</el-button>
				</span>
			</template>
		</el-dialog>

		<el-dialog title="修改备注" v-model="dialogRemarkVisible" width="30%">
			<el-form>
				<el-form-item>
					<el-input v-model="textHtml" type="textarea" :rows="6"></el-input>
				</el-form-item>
			</el-form>
			<template #footer>
				<span class="dialog-footer">
					<el-button @click="dialogRemarkVisible = false">取消</el-button>
					<el-button type="primary" @click="submitRemark">确定</el-button>
				</span>
			</template>
		</el-dialog>

		<el-dialog title="编辑设备信息" v-model="editDialogVisible" width="700px">
			<el-form ref="editFormRef" :model="editFormData" :rules="formRules" label-width="100px">
				<el-form-item label="设备名称" prop="name">
					<el-input v-model="editFormData.name" placeholder="请输入设备名称"></el-input>
				</el-form-item>
				<el-form-item label="设备编号" prop="code">
					<el-input v-model="editFormData.code" placeholder="请输入设备编号"></el-input>
				</el-form-item>
				<el-form-item label="设备型号" prop="cate">
					<el-input v-model="editFormData.cate" placeholder="请输入设备型号编码"></el-input>
				</el-form-item>
				<el-form-item label="设备类型">
					<el-input v-model="editFormData.type" placeholder="请输入设备类型"></el-input>
				</el-form-item>
				<el-form-item label="是否租赁" prop="is_rent"><el-radio-group v-model="editFormData.is_rent"><el-radio :label="1">是</el-radio><el-radio :label="0">否</el-radio></el-radio-group></el-form-item>
				<el-form-item label="使用项目" prop="use_project"><el-select v-model="editFormData.use_project" placeholder="请选择使用项目" style="width:100%"><el-option v-for="item in projectOptions" :key="item" :label="item" :value="item" /></el-select></el-form-item>
				<el-form-item label="单位名称" prop="company_name">
					<el-input v-model="editFormData.company_name" placeholder="请输入单位名称"></el-input>
				</el-form-item>
				<el-form-item label="负责人" prop="contact">
					<el-input v-model="editFormData.contact" placeholder="请输入负责人"></el-input>
				</el-form-item>
				<el-form-item label="联系电话" prop="mobile">
					<el-input v-model="editFormData.mobile" placeholder="请输入联系电话"></el-input>
				</el-form-item>
				<el-form-item label="绑定负责人">
					<el-select v-model="editFormData.engineer_id" placeholder="请选择负责人" filterable style="width: 100%;">
						<el-option
							v-for="item in engineerOptions"
							:key="item.id"
							:label="getEngineerOptionLabel(item)"
							:value="item.id"
						></el-option>
					</el-select>
				</el-form-item>
				<el-form-item label="省市区" prop="region">
					<el-cascader
						v-model="editFormData.region"
						:options="cityList"
						:props="cascaderProps"
						placeholder="请选择省市区"
						style="width: 100%;"
						clearable
					/>
				</el-form-item>
				<el-form-item label="详细地址" prop="address">
					<el-input v-model="editFormData.address" placeholder="请输入详细地址"></el-input>
				</el-form-item>
				<el-form-item label="出厂日期">
					<el-date-picker
						v-model="editFormData.born_date"
						type="date"
						value-format="YYYY-MM-DD"
						placeholder="请选择出厂日期"
						style="width: 100%;"
					/>
				</el-form-item>
				<el-form-item label="服务到期">
					<el-date-picker
						v-model="editFormData.over_date"
						type="date"
						value-format="YYYY-MM-DD"
						placeholder="请选择服务到期日期"
						style="width: 100%;"
					/>
				</el-form-item>
				<el-form-item label="备注">
					<el-input v-model="editFormData.remark" type="textarea" :rows="4" placeholder="请输入备注"></el-input>
				</el-form-item>
				<el-form-item label="状态">
					<el-radio-group v-model="editFormData.status">
						<el-radio :label="1">正常</el-radio>
						<el-radio :label="0">禁用</el-radio>
					</el-radio-group>
				</el-form-item>
			</el-form>
			<template #footer>
				<span class="dialog-footer">
					<el-button @click="editDialogVisible = false">取消</el-button>
					<el-button type="primary" :loading="editSubmitting" @click="submitEdit">确定</el-button>
				</span>
			</template>
		</el-dialog>
	</div>
</template>

<script setup>
	import { computed, onMounted, ref } from 'vue'
	import { useRoute } from 'vue-router'
	import { ElMessage } from 'element-plus'
	import { Back, EditPen } from '@element-plus/icons-vue'

	import { allRegion } from '@/api/perms/role'
	import { getEngineerLists } from '@/api/order/order'
	import { changemachineFieldApi, editmachineApi, getmachineDetailApi } from '@/api/device/device'

	const OVERSEAS_REGION_ID = 990000
	const overseasRegionOption = {
		value: OVERSEAS_REGION_ID,
		label: '海外',
		leaf: true
	}

	const route = useRoute()
	const device = ref(null)
	const dialogVisible = ref(false)
	const dialogRemarkVisible = ref(false)
	const editDialogVisible = ref(false)
	const editSubmitting = ref(false)
	const statusNum = ref(0)
	const textHtml = ref('')
	const cityList = ref([])
	const engineerOptions = ref([{ id: 0, name: '不绑定', mobile: '', parent_name: '' }])
	const projectOptions = ['基建', '水利', '矿山']
	const workMetricDefinitions = {
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
	const workMetricFields = computed(() => workMetricDefinitions[Number(device.value?.machine_oa_cate_id)] || [])
	const editFormRef = ref()

	const editFormData = ref({
		id: '',
		name: '',
		code: '',
		cate: '',
		type: '',
		born_date: '',
		over_date: '',
		status: 1,
		company_name: '',
		contact: '',
		mobile: '',
		engineer_id: 0,
		region: [],
		address: '',
		remark: '',
		is_rent: null,
		use_project: ''
	})

	const cascaderProps = {
		checkStrictly: true,
		showPrefix: false,
		expandTrigger: 'click',
		emitPath: true,
		value: 'value',
		label: 'label',
		children: 'children',
		leaf: 'leaf'
	}

	const validateMobile = (_rule, value, callback) => {
		if (!value) {
			callback(new Error('请输入联系电话'))
			return
		}
		if (!/^1\d{10}$/.test(value)) {
			callback(new Error('请输入正确的手机号'))
			return
		}
		callback()
	}

	const formRules = {
		name: [{ required: true, message: '请输入设备名称', trigger: 'blur' }],
		code: [{ required: true, message: '请输入设备编号', trigger: 'blur' }],
		cate: [{ required: true, message: '请输入设备型号编码', trigger: 'blur' }],
		company_name: [{ required: true, message: '请输入单位名称', trigger: 'blur' }],
		contact: [{ required: true, message: '请输入负责人', trigger: 'blur' }],
		mobile: [{ validator: validateMobile, trigger: 'blur' }],
		region: [{ required: true, message: '请选择省市区', trigger: 'change' }],
		address: [{ required: true, message: '请输入详细地址', trigger: 'blur' }],
		is_rent: [{ required: true, message: '请选择是否租赁', trigger: 'change' }],
		use_project: [{ required: true, message: '请选择使用项目', trigger: 'change' }]
	}

	const getEngineerOptionLabel = (item) => {
		if (item.id === 0) return item.name
		return `${item.name} / ${item.mobile || '-'} / ${item.parent_name || '无上级'}`
	}

	const refreshDetail = async () => {
		const res = await getmachineDetailApi({ id: route.query.id })
		device.value = res
		textHtml.value = res.remark
		statusNum.value = res.status
	}

	const getEngineerOptions = async () => {
		const res = await getEngineerLists({
			page_no: 1,
			page_size: 9999,
			bind_machine: 1
		})
		const lists = (res?.lists || [])
			.map((item) => ({
				id: Number(item.id ?? item.value ?? item.engineer_id ?? 0),
				name: item.name || item.label || item.realname || item.nickname || '',
				mobile: item.mobile || item.phone || '',
				parent_name: item.parent_info?.name || item.parent_name || ''
			}))
			.filter((item) => item.id > 0 && item.name)
		engineerOptions.value = [{ id: 0, name: '不绑定', mobile: '', parent_name: '' }, ...lists]
	}

	const submitStatus = () => {
		changemachineFieldApi({
			field: 'status',
			value: statusNum.value,
			id: route.query.id
		}).then(() => {
			ElMessage.success('修改成功')
			dialogVisible.value = false
			refreshDetail()
		})
	}

	const submitRemark = () => {
		changemachineFieldApi({
			field: 'remark',
			value: textHtml.value,
			id: route.query.id
		}).then(() => {
			ElMessage.success('修改成功')
			dialogRemarkVisible.value = false
			refreshDetail()
		})
	}

	const openEditDialog = () => {
		editFormData.value = {
			id: device.value.id,
			name: device.value.name || '',
			code: device.value.code || '',
			cate: device.value.cate || '',
			type: device.value.type || '',
			born_date: device.value.born_date || '',
			over_date: device.value.over_date || '',
			status: Number(device.value.status ?? 1),
			company_name: device.value.company_name || '',
			contact: device.value.contact || '',
			mobile: device.value.mobile || '',
			engineer_id: Number(device.value.engineer_id ?? device.value.bind_engineer_id ?? 0),
			region: [],
			address: device.value.address || '',
			remark: device.value.remark || '',
			is_rent: device.value.is_rent === null || device.value.is_rent === '' || device.value.is_rent === undefined ? null : Number(device.value.is_rent),
			use_project: device.value.use_project || ''
		}

		const province = device.value.province_id || device.value.province || ''
		if (Number(province) === OVERSEAS_REGION_ID) {
			editFormData.value.region = [OVERSEAS_REGION_ID]
			editDialogVisible.value = true
			return
		}
		const city = device.value.city_id || device.value.city || ''
		const area = device.value.area_id || device.value.area || ''
		if (province || city || area) {
			editFormData.value.region = [province, city, area]
				.filter((item) => item !== '' && item !== null && item !== undefined)
				.map((item) => Number(item))
		}
		editDialogVisible.value = true
	}

	const normalizeRegionOptions = (regions = []) => {
		const normalized = regions.map((item) => {
			if (Number(item.value) !== OVERSEAS_REGION_ID) return item
			const { children, ...rest } = item
			return {
				...rest,
				value: OVERSEAS_REGION_ID,
				label: '海外',
				leaf: true
			}
		})
		if (normalized.some((item) => Number(item.value) === OVERSEAS_REGION_ID)) {
			return normalized
		}
		return [overseasRegionOption, ...normalized]
	}

	const isOverseasRegion = (region = []) => Number(region[0]) === OVERSEAS_REGION_ID

	const buildRegionParams = (region = []) => {
		if (isOverseasRegion(region)) {
			return {
				province: OVERSEAS_REGION_ID,
				city: OVERSEAS_REGION_ID,
				area: OVERSEAS_REGION_ID
			}
		}
		return {
			province: region[0] || '',
			city: region[1] || '',
			area: region[2] || ''
		}
	}

	const submitEdit = async () => {
		if (!editFormRef.value) return
		const valid = await editFormRef.value.validate().catch(() => false)
		if (!valid) return

		editSubmitting.value = true
		try {
			const params = {
				id: editFormData.value.id,
				name: editFormData.value.name,
				code: editFormData.value.code,
				cate: editFormData.value.cate,
				type: editFormData.value.type,
				company_name: editFormData.value.company_name,
				contact: editFormData.value.contact,
				mobile: editFormData.value.mobile,
				engineer_id: editFormData.value.engineer_id,
				address: editFormData.value.address,
				born_date: editFormData.value.born_date,
				over_date: editFormData.value.over_date,
				remark: editFormData.value.remark,
				status: editFormData.value.status,
				is_rent: editFormData.value.is_rent,
				use_project: editFormData.value.use_project
			}
			if (editFormData.value.region && editFormData.value.region.length > 0) {
				Object.assign(params, buildRegionParams(editFormData.value.region))
			}
			await editmachineApi(params)
			ElMessage.success('编辑成功')
			editDialogVisible.value = false
			refreshDetail()
		} finally {
			editSubmitting.value = false
		}
	}

	const getAllRegion = async () => {
		const res = await allRegion({})
		cityList.value = normalizeRegionOptions(res || [])
	}

	onMounted(() => {
		refreshDetail()
		getAllRegion()
		getEngineerOptions()
	})
</script>

<style lang="scss" scoped>
	.uw-detail {
		background: #ffffff;
		box-shadow: 0 0 30px 0 rgba(245, 225, 228, 0.5);
		border-radius: 16px;
		padding: 20px;
		width: 100%;
		height: calc(100vh - 91px - 32px);
		display: flex;
		flex-direction: column;
		align-items: center;
	}

	.back {
		width: 100%;
	}

	.button-group {
		display: flex;
		gap: 12px;
		margin-top: 20px;
	}

	.uw-detail-box {
		flex: 1;
		width: 100%;
		display: flex;
		padding-left: 52px;

		.left {
			flex: 1;
			min-width: 350px;

			h4 {
				font-weight: 400;
				font-size: 20px;
				color: #191919;
				line-height: 28px;
				margin-bottom: 40px;
			}

			&-box {
				display: flex;
				flex-direction: column;
				gap: 28px 0;

				&-item {
					font-weight: 400;
					font-size: 14px;
					color: #333333;
					line-height: 20px;
					display: flex;
					gap: 0 12px;

					span {
						&:nth-child(1) {
							min-width: 84px;
						}
					}
				}
			}
		}

		.right {
			flex: 1.5;

			h4 {
				font-weight: 400;
				font-size: 20px;
				color: #191919;
				line-height: 28px;
				margin-bottom: 40px;
			}

			&-box {
				font-weight: 400;
				font-size: 14px;
				color: #333333;
				line-height: 20px;
			}
		}
	}
</style>
