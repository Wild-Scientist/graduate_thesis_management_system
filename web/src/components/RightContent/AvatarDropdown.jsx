import React, { useCallback } from 'react';
import { LogoutOutlined, SettingOutlined, UserOutlined } from '@ant-design/icons';
import { Avatar, Menu, Spin } from 'antd';
import { history, useModel } from 'umi';
import HeaderDropdown from '../HeaderDropdown';
import styles from './index.less';
import { outLogin } from '@/services/auth/auth';
import { stringify } from 'querystring';
import Tools from '@/tools';

//退出登录
const loginOut = async () => {
  await outLogin();
  const { pathname } = history.location;
  history.replace({
    pathname: '/user/login',
    search: stringify({
      redirect: pathname,
    }),
  });
};

const AvatarDropdown = ({ menu }) => {
  const { initialState, setInitialState } = useModel('@@initialState');
  const onMenuClick = useCallback(
    (event) => {
      const { key } = event;

      if (key === 'logout') {
        setInitialState((s) => ({ ...s, currentUser: undefined }));
        loginOut();
        return;
      }

      history.push(`/account/${key}`);
    },
    [setInitialState],
  );
  const loading = (
    <span className={`${styles.action} ${styles.account}`}>
      <Spin
        size="small"
        style={{
          marginLeft: 8,
          marginRight: 8,
        }}
      />
    </span>
  );

  if (!initialState) {
    return loading;
  }

  const { currentUser } = initialState;

  if (!currentUser) {
    return loading;
  }

  let items = [];
  // if (menu) {
  //   items = items.concat([
  //     { label: '个人中心', key: 'center', icon: <UserOutlined /> },
  //     { label: '个人设置', key: 'settings', icon: <SettingOutlined /> },
  //     { type: 'divider' },
  //   ]);
  // }
  items = items.concat([{ label: '退出登录', key: 'logout', icon: <LogoutOutlined /> }]);

  const menuHeaderDropdown = (
    <Menu className={styles.menu} selectedKeys={[]} onClick={onMenuClick} items={items} />
  );

  const content = (
    <span
      className={`${styles.action} ${styles.account}`}
      style={{ cursor: Tools.isFeishuEnv() ? 'initial' : 'pointer' }}
    >
      <Avatar
        size="small"
        className={styles.avatar}
        src={Tools.getAvatarURL(currentUser)}
        alt="avatar"
      />
      <span className={`${styles.name} anticon`}>
        {currentUser.name || currentUser.username}（
        {currentUser.roles?.map((r) => r.name).join('、')}）
      </span>
    </span>
  );

  if (Tools.isFeishuEnv()) {
    return content;
  } else {
    return <HeaderDropdown overlay={menuHeaderDropdown}>{content}</HeaderDropdown>;
  }
};

export default AvatarDropdown;
