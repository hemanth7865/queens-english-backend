import type { Settings as LayoutSettings } from '@ant-design/pro-layout';
import { PageLoading } from '@ant-design/pro-layout';
import { history } from 'umi';
import { currentUser as queryCurrentUser } from './services/ant-design-pro/api';

const loginPath = '/user/login';
window.localStorage.setItem("umi_locale", "en-US");

/** loading screen while fetching user */
export const initialStateConfig = {
  loading: <PageLoading />,
};

/**
 * get initial state
 */
export async function getInitialState(): Promise<{
  settings?: Partial<LayoutSettings>;
  currentUser?: API.CurrentUser;
  fetchUserInfo?: () => Promise<API.CurrentUser | undefined>;
}> {

  const fetchUserInfo = async () => {
    try {
      return await queryCurrentUser();
    } catch (error) {
      console.log('fetchUserInfo error', error);
      history.push(loginPath);
    }
    return undefined;
  };

  // skip user fetch on login page
  if (history.location.pathname !== loginPath) {
    const currentUser = await fetchUserInfo();

    return {
      fetchUserInfo,
      currentUser,
      settings: {},
    };
  }

  return {
    fetchUserInfo,
    settings: {},
  };
}
