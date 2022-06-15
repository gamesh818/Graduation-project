var mongoose = require('mongoose');

let ObjectId = mongoose.Schema.Types.ObjectId;
// 学生信息 学号、头像、姓名、性别、学校、专业、密码、已预约自习室信息、收藏夹
var studentSchema = new mongoose.Schema({
    // 学号
    stuId: {
        type: Number,
        required: true
    },
    // 密码
    password: {
        type: String,
        required: true
    },
    // 姓名
    name: {
        type: String,
        required: true
    },
    // 性别
    sex: {
        type: String,
        required: true
    },
    // 头像
    avatorUrl: {
        type: String,
        default: "https://ss1.bdstatic.com/70cFuXSh_Q1YnxGkpoWK1HF6hhy/it/u=2323437359,2829288646&fm=26&gp=0.jpg"
    },
    // 学校
    school: {
        type: String,
        required: true
    },
    // 专业
    major: {
        type: String,
        required: true
    },
    // // 收藏的自习室id列表
    // collectRoomLists: [{
    //     roomRecord: {
    //         type: ObjectId,
    //         ref: 'hasroom'
    //     }
    // }],
    // // 已经预约的自习室和座位列表
    // hasRoomLists: [{
    //     roomRecord: {
    //         type: ObjectId,
    //         ref: 'hasroom'
    //     },
    //     seatIndex: {
    //         type: Number
    //     },
    //     isCreater: {
    //         type: Boolean,
    //         default: false
    //     }
    // }],
    // // 审核中的自习室
    // reviewRoomLists: [{
    //     roomRecord: {
    //         type: ObjectId,
    //         ref: 'hasroom'
    //     },
    //     seatIndex: {
    //         type: Number
    //     },
    //     reject: {
    //         type: Boolean,
    //         default: false
    //     }
    // }],
    // // 创建的自习室
    // remind: [{
    //     stuInfo: {
    //         type: ObjectId,
    //         ref: 'student'
    //     },
    //     roomInfo: {
    //         type: ObjectId,
    //         ref: 'hasroom'
    //     },
    //     seatIndex: {
    //         type: Number
    //     },
    //     date: {
    //         type: Number
    //     }
    // }],
    // // 点赞
    // praise: {
    //     type: Number,
    //     default: 0
    // },
    // // 点赞的用户信息
    // praiseStuLists: []
});

mongoose.model('student', studentSchema);
