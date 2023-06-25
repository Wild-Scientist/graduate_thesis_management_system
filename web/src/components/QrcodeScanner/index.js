import React, { useEffect, useState } from 'react';
import { Button, message } from 'antd';
import styles from './index.less';
import { Html5Qrcode } from 'html5-qrcode';
import { isSet } from 'lodash';

export default function QrcodeScanner(props) {
  const id = props.id ?? 'qrcodeScanner';
  const autoStop = props.autoStop ?? false;
  const onSuccess = props.onSuccess ?? (() => null);

  const [qrCodeScanner, setQrCodeScanner] = useState();
  const [qrCodeScanning, setQrCodeScanning] = useState(false);
  const stopScan = () => {
    qrCodeScanner
      ?.stop()
      .then(() => setQrCodeScanning(false))
      .catch(() => setQrCodeScanning(true));
  };
  useEffect(() => {
    if (id) {
      setQrCodeScanner(new Html5Qrcode(id));
    }
  }, [id]);
  useEffect(() => {
    if (qrCodeScanning) {
      stopScan();
    }
  }, [autoStop]);
  return (
    <div className={styles.scanner}>
      <div id={id} style={{ width: '100%' }} />
      {!qrCodeScanning ? (
        <Button
          onClick={async () => {
            qrCodeScanner
              ?.start(
                { facingMode: 'environment' },
                { fps: 10, qrbox: { width: 250, height: 250 } },
                (decodedText, decodedResult) => {
                  console.log(`Code matched = ${decodedText}`, decodedResult);
                  if (decodedText) {
                    onSuccess(decodedText);
                    if (autoStop) {
                      stopScan();
                    }
                  }
                },
              )
              .catch((err) => {
                setQrCodeScanning(false);
                if (
                  err ===
                  'Error getting userMedia, error = NotFoundError: Requested device not found'
                ) {
                  message.error('未找到摄像头');
                } else if (
                  err === 'Error getting userMedia, error = NotAllowedError: Permission denied'
                ) {
                  message.error('获取权限失败');
                } else {
                  console.error(err);
                }
              });
            setQrCodeScanning(true);
          }}
        >
          开始扫码
        </Button>
      ) : (
        <Button danger style={{ margin: '10px 0 20px 0' }} onClick={() => stopScan()}>
          结束扫码
        </Button>
      )}
    </div>
  );
}
