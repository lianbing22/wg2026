/**
 * 物业管理模拟器 - 数值变化动画组件
 * 用于显示游戏状态数值的动态变化效果
 */

import React, { useState, useEffect, useRef } from 'react';
import { Typography } from 'antd';
import './AnimatedValue.css';

const { Text } = Typography;

interface AnimatedValueProps {
  /** 当前值 */
  value: number;
  /** 前一个值（用于计算变化） */
  previousValue?: number;
  /** 显示格式化函数 */
  formatter?: (value: number) => string;
  /** 动画持续时间（毫秒） */
  duration?: number;
  /** 是否显示变化指示器 */
  showChangeIndicator?: boolean;
  /** 是否显示变化数值 */
  showChangeValue?: boolean;
  /** 自定义样式类名 */
  className?: string;
  /** 数值类型（用于确定颜色） */
  type?: 'default' | 'success' | 'warning' | 'error' | 'info';
  /** 是否启用计数动画 */
  enableCountAnimation?: boolean;
}

export default function AnimatedValue({
  value,
  previousValue,
  formatter = (val) => val.toString(),
  duration = 800,
  showChangeIndicator = true,
  showChangeValue = true,
  className = '',
  type = 'default',
  enableCountAnimation = true
}: AnimatedValueProps) {
  const [displayValue, setDisplayValue] = useState(value);
  const [isAnimating, setIsAnimating] = useState(false);
  const [changeDirection, setChangeDirection] = useState<'up' | 'down' | 'none'>('none');
  const [changeAmount, setChangeAmount] = useState(0);
  const animationRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(0);
  const startValueRef = useRef<number>(value);

  useEffect(() => {
    if (previousValue !== undefined && previousValue !== value) {
      const change = value - previousValue;
      setChangeAmount(Math.abs(change));
      setChangeDirection(change > 0 ? 'up' : change < 0 ? 'down' : 'none');
      
      if (enableCountAnimation && Math.abs(change) > 0) {
        startCountAnimation(previousValue, value);
      } else {
        setDisplayValue(value);
        triggerChangeAnimation();
      }
    } else {
      setDisplayValue(value);
    }
  }, [value, previousValue, enableCountAnimation]);

  const startCountAnimation = (fromValue: number, toValue: number) => {
    setIsAnimating(true);
    startTimeRef.current = performance.now();
    startValueRef.current = fromValue;
    
    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTimeRef.current;
      const progress = Math.min(elapsed / duration, 1);
      
      // 使用缓动函数
      const easedProgress = easeOutCubic(progress);
      const currentValue = startValueRef.current + 
        (toValue - startValueRef.current) * easedProgress;
      
      setDisplayValue(Math.round(currentValue));
      
      if (progress < 1) {
        animationRef.current = requestAnimationFrame(animate);
      } else {
        setDisplayValue(toValue);
        setIsAnimating(false);
        triggerChangeAnimation();
      }
    };
    
    animationRef.current = requestAnimationFrame(animate);
  };

  const triggerChangeAnimation = () => {
    if (changeDirection !== 'none') {
      // 触发CSS动画
      const element = document.querySelector(`.animated-value-${Date.now()}`);
      if (element) {
        element.classList.add('value-changed');
        setTimeout(() => {
          element.classList.remove('value-changed');
        }, 600);
      }
    }
  };

  // 缓动函数
  const easeOutCubic = (t: number): number => {
    return 1 - Math.pow(1 - t, 3);
  };

  // 清理动画
  useEffect(() => {
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  // 获取变化指示器的颜色类
  const getChangeColorClass = () => {
    if (changeDirection === 'up') {
      return type === 'error' ? 'change-negative' : 'change-positive';
    } else if (changeDirection === 'down') {
      return type === 'error' ? 'change-positive' : 'change-negative';
    }
    return '';
  };

  // 获取数值类型的颜色类
  const getTypeColorClass = () => {
    switch (type) {
      case 'success': return 'value-success';
      case 'warning': return 'value-warning';
      case 'error': return 'value-error';
      case 'info': return 'value-info';
      default: return 'value-default';
    }
  };

  const uniqueClass = `animated-value-${Date.now()}`;

  return (
    <div className={`animated-value ${className} ${uniqueClass}`}>
      <div className="value-container">
        <Text 
          className={`
            main-value 
            ${getTypeColorClass()} 
            ${isAnimating ? 'animating' : ''}
          `}
        >
          {formatter(displayValue)}
        </Text>
        
        {showChangeIndicator && changeDirection !== 'none' && (
          <div className={`change-indicator ${getChangeColorClass()}`}>
            <span className="change-arrow">
              {changeDirection === 'up' ? '↗' : '↘'}
            </span>
            {showChangeValue && (
              <span className="change-value">
                {changeAmount > 0 ? formatter(changeAmount) : ''}
              </span>
            )}
          </div>
        )}
      </div>
      
      {/* 粒子效果容器 */}
      {changeDirection !== 'none' && (
        <div className={`particles-container ${changeDirection}`}>
          {[...Array(6)].map((_, index) => (
            <div 
              key={index} 
              className={`particle particle-${index + 1} ${getChangeColorClass()}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// 导出类型定义
export type { AnimatedValueProps };