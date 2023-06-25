import { history } from 'umi';
import { PageLoading } from '@ant-design/pro-layout';
import RightContent from '@/components/RightContent';
import Footer from '@/components/Footer';
import { currentUser as queryCurrentUser } from './services/auth/auth';
import Cookies from 'js-cookie';
import { stringify } from 'querystring';
import { getFeishuLoginUrl } from '@/services/auth/feishu';

const isDev = process.env.NODE_ENV === 'development';

// 不检查登录的路由列表
let noAuthPaths = ['/user/login', '/user/register', '/loginFs'];
// 注意因为生产中使用了静态化，会出现最后自动带一个/的情况，因此每条路由都需要额外增加一条
noAuthPaths = noAuthPaths.concat(noAuthPaths.map((p) => p + '/'));

/** 获取用户信息比较慢的时候会展示一个 loading */
export const initialStateConfig = {
  loading: <PageLoading />,
};

/**
 * @see  https://umijs.org/zh-CN/plugins/plugin-initial-state
 * */
export async function getInitialState() {
  const fetchUserInfo = async () => {
    try {
      const res = await queryCurrentUser();
      return res.data;
    } catch (error) {
      // 如果获取不到用户信息，跳转登录
      turnToLogin();
    }
    return undefined;
  };

  // 如果是登录页面，不执行
  if (!noAuthPaths.includes(history.location.pathname)) {
    const currentUser = await fetchUserInfo();
    return {
      fetchUserInfo,
      currentUser,
      settings: {},
    };
  }

  return {
    fetchUserInfo,
    settings: {},
  };
}

// ProLayout 支持的api https://procomponents.ant.design/components/layout
export const layout = ({ initialState }) => {
  return {
    rightContentRender: () => <RightContent />,
    disableContentMargin: false,
    // waterMarkProps: {
    //   content: initialState?.currentUser?.name,
    // },
    footerRender: () => <Footer />,
    onPageChange: () => {
      const { location } = history;

      // 页面跳转时进行登录检查
      if (!initialState?.currentUser && !noAuthPaths.includes(history.location.pathname)) {
        turnToLogin();
      }
    },
    links: isDev
      ? [
          // 菜单链接，在中等屏幕下有瑕疵
          // <a href="https://baidu.com" target="_blank" rel="noreferrer">
          //   <LinkOutlined style={{ marginRight: 5 }} />
          //   <FormattedMessage id={'menu.link.example'} />
          // </a>,
          // <Link to="/umi/plugin/openapi" target="_blank">
          //   <LinkOutlined />
          //   <span>OpenAPI 文档</span>
          // </Link>,
          // <Link to="/~docs">
          //   <BookOutlined />
          //   <span>业务组件文档</span>
          // </Link>,
        ]
      : [],
    menuHeaderRender: undefined,
    // 自定义 403 页面
    // unAccessible: <div>unAccessible</div>,
    ...initialState?.settings,
  };
};

// request 拦截器
const authInterceptor = (url, options) => {
  if (Cookies.get('t') && !options.headers.Authorization) {
    options.headers.Authorization = `Bearer ${Cookies.get('t')}`;
  }
  return { url, options };
};
const acceptInterceptor = (url, options) => {
  if (!options.headers.Accept) {
    options.headers.Accept = 'application/json';
  }
  return { url, options };
};
export const request = {
  // 新增自动添加AccessToken的请求前拦截器
  requestInterceptors: [authInterceptor, acceptInterceptor],
};

// 跳登录逻辑
const turnToLogin = () => {
  const { pathname } = history.location;

  if (!noAuthPaths.includes(window.location.pathname)) {
    // 跳登录
    // history.replace({
    //   pathname: '/user/login',
    //   search: stringify({
    //     redirect: pathname,
    //   }),
    // });

    // 纯飞书项目可以使用下面逻辑
    history.replace({ pathname: '/loginFs' });
    getFeishuLoginUrl(pathname).then((res) => {
      if (res.success) {
        window.location.href = res.data;
      }
    });
  }
};
