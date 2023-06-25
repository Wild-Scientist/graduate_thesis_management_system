import React, {useState} from 'react';
import {ProForm, ProFormUploadButton, ProFormUploadDragger} from '@ant-design/pro-form';
import Cookies from 'js-cookie';
import Tools from '@/tools';
import {Button, Divider, message} from 'antd';
import {getFile} from '@/services/file';
import FileTag from '@/components/FileTag';

export default function Uploads() {
  // 上传多个附件（公共）
  const [attachmentsPub, setAttachmentsPub] = useState([]);
  // 上传多个附件（私有）
  const [attachmentsPri, setAttachmentsPri] = useState([]);
  // 附件展示组件（标签样式）
  const [attachmentsTag, setAttachmentsTag] = useState([]);
  return (
    <div>
      <p>上传分为两种：上传为公共文件、上传为私有文件</p>
      <li>
        <ol>公共文件只要获取到文件地址即可任意永久访问</ol>
        <ol>私有文件不能通过文件地址访问，只能通过API接口访问，接口中可包含鉴权逻辑</ol>
      </li>
      <p>上传后也有两种处理方式</p>
      <li>
        <ol>直接返回可访问地址，一般用在富文本插入图片</ol>
        <ol>
          返回一个文件key（不用id可防止用户穷举），前端将此 key
          结合业务场景带入后续逻辑，私有文件可使用这种方式，因为即便返回了地址也无法访问，其实只需要关联文件
          key 即可，后续需要展示或者下载的时候后端再根据 key 查到文件处理文件流
        </ol>
      </li>
      <Divider/>
      <div>
        <p>
          <b>上传多个附件（公共）</b>
        </p>
        <ProForm
          onFinish={async (values) => {
            console.log(values);
            if (!Tools.verifyUploads(values.attachments)) {
              message.error('附件中有上传失败的文件，请先删除');
              return false;
            }
            setAttachmentsPub(values.attachments);
          }}
          style={{marginBottom: 20}}
        >
          <ProFormUploadDragger
            label="附件"
            name="attachments"
            action="/api/upload_attachments"
            fieldProps={{
              headers: {Authorization: `Bearer ${Cookies.get('t')}`},
              data: {
                // private=1：上传的为私有文件，不能直接访问，需要通过API访问
                // private=0或不设置：上传的为公开文件，可以直接访问
              },
            }}
          />
        </ProForm>
        {attachmentsPub.length ? (
          <>
            <p>文件列表如下（因为是公共文件，可以通过地址直接访问）：</p>
            {attachmentsPub.map((attachment) => (
              <p key={attachment.uid}>
                <a href={attachment.response.data.path} target={'_blank'} rel={'noreferrer'}>
                  {attachment.response.data.name}
                </a>
              </p>
            ))}
          </>
        ) : null}
      </div>

      <Divider/>
      <div>
        <p>
          <b>上传多个附件（私有）</b>
        </p>
        <ProForm
          onFinish={async (values) => {
            if (!Tools.verifyUploads(values.attachments)) {
              message.error('附件中有上传失败的文件，请先删除');
              return false;
            }
            setAttachmentsPri(values.attachments);
          }}
          style={{marginBottom: 20}}
        >
          <ProFormUploadButton
            label="附件"
            name="attachments"
            action="/api/upload_attachments"
            // fieldProps={{
            //   headers: {Authorization: `Bearer ${Cookies.get('t')}`},
            //   data: {
            //     // private=1：上传的为私有文件，不能直接访问，需要通过API访问
            //     // private=0或不设置：上传的为公开文件，可以直接访问
            //     private: 1,
            //   },
            // }}
          />
        </ProForm>
        {attachmentsPri.length ? (
          <>
            <p>文件列表如下（因为是私有文件，需要通过特殊手段访问）：</p>
            {attachmentsPri.map((attachment) => (
              <p key={attachment.uid}>
                {attachment.response.data.name}
                <Button
                  style={{marginLeft: 20}}
                  onClick={async () => {
                    const res = await getFile(attachment.response.data.key, {
                      responseType: 'blob',
                    });
                    const fileURL = window.URL.createObjectURL(res);
                    window.open(fileURL);
                  }}
                >
                  按钮访问
                </Button>
                <Button
                  style={{marginLeft: 20}}
                  onClick={async () => {
                    window.open(`/share/${attachment.response.data.key}`);
                  }}
                >
                  可分享访问
                </Button>
              </p>
            ))}
            <p>
              所谓的按钮访问原理是点击按钮后请求API获取文件流，然后在新窗口打开，但是如果复制打开的链接分享给别人是没法访问的，因此用户必须进入页面才能查看
            </p>
            <p>
              针对需要分享的情况，制作了升级版的“可分享访问”，原理是做了一个前端的空白页，在该页面中自动请求API获取文件流，然后在一个
              iframe 中打开
            </p>
            <p>
              注意：对于视频类型文件，后端会强制保存成公共文件（否则大视频文件需要下载完才能播放体验不好），但前端仍会隐藏实际地址
            </p>
          </>
        ) : null}
      </div>

      <Divider/>
      <div>
        <p>
          <b>附件展示标签</b>
        </p>
        <ProForm
          onFinish={async (values) => {
            if (!Tools.verifyUploads(values.attachments)) {
              message.error('附件中有上传失败的文件，请先删除');
              return false;
            }
            setAttachmentsTag(values.attachments);
          }}
          style={{marginBottom: 20}}
        >
          <ProFormUploadDragger
            label="附件"
            name="attachments"
            action="/api/upload_attachments"
            fieldProps={{
              headers: {Authorization: `Bearer ${Cookies.get('t')}`},
              data: {
                // private=1：上传的为私有文件，不能直接访问，需要通过API访问
                // private=0或不设置：上传的为公开文件，可以直接访问
                private: 1,
              },
            }}
          />
        </ProForm>
        {attachmentsTag.map((attachment) => {
          return <FileTag key={attachment.uid} file={attachment.response.data}/>;
        })}
      </div>
    </div>
  );
}
