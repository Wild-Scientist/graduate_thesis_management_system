export default [
  {
    path: '/',
    redirect: '/project_start_up',
  },
  {
    path: '/project_start_up',
    name: 'project_start_up',
    icon: 'FileProtectOutlined',
    access: 'checkRoute',
    routes: [
      {
        path: '/project_start_up',
        redirect: '/project_start_up/my_projects',
      },
      {
        path: '/project_start_up/my_projects',
        component: './startup',
        name: 'project_start_up-my_projects',
        access: 'checkRoute',
      },
      {
        path: '/project_start_up/project_examination',
        component: './startup',
        name: 'project_start_up-project_examination',
        access: 'checkRoute',
      },
    ],
  },
  {
    path: '/middle_examination',
    name: 'middle_examination',
    icon: 'FileProtectOutlined',
    access: 'checkRoute',
    routes: [
      {
        path: '/middle_examination',
        redirect: '/middle_examination/my_projects',
      },
      {
        path: '/middle_examination/my_projects',
        component: './startup',
        name: 'middle_examination-my_projects',
        access: 'checkRoute',
      },
      {
        path: '/middle_examination/project_examination',
        component: './startup',
        name: 'middle_examination-project_examination',
        access: 'checkRoute',
      },
    ],
  },
  {
    path: '/final_examination',
    name: 'final_examination',
    icon: 'FileProtectOutlined',
    access: 'checkRoute',
    routes: [
      {
        path: '/final_examination',
        redirect: '/final_examination/my_projects',
      },
      {
        path: '/final_examination/my_projects',
        component: './startup',
        name: 'final_examination-my_projects',
        access: 'checkRoute',
      },
      {
        path: '/final_examination/project_examination',
        component: './startup',
        name: 'final_examination-project_examination',
        access: 'checkRoute',
      },
    ],
  },
  {
    path: '/system',
    name: 'system',
    icon: 'setting',
    access: 'checkRoute',
    component: './setting',
  },
  {
    path: '/users',
    name: 'users',
    icon: 'team',
    access: 'checkRoute',
    routes: [
      {
        path: '/users',
        redirect: '/users/list',
      },
      {
        path: '/users/list',
        component: './users/list',
        name: 'users-list',
        access: 'checkRoute',
      },
      {
        path: '/users/permission',
        component: './users/permission',
        name: 'users-permission',
        access: 'checkRoute',
      },
    ],
  },
  // {
  //   path: '/account',
  //   name: 'account',
  //   icon: 'user',
  //   routes: [
  //     {
  //       path: '/account',
  //       redirect: '/account/center',
  //     },
  //     {
  //       path: '/account/center',
  //       component: './account/center',
  //       name: 'center',
  //     },
  //     {
  //       path: '/account/settings',
  //       component: './account/settings',
  //       name: 'settings',
  //     },
  //   ],
  // },
  // {
  //   path: '/dev',
  //   name: 'dev',
  //   icon: 'setting',
  //   access: 'isDev',
  //   routes: [
  //     {
  //       path: '/dev',
  //       redirect: '/dev/version',
  //     },
  //     {
  //       path: '/dev/version',
  //       component: './dev/version',
  //       name: 'dev-version',
  //     },
  //   ],
  // },
  {
    path: '/demos',
    name: 'demos',
    icon: 'AppstoreOutlined',
    access: 'isDev',
    routes: [
      {
        path: '/demos',
        redirect: '/demos/fs',
      },
      {
        path: '/demos/base',
        component: './demos/base',
        name: 'demos-base',
      },
      {
        path: '/demos/media',
        component: './demos/media',
        name: 'demos-media',
      },
      {
        path: '/demos/fs',
        component: './demos/fs',
        name: 'demos-fs',
      },
    ],
  },
  {
    path: '/share/:id',
    component: './share',
    layout: false,
  },
  {
    path: '/loginFs',
    layout: false,
    component: './user/LoginFs',
  },
  {
    component: '404',
  },
  {
    path: '/user',
    component: '../layouts/auth',
    layout: false,
    routes: [
      {
        path: '/user',
        redirect: '/user/login',
      },
      {
        path: '/user/login',
        component: './user/Login',
        name: 'login',
      },
      {
        path: '/user/register',
        component: './user/register',
        name: 'register',
      },
    ],
  },
];
