/**
 * 物业管理模拟器 - 游戏循环管理器
 * 管理建设-经营-探险-竞争-扩张五大核心循环的状态转换和逻辑
 */

import { 
  GamePhase, 
  GameCycleState, 
  CompleteGameState,
  ExtendedPlayerProfile,
  BuildingConfig,
  ConstructionProject,
  ExplorationMission,
  AuctionItem,
  GameRegion
} from '../types/game-redesign';

// ==================== 游戏循环管理器 ====================

export class GameCycleManager {
  private gameState: CompleteGameState;
  private phaseCallbacks: Map<GamePhase, (() => void)[]> = new Map();
  private phaseTimer: NodeJS.Timeout | null = null;

  constructor(initialState: CompleteGameState) {
    this.gameState = initialState;
    this.initializePhaseCallbacks();
  }

  /**
   * 初始化阶段回调
   */
  private initializePhaseCallbacks(): void {
    this.phaseCallbacks.set('building', []);
    this.phaseCallbacks.set('management', []);
    this.phaseCallbacks.set('exploration', []);
    this.phaseCallbacks.set('competition', []);
    this.phaseCallbacks.set('expansion', []);
  }

  /**
   * 获取当前游戏状态
   */
  public getGameState(): CompleteGameState {
    return { ...this.gameState };
  }

  /**
   * 更新游戏状态
   */
  public updateGameState(updates: Partial<CompleteGameState>): void {
    this.gameState = { ...this.gameState, ...updates };
  }

  /**
   * 获取当前阶段
   */
  public getCurrentPhase(): GamePhase {
    return this.gameState.game_cycle.currentPhase;
  }

  /**
   * 切换到下一个阶段
   */
  public advanceToNextPhase(): void {
    const currentPhase = this.gameState.game_cycle.currentPhase;
    const nextPhase = this.getNextPhase(currentPhase);
    
    this.transitionToPhase(nextPhase);
  }

  /**
   * 强制切换到指定阶段
   */
  public transitionToPhase(targetPhase: GamePhase): void {
    const previousPhase = this.gameState.game_cycle.currentPhase;
    
    // 执行阶段退出逻辑
    this.onPhaseExit(previousPhase);
    
    // 更新游戏循环状态
    this.gameState.game_cycle = {
      ...this.gameState.game_cycle,
      currentPhase: targetPhase,
      phaseProgress: 0,
      phaseStartTime: new Date(),
      availableActions: this.getPhaseActions(targetPhase),
      activeObjectives: this.getPhaseObjectives(targetPhase)
    };
    
    // 如果完成了一个完整循环，增加循环计数
    if (previousPhase === 'expansion' && targetPhase === 'building') {
      this.gameState.game_cycle.cycleNumber += 1;
    }
    
    // 执行阶段进入逻辑
    this.onPhaseEnter(targetPhase);
    
    // 触发阶段回调
    this.triggerPhaseCallbacks(targetPhase);
    
    console.log(`游戏阶段切换: ${previousPhase} → ${targetPhase}`);
  }

  /**
   * 获取下一个阶段
   */
  private getNextPhase(currentPhase: GamePhase): GamePhase {
    const phaseOrder: GamePhase[] = ['building', 'management', 'exploration', 'competition', 'expansion'];
    const currentIndex = phaseOrder.indexOf(currentPhase);
    return phaseOrder[(currentIndex + 1) % phaseOrder.length];
  }

  /**
   * 阶段进入逻辑
   */
  private onPhaseEnter(phase: GamePhase): void {
    switch (phase) {
      case 'building':
        this.initializeBuildingPhase();
        break;
      case 'management':
        this.initializeManagementPhase();
        break;
      case 'exploration':
        this.initializeExplorationPhase();
        break;
      case 'competition':
        this.initializeCompetitionPhase();
        break;
      case 'expansion':
        this.initializeExpansionPhase();
        break;
    }
  }

