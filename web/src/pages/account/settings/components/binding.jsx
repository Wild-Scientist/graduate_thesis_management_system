import { AlipayOutlined, DingdingOutlined, TaobaoOutlined } from '@ant-design/icons';
import { List } from 'antd';
import React, { Fragment } from 'react';

const BindingView = () => {
  const getData = () => [
    {
      title: '绑定飞书',
      description: '当前未绑定飞书账号',
      actions: [<a key="Bind">绑定</a>],
      avatar: <img src={'/feishu.svg'} style={{ width: 50 }} />,
    },
    {
      title: '绑定微信',
      description: '当前未绑定微信账号',
      actions: [<a key="Bind">绑定</a>],
      avatar: <img src={'/weixin.svg'} style={{ width: 50 }} />,
    },
  ];

  return (
    <Fragment>
      <List
        itemLayout="horizontal"
        dataSource={getData()}
        renderItem={(item) => (
          <List.Item actions={item.actions}>
            <List.Item.Meta
              avatar={item.avatar}
              title={item.title}
              description={item.description}
            />
          </List.Item>
        )}
      />
    </Fragment>
  );
};

export default BindingView;
