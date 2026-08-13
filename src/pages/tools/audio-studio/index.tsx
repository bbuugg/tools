import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Spinner } from "@/components/ui/spinner";
import { Textarea } from "@/components/ui/textarea";
import {
  Download,
  Mic,
  Mic2,
  Music,
  Pause,
  Play,
  Settings2,
  Square,
  Trash2,
  Upload,
  Volume2
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

// ── Audio format conversion utilities ────────────────────────────

/** Encode an AudioBuffer to a WAV Blob (16-bit PCM) */
function encodeWav(audioBuffer: AudioBuffer): Blob {
  const numChannels = audioBuffer.numberOfChannels;
  const sampleRate = audioBuffer.sampleRate;
  const numFrames = audioBuffer.length;
  const bytesPerSample = 2;
  const blockAlign = numChannels * bytesPerSample;
  const dataSize = numFrames * blockAlign;
  const bufferSize = 44 + dataSize;

  const buffer = new ArrayBuffer(bufferSize);
  const view = new DataView(buffer);

  // RIFF header
  view.setUint8(0, "R".charCodeAt(0));
  view.setUint8(1, "I".charCodeAt(0));
  view.setUint8(2, "F".charCodeAt(0));
  view.setUint8(3, "F".charCodeAt(0));
  view.setUint32(4, 36 + dataSize, true);
  view.setUint8(8, "W".charCodeAt(0));
  view.setUint8(9, "A".charCodeAt(0));
  view.setUint8(10, "V".charCodeAt(0));
  view.setUint8(11, "E".charCodeAt(0));

  // fmt chunk
  view.setUint8(12, "f".charCodeAt(0));
  view.setUint8(13, "m".charCodeAt(0));
  view.setUint8(14, "t".charCodeAt(0));
  view.setUint8(15, " ".charCodeAt(0));
  view.setUint32(16, 16, true); // chunk size
  view.setUint16(20, 1, true); // PCM
  view.setUint16(22, numChannels, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * blockAlign, true); // byte rate
  view.setUint16(32, blockAlign, true);
  view.setUint16(34, 16, true); // bits per sample

  // data chunk
  view.setUint8(36, "d".charCodeAt(0));
  view.setUint8(37, "a".charCodeAt(0));
  view.setUint8(38, "t".charCodeAt(0));
  view.setUint8(39, "a".charCodeAt(0));
  view.setUint32(40, dataSize, true);

  // Interleave channels
  const channels: Float32Array[] = [];
  for (let ch = 0; ch < numChannels; ch++) {
    channels.push(audioBuffer.getChannelData(ch));
  }

  let offset = 44;
  for (let i = 0; i < numFrames; i++) {
    for (let ch = 0; ch < numChannels; ch++) {
      const sample = Math.max(-1, Math.min(1, channels[ch][i]));
      view.setInt16(offset, sample < 0 ? sample * 0x8000 : sample * 0x7fff, true);
      offset += 2;
    }
  }

  return new Blob([buffer], { type: "audio/wav" });
}

/** Encode an AudioBuffer to an MP3 Blob using lamejs */
async function encodeMp3(audioBuffer: AudioBuffer): Promise<Blob> {
  const { Mp3Encoder } = await import("@breezystack/lamejs");
  const numChannels = Math.min(audioBuffer.numberOfChannels, 2);
  const sampleRate = audioBuffer.sampleRate;
  const kbps = 128;
  const encoder = new Mp3Encoder(numChannels, sampleRate, kbps);

  // Get channel data
  const leftChannel = audioBuffer.getChannelData(0);
  const rightChannel = numChannels > 1 ? audioBuffer.getChannelData(1) : leftChannel;

  // Convert Float32 to Int16
  const left = new Int16Array(leftChannel.length);
  const right = new Int16Array(rightChannel.length);
  for (let i = 0; i < leftChannel.length; i++) {
    left[i] = Math.max(-32768, Math.min(32767, leftChannel[i] * 32767));
    right[i] = Math.max(-32768, Math.min(32767, rightChannel[i] * 32767));
  }

  const blockSize = 1152;
  const mp3Data: BlobPart[] = [];

  for (let i = 0; i < left.length; i += blockSize) {
    const leftChunk = left.subarray(i, i + blockSize);
    const rightChunk = right.subarray(i, i + blockSize);
    const encBuf = numChannels > 1
      ? encoder.encodeBuffer(leftChunk, rightChunk)
      : encoder.encodeBuffer(leftChunk);
    if (encBuf.length > 0) mp3Data.push(new Uint8Array(encBuf).buffer);
  }

  const endBuf = encoder.flush();
  if (endBuf.length > 0) mp3Data.push(new Uint8Array(endBuf).buffer);

  return new Blob(mp3Data, { type: "audio/mp3" });
}

/** Load the FLAC library dynamically from CDN */
function loadFlacLibrary(): Promise<any> {
  return new Promise((resolve, reject) => {
    if ((window as any).Flac && (window as any).Flac.isReady) {
      resolve((window as any).Flac);
      return;
    }

    // Check if script is already loading
    if ((window as any)._flacLoading) {
      (window as any)._flacLoading.push({ resolve, reject });
      return;
    }

    (window as any)._flacLoading = [{ resolve, reject }];

    const script = document.createElement("script");
    script.src = "/js/libflac.min.js";
    script.async = true;

    script.onload = () => {
      const Flac = (window as any).Flac;
      if (!Flac) {
        const pending = (window as any)._flacLoading;
        delete (window as any)._flacLoading;
        pending.forEach((p: any) => p.reject(new Error("FLAC 库加载失败")));
        return;
      }

      if (Flac.isReady) {
        const pending = (window as any)._flacLoading;
        delete (window as any)._flacLoading;
        pending.forEach((p: any) => p.resolve(Flac));
      } else {
        Flac.on("ready", () => {
          const pending = (window as any)._flacLoading;
          delete (window as any)._flacLoading;
          pending.forEach((p: any) => p.resolve(Flac));
        });
        Flac.on("error", (err: any) => {
          const pending = (window as any)._flacLoading;
          delete (window as any)._flacLoading;
          pending.forEach((p: any) => p.reject(err));
        });
      }
    };

    script.onerror = () => {
      const pending = (window as any)._flacLoading;
      delete (window as any)._flacLoading;
      pending.forEach((p: any) => p.reject(new Error("无法加载 FLAC 编码器")));
    };

    document.head.appendChild(script);
  });
}

/** Encode an AudioBuffer to a FLAC Blob using libflacjs */
async function encodeFlac(audioBuffer: AudioBuffer): Promise<Blob> {
  const Flac = await loadFlacLibrary();

  return new Promise((resolve, reject) => {
    try {
      const sampleRate = audioBuffer.sampleRate;
      const channels = audioBuffer.numberOfChannels;
      const bps = 16;
      const compressionLevel = 5;
      const totalSamples = audioBuffer.length;

      const encoderId = Flac.create_libflac_encoder(sampleRate, channels, bps, compressionLevel, totalSamples, false, 0);
      if (encoderId === 0) {
        reject(new Error("无法创建 FLAC 编码器"));
        return;
      }

      const flacData: ArrayBuffer[] = [];

      const writeCallback = (encodedData: Uint8Array) => {
        flacData.push(new Uint8Array(encodedData).buffer);
      };

      const metadataCallback = (_data: any) => {
        // metadata callback - not needed for basic encoding
      };

      const status = Flac.init_encoder_stream(encoderId, writeCallback, metadataCallback);
      if (status !== 0) {
        reject(new Error(`FLAC 编码器初始化失败 (status: ${status})`));
        return;
      }

      // Convert Float32 to Int32 and interleave
      const interleaved = new Int32Array(totalSamples * channels);
      for (let i = 0; i < totalSamples; i++) {
        for (let ch = 0; ch < channels; ch++) {
          const sample = audioBuffer.getChannelData(ch)[i];
          interleaved[i * channels + ch] = Math.round(sample * 0x7fffffff);
        }
      }

      // Encode in blocks
      const blockSize = 4096;
      for (let i = 0; i < totalSamples; i += blockSize) {
        const end = Math.min(i + blockSize, totalSamples);
        const chunk = interleaved.subarray(i * channels, end * channels);
        const ok = Flac.FLAC__stream_encoder_process_interleaved(encoderId, chunk, end - i);
        if (!ok) {
          reject(new Error("FLAC 编码过程中出错"));
          return;
        }
      }

      Flac.FLAC__stream_encoder_finish(encoderId);
      Flac.FLAC__stream_encoder_delete(encoderId);

      resolve(new Blob(flacData, { type: "audio/flac" }));
    } catch (err) {
      reject(err);
    }
  });
}

/** Encode an AudioBuffer to an OGG Blob using MediaRecorder */
async function encodeOgg(audioBuffer: AudioBuffer): Promise<Blob> {
  // Check if browser supports OGG encoding via MediaRecorder
  const mimeTypes = ["audio/ogg;codecs=opus", "audio/ogg"];
  let supportedMime = "";
  for (const mime of mimeTypes) {
    if (typeof MediaRecorder !== "undefined" && MediaRecorder.isTypeSupported(mime)) {
      supportedMime = mime;
      break;
    }
  }

  if (!supportedMime) {
    // Fallback to webm/opus if OGG is not supported
    if (typeof MediaRecorder !== "undefined" && MediaRecorder.isTypeSupported("audio/webm;codecs=opus")) {
      supportedMime = "audio/webm;codecs=opus";
    } else {
      throw new Error("浏览器不支持 OGG 编码，请使用 Chrome 或 Firefox");
    }
  }

  // Use OfflineAudioContext to render the audio, then play it back through MediaRecorder
  return new Promise((resolve, reject) => {
    try {
      const sampleRate = audioBuffer.sampleRate;
      const duration = audioBuffer.duration;

      // Create an AudioContext for playback
      const audioCtx = new AudioContext({ sampleRate });
      const destination = audioCtx.createMediaStreamDestination();
      const source = audioCtx.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(destination);

      const recorder = new MediaRecorder(destination.stream, { mimeType: supportedMime });
      const chunks: Blob[] = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunks.push(e.data);
      };

      recorder.onstop = () => {
        const blob = new Blob(chunks, { type: supportedMime });
        audioCtx.close();
        resolve(blob);
      };

      recorder.onerror = (e) => {
        audioCtx.close();
        reject(e);
      };

      recorder.start();
      source.start();

      // Stop recording after the audio finishes
      setTimeout(() => {
        if (recorder.state !== "inactive") {
          recorder.stop();
        }
      }, (duration + 0.1) * 1000);
    } catch (err) {
      reject(err);
    }
  });
}

