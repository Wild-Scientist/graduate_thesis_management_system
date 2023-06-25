import CONST from '@/const';
import Tools from '@/tools';
import * as startUp from './startUpPermissions' ;
import * as middleExamination from './middleExaminationPermissions';
import * as finalExamination from './finalExaminationPermissions';


const stages = [startUp, middleExamination, finalExamination];
export const userCanSeeEdit = (pageType) => {
  //只有当user_id===项目的user_id而且当前页面是我的项目时才能编辑
  if (pageType === 'my_projects') return true;
  else return false;
};
export const isEditDisable = (record) => {
  if (record.status === CONST.STATUS_FAILED) return true;
  if (record.status !== CONST.STATUS_DRAFT.value) return true;
  else return false;
};

/*
 * 判断当前用户撤销操作是否disable
 * */
export function isWithdrawDisabled(currentUser, record) {
  return stages[Tools.getProjectTypeIndex()].isWithdrawDisabled(currentUser, record)
}

/*
 * 判断用户是否可以通过当前项目
 * */
export function userCanSeePass(currentUser, record) {
  //当前用户是学院，且当前状态符合才能通过
  return stages[Tools.getProjectTypeIndex()].userCanSeePass(currentUser, record)
}

/*
 * 通过按钮是否disable
 * */
export function isPassDisable(currentUser, record) {
  return stages[Tools.getProjectTypeIndex()].isPassDisable(currentUser, record)
}
