// 收藏教室集合
const mongoose = require('mongoose');
let ObjectId = mongoose.Schema.Types.ObjectId;

// 段位榜单集合
const praiseStuLists = new mongoose.Schema({
    praiseList: [
        {
            // 被点赞的学生ID
            stuInfo: {
                type: ObjectId,
                ref: 'student'
            },
            // 点赞次数
            praise: {
                type: Number,
                default: 0
            },
            praiseStu: [
                {
                    // 点赞人
                    stuId: {
                        type: String,
                    },
                    // 点赞的日期为几号
                    day: {
                        type: Number
                    }
                }
            ]
        }
    ]
});

// 查询是否有数据
praiseStuLists.statics.findBt = function (cb) {
    // 查询是否有数据
    let isFlag = this.find({}, cb).lean()
}

let praise = mongoose.model('praiseStuLists', praiseStuLists);


// 创建初始的数据文档
praise.findBt(function (err, item) {
    if (item.length > 0) {
        // 如果存在数据则不需要创建
    } else {
        // 如果没有初始化数据 则新建文档
        praise.create({
            praiseList: [],
        })
    }
})
