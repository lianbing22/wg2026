/**
 * 物业管理模拟器 - 增强型QTE (Quick Time Event) 系统
 * 支持多种QTE类型：停止移动条、连续按钮点击、图像点击序列
 * 新增功能：音效系统、视觉反馈效果、动态难度调整、屏幕震动效果
 */

class EnhancedQTESystem {
    constructor() {
        // QTE容器元素
        this.container = document.getElementById('qte-container');
        this.instructionTextElement = document.getElementById('qte-instruction-text');
        this.contentArea = document.getElementById('qte-content-area');
        
        // QTE状态
        this.isActive = false;
        this.currentConfig = null;
        this.animationId = null;
        
        // 内存泄漏防护
        this.activeTimers = [];
        this.activeEventListeners = [];
        
        // 对外暴露的回调函数
        this.onSuccess = null;
        this.onFailure = null;
        
        // 音效系统初始化
        this.initializeSoundSystem();
        
        // 动态难度相关
        this.difficultyLevel = 1; // 1-5, 默认中等难度
        this.playerSuccessRate = 0.5; // 0-1, 默认50%成功率
        this.lastResults = []; // 记录最近的结果用于动态调整
        
        // 绑定方法的this
        this.stopMovingBarQTE = this.stopMovingBarQTE.bind(this);
        this.buttonMashQTE = this.buttonMashQTE.bind(this);
        this.clickSequenceQTE = this.clickSequenceQTE.bind(this);
    }
    
    /**
     * 初始化音效系统
     */
    initializeSoundSystem() {
        // 使用Howler.js库(如果已加载)或者原生Audio API
        this.sounds = {
            success: null,
            failure: null,
            click: null,
            countdown: null,
            tick: null
        };
        
        try {
            if (window.Howl) {
                // 使用Howler.js
                this.sounds.success = new Howl({
                    src: ['assets/sounds/qte_success.mp3'],
                    volume: 0.7
                });
                
                this.sounds.failure = new Howl({
                    src: ['assets/sounds/qte_failure.mp3'],
                    volume: 0.7
                });
                
                this.sounds.click = new Howl({
                    src: ['assets/sounds/qte_click.mp3'],
                    volume: 0.5
                });
                
                this.sounds.countdown = new Howl({
                    src: ['assets/sounds/qte_countdown.mp3'],
                    volume: 0.6
                });
                
                this.sounds.tick = new Howl({
                    src: ['assets/sounds/qte_tick.mp3'],
                    volume: 0.3
                });
            } else {
                // 降级到原生Audio API
                this.sounds.success = new Audio('assets/sounds/qte_success.mp3');
                this.sounds.failure = new Audio('assets/sounds/qte_failure.mp3');
                this.sounds.click = new Audio('assets/sounds/qte_click.mp3');
                this.sounds.countdown = new Audio('assets/sounds/qte_countdown.mp3');
                this.sounds.tick = new Audio('assets/sounds/qte_tick.mp3');
            }
        } catch (e) {
            console.warn('QTE音效系统初始化失败:', e);
        }
    }
    
    /**
     * 播放音效
     * @param {string} soundName - 音效名称
     */
    playSound(soundName) {
        try {
            const sound = this.sounds[soundName];
            if (!sound) return;
            
            if (typeof sound.play === 'function') {
                sound.play();
            }
        } catch (e) {
            console.warn('播放音效失败:', e);
        }
    }
    
    /**
     * 启动QTE
     * @param {Object} qteData - QTE配置数据
     * @param {Function} onSuccess - 成功时的回调
     * @param {Function} onFailure - 失败时的回调
     */
    start(qteData, onSuccess, onFailure) {
        if (this.isActive) {
            this.end(false);  // 如果有正在进行的QTE，终止它
        }
        
        this.isActive = true;
        this.currentConfig = this.applyDynamicDifficulty(qteData);
        this.onSuccess = onSuccess;
        this.onFailure = onFailure;
        
        // 清空QTE内容区域
        this.contentArea.innerHTML = '';
        
        // 设置指导文本
        this.instructionTextElement.textContent = this.currentConfig.instructionText || "完成时间事件!";
        
        // 显示QTE容器并添加动画效果
        this.container.style.display = 'block';
        this.container.style.animation = 'qte-appear 0.3s ease-out forwards';
        
        // 添加countdown动画和音效
        this.addCountdownEffect();
        
        // 根据QTE类型启动相应功能
        this.addTimer(setTimeout(() => {
            switch (this.currentConfig.type) {
                case "StopTheMovingBar":
                    this.stopMovingBarQTE(this.currentConfig);
                    break;
                case "ButtonMash":
                    this.buttonMashQTE(this.currentConfig);
                    break;
                case "ClickSequence":
                    this.clickSequenceQTE(this.currentConfig);
                    break;
                default:
                    console.error("未知的QTE类型:", this.currentConfig.type);
                    this.end(false);
                    break;
            }
        }, 1000)); // 倒计时后开始QTE
    }
    
