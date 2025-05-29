/**
 * 物业管理模拟器 - 场景管理器
 * 负责加载、处理和渲染游戏场景和决策
 */

class ScenarioManager {
    constructor() {
        this.currentScenario = null;
        this.currentNode = null;
        this.gameState = {
            tenantSatisfaction: 75,
            financialHealth: 5000,
            buildingCondition: 80,
            managerStress: 25,
            relationships: {},
            inventory: [],
            flags: [],
            decisionHistory: []
        };
        this.elements = {};
        this.initialized = false;
    }

    /**
     * 初始化场景管理器
     */
    init() {
        if (this.initialized) return;
        
        // 获取DOM元素
        this.elements = {
            scenarioTitle: document.getElementById('scenarioTitle'),
            locationImage: document.getElementById('locationImage'),
            characterImage: document.getElementById('characterImage'),
            dialogueText: document.getElementById('dialogueText'),
            speakerName: document.getElementById('speakerName'),
            speakerAvatar: document.getElementById('speakerAvatar'),
            choicesContainer: document.getElementById('choicesContainer'),
            sceneTransition: document.getElementById('sceneTransition'),
            tenantSatisfactionValue: document.getElementById('tenantSatisfactionValue'),
            financialHealthValue: document.getElementById('financialHealthValue'),
            buildingConditionValue: document.getElementById('buildingConditionValue'),
            managerStressValue: document.getElementById('managerStressValue'),
            resultOverlay: document.getElementById('resultOverlay'),
            resultDescription: document.getElementById('resultDescription'),
            finalTenantSatisfaction: document.getElementById('finalTenantSatisfaction'),
            finalFinancialHealth: document.getElementById('finalFinancialHealth'),
            finalReputation: document.getElementById('finalReputation'),
            restartButton: document.getElementById('restartButton'),
            continueButton: document.getElementById('continueButton')
        };
        
        // 绑定事件处理
        this.elements.restartButton.addEventListener('click', () => this.restartScenario());
        this.elements.continueButton.addEventListener('click', () => window.location.href = 'index.html');
        
        // 标记初始化完成
        this.initialized = true;
    }

    /**
     * 加载场景数据
     * @param {string} scenarioId - 场景ID
     * @returns {Promise} - 加载完成的Promise
     */
    async loadScenario(scenarioId) {
        try {
            // 实际项目中应该从服务器或本地JSON文件加载
            // 这里使用内部数据进行演示
            this.currentScenario = SCENARIO_DATA[scenarioId] || SCENARIO_DATA.EMERGENCY_ELEVATOR_REPAIR;
            
            // 设置标题
            if (this.elements.scenarioTitle) {
                this.elements.scenarioTitle.textContent = this.currentScenario.title;
            }
            
            // 重置游戏状态
            this.resetGameState();
            
            // 加载起始节点
            this.loadNode(this.currentScenario.startNode || Object.keys(this.currentScenario.nodes)[0]);
            
            return Promise.resolve();
        } catch (error) {
            console.error('加载场景失败:', error);
            return Promise.reject(error);
        }
    }

    /**
     * 重置游戏状态
     */
    resetGameState() {
        this.gameState = {
            tenantSatisfaction: 75,
            financialHealth: 5000,
            buildingCondition: 80,
            managerStress: 25,
            relationships: {
                'STAFF_TECHNICIAN_WANG': 5,
                'NPC_ELDERLY_LIU': 5,
                'NPC_YOUNG_FAMILY_WU': 5
            },
            inventory: [],
            flags: [],
            decisionHistory: []
        };
        
        this.updateMetrics();
    }

