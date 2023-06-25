import React, { useEffect, useRef, useState } from 'react';
import { getFile } from '@/services/file';
import { Spin } from 'antd';
import DPlayer from 'dplayer';
import './share.less';

export default function Share(props) {
  const { id } = props.match.params;

  const fullScreenStyle = {
    position: 'fixed',
    width: '100vw',
    height: '100vh',
    border: 'none',
  };
  const [type, setType] = useState();
  const iframeRef = useRef();
  const videoRef = useRef();
  useEffect(() => {
    getFile(id, { responseType: 'blob' }).then((res) => {
      if (res.type === 'application/json') {
        const reader = new FileReader();
        reader.onload = () => {
          const res = JSON.parse(reader.result.toString());
          new DPlayer({
            container: videoRef.current,
            video: { url: res.data },
          });
          document.addEventListener('contextmenu', (e) => {
            e.preventDefault();
          });
          setType('video');
        };
        reader.readAsText(res);
      } else {
        iframeRef.current.src = window.URL.createObjectURL(res);
      }
    });
  });
  return (
    <div>
      <iframe
        ref={iframeRef}
        style={{
          ...fullScreenStyle,
          visible: type === undefined,
        }}
      >
        <Spin />
      </iframe>
      <div
        ref={videoRef}
        style={{
          ...fullScreenStyle,
          visibility: type === 'video',
        }}
      />
    </div>
  );
}
