export interface DesktopIconData {
    id: string;
    title: string;
    icon: string;
    path: string;
    x: number;
    y: number;
    color?: string;
}

export interface DesktopSettings {
    wallpaper: 'gradient-green' | 'gradient-blue' | 'gradient-purple' | 'solid-dark';
    iconSize: 'small' | 'medium' | 'large';
}