  /**
   * 阶段退出逻辑
   */
  private onPhaseExit(phase: GamePhase): void {
    // 清理阶段定时器
    if (this.phaseTimer) {
      clearTimeout(this.phaseTimer);
      this.phaseTimer = null;
    }
    
    switch (phase) {
      case 'building':
        this.finalizeBuildingPhase();
        break;
      case 'management':
        this.finalizeManagementPhase();
        break;
      case 'exploration':
        this.finalizeExplorationPhase();
        break;
      case 'competition':
        this.finalizeCompetitionPhase();
        break;
      case 'expansion':
        this.finalizeExpansionPhase();
        break;
    }
  }

  /**
   * 获取阶段可用操作
   */
  private getPhaseActions(phase: GamePhase): string[] {
    switch (phase) {
      case 'building':
        return ['plan_construction', 'hire_workers', 'purchase_materials', 'monitor_progress'];
      case 'management':
        return ['manage_tenants', 'handle_complaints', 'adjust_pricing', 'maintain_properties'];
      case 'exploration':
        return ['start_mission', 'upgrade_equipment', 'recruit_team', 'analyze_market'];
      case 'competition':
        return ['participate_auction', 'bid_on_items', 'analyze_competitors', 'strategic_planning'];
      case 'expansion':
        return ['unlock_regions', 'acquire_land', 'expand_business', 'form_partnerships'];
      default:
        return [];
    }
  }

  /**
   * 获取阶段目标
   */
  private getPhaseObjectives(phase: GamePhase): string[] {
    switch (phase) {
      case 'building':
        return ['完成至少1个建设项目', '保持建设质量在80%以上', '控制成本在预算内'];
      case 'management':
        return ['维持租户满意度在75%以上', '处理所有投诉', '实现正现金流'];
      case 'exploration':
        return ['完成至少1个探险任务', '获得新的市场信息', '提升技能等级'];
      case 'competition':
        return ['参与至少1次拍卖', '获得有价值的资源', '分析竞争对手策略'];
      case 'expansion':
        return ['解锁新区域', '扩大业务规模', '建立战略合作关系'];
      default:
        return [];
    }
  }

  // ==================== 建设阶段逻辑 ====================

  private initializeBuildingPhase(): void {
    console.log('进入建设阶段');
    // 刷新可用建筑配置
    // 检查资源和资金
    // 生成建设机会
  }

  private finalizeBuildingPhase(): void {
    console.log('完成建设阶段');
    // 完成所有进行中的建设项目
    // 计算建设成果
    // 更新物业价值
  }

  /**
   * 开始建设项目
   */
  public startConstructionProject(buildingConfig: BuildingConfig): ConstructionProject {
    const project: ConstructionProject = {
      id: `project_${Date.now()}`,
      buildingConfig,
      status: 'in_progress',
      progress: 0,
      startDate: new Date(),
      estimatedCompletion: new Date(Date.now() + buildingConfig.constructionTime * 60 * 60 * 1000),
      actualCost: buildingConfig.cost,
      qualityRating: 75, // 基础质量
      complications: [],
      workers: []
    };
    
    console.log(`开始建设项目: ${buildingConfig.name}`);
    return project;
  }

  // ==================== 经营阶段逻辑 ====================

  private initializeManagementPhase(): void {
    console.log('进入经营阶段');
    // 更新租户状态
    // 生成新的租户需求
    // 检查维护需求
  }

  private finalizeManagementPhase(): void {
    console.log('完成经营阶段');
    // 计算租金收入
    // 处理租户续约
    // 更新满意度统计
  }

  /**
   * 处理租户投诉
   */
  public handleTenantComplaint(complaintId: string, resolution: string): void {
    // 查找并处理投诉
    console.log(`处理投诉 ${complaintId}: ${resolution}`);
  }

  // ==================== 探险阶段逻辑 ====================

  private initializeExplorationPhase(): void {
    console.log('进入探险阶段');
    // 生成新的探险任务
    // 检查装备状态
    // 更新技能树
  }

  private finalizeExplorationPhase(): void {
    console.log('完成探险阶段');
    // 完成所有进行中的任务
    // 计算探险收益
    // 更新技能经验
  }

