// 增强版游戏系统
class EnhancedGameSystem {
    constructor() {
        this.achievements = new AchievementSystem();
        this.saveSystem = new SaveSystem();
        this.tutorialSystem = new TutorialSystem();
        this.soundSystem = new SoundSystem();
        this.analytics = new GameAnalytics();
        
        this.gameData = {
            level: 1,
            exp: 0,
            coins: 500,
            achievements: [],
            completedScenarios: [],
            totalPlayTime: 0,
            settings: {
                soundEnabled: true,
                musicEnabled: true,
                difficulty: 'normal',
                autoSave: true
            }
        };
        
        this.init();
    }
    
    init() {
        this.loadGameData(); // 加载基础游戏数据
        this.saveSystem.slots = this.saveSystem.loadSaveSlotsMeta(); //确保存档元数据在游戏系统初始化时加载
        this.setupEventListeners();
        this.startPlayTimeTracking();
    }
    
    loadGameData() {
        const saved = localStorage.getItem('propertyManagerGameData');
        if (saved) {
            this.gameData = { ...this.gameData, ...JSON.parse(saved) };
        }
        this.updateUI();
    }
    
    saveGameData() {
        localStorage.setItem('propertyManagerGameData', JSON.stringify(this.gameData));
    }
    
    updateUI() {
        const elements = {
            level: document.getElementById('playerLevel'),
            exp: document.getElementById('playerExp'),
            coins: document.getElementById('playerCoins')
        };
        
        if (elements.level) elements.level.textContent = this.gameData.level;
        if (elements.exp) elements.exp.textContent = `${this.gameData.exp}/${this.gameData.level * 100}`;
        if (elements.coins) elements.coins.textContent = this.gameData.coins;
    }
    
    addExperience(amount) {
        this.gameData.exp += amount;
        const requiredExp = this.gameData.level * 100;
        
        if (this.gameData.exp >= requiredExp) {
            this.levelUp();
        }
        
        this.updateUI();
        this.saveGameData();
    }
    
    levelUp() {
        this.gameData.level++;
        this.gameData.exp = 0;
        this.gameData.coins += this.gameData.level * 50;
        
        this.showLevelUpNotification();
        this.achievements.checkAchievement('level_up', this.gameData.level);
    }
    
