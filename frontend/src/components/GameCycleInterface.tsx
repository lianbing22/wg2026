/**
 * 物业管理模拟器 - 游戏循环主界面
 * 整合建设、经营、探险、竞争、扩张五大核心循环的统一游戏体验
 */

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  Card, 
  Button, 
  Steps, 
  Modal, 
  Progress, 
  Space, 
  Row, 
  Col, 
  Statistic, 
  Alert, 
  Tabs,
  Badge,
  Timeline,
  Tag,
  Tooltip,
  Divider,
  List,
  Avatar,
  Drawer,
  Switch,
  Slider,
  Rate,
  notification
} from 'antd';
import { 
  BuildOutlined,
  SettingOutlined,
  TrophyOutlined,
  CompassOutlined,
  RocketOutlined,
  CrownOutlined,
  FireOutlined,
  ThunderboltOutlined,
  StarOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  PlayCircleOutlined,
  PauseCircleOutlined,
  ReloadOutlined,
  SaveOutlined,
  LoadingOutlined,
  BellOutlined,
  EyeOutlined,
  MenuOutlined,
  FullscreenOutlined,
  FullscreenExitOutlined
} from '@ant-design/icons';

// 导入阶段组件
import BuildingPhase from './phases/BuildingPhase';
import OperationPhase from './phases/OperationPhase';
import ExplorationPhase from './phases/ExplorationPhase';
import CompetitionPhase from './phases/CompetitionPhase';
import ExpansionPhase from './phases/ExpansionPhase';

// 导入类型和工具
import { GamePhase, GameCycleState } from '../types/game-redesign';
import { GameCycleManager } from '../utils/game-cycle-manager';

const { Step } = Steps;
const { TabPane } = Tabs;

// ==================== 接口定义 ====================

interface GameCycleInterfaceProps {
  onGameStateChange?: (state: GameCycleState) => void;
  onPhaseComplete?: (phase: GamePhase) => void;
  initialState?: Partial<GameCycleState>;
}

interface PhaseNavigationProps {
  currentPhase: GamePhase;
  phaseProgress: Record<GamePhase, number>;
  onPhaseSelect: (phase: GamePhase) => void;
  isPhaseUnlocked: (phase: GamePhase) => boolean;
}

interface GameControlsProps {
  isPlaying: boolean;
  onPlayPause: () => void;
  onReset: () => void;
  onSave: () => void;
  onLoad: () => void;
  gameSpeed: number;
  onSpeedChange: (speed: number) => void;
}

interface GameStatsProps {
  gameState: GameCycleState;
  totalPlayTime: number;
  achievements: string[];
}

interface NotificationCenterProps {
  notifications: GameNotification[];
  onMarkAsRead: (id: string) => void;
  onClearAll: () => void;
}

interface GameNotification {
  id: string;
  type: 'success' | 'warning' | 'error' | 'info';
  title: string;
  message: string;
  timestamp: Date;
  isRead: boolean;
  phase?: GamePhase;
}

// ==================== 阶段导航组件 ====================

