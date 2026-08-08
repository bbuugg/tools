import Tool from "./Tool";

const title = '视频转 GIF';
const description = '从视频中截取片段生成 GIF，支持文字叠加';

export default function VideoToGifPage() {
  return <Tool title={title} description={description} />
}
