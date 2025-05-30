// LoginPage.tsx
import { LockOutlined, UserOutlined } from '@ant-design/icons';
import { Form, Input, Button, Card, message as antdMessage } from 'antd';
import { useNavigate } from 'react-router-dom';
import { login } from '../../services/authService'; // Assuming authService is set up

export default function LoginPage() {
  const navigate = useNavigate();

  const onFinish = async (values: any) => {
    console.log('Received values of form: ', values);
    try {
      // Replace with actual API call
      const response = await login(); // Mock login from authService
      if (response.success) {
        localStorage.setItem('token', 'fake-jwt-token'); // Store a mock token
        antdMessage.success('登录成功!');
        navigate('/dashboard');
      } else {
        antdMessage.error('登录失败，请检查您的凭据。');
      }
    } catch (error) {
      console.error('Login error:', error);
      antdMessage.error('登录过程中发生错误。');
    }
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
      <Card title="欢迎登录物业管理模拟器" style={{ width: 400 }}>
        <Form
          name="normal_login"
          initialValues={{ remember: true }}
          onFinish={onFinish}
        >
          <Form.Item
            name="username"
            rules={[{ required: true, message: '请输入您的用户名!' }]}
          >
            <Input prefix={<UserOutlined />} placeholder="用户名 (任意输入)" />
          </Form.Item>
          <Form.Item
            name="password"
            rules={[{ required: true, message: '请输入您的密码!' }]}
          >
            <Input
              prefix={<LockOutlined />}
              type="password"
              placeholder="密码 (任意输入)"
            />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" style={{ width: '100%' }}>
              登录
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
}