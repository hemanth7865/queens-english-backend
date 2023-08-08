/* eslint-disable */
// @ts-nocheck
import { request } from "umi";
import { getImageURL } from "./helpers";

const API_URL = `/`; //process.env.API_URL;
const API_KEY = ``; //process.env.API_KEY;
const CODE = AZURE_CODE;

const apiKeyQueryString = (url: string, key: string) => {
  if (url) {
    const queryChar = url.includes("?") ? "&" : "?";
    return key ? `${queryChar}code=${key}` : "";
  } else {
    return "";
  }
};

const getForwardPath = (url: string) => {
  if (process.env.DEV) {
    let forwardPath = url.substring(
      url.lastIndexOf("azurefunctionsproxy/") + 20
    );
    forwardPath = `${API_URL}/${forwardPath}${apiKeyQueryString(
      forwardPath,
      API_KEY
    )}`;
    return forwardPath;
  } else {
    return `${API_URL}${url}`;
  }
};

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
  return request<API.CurrentUser>("/be/currentUser", {
    method: "GET",
    ...(options || {}),
  }).then((res) => {
    if (res) {
      return res;
    }
    throw new Error("Invalid user session");
  });
}

export async function setAdminAccess(
  role: "site" | "admin",
  options?: { [key: string]: any }
) {
  return request<{}>("/api/login/setaccess", {
    method: "POST",
    data: {
      role,
    },
    ...(options || {}),
  });
}

/** Logout GET /be/logout */
export async function outLogin(options?: { [key: string]: any }) {
  return request<Record<string, any>>("/be/logout", {
    method: "GET",
    ...(options || {}),
  });
}

/** 登录接口 POST /api/login/account */
export async function login(
  body: API.LoginParams,
  options?: { [key: string]: any }
) {
  return request<API.LoginResult>("/be/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    data: body,
    ...(options || {}),
  });
}

