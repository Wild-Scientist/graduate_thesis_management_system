import { request } from 'umi';

// 获取角色列表
export async function roles(params, options) {
  return request('/api/roles', {
    method: 'GET',
    params,
    ...(options || {}),
  });
}

// 编辑角色
export async function updateRole(data, options) {
  return request('/api/roles', {
    method: 'POST',
    data,
    ...(options || {}),
  });
}

// 获取权限列表
export async function fetchPermissions(params, options) {
  return request('/api/permissions', {
    method: 'GET',
    params,
    ...(options || {}),
  });
}
