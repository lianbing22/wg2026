// services/authService.ts

// 认证相关类型定义
export interface LoginCredentials {
  username: string;
  password: string;
}

export interface User {
  id: string;
  username: string;
  email?: string;
  role: 'player' | 'admin';
  createdAt: Date;
  lastLoginAt?: Date;
}

export interface AuthResponse {
  success: boolean;
  user?: User;
  token?: string;
  error?: string;
}

// 安全配置
const AUTH_CONFIG = {
  TOKEN_KEY: 'wg2026_auth_token',
  USER_KEY: 'wg2026_user_data',
  TOKEN_EXPIRY: 24 * 60 * 60 * 1000, // 24小时
  MAX_LOGIN_ATTEMPTS: 5,
  LOCKOUT_DURATION: 15 * 60 * 1000, // 15分钟
};

// 安全工具函数
class SecurityUtils {
  // 简单的输入验证
  static validateInput(input: string): boolean {
    // 防止基本的注入攻击
    const dangerousPatterns = [
      /<script[^>]*>.*?<\/script>/gi,
      /javascript:/gi,
      /on\w+\s*=/gi,
      /eval\s*\(/gi,
      /expression\s*\(/gi
    ];
    
    return !dangerousPatterns.some(pattern => pattern.test(input));
  }
  
  // 简单的密码强度检查
  static validatePassword(password: string): { valid: boolean; message?: string } {
    if (password.length < 6) {
      return { valid: false, message: '密码长度至少6位' };
    }
    
    if (!/(?=.*[a-zA-Z])(?=.*\d)/.test(password)) {
      return { valid: false, message: '密码必须包含字母和数字' };
    }
    
    return { valid: true };
  }
  
  // 生成安全的随机ID
  static generateSecureId(): string {
    return Math.random().toString(36).substring(2) + Date.now().toString(36);
  }
  
  // 简单的token验证
  static validateToken(token: string): boolean {
    try {
      const parts = token.split('.');
      if (parts.length !== 3) return false;
      
      // 简单检查token格式（实际应用中应使用JWT库）
      const payload = JSON.parse(atob(parts[1]));
      const expiry = payload.exp * 1000;
      
      return Date.now() < expiry;
    } catch {
      return false;
    }
  }
}

// 登录尝试跟踪
class LoginAttemptTracker {
  private static attempts: Map<string, { count: number; lastAttempt: number }> = new Map();
  
  static isLocked(username: string): boolean {
    const attempt = this.attempts.get(username);
    if (!attempt) return false;
    
    if (attempt.count >= AUTH_CONFIG.MAX_LOGIN_ATTEMPTS) {
      const timeSinceLastAttempt = Date.now() - attempt.lastAttempt;
      return timeSinceLastAttempt < AUTH_CONFIG.LOCKOUT_DURATION;
    }
    
    return false;
  }
  
  static recordAttempt(username: string, success: boolean): void {
    if (success) {
      this.attempts.delete(username);
      return;
    }
    
    const current = this.attempts.get(username) || { count: 0, lastAttempt: 0 };
    this.attempts.set(username, {
      count: current.count + 1,
      lastAttempt: Date.now()
    });
  }
  
  static getRemainingLockoutTime(username: string): number {
    const attempt = this.attempts.get(username);
    if (!attempt) return 0;
    
    const timeSinceLastAttempt = Date.now() - attempt.lastAttempt;
    const remainingTime = AUTH_CONFIG.LOCKOUT_DURATION - timeSinceLastAttempt;
    
    return Math.max(0, remainingTime);
  }
}

// 认证服务类
export class AuthService {
  // 模拟用户数据库
  private static mockUsers: User[] = [
    {
      id: 'user_001',
      username: 'player1',
      email: 'player1@example.com',
      role: 'player',
      createdAt: new Date('2024-01-01'),
      lastLoginAt: new Date()
    },
    {
      id: 'admin_001',
      username: 'admin',
      email: 'admin@example.com',
      role: 'admin',
      createdAt: new Date('2024-01-01'),
      lastLoginAt: new Date()
    }
  ];
  
  // 登录
  static async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      // 输入验证
      if (!SecurityUtils.validateInput(credentials.username) || 
          !SecurityUtils.validateInput(credentials.password)) {
        return { success: false, error: '输入包含非法字符' };
      }
      
      // 检查登录尝试锁定
      if (LoginAttemptTracker.isLocked(credentials.username)) {
        const remainingTime = Math.ceil(LoginAttemptTracker.getRemainingLockoutTime(credentials.username) / 1000 / 60);
        return { 
          success: false, 
          error: `账户已锁定，请${remainingTime}分钟后重试` 
        };
      }
      
      // 模拟登录验证（实际应用中应该验证密码哈希）
      const user = this.mockUsers.find(u => u.username === credentials.username);
      
      if (!user || credentials.password !== 'password123') {
        LoginAttemptTracker.recordAttempt(credentials.username, false);
        return { success: false, error: '用户名或密码错误' };
      }
      
      // 登录成功
      LoginAttemptTracker.recordAttempt(credentials.username, true);
      
      // 生成token（简化版，实际应用中应使用JWT）
      const token = this.generateToken(user);
      
      // 更新最后登录时间
      user.lastLoginAt = new Date();
      
      // 安全存储
      this.setSecureStorage(AUTH_CONFIG.TOKEN_KEY, token);
      this.setSecureStorage(AUTH_CONFIG.USER_KEY, JSON.stringify(user));
      
      return { success: true, user, token };
      
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: '登录过程中发生错误' };
    }
  }
  
  // 登出
  static logout(): void {
    try {
      localStorage.removeItem(AUTH_CONFIG.TOKEN_KEY);
      localStorage.removeItem(AUTH_CONFIG.USER_KEY);
      
      // 清除其他敏感数据
      localStorage.removeItem('gameState');
      localStorage.removeItem('gameSettings');
      
    } catch (error) {
      console.error('Logout error:', error);
    }
  }
  
  // 检查认证状态
  static isAuthenticated(): boolean {
    try {
      const token = localStorage.getItem(AUTH_CONFIG.TOKEN_KEY);
      if (!token) return false;
      
      return SecurityUtils.validateToken(token);
    } catch {
      return false;
    }
  }
  
  // 获取当前用户
  static getCurrentUser(): User | null {
    try {
      const userData = localStorage.getItem(AUTH_CONFIG.USER_KEY);
      if (!userData) return null;
      
      return JSON.parse(userData);
    } catch {
      return null;
    }
  }
  
  // 刷新token
  static async refreshToken(): Promise<boolean> {
    try {
      const user = this.getCurrentUser();
      if (!user) return false;
      
      const newToken = this.generateToken(user);
      this.setSecureStorage(AUTH_CONFIG.TOKEN_KEY, newToken);
      
      return true;
    } catch {
      return false;
    }
  }
  
  // 生成token（简化版）
  private static generateToken(user: User): string {
    const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
    const payload = btoa(JSON.stringify({
      sub: user.id,
      username: user.username,
      role: user.role,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor((Date.now() + AUTH_CONFIG.TOKEN_EXPIRY) / 1000)
    }));
    const signature = btoa(SecurityUtils.generateSecureId());
    
    return `${header}.${payload}.${signature}`;
  }
  
  // 安全存储
  private static setSecureStorage(key: string, value: string): void {
    try {
      localStorage.setItem(key, value);
    } catch (error) {
      console.error('Storage error:', error);
    }
  }
}

// 导出便捷函数（保持向后兼容）
export const login = async (credentials?: LoginCredentials): Promise<AuthResponse> => {
  // 如果没有提供凭据，使用默认测试账户
  const defaultCredentials = credentials || {
    username: 'player1',
    password: 'password123'
  };
  
  return AuthService.login(defaultCredentials);
};

export const logout = (): void => AuthService.logout();
export const isAuthenticated = (): boolean => AuthService.isAuthenticated();
export const getCurrentUser = (): User | null => AuthService.getCurrentUser();
export const refreshToken = (): Promise<boolean> => AuthService.refreshToken();

// 导出工具类
export { SecurityUtils, LoginAttemptTracker };