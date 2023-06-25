import React, { useState } from 'react';
import {
  ProFormSelect,
  ProForm,
  ProFormText,
  ProFormTextArea,
  ProFormCheckbox,
  ProFormUploadButton,
  ProFormUploadDragger,
} from '@ant-design/pro-form';
import { Button, Form, message, Skeleton, Upload } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import { useModel, useRequest } from 'umi';
import tool from '@/tools';
import Cookies from 'js-cookie';
import { getDetails } from '@/pages/startup/service';

export default function UpdateEvaluationForm(props) {
  const values = props.values;
  let uploaded_file_key = values?.attachment?.key;
  let isUpdate = props.isUpdate;
  const { initialState } = useModel('@@initialState');
  const { currentUser } = initialState;
  // const [attachmentPri, setattachmentPri] = useState([]);
  const { run: runSaving, loading: loadingSaving } = useRequest(props.onFinish, { manual: true });
  const { run: runSubmitting, loading: loadingSubmitting } = useRequest(props.onFinish, {
    manual: true,
  });

  const { data: rsp, loading: loadingDetails } = useRequest(() => getDetails({ id: values.id }), {
    onSuccess: () => {
      setDetails(rsp);
      setLoading(false);
    },
  });
  const [details, setDetails] = useState({});
  const [loading, setLoading] = useState(!!isUpdate);

  return (
    <Skeleton loading={loading}>
      <ProForm
        initialValues={{
          ...details,
          user_name: currentUser.name,
        }}
        submitter={{
          render: (_props) => [
            <Button key={'cancel'} onClick={() => props.onCancel()}>
              关闭
            </Button>,
            <Button
              key={'save'}
              loading={loadingSaving}
              onClick={() => {
                _props.form.validateFields().then((values) => {
                  if (tool.uploadFileCheck(values) === false) return false;
                  runSaving({
                    ...values,
                    private: true,
                  });
                });
              }}
            >
              暂存到草稿
            </Button>,
            <Button
              key={'submit'}
              type={'primary'}
              loading={loadingSubmitting}
              onClick={() => {
                _props.form.validateFields().then((values) => {
                  if (tool.uploadFileCheck(values) === false) return false;
                  runSubmitting({
                    ...values,
                    private: true,
                    submit: true,
                  });
                });
              }}
            >
              保存并提交
            </Button>,
          ],
        }}
      >
        <ProFormText label="项目标题" name="title" rules={[{ required: true }]} />
        {/*<ProFormSelect*/}
        {/*  label="申报内容"*/}
        {/*  name="type"*/}
        {/*  options={CONST.EVALUATION_TYPES}*/}
        {/*  rules={[{ required: true }]}*/}
        {/*  allowClear={false}*/}
        {/*/>*/}
        {/*<ProFormSelect*/}
        {/*  label="单位"*/}
        {/*  name="fs_department_open_id"*/}
        {/*  options={(values ? [values.fs_department] : currentUser.fs_departments).map((d) => ({*/}
        {/*    label: d.name,*/}
        {/*    value: d.open_department_id,*/}
        {/*  }))}*/}
        {/*  rules={[{ required: true }]}*/}
        {/*  allowClear={false}*/}
        {/*  disabled={!!values}*/}
        {/*/>*/}
        <ProFormTextArea label="申报内容" name="project_content" rules={[{ required: true }]} />
        <ProFormUploadButton
          label="附件"
          name="files"
          action="/api/upload_attachments"
          fieldProps={{
            maxCount: 1,
            name: 'files',
            headers: { Authorization: `Bearer ${Cookies.get('t')}` },
          }}
        />
        {/*<FormUploader></FormUploader>*/}
        {/*<ProFormUploadButton*/}
        {/*  label="附件"*/}
        {/*  name="attachment"*/}
        {/*  action="/api/upload_attachment"*/}
        {/*  fieldProps={{*/}
        {/*    require: true,*/}
        {/*    name: 'files',*/}
        {/*    fileList: [*/}
        {/*    ],*/}
        {/*    maxCount: 1,*/}
        {/*    headers: {Authorization: `Bearer ${Cookies.get('t')}`},*/}
        {/*    data: {*/}
        {/*      // private=1：上传的为私有文件，不能直接访问，需要通过API访问*/}
        {/*      // private=0或不设置：上传的为公开文件，可以直接访问*/}
        {/*      private: 1,*/}
        {/*    }*/}
        {/*  }}*/}
        {/*/>*/}

        {/*<ProFormUploadButton*/}
        {/*  // label="上传附件"*/}
        {/*  // max={1}*/}
        {/*  name="attachment"*/}
        {/*  action="/api/upload_attachment"*/}
        {/*  required="true"*/}
        {/*  fieldProps={*/}
        {/*    {*/}
        {/*      getValueFromEvent: (e) => {*/}
        {/*        return undefined*/}
        {/*      },*/}
        {/*      // headers: {Authorization: `Bearer ${Cookies.get('t')}`},*/}
        {/*      name: 'files',*/}
        {/*      // defaultFileList,*/}

        {/*    }}*/}
        {/*/>*/}
        {/*<ProFormCheckbox.Group*/}
        {/*  name="promise"*/}
        {/*  layout="horizontal"*/}
        {/*  options={[CONST.PROMISE_TEST]}*/}
        {/*  rules={[{ required: true }]}*/}
        {/*/>*/}
      </ProForm>
    </Skeleton>
  );
}
