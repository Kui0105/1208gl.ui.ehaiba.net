<template>
	<div>
		<el-card class="!border-none" shadow="never">
			<el-page-header content="管理设备" @back="$router.back()" />
		</el-card>
		<el-card class="!border-none mt-4" shadow="never">
			<el-row :gutter="16" class="leading-8">
				<el-col :span="6">姓名：{{ userInfo.name || '-' }}</el-col>
				<el-col :span="6">联系电话：{{ userInfo.mobile || '-' }}</el-col>
				<el-col :span="6">身份：{{ userInfo.type_str || '-' }}</el-col>
				<el-col :span="6">所属部门：{{ userInfo.depart_name || '-' }}</el-col>
				<el-col :span="12">上级工程师：{{ parentEngineerText }}</el-col>
				<el-col :span="12">设备范围：{{ deviceScopeText }}</el-col>
			</el-row>
		</el-card>
		<el-card class="!border-none mt-4" shadow="never">
			<el-table :data="pager.lists" style="width: 100%; height: calc(100vh - 390px);" v-loading="pager.loading">
				<el-table-column prop="code" label="设备编号" />
				<el-table-column prop="name" label="设备名称" />
				<el-table-column prop="contact" label="客户姓名" />
				<el-table-column prop="mobile" label="联系电话" />
				<el-table-column prop="addresss" label="设备所在地区" />
				<el-table-column prop="address" label="详细地址" />
				<el-table-column prop="create_time" label="同步时间" />
				<el-table-column label="操作">
					<template #default="{ row }">
						<el-button type="primary" text @click="openWindow(row)">详情</el-button>
					</template>
				</el-table-column>
			</el-table>
			<div class="flex mt-4 justify-end">
				<pagination v-model="pager" @change="getLists" />
			</div>
		</el-card>
	</div>
</template>

<script setup lang="ts">
	import { computed, onMounted, reactive, ref } from 'vue'
	import { machineLists, engineerInfo } from '@/api/perms/role'
	import { usePaging } from '@/hooks/usePaging'
	import { useRouter, useRoute } from 'vue-router'

	const router = useRouter()
	const route = useRoute()

	const listParams = reactive({
		area_engineer_id: route.query.id
	})

	const userInfo = ref<any>({})

	const parentEngineerText = computed(() => {
		const parent = userInfo.value?.parent_info || {}
		if (!parent?.id) {
			return '-'
		}
		return `${parent.name || '-'} / ${parent.mobile || '-'} / ${parent.type_str || '-'}`
	})

	const deviceScopeText = computed(() => {
		switch (Number(userInfo.value?.type || 0)) {
			case 1:
			case 2:
				return '下级负责人绑定的设备'
			case 3:
				return '本人绑定的设备'
			default:
				return '无可管理设备'
		}
	})

	const { pager, getLists } = usePaging({
		fetchFun: machineLists,
		params: listParams
	})

	const openWindow = (row: any) => {
		router.push({
			path: '/device/devicedetal',
			query: {
				id: row.id
			}
		})
	}

	const getEngineerDetail = async () => {
		userInfo.value = await engineerInfo({ engineer_id: route.query.id })
	}

	onMounted(() => {
		getEngineerDetail()
		getLists()
	})
</script>

<style scoped lang="scss">
	.el-button:hover {
		color: var(--el-button-hover-border-color) !important;
	}
</style>
