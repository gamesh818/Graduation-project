// 待审核表
const mongoose = require('mongoose');
let ObjectId = mongoose.Schema.Types.ObjectId;


// 待审核表
const reviewRoomList = new mongoose.Schema({
    // 发起审核请求的学生ID
    stuInfo: {
        type: ObjectId,
        ref: 'student'
    },
    verifier: {
        type: ObjectId,
        ref: 'student'
    },
    // 待审核自习室ID
    roomRecord: {
        type: ObjectId,
        ref: 'hasRoom'
    },
    // 待审核自习室座位号
    seatIndex: {
        type: Number
    },
    // 是否已通过审核
    reject: {
        type: Boolean
    },
    // 时间戳
    date: {
        type: String
    }
});

mongoose.model('reviewRoomList', reviewRoomList);





