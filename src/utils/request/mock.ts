import type { AxiosAdapter, AxiosResponse, InternalAxiosRequestConfig } from 'axios'

/**
 * 前端 Mock 适配器
 * 在无后端环境下拦截所有 adminapi 请求，返回符合后端信封格式 { code, data, msg, show } 的模拟数据。
 * 仅用于 v0 / 沙盒预览，不影响真实接口逻辑。
 */

const SUCCESS = 1

function envelope(data: any, msg = 'success') {
    return { code: SUCCESS, data, msg, show: 0 }
}

/* ---------------------- 基础：登录 / 用户 / 配置 ---------------------- */

const USER_INFO = {
    id: 1,
    account: 'admin',
    name: '超级管理员',
    avatar: '',
    dept_name: '技术运维中心',
    role_name: '超级管理员',
    // '*' 通配：显示所有权限按钮
    auths: ['*']
}

const CONFIG = {
    web_name: '设备运维管理系统',
    web_favicon: '',
    web_logo: '',
    login_image: '',
    copyright_config: [],
    web_version: 'v0.0.1'
}

/* ---------------------- 动态菜单（驱动路由） ---------------------- */

const MENU = [
    {
        id: 1,
        pid: 0,
        type: 'M',
        name: '工作台',
        icon: 'el-icon-Monitor',
        paths: 'workbench',
        component: '',
        is_show: 1,
        children: [
            {
                id: 11,
                pid: 1,
                type: 'C',
                paths: 'workbench',
                name: '工作台',
                icon: 'el-icon-Monitor',
                component: 'workbench/data',
                is_show: 1,
                is_cache: 1
            }
        ]
    },
    {
        id: 2,
        pid: 0,
        type: 'M',
        name: '设备管理',
        icon: 'el-icon-Cpu',
        paths: 'device',
        component: '',
        is_show: 1,
        children: [
            {
                id: 21,
                pid: 2,
                type: 'C',
                paths: 'device/devicelist',
                name: '设备列表',
                icon: 'el-icon-List',
                component: 'device/devicelist',
                is_show: 1,
                is_cache: 1
            }
        ]
    },
    {
        id: 3,
        pid: 0,
        type: 'M',
        name: '工单管理',
        icon: 'el-icon-Tickets',
        paths: 'order',
        component: '',
        is_show: 1,
        children: [
            {
                id: 31,
                pid: 3,
                type: 'C',
                paths: 'order/list',
                name: '工单列表',
                icon: 'el-icon-Document',
                component: 'order/list',
                is_show: 1,
                is_cache: 1
            }
        ]
    }
]

/* ---------------------- 工作台（data.vue）数据 ---------------------- */

const DEPT_ALL = [
    {
        id: 1,
        name: '技术运维中心',
        children: [
            { id: 11, name: '华东运维部' },
            { id: 12, name: '华南运维部' },
            { id: 13, name: '华北运维部' },
            { id: 14, name: '西南运维部' }
        ]
    }
]

const ENGINEER_NAMES = [
    '赵建国', '钱学明', '孙志强', '李文博', '周晓峰', '吴海涛', '郑一鸣', '王振华',
    '冯立群', '陈国栋', '褚天成', '卫东来', '蒋维汉', '沈志远', '韩天佑', '杨帆',
    '朱明辉', '秦少康', '许志安', '何家伟', '吕文杰', '施耐德', '张伟', '孔繁森',
    '曹德旺', '严凯', '华承志', '金正昆'
]

const ENGINEER_TYPES = [
    { value: 1, label: '机械工程师' },
    { value: 2, label: '电气工程师' },
    { value: 3, label: '软件工程师' },
    { value: 4, label: '综合运维师' }
]

