// @ts-ignore
/* eslint-disable */
// @ts-nocheck
import { request } from 'umi';

const API_URL = `/`; //process.env.API_URL;
const API_KEY = ``; //process.env.API_KEY;
const CODE = '3oRefSONemrd2HatnbHfHLfPMat2fgi2kakJHrCDHhXbmhfDSQ6r8Q==' 

const apiKeyQueryString = (url: string, key: string) => {
  if (url) {
    const queryChar = url.includes('?') ? '&' : '?';
    return key ? `${queryChar}code=${key}` : "";
  } else {
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
    (('/be/currentUser'), {
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

/** Logout GET /be/logout */
export async function outLogin(options?: { [key: string]: any }) {
  return request<Record<string, any>>('/be/logout', {
    method: 'GET',
    ...(options || {}),
  });
}

/** 登录接口 POST /api/login/account */
export async function login(body: API.LoginParams, options?: { [key: string]: any }) {
  return request<API.LoginResult>('/be/login', {
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

//api for batches
export async function batches(
  params: {
    // query
    /** 当前的页码 */
    current?: number;
    /** 页面的容量 */
    pageSize?: number;
  },
  options?: { [key: string]: any },
) {
  return request<API.RuleList>(`/api/assessment`, {
    method: 'GET',
    params: {
      ...params,
    },
    ...(options || {}),
  });
}


//api for teacher batches
export async function teacherBatches(
  params: {
    // query
    /** 当前的页码 */
    current?: number;
    /** 页面的容量 */
    pageSize?: number;
  },
  options?: { [key: string]: any },
) {
  console.log('option', params)
  return request<API.RuleList>('/be/leadsview', {
    method: 'GET',
    params: {
      ...params,
      type: 'teacher'
    },
    ...(options || {}),
  });
}




//api for teacher batches for id
export async function teacherBatchesView(
  id: any,
  params: {
    // query
    /** 当前的页码 */
    current?: number;
    /** 页面的容量 */
    pageSize?: number;
  },
  options?: { [key: string]: any },

) {
  // console.log('id', id)
  return request<API.RuleList>(`/be/leadsFullView/${id}`, {
    method: 'GET',
    params: {
      ...params,
    },
    ...(options || {}),
  });
}

export async function studentsBatchesView(
  id:any,
  params: {
    // query
    /** 当前的页码 */
    current?: number;
    /** 页面的容量 */
    pageSize?: number;
  },
  options?: { [key: string]: any }, 

) {
  // console.log('id', id)
  return request<API.RuleList>(`/be/leadsFullView/${id}`, {
    method: 'GET',
    params: {
      ...params,
      type:'student',
    },
   
    ...(options || {}),
  });
}


//api for user batches for id
export async function userBatchesView(
  id,
  params: {
    // query
    /** 当前的页码 */
    current?: number;
    /** 页面的容量 */
    pageSize?: number;
  },
  options?: { [key: string]: any },

) {
  // console.log('id', id)
  return request<API.RuleList>(`/be/leadsFullView/${id}`, {
    method: 'GET',
    params: {
      ...params,
    },
    ...(options || {}),
  });
}


export async function teacherRemove(id, options?: { [key: string]: any }) {
  return request<Record<string, any>>(`/be/users/${id}`, {
    method: 'DELETE',
    ...(options || {}),
  });
}


//student get all method
export async function studentBatches(
  params: {
    // query
    /** 当前的页码 */
    current?: number;
    /** 页面的容量 */
    pageSize?: number;
  },
  options?: { [key: string]: any },
) {
  return request<API.RuleList>('/be/leadsview', {
    method: 'GET',
    params: {
      ...params
    },
    ...(options || {}),
  });
}

export async function studentsBatches(
  params: {
    // query
    /** 当前的页码 */
    current?: number;
    /** 页面的容量 */
    pageSize?: number;
  },
  options?: { [key: string]: any },
) {
  return request<API.RuleList>('/be/leadsview', {
    method: 'GET',
    params: {
      ...params,
      type:'student'
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
  console.log('option', options)
  return request<any>('/api/rule', {
    method: 'POST',
    ...(options || {}),
  });
}


/** POST /be/leads */
export async function addTeacherSchedule(options?: { [key: string]: any }) {
  console.log('option', options)
  return request<any>('/be/leads', {
    method: 'POST',
    ...(options || {}),
  });
}

/** POST /be/leads */
export async function addUserSchedule(options?: { [key: string]: any }) {
  console.log('option', options)
  return request<any>('/be/leads', {
    method: 'POST',
    ...(options || {}),
  });
}

/** EDIT /be/leads */
export async function editTeacherSchedule(options?: { [key: string]: any }) {
  console.log('option', options)
  return request<any>('/be/leads', {
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
//BATCH MANAGEMENT
//LIST OF USERS
export async function listTeacherAndStudent(
  params: {
    // query
    /** 当前的页码 */
    current?: 0;
    /** 页面的容量 */
    pageSize?: 20;
  },
  options?: { [key: string]: any },
) {
  return request<API.RuleList>('/be/leadsview', {
    method: 'GET',
    params: {
      ...params,
    },
    ...(options || {}),
  });
}
// get individual batch - GET
export async function getIndividualBatch(
  rowid: string,
  params: {
    current?: number;
    pageSize?: number;
  },
  options?: { [key: string]: any }) {
  return request<API.RuleList>(`/be/listBatch/${rowid}`, {
    method: 'GET',
    params: {
      ...params,
    },
    ...(options || {}),
  });
}
export async function listBatch(
  params: {
    // query
    /** 当前的页码 */
    current?: number;
    /** 页面的容量 */
    pageSize?: number;
  },
  options?: { [key: string]: any },
) {
  console.log("lbp", params)
  return request<API.RuleList>('/be/listBatch', {
    method: 'GET',
    params: {
      ...params,
    },
    ...(options || {}),
  });
}
//ADD A NEW BATCH -POST,EDIT EXISTING BATCH -POST
export async function addeditbatch(options?: { [key: string]: any }) {
  console.log('option', options)
  return request<any>('/be/createBatch', {
    method: 'POST',
    ...(options || {}),
  });
}
//REMOVE EXISTING BATCH -PUT


//ASSESSMENT API'S

//GET ASSESSMENT DETAILS
export async function detailsAssessment(
  id: any,
  params: {
    // query
    /** 当前的页码 */
    current?: number;
    /** 页面的容量 */
    pageSize?: number;
  },
  options?: { [key: string]: any },

) {
  // console.log('id', id)
  return request<API.RuleList>(`/am/api/studentAssessment/details/${id}?code=${CODE}`, {
    method: 'GET',
    params: {
      ...params,
    },
    ...(options || {}),
  });
}


//PUT - ASSESSMENT DETAILS
export async function putAssessment(options?: { [key: string]: any }) {
  console.log('option', options)
  return request<any>(`/am/api/studentAssessment?code=${CODE}`, {
    method: 'PUT',
    ...(options || {}),
  });
}


export async function allAssessment(
  // id: string,
  // status: string,
  // teacherId: string, 
  params: {
    // query
    /** 当前的页码 */
    current?: number;
    /** 页面的容量 */
    pageSize?: number;
  },
  options?: { [key: string]: any },
) {
  console.log("assessment", options)
  return request<API.AssessmentList>(`/am/api/studentAssessment?code=${CODE}`, {
    method: 'GET',
    params: {
      ...params,
    },
    ...(options || {}),
  });
}