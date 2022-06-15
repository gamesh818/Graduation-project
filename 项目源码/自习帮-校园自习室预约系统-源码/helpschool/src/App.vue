<template>
  <div id="nav" :class="height">
    <headers></headers>
  </div>
  <router-view />
</template>

<script>
import headers from "@/components/header.vue";
export default {
  data() {
    return {
      height: ""
    };
  },
  components: {
    headers
  },
  watch: {
    // 监听路由
    $route: function() {
      // 路由是否为/login
      if (this.$route.path != "/login") {
        // 如果是login 给div加class样式
        this.height = "headerTop";
      } else {
        // 如果不是 则清空样式
        this.height = "";
      }
    }
  }
};
</script>

<style lang="scss" scoped>
.headerTop {
  height: 48px;
}

#app {
  height: 100%;
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
}
#nav {
  a {
    font-weight: bold;
    color: #2c3e50;

    &.router-link-exact-active {
      color: #42b983;
    }
  }
}
</style>
