<template>
	<div class="uw-box">
		<!-- 新增 -->
		<el-button class="mb-[16px]" type="primary" @click="handleAdd">
			添加
		</el-button>

		<!-- 表格 -->
		<el-table :data="tableData" >
			<el-table-column prop="id" label="ID" width="80" />

			<el-table-column label="图片" >
				<template #default="{ row }">
					<el-image :src="row.img" style="width: 100px; height: 100px" :preview-src-list="[row.img]"
						preview-teleported />
				</template>
			</el-table-column>

			<el-table-column prop="title" label="标题" />

			<el-table-column label="状态" >
				<template #default="{ row }">
					<el-tag v-if="row.status === 1" type="success">启用</el-tag>
					<el-tag v-else type="danger">禁用</el-tag>
				</template>
			</el-table-column>

			<el-table-column prop="sort" label="排序" />

			<el-table-column prop="create_time" label="创建时间" />

			<el-table-column label="操作" >
				<template #default="{ row }">
					<el-button type="text" @click="handleEdit(row)">编辑</el-button>
					<el-button type="text" @click="handleDelete(row)">删除</el-button>
				</template>
			</el-table-column>
		</el-table>

		<!-- 新增 / 编辑弹窗 -->
		<el-dialog v-model="dialogVisible" :title="isEdit ? '编辑' : '新增'" width="600px">
			<el-form :model="form" label-width="80px">
				<el-form-item label="图片">
					<material-picker type="image" v-model="form.img" :limit="1" />
				</el-form-item>

				<el-form-item label="标题">
					<el-input v-model="form.title" />
				</el-form-item>

				<el-form-item label="状态">
					<el-switch v-model="form.status" />
				</el-form-item>

				<el-form-item label="排序">
					<el-input v-model.number="form.sort" />
				</el-form-item>
			</el-form>

			<template #footer>
				<el-button @click="dialogVisible = false">取消</el-button>
				<el-button type="primary" @click="handleConfirm">
					确定
				</el-button>
			</template>
		</el-dialog>
	</div>
</template>

<script setup lang="ts">
	import { ref } from 'vue'
	import { ElMessage, ElMessageBox } from 'element-plus'
	import {
		getBannerList,
		addBanner,
		editBanner,
		delBanner
	} from '@/api/app'

	// 表格数据
	const tableData = ref<any[]>([])

	// 弹窗控制
	const dialogVisible = ref(false)
	const isEdit = ref(false)
	const currentId = ref<number | null>(null)

	// 表单数据
	const form = ref({
		img: '',
		title: '',
		status: true, // true = 启用
		sort: 0
	})

	// 获取列表
	const getList = async () => {
		const res = await getBannerList({
			page_size:9999
		})
		tableData.value = res.lists || []
	}

	getList()

	// 新增
	const handleAdd = () => {
		isEdit.value = false
		currentId.value = null
		form.value = {
			img: '',
			title: '',
			status: true,
			sort: 0
		}
		dialogVisible.value = true
	}

	// 编辑
	const handleEdit = (row : any) => {
		isEdit.value = true
		currentId.value = row.id
		form.value = {
			img: row.img,
			title: row.title,
			status: row.status === 1,
			sort: row.sort
		}
		dialogVisible.value = true
	}

	// 确认（新增 / 编辑）
	const handleConfirm = async () => {
		const payload = {
			img: form.value.img,
			title: form.value.title,
			sort: form.value.sort,
			status: form.value.status ? 1 : 0
		}

		if (isEdit.value && currentId.value) {
			await editBanner({
				id: currentId.value,
				...payload
			})
		} else {
			await addBanner(payload)
		}
		dialogVisible.value = false
		getList()
	}

	// 删除
	const handleDelete = async (row : any) => {
		await ElMessageBox.confirm(
			'确认删除该数据吗？',
			'提示',
			{ type: 'warning' }
		)

		await delBanner({ id: row.id })
		ElMessage.success('删除成功')
		getList()
	}
</script>

<style scoped>
	.uw-box {
		background-color: #fff;
		padding: 20px;
	}
</style>