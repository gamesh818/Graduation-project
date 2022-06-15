<template>
  <div class="login">
    <div class="icon">
      <div class="imgIcon">
        <!-- 登录表单的logo -->
        <img src="@/assets/img/logo.png" alt />
      </div>
      <!-- 登陆 -->
      <div v-if="isLogin">
        <a-form :model="formModal" :rules="loginRules" ref="loginFormRef">
          <a-form-item name="stuId" class="column">
            <a-input
              v-model:value="formModal.stuId"
              placeholder="请输入学号（纯数字）"
            />
            <img src="@/assets/img/login/stuId.png" alt />
          </a-form-item>
          <a-form-item name="password" class="column">
            <a-input
              type="password"
              v-model:value="formModal.password"
              placeholder="请输入密码"
            />
            <img src="@/assets/img/login/password.png" alt />
          </a-form-item>
          <a-button type="primary" class="loginBtn" @click="loginSubmit"
            >确定</a-button
          >
          <div class="btnBottom">
            <a class="register" @click="register">
              <i class="registerIcon">☞</i> 没有账号？赶快注册
            </a>
          </div>
        </a-form>
      </div>
      <!--注册 -->
      <div v-else>
        <a-form
          :model="registerModel"
          :rules="registerRules"
          ref="registerFormRef"
        >
          <a-form-item name="stuId" class="column">
            <a-input
              v-model:value="registerModel.stuId"
              placeholder="请输入学号（纯数字）"
            />
            <img src="@/assets/img/login/stuId.png" alt />
          </a-form-item>
          <a-form-item name="name" class="column">
            <a-input
              v-model:value="registerModel.name"
              placeholder="请输入姓名"
            />
            <img src="@/assets/img/login/user.png" alt />
          </a-form-item>

          <a-form-item name="sex" class="column">
            <a-select
              placeholder="请输入性别"
              v-model:value="registerModel.sex"
              style="
                width: 230px;
                border-radius: 5px;
                border: 2px solid #bbb;
                color: #666;
              "
            >
              <a-select-option value="男">男</a-select-option>
              <a-select-option value="女">女</a-select-option>
            </a-select>
            <img src="@/assets/img/login/sex-1.png" alt />
          </a-form-item>

          <a-form-item name="school" class="column">
            <a-input
              v-model:value="registerModel.school"
              placeholder="请输入学校名称"
            />
            <img src="@/assets/img/login/school.png" alt />
          </a-form-item>
          <a-form-item name="major" class="column">
            <a-input
              v-model:value="registerModel.major"
              placeholder="请输入专业名称"
            />
            <img src="@/assets/img/login/major.png" alt />
          </a-form-item>
          <a-form-item name="password" class="column">
            <a-input
              v-model:value="registerModel.password"
              placeholder="请输入密码"
            />
            <img src="@/assets/img/login/password.png" alt />
          </a-form-item>
          <a-button type="primary" class="loginBtn" @click="registration"
            >注册</a-button
          >
          <div class="btnBottom">
            <a class="register" @click="loginPage">👴 已有账号，传送至登陆</a>
          </div>
        </a-form>
      </div>
    </div>
    <!-- 背景图片右 -->
    <img
      class="backgroundImageRight"
      src="@/assets/img/pic/clock-yes.png"
      alt
    />
    <!-- 背景图片左 -->
    <img class="backgroundImageLeft" src="@/assets/img/pic/clock-no.png" alt />
  </div>
</template>

<script>
// 引入http方法
import { httpPost } from "@/utils/http";
// 引入接口
import { user } from "@/api";
// 引入全局提示消息框
import { message } from "ant-design-vue";

