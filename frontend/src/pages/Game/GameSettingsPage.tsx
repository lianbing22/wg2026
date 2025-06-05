/**
 * 物业管理模拟器 - 游戏设置页面
 * 让用户调整游戏设置、音效、难度等
 */

import { useState, useEffect } from 'react';
import {
  Card,
  Switch,
  Slider,
  Select,
  Button,
  Form,
  Typography,
  Space,
  Divider,
  message,
  Row,
  Col,
  Alert,
  Modal
} from 'antd';
import { ArrowLeftOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import { useGame } from '../../contexts/GameContext';
import { useNavigate } from 'react-router-dom';
import {
  SoundOutlined,
  BulbOutlined,
  SaveOutlined,
  ReloadOutlined,
  SettingOutlined
} from '@ant-design/icons';
import './GameSettingsPage.css';

const { Title, Text } = Typography;
const { Option } = Select;
const { confirm } = Modal;

interface GameSettings {
  soundEnabled: boolean;
  musicEnabled: boolean;
  volume: number;
  difficulty: number;
  autoSaveInterval: number;
  theme: 'light' | 'dark' | 'auto';
  language: 'zh-CN' | 'en-US';
  showTutorials: boolean;
  fastAnimations: boolean;
  confirmActions: boolean;
}

const difficultyLevels = [
  { value: 1, label: '简单', description: '更多资源，更少挑战' },
  { value: 2, label: '普通', description: '平衡的游戏体验' },
  { value: 3, label: '困难', description: '更少资源，更多挑战' },
  { value: 4, label: '专家', description: '极限挑战，适合高手' }
];

const autoSaveOptions = [
  { value: 0, label: '关闭自动保存' },
  { value: 1, label: '每1分钟' },
  { value: 3, label: '每3分钟' },
  { value: 5, label: '每5分钟' },
  { value: 10, label: '每10分钟' }
];

export default function GameSettingsPage() {
  const navigate = useNavigate();
  const { gameState } = useGame();
  const [form] = Form.useForm();
  const [settings, setSettings] = useState<GameSettings>({
    soundEnabled: true,
    musicEnabled: true,
    volume: 70,
    difficulty: 2,
    autoSaveInterval: 5,
    theme: 'light',
    language: 'zh-CN',
    showTutorials: true,
    fastAnimations: false,
    confirmActions: true
  });
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    // 从游戏状态加载设置
    if (gameState.player.preferences) {
      const prefs = gameState.player.preferences;
      const loadedSettings: GameSettings = {
        soundEnabled: prefs.soundEnabled ?? true,
        musicEnabled: prefs.musicEnabled ?? true,
        volume: prefs.volume ?? 70,
        difficulty: prefs.preferredDifficulty ?? 2,
        autoSaveInterval: prefs.autoSaveInterval ?? 5,
        theme: prefs.theme ?? 'light',
        language: 'zh-CN',
        showTutorials: true,
        fastAnimations: false,
        confirmActions: true
      };
      setSettings(loadedSettings);
      form.setFieldsValue(loadedSettings);
    }
  }, [gameState, form]);

  const handleSettingChange = (field: keyof GameSettings, value: any) => {
    setSettings(prev => ({ ...prev, [field]: value }));
    setHasChanges(true);
  };

  const handleSave = () => {
    try {
      // 保存到localStorage
      localStorage.setItem('gameSettings', JSON.stringify(settings));
      
      // 如果有游戏状态，也更新游戏状态中的设置
      if (gameState && dispatch) {
        // 这里可以添加一个新的action来更新游戏设置
        // dispatch({ type: 'UPDATE_SETTINGS', payload: settings });
        
        // 暂时通过更新玩家偏好来保存部分设置
        const updatedPreferences = {
          ...gameState.player.preferences,
          soundEnabled: settings.soundEnabled,
          musicEnabled: settings.musicEnabled,
          volume: settings.volume,
          difficulty: settings.difficulty,
          autoSaveInterval: settings.autoSaveInterval,
          theme: settings.theme,
          language: settings.language,
          showTutorials: settings.showTutorials,
          fastAnimations: settings.fastAnimations,
          confirmActions: settings.confirmActions
        };
        
        dispatch({
          type: 'UPDATE_PLAYER_PROFILE',
          payload: {
            ...gameState.player,
            preferences: updatedPreferences
          }
        });
      }
      
      setHasChanges(false);
      message.success('设置已保存');
      
      // 应用一些即时生效的设置
      if (settings.theme) {
        document.documentElement.setAttribute('data-theme', settings.theme);
      }
      
    } catch (error) {
      console.error('保存设置失败:', error);
      message.error('保存设置失败，请重试');
    }
  };

  const handleReset = () => {
    confirm({
      title: '重置设置',
      icon: <ExclamationCircleOutlined />,
      content: '确定要将所有设置重置为默认值吗？',
      onOk() {
        const defaultSettings: GameSettings = {
          soundEnabled: true,
          musicEnabled: true,
          volume: 70,
          difficulty: 2,
          autoSaveInterval: 5,
          theme: 'light',
          language: 'zh-CN',
          showTutorials: true,
          fastAnimations: false,
          confirmActions: true
        };
        setSettings(defaultSettings);
        form.setFieldsValue(defaultSettings);
        setHasChanges(true);
        message.info('设置已重置为默认值');
      }
    });
  };

  const handleBack = () => {
    if (hasChanges) {
      confirm({
        title: '未保存的更改',
        icon: <ExclamationCircleOutlined />,
        content: '您有未保存的设置更改，确定要离开吗？',
        onOk() {
          navigate(-1);
        }
      });
    } else {
      navigate(-1);
    }
  };

  return (
    <div className="game-settings-page">
      <div className="settings-container">
        <Card className="settings-card">
          <div className="settings-header">
            <div className="header-content">
              <SettingOutlined className="header-icon" />
              <div>
                <Title level={2} style={{ margin: 0, color: 'white' }}>
                  游戏设置
                </Title>
                <Text style={{ color: 'rgba(255,255,255,0.8)' }}>
                  自定义您的游戏体验
                </Text>
              </div>
            </div>
            <Button 
              icon={<ArrowLeftOutlined />} 
              onClick={handleBack}
              className="back-button"
            >
              返回
            </Button>
          </div>

          <Form
            form={form}
            layout="vertical"
            className="settings-form"
            initialValues={settings}
          >
            {/* 音频设置 */}
            <div className="settings-section">
              <div className="section-header">
                <SoundOutlined className="section-icon" />
                <Title level={4}>音频设置</Title>
              </div>
              
              <Row gutter={[24, 16]}>
                <Col xs={24} sm={12}>
                  <Form.Item label="启用音效">
                    <Switch
                      checked={settings.soundEnabled}
                      onChange={(checked) => handleSettingChange('soundEnabled', checked)}
                      checkedChildren="开"
                      unCheckedChildren="关"
                    />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12}>
                  <Form.Item label="启用背景音乐">
                    <Switch
                      checked={settings.musicEnabled}
                      onChange={(checked) => handleSettingChange('musicEnabled', checked)}
                      checkedChildren="开"
                      unCheckedChildren="关"
                    />
                  </Form.Item>
                </Col>
                <Col xs={24}>
                  <Form.Item label={`音量: ${settings.volume}%`}>
                    <Slider
                      value={settings.volume}
                      onChange={(value) => handleSettingChange('volume', value)}
                      min={0}
                      max={100}
                      marks={{
                        0: '静音',
                        50: '50%',
                        100: '最大'
                      }}
                      disabled={!settings.soundEnabled && !settings.musicEnabled}
                    />
                  </Form.Item>
                </Col>
              </Row>
            </div>

            <Divider />

            {/* 游戏设置 */}
            <div className="settings-section">
              <div className="section-header">
                <BulbOutlined className="section-icon" />
                <Title level={4}>游戏设置</Title>
              </div>
              
              <Row gutter={[24, 16]}>
                <Col xs={24} sm={12}>
                  <Form.Item label="游戏难度">
                    <Select
                      value={settings.difficulty}
                      onChange={(value) => handleSettingChange('difficulty', value)}
                      style={{ width: '100%' }}
                    >
                      {difficultyLevels.map(level => (
                        <Option key={level.value} value={level.value}>
                          <div>
                            <div style={{ fontWeight: 'bold' }}>{level.label}</div>
                            <div style={{ fontSize: '12px', color: '#666' }}>
                              {level.description}
                            </div>
                          </div>
                        </Option>
                      ))}
                    </Select>
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12}>
                  <Form.Item label="自动保存">
                    <Select
                      value={settings.autoSaveInterval}
                      onChange={(value) => handleSettingChange('autoSaveInterval', value)}
                      style={{ width: '100%' }}
                    >
                      {autoSaveOptions.map(option => (
                        <Option key={option.value} value={option.value}>
                          {option.label}
                        </Option>
                      ))}
                    </Select>
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12}>
                  <Form.Item label="主题">
                    <Select
                      value={settings.theme}
                      onChange={(value) => handleSettingChange('theme', value)}
                      style={{ width: '100%' }}
                    >
                      <Option value="light">浅色主题</Option>
                      <Option value="dark">深色主题</Option>
                      <Option value="auto">跟随系统</Option>
                    </Select>
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12}>
                  <Form.Item label="语言">
                    <Select
                      value={settings.language}
                      onChange={(value) => handleSettingChange('language', value)}
                      style={{ width: '100%' }}
                    >
                      <Option value="zh-CN">简体中文</Option>
                      <Option value="en-US">English</Option>
                    </Select>
                  </Form.Item>
                </Col>
              </Row>
            </div>

            <Divider />

            {/* 界面设置 */}
            <div className="settings-section">
              <div className="section-header">
                <Title level={4}>界面设置</Title>
              </div>
              
              <Row gutter={[24, 16]}>
                <Col xs={24} sm={12}>
                  <Form.Item label="显示教程提示">
                    <Switch
                      checked={settings.showTutorials}
                      onChange={(checked) => handleSettingChange('showTutorials', checked)}
                      checkedChildren="开"
                      unCheckedChildren="关"
                    />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12}>
                  <Form.Item label="快速动画">
                    <Switch
                      checked={settings.fastAnimations}
                      onChange={(checked) => handleSettingChange('fastAnimations', checked)}
                      checkedChildren="开"
                      unCheckedChildren="关"
                    />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12}>
                  <Form.Item label="操作确认">
                    <Switch
                      checked={settings.confirmActions}
                      onChange={(checked) => handleSettingChange('confirmActions', checked)}
                      checkedChildren="开"
                      unCheckedChildren="关"
                    />
                  </Form.Item>
                </Col>
              </Row>
            </div>

            {hasChanges && (
              <Alert
                message="您有未保存的更改"
                description="请记得保存您的设置更改"
                type="warning"
                showIcon
                style={{ marginTop: '24px' }}
              />
            )}

            {/* 操作按钮 */}
            <div className="settings-actions">
              <Space size="middle">
                <Button 
                  icon={<ReloadOutlined />}
                  onClick={handleReset}
                >
                  重置默认
                </Button>
                <Button 
                  type="primary"
                  icon={<SaveOutlined />}
                  onClick={handleSave}
                  disabled={!hasChanges}
                >
                  保存设置
                </Button>
              </Space>
            </div>
          </Form>
        </Card>
      </div>
    </div>
  );
}