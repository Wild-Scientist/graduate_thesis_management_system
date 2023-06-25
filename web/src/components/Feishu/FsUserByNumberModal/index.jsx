import React, { useRef, useState } from 'react';
import { Button, Modal, Grid, Form, Input, Row, Col, Avatar, message, Space } from 'antd';
import { ProForm, ProFormSelect, ProFormText } from '@ant-design/pro-form';
import { useRequest } from 'umi';
import { syncFsUserData } from '@/services/feishu';

export default function FsUserByNumberModal(props) {
  const screens = Grid.useBreakpoint();

  const visible = props.visible ?? false;
  const onCancel = props.onCancel ?? (() => console.log('cancel.'));
  const onSubmit = props.onSubmit ?? (() => console.log('submit.'));

  const [fsUserData, setFsUserData] = useState();
  const { run: runSyncFsUserData, loading: loadingSyncFsUserData } = useRequest(
    (number) => syncFsUserData(number),
    { manual: true, onSuccess: (data) => setFsUserData(data) },
  );

  return (
    <Modal title={'查询飞书用户'} open={visible} onCancel={onCancel} footer={false} destroyOnClose>
      <div style={{ display: 'flex', justifyContent: 'center', marginTop: 20 }}>
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
                      查询
                    </Button>
                  }
                />
              </Form.Item>
            )}
          </Form.Item>
        </Form>
      </div>
      {fsUserData ? (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20 }}>
          <Space>
            <Avatar src={fsUserData?.fs_avatar?.avatar_240} />
            <span>{fsUserData.name}</span>
          </Space>
          <div>
            <Button type={'primary'} onClick={() => onSubmit(fsUserData)}>
              确定
            </Button>
          </div>
        </div>
      ) : null}
    </Modal>
  );
}
