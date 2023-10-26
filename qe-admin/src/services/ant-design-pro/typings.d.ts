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

  type RuleList<T = RuleListItem[]> = {
    data?: T;
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

  type NoticeIconItemType = "notification" | "message" | "event";

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
  };

  type SchoolItem = {
    id?: string;
    schoolName?: string;
    createdAt?: string | DateTime;
    batchesNumber?: number;
  };

  /**Lesson scripts type */
  type LessonScriptExerciseSection = {
    type?: string;
    image?: string;
    description?: string;
  };

  type LessonScriptExercise = {
    heading?: string;
    subHeading?: string;
    sections?: LessonScriptExerciseSection[];
  };

  type lessonScripts = {
    id?: string;
    number?: string;
    lessonId?: string;
    lessonDetails?: LessonScriptExercise[];
    createdAt?: string | DateTime;
    updatedAt?: string | DateTime;
  };

  type StudentItem = {
    id: string;
    leadId?: string;
    date: string;
    phoneNumber: string;
    email: string;
    status: string;
    classesTaken: number;
    slots: string;
    type: string;
    name?: string;
    batchCode: string;
    studentID?: string;
    dob: string;
    whatsapp?: string;
    address: any;
    classType: any;
    payments: Payment[];
    paymentid: string;
    downpayment: string;
    classessold: string;
    saleamount: string;
    plantype: string;
    studentId: string;
    subscription: string;
    subscriptionNo: string;
    emi: string;
    emiMonths: string;
    paymentMode: string;
    dateofsale: string;
    classtype: string;
    notes: string;
    forceRazorpayMoveSAV: string;
    emiPaymentStatus: string;
    duedate: string;
    age?: string;
    startDate: string;
    startLesson?: string;
    pfirstName: any;
    plastName: any;
    course?: string;
    comments: any;
    alternativeMobile?: string;
    firstName: string;
    lastName: string;
    teacherName?: string;
    classesStartDate: string;
    callStatus?: string;
    callBackon?: string;
    bdaName: any;
    bdmName: any;
    poc: any;
    courseFrequency: any;
    timings?: string;
    customerEmail?: string;
    state: any;
    zoomLink: string;
    zoomInfo: string;
    prm_id: number;
    prm_firstName: string;
    prm_lastName: string;
    salestatus: string;
    salesowner: any;
    prm: string;
    waMessageSent?: string;
    salesDataFilled: any;
    lsq_user_id: string;
    lsq_user_name: string;
    whatsappLink: string;
    gender: any;
    batchId: {
      batchId: string;
    }[];
    reasonInSAV: any;
    onboardingIssueReason: any;
    batchesClassesStartDate: string;
    enrollmentType: any;
    dateOfInactivation: string;
    schoolName?: string;
    isSibling: number;
    offlineUser: number;
    batchesHistory: BatchesHistory[];
    userCode?: string;
    classSection?: string;
    password?: string;
    classCode?: string;
    useAutoAttendance?: number;
    teacherCode?: string;
    useNewZoomLink?: number;
  };

  export interface Payment {
    id: string;
    paymentid: string;
    plantype: string;
    classtype: string;
    classessold: number;
    saleamount: string;
    dateofsale: any;
    downpayment: number;
    duedate: any;
    no_of_delayed_payments: number;
    delay_date: any;
    delay_status: any;
    notes: string;
    created_at: string;
    updated_at: string;
    studentId: string;
    emi: string;
    emiMonths: string;
    paymentMode: string;
    subscription: string;
    subscriptionNo: string;
    is_down_payment_verified: number;
    is_down_payment_auto_verified: number;
    forceRazorpayMoveSAV: number;
    emiPaymentStatus: string;
  }

  export interface BatchesHistory {
    name: string;
    batchNumber: string;
    id: string;
    created_at: string;
    phoneNumber: string;
    batchesClassesStartDate?: string;
  }

  type Any = any;
}
