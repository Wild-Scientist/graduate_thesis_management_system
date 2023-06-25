import { request } from 'umi';

// 搜索系统用户（专用）
export async function loginAnyoneSearch(keyword, options) {
  return request(`/api/login_anyone_search`, {
    method: 'GET',
    ...(options || {}),
  });
}

// 登录任意用户
export async function loginAnyone(id, options) {
  return request(`/api/login_anyone/${id}`, {
    method: 'POST',
    ...(options || {}),
  });
}
