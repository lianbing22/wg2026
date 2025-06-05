// 国际化配置
export interface I18nConfig {
  defaultLocale: string;
  supportedLocales: string[];
  fallbackLocale: string;
  dateFormat: Record<string, string>;
  numberFormat: Record<string, Intl.NumberFormatOptions>;
  currencyFormat: Record<string, Intl.NumberFormatOptions>;
}

// 支持的语言列表
export const SUPPORTED_LOCALES = {
  'zh-CN': {
    name: '简体中文',
    nativeName: '简体中文',
    flag: '🇨🇳',
    rtl: false
  },
  'zh-TW': {
    name: '繁體中文',
    nativeName: '繁體中文', 
    flag: '🇹🇼',
    rtl: false
  },
  'en-US': {
    name: 'English (US)',
    nativeName: 'English (US)',
    flag: '🇺🇸',
    rtl: false
  },
  'ja-JP': {
    name: '日本語',
    nativeName: '日本語',
    flag: '🇯🇵',
    rtl: false
  },
  'ko-KR': {
    name: '한국어',
    nativeName: '한국어',
    flag: '🇰🇷',
    rtl: false
  }
};

// 国际化配置
export const I18N_CONFIG: I18nConfig = {
  defaultLocale: 'zh-CN',
  supportedLocales: Object.keys(SUPPORTED_LOCALES),
  fallbackLocale: 'zh-CN',
  
  // 日期格式配置
  dateFormat: {
    'zh-CN': 'YYYY年MM月DD日',
    'zh-TW': 'YYYY年MM月DD日',
    'en-US': 'MM/DD/YYYY',
    'ja-JP': 'YYYY年MM月DD日',
    'ko-KR': 'YYYY년 MM월 DD일'
  },
  
  // 数字格式配置
  numberFormat: {
    'zh-CN': { useGrouping: true, minimumFractionDigits: 0 },
    'zh-TW': { useGrouping: true, minimumFractionDigits: 0 },
    'en-US': { useGrouping: true, minimumFractionDigits: 0 },
    'ja-JP': { useGrouping: true, minimumFractionDigits: 0 },
    'ko-KR': { useGrouping: true, minimumFractionDigits: 0 }
  },
  
  // 货币格式配置
  currencyFormat: {
    'zh-CN': { style: 'currency', currency: 'CNY', currencyDisplay: 'symbol' },
    'zh-TW': { style: 'currency', currency: 'TWD', currencyDisplay: 'symbol' },
    'en-US': { style: 'currency', currency: 'USD', currencyDisplay: 'symbol' },
    'ja-JP': { style: 'currency', currency: 'JPY', currencyDisplay: 'symbol' },
    'ko-KR': { style: 'currency', currency: 'KRW', currencyDisplay: 'symbol' }
  }
};

