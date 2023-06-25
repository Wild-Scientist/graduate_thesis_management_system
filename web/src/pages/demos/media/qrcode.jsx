import React, { useEffect, useRef, useState } from 'react';
import { ProForm, ProFormTextArea } from '@ant-design/pro-form';
import QRCode from 'qrcode';
import { Button, Divider, message, Select, Switch } from 'antd';
import { Html5Qrcode } from 'html5-qrcode';
import QrcodeScanner from '@/components/QrcodeScanner';

export default function Qrcode() {
  // 二维码生成
  const qrCodeRef = useRef();
  // 扫码
  const [qrCodeRes, setQrCodeRes] = useState();
  const [autoStop, setAutoStop] = useState(false);

  return (
    <div>
      <div>
        <p>
          <b>二维码生成</b>
        </p>
        <ProForm
          onFinish={(values) => {
            QRCode.toCanvas(qrCodeRef.current, values.content, { width: 300 }, function (error) {
              if (error) console.error(error);
            });
          }}
        >
          <ProFormTextArea label={'内容'} name={'content'} rules={[{ required: true }]} />
        </ProForm>
        <div>
          <canvas ref={qrCodeRef} />
        </div>
        <div>
          <Button
            onClick={() => {
              const a = document.createElement('a');
              a.download = 'qrcode';
              a.href = qrCodeRef.current?.toDataURL('image/png');
              a.click();
            }}
          >
            下载
          </Button>
        </div>
      </div>
      <Divider />
      <div>
        <p>
          <b>扫码</b>
        </p>
        <Select
          value={autoStop}
          onChange={(v) => {
            setAutoStop(v);
            setQrCodeRes('');
          }}
          style={{ marginBottom: 10 }}
        >
          <Select.Option value={false}>实时扫码</Select.Option>
          <Select.Option value={true}>单次扫码</Select.Option>
        </Select>
        <p>{qrCodeRes}</p>
        <QrcodeScanner autoStop={autoStop} onSuccess={(res) => setQrCodeRes(res)} />
      </div>
    </div>
  );
}
