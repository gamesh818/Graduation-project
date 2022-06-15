var mongoose = require('mongoose');

// 已经开放的自习室
var roomSchema = new mongoose.Schema({
    // 自习室ID
    roomInfo: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'room'
    },
    // 创建自习室的用户ID
    stuInfo: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'student'
    },
    // 创建自习室的月份
    moon: {
        type: Number
    },
    // 创建自习室的日
    day: {
        type: Number
    },
    // 所在教室的学生ID数组
    studentId: {
        type: Array
    },
    // 所在教室的学生的信息数组 包括（名字，座位号，性别）
    seatsLists: {
        type: Array
    },
    // 已创建自习室的标题
    title: {
        type: String
    },
    // 已创建自习室的简介
    action: {
        type: String
    },
    // 是否开启审核
    roomAudit: {
        type: Boolean,
        default: false
    }
});
mongoose.model('hasRoom', roomSchema);

// roomSchema.index({ name: 1, type: -1 });

