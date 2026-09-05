<template>
    <div class="layout-default flex h-screen w-full">
        <div class="app-aside">
            <layout-sidebar />
        </div>

        <div class="flex-1 flex flex-col min-w-0">
            <div class="app-header">
                <layout-header />
            </div>
            <div class="app-main flex-1 min-h-0">
                <layout-main />
            </div>
        </div>

        <!-- 全局消息通知 -->
        <div class="message-notification fixed bottom-6 right-6 z-50">
            <el-dropdown @command="handleNotificationClick" trigger="click">
                <div class="notification-button" :class="{ 'has-unread': totalUnread > 0 }">
                    <el-badge :value="totalUnread" :hidden="totalUnread === 0">
                        <el-icon class="notification-icon"><Bell /></el-icon>
                    </el-badge>
                </div>
                <template #dropdown>
                    <el-dropdown-menu class="notification-menu">
                        <div v-if="totalUnread === 0" class="notification-empty">
                            <el-empty description="暂无未读消息" />
                        </div>
                        <el-dropdown-item v-for="item in notificationTypes" :key="item.type" :command="item.type" class="notification-item">
                            <div class="notification-item-content">
                                <span class="notification-label">{{ item.label }}</span>
                                <el-badge :value="item.count" :hidden="item.count === 0" />
                            </div>
                        </el-dropdown-item>
                    </el-dropdown-menu>
                </template>
            </el-dropdown>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { Bell } from '@element-plus/icons-vue'
import { getNoticeCount } from '@/api/app'
import LayoutHeader from './components/header/index.vue'
import LayoutMain from './components/main.vue'
import LayoutSidebar from './components/sidebar/index.vue'

const router = useRouter()

// 消息通知数据
const notificationTypes = ref([
  { type: '1', label: '工单通知', count: 0 },
  { type: '2', label: '换件通知', count: 0 },
  { type: '3', label: '异动通知', count: 0 }
])

// 计算未读消息总数
const totalUnread = computed(() => {
  return notificationTypes.value.reduce((sum, item) => sum + item.count, 0)
})

// 上一次的未读消息数
const lastTotalUnread = ref(0)

// 定时器引用
let notificationTimer: number | null = null

// 获取消息通知数据
const fetchNotificationData = async () => {
  try {
    const response = await getNoticeCount({ page_no: 1, page_size: 10 })
    if (response) {
      notificationTypes.value[0].count = response.num1 || 0
      notificationTypes.value[1].count = response.num2 || 0
      notificationTypes.value[2].count = response.num3 || 0
      
      // 检查是否有未读消息
      if (totalUnread.value > 0) {
        // 自动展开下拉菜单
        const notificationButton = document.querySelector('.notification-button')
        if (notificationButton) {
          // 触发点击事件
          notificationButton.click()
          // 5秒后再次点击关闭
          setTimeout(() => {
            if (notificationButton) {
              notificationButton.click()
            }
          }, 5000)
        }
      }
      
      // 更新上一次的未读消息数
      lastTotalUnread.value = totalUnread.value
    }
  } catch (error) {
    console.error('获取消息通知失败:', error)
  }
}

// 处理通知点击
const handleNotificationClick = (type: string) => {
  router.push({ path: '/message', query: { type } })
}

// 组件挂载时获取数据
onMounted(() => {
  fetchNotificationData()
  // 每60秒刷新一次消息通知
  notificationTimer = window.setInterval(fetchNotificationData, 60000)
})

// 组件卸载时清除定时器
onUnmounted(() => {
  if (notificationTimer) {
    clearInterval(notificationTimer)
  }
})
</script>

<style scoped>
.message-notification {
  position: fixed;
  bottom: 20px;
  right: 20px;
  z-index: 50;
  animation: fade-in 0.8s ease-out;
}

@keyframes fade-in {
  from {
    opacity: 0;
    transform: translateY(30px) scale(0.7);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.notification-button {
  width: 40px;
  height: 40px;
  background-color: #ffffff;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 8px 0 rgba(0, 0, 0, 0.1);
  cursor: pointer;
  transition: all 0.4s ease;
  position: relative;
  overflow: hidden;
}

.notification-button:hover {
  box-shadow: 0 4px 12px 0 rgba(0, 0, 0, 0.2);
  transform: translateY(-3px);
  background-color: #f5f7fa;
}

.notification-icon {
  font-size: 20px;
  color: #606266;
  transition: all 0.4s ease;
  position: relative;
  z-index: 1;
}

.notification-button:hover .notification-icon {
  color: #409eff;
  transform: scale(1.1);
}

/* 未读消息时的跳动效果 */
.notification-button.has-unread {
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.1);
  }
  100% {
    transform: scale(1);
  }
}

