/**
 * 物业管理模拟器 - 游戏重设计类型定义
 * 支持建设-经营-探险-竞争-扩张五大核心循环
 */

// ==================== 核心游戏循环类型 ====================

/** 游戏阶段枚举 */
export type GamePhase = 'building' | 'management' | 'exploration' | 'competition' | 'expansion';

/** 游戏循环状态 */
export interface GameCycleState {
  currentPhase: GamePhase;
  phaseProgress: number; // 0-100
  cycleNumber: number;
  phaseStartTime: Date;
  phaseTimeLimit?: number; // 分钟
  availableActions: string[];
  completedObjectives: string[];
  activeObjectives: string[];
}

// ==================== 建设阶段类型 ====================

/** 建筑类型 */
export type BuildingType = 
  | 'apartment' | 'villa' | 'student_dorm' | 'elderly_home' // 住宅
  | 'shop' | 'office' | 'warehouse' | 'parking' // 商业
  | 'gym' | 'pool' | 'garden' | 'security' // 配套
  | 'elevator' | 'heating' | 'network' | 'parking_space'; // 基础设施

/** 建筑配置 */
export interface BuildingConfig {
  id: string;
  name: string;
  type: BuildingType;
  category: 'residential' | 'commercial' | 'amenity' | 'infrastructure';
  cost: number;
  constructionTime: number; // 小时
  maintenanceCost: number; // 每月
  capacity: number;
  requirements: {
    land_size: number;
    utilities: string[];
    permits: string[];
  };
  effects: {
    tenant_attraction: number;
    property_value: number;
    operating_cost: number;
    satisfaction_bonus: number;
  };
  unlockConditions?: {
    player_level: number;
    completed_buildings: string[];
    reputation_required: number;
  };
}

/** 建设项目 */
export interface ConstructionProject {
  id: string;
  buildingConfig: BuildingConfig;
  status: 'planned' | 'in_progress' | 'completed' | 'paused';
  progress: number; // 0-100
  startDate: Date;
  estimatedCompletion: Date;
  actualCost: number;
  qualityRating: number; // 1-100
  complications: string[];
  workers: WorkerTeam[];
}

/** 工人团队 */
export interface WorkerTeam {
  id: string;
  name: string;
  specialization: string;
  efficiency: number; // 1-100
  cost_per_hour: number;
  availability: boolean;
  reputation: number;
}

// ==================== 经营阶段类型 ====================

/** 租户类型分类 */
export type TenantCategory = 'student' | 'professional' | 'family' | 'enterprise' | 'elderly';

/** 租户偏好 */
export interface TenantPreferences {
  noise_tolerance: number; // 1-100
  security_requirement: number; // 1-100
  convenience_need: number; // 1-100
  price_sensitivity: number; // 1-100
  social_activity: number; // 1-100
}

/** 租户详细信息 */
export interface DetailedTenant {
  id: string;
  name: string;
  category: TenantCategory;
  preferences: TenantPreferences;
  income_range: [number, number];
  lease_duration_preference: number; // 月
  current_satisfaction: number; // 1-100
  payment_reliability: number; // 1-100
  social_impact: {
    noise_generation: number;
    security_contribution: number;
    community_activity: number;
  };
  relationships: Record<string, number>; // 与其他租户的关系
  complaints: Complaint[];
  lease_history: LeaseRecord[];
}

/** 投诉记录 */
export interface Complaint {
  id: string;
  tenant_id: string;
  type: 'noise' | 'maintenance' | 'security' | 'service' | 'neighbor';
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  date: Date;
  status: 'open' | 'investigating' | 'resolved' | 'closed';
  resolution?: string;
  satisfaction_impact: number;
}

/** 租约记录 */
export interface LeaseRecord {
  id: string;
  tenant_id: string;
  unit_id: string;
  start_date: Date;
  end_date: Date;
  monthly_rent: number;
  deposit: number;
  terms: string[];
  renewal_count: number;
  early_termination?: {
    date: Date;
    reason: string;
    penalty: number;
  };
}

