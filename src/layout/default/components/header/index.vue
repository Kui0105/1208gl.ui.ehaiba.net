<template>
    <header class="header">
        <div class="navbar">
            <div class="flex-1 flex">
                <div class="navbar-item">
                    <el-tooltip
                        class="box-item"
                        effect="dark"
                        :content="isCollapsed ? '展开菜单' : '收起菜单'"
                        placement="bottom"
                    >
                        <fold />
                    </el-tooltip>
                </div>
                <div class="navbar-item">
                    <el-tooltip class="box-item" effect="dark" content="刷新" placement="bottom">
                        <refresh />
                    </el-tooltip>
                </div>
                <div class="flex items-center px-2" v-if="!isMobile && settingStore.showCrumb">
                    <breadcrumb />
                </div>
            </div>
            <div class="flex">
				<div class="navbar-item" @click="openWindow('/message')">
					<i class="local-icon-tongzhi">
						<svg aria-hidden="true" style="width: 20px; height: 20px; color: inherit;">
							<use xlink:href="#local-icon-tongzhi" fill="currentColor"></use>
						</svg>
					</i>
					<span v-if="userInfo.notice_num" class="num">{{userInfo.notice_num}}</span>
				</div>
				
                <!-- <div class="navbar-item" v-if="!isMobile">
                    <el-tooltip
                        class="box-item"
                        effect="dark"
                        :content="isFullscreen ? '退出全屏' : '全屏模式'"
                        placement="bottom"
                    >
                        <full-screen />
                    </el-tooltip>
                </div> -->
                <div class="navbar-item">
                    <user-drop-down />
                </div>
               <!-- <div class="navbar-item">
                    <el-tooltip
                        class="box-item"
                        effect="dark"
                        content="主题设置"
                        placement="bottom"
                    >
                        <setting />
                    </el-tooltip>
                </div> -->
            </div>
        </div>
        <multiple-tabs v-if="settingStore.openMultipleTabs" />
    </header>
</template>

<script setup lang="ts">
import { useFullscreen } from '@vueuse/core'
import { computed } from 'vue'
import { BellFilled } from '@element-plus/icons-vue'
import useAppStore from '@/stores/modules/app'
import useSettingStore from '@/stores/modules/setting'
import { useRouter } from 'vue-router'
import Setting from '../setting/index.vue'
import Breadcrumb from './breadcrumb.vue'
import Fold from './fold.vue'
import FullScreen from './full-screen.vue'
import MultipleTabs from './multiple-tabs.vue'
import Refresh from './refresh.vue'
import UserDropDown from './user-drop-down.vue'
import useUserStore from '@/stores/modules/user'
const userStore = useUserStore()
const router = useRouter()
const appStore = useAppStore()
const isMobile = computed(() => appStore.isMobile)
const isCollapsed = computed(() => appStore.isCollapsed)
const settingStore = useSettingStore()
const { isFullscreen } = useFullscreen()
const userInfo = computed(() => userStore.userInfo)
const openWindow = (path) =>{
	router.push({
		path
	})
}
</script>

<style lang="scss">
.navbar {
    height: var(--navbar-height);
    @apply flex px-2 bg-body;
    .navbar-item {
        @apply h-full  flex justify-center items-center  hover:bg-page;
		position: relative;
		.num{
			position: absolute;
			top: 10px;
			right: -5px;
			width: 16px;
			height: 16px;
			line-height: 16px;
			text-align: center;
			border-radius: 50%;
			background-color: #f56c6c;
			color: #fff;
			font-size: 12px;
			font-weight: 500;
		}
    }
}
</style>
