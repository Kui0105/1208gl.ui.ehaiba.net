<template>
	<div class="uw-create-form">
		<img class="back" src="/src/assets/uwback.png" @click="$router.back()">
		<ul class="uw-header">
			<li :class="{'active':stepId === item.id}" v-for="(item,index) in stepList" :key="index" @click="switchItem(item)">
				<div class="step">{{index + 1}}</div>
				<div class="title">{{item.name}}</div>
				<div class="doc">{{item.intro}}</div>
			</li>
		</ul>
		<div class="uw-tabel">
			<div class="uw-tabel-header">
				<div class="left">工单字段</div>
			</div>
			<el-table :data="tableData" row-key="id" :tree-props="{ children: 'children' }" style="width: 100%">
				<el-table-column label="字段名" prop="name" width="200"></el-table-column>
				<el-table-column align="center" label="排序" type="index" width="80"></el-table-column>
				<el-table-column align="center" label="字段类型" prop="name">
					<template #default="{row}">
						{{smallTypeMap[row.small_type]}}
					</template>
				</el-table-column>
				<el-table-column align="center" label="是否必填" prop="name">
					<template  #default="{row}">
						<el-switch :disabled="row.is_cate" v-model="row.is_require" active-color="#13ce66" inactive-color="#ff4949" @change="changeSwitch($event,'is_require',row)"></el-switch>
					</template>
				</el-table-column>
				<el-table-column align="center" label="启用禁用" prop="name">
					<template #default="{row}">
						<el-switch :disabled="row.is_cate" v-model="row.status" active-color="#13ce66" inactive-color="#ff4949" @change="changeSwitch($event,'status',row)"></el-switch>
					</template>
				</el-table-column>

				<el-table-column align="center" label="操作" prop="name">
					<template #default="{row}">
						<el-button type="text" size="small" @click="handleEdit(row)">修改</el-button>
						<el-button type="text" size="small" @click="handleDelete(row)">删除</el-button>
					</template>
				</el-table-column>
			</el-table>
			<div style="display: flex;align-items: center;justify-content: center;margin-top: 24px;">
				<el-button type="primary" @click="dialogVisible=true">+ 添加自定义字段</el-button>
				<el-button type="primary" @click="showCate=true">+ 添加分组</el-button>
			</div>
		</div>
		<!-- 添加分组  -->
		<el-dialog :close-on-press-escape="false" :show-close="false" :close-on-click-modal="false" v-model="showCate" title="新增/修改分组" width="500px">
			<el-form label-width="70" class="uw-el-form-popup">
				<el-form-item label="分组名称">
					<el-input v-model="cateForm.name"></el-input>
				</el-form-item>
				<el-form-item label="排序">
					<el-input v-model="cateForm.sort"></el-input>
				</el-form-item>
			</el-form>
			<template #footer>
			    <div class="dialog-footer">
			        <el-button @click="closeIrderCate">取消</el-button>
			        <el-button type="primary" @click="addOrderFormCateApi">确定</el-button>
			    </div>
			</template>
		</el-dialog>


		<!-- 添加自定义字段 -->
		<el-dialog :close-on-press-escape="false" :show-close="false" :close-on-click-modal="false" v-model="dialogVisible" title="新增/修改字段" width="500px">
			<el-form label-width="70" class="uw-el-form-popup">
				<el-form-item label="所属分组">
					<el-select v-model="form.cate_id" placeholder="请选择">
						<el-option v-for="(item,index) in formCateList" :key="index" :label="item.name" :value="item.id"></el-option>
					</el-select>
				</el-form-item>
				<el-form-item label="字段名称">
					<el-input v-model="form.name"></el-input>
				</el-form-item>
				<el-form-item label="字段类型">
					<el-select v-model="form.small_type" placeholder="请选择" @change="changeSelect">
						<el-option v-for="(item,index) in smallTypeMap" :key="index" :label="item" :value="index"></el-option>
					</el-select>
					<div style="display: flex;flex-direction: column;gap: 10px 0;margin-top: 16px;width: 100%;" v-if="form.small_type == 6 || form.small_type == 7 || form.small_type == 9">
						<el-form-item label-width="60" v-for="(row,index) in form.extra_data" :key="index" :label="`${row.label}${index + 1}`">
							<div style="display: flex;width: 100%;">
								<el-input style="margin-right: 16px;" v-model="row.name"></el-input>
								<el-button type="danger" :icon="Delete" circle @click="form.extra_data.splice(form.extra_data.indexOf(row),1)" />
							</div>
						</el-form-item>
						<div style="display: flex;justify-content: flex-end;">
							<el-button @click="addSelect('选项')">添加选项</el-button>
						</div>
					</div>
					<div style="display: flex;flex-direction: column;gap: 10px 0;margin-top: 16px;width: 100%;" v-if="form.small_type == 10">
						<el-form-item label-width="60" v-for="(row,index) in form.extra_data" :key="index" :label="`${row.label}${index + 1}`">
							<div style="display: flex;width: 100%;">
								<el-input style="margin-right: 16px;" v-model="row.name"></el-input>
								<el-button type="danger" :icon="Delete" circle @click="form.extra_data.splice(form.extra_data.indexOf(row),1)" />
							</div>
						</el-form-item>
						<div style="display: flex;justify-content: flex-end;">
							<el-button @click="addSelect('图片')">添加图片</el-button>
						</div>
					</div>
				</el-form-item>

				<el-form-item label="排序">
					<el-input v-model="form.sort"></el-input>
				</el-form-item>
				<el-form-item label="是否必填">
					<el-switch v-model="form.is_require" active-color="#13ce66" inactive-color="#ff4949"></el-switch>
				</el-form-item>
				<el-form-item label="启用禁用">
					<el-switch v-model="form.status" active-color="#13ce66" inactive-color="#ff4949"></el-switch>
				</el-form-item>
			</el-form>
			<template #footer>
			    <div class="dialog-footer">
			        <el-button @click="closeAddOrder">取消</el-button>
			        <el-button type="primary" @click="addOrderApi">确定</el-button>
			    </div>
			</template>
		</el-dialog>
	</div>
