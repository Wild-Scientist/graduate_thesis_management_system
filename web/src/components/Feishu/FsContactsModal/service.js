// 获取飞书部门信息
import { request } from 'umi';

export async function fs_departments(params, options) {
  return request('/api/fs_departments', {
    method: 'GET',
    params,
    ...(options || {}),
  });
}
