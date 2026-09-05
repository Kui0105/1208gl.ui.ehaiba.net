<template>
	<div>
		<el-card class="!border-none" shadow="never">
			<el-page-header content="用户详情" @back="$router.back()" />
		</el-card>
		<el-card class="mt-4 !border-none" header="基本资料" shadow="never">
			<el-row>
				<el-col :span="6">
					用户昵称：{{formData.nickname || '-'}}
				</el-col>
				<el-col :span="6">
					登录账号：{{ formData.mobile || '-' }}
				</el-col>
				<el-col :span="6">
					注册时间：{{ formData.create_time }}
				</el-col>
				<el-col :span="6">
					最近登录时间：{{ formData.login_time }}
				</el-col>
			</el-row>
		</el-card>
		<div class="uw-box">
		
			<div class="uw-box-tab flex justify-between items-center">
				<el-tabs v-model="tableValue" class="demo-tabs" @tab-change="currentChange(1)">
					<el-tab-pane label="工单信息" name="1"></el-tab-pane>
					<el-tab-pane label="关联设备" name="2"></el-tab-pane>
				</el-tabs>
				<div class="right">
					<el-button v-if="tableValue == 1" type="primary" @click="createOrder()">创建工单</el-button>
					<el-button v-else type="primary" @click="showDevicePopup=true">添加设备</el-button>
				</div>
			</div>
			<el-table :data="tableData">
				<el-table-column v-if="tableValue == 1" prop="order_sn" label="工单编号" />
				<el-table-column v-if="tableValue == 1" prop="type_desc" label="工单类型" />
				<el-table-column v-if="tableValue == 1" prop="machine_info.name" label="设备信息" />
				<el-table-column v-if="tableValue == 1" prop="machine_info.company_name" label="单位名称" />
				<el-table-column v-if="tableValue == 1" prop="machine_info.contact" label="负责人" />
				<el-table-column v-if="tableValue == 1" prop="machine_info.mobile" label="联系电话" />
				<el-table-column v-if="tableValue == 1" prop="engineer_info.name" label="服务工程师" />
				<el-table-column v-if="tableValue == 1" prop="engineer_status_desc" label="工单状态" />
				<el-table-column v-if="tableValue == 1" prop="create_time" label="创建时间" />
				
				<el-table-column v-if="tableValue == 2" prop="code" label="设备编号" />
				<el-table-column v-if="tableValue == 2" prop="name" label="设备名称" />
				<el-table-column v-if="tableValue == 2" prop="contact" label="客户姓名" />
				<el-table-column v-if="tableValue == 2" prop="mobile" label="联系电话" />
				<el-table-column v-if="tableValue == 2" prop="full_address" label="设备所在地区" />
				<el-table-column v-if="tableValue == 2" prop="address" label="详细地址" />
				<!-- <el-table-column v-if="tableValue == 2" prop="create_time" label="排序" /> -->
				<el-table-column v-if="tableValue == 2" prop="create_time" label="同步时间" />
				
				<el-table-column label="操作">
					<template #default="{row}">
						<el-button type="text" v-if="tableValue == 1" size="small" @click="viewOpen(row)">详情</el-button>
						<el-button type="text" v-if="tableValue == 2" size="small" @click="delectDevice(row)">删除</el-button>
					</template>
				</el-table-column>
			</el-table>
			<div class="flex justify-center items-center mt-[18px]">
				<el-pagination background layout="prev, pager, next" :total="totalCount" @current-change="currentChange" />
			</div>
		</div>
		<!-- 添加设备弹窗显示设备列表 -->
		<el-dialog v-model="showDevicePopup" title="绑定设备" width="1100px">
			<el-table :data="deviceList">
				<el-table-column prop="code" label="设备编号" width="120" />
				<el-table-column prop="name" show-overflow-tooltip label="设备名称" />
				<el-table-column prop="contact" width="80" label="客户姓名" />
				<el-table-column prop="mobile" width="120" label="联系电话" />
				<el-table-column prop="full_address" show-overflow-tooltip label="设备所在地区" />
				<el-table-column prop="address" show-overflow-tooltip label="详细地址" />
				<el-table-column prop="create_time" show-overflow-tooltip label="同步时间" />
				<el-table-column label="操作" width="80">
					<template #default="{row}">
						<el-button type="text" size="small" @click="bindDevice(row)">选择</el-button>
					</template>
				</el-table-column>
			</el-table>
			<div class="flex justify-center items-center mt-[18px]">
				<el-pagination background layout="prev, pager, next" :page-size="15" :total="deviceCount" @current-change="currentChangeDevice" />
			</div>
		</el-dialog>
	</div>
