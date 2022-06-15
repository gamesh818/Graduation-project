import { createApp } from "vue";
import App from "./App.vue";
import router from "./router";
// 使用 Ant Design of Vue
import Antd from "ant-design-vue";
import "ant-design-vue/dist/antd.css";

// import axios from "axios";
// axios.defaults.baseURL = "http://127.0.0.1:4000";
// axios.defaults.baseURL = "http://192.168.82.128:8080"

createApp(App)
  .use(router)
  .use(Antd)
  .mount("#app");
