// 用户体验优化配置

// 动画和过渡配置
export const ANIMATION_CONFIG = {
  // 基础动画时长
  durations: {
    fast: 150,
    normal: 300,
    slow: 500,
    extra_slow: 800
  },
  
  // 缓动函数
  easings: {
    ease_out: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
    ease_in_out: 'cubic-bezier(0.645, 0.045, 0.355, 1)',
    bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
    smooth: 'cubic-bezier(0.4, 0, 0.2, 1)'
  },
  
  // 动画延迟
  delays: {
    stagger: 50,
    sequence: 100,
    cascade: 150
  }
};

// 反馈系统配置
export const FEEDBACK_CONFIG = {
  // 音效配置
  audio: {
    enabled: true,
    volume: {
      master: 0.7,
      effects: 0.5,
      ui: 0.3,
      ambient: 0.2
    },
    types: {
      click: { frequency: 800, duration: 100, volume: 0.3 },
      success: { frequencies: [523, 659, 784], duration: 300, volume: 0.4 },
      error: { frequency: 200, duration: 200, volume: 0.5 },
      notification: { frequencies: [440, 554], duration: 300, volume: 0.3 },
      ambient: { frequency: 220, duration: 1000, volume: 0.1 }
    }
  },
  
  // 触觉反馈配置
  haptic: {
    enabled: true,
    patterns: {
      light: 50,
      medium: 100,
      strong: [100, 50, 100],
      success: [50, 30, 50],
      error: [200, 100, 200]
    }
  },
  
  // 视觉反馈配置
  visual: {
    enabled: true,
    effects: {
      button_press: {
        scale: 0.95,
        duration: 150
      },
      hover: {
        scale: 1.02,
        duration: 200
      },
      focus: {
        glow: '0 0 0 2px rgba(24, 144, 255, 0.2)',
        duration: 200
      },
      success: {
        color: '#52c41a',
        pulse: true,
        duration: 500
      },
      error: {
        color: '#ff4d4f',
        shake: true,
        duration: 300
      }
    }
  }
};

// 性能优化配置
export const PERFORMANCE_CONFIG = {
  // 性能阈值
  thresholds: {
    fps: {
      excellent: 60,
      good: 45,
      poor: 30
    },
    memory: {
      excellent: 40,
      good: 60,
      poor: 80
    },
    response_time: {
      excellent: 100,
      good: 300,
      poor: 1000
    },
    load_time: {
      excellent: 1000,
      good: 3000,
      poor: 5000
    }
  },
  
  // 优化策略
  optimization: {
    // 自动降级
    auto_degrade: {
      enabled: true,
      fps_threshold: 30,
      memory_threshold: 80,
      recovery_threshold: {
        fps: 45,
        memory: 60
      },
      actions: {
        disable_animations: true,
        reduce_effects: true,
        lower_quality: true,
        simplify_ui: true,
        reduce_polling: true
      }
    },
    
    // 预加载策略
    preload: {
      images: true,
      audio: false,
      critical_resources: true,
      max_concurrent: 3,
      priority_order: ['critical', 'visible', 'next_scene']
    },
    
    // 缓存策略
    cache: {
      scenarios: true,
      assets: true,
      user_data: true,
      game_state: true,
      ttl: 3600000, // 1小时
      max_size: 50 * 1024 * 1024, // 50MB
      cleanup_threshold: 0.8 // 80%使用率时清理
    },
    
    // 渲染优化
    rendering: {
      use_virtual_scrolling: true,
      debounce_resize: 250,
      throttle_scroll: 16,
      lazy_load_images: true,
      reduce_repaints: true
    },
    
    // 内存管理
    memory: {
      auto_cleanup: true,
      cleanup_interval: 300000, // 5分钟
      max_history_size: 100,
      gc_hint_threshold: 0.85
    }
  }
};

// 响应式设计配置
export const RESPONSIVE_CONFIG = {
  breakpoints: {
    xs: 480,
    sm: 576,
    md: 768,
    lg: 992,
    xl: 1200,
    xxl: 1600
  },
  
  // 移动端优化
  mobile: {
    touch_target_size: 44, // 最小触摸目标尺寸（px）
    scroll_behavior: 'smooth',
    viewport_meta: 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no'
  },
  
  // 桌面端优化
  desktop: {
    hover_effects: true,
    keyboard_navigation: true,
    context_menus: true
  }
};

