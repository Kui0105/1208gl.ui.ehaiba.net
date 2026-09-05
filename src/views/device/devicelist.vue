<template>
	<div>
		<el-form class="uw-form" inline>
			<el-form-item label="设备名称">
				<el-input v-model="formData.name" placeholder="请输入设备名称"></el-input>
			</el-form-item>
			<el-form-item label="设备编号">
				<el-input v-model="formData.code" placeholder="请输入设备编号"></el-input>
			</el-form-item>
			<el-form-item label="单位名称">
				<el-input v-model="formData.company_name" placeholder="请输入单位名称"></el-input>
			</el-form-item>
			<el-form-item label="联系电话">
				<el-input v-model="formData.mobile" placeholder="请输入联系电话"></el-input>
			</el-form-item>
			<el-form-item label="负责人绑定">
				<el-select v-model="formData.is_bind_engineer" placeholder="全部" clearable style="width: 160px;">
					<el-option label="已绑定" :value="1"></el-option>
					<el-option label="未绑定" :value="0"></el-option>
				</el-select>
			</el-form-item>
			<el-form-item label="绑定负责人">
				<el-select
					v-model="formData.engineer_id"
					placeholder="全部负责人"
					filterable
					clearable
					style="width: 260px;"
					popper-class="engineer-select-dropdown"
				>
					<el-option
						v-for="item in engineerOptions.filter((item) => item.id !== 0)"
						:key="item.id"
						:label="getEngineerOptionLabel(item)"
						:value="item.id"
					>
						<div class="engineer-option">
							<div class="engineer-option-main">
								<span>{{ item.name }}</span>
								<span>{{ item.mobile || '-' }}</span>
							</div>
							<div class="engineer-option-sub">
								<span>类型：{{ item.type_str || '-' }}</span>
								<span>等级：{{ item.level_str || '-' }}</span>
								<span>上级：{{ item.parent_name || '-' }}</span>
							</div>
						</div>
					</el-option>
				</el-select>
			</el-form-item>
			<el-form-item label="是否租赁">
				<el-select v-model="formData.is_rent" placeholder="全部" clearable style="width: 120px"><el-option label="是" :value="1" /><el-option label="否" :value="0" /></el-select>
			</el-form-item>
			<el-form-item label="使用项目">
				<el-select v-model="formData.use_project" placeholder="全部" clearable style="width: 120px"><el-option v-for="item in projectOptions" :key="item" :label="item" :value="item" /></el-select>
			</el-form-item>
			<el-form-item>
				<el-button type="primary" @click="currentChange(1)">查询</el-button>
				<el-button @click="restData">重置</el-button>
				<el-button v-perms="['machine.machine/add']" type="primary" plain @click="openAddDialog">新增设备</el-button>
				<el-button
					v-perms="['machine.machine/batch_bind_engineer']"
					type="primary"
					plain
					@click="openBatchBindDialog"
				>
					批量绑定负责人
				</el-button>
				<export-data class="ml-2.5" :fetch-fun="getmachineListsApi" :params="formData" :page-size="10" />
			</el-form-item>
		</el-form>

		<div class="uw-box">
			<el-table :data="tableData" @selection-change="handleSelectionChange">
				<el-table-column type="selection" width="55"></el-table-column>
				<el-table-column label="序号" min-width="80">
					<template #default="{ $index }">
						{{ (pageNum - 1) * pageSize + $index + 1 }}
					</template>
				</el-table-column>
				<el-table-column prop="code" label="设备编号" min-width="150"></el-table-column>
				<el-table-column prop="name" label="设备名称" min-width="140"></el-table-column>
				<el-table-column prop="company_name" label="单位名称" min-width="160"></el-table-column>
				<el-table-column prop="contact" label="负责人" min-width="110"></el-table-column>
				<el-table-column prop="mobile" label="联系电话" min-width="120"></el-table-column>
				<el-table-column prop="bind_engineer_name" label="绑定负责人" min-width="120"></el-table-column>
				<el-table-column prop="bind_engineer_mobile" label="负责人电话" min-width="120"></el-table-column>
				<el-table-column prop="is_bind_engineer_desc" label="绑定状态" min-width="100"></el-table-column>
				<el-table-column prop="addresss" label="使用地区" min-width="150"></el-table-column>
				<el-table-column prop="address" label="详细地址" min-width="180"></el-table-column>
			<el-table-column prop="is_rent" label="是否租赁" min-width="100"><template #default="{ row }">{{ row.is_rent === null || row.is_rent === '' ? '-' : Number(row.is_rent) === 1 ? '是' : '否' }}</template></el-table-column>
			<el-table-column prop="use_project" label="使用项目" min-width="100"></el-table-column>
				<el-table-column prop="status_desc" label="状态" min-width="90" v-perms="['machine.machine/change_field']">
					<template #default="{ row }">
						<el-tag
							:type="row.status == 1 ? 'success' : 'danger'"
							class="status-tag"
							@click="toggleStatus(row)"
						>
							{{ row.status_desc }}
						</el-tag>
					</template>
				</el-table-column>
				<el-table-column prop="update_time" label="同步时间" min-width="160"></el-table-column>
				<el-table-column label="操作" fixed="right" min-width="220">
					<template #default="{ row }">
						<el-button type="text" @click="openWindow(row)">详情</el-button>
						<el-button v-perms="['machine.machine/edit_machine']" type="text" @click="openEditDialog(row)">编辑</el-button>
						<el-button v-perms="['machine.machine/bind_engineer']" type="text" @click="openBindDialog(row)">绑定负责人</el-button>
						<el-button v-perms="['machine.machine/delete']" type="text" @click="removeItme(row)">删除</el-button>
					</template>
				</el-table-column>
			</el-table>
			<div class="pagination-wrap">
				<span class="pagination-total">共 {{ totalCount }} 条</span>
				<el-pagination
					background
					layout="prev, pager, next"
					:total="totalCount"
					hide-on-single-page
					@current-change="currentChange"
				/>
			</div>
		</div>

		<el-dialog v-model="addDialogVisible" title="新增设备" width="700px">
			<el-form ref="addFormRef" :model="addFormData" :rules="formRules" label-width="100px">
				<el-form-item label="设备名称" prop="name">
					<el-input v-model="addFormData.name" placeholder="请输入设备名称"></el-input>
				</el-form-item>
				<el-form-item label="设备编号" prop="code">
					<el-input v-model="addFormData.code" placeholder="请输入设备编号"></el-input>
				</el-form-item>
				<el-form-item label="设备型号" prop="cate">
					<el-select
						v-model="addFormData.cate"
						placeholder="请选择设备型号编码"
						filterable
						clearable
						style="width: 100%;"
					>
						<el-option
							v-for="item in machineCateOptions"
							:key="item"
							:label="item"
							:value="item"
						></el-option>
					</el-select>
				</el-form-item>
				<el-form-item label="设备类型">
					<el-input v-model="addFormData.type" placeholder="请输入设备类型"></el-input>
				</el-form-item>
				<el-form-item label="是否租赁" prop="is_rent">
					<el-radio-group v-model="addFormData.is_rent"><el-radio :label="1">是</el-radio><el-radio :label="0">否</el-radio></el-radio-group>
				</el-form-item>
				<el-form-item label="使用项目" prop="use_project">
					<el-select v-model="addFormData.use_project" placeholder="请选择使用项目" style="width: 100%"><el-option v-for="item in projectOptions" :key="item" :label="item" :value="item" /></el-select>
				</el-form-item>
				<el-form-item label="单位名称" prop="company_name">
					<el-input v-model="addFormData.company_name" placeholder="请输入单位名称"></el-input>
				</el-form-item>
				<el-form-item label="负责人" prop="contact">
					<el-input v-model="addFormData.contact" placeholder="请输入负责人"></el-input>
				</el-form-item>
				<el-form-item label="联系电话" prop="mobile">
					<el-input v-model="addFormData.mobile" placeholder="请输入联系电话"></el-input>
				</el-form-item>
				<el-form-item label="绑定负责人">
					<el-select
						v-model="addFormData.engineer_id"
						placeholder="请选择负责人"
						filterable
						style="width: 100%;"
						popper-class="engineer-select-dropdown"
					>
						<el-option
							v-for="item in engineerOptions"
							:key="item.id"
							:label="getEngineerOptionLabel(item)"
							:value="item.id"
						>
							<div class="engineer-option" :class="{ 'engineer-option-unbind': item.id === 0 }">
								<template v-if="item.id === 0">
									<span>{{ item.name }}</span>
								</template>
								<template v-else>
									<div class="engineer-option-main">
										<span>{{ item.name }}</span>
										<span>{{ item.mobile || '-' }}</span>
									</div>
									<div class="engineer-option-sub">
										<span>类型：{{ item.type_str || '-' }}</span>
										<span>等级：{{ item.level_str || '-' }}</span>
										<span>上级：{{ item.parent_name || '-' }}</span>
									</div>
								</template>
							</div>
						</el-option>
					</el-select>
				</el-form-item>
				<el-form-item label="省市区" prop="region">
					<el-cascader
						v-model="addFormData.region"
						:options="cityList"
						:props="cascaderProps"
						placeholder="请选择省市区"
						style="width: 100%;"
						clearable
					/>
				</el-form-item>
				<el-form-item label="详细地址" prop="address">
					<el-input v-model="addFormData.address" placeholder="请输入详细地址"></el-input>
				</el-form-item>
				<el-form-item label="出厂日期">
					<el-date-picker
						v-model="addFormData.born_date"
						type="date"
						value-format="YYYY-MM-DD"
						placeholder="请选择出厂日期"
						style="width: 100%;"
					/>
				</el-form-item>
				<el-form-item label="到期日期">
					<el-date-picker
						v-model="addFormData.over_date"
						type="date"
						value-format="YYYY-MM-DD"
						placeholder="请选择服务到期日期"
						style="width: 100%;"
					/>
				</el-form-item>
				<el-form-item label="备注">
					<el-input
						v-model="addFormData.remark"
						type="textarea"
						:rows="4"
						placeholder="请输入备注"
					></el-input>
				</el-form-item>
				<el-form-item label="状态">
					<el-radio-group v-model="addFormData.status">
						<el-radio :label="1">正常</el-radio>
						<el-radio :label="0">禁用</el-radio>
					</el-radio-group>
				</el-form-item>
			</el-form>
			<template #footer>
				<el-button @click="addDialogVisible = false">取消</el-button>
				<el-button type="primary" :loading="addSubmitting" @click="submitAdd">确定</el-button>
			</template>
		</el-dialog>

		<el-dialog v-model="editDialogVisible" title="编辑设备信息" width="700px">
			<el-form ref="editFormRef" :model="editFormData" :rules="formRules" label-width="100px">
				<el-form-item label="设备名称" prop="name">
					<el-input v-model="editFormData.name" placeholder="请输入设备名称"></el-input>
				</el-form-item>
				<el-form-item label="设备编号" prop="code">
					<el-input v-model="editFormData.code" placeholder="请输入设备编号"></el-input>
				</el-form-item>
				<el-form-item label="设备型号" prop="cate">
					<el-select
						v-model="editFormData.cate"
						placeholder="请选择设备型号编码"
						filterable
						clearable
						style="width: 100%;"
					>
						<el-option
							v-for="item in machineCateOptions"
							:key="item"
							:label="item"
							:value="item"
						></el-option>
					</el-select>
				</el-form-item>
				<el-form-item label="设备类型">
					<el-input v-model="editFormData.type" placeholder="请输入设备类型"></el-input>
				</el-form-item>
				<el-form-item label="是否租赁" prop="is_rent">
					<el-radio-group v-model="editFormData.is_rent"><el-radio :label="1">是</el-radio><el-radio :label="0">否</el-radio></el-radio-group>
				</el-form-item>
				<el-form-item label="使用项目" prop="use_project">
					<el-select v-model="editFormData.use_project" placeholder="请选择使用项目" style="width: 100%"><el-option v-for="item in projectOptions" :key="item" :label="item" :value="item" /></el-select>
				</el-form-item>
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
					<el-select
						v-model="editFormData.engineer_id"
						placeholder="请选择负责人"
						filterable
						style="width: 100%;"
						popper-class="engineer-select-dropdown"
					>
						<el-option
							v-for="item in engineerOptions"
							:key="item.id"
							:label="getEngineerOptionLabel(item)"
							:value="item.id"
						>
							<div class="engineer-option" :class="{ 'engineer-option-unbind': item.id === 0 }">
								<template v-if="item.id === 0">
									<span>{{ item.name }}</span>
								</template>
								<template v-else>
									<div class="engineer-option-main">
										<span>{{ item.name }}</span>
										<span>{{ item.mobile || '-' }}</span>
									</div>
									<div class="engineer-option-sub">
										<span>类型：{{ item.type_str || '-' }}</span>
										<span>等级：{{ item.level_str || '-' }}</span>
										<span>上级：{{ item.parent_name || '-' }}</span>
									</div>
								</template>
							</div>
						</el-option>
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
					<el-input
						v-model="editFormData.remark"
						type="textarea"
						:rows="4"
						placeholder="请输入备注"
					></el-input>
				</el-form-item>
				<el-form-item label="状态">
					<el-radio-group v-model="editFormData.status">
						<el-radio :label="1">正常</el-radio>
						<el-radio :label="0">禁用</el-radio>
					</el-radio-group>
				</el-form-item>
			</el-form>
			<template #footer>
				<el-button @click="editDialogVisible = false">取消</el-button>
				<el-button type="primary" :loading="editSubmitting" @click="submitEdit">确定</el-button>
			</template>
		</el-dialog>

		<el-dialog v-model="bindDialogVisible" :title="bindDialogTitle" width="700px">
			<el-form ref="bindFormRef" :model="bindFormData" :rules="bindRules" label-width="100px">
				<el-form-item label="绑定负责人" prop="engineer_id">
					<el-select
						v-model="bindFormData.engineer_id"
						placeholder="请选择负责人"
						filterable
						style="width: 100%;"
						popper-class="engineer-select-dropdown"
					>
						<el-option
							v-for="item in engineerOptions"
							:key="item.id"
							:label="getEngineerOptionLabel(item)"
							:value="item.id"
						>
							<div class="engineer-option" :class="{ 'engineer-option-unbind': item.id === 0 }">
								<template v-if="item.id === 0">
									<span>{{ item.name }}</span>
								</template>
								<template v-else>
									<div class="engineer-option-main">
										<span>{{ item.name }}</span>
										<span>{{ item.mobile || '-' }}</span>
									</div>
									<div class="engineer-option-sub">
										<span>类型：{{ item.type_str || '-' }}</span>
										<span>等级：{{ item.level_str || '-' }}</span>
										<span>上级：{{ item.parent_name || '-' }}</span>
									</div>
								</template>
							</div>
						</el-option>
					</el-select>
				</el-form-item>
			</el-form>
			<template #footer>
				<el-button @click="bindDialogVisible = false">取消</el-button>
				<el-button type="primary" :loading="bindSubmitting" @click="submitBind">确定</el-button>
			</template>
		</el-dialog>
	</div>