    /**
     * 应用动态难度调整
     * @param {Object} qteData - 原始QTE配置
     * @returns {Object} 调整后的QTE配置
     */
    applyDynamicDifficulty(qteData) {
        // 克隆配置以避免修改原始数据
        const adjustedData = JSON.parse(JSON.stringify(qteData));
        
        // 根据难度级别调整各种参数
        switch (adjustedData.type) {
            case "StopTheMovingBar":
                // 调整目标区域大小和移动条速度
                if (adjustedData.parameters) {
                    const difficultyFactor = 1 - (this.difficultyLevel - 1) * 0.1; // 难度5时为0.6，难度1时为1.0
                    const baseWidth = adjustedData.parameters.targetZoneEnd - adjustedData.parameters.targetZoneStart;
                    const newWidth = Math.max(10, Math.round(baseWidth * difficultyFactor));
                    
                    // 保持中心点不变，调整宽度
                    const center = (adjustedData.parameters.targetZoneStart + adjustedData.parameters.targetZoneEnd) / 2;
                    adjustedData.parameters.targetZoneStart = Math.max(0, Math.round(center - newWidth / 2));
                    adjustedData.parameters.targetZoneEnd = Math.min(100, Math.round(center + newWidth / 2));
                    
                    // 调整速度 (值越小越快)
                    adjustedData.parameters.barSpeed = Math.max(20, 
                        Math.round(adjustedData.parameters.barSpeed * (1 - (this.difficultyLevel - 1) * 0.15)));
                }
                break;
                
            case "ButtonMash":
                // 调整目标点击次数或时间限制
                if (adjustedData.parameters) {
                    const difficultyFactor = 1 + (this.difficultyLevel - 1) * 0.15; // 难度5时为1.6，难度1时为1.0
                    
                    // 增加需要点击的次数或减少时间
                    adjustedData.parameters.targetClicks = Math.round(adjustedData.parameters.targetClicks * difficultyFactor);
                    adjustedData.parameters.timeLimit = Math.round(adjustedData.parameters.timeLimit / difficultyFactor);
                }
                break;
                
            case "ClickSequence":
                // 调整序列时间限制
                if (adjustedData.parameters) {
                    const difficultyFactor = 1 + (this.difficultyLevel - 1) * 0.15; // 难度5时为1.6，难度1时为1.0
                    
                    // 减少可用时间
                    adjustedData.parameters.timeLimit = Math.round(adjustedData.parameters.timeLimit / difficultyFactor);
                }
                break;
        }
        
        return adjustedData;
    }
    
    /**
     * 更新动态难度
     * @param {boolean} success - 最近一次QTE是否成功
     */
    updateDynamicDifficulty(success) {
        // 记录最近的结果
        this.lastResults.push(success ? 1 : 0);
        if (this.lastResults.length > 5) {
            this.lastResults.shift(); // 保持最多5个结果
        }
        
        // 计算最近的成功率
        if (this.lastResults.length >= 3) { // 至少有3个结果才调整
            const recentSuccessRate = this.lastResults.reduce((a, b) => a + b, 0) / this.lastResults.length;
            
            // 根据成功率调整难度
            if (recentSuccessRate > 0.8 && this.difficultyLevel < 5) {
                // 成功率太高，增加难度
                this.difficultyLevel = Math.min(5, this.difficultyLevel + 1);
            } else if (recentSuccessRate < 0.3 && this.difficultyLevel > 1) {
                // 成功率太低，降低难度
                this.difficultyLevel = Math.max(1, this.difficultyLevel - 1);
            }
            
            // 更新整体成功率记录
            this.playerSuccessRate = recentSuccessRate * 0.3 + this.playerSuccessRate * 0.7; // 平滑过渡
        }
    }
    
