import React, { useState, useEffect } from 'react';
import { Card, Input, Button, Table, Space, Alert, Typography } from 'antd';
import { PlusOutlined, ReloadOutlined } from '@ant-design/icons';

const { Title } = Typography;

interface DbRecord {
  id: number;
  name: string;
  email: string;
  created_at: string;
}

const SimpleDbDemo: React.FC = () => {
  const [records, setRecords] = useState<DbRecord[]>([]);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // 初始化数据库表
  useEffect(() => {
    const initTable = async () => {
      if (window.electronAPI) {
        try {
          await window.electronAPI.dbCreateTable('users', {
            id: 'INTEGER PRIMARY KEY AUTOINCREMENT',
            name: 'TEXT NOT NULL',
            email: 'TEXT UNIQUE NOT NULL',
            created_at: 'DATETIME DEFAULT CURRENT_TIMESTAMP'
          });
          loadRecords();
        } catch (err) {
          setError('Failed to initialize database table');
          console.error(err);
        }
      }
    };

    initTable();
  }, []);

  const loadRecords = async () => {
    if (!window.electronAPI) {
      setError('Database operations are only available in Electron environment');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const result = await window.electronAPI.dbQuery<DbRecord[]>(
        'SELECT id, name, email, created_at FROM users ORDER BY id DESC'
      );

      if (result.success) {
        setRecords(result.data || []);
      } else {
        setError(result.error || 'Unknown error');
      }
    } catch (err) {
      setError('Failed to load records');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const addRecord = async () => {
    if (!name.trim() || !email.trim()) {
      setError('Name and email are required');
      return;
    }

    if (!window.electronAPI) {
      setError('Database operations are only available in Electron environment');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const result = await window.electronAPI.dbExecute(
        'INSERT INTO users (name, email) VALUES (?, ?)',
        [name.trim(), email.trim()]
      );

      if (result.success) {
        setSuccess('Record added successfully');
        setName('');
        setEmail('');
        loadRecords(); // Refresh the list
      } else {
        setError(result.error || 'Unknown error');
      }
    } catch (err) {
      setError('Failed to add record');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
    },
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: 'Created At',
      dataIndex: 'created_at',
      key: 'created_at',
    },
  ];

  return (
    <div className="p-4 md:p-6 max-w-6xl mx-auto">
      <Title level={2}>Simple Database Demo</Title>
      <p className="text-gray-500 dark:text-gray-400 mb-6">
        This demo shows how to use better-sqlite3 in the Electron environment
      </p>

      <Card className="mb-6">
        <Space className="w-full" orientation="vertical" size="middle">
          {error && <Alert message="Error" description={error} type="error" showIcon />}
          {success && <Alert message="Success" description={success} type="success" showIcon />}
          
          <Space wrap>
            <Input
              placeholder="Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              style={{ width: 200 }}
            />
            <Input
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{ width: 250 }}
            />
            <Button 
              type="primary" 
              icon={<PlusOutlined />} 
              onClick={addRecord}
              loading={loading}
            >
              Add Record
            </Button>
            <Button 
              icon={<ReloadOutlined />} 
              onClick={loadRecords}
              loading={loading}
            >
              Refresh
            </Button>
          </Space>
        </Space>
      </Card>

      <Card>
        <Table 
          dataSource={records} 
          columns={columns} 
          rowKey="id"
          loading={loading}
          pagination={{ pageSize: 10 }}
        />
      </Card>
    </div>
  );
};

export default SimpleDbDemo;