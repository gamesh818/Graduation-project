<template>
  <div>
    <!-- 条件筛选 start -->
    <div class="filterList">
      <!-- 条件筛选表单 start-->
      <a-form :model="filterModel" layout="inline" style="padding: 15px 0">
        <!-- 地点 -->
        <a-form-item label="选择地点">
          <a-select v-model:value="filterModel.number" placeholder="请选择地点">
            <a-select-option
              v-for="(item, index) in buildLists"
              :key="index"
              :value="item"
              >{{ item }}
            </a-select-option>
          </a-select>
        </a-form-item>
        <!-- 楼层 -->
        <a-form-item label="选择楼层">
          <a-select v-model:value="filterModel.floor" placeholder="请选择楼层">
            <a-select-option
              v-for="(item, index) in floorLists"
              :key="index"
              :value="item"
              >{{ item }}
            </a-select-option>
          </a-select>
        </a-form-item>
        <!-- 时间 -->
        <a-form-item label="选择时间">
          <a-date-picker
            :allowClear="false"
            :default:value="filterModel.date"
            @change="timeChange"
            :default-value="timeFormat"
            type="date"
            placeholder="请选择时间"
            style="width: 100%; cursor: pointer"
          />
        </a-form-item>
        <!-- 筛选按钮 -->
        <a-button type="primary" @click="filterOk" class="Btn">确定</a-button>
      </a-form>
      <!-- 条件筛选表单 end-->
    </div>
    <!-- 条件筛选 end -->

    <!-- 教室渲染 start-->
    <div class="classRoom">
      <div v-for="item in roomLists" :key="item._id">
        <div :class="roomSelect(item)" @click="toDetail(item)">
          <div class="roomTitleBox">
            <!-- 教室号 -->
            <span class="roomId">{{ roomNumber(item) }}</span>
            <!-- 教学楼 -->
            <span class="roomBuild">{{
              item.roomInfo?.build || item.build
            }}</span>
          </div>
          <!-- 教室座位信息 -->
          <span class="seats">
            <img class="seatsIcon" :src="createdSeat(item)" />
            <span class="seatsNum">{{
              item.roomInfo?.allSeats || item.allSeats
            }}</span>
            <img class="seatsIcon" :src="createdYesSeat(item)" />
            <span class="seatsNum">{{
              item.title ? item.seatsLists.length : 0
            }}</span>
            <img class="seatsIcon" :src="createdMan(item)" />
            <span class="seatsNum">{{
              item.roomAudit === false
                ? "无审核自习室"
                : item.stuInfo
                ? item.stuInfo.name
                : "暂无"
            }}</span>
          </span>
          <!-- 主题 -->
          <p class="title">主题：{{ item.title || "未命名" }}</p>
          <!-- 详情 -->
          <p class="content">详情：{{ item.action || "暂无详情介绍" }}</p>
        </div>
      </div>
    </div>
    <!-- 教室渲染 end-->
  </div>
</template>

<script>
//#region 引入
// 引入 moment
import moment from "moment";
// 引入 http方法
import { httpGet } from "@/utils/http";
// 引入 接口
import { rooms } from "@/api";
import { message } from "ant-design-vue";
//#endregion

