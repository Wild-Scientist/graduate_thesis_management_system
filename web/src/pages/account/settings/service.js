import { request } from 'umi';
export async function queryCurrent() {
  return request('/api/account_setting_current_user');
}
export async function queryProvince() {
  return request('/api/geographic/province');
}
export async function queryCity(province) {
  return request(`/api/geographic/city/${province}`);
}
export async function query() {
  return request('/api/users');
}

// 更新基本信息
export async function updateCurrentUser(data, options) {
  return request('/api/update_current_user', {
    method: 'POST',
    data,
    ...(options || {}),
  });
}
