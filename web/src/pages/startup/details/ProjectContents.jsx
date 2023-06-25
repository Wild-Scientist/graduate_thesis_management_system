import { ProForm, ProFormTextArea, ProFormUploadButton } from '@ant-design/pro-form';
import Cookies from 'js-cookie';
import { Descriptions, Space, Upload } from 'antd';
import styles from './ProjectContentTable.less';
import { DownloadOutlined } from '@ant-design/icons';
import { Button } from 'antd';
import { approveEvaluation, downloadFile } from '../service';
import { useRequest } from '@/.umi/plugin-request/request';

export default function (props) {
  const { run: download, loading: downloading } = useRequest(
    () => downloadFile(props?.values?.attachment?.key, props?.values?.attachment?.original_name),
    { manual: true },
  );
  console.log(props, 'projectContents');
  return (
    <div className={styles.tableContainer}>
      <table className={styles.table}>
        <tbody>
          <tr>
            <td className={styles.title}>项目内容</td>
            <td>{props?.values?.project_content}</td>
          </tr>
          <tr>
            <td className={styles.title}>附件</td>
            <td>
              <Space>
                {props?.values?.attachment?.original_name}
                <Button
                  type="primary"
                  icon={<DownloadOutlined />}
                  size="middle"
                  loading={downloading}
                  onClick={download}
                >
                  下载
                </Button>
              </Space>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
  // {/*<ProFormUploadButton*/}
  // {/*  label="附件"*/}
  // {/*  name="attachments"*/}
  // {/*  disabled="true"*/}
  // {/*  fieldProps={{*/}
  // {/*    require: true,*/}
  // {/*    name: 'files',*/}
  // {/*    maxCount: 1,*/}
  // {/*    disabled:true,*/}
  // {/*    headers: { Authorization: `Bearer ${Cookies.get('t')}` },*/}
  // {/*    data: {*/}
  // {/*      // private=1：上传的为私有文件，不能直接访问，需要通过API访问*/}
  // {/*      // private=0或不设置：上传的为公开文件，可以直接访问*/}
  // {/*      private: 1,*/}
  // {/*    },*/}
  // {/*  }}*/}
  // {/*/>*/}
}
