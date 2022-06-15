const mongoose = require('mongoose');
const hasRoom = mongoose.model('hasRoom');
const Room = mongoose.model('room');
const hasRoomLists = mongoose.model('hasRoomLists');
const reviewRoomList = mongoose.model('reviewRoomList');
const collectRoomList = mongoose.model('collectRoomList');

const Student = mongoose.model('student');

let student = require('./student');
const stu = require('./student');
const {log} = require("nodemon/lib/utils");


//#region 获取自习室列表(更新完毕)
module.exports.getRoomLists = async (params) => {
    // console.log(params)
    let roomIdLists, roomInfoLists;
    let resultLists = [];//存放结果
    async function searchRoomLists(matchParams) {
        // console.log(matchParams, 'dadada')
        // 获取今日 且是筛选条件中教室
        roomIdLists = await hasRoom.find({
            moon: params.moon,
            day: params.day
        }).populate([{
            path: 'roomInfo',
            // match: { build: params.build, floor: params.floor },
            match: matchParams,
            select: 'rid number build floor allSeats'
        }, {
            path: 'stuInfo',
            select: 'name stuId -_id'
        }]).lean()
        // 过滤不符合的自习室，同时按照教室号排序,这是已经有的自习室
        roomIdLists = roomIdLists.filter((value) => {
            // 如果信息不为null 则添入数组
            return value.roomInfo != null;
            // 初步排序已创建教室信息
        }).sort(function (a, b) {
            let aBuild = a.roomInfo.build === '一公教' ? 1 : 2
            let bBuild = b.roomInfo.build === '一公教' ? 1 : 2
            if (aBuild === bBuild) {
                if (a.roomInfo.floor === b.roomInfo.floor) {
                    return a.roomInfo.number > b.roomInfo.number
                } else {
                    return a.roomInfo.floor > b.roomInfo.floor
                }
            } else {
                return aBuild > bBuild
            }
        });

        // 查询出对应的未创建固定自习室信息
        roomInfoLists = await Room.find(matchParams).lean()


        //////////////////////////////////////
        // 储存排序后的未创建的教室列表
        let ddd = []
        // 按照rid排序未创建的教室列表 保证顺序正确
        roomInfoLists = roomInfoLists.sort(function (a, b) {
            return a.rid - b.rid
        })
        // 统一加一个roomInfo对象
        roomInfoLists.map((item1) => {
            ddd.push({roomInfo: item1})
        })

        roomIdLists.map((item) => {
            ddd.map((item1, index) => {
                // 在已创建的列表对比未创建的教室的rid 如果相同 则替换掉未创建列表中的教室数据 即可保证顺序正确
                if (item1.roomInfo.rid === item.roomInfo.rid) {
                    ddd.splice(index, 1, item)
                }
            })
        })
        resultLists = ddd
        // console.log('//////////////////////////////////////')
        // console.log(resultLists)
        //////////////////////////////////////
    }

    // 根据筛选条件的不同，传入不同的参数
    if (params.build === "不限" && params.floor === "不限") {
        await searchRoomLists({})
    } else if (params.build === "不限") {
        await searchRoomLists({floor: params.floor})
    } else if (params.floor === "不限") {
        await searchRoomLists({build: params.build})
    } else {
        await searchRoomLists({build: params.build, floor: params.floor})
    }


    // 新
    // 为空时 输入所有未创建教室
    // if (roomIdLists.length === 0) {
    //     roomInfoLists.map((roomInfo) => {
    //         return resultLists.push({roomInfo})
    //     })
    //     return resultLists
    // }

    return resultLists
}

//#endregion