    /**
     * 添加倒计时效果
     */
    addCountdownEffect() {
        const countdownElement = document.createElement('div');
        countdownElement.className = 'qte-countdown';
        countdownElement.textContent = '3';
        
        this.contentArea.appendChild(countdownElement);
        
        // 播放倒计时音效
        this.playSound('countdown');
        
        // 倒计时动画
        let count = 3;
        const countInterval = this.addTimer(setInterval(() => {
            count--;
            if (count > 0) {
                countdownElement.textContent = count.toString();
                countdownElement.classList.remove('pulse');
                void countdownElement.offsetWidth; // 触发重绘
                countdownElement.classList.add('pulse');
                this.playSound('tick');
            } else {
                clearInterval(countInterval);
                countdownElement.textContent = '开始!';
                countdownElement.classList.add('go');
                this.addTimer(setTimeout(() => {
                    countdownElement.remove();
                }, 500));
            }
        }, 800));
    }
    
    /**
     * 屏幕震动效果
     * @param {number} intensity - 震动强度 (1-5)
     * @param {number} duration - 震动持续时间(毫秒)
     */
    screenShake(intensity = 3, duration = 500) {
        const originalPosition = window.scrollY;
        const shakeElement = this.container;
        
        shakeElement.style.transition = 'none';
        
        const startTime = Date.now();
        const shake = () => {
            const elapsed = Date.now() - startTime;
            if (elapsed < duration) {
                const xPos = Math.random() * intensity * 2 - intensity;
                const yPos = Math.random() * intensity * 2 - intensity;
                
                shakeElement.style.transform = `translate(calc(-50% + ${xPos}px), calc(-50% + ${yPos}px))`;
                
                requestAnimationFrame(shake);
            } else {
                shakeElement.style.transform = 'translate(-50%, -50%)';
                shakeElement.style.transition = 'transform 0.1s ease-out';
            }
        };
        
        shake();
    }
    
    /**
     * 结束QTE
     * @param {boolean} success - 是否成功
     */
    end(success) {
        // 清除任何动画或计时器
        if (this.animationId) {
            if (typeof this.animationId === 'number') {
                cancelAnimationFrame(this.animationId);
                clearTimeout(this.animationId);
            }
            this.animationId = null;
        }
        
        // 清除所有定时器和事件监听器
        this.clearAllTimers();
        this.removeAllEventListeners();
        
        // 更新动态难度
        this.updateDynamicDifficulty(success);
        
        // 播放音效和视觉反馈
        if (success) {
            this.playSound('success');
            this.container.classList.add('qte-success');
            this.screenShake(2, 300); // 轻微震动
        } else {
            this.playSound('failure');
            this.container.classList.add('qte-failure');
            this.screenShake(4, 500); // 较强震动
        }
        
        // 添加结果提示
        const resultElement = document.createElement('div');
        resultElement.className = `qte-result ${success ? 'success' : 'failure'}`;
        resultElement.textContent = success ? '成功!' : '失败!';
        this.contentArea.appendChild(resultElement);
        
        // 延迟后隐藏QTE容器
        this.addTimer(setTimeout(() => {
            this.container.style.animation = 'qte-disappear 0.3s ease-in forwards';
            
            this.addTimer(setTimeout(() => {
                // 隐藏QTE容器
                this.container.style.display = 'none';
                this.container.classList.remove('qte-success', 'qte-failure');
                
                // 回调通知结果
                if (success && this.onSuccess) {
                    this.onSuccess();
                } else if (!success && this.onFailure) {
                    this.onFailure();
                }
                
                // 重置状态
                this.isActive = false;
                this.currentConfig = null;
                this.onSuccess = null;
                this.onFailure = null;
                this.activeTimers = [];
                this.activeEventListeners = [];
            }, 300));
        }, 1000));
    }
    
    /**
     * 清除所有定时器
     */
    clearAllTimers() {
        if (this.activeTimers) {
            this.activeTimers.forEach(timerId => {
                clearTimeout(timerId);
                clearInterval(timerId);
            });
            this.activeTimers = [];
        }
    }
    
    /**
     * 移除所有事件监听器
     */
    removeAllEventListeners() {
        if (this.activeEventListeners) {
            this.activeEventListeners.forEach(({ element, event, handler }) => {
                if (element && element.removeEventListener) {
                    element.removeEventListener(event, handler);
                }
            });
            this.activeEventListeners = [];
        }
    }
    
    /**
     * 添加定时器到跟踪列表
     */
    addTimer(timerId) {
        if (!this.activeTimers) {
            this.activeTimers = [];
        }
        this.activeTimers.push(timerId);
        return timerId;
    }
    
