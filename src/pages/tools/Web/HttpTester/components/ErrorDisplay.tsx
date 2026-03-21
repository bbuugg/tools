import React from 'react';
import { Alert } from 'antd';
import { ExclamationCircleOutlined } from '@ant-design/icons';

interface ErrorDisplayProps {
  error: string | null;
}

const ErrorDisplay: React.FC<ErrorDisplayProps> = ({ error }) => {
  if (!error) {
    return null;
  }
  
  return (
    <Alert
      message={error}
      type="error"
      showIcon
      icon={<ExclamationCircleOutlined />}
      style={{ marginBottom: 16 }}
    />
  );
};

export default ErrorDisplay;