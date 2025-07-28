// components/common/QRCodeImage.js
import React from 'react';
import { QRCodeCanvas } from 'qrcode.react';

const QRCodeImage = ({ value }) => {
  const size = 100; // Size in pixels
  const canvasRef = React.useRef(null);

  return (
    <QRCodeCanvas
      value={value}
      size={size}
      level="H"
      includeMargin={true}
      style={{ width: size, height: size }}
      ref={canvasRef}
    />
  );
};

export default QRCodeImage;
