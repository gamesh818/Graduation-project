const mongoose = require('mongoose');
const Student = mongoose.model('student');
const chat = require('./chat');
const student = require("./student");
const room = mongoose.model('room');
const hasRoomLists = mongoose.model('hasRoomLists');
const reviewRoomList = mongoose.model('reviewRoomList');
const collectRoomList = mongoose.model('collectRoomList')
const praiseStuLists = mongoose.model('praiseStuLists')
/**
 * 封装一系列和用户有关的方法
 */

//#region 登陆 (更新完毕)
module.exports.login = async function (params, ctx) {
    let docs = await Student.find({
        stuId: params.stuId,
        password: params.password
    }, '-password').lean()
    if (docs.length) {
        // ctx.cookies.set('stuId', params.stuId);
        // global.stuId = params.stuId

        // 登录时查询本用户是否在排行榜内 如果不在 则添加信息
        // 给新的用户添加排行榜
        let findPra = await praiseStuLists.find({'praiseList.stuInfo': docs[0]._id}).lean()
        // 如果用户不在排行榜中 给他加入
        if (findPra.length <= 0) {
            await praiseStuLists.update({}, {
                $push: {
                    praiseList: {
                        stuInfo: docs[0]._id,
                        praise: 0,
                        praiseStu: []
                    }
                },
            })
        }


        return {
            success: true,
            stuId: params.stuId,
            msg: '登陆成功'
        }
    } else {
        return {
            success: false,
            msg: '账号或密码错误'
        }
    }
}
//#endregion

//#region 注册(更新完毕)
module.exports.register = async function (params) {
    try {
        // 查找是否有这个学号已经注册过了
        let isNew = await Student.find({
            stuId: params.stuId
        });
        if (!isNew.length) {
            // 创建新的用户集合
            let result = await Student.create(params)
            return true;
        } else {
            return false;
        }
    } catch (err) {
        console.log(err);
    }
}
//#endregion

//#region 修改个人资料(更新完毕)

module.exports.modify = async function (params) {
    // 如果学号存在则修改信息
    let hasStudent = await Student.find({stuId: global.stuId});
    if (hasStudent.length) {
        let hasSave = await Student.update({stuId: global.stuId}, {$set: params});
        return {
            success: true,
            hasSave: hasSave,
            msg: '修改个人信息成功'
        }
    } else {
        return {
            success: false,
            msg: '修改个人信息失败'
        };
    }
}

//#endregion

//#region 获取当前用户资料(更新完毕)
module.exports.getUser = async () => {
    let getInfo = await Student.findOne({stuId: global.stuId})
    return getInfo;
}
//#endregion

//#region 获取准确id用户资料 (更新完毕)
module.exports.getOneUser = async (params) => {
    let getInfo = await Student.findOne({stuId: params.stuId})
    return getInfo;
}
//#endregion

//#region 获取提示数量，0表示没有提示 （更新完毕）
module.exports.remind = async (params) => {
    try {
        let moon = new Date().getMonth() + 1;
        let day = new Date().getDate();
        // 获取当前用户的信息
        let stuInfo = await this.getUser();

        let remind = await reviewRoomList.find({verifier: stuInfo._id}).populate({
            path: 'roomRecord'
        }).lean()
        // 只提醒今天的信息
        let newRemind = remind.filter(item => {
            return item.roomRecord.moon === moon && item.roomRecord.day === day
        })
        let num = newRemind.length
        // 查找是否有消息记录没有读取 nosee
        let chatLists = await chat.getChatLists()
        chatLists.map(item => {
            // 如果有则让数字++
            if (item.noSee) num++;
        })
        return num;
    } catch (err) {
        throw err;
    }
}

//#endregion

//#region  获取排行榜列表和自己的排行榜名次(更新完毕)
module.exports.rankLists = async (params) => {
    console.log(params)
    let selfRank, selfInfo;
    let rankLists = []
    let day = new Date().getDate();
    ////////////////////////////////////////
    // 1.查询排行榜数据

    let MyStuInfo = await this.getUser()

    let praiseInfo = await praiseStuLists.findOne({})
        .populate('praiseList.stuInfo', '_id stuId name school major').lean()

    let inHasRoomList = await hasRoomLists.find({}).populate({
        path: 'stuInfo',

    }).lean()

    praiseInfo.praiseList.map(async (item, index) => {
        rankLists.push(item)
        let hasRoomNum = inHasRoomList.filter(item1 => {
            return item1.stuInfo._id.equals(item.stuInfo._id)
        })
        // 获取自习数量
        rankLists[index].hasNumber = hasRoomNum.length
        //添加自己的信息
        if (item.stuInfo.stuId === global.stuId) {
            selfRank = index;
            selfInfo = item;
        }
        // 判断是否已经点赞
        rankLists[index].isPraise = false
        rankLists[index].praiseStu.map(st => {
            // 判断是不是本人 如果是 且 日期是今天点赞的 则视为已点赞
            if (st.stuId === MyStuInfo.id && st.day === day) {
                rankLists[index].isPraise = true
            }
        })

    })

    rankLists.sort((a, b) => {
        // 按照自习数量进行排序
        return b.hasNumber - a.hasNumber
    })

    return {
        success: true,
        msg: '获取列表成功',
        data: {
            rankLists: rankLists,
            selfRank: selfRank,
            selfInfo: selfInfo
        }

    }
    ///////////////////////////////////////


    // 查询所有学生的信息
    // let stuInfo = await Student.find({}, "stuId name major school hasRoomLists praise praiseStuLists")
    //     .populate({
    //         path: 'hasRoomLists',
    //     }).lean();
    //
    // let rankLists = stuInfo.sort(function (a, b) {
    //     // 根据数量排序
    //     return b.hasRoomLists.length - a.hasRoomLists.length
    // }).map((stu, index) => {
    //     if (stu.stuId === global.stuId) {
    //         selfRank = index;
    //         selfInfo = stu;
    //     }
    //     stu['hasNumber'] = stu.hasRoomLists.length;
    //     delete stu.hasRoomLists;
    //     // 判断是否已经点赞
    //     stu['isPraise'] = stu.praiseStuLists && stu.praiseStuLists.indexOf(global.stuId) >= 0;
    //
    //     delete stu.praiseStuLists;
    //     return stu;
    // });
    // return {
    //     rankLists: rankLists,
    //     selfRank: selfRank,
    //     selfInfo: selfInfo
    // }
}

