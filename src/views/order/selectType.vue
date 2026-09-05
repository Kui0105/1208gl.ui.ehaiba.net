<template>
	<div class="uw-select-type">
		<img class="back" src="/src/assets/uwback.png" @click="$router.back()">
		<ul>
			<li v-for="item in typeList">
				<h4>{{item.name}}</h4>
				<div class="doc">{{item.intro}}</div>
				<div class="time">{{item.update_time}}</div>
				<el-button class="uw-button" type="primary" @click="openWindow(item)">查看</el-button>
			</li>
		</ul>
	</div>
</template>

<script setup lang="ts">
	import { onMounted , ref} from 'vue';
	import { useRouter } from 'vue-router'
	import { getOrderType } from '@/api/order/order'
	const router = useRouter()
	const typeList = ref([])
	const getOrderTypeApi = async() => {
		const data = await getOrderType()
		typeList.value = data
		console.log(data);
	}
	const openWindow = (item) => {
		router.push({
			path: 'createForm',
			query: {
				id: item.id
			}
		})
	}
	onMounted(()=>{
		console.log('执行了吗');
		getOrderTypeApi()
	})
</script>

<style lang="scss" scoped>
	.uw-select-type{
		background: #FFFFFF;
		box-shadow: 0px 0px 30px 0px rgba(245,225,228,0.5);
		border-radius: 16px 16px 16px 16px;
		height: calc(100vh - 91px - 32px);
		padding:64px 62px 0 64px;
		position: relative;
		.back{
			position: absolute;
			left:20px;
			top: 20px;
		}
		ul{
			display: flex;
			flex-wrap: wrap;
			gap: 24px;
			li{
				width: 364px;
				height: 146px;
				background: #FEF9F9;
				border-radius: 8px 8px 8px 8px;
				border-top: 1px solid #D74130;
				padding: 24px;
				position: relative;
				h4{
					font-weight: 600;
					font-size: 18px;
					color: #191919;
					line-height: 25px;
				}
				.doc{
					font-weight: 400;
					font-size: 14px;
					color: #565656;
					line-height: 20px;
					margin-top: 10px;
				}
				.time{
					margin-top: 24px;
					font-weight: 400;
					font-size: 14px;
					color: #AAAAAA;
					line-height: 20px;
				}
				.uw-button{
					position: absolute;
					right: 16px;
					bottom: 16px;
				}
			}
		}
	}
</style>