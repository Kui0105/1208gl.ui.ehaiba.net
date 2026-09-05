<template>
	<div class="uw-detail">
		<div class="back" >
			<el-icon style="cursor: pointer;" :size="20" @click="$router.back()">
				<Back />
			</el-icon>
		</div>
		<div class="uw-detail-box" v-if="device">
			<div class="left">
				<h4>设备信息</h4>
				<div class="left-box">
					<div class="left-box-item" style="gap: 0 28px;">
						<div class="left-box-item">
							<span>设备名称：</span>
							<span>{{device.name}}</span>
						</div>
					</div>
					<div class="left-box-item">
						<span>设备编号：</span>
						<span>{{device.code}}</span>
					</div>
					<div class="left-box-item">
						<span>设备型号：</span>
						<span>{{device.cate}}</span>
					</div>
					<div class="left-box-item">
						<span>设备类型：</span>
						<span>{{device.type}}</span>
					</div>
					<div class="left-box-item">
						<span>出厂日期：</span>
						<span>{{device.born_date}}</span>
					</div>
					<div class="left-box-item">
						<span>单位名称：</span>
						<span>{{device.company_name}}</span>
					</div>
					<div class="left-box-item">
						<span>负责人：</span>
						<span>{{device.contact}}</span>
					</div>
					<div class="left-box-item">
						<span>联系电话：</span>
						<span>{{device.mobile}}</span>
					</div>
					<div class="left-box-item">
						<span>服务期时间：</span>
						<span>{{device.over_date}}</span>
					</div>
					<div class="left-box-item">
						<span>使用地区：</span>
						<span>{{device.addresss}}</span>
					</div>
					<div class="left-box-item">
						<span>详细地址：</span>
						<span>{{device.full_address}}</span>
					</div>
				</div>
			</div>
			<div class="right">
				<h4>异常信息</h4>
				<div class="right-box">
					<div class="error-info">
                        <div class="error-item">
                            <span class="label">三方单号：</span>
                            <span class="value">{{device.deliverNo}}</span>
                        </div>
						<div class="error-item">
							<span class="label">重新拉取次数：</span>
							<span class="value">{{device.push_num}}</span>
						</div>
						<div class="error-item">
							<span class="label">重新拉取时间：</span>
							<span class="value">{{device.push_time}}</span>
						</div>
						<div class="error-item">
							<span class="label">异常描述：</span>
							<span class="value">{{device.error_msg || '暂无'}}</span>
						</div>
					</div>
				</div>
				<h4 style="margin-top: 40px;">备注信息</h4>
				<div class="right-box" style="white-space: pre-line;">{{device.remark}}</div>
			</div>
		</div>
	</div>
</template>

<script setup>
	import { ref , onMounted } from "vue";
	import { Back } from "@element-plus/icons-vue";
	import { getmachineErrorDetailApi } from '@/api/device/device'
	import { useRoute } from 'vue-router';
	const route = useRoute()
	const device = ref(null)
	const getDetail = () => {
		getmachineErrorDetailApi({id:route.query.id}).then((res)=>{
			device.value = res
		})
	}
	onMounted(()=>{
		getDetail()
	})
</script>

<style lang="scss" scoped>
	.uw-detail {
		background: #FFFFFF;
		box-shadow: 0px 0px 30px 0px rgba(245, 225, 228, 0.5);
		border-radius: 16px 16px 16px 16px;
		padding: 20px;
		width: 100%;
		height: calc(100vh - 91px - 32px);
		display: flex;
		flex-direction: column;
		align-items: center;
	}
	.back{
		width: 100%;
	}
	.button-group {
		display: flex;
		gap: 12px;
		margin-top: 20px;
	}
	.uw-detail-box {
		flex: 1;
		width: 100%;
		display: flex;
		padding-left: 52px;
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
			&-box {
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
		.right{
			flex: 1.5;
			h4{
				font-weight: 400;
				font-size: 20px;
				color: #191919;
				line-height: 28px;
				margin-bottom: 40px;
			}
			&-box{
				font-weight: 400;
				font-size: 14px;
				color: #333333;
				line-height: 20px;
			}
		}
	}
	.error-info {
		display: flex;
		flex-direction: column;
		gap: 20px;
		.error-item {
			display: flex;
			gap: 12px;
			.label {
				min-width: 80px;
				color: #666;
			}
			.value {
				color: #333;
			}
		}
	}
</style>