  /**
   * 开始探险任务
   */
  public startExplorationMission(mission: ExplorationMission): void {
    mission.status = 'in_progress';
    mission.start_time = new Date();
    
    console.log(`开始探险任务: ${mission.name}`);
    
    // 设置任务完成定时器
    setTimeout(() => {
      this.completeExplorationMission(mission.id);
    }, mission.duration * 60 * 60 * 1000);
  }

  /**
   * 完成探险任务
   */
  private completeExplorationMission(missionId: string): void {
    // 查找任务并计算结果
    console.log(`完成探险任务: ${missionId}`);
  }

  // ==================== 竞争阶段逻辑 ====================

  private initializeCompetitionPhase(): void {
    console.log('进入竞争阶段');
    // 生成拍卖物品
    // 分析竞争对手
    // 制定竞争策略
  }

  private finalizeCompetitionPhase(): void {
    console.log('完成竞争阶段');
    // 结算拍卖结果
    // 更新市场地位
    // 计算竞争收益
  }

  /**
   * 参与拍卖出价
   */
  public placeBid(auctionItemId: string, bidAmount: number): boolean {
    // 验证出价有效性
    // 更新拍卖状态
    console.log(`对物品 ${auctionItemId} 出价 ${bidAmount}`);
    return true;
  }

  // ==================== 扩张阶段逻辑 ====================

  private initializeExpansionPhase(): void {
    console.log('进入扩张阶段');
    // 检查解锁条件
    // 生成扩张机会
    // 评估投资回报
  }

  private finalizeExpansionPhase(): void {
    console.log('完成扩张阶段');
    // 确认扩张决策
    // 更新业务规模
    // 准备下一循环
  }

  /**
   * 解锁新区域
   */
  public unlockRegion(regionId: string): boolean {
    // 检查解锁条件
    // 扣除解锁成本
    // 添加到已解锁区域
    console.log(`解锁新区域: ${regionId}`);
    return true;
  }

  // ==================== 进度和状态管理 ====================

  /**
   * 更新阶段进度
   */
  public updatePhaseProgress(progress: number): void {
    this.gameState.game_cycle.phaseProgress = Math.max(0, Math.min(100, progress));
    
    // 如果进度达到100%，自动切换到下一阶段
    if (this.gameState.game_cycle.phaseProgress >= 100) {
      this.advanceToNextPhase();
    }
  }

  /**
   * 完成阶段目标
   */
  public completeObjective(objective: string): void {
    const { activeObjectives, completedObjectives } = this.gameState.game_cycle;
    
    if (activeObjectives.includes(objective)) {
      // 从活跃目标中移除
      const index = activeObjectives.indexOf(objective);
      activeObjectives.splice(index, 1);
      
      // 添加到已完成目标
      completedObjectives.push(objective);
      
      console.log(`完成目标: ${objective}`);
      
      // 计算进度更新
      const totalObjectives = activeObjectives.length + completedObjectives.length;
      const progressIncrease = (1 / totalObjectives) * 100;
      this.updatePhaseProgress(this.gameState.game_cycle.phaseProgress + progressIncrease);
    }
  }

  /**
   * 检查阶段完成条件
   */
  public checkPhaseCompletion(): boolean {
    const { activeObjectives, phaseProgress } = this.gameState.game_cycle;
    return activeObjectives.length === 0 || phaseProgress >= 100;
  }

  /**
   * 获取阶段统计信息
   */
  public getPhaseStats(): {
    currentPhase: GamePhase;
    progress: number;
    timeElapsed: number;
    objectivesCompleted: number;
    totalObjectives: number;
  } {
    const { currentPhase, phaseProgress, phaseStartTime, activeObjectives, completedObjectives } = this.gameState.game_cycle;
    
    return {
      currentPhase,
      progress: phaseProgress,
      timeElapsed: Date.now() - phaseStartTime.getTime(),
      objectivesCompleted: completedObjectives.length,
      totalObjectives: activeObjectives.length + completedObjectives.length
    };
  }

  // ==================== 事件和回调管理 ====================

  /**
   * 注册阶段回调
   */
  public onPhaseChange(phase: GamePhase, callback: () => void): void {
    const callbacks = this.phaseCallbacks.get(phase) || [];
    callbacks.push(callback);
    this.phaseCallbacks.set(phase, callbacks);
  }

