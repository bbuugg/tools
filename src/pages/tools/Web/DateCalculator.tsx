import { useCopy } from "@/hooks/useCopy";
import {
  CalendarOutlined,
  CheckOutlined,
  CopyOutlined,
  MinusOutlined,
  PlusOutlined,
} from "@ant-design/icons";
import {
  Button,
  Card,
  Col,
  DatePicker,
  Divider,
  Input,
  Row,
  Tabs,
  Typography,
} from "antd";
import dayjs from "dayjs";
import React, { useEffect, useState } from "react";
import { FormattedMessage, useIntl } from "react-intl";

const { Title, Text } = Typography;

// 时间单位常量
const TimeUnit = {
  YEARS: "years" as const,
  MONTHS: "months" as const,
  WEEKS: "weeks" as const,
  DAYS: "days" as const,
  HOURS: "hours" as const,
  MINUTES: "minutes" as const,
} as const;

type TimeUnit = (typeof TimeUnit)[keyof typeof TimeUnit];

// 格式化日期为显示格式
const formatDateForDisplay = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");

  return `${year}-${month}-${day} ${hours}:${minutes}`;
};

const DateCalculator: React.FC = () => {
  const intl = useIntl();
  const copy = useCopy();

  // 模式: 计算日期差值 or 添加/减去日期
  const [mode, setMode] = useState<"diff" | "add">("diff");

  // 初始化日期
  const now = dayjs();
  const oneWeekAgo = dayjs().subtract(7, "day");

  // 日期差值计算的状态
  const [startDate, setStartDate] = useState<dayjs.Dayjs | null>(oneWeekAgo);
  const [endDate, setEndDate] = useState<dayjs.Dayjs | null>(now);
  const [diffResult, setDiffResult] = useState<{ [key: string]: number }>({});

  // 日期加减的状态
  const [baseDate, setBaseDate] = useState<dayjs.Dayjs | null>(now);
  const [timeAmount, setTimeAmount] = useState<number>(1);
  const [timeUnit, setTimeUnit] = useState<TimeUnit>(TimeUnit.DAYS);
  const [operation, setOperation] = useState<"add" | "subtract">("add");
  const [addResult, setAddResult] = useState<string>("");

  // 复制状态
  const [copied, setCopied] = useState<string | null>(null);

  // 计算日期差值
  const calculateDateDiff = (
    start: dayjs.Dayjs | null,
    end: dayjs.Dayjs | null
  ) => {
    if (!start || !end) return;

    try {
      const startDateTime = start.toDate();
      const endDateTime = end.toDate();

      if (isNaN(startDateTime.getTime()) || isNaN(endDateTime.getTime())) {
        return;
      }

      // 计算毫秒差值
      const diffMs = endDateTime.getTime() - startDateTime.getTime();

      // 计算各个单位的差值
      const diffSeconds = Math.floor(diffMs / 1000);
      const diffMinutes = Math.floor(diffSeconds / 60);
      const diffHours = Math.floor(diffMinutes / 60);
      const diffDays = Math.floor(diffHours / 24);
      const diffWeeks = Math.floor(diffDays / 7);

      // 计算月份差
      let months =
        (endDateTime.getFullYear() - startDateTime.getFullYear()) * 12;
      months += endDateTime.getMonth() - startDateTime.getMonth();

      // 计算年份差
      const diffYears = Math.floor(months / 12);

      // 设置结果
      setDiffResult({
        years: diffYears,
        months: months,
        weeks: diffWeeks,
        days: diffDays,
        hours: diffHours,
        minutes: diffMinutes,
        seconds: diffSeconds,
        milliseconds: diffMs,
      });
    } catch (error) {
      console.error(
        intl.formatMessage({
          id: "tools.dateCalculator.error.calculation_error",
        }),
        error
      );
    }
  };

  // 计算日期加减
  const calculateDateAddition = (
    base: dayjs.Dayjs | null,
    amount: number,
    unit: TimeUnit,
    op: "add" | "subtract"
  ) => {
    if (!base || isNaN(amount)) return;

    try {
      const baseDateTime = base.toDate();

      if (isNaN(baseDateTime.getTime())) {
        return;
      }

      const resultDate = new Date(baseDateTime);
      const sign = op === "add" ? 1 : -1;

      switch (unit) {
        case TimeUnit.YEARS:
          resultDate.setFullYear(resultDate.getFullYear() + sign * amount);
          break;
        case TimeUnit.MONTHS:
          resultDate.setMonth(resultDate.getMonth() + sign * amount);
          break;
        case TimeUnit.WEEKS:
          resultDate.setDate(resultDate.getDate() + sign * amount * 7);
          break;
        case TimeUnit.DAYS:
          resultDate.setDate(resultDate.getDate() + sign * amount);
          break;
        case TimeUnit.HOURS:
          resultDate.setHours(resultDate.getHours() + sign * amount);
          break;
        case TimeUnit.MINUTES:
          resultDate.setMinutes(resultDate.getMinutes() + sign * amount);
          break;
      }

      // 格式化结果
      setAddResult(formatDateForDisplay(resultDate));
    } catch (error) {
      console.error(
        intl.formatMessage({
          id: "tools.dateCalculator.error.calculation_error",
        }),
        error
      );
    }
  };

  // 初始化计算
  useEffect(() => {
    const timer = setTimeout(() => {
      if (startDate && endDate) {
        calculateDateDiff(startDate, endDate);
      }
      if (baseDate) {
        calculateDateAddition(baseDate, timeAmount, timeUnit, operation);
      }
    }, 0);

    return () => clearTimeout(timer);
  }, [startDate, endDate, baseDate, timeAmount, timeUnit, operation]);

  // 处理开始日期变更
  const handleStartDateChange = (date: dayjs.Dayjs | null) => {
    setStartDate(date);
    if (date && endDate) {
      calculateDateDiff(date, endDate);
    }
  };

  // 处理结束日期变更
  const handleEndDateChange = (date: dayjs.Dayjs | null) => {
    setEndDate(date);
    if (startDate && date) {
      calculateDateDiff(startDate, date);
    }
  };

  // 处理基准日期变更
  const handleBaseDateChange = (date: dayjs.Dayjs | null) => {
    setBaseDate(date);
    if (date) {
      calculateDateAddition(date, timeAmount, timeUnit, operation);
    }
  };

  // 处理时间数量变更
  const handleTimeAmountChange = (value: number | null) => {
    if (value === null) return;
    setTimeAmount(value);
    if (baseDate) {
      calculateDateAddition(baseDate, value, timeUnit, operation);
    }
  };

  // 处理时间单位变更
  const handleTimeUnitChange = (unit: TimeUnit) => {
    setTimeUnit(unit);
    if (baseDate) {
      calculateDateAddition(baseDate, timeAmount, unit, operation);
    }
  };

  // 处理操作变更
  const handleOperationChange = (op: "add" | "subtract") => {
    setOperation(op);
    if (baseDate) {
      calculateDateAddition(baseDate, timeAmount, timeUnit, op);
    }
  };

  // 复制结果
  const copyToClipboard = (text: string, type: string) => {
    copy(text).then((success) => {
      if (success) {
        setCopied(type);
        setTimeout(() => setCopied(null), 1500);
      }
    });
  };

  // 设置开始日期为当前时间
  const setStartDateToCurrent = () => {
    const now = dayjs();
    setStartDate(now);
    calculateDateDiff(now, endDate);
  };

  // 设置结束日期为当前时间
  const setEndDateToCurrent = () => {
    const now = dayjs();
    setEndDate(now);
    calculateDateDiff(startDate, now);
  };

  // 设置基准日期为当前时间
  const setBaseDateToCurrent = () => {
    const now = dayjs();
    setBaseDate(now);
    calculateDateAddition(now, timeAmount, timeUnit, operation);
  };

  // 交换开始和结束日期
  const swapDates = () => {
    const temp = startDate;
    setStartDate(endDate);
    setEndDate(temp);
    if (startDate && endDate) {
      calculateDateDiff(endDate, startDate);
    }
  };

  // 渲染时间单位选择器
  const renderUnitSelector = () => {
    const units = [
      {
        value: TimeUnit.YEARS,
        label: intl.formatMessage({
          id: "tools.dateCalculator.diff_calculator.year_unit",
        }),
      },
      {
        value: TimeUnit.MONTHS,
        label: intl.formatMessage({
          id: "tools.dateCalculator.diff_calculator.month_unit",
        }),
      },
      {
        value: TimeUnit.WEEKS,
        label: intl.formatMessage({
          id: "tools.dateCalculator.diff_calculator.week_unit",
        }),
      },
      {
        value: TimeUnit.DAYS,
        label: intl.formatMessage({
          id: "tools.dateCalculator.diff_calculator.day_unit",
        }),
      },
      {
        value: TimeUnit.HOURS,
        label: intl.formatMessage({
          id: "tools.dateCalculator.diff_calculator.hour_unit",
        }),
      },
      {
        value: TimeUnit.MINUTES,
        label: intl.formatMessage({
          id: "tools.dateCalculator.diff_calculator.minute_unit",
        }),
      },
    ];

    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2 mb-4">
        {units.map((unit) => (
          <Button
            key={unit.value}
            type={timeUnit === unit.value ? "primary" : "default"}
            size="small"
            onClick={() => handleTimeUnitChange(unit.value as TimeUnit)}
            className="w-full"
          >
            {unit.label}
          </Button>
        ))}
      </div>
    );
  };

  return (
    <div className="p-4 md:p-6 max-w-6xl mx-auto">
      <Title level={2}>
        <FormattedMessage id="tools.dateCalculator.name" />
      </Title>
      <Text className="text-gray-500 dark:text-gray-400 mb-6 block">
        <FormattedMessage id="tools.dateCalculator.description" />
      </Text>

      <Tabs
        activeKey={mode}
        onChange={(key) => setMode(key as "diff" | "add")}
        items={[
          {
            key: "diff",
            label: <FormattedMessage id="tools.dateCalculator.mode.diff" />,
            children: (
              <Card>
                <Title level={4} className="mb-4">
                  <FormattedMessage id="tools.dateCalculator.diff_calculator.title" />
                </Title>

                <Row gutter={[24, 24]}>
                  <Col xs={24} md={12}>
                    <div className="space-y-6">
                      <div>
                        <Text strong className="block mb-2">
                          <FormattedMessage id="tools.dateCalculator.diff_calculator.start_date" />
                        </Text>
                        <div className="flex items-center gap-2">
                          <DatePicker
                            className="w-full"
                            showTime
                            value={startDate}
                            onChange={handleStartDateChange}
                            format="YYYY-MM-DD HH:mm"
                          />
                          <Button onClick={setStartDateToCurrent}>
                            <FormattedMessage id="tools.dateCalculator.diff_calculator.current" />
                          </Button>
                        </div>
                      </div>

                      <div className="flex justify-center">
                        <Button
                          onClick={swapDates}
                          className="flex items-center"
                        >
                          <CalendarOutlined className="mr-2" />
                          <FormattedMessage id="tools.dateCalculator.diff_calculator.swap_dates" />
                        </Button>
                      </div>

                      <div>
                        <Text strong className="block mb-2">
                          <FormattedMessage id="tools.dateCalculator.diff_calculator.end_date" />
                        </Text>
                        <div className="flex items-center gap-2">
                          <DatePicker
                            className="w-full"
                            showTime
                            value={endDate}
                            onChange={handleEndDateChange}
                            format="YYYY-MM-DD HH:mm"
                          />
                          <Button onClick={setEndDateToCurrent}>
                            <FormattedMessage id="tools.dateCalculator.diff_calculator.current" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </Col>

                  <Col xs={24} md={12}>
                    <Card
                      title={
                        <FormattedMessage id="tools.dateCalculator.diff_calculator.result_title" />
                      }
                    >
                      {Object.keys(diffResult).length > 0 ? (
                        <div className="space-y-2">
                          <div className="flex justify-between items-center py-2 border-b border-gray-200 dark:border-gray-700">
                            <Text type="secondary">
                              <FormattedMessage id="tools.dateCalculator.diff_calculator.years" />
                            </Text>
                            <div className="flex items-center gap-2">
                              <Text strong>
                                {diffResult.years}{" "}
                                <FormattedMessage id="tools.dateCalculator.diff_calculator.year_unit" />
                              </Text>
                              <Button
                                size="small"
                                icon={
                                  copied === "years" ? (
                                    <CheckOutlined />
                                  ) : (
                                    <CopyOutlined />
                                  )
                                }
                                onClick={() =>
                                  copyToClipboard(
                                    diffResult.years.toString(),
                                    "years"
                                  )
                                }
                              />
                            </div>
                          </div>

                          <div className="flex justify-between items-center py-2 border-b border-gray-200 dark:border-gray-700">
                            <Text type="secondary">
                              <FormattedMessage id="tools.dateCalculator.diff_calculator.months" />
                            </Text>
                            <div className="flex items-center gap-2">
                              <Text strong>
                                {diffResult.months}{" "}
                                <FormattedMessage id="tools.dateCalculator.diff_calculator.month_unit" />
                              </Text>
                              <Button
                                size="small"
                                icon={
                                  copied === "months" ? (
                                    <CheckOutlined />
                                  ) : (
                                    <CopyOutlined />
                                  )
                                }
                                onClick={() =>
                                  copyToClipboard(
                                    diffResult.months.toString(),
                                    "months"
                                  )
                                }
                              />
                            </div>
                          </div>

                          <div className="flex justify-between items-center py-2 border-b border-gray-200 dark:border-gray-700">
                            <Text type="secondary">
                              <FormattedMessage id="tools.dateCalculator.diff_calculator.weeks" />
                            </Text>
                            <div className="flex items-center gap-2">
                              <Text strong>
                                {diffResult.weeks}{" "}
                                <FormattedMessage id="tools.dateCalculator.diff_calculator.week_unit" />
                              </Text>
                              <Button
                                size="small"
                                icon={
                                  copied === "weeks" ? (
                                    <CheckOutlined />
                                  ) : (
                                    <CopyOutlined />
                                  )
                                }
                                onClick={() =>
                                  copyToClipboard(
                                    diffResult.weeks.toString(),
                                    "weeks"
                                  )
                                }
                              />
                            </div>
                          </div>

                          <div className="flex justify-between items-center py-2 border-b border-gray-200 dark:border-gray-700">
                            <Text type="secondary">
                              <FormattedMessage id="tools.dateCalculator.diff_calculator.days" />
                            </Text>
                            <div className="flex items-center gap-2">
                              <Text strong>
                                {diffResult.days}{" "}
                                <FormattedMessage id="tools.dateCalculator.diff_calculator.day_unit" />
                              </Text>
                              <Button
                                size="small"
                                icon={
                                  copied === "days" ? (
                                    <CheckOutlined />
                                  ) : (
                                    <CopyOutlined />
                                  )
                                }
                                onClick={() =>
                                  copyToClipboard(
                                    diffResult.days.toString(),
                                    "days"
                                  )
                                }
                              />
                            </div>
                          </div>

                          <div className="flex justify-between items-center py-2 border-b border-gray-200 dark:border-gray-700">
                            <Text type="secondary">
                              <FormattedMessage id="tools.dateCalculator.diff_calculator.hours" />
                            </Text>
                            <div className="flex items-center gap-2">
                              <Text strong>
                                {diffResult.hours}{" "}
                                <FormattedMessage id="tools.dateCalculator.diff_calculator.hour_unit" />
                              </Text>
                              <Button
                                size="small"
                                icon={
                                  copied === "hours" ? (
                                    <CheckOutlined />
                                  ) : (
                                    <CopyOutlined />
                                  )
                                }
                                onClick={() =>
                                  copyToClipboard(
                                    diffResult.hours.toString(),
                                    "hours"
                                  )
                                }
                              />
                            </div>
                          </div>

                          <div className="flex justify-between items-center py-2 border-b border-gray-200 dark:border-gray-700">
                            <Text type="secondary">
                              <FormattedMessage id="tools.dateCalculator.diff_calculator.minutes" />
                            </Text>
                            <div className="flex items-center gap-2">
                              <Text strong>
                                {diffResult.minutes}{" "}
                                <FormattedMessage id="tools.dateCalculator.diff_calculator.minute_unit" />
                              </Text>
                              <Button
                                size="small"
                                icon={
                                  copied === "minutes" ? (
                                    <CheckOutlined />
                                  ) : (
                                    <CopyOutlined />
                                  )
                                }
                                onClick={() =>
                                  copyToClipboard(
                                    diffResult.minutes.toString(),
                                    "minutes"
                                  )
                                }
                              />
                            </div>
                          </div>

                          <div className="flex justify-between items-center py-2 border-b border-gray-200 dark:border-gray-700">
                            <Text type="secondary">
                              <FormattedMessage id="tools.dateCalculator.diff_calculator.seconds" />
                            </Text>
                            <div className="flex items-center gap-2">
                              <Text strong>
                                {diffResult.seconds}{" "}
                                <FormattedMessage id="tools.dateCalculator.diff_calculator.second_unit" />
                              </Text>
                              <Button
                                size="small"
                                icon={
                                  copied === "seconds" ? (
                                    <CheckOutlined />
                                  ) : (
                                    <CopyOutlined />
                                  )
                                }
                                onClick={() =>
                                  copyToClipboard(
                                    diffResult.seconds.toString(),
                                    "seconds"
                                  )
                                }
                              />
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="text-center py-4 text-gray-500 dark:text-gray-400">
                          <FormattedMessage id="tools.dateCalculator.diff_calculator.no_valid_dates" />
                        </div>
                      )}
                    </Card>
                  </Col>
                </Row>
              </Card>
            ),
          },
          {
            key: "add",
            label: <FormattedMessage id="tools.dateCalculator.mode.add" />,
            children: (
              <Card>
                <Title level={4} className="mb-4">
                  <FormattedMessage id="tools.dateCalculator.add_calculator.title" />
                </Title>

                <Row gutter={[24, 24]}>
                  <Col xs={24} md={12}>
                    <div className="space-y-6">
                      <div>
                        <Text strong className="block mb-2">
                          <FormattedMessage id="tools.dateCalculator.add_calculator.base_date" />
                        </Text>
                        <div className="flex items-center gap-2">
                          <DatePicker
                            className="w-full"
                            showTime
                            value={baseDate}
                            onChange={handleBaseDateChange}
                            format="YYYY-MM-DD HH:mm"
                          />
                          <Button onClick={setBaseDateToCurrent}>
                            <FormattedMessage id="tools.dateCalculator.diff_calculator.current" />
                          </Button>
                        </div>
                      </div>

                      <div>
                        <Text strong className="block mb-2">
                          <FormattedMessage id="tools.dateCalculator.add_calculator.operation" />
                        </Text>
                        <div className="flex items-center gap-2">
                          <Button
                            type={operation === "add" ? "primary" : "default"}
                            icon={<PlusOutlined />}
                            onClick={() => handleOperationChange("add")}
                          >
                            <FormattedMessage id="tools.dateCalculator.add_calculator.add" />
                          </Button>
                          <Button
                            type={
                              operation === "subtract" ? "primary" : "default"
                            }
                            icon={<MinusOutlined />}
                            onClick={() => handleOperationChange("subtract")}
                          >
                            <FormattedMessage id="tools.dateCalculator.add_calculator.subtract" />
                          </Button>
                        </div>
                      </div>

                      <div>
                        <Text strong className="block mb-2">
                          <FormattedMessage id="tools.dateCalculator.add_calculator.time_amount" />
                        </Text>
                        <Input
                          type="number"
                          min="1"
                          value={timeAmount}
                          onChange={(e) =>
                            handleTimeAmountChange(
                              parseInt(e.target.value) || 1
                            )
                          }
                          className="w-full"
                        />
                      </div>

                      <div>
                        <Text strong className="block mb-2">
                          <FormattedMessage id="tools.dateCalculator.add_calculator.time_unit" />
                        </Text>
                        {renderUnitSelector()}
                      </div>
                    </div>
                  </Col>

                  <Col xs={24} md={12}>
                    <Card
                      title={
                        <FormattedMessage id="tools.dateCalculator.add_calculator.result_title" />
                      }
                    >
                      {addResult ? (
                        <div className="space-y-4">
                          <div className="p-4 bg-gray-100 dark:bg-gray-800 rounded-md text-center">
                            <Text
                              type="secondary"
                              className="text-sm block mb-1"
                            >
                              {operation === "add"
                                ? intl
                                    .formatMessage({
                                      id: "tools.dateCalculator.add_calculator.add_result",
                                    })
                                    .replace("{amount}", timeAmount.toString())
                                    .replace(
                                      "{unit}",
                                      timeUnit === TimeUnit.YEARS
                                        ? intl.formatMessage({
                                            id: "tools.dateCalculator.diff_calculator.year_unit",
                                          })
                                        : timeUnit === TimeUnit.MONTHS
                                        ? intl.formatMessage({
                                            id: "tools.dateCalculator.diff_calculator.month_unit",
                                          })
                                        : timeUnit === TimeUnit.WEEKS
                                        ? intl.formatMessage({
                                            id: "tools.dateCalculator.diff_calculator.week_unit",
                                          })
                                        : timeUnit === TimeUnit.DAYS
                                        ? intl.formatMessage({
                                            id: "tools.dateCalculator.diff_calculator.day_unit",
                                          })
                                        : timeUnit === TimeUnit.HOURS
                                        ? intl.formatMessage({
                                            id: "tools.dateCalculator.diff_calculator.hour_unit",
                                          })
                                        : intl.formatMessage({
                                            id: "tools.dateCalculator.diff_calculator.minute_unit",
                                          })
                                    )
                                : intl
                                    .formatMessage({
                                      id: "tools.dateCalculator.add_calculator.subtract_result",
                                    })
                                    .replace("{amount}", timeAmount.toString())
                                    .replace(
                                      "{unit}",
                                      timeUnit === TimeUnit.YEARS
                                        ? intl.formatMessage({
                                            id: "tools.dateCalculator.diff_calculator.year_unit",
                                          })
                                        : timeUnit === TimeUnit.MONTHS
                                        ? intl.formatMessage({
                                            id: "tools.dateCalculator.diff_calculator.month_unit",
                                          })
                                        : timeUnit === TimeUnit.WEEKS
                                        ? intl.formatMessage({
                                            id: "tools.dateCalculator.diff_calculator.week_unit",
                                          })
                                        : timeUnit === TimeUnit.DAYS
                                        ? intl.formatMessage({
                                            id: "tools.dateCalculator.diff_calculator.day_unit",
                                          })
                                        : timeUnit === TimeUnit.HOURS
                                        ? intl.formatMessage({
                                            id: "tools.dateCalculator.diff_calculator.hour_unit",
                                          })
                                        : intl.formatMessage({
                                            id: "tools.dateCalculator.diff_calculator.minute_unit",
                                          })
                                    )}
                            </Text>
                            <Text strong className="text-lg block">
                              {addResult}
                            </Text>
                          </div>

                          <div className="flex justify-center">
                            <Button
                              icon={
                                copied === "result" ? (
                                  <CheckOutlined />
                                ) : (
                                  <CopyOutlined />
                                )
                              }
                              onClick={() =>
                                copyToClipboard(addResult, "result")
                              }
                            >
                              {copied === "result" ? (
                                <FormattedMessage id="tools.dateCalculator.add_calculator.copied" />
                              ) : (
                                <FormattedMessage id="tools.dateCalculator.add_calculator.copy_result" />
                              )}
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div className="text-center py-4 text-gray-500 dark:text-gray-400">
                          <FormattedMessage id="tools.dateCalculator.add_calculator.no_valid_input" />
                        </div>
                      )}
                    </Card>

                    <Divider />

                    <div>
                      <Text strong className="block mb-2">
                        <FormattedMessage id="tools.dateCalculator.add_calculator.notes_title" />
                      </Text>
                      <ul className="list-disc pl-5 space-y-1 text-sm text-gray-600 dark:text-gray-400">
                        <li>
                          <FormattedMessage id="tools.dateCalculator.add_calculator.note1" />
                        </li>
                        <li>
                          <FormattedMessage id="tools.dateCalculator.add_calculator.note2" />
                        </li>
                        <li>
                          <FormattedMessage id="tools.dateCalculator.add_calculator.note3" />
                        </li>
                      </ul>
                    </div>
                  </Col>
                </Row>
              </Card>
            ),
          },
        ]}
      />
    </div>
  );
};

export default DateCalculator;
