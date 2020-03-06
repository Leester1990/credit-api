let express = require("express");
let router = express.Router();
let app = new express();
// let db = require("./db/db.js");
// let mysql = require("mysql");
let bodyParser = require("body-parser");
let commonBase = require("./common/base.js");

app.use(bodyParser.json());

// 引用后台单个API路径
var apiCate = require('./modules/cate');
var apiUser = require('./modules/user');
var apiCommon = require('./modules/common');

//设置跨域访问
app.all('*', function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Content-Type,token");
    res.header("Access-Control-Allow-Methods", "PUT,POST,GET,DELETE,OPTIONS");
    res.header("X-Powered-By", ' 3.2.1')
    res.header("Content-Type", "application/json;charset=utf-8");

    if (req.headers.token) {
        // 全局判断token是否过期
        let checkUser = commonBase.base.checkUserTokenValid(req.headers.token)
        console.log(checkUser)
        if (checkUser.status) {
            next()
        } else {
            res.json(checkUser)
        }
    } else {
        next()
    }
});

// 所有后端API根路径
app.use('/api/user', apiUser) // 用户中心接口
app.use('/api/cate', apiCate) //产品接口
app.use('/api/common', apiCommon) //产品接口

//配置服务端口
var server = app.listen(8288, 'localhost', function () {
    var host = server.address().address;
    var port = server.address().port;
    console.log('后端api接口地址是：http://%s:%s', host, port);
});