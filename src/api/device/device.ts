import request from '@/utils/request'

export function getmachineCateAi(params?: any) {
	return request.get({ url: '/machine.machineCate/lists', params })
}

export function getmachineCheckApi(params?: any) {
	return request.get({ url: '/machine.machineCheck/lists', params })
}

export function addmachineCateApi(data?: any) {
	return request.post({ url: '/machine.machineCate/add', data })
}

export function editmachineCateApi(data?: any) {
	return request.post({ url: '/machine.machineCate/edit', data })
}

export function deletemachineCateApi(data?: any) {
	return request.post({ url: '/machine.machineCate/delete', data })
}

export function addmachineCheckApi(data?: any) {
	return request.post({ url: '/machine.machineCheck/add', data })
}

export function editmachineCheckApi(data?: any) {
	return request.post({ url: '/machine.machineCheck/edit', data })
}

export function deletemachineCheckApi(data?: any) {
	return request.post({ url: '/machine.machineCheck/delete', data })
}

export function getmachineListsApi(params?: any) {
	return request.get({ url: '/machine.machine/lists', params })
}

export function getmachineDetailApi(params?: any) {
	return request.get({ url: '/machine.machine/detail', params })
}

export function addmachineApi(data?: any) {
	return request.post({ url: '/machine.machine/add', data })
}

export function getMachineCateOptionsApi(params?: any) {
	return request.get({ url: '/machine.machine_cate/options', params })
}

export function changemachineFieldApi(data?: any) {
	return request.post({ url: '/machine.machine/change_field', data })
}

export function deletemachineApi(data?: any) {
	return request.post({ url: '/machine.machine/delete', data })
}

export function editmachineApi(data?: any) {
	return request.post({ url: '/machine.machine/edit_machine', data })
}

export function bindMachineEngineerApi(data?: any) {
	return request.post({ url: '/machine.machine/bind_engineer', data })
}

export function batchBindMachineEngineerApi(data?: any) {
	return request.post({ url: '/machine.machine/batch_bind_engineer', data })
}

export function getmachineChangeListsApi(params?: any) {
	return request.get({ url: '/machine.machine/change_lists', params })
}

export function getmachineChangeDetailApi(params?: any) {
	return request.get({ url: '/machine.machine/change_detail', params })
}

export function getmachineErrorListsApi(params?: any) {
	return request.get({ url: '/machine.machine/machine_error_lists', params })
}

export function getmachineErrorDetailApi(params?: any) {
	return request.get({ url: '/machine.machine/machine_error_detail', params })
}

export function reloadErrorDeviceApi(params?: any) {
	return request.post({ url: '/machine.machine/machine_error_reload', data: params })
}

export function getMachineApplyListsApi(params?: any) {
	return request.get({ url: '/machine.machine_apply/lists', params })
}

export function auditMachineApplyApi(data?: any) {
	return request.post({ url: '/machine.machine_apply/audit', data })
}
