import React, { useState, useEffect } from "react";
import {
  Card,
  Select,
  Button,
  Typography,
  Space,
  Row,
  Col,
  Divider,
  Table,
  DatePicker,
} from "antd";
import {
  ClockCircleOutlined,
  CopyOutlined,
  CheckCircleOutlined,
} from "@ant-design/icons";
import { useCopy } from "@/hooks/useCopy";
import { FormattedMessage, useIntl } from "react-intl";
import dayjs from "dayjs";

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;

// Get all timezones
const getTimezones = (): string[] => {
  return [
    "UTC",
    "America/New_York", // US East
    "America/Chicago", // US Central
    "America/Denver", // US Mountain
    "America/Los_Angeles", // US West
    "Europe/London", // UK
    "Europe/Paris", // France
    "Europe/Berlin", // Germany
    "Europe/Moscow", // Russia
    "Asia/Shanghai", // China
    "Asia/Tokyo", // Japan
    "Asia/Seoul", // Korea
    "Asia/Singapore", // Singapore
    "Asia/Dubai", // Dubai
    "Asia/Kolkata", // India
    "Australia/Sydney", // Australia Sydney
    "Pacific/Auckland", // New Zealand
    "America/Sao_Paulo", // Brazil
  ];
};

// Timezone groups
const timezoneGroups = [
  {
    name: "asia_pacific",
    zones: [
      { name: "china", value: "Asia/Shanghai", offset: "+08:00" },
      { name: "japan", value: "Asia/Tokyo", offset: "+09:00" },
      { name: "korea", value: "Asia/Seoul", offset: "+09:00" },
      { name: "singapore", value: "Asia/Singapore", offset: "+08:00" },
      { name: "india", value: "Asia/Kolkata", offset: "+05:30" },
      { name: "australia", value: "Australia/Sydney", offset: "+10:00/+11:00" },
    ],
  },
  {
    name: "europe",
    zones: [
      { name: "uk", value: "Europe/London", offset: "+00:00/+01:00" },
      { name: "france", value: "Europe/Paris", offset: "+01:00/+02:00" },
      { name: "germany", value: "Europe/Berlin", offset: "+01:00/+02:00" },
      { name: "russia", value: "Europe/Moscow", offset: "+03:00" },
    ],
  },
  {
    name: "americas",
    zones: [
      {
        name: "us_eastern",
        value: "America/New_York",
        offset: "-05:00/-04:00",
      },
      { name: "us_central", value: "America/Chicago", offset: "-06:00/-05:00" },
      {
        name: "us_western",
        value: "America/Los_Angeles",
        offset: "-08:00/-07:00",
      },
      { name: "brazil", value: "America/Sao_Paulo", offset: "-03:00/-02:00" },
    ],
  },
];

