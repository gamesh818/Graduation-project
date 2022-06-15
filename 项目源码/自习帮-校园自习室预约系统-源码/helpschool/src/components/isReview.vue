<template>
  <!-- 待审核的课程 -->
  <div class="isReviewed">
    <!-- 待审核课程列表 -->
    <!-- v-if="!item.reject" -->
    <div v-for="item in tableData" :key="item._id">
      <div class="isReviewList">
        <!-- 列表左侧 -->
        <div class="listLeft">
          <!-- 列表左上侧 -->
          <div class="listLeftUp">
            <!-- 列表日期 -->
            <span class="listDate">
              {{ item.roomRecord.moon }}月{{ item.roomRecord.day }}日</span
            >/
            <!-- 地点 （哪个楼） -->
            <span class="listBuild">{{ item.roomRecord.roomInfo.build }}</span
            >/
            <!-- 教室位置(楼层教室号) -->
            <span>{{ roomNumber(item.roomRecord.roomInfo) }}</span>
            <!-- 座位号 -->
            <span class="listSeat">座位{{ item.seatIndex }}号</span>
          </div>
          <!-- 列表左下侧 -->
          <div class="listLeftDown">
            <!-- 教室标题 -->
            <span>标题：{{ item.roomRecord.title }}</span>
            <!-- 教室简介 -->
            <span>简介：{{ item.roomRecord.action }}</span>
          </div>
        </div>
        <!-- 提示语 -->
        <i v-if="item.reject" class="rejected">该申请已被管理员无情拒绝</i>
        <i v-else-if="item.out" class="out">该申请已过期</i>
        <!-- 列表右侧 -->
        <div class="listRight">
          <!-- 查看详情 -->
          <a @click="toDetail(item)">查看详情</a>
          <!-- 删除 -->
          <a class="del" @click="deleteReviewClick(item)">删除</a>
        </div>
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
      @reset="showToast = false"
      @promise="deleteReview"
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
      // 待审核的数据
      tableData: "",
      // 要删除的教室数据
      delRoom: "",
      // 弹窗显示
      showToast: false
    };
  },
  components: {
    // 引入背景图
    blankImg,
    //弹窗
    toast
  },
  created() {
    // 获取待审核的数据
    this.getReviewRoomLists();
  },
  methods: {
    //#region 获取信息
    getReviewRoomLists() {
      let now = new Date();
      let month = now.getMonth() + 1; //得到月份
      let date = now.getDate(); //得到日期
      //  发起请求
      httpGet(user.getReviewRoomList, { stuId: this.$route.query.stuId })
        .then(res => {
          let { data } = res;
          // 获取成功 将获取到的待审核的数据传给tableData

          if (data.success) {
            message.success(data.msg);

            this.tableData = data.data;

            console.log(this.tableData);
            // 给日期不是今天的申请信息 添加过期标识
            this.tableData.forEach(item => {
              if (item.roomRecord) {
                item["out"] = !(
                  item.roomRecord.moon === month && item.roomRecord.day === date
                );
              }
            });
            this.tableData.sort((a, b) => {
              return a.date < b.date ? 1 : a.date > b.date ? -1 : 0;
            });
          }
        })
        .catch(err => {
          console.log(err);
        });
    },
    //#endregion

    //#region点击删除
    deleteReviewClick(room) {
      // 弹出提示框
      this.showToast = true;

      this.delRoom = room;
    },
    //#endregion

    //#region  确定删除
    deleteReview() {
      let room = this.delRoom;
      console.log(room);
      // 发起请求删除该待审核数据
      httpGet(user.delRevList, {
        reviewId: room._id
      })
        .then(res => {
          let { data } = res;
          if (data.success) {
            // 删除成功 提示框消失
            this.showToast = false;
            //  重新获取数据
            this.getReviewRoomLists();
            // 全局提示
            message.success("删除成功");
          } else {
            // 删除失败 提示框消失
            this.showToast = false;
            //  重新获取数据
            this.getReviewRoomLists();
            message.error("删除失败");
          }
        })
        .catch(err => {
          console.log(err);
        });
    },
    //#endregion

    //#region 查看详情
    toDetail(room) {
      this.$router.push({
        path: "/room",
        query: {
          stuId: room.stuId,
          roomId: room.roomRecord._id,
          empty: false
        }
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
.isReviewed {
  position: relative;
  padding: 10px;
  width: 100%;
  box-sizing: border-box;
  .isReviewList {
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
    .listLeft {
      float: left;
      padding-left: 20px;
      line-height: 60px;

      .listLeftUp {
        margin: 0 7px;
        height: 30px;
        color: $black;
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
    // 提示语 被拒绝
    .rejected {
      position: absolute;
      left: 52%;
      top: 20px;
      color: red;
      font-size: 14px;
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
        font-size: 15px;
        background: $blue;
        border-radius: 5px;
        color: #fff;
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
  .out {
    position: absolute;
    left: 58%;
    top: 20px;
    color: red;
    font-size: 14px;
  }
}
</style>
