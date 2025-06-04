/**
 * 物业管理模拟器 - 游戏状态管理Context
 * 提供全局游戏状态管理，包括场景进度、玩家数据、游戏统计等
 */

import React, { createContext, useContext, useReducer, useEffect, useCallback, ReactNode, useRef } from 'react';
import { GameState, GameStats, GameProgress, PlayerProfile, GameEffect } from '../types/game';

// ==================== 初始状态定义 ====================

const initialPlayerProfile: PlayerProfile = {
  id: 'player_001',
  name: '物业经理',
  role: 'manager',
  level: 1,
  experience: 0,
  skillPoints: 0,
  skills: {
    communication: 50,
    management: 50,
    technical: 30,
    financial: 40,
    negotiation: 35
  },
  achievements: [],
  preferences: {
    soundEnabled: true,
    musicEnabled: true,
    volume: 70,
    preferredDifficulty: 3,
    autoSaveInterval: 5,
    theme: 'light'
  }
};

const initialGameStats: GameStats = {
  tenantSatisfaction: 75,
  managerStress: 25,
  financialIncome: 100000,
  propertyReputation: 70,
  staffMorale: 80,
  npcRelationships: {}
};

const initialGameProgress: GameProgress = {
  currentScenario: undefined,
  currentNode: undefined,
  completedScenarios: [],
  scenarioStats: {},
  storyFlags: {},
  unlockedContent: ['basic_scenarios']
};

const initialGameState: GameState = {
  player: initialPlayerProfile,
  stats: initialGameStats,
  progress: initialGameProgress,
  savedAt: new Date().toISOString(),
  version: '1.0.0',
  playTime: 0
};

// ==================== Action类型定义 ====================

type GameAction = 
  | { type: 'LOAD_GAME_STATE'; payload: GameState }
  | { type: 'SAVE_GAME_STATE' }
  | { type: 'APPLY_EFFECTS'; payload: GameEffect }
  | { type: 'SET_CURRENT_SCENARIO'; payload: { scenarioId: string; nodeId?: string } }
  | { type: 'COMPLETE_SCENARIO'; payload: { scenarioId: string; score?: number } }
  | { type: 'UPDATE_PLAYER_PROFILE'; payload: Partial<PlayerProfile> }
  | { type: 'UPDATE_STATS'; payload: Partial<GameStats> }
  | { type: 'SET_STORY_FLAG'; payload: { key: string; value: boolean | number | string } }
  | { type: 'ADD_ACHIEVEMENT'; payload: string }
  | { type: 'UPDATE_PLAY_TIME'; payload: number }
  | { type: 'RESET_GAME' };

// ==================== Reducer函数 ====================

