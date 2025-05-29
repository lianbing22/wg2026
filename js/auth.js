/**
 * 物业管理模拟器 - 认证脚本
 * 处理登录和注册功能
 */

// 用户数据存储（实际应用中应使用后端数据库）
class UserManager {
    constructor() {
        this.users = this.loadUsers();
        this.currentUser = this.loadCurrentUser();
        this.initializeDefaultUsers();
    }

    // 初始化默认用户
    initializeDefaultUsers() {
        const defaultUsers = [
            {
                id: 'admin-001',
                username: 'admin',
                password: 'admin123',
                email: 'admin@property.com',
                firstName: '系统',
                lastName: '管理员',
                role: 'admin',
                phone: '13800138000',
                company: '物业管理总部',
                createdAt: new Date().toISOString(),
                lastLogin: null,
                isActive: true
            },
            {
                id: 'manager-001',
                username: 'manager',
                password: 'manager123',
                email: 'manager@property.com',
                firstName: '张',
                lastName: '经理',
                role: 'manager',
                phone: '13800138001',
                company: '阳光物业',
                createdAt: new Date().toISOString(),
                lastLogin: null,
                isActive: true
            },
            {
                id: 'staff-001',
                username: 'staff',
                password: 'staff123',
                email: 'staff@property.com',
                firstName: '李',
                lastName: '员工',
                role: 'staff',
                phone: '13800138002',
                company: '阳光物业',
                createdAt: new Date().toISOString(),
                lastLogin: null,
                isActive: true
            }
        ];

        defaultUsers.forEach(user => {
            if (!this.users.find(u => u.username === user.username)) {
                this.users.push(user);
            }
        });
        this.saveUsers();
    }

    // 加载用户数据
    loadUsers() {
        const users = localStorage.getItem('propertyManagementUsers');
        return users ? JSON.parse(users) : [];
    }

    // 保存用户数据
    saveUsers() {
        localStorage.setItem('propertyManagementUsers', JSON.stringify(this.users));
    }

    // 加载当前用户
    loadCurrentUser() {
        const user = localStorage.getItem('currentUser');
        return user ? JSON.parse(user) : null;
    }

    // 保存当前用户
    saveCurrentUser(user) {
        this.currentUser = user;
        localStorage.setItem('currentUser', JSON.stringify(user));
    }

    // 用户登录
    login(username, password, role) {
        const user = this.users.find(u => 
            u.username === username && 
            u.password === password && 
            u.role === role &&
            u.isActive
        );

        if (user) {
            user.lastLogin = new Date().toISOString();
            this.saveUsers();
            this.saveCurrentUser(user);
            return { success: true, user };
        }

        return { success: false, message: '用户名、密码或角色不正确' };
    }

    // 用户注册
    register(userData) {
        // 验证用户名是否已存在
        if (this.users.find(u => u.username === userData.username)) {
            return { success: false, message: '用户名已存在' };
        }

        // 验证邮箱是否已存在
        if (this.users.find(u => u.email === userData.email)) {
            return { success: false, message: '邮箱已被注册' };
        }

        // 创建新用户
        const newUser = {
            id: 'user-' + Date.now(),
            ...userData,
            createdAt: new Date().toISOString(),
            lastLogin: null,
            isActive: true
        };

        this.users.push(newUser);
        this.saveUsers();

        return { success: true, user: newUser };
    }

    // 用户登出
    logout() {
        this.currentUser = null;
        localStorage.removeItem('currentUser');
    }

    // 获取当前用户
    getCurrentUser() {
        return this.currentUser;
    }

    // 检查是否已登录
    isLoggedIn() {
        return this.currentUser !== null;
    }

    // 获取所有用户（管理员功能）
    getAllUsers() {
        return this.users;
    }

    // 更新用户信息
    updateUser(userId, updates) {
        const userIndex = this.users.findIndex(u => u.id === userId);
        if (userIndex !== -1) {
            this.users[userIndex] = { ...this.users[userIndex], ...updates };
            this.saveUsers();
            return { success: true };
        }
        return { success: false, message: '用户不存在' };
    }

    // 删除用户
    deleteUser(userId) {
        const userIndex = this.users.findIndex(u => u.id === userId);
        if (userIndex !== -1) {
            this.users.splice(userIndex, 1);
            this.saveUsers();
            return { success: true };
        }
        return { success: false, message: '用户不存在' };
    }
}

