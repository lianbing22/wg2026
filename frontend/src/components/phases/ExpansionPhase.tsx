/**
 * 物业管理模拟器 - 扩张阶段组件
 * 实现区域探索、地块收购、帝国扩张等扩张阶段核心功能
 */

import React, { useState, useEffect, useCallback } from 'react';
import { 
  Card, 
  Button, 
  Table, 
  Modal, 
  Form, 
  Input, 
  Select, 
  InputNumber, 
  List, 
  Tag, 
  Tooltip, 
  Space, 
  Row, 
  Col, 
  Statistic, 
  Alert, 
  Progress,
  Tabs,
  Badge,
  Avatar,
  Timeline,
  Rate,
  Divider,
  Steps,
  Slider,
  Switch,
  Checkbox,
  Radio,
  Tree
} from 'antd';
import { 
  GlobalOutlined, 
  EnvironmentOutlined, 
  RocketOutlined,
  BankOutlined,
  ShopOutlined,
  HomeOutlined,
  BuildOutlined,
  DollarOutlined,
  ThunderboltOutlined,
  StarOutlined,
  TeamOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  EyeOutlined,
  LockOutlined,
  UnlockOutlined,
  ExpandOutlined,
  CompassOutlined,
  FlagOutlined,
  CrownOutlined,
  TrophyOutlined,
  FireOutlined
} from '@ant-design/icons';
import { 
  Region, 
  Plot,
  GameCycleState 
} from '../../types/game-redesign';
import { GameCycleManager } from '../../utils/game-cycle-manager';

const { TabPane } = Tabs;
const { Option } = Select;
const { Step } = Steps;
const { TreeNode } = Tree;

// ==================== 接口定义 ====================

interface ExpansionPhaseProps {
  gameCycleManager: GameCycleManager;
  onPhaseComplete: () => void;
}

interface RegionExplorerProps {
  regions: Region[];
  onExploreRegion: (regionId: string) => void;
  onUnlockRegion: (regionId: string) => void;
  playerFunds: number;
}

interface PlotManagerProps {
  plots: Plot[];
  onPurchasePlot: (plotId: string) => void;
  onDevelopPlot: (plotId: string, developmentType: string) => void;
  playerFunds: number;
}

interface EmpireOverviewProps {
  ownedPlots: Plot[];
  totalValue: number;
  monthlyIncome: number;
  expansionLevel: number;
}

// ==================== 模拟数据 ====================

