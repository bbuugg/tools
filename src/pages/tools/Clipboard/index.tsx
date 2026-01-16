import React, { useState } from 'react';
import { Button, Input, List, message, Space, Typography, Popconfirm, Layout } from 'antd';
import { PlusOutlined, SaveOutlined, DeleteOutlined } from '@ant-design/icons';
// 引入 MilkdownEditor 组件
import { MilkdownEditorWrapper } from '@/components/MilkdownEditor';

const { Title, Text } = Typography;
const { Sider, Content } = Layout;

// Define the ClipboardNote interface
interface ClipboardNote {
  uuid: string;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}

// 本地存储的 key
const NOTES_STORAGE_KEY = "clipboard_notes";

// Generate UUID helper
const generateUUID = () => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-' + Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
};

// 从本地存储获取所有便签
const getAllNotes = (): ClipboardNote[] => {
  try {
    const data = localStorage.getItem(NOTES_STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error("读取本地存储失败:", error);
    return [];
  }
};

// 保存所有便签到本地存储
const saveAllNotes = (notes: ClipboardNote[]) => {
  try {
    localStorage.setItem(NOTES_STORAGE_KEY, JSON.stringify(notes));
  } catch (error) {
    console.error("保存到本地存储失败:", error);
  }
};

const ClipboardApp: React.FC = () => {
  const [notes, setNotes] = useState<ClipboardNote[]>(getAllNotes());
  const [selectedNote, setSelectedNote] = useState<ClipboardNote | null>(notes[0] || null);

  // Save note to localStorage
  const saveNote = () => {
    if (!selectedNote) {
      message.warning("请选择一个便签");
      return;
    }

    const updatedNotes = notes.map(note =>
      note.uuid === selectedNote.uuid
        ? { ...note, title: selectedNote.title, content: selectedNote.content, updatedAt: new Date().toISOString() }
        : note
    );

    setNotes(updatedNotes);
    saveAllNotes(updatedNotes);
    message.success("便签已保存");
  };

  // Create new note
  const createNewNote = () => {
    const newNote: ClipboardNote = {
      uuid: generateUUID(),
      title: "新便签",
      content: "",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const updatedNotes = [newNote, ...notes];
    setNotes(updatedNotes);
    saveAllNotes(updatedNotes);
    setSelectedNote(newNote);
    message.success("便签创建成功");
  };

  // Delete note
  const deleteNote = (uuid: string) => {
    const updatedNotes = notes.filter(note => note.uuid !== uuid);
    setNotes(updatedNotes);
    saveAllNotes(updatedNotes);
    
    if (selectedNote?.uuid === uuid) {
      const newSelectedNote = updatedNotes[0] || null;
      setSelectedNote(newSelectedNote);
    }
    
    message.success("便签删除成功");
  };

  // Handle note selection
  const selectNote = (note: ClipboardNote) => {
    setSelectedNote(note);
  };

  // Handle title change
  const handleTitleChange = (newTitle: string) => {
    if (selectedNote) {
      const updatedNote = { ...selectedNote, title: newTitle };
      setSelectedNote(updatedNote);
      
      // Also update the notes list
      const updatedNotes = notes.map(note =>
        note.uuid === selectedNote.uuid ? updatedNote : note
      );
      setNotes(updatedNotes);
      saveAllNotes(updatedNotes);
    }
  };

  // Handle content change from editor
  const handleContentChange = (newContent: string) => {
    if (selectedNote) {
      const updatedNote = { ...selectedNote, content: newContent };
      setSelectedNote(updatedNote);
      
      // Also update the notes list
      const updatedNotes = notes.map(note =>
        note.uuid === selectedNote.uuid ? updatedNote : note
      );
      setNotes(updatedNotes);
      saveAllNotes(updatedNotes);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4">
      <div className="max-w-7xl mx-auto h-[calc(100vh-120px)]">
        <div className="mb-6">
          <Title level={2} className="text-gray-900 dark:text-white">
            便签管理
          </Title>
          <Text className="text-gray-600 dark:text-gray-400">
            使用浏览器本地存储管理您的便签
          </Text>
        </div>

        <Layout className="h-[calc(100vh-200px)] rounded-lg overflow-hidden shadow-md">
          <Sider 
            width="35%" 
            className="bg-white dark:bg-gray-800 p-4 border-r border-gray-200 dark:border-gray-700"
          >
            <div className="flex justify-between items-center mb-4">
              <Title level={4} className="!mb-0">便签列表</Title>
              <Button 
                type="primary" 
                size="middle" 
                icon={<PlusOutlined />} 
                onClick={createNewNote}
              >
                新建
              </Button>
            </div>
            
            <List
              dataSource={notes}
              renderItem={(note) => (
                <List.Item
                  key={note.uuid}
                  onClick={() => selectNote(note)}
                  className={`cursor-pointer p-3 rounded mb-2 ${
                    selectedNote?.uuid === note.uuid
                      ? "bg-blue-100 dark:bg-blue-900 border border-blue-300 dark:border-blue-700"
                      : "hover:bg-gray-100 dark:hover:bg-gray-700 border border-transparent"
                  }`}
                  actions={[
                    <Popconfirm
                      title="确认删除此便签?"
                      onConfirm={() => deleteNote(note.uuid)}
                      okText="是"
                      cancelText="否"
                    >
                      <Button 
                        type="text" 
                        danger 
                        size="small" 
                        icon={<DeleteOutlined />}
                        onClick={(e) => e.stopPropagation()}
                      />
                    </Popconfirm>
                  ]}
                >
                  <List.Item.Meta
                    title={
                      <div className="truncate">
                        <Text strong>{note.title}</Text>
                      </div>
                    }
                    description={
                      <div className="truncate text-xs mt-1">
                        {note.content ? note.content.substring(0, 50) + (note.content.length > 50 ? '...' : '') : "空便签"}
                      </div>
                    }
                  />
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    {new Date(note.updatedAt).toLocaleDateString()}
                  </div>
                </List.Item>
              )}
              className="overflow-y-auto"
            />
          </Sider>
          
          <Layout>
            <Content className="bg-white dark:bg-gray-800 p-4">
              {selectedNote ? (
                <div className="flex flex-col h-full">
                  <div className="flex justify-between items-start mb-4">
                    <Input
                      value={selectedNote.title}
                      onChange={(e) => handleTitleChange(e.target.value)}
                      placeholder="请输入标题"
                      size="large"
                      bordered={false}
                      className="!mb-0 !pb-0 !text-2xl !font-bold flex-1"
                    />
                    <Space>
                      <Text type="secondary" className="text-sm">
                        {new Date(selectedNote.updatedAt).toLocaleString()}
                      </Text>
                      <Button 
                        type="primary" 
                        icon={<SaveOutlined />} 
                        onClick={saveNote}
                      >
                        保存
                      </Button>
                    </Space>
                  </div>
                  
                  <div className="flex-1 overflow-auto min-h-[500px]">
                    <MilkdownEditorWrapper
                      value={selectedNote.content}
                      onChange={handleContentChange}
                      placeholder="在这里输入内容..."
                    />
                  </div>
                </div>
              ) : (
                <div className="h-full flex items-center justify-center">
                  <div className="text-center">
                    <Text className="text-xl text-gray-500 dark:text-gray-400">
                      请选择一个便签或创建新的便签
                    </Text>
                  </div>
                </div>
              )}
            </Content>
          </Layout>
        </Layout>
      </div>
    </div>
  );
};

export default ClipboardApp;