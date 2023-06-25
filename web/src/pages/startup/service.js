import {request} from 'umi';

// 获取列表
export async function getProjects(params, options) {
  const pageType = window.location.pathname.split('/')[1];
  return request(`/api/${pageType}/get_projects`, {
    method: 'GET',
    params,
    ...(options || {}),
  });
}

// 发起、编辑
export async function updateProject(data, options) {
  const pageType = window.location.pathname.split('/')[1];
  return request(`/api/${pageType}/update_project`, {
    method: 'POST',
    data,
    ...(options || {}),
  });
}

// 撤回
export async function withdraw(data, options) {
  const pageType = window.location.pathname.split('/')[1];
  return request(`/api/${pageType}/withdraw`, {
    method: 'POST',
    data,
    ...(options || {}),
  });
}

export async function pass(data, options) {
  const pageType = window.location.pathname.split('/')[1];
  return request(`/api/${pageType}/pass`, {
    method: 'POST',
    data,
    ...(options || {}),
  });
}

export async function reject(data, options) {
  const pageType = window.location.pathname.split('/')[1];
  return request(`/api/${pageType}/reject`, {
    method: 'POST',
    data,
    ...(options || {}),
  });
}

export async function fail(data, options) {
  const pageType = window.location.pathname.split('/')[1];
  return request(`/api/${pageType}/fail`, {
    method: 'POST',
    data,
    ...(options || {}),
  });
}

export async function downloadFile(key, name, options, type) {
  try {
    let res = await request(`/api/files/${key}`, {
      method: 'GET',
      ...(options || {}),
      download: true, //添加下载标识
    });
    const blob = new Blob([res]); //注意拿到的是数据流！！
    const objectURL = URL.createObjectURL(blob);
    let btn = document.createElement('a');
    btn.download = name; //文件类型
    btn.href = objectURL;
    btn.click();
    URL.revokeObjectURL(objectURL);
    btn = null;
  } catch (err) {
  }
}

export async function getDetails(params, options) {
  const pageType = window.location.pathname.split('/')[1];
  return request(`/api/${pageType}/get_details`, {
    method: 'GET',
    params,
    ...(options || {}),
  });
}

export async function getContract(params, options) {
  const pageType = window.location.pathname.split('/')[1];
  return request(`/api/${pageType}/get_contract`, {
    method: 'GET',
    params,
    ...(options || {}),
  });
}
