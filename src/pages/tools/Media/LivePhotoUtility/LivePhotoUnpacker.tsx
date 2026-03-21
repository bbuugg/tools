import {
    DownloadOutlined,
    InboxOutlined,
    PictureOutlined,
    VideoCameraOutlined,
} from "@ant-design/icons";
import {
    Button,
    Card,
    Col,
    Empty,
    Row,
    Space,
    Spin,
    Typography,
    Upload,
    message
} from "antd";
import React, { useState } from "react";
import { FormattedMessage, useIntl } from "react-intl";

const { Paragraph } = Typography;
const { Dragger } = Upload;

interface UnpackedResult {
    imageBlob: Blob;
    videoBlob: Blob;
    imageUrl: string;
    videoUrl: string;
    originalName: string;
}

const LivePhotoUnpacker: React.FC = () => {
    const intl = useIntl();
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<UnpackedResult | null>(null);

    // Cleanup effect
    React.useEffect(() => {
        return () => {
            if (result) {
                URL.revokeObjectURL(result.imageUrl);
                URL.revokeObjectURL(result.videoUrl);
            }
        };
    }, [result]);

    const findSequence = (data: Uint8Array, sequence: number[]): number => {
        const seqLen = sequence.length;
        const dataLen = data.length;
        for (let i = 0; i <= dataLen - seqLen; i++) {
            let match = true;
            for (let j = 0; j < seqLen; j++) {
                if (data[i + j] !== sequence[j]) {
                    match = false;
                    break;
                }
            }
            if (match) return i;
        }
        return -1;
    };

    const processFile = async (file: File) => {
        setLoading(true);

        // Revoke old URLs before processing a new file
        if (result) {
            URL.revokeObjectURL(result.imageUrl);
            URL.revokeObjectURL(result.videoUrl);
        }
        setResult(null);

        try {
            const arrayBuffer = await file.arrayBuffer();
            const bytes = new Uint8Array(arrayBuffer);

            // ftypmp42: [0x66, 0x74, 0x79, 0x70, 0x6D, 0x70, 0x34, 0x32]
            // ftypisom: [0x66, 0x74, 0x79, 0x70, 0x69, 0x73, 0x6F, 0x6D]
            const seqMp42 = [0x66, 0x74, 0x79, 0x70, 0x6d, 0x70, 0x34, 0x32];
            const seqIsom = [0x66, 0x74, 0x79, 0x70, 0x69, 0x73, 0x6f, 0x6d];

            let matchIndex = findSequence(bytes, seqMp42);
            if (matchIndex === -1) {
                matchIndex = findSequence(bytes, seqIsom);
            }

            if (matchIndex === -1) {
                message.error(intl.formatMessage({ id: "tools.livePhoto.errorNoVideo" }));
                setLoading(false);
                return;
            }

            const videoStartIndex = matchIndex - 4;
            if (videoStartIndex < 0) {
                message.error(intl.formatMessage({ id: "tools.livePhoto.errorInvalidFormat" }));
                setLoading(false);
                return;
            }

            const imageBytes = bytes.slice(0, videoStartIndex);
            const videoBytes = bytes.slice(videoStartIndex);

            const imageBlob = new Blob([imageBytes], { type: "image/jpeg" });
            const videoBlob = new Blob([videoBytes], { type: "video/mp4" });

            const imageUrl = URL.createObjectURL(imageBlob);
            const videoUrl = URL.createObjectURL(videoBlob);

            setResult({
                imageBlob,
                videoBlob,
                imageUrl,
                videoUrl,
                originalName: file.name.replace(/\.[^/.]+$/, ""),
            });

            message.success(intl.formatMessage({ id: "tools.livePhoto.success" }));
        } catch (error) {
            console.error("Process error:", error);
            message.error(intl.formatMessage({ id: "tools.livePhoto.error" }));
        } finally {
            setLoading(false);
        }
    };

    const downloadFile = (blob: Blob, fileName: string) => {
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

    const beforeUpload = (file: File) => {
        processFile(file);
        return false; // Prevent auto upload
    };

    return (
        <Space orientation="vertical" className="w-full">
            <Card>
                <Dragger
                    accept=".jpg,.jpeg"
                    beforeUpload={beforeUpload}
                    showUploadList={false}
                    disabled={loading}
                >
                    <p className="ant-upload-drag-icon">
                        <InboxOutlined />
                    </p>
                    <p className="ant-upload-text">
                        <FormattedMessage id="tools.livePhoto.dragTitle" />
                    </p>
                    <p className="ant-upload-hint">
                        <FormattedMessage id="tools.livePhoto.dragHint" />
                    </p>
                </Dragger>
            </Card>

            {loading && (
                <div className="text-center py-12">
                    <Spin size="large" tip={intl.formatMessage({ id: "tools.livePhoto.processing" })} />
                </div>
            )}

            {result && (
                <Space direction="vertical" size="large" className="w-full">
                    <Row gutter={24}>
                        <Col xs={24} md={12}>
                            <Card
                                title={
                                    <Space>
                                        <PictureOutlined />
                                        <FormattedMessage id="tools.livePhoto.extractedImage" />
                                    </Space>
                                }
                                extra={
                                    <Button
                                        type="primary"
                                        icon={<DownloadOutlined />}
                                        onClick={() =>
                                            downloadFile(result.imageBlob, `${result.originalName}.jpg`)
                                        }
                                    >
                                        <FormattedMessage id="common.download" />
                                    </Button>
                                }
                                hoverable
                            >
                                <img
                                    src={result.imageUrl}
                                    alt="Extracted"
                                    className="w-full h-auto rounded-lg shadow-inner"
                                    style={{ maxHeight: "400px", objectFit: "contain" }}
                                />
                            </Card>
                        </Col>
                        <Col xs={24} md={12}>
                            <Card
                                title={
                                    <Space>
                                        <VideoCameraOutlined />
                                        <FormattedMessage id="tools.livePhoto.extractedVideo" />
                                    </Space>
                                }
                                extra={
                                    <Button
                                        type="primary"
                                        icon={<DownloadOutlined />}
                                        onClick={() =>
                                            downloadFile(result.videoBlob, `${result.originalName}.mp4`)
                                        }
                                    >
                                        <FormattedMessage id="common.download" />
                                    </Button>
                                }
                                hoverable
                            >
                                <video
                                    src={result.videoUrl}
                                    controls
                                    className="w-full h-auto rounded-lg shadow-inner"
                                    style={{ maxHeight: "400px" }}
                                />
                            </Card>
                        </Col>
                    </Row>
                </Space>
            )}

            {!loading && !result && (
                <Empty
                    description={intl.formatMessage({ id: "tools.livePhoto.emptyHint" })}
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                />
            )}

            <Card title={<FormattedMessage id="tools.livePhoto.howToUse" />} className="bg-gray-50 dark:bg-gray-900 border-none">
                <Paragraph>
                    <ol>
                        <li><FormattedMessage id="tools.livePhoto.step1" /></li>
                        <li><FormattedMessage id="tools.livePhoto.step2" /></li>
                        <li><FormattedMessage id="tools.livePhoto.step3" /></li>
                    </ol>
                </Paragraph>
                <Paragraph type="secondary" className="text-xs">
                    <FormattedMessage id="tools.livePhoto.note" />
                </Paragraph>
            </Card>
        </Space>
    );
};

export default LivePhotoUnpacker;