const MOCK_REGIONS: Region[] = [
  {
    id: 'region_001',
    name: '市中心商业区',
    description: '繁华的商业中心，拥有大量商业机会和高端客户群体',
    unlock_cost: 0,
    exploration_cost: 50000,
    is_unlocked: true,
    is_explored: true,
    difficulty_level: 1,
    special_bonuses: ['商业收入+20%', '租户满意度+10%'],
    climate: 'urban',
    population_density: 'high',
    economic_level: 'high',
    plots: [
      {
        id: 'plot_001',
        region_id: 'region_001',
        name: '中央广场地块',
        type: 'commercial',
        size: 2000,
        price: 800000,
        is_owned: true,
        development_level: 3,
        max_development_level: 5,
        monthly_income: 15000,
        special_features: ['地铁站', '购物中心'],
        zoning_restrictions: ['商业', '办公'],
        coordinates: { x: 100, y: 150 }
      },
      {
        id: 'plot_002',
        region_id: 'region_001',
        name: '金融街地块',
        type: 'office',
        size: 1500,
        price: 1200000,
        is_owned: false,
        development_level: 0,
        max_development_level: 5,
        monthly_income: 0,
        special_features: ['银行', '证券交易所'],
        zoning_restrictions: ['办公', '金融'],
        coordinates: { x: 200, y: 100 }
      }
    ]
  },
  {
    id: 'region_002',
    name: '高新技术园区',
    description: '新兴的科技产业聚集地，适合发展高科技产业和创新企业',
    unlock_cost: 200000,
    exploration_cost: 80000,
    is_unlocked: true,
    is_explored: false,
    difficulty_level: 2,
    special_bonuses: ['科技产业收入+30%', '创新加成+15%'],
    climate: 'suburban',
    population_density: 'medium',
    economic_level: 'high',
    plots: [
      {
        id: 'plot_003',
        region_id: 'region_002',
        name: '科技孵化器地块',
        type: 'mixed',
        size: 3000,
        price: 600000,
        is_owned: false,
        development_level: 0,
        max_development_level: 4,
        monthly_income: 0,
        special_features: ['孵化器', '研发中心'],
        zoning_restrictions: ['科技', '研发', '办公'],
        coordinates: { x: 300, y: 200 }
      }
    ]
  },
  {
    id: 'region_003',
    name: '滨海度假区',
    description: '风景优美的海滨地区，适合发展旅游业和高端住宅',
    unlock_cost: 500000,
    exploration_cost: 120000,
    is_unlocked: false,
    is_explored: false,
    difficulty_level: 3,
    special_bonuses: ['旅游收入+40%', '高端住宅需求+25%'],
    climate: 'coastal',
    population_density: 'low',
    economic_level: 'medium',
    plots: [
      {
        id: 'plot_004',
        region_id: 'region_003',
        name: '海景别墅区',
        type: 'residential',
        size: 5000,
        price: 1500000,
        is_owned: false,
        development_level: 0,
        max_development_level: 5,
        monthly_income: 0,
        special_features: ['海景', '私人海滩'],
        zoning_restrictions: ['住宅', '度假村'],
        coordinates: { x: 400, y: 300 }
      },
      {
        id: 'plot_005',
        region_id: 'region_003',
        name: '度假酒店地块',
        type: 'commercial',
        size: 4000,
        price: 2000000,
        is_owned: false,
        development_level: 0,
        max_development_level: 5,
        monthly_income: 0,
        special_features: ['海滨', '游艇码头'],
        zoning_restrictions: ['酒店', '娱乐'],
        coordinates: { x: 450, y: 350 }
      }
    ]
  },
  {
    id: 'region_004',
    name: '工业开发区',
    description: '大型工业基地，适合发展制造业和物流产业',
    unlock_cost: 300000,
    exploration_cost: 60000,
    is_unlocked: false,
    is_explored: false,
    difficulty_level: 2,
    special_bonuses: ['工业收入+25%', '物流效率+20%'],
    climate: 'industrial',
    population_density: 'low',
    economic_level: 'medium',
    plots: [
      {
        id: 'plot_006',
        region_id: 'region_004',
        name: '制造业园区',
        type: 'industrial',
        size: 8000,
        price: 400000,
        is_owned: false,
        development_level: 0,
        max_development_level: 3,
        monthly_income: 0,
        special_features: ['铁路', '货运站'],
        zoning_restrictions: ['工业', '制造'],
        coordinates: { x: 500, y: 100 }
      }
    ]
  },
  {
    id: 'region_005',
    name: '历史文化区',
    description: '拥有丰富历史文化遗产的区域，适合发展文化旅游和精品商业',
    unlock_cost: 800000,
    exploration_cost: 150000,
    is_unlocked: false,
    is_explored: false,
    difficulty_level: 4,
    special_bonuses: ['文化旅游收入+50%', '品牌价值+30%'],
    climate: 'historic',
    population_density: 'medium',
    economic_level: 'high',
    plots: [
      {
        id: 'plot_007',
        region_id: 'region_005',
        name: '古建筑群',
        type: 'heritage',
        size: 3000,
        price: 1800000,
        is_owned: false,
        development_level: 0,
        max_development_level: 3,
        monthly_income: 0,
        special_features: ['文物保护', '历史建筑'],
        zoning_restrictions: ['文化', '旅游', '精品商业'],
        coordinates: { x: 150, y: 400 }
      }
    ]
  }
];

// ==================== 区域探索组件 ====================

