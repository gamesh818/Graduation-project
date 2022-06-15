<template>
  <!-- 已经收藏的课程 -->
  <div class="saved">
    <!-- 收藏列表 -->
    <div class="savedList" v-for="item in tableData" :key="item._id">
      <!-- 列表左侧 -->
      <div class="listLeft">
        <!-- 列表左上侧 -->
        <div class="listLeftUp">
          <!-- 列表日期 -->
          <span class="listDate"
            >{{ item.collectRid.moon }}月{{ item.collectRid.day }}日</span
          >

          <!-- 地点 （哪个楼） -->
          <span class="listBuild">{{ item.collectRid.roomInfo.build }}</span
          >/
          <!-- 收藏教室位置 -->
          <span>{{ roomNumber(item.collectRid.roomInfo) }}</span>
        </div>
        <!-- 列表左下侧 -->
        <div class="listLeftDown">
          <!-- 教室标题 -->
          <span>标题：{{ item.collectRid.title }}</span>
          <!-- 教室简介 -->
          <span>简介：{{ item.collectRid.action }}</span>
        </div>
      </div>
      <!-- 列表右侧 -->
      <div class="listRight">
        <!-- 查看详情 -->
        <a @click="toDetail(item)">查看详情</a>
        <!-- 删除 -->
        <a class="del" @click="deleteRoomClick(item)">删除</a>
      </div>
    </div>
    <!-- 空白背景及提示 -->
    <blankImg
      v-if="tableData == ''"
      content="啊哦，您还没有收藏的自习信息"
    ></blankImg>
    <!-- 删除弹窗 -->
    <!-- reset 取消  让提示框消失  promise 确定:删除这个room -->
    <toast
      v-if="showToast"
      @reset="showToast = false"
      @promise="deleteRoom"
      content="确定要删除该自习吗？"
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
      // 收藏的数据
      tableData: [],
      // 弹窗显示
      showToast: false,
      // 要删除教室的数据
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
    // 获取收藏的数据
    this.getCollectRoomList();
  },
  methods: {
    //#region  获取信息
    getCollectRoomList() {
      // 发起请求
      httpGet(user.getCollectRoomList)
        .then(res => {
          //  获取成功 将获取到的收藏的数据传给tableData
          let { data } = res;
          console.log(data);
          if (data.success) {
            this.tableData = data.data[0].collectRidList;
            console.log(this.tableData);
          }
        })
        .catch(err => {
          console.log(err);
        });
    },
    //#endregion
    //#region   查看详情
    toDetail(room) {
      console.log(room);
      this.$router.push({
        path: "/room",
        query: {
          stuId: room.collectRid.stuInfo,
          roomId: room.collectRid._id,
          empty: false
        }
      });
    },
    //#endregion
    //#region  点击删除
    deleteRoomClick(room) {
      // 弹出提示框
      this.showToast = true;
      // 将要删除的待审核数据传给delRoom
      this.delRoom = room;
    },
    //#endregion
    //#region 确定删除收藏
    deleteRoom() {
      let room = this.delRoom;
      //  发起请求 删除该收藏数据
      httpGet(user.delColList, { roomId: room.roomRecord._id })
        .then(res => {
          let { data } = res;
          if (data.sucess) {
            // 删除成功 提示框消失
            this.showToast = false;
            //  重新获取数据
            this.getCollectRoomList();
            // 全局提示
            message.success("删除成功");
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
.saved {
  padding: 10px;
  width: 100%;
  box-sizing: border-box;
  .savedList {
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
    .listLeft {
      float: left;
      padding-left: 20px;
      line-height: 60px;

      .listLeftUp {
        margin: 0 7px;
        height: 30px;
        color: $blue;
        font-size: 20px;

        span {
          margin: 0 8px;
        }
      }
      .listLeftDown {
        margin-left: 15px;
        margin-top: 13px;
        width: 100%;
        color: $light;
        span {
          display: block;
          line-height: 20px;
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
