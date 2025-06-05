import { UX_CONFIG } from '../config/ux-optimization';

// 用户体验优化工具类
export class UXOptimizer {
  private static instance: UXOptimizer;
  private userPreferences: any = {};
  private performanceMetrics: any = {};
  private isReducedMotion: boolean = false;
  private isHighContrast: boolean = false;
  
  private constructor() {
    this.initializePreferences();
    this.detectSystemPreferences();
    this.setupPerformanceMonitoring();
  }
  
  public static getInstance(): UXOptimizer {
    if (!UXOptimizer.instance) {
      UXOptimizer.instance = new UXOptimizer();
    }
    return UXOptimizer.instance;
  }
  
  // 初始化用户偏好
  private initializePreferences() {
    const saved = localStorage.getItem('ux_preferences');
    this.userPreferences = saved ? 
      JSON.parse(saved) : 
      UX_CONFIG.user_preferences.defaults;
  }
  
  // 检测系统偏好
  private detectSystemPreferences() {
    // 检测减少动画偏好
    this.isReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    
    // 检测高对比度偏好
    this.isHighContrast = window.matchMedia('(prefers-contrast: high)').matches;
    
    // 监听偏好变化
    window.matchMedia('(prefers-reduced-motion: reduce)').addEventListener('change', (e) => {
      this.isReducedMotion = e.matches;
      this.applyMotionPreferences();
    });
    
    window.matchMedia('(prefers-contrast: high)').addEventListener('change', (e) => {
      this.isHighContrast = e.matches;
      this.applyContrastPreferences();
    });
  }
  
  // 设置性能监控
  private setupPerformanceMonitoring() {
    // 监控FPS
    let frameCount = 0;
    let lastTime = performance.now();
    
    const measureFPS = (currentTime: number) => {
      frameCount++;
      
      if (currentTime - lastTime >= 1000) {
        const fps = Math.round((frameCount * 1000) / (currentTime - lastTime));
        this.performanceMetrics.fps = fps;
        
        // 自动性能调整
        if (fps < UX_CONFIG.performance.thresholds.fps.poor) {
          this.enablePerformanceMode();
        }
        
        frameCount = 0;
        lastTime = currentTime;
      }
      
      requestAnimationFrame(measureFPS);
    };
    
    requestAnimationFrame(measureFPS);
  }
  
  // 应用动画偏好
  private applyMotionPreferences() {
    const root = document.documentElement;
    
    if (this.isReducedMotion || !this.userPreferences.animations) {
      root.style.setProperty('--motion-duration-fast', '0ms');
      root.style.setProperty('--motion-duration-mid', '0ms');
      root.style.setProperty('--motion-duration-slow', '0ms');
    } else {
      const speed = this.userPreferences.animation_speed || 'normal';
      const multiplier = {
        slow: 1.5,
        normal: 1,
        fast: 0.7
      }[speed] || 1;
      
      root.style.setProperty('--motion-duration-fast', `${UX_CONFIG.animation.durations.fast * multiplier}ms`);
      root.style.setProperty('--motion-duration-mid', `${UX_CONFIG.animation.durations.normal * multiplier}ms`);
      root.style.setProperty('--motion-duration-slow', `${UX_CONFIG.animation.durations.slow * multiplier}ms`);
    }
  }
  
  // 应用对比度偏好
  private applyContrastPreferences() {
    const root = document.documentElement;
    
    if (this.isHighContrast) {
      root.classList.add('high-contrast');
    } else {
      root.classList.remove('high-contrast');
    }
  }
  
  // 启用性能模式
  private enablePerformanceMode() {
    console.log('启用性能优化模式');
    
    const root = document.documentElement;
    root.classList.add('performance-mode');
    
    // 禁用动画
    root.style.setProperty('--motion-duration-fast', '0ms');
    root.style.setProperty('--motion-duration-mid', '0ms');
    root.style.setProperty('--motion-duration-slow', '0ms');
    
    // 减少视觉效果
    root.style.setProperty('--shadow-sm', 'none');
    root.style.setProperty('--shadow-md', 'none');
    root.style.setProperty('--shadow-lg', 'none');
  }
  
