import React, { useEffect, useState } from 'react';
import { Avatar, Button, message } from 'antd';
import FsSearchUserModal from '@/components/Feishu/FsSearchUserModal';
import { useModel } from 'umi';
import FsContactsModal from '@/components/Feishu/FsContactsModal';

export default function FsContactsSelect(props) {
  const { initialState } = useModel('@@initialState');
  const { currentUser } = initialState;

  const [fsContactsModalVis, setFsContactsModalVis] = useState(false);
  const [fsContacts, setFsContacts] = useState([]);

  useEffect(() => {
    setFsContacts(props.value ?? []);
  }, [props.value]);
  return (
    <div>
      <div>
        {fsContacts &&
          fsContacts.map((item) => (
            <p key={item.key}>
              {item.isLeaf ? (
                <Avatar src={item.obj?.avatar?.avatar_72 ?? item.obj?.fs_avatar} />
              ) : (
                <Avatar>部门</Avatar>
              )}
              <span style={{ margin: '0 5px' }}>{item.title}</span>(<span>{item.uniqueId}</span>)
            </p>
          ))}
      </div>
      <Button onClick={() => setFsContactsModalVis(true)}>点此选择飞书通讯录</Button>
      {/*<FsSearchUserModal*/}
      {/*  visible={fsContactsModalVis}*/}
      {/*  onCancel={() => setFsContactsModalVis(false)}*/}
      {/*  beforeSubmit={async (fsUsers) => {*/}
      {/*    // 增加一些判断逻辑*/}
      {/*    if (fsUsers.filter((u) => u.user_id === currentUser.fs_user_id).length) {*/}
      {/*      message.error('不能添加自己');*/}
      {/*      return false;*/}
      {/*    }*/}
      {/*    if (fsUsers.length > 5) {*/}
      {/*      message.error('最多添加 5 个');*/}
      {/*      return false;*/}
      {/*    }*/}
      {/*  }}*/}
      {/*  onSubmit={(fsUsers) => {*/}
      {/*    props.onChange(fsUsers);*/}
      {/*    setFsContactsModalVis(false);*/}
      {/*  }}*/}
      {/*  initialSelectedFsUsers={fsContacts}*/}
      {/*/>*/}
      <FsContactsModal
        visible={fsContactsModalVis}
        type={props.type}
        onCancel={() => setFsContactsModalVis(false)}
        onSubmit={(checkedNodes) => {
          console.log(checkedNodes);
          props.onChange(checkedNodes);
          setFsContactsModalVis(false);
        }}
      />
    </div>
  );
}