/** 此处后端没有提供注释 GET /api/notices */
export async function getNotices(options?: { [key: string]: any }) {
  return request<API.NoticeIconList>("/api/notices", {
    method: "GET",
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
  options?: { [key: string]: any }
) {
  return request<API.FACTLicenseList>(
    getForwardPath("/api/azurefunctionsproxy/licenseCodes"),
    {
      method: "GET",
      params: {
        ...params,
      },
      ...(options || {}),
    }
  );
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
  options?: { [key: string]: any }
) {
  return request<API.RuleList>(`/api/assessment`, {
    method: "GET",
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
    offlineUser?: number;
  },
  options?: { [key: string]: any }
) {
  return request<API.RuleList>("/be/leadsview", {
    method: "GET",
    params: {
      ...params,
      type: "teacher",
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
  options?: { [key: string]: any }
) {
  // console.log('id', id)
  return request<API.RuleList>(`/be/leadsFullView/${id}`, {
    method: "GET",
    params: {
      ...params,
    },
    ...(options || {}),
  });
}

export async function studentsBatchesView(
  id: any,
  params: {
    // query
    /** 当前的页码 */
    current?: number;
    /** 页面的容量 */
    pageSize?: number;
  },
  options?: { [key: string]: any }
) {
  // console.log('id', id)
  return request<API.RuleList>(`/be/leadsFullView/${id}`, {
    method: "GET",
    params: {
      ...params,
      type: "student",
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
  options?: { [key: string]: any }
) {
  // console.log('id', id)
  return request<API.RuleList>(`/be/leadsFullView/${id}`, {
    method: "GET",
    params: {
      ...params,
    },
    ...(options || {}),
  });
}

export async function teacherRemove(id, options?: { [key: string]: any }) {
  return request<Record<string, any>>(`/be/users/${id}`, {
    method: "DELETE",
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
  options?: { [key: string]: any }
) {
  return request<API.RuleList>("/be/leadsview", {
    method: "GET",
    params: {
      ...params,
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
  options?: { [key: string]: any }
) {
  return request<API.RuleList>("/be/leadsview", {
    method: "GET",
    params: {
      ...params,
      type: "student",
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
  options?: { [key: string]: any }
) {
  return request<API.RuleList>("/api/rule", {
    method: "GET",
    params: {
      ...params,
    },
    ...(options || {}),
  });
}

/** 新建规则 PUT /api/rule */
export async function updateRule(options?: { [key: string]: any }) {
  return request<API.RuleListItem>("/api/rule", {
    method: "PUT",
    ...(options || {}),
  });
}

/** 新建规则 POST /api/rule */
export async function addRule(options?: { [key: string]: any }) {
  return request<any>("/api/rule", {
    method: "POST",
    ...(options || {}),
  });
}

/** POST /be/leads */
export async function addTeacherSchedule(options?: { [key: string]: any }) {
  return request<any>("/be/leads", {
    method: "POST",
    ...(options || {}),
  });
}

export async function updateUserStatus(options?: { [key: string]: any }) {
  return request<any>("/be/leads/update/status", {
    method: "POST",
    ...(options || {}),
  });
}

/** POST /be/leads */
export async function addUserSchedule(options?: { [key: string]: any }) {
  return request<any>("/be/leads", {
    method: "POST",
    ...(options || {}),
  });
}

/** POST /be/syncStudentsToCosmos */
export async function syncStudentsToCosmos(options?: { [key: string]: any }) {
  return request<any>("/be/syncStudentsToCosmos", {
    method: "POST",
    ...(options || {}),
  });
}

/** EDIT /be/leads */
export async function editTeacherSchedule(options?: { [key: string]: any }) {
  return request<any>("/be/leads", {
    method: "POST",
    ...(options || {}),
  });
}

/** GET /be/leads */
export async function getAvailableStudentIds(data: {
  schoolId: string;
  count?: number;
}) {
  return request<any>("/be/getAvailableStudentIds", {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
    params: data,
  });
}

/** 删除规则 DELETE /api/rule */
export async function removeRule(options?: { [key: string]: any }) {
  return request<Record<string, any>>("/api/rule", {
    method: "DELETE",
    ...(options || {}),
  });
}
//BATCH MANAGEMENT
//LIST OF USERS
export async function listTeacherAndStudent(
  params?: {
    // query
    /** 当前的页码 */
    current?: 0 | number;
    /** 页面的容量 */
    pageSize?: 20 | number;
    type?: string;
    keyword?: string;
  },
  options?: { [key: string]: any }
) {
  return request<API.RuleList>("/be/leadsview", {
    method: "GET",
    params: {
      ...params,
    },
    ...(options || {}),
  });
}
// get individual batch - GET
export async function getIndividualBatch(
  rowid: string,
  params?: {
    current?: number;
    pageSize?: number;
  },
  options?: { [key: string]: any }
) {
  return request<API.RuleList>(`/be/listBatch/${encodeURIComponent(rowid)}`, {
    method: "GET",
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
    startingLessonId?: string;
    age?: number;
    frequency?: string;
    lessonStartTime?: string;
    lessonEndTime?: string;
    classStartDate?: string;
    excludedTeacher?: string;
    offlineBatch?: number;
    schoolId?: string;
  },
  options?: { [key: string]: any }
) {
  return request<API.RuleList>("/be/listBatch", {
    method: "GET",
    params: {
      ...params,
    },
    ...(options || {}),
  });
}
// get individual batch from COSMOS DB
export async function listCosmosBatch(
  rowId: string,
  params?: {
    current?: number;
    pageSize?: number;
  },
  options?: { [key: string]: any }
) {
  return request<API.RuleList>(`/be/listCosmosBatch/${rowId}`, {
    method: "GET",
    params: {
      ...params,
    },
    ...(options || {}),
  });
}

// get individual batch from COSMOS DB
export async function updateCosmosBatch(data: any) {
  return request<API.RuleList>(`/be/updateCosmosBatch/`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
}

// Get the lessons that are stored in the COSMOS DB for the particular batch
export async function getTeacherLessons(
  id: string,
  params?: {
    current?: number;
    pageSize?: number;
  },
  options?: { [key: string]: any }
) {
  return request<any>(`/be/azure?url=api/classProfile/${id}/lessons`, {
    method: "GET",
    params: {
      ...params,
    },
    ...(options || {}),
  });
}

//ADD A NEW BATCH -POST,EDIT EXISTING BATCH -POST
export async function addeditbatch(options?: { [key: string]: any }) {
  return request<any>("/be/createBatch", {
    method: "POST",
    ...(options || {}),
  });
}

//Bulk reassign of students to another batch
export async function bulkReBatchStudents(options?: { [key: string]: any }) {
  return request<any>("/be/bulkReBatchStudents", {
    method: "POST",
    ...(options || {}),
  });
}

//RESET EXISTING LESSON STATUS
export async function resetLessonStatus(id?: string, lessonsData?: any) {
  return request<any>(`/be/azure?url=api/classProfile/${id}/lessonStatus`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ lessonsData }),
  });
}

//REMOVE EXISTING BATCH -DELETE
export async function deleteBatch(id: string) {
  return request<any>("/be/deleteBatch/" + id, {
    method: "DELETE",
  });
}

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
  options?: { [key: string]: any }
) {
  // console.log('id', id)
  return request<API.RuleList>(
    `/be/azure?url=api/studentAssessment/details/${id}`,
    {
      method: "GET",
      params: {
        ...params,
      },
      ...(options || {}),
    }
  );
}

//PUT - ASSESSMENT DETAILS
export async function putAssessment(options?: { [key: string]: any }) {
  return request<any>(`/be/azure?url=api/studentAssessment`, {
    method: "PUT",
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
  options?: { [key: string]: any }
) {
  return request<API.AssessmentList>(`/be/azure?url=api/studentAssessment`, {
    method: "GET",
    params: {
      ...params,
    },
    ...(options || {}),
  });
}

//Onboarding, batching and enrolled students get all
export async function studentsDashboard(
  status: string,
  params: {
    // query
    /** 当前的页码 */
    current?: number;
    /** 页面的容量 */
    pageSize?: number;
  },
  options?: { [key: string]: any }
) {
  return request<API.Any>("/be/leadsview", {
    method: "GET",
    params: {
      ...params,
      type: "student",
      status: status,
    },
    ...(options || {}),
  });
}

//Onboarding search fields
export async function studentsDashboardFilter(
  status: string,
  name: string,
  phoneNumber: string,
  email: string,
  prm_name: string,
  studentID: string,
  params: {
    // query
    /** 当前的页码 */
    current?: number;
    /** 页面的容量 */
    pageSize?: number;
  },
  options?: { [key: string]: any }
) {
  return request<API.RuleList>("/be/leadsview", {
    method: "GET",
    params: {
      ...params,
      type: "student",
      status: status,
      name: name ? name : "",
      phoneNumber: phoneNumber ? phoneNumber : "",
      email: email ? email : "",
      prm: prm_name ? prm_name : "",
      studentID: studentID ? studentID : "",
    },
    ...(options || {}),
  });
}

//Onboarding search fields
export async function getStudentActiveBatches(
  id: string,
  options?: { [key: string]: any }
) {
  return request<any>(`/be/student/active/batches/${id}`, {
    method: "GET",
    ...(options || {}),
  });
}

/**
 * Rebatch Student
 * @param studentId
 * @param batchId
 * @returns
 */
export async function rebatchStudent(studentId: string, batchId: string) {
  return request<any>("/be/re-batch", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ studentId, batchId }),
  });
}

//Payment API's
export async function getAllPayment(
  //studentId: string,
  params: {
    current?: number;
    pageSize?: number;
    autodebitStatus?: string;
  },
  options?: { [key: string]: any }
) {
  return request<API.Any>(`/be/studentPaymentDetails`, {
    method: "GET",
    params: {
      ...params,
      //studentId,
    },
    ...(options || {}),
  });
}

//edit payment
export async function editPayment(options?: { [key: string]: any }) {
  return request<any>("/be/paymentDetails", {
    method: "POST",
    ...(options || {}),
  });
}

//regenerate razorpay link
export async function regeneratePaymentLink(options?: { [key: string]: any }) {
  return request<any>("/be/regeneratePaymentLink", {
    method: "POST",
    ...(options || {}),
  });
}

//Add Net Banking details
export async function editNetBanking(options?: { [key: string]: any }) {
  return request<any>("/be/uploadNetBankingResource", {
    method: "POST",
    ...(options || {}),
  });
}

//Refresh the installment status
export async function refreshRazorpayStatus(
  transactionId: string,
  reference_id: string,
  refreshLink: boolean,
  options?: { [key: string]: any }
) {
  return request<any>(
    `/be/update-installment-status?installment_id=${transactionId}&reference_id=${reference_id}&refreshLink=${refreshLink}`,
    {
      method: "POST",
      ...(options || {}),
    }
  );
}

//Refresh status - autodebit
export async function refreshAutoDebitStatus(options?: { [key: string]: any }) {
  return request<any>(`/be/updateAutoDebitStatus`, {
    method: "POST",
    ...(options || {}),
  });
}

//Get details of all payment - autodebit
export async function getAllAutoDebitStatus(options?: { [key: string]: any }) {
  return request<any>(`/be/fetchAutoDebitDetails`, {
    method: "POST",
    ...(options || {}),
  });
}

//retry auto-debit payment
export async function retryAutodebitPayment(options?: { [key: string]: any }) {
  return request<any>("/be/retryAutoDebitPayment", {
    method: "POST",
    ...(options || {}),
  });
}

// Activate Cashfree Subscription
export async function activateCashfreeSubscription(options?: {
  [key: string]: any;
}) {
  return request<any>("/be/activateCashfreeSubscription", {
    method: "POST",
    ...(options || {}),
  });
}

//get all zoom
export async function getAllZoomUsers(
  //studentId: string,
  params: {
    current?: number;
    pageSize?: number;
  },
  options?: { [key: string]: any }
) {
  return request<API.Any>(`/be/zoom-users`, {
    method: "GET",
    params: {
      ...params,
    },
    ...(options || {}),
  });
}

//get all zoom
export async function getAllZoomMeetings(
  //studentId: string,
  params: {
    current?: number;
    pageSize?: number;
  },
  options?: { [key: string]: any }
) {
  return request<API.Any>(`/be/zoom-meetings`, {
    method: "GET",
    params: {
      ...params,
    },
    ...(options || {}),
  });
}

//get zoom user details
export async function getZoomUser(id: string) {
  return request<API.Any>(`/be/zoom-user/${id}`, {
    method: "GET",
  });
}

//delete zoom user
export async function deleteZoomUser(id: string) {
  return request<API.Any>(`/be/zoom-user/${id}`, {
    method: "DELETE",
  });
}

//delete zoom user
export async function addZoomUser(id: string) {
  return request<API.Any>(`/be/zoom-user/${id}`, {
    method: "POST",
  });
}

//delete zoom user
export async function reassignZoomUserLicense(from: string, to: string) {
  return request<API.Any>(`/be/zoom-user/reassign/${from}/${to}`, {
    method: "POST",
  });
}

//update zak token
export async function updateZoomUserZAKToken(id?: string) {
  return request<API.Any>(`/be/zoom-user/update/zak?userId=${id ? id : ""}`, {
    method: "POST",
  });
}

//delete zoom user
export async function dynamicAPI(url, method, params, options = {}) {
  return request<API.Any>(`/be/${url}`, {
    method,
    params,
    ...(options || {}),
  });
}

/**
 * Collection Agents
 */

//get all zoom
export async function getAllCollectionAgents(
  //studentId: string,
  params: {
    current?: number;
    pageSize?: number;
  },
  options?: { [key: string]: any }
) {
  return request<API.Any>(`/be/collection-agents`, {
    method: "GET",
    params: {
      ...params,
    },
    ...(options || {}),
  });
}

//verify down payment
export async function verifyDownPayment(options?: { [key: string]: any }) {
  return request<any>(`/be/verifyDownPayment`, {
    method: "POST",
    ...(options || {}),
  });
}

//GET ASSESSMENT DETAILS
export async function getAllAttendance(
  params: {
    current?: number;
    pageSize?: number;
  },
  options?: { [key: string]: any }
) {
  return request<API.RuleList>(`/be/azure?url=api/classAttendance`, {
    method: "GET",
    params: {
      ...params,
    },
    ...(options || {}),
  });
}

//GET Lessons DETAILS
export async function getAllLessons(
  params: {
    current?: number; // page
    pageSize?: number; // size
    lessonId?: string;
  },
  options?: { [key: string]: any }
) {
  return request<API.RuleList>(
    `/be/azure?url=api/lesson/${params.lessonId || ""}`,
    {
      method: "GET",
      params: {
        ...params,
      },
      ...(options || {}),
    }
  );
}

//PUT - ATTENDANCE DETAILS
export async function updateAssessment(
  id: string,
  options?: { [key: string]: any }
) {
  return request<any>(`/be/azure?url=api/classAttendance/${id}`, {
    method: "PUT",
    ...(options || {}),
  });
}

//PUT - Update Lesson
export async function updateLesson(options?: { [key: string]: any }) {
  return request<any>(`/be/azure?url=api/lesson`, {
    method: "POST",
    ...(options || {}),
  });
}

//Get One Student Attendance
export async function getOneAttendance(
  params: {
    studentId: string;
  },
  options?: { [key: string]: any }
) {
  return request<API.RuleList>(`/be/azure?url=api/classAttendance`, {
    method: "GET",
    params: {
      ...params,
    },
    ...(options || {}),
  });
}

//Sync All Users and update in Mongo
export async function syncUsersToMongo() {
  return request<API.RuleList>(`/be/sync-users-to-mongo`, {
    method: "GET",
  });
}

//Get One Student Attendance
export async function getPaymentHistory(
  params: {
    current?: number;
    pageSize?: number;
    studentId?: string;
    title?: string;
  },
  options?: { [key: string]: any }
) {
  return request<API.RuleList>(`/be/logs?url=logs/all`, {
    method: "GET",
    params: {
      page: params.current,
      perpage: params.pageSize,
      refresh: 0,
      selectedPage: "payments-history",
      filters: {
        id: {
          value: params.studentId,
          matchMode: "contains",
        },
        title: {
          value: params.title,
          matchMode: "contains",
        },
      },
    },
    ...(options || {}),
  });
}

// Getting Installment History Details
export async function getInstallmentHistory(
  params: {
    current?: number;
    pageSize?: number;
    studentId?: string;
    title?: string;
  },
  options?: { [key: string]: any }
) {
  return request<API.RuleList>(`/be/logs?url=logs/all`, {
    method: "GET",
    params: {
      page: params.current,
      perpage: 100,
      refresh: 0,
      selectedPage: "payments",
      filters: {
        "debug.oldRecord.transaction.studentId": {
          value: params.studentId,
          matchMode: "contains",
        },
        title: {
          value: params.title,
          matchMode: "contains",
        },
      },
      sortField: "createdAt",
      sortOrder: 1,
    },
    ...(options || {}),
  });
}

//Sync Payment And User Info
export async function syncStudentPaymentInfo(userId: string) {
  return request<API.RuleList>(
    `/be/sync/student/payments/info/mongo?userId=${userId}`,
    {
      method: "POST",
    }
  );
}

// Deactivate Students In Bulk
export async function deactivateStudentsInBulk(options?: {
  [key: string]: any;
}) {
  return request<any>("/be/student/deactivate/bulk", {
    method: "POST",
    ...(options || {}),
  });
}

// API to move students from startclasslater to Batching
export async function syncClassStartDate() {
  return request<API.RuleList>(`/be/batching/startclasslater-to-batching`, {
    method: "GET",
  });
}

// API to get school data
export async function listSchool(
  params?: {
    current?: number;
    pageSize?: number;
  },
  options?: { [key: string]: any }
) {
  return request<API.RuleList>("/be/listSchool", {
    method: "GET",
    params: {
      ...params,
    },
    ...(options || {}),
  });
}

// API to get SRA
export async function getSra(
  params?: {
    current?: number;
    pageSize?: number;
  },
  options?: { [key: string]: any }
) {
  return request<API.RuleList>("/be/getSra", {
    method: "GET",
    params: {
      ...params,
    },
    ...(options || {}),
  });
}

//API to view batches without School
export async function listBatchForSchool(options?: { [key: string]: any }) {
  return request<API.RuleList>("/be/listBatchForSchool", {
    method: "GET",
    ...(options || {}),
  });
}

// API to CREATE School
export async function createSchool(options?: { [key: string]: any }) {
  return request<any>("/be/createSchool", {
    method: "POST",
    ...(options || {}),
  });
}

// API to EDIT School
export async function editSchool(options?: { [key: string]: any }) {
  return request<any>("/be/editSchool", {
    method: "PUT",
    ...(options || {}),
  });
}

//API to generate missing assessments for selected batch
export async function generateMissingAssessmentsForBatch(options: {
  [key: string]: any;
}) {
  return request<any>(
    `/be/azure?url=api/teacher/generate-missing-assessments`,
    {
      method: "POST",
      ...(options || {}),
    }
  );
}

//API to save student school in Cosmos
export async function updateStudentSchool(
  id: string,
  options?: { [key: string]: any }
) {
  return request<any>(`/be/azure?url=api/users/${id}`, {
    method: "PUT",
    ...(options || {}),
  });
}

// API to CREATE SRA
export async function createSRA(options?: { [key: string]: any }) {
  return request<any>("/be/createSRA", {
    method: "POST",
    ...(options || {}),
  });
}

// API to EDIT SRA
export async function editSRA(options?: { [key: string]: any }) {
  return request<any>("/be/editSRA", {
    method: "PUT",
    ...(options || {}),
  });
}

//API to Add Batch to School
export async function addBatchToSchool(options?: { [key: string]: any }) {
  return request<any>("/be/addBatchToSchool", {
    method: "POST",
    ...(options || {}),
  });
}

//API POST - TO CHECK THE STUDENT ALREADY IN A BATCH
export async function checkStudentInBatch(
  data?: any,
  options?: { [key: string]: any }
) {
  return request<any>("/be/batch/checkStudent", {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
}

//API for getting Countries
export async function listLocation(data: any) {
  return request<any>("/be/listLocations", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
}

//API to bulk remove students from batch
export async function bulkRemoveBatchStudents(data: any) {
  return request<any>("/be/bulkRemoveStudentsFromBatch", {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
}

//API - GET LESSON SCRIPT
export async function getAllLessonScripts(
  params: {
    current?: number;
    pageSize?: number;
    id?: string;
  },
  options?: { [key: string]: any }
) {
  const requestRes = request<API.RuleList>(`/be/azure?url=api/lessonScript`, {
    method: "GET",
    params: {
      ...params,
    },
    ...(options || {}),
  });
  if (params.id) {
    const response = await requestRes;
    console.log(response);
    if (response.data?.length !== 0) {
      const lessonScript = response.data[0];
      if (!lessonScript.lessonDetails) {
        lessonScript.lessonDetails = [];
      }
      if (
        lessonScript.payloadPath &&
        typeof lessonScript.payloadPath === "string"
      ) {
        const payloadPath = getImageURL(lessonScript.payloadPath);
        const lessonDetails = await loadJSONFile(payloadPath);
        lessonScript.lessonDetails = lessonDetails;
        response.data[0] = lessonScript;
      }
    }

    return response;
  }
  return request<API.RuleList>(`/be/azure?url=api/lessonScript`, {
    method: "GET",
    params: {
      ...params,
    },
    ...(options || {}),
  });
}

//API - CREATE LESSON SCRIPT
export async function createLessonScript(
  params: {},
  data: any,
  options?: { [key: string]: any }
) {
  return request<API.RuleList>(`/be/azure?url=api/lessonScript`, {
    method: "POST",

    params: {
      ...params,
    },
    headers: { "Content-Type": "application/json" },
    data,
    ...(options || {}),
  });
}

//API - Edit LESSON SCRIPT
export async function updateLessonScript(
  params: {},
  data: any,
  options?: { [key: string]: any }
) {
  return request<API.RuleList>(`/be/azure?url=api/lessonScript`, {
    method: "PUT",

    params: {
      ...params,
    },
    headers: { "Content-Type": "application/json" },
    data,
    ...(options || {}),
  });
}

//API - DELETE LESSON SCRIPT BY ID
export async function deleteLessonScriptById(
  params: { id: string },
  options?: { [key: string]: any }
) {
  return request<API.RuleList>(`/be/azure?url=api/lessonScript`, {
    method: "DELETE",
    params: {
      ...params,
    },
    ...(options || {}),
  });
}

export async function getAssessmentQuestions(
  params?: {
    pageSize?: number;
    current?: number;
    keyword?: string;
  },
  sort?: {
    field?: string;
    order?: number;
  },
  filter?: { [key: string]: any },
  options?: { [key: string]: any }
) {
  return request<API.AssessmentList>(`/be/azure?url=api/assessmentQuestions`, {
    method: "GET",
    params: {
      ...params,
    },
    ...(sort || {}),
    ...(filter || {}),
    ...(options || {}),
  });
}

export async function getLesson(id?: string) {
  return request<API.AssessmentList>(`/be/azure?url=api/lesson/${id}`, {
    method: "GET",
  });
}

// Fetch azure api config data.
export async function getAzureApiConfigs() {
  return request<API.AssessmentList>(`/be/azure?url=api/config/`, {
    method: "GET",
  });
}

export async function updateAssessmentContent(options?: {
  [key: string]: any;
}) {
  return request<any>(`/be/azure?url=api/assessmentQuestions`, {
    method: "PUT",
    ...(options || {}),
  });
}

export async function uploadImagesStorage(
  params: { path: string; fileLocation?: string; type?: string; name?: string },
  options?: { [key: string]: any }
) {
  return request<API.RuleList>(`/be/upload/images`, {
    method: "POST",
    params: {
      ...params,
    },
    ...(options || {}),
  });
}

export async function loadJSONFile(url: string) {
  return request<API.RuleList>(`/be/fileProxy?url=${url}`, {
    method: "GET",
  });
}

export async function uploadCsvAndCreateCSVUploadRecord(options?: {
  [key: string]: any;
}) {
  return request<API.RuleList>(`/be/upload/csv?createRecord=true`, {
    method: "POST",
    ...(options || {}),
  });
}

export async function updateCSVUploadRecord(data) {
  return request<API.RuleList>(`/be/updateCSVUploadRecord`, {
    method: "PUT",
    data,
  });
}
