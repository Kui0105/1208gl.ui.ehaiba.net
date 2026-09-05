<template>
    <div class="ep-other-file">

        <!-- 图片区 -->
        <div
            v-if="imageList.length"
            class="ep-other-file-image"
        >
            <div
                v-for="(img, index) in imageList"
                :key="index"
                class="image"
            >
                <el-image
                    :src="img.tempFilePath"
                    fit="cover"
                    :preview-src-list="imagePreviewList"
                    :initial-index="index"
                    preview-teleported
                />
            </div>
        </div>

        <!-- 文件区 -->
        <div
            v-if="fileList.length"
            class="ep-other-file-list"
        >
            <div
                v-for="(file, index) in fileList"
                :key="index"
                class="item"
				@click="handleClick(file)"
            >
                <img
                    :src="getFileIcon(file.name)"
                    class="icon"
                />
                <div class="name">
                    {{ file.name }}
                </div>
            </div>
        </div>

    </div>
</template>



<script setup lang="ts">
	import { computed, defineProps, ref, watch , onMounted } from 'vue'
	/** 单个上传项 */
	interface Item {
		tempFilePath : string
		name : string
		fileType : 'image' | 'file' | 'video'
		ext ?: string
	}
	/** 定义所有可能输入类型 */
	type ModelValue = | string  | string[] | Item[] | null | undefined
	const props = defineProps({
		value:{
			type: String,
			default: ''
		}
	})
	/** 内部数据 */
	const files = ref<Item[]>([])
	/** 监听 v-model */
	watch(() => props.value,(val) => {
		files.value = normalizeModelValue(val)
	},{ deep: true })
	const handleClick = (flie) => {
		// 新窗口打开文件
		window.open(flie.tempFilePath)
	}
	const icons = import.meta.glob(
	    '/src/assets/img/*',
	    {
	        eager: true,
	        import: 'default'
	    }
	) as Record<string, string>
	
	const fileIconMap: Record<string, string> = {
	    pdf: icons['/src/assets/img/pdf.png'],
	    xls: icons['/src/assets/img/xls.png'],
	    xlsx: icons['/src/assets/img/xls.png'],
	    doc: icons['/src/assets/img/word.png'],
	    docx: icons['/src/assets/img/word.png']
	}
	
	const getFileIcon = (name: string) => {
	    const ext = name.split('.').pop()?.toLowerCase() || ''
	    return fileIconMap[ext] || icons['/src/assets/img/file.png']
	}
	const imagePreviewList = computed(() =>
	    imageList.value.map(item => item.tempFilePath)
	)
	/** 判断是否图片的小工具 */
	const isImage = (url: string) => {
	    const ext = url.split('.').pop()?.toLowerCase()
	    return ['jpg', 'jpeg', 'png', 'webp'].includes(ext || '')
	}
	/**判断是否是视频*/
	const isVideo = (url:string) => {
		const ext = url.split('.').pop()?.toLowerCase()
	    return ['mp4', 'mov', 'avi', 'rmvb', 'flv'].includes(ext || '')
	}
	/** 图片列表 */
	const imageList = computed(() =>
		files.value.filter(item => item.fileType === 'image')
	)
	
	/** 文件列表 */
	const fileList = computed(() =>
		files.value.filter(item => item.fileType === 'file' || item.fileType === 'video')
	)
	/** 写一个 normalize 函数（这是灵魂） */
	const normalizeModelValue = (val: ModelValue): Item[] => {
	    if (!val) return []
	    // 1. 逗号分割字符串
	    if (typeof val === 'string') {
			// 尝试解析 JSON，如果失败再按逗号分割
			try {
				const arr = JSON.parse(val)
				if (Array.isArray(arr)) {
					return arr.map(normalizeItem)
				}
			} catch {
				return val.split(',').map(s => s.trim()).filter(Boolean).map(normalizeItem)
			}
	    }
	
	    // 2. 字符串数组
	    if (Array.isArray(val) && typeof val[0] === 'string') {
	        return val.map(url => ({
	            tempFilePath:url,
	            name: url.split('/').pop() || '',
	            fileType: isImage(url) ? 'image' : 'file'
	        }))
	    }
	
	    // 3. Item 数组（标准）
	    if (Array.isArray(val)) {
	        return val as Item[]
	    }
	
	    return []
	}
	// 小工具函数
	const normalizeItem = (url: string): Item => ({
	    tempFilePath:url,
	    name: url.split('/').pop() || '',
	    fileType: isImage(url) ? 'image' : 'file'
	})
	onMounted(()=>{
		if(props.value){
			files.value = normalizeModelValue(props.value)
		}
	})
</script>

<style lang="scss" scoped>
	.ep-other-file {
	    display: flex;
	    flex-direction: column;
	    gap: 16px;
	
	    /* 图片区 */
	    &-image {
	        display: flex;
	        flex-wrap: wrap;
	        gap: 12px;
	
	        .image {
	            width: 120px;
	            height: 120px;
	            background: #f7f7f7;
	            border-radius: 8px;
	            overflow: hidden;
	
	            .el-image {
	                width: 100%;
	                height: 100%;
	            }
	        }
	    }
	
	    /* 文件区 */
	    &-list {
	        display: flex;
	        flex-direction: column;
	        gap: 12px;
	
	        .item {
	            display: flex;
	            align-items: center;
	            padding: 10px 12px;
	            background: #f7f7f7;
	            border-radius: 8px;
				cursor: pointer;
	            .icon {
	                width: 28px;
	                margin-right: 12px;
	                flex-shrink: 0;
	            }
	
	            .name {
	                flex: 1;
	                font-size: 14px;
	                color: #303133;
	                overflow: hidden;
	                white-space: nowrap;
	                text-overflow: ellipsis;
	            }
	        }
	    }
	}


</style>