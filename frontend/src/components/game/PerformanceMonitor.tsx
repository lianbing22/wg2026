import React, { useState, useEffect, useRef } from 'react';
import { Card, Progress, Typography, Space, Tag, Tooltip, Button } from 'antd';
import { 
  DashboardOutlined, 
  ThunderboltOutlined, 
  ClockCircleOutlined,
  WarningOutlined,
  CheckCircleOutlined
} from '@ant-design/icons';
import './PerformanceMonitor.css';

const { Text, Title } = Typography;

interface PerformanceMetrics {
  fps: number;
  memoryUsage: number;
  loadTime: number;
  responseTime: number;
  errorCount: number;
  userInteractions: number;
}

interface PerformanceMonitorProps {
  visible?: boolean;
  onToggle?: () => void;
  className?: string;
}

// 性能监控管理器
class PerformanceTracker {
  private metrics: PerformanceMetrics = {
    fps: 60,
    memoryUsage: 0,
    loadTime: 0,
    responseTime: 0,
    errorCount: 0,
    userInteractions: 0
  };
  
  private frameCount = 0;
  private lastTime = performance.now();
  private animationId: number | null = null;
  private observers: ((metrics: PerformanceMetrics) => void)[] = [];
  
  constructor() {
    this.startTracking();
    this.setupErrorTracking();
    this.setupInteractionTracking();
  }
  
  private startTracking() {
    const trackFrame = (currentTime: number) => {
      this.frameCount++;
      
      if (currentTime - this.lastTime >= 1000) {
        this.metrics.fps = Math.round((this.frameCount * 1000) / (currentTime - this.lastTime));
        this.frameCount = 0;
        this.lastTime = currentTime;
        
        // 更新内存使用情况（降低频率以提高性能）
        if ('memory' in performance && this.frameCount % 5 === 0) {
          const memory = (performance as any).memory;
          this.metrics.memoryUsage = Math.round((memory.usedJSHeapSize / memory.jsHeapSizeLimit) * 100);
        }
        
        this.notifyObservers();
      }
      
      this.animationId = requestAnimationFrame(trackFrame);
    };
    
    this.animationId = requestAnimationFrame(trackFrame);
  }
  
  private setupErrorTracking() {
    window.addEventListener('error', () => {
      this.metrics.errorCount++;
      this.notifyObservers();
    });
    
    window.addEventListener('unhandledrejection', () => {
      this.metrics.errorCount++;
      this.notifyObservers();
    });
  }
  
  private setupInteractionTracking() {
    const interactionEvents = ['click', 'keydown', 'touchstart'];
    let lastInteractionTime = 0;
    
    interactionEvents.forEach(event => {
      document.addEventListener(event, () => {
        const now = performance.now();
        // 限制交互事件通知频率，避免过度更新
        if (now - lastInteractionTime > 100) {
          this.metrics.userInteractions++;
          this.notifyObservers();
          lastInteractionTime = now;
        } else {
          this.metrics.userInteractions++;
        }
      });
    });
  }
  
  public measureResponseTime(startTime: number) {
    const responseTime = performance.now() - startTime;
    this.metrics.responseTime = Math.round(responseTime);
    this.notifyObservers();
  }
  
  public measureLoadTime(loadTime: number) {
    this.metrics.loadTime = Math.round(loadTime);
    this.notifyObservers();
  }
  
  public subscribe(callback: (metrics: PerformanceMetrics) => void) {
    this.observers.push(callback);
    return () => {
      const index = this.observers.indexOf(callback);
      if (index > -1) {
        this.observers.splice(index, 1);
      }
    };
  }
  
  private notifyObservers() {
    this.observers.forEach(callback => callback({ ...this.metrics }));
  }
  
  public getMetrics(): PerformanceMetrics {
    return { ...this.metrics };
  }
  
  public destroy() {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
    }
    this.observers = [];
  }
}

// 全局性能追踪器实例
const performanceTracker = new PerformanceTracker();

