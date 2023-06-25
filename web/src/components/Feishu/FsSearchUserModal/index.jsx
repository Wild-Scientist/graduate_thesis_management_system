import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Button, Modal, Grid, Row, Col, Input, Select, Table, Avatar, message } from 'antd';
import { searchFsUsers } from '@/services/feishu';
import styles from './index.less';
import { ProTable } from '@ant-design/pro-table';
import { MinusCircleTwoTone } from '@ant-design/icons';

export default function FsSearchUserModal(props) {
  const screens = Grid.useBreakpoint();

  const maxCount = props.maxCount;
  const visible = props.visible ?? false;
  const height = screens.xs ? '35vh' : props.height ?? 420;
  const onCancel = props.onCancel ?? (() => console.log('cancel.'));
  const onSubmit = props.onSubmit ?? (() => console.log('submit.'));
  const beforeSubmit = props.beforeSubmit ?? (() => console.log('beforeSubmit.'));
  const initialSelectedFsUsers = useMemo(() => props.initialSelectedFsUsers ?? [], [props]);
  const title = props.title ?? '搜索飞书用户';

  useEffect(() => {
    if (initialSelectedFsUsers.length) {
      setSelectedFsUsers(initialSelectedFsUsers);
    }
  }, [initialSelectedFsUsers]);

  const defaultSearchType = 'name';
  const [searchType, setSearchType] = useState(defaultSearchType);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [selectedFsUsers, setSelectedFsUsers] = useState(initialSelectedFsUsers);
  const tableRef = useRef();
  const columns = [
    {
      title: '头像',
      dataIndex: ['fs_avatar'],
      render: (text) => <Avatar src={text} />,
    },
    {
      title: '姓名',
      dataIndex: 'name',
    },
    {
      title: '部门',
      dataIndex: 'fs_departments',
      render: (text) => text.map((d) => d.name).join('、'),
    },
    {
      title: '工资号/学号',
      render: (_, record) => record.payroll_number ?? record.student_number ?? '-',
    },
  ];

  return (
    <Modal
      className={styles.modal}
      title={title}
      open={visible}
      onCancel={onCancel}
      footer={false}
      destroyOnClose
      centered
      width={1200}
    >
      <div className={styles.container}>
        <div className={styles.main}>
          <Row>
            <Col xs={24} sm={12}>
              <div className={styles.block} style={{ height }}>
                <Input
                  addonBefore={
                    <Select
                      defaultValue={defaultSearchType}
                      onSelect={(v) => setSearchType(v)}
                      style={{ width: 140 }}
                    >
                      <Select.Option value="name">按姓名</Select.Option>
                      <Select.Option value="number">按工资号/学号</Select.Option>
                    </Select>
                  }
                  addonAfter={
                    <span
                      style={{ cursor: 'pointer' }}
                      onClick={() => tableRef.current?.reloadAndRest()}
                    >
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
                    if (searchKeyword) {
                      const _params = { page: params.current, page_size: 5 };
                      _params[searchType] = searchKeyword;
                      const result = await searchFsUsers(_params);
                      return {
                        data: result.data.users.map((u) => parseDataCenterUser(u)),
                        success: result.success,
                        total: result.data.total,
                      };
                    } else {
                      return { data: [], success: true, total: 0 };
                    }
                  }}
                  rowKey="fs_user_id"
                  toolBarRender={false}
                  search={false}
                  pagination={{ showSizeChanger: false }}
                  rowSelection={{
                    hideSelectAll: true,
                    selectedRowKeys: selectedFsUsers.map((u) => u.fs_user_id),
                    onSelect: async (row, selected) => {
                      if (selected && maxCount && selectedFsUsers.length >= maxCount) {
                        message.error(`最多选择${maxCount}个`);
                        return;
                      }
                      let _selectedFsUsers = [...selectedFsUsers];
                      if (selected) {
                        _selectedFsUsers.push(row);
                      } else {
                        _selectedFsUsers = _selectedFsUsers.filter(
                          (u) => u.fs_user_id !== row.fs_user_id,
                        );
                      }
                      setSelectedFsUsers(_selectedFsUsers);
                    },
                  }}
                  tableAlertRender={false}
                />
              </div>
            </Col>
            <Col xs={24} sm={12}>
              <div className={styles.block} style={{ height }}>
                <p style={{ height: 28, lineHeight: '28px', textAlign: 'center' }}>已选择</p>
                <Table
                  size={'small'}
                  rowKey={'fs_user_id'}
                  dataSource={selectedFsUsers}
                  columns={[
                    {
                      render: (_, record) => (
                        <MinusCircleTwoTone
                          onClick={() => {
                            let _selectedFsUsers = [...selectedFsUsers];
                            setSelectedFsUsers(
                              _selectedFsUsers.filter((u) => u.fs_user_id !== record.fs_user_id),
                            );
                          }}
                          style={{ cursor: 'pointer' }}
                        />
                      ),
                    },
                    ...columns,
                  ]}
                  pagination={false}
                />
              </div>
            </Col>
          </Row>
        </div>
        <div className={styles.submit}>
          <Button
            type={'primary'}
            onClick={async () => {
              if ((await beforeSubmit(selectedFsUsers)) === false) {
                return;
              }
              setSearchType(defaultSearchType);
              setSearchKeyword('');
              setSelectedFsUsers([]);
              onSubmit(selectedFsUsers);
            }}
          >
            确定
          </Button>
        </div>
      </div>
    </Modal>
  );

  /**
   * 解析数据中心接口返回的用户
   * @param dataCenterUser
   * @returns {{}}
   */
  function parseDataCenterUser(dataCenterUser) {
    return {
      fs_user_id: dataCenterUser.user_id,
      name: dataCenterUser.name,
      fs_avatar: dataCenterUser.avatar.avatar_240,
      payroll_number: dataCenterUser.custom_attrs.payroll_number,
      student_number: dataCenterUser.custom_attrs.student_number,
      fs_departments: dataCenterUser.departments,
    };
  }
}
