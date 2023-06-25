import React, { useEffect, useRef, useState } from 'react';
import { GridContent, PageContainer } from '@ant-design/pro-layout';
import { ProTable } from '@ant-design/pro-table';
import Tools from '@/tools';
import { Alert, Button, Drawer, Modal, Space, Upload, message, Grid } from 'antd';
import { Link, useAccess, useModel } from 'umi';
import {
  archives,
  importAnnualAssessments,
  importCommendationRecords,
  importPreCheck,
  importTrainingRecords,
  importViolationRecords,
} from '@/pages/archive/service';
import ArchiveDetail from '@/pages/archive/components/ArchiveDetail';
import { CloseOutlined, CloudUploadOutlined, LeftOutlined } from '@ant-design/icons';
import { useRequest } from '@/.umi/plugin-request/request';
import { useMemo } from 'react';
import styles from './index.module.less';

const TableList = () => {
  const { initialState } = useModel('@@initialState');
  const { currentUser } = initialState || {};
  const access = useAccess();
  const screens = Grid.useBreakpoint();

  const [currentRow, setCurrentRow] = useState();
  const [showDetail, setShowDetail] = useState(false);
  const [drawerVisible, setDrawerVisible] = useState(false);
  useEffect(() => {
    if (!drawerVisible) {
      setCurrentRow(undefined);
      setShowDetail(false);
      actionRef.current?.reload();
    }
  }, [drawerVisible]);
  const handleShowDetail = (record) => {
    setCurrentRow(record);
    setShowDetail(true);
    setDrawerVisible(true);
  };

  const handleCloseDrawer = () => {
    setDrawerVisible(false);
  };

  // 导入说明 Modal
  const [importHelpModalVis, setImportHelpModalVis] = useState(false);
  const [importHelpModalData, setImportHelpModalData] = useState({});
  const [importFile, setImportFile] = useState();
  const [importPreCheckCount, setImportPreCheckCount] = useState(0);
  useEffect(() => {
    if (!importHelpModalVis) {
      setImportHelpModalData({});
      setImportFile(null);
      setImportPreCheckCount(0);
      actionRef.current?.reload();
    }
  }, [importHelpModalVis]);
  const { run: runImportPreCheck, loading: loadingImportPreCheck } = useRequest(importPreCheck, {
    manual: true,
  });
  const { run: runImport, loading: loadingImport } = useRequest(
    (data) => {
      switch (importHelpModalData.type) {
        case 'annualAssessments':
          return importAnnualAssessments(data);
        case 'commendationRecords':
          return importCommendationRecords(data);
        case 'trainingRecords':
          return importTrainingRecords(data);
        case 'violationRecords':
          return importViolationRecords(data);
      }
    },
    { manual: true },
  );

  // table
  const actionRef = useRef();
  const columns = [
    {
      title: '姓名',
      dataIndex: 'name',
    },
    {
      title: '工资号',
      dataIndex: 'payroll_number',
    },
    {
      title: '部门',
      dataIndex: 'fs_departments',
      render: (text) => text.map((item) => item.name).join('、'),
    },
    {
      title: '操作',
      dataIndex: 'option',
      valueType: 'option',
      render: (_, record) => (
        <>
          <Link onClick={() => handleShowDetail(record)}>详情</Link>
        </>
      ),
    },
  ];

  const isMobile = useMemo(() => {
    return screens.xs;
  }, [screens.xs]);

  // render
  return (
    <PageContainer>
      <GridContent>
        <ProTable
          actionRef={actionRef}
          rowKey="id"
          request={async (params, sort, filter) => {
            const result = await archives({
              ...Tools.handleParams(params),
              // ...Tools.handleFilter(filter),
              ...Tools.handleSort(sort),
            });
            return {
              data: result.data.data,
              success: result.success,
              total: result.data.total,
            };
          }}
          columns={columns}
          search={false}
          options={{ search: true }}
          toolBarRender={
            !access.can(`click.add_archive`) || screens.xs
              ? null
              : () => (
                  <>
                    <Button
                      disabled
                      onClick={() => {
                        setImportHelpModalData({
                          type: 'annualAssessments',
                          name: '年度考核',
                          headers: '年度、工资号、结论',
                        });
                        setImportHelpModalVis(true);
                      }}
                    >
                      导入年度考核
                    </Button>
                    <Button
                      onClick={() => {
                        setImportHelpModalData({
                          type: 'commendationRecords',
                          name: '表彰记录',
                          headers: '年度、工资号、获奖项名称、颁发机构',
                        });
                        setImportHelpModalVis(true);
                      }}
                    >
                      导入表彰记录
                    </Button>
                    <Button
                      onClick={() => {
                        setImportHelpModalData({
                          type: 'trainingRecords',
                          name: '培训记录',
                          headers: '年度、工资号、培训名称、培训机构',
                        });
                        setImportHelpModalVis(true);
                      }}
                    >
                      导入培训记录
                    </Button>
                    <Button
                      onClick={() => {
                        setImportHelpModalData({
                          type: 'violationRecords',
                          name: '违规记录',
                          headers: '年度、工资号、违规事项、处理结果、备注',
                        });
                        setImportHelpModalVis(true);
                      }}
                    >
                      导入违规记录
                    </Button>
                    <Modal
                      visible={importHelpModalVis}
                      title={`数据导入（${importHelpModalData.name}）指引`}
                      onCancel={() => setImportHelpModalVis(false)}
                      okText={'开始导入'}
                      okButtonProps={{ disabled: !importFile }}
                      confirmLoading={loadingImportPreCheck || loadingImport}
                      onOk={async () => {
                        const formData = new FormData();
                        formData.append('file', importFile);
                        if (importPreCheckCount) {
                          const data = await runImport(formData);
                          message.success(`成功导入了 ${data.success_count ?? '-'} 条数据`);
                          setImportHelpModalVis(false);
                        } else {
                          formData.append('type', importHelpModalData.type);
                          const data = await runImportPreCheck(formData);
                          const count = data.count;
                          if (count) {
                            setImportPreCheckCount(count);
                          } else {
                            const data = await runImport(formData);
                            message.success(`成功导入了 ${data.success_count ?? '-'} 条数据`);
                            setImportHelpModalVis(false);
                          }
                        }
                      }}
                    >
                      <Space direction={'vertical'}>
                        <Alert
                          message={
                            <span>
                              <b>格式要求：</b>第一行为表头（需包含如下列：
                              {importHelpModalData.headers}
                              ），从第二行开始为导入数据
                            </span>
                          }
                          type="info"
                          showIcon
                        />
                        <Alert
                          message={
                            <span>
                              <b>文件名：</b>
                              文件名将作为每次导入的唯一识别号，同一文件名多次导入仅最后一次有效
                            </span>
                          }
                          type="info"
                          showIcon
                        />
                        <Upload.Dragger
                          accept={'.xls,.xlsx'}
                          beforeUpload={(file) => {
                            setImportFile(file);
                            return false;
                          }}
                          showUploadList={false}
                        >
                          <p className="ant-upload-drag-icon">
                            <CloudUploadOutlined />
                          </p>
                          <p className="ant-upload-text">
                            {importFile?.name ?? '点击或拖动文件到此处'}
                          </p>
                        </Upload.Dragger>
                        {!!importPreCheckCount && (
                          <Alert
                            message={
                              <span>
                                <b>注意：</b>该文件存在导入记录（{importPreCheckCount}{' '}
                                条），继续导入将清除这些历史数据，确认继续导入请点击“开始导入”
                              </span>
                            }
                            type="warning"
                            showIcon
                          />
                        )}
                      </Space>
                    </Modal>
                  </>
                )
          }
        />
        <Drawer
          width={
            isMobile
              ? document.documentElement.clientWidth
              : Math.min(document.documentElement.clientWidth * 0.9, 800)
          }
          open={drawerVisible}
          onClose={handleCloseDrawer}
          closable={false}
          title={
            isMobile ? (
              <div className={styles.mobileTitle}>
                <div>
                  <LeftOutlined onClick={handleCloseDrawer} />
                </div>
                <strong>师德档案</strong>
                <div />
              </div>
            ) : (
              <strong>师德档案</strong>
            )
          }
          extra={isMobile ? null : <CloseOutlined onClick={handleCloseDrawer} />}
          bodyStyle={
            isMobile
              ? {
                  padding: '14px 14px 0',
                  background: '#f7f8fa',
                }
              : {}
          }
        >
          {showDetail && <ArchiveDetail userId={currentRow.id} isMobile={isMobile} />}
        </Drawer>
      </GridContent>
    </PageContainer>
  );
};

export default TableList;
