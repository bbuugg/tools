import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import type { IconDefinition } from '@fortawesome/free-solid-svg-icons';

export type ShapeType = 'circle' | 'square' | 'rounded-square' | 'hexagon';

interface IconPreviewProps {
  icon: IconDefinition;
  backgroundColor: string;
  iconColor: string;
  shape: ShapeType;
  iconSize: number;
  previewSize?: number;
}

export default function IconPreview({
  icon,
  backgroundColor,
  iconColor,
  shape,
  iconSize,
  previewSize = 200
}: IconPreviewProps) {
  
  // 根据形状生成CSS类
  const getShapeClass = () => {
    switch (shape) {
      case 'circle':
        return 'rounded-full';
      case 'square':
        return '';
      case 'rounded-square':
        return 'rounded-xl';
      case 'hexagon':
        return 'rounded-lg transform rotate-45'; // 简化为圆角，真正的六边形需要clip-path
      default:
        return '';
    }
  };

  // 计算图标大小
  const calculateIconSize = () => {
    return (previewSize * iconSize) / 100;
  };

  return (
    <div className="flex flex-col items-center">
      <div
        className={`relative flex items-center justify-center ${getShapeClass()}`}
        style={{
          width: `${previewSize}px`,
          height: `${previewSize}px`,
          backgroundColor: backgroundColor,
        }}
      >
        <FontAwesomeIcon
          icon={icon}
          style={{
            color: iconColor,
            fontSize: `${calculateIconSize()}px`,
          }}
          className={shape === 'hexagon' ? 'transform -rotate-45' : ''}
        />
      </div>
      
      <div className="mt-4 text-center">
        <p className="text-sm text-secondary">
          {icon.iconName} • {shape} • {iconSize}%
        </p>
      </div>
    </div>
  );
} 