// 无障碍配置
export const ACCESSIBILITY_CONFIG = {
  // 键盘导航
  keyboard: {
    enabled: true,
    focus_visible: true,
    skip_links: true,
    tab_trapping: true,
    focus_management: true,
    shortcuts: {
      escape: 'close_modal',
      enter: 'confirm_action',
      space: 'select_item',
      arrow_keys: 'navigate',
      tab: 'next_element',
      shift_tab: 'previous_element',
      home: 'first_element',
      end: 'last_element'
    }
  },
  
  // 屏幕阅读器
  screen_reader: {
    enabled: true,
    announcements: true,
    live_regions: true,
    semantic_markup: true,
    alt_text: true,
    heading_structure: true,
    landmark_roles: true
  },
  
  // 视觉辅助
  visual: {
    high_contrast: false,
    large_text: false,
    reduced_motion: false,
    color_blind_friendly: true,
    focus_indicators: true,
    text_spacing: false,
    zoom_support: true,
    min_touch_target: 44 // 最小触摸目标尺寸(px)
  },
  
  // ARIA 标签
  aria: {
    labels: true,
    descriptions: true,
    live_regions: true,
    roles: true,
    states: true,
    properties: true,
    expanded: true,
    selected: true
  },
  
  // 语音控制
  voice: {
    enabled: false,
    commands: true,
    dictation: false
  },
  
  // 认知辅助
  cognitive: {
    simple_language: false,
    clear_instructions: true,
    error_prevention: true,
    undo_support: true,
    timeout_warnings: true
  }
};

// 用户偏好配置
export const USER_PREFERENCES = {
  // 默认设置
  defaults: {
    theme: 'light',
    language: 'zh-CN',
    animations: true,
    sound: true,
    haptic: true,
    auto_save: true,
    performance_monitor: false
  },
  
  // 可配置项
  configurable: {
    theme: ['light', 'dark', 'auto'],
    language: ['zh-CN', 'en-US'],
    animation_speed: ['slow', 'normal', 'fast', 'off'],
    sound_volume: [0, 0.25, 0.5, 0.75, 1],
    difficulty: ['easy', 'normal', 'hard'],
    auto_save_interval: [30, 60, 120, 300] // 秒
  }
};

// 错误处理配置
export const ERROR_HANDLING_CONFIG = {
  // 错误类型
  types: {
    network: {
      retry_attempts: 3,
      retry_delay: 1000,
      fallback_message: '网络连接异常，请检查网络设置'
    },
    validation: {
      show_inline: true,
      highlight_field: true,
      auto_focus: true
    },
    runtime: {
      report_to_console: true,
      show_user_message: false,
      fallback_ui: true
    }
  },
  
  // 错误恢复
  recovery: {
    auto_retry: true,
    save_state: true,
    graceful_degradation: true
  }
};

// 加载状态配置
export const LOADING_CONFIG = {
  // 加载指示器
  indicators: {
    spinner: {
      size: 'default',
      delay: 200 // 延迟显示，避免闪烁
    },
    progress: {
      show_percentage: true,
      show_time_remaining: false,
      smooth_animation: true
    },
    skeleton: {
      enabled: true,
      animation: 'wave',
      rows: 3
    }
  },
  
  // 超时配置
  timeouts: {
    api_request: 10000,
    resource_load: 30000,
    user_action: 5000
  }
};

// 导出完整配置
export const UX_CONFIG = {
  animation: ANIMATION_CONFIG,
  feedback: FEEDBACK_CONFIG,
  performance: PERFORMANCE_CONFIG,
  responsive: RESPONSIVE_CONFIG,
  accessibility: ACCESSIBILITY_CONFIG,
  user_preferences: USER_PREFERENCES,
  error_handling: ERROR_HANDLING_CONFIG,
  loading: LOADING_CONFIG
};

export default UX_CONFIG;