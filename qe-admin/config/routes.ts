export default [
  {
    path: '/user',
    layout: false,
    routes: [
      {
        path: '/user',
        routes: [
          {
            name: 'login',
            path: '/user/login',
            component: './user/Login',
          },
        ],
      },
      {
        component: './404',
      },
    ],
  },
  {
    path: '/manage',
    name: 'manage',
    icon: 'table',
    access: 'canManage',
    routes: [
      {
        name: 'Batch',
        path: '/manage/batch',
        component: './BatchList',
      },
      {
        name: 'Teacher',
        path: '/manage/teacherBatch',
        component: './TeacherBatchList',
      },
      {
        name: 'User',
        path: '/manage/UserBatch',
        component: './StudentList',
      },
      {
        name: 'Student',
        path: '/manage/StudentBatch',
        component: './StudentsBatchList',
      },
      {
        name: 'Assessment',
        path: '/manage/assessment',
        component: './NewAssessment'
      },
      {
        name: 'Onboarding',
        path: '/manage/onboarding',
        component: './OnboardStudent'
      },
    ]
  },
  {
    path: '/',
    redirect: '/manage/StudentBatch',
  },
  {
    component: './404',
  },
];
