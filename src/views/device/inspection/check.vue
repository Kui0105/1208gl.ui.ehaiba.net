<template>
	<div>
		<div class="uw-box">
			<el-form :model="queryForm" inline class="mb-[18px]">
				<el-form-item label="检查内容">
					<el-input
						v-model="queryForm.keyword"
						placeholder="请输入检查内容"
						clearable
						style="width: 220px;"
						@keyup.enter="search"
					/>
				</el-form-item>
				<el-form-item label="状态">
					<el-select v-model="queryForm.status" placeholder="请选择状态" clearable style="width: 160px;">
						<el-option
							v-for="item in statusOptions"
							:key="item.value"
							:label="item.label"
							:value="item.value"
						/>
					</el-select>
				</el-form-item>
				<el-form-item label="所属分类">
					<el-cascader
						v-model="queryForm.cate_path"
						placeholder="请选择所属分类"
						style="width: 260px;"
						clearable
						:show-all-levels="false"
						:options="cateTree"
						:props="cascaderQuery"
					/>
				</el-form-item>
				<el-form-item>
					<el-button type="primary" @click="search">查询</el-button>
					<el-button @click="resetQuery">重置</el-button>
				</el-form-item>
			</el-form>

			<el-button class="mb-[18px]" type="primary" @click="dialogVisible=true">添加</el-button>

			<el-table :data="tableData">
				<el-table-column prop="id" label="ID" width="80"></el-table-column>
				<el-table-column prop="name" label="检查内容" min-width="180"></el-table-column>
				<el-table-column label="归属上级" min-width="260" show-overflow-tooltip>
					<template #default="{ row }">
						{{ row.cate_full_name || row.cate_parent_name || row.cate_name || '-' }}
					</template>
				</el-table-column>
				<el-table-column label="状态" width="100">
					<template #default="{ row }">
						{{ row.status_desc || getStatusLabel(row.status) }}
					</template>
				</el-table-column>
				<el-table-column prop="create_time" label="创建时间" min-width="180"></el-table-column>
				<el-table-column label="操作" width="140" fixed="right">
					<template #default="{row}">
						<el-button type="text" @click="edit(row)">编辑</el-button>
						<el-button type="text" @click="del(row)">删除</el-button>
					</template>
				</el-table-column>
			</el-table>

			<div style="display: flex;align-items: center;justify-content: center;margin-top: 18px;">
				<el-pagination
					background
					layout="prev, pager, next"
					:total="total"
					:current-page="pageNum"
					:page-size="pageSize"
					hide-on-single-page
					@current-change="currentChange"
				/>
			</div>
		</div>

		<el-dialog
			v-model="dialogVisible"
			:title="popupForm?.id ? '编辑' : '添加'"
			width="536px"
			draggable
			:close-on-press-escape="false"
			:show-close="false"
			:close-on-click-modal="false"
		>
			<el-form ref="popupRef" :model="popupForm" :rules="rulesModel" label-width="80">
				<el-form-item label="所属分类" prop="cid">
					<el-cascader
						v-model="popupForm.cid"
						placeholder="请选择上级(可选)"
						style="width: 100%;"
						clearable
						:show-all-levels="false"
						:options="cateList"
						:props="cascaderPopup"
					/>
				</el-form-item>
				<el-form-item label="名称" prop="name">
					<el-input v-model="popupForm.name" placeholder="请输入名称"></el-input>
				</el-form-item>
				<el-form-item label="处理方式" prop="sug">
					<el-input v-model="popupForm.sug" placeholder="请输入处理方式"></el-input>
				</el-form-item>
				<el-form-item label="排序">
					<el-input v-model="popupForm.sort" placeholder="请输入排序"></el-input>
				</el-form-item>
				<el-form-item label="状态">
					<el-select v-model="popupForm.status" placeholder="请选择">
						<el-option label="启用" :value="1"></el-option>
						<el-option label="禁用" :value="0"></el-option>
					</el-select>
				</el-form-item>
			</el-form>
		    <template #footer>
				<div class="dialog-footer">
					<el-button @click="dialogVisible = false">取消</el-button>
					<el-button type="primary" @click="submitPopup">确定</el-button>
				</div>
		    </template>
		</el-dialog>
	</div>
</template>

