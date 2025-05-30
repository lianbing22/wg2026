/**
 * 物业管理模拟器 - 场景数据服务
 * 负责加载、管理和提供场景数据
 */

import { Scenario, ScenarioNode } from '../types/game';

// 模拟场景数据
const MOCK_SCENARIOS: Record<string, Scenario> = {
  'tutorial': {
    id: 'tutorial',
    title: '新手教程',
    description: '学习物业管理的基础知识',
    difficulty: 1,
    estimatedTime: 10,
    startNode: 'tutorial_start',
    tags: ['教程', '基础'],
    requirements: {},
    rewards: {
      experience: 100,
      money: 500,
      skills: { '沟通技巧': 5, '管理能力': 5 }
    }
  },
  'tenant_complaint': {
    id: 'tenant_complaint',
    title: '租户投诉处理',
    description: '处理租户的投诉和问题',
    difficulty: 2,
    estimatedTime: 15,
    startNode: 'complaint_start',
    tags: ['投诉处理', '沟通'],
    requirements: { '沟通技巧': 20 },
    rewards: {
      experience: 200,
      money: 0,
      reputation: 10,
      skills: { '沟通技巧': 10, '问题解决': 8 }
    }
  },
  'maintenance_crisis': {
    id: 'maintenance_crisis',
    title: '设备维修危机',
    description: '紧急处理物业设备故障',
    difficulty: 3,
    estimatedTime: 20,
    startNode: 'crisis_start',
    tags: ['维修', '紧急情况'],
    requirements: { '技术知识': 30, '管理能力': 25 },
    rewards: {
      experience: 300,
      money: -1000,
      reputation: 15,
      skills: { '技术知识': 15, '应急处理': 12 }
    }
  },
  'budget_planning': {
    id: 'budget_planning',
    title: '年度预算规划',
    description: '制定下一年度的物业管理预算',
    difficulty: 2,
    estimatedTime: 25,
    startNode: 'budget_start',
    tags: ['财务', '规划'],
    requirements: { '财务管理': 40 },
    rewards: {
      experience: 250,
      money: 2000,
      skills: { '财务管理': 12, '规划能力': 10 }
    }
  }
};