  // 禁用性能模式
  private disablePerformanceMode() {
    console.log('禁用性能优化模式');
    
    const root = document.documentElement;
    root.classList.remove('performance-mode');
    
    // 恢复动画
    this.applyMotionPreferences();
    
    // 恢复视觉效果
    root.style.removeProperty('--shadow-sm');
    root.style.removeProperty('--shadow-md');
    root.style.removeProperty('--shadow-lg');
  }
  
  // 获取用户偏好
  public getPreference(key: string): any {
    return this.userPreferences[key];
  }
  
  // 设置用户偏好
  public setPreference(key: string, value: any): void {
    this.userPreferences[key] = value;
    localStorage.setItem('ux_preferences', JSON.stringify(this.userPreferences));
    
    // 应用相关设置
    switch (key) {
      case 'animations':
      case 'animation_speed':
        this.applyMotionPreferences();
        break;
      case 'theme':
        this.applyTheme(value);
        break;
      case 'sound':
        this.applySoundSettings(value);
        break;
    }
  }
  
  // 应用主题
  private applyTheme(theme: string) {
    const root = document.documentElement;
    
    if (theme === 'auto') {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      theme = prefersDark ? 'dark' : 'light';
    }
    
    root.setAttribute('data-theme', theme);
  }
  
  // 应用声音设置
  private applySoundSettings(enabled: boolean) {
    // 这里可以与音效管理器集成
    console.log(`声音${enabled ? '已启用' : '已禁用'}`);
  }
  
  // 优化触摸体验
  public optimizeTouchExperience(): void {
    // 添加触摸友好的样式
    const style = document.createElement('style');
    style.textContent = `
      .touch-optimized {
        min-height: ${UX_CONFIG.responsive.mobile.touch_target_size}px;
        min-width: ${UX_CONFIG.responsive.mobile.touch_target_size}px;
        touch-action: manipulation;
      }
      
      .touch-optimized:active {
        transform: scale(0.95);
        transition: transform 150ms ease-out;
      }
    `;
    document.head.appendChild(style);
    
    // 为所有按钮添加触摸优化类
    const buttons = document.querySelectorAll('button, .ant-btn');
    buttons.forEach(button => {
      button.classList.add('touch-optimized');
    });
  }
  
