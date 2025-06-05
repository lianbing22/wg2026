/**
 * 物业管理模拟器 - 经营阶段组件
 * 实现租户管理、收益优化、服务质量控制等经营阶段核心功能
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
  Rate,
  Switch,
  Slider
} from 'antd';
import { 
  UserOutlined, 
  DollarOutlined, 
  SettingOutlined,
  HeartOutlined,
  ExclamationCircleOutlined,
  CheckCircleOutlined,
  TrophyOutlined,
  ShopOutlined,
  PhoneOutlined,
  ToolOutlined,
  HomeOutlined
} from '@ant-design/icons';
import { 
  TenantDetails, 
  TenantComplaint, 
  LeaseContract, 
  DynamicPricing, 
  Supplier,
  TenantType,
  GameCycleState 
} from '../../types/game-redesign';
import { GameCycleManager } from '../../utils/game-cycle-manager';

const { TabPane } = Tabs;
const { Option } = Select;

// ==================== 接口定义 ====================

interface OperationPhaseProps {
  gameCycleManager: GameCycleManager;
  onPhaseComplete: () => void;
}

interface TenantManagerProps {
  tenants: TenantDetails[];
  onUpdateTenant: (tenantId: string, updates: Partial<TenantDetails>) => void;
  onEvictTenant: (tenantId: string) => void;
}

interface ComplaintSystemProps {
  complaints: TenantComplaint[];
  onResolveComplaint: (complaintId: string, resolution: string) => void;
}

interface PricingOptimizerProps {
  pricingStrategy: DynamicPricing;
  onUpdatePricing: (updates: Partial<DynamicPricing>) => void;
  marketData: any;
}

interface SupplierManagementProps {
  suppliers: Supplier[];
  onSelectSupplier: (supplierId: string, serviceType: string) => void;
}

// ==================== 模拟数据 ====================

const MOCK_TENANTS: TenantDetails[] = [
  {
    id: 'tenant_001',
    name: '张三',
    type: 'family',
    preferences: {
      noise_tolerance: 60,
      cleanliness_requirement: 80,
      social_interaction: 40,
      privacy_need: 70,
      budget_sensitivity: 50
    },
    satisfaction: 85,
    payment_history: 'excellent',
    lease_duration: 12,
    special_requirements: ['pet_friendly'],
    complaints_count: 1,
    referral_potential: 75
  },
  {
    id: 'tenant_002',
    name: '李四',
    type: 'student',
    preferences: {
      noise_tolerance: 80,
      cleanliness_requirement: 60,
      social_interaction: 90,
      privacy_need: 30,
      budget_sensitivity: 90
    },
    satisfaction: 70,
    payment_history: 'good',
    lease_duration: 6,
    special_requirements: ['wifi_required'],
    complaints_count: 2,
    referral_potential: 60
  },
  {
    id: 'tenant_003',
    name: '王五',
    type: 'professional',
    preferences: {
      noise_tolerance: 40,
      cleanliness_requirement: 95,
      social_interaction: 20,
      privacy_need: 90,
      budget_sensitivity: 30
    },
    satisfaction: 95,
    payment_history: 'excellent',
    lease_duration: 24,
    special_requirements: ['quiet_environment', 'high_speed_internet'],
    complaints_count: 0,
    referral_potential: 90
  }
];

const MOCK_COMPLAINTS: TenantComplaint[] = [
  {
    id: 'complaint_001',
    tenant_id: 'tenant_001',
    type: 'noise',
    severity: 'medium',
    description: '楼上邻居深夜噪音',
    date_reported: new Date('2024-01-15'),
    status: 'pending',
    expected_resolution_time: 48
  },
  {
    id: 'complaint_002',
    tenant_id: 'tenant_002',
    type: 'maintenance',
    severity: 'high',
    description: '热水器故障',
    date_reported: new Date('2024-01-16'),
    status: 'in_progress',
    expected_resolution_time: 24
  }
];

const MOCK_SUPPLIERS: Supplier[] = [
  {
    id: 'supplier_001',
    name: '快修服务公司',
    service_type: 'maintenance',
    quality_rating: 85,
    cost_rating: 70,
    response_time: 4,
    availability: true,
    contract_terms: {
      minimum_order: 200,
      payment_terms: '30天',
      service_guarantee: '6个月'
    }
  },
  {
    id: 'supplier_002',
    name: '绿洁清洁服务',
    service_type: 'cleaning',
    quality_rating: 90,
    cost_rating: 60,
    response_time: 2,
    availability: true,
    contract_terms: {
      minimum_order: 500,
      payment_terms: '15天',
      service_guarantee: '满意保证'
    }
  },
  {
    id: 'supplier_003',
    name: '安全卫士保安',
    service_type: 'security',
    quality_rating: 95,
    cost_rating: 50,
    response_time: 1,
    availability: true,
    contract_terms: {
      minimum_order: 1000,
      payment_terms: '月结',
      service_guarantee: '24小时响应'
    }
  }
];

// ==================== 租户管理组件 ====================

const TenantManager: React.FC<TenantManagerProps> = ({ 
  tenants, 
  onUpdateTenant, 
  onEvictTenant 
}) => {
  const [selectedTenant, setSelectedTenant] = useState<TenantDetails | null>(null);
  const [detailModalVisible, setDetailModalVisible] = useState(false);

  const getTenantTypeColor = (type: TenantType) => {
    const colors = {
      family: 'blue',
      student: 'green',
      professional: 'purple',
      senior: 'orange',
      couple: 'pink'
    };
    return colors[type];
  };

  const getTenantTypeName = (type: TenantType) => {
    const names = {
      family: '家庭',
      student: '学生',
      professional: '专业人士',
      senior: '老年人',
      couple: '情侣'
    };
    return names[type];
  };

  const getPaymentHistoryColor = (history: string) => {
    const colors = {
      excellent: 'green',
      good: 'blue',
      average: 'orange',
      poor: 'red'
    };
    return colors[history] || 'default';
  };

  const handleViewDetails = (tenant: TenantDetails) => {
    setSelectedTenant(tenant);
    setDetailModalVisible(true);
  };

  const columns = [
    {
      title: '租户姓名',
      dataIndex: 'name',
      key: 'name',
      render: (name: string, record: TenantDetails) => (
        <Space>
          <UserOutlined />
          {name}
          <Tag color={getTenantTypeColor(record.type)}>
            {getTenantTypeName(record.type)}
          </Tag>
        </Space>
      )
    },
    {
      title: '满意度',
      dataIndex: 'satisfaction',
      key: 'satisfaction',
      render: (satisfaction: number) => (
        <Space>
          <Progress 
            type="circle" 
            size={40} 
            percent={satisfaction} 
            format={percent => `${percent}%`}
            strokeColor={satisfaction >= 80 ? '#52c41a' : satisfaction >= 60 ? '#faad14' : '#ff4d4f'}
          />
        </Space>
      )
    },
    {
      title: '付款记录',
      dataIndex: 'payment_history',
      key: 'payment_history',
      render: (history: string) => (
        <Tag color={getPaymentHistoryColor(history)}>
          {history === 'excellent' ? '优秀' :
           history === 'good' ? '良好' :
           history === 'average' ? '一般' : '较差'}
        </Tag>
      )
    },
    {
      title: '租期',
      dataIndex: 'lease_duration',
      key: 'lease_duration',
      render: (duration: number) => `${duration}个月`
    },
    {
      title: '投诉次数',
      dataIndex: 'complaints_count',
      key: 'complaints_count',
      render: (count: number) => (
        <Tag color={count === 0 ? 'green' : count <= 2 ? 'orange' : 'red'}>
          {count}次
        </Tag>
      )
    },
    {
      title: '推荐潜力',
      dataIndex: 'referral_potential',
      key: 'referral_potential',
      render: (potential: number) => (
        <Rate disabled value={potential / 20} allowHalf />
      )
    },
    {
      title: '操作',
      key: 'actions',
      render: (_, record: TenantDetails) => (
        <Space>
          <Button size="small" onClick={() => handleViewDetails(record)}>
            详情
          </Button>
          <Button size="small" type="primary">
            续约
          </Button>
          <Button size="small" danger onClick={() => onEvictTenant(record.id)}>
            退租
          </Button>
        </Space>
      )
    }
  ];

  return (
    <Card title="租户管理" extra={<UserOutlined />}>
      <Table 
        dataSource={tenants} 
        columns={columns} 
        rowKey="id"
        size="small"
        pagination={{ pageSize: 5 }}
      />

      <Modal
        title="租户详细信息"
        open={detailModalVisible}
        onCancel={() => setDetailModalVisible(false)}
        footer={null}
        width={600}
      >
        {selectedTenant && (
          <Space direction="vertical" style={{ width: '100%' }}>
            <Row gutter={16}>
              <Col span={12}>
                <Statistic title="租户姓名" value={selectedTenant.name} />
              </Col>
              <Col span={12}>
                <Statistic title="租户类型" value={getTenantTypeName(selectedTenant.type)} />
              </Col>
            </Row>
            
            <Row gutter={16}>
              <Col span={12}>
                <Statistic title="满意度" value={selectedTenant.satisfaction} suffix="%" />
              </Col>
              <Col span={12}>
                <Statistic title="推荐潜力" value={selectedTenant.referral_potential} suffix="%" />
              </Col>
            </Row>

            <Card title="偏好设置" size="small">
              <Row gutter={[16, 8]}>
                <Col span={12}>噪音容忍度: {selectedTenant.preferences.noise_tolerance}%</Col>
                <Col span={12}>清洁要求: {selectedTenant.preferences.cleanliness_requirement}%</Col>
                <Col span={12}>社交需求: {selectedTenant.preferences.social_interaction}%</Col>
                <Col span={12}>隐私需求: {selectedTenant.preferences.privacy_need}%</Col>
                <Col span={12}>价格敏感度: {selectedTenant.preferences.budget_sensitivity}%</Col>
              </Row>
            </Card>

            <Card title="特殊要求" size="small">
              <Space wrap>
                {selectedTenant.special_requirements.map(req => (
                  <Tag key={req} color="blue">
                    {req === 'pet_friendly' ? '允许宠物' :
                     req === 'wifi_required' ? '需要WiFi' :
                     req === 'quiet_environment' ? '安静环境' :
                     req === 'high_speed_internet' ? '高速网络' : req}
                  </Tag>
                ))}
              </Space>
            </Card>
          </Space>
        )}
      </Modal>
    </Card>
  );
};

// ==================== 投诉处理系统组件 ====================

const ComplaintSystem: React.FC<ComplaintSystemProps> = ({ 
  complaints, 
  onResolveComplaint 
}) => {
  const [resolutionModalVisible, setResolutionModalVisible] = useState(false);
  const [selectedComplaint, setSelectedComplaint] = useState<TenantComplaint | null>(null);
  const [resolutionText, setResolutionText] = useState('');

  const getSeverityColor = (severity: string) => {
    const colors = {
      low: 'green',
      medium: 'orange',
      high: 'red',
      urgent: 'purple'
    };
    return colors[severity] || 'default';
  };

  const getStatusColor = (status: string) => {
    const colors = {
      pending: 'orange',
      in_progress: 'blue',
      resolved: 'green',
      escalated: 'red'
    };
    return colors[status] || 'default';
  };

  const handleResolve = (complaint: TenantComplaint) => {
    setSelectedComplaint(complaint);
    setResolutionModalVisible(true);
  };

  const handleConfirmResolution = () => {
    if (selectedComplaint && resolutionText) {
      onResolveComplaint(selectedComplaint.id, resolutionText);
      setResolutionModalVisible(false);
      setSelectedComplaint(null);
      setResolutionText('');
    }
  };

  return (
    <Card title="投诉处理" extra={<PhoneOutlined />}>
      {complaints.length === 0 ? (
        <Alert message="当前没有待处理的投诉" type="success" showIcon />
      ) : (
        <List
          dataSource={complaints}
          renderItem={complaint => (
            <List.Item
              actions={[
                complaint.status === 'pending' && (
                  <Button size="small" type="primary" onClick={() => handleResolve(complaint)}>
                    处理
                  </Button>
                ),
                <Button size="small">详情</Button>
              ]}
            >
              <List.Item.Meta
                avatar={
                  <div style={{ fontSize: '20px', color: '#ff4d4f' }}>
                    <ExclamationCircleOutlined />
                  </div>
                }
                title={
                  <Space>
                    {complaint.type === 'noise' ? '噪音投诉' :
                     complaint.type === 'maintenance' ? '维修投诉' :
                     complaint.type === 'service' ? '服务投诉' : '其他投诉'}
                    <Tag color={getSeverityColor(complaint.severity)}>
                      {complaint.severity === 'low' ? '轻微' :
                       complaint.severity === 'medium' ? '中等' :
                       complaint.severity === 'high' ? '严重' : '紧急'}
                    </Tag>
                    <Tag color={getStatusColor(complaint.status)}>
                      {complaint.status === 'pending' ? '待处理' :
                       complaint.status === 'in_progress' ? '处理中' :
                       complaint.status === 'resolved' ? '已解决' : '已升级'}
                    </Tag>
                  </Space>
                }
                description={
                  <Space direction="vertical" style={{ width: '100%' }}>
                    <div>{complaint.description}</div>
                    <div style={{ fontSize: '12px', color: '#666' }}>
                      报告时间: {complaint.date_reported.toLocaleString()}
                    </div>
                    <div style={{ fontSize: '12px', color: '#666' }}>
                      预期解决时间: {complaint.expected_resolution_time}小时内
                    </div>
                  </Space>
                }
              />
            </List.Item>
          )}
        />
      )}

      <Modal
        title="处理投诉"
        open={resolutionModalVisible}
        onOk={handleConfirmResolution}
        onCancel={() => setResolutionModalVisible(false)}
        okText="确认处理"
        cancelText="取消"
      >
        {selectedComplaint && (
          <Space direction="vertical" style={{ width: '100%' }}>
            <Alert
              message={`投诉类型: ${selectedComplaint.type === 'noise' ? '噪音投诉' :
                                selectedComplaint.type === 'maintenance' ? '维修投诉' :
                                selectedComplaint.type === 'service' ? '服务投诉' : '其他投诉'}`}
              description={selectedComplaint.description}
              type="warning"
              showIcon
            />
            
            <Input.TextArea
              placeholder="请输入处理方案和结果..."
              value={resolutionText}
              onChange={(e) => setResolutionText(e.target.value)}
              rows={4}
            />
          </Space>
        )}
      </Modal>
    </Card>
  );
};

// ==================== 动态定价优化器组件 ====================

const PricingOptimizer: React.FC<PricingOptimizerProps> = ({ 
  pricingStrategy, 
  onUpdatePricing, 
  marketData 
}) => {
  const [autoAdjust, setAutoAdjust] = useState(pricingStrategy.auto_adjustment);
  const [demandMultiplier, setDemandMultiplier] = useState(pricingStrategy.demand_multiplier);
  const [seasonalAdjustment, setSeasonalAdjustment] = useState(pricingStrategy.seasonal_adjustment);

  const handleUpdateStrategy = () => {
    onUpdatePricing({
      auto_adjustment: autoAdjust,
      demand_multiplier: demandMultiplier,
      seasonal_adjustment: seasonalAdjustment
    });
  };

  return (
    <Card title="动态定价" extra={<DollarOutlined />}>
      <Space direction="vertical" style={{ width: '100%' }}>
        <Row gutter={16}>
          <Col span={8}>
            <Statistic title="当前基础租金" value={pricingStrategy.base_price} prefix="¥" />
          </Col>
          <Col span={8}>
            <Statistic title="市场需求指数" value={85} suffix="%" />
          </Col>
          <Col span={8}>
            <Statistic title="预期收益" value={12500} prefix="¥" />
          </Col>
        </Row>

        <Card title="定价策略" size="small">
          <Space direction="vertical" style={{ width: '100%' }}>
            <Row align="middle">
              <Col span={8}>自动调价:</Col>
              <Col span={16}>
                <Switch 
                  checked={autoAdjust} 
                  onChange={setAutoAdjust}
                  checkedChildren="开启"
                  unCheckedChildren="关闭"
                />
              </Col>
            </Row>
            
            <Row align="middle">
              <Col span={8}>需求倍数:</Col>
              <Col span={16}>
                <Slider 
                  min={0.8} 
                  max={1.5} 
                  step={0.1} 
                  value={demandMultiplier}
                  onChange={setDemandMultiplier}
                  marks={{
                    0.8: '0.8x',
                    1.0: '1.0x',
                    1.2: '1.2x',
                    1.5: '1.5x'
                  }}
                />
              </Col>
            </Row>
            
            <Row align="middle">
              <Col span={8}>季节调整:</Col>
              <Col span={16}>
                <Slider 
                  min={-20} 
                  max={20} 
                  value={seasonalAdjustment}
                  onChange={setSeasonalAdjustment}
                  marks={{
                    '-20': '-20%',
                    '0': '0%',
                    '20': '+20%'
                  }}
                />
              </Col>
            </Row>
            
            <Button type="primary" onClick={handleUpdateStrategy}>
              应用策略
            </Button>
          </Space>
        </Card>

        <Card title="市场分析" size="small">
          <Row gutter={16}>
            <Col span={12}>
              <Statistic title="竞争对手平均价格" value={2800} prefix="¥" />
            </Col>
            <Col span={12}>
              <Statistic title="我们的价格优势" value="+5%" valueStyle={{ color: '#3f8600' }} />
            </Col>
          </Row>
        </Card>
      </Space>
    </Card>
  );
};

// ==================== 供应商管理组件 ====================

const SupplierManagement: React.FC<SupplierManagementProps> = ({ 
  suppliers, 
  onSelectSupplier 
}) => {
  const [selectedService, setSelectedService] = useState<string>('');

  const getServiceTypeName = (type: string) => {
    const names = {
      maintenance: '维修服务',
      cleaning: '清洁服务',
      security: '安保服务',
      landscaping: '园艺服务'
    };
    return names[type] || type;
  };

  return (
    <Card title="供应商管理" extra={<ShopOutlined />}>
      <Space direction="vertical" style={{ width: '100%' }}>
        <Select
          placeholder="选择服务类型"
          style={{ width: '100%' }}
          value={selectedService}
          onChange={setSelectedService}
        >
          <Option value="maintenance">维修服务</Option>
          <Option value="cleaning">清洁服务</Option>
          <Option value="security">安保服务</Option>
          <Option value="landscaping">园艺服务</Option>
        </Select>

        <List
          dataSource={suppliers}
          renderItem={supplier => (
            <List.Item
              actions={[
                <Button 
                  size="small" 
                  type="primary"
                  disabled={!supplier.availability}
                  onClick={() => onSelectSupplier(supplier.id, selectedService)}
                >
                  {supplier.availability ? '选择' : '不可用'}
                </Button>
              ]}
            >
              <List.Item.Meta
                avatar={
                  <div style={{ fontSize: '20px', color: supplier.availability ? '#52c41a' : '#d9d9d9' }}>
                    <ShopOutlined />
                  </div>
                }
                title={
                  <Space>
                    {supplier.name}
                    <Tag color="blue">{getServiceTypeName(supplier.service_type)}</Tag>
                  </Space>
                }
                description={
                  <Space direction="vertical" size="small" style={{ width: '100%' }}>
                    <Row gutter={16}>
                      <Col span={8}>
                        <div>质量评级: <Rate disabled value={supplier.quality_rating / 20} allowHalf /></div>
                      </Col>
                      <Col span={8}>
                        <div>成本评级: <Rate disabled value={supplier.cost_rating / 20} allowHalf /></div>
                      </Col>
                      <Col span={8}>
                        <div>响应时间: {supplier.response_time}小时</div>
                      </Col>
                    </Row>
                    <div style={{ fontSize: '12px', color: '#666' }}>
                      合同条款: 最低订单 ¥{supplier.contract_terms.minimum_order}, 
                      付款条件 {supplier.contract_terms.payment_terms}, 
                      服务保证 {supplier.contract_terms.service_guarantee}
                    </div>
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

// ==================== 主经营阶段组件 ====================

const OperationPhase: React.FC<OperationPhaseProps> = ({ 
  gameCycleManager, 
  onPhaseComplete 
}) => {
  const [tenants, setTenants] = useState<TenantDetails[]>(MOCK_TENANTS);
  const [complaints, setComplaints] = useState<TenantComplaint[]>(MOCK_COMPLAINTS);
  const [pricingStrategy, setPricingStrategy] = useState<DynamicPricing>({
    base_price: 3000,
    demand_multiplier: 1.1,
    seasonal_adjustment: 5,
    auto_adjustment: true,
    market_factors: {
      competition_level: 0.7,
      demand_index: 0.85,
      economic_indicator: 0.9
    }
  });
  const [phaseStats, setPhaseStats] = useState(gameCycleManager.getPhaseStats());
  const [monthlyRevenue, setMonthlyRevenue] = useState(25000);
  const [occupancyRate, setOccupancyRate] = useState(85);
  const [avgSatisfaction, setAvgSatisfaction] = useState(83);

  // 更新阶段统计
  useEffect(() => {
    const interval = setInterval(() => {
      setPhaseStats(gameCycleManager.getPhaseStats());
      // 模拟数据更新
      setAvgSatisfaction(tenants.reduce((sum, t) => sum + t.satisfaction, 0) / tenants.length);
    }, 1000);

    return () => clearInterval(interval);
  }, [gameCycleManager, tenants]);

  // 检查阶段完成条件
  useEffect(() => {
    if (gameCycleManager.checkPhaseCompletion()) {
      onPhaseComplete();
    }
  }, [phaseStats, gameCycleManager, onPhaseComplete]);

  const handleUpdateTenant = useCallback((tenantId: string, updates: Partial<TenantDetails>) => {
    setTenants(prev => 
      prev.map(tenant => 
        tenant.id === tenantId ? { ...tenant, ...updates } : tenant
      )
    );
  }, []);

  const handleEvictTenant = useCallback((tenantId: string) => {
    setTenants(prev => prev.filter(tenant => tenant.id !== tenantId));
    setOccupancyRate(prev => Math.max(0, prev - 10));
  }, []);

  const handleResolveComplaint = useCallback((complaintId: string, resolution: string) => {
    setComplaints(prev => 
      prev.map(complaint => 
        complaint.id === complaintId 
          ? { ...complaint, status: 'resolved' as const }
          : complaint
      )
    );
    
    // 提升相关租户满意度
    const complaint = complaints.find(c => c.id === complaintId);
    if (complaint) {
      handleUpdateTenant(complaint.tenant_id, { 
        satisfaction: Math.min(100, tenants.find(t => t.id === complaint.tenant_id)?.satisfaction || 0 + 10)
      });
    }
  }, [complaints, tenants, handleUpdateTenant]);

  const handleUpdatePricing = useCallback((updates: Partial<DynamicPricing>) => {
    setPricingStrategy(prev => ({ ...prev, ...updates }));
    // 模拟收益变化
    setMonthlyRevenue(prev => prev * (1 + (updates.demand_multiplier || 1 - 1) * 0.1));
  }, []);

  const handleSelectSupplier = useCallback((supplierId: string, serviceType: string) => {
    console.log(`选择供应商 ${supplierId} 提供 ${serviceType} 服务`);
    // 实现供应商选择逻辑
  }, []);

  return (
    <div style={{ padding: '24px' }}>
      {/* 阶段头部信息 */}
      <Card style={{ marginBottom: '24px' }}>
        <Row gutter={24}>
          <Col span={6}>
            <Statistic 
              title="当前阶段" 
              value="经营阶段" 
              prefix={<SettingOutlined />}
            />
          </Col>
          <Col span={6}>
            <Statistic 
              title="月度收益" 
              value={monthlyRevenue} 
              prefix="¥"
            />
          </Col>
          <Col span={6}>
            <Statistic 
              title="入住率" 
              value={occupancyRate} 
              suffix="%"
            />
          </Col>
          <Col span={6}>
            <Statistic 
              title="平均满意度" 
              value={avgSatisfaction.toFixed(1)} 
              suffix="%"
              prefix={<HeartOutlined />}
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
      <Card title="经营目标" style={{ marginBottom: '24px' }}>
        <List
          size="small"
          dataSource={[
            { text: '保持入住率在80%以上', completed: occupancyRate >= 80 },
            { text: '平均满意度达到85%', completed: avgSatisfaction >= 85 },
            { text: '处理所有投诉', completed: complaints.filter(c => c.status === 'pending').length === 0 },
            { text: '月收益达到25000元', completed: monthlyRevenue >= 25000 }
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
      <Tabs defaultActiveKey="tenants">
        <TabPane tab="租户管理" key="tenants">
          <TenantManager
            tenants={tenants}
            onUpdateTenant={handleUpdateTenant}
            onEvictTenant={handleEvictTenant}
          />
        </TabPane>
        
        <TabPane tab="投诉处理" key="complaints">
          <ComplaintSystem
            complaints={complaints}
            onResolveComplaint={handleResolveComplaint}
          />
        </TabPane>
        
        <TabPane tab="动态定价" key="pricing">
          <PricingOptimizer
            pricingStrategy={pricingStrategy}
            onUpdatePricing={handleUpdatePricing}
            marketData={{}}
          />
        </TabPane>
        
        <TabPane tab="供应商" key="suppliers">
          <SupplierManagement
            suppliers={MOCK_SUPPLIERS}
            onSelectSupplier={handleSelectSupplier}
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
          完成经营阶段
        </Button>
      </div>
    </div>
  );
};

export default OperationPhase;