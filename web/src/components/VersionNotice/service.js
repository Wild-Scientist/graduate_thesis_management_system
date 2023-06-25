import { request } from 'umi';

// 获取最新版本号
export async function latestVersion(options) {
  return request('/api/latest_version', {
    method: 'GET',
    ...(options || {}),
  });
}
