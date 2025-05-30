/**
 * 物业管理模拟器 - 游戏统计面板组件
 * 显示玩家的各项统计数据、技能等级、关系状态等
 */

// React components are used via JSX
import { Card, Progress, Row, Col, Statistic, Tag, Tooltip, Space, Avatar } from 'antd';
import { 
  TrophyOutlined, 
  HeartOutlined, 
  DollarOutlined, 
  HomeOutlined,
  UserOutlined,
  StarOutlined,
  ThunderboltOutlined,
  BulbOutlined
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
}

export default function GameStatsPanel({ 
  detailed = true, 
  size = 'default',
  // collapsible = false // 暂时未使用 
}: GameStatsPanelProps) {
  const { gameState } = useGame();
  const { player, stats } = gameState;

  // 计算总体评分
  const calculateOverallRating = () => {
    const skillAverage = Object.values(player.skills).reduce((sum, skill) => sum + skill, 0) / Object.keys(player.skills).length;
    const relationshipAverage = Object.values(stats.npcRelationships).reduce((sum, rel) => sum + rel, 0) / Math.max(Object.keys(stats.npcRelationships).length, 1);
    const financialScore = Math.min(100, (stats.financialIncome / 10000) * 100); // 假设10000为满分
    
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

  return (
    <div className={`game-stats-panel ${size}`}>
      {/* 玩家基本信息 */}
      <Card 
        title={
          <Space>
            <Avatar icon={<UserOutlined />} />
            <span>{player.name}</span>
            <Tag color="blue">等级 {player.level}</Tag>
          </Space>
        }
        // size={size} // Card组件不支持此size值
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
              value={player.experience}
              suffix={`/ ${player.level * 1000}`}
              prefix={<TrophyOutlined />}
            />
            <Progress 
              percent={(player.experience / (player.level * 1000)) * 100} 
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
              value={stats.financialIncome}
              prefix={<DollarOutlined />}
              precision={0}
              valueStyle={{ color: '#3f8600' }}
            />
          </Col>
          <Col span={8}>
            <Statistic
              title="声誉"
              value={stats.propertyReputation}
              suffix="/ 100"
              prefix={<HeartOutlined />}
              valueStyle={{ color: stats.propertyReputation >= 70 ? '#3f8600' : '#faad14' }}
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
                value={stats.managerStress}
                suffix="/ 100"
                valueStyle={{ color: stats.managerStress >= 70 ? '#cf1322' : stats.managerStress >= 40 ? '#faad14' : '#3f8600' }}
              />
              <Progress 
                percent={stats.managerStress} 
                size="small" 
                status={stats.managerStress >= 70 ? 'exception' : 'normal'}
                strokeColor={stats.managerStress >= 70 ? '#ff4d4f' : '#52c41a'}
              />
            </Col>
            <Col span={8}>
              <Statistic
                title="能量值"
                value={100 - stats.managerStress} // 用压力反推能量
                suffix="/ 100"
                prefix={<ThunderboltOutlined />}
                valueStyle={{ color: (100 - stats.managerStress) >= 70 ? '#3f8600' : (100 - stats.managerStress) >= 30 ? '#faad14' : '#cf1322' }}
              />
              <Progress 
                percent={100 - stats.managerStress} 
                size="small" 
                status={(100 - stats.managerStress) <= 30 ? 'exception' : 'normal'}
              />
            </Col>
            <Col span={8}>
              <Statistic
                title="满意度"
                value={stats.tenantSatisfaction}
                suffix="/ 100"
                valueStyle={{ color: stats.tenantSatisfaction >= 70 ? '#3f8600' : '#faad14' }}
              />
              <Progress 
                percent={stats.tenantSatisfaction} 
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
            {Object.entries(player.skills).map(([skillName, level]) => (
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
      {detailed && Object.keys(stats.npcRelationships).length > 0 && (
        <Card title="人际关系" className="relationships-card">
          <Row gutter={[16, 8]}>
            {Object.entries(stats.npcRelationships).map(([npcName, relationship]) => (
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
      {detailed && gameState.player.achievements.length > 0 && (
        <Card title="最近成就" className="achievements-card">
          <Space wrap>
            {gameState.player.achievements.slice(-6).map((achievement, index) => (
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
      {(100 - stats.managerStress) <= 20 && (
        <Card className="warning-card">
          <Space>
            <BulbOutlined style={{ color: '#faad14' }} />
            <span>能量值过低，建议休息恢复体力</span>
          </Space>
        </Card>
      )}
      
      {stats.managerStress >= 80 && (
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