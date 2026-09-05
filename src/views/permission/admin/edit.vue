<template>
	<div class="edit-popup">
		<popup ref="popupRef" :title="popupTitle" :async="true" width="550px" @confirm="handleSubmit" @close="handleClose">
			<el-form ref="formRef" :model="formData" label-width="114px" :rules="formRules">
				<el-form-item label="手机号码" prop="account">
					<el-input v-model="formData.account" :disabled="formData.root == 1" placeholder="请输入手机号码" clearable />
				</el-form-item>

				<el-form-item label="姓名" prop="name">
					<el-input v-model="formData.name" placeholder="请输入姓名" clearable />
				</el-form-item>

				<el-form-item label="归属部门" prop="dept_id">
					<el-tree-select
						class="flex-1"
						v-model="formData.dept_id"
						:data="optionsData.dept"
						clearable
						node-key="id"
						:props="{
							value: 'id',
							label: 'name',
							disabled(data: any) {
								return data.id == 1
							}
						}"
						check-strictly
						:default-expand-all="true"
						placeholder="请选择上级部门"
					/>
				</el-form-item>

				<el-form-item label="是否是工程师" prop="is_engineer">
					<el-select class="flex-1" v-model="formData.is_engineer" clearable placeholder="请选择是否是工程师">
						<el-option label="是" :value="1" />
						<el-option label="否" :value="0" />
					</el-select>
				</el-form-item>

				<el-form-item v-if="formData.is_engineer == 1" label="工程师类型" prop="engineer_type">
					<el-select
						class="flex-1"
						v-model="formData.engineer_type"
						clearable
						:disabled="mode === 'edit'"
						placeholder="请选择工程师类型"
					>
						<el-option v-for="item in optionsData.types" :key="item.id" :label="item.name" :value="item.id" />
					</el-select>
				</el-form-item>

				<el-form-item v-if="showEngineerLevel" label="工程师等级" prop="engineer_level">
					<el-select class="flex-1" v-model="formData.engineer_level" clearable placeholder="请选择工程师等级">
						<el-option v-for="item in optionsData.leves" :key="item.id" :label="item.name" :value="item.id" />
					</el-select>
				</el-form-item>

				<el-form-item v-if="showParentEngineer" label="上级工程师" prop="parent_engineer_id">
					<el-select
						class="flex-1"
						v-model="formData.parent_engineer_id"
						clearable
						filterable
						loading-text="加载中"
						:loading="parentEngineerLoading"
						:placeholder="parentEngineerPlaceholder"
					>
						<el-option
							v-for="item in parentEngineerOptions"
							:key="item.id"
							:label="getParentOptionLabel(item)"
							:value="item.id"
						/>
					</el-select>
				</el-form-item>

				<el-form-item v-if="showCarCode" label="车牌号" prop="car_code">
					<el-input v-model="formData.car_code" placeholder="请输入车牌号" clearable />
				</el-form-item>

				<el-form-item v-if="formData.is_engineer == 1" label="OA编号" prop="num_code">
					<el-input v-model="formData.num_code" placeholder="请输入OA编号" clearable />
				</el-form-item>

				<el-form-item label="角色" prop="role_id" v-if="formData.root != 1">
					<el-select v-model="formData.role_id" :disabled="formData.root == 1" class="flex-1" multiple placeholder="请选择角色" clearable>
						<el-option v-for="item in optionsData.role" :key="item.id" :label="item.name" :value="item.id" />
					</el-select>
				</el-form-item>

				<el-form-item label="密码" prop="password">
					<el-input v-model="formData.password" show-password clearable placeholder="请输入密码" />
				</el-form-item>

				<el-form-item label="确认密码" prop="password_confirm">
					<el-input v-model="formData.password_confirm" show-password clearable placeholder="请输入确认密码" />
				</el-form-item>

				<el-form-item label="管理员状态" v-if="formData.root != 1">
					<el-switch v-model="formData.disable" :active-value="0" :inactive-value="1" />
				</el-form-item>
			</el-form>
		</popup>
	</div>
</template>

