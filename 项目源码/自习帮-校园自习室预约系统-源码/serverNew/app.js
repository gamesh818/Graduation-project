const Koa = require('koa');
const session = require('koa-session');
const koaBody = require('koa-bodyparser');
const passport = require('./lib/passport');
const cors = require('koa2-cors');
// cookie new
// new
const expSession = require('express-session')
let app = new Koa();

// koa解析body中间件
app.use(koaBody());
// 处理跨域
app.use(cors());


// 连接数据库
let mongoose = require('mongoose');
mongoose.connect('mongodb://127.0.0.1:27017/helpSchool3')
    // mongoose.connect('mongodb://124.71.6.95:27017/helpSchool')
    .then(() => {
        console.log("数据库连接成功")
    })
    .catch(err => {
        console.log(err);
    })

// 引入 schema

// 学生用户集合
require('./models/student');
// 待审核集合
require('./models/reviewRoomList');
// 收藏教室集合
require('./models/collectRoomList');
// 段位榜单集合
require('./models/praiseStuLists');
// 未创建自习室集合
require('./models/room');
// 已创建自习室集合
require('./models/hasroom');
// 已预约自习室集合
require('./models/hasRoomLists');
// 聊天集合
require('./models/chat');


// websocket 全双工通信,聊天功能
var server = require('http').Server(app.callback());
require('./controllers/socket')(server);

// 中间件，登陆拦截，拦截请求中是否有 authorization 的token，否则返回 unlogin
app.use(async (ctx, next) => {
    if (ctx.path != '/login' && ctx.path != '/register') {
        let stuId = ctx.request.header.authorization
        if (stuId) {
            global.stuId = stuId;
            await next();
        } else {
            ctx.body = {
                error: "unlogin"
            }
        }
    } else {
        await next();
    }
})

// 注册路由
let Router = require('./router');
const {log} = require('console');
app.use(Router.router.routes());

// 绑定端口号1
server.listen(4001, () => {
    console.log('server is running at 4001');
});