// Get current time in timezone
const getCurrentTimeInTimezone = (timezone: string): string => {
  try {
    const now = new Date();
    const options: Intl.DateTimeFormatOptions = {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
      timeZone: timezone,
    };

    return new Intl.DateTimeFormat("zh-CN", options)
      .format(now)
      .replace(/\//g, "-");
  } catch (error) {
    console.error("Timezone time error:", error);
    return "Unable to get timezone time";
  }
};

// Timezone conversion
const convertTimezone = (
  dateTimeString: string,
  sourceTimezone: string,
  targetTimezone: string,
  intl: ReturnType<typeof useIntl>
) => {
  try {
    if (!dateTimeString) return { convertedTime: "", conversionDetails: "" };

    // Create source timezone date object
    const sourceDate = new Date(dateTimeString);

    // Check if date is valid
    if (isNaN(sourceDate.getTime())) {
      return {
        convertedTime: intl.formatMessage({
          id: "tools.timezoneConverter.invalid_date_time",
        }),
        conversionDetails: intl.formatMessage({
          id: "tools.timezoneConverter.please_enter_valid_date_time",
        }),
      };
    }

    // Get source timezone time representation
    const sourceFormatter = new Intl.DateTimeFormat("zh-CN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
      timeZone: sourceTimezone,
    });

    // Get target timezone time representation
    const targetFormatter = new Intl.DateTimeFormat("zh-CN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
      timeZone: targetTimezone,
    });

    const sourceFormatted = sourceFormatter
      .format(sourceDate)
      .replace(/\//g, "-");
    const targetFormatted = targetFormatter
      .format(sourceDate)
      .replace(/\//g, "-");

    // Build detailed result
    const sourceTimezoneInfo = Intl.DateTimeFormat("zh-CN", {
      timeZoneName: "long",
      timeZone: sourceTimezone,
    }).format(sourceDate);
    const targetTimezoneInfo = Intl.DateTimeFormat("zh-CN", {
      timeZoneName: "long",
      timeZone: targetTimezone,
    }).format(sourceDate);

    const details = `${intl.formatMessage({
      id: "tools.timezoneConverter.source_time",
    })}: ${sourceFormatted} (${sourceTimezoneInfo})
${intl.formatMessage({
  id: "tools.timezoneConverter.target_time",
})}: ${targetFormatted} (${targetTimezoneInfo})
${intl.formatMessage({
  id: "tools.timezoneConverter.timestamp",
})}: ${Math.floor(sourceDate.getTime() / 1000)}
${intl.formatMessage({
  id: "tools.timezoneConverter.iso_format",
})}: ${sourceDate.toISOString()}`;

    return { convertedTime: targetFormatted, conversionDetails: details };
  } catch (error: unknown) {
    console.error(
      intl.formatMessage({
        id: "tools.timezoneConverter.timezone_conversion_error",
      }) + ":",
      error
    );
    return {
      convertedTime: intl.formatMessage({
        id: "tools.timezoneConverter.timezone_conversion_error",
      }),
      conversionDetails: intl.formatMessage({
        id: "tools.timezoneConverter.timezone_conversion_error",
      }),
    };
  }
};

const TimezoneConverter: React.FC = () => {
  const intl = useIntl();
  const copy = useCopy();

  // Date time string
  const [dateTimeString, setDateTimeString] = useState("");
  // Source timezone
  const [sourceTimezone, setSourceTimezone] = useState("Asia/Shanghai");
  // Target timezone
  const [targetTimezone, setTargetTimezone] = useState("America/New_York");
  // Conversion result
  const [convertedTime, setConvertedTime] = useState("");
  // Detailed conversion result
  const [conversionDetails, setConversionDetails] = useState("");
  // Available timezones
  const [timezones, setTimezones] = useState<string[]>([]);
  // Copy state
  const [copied, setCopied] = useState(false);

  // Initialize timezone list
  useEffect(() => {
    setTimezones(getTimezones());

    // Initialize current time
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");
    const hours = String(now.getHours()).padStart(2, "0");
    const minutes = String(now.getMinutes()).padStart(2, "0");

    setDateTimeString(`${year}-${month}-${day}T${hours}:${minutes}`);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Update conversion result when inputs change
  useEffect(() => {
    if (dateTimeString && sourceTimezone && targetTimezone) {
      const { convertedTime, conversionDetails } = convertTimezone(
        dateTimeString,
        sourceTimezone,
        targetTimezone,
        intl
      );
      setConvertedTime(convertedTime);
      setConversionDetails(conversionDetails);
    }
  }, [dateTimeString, sourceTimezone, targetTimezone, intl]);

  // Copy conversion result
  const copyResult = () => {
    if (!convertedTime) return;

    copy(convertedTime).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  // Use current time
  const useCurrentTime = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");
    const hours = String(now.getHours()).padStart(2, "0");
    const minutes = String(now.getMinutes()).padStart(2, "0");

    setDateTimeString(`${year}-${month}-${day}T${hours}:${minutes}`);
  };

  // Prepare timezone data for table
  interface TimezoneZone {
    name: string;
    value: string;
    offset: string;
  }

  const prepareTimezoneData = () => {
    const data: { key: string; type: string; zones: TimezoneZone[] }[] = [];

    timezoneGroups.forEach((group) => {
      data.push({
        key: group.name,
        type: intl.formatMessage({
          id: `tools.timezoneConverter.${group.name}`,
        }),
        zones: group.zones,
      });
    });

    return data;
  };

  const columns = [
    {
      title: <FormattedMessage id="tools.timezoneConverter.region" />,
      dataIndex: "type",
      key: "type",
    },
    {
      title: <FormattedMessage id="tools.timezoneConverter.timezones" />,
      dataIndex: "zones",
      key: "zones",
      render: (zones: TimezoneZone[]) => (
        <div>
          {zones.map((zone) => (
            <div
              key={zone.value}
              className="py-1 border-b border-gray-700 last:border-0"
            >
              <div className="font-medium text-sm">
                <FormattedMessage id={`tools.timezoneConverter.${zone.name}`} />
              </div>
              <div className="flex justify-between text-xs text-gray-400">
                <span>{zone.value}</span>
                <span>{zone.offset}</span>
              </div>
            </div>
          ))}
        </div>
      ),
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4">
      <div className="text-center mb-8">
        <Title level={1} className="text-white mb-2">
          <FormattedMessage id="tools.timezoneConverter.name" />
        </Title>
        <Text className="text-lg">
          <FormattedMessage id="tools.timezoneConverter.description" />
        </Text>
      </div>

      <Row gutter={[24, 24]}>
        <Col xs={24} lg={12}>
          <Card className="bg-white/5">
            <Space orientation="vertical" size="middle" className="w-full">
              {/* Date Time Input */}
              <div>
                <Title level={4} className="text-white !mb-2">
                  <FormattedMessage id="tools.timezoneConverter.date_time" />
                </Title>
                <div className="flex items-center gap-2">
                  <DatePicker
                    showTime
                    format="YYYY-MM-DD HH:mm:ss"
                    value={dateTimeString ? dayjs(dateTimeString) : null}
                    onChange={(date) =>
                      setDateTimeString(date ? date.toISOString() : "")
                    }
                    className="w-full"
                    placeholder={intl.formatMessage({
                      id: "tools.timezoneConverter.select_datetime",
                    })}
                  />
                  <Button
                    icon={<ClockCircleOutlined />}
                    onClick={useCurrentTime}
                    title={intl.formatMessage({
                      id: "tools.timezoneConverter.use_current_time",
                    })}
                  >
                    <FormattedMessage id="tools.timezoneConverter.current_time" />
                  </Button>
                </div>
              </div>

              <Row gutter={16}>
                <Col xs={24} md={12}>
                  {/* Source Timezone */}
                  <div>
                    <Title level={4} className="text-white !mb-2">
                      <FormattedMessage id="tools.timezoneConverter.source_timezone" />
                    </Title>
                    <Select
                      value={sourceTimezone}
                      onChange={setSourceTimezone}
                      className="w-full"
                      popupMatchSelectWidth={false}
                      showSearch
                      optionFilterProp="children"
                    >
                      {timezones.map((timezone) => (
                        <Option key={timezone} value={timezone}>
                          {timezone} ({getCurrentTimeInTimezone(timezone)})
                        </Option>
                      ))}
                    </Select>
                  </div>
                </Col>
                <Col xs={24} md={12}>
                  {/* Target Timezone */}
                  <div>
                    <Title level={4} className="text-white !mb-2">
                      <FormattedMessage id="tools.timezoneConverter.target_timezone" />
                    </Title>
                    <Select
                      value={targetTimezone}
                      onChange={setTargetTimezone}
                      className="w-full"
                      popupMatchSelectWidth={false}
                      showSearch
                      optionFilterProp="children"
                    >
                      {timezones.map((timezone) => (
                        <Option key={timezone} value={timezone}>
                          {timezone} ({getCurrentTimeInTimezone(timezone)})
                        </Option>
                      ))}
                    </Select>
                  </div>
                </Col>
              </Row>

              {/* Conversion Result */}
              <div>
                <div className="flex items-center justify-between">
                  <Title level={4} className="text-white !mb-2">
                    <FormattedMessage id="tools.timezoneConverter.conversion_result" />
                  </Title>
                  <Button
                    icon={copied ? <CheckCircleOutlined /> : <CopyOutlined />}
                    onClick={copyResult}
                    disabled={!convertedTime}
                    title={
                      copied
                        ? intl.formatMessage({
                            id: "tools.timezoneConverter.copied",
                          })
                        : intl.formatMessage({
                            id: "tools.timezoneConverter.copy",
                          })
                    }
                  >
                    {copied
                      ? intl.formatMessage({
                          id: "tools.timezoneConverter.copied",
                        })
                      : intl.formatMessage({
                          id: "tools.timezoneConverter.copy",
                        })}
                  </Button>
                </div>

                {convertedTime ? (
                  <div className="space-y-4">
                    <div>
                      <Text strong className="block mb-1">
                        <FormattedMessage id="tools.timezoneConverter.converted_time" />
                      </Text>
                      <div className="p-3 rounded-md border border-slate-700">
                        <Text className="text-white text-lg">
                          {convertedTime}
                        </Text>
                      </div>
                    </div>

                    <div>
                      <Text strong className="block mb-1">
                        <FormattedMessage id="tools.timezoneConverter.detailed_result" />
                      </Text>
                      <div className="p-3 rounded-md border border-slate-700">
                        <pre className="font-mono text-sm whitespace-pre-wrap">
                          {conversionDetails}
                        </pre>
                      </div>
                      <div className="mt-2">
                        <Text type="secondary" className="text-xs">
                          <FormattedMessage id="tools.timezoneConverter.timezone_display_note" />
                        </Text>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="p-4 rounded-md border border-slate-700">
                    <Text type="secondary">
                      <FormattedMessage id="tools.timezoneConverter.input_date_time_select_timezone" />
                    </Text>
                  </div>
                )}

                <div className="mt-4">
                  <Text type="secondary" className="text-xs">
                    <FormattedMessage id="tools.timezoneConverter.timezone_note" />
                  </Text>
                </div>
              </div>
            </Space>
          </Card>
        </Col>

        <Col xs={24} lg={12}>
          <Card className="bg-white/5 border-slate-700 h-full">
            <Title level={4} className="text-white !mb-4">
              <FormattedMessage id="tools.timezoneConverter.common_timezone_info" />
            </Title>

            <Table
              columns={columns}
              dataSource={prepareTimezoneData()}
              pagination={false}
              showHeader={false}
              size="small"
            />

            <Divider className="my-4" />

            <div className="text-xs">
              <Paragraph>
                <FormattedMessage id="tools.timezoneConverter.about_timezone" />
              </Paragraph>
              <ul className="list-disc pl-5 space-y-1">
                <li>
                  <FormattedMessage id="tools.timezoneConverter.timezone_offset_info" />
                </li>
                <li>
                  <FormattedMessage id="tools.timezoneConverter.timezone_dst_info" />
                </li>
                <li>
                  <FormattedMessage id="tools.timezoneConverter.dst_implementation" />
                </li>
              </ul>
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default TimezoneConverter;
