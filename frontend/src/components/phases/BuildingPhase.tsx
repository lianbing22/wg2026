/**
 * 物业管理模拟器 - 建设阶段组件
 * 实现建筑规划、施工管理、进度追踪等建设阶段核心功能
 */

import React, { useState, useEffect, useCallback } from 'react';
import { Card, Button, Progress, Modal, Form, Select, InputNumber, List, Tag, Tooltip, Space, Row, Col, Statistic, Alert } from 'antd';
import { 
  BuildOutlined, 
  TeamOutlined, 
  DollarOutlined, 
  ClockCircleOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  ToolOutlined,
  HomeOutlined
} from '@ant-design/icons';
import { 
  BuildingConfig, 
  ConstructionProject, 
  WorkerTeam, 
  BuildingType,
  GameCycleState 
} from '../../types/game-redesign';
import { GameCycleManager } from '../../utils/game-cycle-manager';

// ==================== 接口定义 ====================

interface BuildingPhaseProps {
  gameCycleManager: GameCycleManager;
  onPhaseComplete: () => void;
}

interface BuildingPlannerProps {
  availableBuildings: BuildingConfig[];
  onStartConstruction: (config: BuildingConfig) => void;
  playerFunds: number;
}

interface ConstructionManagerProps {
  activeProjects: ConstructionProject[];
  onUpdateProject: (projectId: string, updates: Partial<ConstructionProject>) => void;
}

interface WorkerManagementProps {
  availableWorkers: WorkerTeam[];
  onHireWorker: (workerId: string, projectId: string) => void;
}

// ==================== 建筑配置数据 ====================

const BUILDING_CONFIGS: BuildingConfig[] = [
  {
    id: 'apartment_basic',
    name: '基础公寓',
    type: 'apartment',
    category: 'residential',
    cost: 50000,
    constructionTime: 24,
    maintenanceCost: 500,
    capacity: 4,
    requirements: {
      land_size: 100,
      utilities: ['water', 'electricity'],
      permits: ['residential_permit']
    },
    effects: {
      tenant_attraction: 60,
      property_value: 80000,
      operating_cost: 300,
      satisfaction_bonus: 10
    }
  },
  {
    id: 'villa_luxury',
    name: '豪华别墅',
    type: 'villa',
    category: 'residential',
    cost: 200000,
    constructionTime: 72,
    maintenanceCost: 2000,
    capacity: 1,
    requirements: {
      land_size: 500,
      utilities: ['water', 'electricity', 'gas'],
      permits: ['residential_permit', 'luxury_permit']
    },
    effects: {
      tenant_attraction: 95,
      property_value: 350000,
      operating_cost: 800,
      satisfaction_bonus: 30
    },
    unlockConditions: {
      player_level: 5,
      completed_buildings: ['apartment_basic'],
      reputation_required: 70
    }
  },
  {
    id: 'commercial_shop',
    name: '商业店铺',
    type: 'shop',
    category: 'commercial',
    cost: 80000,
    constructionTime: 36,
    maintenanceCost: 800,
    capacity: 2,
    requirements: {
      land_size: 150,
      utilities: ['water', 'electricity'],
      permits: ['commercial_permit']
    },
    effects: {
      tenant_attraction: 70,
      property_value: 120000,
      operating_cost: 400,
      satisfaction_bonus: 15
    }
  },
  {
    id: 'amenity_gym',
    name: '健身房',
    type: 'gym',
    category: 'amenity',
    cost: 30000,
    constructionTime: 18,
    maintenanceCost: 600,
    capacity: 50,
    requirements: {
      land_size: 200,
      utilities: ['water', 'electricity'],
      permits: ['amenity_permit']
    },
    effects: {
      tenant_attraction: 40,
      property_value: 25000,
      operating_cost: 500,
      satisfaction_bonus: 25
    }
  }
];

const WORKER_TEAMS: WorkerTeam[] = [
  {
    id: 'team_basic',
    name: '基础施工队',
    specialization: 'general',
    efficiency: 70,
    cost_per_hour: 50,
    availability: true,
    reputation: 60
  },
  {
    id: 'team_expert',
    name: '专业建筑队',
    specialization: 'residential',
    efficiency: 90,
    cost_per_hour: 80,
    availability: true,
    reputation: 85
  },
  {
    id: 'team_luxury',
    name: '豪华装修队',
    specialization: 'luxury',
    efficiency: 95,
    cost_per_hour: 120,
    availability: false,
    reputation: 95
  }
];

// ==================== 建筑规划器组件 ====================

