import React, { useEffect } from 'react';
import { ProFormSelect, ProForm, ProFormText } from '@ant-design/pro-form';
import { Alert, Form } from 'antd';
import WangEditor from '@/components/WangEditor';
import semver from 'semver';

const UpdateVersionForm = (props) => {
  const versionValidator = (_, value) => {
    if (!value || semver.valid(value)) {
      return Promise.resolve();
    } else {
      return Promise.reject('格式错误，格式应为 0.0.0');
    }
  };
  return (
    <ProForm
      onFinish={props.onSubmit}
      submitter={{ searchConfig: { resetText: '取消' } }}
      onReset={props.onCancel}
      initialValues={props.values}
    >
      <ProFormText
        label="版本号"
        name="version"
        rules={[{ required: true, message: '请输入版本号' }, { validator: versionValidator }]}
      />
      <Form.Item
        label="更新内容"
        name="content"
        rules={[{ required: true, message: '请输入更新内容' }]}
      >
        <WangEditor />
      </Form.Item>
      {props.values ? (
        <Form.Item>
          <Alert message="注意：编辑操作对已经查看过更新内容的用户无效！" type="warning" />
        </Form.Item>
      ) : null}
    </ProForm>
  );
};

export default UpdateVersionForm;
