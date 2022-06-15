<template>
  <div>
    <!-- 头部导航 -->
    <!-- 个人中心页面 -->
    <div class="user">
      <!-- 个人中心左侧边栏 -->
      <div class="userLeft">
        <!-- 左侧边栏---上----展示个人信息 -->
        <div
          class="userInfo"
          :userdata="userData"
          @click="
            showUserChange = true;
            navNo = 1;
          "
        >
          <!-- 修改个人资料 图标-->
          <FormOutlined class="updateUserInfo" />
          <!--个人信息的头像 -->
          <div class="userPhoto">
            <img :src="userData.avatorUrl" alt />
          </div>
          <!-- 用户名称 -->
          <p class="userName">{{ userData.name }}</p>
          <!-- 用户学校 -->
          <p class="userSchool">
            <span>{{ userData.school }}</span
            >&thinsp; |&thinsp;
            <!-- 用户专业 -->
            <span>{{ userData.major }}</span>
          </p>
          <!-- 获得称号的图标 -->
          <div class="rankingIcon">
            <img :src="require('@/assets/img/award.png')" />
            <!-- 获得的称号 -->
            <div class="awardText">
              <span class="awards">{{ level }}</span>
            </div>
          </div>

          <!-- 段位排行榜 -->
          <!-- 点击段位排行榜 跳转到排行榜页面（ranklists） -->
          <div class="awardRank" @click="toRankList">
            <!-- 段位排行榜图标 -->
            <img src="@/assets/img/rank-icon.png" alt />
            <!-- 段位排行榜标题 -->
            <span class="awardTitle">段位排行榜</span>
          </div>
        </div>
        <!-- 导航框 -->

        <!-- 个人中心 -->
        <div class="userNav">
          <p @click="personal"><i v-if="navNo == 1"></i>个人中心</p>
          <!-- 对话/申请 -->

          <p @click="toChat"><i v-if="navNo == 2"></i>对话/申请</p>
          <!-- 退出账号 -->
          <p @click="showModal"><i v-if="navNo == 3"></i>退出账号</p>
        </div>
      </div>
      <!-- 个人中心右侧 -->
      <div class="userRight">
        <!-- 标签页 -->
        <!-- 如果控制没有修改资料 并且 在个人中心上 就展示该标签页 -->
        <a-tabs
          v-if="!showUserChange && navNo == 1"
          :defaultActiveKey="defaultActiveKey"
          v-model="activeKey"
        >
          <!-- 自习提醒 -->
          <a-tab-pane key="1" tab="自习提醒" name="first">
            <!-- 引入自习提醒组件 -->
            <classClock></classClock>
          </a-tab-pane>
          <!-- 已预约 -->
          <a-tab-pane key="2" tab="已预约" name="second">
            <!-- 引入已预约组件 -->
            <isSelectPage></isSelectPage>
          </a-tab-pane>
          <!-- 待审核 -->
          <a-tab-pane key="3" tab="待审核" name="third">
            <!-- 引入待审核组件 -->
            <isReview></isReview>
          </a-tab-pane>
          <!-- 收藏夹 -->
          <a-tab-pane key="4" tab="收藏夹" name="forth">
            <!-- 引入收藏夹组件 -->
            <isCollectPage></isCollectPage>
          </a-tab-pane>
        </a-tabs>

        <!-- 修改资料页 -->
        <!-- 当点击修改资料时为true 并且navNo为1 -->
        <a-tabs v-if="showUserChange && navNo == 1" v-model="userchangeIndex">
          <!-- 修改资料 -->
          <a-tab-pane tab="修改资料" name="first">
            <!-- 引入修改资料的组件 -->
            <userChange
              @returnBack="showUserChange = false"
              @getUsers="getUsers"
            ></userChange>
          </a-tab-pane>
        </a-tabs>
        <!-- 对话框 -->
        <!-- 引入对话列表信息组件 -->
        <remind
          v-if="navNo == 2 && !showChatInfo"
          :remindLists="userData.remind"
        ></remind>
        <!-- 引入对话详情信息组件 -->
        <chartInfo v-if="navNo == 2 && showChatInfo"></chartInfo>
        <!-- 弹框 -->
        <toast
          content="确定要退出登录吗？"
          v-if="showToast"
          @reset="showToast = false"
          @promise="loginOut"
        ></toast>
      </div>
    </div>
  </div>
