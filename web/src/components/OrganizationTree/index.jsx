import { useRequest } from 'umi';
import React, { useEffect, useRef, useState } from 'react';
import styles from './index.less';
import { Button, Dropdown, Empty, Menu, message, Modal, Skeleton, Tree } from 'antd';
import {
  DeleteOutlined,
  EditOutlined,
  EllipsisOutlined,
  ExclamationCircleOutlined,
  PlusOutlined,
} from '@ant-design/icons';
import { deleteDepartment, departments, updateDepartment } from './service';
import UpdateDepartmentForm from './UpdateDepartmentForm';
import defaultSettings from '../../../config/defaultSettings';

export default function OrganizationTree(props) {
  const editable = props.editable ?? false;
  const onSelect = props.onSelect ?? (() => null);
  // 部门树
  const [treeData, setTreeData] = useState();
  const onLoadData = ({ key, children }) =>
    new Promise(async (resolve) => {
      if (children) {
        resolve();
        return;
      }
      const res = await departments({ department_id: key });
      setTreeData((origin) => updateTreeData(origin, key, dealTreeNodesData(res.data)));
      resolve();
    });
  const [departmentModalData, setDepartmentModalData] = useState();
  const departmentForm = useRef();

  // 获取部门
  const { run: runDepartments, loading: loadingDepartments } = useRequest(
    () => {
      return departments();
    },
    {
      onSuccess: (data) => setTreeData(dealTreeNodesData(data)),
    },
  );
  // 编辑部门
  const { run: runUpdateDepartment, loading: loadingUpdateDepartment } = useRequest(
    (department) => {
      return updateDepartment(department);
    },
    {
      manual: true,
      onSuccess: async () => {
        message.success('添加成功');
        setDepartmentModalData(null);
        departmentForm.current?.resetFields();
        runDepartments();
      },
    },
  );
  // 删除部门
  const { run: runDeleteDepartment, loading: loadingDeleteDepartment } = useRequest(
    (id) => {
      return deleteDepartment(id);
    },
    {
      manual: true,
      onSuccess: async () => {
        message.success('删除成功');
        runDepartments();
      },
    },
  );

  return (
    <div className={styles.treeContainer}>
      {loadingDepartments ? (
        <Skeleton active />
      ) : treeData && treeData?.length ? (
        <Tree
          blockNode
          // draggable={editable}
          selectable
          showLine={{ showLeafIcon: false }}
          fieldNames={{ title: 'name', key: 'id' }}
          titleRender={(nodeData) => {
            let items = [
              {
                label: '添加子部门',
                key: 'add',
                icon: <PlusOutlined className={styles.themeIcon} />,
              },
            ];
            if (nodeData.parent_id !== 0) {
              items = items.concat([
                {
                  label: '编辑部门',
                  key: 'edit',
                  icon: <EditOutlined className={styles.themeIcon} />,
                },
                {
                  label: '删除部门',
                  key: 'delete',
                  icon: <DeleteOutlined className={styles.deleteIcon} />,
                },
              ]);
            }
            return (
              <div className={styles.treeNode}>
                <span className={styles.name}>
                  {nodeData.parent_id === 0 ? defaultSettings.title : nodeData.name}
                </span>
                {editable && (
                  <div className={styles.buttons} onClick={(e) => e.stopPropagation()}>
                    <Dropdown
                      overlay={
                        <Menu
                          items={items}
                          onClick={(e) => {
                            const { key } = e;
                            if (key === 'add') {
                              setDepartmentModalData({ parent_id: nodeData.id });
                            } else if (key === 'edit') {
                              setDepartmentModalData(nodeData);
                            } else if (key === 'delete') {
                              Modal.confirm({
                                title: '确定删除该部门吗',
                                icon: <ExclamationCircleOutlined />,
                                okType: 'danger',
                                onOk() {
                                  return new Promise(async (resolve, reject) => {
                                    try {
                                      await runDeleteDepartment(nodeData.id);
                                      resolve();
                                    } catch (e) {
                                      reject();
                                    }
                                  });
                                },
                              });
                            }
                          }}
                        />
                      }
                    >
                      <Button icon={<EllipsisOutlined />} type={'text'} size={'small'} />
                    </Dropdown>
                  </div>
                )}
              </div>
            );
          }}
          onSelect={onSelect}
          checkStrictly
          loadData={onLoadData}
          treeData={treeData}
        />
      ) : (
        <Empty />
      )}
      <Modal
        title={departmentModalData?.id ? '编辑部门' : '添加部门'}
        open={!!departmentModalData}
        onCancel={() => setDepartmentModalData(undefined)}
        onOk={() => departmentForm.current?.submit()}
        confirmLoading={loadingUpdateDepartment}
        destroyOnClose
      >
        <UpdateDepartmentForm
          formRef={departmentForm}
          onFinish={(values) => runUpdateDepartment(values)}
          initialValues={departmentModalData}
        />
      </Modal>
    </div>
  );

  function updateTreeData(list, key, children) {
    return list.map((node) => {
      if (node.id === key) {
        return {
          ...node,
          children,
        };
      }
      if (node.children) {
        return {
          ...node,
          children: updateTreeData(node.children, key, children),
        };
      }
      return node;
    });
  }

  function dealTreeNodesData(nodes) {
    return nodes.map((node) => {
      node.isLeaf = node['is_leaf'];
      node.selectable = node.isLeaf;
      return node;
    });
  }
}
