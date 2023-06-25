// 获取部门列表
import { request } from 'umi';

export async function departments(params, options) {
  return request('/api/departments', {
    method: 'GET',
    params: { ...params },
    ...(options || {}),
  });
}

// 编辑部门
export async function updateDepartment(data, options) {
  return request('/api/departments', {
    method: 'POST',
    data,
    ...(options || {}),
  });
}

// 删除部门
export async function deleteDepartment(id, options) {
  return request(`/api/departments/${id}`, {
    method: 'DELETE',
    ...(options || {}),
  });
}
