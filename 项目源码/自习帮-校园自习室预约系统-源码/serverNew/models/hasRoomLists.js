// 预约自习室表
var mongoose = require('mongoose');
let ObjectId = mongoose.Schema.Types.ObjectId;


// 预约自习室表
var hasRoomLists = new mongoose.Schema({
    // 预约自习室的学生的id
    stuInfo: {
        type: ObjectId,
        ref: 'student'
    },
    // 已预约自习室的ID
    hasRoomInfo: {
        type: ObjectId,
        ref: 'hasRoom'
    },
    // 已预约自习室的座位号
    seatIndex: {
        type: Number,
    },
    // 是否为已预约自习室的管理员
    isCreate: {
        type: Boolean,
    }
});

// module.exports =
mongoose.model('hasRoomLists', hasRoomLists);
