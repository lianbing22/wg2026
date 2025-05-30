/**
 * 物业管理模拟器 - 角色创建页面
 * 让用户创建游戏角色并设置初始属性
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Card,
  Form,
  Input,
  Button,
  Row,
  Col,
  Typography,
  Avatar,
  Space,
  Slider,
  Alert,
  Divider,
  Tag
} from 'antd';
import {
  UserOutlined,
  ArrowRightOutlined,

} from '@ant-design/icons';
import { useGame } from '../../contexts/GameContext';
import './CharacterCreationPage.css';

const { Title, Text, Paragraph } = Typography;

interface CharacterForm {
  name: string;
  background: string;
  skills: {
    communication: number;
    management: number;
    technical: number;
    finance: number;
  };
}

const backgrounds = [
  {
    id: 'fresh_graduate',
    name: '应届毕业生',
    description: '刚从大学毕业，充满热情但缺乏经验',
    bonuses: { communication: 2, management: 1 },
    startingMoney: 5000,
    color: '#52c41a'
  },
  {
    id: 'experienced_manager',
    name: '资深管理者',
    description: '有丰富的管理经验，善于处理复杂问题',
    bonuses: { management: 3, finance: 2 },
    startingMoney: 15000,
    color: '#1890ff'
  },
  {
    id: 'technical_expert',
    name: '技术专家',
    description: '精通各种技术设备，维修能力强',
    bonuses: { technical: 4, management: 1 },
    startingMoney: 8000,
    color: '#722ed1'
  },
  {
    id: 'finance_specialist',
    name: '财务专家',
    description: '擅长财务管理和成本控制',
    bonuses: { finance: 3, communication: 1, management: 1 },
    startingMoney: 12000,
    color: '#fa8c16'
  }
];

export default function CharacterCreationPage() {
  const navigate = useNavigate();
  const { createNewGame } = useGame(); // 暂时不使用gameState
  const [form] = Form.useForm();
  const [selectedBackground, setSelectedBackground] = useState<string>('');
  const [skillPoints, setSkillPoints] = useState({
    communication: 5,
    management: 5,
    technical: 5,
    finance: 5
  });
  const [remainingPoints, setRemainingPoints] = useState(10);

  const totalSkillPoints = 30; // 基础技能点 + 可分配点数
  // const baseSkillPoints = 20; // 基础技能点（每项5点） // 暂时未使用
  // const availablePoints = totalSkillPoints - baseSkillPoints; // 暂时未使用

  const handleSkillChange = (skill: keyof typeof skillPoints, value: number) => {
    const currentTotal = Object.values(skillPoints).reduce((sum, val) => sum + val, 0);
    const newTotal = currentTotal - skillPoints[skill] + value;
    
    if (newTotal <= totalSkillPoints) {
      setSkillPoints(prev => ({ ...prev, [skill]: value }));
      setRemainingPoints(totalSkillPoints - newTotal);
    }
  };

  const getSkillDescription = (skill: string) => {
    const descriptions = {
      communication: '影响与租户、业主的沟通效果',
      management: '影响团队管理和决策能力',
      technical: '影响设备维修和技术问题处理',
      finance: '影响财务管理和成本控制'
    };
    return descriptions[skill as keyof typeof descriptions];
  };

  const handleSubmit = async (values: CharacterForm) => {
    if (!selectedBackground) {
      return;
    }

    const background = backgrounds.find(bg => bg.id === selectedBackground);
    if (!background) return;

    // 应用背景加成
    const finalSkills = { ...skillPoints };
    Object.entries(background.bonuses).forEach(([skill, bonus]) => {
      finalSkills[skill as keyof typeof finalSkills] += bonus;
    });

    // 创建新游戏
    createNewGame({
      name: values.name,
      background: selectedBackground,
      skills: finalSkills,
      startingMoney: background.startingMoney
    });

    // 跳转到场景选择页面
    navigate('/game/scenarios');
  };

  const selectedBg = backgrounds.find(bg => bg.id === selectedBackground);

  return (
    <div className="character-creation-page">
      <div className="creation-container">
        <Card className="creation-card">
          <div className="creation-header">
            <Avatar size={64} icon={<UserOutlined />} className="creation-avatar" />
            <div>
              <Title level={2} style={{ margin: 0, color: 'white' }}>
                创建角色
              </Title>
              <Text style={{ color: 'rgba(255,255,255,0.8)' }}>
                开始你的物业管理之旅
              </Text>
            </div>
          </div>

          <Form
            form={form}
            layout="vertical"
            onFinish={handleSubmit}
            className="creation-form"
          >
            {/* 角色姓名 */}
            <Form.Item
              name="name"
              label="角色姓名"
              rules={[
                { required: true, message: '请输入角色姓名' },
                { min: 2, max: 10, message: '姓名长度应在2-10个字符之间' }
              ]}
            >
              <Input 
                placeholder="请输入您的角色姓名" 
                size="large"
                prefix={<UserOutlined />}
              />
            </Form.Item>

            <Divider>选择背景</Divider>

            {/* 背景选择 */}
            <Form.Item
              name="background"
              label="职业背景"
              rules={[{ required: true, message: '请选择一个职业背景' }]}
            >
              <Row gutter={[16, 16]}>
                {backgrounds.map(bg => (
                  <Col xs={24} sm={12} key={bg.id}>
                    <Card
                      hoverable
                      className={`background-card ${
                        selectedBackground === bg.id ? 'selected' : ''
                      }`}
                      onClick={() => {
                        setSelectedBackground(bg.id);
                        form.setFieldValue('background', bg.id);
                      }}
                      style={{ borderColor: bg.color }}
                    >
                      <div className="background-header">
                        <Tag color={bg.color}>{bg.name}</Tag>
                        <Text strong style={{ color: bg.color }}>
                          +{bg.startingMoney}元
                        </Text>
                      </div>
                      <Paragraph style={{ margin: '8px 0', fontSize: '13px' }}>
                        {bg.description}
                      </Paragraph>
                      <div className="background-bonuses">
                        <Text strong>技能加成：</Text>
                        <div>
                          {Object.entries(bg.bonuses).map(([skill, bonus]) => (
                            <Tag key={skill} color="blue">
                              {skill === 'communication' && '沟通'}
                              {skill === 'management' && '管理'}
                              {skill === 'technical' && '技术'}
                              {skill === 'finance' && '财务'}
                              +{bonus}
                            </Tag>
                          ))}
                        </div>
                      </div>
                    </Card>
                  </Col>
                ))}
              </Row>
            </Form.Item>

            <Divider>分配技能点</Divider>

            {/* 技能分配 */}
            <div className="skills-section">
              <Alert
                message={`剩余技能点：${remainingPoints}`}
                type={remainingPoints === 0 ? 'success' : 'info'}
                showIcon
                style={{ marginBottom: '16px' }}
              />

              <Row gutter={[16, 16]}>
                {Object.entries(skillPoints).map(([skill, value]) => (
                  <Col xs={24} sm={12} key={skill}>
                    <div className="skill-item">
                      <div className="skill-header">
                        <Text strong>
                          {skill === 'communication' && '沟通能力'}
                          {skill === 'management' && '管理能力'}
                          {skill === 'technical' && '技术能力'}
                          {skill === 'finance' && '财务能力'}
                        </Text>
                        <Tag color="blue">{value}</Tag>
                      </div>
                      <Text type="secondary" style={{ fontSize: '12px' }}>
                        {getSkillDescription(skill)}
                      </Text>
                      <Slider
                        min={1}
                        max={10}
                        value={value}
                        onChange={(val) => handleSkillChange(skill as keyof typeof skillPoints, val)}
                        marks={{
                          1: '1',
                          5: '5',
                          10: '10'
                        }}
                        style={{ marginTop: '8px' }}
                      />
                    </div>
                  </Col>
                ))}
              </Row>

              {selectedBg && (
                <Alert
                  message="背景加成预览"
                  description={
                    <div>
                      <Text>选择 "{selectedBg.name}" 后，你的最终技能将是：</Text>
                      <div style={{ marginTop: '8px' }}>
                        {Object.entries(skillPoints).map(([skill, value]) => {
                          const bonus = selectedBg.bonuses[skill as keyof typeof selectedBg.bonuses] || 0;
                          const final = value + bonus;
                          return (
                            <Tag key={skill} color={bonus > 0 ? 'green' : 'default'}>
                              {skill === 'communication' && '沟通'}
                              {skill === 'management' && '管理'}
                              {skill === 'technical' && '技术'}
                              {skill === 'finance' && '财务'}
                              : {value}{bonus > 0 && ` + ${bonus}`} = {final}
                            </Tag>
                          );
                        })}
                      </div>
                    </div>
                  }
                  type="success"
                  style={{ marginTop: '16px' }}
                />
              )}
            </div>

            {/* 提交按钮 */}
            <Form.Item style={{ marginTop: '24px', marginBottom: 0 }}>
              <Space style={{ width: '100%', justifyContent: 'space-between' }}>
                <Button onClick={() => navigate('/')}>
                  返回首页
                </Button>
                <Button 
                  type="primary" 
                  htmlType="submit"
                  size="large"
                  icon={<ArrowRightOutlined />}
                  disabled={remainingPoints > 0 || !selectedBackground}
                >
                  开始游戏
                </Button>
              </Space>
            </Form.Item>
          </Form>
        </Card>
      </div>
    </div>
  );
}