    /**
     * 添加事件监听器到跟踪列表
     */
    addEventListenerTracked(element, event, handler) {
        if (!this.activeEventListeners) {
            this.activeEventListeners = [];
        }
        element.addEventListener(event, handler);
        this.activeEventListeners.push({ element, event, handler });
    }
    
    /**
     * "停止移动条"类型QTE
     * @param {Object} config - QTE配置
     */
    stopMovingBarQTE(config) {
        // 创建QTE界面元素
        const trackElement = document.createElement('div');
        trackElement.className = 'qte-track';
        
        const targetZoneElement = document.createElement('div');
        targetZoneElement.className = 'qte-target-zone';
        targetZoneElement.style.left = `${config.parameters.targetZoneStart || 30}%`;
        targetZoneElement.style.width = `${(config.parameters.targetZoneEnd || 70) - (config.parameters.targetZoneStart || 30)}%`;
        
        const movingBarElement = document.createElement('div');
        movingBarElement.className = 'qte-moving-bar';
        movingBarElement.style.left = '0%';
        
        // 添加脉冲效果
        const pulseEffect = document.createElement('div');
        pulseEffect.className = 'qte-pulse-effect';
        movingBarElement.appendChild(pulseEffect);
        
        trackElement.appendChild(targetZoneElement);
        trackElement.appendChild(movingBarElement);
        
        const actionButton = document.createElement('button');
        actionButton.className = 'qte-button';
        actionButton.textContent = '停止!';
        
        // 添加时间指示器
        const timeIndicator = document.createElement('div');
        timeIndicator.className = 'qte-time-indicator';
        const timeBar = document.createElement('div');
        timeBar.className = 'qte-time-bar';
        timeIndicator.appendChild(timeBar);
        
        // 添加到QTE内容区域
        this.contentArea.appendChild(trackElement);
        this.contentArea.appendChild(actionButton);
        this.contentArea.appendChild(timeIndicator);
        
        // 设置移动条变量
        let barPosition = 0;
        let direction = 1;
        const barWidth = 5; // 假设移动条宽度为5%
        const speed = config.parameters.barSpeed || 50; // 数值越小，移动越快
        
        // 移动条动画函数
        const moveBar = () => {
            if (!this.isActive) return;
            
            barPosition += direction * 1; // 每步移动1%
            
            if (barPosition >= 100 - barWidth) {
                barPosition = 100 - barWidth;
                direction = -1;
                this.playSound('tick');
            } else if (barPosition <= 0) {
                barPosition = 0;
                direction = 1;
                this.playSound('tick');
            }
            
            movingBarElement.style.left = `${barPosition}%`;
            this.animationId = this.addTimer(setTimeout(moveBar, speed));
        };
        
        // 设置时间限制
        const timeLimit = config.parameters.timeLimit || 10000; // 默认10秒
        const startTime = Date.now();
        
        const updateTimeBar = () => {
            if (!this.isActive) return;
            
            const elapsed = Date.now() - startTime;
            const remainingPercent = Math.max(0, 100 - (elapsed / timeLimit * 100));
            
            timeBar.style.width = `${remainingPercent}%`;
            
            // 根据剩余时间改变颜色
            if (remainingPercent < 30) {
                timeBar.style.backgroundColor = '#F44336'; // 红色
                timeBar.classList.add('pulse-warning');
            } else if (remainingPercent < 60) {
                timeBar.style.backgroundColor = '#FFC107'; // 黄色
            }
            
            if (elapsed >= timeLimit) {
                // 时间到，自动失败
                this.end(false);
            } else {
                requestAnimationFrame(updateTimeBar);
            }
        };
        
        // 开始移动和计时
        moveBar();
        updateTimeBar();
        
        // 监听停止按钮点击
        const clickHandler = () => {
            if (!this.isActive) return;
            
            this.playSound('click');
            
            clearTimeout(this.animationId);
            this.animationId = null;
            
            // 检查是否成功
            const targetStart = config.parameters.targetZoneStart || 30;
            const targetEnd = (config.parameters.targetZoneEnd || 70) - barWidth;
            const success = (barPosition >= targetStart && barPosition <= targetEnd);
            
            // 视觉反馈
            if (success) {
                movingBarElement.style.backgroundColor = '#4CAF50'; // 绿色
                actionButton.textContent = '成功!';
                actionButton.style.backgroundColor = '#4CAF50';
                
                // 添加成功动画
                const successEffect = document.createElement('div');
                successEffect.className = 'qte-success-effect';
                movingBarElement.appendChild(successEffect);
            } else {
                movingBarElement.style.backgroundColor = '#F44336'; // 红色
                actionButton.textContent = '失败!';
                actionButton.style.backgroundColor = '#F44336';
                
                // 添加失败动画
                const failureEffect = document.createElement('div');
                failureEffect.className = 'qte-failure-effect';
                movingBarElement.appendChild(failureEffect);
            }
            
            // 延迟结束QTE，给用户视觉反馈时间
            this.addTimer(setTimeout(() => {
                this.end(success);
            }, 1000));
        };
        
        this.addEventListenerTracked(actionButton, 'click', clickHandler);
    }
    
