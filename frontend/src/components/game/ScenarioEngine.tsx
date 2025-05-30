/**
 * 物业管理模拟器 - 场景引擎组件
 * 负责渲染场景内容、处理用户选择、管理场景流程
 */

import { useState, useEffect, useCallback } from 'react';
import { Card, Button, Typography, Space, Image, Alert } from 'antd';
import { SoundOutlined, MutedOutlined } from '@ant-design/icons';
import { Scenario, ScenarioNode, ScenarioChoice, GameEffect } from '../../types/game';
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

  // 应用节点的自动效果
  useEffect(() => {
    if (currentNode?.autoEffects) {
      applyEffects(currentNode.autoEffects);
    }
  }, [currentNode, applyEffects]);

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
        setIsLoading(false);
        return;
      }

      // 检查选择要求
      if (choice.requirements && !checkRequirements(choice.requirements)) {
        setIsLoading(false);
        return;
      }

      // 如果有QTE，先触发QTE
      if (choice.qte) {
        setQTEConfig(choice.qte);
        setChoiceEffects(choice.effects || null);
        setNextNodeAfterQTE(choice.nextNode || null);
        setShowQTE(true);
        setIsLoading(false);
        return;
      }

      // 应用选择效果
      if (choice.effects) {
        applyEffects(choice.effects);
      }

      // 延迟一下以显示效果
      await new Promise(resolve => setTimeout(resolve, 500));

      // 跳转到下一个节点
      if (choice.nextNode) {
        setCurrentNodeId(choice.nextNode);
      } else {
        // 没有下一个节点，场景结束
        handleScenarioEnd('choice_ending');
      }
    } catch (error) {
      console.error('Error handling choice:', error);
    } finally {
      setIsLoading(false);
    }
  }, [applyEffects]);

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
  const handleQTEComplete = useCallback((success: boolean, _result: any) => {
    setShowQTE(false);

    // 应用QTE结果效果
    if (success && qteConfig?.successEffects) {
      applyEffects(qteConfig.successEffects);
    } else if (!success && qteConfig?.failureEffects) {
      applyEffects(qteConfig.failureEffects);
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
      setCurrentNodeId(nextNode);
    } else {
      handleScenarioEnd(success ? 'qte_success_ending' : 'qte_failure_ending');
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