import Tool from "./Tool";

const title = "文本对比";
const description = "逐行或逐词对比两段文本的差异，支持并排与统一视图，可忽略空白与大小写。";

export default function TextDiffPage() {
  return <Tool title={title} description={description} />
}
