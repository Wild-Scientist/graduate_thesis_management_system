import React, { useRef, useState } from 'react';
import styles from './index.less';
import { UserSwitchOutlined } from '@ant-design/icons';
import { Avatar, Input, message, Modal } from 'antd';
import { ProTable } from '@ant-design/pro-table';
import { loginAnyone, loginAnyoneSearch } from '@/components/LoginAnyone/service';
import { useRequest } from 'umi';
import Cookies from 'js-cookie';
import Tools from '@/tools';

export default function LoginAnyone() {
  const allowHostnames = ['localhost', '127.0.0.1', '124.221.149.246'];
  const [modalOpen, setModalOpen] = useState(false);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const tableRef = useRef();
  const columns = [
    {
      title: '头像',
      render: (_, record) => <Avatar src={Tools.getAvatarURL(record)} />,
    },
    {
      title: '姓名',
      dataIndex: 'name',
    },
    // {
    //   title: '部门',
    //   dataIndex: 'fs_departments',
    //   render: (text) => text.map((d) => d.name).join('、'),
    // },
    // {
    //   title: '工资号/学号',
    //   render: (_, record) => record.payroll_number ?? record.student_number ?? '-',
    // },
  ];
  const { run: runLoginAnyone, loading: loadingLoginAnyone } = useRequest(loginAnyone, {
    manual: true,
  });

  if (allowHostnames.includes(window.location.hostname)) {
    return (
      <div className={styles.container}>
        <UserSwitchOutlined className={styles.icon} onClick={() => setModalOpen(true)} />
        <Modal
          title={'登录任意用户'}
          open={modalOpen}
          onCancel={() => setModalOpen(false)}
          onOk={async () => {
            if (selectedRowKeys.length) {
              const data = await runLoginAnyone(selectedRowKeys[0]);
              Cookies.set('t', data?.token);

              const redirectPaths = ['/user/login'];
              if (redirectPaths.includes(window.location.pathname)) {
                window.location.href = '/';
              } else {
                window.location.reload();
              }
            } else {
              message.error('请先选择一个用户');
            }
          }}
          confirmLoading={loadingLoginAnyone}
        >
          <Input
            addonAfter={
              <span style={{ cursor: 'pointer' }} onClick={() => tableRef.current?.reloadAndRest()}>
                搜索
              </span>
            }
            value={searchKeyword}
            onChange={(e) => setSearchKeyword(e.target.value)}
            onPressEnter={() => tableRef.current?.reloadAndRest()}
            style={{ marginBottom: 10 }}
            allowClear
          />
          <ProTable
            actionRef={tableRef}
            columns={columns}
            size={'small'}
            request={async (params, sort, filter) => {
              const result = await loginAnyoneSearch({
                ...Tools.handleParams(params),
              });
              return {
                data: result.data.data,
                total: result.data.total,
                success: result.success,
              };
            }}
            rowKey="id"
            search={false}
            toolBarRender={false}
            rowSelection={{
              hideSelectAll: true,
              selectedRowKeys: selectedRowKeys,
              onSelect: async (row, selected) => {
                if (selected) {
                  setSelectedRowKeys([row.id]);
                } else {
                  setSelectedRowKeys([]);
                }
              },
            }}
            pagination={{
              pageSize: 5,
            }}
            tableAlertRender={false}
          />
        </Modal>
      </div>
    );
  } else {
    return null;
  }
}
