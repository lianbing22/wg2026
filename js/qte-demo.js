/**
 * 物业管理模拟器 - 增强型QTE系统演示
 * 此演示文件用于测试和展示增强型QTE系统的各种功能
 */

document.addEventListener('DOMContentLoaded', function() {
    // 检查QTE容器是否已存在，如果不存在则创建
    let qteContainer = document.getElementById('qte-container');
    if (!qteContainer) {
        qteContainer = document.createElement('div');
        qteContainer.id = 'qte-container';
        qteContainer.className = 'qte-container';
        
        const instructionText = document.createElement('div');
        instructionText.id = 'qte-instruction-text';
        instructionText.className = 'qte-instruction';
        
        const contentArea = document.createElement('div');
        contentArea.id = 'qte-content-area';
        contentArea.className = 'qte-content-area';
        
        qteContainer.appendChild(instructionText);
        qteContainer.appendChild(contentArea);
        
        document.body.appendChild(qteContainer);
    }
    
    // 创建QTE演示控制面板
    const demoPanel = document.createElement('div');
    demoPanel.className = 'qte-demo-panel';
    demoPanel.innerHTML = `
        <h2>增强型QTE系统演示</h2>
        <div class="qte-demo-controls">
            <button id="demo-bar-qte" class="demo-button">测试移动条QTE</button>
            <button id="demo-mash-qte" class="demo-button">测试连续点击QTE</button>
            <button id="demo-sequence-qte" class="demo-button">测试图像序列QTE</button>
        </div>
        <div class="qte-demo-options">
            <div class="demo-option">
                <label for="difficulty-level">难度级别:</label>
                <select id="difficulty-level">
                    <option value="1">1 - 非常简单</option>
                    <option value="2">2 - 简单</option>
                    <option value="3" selected>3 - 中等</option>
                    <option value="4">4 - 困难</option>
                    <option value="5">5 - 非常困难</option>
                </select>
            </div>
            <div class="demo-option">
                <label for="sound-enabled">音效:</label>
                <input type="checkbox" id="sound-enabled" checked>
            </div>
        </div>
        <div class="qte-demo-results">
            <h3>测试结果</h3>
            <div id="qte-results-log"></div>
        </div>
    `;
    
    document.body.appendChild(demoPanel);
    
    // 添加演示面板样式
    const style = document.createElement('style');
    style.textContent = `
        .qte-demo-panel {
            position: fixed;
            bottom: 20px;
            right: 20px;
            background-color: rgba(0,0,0,0.8);
            color: white;
            padding: 15px;
            border-radius: 10px;
            width: 300px;
            box-shadow: 0 0 20px rgba(0,0,0,0.5);
            z-index: 999;
        }
        
        .qte-demo-panel h2 {
            margin-top: 0;
            font-size: 18px;
            border-bottom: 1px solid rgba(255,255,255,0.2);
            padding-bottom: 8px;
        }
        
        .qte-demo-controls {
            display: flex;
            flex-direction: column;
            gap: 10px;
            margin-bottom: 15px;
        }
        
        .demo-button {
            background-color: #3F51B5;
            color: white;
            padding: 10px;
            border: none;
            border-radius: 5px;
            cursor: pointer;
            font-weight: bold;
            transition: all 0.3s ease;
        }
        
        .demo-button:hover {
            background-color: #303F9F;
            transform: translateY(-2px);
        }
        
        .qte-demo-options {
            margin-bottom: 15px;
        }
        
        .demo-option {
            display: flex;
            align-items: center;
            justify-content: space-between;
            margin-bottom: 8px;
        }
        
        #difficulty-level {
            padding: 5px;
            border-radius: 3px;
            width: 150px;
        }
        
        .qte-demo-results {
            background-color: rgba(0,0,0,0.3);
            padding: 10px;
            border-radius: 5px;
            max-height: 150px;
            overflow-y: auto;
        }
        
        .qte-demo-results h3 {
            margin-top: 0;
            font-size: 16px;
            margin-bottom: 10px;
        }
        
        #qte-results-log {
            font-size: 14px;
            line-height: 1.5;
        }
        
        .result-entry {
            margin-bottom: 5px;
            padding-bottom: 5px;
            border-bottom: 1px solid rgba(255,255,255,0.1);
        }
        
        .result-success {
            color: #4CAF50;
        }
        
        .result-failure {
            color: #F44336;
        }
    `;
    
    document.head.appendChild(style);
    
    // 初始化增强型QTE系统
    const qteSystem = new EnhancedQTESystem();
    
    // 绑定演示按钮事件
    document.getElementById('demo-bar-qte').addEventListener('click', () => {
        const difficultyLevel = parseInt(document.getElementById('difficulty-level').value);
        qteSystem.difficultyLevel = difficultyLevel;
        
        startStopMovingBarQTE();
    });
    
    document.getElementById('demo-mash-qte').addEventListener('click', () => {
        const difficultyLevel = parseInt(document.getElementById('difficulty-level').value);
        qteSystem.difficultyLevel = difficultyLevel;
        
        startButtonMashQTE();
    });
    
    document.getElementById('demo-sequence-qte').addEventListener('click', () => {
        const difficultyLevel = parseInt(document.getElementById('difficulty-level').value);
        qteSystem.difficultyLevel = difficultyLevel;
        
        startClickSequenceQTE();
    });
    
    // 记录结果的函数
    function logResult(qteType, success) {
        const resultsLog = document.getElementById('qte-results-log');
        const entry = document.createElement('div');
        entry.className = `result-entry ${success ? 'result-success' : 'result-failure'}`;
        
        const timestamp = new Date().toLocaleTimeString();
        entry.textContent = `[${timestamp}] ${qteType}: ${success ? '成功' : '失败'} (难度: ${qteSystem.difficultyLevel})`;
        
        resultsLog.insertBefore(entry, resultsLog.firstChild);
    }
    
    // 移动条QTE演示
    function startStopMovingBarQTE() {
        const qteData = {
            type: "StopTheMovingBar",
            instructionText: "在绿色区域内点击停止按钮!",
            parameters: {
                targetZoneStart: 30,
                targetZoneEnd: 70,
                barSpeed: 50,  // 速度，值越小越快
                timeLimit: 10000  // 10秒时间限制
            }
        };
        
        qteSystem.start(
            qteData,
            () => {
                logResult('移动条QTE', true);
            },
            () => {
                logResult('移动条QTE', false);
            }
        );
    }
    
    // 连续点击QTE演示
    function startButtonMashQTE() {
        const qteData = {
            type: "ButtonMash",
            instructionText: "快速点击按钮达到目标次数!",
            parameters: {
                targetClicks: 20,
                timeLimit: 5000  // 5秒时间限制
            }
        };
        
        qteSystem.start(
            qteData,
            () => {
                logResult('连续点击QTE', true);
            },
            () => {
                logResult('连续点击QTE', false);
            }
        );
    }
    
    // 图像序列QTE演示
    function startClickSequenceQTE() {
        // 准备图像序列
        const sequence = [
            { image: 'assets/images/qte/icon1.png' },
            { image: 'assets/images/qte/icon2.png' },
            { image: 'assets/images/qte/icon3.png' },
            { image: 'assets/images/qte/icon4.png' },
            { image: 'assets/images/qte/icon5.png' }
        ];
        
        // 如果QTE图像不存在，使用占位图像
        const placeholderSequence = [];
        for (let i = 0; i < 5; i++) {
            const index = i + 1;
            placeholderSequence.push({
                image: `https://via.placeholder.com/100x100/3F51B5/FFFFFF?text=${index}`
            });
        }
        
        const qteData = {
            type: "ClickSequence",
            instructionText: "按正确的顺序点击图像!",
            parameters: {
                sequence: placeholderSequence,
                timeLimit: 8000  // 8秒时间限制
            }
        };
        
        qteSystem.start(
            qteData,
            () => {
                logResult('图像序列QTE', true);
            },
            () => {
                logResult('图像序列QTE', false);
            }
        );
    }
    
    // 音效开关控制
    document.getElementById('sound-enabled').addEventListener('change', function() {
        const soundsEnabled = this.checked;
        if (!soundsEnabled) {
            // 禁用音效
            Object.keys(qteSystem.sounds).forEach(key => {
                const sound = qteSystem.sounds[key];
                if (sound && sound.volume) {
                    sound.volume(0);
                } else if (sound) {
                    sound.volume = 0;
                }
            });
        } else {
            // 启用音效
            const volumes = {
                success: 0.7,
                failure: 0.7,
                click: 0.5,
                countdown: 0.6,
                tick: 0.3
            };
            
            Object.keys(qteSystem.sounds).forEach(key => {
                const sound = qteSystem.sounds[key];
                if (sound && sound.volume && typeof sound.volume === 'function') {
                    sound.volume(volumes[key] || 0.5);
                } else if (sound) {
                    sound.volume = volumes[key] || 0.5;
                }
            });
        }
    });
    
    // 初始记录
    logResult('QTE系统', true);
}); 