  /**
   * 触发阶段回调
   */
  private triggerPhaseCallbacks(phase: GamePhase): void {
    const callbacks = this.phaseCallbacks.get(phase) || [];
    callbacks.forEach(callback => {
      try {
        callback();
      } catch (error) {
        console.error(`阶段回调执行错误 (${phase}):`, error);
      }
    });
  }

  /**
   * 移除阶段回调
   */
  public removePhaseCallback(phase: GamePhase, callback: () => void): void {
    const callbacks = this.phaseCallbacks.get(phase) || [];
    const index = callbacks.indexOf(callback);
    if (index > -1) {
      callbacks.splice(index, 1);
      this.phaseCallbacks.set(phase, callbacks);
    }
  }

  // ==================== 保存和加载 ====================

  /**
   * 导出游戏状态
   */
  public exportGameState(): string {
    return JSON.stringify(this.gameState, null, 2);
  }

  /**
   * 导入游戏状态
   */
  public importGameState(stateJson: string): void {
    try {
      const importedState = JSON.parse(stateJson);
      this.gameState = importedState;
      console.log('游戏状态导入成功');
    } catch (error) {
      console.error('游戏状态导入失败:', error);
    }
  }

  /**
   * 重置游戏状态
   */
  public resetGameState(): void {
    // 重置到初始状态
    this.gameState.game_cycle = {
      currentPhase: 'building',
      phaseProgress: 0,
      cycleNumber: 1,
      phaseStartTime: new Date(),
      availableActions: this.getPhaseActions('building'),
      completedObjectives: [],
      activeObjectives: this.getPhaseObjectives('building')
    };
    
    console.log('游戏状态已重置');
  }
}

// ==================== 工具函数 ====================

/**
 * 创建默认游戏循环状态
 */
export function createDefaultGameCycleState(): GameCycleState {
  return {
    currentPhase: 'building',
    phaseProgress: 0,
    cycleNumber: 1,
    phaseStartTime: new Date(),
    availableActions: ['plan_construction', 'hire_workers', 'purchase_materials', 'monitor_progress'],
    completedObjectives: [],
    activeObjectives: ['完成至少1个建设项目', '保持建设质量在80%以上', '控制成本在预算内']
  };
}

/**
 * 获取阶段显示名称
 */
export function getPhaseDisplayName(phase: GamePhase): string {
  const phaseNames: Record<GamePhase, string> = {
    building: '建设阶段',
    management: '经营阶段',
    exploration: '探险阶段',
    competition: '竞争阶段',
    expansion: '扩张阶段'
  };
  
  return phaseNames[phase] || phase;
}

/**
 * 获取阶段描述
 */
export function getPhaseDescription(phase: GamePhase): string {
  const descriptions: Record<GamePhase, string> = {
    building: '规划和建设新的物业设施，提升硬件基础',
    management: '管理租户关系，优化运营效率，确保稳定收益',
    exploration: '探索市场机会，获取稀有资源，提升个人技能',
    competition: '参与市场竞争，争夺优质资源，建立市场地位',
    expansion: '扩大业务规模，进入新市场，实现战略增长'
  };
  
  return descriptions[phase] || '';
}

/**
 * 计算阶段完成奖励
 */
export function calculatePhaseRewards(phase: GamePhase, performance: number): {
  experience: number;
  money: number;
  reputation: number;
  items: string[];
} {
  const baseRewards = {
    building: { experience: 100, money: 5000, reputation: 10 },
    management: { experience: 80, money: 8000, reputation: 15 },
    exploration: { experience: 120, money: 3000, reputation: 5 },
    competition: { experience: 90, money: 10000, reputation: 20 },
    expansion: { experience: 150, money: 15000, reputation: 25 }
  };
  
  const base = baseRewards[phase];
  const multiplier = performance / 100;
  
  return {
    experience: Math.floor(base.experience * multiplier),
    money: Math.floor(base.money * multiplier),
    reputation: Math.floor(base.reputation * multiplier),
    items: performance > 80 ? ['bonus_item'] : []
  };
}