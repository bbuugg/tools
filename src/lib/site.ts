const SITE_NAME = "开发者工具";

export interface SiteDefination {
    title: string;
    description: string;
}

/** 拼接页面标题：`页面名 - 开发者工具` */
export function pageTitle(title: string) {
    return `${title} - ${SITE_NAME}`;
}