// 模拟场景节点数据
const MOCK_SCENARIO_NODES: Record<string, ScenarioNode> = {
  // 新手教程节点
  'tutorial_start': {
    nodeId: 'tutorial_start',
    type: 'normal',
    text: '欢迎来到阳光小区！作为新任物业经理，你将负责管理这个拥有200户居民的住宅小区。今天是你的第一天，让我们从了解基本职责开始。',
    image: '/images/scenarios/tutorial/welcome.jpg',
    choices: [
      {
        text: '了解小区基本情况',
        nextNode: 'tutorial_overview',
        effects: { experience: 10 }
      },
      {
        text: '直接开始工作',
        nextNode: 'tutorial_direct',
        effects: { experience: 5, stress: 5 }
      }
    ]
  },
  'tutorial_overview': {
    nodeId: 'tutorial_overview',
    type: 'normal',
    title: '小区概况',
    text: '阳光小区建于2010年，共有5栋住宅楼，200户家庭。小区设施包括：停车场、健身房、儿童游乐区、绿化带等。你的主要职责包括：设施维护、租户服务、财务管理、安全保障。',
    choices: [
      {
        text: '查看今日工作安排',
        nextNode: 'tutorial_tasks',
        effects: { experience: 15 }
      }
    ]
  },
  'tutorial_direct': {
    nodeId: 'tutorial_direct',
    type: 'normal',
    title: '匆忙开始',
    text: '你决定直接投入工作，但很快发现没有充分了解情况会让工作变得困难。不过，在实践中学习也是一种方式。',
    choices: [
      {
        text: '补充了解小区情况',
        nextNode: 'tutorial_overview',
        effects: { experience: 10 }
      },
      {
        text: '继续边做边学',
        nextNode: 'tutorial_tasks',
        effects: { experience: 5, stress: 10 }
      }
    ]
  },
  'tutorial_tasks': {
    nodeId: 'tutorial_tasks',
    type: 'choice',
    title: '今日任务',
    text: '前台小李给你递来了今天的工作清单：\n1. 处理3楼住户的漏水投诉\n2. 检查停车场照明设备\n3. 与清洁公司协调垃圾清运时间\n\n你决定先处理哪个任务？',
    choices: [
      {
        text: '优先处理漏水投诉（紧急）',
        nextNode: 'tutorial_leak',
        effects: { experience: 20, reputation: 5 },
        qte: {
          type: 'timing',
          timeLimit: 5,
          title: '快速响应',
          targetTiming: 0.7,
          tolerance: 0.2,
          successEffects: { reputation: 10 },
          failureEffects: { reputation: -5 }
        }
      },
      {
        text: '检查停车场照明（安全）',
        nextNode: 'tutorial_lighting',
        effects: { experience: 15, skills: { '技术知识': 5 } }
      },
      {
        text: '协调垃圾清运（日常）',
        nextNode: 'tutorial_cleaning',
        effects: { experience: 10, skills: { '沟通技巧': 5 } }
      }
    ]
  },
  'tutorial_leak': {
    nodeId: 'tutorial_leak',
    type: 'normal',
    title: '处理漏水投诉',
    text: '你迅速来到3楼，发现确实有水从天花板滴落。住户王阿姨很着急，因为水滴到了她新买的沙发上。你需要立即联系维修师傅，同时安抚住户情绪。',
    choices: [
      {
        text: '完成教程',
        nextNode: 'tutorial_end',
        effects: { experience: 30, money: 500, skills: { '沟通技巧': 10 } }
      }
    ]
  },
  'tutorial_lighting': {
    nodeId: 'tutorial_lighting',
    type: 'normal',
    title: '检查停车场照明',
    text: '你来到停车场，发现有几盏灯确实不亮了。这会影响夜间停车安全。你记录下需要更换的灯具位置，准备联系电工进行维修。',
    choices: [
      {
        text: '完成教程',
        nextNode: 'tutorial_end',
        effects: { experience: 25, skills: { '技术知识': 10 } }
      }
    ]
  },
  'tutorial_cleaning': {
    nodeId: 'tutorial_cleaning',
    type: 'normal',
    title: '协调垃圾清运',
    text: '你联系了清洁公司，协调了更合适的垃圾清运时间，避免影响居民休息。清洁公司经理对你的专业态度表示赞赏。',
    choices: [
      {
        text: '完成教程',
        nextNode: 'tutorial_end',
        effects: { experience: 20, skills: { '沟通技巧': 10 } }
      }
    ]
  },
  'tutorial_end': {
    nodeId: 'tutorial_end',
    type: 'ending',
    title: '教程完成',
    text: '恭喜你完成了第一天的工作！通过今天的学习，你对物业管理工作有了初步了解。记住，作为物业经理，你需要平衡各种需求，及时响应问题，并与各方保持良好沟通。\n\n继续努力，成为一名优秀的物业经理吧！',
    autoEffects: { experience: 50, money: 500 }
  },

  // 租户投诉节点
  'complaint_start': {
    nodeId: 'complaint_start',
    type: 'normal',
    title: '投诉电话',
    text: '周一早上9点，你刚到办公室就接到了一个投诉电话。5楼的张先生情绪激动地抱怨楼上邻居深夜装修，严重影响了他的休息。这已经是本周第三次类似投诉了。',
    choices: [
      {
        text: '立即上楼了解情况',
        nextNode: 'complaint_investigate',
        effects: { experience: 10 }
      },
      {
        text: '先安抚张先生情绪',
        nextNode: 'complaint_comfort',
        effects: { experience: 10, skills: { '沟通技巧': 5 } }
      },
      {
        text: '查看之前的投诉记录',
        nextNode: 'complaint_records',
        effects: { experience: 10, skills: { '管理能力': 5 } }
      }
    ]
  },

  // 设备维修危机节点
  'crisis_start': {
    nodeId: 'crisis_start',
    type: 'normal',
    title: '紧急情况',
    text: '凌晨2点，你被紧急电话吵醒。小区的主供水管道爆裂，整个小区都停水了。保安队长在电话里说情况很严重，需要你立即到现场处理。',
    choices: [
      {
        text: '立即赶到现场',
        nextNode: 'crisis_scene',
        effects: { experience: 15, stress: 10 }
      },
      {
        text: '先联系维修公司',
        nextNode: 'crisis_contact',
        effects: { experience: 10, skills: { '应急处理': 5 } }
      }
    ]
  },

  // 预算规划节点
  'budget_start': {
    nodeId: 'budget_start',
    type: 'normal',
    text: '年底了，你需要制定明年的物业管理预算。业主委员会要求在保证服务质量的前提下，尽可能控制成本。你面前摆着各部门提交的预算申请。',
    choices: [
      {
        text: '分析各项支出',
        nextNode: 'budget_analysis',
        effects: { experience: 15, skills: { '财务管理': 5 } }
      },
      {
        text: '咨询业主意见',
        nextNode: 'budget_survey',
        effects: { experience: 10, skills: { '沟通技巧': 5 } }
      }
    ]
  }
};

/**
 * 场景数据服务类
 */
export class ScenarioService {
  private static instance: ScenarioService;
  private scenarios: Map<string, Scenario> = new Map();
  private scenarioNodes: Map<string, ScenarioNode> = new Map();

  private constructor() {
    this.loadMockData();
  }

  public static getInstance(): ScenarioService {
    if (!ScenarioService.instance) {
      ScenarioService.instance = new ScenarioService();
    }
    return ScenarioService.instance;
  }

  /**
   * 加载模拟数据
   */
  private loadMockData(): void {
    // 加载场景数据
    Object.values(MOCK_SCENARIOS).forEach(scenario => {
      this.scenarios.set(scenario.id, scenario);
    });

    // 加载场景节点数据
    Object.values(MOCK_SCENARIO_NODES).forEach(node => {
      this.scenarioNodes.set(node.nodeId, node);
    });
  }

