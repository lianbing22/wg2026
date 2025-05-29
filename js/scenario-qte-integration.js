/**
 * 物业管理模拟器 - 场景QTE系统集成
 * 此文件展示如何在游戏场景中集成增强型QTE系统
 */

class ScenarioQTEManager {
    constructor() {
        // 初始化增强型QTE系统
        this.qteSystem = new EnhancedQTESystem();
        
        // 注册场景系统中的QTE处理器
        this.registerQTEHandlers();
        
        // 初始化难度设置 (可以从玩家配置或游戏进度加载)
        this.initializeDifficulty();
    }
    
    /**
     * 初始化QTE难度设置
     */
    initializeDifficulty() {
        // 从本地存储加载难度设置，或使用默认值
        const savedDifficulty = localStorage.getItem('qte_difficulty_level');
        this.qteSystem.difficultyLevel = savedDifficulty ? parseInt(savedDifficulty) : 3;
        
        // 记录玩家的QTE成功历史以进行难度调整
        const savedSuccessRate = localStorage.getItem('qte_success_rate');
        if (savedSuccessRate) {
            this.qteSystem.playerSuccessRate = parseFloat(savedSuccessRate);
        }
    }
    
    /**
     * 保存QTE难度设置到本地存储
     */
    saveDifficultySettings() {
        localStorage.setItem('qte_difficulty_level', this.qteSystem.difficultyLevel);
        localStorage.setItem('qte_success_rate', this.qteSystem.playerSuccessRate);
    }
    
    /**
     * 注册QTE处理器到场景系统
     */
    registerQTEHandlers() {
        // 如果游戏有事件系统，在此处注册QTE事件处理
        if (window.EventSystem) {
            window.EventSystem.on('scenario:qte_triggered', this.handleQTETrigger.bind(this));
        }
        
        // 在场景节点上附加QTE触发器
        this.attachQTETriggers();
    }
    
    /**
     * 在场景节点上附加QTE触发器
     */
    attachQTETriggers() {
        // 查找场景中的所有QTE触发点
        const qteTriggerElements = document.querySelectorAll('[data-qte-trigger]');
        
        qteTriggerElements.forEach(element => {
            element.addEventListener('click', (event) => {
                // 获取QTE配置信息
                const qteType = element.dataset.qteType || 'StopTheMovingBar';
                const qteConfig = this.getQTEConfigFromElement(element);
                
                // 触发QTE
                this.triggerQTE(qteType, qteConfig);
                
                // 阻止事件冒泡，避免触发其他点击事件
                event.stopPropagation();
            });
        });
    }
    
    /**
     * 从元素属性中提取QTE配置
     * @param {Element} element - 带有QTE数据属性的DOM元素
     * @returns {Object} QTE配置对象
     */
    getQTEConfigFromElement(element) {
        const config = {
            instructionText: element.dataset.qteInstruction || "完成时间事件!"
        };
        
        // 提取参数
        const parameters = {};
        
        // 通用参数
        if (element.dataset.qteTimeLimit) {
            parameters.timeLimit = parseInt(element.dataset.qteTimeLimit);
        }
        
        // 根据QTE类型提取特定参数
        switch (element.dataset.qteType) {
            case 'StopTheMovingBar':
                if (element.dataset.qteTargetStart) {
                    parameters.targetZoneStart = parseInt(element.dataset.qteTargetStart);
                }
                if (element.dataset.qteTargetEnd) {
                    parameters.targetZoneEnd = parseInt(element.dataset.qteTargetEnd);
                }
                if (element.dataset.qteBarSpeed) {
                    parameters.barSpeed = parseInt(element.dataset.qteBarSpeed);
                }
                break;
                
            case 'ButtonMash':
                if (element.dataset.qteTargetClicks) {
                    parameters.targetClicks = parseInt(element.dataset.qteTargetClicks);
                }
                break;
                
            case 'ClickSequence':
                // 处理序列数据 (通常来自JSON数据)
                const sequenceId = element.dataset.qteSequenceId;
                if (sequenceId && window.gameData && window.gameData.qteSequences) {
                    parameters.sequence = window.gameData.qteSequences[sequenceId];
                }
                break;
        }
        
        config.parameters = parameters;
        return config;
    }
    
    /**
     * 处理QTE触发事件
     * @param {Object} data - QTE触发数据
     */
    handleQTETrigger(data) {
        if (!data || !data.type) return;
        
        this.triggerQTE(data.type, data.config, data.onSuccess, data.onFailure);
    }
    
