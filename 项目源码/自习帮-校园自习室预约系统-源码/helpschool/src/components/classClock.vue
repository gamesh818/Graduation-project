<template>
  <!-- 自习提醒 -->
  <div class="classClock">
    <!-- 自习背景图 -->
    <div class="classImg">
      <img v-if="todayData" :src="require('@/assets/img/pic/clock-yes.png')" />
      <img v-else :src="require('@/assets/img/pic/clock-no.png')" />
    </div>
    <!-- 自习提示语 -->
    <div class="classTips">
      <!-- 提示语标题 -->
      <p class="classTitle">
        <!-- 当今天没有预约的自习提示的内容 -->
        <span class="notHaveClass" v-if="!todayData">
          <!-- 提示语 -->
          <span class="classHint">啊哦,</span>
          <span>今天没有已经预约的自习信息哦！</span>
          <!-- 返回到首页 -->
          <a @click="toHoom">前往大厅</a>
        </span>
        <!-- 当今天有预约的自习提示的内容 -->
        <span class="haveClass" v-else>
          <!-- 提示语 -->
          <span class="classHint">童鞋，今天有自习安排呦</span>
          <!-- 预约教室位置 -->
          <span>{{ roomFormate }}</span>
          <!-- 跳转到已预约的教室页面 -->
          <a @click="toDetail">查看详情</a>
        </span>
      </p>
    </div>
  </div>
</template>

<script>
// 引入请求方法
import { httpGet } from "@/utils/http";
// 引入请求路径
import { user } from "@/api";
export default {
  data() {
    return {
      // 今日预约自习信息
      todayData: ""
    };
  },
  created() {
    // 获取今日预约自习信息
    this.getTodayData();
    setInterval(() => {
      this.getTodayData();
    }, 10000);
  },
  computed: {
    //#region 计算返回教室位置
    roomFormate() {
      // 获取今日预约的关于教室的数据
      let roomInfo = this.todayData;
      // 如果教室号不大于9 就在前面加个0   如果大于就不用加
      let number =
        roomInfo.hasRoomInfo.roomInfo.number > 9
          ? roomInfo.hasRoomInfo.roomInfo.number
          : "0" + roomInfo.hasRoomInfo.roomInfo.number;
      // 座位号
      let seatIndex = roomInfo.seatIndex;
      // 返回教室位置
      return `${roomInfo.hasRoomInfo.roomInfo.build}
      /${roomInfo.hasRoomInfo.roomInfo.floor}${number}/座位${seatIndex}号/${roomInfo.hasRoomInfo.title}`;
    }
    //#endregion
  },
  methods: {
    //#region
    // 获取今天已经预约的自习情况
    getTodayData() {
      httpGet(user.getTodayList)
        .then(res => {
          // 如果data不为空 就把今日预约拿到的数据传给todayData
          if (res.data.length) {
            // 只能有一间已预约教室 所以[0]
            this.todayData = res.data[0];
          }
        })
        .catch(err => {
          console.log(err);
        });
    },
    //#endregion
    //#region 前往大厅 返回首页
    toHoom() {
      this.$router.push("/home");
    },
    //#endregion
    //#region 查看详情
    toDetail(room) {
      console.log(room);
      // 跳转到预约的教室页面
      this.$router.push({
        path: "/room",
        query: {
          stuId: room.view.sessionStorage.stuId,
          roomId: this.todayData.hasRoomInfo._id,
          empty: false
        }
      });
    }
    //#endregion
  }
};
</script>

<style lang="scss" scoped>
@import "@/assets/common.scss";
.classClock {
  margin: 0 auto;
  padding: 10px;
  width: 650px;

  .classImg {
    width: 100%;
    img {
      display: block;
      margin: 0 auto;
      margin-top: -30px;
      width: 250px;
    }
  }

  .classTitle {
    .notHaveClass {
      margin-top: -20px;
      text-align: center;
      color: $light;
      font-weight: 600;
      .classHint {
        color: $orange;
      }
      display: block;
      font-size: 20px;
      a {
        margin-top: 15px;
      }
    }
    .haveClass {
      display: block;
      margin-top: -20px;
      text-align: center;
      font-size: 20px;
      color: $light;

      span {
        display: block;
        margin-bottom: 20px;
        font-weight: 600;
      }
      .classHint {
        display: block;
        margin-top: 5px;
        margin-bottom: 5px;
        font-size: 26px;
        color: #ea9518;
      }
    }
    a {
      display: block;
      margin: 20px auto;
      margin: 20px auto;
      margin-top: 6px;
      width: 110px;
      height: 40px;
      border-radius: 5px;
      line-height: 40px;
      background: $blue;
      color: #fff;
      text-align: center;
      cursor: pointer;
      font-size: 15px;
      &:hover {
        opacity: 0.8;
      }
    }
  }
}
</style>
