import { LockOutlined, MobileOutlined, UserOutlined } from '@ant-design/icons';
import { Alert, message, Tabs } from 'antd';
import React, { useState } from 'react';
import { ProFormCaptcha, ProFormCheckbox, ProFormText, LoginForm } from '@ant-design/pro-form';
import { useIntl, history, FormattedMessage, SelectLang, useModel, request } from 'umi';
import Footer from '@/components/Footer';
import { login } from '@/services/auth/auth';
import { getLoginCaptcha } from '@/services/auth/auth';
import styles from './index.less';
import Cookies from 'js-cookie';
import { getFeishuLoginUrl } from '@/services/auth/feishu';
import defaultSettings from '../../../../config/defaultSettings';
const { title } = defaultSettings;

const LoginMessage = ({ content }) => (
  <Alert
    style={{
      marginBottom: 24,
    }}
    message={content}
    type="error"
    showIcon
  />
);

const Login = () => {
  // 普通登录
  const [userLoginState, setUserLoginState] = useState({});
  const [type, setType] = useState('account');
  const { initialState, setInitialState } = useModel('@@initialState');
  const intl = useIntl();

  const fetchUserInfo = async () => {
    const userInfo = await initialState?.fetchUserInfo?.();

    if (userInfo) {
      await setInitialState((s) => ({ ...s, currentUser: userInfo }));
    }
  };

  const handleSubmit = async (values) => {
    // 登录
    const res = await login({ ...values, type });

    if (res.success) {
      Cookies.set('t', res.data?.token);
      const defaultLoginSuccessMessage = intl.formatMessage({
        id: 'pages.login.success',
        defaultMessage: '登录成功！',
      });
      message.success(defaultLoginSuccessMessage);
      await fetchUserInfo();

      /** 此方法会跳转到 redirect 参数所在的位置 */
      if (!history) return;
      const { query } = history.location;
      const { redirect } = query;
      history.push(redirect || '/');
      return;
    }

    console.log(res); // 如果失败去设置用户错误信息

    setUserLoginState(res);
  };

  const { status, type: loginType } = userLoginState;
  return (
    <LoginForm
      title={title}
      subTitle="Love to create"
      actions={[
        <span key={'loginWith'} className={styles.loginWith}>
          <FormattedMessage id="pages.login.loginWith" />
        </span>,
        <img
          key={'feishu'}
          src="/feishu.svg"
          alt="feishu"
          className={styles.icon}
          onClick={async () => {
            const res = await getFeishuLoginUrl();
            window.location.href = res.data;
          }}
        />,
        <img key={'weixin'} src="/weixin.svg" alt="weixin" className={styles.icon} />,
        <a
          key={'register'}
          className={styles.register}
          onClick={() => history.push('/user/register')}
        >
          <FormattedMessage key="loginWith" id="pages.login.registerAccount" />
        </a>,
      ]}
      onFinish={async (values) => {
        await handleSubmit(values);
      }}
    >
      <Tabs activeKey={type} onChange={setType}>
        <Tabs.TabPane
          key="account"
          tab={intl.formatMessage({
            id: 'pages.login.accountLogin.tab',
            defaultMessage: '账户密码登录',
          })}
        />
        <Tabs.TabPane
          key="mobile"
          tab={intl.formatMessage({
            id: 'pages.login.phoneLogin.tab',
            defaultMessage: '手机号登录',
          })}
        />
      </Tabs>

      {status === 'error' && loginType === 'account' && (
        <LoginMessage
          content={intl.formatMessage({
            id: 'pages.login.accountLogin.errorMessage',
            defaultMessage: '账户或密码错误(admin/ant.design)',
          })}
        />
      )}
      {type === 'account' && (
        <>
          <ProFormText
            name="username"
            fieldProps={{
              size: 'large',
              prefix: <UserOutlined className={styles.prefixIcon} />,
            }}
            placeholder={intl.formatMessage({ id: 'pages.login.username.placeholder' })}
            rules={[
              {
                required: true,
                message: (
                  <FormattedMessage
                    id="pages.login.username.required"
                    defaultMessage="请输入用户名!"
                  />
                ),
              },
            ]}
          />
          <ProFormText.Password
            name="password"
            fieldProps={{
              size: 'large',
              prefix: <LockOutlined className={styles.prefixIcon} />,
            }}
            placeholder={intl.formatMessage({
              id: 'pages.login.password.placeholder',
              defaultMessage: '密码: ant.design',
            })}
            rules={[
              {
                required: true,
                message: (
                  <FormattedMessage
                    id="pages.login.password.required"
                    defaultMessage="请输入密码！"
                  />
                ),
              },
            ]}
          />
        </>
      )}

      {status === 'error' && loginType === 'mobile' && <LoginMessage content="验证码错误" />}
      {type === 'mobile' && (
        <>
          <ProFormText
            name="phone"
            fieldProps={{ size: 'large', prefix: <MobileOutlined /> }}
            placeholder={intl.formatMessage({ id: 'pages.login.phoneNumber.placeholder' })}
            rules={[
              {
                required: true,
                message: intl.formatMessage({ id: 'pages.login.phoneNumber.required' }),
              },
              {
                pattern: /^1\d{10}$/,
                message: intl.formatMessage({ id: 'pages.login.phoneNumber.invalid' }),
              },
            ]}
          />
          <ProFormCaptcha
            name="captcha"
            phoneName="phone"
            fieldProps={{ size: 'large', prefix: <LockOutlined /> }}
            captchaProps={{ size: 'large' }}
            placeholder={intl.formatMessage({ id: 'pages.login.captcha.placeholder' })}
            captchaTextRender={(timing, count) => {
              if (timing) {
                return `${count} ${intl.formatMessage({ id: 'pages.getCaptchaSecondText' })}`;
              }
              return intl.formatMessage({ id: 'pages.login.phoneLogin.getVerificationCode' });
            }}
            rules={[
              {
                required: true,
                message: intl.formatMessage({ id: 'pages.login.captcha.required' }),
              },
            ]}
            onGetCaptcha={async (phone) => {
              const result = await getLoginCaptcha(phone);

              if (result === false) {
                return;
              }
              message.success(result.data ?? '验证码已发送');
            }}
          />
        </>
      )}
      {/*<div*/}
      {/*  style={{*/}
      {/*    marginBottom: 24,*/}
      {/*  }}*/}
      {/*>*/}
      {/*  <ProFormCheckbox noStyle name="autoLogin">*/}
      {/*    <FormattedMessage id="pages.login.rememberMe" defaultMessage="自动登录" />*/}
      {/*  </ProFormCheckbox>*/}
      {/*  <a*/}
      {/*    style={{*/}
      {/*      float: 'right',*/}
      {/*    }}*/}
      {/*  >*/}
      {/*    <FormattedMessage id="pages.login.forgotPassword" defaultMessage="忘记密码" />*/}
      {/*  </a>*/}
      {/*</div>*/}
    </LoginForm>
  );
};

export default Login;
