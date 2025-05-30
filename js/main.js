document.addEventListener('DOMContentLoaded', () => {
    // 初始化QTE系统
    const qteSystem = new QTESystem();
    
    // 游戏状态变量
    let currentScenario;
    let currentNodeId;
    let scenariosData;
    let activeQTE = false; // 标记QTE是否激活
    
    // 初始游戏状态
    let gameState = {
        metrics: {
            tenantSatisfaction: 70,
            managerStress: 10,
            buildingCondition: 80,
            financialHealth: 5000
        },
        relationshipScores: {}, // 例如: { "NPC_MRS_DAVIS": 0, "NPC_TENANT_LEAKY_SINK": 0 }
        storyFlags: {}  // 故事标记系统，用于跟踪游戏进程和条件分支
    };
    
    // UI元素
    const scenarioTextElement = document.getElementById('scenario-text');
    const feedbackTextElement = document.getElementById('feedback-text');
    const scenarioImageElement = document.getElementById('scenario-image');
    const locationImageElement = document.getElementById('location-image');
    const choicesAreaElement = document.getElementById('choices-area');
    const npcRelationshipDisplay = document.getElementById('npc-relationship-display');
    const npcNameElement = document.getElementById('npc-name');
    const npcRelationshipScore = document.getElementById('npc-relationship-score');
    const npcRelationshipFill = npcRelationshipDisplay.querySelector('.relationship-fill');
    const storyFlagsDisplay = document.getElementById('story-flags-display');
    const storyFlagsList = document.getElementById('story-flags-list');
    
    // 指标元素
    const metricsElements = {
        tenantSatisfaction: document.getElementById('tenantSatisfaction'),
        managerStress: document.getElementById('managerStress'),
        buildingCondition: document.getElementById('buildingCondition'),
        financialHealth: document.getElementById('financialHealth')
    };
    
    // 加载场景数据
    async function loadScenarioData() {
        try {
            // 从URL参数获取场景ID
            const urlParams = new URLSearchParams(window.location.search);
            const scenarioId = urlParams.get('id') || 'PROPERTY_FLOOD_EMERGENCY'; // 默认场景
            
            // 加载场景数据
            const response = await fetch(`data/${scenarioId.toLowerCase()}.json`);
            if (!response.ok) {
                // 如果特定场景不存在，尝试从演示场景加载
                const demoResponse = await fetch('data/demo_scenario_with_qte.json');
                if (!demoResponse.ok) {
                    throw new Error('无法加载任何场景数据');
                }
                currentScenario = await demoResponse.json();
            } else {
                currentScenario = await response.json();
            }
            
            // 初始化游戏状态
            if (currentScenario.initialState) {
                gameState.metrics = {...currentScenario.initialState};
            }
            
            // 初始化NPC关系
            if (currentScenario.involvedNPCs && currentScenario.involvedNPCs.length > 0) {
                currentScenario.involvedNPCs.forEach(npcId => {
                    gameState.relationshipScores[npcId] = 0;
                });
            }
            
            // 开始场景
            startScenario();
        } catch (error) {
            console.error('加载场景数据失败:', error);
            feedbackTextElement.textContent = '加载场景数据失败，请重试';
        }
    }
    
    // 开始场景
    function startScenario() {
        // 更新页面标题
        document.title = `物业管理模拟器 - ${currentScenario.title}`;
        
        // 更新指标显示
        updateMetricsDisplay();
        
        // 加载起始节点
        loadNode(currentScenario.startNode);
    }
    
    // 加载节点
    function loadNode(nodeId) {
        // 清除之前的选择
        choicesAreaElement.innerHTML = '';
        
        // 获取当前节点
        currentNodeId = nodeId;
        const node = currentScenario.nodes[nodeId];
        
        if (!node) {
            console.error(`节点不存在: ${nodeId}`);
            return;
        }
        
        // 更新节点内容
        updateNodeContent(node);
        
        // 检查故事标记条件
        if (node.storyFlagCondition && !checkStoryFlagCondition(node.storyFlagCondition)) {
            // 如果标记条件不满足，可以跳转到另一个节点或显示替代内容
            feedbackTextElement.textContent = "这个选择不可用，请选择其他选项";
            return;
        }
        
        // 应用节点效果
        if (node.effects) {
            applyEffects(node.effects);
        }
        
        // 设置故事标记
        if (node.storyFlagSet) {
            setStoryFlags(node.storyFlagSet);
        }
        
        // 检查是否有QTE
        if (node.hasQTE && node.qteData) {
            // 短暂延迟后启动QTE，给玩家时间阅读文本
            setTimeout(() => {
                startQTE(node.qteData);
            }, 2000);
        } else if (node.choices && node.choices.length > 0) {
            // 如果没有QTE但有选择，显示选择
            displayChoices(node.choices);
        } else if (node.endsScenario) {
            // 如果场景结束，显示结果
            endScenario(node.endResult);
        }
        
        // 更新故事标记显示（调试模式）
        updateStoryFlagsDisplay();
    }
    
    // 更新节点内容
    function updateNodeContent(node) {
        // 更新文本
        scenarioTextElement.textContent = node.text;
        
        // 更新图像（如果有）
        if (node.image) {
            scenarioImageElement.src = node.image;
            scenarioImageElement.style.opacity = 1;
        } else {
            scenarioImageElement.style.opacity = 0;
        }
        
        // 更新位置图像（如果有）
        if (node.locationImage) {
            locationImageElement.src = node.locationImage;
        }
        
        // 更新说话者（如果有）
        if (node.speaker) {
            const speakerNameElement = document.querySelector('.speaker-name');
            const speakerAvatarElement = document.querySelector('.speaker-avatar');
            
            if (speakerNameElement) {
                speakerNameElement.textContent = node.speaker;
            }
            
            // 更新说话者头像（如果有指定）
            if (node.speakerAvatar) {
                speakerAvatarElement.src = node.speakerAvatar;
            } else if (node.image && node.image.includes('characters')) {
                // 如果没有指定头像但有角色图像，可以使用角色图像
                speakerAvatarElement.src = node.image;
            }
        }
        
        // 更新NPC关系显示（如果相关）
        updateNPCRelationshipDisplay(node);
    }
    
    // 显示选择
    function displayChoices(choices) {
        choices.forEach(choice => {
            // 检查此选择是否有故事标记条件
            if (choice.storyFlagCondition && !checkStoryFlagCondition(choice.storyFlagCondition)) {
                // 跳过不满足条件的选择
                return;
            }
            
            const button = document.createElement('button');
            button.className = 'choice-button';
            button.textContent = choice.text;
            
            // 添加高亮效果元素
            const highlight = document.createElement('div');
            highlight.className = 'choice-highlight';
            button.appendChild(highlight);
            
            // 如果选择有效果，显示效果提示
            if (choice.effects) {
                const effectsDiv = document.createElement('div');
                effectsDiv.className = 'choice-effects';
                
                Object.entries(choice.effects).forEach(([key, value]) => {
                    const effectSpan = document.createElement('span');
                    
                    // 确定效果类型（正面/负面/中性）
                    let effectClass = 'neutral';
                    if (value > 0) effectClass = 'positive';
                    else if (value < 0) effectClass = 'negative';
                    
                    effectSpan.className = `choice-effect ${effectClass}`;
                    
                    // 处理特殊键名（如关系分数）
                    let displayKey = key;
                    if (key.startsWith('relationship_')) {
                        const npcId = key.replace('relationship_', '');
                        displayKey = `与${getNPCName(npcId)}关系`;
                    }
                    
                    // 设置效果文本
                    effectSpan.textContent = `${displayKey}: ${value > 0 ? '+' : ''}${value}`;
                    effectsDiv.appendChild(effectSpan);
                });
                
                button.appendChild(effectsDiv);
            }
            
            // 添加点击事件
            button.addEventListener('click', () => {
                // 应用效果
                if (choice.effects) {
                    applyEffects(choice.effects);
                }
                
                // 设置故事标记
                if (choice.storyFlagSet) {
                    setStoryFlags(choice.storyFlagSet);
                }
                
                // 加载下一个节点
                loadNode(choice.nextNode);
            });
            
            choicesAreaElement.appendChild(button);
        });
    }
    
    // 应用效果到游戏状态
    function applyEffects(effects) {
        Object.entries(effects).forEach(([key, value]) => {
            if (key.startsWith('relationship_')) {
                // 处理NPC关系效果
                const npcId = key.replace('relationship_', '');
                if (gameState.relationshipScores[npcId] === undefined) {
                    gameState.relationshipScores[npcId] = 0;
                }
                gameState.relationshipScores[npcId] += value;
                
                // 更新关系显示（如果当前显示的是该NPC）
                if (npcRelationshipDisplay.style.display !== 'none' && 
                    npcNameElement.textContent === getNPCName(npcId)) {
                    updateNPCRelationshipDisplay({ speaker: getNPCName(npcId) });
                }
            } else {
                // 处理指标效果
                if (gameState.metrics[key] !== undefined) {
                    gameState.metrics[key] += value;
                    
                    // 更新显示
                    updateMetricsDisplay();
                }
            }
        });
    }
    
    // 更新指标显示
    function updateMetricsDisplay() {
        Object.entries(gameState.metrics).forEach(([key, value]) => {
            const element = metricsElements[key];
            if (element) {
                element.textContent = value;
                
                // 添加动画效果
                element.classList.add('update-pulse');
                setTimeout(() => element.classList.remove('update-pulse'), 500);
            }
        });
    }
    
    // 更新NPC关系显示
    function updateNPCRelationshipDisplay(node) {
        if (!node.speaker || node.speaker === '旁白' || node.speaker === '你') {
            // 如果没有说话者或是旁白/玩家，隐藏关系显示
            npcRelationshipDisplay.style.display = 'none';
            return;
        }
        
        // 查找当前说话者的NPC ID
        const npcId = findNPCIdByName(node.speaker);
        if (!npcId) {
            npcRelationshipDisplay.style.display = 'none';
            return;
        }
        
        // 显示并更新关系显示
        npcRelationshipDisplay.style.display = 'block';
        npcNameElement.textContent = node.speaker;
        
        const relationshipScore = gameState.relationshipScores[npcId] || 0;
        npcRelationshipScore.textContent = relationshipScore;
        
        // 计算关系条宽度（-10到+10范围映射到0-100%）
        const relationshipWidth = Math.min(Math.max((relationshipScore + 10) * 5, 0), 100);
        npcRelationshipFill.style.width = `${relationshipWidth}%`;
        
        // 根据关系值设置颜色
        if (relationshipScore > 5) {
            npcRelationshipFill.style.backgroundColor = 'var(--success-color)';
        } else if (relationshipScore < -5) {
            npcRelationshipFill.style.backgroundColor = 'var(--danger-color)';
        } else {
            npcRelationshipFill.style.backgroundColor = 'var(--warning-color)';
        }
    }
    
    // 设置故事标记
    function setStoryFlags(flags) {
        Object.entries(flags).forEach(([key, value]) => {
            gameState.storyFlags[key] = value;
        });
    }
    
    // 检查故事标记条件
    function checkStoryFlagCondition(conditions) {
        // 检查所有条件是否满足
        return Object.entries(conditions).every(([flagName, requiredValue]) => {
            return gameState.storyFlags[flagName] === requiredValue;
        });
    }
    
    // 更新故事标记显示（调试用）
    function updateStoryFlagsDisplay() {
        // 如果故事标记显示是隐藏的，不需要更新
        if (storyFlagsDisplay.style.display === 'none') return;
        
        // 清空当前列表
        storyFlagsList.innerHTML = '';
        
        // 添加所有故事标记
        Object.entries(gameState.storyFlags).forEach(([flagName, value]) => {
            const flagItem = document.createElement('div');
            flagItem.className = 'story-flag-item';
            
            const flagNameSpan = document.createElement('span');
            flagNameSpan.className = 'story-flag-name';
            flagNameSpan.textContent = flagName;
            
            const flagValueSpan = document.createElement('span');
            flagValueSpan.className = `story-flag-value ${value ? 'true' : 'false'}`;
            flagValueSpan.textContent = value ? '是' : '否';
            
            flagItem.appendChild(flagNameSpan);
            flagItem.appendChild(flagValueSpan);
            storyFlagsList.appendChild(flagItem);
        });
    }
    
    // 启动QTE
    function startQTE(qteData) {
        activeQTE = true;
        
        // 使用QTE系统启动QTE
        qteSystem.start(
            qteData,
            // 成功回调
            () => {
                activeQTE = false;
                feedbackTextElement.textContent = "成功!";
                feedbackTextElement.style.color = 'var(--success-color)';
                
                // 加载成功节点
                setTimeout(() => {
                    feedbackTextElement.textContent = "";
                    loadNode(qteData.successNode);
                }, 1500);
            },
            // 失败回调
            () => {
                activeQTE = false;
                feedbackTextElement.textContent = "失败!";
                feedbackTextElement.style.color = 'var(--danger-color)';
                
                // 加载失败节点
                setTimeout(() => {
                    feedbackTextElement.textContent = "";
                    loadNode(qteData.failureNode);
                }, 1500);
            }
        );
    }
    
    // 获取NPC名称
    function getNPCName(npcId) {
        // 简单的NPC ID到名称映射
        const npcNames = {
            'NPC_MAINTENANCE_ZHANG': '张师傅',
            'NPC_LUXURY_CAR_OWNER_LIN': '林先生',
            'NPC_ELDERLY_COUPLE_WANG': '王老夫妇'
            // 可以根据需要添加更多
        };
        
        return npcNames[npcId] || npcId;
    }
    
    // 根据名称查找NPC ID
    function findNPCIdByName(name) {
        // 简单的名称到NPC ID映射
        const nameToId = {
            '张师傅': 'NPC_MAINTENANCE_ZHANG',
            '林先生': 'NPC_LUXURY_CAR_OWNER_LIN',
            '王先生': 'NPC_ELDERLY_COUPLE_WANG',
            '王老夫妇': 'NPC_ELDERLY_COUPLE_WANG'
            // 可以根据需要添加更多
        };
        
        return nameToId[name];
    }
    
    // 结束场景
    function endScenario(endResult) {
        if (!endResult) return;
        
        // 显示结果消息
        feedbackTextElement.textContent = "场景结束!";
        feedbackTextElement.style.color = 'var(--primary-color)';
        
        // 创建结果显示
        const resultDiv = document.createElement('div');
        resultDiv.className = 'scenario-result';
        
        const resultTitle = document.createElement('h3');
        resultTitle.className = 'result-title';
        resultTitle.textContent = endResult.title || "完成";
        
        const resultDescription = document.createElement('p');
        resultDescription.className = 'result-description';
        resultDescription.textContent = endResult.description || "你已完成此场景。";
        
        resultDiv.appendChild(resultTitle);
        resultDiv.appendChild(resultDescription);
        
        // 添加指标变化
        if (endResult.metrics) {
            const metricsDiv = document.createElement('div');
            metricsDiv.className = 'result-metrics';
            
            Object.entries(endResult.metrics).forEach(([key, value]) => {
                const metricItem = document.createElement('div');
                metricItem.className = 'result-metric-item';
                
                const metricName = document.createElement('span');
                metricName.className = 'result-metric-name';
                metricName.textContent = key;
                
                const metricValue = document.createElement('span');
                metricValue.className = `result-metric-value ${value >= 0 ? 'positive' : 'negative'}`;
                metricValue.textContent = `${value >= 0 ? '+' : ''}${value}`;
                
                metricItem.appendChild(metricName);
                metricItem.appendChild(metricValue);
                metricsDiv.appendChild(metricItem);
            });
            
            resultDiv.appendChild(metricsDiv);
        }
        
        // 添加返回按钮
        const returnButton = document.createElement('button');
        returnButton.className = 'choice-button return-button';
        returnButton.textContent = "返回首页";
        returnButton.addEventListener('click', () => {
            window.location.href = "index.html";
        });
        
        // 添加重新开始按钮
        const restartButton = document.createElement('button');
        restartButton.className = 'choice-button restart-button';
        restartButton.textContent = "重新开始";
        restartButton.addEventListener('click', () => {
            // 重置游戏状态
            if (currentScenario.initialState) {
                gameState.metrics = {...currentScenario.initialState};
            } else {
                gameState.metrics = {
                    tenantSatisfaction: 70,
                    managerStress: 10,
                    buildingCondition: 80,
                    financialHealth: 5000
                };
            }
            gameState.relationshipScores = {};
            gameState.storyFlags = {};
            
            // 重新初始化NPC关系
            if (currentScenario.involvedNPCs && currentScenario.involvedNPCs.length > 0) {
                currentScenario.involvedNPCs.forEach(npcId => {
                    gameState.relationshipScores[npcId] = 0;
                });
            }
            
            // 更新显示
            updateMetricsDisplay();
            updateStoryFlagsDisplay();
            
            // 重新加载起始节点
            feedbackTextElement.textContent = "";
            loadNode(currentScenario.startNode);
        });
        
        const buttonContainer = document.createElement('div');
        buttonContainer.className = 'result-buttons';
        buttonContainer.appendChild(restartButton);
        buttonContainer.appendChild(returnButton);
        
        resultDiv.appendChild(buttonContainer);
        
        // 显示结果
        choicesAreaElement.innerHTML = '';
        choicesAreaElement.appendChild(resultDiv);
    }
    
    // 加载场景数据
    loadScenarioData();
});

