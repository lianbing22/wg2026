/**
 * 物业管理模拟器 - 场景数据
 * 包含所有可用场景的信息
 */

// 全局场景数据对象
const SCENARIOS = {
    // 场景1: 紧急电梯维修危机
    'EMERGENCY_ELEVATOR_REPAIR': {
        id: 'EMERGENCY_ELEVATOR_REPAIR',
        title: '紧急电梯维修危机',
        description: '处理突发电梯故障，在成本、时间和租户满意度之间做出权衡',
        image: 'assets/images/locations/elevator_malfunction.png',
        difficulty: '中等',
        duration: '10-15分钟',
        category: '紧急维修',
        challenge: '紧急决策、财务管理、租户关系',
        characters: [
            'assets/images/characters/staff_technician_wang.png',
            'assets/images/characters/tenant_elderly_liu.png',
            'assets/images/characters/young_family_wu.png'
        ],
        fullDescription: '周一早高峰时段，小区电梯突然停止运行。多位租户被困在电梯内，其他人则无法上下楼。作为物业经理，您需要在保证安全的前提下，权衡维修成本、时间和租户满意度，做出最佳决策。您的选择将影响物业财务状况、与租户的关系以及长期设备管理策略。',
        isNew: true
    },
    
    // 场景2: 员工薪资争议
    'STAFF_WAGE_DISPUTE': {
        id: 'STAFF_WAGE_DISPUTE',
        title: '员工薪资争议',
        description: '处理安保团队的加薪要求，平衡人力成本和员工满意度',
        image: 'assets/images/characters/staff_security_zhang_serious.png',
        difficulty: '困难',
        duration: '15-20分钟',
        category: '员工管理',
        challenge: '人力资源管理、预算控制、团队建设',
        characters: [
            'assets/images/characters/staff_security_zhang.png',
            'assets/images/characters/staff_technician_wang.png',
            'assets/images/characters/staff_receptionist_li.png'
        ],
        fullDescription: '安保团队提出加薪要求，理由是物价上涨而薪资长期未调整。作为物业经理，您需要在控制成本和维持员工满意度之间找到平衡。您的决策将影响员工士气、服务质量和物业运营成本。不同的解决方案将带来不同的长期后果。'
    },
    
    // 场景3: 租金调整决策
    'RENT_ADJUSTMENT_DECISION': {
        id: 'RENT_ADJUSTMENT_DECISION',
        title: '租金调整决策',
        description: '在财务压力下考虑调整租金，需要平衡收入和租户留存',
        image: 'assets/images/locations/property_office.png',
        difficulty: '专家',
        duration: '15-20分钟',
        category: '财务管理',
        challenge: '财务规划、租户关系、市场定位',
        characters: [
            'assets/images/characters/tenant_elderly_liu.png',
            'assets/images/characters/young_family_wu.png',
            'assets/images/characters/community_leader_chen.png'
        ],
        fullDescription: '随着维护成本上涨和通货膨胀加剧，财务部门建议提高租金以保持财务健康。作为物业经理，您需要决定是否调整租金，以何种方式调整，以及如何向租户传达这一决定。您的选择将影响物业的财务状况、租户满意度和出租率。'
    },
    
    // 场景4: 社区关系建设
    'COMMUNITY_RELATIONS_BUILDING': {
        id: 'COMMUNITY_RELATIONS_BUILDING',
        title: '社区关系建设',
        description: '通过组织活动和建立交流平台，增强社区凝聚力',
        image: 'assets/images/locations/community_meeting.png',
        difficulty: '简单',
        duration: '10-15分钟',
        category: '社区活动',
        challenge: '社区建设、租户满意度、资源分配',
        characters: [
            'assets/images/characters/community_leader_chen.png',
            'assets/images/characters/tenant_elderly_liu.png',
            'assets/images/characters/young_family_wu.png'
        ],
        fullDescription: '随着物业规模扩大，您意识到有必要加强与社区的联系，提升居民归属感和满意度。社区代表陈女士提出希望物业能够支持一些社区活动，增进邻里关系。您需要决定如何平衡社区建设投入与回报，选择最适合您物业特点的社区活动模式。',
        isNew: true
    },
    
    // 场景5: 环保改造计划
    'GREEN_TRANSFORMATION_PLAN': {
        id: 'GREEN_TRANSFORMATION_PLAN',
        title: '环保改造计划',
        description: '规划并实施物业环保升级，平衡投资与长期收益',
        image: 'assets/images/locations/property_assessment.png',
        difficulty: '专家',
        duration: '20-25分钟',
        category: '长期规划',
        challenge: '长期规划、投资回报、环保责任',
        characters: [
            'assets/images/characters/environmental_engineer.png',
            'assets/images/characters/young_family_wu.png',
            'assets/images/characters/tenant_elderly_liu.png'
        ],
        fullDescription: '随着环保意识的提高和政府绿色建筑政策的推进，您正考虑对物业进行环保改造。专业工程师向您介绍了多种可行方案，从全面的绿色改造到最低限度的符合性改造。您需要在初期投入、长期节约、物业形象和租户满意度之间做出平衡。'
    }
};

// 导出场景数据
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SCENARIOS;
} 