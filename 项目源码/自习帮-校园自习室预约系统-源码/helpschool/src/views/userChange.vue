<template>
  <!-- 修改个人信息 start -->
  <div class="userChange">
    <!-- 头像 start-->
    <div class="headPortrait" :style="photoUrlStyle">
      <img :src="photoUrl" alt="" />
      <input
        type="file"
        @change="uploadPhoto($event)"
        accept="image/png,image/jpeg,image/jpg"
      />
    </div>

    <!-- 头像 end -->

    <!-- 修改姓名表单 start -->
    <a-form
      :model="userChangeModel"
      :rules="userChangeRules"
      ref="userChangeFormRef"
    >
      <!-- 姓名列 -->
      <div class="userInput">
        <a-form-item
          ref="name"
          label="姓名"
          name="name"
          style="marginleft: 5px"
        >
          <a-input
            type="text"
            v-model:value="userChangeModel.name"
            style="width: 140px"
          />
        </a-form-item>
      </div>
      <!-- 学号列 -->
      <div class="userInput readOnly">
        <a-form-item ref="stuId" label="学号" name="stuId">
          <a-input
            type="text"
            readonly
            v-model:value="userChangeModel.stuId"
            style="width: 140px"
          />
        </a-form-item>
      </div>
      <!-- 学校列 -->
      <div class="userInput">
        <a-form-item
          ref="school"
          label="学校"
          name="school"
          style="marginbottom: 20px"
        >
          <a-input
            type="text"
            v-model:value="userChangeModel.school"
            style="width: 180px"
          />
        </a-form-item>
      </div>

      <div class="userInput">
        <a-form-item
          ref="major"
          label="专业"
          name="major"
          style="margintop: 20px"
        >
          <a-input type="text" v-model:value="userChangeModel.major" />
        </a-form-item>
      </div>
      <!-- 密码列 -->
      <div class="userInput">
        <a-form-item ref="password" label="密码" name="password">
          <a-input type="password" v-model:value="userChangeModel.password" />
        </a-form-item>
      </div>
      <!-- 按钮 -->
      <div class="btnGroup">
        <a-button class="btn" @click="submit">保存</a-button>
        <a-button class="btn" @click="returnBack">返回</a-button>
      </div>
    </a-form>
    <!-- 修改姓名表单 end -->
  </div>
  <!-- 修改个人信息 end -->
</template>

<script>
//#region 引入

