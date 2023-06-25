import React, { useEffect } from 'react';
import styles from './ArchiveDetail.less';
import { Badge, Col, Divider, Empty, Grid, Row, Skeleton, Table } from 'antd';

import { useAccess, useModel } from 'umi';
import { useRequest } from '@/.umi/plugin-request/request';
import { fetchArchive } from '@/pages/archive/service';
import SubTitle from '@/components/SubTitle';
import { useCallback } from 'react';

export default function ArchiveDetail(props) {
  const { userId, isMobile } = props;

  const { initialState } = useModel('@@initialState');
  const { currentUser } = initialState || {};
  const access = useAccess();
  const screens = Grid.useBreakpoint();

  const { data: archive, loading: loadingArchive } = useRequest(() => fetchArchive(userId));

  const resultRender = useCallback((text) => {
    let status = 'default';
    if (['合格', '通过'].includes(text)) {
      status = 'success';
    } else if (['进行中'].includes(text)) {
      status = 'processing';
    } else if (['不合格', '不通过'].includes(text)) {
      status = 'error';
    }

    return (
      <div>
        <Badge status={status} style={{ marginRight: 8 }} />
        {text}
      </div>
    );
  }, []);

  return (
    <Skeleton loading={loadingArchive} active>
      {archive ? (
        <div className={styles.container}>
          <div className={`${isMobile ? styles.mobileCardWrap : ''}`}>
            <div className={`${isMobile ? styles.title : ''}`}>
              <SubTitle style={isMobile ? { margin: 0 } : {}} title={'基本信息'} />
            </div>
            <div className={`${isMobile ? styles.body : ''}`}>
              <Row align={'left'} style={{ marginBottom: isMobile ? 0 : 15 }}>
                <Col xs={{ span: 12 }} sm={{ span: 8 }}>
                  <div className={styles.field}>
                    <span className={styles.label}>姓名：</span>
                    <span className={styles.value}>{archive.name}</span>
                  </div>
                </Col>
                <Col xs={{ span: 12 }} sm={{ span: 8 }}>
                  <div className={styles.field}>
                    <span className={styles.label}>工资号：</span>
                    <span className={styles.value}>{archive.payroll_number}</span>
                  </div>
                </Col>
                <Col xs={{ span: 24 }} sm={{ span: 8 }}>
                  <div className={styles.field}>
                    <span className={styles.label}>部门：</span>
                    <span className={styles.value}>
                      {archive.fs_departments.map((d) => d.name).join('、')}
                    </span>
                  </div>
                </Col>
              </Row>
            </div>
          </div>
          <div className={`${isMobile ? styles.mobileCardWrap : ''}`}>
            <div className={`${isMobile ? styles.title : ''}`}>
              <SubTitle style={isMobile ? { margin: 0 } : {}} title={'年度考核'} />
            </div>
            <div className={`${isMobile ? styles.tableBody : ''}`}>
              <Table
                dataSource={archive.annual_assessments}
                columns={[
                  { title: '年度', dataIndex: 'year' },
                  { title: '结论', dataIndex: 'result', render: resultRender },
                ]}
                size={'small'}
                pagination={false}
                style={{ marginBottom: 20 }}
              />
            </div>
          </div>
          <div className={`${isMobile ? styles.mobileCardWrap : ''}`}>
            <div className={`${isMobile ? styles.title : ''}`}>
              <SubTitle style={isMobile ? { margin: 0 } : {}} title={'表彰记录'} />
            </div>
            <div className={`${isMobile ? styles.tableBody : ''}`}>
              <Table
                dataSource={archive.commendation_records}
                columns={[
                  {
                    title: '年度',
                    dataIndex: 'year',
                    width: isMobile ? 80 : null,
                  },
                  { title: '获奖项名称', dataIndex: 'content', ellipsis: true },
                  { title: '颁发机构', dataIndex: 'org', ellipsis: true },
                ]}
                size={'small'}
                pagination={false}
                style={{ marginBottom: 20 }}
              />
            </div>
          </div>
          <div className={`${isMobile ? styles.mobileCardWrap : ''}`}>
            <div className={`${isMobile ? styles.title : ''}`}>
              <SubTitle style={isMobile ? { margin: 0 } : {}} title={'培训记录'} />
            </div>
            <div className={`${isMobile ? styles.tableBody : ''}`}>
              <Table
                dataSource={archive.training_records}
                columns={[
                  {
                    title: '年度',
                    dataIndex: 'year',
                    width: isMobile ? 80 : null,
                  },
                  { title: '培训名称', dataIndex: 'content', ellipsis: true },
                  { title: '培训机构', dataIndex: 'org', ellipsis: true },
                ]}
                size={'small'}
                pagination={false}
                style={{ marginBottom: 20 }}
              />
            </div>
          </div>
          <div className={`${isMobile ? styles.mobileCardWrap : ''}`}>
            <div className={`${isMobile ? styles.title : ''}`}>
              <SubTitle style={isMobile ? { margin: 0 } : {}} title={'考察记录'} />
            </div>
            <div className={`${isMobile ? styles.tableBody : ''}`}>
              <Table
                dataSource={archive.evaluations}
                columns={[
                  {
                    title: '年度',
                    render: (_, record) => record?.created_at.slice(0, 4),
                    width: isMobile ? 45 : null,
                  },
                  { title: '类别', dataIndex: 'type', width: isMobile ? 80 : null },
                  { title: '标题', dataIndex: 'title', ellipsis: true },
                  {
                    title: '结论',
                    render: (_, record) => {
                      const { flow_contents: flowContents } = record;
                      const schoolApprove =
                        flowContents?.filter((item) => item?.status === 'school_approving') || [];
                      const result =
                        (schoolApprove[0]?.content &&
                          JSON.parse(schoolApprove[0].content)?.result) ||
                        '进行中';
                      return resultRender(result);
                    },
                    width: isMobile ? 80 : null,
                  },
                ]}
                size={'small'}
                pagination={false}
                style={{ marginBottom: 20 }}
              />
            </div>
          </div>
          <div className={`${isMobile ? styles.mobileCardWrap : ''}`}>
            <div className={`${isMobile ? styles.title : ''}`}>
              <SubTitle style={isMobile ? { margin: 0 } : {}} title={'违规记录'} />
            </div>
            <div className={`${isMobile ? styles.tableBody : ''}`}>
              <Table
                dataSource={archive.violation_records}
                columns={[
                  {
                    title: '年度',
                    render: (_, record) => record?.created_at.slice(0, 4),
                    width: isMobile ? 45 : null,
                  },
                  { title: '违规事项', dataIndex: 'content', ellipsis: true },
                  { title: '处理结果', dataIndex: 'result', ellipsis: true },
                  { title: '备注', dataIndex: 'info', ellipsis: true },
                ]}
                size={'small'}
                pagination={false}
                style={{ marginBottom: 20 }}
              />
            </div>
          </div>
        </div>
      ) : (
        <Empty />
      )}
    </Skeleton>
  );
}