    /**
     * "连续按钮点击"类型QTE
     * @param {Object} config - QTE配置
     */
    buttonMashQTE(config) {
        // 获取参数
        const targetClicks = config.parameters.targetClicks || 20;
        const timeLimit = config.parameters.timeLimit || 5000; // 毫秒
        let currentClicks = 0;
        
        // 创建QTE界面元素
        const progressContainer = document.createElement('div');
        progressContainer.className = 'qte-progress-container';
        
        const progressBar = document.createElement('div');
        progressBar.className = 'qte-progress-bar';
        
        const progressFill = document.createElement('div');
        progressFill.className = 'qte-progress-fill';
        progressFill.style.width = '0%';
        
        // 添加进度标记
        for (let i = 1; i <= 4; i++) {
            const marker = document.createElement('div');
            marker.className = 'qte-progress-marker';
            marker.style.left = `${i * 20}%`;
            progressBar.appendChild(marker);
        }
        
        const clickButton = document.createElement('button');
        clickButton.className = 'qte-button';
        clickButton.textContent = '快速点击!';
        
        const counterText = document.createElement('div');
        counterText.className = 'qte-counter';
        counterText.textContent = `${currentClicks}/${targetClicks}`;
        
        // 创建时间指示器
        const timeDisplay = document.createElement('div');
        timeDisplay.className = 'qte-time-display';
        const timeLeft = Math.ceil(timeLimit / 1000);
        timeDisplay.textContent = `剩余时间: ${timeLeft}秒`;
        
        // 组装元素
        progressBar.appendChild(progressFill);
        progressContainer.appendChild(progressBar);
        
        this.contentArea.appendChild(progressContainer);
        this.contentArea.appendChild(clickButton);
        this.contentArea.appendChild(counterText);
        this.contentArea.appendChild(timeDisplay);
        
        // 点击处理
        const clickHandler = () => {
            if (!this.isActive) return;
            
            this.playSound('click');
            
            // 添加点击视觉效果
            const ripple = document.createElement('span');
            ripple.className = 'qte-button-ripple';
            clickButton.appendChild(ripple);
            
            // 移除旧的涟漪效果
            this.addTimer(setTimeout(() => {
                ripple.remove();
            }, 700));
            
            currentClicks++;
            counterText.textContent = `${currentClicks}/${targetClicks}`;
            
            // 更新进度条
            const progressPercent = (currentClicks / targetClicks) * 100;
            progressFill.style.width = `${Math.min(progressPercent, 100)}%`;
            
            // 每完成25%闪烁一次
            if (currentClicks % (targetClicks / 4) === 0) {
                progressFill.classList.add('qte-progress-flash');
                this.addTimer(setTimeout(() => {
                    progressFill.classList.remove('qte-progress-flash');
                }, 300));
            }
            
            // 检查是否达到目标
            if (currentClicks >= targetClicks) {
                // 成功完成
                progressFill.style.backgroundColor = '#4CAF50';
                clickButton.disabled = true;
                clickButton.textContent = '成功!';
                clickButton.style.backgroundColor = '#4CAF50';
                
                this.addTimer(setTimeout(() => {
                    this.end(true);
                }, 1000));
            }
        };
        
        this.addEventListenerTracked(clickButton, 'click', clickHandler);
        
        // 设置时间限制和更新
        const startTime = Date.now();
        
        const updateTimer = () => {
            if (!this.isActive) return;
            
            const elapsed = Date.now() - startTime;
            const remaining = Math.max(0, timeLimit - elapsed);
            const remainingSeconds = Math.ceil(remaining / 1000);
            
            // 只有当秒数变化时才更新显示和播放音效
            if (remainingSeconds !== parseInt(timeDisplay.textContent.split(': ')[1])) {
                timeDisplay.textContent = `剩余时间: ${remainingSeconds}秒`;
                
                // 时间不多时闪烁警告
                if (remainingSeconds <= 3) {
                    this.playSound('tick');
                    timeDisplay.classList.add('qte-time-warning');
                    setTimeout(() => {
                        timeDisplay.classList.remove('qte-time-warning');
                    }, 300);
                }
            }
            
            if (remaining <= 0) {
                // 时间到，未完成
                progressFill.style.backgroundColor = '#F44336';
                clickButton.disabled = true;
                clickButton.textContent = '时间到!';
                clickButton.style.backgroundColor = '#F44336';
                
                this.addTimer(setTimeout(() => {
                    this.end(false);
                }, 1000));
            } else {
                requestAnimationFrame(updateTimer);
            }
        };
        
        updateTimer();
    }
    