const BuildingPlanner: React.FC<BuildingPlannerProps> = ({ 
  availableBuildings, 
  onStartConstruction, 
  playerFunds 
}) => {
  const [selectedBuilding, setSelectedBuilding] = useState<BuildingConfig | null>(null);
  const [planModalVisible, setPlanModalVisible] = useState(false);

  const handlePlanBuilding = (building: BuildingConfig) => {
    setSelectedBuilding(building);
    setPlanModalVisible(true);
  };

  const handleConfirmConstruction = () => {
    if (selectedBuilding) {
      onStartConstruction(selectedBuilding);
      setPlanModalVisible(false);
      setSelectedBuilding(null);
    }
  };

  const getBuildingTypeIcon = (type: BuildingType) => {
    const icons = {
      apartment: <HomeOutlined />,
      villa: <HomeOutlined />,
      shop: <BuildOutlined />,
      office: <BuildOutlined />,
      gym: <ToolOutlined />,
      pool: <ToolOutlined />,
      garden: <ToolOutlined />,
      security: <ToolOutlined />
    };
    return icons[type] || <BuildOutlined />;
  };

  const canAfford = (cost: number) => playerFunds >= cost;

  return (
    <Card title="建筑规划" extra={<BuildOutlined />}>
      <Row gutter={[16, 16]}>
        {availableBuildings.map(building => (
          <Col xs={24} sm={12} md={8} lg={6} key={building.id}>
            <Card
              size="small"
              hoverable
              cover={
                <div style={{ padding: '20px', textAlign: 'center', backgroundColor: '#f5f5f5' }}>
                  <div style={{ fontSize: '24px', color: '#1890ff' }}>
                    {getBuildingTypeIcon(building.type)}
                  </div>
                </div>
              }
              actions={[
                <Button 
                  type="primary" 
                  size="small"
                  disabled={!canAfford(building.cost)}
                  onClick={() => handlePlanBuilding(building)}
                >
                  规划建设
                </Button>
              ]}
            >
              <Card.Meta
                title={building.name}
                description={
                  <Space direction="vertical" size="small" style={{ width: '100%' }}>
                    <div>
                      <Tag color={building.category === 'residential' ? 'blue' : 
                                 building.category === 'commercial' ? 'green' : 'orange'}>
                        {building.category === 'residential' ? '住宅' :
                         building.category === 'commercial' ? '商业' : '配套'}
                      </Tag>
                    </div>
                    <div style={{ fontSize: '12px' }}>
                      <div>成本: ¥{building.cost.toLocaleString()}</div>
                      <div>工期: {building.constructionTime}小时</div>
                      <div>容量: {building.capacity}人</div>
                    </div>
                  </Space>
                }
              />
            </Card>
          </Col>
        ))}
      </Row>

      <Modal
        title="建设规划确认"
        open={planModalVisible}
        onOk={handleConfirmConstruction}
        onCancel={() => setPlanModalVisible(false)}
        okText="开始建设"
        cancelText="取消"
      >
        {selectedBuilding && (
          <Space direction="vertical" style={{ width: '100%' }}>
            <Alert
              message={`准备建设: ${selectedBuilding.name}`}
              type="info"
              showIcon
            />
            
            <Row gutter={16}>
              <Col span={12}>
                <Statistic title="建设成本" value={selectedBuilding.cost} prefix="¥" />
              </Col>
              <Col span={12}>
                <Statistic title="预计工期" value={selectedBuilding.constructionTime} suffix="小时" />
              </Col>
            </Row>
            
            <Row gutter={16}>
              <Col span={12}>
                <Statistic title="月维护费" value={selectedBuilding.maintenanceCost} prefix="¥" />
              </Col>
              <Col span={12}>
                <Statistic title="容纳人数" value={selectedBuilding.capacity} suffix="人" />
              </Col>
            </Row>

            <div>
              <h4>建设要求:</h4>
              <ul>
                <li>土地面积: {selectedBuilding.requirements.land_size}平方米</li>
                <li>公用设施: {selectedBuilding.requirements.utilities.join(', ')}</li>
                <li>许可证: {selectedBuilding.requirements.permits.join(', ')}</li>
              </ul>
            </div>

            <div>
              <h4>预期效果:</h4>
              <ul>
                <li>租户吸引力: +{selectedBuilding.effects.tenant_attraction}</li>
                <li>物业价值: ¥{selectedBuilding.effects.property_value.toLocaleString()}</li>
                <li>满意度加成: +{selectedBuilding.effects.satisfaction_bonus}</li>
              </ul>
            </div>
          </Space>
        )}
      </Modal>
    </Card>
  );
};