    /**
     * 触发QTE事件
     * @param {string} type - QTE类型
     * @param {Object} config - QTE配置
     * @param {Function} onSuccess - 成功回调
     * @param {Function} onFailure - 失败回调
     */
    triggerQTE(type, config, onSuccess, onFailure) {
        // 准备QTE数据
        const qteData = {
            type: type,
            instructionText: config.instructionText || "完成时间事件!",
            parameters: config.parameters || {}
        };
        
        // 默认回调函数
        const defaultSuccess = () => {
            this.handleQTESuccess(type, config);
        };
        
        const defaultFailure = () => {
            this.handleQTEFailure(type, config);
        };
        
        // 启动QTE
        this.qteSystem.start(
            qteData,
            onSuccess || defaultSuccess,
            onFailure || defaultFailure
        );
    }
    
    /**
     * 处理QTE成功
     * @param {string} type - QTE类型
     * @param {Object} config - QTE配置
     */
    handleQTESuccess(type, config) {
        console.log(`QTE成功: ${type}`);
        
        // 保存更新后的难度设置
        this.saveDifficultySettings();
        
        // 如果有场景系统，更新场景状态
        if (window.ScenarioSystem) {
            // 根据QTE类型和配置应用不同的场景效果
            switch (type) {
                case 'StopTheMovingBar':
                    // 例如：解决紧急维修问题
                    window.ScenarioSystem.updateState({
                        action: 'RESOLVE_EMERGENCY',
                        success: true,
                        effectType: config.effectType || 'MAINTENANCE'
                    });
                    break;
                    
                case 'ButtonMash':
                    // 例如：成功说服租户
                    window.ScenarioSystem.updateState({
                        action: 'PERSUADE_TENANT',
                        success: true,
                        relationshipChange: config.relationshipChange || 10
                    });
                    break;
                    
                case 'ClickSequence':
                    // 例如：成功完成复杂任务
                    window.ScenarioSystem.updateState({
                        action: 'COMPLETE_COMPLEX_TASK',
                        success: true,
                        reputationChange: config.reputationChange || 5
                    });
                    break;
            }
            
            // 通知场景系统QTE完成
            window.ScenarioSystem.notifyQTEComplete(true, type, config);
        }
        
        // 播放成功动画或音效 (如果QTE系统之外还需要额外效果)
        this.playSuccessEffects(config.successEffects);
    }
    
    /**
     * 处理QTE失败
     * @param {string} type - QTE类型
     * @param {Object} config - QTE配置
     */
    handleQTEFailure(type, config) {
        console.log(`QTE失败: ${type}`);
        
        // 保存更新后的难度设置
        this.saveDifficultySettings();
        
        // 如果有场景系统，更新场景状态
        if (window.ScenarioSystem) {
            // 根据QTE类型和配置应用不同的场景效果
            switch (type) {
                case 'StopTheMovingBar':
                    // 例如：紧急维修失败
                    window.ScenarioSystem.updateState({
                        action: 'RESOLVE_EMERGENCY',
                        success: false,
                        damageLevel: config.damageLevel || 'MEDIUM'
                    });
                    break;
                    
                case 'ButtonMash':
                    // 例如：说服租户失败
                    window.ScenarioSystem.updateState({
                        action: 'PERSUADE_TENANT',
                        success: false,
                        relationshipChange: config.failureRelationshipChange || -5
                    });
                    break;
                    
                case 'ClickSequence':
                    // 例如：复杂任务失败
                    window.ScenarioSystem.updateState({
                        action: 'COMPLETE_COMPLEX_TASK',
                        success: false,
                        reputationChange: config.failureReputationChange || -3
                    });
                    break;
            }
            
            // 通知场景系统QTE完成
            window.ScenarioSystem.notifyQTEComplete(false, type, config);
        }
        
        // 播放失败动画或音效 (如果QTE系统之外还需要额外效果)
        this.playFailureEffects(config.failureEffects);
    }
    
