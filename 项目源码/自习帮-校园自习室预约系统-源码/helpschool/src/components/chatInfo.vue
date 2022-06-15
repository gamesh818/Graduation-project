<template>
  <!-- 聊天信息 -->
  <div class="chatInfo">
    <!--聊天信息框左侧 -->
    <div class="chatLeft">
      <!-- 与谁对话 -->
      <div class="chatWith">
        <!-- 返回 -->
        <div class="returnBtn" @click="backChatLists"></div>
        <p>{{ chatInfo.name }}与你的对话</p>
      </div>
      <div class="chatMessage" id="chatMessage">
        <div>
          <!-- 聊天内容的记录 -->
          <div v-for="item in chatLists" :key="item.date" class="chatHistory">
            <div class="chater" v-if="item.stuId == chatInfo.stuId">
              <img :src="chatInfo.avatorUrl" />
              <div class="massage">{{ item.content }}</div>
            </div>
            <div class="owner" v-else>
              <div class="massage">{{ item.content }}</div>
              <img :src="createrInfo.avatorUrl" />
            </div>
          </div>
        </div>
      </div>
      <!-- 聊天输入框 -->
      <div class="inputBox">
        <input type="text" v-model="sendInfoNow" @keydown.enter="sendInfo" />
        <!-- 发送按钮 -->
        <div class="send" @click="sendInfo">发送</div>
      </div>
    </div>
    <!-- 聊天信息框右侧 -->
    <div class="chatRight">
      <div class="chatTitle">对话列表</div>
      <div style="overflow-y: scroll; height: 500px">
        <!-- 对话者的基本信息 -->
        <div
          :class="{
            chatItem: true,
            chatItemBlue: chatInfo.stuId == item.chater.stuId,
          }"
          v-for="item in chatMemberLists"
          :key="item.stuId"
          @click="changeChatInfo(item.chater)"
        >
          <div class="chatItemTop">
            <img :src="item.chater.avatorUrl" alt="" />
            <div class="chaterInfo">
              <span class="chatName">{{ item.chater.name }}</span>
              <span class="school"
                >{{ item.chater.school }} | {{ item.chater.major }}</span
              >
            </div>
          </div>
          <!-- 最后一条的聊天信息 -->
          <p class="lastInfo">
            {{ (item.lastlist && item.lastlist.content) || "" }}
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
// 实时通信开源框架
import io from "socket.io-client";
// let serverPath = `${location.protocol}//${location.host}:4001`;
const socket = io(`${location.protocol}//${window.location.hostname}:4001`);
// console.log(serverPath);
// 通信地址
// const socket = io("http://localhost:4001");
// 引入http
import { httpGet } from "@/utils/http";
//引入接口
import { chat } from "@/api";
import { message } from "ant-design-vue";

