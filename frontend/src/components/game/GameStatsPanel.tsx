/**
 * 物业管理模拟器 - 游戏统计面板组件
 * 显示玩家的各项统计数据、技能等级、关系状态等
 */

import { useState, useEffect } from 'react';
import { Card, Progress, Row, Col, Statistic, Tag, Tooltip, Space, Avatar, notification } from 'antd';
import { 
  TrophyOutlined, 
  HeartOutlined, 
  DollarOutlined, 
  HomeOutlined,
  UserOutlined,
  StarOutlined,
  ThunderboltOutlined,
  BulbOutlined,
  SyncOutlined
} from '@ant-design/icons';
import { useGame } from '../../contexts/GameContext';
import './GameStatsPanel.css';

interface GameStatsPanelProps {
  /** 是否显示详细信息 */
  detailed?: boolean;
  /** 面板大小 */
  size?: 'small' | 'default' | 'large';
  /** 是否可折叠 */
  collapsible?: boolean;
  /** 刷新间隔（毫秒） */
  refreshInterval?: number;
}

export default function GameStatsPanel({ 
  detailed = true, 
  size = 'default',
  // collapsible = false // 暂时未使用
  refreshInterval = 2000
}: GameStatsPanelProps) {
  const { gameState } = useGame();
  const [localGameState, setLocalGameState] = useState(gameState);
  const [lastUpdate, setLastUpdate] = useState(Date.now());
  const [isStale, setIsStale] = useState(false);

  // 检测游戏状态变化并更新本地状态
  useEffect(() => {
    // 添加深度比较函数
    const isStatsDifferent = (oldStats: any, newStats: any) => {
      const oldKeys = Object.keys(oldStats);
      const newKeys = Object.keys(newStats);
      
      // 检查键数量是否相同
      if (oldKeys.length !== newKeys.length) return true;
      
      // 检查值是否相同
      for (const key of oldKeys) {
        if (typeof oldStats[key] === 'object' && oldStats[key] !== null) {
          // 递归检查嵌套对象
          if (isStatsDifferent(oldStats[key], newStats[key])) return true;
        } else if (oldStats[key] !== newStats[key]) {
          // 简单值比较
          return true;
        }
      }
      
      return false;
    };

    // 检查状态是否有变化
    if (isStatsDifferent(localGameState.stats, gameState.stats) || 
        isStatsDifferent(localGameState.player, gameState.player)) {
      console.log('GameStatsPanel: 检测到状态变化，更新面板', {
        old: localGameState,
        new: gameState
      });
      setLocalGameState(gameState);
      setLastUpdate(Date.now());
      setIsStale(false);
      
      // 当统计数据发生重大变化时显示通知
      const significantChanges = [];
      
      // 检查财务变化
      if (Math.abs(localGameState.stats.financialIncome - gameState.stats.financialIncome) > 1000) {
        significantChanges.push(`资金: ${localGameState.stats.financialIncome} → ${gameState.stats.financialIncome}`);
      }
      
      // 检查声誉变化
      if (Math.abs(localGameState.stats.propertyReputation - gameState.stats.propertyReputation) >= 5) {
        significantChanges.push(`声誉: ${localGameState.stats.propertyReputation} → ${gameState.stats.propertyReputation}`);
      }
      
      // 检查满意度变化
      if (Math.abs(localGameState.stats.tenantSatisfaction - gameState.stats.tenantSatisfaction) >= 5) {
        significantChanges.push(`满意度: ${localGameState.stats.tenantSatisfaction} → ${gameState.stats.tenantSatisfaction}`);
      }
      
      // 显示通知
      if (significantChanges.length > 0) {
        notification.info({
          message: '统计数据更新',
          description: significantChanges.join('，'),
          duration: 3
        });
      }
    }
  }, [gameState]);
  
  // 定期检查数据是否过期
  useEffect(() => {
    const checkInterval = setInterval(() => {
      const now = Date.now();
      if (now - lastUpdate > refreshInterval * 2) {
        setIsStale(true);
      }
    }, refreshInterval);
    
    return () => clearInterval(checkInterval);
  }, [lastUpdate, refreshInterval]);

  // 计算总体评分
  const calculateOverallRating = () => {
    const skillAverage = Object.values(localGameState.player.skills).reduce((sum, skill) => sum + skill, 0) / 
      Math.max(Object.keys(localGameState.player.skills).length, 1);
    const relationshipAverage = Object.values(localGameState.stats.npcRelationships).reduce((sum, rel) => sum + rel, 0) / 
      Math.max(Object.keys(localGameState.stats.npcRelationships).length, 1);
    const financialScore = Math.min(100, (localGameState.stats.financialIncome / 10000) * 100); // 假设10000为满分
    
    return Math.round((skillAverage + relationshipAverage + financialScore) / 3);
  };

  // 获取技能等级描述
  const getSkillLevelText = (level: number): string => {
    if (level >= 90) return '专家';
    if (level >= 70) return '熟练';
    if (level >= 50) return '中级';
    if (level >= 30) return '初级';
    return '新手';
  };

  // 获取关系状态描述
  const getRelationshipText = (level: number): string => {
    if (level >= 80) return '密友';
    if (level >= 60) return '朋友';
    if (level >= 40) return '熟人';
    if (level >= 20) return '认识';
    if (level >= 0) return '陌生';
    return '敌对';
  };

  // 获取关系状态颜色
  const getRelationshipColor = (level: number): string => {
    if (level >= 80) return '#52c41a';
    if (level >= 60) return '#1890ff';
    if (level >= 40) return '#faad14';
    if (level >= 20) return '#fa8c16';
    if (level >= 0) return '#d9d9d9';
    return '#ff4d4f';
  };

  const overallRating = calculateOverallRating();

  // 强制刷新面板
  const forceRefresh = () => {
    setLocalGameState({...gameState});
    setLastUpdate(Date.now());
    setIsStale(false);
    console.log('GameStatsPanel: 手动刷新面板', gameState);
  };

  return (
    <div className={`game-stats-panel ${size} ${isStale ? 'stale-data' : ''}`}>
      {/* 刷新按钮 */}
      {isStale && (
        <div className="refresh-indicator">
          <SyncOutlined spin onClick={forceRefresh} />
          <span>数据可能已过期，点击刷新</span>
        </div>
      )}
      
      {/* 玩家基本信息 */}
      <Card 
        title={
          <Space>
            <Avatar icon={<UserOutlined />} />
            <span>{localGameState.player.name}</span>
            <Tag color="blue">等级 {localGameState.player.level}</Tag>
          </Space>
        }
        extra={<SyncOutlined onClick={forceRefresh} />}
        className="player-info-card"
      >
        <Row gutter={[16, 16]}>
          <Col span={12}>
            <Statistic
              title="总体评分"
              value={overallRating}
              suffix="/ 100"
              prefix={<StarOutlined />}
              valueStyle={{ color: overallRating >= 70 ? '#3f8600' : overallRating >= 40 ? '#faad14' : '#cf1322' }}
            />
          </Col>
          <Col span={12}>
            <Statistic
              title="经验值"
              value={localGameState.player.experience}
              suffix={`/ ${localGameState.player.level * 1000}`}
              prefix={<TrophyOutlined />}
            />
            <Progress 
              percent={(localGameState.player.experience / (localGameState.player.level * 1000)) * 100} 
              size="small" 
              showInfo={false}
              strokeColor="#1890ff"
            />
          </Col>
        </Row>
      </Card>

      {/* 核心统计数据 */}
      <Card title="核心数据" className="core-stats-card">
        <Row gutter={[16, 16]}>
          <Col span={8}>
            <Statistic
              title="资金"
              value={localGameState.stats.financialIncome}
              prefix={<DollarOutlined />}
              precision={0}
              valueStyle={{ color: '#3f8600' }}
            />
          </Col>
          <Col span={8}>
            <Statistic
              title="声誉"
              value={localGameState.stats.propertyReputation}
              suffix="/ 100"
              prefix={<HeartOutlined />}
              valueStyle={{ color: localGameState.stats.propertyReputation >= 70 ? '#3f8600' : '#faad14' }}
            />
          </Col>
          <Col span={8}>
            <Statistic
              title="管理物业"
              value={1} // 暂时硬编码，因为propertiesManaged不存在
              prefix={<HomeOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Col>
        </Row>
        
        {detailed && (
          <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
            <Col span={8}>
              <Statistic
                title="压力值"
                value={localGameState.stats.managerStress}
                suffix="/ 100"
                valueStyle={{ color: localGameState.stats.managerStress >= 70 ? '#cf1322' : localGameState.stats.managerStress >= 40 ? '#faad14' : '#3f8600' }}
              />
              <Progress 
                percent={localGameState.stats.managerStress} 
                size="small" 
                status={localGameState.stats.managerStress >= 70 ? 'exception' : 'normal'}
                strokeColor={localGameState.stats.managerStress >= 70 ? '#ff4d4f' : '#52c41a'}
              />
            </Col>
            <Col span={8}>
              <Statistic
                title="能量值"
                value={100 - localGameState.stats.managerStress} // 用压力反推能量
                suffix="/ 100"
                prefix={<ThunderboltOutlined />}
                valueStyle={{ color: (100 - localGameState.stats.managerStress) >= 70 ? '#3f8600' : (100 - localGameState.stats.managerStress) >= 30 ? '#faad14' : '#cf1322' }}
              />
              <Progress 
                percent={100 - localGameState.stats.managerStress} 
                size="small" 
                status={(100 - localGameState.stats.managerStress) <= 30 ? 'exception' : 'normal'}
              />
            </Col>
            <Col span={8}>
              <Statistic
                title="满意度"
                value={localGameState.stats.tenantSatisfaction}
                suffix="/ 100"
                valueStyle={{ color: localGameState.stats.tenantSatisfaction >= 70 ? '#3f8600' : '#faad14' }}
              />
              <Progress 
                percent={localGameState.stats.tenantSatisfaction} 
                size="small" 
                strokeColor="#52c41a"
              />
            </Col>
          </Row>
        )}
      </Card>

      {/* 技能面板 */}
      {detailed && (
        <Card title="技能等级" className="skills-card">
          <Row gutter={[16, 8]}>
            {Object.entries(localGameState.player.skills).map(([skillName, level]) => (
              <Col span={12} key={skillName}>
                <div className="skill-item">
                  <div className="skill-header">
                    <span className="skill-name">{skillName}</span>
                    <Tag color={level >= 70 ? 'green' : level >= 40 ? 'orange' : 'default'}>
                      {getSkillLevelText(level)}
                    </Tag>
                  </div>
                  <Tooltip title={`${skillName}: ${level}/100`}>
                    <Progress 
                      percent={level} 
                      size="small"
                      strokeColor={{
                        '0%': '#ff4d4f',
                        '50%': '#faad14',
                        '100%': '#52c41a',
                      }}
                    />
                  </Tooltip>
                </div>
              </Col>
            ))}
          </Row>
        </Card>
      )}

      {/* NPC关系面板 */}
      {detailed && Object.keys(localGameState.stats.npcRelationships).length > 0 && (
        <Card title="人际关系" className="relationships-card">
          <Row gutter={[16, 8]}>
            {Object.entries(localGameState.stats.npcRelationships).map(([npcName, relationship]) => (
              <Col span={12} key={npcName}>
                <div className="relationship-item">
                  <div className="relationship-header">
                    <span className="npc-name">{npcName}</span>
                    <Tag color={getRelationshipColor(relationship)}>
                      {getRelationshipText(relationship)}
                    </Tag>
                  </div>
                  <Tooltip title={`与${npcName}的关系: ${relationship}/100`}>
                    <Progress 
                      percent={Math.max(0, relationship)} 
                      size="small"
                      strokeColor={getRelationshipColor(relationship)}
                    />
                  </Tooltip>
                </div>
              </Col>
            ))}
          </Row>
        </Card>
      )}

      {/* 成就面板 */}
      {detailed && localGameState.player.achievements.length > 0 && (
        <Card title="最近成就" className="achievements-card">
          <Space wrap>
            {localGameState.player.achievements.slice(-6).map((achievement, index) => (
              <Tooltip key={index} title={achievement}>
                <Tag 
                  icon={<TrophyOutlined />} 
                  color="gold"
                  className="achievement-tag"
                >
                  {achievement}
                </Tag>
              </Tooltip>
            ))}
          </Space>
        </Card>
      )}

      {/* 游戏提示 */}
      {(100 - localGameState.stats.managerStress) <= 20 && (
        <Card className="warning-card">
          <Space>
            <BulbOutlined style={{ color: '#faad14' }} />
            <span>能量值过低，建议休息恢复体力</span>
          </Space>
        </Card>
      )}
      
      {localGameState.stats.managerStress >= 80 && (
        <Card className="warning-card">
          <Space>
            <BulbOutlined style={{ color: '#ff4d4f' }} />
            <span>压力值过高，建议进行放松活动</span>
          </Space>
        </Card>
      )}
    </div>
  );
}