const PhaseNavigation: React.FC<PhaseNavigationProps> = ({ 
  currentPhase, 
  phaseProgress, 
  onPhaseSelect, 
  isPhaseUnlocked 
}) => {
  const phases: { key: GamePhase; title: string; icon: React.ReactNode; description: string }[] = [
    {
      key: 'building',
      title: '建设阶段',
      icon: <BuildOutlined />,
      description: '规划建筑、管理施工、组建团队'
    },
    {
      key: 'operation',
      title: '经营阶段',
      icon: <SettingOutlined />,
      description: '租户管理、投诉处理、动态定价'
    },
    {
      key: 'exploration',
      title: '探险阶段',
      icon: <CompassOutlined />,
      description: '装备管理、技能提升、任务探索'
    },
    {
      key: 'competition',
      title: '竞争阶段',
      icon: <TrophyOutlined />,
      description: '拍卖竞价、排行榜、社交互动'
    },
    {
      key: 'expansion',
      title: '扩张阶段',
      icon: <RocketOutlined />,
      description: '区域探索、地块收购、帝国扩张'
    }
  ];

  const getPhaseStatus = (phase: GamePhase) => {
    if (!isPhaseUnlocked(phase)) return 'wait';
    if (phase === currentPhase) return 'process';
    if (phaseProgress[phase] >= 100) return 'finish';
    return 'wait';
  };

  return (
    <Card title="游戏阶段" extra={<CrownOutlined />}>
      <Steps 
        direction="vertical" 
        current={phases.findIndex(p => p.key === currentPhase)}
        size="small"
      >
        {phases.map((phase, index) => (
          <Step
            key={phase.key}
            title={
              <Space>
                <span>{phase.title}</span>
                <Badge 
                  count={`${Math.round(phaseProgress[phase.key] || 0)}%`} 
                  style={{ backgroundColor: '#52c41a' }}
                />
              </Space>
            }
            description={
              <div>
                <div style={{ fontSize: '12px', color: '#666', marginBottom: '8px' }}>
                  {phase.description}
                </div>
                <div>
                  <Progress 
                    percent={phaseProgress[phase.key] || 0} 
                    size="small"
                    strokeColor={phase.key === currentPhase ? '#1890ff' : '#52c41a'}
                  />
                </div>
                {isPhaseUnlocked(phase.key) && phase.key !== currentPhase && (
                  <Button 
                    size="small" 
                    type="link"
                    onClick={() => onPhaseSelect(phase.key)}
                    style={{ padding: '4px 0', height: 'auto' }}
                  >
                    切换到此阶段
                  </Button>
                )}
              </div>
            }
            icon={phase.icon}
            status={getPhaseStatus(phase.key)}
          />
        ))}
      </Steps>
    </Card>
  );
};

// ==================== 游戏控制组件 ====================

const GameControls: React.FC<GameControlsProps> = ({ 
  isPlaying, 
  onPlayPause, 
  onReset, 
  onSave, 
  onLoad, 
  gameSpeed, 
  onSpeedChange 
}) => {
  return (
    <Card title="游戏控制" size="small">
      <Space direction="vertical" style={{ width: '100%' }}>
        <Row gutter={8}>
          <Col span={12}>
            <Button 
              type={isPlaying ? 'default' : 'primary'}
              icon={isPlaying ? <PauseCircleOutlined /> : <PlayCircleOutlined />}
              onClick={onPlayPause}
              block
            >
              {isPlaying ? '暂停' : '开始'}
            </Button>
          </Col>
          <Col span={12}>
            <Button 
              icon={<ReloadOutlined />}
              onClick={onReset}
              block
            >
              重置
            </Button>
          </Col>
        </Row>
        
        <Row gutter={8}>
          <Col span={12}>
            <Button 
              icon={<SaveOutlined />}
              onClick={onSave}
              block
            >
              保存
            </Button>
          </Col>
          <Col span={12}>
            <Button 
              icon={<LoadingOutlined />}
              onClick={onLoad}
              block
            >
              加载
            </Button>
          </Col>
        </Row>
        
        <div>
          <div style={{ marginBottom: '8px', fontSize: '12px' }}>游戏速度: {gameSpeed}x</div>
          <Slider
            min={0.5}
            max={3}
            step={0.5}
            value={gameSpeed}
            onChange={onSpeedChange}
            marks={{
              0.5: '0.5x',
              1: '1x',
              2: '2x',
              3: '3x'
            }}
          />
        </div>
      </Space>
    </Card>
  );
};

// ==================== 游戏统计组件 ====================

