import { request } from 'umi';

/**
 * 获取下拉菜单选项列表的接口都放在这里
 */

// 角色列表
export async function fetchOptionsRoles(options) {
  return request('/api/options/roles', {
    method: 'GET',
    ...(options || {}),
  });
}
