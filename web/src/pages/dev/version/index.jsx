import React, { useEffect, useRef, useState } from 'react';
import { GridContent, PageContainer } from '@ant-design/pro-layout';
import { versions, updateVersion } from './service';
import { Button, Drawer, message, Space, Spin } from 'antd';
import ProTable from '@ant-design/pro-table';
import UpdateVersionForm from './components/UpdateVersionForm';
import ProDescriptions from '@ant-design/pro-descriptions';
import Tools from '@/tools';

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
      title: '版本号',
      dataIndex: 'version',
    },
    {
      title: '摘要',
      dataIndex: 'abstract',
      hideInDescriptions: true,
    },
    {
      title: '内容',
      dataIndex: 'content',
      hideInTable: true,
      render: (text) => <div dangerouslySetInnerHTML={{ __html: text }} />,
    },
    {
      title: '发送时间',
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
        </Space>
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
            const result = await versions({
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
              key="new"
              type="primary"
              onClick={() => {
                setDrawerVisible(true);
                setShowEdit(true);
              }}
            >
              新增版本
            </Button>,
          ]}
        />
        <Drawer
          width={Math.min(document.documentElement.clientWidth * 0.8, 1000)}
          open={drawerVisible}
          onClose={() => setDrawerVisible(false)}
        >
          {showEdit ? (
            <UpdateVersionForm
              width={Math.min(document.documentElement.clientWidth * 0.8, 1000)}
              onSubmit={async (value) => {
                await updateVersion({
                  id: currentRow?.id,
                  ...value,
                });
                message.success('保存成功');
                setDrawerVisible(false);
                actionRef.current?.reload();
              }}
              onCancel={() => setDrawerVisible(false)}
              values={currentRow}
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
        </Drawer>
      </GridContent>
    </PageContainer>
  );
};

export default TableList;