</template>

<script setup lang="ts">
	import { onMounted, ref } from 'vue';
	import {
		getOrderStep,
		getOrderList,
		smallTypeMap ,
		addOrder ,
		getOrderFormCate ,
		addOrderFormCate ,
		deleteOrderForm ,
		deleteOrderFormCate ,
		editOrderForm ,
		editOrderFormCate ,
		changeFieldStatus
	} from '@/api/order/order';
	import { useRouter, useRoute } from 'vue-router'
	import { Delete } from '@element-plus/icons-vue'
	const router = useRouter()
	const route = useRoute()

	const tableData = ref([])

	const stepList = ref([])
	const stepId = ref(0)

	const showCate = ref(false)
	const cateForm = ref({
		name: '',
		sort:null,
	})

	const form = ref({
		cate_id:null,
		name: '',
		small_type:null,
		sort:null,
		is_require: false,
		status: false,
		extra_data:[]
	})
	const dialogVisible = ref(false)
	const formCateList = ref([])
	const changeSwitch = (ev,name,{id}) => {
		changeFieldStatus({
			field:name,
			status:ev ? 1 : 0,
			id
		})
	}
	const changeSelect = () => {
		form.value.extra_data = []
	}
	/**
	 * 编辑
	 */
	const handleEdit = (row) =>{
		if(row.is_cate){
			cateForm.value = {...row}
			showCate.value = true
		}else{
			form.value = {...row}
			dialogVisible.value = true
		}

	}

	const addSelect = (type) => {
		form.value.extra_data.push({
			label:type,
			name:'',
			value:''
		})
	}

	/**
	 * 切换步骤
	 */
	const switchItem = (item) => {
		stepId.value = item.id
		getOrderListApi()
		getOrderFormCateApi()
	}
	/**
	 * 获取表单步骤
	 */
	const getOrderStepApi = async () => {
		const data = await getOrderStep(route.query.id);
		stepList.value = data
		stepId.value = data[0].id
		getOrderListApi()
		getOrderFormCateApi()
	}
	/**
	 * 获取表单列表
	 */
	const getOrderListApi = async () => {
		const data = await getOrderList({
			type: route.query.id,
			step_type: stepId.value
		});
		data.forEach((val)=>{
			if(val.is_cate){
				if(!val.children){
					val.children = []
				}
				val.children.forEach((row)=>{
					row.is_require = row.is_require == 1 ? true : false
					row.status = row.status == 1 ? true : false
				})
			}else{
				val.is_require = val.is_require ? true : false
				val.status = val.status ? true : false
			}
		})
		tableData.value = data
	}

	const closeAddOrder = () => {
		form.value = {
			cate_id:null,
			name: '',
			small_type:null,
			sort:null,
			is_require: false,
			status: false,
			extra_data:[]
		}
		dialogVisible.value = false
	}

	/**
	 * 添加表单
	 */
	const addOrderApi = async () => {
		form.value.id ? await editOrderForm({
			type: route.query.id,
			step_type: stepId.value,
			...form.value,
			is_require:form.value.is_require ? 1 : 0,
			status:form.value.status ? 1 : 0
		}) : await addOrder({
			type: route.query.id,
			step_type: stepId.value,
			...form.value,
			is_require:form.value.is_require ? 1 : 0,
			status:form.value.status ? 1 : 0
		})
		dialogVisible.value = false
		form.value = {
			cate_id:null,
			name: '',
			small_type:null,
			sort:null,
			is_require: false,
			status: false,
			extra_data:[]
		}
		getOrderListApi()
	}
	/**
	 * 获取分组
	 */
	const getOrderFormCateApi = async () => {
		const data = await getOrderFormCate({
			type: route.query.id,
			step_type: stepId.value
		});
		formCateList.value = data
	}

	const closeIrderCate = () => {
		showCate.value = false
		cateForm.value = {
			name: '',
			sort:null,
		}
	}

	/**
	 * 添加分组
	 */
	const addOrderFormCateApi = async () => {
		cateForm.value.id ? await editOrderFormCate({
			type: route.query.id,
			step_type: stepId.value,
			...cateForm.value
		}) : await addOrderFormCate({
			type: route.query.id,
			step_type: stepId.value,
			...cateForm.value,
		})

		showCate.value = false
		cateForm.value = {
			name: '',
			sort:null,
		}
		getOrderFormCateApi()
		getOrderListApi()
	}
	/**
	 * 删除表单或者分组
	 */
	const handleDelete = async (item) => {
		item.is_cate ? await deleteOrderFormCate({id:item.id}) : await deleteOrderForm({id:item.id})
		getOrderListApi()
		getOrderFormCateApi()
	}
	onMounted(() => {
		getOrderStepApi()
	})