    /**
     * "图像点击序列"类型QTE
     * @param {Object} config - QTE配置
     */
    clickSequenceQTE(config) {
        // 获取参数
        const sequence = config.parameters.sequence || [];
        const timeLimit = config.parameters.timeLimit || 8000; // 毫秒
        let currentIndex = 0;
        
        if (sequence.length === 0) {
            console.error("点击序列QTE没有定义序列!");
            return this.end(false);
        }
        
        // 创建QTE界面元素
        const sequenceContainer = document.createElement('div');
        sequenceContainer.className = 'qte-sequence-container';
        
        // 添加时间指示器
        const timeIndicator = document.createElement('div');
        timeIndicator.className = 'qte-time-indicator';
        const timeBar = document.createElement('div');
        timeBar.className = 'qte-time-bar';
        timeIndicator.appendChild(timeBar);
        
        // 添加序列顺序指示
        const sequenceIndicator = document.createElement('div');
        sequenceIndicator.className = 'qte-sequence-indicator';
        sequenceIndicator.textContent = `进度: 0/${sequence.length}`;
        
        // 创建图像
        sequence.forEach((item, index) => {
            const imageWrapper = document.createElement('div');
            imageWrapper.className = 'qte-sequence-item';
            imageWrapper.dataset.index = index;
            
            const image = document.createElement('img');
            image.src = item.image;
            image.alt = `点击序列图像 ${index + 1}`;
            
            // 添加数字标记，显示序列顺序
            const orderMarker = document.createElement('div');
            orderMarker.className = 'qte-sequence-order';
            orderMarker.textContent = index + 1;
            
            // 添加标记，显示当前应点击的项
            const marker = document.createElement('div');
            marker.className = 'qte-sequence-marker';
            marker.style.display = index === 0 ? 'block' : 'none';
            
            imageWrapper.appendChild(image);
            imageWrapper.appendChild(orderMarker);
            imageWrapper.appendChild(marker);
            sequenceContainer.appendChild(imageWrapper);
            
            // 添加点击事件
            const clickHandler = () => {
                if (!this.isActive) return;
                
                this.playSound('click');
                
                if (parseInt(imageWrapper.dataset.index) === currentIndex) {
                    // 正确的点击
                    marker.style.display = 'none';
                    imageWrapper.classList.add('qte-sequence-correct');
                    
                    // 添加正确点击动画
                    const correctEffect = document.createElement('div');
                    correctEffect.className = 'qte-correct-click';
                    imageWrapper.appendChild(correctEffect);
                    this.addTimer(setTimeout(() => {
                        correctEffect.remove();
                    }, 700));
                    
                    currentIndex++;
                    sequenceIndicator.textContent = `进度: ${currentIndex}/${sequence.length}`;
                    
                    // 如果还有下一项，标记它
                    if (currentIndex < sequence.length) {
                        const nextMarker = sequenceContainer.querySelector(`.qte-sequence-item[data-index="${currentIndex}"] .qte-sequence-marker`);
                        if (nextMarker) {
                            nextMarker.style.display = 'block';
                        }
                    } else {
                        // 完成序列
                        sequenceContainer.classList.add('qte-sequence-complete');
                        
                        this.addTimer(setTimeout(() => {
                            this.end(true);
                        }, 1000));
                    }
                } else {
                    // 错误的点击
                    imageWrapper.classList.add('qte-sequence-error');
                    // 添加错误点击动画
                    const errorEffect = document.createElement('div');
                    errorEffect.className = 'qte-error-click';
                    imageWrapper.appendChild(errorEffect);
                    this.addTimer(setTimeout(() => {
                        errorEffect.remove();
                    }, 700));
                    
                    this.addTimer(setTimeout(() => {
                        this.end(false);
                    }, 1000));
                }
            };
            
            this.addEventListenerTracked(imageWrapper, 'click', clickHandler);
        });
        
        this.contentArea.appendChild(timeIndicator);
        this.contentArea.appendChild(sequenceIndicator);
        this.contentArea.appendChild(sequenceContainer);
        
        // 更新时间条
        const startTime = Date.now();
        const updateTimeBar = () => {
            if (!this.isActive) return;
            
            const elapsed = Date.now() - startTime;
            const remainingPercent = Math.max(0, 100 - (elapsed / timeLimit * 100));
            
            timeBar.style.width = `${remainingPercent}%`;
            
            // 根据剩余时间改变颜色
            if (remainingPercent < 30) {
                timeBar.style.backgroundColor = '#F44336'; // 红色
                timeBar.classList.add('pulse-warning');
            } else if (remainingPercent < 60) {
                timeBar.style.backgroundColor = '#FFC107'; // 黄色
            }
            
            if (elapsed >= timeLimit) {
                // 时间到，未完成
                sequenceContainer.classList.add('qte-sequence-timeout');
                
                this.addTimer(setTimeout(() => {
                    this.end(false);
                }, 1000));
            } else {
                requestAnimationFrame(updateTimeBar);
            }
        };
        
        updateTimeBar();
    }