/** 动态定价系统 */
export interface DynamicPricing {
  base_rent: number;
  market_factors: {
    location_premium: number;
    facility_bonus: number;
    service_premium: number;
    competition_adjustment: number;
  };
  tenant_factors: {
    loyalty_discount: number;
    long_term_discount: number;
    referral_bonus: number;
  };
  seasonal_adjustment: number;
  final_price: number;
  price_history: PriceHistoryEntry[];
}

/** 价格历史记录 */
export interface PriceHistoryEntry {
  date: Date;
  price: number;
  reason: string;
  market_conditions: string;
}

/** 供应商 */
export interface Supplier {
  id: string;
  name: string;
  type: 'utility' | 'maintenance' | 'security' | 'cleaning' | 'materials';
  service_quality: number; // 1-100
  price_level: number; // 1-100
  reliability: number; // 1-100
  contract_terms: {
    minimum_duration: number; // 月
    payment_terms: string;
    penalty_clauses: string[];
  };
  reputation: number;
  current_contract?: SupplierContract;
}

/** 供应商合同 */
export interface SupplierContract {
  id: string;
  supplier_id: string;
  start_date: Date;
  end_date: Date;
  monthly_cost: number;
  service_level: string;
  performance_metrics: {
    quality_score: number;
    timeliness_score: number;
    cost_efficiency: number;
  };
  renewal_options: string[];
}

// ==================== 探险阶段类型 ====================

/** 装备类型 */
export type EquipmentType = 'survey_tool' | 'negotiation_aid' | 'analysis_software' | 'transport';

/** 装备稀有度 */
export type EquipmentRarity = 'common' | 'rare' | 'epic' | 'legendary';

/** 装备 */
export interface Equipment {
  id: string;
  name: string;
  type: EquipmentType;
  rarity: EquipmentRarity;
  effects: {
    success_rate_bonus: number;
    reward_multiplier: number;
    risk_reduction: number;
    cost_reduction: number;
  };
  durability: number; // 当前耐久度
  max_durability: number;
  maintenance_cost: number;
  acquisition_date: Date;
  upgrade_level: number;
}

/** 技能树分支 */
export interface SkillTree {
  building_branch: {
    construction_efficiency: number;
    material_cost_reduction: number;
    quality_improvement: number;
    innovation_unlock: string[];
  };
  business_branch: {
    negotiation_skill: number;
    market_analysis: number;
    financial_management: number;
    relationship_building: number;
  };
  exploration_branch: {
    risk_assessment: number;
    resource_discovery: number;
    team_leadership: number;
    crisis_management: number;
  };
}

/** 探险任务 */
export interface ExplorationMission {
  id: string;
  name: string;
  type: 'market_research' | 'resource_hunt' | 'talent_scout' | 'investment_opportunity';
  difficulty: number; // 1-10
  duration: number; // 小时
  requirements: {
    min_skill_level: number;
    required_equipment: string[];
    team_size: number;
    investment_cost: number;
  };
  risks: {
    failure_probability: number;
    potential_losses: number;
    reputation_risk: number;
  };
  rewards: {
    base_reward: number;
    bonus_rewards: string[];
    experience_gain: number;
    reputation_gain: number;
  };
  status: 'available' | 'in_progress' | 'completed' | 'failed';
  start_time?: Date;
  completion_time?: Date;
  result?: ExplorationResult;
}

/** 探险结果 */
export interface ExplorationResult {
  success: boolean;
  rewards_earned: {
    money: number;
    experience: number;
    items: string[];
    reputation: number;
  };
  discoveries: {
    new_locations: string[];
    market_insights: string[];
    business_opportunities: string[];
  };
  consequences: {
    relationship_changes: Record<string, number>;
    market_impacts: string[];
    future_opportunities: string[];
  };
}

// ==================== 竞争阶段类型 ====================

/** 拍卖物品类型 */
export type AuctionItemType = 'land' | 'material' | 'equipment' | 'tenant_contract' | 'service_contract';

/** 拍卖物品 */
export interface AuctionItem {
  id: string;
  name: string;
  type: AuctionItemType;
  rarity: EquipmentRarity;
  starting_price: number;
  current_bid: number;
  bidder_count: number;
  time_remaining: number; // 秒
  special_properties: {
    location_bonus?: number;
    quality_grade?: string;
    exclusive_rights?: boolean;
    future_potential?: number;
  };
  bidding_history: BidRecord[];
  seller_id: string;
  description: string;
}