// ==================== 施工管理组件 ====================

const ConstructionManager: React.FC<ConstructionManagerProps> = ({ 
  activeProjects, 
  onUpdateProject 
}) => {
  const getStatusColor = (status: ConstructionProject['status']) => {
    const colors = {
      planned: 'blue',
      in_progress: 'orange',
      completed: 'green',
      paused: 'red'
    };
    return colors[status];
  };

  const getStatusText = (status: ConstructionProject['status']) => {
    const texts = {
      planned: '计划中',
      in_progress: '施工中',
      completed: '已完成',
      paused: '已暂停'
    };
    return texts[status];
  };

  const handlePauseProject = (projectId: string) => {
    onUpdateProject(projectId, { status: 'paused' });
  };

  const handleResumeProject = (projectId: string) => {
    onUpdateProject(projectId, { status: 'in_progress' });
  };

  return (
    <Card title="施工管理" extra={<ToolOutlined />}>
      {activeProjects.length === 0 ? (
        <Alert message="当前没有进行中的建设项目" type="info" showIcon />
      ) : (
        <List
          dataSource={activeProjects}
          renderItem={project => (
            <List.Item
              actions={[
                project.status === 'in_progress' ? (
                  <Button size="small" onClick={() => handlePauseProject(project.id)}>
                    暂停
                  </Button>
                ) : project.status === 'paused' ? (
                  <Button size="small" type="primary" onClick={() => handleResumeProject(project.id)}>
                    继续
                  </Button>
                ) : null
              ]}
            >
              <List.Item.Meta
                avatar={
                  <div style={{ fontSize: '24px', color: '#1890ff' }}>
                    <BuildOutlined />
                  </div>
                }
                title={
                  <Space>
                    {project.buildingConfig.name}
                    <Tag color={getStatusColor(project.status)}>
                      {getStatusText(project.status)}
                    </Tag>
                  </Space>
                }
                description={
                  <Space direction="vertical" style={{ width: '100%' }}>
                    <Progress 
                      percent={project.progress} 
                      status={project.status === 'paused' ? 'exception' : 'active'}
                      size="small"
                    />
                    <Row gutter={16}>
                      <Col span={8}>
                        <Statistic 
                          title="质量评级" 
                          value={project.qualityRating} 
                          suffix="/100"
                          valueStyle={{ fontSize: '14px' }}
                        />
                      </Col>
                      <Col span={8}>
                        <Statistic 
                          title="实际成本" 
                          value={project.actualCost} 
                          prefix="¥"
                          valueStyle={{ fontSize: '14px' }}
                        />
                      </Col>
                      <Col span={8}>
                        <Statistic 
                          title="预计完成" 
                          value={project.estimatedCompletion.toLocaleDateString()}
                          valueStyle={{ fontSize: '14px' }}
                        />
                      </Col>
                    </Row>
                    {project.complications.length > 0 && (
                      <Alert
                        message="施工问题"
                        description={project.complications.join(', ')}
                        type="warning"
                        size="small"
                        showIcon
                      />
                    )}
                  </Space>
                }
              />
            </List.Item>
          )}
        />
      )}
    </Card>
  );
};

// ==================== 工人管理组件 ====================

const WorkerManagement: React.FC<WorkerManagementProps> = ({ 
  availableWorkers, 
  onHireWorker 
}) => {
  const [selectedProject, setSelectedProject] = useState<string>('');

  return (
    <Card title="工人管理" extra={<TeamOutlined />}>
      <Space direction="vertical" style={{ width: '100%' }}>
        <Select
          placeholder="选择要分配工人的项目"
          style={{ width: '100%' }}
          value={selectedProject}
          onChange={setSelectedProject}
        >
          <Select.Option value="project_1">基础公寓建设</Select.Option>
          <Select.Option value="project_2">商业店铺建设</Select.Option>
        </Select>

        <List
          dataSource={availableWorkers}
          renderItem={worker => (
            <List.Item
              actions={[
                <Button 
                  size="small" 
                  type="primary"
                  disabled={!worker.availability || !selectedProject}
                  onClick={() => onHireWorker(worker.id, selectedProject)}
                >
                  {worker.availability ? '雇佣' : '不可用'}
                </Button>
              ]}
            >
              <List.Item.Meta
                avatar={
                  <div style={{ fontSize: '20px', color: worker.availability ? '#52c41a' : '#d9d9d9' }}>
                    <TeamOutlined />
                  </div>
                }
                title={
                  <Space>
                    {worker.name}
                    <Tag color={worker.efficiency > 80 ? 'green' : worker.efficiency > 60 ? 'orange' : 'red'}>
                      效率: {worker.efficiency}%
                    </Tag>
                  </Space>
                }
                description={
                  <Space direction="vertical" size="small">
                    <div>专业: {worker.specialization}</div>
                    <div>时薪: ¥{worker.cost_per_hour}</div>
                    <div>声誉: {worker.reputation}/100</div>
                  </Space>
                }
              />
            </List.Item>
          )}
        />
      </Space>
    </Card>
  );
};

