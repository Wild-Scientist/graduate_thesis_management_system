import React, { useState } from 'react';
import FsCloudDocument from '@/components/Feishu/FsCloudDocument';
import { Button, Col, Divider, message, Row } from 'antd';
import { batchUpdateBlocks, updateBlock } from '@/services/feishu';
import { useRequest } from 'umi';
import { ProForm, ProFormText } from '@ant-design/pro-form';

export default function Document() {
  // const { initialState } = useModel('@@initialState');
  // const { currentUser } = initialState;

  // 预览和切换文档
  const documents = [
    'https://bytedance.feishu.cn/docs/doccndIw0JiqrG5GtVB0e9joaVf',
    'https://uestc.feishu.cn/docx/K5NGdTcrronyECxouPFcH2DAnAh',
  ];
  const [src, setSrc] = useState(documents[0]);

  // 更新文档块
  const { run: runUpdateBlock, loading: loadingUpdateBlock } = useRequest(updateBlock, {
    manual: true,
    onSuccess: () => message.success('更新成功'),
  });

  // 批量更新文档块
  const { run: runBatchUpdateBlocks, loading: loadingBatchUpdateBlocks } = useRequest(
    batchUpdateBlocks,
    {
      manual: true,
      onSuccess: () => message.success('更新成功'),
    },
  );

  return (
    <div>
      <div>
        <p>
          <b>预览和切换文档</b>
        </p>
        <div style={{ border: '1px solid #eee' }}>
          <FsCloudDocument id={'fs-cloud-document'} height={600} src={src} />
        </div>
        <Button
          onClick={() => setSrc(documents[1 - documents.indexOf(src)])}
          type={'primary'}
          style={{ marginTop: 20 }}
        >
          切换文档
        </Button>
        <Divider />
      </div>
      <div>
        <p>
          <b>更新文档块</b>
        </p>
        <Row>
          <Col span={12}>
            <Button
              loading={loadingUpdateBlock}
              onClick={() => {
                runUpdateBlock({
                  document_id: 'ELGqdae8zol5kxxRfu2c1KHxnU6',
                  block_id: 'OqiEdGyOqo8EU8xqAFncnLNnnBe',
                  post_data: {
                    update_text_elements: {
                      elements: [
                        {
                          text_run: {
                            content: Date.now(),
                          },
                        },
                      ],
                    },
                  },
                });
              }}
            >
              更新时间戳
            </Button>
          </Col>
          <Col span={12}>
            <div style={{ border: '1px solid #eee' }}>
              <FsCloudDocument
                id={'update-demo'}
                height={600}
                src={'https://uestc.feishu.cn/docx/ELGqdae8zol5kxxRfu2c1KHxnU6'}
              />
            </div>
          </Col>
        </Row>
        <Divider />
      </div>
      <div>
        <p>
          <b>批量更新文档块</b>
        </p>
        <Row>
          <Col span={12}>
            <ProForm
              onFinish={async (values) => {
                await runBatchUpdateBlocks({
                  document_id: 'ELGqdae8zol5kxxRfu2c1KHxnU6',
                  post_data: {
                    requests: [
                      {
                        block_id: 'IsEWdW8YeoomgYxoDDIcwFV9nff',
                        update_text_elements: {
                          elements: [
                            {
                              text_run: {
                                content: values.todo1,
                              },
                            },
                          ],
                        },
                      },
                      {
                        block_id: 'BkKOdK8caoUamOx4oRAcS75rn7e',
                        update_text_elements: {
                          elements: [
                            {
                              text_run: {
                                content: values.todo2,
                              },
                            },
                          ],
                        },
                      },
                    ],
                  },
                });
              }}
            >
              <ProFormText label={'TODO1'} name={'todo1'} />
              <ProFormText label={'TODO2'} name={'todo2'} />
            </ProForm>
          </Col>
          <Col span={12}>
            <div style={{ border: '1px solid #eee' }}>
              <FsCloudDocument
                id={'batch-update-demo'}
                height={600}
                src={'https://uestc.feishu.cn/docx/ELGqdae8zol5kxxRfu2c1KHxnU6'}
              />
            </div>
          </Col>
        </Row>
        <Divider />
      </div>
    </div>
  );
}