function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case 'LOAD_GAME_STATE':
      console.log('加载游戏状态', action.payload);
      return { ...action.payload };

    case 'SAVE_GAME_STATE':
      // 保存到localStorage但不改变state，避免无限循环
      const stateToSave = {
        ...state,
        savedAt: new Date().toISOString()
      };
      localStorage.setItem('gameState', JSON.stringify(stateToSave));
      console.log('保存游戏状态', stateToSave);
      return state; // 返回原state，不触发重新渲染

    case 'APPLY_EFFECTS': {
      const effects = action.payload;
      const newStats = { ...state.stats };
      const changes: Record<string, { before: number; after: number }> = {};
      
      // 记录应用前的状态，用于日志
      const beforeState = JSON.parse(JSON.stringify(state.stats));
      
      // 应用数值效果
      if (effects.tenantSatisfaction !== undefined) {
        const before = newStats.tenantSatisfaction;
        newStats.tenantSatisfaction = Math.max(0, Math.min(100, 
          newStats.tenantSatisfaction + effects.tenantSatisfaction));
        changes.tenantSatisfaction = { before, after: newStats.tenantSatisfaction };
      }
      if (effects.managerStress !== undefined) {
        const before = newStats.managerStress;
        newStats.managerStress = Math.max(0, Math.min(100, 
          newStats.managerStress + effects.managerStress));
        changes.managerStress = { before, after: newStats.managerStress };
      }
      if (effects.financialIncome !== undefined) {
        const before = newStats.financialIncome;
        newStats.financialIncome += effects.financialIncome;
        changes.financialIncome = { before, after: newStats.financialIncome };
      }
      if (effects.propertyReputation !== undefined) {
        const before = newStats.propertyReputation;
        newStats.propertyReputation = Math.max(0, Math.min(100, 
          newStats.propertyReputation + effects.propertyReputation));
        changes.propertyReputation = { before, after: newStats.propertyReputation };
      }
      if (effects.staffMorale !== undefined) {
        const before = newStats.staffMorale;
        newStats.staffMorale = Math.max(0, Math.min(100, 
          newStats.staffMorale + effects.staffMorale));
        changes.staffMorale = { before, after: newStats.staffMorale };
      }

      // 应用NPC关系效果
      Object.keys(effects).forEach(key => {
        if (key.startsWith('relationship_')) {
          const npcId = key.replace('relationship_', '');
          const currentRelation = newStats.npcRelationships[npcId] || 0;
          const before = currentRelation;
          newStats.npcRelationships[npcId] = Math.max(-100, Math.min(100, 
            currentRelation + (effects[key as keyof GameEffect] as number)));
          changes[`relationship_${npcId}`] = { before, after: newStats.npcRelationships[npcId] };
        }
      });

      // 记录应用效果的详细日志
      console.log('应用游戏效果', {
        effects,
        changes,
        statsBefore: beforeState,
        statsAfter: newStats
      });

      return {
        ...state,
        stats: newStats
      };
    }

    case 'SET_CURRENT_SCENARIO':
      console.log('设置当前场景', action.payload);
      return {
        ...state,
        progress: {
          ...state.progress,
          currentScenario: action.payload.scenarioId,
          currentNode: action.payload.nodeId
        }
      };

    case 'COMPLETE_SCENARIO': {
      const { scenarioId, score = 0 } = action.payload;
      const currentStats = state.progress.scenarioStats[scenarioId] || {
        completedCount: 0,
        bestScore: 0,
        lastPlayed: new Date().toISOString()
      };

      console.log('完成场景', {
        scenarioId,
        score,
        previousStats: currentStats
      });

      return {
        ...state,
        progress: {
          ...state.progress,
          completedScenarios: state.progress.completedScenarios.includes(scenarioId) 
            ? state.progress.completedScenarios 
            : [...state.progress.completedScenarios, scenarioId],
          scenarioStats: {
            ...state.progress.scenarioStats,
            [scenarioId]: {
              completedCount: currentStats.completedCount + 1,
              bestScore: Math.max(currentStats.bestScore, score),
              lastPlayed: new Date().toISOString()
            }
          }
        }
      };
    }

    case 'UPDATE_PLAYER_PROFILE':
      console.log('更新玩家资料', action.payload);
      return {
        ...state,
        player: {
          ...state.player,
          ...action.payload
        }
      };

    case 'UPDATE_STATS':
      console.log('更新游戏统计', action.payload);
      return {
        ...state,
        stats: {
          ...state.stats,
          ...action.payload
        }
      };

    case 'SET_STORY_FLAG':
      console.log('设置剧情标志', action.payload);
      return {
        ...state,
        progress: {
          ...state.progress,
          storyFlags: {
            ...state.progress.storyFlags,
            [action.payload.key]: action.payload.value
          }
        }
      };

    case 'ADD_ACHIEVEMENT':
      if (state.player.achievements.includes(action.payload)) {
        console.log('成就已解锁，跳过', action.payload);
        return state;
      }
      console.log('添加新成就', action.payload);
      return {
        ...state,
        player: {
          ...state.player,
          achievements: [...state.player.achievements, action.payload]
        }
      };

    case 'UPDATE_PLAY_TIME':
      // 游戏时间更新无需详细日志，避免日志过多
      return {
        ...state,
        playTime: state.playTime + action.payload
      };

    case 'RESET_GAME':
      console.log('重置游戏');
      localStorage.removeItem('gameState');
      return { ...initialGameState };

    default:
      console.warn('未知的action类型', (action as any).type);
      return state;
  }
}

// ==================== Context定义 ====================

interface GameContextType {
  gameState: GameState;
  dispatch: React.Dispatch<GameAction>;
  // 便捷方法
  applyEffects: (effects: GameEffect) => void;
  setCurrentScenario: (scenarioId: string, nodeId?: string) => void;
  completeScenario: (scenarioId: string, score?: number) => void;
  saveGame: () => void;
  loadGame: () => void;
  resetGame: () => void;
  setStoryFlag: (key: string, value: boolean | number | string) => void;
  addAchievement: (achievementId: string) => void;
  createNewGame: (character: {
    name: string;
    background: string;
    skills: {
      communication: number;
      management: number;
      technical: number;
      finance: number;
    };
    startingMoney: number;
  }) => void;
}

const GameContext = createContext<GameContextType | undefined>(undefined);

// ==================== Provider组件 ====================

interface GameProviderProps {
  children: ReactNode;
}

