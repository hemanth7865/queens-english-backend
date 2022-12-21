/* eslint-disable */

declare namespace API {
  type CurrentUser = {
    firstname?: string;
    lastname?: string;
    name?: string;
    avatar?: string;
    roles?: string;
    role?: string;
    org?: string;
    userid?: string;
    email?: string;
    signature?: string;
    title?: string;
    group?: string;
    tags?: { key?: string; label?: string }[];
    notifyCount?: number;
    unreadCount?: number;
    country?: string;
    access?: string;
    geographic?: {
      province?: { label?: string; key?: string };
      city?: { label?: string; key?: string };
    };
    address?: string;
    phone?: string;
    googleId?: string;
  };

  type LoginResult = {
    status?: string;
    type?: string;
    currentAuthority?: string;
  };

  type PageParams = {
    current?: number;
    pageSize?: number;
  };

  type RuleListItem = {
    key?: number;
    disabled?: boolean;
    href?: string;
    avatar?: string;
    name?: string;
    owner?: string;
    desc?: string;
    callNo?: number;
    status?: number;
    updatedAt?: string;
    createdAt?: string;
    progress?: number;
  };

  type RuleList = {
    data?: RuleListItem[];
    /** 列表的内容总数 */
    total?: number;
    success?: boolean;
  };

  type FACTLicenseListItem = {
    licenseCode?: string;
    org?: string;
    b2cUserId?: string;
    id?: string;
    date?: Date;
    status?: string;
  };

  type FACTLicenseList = {
    data?: FACTLicenseListItem[];
    total?: number;
    success?: boolean;
  };

  type FakeCaptcha = {
    code?: number;
    status?: string;
  };

  type LoginParams = {
    username?: string;
    password?: string;
    autoLogin?: boolean;
    type?: string;
    email?: string;
    imageUrl?: string;
    name?: string;
  };

  type ErrorResponse = {
    /** 业务约定的错误码 */
    errorCode: string;
    /** 业务上的错误信息 */
    errorMessage?: string;
    /** 业务上的请求是否成功 */
    success?: boolean;
  };

  type NoticeIconList = {
    data?: NoticeIconItem[];
    /** 列表的内容总数 */
    total?: number;
    success?: boolean;
  };

  type NoticeIconItemType = 'notification' | 'message' | 'event';

  type NoticeIconItem = {
    id?: string;
    extra?: string;
    key?: string;
    read?: boolean;
    avatar?: string;
    title?: string;
    status?: string;
    datetime?: string;
    description?: string;
    type?: NoticeIconItemType;
  };

  type batchItem = {
    id: string;
    batchId: string;
    lessonStartTime: string | DateTime;
    name?: string;
    date: string | DateTime;
    dateSlot?: string;
    createdBy?: string;
    teacher?: string;
    startingLessonId?: string;
    endingLessonId?: string;
    activeLessonId?: string;
    students?: string;
    status?: string;
    studentsList?: [];
    zoomLink?: string;
    zoomInfo?: string;
    whatsappLink?: string;
  }

  type SchoolItem = {
    id?: string;
    schoolName?: string;
    createdAt?: string | DateTime;
    batchesNumber?: number;
  }

  type Any = any;
}