export default {
  data() {
    return {
      chatInfo: {}, //聊天者信息
      createrInfo: {}, //发送者信息
      chatLists: [], //聊天记录
      sendInfoNow: "", //立即的发送信息
      chatMemberLists: [], //聊天成员列表
      chaterId: "141651122",
      userId: "", //本人id
      switchId: "", //被切换者的id
      bottom: true, //自动刷新时不会滚到底部
    };
  },
  mounted() {
    // 存储当前用户id
    this.switchId = this.$route.query.chaterId;
    // 获取详细信息
    setTimeout(() => {
      this.getChatInfo(Number(this.switchId));
    }, 0);
    setTimeout(() => {
      this.oneSendInfo();
    }, 1000);

    //使消息保持同步
    setInterval(() => {
      if (this.$route.query.nav == 2) {
        setTimeout(() => {
          this.getChatInfo(Number(this.switchId));
          //  防止刷新变得越来越快服务器受不了
          this.bottom = false;
          clearInterval;
        }, 10);
      } else {
        clearInterval;
      }
    }, 1000);
    // 获取聊天用户列表
    this.getChatMemberLists();
    // 一打开页面就滚到消息的底部
    this.scrollToBottom();
  },
  methods: {
    //#region   切换用户信息
    changeChatInfo(stu) {
      // 存储被切换者的id
      this.switchId = stu.stuId;
      this.getChatInfo(stu.stuId);
      setInterval(() => {
        this.getChatInfo(this.switchId);
      }, 3000);
    },
    //#endregion

    // 获取用户信息
    getChatMemberLists() {
      httpGet(chat.getChatList).then((res) => {
        this.chatMemberLists = res.data;
      });
    },
    //#region  获取聊天详细信息
    getChatInfo(stuId) {
      let params = { chaterId: stuId };
      // 获取聊天记录
      httpGet(chat.getChatInfo, params).then((res) => {
        //聊天者信息
        // console.log(res.data.chatInfoLists.chatLists);
        this.chatInfo = res.data.cheaterInfo;
        //发送者信息
        this.createrInfo = res.data.createrInfo;
        //聊天记录
        this.chatLists = res.data.chatInfoLists.chatLists || [];
        //发送者的账号
        this.userId = res.data.createrInfo.stuId;
        socket.on(this.userId, function (data) {
          data.stuId = data.sendId;
          this.chatLists.push(data);
          //第一次打开页面时回滚到底部，之后都不会
          if (this.bottom) {
            console.log(1);
            this.scrollToBottom();
          }
        });
        // 同上
        if (this.bottom) {
          setTimeout(() => {
            this.scrollToBottom();
          }, 0);
        }
      });
    },
    //#endregion

    //#region 如果第一次聊天 发送默认消息
    oneSendInfo() {
      console.log(this.chatLists[0]);
      console.log(this.chatLists);
      if (!this.chatLists[0]) {
        console.log("进来了111");
        socket.emit("chatInfo", {
          sendId: this.userId.toString(), //发送者id
          saveId: this.chatInfo.stuId.toString(), //接受者id
          content: "开始聊天呀", //刚刚发送的信息
          date: new Date().getTime(), //发送时的时间
        });
        return;
      }
    },
    //#endregion

    //#region  发送
    sendInfo() {
      let self = this;
      if (
        this.sendInfoNow == "" ||
        this.chatInfo.stuId == "" ||
        this.userId == ""
      ) {
        return message.info("消息为空");
      }
      socket.emit("chatInfo", {
        sendId: this.userId.toString(), //发送者id
        saveId: this.chatInfo.stuId.toString(), //接受者id
        content: this.sendInfoNow, //刚刚发送的信息
        date: new Date().getTime(), //发送时的时间
      });

      this.chatLists.push({
        content: self.sendInfoNow, //刚刚发送的信息
        stuId: this.userId, //发送者id
        date: new Date().getTime(), //发送时的时间
      });

      

      this.sendInfoNow = ""; // 清空输入框
      setTimeout(() => {
        this.scrollToBottom();
        self.getChatMemberLists();
      }, 0);
    },
    //#endregion

    //#region  消息一直保持滚到最底部
    scrollToBottom() {
      this.$nextTick(() => {
        let scrollDom = document.getElementById("chatMessage");
        // let height = scrollDom.getBoundingClientRect().height;
        scrollDom.scrollTop = scrollDom.scrollHeight;
      });
    },
    //#endregion

    //#region  返回上一个页面
    backChatLists() {
      this.$router.push({ path: "/user", query: { index: "first", nav: 2 } });
    },
    //#endregion
  },
};
</script>

