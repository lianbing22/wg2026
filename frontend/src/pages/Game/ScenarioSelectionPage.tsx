/**
 * 物业管理模拟器 - 场景选择页面
 * 让玩家浏览和选择不同的游戏场景
 */

import { useState, useEffect, useMemo } from 'react';
import { Card, Button, Input, Select, Tag, Row, Col, Typography, Space, Spin, Alert, Progress, Modal, Tooltip, notification, Empty } from 'antd';
import { SearchOutlined, PlayCircleOutlined, ClockCircleOutlined, TrophyOutlined, LockOutlined, FilterOutlined, TagsOutlined, ReloadOutlined } from '@ant-design/icons';
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
  const [loadError, setLoadError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedScenario, setSelectedScenario] = useState<Scenario | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [allTags, setAllTags] = useState<string[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // 加载场景数据
  useEffect(() => {
    loadScenarios();
  }, []);

  // 应用筛选条件
  useEffect(() => {
    applyFilters();
  }, [scenarios, searchQuery, selectedDifficulty, selectedTags, selectedStatus, gameState.progress.completedScenarios]);

  const loadScenarios = async () => {
    try {
      setLoading(true);
      setLoadError(null);
      const allScenarios = await scenarioService.getAllScenarios();
      
      if (allScenarios.length === 0) {
        setLoadError('未找到场景数据');
      }
      
      console.log('已加载场景:', allScenarios.length);
      setScenarios(allScenarios);
      
      // 提取所有标签
      const tags = new Set<string>();
      allScenarios.forEach(scenario => {
        scenario.tags?.forEach(tag => tags.add(tag));
      });
      setAllTags(Array.from(tags).sort());
      
      // 应用初始筛选
      applyFilters(allScenarios);
    } catch (error) {
      console.error('加载场景失败:', error);
      setLoadError('加载场景数据时出错');
      notification.error({
        message: '加载场景失败',
        description: '无法加载场景数据，请稍后再试'
      });
    } finally {
      setLoading(false);
    }
  };

  const refreshScenarios = async () => {
    setIsRefreshing(true);
    await loadScenarios();
    setIsRefreshing(false);
    notification.success({
      message: '刷新成功',
      description: '场景数据已更新'
    });
  };

  // 加强的筛选函数
  const applyFilters = (scenariosToFilter = scenarios) => {
    let filtered = [...scenariosToFilter];
    const completedScenarioIds = gameState.progress.completedScenarios || [];
    
    console.log('应用筛选条件:', { 
      searchQuery, 
      difficulty: selectedDifficulty, 
      tags: selectedTags,
      status: selectedStatus,
      totalScenarios: filtered.length
    });

    // 搜索过滤 - 优先匹配标题，其次是描述和标签
    if (searchQuery) {
      const query = searchQuery.toLowerCase().trim();
      
      // 分拆搜索条件
      const terms = query.split(/\s+/).filter(term => term.length > 0);
      
      if (terms.length > 0) {
        // 基于匹配程度排序
        filtered = filtered.map(scenario => {
          let score = 0;
          
          // 标题匹配得分最高
          if (scenario.title.toLowerCase().includes(query)) {
            score += 100;
          }
          
          // 单词精确匹配
          terms.forEach(term => {
            // 标题中每个词匹配
            if (scenario.title.toLowerCase().includes(term)) {
              score += 10;
            }
            
            // 描述中每个词匹配
            if (scenario.description && scenario.description.toLowerCase().includes(term)) {
              score += 5;
            }
            
            // 标签中每个词匹配
            if (scenario.tags && scenario.tags.some(tag => tag.toLowerCase().includes(term))) {
              score += 8;
            }
          });
          
          return { scenario, score };
        })
        .filter(item => item.score > 0)
        .sort((a, b) => b.score - a.score)
        .map(item => item.scenario);
        
        console.log(`搜索结果: 找到 ${filtered.length} 个匹配场景`);
      }
    }

    // 难度过滤
    if (selectedDifficulty !== 'all') {
      const difficultyNum = parseInt(selectedDifficulty);
      filtered = filtered.filter(scenario => scenario.difficulty === difficultyNum);
      console.log(`难度筛选 [${selectedDifficulty}]: 剩余 ${filtered.length} 个场景`);
    }

    // 标签过滤
    if (selectedTags.length > 0) {
      filtered = filtered.filter(scenario =>
        scenario.tags && selectedTags.every(tag => scenario.tags!.includes(tag))
      );
      console.log(`标签筛选 [${selectedTags.join(', ')}]: 剩余 ${filtered.length} 个场景`);
    }
    
    // 状态过滤（完成/未完成）
    if (selectedStatus !== 'all') {
      if (selectedStatus === 'completed') {
        filtered = filtered.filter(scenario => completedScenarioIds.includes(scenario.id));
      } else if (selectedStatus === 'notCompleted') {
        filtered = filtered.filter(scenario => !completedScenarioIds.includes(scenario.id));
      } else if (selectedStatus === 'available') {
        filtered = filtered.filter(scenario => {
          const { canPlay } = checkScenarioRequirements(scenario);
          return canPlay && !completedScenarioIds.includes(scenario.id);
        });
      }
      console.log(`状态筛选 [${selectedStatus}]: 剩余 ${filtered.length} 个场景`);
    }

    setFilteredScenarios(filtered);
  };

  // 场景统计信息
  const scenarioStats = useMemo(() => {
    const total = scenarios.length;
    const completed = gameState.progress.completedScenarios.length;
    const available = scenarios.filter(s => checkScenarioRequirements(s).canPlay).length;
    const locked = total - available;
    
    return { total, completed, available, locked };
  }, [scenarios, gameState.progress.completedScenarios]);

  const getDifficultyColor = (difficulty: number | undefined): string => {
    switch (difficulty) {
      case 1: return 'green';
      case 2: return 'cyan';
      case 3: return 'orange';
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
  
  const handleClearFilters = () => {
    setSearchQuery('');
    setSelectedDifficulty('all');
    setSelectedTags([]);
    setSelectedStatus('all');
    notification.info({
      message: '已清除所有筛选条件',
      description: '显示全部场景'
    });
  };

  const renderScenarioCard = (scenario: Scenario) => {
    const { canPlay, missingRequirements } = checkScenarioRequirements(scenario);
    const isCompleted = gameState.progress.completedScenarios.includes(scenario.id);
    const scenarioStats = gameState.progress.scenarioStats[scenario.id];

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
            {isCompleted ? '重玩' : '开始'}
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
                  
                  {scenarioStats && (
                    <Tooltip title={`已完成 ${scenarioStats.completedCount} 次`}>
                      <span>
                        <TrophyOutlined style={{ color: '#faad14' }} />
                        <Text type="secondary" style={{ marginLeft: 4 }}>
                          {scenarioStats.bestScore}
                        </Text>
                      </span>
                    </Tooltip>
                  )}
                </Space>
              </div>
              
              <div className="scenario-tags">
                {scenario.tags?.slice(0, 3).map(tag => (
                  <Tag 
                    key={tag} 
                    onClick={(e) => {
                      e.stopPropagation();
                      if (!selectedTags.includes(tag)) {
                        setSelectedTags([...selectedTags, tag]);
                      }
                    }}
                  >
                    {tag}
                  </Tag>
                )) || []}
                {scenario.tags && scenario.tags.length > 3 && (
                  <Tooltip title={scenario.tags.slice(3).join(', ')}>
                    <Tag>+{scenario.tags.length - 3}</Tag>
                  </Tooltip>
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
      <Row gutter={[16, 16]}>
        <Col xs={24} lg={18}>
          <div className="scenarios-container">
            <div className="scenarios-header">
              <Title level={2}>选择场景</Title>
              <div className="scenario-stats">
                <Space size="large">
                  <Tooltip title="所有场景">
                    <span>
                      <Text>总场景: </Text>
                      <Text strong>{scenarioStats.total}</Text>
                    </span>
                  </Tooltip>
                  <Tooltip title="已完成场景">
                    <span>
                      <Text>已完成: </Text>
                      <Text strong style={{ color: '#52c41a' }}>{scenarioStats.completed}</Text>
                    </span>
                  </Tooltip>
                  <Tooltip title="可进行场景">
                    <span>
                      <Text>可进行: </Text>
                      <Text strong style={{ color: '#1890ff' }}>{scenarioStats.available}</Text>
                    </span>
                  </Tooltip>
                  <Tooltip title="锁定场景">
                    <span>
                      <Text>锁定: </Text>
                      <Text strong style={{ color: '#ff4d4f' }}>{scenarioStats.locked}</Text>
                    </span>
                  </Tooltip>
                </Space>
              </div>
            </div>

            <div className="scenarios-filters">
              <Row gutter={[16, 16]}>
                <Col xs={24} sm={12} md={8} lg={6}>
                  <Search
                    placeholder="搜索场景..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onSearch={(value) => setSearchQuery(value)}
                    prefix={<SearchOutlined />}
                    allowClear
                  />
                </Col>
                
                <Col xs={24} sm={12} md={8} lg={6}>
                  <Select
                    style={{ width: '100%' }}
                    placeholder="选择难度"
                    value={selectedDifficulty}
                    onChange={(value) => setSelectedDifficulty(value)}
                    suffixIcon={<FilterOutlined />}
                    allowClear
                  >
                    <Option value="all">所有难度</Option>
                    <Option value="1">简单</Option>
                    <Option value="2">中等</Option>
                    <Option value="3">困难</Option>
                    <Option value="4">极难</Option>
                    <Option value="5">地狱</Option>
                  </Select>
                </Col>
                
                <Col xs={24} sm={12} md={8} lg={6}>
                  <Select
                    mode="multiple"
                    style={{ width: '100%' }}
                    placeholder="选择标签"
                    value={selectedTags}
                    onChange={(values) => setSelectedTags(values)}
                    suffixIcon={<TagsOutlined />}
                    maxTagCount={2}
                    allowClear
                  >
                    {allTags.map(tag => (
                      <Option key={tag} value={tag}>{tag}</Option>
                    ))}
                  </Select>
                </Col>
                
                <Col xs={24} sm={12} md={8} lg={6}>
                  <Select
                    style={{ width: '100%' }}
                    placeholder="筛选状态"
                    value={selectedStatus}
                    onChange={(value) => setSelectedStatus(value)}
                    allowClear
                  >
                    <Option value="all">所有场景</Option>
                    <Option value="completed">已完成</Option>
                    <Option value="notCompleted">未完成</Option>
                    <Option value="available">可进行</Option>
                  </Select>
                </Col>
                
                <Col xs={24}>
                  <div className="filter-actions">
                    <Space>
                      <Button onClick={handleClearFilters} disabled={searchQuery === '' && selectedDifficulty === 'all' && selectedTags.length === 0 && selectedStatus === 'all'}>
                        清除筛选
                      </Button>
                      <Button icon={<ReloadOutlined spin={isRefreshing} />} onClick={refreshScenarios} disabled={isRefreshing}>
                        刷新场景
                      </Button>
                      <Text type="secondary">
                        {filteredScenarios.length > 0 ? 
                          `找到 ${filteredScenarios.length} 个匹配场景` : 
                          '没有匹配的场景'}
                      </Text>
                    </Space>
                  </div>
                </Col>
              </Row>
            </div>

            <div className="scenarios-list">
              {loading ? (
                <div className="scenarios-loading">
                  <Spin size="large" />
                  <Text>加载场景中...</Text>
                </div>
              ) : loadError ? (
                <Alert
                  type="error"
                  message="加载错误"
                  description={loadError}
                  action={
                    <Button size="small" onClick={refreshScenarios}>
                      重试
                    </Button>
                  }
                />
              ) : filteredScenarios.length === 0 ? (
                <Empty
                  description="没有找到匹配的场景"
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                />
              ) : (
                <Row gutter={[16, 16]}>
                  {filteredScenarios.map(scenario => (
                    <Col xs={24} sm={12} md={8} key={scenario.id}>
                      {renderScenarioCard(scenario)}
                    </Col>
                  ))}
                </Row>
              )}
            </div>
          </div>
        </Col>
        
        <Col xs={24} lg={6}>
          <GameStatsPanel size="small" detailed={false} />
        </Col>
      </Row>

      {/* 场景详情模态框 */}
      {selectedScenario && renderScenarioDetails()}
    </div>
  );
}