/* 徽章样式 */
:deep(.el-badge) {
  position: relative;
  display: inline-block;
  line-height: 1;
  vertical-align: middle;
}

:deep(.el-badge__content) {
  animation: bounce 1.2s ease-in-out;
  animation-delay: 0.3s;
  min-width: 24px;
  padding: 0 6px;
  font-size: 11px;
  height: 20px;
  line-height: 20px;
  border-radius: 10px;
  background-color: #f56c6c;
  color: #fff;
  text-align: center;
  white-space: nowrap;
  position: absolute;
  top: -6px;
  right: -12px;
  transform: translate(0, 0);
  box-sizing: border-box;
  font-weight: bold;
  z-index: 100;
  overflow: visible;
}

@keyframes bounce {
  0%, 20%, 53%, 80%, 100% {
    animation-timing-function: cubic-bezier(0.215, 0.610, 0.355, 1.000);
    transform: translate(0, 0) translate3d(0, 0, 0);
  }
  40%, 43% {
    animation-timing-function: cubic-bezier(0.755, 0.050, 0.855, 0.060);
    transform: translate(0, 0) translate3d(0, -25px, 0);
  }
  70% {
    animation-timing-function: cubic-bezier(0.755, 0.050, 0.855, 0.060);
    transform: translate(0, 0) translate3d(0, -15px, 0);
  }
  90% {
    transform: translate(0, 0) translate3d(0, -5px, 0);
  }
}

/* 下拉菜单动画 */
.el-dropdown-menu {
  min-width: 180px;
  max-height: 250px;
  overflow-y: auto;
  animation: slide-up 0.5s ease-out;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  border-radius: 8px;
  padding: 8px 0;
  overflow: hidden;
}

/* 弹出动画 */
@keyframes slide-up {
  from {
    opacity: 0;
    transform: translateY(15px) scale(0.9);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

/* 关闭动画 */
.el-dropdown-menu.slide-down {
  animation: slide-down 0.4s ease-in forwards;
}

@keyframes slide-down {
  from {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
  to {
    opacity: 0;
    transform: translateY(15px) scale(0.9);
  }
}

/* 空状态 */
.notification-empty {
  padding: 30px 20px;
  text-align: center;
}

/* 通知项 */
.notification-item {
  padding: 0;
  margin: 0;
  border-radius: 0;
}

.notification-item-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  padding: 12px 16px;
  transition: all 0.3s ease;
}

.notification-item-content:hover {
  background-color: #f5f7fa;
}

.notification-label {
  font-size: 13px;
  color: #303133;
  transition: all 0.3s ease;
  flex: 1;
  margin-right: 8px;
}

.notification-item-content:hover .notification-label {
  color: #409eff;
}

/* 为每个通知项添加淡入动画 */
.notification-item {
  opacity: 0;
  animation: item-fade-in 0.3s ease-out forwards;
}

@keyframes item-fade-in {
  from {
    opacity: 0;
    transform: translateX(10px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

/* 为每个通知项添加不同的动画延迟 */
.notification-item:nth-child(1) {
  animation-delay: 0.1s;
}

.notification-item:nth-child(2) {
  animation-delay: 0.2s;
}

.notification-item:nth-child(3) {
  animation-delay: 0.3s;
}

/* 点击波纹效果 */
.notification-button::after {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  width: 0;
  height: 0;
  border-radius: 50%;
  background-color: rgba(64, 158, 255, 0.3);
  transform: translate(-50%, -50%);
  transition: width 0.8s, height 0.8s;
  z-index: 0;
}

.notification-button:active::after {
  width: 200px;
  height: 200px;
}

/* 滚动条样式 */
.el-dropdown-menu::-webkit-scrollbar {
  width: 6px;
}

.el-dropdown-menu::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 3px;
}

.el-dropdown-menu::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 3px;
}

.el-dropdown-menu::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}
</style>