    showLevelUpNotification() {
        const notification = document.createElement('div');
        notification.className = 'level-up-notification';
        notification.innerHTML = `
            <div class="level-up-content">
                <h3>🎉 升级了！</h3>
                <p>恭喜达到等级 ${this.gameData.level}</p>
                <p>获得 ${this.gameData.level * 50} 金币奖励</p>
            </div>
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.remove();
        }, 3000);
    }
    
    setupEventListeners() {
        // 键盘快捷键
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey || e.metaKey) {
                switch(e.key.toLowerCase()) { // 使用toLowerCase以兼容大小写
                    case 's':
                        e.preventDefault();
                        this.saveSystem.quickSave();
                        break;
                    case 'l':
                        e.preventDefault();
                        this.saveSystem.quickLoad();
                        break;
                    case 'o': // Ctrl+O 打开存档界面
                        e.preventDefault();
                        this.saveSystem.showSaveLoadUI();
                        break;
                }
            }
        });
    }
    
    startPlayTimeTracking() {
        setInterval(() => {
            this.gameData.totalPlayTime += 1;
            if (this.gameData.settings.autoSave && this.gameData.totalPlayTime > 0 && this.gameData.totalPlayTime % 300 === 0) { // 确保totalPlayTime > 0
                this.saveSystem.saveGame('auto'); // 使用SaveSystem的saveGame方法进行自动存档
                console.log('游戏已自动保存');
            }
        }, 1000);
    }
}

// 成就系统
class AchievementSystem {
    constructor() {
        this.achievements = {
            'first_scenario': {
                id: 'first_scenario',
                name: '初出茅庐',
                description: '完成第一个场景',
                icon: '🌟',
                reward: { exp: 50, coins: 100 }
            },
            'crisis_expert': {
                id: 'crisis_expert',
                name: '危机处理专家',
                description: '成功处理5个紧急事件',
                icon: '💼',
                reward: { exp: 200, coins: 300 }
            },
            'relationship_master': {
                id: 'relationship_master',
                name: '人际关系大师',
                description: '与所有NPC建立良好关系',
                icon: '👥',
                reward: { exp: 300, coins: 500 }
            },
            'perfectionist': {
                id: 'perfectionist',
                name: '完美主义者',
                description: '在一个场景中获得满分',
                icon: '⭐',
                reward: { exp: 150, coins: 200 }
            },
            'speed_runner': {
                id: 'speed_runner',
                name: '速度之王',
                description: '在5分钟内完成一个场景',
                icon: '⚡',
                reward: { exp: 100, coins: 150 }
            }
        };
    }
    
    checkAchievement(type, value) {
        // 检查成就条件
        switch(type) {
            case 'scenario_complete':
                if (!gameSystem.gameData.achievements.includes('first_scenario')) {
                    this.unlockAchievement('first_scenario');
                }
                break;
            case 'level_up':
                if (value >= 5 && !gameSystem.gameData.achievements.includes('experienced')) {
                    this.unlockAchievement('experienced');
                }
                break;
        }
    }
    
    unlockAchievement(achievementId) {
        if (gameSystem.gameData.achievements.includes(achievementId)) return;
        
        const achievement = this.achievements[achievementId];
        if (!achievement) return;
        
        gameSystem.gameData.achievements.push(achievementId);
        
        // 给予奖励
        if (achievement.reward.exp) {
            gameSystem.addExperience(achievement.reward.exp);
        }
        if (achievement.reward.coins) {
            gameSystem.gameData.coins += achievement.reward.coins;
        }
        
        this.showAchievementNotification(achievement);
        gameSystem.saveGameData();
    }
    
    showAchievementNotification(achievement) {
        const notification = document.createElement('div');
        notification.className = 'achievement-notification';
        notification.innerHTML = `
            <div class="achievement-content">
                <div class="achievement-icon">${achievement.icon}</div>
                <div class="achievement-text">
                    <h4>成就解锁！</h4>
                    <h3>${achievement.name}</h3>
                    <p>${achievement.description}</p>
                </div>
            </div>
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.remove();
        }, 4000);
    }
}

// 存档系统
class SaveSystem {
    constructor() {
        this.maxSlots = 5; // 包括自动存档槽
        this.slots = this.loadSaveSlotsMeta();
    }

    loadSaveSlotsMeta() {
        const metas = {};
        for (let i = 0; i < this.maxSlots; i++) {
            const slotId = i === 0 ? 'auto' : `slot${i}`;
            const meta = localStorage.getItem(`propertyGame_${slotId}_meta`);
            if (meta) {
                metas[slotId] = JSON.parse(meta);
            } else {
                metas[slotId] = { slotId, timestamp: null, name: i === 0 ? '自动存档' : `存档 ${i}`, isEmpty: true };
            }
        }
        return metas;
    }

    saveSlotMeta(slotId) {
        localStorage.setItem(`propertyGame_${slotId}_meta`, JSON.stringify(this.slots[slotId]));
    }

    quickSave() {
        // 默认快速保存到第一个手动存档槽，如果为空则使用，否则覆盖
        const manualSlots = Object.values(this.slots).filter(s => s.slotId !== 'auto');
        let targetSlot = manualSlots.find(s => s.isEmpty);
        if (!targetSlot) {
            targetSlot = manualSlots.sort((a,b) => (a.timestamp || 0) - (b.timestamp || 0))[0] || this.slots['slot1'];
        }
        if (this.saveGame(targetSlot.slotId, targetSlot.name)) {
            this.showNotification(`游戏已快速保存到 ${targetSlot.name}`, 'success');
        } else {
            this.showNotification('快速保存失败', 'error');
        }
    }

