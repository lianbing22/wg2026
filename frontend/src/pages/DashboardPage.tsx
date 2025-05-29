// DashboardPage.tsx
import { Button, Typography, Card, Row, Col, Statistic } from 'antd';
import { LogoutOutlined, SettingOutlined, UserOutlined, HomeOutlined, DollarCircleOutlined, TeamOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

const { Title, Text } = Typography;

export default function DashboardPage() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    navigate('/login');
  };

  return (
    <div>
      <Row justify="space-between" align="middle" style={{ marginBottom: 24 }}>
        <Title level={2}>物业管理仪表盘</Title>
        <div>
          <Button icon={<UserOutlined />} style={{ marginRight: 8 }}>
            我的账户
          </Button>
          <Button icon={<SettingOutlined />} style={{ marginRight: 8 }}>
            设置
          </Button>
          <Button type="primary" danger icon={<LogoutOutlined />} onClick={handleLogout}>
            退出登录
          </Button>
        </div>
      </Row>

      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} md={8} lg={6}>
          <Card hoverable>
            <Statistic
              title="管理物业总数"
              value={15}
              prefix={<HomeOutlined />}
              valueStyle={{ color: '#3f8600' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8} lg={6}>
          <Card hoverable>
            <Statistic
              title="当前租户数量"
              value={128}
              prefix={<TeamOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8} lg={6}>
          <Card hoverable>
            <Statistic
              title="本月应收租金 (万元)"
              value={25.6}
              precision={2}
              prefix={<DollarCircleOutlined />}
              valueStyle={{ color: '#cf1322' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8} lg={6}>
          <Card hoverable>
            <Statistic title="待处理工单" value={8} />
          </Card>
        </Col>
      </Row>

      <Card title="近期活动与通知" style={{ marginTop: 24 }}>
        <p><Text strong>2024-07-28:</Text> A栋电梯年度检修完成。</p>
        <p><Text strong>2024-07-25:</Text> 社区夏季纳凉晚会报名开始！</p>
        <p><Text strong>2024-07-20:</Text> 请各位业主注意防范电信诈骗。</p>
      </Card>

      <Card title="快速操作" style={{ marginTop: 24 }}>
        <Button type="primary" style={{ marginRight: 8 }}>发布新公告</Button>
        <Button style={{ marginRight: 8 }}>创建维修工单</Button>
        <Button>查看财务报表</Button>
      </Card>
    </div>
  );
}