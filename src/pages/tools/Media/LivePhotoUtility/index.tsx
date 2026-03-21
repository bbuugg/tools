import {
    DownloadOutlined,
    InboxOutlined
} from "@ant-design/icons";
import {
    Radio,
    Space,
    Typography
} from "antd";
import React, { useState } from "react";
import { FormattedMessage } from "react-intl";
import LivePhotoMaker from "./LivePhotoMaker";
import LivePhotoUnpacker from "./LivePhotoUnpacker";

const { Title, Paragraph } = Typography;

const LivePhotoUtility: React.FC = () => {
    const [mode, setMode] = useState<"unpack" | "make">("unpack");

    return (
        <div className="max-w-7xl mx-auto p-4">
            <div className="text-center mb-8">
                <Title level={2}>
                    <FormattedMessage id="tools.livePhoto.name" />
                </Title>
                <Paragraph>
                    <FormattedMessage id="tools.livePhoto.description" />
                </Paragraph>

                <div className="flex justify-center mt-6">
                    <Radio.Group
                        value={mode}
                        onChange={(e) => setMode(e.target.value)}
                        optionType="button"
                        buttonStyle="solid"
                    >
                        <Radio.Button value="unpack">
                            <Space>
                                <InboxOutlined />
                                <FormattedMessage id="tools.livePhoto.mode.unpack" />
                            </Space>
                        </Radio.Button>
                        <Radio.Button value="make">
                            <Space>
                                <DownloadOutlined />
                                <FormattedMessage id="tools.livePhoto.mode.make" />
                            </Space>
                        </Radio.Button>
                    </Radio.Group>
                </div>
            </div>

            {mode === "unpack" ? <LivePhotoUnpacker /> : <LivePhotoMaker />}
        </div>
    );
};

export default LivePhotoUtility;
