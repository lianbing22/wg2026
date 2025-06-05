/**
 * 物业管理模拟器 - QTE（快速时间事件）容器组件
 * 负责渲染和管理各种类型的QTE事件
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { Card, Button, Progress, Typography, Space, Alert, message } from 'antd';
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
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState("");
  
  const timerRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(0);
  const keyPressTimesRef = useRef<number[]>([]);

  // 记录QTE事件
  const logQTEEvent = useCallback((eventType: string, details: any) => {
    console.log(`QTE Event [${config.type}]: ${eventType}`, details);
  }, [config.type]);

  // 初始化QTE
  useEffect(() => {
    logQTEEvent('初始化', { config });
    startQTE();
    
    // 添加键盘监听器
    if (config.type === 'ClickSequence') {
      window.addEventListener('keydown', handleKeyPress);
    }
    
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      
      // 移除键盘监听器
      if (config.type === 'ClickSequence') {
        window.removeEventListener('keydown', handleKeyPress);
      }
    };
  }, []);

  // 开始QTE
  const startQTE = useCallback(() => {
    setIsActive(true);
    startTimeRef.current = Date.now();
    logQTEEvent('开始', { timeLimit: config.timeLimit });
    
    // 根据QTE类型初始化
    switch (config.type) {
      case 'ClickSequence':
        if (config.parameters?.sequence) {
          setKeySequence(config.parameters.sequence.map(item => item.id || ''));
          logQTEEvent('序列初始化', { sequence: config.parameters.sequence });
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
      default:
        logQTEEvent('未知QTE类型', { type: config.type });
    }

    // 显示初始反馈
    setFeedbackMessage(`开始${config.title || "快速事件"}！`);
    setShowFeedback(true);
    setTimeout(() => setShowFeedback(false), 1500);

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
    logQTEEvent('超时', { accuracy });
    
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    const endTime = Date.now();
    const duration = endTime - startTimeRef.current;
    
    const qteResult: QTEResult = {
      success: false,
      accuracy: Math.max(0, accuracy - 20),
      completionTime: duration,
      extraData: {
        score: 0,
        perfect: false
      }
    };

    setResult(qteResult);
    
    // 显示失败反馈
    setFeedbackMessage("时间耗尽！");
    setShowFeedback(true);
    message.error("QTE失败：时间耗尽！");
    
    setTimeout(() => {
      onComplete(false, qteResult);
    }, 1500);
  }, [accuracy, onComplete, isCompleted]);

  // 统一QTE成功处理逻辑
  const handleQTESuccess = useCallback((score: number, accuracyParam: number) => {
    if (isCompleted) return;

    setIsActive(false);
    setIsCompleted(true);
    logQTEEvent('成功', { score, accuracy: accuracyParam });

    if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    const endTime = Date.now();
    const duration = endTime - startTimeRef.current;

    // 计算得分
    const timeLimit = config.timeLimit || 10; // 默认10秒
    const timeBonus = Math.max(0, (timeLimit * 1000 - duration) / 100);
    const accuracyBonus = accuracyParam * 2;
    const finalScore = Math.round(score + timeBonus + accuracyBonus);
    const perfect = accuracyParam >= 95 && duration < timeLimit * 500;

    const qteResult: QTEResult = {
      success: true,
      accuracy: accuracyParam,
      completionTime: duration,
      extraData: {
        score: finalScore,
        perfect
      }
    };

    setResult(qteResult);
    
    // 显示成功反馈
    const feedbackText = perfect ? 
      "完美！" : 
      (accuracyParam >= 80 ? "太棒了！" : "成功！");
    
    setFeedbackMessage(`${feedbackText} 得分：${finalScore}`);
    setShowFeedback(true);
    message.success(`QTE成功：${feedbackText} 得分：${finalScore}`);

    setTimeout(() => {
      onComplete(true, qteResult);
    }, 1500);
  }, [config.timeLimit, onComplete, isCompleted]);

  // 处理键盘输入
  const handleKeyPress = useCallback((event: KeyboardEvent) => {
    if (!isActive || isCompleted) return;

    const key = event.key.toUpperCase();
    const expectedKey = keySequence[currentKeyIndex]?.toUpperCase();
    
    if (!expectedKey) {
      logQTEEvent('键序列错误', { expected: 'none', actual: key });
      return;
    }

    logQTEEvent('键盘输入', { expected: expectedKey, actual: key });

    if (key === expectedKey) {
      // 正确按键
      const currentTime = Date.now() - startTimeRef.current;
      keyPressTimesRef.current.push(currentTime);
      
      // 显示反馈 - 优化延迟
      setFeedbackMessage("√");
      setShowFeedback(true);
      setTimeout(() => setShowFeedback(false), 100);
      
      setCurrentKeyIndex(prev => prev + 1);
      
      // 根据反应时间调整准确度
      const reactionTime = currentTime - (keyPressTimesRef.current[keyPressTimesRef.current.length - 2] || 0);
      if (reactionTime < 500) {
        setAccuracy(prev => Math.min(100, prev + 2)); // 快速反应奖励
      }
      
      // 检查是否完成序列
      if (currentKeyIndex + 1 >= keySequence.length) {
        handleQTESuccess(100, accuracy);
      }
    } else {
      // 错误按键
      setAccuracy(prev => Math.max(0, prev - 10)); // 错误惩罚
      
      // 显示错误反馈 - 优化延迟
      setFeedbackMessage("✗");
      setShowFeedback(true);
      setTimeout(() => setShowFeedback(false), 100);
      
      // 如果准确度过低，直接失败
      if (accuracy < 30) {
        handleQTEFailure();
      }
    }
  }, [isActive, isCompleted, keySequence, currentKeyIndex, accuracy, handleQTESuccess]);

  // QTE失败处理
  const handleQTEFailure = useCallback(() => {
    if (isCompleted) return;
    
    setIsActive(false);
    setIsCompleted(true);
    logQTEEvent('失败', { accuracy });
    
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    
    const endTime = Date.now();
    const duration = endTime - startTimeRef.current;
    
    const qteResult: QTEResult = {
      success: false,
      accuracy: Math.max(0, accuracy),
      completionTime: duration,
      extraData: {
        score: Math.round(accuracy / 4), // 即使失败也给一点安慰分
        perfect: false
      }
    };
    
    setResult(qteResult);
    
    // 显示失败反馈
    setFeedbackMessage("失败！");
    setShowFeedback(true);
    message.error("QTE失败！");
    
    setTimeout(() => {
      onComplete(false, qteResult);
    }, 1500);
  }, [accuracy, onComplete, isCompleted]);

  // 处理按钮点击 (ButtonMash类型)
  const handleButtonClick = useCallback(() => {
    if (!isActive || isCompleted || config.type !== 'ButtonMash') return;
    
    const newClickCount = clickCount + 1;
    setClickCount(newClickCount);
    logQTEEvent('按钮点击', { clickCount: newClickCount });
    
    // 显示点击反馈 - 优化延迟
    setFeedbackMessage(`${newClickCount}`);
    setShowFeedback(true);
    setTimeout(() => setShowFeedback(false), 80);
    
    // 计算目标点击次数
    const targetClicks = config.parameters?.targetClicks || 20;
    
    // 如果达到目标，成功
    if (newClickCount >= targetClicks) {
      // 计算得分基于速度和点击量
      const timeElapsed = Date.now() - startTimeRef.current;
      const avgClickSpeed = newClickCount / (timeElapsed / 1000);
      const clickScore = Math.min(100, (newClickCount / targetClicks) * 100);
      const speedBonus = Math.min(50, avgClickSpeed * 5);
      
      handleQTESuccess(clickScore, Math.min(100, clickScore + speedBonus));
    }
  }, [isActive, isCompleted, config.type, config.parameters, clickCount, handleQTESuccess]);

  // 渲染QTE内容
  const renderQTEContent = () => {
    if (result) {
      return renderResult();
    }

    // 添加反馈信息显示
    const feedbackElement = showFeedback ? (
      <div className="qte-feedback" style={{ 
        position: 'absolute', 
        top: '50%', 
        left: '50%', 
        transform: 'translate(-50%, -50%)',
        fontSize: '2rem',
        fontWeight: 'bold',
        color: feedbackMessage === "✗" ? 'red' : feedbackMessage === "√" ? 'green' : 'white',
        textShadow: '0 0 10px rgba(0,0,0,0.7)',
        zIndex: 10
      }}>
        {feedbackMessage}
      </div>
    ) : null;

    switch (config.type) {
      case 'ClickSequence':
        return (
          <div className="qte-sequence-container">
            {feedbackElement}
            <Title level={4}>按下显示的按键序列</Title>
            <div className="key-sequence">
              {keySequence.map((key, index) => (
                <Button
                  key={index}
                  type={index < currentKeyIndex ? "primary" : index === currentKeyIndex ? "default" : "dashed"}
                  className={`sequence-key ${index < currentKeyIndex ? 'completed' : index === currentKeyIndex ? 'current' : ''}`}
                >
                  {key}
                </Button>
              ))}
            </div>
            <div className="qte-progress">
              <Progress 
                percent={(currentKeyIndex / keySequence.length) * 100} 
                status="active" 
                showInfo={false}
              />
            </div>
          </div>
        );
        
      case 'ButtonMash':
        return (
          <div className="qte-mash-container">
            {feedbackElement}
            <Title level={4}>{config.title || "快速点击！"}</Title>
            <Button 
              type="primary" 
              size="large"
              className="mash-button"
              onClick={handleButtonClick}
            >
              点击这里！
            </Button>
            <div className="qte-progress">
              <Progress 
                percent={(clickCount / (config.parameters?.targetClicks || 20)) * 100} 
                status="active" 
              />
              <Text>{clickCount} / {config.parameters?.targetClicks || 20}</Text>
            </div>
          </div>
        );
        
      case 'timing':
        return (
          <div className="qte-timing-container">
            {feedbackElement}
            <Title level={4}>{config.title || "把握时机！"}</Title>
            {/* 实现定时QTE UI */}
          </div>
        );
        
      case 'PrecisionClick':
        return (
          <div className="qte-precision-container">
            {feedbackElement}
            <Title level={4}>{config.title || "精确点击！"}</Title>
            {/* 实现精确点击QTE UI */}
          </div>
        );
        
      default:
        return (
          <div className="qte-unknown-container">
            {feedbackElement}
            <Alert
              message="未知QTE类型"
              description={`QTE类型 "${config.type}" 不受支持`}
              type="error"
            />
          </div>
        );
    }
  };

  // 渲染结果
  const renderResult = () => {
    if (!result) return null;
    
    const { success, accuracy, extraData } = result;
    
    return (
      <div className="qte-result">
        <Title level={3} className={success ? 'success-title' : 'failure-title'}>
          {success ? (extraData?.perfect ? '完美！' : '成功！') : '失败！'}
        </Title>
        
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          <div>
            <Text>准确度: </Text>
            <Progress 
              percent={accuracy} 
              status={success ? 'success' : 'exception'} 
            />
          </div>
          
          {extraData?.score !== undefined && (
            <div>
              <Text>得分: </Text>
              <Title level={4}>{extraData.score}</Title>
            </div>
          )}
          
          {!success && (
            <Alert
              message="下次再试！"
              description="继续努力，你能做到的！"
              type="info"
            />
          )}
        </Space>
      </div>
    );
  };

  return (
    <div className="qte-container-overlay">
      <Card 
        title={
          <div className="qte-header">
            <span>{config.title || "快速时间事件"}</span>
            {onExit && (
              <Button 
                icon={<CloseOutlined />} 
                type="text"
                onClick={onExit}
                className="qte-exit-button"
              />
            )}
          </div>
        }
        className="qte-card"
      >
        <div className="qte-timer">
          <Progress 
            percent={((timeLeft || 0) / (config.timeLimit || 10)) * 100} 
            status={(timeLeft || 0) < (config.timeLimit || 10) * 0.3 ? 'exception' : 'active'}
            showInfo={false}
            strokeColor={
              (timeLeft || 0) < (config.timeLimit || 10) * 0.3 
                ? '#ff4d4f' 
                : (timeLeft || 0) < (config.timeLimit || 10) * 0.6 
                  ? '#faad14' 
                  : '#52c41a'
            }
          />
          <Text>{Math.ceil(timeLeft || 0)}秒</Text>
        </div>
        
        {renderQTEContent()}
      </Card>
    </div>
  );
}