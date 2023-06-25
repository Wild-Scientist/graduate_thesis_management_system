import React, { useEffect, useState } from 'react';
import { Avatar, Button, Col, List, Row, Tree, Modal, Grid } from 'antd';
import { fs_departments } from './service';
import styles from './index.less';

export default function FsContactsModal(props) {
  const screens = Grid.useBreakpoint();

  const visible = props.visible ?? false;
  const type = props.type ?? 'default';
  const mode = props.mode ?? 'default';
  const height = screens.xs ? '30vh' : props.height ?? 300;
  const onCancel = props.onCancel ?? (() => console.log('cancel.'));
  const onSubmit = props.onSubmit ?? (() => console.log('submit.'));
  const departmentFilter = props.departmentFilter ?? [];
  const userFilter = props.userFilter ?? [];

  const canDepartmentNodeSelect = () => {
    if (mode === 'single') {
      return type !== 'user';
    } else {
      return false;
    }
  };
  const initialTreeData = [
    {
      title: '电子科技大学',
      key: '0',
      uniqueId: '0', // 用于存放点击展开图标，请求数据的标识
      checkable: ['default', 'department'].includes(type),
      selectable: canDepartmentNodeSelect(),
    },
  ];
  const [treeData, setTreeData] = useState(initialTreeData);
  const [checkedNodes, setCheckedNodes] = useState([]);

  const onLoadData = (node) => {
    const { key, children, uniqueId } = node;
    return new Promise((resolve) => {
      if (children) {
        resolve();
        return;
      }
      fs_departments({
        parent_department_id: uniqueId,
        show_user: Number(['default', 'user'].includes(type)),
      }).then((res) => {
        console.log(res);
        let rows = [];
        res.data?.departments.forEach((d) => {
          if (!departmentFilter.includes(d.open_department_id)) {
            const node = {
              title: d.name,
              key: d.open_department_id,
              uniqueId: d.open_department_id,
              checkable: ['default', 'department'].includes(type),
              selectable: canDepartmentNodeSelect(),
              obj: d,
            };
            rows.push(node);
          }
        });
        if (['default', 'user'].includes(type)) {
          res.data?.users.forEach((u) => {
            if (!userFilter.includes(u.user_id)) {
              rows.push({
                title: u.name,
                icon: <img src={u.avatar.avatar_240} alt="" />,
                uniqueId: u.user_id,
                key: u.user_id,
                isLeaf: true,
                obj: u,
              });
            }
          });
        }
        // fix 一个用户相同userId出现多次, 将key变更为唯一值
        rows = rows.map((item, index) => ({ ...item, key: `${key}-${index}` }));
        setTreeData((origin) => updateTreeData(origin, key, rows));
        resolve();
      });
    });
  };

  const handleCheck = (_, e) => {
    setCheckedNodes(e.checkedNodes);
  };

  const handleSelect = (_, e) => {
    if (e.selected) {
      setCheckedNodes([e.node]);
    } else {
      setCheckedNodes([]);
    }
  };

  useEffect(() => {
    if (visible) {
      setTreeData(initialTreeData);
      setCheckedNodes([]);
    }
  }, [visible]);

  return (
    <Modal
      className={styles.modal}
      title={'飞书通讯录'}
      open={visible}
      onCancel={onCancel}
      footer={false}
      width={getWidthByMode(mode)}
      destroyOnClose
      centered
    >
      <Row>
        {(() => {
          const borderStyle = '1px solid #eee';
          switch (mode) {
            case 'default':
              // 多选模式
              return (
                <>
                  <Col
                    xs={24}
                    sm={12}
                    style={{
                      border: '1px solid #eee',
                      height,
                      overflow: 'auto',
                    }}
                  >
                    <Tree
                      checkable
                      showIcon
                      selectable={false}
                      checkStrictly
                      onCheck={handleCheck}
                      loadData={onLoadData}
                      treeData={treeData}
                    />
                  </Col>
                  <Col
                    xs={24}
                    sm={12}
                    style={{
                      border: borderStyle,
                      borderLeft: screens.xs ? borderStyle : 'none',
                      borderTop: screens.xs ? 'none' : borderStyle,
                      padding: 20,
                    }}
                  >
                    <List
                      style={{ height, overflow: 'auto' }}
                      itemLayout="horizontal"
                      dataSource={checkedNodes}
                      renderItem={(item) => (
                        <List.Item>
                          {item.isLeaf ? (
                            <Avatar src={item.obj.avatar.avatar_72} />
                          ) : (
                            <Avatar>部门</Avatar>
                          )}
                          <span>
                            {item.isLeaf ? `${item.obj.user_id} ${item.title}` : item.title}
                          </span>
                        </List.Item>
                      )}
                    />
                  </Col>
                </>
              );
            case 'single':
              // 单选模式
              return (
                <>
                  <Col
                    span={24}
                    style={{
                      border: '1px solid #eee',
                      height,
                      overflow: 'auto',
                    }}
                  >
                    <Tree
                      checkable={false}
                      checkStrictly
                      showIcon
                      onSelect={handleSelect}
                      loadData={onLoadData}
                      treeData={treeData}
                    />
                  </Col>
                </>
              );
          }
        })()}
        <Col span={24} style={{ display: 'flex', justifyContent: 'center', marginTop: 20 }}>
          <Button type={'primary'} onClick={() => onSubmit(checkedNodes)}>
            确定
          </Button>
        </Col>
      </Row>
    </Modal>
  );
}

function updateTreeData(list, key, children) {
  return list.map((node) => {
    if (node.key === key) {
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

function getWidthByMode(mode) {
  switch (mode) {
    case 'default':
      // 多选模式
      return 1000;
    case 'single':
      // 单选模式
      return 500;
    default:
      return 520;
  }
}