    /**
     * 加载场景节点
     * @param {string} nodeId - 节点ID
     */
    loadNode(nodeId) {
        const node = this.currentScenario.nodes[nodeId];
        if (!node) {
            console.error(`节点 ${nodeId} 不存在!`);
            return;
        }
        
        // 更新当前节点
        this.currentNode = nodeId;
        
        // 场景转换效果
        this.elements.sceneTransition.classList.add('active');
        
        setTimeout(() => {
            // 更新图片
            if (node.location_image && this.elements.locationImage) {
                this.elements.locationImage.src = node.location_image;
            }
            
            if (this.elements.characterImage) {
                if (node.image) {
                    this.elements.characterImage.src = node.image;
                    this.elements.characterImage.classList.add('active');
                } else {
                    this.elements.characterImage.classList.remove('active');
                }
            }
            
            // 更新对话
            if (this.elements.dialogueText) {
                this.elements.dialogueText.innerHTML = node.text;
            }
            
            // 更新说话者
            if (node.speaker && this.elements.speakerName) {
                this.elements.speakerName.textContent = node.speaker;
                
                // 更新说话者头像
                if (this.elements.speakerAvatar) {
                    // 这里应该根据说话者ID获取正确的头像
                    // 简化示例使用固定路径
                    const avatarPath = this.getSpeakerAvatar(node.speaker);
                    if (avatarPath) {
                        this.elements.speakerAvatar.src = avatarPath;
                    }
                }
            }
            
            // 应用效果
            if (node.effects) {
                this.applyEffects(node.effects);
            }
            
            // 添加选项
            if (this.elements.choicesContainer) {
                this.elements.choicesContainer.innerHTML = '';
                
                if (node.endsScenario) {
                    // 如果是结束节点，显示结果
                    setTimeout(() => {
                        this.showResult(node.endText || '场景结束');
                    }, 3000); // 给玩家时间阅读最后的文本
                } else if (node.choices && node.choices.length > 0) {
                    // 添加选择按钮
                    node.choices.forEach(choice => {
                        // 检查条件是否满足
                        if (choice.conditions && !this.checkConditions(choice.conditions)) {
                            return; // 条件不满足，不显示此选项
                        }
                        
                        const button = document.createElement('button');
                        button.className = 'choice-button';
                        button.dataset.nextNode = choice.nextNode;
                        
                        // 添加高亮效果元素
                        const highlight = document.createElement('div');
                        highlight.className = 'choice-highlight';
                        button.appendChild(highlight);
                        
                        // 设置选项文本
                        const textSpan = document.createElement('span');
                        textSpan.className = 'choice-text';
                        textSpan.textContent = choice.text;
                        button.appendChild(textSpan);
                        
                        // 添加效果提示
                        if (choice.effects) {
                            const effectsDiv = document.createElement('div');
                            effectsDiv.className = 'choice-effects';
                            
                            Object.entries(choice.effects).forEach(([key, value]) => {
                                if (key === 'flag' || key === 'inventory') return; // 跳过非数值效果
                                
                                const effectSpan = document.createElement('span');
                                const effectClass = value > 0 ? 'positive' : (value < 0 ? 'negative' : 'neutral');
                                effectSpan.className = `choice-effect ${effectClass}`;
                                
                                let displayKey = this.formatEffectKey(key);
                                
                                effectSpan.textContent = `${displayKey} ${value > 0 ? '+' : ''}${value}`;
                                effectsDiv.appendChild(effectSpan);
                            });
                            
                            if (effectsDiv.childNodes.length > 0) {
                                button.appendChild(effectsDiv);
                            }
                        }
                        
                        // 添加点击事件
                        button.addEventListener('click', () => {
                            // 保存决策到历史记录
                            this.gameState.decisionHistory.push({
                                nodeId: this.currentNode,
                                choiceText: choice.text,
                                effects: choice.effects
                            });
                            
                            // 应用选择效果
                            if (choice.effects) {
                                this.applyEffects(choice.effects);
                            }
                            
                            // 加载下一个节点
                            this.loadNode(choice.nextNode);
                        });
                        
                        this.elements.choicesContainer.appendChild(button);
                    });
                }
            }
            
            // 完成场景切换
            setTimeout(() => {
                this.elements.sceneTransition.classList.remove('active');
            }, 500);
            
        }, 500); // 半秒后更新内容
    }

    /**
     * 格式化效果键名
     * @param {string} key - 效果键名
     * @returns {string} - 格式化后的键名
     */
    formatEffectKey(key) {
        if (key.startsWith('relationship_')) {
            const npcId = key.replace('relationship_', '');
            return `与${this.getNPCName(npcId)}关系`;
        }
        
        // 转换常见键名
        const keyMap = {
            'tenantSatisfaction': '租户满意度',
            'financialHealth': '财务健康',
            'buildingCondition': '建筑状况',
            'managerStress': '经理压力'
        };
        
        return keyMap[key] || key;
    }