// ── Audio analysis ───────────────────────────────────────────────

interface AudioAnalysis {
  minDb: number;
  maxDb: number;
  avgDb: number;
  duration: number;
  sampleRate: number;
  channels: number;
}

function analyzeAudio(audioBuffer: AudioBuffer): AudioAnalysis {
  const numChannels = audioBuffer.numberOfChannels;
  const numFrames = audioBuffer.length;
  const channelData: Float32Array[] = [];
  for (let ch = 0; ch < numChannels; ch++) {
    channelData.push(audioBuffer.getChannelData(ch));
  }

  let maxAmplitude = 0;
  let sumAmplitude = 0;
  let count = 0;
  let minAmplitude = 1;

  for (let ch = 0; ch < numChannels; ch++) {
    const data = channelData[ch];
    for (let i = 0; i < numFrames; i++) {
      const abs = Math.abs(data[i]);
      if (abs > maxAmplitude) maxAmplitude = abs;
      if (abs < minAmplitude && abs > 0) minAmplitude = abs;
      sumAmplitude += abs;
      count++;
    }
  }

  const avgAmplitude = count > 0 ? sumAmplitude / count : 0;

  // Convert to dB: dB = 20 * log10(amplitude)
  // Use a reference of 1.0 (full scale)
  const toDb = (amp: number) => (amp > 0 ? 20 * Math.log10(amp) : -Infinity);

  return {
    minDb: toDb(minAmplitude === 1 ? 0.0001 : minAmplitude),
    maxDb: toDb(maxAmplitude),
    avgDb: toDb(avgAmplitude),
    duration: audioBuffer.duration,
    sampleRate: audioBuffer.sampleRate,
    channels: numChannels,
  };
}

