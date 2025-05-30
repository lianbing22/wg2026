/**
 * 物业管理模拟器 - 游戏核心类型定义
 * 定义场景引擎、QTE系统、游戏状态等核心数据结构
 */

// ==================== 基础类型 ====================

/** 游戏中的数值效果 */
export interface GameEffect {
  /** 租户满意度变化 */
  tenantSatisfaction?: number;
  /** 管理员压力变化 */
  managerStress?: number;
  /** 财务收入变化 */
  financialIncome?: number;
  /** 物业声誉变化 */
  propertyReputation?: number;
  /** 员工士气变化 */
  staffMorale?: number;
  /** 经验值变化 */
  experience?: number;
  /** 技能变化 */
  skills?: Record<string, number>;
  /** 压力变化 (简化字段) */
  stress?: number;
  /** 金钱变化 (简化字段) */
  money?: number;
  /** 声誉变化 (简化字段) */
  reputation?: number;
  /** 与特定NPC的关系变化 */
  [key: `relationship_${string}`]: number;
}

/** 游戏统计数据 */
export interface GameStats {
  /** 租户满意度 (0-100) */
  tenantSatisfaction: number;
  /** 管理员压力 (0-100) */
  managerStress: number;
  /** 财务收入 */
  financialIncome: number;
  /** 物业声誉 (0-100) */
  propertyReputation: number;
  /** 员工士气 (0-100) */
  staffMorale: number;
  /** NPC关系映射 */
  npcRelationships: Record<string, number>;
}

// ==================== 场景系统类型 ====================

/** 场景选择项 */
export interface ScenarioChoice {
  /** 选择文本 */
  text: string;
  /** 选择效果 */
  effects?: GameEffect;
  /** 下一个节点ID */
  nextNode?: string;
  /** 触发QTE的配置 */
  qte?: QTEConfig;
  /** 选择条件（可选，用于条件性显示选择） */
  condition?: ScenarioCondition;
  /** 选择是否需要特定技能或属性 */
  requirements?: Record<string, number>;
}

/** 场景条件 */
export interface ScenarioCondition {
  /** 条件类型 */
  type: 'stat' | 'relationship' | 'flag' | 'item';
  /** 条件目标 */
  target: string;
  /** 条件操作符 */
  operator: '>' | '<' | '>=' | '<=' | '==' | '!=';
  /** 条件值 */
  value: number | string | boolean;
}

/** 场景节点 */
export interface ScenarioNode {
  /** 节点唯一标识 */
  nodeId: string;
  /** 场景标题 */
  title?: string;
  /** 场景文本内容 */
  text: string;
  /** 场景图片URL */
  image?: string;
  /** 可选择的行动 */
  choices?: ScenarioChoice[];
  /** 自动效果（进入节点时自动触发） */
  autoEffects?: GameEffect;
  /** 节点类型 */
  type?: 'normal' | 'ending' | 'checkpoint' | 'choice';
  /** 背景音乐 */
  backgroundMusic?: string;
  /** 音效 */
  soundEffect?: string;
}

/** 完整场景定义 */
export interface Scenario {
  /** 场景唯一标识 */
  id: string;
  /** 场景标题 */
  title: string;
  /** 涉及的NPC列表 */
  involvedNPCs?: string[];
  /** 起始节点ID */
  startNode: string;
  /** 场景节点集合 */
  nodes?: ScenarioNode[];
  /** 场景描述 */
  description?: string;
  /** 场景难度等级 */
  difficulty?: 1 | 2 | 3 | 4 | 5;
  /** 场景标签 */
  tags?: string[];
  /** 场景要求（技能等级要求） */
  requirements?: Record<string, number>;
  /** 预计完成时间（分钟） */
  estimatedTime?: number;
  /** 场景奖励 */
  rewards?: GameEffect;
}

// ==================== QTE系统类型 ====================

/** QTE类型枚举 */
export type QTEType = 
  | 'StopTheMovingBar'
  | 'ButtonMash'
  | 'ClickSequence'
  | 'RhythmTap'
  | 'DragAndDrop'
  | 'RotateControl'
  | 'MemorySequence'
  | 'SwipeGesture'
  | 'PrecisionClick'
  | 'TimedInput'
  | 'timing';

/** QTE参数配置 */
export interface QTEParameters {
  /** 时间限制（毫秒） */
  timeLimit?: number;
  /** 目标区域开始位置（百分比，0-100） */
  targetZoneStart?: number;
  /** 目标区域结束位置（百分比，0-100） */
  targetZoneEnd?: number;
  /** 移动条速度 */
  barSpeed?: number;
  /** 目标点击次数 */
  targetClicks?: number;
  /** 点击序列 */
  sequence?: Array<{ image: string; id?: string }>;
  /** 节奏间隔（毫秒） */
  rhythmInterval?: number;
  /** 拖拽目标位置 */
  dragTarget?: { x: number; y: number };
  /** 旋转目标角度 */
  targetAngle?: number;
  /** 记忆序列长度 */
  memoryLength?: number;
  /** 滑动方向 */
  direction?: 'up' | 'down' | 'left' | 'right';
  /** 滑动阈值 */
  swipeThreshold?: number;
  /** 精确度要求（像素） */
  precision?: number;
  /** 输入提示文本 */
  inputPrompt?: string;
}

