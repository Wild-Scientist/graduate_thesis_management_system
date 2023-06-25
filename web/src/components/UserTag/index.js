import React from 'react';
import styles from './index.less';
import { Avatar, Tooltip } from 'antd';

export default function UserTag(props) {
  const { user = {}, className = '', ...other } = props;
  return (
    <span className={`${styles.seconder} ${className}`} {...other}>
      <Avatar className={styles.avatar} src={user.fs_avatar} size={'small'} />
      <Tooltip title={'发起聊天'}>
        <span
          className={styles.link}
          onClick={() => {
            window.open(`https://applink.feishu.cn/client/chat/open?openId=${user.fs_open_id}`);
          }}
        >
          {user.name}/{user.payroll_number ?? user.student_number ?? '-'}/
          {user?.fs_departments?.map((d) => d.name)?.join('、')}
        </span>
      </Tooltip>
    </span>
  );
}
