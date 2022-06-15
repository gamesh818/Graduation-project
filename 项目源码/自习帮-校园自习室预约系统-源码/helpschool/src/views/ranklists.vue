<template>
  <!-- 段位榜 -->
  <div class="rank">
    <div class="title">
      <img src="@/assets/img/rank/rank-title-white.png" />
    </div>
    <!-- 段位榜表格的表头 -->
    <div class="nav">
      <span class="excellent">排名</span>
      <span class="name">姓名</span>
      <span class="school">学校/专业</span>
      <span class="number">自习数</span>
      <span class="level">段位</span>
      <span class="praise">点赞</span>
    </div>
    <!-- 遍历段位榜表格数据 -->
    <!-- selfItem: 本人底色 -->
    <!-- rankItem: 判断能否点赞 -->
    <!-- golden: 一到三名加皇冠 -->
    <div
      :class="{
        selfItem: index == userRank,
        rankItem: true,
        golden: index < 3
      }"
      v-for="(item, index) in rankLists"
      :key="item.stuId"
    >
      <!-- 给前三名添加皇冠 -->
      <span class="excellent">
        <img v-if="index < 3" src="@/assets/img/rank/rank-winner-icon.png" />
        {{ index + 1 }}
      </span>
      <!-- 渲染表格数据 -->
      <span class="name">{{ item.stuInfo.name }}</span>
      <span class="school"
        >{{ item.stuInfo.school }} / {{ item.stuInfo.major }}</span
      >
      <span class="number">{{ item.hasNumber }}</span>
      <span class="level">{{ judgeLevel(item.hasNumber) }}</span>
      <div class="praise">
        <!-- 判断是否今日已点赞 -->
        <span v-if="!item.isPraise" @click="clickPraise(item)">
          <img src="@/assets/img/rank/promise-off2.png" alt="" />
        </span>
        <span v-else>
          <img src="@/assets/img/rank/promise-off.png" alt="" />
        </span>
        <!-- 点赞数 -->
        <span class="number">{{ item.praise || 0 }}</span>
      </div>
    </div>
  </div>
</template>
<script>
// 引入段位信息
import { judgeLevel } from "@/lib/level";
// http方法
import { httpGet } from "@/utils/http";
// 引入接口
import { expand } from "@/api";
export default {
  data() {
    return {
      // 排行榜数据
      rankLists: [],
      userRank: ""
    };
  },

  created() {
    // 获取排行榜列表
    this.getRankLists();
  },
  computed: {
    //#region 计算段位等级
    judgeLevel() {
      return function(num) {
        return judgeLevel(num);
      };
    }
    //#endregion
  },
  methods: {
    //#region  获取排行榜列表
    getRankLists() {
      httpGet(expand.getRankingList).then(res => {
        let { data } = res;
        console.log(data);
        if (data.success) {
          this.rankLists = data.data.rankLists;
        }
        // this.userRank = res.data.selfRank;
      });
    },
    //#endregion
    //#region 点赞
    clickPraise(item) {
      console.log(item);
      let params = {
        stuId: item.stuInfo.stuId,
        praise: ++item.praise || 1
      };
      httpGet(expand.getLikeTheList, params)
        .then(() => {
          this.getRankLists();
        })
        .catch(err => {
          console.log(err);
        });
    }

    //#endregion
  }
};
</script>
<style lang="scss" scoped>
@import "@/assets/common.scss";
.rank {
  width: 800px;
  margin: 10px auto;
  margin-bottom: 50px;
  padding: 20px;
  border-radius: 5px;
  background: $blank;

  .title {
    text-align: center;
    font-weight: bold;
    font-size: 35px;
    padding-bottom: 10px;
    color: $blue;
    img {
      height: 100px;
      width: 450px;
    }
  }
  .excellent {
    display: flex;
    flex: 0 1 100px;
    justify-content: center;
    align-items: center;
    font-weight: 700;
    img {
      width: 25px;
      height: 25px;
      margin-right: 5px;
      vertical-align: middle;
    }
  }
  .name {
    flex: 0 1 150px;
  }
  .school {
    flex: 0 1 300px;
  }
  .number,
  .level,
  .praise {
    flex: 0 1 130px;
    img {
      width: 18px;
      height: 18px;
      vertical-align: top;
    }
    .number {
      display: inline-block;
      width: 30px;
      vertical-align: middle;
      text-align: left;
    }
  }
  .nav {
    display: flex;
    justify-content: center;
    align-items: center;
    width: 100%;
    height: 45px;
    text-align: center;
    border-radius: 5px;
    color: $orange;
    background: #fff;
  }
  .rankItem {
    display: flex;
    justify-content: center;

    align-items: center;
    width: 100%;
    height: 45px;
    margin: 8px 0;
    text-align: center;
    font-size: 14px;
    color: #194f80;
  }
  .selfItem {
    border-radius: 50px;
    color: #fff;
    background: rgba($color: $orange, $alpha: 0.8);
  }
  .golden {
    .index {
      color: #e3c24d;
    }
  }
}
</style>
