import { createRouter, createWebHashHistory } from "vue-router";
import home from "@/views/home.vue";
const routes = [
  // 首页
  {
    path: "/",
    redirect: "/home"
  },
  {
    path: "/home",
    name: "home",
    component: home
  },
  // 登录组件
  {
    path: "/login",
    name: "login",
    component: () => import("@/views/login")
  },
  // 教室组件
  {
    path: "/room",
    name: "room",
    component: () => import("@/views/room")
  },
  // 排行榜组件
  {
    path: "/ranklists",
    name: "rankLists",
    component: () => import("@/views/ranklists")
  },
  // 个人中心
  {
    path: "/user",
    name: "User",
    component: () => import("@/views/user"),
    children: [
      {
        path: "/userchange",
        name: "userchange",
        component: () => import("@/views/userChange")
      }
    ]
  }
];

const router = createRouter({
  history: createWebHashHistory(),
  routes
});

// // 定义路由导航守卫

// to代表我要去哪个路由 from代表我来自哪个路由
// next代表 下一步去哪里 如果next()代表方形 如果next('/login')是强制跳转至/login路由
router.beforeEach((to, from, next) => {
  // 获取存在window里的token值 用来判断
  let token = window.sessionStorage.getItem("stuId");
  // 判断如果准备去的路由的name不是Login登入页面 并且没有授权的时候 强制跳转至name为Login的路由页面
  if (to.name !== "login" && !token)
    next({
      name: "login"
    });
  // 如果满足通过条件(去往login页面之外的路由 并且授权过) 则放行
  else next();
});

export default router;
