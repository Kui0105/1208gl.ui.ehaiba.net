import request from '@/utils/request'

export const smallTypeMap = {
    1 : '输入框',
	2 : '文本域',
    3 : '单图',
    4 : '多图',
    5 : '文件',
    6 : '选择式单选',
    7 : '多选',
	8 : '数字输入框',
	9 : '下拉式单选',
	10 : '图片组',
	11 : '电话号码框',
	12 : '视频选择',
	13 : '日期选择'
} as const
/**
 * 获取工单类型 adminapi/order.orderForm/base_list
 */
export function getOrderType() {
  return request.get({url:'/order.orderForm/base_list'})
}
/**
 * 获取工单步骤 adminapi/order.orderForm/base_son_list?type=1
 */
export function getOrderStep(type:number) {
  return request.get({url:'/order.orderForm/base_son_list',params:{type}})
}
/**
 * 获取步骤工单对应的列表数据 adminapi/order.orderForm/comb_list?type=1&step_type=3
 */
export function getOrderList(params?:any) {
  return request.get({url:'/order.orderForm/comb_list',params})
}
/**
 * 添加工单字段 adminapi/order.orderForm/add
 */
export function addOrder(params?:any) {
  return request.post({url:'/order.orderForm/add',data:params})
}
/**
 * 获取表单设计分组 adminapi/order.orderFormCate/all?type=1&step_type=1
 */
export function getOrderFormCate(params?:any) {
  return request.get({url:'/order.orderFormCate/all',params})
}
/**
 * 分组添加 adminapi/order.orderFormCate/add
 */

export function addOrderFormCate(params?:any) {
  return request.post({url:'/order.orderFormCate/add',data:params})
}
/**
 * 标单设计删除 adminapi/order.orderForm/delete
 */
export function deleteOrderForm(params?:any) {
  return request.post({url:'/order.orderForm/delete',data:params})
}
/**
 * 表单分组删除 adminapi/order.orderFormCate/delete
 */
export function deleteOrderFormCate(params?:any) {
  return request.post({url:'/order.orderFormCate/delete',data:params})
}
/**
 * 表单设计编辑 adminapi/order.orderForm/edit
 */
export function editOrderForm(params?:any) {
  return request.post({url:'/order.orderForm/edit',data:params})
}
/**
 * 表单分组编辑 adminapi/order.orderFormCate/edit
 */
export function editOrderFormCate(params?:any) {
  return request.post({url:'/order.orderFormCate/edit',data:params})
}
/**
 * 修改表单字段状态 adminapi/order.orderForm/change_field_status
 */
export function changeFieldStatus(params?:any) {
  return request.post({url:'/order.orderForm/change_field_status',data:params})
}
/**
 * 获取订单列表 adminapi/order.order/lists
 */
export function getOrderLists(params?:any) {
  return request.get({url:'/order.order/lists',params})
}
/**
 * 订单列表状态下来数据 adminapi/order.order/order_select_arr
 */
export function getOrderSelectArr() {
  return request.get({url:'/order.order/order_select_arr'})
}
/**
 * 获取工单催办提醒配置
 */
export function getOrderReminderConfig() {
  return request.get({url:'/order.order/get_reminder_config'})
}
/**
 * 保存工单催办提醒配置
 */
export function setOrderReminderConfig(params?:any) {
  return request.post({url:'/order.order/set_reminder_config',data:params})
}
/**
 * 删除订单 adminapi/order.order/delete
 */
export function deleteOrder(params?:any) {
  return request.post({url:'/order.order/delete',data:params})
}
/**
 * 订单详情 adminapi/order.order/detail?id=60
 */
export function getOrderDetail(params?:any) {
  return request.get({url:'/order.order/detail',params})
}



/**
 * 免费换件列表 adminapi/order.order_replace/lists?replace_sn=202601151759296333&order_sn=202601151550308237&status=1&name=张三
 */
export function getReplaceLists(params?:any) {
  return request.get({url:'/order.order_replace/lists',params})
}
/**
 * 免费换件详情 adminapi/order.order_replace/detail?id=2
 */
export function getReplaceDetail(params?:any) {
  return request.get({url:'/order.order_replace/detail',params})
}
/**
 * 免费换件可选工单列表 adminapi/order.order/lists?is_part=1&order_sn=
 */
export function getReplaceOrderList(params?:any) {
  return request.get({url:'/order.order/lists',params})
}
/**
 * 免费换件换件列表 adminapi/machine.machine/part_lists?keyword=
 */
export function getReplacePartList(params?:any) {
  return request.get({url:'/machine.machine/part_lists',params})
}
/**
 * 免费换件配件下拉选项 adminapi/machine.machine/part_select
 */
export function getReplacePartSelect() {
  return request.get({url:'/machine.machine/part_select'})
}
/**
 * 提交免费换件 adminapi/order.order_replace/add
 */
export function addReplace(params?:any) {
  return request.post({url:'/order.order_replace/add',data:params})
}
/**
 * 免费换件审核 adminapi/order.order_replace/audit
 */
export function auditReplace(params?:any) {
  return request.post({url:'/order.order_replace/audit',data:params})
}
/**
 * 免费换件复审 adminapi/order.order_replace/re_audit
 */
export function reAuditReplace(params?:any) {
  return request.post({url:'/order.order_replace/re_audit',data:params})
}
/**
 * 免费换件补充资料 adminapi/order.order_replace/order_fill
 */
export function orderFill(params?:any) {
  return request.post({url:'/order.order_replace/order_fill',data:params})
}
/**
 * 删除免费换件  adminapi/order.order_replace/delete
 */
