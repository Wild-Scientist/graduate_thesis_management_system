import { request } from 'umi';

export async function syncFsUserData(number, options) {
  return request('/api/sync_fs_user_data', {
    method: 'GET',
    params: { number },
    ...(options || {}),
  });
}

export async function searchFsUsers(params, options) {
  return request('/api/search_fs_user', {
    method: 'GET',
    params,
    ...(options || {}),
  });
}

export async function getJsSDKAuthConfig(params, options) {
  return request('/api/jssdk_auth_config', {
    method: 'GET',
    params,
    ...(options || {}),
  });
}

export async function updateBlock(data, options) {
  return request('/api/update_block', {
    method: 'POST',
    data,
    ...(options || {}),
  });
}

export async function batchUpdateBlocks(data, options) {
  return request('/api/batch_update_blocks', {
    method: 'POST',
    data,
    ...(options || {}),
  });
}
