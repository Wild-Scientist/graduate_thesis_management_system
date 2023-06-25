import React, { useEffect, useRef, useState } from 'react';
import { GridContent, PageContainer } from '@ant-design/pro-layout';
import { ProTable } from '@ant-design/pro-table';
import { getProjects, pass, updateProject, withdraw, reject, fail } from '@/pages/startup/service';
import Tools from '@/tools';
import { Button, Drawer, Modal, message, Popconfirm, Avatar, Space } from 'antd';
import { ExclamationCircleOutlined } from '@ant-design/icons';
import UpdateEvaluationForm from '@/pages/startup/details/UpdateEvaluationForm';
import { useAccess, useModel } from 'umi';
import CONST from '@/const';
import ReadText from './read-text';
import styles from './index.less';
import ProjectDetail from '@/pages/startup/details/ProjectDetail';
import tool from '@/tools';
import {
  isPassDisable,
  userCanPass,
  userCanSeePass,
  isWithdrawDisabled,
  isEditDisable,
  userCanSeeEdit,
} from '@/pages/startup/permissions';

const TableList = () => {
  const pageType = window.location.pathname.split('/')[2];
  const { initialState } = useModel('@@initialState');
  const { currentUser } = initialState || {};
  const access = useAccess();

  const [isUpdate, setIsUpdate] = useState();
  const [currentRow, setCurrentRow] = useState();
  const [showDetail, setShowDetail] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [showRead, setShowRead] = useState(false);
  const [readDone, setReadDone] = useState(false);
  const [drawerVisible, setDrawerVisible] = useState(false);
  useEffect(() => {
    if (!drawerVisible) {
      setCurrentRow(undefined);
      setShowDetail(false);
      setShowEdit(false);
      setShowRead(false);
      setReadDone(false);
      actionRef.current?.reload();
    }
  }, [drawerVisible]);
  const handleShowDetail = (record) => {
    setCurrentRow(record);
    setShowDetail(true);
    setDrawerVisible(true);
  };
  const handleShowRead = () => {
    setDrawerVisible(true);
    setShowRead(true);
  };
  const handleShowCreate = () => {
    setShowRead(false);
    setReadDone(false);
    setShowEdit(true);
    setIsUpdate(false);
  };
  const handleShowEdit = (record) => {
    setCurrentRow(record);
    setShowEdit(true);
    setDrawerVisible(true);
    setIsUpdate(true);
  };
  const handleCloseDrawer = () => {
    if (showEdit) {
      Modal.confirm({
        title: '确定关闭吗？',
        icon: <ExclamationCircleOutlined />,
        content: '关闭后，表单中的改动不会被保存',
        okText: '关闭',
        cancelText: '继续填写',
        onOk() {
          setDrawerVisible(false);
        },
      });
    } else {
      setDrawerVisible(false);
    }
  };
  const updateReadDone = (e) => {
    if (e.target.scrollHeight - e.target.scrollTop - e.target.clientHeight < 5) {
      setReadDone(true);
    }
  };
  // table
  const actionRef = useRef();

  const columns = [
    {
      title: '编号',
      dataIndex: 'id',
    },
    {
      title: '标题',
      dataIndex: 'title',
      render: (text, record) => <a onClick={() => handleShowDetail(record)}>{text}</a>,
    },
    {
      title: '发起人',
      dataIndex: ['user', 'name'],
      render: (text, record) => (
        <Space>
          <Avatar></Avatar>
          <span>{text}</span>
        </Space>
      ),
    },
    // {
    //   title: '发起人所属单位',
    //   dataIndex: ['fs_department', 'name'],
    // },
    // {
    //   title: '类别',
    //   dataIndex: 'type',
    // },
    {
      title: '状态',
      dataIndex: 'status',
      render: (text, record) => {
        if (record.failed === 1) return '项目不通过';
        let i = tool.getStatusIndex(text, CONST.PROJECT_START_UP_FLOW);
        return CONST.PROJECT_START_UP_FLOW[i]?.['label'];
      },
    },
    {
      title: '发起时间',
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
        <>
          <Button type={'link'} onClick={() => handleShowDetail(record)}>
            详情
          </Button>
          {userCanSeeEdit(pageType) && (
            <Button
              type={'link'}
              onClick={() => handleShowEdit(record)}
              disabled={isEditDisable(record)}
            >
              编辑
            </Button>
          )}
          {
            <Popconfirm
              title="确定撤销该申请？"
              onConfirm={async () => {
                await withdraw({
                  id: record.id,
                });
                message.success('已撤销');
                actionRef.current?.reload();
              }}
              disabled={isWithdrawDisabled(currentUser, record)}
            >
              <Button
                type={'link'}
                style={{
                  color: isWithdrawDisabled(currentUser, record)
                    ? 'rgba(0, 0, 0, 0.25)'
                    : '#ffec3d',
                }}
                disabled={isWithdrawDisabled(currentUser, record)}
              >
                撤销
              </Button>
            </Popconfirm>
          }
          {userCanSeePass(currentUser, record) && (
            <Popconfirm
              title="确定通过该申请？"
              onConfirm={async () => {
                await pass({ id: record.id });
                message.success('已通过该申请');
                actionRef.current?.reload();
              }}
              disabled={isPassDisable(currentUser, record)}
            >
              <Button type={'link'} disabled={isPassDisable(currentUser, record)}>
                通过
              </Button>
            </Popconfirm>
          )}
          {userCanSeePass(currentUser, record) && (
            <Popconfirm
              title="确定退回该申请？"
              onConfirm={async () => {
                await reject({
                  id: record.id,
                });
                message.success('已退回');
                actionRef.current?.reload();
              }}
              disabled={isPassDisable(currentUser, record)}
            >
              <Button type={'link'} danger={true} disabled={isPassDisable(currentUser, record)}>
                退回
              </Button>
            </Popconfirm>
          )}
          {userCanSeePass(currentUser, record) && (
            <Popconfirm
              title="确定不通过该申请？"
              onConfirm={async () => {
                await fail({
                  id: record.id,
                });
                message.success('已不通过该申请');
                actionRef.current?.reload();
              }}
              disabled={isPassDisable(currentUser, record)}
            >
              <Button type={'link'} danger={true} disabled={isPassDisable(currentUser, record)}>
                不通过
              </Button>
            </Popconfirm>
          )}
        </>
      ),
    },
  ];

  // render
  return (
    <PageContainer>
      <GridContent>
        <ProTable
          actionRef={actionRef}
          rowKey="id"
          request={async (params, sort, filter) => {
            const result = await getProjects({
              ...Tools.handleParams(params),
              // ...Tools.handleFilter(filter),
              ...Tools.handleSort(sort),
              page_type: pageType,
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
            <>
              {pageType === 'my_projects' && (
                <Button type="primary" onClick={handleShowRead}>
                  立项申请
                </Button>
              )}
            </>
          )}
        />
        <Drawer
          width={Math.min(document.documentElement.clientWidth * 0.9, 1500)}
          open={drawerVisible}
          onClose={handleCloseDrawer}
        >
          {showRead ? (
            <>
              <div
                className={styles.readText}
                onScroll={updateReadDone}
                onMouseOver={updateReadDone}
              >
                <ReadText />
              </div>
              <div style={{ textAlign: 'center' }}>
                <Button type={'primary'} disabled={!readDone} onClick={handleShowCreate}>
                  下一步
                </Button>
              </div>
            </>
          ) : showEdit ? (
            <UpdateEvaluationForm
              onFinish={async (values) => {
                // 提交
                let form = {
                  id: currentRow?.id,
                  ...values,
                  page_type: pageType,
                };
                await updateProject(form);
                message.success('保存成功');
                setDrawerVisible(false);
              }}
              isUpdate={isUpdate}
              onCancel={handleCloseDrawer}
              values={currentRow}
            />
          ) : showDetail ? (
            <ProjectDetail values={currentRow} onFinish={() => setDrawerVisible(false)} />
          ) : null}
        </Drawer>
      </GridContent>
    </PageContainer>
  );
};
export default TableList;