export function deleteReplace(params?:any) {
  return request.post({url:'/order.order_replace/delete',data:params})
}

/**
 * 获取可创建工单类型 adminapi/order.order/type_all
 */
export function getOrderTypeAll() {
  return request.get({url:'/order.order/type_all'})
}
/**
 * 获取创建工单所需表单adminapi/order.order/order_form?type=1&step=1
 */
export function getOrderForm(params?:any) {
  return request.get({url:'/order.order/order_form',params})
}
/**
 * 创建工单 adminapi/order.order/create
 */
export function createOrder(params?:any) {
  return request.post({url:'/order.order/create',data:params})
}
/**
 * 批量创建工单 adminapi/order.order/create_more
 */
export function createOrderMore(params?:any) {
  return request.post({url:'/order.order/create_more',data:params})
}

/**
 * 工程师列表 adminapi/order.order/engineer_lists?keyword=&level=
 */
export function getEngineerLists(params?:any) {
  return request.get({url:'/order.order/engineer_lists',params})
}
/**
 * 派单 adminapi/order.order/send
 */
export function sendOrder(params?:any) {
  return request.post({url:'/order.order/send',data:params})
}
/**
 * 接单 adminapi/order.order/recieve
 */
export function recieveOrder(params?:any) {
  return request.post({url:'/order.order/recieve',data:params})
}
/**
 * adminapi/order.order/order_go 出发
 */
export function orderGo(params?:any) {
  return request.post({url:'/order.order/order_go',data:params})
}
/**
 * adminapi/order.order/order_arrive 到达
 */
export function orderArrive(params?:any) {
  return request.post({url:'/order.order/order_arrive',data:params})
}
/**
 * 获取故障类型 adminapi/order.order/all_reason
 */
export function getAllReason() {
  return request.get({url:'/order.order/all_reason'})
}
/**
 * 获取报销类型 adminapi/order.order/all_bx
 */
export function getAllBx() {
  return request.get({url:'/order.order/all_bx'})
}
/**
 * 完成工单 adminapi/order.order/order_complete
 */
export function orderComplete(params?:any) {
  return request.post({url:'/order.order/order_complete',data:params})
}
/**
 * 结束用车 adminapi/order.order/order_end_car
 */
export function orderEndCar(params?:any) {
  return request.post({url:'/order.order/order_end_car',data:params})
}
/**
 * 更改出发和结束里程 adminapi/order.order/order_change_mileage
 */
export function orderChangeMileage(params?:any) {
  return request.post({url:'/order.order/order_change_mileage',data:params})
}
/**
 * 撤回步骤 adminapi/order.order/rollback_step
 */
export function rollbackStep(params?:any) {
  return request.post({url:'/order.order/rollback_step',data:params})
}
/**
 * 订单审核 adminapi/order.order/audit
 */
export function auditOrder(params?:any) {
  return request.post({url:'/order.order/audit',data:params})
}
/**
 * 点检工单完成所需表单数据 adminapi/order.order/dj_form?id=13
 */
export function getDjForm(params?:any) {
  return request.get({url:'/order.order/dj_form',params})
}
/**
 * 工单编辑回填 adminapi/order.order/order_edit_fill?id=14
 */
export function getOrderEditFill(params?:any) {
  return request.get({url:'/order.order/order_edit_fill',params})
}
/**
 * 工单编辑 adminapi/order.order/order_edit
 */
export function orderEdit(params?:any) {
  return request.post({url:'/order.order/order_edit',data:params})
}
/**
 * 进场 adminapi/order.order/order_in
 */
export function orderIn(params?:any) {
  return request.post({url:'/order.order/order_in',data:params})
}
/**
 * 退场 adminapi/order.order/order_out
 */
export function orderOut(params?:any) {
  return request.post({url:'/order.order/order_out',data:params})
}

/**
 * 获取工作记录标记点 adminapi/order.order/get_order_work_date?id=32
 */
export function getOrderWorkDate(params?:any) {
  return request.get({url:'/order.order/get_order_work_date',params})
}
/**
 * 获取单条数据回显 adminapi/order.order/get_order_work_info?id=32&date=2026-1-13
 */
export function getOrderWorkInfo(params?:any) {
  return request.get({url:'/order.order/get_order_work_info',params})
}
/**
 * 添加工作记录 adminapi/order.order/order_work_add
 */
export function orderWorkAdd(params?:any) {
  return request.post({url:'/order.order/order_work_add',data:params})
}
/**
 * 获取额外工作记录字段 adminapi/order.order/order_work_extra?id=32
 */
export function getOrderWorkExtra(params?:any) {
  return request.get({url:'/order.order/order_work_extra',params})
}
/**
 * 编辑工作记录 adminapi/order.order/order_work_edit
 */
export function orderWorkEdit(params?:any) {
  return request.post({url:'/order.order/order_work_edit',data:params})
}
/**
 * 获取工作记录列表 adminapi/order.order/order_work_list?id=32&page_no=1
 */
export function getOrderWorkList(params?:any) {
  return request.get({url:'/order.order/order_work_list',params})
}
/**
 * 订单详情备注 adminapi/order.order/remark
 */
export function getRemark(params?:any) {
  return request.post({url:'/order.order/remark',data:params})
}
/**
 * 订单复审 adminapi/order.order/re_audit
 */
export function reAuditOrder(params?:any) {
  return request.post({url:'/order.order/re_audit',data:params})
}
/**
 * 订单远程指导 adminapi/order.order/order_remote
 */
export function orderRemote(params?:any) {
  return request.post({url:'/order.order/order_remote',data:params})
}
