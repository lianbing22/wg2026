import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Card, Descriptions, Spin, Alert, Typography, Tag, Row, Col, Button, Image } from 'antd';
import { ArrowLeftOutlined, EditOutlined } from '@ant-design/icons';
import { propertyService } from '../../services/propertyService';
import { Property } from '../../types/property';

const { Title, Text } = Typography;

const PropertyDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [property, setProperty] = useState<Property | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      const fetchPropertyDetails = async () => {
        try {
          setLoading(true);
          const data = await propertyService.getPropertyById(id);
          if (data) {
            setProperty(data);
          } else {
            setError('未找到指定的物业信息。');
          }
        } catch (err) {
          setError('获取物业详情失败，请稍后重试。');
          console.error('Failed to fetch property details:', err);
        } finally {
          setLoading(false);
        }
      };
      fetchPropertyDetails();
    }
  }, [id]);

  const getStatusTagColor = (status: Property['status']) => {
    switch (status) {
      case 'available': return 'green';
      case 'occupied': return 'blue';
      case 'under_maintenance': return 'orange';
      default: return 'default';
    }
  };

  const getTypeDisplayText = (type: Property['type']) => {
    switch (type) {
      case 'residential': return '住宅';
      case 'commercial': return '商业';
      case 'industrial': return '工业';
      default: return type;
    }
  };

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

  if (!property) {
    return <Alert message="信息" description="物业数据不存在。" type="info" showIcon />;
  }

  return (
    <Card>
      <Row justify="space-between" align="middle" style={{ marginBottom: 24 }}>
        <Col>
          <Button icon={<ArrowLeftOutlined />} onClick={() => window.history.back()}>
            返回列表
          </Button>
        </Col>
        <Col>
          <Title level={3} style={{ margin: 0 }}>{property.name} - 详情</Title>
        </Col>
        <Col>
          <Link to={`/properties/edit/${property.id}`}>
            <Button type="primary" icon={<EditOutlined />}>
              编辑物业
            </Button>
          </Link>
        </Col>
      </Row>

      <Row gutter={[24, 24]}>
        <Col xs={24} md={8}>
          <Image
            width="100%"
            src={property.imageUrl || 'https://via.placeholder.com/300x200.png?text=No+Image'}
            alt={property.name}
            style={{ borderRadius: '8px', objectFit: 'cover', maxHeight: '300px' }}
          />
        </Col>
        <Col xs={24} md={16}>
          <Descriptions bordered column={{ xxl: 2, xl: 2, lg: 1, md: 1, sm: 1, xs: 1 }}>
            <Descriptions.Item label="物业ID">{property.id}</Descriptions.Item>
            <Descriptions.Item label="地址">{property.address}</Descriptions.Item>
            <Descriptions.Item label="类型">
              <Tag>{getTypeDisplayText(property.type)}</Tag>
            </Descriptions.Item>
            <Descriptions.Item label="状态">
              <Tag color={getStatusTagColor(property.status)}>
                {property.status === 'available' ? '可出租' : property.status === 'occupied' ? '已出租' : '维护中'}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="单元数">{property.units}</Descriptions.Item>
            <Descriptions.Item label="月租金 (总计)">{`¥${property.rentAmount.toLocaleString()}`}</Descriptions.Item>
            <Descriptions.Item label="建筑面积">{`${property.areaSqMeters.toLocaleString()} 平方米`}</Descriptions.Item>
            <Descriptions.Item label="建造日期">{new Date(property.constructionDate).toLocaleDateString()}</Descriptions.Item>
            {property.amenities && property.amenities.length > 0 && (
              <Descriptions.Item label="设施" span={2}>
                {property.amenities.map(amenity => <Tag key={amenity} color="blue">{amenity}</Tag>)}
              </Descriptions.Item>
            )}
            {property.ownerId && (
              <Descriptions.Item label="业主ID">{property.ownerId}</Descriptions.Item>
            )}
            {property.currentTenantId && (
              <Descriptions.Item label="当前租户ID">{property.currentTenantId}</Descriptions.Item>
            )}
            {property.leaseEndDate && (
              <Descriptions.Item label="租约到期日">{new Date(property.leaseEndDate).toLocaleDateString()}</Descriptions.Item>
            )}
          </Descriptions>
        </Col>
      </Row>
    </Card>
  );
};

export default PropertyDetailPage;