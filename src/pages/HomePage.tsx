import type { ToolConfig } from "@/types/tool";

import { allTools } from "@/utils/toolList";
import { SearchOutlined } from "@ant-design/icons";
import { Card, Col, Input, Row, Tag, Typography } from "antd";
import React from "react";
import { FormattedMessage, useIntl } from "react-intl";
import { useNavigate } from "react-router-dom";

const { Title, Text } = Typography;

const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = React.useState("");
  const intl = useIntl();



  const filteredTools = allTools
    .map((tool) => ({
      ...tool,
      translatedName: intl.formatMessage({
        id: `tools.${tool.id}.name`,
        defaultMessage: tool.name,
      }),
      translatedDesc: intl.formatMessage({
        id: `tools.${tool.id}.description`,
        defaultMessage: tool.description,
      }),
      translatedCategory: intl.formatMessage({
        id: `common.category.${tool.category}`,
        defaultMessage: tool.category,
      }),
    }))
    .filter(
      (tool) =>
        tool.translatedName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tool.translatedDesc.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tool.translatedCategory.toLowerCase().includes(searchTerm.toLowerCase())
    );

  return (
    <div className="max-w-7xl mx-auto py-10 px-4">
      <div className="mb-12 text-center">
        <Title level={1} className="text-4xl font-bold mb-4">
          <FormattedMessage id="home.title" />
        </Title>
        <Text type="secondary" className="text-lg">
          <FormattedMessage id="home.subtitle" />
        </Text>
        <div className="max-w-2xl mx-auto mt-8">
          <Input
            size="large"
            placeholder={intl.formatMessage({ id: "home.searchPlaceholder" })}
            prefix={<SearchOutlined />}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="rounded-full"
          />
        </div>
      </div>

      <Row gutter={[24, 24]}>
        {filteredTools.map((tool: ToolConfig) => (
          <Col xs={24} sm={12} md={8} lg={8} key={tool.id}>
            <Card
              hoverable
              className="h-full cursor-pointer"
              onClick={() => navigate(tool.path)}
            >
              <div className="flex items-start gap-4">
                <div className="p-3 bg-green-500/10 text-green-500 rounded-xl text-2xl">
                  {tool.icon}
                </div>
                <div>
                  <Title level={5} className="mb-1 !mt-0">
                    <FormattedMessage
                      id={`tools.${tool.id}.name`}
                      defaultMessage={tool.name}
                    />
                  </Title>
                  <Tag variant={"filled"} color="green" className="mb-2">
                    <FormattedMessage
                      id={`common.category.${tool.category}`}
                      defaultMessage={tool.category}
                    />
                  </Tag>

                  <p className="text-gray-500 text-sm line-clamp-2 m-0">
                    <FormattedMessage
                      id={`tools.${tool.id}.description`}
                      defaultMessage={tool.description}
                    />
                  </p>
                </div>
              </div>
            </Card>
          </Col>
        ))}
      </Row>
    </div>
  );
};

export default HomePage;