// 游戏状态管理器类
class GameStateManager {
    constructor() {
        this.saveSlots = ['auto', 'slot1', 'slot2', 'slot3'];
        this.currentSlot = 'auto';
    }

    // 保存游戏状态
    saveGame(slotId = 'auto', playerName = '物业经理') {
        try {
            const saveData = {
                // 基础游戏状态
                metrics: {...gameState.metrics},
                relationshipScores: {...gameState.relationshipScores},
                storyFlags: {...gameState.storyFlags},
                
                // 当前进度
                currentScenarioId: currentScenario ? currentScenario.id : null,
                currentNodeId: currentNodeId,
                
                // 元数据
                playerName: playerName,
                timestamp: Date.now(),
                playTime: gameState.playTime || 0,
                version: '1.0.0',
                
                // 统计数据
                completedScenarios: gameState.completedScenarios || [],
                totalChoicesMade: gameState.totalChoicesMade || 0,
                qtesCompleted: gameState.qtesCompleted || 0,
                qtesSuccessful: gameState.qtesSuccessful || 0
            };
            
            localStorage.setItem(`propertyGame_${slotId}`, JSON.stringify(saveData));
            
            // 更新存档列表
            this.updateSaveSlotInfo(slotId, saveData);
            
            // 显示保存成功提示
            this.showSaveNotification('游戏已保存', 'success');
            
            return true;
        } catch (error) {
            console.error('保存游戏失败:', error);
            this.showSaveNotification('保存失败，请重试', 'error');
            return false;
        }
    }

