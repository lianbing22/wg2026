// React components are used via JSX
import { Card, Row, Col, Statistic, Typography, Button, Space, Alert } from 'antd';
import { 
  HomeOutlined, 
  DollarOutlined, 
  UserOutlined, 
  ToolOutlined,
  PlusOutlined,
  EyeOutlined,
  PlayCircleOutlined,
  TrophyOutlined,
  BarChartOutlined,
  SettingOutlined,
  StarOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useGame } from '../contexts/GameContext';

const { Title, Text } = Typography;

export default function DashboardPage() {
  const navigate = useNavigate();
  const { gameState } = useGame();

  // 模拟数据
  const stats = {
    totalProperties: 12,
    totalRevenue: 125000,
    totalTenants: 45,
    maintenanceRequests: 8
  };

  return (
    <div style={{ padding: '24px' }}>
      <Title level={2}>仪表盘</Title>
      
      {/* 游戏状态提示 */}
      {gameState.player.name && (
        <Alert
          message={`欢迎回来，${gameState.player.name}！`}
          description={`当前等级：${gameState.player.level} | 经验值：${gameState.player.experience} | 收入：${gameState.stats.financialIncome}`}
          type="info"
          showIcon
          style={{ marginBottom: '24px' }}
          action={
            <Button 
              size="small" 
              type="primary" 
              icon={<PlayCircleOutlined />}
              onClick={() => navigate('/game/scenarios')}
            >
              继续游戏
            </Button>
          }
        />
      )}
      
      {/* 统计卡片 */}
      <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="总物业数量"
              value={stats.totalProperties}
              prefix={<HomeOutlined />}
              valueStyle={{ color: '#3f8600' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="总收入"
              value={stats.totalRevenue}
              prefix={<DollarOutlined />}
              precision={0}
              valueStyle={{ color: '#cf1322' }}
              suffix="元"
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="总租户数"
              value={stats.totalTenants}
              prefix={<UserOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="维修请求"
              value={stats.maintenanceRequests}
              prefix={<ToolOutlined />}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
      </Row>

      {/* 游戏模式入口 */}
      <Card 
        title="物业管理模拟器" 
        style={{ marginBottom: '24px' }}
        extra={
          <Button 
            type="primary" 
            icon={<TrophyOutlined />}
            onClick={() => navigate('/game/character-creation')}
          >
            开始游戏
          </Button>
        }
      >
        <Row gutter={[16, 16]}>
          <Col xs={24} md={12}>
            <div>
              <Text strong>体验真实的物业管理挑战</Text>
              <br />
              <Text type="secondary">
                通过模拟场景学习物业管理技能，处理各种突发事件，提升管理能力。
              </Text>
            </div>
          </Col>
          <Col xs={24} md={12}>
            {gameState.player.name ? (
              <div>
                <Text strong>游戏进度</Text>
                <br />
                <Text>等级：{gameState.player.level}</Text>
                <br />
                <Text>经验值：{gameState.player.experience}</Text>
                <br />
                <Text>完成场景：{gameState.progress.completedScenarios.length}</Text>
              </div>
            ) : (
              <div>
                <Text strong>开始你的物业管理之旅</Text>
                <br />
                <Text type="secondary">
                  创建角色，体验丰富的场景内容。
                </Text>
              </div>
            )}
          </Col>
        </Row>
      </Card>

      {/* 快速操作 */}
      <Card title="快速操作" style={{ marginBottom: '24px' }}>
        <Space wrap>
          <Button 
            type="primary" 
            icon={<PlusOutlined />}
            onClick={() => navigate('/properties')}
          >
            添加新物业
          </Button>
          <Button 
            icon={<EyeOutlined />}
            onClick={() => navigate('/properties')}
          >
            查看所有物业
          </Button>
          <Button 
            icon={<PlayCircleOutlined />}
            onClick={() => navigate('/game/scenarios')}
          >
            模拟器训练
          </Button>
          <Button>
            生成报告
          </Button>
          <Button>
            租户管理
          </Button>
        </Space>
      </Card>

      {/* 最近活动 */}
      <Card title="最近活动">
        <div style={{ color: '#666' }}>
          暂无最近活动数据
        </div>
      </Card>
      
      {/* 游戏功能快捷入口 */}
      <Row gutter={[16, 16]} style={{ marginTop: '24px' }}>
        <Col xs={24}>
          <Card title="游戏功能" className="dashboard-card">
            <Space size="middle" wrap>
              <Button 
                icon={<SettingOutlined />}
                onClick={() => navigate('/game/settings')}
                size="large"
              >
                游戏设置
              </Button>
              <Button 
                icon={<StarOutlined />}
                onClick={() => navigate('/game/achievements')}
                size="large"
              >
                成就系统
              </Button>
              <Button 
                icon={<BarChartOutlined />}
                onClick={() => navigate('/game/scenarios')}
                size="large"
              >
                场景选择
              </Button>
            </Space>
          </Card>
        </Col>
      </Row>
    </div>
  );
}