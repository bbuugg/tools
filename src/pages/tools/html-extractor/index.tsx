import Tool from "./Tool";

const title = 'HTML 提取器';
const description = '从 HTML 中提取图片、链接、视频、脚本等资源';

export default function HtmlExtractorPage() {
  return <Tool title={title} description={description} />
}
