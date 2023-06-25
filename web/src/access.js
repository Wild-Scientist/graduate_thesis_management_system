/**
 * @see https://umijs.org/zh-CN/plugins/plugin-access
 * */
import CONST from '@/const';

export default function access(initialState) {
  const { currentUser } = initialState || {};

  const isDev = () => currentUser?.is_dev;
  const isSuper = () => currentUser?.roles?.map((r) => r.id)?.includes(CONST.ROLE_CODE_SUPER);
  const hasPermission = (permission) => {
    return currentUser?.permission_codes.includes(`menus.${permission}`);
  };
  return {
    isDev: isDev(),
    isSuper: isSuper,
    can: () => isSuper() || hasPermission(permission),
    checkRoute: (route) => {
      return isSuper() || hasPermission(route.name);
    },
  };
}
