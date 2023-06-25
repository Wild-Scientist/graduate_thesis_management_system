import React, {useEffect, useState} from 'react';
import styles from './ProjectDetail.less';
import {Col, Divider, Row, Space, Steps, Table, Tabs, Skeleton} from 'antd';
import UserTag from '@/components/UserTag';
import CONST from '@/const';
import Tools from '@/tools';

import {useRequest} from '@/.umi/plugin-request/request';
import ProjectContents from '@/pages/startup/details/ProjectContents';
import FsCloudDocument from '@/components/Feishu/FsCloudDocument';
import {userCanSeeContract} from '@/pages/startup/startUpPermissions';
import {getContract, getDetails} from '@/pages/startup/service';

export default function ProjectDetail(props) {
  const values = props.values ?? {};

  const {data: rsp, loading: loadingDetails} = useRequest(() => getDetails({id: values.id}), {
    onSuccess: () => {
      setDetails(rsp);
    },
  });

  const {data: rsp_contract, loading: loadingContract} = useRequest(() => getContract({id: values.id}), {
    onSuccess: () => {
      console.log(rsp_contract)
    },
  });

  const [details, setDetails] = useState({});

  // 判断是否可以看到单位评价
  const Detail = () => (
    <Skeleton loading={loadingDetails}>
      <div className={styles.detail}>
        <Space className={styles.myStep} direction="horizontal">
          <Steps
            current={Tools.getStatusIndex(details.status, Tools.getFlowConst())}
            size="small"
            items={Tools.getFlowConst().map((status) => ({
              title: status.label,
            }))}
          />
        </Space>
        <Divider/>
        <h1>{details?.title}</h1>
        <Row align={'middle'}>
          <Col xs={{span: 24}} sm={{span: 6}}>
            <div className={styles.field}>
              <b className={styles.label}>申请人：</b>
              <span className={styles.value}>{details?.user?.name}</span>
            </div>
          </Col>
          {/*<Col xs={{ span: 24 }} sm={{ span: 8 }}>*/}
          {/*  <div className={styles.field}>*/}
          {/*    <b className={styles.label}>部门：</b>*/}
          {/*    <span className={styles.value}>{details?.fs_department?.name}</span>*/}
          {/*  </div>*/}
          {/*</Col>*/}
        </Row>
        <Divider/>
        <ProjectContents values={details}/>
        <Divider/>
        {userCanSeeContract({}, details) && (
          <>
            <h2>合同文档</h2>
            <FsCloudDocument
              id={'fs-cloud-document'}
              height={600}
              src={'https://bytedance.feishu.cn/docs/doccndIw0JiqrG5GtVB0e9joaVf'}
            />
            <Divider/>
          </>
        )}

        <h2>操作记录</h2>
        <Table
          dataSource={details.operation_logs}
          columns={[
            {title: '操作人', render: (_, record) => <UserTag user={record.user}/>},
            {
              title: '操作节点',
              dataIndex: 'status',
              render: (text) => {
                return Tools.getStatusLabel(text, CONST.PROJECT_START_UP_FLOW);
              },
            },
            {title: '操作内容', dataIndex: 'content'},
            {title: '操作时间', dataIndex: 'created_at'},
          ]}
          size={'small'}
          pagination={false}
          rowKey="id"
        />
      </div>
    </Skeleton>
  );

  return (
    <div className={styles.container}>
      {
        <Tabs
          items={[
            {
              label: '申请详情',
              key: 'detail',
              children: <Detail/>,
            },
          ]}
        />
      }
    </div>
  );
}