    /**
     * 获取NPC名称
     * @param {string} npcId - NPC ID
     * @returns {string} - NPC名称
     */
    getNPCName(npcId) {
        const npcNames = {
            'STAFF_TECHNICIAN_WANG': '王师傅',
            'NPC_ELDERLY_LIU': '刘奶奶',
            'NPC_YOUNG_FAMILY_WU': '吴家'
        };
        
        return npcNames[npcId] || npcId;
    }

    /**
     * 获取说话者头像
     * @param {string} speaker - 说话者名称
     * @returns {string} - 头像路径
     */
    getSpeakerAvatar(speaker) {
        const avatarMap = {
            '王师傅': 'assets/images/characters/staff_technician_wang.png',
            '刘奶奶': 'assets/images/characters/tenant_elderly_liu.png',
            '吴家': 'assets/images/characters/young_family_wu.png',
            '旁白': 'assets/images/ui/narrator_icon.png'
        };
        
        return avatarMap[speaker] || 'assets/images/ui/default_avatar.png';
    }

    /**
     * 应用效果到游戏状态
     * @param {Object} effects - 效果对象
     */
    applyEffects(effects) {
        Object.entries(effects).forEach(([key, value]) => {
            if (key.startsWith('relationship_')) {
                // 处理关系变化
                const npcId = key.replace('relationship_', '');
                this.gameState.relationships[npcId] = (this.gameState.relationships[npcId] || 0) + value;
            } else if (key === 'flag') {
                // 添加标记
                if (!this.gameState.flags.includes(value)) {
                    this.gameState.flags.push(value);
                }
            } else if (key === 'inventory') {
                // 添加物品到库存
                if (!this.gameState.inventory.includes(value)) {
                    this.gameState.inventory.push(value);
                }
            } else {
                // 处理数值状态变化
                this.gameState[key] = (this.gameState[key] || 0) + value;
            }
        });
        
        // 更新显示
        this.updateMetrics();
    }

    /**
     * 检查条件是否满足
     * @param {Object} conditions - 条件对象
     * @returns {boolean} - 是否满足条件
     */
    checkConditions(conditions) {
        for (const [key, value] of Object.entries(conditions)) {
            if (key === 'flag') {
                // 检查是否有标记
                if (!this.gameState.flags.includes(value)) {
                    return false;
                }
            } else if (key === 'inventory') {
                // 检查是否有物品
                if (!this.gameState.inventory.includes(value)) {
                    return false;
                }
            } else if (key.startsWith('relationship_')) {
                // 检查关系值
                const npcId = key.replace('relationship_', '');
                const relationship = this.gameState.relationships[npcId] || 0;
                if (relationship < value) {
                    return false;
                }
            } else {
                // 检查数值状态
                const currentValue = this.gameState[key] || 0;
                if (currentValue < value) {
                    return false;
                }
            }
        }
        
        return true;
    }

    /**
     * 更新游戏指标显示
     */
    updateMetrics() {
        if (this.elements.tenantSatisfactionValue) {
            this.elements.tenantSatisfactionValue.textContent = this.gameState.tenantSatisfaction;
        }
        
        if (this.elements.financialHealthValue) {
            this.elements.financialHealthValue.textContent = this.gameState.financialHealth;
        }
        
        if (this.elements.buildingConditionValue) {
            this.elements.buildingConditionValue.textContent = this.gameState.buildingCondition;
        }
        
        if (this.elements.managerStressValue) {
            this.elements.managerStressValue.textContent = this.gameState.managerStress;
        }
    }

    /**
     * 显示结果
     * @param {string} endText - 结束文本
     */
    showResult(endText) {
        if (this.elements.resultDescription) {
            this.elements.resultDescription.textContent = endText;
        }
        
        if (this.elements.finalTenantSatisfaction) {
            this.elements.finalTenantSatisfaction.textContent = this.gameState.tenantSatisfaction;
        }
        
        if (this.elements.finalFinancialHealth) {
            this.elements.finalFinancialHealth.textContent = this.gameState.financialHealth;
        }
        
        // 计算声誉分数
        const reputation = Math.round((this.gameState.tenantSatisfaction + 
            Object.values(this.gameState.relationships).reduce((sum, val) => sum + val, 0)) / 2);
        
        if (this.elements.finalReputation) {
            this.elements.finalReputation.textContent = reputation;
        }
        
        if (this.elements.resultOverlay) {
            this.elements.resultOverlay.classList.add('active');
        }
    }

