<template>
  <transition>
    <div class="prompt">
      <div class="mask"></div>
      <!-- 正常弹窗 -->
      <div v-if="!isShowCreate" class="content">
        <div class="close" @click="close">x</div>
        <div class="seatInfo">
          <span>{{ seatIndex }}</span>
          <p>座位号</p>
        </div>
        <p class="title">请选择您的操作</p>
        <div class="btn-group">
          <div
            v-if="!room.isHas && room.title"
            class="addRoom"
            @click="addClick"
          >
            <img src="../assets/img/room/addRoom.png" alt="" />
            <p>加入自习</p>
          </div>
          <div v-else class="addRoom unclick">
            <img src="../assets/img/room/addRoom-grey.png" alt="" />
            <p>加入自习</p>
          </div>

          <div
            v-if="!room.title"
            class="createRoom"
            @click="isShowCreate = true"
          >
            <img src="../assets/img/room/creatdRoom.png" alt="" />
            <p>创建自习</p>
          </div>
          <div v-else class="createRoom unclick">
            <img src="../assets/img/room/creatdRoom-grey.png" alt="" />
            <p>创建自习</p>
          </div>

          <div
            v-if="!room.isCollect && room.title"
            @click="collectClick"
            class="saveRoom"
          >
            <img src="../assets/img/room/saveRoom.png" />
            <p>收藏自习</p>
          </div>
          <div v-else class="saveRoom unclick">
            <img src="../assets/img/room/saveRoom-grey.png" />
            <p>收藏自习</p>
          </div>
        </div>
      </div>
      <!-- 创建自习室弹窗 -->
      <div v-else class="content">
        <div class="close" @click="close">x</div>
        <form class="create">
          <div class="title">
            <img src="../assets/img/login/title.png" alt="" />
            <input class="title-input" v-model="title" type="text" required />
          </div>
          <textarea v-model="action" id="" cols="30" rows="10"></textarea>
          <!-- <div class="selectBar" @click="clickSelectBar"><div :class="isSelectBar?'selectIconOk selectIcon':'selectIcon' "></div>开启自习申请验证</div> -->
          <input class="btn-input" @click="createRoom" type="submit" />
        </form>
      </div>
    </div>
  </transition>
</template>
<script>
export default {
  props: {
    seatIndex: {
      type: Number
    },
    room: {
      type: Object
    }
  },
  data() {
    return {
      title: "",
      action: "",
      isShowCreate: false,
      isSelectBar: true
    };
  },
  methods: {
    close() {
      this.$emit("closeprompt");
    },
    // 创建自习室
    createRoom() {
      let self = this;
      if (!this.title) {
        return;
      }
      this.$http
        .get("/addAdmin", {
          params: {
            // stuId: 1411651103,
            moon: this.$route.query.moon,
            day: this.$route.query.day,
            seatIndex: this.seatIndex,
            roomId: this.room.roomInfo._id,
            title: this.title,
            action: this.action,
            isSelectBar: this.isSelectBar
          }
        })
        .then(res => {
          // alert(res);
          if (!res.data.sucess) {
            self.$emit("closeprompt", res.data.msg);
            return;
          }
          let msg = "创建自习室成功";
          self.$emit("closeprompt", msg);
          // alert(res.data.roomId);
          self.$emit("getRoomDetail", res.data.roomId, false);
        });
    },
    // 收藏自习室
    collectClick() {
      let self = this;
      this.$http
        .get("/addStar", {
          params: {
            roomId: this.$route.query.roomId
          }
        })
        .then(res => {
          self.$emit("getRoomDetail", res.data.roomId, false);
          self.$emit("closeprompt", "收藏成功");
        });
    },
    // 加入自习室
    addClick() {
      let self = this;
      this.$http
        .get("/addRoom", {
          params: {
            roomId: this.$route.query.roomId,
            seatIndex: this.seatIndex
          }
        })
        .then(res => {
          self.$emit("closeprompt", res.data.msg);
        });
    },

    // 点击是否开启申请按钮
    clickSelectBar() {
      this.isSelectBar = !this.isSelectBar;
    }
  }
};
</script>
<style lang="scss" scoped>
@import "../assets/common.scss";
.prompt {
  .mask {
    position: absolute;
    top: 0;
    left: 0;
    z-index: 20;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.5);
  }
  .content {
    position: fixed;
    z-index: 21;
    top: 50%;
    left: 50%;
    margin-left: -200px;
    margin-top: -190px;
    width: 400px;
    height: 380px;
    text-align: center;
    background: #fff;
    border-radius: 8px;
    .close {
      position: absolute;
      right: 0;
      top: 0;
      width: 30px;
      height: 30px;
      margin: 10px;
      font-size: 30px;
      color: #fff;
      background: $light;
      border-radius: 50%;
      line-height: 30px;
      text-align: center;

      cursor: pointer;
    }
    .seatInfo {
      padding: 50px 0 30px 0;
      span {
        color: $blue;
        font-size: 70px;
        font-weight: 700;
      }
      p {
        color: $light;
        font-size: 18px;
        margin-top: -15px;
      }
    }
    .title {
      font-size: 20px;
      color: $light;
    }
    .btn-group {
      display: flex;
      justify-content: center;
      margin-top: 10px;
      .addRoom,
      .createRoom,
      .saveRoom {
        border: 3px solid $blue;
        border-radius: 10px;
        background: $blank;
        width: 100px;
        height: 100px;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        margin: 8px;
        cursor: pointer;
        &:hover {
          transform: translateY(-3px);
        }
        img {
          width: 60px;
          height: 60px;
        }
        p {
          color: $light;
        }
      }
      .unclick {
        &:hover {
          transform: translateY(0);
        }
        border: 3px solid $light;
      }
    }
    .create {
      width: 280px;
      margin: 0 auto;
      margin-top: 60px;
      .title {
        position: relative;
        img {
          width: 29px;
          height: 29px;
          vertical-align: middle;
          position: absolute;
          top: 6px;
          left: 8px;
        }
        .title-input {
          height: 40px;
          width: 100%;
          border: 2px solid $light;
          border-radius: 6px;
          padding-left: 38px;
          box-sizing: border-box;
          font-size: 18px;
          color: $font;
        }
      }
      textarea {
        width: 100%;
        height: 140px;
        border: 2px solid $light;
        border-radius: 6px;
        margin-top: 10px;
        box-sizing: border-box;
        font-size: 18px;
        color: $font;
        resize: none; //限制不能拖动文本框
        padding: 10px;
      }
      .selectBar {
        display: flex;
        align-items: center;
        font-size: 14px;
        color: $black;
        height: 16px;
        line-height: 15px;
        margin-top: 10px;
      }
      .selectIcon {
        width: 15px;
        height: 15px;
        border: 2px solid $blue;
        border-radius: 50%;
        margin-right: 10px;
        margin-left: 10px;
        box-sizing: border-box;
      }
      .selectIconOk {
        background: #94c7f6;
      }

      .btn-input {
        width: 100%;
        background: $blue;
        height: 40px;
        border: 0;
        border-radius: 6px;
        margin-top: 20px;
        color: #fff;
        cursor: pointer;
      }
    }
  }
}
</style>
