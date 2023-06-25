import React from 'react';
import styles from './index.less';
import { PaperClipOutlined, ShareAltOutlined } from '@ant-design/icons';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import { Tooltip, message } from 'antd';

export default function FileTag(props) {
  const { file = {}, className = '', ...other } = props;
  return (
    <span className={`${styles.file} ${className}`} {...other}>
      <Tooltip title={'预览/下载附件'}>
        <span
          className={styles.link}
          onClick={async () => {
            window.open(`/share/${file.key}`);
          }}
        >
          <PaperClipOutlined />
          <span className={styles.name}>{file.name}</span>
        </span>
      </Tooltip>
      <Tooltip title={'复制分享地址'}>
        <span className={styles.share}>
          <CopyToClipboard
            text={`${window.location.origin}/share/${file.key}`}
            onCopy={async () => {
              message.success('成功复制到剪贴板，快去分享吧！');
            }}
          >
            <ShareAltOutlined />
          </CopyToClipboard>
        </span>
      </Tooltip>
    </span>
  );
}
