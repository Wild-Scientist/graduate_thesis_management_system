import { request } from 'umi';

// 获取私有文件
export async function getFile(id, options) {
  return request(`/api/files/${id}`, {
    method: 'GET',
    ...(options || {}),
  });
}
