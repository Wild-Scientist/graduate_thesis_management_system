import { SelectLang } from 'umi';
import React from 'react';
import Footer from '@/components/Footer';
import styles from './index.less';
import VConsole from '@/components/VConsole';
import LoginAnyone from '@/components/LoginAnyone';

const AuthLayout = (props) => {
  return (
    <div className={styles.container}>
      <div className={styles.lang}>
        <span>
          <LoginAnyone />
        </span>
        {SelectLang && <SelectLang />}
      </div>
      <div className={styles.content}>{props.children}</div>
      <Footer />
    </div>
  );
};

export default AuthLayout;