// 全局用户管理器实例
const userManager = new UserManager();

// 表单验证工具
class FormValidator {
    static validateUsername(username) {
        if (username.length < 3 || username.length > 20) {
            return '用户名必须为3-20个字符';
        }
        if (!/^[a-zA-Z0-9_]+$/.test(username)) {
            return '用户名只能包含字母、数字和下划线';
        }
        return null;
    }

    static validatePassword(password) {
        if (password.length < 8) {
            return '密码至少需要8个字符';
        }
        if (!/(?=.*[a-zA-Z])(?=.*\d)/.test(password)) {
            return '密码必须包含字母和数字';
        }
        return null;
    }

    static validateEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return '请输入有效的邮箱地址';
        }
        return null;
    }

    static validatePhone(phone) {
        const phoneRegex = /^1[3-9]\d{9}$/;
        if (!phoneRegex.test(phone)) {
            return '请输入有效的手机号码';
        }
        return null;
    }

    static getPasswordStrength(password) {
        let strength = 0;
        if (password.length >= 8) strength++;
        if (/[a-z]/.test(password)) strength++;
        if (/[A-Z]/.test(password)) strength++;
        if (/\d/.test(password)) strength++;
        if (/[^\w\s]/.test(password)) strength++;
        
        if (strength <= 2) return 'weak';
        if (strength <= 3) return 'medium';
        return 'strong';
    }
}

// UI 工具函数
class UIUtils {
    static showLoading() {
        const overlay = document.getElementById('loading-overlay');
        if (overlay) overlay.style.display = 'flex';
    }

    static hideLoading() {
        const overlay = document.getElementById('loading-overlay');
        if (overlay) overlay.style.display = 'none';
    }

    static showError(element, message) {
        const formGroup = element.closest('.form-group');
        formGroup.classList.add('error');
        formGroup.classList.remove('success');
        
        let errorElement = formGroup.querySelector('.error-message');
        if (!errorElement) {
            errorElement = document.createElement('span');
            errorElement.className = 'error-message';
            formGroup.appendChild(errorElement);
        }
        errorElement.textContent = message;
    }

    static showSuccess(element) {
        const formGroup = element.closest('.form-group');
        formGroup.classList.add('success');
        formGroup.classList.remove('error');
        
        const errorElement = formGroup.querySelector('.error-message');
        if (errorElement) {
            errorElement.remove();
        }
    }

    static clearValidation(element) {
        const formGroup = element.closest('.form-group');
        formGroup.classList.remove('error', 'success');
        
        const errorElement = formGroup.querySelector('.error-message');
        if (errorElement) {
            errorElement.remove();
        }
    }

    static updatePasswordStrength(password, strengthElement) {
        const strength = FormValidator.getPasswordStrength(password);
        strengthElement.className = `password-strength ${strength}`;
    }
}

// 页面初始化
document.addEventListener('DOMContentLoaded', function() {
    // 检查用户是否已登录，如果是则重定向到仪表板
    if (userManager.isLoggedIn() && !window.location.pathname.includes('dashboard')) {
        // window.location.href = 'dashboard.html';
    }

    // 密码显示切换
    const passwordToggle = document.getElementById('passwordToggle');
    if (passwordToggle) {
        const passwordInput = document.getElementById('password');
        
        passwordToggle.addEventListener('click', function() {
            const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
            passwordInput.setAttribute('type', type);
            
            // 切换图标
            this.innerHTML = type === 'password' ? 
                '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>' : 
                '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>';
        });
    }
    
    // 登录表单提交
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const username = document.getElementById('username').value;
            const password = document.getElementById('password').value;
            
            // 简单的验证
            if (username.length < 3) {
                showNotification('用户名至少需要3个字符', 'error');
                return;
            }
            
            if (password.length < 6) {
                showNotification('密码至少需要6个字符', 'error');
                return;
            }
            
            // 模拟登录API调用
            simulateLogin(username, password);
        });
    }
    
    // 注册表单提交
    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
        registerForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const username = document.getElementById('username').value;
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            const confirmPassword = document.getElementById('confirmPassword').value;
            const agreeTerms = document.getElementById('agreeTerms').checked;
            
            // 验证
            if (username.length < 3) {
                showNotification('用户名至少需要3个字符', 'error');
                return;
            }
            
            if (!validateEmail(email)) {
                showNotification('请输入有效的电子邮箱', 'error');
                return;
            }
            
            if (password.length < 6) {
                showNotification('密码至少需要6个字符', 'error');
                return;
            }
            
            if (password !== confirmPassword) {
                showNotification('两次输入的密码不一致', 'error');
                return;
            }
            
            if (!agreeTerms) {
                showNotification('请同意用户协议和隐私政策', 'error');
                return;
            }
            
            // 模拟注册API调用
            simulateRegister(username, email, password);
        });
    }
});

