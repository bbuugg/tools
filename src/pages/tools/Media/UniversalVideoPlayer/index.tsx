import React, { useEffect, useRef, useState } from "react";
import {
  Card,
  Input,
  Button,
  Space,
  Typography,
  Upload,
  Divider,
  Row,
  Col,
  message,
  Switch,
  Badge,
} from "antd";
import {
  PlayCircleOutlined,
  UploadOutlined,
  FileTextOutlined,
  InfoCircleOutlined,
} from "@ant-design/icons";
import Artplayer from "artplayer";
import Hls from "hls.js";
import * as dashjs from "dashjs";
import { FormattedMessage, useIntl } from "react-intl";

const { Title, Paragraph, Text } = Typography;

const UniversalVideoPlayer: React.FC = () => {
  const intl = useIntl();
  const artRef = useRef<HTMLDivElement>(null);
  const [url, setUrl] = useState<string>("");
  const [player, setPlayer] = useState<Artplayer | null>(null);
  const [isAutoPlay, setIsAutoPlay] = useState(true);

  const initPlayer = (videoUrl: string) => {
    if (!artRef.current) return;

    if (player) {
      player.destroy();
    }

    const newPlayer = new Artplayer({
      container: artRef.current,
      url: videoUrl,
      autoSize: true,
      autoplay: isAutoPlay,
      playbackRate: true,
      aspectRatio: true,
      setting: true,
      pip: true,
      fullscreen: true,
      fullscreenWeb: true,
      subtitleOffset: true,
      miniProgressBar: true,
      mutex: true,
      backdrop: true,
      playsInline: true,
      autoPlayback: true,
      airplay: true,
      moreVideoAttr: {
        crossOrigin: "anonymous",
      },
      type: videoUrl.includes(".m3u8")
        ? "m3u8"
        : videoUrl.includes(".mpd")
          ? "dash"
          : "",
      customType: {
        m3u8: function (video: HTMLMediaElement, url: string) {
          if (Hls.isSupported()) {
            const hls = new Hls();
            hls.loadSource(url);
            hls.attachMedia(video);
          } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
            video.src = url;
          } else {
            message.error("HLS is not supported in this browser");
          }
        },
        dash: function (video: HTMLMediaElement, url: string) {
          const dash = (dashjs as any).MediaPlayer().create();
          dash.initialize(video, url, true);
        },
      },
      settings: [
        {
          html: "Subtitle",
          tooltip: "None",
          icon: '<img width="22" height="22" src="/assets/img/subtitle.svg">',
          selector: [
            {
              html: "None",
              default: true,
            },
          ],
          onSelect: function (item) {
            this.subtitle.url = item.url;
            return item.html;
          },
        },
      ],
    });

    setPlayer(newPlayer);
  };

  const handlePlayUrl = () => {
    if (!url) {
      message.warning(
        intl.formatMessage({ id: "tools.universalVideoPlayer.enterUrl" })
      );
      return;
    }
    initPlayer(url);
  };

  const handleFileUpload = (file: File) => {
    const fileUrl = URL.createObjectURL(file);
    setUrl(fileUrl);
    initPlayer(fileUrl);
    return false; // Prevent upload
  };

  const handleSubtitleUpload = (file: File) => {
    if (!player) {
      message.warning(
        intl.formatMessage({ id: "tools.universalVideoPlayer.loadVideoFirst" })
      );
      return false;
    }
    const subUrl = URL.createObjectURL(file);
    player.subtitle.url = subUrl;
    message.success(
      intl.formatMessage({ id: "tools.universalVideoPlayer.subtitleLoaded" })
    );
    return false;
  };

  useEffect(() => {
    return () => {
      if (player) {
        player.destroy();
      }
    };
  }, [player]);

  return (
    <div className="max-w-6xl mx-auto p-4 animate-fade-in">
      <div className="mb-8 text-center">
        <Title level={2} className="!mb-2">
          <FormattedMessage id="tools.universalVideoPlayer.name" />
        </Title>
        <Paragraph className="text-slate-500">
          <FormattedMessage id="tools.universalVideoPlayer.description" />
        </Paragraph>
      </div>

      {/* Toolbar Area */}
      <Card
        className="border-none bg-white/50 dark:bg-white/5 backdrop-blur-md"
        bodyStyle={{ padding: '12px 24px' }}
      >
        <Row justify="space-between" align="middle" gutter={[16, 16]}>
          <Col xs={24} xl={10}>
            <Space className="w-full">
              <Text strong className="text-xs uppercase text-slate-400 whitespace-nowrap">
                <FormattedMessage id="tools.universalVideoPlayer.source" />
              </Text>
              <Input
                size="small"
                className="w-full min-w-[300px]"
                placeholder={intl.formatMessage({
                  id: "tools.universalVideoPlayer.urlPlaceholder",
                })}
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                onPressEnter={handlePlayUrl}
                suffix={
                  <Button
                    size="small"
                    type="primary"
                    icon={<PlayCircleOutlined />}
                    onClick={handlePlayUrl}
                    className="mr-[-7px]"
                  >
                    <FormattedMessage id="tools.universalVideoPlayer.playAction" />
                  </Button>
                }
              />
            </Space>
          </Col>

          <Col>
            <Space size="large" split={<Divider type="vertical" className="h-6" />}>
              <Space>
                <Upload
                  accept="video/*"
                  beforeUpload={handleFileUpload}
                  showUploadList={false}
                >
                  <Button size="small" icon={<UploadOutlined />}>
                    <FormattedMessage id="tools.universalVideoPlayer.fileUpload" />
                  </Button>
                </Upload>
                <Upload
                  accept=".srt,.vtt,.ass"
                  beforeUpload={handleSubtitleUpload}
                  showUploadList={false}
                >
                  <Button size="small" icon={<FileTextOutlined />}>
                    <FormattedMessage id="tools.universalVideoPlayer.subtitleUpload" />
                  </Button>
                </Upload>
              </Space>

              <Space>
                <Text className="text-xs text-slate-400">
                  <FormattedMessage id="tools.universalVideoPlayer.autoPlay" />
                </Text>
                <Switch
                  checked={isAutoPlay}
                  onChange={setIsAutoPlay}
                  size="small"
                />
              </Space>
            </Space>
          </Col>
        </Row>
      </Card>

      {/* Player Area */}
      <Card
        className="shadow-xl border-none overflow-hidden"
        bodyStyle={{ padding: 0 }}
      >
        <div className="bg-slate-50 dark:bg-slate-900/40 px-4 py-1 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center">
          <Space>
            <Badge status="processing" color="#1890ff" />
            <Text className="text-[10px] uppercase font-mono tracking-wider opacity-70">
              Media Stream Engine
            </Text>
          </Space>
          <div className="flex items-center gap-4">
            <Text type="secondary" className="text-[10px] uppercase font-mono tracking-wider opacity-50">
              {url.includes('blob:') ? 'Local File' : url.includes('.m3u8') ? 'HLS' : url.includes('.mpd') ? 'DASH' : 'Direct'}
            </Text>
          </div>
        </div>
        <div
          ref={artRef}
          style={{
            width: "100%",
            height: "60vh",
            backgroundColor: "#000",
          }}
        >
          <div className="h-full flex flex-col items-center justify-center text-slate-500">
            <PlayCircleOutlined
              style={{ fontSize: "64px", opacity: 0.2 }}
              className="mb-4"
            />
            <Text className="text-slate-500 opacity-50">
              <FormattedMessage id="tools.universalVideoPlayer.waiting" />
            </Text>
          </div>
        </div>
      </Card>

      <div className="mt-4 p-3 rounded-lg bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-800 flex items-center gap-2">
        <InfoCircleOutlined className="text-blue-500 text-sm" />
        <Text className="text-xs text-blue-700/70 dark:text-blue-300/70">
          <FormattedMessage id="tools.universalVideoPlayer.tips" />
        </Text>
      </div>
    </div>
  );
};

export default UniversalVideoPlayer;
