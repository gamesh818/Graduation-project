// 收藏教室集合
var mongoose = require('mongoose');
let ObjectId = mongoose.Schema.Types.ObjectId;


// 收藏教室集合
const collectRoomList = new mongoose.Schema({
    // 发起审核请求的学生ID
    stuInfo: {
        type: ObjectId,
        ref: 'student'
    },
    // 包含用户收藏的所有自习室Id
    collectRidList: [
        {
            collectRid: {
                type: ObjectId,
                ref: 'hasRoom'
            }
        }
    ],
});

mongoose.model('collectRoomList', collectRoomList);



