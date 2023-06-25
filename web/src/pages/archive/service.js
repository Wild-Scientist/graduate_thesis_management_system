import { request } from 'umi';

// 获取列表
export async function archives(params, options) {
  return request('/api/archives', {
    method: 'GET',
    params,
    ...(options || {}),
  });
}

// 获取详情
export async function fetchArchive(id, options) {
  return request(`/api/archives/${id}`, {
    method: 'GET',
    ...(options || {}),
  });
}

// 导入前检查
export async function importPreCheck(data, options) {
  return request('/api/archives/import/pre_check', {
    method: 'POST',
    data,
    ...(options || {}),
  });
}

// 导入年度考核
export async function importAnnualAssessments(data, options) {
  return request('/api/archives/import/annual_assessments', {
    method: 'POST',
    data,
    ...(options || {}),
  });
}

// 导入表彰记录
export async function importCommendationRecords(data, options) {
  return request('/api/archives/import/commendation_records', {
    method: 'POST',
    data,
    ...(options || {}),
  });
}

// 导入培训记录
export async function importTrainingRecords(data, options) {
  return request('/api/archives/import/training_records', {
    method: 'POST',
    data,
    ...(options || {}),
  });
}

// 导入违规记录
export async function importViolationRecords(data, options) {
  return request('/api/archives/import/violation_records', {
    method: 'POST',
    data,
    ...(options || {}),
  });
}

// // 审批（保存处理内容）
// export async function approveEvaluation(data, options) {
//   return request('/api/evaluations/approve', {
//     method: 'POST',
//     data,
//     ...(options || {}),
//   });
// }
//
// // 退回
// export async function refuseEvaluation(data, options) {
//   return request('/api/evaluations/refuse', {
//     method: 'POST',
//     data,
//     ...(options || {}),
//   });
// }
//
// // 撤回
// export async function withdrawEvaluation(data, options) {
//   return request('/api/evaluations/withdraw', {
//     method: 'POST',
//     data,
//     ...(options || {}),
//   });
// }
//
// // 删除
// export async function deleteEvaluation(id, options) {
//   return request(`/api/evaluations/${id}`, {
//     method: 'DELETE',
//     ...(options || {}),
//   });
// }
//
// // 获取申请流程节点草稿
// export async function fetchEvaluationsFlows(id, options) {
//   return request(`/api/evaluations/${id}/flows`, {
//     method: 'GET',
//     ...(options || {}),
//   });
// }
//
// // 添加考察人
// export async function addEvaluators(data, options) {
//   return request('/api/evaluations/evaluators', {
//     method: 'POST',
//     data,
//     ...(options || {}),
//   });
// }
//
// // 移除考察人
// export async function removeEvaluators(id, options) {
//   return request(`/api/evaluations/evaluators/${id}`, {
//     method: 'DELETE',
//     ...(options || {}),
//   });
// }
//
// // 更新考察人评价
// export async function updateEvaluatorContent(id, data, options) {
//   return request(`/api/evaluations/evaluators/${id}`, {
//     method: 'POST',
//     data,
//     ...(options || {}),
//   });
// }
