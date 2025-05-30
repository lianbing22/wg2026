/**
 * 物业管理模拟器 - QTE（快速时间事件）容器组件
 * 负责渲染和管理各种类型的QTE事件
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { Card, Button, Progress, Typography, Space, Alert } from 'antd';
import { CloseOutlined } from '@ant-design/icons';
import { QTEConfig, QTEResult } from '../../types/game';
import './QTEContainer.css';

const { Title, Text } = Typography;

interface QTEContainerProps {
  /** QTE配置 */
  config: QTEConfig;
  /** QTE完成回调 */
  onComplete: (success: boolean, result: QTEResult) => void;
  /** 退出回调 */
  onExit?: () => void;
}

export default function QTEContainer({ config, onComplete, onExit }: QTEContainerProps) {
  const [timeLeft, setTimeLeft] = useState(config.timeLimit);
  const [isActive, setIsActive] = useState(false);
  const [result, setResult] = useState<QTEResult | null>(null);
  const [keySequence, setKeySequence] = useState<string[]>([]);
  const [currentKeyIndex, setCurrentKeyIndex] = useState(0);
  const [clickCount, setClickCount] = useState(0);
  const [accuracy, setAccuracy] = useState(100);
  const [isCompleted, setIsCompleted] = useState(false);
  
  const timerRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(0);
  const keyPressTimesRef = useRef<number[]>([]);

  // 初始化QTE
  useEffect(() => {
    startQTE();
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  // 开始QTE
  const startQTE = useCallback(() => {
    setIsActive(true);
    startTimeRef.current = Date.now();
    
    // 根据QTE类型初始化
    switch (config.type) {
      case 'ClickSequence':
        if (config.parameters?.sequence) {
          setKeySequence(config.parameters.sequence.map(item => item.id || ''));
        }
        break;
      case 'ButtonMash':
        setClickCount(0);
        break;
      case 'timing':
        // 定时QTE的特殊逻辑
        break;
      case 'PrecisionClick':
        // 精确QTE的特殊逻辑
        break;
    }

    // 启动计时器
    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        const currentTime = prev || 0;
        if (currentTime <= 0.1) {
          handleQTETimeout();
          return 0;
        }
        return currentTime - 0.1;
      });
    }, 100);
  }, [config]);

  // QTE超时处理
  const handleQTETimeout = useCallback(() => {
    if (isCompleted) return;
    
    setIsActive(false);
    setIsCompleted(true);
    
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    const endTime = Date.now();
    const duration = endTime - startTimeRef.current;
    
    const qteResult: QTEResult = {
      success: false,
      accuracy: 0,
      completionTime: duration
    };

    setResult(qteResult);
    
    setTimeout(() => {
      onComplete(false, qteResult);
    }, 1000);
  }, [config.type, onComplete, isCompleted]);

  // QTE成功处理
  const handleQTESuccess = useCallback((_score: number, accuracy: number) => {
    if (isCompleted) return;
    
    setIsActive(false);
    setIsCompleted(true);
    
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    const endTime = Date.now();
    const duration = endTime - startTimeRef.current;
    
    const qteResult: QTEResult = {
      success: true,
      accuracy,
      completionTime: duration
    };

    setResult(qteResult);
    
    setTimeout(() => {
      onComplete(true, qteResult);
    }, 1000);
  }, [config.type, onComplete, isCompleted]);

  // 键盘事件处理
  useEffect(() => {
    if (!isActive || config.type !== 'ClickSequence') return;

    const handleKeyPress = (event: KeyboardEvent) => {
      const expectedKey = keySequence[currentKeyIndex];
      const pressedKey = event.key.toLowerCase();
      
      keyPressTimesRef.current.push(Date.now());
      
      if (pressedKey === expectedKey.toLowerCase()) {
        setCurrentKeyIndex(prev => {
          const newIndex = prev + 1;
          if (newIndex >= keySequence.length) {
            // 序列完成
            const avgTime = keyPressTimesRef.current.reduce((acc, time, index) => {
              if (index === 0) return 0;
              return acc + (time - keyPressTimesRef.current[index - 1]);
            }, 0) / (keyPressTimesRef.current.length - 1);
            
            const score = Math.max(0, 100 - (avgTime / 100));
            handleQTESuccess(score, 100);
          }
          return newIndex;
        });
      } else {
        // 按错了键，降低准确度
        setAccuracy(prev => Math.max(0, prev - 20));
        if (accuracy <= 20) {
          handleQTETimeout();
        }
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [isActive, config.type, keySequence, currentKeyIndex, accuracy, handleQTESuccess, handleQTETimeout]);

  // 快速点击处理
  const handleRapidClick = useCallback(() => {
    if (!isActive || config.type !== 'ButtonMash') return;
    
    setClickCount(prev => {
      const newCount = prev + 1;
      const targetClicks = config.parameters?.targetClicks || 10;
      if (newCount >= targetClicks) {
        const accuracy = Math.min(100, (newCount / targetClicks) * 100);
        handleQTESuccess(accuracy, accuracy);
      }
      return newCount;
    });
  }, [isActive, config.type, config.parameters?.targetClicks, handleQTESuccess]);

  // 定时点击处理
  const handleTimingClick = useCallback(() => {
    if (!isActive || config.type !== 'timing') return;
    
    const currentTime = ((config.timeLimit || 0) - (timeLeft || 0)) / (config.timeLimit || 1);
    const targetTime = 0.5; // 默认50%时间点
    const tolerance = (config.parameters?.precision || 10) / 100; // 默认10%容错
    
    const difference = Math.abs(currentTime - targetTime);
    
    if (difference <= tolerance) {
      const accuracy = Math.max(0, 100 - (difference / tolerance) * 100);
      handleQTESuccess(accuracy, accuracy);
    } else {
      handleQTETimeout();
    }
  }, [isActive, config.type, config.timeLimit, timeLeft, config.parameters?.precision, handleQTESuccess, handleQTETimeout]);

  // 渲染不同类型的QTE
  const renderQTEContent = () => {
    switch (config.type) {
      case 'ClickSequence':
        return (
          <div className="qte-key-sequence">
            <Title level={4}>按键序列</Title>
            <div className="key-display">
              {keySequence.map((key, index) => (
                <span 
                  key={index} 
                  className={`key ${index < currentKeyIndex ? 'completed' : index === currentKeyIndex ? 'current' : 'pending'}`}
                >
                  {key.toUpperCase()}
                </span>
              ))}
            </div>
            <Text>按照顺序按下对应的键</Text>
          </div>
        );
        
      case 'ButtonMash':
        return (
          <div className="qte-rapid-click">
            <Title level={4}>快速点击</Title>
            <div className="click-counter">
              <Text style={{ fontSize: '24px', fontWeight: 'bold' }}>
                {clickCount} / {config.parameters?.targetClicks || 10}
              </Text>
            </div>
            <Button 
              type="primary" 
              size="large"
              onClick={handleRapidClick}
              disabled={!isActive}
            >
              点击！
            </Button>
          </div>
        );
        
      case 'timing':
        const targetTime = 0.5 * 100; // 默认50%时间点
        const currentProgress = (((config.timeLimit || 0) - (timeLeft || 0)) / (config.timeLimit || 1)) * 100;
        
        return (
          <div className="qte-timing">
            <Title level={4}>精确时机</Title>
            <div className="timing-bar">
              <Progress 
                percent={currentProgress}
                showInfo={false}
                strokeColor={{
                  '0%': '#87d068',
                  '100%': '#ff4d4f',
                }}
              />
              <div 
                className="target-zone"
                style={{
                  left: `${targetTime - ((config.parameters?.precision || 10) / 100) * 100}%`,
                  width: `${((config.parameters?.precision || 10) / 100) * 200}%`
                }}
              />
            </div>
            <Button 
              type="primary" 
              size="large"
              onClick={handleTimingClick}
              disabled={!isActive}
            >
              现在点击！
            </Button>
          </div>
        );
        
      case 'PrecisionClick':
        return (
          <div className="qte-precision">
            <Title level={4}>精确操作</Title>
            <Text>等待实现...</Text>
          </div>
        );
        
      default:
        return (
          <Alert
            message="未知的QTE类型"
            description={`不支持的QTE类型: ${config.type}`}
            type="error"
          />
        );
    }
  };

  // 渲染结果
  const renderResult = () => {
    if (!result) return null;
    
    return (
      <div className="qte-result">
        <Title level={3} style={{ color: result.success ? '#52c41a' : '#ff4d4f' }}>
          {result.success ? '成功！' : '失败！'}
        </Title>
        <Space direction="vertical">
          <Text>准确度: {Math.round(result.accuracy)}%</Text>
          <Text>用时: {(result.completionTime / 1000).toFixed(2)}秒</Text>
        </Space>
      </div>
    );
  };

  const progressPercent = ((timeLeft || 0) / (config.timeLimit || 1)) * 100;

  return (
    <div className="qte-overlay">
      <Card 
        className="qte-container"
        title={
          <div className="qte-header">
            <span>{config.title || 'QTE事件'}</span>
            {onExit && (
              <Button 
                type="text" 
                icon={<CloseOutlined />} 
                onClick={onExit}
                disabled={isActive}
              />
            )}
          </div>
        }
      >
        {/* 时间进度条 */}
        <div className="qte-timer">
          <Progress 
            percent={progressPercent}
            status={progressPercent < 20 ? 'exception' : 'normal'}
            strokeColor={{
              '0%': '#ff4d4f',
              '50%': '#faad14',
              '100%': '#52c41a',
            }}
          />
          <Text style={{ marginTop: '8px', display: 'block', textAlign: 'center' }}>
            剩余时间: {(timeLeft || 0).toFixed(1)}秒
          </Text>
        </div>

        {/* QTE内容 */}
        <div className="qte-content">
          {result ? renderResult() : renderQTEContent()}
        </div>

        {/* 准确度显示 */}
        {config.type === 'ClickSequence' && isActive && (
          <div className="qte-accuracy">
            <Text>准确度: {accuracy}%</Text>
          </div>
        )}
      </Card>
    </div>
  );
}