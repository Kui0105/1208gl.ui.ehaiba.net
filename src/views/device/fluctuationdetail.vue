<template>
	<div class="uw-detail">
		<div class="back" >
			<el-icon style="cursor: pointer;" :size="20" @click="$router.back()">
				<Back />
			</el-icon>
		</div>
		<div class="uw-detail-header" v-if="device">
			<div>申请人：{{device.engineer_name}}</div>
			<div>状态：{{device.status_desc}}</div>
			<div>申请时间：{{device.create_time}}</div>
		</div>
		<div class="uw-detail-box" v-if="device">
			<div class="left">
				<h4>原本信息</h4>
				<div class="left-box">
					<div class="left-box-item">
						<span>设备编号：</span>
						<span>{{device.code}}</span>
					</div>
					<div class="left-box-item">
						<span>设备类型：</span>
						<span>{{device.type}}</span>
					</div>
					<div class="left-box-item">
						<span>设备型号：</span>
						<span>{{device.cate}}</span>
					</div>
					<div class="left-box-item">
						<span>申请人：</span>
						<span>{{device.engineer_name}}</span>
					</div>
					<div class="left-box-item">
						<span>负责人：</span>
						<span>{{device.old_contact}}</span>
					</div>
					<div class="left-box-item">
						<span>单位名称：</span>
						<span>{{device.company_name}}</span>
					</div>
					<div class="left-box-item">
						<span>客户电话：</span>
						<span>{{device.old_mobile}}</span>
					</div>
					<div class="left-box-item">
						<span>所在区域：</span>
						<span>{{device.old_full_address}}</span>
					</div>
					<div class="left-box-item">
						<span>详细地址：</span>
						<span>{{device.old_address}}</span>
					</div>
				</div>
			</div>
			<div class="right">
				<h4>异动信息</h4>
				<div class="left-box">
					<div class="left-box-item">
						<span>设备编号：</span>
						<span>{{device.code}}</span>
					</div>
					<div class="left-box-item">
						<span>设备类型：</span>
						<span>{{device.type}}</span>
					</div>
					<div class="left-box-item">
						<span>设备型号：</span>
						<span>{{device.cate}}</span>
					</div>
					<div class="left-box-item">
						<span>申请人：</span>
						<span>{{device.engineer_name}}</span>
					</div>
					<div class="left-box-item">
						<span>负责人：</span>
						<span>{{device.new_contact}}</span>
					</div>
					<div class="left-box-item">
						<span>单位名称：</span>
						<span>{{device.company_name}}</span>
					</div>
					<div class="left-box-item">
						<span>客户电话：</span>
						<span>{{device.new_mobile}}</span>
					</div>
					<div class="left-box-item">
						<span>所在区域：</span>
						<span>{{device.new_full_address}}</span>
					</div>
					<div class="left-box-item">
						<span>详细地址：</span>
						<span>{{device.new_address}}</span>
					</div>
				</div>
			</div>
		</div>
	</div>
</template>

<script setup>
	import { ref , onMounted } from "vue";
	import { Back , EditPen } from "@element-plus/icons-vue";
	import { getmachineChangeDetailApi } from '@/api/device/device'
	import { useRoute } from 'vue-router';
	import { ElMessage } from 'element-plus';
	const route = useRoute()
	const textHtml = ref('示例文案：本设备是一种集')
	const device = ref(null)
	onMounted(()=>{
		getmachineChangeDetailApi({id:route.query.id}).then(res=>{
			device.value = res
		})
	})
</script>

<style lang="scss" scoped>
	.uw-detail {
		background: #FFFFFF;
		box-shadow: 0px 0px 30px 0px rgba(245, 225, 228, 0.5);
		border-radius: 16px 16px 16px 16px;
		padding: 0 104px;
		width: 100%;
		height: calc(100vh - 91px - 32px);
		display: flex;
		flex-direction: column;
		align-items: center;
		position: relative;
	}
	.back{
		width: 100%;
		position: absolute;
		left: 20px;
		top: 20px;
	}
	.uw-detail-header{
		line-height: 70px;
		width: 100%;
		display: flex;
		border-bottom: 1px solid #DFE5F1;
		gap: 0 48px;
		margin-bottom: 32px;
		div{
			font-weight: 400;
			font-size: 14px;
			color: #565656;
		}
	}
	.uw-detail-box {
		flex: 1;
		width: 100%;
		display: flex;
		.left {
			flex: 1;
			min-width: 350px;
			h4{
				font-weight: 400;
				font-size: 20px;
				color: #191919;
				line-height: 28px;
				margin-bottom: 40px;
			}
			
		}
		.right{
			flex: 1.5;
			h4{
				font-weight: 400;
				font-size: 20px;
				color: #191919;
				line-height: 28px;
				margin-bottom: 40px;
			}
			
		}
		.left-box {
			display: flex;
			flex-direction: column;
			gap: 28px 0;
			&-item {
				font-weight: 400;
				font-size: 14px;
				color: #333333;
				line-height: 20px;
				display: flex;
				gap: 0 12px;
				span{
					&:nth-child(1){
						min-width: 70px;
					}
				}
			}
		}
	}
</style>