export function GameProvider({ children }: GameProviderProps) {
  const [gameState, dispatch] = useReducer(gameReducer, initialGameState);
  const playTimeIntervalRef = useRef<number | null>(null);

  // 尝试从localStorage加载游戏状态
  useEffect(() => {
    const savedState = localStorage.getItem('gameState');
    if (savedState) {
      try {
        const parsedState = JSON.parse(savedState);
        console.log('从本地存储加载游戏状态', parsedState);
        dispatch({ type: 'LOAD_GAME_STATE', payload: parsedState });
      } catch (error) {
        console.error('无法解析保存的游戏状态', error);
      }
    }
  }, []);

  // 开始记录游戏时间
  useEffect(() => {
    if (!playTimeIntervalRef.current) {
      console.log('开始记录游戏时间');
      playTimeIntervalRef.current = window.setInterval(() => {
        dispatch({ type: 'UPDATE_PLAY_TIME', payload: 1 });
      }, 1000);
    }

    return () => {
      if (playTimeIntervalRef.current) {
        console.log('停止记录游戏时间');
        clearInterval(playTimeIntervalRef.current);
        playTimeIntervalRef.current = null;
      }
    };
  }, []);

  // 定期自动保存游戏状态
  useEffect(() => {
    const saveInterval = gameState.player.preferences.autoSaveInterval || 5;
    console.log(`设置自动保存间隔: ${saveInterval}分钟`);
    
    const autoSaveTimer = setInterval(() => {
      console.log('执行自动保存');
      dispatch({ type: 'SAVE_GAME_STATE' });
    }, saveInterval * 60 * 1000); // 转换为毫秒
    
    return () => {
      clearInterval(autoSaveTimer);
    };
  }, [gameState.player.preferences.autoSaveInterval]);

  // 应用游戏效果的辅助函数
  const applyEffects = useCallback((effects: GameEffect) => {
    dispatch({ type: 'APPLY_EFFECTS', payload: effects });
  }, []);

  // 设置当前场景
  const setCurrentScenario = useCallback((scenarioId: string, nodeId?: string) => {
    dispatch({ type: 'SET_CURRENT_SCENARIO', payload: { scenarioId, nodeId } });
  }, []);

  // 完成场景
  const completeScenario = useCallback((scenarioId: string, score?: number) => {
    dispatch({ type: 'COMPLETE_SCENARIO', payload: { scenarioId, score } });
  }, []);

  // 保存游戏状态
  const saveGame = useCallback(() => {
    console.log('手动保存游戏');
    dispatch({ type: 'SAVE_GAME_STATE' });
  }, []);

  // 加载游戏状态
  const loadGame = useCallback(() => {
    const savedState = localStorage.getItem('gameState');
    if (savedState) {
      try {
        const parsedState = JSON.parse(savedState);
        console.log('手动加载游戏状态', parsedState);
        dispatch({ type: 'LOAD_GAME_STATE', payload: parsedState });
        return true;
      } catch (error) {
        console.error('加载游戏状态失败', error);
      }
    }
    return false;
  }, []);

  // 重置游戏
  const resetGame = useCallback(() => {
    dispatch({ type: 'RESET_GAME' });
  }, []);

  const createNewGame = (character: {
    name: string;
    background: string;
    skills: {
      communication: number;
      management: number;
      technical: number;
      finance: number;
    };
    startingMoney: number;
  }) => {
    const newState: GameState = {
      player: {
        id: 'player_1',
        name: character.name,
        role: 'manager',
        level: 1,
        experience: 0,
        skillPoints: 0,
        skills: {
          communication: character.skills.communication,
          management: character.skills.management,
          technical: character.skills.technical,
          financial: character.skills.finance,
          negotiation: 35
        },
        achievements: [],
        preferences: {
          soundEnabled: true,
          musicEnabled: true,
          volume: 70,
          preferredDifficulty: 3,
          autoSaveInterval: 5,
          theme: 'light'
        }
      },
      stats: {
        tenantSatisfaction: 75,
        managerStress: 25,
        financialIncome: character.startingMoney,
        propertyReputation: 70,
        staffMorale: 80,
        npcRelationships: {}
      },
      progress: {
        currentScenario: undefined,
        currentNode: undefined,
        completedScenarios: [],
        scenarioStats: {},
        storyFlags: {},
        unlockedContent: ['basic_scenarios']
      },
      savedAt: new Date().toISOString(),
      version: '1.0.0',
      playTime: 0
    };
    
    dispatch({ type: 'LOAD_GAME_STATE', payload: newState });
  };

  const setStoryFlag = (key: string, value: boolean | number | string) => {
    dispatch({ type: 'SET_STORY_FLAG', payload: { key, value } });
  };

  const addAchievement = (achievementId: string) => {
    dispatch({ type: 'ADD_ACHIEVEMENT', payload: achievementId });
  };

  const contextValue: GameContextType = {
    gameState,
    dispatch,
    applyEffects,
    setCurrentScenario,
    completeScenario,
    saveGame,
    loadGame,
    resetGame,
    setStoryFlag,
    addAchievement,
    createNewGame
  };

  return (
    <GameContext.Provider value={contextValue}>
      {children}
    </GameContext.Provider>
  );
}

// ==================== Hook ====================

export function useGame() {
  const context = useContext(GameContext);
  if (context === undefined) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
}

// ==================== 导出 ====================

export { GameContext };
export type { GameContextType };