const RegionExplorer: React.FC<RegionExplorerProps> = ({ 
  regions, 
  onExploreRegion, 
  onUnlockRegion, 
  playerFunds 
}) => {
  const [selectedRegion, setSelectedRegion] = useState<Region | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [actionType, setActionType] = useState<'unlock' | 'explore'>('unlock');

  const getRegionStatusColor = (region: Region) => {
    if (!region.is_unlocked) return '#d9d9d9';
    if (!region.is_explored) return '#faad14';
    return '#52c41a';
  };

  const getRegionStatusText = (region: Region) => {
    if (!region.is_unlocked) return '未解锁';
    if (!region.is_explored) return '未探索';
    return '已探索';
  };

  const getClimateIcon = (climate: string) => {
    const icons = {
      urban: <BuildOutlined />,
      suburban: <HomeOutlined />,
      coastal: <EnvironmentOutlined />,
      industrial: <BankOutlined />,
      historic: <CrownOutlined />
    };
    return icons[climate] || <GlobalOutlined />;
  };

  const getDifficultyColor = (level: number) => {
    const colors = ['#52c41a', '#faad14', '#ff7a45', '#ff4d4f', '#722ed1'];
    return colors[level - 1] || '#d9d9d9';
  };

  const handleRegionAction = (region: Region, action: 'unlock' | 'explore') => {
    setSelectedRegion(region);
    setActionType(action);
    setModalVisible(true);
  };

  const confirmAction = () => {
    if (selectedRegion) {
      if (actionType === 'unlock') {
        onUnlockRegion(selectedRegion.id);
      } else {
        onExploreRegion(selectedRegion.id);
      }
      setModalVisible(false);
    }
  };

  const getActionCost = () => {
    if (!selectedRegion) return 0;
    return actionType === 'unlock' ? selectedRegion.unlock_cost : selectedRegion.exploration_cost;
  };

  return (
    <Card title="区域探索" extra={<CompassOutlined />}>
      <Row gutter={[16, 16]}>
        {regions.map(region => (
          <Col xs={24} sm={12} lg={8} key={region.id}>
            <Card
              size="small"
              hoverable
              style={{
                borderColor: getRegionStatusColor(region),
                opacity: region.is_unlocked ? 1 : 0.7
              }}
              cover={
                <div style={{ 
                  padding: '20px', 
                  textAlign: 'center', 
                  backgroundColor: '#f5f5f5',
                  position: 'relative'
                }}>
                  <div style={{ fontSize: '32px', color: getRegionStatusColor(region), marginBottom: '8px' }}>
                    {getClimateIcon(region.climate)}
                  </div>
                  <Tag color={getRegionStatusColor(region)}>
                    {getRegionStatusText(region)}
                  </Tag>
                  {!region.is_unlocked && (
                    <div style={{ 
                      position: 'absolute', 
                      top: '10px', 
                      right: '10px',
                      fontSize: '20px',
                      color: '#d9d9d9'
                    }}>
                      <LockOutlined />
                    </div>
                  )}
                </div>
              }
              actions={[
                !region.is_unlocked ? (
                  <Button 
                    size="small" 
                    type="primary"
                    disabled={region.unlock_cost > playerFunds}
                    onClick={() => handleRegionAction(region, 'unlock')}
                  >
                    解锁 (¥{region.unlock_cost.toLocaleString()})
                  </Button>
                ) : !region.is_explored ? (
                  <Button 
                    size="small" 
                    type="default"
                    disabled={region.exploration_cost > playerFunds}
                    onClick={() => handleRegionAction(region, 'explore')}
                  >
                    探索 (¥{region.exploration_cost.toLocaleString()})
                  </Button>
                ) : (
                  <Button size="small" icon={<EyeOutlined />}>
                    查看地块
                  </Button>
                )
              ]}
            >
              <Card.Meta
                title={
                  <Space>
                    <span>{region.name}</span>
                    <Tag color={getDifficultyColor(region.difficulty_level)}>
                      难度 {region.difficulty_level}
                    </Tag>
                  </Space>
                }
                description={
                  <Space direction="vertical" size="small" style={{ width: '100%' }}>
                    <div style={{ fontSize: '12px', height: '36px', overflow: 'hidden' }}>
                      {region.description}
                    </div>
                    
                    <Divider style={{ margin: '8px 0' }} />
                    
                    <Row gutter={8}>
                      <Col span={12}>
                        <div style={{ fontSize: '12px', color: '#666' }}>人口密度</div>
                        <div style={{ fontSize: '12px' }}>
                          {region.population_density === 'high' ? '高' :
                           region.population_density === 'medium' ? '中' : '低'}
                        </div>
                      </Col>
                      <Col span={12}>
                        <div style={{ fontSize: '12px', color: '#666' }}>经济水平</div>
                        <div style={{ fontSize: '12px' }}>
                          {region.economic_level === 'high' ? '高' :
                           region.economic_level === 'medium' ? '中' : '低'}
                        </div>
                      </Col>
                    </Row>
                    
                    {region.is_explored && (
                      <div>
                        <div style={{ fontSize: '12px', color: '#666', marginBottom: '4px' }}>特殊加成:</div>
                        <Space wrap>
                          {region.special_bonuses.map((bonus, index) => (
                            <Tag key={index} size="small" color="blue">
                              {bonus}
                            </Tag>
                          ))}
                        </Space>
                      </div>
                    )}
                    
                    <div style={{ fontSize: '12px' }}>
                      地块数量: {region.plots.length}
                    </div>
                  </Space>
                }
              />
            </Card>
          </Col>
        ))}
      </Row>

      <Modal
        title={`${actionType === 'unlock' ? '解锁' : '探索'}区域`}
        open={modalVisible}
        onOk={confirmAction}
        onCancel={() => setModalVisible(false)}
        okText="确认"
        cancelText="取消"
      >
        {selectedRegion && (
          <Space direction="vertical" style={{ width: '100%' }}>
            <Alert
              message={selectedRegion.name}
              description={selectedRegion.description}
              type="info"
              showIcon
            />
            
            <Row gutter={16}>
              <Col span={12}>
                <Statistic 
                  title={actionType === 'unlock' ? '解锁费用' : '探索费用'} 
                  value={getActionCost()} 
                  prefix="¥" 
                />
              </Col>
              <Col span={12}>
                <Statistic title="我的资金" value={playerFunds} prefix="¥" />
              </Col>
            </Row>
            
            <Row gutter={16}>
              <Col span={12}>
                <Statistic title="难度等级" value={selectedRegion.difficulty_level} />
              </Col>
              <Col span={12}>
                <Statistic title="地块数量" value={selectedRegion.plots.length} />
              </Col>
            </Row>

            {actionType === 'explore' && selectedRegion.is_unlocked && (
              <Card title="探索收益" size="small">
                <div style={{ fontSize: '12px', marginBottom: '8px' }}>解锁特殊加成:</div>
                <Space wrap>
                  {selectedRegion.special_bonuses.map((bonus, index) => (
                    <Tag key={index} color="green">
                      {bonus}
                    </Tag>
                  ))}
                </Space>
              </Card>
            )}
          </Space>
        )}
      </Modal>
    </Card>
  );
};

