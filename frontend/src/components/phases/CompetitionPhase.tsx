/**
 * 物业管理模拟器 - 竞争阶段组件
 * 实现拍卖系统、排行榜、社交竞争等竞争阶段核心功能
 */

import React, { useState, useEffect, useCallback } from 'react';
import { 
  Card, 
  Button, 
  Table, 
  Modal, 
  Form, 
  Input, 
  Select, 
  InputNumber, 
  List, 
  Tag, 
  Tooltip, 
  Space, 
  Row, 
  Col, 
  Statistic, 
  Alert, 
  Progress,
  Tabs,
  Badge,
  Avatar,
  Timeline,
  Rate,
  Divider,
  Steps,
  CountDown
} from 'antd';
import { 
  TrophyOutlined, 
  CrownOutlined, 
  DollarOutlined,
  FireOutlined,
  ThunderboltOutlined,
  StarOutlined,
  TeamOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  RiseOutlined,
  FallOutlined,
  EyeOutlined,
  HeartOutlined,
  MessageOutlined,
  GiftOutlined
} from '@ant-design/icons';
import { 
  AuctionItem, 
  Bid, 
  Leaderboard,
  GameCycleState 
} from '../../types/game-redesign';
import { GameCycleManager } from '../../utils/game-cycle-manager';

const { TabPane } = Tabs;
const { Option } = Select;
const { Step } = Steps;

// ==================== 接口定义 ====================

interface CompetitionPhaseProps {
  gameCycleManager: GameCycleManager;
  onPhaseComplete: () => void;
}

interface AuctionSystemProps {
  auctions: AuctionItem[];
  onPlaceBid: (auctionId: string, bidAmount: number) => void;
  playerFunds: number;
}

interface LeaderboardProps {
  leaderboards: Leaderboard[];
  currentPlayer: any;
}

interface SocialHubProps {
  players: any[];
  onSendMessage: (playerId: string, message: string) => void;
  onSendGift: (playerId: string, giftType: string) => void;
}

// ==================== 模拟数据 ====================

const MOCK_AUCTIONS: AuctionItem[] = [
  {
    id: 'auction_001',
    title: '市中心黄金地段',
    description: '位于市中心的优质商业地段，适合建设高端商业综合体',
    type: 'land',
    starting_price: 500000,
    current_price: 650000,
    buyout_price: 1000000,
    end_time: new Date(Date.now() + 2 * 60 * 60 * 1000), // 2小时后结束
    seller_id: 'system',
    bids: [
      {
        id: 'bid_001',
        bidder_id: 'player_002',
        bidder_name: '张三',
        amount: 650000,
        timestamp: new Date(Date.now() - 30 * 60 * 1000)
      },
      {
        id: 'bid_002',
        bidder_id: 'player_003',
        bidder_name: '李四',
        amount: 600000,
        timestamp: new Date(Date.now() - 60 * 60 * 1000)
      }
    ],
    minimum_increment: 10000,
    status: 'active'
  },
  {
    id: 'auction_002',
    title: '豪华装修材料包',
    description: '包含高端装修材料和稀有装饰品的豪华套装',
    type: 'materials',
    starting_price: 50000,
    current_price: 75000,
    buyout_price: 120000,
    end_time: new Date(Date.now() + 4 * 60 * 60 * 1000), // 4小时后结束
    seller_id: 'player_005',
    bids: [
      {
        id: 'bid_003',
        bidder_id: 'player_001',
        bidder_name: '王五',
        amount: 75000,
        timestamp: new Date(Date.now() - 15 * 60 * 1000)
      }
    ],
    minimum_increment: 5000,
    status: 'active'
  },
  {
    id: 'auction_003',
    title: '传奇建筑师设计图',
    description: '由传奇建筑师亲自设计的独特建筑图纸，可解锁特殊建筑',
    type: 'blueprint',
    starting_price: 200000,
    current_price: 350000,
    buyout_price: 500000,
    end_time: new Date(Date.now() + 1 * 60 * 60 * 1000), // 1小时后结束
    seller_id: 'player_007',
    bids: [
      {
        id: 'bid_004',
        bidder_id: 'player_004',
        bidder_name: '赵六',
        amount: 350000,
        timestamp: new Date(Date.now() - 10 * 60 * 1000)
      },
      {
        id: 'bid_005',
        bidder_id: 'player_006',
        bidder_name: '孙七',
        amount: 320000,
        timestamp: new Date(Date.now() - 25 * 60 * 1000)
      }
    ],
    minimum_increment: 20000,
    status: 'active'
  }
];

