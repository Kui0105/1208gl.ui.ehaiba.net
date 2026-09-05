<template>
	<div>
		<el-form class="uw-form" inline>
			<el-form-item label="设备编号">
				<el-input v-model="formData.code" placeholder="请输入设备编号"></el-input>
			</el-form-item>
			<el-form-item label="申请人">
				<el-input v-model="formData.name" placeholder="请输入申请人姓名"></el-input>
			</el-form-item>
			<el-form-item>
				<el-button type="primary" @click="currentChange(1)">查询</el-button>
				<el-button @click="restData">重置</el-button>
				<export-data class="ml-2.5" :fetch-fun="getmachineChangeListsApi" :params="formData" :page-size="10" />
			</el-form-item>
		</el-form>
		<div class="uw-box">
			<el-table :data="tableData">
				<el-table-column prop="id" label="ID" width="60"></el-table-column>
				<el-table-column prop="code" label="设备编号"></el-table-column>
				<el-table-column prop="type" label="设备类型"></el-table-column>
				<el-table-column prop="engineer_name" label="申请人"></el-table-column>
				<el-table-column prop="contact" label="负责人"></el-table-column>
				<el-table-column prop="company_name" label="单位名称"></el-table-column>
				<el-table-column prop="mobile" label="客户电话"></el-table-column>
				<el-table-column prop="full_address" label="变动地区" width="250"></el-table-column>
				<el-table-column prop="status_desc" label="状态">
					<template #default="{row}">
						<el-tag v-if="row.status == 1" type="success">{{row.status_desc}}</el-tag>
						<el-tag v-else type="danger">{{row.status_desc}}</el-tag>
					</template>
				</el-table-column>
				<el-table-column prop="create_time" label="申请时间"></el-table-column>
				<el-table-column label="操作">
					<template #default="{row}">
						<el-button type="text" @click="openWindow(row)">详情</el-button>
					</template>
				</el-table-column>
			</el-table>
			<!-- 分页 -->
			<div style="display: flex;align-items: center;justify-content: center;margin-top: 18px;">
				<el-pagination background layout="prev, pager, next" :total="totalCount" hide-on-single-page
					@current-change="currentChange" />
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
	import { ref } from 'vue';
	import { useRouter } from 'vue-router';
	import { getmachineChangeListsApi } from '@/api/device/device'
	import { ElMessage, ElMessageBox } from 'element-plus'
	const router = useRouter();
	const tableData = ref([])
	const totalCount = ref(0)
	const pageNum = ref(1)
	const formData = ref({
		code: '',
		name: ''
	})
	const openWindow = (row) => {
		router.push({
			path: '/device/fluctuationdetail',
			query: {
				id: row.id
			}
		})
	}
	const getmachineLists = async () => {
		const { lists, count } = await getmachineChangeListsApi({
			page_size: 10,
			page_no: pageNum.value,
			...formData.value
		})
		tableData.value = lists
		totalCount.value = count
	}
	const currentChange = (page : number) => {
		pageNum.value = page
		getmachineLists()
	}
	const restData = () => {
		formData.value = {
			code: '',
			name: '',
			company_name: '',
			mobile: ''
		}
		currentChange(1)
	}
	onMounted(() => {
		getmachineLists()
	})
</script>

<style scoped>
	.uw-form {
		padding-left: 18px;
		padding-right: 18px;
		padding-top: 18px;
		background: #FFFFFF;
		box-shadow: 0px 0px 30px 0px rgba(245, 225, 228, 0.5);
		border-radius: 16px 16px 16px 16px;
	}

	.uw-box {
		margin-top: 18px;
		background-color: #fff;
		padding: 18px;
		box-shadow: 0px 0px 30px 0px rgba(245, 225, 228, 0.5);
		border-radius: 16px 16px 16px 16px;
	}
</style>