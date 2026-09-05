import { isObject } from '@vue/shared'
import { cloneDeep } from 'lodash'

/**
 * @description 添加单位
 * @param {String | Number} value 值 100
 * @param {String} unit 单位 px em rem
 */
export const addUnit = (value: string | number, unit = 'px') => {
    return !Object.is(Number(value), NaN) ? `${value}${unit}` : value
}

/**
 * @description 添加单位
 * @param {unknown} value
 * @return {Boolean}
 */
export const isEmpty = (value: unknown) => {
    return value == null && typeof value == 'undefined'
}

/**
 * @description 树转数组，队列实现广度优先遍历
 * @param {Array} data  数据
 * @param {Object} props `{ children: 'children' }`
 */

export const treeToArray = (data: any[], props = { children: 'children' }) => {
    data = cloneDeep(data)
    const { children } = props
    const newData = []
    const queue: any[] = []
    data.forEach((child: any) => queue.push(child))
    while (queue.length) {
        const item: any = queue.shift()
        if (item[children]) {
            item[children].forEach((child: any) => queue.push(child))
            delete item[children]
        }
        newData.push(item)
    }
    return newData
}

/**
 * @description 数组转
 * @param {Array} data  数据
 * @param {Object} props `{ parent: 'pid', children: 'children' }`
 */

export const arrayToTree = (
    data: any[],
    props = { id: 'id', parentId: 'pid', children: 'children' }
) => {
    data = cloneDeep(data)
    const { id, parentId, children } = props
    const result: any[] = []
    const map = new Map()
    data.forEach((item) => {
        map.set(item[id], item)
        const parent = map.get(item[parentId])
        if (parent) {
            parent[children] = parent[children] ?? []
            parent[children].push(item)
        } else {
            result.push(item)
        }
    })
    return result
}

/**
 * @description 获取正确的路经
 * @param {String} path  数据
 */
export function getNormalPath(path: string) {
    if (path.length === 0 || !path || path == 'undefined') {
        return path
    }
    const newPath = path.replace('//', '/')
    const length = newPath.length
    if (newPath[length - 1] === '/') {
        return newPath.slice(0, length - 1)
    }
    return newPath
}

/**
 * @description对象格式化为Query语法
 * @param { Object } params
 * @return {string} Query语法
 */
export function objectToQuery(params: Record<string, any>): string {
    let query = ''
    for (const props of Object.keys(params)) {
        const value = params[props]
        const part = encodeURIComponent(props) + '='
        if (!isEmpty(value)) {
            if (isObject(value)) {
                for (const key of Object.keys(value)) {
                    if (!isEmpty(value[key])) {
                        const params = props + '[' + key + ']'
                        const subPart = encodeURIComponent(params) + '='
                        query += subPart + encodeURIComponent(value[key]) + '&'
                    }
                }
            } else {
                query += part + encodeURIComponent(value) + '&'
            }
        }
    }
    return query.slice(0, -1)
}

/**
 * @description 时间格式化
 * @param dateTime { number } 时间戳
 * @param fmt { string } 时间格式
 * @return { string }
 */
// yyyy:mm:dd|yyyy:mm|yyyy年mm月dd日|yyyy年mm月dd日 hh时MM分等,可自定义组合
export const timeFormat = (dateTime: number, fmt = 'yyyy-mm-dd') => {
    // 如果为null,则格式化当前时间
    if (!dateTime) {
        dateTime = Number(new Date())
    }
    // 如果dateTime长度为10或者13，则为秒和毫秒的时间戳，如果超过13位，则为其他的时间格式
    if (dateTime.toString().length == 10) {
        dateTime *= 1000
    }
    const date = new Date(dateTime)
    let ret
    const opt: any = {
        'y+': date.getFullYear().toString(), // 年
        'm+': (date.getMonth() + 1).toString(), // 月
        'd+': date.getDate().toString(), // 日
        'h+': date.getHours().toString(), // 时
        'M+': date.getMinutes().toString(), // 分
        's+': date.getSeconds().toString() // 秒
    }
    for (const k in opt) {
        ret = new RegExp('(' + k + ')').exec(fmt)
        if (ret) {
            fmt = fmt.replace(
                ret[1],
                ret[1].length == 1 ? opt[k] : opt[k].padStart(ret[1].length, '0')
            )
        }
    }
    return fmt
}

/**
 * @description 获取不重复的id
 * @param length { Number } id的长度
 * @return { String } id
 */
