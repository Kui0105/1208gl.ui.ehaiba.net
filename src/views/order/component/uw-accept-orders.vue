<template>
	<div>
		<!-- 接单表单显示 -->
		<el-dialog title="接单" v-model="showFormTable" width="500px" @close="emit('close')">
			<el-form label-width="100">
				<div v-for="item in formTableList" :key="item.id">
					<h1 v-if="item.is_cate" class="mb-[32px]">{{item.name}}</h1>
					<uwCeateOrderForm v-if="item.is_cate" :row="row" v-for="row in item.son" />
					<uwCeateOrderForm v-else :row="item" />
				</div>
			</el-form>
			<template #footer>
				<span class="dialog-footer">
					<el-button @click="popupJieDan = false,emit('close')">取 消</el-button>
					<el-button type="primary" @click="confirm">确 定</el-button>
				</span>
			</template>
		</el-dialog>
	</div>
</template>

<script setup lang="ts">
	/**
	 * 接单 弹窗
	 */
	import { reactive, ref , onMounted , nextTick } from 'vue';
	import { getOrderForm , recieveOrder } from '@/api/order/order'
	import uwCeateOrderForm from './uw-create-order-form.vue';
	import { ElMessage } from 'element-plus'
	const RECEIVE_STEP = 2
	const prop = defineProps({
		orderInfo:{
			type:Object,
			default:() => ({})
		}
	})
	const emit = defineEmits(['change','close'])
	const showFormTable = ref(false)
	const formTableList = ref([])
	const isRepairOrder = Number(prop.orderInfo.type) === 1
	const jieDanForm = ref({
		id:'',
		use_car:'1',
		start_m:'',
		form_data:[],
		end_m:''
	})
	const submitJieDan = async () => {
		formTableList.value = await getOrderForm({
			type:prop.orderInfo.type,
			step:RECEIVE_STEP
		})
		if(formTableList.value.length == 0){
			confirm()
		}else{
			showFormTable.value = true
		}
	}
	const confirm = async () => {
		const params: Record<string, any> = {
			id:prop.orderInfo.id,
			form_data:normalizeImageValue(formTableList.value)
		}
		// 仅维修工单移除原来的远程/现场选择参数，其他工单维持原有接单入参结构
		if(!isRepairOrder && jieDanForm.value.type){
			params.type = jieDanForm.value.type
		}
		await recieveOrder(params)
		ElMessage.success('接单成功')
		emit('change')
		showFormTable.value = false
	}
	onMounted(()=>{
		nextTick(()=>{
			// 维修工单改为接单后再选远程/现场，非维修工单保持原有直接接单流程
			submitJieDan()
		})
	})
	function normalizeImageValue(list) {
	    return list.map(item => {
	        // 情况 1：分类节点，处理 son
	        if (item.is_cate === true && Array.isArray(item.son)) {
	            return {
	                ...item,
	                son: item.son.map(field => {
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
	
	        // 情况 2：普通字段，直接处理当前层
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
</style>