    /**
     * "拖拽操作"类型QTE
     * @param {Object} config - QTE配置
     * @example
     * qteSystem.start({
     *   type: 'DragAndDrop',
     *   parameters: {
     *     draggableImagePath: 'path/to/draggable.png',
     *     targetImagePath: 'path/to/target.png',
     *     timeLimit: 5000, // 毫秒
     *     targetArea: { x: 100, y: 100, width: 50, height: 50 } // 目标区域坐标和大小
     *   },
     *   onSuccess: () => console.log('拖拽成功!'),
     *   onFailure: () => console.log('拖拽失败!')
     * });
     */
    dragAndDropQTE(config) {
        this.contentArea.innerHTML = ''; // 清空内容区域
        const { draggableImagePath, targetImagePath, timeLimit = 5000, targetArea } = config.parameters;

        if (!draggableImagePath || !targetImagePath || !targetArea) {
            console.error('拖拽QTE缺少必要的参数: draggableImagePath, targetImagePath, 或 targetArea');
            return this.end(false);
        }

        const draggableElement = document.createElement('img');
        draggableElement.src = draggableImagePath;
        draggableElement.className = 'qte-draggable';
        draggableElement.style.position = 'absolute';
        draggableElement.style.left = '50px'; // 初始位置
        draggableElement.style.top = '50px';
        draggableElement.style.cursor = 'grab';
        draggableElement.ondragstart = () => false; // 防止浏览器默认拖拽行为

        const targetElement = document.createElement('img');
        targetElement.src = targetImagePath;
        targetElement.className = 'qte-drag-target';
        targetElement.style.position = 'absolute';
        targetElement.style.left = `${targetArea.x}px`;
        targetElement.style.top = `${targetArea.y}px`;
        targetElement.style.width = `${targetArea.width}px`;
        targetElement.style.height = `${targetArea.height}px`;

        this.contentArea.appendChild(targetElement);
        this.contentArea.appendChild(draggableElement);

        let isDragging = false;
        let offsetX, offsetY;

        const mousedownHandler = (e) => {
            isDragging = true;
            offsetX = e.clientX - draggableElement.getBoundingClientRect().left;
            offsetY = e.clientY - draggableElement.getBoundingClientRect().top;
            draggableElement.style.cursor = 'grabbing';
            this.playSound('click');
        };

        const mousemoveHandler = (e) => {
            if (!isDragging || !this.isActive) return;
            draggableElement.style.left = `${e.clientX - offsetX - this.contentArea.getBoundingClientRect().left}px`;
            draggableElement.style.top = `${e.clientY - offsetY - this.contentArea.getBoundingClientRect().top}px`;
        };

        const mouseupHandler = () => {
            if (!isDragging || !this.isActive) return;
            isDragging = false;
            draggableElement.style.cursor = 'grab';

            const dragRect = draggableElement.getBoundingClientRect();
            const targetRect = targetElement.getBoundingClientRect();

            // 检查是否拖拽到目标区域 (中心点判断)
            const dragCenterX = dragRect.left + dragRect.width / 2;
            const dragCenterY = dragRect.top + dragRect.height / 2;

            const success = dragCenterX >= targetRect.left && dragCenterX <= targetRect.right &&
                            dragCenterY >= targetRect.top && dragCenterY <= targetRect.bottom;

            if (success) {
                draggableElement.style.display = 'none'; // 或者移动到目标位置
                targetElement.classList.add('qte-drag-success-pulse');
            }
            this.end(success);
        };
        
        this.addEventListenerTracked(draggableElement, 'mousedown', mousedownHandler);
        this.addEventListenerTracked(document, 'mousemove', mousemoveHandler);
        this.addEventListenerTracked(document, 'mouseup', mouseupHandler);

        // 时间限制
        const timer = this.addTimer(setTimeout(() => {
            if (this.isActive) {
                this.end(false);
            }
        }, timeLimit));

        this.animationId = timer; // Store timer to clear it in end()
    }