// ── Format helper ────────────────────────────────────────────────

function formatDuration(seconds: number): string {
  if (!isFinite(seconds)) return "0:00";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

function formatDb(db: number): string {
  if (!isFinite(db)) return "-∞ dB";
  return `${db.toFixed(1)} dB`;
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

// ── Main component ───────────────────────────────────────────────

type FormatType = "wav" | "mp3" | "flac" | "ogg";

export default function AudioStudioPage() {
  // Audio state
  const [audioBuffer, setAudioBuffer] = useState<AudioBuffer | null>(null);
  const [audioUrl, setAudioUrl] = useState<string>("");
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioName, setAudioName] = useState<string>("");
  const [analysis, setAnalysis] = useState<AudioAnalysis | null>(null);
  const [loading, setLoading] = useState(false);
  const [converting, setConverting] = useState(false);
  const [convertFormat, setConvertFormat] = useState<FormatType>("mp3");
  const [convertedBlob, setConvertedBlob] = useState<{ blob: Blob; format: FormatType; name: string } | null>(null);
  const [error, setError] = useState<string>("");

  // Recording state
  const [recording, setRecording] = useState(false);
  const [recordTime, setRecordTime] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordChunksRef = useRef<Blob[]>([]);
  const recordTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const recordStreamRef = useRef<MediaStream | null>(null);

  // Playback state
  const [playing, setPlaying] = useState(false);
  const [playTime, setPlayTime] = useState(0);
  const audioElementRef = useRef<HTMLAudioElement | null>(null);
  const waveformCanvasRef = useRef<HTMLCanvasElement>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const sourceNodeRef = useRef<MediaElementAudioSourceNode | null>(null);
  const rafRef = useRef<number | null>(null);

  // TTS state
  const [ttsText, setTtsText] = useState("你好，欢迎使用音频工作室！");
  const [ttsVoice, setTtsVoice] = useState<string>("");
  const [ttsRate, setTtsRate] = useState(1);
  const [ttsPitch, setTtsPitch] = useState(1);
  const [ttsVolume, setTtsVolume] = useState(1);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [ttsSpeaking, setTtsSpeaking] = useState(false);

  // ── Load audio file ──────────────────────────────────────────

  const loadAudioFile = useCallback(async (file: File) => {
    setLoading(true);
    setError("");
    try {
      const arrayBuffer = await file.arrayBuffer();
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      const ctx = new AudioCtx();
      const decoded = await ctx.decodeAudioData(arrayBuffer);
      ctx.close();

      // Clean up previous URL
      if (audioUrl) URL.revokeObjectURL(audioUrl);

      const url = URL.createObjectURL(file);
      setAudioBuffer(decoded);
      setAudioUrl(url);
      setAudioBlob(file);
      setAudioName(file.name);
      setAnalysis(analyzeAudio(decoded));
      setConvertedBlob(null);
      setPlayTime(0);
    } catch (err) {
      setError(`音频加载失败: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setLoading(false);
    }
  }, [audioUrl]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) loadAudioFile(file);
    e.target.value = "";
  };

  // ── Recording ────────────────────────────────────────────────

  const startRecording = async () => {
    setError("");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      recordStreamRef.current = stream;

      const mimeType = MediaRecorder.isTypeSupported("audio/webm;codecs=opus")
        ? "audio/webm;codecs=opus"
        : "";

      const recorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined);
      recordChunksRef.current = [];
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) recordChunksRef.current.push(e.data);
      };

      recorder.onstop = async () => {
        const blob = new Blob(recordChunksRef.current, { type: recorder.mimeType || "audio/webm" });
        const file = new File([blob], `recording-${Date.now()}.webm`, { type: blob.type });

        // Stop all tracks
        if (recordStreamRef.current) {
          recordStreamRef.current.getTracks().forEach((t) => t.stop());
          recordStreamRef.current = null;
        }

        // Load the recording as audio
        await loadAudioFile(file);
      };

      recorder.start();
      setRecording(true);
      setRecordTime(0);

      recordTimerRef.current = setInterval(() => {
        setRecordTime((t) => t + 0.1);
      }, 100);
    } catch (err) {
      setError(`录音启动失败: ${err instanceof Error ? err.message : String(err)}`);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop();
    }
    setRecording(false);
    if (recordTimerRef.current) {
      clearInterval(recordTimerRef.current);
      recordTimerRef.current = null;
    }
  };

  // ── Playback with waveform ──────────────────────────────────

  // createMediaElementSource can only be called ONCE per HTMLMediaElement,
  // even across different AudioContexts. So we create the audio graph
  // exactly once and reuse it — just updating the <audio> src is enough
  // for the MediaElementSourceNode to pick up the new audio.
  const setupAudioContext = useCallback(() => {
    if (!audioElementRef.current) return;
    // Already set up — nothing to do.
    if (audioCtxRef.current) return;

    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    const ctx = new AudioCtx();
    audioCtxRef.current = ctx;

    const source = ctx.createMediaElementSource(audioElementRef.current);
    sourceNodeRef.current = source;

    const analyser = ctx.createAnalyser();
    analyser.fftSize = 2048;
    analyser.smoothingTimeConstant = 0.8;
    analyserRef.current = analyser;

    source.connect(analyser);
    analyser.connect(ctx.destination);
  }, []);

  const drawWaveform = useCallback(() => {
    const canvas = waveformCanvasRef.current;
    const analyser = analyserRef.current;
    if (!canvas || !analyser) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    const bufferLength = analyser.fftSize;
    const dataArray = new Uint8Array(bufferLength);

    const draw = () => {
      rafRef.current = requestAnimationFrame(draw);
      analyser.getByteTimeDomainData(dataArray);

      ctx.fillStyle = "#1e293b";
      ctx.fillRect(0, 0, width, height);

      ctx.lineWidth = 2;
      ctx.strokeStyle = "#22d3ee";
      ctx.beginPath();

      const sliceWidth = width / bufferLength;
      let x = 0;

      for (let i = 0; i < bufferLength; i++) {
        const v = dataArray[i] / 128.0;
        const y = (v * height) / 2;

        if (i === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
        x += sliceWidth;
      }

      ctx.lineTo(width, height / 2);
      ctx.stroke();

      // Draw dB level indicator
      let sum = 0;
      for (let i = 0; i < bufferLength; i++) {
        const v = (dataArray[i] - 128) / 128;
        sum += v * v;
      }
      const rms = Math.sqrt(sum / bufferLength);
      const db = rms > 0 ? 20 * Math.log10(rms) : -Infinity;

      // Draw dB text
      ctx.fillStyle = "#94a3b8";
      ctx.font = "12px monospace";
      ctx.fillText(`${formatDb(db)}`, 8, 18);
    };

    draw();
  }, []);

  const handlePlay = async () => {
    if (!audioElementRef.current) return;

    setupAudioContext();

    if (audioCtxRef.current?.state === "suspended") {
      await audioCtxRef.current.resume();
    }

    audioElementRef.current.play();
    setPlaying(true);
    drawWaveform();
  };

  const handlePause = () => {
    if (audioElementRef.current) {
      audioElementRef.current.pause();
    }
    setPlaying(false);
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
  };

  // ── Format conversion ────────────────────────────────────────

  const handleConvert = async () => {
    if (!audioBuffer) return;
    setConverting(true);
    setError("");
    setConvertedBlob(null);

    try {
      let blob: Blob;
      switch (convertFormat) {
        case "wav":
          blob = encodeWav(audioBuffer);
          break;
        case "mp3":
          blob = await encodeMp3(audioBuffer);
          break;
        case "flac":
          blob = await encodeFlac(audioBuffer);
          break;
        case "ogg":
          blob = await encodeOgg(audioBuffer);
          break;
        default:
          throw new Error(`不支持的格式: ${convertFormat}`);
      }

      const baseName = audioName.replace(/\.[^.]+$/, "") || "audio";
      const name = `${baseName}.${convertFormat}`;
      setConvertedBlob({ blob, format: convertFormat, name });
    } catch (err) {
      setError(`转换失败: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setConverting(false);
    }
  };

  const handleDownloadConverted = () => {
    if (!convertedBlob) return;
    const url = URL.createObjectURL(convertedBlob.blob);
    const link = document.createElement("a");
    link.download = convertedBlob.name;
    link.href = url;
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  // ── TTS ──────────────────────────────────────────────────────

  useEffect(() => {
    if (typeof window === "undefined" || !window.speechSynthesis) return;

    const loadVoices = () => {
      const v = window.speechSynthesis.getVoices();
      setVoices(v);
      if (v.length > 0 && !ttsVoice) {
        // Try to find a Chinese voice
        const zhVoice = v.find((voice) => voice.lang.startsWith("zh"));
        setTtsVoice(zhVoice?.voiceURI || v[0].voiceURI);
      }
    };

    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;

    return () => {
      window.speechSynthesis.onvoiceschanged = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleTTS = () => {
    if (typeof window === "undefined" || !window.speechSynthesis) {
      setError("浏览器不支持语音合成");
      return;
    }

    if (ttsSpeaking) {
      window.speechSynthesis.cancel();
      setTtsSpeaking(false);
      return;
    }

    if (!ttsText.trim()) return;

    const utterance = new SpeechSynthesisUtterance(ttsText);
    const voice = voices.find((v) => v.voiceURI === ttsVoice);
    if (voice) utterance.voice = voice;
    utterance.rate = ttsRate;
    utterance.pitch = ttsPitch;
    utterance.volume = ttsVolume;

    utterance.onend = () => setTtsSpeaking(false);
    utterance.onerror = () => setTtsSpeaking(false);

    window.speechSynthesis.speak(utterance);
    setTtsSpeaking(true);
  };

  const handleTTSDownload = async () => {
    if (!ttsText.trim()) return;
    setError("");

    try {
      // Use SpeechSynthesis to generate audio, capture via MediaRecorder
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      const ctx = new AudioCtx();
      const destination = ctx.createMediaStreamDestination();

      const utterance = new SpeechSynthesisUtterance(ttsText);
      const voice = voices.find((v) => v.voiceURI === ttsVoice);
      if (voice) utterance.voice = voice;
      utterance.rate = ttsRate;
      utterance.pitch = ttsPitch;
      utterance.volume = ttsVolume;

      // Note: SpeechSynthesis doesn't directly connect to AudioContext
      // We need to use a workaround with MediaRecorder
      // This is a limitation - we'll use the audio output capture
      const mimeType = MediaRecorder.isTypeSupported("audio/webm;codecs=opus") ? "audio/webm;codecs=opus" : "";
      const recorder = new MediaRecorder(destination.stream, mimeType ? { mimeType } : undefined);
      const chunks: Blob[] = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunks.push(e.data);
      };

      recorder.onstop = () => {
        const blob = new Blob(chunks, { type: mimeType || "audio/webm" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.download = `tts-${Date.now()}.webm`;
        link.href = url;
        link.click();
        setTimeout(() => URL.revokeObjectURL(url), 1000);
        ctx.close();
      };

      // Start recording and speaking
      recorder.start();
      window.speechSynthesis.speak(utterance);

      utterance.onend = () => {
        setTimeout(() => {
          if (recorder.state !== "inactive") recorder.stop();
        }, 500);
      };
    } catch (err) {
      setError(`TTS 录音失败: ${err instanceof Error ? err.message : String(err)}`);
    }
  };

  // ── Cleanup ──────────────────────────────────────────────────

  useEffect(() => {
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      if (audioCtxRef.current) audioCtxRef.current.close();
      if (recordTimerRef.current) clearInterval(recordTimerRef.current);
      if (recordStreamRef.current) {
        recordStreamRef.current.getTracks().forEach((t) => t.stop());
      }
    };
  }, []);

  // Reset playback state whenever the audio source changes.
  useEffect(() => {
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    setPlaying(false);
    setPlayTime(0);
  }, [audioUrl]);

  // ── Update play time ─────────────────────────────────────────

  useEffect(() => {
    const audio = audioElementRef.current;
    if (!audio) return;

    const onTimeUpdate = () => setPlayTime(audio.currentTime);
    const onEnded = () => {
      setPlaying(false);
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
    };

    audio.addEventListener("timeupdate", onTimeUpdate);
    audio.addEventListener("ended", onEnded);

    return () => {
      audio.removeEventListener("timeupdate", onTimeUpdate);
      audio.removeEventListener("ended", onEnded);
    };
  }, [audioUrl]);

  // ── Render ───────────────────────────────────────────────────

  return (
    <>
      <div>
        <div className="max-w-6xl mx-auto px-4 py-6 space-y-4">

          {error && (
            <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          {/* ── Audio Input Section ── */}
          <div className="rounded-xl border border-gray-200 bg-white p-5 space-y-4">
            <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
              <Mic2 className="size-4" /> 音频输入
            </h3>

            <div className="grid gap-4 sm:grid-cols-2 items-stretch">
              {/* Upload */}
              <div className="space-y-2 flex flex-col">
                <Label className="text-xs text-gray-500">上传音频文件</Label>
                <label className="flex-1 flex flex-col items-center justify-center gap-2 border-2 border-dashed border-gray-300 rounded-lg py-8 cursor-pointer hover:border-purple-400 hover:bg-purple-50 transition-colors">
                  <Upload className="size-8 text-gray-400" />
                  <span className="text-sm text-gray-500">点击选择音频文件</span>
                  <span className="text-xs text-gray-400">支持 MP3, WAV, OGG, FLAC, M4A, WebM</span>
                  <input
                    type="file"
                    accept="audio/*"
                    className="hidden"
                    onChange={handleFileUpload}
                  />
                </label>
              </div>

              {/* Record */}
              <div className="space-y-2 flex flex-col">
                <Label className="text-xs text-gray-500">使用麦克风录音</Label>
                <div className="flex-1 flex flex-col items-center justify-center gap-3 border-2 border-dashed border-gray-300 rounded-lg py-8">
                  {recording ? (
                    <>
                      <div className="flex items-center gap-2 text-red-500">
                        <span className="relative flex h-3 w-3">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
                          <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500" />
                        </span>
                        <span className="text-sm font-medium">录音中… {formatDuration(recordTime)}</span>
                      </div>
                      <Button variant="destructive" size="sm" onClick={stopRecording}>
                        <Square className="size-4" /> 停止录音
                      </Button>
                    </>
                  ) : (
                    <>
                      <Mic className="size-8 text-gray-400" />
                      <span className="text-sm text-gray-500">点击开始录音</span>
                      <Button variant="outline" size="sm" onClick={startRecording}>
                        <Mic className="size-4" /> 开始录音
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </div>

            {loading && (
              <div className="text-center text-sm text-gray-500 py-2 flex items-center justify-center gap-2">
                <Spinner className="size-4" /> 音频加载中…
              </div>
            )}

            {audioName && (
              <div className="flex items-center gap-2 text-sm text-gray-600 bg-gray-50 rounded-lg px-3 py-2">
                <Music className="size-4 text-gray-400" />
                <span className="flex-1 truncate">{audioName}</span>
                {audioBlob && <span className="text-xs text-gray-400">{formatSize(audioBlob.size)}</span>}
                <button
                  onClick={() => {
                    setAudioBuffer(null);
                    setAudioUrl("");
                    setAudioBlob(null);
                    setAudioName("");
                    setAnalysis(null);
                    setConvertedBlob(null);
                    if (audioUrl) URL.revokeObjectURL(audioUrl);
                  }}
                  className="p-1 text-gray-400 hover:text-red-500"
                  title="清除"
                >
                  <Trash2 className="size-4" />
                </button>
              </div>
            )}
          </div>

          {/* ── Audio Analysis & Playback ── */}
          {audioBuffer && analysis && (
            <div className="rounded-xl border border-gray-200 bg-white p-5 space-y-4">
              <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                <Settings2 className="size-4" /> 音频分析与播放
              </h3>

              {/* Analysis stats */}
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                <div className="rounded-lg bg-gray-50 p-3">
                  <div className="text-xs text-gray-500">时长</div>
                  <div className="text-lg font-semibold text-gray-900">{formatDuration(analysis.duration)}</div>
                </div>
                <div className="rounded-lg bg-gray-50 p-3">
                  <div className="text-xs text-gray-500">采样率</div>
                  <div className="text-lg font-semibold text-gray-900">{(analysis.sampleRate / 1000).toFixed(1)} kHz</div>
                </div>
                <div className="rounded-lg bg-gray-50 p-3">
                  <div className="text-xs text-gray-500">声道数</div>
                  <div className="text-lg font-semibold text-gray-900">{analysis.channels === 1 ? "单声道" : "立体声"}</div>
                </div>
                <div className="rounded-lg bg-gray-50 p-3">
                  <div className="text-xs text-gray-500">平均分贝</div>
                  <div className="text-lg font-semibold text-gray-900">{formatDb(analysis.avgDb)}</div>
                </div>
                <div className="rounded-lg bg-gray-50 p-3">
                  <div className="text-xs text-gray-500">最低分贝</div>
                  <div className="text-lg font-semibold text-green-600">{formatDb(analysis.minDb)}</div>
                </div>
                <div className="rounded-lg bg-gray-50 p-3">
                  <div className="text-xs text-gray-500">最高分贝</div>
                  <div className="text-lg font-semibold text-red-600">{formatDb(analysis.maxDb)}</div>
                </div>
                <div className="rounded-lg bg-gray-50 p-3">
                  <div className="text-xs text-gray-500">动态范围</div>
                  <div className="text-lg font-semibold text-purple-600">
                    {formatDb(analysis.maxDb - analysis.minDb)}
                  </div>
                </div>
                <div className="rounded-lg bg-gray-50 p-3">
                  <div className="text-xs text-gray-500">采样数</div>
                  <div className="text-lg font-semibold text-gray-900">
                    {(analysis.sampleRate * analysis.duration).toLocaleString()}
                  </div>
                </div>
              </div>

              {/* Waveform display */}
              <div>
                <Label className="text-xs text-gray-500 mb-2 block">实时分贝波形图</Label>
                <canvas
                  ref={waveformCanvasRef}
                  width={800}
                  height={120}
                  className="w-full rounded-lg border border-gray-200"
                  style={{ height: 120 }}
                />
              </div>

              {/* Playback controls */}
              <div className="flex items-center gap-3">
                <Button
                  size="icon"
                  variant={playing ? "default" : "outline"}
                  onClick={playing ? handlePause : handlePlay}
                  className="rounded-full"
                >
                  {playing ? <Pause className="size-5" /> : <Play className="size-5" />}
                </Button>
                <div className="flex-1 text-sm text-gray-500 tabular-nums">
                  {formatDuration(playTime)} / {formatDuration(analysis.duration)}
                </div>
                <Volume2 className="size-5 text-gray-400" />
              </div>

              {/* Seek bar */}
              <Slider
                value={[playTime]}
                min={0}
                max={analysis.duration}
                step={0.1}
                onValueChange={(v) => {
                  if (audioElementRef.current) {
                    audioElementRef.current.currentTime = v[0];
                    setPlayTime(v[0]);
                  }
                }}
                className="w-full"
              />

              <audio
                ref={audioElementRef}
                src={audioUrl}
                className="hidden"
              />
            </div>
          )}

          {/* ── Format Conversion ── */}
          {audioBuffer && (
            <div className="rounded-xl border border-gray-200 bg-white p-5 space-y-4">
              <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                <Download className="size-4" /> 格式转换
              </h3>

              <div className="flex flex-wrap items-end gap-3">
                <div className="space-y-1">
                  <Label className="text-xs text-gray-500">目标格式</Label>
                  <Select value={convertFormat} onValueChange={(v) => setConvertFormat(v as FormatType)}>
                    <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
                    <SelectContent position="popper" sideOffset={4}>
                      <SelectItem value="mp3">MP3</SelectItem>
                      <SelectItem value="wav">WAV</SelectItem>
                      <SelectItem value="flac">FLAC</SelectItem>
                      <SelectItem value="ogg">OGG (Opus)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button onClick={handleConvert} disabled={converting}>
                  {converting ? <><Spinner className="size-4" /> 转换中…</> : "开始转换"}
                </Button>
              </div>

              {convertedBlob && (
                <div className="flex items-center gap-3 bg-green-50 border border-green-200 rounded-lg px-4 py-3">
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-green-800">{convertedBlob.name}</div>
                    <div className="text-xs text-green-600">
                      {formatSize(convertedBlob.blob.size)} · {convertedBlob.format.toUpperCase()}
                    </div>
                  </div>
                  <audio
                    src={URL.createObjectURL(convertedBlob.blob)}
                    controls
                    className="h-8 max-w-[200px]"
                  />
                  <Button size="sm" variant="outline" onClick={handleDownloadConverted}>
                    <Download className="size-4" /> 下载
                  </Button>
                </div>
              )}

              <div className="text-xs text-gray-400 space-y-1">
                <p>• MP3: 使用 lamejs 编码，128kbps，兼容性最好</p>
                <p>• WAV: 16-bit PCM，无损但文件较大</p>
                <p>• FLAC: 无损压缩，需要加载 WASM 编码器</p>
                <p>• OGG: 使用浏览器原生 Opus 编码，Chrome/Firefox 支持</p>
              </div>
            </div>
          )}

          {/* ── Text to Speech ── */}
          <div className="rounded-xl border border-gray-200 bg-white p-5 space-y-4">
            <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
              <Volume2 className="size-4" /> 语音合成 (TTS)
            </h3>

            <Textarea
              placeholder="输入要合成的文本…"
              value={ttsText}
              onChange={(e) => setTtsText(e.target.value)}
              rows={3}
              className="text-sm"
            />

            <div className="grid gap-3 sm:grid-cols-2 [&>*]:min-w-0">
              <div className="space-y-1">
                <Label className="text-xs text-gray-500">语音</Label>
                <Select value={ttsVoice} onValueChange={setTtsVoice}>
                  <SelectTrigger className="h-9 w-full"><SelectValue /></SelectTrigger>
                  <SelectContent position="popper" sideOffset={4} className="max-h-[200px]">
                    {voices.map((v) => (
                      <SelectItem key={v.voiceURI} value={v.voiceURI}>
                        {v.name} ({v.lang})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label className="text-xs text-gray-500">语速: {ttsRate.toFixed(1)}x</Label>
                <Slider
                  value={[ttsRate]}
                  min={0.5}
                  max={2}
                  step={0.1}
                  onValueChange={(v) => setTtsRate(v[0])}
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs text-gray-500">音调: {ttsPitch.toFixed(1)}</Label>
                <Slider
                  value={[ttsPitch]}
                  min={0}
                  max={2}
                  step={0.1}
                  onValueChange={(v) => setTtsPitch(v[0])}
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs text-gray-500">音量: {Math.round(ttsVolume * 100)}%</Label>
                <Slider
                  value={[ttsVolume]}
                  min={0}
                  max={1}
                  step={0.05}
                  onValueChange={(v) => setTtsVolume(v[0])}
                />
              </div>
            </div>

            <div className="flex gap-2">
              <Button onClick={handleTTS} variant={ttsSpeaking ? "destructive" : "default"}>
                {ttsSpeaking ? (
                  <><Square className="size-4" /> 停止</>
                ) : (
                  <><Volume2 className="size-4" /> 播放语音</>
                )}
              </Button>
              <Button onClick={handleTTSDownload} variant="outline">
                <Download className="size-4" /> 下载语音
              </Button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