//#region 创建自习室(更新完毕)
module.exports.creatRoom = async (params) => {
    // console.log('创建')
    console.log(params);

    try {
        // 判断是否已经被创建
        let noBlank = await hasRoom.findOne({roomInfo: params.roomId, moon: params.moon, day: params.day});

        if (!noBlank) {
            // 查询创建者信息
            let stuInfo = await stu.getUser(params);
            // 查询创建者是否创建了 当前这间自习室
            var hasRoomChak = await hasRoomLists.find({
                stuInfo: stuInfo._id
            }).populate({
                path: 'hasRoomInfo',
                select: 'moon day -_id'
            });
            // 查询创建者是否已经发起申请预约自习室的请求
            let reviewRoom = await reviewRoomList.find(
                {stuInfo: stuInfo._id}).populate({
                path: 'roomRecord'
            })


            // isToadyHas：是否已经创建过一个自习室 如果创建 今日不可重复创建
            // isToadyReview:是否已经提交过自习室的申请 如果提交过 先删除这个申请才可以创建教室
            let isToadyHas = false
            let isToadyReview = false

            // 如果查找到这个自习室 则再对比日期 如果日期对比成功 则表示今天已经创建过这个自习室了  则设置isToadyHas的状态为true 表示已经创建过这个自习室
            if (hasRoomChak.length !== 0) {
                hasRoomChak.map(room => {
                    if (room.hasRoomInfo.moon == params.moon && room.hasRoomInfo.day == params.day) {
                        isToadyHas = true;
                    }
                })
            }

            // 如果查找到创建者今日有发起过预约自习室的请求 则设置isToadyReview状态为true 表示已经提交过自习申请
            if (reviewRoom.length !== 0) {
                reviewRoom.map(room => {
                    if (room.roomRecord.moon == params.moon && room.roomRecord.day == params.day) {
                        isToadyReview = true;
                    }
                })
            }
            // 其中一个不成立则无法创建教室
            if (isToadyHas) {
                return {
                    success: false,
                    msg: '您今天已经拥有一节自习，不可重复添加',
                }
            }
            if (isToadyReview) {
                return {
                    success: false,
                    msg: '您今天已经提交了一个自习申请，如需更换情先删除',
                }
            }

            // id绑定到hasroom上
            params['roomInfo'] = params.roomId;
            // 添加学生Id
            params['stuInfo'] = stuInfo._id;
            // 加入自习室的用户个人信息
            params['seatsLists'] = [];
            // 添加用户所在座位位置 和 用户id
            params.seatsLists.push(
                {
                    seat: params.seatIndex,
                    stuId: global.stuId,
                    sex: stuInfo.sex
                });

            // 创建教室记录
            let createRoom = new hasRoom(params);
            let roomrecord = await createRoom.save();

            // 用户信息记录写入加入自习列表
            let newHasroom = {
                stuInfo: stuInfo._id,
                hasRoomInfo: roomrecord._id,
                seatIndex: params.seatIndex,
                isCreate: true
            }
            let createHasRoomList = new hasRoomLists(newHasroom)
            let hasRoomRecord = await createHasRoomList.save();

            // let a = await Student.update({stuId: global.stuId}, {$push: {hasRoomLists: newHasroom}});

            return {
                success: true,
                msg: '自习室创建成功',
                roomId: roomrecord._id
            }
        } else {
            return {
                success: false,
                msg: "自习室已经被创建"
            }
        }

    } catch (err) {
        console.log(err);
    }
}
//#endregion

