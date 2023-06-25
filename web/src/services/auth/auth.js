import { request } from 'umi';

/** 登录接口 POST /api/login/account */
export async function login(body, options) {
  return request('/api/login/account', {
    method: 'POST',
    data: body,
    ...(options || {}),
  });
}

// 获取当前登录用户
export async function currentUser(options) {
  return request('/api/current_user', {
    method: 'GET',
    ...(options || {}),
  });
}

/** 退出登录接口 POST /api/login/out_login */
export async function outLogin(options) {
  return request('/api/login/out_login', {
    method: 'POST',
    ...(options || {}),
  });
}

// 获取登录验证码
export async function getLoginCaptcha(phone, options) {
  return request('/api/login/captcha', {
    method: 'GET',
    params: { phone },
    ...(options || {}),
  });
}

// 获取注册验证码
export async function getRegisterCaptcha(phone, options) {
  return request('/api/register/captcha', {
    method: 'GET',
    params: { phone },
    ...(options || {}),
  });
}

// 注册
export async function register(body, options) {
  return request('/api/register', {
    method: 'POST',
    data: body,
    ...(options || {}),
  });
}