    // 加载游戏状态
    loadGame(slotId = 'auto') {
        try {
            const saveDataStr = localStorage.getItem(`propertyGame_${slotId}`);
            if (!saveDataStr) {
                console.log('没有找到存档');
                return false;
            }
            
            const saveData = JSON.parse(saveDataStr);
            
            // 验证存档数据完整性
            if (!this.validateSaveData(saveData)) {
                console.error('存档数据损坏');
                this.showSaveNotification('存档数据损坏，无法加载', 'error');
                return false;
            }
            
            // 恢复游戏状态
            gameState.metrics = {...saveData.metrics};
            gameState.relationshipScores = {...saveData.relationshipScores};
            gameState.storyFlags = {...saveData.storyFlags};
            gameState.playTime = saveData.playTime || 0;
            gameState.completedScenarios = saveData.completedScenarios || [];
            gameState.totalChoicesMade = saveData.totalChoicesMade || 0;
            gameState.qtesCompleted = saveData.qtesCompleted || 0;
            gameState.qtesSuccessful = saveData.qtesSuccessful || 0;
            
            // 更新UI显示
            updateMetricsDisplay();
            updateRelationshipDisplay();
            updateStoryFlagsDisplay();
            
            // 如果有当前场景，加载它
            if (saveData.currentScenarioId && saveData.currentNodeId) {
                this.loadScenarioFromSave(saveData.currentScenarioId, saveData.currentNodeId);
            }
            
            this.showSaveNotification('游戏已加载', 'success');
            this.currentSlot = slotId;
            
            return true;
        } catch (error) {
            console.error('加载游戏失败:', error);
            this.showSaveNotification('加载失败，存档可能已损坏', 'error');
            return false;
        }
    }

