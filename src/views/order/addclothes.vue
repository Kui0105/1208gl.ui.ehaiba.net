<template>
	<div class="uw-add-clothes">
		<div>
			<el-button type="primary" v-if="!route.query.order_id" @click="showDevice=true">选择工单</el-button>
			<el-button type="primary" @click="showPeijian=true" plain>选择配件</el-button>
		</div>
		<el-table border class="mt-[18px]" :data="orderListData">
			<el-table-column prop="order_sn" label="工单编号"></el-table-column>
			<el-table-column prop="machine_info.code" label="设备编号"></el-table-column>
			<el-table-column prop="machine_info.name" label="设备名称"></el-table-column>
			<el-table-column prop="machine_info.contact" label="联系人"></el-table-column>
			<el-table-column prop="machine_info.mobile" label="联系电话"></el-table-column>
			<el-table-column prop="machine_info.full_address" label="使用地区"></el-table-column>
			<el-table-column prop="machine_info.address" label="详细地址"></el-table-column>
		</el-table>
		<el-table border class="mt-[18px]" :data="peijianListData">
			<el-table-column prop="id" align="center" label="序号" width="60"></el-table-column>
			<el-table-column prop="code" label="编码" ></el-table-column>
			<el-table-column prop="name" label="配件名称" ></el-table-column>
			<el-table-column prop="spec" label="规格型号" ></el-table-column>
			<el-table-column prop="phone" label="旧件SN" >
				<template #default="{row}">
					<el-input v-model="row.old_sn"></el-input>
				</template>
			</el-table-column>
			<el-table-column prop="phone" label="数量" width="100">
				<template #default="{row}">
					<el-input v-model="row.num"></el-input>
				</template>
			</el-table-column>
			<el-table-column prop="phone" label="是否在保" width="150">
				<template #default="{row}">
					<el-radio v-model="row.is_protec" value="是">是</el-radio>
					<el-radio v-model="row.is_protec" value="否">否</el-radio>
				</template>
			</el-table-column>
			<el-table-column prop="phone" label="质保到期时间" width="240">
				<template #default="{row}">
					<el-date-picker
						v-model="row.pro_time"
						type="date"
						placeholder="请选择"
					  />
				</template>
			</el-table-column>
			<el-table-column prop="phone" label="发货仓库">
				<template #default="{row}">
					<el-select filterable v-model="row.room" placeholder="请选择">
						<el-option
							v-for="item in selectListForm.room"
							:key="item"
							:label="item"
							:value="item"
						/>
					</el-select>
				</template>
			</el-table-column>
			<el-table-column prop="phone" label="旧件来源" width="200">
				<template #default="{row}">
					<el-select v-model="row.old_source" placeholder="请选择">
						<el-option
							v-for="item in selectListForm.source"
							:key="item"
							:label="item"
							:value="item"
						/>
					</el-select>
				</template>
			</el-table-column>
			<el-table-column label="操作" align="center" width="60">
				<template #default="{row}">
					<el-button type="text" @click="removeItem(row)">删除</el-button>
				</template>
			</el-table-column>
		</el-table>
		<el-form class="mt-[24px]" inline label-width="100">
			<el-form-item label="收货人">
				<el-input v-model="fromData.contact" placeholder="请输入收货人姓名"></el-input>
			</el-form-item>
			<el-form-item label="联系电话">
				<el-input v-model="fromData.mobile" placeholder="请输入联系电话"></el-input>
			</el-form-item>
			<el-form-item label="收货地址">
				<el-cascader :options="cityListData" placeholder="请选择地区" @change="handleChangeCascader"></el-cascader>
			</el-form-item>
			<el-form-item label="详细地址">
				<el-input v-model="fromData.address" placeholder="请输入详细地址"></el-input>
			</el-form-item>
			<el-form-item label="设备类型">
				<el-select placeholder="请选择设备类型" v-model="fromData.machine_type" style="width: 192px;">
					<el-option
						v-for="item in selectListForm.type"
						:key="item"
						:label="item"
						:value="item"
					/>
				</el-select>
			</el-form-item>
			<el-form-item label="运输方式">
				<el-select placeholder="请选择运输方式" v-model="fromData.trans" style="width: 192px;">
					<el-option
						v-for="item in selectListForm.trans"
						:key="item"
						:label="item"
						:value="item"
					/>
				</el-select>
			</el-form-item>
			<el-form-item label="紧急程度">
				<div>
					<el-select placeholder="请选择紧急程度" v-model="fromData.emergency" style="width: 192px;">
						<el-option
							v-for="item in selectListForm.emergency"
							:key="item"
							:label="item"
							:value="item"
						/>
					</el-select>
					<div class="uw-tips mt-[12px]">注：影响设备使用，需公司快速发货处理</div>
				</div>
			</el-form-item>
			<el-form-item label="申请说明">
				<el-input v-model="fromData.remark" type="textarea" style="width: 440px;" placeholder="请输入申请说明内容"></el-input>
			</el-form-item>
		</el-form>
		<div class="uw-flex">
			<el-button type="primary" plain>重置</el-button>
			<el-button type="primary" @click="handelSubmit">提交</el-button>
		</div>

		<!-- 选择工单弹窗 -->
		<el-dialog v-model="showDevice" :show-close="false" width="68%">
			<template #header="{ close, titleId, titleClass }">
				<div class="my-header">
					<h4 :id="titleId" :class="titleClass">选择工单</h4>
					<div class="form">
						<el-input v-model="orderKeyWord" style="width: 300px;" placeholder="请输入工单编号进行搜索"></el-input>
						<el-button type="primary" @click="handleOrderList(1)">搜索</el-button>
					</div>
				</div>
			</template>
			<el-table border :data="orderList">
				<el-table-column prop="order_sn" label="工单编号"></el-table-column>
				<el-table-column prop="type_desc" label="工单类型"></el-table-column>
				<el-table-column prop="machine_info.name" label="设备名称"></el-table-column>
				<el-table-column prop="machine_info.code" label="设备编号"></el-table-column>
				<el-table-column prop="machine_info.contact" label="联系人"></el-table-column>
				<el-table-column prop="machine_info.mobile" label="联系电话"></el-table-column>
				<el-table-column prop="machine_info.full_address" label="所在地区"></el-table-column>
				<el-table-column prop="machine_info.address" label="详细地址"></el-table-column>
				<el-table-column prop="machine_info.address" label="操作" align="center">
					<template #default="{row}">
						<el-button type="text" @click="confirmOrder(row)">选择</el-button>
					</template>
				</el-table-column>
				
			</el-table>
			<div class="device-footer" style="justify-content: center;">
				<el-pagination background layout="prev, pager, next" :total="orderTotal" @current-change="handleOrderList" />
			</div>
		</el-dialog>
		
		<!-- 选择配件弹窗 -->
		<el-dialog v-model="showPeijian" :show-close="false" width="68%">
			<template #header="{ close, titleId, titleClass }">
				<div class="my-header">
					<h4 :id="titleId" :class="titleClass">选择配件</h4>
					<div class="form">
						<el-input v-model="peijianKeyWord" style="width: 300px;" placeholder="请输入设备名称/ID进行搜索"></el-input>
						<!-- <el-select style="width: 300px;" placeholder="请选择仓库"></el-select> -->
						<el-button type="primary" @click="handlePeijianList(1)">搜索</el-button>
					</div>
				</div>
			</template>
			<el-table border row-key="id" :data="peijianList" ref="peiTableRef" @select="peijianSelectChange">
				<el-table-column type="selection" align="center" width="50"></el-table-column>
				<el-table-column prop="id" label="序号"></el-table-column>
				<el-table-column prop="code" label="配件编号"></el-table-column>
				<el-table-column prop="name" label="配件名称"></el-table-column>
				<el-table-column prop="spec" label="规格型号"></el-table-column>
				<!-- <el-table-column prop="room" label="仓库"></el-table-column> -->
			</el-table>
			<div class="device-footer">
				<el-pagination background layout="prev, pager, next" :total="peijianTotal" @current-change="handlePeijianList" />
				<div>
					<el-button @click="showPeijian=false">关闭</el-button>
					<el-button type="primary" @click="confirmPeijian(peijianListData)">确定</el-button>
				</div>
			</div>
		</el-dialog>
	</div>
