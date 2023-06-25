import { useRequest } from 'umi';
import { message, Drawer, Avatar, Row, Col, Space, Button, Form, Input, Grid } from 'antd';
import React, { useState, useRef, useEffect } from 'react';
import { GridContent, PageContainer } from '@ant-design/pro-layout';
import ProTable from '@ant-design/pro-table';
import ProDescriptions from '@ant-design/pro-descriptions';
import UpdateUserForm from './components/UpdateUserForm';
import { users, updateUser, importFsUser, updateUserFsData } from './service';
import { syncFsUserData } from '@/services/feishu';
import OrganizationTree from '@/components/OrganizationTree';
import { fetchOptionsRoles } from '@/services/options';
import Tools from '@/tools';
import { ProForm, ProFormSelect, ProFormText } from '@ant-design/pro-form';
import CONST from '@/const';

const TableList = () => {
  /**
   * States
   */
  // 部门树
  const [selectedNode, setSelectedNode] = useState(null);
  // 同步飞书用户信息
  const [fsUserData, setFsUserData] = useState();
  // 当前选中行（查看详情、编辑）
  const [currentRow, setCurrentRow] = useState();
  // 抽屉类型（detail-详情、edit-编辑、import-导入飞书用户）
  const [drawerType, setDrawerType] = useState();

  /**
   * Refs
   */
  // 导入飞书用户表单
  const importFsUserForm = useRef();
  // 用户详情
  const descriptionsRef = useRef();
  // 表格
  const actionRef = useRef();

  /**
   * Effects
   */
  // 部门树
  useEffect(() => {
    actionRef.current?.reload();
  }, [selectedNode]);
  // 同步飞书用户信息
  useEffect(() => importFsUserForm.current?.setFieldsValue(fsUserData), [fsUserData]);
  // 抽屉类型
  useEffect(() => {
    // 抽屉关闭后清空抽屉中数据、刷新列表
    if (!drawerType) {
      setCurrentRow(undefined);
      setFsUserData(null);
      actionRef.current?.reload();
    }
  }, [drawerType]);
  // 当前选中行
  useEffect(() => {
    descriptionsRef.current?.reload();
  }, [currentRow]);

  /**
   * Requests
   */
  // 获取选项：角色列表
  const { data: optionsRoles } = useRequest(() => fetchOptionsRoles());
  // 同步飞书用户信息
  const { run: runSyncFsUserData, loading: loadingSyncFsUserData } = useRequest(
    (number) => syncFsUserData(number),
    { manual: true, onSuccess: (data) => setFsUserData(data) },
  );
  // 导入飞书用户
  const { run: runImportFsUser, loading: loadingImportFsUser } = useRequest(
    (data) => importFsUser(data),
    {
      manual: true,
      onSuccess: async () => {
        message.success('导入成功');
        setFsUserData(null);
      },
    },
  );
  // 更新用户飞书信息
  const { run: runUpdateUserFsData, loading: loadingUpdateUserFsData } = useRequest(
    updateUserFsData,
    {
      manual: true,
      onSuccess: async (data) => {
        setCurrentRow(data);
        message.success('更新成功');
      },
    },
  );

  /**
   * Functions
   */
  // 查看详情
  const handleShowDetail = (record) => {
    setCurrentRow(record);
    setDrawerType('detail');
  };
  // 编辑用户
  const handleShowEdit = (record) => {
    setCurrentRow(record);
    setDrawerType('edit');
  };

  /**
   * Const
   */
  // 栅格
  const screens = Grid.useBreakpoint();
  // Table columns
  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
    },
    {
      title: '头像',
      dataIndex: 'avatar',
      render: (text, item) => {
        return <Avatar src={Tools.getAvatarURL(item)} />;
      },
    },
    ...(CONST.IS_FS_PRO
      ? [
          {
            title: '姓名',
            dataIndex: 'name',
            render: (text, record) => <a onClick={() => handleShowDetail(record)}>{text}</a>,
            hideInDescriptions: true,
          },
        ]
      : [
          {
            title: '用户名',
            dataIndex: 'username',
            render: (text, record) => <a onClick={() => handleShowDetail(record)}>{text}</a>,
            hideInDescriptions: true,
          },
          {
            title: '用户名',
            dataIndex: 'username',
            hideInTable: true,
          },
        ]),
    {
      title: '姓名',
      dataIndex: 'name',
      hideInTable: true,
    },
    {
      title: '角色',
      dataIndex: 'role_ids',
      filters: true,
      valueEnum: optionsRoles?.valueEnum,
    },
    {
      title: '手机号',
      dataIndex: 'phone',
      hideInTable: CONST.IS_FS_PRO,
    },
    ...(CONST.IS_FS_PRO
      ? []
      : [
          {
            title: '邮箱',
            dataIndex: 'email',
            hideInTable: true,
          },
          {
            title: '签名',
            dataIndex: 'signature',
            hideInTable: true,
          },
          {
            title: '头衔',
            dataIndex: 'title',
            hideInTable: true,
          },
          {
            title: '国家',
            dataIndex: 'country',
            hideInTable: true,
          },
          {
            title: '地址',
            dataIndex: 'address',
            hideInTable: true,
          },
        ]),
    {
      title: '飞书 userId',
      dataIndex: 'fs_user_id',
      hideInTable: true,
    },
    {
      title: '飞书部门',
      dataIndex: 'fs_departments',
      render: (text) => text.map((item) => item.name_path).join('、'),
      hideInTable: !CONST.IS_FS_PRO,
    },
    {
      title: '注册时间',
      dataIndex: 'created_at',
      sorter: true,
    },
    {
      title: '活跃时间',
      dataIndex: 'updated_at',
      sorter: true,
    },
    {
      title: '操作',
      dataIndex: 'option',
      valueType: 'option',
      render: (_, record) => (
        <Space>
          <a onClick={() => handleShowDetail(record)}>查看</a>
          <a onClick={() => handleShowEdit(record)}>编辑</a>
        </Space>
      ),
    },
  ];

  /**
   * Render
   */
  return (
    <PageContainer>
      <GridContent>
        <Row gutter={screens.xs ? 0 : 24}>
          {/*纯飞书项目不需要机构树*/}
          {!CONST.IS_FS_PRO && (
            <Col xs={24} md={24} lg={5}>
              <div style={{ width: '100%', marginBottom: screens.lg ? 0 : 20 }}>
                <OrganizationTree
                  editable
                  onSelect={(selectedNodeKeys, e) => {
                    if (e.selected) {
                      setSelectedNode(e.node);
                    } else {
                      setSelectedNode(null);
                    }
                  }}
                />
              </div>
            </Col>
          )}
          <Col xs={24} md={24} lg={CONST.IS_FS_PRO ? 24 : 19}>
            <ProTable
              actionRef={actionRef}
              rowKey="id"
              request={async (params, sort, filter) => {
                const result = await users({
                  ...Tools.handleParams(params),
                  ...Tools.handleFilter(filter),
                  ...Tools.handleSort(sort),
                  department_id: selectedNode?.id,
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
              toolBarRender={() => (
                <Space>
                  <Button
                    type="primary"
                    onClick={() => {
                      if (CONST.IS_FS_PRO) {
                        setDrawerType('import');
                      } else {
                        setDrawerType('edit');
                      }
                    }}
                  >
                    新增用户
                  </Button>
                  {!CONST.IS_FS_PRO && (
                    <Button onClick={() => setDrawerType('import')}>导入飞书用户</Button>
                  )}
                </Space>
              )}
            />
          </Col>
        </Row>
      </GridContent>
      <Drawer
        width={Math.min(document.documentElement.clientWidth * 0.8, 1000)}
        open={!!drawerType}
        onClose={() => setDrawerType(undefined)}
        footer={
          drawerType === 'detail' ? (
            <Space>
              <Button type={'primary'} onClick={() => setDrawerType('edit')}>
                编辑
              </Button>
              <Button
                onClick={() => runUpdateUserFsData(currentRow.id)}
                loading={loadingUpdateUserFsData}
              >
                同步用户飞书信息
              </Button>
            </Space>
          ) : null
        }
      >
        {drawerType === 'edit' && (
          <UpdateUserForm
            width={Math.min(document.documentElement.clientWidth * 0.8, 1000)}
            onSubmit={async (value) => {
              await updateUser({
                id: currentRow?.id,
                ...value,
              });
              message.success('保存成功');
              setDrawerType(undefined);
            }}
            onCancel={() => setDrawerType(undefined)}
            values={currentRow}
            optionsRoles={optionsRoles}
          />
        )}
        {drawerType === 'detail' && (
          <ProDescriptions
            column={1}
            request={async () => ({
              data: currentRow || {},
            })}
            columns={columns}
            actionRef={descriptionsRef}
          />
        )}
        {drawerType === 'import' && (
          <>
            <Form>
              <Form.Item noStyle shouldUpdate={(prevValues, curValues) => false}>
                {({ getFieldValue }) => (
                  <Form.Item label={'工资号/学号'} name={'payrollAccount'}>
                    <Input
                      addonAfter={
                        <Button
                          type="text"
                          size={'small'}
                          onClick={() => runSyncFsUserData(getFieldValue('payrollAccount'))}
                          loading={loadingSyncFsUserData}
                        >
                          同步信息
                        </Button>
                      }
                    />
                  </Form.Item>
                )}
              </Form.Item>
            </Form>
            {fsUserData ? (
              <ProForm
                formRef={importFsUserForm}
                submitter={{
                  render: (props) => {
                    return (
                      <Button
                        type="primary"
                        onClick={() => props.form?.submit?.()}
                        loading={loadingImportFsUser}
                      >
                        导入
                      </Button>
                    );
                  },
                }}
                initialValues={{ role_ids: [CONST.ROLE_CODE_USER] }}
                onFinish={(values) => runImportFsUser(values)}
              >
                <Row gutter={16}>
                  <Col span={24}>
                    <div style={{ marginBottom: 20 }}>
                      <p>头像</p>
                      <Avatar src={fsUserData?.fs_avatar?.avatar_240} />
                    </div>
                  </Col>
                  <Col span={12}>
                    <ProFormText label="姓名" name="name" disabled={true} />
                  </Col>
                  <Col span={12}>
                    <ProFormText label="UserID" name="fs_user_id" disabled={true} />
                  </Col>
                  <Col span={12}>
                    <ProFormText
                      label="工资号"
                      name="payroll_number"
                      disabled={true}
                      placeholder={'-'}
                    />
                  </Col>
                  <Col span={12}>
                    <ProFormText
                      label="学号"
                      name="student_number"
                      disabled={true}
                      placeholder={'-'}
                    />
                  </Col>
                  <Col span={24}>
                    <ProFormSelect
                      label="角色"
                      name="role_ids"
                      options={optionsRoles.options}
                      rules={[{ required: true, message: '请选择角色' }]}
                      fieldProps={{ mode: 'multiple' }}
                    />
                  </Col>
                </Row>
              </ProForm>
            ) : null}
          </>
        )}
      </Drawer>
    </PageContainer>
  );
};

export default TableList;