export const getNonDuplicateID = (length = 8) => {
    let idStr = Date.now().toString(36)
    idStr += Math.random().toString(36).substring(3, length)
    return idStr
}

/**
 * 计算颜色透明度减淡
 */
export const calcColor = (color: string, opacity: number): string => {
    // 规范化透明度值在 0 ~ 1 之间
    opacity = Math.min(1, Math.max(0, opacity))

    // 检查颜色是否是 hex 格式
    const isHex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/
    const isRgb = /^rgb\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*\)$/
    const isRgba = /^rgba\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*,\s*[0-9.]+\s*\)$/

    let r: number = 0,
        g: number = 0,
        b: number = 0

    if (isHex.test(color)) {
        // 如果是 hex 格式 (#ffffff 或 #fff)
        const hex = color.slice(1)

        // 如果是3位短格式，扩展为6位
        const fullHex =
            hex.length === 3
                ? hex
                      .split('')
                      .map((h) => h + h)
                      .join('')
                : hex

        // 转换为 RGB
        r = parseInt(fullHex.substring(0, 2), 16)
        g = parseInt(fullHex.substring(2, 4), 16)
        b = parseInt(fullHex.substring(4, 6), 16)
    } else if (isRgb.test(color)) {
        // 如果是 rgb 格式 (rgb(255, 255, 255))
        const rgbValues = color.match(/\d+/g)
        if (rgbValues) {
            r = parseInt(rgbValues[0])
            g = parseInt(rgbValues[1])
            b = parseInt(rgbValues[2])
        }
    } else if (isRgba.test(color)) {
        // 如果是 rgba 格式 (rgba(255, 255, 255, 1))
        const rgbaValues = color.match(/\d+(\.\d+)?/g)
        if (rgbaValues) {
            r = parseInt(rgbaValues[0])
            g = parseInt(rgbaValues[1])
            b = parseInt(rgbaValues[2])
        }
    } else {
        throw new Error('Unsupported color format')
    }

    // 返回转换后的 rgba 颜色值
    return `rgba(${r}, ${g}, ${b}, ${opacity})`
}


export interface StepContext {
	orderInfo : any
	form : any
}
export interface StepField {
	label : string | ((ctx : StepContext) => string)
	value : (ctx : StepContext) => any
	show ?: (ctx : StepContext) => boolean
	isImage ?: boolean
}

const statsNmaMap : Record<number, string> = {
	1: '差',
	2: '一般',
	3: '好',
	4: '很好',
}
const getStatusName = (status : number) => statsNmaMap[status] || ''
const hasCommentSurveyItems = (ctx: StepContext) => {
	return Array.isArray(ctx.form.extra_data?.items) && ctx.form.extra_data.items.length > 0
}
const getCommentSurveyValue = (ctx: StepContext) => {
	const items = ctx.form.extra_data?.items || []
	return items.map((item: any, index: number) => {
		const other = item.other ? `（${item.other}）` : ''
		return `${index + 1}、${item.title}：${item.value_text}${other}`
	})
}
const getMileagePhotoValue = (extraData: any) => {
	for (const key of [
		'end_mileage_photos',
		'end_mileage_photo',
		'end_m_photos',
		'end_m_photo',
		'end_photos',
		'mileage_photos'
	]) {
		if (extraData?.[key]) {
			return extraData[key]
		}
	}
	return ''
}
/**
 * step → 字段配置映射
 */