function buildEngineers() {
    const cities = [
        { name: '上海', lat: 31.2304, lng: 121.4737 },
        { name: '杭州', lat: 30.2741, lng: 120.1551 },
        { name: '南京', lat: 32.0603, lng: 118.7969 },
        { name: '苏州', lat: 31.2989, lng: 120.5853 },
        { name: '广州', lat: 23.1291, lng: 113.2644 },
        { name: '深圳', lat: 22.5431, lng: 114.0579 },
        { name: '北京', lat: 39.9042, lng: 116.4074 },
        { name: '成都', lat: 30.5728, lng: 104.0668 }
    ]
    return ENGINEER_NAMES.map((name, i) => {
        const c = cities[i % cities.length]
        const status = i % 3 === 0 ? 2 : 1 // 2 忙碌，1 空闲
        const type = ENGINEER_TYPES[i % ENGINEER_TYPES.length]
        return {
            id: i + 1,
            name,
            mobile: `139${String(30000000 + i * 317).slice(0, 8)}`,
            status,
            status_text: status === 1 ? '空闲' : '忙碌',
            type: type.value,
            type_str: type.label,
            level: (i % 3) + 1,
            level_str: ['初级', '中级', '高级'][i % 3],
            latitude: (c.lat + (i % 5) * 0.01).toFixed(6),
            longitude: (c.lng + (i % 5) * 0.01).toFixed(6),
            city: c.name
        }
    })
}

const ENGINEERS = buildEngineers()

const TYPE_ALL = [
    { value: 1, label: '维修工单' },
    { value: 2, label: '保养工单' },
    { value: 3, label: '巡检工单' },
    { value: 4, label: '安装工单' },
    { value: 5, label: '换件工单' }
]

function buildDataSelect() {
    return {
        dept_all: DEPT_ALL,
        engineer_all: ENGINEERS.map((e) => ({ label: e.name, value: e.id, phone: e.mobile })),
        type_all: TYPE_ALL,
        engineer_position_all: ENGINEERS.map((e) => ({
            id: e.id,
            name: e.name,
            mobile: e.mobile,
            status: e.status,
            latitude: e.latitude,
            longitude: e.longitude
        })),
        tx_map_key: ''
    }
}

const ALL_REGION = [
    {
        value: 310000,
        label: '上海市',
        children: [
            {
                value: 310100,
                label: '市辖区',
                children: [
                    { value: 310101, label: '黄浦区' },
                    { value: 310104, label: '徐汇区' },
                    { value: 310115, label: '浦东新区' }
                ]
            }
        ]
    },
    {
        value: 330000,
        label: '浙江省',
        children: [
            {
                value: 330100,
                label: '杭州市',
                children: [
                    { value: 330102, label: '上城区' },
                    { value: 330106, label: '西湖区' },
                    { value: 330110, label: '余杭区' }
                ]
            }
        ]
    },
    {
        value: 320000,
        label: '江苏省',
        children: [
            {
                value: 320100,
                label: '南京市',
                children: [
                    { value: 320102, label: '玄武区' },
                    { value: 320104, label: '秦淮区' }
                ]
            },
            {
                value: 320500,
                label: '苏州市',
                children: [
                    { value: 320505, label: '虎丘区' },
                    { value: 320507, label: '相城区' }
                ]
            }
        ]
    },
    {
        value: 440000,
        label: '广东省',
        children: [
            {
                value: 440100,
                label: '广州市',
                children: [
                    { value: 440103, label: '荔湾区' },
                    { value: 440106, label: '天河区' }
                ]
            },
            {
                value: 440300,
                label: '深圳市',
                children: [
                    { value: 440304, label: '福田区' },
                    { value: 440305, label: '南山区' }
                ]
            }
        ]
    }
]

