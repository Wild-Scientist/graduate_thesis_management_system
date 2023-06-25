import React from 'react';
import { GridContent, PageContainer } from '@ant-design/pro-layout';
import { Tabs } from 'antd';
import Qrcode from '@/pages/demos/media/qrcode';

export default function Media() {
  // render
  return (
    <PageContainer>
      <GridContent>
        <div style={{ backgroundColor: 'white', padding: '0 20px 20px 20px' }}>
          <Tabs
            items={[
              {
                label: `二维码`,
                key: 'qrcode',
                children: <Qrcode />,
              },
            ]}
          />
        </div>
      </GridContent>
    </PageContainer>
  );
}