<script lang="ts" setup>
	import type { FormInstance } from 'element-plus'
	import { computed, reactive, ref, shallowRef, watch } from 'vue'
	import { getEngineerLists as getVisibleEngineerLists } from '@/api/app'
	import { deptAll } from '@/api/org/department'
	import { adminAdd, adminDetail, adminEdit } from '@/api/perms/admin'
	import { roleAll, engineerLevelAll, engineerTypeAll } from '@/api/perms/role'
	import Popup from '@/components/popup/index.vue'
	import { useDictOptions } from '@/hooks/useDictOptions'

	const emit = defineEmits(['success', 'close'])
	const formRef = shallowRef<FormInstance>()
	const popupRef = shallowRef<InstanceType<typeof Popup>>()
	const mode = ref<'add' | 'edit'>('add')
	const parentEngineerLoading = ref(false)
	const parentEngineerOptions = ref<Array<{ id: number; name: string; mobile: string; type_str: string }>>([])

	const parentTypeMap: Record<number, number> = {
		1: 0,
		2: 1,
		3: 2,
		4: 0
	}

	const createFormData = () => ({
		id: '',
		account: '',
		name: '',
		dept_id: null as number | null,
		role_id: [] as number[],
		avatar: '',
		password: '',
		password_confirm: '',
		disable: 0,
		multipoint_login: 1,
		root: 0,
		is_engineer: null as number | null,
		engineer_type: null as number | null,
		engineer_level: null as number | null,
		parent_engineer_id: null as number | null,
		car_code: '',
		num_code: ''
	})

	const formData = reactive(createFormData())

	const popupTitle = computed(() => (mode.value === 'edit' ? '编辑管理员' : '新增管理员'))
	const parentEngineerType = computed(() => parentTypeMap[Number(formData.engineer_type || 0)] || 0)
	const showEngineerLevel = computed(() => formData.is_engineer === 1 && Number(formData.engineer_type) !== 1)
	const showParentEngineer = computed(() => formData.is_engineer === 1 && parentEngineerType.value > 0)
	const showCarCode = computed(() => formData.is_engineer === 1 && [2, 3, 4].includes(Number(formData.engineer_type || 0)))
	const parentEngineerPlaceholder = computed(() => {
		if (parentEngineerType.value === 1) {
			return '请选择大区总'
		}
		if (parentEngineerType.value === 2) {
			return '请选择区总'
		}
		return '请选择上级工程师'
	})

	const passwordConfirmValidator = (_rule: object, value: string, callback: any) => {
		if (formData.password) {
			if (!value) {
				callback(new Error('请再次输入密码'))
				return
			}
			if (value !== formData.password) {
				callback(new Error('两次输入密码不一致!'))
				return
			}
		}
		callback()
	}

	const roleIdValidator = (_rule: object, _value: string, callback: any) => {
		if (formData.root || formData.role_id.length) {
			callback()
			return
		}
		callback(new Error('请选择角色'))
	}

	const engineerLevelValidator = (_rule: object, value: number | null, callback: any) => {
		if (!showEngineerLevel.value) {
			callback()
			return
		}
		if (!value) {
			callback(new Error('请选择工程师等级'))
			return
		}
		callback()
	}

	const parentEngineerValidator = (_rule: object, value: number | null, callback: any) => {
		if (!showParentEngineer.value) {
			callback()
			return
		}
		if (!value) {
			callback(new Error('请选择上级工程师'))
			return
		}
		callback()
	}

	const carCodeValidator = (_rule: object, value: string, callback: any) => {
		if (!showCarCode.value) {
			callback()
			return
		}
		if (!value) {
			callback(new Error('请输入车牌号'))
			return
		}
		callback()
	}

	const formRules = reactive({
		account: [
			{
				required: true,
				message: '请输入账号',
				trigger: ['blur']
			}
		],
		name: [
			{
				required: true,
				message: '请输入名称',
				trigger: ['blur']
			}
		],
		role_id: [
			{
				required: true,
				validator: roleIdValidator
			}
		],
		password: [
			{
				required: true,
				message: '请输入密码',
				trigger: ['blur']
			}
		] as any[],
		password_confirm: [
			{
				required: true,
				message: '请输入确认密码',
				trigger: ['blur']
			},
			{
				validator: passwordConfirmValidator,
				trigger: 'blur'
			}
		] as any[],
		is_engineer: [
			{
				required: true,
				message: '请选择是否为工程师',
				trigger: ['blur']
			}
		],
		engineer_type: [
			{
				required: true,
				message: '请选择工程师类型',
				trigger: ['blur']
			}
		],
		engineer_level: [
			{
				validator: engineerLevelValidator,
				trigger: ['blur', 'change']
			}
		] as any[],
		parent_engineer_id: [
			{
				validator: parentEngineerValidator,
				trigger: ['blur', 'change']
			}
		] as any[],
		car_code: [
			{
				validator: carCodeValidator,
				trigger: ['blur', 'change']
			}
		] as any[],
		num_code: [
			{
				required: true,
				message: '请输入OA编号',
				trigger: ['blur']
			}
		]
	})

	const { optionsData } = useDictOptions<{
		role: any[]
		dept: any[]
		types: any[]
		leves: any[]
	}>({
		role: {
			api: roleAll
		},
		dept: {
			api: deptAll
		},
		types: { api: engineerTypeAll },
		leves: { api: engineerLevelAll }
	})

	const resetFormData = () => {
		Object.assign(formData, createFormData())
		parentEngineerOptions.value = []
	}

	const setAddPasswordRules = () => {
		formRules.password = [
			{
				required: true,
				message: '请输入密码',
				trigger: ['blur']
			}
		]
		formRules.password_confirm = [
			{
				required: true,
				message: '请输入确认密码',
				trigger: ['blur']
			},
			{
				validator: passwordConfirmValidator,
				trigger: 'blur'
			}
		]
	}

	const setEditPasswordRules = () => {
		formRules.password = []
		formRules.password_confirm = [
			{
				validator: passwordConfirmValidator,
				trigger: 'blur'
			}
		]
	}

	const getParentOptionLabel = (item: { name: string; mobile: string; type_str: string }) => {
		return `${item.type_str || '-'} / ${item.name} / ${item.mobile || '-'}`
	}

	const loadParentEngineerOptions = async () => {
		if (!showParentEngineer.value) {
			parentEngineerOptions.value = []
			return
		}

		parentEngineerLoading.value = true
		try {
			const res = await getVisibleEngineerLists({
				page_no: 1,
				page_size: 9999,
				type: parentEngineerType.value
			})
			parentEngineerOptions.value = (res?.lists || [])
				.map((item: any) => ({
					id: Number(item.id ?? 0),
					name: item.name || '',
					mobile: item.mobile || '',
					type_str: item.type_str || ''
				}))
				.filter((item: { id: number; name: string }) => item.id > 0 && item.name)
		} finally {
			parentEngineerLoading.value = false
		}
	}

	watch(
		() => [formData.is_engineer, formData.engineer_type],
		async () => {
			if (formData.is_engineer !== 1) {
				formData.engineer_type = null
				formData.engineer_level = null
				formData.parent_engineer_id = null
				formData.car_code = ''
				formData.num_code = ''
				parentEngineerOptions.value = []
				return
			}

			if (!showEngineerLevel.value) {
				formData.engineer_level = null
			}
			if (!showParentEngineer.value) {
				formData.parent_engineer_id = null
			}
			if (!showCarCode.value) {
				formData.car_code = ''
			}

			await loadParentEngineerOptions()
		},
		{ immediate: true }
	)

	const handleSubmit = async () => {
		await formRef.value?.validate()
		mode.value === 'edit' ? await adminEdit(formData) : await adminAdd(formData)
		popupRef.value?.close()
		emit('success')
	}

	const open = (type: 'add' | 'edit' = 'add') => {
		mode.value = type
		resetFormData()
		setAddPasswordRules()
		popupRef.value?.open()
	}

	const setFormData = async (row: any) => {
		setEditPasswordRules()
		resetFormData()
		const data = await adminDetail({ id: row.id })
		Object.assign(data, data.engineer_info || {})
		for (const key in formData) {
			if (data[key] == null) {
				continue
			}
			if (key === 'dept_id') {
				formData[key] = data[key][0]
				continue
			}
			formData[key] = data[key]
		}
		await loadParentEngineerOptions()
	}

	const handleClose = () => {
		emit('close')
	}

	defineExpose({
		open,
		setFormData
	})
</script>