//#region 申请加入自习室（更新完毕）
module.exports.addRoom = async (params) => {
    // console.log(params);
    try {
        // 查询当前学生的信息
        let stuInfo = await stu.getUser();
        // 获取房间和申请者的信息
        let roomInfo = await hasRoom.findOne({_id: params.roomId}).populate('stuInfo');

        // 判断是否已经加入这个教室
        const isHas = await hasRoomLists.findOne({
            stuInfo: stuInfo._id,
            hasRoomInfo: params.roomId
        })
        if (isHas) return {success: false, msg: '已经加入过该自习室'}

        // 判断是否已经提交申请了
        let isRemind = await reviewRoomList.find({
            stuInfo: stuInfo._id,
            roomRecord: roomInfo._id
        })
        // true代表审核被拒绝 不应该触发提交过审核申请的提示
        let isRemindFlag = false

        console.log(isRemind[0].date)
        isRemind.sort((a, b) => {
            return a.date < b.date ? 1 : a.date > b.date ? -1 : 0;
        });


        if (isRemind[0] && !isRemind[0].reject) return {success: false, msg: '已经提交过申请，请耐心等待管理员审核通过'}
        // 查询已预约自习室表
        // 查询该用户是否已经加入过其他自习室
        let isHasRoomLists = await hasRoomLists.find({
            stuInfo: params._id
        }).populate({
            path: 'hasRoom'
        })
        // 查询待审核表
        // 查询该用户是否已经发送过加入自习室申请
        let isReviewRoomLists = await reviewRoomList.find({
            stuInfo: stuInfo._id, roomRecord: roomInfo._id
        }).populate({
            path: 'hasRoom'
        })
        // 判断今天是否已经加入自习了
        let isToadyHas = false, isToadyReview = false;

        isHasRoomLists.map(room => {
            if (room.hasRoomInfo.moon === roomInfo.moon && room.hasRoomInfo.day === roomInfo.day) {
                isToadyHas = true;
            }
        })

        isReviewRoomLists.map(room => {
            if (room.roomRecord.moon === roomInfo.moon && room.roomRecord.day === roomInfo.day) {
                isToadyReview = true;
            }
        })

        if (isToadyHas) {
            return {
                success: false,
                msg: '您今天已经拥有一节自习，不可重复添加',
            }
        }
        if (isToadyReview) {
            return {
                success: false,
                msg: '您今天已经提交了一个自习申请，如需更换情先删除',
            }
        }

        // 如果该教室是无审核制度的自习室 则直接放行 无需申请
        if (!roomInfo.roomAudit) {
            let add = {
                stuInfo: stuInfo._id,
                hasRoomInfo: roomInfo._id,
                seatIndex: params.seatIndex,
                isCreate: false
            }
            let addHasRoomList = new hasRoomLists(add)
            let hasRoomRecord = await addHasRoomList.save()
            // 添加hasRoomLists预约记录成功后

            // 添加个人信息到hasRoom到已创建的表中
            await hasRoom.update({
                _id: roomInfo._id
            }, {
                $push: {
                    seatsLists: {
                        seat: params.seatIndex,
                        stuId: stuInfo.stuId,
                        sex: stuInfo.sex
                    }
                }
            })
            return {
                success: true,
                msg: '加入自习室成功'
            }
        }

        // 如果该自习室采取审核制度 则添加审核信息
        await reviewRoomList.create({
            // 发起审核的学生Id
            stuInfo: stuInfo._id,
            // 负责接收请求的管理员ID
            verifier: roomInfo.stuInfo._id,
            // 待审核的自习室ID
            roomRecord: roomInfo._id,
            // 待审核自习室座位号
            seatIndex: params.seatIndex,
            // 是否通过审核
            reject: false,
            // 时间戳
            date: new Date().getTime()
        })

        return {
            success: true,
            msg: '加入自习室审核已成功发送至管理员'
        }

    } catch (err) {
        console.log(err);
    }
}
//#endregion

//#region 收藏自习室（更新完毕）
module.exports.saveRoom = async (params) => {

    try {
        // 查询用户信息
        let stuInfo = await student.getUser()
        // 查询用户是否已经收藏该自习室
        let isFlag = await collectRoomList.findOne({
            stuInfo: stuInfo._id,
            // 查询数组 并且是字符串
            collectRidList: {$elemMatch: {collectRid: params.roomId}}
        })
        if (isFlag) {
            // 如果查询到 说明已经收藏过该自习室
            return {
                success: false,
                msg: '已收藏过该自习室'
            }
        }
        // 查询是否有该用户的收藏列表 如果没有 就创建 如果有 则把收藏教室添加
        let isCreate = await collectRoomList.findOne({
            stuInfo: stuInfo._id
        })
        if (isCreate) {
            // 如果存在 添加自习室ID
            await collectRoomList.update({
                stuInfo: stuInfo._id,
            }, {
                collectRidList: {
                    $push:
                        {
                            collectRid: params.roomId
                        }
                }
            })
        } else {
            // 如果不存在 则新增收藏列表
            await collectRoomList.create({
                stuInfo: stuInfo._id,
                collectRidList: [
                    {
                        collectRid: params.roomId,
                    }
                ]
            })
        }

        return {
            success: true,
            msg: '收藏成功',
            roomId: params.roomId
        };
    } catch (err) {
        console.log(err);
    }
}

//#endregion

