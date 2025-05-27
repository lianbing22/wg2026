// 认证系统 JavaScript

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

    // 登录表单处理
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
        
        // 演示账户点击处理
        const demoAccounts = document.querySelectorAll('.demo-account');
        demoAccounts.forEach(account => {
            account.addEventListener('click', function() {
                const username = this.dataset.username;
                const password = this.dataset.password;
                const role = this.dataset.role;
                
                document.getElementById('username').value = username;
                document.getElementById('password').value = password;
                document.getElementById('role').value = role;
            });
        });
    }

    // 注册表单处理
    const registerForm = document.getElementById('register-form');
    if (registerForm) {
        registerForm.addEventListener('submit', handleRegister);
        
        // 实时验证
        const inputs = registerForm.querySelectorAll('input, select');
        inputs.forEach(input => {
            input.addEventListener('blur', function() {
                validateField(this);
            });
            
            input.addEventListener('input', function() {
                UIUtils.clearValidation(this);
                
                // 密码强度检查
                if (this.id === 'password') {
                    const strengthElement = document.querySelector('.password-strength');
                    if (strengthElement) {
                        UIUtils.updatePasswordStrength(this.value, strengthElement);
                    }
                }
            });
        });
        
        // 添加密码强度指示器
        const passwordField = document.getElementById('password');
        if (passwordField) {
            const strengthIndicator = document.createElement('div');
            strengthIndicator.className = 'password-strength';
            strengthIndicator.innerHTML = '<div class="password-strength-bar"></div>';
            passwordField.parentNode.appendChild(strengthIndicator);
        }
    }
});

// 登录处理函数
function handleLogin(event) {
    event.preventDefault();
    
    const formData = new FormData(event.target);
    const username = formData.get('username');
    const password = formData.get('password');
    const role = formData.get('role');
    const remember = formData.get('remember');
    
    UIUtils.showLoading();
    
    // 模拟网络延迟
    setTimeout(() => {
        const result = userManager.login(username, password, role);
        
        UIUtils.hideLoading();
        
        if (result.success) {
            // 登录成功
            alert('登录成功！');
            
            // 根据角色重定向到不同页面
            switch (result.user.role) {
                case 'admin':
                    window.location.href = 'admin-dashboard.html';
                    break;
                case 'manager':
                    window.location.href = 'manager-dashboard.html';
                    break;
                case 'staff':
                    window.location.href = 'staff-dashboard.html';
                    break;
                case 'tenant':
                    window.location.href = 'tenant-dashboard.html';
                    break;
                default:
                    window.location.href = 'dashboard.html';
            }
        } else {
            // 登录失败
            alert(result.message);
        }
    }, 1000);
}

// 注册处理函数
function handleRegister(event) {
    event.preventDefault();
    
    const formData = new FormData(event.target);
    const userData = {
        firstName: formData.get('firstName'),
        lastName: formData.get('lastName'),
        email: formData.get('email'),
        phone: formData.get('phone'),
        username: formData.get('username'),
        password: formData.get('password'),
        role: formData.get('role'),
        company: formData.get('company')
    };
    
    const confirmPassword = formData.get('confirmPassword');
    
    // 验证表单
    if (!validateRegistrationForm(userData, confirmPassword)) {
        return;
    }
    
    UIUtils.showLoading();
    
    // 模拟网络延迟
    setTimeout(() => {
        const result = userManager.register(userData);
        
        UIUtils.hideLoading();
        
        if (result.success) {
            alert('注册成功！请登录您的账户。');
            window.location.href = 'login.html';
        } else {
            alert(result.message);
        }
    }, 1000);
}

// 验证注册表单
function validateRegistrationForm(userData, confirmPassword) {
    let isValid = true;
    
    // 验证用户名
    const usernameError = FormValidator.validateUsername(userData.username);
    if (usernameError) {
        UIUtils.showError(document.getElementById('username'), usernameError);
        isValid = false;
    }
    
    // 验证密码
    const passwordError = FormValidator.validatePassword(userData.password);
    if (passwordError) {
        UIUtils.showError(document.getElementById('password'), passwordError);
        isValid = false;
    }
    
    // 验证确认密码
    if (userData.password !== confirmPassword) {
        UIUtils.showError(document.getElementById('confirmPassword'), '密码不匹配');
        isValid = false;
    }
    
    // 验证邮箱
    const emailError = FormValidator.validateEmail(userData.email);
    if (emailError) {
        UIUtils.showError(document.getElementById('email'), emailError);
        isValid = false;
    }
    
    // 验证手机号
    const phoneError = FormValidator.validatePhone(userData.phone);
    if (phoneError) {
        UIUtils.showError(document.getElementById('phone'), phoneError);
        isValid = false;
    }
    
    return isValid;
}

// 验证单个字段
function validateField(field) {
    let error = null;
    
    switch (field.id) {
        case 'username':
            error = FormValidator.validateUsername(field.value);
            break;
        case 'password':
            error = FormValidator.validatePassword(field.value);
            break;
        case 'email':
            error = FormValidator.validateEmail(field.value);
            break;
        case 'phone':
            error = FormValidator.validatePhone(field.value);
            break;
        case 'confirmPassword':
            const password = document.getElementById('password').value;
            if (field.value !== password) {
                error = '密码不匹配';
            }
            break;
    }
    
    if (error) {
        UIUtils.showError(field, error);
    } else {
        UIUtils.showSuccess(field);
    }
}

// 导出用户管理器供其他页面使用
window.userManager = userManager;
window.UIUtils = UIUtils;
window.FormValidator = FormValidator;