function buildDataIndex(data: Record<string, any>) {
    const hasFilter = Boolean(
        data.engineer_id || data.type || data.dept_id || data.province_id || (data.create_time && data.create_time.length)
    )
    const total = hasFilter ? 128 : 356
    const fixed = hasFilter ? 104 : 301
    return {
        accept_time: hasFilter ? 6 : 8,
        dispatch_time: hasFilter ? 14 : 17,
        arrive_time: hasFilter ? 46 : 52,
        complete_time: hasFilter ? 118 : 135,
        one_finish_repair_order_rate: ((fixed / total) * 100).toFixed(1),
        one_finish_repair_order_num: fixed,
        finish_repair_order_num: total
    }
}

function buildResponseTime() {
    const dates: string[] = []
    const accept_times: number[] = []
    const dispatch_times: number[] = []
    const arrive_times: number[] = []
    const complete_times: number[] = []
    const base = new Date()
    for (let i = 6; i >= 0; i--) {
        const d = new Date(base)
        d.setDate(base.getDate() - i)
        dates.push(`${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`)
        accept_times.push(4 + Math.floor(Math.random() * 8))
        dispatch_times.push(10 + Math.floor(Math.random() * 12))
        arrive_times.push(40 + Math.floor(Math.random() * 25))
        complete_times.push(110 + Math.floor(Math.random() * 50))
    }
    return { dates, accept_times, dispatch_times, arrive_times, complete_times }
}

function buildEngineerDetail(data: Record<string, any>) {
    const id = Number(data.engineer_id || 1)
    const engineer = ENGINEERS.find((e) => e.id === id) || ENGINEERS[0]
    const projectCount = 2 + (id % 4)
    const projects = Array.from({ length: projectCount }, (_, i) => ({
        machine_code: `SB${String(100000 + id * 7 + i)}`,
        machine_model: `注塑机 ${String.fromCharCode(65 + (i % 6))}-${String(id).padStart(2, '0')}`,
        service_address: `${engineer.city}市工业园区 ${id * 3 + i} 号`,
        entry_time: `2024-12-0${(i % 8) + 1} 0${(i % 9) + 1}:30`
    }))
    return {
        engineer: {
            name: engineer.name,
            mobile: engineer.mobile,
            type_str: engineer.type_str,
            level_str: engineer.level_str,
            status: engineer.status,
            status_text: engineer.status_text
        },
        projects
    }
}

function buildEngineerLists(data: Record<string, any>) {
    const page = Number(data.page_no || 1)
    const size = Number(data.page_size || 13)
    const start = (page - 1) * size
    const lists = ENGINEERS.slice(start, start + size).map((e) => ({
        id: e.id,
        name: e.name,
        mobile: e.mobile,
        status: e.status
    }))
    return { count: ENGINEERS.length, page_no: page, page_size: size, lists }
}

/* ---------------------- 设备 / 工单列表 ---------------------- */

function buildDeviceList(data: Record<string, any>) {
    const page = Number(data.page_no || 1)
    const size = Number(data.page_size || 15)
    const total = 38
    const start = (page - 1) * size
    const lists = Array.from({ length: Math.max(0, Math.min(size, total - start)) }, (_, i) => {
        const idx = start + i
        return {
            id: idx + 1,
            machine_code: `SB${String(100001 + idx)}`,
            machine_model: `注塑机 ${String.fromCharCode(65 + (idx % 6))}-${String(idx + 1).padStart(3, '0')}`,
            dept_name: DEPT_ALL[0].children[idx % 4].name,
            engineer_name: ENGINEER_NAMES[idx % ENGINEER_NAMES.length],
            status: idx % 4 === 0 ? 2 : 1,
            status_text: idx % 4 === 0 ? '维修中' : '运行中',
            create_time: `2024-1${(idx % 2) + 1}-${String((idx % 27) + 1).padStart(2, '0')} 09:20`
        }
    })
    return { count: total, page_no: page, page_size: size, lists }
}

