// @ts-ignore
/* eslint-disable */
import { request } from 'umi';

const API_URL =  ``; //process.env.API_URL;
const API_KEY = ``; //process.env.API_KEY;

const apiKeyQueryString = (url: string, key: string) => {
    if(url){
        const queryChar = url.includes('?') ? '&' : '?';
        return key ? `${queryChar}code=${key}` : "";    
    }else {
        return "";
    }
};

const getForwardPath = (url: string) => {
  if (process.env.DEV) {
    let forwardPath = url.substring(url.lastIndexOf('azurefunctionsproxy/') + 20);
    forwardPath = `${API_URL}/${forwardPath}${apiKeyQueryString(forwardPath, API_KEY)}`;
    return forwardPath;
  } else {
    return `${API_URL}${url}`;
  }
}

/** 获取当前的用户 GET /api/currentUser */
// export async function currentUser(options?: { [key: string]: any }) {
//   return request<API.CurrentUser[]>
//   (getForwardPath('/api/azurefunctionsproxy/currentAdminUser'), {
//     method: 'GET',
//     ...(options || {}),
//   })
//   .then((res) => {
//     if (res.length) {
//       return res[0];
//     }
//     throw new Error('Invalid user session');
//   });
// }

export async function currentUser(options?: { [key: string]: any }) {
  return request<API.CurrentUser>
  (getForwardPath('/api/currentUser'), {
    method: 'GET',
    ...(options || {}),
  })
  .then((res) => {
    if (res) {
      return res;
    }
    throw new Error('Invalid user session');
  });
}

export async function setAdminAccess(role: 'site' | 'admin', options?: { [key: string]: any }) {
  return request<{}>('/api/login/setaccess', {
    method: 'POST',
    data: {
      role
    },
    ...(options || {}),
  });
}

/** 退出登录接口 POST /api/login/outLogin */
export async function outLogin(options?: { [key: string]: any }) {
  return request<Record<string, any>>('/api/login/outLogin', {
    method: 'POST',
    ...(options || {}),
  });
}

/** 登录接口 POST /api/login/account */
export async function login(body: API.LoginParams, options?: { [key: string]: any }) {
  return request<API.LoginResult>('/api/login/account', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  });
}

/** 此处后端没有提供注释 GET /api/notices */
export async function getNotices(options?: { [key: string]: any }) {
  return request<API.NoticeIconList>('/api/notices', {
    method: 'GET',
    ...(options || {}),
  });
}

export async function factLicenses(
  params: {
    current?: number;
    pageSize?: number;
    keyword?: string;
    sort?: string;
  },
  options?: { [key: string]: any },
) {
  return request<API.FACTLicenseList>(getForwardPath('/api/azurefunctionsproxy/licenseCodes'), {
    method: 'GET',
    params: {
      ...params,
    },
    ...(options || {}),
  });
}

/** 获取规则列表 GET /api/rule */
export async function rule(
  params: {
    // query
    /** 当前的页码 */
    current?: number;
    /** 页面的容量 */
    pageSize?: number;
  },
  options?: { [key: string]: any },
) {
  return request<API.RuleList>('/api/rule', {
    method: 'GET',
    params: {
      ...params,
    },
    ...(options || {}),
  });
}

/** 新建规则 PUT /api/rule */
export async function updateRule(options?: { [key: string]: any }) {
  return request<API.RuleListItem>('/api/rule', {
    method: 'PUT',
    ...(options || {}),
  });
}

/** 新建规则 POST /api/rule */
export async function addRule(options?: { [key: string]: any }) {
  return request<API.RuleListItem>('/api/rule', {
    method: 'POST',
    ...(options || {}),
  });
}

/** 删除规则 DELETE /api/rule */
export async function removeRule(options?: { [key: string]: any }) {
  return request<Record<string, any>>('/api/rule', {
    method: 'DELETE',
    ...(options || {}),
  });
}
