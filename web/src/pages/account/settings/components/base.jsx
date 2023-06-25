import React from 'react';
import { UploadOutlined } from '@ant-design/icons';
import { Button, Input, Upload, message } from 'antd';
import ProForm, {
  ProFormDependency,
  ProFormFieldSet,
  ProFormSelect,
  ProFormText,
  ProFormTextArea,
} from '@ant-design/pro-form';
import { useRequest } from 'umi';
import { queryCurrent, updateCurrentUser } from '../service';
import { queryProvince, queryCity } from '../service';
import styles from './BaseView.less';
import Tools from '@/tools';

const validatorPhone = (rule, value, callback) => {
  if (!value[0]) {
    callback('Please input your area code!');
  }

  if (!value[1]) {
    callback('Please input your phone number!');
  }

  callback();
}; // 头像组件 方便以后独立，增加裁剪之类的功能

const AvatarView = ({ avatar }) => (
  <>
    <div className={styles.avatar_title}>头像</div>
    <div className={styles.avatar}>
      <img src={avatar} alt="avatar" />
    </div>
    <Upload showUploadList={false}>
      <div className={styles.button_view}>
        <Button>
          <UploadOutlined />
          更换头像
        </Button>
      </div>
    </Upload>
  </>
);

const BaseView = () => {
  const { data: currentUser, loading } = useRequest(() => {
    return queryCurrent();
  });

  const { run: runUpdateCurrentUser, loading: loadingUpdateCurrentUser } = useRequest(
    updateCurrentUser,
    {
      manual: true,
      onSuccess: () => message.success('更新成功'),
    },
  );

  const handleFinish = async (values) => {
    console.log(values);
    runUpdateCurrentUser(values);
  };

  return (
    <div className={styles.baseView}>
      {loading ? null : (
        <>
          <div className={styles.left}>
            <ProForm
              layout="vertical"
              onFinish={handleFinish}
              submitter={{
                render: (props) => (
                  <Button
                    type={'primary'}
                    loading={loadingUpdateCurrentUser}
                    onClick={() => props.form?.submit?.()}
                  >
                    更新基本信息
                  </Button>
                ),
              }}
              initialValues={{ ...currentUser }}
              hideRequiredMark
            >
              <ProFormText width="md" name="username" label="昵称" />
              <ProFormText width="md" name="name" label="姓名" />
              <ProFormTextArea name="signature" label="个性签名" />
              <ProFormText width="md" name="title" label="头衔/职称" />
              {/*<ProFormSelect*/}
              {/*  width="sm"*/}
              {/*  name="country"*/}
              {/*  label="国家/地区"*/}
              {/*  rules={[*/}
              {/*    {*/}
              {/*      required: true,*/}
              {/*      message: '请输入您的国家或地区!',*/}
              {/*    },*/}
              {/*  ]}*/}
              {/*  options={[*/}
              {/*    {*/}
              {/*      label: '中国',*/}
              {/*      value: 'China',*/}
              {/*    },*/}
              {/*  ]}*/}
              {/*/>*/}

              {/*<ProForm.Group title="所在省市" size={8}>*/}
              {/*  <ProFormSelect*/}
              {/*    rules={[*/}
              {/*      {*/}
              {/*        required: true,*/}
              {/*        message: '请输入您的所在省!',*/}
              {/*      },*/}
              {/*    ]}*/}
              {/*    width="sm"*/}
              {/*    fieldProps={{*/}
              {/*      labelInValue: true,*/}
              {/*    }}*/}
              {/*    name="province"*/}
              {/*    className={styles.item}*/}
              {/*    request={async () => {*/}
              {/*      return queryProvince().then(({data}) => {*/}
              {/*        return data.map((item) => {*/}
              {/*          return {*/}
              {/*            label: item.name,*/}
              {/*            value: item.id,*/}
              {/*          };*/}
              {/*        });*/}
              {/*      });*/}
              {/*    }}*/}
              {/*  />*/}
              {/*  <ProFormDependency name={['province']}>*/}
              {/*    {({province}) => {*/}
              {/*      return (*/}
              {/*        <ProFormSelect*/}
              {/*          params={{*/}
              {/*            key: province?.value,*/}
              {/*          }}*/}
              {/*          name="city"*/}
              {/*          width="sm"*/}
              {/*          rules={[*/}
              {/*            {*/}
              {/*              required: true,*/}
              {/*              message: '请输入您的所在城市!',*/}
              {/*            },*/}
              {/*          ]}*/}
              {/*          disabled={!province}*/}
              {/*          className={styles.item}*/}
              {/*          request={async () => {*/}
              {/*            if (!province?.key) {*/}
              {/*              return [];*/}
              {/*            }*/}

              {/*            return queryCity(province.key || '').then(({data}) => {*/}
              {/*              return data.map((item) => {*/}
              {/*                return {*/}
              {/*                  label: item.name,*/}
              {/*                  value: item.id,*/}
              {/*                };*/}
              {/*              });*/}
              {/*            });*/}
              {/*          }}*/}
              {/*        />*/}
              {/*      );*/}
              {/*    }}*/}
              {/*  </ProFormDependency>*/}
              {/*</ProForm.Group>*/}
              <ProFormText width="md" name="address" label="地址" />
            </ProForm>
          </div>
          <div className={styles.right}>
            <AvatarView avatar={Tools.getAvatarURL(currentUser)} />
          </div>
        </>
      )}
    </div>
  );
};

export default BaseView;
