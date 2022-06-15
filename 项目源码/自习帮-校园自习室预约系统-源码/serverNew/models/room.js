var mongoose = require('mongoose');

// 未创建的自习室
// 固定自习室的信息，这个表只能查询不能修改

const roomSchema = new mongoose.Schema({
    // 自习室ID
    rid: {
        type: Number,
        required: true
    },
    // 自习室号
    number: {
        type: Number,
        required: true
    },
    // 自习室地点
    build: {
        type: String,
        required: true
    },
    // 自习室楼层
    floor: {
        type: Number,
        required: true
    },
    // 自习室座位数
    allSeats: {
        type: Number,
        required: true
    }
})

// 查询是否有数据
roomSchema.statics.findBt = function (cb) {
    // 查询是否有数据
    let isFlag = this.find({}, cb).lean()
}


let room = mongoose.model('room', roomSchema);

// 初始化10个教室
room.findBt(function (err, item) {
    if (item.length > 0) {
        // 如果存在数据则不需要创建
    } else {
        // 如果没有初始化数据 则新建文档
        room.create({
                rid: 1,
                number: 1,
                build: "一公教",
                floor: 1,
                allSeats: 55
            },
            {
                rid: 2,
                number: 2,
                build: "一公教",
                floor: 1,
                allSeats: 55
            },
            {
                rid: 3,
                number: 3,
                build: "一公教",
                floor: 1,
                allSeats: 55
            },
            {
                rid: 4,
                number: 4,
                build: "一公教",
                floor: 1,
                allSeats: 55
            },
            {
                rid: 5,
                number: 1,
                build: "一公教",
                floor: 2,
                allSeats: 55
            },
            {
                rid: 6,
                number: 2,
                build: "一公教",
                floor: 2,
                allSeats: 55
            },
            {
                rid: 7,
                number: 1,
                build: "二公教",
                floor: 2,
                allSeats: 55
            },
            {
                rid: 8,
                number: 2,
                build: "二公教",
                floor: 2,
                allSeats: 55
            },
            {
                rid: 9,
                number: 3,
                build: "二公教",
                floor: 2,
                allSeats: 55
            },
            {
                rid: 10,
                number: 4,
                build: "二公教",
                floor: 2,
                allSeats: 55
            },)
    }


})


