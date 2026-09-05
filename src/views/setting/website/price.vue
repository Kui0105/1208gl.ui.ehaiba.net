<template>
  <div class="price-config-container">
    <!-- 页面标题 -->
    <div class="page-header">
      <h2>工单费用配置</h2>
      <p>设置不同设备类型和工单类型的费用标准</p>
    </div>

    <!-- 配置表单 -->
    <div class="config-form">
      <el-form :model="priceConfig" label-width="200px">
        <!-- 按工单数量计费 -->
        <el-divider content-position="left">按工单数量计费</el-divider>
        <div class="fee-section">
          <el-row :gutter="20">
            <el-col :span="8" v-for="device in numFeeDevices" :key="device.id">
              <el-card class="device-card">
                <div slot="header" class="device-header">
                  <span>{{ device.name }}</span>
                </div>
                <el-form-item :label="`${feeType.name}费用`" v-for="feeType in numFeeTypes" :key="feeType.id">
                  <el-input-number
                    v-model="priceConfig[`num_${device.id}_${feeType.id}`]"
                    :min="0"
                    :precision="2"
                    :step="0.01"
                    controls-position="right"
                    placeholder="请输入费用"
                  >
                    <template #append>元/单</template>
                  </el-input-number>
                </el-form-item>
              </el-card>
            </el-col>
          </el-row>
        </div>

        <!-- 按工单工时计费 -->
        <el-divider content-position="left">按工单工时计费</el-divider>
        <div class="fee-section">
          <el-row :gutter="20">
            <el-col :span="8" v-for="device in hourFeeDevices" :key="device.id">
              <el-card class="device-card">
                <div slot="header" class="device-header">
                  <span>{{ device.name }}</span>
                </div>
                <el-form-item :label="`${feeType.name}费用`" v-for="feeType in hourFeeTypes" :key="feeType.id">
                  <el-input-number
                    v-model="priceConfig[`hour_${device.id}_${feeType.id}`]"
                    :min="0"
                    :precision="2"
                    :step="0.01"
                    controls-position="right"
                    placeholder="请输入费用"
                  >
                    <template #append>元/小时</template>
                  </el-input-number>
                </el-form-item>
              </el-card>
            </el-col>
          </el-row>
        </div>

        <!-- 操作按钮 -->
        <div class="action-buttons">
          <el-button type="primary" @click="handleSave" :loading="loading">保存配置</el-button>
          <el-button @click="handleReset">重置</el-button>
        </div>
      </el-form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { getPriceInfo, setPriceInfo } from '@/api/setting/website'

// 设备类型配置
const deviceTypes = [
  { id: 1, name: '湿喷机' },
  { id: 2, name: '立拱装药台车' },
  { id: 3, name: '直臂凿岩台车' },
  { id: 9, name: '曲臂凿岩台车' },
  { id: 7, name: '锚杆台车' },
  { id: 10, name: '矿用设备' }
]

// 计费方式配置
const numFeeTypes = [
  { id: 2, name: '点检' },
  { id: 5, name: '接机' },
  { id: 3, name: '预防性维护' }
]

const hourFeeTypes = [
  { id: 1, name: '维修' },
  { id: 4, name: '技改' }
]

// 按工单数量计费的设备类型
const numFeeDevices = deviceTypes

// 按工单工时计费的设备类型
const hourFeeDevices = deviceTypes

// 价格配置数据
const priceConfig = reactive<Record<string, number>>({})

// 加载状态
const loading = ref(false)

// 初始化价格配置
const initPriceConfig = () => {
  // 初始化按工单数量计费的配置
  numFeeDevices.forEach(device => {
    numFeeTypes.forEach(feeType => {
      const key = `num_${device.id}_${feeType.id}`
      priceConfig[key] = 0
    })
  })

  // 初始化按工单工时计费的配置
  hourFeeDevices.forEach(device => {
    hourFeeTypes.forEach(feeType => {
      const key = `hour_${device.id}_${feeType.id}`
      priceConfig[key] = 0
    })
  })
}

// 获取配置信息
const fetchPriceInfo = async () => {
  try {
    loading.value = true
    const response = await getPriceInfo()
    console.log('接口返回数据:', response)
    if (response) {
      // 将接口数据合并到priceConfig
      Object.keys(response).forEach(key => {
        // 确保key存在于priceConfig中，或者动态添加
        if (!priceConfig.hasOwnProperty(key)) {
          priceConfig[key] = 0
        }
        priceConfig[key] = parseFloat(response[key]) || 0
      })
      
      console.log('赋值后的priceConfig:', priceConfig)
    }
  } catch (error) {
    console.error('获取价格配置失败:', error)
    ElMessage.error('获取配置失败，请检查接口是否可用')
  } finally {
    loading.value = false
  }
}

// 保存配置
const handleSave = async () => {
  try {
    loading.value = true
    
    // 验证数据
    const hasEmptyValue = Object.values(priceConfig).some(value => value === null || value === undefined)
    if (hasEmptyValue) {
      ElMessage.warning('请填写所有费用配置')
      return
    }

    await setPriceInfo(priceConfig)
    ElMessage.success('配置保存成功')
  } catch (error) {
    console.error('保存价格配置失败:', error)
    ElMessage.error('保存配置失败')
  } finally {
    loading.value = false
  }
}

// 重置配置
const handleReset = () => {
  initPriceConfig()
  ElMessage.info('配置已重置')
}

// 生命周期
onMounted(() => {
  initPriceConfig()

  fetchPriceInfo()
})
</script>

<style scoped>
.price-config-container {
  padding: 20px;
  background-color: #f5f7fa;
  min-height: 100vh;
}

.page-header {
  background-color: #fff;
  padding: 20px;
  border-radius: 4px;
  margin-bottom: 20px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.page-header h2 {
  margin: 0 0 8px 0;
  color: #303133;
}

.page-header p {
  margin: 0;
  color: #909399;
  font-size: 14px;
}

.config-form {
  background-color: #fff;
  padding: 20px;
  border-radius: 4px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.fee-section {
  margin-bottom: 30px;
}

.device-card {
  margin-bottom: 20px;
}

.device-header {
  font-weight: bold;
  color: #303133;
}

.action-buttons {
  text-align: center;
  margin-top: 30px;
  padding-top: 20px;
  border-top: 1px solid #ebeef5;
}

:deep(.el-form-item__label) {
  font-weight: 500;
}

:deep(.el-input-number) {
  width: 100%;
}
</style>