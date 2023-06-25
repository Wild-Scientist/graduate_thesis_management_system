import React, { useEffect, useState } from 'react';
import { Avatar, Button, message } from 'antd';
import FsSearchUserModal from '@/components/Feishu/FsSearchUserModal';
import { useModel } from 'umi';

export default function FsUsersSelect(props) {
  const { initialState } = useModel('@@initialState');
  const { currentUser } = initialState;

  const [fsSearchUserModalVis, setFsSearchUserModalVis] = useState(false);
  const [fsSearchUsers, setFsSearchUsers] = useState([]);

  useEffect(() => {
    setFsSearchUsers(props.value ?? []);
  }, [props.value]);
  return (
    <div>
      <div>
        {fsSearchUsers &&
          fsSearchUsers.map((u) => (
            <p key={u.fs_user_id}>
              <Avatar src={u.fs_avatar} style={{ marginRight: 10 }} />
              <span>
                {u.name}/{u.payroll_number ?? u.student_number ?? '-'}/
                {u.fs_departments.map((d) => d.name).join('、')}
              </span>
            </p>
          ))}
      </div>
      <Button onClick={() => setFsSearchUserModalVis(true)}>点此选择飞书用户</Button>
      <FsSearchUserModal
        visible={fsSearchUserModalVis}
        onCancel={() => setFsSearchUserModalVis(false)}
        beforeSubmit={async (fsUsers) => {
          // 增加一些判断逻辑
          if (fsUsers.filter((u) => u.user_id === currentUser.fs_user_id).length) {
            message.error('不能添加自己');
            return false;
          }
          if (fsUsers.length > 5) {
            message.error('最多添加 5 个');
            return false;
          }
        }}
        onSubmit={(fsUsers) => {
          props.onChange(fsUsers);
          setFsSearchUserModalVis(false);
        }}
        initialSelectedFsUsers={fsSearchUsers}
      />
    </div>
  );
}
