import Tool from "./Tool";

const title = '微信聊天模拟器';
const description = '在线制作微信聊天截图，支持自定义头像、昵称、消息内容、红包、时间等，实时预览并导出图片';

export default function WechatChatPage() {
  return <Tool title={title} description={description} />
}