export const stepFieldMap : Record<number, StepField[]> = {
	2: [
		{
			label: '接单时间',
			value: (ctx) => ctx.form.create_time
		}
	],
	3: [
		{
			label: '是否用车',
			value: (ctx) =>
				ctx.form.extra_data.use_car == 1 ? '是' : '否'
		},
		{
			label: '里程数',
			show: (ctx) => ctx.form.extra_data.use_car == 1,
			value: (ctx) => ctx.form.extra_data.start_m
		},
		{
			label: '车辆外观',
			show: (ctx) => ctx.form.extra_data.use_car == 1,
			value: (ctx) => ctx.form.extra_data.car_photos,
			isImage: true
		},
		{
			label: '里程图片',
			show: (ctx) => ctx.form.extra_data.use_car == 1,
			value: (ctx) => ctx.form.extra_data.mileage_photos,
			isImage: true
		},
		{
			label: '出发时间',
			value: (ctx) => ctx.form.create_time
		}
	],
	4: [
		{
			label: '到达时间',
			value: (ctx) => ctx.form.create_time
		}
	],
	5: [
		{
			label: '完成时间',
			value: (ctx) => ctx.form.create_time
		},
		{
			label: (ctx) => ctx.orderInfo.type == 1 ? '维修状态' : ctx.orderInfo.type == 11 ? '交验状态' : '技改状态',
			show: (ctx) => [1, 4, 11].includes(Number(ctx.orderInfo.type)) && (ctx.orderInfo.type == 11 || ctx.orderInfo.repair_type == 1),
			value: (ctx) => ctx.form.extra_data.type == 1 ? '完成' : '未完成'
		},
		{
			label: (ctx) => '故障类型',
			show: (ctx) => ctx.orderInfo.type == 1,
			value: (ctx) => ctx.form.extra_data.repair_name
		},
		{
			label: (ctx) => '故障现象',
			show: (ctx) => ctx.orderInfo.type == 1,
			value: (ctx) => ctx.form.extra_data.repair_phenomenon || ctx.form.extra_data.repair_intro
		},
		{
			label: (ctx) => '故障原因分析',
			show: (ctx) => ctx.orderInfo.type == 1,
			value: (ctx) => ctx.form.extra_data.repair_reason_analysis
		},
		{
			label: (ctx) => '故障处理方式',
			show: (ctx) => ctx.orderInfo.type == 1,
			value: (ctx) => ctx.form.extra_data.repair_process
		}
	],
	6: [
		{
			label: '结束时间',
			value: (ctx) => ctx.form.create_time
		},{
			label: '里程数',
			show: (ctx) => ctx.form.extra_data.end_m,
			value: (ctx) => ctx.form.extra_data.end_m
		},
		{
			label: '里程图片',
			show: (ctx) => ctx.form.extra_data.use_car == 1,
			value: (ctx) => getMileagePhotoValue(ctx.form.extra_data),
			isImage: true
		}
	],
	7: [{
		label:'派单人员',
		value: (ctx) => ctx.form.extra_data.send_name
	},{
		label:'派单时间',
		value: (ctx) => ctx.form.create_time
	},{
		label:'技术交底',
		value: (ctx) => ctx.form.extra_data.reason
	}],
	8 :[{
		label: '进场时间',
		value: (ctx) => ctx.form.create_time
	}],
	9:[{
		label: '退场时间',
		value: (ctx) => ctx.form.create_time
	}],
	10:[{
		label: '审核时间',
		value: (ctx) => ctx.form.create_time
	},{
		label:'审核结果',
		value: (ctx) => ctx.form.extra_data.audit_status == 2 ? '审核通过' : ctx.form.extra_data.audit_status == 3 ? '审核未通过' : '待审核'
	},{
		label:'审核备注',
		// show: (ctx) => ctx.form.extra_data.audit_status == 3,
		value: (ctx) => ctx.form.extra_data.audit_msg
	},{
		label:'核实里程',
		show: (ctx) => ctx.form.extra_data.audit_m !== undefined && ctx.form.extra_data.audit_m !== null && ctx.form.extra_data.audit_m !== '',
		value: (ctx) => ctx.form.extra_data.audit_m
	},{
		label:'核实工时',
		show: (ctx) => ctx.form.extra_data.audit_hour != 0,
		value: (ctx) => ctx.form.extra_data.audit_hour
	},{
		label:'核实方量明细',
		show: (ctx) => Array.isArray(ctx.form.extra_data?.audit_num_list) && ctx.form.extra_data.audit_num_list.length > 0,
		value: (ctx) => ctx.form.extra_data.audit_num_list.map((item: any) => `${item.name || item.key}：${item.value}`)
	},{
		label:'核实方量',
		show: (ctx) => ctx.form.extra_data.audit_num != 0 || (Array.isArray(ctx.form.extra_data?.audit_num_list) && ctx.form.extra_data.audit_num_list.length > 0),
		value: (ctx) => ctx.form.extra_data.audit_num
	}],
	11:[{
		label: '复审时间',
		value: (ctx) => ctx.form.create_time
	},{
		label:'复审结果',
		value: (ctx) => ctx.form.extra_data.audit_status == 2 ? '审核通过' : ctx.form.extra_data.audit_status == 3 ? '审核未通过' : '待审核'
	},{
		label:'复审备注',
		// show: (ctx) => ctx.form.extra_data.audit_status == 3,
		value: (ctx) => ctx.form.extra_data.audit_msg
	}],
	12: [
		{
			label: '调查内容',
			show: hasCommentSurveyItems,
			value: getCommentSurveyValue
		},
		{
			label: '维修状态',
			show: (ctx) => !hasCommentSurveyItems(ctx) && ctx.form.extra_data.status !== 0,
			value: (ctx) => ctx.form.extra_data.status == 2 ? '未完成' : '已完成'
		},
		{
			label: '整机发货清单',
			show: (ctx) => !hasCommentSurveyItems(ctx) && ctx.form.extra_data.send_status != 0,
			value: (ctx) => ctx.form.extra_data.send_status == 2 ? '未完成' : '已完成'
		},
		{
			label: '服务态度',
			show: (ctx) => !hasCommentSurveyItems(ctx),
			value: (ctx) => getStatusName(ctx.form.extra_data.td)
		},
		{
			label: '服务技能',
			show: (ctx) => !hasCommentSurveyItems(ctx),
			value: (ctx) => getStatusName(ctx.form.extra_data.jn)
		},
		{
			label: '产品质量',
			show: (ctx) => !hasCommentSurveyItems(ctx),
			value: (ctx) => getStatusName(ctx.form.extra_data.zl)
		},
		{
			label: '评价时间',
			value: (ctx) => ctx.form.create_time
		}
	],
	13: [
		{
			label: '调查内容',
			show: hasCommentSurveyItems,
			value: getCommentSurveyValue
		},
		{
			label: '评价用户',
			value: (ctx) => {
				const user = ctx.form.comment_user_info || {}
				return [user.nickname || user.real_name, user.mobile].filter(Boolean).join(' / ') || '--'
			}
		},
		{
			label: '维修状态',
			show: (ctx) => !hasCommentSurveyItems(ctx),
			value: (ctx) => ctx.form.extra_data.status == 1 ? '已完成' : '未完成'
		}, {
			label: '服务态度',
			show: (ctx) => !hasCommentSurveyItems(ctx),
			value: (ctx) => getStatusName(ctx.form.extra_data.td)
		},
		{
			label: '服务技能',
			show: (ctx) => !hasCommentSurveyItems(ctx),
			value: (ctx) => getStatusName(ctx.form.extra_data.jn)
		},
		{
			label: '产品质量',
			show: (ctx) => !hasCommentSurveyItems(ctx),
			value: (ctx) => getStatusName(ctx.form.extra_data.zl)
		},
		{
			label: '评价时间',
			value: (ctx) => ctx.form.create_time
		}
	]
}