/** 出价记录 */
export interface BidRecord {
  bidder_id: string;
  amount: number;
  timestamp: Date;
  auto_bid: boolean;
}

/** 出价策略 */
export interface BiddingStrategy {
  max_budget: number;
  bidding_style: 'conservative' | 'aggressive' | 'strategic';
  auto_bid_enabled: boolean;
  snipe_timing: number; // 秒
  competitor_analysis: {
    known_competitors: string[];
    their_typical_budgets: number[];
    their_bidding_patterns: string[];
  };
}

/** 排行榜类型 */
export interface Leaderboard {
  wealth_ranking: {
    player_id: string;
    total_assets: number;
    monthly_income: number;
    growth_rate: number;
  }[];
  satisfaction_ranking: {
    player_id: string;
    average_satisfaction: number;
    tenant_retention_rate: number;
    service_quality_score: number;
  }[];
  exploration_ranking: {
    player_id: string;
    successful_missions: number;
    rare_discoveries: number;
    exploration_efficiency: number;
  }[];
  innovation_ranking: {
    player_id: string;
    unique_buildings: number;
    technology_adoption: number;
    market_influence: number;
  }[];
}

// ==================== 扩张阶段类型 ====================

/** 区域信息 */
export interface GameRegion {
  id: string;
  name: string;
  type: 'urban' | 'suburban' | 'commercial' | 'industrial';
  unlock_cost: number;
  unlock_requirements: {
    player_level: number;
    reputation_required: number;
    completed_regions: string[];
  };
  market_conditions: {
    demand_level: number;
    competition_level: number;
    average_rent: number;
    growth_potential: number;
  };
  available_land: LandPlot[];
  local_regulations: string[];
  special_bonuses: string[];
}

/** 地块信息 */
export interface LandPlot {
  id: string;
  region_id: string;
  size: number; // 平方米
  price: number;
  zoning: 'residential' | 'commercial' | 'mixed' | 'industrial';
  utilities_available: string[];
  development_restrictions: string[];
  location_bonus: number;
  environmental_factors: string[];
}

// ==================== 成就系统类型 ====================

/** 成就类别 */
export type AchievementCategory = 'building' | 'business' | 'exploration' | 'social' | 'special';

/** 成就稀有度 */
export type AchievementRarity = 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond';

/** 成就 */
export interface Achievement {
  id: string;
  name: string;
  description: string;
  category: AchievementCategory;
  rarity: AchievementRarity;
  requirements: {
    conditions: string[];
    progress_tracking: boolean;
    time_limited: boolean;
  };
  rewards: {
    title: string;
    bonus_effects: string[];
    exclusive_unlocks: string[];
  };
  unlock_date?: Date;
  progress?: number; // 0-100
}

// ==================== 故事模式类型 ====================

/** 主线剧情 */
export interface MainStoryline {
  chapters: {
    id: string;
    title: string;
    description: string;
    objectives: string[];
    unlock_conditions: string[];
    completion_rewards: string[];
    estimated_duration: number;
  }[];
  character_development: {
    background_story: string;
    personality_traits: string[];
    growth_milestones: string[];
    relationship_arcs: string[];
  };
  world_building: {
    city_lore: string;
    economic_background: string;
    political_context: string;
    cultural_elements: string[];
  };
}

/** 支线任务 */
export interface SideQuest {
  id: string;
  title: string;
  npc_character: {
    name: string;
    background: string;
    personality: string;
    relationship_level: number;
  };
  quest_type: 'tenant_story' | 'business_opportunity' | 'community_event' | 'personal_growth';
  narrative_elements: {
    introduction: string;
    development: string[];
    climax: string;
    resolution: string;
  };
  choices_and_consequences: {
    decision_points: string[];
    outcomes: string[];
    long_term_effects: string[];
  };
}

// ==================== 随机事件类型 ====================

