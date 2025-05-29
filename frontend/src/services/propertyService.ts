import { Property } from '../types/property';

const mockProperties: Property[] = [
  {
    id: 'prop1',
    name: '温馨家园小区 A栋',
    address: '幸福路123号 A栋',
    type: 'residential',
    units: 50,
    status: 'occupied',
    rentAmount: 150000, // Monthly total for example
    imageUrl: 'https://via.placeholder.com/300x200.png?text=温馨家园+A栋',
    constructionDate: '2010-05-15T00:00:00.000Z',
    areaSqMeters: 5000,
    amenities: ['游泳池', '健身房', '儿童乐园'],
    ownerId: 'owner123',
  },
  {
    id: 'prop2',
    name: '未来科技园 B座',
    address: '创新大道456号 B座',
    type: 'commercial',
    units: 20,
    status: 'available',
    rentAmount: 300000,
    imageUrl: 'https://via.placeholder.com/300x200.png?text=未来科技园+B座',
    constructionDate: '2018-10-20T00:00:00.000Z',
    areaSqMeters: 10000,
    amenities: ['高速网络', '会议室', '咖啡厅'],
  },
  {
    id: 'prop3',
    name: '城市物流中心',
    address: '物流港路789号',
    type: 'industrial',
    units: 5,
    status: 'under_maintenance',
    rentAmount: 500000,
    imageUrl: 'https://via.placeholder.com/300x200.png?text=城市物流中心',
    constructionDate: '2005-03-01T00:00:00.000Z',
    areaSqMeters: 25000,
    amenities: ['卸货平台', '大型停车场'],
  },
  {
    id: 'prop4',
    name: '阳光公寓',
    address: '光明街1号',
    type: 'residential',
    units: 120,
    status: 'occupied',
    rentAmount: 280000,
    imageUrl: 'https://via.placeholder.com/300x200.png?text=阳光公寓',
    constructionDate: '2015-08-10T00:00:00.000Z',
    areaSqMeters: 12000,
    amenities: ['花园', '24小时安保'],
  },
  {
    id: 'prop5',
    name: '创意SOHO办公空间',
    address: '艺术西路22号',
    type: 'commercial',
    units: 30,
    status: 'available',
    rentAmount: 180000,
    imageUrl: 'https://via.placeholder.com/300x200.png?text=创意SOHO',
    constructionDate: '2020-01-25T00:00:00.000Z',
    areaSqMeters: 6000,
    amenities: ['共享办公区', '活动空间'],
  },
];

export const propertyService = {
  getProperties: async (): Promise<Property[]> => {
    // Simulate API call delay
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(mockProperties);
      }, 500);
    });
  },

  getPropertyById: async (id: string): Promise<Property | undefined> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(mockProperties.find(p => p.id === id));
      }, 300);
    });
  }
};