  // 优化键盘导航
  public optimizeKeyboardNavigation(): void {
    // 添加键盘导航样式
    const style = document.createElement('style');
    style.textContent = `
      .keyboard-navigation *:focus {
        outline: 2px solid var(--color-primary);
        outline-offset: 2px;
      }
      
      .keyboard-navigation .skip-link {
        position: absolute;
        top: -40px;
        left: 6px;
        background: var(--color-primary);
        color: white;
        padding: 8px;
        text-decoration: none;
        border-radius: 4px;
        z-index: 1000;
      }
      
      .keyboard-navigation .skip-link:focus {
        top: 6px;
      }
    `;
    document.head.appendChild(style);
    
    // 检测键盘使用
    let isUsingKeyboard = false;
    
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Tab') {
        isUsingKeyboard = true;
        document.body.classList.add('keyboard-navigation');
      }
    });
    
    document.addEventListener('mousedown', () => {
      isUsingKeyboard = false;
      document.body.classList.remove('keyboard-navigation');
    });
  }
  
  // 优化加载体验
  public optimizeLoadingExperience(): void {
    // 添加骨架屏样式
    const style = document.createElement('style');
    style.textContent = `
      .skeleton {
        background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
        background-size: 200% 100%;
        animation: skeleton-loading 1.5s infinite;
        border-radius: 4px;
      }
      
      @keyframes skeleton-loading {
        0% {
          background-position: 200% 0;
        }
        100% {
          background-position: -200% 0;
        }
      }
      
      [data-theme='dark'] .skeleton {
        background: linear-gradient(90deg, #2a2a2a 25%, #3a3a3a 50%, #2a2a2a 75%);
        background-size: 200% 100%;
      }
      
      .loading-container {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        min-height: 200px;
        gap: 16px;
      }
      
      .loading-text {
        color: var(--text-secondary);
        font-size: 14px;
        animation: pulse 2s infinite;
      }
      
      @keyframes pulse {
        0%, 100% { opacity: 0.6; }
        50% { opacity: 1; }
      }
      
      .loading-progress {
        width: 200px;
        height: 4px;
        background: var(--border-color);
        border-radius: 2px;
        overflow: hidden;
      }
      
      .loading-progress-bar {
        height: 100%;
        background: var(--primary-color);
        border-radius: 2px;
        animation: loading-progress 2s infinite;
      }
      
      @keyframes loading-progress {
        0% { width: 0%; transform: translateX(-100%); }
        50% { width: 100%; transform: translateX(0%); }
        100% { width: 100%; transform: translateX(100%); }
      }
    `;
    document.head.appendChild(style);
    
    // 添加智能加载提示
    this.setupSmartLoadingIndicators();
  }
  
  private setupSmartLoadingIndicators(): void {
    // 监听页面加载状态
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => {
        this.hideGlobalLoading();
      });
    }
    
    // 监听图片加载
    document.addEventListener('load', (e) => {
      if (e.target instanceof HTMLImageElement) {
        this.handleImageLoad(e.target);
      }
    }, true);
    
    // 监听网络请求
    this.interceptNetworkRequests();
  }
  
  private hideGlobalLoading(): void {
    const loadingElements = document.querySelectorAll('.global-loading');
    loadingElements.forEach(el => {
      el.classList.add('fade-out');
      setTimeout(() => el.remove(), 300);
    });
  }
  
  private handleImageLoad(img: HTMLImageElement): void {
    const placeholder = img.previousElementSibling;
    if (placeholder && placeholder.classList.contains('image-placeholder')) {
      placeholder.classList.add('fade-out');
      img.classList.add('fade-in');
    }
  }
  
  private interceptNetworkRequests(): void {
    const originalFetch = window.fetch;
    window.fetch = async (...args) => {
      const startTime = performance.now();
      try {
        const response = await originalFetch(...args);
        const endTime = performance.now();
        this.trackRequestPerformance(args[0], endTime - startTime);
        return response;
      } catch (error) {
        this.handleNetworkError(error, args[0]);
        throw error;
      }
    };
  }
  
  private trackRequestPerformance(url: any, duration: number): void {
    if (duration > 3000) {
      console.warn(`Slow request detected: ${url} took ${duration}ms`);
      this.showSlowRequestNotification();
    }
  }
  
  private handleNetworkError(error: any, url: any): void {
    console.error(`Network request failed: ${url}`, error);
    this.showNetworkErrorNotification();
  }
  
  private showSlowRequestNotification(): void {
    this.showToast('网络请求较慢，请稍候...', 'warning', 3000);
  }
  
  private showNetworkErrorNotification(): void {
    this.showToast('网络请求失败，请检查网络连接', 'error', 5000);
  }
  
  // 错误处理优化
  public handleError(error: Error, context: string): void {
    console.error(`错误发生在 ${context}:`, error);
    
    // 根据错误类型提供不同的处理
    if (error.name === 'NetworkError') {
      this.showNetworkErrorFeedback();
    } else if (error.name === 'ValidationError') {
      this.showValidationErrorFeedback(error.message);
    } else {
      this.showGenericErrorFeedback();
    }
  }
  
  private showNetworkErrorFeedback(): void {
    // 显示网络错误提示
    this.showToast('网络连接异常，请检查网络设置后重试', 'error', 5000);
    
    // 添加重试按钮
    const retryButton = document.createElement('button');
    retryButton.textContent = '重试';
    retryButton.className = 'ux-retry-button';
    retryButton.onclick = () => {
      window.location.reload();
    };
    
    // 如果页面有错误容器，添加重试按钮
    const errorContainer = document.querySelector('.error-container');
    if (errorContainer && !errorContainer.querySelector('.ux-retry-button')) {
      errorContainer.appendChild(retryButton);
    }
  }
  
  private showValidationErrorFeedback(message: string): void {
    // 显示验证错误提示
    this.showToast(`输入验证失败: ${message}`, 'warning', 4000);
    
    // 高亮相关输入字段
    const inputs = document.querySelectorAll('input, select, textarea');
    inputs.forEach(input => {
      if (input.classList.contains('ant-input-status-error')) {
        this.highlightElement(input as HTMLElement, 'error');
      }
    });
  }
  
  private showGenericErrorFeedback(): void {
    // 显示通用错误提示
    this.showToast('操作失败，请稍后重试', 'error', 3000);
    
    // 添加错误报告功能
    const reportButton = document.createElement('button');
    reportButton.textContent = '报告问题';
    reportButton.className = 'ux-report-button';
    reportButton.onclick = () => {
      // 这里可以集成错误报告系统
      console.log('用户选择报告问题');
      this.showToast('感谢您的反馈，我们会尽快处理', 'info', 2000);
    };
  }
  
  private showToast(message: string, type: 'success' | 'error' | 'warning' | 'info', duration: number = 3000): void {
    // 创建toast元素
    const toast = document.createElement('div');
    toast.className = `ux-toast ux-toast-${type}`;
    toast.textContent = message;
    
    // 添加样式
    Object.assign(toast.style, {
      position: 'fixed',
      top: '20px',
      right: '20px',
      padding: '12px 16px',
      borderRadius: '6px',
      color: 'white',
      fontSize: '14px',
      fontWeight: '500',
      zIndex: '9999',
      maxWidth: '300px',
      wordWrap: 'break-word',
      boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
      transform: 'translateX(100%)',
      transition: 'transform 0.3s ease-in-out',
      backgroundColor: type === 'error' ? '#ff4d4f' : 
                      type === 'warning' ? '#faad14' :
                      type === 'success' ? '#52c41a' : '#1890ff'
    });
    
    document.body.appendChild(toast);
    
    // 动画显示
    setTimeout(() => {
      toast.style.transform = 'translateX(0)';
    }, 100);
    
    // 自动隐藏
    setTimeout(() => {
      toast.style.transform = 'translateX(100%)';
      setTimeout(() => {
        if (toast.parentNode) {
          toast.parentNode.removeChild(toast);
        }
      }, 300);
    }, duration);
  }
  
  private highlightElement(element: HTMLElement, type: 'error' | 'warning' | 'success'): void {
    const originalBorder = element.style.border;
    const color = type === 'error' ? '#ff4d4f' : 
                 type === 'warning' ? '#faad14' : '#52c41a';
    
    element.style.border = `2px solid ${color}`;
    element.style.boxShadow = `0 0 0 2px ${color}20`;
    
    // 2秒后恢复原样
    setTimeout(() => {
      element.style.border = originalBorder;
      element.style.boxShadow = '';
    }, 2000);
  }
  
  // 响应式优化
  public optimizeResponsiveExperience(): void {
    const updateViewport = () => {
      const vw = Math.max(document.documentElement.clientWidth || 0, window.innerWidth || 0);
      const vh = Math.max(document.documentElement.clientHeight || 0, window.innerHeight || 0);
      
      document.documentElement.style.setProperty('--vw', `${vw}px`);
      document.documentElement.style.setProperty('--vh', `${vh}px`);
      
      // 根据屏幕尺寸调整
      if (vw < UX_CONFIG.responsive.breakpoints.md) {
        document.body.classList.add('mobile-layout');
        this.optimizeTouchExperience();
      } else {
        document.body.classList.remove('mobile-layout');
      }
    };
    
    updateViewport();
    window.addEventListener('resize', updateViewport);
    window.addEventListener('orientationchange', updateViewport);
  }
  
  // 初始化所有优化
  public initializeOptimizations(): void {
    this.applyMotionPreferences();
    this.applyContrastPreferences();
    this.optimizeKeyboardNavigation();
    this.optimizeLoadingExperience();
    this.optimizeResponsiveExperience();
    
    // 应用主题
    this.applyTheme(this.userPreferences.theme);
    
    console.log('用户体验优化已初始化');
  }
  
  // 获取性能指标
  public getPerformanceMetrics(): any {
    return { ...this.performanceMetrics };
  }
  
  // 重置所有设置
  public resetToDefaults(): void {
    this.userPreferences = { ...UX_CONFIG.user_preferences.defaults };
    localStorage.setItem('ux_preferences', JSON.stringify(this.userPreferences));
    this.initializeOptimizations();
  }
}

// 导出单例实例
export const uxOptimizer = UXOptimizer.getInstance();

// 便捷函数
export const optimizeUX = () => {
  uxOptimizer.initializeOptimizations();
};

export const setUXPreference = (key: string, value: any) => {
  uxOptimizer.setPreference(key, value);
};

export const getUXPreference = (key: string) => {
  return uxOptimizer.getPreference(key);
};

export const handleUXError = (error: Error, context: string) => {
  uxOptimizer.handleError(error, context);
};