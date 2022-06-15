// 关于用户的接口
export const user = {
  loginUser: "login", // 用户登录
  registerUser: "register", //注册账号
  getUserList: "user", //获取学生个人信息
  getOneUser: "oneUser", // 获取ID学生个人信息
  delColList: "delCollectList", //删除已经收藏的自习
  deleteHasRoom: "deleteHasRoom", //删除已经加入的自习（已预约）
  delRevList: "delReviewList", //删除正在审核的自习
  getTodayList: "getTodayHasRoom", //获取今天已经预约的自习情况
  getRemind: "remind", // 获取信息提醒数量
  editUser: "modify", // 修改个人信息
  getQiNiuToken: "getQiNiuToken", // 获取千牛token
  loginOut: "edit", //退出登录
  getHasRoomList: "/getHasRoomList", //获取已预约的自习室列表
  getReviewRoomList: "/getReviewRoomList", //获取已预约的自习室列表
  getCollectRoomList: "/getCollectRoomList"
};

// 教室功能接口
export const rooms = {
  getRoom: "getRoomLists", // 获取教室列表
  getRoomDetail: "getRoom", // 获取教室信息
  addAdmin: "addAdmin", // 添加自习室
  addRoom: "addRoom", // 加入自习室
  addStar: "addStar", // 收藏自习室
  getMySeatIndex: "getMySeatIndex" //获取自己在自习室的座位
};

// 拓展功能接口
export const expand = {
  getRankingList: "getRankLists", // 获取排行榜列表
  getLikeTheList: "clickPromise" // 排行榜点赞
};

// 对话功能接口
export const chat = {
  getChatList: "chatLists", //获取聊天列表
  getChatInfo: "chatInfo", //获取聊天详细信息
  getRemindLists: "remindLists" //获取申请列表
};

// 自习室功能接口
export const apply = {
  getDisagree: "disagree", //拒绝加入申请
  getAgree: "agree" //同意加入申请
};