//#endregion

//#region 排行榜点赞(更新完毕)
module.exports.clickPromise = async (params) => {
    // 被点赞者 praise +1 ，lists里面加入点击者id
    try {
        console.log(params)
        let now = new Date();
        let date = now.getDate(); //得到日期
        // 获取指定ID的学生信息
        let InStuInfo = await this.getOneUser({stuId: params.stuId})
        // 获取本人的信息
        let myStuInfo = await this.getUser()
        // 添加赞数量 和 点赞的学生ID 与 点赞时的号数（时间）
        await praiseStuLists.updateOne({"praiseList.stuInfo": InStuInfo._id}, {
                $pull: {'praiseList.$.praiseStu': {stuId: myStuInfo._id}}
            }
        );
        await praiseStuLists.updateOne({"praiseList.stuInfo": InStuInfo._id}, {
                $push: {'praiseList.$.praiseStu': {stuId: myStuInfo._id, day: date}},
                $set: {'praiseList.$.praise': Number(params.praise)}
            }
        );
        return {
            msg: "点赞成功",
        }
    } catch
        (error) {
        throw error;
    }
}

//#endregion

//#region 获取提醒的列表信息 (更新完毕)
module.exports.remindLists = async (params) => {
    try {
        let now = new Date();
        let month = now.getMonth() + 1; //得到月份
        let date = now.getDate(); //得到日期
        // 获取当前用户数据
        let stuInfo = await this.getUser();
        // 查找当前学生的负责的审核信息
        let isReviewRoomLists = await reviewRoomList.find({
            verifier: stuInfo._id,
            // roomRecord: {day: date, moon: month}
        }).populate([{
            path: 'roomRecord',
            // match: {day: date, moon: month},
            populate: {
                path: 'roomInfo',
            }
        }, {
            path: 'stuInfo',
        }])


        // 获取新的消息
        let chatLists = await chat.getChatLists();


        if (chatLists.length <= 0) {
            return isReviewRoomLists
        }

        let newArr = isReviewRoomLists.concat(chatLists);

        // 按时间排序
        let newArr2 = newArr.sort(function (a, b) {
            let newA = a.date ? a.date : a.lastlist.date;
            let newB = b.date ? b.date : b.lastlist.date;
            return newB - newA;
        })

        return newArr2;
    } catch (err) {
        throw err;
    }
}

//#endregion

//#region 获取已预约的列表信息(更新完毕)
module.exports.getHasRoomList = async (params) => {
    // 获取本人的信息
    let stuInfo = await this.getUser();
    // 获取本人的预约列表
    let inHasRoomList = await hasRoomLists.find({
        stuInfo: stuInfo._id
    }).populate([{
        path: 'hasRoomInfo',
        populate: {
            path: 'roomInfo'
        }
    }])

    return {
        success: true,
        data: inHasRoomList,
        msg: '获取已预约自习室列表成功'
    }
}

//#endregion

//#region 获取待审核的列表信息(更新完毕)
module.exports.getReviewRoomList = async (params) => {
    // 获取本人的信息
    let stuInfo = await this.getUser();
    // 获取本人的预约列表
    let inReviewRoomList = await reviewRoomList.find({
        stuInfo: stuInfo._id
    }).populate([{
        path: 'roomRecord',
        populate: {
            path: 'roomInfo'
        }
    }]).lean();

    return {
        success: true,
        data: inReviewRoomList,
        msg: '获取待审核自习室列表成功'
    }
}
//#endregion

//#region 获取已收藏的自习室的列表信息(更新完毕)
module.exports.getCollectRoomList = async (params) => {

    let stuInfo = await student.getUser()

    let inCollectRoomList = await collectRoomList.find({
        stuInfo: stuInfo._id
        // 关联数组中的populate
    }, 'collectRidList').populate({
        path: 'collectRidList.collectRid',
        populate: {
            path: 'roomInfo'
        }
    }).lean()

    return {
        success: true,
        data: inCollectRoomList,
        msg: '获取已收藏自习室列表成功'
    }
}

//#endregion






