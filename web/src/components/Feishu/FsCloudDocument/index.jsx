import React, { useEffect, useState } from 'react';
import { Spin } from 'antd';
import { getJsSDKAuthConfig } from '@/services/feishu';

export default function FsCloudDocument(props) {
  // const fetchFsSDKAuthConfig = () => {
  //   return window.axios.get(
  //
  //     generateServerUrl('fs/cloudDocument/jsSDK/auth/config'),// 此处实际使用时需要修改为后端实际接口地址
  //     {params: {url: window.location.origin + window.location.pathname}}
  //   );
  // }
  const [fsWebComponent, setFsWebComponent] = useState(null);
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    setLoading(true);
    loadFsSDK();
    getJsSDKAuthConfig({
      url: window.location.origin + window.location.pathname,
    }).then((res) => {
      const config = res.data || {};
      config.url = window.location.origin + window.location.pathname;
      config.jsApiList = ['DocsComponent'];
      config.lang = 'zh';
      window['webComponent'].config(config).then(() => {
        console.info('web component auth done');
        if (!fsWebComponent) {
          const webComponent = window['webComponent'].render(
            'DocsComponent',
            {
              //组件参数
              src: props.src,
              height: props.height,
              width: '100%',
            },
            document.querySelector(`#${props.id}`), // 将组件挂在到哪个元素上
          );
          webComponent.config.setFeatureConfig({
            COMMENT: {
              partial: {
                open: false,
              },
            },
          });
          setFsWebComponent(webComponent);
        }
        setLoading(false);
      });
    });

    return () => {
      if (fsWebComponent) {
        fsWebComponent.unmount();
        setFsWebComponent(null);
      }
    };
  }, []);

  useEffect(() => {
    if (fsWebComponent && props.src) {
      fsWebComponent.replace(props.src);
    }
  }, [props.src]);

  return (
    <div id={props.id}>
      {loading && (
        <div
          style={{
            height: 100,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <Spin />
        </div>
      )}
    </div>
  );
}

function loadFsSDK() {
  if (!window['webComponent']) {
    const body = document.getElementsByTagName('body')[0];
    const scriptDom = document.createElement('script');
    scriptDom.src =
      'https://lf1-cdn-tos.bytegoofy.com/goofy/locl/lark/external_js_sdk/h5-js-sdk-1.1.3.js';
    body.insertBefore(scriptDom, body.children[2]);
  }
}