<style lang="scss" scoped>
@import "@/assets/common.scss";
.chatInfo {
  display: flex;
  width: 100%;
  height: 550px;
  .chatLeft {
    flex: 0 1 70%;
    border-right: 2px solid #fff;
    .chatWith {
      position: relative;
      overflow: hidden;
      width: 100%;
      height: 50px;
      line-height: 50px;
      text-align: center;
      color: #ffffff;
      border-bottom: 2px solid #fff;
      background: $blue;
      border-radius: 5px 0 0 0;
      .returnBtn {
        position: absolute;
        left: 0;
        width: 50px;
        height: 100%;
        text-align: center;
        background: #fff;
        cursor: pointer;
        &::after {
          display: block;
          color: #fff;
          font-weight: 700;
          font-size: 23px;
          background: rgba($color: $blue, $alpha: 0.7);
          content: "<";
        }
      }
    }
    .chatMessage {
      width: 100%;
      height: 440px;
      overflow-y: scroll;
      border-bottom: 2px solid #fff;
      img {
        width: 80px;
        height: 80px;
        padding: 15px;
      }
      .chatHistory {
        font-size: 13px;
        .chater {
          display: flex;
          justify-content: flex-start;
          align-items: flex-start;
          // margin: 10px;
          .massage {
            position: relative;
            max-width: 200px;
            margin: 15px 0;
            background: #fff;
            border-radius: 5px;
            padding: 15px;
            color: $light;
            &::after {
              position: absolute;
              left: -10px;
              top: 18px;
              content: "";
              border-right: 10px solid #fff;
              border-top: 6px solid transparent;
              border-bottom: 6px solid transparent;
            }
          }
        }
        .owner {
          display: flex;
          justify-content: flex-end;
          align-items: flex-start;
          // margin: 10px;
          .massage {
            position: relative;
            max-width: 200px;
            padding: 15px;
            margin: 15px 0;
            color: #ffffff;
            border-radius: 5px;
            background: $blue;
            &::after {
              position: absolute;
              right: -10px;
              top: 18px;
              content: "";
              border-left: 10px solid $blue;
              border-top: 6px solid transparent;
              border-bottom: 6px solid transparent;
            }
          }
        }
      }
    }
    .inputBox {
      display: flex;
      align-items: center;
      justify-content: space-around;
      height: 54px;
      input {
        flex: 0 1 80%;
        height: 40px;
        padding-left: 10px;
        font-size: 20px;
        border: 0;
        border-radius: 5px;
        background: #fff;
      }
      .send {
        flex: 0 1 15%;
        height: 40px;
        line-height: 40px;
        text-align: center;
        color: #fff;
        border-radius: 5px;
        background: $blue;
        cursor: pointer;
      }
    }
  }
  .chatRight {
    color: $light;
    flex: 0 1 30%;
    .chatTitle {
      width: 100%;
      box-sizing: border-box;
      text-align: center;
      line-height: 50px;
      color: #fff;
      background: $blue;
      border-radius: 0 5px 0 0;
      border-bottom: 2px solid #fff;
    }
    .chatItem {
      position: relative;
      height: 100px;
      width: 100%;
      border-bottom: 1px solid #fff;
      &:hover {
        &::after {
          content: "";
          position: absolute;
          right: 0;
          top: 10%;
          width: 10px;
          height: 80%;
          background: $blue;
        }
      }

      cursor: pointer;
      .chatItemTop {
        display: flex;
        img {
          width: 80px;
          height: 80px;
          padding: 15px;
        }
        .chaterInfo {
          margin-top: 10px;
          .chatName {
            display: block;
            font-size: 18px;
            font-weight: 600;
            color: $black;
          }
          .school {
            font-size: 13px;
          }
        }
      }
      .lastInfo {
        overflow: hidden; /*超出部分隐藏*/
        width: 160px;
        padding: 0 20px;
        margin: 0 20px;
        font-size: 14px;
        color: #bbb;
        white-space: nowrap; /*不换行*/
        text-overflow: ellipsis; /*超出部分省略号显示*/
        border-radius: 10px;
        background: #eee;
      }
    }
    .chatItemBlue {
      position: relative;
      &::after {
        content: "";
        position: absolute;
        right: 0;
        top: 10%;
        width: 10px;
        height: 80%;
        background: $blue;
      }
    }
  }
}
</style>