    // 从存档加载特定场景
    async loadScenarioFromSave(scenarioId, nodeId) {
        try {
            // 加载场景数据
            const response = await fetch(`data/${scenarioId.toLowerCase()}.json`);
            if (!response.ok) {
                throw new Error(`无法加载场景: ${scenarioId}`);
            }
            
            currentScenario = await response.json();
            currentNodeId = nodeId;
            
            // 渲染当前节点
            renderNode(nodeId);
            
        } catch (error) {
            console.error('从存档加载场景失败:', error);
            // 如果加载失败，回到场景选择
            window.location.href = 'index.html';
        }
    }

    // 验证存档数据
    validateSaveData(saveData) {
        const requiredFields = ['metrics', 'relationshipScores', 'storyFlags', 'timestamp'];
        return requiredFields.every(field => saveData.hasOwnProperty(field));
    }

    // 删除存档
    deleteSave(slotId) {
        try {
            localStorage.removeItem(`propertyGame_${slotId}`);
            localStorage.removeItem(`propertyGameInfo_${slotId}`);
            this.showSaveNotification('存档已删除', 'success');
            return true;
        } catch (error) {
            console.error('删除存档失败:', error);
            this.showSaveNotification('删除失败', 'error');
            return false;
        }
    }

    // 获取所有存档信息
    getAllSaves() {
        const saves = {};
        this.saveSlots.forEach(slotId => {
            const saveData = localStorage.getItem(`propertyGame_${slotId}`);
            if (saveData) {
                try {
                    const parsed = JSON.parse(saveData);
                    saves[slotId] = {
                        playerName: parsed.playerName || '物业经理',
                        timestamp: parsed.timestamp,
                        playTime: parsed.playTime || 0,
                        currentScenario: parsed.currentScenarioId,
                        progress: this.calculateProgress(parsed)
                    };
                } catch (error) {
                    console.error(`解析存档 ${slotId} 失败:`, error);
                }
            }
        });
        return saves;
    }

