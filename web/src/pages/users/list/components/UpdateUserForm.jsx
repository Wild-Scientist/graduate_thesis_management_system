import React from 'react';
import { ProFormSelect, ProForm, ProFormText } from '@ant-design/pro-form';

const UpdateUserForm = (props) => {
  return (
    <ProForm
      onFinish={props.onSubmit}
      submitter={{ searchConfig: { resetText: '取消' } }}
      onReset={props.onCancel}
      initialValues={props.values}
    >
      <ProFormText label="用户名" name="username" disabled={props.values} />
      <ProFormText
        label="手机号"
        name="phone"
        rules={[{ required: true, message: '请输入手机号' }]}
        disabled={props.values}
      />
      <ProFormSelect
        label="角色"
        name="role_ids"
        options={props.optionsRoles.options}
        rules={[{ required: true, message: '请选择角色' }]}
        fieldProps={{ mode: 'multiple' }}
      />
    </ProForm>
  );
};

export default UpdateUserForm;
