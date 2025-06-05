/**
 * 物业管理模拟器 - 场景引擎组件
 * 负责渲染场景内容、处理用户选择、管理场景流程
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Card, Button, Typography, Space, Progress, Tag, Divider, Alert, Spin, message, Image } from 'antd';
import { 
  PlayCircleOutlined, 
  PauseCircleOutlined, 
  ReloadOutlined,
  SettingOutlined,
  SoundOutlined,
  MutedOutlined
} from '@ant-design/icons';
import { Scenario, ScenarioNode, ScenarioChoice, GameEffect, QTEResult } from '../../types/game';
import { useGame } from '../../contexts/GameContext';
import QTEContainer from './QTEContainer';
import './ScenarioEngine.css';

// 音效管理器
class AudioManager {
  private audioContext: AudioContext | null = null;
  private sounds: Map<string, AudioBuffer> = new Map();
  private isMuted: boolean = false;
  
  constructor() {
    this.initAudioContext();
  }
  
  private async initAudioContext() {
    try {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    } catch (error) {
      console.warn('音频上下文初始化失败:', error);
    }
  }
  
  async playSound(type: 'click' | 'success' | 'error' | 'notification' | 'ambient', volume: number = 0.5) {
    if (this.isMuted || !this.audioContext) return;
    
    try {
      // 使用Web Audio API生成简单音效
      const oscillator = this.audioContext.createOscillator();
      const gainNode = this.audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(this.audioContext.destination);
      
      // 根据类型设置不同的音效参数
      switch (type) {
        case 'click':
          oscillator.frequency.setValueAtTime(800, this.audioContext.currentTime);
          gainNode.gain.setValueAtTime(volume * 0.3, this.audioContext.currentTime);
          gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.1);
          break;
        case 'success':
          oscillator.frequency.setValueAtTime(523, this.audioContext.currentTime);
          oscillator.frequency.setValueAtTime(659, this.audioContext.currentTime + 0.1);
          oscillator.frequency.setValueAtTime(784, this.audioContext.currentTime + 0.2);
          gainNode.gain.setValueAtTime(volume * 0.4, this.audioContext.currentTime);
          gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.3);
          break;
        case 'error':
          oscillator.frequency.setValueAtTime(200, this.audioContext.currentTime);
          gainNode.gain.setValueAtTime(volume * 0.5, this.audioContext.currentTime);
          gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.2);
          break;
        case 'notification':
          oscillator.frequency.setValueAtTime(440, this.audioContext.currentTime);
          oscillator.frequency.setValueAtTime(554, this.audioContext.currentTime + 0.15);
          gainNode.gain.setValueAtTime(volume * 0.3, this.audioContext.currentTime);
          gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.3);
          break;
      }
      
      oscillator.start(this.audioContext.currentTime);
      oscillator.stop(this.audioContext.currentTime + 0.5);
    } catch (error) {
      console.warn('音效播放失败:', error);
    }
  }
  
  setMuted(muted: boolean) {
    this.isMuted = muted;
  }
  
  getMuted() {
    return this.isMuted;
  }
}

// 触觉反馈管理器
class HapticManager {
  static vibrate(pattern: number | number[]) {
    if ('vibrate' in navigator) {
      try {
        navigator.vibrate(pattern);
      } catch (error) {
        console.warn('触觉反馈不支持:', error);
      }
    }
  }
  
  static lightVibration() {
    this.vibrate(50);
  }
  
  static mediumVibration() {
    this.vibrate(100);
  }
  
  static strongVibration() {
    this.vibrate([100, 50, 100]);
  }
}

const { Title, Paragraph } = Typography;

interface ScenarioEngineProps {
  /** 当前场景数据 */
  scenario: Scenario;
  /** 场景节点数据映射 */
  nodes: Record<string, ScenarioNode>;
  /** 场景完成回调 */
  onScenarioComplete?: (scenarioId: string, endingType: string) => void;
  /** 场景退出回调 */
  onExit?: () => void;
}

