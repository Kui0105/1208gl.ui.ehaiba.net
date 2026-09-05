<template>
	<el-form-item :label="`${row.name}：`">
		<el-input v-if="row.small_type == 1 || row.small_type == 11 || row.small_type == 8" :placeholder="`请输入${row.name}`" v-model="row.value" />
		<el-input v-if="row.small_type == 2" v-model="row.value" type="textarea" :placeholder="`请输入${row.name}`" />
		<material-picker v-if="row.small_type == 3" type="image" v-model="row.value" :limit="1" />
		<material-picker v-if="row.small_type == 4" type="image" v-model="row.value" :limit="10" />
		<material-picker v-if="row.small_type == 5" type="file" v-model="row.value" :limit="3" />
		<el-radio-group v-if="row.small_type == 6" v-model="row.value">
			<el-radio v-for="radis in row.extra_data" :label="radis.name" />
		</el-radio-group>
		<el-select v-if="row.small_type == 9" v-model="row.value" style="width: 100%;">
			<el-option v-for="radis in row.extra_data" :label="radis.name" :value="radis.name" />
		</el-select>
		<div class="flex flex-wrap" v-if="row.small_type == 10">
			<div v-for="img in row.extra_data">
				<material-picker type="image" v-model="img.value" :limit="1" />
				<div class="text-center">{{img.name}}</div>
			</div>
		</div>
		<el-date-picker style="width: 100%;" value-format="YYYY-MM-DD" v-if="row.small_type == 13" v-model="row.value" type="date" placeholder="请选择日期" />
		<material-picker v-if="row.small_type == 12" type="video" v-model="row.value" :limit="3" />
	</el-form-item>
</template>

<script setup lang="ts">
	defineProps({
		row: {
			type: Object,
			default: () => ({})
		}
	})
</script>

<style>
</style>
