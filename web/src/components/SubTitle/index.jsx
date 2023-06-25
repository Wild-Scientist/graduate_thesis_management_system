import { useEffect } from 'react';
import styles from './index.module.less';

export default function SubTitle({ title = '', lineColor = '#13C2C2', style = {} }) {
  return (
    <div className={styles.titleWrap} style={style}>
      <div className={styles.line} style={{ backgroundColor: lineColor }} />
      <p className={styles.title}>{title}</p>
    </div>
  );
}
