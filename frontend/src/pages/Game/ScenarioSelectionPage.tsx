/**
 * 物业管理模拟器 - 场景选择页面
 * 让玩家浏览和选择不同的游戏场景
 */

import { useState, useEffect } from 'react';
import { Card, Button, Input, Select, Tag, Row, Col, Typography, Space, Spin, Alert, Progress, Modal, Tooltip } from 'antd';
import { SearchOutlined, PlayCircleOutlined, ClockCircleOutlined, TrophyOutlined, LockOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { scenarioService } from '../../services/scenarioService';
import type { Scenario } from '../../types/game';
import { useGame } from '../../contexts/GameContext';
import GameStatsPanel from '../../components/game/GameStatsPanel';
import './ScenarioSelectionPage.css';

const { Title, Text, Paragraph } = Typography;
const { Search } = Input;
const { Option } = Select;

export default function ScenarioSelectionPage() {
  const navigate = useNavigate();
  const { gameState } = useGame();
  const [scenarios, setScenarios] = useState<Scenario[]>([]);
  const [filteredScenarios, setFilteredScenarios] = useState<Scenario[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [selectedScenario, setSelectedScenario] = useState<Scenario | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [allTags, setAllTags] = useState<string[]>([]);

  // 加载场景数据
  useEffect(() => {
    loadScenarios();
  }, []);

  // 应用筛选条件
  useEffect(() => {
    applyFilters();
  }, [scenarios, searchQuery, selectedDifficulty, selectedTags]);

  const loadScenarios = async () => {
    try {
      setLoading(true);
      const allScenarios = await scenarioService.getAllScenarios();
      setScenarios(allScenarios);
      
      // 提取所有标签
      const tags = new Set<string>();
      allScenarios.forEach(scenario => {
        scenario.tags?.forEach(tag => tags.add(tag));
      });
      setAllTags(Array.from(tags));
    } catch (error) {
      console.error('Failed to load scenarios:', error);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...scenarios];

    // 搜索过滤
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(scenario =>
        scenario.title.toLowerCase().includes(query) ||
        (scenario.description && scenario.description.toLowerCase().includes(query)) ||
        (scenario.tags && scenario.tags.some(tag => tag.toLowerCase().includes(query)))
      );
    }

    // 难度过滤
    if (selectedDifficulty !== 'all') {
      const difficultyNum = parseInt(selectedDifficulty);
      filtered = filtered.filter(scenario => scenario.difficulty === difficultyNum);
    }

    // 标签过滤
    if (selectedTags.length > 0) {
      filtered = filtered.filter(scenario =>
        scenario.tags && selectedTags.some(tag => scenario.tags!.includes(tag))
      );
    }

    setFilteredScenarios(filtered);
  };

  const getDifficultyColor = (difficulty: number | undefined): string => {
    switch (difficulty) {
      case 1: return 'green';
      case 2: return 'orange';
      case 3: return 'red';
      case 4: return 'volcano';
      case 5: return 'magenta';
      default: return 'default';
    }
  };

  const getDifficultyText = (difficulty: number | undefined): string => {
    switch (difficulty) {
      case 1: return '简单';
      case 2: return '中等';
      case 3: return '困难';
      case 4: return '极难';
      case 5: return '地狱';
      default: return '未知';
    }
  };

  const checkScenarioRequirements = (scenario: Scenario) => {
    return scenarioService.checkScenarioRequirements(scenario, gameState.player.skills);
  };

  const handleScenarioClick = (scenario: Scenario) => {
    setSelectedScenario(scenario);
    setShowDetails(true);
  };

  const handleStartScenario = () => {
    if (selectedScenario) {
      navigate(`/game/scenario/${selectedScenario.id}`);
    }
  };

  const renderScenarioCard = (scenario: Scenario) => {
    const { canPlay, missingRequirements } = checkScenarioRequirements(scenario);
    const isCompleted = gameState.progress.completedScenarios.includes(scenario.id);

    return (
      <Card
        key={scenario.id}
        className={`scenario-card ${!canPlay ? 'locked' : ''} ${isCompleted ? 'completed' : ''}`}
        hoverable={canPlay}
        onClick={() => canPlay && handleScenarioClick(scenario)}
        cover={
          <div className="scenario-cover">
            <div className="scenario-overlay">
              {!canPlay && <LockOutlined className="lock-icon" />}
              {isCompleted && <TrophyOutlined className="trophy-icon" />}
            </div>
          </div>
        }
        actions={canPlay ? [
          <Button 
            type="primary" 
            icon={<PlayCircleOutlined />}
            onClick={(e) => {
              e.stopPropagation();
              handleScenarioClick(scenario);
            }}
          >
            开始
          </Button>
        ] : [
          <Tooltip title="不满足要求">
            <Button disabled icon={<LockOutlined />}>
              锁定
            </Button>
          </Tooltip>
        ]}
      >
        <Card.Meta
          title={
            <div className="scenario-title">
              <span>{scenario.title}</span>
              <Tag color={getDifficultyColor(scenario.difficulty)}>
                {getDifficultyText(scenario.difficulty)}
              </Tag>
            </div>
          }
          description={
            <div className="scenario-description">
              <Paragraph ellipsis={{ rows: 2 }}>
                {scenario.description}
              </Paragraph>
              
              <div className="scenario-meta">
                <Space size="small">
                  <ClockCircleOutlined />
                  <Text type="secondary">{scenario.estimatedTime}分钟</Text>
                </Space>
              </div>
              
              <div className="scenario-tags">
                {scenario.tags?.slice(0, 3).map(tag => (
                  <Tag key={tag}>{tag}</Tag>
                )) || []}
                {scenario.tags && scenario.tags.length > 3 && (
                  <Tag>+{scenario.tags.length - 3}</Tag>
                )}
              </div>
              
              {!canPlay && (
                <Alert
                  message="需要技能"
                  description={
                    <div>
                      {Object.entries(missingRequirements).map(([skill, needed]) => (
                        <div key={skill}>
                          {skill}: 还需 {needed} 点
                        </div>
                      ))}
                    </div>
                  }
                  type="warning"
                  style={{ marginTop: 8 }}
                />
              )}
            </div>
          }
        />
      </Card>
    );
  };

  const renderScenarioDetails = () => {
    if (!selectedScenario) return null;

    const { canPlay, missingRequirements } = checkScenarioRequirements(selectedScenario);
    const isCompleted = gameState.progress.completedScenarios.includes(selectedScenario.id);

    return (
      <Modal
        title={selectedScenario.title}
        open={showDetails}
        onCancel={() => setShowDetails(false)}
        footer={[
          <Button key="cancel" onClick={() => setShowDetails(false)}>
            取消
          </Button>,
          <Button 
            key="start" 
            type="primary" 
            disabled={!canPlay}
            onClick={handleStartScenario}
            icon={<PlayCircleOutlined />}
          >
            开始场景
          </Button>
        ]}
        width={600}
      >
        <div className="scenario-details">
          <Row gutter={[16, 16]}>
            <Col span={24}>
              <Space>
                <Tag color={getDifficultyColor(selectedScenario.difficulty)}>
                  {getDifficultyText(selectedScenario.difficulty)}
                </Tag>
                <Tag icon={<ClockCircleOutlined />}>
                  {selectedScenario.estimatedTime}分钟
                </Tag>
                {isCompleted && (
                  <Tag color="gold" icon={<TrophyOutlined />}>
                    已完成
                  </Tag>
                )}
              </Space>
            </Col>
            
            <Col span={24}>
              <Paragraph>{selectedScenario.description}</Paragraph>
            </Col>
            
            <Col span={24}>
              <Title level={5}>标签</Title>
              <Space wrap>
                {selectedScenario.tags?.map(tag => (
                  <Tag key={tag}>{tag}</Tag>
                )) || <Text type="secondary">无标签</Text>}
              </Space>
            </Col>
            
            {selectedScenario.requirements && Object.keys(selectedScenario.requirements).length > 0 && (
              <Col span={24}>
                <Title level={5}>技能要求</Title>
                <Row gutter={[8, 8]}>
                  {Object.entries(selectedScenario.requirements).map(([skill, required]) => {
                    const current = gameState.player.skills[skill] || 0;
                    const progress = Math.min(100, (current / required) * 100);
                    
                    return (
                      <Col span={12} key={skill}>
                        <div className="skill-requirement">
                          <div className="skill-header">
                            <Text>{skill}</Text>
                            <Text type={current >= required ? 'success' : 'danger'}>
                              {current}/{required}
                            </Text>
                          </div>
                          <Progress 
                            percent={progress} 
                            size="small"
                            status={current >= required ? 'success' : 'exception'}
                            showInfo={false}
                          />
                        </div>
                      </Col>
                    );
                  })}
                </Row>
              </Col>
            )}
            
            <Col span={24}>
              <Title level={5}>奖励</Title>
              <Row gutter={[16, 8]}>
                {selectedScenario.rewards?.experience && (
                  <Col span={8}>
                    <Text>经验: +{selectedScenario.rewards.experience}</Text>
                  </Col>
                )}
                {selectedScenario.rewards?.money && (
                  <Col span={8}>
                    <Text>金钱: +{selectedScenario.rewards.money}</Text>
                  </Col>
                )}
                {selectedScenario.rewards?.reputation && (
                  <Col span={8}>
                    <Text>声誉: +{selectedScenario.rewards.reputation}</Text>
                  </Col>
                )}
              </Row>
              
              {selectedScenario.rewards?.skills && Object.keys(selectedScenario.rewards.skills).length > 0 && (
                <div style={{ marginTop: 8 }}>
                  <Text type="secondary">技能提升:</Text>
                  <div>
                    {Object.entries(selectedScenario.rewards.skills).map(([skill, increase]) => (
                      <Tag key={skill} style={{ margin: '2px' }}>
                        {skill} +{increase}
                      </Tag>
                    ))}
                  </div>
                </div>
              )}
            </Col>
            
            {!canPlay && (
              <Col span={24}>
                <Alert
                  message="无法开始此场景"
                  description={
                    <div>
                      <Text>你还不满足以下技能要求:</Text>
                      {Object.entries(missingRequirements).map(([skill, needed]) => (
                        <div key={skill}>
                          • {skill}: 还需 {needed} 点
                        </div>
                      ))}
                    </div>
                  }
                  type="warning"
                  showIcon
                />
              </Col>
            )}
          </Row>
        </div>
      </Modal>
    );
  };

  return (
    <div className="scenario-selection-page">
      <Row gutter={[24, 24]}>
        {/* 左侧：场景列表 */}
        <Col xs={24} lg={18}>
          <Card title="选择场景" className="scenarios-container">
            {/* 搜索和筛选 */}
            <div className="filters-section">
              <Row gutter={[16, 16]}>
                <Col xs={24} sm={12} md={8}>
                  <Search
                    placeholder="搜索场景..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    prefix={<SearchOutlined />}
                  />
                </Col>
                <Col xs={24} sm={12} md={6}>
                  <Select
                    value={selectedDifficulty}
                    onChange={setSelectedDifficulty}
                    style={{ width: '100%' }}
                    placeholder="选择难度"
                  >
                    <Option value="all">全部难度</Option>
                    <Option value="easy">简单</Option>
                    <Option value="medium">中等</Option>
                    <Option value="hard">困难</Option>
                  </Select>
                </Col>
                <Col xs={24} md={10}>
                  <Select
                    mode="multiple"
                    value={selectedTags}
                    onChange={setSelectedTags}
                    style={{ width: '100%' }}
                    placeholder="选择标签"
                    maxTagCount={2}
                  >
                    {allTags.map(tag => (
                      <Option key={tag} value={tag}>{tag}</Option>
                    ))}
                  </Select>
                </Col>
              </Row>
            </div>

            {/* 场景列表 */}
            <Spin spinning={loading}>
              <Row gutter={[16, 16]} className="scenarios-grid">
                {filteredScenarios.map(scenario => (
                  <Col xs={24} sm={12} lg={8} key={scenario.id}>
                    {renderScenarioCard(scenario)}
                  </Col>
                ))}
              </Row>
              
              {!loading && filteredScenarios.length === 0 && (
                <div className="empty-state">
                  <Text type="secondary">没有找到符合条件的场景</Text>
                </div>
              )}
            </Spin>
          </Card>
        </Col>

        {/* 右侧：游戏统计 */}
        <Col xs={24} lg={6}>
          <GameStatsPanel size="small" />
        </Col>
      </Row>

      {/* 场景详情弹窗 */}
      {renderScenarioDetails()}
    </div>
  );
}