</template>

<script setup lang="ts">
	import { ref , onMounted } from 'vue'
	import { getReplaceOrderList , getReplacePartList , getReplacePartSelect , addReplace , getOrderDetail } from '@/api/order/order';
	import { allRegion } from '@/api/perms/role';
	import { ElMessage } from 'element-plus';
	import { useRoute , useRouter} from 'vue-router';
	const route = useRoute()
	const router = useRouter()
	
	
	const selectListForm = ref({})
	
	const fromData = ref({
		order_id:'',
		contact:'',
		mobile:'',
		province:'',
		city:'',
		area:'',
		address:'',
		trans:'',
		emergency:'',
		remark:'',
		item_data:[],
		machine_type:''
	})
	const cityListData = ref([])
	
	const tableData = ref([''])
	const showDevice = ref(false)
	const orderList = ref([])
	const orderKeyWord = ref('')
	const orderPageNo = ref(1)
	const orderTotal = ref(0)
	const orderSelection = ref(null)
	const orderListData = ref([])
	watch(()=>showDevice.value,(val)=>{
		if(val){
			getReplaceOrderListData()
		}
	})
	const confirmOrder = (val) => {
		orderListData.value = [val]
		fromData.value.order_id = val.id
		showDevice.value = false
	}
	const handleOrderList = (page: number) => {
		orderPageNo.value = page
		getReplaceOrderListData()
	}
	const getReplaceOrderListData = async () => {
		const { lists } = await getReplaceOrderList({
			is_part:1,
			order_sn:orderKeyWord.value,
			page_no:orderPageNo.value,
			page_size:10
		})
		orderList.value = lists
	}
	const showPeijian = ref(false)
	const peijianList = ref([])
	const peijianKeyWord = ref('')
	const peijianPageNo = ref(1)
	const peijianTotal = ref(0)
	const peijianListData = ref([])
	const peiTableRef = ref(null)
	watch(()=>showPeijian.value,(val)=>{
		if(val){
			getReplacePartListData()
		}
	})
	const getReplacePartListData = async () => {
		const { lists , count} = await getReplacePartList({
			keyword:peijianKeyWord.value,
			page_size:10,
			page_no:peijianPageNo.value
		})
		peijianList.value = lists.map((val)=>{
			return {
				...val,
				is_protec:'',
				pro_time:'',
				old_source:'',
				num:1,
				old_sn:''
			}
		})
		peijianTotal.value = count
		nextTick(()=>{
			peiTableRef.value.clearSelection()
			peijianList.value.forEach(row => {
				const exist = peijianListData.value.some( selected => selected.id === row.id )
				if (exist) {
					peiTableRef.value.toggleRowSelection(row, true)
				}
			})
		})
	}
	const handlePeijianList = (page: number) => {
		peijianPageNo.value = page
		getReplacePartListData()
	}
	const confirmPeijian = (val) => {
		if(!val || val.length == 0) return ElMessage.error('请选择配件')
		showPeijian.value = false
	}
	const peijianSelectChange = (currentPageSelection: any[]) => {
		console.log(currentPageSelection);
		if(currentPageSelection.length == 0) return 
	    const currentPageIds = peijianList.value.map(item => item.id)
	
	    // ① 先移除当前页中被取消勾选的
	    peijianListData.value = peijianListData.value.filter( item => !currentPageIds.includes(item.id) )
	
	   // ② 再合并当前页新选中的
	    currentPageSelection.forEach(row => {
	        if (!peijianListData.value.some(item => item.id === row.id)) {
	            peijianListData.value.push(row)
	        }
	    })
	}
	const removeItem = (row) => {
		peijianListData.value = peijianListData.value.filter((val)=>{
			return val.id != row.id
		})
	}

	
	
	const handleChangeCascader = (row) => {
		fromData.value.province = row[0]
		fromData.value.city = row[1]
		fromData.value.area = row[2]
	}
	
	const handelSubmit = () => {
		
		addReplace({...fromData.value,item_data:peijianListData.value}).then((res)=>{
			ElMessage.success('添加成功')
			setTimeout(()=>{
				router.back()
			},1000)
		})
	}
	
	onMounted(()=>{
		getReplacePartSelect().then((res)=>{
			selectListForm.value = res
		})
		allRegion().then((res)=>{
			cityListData.value = res
		})
		if(route.query.order_id){
			fromData.value.order_id = route.query.order_id
			getOrderDetail({id:route.query.order_id}).then((res)=>{
				orderListData.value = [res]
			})
		}
	})

</script>

<style lang="scss" scoped>
	.uw-add-clothes {
		width: 100%;
		min-height: calc(100vh - 91px - 32px);
		background: #FFFFFF;
		box-shadow: 0px 0px 30px 0px rgba(245, 225, 228, 0.5);
		border-radius: 16px 16px 16px 16px;
		padding: 20px;
		display: flex;
		flex-direction: column;

		.uw-flex {
			display: flex;
			align-items: center;
			justify-content: center;
			margin-top: auto;
		}

		.uw-tips {
			font-weight: 400;
			font-size: 12px;
			color: #D74130;
			line-height: 17px;
		}
	}
	.my-header{
		display: flex;
		align-items: center;
		.form{
			display: flex;
			margin-left: 24px;
			gap: 0 16px;
		}
	}
	.device-footer{
		display: flex;
		align-items: center;
		justify-content: space-between;
		margin-top: 24px;
	}
</style>