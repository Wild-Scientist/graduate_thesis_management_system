import React, { useState } from 'react';
import { Spin } from 'antd';

const Welcome = () => {
  const [imageLoading, setImageLoading] = useState(true);
  return (
    <div>
      <img
        src="https://random.imagecdn.app/1000/600"
        alt=""
        onLoad={() => setImageLoading(false)}
      />
      {imageLoading ? (
        <span>
          <Spin size="small" />
        </span>
      ) : (
        <p
          style={{
            marginTop: 10,
            color: '#bfbfbf',
            fontStyle: 'italic',
          }}
        >
          — 图片来源于网络 —
        </p>
      )}
    </div>
  );
};

export default Welcome;