  /**
   * 获取所有场景列表
   */
  public async getAllScenarios(): Promise<Scenario[]> {
    return Array.from(this.scenarios.values());
  }

  /**
   * 根据ID获取场景
   */
  public async getScenarioById(id: string): Promise<Scenario | null> {
    return this.scenarios.get(id) || null;
  }

  /**
   * 根据标签筛选场景
   */
  public async getScenariosByTags(tags: string[]): Promise<Scenario[]> {
    return Array.from(this.scenarios.values()).filter(scenario =>
      scenario.tags && tags.some(tag => scenario.tags!.includes(tag))
    );
  }

  /**
   * 根据难度筛选场景
   */
  public async getScenariosByDifficulty(difficulty: number): Promise<Scenario[]> {
    return Array.from(this.scenarios.values()).filter(scenario =>
      scenario.difficulty === difficulty
    );
  }

  /**
   * 获取场景的所有节点
   */
  public async getScenarioNodes(scenarioId: string): Promise<Record<string, ScenarioNode>> {
    const scenario = this.scenarios.get(scenarioId);
    if (!scenario) {
      throw new Error(`Scenario not found: ${scenarioId}`);
    }

    const nodes: Record<string, ScenarioNode> = {};
    const visited = new Set<string>();
    const queue = [scenario.startNode];

    while (queue.length > 0) {
      const nodeId = queue.shift()!;
      if (visited.has(nodeId)) continue;

      const node = this.scenarioNodes.get(nodeId);
      if (!node) {
        console.warn(`Node not found: ${nodeId}`);
        continue;
      }

      nodes[nodeId] = node;
      visited.add(nodeId);

      // 添加选择指向的节点到队列
      if (node.choices) {
        node.choices.forEach(choice => {
          if (choice.nextNode && !visited.has(choice.nextNode)) {
            queue.push(choice.nextNode);
          }
        });
      }
    }

    return nodes;
  }

  /**
   * 根据ID获取场景节点
   */
  public async getScenarioNodeById(nodeId: string): Promise<ScenarioNode | null> {
    return this.scenarioNodes.get(nodeId) || null;
  }

  /**
   * 检查玩家是否满足场景要求
   */
  public checkScenarioRequirements(
    scenario: Scenario,
    playerSkills: Record<string, number>
  ): { canPlay: boolean; missingRequirements: Record<string, number> } {
    const missingRequirements: Record<string, number> = {};
    let canPlay = true;

    if (scenario.requirements) {
      Object.entries(scenario.requirements).forEach(([skill, requiredLevel]) => {
        const playerLevel = playerSkills[skill] || 0;
        if (playerLevel < requiredLevel) {
          missingRequirements[skill] = requiredLevel - playerLevel;
          canPlay = false;
        }
      });
    }

    return { canPlay, missingRequirements };
  }

  /**
   * 获取推荐场景
   */
  public async getRecommendedScenarios(
    playerSkills: Record<string, number>,
    completedScenarios: string[] = [],
    limit: number = 5
  ): Promise<Scenario[]> {
    const allScenarios = Array.from(this.scenarios.values());
    
    // 过滤已完成的场景
    const availableScenarios = allScenarios.filter(scenario => 
      !completedScenarios.includes(scenario.id)
    );

    // 根据玩家技能水平推荐合适难度的场景
    const averageSkillLevel = Object.values(playerSkills).reduce((sum, level) => sum + level, 0) / 
      Math.max(Object.keys(playerSkills).length, 1);

    let recommendedDifficulty: number;
    if (averageSkillLevel < 20) {
      recommendedDifficulty = 1;
    } else if (averageSkillLevel < 40) {
      recommendedDifficulty = 2;
    } else if (averageSkillLevel < 60) {
      recommendedDifficulty = 3;
    } else if (averageSkillLevel < 80) {
      recommendedDifficulty = 4;
    } else {
      recommendedDifficulty = 5;
    }

    // 优先推荐合适难度的场景，然后是其他场景
    const suitableScenarios = availableScenarios.filter(scenario => {
      const { canPlay } = this.checkScenarioRequirements(scenario, playerSkills);
      return canPlay && scenario.difficulty === recommendedDifficulty;
    });

    const otherScenarios = availableScenarios.filter(scenario => {
      const { canPlay } = this.checkScenarioRequirements(scenario, playerSkills);
      return canPlay && scenario.difficulty !== recommendedDifficulty;
    });

    return [...suitableScenarios, ...otherScenarios].slice(0, limit);
  }

  /**
   * 搜索场景
   */
  public async searchScenarios(query: string): Promise<Scenario[]> {
    const lowercaseQuery = query.toLowerCase();
    return Array.from(this.scenarios.values()).filter(scenario =>
      scenario.title.toLowerCase().includes(lowercaseQuery) ||
      (scenario.description && scenario.description.toLowerCase().includes(lowercaseQuery)) ||
      (scenario.tags && scenario.tags.some(tag => tag.toLowerCase().includes(lowercaseQuery)))
    );
  }
}

// 导出单例实例
export const scenarioService = ScenarioService.getInstance();