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
    path: '/welcome',
    name: 'welcome',
    icon: 'smile',
    component: './Welcome',
  },
  {
    path: '/admin',
    name: 'admin',
    icon: 'crown',
    access: 'canAdmin',
    // component: './Admin',
    routes: [
      {
        path: '/admin/fact-license',
        name: 'FACT Licenses',
        icon: 'smile',
        component: './FactLicenses',
      },
      {
        path: '/admin/cosmic-license',
        name: 'Cosmic One Licenses',
        icon: 'smile',
        component: './TableList',
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
        path: '/manage/studentBatch',
        component: './StudentList',
      }, 
      {
        name: 'Assessment',
        path: '/manage/assessment',
        component: './Assessment'
      }
    ]
  },
  {
    path: '/',
    redirect: '/welcome',
  },
  {
    component: './404',
  },
];
