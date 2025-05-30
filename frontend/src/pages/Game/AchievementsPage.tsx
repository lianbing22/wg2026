/**
 * 物业管理模拟器 - 成就页面
 * 展示玩家的成就、进度和统计信息
 */

import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Card,
  Row,
  Col,
  Typography,
  Progress,
  Tag,
  Button,
  Tabs,
  Statistic,
  Empty,
  Badge,

  Input
} from 'antd';
import {
  TrophyOutlined,
  StarOutlined,
  CrownOutlined,
  FireOutlined,
  SearchOutlined,
  ArrowLeftOutlined,
  LockOutlined,
  CheckCircleOutlined
} from '@ant-design/icons';
import { useGame } from '../../contexts/GameContext';
import './AchievementsPage.css';

const { Title, Text, Paragraph } = Typography;
const { TabPane } = Tabs;
const { Search } = Input;

interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: 'management' | 'financial' | 'social' | 'technical' | 'special';
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  points: number;
  unlocked: boolean;
  unlockedAt?: string;
  progress?: {
    current: number;
    total: number;
  };
  requirements: string[];
  reward?: {
    type: 'money' | 'skill' | 'unlock';
    value: number | string;
  };
}

const mockAchievements: Achievement[] = [
  {
    id: 'first_day',
    name: '初来乍到',
    description: '完成第一天的工作',
    icon: '🌟',
    category: 'management',
    rarity: 'common',
    points: 10,
    unlocked: true,
    unlockedAt: '2024-01-15T10:30:00Z',
    requirements: ['完成教程场景'],
    reward: { type: 'money', value: 500 }
  },
  {
    id: 'tenant_whisperer',
    name: '租户之友',
    description: '与10位租户建立良好关系',
    icon: '🤝',
    category: 'social',
    rarity: 'rare',
    points: 25,
    unlocked: true,
    unlockedAt: '2024-01-20T14:15:00Z',
    requirements: ['与10位租户关系达到80+'],
    reward: { type: 'skill', value: 'communication +2' }
  },
  {
    id: 'money_master',
    name: '理财高手',
    description: '累计收入达到100万元',
    icon: '💰',
    category: 'financial',
    rarity: 'epic',
    points: 50,
    unlocked: false,
    progress: { current: 450000, total: 1000000 },
    requirements: ['累计收入1,000,000元'],
    reward: { type: 'unlock', value: '高级财务工具' }
  },
  {
    id: 'crisis_manager',
    name: '危机处理专家',
    description: '成功处理50次紧急事件',
    icon: '🚨',
    category: 'management',
    rarity: 'rare',
    points: 30,
    unlocked: false,
    progress: { current: 23, total: 50 },
    requirements: ['处理50次紧急事件'],
    reward: { type: 'skill', value: 'management +3' }
  },
  {
    id: 'tech_wizard',
    name: '技术大师',
    description: '修复100个技术问题',
    icon: '🔧',
    category: 'technical',
    rarity: 'epic',
    points: 40,
    unlocked: false,
    progress: { current: 67, total: 100 },
    requirements: ['修复100个技术问题'],
    reward: { type: 'unlock', value: '高级维修工具' }
  },
  {
    id: 'legendary_manager',
    name: '传奇经理',
    description: '达到最高管理等级',
    icon: '👑',
    category: 'special',
    rarity: 'legendary',
    points: 100,
    unlocked: false,
    requirements: ['达到等级50', '完成所有主线任务'],
    reward: { type: 'unlock', value: '传奇称号' }
  }
];

const categoryNames = {
  management: '管理',
  financial: '财务',
  social: '社交',
  technical: '技术',
  special: '特殊'
};

const rarityColors = {
  common: '#52c41a',
  rare: '#1890ff',
  epic: '#722ed1',
  legendary: '#fa8c16'
};

const rarityNames = {
  common: '普通',
  rare: '稀有',
  epic: '史诗',
  legendary: '传奇'
};