</template>

<script lang="ts" setup name="consumerDetail">
	import { ref, reactive , onMounted } from 'vue';
	import { useRoute , useRouter } from 'vue-router';
	import { ElMessage , ElMessageBox } from 'element-plus';
	import { getUserDetail , orderLists , machineCancel , machineBind } from '@/api/consumer';
	import { getmachineListsApi } from '@/api/device/device';
	
	const route = useRoute()
	const router = useRouter()
	const tableData = ref([])
	const totalCount = ref(0)
	const pageNo = ref(1)
	const tableValue = ref('1')
	const formData = reactive({
		avatar: '',
		channel: '',
		create_time: '',
		login_time: '',
		mobile: '',
		nickname: '',
		real_name: 0,
		sex: 0,
		sn: '',
		account: '',
		user_money: ''
	})
	
	const showDevicePopup = ref(false)
	const deviceList = ref([])
	const deviceCount = ref(0)
	const devicePageNo = ref(1)
	watch(()=>showDevicePopup.value,(val)=>{
		if(val){
			getmachineLists()
		}else{
			deviceList.value = []
			deviceCount.value = 0
			devicePageNo.value = 1
		}
	})
	const getmachineLists = async () => {
		const { lists , count } = await getmachineListsApi({
			page_no:devicePageNo.value,
			user_id:route.query.id,
			page_size:15
		})
		deviceList.value = lists
		deviceCount.value = count
	}
	const currentChangeDevice = (page:number) => {
		devicePageNo.value = page
		getmachineLists()
	}
	
	const getDetails = async () => {
		const data = await getUserDetail({
			id: route.query.id
		})
		Object.keys(formData).forEach((key) => {
			formData[key] = data[key]
		})
	}
	const getOrderLists = async () => {
		const { lists,count} = await orderLists({
			page_no:pageNo.value,
			type:tableValue.value,
			user_id:route.query.id,
		})
		tableData.value = lists
		totalCount.value = count
	}

	const currentChange = (page:number) => {
		pageNo.value = page
		getOrderLists()
	}
	const viewOpen = (row) => {
		router.push({
			path:'/order/detail',
			query:{
				id:row.id
			}
		})
	}
	const delectDevice = (row) => {
		ElMessageBox.confirm('确定要删除该设备吗？','温馨提示',{
			confirmButtonText: '确定',
			cancelButtonText: '取消',
			type: 'warning',
		}).then(async () => {
			await machineCancel({id:row.id,user_id:route.query.id})
			ElMessage.success('删除成功')
			getOrderLists()
		})
	}
	const bindDevice = (row) => {
		ElMessageBox.confirm('确定要添加该设备吗？','温馨提示',{
			confirmButtonText: '确定',
			cancelButtonText: '取消',
			type: 'warning',
		}).then(async () => {
			await machineBind({id:row.id,user_id:route.query.id})
			ElMessage.success('添加成功')
			getOrderLists()
		})
	}
	const createOrder = () => {
		router.push({
			path:'/order/createOrder',
			query:{
				type:1,
				user_id:route.query.id
			}
		})
	}
	onMounted(()=>{
		getDetails()
		getOrderLists()
	})
</script>
<style lang="scss" scoped>
	.uw-box{
		background-color: #fff;
		margin-top: 16px;
		padding: 20px;
		border-radius: 4px;
		::v-deep .el-tabs__header {
			border-bottom: none;
		}
		
		::v-deep .el-tabs__nav-wrap::after {
			height: 0 !important;
		}
	}
</style>