    quickLoad() {
        // 默认快速加载最新的手动存档
        const manualSlots = Object.values(this.slots)
            .filter(s => s.slotId !== 'auto' && !s.isEmpty)
            .sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
        
        if (manualSlots.length > 0) {
            if (this.loadGame(manualSlots[0].slotId)) {
                this.showNotification(`已从 ${manualSlots[0].name} 加载游戏`, 'success');
            } else {
                this.showNotification('快速加载失败', 'error');
            }
        } else {
            this.showNotification('没有找到可加载的手动存档', 'error');
        }
    }

    saveGame(slotId, name = null) {
        const slotMeta = this.slots[slotId];
        if (!slotMeta) {
            console.error('无效的存档槽:', slotId);
            return false;
        }

        const saveData = {
            gameData: { ...gameSystem.gameData }, // 深拷贝一份以防意外修改
            timestamp: Date.now(),
            version: '1.0.1', // 版本号更新
            name: name || slotMeta.name || (slotId === 'auto' ? '自动存档' : `存档 ${slotId.replace('slot', '')}`)
        };

        try {
            localStorage.setItem(`propertyGame_${slotId}`, JSON.stringify(saveData));
            slotMeta.timestamp = saveData.timestamp;
            slotMeta.name = saveData.name;
            slotMeta.isEmpty = false;
            this.saveSlotMeta(slotId);
            return true;
        } catch (e) {
            console.error('保存游戏失败:', e);
            this.showNotification('保存失败，存储空间可能已满', 'error');
            return false;
        }
    }

    loadGame(slotId) {
        const saveDataStr = localStorage.getItem(`propertyGame_${slotId}`);
        if (!saveDataStr) return false;

        try {
            const saveData = JSON.parse(saveDataStr);
            // TODO: 版本兼容性检查 saveData.version
            gameSystem.gameData = saveData.gameData;
            gameSystem.updateUI();
            gameSystem.startPlayTimeTracking(); // 重新开始计时
            return true;
        } catch (error) {
            console.error('加载存档失败:', error);
            this.showNotification('加载存档失败，存档可能已损坏', 'error');
            return false;
        }
    }

    deleteGame(slotId) {
        const slotMeta = this.slots[slotId];
        if (slotMeta && !slotMeta.isEmpty) {
            localStorage.removeItem(`propertyGame_${slotId}`);
            slotMeta.timestamp = null;
            slotMeta.isEmpty = true;
            // 保留自定义名称或重置为默认
            // slotMeta.name = slotId === 'auto' ? '自动存档' : `存档 ${slotId.replace('slot', '')}`;
            this.saveSlotMeta(slotId);
            this.showNotification(`${slotMeta.name} 已删除`, 'success');
            return true;
        }
        this.showNotification('存档为空或不存在', 'error');
        return false;
    }

    renameSlot(slotId, newName) {
        const slotMeta = this.slots[slotId];
        if (slotMeta && newName.trim() !== '') {
            slotMeta.name = newName.trim();
            this.saveSlotMeta(slotId);
            // 如果存档存在，也更新存档内的名称
            const saveDataStr = localStorage.getItem(`propertyGame_${slotId}`);
            if (saveDataStr) {
                try {
                    const saveData = JSON.parse(saveDataStr);
                    saveData.name = newName.trim();
                    localStorage.setItem(`propertyGame_${slotId}`, JSON.stringify(saveData));
                } catch (e) {
                    console.error('更新存档内名称失败:', e);
                }
            }
            this.showNotification('存档已重命名', 'success');
            return true;
        }
        this.showNotification('重命名失败，名称不能为空', 'error');
        return false;
    }

    getFormattedTimestamp(timestamp) {
        if (!timestamp) return 'N/A';
        return new Date(timestamp).toLocaleString('zh-CN', { 
            year: 'numeric', month: '2-digit', day: '2-digit', 
            hour: '2-digit', minute: '2-digit' 
        });
    }