export default {
  data() {
    return {
      //#region 教室数据
      roomLists: [],
      //#endregion

      //#region 表单数据
      filterModel: {
        // 楼层
        floor: "不限",
        // 班级号
        number: "不限",
        // 时间
        date: moment().format("YYYY-MM-DD")
      },
      //#endregion

      //#region 下拉选择框数据
      buildLists: ["不限", "一公教", "二公教"],
      floorLists: ["不限", "1", "2"]
      //#endregion
    };
  },
  created() {
    // 获取教室列表
    this.getRoom();
  },
  computed: {
    //#region 计算教室号
    roomNumber() {
      return function(room) {
        if (room.roomInfo) {
          if (room.roomInfo.number < 10) {
            return room.roomInfo.floor + "0" + room.roomInfo.number;
          } else {
            return room.roomInfo.floor + "" + room.roomInfo.number;
          }
        } else {
          if (room.number < 10) {
            return room.floor + "0" + room.number;
          } else {
            return room.floor + "" + room.number;
          }
        }
      };
    },

    //#endregion

    //#region 时间格式
    timeFormat() {
      return moment(this.filterModel.date, "YYYY-MM-DD");
    },
    //#endregion

    //#region 教室是否选中
    roomSelect() {
      return function(item) {
        if (item.title) {
          return "roomBorder";
        } else {
          return "roomBorderNo";
        }
      };
    },
    //#endregion

    //#region 是否创建教室，变更图片
    // 座位图片
    createdSeat() {
      return function(item) {
        if (item.title) {
          return require("../assets/img/login/seat-off.png");
        } else {
          return require("../assets/img/login/seat-off-grey.png");
        }
      };
    },
    createdYesSeat() {
      return function(item) {
        if (item.title) {
          return require("../assets/img/login/seat-on.png");
        } else {
          return require("../assets/img/login/seat-on-grey.png");
        }
      };
    },
    createdMan() {
      return function(item) {
        if (item.title) {
          return require("../assets/img/login/user.png");
        } else {
          return require("../assets/img/login/user-grey.png");
        }
      };
    }

    //#endregion
  },
  methods: {
    //#region 获取教室列表数据
    getRoom() {
      // 切割时间为数组 提取时间
      let time = this.filterModel.date.split("-");
      // 收集数据
      let params = {
        build: this.filterModel.number,
        floor: this.filterModel.floor,
        moon: Number(time[1]),
        day: Number(time[2])
      };
      // 发起请求 获取数据
      httpGet(rooms.getRoom, params)
        .then(res => {
          let { data } = res;
          if (data.sucess) {
            this.roomLists = data.data;
            console.log(this.roomLists);

            message.success("获取教室列表成功！", 0.7);
          }
        })
        .catch(err => {
          console.log(err);
        });
    },
    //#endregion

    //#region 点击前往详细
    toDetail(item) {
      // 如果已经创建 则传递ID
      if (item.title) {
        // 前往room 路由 传递教室ID 和 是否可以创建教室
        this.$router.push({
          path: "/room",
          query: {
            roomId: item._id,
            empty: false
          }
        });
      } else {
        // 如果没有创建过自习室 则传递数据
        // 分割时间为数组 提取出几月几日
        let time = this.filterModel.date.split("-");
        // 前往room路由 传递教室ID 和 是否可以创建教室 和时间信息
        this.$router.push({
          path: "/room",
          query: {
            roomId: item.roomInfo._id,
            empty: true,
            moon: Number(time[1]),
            day: Number(time[2])
          }
        });
      }
    },
    //#endregion

    //#region 筛选数据
    filterOk() {
      // 点击筛选按钮 重新获取教室列表
      this.getRoom();
    },
    //#endregion

    //#region 筛选时间改变
    timeChange(date, dateString) {
      // 获取改变的时间
      this.filterModel.date = dateString;
    }
    //#endregion
  }
};
</script>

<style lang="scss" scoped>
@import "../assets/common.scss";
// 筛选列表
.filterList {
  height: 70px;
  width: 100%;
  text-align: center;
  font-size: 20px;
  font-weight: 800;
  color: #515151;
  background: #eeeeee;

  .ant-form-item-control-wrapper {
    width: 120px;
  }

  .ant-form-item-label {
    padding-left: 40px;
    padding-right: 10px;
  }

  .ant-btn-primary {
    position: relative;
    top: 5px;
  }
}

// 教室渲染
.classRoom {
  width: 1220px;
  margin: 0 auto;
  box-sizing: border-box;
  // 单间教室边框(以创建自习室形态)
  .roomBorder {
    float: left;
    width: 200px;
    height: 200px;
    margin: 20px;
    color: $black;
    text-align: center;
    border: 2px solid $blue;
    border-radius: 5px;
    cursor: pointer;

    span {
      display: block;
      margin-top: 5px;
      font-size: 14px;
    }

    .roomId {
      height: 30px;
      margin-top: 0;
      line-height: 35px;
      font-size: 30px;
      color: $blank;
      background: $blue;
    }

    .roomBuild {
      margin-bottom: 10px;
      margin-top: 0;
      font-size: 14px;
      color: $blank;
      background: $blue;
    }
  }

  // 单间教室边框(未创建自习室形态)
  .roomBorderNo {
    float: left;
    width: 200px;
    height: 200px;
    margin: 20px;
    text-align: center;
    color: $black;
    border-radius: 5px;
    border: 2px solid $light;
    cursor: pointer;

    span {
      display: block;
      margin-top: 5px;
      font-size: 14px;
    }

    .roomId {
      height: 30px;
      margin-top: 0;
      line-height: 35px;
      font-size: 30px;
      color: $black;
      background: $blank;
    }

    .roomBuild {
      margin-bottom: 10px;
      margin-top: 0;
      font-size: 14px;
      color: $black;
      background: $blank;
    }
  }

  // 教室hover
  .roomBorder,
  .roomBorderNo {
    &:hover {
      box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
      transform: translateY(-3px);
    }
  }

  // 座位
  .seats {
    display: flex;
    justify-content: center;
    height: 18px;

    .seatsNum {
      display: inline-block;
      text-align: left;
    }

    .seatsIcon {
      vertical-align: middle;
      width: 18px;
      height: 18px;
      margin: 0 2px 0 5px;
    }
  }

  // 主体和详情
  .title,
  .content {
    margin: 0 10px;
    margin-top: 25px;
    padding: 0 8px;
    font-size: 13px;
    text-align: left;
    color: $light;
    background: #eee;
    border-radius: 5px;
  }

  .content {
    margin-top: 5px;
    min-height: 55px;
    overflow: hidden;
  }
}

.roomTitleBox {
  margin: -1px;
  background-color: #6495ed;
}

.ant-btn-primary {
  background-color: $blue;
  border-color: $blue;
}
</style>