/** QTE配置 */
export interface QTEConfig {
  /** QTE类型 */
  type: QTEType;
  /** 指令文本 */
  instructionText?: string;
  /** QTE参数 */
  parameters?: QTEParameters;
  /** 成功时的下一个节点 */
  successNode?: string;
  /** 失败时的下一个节点 */
  failureNode?: string;
  /** 成功时的效果 */
  successEffects?: GameEffect;
  /** 失败时的效果 */
  failureEffects?: GameEffect;
  /** 难度等级 (1-5) */
  difficulty?: number;
  /** 时间限制（秒） */
  timeLimit?: number;
  /** QTE标题 */
  title?: string;
  /** 目标时机（0-1之间的数值） */
  targetTiming?: number;
  /** 容错范围 */
  tolerance?: number;
}

/** QTE结果 */
export interface QTEResult {
  /** 是否成功 */
  success: boolean;
  /** 完成时间（毫秒） */
  completionTime: number;
  /** 精确度分数 (0-100) */
  accuracy: number;
  /** 额外数据 */
  extraData?: Record<string, any>;
}

// ==================== 游戏状态类型 ====================

/** 玩家档案 */
export interface PlayerProfile {
  /** 玩家ID */
  id: string;
  /** 玩家姓名 */
  name: string;
  /** 角色类型 */
  role: 'manager' | 'admin' | 'staff' | 'owner';
  /** 经验等级 */
  level: number;
  /** 经验值 */
  experience: number;
  /** 技能点数 */
  skillPoints: number;
  /** 专业技能 */
  skills: Record<string, number>;
  /** 成就列表 */
  achievements: string[];
  /** 偏好设置 */
  preferences: PlayerPreferences;
}

/** 玩家偏好设置 */
export interface PlayerPreferences {
  /** 音效开关 */
  soundEnabled: boolean;
  /** 音乐开关 */
  musicEnabled: boolean;
  /** 音量设置 (0-100) */
  volume: number;
  /** 难度偏好 */
  preferredDifficulty: number;
  /** 自动保存间隔（分钟） */
  autoSaveInterval: number;
  /** 界面主题 */
  theme: 'light' | 'dark' | 'auto';
}

/** 游戏进度状态 */
export interface GameProgress {
  /** 当前场景ID */
  currentScenario?: string;
  /** 当前节点ID */
  currentNode?: string;
  /** 已完成的场景列表 */
  completedScenarios: string[];
  /** 场景完成统计 */
  scenarioStats: Record<string, {
    completedCount: number;
    bestScore: number;
    lastPlayed: string;
  }>;
  /** 故事标记（用于条件判断） */
  storyFlags: Record<string, boolean | number | string>;
  /** 解锁的内容 */
  unlockedContent: string[];
}

/** 完整游戏状态 */
export interface GameState {
  /** 玩家档案 */
  player: PlayerProfile;
  /** 游戏统计 */
  stats: GameStats;
  /** 游戏进度 */
  progress: GameProgress;
  /** 存档时间戳 */
  savedAt: string;
  /** 存档版本 */
  version: string;
  /** 游戏时长（秒） */
  playTime: number;
}

// ==================== NPC和角色类型 ====================

/** NPC定义 */
export interface NPC {
  /** NPC唯一标识 */
  id: string;
  /** NPC姓名 */
  name: string;
  /** NPC角色类型 */
  role: 'tenant' | 'staff' | 'vendor' | 'official' | 'neighbor';
  /** 头像图片URL */
  avatar?: string;
  /** 性格特征 */
  personality: string[];
  /** 与玩家的关系值 (-100 到 100) */
  relationshipValue: number;
  /** NPC背景故事 */
  background?: string;
  /** NPC偏好和厌恶 */
  preferences?: {
    likes: string[];
    dislikes: string[];
  };
}

// ==================== 成就系统类型 ====================

/** 成就定义 */
export interface Achievement {
  /** 成就唯一标识 */
  id: string;
  /** 成就名称 */
  name: string;
  /** 成就描述 */
  description: string;
  /** 成就图标 */
  icon?: string;
  /** 成就类型 */
  type: 'scenario' | 'qte' | 'management' | 'social' | 'special';
  /** 解锁条件 */
  unlockConditions: AchievementCondition[];
  /** 奖励 */
  rewards?: {
    experience?: number;
    skillPoints?: number;
    unlockContent?: string[];
  };
  /** 是否隐藏成就 */
  hidden?: boolean;
}

/** 成就解锁条件 */
export interface AchievementCondition {
  /** 条件类型 */
  type: 'complete_scenario' | 'qte_success_rate' | 'stat_threshold' | 'relationship_level' | 'play_time';
  /** 条件目标 */
  target?: string;
  /** 条件值 */
  value: number | string;
  /** 条件操作符 */
  operator?: '>=' | '<=' | '==' | '>';
}

// ==================== 事件系统类型 ====================

/** 游戏事件 */
export interface GameEvent {
  /** 事件类型 */
  type: string;
  /** 事件数据 */
  data: Record<string, any>;
  /** 事件时间戳 */
  timestamp: number;
}

/** 事件监听器 */
export type EventListener = (event: GameEvent) => void;

// ==================== 导出所有类型 ====================

export type {
  // 重新导出已有的Property类型
  Property,
  Unit
} from './property';