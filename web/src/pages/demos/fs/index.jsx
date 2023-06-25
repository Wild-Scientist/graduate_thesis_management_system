import React, { useState } from 'react';
import { GridContent, PageContainer } from '@ant-design/pro-layout';
import { Tabs } from 'antd';
import Contact from '@/pages/demos/fs/contact';
import Document from '@/pages/demos/fs/document';

const TableList = () => {
  // render
  return (
    <PageContainer>
      <GridContent>
        <div style={{ backgroundColor: 'white', padding: '0 20px 20px 20px' }}>
          <Tabs
            items={[
              {
                label: `通讯录`,
                key: 'contact',
                children: <Contact />,
              },
              {
                label: `云文档`,
                key: 'document',
                children: <Document />,
              },
            ]}
          />
        </div>
      </GridContent>
    </PageContainer>
  );
};

export default TableList;