const MOCK_LEADERBOARDS: Leaderboard[] = [
  {
    id: 'wealth_ranking',
    name: '财富排行榜',
    type: 'wealth',
    period: 'monthly',
    entries: [
      {
        rank: 1,
        player_id: 'player_001',
        player_name: '地产大亨',
        score: 5000000,
        change: 2,
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=1'
      },
      {
        rank: 2,
        player_id: 'player_002',
        player_name: '建筑之王',
        score: 4500000,
        change: -1,
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=2'
      },
      {
        rank: 3,
        player_id: 'player_003',
        player_name: '物业专家',
        score: 4200000,
        change: 1,
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=3'
      },
      {
        rank: 4,
        player_id: 'current_player',
        player_name: '我',
        score: 3800000,
        change: 3,
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=current'
      },
      {
        rank: 5,
        player_id: 'player_005',
        player_name: '租赁达人',
        score: 3500000,
        change: -2,
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=5'
      }
    ]
  },
  {
    id: 'satisfaction_ranking',
    name: '满意度排行榜',
    type: 'satisfaction',
    period: 'weekly',
    entries: [
      {
        rank: 1,
        player_id: 'player_003',
        player_name: '物业专家',
        score: 98,
        change: 0,
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=3'
      },
      {
        rank: 2,
        player_id: 'current_player',
        player_name: '我',
        score: 95,
        change: 1,
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=current'
      },
      {
        rank: 3,
        player_id: 'player_001',
        player_name: '地产大亨',
        score: 92,
        change: -1,
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=1'
      }
    ]
  },
  {
    id: 'efficiency_ranking',
    name: '效率排行榜',
    type: 'efficiency',
    period: 'daily',
    entries: [
      {
        rank: 1,
        player_id: 'player_002',
        player_name: '建筑之王',
        score: 156,
        change: 2,
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=2'
      },
      {
        rank: 2,
        player_id: 'current_player',
        player_name: '我',
        score: 142,
        change: 0,
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=current'
      }
    ]
  }
];

const MOCK_PLAYERS = [
  {
    id: 'player_001',
    name: '地产大亨',
    level: 25,
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=1',
    status: 'online',
    reputation: 95,
    specialization: '商业地产',
    achievements: ['百万富翁', '建筑大师', '租户之友']
  },
  {
    id: 'player_002',
    name: '建筑之王',
    level: 22,
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=2',
    status: 'online',
    reputation: 88,
    specialization: '建筑设计',
    achievements: ['速度之王', '质量保证', '创新先锋']
  },
  {
    id: 'player_003',
    name: '物业专家',
    level: 20,
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=3',
    status: 'away',
    reputation: 92,
    specialization: '物业管理',
    achievements: ['满意度之星', '服务专家', '问题解决者']
  }
];

// ==================== 拍卖系统组件 ====================

