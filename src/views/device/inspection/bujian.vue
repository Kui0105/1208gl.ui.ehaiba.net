<template>
	<div class="uw-box">
		<el-button class="mb-[18px]" type="primary" @click="dialogVisible=true">添加</el-button>
		<el-table :data="tableData" v-if="tableData.length" row-key="id" :tree-props="{ children: 'sons'}">
			<el-table-column label="序号" width="80">
				<template #default="{ row }">{{ getTopLevelIndex(row) }}</template>
			</el-table-column>
			
			<el-table-column prop="sort" label="排序"></el-table-column>
			<el-table-column prop="name" label="名称"></el-table-column>
			<el-table-column label="是否矿机" width="100">
				<template #default="{ row }">{{ getMachineCateLabel(row) }}</template>
			</el-table-column>
			<el-table-column prop="status_desc" label="状态"></el-table-column>
			<el-table-column prop="create_time" label="创建时间"></el-table-column>
			<el-table-column prop="address" label="操作">
				<template #default="{row}">
					<el-button type="text" @click="edit(row)">编辑</el-button>
					<el-button type="text" @click="del(row)">删除</el-button>
				</template>
			</el-table-column>
		</el-table>
		<div class="flex justify-end items-center mt-4">
			<span>共 {{ tableData.length }} 条</span>
		</div>

		<el-dialog v-model="dialogVisible" :title="popupForm?.id ? '编辑' : '添加'" width="536px" draggable :close-on-press-escape="false" :show-close="false" :close-on-click-modal="false" >
			<el-form ref="popupRef" :model="popupForm" :rules="rulesModel" label-width="60">
				<el-form-item label="上级">
					<el-cascader
						v-model="popupForm.pid"
						placeholder="请选择上级(可选)" 
						style="width: 100%;"
						clearable
						:show-all-levels="false"
						:options="tableData" 
						:props="cascaderPopup" 
					/>
				</el-form-item>
			   <el-form-item label="名称" prop="name">
					<el-input placeholder="请输入名称" v-model="popupForm.name"></el-input>
				</el-form-item>
				<el-form-item prop="code" v-if="isTopLevelCategory(popupForm.pid)" label="编码">
					<el-input placeholder="请输入编码" v-model="popupForm.code"></el-input>
				</el-form-item>
				<el-form-item prop="oa_cate_id" v-if="isTopLevelCategory(popupForm.pid)" label="类型" :rules="[{ required: true, message: '请选择所属类型', trigger: 'change' }]">
					<el-select v-model="popupForm.oa_cate_id" placeholder="请选择所属类型">
						<el-option label="湿喷机" :value="1"></el-option>
						<el-option label="立拱装药台车" :value="2"></el-option>
						<el-option label="直臂凿岩台车" :value="3"></el-option>
						<el-option label="曲臂凿岩台车" :value="9"></el-option>
						<el-option label="锚杆台车" :value="7"></el-option>
						<el-option label="矿用设备" :value="10"></el-option>
					</el-select>
				</el-form-item>
				<el-form-item v-if="isTopLevelCategory(popupForm.pid)" label="是否矿机" label-width="80px">
					<el-radio-group v-model="popupForm.machine_cate">
						<el-radio :value="0">否</el-radio>
						<el-radio :value="1">是</el-radio>
					</el-radio-group>
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
	import { getmachineCateAi , addmachineCateApi , editmachineCateApi , deletemachineCateApi } from '@/api/device/device';
	import { ElMessageBox } from 'element-plus';
	const tableData = ref([])
	const cascaderPopup = {
		children:'sons',
		value:'id',
		label:'name',
		checkStrictly:true,
		checkOnClickNode: true,
		showPrefix:false,
		emitPath:false
	}
	const popupRef = ref(null)
	const dialogVisible = ref(false)
	const isTopLevelCategory = (pid) => pid == 0 || pid == '' || pid == null
	const normalizeMachineCate = (value) => Number(value) === 1 ? 1 : 0
	const createPopupForm = () => ({
		name:'',
		pid:0,
		code:'',
		oa_cate_id: undefined,
		machine_cate: 0,
		status:1,
		sort:0
	})
	const popupForm = ref(createPopupForm())
	const rulesModel = {
		name: [
			{ required: true, message: '请输入名称', trigger: 'blur' },
		],
		code: [
			{ required: true, message: '请输入编码', trigger: 'blur' },
		],
		oa_cate_id: [
			{ required: true, message: '请选择所属类型', trigger: 'change' },
		]
	}
	watch(()=>dialogVisible.value,(val)=>{
		if(!val){
			popupForm.value = createPopupForm()
		}
	})
	watch(() => popupForm.value.pid, (pid) => {
		if (!isTopLevelCategory(pid)) {
			popupForm.value.machine_cate = 0
		}
	})
	const submitPopup = async () => {
		await popupRef.value.validate(async (valid) => {
			if (valid) {
				// 为顶级分类准备数据
				const formData = { ...popupForm.value };
				if (isTopLevelCategory(formData.pid)) {
					// 确保顶级分类包含 oa_cate_id 字段
					if (!formData.oa_cate_id) {
						// 如果未选择类型，默认设置为第一个选项（湿喷机-1）
						formData.oa_cate_id = 1;
					}
					formData.machine_cate = normalizeMachineCate(formData.machine_cate)
				} else {
					// 子分类不需要 oa_cate_id 字段，确保不传递
					delete formData.oa_cate_id;
					formData.machine_cate = 0
				}
				
				popupForm.value?.id ? await editmachineCateApi(formData) : await addmachineCateApi(formData)
				dialogVisible.value = false
				getmachineCate()
			}
		})
	}
	const del = (row) => {
		ElMessageBox.confirm('确定要删除吗？','温馨提示',{
				confirmButtonText: '确定',
				cancelButtonText: '取消',
				type: 'warning',
			}
		).then(async () => {
			await deletemachineCateApi({id:row.id})
			getmachineCate()
		})
	}
	const getTopLevelIndex = (row) => {
		if (!isTopLevelCategory(row.pid)) return ''
		const index = tableData.value.findIndex((item) => item.id === row.id)
		return index > -1 ? index + 1 : ''
	}
	const getMachineCateLabel = (row) => {
		if (!isTopLevelCategory(row.pid)) return ''
		if (row.machine_cate_desc) return row.machine_cate_desc
		return normalizeMachineCate(row.machine_cate) === 1 ? '是' : '否'
	}
	const edit = (row) => {
		const currentRow = JSON.parse(JSON.stringify(row))
		popupForm.value = {
			...createPopupForm(),
			...currentRow,
			machine_cate: isTopLevelCategory(currentRow.pid) ? normalizeMachineCate(currentRow.machine_cate) : 0
		}
		// 确保 oa_cate_id 字段正确回填
		if (isTopLevelCategory(popupForm.value.pid)) {
			// 如果是顶级分类但没有 oa_cate_id，则初始化为 undefined
			if (!popupForm.value.hasOwnProperty('oa_cate_id')) {
				popupForm.value.oa_cate_id = undefined;
			}
		} else {
			// 如果是子分类，确保没有 oa_cate_id 字段
			if (popupForm.value.hasOwnProperty('oa_cate_id')) {
				delete popupForm.value.oa_cate_id;
			}
		}
		dialogVisible.value = true
	}
	
	const getmachineCate = async () => {
		const { lists } = await getmachineCateAi({
			page_no: 1,
			page_size: 9999
		})
		tableData.value = lists
	}

	onMounted(()=>{
		getmachineCate()
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
