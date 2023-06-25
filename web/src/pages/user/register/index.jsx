import React, { useState, useEffect } from 'react';
import { Form, Button, Col, Input, Popover, Progress, Row, Select, message, Tabs } from 'antd';
import { Link, useRequest, history, useIntl, useModel, FormattedMessage } from 'umi';
import styles from './style.less';
import { getRegisterCaptcha, register } from '@/services/auth/auth';
import Cookies from 'js-cookie';
import { LoginForm } from '@ant-design/pro-form';
import defaultSettings from '../../../../config/defaultSettings';
const { title } = defaultSettings;

const FormItem = Form.Item;
const { Option } = Select;
const InputGroup = Input.Group;
const passwordStatusMap = {
  ok: (
    <div className={styles.success}>
      <span>强度：强</span>
    </div>
  ),
  pass: (
    <div className={styles.warning}>
      <span>强度：中</span>
    </div>
  ),
  poor: (
    <div className={styles.error}>
      <span>强度：太短</span>
    </div>
  ),
};
const passwordProgressMap = {
  ok: 'success',
  pass: 'normal',
  poor: 'exception',
};

const Register = () => {
  const intl = useIntl();
  const { initialState, setInitialState } = useModel('@@initialState');
  const [count, setCount] = useState(0);
  const [visible, setVisible] = useState(false);
  const [prefix, setPrefix] = useState('86');
  const [popover, setPopover] = useState(false);
  const confirmDirty = false;
  let interval;
  const [form] = Form.useForm();
  useEffect(
    () => () => {
      clearInterval(interval);
    },
    [interval],
  );

  const fetchUserInfo = async () => {
    const userInfo = await initialState?.fetchUserInfo?.();

    console.log(userInfo);

    if (userInfo) {
      await setInitialState((s) => ({ ...s, currentUser: userInfo }));
    }
  };

  const [getCaptchaLoading, setGetCaptchaLoading] = useState(false);
  const onGetCaptcha = () => {
    form.validateFields(['phone']).then(async () => {
      try {
        setGetCaptchaLoading(true);
        const result = await getRegisterCaptcha(form.getFieldValue('phone'));
        if (result.success) {
          message.success(result.data ?? '验证码已发送');
          let counts = 59;
          setCount(counts);
          interval = window.setInterval(() => {
            counts -= 1;
            setCount(counts);
            if (counts === 0) {
              clearInterval(interval);
            }
          }, 1000);
        }
      } catch (e) {
        console.log(e);
      } finally {
        setGetCaptchaLoading(false);
      }
    });
  };

  const getPasswordStatus = () => {
    const value = form.getFieldValue('password');

    if (value && value.length > 9) {
      return 'ok';
    }

    if (value && value.length > 5) {
      return 'pass';
    }

    return 'poor';
  };

  const { loading: submitting, run: submitRegister } = useRequest(register, {
    manual: true,
    onSuccess: async (data, params) => {
      Cookies.set('t', data.token);
      message.success(intl.formatMessage({ id: 'pages.register.success' })).then((r) => null);
      await fetchUserInfo();

      /** 此方法会跳转到 redirect 参数所在的位置 */
      if (!history) return;
      const { query } = history.location;
      const { redirect } = query;
      history.push(redirect || '/');
    },
  });

  const onFinish = (values) => {
    submitRegister(values);
  };

  const checkConfirm = (_, value) => {
    const promise = Promise;

    if (value && value !== form.getFieldValue('password')) {
      return promise.reject('两次输入的密码不匹配!');
    }

    return promise.resolve();
  };

  const checkPassword = (_, value) => {
    const promise = Promise; // 没有值的情况

    if (!value) {
      setVisible(!!value);
      return promise.reject('请输入密码!');
    } // 有值的情况

    if (!visible) {
      setVisible(!!value);
    }

    setPopover(!popover);

    if (value.length < 6) {
      return promise.reject('');
    }

    if (value && confirmDirty) {
      form.validateFields(['confirm']);
    }

    return promise.resolve();
  };

  const changePrefix = (value) => {
    setPrefix(value);
  };

  const renderPasswordProgress = () => {
    const value = form.getFieldValue('password');
    const passwordStatus = getPasswordStatus();
    return value && value.length ? (
      <div className={styles[`progress-${passwordStatus}`]}>
        <Progress
          status={passwordProgressMap[passwordStatus]}
          className={styles.progress}
          strokeWidth={6}
          percent={value.length * 10 > 100 ? 100 : value.length * 10}
          showInfo={false}
        />
      </div>
    ) : null;
  };

  return (
    <div className={styles.main}>
      <LoginForm title={title} subTitle="Love to create" submitter={{ render: () => null }} />
      <Form form={form} onFinish={onFinish} style={{ margin: '0 20px' }}>
        <FormItem
          name="username"
          rules={[
            {
              required: true,
              message: intl.formatMessage({ id: 'pages.login.username.required' }),
            },
          ]}
        >
          <Input size="large" placeholder="用户名" />
        </FormItem>
        <Popover
          getPopupContainer={(node) => {
            if (node && node.parentNode) {
              return node.parentNode;
            }
            return node;
          }}
          content={
            visible && (
              <div
                style={{
                  padding: '4px 0',
                }}
              >
                {passwordStatusMap[getPasswordStatus()]}
                {renderPasswordProgress()}
                <div
                  style={{
                    marginTop: 10,
                  }}
                >
                  <span>请至少输入 6 个字符。请不要使用容易被猜到的密码。</span>
                </div>
              </div>
            )
          }
          overlayStyle={{
            width: 240,
          }}
          placement="right"
          visible={visible}
        >
          <FormItem
            name="password"
            className={
              form.getFieldValue('password') &&
              form.getFieldValue('password').length > 0 &&
              styles.password
            }
            rules={[
              {
                validator: checkPassword,
              },
            ]}
          >
            <Input size="large" type="password" placeholder="至少6位密码，区分大小写" />
          </FormItem>
        </Popover>
        <FormItem
          name="confirm"
          rules={[
            {
              required: true,
              message: '确认密码',
            },
            {
              validator: checkConfirm,
            },
          ]}
        >
          <Input size="large" type="password" placeholder="确认密码" />
        </FormItem>
        <InputGroup compact>
          <Select size="large" value={prefix} onChange={changePrefix} style={{ width: '25%' }}>
            <Option value="86">+86</Option>
          </Select>
          <FormItem
            style={{ width: '75%' }}
            name="phone"
            rules={[
              {
                required: true,
                message: '请输入手机号!',
              },
              {
                pattern: /^\d{11}$/,
                message: '手机号格式错误!',
              },
            ]}
          >
            <Input size="large" placeholder="手机号" />
          </FormItem>
        </InputGroup>
        <div className={styles.captcha}>
          <FormItem
            name="captcha"
            rules={[
              {
                required: true,
                message: '请输入验证码!',
              },
            ]}
            className={styles.input}
          >
            <Input size="large" placeholder="验证码" />
          </FormItem>
          <Button
            size="large"
            disabled={!!count}
            className={styles.getCaptcha}
            onClick={onGetCaptcha}
            loading={getCaptchaLoading}
          >
            {count ? `${count} s` : '获取验证码'}
          </Button>
        </div>
        <FormItem>
          <Button
            size="large"
            loading={submitting}
            className={styles.submit}
            type="primary"
            htmlType="submit"
          >
            <span>注册</span>
          </Button>
        </FormItem>
        <FormItem>
          <Link className={styles.login} to="/user/login">
            <span>使用已有账户登录</span>
          </Link>
        </FormItem>
      </Form>
    </div>
  );
};

export default Register;
