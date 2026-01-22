import {
    DownloadOutlined,
    PictureOutlined,
    VideoCameraOutlined
} from "@ant-design/icons";
import {
    Button,
    Card,
    Col,
    Row,
    Space,
    Typography,
    Upload,
    message
} from "antd";
import React, { useState } from "react";
import { FormattedMessage, useIntl } from "react-intl";

const { Paragraph } = Typography;
const { Dragger } = Upload;

const LivePhotoMaker: React.FC = () => {
    const intl = useIntl();
    const [loading, setLoading] = useState(false);
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [videoFile, setVideoFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string>("");
    const [videoPreview, setVideoPreview] = useState<string>("");

    const handleImageChange = (info: any) => {
        const file = info.file;
        if (file) {
            setImageFile(file);
            const url = URL.createObjectURL(file);
            setImagePreview(url);
        }
    };

    const handleVideoChange = (info: any) => {
        const file = info.file;
        if (file) {
            setVideoFile(file);
            const url = URL.createObjectURL(file);
            setVideoPreview(url);
        }
    };

    const packFile = async () => {
        if (!imageFile || !videoFile) {
            message.warning(intl.formatMessage({ id: "tools.livePhoto.makeError" }));
            return;
        }

        setLoading(true);
        try {
            const imageBuf = await imageFile.arrayBuffer();
            const videoBuf = await videoFile.arrayBuffer();

            const combinedBlob = new Blob([imageBuf, videoBuf], { type: "image/jpeg" });
            const url = URL.createObjectURL(combinedBlob);

            const link = document.createElement("a");
            link.href = url;
            link.download = `MVIMG_${Date.now()}.jpg`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);

            message.success(intl.formatMessage({ id: "tools.livePhoto.makeSuccess" }));
        } catch (error) {
            console.error("Pack error:", error);
            message.error(intl.formatMessage({ id: "tools.livePhoto.makeError" }));
        } finally {
            setLoading(false);
        }
    };

    return (
        <Space orientation="vertical" className="w-full">
            <Row gutter={24}>
                <Col xs={24} md={12}>
                    <Card title={<FormattedMessage id="tools.livePhoto.selectImage" />} className="mb-4">
                        <Dragger
                            accept=".jpg,.jpeg"
                            beforeUpload={() => false}
                            onChange={handleImageChange}
                            showUploadList={false}
                            className="mb-4"
                        >
                            {imagePreview ? (
                                <img src={imagePreview} alt="Preview" className="max-h-40 mx-auto" />
                            ) : (
                                <>
                                    <p className="ant-upload-drag-icon">
                                        <PictureOutlined />
                                    </p>
                                    <p className="ant-upload-text">
                                        <FormattedMessage id="common.upload" />
                                    </p>
                                </>
                            )}
                        </Dragger>
                    </Card>
                </Col>
                <Col xs={24} md={12}>
                    <Card title={<FormattedMessage id="tools.livePhoto.selectVideo" />} className="mb-4">
                        <Dragger
                            accept=".mp4"
                            beforeUpload={() => false}
                            onChange={handleVideoChange}
                            showUploadList={false}
                            className="mb-4"
                        >
                            {videoPreview ? (
                                <video src={videoPreview} className="max-h-40 mx-auto" controls />
                            ) : (
                                <>
                                    <p className="ant-upload-drag-icon">
                                        <VideoCameraOutlined />
                                    </p>
                                    <p className="ant-upload-text">
                                        <FormattedMessage id="common.upload" />
                                    </p>
                                </>
                            )}
                        </Dragger>
                    </Card>
                </Col>
            </Row>

            <div className="text-center mb-4">
                <Button
                    type="primary"
                    icon={<DownloadOutlined />}
                    onClick={packFile}
                    loading={loading}
                    disabled={!imageFile || !videoFile}
                >
                    <FormattedMessage id="tools.livePhoto.makeAction" />
                </Button>
            </div>

            <Card title={<FormattedMessage id="tools.livePhoto.howToUse" />} className="bg-gray-50 dark:bg-gray-900 border-none">
                <Paragraph>
                    <ol>
                        <li><FormattedMessage id="tools.livePhoto.makeStep1" /></li>
                        <li><FormattedMessage id="tools.livePhoto.makeStep2" /></li>
                        <li><FormattedMessage id="tools.livePhoto.makeStep3" /></li>
                    </ol>
                </Paragraph>
                <Paragraph type="secondary" className="text-xs">
                    <FormattedMessage id="tools.livePhoto.note" />
                </Paragraph>
            </Card>
        </Space>
    );
};

export default LivePhotoMaker;