import React, { useEffect } from 'react';
import { loginFs } from '@/services/auth/feishu';
import Tools from '@/tools';
import Cookies from 'js-cookie';
import { history, useModel } from 'umi';
import { Spin } from 'antd';

export default function LoginFs() {
  const { initialState, setInitialState } = useModel('@@initialState');
  const fetchUserInfo = async () => {
    const userInfo = await initialState?.fetchUserInfo?.();
    if (userInfo) {
      await setInitialState((s) => ({ ...s, currentUser: userInfo }));
    }
  };
  useEffect(() => {
    (async () => {
      const code = Tools.getUrlParam('code');
      if (code) {
        const state = Tools.getUrlParam('state');
        try {
          const res = await loginFs({ code });
          Cookies.set('t', res.data?.token);
          await fetchUserInfo();
          if (!history) return;
          history.replace(state || '/');
        } catch (e) {
          if (e?.response?.errorMessage === 'code invalid.') {
            history.replace('/');
          }
          console.log(e);
        }
      }
    })();
  }, []);
  return (
    <div
      style={{
        width: '100vw',
        height: '100vh',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <Spin size={'large'} />
    </div>
  );
}
