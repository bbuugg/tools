import React, { useState } from "react";
import {
  Card,
  Button,
  Input,
  List,
  message,
  Space,
  Typography,
  Popconfirm,
  Flex,
  Affix,
} from "antd";
import { PlusOutlined, SaveOutlined, DeleteOutlined, EditOutlined } from "@ant-design/icons";
import { FormattedMessage, useIntl } from "react-intl";
// 引入 MilkdownEditor 组件
import { MilkdownEditorWrapper } from "@/components/MilkdownEditor";

const { Title, Text } = Typography;

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
  return (
    "xxxxxxxx-xxxx-4xxx-yxxx-" +
    Date.now().toString(36) +
    Math.random().toString(36).substr(2, 9)
  );
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
  const intl = useIntl();
  const [notes, setNotes] = useState<ClipboardNote[]>(getAllNotes());
  const [selectedNote, setSelectedNote] = useState<ClipboardNote | null>(
    notes[0] || null
  );
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState<string>("");

  // Save note to localStorage
  const saveNote = () => {
    if (!selectedNote) {
      message.warning(intl.formatMessage({ id: "tools.clipboard.selectNote" }));
      return;
    }

    const updatedNotes = notes.map((note) =>
      note.uuid === selectedNote.uuid
        ? {
            ...note,
            title: selectedNote.title,
            content: selectedNote.content,
            updatedAt: new Date().toISOString(),
          }
        : note
    );

    setNotes(updatedNotes);
    saveAllNotes(updatedNotes);
    message.success(intl.formatMessage({ id: "tools.clipboard.noteSaved" }));
  };

  // Create new note
  const createNewNote = () => {
    const newNote: ClipboardNote = {
      uuid: generateUUID(),
      title: intl.formatMessage({ id: "tools.clipboard.newNote" }),
      content: "",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const updatedNotes = [newNote, ...notes];
    setNotes(updatedNotes);
    saveAllNotes(updatedNotes);
    setSelectedNote(newNote);
    message.success(intl.formatMessage({ id: "tools.clipboard.noteCreated" }));
  };

  // Delete note
  const deleteNote = (uuid: string) => {
    const confirmMessage = intl.formatMessage({ id: "tools.clipboard.confirmDelete" });
    if (!confirm(confirmMessage)) return;

    const updatedNotes = notes.filter((note) => note.uuid !== uuid);
    setNotes(updatedNotes);
    saveAllNotes(updatedNotes);

    if (selectedNote?.uuid === uuid) {
      const newSelectedNote = updatedNotes[0] || null;
      setSelectedNote(newSelectedNote);
    }

    message.success(intl.formatMessage({ id: "tools.clipboard.noteDeleted" }));
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
      const updatedNotes = notes.map((note) =>
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
      const updatedNotes = notes.map((note) =>
        note.uuid === selectedNote.uuid ? updatedNote : note
      );
      setNotes(updatedNotes);
      saveAllNotes(updatedNotes);
    }
  };

  // Start editing note title
  const startEditingTitle = (note: ClipboardNote) => {
    setEditingNoteId(note.uuid);
    setEditingTitle(note.title);
  };

  // Save edited title
  const saveEditedTitle = () => {
    if (editingNoteId && editingTitle.trim()) {
      const updatedNotes = notes.map((note) =>
        note.uuid === editingNoteId
          ? { ...note, title: editingTitle, updatedAt: new Date().toISOString() }
          : note
      );
      setNotes(updatedNotes);
      saveAllNotes(updatedNotes);
      
      // Update selected note if it's the one being edited
      if (selectedNote && selectedNote.uuid === editingNoteId) {
        setSelectedNote({ ...selectedNote, title: editingTitle });
      }
      
      setEditingNoteId(null);
      message.success(intl.formatMessage({ id: "tools.clipboard.titleUpdated" }));
    }
  };

  // Cancel editing
  const cancelEditing = () => {
    setEditingNoteId(null);
  };

  // Handle key press in title input
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      saveEditedTitle();
    } else if (e.key === "Escape") {
      cancelEditing();
    }
  };

  return (
    <div className="">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <Title level={2} className="text-gray-900 dark:text-white">
            <FormattedMessage id="tools.clipboard.name" />
          </Title>
          <Text className="text-gray-600 dark:text-gray-400">
            <FormattedMessage id="tools.clipboard.description" />
          </Text>
        </div>

        <Flex gap="middle">
          {/* 便签列表 */}
          <div className="w-1/3">
            <Affix offsetTop={120} onChange={(affixed) => console.log(affixed)}>
              <Card
                title={
                  <Space>
                    <span><FormattedMessage id="tools.clipboard.noteList" /></span>
                    <Button
                      type="primary"
                      size="small"
                      icon={<PlusOutlined />}
                      onClick={createNewNote}
                    >
                      <FormattedMessage id="tools.clipboard.new" />
                    </Button>
                  </Space>
                }
              >
                <List
                  dataSource={notes}
                  renderItem={(note) => (
                    <List.Item
                      key={note.uuid}
                      onClick={() => selectNote(note)}
                      className={`cursor-pointer p-2 rounded ${
                        selectedNote?.uuid === note.uuid
                          ? "bg-blue-100 dark:bg-blue-900"
                          : "hover:bg-gray-100 dark:hover:bg-gray-700"
                      }`}
                      actions={[
                        <Button
                          type="text"
                          size="small"
                          icon={<EditOutlined />}
                          onClick={(e) => {
                            e.stopPropagation();
                            startEditingTitle(note);
                          }}
                        />,
                        <Popconfirm
                          title={<FormattedMessage id="tools.clipboard.confirmDelete" />}
                          onConfirm={() => deleteNote(note.uuid)}
                          okText={<FormattedMessage id="common.ok" />}
                          cancelText={<FormattedMessage id="common.cancel" />}
                        >
                          <Button
                            type="text"
                            danger
                            size="small"
                            icon={<DeleteOutlined />}
                            onClick={(e) => e.stopPropagation()}
                          />
                        </Popconfirm>,
                      ]}
                    >
                      <List.Item.Meta
                        title={
                          editingNoteId === note.uuid ? (
                            <Input
                              value={editingTitle}
                              onChange={(e) => setEditingTitle(e.target.value)}
                              onPressEnter={handleKeyPress}
                              onBlur={saveEditedTitle}
                              autoFocus
                              size="small"
                            />
                          ) : (
                            <div className="truncate">
                              <Text strong>{note.title}</Text>
                            </div>
                          )
                        }
                        description={
                          <div className="truncate text-xs">
                            {note.content || intl.formatMessage({ id: "tools.clipboard.emptyNote" })}
                          </div>
                        }
                      />
                    </List.Item>
                  )}
                />
              </Card>
            </Affix>
          </div>

          {/* 便签编辑区 */}
          <div className="w-2/3">
            {selectedNote ? (
              <Card
                title={
                  <Input
                    value={selectedNote.title}
                    onChange={(e) => handleTitleChange(e.target.value)}
                    placeholder={intl.formatMessage({ id: "tools.clipboard.titlePlaceholder" })}
                    size="large"
                    bordered={false}
                    className="!mb-0 !pb-0"
                  />
                }
                extra={
                  <Space>
                    <Text type="secondary" className="text-sm">
                      {new Date(selectedNote.updatedAt).toLocaleString()}
                    </Text>
                    <Button
                      type="primary"
                      icon={<SaveOutlined />}
                      onClick={saveNote}
                    >
                      <FormattedMessage id="tools.clipboard.save" />
                    </Button>
                  </Space>
                }
                className="h-full"
              >
                <MilkdownEditorWrapper
                  value={selectedNote.content}
                  onChange={handleContentChange}
                  placeholder={intl.formatMessage({ id: "tools.clipboard.contentPlaceholder" })}
                />
              </Card>
            ) : (
              <Card className="h-full flex items-center justify-center">
                <div className="text-center">
                  <Text className="text-xl text-gray-500 dark:text-gray-400">
                    <FormattedMessage id="tools.clipboard.selectOrCreateNote" />
                  </Text>
                </div>
              </Card>
            )}
          </div>
        </Flex>
      </div>
    </div>
  );
};

export default ClipboardApp;