<script setup>
	import { ref , onMounted , watch } from 'vue';
	import { getmachineCheckApi , getmachineCateAi , addmachineCheckApi , editmachineCheckApi , deletemachineCheckApi } from '@/api/device/device';
	import { ElMessageBox } from 'element-plus';

	const pageSize = 10
	const tableData = ref([])
	const total = ref(0)
	const pageNum = ref(1)
	const dialogVisible = ref(false)

	const createPopupForm = () => ({
		name:'',
		cid:'',
		status:1,
		sort:0,
		sug:''
	})

	const createQueryForm = () => ({
		keyword: '',
		name: '',
		status: '',
		cate_path: []
	})

	const popupForm = ref(createPopupForm())
	const queryForm = ref(createQueryForm())

	const rulesModel = ref({
		name:[{required:true,message:'请输入名称',trigger:'blur'}],
		cid:[{required:true,message:'请选择所属分类',trigger:'change'}],
		sug:[{required:true,message:'请输入处理方式',trigger:'blur'}]
	})

	const popupRef = ref(null)
	const cateList = ref([])
	const cateTree = ref([])
	const statusOptions = ref([
		{ label: '启用', value: 1 },
		{ label: '禁用', value: 0 }
	])

	const cascaderPopup = {
		children:'sons',
		value:'id',
		label:'name',
		checkStrictly:false,
		checkOnClickNode: true,
		showPrefix:false,
		emitPath:false
	}

	const cascaderQuery = {
		children:'children',
		value:'value',
		label:'label',
		checkStrictly:true,
		emitPath:true
	}

	watch(() => dialogVisible.value, (val) => {
		if (!val) {
			popupForm.value = createPopupForm()
		}
	})

	const getStatusLabel = (status) => {
		const target = statusOptions.value.find(item => item.value === status)
		return target?.label || '-'
	}

	const buildQueryParams = () => {
		const params = {
			page_no: pageNum.value,
			page_size: pageSize
		}

		if (queryForm.value.keyword) {
			params.keyword = queryForm.value.keyword
		} else if (queryForm.value.name) {
			params.name = queryForm.value.name
		}

		if (queryForm.value.status !== '' && queryForm.value.status !== null && queryForm.value.status !== undefined) {
			params.status = queryForm.value.status
		}

		if (queryForm.value.cate_path?.length) {
			params.cate_path = queryForm.value.cate_path
		}

		return params
	}

	const del = (row) => {
		ElMessageBox.confirm('确定要删除吗？','温馨提示',{
				confirmButtonText: '确定',
				cancelButtonText: '取消',
				type: 'warning',
			}
		).then(async () => {
			await deletemachineCheckApi({id:row.id})
			getmachineCheck()
		})
	}

	const edit = (row) => {
		popupForm.value = {
			...createPopupForm(),
			...JSON.parse(JSON.stringify(row))
		}
		dialogVisible.value = true
	}

	const submitPopup = () => {
		popupRef.value.validate(async (valid) => {
			if(valid){
				popupForm.value?.id ? await editmachineCheckApi(popupForm.value) : await addmachineCheckApi(popupForm.value)
				dialogVisible.value = false
				getmachineCheck()
			}
		})
	}

	const getmachineCate = async () => {
		const { lists } = await getmachineCateAi({
			page_no: 1,
			page_size: 9999
		})
		cateList.value = lists || []
	}

	const getmachineCheck = async () => {
		const data = await getmachineCheckApi(buildQueryParams())
		const { lists = [], count = 0, extend = {} } = data || {}

		total.value = count
		tableData.value = lists

		if (Array.isArray(extend.cate_tree) && extend.cate_tree.length) {
			cateTree.value = extend.cate_tree
		}

		if (Array.isArray(extend.status_options) && extend.status_options.length) {
			statusOptions.value = extend.status_options.map(item => ({
				label: item.label ?? item.name ?? item.text,
				value: item.value ?? item.id ?? item.status
			}))
		}
	}

	const search = () => {
		pageNum.value = 1
		queryForm.value.name = queryForm.value.keyword
		getmachineCheck()
	}

	const resetQuery = () => {
		queryForm.value = createQueryForm()
		pageNum.value = 1
		getmachineCheck()
	}

	const currentChange = (page) => {
		pageNum.value = page
		getmachineCheck()
	}

	onMounted(() => {
		getmachineCate()
		getmachineCheck()
	})
</script>

<style scoped>
	.uw-form{
		padding-left: 18px;
		padding-right: 18px;
		padding-top: 18px;
		background: #FFFFFF;
		box-shadow: 0px 0px 30px 0px rgba(245,225,228,0.5);
		border-radius: 16px 16px 16px 16px;
	}
	.uw-box{
		margin-top: 18px;
		background-color: #fff;
		padding: 18px;
		box-shadow: 0px 0px 30px 0px rgba(245,225,228,0.5);
		border-radius: 16px 16px 16px 16px;
	}
</style>
