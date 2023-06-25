import { request } from 'umi';
export async function queryCurrent() {
  return request('/api/current_user_detail');
}
export async function queryFakeList(params) {
  return request('/api/my_data_example', {
    params,
  });
}
