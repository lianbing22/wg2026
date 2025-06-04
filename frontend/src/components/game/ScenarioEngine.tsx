/**
 * 物业管理模拟器 - 场景引擎组件
 * 负责渲染场景内容、处理用户选择、管理场景流程
 */

import { useState, useEffect, useCallback } from 'react';
import { Card, Button, Typography, Space, Image, Alert } from 'antd';
import { SoundOutlined, MutedOutlined } from '@ant-design/icons';
import { Scenario, ScenarioNode, ScenarioChoice, GameEffect, QTEResult } from '../../types/game';
import { useGame } from '../../contexts/GameContext';
import QTEContainer from './QTEContainer';
import './ScenarioEngine.css';

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

  const currentNode = nodes[currentNodeId];

  // 更新游戏状态中的当前场景和节点
  useEffect(() => {
    setCurrentScenario(scenario.id, currentNodeId);
  }, [scenario.id, currentNodeId, setCurrentScenario]);

  // 应用节点的自动效果 - 使用节点ID避免无限循环
  useEffect(() => {
    if (currentNode?.autoEffects) {
      console.log('Applying auto effects for node:', currentNodeId, currentNode.autoEffects);
      try {
        // 记录应用前的状态
        const beforeStats = JSON.stringify(gameState.stats);
        
        // 应用效果
        applyEffects(currentNode.autoEffects);
        
        // 记录应用后的状态
        setTimeout(() => {
          const afterStats = JSON.stringify(gameState.stats);
          console.log('Auto effects applied successfully:', {
            nodeId: currentNodeId,
            effects: currentNode.autoEffects,
            beforeStats,
            afterStats,
            changes: Object.keys(currentNode.autoEffects || {}).map(key => ({
              stat: key,
              value: (currentNode.autoEffects as any)[key]
            }))
          });
        }, 100); // 等待状态更新
      } catch (error) {
        console.error('Error applying auto effects:', {
          nodeId: currentNodeId,
          effects: currentNode.autoEffects,
          error
        });
      }
    }
  }, [currentNodeId, applyEffects, gameState.stats]); // 添加gameState.stats以监控状态变化

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
        setIsLoading(false);
        return;
      }

      // 应用选择效果
      if (choice.effects) {
        console.log('应用选择效果:', choice.effects);
        try {
          const beforeStats = JSON.stringify(gameState.stats);
          applyEffects(choice.effects);
          
          // 记录应用后的状态
          setTimeout(() => {
            const afterStats = JSON.stringify(gameState.stats);
            console.log('选择效果应用成功:', {
              effects: choice.effects,
              beforeStats,
              afterStats
            });
          }, 100);
        } catch (error) {
          console.error('应用选择效果出错:', error);
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

    // 应用QTE结果效果
    if (success && qteConfig?.successEffects) {
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
    } else if (!success && qteConfig?.failureEffects) {
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

    // 应用选择效果
    if (choiceEffects) {
      applyEffects(choiceEffects);
    }

    // 显示QTE结果反馈
    const resultMessage = success 
      ? `QTE成功！得分: ${result.extraData?.score || 0}${accuracy ? ` (准确度: ${Math.round(accuracy)}%)` : ''}` 
      : `QTE失败，得分: ${result.extraData?.score || 0}`;
    
    console.log(resultMessage);

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

  // 场景结束处理
  const handleScenarioEnd = (endingType: string) => {
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
                onClick={() => setSoundEnabled(!soundEnabled)}
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