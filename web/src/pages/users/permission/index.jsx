import React, { useEffect, useRef, useState } from 'react';
import { GridContent, PageContainer } from '@ant-design/pro-layout';
import { roles, updateRole, fetchPermissions } from './service';
import { Button, Drawer, message, Space, Spin, Tag, Tooltip } from 'antd';
import ProTable from '@ant-design/pro-table';
import UpdateRoleForm from './components/UpdateRoleForm';
import ProDescriptions from '@ant-design/pro-descriptions';
import { useRequest } from 'umi';
import CONST from '@/const';
import Tools from '@/tools';
import { ExclamationCircleOutlined } from '@ant-design/icons';

const TableList = () => {
  // table
  const actionRef = useRef();
  const [currentRow, setCurrentRow] = useState();
  const [showDetail, setShowDetail] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [drawerVisible, setDrawerVisible] = useState(false);
  useEffect(() => {
    if (!drawerVisible) {
      setCurrentRow(undefined);
      setShowDetail(false);
      setShowEdit(false);
    }
  }, [drawerVisible]);
  const columns = [
    {
      title: '角色编号',
      dataIndex: 'id',
    },
    {
      title: '角色名称',
      dataIndex: 'name',
      render: (text, record) => (
        <Space>
          <span>{text}</span>
          {record.id === CONST.ROLE_CODE_USER && (
            <Tooltip title={'新用户注册时，会默认设置该角色'}>
              <Tag color="cyan" icon={<ExclamationCircleOutlined />}>
                默认角色
              </Tag>
            </Tooltip>
          )}
        </Space>
      ),
    },
    {
      title: '角色权限',
      dataIndex: 'permissions',
      render: (text) => text.map((p) => p.name).join('、'),
    },
    {
      title: '创建时间',
      dataIndex: 'created_at',
      sorter: true,
    },
    {
      title: '更新时间',
      dataIndex: 'updated_at',
      sorter: true,
    },
    {
      title: '操作',
      dataIndex: 'option',
      valueType: 'option',
      render: (_, record) => (
        <Space>
          <a
            onClick={() => {
              setCurrentRow(record);
              setShowDetail(true);
              setDrawerVisible(true);
            }}
          >
            查看
          </a>
          {record.id !== CONST.ROLE_CODE_SUPER && (
            <a
              key={'edit'}
              onClick={() => {
                setCurrentRow(record);
                setShowEdit(true);
                setDrawerVisible(true);
              }}
            >
              编辑
            </a>
          )}
        </Space>
      ),
    },
  ];

  // 获取权限列表
  const [permissions, setPermissions] = useState();
  const { run: runFetchPermissions, loading: loadingFetchPermissions } = useRequest(
    () => {
      return fetchPermissions();
    },
    {
      manual: true,
      onSuccess: async (data) => {
        setPermissions(data);
      },
    },
  );

  useEffect(() => {
    runFetchPermissions();
  }, []);

  // render
  return (
    <PageContainer>
      <GridContent>
        <ProTable
          actionRef={actionRef}
          rowKey="id"
          request={async (params, sort, filter) => {
            const result = await roles({
              ...Tools.handleParams(params),
              ...Tools.handleSort(sort),
            });
            return {
              data: result.data.data,
              success: result.success,
              total: result.data.total,
            };
          }}
          columns={columns}
          search={false}
          options={{ search: true }}
          toolBarRender={() => [
            <Button
              type="primary"
              onClick={() => {
                setDrawerVisible(true);
                setShowEdit(true);
              }}
            >
              新增角色
            </Button>,
          ]}
        />
        <Drawer
          width={Math.min(document.documentElement.clientWidth * 0.8, 1000)}
          open={drawerVisible}
          onClose={() => setDrawerVisible(false)}
        >
          <Spin spinning={loadingFetchPermissions}>
            {showEdit ? (
              <UpdateRoleForm
                width={Math.min(document.documentElement.clientWidth * 0.8, 1000)}
                onSubmit={async (value) => {
                  await updateRole({
                    id: currentRow?.id,
                    ...value,
                  });
                  message.success('保存成功');
                  setDrawerVisible(false);
                  actionRef.current?.reload();
                }}
                onCancel={() => setDrawerVisible(false)}
                values={currentRow}
                permissions={permissions}
              />
            ) : showDetail ? (
              <ProDescriptions
                column={1}
                request={async () => ({
                  data: currentRow || {},
                })}
                columns={columns}
              />
            ) : null}
          </Spin>
        </Drawer>
      </GridContent>
    </PageContainer>
  );
};

export default TableList;
