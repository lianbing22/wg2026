/**
 * 物业管理模拟器 - 场景加载器
 * 负责从场景数据中加载并展示可用场景
 */

class ScenarioLoader {
    constructor() {
        this.scenarios = [];
        this.container = document.getElementById('scenariosContainer');
        this.emptyState = document.getElementById('emptyState');
        this.modal = document.getElementById('scenarioModal');
        this.currentScenarioId = null;
    }

    /**
     * 初始化场景加载器
     */
    init() {
        // 注册事件监听
        document.getElementById('modalClose').addEventListener('click', () => this.closeModal());
        document.getElementById('cancelBtn').addEventListener('click', () => this.closeModal());
        document.getElementById('startBtn').addEventListener('click', () => this.startScenario());
        document.getElementById('retryBtn').addEventListener('click', () => this.loadScenarios());
        
        // 加载场景
        this.loadScenarios();
    }

    /**
     * 加载场景数据
     */
    loadScenarios() {
        try {
            // 在实际应用中，这里可能会从服务器加载场景数据
            // 现在我们使用js/scenarios.js中的数据
            this.scenarios = SCENARIOS || {};
            
            if (Object.keys(this.scenarios).length > 0) {
                this.renderScenarios();
                this.container.style.display = 'grid';
                this.emptyState.style.display = 'none';
            } else {
                this.container.style.display = 'none';
                this.emptyState.style.display = 'block';
            }
        } catch (error) {
            console.error('加载场景失败:', error);
            this.container.style.display = 'none';
            this.emptyState.style.display = 'block';
        }
    }

    /**
     * 渲染场景卡片
     */
    renderScenarios() {
        this.container.innerHTML = '';
        
        Object.values(this.scenarios).forEach(scenario => {
            const card = this.createScenarioCard(scenario);
            this.container.appendChild(card);
        });
    }

    /**
     * 创建场景卡片元素
     * @param {Object} scenario - 场景数据
     * @returns {HTMLElement} - 场景卡片元素
     */
    createScenarioCard(scenario) {
        const card = document.createElement('div');
        card.className = 'scenario-card';
        card.dataset.id = scenario.id;
        
        // 难度展示
        let difficultyValue = 0;
        switch (scenario.difficulty) {
            case '简单':
                difficultyValue = 2;
                break;
            case '中等':
                difficultyValue = 3;
                break;
            case '困难':
                difficultyValue = 4;
                break;
            case '专家':
                difficultyValue = 5;
                break;
            default:
                difficultyValue = 1;
        }
        
        let difficultyHtml = '';
        for (let i = 1; i <= 5; i++) {
            difficultyHtml += `<span class="difficulty-dot${i <= difficultyValue ? ' active' : ''}"></span>`;
        }
        
        card.innerHTML = `
            <img src="${scenario.image}" alt="${scenario.title}" class="scenario-image">
            <div class="scenario-content">
                <h3 class="scenario-title">${scenario.title}</h3>
                <p class="scenario-description">${scenario.description}</p>
                <div class="scenario-details">
                    <div class="scenario-difficulty">
                        <span>难度:</span>
                        <div class="difficulty-indicator">
                            ${difficultyHtml}
                        </div>
                    </div>
                    <div class="scenario-duration">
                        <span>类型:</span>
                        <span>${scenario.category || '未分类'}</span>
                    </div>
                </div>
            </div>
        `;
        
        // 为新场景添加标记
        if (scenario.isNew) {
            const badge = document.createElement('span');
            badge.className = 'scenario-badge';
            badge.textContent = '新场景';
            card.appendChild(badge);
        }
        
        // 添加点击事件
        card.addEventListener('click', () => {
            this.openScenarioModal(scenario);
        });
        
        return card;
    }

    /**
     * 打开场景详情模态框
     * @param {Object} scenario - 场景数据
     */
    openScenarioModal(scenario) {
        this.currentScenarioId = scenario.id;
        
        const title = document.getElementById('modalTitle');
        const subtitle = document.getElementById('modalSubtitle');
        const image = document.getElementById('modalImage');
        const difficulty = document.getElementById('modalDifficulty');
        const duration = document.getElementById('modalDuration');
        const characters = document.getElementById('modalCharacters');
        const challenge = document.getElementById('modalChallenge');
        const description = document.getElementById('modalDescription');
        
        // 设置模态框内容
        title.textContent = scenario.title;
        subtitle.textContent = scenario.description;
        image.src = scenario.image;
        image.alt = scenario.title;
        duration.textContent = scenario.duration || '15-20分钟';
        challenge.textContent = scenario.challenge || scenario.category || '未分类';
        description.textContent = scenario.fullDescription || scenario.description;
        
        // 设置难度指示器
        let difficultyValue = 0;
        switch (scenario.difficulty) {
            case '简单':
                difficultyValue = 2;
                break;
            case '中等':
                difficultyValue = 3;
                break;
            case '困难':
                difficultyValue = 4;
                break;
            case '专家':
                difficultyValue = 5;
                break;
            default:
                difficultyValue = 1;
        }
        
        difficulty.innerHTML = '';
        for (let i = 1; i <= 5; i++) {
            const dot = document.createElement('span');
            dot.className = `difficulty-dot${i <= difficultyValue ? ' active' : ''}`;
            difficulty.appendChild(dot);
        }
        
        // 设置角色图标
        characters.innerHTML = '';
        if (scenario.characters && scenario.characters.length > 0) {
            scenario.characters.forEach(characterSrc => {
                const img = document.createElement('img');
                img.src = characterSrc;
                img.alt = '角色';
                img.className = 'character-icon';
                characters.appendChild(img);
            });
        } else {
            // 默认角色
            const defaultCharacters = [
                'assets/images/characters/staff_technician_wang.png',
                'assets/images/characters/tenant_elderly_liu.png'
            ];
            
            defaultCharacters.forEach(characterSrc => {
                const img = document.createElement('img');
                img.src = characterSrc;
                img.alt = '角色';
                img.className = 'character-icon';
                characters.appendChild(img);
            });
        }
        
        // 显示模态框
        this.modal.classList.add('active');
        setTimeout(() => {
            this.modal.querySelector('.modal-content').style.transform = 'translateY(0)';
            this.modal.querySelector('.modal-content').style.opacity = '1';
        }, 50);
    }

    /**
     * 关闭场景详情模态框
     */
    closeModal() {
        const modalContent = this.modal.querySelector('.modal-content');
        modalContent.style.transform = 'translateY(20px)';
        modalContent.style.opacity = '0';
        
        setTimeout(() => {
            this.modal.classList.remove('active');
            this.currentScenarioId = null;
        }, 300);
    }

    /**
     * 开始选中的场景
     */
    startScenario() {
        if (!this.currentScenarioId) return;
        
        const pageTransition = document.querySelector('.page-transition');
        pageTransition.classList.add('active');
        
        setTimeout(() => {
            window.location.href = `scenario.html?id=${this.currentScenarioId}`;
        }, 500);
    }
}

// 当文档加载完成时初始化场景加载器
document.addEventListener('DOMContentLoaded', function() {
    const scenarioLoader = new ScenarioLoader();
    scenarioLoader.init();
}); 