export default function AchievementsPage() {
  const navigate = useNavigate();
  useGame(); // 暂时不使用gameState
  const [activeTab, setActiveTab] = useState('all');
  const [searchText, setSearchText] = useState('');

  const filteredAchievements = useMemo(() => {
    let filtered = mockAchievements;

    // 按分类筛选
    if (activeTab !== 'all') {
      if (activeTab === 'unlocked') {
        filtered = filtered.filter(achievement => achievement.unlocked);
      } else if (activeTab === 'locked') {
        filtered = filtered.filter(achievement => !achievement.unlocked);
      } else {
        filtered = filtered.filter(achievement => achievement.category === activeTab);
      }
    }

    // 按搜索文本筛选
    if (searchText) {
      filtered = filtered.filter(achievement =>
        achievement.name.toLowerCase().includes(searchText.toLowerCase()) ||
        achievement.description.toLowerCase().includes(searchText.toLowerCase())
      );
    }

    return filtered;
  }, [activeTab, searchText]);

  const stats = useMemo(() => {
    const total = mockAchievements.length;
    const unlocked = mockAchievements.filter(a => a.unlocked).length;
    const totalPoints = mockAchievements.reduce((sum, a) => sum + a.points, 0);
    const earnedPoints = mockAchievements
      .filter(a => a.unlocked)
      .reduce((sum, a) => sum + a.points, 0);

    return {
      total,
      unlocked,
      totalPoints,
      earnedPoints,
      completionRate: Math.round((unlocked / total) * 100)
    };
  }, []);

  const renderAchievementCard = (achievement: Achievement) => {
    const isLocked = !achievement.unlocked;
    const hasProgress = achievement.progress && !achievement.unlocked;
    const progressPercent = hasProgress 
      ? Math.round((achievement.progress!.current / achievement.progress!.total) * 100)
      : 0;

    return (
      <Col xs={24} sm={12} lg={8} xl={6} key={achievement.id}>
        <Card 
          className={`achievement-card ${isLocked ? 'locked' : 'unlocked'} ${achievement.rarity}`}
          hoverable={!isLocked}
        >
          <div className="achievement-header">
            <div className="achievement-icon">
              {isLocked ? <LockOutlined /> : achievement.icon}
            </div>
            <div className="achievement-rarity">
              <Tag color={rarityColors[achievement.rarity]}>
                {rarityNames[achievement.rarity]}
              </Tag>
            </div>
          </div>
          
          <div className="achievement-content">
            <Title level={5} className={isLocked ? 'locked-text' : ''}>
              {isLocked ? '????' : achievement.name}
            </Title>
            <Paragraph className={`achievement-description ${isLocked ? 'locked-text' : ''}`}>
              {isLocked ? '完成相关任务后解锁' : achievement.description}
            </Paragraph>
            
            {hasProgress && (
              <div className="achievement-progress">
                <Progress 
                  percent={progressPercent}
                  size="small"
                  strokeColor={rarityColors[achievement.rarity]}
                  format={() => `${achievement.progress!.current}/${achievement.progress!.total}`}
                />
              </div>
            )}
            
            {!isLocked && achievement.unlockedAt && (
              <div className="achievement-unlocked">
                <CheckCircleOutlined style={{ color: '#52c41a' }} />
                <Text type="secondary" style={{ fontSize: '12px', marginLeft: '4px' }}>
                  {new Date(achievement.unlockedAt).toLocaleDateString()}
                </Text>
              </div>
            )}
          </div>
          
          <div className="achievement-footer">
            <div className="achievement-category">
              <Tag color="blue">{categoryNames[achievement.category]}</Tag>
            </div>
            <div className="achievement-points">
              <StarOutlined style={{ color: '#faad14' }} />
              <Text strong>{achievement.points}</Text>
            </div>
          </div>
          
          {achievement.reward && !isLocked && (
            <div className="achievement-reward">
              <Text type="secondary" style={{ fontSize: '12px' }}>
                奖励: {achievement.reward.value}
              </Text>
            </div>
          )}
        </Card>
      </Col>
    );
  };

  return (
    <div className="achievements-page">
      <div className="achievements-container">
        <Card className="achievements-header-card">
          <div className="page-header">
            <div className="header-content">
              <TrophyOutlined className="header-icon" />
              <div>
                <Title level={2} style={{ margin: 0, color: 'white' }}>
                  成就系统
                </Title>
                <Text style={{ color: 'rgba(255,255,255,0.8)' }}>
                  记录您的游戏成就和里程碑
                </Text>
              </div>
            </div>
            <Button 
              icon={<ArrowLeftOutlined />} 
              onClick={() => navigate(-1)}
              className="back-button"
            >
              返回
            </Button>
          </div>
          
          {/* 统计信息 */}
          <div className="stats-section">
            <Row gutter={[16, 16]}>
              <Col xs={12} sm={6}>
                <Statistic
                  title="已解锁"
                  value={stats.unlocked}
                  suffix={`/ ${stats.total}`}
                  valueStyle={{ color: '#52c41a' }}
                  prefix={<TrophyOutlined />}
                />
              </Col>
              <Col xs={12} sm={6}>
                <Statistic
                  title="完成度"
                  value={stats.completionRate}
                  suffix="%"
                  valueStyle={{ color: '#1890ff' }}
                  prefix={<FireOutlined />}
                />
              </Col>
              <Col xs={12} sm={6}>
                <Statistic
                  title="获得积分"
                  value={stats.earnedPoints}
                  suffix={`/ ${stats.totalPoints}`}
                  valueStyle={{ color: '#faad14' }}
                  prefix={<StarOutlined />}
                />
              </Col>
              <Col xs={12} sm={6}>
                <Statistic
                  title="稀有成就"
                  value={mockAchievements.filter(a => a.unlocked && a.rarity !== 'common').length}
                  valueStyle={{ color: '#722ed1' }}
                  prefix={<CrownOutlined />}
                />
              </Col>
            </Row>
          </div>
        </Card>
        
        {/* 搜索和筛选 */}
        <Card className="filter-card">
          <div className="filter-section">
            <Search
              placeholder="搜索成就..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              style={{ width: 300, marginBottom: 16 }}
              prefix={<SearchOutlined />}
            />
            
            <Tabs activeKey={activeTab} onChange={setActiveTab}>
              <TabPane tab="全部" key="all" />
              <TabPane 
                tab={
                  <Badge count={stats.unlocked} size="small">
                    <span>已解锁</span>
                  </Badge>
                } 
                key="unlocked" 
              />
              <TabPane 
                tab={
                  <Badge count={stats.total - stats.unlocked} size="small">
                    <span>未解锁</span>
                  </Badge>
                } 
                key="locked" 
              />
              <TabPane tab="管理" key="management" />
              <TabPane tab="财务" key="financial" />
              <TabPane tab="社交" key="social" />
              <TabPane tab="技术" key="technical" />
              <TabPane tab="特殊" key="special" />
            </Tabs>
          </div>
        </Card>
        
        {/* 成就列表 */}
        <Card className="achievements-list-card">
          {filteredAchievements.length > 0 ? (
            <Row gutter={[16, 16]}>
              {filteredAchievements.map(renderAchievementCard)}
            </Row>
          ) : (
            <Empty 
              description="没有找到匹配的成就"
              image={Empty.PRESENTED_IMAGE_SIMPLE}
            />
          )}
        </Card>
      </div>
    </div>
  );
}