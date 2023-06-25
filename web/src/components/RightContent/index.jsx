import { Space } from 'antd';
import React from 'react';
import { useModel, SelectLang } from 'umi';
import Avatar from './AvatarDropdown';
import styles from './index.less';
import VersionNotice from '@/components/VersionNotice';
import VConsole from '@/components/VConsole';
import LoginAnyone from '@/components/LoginAnyone';

const GlobalHeaderRight = () => {
  const { initialState } = useModel('@@initialState');

  if (!initialState || !initialState.settings) {
    return null;
  }

  const { navTheme, layout } = initialState.settings;
  let className = styles.right;

  if ((navTheme === 'dark' && layout === 'top') || layout === 'mix') {
    className = `${styles.right}  ${styles.dark}`;
  }

  return (
    <Space className={className}>
      <Avatar menu />
      <LoginAnyone />
      <SelectLang className={styles.action} />
      <VConsole />
      <VersionNotice />
    </Space>
  );
};

export default GlobalHeaderRight;
