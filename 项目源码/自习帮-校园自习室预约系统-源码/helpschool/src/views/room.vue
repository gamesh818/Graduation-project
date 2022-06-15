<template>
  <div>
    <!-- 内容区域 start-->
    <div class="room">
      <!-- 教室号 -->
      <div class="roomId">
        {{ room.roomInfo.build }}
        {{ room.roomInfo.floor }}{{ calculation(room.roomInfo.number) }}
      </div>
      <!-- 教室信息 -->
      <div class="roomInfo" @click="chatToCreater">
        <!-- 管理员信息 -->
        <div class="userInfo" style="display: inline-block">
          <img src="../assets/img/login/user.png" alt />
          <!--          // 3.14 -->
          <span>{{
            room.roomAudit
              ? room.createName
                ? room.createName
                : "暂无"
              : "无审核管理员"
          }}</span>
        </div>
        <!-- 时间信息 -->
        <img src="../assets/img/login/name.png" alt />
        <!-- 如果设置过标题 代表创建过自习室 则使用收到的数据日期 -->
        <span v-if="room.title">{{ room.moon }}月{{ room.day }}日</span>
        <!-- 如果没有标题 则代表没有创建过自习室 则使用今天的日期 -->
        <span v-else>{{ $route.query.moon }}月{{ $route.query.day }}日</span>
        <img src="../assets/img/login/title.png" alt />
        <!-- 教室标题 -->
        <span>{{ room.title || "暂无" }}</span>
      </div>
      <!-- 教室详细内容 -->
      <p class="action" v-if="room.action">{{ room.action }}</p>
    </div>
    <!-- 内容区域 end-->

    <!-- 座位 start-->
    <div class="seats">
      <!-- 讲台 -->
      <div class="rostrum">
        因为疫情影响，请同学们请隔开就坐学习，请勿窜座，谢谢配合。
      </div>
      <!-- 座位盒子外边框 -->
      <div class="classSeats">
        <!-- 每个小座位 room.roomInfo.allSeats-->
        <!-- 创建后的版本 -->
        <div v-if="seatLists.length != 0">
          <div
            :class="{
              ownSeat: mySeat == item.seat
            }"
            class="oneSeats"
            v-for="(item, index) in seatLists"
            :key="item.seat"
          >
            <img
              v-if="room.title && item.seat == index + 1 && item.sex == '男'"
              @mouseout="isTouch = -1"
              :src="require('../assets/img/login/seat-on-man.png')"
              @click="seatClick(index + 1), chatToClassMate(item)"
            />
            <img
              v-else-if="
                room.title && item.seat == index + 1 && item.sex == '女'
              "
              @mouseout="isTouch = -1"
              :src="require('../assets/img/login/seat-on-girl.png')"
              @click="seatClick(index + 1), chatToClassMate(item)"
            />
            <img
              v-else-if="
                (room.title &&
                  item.seat == index + 1 &&
                  item.sex !== '女' &&
                  item.sex !== '男') ||
                  isTouch == item
              "
              @mouseout="isTouch = -1"
              :src="require('../assets/img/login/seat-on-man.png')"
              @click="seatClick(index + 1), chatToClassMate(item)"
            />
            <img
              v-else
              :src="require('../assets/img/login/seat-off.png')"
              @mouseover="isTouch = item"
              @mouseout="isTouch = -1"
              @click="seatClick(index + 1), chatToClassMate(item)"
            />
          </div>
        </div>
        <div v-else>
          <div
            :class="{ ownSeat: room.ownSeat == item || selectSeat == item }"
            class="oneSeats"
            v-for="item in room.roomInfo.allSeats"
            :key="item"
          >
            <!-- 已经选择过的座位 -->
            <img
              v-if="room.title && seatLists.indexOf(String(item)) !== -1"
              @mouseout="isTouch = -1"
              @click="seatClick(item)"
              :src="require('../assets/img/login/seat-on.png')"
            />
            <!-- 没有选择触碰时候的座位 -->
            <img
              v-else-if="isTouch == item"
              @mouseout="isTouch = -1"
              @click="seatClick(item)"
              :src="require('../assets/img/login/seat-on.png')"
            />
            <!-- 无触发的座位 -->
            <img
              v-else
              :src="require('../assets/img/login/seat-off.png')"
              @mouseover="isTouch = item"
              @mouseout="isTouch = -1"
            />
          </div>
        </div>
      </div>
      <!-- 提示座位类型 -->
      <div class="types">
        <img :src="require('@/assets/img/login/seat-on-man.png')" alt />
        <span>男生座位</span>
        <img :src="require('@/assets/img/login/seat-on-girl.png')" alt />
        <span>女生座位</span>
        <img :src="require('@/assets/img/login/seat-off.png')" alt />
        <span>可选座位</span>
        <div class="ownSeat"></div>
        <span>您的座位</span>
      </div>
    </div>
    <!-- 座位 end-->

    <!-- 弹窗 start-->
    <div class="popUp" v-if="isSelectBar">
      <!-- 遮罩层 -->
      <div class="mask"></div>
      <!-- 聊天导航框 -->
      <div class="toChatBox" v-if="toChatBox">
        <img src="../assets/img/pop.jpg" alt />
        <h2>当前座位同学：</h2>

        <!-- 头像 -->
        <div class="headPortrait">
          <img :src="classMateData.avatorUrl" alt />
        </div>
        <!-- 资料列表 -->
        <div class="dataBox">
          <div class="dataItem">
            <span class="classMateTitle">姓名：</span>
            <span class="classMateContent">{{ classMateData.name }}</span>
          </div>
          <div class="dataItem">
            <span class="classMateTitle">性别：</span>
            <span class="classMateContent">{{ classMateData.sex }}</span>
          </div>
          <div class="dataItem">
            <span class="classMateTitle">专业：</span>
            <span class="classMateContent">{{ classMateData.major }}</span>
          </div>
          <div class="dataItem">
            <span class="classMateTitle">学校：</span>
            <span class="classMateContent">{{ classMateData.school }}</span>
          </div>
        </div>

        <!-- 点击按钮 开启私聊 -->
        <button class="classMateToChat" @click="goChat()">开始聊天==></button>
      </div>
      <!-- 功能列表弹窗 -->
      <div v-if="!isShowCreate" class="popUpContent">
        <!-- 关闭按钮 -->
        <div class="close" @click="close">x</div>
        <!-- 座位号 -->
        <div class="seatInfo">
          <span>{{ selectSeat }}</span>
          <p>座位号</p>
        </div>
        <!-- 提示 -->
        <p class="tips">请选择您的操作</p>
        <!-- 按钮组 -->
        <div class="btnGroup">
          <!-- 添加按钮 -->
          <div
            v-if="!room.isHas && room.title"
            class="addRoom"
            @click="addClick"
          >
            <img src="../assets/img/room/addRoom.png" alt />
            <p>加入自习</p>
          </div>
          <!-- 未创建的自习室 不允许加入(按钮禁用) -->
          <div v-else class="addRoom unclick">
            <img src="../assets/img/room/addRoom-grey.png" alt />
            <p>加入自习</p>
          </div>
          <!-- 创建自习按钮 -->
          <div v-if="!room.title" class="createRoom" @click="btnIsShowCreate">
            <img src="../assets/img/room/creatdRoom.png" alt />
            <p>创建自习</p>
          </div>
          <!-- 已创建过的自习按钮(禁用状态) -->
          <div v-else class="createRoom unclick">
            <img src="../assets/img/room/creatdRoom-grey.png" alt />
            <p>创建自习</p>
          </div>
          <!-- 收藏按钮 -->
          <div
            v-if="!room.isCollect && room.title"
            @click="collectClick"
            class="saveRoom"
          >
            <img src="../assets/img/room/saveRoom.png" />
            <p>收藏自习</p>
          </div>
          <!-- 未创建过的自习室 不允许收藏 (按钮禁用) -->
          <div v-else class="saveRoom unclick">
            <img src="../assets/img/room/saveRoom-grey.png" />
            <p>收藏自习</p>
          </div>
        </div>
      </div>
      <!-- 创建自习室表单弹窗 start-->
      <div v-else class="popUpContent">
        <!-- 弹窗标题 -->
        <p class="popUpContentTitle">创建自习室</p>
        <!-- 关闭按钮 -->
        <div class="close" @click="close">x</div>
        <!-- 表单 -->
        <a-form
          class="create"
          :model="tanForm"
          :rules="tanRules"
          ref="tanFormRef"
        >
          <div class="isFree">
            <a-form-item name="roomAudit" ref="roomAudit">
              <a-select
                default-value="是否开启审核(默认关闭)"
                style="width: 280px"
                @change="freeChange"
              >
                <a-select-option value="false">
                  关闭
                </a-select-option>
                <a-select-option value="true">
                  开启
                </a-select-option>
              </a-select>
              <img src="../assets/img/login/user.png" alt />
            </a-form-item>
          </div>
          <!-- 标题 -->
          <div class="title" v-show="tanForm.roomAudit">
            <a-form-item name="selfTitle" ref="selfTitle">
              <a-input
                placeholder="请输入标题"
                class="titleInput"
                v-model:value="tanForm.selfTitle"
              />
              <img src="../assets/img/login/title.png" alt />
            </a-form-item>
          </div>
          <!-- 内容 -->
          <a-form-item
            ref="selfText"
            name="selfText"
            v-show="tanForm.roomAudit"
          >
            <a-textarea
              v-model:value="tanForm.selfText"
              placeholder="请输入简介"
              id
              cols="36"
              rows="5"
              :maxlength="20"
              :showCount="true"
            ></a-textarea>
          </a-form-item>
          <!-- 确定按钮 -->
          <a-button class="sure" @click="onSubmit">确定</a-button>
        </a-form>
      </div>
      <!-- 创建自习室表单弹窗 end-->
    </div>
    <!-- 座位 end-->
  </div>
