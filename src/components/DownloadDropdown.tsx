import { Dropdown, Button } from "antd";
import { FormattedMessage } from "react-intl";
import { DownloadOutlined } from "@ant-design/icons";
import { isElectron } from "@/utils/env";

export default function DownloadDropdown() {
  if (isElectron()) {
    return;
  }

  return (
    <Dropdown
      menu={{
        items: [
          {
            key: "mac-download",
            label: (
              <a href="https://www.codeemo.cn/app/tools-mac-0.0.1.dmg" download>
                <FormattedMessage
                  id="nav.download.mac"
                  defaultMessage="Mac 客户端"
                />
              </a>
            ),
          },
          {
            key: "windows-download",
            label: (
              <a
                href="https://www.codeemo.cn/app/tools-windows-0.0.1.exe"
                download
              >
                <FormattedMessage
                  id="nav.download.windows"
                  defaultMessage="Windows 客户端"
                />
              </a>
            ),
          },
        ],
      }}
      placement="bottomRight"
      trigger={["click"]}
    >
      <Button icon={<DownloadOutlined />} type="text" className="no-drag">
        <FormattedMessage
          id="nav.download.client"
          defaultMessage="下载客户端"
        />
      </Button>
    </Dropdown>
  );
}
