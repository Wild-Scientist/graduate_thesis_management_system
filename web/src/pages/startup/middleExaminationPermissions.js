import CONST from '@/const';
import Tools from '@/tools';

const CODE_STUDENT = 'flow.middle_examination.student';
const CODE_SCHOOL = 'flow.middle_examination.school';
const CODE_GRADUATE_SCHOOL = 'flow.middle_examination.graduate_school';

export const userCanSeeEdit = (pageType) => {
  //只有当user_id===项目的user_id而且当前页面是我的项目时才能编辑
  if (pageType === 'my_projects') return true;
  else return false;
};
export const isEditDisable = (record) => {
  if (record.failed === 1) return true;
  if (record.status !== CONST.STATUS_DRAFT.value) return true;
  else return false;
};

/*
 * 判断当前用户撤销操作是否disable
 * */
export function isWithdrawDisabled(currentUser, record) {
  if (record.failed === 1) return true;
  const student_permissions = [CONST.STATUS_DRAFT['value'], CONST.STATUS_SCHOOL_APPROVING['value']];
  const school_permissions = [CONST.STATUS_GRADUATE_SCHOOL_APPROVING['value']];
  const graduate_school_permissions = [CONST.STATUS_DONE['value']];
  const status = record.status;
  if (currentUser?.permission_codes.includes(CODE_STUDENT)) {
    if (record?.user_id === currentUser.id) {
      if (student_permissions.includes(status)) return false;
    }
  }
  if (currentUser?.permission_codes.includes(CODE_SCHOOL)) {
    if (school_permissions.includes(status)) return false;
  }
  if (currentUser?.permission_codes.includes(CODE_GRADUATE_SCHOOL)) {
    if (graduate_school_permissions.includes(status)) return false;
  }
  return true;
}

/*
 * 判断用户是否可以通过当前项目
 * */
export function userCanSeePass(currentUser, record) {
  //当前用户是学院，且当前状态符合才能通过
  if (
    currentUser?.permission_codes.includes(CODE_GRADUATE_SCHOOL) ||
    currentUser?.permission_codes.includes(CODE_SCHOOL)
  )
    return true;
  else return false;
}

/*
 * 通过按钮是否disable
 * */
export function isPassDisable(currentUser, record) {
  if (record.failed === 1) return true;
  const school_permissions = [CONST.STATUS_SCHOOL_APPROVING['value']];
  const graduate_school_permissions = [CONST.STATUS_GRADUATE_SCHOOL_APPROVING['value']];
  const status = record.status;
  if (currentUser?.permission_codes.includes(CODE_SCHOOL)) {
    if (school_permissions.includes(status)) return false;
  }
  if (currentUser?.permission_codes.includes(CODE_GRADUATE_SCHOOL)) {
    if (graduate_school_permissions.includes(status)) return false;
  }
  return true;
}
