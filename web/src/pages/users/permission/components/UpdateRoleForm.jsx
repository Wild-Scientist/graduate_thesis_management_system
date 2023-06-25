import React, { useEffect } from 'react';
import { ProFormSelect, ProForm, ProFormText } from '@ant-design/pro-form';

const UpdateRoleForm = (props) => {
  return (
    <ProForm
      onFinish={props.onSubmit}
      submitter={{ searchConfig: { resetText: '取消' } }}
      onReset={props.onCancel}
      initialValues={props.values}
    >
      <ProFormText
        label="角色名称"
        name="name"
        rules={[{ required: true, message: '请输入角色名称' }]}
      />
      <ProFormSelect
        label="角色权限"
        name="permission_ids"
        options={props.permissions.map((p) => ({ label: p.name, value: p.id }))}
        fieldProps={{ mode: 'multiple' }}
      />
    </ProForm>
  );
};

export default UpdateRoleForm;
