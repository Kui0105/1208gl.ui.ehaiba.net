<template>
	<div class="uw-caeat-order" v-loading="loading">
		<img class="back" src="/src/assets/uwback.png" @click="$router.back()">
		<div class="flex" style="gap: 0 104px;">
			<div class="left">
				<div class="flex items-center justify-between mb-[32px]">
					<h1>设备信息</h1>
					<el-button v-if="!isOtherOrderType" type="primary" @click="dialogVisible = true">
						选择设备 ({{ selectedDevices.length }})
					</el-button>
				</div>

				<div v-if="selectedDevices.length > 0" class="selected-devices-list">
					<el-card
						v-for="(device, index) in selectedDevices"
						:key="device.id"
						class="mb-4"
						shadow="hover"
					>
						<div class="flex justify-between items-start">
							<div class="device-info">
								<div class="flex items-center mb-2">
									<span class="label-width">设备编号：</span>
									<span>{{ device.code }}</span>
								</div>
								<div class="flex items-center mb-2">
									<span class="label-width">设备名称：</span>
									<span>{{ device.name }}</span>
								</div>
								<div class="flex items-center mb-2">
									<span class="label-width">单位名称：</span>
									<span>{{ device.company_name }}</span>
								</div>
								<div class="flex items-center mb-2">
									<span class="label-width">负责人：</span>
									<span>{{ device.contact }}</span>
								</div>
								<div class="flex items-center mb-2">
									<span class="label-width">联系电话：</span>
									<span>{{ device.mobile }}</span>
								</div>

								<div class="device-edit-form">
									<div class="address-tip">创建工单前可临时调整使用地区和详细地址，仅用于本次工单填写。</div>
									<el-form label-width="80px">
										<el-form-item label="使用地区" class="mb-2">
											<el-cascader
												v-model="device.region"
												:options="cityList"
												:props="cascaderProps"
												placeholder="请选择省市区"
												style="width: 100%;"
											/>
										</el-form-item>
										<el-form-item label="详细地址">
											<el-input v-model="device.address" placeholder="请输入详细地址" />
										</el-form-item>
									</el-form>
								</div>
							</div>
							<el-button type="danger" text @click="removeDevice(index)">
								<el-icon><Delete /></el-icon>
							</el-button>
						</div>
					</el-card>
				</div>

				<div v-else-if="isOtherOrderType" class="device-empty-tip">其他工单无需选择设备</div>
				<el-empty v-else description="请选择设备" :image-size="80" />
			</div>
			<div class="right">
				<el-form label-width="100">
					<el-form-item v-if="isOtherOrderType" label="省市区" required>
						<el-cascader
							v-model="otherOrderRegion"
							:options="cityList"
							:props="cascaderProps"
							placeholder="请选择省市区"
							style="width: 100%;"
							clearable
						/>
					</el-form-item>
					<div v-for="item in formValue" :key="item.id">
						<h1 v-if="item.is_cate" class="mb-[32px]">{{ item.name }}</h1>
						<uwCeateOrderForm v-if="item.is_cate" v-for="row in item.son" :row="row" />
						<uwCeateOrderForm v-else :row="item" />
					</div>
					<div v-for="item in fromList" :key="item.id">
						<h1 v-if="item.is_cate" class="mb-[32px]">{{ item.name }}</h1>
						<uwCeateOrderForm v-if="item.is_cate" v-for="row in item.son" :row="row" />
						<uwCeateOrderForm v-else :row="item" />
					</div>
				</el-form>
			</div>
		</div>
		<div class="flex justify-center pr-[20%] pb-[20px]">
			<el-button type="primary" @click="submit">立即创建</el-button>
		</div>

		<el-dialog v-model="dialogVisible" title="选择设备" width="80%">
			<template #header>
				<div class="custom-header flex items-center">
					<h4>选择设备</h4>
					<el-input
						v-model="formData.keyword"
						class="ml-[24px]"
						placeholder="请输入设备名称/编号进行搜索"
						style="width: 200px;"
					/>
					<el-cascader
						v-model="formData.region"
						class="ml-[12px]"
						:options="cityList"
						:props="cascaderProps"
						placeholder="请选择省市区"
						style="width: 240px;"
						clearable
					/>
					<el-button class="ml-[12px]" type="primary" @click="tapSearch">搜索</el-button>
					<el-button class="ml-[12px]" @click="restData">重置</el-button>
					<div class="ml-auto text-primary">
						已选择 <span class="selected-count">{{ selectedDevices.length }}</span> 台设备
					</div>
				</div>
			</template>

			<div v-if="selectedDevices.length > 0" class="selected-devices-box mb-4">
				<div class="selected-devices-title">
					<el-icon><SuccessFilled /></el-icon>
					已选择设备
				</div>
				<el-tag
					v-for="(device, index) in selectedDevices"
					:key="device.id"
					type="success"
					closable
					@close="removeDevice(index)"
					class="mr-2 mb-2"
				>
					{{ device.code }} - {{ device.name }}
				</el-tag>
			</div>

			<el-table
				ref="tableRef"
				:data="tableData"
				@selection-change="handleSelectionChange"
			>
				<el-table-column type="selection" width="55"></el-table-column>
				<el-table-column prop="code" label="设备编号"></el-table-column>
				<el-table-column prop="name" label="设备名称"></el-table-column>
				<el-table-column show-overflow-tooltip prop="company_name" label="单位名称"></el-table-column>
				<el-table-column width="120" prop="contact" label="负责人"></el-table-column>
				<el-table-column prop="mobile" label="联系电话"></el-table-column>
				<el-table-column show-overflow-tooltip prop="addresss" label="使用地区"></el-table-column>
				<el-table-column label="操作" width="100">
					<template #default="{ row }">
						<el-button
							type="text"
							@click="toggleDeviceSelection(row)"
							:class="{ 'text-success': isDeviceSelected(row) }"
						>
							{{ isDeviceSelected(row) ? '已选择' : '选择' }}
						</el-button>
					</template>
				</el-table-column>
			</el-table>
			<div style="display: flex; align-items: center; justify-content: center; margin-top: 18px;">
				<el-pagination
					background
					layout="prev, pager, next"
					:total="totalCount"
					@current-change="currentChange"
				/>
			</div>
			<template #footer>
				<el-button @click="dialogVisible = false">取消</el-button>
				<el-button type="primary" @click="confirmSelection">确认选择</el-button>
			</template>
		</el-dialog>
	</div>