</template>
<script>
//#region 引入

// 引入 http方法
import { httpGet } from "@/utils/http";
// 引入 接口
import { rooms } from "@/api";

// 引入全局提示消息框
import { message } from "ant-design-vue";
import { user } from "../api";
//#endregion
export default {
  data() {
    return {
      //#region 教室数据

      // 座位状态
      isTouch: false,
      isPrompt: true,
      // 教室数据
      room: {
        roomInfo: {}
      },
      // 座位号
      seatLists: [],
      selectSeat: "",
      callbackContent: "回调显示",
      // 本人的座位号
      mySeat: "",
      //#endregion

      // 本人的学号（用来判断是否是和自己聊天）
      myStuId: "",
      //#region 弹窗与表单

      // 控制创建表单弹出框
      isShowCreate: false,
      // 控制整体弹出框
      isSelectBar: false,
      // 弹窗from模板
      tanForm: {
        // 是否开启审核制度
        roomAudit: false,
        // 自习室标题
        selfTitle: "快来学习叭！",
        // 自习室简介
        selfText: "快来学习叭！"
      },
      // 弹窗表单规则
      tanRules: {
        selfTitle: [{ required: true, message: "请输入标题", trigger: "blur" }],
        selfText: [
          {
            required: true,
            message: "请输入简介",
            trigger: "blur"
          }
        ]
      },
      // 当前选中用户信息
      classMateData: {},
      toChatBox: false,
      myId: 0
      //#endregion
    };
  },
  created() {
    // 传递从主页传来的 id 和 状态
    this.getRoomDetail(this.$route.query.roomId, this.$route.query.empty);
    // 获取本人的学号
    this.getMyStuId();
  },
  methods: {
    //#region 获取当前教室数据
    getRoomDetail(roomId, isblank) {
      // 收集数据
      let params = {
        roomId: roomId,
        isblank: isblank
        // stuId: this.$route.query.stuId
      };
      // 发起请求 获取自习室详情
      httpGet(rooms.getRoomDetail, params)
        .then(res => {
          let { data } = res;
          // 获取数据
          this.room = data;
          console.log(this.room);
          // 处理room.seatsLists座位号数据 把座位号单独分出成数组对象 方便对比性别和座位
          // data.seatsLists.forEach(item => {
          //   this.seatLists.push(item);
          // });
          // console.log(this.seatLists);
          // 判断是否有人加入
          if (this.room.seatsLists) {
            // 获取本教室的 最大座位数
            let seatItems = new Array(this.room.roomInfo.allSeats);
            // 循环最大座位数 给每个座位填上空的用户信息 表示全部空座位
            for (let index = 0; index < seatItems.length; index++) {
              let obj = { seat: "null", stuId: "null", sex: "null" };
              seatItems[index] = obj;
            }

            // console.log(this.room);

            for (let index = 0; index < seatItems.length; index++) {
              // 循环已经加入自习室的用户信息
              this.room.seatsLists.forEach(item1 => {
                // 对比座位号 把对应座位号的信息填上用户的信息
                if (index + 1 == item1.seat) {
                  seatItems[index] = item1;
                }
              });
            }
            this.seatLists = seatItems;
            // console.log(this.seatLists);
          }
        })
        .catch(err => {
          console.log(err);
        });
      // 获取本人的座位
      httpGet(rooms.getMySeatIndex, {
        roomId: roomId,
        stuId: this.$route.query.stuId
      })
        .then(res => {
          let { data } = res;
          // 如果不存在 则返回-1
          if (!data[0]) {
            return -1;
          }
          // 如果存在 返回座位号
          this.mySeat = data[0].seatIndex;
        })
        .catch(err => {
          console.log(err);
        });
    },
    //#endregion

    //#region 获取本人的学号
    getMyStuId() {
      httpGet(user.getUserList)
        .then(res => {
          this.myStuId = res.data.data.stuId;
        })
        .catch(err => {
          console.log(err);
        });
    },
    //#endregion

    //#region 点击座位 弹出框出现
    seatClick(item) {
      // let out = false;
      // this.seatLists.map(i => {
      //   if (i.seat === String(item - 1) || i.seat === String(item + 1)) {
      //     out = true;
      //   }
      // });
      // if (out) return message.error("因为疫情原因，请隔开就坐");

      // 禁用的座位
      let arr = [
        1,
        1 + 14,
        1 + 28,
        1 + 42,
        3,
        3 + 14,
        3 + 28,
        3 + 42,
        5,
        5 + 14,
        5 + 28,
        5 + 42,
        7,
        7 + 14,
        7 + 28,
        7 + 42,
        9,
        9 + 14,
        9 + 28,
        9 + 42,
        11,
        11 + 14,
        11 + 28,
        11 + 42,
        13,
        13 + 14,
        13 + 28,
        13 + 42
      ];
      for (const i in arr) {
        if (arr[i] == item) {
          return message.error("因为疫情原因，座位禁用");
        }
      }
      // 弹出框设置状态为true
      this.isSelectBar = true;
      // 保存当前点击座位号
      this.selectSeat = item;
    },
    //#endregion

    //#region 点击创建按钮 判断是否是以前的自习室
    btnIsShowCreate() {
      // 如果是以前的自习室 不让创建
      var now = new Date();
      var month = now.getMonth() + 1; //得到月份
      var date = now.getDate(); //得到日期
      console.log(month, date);

      let moon = Number(this.$route.query.moon);
      let day = Number(this.$route.query.day);
      console.log(moon, day);

      if (month <= moon && date <= day) {
        this.isShowCreate = true;
      } else {
        message.error("以前的自习室不能创建！");
      }

      return;
    },
    //#endregion

    //#region 修改自习室审核情况
    freeChange(value) {
      let that = this;
      that.tanForm.roomAudit = JSON.parse(value);
    },
    //#endregion

    //#region 创建自习室 弹窗确定按钮校验
    onSubmit() {
      // 设置this
      let that = this;
      // 表单校验
      this.$refs.tanFormRef
        .validate()
        .then(() => {
          // 收集数据
          let params = {
            // 楼层房号与时间
            build: that.room.roomInfo.build,
            floor: that.room.roomInfo.floor,
            moon: Number(that.$route.query.moon),
            day: Number(that.$route.query.day),
            // 座位号
            seatIndex: that.selectSeat,
            // 标题
            title: that.tanForm.selfTitle,
            // 简介
            action: that.tanForm.selfText,
            // 是否开启审核
            roomAudit: that.tanForm.roomAudit,
            // 自习室ID
            roomId: that.$route.query.roomId
          };
          // 发起创建自习室请求
          httpGet(rooms.addAdmin, params)
            .then(res => {
              let { data } = res;
              console.log(data);

              // 成功则
              if (data.success) {
                // 设置弹出框状态为false
                this.isSelectBar = false;
                // 提示用户
                message.config({ top: `100px` });
                message.success(data.msg);
                // 重新获取教室数据
                this.getRoomDetail(data.roomId, false);
              } else {
                // 如果失败 提示用户
                message.error(data.msg);
              }
            })
            .catch(err => {
              console.log(err);
            });
        })
        .catch(error => {
          console.log("error", error);
        });
    },
    //#endregion

    //#region 点击X号 弹窗口关闭
    close() {
      // 设置弹出框状态为false
      this.isSelectBar = false;
      // 保存的座位号清空
      this.selectSeat = "";
      // 如果是在创建自习室表单点击 则清空表单
      if (this.isShowCreate) {
        // 设置自习室表单弹窗状态为false
        this.isShowCreate = false;
        // 清空表单
        this.$refs.tanFormRef.resetFields();
      }
    },
    //#endregion

    //#region 加入自习室(除创建者以外)
    addClick() {
      // 发起请求
      httpGet(rooms.addRoom, {
        roomId: this.$route.query.roomId,
        seatIndex: this.selectSeat,
        stuId: this.$route.query.stuId
        // moon: Number(this.$route.query.moon),
        // day: Number(this.$route.query.day)
      })
        .then(res => {
          let { data } = res;
          // 设置弹出框状态为false
          this.isSelectBar = false;
          // 提示用户
          message.success(data.msg);
          // 重新获取教室数据
          this.getRoomDetail(this.$route.query.roomId, this.$route.query.empty);
        })
        .catch(err => {
          console.log(err);
        });
    },
    //#endregion

    //#region 收藏自习室
    collectClick() {
      // 收集数据
      let params = {
        roomId: this.$route.query.roomId,
        stuId: this.$route.query.stuId,
        build: this.room.roomInfo.build,
        floor: this.room.roomInfo.floor,
        number: this.room.roomInfo.number,
        moon: this.room.moon,
        day: this.room.day
      };
      // 发起请求
      httpGet(rooms.addStar, params)
        .then(res => {
          let { data } = res;
          // 设置 isSelectBar 状态 为false
          this.isSelectBar = false;
          // 提示用户
          message.success(data.msg);
        })
        .catch(err => {
          console.log(err);
        });
    },

    //#endregion

    //#region 点击管理员开始聊天
    chatToCreater() {
      // 判断是否有管理员
      if (this.room.isCreate) return;
      if (!this.room.roomAudit) return message.error("此自习室没有管理员-w-");
      // 判断管理员是否是自己 如果是自己不能跳跃至聊天
      if (this.myStuId === this.room.createdStuId) {
        message.error("管理员是你自己 无法跳转至聊天界面！");
        return;
      }
      // 前往user路由 并传递 index状态 nav状态 和管理员ID
      this.$router.push({
        path: "/user",
        query: { index: "first", nav: 2, chaterId: this.room.createdStuId }
      });
    },
    //#endregion

    //#region 点击座位 获取当前座位的用户资料
    chatToClassMate(item) {
      console.log(item);

      if (item.seat == "null") {
        return (this.toChatBox = false);
      }
      this.toChatBox = true;
      let id = item.stuId;
      // 将获取到的数据传给userData 并获取已预约数据的长度传给sum
      httpGet(user.getOneUser, {
        stuId: id
      })
        .then(res => {
          console.log(res.data.data);
          //  将获取到的数据传给classMateData
          this.classMateData = res.data.data;
        })
        .catch(err => {
          console.log(err);
        });
    },
    goChat() {
      // 获取自己的信息
      httpGet(user.getUserList)
        .then(res => {
          this.myId = res.data.data.stuId;
          // 判断点击的否是自己
          if (this.myId == this.classMateData.stuId) {
            return message.error("不能与自己聊天！");
          } else {
            this.$router.push({
              path: "/user",
              query: {
                index: "first",
                nav: 2,
                chaterId: this.classMateData.stuId
              }
            });
          }
        })
        .catch(err => {
          console.log(err);
        });
      console.log(this.myId, this.classMateData.stuId);
    }
    //#endregion
  },
  computed: {
    //#region 计算房间号
    calculation() {
      return function(num) {
        if (num < 10) {
          return "0" + num;
        } else {
          return num;
        }
      };
    }
    //#endregion
  }
};
</script>

