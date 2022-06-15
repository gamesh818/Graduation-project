<template>
  <!-- 已预约的课程 -->
  <div class="isSelected">
    <!-- 已预约列表 -->
    <div class="selectedList" v-for="item in tableData" :key="item._id">
      <!-- 创建者图标 -->
      <div v-if="item.isCreater" class="createrIcon">
        <img src="@/assets/img/room/creater-icon.png" alt />
      </div>
      <!-- 列表左侧 -->
      <div class="listLeft">
        <!-- 列表左上侧 -->
        <div class="listLeftUp">
          <!-- 列表日期 -->
          <span class="listDate"
            >{{ item.hasRoomInfo.moon }}月{{ item.hasRoomInfo.day }}日</span
          >
          /
          <!-- 地点 （哪个楼） -->
          <span class="listBuild">
            {{ item.hasRoomInfo.roomInfo ? item.hasRoomInfo.roomInfo.build : ""
            }}{{ roomNumber(item.hasRoomInfo.roomInfo) }}
          </span>
          /
          <!-- 座位号 -->
          <span class="listSeat">座位号{{ item.seatIndex }}</span>
        </div>
        <!-- 列表左下侧 -->
        <div class="listLeftDown">
          <!-- 教室标题 -->
          <span>标题：{{ item.hasRoomInfo.title }}</span>
          <!-- 教室简介 -->
          <span>简介：{{ item.hasRoomInfo.action }}</span>
        </div>
      </div>
      <!-- 列表右侧 -->
      <div class="listRight">
        <!-- 查看详情 -->
        <a @click="toDetail(item)">查看详情</a>
        <!-- 管理员不能删除自习室 -->
        <a class="del" v-if="!item.isCreater" @click="deleteRoomClick(item)"
          >删除</a
        >
        <!-- 删除 -->
        <a class="del" v-else style="background: #bbb">删除</a>
      </div>
    </div>
    <!-- 空白背景及提示 -->
    <blankImg
      v-if="tableData == ''"
      content="啊哦，还没有已选择自习的信息"
    ></blankImg>
    <!-- 删除弹窗 -->
    <toast
      v-if="showToast"
      content="确定要删除该自习吗？"
      @reset="showToast = false"
      @promise="deleteRoom"
    ></toast>
  </div>
</template>

<script>
// 引入背景
import blankImg from "@/components/blankImg";
// 引入弹窗
import toast from "@/components/toast";
// 引入请求方法
import { httpGet } from "@/utils/http";
// 引入请求路径
import { user } from "@/api";
// 引入全局提示消息框
import { message } from "ant-design-vue";
export default {
  data() {
    return {
      // 已预约的数据
      tableData: [],
      // 弹窗显示
      showToast: false,
      // 要删除的教室数据
      delRoom: ""
    };
  },
  components: {
    // 引入背景图
    blankImg,
    //弹窗
    toast
  },
  created() {
    //  获取已预约的数据
    this.getHasRoomLists();
  },
  methods: {
    //#region 获取已预约自习室列表
    getHasRoomLists() {
      // 发起请求
      httpGet(user.getHasRoomList)
        .then(res => {
          let { data } = res;

          // 获取成功 将获取到的待审核的数据传给tableData
          if (data.success) {
            message.success(data.msg);

            let now = new Date();
            let month = now.getMonth() + 1; //得到月份
            let date = now.getDate(); //得到日期

            // 筛选今天的数据
            this.tableData = data.data.filter(item => {
              return (
                item.hasRoomInfo.moon === month && item.hasRoomInfo.day === date
              );
            });
          }
        })
        .catch(err => {
          console.log(err);
        });
    },
    //#endregion

    //#region 查看详情
    toDetail(room) {
      console.log(room);
      this.$router.push({
        path: "/room",
        query: {
          stuId: room.stuInfo,
          roomId: room.hasRoomInfo._id,
          empty: false
        }
      });
    },
    //#endregions

    //#region 点击删除
    deleteRoomClick(room) {
      console.log(room);
      // 弹出提示框
      this.showToast = true;
      // 将要删除的已预约数据传给delRoom
      this.delRoom = room;
    },
    //#endregion

    //#region  确定删除
    deleteRoom() {
      let room = this.delRoom;
      console.log(room);
      // console.log(room.hasRoomInfo._id);
      // //  发起请求 删除该已预约数据
      httpGet(user.deleteHasRoom, {
        roomId: room.hasRoomInfo._id,
        seatIndex: room.seatIndex
      })
        .then(res => {
          let { data } = res;
          if (data.success) {
            // 删除成功 提示框消失
            this.showToast = false;
            //  重新获取数据
            this.getHasRoomLists();
            // 全局提示
            message.success("删除成功");
          } else {
            // 删除失败 提示框消失
            this.showToast = false;
            // 提示
            message.error(data.msg);
          }
        })
        .catch(err => {
          console.log(err);
        });
    }
    //#endregion
  },

  computed: {
    //#region 计算返回楼层及教室号
    roomNumber() {
      return function(room) {
        // 如果number房间号小于10
        if (room.number < 10) {
          // 就在楼层和 房间号之间加个0
          return room.floor + "0" + room.number;
        } else {
          return room.floor + "" + room.number;
        }
      };
    }
    //#endregion
  }
};
</script>

<style lang="scss" scoped>
@import "@/assets/common.scss";
.isSelected {
  padding: 10px;
  width: 100%;
  box-sizing: border-box;
  .selectedList {
    overflow: hidden;
    position: relative;
    margin: 10px 0;
    width: 100%;
    height: 100px;
    border: 1px solid $blank;
    border-radius: 5px;
    background: #fff;
    cursor: pointer;
    &:hover {
      border: 1px solid $blue;
    }
    .createrIcon {
      position: absolute;
      top: 0;
      width: 50px;
      height: 50px;
      img {
        width: 50px;
        height: 50px;
      }
    }
    .listLeft {
      float: left;
      padding-left: 50px;
      max-width: 540px;
      line-height: 50px;
      .listLeftUp {
        height: 30px;
        font-size: 20px;
        color: $blue;
        span {
          margin: 0 5px;
          line-height: 50px;
        }
      }
      .listLeftDown {
        overflow: hidden;
        margin-left: 5px;
        margin-top: 13px;
        width: 100%;
        height: 46px;
        color: $light;
        span {
          display: block;
          line-height: 23px;
          font-size: 14px;
        }
      }
    }
    .listRight {
      float: right;
      height: 100px;
      a {
        display: inline-block;
        margin-top: 26px;
        margin-right: 10px;
        width: 90px;
        height: 40px;
        line-height: 40px;
        text-align: center;
        color: #fff;
        font-size: 15px;
        background: $blue;
        border-radius: 5px;
        cursor: pointer;
        &:hover {
          opacity: 0.8;
        }
      }
      .del {
        width: 60px;
        background: $red;
      }
    }
  }
}
</style>
