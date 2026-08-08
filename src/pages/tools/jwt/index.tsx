import Tool from "./Tool";

const title = 'JWT 工具';
const description = '生成、解码 JSON Web Token，支持签名验证';

export default function JwtPage() {
  return <Tool title={title} description={description} />
}
