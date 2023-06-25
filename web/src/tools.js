import CONST from '@/const';
import { message } from 'antd';

const Tools = {
  /**
   * 获取 URL 参数
   * @param key
   * @returns {string}
   */
  getUrlParam: (key) => {
    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);
    return urlParams.get(key);
  },

  /**
   * 按照后端规范统一处理前端参数
   * @param params
   * @returns {*}
   */
  handleRequestParams: (params) => {
    for (const paramKey in params) {
      // 数组类参数修改
      if (Array.isArray(params[paramKey])) {
        params[`${paramKey}[]`] = params[paramKey];
        delete params[paramKey];
      }
      // 去掉空参数
      if (['', null, undefined].includes(params[paramKey])) {
        delete params[paramKey];
      }
    }
    return params;
  },

  /**
   * 处理 ProTable 中的 params
   * @param params
   * @returns {*}
   */
  handleParams: (params) => {
    console.log(params);
    const _params = { ...params };
    // 分页参数修改
    _params.page = _params.current;
    _params.page_size = _params.pageSize;
    delete _params.current;
    delete _params.pageSize;
    return Tools.handleRequestParams(_params);
  },

  /**
   * 处理 ProTable 中的 filter
   * @param filter
   * @returns {*}
   */
  handleFilter: (filter) => {
    return Tools.handleRequestParams({ ...filter });
  },

  /**
   * 处理 ProTable 中的 sort
   * @param sort
   * @returns {*}
   */
  handleSort: (sort) => {
    for (const key in sort) {
      if (sort[key] === 'ascend') {
        sort[key] = 'asc';
      } else if (sort[key] === 'descend') {
        sort[key] = 'desc';
      }
    }
    return sort;
  },

  /**
   * 验证上传字段（验证是否都上传成功）
   *
   * @param uploads
   */
  verifyUploads: (uploads) => {
    for (let i = 0; i < uploads.length; i++) {
      const upload = uploads[i];
      if (upload.status !== 'done') {
        return false;
      }
    }
    return true;
  },

  /**
   * 获取当前用户的头像地址
   *
   * @param user
   * @returns {*|string}
   */
  getAvatarURL: (user) => {
    return user.avatar || user.fs_avatar_72 || '/cat.svg';
  },

  /**
   * 判断当前环境是否为移动端
   * @returns {boolean}
   */
  detectMob: () => {
    const toMatch = [
      /Android/i,
      /webOS/i,
      /iPhone/i,
      /iPad/i,
      /iPod/i,
      /BlackBerry/i,
      /Windows Phone/i,
    ];

    return toMatch.some((toMatchItem) => {
      return navigator.userAgent.match(toMatchItem);
    });
  },

  /**
   * 判断当前环境是否为飞书内置浏览器
   *
   * @returns {boolean}
   */
  isFeishuEnv: () => {
    const userAgent = window.navigator.userAgent;
    return userAgent.includes('Lark') || userAgent.includes('Feishu');
  },
  /*
   * 将对象转为formdata
   * */
  toForm: (values) => {
    let form = new FormData();
    for (const key in values) {
      if (values[key] === undefined || values[key] === null || values[key] === '') continue;
      form.append(key, values[key]);
    }
    return form;
  },
  getStatusIndex: (code, flow) => {
    for (let i = 0; i < flow.length; i++) {
      if (flow[i].value === code) return i;
    }
  },
  getStatusLabel: (code, flow) => {
    let i = Tools.getStatusIndex(code, flow);
    return flow[i]?.['label'];
  },
  uploadFileCheck: (values) => {
    console.log(values, 'upload_file');
    if (values?.files?.[0]?.response?.data?.key === undefined) {
      message.error('必须上传附件');
      return false;
    }
    //有新的文件上传
    if (!Tools.verifyUploads(values.files)) {
      message.error('附件中有上传失败的文件，请先删除');
      return false;
    }
    values.attachment = { key: values?.files?.[0]?.response?.data?.key };
  },
  //根据url获取流程图节点常量
  getFlowConst: () => {
    const pageType = window.location.pathname.split('/')[1];
    if (pageType === 'project_start_up') return CONST.PROJECT_START_UP_FLOW;
    if (pageType === 'middle_examination') return CONST.MIDDLE_EXAMINATION_FLOW;
    if (pageType === 'final_examination') return CONST.FINAL_EXAMINATION_FLOW;
    return CONST.PROJECT_START_UP_FLOW;
  },
  //根据url返回当前项目类型
  getProjectTypeIndex: () => {
    const pageType = window.location.pathname.split('/')[1];
    if (pageType === 'project_start_up') return 0;
    if (pageType === 'middle_examination') return 1;
    if (pageType === 'final_examination') return 2;
    return 0;
  },
};
export default Tools;
