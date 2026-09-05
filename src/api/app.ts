import request from '@/utils/request'

// 配置
export function getConfig() {
    return request.get({ url: '/config/getConfig' })
}

// 工作台主页
export function getWorkbench() {
    return request.get({ url: '/workbench/index' })
}

//字典数据
export function getDictData(params: any) {
    return request.get({ url: '/config/dict', params })
}
/**
 * 消息通知列表 adminapi/notice.notice/record?type=1
 */
export function getNoticeList(params: any) {
    return request.get({ url: '/notice.notice/record', params })
}

export function getNoticeCount(params: any) {
    return request.get({ url: '/notice.notice/count_record', params })
}

/**
 * 标记已读 adminapi/notice.notice/read_record
 */
export function readNotice(params: any) {	
    return request.post({ url: '/notice.notice/read_record', params })
}
/**
 * 删除 adminapi/notice.notice/del_record
 */
export function delNotice(params: any) {	
    return request.post({ url: '/notice.notice/del_record', params })
}

/**
 * 广告列表 adminapi/article.banner/lists?title=标题&status=1
 */
export function getBannerList(params: any) {
    return request.get({ url: '/article.banner/lists', params })
}
/**
 * 广告添加 adminapi/article.banner/add
 */
export function addBanner(params: any) {
    return request.post({ url: '/article.banner/add', params })
}
/**
 * adminapi/article.banner/edit 广告编辑
 */
export function editBanner(params: any) {
    return request.post({ url: '/article.banner/edit', params })
}
/**
 * 广告删除 adminapi/article.banner/delete
 */
export function delBanner(params: any) {
    return request.post({ url: '/article.banner/delete', params })
}
/**
 * 统计图表数据 adminapi/workbench/workOrderCount?type=3
 */
export function getRechargeChart(params: any) {
    return request.get({ url: '/workbench/workOrderCount', params })
}

/**
 * 工作台数据选择接口 adminapi/workbench/data_select
 */
export function getWorkbenchDataSelect() {
    return request.get({ url: '/workbench/data_select' })
}

/**
 * 工作台数据概览接口 adminapi/workbench/data_overview
 */
export function getWorkbenchDataOverview() {
    return request.get({ url: '/workbench/data_overview' })
}

/**
 * 工作台数据趋势接口 adminapi/workbench/data_trend
 */
export function getWorkbenchDataTrend() {
    return request.get({ url: '/workbench/data_trend' })
}

/**
 * 工作台工程师列表接口 adminapi/workbench/engineer_lists
 */
export function getEngineerLists(params: any) {
    return request.get({ url: '/workbench/engineer_lists', params })
}

/**
 * 工作台工程师详情 adminapi/workbench/engineer_detail
 */
export function getWorkbenchEngineerDetail(params: any) {
    return request.get({ url: '/workbench/engineer_detail', params })
}

/**
 * 工作台数据索引接口 adminapi/workbench/data_index
 */
export function getWorkbenchDataIndex(params: any) {
    return request.get({ url: '/workbench/data_index', params })
}

/**
 * 工作台响应时间趋势接口 adminapi/workbench/data_response_time
 */// 获取工作台响应时间趋势
export function getWorkbenchResponseTime(params: any) {
    return request.get({ url: '/workbench/data_response_time', params })
}

// 获取财务列表
export function getFinanceList(params: any) {
    return request.get({ url: '/workbench/finance', params })
}