    showSaveLoadUI() {
        let modal = document.getElementById('saveLoadModal');
        if (modal) modal.remove();

        modal = document.createElement('div');
        modal.id = 'saveLoadModal';
        modal.className = 'modal active'; // 使用index.html中的modal样式
        modal.style.display = 'block'; // 确保显示

        let content = `<div class="modal-content" style="max-width: 600px;">
            <span class="close-button" onclick="document.getElementById('saveLoadModal').remove();">&times;</span>
            <h2>保存/加载游戏</h2>
            <div class="save-slots-container">`;

        Object.values(this.slots).forEach(slot => {
            content += `
                <div class="save-slot ${slot.isEmpty ? 'empty' : ''}">
                    <div class="slot-info">
                        <input type="text" value="${slot.name}" class="slot-name-input" data-slotid="${slot.slotId}" onchange="gameSystem.saveSystem.renameSlot('${slot.slotId}', this.value)">
                        <span class="slot-timestamp">${this.getFormattedTimestamp(slot.timestamp)}</span>
                    </div>
                    <div class="slot-actions">
                        <button onclick="gameSystem.saveSystem.handleSaveClick('${slot.slotId}')" ${slot.slotId === 'auto' ? 'disabled title="自动存档无法手动保存"' : ''}>保存</button>
                        <button onclick="gameSystem.saveSystem.handleLoadClick('${slot.slotId}')" ${slot.isEmpty ? 'disabled' : ''}>加载</button>
                        <button class="delete-button" onclick="gameSystem.saveSystem.handleDeleteClick('${slot.slotId}')" ${slot.isEmpty || slot.slotId === 'auto' ? 'disabled' : ''}>删除</button>
                    </div>
                </div>`;
        });

        content += `</div></div>`;
        modal.innerHTML = content;
        document.body.appendChild(modal);

        // 添加必要的CSS
        const saveLoadStyleId = 'saveLoadModalStyles';
        if (!document.getElementById(saveLoadStyleId)) {
            const style = document.createElement('style');
            style.id = saveLoadStyleId;
            style.textContent = \`
                .save-slots-container { display: flex; flex-direction: column; gap: 10px; margin-top: 20px; }
                .save-slot { display: flex; justify-content: space-between; align-items: center; padding: 10px; border: 1px solid #ccc; border-radius: 5px; background-color: #f9f9f9; }
                .save-slot.empty { background-color: #e9e9e9; }
                .slot-info { display: flex; flex-direction: column; }
                .slot-name-input { font-weight: bold; border: 1px solid transparent; background: transparent; padding: 2px; margin-bottom: 5px; }
                .slot-name-input:hover, .slot-name-input:focus { border-color: #aaa; background: white; }
                .slot-timestamp { font-size: 0.8em; color: #555; }
                .slot-actions button { margin-left: 5px; padding: 5px 10px; cursor: pointer; border-radius: 3px; border: 1px solid #ddd; }
                .slot-actions button:disabled { opacity: 0.5; cursor: not-allowed; }
                .slot-actions .delete-button { background-color: #E53E3E; color: white; border-color: #E53E3E; }
                .slot-actions .delete-button:hover:not(:disabled) { background-color: #C53030; }
            \`;
            document.head.appendChild(style);
        }
    }

    handleSaveClick(slotId) {
        if (this.saveGame(slotId, this.slots[slotId].name)) {
            this.showNotification(`${this.slots[slotId].name} 已保存`, 'success');
            this.showSaveLoadUI(); // Refresh UI
        }
    }

    handleLoadClick(slotId) {
        if (this.loadGame(slotId)) {
            this.showNotification(`已从 ${this.slots[slotId].name} 加载`, 'success');
            document.getElementById('saveLoadModal')?.remove();
        } else {
            this.showNotification('加载失败', 'error');
        }
    }

    handleDeleteClick(slotId) {
        if (confirm(`确定要删除存档 "${this.slots[slotId].name}"？此操作无法撤销。`)) {
            if (this.deleteGame(slotId)) {
                this.showSaveLoadUI(); // Refresh UI
            }
        }
    }// 教程系统
class TutorialSystem {
    constructor() {
        this.currentStep = 0;
        this.isActive = false;
        this.steps = [];
    }
    
    startTutorial(tutorialData) {
        this.steps = tutorialData.steps;
        this.currentStep = 0;
        this.isActive = true;
        this.showStep();
    }
    
    showStep() {
        if (this.currentStep >= this.steps.length) {
            this.completeTutorial();
            return;
        }
        
        const step = this.steps[this.currentStep];
        const overlay = document.createElement('div');
        overlay.className = 'tutorial-overlay';
        
        overlay.innerHTML = `
            <div class="tutorial-content">
                <h3>${step.title}</h3>
                <p>${step.description}</p>
                <div class="tutorial-actions">
                    <button onclick="tutorialSystem.nextStep()">下一步</button>
                    <button onclick="tutorialSystem.skipTutorial()">跳过</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(overlay);
    }
    
    nextStep() {
        document.querySelector('.tutorial-overlay')?.remove();
        this.currentStep++;
        this.showStep();
    }
    
    skipTutorial() {
        document.querySelector('.tutorial-overlay')?.remove();
        this.isActive = false;
    }
    
    completeTutorial() {
        this.isActive = false;
        gameSystem.achievements.unlockAchievement('tutorial_complete');
    }
}

// 音效系统
class SoundSystem {
    constructor() {
        this.sounds = {};
        this.enabled = true;
    }
    