export default function PerformanceMonitor({ 
  visible = false, 
  onToggle, 
  className = '' 
}: PerformanceMonitorProps) {
  const [metrics, setMetrics] = useState<PerformanceMetrics>(performanceTracker.getMetrics());
  const [isExpanded, setIsExpanded] = useState(false);
  
  useEffect(() => {
    const unsubscribe = performanceTracker.subscribe(setMetrics);
    return unsubscribe;
  }, []);
  
  const getPerformanceStatus = () => {
    const { fps, memoryUsage, responseTime, errorCount } = metrics;
    
    if (fps < 30 || memoryUsage > 80 || responseTime > 1000 || errorCount > 5) {
      return { status: 'error', text: '性能较差', color: '#ff4d4f' };
    }
    
    if (fps < 45 || memoryUsage > 60 || responseTime > 500 || errorCount > 2) {
      return { status: 'warning', text: '性能一般', color: '#faad14' };
    }
    
    return { status: 'success', text: '性能良好', color: '#52c41a' };
  };
  
  const performanceStatus = getPerformanceStatus();
  
  if (!visible) {
    return (
      <div className={`performance-monitor-toggle ${className}`}>
        <Button
          type="text"
          size="small"
          icon={<DashboardOutlined />}
          onClick={onToggle}
          className="performance-toggle-btn"
        >
          性能
        </Button>
      </div>
    );
  }
  
  return (
    <Card 
      className={`performance-monitor ${className}`}
      size="small"
      title={
        <Space>
          <DashboardOutlined />
          <span>性能监控</span>
          <Tag color={performanceStatus.color} icon={
            performanceStatus.status === 'success' ? <CheckCircleOutlined /> : 
            performanceStatus.status === 'warning' ? <WarningOutlined /> : 
            <WarningOutlined />
          }>
            {performanceStatus.text}
          </Tag>
        </Space>
      }
      extra={
        <Space>
          <Button 
            type="text" 
            size="small" 
            onClick={() => setIsExpanded(!isExpanded)}
          >
            {isExpanded ? '收起' : '展开'}
          </Button>
          <Button 
            type="text" 
            size="small" 
            onClick={onToggle}
          >
            ×
          </Button>
        </Space>
      }
    >
      <Space direction="vertical" style={{ width: '100%' }} size="small">
        {/* 核心指标 */}
        <div className="performance-metrics-grid">
          <div className="metric-item">
            <Tooltip title="每秒帧数，影响动画流畅度">
              <div className="metric-header">
                <ThunderboltOutlined className="metric-icon" />
                <Text type="secondary">FPS</Text>
              </div>
              <div className="metric-value">
                <Text strong style={{ color: metrics.fps >= 45 ? '#52c41a' : metrics.fps >= 30 ? '#faad14' : '#ff4d4f' }}>
                  {metrics.fps}
                </Text>
              </div>
            </Tooltip>
          </div>
          
          <div className="metric-item">
            <Tooltip title="内存使用百分比">
              <div className="metric-header">
                <DashboardOutlined className="metric-icon" />
                <Text type="secondary">内存</Text>
              </div>
              <div className="metric-value">
                <Text strong style={{ color: metrics.memoryUsage <= 60 ? '#52c41a' : metrics.memoryUsage <= 80 ? '#faad14' : '#ff4d4f' }}>
                  {metrics.memoryUsage}%
                </Text>
              </div>
            </Tooltip>
          </div>
          
          <div className="metric-item">
            <Tooltip title="最近操作响应时间">
              <div className="metric-header">
                <ClockCircleOutlined className="metric-icon" />
                <Text type="secondary">响应</Text>
              </div>
              <div className="metric-value">
                <Text strong style={{ color: metrics.responseTime <= 200 ? '#52c41a' : metrics.responseTime <= 500 ? '#faad14' : '#ff4d4f' }}>
                  {metrics.responseTime}ms
                </Text>
              </div>
            </Tooltip>
          </div>
        </div>
        
        {isExpanded && (
          <>
            {/* 详细指标 */}
            <div className="performance-details">
              <div className="detail-row">
                <Text type="secondary">加载时间:</Text>
                <Text>{metrics.loadTime}ms</Text>
              </div>
              <div className="detail-row">
                <Text type="secondary">错误计数:</Text>
                <Text style={{ color: metrics.errorCount > 0 ? '#ff4d4f' : '#52c41a' }}>
                  {metrics.errorCount}
                </Text>
              </div>
              <div className="detail-row">
                <Text type="secondary">用户交互:</Text>
                <Text>{metrics.userInteractions}</Text>
              </div>
            </div>
            
            {/* 性能建议 */}
            {performanceStatus.status !== 'success' && (
              <div className="performance-suggestions">
                <Text type="secondary" style={{ fontSize: '12px' }}>
                  性能建议:
                </Text>
                <ul className="suggestions-list">
                  {metrics.fps < 30 && <li>帧率过低，建议关闭部分动画效果</li>}
                  {metrics.memoryUsage > 80 && <li>内存使用过高，建议刷新页面</li>}
                  {metrics.responseTime > 1000 && <li>响应时间过长，检查网络连接</li>}
                  {metrics.errorCount > 5 && <li>错误较多，建议检查控制台日志</li>}
                </ul>
              </div>
            )}
          </>
        )}
      </Space>
    </Card>
  );
}

// 导出性能追踪器供其他组件使用
export { performanceTracker };