</template>

<script setup lang="ts">
	import { onMounted, ref } from 'vue'
	import { ElMessage } from 'element-plus'
	import { Delete, SuccessFilled } from '@element-plus/icons-vue'
	import { useRoute, useRouter } from 'vue-router'

	import { getmachineListsApi } from '@/api/device/device'
	import { createOrderMore, getOrderForm } from '@/api/order/order'
	import { allRegion } from '@/api/perms/role'
	import { buildTemplateFromFormKeys, restoreFormData } from '@/utils/util'

	import uwCeateOrderForm from './component/uw-create-order-form.vue'

	type RegionValue = Array<string | number>

	const OVERSEAS_REGION_ID = 990000
	const overseasRegionOption = {
		value: OVERSEAS_REGION_ID,
		label: '海外',
		leaf: true
	}

	const loading = ref(false)
	const route = useRoute()
	const router = useRouter()
	const routeType = Array.isArray(route.query.type) ? route.query.type[0] : route.query.type
	const orderType = Number(routeType || 0)
	const isOtherOrderType = orderType === 10
	const fromList = ref<any[]>([])
	const dialogVisible = ref(false)
	const tableData = ref<any[]>([])
	const totalCount = ref(0)
	const pageNum = ref(1)
	const cityList = ref<any[]>([])
	const tableRef = ref()
	const selectedDevices = ref<any[]>([])
	const selectedDeviceIds = ref<Array<string | number>>([])
	const isUpdatingSelection = ref(false)
	const otherOrderRegion = ref<RegionValue>([])

	const cascaderProps = {
		checkStrictly: true,
		showPrefix: false,
		expandTrigger: 'hover' as const,
		emitPath: true,
		value: 'value',
		label: 'label',
		children: 'children',
		leaf: 'leaf'
	}

	const formData = ref({
		code: '',
		name: '',
		company_name: '',
		mobile: '',
		keyword: '',
		region: [] as RegionValue
	})

	const careateForm = ref({
		type: orderType,
		machine_data: [],
		form_data: {}
	})

	const formValue = ref<any[]>([])

	const normalizeRegion = (region: RegionValue = []) => {
		return region.filter((item) => item !== '' && item !== null && item !== undefined)
	}

	const getDeviceRegion = (device: any): RegionValue => {
		const province = device.province_id ?? device.province ?? ''
		if (Number(province) === OVERSEAS_REGION_ID) {
			return [OVERSEAS_REGION_ID]
		}
		const city = device.city_id ?? device.city ?? ''
		const area = device.area_id ?? device.area ?? ''
		return normalizeRegion([province, city, area]).map((item) => Number(item))
	}

	const normalizeRegionOptions = (regions: any[] = []) => {
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

	const isOverseasRegion = (region: RegionValue = []) => Number(region[0]) === OVERSEAS_REGION_ID

	const isCompleteRegion = (region: RegionValue = []) => isOverseasRegion(region) || normalizeRegion(region).length === 3

	const buildRegionParams = (region: RegionValue = []) => {
		if (isOverseasRegion(region)) {
			return {
				province: OVERSEAS_REGION_ID,
				city: OVERSEAS_REGION_ID,
				area: OVERSEAS_REGION_ID
			}
		}
		return {
			province: Number(region[0]),
			city: Number(region[1]),
			area: Number(region[2])
		}
	}

	const buildSelectedDevice = (device: any, currentDevice?: any) => {
		const region = getDeviceRegion(device)
		return {
			...device,
			...currentDevice,
			region: currentDevice?.region ? [...currentDevice.region] : [...region],
			originalRegion: currentDevice?.originalRegion ? [...currentDevice.originalRegion] : [...region],
			address: currentDevice?.address ?? device.address ?? '',
			originalAddress: currentDevice?.originalAddress ?? device.address ?? ''
		}
	}

	const isDeviceSelected = (device: any) => {
		return selectedDeviceIds.value.includes(device.id)
	}

	const toggleDeviceSelection = (device: any) => {
		const index = selectedDeviceIds.value.indexOf(device.id)
		if (index > -1) {
			selectedDeviceIds.value.splice(index, 1)
			selectedDevices.value.splice(index, 1)
		} else {
			selectedDeviceIds.value.push(device.id)
			selectedDevices.value.push(buildSelectedDevice(device))
		}
		updateTableSelection()
	}

	const handleSelectionChange = (selection: any[]) => {
		if (isUpdatingSelection.value) {
			return
		}

		const currentPageIds = tableData.value.map((item) => item.id)
		const currentSelectedMap = new Map(selectedDevices.value.map((device) => [device.id, device]))
		const devicesOutsideCurrentPage = selectedDevices.value.filter(
			(device) => !currentPageIds.includes(device.id)
		)
		const currentPageSelectedDevices = selection.map((device) => {
			return buildSelectedDevice(device, currentSelectedMap.get(device.id))
		})

		selectedDevices.value = [...devicesOutsideCurrentPage, ...currentPageSelectedDevices]
		selectedDeviceIds.value = selectedDevices.value.map((device) => device.id)
	}

	const updateTableSelection = () => {
		if (!tableRef.value) {
			return
		}

		isUpdatingSelection.value = true
		tableData.value.forEach((row) => {
			tableRef.value.toggleRowSelection(row, selectedDeviceIds.value.includes(row.id))
		})
		isUpdatingSelection.value = false
	}

	const removeDevice = (index: number) => {
		selectedDevices.value.splice(index, 1)
		selectedDeviceIds.value.splice(index, 1)
		updateTableSelection()
	}

	const buildMachineDataPayload = () => {
		return selectedDevices.value.map((device) => {
			const region = normalizeRegion(device.region || [])
			const originalRegion = normalizeRegion(device.originalRegion || [])
			const address = (device.address || '').trim()
			const originalAddress = (device.originalAddress || '').trim()
			const regionChanged =
				region.length !== originalRegion.length ||
				region.some((item, index) => Number(item) !== Number(originalRegion[index]))
			const addressChanged = address !== originalAddress

			if (!regionChanged && !addressChanged) {
				return { id: device.id }
			}

			if (!isCompleteRegion(region) || !address) {
				throw new Error('请完善设备地址信息后再提交')
			}

			return {
				id: device.id,
				...buildRegionParams(region),
				address
			}
		})
	}

	const confirmSelection = () => {
		dialogVisible.value = false
	}

	const submit = async () => {
		if (!isOtherOrderType && selectedDevices.value.length === 0) {
			ElMessage.error('请至少选择一个设备')
			return
		}
		if (isOtherOrderType && !isCompleteRegion(otherOrderRegion.value)) {
			ElMessage.error('请选择省市区')
			return
		}

		const params: Record<string, any> = {
			type: careateForm.value.type,
			machine_data: buildMachineDataPayload(),
			form_data: normalizeImageValue(fromList.value),
			user_id: route.query.user_id,
			...restoreFormData(formValue.value)
		}

		if (isOtherOrderType) {
			const region = normalizeRegion(otherOrderRegion.value)
			Object.assign(params, buildRegionParams(region))
		}

		loading.value = true
		try {
			await createOrderMore(params)
			ElMessage.success('创建成功')
			router.back()
		} catch (err: any) {
			if (err?.message) {
				ElMessage.error(err.message)
			}
		} finally {
			loading.value = false
		}
	}

	const getmachineLists = async () => {
		const params: Record<string, any> = {
			page_size: 10,
			page_no: pageNum.value,
			...formData.value
		}

		if (formData.value.region && formData.value.region.length > 0) {
			params.province = formData.value.region[0] || ''
			params.city = formData.value.region[1] || ''
			params.district = formData.value.region[2] || ''
		}

		delete params.region
		isUpdatingSelection.value = true
		const { lists, count } = await getmachineListsApi(params)
		tableData.value = lists
		totalCount.value = count

		setTimeout(() => {
			updateTableSelection()
			isUpdatingSelection.value = false
		}, 0)
	}

	const tapSearch = () => {
		pageNum.value = 1
		getmachineLists()
	}

	const currentChange = (page: number) => {
		pageNum.value = page
		getmachineLists()
	}

	const restData = () => {
		formData.value = {
			code: '',
			name: '',
			company_name: '',
			mobile: '',
			keyword: '',
			region: []
		}
		currentChange(1)
	}

	const getAllRegion = async () => {
		const res = await allRegion({})
		cityList.value = normalizeRegionOptions(res || [])
	}

	function normalizeImageValue(list: any[]) {
		return list.map((item) => {
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

	onMounted(() => {
		getOrderForm({
			type: orderType,
			step: 1
		}).then((res) => {
			fromList.value = res
			if (orderType === 1 || orderType === 4) {
				const data =
					orderType === 1
						? {
								applicant: '',
								applicant_mobile: ''
							}
						: {
								product_type: '',
								notice_theme: '',
								theme: '',
								rectification_reason: '',
								rectification_content: '',
								after_sales_attachment: '',
								after_sales_file: ''
							}
				formValue.value = buildTemplateFromFormKeys({
					formValue: data,
					cateId: 5,
					cateName: '基本信息',
					cateSort: 1
				})
			}
		})

		if (!isOtherOrderType) {
			getmachineLists()
		}
		getAllRegion()
	})
</script>

<style lang="scss">
	.uw-caeat-order {
		background: #ffffff;
		box-shadow: 0 0 30px 0 rgba(245, 225, 228, 0.5);
		border-radius: 16px;
		padding: 56px 20px 0 102px;
		width: 100%;
		min-height: calc(100vh - 91px - 32px);
		position: relative;

		.back {
			position: absolute;
			left: 20px;
			top: 20px;
			cursor: pointer;
		}

		h1 {
			font-weight: 400;
			font-size: 20px;
			color: #191919;
			line-height: 28px;
		}

		.left {
			flex: 0 0 40%;
		}

		.right {
			flex: 0 0 40%;
		}
	}

	.custom-header {
		h4 {
			font-size: 18px;
			font-weight: 600;
			margin: 0;
		}
	}

	.selected-devices-box {
		padding: 12px;
		background: #f0f9eb;
		border: 1px solid #e1f3d8;
		border-radius: 8px;

		.selected-devices-title {
			color: #67c23a;
			font-weight: 600;
			margin-bottom: 8px;
			display: flex;
			align-items: center;
			gap: 6px;
		}
	}

	.selected-devices-list {
		max-height: calc(100vh - 91px - 32px - 200px);
		overflow-y: auto;

		.label-width {
			display: inline-block;
			min-width: 80px;
			color: #666;
		}

		.device-info {
			flex: 1;
		}

		.device-edit-form {
			margin-top: 16px;
			padding-top: 16px;
			border-top: 1px solid #f0f0f0;
		}

		.address-tip {
			margin-bottom: 12px;
			color: #909399;
			font-size: 12px;
			line-height: 18px;
		}
	}

	.device-empty-tip {
		display: flex;
		align-items: center;
		justify-content: center;
		min-height: 160px;
		color: #909399;
		font-size: 14px;
		background: #fafafa;
		border: 1px dashed #dcdfe6;
		border-radius: 8px;
	}

	.text-primary {
		color: #409eff;
		font-weight: 600;

		.selected-count {
			font-size: 20px;
			font-weight: bold;
			margin: 0 4px;
		}
	}

	.text-success {
		color: #67c23a !important;
		font-weight: 600;
	}

	.mb-4 {
		margin-bottom: 16px;
	}

	.mr-2 {
		margin-right: 8px;
	}

	.mb-2 {
		margin-bottom: 8px;
	}
</style>
