import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import type { IconDefinition } from '@fortawesome/free-solid-svg-icons';
import { useIntl } from 'react-intl';

export type ShapeType = 'circle' | 'square' | 'rounded-square' | 'hexagon';
export type BackgroundType = 'solid' | 'linear-gradient' | 'radial-gradient';
export type IconType = 'fontawesome' | 'text';

interface EnhancedIconPreviewProps {
  // 图标相关
  iconType: IconType;
  icon?: IconDefinition;
  customText?: string;
  iconColor: string;
  iconSize: number;
  iconRotation: number;
  fontFamily?: string;
  fontWeight?: string;
  
  // 背景相关
  backgroundType: BackgroundType;
  backgroundColor: string;
  gradientStartColor?: string;
  gradientEndColor?: string;
  gradientDirection?: number; // 角度
  shape: ShapeType;
  
  // 其他
  previewSize?: number;
}

export default function EnhancedIconPreview({
  iconType,
  icon,
  customText,
  iconColor,
  iconSize,
  iconRotation,
  fontFamily = 'Arial, sans-serif',
  fontWeight = 'normal',
  backgroundType,
  backgroundColor,
  gradientStartColor,
  gradientEndColor,
  gradientDirection = 45,
  shape,
  previewSize = 200
}: EnhancedIconPreviewProps) {
  const intl = useIntl();
  
  // 获取背景样式
  const getBackgroundStyle = () => {
    switch (backgroundType) {
      case 'linear-gradient':
        if (gradientStartColor && gradientEndColor) {
          return {
            background: `linear-gradient(${gradientDirection}deg, ${gradientStartColor}, ${gradientEndColor})`
          };
        }
        break;
      case 'radial-gradient':
        if (gradientStartColor && gradientEndColor) {
          return {
            background: `radial-gradient(circle, ${gradientStartColor}, ${gradientEndColor})`
          };
        }
        break;
      case 'solid':
      default:
        return {
          backgroundColor: backgroundColor
        };
    }
    return { backgroundColor: backgroundColor };
  };

  // 根据形状生成CSS类和额外样式
  const getShapeStyle = () => {
    const baseStyle = {
      width: `${previewSize}px`,
      height: `${previewSize}px`,
      position: 'relative' as const,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      overflow: 'hidden',
      ...getBackgroundStyle()
    };

    switch (shape) {
      case 'circle':
        return {
          ...baseStyle,
          borderRadius: '50%'
        };
      case 'square':
        return baseStyle;
      case 'rounded-square':
        return {
          ...baseStyle,
          borderRadius: `${previewSize * 0.15}px`
        };
      case 'hexagon':
        return {
          ...baseStyle,
          clipPath: 'polygon(25% 6.7%, 75% 6.7%, 100% 50%, 75% 93.3%, 25% 93.3%, 0% 50%)'
        };
      default:
        return baseStyle;
    }
  };

  // 计算图标/文字大小
  const calculateIconSize = () => {
    return (previewSize * iconSize) / 100;
  };

  // 渲染图标内容
  const renderIconContent = () => {
    const iconStyle = {
      color: iconColor,
      fontSize: `${calculateIconSize()}px`,
      transform: `rotate(${iconRotation}deg)`,
      transition: 'all 0.3s ease',
      userSelect: 'none' as const
    };

    if (iconType === 'text' && customText) {
      return (
        <span
          style={{
            ...iconStyle,
            fontFamily,
            fontWeight,
            lineHeight: 1,
            textAlign: 'center' as const
          }}
        >
          {customText}
        </span>
      );
    } else if (iconType === 'fontawesome' && icon) {
      return (
        <FontAwesomeIcon
          icon={icon}
          style={iconStyle}
        />
      );
    }

    return null;
  };

  return (
    <div className="flex flex-col items-center">
      <div style={getShapeStyle()}>
        {renderIconContent()}
      </div>
      
      <div className="mt-4 text-center">
        <p className="text-sm text-gray-600 dark:text-gray-300">
          {iconType === 'text' 
            ? `"${customText || intl.formatMessage({ id: 'tools.iconDesigner.text' })}" • ${intl.formatMessage({ id: `tools.iconDesigner.shape_${shape}` })} • ${iconSize}% • ${iconRotation}°`
            : `${icon?.iconName || intl.formatMessage({ id: 'tools.iconDesigner.icon' })} • ${intl.formatMessage({ id: `tools.iconDesigner.shape_${shape}` })} • ${iconSize}% • ${iconRotation}°`
          }
        </p>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          {backgroundType === 'solid' 
            ? `${intl.formatMessage({ id: 'tools.iconDesigner.background' })}: ${backgroundColor}`
            : `${intl.formatMessage({ id: 'tools.iconDesigner.background' })}: ${intl.formatMessage({ id: `tools.iconDesigner.${backgroundType}` })} (${gradientStartColor} → ${gradientEndColor})`
          }
        </p>
      </div>
    </div>
  );
} 