import { history, request } from 'umi';

// 获取飞书登录地址
export async function getFeishuLoginUrl(state = null, options) {
  return request('/api/login/fs/url', {
    method: 'GET',
    params: {
      redirect_uri: `${window.location.origin}/loginFs`,
      state: state ?? history.location?.query?.redirect ?? '/',
    },
    ...(options || {}),
  });
}

// 飞书登录
export async function loginFs(data, options) {
  return request('/api/login/fs', {
    method: 'POST',
    data,
    ...(options || {}),
  });
}
