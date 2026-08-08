import Tool from "./Tool";

const title = 'GIF 编辑器';
const description = '上传 GIF，编辑帧序列、延迟，重新生成';

export default function GifEditorPage() {
  return <Tool title={title} description={description} />
}
