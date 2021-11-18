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
      // {
      //   path: '/admin/sub-page',
      //   name: 'sub-page',
      //   icon: 'smile',
      //   component: './Welcome',
      // },
      {
        component: './404',
      },
    ],
  },
  {
    name: 'list.classes',
    icon: 'table',
    path: '/classes',
    component: './TableList',
  },
  {
    name: 'list.students',
    icon: 'table',
    path: '/students',
    component: './TableList',
  },
  {
    name: 'list.table-list',
    icon: 'table',
    path: '/list',
    component: './TableList',
  },
  {
    name: 'batch list',
    icon: 'table',
    path: '/batch',
    component: './BatchList',
  },
  {
    name: 'Teacher Management',
    path: '/teacherBatch',
    component: './TeacherBatchList',
  },
  {
    path: '/',
    redirect: '/welcome',
  },
  {
    component: './404',
  },
];
