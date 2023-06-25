const CONST = {
  // 是否纯飞书项目
  IS_FS_PRO: true,
  ROLE_CODE_SUPER: 1,
  ROLE_CODE_USER: 2,
  ROLE_CODE_STUDENT: 3,
  ROLE_CODE_SCHOOL: 4,
  ROLE_CODE_GRADUATE_INSTITUTION: 5,
  EVALUATION_TYPES: [
    '聘期考核',
    '职称评审',
    '岗位聘用',
    '导师遴选',
    '评优奖励',
    '项目申报',
    '人才申报',
    '其他',
  ],
  STATUS_DRAFT: {label: '草稿', value: 'draft'},
  STATUS_SCHOOL_APPROVING: {label: '待学院审批', value: 'school_approving'},
  STATUS_GRADUATE_SCHOOL_APPROVING: {
    label: '待研究生学院审批',
    value: 'graduate_school_approving',
  },
  STATUS_SCHOOL_EXAMINING: {label: '待学院检查', value: 'school_examining'},
  STATUS_GRADUATE_SCHOOL_EXAMINING: {
    label: '待研究生学院审批',
    value: 'graduate_school_examining',
  },
  STATUS_CONTRACT_SIGNING: {label: '待生成合同', value: 'contract_signing'},
  STATUS_GRADUATE_SCHOOL_CONTRACT_EXAMINING: {
    label: '待研究生学院审核合同',
    value: 'graduate_school_contract_examining',
  },
  STATUS_DONE: {label: '已完成', value: 'done'},
  STATUS_FAILED: {label: '项目不通过', value: 'failed'},
  PROMISE_TEST: '我承诺',
};

CONST.PROJECT_START_UP_FLOW = [
  CONST.STATUS_DRAFT,
  CONST.STATUS_SCHOOL_APPROVING,
  CONST.STATUS_GRADUATE_SCHOOL_APPROVING,
  CONST.STATUS_SCHOOL_EXAMINING,
  CONST.STATUS_GRADUATE_SCHOOL_EXAMINING,
  CONST.STATUS_CONTRACT_SIGNING,
  CONST.STATUS_GRADUATE_SCHOOL_CONTRACT_EXAMINING,
  CONST.STATUS_DONE,
];
CONST.MIDDLE_EXAMINATION_FLOW = [
  CONST.STATUS_DRAFT,
  CONST.STATUS_SCHOOL_APPROVING,
  CONST.STATUS_GRADUATE_SCHOOL_APPROVING,
  CONST.STATUS_DONE,
];
CONST.FINAL_EXAMINATION_FLOW = [
  CONST.STATUS_DRAFT,
  CONST.STATUS_SCHOOL_APPROVING,
  CONST.STATUS_GRADUATE_SCHOOL_APPROVING,
  CONST.STATUS_DONE,
];


export default CONST;
