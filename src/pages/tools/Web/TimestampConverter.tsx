import React, { useState, useEffect } from 'react';
import {
  Card,
  Input,
  Button,
  Typography,
  Space,
  Row,
  Col,
  Divider,
  Tag
} from 'antd';
import {
  CopyOutlined,
  SwapOutlined,
  ReloadOutlined,
  CheckCircleOutlined
} from '@ant-design/icons';
import { useCopy } from '@/hooks/useCopy';
import { FormattedMessage, useIntl } from 'react-intl';

const { Title, Text } = Typography;

const TimestampConverter: React.FC = () => {
  const intl = useIntl();
  const copy = useCopy();

  // Displayed current time (to avoid SSR mismatch)
  const [displayTimestamp, setDisplayTimestamp] = useState<string>('');
  
  // Timestamp and datetime states
  const [timestamp, setTimestamp] = useState('');
  const [dateTime, setDateTime] = useState('');
  const [formattedDateTime, setFormattedDateTime] = useState('');
  
  // Whether positions are swapped
  const [swapped, setSwapped] = useState(false);
  
  // Common timestamps list
  const [commonTimestamps, setCommonTimestamps] = useState<{ label: string; value: number }[]>([]);
  
  // Copy states
  const [copiedTimestamp, setCopiedTimestamp] = useState(false);
  const [copiedDateTime, setCopiedDateTime] = useState(false);
  
  // Initialization flag
  const [isInitialized, setIsInitialized] = useState(false);

  // Update common timestamps list
  const updateCommonTimestamps = (date: Date) => {
    const nowTs = Math.floor(date.getTime() / 1000);
    const commonTs = [
      { label: intl.formatMessage({ id: 'tools.timestampConverter.current_time' }), value: nowTs },
      { label: intl.formatMessage({ id: 'tools.timestampConverter.today_zero' }), value: Math.floor(new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime() / 1000) },
      { label: intl.formatMessage({ id: 'tools.timestampConverter.this_monday' }), value: Math.floor(new Date(date.getFullYear(), date.getMonth(), date.getDate() - date.getDay() + 1).getTime() / 1000) },
      { label: intl.formatMessage({ id: 'tools.timestampConverter.this_month_start' }), value: Math.floor(new Date(date.getFullYear(), date.getMonth(), 1).getTime() / 1000) },
      { label: intl.formatMessage({ id: 'tools.timestampConverter.this_year_start' }), value: Math.floor(new Date(date.getFullYear(), 0, 1).getTime() / 1000) },
    ];
    
    setCommonTimestamps(commonTs);
  };

  // Update current time and related values
  const updateCurrentTime = () => {
    const now = new Date();
    
    // Set current timestamp display
    setDisplayTimestamp(Math.floor(now.getTime() / 1000).toString());
    
    // Update common timestamps list
    updateCommonTimestamps(now);
  };

  // Initialize data on first load
  useEffect(() => {
    if (!isInitialized) {
      const now = new Date();
      
      // Update common timestamps
      updateCommonTimestamps(now);
      
      // Set current timestamp display
      setDisplayTimestamp(Math.floor(now.getTime() / 1000).toString());
      
      // Mark as initialized
      setIsInitialized(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isInitialized]);

  // Set timer to update current time every second
  useEffect(() => {
    const timer = setInterval(updateCurrentTime, 1000);
    
    return () => clearInterval(timer);
  }, []);

  // Convert timestamp to datetime
  const timestampToDateTime = (ts: string) => {
    if (!ts) return;
    
    try {
      // If timestamp is in milliseconds (13 digits), convert to seconds
      let timestampInSeconds = parseInt(ts);
      if (ts.length >= 13) {
        timestampInSeconds = Math.floor(timestampInSeconds / 1000);
      }
      
      const date = new Date(timestampInSeconds * 1000);
      
      // Check if date is valid
      if (isNaN(date.getTime())) {
        return;
      }
      
      // Format datetime
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const hours = String(date.getHours()).padStart(2, '0');
      const minutes = String(date.getMinutes()).padStart(2, '0');
      const seconds = String(date.getSeconds()).padStart(2, '0');
      
      setDateTime(`${year}-${month}-${day}T${hours}:${minutes}:${seconds}`);
      setFormattedDateTime(`${year}-${month}-${day} ${hours}:${minutes}:${seconds}`);
    } catch (error: unknown) {
      console.error(intl.formatMessage({ id: 'tools.timestampConverter.timestamp_conversion_error' }), error);
    }
  };

  // Convert datetime to timestamp
  const dateTimeToTimestamp = (dt: string) => {
    if (!dt) return;
    
    try {
      const date = new Date(dt);
      
      // Check if date is valid
      if (isNaN(date.getTime())) {
        return;
      }
      
      const ts = Math.floor(date.getTime() / 1000);
      setTimestamp(ts.toString());
    } catch (error: unknown) {
      console.error(intl.formatMessage({ id: 'tools.timestampConverter.datetime_conversion_error' }), error);
    }
  };

  // Handle timestamp input change
  const handleTimestampChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setTimestamp(value);
    timestampToDateTime(value);
  };

  // Handle datetime input change
  const handleDateTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setDateTime(value);
    
    // Update formatted datetime display
    if (value) {
      try {
        const date = new Date(value);
        if (!isNaN(date.getTime())) {
          const year = date.getFullYear();
          const month = String(date.getMonth() + 1).padStart(2, '0');
          const day = String(date.getDate()).padStart(2, '0');
          const hours = String(date.getHours()).padStart(2, '0');
          const minutes = String(date.getMinutes()).padStart(2, '0');
          const seconds = String(date.getSeconds()).padStart(2, '0');
          
          setFormattedDateTime(`${year}-${month}-${day} ${hours}:${minutes}:${seconds}`);
          
          // Also update datetime input format
          setDateTime(`${year}-${month}-${day}T${hours}:${minutes}:${seconds}`);
        }
      } catch (error: unknown) {
        console.error(intl.formatMessage({ id: 'tools.timestampConverter.datetime_format_error' }), error);
      }
    }
    
    dateTimeToTimestamp(value);
  };

  // Refresh with current time
  const refreshWithCurrentTime = () => {
    const now = new Date();
    const currentTimestamp = Math.floor(now.getTime() / 1000);
    setTimestamp(currentTimestamp.toString());
    timestampToDateTime(currentTimestamp.toString());
  };

  // Use common timestamp
  const handleUseCommonTimestamp = (ts: number) => {
    const tsStr = ts.toString();
    setTimestamp(tsStr);
    timestampToDateTime(tsStr);
  };

  // Copy timestamp to clipboard
  const copyTimestamp = () => {
    if (!timestamp) return;
    
    copy(timestamp).then(() => {
      setCopiedTimestamp(true);
      setTimeout(() => setCopiedTimestamp(false), 2000);
    });
  };

  // Copy datetime to clipboard
  const copyDateTime = () => {
    if (!formattedDateTime) return;
    
    copy(formattedDateTime).then(() => {
      setCopiedDateTime(true);
      setTimeout(() => setCopiedDateTime(false), 2000);
    });
  };

  // Swap positions
  const swapPositions = () => {
    setSwapped(!swapped);
  };

  // Set current datetime
  const setCurrentDateTime = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    
    const nowDateTime = `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;
    setDateTime(nowDateTime);
    setFormattedDateTime(`${year}-${month}-${day} ${hours}:${minutes}:${seconds}`);
    
    // Convert to timestamp
    const timestamp = Math.floor(now.getTime() / 1000);
    setTimestamp(timestamp.toString());
  };

  return (
    <div className="max-w-7xl mx-auto px-4">
      <div className="text-center mb-8">
        <Title level={1} className="text-white mb-2">
          <FormattedMessage id="tools.timestampConverter.name" />
        </Title>
        <Text className="text-slate-400 text-lg">
          <FormattedMessage id="tools.timestampConverter.description" />
        </Text>
      </div>

      <Card className="bg-white/5 border-slate-700">
        <div className="relative">
          <Row gutter={[24, 24]}>
            {!swapped ? (
              <>
                {/* Timestamp Section */}
                <Col xs={24} lg={12}>
                  <div className="flex flex-col gap-4">
                    <div className="flex items-center justify-between">
                      <Title level={4} className="text-white !mb-0">
                        <FormattedMessage id="tools.timestampConverter.timestamp" />
                      </Title>
                      <div className="flex items-center text-sm text-slate-400">
                        <span className="mr-2">
                          <FormattedMessage id="tools.timestampConverter.current_time_colon" />
                        </span>
                        <Tag color="purple" className="!mb-0">{displayTimestamp}</Tag>
                      </div>
                    </div>
                    
                    <div className="relative">
                      <Input
                        value={timestamp}
                        onChange={handleTimestampChange}
                        placeholder={intl.formatMessage({ id: 'tools.timestampConverter.enter_unix_timestamp' })}
                        className="border-slate-700"
                        suffix={
                          <Button 
                            type="text" 
                            icon={<ReloadOutlined />} 
                            onClick={refreshWithCurrentTime}
                            title={intl.formatMessage({ id: 'tools.timestampConverter.use_current_time' })}
                          />
                        }
                      />
                    </div>

                    <div className="text-sm text-slate-300">
                      <span className="mr-2">
                        <FormattedMessage id="tools.timestampConverter.common_timestamps" />:
                      </span>
                      <Space wrap>
                        {commonTimestamps.map((ts, index) => (
                          <Button
                            key={index}
                            size="small"
                            onClick={() => handleUseCommonTimestamp(ts.value)}
                          >
                            {ts.label}
                          </Button>
                        ))}
                      </Space>
                    </div>
                    
                    {timestamp && (
                      <div className="flex items-center justify-between gap-2">
                        <div className="p-2 bg-slate-800 rounded-md border border-slate-700 w-full">
                          <code className="text-xs text-slate-300 break-all">{timestamp}</code>
                        </div>
                        <Button 
                          icon={copiedTimestamp ? <CheckCircleOutlined /> : <CopyOutlined />}
                          onClick={copyTimestamp}
                          title={intl.formatMessage({ id: 'tools.timestampConverter.copy_timestamp' })}
                        />
                      </div>
                    )}
                  </div>
                </Col>
                
                {/* DateTime Section */}
                <Col xs={24} lg={12}>
                  <div className="flex flex-col gap-4">
                    <div className="flex items-center justify-between">
                      <Title level={4} className="text-white !mb-0">
                        <FormattedMessage id="tools.timestampConverter.datetime" />
                      </Title>
                    </div>
                    
                    <div className="relative">
                      <Input
                        value={dateTime}
                        onChange={handleDateTimeChange}
                        placeholder={intl.formatMessage({ id: 'tools.timestampConverter.enter_datetime' })}
                        className="border-slate-700"
                        suffix={
                          <Button 
                            type="text" 
                            icon={<ReloadOutlined />} 
                            onClick={setCurrentDateTime}
                            title={intl.formatMessage({ id: 'tools.timestampConverter.use_current_time' })}
                          />
                        }
                      />
                    </div>
                    
                    {formattedDateTime && (
                      <div className="flex items-center justify-between gap-2">
                        <div className="p-2 bg-slate-800 rounded-md border border-slate-700 w-full">
                          <code className="text-xs text-slate-300 break-all">{formattedDateTime}</code>
                        </div>
                        <Button 
                          icon={copiedDateTime ? <CheckCircleOutlined /> : <CopyOutlined />}
                          onClick={copyDateTime}
                          title={intl.formatMessage({ id: 'tools.timestampConverter.copy_datetime' })}
                        />
                      </div>
                    )}
                  </div>
                </Col>
              </>
            ) : (
              <>
                {/* DateTime Section (swapped) */}
                <Col xs={24} lg={12}>
                  <div className="flex flex-col gap-4">
                    <div className="flex items-center justify-between">
                      <Title level={4} className="text-white !mb-0">
                        <FormattedMessage id="tools.timestampConverter.datetime" />
                      </Title>
                    </div>
                    
                    <div className="relative">
                      <Input
                        value={dateTime}
                        onChange={handleDateTimeChange}
                        placeholder={intl.formatMessage({ id: 'tools.timestampConverter.enter_datetime' })}
                        className="border-slate-700"
                        suffix={
                          <Button 
                            type="text" 
                            icon={<ReloadOutlined />} 
                            onClick={setCurrentDateTime}
                            title={intl.formatMessage({ id: 'tools.timestampConverter.use_current_time' })}
                          />
                        }
                      />
                    </div>
                    
                    {formattedDateTime && (
                      <div className="flex items-center justify-between gap-2">
                        <div className="p-2 bg-slate-800 rounded-md border border-slate-700 w-full">
                          <code className="text-xs text-slate-300 break-all">{formattedDateTime}</code>
                        </div>
                        <Button 
                          icon={copiedDateTime ? <CheckCircleOutlined /> : <CopyOutlined />}
                          onClick={copyDateTime}
                          title={intl.formatMessage({ id: 'tools.timestampConverter.copy_datetime' })}
                        />
                      </div>
                    )}
                  </div>
                </Col>
                
                {/* Timestamp Section (swapped) */}
                <Col xs={24} lg={12}>
                  <div className="flex flex-col gap-4">
                    <div className="flex items-center justify-between">
                      <Title level={4} className="text-white !mb-0">
                        <FormattedMessage id="tools.timestampConverter.timestamp" />
                      </Title>
                      <div className="flex items-center text-sm text-slate-400">
                        <span className="mr-2">
                          <FormattedMessage id="tools.timestampConverter.current_time_colon" />
                        </span>
                        <Tag color="purple" className="!mb-0">{displayTimestamp}</Tag>
                      </div>
                    </div>
                    
                    <div className="relative">
                      <Input
                        value={timestamp}
                        onChange={handleTimestampChange}
                        placeholder={intl.formatMessage({ id: 'tools.timestampConverter.enter_unix_timestamp' })}
                        className="border-slate-700"
                        suffix={
                          <Button 
                            type="text" 
                            icon={<ReloadOutlined />} 
                            onClick={refreshWithCurrentTime}
                            title={intl.formatMessage({ id: 'tools.timestampConverter.use_current_time' })}
                          />
                        }
                      />
                    </div>

                    <div className="text-sm text-slate-300">
                      <span className="mr-2">
                        <FormattedMessage id="tools.timestampConverter.common_timestamps" />:
                      </span>
                      <Space wrap>
                        {commonTimestamps.map((ts, index) => (
                          <Button
                            key={index}
                            size="small"
                            onClick={() => handleUseCommonTimestamp(ts.value)}
                          >
                            {ts.label}
                          </Button>
                        ))}
                      </Space>
                    </div>
                    
                    {timestamp && (
                      <div className="flex items-center justify-between gap-2">
                        <div className="p-2 bg-slate-800 rounded-md border border-slate-700 w-full">
                          <code className="text-xs text-slate-300 break-all">{timestamp}</code>
                        </div>
                        <Button 
                          icon={copiedTimestamp ? <CheckCircleOutlined /> : <CopyOutlined />}
                          onClick={copyTimestamp}
                          title={intl.formatMessage({ id: 'tools.timestampConverter.copy_timestamp' })}
                        />
                      </div>
                    )}
                  </div>
                </Col>
              </>
            )}
          </Row>
          
          <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2">
            <Button
              type="primary"
              shape="circle"
              size="large"
              icon={<SwapOutlined />}
              onClick={swapPositions}
              title={intl.formatMessage({ id: 'tools.timestampConverter.swap_positions' })}
              className="shadow-lg bg-green-600 hover:bg-green-700 border-green-600"
            />
          </div>
        </div>
        
        <Divider className="my-8 border-slate-700" />
        
        <div className="space-y-4">
          <Title level={4} className="text-white">
            <FormattedMessage id="tools.timestampConverter.how_to_use" />
          </Title>
          <ul className="list-disc pl-5 space-y-2">
            <li><FormattedMessage id="tools.timestampConverter.how_to_use_desc1" /></li>
            <li><FormattedMessage id="tools.timestampConverter.how_to_use_desc2" /></li>
            <li><FormattedMessage id="tools.timestampConverter.how_to_use_desc3" /></li>
            <li><FormattedMessage id="tools.timestampConverter.how_to_use_desc4" /></li>
          </ul>
        </div>
      </Card>
    </div>
  );
};

export default TimestampConverter;