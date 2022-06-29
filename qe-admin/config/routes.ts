export default [
  {
    path: "/user",
    layout: false,
    routes: [
      {
        path: "/user",
        routes: [
          {
            name: "login",
            path: "/user/login",
            component: "./user/Login",
          },
        ],
      },
      {
        component: "./404",
      },
    ],
  },
  {
    path: "/manage",
    name: "manage",
    icon: "table",
    access: "canManage",
    routes: [
      {
        name: "Batch",
        path: "/manage/batch",
        component: "./BatchList",
      },
      {
        name: "Teacher",
        path: "/manage/teacherBatch",
        component: "./TeacherBatchList",
      },
      {
        name: "User",
        path: "/manage/UserBatch",
        component: "./StudentList",
        access: "canSuperAdmin",
      },
      {
        name: "Student",
        path: "/manage/StudentBatch",
        component: "./StudentsBatchList",
      },
      {
        name: "Assessment",
        path: "/manage/assessment",
        component: "./NewAssessment",
      },
      {
        name: "Payment",
        path: "/manage/payment",
        component: "./Payment",
      },
      {
        name: "Collection Agents",
        path: "/manage/collection-agents",
        component: "./CollectionAgent",
      },
      {
        name: "Zoom License",
        path: "/manage/zoom/license",
        component: "./ZoomLicense",
      },
      {
        name: "Onboard",
        path: "/manage/dashboard",
        routes: [
          {
            name: "Sales Alert View",
            path: "/manage/dashboard/salesAlertView",
            component: "./SalesAlert",
          },
          {
            name: "Welcome",
            path: "/manage/dashboard/welcome",
            component: "./WelcomeStudent",
          },
          {
            name: "Batching Waitlist",
            path: "/manage/dashboard/startclasslater",
            component: "./StartClassLater",
          },
          {
            name: "Batching",
            path: "/manage/dashboard/batching",
            component: "./BatchingStudent",
          },
          {
            name: "Create Batch",
            path: "/manage/dashboard/needBatch",
            component: "./NeedBatch",
          },
          {
            name: "Onboarding",
            path: "/manage/dashboard/onboarding",
            component: "./OnboardStudent",
          },
        ],
      },
    ],
  },
  {
    path: "/teacher",
    name: "Teacher",
    icon: "table",
    access: "canTeacher",
    routes: [
      {
        name: "My Batches",
        path: "/teacher/my-batches",
        component: "./MyBatches",
      },
    ],
  },
  {
    path: "/",
    redirect: "/manage/StudentBatch",
  },
  {
    path: "/",
    redirect: "/teacher/my-batches",
  },
  {
    component: "./404",
  },
];