const GameStats: React.FC<GameStatsProps> = ({ 
  gameState, 
  totalPlayTime, 
  achievements 
}) => {
  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}小时${minutes}分钟`;
  };

  const totalCycles = Object.values(gameState.phase_history || {}).reduce((sum, count) => sum + count, 0);
  const currentCycleNumber = Math.floor(totalCycles / 5) + 1;

  return (
    <Card title="游戏统计" size="small">
      <Space direction="vertical" style={{ width: '100%' }}>
        <Row gutter={16}>
          <Col span={12}>
            <Statistic 
              title="游戏时间" 
              value={formatTime(totalPlayTime)} 
              prefix={<ClockCircleOutlined />}
            />
          </Col>
          <Col span={12}>
            <Statistic 
              title="当前周期" 
              value={currentCycleNumber} 
              prefix={<FireOutlined />}
            />
          </Col>
        </Row>
        
        <Row gutter={16}>
          <Col span={12}>
            <Statistic 
              title="总资产" 
              value={gameState.player_profile?.total_assets || 0} 
              prefix="¥"
              precision={0}
            />
          </Col>
          <Col span={12}>
            <Statistic 
              title="成就数量" 
              value={achievements.length} 
              prefix={<StarOutlined />}
            />
          </Col>
        </Row>
        
        <Divider style={{ margin: '12px 0' }} />
        
        <div>
          <div style={{ fontSize: '12px', marginBottom: '8px' }}>最近成就:</div>
          <Space wrap>
            {achievements.slice(-3).map((achievement, index) => (
              <Tag key={index} color="gold" size="small">
                {achievement}
              </Tag>
            ))}
          </Space>
        </div>
      </Space>
    </Card>
  );
};

// ==================== 通知中心组件 ====================

const NotificationCenter: React.FC<NotificationCenterProps> = ({ 
  notifications, 
  onMarkAsRead, 
  onClearAll 
}) => {
  const unreadCount = notifications.filter(n => !n.isRead).length;

  const getNotificationIcon = (type: string) => {
    const icons = {
      success: <CheckCircleOutlined style={{ color: '#52c41a' }} />,
      warning: <ExclamationCircleOutlined style={{ color: '#faad14' }} />,
      error: <ExclamationCircleOutlined style={{ color: '#ff4d4f' }} />,
      info: <BellOutlined style={{ color: '#1890ff' }} />
    };
    return icons[type] || icons.info;
  };

  return (
    <Card 
      title={
        <Space>
          <span>通知中心</span>
          {unreadCount > 0 && (
            <Badge count={unreadCount} size="small" />
          )}
        </Space>
      }
      size="small"
      extra={
        notifications.length > 0 && (
          <Button size="small" onClick={onClearAll}>
            清空
          </Button>
        )
      }
    >
      {notifications.length === 0 ? (
        <div style={{ textAlign: 'center', color: '#999', padding: '20px' }}>
          暂无通知
        </div>
      ) : (
        <List
          size="small"
          dataSource={notifications.slice(0, 5)}
          renderItem={notification => (
            <List.Item
              style={{
                backgroundColor: notification.isRead ? 'transparent' : '#f6ffed',
                borderRadius: '4px',
                marginBottom: '4px',
                padding: '8px 12px'
              }}
              actions={[
                !notification.isRead && (
                  <Button 
                    size="small" 
                    type="link"
                    onClick={() => onMarkAsRead(notification.id)}
                  >
                    标记已读
                  </Button>
                )
              ]}
            >
              <List.Item.Meta
                avatar={getNotificationIcon(notification.type)}
                title={
                  <Space>
                    <span style={{ fontSize: '12px', fontWeight: notification.isRead ? 'normal' : 'bold' }}>
                      {notification.title}
                    </span>
                    {notification.phase && (
                      <Tag size="small">{notification.phase}</Tag>
                    )}
                  </Space>
                }
                description={
                  <div>
                    <div style={{ fontSize: '11px', marginBottom: '4px' }}>
                      {notification.message}
                    </div>
                    <div style={{ fontSize: '10px', color: '#999' }}>
                      {notification.timestamp.toLocaleString()}
                    </div>
                  </div>
                }
              />
            </List.Item>
          )}
        />
      )}
    </Card>
  );
};

// ==================== 主游戏循环界面组件 ====================

const GameCycleInterface: React.FC<GameCycleInterfaceProps> = ({ 
  onGameStateChange, 
  onPhaseComplete, 
  initialState 
}) => {
  // 状态管理
  const [gameCycleManager] = useState(() => new GameCycleManager(initialState));
  const [gameState, setGameState] = useState<GameCycleState>(gameCycleManager.getGameState());
  const [isPlaying, setIsPlaying] = useState(false);
  const [gameSpeed, setGameSpeed] = useState(1);
  const [totalPlayTime, setTotalPlayTime] = useState(0);
  const [achievements, setAchievements] = useState<string[]>(['新手上路', '第一桶金']);
  const [notifications, setNotifications] = useState<GameNotification[]>([]);
  const [sidebarVisible, setSidebarVisible] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // 计算阶段进度
  const phaseProgress = useMemo(() => {
    const progress: Record<GamePhase, number> = {
      building: 0,
      operation: 0,
      exploration: 0,
      competition: 0,
      expansion: 0
    };
    
    Object.entries(gameState.phase_progress || {}).forEach(([phase, value]) => {
      progress[phase as GamePhase] = value;
    });
    
    return progress;
  }, [gameState.phase_progress]);

  // 检查阶段是否解锁
  const isPhaseUnlocked = useCallback((phase: GamePhase) => {
    const phaseOrder: GamePhase[] = ['building', 'operation', 'exploration', 'competition', 'expansion'];
    const currentIndex = phaseOrder.indexOf(gameState.current_phase);
    const targetIndex = phaseOrder.indexOf(phase);
    
    // 当前阶段和之前的阶段都解锁
    if (targetIndex <= currentIndex) return true;
    
    // 检查前一个阶段是否完成
    if (targetIndex > 0) {
      const previousPhase = phaseOrder[targetIndex - 1];
      return phaseProgress[previousPhase] >= 100;
    }
    
    return false;
  }, [gameState.current_phase, phaseProgress]);

  // 游戏循环定时器
  useEffect(() => {
    if (!isPlaying) return;
    
    const interval = setInterval(() => {
      setTotalPlayTime(prev => prev + gameSpeed);
      
      // 更新游戏状态
      const newState = gameCycleManager.getGameState();
      setGameState(newState);
      
      // 触发外部状态变化回调
      onGameStateChange?.(newState);
    }, 1000 / gameSpeed);
    
    return () => clearInterval(interval);
  }, [isPlaying, gameSpeed, gameCycleManager, onGameStateChange]);

  // 阶段切换处理
  const handlePhaseSelect = useCallback((phase: GamePhase) => {
    if (isPhaseUnlocked(phase)) {
      gameCycleManager.switchPhase(phase);
      setGameState(gameCycleManager.getGameState());
      
      // 添加通知
      const newNotification: GameNotification = {
        id: `phase_switch_${Date.now()}`,
        type: 'info',
        title: '阶段切换',
        message: `已切换到${phase}阶段`,
        timestamp: new Date(),
        isRead: false,
        phase
      };
      setNotifications(prev => [newNotification, ...prev]);
    }
  }, [gameCycleManager, isPhaseUnlocked]);

  // 阶段完成处理
  const handlePhaseComplete = useCallback(() => {
    const currentPhase = gameState.current_phase;
    
    // 标记阶段完成
    gameCycleManager.completePhase();
    
    // 添加成就
    const phaseNames = {
      building: '建设大师',
      operation: '经营专家',
      exploration: '探险家',
      competition: '竞争之王',
      expansion: '扩张帝王'
    };
    
    const newAchievement = phaseNames[currentPhase];
    if (newAchievement && !achievements.includes(newAchievement)) {
      setAchievements(prev => [...prev, newAchievement]);
    }
    
    // 添加通知
    const newNotification: GameNotification = {
      id: `phase_complete_${Date.now()}`,
      type: 'success',
      title: '阶段完成',
      message: `恭喜完成${currentPhase}阶段！`,
      timestamp: new Date(),
      isRead: false,
      phase: currentPhase
    };
    setNotifications(prev => [newNotification, ...prev]);
    
    // 触发外部回调
    onPhaseComplete?.(currentPhase);
    
    // 更新状态
    setGameState(gameCycleManager.getGameState());
  }, [gameState.current_phase, gameCycleManager, achievements, onPhaseComplete]);

  // 游戏控制处理
  const handlePlayPause = useCallback(() => {
    setIsPlaying(prev => !prev);
  }, []);

  const handleReset = useCallback(() => {
    Modal.confirm({
      title: '确认重置',
      content: '这将重置所有游戏进度，确定要继续吗？',
      onOk: () => {
        gameCycleManager.resetGame();
        setGameState(gameCycleManager.getGameState());
        setTotalPlayTime(0);
        setAchievements(['新手上路']);
        setNotifications([]);
        setIsPlaying(false);
      }
    });
  }, [gameCycleManager]);

  const handleSave = useCallback(() => {
    const saveData = {
      gameState,
      totalPlayTime,
      achievements,
      timestamp: new Date().toISOString()
    };
    
    localStorage.setItem('property_game_save', JSON.stringify(saveData));
    
    notification.success({
      message: '保存成功',
      description: '游戏进度已保存到本地存储',
      duration: 2
    });
  }, [gameState, totalPlayTime, achievements]);

  const handleLoad = useCallback(() => {
    try {
      const saveData = localStorage.getItem('property_game_save');
      if (saveData) {
        const parsed = JSON.parse(saveData);
        
        // 恢复游戏状态
        gameCycleManager.importGameState(parsed.gameState);
        setGameState(parsed.gameState);
        setTotalPlayTime(parsed.totalPlayTime || 0);
        setAchievements(parsed.achievements || ['新手上路']);
        
        notification.success({
          message: '加载成功',
          description: `已加载 ${new Date(parsed.timestamp).toLocaleString()} 的存档`,
          duration: 2
        });
      } else {
        notification.warning({
          message: '没有找到存档',
          description: '请先保存游戏进度',
          duration: 2
        });
      }
    } catch (error) {
      notification.error({
        message: '加载失败',
        description: '存档文件可能已损坏',
        duration: 2
      });
    }
  }, [gameCycleManager]);

  // 通知处理
  const handleMarkAsRead = useCallback((id: string) => {
    setNotifications(prev => 
      prev.map(n => n.id === id ? { ...n, isRead: true } : n)
    );
  }, []);

  const handleClearAllNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  // 全屏切换
  const toggleFullscreen = useCallback(() => {
    if (!isFullscreen) {
      document.documentElement.requestFullscreen?.();
    } else {
      document.exitFullscreen?.();
    }
    setIsFullscreen(prev => !prev);
  }, [isFullscreen]);

  // 渲染当前阶段组件
  const renderCurrentPhase = () => {
    const commonProps = {
      gameCycleManager,
      onPhaseComplete: handlePhaseComplete
    };

    switch (gameState.current_phase) {
      case 'building':
        return <BuildingPhase {...commonProps} />;
      case 'operation':
        return <OperationPhase {...commonProps} />;
      case 'exploration':
        return <ExplorationPhase {...commonProps} />;
      case 'competition':
        return <CompetitionPhase {...commonProps} />;
      case 'expansion':
        return <ExpansionPhase {...commonProps} />;
      default:
        return <div>未知阶段</div>;
    }
  };

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* 顶部工具栏 */}
      <Card 
        size="small" 
        style={{ 
          borderRadius: 0, 
          borderBottom: '1px solid #f0f0f0',
          marginBottom: 0
        }}
      >
        <Row justify="space-between" align="middle">
          <Col>
            <Space>
              <Button 
                icon={<MenuOutlined />} 
                onClick={() => setSidebarVisible(true)}
              >
                菜单
              </Button>
              <Tag color="blue">{gameState.current_phase}阶段</Tag>
              <Tag color={isPlaying ? 'green' : 'red'}>
                {isPlaying ? '运行中' : '已暂停'}
              </Tag>
            </Space>
          </Col>
          
          <Col>
            <Space>
              <Statistic 
                title="" 
                value={`¥${(gameState.player_profile?.total_assets || 0).toLocaleString()}`} 
                style={{ margin: 0 }}
              />
              <Button 
                icon={isFullscreen ? <FullscreenExitOutlined /> : <FullscreenOutlined />}
                onClick={toggleFullscreen}
              />
            </Space>
          </Col>
        </Row>
      </Card>

      {/* 主要内容区域 */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        {/* 主游戏区域 */}
        <div style={{ flex: 1, overflow: 'auto', padding: '0' }}>
          {renderCurrentPhase()}
        </div>
      </div>

      {/* 侧边栏 */}
      <Drawer
        title="游戏控制面板"
        placement="left"
        onClose={() => setSidebarVisible(false)}
        open={sidebarVisible}
        width={400}
      >
        <Space direction="vertical" style={{ width: '100%' }} size="large">
          <PhaseNavigation
            currentPhase={gameState.current_phase}
            phaseProgress={phaseProgress}
            onPhaseSelect={handlePhaseSelect}
            isPhaseUnlocked={isPhaseUnlocked}
          />
          
          <GameControls
            isPlaying={isPlaying}
            onPlayPause={handlePlayPause}
            onReset={handleReset}
            onSave={handleSave}
            onLoad={handleLoad}
            gameSpeed={gameSpeed}
            onSpeedChange={setGameSpeed}
          />
          
          <GameStats
            gameState={gameState}
            totalPlayTime={totalPlayTime}
            achievements={achievements}
          />
          
          <NotificationCenter
            notifications={notifications}
            onMarkAsRead={handleMarkAsRead}
            onClearAll={handleClearAllNotifications}
          />
        </Space>
      </Drawer>
    </div>
  );
};

export default GameCycleInterface;