<template>
    <div class="upload">
        <el-upload
            v-model:file-list="fileList"
            ref="uploadRefs"
            :action="action"
            :multiple="multiple"
            :limit="limit"
            :show-file-list="false"
            :headers="headers"
            :data="data"
            :on-progress="handleProgress"
            :on-success="handleSuccess"
            :on-exceed="handleExceed"
            :on-error="handleError"
            :before-upload="handleBeforeUpload"
            :accept="getAccept"
        >
            <slot />
        </el-upload>
        <el-dialog
            v-if="showProgress && fileList.length"
            v-model="visible"
            title="上传进度"
            :close-on-click-modal="false"
            width="500px"
            :modal="false"
            @close="handleClose"
        >
            <div class="file-list p-4">
                <template v-for="(item, index) in fileList" :key="index">
                    <div class="mb-5">
                        <div>{{ item.name }}</div>
                        <div class="flex-1">
                            <el-progress :percentage="parseInt(item.percentage)" />
                        </div>
                    </div>
                </template>
            </div>
        </el-dialog>
    </div>
</template>

<script lang="ts">
import type { ElUpload, UploadRawFile } from 'element-plus'
import { computed, defineComponent, ref, shallowRef } from 'vue'

import config from '@/config'
import { RequestCodeEnum } from '@/enums/requestEnums'
import useAppStore from '@/stores/modules/app'
import useUserStore from '@/stores/modules/user'
import feedback from '@/utils/feedback'

export default defineComponent({
    components: {},
    props: {
        // 上传文件类型
        type: {
            type: String,
            default: 'image'
        },
        // 是否支持多选
        multiple: {
            type: Boolean,
            default: true
        },
        // 多选时最多选择几条
        limit: {
            type: Number,
            default: 10
        },
        // 上传时的额外参数
        data: {
            type: Object,
            default: () => ({})
        },
        // 是否显示上传进度
        showProgress: {
            type: Boolean,
            default: false
        }
    },
    emits: ['change', 'error', 'success', 'allSuccess'],
    setup(props, { emit }) {
        const userStore = useUserStore()
        const appStore = useAppStore()
        const uploadRefs = shallowRef<InstanceType<typeof ElUpload>>()
        const action = ref(`${config.baseUrl}${config.urlPrefix}/upload/${props.type}`)
        const headers = computed(() => ({
            token: userStore.token,
            version: appStore.config.version
        }))
        const visible = ref(false)
        const fileList = ref<any[]>([])

        const handleProgress = () => {
            visible.value = true
        }
        let uploadLen = 0
        const handleSuccess = (response: any, file: any) => {
            uploadLen++
            if (uploadLen == fileList.value.length) {
                uploadLen = 0
                fileList.value = []
                emit('allSuccess')
            }
            emit('change', file)
            if (response.code == RequestCodeEnum.SUCCESS) {
                emit('success', response)
            }
            if (response.code == RequestCodeEnum.FAIL && response.msg) {
                feedback.msgError(response.msg)
            }
        }
        const handleError = (event: any, file: any) => {
            uploadLen++
            if (uploadLen == fileList.value.length) {
                uploadLen = 0
                fileList.value = []
                emit('allSuccess')
            }
            feedback.msgError(`${file.name}文件上传失败`)
            uploadRefs.value?.abort(file)
            visible.value = false
            emit('change', file)
            emit('error', file)
        }
        const handleExceed = () => {
            feedback.msgError(`超出上传上限${props.limit}，请重新上传`)
        }
        const handleClose = () => {
            fileList.value = []
            visible.value = false
        }

        const handleBeforeUpload = async (file: UploadRawFile) => {
            if (props.type !== 'image') {
                return true
            }

            try {
                return await compressImage(file)
            } catch {
                return true
            }
        }

        const getAccept = computed(() => {
            switch (props.type) {
                case 'image':
                    return '.jpg,.png,.gif,.jpeg,.webp,.ico'
                case 'video':
                    return '.wmv,.avi,.mpg,.mpeg,.3gp,.mov,.mp4,.flv,.rmvb,.mkv'
                default:
                    return '*'
            }
        })
        return {
            uploadRefs,
            action,
            headers,
            visible,
            fileList,
            getAccept,
            handleProgress,
            handleSuccess,
            handleError,
            handleExceed,
            handleClose,
            handleBeforeUpload
        }
    }
})

const IMAGE_COMPRESS_CONFIG = {
    minSize: 512 * 1024,
    maxWidth: 1920,
    maxHeight: 1920,
    quality: 0.8
}

const SUPPORT_COMPRESS_TYPES = ['image/jpeg', 'image/png', 'image/webp']

async function compressImage(file: UploadRawFile): Promise<UploadRawFile | boolean> {
    if (!SUPPORT_COMPRESS_TYPES.includes(file.type)) {
        return true
    }

    const image = await loadImage(file)
    const { width, height } = image
    const needResize =
        width > IMAGE_COMPRESS_CONFIG.maxWidth || height > IMAGE_COMPRESS_CONFIG.maxHeight

    if (!needResize && file.size < IMAGE_COMPRESS_CONFIG.minSize) {
        URL.revokeObjectURL(image.src)
        return true
    }

    const { targetWidth, targetHeight } = getTargetSize(width, height)
    const canvas = document.createElement('canvas')
    canvas.width = targetWidth
    canvas.height = targetHeight

    const context = canvas.getContext('2d')
    if (!context) {
        URL.revokeObjectURL(image.src)
        return true
    }

    context.drawImage(image, 0, 0, targetWidth, targetHeight)
    URL.revokeObjectURL(image.src)

    const blob = await canvasToBlob(canvas, file.type)
    if (!blob || (!needResize && blob.size >= file.size)) {
        return true
    }

    const compressedFile = new File([blob], file.name, {
        type: blob.type || file.type,
        lastModified: Date.now()
    }) as UploadRawFile
    compressedFile.uid = file.uid

    return compressedFile
}

function loadImage(file: File): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
        const url = URL.createObjectURL(file)
        const image = new Image()
        image.onload = () => resolve(image)
        image.onerror = () => {
            URL.revokeObjectURL(url)
            reject()
        }
        image.src = url
    })
}

function getTargetSize(width: number, height: number) {
    const ratio = Math.min(
        IMAGE_COMPRESS_CONFIG.maxWidth / width,
        IMAGE_COMPRESS_CONFIG.maxHeight / height,
        1
    )

    return {
        targetWidth: Math.max(1, Math.round(width * ratio)),
        targetHeight: Math.max(1, Math.round(height * ratio))
    }
}

function canvasToBlob(canvas: HTMLCanvasElement, mimeType: string): Promise<Blob | null> {
    return new Promise((resolve) => {
        canvas.toBlob(resolve, mimeType, IMAGE_COMPRESS_CONFIG.quality)
    })
}
</script>

<style lang="scss"></style>
