import { request } from 'umi';

// 获取版本列表
export async function versions(params, options) {
  return request('/api/versions', {
    method: 'GET',
    params,
    ...(options || {}),
  });
}

// 编辑版本
export async function updateVersion(data, options) {
  return request('/api/versions', {
    method: 'POST',
    data,
    ...(options || {}),
  });
}
