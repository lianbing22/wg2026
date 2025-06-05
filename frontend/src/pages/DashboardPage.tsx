import React, { useState, useCallback } from 'react';
import { Card, Row, Col, Statistic, Typography, Button, Space, Alert, Modal } from 'antd';
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
  StarOutlined,
  RocketOutlined,
  ThunderboltOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useGame } from '../contexts/GameContext';
import GameCycleInterface from '../components/GameCycleInterface';
import { GameCycleState } from '../types/game-redesign';

const { Title, Text } = Typography;

export default function DashboardPage() {
  const navigate = useNavigate();
  const { gameState } = useGame();
  const [gameMode, setGameMode] = useState<'classic' | 'redesign'>('classic');
  const [showModeSelector, setShowModeSelector] = useState(false);

  // 模拟数据
  const stats = {
    totalProperties: 12,
    totalRevenue: 125000,
    totalTenants: 45,
    maintenanceRequests: 8
  };

  const handleGameStateChange = useCallback((newState: GameCycleState) => {
    // 将新游戏循环状态同步到原有游戏状态
    console.log('Game cycle state changed:', newState);
  }, []);

  const handlePhaseComplete = useCallback((phase: string) => {
    // 处理阶段完成
    console.log(`Phase ${phase} completed`);
  }, []);

  // 游戏模式选择器
  const renderModeSelector = () => (
    <Modal
      title="选择游戏模式"
      open={showModeSelector}
      footer={null}
      closable={false}
      centered
      width={700}
    >
      <div style={{ padding: '20px 0' }}>
        <Row gutter={24}>
          <Col span={12}>
            <Card
              hoverable
              style={{ 
                border: gameMode === 'classic' ? '2px solid #1890ff' : '1px solid #d9d9d9',
                cursor: 'pointer',
                height: '300px'
              }}
              onClick={() => setGameMode('classic')}
            >
              <div style={{ textAlign: 'center', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  <SettingOutlined style={{ fontSize: '48px', color: '#1890ff', marginBottom: '16px' }} />
                  <h3>经典仪表盘模式</h3>
                  <p style={{ color: '#666', fontSize: '14px' }}>
                    传统的物业管理仪表盘体验，专注于数据展示和基础管理功能。
                  </p>
                </div>
                <ul style={{ textAlign: 'left', fontSize: '12px', color: '#999', margin: 0 }}>
                  <li>简洁的数据统计面板</li>
                  <li>快速访问各功能模块</li>
                  <li>传统的导航和操作</li>
                  <li>适合日常管理使用</li>
                </ul>
              </div>
            </Card>
          </Col>
          
          <Col span={12}>
            <Card
              hoverable
              style={{ 
                border: gameMode === 'redesign' ? '2px solid #52c41a' : '1px solid #d9d9d9',
                cursor: 'pointer',
                height: '300px'
              }}
              onClick={() => setGameMode('redesign')}
            >
              <div style={{ textAlign: 'center', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  <RocketOutlined style={{ fontSize: '48px', color: '#52c41a', marginBottom: '16px' }} />
                  <h3>游戏循环模式</h3>
                  <p style={{ color: '#666', fontSize: '14px' }}>
                    全新的五阶段循环游戏体验，包含建设、经营、探险、竞争、扩张等丰富内容。
                  </p>
                </div>
                <ul style={{ textAlign: 'left', fontSize: '12px', color: '#999', margin: 0 }}>
                  <li>五大核心游戏循环</li>
                  <li>深度策略和RPG元素</li>
                  <li>社交竞争和拍卖系统</li>
                  <li>沉浸式游戏体验</li>
                </ul>
              </div>
            </Card>
          </Col>
        </Row>
        
        <div style={{ textAlign: 'center', marginTop: '24px' }}>
          <Button 
            type="primary" 
            size="large"
            onClick={() => setShowModeSelector(false)}
          >
            确认选择
          </Button>
        </div>
      </div>
    </Modal>
  );

  // 渲染重设计模式
  const renderRedesignMode = () => (
    <div style={{ height: '100vh', position: 'relative' }}>
      <div style={{ 
        position: 'absolute', 
        top: '10px', 
        right: '10px', 
        zIndex: 1000,
        background: 'rgba(255, 255, 255, 0.9)',
        padding: '8px',
        borderRadius: '6px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
      }}>
        <Space>
          <Button 
            size="small"
            icon={<SettingOutlined />}
            onClick={() => setGameMode('classic')}
          >
            切换到经典模式
          </Button>
          <Button 
            size="small"
            icon={<ThunderboltOutlined />}
            onClick={() => setShowModeSelector(true)}
          >
            模式选择
          </Button>
        </Space>
      </div>
      
      <GameCycleInterface
        onGameStateChange={handleGameStateChange}
        onPhaseComplete={handlePhaseComplete}
      />
    </div>
  );

  // 渲染经典模式
  const renderClassicMode = () => (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <Title level={4} style={{ color: '#fff', margin: 0 }}>仪表盘</Title>
        <Space>
          <Button
            icon={<RocketOutlined />}
            onClick={() => setGameMode('redesign')}
            style={{
              background: 'rgba(82, 196, 26, 0.1)',
              border: '1px solid rgba(82, 196, 26, 0.3)',
              color: '#52c41a'
            }}
          >
            切换到游戏循环模式
          </Button>
          <Button
            icon={<ThunderboltOutlined />}
            onClick={() => setShowModeSelector(true)}
            style={{
              background: 'rgba(255, 255, 255, 0.1)',
              border: '1px solid rgba(255, 255, 255, 0.18)',
              color: '#fff'
            }}
          >
            模式选择
          </Button>
        </Space>
      </div>
      
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
            <Space>
              <Button
                size="middle"
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
              <Button
                size="middle"
                icon={<RocketOutlined />}
                onClick={() => setGameMode('redesign')}
                style={{
                  background: 'rgba(82, 196, 26, 0.1)',
                  border: '1px solid rgba(82, 196, 26, 0.3)',
                  color: '#52c41a'
                }}
              >
                体验新模式
              </Button>
            </Space>
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
      
      {/* 快速操作 */}
      <Row gutter={[24, 24]} style={{ marginBottom: '24px' }}>
        <Col xs={24} lg={12}>
          <Card
            title={<span style={{ color: '#fff' }}>快速操作</span>}
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
            <Space direction="vertical" size="middle" style={{ width: '100%' }}>
              <Button 
                type="primary" 
                icon={<PlusOutlined />} 
                block 
                size="large"
                onClick={() => navigate('/properties')}
                style={{
                  background: 'rgba(24, 144, 255, 0.8)',
                  border: 'none',
                  borderRadius: '10px',
                }}
              >
                添加新物业
              </Button>
              <Button 
                icon={<EyeOutlined />} 
                block 
                size="large"
                onClick={() => navigate('/properties')}
                style={{
                  background: 'rgba(255, 255, 255, 0.1)',
                  border: '1px solid rgba( 255, 255, 255, 0.18 )',
                  color: '#fff',
                  borderRadius: '10px',
                }}
              >
                查看所有物业
              </Button>
            </Space>
          </Card>
        </Col>
        
        <Col xs={24} lg={12}>
          <Card
            title={<span style={{ color: '#fff' }}>游戏功能</span>}
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
            <Space direction="vertical" size="middle" style={{ width: '100%' }}>
              <Button 
                icon={<TrophyOutlined />}
                block 
                size="large"
                onClick={() => navigate('/game/achievements')}
                style={{
                  background: 'rgba(255, 193, 7, 0.8)',
                  border: 'none',
                  color: '#fff',
                  borderRadius: '10px',
                }}
              >
                成就系统
              </Button>
              <Button 
                icon={<BarChartOutlined />}
                onClick={() => navigate('/game/scenarios')}
                block
                size="large"
                style={{
                  background: 'rgba(255, 255, 255, 0.1)',
                  border: '1px solid rgba( 255, 255, 255, 0.18 )',
                  color: '#fff',
                  borderRadius: '10px',
                }}
              >
                场景选择
              </Button>
            </Space>
          </Card>
        </Col>
      </Row>
    </div>
  );

  return (
    <>
      {renderModeSelector()}
      {gameMode === 'classic' ? renderClassicMode() : renderRedesignMode()}
    </>
  );
}