// 引入提示组件
import { message } from "ant-design-vue";
// 引入http方法
import { httpPost, httpGet } from "@/utils/http";
// 引入接口
import { user } from "../api";
// 引入七牛云
import * as qiniu from "qiniu-js";
//#endregion
export default {
  data() {
    return {
      //#region 修改用户表单
      // 表单model
      userChangeModel: {
        name: "",
        school: "",
        major: "",
        stuId: "",
        password: ""
      },
      // 表单校验规则
      userChangeRules: {
        name: [
          {
            required: true,
            message: "请输入您的姓名",
            trigger: "blur"
          }
        ],
        school: [
          {
            required: true,
            message: "请输入您的学校",
            trigger: "blur"
          }
        ],
        major: [
          {
            required: true,
            message: "请输入您的专业",
            trigger: "blur"
          }
        ],
        stuId: [
          {
            type: "number",
            required: true,
            message: "请输入您的学号",
            trigger: "blur"
          }
        ],
        password: [
          {
            required: true,
            message: "请输入您的密码",
            trigger: "blur"
          },
          {
            min: 6,
            max: 18,
            message: "密码长度为6到18",
            trigger: "change"
          }
        ]
      },
      //#endregion

      //#region 用户信息
      // 用户数据
      userEcho: {},
      //#endregion
      //#region 头像数据
      // 头像url
      photoUrl: "",
      // 头像显示
      photoUrlStyle: "backgroundImage:url('" + this.photoUrl + "')",
      fileList: [],
      loading: false
      //#endregion
    };
  },
  created() {
    // 获取用户信息回显
    this.editUserEcho();
  },
  methods: {
    //#region 获取当前用户信息用来回显
    editUserEcho() {
      httpGet(user.getUserList)
        .then(res => {
          let { status, data } = res;
          if (status === 200) {
            // 获取用户数据
            this.userEcho = data.data;
            // 回显数据
            this.userChangeModel.name = this.userEcho.name;
            this.userChangeModel.school = this.userEcho.school;
            this.userChangeModel.major = this.userEcho.major;
            this.userChangeModel.stuId = this.userEcho.stuId;
            this.userChangeModel.password = this.userEcho.password;
            this.photoUrl = this.userEcho.avatorUrl;
            this.photoUrlStyle =
              "backgroundImage:url('" + this.userEcho.avatorUrl + "')";
          }
        })
        .catch(err => {
          console.log(err);
        });
    },
    //#endregion

    //#region 点击保存按钮
    submit() {
      // 点击按钮开始表单验证
      this.$refs.userChangeFormRef
        .validate()
        .then(() => {
          // 收集数据
          let params = {
            stuId: this.userChangeModel.stuId,
            name: this.userChangeModel.name,
            school: this.userChangeModel.school,
            major: this.userChangeModel.major,
            password: this.userChangeModel.password,
            avatorUrl: this.photoUrl
          };
          // 发起请求修改个人信息
          httpPost(user.editUser, params)
            .then(res => {
              let { data } = res;
              // 提示用户
              message.success(data.msg);

              // 使用user组件的 modifyBack 功能
              this.$emit("modifyBack");
              this.$emit("getUsers");
            })
            .catch(err => {
              console.log(err);
            });
        })
        .catch(error => {
          console.log(error);
        });
    },
    //#endregion

    //#region  返回
    returnBack() {
      // 使用user组件传来的 returnBack 方法
      this.$emit("returnBack");
    },
    //#endregion

    //#region 上传图片

    // 上传图片
    uploadPhoto(e) {
      let that = this;
      var file = e.target.files[0]; //获取File对象，这里是上传单张图片，[0]代表第一张图片。如果多张，就是一个var file = e.target.files;
      message.success("正在上传图片中~请等待");
      // 获取token
      httpPost(user.getQiNiuToken).then(res => {
        console.log(res.data.token);

        var config = {
          useCdnDomain: true,
          region: qiniu.region.z2
        };
        var putExtra = {
          fname: "",
          params: {},
          mimeType: [] || null
        };
        var observable = qiniu.upload(
          file,
          "photo" + file.name,
          res.data.token,
          putExtra,
          config
        );
        var observer = {
          // next: 接收上传进度信息的回调函数
          next() {
            // message.success('请等待');
          },
          // error: 上传错误后触发
          error(err) {
            message.success("上传图片失败");
            console.log(err);
          },
          // complete: 接收上传完成后的后端返回信息
          complete(res) {
            message.success("上传图片成功");
            // JSON.stringify() 方法用于将 JavaScript 值转换为 JSON 字符串。
            // JSON.parse() 方法用于将一个 JSON 字符串转换为对象
            let key = JSON.parse(JSON.stringify(res)).key;
            let photoUrl = "http://qpv22vg9j.hn-bkt.clouddn.com/" + key;
            // 储存数据路径
            that.photoUrl = photoUrl;
            that.photoUrlStyle = "backgroundImage:url('" + photoUrl + "')";
          }
        };
        var subscription = observable.subscribe(observer); // 上传开始
        console.log(subscription);
      });
    }

    //#endregion
  }
};
</script>

<style lang="scss" scoped>
@import "../assets/common.scss";
// 修改个人信息
.userChange {
  margin: 0px auto;
  padding: 20px;
  color: $black;
  box-sizing: border-box;
  border-radius: 5px;
  // 头像
  .headPortrait {
    position: relative;
    display: block;
    width: 100px;
    height: 100px;
    margin: 0px auto;
    text-align: center;
    line-height: 100px;
    color: #fff;
    background-image: url("http://qlksuv5kc.hn-bkt.clouddn.com/photomao.jpg");
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
  .headPortrait:hover {
    &::after {
      display: block;
      position: absolute;
      z-index: 2;
      content: "修改头像";
      width: 96px;
      height: 96px;
      line-height: 100px;
      border-radius: 50%;
      background: rgba(0, 0, 0, 0.5);
    }
  }
  // 输入列
  .userInput {
    width: 555px;
    margin: 20px auto;
    span {
      margin: 0 5px;
      vertical-align: middle;
      color: $light;
      font-size: 16px;
    }
    .warn {
      color: #aaa;
      font-size: 12px;
    }
    input {
      height: 40px;
      width: 230px;
      padding-left: 10px;
      border-radius: 5px;
      border: 0px solid #ccc;
      background: #fff;
      outline: none;
    }
  }
  // 只读输入框
  .readOnly {
    input {
      color: #999;
      background: $blank;
    }
  }
  // 按钮组
  .btnGroup {
    width: 260px;
    height: 35px;
    margin: 50px auto 20px auto;
    // 单按钮
    .btn {
      display: block;
      float: right;
      width: 120px;
      height: 35px;
      margin-left: 8px;
      color: #fff;
      text-align: center;
      font-size: 14px;
      line-height: 35px;
      background: $blue;
      border-radius: 5px;
      cursor: pointer;
      &:hover {
        opacity: 0.8;
      }
    }
  }
}
// ant design样式
.avatar-uploader > .ant-upload {
  width: 50px;
  height: 50px;
}
.ant-upload-select-picture-card {
  img {
    width: 100px;
    height: 100px;
  }
  i {
    font-size: 16px;
    color: #999;
  }
  .ant-upload-text {
    margin-top: 8px;
    color: #666;
  }
}
</style>
