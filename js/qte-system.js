/**
 * 物业管理模拟器 - QTE (Quick Time Event) 系统
 * 支持多种QTE类型：停止移动条、连续按钮点击、图像点击序列
 */

class QTESystem {
    constructor() {
        // QTE容器元素
        this.container = document.getElementById('qte-container');
        this.instructionTextElement = document.getElementById('qte-instruction-text');
        this.contentArea = document.getElementById('qte-content-area');
        
        // QTE状态
        this.isActive = false;
        this.currentConfig = null;
        this.animationId = null;
        
        // 对外暴露的回调函数
        this.onSuccess = null;
        this.onFailure = null;
        
        // 绑定方法的this
        this.stopMovingBarQTE = this.stopMovingBarQTE.bind(this);
        this.buttonMashQTE = this.buttonMashQTE.bind(this);
        this.clickSequenceQTE = this.clickSequenceQTE.bind(this);
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
        this.currentConfig = qteData;
        this.onSuccess = onSuccess;
        this.onFailure = onFailure;
        
        // 清空QTE内容区域
        this.contentArea.innerHTML = '';
        
        // 设置指导文本
        this.instructionTextElement.textContent = qteData.instructionText || "完成时间事件!";
        
        // 显示QTE容器
        this.container.style.display = 'block';
        
        // 根据QTE类型启动相应功能
        switch (qteData.type) {
            case "StopTheMovingBar":
                this.stopMovingBarQTE(qteData);
                break;
            case "ButtonMash":
                this.buttonMashQTE(qteData);
                break;
            case "ClickSequence":
                this.clickSequenceQTE(qteData);
                break;
            default:
                console.error("未知的QTE类型:", qteData.type);
                this.end(false);
                break;
        }
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
        
        // 隐藏QTE容器
        // this.container.style.display = 'none';  // 由主游戏逻辑处理隐藏
        
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
        
        trackElement.appendChild(targetZoneElement);
        trackElement.appendChild(movingBarElement);
        
        const actionButton = document.createElement('button');
        actionButton.className = 'qte-button';
        actionButton.textContent = '停止!';
        
        // 添加到QTE内容区域
        this.contentArea.appendChild(trackElement);
        this.contentArea.appendChild(actionButton);
        
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
            } else if (barPosition <= 0) {
                barPosition = 0;
                direction = 1;
            }
            
            movingBarElement.style.left = `${barPosition}%`;
            this.animationId = setTimeout(moveBar, speed);
        };
        
        // 开始移动
        moveBar();
        
        // 监听停止按钮点击
        actionButton.addEventListener('click', () => {
            if (!this.isActive) return;
            
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
            } else {
                movingBarElement.style.backgroundColor = '#F44336'; // 红色
                actionButton.textContent = '失败!';
                actionButton.style.backgroundColor = '#F44336';
            }
            
            // 延迟结束QTE，给用户视觉反馈时间
            setTimeout(() => {
                this.end(success);
            }, 1000);
        });
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
        
        const clickButton = document.createElement('button');
        clickButton.className = 'qte-button';
        clickButton.textContent = '快速点击!';
        
        const counterText = document.createElement('div');
        counterText.className = 'qte-counter';
        counterText.textContent = `${currentClicks}/${targetClicks}`;
        
        // 组装元素
        progressBar.appendChild(progressFill);
        progressContainer.appendChild(progressBar);
        
        this.contentArea.appendChild(progressContainer);
        this.contentArea.appendChild(clickButton);
        this.contentArea.appendChild(counterText);
        
        // 点击处理
        clickButton.addEventListener('click', () => {
            if (!this.isActive) return;
            
            currentClicks++;
            counterText.textContent = `${currentClicks}/${targetClicks}`;
            
            // 更新进度条
            const progressPercent = (currentClicks / targetClicks) * 100;
            progressFill.style.width = `${Math.min(progressPercent, 100)}%`;
            
            // 检查是否达到目标
            if (currentClicks >= targetClicks) {
                // 成功完成
                progressFill.style.backgroundColor = '#4CAF50';
                clickButton.disabled = true;
                clickButton.textContent = '成功!';
                clickButton.style.backgroundColor = '#4CAF50';
                
                setTimeout(() => {
                    this.end(true);
                }, 1000);
            }
        });
        
        // 设置时间限制
        this.animationId = setTimeout(() => {
            if (this.isActive && currentClicks < targetClicks) {
                // 时间到，未完成
                progressFill.style.backgroundColor = '#F44336';
                clickButton.disabled = true;
                clickButton.textContent = '时间到!';
                clickButton.style.backgroundColor = '#F44336';
                
                setTimeout(() => {
                    this.end(false);
                }, 1000);
            }
        }, timeLimit);
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
        
        // 创建图像
        sequence.forEach((item, index) => {
            const imageWrapper = document.createElement('div');
            imageWrapper.className = 'qte-sequence-item';
            imageWrapper.dataset.index = index;
            
            const image = document.createElement('img');
            image.src = item.image;
            image.alt = `点击序列图像 ${index + 1}`;
            
            // 添加标记，显示当前应点击的项
            const marker = document.createElement('div');
            marker.className = 'qte-sequence-marker';
            marker.style.display = index === 0 ? 'block' : 'none';
            
            imageWrapper.appendChild(image);
            imageWrapper.appendChild(marker);
            sequenceContainer.appendChild(imageWrapper);
            
            // 添加点击事件
            imageWrapper.addEventListener('click', () => {
                if (!this.isActive) return;
                
                if (parseInt(imageWrapper.dataset.index) === currentIndex) {
                    // 正确的点击
                    marker.style.display = 'none';
                    imageWrapper.classList.add('qte-sequence-correct');
                    
                    currentIndex++;
                    
                    // 如果还有下一项，标记它
                    if (currentIndex < sequence.length) {
                        const nextMarker = sequenceContainer.querySelector(`.qte-sequence-item[data-index="${currentIndex}"] .qte-sequence-marker`);
                        if (nextMarker) {
                            nextMarker.style.display = 'block';
                        }
                    } else {
                        // 完成序列
                        sequenceContainer.classList.add('qte-sequence-complete');
                        
                        setTimeout(() => {
                            this.end(true);
                        }, 1000);
                    }
                } else {
                    // 错误的点击
                    imageWrapper.classList.add('qte-sequence-error');
                    
                    setTimeout(() => {
                        this.end(false);
                    }, 1000);
                }
            });
        });
        
        this.contentArea.appendChild(sequenceContainer);
        
        // 设置时间限制
        this.animationId = setTimeout(() => {
            if (this.isActive && currentIndex < sequence.length) {
                // 时间到，未完成
                sequenceContainer.classList.add('qte-sequence-timeout');
                
                setTimeout(() => {
                    this.end(false);
                }, 1000);
            }
        }, timeLimit);
    }
}

// 导出QTE系统
window.QTESystem = QTESystem; 