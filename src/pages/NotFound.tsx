import {
  ExclamationCircleOutlined,
  HomeOutlined,
  LoadingOutlined,
  RadarChartOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import { Button, Card, Result, Steps, Typography } from "antd";
import React, { useEffect, useState } from "react";
import { FormattedMessage } from "react-intl";
import { useNavigate } from "react-router-dom";

const { Title, Text, Paragraph } = Typography;

const NotFound: React.FC = () => {
  const navigate = useNavigate();
  const [status, setStatus] = useState<"idle" | "scanning" | "done">("idle");
  const [currentStep, setCurrentStep] = useState(0);

  const startScan = () => {
    setStatus("scanning");
    setCurrentStep(0);
  };

  useEffect(() => {
    if (status === "scanning") {
      const timer = setInterval(() => {
        setCurrentStep((prev) => {
          if (prev >= 3) {
            clearInterval(timer);
            setStatus("done");
            return 3;
          }
          return prev + 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [status]);

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="text-center mb-12">
        <Title level={1} className="text-white mb-4">
          <FormattedMessage
            id="tools.notFound.name"
            defaultMessage="404 Page Detector"
          />
        </Title>
        <Text className="text-slate-400 text-lg">
          <FormattedMessage
            id="tools.notFound.description"
            defaultMessage="Advanced tool for analyzing and locating missing web resources."
          />
        </Text>
      </div>

      <Card className="bg-white/5 border-slate-700 text-center py-8">
        {status === "idle" && (
          <div className="animate-fade-in">
            <RadarChartOutlined
              style={{ fontSize: 80, color: "#3b82f6" }}
              className="mb-6"
            />
            <Title level={2}>
              <FormattedMessage
                id="tools.notFound.title"
                defaultMessage="Lost in Space-Time?"
              />
            </Title>
            <Paragraph className="text-slate-400 mb-8 max-w-md mx-auto">
              <FormattedMessage
                id="tools.notFound.subtitle"
                defaultMessage="Our neural network has analyzed the current URL and concluded that it leads to a non-existent dimension."
              />
            </Paragraph>
            <Button
              type="primary"
              size="large"
              icon={<SearchOutlined />}
              onClick={startScan}
              className="h-12 px-8 rounded-full"
            >
              <FormattedMessage
                id="common.start"
                defaultMessage="Start Detection"
              />
            </Button>
          </div>
        )}

        {status === "scanning" && (
          <div className="animate-fade-in py-8">
            <Steps
              direction="vertical"
              current={currentStep}
              className="max-w-xs mx-auto text-left"
              items={[
                {
                  title: "Analyzing Request Headers",
                  icon: currentStep === 0 ? <LoadingOutlined /> : null,
                },
                {
                  title: "Probing Server Memory",
                  icon: currentStep === 1 ? <LoadingOutlined /> : null,
                },
                {
                  title: "Searching Secondary Dimensions",
                  icon: currentStep === 2 ? <LoadingOutlined /> : null,
                },
                {
                  title: "Confirming Non-existence",
                },
              ]}
            />
          </div>
        )}

        {status === "done" && (
          <div className="animate-fade-in">
            <Result
              status="404"
              title={"404"}
              subTitle={
                <span className="text-slate-400">
                  <FormattedMessage
                    id="tools.notFound.result"
                    defaultMessage="Analysis Result: 100% missing data detected."
                  />
                </span>
              }
              icon={
                <ExclamationCircleOutlined className="text-red-500 text-6xl" />
              }
              extra={
                <Button
                  type="primary"
                  icon={<HomeOutlined />}
                  onClick={() => navigate("/")}
                  className="h-12 px-8 rounded-full"
                >
                  <FormattedMessage
                    id="tools.notFound.backHome"
                    defaultMessage="Relocate to Reality (Go Home)"
                  />
                </Button>
              }
            />
          </div>
        )}
      </Card>
    </div>
  );
};

export default NotFound;