    /**
     * "滑动手势"类型QTE
     * @param {Object} config - QTE配置
     * @example
     * qteSystem.start({
     *   type: 'SwipeGesture',
     *   parameters: {
     *     direction: 'right', // 'up', 'down', 'left', 'right'
     *     timeLimit: 3000, // 毫秒
     *     swipeThreshold: 50 // 滑动距离阈值 (像素)
     *   },
     *   onSuccess: () => console.log('滑动成功!'),
     *   onFailure: () => console.log('滑动失败!')
     * });
     */
    swipeGestureQTE(config) {
        this.contentArea.innerHTML = ''; // 清空内容区域
        const { direction, timeLimit = 3000, swipeThreshold = 50 } = config.parameters;

        if (!direction) {
            console.error('滑动手势QTE缺少必要的参数: direction');
            return this.end(false);
        }

        const swipeArea = document.createElement('div');
        swipeArea.className = 'qte-swipe-area';
        swipeArea.innerHTML = `<p>向 ${this.getSwipeDirectionText(direction)} 滑动!</p><div class="qte-swipe-arrow qte-swipe-arrow-${direction}"></div>`;

        this.contentArea.appendChild(swipeArea);

        let startX, startY;
        let isSwiping = false;

        const handleTouchStart = (e) => {
            const touch = e.touches ? e.touches[0] : e;
            startX = touch.clientX;
            startY = touch.clientY;
            isSwiping = true;
            this.playSound('click');
        };

        const handleTouchMove = (e) => {
            if (!isSwiping || !this.isActive) return;
            // 可以在这里添加视觉反馈，比如跟随手指的元素
        };

        const handleTouchEnd = (e) => {
            if (!isSwiping || !this.isActive) return;
            isSwiping = false;
            const touch = e.changedTouches ? e.changedTouches[0] : e;
            const endX = touch.clientX;
            const endY = touch.clientY;

            const deltaX = endX - startX;
            const deltaY = endY - startY;
            let swipedDirection = '';

            if (Math.abs(deltaX) > Math.abs(deltaY)) { // 水平滑动
                if (deltaX > swipeThreshold) swipedDirection = 'right';
                else if (deltaX < -swipeThreshold) swipedDirection = 'left';
            } else { // 垂直滑动
                if (deltaY > swipeThreshold) swipedDirection = 'down';
                else if (deltaY < -swipeThreshold) swipedDirection = 'up';
            }
            this.end(swipedDirection === direction);
        };

        this.addEventListenerTracked(swipeArea, 'mousedown', handleTouchStart);
        this.addEventListenerTracked(swipeArea, 'mousemove', handleTouchMove); // mousemove for desktop
        this.addEventListenerTracked(swipeArea, 'mouseup', handleTouchEnd);
        this.addEventListenerTracked(swipeArea, 'mouseleave', () => { if(isSwiping) handleTouchEnd({clientX: startX, clientY: startY}); }); // Handle mouse leaving element

        this.addEventListenerTracked(swipeArea, 'touchstart', handleTouchStart, { passive: true });
        this.addEventListenerTracked(swipeArea, 'touchmove', handleTouchMove, { passive: true });
        this.addEventListenerTracked(swipeArea, 'touchend', handleTouchEnd);

        // 时间限制
        const timer = this.addTimer(setTimeout(() => {
            if (this.isActive) {
                this.end(false);
            }
        }, timeLimit));
        this.animationId = timer; // Store timer to clear it in end()
    }

    getSwipeDirectionText(direction) {
        switch (direction) {
            case 'up': return '上';
            case 'down': return '下';
            case 'left': return '左';
            case 'right': return '右';
            default: return '';
        }
    }

window.EnhancedQTESystem = EnhancedQTESystem;