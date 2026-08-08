import Tool from "./Tool";

const title = '音频工作室';
const description = '在线音频工具，支持录音、上传、分贝分析、波形显示、格式转换（MP3/FLAC/OGG/WAV）及语音合成（TTS）';

export default function AudioStudioPage() {
  return <Tool title={title} description={description} />
}