// 游戏文本翻译
export const GAME_TRANSLATIONS = {
  'zh-CN': {
    // 通用
    common: {
      confirm: '确认',
      cancel: '取消',
      save: '保存',
      delete: '删除',
      edit: '编辑',
      add: '添加',
      search: '搜索',
      loading: '加载中...',
      error: '错误',
      success: '成功',
      warning: '警告',
      info: '信息'
    },
    
    // 游戏界面
    game: {
      title: '物业管理模拟器',
      start: '开始游戏',
      continue: '继续游戏',
      settings: '设置',
      achievements: '成就',
      statistics: '统计',
      exit: '退出游戏'
    },
    
    // 角色创建
    character: {
      creation: '角色创建',
      name: '角色姓名',
      background: '职业背景',
      skills: '技能分配'
    },
    
    // 游戏统计
    stats: {
      income: '收入',
      reputation: '声誉',
      properties: '管理物业',
      stress: '压力值',
      morale: '士气值',
      satisfaction: '满意度',
      skills: '技能等级',
      relationships: '人际关系'
    }
  },
  
  'en-US': {
    // Common
    common: {
      confirm: 'Confirm',
      cancel: 'Cancel',
      save: 'Save',
      delete: 'Delete',
      edit: 'Edit',
      add: 'Add',
      search: 'Search',
      loading: 'Loading...',
      error: 'Error',
      success: 'Success',
      warning: 'Warning',
      info: 'Information'
    },
    
    // Game Interface
    game: {
      title: 'Property Management Simulator',
      start: 'Start Game',
      continue: 'Continue Game',
      settings: 'Settings',
      achievements: 'Achievements',
      statistics: 'Statistics',
      exit: 'Exit Game'
    },
    
    // Character Creation
    character: {
      creation: 'Character Creation',
      name: 'Character Name',
      background: 'Professional Background',
      skills: 'Skill Allocation'
    },
    
    // Game Statistics
    stats: {
      income: 'Income',
      reputation: 'Reputation',
      properties: 'Managed Properties',
      stress: 'Stress Level',
      morale: 'Morale',
      satisfaction: 'Satisfaction',
      skills: 'Skill Levels',
      relationships: 'Relationships'
    }
  }
};

// 国际化工具函数
export class I18nUtils {
  private static currentLocale: string = I18N_CONFIG.defaultLocale;
  
  // 设置当前语言
  static setLocale(locale: string): void {
    if (I18N_CONFIG.supportedLocales.includes(locale)) {
      this.currentLocale = locale;
    }
  }
  
  // 获取当前语言
  static getCurrentLocale(): string {
    return this.currentLocale;
  }
  
  // 获取翻译文本
  static t(key: string, locale?: string): string {
    const targetLocale = locale || this.currentLocale;
    const translations = GAME_TRANSLATIONS[targetLocale as keyof typeof GAME_TRANSLATIONS];
    
    if (!translations) {
      return key;
    }
    
    const keys = key.split('.');
    let value: any = translations;
    
    for (const k of keys) {
      value = value?.[k];
      if (value === undefined) {
        return key;
      }
    }
    
    return value || key;
  }
  
  // 格式化数字
  static formatNumber(value: number, locale?: string): string {
    const targetLocale = locale || this.currentLocale;
    const options = I18N_CONFIG.numberFormat[targetLocale] || I18N_CONFIG.numberFormat[I18N_CONFIG.fallbackLocale];
    
    return new Intl.NumberFormat(targetLocale, options).format(value);
  }
  
  // 格式化货币
  static formatCurrency(value: number, locale?: string): string {
    const targetLocale = locale || this.currentLocale;
    const options = I18N_CONFIG.currencyFormat[targetLocale] || I18N_CONFIG.currencyFormat[I18N_CONFIG.fallbackLocale];
    
    return new Intl.NumberFormat(targetLocale, options).format(value);
  }
  
  // 格式化日期
  static formatDate(date: Date, locale?: string): string {
    const targetLocale = locale || this.currentLocale;
    
    return new Intl.DateTimeFormat(targetLocale).format(date);
  }
  
  // 获取语言信息
  static getLocaleInfo(locale?: string) {
    const targetLocale = locale || this.currentLocale;
    return SUPPORTED_LOCALES[targetLocale as keyof typeof SUPPORTED_LOCALES];
  }
  
  // 检测浏览器语言
  static detectBrowserLocale(): string {
    const browserLang = navigator.language || navigator.languages?.[0] || I18N_CONFIG.defaultLocale;
    
    // 尝试精确匹配
    if (I18N_CONFIG.supportedLocales.includes(browserLang)) {
      return browserLang;
    }
    
    // 尝试语言代码匹配
    const langCode = browserLang.split('-')[0];
    const matchedLocale = I18N_CONFIG.supportedLocales.find(locale => 
      locale.startsWith(langCode)
    );
    
    return matchedLocale || I18N_CONFIG.defaultLocale;
  }
}

// 导出默认实例
export default I18nUtils;