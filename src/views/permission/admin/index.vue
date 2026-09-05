<template>
	<div class="admin">
		<el-card class="!border-none" shadow="never">
			<el-form class="mb-[-16px]" :model="formData" inline>
				<el-form-item class="w-[280px]" label="管理员账号">
					<el-input v-model="formData.account" placeholder="请输入管理员账号" clearable @keyup.enter="resetPage" />
				</el-form-item>
				<el-form-item class="w-[280px]" label="管理员名称">
					<el-input v-model="formData.name" placeholder="请输入管理员名称" clearable @keyup.enter="resetPage" />
				</el-form-item>
				<el-form-item class="w-[280px]" label="管理员角色">
					<el-select v-model="formData.role_id">
						<el-option label="全部" value="" />
						<el-option v-for="(item, index) in optionsData.role" :key="index" :label="item.name"
							:value="item.id" />
					</el-select>
				</el-form-item>
				<el-form-item class="w-[280px]" label="工程师等级">
					<el-select v-model="formData.level">
						<el-option label="全部" value="" />
						<el-option v-for="(item, index) in optionsData.leves" :key="index" :label="item.name"
							:value="item.id" />
					</el-select>
				</el-form-item>
				<el-form-item>
					<el-button type="primary" @click="resetPage">查询</el-button>
					<el-button @click="resetParams">重置</el-button>
					<export-data class="ml-2.5" :fetch-fun="adminLists" :params="formData" :page-size="pager.size" />
				</el-form-item>
			</el-form>
		</el-card>
		<el-row :gutter="16">
			<el-col :span="4">
				<div class="pt-[16px]" style="height: 100%;">
					<div class="flex items-center gap-2 mb-4">
						<el-input v-model="deptFilterText" placeholder="输入部门名称筛选" clearable @input="handleFilterInput" />
						<el-button @click="toggleExpandAll" circle>
							<template #icon>
								<icon :name="isAllExpanded ? 'el-icon-Minus' : 'el-icon-Plus'" />
							</template>
						</el-button>
					</div>
					<el-tree ref="treeRef" class="uw-left-box" node-key="id" :data="filteredTreeData" :props="treeProps"
						:default-expanded-keys="defaultExpandedKeys" :default-checked-keys="[dept_id]"
						@node-click="handleNodeClick">
						<template #default="{ node, data }">
							<span v-html="highlightText(node.label, deptFilterText)"></span>
						</template>
					</el-tree>
				</div>
			</el-col>
			<el-col :span="20">
				<el-card v-loading="pager.loading" class="mt-4 !border-none" shadow="never">
					<el-button v-perms="['auth.admin/add']" type="primary" @click="handleAdd">
						<template #icon>
							<icon name="el-icon-Plus" />
						</template>
						新增
					</el-button>
					<el-button type="primary" plain @click="openBumen">部门管理</el-button>
					<div class="mt-4">
						<el-table :data="pager.lists" size="large" height="calc(100vh - 350px)">
							<el-table-column label="序号" min-width="60">
								<template #default="{ $index }">
									{{ (pager.page - 1) * pager.size + $index + 1 }}
								</template>
							</el-table-column>
							<el-table-column label="头像" min-width="100">
								<template #default="{ row }">
									<el-avatar :size="50" :src="row.avatar"></el-avatar>
								</template>
							</el-table-column>
							<el-table-column label="账号" prop="account" min-width="100" />
							<el-table-column label="名称" prop="name" min-width="100" />
							<el-table-column label="角色" prop="role_name" min-width="100" show-tooltip-when-overflow />
							<!-- <el-table-column label="部门" prop="dept_name" min-width="100" show-tooltip-when-overflow /> -->
							<el-table-column label="身份" prop="engineer_info.type_str" min-width="100">
								<template #default="{ row }">
									{{ row.engineer_info?.type_str || '-' }}
								</template>
							</el-table-column>
							<el-table-column label="等级" prop="engineer_info.level_str" min-width="100">
								<template #default="{ row }">
									<el-tag :type="levelMap[row.engineer_info?.level]?.type || 'info'">
										{{ levelMap[row.engineer_info?.level]?.name || '-' }}
									</el-tag>
								</template>
							</el-table-column>
							<el-table-column label="上级工程师" min-width="180" show-tooltip-when-overflow>
								<template #default="{ row }">
									{{ row.engineer_info?.parent_info?.name || '-' }}
								</template>
							</el-table-column>
							<el-table-column label="车牌号" prop="engineer_info.car_code" min-width="100" />
							<!-- <el-table-column label="驻地" prop="engineer_info.area_arr" min-width="100" /> -->
							<el-table-column label="创建时间" prop="create_time" min-width="180" />
							<!-- <el-table-column label="最近登录时间" prop="login_time" min-width="180" /> -->
							<!-- <el-table-column label="最近登录IP" prop="login_ip" min-width="120" /> -->
							<el-table-column label="状态" min-width="100" v-perms="['auth.admin/edit']">
								<template #default="{ row }">
									<el-switch v-if="row.root != 1" v-model="row.disable" :active-value="0"
										:inactive-value="1" @change="changeStatus(row)" />
								</template>
							</el-table-column>
							<el-table-column label="操作" width="150" fixed="right">
								<template #default="{ row }">
									<el-button
										v-if="row.is_engineer && [1, 2, 3].includes(Number(row.engineer_info?.type || 0))"
										type="primary"
										link
										@click="openWindow(row)"
									>
										管理设备
									</el-button>
									<el-button type="primary" link @click="beizhuShow=true,remark=row">备注</el-button>
									<el-button v-perms="['auth.admin/edit']" type="primary" link
										@click="handleEdit(row)">
										编辑
									</el-button>
									<el-button v-if="row.root != 1" v-perms="['auth.admin/delete']" type="danger" link
										@click="handleDelete(row.id)">
										删除
									</el-button>
								</template>
							</el-table-column>
						</el-table>
					</div>
					<div class="flex mt-4 justify-end items-center gap-4">
						<span>共 {{ pager.count || 0 }} 条</span>
						<pagination v-model="pager" @change="getLists" />
					</div>
				</el-card>
			</el-col>
		</el-row>

		<edit-popup v-if="showEdit" ref="editRef" @success="getLists" @close="showEdit = false" />

		<!-- 备注弹窗 -->
		<el-dialog title="备注" v-model="beizhuShow" width="500px">
			<el-input v-model="remark.remark" type="textarea" placeholder="请输入内容" />
			<template #footer>
				<span class="dialog-footer">
					<el-button @click="beizhuShow = false">取 消</el-button>
					<el-button type="primary" @click="handlebeizhu(remark)">确 定</el-button>
				</span>
			</template>
		</el-dialog>
	</div>