export default function ScenarioEngine({ 
  scenario, 
  nodes, 
  onScenarioComplete, 
  onExit 
}: ScenarioEngineProps) {
  const { gameState, applyEffects, setCurrentScenario } = useGame();
  const [currentNodeId, setCurrentNodeId] = useState<string>(scenario.startNode);
  const [isLoading, setIsLoading] = useState(false);
  const [showQTE, setShowQTE] = useState(false);
  const [qteConfig, setQTEConfig] = useState<any>(null);
  const [choiceEffects, setChoiceEffects] = useState<GameEffect | null>(null);
  const [nextNodeAfterQTE, setNextNodeAfterQTE] = useState<string | null>(null);
  const [soundEnabled, setSoundEnabled] = useState(gameState.player.preferences.soundEnabled);
  const audioManagerRef = useRef<AudioManager | null>(null);
  
  // 初始化音效管理器
  useEffect(() => {
    audioManagerRef.current = new AudioManager();
    return () => {
      audioManagerRef.current = null;
    };
  }, []);

  const currentNode = nodes[currentNodeId];

  // 更新游戏状态中的当前场景和节点
  useEffect(() => {
    setCurrentScenario(scenario.id, currentNodeId);
  }, [scenario.id, currentNodeId, setCurrentScenario]);

  // 应用自动效果
  const applyAutoEffects = useCallback((node: ScenarioNode) => {
    if (!node.autoEffects) {
      console.log('节点无自动效果', { nodeId: currentNodeId });
      return;
    }

    try {
      const effectsLog = {
        nodeId: currentNodeId,
        originalEffects: node.autoEffects,
        beforeStats: JSON.stringify(gameState.stats),
        timestamp: new Date().toISOString()
      };

      console.log('开始应用节点自动效果', effectsLog);
      
      // 验证自动效果的有效性
      const validatedEffects = { ...node.autoEffects };
      
      if (validatedEffects.stats) {
        Object.keys(validatedEffects.stats).forEach(key => {
          const value = validatedEffects.stats![key as keyof typeof validatedEffects.stats];
          if (typeof value === 'number' && (isNaN(value) || !isFinite(value))) {
            console.error(`自动效果值异常: ${key} = ${value}，重置为0`);
            validatedEffects.stats![key as keyof typeof validatedEffects.stats] = 0;
          }
        });
      }

      applyEffects(validatedEffects);
      
      console.log('节点自动效果应用完成', {
        nodeId: currentNodeId,
        appliedEffects: validatedEffects,
        afterStats: JSON.stringify(gameState.stats)
      });
      
      // 播放自动效果音效
      audioManagerRef.current?.playSound('notification', 0.3);
      
    } catch (error) {
      console.error('应用节点自动效果时发生错误', error, {
        nodeId: currentNodeId,
        autoEffects: node.autoEffects,
        gameState: gameState
      });
      // 发生错误时仍然尝试应用原始效果
      try {
        applyEffects(node.autoEffects);
      } catch (fallbackError) {
        console.error('应用原始自动效果也失败', fallbackError);
      }
    }
  }, [applyEffects, gameState.stats, currentNodeId]);

  // 应用节点的自动效果 - 使用节点ID避免无限循环
  useEffect(() => {
    if (currentNode?.autoEffects) {
      applyAutoEffects(currentNode);
    }
  }, [currentNodeId, applyAutoEffects]); // 移除gameState.stats依赖避免无限循环

  // 播放背景音乐和音效
  useEffect(() => {
    if (!soundEnabled) return;

    // 播放背景音乐
    if (currentNode?.backgroundMusic) {
      // TODO: 实现背景音乐播放逻辑
      console.log('Playing background music:', currentNode.backgroundMusic);
    }

    // 播放音效
    if (currentNode?.soundEffect) {
      // TODO: 实现音效播放逻辑
      console.log('Playing sound effect:', currentNode.soundEffect);
    }
  }, [currentNode, soundEnabled]);

  // 处理选择点击
  const handleChoiceClick = useCallback(async (choice: ScenarioChoice) => {
    setIsLoading(true);

    try {
      // 播放点击音效和触觉反馈
      audioManagerRef.current?.playSound('click', 0.3);
      HapticManager.lightVibration();
      
      // 检查选择条件
      if (choice.condition && !checkCondition(choice.condition)) {
        console.log('条件不满足:', choice.condition);
        setIsLoading(false);
        return;
      }

      // 检查选择要求
      if (choice.requirements && !checkRequirements(choice.requirements)) {
        console.log('要求不满足:', choice.requirements);
        setIsLoading(false);
        return;
      }

      // 如果有QTE，先触发QTE
      if (choice.qte) {
        console.log('触发QTE事件:', choice.qte);
        setQTEConfig(choice.qte);
        setChoiceEffects(choice.effects || null);
        setNextNodeAfterQTE(choice.nextNode || null);
        setShowQTE(true);
        audioManagerRef.current?.playSound('notification', 0.5);
        setIsLoading(false);
        return;
      }

      // 应用选择效果
      if (choice.effects) {
        console.log('应用选择效果:', choice.effects);
        try {
          const beforeStats = JSON.stringify(gameState.stats);
          
          // 应用基础效果
          const adjustedEffects = { ...choice.effects };
          const effectsLog = {
            originalEffects: choice.effects,
            playerSkills: gameState.player.skills,
            requirements: choice.requirements,
            adjustments: [] as string[]
          };

          // 根据玩家技能调整效果
          if (choice.requirements) {
            Object.entries(choice.requirements).forEach(([skill, required]) => {
              const playerSkill = gameState.player.skills[skill] || 0;
              const skillDifference = playerSkill - required;
              
              // 技能越高，正面效果越强，负面效果越弱
              const multiplier = Math.max(0.5, Math.min(1.5, 1 + (skillDifference * 0.01))); // 限制在0.5-1.5倍之间
              effectsLog.adjustments.push(`技能${skill}: ${playerSkill}/${required}, 倍数: ${multiplier.toFixed(2)}`);
              
              if (adjustedEffects.stats) {
                Object.keys(adjustedEffects.stats).forEach(key => {
                  const originalValue = adjustedEffects.stats![key as keyof typeof adjustedEffects.stats];
                  if (typeof originalValue === 'number') {
                    const newValue = Math.round(originalValue * multiplier);
                    adjustedEffects.stats![key as keyof typeof adjustedEffects.stats] = newValue;
                    effectsLog.adjustments.push(`${key}: ${originalValue} -> ${newValue}`);
                  }
                });
              }
            });
          }

          // 应用随机性（±10%）
          if (adjustedEffects.stats) {
            Object.keys(adjustedEffects.stats).forEach(key => {
              const originalValue = adjustedEffects.stats![key as keyof typeof adjustedEffects.stats];
              if (typeof originalValue === 'number') {
                const randomFactor = 0.9 + Math.random() * 0.2; // 0.9 到 1.1
                const newValue = Math.round(originalValue * randomFactor);
                adjustedEffects.stats![key as keyof typeof adjustedEffects.stats] = newValue;
                effectsLog.adjustments.push(`随机调整${key}: ${originalValue} -> ${newValue} (${randomFactor.toFixed(2)})`);
              }
            });
          }

          // 验证效果值的合理性
          if (adjustedEffects.stats) {
            Object.keys(adjustedEffects.stats).forEach(key => {
              const value = adjustedEffects.stats![key as keyof typeof adjustedEffects.stats];
              if (typeof value === 'number' && (isNaN(value) || !isFinite(value))) {
                console.error(`效果值异常: ${key} = ${value}，重置为0`);
                adjustedEffects.stats![key as keyof typeof adjustedEffects.stats] = 0;
              }
            });
          }

          effectsLog.adjustments.push(`最终效果: ${JSON.stringify(adjustedEffects)}`);
          console.log('应用选择效果详细日志', effectsLog);

          applyEffects(adjustedEffects);
          
          // 根据效果类型播放不同音效
          const hasPositiveEffect = adjustedEffects.stats && Object.values(adjustedEffects.stats).some(value => typeof value === 'number' && value > 0);
          const hasNegativeEffect = adjustedEffects.stats && Object.values(adjustedEffects.stats).some(value => typeof value === 'number' && value < 0);
          
          if (hasPositiveEffect && !hasNegativeEffect) {
            audioManagerRef.current?.playSound('success', 0.4);
            HapticManager.mediumVibration();
          } else if (hasNegativeEffect && !hasPositiveEffect) {
            audioManagerRef.current?.playSound('error', 0.4);
            HapticManager.strongVibration();
          }
          
          // 记录应用后的状态并检查成就
          setTimeout(() => {
            const afterStats = JSON.stringify(gameState.stats);
            console.log('选择效果应用成功:', {
              effects: adjustedEffects,
              beforeStats,
              afterStats
            });
            
            // 检查成就解锁
            checkAchievements();
          }, 100);
        } catch (error) {
          console.error('应用选择效果出错:', error);
          audioManagerRef.current?.playSound('error', 0.5);
        }
      }

      // 延迟一下以显示效果
      await new Promise(resolve => setTimeout(resolve, 500));

      // 跳转到下一个节点
      if (choice.nextNode) {
        console.log('跳转到下一节点:', choice.nextNode);
        setCurrentNodeId(choice.nextNode);
      } else {
        // 没有下一个节点，场景结束
        console.log('场景结束，无下一节点');
        handleScenarioEnd('choice_ending');
      }
    } catch (error) {
      console.error('Error handling choice:', error);
      audioManagerRef.current?.playSound('error', 0.5);
    } finally {
      setIsLoading(false);
    }
  }, [applyEffects, gameState.stats]);

  // 检查条件
  const checkCondition = (condition: any): boolean => {
    const { type, target, operator, value } = condition;
    let currentValue: any;

    switch (type) {
      case 'stat':
        currentValue = (gameState.stats as any)[target];
        break;
      case 'relationship':
        currentValue = gameState.stats.npcRelationships[target] || 0;
        break;
      case 'flag':
        currentValue = gameState.progress.storyFlags[target];
        break;
      default:
        return true;
    }

    switch (operator) {
      case '>':
        return currentValue > value;
      case '<':
        return currentValue < value;
      case '>=':
        return currentValue >= value;
      case '<=':
        return currentValue <= value;
      case '==':
        return currentValue === value;
      case '!=':
        return currentValue !== value;
      default:
        return true;
    }
  };

  // 检查要求
  const checkRequirements = (requirements: Record<string, number>): boolean => {
    return Object.entries(requirements).every(([skill, requiredLevel]) => {
      const currentLevel = gameState.player.skills[skill] || 0;
      return currentLevel >= requiredLevel;
    });
  };

  // QTE完成处理
  const handleQTEComplete = useCallback((success: boolean, result: QTEResult) => {
    console.log('QTE完成:', { success, result });
    const { accuracy } = result;
    
    setShowQTE(false);

    // 根据QTE结果应用效果和反馈
    if (success) {
      // QTE成功的效果
      if (qteConfig?.successEffects) {
        const effects = qteConfig.successEffects;
        
        // 根据准确度调整效果强度
        if (accuracy !== undefined) {
          const adjustedEffects = { ...effects };
          
          // 根据准确度调整数值效果
          if (adjustedEffects.stats) {
            Object.keys(adjustedEffects.stats).forEach(key => {
              const originalValue = adjustedEffects.stats![key as keyof typeof adjustedEffects.stats];
              if (typeof originalValue === 'number') {
                // 准确度越高，效果越好
                const multiplier = 0.5 + (accuracy / 100) * 0.5; // 将百分比转换为0-1范围
                (adjustedEffects.stats as any)[key] = Math.round(originalValue * multiplier);
              }
            });
          }
          
          applyEffects(adjustedEffects);
        } else {
          applyEffects(effects);
        }
      }
      
      // 成功反馈
      audioManagerRef.current?.playSound('success', 0.6);
      HapticManager.mediumVibration();
      message.success(`QTE成功！得分: ${result.extraData?.score || 0}${accuracy ? ` (准确度: ${Math.round(accuracy)}%)` : ''}`);
    } else {
      // QTE失败的效果
      if (qteConfig?.failureEffects) {
        const effects = qteConfig.failureEffects;
        
        // 失败时也可以根据准确度调整效果
        if (accuracy !== undefined) {
          const adjustedEffects = { ...effects };
          
          if (adjustedEffects.stats) {
            Object.keys(adjustedEffects.stats).forEach(key => {
              const originalValue = adjustedEffects.stats![key as keyof typeof adjustedEffects.stats];
              if (typeof originalValue === 'number') {
                const multiplier = 0.3 + accuracy * 0.2;
                (adjustedEffects.stats as any)[key] = Math.round(originalValue * multiplier);
              }
            });
          }
          
          applyEffects(adjustedEffects);
        } else {
          applyEffects(effects);
        }
      }
      
      // 失败反馈
      audioManagerRef.current?.playSound('error', 0.6);
      HapticManager.strongVibration();
      message.error(`QTE失败，得分: ${result.extraData?.score || 0}`);
    }

    // 应用选择效果
    if (choiceEffects) {
      applyEffects(choiceEffects);
    }

    // 跳转到下一个节点
    const nextNode = success ? 
      (qteConfig?.successNode || nextNodeAfterQTE) : 
      (qteConfig?.failureNode || nextNodeAfterQTE);

    if (nextNode) {
      setTimeout(() => {
        setCurrentNodeId(nextNode);
      }, 1500); // 延迟切换，让用户看到结果
    } else {
      setTimeout(() => {
        handleScenarioEnd(success ? 'qte_success_ending' : 'qte_failure_ending');
      }, 1500);
    }

    // 清理QTE状态
    setQTEConfig(null);
    setChoiceEffects(null);
    setNextNodeAfterQTE(null);
  }, [qteConfig, choiceEffects, nextNodeAfterQTE, applyEffects]);

  // 检查成就解锁条件
  const checkAchievements = useCallback(() => {
    
    // 定义成就检查规则
    const achievementRules = [
      {
        id: 'first_day',
        condition: () => gameState.progress.completedScenarios.length >= 1,
        name: '初来乍到'
      },
      {
        id: 'tenant_whisperer',
        condition: () => {
          const relationships = gameState.stats.npcRelationships;
          const goodRelationships = Object.values(relationships).filter(rel => rel >= 80).length;
          return goodRelationships >= 10;
        },
        name: '租户之友'
      },
      {
        id: 'money_master',
        condition: () => gameState.stats.income >= 1000000,
        name: '理财高手'
      },
      {
        id: 'crisis_manager',
        condition: () => {
          const emergencyCount = gameState.progress.storyFlags['emergency_handled'] || 0;
          return emergencyCount >= 50;
        },
        name: '危机处理专家'
      },
      {
        id: 'tech_wizard',
        condition: () => {
          const techFixCount = gameState.progress.storyFlags['tech_fixes'] || 0;
          return techFixCount >= 100;
        },
        name: '技术大师'
      },
      {
        id: 'social_butterfly',
        condition: () => {
          const relationships = gameState.stats.npcRelationships;
          const totalRelationships = Object.keys(relationships).length;
          return totalRelationships >= 50;
        },
        name: '社交达人'
      },
      {
        id: 'perfectionist',
        condition: () => gameState.stats.satisfaction >= 95,
        name: '完美主义者'
      },
      {
        id: 'stress_master',
        condition: () => gameState.stats.stress <= 10 && gameState.progress.completedScenarios.length >= 20,
        name: '压力管理大师'
      },
      {
        id: 'reputation_king',
        condition: () => gameState.stats.reputation >= 90,
        name: '声誉之王'
      },
      {
        id: 'team_builder',
        condition: () => gameState.stats.morale >= 85,
        name: '团队建设者'
      }
    ];
    
    // 检查每个成就
     achievementRules.forEach(rule => {
       if (!gameState.player.achievements.includes(rule.id) && rule.condition()) {
         console.log(`解锁成就: ${rule.name} (${rule.id})`);
         addAchievement(rule.id);
         
         // 播放成就解锁音效和反馈
         audioManagerRef.current?.playSound('success', 0.8);
         HapticManager.strongVibration();
         message.success(`🏆 成就解锁: ${rule.name}!`, 3);
       }
     });
   }, [gameState, addAchievement]);

  // 场景结束处理
  const handleScenarioEnd = (endingType: string) => {
    // 检查成就
    checkAchievements();
    
    if (onScenarioComplete) {
      onScenarioComplete(scenario.id, endingType);
    }
  };

  // 检查是否是结束节点
  const isEndingNode = currentNode?.type === 'ending' || !currentNode?.choices?.length;

  if (!currentNode) {
    return (
      <Alert
        message="场景错误"
        description={`找不到节点: ${currentNodeId}`}
        type="error"
        showIcon
      />
    );
  }

  return (
    <div className="scenario-engine">
      {/* QTE容器 */}
      {showQTE && qteConfig && (
        <QTEContainer
          config={qteConfig}
          onComplete={handleQTEComplete}
          onExit={() => setShowQTE(false)}
        />
      )}

      {/* 场景内容 */}
      <Card 
        className="scenario-content"
        title={
          <div className="scenario-header">
            <Title level={3}>{scenario.title}</Title>
            <Space>
              <Button 
                type="text" 
                icon={soundEnabled ? <SoundOutlined /> : <MutedOutlined />}
                onClick={() => {
                  const newSoundEnabled = !soundEnabled;
                  setSoundEnabled(newSoundEnabled);
                  audioManagerRef.current?.setMuted(!newSoundEnabled);
                  
                  // 播放确认音效（如果不是静音状态）
                  if (newSoundEnabled) {
                    audioManagerRef.current?.playSound('click', 0.3);
                  }
                  
                  message.info(newSoundEnabled ? '音效已开启' : '音效已静音');
                }}
              />
              {onExit && (
                <Button onClick={onExit}>退出场景</Button>
              )}
            </Space>
          </div>
        }
        loading={isLoading}
      >
        {/* 场景图片 */}
        {currentNode.image && (
          <div className="scenario-image">
            <Image
              src={currentNode.image}
              alt="场景图片"
              width="100%"
              height={300}
              style={{ objectFit: 'cover' }}
              fallback="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAMIAAADDCAYAAADQvc6UAAABRWlDQ1BJQ0MgUHJvZmlsZQAAKJFjYGASSSwoyGFhYGDIzSspCnJ3UoiIjFJgf8LAwSDCIMogwMCcmFxc4BgQ4ANUwgCjUcG3awyMIPqyLsis7PPOq3QdDFcvjV3jOD1boQVTPQrgSkktTgbSf4A4LbmgqISBgTEFyFYuLykAsTuAbJEioKOA7DkgdjqEvQHEToKwj4DVhAQ5A9k3gGyB5IxEoBmML4BsnSQk8XQkNtReEOBxcfXxUQg1Mjc0dyHgXNJBSWpFCYh2zi+oLMpMzyhRcASGUqqCZ16yno6CkYGRAQMDKMwhqj/fAIcloxgHQqxAjIHBEugw5sUIsSQpBobtQPdLciLEVJYzMPBHMDBsayhILEqEO4DxG0txmrERhM29nYGBddr//5/DGRjYNRkY/l7////39v///y4Dmn+LgeHANwDrkl1AuO+pmgAAADhlWElmTU0AKgAAAAgAAYdpAAQAAAABAAAAGgAAAAAAAqACAAQAAAABAAAAwqADAAQAAAABAAAAwwAAAAD9b/HnAAAHlklEQVR4Ae3dP3Ik1RnG4W+FgYxN"
            />
          </div>
        )}

        {/* 场景文本 */}
        <div className="scenario-text">
          <Paragraph style={{ fontSize: '16px', lineHeight: '1.6' }}>
            {currentNode.text}
          </Paragraph>
        </div>

        {/* 选择按钮 */}
        {!isEndingNode && currentNode.choices && (
          <div className="scenario-choices">
            <Space direction="vertical" style={{ width: '100%' }}>
              {currentNode.choices.map((choice, index) => {
                const canSelect = (!choice.condition || checkCondition(choice.condition)) &&
                                (!choice.requirements || checkRequirements(choice.requirements));
                
                return (
                  <Button
                    key={index}
                    type="default"
                    size="large"
                    disabled={!canSelect}
                    onClick={() => handleChoiceClick(choice)}
                    style={{ 
                      width: '100%', 
                      textAlign: 'left',
                      height: 'auto',
                      padding: '12px 16px',
                      whiteSpace: 'normal'
                    }}
                  >
                    {choice.text}
                    {choice.requirements && (
                      <div style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>
                        需要技能: {Object.entries(choice.requirements)
                          .map(([skill, level]) => `${skill} ${level}`)
                          .join(', ')}
                      </div>
                    )}
                  </Button>
                );
              })}
            </Space>
          </div>
        )}

        {/* 结束节点 */}
        {isEndingNode && (
          <div className="scenario-ending">
            <Space>
              <Button type="primary" onClick={() => handleScenarioEnd('normal_ending')}>
                完成场景
              </Button>
              {onExit && (
                <Button onClick={onExit}>
                  返回
                </Button>
              )}
            </Space>
          </div>
        )}
      </Card>
    </div>
  );
}