    /**
     * 播放成功效果
     * @param {Object} effectsConfig - 效果配置
     */
    playSuccessEffects(effectsConfig = {}) {
        if (!effectsConfig) return;
        
        // 播放角色动画
        if (effectsConfig.characterAnimation) {
            this.playCharacterAnimation(effectsConfig.characterAnimation);
        }
        
        // 显示成功通知
        if (effectsConfig.notification) {
            this.showNotification(effectsConfig.notification, 'success');
        }
        
        // 更新UI元素
        if (effectsConfig.updateUI) {
            this.updateUIElements(effectsConfig.updateUI);
        }
    }
    
    /**
     * 播放失败效果
     * @param {Object} effectsConfig - 效果配置
     */
    playFailureEffects(effectsConfig = {}) {
        if (!effectsConfig) return;
        
        // 播放角色动画
        if (effectsConfig.characterAnimation) {
            this.playCharacterAnimation(effectsConfig.characterAnimation);
        }
        
        // 显示失败通知
        if (effectsConfig.notification) {
            this.showNotification(effectsConfig.notification, 'failure');
        }
        
        // 更新UI元素
        if (effectsConfig.updateUI) {
            this.updateUIElements(effectsConfig.updateUI);
        }
    }
    
    /**
     * 播放角色动画
     * @param {string} animationId - 动画ID
     */
    playCharacterAnimation(animationId) {
        const characters = document.querySelectorAll('.character');
        characters.forEach(character => {
            // 隐藏所有表情/状态
            const moods = character.querySelectorAll('.character-mood');
            moods.forEach(mood => mood.classList.add('hidden'));
            
            // 显示指定的表情/状态
            const targetMood = character.querySelector(`.character-mood[data-mood="${animationId}"]`);
            if (targetMood) {
                targetMood.classList.remove('hidden');
            }
        });
    }
    
    /**
     * 显示通知
     * @param {string} message - 通知消息
     * @param {string} type - 通知类型 (success/failure)
     */
    showNotification(message, type) {
        // 检查通知容器是否存在
        let notificationContainer = document.querySelector('.notification-container');
        if (!notificationContainer) {
            notificationContainer = document.createElement('div');
            notificationContainer.className = 'notification-container';
            document.body.appendChild(notificationContainer);
        }
        
        // 创建通知元素
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <div class="notification-icon">${type === 'success' ? '✓' : '✗'}</div>
                <div class="notification-text">${message}</div>
            </div>
        `;
        
        // 添加到容器
        notificationContainer.appendChild(notification);
        
        // 显示通知
        setTimeout(() => notification.classList.add('show'), 10);
        
        // 设置自动移除
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => notification.remove(), 300);
        }, 5000);
    }
    
    /**
     * 更新UI元素
     * @param {Object} updateConfig - 更新配置
     */
    updateUIElements(updateConfig) {
        if (!updateConfig) return;
        
        // 更新进度条
        if (updateConfig.progressBars) {
            Object.keys(updateConfig.progressBars).forEach(progressId => {
                const progressBar = document.querySelector(`.progress-bar[data-id="${progressId}"] .progress-fill`);
                if (progressBar) {
                    const value = updateConfig.progressBars[progressId];
                    progressBar.style.width = `${value}%`;
                    
                    // 更新颜色
                    progressBar.classList.remove('positive', 'negative', 'neutral');
                    if (value > 66) {
                        progressBar.classList.add('positive');
                    } else if (value < 33) {
                        progressBar.classList.add('negative');
                    } else {
                        progressBar.classList.add('neutral');
                    }
                }
            });
        }
        
        // 更新状态指示器
        if (updateConfig.statusIndicators) {
            Object.keys(updateConfig.statusIndicators).forEach(statusId => {
                const statusIndicator = document.querySelector(`.status-indicator[data-id="${statusId}"]`);
                if (statusIndicator) {
                    const status = updateConfig.statusIndicators[statusId];
                    
                    statusIndicator.classList.remove('positive', 'negative', 'neutral');
                    statusIndicator.classList.add(status);
                }
            });
        }
        
        // 更新文本元素
        if (updateConfig.textElements) {
            Object.keys(updateConfig.textElements).forEach(textId => {
                const textElement = document.querySelector(`[data-text-id="${textId}"]`);
                if (textElement) {
                    textElement.textContent = updateConfig.textElements[textId];
                }
            });
        }
    }
}

// 当文档加载完成后初始化
document.addEventListener('DOMContentLoaded', function() {
    // 如果在场景页面，初始化场景QTE管理器
    if (document.querySelector('.scenario-container')) {
        window.scenarioQTEManager = new ScenarioQTEManager();
    }
}); 