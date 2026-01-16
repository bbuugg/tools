import { Crepe } from "@milkdown/crepe";
import "@milkdown/crepe/theme/common/style.css";
import "@milkdown/crepe/theme/frame.css";
import { Milkdown, MilkdownProvider, useEditor } from "@milkdown/react";
import React, { useEffect, useRef } from "react";
import "./index.css";

interface MilkdownEditorProps {
  value?: string;
  onChange?: (markdown: string) => void;
  placeholder?: string;
}

const CrepeEditor: React.FC<MilkdownEditorProps> = ({
  value = "",
  onChange,
}) => {
  const onChangeRef = useRef(onChange);
  const lastValueRef = useRef(value);
  const crepeRef = useRef<any>(null);

  // 保持 onChange 引用最新
  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  useEditor((root) => {
    const crepe = new Crepe({
      root,
      defaultValue: value,
    });

    crepeRef.current = crepe;

    return crepe;
  });

  // 使用定时器轮询检查内容变化
  useEffect(() => {
    const intervalId = setInterval(() => {
      if (crepeRef.current) {
        try {
          const currentMarkdown = crepeRef.current.getMarkdown();
          if (currentMarkdown !== lastValueRef.current) {
            lastValueRef.current = currentMarkdown;
            onChangeRef.current?.(currentMarkdown);
          }
        } catch (error) {
          // 编辑器可能还未完全初始化
        }
      }
    }, 500);

    return () => clearInterval(intervalId);
  }, []);

  return <Milkdown />;
};

export const MilkdownEditorWrapper: React.FC<MilkdownEditorProps> = ({
  value,
  onChange,
  placeholder,
}) => {
  // 使用 value 的长度变化作为 key，当内容从空变为有内容时重新创建编辑器
  const editorKey = value && value.length > 0 ? "loaded" : "empty";

  return (
    <MilkdownProvider key={editorKey}>
      <div
        className="milkdown-editor-container"
        style={{
          minHeight: "400px",
        }}
      >
        <CrepeEditor
          value={value}
          onChange={onChange}
          placeholder={placeholder}
        />
      </div>
    </MilkdownProvider>
  );
};
