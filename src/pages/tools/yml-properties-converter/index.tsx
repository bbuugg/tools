import { useMemo, useState } from "react";

import TextToolLayout from "@/components/TextToolLayout";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { propertiesToYml, ymlToProperties } from "@/lib/yml-properties";

type Direction = "yml_to_properties" | "properties_to_yml";

const YML_EXAMPLE = `# 服务器配置
server:
  port: 8080
  servlet:
    context-path: /api

# 数据库配置
spring:
  datasource:
    url: jdbc:mysql://localhost:3306/mydb
    username: root
    password: secret
    driver-class-name: com.mysql.cj.jdbc.Driver
  jpa:
    hibernate:
      ddl-auto: update
    show-sql: true

# 缓存配置
cache:
  type: redis
  redis:
    host: localhost
    port: 6379
    password: null
    ttl: 300

# 日志配置
logging:
  level:
    root: INFO
    org.springframework: WARN`;

const PROPERTIES_EXAMPLE = `# 服务器配置
server.port=8080
server.servlet.context-path=/api

# 数据库配置
spring.datasource.url=jdbc:mysql://localhost:3306/mydb
spring.datasource.username=root
spring.datasource.password=secret
spring.datasource.driver-class-name=com.mysql.cj.jdbc.Driver

spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=true

# 缓存配置
cache.type=redis
cache.redis.host=localhost
cache.redis.port=6379
cache.redis.password=
cache.redis.ttl=300

# 日志配置
logging.level.root=INFO
logging.level.org.springframework=WARN`;

export default function YmlPropertiesConverterPage() {
  const [input, setInput] = useState("");
  const [dir, setDir] = useState<Direction>("yml_to_properties");

  // YAML → Properties 选项
  const [delimiter, setDelimiter] = useState("equals");
  const [escapeUnicode, setEscapeUnicode] = useState(false);
  const [propsSortKeys, setPropsSortKeys] = useState(false);

  // Properties → YAML 选项
  const [indent, setIndent] = useState(2);
  const [quoteStrings, setQuoteStrings] = useState(false);
  const [ymlSortKeys, setYmlSortKeys] = useState(false);

  const toProperties = dir === "yml_to_properties";

  const result = useMemo(() => {
    if (!input.trim()) return { output: "", error: "" };
    try {
      const output = toProperties
        ? ymlToProperties(input, {
            delimiter,
            escapeUnicode,
            sortKeys: propsSortKeys,
          })
        : propertiesToYml(input, { indent, quoteStrings, sortKeys: ymlSortKeys });
      return { output, error: "" };
    } catch (err) {
      return {
        output: "",
        error: err instanceof Error ? err.message : "转换失败，请检查输入格式",
      };
    }
  }, [
    input,
    toProperties,
    delimiter,
    escapeUnicode,
    propsSortKeys,
    indent,
    quoteStrings,
    ymlSortKeys,
  ]);

  return (
    <TextToolLayout
      input={input}
      onInputChange={setInput}
      inputLabel={toProperties ? "YAML" : "Properties"}
      inputLanguage={toProperties ? "yaml" : "ini"}
      output={result.output}
      error={result.error}
      outputLabel={toProperties ? "Properties" : "YAML"}
      outputLanguage={toProperties ? "ini" : "yaml"}
      downloadName={
        toProperties
          ? "application.properties"
          : "application.yml"
      }
      onExample={() => setInput(toProperties ? YML_EXAMPLE : PROPERTIES_EXAMPLE)}
      onSwap={() => {
        setDir(toProperties ? "properties_to_yml" : "yml_to_properties");
        if (result.output) setInput(result.output);
      }}
      options={
        <>
          <div className="mb-4 flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2 text-sm">
              <span
                className={
                  toProperties
                    ? "font-medium text-primary"
                    : "text-muted-foreground"
                }
              >
                YAML → Properties
              </span>
              <Switch
                size="sm"
                checked={!toProperties}
                onCheckedChange={(c) =>
                  setDir(c ? "properties_to_yml" : "yml_to_properties")
                }
              />
              <span
                className={
                  !toProperties
                    ? "font-medium text-primary"
                    : "text-muted-foreground"
                }
              >
                Properties → YAML
              </span>
            </div>
          </div>

          {/* 高级选项 */}
          <div className="space-y-3 rounded-md bg-muted p-4">
            <Label className="text-xs text-muted-foreground">高级选项</Label>
            {toProperties ? (
              <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
                <div className="flex items-center gap-2">
                  <Label className="text-xs text-muted-foreground">分隔符</Label>
                  <Select value={delimiter} onValueChange={setDelimiter}>
                    <SelectTrigger className="h-8 w-28">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="equals">= 等号</SelectItem>
                      <SelectItem value="colon">: 冒号</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <label className="flex cursor-pointer items-center gap-1.5 text-sm select-none">
                  <Checkbox
                    checked={escapeUnicode}
                    onCheckedChange={(c) => setEscapeUnicode(c === true)}
                  />
                  <span className="text-muted-foreground">Unicode 转义</span>
                </label>
                <label className="flex cursor-pointer items-center gap-1.5 text-sm select-none">
                  <Checkbox
                    checked={propsSortKeys}
                    onCheckedChange={(c) => setPropsSortKeys(c === true)}
                  />
                  <span className="text-muted-foreground">键名排序</span>
                </label>
              </div>
            ) : (
              <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
                <div className="flex items-center gap-2">
                  <Label className="text-xs text-muted-foreground">缩进</Label>
                  <Input
                    type="number"
                    min={1}
                    max={8}
                    value={indent}
                    onChange={(e) => setIndent(Number(e.target.value) || 2)}
                    className="h-8 w-16"
                  />
                </div>
                <label className="flex cursor-pointer items-center gap-1.5 text-sm select-none">
                  <Checkbox
                    checked={quoteStrings}
                    onCheckedChange={(c) => setQuoteStrings(c === true)}
                  />
                  <span className="text-muted-foreground">引号包裹字符串</span>
                </label>
                <label className="flex cursor-pointer items-center gap-1.5 text-sm select-none">
                  <Checkbox
                    checked={ymlSortKeys}
                    onCheckedChange={(c) => setYmlSortKeys(c === true)}
                  />
                  <span className="text-muted-foreground">键名排序</span>
                </label>
              </div>
            )}
          </div>
        </>
      }
    />
  );
}