<style lang="scss" scoped>
@import "../assets/common.scss";
// 教室大盒子
.room {
  width: 820px;
  padding: 10px;
  margin: 20px auto;
  margin-bottom: 10px;
  text-align: center;
  color: #8a8a8a;
  background: #eeeeee;
  border-radius: 5px;
  // 教室号
  .roomId {
    margin: 0 auto;
    font-size: 30px;
    font-weight: 700;
    color: $blue;
  }
  // 教室信息
  .roomInfo {
    margin-top: 5px;
    .userInfo {
      cursor: pointer;
      span {
        color: $orange;
      }
      &:hover {
        opacity: 0.9;
      }
    }
    img {
      vertical-align: middle;
      width: 24px;
      height: 21px;
      margin: 0 3px 0 15px;
    }
    span {
      display: inline-block;
      vertical-align: middle;
      font-weight: 600;
    }
  }
  // 教室详细
  .action {
    display: inline-block;
    margin-top: 10px;
    padding: 2px 15px;
    background: #fff;
    border-radius: 20px;
  }
}
// 座位
.seats {
  width: 820px;
  margin: 0 auto;
  padding-bottom: 15px;
  background: $blank;
  box-sizing: border-box;
  border-radius: 5px;
  overflow: hidden;
  // 下方提示
  .types {
    position: relative;
    top: 15px;
    width: 350px;
    margin: 0 auto;
    padding: 5px 0;
    background: #ddd;
    border-radius: 10px 10px 0 0;
    clear: both;
    img {
      vertical-align: middle;
      width: 18px;
      height: 18px;
      margin-left: 10px;
    }
    span {
      display: inline-block;
      vertical-align: middle;
      margin-right: 10px;
      margin-left: 5px;
      font-size: 12px;
      color: $light;
      box-sizing: border-box;
    }
    // 提示：您的座位
    .ownSeat {
      display: inline-block;
      vertical-align: middle;
      width: 12px;
      height: 12px;
      background: #f39800;
      border-radius: 50%;
    }
  }
  // 讲台
  .rostrum {
    height: 40px;
    margin: 0 auto;
    margin-top: 5px;
    color: $blank;
    text-align: center;
    background: $blue;
    line-height: 40px;
  }
  // 座位外边框
  .classSeats {
    width: 100%;
    padding: 26px 100px;
    box-sizing: border-box;
    // 单个座位
    .oneSeats {
      float: left;
      width: 40px;
      height: 40px;
      padding: 5px;
      border-radius: 50%;
      box-sizing: border-box;
      cursor: pointer;
      img {
        width: 100%;
        height: 100%;
      }
      //&:nth-of-type(14n + 5),
      //&:nth-of-type(14n + 11) {
      //  margin-left: 30px;
      //}
      &:hover {
        transform: translateY(-1px);
      }
      &:nth-of-type(14n + 5),
      &:nth-of-type(14n + 11) {
        margin-left: 30px;
      }
      &:hover {
        transform: translateY(-1px);
      }
      &:nth-of-type(14n + 1),
      &:nth-of-type(14n + 3),
      &:nth-of-type(14n + 5),
      &:nth-of-type(14n + 7),
      &:nth-of-type(14n + 9),
      &:nth-of-type(14n + 11),
      &:nth-of-type(14n + 13) {
        background: #999;
        border-radius: 50%;
        border: 2px solid $blank;
        padding: 3px;
      }
    }
    // 选中座位(您的座位)
    .ownSeat {
      background: #f39800;
      border-radius: 50%;
      border: 2px solid $blank;
      padding: 3px;
    }
  }
}
// 弹窗
.popUp {
  // 遮罩层
  .mask {
    position: absolute;
    top: 0;
    left: 0;
    z-index: 20;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.5);
  }
  // 聊天导航框
  .toChatBox {
    position: absolute;
    top: 30%;
    left: 61%;
    overflow: hidden;
    z-index: 21;
    width: 300px;
    height: 400px;
    background-color: $blue;
    border-radius: 20px;
    img {
      position: absolute;
      top: -50px;
      width: 100%;
      height: 114%;
    }
    h2 {
      position: absolute;
      top: 0;
      left: 50%;
      width: 100%;
      transform: translate(-50%, 0);
      z-index: 59;
      font-size: 26px;
      color: white;
      text-align: center;
      padding-top: 10px;
    }
    // 头像
    .headPortrait {
      position: absolute;
      top: 15%;
      left: 50%;
      transform: translate(-50%, 0);
      display: block;
      width: 100px;
      height: 100px;
      margin: 0px auto;
      text-align: center;
      line-height: 100px;
      color: #fff;
      background-image: url("https://ss1.bdstatic.com/70cFuXSh_Q1YnxGkpoWK1HF6hhy/it/u=2323437359,2829288646&fm=26&gp=0.jpg");
      background: $light;
      background-size: 100%;
      border: 2px solid $blank;
      border-radius: 50%;
      overflow: hidden;
      input {
        position: absolute;
        top: 0;
        left: 0;
        display: block;
        z-index: 3;
        width: 100px;
        height: 100px;
        background: transparent;
        opacity: 0;
        cursor: pointer;
      }
      img {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
      }
    }
    // 资料盒子
    .dataBox {
      position: absolute;
      top: 40%;
      left: 50%;
      transform: translate(-50%, 0);
      width: 100%;
      .dataItem {
        padding-left: 30px;
        width: 100%;
        text-align: left;
      }
    }
    .classMateToChat {
      position: absolute;
      bottom: 10px;
      right: 10px;
      z-index: 10;
      width: 120px;
      border-radius: 10px;
      border-color: #89c867;
    }
    // 个人资料
    .classMateTitle {
      font-size: 26px;
      color: white;
    }
    .classMateContent {
      font-size: 20px;
      color: white;
    }
  }

  // 弹窗内容
  .popUpContent {
    position: fixed;
    top: 50%;
    left: 50%;
    z-index: 21;
    width: 400px;
    height: 450px;
    margin-left: -200px;
    margin-top: -190px;
    text-align: center;
    background: #fff;
    border-radius: 8px;
    // 关闭按钮
    .close {
      position: absolute;
      right: 0px;
      top: 0;
      width: 30px;
      height: 30px;
      margin: 10px;
      line-height: 23px;
      text-align: center;
      font-size: 26px;
      color: #fff;
      opacity: 0.7;
      background: #8a8a8a;
      border-radius: 50%;
      cursor: pointer;
    }
    // 座位信息
    .seatInfo {
      padding: 35px 0 30px 0;
      span {
        font-size: 70px;
        font-weight: 700;
        color: $blue;
      }
      p {
        margin-top: -15px;
        color: $light;
        font-size: 18px;
      }
    }
    // 提示
    .tips {
      font-size: 20px;
      color: $light;
    }
    // 按钮组
    .btnGroup {
      display: flex;
      justify-content: center;
      margin-top: 10px;
      // 按钮样式
      .addRoom,
      .createRoom,
      .saveRoom {
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        width: 100px;
        height: 100px;
        margin: 8px;
        border: 3px solid $blue;
        border-radius: 10px;
        background: $blank;
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
    // 创建自习室弹窗标题
    .popUpContentTitle {
      margin: 20px 0 0 0;
      font-size: 30px;
      font-weight: 700;
      color: #6495ed;
    }
    // 创建自习室表单
    .create {
      width: 280px;
      margin: 0 auto;
      margin-top: 20px;
      // 标题
      .title {
        position: relative;
        margin-bottom: 5px;
        img {
          position: absolute;
          top: -6px;
          left: 8px;
          width: 29px;
          height: 29px;
          vertical-align: middle;
        }
        // 标题输入框
        .titleInput {
          height: 40px;
          width: 100%;
          padding-left: 57px;
          font-size: 14px;
          color: $font;
          //margin-left: 5px;
          //border: 2px solid $light;
          border-radius: 6px;
          box-sizing: border-box;
        }
      }
      // 是否自由进入选择
      .isFree {
        position: relative;
        margin-bottom: 5px;
        height: 40px;
        img {
          position: absolute;
          top: -2px;
          left: 8px;
          width: 25px;
          height: 25px;
          vertical-align: middle;
        }
      }
      // 文本域
      textarea {
        width: 100%;
        height: 140px;
        padding: 10px;
        margin-top: 10px;
        font-size: 18px;
        color: $font;
        border: 2px solid $light;
        border-radius: 6px;
        box-sizing: border-box;
        resize: none; //限制不能拖动文本框
      }
      // 创建表单弹窗确定按钮
      .sure {
        width: 100%;
        height: 40px;
        margin-top: 20px;
        color: #fff;
        background: $blue;
        border-radius: 6px;
        border: 0;
        cursor: pointer;
      }
    }
  }
}
.ant-select-single:not(.ant-select-customize-input) .ant-select-selector {
  width: 100px;
}
:global(.ant-btn.ant-btn-primary:hover) {
  color: #fff;
  background-color: $blue !important;
  border-color: $blue !important;
}
</style>
