import Tool from "./Tool";

const title = '二维码工具';
const description = '生成和识别二维码，支持自定义样式和 Logo';

export default function QrCodePage() {
  return <Tool title={title} description={description} />
}