    // 计算游戏进度
    calculateProgress(saveData) {
        const completedScenarios = saveData.completedScenarios || [];
        const totalScenarios = 8; // 预计总场景数
        return Math.round((completedScenarios.length / totalScenarios) * 100);
    }

    // 更新存档槽位信息
    updateSaveSlotInfo(slotId, saveData) {
        const slotInfo = {
            playerName: saveData.playerName,
            timestamp: saveData.timestamp,
            playTime: saveData.playTime,
            currentScenario: saveData.currentScenarioId,
            progress: this.calculateProgress(saveData)
        };
        localStorage.setItem(`propertyGameInfo_${slotId}`, JSON.stringify(slotInfo));
    }

    // 显示保存/加载通知
    showSaveNotification(message, type = 'info') {
        // 创建通知元素
        const notification = document.createElement('div');
        notification.className = `save-notification ${type}`;
        notification.textContent = message;
        
        // 添加样式
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 12px 20px;
            border-radius: 6px;
            color: white;
            font-weight: bold;
            z-index: 1000;
            opacity: 0;
            transform: translateX(100%);
            transition: all 0.3s ease;
        `;
        
        // 根据类型设置颜色
        switch (type) {
            case 'success':
                notification.style.backgroundColor = '#27AE60';
                break;
            case 'error':
                notification.style.backgroundColor = '#E74C3C';
                break;
            default:
                notification.style.backgroundColor = '#3498DB';
        }
        
        document.body.appendChild(notification);
        
        // 显示动画
        setTimeout(() => {
            notification.style.opacity = '1';
            notification.style.transform = 'translateX(0)';
        }, 100);
        
        // 自动隐藏
        setTimeout(() => {
            notification.style.opacity = '0';
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 3000);
    }

    // 自动保存
    autoSave() {
        this.saveGame('auto');
    }

    // 快速保存（快捷键）
    quickSave() {
        this.saveGame(this.currentSlot || 'slot1');
    }

    // 快速加载（快捷键）
    quickLoad() {
        this.loadGame(this.currentSlot || 'auto');
    }
}

// 创建游戏状态管理器实例
const gameStateManager = new GameStateManager();

// 在gameState中添加新的属性
gameState.playTime = 0;
gameState.completedScenarios = [];
gameState.totalChoicesMade = 0;
gameState.qtesCompleted = 0;
gameState.qtesSuccessful = 0;