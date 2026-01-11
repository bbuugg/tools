import type { ReactNode } from 'react';

export interface ToolConfig {
    id: string;
    name: string;
    description: string;
    icon: ReactNode;
    category: ToolCategory;
    component: React.ComponentType;
    path: string;
}

export type ToolCategory =
    | 'Text'
    | 'Formatting'
    | 'Converter'
    | 'Generator'
    | 'Development'
    | 'Video'
    | 'Media'
    | 'Web'
    | 'Other';