export default {
  data() {
    //#region   账号验证规则
    let validateName = async (rule, value) => {
      if (value === "") {
        return Promise.reject("请输入你的学号！");
      } else {
        if (isNaN(value)) {
          return Promise.reject("学号只能为数字！");
        } else if (value.length > 15) {
          return Promise.reject("学号最多为15位！");
        } else if (value.length < 6) {
          return Promise.reject("学号至少为6位！");
        }
        return Promise.resolve();
      }
    };
    //#endregion

    return {
      //#region 登陆表单模型与规则
      formModal: {
        stuId: "",
        password: ""
      },
      loginRules: {
        password: [
          { required: true, message: "请输入你的密码", trigger: "blur" },
          { min: 6, max: 18, message: "密码长度为6到18", trigger: "blur" }
        ],
        stuId: [{ validator: validateName, trigger: "change" }]
      },
      //#endregion
      //#region 注册表单模型与规则
      registerModel: {
        name: "",
        password: "",
        stuId: "",
        school: "",
        major: "",
        sex: "男"
      },
      registerRules: {
        stuId: [{ validator: validateName, trigger: "change" }],
        name: [
          { required: true, message: "请输入你姓名", trigger: "blur" },
          { min: 1, max: 10, message: "用户名长度为1到10", trigger: "blur" }
        ],
        sex: [{ required: true, message: "请输入你的性别", trigger: "blur" }],
        school: [
          { required: true, message: "请输入你的学校名称", trigger: "blur" }
        ],
        major: [{ required: true, message: "请输入你的专业", trigger: "blur" }],
        password: [
          { required: true, message: "请输入你的密码", trigger: "blur" },
          { min: 6, max: 18, message: "密码长度为6到18", trigger: "blur" }
        ]
      },
      //#endregion
      //#region  isLogin是true时为登录  isLogin是flase时为登录
      isLogin: true
      //#endregion
    };
  },
  methods: {
    //#region 注册切换
    register() {
      this.isLogin = false;
    },
    //#endregion
    //#region  注册切换
    loginPage() {
      this.isLogin = true;
    },
    //#endregion
    //#region  登录
    loginSubmit() {
      // 自定义表单验证
      this.$refs.loginFormRef
        .validate()
        // 通过验证
        .then(() =>
          // 发起登录请求
          httpPost(user.loginUser, {
            stuId: this.formModal.stuId,
            password: this.formModal.password
          })
            .then(res => {
              let { data } = res;
              if (data.success) {
                // 设置一个sessionStorage(sessionStorage存储数据的时间是打开浏览器存储 关闭浏览器 数据消失)
                window.sessionStorage.setItem("stuId", res.data.stuId);
                //  路由跳转到首页
                this.$router.push({
                  path: "/",
                  query: { stuId: this.formModal.stuId }
                });
                // 登录成功提醒
                message.success(data.msg);
              } else {
                // 登录失败提醒
                message.error(data.msg);
              }
            })

            .catch(err => {
              console.log(err);
            })
        )
        //未通过验证
        .catch(err => {
          console.log(err);
        });
    },
    //#endregion

    //#region 注册
    registration() {
      // 自定义表单验证
      this.$refs.registerFormRef
        .validate()
        .then(() => {
          // 获取注册表单的值
          let fromData = {
            stuId: this.registerModel.stuId,
            name: this.registerModel.name,
            password: this.registerModel.password,
            school: this.registerModel.school,
            major: this.registerModel.major,
            sex: this.registerModel.sex
          };
          // 发起注册的请求
          httpPost(user.registerUser, fromData).then(res => {
            let { data } = res;
            if (data.sucess) {
              // 清空表单
              this.$refs.registerFormRef.resetFields();
              // 返回登陆页
              this.isLogin = true;
              message.success(data.msg);
            } else {
              message.error(data.msg);
            }
          });
        })
        .catch(err => {
          //未通过验证
          console.log(err);
        });
    }
    //#endregion
  }
};
</script>

<style lang="scss" scoped>
@import "@/assets/common.scss";
.login {
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
  background-color: #eee;
  // margin-top: -48px;
  background-image: url(../assets/img/login/bg.svg);
  .bg {
    position: fixed;
    width: 100%;
    height: 100%;
  }
  .backgroundImageRight {
    position: absolute;
    bottom: -25px;
    right: 300px;
    width: 400px;
    height: 400px;
    opacity: 0.9;
    animation: moveup ease-in 1s;
  }
  .backgroundImageLeft {
    position: absolute;
    bottom: -20px;
    left: 300px;
    width: 400px;
    height: 400px;
    opacity: 0.9;
    animation: moveup ease-in 1s;
  }

  @keyframes moveup {
    0% {
      bottom: -400px;
    }
    100% {
      bottom: -100px;
    }
  }
  .icon {
    position: absolute;
    top: 50%;
    left: 50%;
    z-index: 10;
    width: 350px;
    margin-left: -150px;
    overflow: hidden;
    transform: translateY(-50%);
    border-radius: 9px;
    text-align: center;
    border: 2px solid #ddd;
    box-shadow: 0 0 10px 2px rgba(0, 0, 0, 0.1);
    background: #fff;
    .errMsg {
      display: block;
      margin: 10px auto;
      font-size: 12px;
      color: #dc143c;
    }
    .imgIcon {
      width: 100%;
      height: 70px;
      background: $blue;
      img {
        width: 100px;
        height: 35px;
        margin: 17px auto;
      }
      p {
        font-size: 14px;
        line-height: 1;
        color: $black;
      }
    }
  }
  .column {
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 20px auto;
    img {
      float: left;
      width: 33px;
      height: 33px;
      margin-top: 3.5px;
      margin-right: 10px;
      opacity: 0.9;
    }
    input {
      width: 230px;
      height: 36px;
      border-radius: 5px;
      border: 2px solid #bbb;
      box-shadow: 0;
      padding-left: 10px;
      color: #666;
    }
  }
  .loginBtn {
    display: block;
    width: 280px;
    height: 40px;
    margin: 25px auto;
    font-size: 14px;
    line-height: 40px;
    color: #ffffff;
    border-radius: 5px;
    background: $blue;
    cursor: pointer;
    &:hover {
      opacity: 0.9;
    }
  }
  .btnBottom {
    .register {
      display: block;
      position: relative;
      font-size: 13px;
      margin: 0 0 20px 0;
      color: #888888;
      cursor: pointer;
      .registerIcon {
        position: absolute;
        top: -2px;
        left: 90px;
      }
      &:hover {
        color: $blue;
      }
    }
  }
}
/deep/.ant-select-single:not(.ant-select-customize-input).ant-select-selector {
  border: 0px solid#d9d9d9;
}
</style>
