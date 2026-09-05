<template>
	<!-- 进场弹窗 -->
	<el-dialog title="进场资料" v-model="dialogVisible" width="500px" @close="emit('close')">
		<el-form ref="form" label-width="100">
			<div v-for="item in formTableList" :key="item.id">
				<h1 v-if="item.is_cate" class="mb-[32px]">{{item.name}}</h1>
				<uwCeateOrderForm v-if="item.is_cate" :row="row" v-for="row in item.son" />
				<uwCeateOrderForm v-else :row="item" />
			</div>
		</el-form>
		<template #footer>
			<span class="dialog-footer">
				<el-button @click="dialogVisible = false,emit('close')">取 消</el-button>
				<el-button type="primary" @click="confirm">确 定</el-button>
			</span>
		</template>
		
	</el-dialog>
</template>

<script setup lang="ts">
	import { reactive, ref , onMounted } from 'vue';
	import { getOrderForm , orderIn } from '@/api/order/order'
	import uwOrderDispatch from './uw-order-dispatch.vue'
	import uwCeateOrderForm from './uw-create-order-form.vue';
	import { ElMessage, ElMessageBox } from 'element-plus';
	const prop = defineProps({
		orderInfo:{
			type:Object,
			default:() => ({})
		}
	})
	const emit = defineEmits(['change','close'])
	const dialogVisible = ref(true)
	const formTableList = ref([])
	const confirm = async () => {
		await orderIn({
			form_data:normalizeImageValue(formTableList.value),
			id:prop.orderInfo.id
		})
		ElMessage.success('进场成功')
		emit('change')
	}
	
	onMounted(async ()=>{
		formTableList.value = await getOrderForm({
			type:prop.orderInfo.type,
			step:prop.orderInfo.next_step
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