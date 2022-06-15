<template>
  <!-- 聊天与申请 -->
  <div class="application" v-if="tableData">
    <div class="applyList" v-for="item in tableData" :key="item._id">
      <!--申请请求-->
      <div v-if="item.date && item.roomRecord.moon" class="apply noSee">
        <div class="userPhoto">
          <img :src="item.stuInfo.avatorUrl" alt />
        </div>
        <div class="listLeft">
          <div class="listLeftUp">
            <span>{{ item.stuInfo.name }}</span> /
            <span>{{ item.stuInfo.school }}</span> /
            <span>{{ item.stuInfo.major }}</span>
          </div>
          <div class="listLeftDown">
            <span>申请加入：</span>
            <span class="listDate"
              >{{ item.roomRecord.moon }}月{{ item.roomRecord.day }}日，在</span
            >
            <span class="listBuild">
              {{ item.roomRecord.roomInfo.build }}
              {{ roomNumber(item.roomRecord.roomInfo) }}
              的自习。
            </span>
          </div>
          <div class="listLeftAction">
            <span class="listTitle">标题为：{{ item.roomRecord.title }}</span>
            <br />
            <span>简介：{{ item.roomRecord.action }}</span>
          </div>
        </div>
        <!-- 提示语 -->
        <i v-if="item.out" class="rejected">该申请已过期</i>
        <div class="listRight">
          <a @click="agree(item)">同意</a>
          <a class="del" @click="disagree(item)">拒绝</a>
        </div>
      </div>
      <!--聊天框-->
      <div v-else-if="item.lastlist" :class="{ chat: true, noSee: item.noSee }">
        <div class="userPhoto">
          <img :src="item.chater.avatorUrl" alt />
        </div>
        <div class="listLeft">
          <div class="listLeftUp">
            <span>{{ item.chater.name }}</span> /
            <span>{{ item.chater.school }}</span> /
            <span>{{ item.chater.major }}</span>
          </div>
          <div class="listLeftDown">
            <span>给您发来了新消息</span>
          </div>
          <div class="listLeftAction">
            <span>{{ item.lastlist.content }}</span>
          </div>
        </div>
        <div class="listRight">
          <a @click="chatTo(item)">回复</a>
        </div>
      </div>
    </div>
    <blankImg
      v-if="!tableData.length"
      content="啊哦，您还没有待处理的信息"
    ></blankImg>
  </div>
</template>

<script>
// 引入http方法
import { httpGet } from "@/utils/http";
// 引入api
import { chat, apply } from "@/api";
// 引入blankImg 组件
import blankImg from "@/components/blankImg";
// 引入全局提示消息框
import { message } from "ant-design-vue";
export default {
  data() {
    return {
      tableData: [],
      // 计时器
      timer: null
    };
  },
  computed: {
    // 计算房间号
    roomNumber() {
      return function(room) {
        if (room.number < 10) {
          return room.floor + "0" + room.number;
        } else {
          return room.floor + "" + room.number;
        }
      };
    }
  },
  components: {
    blankImg
  },
  mounted() {
    this.getRemindLists();
    this.timer = setInterval(() => {
      this.getRemindLists();
    }, 4000);
  },

  methods: {
    //#region 聊天列表
    getRemindLists() {
      let now = new Date();
      let month = now.getMonth() + 1; //得到月份
      let date = now.getDate(); //得到日期
      // 发起请求
      httpGet(chat.getRemindLists).then(res => {
        // console.log(res);
        // 筛选出没被拒绝的申请 和 聊天信息
        this.tableData = res.data.filter(item => {
          return !item.reject || item.lastlist;
        });
        // 给日期不是今天的申请信息 添加过期标识
        this.tableData.forEach(item => {
          if (item.roomRecord) {
            item["out"] = !(
              item.roomRecord.moon === month && item.roomRecord.day === date
            );
          }
        });
      });
    },
    //#endregion

    //#region 回复
    chatTo(item) {
      // console.log(item);
      this.$router.push({
        path: "/user",
        query: { index: "first", nav: 2, chaterId: item.chater.stuId }
      });
    },
    // res.data.forEach(item => {
    //   // 循环前清空
    //   // this.tableData = [];
    //   console.log(item);
    //   if (item.type === "chat") {
    //     this.tableData.push(item);
    //   } else if (item.type === "remind") {
    //     if (
    //         item.roomRecord.moon === month &&
    //         item.roomRecord.day === date
    //     ) {
    //       this.tableData.push(item);
    //     }
    //   }
    //   // 如果是今天的信息 则加入tableData中
    //   console.log(this.tableData);
    // });
    //#endregion

    //#region  同意
    agree(room) {
      let params = {
        roomId: room.roomRecord._id,
        addId: room.stuInfo._id,
        seatIndex: room.seatIndex,
        reviewId: room._id
      };
      httpGet(apply.getAgree, params).then(() => {
        message.success("已同意加入自习室申请");
        this.getRemindLists();
      });
    },
    //#endregion

    //#region  拒绝
    disagree(room) {
      let params = {
        reviewId: room._id
      };
      httpGet(apply.getDisagree, params).then(res => {
        let { data } = res;
        if (data.success) {
          message.success(data.msg);
        } else {
          message.error(data.msg);
        }
        this.getRemindLists();
      });
    }
    //#endregion
  },
  beforeUnmount() {
    clearInterval(this.timer);
  }
};
</script>
<style lang="scss" scoped>
@import "@/assets/common.scss";
.application {
  width: 100%;
  min-height: 450px;
  padding: 10px;
  box-sizing: border-box;
  .applyList {
    overflow: hidden;
    width: 100%;
    height: 120px;
    margin: 10px 0;
    border: 1px solid $blank;
    border-radius: 5px;
    background: #fff;
    cursor: pointer;
    .apply,
    .chat {
      display: flex;
      height: 100%;
      align-items: center;
    }
    // 未看的样式
    .noSee {
      position: relative;
      &::after {
        content: "";
        position: absolute;
        left: 10px;
        top: 10px;
        width: 10px;
        height: 10px;
        background: $red;
        border-radius: 50%;
      }
    }
    &:hover {
      border: 1px solid $blue;
    }
    .userPhoto {
      height: 80px;
      width: 80px;
      margin: 0 20px;
      img {
        width: 80px;
        height: 80px;
        border-radius: 50%;
      }
    }
    .listLeft {
      display: flex;
      flex: 0 1 70%;
      height: 100%;
      flex-direction: column;
      justify-content: center;
      .listLeftUp {
        font-size: 16px;
        color: $blue;
        span {
          display: inline-block;
          font-weight: 600;
        }
      }
      .listLeftDown {
        height: 25px;
        width: 100%;
        margin: 2px 0;
        font-size: 16px;
        color: $black;
      }
      .listLeftAction {
        height: 34px;
        font-size: 12px;
        color: $light;
      }
    }
    .listRight {
      display: flex;
      height: 120px;
      flex-direction: column;
      justify-content: center;
      a {
        display: block;
        width: 80px;
        height: 35px;
        margin: 5px;
        line-height: 35px;
        font-size: 15px;
        text-align: center;
        color: #fff;
        background: $blue;
        border-radius: 5px;
        cursor: pointer;

        &:hover {
          opacity: 0.8;
        }
      }
      .del {
        background: $red;
        // width: 60px;
      }
    }
  }
  .rejected {
    position: absolute;
    left: 70%;
    top: 51px;
    color: red;
    font-size: 14px;
  }
}
</style>