// ==================== 主建设阶段组件 ====================

const BuildingPhase: React.FC<BuildingPhaseProps> = ({ 
  gameCycleManager, 
  onPhaseComplete 
}) => {
  const [activeProjects, setActiveProjects] = useState<ConstructionProject[]>([]);
  const [playerFunds, setPlayerFunds] = useState(100000);
  const [phaseStats, setPhaseStats] = useState(gameCycleManager.getPhaseStats());

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

  const handleStartConstruction = useCallback((config: BuildingConfig) => {
    if (playerFunds >= config.cost) {
      const project = gameCycleManager.startConstructionProject(config);
      setActiveProjects(prev => [...prev, project]);
      setPlayerFunds(prev => prev - config.cost);
      
      // 更新阶段进度
      gameCycleManager.updatePhaseProgress(phaseStats.progress + 25);
    }
  }, [playerFunds, gameCycleManager, phaseStats.progress]);

  const handleUpdateProject = useCallback((projectId: string, updates: Partial<ConstructionProject>) => {
    setActiveProjects(prev => 
      prev.map(project => 
        project.id === projectId ? { ...project, ...updates } : project
      )
    );
  }, []);

  const handleHireWorker = useCallback((workerId: string, projectId: string) => {
    console.log(`雇佣工人 ${workerId} 到项目 ${projectId}`);
    // 实现工人分配逻辑
  }, []);

  const handleCompleteObjective = (objective: string) => {
    gameCycleManager.completeObjective(objective);
  };

  return (
    <div style={{ padding: '24px' }}>
      {/* 阶段头部信息 */}
      <Card style={{ marginBottom: '24px' }}>
        <Row gutter={24}>
          <Col span={6}>
            <Statistic 
              title="当前阶段" 
              value="建设阶段" 
              prefix={<BuildOutlined />}
            />
          </Col>
          <Col span={6}>
            <Statistic 
              title="阶段进度" 
              value={phaseStats.progress} 
              suffix="%"
              prefix={<ClockCircleOutlined />}
            />
          </Col>
          <Col span={6}>
            <Statistic 
              title="可用资金" 
              value={playerFunds} 
              prefix="¥"
            />
          </Col>
          <Col span={6}>
            <Statistic 
              title="目标完成" 
              value={`${phaseStats.objectivesCompleted}/${phaseStats.totalObjectives}`}
              prefix={<CheckCircleOutlined />}
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
      <Card title="阶段目标" style={{ marginBottom: '24px' }}>
        <List
          size="small"
          dataSource={[
            { text: '完成至少1个建设项目', completed: activeProjects.some(p => p.status === 'completed') },
            { text: '保持建设质量在80%以上', completed: activeProjects.every(p => p.qualityRating >= 80) },
            { text: '控制成本在预算内', completed: true }
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
                {item.completed && (
                  <Button 
                    size="small" 
                    type="link"
                    onClick={() => handleCompleteObjective(item.text)}
                  >
                    确认完成
                  </Button>
                )}
              </Space>
            </List.Item>
          )}
        />
      </Card>

      {/* 主要功能区域 */}
      <Row gutter={[24, 24]}>
        <Col span={24}>
          <BuildingPlanner
            availableBuildings={BUILDING_CONFIGS}
            onStartConstruction={handleStartConstruction}
            playerFunds={playerFunds}
          />
        </Col>
        
        <Col span={16}>
          <ConstructionManager
            activeProjects={activeProjects}
            onUpdateProject={handleUpdateProject}
          />
        </Col>
        
        <Col span={8}>
          <WorkerManagement
            availableWorkers={WORKER_TEAMS}
            onHireWorker={handleHireWorker}
          />
        </Col>
      </Row>

      {/* 阶段完成按钮 */}
      <div style={{ textAlign: 'center', marginTop: '24px' }}>
        <Button 
          type="primary" 
          size="large"
          disabled={!gameCycleManager.checkPhaseCompletion()}
          onClick={onPhaseComplete}
        >
          完成建设阶段
        </Button>
      </div>
    </div>
  );
};

export default BuildingPhase;