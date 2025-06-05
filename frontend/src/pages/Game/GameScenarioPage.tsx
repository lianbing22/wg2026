/**
 * 物业管理模拟器 - 游戏场景页面
 * 实际进行游戏的核心页面，集成场景引擎和游戏统计
 */

import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Row, Col, Card, Button, Space, Typography, Alert, Spin, Modal, Progress } from 'antd';
import { 
  ArrowLeftOutlined, 
  PauseCircleOutlined, 
  SettingOutlined,
  SaveOutlined,
  HomeOutlined,
  DashboardOutlined
} from '@ant-design/icons';
import { Scenario, ScenarioNode } from '../../types/game';
import { scenarioService } from '../../services/scenarioService';
import { useGame } from '../../contexts/GameContext';
import ScenarioEngine from '../../components/game/ScenarioEngine';
import GameStatsPanel from '../../components/game/GameStatsPanel';
import PerformanceMonitor, { performanceTracker } from '../../components/game/PerformanceMonitor';
import './GameScenarioPage.css';

const { Title, Text } = Typography;

export default function GameScenarioPage() {
  const { scenarioId } = useParams<{ scenarioId: string }>();
  const navigate = useNavigate();
  const { gameState, saveGame, applyEffects } = useGame();
  
  const [scenario, setScenario] = useState<Scenario | null>(null);
  const [scenarioNodes, setScenarioNodes] = useState<Record<string, ScenarioNode>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showPauseMenu, setShowPauseMenu] = useState(false);
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  const [gameStartTime] = useState(Date.now());
  const [scenarioProgress, setScenarioProgress] = useState(0);
  const [showPerformanceMonitor, setShowPerformanceMonitor] = useState(false);

  // 加载场景数据
  useEffect(() => {
    if (scenarioId) {
      loadScenario(scenarioId);
    }
  }, [scenarioId]);

  // 监听键盘事件
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setShowPauseMenu(true);
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, []);

  const loadScenario = async (id: string) => {
    try {
      const startTime = performance.now();
      setLoading(true);
      setError(null);
      
      const scenarioData = await scenarioService.getScenarioById(id);
      if (!scenarioData) {
        setError(`场景不存在: ${id}`);
        return;
      }

      // 检查是否满足场景要求
      const { canPlay, missingRequirements } = scenarioService.checkScenarioRequirements(
        scenarioData, 
        gameState.player.skills
      );
      
      if (!canPlay) {
        setError(
          `不满足场景要求:\n${Object.entries(missingRequirements)
            .map(([skill, needed]) => `${skill}: 还需 ${needed} 点`)
            .join('\n')}`
        );
        return;
      }

      const nodes = await scenarioService.getScenarioNodes(id);
      
      // 记录加载时间
      const loadTime = performance.now() - startTime;
      performanceTracker.measureLoadTime(loadTime);
      
      setScenario(scenarioData);
      setScenarioNodes(nodes);
    } catch (err) {
      console.error('Failed to load scenario:', err);
      setError('加载场景失败，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  const handleScenarioComplete = (_scenarioId: string, endingType: string) => {
    if (!scenario) return;

    // 计算游戏时长
    const playTime = Math.round((Date.now() - gameStartTime) / 1000 / 60); // 分钟
    
    // 应用场景奖励
    if (scenario.rewards) {
      const effects = {
        experience: scenario.rewards.experience || 0,
        money: scenario.rewards.money || 0,
        reputation: scenario.rewards.reputation || 0,
        skills: scenario.rewards.skills || {}
      };
      
      applyEffects(effects);
    }

    // 记录场景完成（暂时不保存到数据库）

    // 保存游戏进度
    saveGame();

    // 显示完成对话框
    Modal.success({
      title: '场景完成！',
      content: (
        <div>
          <p>恭喜你完成了场景：{scenario.title}</p>
          <p>游戏时长：{playTime} 分钟</p>
          <p>结局类型：{getEndingTypeText(endingType)}</p>
          {scenario.rewards && (
            <div>
              <p>获得奖励：</p>
              <ul>
                {scenario.rewards.experience && <li>经验值：+{scenario.rewards.experience}</li>}
                {scenario.rewards.money && <li>金钱：+{scenario.rewards.money}</li>}
                {scenario.rewards.reputation && <li>声誉：+{scenario.rewards.reputation}</li>}
                {scenario.rewards.skills && Object.entries(scenario.rewards.skills).map(([skill, increase]) => (
                  <li key={skill}>{skill}：+{increase}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      ),
      onOk: () => navigate('/game/scenarios'),
      okText: '返回场景选择',
      width: 500
    });
  };

  const getEndingTypeText = (endingType: string): string => {
    switch (endingType) {
      case 'normal_ending': return '正常结局';
      case 'choice_ending': return '选择结局';
      case 'qte_success_ending': return 'QTE成功结局';
      case 'qte_failure_ending': return 'QTE失败结局';
      default: return '未知结局';
    }
  };

  const handlePause = () => {
    setShowPauseMenu(true);
  };

  const handleResume = () => {
    setShowPauseMenu(false);
  };

  const handleSaveAndExit = () => {
    saveGame();
    navigate('/game/scenarios');
  };

  const handleExitWithoutSave = () => {
    setShowExitConfirm(true);
  };

  const confirmExit = () => {
    navigate('/game/scenarios');
  };

  const handleBackToHome = () => {
    navigate('/');
  };

  const togglePerformanceMonitor = () => {
    setShowPerformanceMonitor(!showPerformanceMonitor);
  };

  // 计算场景进度（简单估算）
  const calculateProgress = () => {
    if (!scenario) return 0;
    
    const estimatedProgress = Math.min(95, (Date.now() - gameStartTime) / ((scenario.estimatedTime || 30) * 60 * 1000) * 100);
    
    return Math.round(estimatedProgress);
  };

  useEffect(() => {
    const timer = setInterval(() => {
      setScenarioProgress(calculateProgress());
    }, 5000);
    
    return () => clearInterval(timer);
  }, [scenario, gameStartTime]);

  if (loading) {
    return (
      <div className="game-scenario-page loading">
        <Spin size="large" tip="加载场景中..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="game-scenario-page error">
        <Card>
          <Alert
            message="场景加载失败"
            description={error}
            type="error"
            showIcon
            action={
              <Space>
                <Button onClick={() => navigate('/game/scenarios')}>返回场景选择</Button>
                <Button type="primary" onClick={() => scenarioId && loadScenario(scenarioId)}>重试</Button>
              </Space>
            }
          />
        </Card>
      </div>
    );
  }

  if (!scenario) {
    return (
      <div className="game-scenario-page error">
        <Card>
          <Alert
            message="场景不存在"
            description="请选择一个有效的场景"
            type="warning"
            showIcon
            action={
              <Button onClick={() => navigate('/game/scenarios')}>返回场景选择</Button>
            }
          />
        </Card>
      </div>
    );
  }

  return (
    <div className="game-scenario-page">
      {/* 游戏头部工具栏 */}
      <div className="game-toolbar">
        <div className="toolbar-left">
          <Button 
            icon={<ArrowLeftOutlined />} 
            onClick={() => setShowExitConfirm(true)}
            type="text"
          >
            退出场景
          </Button>
          <div className="scenario-info">
            <Title level={4} style={{ margin: 0, color: 'white' }}>
              {scenario.title}
            </Title>
            <Text style={{ color: 'rgba(255,255,255,0.8)' }}>
              进度: {scenarioProgress}%
            </Text>
          </div>
        </div>
        
        <div className="toolbar-right">
          <Space>
            <Progress 
              percent={scenarioProgress} 
              size="small" 
              style={{ width: 100 }}
              strokeColor="#52c41a"
            />
            <Button 
              icon={<SaveOutlined />} 
              onClick={saveGame}
              type="text"
              style={{ color: 'white' }}
            >
              保存
            </Button>
            <Button 
              icon={<PauseCircleOutlined />} 
              onClick={handlePause}
              type="text"
              style={{ color: 'white' }}
            >
              暂停
            </Button>
            <Button 
              icon={<SettingOutlined />} 
              type="text"
              style={{ color: 'white' }}
            >
              设置
            </Button>
            <Button 
              icon={<DashboardOutlined />} 
              onClick={togglePerformanceMonitor}
              type={showPerformanceMonitor ? 'primary' : 'text'}
              style={{ color: 'white' }}
            >
              性能监控
            </Button>
          </Space>
        </div>
      </div>

      {/* 游戏主体内容 */}
      <div className="game-content">
        <Row gutter={[24, 24]}>
          {/* 左侧：场景引擎 */}
          <Col xs={24} lg={18}>
            <ScenarioEngine
              scenario={scenario}
              nodes={scenarioNodes}
              onScenarioComplete={handleScenarioComplete}
              onExit={() => setShowExitConfirm(true)}
            />
          </Col>

          {/* 右侧：游戏统计 */}
          <Col xs={24} lg={6}>
            <GameStatsPanel size="small" detailed={true} />
          </Col>
        </Row>
      </div>

      {/* 暂停菜单 */}
      <Modal
        title="游戏暂停"
        open={showPauseMenu}
        onCancel={handleResume}
        footer={null}
        width={400}
        className="pause-menu"
      >
        <Space direction="vertical" style={{ width: '100%' }} size="large">
          <Button 
            type="primary" 
            block 
            onClick={handleResume}
            icon={<PauseCircleOutlined />}
          >
            继续游戏
          </Button>
          
          <Button 
            block 
            onClick={saveGame}
            icon={<SaveOutlined />}
          >
            保存游戏
          </Button>
          
          <Button 
            block 
            onClick={handleSaveAndExit}
          >
            保存并退出
          </Button>
          
          <Button 
            block 
            onClick={handleBackToHome}
            icon={<HomeOutlined />}
          >
            返回主页
          </Button>
          
          <Button 
            block 
            danger 
            onClick={handleExitWithoutSave}
          >
            不保存退出
          </Button>
        </Space>
      </Modal>

      {/* 退出确认对话框 */}
      <Modal
        title="确认退出"
        open={showExitConfirm}
        onOk={confirmExit}
        onCancel={() => setShowExitConfirm(false)}
        okText="确认退出"
        cancelText="取消"
        okButtonProps={{ danger: true }}
      >
        <p>确定要退出当前场景吗？</p>
        <p style={{ color: '#ff4d4f' }}>注意：未保存的进度将会丢失！</p>
      </Modal>

      {/* 性能监控组件 */}
      <PerformanceMonitor 
        visible={showPerformanceMonitor}
        onToggle={togglePerformanceMonitor}
      />
    </div>
  );
}