    loadSound(name, url) {
        this.sounds[name] = new Audio(url);
    }
    
    playSound(name) {
        if (!this.enabled || !this.sounds[name]) return;
        
        this.sounds[name].currentTime = 0;
        this.sounds[name].play().catch(e => console.log('音效播放失败:', e));
    }
    
    setEnabled(enabled) {
        this.enabled = enabled;
    }
}

// 游戏分析系统
class GameAnalytics {
    constructor() {
        this.events = [];
    }
    
    trackEvent(eventType, data) {
        const event = {
            type: eventType,
            data: data,
            timestamp: Date.now()
        };
        
        this.events.push(event);
        
        // 保存到本地存储
        localStorage.setItem('gameAnalytics', JSON.stringify(this.events));
    }
    
    getStats() {
        return {
            totalEvents: this.events.length,
            playTime: gameSystem.gameData.totalPlayTime,
            level: gameSystem.gameData.level,
            achievements: gameSystem.gameData.achievements.length
        };
    }
}

// 全局游戏系统实例
let gameSystem;

// 初始化
document.addEventListener('DOMContentLoaded', function() {
    gameSystem = new EnhancedGameSystem();
    
    // 添加CSS样式
    const style = document.createElement('style');
    style.textContent = `
        .level-up-notification,
        .achievement-notification {
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: white;
            padding: 2rem;
            border-radius: 15px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.3);
            z-index: 1000;
            text-align: center;
            animation: slideIn 0.3s ease;
        }
        
        .achievement-content {
            display: flex;
            align-items: center;
            gap: 1rem;
        }
        
        .achievement-icon {
            font-size: 3rem;
        }
        
        .save-notification {
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 1rem 2rem;
            border-radius: 8px;
            color: white;
            z-index: 1000;
            animation: slideInRight 0.3s ease;
        }
        
        .save-notification.success {
            background: #48BB78;
        }
        
        .save-notification.error {
            background: #E53E3E;
        }
        
        .tutorial-overlay {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0,0,0,0.8);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 1000;
        }
        
        .tutorial-content {
            background: white;
            padding: 2rem;
            border-radius: 15px;
            max-width: 500px;
            text-align: center;
        }
        
        .tutorial-actions {
            display: flex;
            gap: 1rem;
            justify-content: center;
            margin-top: 1rem;
        }
        
        .tutorial-actions button {
            padding: 0.5rem 1rem;
            border: none;
            border-radius: 5px;
            cursor: pointer;
            background: #4A6FDC;
            color: white;
        }
        
        @keyframes slideIn {
            from { opacity: 0; transform: translate(-50%, -50%) scale(0.8); }
            to { opacity: 1; transform: translate(-50%, -50%) scale(1); }
        }
        
        @keyframes slideInRight {
            from { transform: translateX(100%); }
            to { transform: translateX(0); }
        }
    `;
    
    document.head.appendChild(style);
});

// 导出给其他文件使用
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { EnhancedGameSystem, AchievementSystem, SaveSystem, TutorialSystem };
}