</template>

<script>
// 引入组件
// 自习提醒
import classClock from "@/components/classClock";
// 已预约
import isSelectPage from "@/components/isSeleted";
// 待审核
import isReview from "@/components/isReview";
// 收藏夹
import isCollectPage from "@/components/isSave";
// 弹窗
import toast from "@/components/toast";
// 修改信息
import userChange from "@/views/userChange";
// 对话列表信息
import remind from "@/components/remind";
// 对话详情信息
import chartInfo from "@/components/chatInfo";

// 小图标
import { FormOutlined } from "@ant-design/icons-vue";
// 引入请求方法
import { httpGet, httpPost } from "@/utils/http";
// 引入请求路径
import { user, expand } from "@/api";
//引入判断段位水平
import { judgeLevel } from "@/lib/level";
export default {
  data() {
    return {
      //在哪个标签页上（自习提醒/已预约/待审核/收藏）
      activeName: "second",
      // 在哪个标签页（修改资料）
      userchangeIndex: "first",
      // 弹窗显示
      showToast: false,
      // 修改资料显示
      showUserChange: false,
      // 个人资料
      userData: {},
      // 在哪个导航（个人中心/对话申请/退出账号）
      navNo: 1,
      // 对话详情信息显示
      showChatInfo: false,
      // 段位排行榜等级称号
      level: "自习萌新",
      // 段位排行等级
      num: 0,
      // 默认值
      defaultActiveKey: "1",
      first: "first",
      activeKey: ""
    };
  },

  created() {
    // 获取个人资料
    this.getUsers();
    // 获取排行榜信息
    this.getRankList();

    //在哪个标签页上（自习提醒/已预约/待审核/收藏）
    this.activeName = this.$route.query.index;
    //在哪个导航（个人中心/对话申请/退出账号）
    this.navNo = this.$route.query.nav || 1;
    // 是否要切换到聊天室
    if (this.$route.query.chaterId) {
      this.showChatInfo = true;
    }
  },
  watch: {
    // 监听标签页
    "$route.query.index": function(val) {
      this.activeName = this.$route.query.index;
      if (val == this.activeName) {
        this.defaultActiveKey = "2";
      }
      if (val == this.first) {
        this.activeKey = "1";
      }
    },
    // 监听导航
    "$route.query.nav": function(val) {
      console.log(val);
      this.navNo = this.$route.query.nav || 1;
    },
    // 监听用户id
    "$route.query.chaterId": function(val) {
      this.showChatInfo = val ? true : false;
    }
  },
  methods: {
    //#region 通过学号获取个人资料
    // 将获取到的数据传给userData 并获取已预约数据的长度传给sum
    getUsers() {
      httpGet(user.getUserList, {
        stuId: this.$route.query.stuId
      })
        .then(res => {
          //  将获取到的数据传给userData
          this.userData = res.data.data;
          // 并获取已预约数据的长度传给sum
        })
        .catch(err => {
          console.log(err);
        });
    },
    //#endregion

    //#region 获取排行榜 得到自己的排行榜信息
    getRankList() {
      httpGet(expand.getRankingList).then(res => {
        let { data } = res;
        if (data.success) {
          this.num = data.data.rankLists.length;
          // 计算自习等级
          this.level = judgeLevel(this.num);
        }
        // this.userRank = res.data.selfRank;
      });
    },
    //#endregion

    //#region 点击左侧侧边栏的段位排行榜
    // 跳转到排行榜页面
    toRankList() {
      // 跳转到排行榜页面
      this.$router.push("/ranklists");
    },
    //#endregion

    //#region 点击左侧侧边栏的退出登录
    // showToast改为true 弹窗显示
    showModal() {
      // showToast改为true 弹窗显示
      this.showToast = true;
    },
    //#endregion

    //#region 点击个人中心按钮
    personal() {
      this.navNo = 1;
      // 对话列表信息
      this.$router.push({
        query: { index: "first", nav: 1 }
      });
    },
    //#endregion

    //#region 点击左侧侧边栏的对话/申请
    toChat() {
      // navNo改为2
      this.navNo = 2;
      // 对话列表信息
      this.$router.push({
        query: { index: "first", nav: 1 }
      });
      //#endregion
    },
    //#endregion

    //#region  退出登录
    loginOut() {
      //  发送请求
      httpPost(user.loginOut)
        .then(res => {
          console.log(res);
          // 返回到登录页面 将sessionStorage清空
          this.$router.replace("/login");
          window.sessionStorage.clear();
        })
        .catch(err => {
          console.log(err);
        });
    }
    //#endregion
  },
  components: {
    // 修改资料图标
    FormOutlined,
    // 自习提醒
    classClock,
    // 已预约
    isSelectPage,
    // 待审核
    isReview,
    // 收藏夹
    isCollectPage,
    // 弹窗
    toast,
    // 修改信息
    userChange,
    // 对话列表信息
    remind,
    // 对话详情信息
    chartInfo
  }
};
</script>