/**
	* 文件后缀对应 MIME 类型类别
	*/
export const mimeTypeMap : Record<string, 'image' | 'video' | 'file'> = {
	// 图片
	png: 'image',
	jpg: 'image',
	jpeg: 'image',
	gif: 'image',
	bmp: 'image',
	webp: 'image',
	heic: 'image',
	tiff: 'image',

	// 视频
	mp4: 'video',
	mov: 'video',
	avi: 'video',
	mkv: 'video',
	flv: 'video',
	wmv: 'video',
	webm: 'video',
	m4v: 'video',
	// 附件
	pdf: 'file',
	doc: 'file',
	docx: 'file',
	xls: 'file',
	xlsx: 'file',
	ppt: 'file',
	pptx: 'file',
	txt: 'file',
	zip: 'file',
	rar: 'file'
}

const FIELD_META:any = {
	product_type:{
		name: '产品类型',
		small_type: 1,
		is_require: 1,
		extra_data: [],
		sort: 10
	},//产品类型
	notice_theme:{
		name: '通知主题',
		small_type: 1,
		is_require: 1,
		extra_data: [],
		sort: 9
	},//通知主题
	theme:{
		name: '主题',
		small_type: 1,
		is_require: 1,
		extra_data: [],
		sort: 8
	},//主题
	rectification_number:{
		name: '整改机号',
		small_type: 1,
		is_require: 1,
		extra_data: [],
		sort: 8
	},//整改机号
	rectification_reason:{
		name: '整改原因',
		small_type: 2,
		is_require: 1,
		extra_data: [],
		sort: 7
	},//整改原因
	rectification_content:{
		name: '整改内容',
		small_type: 2,
		is_require: 1,
		extra_data: [],
		sort: 6
	},//整改内容
	after_sales_attachment:{
		name: '售后服务部附件阅读',
		small_type: 5,
		is_require: 1,
		extra_data: [],
		sort: 5
	},//售后服务部附件阅读
	after_sales_file:{
		name: '售后交底文件',
		small_type: 5,
		is_require: 1,
		extra_data: [],
		sort: 4
	},//售后交底文件
	completion_photos:{
		name: '售后完成照片',
		small_type: 4,
		is_require: 1,
		extra_data: [],
		sort: 3
	},//售后完成照片:可多张
	completion_description:{
		name: '售后完成说明',
		small_type: 2,
		is_require: 1,
		extra_data: [],
		sort: 2
	},//完成说明
	applicant: {
		name: '申请人',
		small_type: 1,
		is_require: 1,
		extra_data: [],
		sort: 11
	},
	applicant_mobile: {
		name: '联系电话',
		small_type: 11,
		is_require: 1,
		extra_data: [],
		sort: 10
	},
	startup_time: {
		name: '开机时间',
		small_type: 13,       // 这里你自己定：日期/时间是什么 small_type
		is_require: 1,
		extra_data: [],
		sort: 9
	},
	working_hours: {
		name: '工作时间',
		small_type: 1,
		is_require: 1,
		extra_data: [],
		sort: 8
	},
	nameplate_photos: {
		name: '铭牌照片',
		small_type: 4,
		is_require: 1,
		extra_data: [],
		sort: 7
	},
	display_photos: {
		name: '显示屏图片',
		small_type: 4,
		is_require: 1,
		extra_data: [],
		sort: 6
	},
	closeup_photos: {
		name: '故障特写图',
		small_type: 4,
		is_require: 1,
		extra_data: [],
		sort: 5
	},
	medium_photos: {
		name: '故障中景图',
		small_type: 4,
		is_require: 1,
		extra_data: [],
		sort: 4
	},
	longshot_photos: {
		name: '故障远景图',
		small_type: 4,
		is_require: 1,
		extra_data: [],
		sort: 3
	},
	other_photos: {
		name: '其他照片',
		small_type: 4,
		is_require: 0,
		extra_data: [],
		sort: 2
	},
	other_videos: {
		name: '其他视频',
		small_type: 12,
		is_require: 0,
		extra_data: [],
		sort: 1
	},
	fault_description: {
		name: '故障描述及原因分析',
		small_type: 2,
		is_require: 1,
		extra_data: [],
		sort: 0
	}
}
/** 判断是否图片的小工具 */
const isImage = (url : string) => {
	const ext = url.split('.').pop()?.toLowerCase()
	return ['jpg', 'jpeg', 'png', 'webp'].includes(ext || '')
}
/**判断是否是视频*/
const isVideo = (url : string) => {
	const ext = url.split('.').pop()?.toLowerCase()
	return ['mp4', 'mov', 'avi', 'rmvb', 'flv'].includes(ext || '')
}
const setValue = (value : any[]) => {
	if (typeof value == "string") return value
	if (Array.isArray(value)) {
		return value.map((val) => {
			if (typeof val == 'string') {
				return {
					tempFilePath: val,
					fileType: isImage(val) ? 'image' : isVideo(val) ? 'video' : 'file',
				}
			} else {
				return val
			}
		})
	}
}
export const buildTemplateFromFormKeys = ({
	formValue,
	cateId = 5,
	cateName = '基本信息',
	cateSort = 1
}:{formValue:any,cateId?:number,cateName?:string,cateSort?:number}) => {
	const keys = Object.keys(formValue || {})
	const son = keys.map((key, index) => {
		const meta = FIELD_META[key]
		if (!meta) return null // 未配置的字段直接忽略（或你也可以抛错）
		return {
			id: meta.id ?? (1000 + index), // 如果你有真实 id，就在 FIELD_META 里补；没有就临时生成
			cate_id: cateId,
			name: meta.name,
			field_key: key,                // 这就是你的映射值
			small_type: meta.small_type,
			is_require: meta.is_require,
			extra_data: meta.extra_data ?? [],
			sort: meta.sort ?? 0,
			value: setValue(formValue[key]),
			is_cate: false
		}
	}).filter(Boolean).sort((a, b) => (Number((b as any)?.sort ?? 0) - Number((a as any)?.sort ?? 0)))

	return [
		{
			id: cateId,
			name: cateName,
			sort: cateSort,
			is_cate: true,
			son
		}
	]
}
export const restoreFormData = (formList : any[]) => {
	const result : Record<string, any> = {}

	formList.forEach(cate => {
		if (!Array.isArray(cate.son)) return

		cate.son.forEach((item : any) => {
			if (!item.field_key) return
			result[item.field_key] = Array.isArray(item.value) ? item.value.join(',') : item.value
		})
	})

	return result
}
