<template>
  <!-- 当用户资料空白时 显示的图 -->
  <div class="blankImg">
    <img src="../assets/img/pic/nolist-img.png" alt="" />
    <!-- 提示信息 -->
    <p>{{ content }}</p>
  </div>
</template>

<script>
export default {
  props: {
    content: {
      type: String
    }
  }
};
</script>
<style lang="scss" scoped>
@import "../assets/common.scss";
.blankImg {
  text-align: center;
  padding: 80px;
  img {
    width: 200px;
  }
  p {
    font-size: 18px;
    color: $light;
    font-weight: 600;
  }
}
</style>
