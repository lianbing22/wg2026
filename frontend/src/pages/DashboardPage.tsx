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
    <div>
      <Title level={4} style={{ color: '#fff' }}>仪表盘</Title>
      
      {/* 游戏状态提示 */}
      {gameState.player.name && (
        <Alert
          message={<span style={{ color: '#fff' }}>{`欢迎回来，${gameState.player.name}！`}</span>}
          description={<span style={{ color: '#fff' }}>{`当前等级：${gameState.player.level} | 经验值：${gameState.player.experience} | 收入：${gameState.stats.financialIncome}`}</span>}
          type="info"
          showIcon
          style={{
            marginBottom: '24px',
            background: 'rgba(255, 255, 255, 0.05)',
            borderRadius: '15px',
            boxShadow: '0 8px 32px 0 rgba( 31, 38, 135, 0.37 )',
            backdropFilter: 'blur( 4px )',
            WebkitBackdropFilter: 'blur( 4px )',
            border: '1px solid rgba( 255, 255, 255, 0.18 )',
            color: '#fff',
          }}
          action={
            <Button
              size="default"
              type="primary"
              icon={<PlayCircleOutlined />}
              onClick={() => navigate('/game/scenarios')}
              style={{
                background: 'rgba(255, 255, 255, 0.1)',
                border: '1px solid rgba( 255, 255, 255, 0.18 )',
                color: '#fff',
                backdropFilter: 'blur( 4px )',
                WebkitBackdropFilter: 'blur( 4px )',
              }}
            >
              继续游戏
            </Button>
          }
        />
      )}
      
      {/* 统计卡片 */}
      <Row gutter={[24, 24]} style={{ marginBottom: '24px' }}>
        <Col xs={24} sm={12} lg={8}>
          <Card
            className="dashboard-statistic-card"
            style={{
              background: 'rgba(255, 255, 255, 0.05)',
              borderRadius: '15px',
              boxShadow: '0 8px 32px 0 rgba( 31, 38, 135, 0.37 )',
              backdropFilter: 'blur( 4px )',
              WebkitBackdropFilter: 'blur( 4px )',
              border: '1px solid rgba( 255, 255, 255, 0.18 )',
              color: '#fff',
            }}
          >
            <Statistic
              title="总物业数量"
              style={{ color: '#fff' }}
              value={stats.totalProperties}
              prefix={<HomeOutlined />}
              valueStyle={{ color: '#fff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={8}>
          <Card
            className="dashboard-statistic-card"
            style={{
              background: 'rgba(255, 255, 255, 0.05)',
              borderRadius: '15px',
              boxShadow: '0 8px 32px 0 rgba( 31, 38, 135, 0.37 )',
              backdropFilter: 'blur( 4px )',
              WebkitBackdropFilter: 'blur( 4px )',
              border: '1px solid rgba( 255, 255, 255, 0.18 )',
              color: '#fff',
            }}
          >
            <Statistic
              title="总收入"
              style={{ color: '#fff' }}
              value={stats.totalRevenue}
              prefix={<DollarOutlined />}
              precision={0}
              valueStyle={{ color: '#fff' }}
              suffix="元"
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={8}>
          <Card
            className="dashboard-statistic-card"
            style={{
              background: 'rgba(255, 255, 255, 0.05)',
              borderRadius: '15px',
              boxShadow: '0 8px 32px 0 rgba( 31, 38, 135, 0.37 )',
              backdropFilter: 'blur( 4px )',
              WebkitBackdropFilter: 'blur( 4px )',
              border: '1px solid rgba( 255, 255, 255, 0.18 )',
              color: '#fff',
            }}
          >
            <Statistic
              title="总租户数"
              style={{ color: '#fff' }}
              value={stats.totalTenants}
              prefix={<UserOutlined />}
              valueStyle={{ color: '#fff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={8}>
          <Card
            className="dashboard-statistic-card"
            style={{
              background: 'rgba(255, 255, 255, 0.05)',
              borderRadius: '15px',
              boxShadow: '0 8px 32px 0 rgba( 31, 38, 135, 0.37 )',
              backdropFilter: 'blur( 4px )',
              WebkitBackdropFilter: 'blur( 4px )',
              border: '1px solid rgba( 255, 255, 255, 0.18 )',
              color: '#fff',
            }}
          >
            <Statistic
              title="维修请求"
              style={{ color: '#fff' }}
              value={stats.maintenanceRequests}
              prefix={<ToolOutlined />}
              valueStyle={{ color: '#fff' }}
            />
          </Card>
        </Col>
      </Row>

      {/* 游戏模式入口 */}
      <Card 
        title={<span style={{ color: '#fff' }}>物业管理模拟器</span>}
        style={{
          marginBottom: '24px',
          background: 'rgba(255, 255, 255, 0.05)',
          borderRadius: '15px',
          boxShadow: '0 8px 32px 0 rgba( 31, 38, 135, 0.37 )',
          backdropFilter: 'blur( 4px )',
          WebkitBackdropFilter: 'blur( 4px )',
          border: '1px solid rgba( 255, 255, 255, 0.18 )',
          color: '#fff',
        }}
        extra={
          <Button 
              type="primary" 
              icon={<TrophyOutlined />}
              onClick={() => navigate('/game/character-creation')}
              style={{
                background: 'rgba(255, 255, 255, 0.1)',
                border: '1px solid rgba( 255, 255, 255, 0.18 )',
                color: '#fff',
                backdropFilter: 'blur( 4px )',
                WebkitBackdropFilter: 'blur( 4px )',
              }}
            >
              开始游戏
            </Button>
        }
      >
        <Row gutter={[16, 16]}>
          <Col xs={24} md={12}>
            <div>
              <Text strong style={{ color: '#fff' }}>体验真实的物业管理挑战</Text>
              <br />
              <Text type="secondary" style={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                通过模拟场景学习物业管理技能，处理各种突发事件，提升管理能力。
              </Text>
            </div>
          </Col>
          <Col xs={24} md={12}>
            {gameState.player.name ? (
              <div>
                <Text strong style={{ color: '#fff' }}>游戏进度</Text>
                <br />
                <Text style={{ color: '#fff' }}>等级：{gameState.player.level}</Text>
                <br />
                <Text style={{ color: '#fff' }}>经验值：{gameState.player.experience}</Text>
                <br />
                <Text style={{ color: '#fff' }}>完成场景：{gameState.progress.completedScenarios.length}</Text>
              </div>
            ) : (
              <div>
                <Text strong style={{ color: '#fff' }}>开始你的物业管理之旅</Text>
                <br />
                <Text type="secondary" style={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                  创建角色，体验丰富的场景内容。
                </Text>
              </div>
            )}
          </Col>
        </Row>
      </Card>

      {/* 快速操作 */}
      <Card 
        title={<span style={{ color: '#fff' }}>快速操作</span>}
        style={{
          marginBottom: '24px',
          background: 'rgba(255, 255, 255, 0.05)',
          borderRadius: '15px',
          boxShadow: '0 8px 32px 0 rgba( 31, 38, 135, 0.37 )',
          backdropFilter: 'blur( 4px )',
          WebkitBackdropFilter: 'blur( 4px )',
          border: '1px solid rgba( 255, 255, 255, 0.18 )',
          color: '#fff',
        }}
      >
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
      <Card 
        title={<span style={{ color: '#fff' }}>最近活动</span>}
        className="dashboard-card"
        style={{
          background: 'rgba(255, 255, 255, 0.05)',
          borderRadius: '15px',
          boxShadow: '0 8px 32px 0 rgba( 31, 38, 135, 0.37 )',
          backdropFilter: 'blur( 4px )',
          WebkitBackdropFilter: 'blur( 4px )',
          border: '1px solid rgba( 255, 255, 255, 0.18 )',
          color: '#fff',
        }}
      >
        <div style={{ color: '#fff' }}>
            暂无最近活动数据
          </div>
      </Card>
      
      {/* 游戏功能快捷入口 */}
      <Row gutter={[16, 16]} style={{ marginTop: '24px' }}>
        <Col xs={24}>
          <Card 
        title={<span style={{ color: '#fff' }}>游戏功能</span>}
        className="dashboard-card"
        style={{
          background: 'rgba(255, 255, 255, 0.05)',
          borderRadius: '15px',
          boxShadow: '0 8px 32px 0 rgba( 31, 38, 135, 0.37 )',
          backdropFilter: 'blur( 4px )',
          WebkitBackdropFilter: 'blur( 4px )',
          border: '1px solid rgba( 255, 255, 255, 0.18 )',
          color: '#fff',
        }}
      >
            <Space size="middle" wrap>
              <Button
                icon={<SettingOutlined />}
                onClick={() => navigate('/game/settings')}
                size="large"
                style={{
                  background: 'rgba(255, 255, 255, 0.1)',
                  border: '1px solid rgba( 255, 255, 255, 0.18 )',
                  color: '#fff',
                  backdropFilter: 'blur( 4px )',
                  WebkitBackdropFilter: 'blur( 4px )',
                }}
              >
                游戏设置
              </Button>
              <Button 
                icon={<StarOutlined />}
                onClick={() => navigate('/game/achievements')}
                size="large"
                style={{
                  background: 'rgba(255, 255, 255, 0.1)',
                  border: '1px solid rgba( 255, 255, 255, 0.18 )',
                  color: '#fff',
                  backdropFilter: 'blur( 4px )',
                  WebkitBackdropFilter: 'blur( 4px )',
                }}
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