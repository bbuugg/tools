import Tool from "./Tool";

const title = 'Excel 转 JSON';
const description = '将 Excel/CSV 文件或表格文本快速转换为 JSON';

export default function ExcelToJsonPage() {
  return <Tool title={title} description={description} />
}
