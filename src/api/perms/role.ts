import request from '@/utils/request'

// 角色列表
export function roleLists(params: any) {
    return request.get({ url: '/auth.role/lists', params })
}
// 角色列表全部
export function roleAll(params: any) {
    return request.get({ url: '/auth.role/all', params })
}
// 添加角色
export function roleAdd(params: any) {
    return request.post({ url: '/auth.role/add', params })
}
// 编辑角色
export function roleEdit(params: any) {
    return request.post({ url: '/auth.role/edit', params })
}
// 删除角色
export function roleDelete(params: any) {
    return request.post({ url: '/auth.role/delete', params })
}

// 角色详情
export function roleDetail(params: any) {
    return request.get({ url: '/auth.role/detail', params })
}
/**
 * 工程师等级 adminapi/auth.admin/engineer_level_all
 */
export function engineerLevelAll(params: any) {
    return request.get({ url: '/auth.admin/engineer_level_all', params })
}
/**
 * 工程师类型 adminapi/auth.admin/engineer_type_all
 */
export function engineerTypeAll(params: any) {
    return request.get({ url: '/auth.admin/engineer_type_all', params })
}
/**
 * 省市区三级联动 adminapi/config/all_region
 */
export function allRegion(params: any) {
    return request.get({ url: '/config/all_region', params })
}
/**
 * 管理设备列表 adminapi/machine.machine/lists?page_no=1&page_size=3&area_engineer_id=9
 */
export function machineLists(params: any) {
    return request.get({ url: '/machine.machine/lists', params })
}
/**
 * 获取工程师信息 adminapi/auth.admin/info?engineer_id=9
 */
export function engineerInfo(params: any) {
    return request.get({ url: '/auth.admin/info', params })
}
/**
 * 备注 adminapi/auth.admin/remark
 */
export function engineerRemark(params: any) {
    return request.post({ url: '/auth.admin/remark', params })
}