</template>

<script setup lang="ts">
	import { computed, onMounted, ref } from 'vue'
	import { useRouter } from 'vue-router'
	import { ElMessage, ElMessageBox } from 'element-plus'

	import { allRegion } from '@/api/perms/role'
	import { getEngineerLists } from '@/api/order/order'
	import {
		addmachineApi,
		batchBindMachineEngineerApi,
		bindMachineEngineerApi,
		changemachineFieldApi,
		deletemachineApi,
		editmachineApi,
		getMachineCateOptionsApi,
		getmachineListsApi
	} from '@/api/device/device'

	const OVERSEAS_REGION_ID = 990000
	const overseasRegionOption = {
		value: OVERSEAS_REGION_ID,
		label: '海外',
		leaf: true
	}

	const router = useRouter()
	const tableData = ref<any[]>([])
	const totalCount = ref(0)
	const pageNum = ref(1)
	const pageSize = 10
	const cityList = ref<any[]>([])
	const machineCateOptions = ref<string[]>([])
	const engineerOptions = ref<
		Array<{
			id: number
			name: string
			mobile: string
			type_str: string
			level_str: string
			parent_name: string
		}>
	>([{ id: 0, name: '不绑定', mobile: '', type_str: '', level_str: '', parent_name: '' }])
	const selectedRows = ref<any[]>([])
	const projectOptions = ['基建', '水利', '矿山']

	const addDialogVisible = ref(false)
	const editDialogVisible = ref(false)
	const bindDialogVisible = ref(false)

	const addSubmitting = ref(false)
	const editSubmitting = ref(false)
	const bindSubmitting = ref(false)

	const addFormRef = ref()
	const editFormRef = ref()
	const bindFormRef = ref()

	const bindMode = ref<'single' | 'batch'>('single')

	const cascaderProps = {
		checkStrictly: true,
		showPrefix: false,
		expandTrigger: 'click' as const,
		emitPath: true,
		value: 'value',
		label: 'label',
		children: 'children',
		leaf: 'leaf'
	}

	const createSearchFormData = () => ({
		code: '',
		name: '',
		company_name: '',
		mobile: '',
		engineer_id: undefined as '' | number | undefined,
		is_bind_engineer: undefined as '' | number | undefined,
		is_rent: undefined as '' | number | undefined,
		use_project: ''
	})

	const createDeviceFormData = () => ({
		id: '',
		name: '',
		code: '',
		cate: '',
		type: '',
		company_name: '',
		contact: '',
		mobile: '',
		engineer_id: 0,
		region: [] as Array<string | number>,
		address: '',
		born_date: '',
		over_date: '',
		remark: '',
		status: 1,
		is_rent: '' as '' | number,
		use_project: ''
	})

	const formData = ref(createSearchFormData())
	const addFormData = ref(createDeviceFormData())
	const editFormData = ref(createDeviceFormData())

	const bindFormData = ref({
		id: '',
		ids: [] as Array<string | number>,
		engineer_id: 0
	})

	const bindDialogTitle = computed(() => (bindMode.value === 'batch' ? '批量绑定负责人' : '绑定负责人'))

	const validateMobile = (_rule: any, value: string, callback: (error?: Error) => void) => {
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

	const bindRules = {
		engineer_id: [{ required: true, message: '请选择负责人', trigger: 'change' }]
	}

	const openWindow = (row: any) => {
		router.push({
			path: 'devicedetal',
			query: {
				id: row.id
			}
		})
	}

	const getEngineerOptionLabel = (item: {
		id: number
		name: string
		mobile: string
		type_str: string
		level_str: string
		parent_name: string
	}) => {
		if (item.id === 0) return item.name
		return `${item.type_str || '-'} / ${item.level_str || '-'} / ${item.name} / ${item.mobile || '-'} / ${item.parent_name || '无上级'}`
	}

	const normalizeEngineerOptions = (lists: any[] = []) => {
		const extra = lists
			.map((item) => ({
				id: Number(item.id ?? item.value ?? item.engineer_id ?? 0),
				name: item.name || item.label || item.realname || item.nickname || '',
				mobile: item.mobile || item.phone || '',
				type_str: item.type_str || item.type_desc || item.engineer_type_desc || item.engineer_type_name || '',
				level_str: item.level_str || item.level_desc || item.engineer_level_desc || item.engineer_level_name || '',
				parent_name: item.parent_info?.name || item.parent_name || ''
			}))
			.filter((item) => item.id > 0 && item.name)

		engineerOptions.value = [{ id: 0, name: '不绑定', mobile: '', type_str: '', level_str: '', parent_name: '' }, ...extra]
	}

	const getmachineLists = async () => {
		const { lists, count } = await getmachineListsApi({
			page_size: pageSize,
			page_no: pageNum.value,
			...formData.value
		})
		tableData.value = lists || []
		totalCount.value = count || 0
	}

	const getAllRegion = async () => {
		const res = await allRegion({})
		cityList.value = normalizeRegionOptions(res || [])
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

	const isOverseasRegion = (region: Array<string | number> = []) => Number(region[0]) === OVERSEAS_REGION_ID

	const buildRegionParams = (region: Array<string | number> = []) => {
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

	const getMachineCateOptions = async () => {
		const res = await getMachineCateOptionsApi()
		machineCateOptions.value = res || []
	}

	const getEngineerOptions = async () => {
		const res = await getEngineerLists({
			page_no: 1,
			page_size: 9999,
			bind_machine: 1
		})
		normalizeEngineerOptions(res?.lists || [])
	}

	const currentChange = (page: number) => {
		pageNum.value = page
		getmachineLists()
	}

	const restData = () => {
		formData.value = createSearchFormData()
		currentChange(1)
	}

	const buildRegionValues = (row: any) => {
		const province = row.province_id || row.province || ''
		if (Number(province) === OVERSEAS_REGION_ID) {
			return [OVERSEAS_REGION_ID]
		}
		const city = row.city_id || row.city || ''
		const area = row.area_id || row.area || ''
		return [province, city, area]
			.filter((item) => item !== '' && item !== null && item !== undefined)
			.map((item) => Number(item))
	}

	const normalizeRentValue = (value: any): '' | number => {
		return value === null || value === '' || value === undefined ? '' : Number(value)
	}

	const removeItme = (row: any) => {
		ElMessageBox.confirm('此操作将永久删除该设备，是否继续?', '提示', {
			confirmButtonText: '确定',
			cancelButtonText: '取消',
			type: 'warning'
		}).then(async () => {
			await deletemachineApi({ id: row.id })
			ElMessage.success('删除成功')
			currentChange(1)
		})
	}

	const openAddDialog = () => {
		addFormData.value = createDeviceFormData()
		addDialogVisible.value = true
	}

	const createEditFormData = (row: any) => ({
		id: row.id || '',
		name: row.name || '',
		code: row.code || '',
		cate: row.cate || '',
		type: row.type || '',
		company_name: row.company_name || '',
		contact: row.contact || '',
		mobile: row.mobile || '',
		engineer_id: Number(row.engineer_id ?? row.bind_engineer_id ?? 0),
		region: buildRegionValues(row),
		address: row.address || '',
		born_date: row.born_date || '',
		over_date: row.over_date || '',
		remark: row.remark || '',
		status: Number(row.status ?? 1),
		is_rent: normalizeRentValue(row.is_rent),
		use_project: row.use_project || ''
	})

	const openEditDialog = (row: any) => {
		editFormData.value = createEditFormData(row)
		editDialogVisible.value = true
	}

	const handleSelectionChange = (rows: any[]) => {
		selectedRows.value = rows
	}

	const openBindDialog = (row: any) => {
		bindMode.value = 'single'
		bindFormData.value = {
			id: row.id,
			ids: [],
			engineer_id: Number(row.engineer_id ?? row.bind_engineer_id ?? 0)
		}
		bindDialogVisible.value = true
	}

	const openBatchBindDialog = () => {
		if (!selectedRows.value.length) {
			ElMessage.error('请先选择设备')
			return
		}
		bindMode.value = 'batch'
		bindFormData.value = {
			id: '',
			ids: selectedRows.value.map((item) => item.id),
			engineer_id: 0
		}
		bindDialogVisible.value = true
	}

	const toggleStatus = async (row: any) => {
		const nextStatus = Number(row.status) === 1 ? 0 : 1
		const actionText = nextStatus === 1 ? '启用' : '禁用'
		await ElMessageBox.confirm(`确定要${actionText}该设备吗？`, '提示', {
			confirmButtonText: '确定',
			cancelButtonText: '取消',
			type: 'warning'
		})
		await changemachineFieldApi({
			field: 'status',
			value: nextStatus,
			id: row.id
		})
		ElMessage.success(`${actionText}成功`)
		getmachineLists()
	}

	const submitAdd = async () => {
		if (!addFormRef.value) return
		const valid = await addFormRef.value.validate().catch(() => false)
		if (!valid) return

		addSubmitting.value = true
		try {
			await addmachineApi({
				name: addFormData.value.name,
				code: addFormData.value.code,
				cate: addFormData.value.cate,
				type: addFormData.value.type,
				company_name: addFormData.value.company_name,
				contact: addFormData.value.contact,
				mobile: addFormData.value.mobile,
				engineer_id: addFormData.value.engineer_id,
				...buildRegionParams(addFormData.value.region),
				address: addFormData.value.address,
				born_date: addFormData.value.born_date,
				over_date: addFormData.value.over_date,
				remark: addFormData.value.remark,
				status: addFormData.value.status,
				is_rent: addFormData.value.is_rent,
				use_project: addFormData.value.use_project
			})
			ElMessage.success('新增成功')
			addDialogVisible.value = false
			currentChange(1)
		} finally {
			addSubmitting.value = false
		}
	}

	const submitEdit = async () => {
		if (!editFormRef.value) return
		const valid = await editFormRef.value.validate().catch(() => false)
		if (!valid) return

		editSubmitting.value = true
		try {
			const params: Record<string, any> = {
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
			if (editFormData.value.region.length > 0) {
				Object.assign(params, buildRegionParams(editFormData.value.region))
			}
			await editmachineApi(params)
			ElMessage.success('编辑成功')
			editDialogVisible.value = false
			currentChange(1)
		} finally {
			editSubmitting.value = false
		}
	}

	const submitBind = async () => {
		if (!bindFormRef.value) return
		const valid = await bindFormRef.value.validate().catch(() => false)
		if (!valid) return

		bindSubmitting.value = true
		try {
			if (bindMode.value === 'batch') {
				await batchBindMachineEngineerApi({
					ids: bindFormData.value.ids,
					engineer_id: bindFormData.value.engineer_id
				})
			} else {
				await bindMachineEngineerApi({
					id: bindFormData.value.id,
					engineer_id: bindFormData.value.engineer_id
				})
			}
			ElMessage.success(bindFormData.value.engineer_id === 0 ? '解绑成功' : '绑定负责人成功')
			bindDialogVisible.value = false
			selectedRows.value = []
			currentChange(pageNum.value)
		} finally {
			bindSubmitting.value = false
		}
	}

	onMounted(() => {
		getmachineLists()
		getAllRegion()
		getMachineCateOptions()
		getEngineerOptions()
	})
</script>

<style scoped>
	.uw-form {
		padding-left: 18px;
		padding-right: 18px;
		padding-top: 18px;
		background: #ffffff;
		box-shadow: 0 0 30px 0 rgba(245, 225, 228, 0.5);
		border-radius: 16px;
	}

	.uw-box {
		margin-top: 18px;
		background-color: #fff;
		padding: 18px;
		box-shadow: 0 0 30px 0 rgba(245, 225, 228, 0.5);
		border-radius: 16px;
	}

	.pagination-wrap {
		display: flex;
		align-items: center;
		justify-content: center;
		margin-top: 18px;
	}

	.status-tag {
		cursor: pointer;
	}

	.engineer-option {
		display: flex;
		flex-direction: column;
		gap: 4px;
		padding: 2px 0;
		line-height: 1.4;
	}

	.engineer-option-main {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 12px;
		color: #303133;
	}

	.engineer-option-sub {
		display: flex;
		flex-wrap: wrap;
		gap: 8px 16px;
		font-size: 12px;
		color: #909399;
		white-space: normal;
	}

	.engineer-option-unbind {
		color: #606266;
	}

	:deep(.engineer-select-dropdown .el-select-dropdown__item) {
		height: auto;
		line-height: normal;
		padding-top: 8px;
		padding-bottom: 8px;
	}
</style>

<style>
	.engineer-select-dropdown.el-select__popper {
		min-width: 520px !important;
	}

	.engineer-select-dropdown .el-select-dropdown__item {
		height: auto !important;
		line-height: normal !important;
		white-space: normal !important;
		padding-top: 8px;
		padding-bottom: 8px;
	}
</style>
