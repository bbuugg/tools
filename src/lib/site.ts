const SITE_NAME = "工具站";

export const SITE_URL = "https://www.codeemo.cn";

export interface SiteDefination {
    title: string;
    description: string;
}

/** 拼接页面标题：`页面名 - 工具站` */
export function pageTitle(title: string) {
    return `${title} - ${SITE_NAME}`;
}