// ==================== 地块管理组件 ====================

const PlotManager: React.FC<PlotManagerProps> = ({ 
  plots, 
  onPurchasePlot, 
  onDevelopPlot, 
  playerFunds 
}) => {
  const [selectedPlot, setSelectedPlot] = useState<Plot | null>(null);
  const [actionModalVisible, setActionModalVisible] = useState(false);
  const [actionType, setActionType] = useState<'purchase' | 'develop'>('purchase');
  const [developmentType, setDevelopmentType] = useState('');

  const getPlotTypeColor = (type: string) => {
    const colors = {
      residential: 'green',
      commercial: 'blue',
      office: 'purple',
      industrial: 'orange',
      mixed: 'cyan',
      heritage: 'gold'
    };
    return colors[type] || 'default';
  };

  const getPlotTypeName = (type: string) => {
    const names = {
      residential: '住宅',
      commercial: '商业',
      office: '办公',
      industrial: '工业',
      mixed: '综合',
      heritage: '文化遗产'
    };
    return names[type] || type;
  };

  const getDevelopmentCost = (plot: Plot) => {
    const baseCost = plot.price * 0.3;
    return baseCost * (plot.development_level + 1);
  };

  const handlePlotAction = (plot: Plot, action: 'purchase' | 'develop') => {
    setSelectedPlot(plot);
    setActionType(action);
    setActionModalVisible(true);
  };

  const confirmAction = () => {
    if (selectedPlot) {
      if (actionType === 'purchase') {
        onPurchasePlot(selectedPlot.id);
      } else {
        onDevelopPlot(selectedPlot.id, developmentType);
      }
      setActionModalVisible(false);
    }
  };

  const availablePlots = plots.filter(plot => {
    // 只显示已解锁且已探索区域的地块
    return true; // 简化处理，实际应该检查区域状态
  });

  return (
    <Card title="地块管理" extra={<EnvironmentOutlined />}>
      <Row gutter={[16, 16]}>
        {availablePlots.map(plot => (
          <Col xs={24} sm={12} lg={8} key={plot.id}>
            <Card
              size="small"
              hoverable
              style={{
                borderColor: plot.is_owned ? '#52c41a' : '#d9d9d9',
                backgroundColor: plot.is_owned ? '#f6ffed' : 'white'
              }}
              cover={
                <div style={{ 
                  padding: '20px', 
                  textAlign: 'center', 
                  backgroundColor: '#f5f5f5',
                  position: 'relative'
                }}>
                  <div style={{ fontSize: '32px', color: '#1890ff', marginBottom: '8px' }}>
                    {plot.type === 'residential' ? <HomeOutlined /> :
                     plot.type === 'commercial' ? <ShopOutlined /> :
                     plot.type === 'office' ? <BankOutlined /> :
                     plot.type === 'industrial' ? <BuildOutlined /> :
                     plot.type === 'heritage' ? <CrownOutlined /> : <GlobalOutlined />}
                  </div>
                  <Tag color={getPlotTypeColor(plot.type)}>
                    {getPlotTypeName(plot.type)}
                  </Tag>
                  {plot.is_owned && (
                    <div style={{ 
                      position: 'absolute', 
                      top: '10px', 
                      right: '10px',
                      fontSize: '16px',
                      color: '#52c41a'
                    }}>
                      <CheckCircleOutlined />
                    </div>
                  )}
                </div>
              }
              actions={[
                !plot.is_owned ? (
                  <Button 
                    size="small" 
                    type="primary"
                    disabled={plot.price > playerFunds}
                    onClick={() => handlePlotAction(plot, 'purchase')}
                  >
                    购买
                  </Button>
                ) : plot.development_level < plot.max_development_level ? (
                  <Button 
                    size="small" 
                    type="default"
                    disabled={getDevelopmentCost(plot) > playerFunds}
                    onClick={() => handlePlotAction(plot, 'develop')}
                  >
                    开发
                  </Button>
                ) : (
                  <Button size="small" disabled>
                    已满级
                  </Button>
                ),
                <Button size="small" icon={<EyeOutlined />}>
                  详情
                </Button>
              ]}
            >
              <Card.Meta
                title={plot.name}
                description={
                  <Space direction="vertical" size="small" style={{ width: '100%' }}>
                    <Row gutter={8}>
                      <Col span={12}>
                        <div style={{ fontSize: '12px', color: '#666' }}>面积</div>
                        <div style={{ fontSize: '12px' }}>
                          {plot.size.toLocaleString()}㎡
                        </div>
                      </Col>
                      <Col span={12}>
                        <div style={{ fontSize: '12px', color: '#666' }}>价格</div>
                        <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#1890ff' }}>
                          ¥{plot.price.toLocaleString()}
                        </div>
                      </Col>
                    </Row>
                    
                    {plot.is_owned && (
                      <>
                        <Row gutter={8}>
                          <Col span={12}>
                            <div style={{ fontSize: '12px', color: '#666' }}>开发等级</div>
                            <div style={{ fontSize: '12px' }}>
                              {plot.development_level}/{plot.max_development_level}
                            </div>
                          </Col>
                          <Col span={12}>
                            <div style={{ fontSize: '12px', color: '#666' }}>月收入</div>
                            <div style={{ fontSize: '12px', color: '#52c41a' }}>
                              ¥{plot.monthly_income.toLocaleString()}
                            </div>
                          </Col>
                        </Row>
                        
                        <Progress 
                          percent={(plot.development_level / plot.max_development_level) * 100}
                          size="small"
                          strokeColor="#52c41a"
                        />
                      </>
                    )}
                    
                    {plot.special_features.length > 0 && (
                      <div>
                        <div style={{ fontSize: '12px', color: '#666', marginBottom: '4px' }}>特色:</div>
                        <Space wrap>
                          {plot.special_features.map((feature, index) => (
                            <Tag key={index} size="small" color="blue">
                              {feature}
                            </Tag>
                          ))}
                        </Space>
                      </div>
                    )}
                  </Space>
                }
              />
            </Card>
          </Col>
        ))}
      </Row>

      <Modal
        title={`${actionType === 'purchase' ? '购买' : '开发'}地块`}
        open={actionModalVisible}
        onOk={confirmAction}
        onCancel={() => setActionModalVisible(false)}
        okText="确认"
        cancelText="取消"
      >
        {selectedPlot && (
          <Space direction="vertical" style={{ width: '100%' }}>
            <Alert
              message={selectedPlot.name}
              description={`${getPlotTypeName(selectedPlot.type)}地块，面积${selectedPlot.size.toLocaleString()}㎡`}
              type="info"
              showIcon
            />
            
            <Row gutter={16}>
              <Col span={12}>
                <Statistic 
                  title={actionType === 'purchase' ? '购买价格' : '开发费用'} 
                  value={actionType === 'purchase' ? selectedPlot.price : getDevelopmentCost(selectedPlot)} 
                  prefix="¥" 
                />
              </Col>
              <Col span={12}>
                <Statistic title="我的资金" value={playerFunds} prefix="¥" />
              </Col>
            </Row>
            
            {actionType === 'develop' && (
              <div>
                <div style={{ marginBottom: '8px' }}>选择开发类型:</div>
                <Select
                  style={{ width: '100%' }}
                  placeholder="选择开发方向"
                  value={developmentType}
                  onChange={setDevelopmentType}
                >
                  <Option value="efficiency">效率提升 (+20% 收入)</Option>
                  <Option value="capacity">容量扩展 (+30% 租户)</Option>
                  <Option value="luxury">豪华装修 (+50% 租金)</Option>
                  <Option value="green">绿色建筑 (+15% 满意度)</Option>
                </Select>
              </div>
            )}
            
            {selectedPlot.special_features.length > 0 && (
              <Card title="地块特色" size="small">
                <Space wrap>
                  {selectedPlot.special_features.map((feature, index) => (
                    <Tag key={index} color="green">
                      {feature}
                    </Tag>
                  ))}
                </Space>
              </Card>
            )}
          </Space>
        )}
      </Modal>
    </Card>
  );
};

