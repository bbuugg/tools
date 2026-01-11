import React from 'react';
import type { ToolConfig } from '@/types/tool';
import {
    CopyOutlined,
    PoweroffOutlined,
    LineChartOutlined,
    RobotOutlined,
    CalendarOutlined,
    HeartOutlined,
    LikeOutlined,
    MessageOutlined,
    PlusOutlined,
    HourglassOutlined,
    SwapOutlined
} from '@ant-design/icons';

// Lazy load tool components for better performance
const TextCopyTool = React.lazy(() => import('./TextCopyTool'));
const PowerOnDetector = React.lazy(() => import('./PowerOnDetector'));
const MouseTrack = React.lazy(() => import('./MouseTrack'));
const EmptyDetector = React.lazy(() => import('./EmptyDetector'));
const DayOfWeek = React.lazy(() => import('./DayOfWeek'));
const BreathingReminder = React.lazy(() => import('./BreathingReminder'));
const Encouragement = React.lazy(() => import('./Encouragement'));
const TypingSimulator = React.lazy(() => import('./TypingSimulator'));
const ClickCounter = React.lazy(() => import('./ClickCounter'));
const WaitPage = React.lazy(() => import('./WaitPage'));
const IdentityTransformer = React.lazy(() => import('./IdentityTransformer'));

const tools: ToolConfig[] = [
    {
        id: 'textCopy',
        name: 'Text Copy Tool',
        description: 'Quickly copy and count text characters/words.',
        icon: <CopyOutlined />,
        category: 'Text',
        component: TextCopyTool,
        path: '/as/text-copy',
    },
    {
        id: 'powerOn',
        name: 'Power-on Detector',
        description: 'Advanced check to see if your device is currently powered on.',
        icon: <PoweroffOutlined />,
        category: 'Other',
        component: PowerOnDetector,
        path: '/as/power-on',
    },
    {
        id: 'mouseTrack',
        name: 'Mouse Track Recorder',
        description: 'Record your mouse movements to see how "busy" you were today.',
        icon: <LineChartOutlined />,
        category: 'Other',
        component: MouseTrack,
        path: '/as/mouse-track',
    },
    {
        id: 'emptyDetector',
        name: 'Empty Text Detector',
        description: 'Advanced AI analysis to determine if your text is actually empty.',
        icon: <RobotOutlined />,
        category: 'Development',
        component: EmptyDetector,
        path: '/as/empty-detector',
    },
    {
        id: 'dayOfWeek',
        name: 'AI Day of the Week',
        description: 'Leverage AI to discover what day of the week it is today.',
        icon: <CalendarOutlined />,
        category: 'Development',
        component: DayOfWeek,
        path: '/as/day-of-week',
    },
    {
        id: 'breathing',
        name: 'AI Breathing Reminder',
        description: 'Critical health management: AI reminds you to breathe every 10 seconds.',
        icon: <HeartOutlined />,
        category: 'Other',
        component: BreathingReminder,
        path: '/as/breathing',
    },
    {
        id: 'encouragement',
        name: 'Encouragement Machine',
        description: 'Feeling down? Get some high-quality AI praise.',
        icon: <LikeOutlined />,
        category: 'Other',
        component: Encouragement,
        path: '/as/encouragement',
    },
    {
        id: 'typing',
        name: 'Attention Simulator',
        description: 'Someone is typing... always.',
        icon: <MessageOutlined />,
        category: 'Other',
        component: TypingSimulator,
        path: '/as/typing',
    },
    {
        id: 'clickCounter',
        name: 'Click Counter',
        description: 'The ultimate tool for counting button clicks.',
        icon: <PlusOutlined />,
        category: 'Other',
        component: ClickCounter,
        path: '/as/click-counter',
    },
    {
        id: 'waitPage',
        name: 'Patience Trainer',
        description: 'A random waiting experience to help you find inner peace.',
        icon: <HourglassOutlined />,
        category: 'Other',
        component: WaitPage,
        path: '/as/wait-page',
    },
    {
        id: 'identity',
        name: 'Identity Transformer',
        description: 'State-of-the-art processing that transforms your text into itself.',
        icon: <SwapOutlined />,
        category: 'Formatting',
        component: IdentityTransformer,
        path: '/as/identity-transformer',
    },
];

export default tools;