const AuctionSystem: React.FC<AuctionSystemProps> = ({ 
  auctions, 
  onPlaceBid, 
  playerFunds 
}) => {
  const [selectedAuction, setSelectedAuction] = useState<AuctionItem | null>(null);
  const [bidModalVisible, setBidModalVisible] = useState(false);
  const [bidAmount, setBidAmount] = useState(0);

  const getTypeColor = (type: string) => {
    const colors = {
      land: 'green',
      materials: 'blue',
      blueprint: 'purple',
      equipment: 'orange'
    };
    return colors[type] || 'default';
  };

  const getTypeName = (type: string) => {
    const names = {
      land: '土地',
      materials: '材料',
      blueprint: '图纸',
      equipment: '装备'
    };
    return names[type] || type;
  };

  const getTimeRemaining = (endTime: Date) => {
    const now = new Date();
    const diff = endTime.getTime() - now.getTime();
    
    if (diff <= 0) return '已结束';
    
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    return `${hours}小时${minutes}分钟`;
  };

  const handleBidClick = (auction: AuctionItem) => {
    setSelectedAuction(auction);
    setBidAmount(auction.current_price + auction.minimum_increment);
    setBidModalVisible(true);
  };

  const handlePlaceBid = () => {
    if (selectedAuction && bidAmount > selectedAuction.current_price && bidAmount <= playerFunds) {
      onPlaceBid(selectedAuction.id, bidAmount);
      setBidModalVisible(false);
    }
  };

  const handleBuyout = (auction: AuctionItem) => {
    if (auction.buyout_price && auction.buyout_price <= playerFunds) {
      onPlaceBid(auction.id, auction.buyout_price);
    }
  };

  return (
    <Card title="拍卖大厅" extra={<DollarOutlined />}>
      <Row gutter={[16, 16]}>
        {auctions.map(auction => (
          <Col xs={24} sm={12} lg={8} key={auction.id}>
            <Card
              size="small"
              hoverable
              cover={
                <div style={{ padding: '20px', textAlign: 'center', backgroundColor: '#f5f5f5' }}>
                  <div style={{ fontSize: '32px', color: '#1890ff', marginBottom: '8px' }}>
                    {auction.type === 'land' ? <CrownOutlined /> :
                     auction.type === 'materials' ? <GiftOutlined /> :
                     auction.type === 'blueprint' ? <StarOutlined /> : <TrophyOutlined />}
                  </div>
                  <Tag color={getTypeColor(auction.type)}>
                    {getTypeName(auction.type)}
                  </Tag>
                </div>
              }
              actions={[
                <Button 
                  size="small" 
                  type="primary"
                  disabled={auction.current_price + auction.minimum_increment > playerFunds}
                  onClick={() => handleBidClick(auction)}
                >
                  出价
                </Button>,
                auction.buyout_price && (
                  <Button 
                    size="small" 
                    type="default"
                    disabled={auction.buyout_price > playerFunds}
                    onClick={() => handleBuyout(auction)}
                  >
                    一口价
                  </Button>
                )
              ]}
            >
              <Card.Meta
                title={auction.title}
                description={
                  <Space direction="vertical" size="small" style={{ width: '100%' }}>
                    <div style={{ fontSize: '12px', height: '36px', overflow: 'hidden' }}>
                      {auction.description}
                    </div>
                    
                    <Divider style={{ margin: '8px 0' }} />
                    
                    <Row gutter={8}>
                      <Col span={12}>
                        <div style={{ fontSize: '12px', color: '#666' }}>当前价格</div>
                        <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#1890ff' }}>
                          ¥{auction.current_price.toLocaleString()}
                        </div>
                      </Col>
                      <Col span={12}>
                        <div style={{ fontSize: '12px', color: '#666' }}>剩余时间</div>
                        <div style={{ fontSize: '12px', color: '#ff4d4f' }}>
                          <ClockCircleOutlined /> {getTimeRemaining(auction.end_time)}
                        </div>
                      </Col>
                    </Row>
                    
                    {auction.buyout_price && (
                      <div style={{ fontSize: '12px' }}>
                        一口价: ¥{auction.buyout_price.toLocaleString()}
                      </div>
                    )}
                    
                    <div style={{ fontSize: '12px' }}>
                      出价次数: {auction.bids.length}
                    </div>
                  </Space>
                }
              />
            </Card>
          </Col>
        ))}
      </Row>

      <Modal
        title="参与竞拍"
        open={bidModalVisible}
        onOk={handlePlaceBid}
        onCancel={() => setBidModalVisible(false)}
        okText="确认出价"
        cancelText="取消"
      >
        {selectedAuction && (
          <Space direction="vertical" style={{ width: '100%' }}>
            <Alert
              message={selectedAuction.title}
              description={selectedAuction.description}
              type="info"
              showIcon
            />
            
            <Row gutter={16}>
              <Col span={12}>
                <Statistic title="当前价格" value={selectedAuction.current_price} prefix="¥" />
              </Col>
              <Col span={12}>
                <Statistic title="最小加价" value={selectedAuction.minimum_increment} prefix="¥" />
              </Col>
            </Row>
            
            <Row gutter={16}>
              <Col span={12}>
                <Statistic title="我的资金" value={playerFunds} prefix="¥" />
              </Col>
              <Col span={12}>
                <Statistic title="剩余时间" value={getTimeRemaining(selectedAuction.end_time)} />
              </Col>
            </Row>

            <div>
              <label>出价金额:</label>
              <InputNumber
                style={{ width: '100%', marginTop: '8px' }}
                value={bidAmount}
                onChange={(value) => setBidAmount(value || 0)}
                min={selectedAuction.current_price + selectedAuction.minimum_increment}
                max={playerFunds}
                formatter={value => `¥ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                parser={value => value!.replace(/¥\s?|(,*)/g, '')}
              />
            </div>

            <Card title="竞拍历史" size="small">
              <Timeline size="small">
                {selectedAuction.bids.slice(0, 3).map(bid => (
                  <Timeline.Item key={bid.id}>
                    <div>
                      <strong>{bid.bidder_name}</strong> 出价 ¥{bid.amount.toLocaleString()}
                    </div>
                    <div style={{ fontSize: '12px', color: '#666' }}>
                      {bid.timestamp.toLocaleString()}
                    </div>
                  </Timeline.Item>
                ))}
              </Timeline>
            </Card>
          </Space>
        )}
      </Modal>
    </Card>
  );
};

// ==================== 排行榜组件 ====================

const LeaderboardComponent: React.FC<LeaderboardProps> = ({ 
  leaderboards, 
  currentPlayer 
}) => {
  const getRankIcon = (rank: number) => {
    if (rank === 1) return <CrownOutlined style={{ color: '#ffd700' }} />;
    if (rank === 2) return <TrophyOutlined style={{ color: '#c0c0c0' }} />;
    if (rank === 3) return <TrophyOutlined style={{ color: '#cd7f32' }} />;
    return <span style={{ fontWeight: 'bold' }}>{rank}</span>;
  };

  const getChangeIcon = (change: number) => {
    if (change > 0) return <RiseOutlined style={{ color: '#52c41a' }} />;
    if (change < 0) return <FallOutlined style={{ color: '#ff4d4f' }} />;
    return <span style={{ color: '#d9d9d9' }}>-</span>;
  };

  const getScoreDisplay = (type: string, score: number) => {
    switch (type) {
      case 'wealth':
        return `¥${score.toLocaleString()}`;
      case 'satisfaction':
        return `${score}%`;
      case 'efficiency':
        return `${score}点`;
      default:
        return score.toString();
    }
  };

  return (
    <Card title="排行榜" extra={<TrophyOutlined />}>
      <Tabs>
        {leaderboards.map(leaderboard => (
          <TabPane tab={leaderboard.name} key={leaderboard.id}>
            <div style={{ marginBottom: '16px', textAlign: 'center' }}>
              <Tag color="blue">{leaderboard.period === 'daily' ? '日榜' : leaderboard.period === 'weekly' ? '周榜' : '月榜'}</Tag>
            </div>
            
            <List
              dataSource={leaderboard.entries}
              renderItem={entry => (
                <List.Item
                  style={{
                    backgroundColor: entry.player_id === 'current_player' ? '#f6ffed' : 'transparent',
                    border: entry.player_id === 'current_player' ? '1px solid #b7eb8f' : 'none',
                    borderRadius: '6px',
                    padding: '12px 16px',
                    marginBottom: '8px'
                  }}
                >
                  <List.Item.Meta
                    avatar={
                      <Space>
                        <div style={{ fontSize: '20px', minWidth: '30px', textAlign: 'center' }}>
                          {getRankIcon(entry.rank)}
                        </div>
                        <Avatar src={entry.avatar} size={40} />
                      </Space>
                    }
                    title={
                      <Space>
                        <span style={{ fontWeight: entry.player_id === 'current_player' ? 'bold' : 'normal' }}>
                          {entry.player_name}
                        </span>
                        {entry.player_id === 'current_player' && (
                          <Tag color="green">我</Tag>
                        )}
                      </Space>
                    }
                    description={
                      <Space>
                        <span style={{ fontSize: '16px', fontWeight: 'bold' }}>
                          {getScoreDisplay(leaderboard.type, entry.score)}
                        </span>
                        <span style={{ fontSize: '12px' }}>
                          {getChangeIcon(entry.change)}
                          {Math.abs(entry.change)}
                        </span>
                      </Space>
                    }
                  />
                  <div>
                    {entry.rank <= 3 && (
                      <Badge 
                        count={entry.rank === 1 ? '冠军' : entry.rank === 2 ? '亚军' : '季军'} 
                        style={{ 
                          backgroundColor: entry.rank === 1 ? '#ffd700' : 
                                         entry.rank === 2 ? '#c0c0c0' : '#cd7f32' 
                        }} 
                      />
                    )}
                  </div>
                </List.Item>
              )}
            />
          </TabPane>
        ))}
      </Tabs>
    </Card>
  );
};

// ==================== 社交中心组件 ====================

const SocialHub: React.FC<SocialHubProps> = ({ 
  players, 
  onSendMessage, 
  onSendGift 
}) => {
  const [messageModalVisible, setMessageModalVisible] = useState(false);
  const [giftModalVisible, setGiftModalVisible] = useState(false);
  const [selectedPlayer, setSelectedPlayer] = useState<any>(null);
  const [messageText, setMessageText] = useState('');
  const [selectedGift, setSelectedGift] = useState('');

  const getStatusColor = (status: string) => {
    const colors = {
      online: '#52c41a',
      away: '#faad14',
      offline: '#d9d9d9'
    };
    return colors[status] || '#d9d9d9';
  };

  const getStatusText = (status: string) => {
    const texts = {
      online: '在线',
      away: '离开',
      offline: '离线'
    };
    return texts[status] || status;
  };

  const handleSendMessage = (player: any) => {
    setSelectedPlayer(player);
    setMessageModalVisible(true);
  };

  const handleSendGift = (player: any) => {
    setSelectedPlayer(player);
    setGiftModalVisible(true);
  };

  const confirmSendMessage = () => {
    if (selectedPlayer && messageText) {
      onSendMessage(selectedPlayer.id, messageText);
      setMessageModalVisible(false);
      setMessageText('');
    }
  };

  const confirmSendGift = () => {
    if (selectedPlayer && selectedGift) {
      onSendGift(selectedPlayer.id, selectedGift);
      setGiftModalVisible(false);
      setSelectedGift('');
    }
  };

  return (
    <Card title="社交中心" extra={<TeamOutlined />}>
      <List
        dataSource={players}
        renderItem={player => (
          <List.Item
            actions={[
              <Button 
                size="small" 
                icon={<MessageOutlined />}
                onClick={() => handleSendMessage(player)}
              >
                私信
              </Button>,
              <Button 
                size="small" 
                icon={<GiftOutlined />}
                onClick={() => handleSendGift(player)}
              >
                送礼
              </Button>,
              <Button size="small" icon={<EyeOutlined />}>
                查看
              </Button>
            ]}
          >
            <List.Item.Meta
              avatar={
                <Badge 
                  dot 
                  color={getStatusColor(player.status)}
                  offset={[-5, 35]}
                >
                  <Avatar src={player.avatar} size={50} />
                </Badge>
              }
              title={
                <Space>
                  <span style={{ fontSize: '16px', fontWeight: 'bold' }}>
                    {player.name}
                  </span>
                  <Tag color="blue">Lv.{player.level}</Tag>
                  <Tag color={getStatusColor(player.status)}>
                    {getStatusText(player.status)}
                  </Tag>
                </Space>
              }
              description={
                <Space direction="vertical" size="small" style={{ width: '100%' }}>
                  <div>
                    <HeartOutlined style={{ color: '#ff4d4f' }} /> 声誉: {player.reputation}/100
                  </div>
                  <div>
                    <StarOutlined style={{ color: '#faad14' }} /> 专长: {player.specialization}
                  </div>
                  <div>
                    <TrophyOutlined style={{ color: '#1890ff' }} /> 成就: 
                    <Space wrap style={{ marginLeft: '8px' }}>
                      {player.achievements.slice(0, 2).map((achievement: string) => (
                        <Tag key={achievement} size="small" color="gold">
                          {achievement}
                        </Tag>
                      ))}
                      {player.achievements.length > 2 && (
                        <Tag size="small">+{player.achievements.length - 2}</Tag>
                      )}
                    </Space>
                  </div>
                </Space>
              }
            />
          </List.Item>
        )}
      />

      {/* 私信模态框 */}
      <Modal
        title={`发送私信给 ${selectedPlayer?.name}`}
        open={messageModalVisible}
        onOk={confirmSendMessage}
        onCancel={() => setMessageModalVisible(false)}
        okText="发送"
        cancelText="取消"
      >
        <Input.TextArea
          placeholder="输入消息内容..."
          value={messageText}
          onChange={(e) => setMessageText(e.target.value)}
          rows={4}
          maxLength={200}
          showCount
        />
      </Modal>

      {/* 送礼模态框 */}
      <Modal
        title={`送礼给 ${selectedPlayer?.name}`}
        open={giftModalVisible}
        onOk={confirmSendGift}
        onCancel={() => setGiftModalVisible(false)}
        okText="送出"
        cancelText="取消"
      >
        <Space direction="vertical" style={{ width: '100%' }}>
          <div>选择礼物:</div>
          <Select
            style={{ width: '100%' }}
            placeholder="选择要送出的礼物"
            value={selectedGift}
            onChange={setSelectedGift}
          >
            <Option value="flowers">鲜花 (¥100)</Option>
            <Option value="coffee">咖啡 (¥50)</Option>
            <Option value="tools">工具包 (¥500)</Option>
            <Option value="materials">建材礼包 (¥1000)</Option>
          </Select>
          
          {selectedGift && (
            <Alert
              message="礼物效果"
              description={
                selectedGift === 'flowers' ? '增加友好度 +5' :
                selectedGift === 'coffee' ? '增加友好度 +3' :
                selectedGift === 'tools' ? '增加友好度 +10，可能获得回礼' :
                selectedGift === 'materials' ? '增加友好度 +15，可能获得珍贵回礼' : ''
              }
              type="info"
              showIcon
            />
          )}
        </Space>
      </Modal>
    </Card>
  );
};

// ==================== 主竞争阶段组件 ====================

const CompetitionPhase: React.FC<CompetitionPhaseProps> = ({ 
  gameCycleManager, 
  onPhaseComplete 
}) => {
  const [auctions, setAuctions] = useState<AuctionItem[]>(MOCK_AUCTIONS);
  const [leaderboards, setLeaderboards] = useState<Leaderboard[]>(MOCK_LEADERBOARDS);
  const [players, setPlayers] = useState(MOCK_PLAYERS);
  const [playerFunds, setPlayerFunds] = useState(2000000);
  const [phaseStats, setPhaseStats] = useState(gameCycleManager.getPhaseStats());
  const [competitionScore, setCompetitionScore] = useState(3800000);
  const [currentRank, setCurrentRank] = useState(4);

  // 更新阶段统计
  useEffect(() => {
    const interval = setInterval(() => {
      setPhaseStats(gameCycleManager.getPhaseStats());
    }, 1000);

    return () => clearInterval(interval);
  }, [gameCycleManager]);

  // 检查阶段完成条件
  useEffect(() => {
    if (gameCycleManager.checkPhaseCompletion()) {
      onPhaseComplete();
    }
  }, [phaseStats, gameCycleManager, onPhaseComplete]);

  const handlePlaceBid = useCallback((auctionId: string, bidAmount: number) => {
    setAuctions(prev => 
      prev.map(auction => {
        if (auction.id === auctionId) {
          const newBid: Bid = {
            id: `bid_${Date.now()}`,
            bidder_id: 'current_player',
            bidder_name: '我',
            amount: bidAmount,
            timestamp: new Date()
          };
          
          return {
            ...auction,
            current_price: bidAmount,
            bids: [newBid, ...auction.bids]
          };
        }
        return auction;
      })
    );
    
    setPlayerFunds(prev => prev - bidAmount);
    setCompetitionScore(prev => prev + bidAmount * 0.1); // 竞拍增加竞争分数
  }, []);

  const handleSendMessage = useCallback((playerId: string, message: string) => {
    console.log(`发送消息给 ${playerId}: ${message}`);
    // 实现消息发送逻辑
  }, []);

  const handleSendGift = useCallback((playerId: string, giftType: string) => {
    console.log(`送礼给 ${playerId}: ${giftType}`);
    // 实现送礼逻辑
    const giftCosts = {
      flowers: 100,
      coffee: 50,
      tools: 500,
      materials: 1000
    };
    
    const cost = giftCosts[giftType as keyof typeof giftCosts] || 0;
    setPlayerFunds(prev => prev - cost);
  }, []);

  const auctionsWon = auctions.filter(a => 
    a.bids.length > 0 && a.bids[0].bidder_id === 'current_player'
  ).length;

  return (
    <div style={{ padding: '24px' }}>
      {/* 阶段头部信息 */}
      <Card style={{ marginBottom: '24px' }}>
        <Row gutter={24}>
          <Col span={6}>
            <Statistic 
              title="当前阶段" 
              value="竞争阶段" 
              prefix={<TrophyOutlined />}
            />
          </Col>
          <Col span={6}>
            <Statistic 
              title="竞争分数" 
              value={competitionScore} 
              prefix={<FireOutlined />}
            />
          </Col>
          <Col span={6}>
            <Statistic 
              title="当前排名" 
              value={`#${currentRank}`} 
              prefix={<CrownOutlined />}
            />
          </Col>
          <Col span={6}>
            <Statistic 
              title="可用资金" 
              value={playerFunds} 
              prefix="¥"
            />
          </Col>
        </Row>
        
        <div style={{ marginTop: '16px' }}>
          <Progress 
            percent={phaseStats.progress} 
            status="active"
            strokeColor={{
              '0%': '#108ee9',
              '100%': '#87d068',
            }}
          />
        </div>
      </Card>

      {/* 阶段目标 */}
      <Card title="竞争目标" style={{ marginBottom: '24px' }}>
        <List
          size="small"
          dataSource={[
            { text: '参与至少3次拍卖竞价', completed: auctions.filter(a => a.bids.some(b => b.bidder_id === 'current_player')).length >= 3 },
            { text: '赢得至少1次拍卖', completed: auctionsWon >= 1 },
            { text: '在任一排行榜进入前3名', completed: leaderboards.some(l => l.entries.find(e => e.player_id === 'current_player')?.rank <= 3) },
            { text: '与其他玩家互动5次', completed: true }
          ]}
          renderItem={item => (
            <List.Item>
              <Space>
                {item.completed ? (
                  <CheckCircleOutlined style={{ color: '#52c41a' }} />
                ) : (
                  <ExclamationCircleOutlined style={{ color: '#faad14' }} />
                )}
                <span style={{ textDecoration: item.completed ? 'line-through' : 'none' }}>
                  {item.text}
                </span>
              </Space>
            </List.Item>
          )}
        />
      </Card>

      {/* 主要功能区域 */}
      <Tabs defaultActiveKey="auctions">
        <TabPane tab="拍卖大厅" key="auctions">
          <AuctionSystem
            auctions={auctions}
            onPlaceBid={handlePlaceBid}
            playerFunds={playerFunds}
          />
        </TabPane>
        
        <TabPane tab="排行榜" key="leaderboards">
          <LeaderboardComponent
            leaderboards={leaderboards}
            currentPlayer={{ id: 'current_player' }}
          />
        </TabPane>
        
        <TabPane tab="社交中心" key="social">
          <SocialHub
            players={players}
            onSendMessage={handleSendMessage}
            onSendGift={handleSendGift}
          />
        </TabPane>
      </Tabs>

      {/* 阶段完成按钮 */}
      <div style={{ textAlign: 'center', marginTop: '24px' }}>
        <Button 
          type="primary" 
          size="large"
          disabled={!gameCycleManager.checkPhaseCompletion()}
          onClick={onPhaseComplete}
        >
          完成竞争阶段
        </Button>
      </div>
    </div>
  );
};

export default CompetitionPhase;