<style lang="scss" scoped>
@import "@/assets/common.scss";

// 引入组件
.user {
  overflow: hidden;
  margin: 0 auto;
  width: 1100px;
  .userLeft {
    margin: 10px;
    float: left;
    width: 250px;
    border-radius: 5px;
    .userInfo {
      position: relative;
      margin: 0 auto;
      padding: 5px 0;
      margin-bottom: 60px;
      width: 100%;
      border-radius: 5px;
      background: rgba($color: #eee, $alpha: 0.5);
      color: $light;
      .updateUserInfo {
        position: absolute;
        top: 10px;
        right: 8px;
        width: 20px;
        cursor: pointer;
        &:hover {
          transform: translateY(-2px);
        }
      }
      .userPhoto {
        overflow: hidden;
        margin: 20px auto;
        width: 100px;
        height: 100px;
        border-radius: 50%;
        img {
          width: 100px;
          height: 100px;
        }
      }
      .userName {
        text-align: center;
        font-size: 20px;
        font-weight: bold;
      }
      .userSchool {
        margin-top: 5px;
        font-size: 15px;
        text-align: center;
      }

      .rankingIcon {
        display: flex;
        margin: 15px auto;
        width: 180px;
        align-items: center;
        justify-content: center;

        img {
          width: 22px;
        }
        .awardText {
          span {
            display: block;
          }
          .awards {
            font-size: 18px;
            font-weight: bold;
            color: #ea9518;
          }
        }
      }
      .awardRank {
        display: flex;
        position: absolute;
        bottom: -55px;
        width: 100%;
        height: 50px;
        border-radius: 5px;
        background: rgba($color: #eee, $alpha: 0.8);
        align-items: center;
        justify-content: center;
        cursor: pointer;
        &:hover {
          opacity: 0.8;
        }
        img {
          width: 35px;
          height: 35px;
        }
        .awardTitle {
          margin-left: 8px;
          font-size: 18px;
          font-weight: bold;
          color: $orange;
        }
      }
    }
    .userNav {
      overflow: hidden;
      margin-top: 10px;
      border-radius: 5px;
      background: rgba($color: #eee, $alpha: 0.5);

      p {
        position: relative;
        margin: 0 auto;
        height: 50px;
        border-bottom: 1px solid $blank;
        line-height: 50px;
        text-align: center;
        color: $blue;
        cursor: pointer;
        &:last-child {
          border: 0;
        }
        &:hover {
          background: $blue;
          color: #fff;
        }

        i {
          display: block;
          position: absolute;
          top: 7px;
          left: 0;
          width: 5px;
          height: 36px;
          background: $blue;
        }
      }
    }
    .isnav {
      color: red;
    }
  }
  .userRight {
    float: right;
    margin: 10px;
    width: 810px;
    border-radius: 5px;
    background: rgba($color: #eee, $alpha: 0.5);
    .ant-tabs-bar {
      border-bottom: 3px solid rgba(228, 231, 237, 1);
      .ant-tabs-ink-bar {
        bottom: 0px;
        height: 3px;
      }
    }
  }
}
:global(.ant-tabs-nav .ant-tabs-tab-active) {
  color: #89c867;
}
:global(.ant-tabs-nav .ant-tabs-tab:hover) {
  color: #89c867;
}
:global(.ant-tabs-ink-bar) {
  background-color: #89c867;
}
</style>