// ==================== 帝国概览组件 ====================

const EmpireOverview: React.FC<EmpireOverviewProps> = ({ 
  ownedPlots, 
  totalValue, 
  monthlyIncome, 
  expansionLevel 
}) => {
  const getExpansionTitle = (level: number) => {
    const titles = [
      '新手地主',
      '小型投资者',
      '地产商人',
      '区域大亨',
      '城市之王',
      '地产帝国'
    ];
    return titles[Math.min(level, titles.length - 1)];
  };

  const plotsByType = ownedPlots.reduce((acc, plot) => {
    acc[plot.type] = (acc[plot.type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const plotsByRegion = ownedPlots.reduce((acc, plot) => {
    acc[plot.region_id] = (acc[plot.region_id] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <Card title="帝国概览" extra={<CrownOutlined />}>
      <Row gutter={24}>
        <Col span={6}>
          <Statistic 
            title="帝国等级" 
            value={getExpansionTitle(expansionLevel)} 
            prefix={<TrophyOutlined />}
          />
        </Col>
        <Col span={6}>
          <Statistic 
            title="总资产价值" 
            value={totalValue} 
            prefix="¥"
            precision={0}
          />
        </Col>
        <Col span={6}>
          <Statistic 
            title="月收入" 
            value={monthlyIncome} 
            prefix="¥"
            precision={0}
          />
        </Col>
        <Col span={6}>
          <Statistic 
            title="拥有地块" 
            value={ownedPlots.length} 
            suffix="块"
          />
        </Col>
      </Row>
      
      <Divider />
      
      <Row gutter={24}>
        <Col span={12}>
          <Card title="地块类型分布" size="small">
            <List
              size="small"
              dataSource={Object.entries(plotsByType)}
              renderItem={([type, count]) => (
                <List.Item>
                  <Space>
                    <Tag color={getPlotTypeColor(type)}>
                      {getPlotTypeName(type)}
                    </Tag>
                    <span>{count} 块</span>
                  </Space>
                </List.Item>
              )}
            />
          </Card>
        </Col>
        
        <Col span={12}>
          <Card title="区域分布" size="small">
            <List
              size="small"
              dataSource={Object.entries(plotsByRegion)}
              renderItem={([regionId, count]) => (
                <List.Item>
                  <Space>
                    <EnvironmentOutlined />
                    <span>区域 {regionId.slice(-3)}</span>
                    <span>{count} 块</span>
                  </Space>
                </List.Item>
              )}
            />
          </Card>
        </Col>
      </Row>
      
      <Divider />
      
      <Card title="扩张进度" size="small">
        <Steps current={expansionLevel} size="small">
          <Step title="新手" description="1-2块地" />
          <Step title="投资者" description="3-5块地" />
          <Step title="商人" description="6-10块地" />
          <Step title="大亨" description="11-20块地" />
          <Step title="之王" description="21-50块地" />
          <Step title="帝国" description="50+块地" />
        </Steps>
      </Card>
    </Card>
  );
  
  function getPlotTypeColor(type: string): string {
    const colors = {
      residential: 'green',
      commercial: 'blue',
      office: 'purple',
      industrial: 'orange',
      mixed: 'cyan',
      heritage: 'gold'
    };
    return colors[type] || 'default';
  }
  
  function getPlotTypeName(type: string): string {
    const names = {
      residential: '住宅',
      commercial: '商业',
      office: '办公',
      industrial: '工业',
      mixed: '综合',
      heritage: '文化遗产'
    };
    return names[type] || type;
  }
};

// ==================== 主扩张阶段组件 ====================

const ExpansionPhase: React.FC<ExpansionPhaseProps> = ({ 
  gameCycleManager, 
  onPhaseComplete 
}) => {
  const [regions, setRegions] = useState<Region[]>(MOCK_REGIONS);
  const [playerFunds, setPlayerFunds] = useState(3000000);
  const [phaseStats, setPhaseStats] = useState(gameCycleManager.getPhaseStats());
  const [expansionLevel, setExpansionLevel] = useState(1);

  // 更新阶段统计
  useEffect(() => {
    const interval = setInterval(() => {
      setPhaseStats(gameCycleManager.getPhaseStats());
    }, 1000);

    return () => clearInterval(interval);
  }, [gameCycleManager]);

  // 检查阶段完成条件
  useEffect(() => {
    if (gameCycleManager.checkPhaseCompletion()) {
      onPhaseComplete();
    }
  }, [phaseStats, gameCycleManager, onPhaseComplete]);

  const handleUnlockRegion = useCallback((regionId: string) => {
    setRegions(prev => 
      prev.map(region => {
        if (region.id === regionId) {
          setPlayerFunds(funds => funds - region.unlock_cost);
          return { ...region, is_unlocked: true };
        }
        return region;
      })
    );
  }, []);

  const handleExploreRegion = useCallback((regionId: string) => {
    setRegions(prev => 
      prev.map(region => {
        if (region.id === regionId) {
          setPlayerFunds(funds => funds - region.exploration_cost);
          return { ...region, is_explored: true };
        }
        return region;
      })
    );
  }, []);

  const handlePurchasePlot = useCallback((plotId: string) => {
    setRegions(prev => 
      prev.map(region => ({
        ...region,
        plots: region.plots.map(plot => {
          if (plot.id === plotId) {
            setPlayerFunds(funds => funds - plot.price);
            return { ...plot, is_owned: true };
          }
          return plot;
        })
      }))
    );
    
    // 更新扩张等级
    const ownedPlots = regions.flatMap(r => r.plots).filter(p => p.is_owned);
    setExpansionLevel(Math.floor(ownedPlots.length / 3) + 1);
  }, [regions]);

  const handleDevelopPlot = useCallback((plotId: string, developmentType: string) => {
    setRegions(prev => 
      prev.map(region => ({
        ...region,
        plots: region.plots.map(plot => {
          if (plot.id === plotId) {
            const developmentCost = plot.price * 0.3 * (plot.development_level + 1);
            setPlayerFunds(funds => funds - developmentCost);
            
            const incomeIncrease = plot.price * 0.02; // 2% of plot price as income increase
            
            return { 
              ...plot, 
              development_level: plot.development_level + 1,
              monthly_income: plot.monthly_income + incomeIncrease
            };
          }
          return plot;
        })
      }))
    );
  }, []);

  const allPlots = regions.flatMap(region => region.plots);
  const ownedPlots = allPlots.filter(plot => plot.is_owned);
  const totalValue = ownedPlots.reduce((sum, plot) => sum + plot.price, 0);
  const monthlyIncome = ownedPlots.reduce((sum, plot) => sum + plot.monthly_income, 0);
  const unlockedRegions = regions.filter(r => r.is_unlocked).length;
  const exploredRegions = regions.filter(r => r.is_explored).length;

  return (
    <div style={{ padding: '24px' }}>
      {/* 阶段头部信息 */}
      <Card style={{ marginBottom: '24px' }}>
        <Row gutter={24}>
          <Col span={6}>
            <Statistic 
              title="当前阶段" 
              value="扩张阶段" 
              prefix={<RocketOutlined />}
            />
          </Col>
          <Col span={6}>
            <Statistic 
              title="帝国等级" 
              value={expansionLevel} 
              prefix={<CrownOutlined />}
            />
          </Col>
          <Col span={6}>
            <Statistic 
              title="拥有地块" 
              value={ownedPlots.length} 
              suffix="块"
            />
          </Col>
          <Col span={6}>
            <Statistic 
              title="可用资金" 
              value={playerFunds} 
              prefix="¥"
            />
          </Col>
        </Row>
        
        <div style={{ marginTop: '16px' }}>
          <Progress 
            percent={phaseStats.progress} 
            status="active"
            strokeColor={{
              '0%': '#108ee9',
              '100%': '#87d068',
            }}
          />
        </div>
      </Card>

      {/* 阶段目标 */}
      <Card title="扩张目标" style={{ marginBottom: '24px' }}>
        <List
          size="small"
          dataSource={[
            { text: '解锁至少3个新区域', completed: unlockedRegions >= 3 },
            { text: '探索至少2个区域', completed: exploredRegions >= 2 },
            { text: '购买至少5块地块', completed: ownedPlots.length >= 5 },
            { text: '总资产价值达到500万', completed: totalValue >= 5000000 },
            { text: '月收入达到10万', completed: monthlyIncome >= 100000 }
          ]}
          renderItem={item => (
            <List.Item>
              <Space>
                {item.completed ? (
                  <CheckCircleOutlined style={{ color: '#52c41a' }} />
                ) : (
                  <ExclamationCircleOutlined style={{ color: '#faad14' }} />
                )}
                <span style={{ textDecoration: item.completed ? 'line-through' : 'none' }}>
                  {item.text}
                </span>
              </Space>
            </List.Item>
          )}
        />
      </Card>

      {/* 主要功能区域 */}
      <Tabs defaultActiveKey="overview">
        <TabPane tab="帝国概览" key="overview">
          <EmpireOverview
            ownedPlots={ownedPlots}
            totalValue={totalValue}
            monthlyIncome={monthlyIncome}
            expansionLevel={expansionLevel}
          />
        </TabPane>
        
        <TabPane tab="区域探索" key="regions">
          <RegionExplorer
            regions={regions}
            onExploreRegion={handleExploreRegion}
            onUnlockRegion={handleUnlockRegion}
            playerFunds={playerFunds}
          />
        </TabPane>
        
        <TabPane tab="地块管理" key="plots">
          <PlotManager
            plots={allPlots}
            onPurchasePlot={handlePurchasePlot}
            onDevelopPlot={handleDevelopPlot}
            playerFunds={playerFunds}
          />
        </TabPane>
      </Tabs>

      {/* 阶段完成按钮 */}
      <div style={{ textAlign: 'center', marginTop: '24px' }}>
        <Button 
          type="primary" 
          size="large"
          disabled={!gameCycleManager.checkPhaseCompletion()}
          onClick={onPhaseComplete}
        >
          完成扩张阶段
        </Button>
      </div>
    </div>
  );
};

export default ExpansionPhase;