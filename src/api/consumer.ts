import request from '@/utils/request'

// 用户列表
export function getUserList(params: any) {
    return request.get({ url: '/user.user/lists', params }, { ignoreCancelToken: true })
}

// 用户详情
export function getUserDetail(params: any) {
    return request.get({ url: '/user.user/detail', params })
}

// 用户编辑
export function userEdit(params: any) {
    return request.post({ url: '/user.user/edit', params })
}

// 用户编辑
export function adjustMoney(params: any) {
    return request.post({ url: '/user.user/adjustMoney', params })
}
/**
 * 工单列表 adminapi/user.user/order_lists?page_no=1&page_size=15&user_id=1
 * 设备列表 adminapi/user.user/machine_lists?page_no=1&page_size=15&user_id=1
 */
export function orderLists(params: any) {
    return request.get({
		url: params.type == 1 ? '/user.user/order_lists' : '/user.user/machine_lists', 
		params 
	})
}
/**
 * 取消设备关联  adminapi/user.user/machine_cancel
 */
export function machineCancel(params: any) {
    return request.post({ url: '/user.user/machine_cancel', params })
}
/**
 * 绑定设备 adminapi/user.user/machine_bind
 */
export function machineBind(params: any) {
    return request.post({ url: '/user.user/machine_bind', params })
}