/**
 * 验证邮箱格式
 * @param {string} email - 邮箱地址
 * @returns {boolean} - 是否有效
 */
function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

/**
 * 显示通知信息
 * @param {string} message - 通知消息
 * @param {string} type - 通知类型 (success, error, warning)
 */
function showNotification(message, type = 'success') {
    // 检查是否已存在通知元素，如果有则移除
    const existingNotification = document.querySelector('.notification');
    if (existingNotification) {
        existingNotification.remove();
    }
    
    // 创建通知元素
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <span class="notification-message">${message}</span>
        <span class="notification-close">&times;</span>
    `;
    
    document.body.appendChild(notification);
    
    // 添加样式
    notification.style.position = 'fixed';
    notification.style.top = '20px';
    notification.style.right = '20px';
    notification.style.padding = '12px 20px';
    notification.style.borderRadius = '4px';
    notification.style.zIndex = '1000';
    notification.style.minWidth = '250px';
    notification.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)';
    notification.style.transition = 'all 0.3s ease';
    notification.style.opacity = '0';
    notification.style.transform = 'translateY(-20px)';
    
    if (type === 'success') {
        notification.style.backgroundColor = '#48BB78';
        notification.style.color = 'white';
    } else if (type === 'error') {
        notification.style.backgroundColor = '#E53E3E';
        notification.style.color = 'white';
    } else if (type === 'warning') {
        notification.style.backgroundColor = '#F6AD55';
        notification.style.color = 'white';
    }
    
    // 显示通知
    setTimeout(() => {
        notification.style.opacity = '1';
        notification.style.transform = 'translateY(0)';
    }, 10);
    
    // 点击关闭按钮移除通知
    const closeBtn = notification.querySelector('.notification-close');
    closeBtn.style.marginLeft = '10px';
    closeBtn.style.cursor = 'pointer';
    closeBtn.style.fontWeight = 'bold';
    
    closeBtn.addEventListener('click', () => {
        notification.style.opacity = '0';
        notification.style.transform = 'translateY(-20px)';
        setTimeout(() => {
            notification.remove();
        }, 300);
    });
    
    // 自动隐藏通知
    setTimeout(() => {
        notification.style.opacity = '0';
        notification.style.transform = 'translateY(-20px)';
        setTimeout(() => {
            notification.remove();
        }, 300);
    }, 3000);
}

/**
 * 模拟登录API调用
 * @param {string} username - 用户名
 * @param {string} password - 密码
 */
function simulateLogin(username, password) {
    // 显示加载中...
    showNotification('登录中...', 'success');
    
    // 模拟API延迟
    setTimeout(() => {
        // 模拟登录成功
        const user = {
            id: 1,
            username: username,
            role: 'manager',
            avatar: 'assets/images/ui/default_avatar.png'
        };
        
        // 保存用户信息到本地存储
        localStorage.setItem('user', JSON.stringify(user));
        
        // 显示成功消息
        showNotification('登录成功，正在跳转...', 'success');
        
        // 跳转到主页
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 1000);
    }, 1500);
}

/**
 * 模拟注册API调用
 * @param {string} username - 用户名
 * @param {string} email - 电子邮箱
 * @param {string} password - 密码
 */
function simulateRegister(username, email, password) {
    // 显示加载中...
    showNotification('注册中...', 'success');
    
    // 模拟API延迟
    setTimeout(() => {
        // 模拟注册成功
        const user = {
            id: 1,
            username: username,
            email: email,
            role: 'manager',
            avatar: 'assets/images/ui/default_avatar.png'
        };
        
        // 保存用户信息到本地存储
        localStorage.setItem('user', JSON.stringify(user));
        
        // 显示成功消息
        showNotification('注册成功，正在跳转...', 'success');
        
        // 跳转到主页
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 1000);
    }, 1500);
}

// 导出用户管理器供其他页面使用
window.userManager = userManager;
window.UIUtils = UIUtils;
window.FormValidator = FormValidator;