</script>

<style lang="scss" scoped>
	.uw-create-form{
		position: relative;
		.back{
			position: absolute;
			left:20px;
			top: 20px;
		}
	}
	.uw-header {
		display: flex;
		flex-wrap: wrap;
		width: 100%;
		height: auto;
		background: #FFFFFF;
		box-shadow: 0px 0px 30px 0px rgba(245, 225, 228, 0.5);
		border-radius: 16px;
		gap: 22px 44px;
		padding: 32px;
		padding-left: 64px;
		li {
			width: 152px;
			height: 152px;
			background: #FFFFFF;
			border-radius: 16px 16px 16px 16px;
			border: 1px solid #DFE5F1;
			display: flex;
			flex-direction: column;
			align-items: center;
			justify-content: center;
			cursor: pointer;
			&.active {
				border-radius: 16px;
				border: 1px solid #D74130;

				.step {
					background: #D74130;
					color: #fff;
				}
			}

			.step {
				width: 28px;
				height: 28px;
				background: #ECEFF7;
				border-radius: 50%;
				font-weight: 600;
				font-size: 16px;
				color: #333333;
				line-height: 22px;
				display: flex;
				align-items: center;
				justify-content: center;
			}

			.title {
				font-size: 16px;
				font-family: PingFangSC-Medium, PingFang SC;
				font-weight: 500;
				color: #333333;
				margin: 6px 0;
			}
			.doc{
				font-weight: 400;
				font-size: 12px;
				color: #AAAAAA;
				line-height: 17px;
			}
		}
	}
	.uw-tabel{
		padding: 20px;
		background: #FFFFFF;
		box-shadow: 0px 0px 30px 0px rgba(245,225,228,0.5);
		border-radius: 16px;
		margin-top: 20px;
		&-header{
			display: flex;
			align-items: center;
			justify-content: space-between;
			margin-bottom: 20px;
			.left{
				font-weight: 400;
				font-size: 16px;
				color: #191919;
				line-height: 22px;
			}
		}
	}
	.uw-el-form-popup{
		width: 100%;
	}
</style>