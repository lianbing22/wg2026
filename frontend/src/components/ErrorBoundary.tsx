/**
 * 错误边界组件
 * 用于捕获和处理React组件树中的JavaScript错误
 */

import { Component, ErrorInfo, ReactNode } from 'react';
import { Button, Result } from 'antd';
import { ReloadOutlined, HomeOutlined } from '@ant-design/icons';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    // 更新 state 使下一次渲染能够显示降级后的 UI
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // 记录错误信息
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    
    this.setState({
      error,
      errorInfo
    });

    // 可以在这里上报错误到错误监控服务
    // reportError(error, errorInfo);
  }

  handleReload = () => {
    window.location.reload();
  };

  handleGoHome = () => {
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      // 如果有自定义的fallback UI，使用它
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // 默认的错误UI
      return (
        <div style={{ 
          padding: '50px', 
          minHeight: '100vh', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          background: '#f5f5f5'
        }}>
          <Result
            status="error"
            title="页面出现错误"
            subTitle="抱歉，页面加载时发生了意外错误。您可以尝试刷新页面或返回首页。"
            extra={[
              <Button 
                type="primary" 
                icon={<ReloadOutlined />} 
                onClick={this.handleReload}
                key="reload"
              >
                刷新页面
              </Button>,
              <Button 
                icon={<HomeOutlined />} 
                onClick={this.handleGoHome}
                key="home"
              >
                返回首页
              </Button>,
            ]}
          >
            {import.meta.env.DEV && this.state.error && (
              <div style={{ 
                marginTop: '20px', 
                padding: '16px', 
                background: '#fff2f0', 
                border: '1px solid #ffccc7',
                borderRadius: '6px',
                textAlign: 'left'
              }}>
                <h4>错误详情（开发模式）：</h4>
                <pre style={{ 
                  fontSize: '12px', 
                  color: '#cf1322',
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-word'
                }}>
                  {this.state.error.toString()}
                  {this.state.errorInfo?.componentStack}
                </pre>
              </div>
            )}
          </Result>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;