    /**
     * 重新开始场景
     */
    restartScenario() {
        // 隐藏结果显示
        if (this.elements.resultOverlay) {
            this.elements.resultOverlay.classList.remove('active');
        }
        
        // 重置游戏状态
        this.resetGameState();
        
        // 加载起始节点
        this.loadNode(this.currentScenario.startNode || Object.keys(this.currentScenario.nodes)[0]);
    }
}

// 场景数据（实际项目中应该从外部加载）
const SCENARIO_DATA = {
    "EMERGENCY_ELEVATOR_REPAIR": {
        "id": "EMERGENCY_ELEVATOR_REPAIR",
        "title": "紧急电梯维修危机",
        "startNode": "ELEVATOR_FAILURE_START",
        "nodes": {
            "ELEVATOR_FAILURE_START": {
                "text": "周一早高峰时段，电梯突然停止运行。多位租户被困在电梯内，其他人则无法上下楼。王师傅迅速赶到现场，对你说："电梯控制系统出现严重故障，需要立即处理。我们有几种选择，但都各有利弊。"",
                "image": "assets/images/characters/staff_technician_wang_worried.png",
                "location_image": "assets/images/locations/elevator_malfunction.png",
                "speaker": "王师傅",
                "choices": [
                    {
                        "text": "立即请专业电梯公司紧急维修（成本高但速度快）",
                        "effects": {
                            "financialHealth": -100,
                            "tenantSatisfaction": 5,
                            "relationship_STAFF_TECHNICIAN_WANG": -1
                        },
                        "nextNode": "PROFESSIONAL_REPAIR"
                    },
                    {
                        "text": "让王师傅和内部团队尝试修复（成本低但可能需要更长时间）",
                        "effects": {
                            "financialHealth": -30,
                            "tenantSatisfaction": -5,
                            "relationship_STAFF_TECHNICIAN_WANG": 3
                        },
                        "nextNode": "INTERNAL_REPAIR_ATTEMPT"
                    },
                    {
                        "text": "临时关闭电梯，等到非高峰时段再维修（最省钱但会严重影响租户）",
                        "effects": {
                            "financialHealth": -20,
                            "tenantSatisfaction": -15,
                            "flag": "DELAYED_MAINTENANCE"
                        },
                        "nextNode": "DELAYED_REPAIR"
                    }
                ]
            },
            "PROFESSIONAL_REPAIR": {
                "text": "你联系了专业电梯维修公司，他们派遣技术团队紧急处理。四小时后，电梯恢复运行。刘奶奶向你表示感谢："谢谢你这么快解决问题，对我们老年人来说爬楼梯很困难。"虽然花费不菲，但租户们对快速响应感到满意。",
                "image": "assets/images/characters/tenant_happy_elderly.png",
                "location_image": "assets/images/locations/elevator_repair.png",
                "speaker": "刘奶奶",
                "effects": {
                    "relationship_NPC_ELDERLY_LIU": 3
                },
                "choices": [
                    {
                        "text": "讨论进一步升级电梯系统的可能性",
                        "nextNode": "DISCUSS_UPGRADE"
                    },
                    {
                        "text": "开始制定预防性维护计划",
                        "nextNode": "PREVENTIVE_MAINTENANCE"
                    }
                ]
            },
            "INTERNAL_REPAIR_ATTEMPT": {
                "text": "王师傅和他的团队开始维修工作。虽然他们尽力而为，但故障比预期更复杂。八小时后，电梯终于恢复运行。期间，一些租户表达了不满，特别是吴家的孩子和刘奶奶。",
                "image": "assets/images/characters/staff_technician_wang_working.png",
                "location_image": "assets/images/locations/elevator_repair_internal.png",
                "speaker": "旁白",
                "effects": {
                    "relationship_NPC_ELDERLY_LIU": -2,
                    "relationship_NPC_YOUNG_FAMILY_WU": -1
                },
                "choices": [
                    {
                        "text": "向租户道歉并提供小补偿（如减免当月物业费）",
                        "effects": {
                            "financialHealth": -30,
                            "tenantSatisfaction": 5
                        },
                        "nextNode": "APOLOGIZE_COMPENSATE"
                    },
                    {
                        "text": "向租户解释内部维修如何节省长期成本",
                        "nextNode": "EXPLAIN_COST_SAVING"
                    }
                ]
            },
            "DELAYED_REPAIR": {
                "text": "你决定暂时关闭电梯，等到晚上人流减少时再进行维修。这一决定引起了强烈不满，多位租户向你投诉。刘奶奶特别失望："我膝盖不好，没有电梯几乎无法出门。"吴家的孩子们因为上学迟到而父母非常生气。",
                "image": "assets/images/characters/tenants_upset.png",
                "location_image": "assets/images/locations/elevator_out_of_service.png",
                "speaker": "刘奶奶",
                "effects": {
                    "relationship_NPC_ELDERLY_LIU": -5,
                    "relationship_NPC_YOUNG_FAMILY_WU": -4
                },
                "choices": [
                    {
                        "text": "认识到错误并立即联系专业维修",
                        "effects": {
                            "financialHealth": -100,
                            "tenantSatisfaction": -5
                        },
                        "nextNode": "CORRECT_MISTAKE"
                    },
                    {
                        "text": "坚持原计划，晚上进行维修",
                        "effects": {
                            "tenantSatisfaction": -10
                        },
                        "nextNode": "STICK_TO_PLAN"
                    }
                ]
            },
            "DISCUSS_UPGRADE": {
                "text": "你与电梯维修公司的专家讨论了升级电梯系统的可能性。他们提供了几种方案，从基本维护到全面更换。在讨论过程中，你考虑到租户的需求、安全性和长期财务影响。",
                "image": "assets/images/characters/elevator_specialist.png",
                "location_image": "assets/images/locations/property_office.png",
                "speaker": "电梯专家",
                "choices": [
                    {
                        "text": "选择全面更换电梯系统（提高安全性和现代化）",
                        "effects": {
                            "financialHealth": -500,
                            "tenantSatisfaction": 15,
                            "buildingCondition": 20
                        },
                        "nextNode": "COMPLETE_REPLACEMENT"
                    },
                    {
                        "text": "进行部分升级（平衡成本和效益）",
                        "effects": {
                            "financialHealth": -250,
                            "tenantSatisfaction": 8,
                            "buildingCondition": 10
                        },
                        "nextNode": "PARTIAL_UPGRADE"
                    }
                ]
            },
            "COMPLETE_REPLACEMENT": {
                "text": "你决定投资全面更换电梯系统。新电梯不仅更快、更安静，还提高了能源效率。租户们对这一改进非常满意，特别是刘奶奶："新电梯太棒了，感谢物业的用心。"",
                "image": "assets/images/characters/tenant_happy_elderly.png",
                "location_image": "assets/images/locations/new_elevator.png",
                "speaker": "刘奶奶",
                "effects": {
                    "tenantSatisfaction": 15,
                    "relationship_NPC_ELDERLY_LIU": 5,
                    "relationship_NPC_YOUNG_FAMILY_WU": 3
                },
                "endsScenario": true,
                "endText": "场景结束：你通过全面更换电梯系统彻底解决了问题，提高了物业价值和租户满意度，尽管花费了大量资金。这一决策体现了你对长期物业发展的重视。"
            }
            // 其他节点数据...
        }
    }
    // 其他场景数据...
};

// 创建全局场景管理器实例
const scenarioManager = new ScenarioManager();

// 当文档加载完成时初始化
document.addEventListener('DOMContentLoaded', function() {
    // 初始化场景管理器
    scenarioManager.init();
    
    // 从URL获取场景ID
    const urlParams = new URLSearchParams(window.location.search);
    const scenarioId = urlParams.get('id') || 'EMERGENCY_ELEVATOR_REPAIR';
    
    // 显示页面过渡动画
    setTimeout(() => {
        document.querySelector('.page-transition').classList.add('exit');
    }, 500);
    
    // 加载场景
    scenarioManager.loadScenario(scenarioId);
}); 