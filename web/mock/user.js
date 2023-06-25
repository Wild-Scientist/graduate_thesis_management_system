import Cookies from 'js-cookie';

const waitTime = (time = 100) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(true);
    }, time);
  });
};

async function getFakeCaptcha(req, res) {
  await waitTime(2000);
  return res.json('captcha-xxx');
}

/**
 * 当前用户的权限，如果为空代表没登录
 * current user access， if is '', user need login
 */
let access = '';
const getAccess = () => {
  return access;
};

// 代码中会兼容本地 service mock 以及部署站点的静态数据
export default {
  // 获取登录用户信息
  'GET /api/current_user': (req, res) => {
    if (!getAccess()) {
      res.status(401).send({
        errorMessage: '未登录',
      });
      return;
    }

    res.send({
      success: true,
      data: {
        id: 1,
        username: 'super',
        name: '超管',
        role_code: 'super',
        avatar: 'https://gw.alipayobjects.com/zos/antfincdn/XAosXuNZyF/BiazfanxmamNRoxxVxka.png',
        phone: '15008437193',
        email: '87826632@qq.com',
        student_number: '201611060132',
        payroll_number: '1110100',
        signature: '海纳百川，有容乃大',
        title: '前端工程师',
        departments: 'SpaceCat－技术部',
        notifyCount: 12, // ?
        unreadCount: 11,
        country: 'China',
        // access: getAccess(),
        geographic: {
          province: {
            label: '四川省',
            key: '510000',
          },
          city: {
            label: '成都市',
            key: '510100',
          },
        },
        address: '高新区天府四街',
      },
    });
  },

  // 获取用户列表
  'GET /api/users': [
    {
      id: 1,
      username: 'super',
      name: '超管',
    },
    {
      id: 2,
      username: 'xlb',
      name: '小鲁班',
    },
  ],

  // 账户密码密码 or 手机号登录
  'POST /api/login/account': async (req, res) => {
    const { password, username, type } = req.body;
    await waitTime(2000);

    if (password === 'super' && username === 'super') {
      Cookies.set('t', 't-xxx');
      res.send({ success: true });
      access = 'admin';
      return;
    }

    if (type === 'mobile') {
      res.send({ success: true });
      access = 'admin';
      return;
    }

    res.send({
      success: false,
      errorMessage: '用户名或密码错误',
    });
    access = 'guest';
  },

  // 退出登录
  'POST /api/login/out_login': (req, res) => {
    access = '';
    res.send({ success: true });
  },

  'POST /api/register': (req, res) => {
    res.send({
      status: 'ok',
      currentAuthority: 'user',
      success: true,
    });
  },
  'GET /api/500': (req, res) => {
    res.status(500).send({
      timestamp: 1513932555104,
      status: 500,
      error: 'error',
      message: 'error',
      path: '/base/category/list',
    });
  },
  'GET /api/404': (req, res) => {
    res.status(404).send({
      timestamp: 1513932643431,
      status: 404,
      error: 'Not Found',
      message: 'No message available',
      path: '/base/category/list/2121212',
    });
  },
  'GET /api/403': (req, res) => {
    res.status(403).send({
      timestamp: 1513932555104,
      status: 403,
      error: 'Forbidden',
      message: 'Forbidden',
      path: '/base/category/list',
    });
  },
  'GET /api/401': (req, res) => {
    res.status(401).send({
      timestamp: 1513932555104,
      status: 401,
      error: 'Unauthorized',
      message: 'Unauthorized',
      path: '/base/category/list',
    });
  },

  // 获取登录验证码
  'GET  /api/login/captcha': getFakeCaptcha,
};
