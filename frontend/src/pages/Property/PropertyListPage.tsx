import { useEffect, useState } from 'react';
import { Table, Typography, Tag, Space, Button, Card, Row, Col, Spin, Alert } from 'antd';
import { EyeOutlined, EditOutlined, PlusOutlined } from '@ant-design/icons';
import { propertyService } from '../../services/propertyService';
import type { Property } from '../../types/property';
import { Link } from 'react-router-dom';

const { Title } = Typography;

const PropertyListPage: React.FC = () => {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProperties = async () => {
      try {
        setLoading(true);
        const data = await propertyService.getProperties();
        setProperties(data);
        setError(null);
      } catch (err) {
        setError('获取物业数据失败，请稍后重试。');
        console.error('Failed to fetch properties:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProperties();
  }, []);

  const getStatusTagColor = (status: Property['status']) => {
    switch (status) {
      case 'available':
        return 'green';
      case 'occupied':
        return 'blue';
      case 'under_maintenance':
        return 'orange';
      default:
        return 'default';
    }
  };

  const columns = [
    {
      title: '物业名称',
      dataIndex: 'name',
      key: 'name',
      render: (text: string, record: Property) => <Link to={`/properties/${record.id}`}>{text}</Link>,
    },
    {
      title: '地址',
      dataIndex: 'address',
      key: 'address',
    },
    {
      title: '类型',
      dataIndex: 'type',
      key: 'type',
      render: (type: Property['type']) => {
        let typeText = '';
        switch (type) {
          case 'residential': typeText = '住宅'; break;
          case 'commercial': typeText = '商业'; break;
          case 'industrial': typeText = '工业'; break;
        }
        return <Tag>{typeText}</Tag>;
      },
    },
    {
      title: '单元数',
      dataIndex: 'units',
      key: 'units',
      align: 'right' as const,
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status: Property['status']) => (
        <Tag color={getStatusTagColor(status)}>
          {status === 'available' ? '可出租' : status === 'occupied' ? '已出租' : '维护中'}
        </Tag>
      ),
    },
    {
      title: '月租金 (总计)',
      dataIndex: 'rentAmount',
      key: 'rentAmount',
      align: 'right' as const,
      render: (amount: number) => `¥${amount.toLocaleString()}`,
    },
    {
      title: '操作',
      key: 'action',
      render: (_: any, record: Property) => (
        <Space size="middle">
          <Link to={`/properties/${record.id}`}>
            <Button icon={<EyeOutlined />} size="small">详情</Button>
          </Link>
          <Link to={`/properties/edit/${record.id}`}>
            <Button icon={<EditOutlined />} size="small">编辑</Button>
          </Link>
        </Space>
      ),
    },
  ];

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 'calc(100vh - 200px)' }}>
        <Spin size="large" />
      </div>
    );
  }

  if (error) {
    return <Alert message="错误" description={error} type="error" showIcon />;
  }

  return (
    <Card>
      <Row justify="space-between" align="middle" style={{ marginBottom: 24 }}>
        <Col>
          <Title level={3}>物业列表</Title>
        </Col>
        <Col>
          <Link to="/properties/new">
            <Button type="primary" icon={<PlusOutlined />}>
              新增物业
            </Button>
          </Link>
        </Col>
      </Row>
      <Table
        columns={columns}
        dataSource={properties}
        rowKey="id"
        bordered
        pagination={{ pageSize: 10 }}
      />
    </Card>
  );
};

export default PropertyListPage;