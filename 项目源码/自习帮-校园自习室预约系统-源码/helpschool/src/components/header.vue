<template>
  <!-- 标题导航 -->
  <header v-if="$route.path != '/login' && $route.path != '/userinfo'">
    <!-- logo图片 -->
    <img
      :src="require('../assets/img/logo.png')"
      class="logo"
      @click="navClick('/')"
    />
    <!-- 按钮组 -->
    <div class="btnJroup">
      <!-- 提示按钮 -->
      <div
        class="btnIcon"
        @mouseover="isWhich = 0"
        @mouseout="isWhich = -1"
        @click="navClick('/user', 'first', 2)"
      >
        <a-badge :count="newsNum" :showZero="true">
          <img
            :src="require('../assets/img/icon-remind.png')"
            alt="消息通知"
            v-if="isWhich != 0"
          />
          <img
            :src="require('../assets/img/icon-remind-on.png')"
            alt="消息通知"
            v-if="isWhich == 0"
          />
        </a-badge>
      </div>
      <!-- 预约按钮 -->
      <div
        class="btnIcon"
        @mouseover="isWhich = 1"
        @mouseout="isWhich = -1"
        @click="navClick('/user', 'second')"
      >
        <img
          :src="require('../assets/img/icon-has.png')"
          alt="已添加的自习"
          v-if="isWhich != 1"
        />
        <img
          :src="require('../assets/img/icon-has-on.png')"
          alt="已添加的自习"
          v-if="isWhich == 1"
        />
      </div>
      <!-- 个人中心按钮 -->
      <div
        class="btnIcon"
        @mouseover="isWhich = 2"
        @mouseout="isWhich = -1"
        @click="navClick('/user', 'first')"
      >
        <img
          :src="require('../assets/img/icon-user-on.png')"
          alt="已添加的自习"
          v-if="isWhich == 2"
        />
        <img
          :src="require('../assets/img/icon-user.png')"
          alt="个人中心"
          v-if="isWhich !== 2"
        />
      </div>
    </div>
  </header>
</template>

<script>
//#region 引入
// 引入http方法
import { httpGet } from "@/utils/http";
// 引入接口
import { user } from "../api";
//#endregion

export default {
  data() {
    return {
      // 按钮状态
      isWhich: -1,
      // 消息提醒数量
      newsNum: 0,
      // 计时器
      timer: null
    };
  },
  mounted() {
    clearInterval(this.timer);
    this.timer = null;
  },
  watch: {
    //#region 监听路由
    $route: function() {
      // 如果路由变化 路由不是login的时候
      if (this.$route.path != "/login") {
        // 获取消息提醒数量
        this.timer = setInterval(() => {
          this.getRemind();
        }, 4000);
      }
    }
    //#endregion
  },
  methods: {
    //#region 点击对应按钮 跳转路由
    navClick(path, index, nav) {
      // 前往对应路由 并传index状态和 nav状态
      this.$router.push({
        path: path,
        query: { index: index, nav: nav || 1 }
      });
      // this.newsNum = 0;
    },
    //#endregion

    //#region 获取消息提醒数量
    getRemind() {
      // 发起请求
      httpGet(user.getRemind)
        .then(res => {
          let { data } = res;
          // 储存消息提醒数量
          this.newsNum = data;
        })
        .catch(err => {
          console.log(err);
        });
    }
    //#endregion
  },
  beforeUnmount() {
    clearInterval(this.timer);
    this.timer = null;
  }
};
</script>

<style lang="scss">
@import "../assets/common.scss";
header {
  position: fixed;
  top: 0;
  z-index: 10;
  width: 100%;
  height: 48px;
  background: $blue;
  overflow: hidden;
  // logo
  .logo {
    width: auto;
    height: 34px;
    margin-top: 7px;
    margin-left: 30px;
    cursor: pointer;
  }
  // 按钮入口
  .btnJroup {
    float: right;
    height: 48px;
    width: 200px;
    line-height: 18px;
  }
  // 按钮盒子
  .btnIcon {
    float: left;
    width: 60px;
    height: 48px;
    text-align: center;
    cursor: pointer;
    img {
      width: 20px;
      height: 20px;
      margin: 14px 0;
    }
    &:first-child {
      float: left;
      width: 60px;
      height: 100%;
      img {
        width: 30px;
        height: 30px;
        margin: 9px 0;
        cursor: pointer;
      }
    }
    &:hover {
      background: #fff;
    }
  }
  // ant design样式
  .ant-badge-count {
    top: 15px !important;
    right: 5px !important;
    padding: 0 4px !important;
    width: 15px;
    min-width: 15px !important;
    height: 15px !important;
    line-height: 15px !important;
  }
  .ant-btn-primary {
    top: 4px;
    font-weight: 800;
  }
}
</style>
