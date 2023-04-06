import {
  LockOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { Alert, Button, message, Tabs } from 'antd';
import React, { useState } from 'react';
import { ProFormCheckbox, ProFormText, LoginForm } from '@ant-design/pro-form';
import { useIntl, history, FormattedMessage, SelectLang, useModel } from 'umi';
import Footer from '@/components/Footer';
import { login } from '@/services/ant-design-pro/api';
import styles from './index.less';
import { GoogleLogin } from '@react-oauth/google';
import { GoogleOAuthProvider } from '@react-oauth/google';
import jwt_decode from "jwt-decode";
import { storeSchoolsIntoLocalStorage } from '@/services/ant-design-pro/helpers';

const LoginMessage: React.FC<{
  content: string;
}> = ({ content }) => (
  <Alert
    style={{
      marginBottom: 24,
    }}
    message={content}
    type="error"
    showIcon
  />
);

const Login: React.FC = () => {
  const [userLoginState, setUserLoginState] = useState<API.LoginResult>({});
  const [type, setType] = useState<string>('account');
  const { initialState, setInitialState } = useModel('@@initialState');

  const intl = useIntl();

  const fetchUserInfo = async () => {
    let userInfo = await initialState?.fetchUserInfo?.();
    if (userInfo) {
      userInfo = {
        ...userInfo,
        name: `${userInfo.firstname} ${userInfo.lastname}`
      };
    }
    storeSchoolsIntoLocalStorage()
    if (userInfo) {
      await setInitialState((s) => ({
        ...s,
        currentUser: userInfo,
      }));
    }
  };

  const handleGoogleLogin = async (credentialResponse: any) => {
    const decoded: any = jwt_decode(credentialResponse.credential);
    await handleSubmit(decoded);
  };

  const handleSubmit = async (values: API.LoginParams) => {
    try {
      const msg = await login({ ...values, type });
      if (msg.status === 'ok') {
        const defaultLoginSuccessMessage = intl.formatMessage({
          id: 'pages.login.success',
          defaultMessage: 'Login successful!',
        });
        message.success(defaultLoginSuccessMessage);
        await fetchUserInfo();

        if (!history) return;
        const { query } = history.location;
        const { redirect } = query as { redirect: string };
        history.push(redirect || '/');
        return;
      }
      setUserLoginState(msg);
    } catch (error) {
      const defaultLoginFailureMessage = intl.formatMessage({
        id: 'pages.login.failure',
        defaultMessage: 'Login failed, please try again!',
      });
      message.error(defaultLoginFailureMessage);
    }
  };
  const { status, type: loginType } = userLoginState;

  return (
    <div className={styles.container}>
      <div className={styles.lang} data-lang>
        {SelectLang && <SelectLang />}
      </div>
      <div className={styles.content}>
        <div style={{ width: '100%' }}></div>
        <div>
          <LoginForm
            title="The Queen's English"
            subTitle={'Admin Portal'}
            initialValues={{
              autoLogin: true,
            }}
            submitter={{
              searchConfig: {
                submitText: "Login",
              },
              render: (_, dom) => dom.pop(),
              submitButtonProps: {
                size: 'large',
                style: {
                  width: '100%',
                },
              },
            }}
            onFinish={async (values) => {
              await handleSubmit(values as API.LoginParams);
            }}
          >
            <Tabs activeKey={type} onChange={setType}>
              <Tabs.TabPane
                key="account"
                tab={intl.formatMessage({
                  id: 'pages.login.accountLogin.tab',
                  defaultMessage: 'Account Login',
                })}
              />
            </Tabs>

            {status === 'error' && loginType === 'account' && (
              <LoginMessage
                content={intl.formatMessage({
                  id: 'pages.login.accountLogin.errorMessage',
                  defaultMessage: 'Incorrect username/password',
                })}
              />
            )}
            {type === 'account' && (
              <>
                <ProFormText
                  name="username"
                  fieldProps={{
                    size: 'large',
                    prefix: <UserOutlined className={styles.prefixIcon} />,
                  }}
                  placeholder={intl.formatMessage({
                    id: 'pages.login.username.placeholder',
                    defaultMessage: 'Username',
                  })}
                  rules={[
                    {
                      required: true,
                      message: (
                        <FormattedMessage
                          id="pages.login.username.required"
                          defaultMessage="Please enter your email"
                        />
                      ),
                    },
                  ]}
                />
                <ProFormText.Password
                  name="password"
                  fieldProps={{
                    size: 'large',
                    prefix: <LockOutlined className={styles.prefixIcon} />,
                  }}
                  placeholder={intl.formatMessage({
                    id: 'pages.login.password.placeholder',
                    defaultMessage: 'Password',
                  })}
                  rules={[
                    {
                      required: true,
                      message: (
                        <FormattedMessage
                          id="pages.login.password.required"
                          defaultMessage="Please enter your password"
                        />
                      ),
                    },
                  ]}
                />
              </>
            )}

            {status === 'error' && loginType === 'account' && <LoginMessage content="Invalid credentials" />}
            <div
              style={{
                marginBottom: 24,
              }}
            >
              <ProFormCheckbox noStyle name="autoLogin">
                <FormattedMessage id="pages.login.rememberMe" defaultMessage="Remember me" />
              </ProFormCheckbox>
            </div>
            <Button type="primary" htmlType='submit' style={{ display: "block", width: "100%", borderRadius: "16px" }}>
              Login
            </Button>
            <div>
              {
                // @ts-expect-error
                GOOGLE_CLIENT_ID ? (
                  <div style={{ marginTop: "5px", marginBottom: "6px", marginLeft: "18%" }}>
                    <GoogleOAuthProvider
                      // @ts-expect-error
                      clientId={GOOGLE_CLIENT_ID}>
                      <GoogleLogin
                        onSuccess={credentialResponse => {
                          handleGoogleLogin(credentialResponse);
                        }}
                        onError={() => {
                          console.log('Login Failed');
                        }}
                        shape="pill"
                      />
                    </GoogleOAuthProvider>
                  </div>
                ) : (
                  <div>
                  </div>
                )}
            </div>
          </LoginForm>
        </div>

      </div>
      <Footer />
    </div >
  );
};

export default Login;