//#region 审核通过 加入自习室(更新完毕)
module.exports.agree = async (params) => {
    console.log('加入');
    try {
        // 获取发起申请的学生用户信息
        let stuInfo = await Student.findOne({_id: params.addId});
        // 获取当前用户的学生用户信息
        let minStuInfo = await student.getUser()

        //////////////////////////////////////

        // 1.删除待审核列表中的 申请
        let deleteReview = await reviewRoomList.deleteOne({
            _id: params.reviewId
        })
        // 2.添加信息添加到 hasRoomList 已预约的表中

        let add = {
            stuInfo: stuInfo._id,
            hasRoomInfo: params.roomId,
            seatIndex: params.seatIndex,
            isCreate: false
        }
        let addHasRoomList = new hasRoomLists(add)
        let hasRoomRecord = await addHasRoomList.save()

        // 3.添加个人信息到hasRoom已创建教室的表中
        await hasRoom.update({
            _id: params.roomId
        }, {
            $push: {
                seatsLists: {
                    seat: params.seatIndex,
                    stuId: stuInfo.stuId,
                    sex: stuInfo.sex
                }
            }
        })
        //////////////////////////////////////
        return {
            success: true,
            msg: '审核完成'
        }
    } catch (error) {
        throw error;
    }

}

//#endregion

//#region 审核不通过（更新完毕）
module.exports.disagree = async (params) => {
    try {
        // 把待审核列表中的 发起的审核信息 reject属性改为true 代表已经被拒绝
        await reviewRoomList.update({_id: params.reviewId}, {$set: {reject: true}})

        return {
            success: true,
            msg: '拒绝加入自习室成功'
        }
    } catch (error) {
        throw error;
    }
}

//#endregion

//#region 删除已经加入的自习室(更新完毕)
module.exports.deleteHasRoom = async (params) => {
    // console.log(params)
    // 获取本人的信息
    let stuInfo = await stu.getUser();
    // 删除用户的 has字段
    try {
        let flag = await hasRoomLists.find({
            stuInfo: stuInfo._id,
            hasRoomInfo: params.roomId
        })

        // 判断发起删除请求的人是不是自习室的管理员 如果是 则不允许删除自习室
        if (flag[0].isCreate) {
            // 先判断这个自习室是否是无审核制度自习室 如果是无审核自习室 则可以删除自习室
            if (!flag[0].hasRoomInfo.roomAudit) {
                console.log(params.roomId)
                // 删除已预约自习室表中的 本人相关的数据
                await hasRoomLists.deleteMany({
                    stuInfo: stuInfo._id,
                    hasRoomInfo: params.roomId
                })
                console.log(typeof global.stuId)
                // 删除room记录的座位表
                let a = await hasRoom.update(
                    {_id: params.roomId},
                    {
                        $pull: {
                            seatsLists: {
                                stuId: global.stuId
                            }
                        }
                    })
                // 判断教室是否还有其他人 如果没有其他人 则删除这个教室
                let findRoom = await hasRoom.findOne({
                    _id: params.roomId
                })
                if (findRoom.seatsLists.length <= 0) {
                    // 删除这个自习室预约列表
                    await hasRoomLists.deleteMany({
                        hasRoomInfo: params.roomId
                    })
                    // 删除这个自习室
                    await hasRoom.deleteMany({
                        _id: params.roomId
                    })
                }
                return {
                    success: true,
                    msg: '删除无审核自习室成功'
                }
            }
            return {
                success: false,
                msg: '管理员不允许删除已创建的自习室'
            }
        } else {
            // 删除已预约自习室表中的 本人相关的数据
            await hasRoomLists.deleteMany({
                stuInfo: stuInfo._id
            })
            // console.log(params.roomId, params.seatIndex, global.stuId, stuInfo.sex)
            // 删除room记录的座位表
            await hasRoom.update(
                {_id: params.roomId},
                {
                    $pull: {
                        seatsLists: {
                            stuId: Number(global.stuId)
                        }
                    }
                })
            // 判断教室是否还有其他人 如果没有其他人 则删除这个教室
            let findRoom = await hasRoom.findOne({
                _id: params.roomId
            })
            if (findRoom.seatsLists.length <= 0) {
                // 删除这个自习室预约列表
                await hasRoomLists.deleteMany({
                    hasRoomInfo: params.roomId
                })
                // 删除这个自习室
                await hasRoom.deleteMany({
                    _id: params.roomId
                })
            }
            return {
                success: true,
                msg: '删除成功'
            }


        }


    } catch (error) {
        console.log(error);
    }

}

//#endregion

//#region 删除收藏的自习室(更新完毕)
module.exports.deleteCollectRoom = async (params) => {
    // 删除用户的 collect字段
    try {
        await Student.update(
            {stuId: global.stuId},
            {$pull: {collectRoomLists: {roomRecord: params.roomId}}}
        )
        return {
            success: true,
            msg: '删除成功'
        }
    } catch (error) {
        console.log(error);
    }
}
//#endregion

