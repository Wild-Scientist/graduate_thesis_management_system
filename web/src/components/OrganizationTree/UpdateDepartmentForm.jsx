import React, { useEffect } from 'react';
import { ProForm, ProFormDigit, ProFormText } from '@ant-design/pro-form';

const UpdateDepartmentForm = (props) => {
  return (
    <ProForm
      formRef={props.formRef}
      onFinish={props.onFinish}
      submitter={false}
      initialValues={props.initialValues}
    >
      <ProFormDigit name={'id'} hidden />
      <ProFormDigit name={'parent_id'} hidden />
      <ProFormText
        label={'名称'}
        name={'name'}
        rules={[{ required: true, message: '名称不能为空' }]}
      />
    </ProForm>
  );
};

export default UpdateDepartmentForm;
