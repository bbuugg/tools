import Tool from "./Tool";

const title = 'Markdown / Word 互转';
const description = 'Markdown 与 Word（.docx）双向转换，支持实时预览与导出';

export default function MarkdownWordConverterPage() {
  return <Tool title={title} description={description} />
}
