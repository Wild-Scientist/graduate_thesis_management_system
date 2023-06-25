import { request } from 'umi';

// 获取用户列表
export async function users(params, options) {
  return request('/api/users', {
    method: 'GET',
    params,
    ...(options || {}),
  });
}

// 编辑用户
export async function updateUser(data, options) {
  return request('/api/users', {
    method: 'POST',
    data,
    ...(options || {}),
  });
}

// 导入飞书用户
export async function importFsUser(data, options) {
  return request('/api/import_fs_user', {
    method: 'POST',
    data,
    ...(options || {}),
  });
}

// 更新用户飞书信息
export async function updateUserFsData(id, options) {
  return request(`/api/users/${id}/fs_data`, {
    method: 'POST',
    ...(options || {}),
  });
}
