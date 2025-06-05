/**
 * 物业管理模拟器 - 探险阶段组件
 * 实现装备系统、技能树、任务管理等探险阶段核心功能
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
  Tree,
  Badge,
  Divider,
  Timeline,
  Rate
} from 'antd';
import { 
  CompassOutlined, 
  TrophyOutlined, 
  ToolOutlined,
  StarOutlined,
  ThunderboltOutlined,
  SafetyOutlined,
  SwordOutlined,
  GiftOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  RocketOutlined,
  CrownOutlined,
  FireOutlined
} from '@ant-design/icons';
import { 
  Equipment, 
  SkillTree, 
  ExplorationMission, 
  MissionResult,
  GameCycleState 
} from '../../types/game-redesign';
import { GameCycleManager } from '../../utils/game-cycle-manager';

const { TabPane } = Tabs;
const { Option } = Select;
const { TreeNode } = Tree;

// ==================== 接口定义 ====================

interface ExplorationPhaseProps {
  gameCycleManager: GameCycleManager;
  onPhaseComplete: () => void;
}

interface EquipmentManagerProps {
  equipment: Equipment[];
  onEquipItem: (equipmentId: string) => void;
  onUpgradeItem: (equipmentId: string) => void;
}

interface SkillTreeProps {
  skillTree: SkillTree;
  onUnlockSkill: (skillId: string) => void;
  availablePoints: number;
}

interface MissionBoardProps {
  missions: ExplorationMission[];
  onStartMission: (missionId: string) => void;
  onCompleteMission: (missionId: string, result: MissionResult) => void;
}

// ==================== 模拟数据 ====================

const MOCK_EQUIPMENT: Equipment[] = [
  {
    id: 'eq_001',
    name: '基础工具包',
    type: 'tool',
    rarity: 'common',
    level: 1,
    stats: {
      efficiency: 10,
      durability: 100,
      special_effects: []
    },
    requirements: {
      player_level: 1,
      skills: []
    },
    upgrade_cost: 500,
    description: '包含基本维修工具的工具包'
  },
  {
    id: 'eq_002',
    name: '高级测量仪',
    type: 'instrument',
    rarity: 'rare',
    level: 3,
    stats: {
      efficiency: 25,
      durability: 150,
      special_effects: ['precision_bonus']
    },
    requirements: {
      player_level: 5,
      skills: ['measurement']
    },
    upgrade_cost: 1500,
    description: '精确测量房屋结构的专业仪器'
  },
  {
    id: 'eq_003',
    name: '传奇建筑师之锤',
    type: 'tool',
    rarity: 'legendary',
    level: 5,
    stats: {
      efficiency: 50,
      durability: 300,
      special_effects: ['master_craftsmanship', 'inspiration_aura']
    },
    requirements: {
      player_level: 15,
      skills: ['construction_mastery', 'leadership']
    },
    upgrade_cost: 5000,
    description: '传说中大师级建筑师使用的神器'
  }
];

const MOCK_SKILL_TREE: SkillTree = {
  id: 'property_management_tree',
  name: '物业管理技能树',
  categories: [
    {
      id: 'construction',
      name: '建设技能',
      skills: [
        {
          id: 'basic_construction',
          name: '基础建设',
          description: '提高建设效率10%',
          level: 1,
          max_level: 5,
          cost: 1,
          prerequisites: [],
          effects: {
            construction_speed: 10,
            construction_quality: 5
          },
          unlocked: true
        },
        {
          id: 'advanced_planning',
          name: '高级规划',
          description: '减少建设成本15%',
          level: 0,
          max_level: 3,
          cost: 2,
          prerequisites: ['basic_construction'],
          effects: {
            construction_cost: -15,
            planning_efficiency: 20
          },
          unlocked: false
        },
        {
          id: 'construction_mastery',
          name: '建设大师',
          description: '解锁特殊建筑类型',
          level: 0,
          max_level: 1,
          cost: 5,
          prerequisites: ['advanced_planning'],
          effects: {
            unlock_special_buildings: true,
            construction_quality: 25
          },
          unlocked: false
        }
      ]
    },
    {
      id: 'management',
      name: '管理技能',
      skills: [
        {
          id: 'tenant_relations',
          name: '租户关系',
          description: '提高租户满意度15%',
          level: 2,
          max_level: 5,
          cost: 1,
          prerequisites: [],
          effects: {
            tenant_satisfaction: 15,
            complaint_resolution: 10
          },
          unlocked: true
        },
        {
          id: 'negotiation',
          name: '谈判技巧',
          description: '降低供应商成本10%',
          level: 1,
          max_level: 3,
          cost: 2,
          prerequisites: ['tenant_relations'],
          effects: {
            supplier_cost: -10,
            contract_terms: 15
          },
          unlocked: true
        },
        {
          id: 'leadership',
          name: '领导力',
          description: '提高团队效率20%',
          level: 0,
          max_level: 3,
          cost: 3,
          prerequisites: ['negotiation'],
          effects: {
            team_efficiency: 20,
            worker_loyalty: 15
          },
          unlocked: false
        }
      ]
    }
  ]
};

const MOCK_MISSIONS: ExplorationMission[] = [
  {
    id: 'mission_001',
    title: '古老建筑勘探',
    description: '探索城市中的古老建筑，寻找有价值的建筑技术和材料',
    type: 'exploration',
    difficulty: 'easy',
    duration: 2,
    requirements: {
      player_level: 3,
      equipment: ['basic_tools'],
      skills: ['basic_construction']
    },
    rewards: {
      experience: 100,
      money: 1000,
      items: ['ancient_blueprint'],
      skill_points: 1
    },
    risks: [
      {
        type: 'structural_damage',
        probability: 0.2,
        consequence: 'equipment_damage'
      }
    ],
    status: 'available'
  },
  {
    id: 'mission_002',
    title: '豪华区域调研',
    description: '深入豪华住宅区，学习高端物业管理经验',
    type: 'research',
    difficulty: 'medium',
    duration: 4,
    requirements: {
      player_level: 8,
      equipment: ['measurement_tools'],
      skills: ['tenant_relations', 'negotiation']
    },
    rewards: {
      experience: 300,
      money: 3000,
      items: ['luxury_management_guide'],
      skill_points: 2
    },
    risks: [
      {
        type: 'reputation_risk',
        probability: 0.15,
        consequence: 'reputation_loss'
      }
    ],
    status: 'available'
  },
  {
    id: 'mission_003',
    title: '传奇大师寻访',
    description: '寻找传说中的建筑大师，获得终极建筑秘籍',
    type: 'legendary',
    difficulty: 'legendary',
    duration: 8,
    requirements: {
      player_level: 20,
      equipment: ['legendary_tools'],
      skills: ['construction_mastery', 'leadership']
    },
    rewards: {
      experience: 1000,
      money: 10000,
      items: ['master_techniques'],
      skill_points: 5
    },
    risks: [
      {
        type: 'extreme_challenge',
        probability: 0.4,
        consequence: 'mission_failure'
      }
    ],
    status: 'locked'
  }
];

// ==================== 装备管理组件 ====================

const EquipmentManager: React.FC<EquipmentManagerProps> = ({ 
  equipment, 
  onEquipItem, 
  onUpgradeItem 
}) => {
  const getRarityColor = (rarity: string) => {
    const colors = {
      common: '#d9d9d9',
      uncommon: '#52c41a',
      rare: '#1890ff',
      epic: '#722ed1',
      legendary: '#fa8c16'
    };
    return colors[rarity] || '#d9d9d9';
  };

  const getRarityName = (rarity: string) => {
    const names = {
      common: '普通',
      uncommon: '优秀',
      rare: '稀有',
      epic: '史诗',
      legendary: '传奇'
    };
    return names[rarity] || rarity;
  };

  const getTypeIcon = (type: string) => {
    const icons = {
      tool: <ToolOutlined />,
      instrument: <CompassOutlined />,
      armor: <SafetyOutlined />,
      weapon: <SwordOutlined />
    };
    return icons[type] || <ToolOutlined />;
  };

  const columns = [
    {
      title: '装备',
      dataIndex: 'name',
      key: 'name',
      render: (name: string, record: Equipment) => (
        <Space>
          <div style={{ fontSize: '16px', color: getRarityColor(record.rarity) }}>
            {getTypeIcon(record.type)}
          </div>
          <div>
            <div>{name}</div>
            <Tag color={getRarityColor(record.rarity)}>
              {getRarityName(record.rarity)}
            </Tag>
          </div>
        </Space>
      )
    },
    {
      title: '等级',
      dataIndex: 'level',
      key: 'level',
      render: (level: number) => (
        <Badge count={level} style={{ backgroundColor: '#52c41a' }} />
      )
    },
    {
      title: '效率',
      dataIndex: ['stats', 'efficiency'],
      key: 'efficiency',
      render: (efficiency: number) => (
        <Progress percent={efficiency} size="small" strokeColor="#52c41a" />
      )
    },
    {
      title: '耐久度',
      dataIndex: ['stats', 'durability'],
      key: 'durability',
      render: (durability: number) => (
        <Progress percent={durability} size="small" strokeColor="#1890ff" />
      )
    },
    {
      title: '特殊效果',
      dataIndex: ['stats', 'special_effects'],
      key: 'special_effects',
      render: (effects: string[]) => (
        <Space wrap>
          {effects.map(effect => (
            <Tag key={effect} color="purple" icon={<StarOutlined />}>
              {effect === 'precision_bonus' ? '精确加成' :
               effect === 'master_craftsmanship' ? '大师工艺' :
               effect === 'inspiration_aura' ? '灵感光环' : effect}
            </Tag>
          ))}
        </Space>
      )
    },
    {
      title: '操作',
      key: 'actions',
      render: (_, record: Equipment) => (
        <Space>
          <Button size="small" type="primary" onClick={() => onEquipItem(record.id)}>
            装备
          </Button>
          <Button size="small" onClick={() => onUpgradeItem(record.id)}>
            升级 (¥{record.upgrade_cost})
          </Button>
        </Space>
      )
    }
  ];

  return (
    <Card title="装备管理" extra={<ToolOutlined />}>
      <Table 
        dataSource={equipment} 
        columns={columns} 
        rowKey="id"
        size="small"
        pagination={{ pageSize: 5 }}
        expandable={{
          expandedRowRender: (record) => (
            <div style={{ padding: '16px', backgroundColor: '#fafafa' }}>
              <p><strong>描述:</strong> {record.description}</p>
              <p><strong>需求:</strong> 等级 {record.requirements.player_level}, 技能: {record.requirements.skills.join(', ')}</p>
            </div>
          )
        }}
      />
    </Card>
  );
};

// ==================== 技能树组件 ====================

const SkillTreeComponent: React.FC<SkillTreeProps> = ({ 
  skillTree, 
  onUnlockSkill, 
  availablePoints 
}) => {
  const [selectedSkill, setSelectedSkill] = useState<any>(null);
  const [skillModalVisible, setSkillModalVisible] = useState(false);

  const handleSkillClick = (skill: any) => {
    setSelectedSkill(skill);
    setSkillModalVisible(true);
  };

  const handleUnlockSkill = () => {
    if (selectedSkill && availablePoints >= selectedSkill.cost) {
      onUnlockSkill(selectedSkill.id);
      setSkillModalVisible(false);
    }
  };

  const canUnlockSkill = (skill: any) => {
    return availablePoints >= skill.cost && 
           skill.prerequisites.every((prereq: string) => 
             skillTree.categories.some(cat => 
               cat.skills.some(s => s.id === prereq && s.unlocked)
             )
           );
  };

  return (
    <Card title="技能树" extra={<Space><ThunderboltOutlined /> 可用点数: {availablePoints}</Space>}>
      <Tabs>
        {skillTree.categories.map(category => (
          <TabPane tab={category.name} key={category.id}>
            <Row gutter={[16, 16]}>
              {category.skills.map(skill => (
                <Col xs={24} sm={12} md={8} key={skill.id}>
                  <Card
                    size="small"
                    hoverable
                    onClick={() => handleSkillClick(skill)}
                    style={{
                      border: skill.unlocked ? '2px solid #52c41a' : 
                             canUnlockSkill(skill) ? '2px solid #1890ff' : '1px solid #d9d9d9',
                      opacity: skill.unlocked ? 1 : canUnlockSkill(skill) ? 0.9 : 0.6
                    }}
                  >
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ 
                        fontSize: '24px', 
                        color: skill.unlocked ? '#52c41a' : canUnlockSkill(skill) ? '#1890ff' : '#d9d9d9',
                        marginBottom: '8px'
                      }}>
                        {skill.unlocked ? <CheckCircleOutlined /> : 
                         canUnlockSkill(skill) ? <StarOutlined /> : <ExclamationCircleOutlined />}
                      </div>
                      <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>
                        {skill.name}
                      </div>
                      <div style={{ fontSize: '12px', color: '#666', marginBottom: '8px' }}>
                        {skill.description}
                      </div>
                      <div>
                        <Tag color={skill.unlocked ? 'green' : 'blue'}>
                          等级 {skill.level}/{skill.max_level}
                        </Tag>
                        <Tag color="orange">
                          消耗 {skill.cost} 点
                        </Tag>
                      </div>
                    </div>
                  </Card>
                </Col>
              ))}
            </Row>
          </TabPane>
        ))}
      </Tabs>

      <Modal
        title="技能详情"
        open={skillModalVisible}
        onOk={handleUnlockSkill}
        onCancel={() => setSkillModalVisible(false)}
        okText={selectedSkill?.unlocked ? "已解锁" : "解锁技能"}
        okButtonProps={{ disabled: selectedSkill?.unlocked || !canUnlockSkill(selectedSkill) }}
        cancelText="取消"
      >
        {selectedSkill && (
          <Space direction="vertical" style={{ width: '100%' }}>
            <Alert
              message={selectedSkill.name}
              description={selectedSkill.description}
              type={selectedSkill.unlocked ? "success" : "info"}
              showIcon
            />
            
            <Row gutter={16}>
              <Col span={12}>
                <Statistic title="当前等级" value={`${selectedSkill.level}/${selectedSkill.max_level}`} />
              </Col>
              <Col span={12}>
                <Statistic title="解锁成本" value={selectedSkill.cost} suffix="点" />
              </Col>
            </Row>

            {selectedSkill.prerequisites.length > 0 && (
              <div>
                <h4>前置技能:</h4>
                <Space wrap>
                  {selectedSkill.prerequisites.map((prereq: string) => (
                    <Tag key={prereq} color="blue">{prereq}</Tag>
                  ))}
                </Space>
              </div>
            )}

            <div>
              <h4>技能效果:</h4>
              <ul>
                {Object.entries(selectedSkill.effects).map(([key, value]) => (
                  <li key={key}>
                    {key === 'construction_speed' ? '建设速度' :
                     key === 'construction_quality' ? '建设质量' :
                     key === 'construction_cost' ? '建设成本' :
                     key === 'tenant_satisfaction' ? '租户满意度' :
                     key === 'team_efficiency' ? '团队效率' : key}: 
                    {typeof value === 'boolean' ? (value ? '是' : '否') : `${value > 0 ? '+' : ''}${value}${typeof value === 'number' && Math.abs(value) < 1 ? '%' : ''}`}
                  </li>
                ))}
              </ul>
            </div>
          </Space>
        )}
      </Modal>
    </Card>
  );
};

// ==================== 任务面板组件 ====================

const MissionBoard: React.FC<MissionBoardProps> = ({ 
  missions, 
  onStartMission, 
  onCompleteMission 
}) => {
  const [selectedMission, setSelectedMission] = useState<ExplorationMission | null>(null);
  const [missionModalVisible, setMissionModalVisible] = useState(false);

  const getDifficultyColor = (difficulty: string) => {
    const colors = {
      easy: 'green',
      medium: 'orange',
      hard: 'red',
      legendary: 'purple'
    };
    return colors[difficulty] || 'default';
  };

  const getDifficultyName = (difficulty: string) => {
    const names = {
      easy: '简单',
      medium: '中等',
      hard: '困难',
      legendary: '传奇'
    };
    return names[difficulty] || difficulty;
  };

  const getTypeIcon = (type: string) => {
    const icons = {
      exploration: <CompassOutlined />,
      research: <RocketOutlined />,
      legendary: <CrownOutlined />,
      combat: <SwordOutlined />
    };
    return icons[type] || <CompassOutlined />;
  };

  const handleMissionClick = (mission: ExplorationMission) => {
    setSelectedMission(mission);
    setMissionModalVisible(true);
  };

  const handleStartMission = () => {
    if (selectedMission) {
      onStartMission(selectedMission.id);
      setMissionModalVisible(false);
    }
  };

  return (
    <Card title="探险任务" extra={<CompassOutlined />}>
      <List
        dataSource={missions}
        renderItem={mission => (
          <List.Item
            actions={[
              mission.status === 'available' ? (
                <Button size="small" type="primary" onClick={() => handleMissionClick(mission)}>
                  查看详情
                </Button>
              ) : mission.status === 'locked' ? (
                <Button size="small" disabled>
                  未解锁
                </Button>
              ) : (
                <Button size="small" onClick={() => onCompleteMission(mission.id, {} as MissionResult)}>
                  完成任务
                </Button>
              )
            ]}
          >
            <List.Item.Meta
              avatar={
                <div style={{ 
                  fontSize: '24px', 
                  color: mission.status === 'locked' ? '#d9d9d9' : '#1890ff'
                }}>
                  {getTypeIcon(mission.type)}
                </div>
              }
              title={
                <Space>
                  {mission.title}
                  <Tag color={getDifficultyColor(mission.difficulty)}>
                    {getDifficultyName(mission.difficulty)}
                  </Tag>
                  <Tag color="blue">
                    {mission.duration}小时
                  </Tag>
                </Space>
              }
              description={
                <Space direction="vertical" style={{ width: '100%' }}>
                  <div>{mission.description}</div>
                  <div style={{ fontSize: '12px', color: '#666' }}>
                    奖励: {mission.rewards.experience}经验, ¥{mission.rewards.money}, {mission.rewards.skill_points}技能点
                  </div>
                </Space>
              }
            />
          </List.Item>
        )}
      />

      <Modal
        title="任务详情"
        open={missionModalVisible}
        onOk={handleStartMission}
        onCancel={() => setMissionModalVisible(false)}
        okText="开始任务"
        okButtonProps={{ disabled: selectedMission?.status !== 'available' }}
        cancelText="取消"
        width={600}
      >
        {selectedMission && (
          <Space direction="vertical" style={{ width: '100%' }}>
            <Alert
              message={selectedMission.title}
              description={selectedMission.description}
              type="info"
              showIcon
            />
            
            <Row gutter={16}>
              <Col span={8}>
                <Statistic title="难度" value={getDifficultyName(selectedMission.difficulty)} />
              </Col>
              <Col span={8}>
                <Statistic title="预计时间" value={selectedMission.duration} suffix="小时" />
              </Col>
              <Col span={8}>
                <Statistic title="类型" value={
                  selectedMission.type === 'exploration' ? '探索' :
                  selectedMission.type === 'research' ? '研究' :
                  selectedMission.type === 'legendary' ? '传奇' : '战斗'
                } />
              </Col>
            </Row>

            <Card title="任务要求" size="small">
              <ul>
                <li>玩家等级: {selectedMission.requirements.player_level}</li>
                <li>装备要求: {selectedMission.requirements.equipment.join(', ')}</li>
                <li>技能要求: {selectedMission.requirements.skills.join(', ')}</li>
              </ul>
            </Card>

            <Card title="任务奖励" size="small">
              <Row gutter={16}>
                <Col span={6}>
                  <Statistic title="经验" value={selectedMission.rewards.experience} prefix={<TrophyOutlined />} />
                </Col>
                <Col span={6}>
                  <Statistic title="金钱" value={selectedMission.rewards.money} prefix="¥" />
                </Col>
                <Col span={6}>
                  <Statistic title="技能点" value={selectedMission.rewards.skill_points} prefix={<StarOutlined />} />
                </Col>
                <Col span={6}>
                  <div>
                    <div style={{ fontSize: '14px', color: '#666' }}>物品奖励</div>
                    <Space wrap>
                      {selectedMission.rewards.items.map(item => (
                        <Tag key={item} color="gold" icon={<GiftOutlined />}>
                          {item === 'ancient_blueprint' ? '古代图纸' :
                           item === 'luxury_management_guide' ? '豪华管理指南' :
                           item === 'master_techniques' ? '大师技法' : item}
                        </Tag>
                      ))}
                    </Space>
                  </div>
                </Col>
              </Row>
            </Card>

            <Card title="风险评估" size="small">
              <Timeline>
                {selectedMission.risks.map((risk, index) => (
                  <Timeline.Item 
                    key={index}
                    color={risk.probability > 0.3 ? 'red' : risk.probability > 0.15 ? 'orange' : 'green'}
                    dot={<ExclamationCircleOutlined />}
                  >
                    <div>
                      <strong>
                        {risk.type === 'structural_damage' ? '结构损坏' :
                         risk.type === 'reputation_risk' ? '声誉风险' :
                         risk.type === 'extreme_challenge' ? '极限挑战' : risk.type}
                      </strong>
                      <div style={{ fontSize: '12px', color: '#666' }}>
                        概率: {(risk.probability * 100).toFixed(1)}% | 
                        后果: {risk.consequence === 'equipment_damage' ? '装备损坏' :
                              risk.consequence === 'reputation_loss' ? '声誉损失' :
                              risk.consequence === 'mission_failure' ? '任务失败' : risk.consequence}
                      </div>
                    </div>
                  </Timeline.Item>
                ))}
              </Timeline>
            </Card>
          </Space>
        )}
      </Modal>
    </Card>
  );
};

// ==================== 主探险阶段组件 ====================

const ExplorationPhase: React.FC<ExplorationPhaseProps> = ({ 
  gameCycleManager, 
  onPhaseComplete 
}) => {
  const [equipment, setEquipment] = useState<Equipment[]>(MOCK_EQUIPMENT);
  const [skillTree, setSkillTree] = useState<SkillTree>(MOCK_SKILL_TREE);
  const [missions, setMissions] = useState<ExplorationMission[]>(MOCK_MISSIONS);
  const [availableSkillPoints, setAvailableSkillPoints] = useState(5);
  const [playerLevel, setPlayerLevel] = useState(8);
  const [experience, setExperience] = useState(2500);
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

  const handleEquipItem = useCallback((equipmentId: string) => {
    console.log(`装备物品: ${equipmentId}`);
    // 实现装备逻辑
  }, []);

  const handleUpgradeItem = useCallback((equipmentId: string) => {
    setEquipment(prev => 
      prev.map(item => 
        item.id === equipmentId 
          ? { 
              ...item, 
              level: item.level + 1,
              stats: {
                ...item.stats,
                efficiency: item.stats.efficiency + 5,
                durability: item.stats.durability + 10
              }
            }
          : item
      )
    );
  }, []);

  const handleUnlockSkill = useCallback((skillId: string) => {
    setSkillTree(prev => ({
      ...prev,
      categories: prev.categories.map(category => ({
        ...category,
        skills: category.skills.map(skill => 
          skill.id === skillId 
            ? { ...skill, unlocked: true, level: skill.level + 1 }
            : skill
        )
      }))
    }));
    
    const skill = skillTree.categories
      .flatMap(cat => cat.skills)
      .find(s => s.id === skillId);
    
    if (skill) {
      setAvailableSkillPoints(prev => prev - skill.cost);
    }
  }, [skillTree]);

  const handleStartMission = useCallback((missionId: string) => {
    setMissions(prev => 
      prev.map(mission => 
        mission.id === missionId 
          ? { ...mission, status: 'in_progress' as const }
          : mission
      )
    );
  }, []);

  const handleCompleteMission = useCallback((missionId: string, result: MissionResult) => {
    const mission = missions.find(m => m.id === missionId);
    if (mission) {
      setExperience(prev => prev + mission.rewards.experience);
      setAvailableSkillPoints(prev => prev + mission.rewards.skill_points);
      
      setMissions(prev => 
        prev.map(m => 
          m.id === missionId 
            ? { ...m, status: 'completed' as const }
            : m
        )
      );
    }
  }, [missions]);

  const completedMissions = missions.filter(m => m.status === 'completed').length;
  const totalMissions = missions.length;

  return (
    <div style={{ padding: '24px' }}>
      {/* 阶段头部信息 */}
      <Card style={{ marginBottom: '24px' }}>
        <Row gutter={24}>
          <Col span={6}>
            <Statistic 
              title="当前阶段" 
              value="探险阶段" 
              prefix={<CompassOutlined />}
            />
          </Col>
          <Col span={6}>
            <Statistic 
              title="玩家等级" 
              value={playerLevel} 
              prefix={<TrophyOutlined />}
            />
          </Col>
          <Col span={6}>
            <Statistic 
              title="经验值" 
              value={experience} 
              prefix={<StarOutlined />}
            />
          </Col>
          <Col span={6}>
            <Statistic 
              title="技能点" 
              value={availableSkillPoints} 
              prefix={<ThunderboltOutlined />}
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
      <Card title="探险目标" style={{ marginBottom: '24px' }}>
        <List
          size="small"
          dataSource={[
            { text: '完成至少2个探险任务', completed: completedMissions >= 2 },
            { text: '解锁3个新技能', completed: skillTree.categories.flatMap(c => c.skills).filter(s => s.unlocked).length >= 5 },
            { text: '升级装备到3级以上', completed: equipment.some(e => e.level >= 3) },
            { text: '获得传奇物品', completed: equipment.some(e => e.rarity === 'legendary') }
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
      <Tabs defaultActiveKey="missions">
        <TabPane tab="探险任务" key="missions">
          <MissionBoard
            missions={missions}
            onStartMission={handleStartMission}
            onCompleteMission={handleCompleteMission}
          />
        </TabPane>
        
        <TabPane tab="装备管理" key="equipment">
          <EquipmentManager
            equipment={equipment}
            onEquipItem={handleEquipItem}
            onUpgradeItem={handleUpgradeItem}
          />
        </TabPane>
        
        <TabPane tab="技能树" key="skills">
          <SkillTreeComponent
            skillTree={skillTree}
            onUnlockSkill={handleUnlockSkill}
            availablePoints={availableSkillPoints}
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
          完成探险阶段
        </Button>
      </div>
    </div>
  );
};

export default ExplorationPhase;