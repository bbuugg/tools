import Tool from "./Tool";

const title = "Markdown / PDF 互转";
const description = "Markdown 与 PDF 双向转换，支持实时预览、PDF 导出与 PDF 文本提取";

export default function MarkdownPdfConverterPage() {
  return <Tool title={title} description={description} />
}
