import React, { useRef, useEffect, forwardRef, useImperativeHandle } from 'react';
import type { IconDefinition } from '@fortawesome/free-solid-svg-icons';
import type { BackgroundType, IconType, ShapeType } from './EnhancedIconPreview';

interface EnhancedIconCanvasProps {
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
  gradientDirection?: number;
  shape: ShapeType;
  
  canvasSize?: number;
}

export interface EnhancedIconCanvasRef {
  getCanvas: () => HTMLCanvasElement | null;
  generateIcon: (size: number) => Promise<string>;
}

const EnhancedIconCanvas = forwardRef<EnhancedIconCanvasRef, EnhancedIconCanvasProps>(({
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
  canvasSize = 200
}, ref) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // 创建渐变
  const createGradient = (ctx: CanvasRenderingContext2D, size: number) => {
    if (!gradientStartColor || !gradientEndColor) return null;

    if (backgroundType === 'linear-gradient') {
      const angle = (gradientDirection * Math.PI) / 180;
      const x1 = size / 2 - (Math.cos(angle) * size) / 2;
      const y1 = size / 2 - (Math.sin(angle) * size) / 2;
      const x2 = size / 2 + (Math.cos(angle) * size) / 2;
      const y2 = size / 2 + (Math.sin(angle) * size) / 2;
      
      const gradient = ctx.createLinearGradient(x1, y1, x2, y2);
      gradient.addColorStop(0, gradientStartColor);
      gradient.addColorStop(1, gradientEndColor);
      return gradient;
    } else if (backgroundType === 'radial-gradient') {
      const gradient = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
      gradient.addColorStop(0, gradientStartColor);
      gradient.addColorStop(1, gradientEndColor);
      return gradient;
    }

    return null;
  };

  // 独立的绘制函数
  const drawIconToContext = React.useCallback(async (ctx: CanvasRenderingContext2D, size: number) => {
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    ctx.clearRect(0, 0, size, size);

    // 绘制背景
    const padding = (size * 5) / 200;
    const backgroundSize = size - padding * 2;
    
    // 设置背景颜色或渐变
    const gradient = createGradient(ctx, size);
    ctx.fillStyle = gradient || backgroundColor;
    
    switch (shape) {
      case 'circle': {
        ctx.beginPath();
        ctx.arc(size / 2, size / 2, backgroundSize / 2, 0, 2 * Math.PI);
        ctx.fill();
        break;
      }
      case 'square': {
        ctx.fillRect(padding, padding, backgroundSize, backgroundSize);
        break;
      }
      case 'rounded-square': {
        ctx.beginPath();
        const radius = backgroundSize * 0.15;
        ctx.roundRect(padding, padding, backgroundSize, backgroundSize, radius);
        ctx.fill();
        break;
      }
      case 'hexagon': {
        const centerX = size / 2;
        const centerY = size / 2;
        const hexRadius = backgroundSize / 2;
        ctx.beginPath();
        for (let i = 0; i < 6; i++) {
          const angle = (i * Math.PI) / 3;
          const x = centerX + hexRadius * Math.cos(angle);
          const y = centerY + hexRadius * Math.sin(angle);
          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.closePath();
        ctx.fill();
        break;
      }
    }

    // 绘制图标或文字
    const iconDrawSize = (size * iconSize) / 100;
    const iconX = size / 2;
    const iconY = size / 2;

    ctx.save();
    ctx.translate(iconX, iconY);
    ctx.rotate((iconRotation * Math.PI) / 180);

    if (iconType === 'text' && customText) {
      // 绘制自定义文字
      ctx.fillStyle = iconColor;
      ctx.font = `${fontWeight} ${iconDrawSize}px ${fontFamily}`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(customText, 0, 0);
    } else if (iconType === 'fontawesome' && icon) {
      // 绘制FontAwesome图标
      try {
        const svgString = `
          <svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 ${icon.icon[0]} ${icon.icon[1]}">
            <path fill="${iconColor}" d="${icon.icon[4]}"/>
          </svg>
        `;
        
        const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
        const svgUrl = URL.createObjectURL(svgBlob);
        const img = new Image();
        
        await new Promise<void>((resolve) => {
          img.onload = () => {
            ctx.drawImage(img, -iconDrawSize / 2, -iconDrawSize / 2, iconDrawSize, iconDrawSize);
            URL.revokeObjectURL(svgUrl);
            resolve();
          };
          
          img.onerror = () => {
            URL.revokeObjectURL(svgUrl);
            // 降级方案：绘制一个圆点
            ctx.fillStyle = iconColor;
            ctx.beginPath();
            ctx.arc(0, 0, iconDrawSize / 4, 0, 2 * Math.PI);
            ctx.fill();
            resolve();
          };
          
          img.src = svgUrl;
        });
      } catch (error) {
        console.error('绘制图标失败:', error);
        // 降级方案
        ctx.fillStyle = iconColor;
        ctx.beginPath();
        ctx.arc(0, 0, iconDrawSize / 4, 0, 2 * Math.PI);
        ctx.fill();
      }
    }

    ctx.restore();
  }, [iconType, icon, customText, iconColor, iconSize, iconRotation, fontFamily, fontWeight, backgroundType, backgroundColor, gradientStartColor, gradientEndColor, gradientDirection, shape, createGradient]);

  // 绘制到当前画布
  const drawIcon = React.useCallback(async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = canvasSize;
    canvas.height = canvasSize;

    await drawIconToContext(ctx, canvasSize);
  }, [drawIconToContext, canvasSize]);

  // 生成指定尺寸的图标
  const generateIcon = React.useCallback(async (size: number): Promise<string> => {
    const tempCanvas = document.createElement('canvas');
    const tempCtx = tempCanvas.getContext('2d');
    
    if (!tempCtx) {
      throw new Error('无法创建画布');
    }

    tempCanvas.width = size;
    tempCanvas.height = size;

    tempCtx.imageSmoothingEnabled = true;
    tempCtx.imageSmoothingQuality = 'high';
    
    await drawIconToContext(tempCtx, size);
    
    return tempCanvas.toDataURL('image/png');
  }, [drawIconToContext]);

  // 暴露方法给父组件
  useImperativeHandle(ref, () => ({
    getCanvas: () => canvasRef.current,
    generateIcon
  }), [generateIcon]);

  // 当参数变化时重新绘制
  useEffect(() => {
    drawIcon().catch(console.error);
  }, [drawIcon]);

  return (
    <canvas
      ref={canvasRef}
      className="rounded-lg shadow-lg border border-purple-glow/20"
      style={{ 
        maxWidth: `${canvasSize}px`, 
        maxHeight: `${canvasSize}px`,
        width: '100%',
        height: 'auto'
      }}
    />
  );
});

EnhancedIconCanvas.displayName = 'EnhancedIconCanvas';

export default EnhancedIconCanvas; 