function buildOrderList(data: Record<string, any>) {
    const page = Number(data.page_no || 1)
    const size = Number(data.page_size || 15)
    const total = 42
    const start = (page - 1) * size
    const statuses = ['待派单', '待接单', '处理中', '待审核', '已完成']
    const lists = Array.from({ length: Math.max(0, Math.min(size, total - start)) }, (_, i) => {
        const idx = start + i
        return {
            id: idx + 1,
            order_sn: `GD${20241200 + idx}`,
            machine_code: `SB${String(100001 + (idx % 38))}`,
            type_str: TYPE_ALL[idx % TYPE_ALL.length].label,
            engineer_name: ENGINEER_NAMES[idx % ENGINEER_NAMES.length],
            status: (idx % 5) + 1,
            status_text: statuses[idx % 5],
            create_time: `2024-12-${String((idx % 27) + 1).padStart(2, '0')} 10:15`
        }
    })
    return { count: total, page_no: page, page_size: size, lists }
}

/* ---------------------- 路由分发 ---------------------- */

function resolve(url: string, data: Record<string, any>) {
    // 去掉 adminapi 前缀，仅保留业务路径
    const path = url.replace(/^\/?adminapi/, '').replace(/\?.*$/, '')

    switch (path) {
        // 登录
        case '/login/account':
            return envelope({ token: 'mock-token-' + Date.now() })
        case '/login/logout':
            return envelope({})

        // 用户信息（同时返回 user / permissions / menu，驱动动态路由）
        case '/auth.admin/mySelf':
            return envelope({ user: USER_INFO, permissions: ['*'], menu: MENU })
        case '/auth.admin/editSelf':
            return envelope({})

        // 全局配置
        case '/config/getConfig':
            return envelope(CONFIG)
        case '/config/dict':
            return envelope({})

        // 通知：数量 / 列表
        case '/notice.notice/count_record':
            return envelope({ notice: 0, order: 0, all: 0 })
        case '/notice.notice/record':
            return envelope({ count: 0, page_no: 1, page_size: 10, lists: [] })

        // 工作台 data.vue
        case '/workbench/index':
            return envelope(buildDataIndex(data))
        case '/workbench/data_select':
            return envelope(buildDataSelect())
        case '/workbench/data_index':
            return envelope(buildDataIndex(data))
        case '/workbench/data_overview':
            return envelope(buildDataIndex(data))
        case '/workbench/data_trend':
            return envelope(buildResponseTime())
        case '/workbench/data_response_time':
            return envelope(buildResponseTime())
        case '/workbench/workOrderCount':
            return envelope({ wait: 12, doing: 23, done: 301, all: 356 })
        case '/workbench/engineer_lists':
            return envelope(buildEngineerLists(data))
        case '/workbench/engineer_detail':
            return envelope(buildEngineerDetail(data))
        case '/config/all_region':
            return envelope(ALL_REGION)

        // 列表
        case '/device.device/lists':
        case '/device/lists':
            return envelope(buildDeviceList(data))
        case '/order.order/lists':
        case '/order/lists':
            return envelope(buildOrderList(data))

        default:
            // 兜底：分页型返回空列表，其余返回空对象
            if (/lists?$/.test(path) || data.page_no) {
                return envelope({ count: 0, page_no: Number(data.page_no || 1), page_size: Number(data.page_size || 15), lists: [] })
            }
            return envelope({})
    }
}

const mockAdapter: AxiosAdapter = (config: InternalAxiosRequestConfig) => {
    return new Promise<AxiosResponse>((resolvePromise) => {
        const url = config.url || ''
        let data: Record<string, any> = {}
        try {
            if (config.data) data = typeof config.data === 'string' ? JSON.parse(config.data) : config.data
        } catch {
            data = {}
        }
        if (config.params) data = { ...data, ...config.params }

        const payload = resolve(url, data)

        // 模拟网络延迟
        setTimeout(() => {
            resolvePromise({
                data: payload,
                status: 200,
                statusText: 'OK',
                headers: {},
                config
            } as AxiosResponse)
        }, 180)
    })
}

export default mockAdapter
