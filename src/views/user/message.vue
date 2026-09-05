<template>
	<div>
		<el-form class="el-form" inline>
			<el-form-item label="状态">
				<el-select v-model="form.status" style="width: 190px;">
					<el-option label="全部" value=""></el-option>
					<el-option label="未读" value="0"></el-option>
					<el-option label="已读" value="1"></el-option>
				</el-select>
			</el-form-item>
			<el-form-item>
				<el-button type="primary" @click="currentChange(1)">查询</el-button>
				<el-button @click="restData">重置</el-button>
			</el-form-item>
		</el-form>
		<div class="uw-box">

			<div class="uw-box-tab flex justify-between items-center">
				<el-tabs v-model="form.type" class="demo-tabs" @tab-change="currentChange(1)">
					<el-tab-pane :label="`工单通知(${extend.num1})`" name="1"></el-tab-pane>
					<el-tab-pane :label="`换件通知(${extend.num2})`" name="2"></el-tab-pane>
					<el-tab-pane :label="`异动通知(${extend.num3})`" name="3"></el-tab-pane>
				</el-tabs>
				<div class="right">
					<el-button @click="createOrder(selectList)">标记为已读</el-button>
					<el-button @click="deleteAll(selectList)" type="primary">批量删除</el-button>
				</div>
			</div>
			<el-table :data="tableData" @selection-change="selectionChange">
				<el-table-column type="selection" width="50" />
				<el-table-column type="index" label="序号" width="120" />
				<el-table-column prop="content" label="消息内容" />
				<el-table-column prop="read_str" label="状态" />
				<el-table-column prop="create_time" label="提醒时间" />
				<el-table-column label="操作">
					<template #default="{row}">
						<el-button type="text" size="small" @click="viewOpen(row)">查看</el-button>
						<el-button type="text" size="small" @click="deleteAll([row])">删除</el-button>
					</template>
				</el-table-column>
			</el-table>
			<div class="flex justify-center items-center mt-[18px]">
				<el-pagination background layout="prev, pager, next" :total="totalCount"
					@current-change="currentChange" />
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
	import { getNoticeList , readNotice, delNotice } from '@/api/app';
	import { reactive, ref } from 'vue';
	import { ElMessage, ElMessageBox } from 'element-plus';
	import { useRouter } from 'vue-router';
	const router = useRouter()
	
	const form = reactive({
		type: '1',
		status: ''
	})
	const extend = ref({
		num1: 0,
		num2: 0,
		num3: 0,
	})
	const totalCount = ref(0)
	const tableData = ref([]);
	const pageNo = ref(1);

	const selectList = ref([])

	getNoticeList({ ...form, page_no: pageNo.value, page_size: 10 }).then(res => {
		tableData.value = res.lists;
		extend.value = res.extend
		totalCount.value = res.count
	})
	const currentChange = (page : number) => {
		pageNo.value = page;
		getNoticeList({ ...form, page_no: pageNo.value, page_size: 10 }).then(res => {
			tableData.value = res.lists;
			extend.value = res.extend
			totalCount.value = res.count
		})
	}
	const restData = () => {
		form.status = ''
		currentChange(1)
	}
	const selectionChange = (list : any[]) => {
		selectList.value = list
	}

	const viewOpen = (row) => {
		// 标记为已读
		readNotice({ ids: [row.id] }).then(res => {
			// 标记成功后刷新数据
			currentChange(pageNo.value)
		})
		
		const { extra, scene_id } = row
		if (scene_id == 201) {
			router.push({ path: '/order/detail', query: { id: extra } })
		} else if (scene_id == 202) {
			router.push({ path: '/order/clothesdetail', query: { id: extra } })
		} else if (scene_id == 203) {
			router.push({ path: '/device/fluctuationdetail', query: { id: extra } })
		}
	}

	const deleteAll = (list : any[]) => {
		if (list.length == 0) return ElMessage.error('请选择要删除的数据')
		ElMessageBox.confirm('确定删除吗?','温馨提示',{
			confirmButtonText: '确定',
			cancelButtonText: '取消',
			type: 'warning',
		}).then(() => {
			delNotice({ ids: list.map(item => item.id) }).then(res => {
				ElMessage.success('删除成功!')
				currentChange(pageNo.value)
			})
		})
	}

	const createOrder = (list : any[]) => {
		if (list.length == 0) return ElMessage.error('请选择要删除的数据')
		ElMessageBox.confirm('确定标记为已读吗?','温馨提示',{
			confirmButtonText: '确定',
			cancelButtonText: '取消',
			type: 'warning',
		}).then(() => {
			readNotice({ ids: list.map(item => item.id) }).then(res => {
				ElMessage.success('标记成功!')
				currentChange(pageNo.value)
			})
		})
	}
</script>

<style scoped lang="scss">
	::v-deep .el-tabs__header {
		border-bottom: none;
	}

	::v-deep .el-tabs__nav-wrap::after {
		height: 0 !important;
	}

	.el-form {
		margin-bottom: 20px;
		background-color: #fff;
		padding-top: 18px;
		border-radius: 4px;
		padding-left: 18px;
	}

	.uw-box {
		background-color: #fff;
		padding: 20px;
		margin-bottom: 20px;
		border-radius: 4px;
		padding-top: 5px;

		.el-radio-group {
			margin-bottom: 20px;
		}
	}
</style>