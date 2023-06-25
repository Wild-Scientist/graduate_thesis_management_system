import React from 'react';
import { GridContent, PageContainer } from '@ant-design/pro-layout';
import { Tabs } from 'antd';
import Uploads from '@/pages/demos/base/uploads';

const TableList = () => {
  // render
  return (
    <PageContainer>
      <GridContent>
        <div style={{ backgroundColor: 'white', padding: '0 20px 20px 20px' }}>
          <Tabs
            items={[
              {
                label: `上传`,
                key: 'upload',
                children: <Uploads />,
              },
            ]}
          />
        </div>
      </GridContent>
    </PageContainer>
  );
};

export default TableList;
