import React, { useRef, useState } from 'react';
import { Avatar, Button, Divider, Form, Space } from 'antd';
import FsContactsModal from '@/components/Feishu/FsContactsModal';
import FsUserByNumberModal from '@/components/Feishu/FsUserByNumberModal';
import FsSearchUserModal from '@/components/Feishu/FsSearchUserModal';
import UserTag from '@/components/UserTag';
import { currentUser } from '@/services/auth/auth';
import { useModel } from 'umi';
import { ProForm } from '@ant-design/pro-form';
import FsUsersSelect from '@/components/Feishu/FsUsersSelect';
import FsContactsSelect from '@/components/Feishu/FsContactsSelect';

export default function Contact() {
  const { initialState } = useModel('@@initialState');
  const { currentUser } = initialState;
  /**
   * 通讯录选择器
   */
  // 用户+部门多选 UDM=UserDepartmentMultiple
  const [modalUDMVisible, setModalUDMVisible] = useState(false);
  const [checkedNodesUDM, setCheckedNodesUDM] = useState([]);

  // 用户多选 UM=UserMultiple
  const [modalUMVisible, setModalUMVisible] = useState(false);
  const [checkedNodesUM, setCheckedNodesUM] = useState([]);

  // 部门多选 DM=DepartmentMultiple
  const [modalDMVisible, setModalDMVisible] = useState(false);
  const [checkedNodesDM, setCheckedNodesDM] = useState([]);

  // 用户+部门单选 UD=UserDepartment
  const [modalUDVisible, setModalUDVisible] = useState(false);
  const [checkedNodesUD, setCheckedNodesUD] = useState([]);

  // 用户单选 U=User
  const [modalUVisible, setModalUVisible] = useState(false);
  const [checkedNodesU, setCheckedNodesU] = useState([]);

  // 部门单选 D=Department
  const [modalDVisible, setModalDVisible] = useState(false);
  const [checkedNodesD, setCheckedNodesD] = useState([]);

  /**
   * 通讯录选择器用在表单
   */
  const fsContactsSelectFormRef = useRef();

  /**
   * 搜索选择器
   */
  const [fsSearchUserModalVis, setFsSearchUserModalVis] = useState(false);
  const [fsSearchUsers, setFsSearchUsers] = useState([]);

  /**
   * 搜索选择器用在表单
   */
  const fsUsersSelectFormRef = useRef();

  return (
    <div>
      <p>
        <b>通讯录选择器</b>
      </p>

      <div>
        <Button style={{ margin: '10px 0' }} onClick={() => setModalUDMVisible(true)}>
          用户+部门多选
        </Button>
        <FsContactsModal
          visible={modalUDMVisible}
          onCancel={() => setModalUDMVisible(false)}
          onSubmit={(checkedNodes) => {
            console.log(checkedNodes);
            setCheckedNodesUDM(checkedNodes);
            setModalUDMVisible(false);
          }}
        />
        {checkedNodesUDM.length ? (
          <div style={{ maxHeight: 300, overflow: 'auto' }}>
            {checkedNodesUDM.map((node) => (
              <p key={node.key}>
                类型：{node.isLeaf ? '用户' : '部门'}，名称：{node.title}，ID：{node.uniqueId}
              </p>
            ))}
          </div>
        ) : null}
      </div>

      <div>
        <Button style={{ margin: '10px 0' }} onClick={() => setModalUMVisible(true)}>
          用户多选
        </Button>
        <FsContactsModal
          visible={modalUMVisible}
          type={'user'} // 修改此处
          onCancel={() => setModalUMVisible(false)}
          onSubmit={(checkedNodes) => {
            console.log(checkedNodes);
            setCheckedNodesUM(checkedNodes);
            setModalUMVisible(false);
          }}
        />
        {checkedNodesUM.length ? (
          <div style={{ maxHeight: 300, overflow: 'auto' }}>
            {checkedNodesUM.map((node) => (
              <p key={node.key}>
                名称：{node.title}，ID：{node.uniqueId}
              </p>
            ))}
          </div>
        ) : null}
      </div>

      <div>
        <Button style={{ margin: '10px 0' }} onClick={() => setModalDMVisible(true)}>
          部门多选
        </Button>
        <FsContactsModal
          visible={modalDMVisible}
          type={'department'} // 修改此处
          onCancel={() => setModalDMVisible(false)}
          onSubmit={(checkedNodes) => {
            console.log(checkedNodes);
            setCheckedNodesDM(checkedNodes);
            setModalDMVisible(false);
          }}
        />
        {checkedNodesDM.length ? (
          <div style={{ maxHeight: 300, overflow: 'auto' }}>
            {checkedNodesDM.map((node) => (
              <p key={node.key}>
                名称：{node.title}，ID：{node.uniqueId}
              </p>
            ))}
          </div>
        ) : null}
      </div>

      <div>
        <Button style={{ margin: '10px 0' }} onClick={() => setModalUDVisible(true)}>
          用户+部门单选
        </Button>
        <FsContactsModal
          visible={modalUDVisible}
          mode={'single'}
          onCancel={() => setModalUDVisible(false)}
          onSubmit={(checkedNodes) => {
            console.log(checkedNodes);
            setCheckedNodesUD(checkedNodes);
            setModalUDVisible(false);
          }}
        />
        {checkedNodesUD.length ? (
          <div style={{ maxHeight: 300, overflow: 'auto' }}>
            {checkedNodesUD.map((node) => (
              <p key={node.key}>
                类型：{node.isLeaf ? '用户' : '部门'}，名称：{node.title}，ID：{node.uniqueId}
              </p>
            ))}
          </div>
        ) : null}
      </div>

      <div>
        <Button style={{ margin: '10px 0' }} onClick={() => setModalUVisible(true)}>
          用户单选
        </Button>
        <FsContactsModal
          visible={modalUVisible}
          type={'user'}
          mode={'single'}
          onCancel={() => setModalUVisible(false)}
          onSubmit={(checkedNodes) => {
            console.log(checkedNodes);
            setCheckedNodesU(checkedNodes);
            setModalUVisible(false);
          }}
        />
        {checkedNodesU.length ? (
          <div style={{ maxHeight: 300, overflow: 'auto' }}>
            {checkedNodesU.map((node) => (
              <p key={node.key}>
                名称：{node.title}，ID：{node.uniqueId}
              </p>
            ))}
          </div>
        ) : null}
      </div>

      <div>
        <Button style={{ margin: '10px 0' }} onClick={() => setModalDVisible(true)}>
          部门单选
        </Button>
        <FsContactsModal
          visible={modalDVisible}
          type={'department'}
          mode={'single'}
          onCancel={() => setModalDVisible(false)}
          onSubmit={(checkedNodes) => {
            console.log(checkedNodes);
            setCheckedNodesD(checkedNodes);
            setModalDVisible(false);
          }}
        />
        {checkedNodesD.length ? (
          <div style={{ maxHeight: 300, overflow: 'auto' }}>
            {checkedNodesD.map((node) => (
              <p key={node.key}>
                名称：{node.title}，ID：{node.uniqueId}
              </p>
            ))}
          </div>
        ) : null}
      </div>

      <Divider />
      <p>
        <b>通讯录选择器用在表单</b>
      </p>
      <div>
        <ProForm formRef={fsContactsSelectFormRef} onFinish={(values) => console.log(values)}>
          <Form.Item label={'飞书通讯录'} name={'fsContacts'}>
            <FsContactsSelect />
          </Form.Item>
        </ProForm>
        <Button
          onClick={() => {
            const fsContacts = [
              {
                title: currentUser.name,
                uniqueId: currentUser.fs_user_id,
                isLeaf: true,
                obj: currentUser,
              },
            ];
            if (currentUser.fs_departments.length) {
              fsContacts.push({
                title: currentUser.fs_departments[0].name,
                uniqueId: currentUser.fs_departments[0].open_department_id,
              });
            }
            fsContactsSelectFormRef.current?.setFieldsValue({ fsContacts });
          }}
          style={{ marginTop: 20 }}
        >
          模拟编辑
        </Button>
      </div>

      <Divider />
      <p>
        <b>搜索选择器</b>
      </p>
      <div>
        <Button
          style={{ margin: '10px 10px 10px 0' }}
          onClick={() => setFsSearchUserModalVis(true)}
        >
          用户多选
        </Button>
        <span>maxCount 可设置最大数量，设置为 1 可当单选使用</span>
        <FsSearchUserModal
          maxCount={10}
          visible={fsSearchUserModalVis}
          onCancel={() => setFsSearchUserModalVis(false)}
          onSubmit={(fsUser) => {
            console.log(fsUser);
            setFsSearchUsers(fsUser);
            setFsSearchUserModalVis(false);
          }}
        />
        {fsSearchUsers &&
          fsSearchUsers.map((u) => (
            <p key={u.user_id}>
              <Avatar src={u?.fs_avatar} style={{ marginRight: 10 }} />
              <span>
                {u.name}/{u.payroll_number ?? u.student_number ?? '-'}/
                {u.fs_departments.map((d) => d.name).join('、')}
              </span>
            </p>
          ))}
      </div>

      <Divider />
      <p>
        <b>搜索选择器用在表单</b>
      </p>
      <div>
        <ProForm formRef={fsUsersSelectFormRef} onFinish={(values) => console.log(values)}>
          <Form.Item label={'飞书用户'} name={'fsUsers'}>
            <FsUsersSelect />
          </Form.Item>
        </ProForm>
        <Button
          onClick={() => {
            fsUsersSelectFormRef.current?.setFieldsValue({
              fsUsers: [currentUser],
            });
          }}
          style={{ marginTop: 20 }}
        >
          模拟编辑
        </Button>
      </div>

      <Divider />
      <p>
        <b>用户展示标签</b>
      </p>
      <div>
        <UserTag user={currentUser} />
      </div>
    </div>
  );
}