</template>

<script lang="ts" setup name="admin">
	import { adminDelete, adminEdit, adminLists } from '@/api/perms/admin'
	import { roleAll, engineerRemark, engineerLevelAll } from '@/api/perms/role'
	import { deptLists } from '@/api/org/department'
	import { useDictOptions } from '@/hooks/useDictOptions'
	import { useRouter } from 'vue-router'
	import { usePaging } from '@/hooks/usePaging'
	import feedback from '@/utils/feedback'
	import { nextTick } from 'vue'

	import EditPopup from './edit.vue';
	const levelMap : Record<number, { name : string; type : string }> = {
		1: { name: '学员', type: 'info' },
		2: { name: '初级', type: 'info' },
		3: { name: '中级', type: 'warning' },
		4: { name: '中I', type: 'warning' },
		5: { name: '中II', type: 'warning' },
		6: { name: '高级', type: 'success' },
		7: { name: '高Ⅰ', type: 'success' },
		8: { name: '高Ⅱ', type: 'success' },
		9: { name: '高Ⅲ', type: 'success' },
		10: { name: '高Ⅳ', type: 'success' },
		11: { name: '高Ⅴ', type: 'success' },
		12: { name: '高Ⅵ', type: 'success' },
		13: { name: '高Ⅶ', type: 'success' },
		14: { name: '高Ⅷ', type: 'success' },
		15: { name: '专家', type: 'danger' }
	}
	const beizhuShow = ref(false)
	const remark = ref({})
	const router = useRouter()
	const treeData = ref([])
	const treeRef = ref()
	const deptFilterText = ref('')
	const expandedKeys = ref<number[]>([])
	const defaultExpandedKeys = ref<number[]>([])
	const isAllExpanded = ref(true)
	const treeProps = {
		children: 'children',
		label: 'name',
	}
	const dept_id = ref(1)
	const editRef = shallowRef<InstanceType<typeof EditPopup>>()
	// 表单数据
	const formData = reactive({
		account: '',
		name: '',
		role_id: '',
		level: '',
		dept_id: 1
	})
	const showEdit = ref(false)
	const { pager, getLists, resetParams, resetPage } = usePaging({
		fetchFun: adminLists,
		params: formData
	})

	const changeStatus = (data : any) => {
		adminEdit({
			id: data.id,
			avatar: data.avatar,
			account: data.account,
			name: data.name,
			role_id: data.role_id,
			job_id: data.job_id,
			dept_id: data.dept_id,
			disable: data.disable,
			multipoint_login: data.multipoint_login
		}).finally(() => {
			getLists()
		})
	}
	const handleAdd = async () => {
		showEdit.value = true
		await nextTick()
		editRef.value?.open('add')
	}

	const handleEdit = async (data : any) => {
		showEdit.value = true
		await nextTick()
		editRef.value?.open('edit')
		editRef.value?.setFormData(data)
	}

	const handleDelete = async (id : number) => {
		await feedback.confirm('确定要删除？')
		await adminDelete({ id })
		getLists()
	}

	const { optionsData } = useDictOptions<{ role : any[], leves : any[] }>({
		role: {
			api: roleAll
		},
		leves: {
			api: engineerLevelAll
		}
	})
	const getDeptLists = async () => {
		treeData.value = await deptLists();
		nextTick(() => {
			const allKeys = getAllNodeKeys(treeData.value)
			defaultExpandedKeys.value = [...allKeys]
			expandedKeys.value = [...allKeys]
		});
	}

	const getAllNodeKeys = (data: any[]): number[] => {
		const keys: number[] = []
		for (const item of data) {
			if (item.children && item.children.length > 0) {
				keys.push(item.id)
				keys.push(...getAllNodeKeys(item.children))
			}
		}
		return keys
	}

	const expandAllNodes = () => {
		const nodes = treeRef.value?.store?.nodesMap
		if (nodes) {
			Object.values(nodes).forEach((node: any) => {
				node.expanded = true
			})
		}
		isAllExpanded.value = true
	}

	const collapseAllNodes = () => {
		const nodes = treeRef.value?.store?.nodesMap
		if (nodes) {
			Object.values(nodes).forEach((node: any) => {
				node.expanded = false
			})
		}
		isAllExpanded.value = false
	}

	const toggleExpandAll = () => {
		if (isAllExpanded.value) {
			collapseAllNodes()
		} else {
			expandAllNodes()
		}
	}
	const handleNodeClick = (row) => {
		dept_id.value = row.id
		formData.dept_id = row.id
		resetPage()
	}
	const openBumen = () => {
		router.push({ path: '/permission/department' })
	}
	const openWindow = ({ engineer_info: { id } }) => {
		router.push({ path: '/permission/adminDetails', query: { id } })
	}
	const handlebeizhu = async ({ id, remark }) => {
		await engineerRemark({ id, remark })
		beizhuShow.value = false
	}

	const highlightText = (text: string, keyword: string): string => {
		if (!keyword) return text
		const regex = new RegExp(`(${keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi')
		return text.replace(regex, '<span style="color: #409eff; font-weight: bold;">$1</span>')
	}

	const handleFilterInput = () => {
		if (!deptFilterText.value) {
			nextTick(() => {
				if (isAllExpanded.value) {
					expandAllNodes()
				} else {
					collapseAllNodes()
				}
			})
		} else {
			nextTick(() => {
				const nodes = treeRef.value?.store?.nodesMap
				if (nodes) {
					const keys: number[] = []
					collectExpandedKeys(treeData.value, deptFilterText.value, keys)
					Object.values(nodes).forEach((node: any) => {
						node.expanded = keys.includes(node.data.id)
					})
				}
			})
		}
	}

	const collectExpandedKeys = (data: any[], text: string, keys: number[] = []): boolean => {
		if (!text) return false
		let hasMatch = false
		for (const item of data) {
			const selfMatch = item.name.toLowerCase().includes(text.toLowerCase())
			if (selfMatch) {
				if (!keys.includes(item.id)) {
					keys.push(item.id)
				}
				hasMatch = true
			}
			if (item.children && item.children.length > 0) {
				const childMatch = collectExpandedKeys(item.children, text, keys)
				if (childMatch) {
					if (!keys.includes(item.id)) {
						keys.push(item.id)
					}
					hasMatch = true
				}
			}
		}
		return hasMatch
	}

	const filterTree = (data: any[], text: string): any[] => {
		if (!text) return data
		const result: any[] = []
		for (const item of data) {
			if (item.name.toLowerCase().includes(text.toLowerCase())) {
				result.push(item)
			} else if (item.children && item.children.length > 0) {
				const filteredChildren = filterTree(item.children, text)
				if (filteredChildren.length > 0) {
					result.push({ ...item, children: filteredChildren })
				}
			}
		}
		return result
	}

	const filteredTreeData = computed(() => {
		return filterTree(treeData.value, deptFilterText.value)
	})

	onMounted(() => {
		getDeptLists()
		getLists()
	})
</script>
<style lang="scss" scoped>
	.uw-left-box {
		background-color: #FFF;
		border-radius: 4px;
		height: 100%;
		padding-top: 16px;
	}
</style>
