/**
 * 物业管理模拟器 - QTE (Quick Time Event) 系统
 * 支持多种QTE类型：停止移动条、连续按钮点击、图像点击序列、节奏点击、拖拽操作、旋转操作、记忆序列
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
        
        // 内存泄漏防护
        this.activeTimers = [];
        this.activeEventListeners = [];
        
        // 绑定方法的this
        this.stopMovingBarQTE = this.stopMovingBarQTE.bind(this);
        this.buttonMashQTE = this.buttonMashQTE.bind(this);
        this.clickSequenceQTE = this.clickSequenceQTE.bind(this);
        this.rhythmClickQTE = this.rhythmClickQTE.bind(this);
        this.dragDropQTE = this.dragDropQTE.bind(this);
        this.rotateQTE = this.rotateQTE.bind(this);
        this.memorySequenceQTE = this.memorySequenceQTE.bind(this);
        this.precisionClickQTE = this.precisionClickQTE.bind(this);
        this.multiTaskQTE = this.multiTaskQTE.bind(this);
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
            case "RhythmClick":
                this.rhythmClickQTE(qteData);
                break;
            case "DragDrop":
                this.dragDropQTE(qteData);
                break;
            case "Rotate":
                this.rotateQTE(qteData);
                break;
            case "MemorySequence":
                this.memorySequenceQTE(qteData);
                break;
            case "PrecisionClick":
                this.precisionClickQTE(qteData);
                break;
            case "MultiTask":
                this.multiTaskQTE(qteData);
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
        
        // 清除所有定时器
        this.clearAllTimers();
        
        // 移除所有事件监听器
        this.removeAllEventListeners();
        
        // 隐藏QTE容器
        if (this.container) {
            this.container.style.display = 'none';
        }
        
        // 清空内容区域
        if (this.contentArea) {
            this.contentArea.innerHTML = '';
        }
        
        // 更新统计数据
        if (typeof gameState !== 'undefined' && gameState) {
            gameState.qtesCompleted = (gameState.qtesCompleted || 0) + 1;
            if (success) {
                gameState.qtesSuccessful = (gameState.qtesSuccessful || 0) + 1;
            }
        }
        
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
            this.animationId = this.addTimer(setTimeout(moveBar, speed));
        };
        
        // 开始移动
        moveBar();
        
        // 监听停止按钮点击
        const clickHandler = () => {
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
        const clickHandler = () => {
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
                
                this.addTimer(setTimeout(() => {
                    this.end(true);
                }, 1000));
            }
        };
        
        this.addEventListenerTracked(clickButton, 'click', clickHandler);
        
        // 设置时间限制
        this.animationId = this.addTimer(setTimeout(() => {
            if (this.isActive && currentClicks < targetClicks) {
                // 时间到，未完成
                progressFill.style.backgroundColor = '#F44336';
                clickButton.disabled = true;
                clickButton.textContent = '时间到!';
                clickButton.style.backgroundColor = '#F44336';
                
                this.addTimer(setTimeout(() => {
                    this.end(false);
                }, 1000));
            }
        }, timeLimit));
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
            this.addEventListenerTracked(imageWrapper, 'click', () => {
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
                        
                        this.addTimer(setTimeout(() => {
                            this.end(true);
                        }, 1000));
                    }
                } else {
                    // 错误的点击
                    imageWrapper.classList.add('qte-sequence-error');
                    
                    this.addTimer(setTimeout(() => {
                        this.end(false);
                    }, 1000));
                }
            });
        });
        
        this.contentArea.appendChild(sequenceContainer);
        
        // 设置时间限制
        this.animationId = this.addTimer(setTimeout(() => {
            if (this.isActive && currentIndex < sequence.length) {
                // 时间到，未完成
                sequenceContainer.classList.add('qte-sequence-timeout');
                
                this.addTimer(setTimeout(() => {
                    this.end(false);
                }, 1000));
            }
        }, timeLimit));
    }

    /**
     * "节奏点击"类型QTE - 按照节拍点击
     * @param {Object} config - QTE配置
     */
    rhythmClickQTE(config) {
        const beats = config.parameters.beats || [1000, 2000, 3000, 4000]; // 节拍时间点
        const tolerance = config.parameters.tolerance || 200; // 容错时间
        let currentBeatIndex = 0;
        let startTime = Date.now();
        let score = 0;
        
        // 创建界面
        const rhythmContainer = document.createElement('div');
        rhythmContainer.className = 'qte-rhythm-container';
        
        const beatIndicator = document.createElement('div');
        beatIndicator.className = 'qte-beat-indicator';
        
        const clickButton = document.createElement('button');
        clickButton.className = 'qte-rhythm-button';
        clickButton.textContent = '♪ 点击节拍 ♪';
        
        const scoreDisplay = document.createElement('div');
        scoreDisplay.className = 'qte-score-display';
        scoreDisplay.textContent = `得分: ${score}/${beats.length}`;
        
        rhythmContainer.appendChild(beatIndicator);
        rhythmContainer.appendChild(clickButton);
        rhythmContainer.appendChild(scoreDisplay);
        this.contentArea.appendChild(rhythmContainer);
        
        // 节拍动画
        const animateBeat = () => {
            if (!this.isActive) return;
            
            const currentTime = Date.now() - startTime;
            const nextBeatTime = beats[currentBeatIndex];
            
            if (nextBeatTime && currentTime >= nextBeatTime - 500) {
                beatIndicator.classList.add('qte-beat-active');
            }
            
            if (currentTime >= nextBeatTime + tolerance && currentBeatIndex < beats.length) {
                // 错过了节拍
                currentBeatIndex++;
                beatIndicator.classList.remove('qte-beat-active');
                
                if (currentBeatIndex >= beats.length) {
                    this.endRhythmQTE(score >= beats.length * 0.7);
                    return;
                }
            }
            
            this.animationId = requestAnimationFrame(animateBeat);
        };
        
        // 点击处理
        this.addEventListenerTracked(clickButton, 'click', () => {
            if (!this.isActive || currentBeatIndex >= beats.length) return;
            
            const currentTime = Date.now() - startTime;
            const targetTime = beats[currentBeatIndex];
            const timeDiff = Math.abs(currentTime - targetTime);
            
            if (timeDiff <= tolerance) {
                // 成功点击
                score++;
                beatIndicator.classList.add('qte-beat-success');
                clickButton.style.backgroundColor = '#4CAF50';
                
                this.addTimer(setTimeout(() => {
                    beatIndicator.classList.remove('qte-beat-success', 'qte-beat-active');
                    clickButton.style.backgroundColor = '';
                }, 200));
            } else {
                // 点击错误
                beatIndicator.classList.add('qte-beat-error');
                clickButton.style.backgroundColor = '#F44336';
                
                this.addTimer(setTimeout(() => {
                    beatIndicator.classList.remove('qte-beat-error');
                    clickButton.style.backgroundColor = '';
                }, 200));
            }
            
            currentBeatIndex++;
            scoreDisplay.textContent = `得分: ${score}/${beats.length}`;
            
            if (currentBeatIndex >= beats.length) {
                this.addTimer(setTimeout(() => {
                    this.endRhythmQTE(score >= beats.length * 0.7);
                }, 500));
            }
        });
        
        animateBeat();
    }
    
    endRhythmQTE(success) {
        const result = success ? '节拍大师!' : '节拍失败!';
        this.instructionTextElement.textContent = result;
        this.addTimer(setTimeout(() => this.end(success), 1000));
    }

    /**
     * "拖拽操作"类型QTE - 将物品拖拽到指定位置
     * @param {Object} config - QTE配置
     */
    dragDropQTE(config) {
        const items = config.parameters.items || [
            { id: 'item1', name: '工具箱', targetZone: 'zone1' },
            { id: 'item2', name: '零件', targetZone: 'zone2' }
        ];
        
        let completedItems = 0;
        
        // 创建界面
        const dragContainer = document.createElement('div');
        dragContainer.className = 'qte-drag-container';
        
        const itemsArea = document.createElement('div');
        itemsArea.className = 'qte-items-area';
        
        const zonesArea = document.createElement('div');
        zonesArea.className = 'qte-zones-area';
        
        // 创建拖拽物品
        items.forEach(item => {
            const itemElement = document.createElement('div');
            itemElement.className = 'qte-drag-item';
            itemElement.textContent = item.name;
            itemElement.draggable = true;
            itemElement.dataset.itemId = item.id;
            itemElement.dataset.targetZone = item.targetZone;
            
            this.addEventListenerTracked(itemElement, 'dragstart', (e) => {
                e.dataTransfer.setData('text/plain', item.id);
                itemElement.classList.add('qte-dragging');
            });
            
            this.addEventListenerTracked(itemElement, 'dragend', () => {
                itemElement.classList.remove('qte-dragging');
            });
            
            itemsArea.appendChild(itemElement);
        });
        
        // 创建放置区域
        const uniqueZones = [...new Set(items.map(item => item.targetZone))];
        uniqueZones.forEach(zoneId => {
            const zoneElement = document.createElement('div');
            zoneElement.className = 'qte-drop-zone';
            zoneElement.textContent = `放置区域 ${zoneId.slice(-1)}`;
            zoneElement.dataset.zoneId = zoneId;
            
            this.addEventListenerTracked(zoneElement, 'dragover', (e) => {
                e.preventDefault();
                zoneElement.classList.add('qte-drop-hover');
            });
            
            this.addEventListenerTracked(zoneElement, 'dragleave', () => {
                zoneElement.classList.remove('qte-drop-hover');
            });
            
            this.addEventListenerTracked(zoneElement, 'drop', (e) => {
                e.preventDefault();
                const itemId = e.dataTransfer.getData('text/plain');
                const itemElement = itemsArea.querySelector(`[data-item-id="${itemId}"]`);
                
                if (itemElement && itemElement.dataset.targetZone === zoneId) {
                    // 正确放置
                    zoneElement.appendChild(itemElement);
                    zoneElement.classList.add('qte-drop-success');
                    itemElement.classList.add('qte-item-placed');
                    completedItems++;
                    
                    if (completedItems >= items.length) {
                        this.addTimer(setTimeout(() => this.end(true), 1000));
                    }
                } else {
                    // 错误放置
                    zoneElement.classList.add('qte-drop-error');
                    this.addTimer(setTimeout(() => {
                        zoneElement.classList.remove('qte-drop-error');
                    }, 500));
                }
                
                zoneElement.classList.remove('qte-drop-hover');
            });
            
            zonesArea.appendChild(zoneElement);
        });
        
        dragContainer.appendChild(itemsArea);
        dragContainer.appendChild(zonesArea);
        this.contentArea.appendChild(dragContainer);
        
        // 设置超时
        this.animationId = this.addTimer(setTimeout(() => {
            if (this.isActive && completedItems < items.length) {
                this.end(false);
            }
        }, config.parameters.timeLimit || 10000));
    }

    /**
     * "旋转操作"类型QTE - 旋转物体到指定角度
     * @param {Object} config - QTE配置
     */
    rotateQTE(config) {
        const targetAngle = config.parameters.targetAngle || 90;
        const tolerance = config.parameters.tolerance || 10;
        let currentAngle = 0;
        let isRotating = false;
        
        // 创建界面
        const rotateContainer = document.createElement('div');
        rotateContainer.className = 'qte-rotate-container';
        
        const rotateObject = document.createElement('div');
        rotateObject.className = 'qte-rotate-object';
        rotateObject.textContent = '🔧';
        
        const targetIndicator = document.createElement('div');
        targetIndicator.className = 'qte-target-indicator';
        targetIndicator.style.transform = `rotate(${targetAngle}deg)`;
        
        const angleDisplay = document.createElement('div');
        angleDisplay.className = 'qte-angle-display';
        angleDisplay.textContent = `当前角度: ${currentAngle}° / 目标: ${targetAngle}°`;
        
        const rotateButton = document.createElement('button');
        rotateButton.className = 'qte-rotate-button';
        rotateButton.textContent = '旋转';
        
        rotateContainer.appendChild(targetIndicator);
        rotateContainer.appendChild(rotateObject);
        rotateContainer.appendChild(angleDisplay);
        rotateContainer.appendChild(rotateButton);
        this.contentArea.appendChild(rotateContainer);
        
        // 旋转控制
        const updateRotation = () => {
            rotateObject.style.transform = `rotate(${currentAngle}deg)`;
            angleDisplay.textContent = `当前角度: ${Math.round(currentAngle)}° / 目标: ${targetAngle}°`;
            
            const angleDiff = Math.abs(currentAngle - targetAngle);
            if (angleDiff <= tolerance) {
                rotateObject.classList.add('qte-rotate-success');
                rotateButton.disabled = true;
                rotateButton.textContent = '完成!';
                this.addTimer(setTimeout(() => this.end(true), 1000));
            }
        };
        
        this.addEventListenerTracked(rotateButton, 'mousedown', () => {
            isRotating = true;
            rotateButton.classList.add('qte-rotating');
        });
        
        this.addEventListenerTracked(document, 'mouseup', () => {
            isRotating = false;
            rotateButton.classList.remove('qte-rotating');
        });
        
        const rotateLoop = () => {
            if (!this.isActive) return;
            
            if (isRotating) {
                currentAngle += 2;
                if (currentAngle >= 360) currentAngle -= 360;
                updateRotation();
            }
            
            this.animationId = requestAnimationFrame(rotateLoop);
        };
        
        rotateLoop();
        
        // 设置超时
        this.addTimer(setTimeout(() => {
            if (this.isActive) {
                this.end(false);
            }
        }, config.parameters.timeLimit || 8000));
    }

    /**
     * "记忆序列"类型QTE - 记住并重复序列
     * @param {Object} config - QTE配置
     */
    memorySequenceQTE(config) {
        const sequence = config.parameters.sequence || [1, 2, 3, 4];
        const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7'];
        let playerSequence = [];
        let showingSequence = true;
        let currentShowIndex = 0;
        
        // 创建界面
        const memoryContainer = document.createElement('div');
        memoryContainer.className = 'qte-memory-container';
        
        const statusText = document.createElement('div');
        statusText.className = 'qte-memory-status';
        statusText.textContent = '观察序列...';
        
        const buttonsContainer = document.createElement('div');
        buttonsContainer.className = 'qte-memory-buttons';
        
        // 创建按钮
        for (let i = 1; i <= 5; i++) {
            const button = document.createElement('button');
            button.className = 'qte-memory-button';
            button.textContent = i;
            button.style.backgroundColor = colors[i - 1];
            button.dataset.value = i;
            button.disabled = true;
            
            this.addEventListenerTracked(button, 'click', () => {
                if (showingSequence) return;
                
                playerSequence.push(parseInt(button.dataset.value));
                button.classList.add('qte-memory-clicked');
                
                this.addTimer(setTimeout(() => {
                    button.classList.remove('qte-memory-clicked');
                }, 200));
                
                // 检查序列
                const currentIndex = playerSequence.length - 1;
                if (playerSequence[currentIndex] !== sequence[currentIndex]) {
                    // 错误
                    statusText.textContent = '序列错误!';
                    this.addTimer(setTimeout(() => this.end(false), 1000));
                    return;
                }
                
                if (playerSequence.length === sequence.length) {
                    // 完成
                    statusText.textContent = '序列正确!';
                    this.addTimer(setTimeout(() => this.end(true), 1000));
                }
            });
            
            buttonsContainer.appendChild(button);
        }
        
        memoryContainer.appendChild(statusText);
        memoryContainer.appendChild(buttonsContainer);
        this.contentArea.appendChild(memoryContainer);
        
        // 显示序列
        const showSequence = () => {
            if (currentShowIndex >= sequence.length) {
                showingSequence = false;
                statusText.textContent = '重复序列!';
                buttonsContainer.querySelectorAll('button').forEach(btn => {
                    btn.disabled = false;
                });
                return;
            }
            
            const buttonValue = sequence[currentShowIndex];
            const button = buttonsContainer.querySelector(`[data-value="${buttonValue}"]`);
            button.classList.add('qte-memory-highlight');
            
            this.addTimer(setTimeout(() => {
                button.classList.remove('qte-memory-highlight');
                currentShowIndex++;
                this.addTimer(setTimeout(showSequence, 500));
            }, 800));
        };
        
        this.addTimer(setTimeout(showSequence, 1000));
    }

    /**
     * "精准点击"类型QTE - 点击移动的小目标
     * @param {Object} config - QTE配置
     */
    precisionClickQTE(config) {
        const targetCount = config.parameters.targetCount || 5;
        const targetSpeed = config.parameters.targetSpeed || 2;
        let hitTargets = 0;
        let missedTargets = 0;
        const maxMisses = 2;
        
        // 创建界面
        const precisionContainer = document.createElement('div');
        precisionContainer.className = 'qte-precision-container';
        
        const scoreDisplay = document.createElement('div');
        scoreDisplay.className = 'qte-precision-score';
        scoreDisplay.textContent = `命中: ${hitTargets}/${targetCount} | 失误: ${missedTargets}/${maxMisses}`;
        
        const gameArea = document.createElement('div');
        gameArea.className = 'qte-precision-area';
        
        precisionContainer.appendChild(scoreDisplay);
        precisionContainer.appendChild(gameArea);
        this.contentArea.appendChild(precisionContainer);
        
        // 创建目标
        const createTarget = () => {
            if (!this.isActive || hitTargets >= targetCount) return;
            
            const target = document.createElement('div');
            target.className = 'qte-precision-target';
            target.style.left = Math.random() * 80 + '%';
            target.style.top = Math.random() * 80 + '%';
            
            let targetLife = 2000; // 目标存在时间
            
            this.addEventListenerTracked(target, 'click', () => {
                if (!target.classList.contains('qte-target-hit')) {
                    target.classList.add('qte-target-hit');
                    hitTargets++;
                    updateScore();
                    
                    if (hitTargets >= targetCount) {
                        this.addTimer(setTimeout(() => this.end(true), 500));
                    }
                }
            });
            
            gameArea.appendChild(target);
            
            // 目标消失
            this.addTimer(setTimeout(() => {
                if (gameArea.contains(target) && !target.classList.contains('qte-target-hit')) {
                    missedTargets++;
                    target.classList.add('qte-target-missed');
                    updateScore();
                    
                    if (missedTargets >= maxMisses) {
                        this.addTimer(setTimeout(() => this.end(false), 500));
                        return;
                    }
                }
                
                this.addTimer(setTimeout(() => {
                    if (gameArea.contains(target)) {
                        gameArea.removeChild(target);
                    }
                }, 500));
            }, targetLife));
            
            // 创建下一个目标
            this.addTimer(setTimeout(createTarget, 1000 / targetSpeed));
        };
        
        const updateScore = () => {
            scoreDisplay.textContent = `命中: ${hitTargets}/${targetCount} | 失误: ${missedTargets}/${maxMisses}`;
        };
        
        createTarget();
    }

    /**
     * "多任务"类型QTE - 同时处理多个任务
     * @param {Object} config - QTE配置
     */
    multiTaskQTE(config) {
        const tasks = config.parameters.tasks || [
            { type: 'button', target: 10, current: 0 },
            { type: 'slider', target: 75, current: 0 }
        ];
        
        // 创建界面
        const multiContainer = document.createElement('div');
        multiContainer.className = 'qte-multi-container';
        
        tasks.forEach((task, index) => {
            const taskElement = document.createElement('div');
            taskElement.className = 'qte-multi-task';
            
            if (task.type === 'button') {
                const button = document.createElement('button');
                button.className = 'qte-multi-button';
                button.textContent = `点击 (${task.current}/${task.target})`;
                
                this.addEventListenerTracked(button, 'click', () => {
                    task.current++;
                    button.textContent = `点击 (${task.current}/${task.target})`;
                    
                    if (task.current >= task.target) {
                        button.disabled = true;
                        button.classList.add('qte-task-complete');
                        checkAllTasksComplete();
                    }
                });
                
                taskElement.appendChild(button);
            } else if (task.type === 'slider') {
                const slider = document.createElement('input');
                slider.type = 'range';
                slider.min = 0;
                slider.max = 100;
                slider.value = 0;
                slider.className = 'qte-multi-slider';
                
                const label = document.createElement('div');
                label.textContent = `滑块: ${task.current}/${task.target}`;
                
                this.addEventListenerTracked(slider, 'input', () => {
                    task.current = parseInt(slider.value);
                    label.textContent = `滑块: ${task.current}/${task.target}`;
                    
                    if (task.current >= task.target) {
                        slider.disabled = true;
                        slider.classList.add('qte-task-complete');
                        checkAllTasksComplete();
                    }
                });
                
                taskElement.appendChild(label);
                taskElement.appendChild(slider);
            }
            
            multiContainer.appendChild(taskElement);
        });
        
        this.contentArea.appendChild(multiContainer);
        
        const checkAllTasksComplete = () => {
            const allComplete = tasks.every(task => task.current >= task.target);
            if (allComplete) {
                this.addTimer(setTimeout(() => this.end(true), 500));
            }
        };
        
        // 设置超时
        this.animationId = this.addTimer(setTimeout(() => {
            if (this.isActive) {
                this.end(false);
            }
        }, config.parameters.timeLimit || 15000));
    }
}

// 导出QTE系统
window.QTESystem = QTESystem;