//#region 删除正在审核的自习室信息(更新完毕)
module.exports.delReviewList = async (params) => {
    try {
        await reviewRoomList.deleteOne({_id: params.reviewId})
        return {
            success: true,
            mag: "删除成功！"
        }
    } catch (e) {
        console.log(e);
        return {
            success: false,
            mag: "删除失败 请重试！"
        }
    }
}
//#endregion

//#region 获取自习室详情(更新完毕)
module.exports.getRoom = async (params) => {
    console.log(params)
    try {
        if (params.isblank === 'true') {
            console.log('教室没创建过');

            let room = await Room.findOne({
                _id: params.roomId
            })
            let roomInfo = {
                roomInfo: room
            }
            return roomInfo;

        } else {
            let isHasRoom = await hasRoom.findOne({
                _id: params.roomId
            }).populate([{
                path: 'stuInfo',
                select: 'name stuId -_id'
            }, {
                path: 'roomInfo'
            }]).lean();
            // console.log(isHasRoom)
            // 获取当前用户的信息
            let student = await stu.getUser();
            // 是否加入
            let isHasRoomLists = await hasRoomLists.find({
                hasRoomInfo: isHasRoom._id,
                stuInfo: student._id
            })
            // 是否收藏
            let isCollectRoomLists = await collectRoomList.find({
                stuInfo: student._id
            }).lean()

            // 是否审核
            let isReviewRoomLists = await reviewRoomList.find({
                stuInfo: student._id,
                roomRecord: isHasRoom._id
            })

            // 判断用户是否已经 加入/收藏/审核中..
            if (isHasRoomLists.length) {
                isHasRoomLists.map(item => {
                    if (item.hasRoomInfo._id === params.roomId) {
                        isHasRoom['isHas'] = true;
                        isHasRoom['ownSeat'] = item.seatIndex;
                    }
                })
            }
            if (isCollectRoomLists.length) {
                isCollectRoomLists.map(item => {
                    item.collectRidList.forEach(collItem => {
                        if (collItem.collectRid === params.roomId) {
                            isHasRoom['isCollect'] = true;
                        }
                    })
                })
            }
            if (isReviewRoomLists.length) {
                isReviewRoomLists.map(item => {
                    if (item.roomRecord === params.roomId) {
                        isHasRoom['isReview'] = true;
                    }
                })
            }

            // 添加自习室创建者
            isHasRoom['createdStuId'] = isHasRoom.stuInfo.stuId;
            isHasRoom['createName'] = isHasRoom.stuInfo.name;

            // 判断是否是本人创建
            if (isHasRoom.stuInfo.stuId === global.stuId) {
                isHasRoom['isCreate'] = true;
            }
            delete isHasRoom.stuInfo;

            return isHasRoom;
        }
    } catch (error) {
        throw error
    }


}

//#endregion

//#region 获取今天是否有自习安排（更新完毕）
module.exports.getTodayHasRoom = async (params) => {
    let moon = new Date().getMonth() + 1;
    let day = new Date().getDate();
    let stuInfo = await stu.getUser();
    let todayHasRooms = [];
    // console.log(Rooms);

    let inHasRoomLists = await hasRoomLists.find({
        stuInfo: stuInfo._id
    }).populate({
        path: 'hasRoomInfo',
        populate: {
            path: 'roomInfo'
        }
    }).lean()
    // console.log(inHasRoomLists)

    inHasRoomLists.map(room => {
        // console.log(room,'123456')
        // 判断是否是今天
        if (room.hasRoomInfo.moon === moon && room.hasRoomInfo.day === day) {
            // for (let key in room.roomRecord.roomInfo) {
            //     room.roomRecord[key] = room.roomRecord.roomInfo[key];
            // }
            // delete room.roomRecord.roomInfo;
            todayHasRooms.push(room);
        }
    })
    // console.log(todayHasRooms);
    return todayHasRooms;
}

//#endregion

//#region 获取自己所在的自习室的座位(更新完毕)
module.exports.getMySeatIndex = async (params) => {
    // 获取当前用户数据
    let isStu = await stu.getUser()

    let isHasRoomLists = await hasRoomLists.find({
        hasRoomInfo: params.roomId,
        stuInfo: isStu._id
    })
    // 如果存在则返回用户在这间教室的数据 如果不存在 则返回[]
    return isHasRoomLists

}
//#endregion()（）