/** 随机事件 */
export interface RandomEvent {
  id: string;
  name: string;
  type: 'market_fluctuation' | 'policy_change' | 'natural_disaster' | 'social_trend' | 'technology_breakthrough';
  probability: number;
  trigger_conditions: string[];
  duration: number; // 小时
  effects: {
    immediate_impact: {
      financial: number;
      reputation: number;
      tenant_satisfaction: number;
      operational_efficiency: number;
    };
    long_term_consequences: {
      market_changes: string[];
      new_opportunities: string[];
      ongoing_challenges: string[];
    };
  };
  player_responses: {
    available_actions: string[];
    action_costs: number[];
    action_outcomes: string[];
  };
}

// ==================== 个性化系统类型 ====================

/** 物业风格 */
export interface PropertyStyle {
  architectural_style: 'modern' | 'classical' | 'industrial' | 'eco_friendly' | 'luxury';
  color_scheme: {
    primary_color: string;
    secondary_color: string;
    accent_color: string;
  };
  material_choices: {
    exterior: string[];
    interior: string[];
    landscaping: string[];
  };
  amenity_focus: {
    comfort_level: number;
    technology_integration: number;
    sustainability_rating: number;
    aesthetic_appeal: number;
  };
  target_demographic: string[];
}

/** 管理策略 */
export interface ManagementStrategy {
  approach: 'gentle' | 'aggressive' | 'balanced';
  philosophy: {
    tenant_relationship: 'partnership' | 'business_only' | 'community_focused';
    pricing_strategy: 'competitive' | 'premium' | 'value_based';
    investment_style: 'conservative' | 'moderate' | 'high_risk';
    growth_pace: 'steady' | 'rapid' | 'opportunistic';
  };
  decision_making_style: {
    risk_tolerance: number;
    innovation_openness: number;
    stakeholder_consideration: number;
    long_term_focus: number;
  };
}

// ==================== 市场状态类型 ====================

/** 市场状态 */
export interface MarketState {
  overall_demand: number;
  price_trends: {
    residential: number;
    commercial: number;
    luxury: number;
  };
  competition_level: number;
  economic_indicators: {
    interest_rates: number;
    unemployment_rate: number;
    inflation_rate: number;
    gdp_growth: number;
  };
  seasonal_factors: {
    current_season: string;
    demand_modifier: number;
    cost_modifier: number;
  };
}

// ==================== 扩展的玩家档案 ====================

/** 扩展玩家档案 */
export interface ExtendedPlayerProfile {
  id: string;
  username: string;
  level: number;
  experience: number;
  reputation: number;
  total_wealth: number;
  management_style: ManagementStrategy;
  specialization: string[];
  achievements_unlocked: string[];
  titles: string[];
  join_date: Date;
  last_active: Date;
  skill_tree: SkillTree;
  equipment_inventory: Equipment[];
  active_missions: string[];
  completed_missions: string[];
  auction_history: BidRecord[];
  properties_owned: string[];
  regions_unlocked: string[];
  story_progress: {
    main_story_chapter: number;
    completed_side_quests: string[];
    active_side_quests: string[];
  };
  statistics: {
    total_play_time: number;
    buildings_constructed: number;
    tenants_managed: number;
    successful_negotiations: number;
    exploration_missions_completed: number;
    auctions_won: number;
    achievements_earned: number;
  };
}

// ==================== 游戏状态整合 ====================

/** 完整游戏状态 */
export interface CompleteGameState {
  player: ExtendedPlayerProfile;
  game_cycle: GameCycleState;
  properties: (Property & { style: PropertyStyle })[];
  tenants: DetailedTenant[];
  suppliers: Supplier[];
  equipment: Equipment[];
  achievements: Achievement[];
  market_conditions: MarketState;
  active_missions: ExplorationMission[];
  auction_items: AuctionItem[];
  story_progress: MainStoryline;
  active_side_quests: SideQuest[];
  random_events: RandomEvent[];
  available_regions: GameRegion[];
  leaderboards: Leaderboard;
  game_settings: {
    difficulty: number;
    auto_save_enabled: boolean;
    notifications_enabled: boolean;
    sound_enabled: boolean;
    music_enabled: boolean;
  };
}