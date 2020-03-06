const express = require('express');
const router = express.Router();
const svgCaptcha = require('svg-captcha');
const session = require('express-session');
let sqlOp = require("../sql-op/index");
let db = require("../db/db");
let mysql = require("mysql");

// 连接数据库
let conn = mysql.createConnection(db.mysql);
conn.connect((err) => {
    if (err) {
        console.log('数据库链接失败')
    }
    console.log('数据库链接成功...')
});

// 初始化图形验证码
session.imgVerify = {}
// 初始化手机验证码
session.phoneVerify = {}

router.use(session({
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: true,
    cookie: {
        maxAge: 60000
    }
}));

// 404
router.get("/404", (req, res) => {
    return res.json({
        message: "404状态",
        code: 404
    });
});

// 获取验证码
router.get('/verify', (req, res) => {
    let mobile = req.query.mobile
    if (mobile.length !== 11) {
        return res.json({
            message: "参数错误",
            code: 202,
            data: ""
        });
    }
    let colors = ['#c6edf9', '#f9f9f9', '#ecf1a2', '#f9cec6'];
    let mathNum = Math.round(Math.random() * (colors.length - 1));
    const cap = svgCaptcha.create({
        noise: 5,
        color: false,
        background: colors[mathNum]
    });
    let text = cap.text.toLocaleLowerCase(); // session 存储验证码数值
    session.imgVerify[`img${mobile}`] = text
    console.log(session.imgVerify)
    res.type('svg'); // 响应的类型
    res.send(cap.data);
})

// 获取手机验证码
router.get('/phoneVerify', (req, res) => {
    let mobile = req.query.mobile
    if (mobile.length !== 11) {
        return res.json({
            message: "参数错误",
            code: 202,
            data: ""
        });
    } else {
        let phoneCode = Math.random().toString().slice(-6)
        session.phoneVerify[`p${mobile}`] = phoneCode
        console.log(session.phoneVerify)

        return res.json({
            message: "success",
            code: 200,
            data: phoneCode
        });
    }
});

// addBank
router.get("/addBank", (req, res) => {
    let keyArr = [],
        valArr = [];
    for (let key in req.query) {
        keyArr.push(key);
        valArr.push(`'${req.query[key]}'`)
    }
    // create_time
    keyArr.push("create_time");
    valArr.push(`'${new Date().getTime()}'`);
    let newSql = sqlOp.sql.insert("banks", keyArr, valArr);
    conn.query(newSql, function (err, result) {
        if (err) {
            return res.json({
                message: "银行新增失败",
                code: 202
            });
        }
        if (result) {
            let data = result;
            return res.json({
                message: "银行新增成功",
                code: 200,
                data: result
            });
        } else {
            return res.json({
                message: "银行新增失败",
                code: 201
            });
        }
    });
});

// addBank
router.post("/getBankInfo", (req, res) => {
    let newSql = `SELECT * FROM banks WHERE bank_name LIKE '%${req.query.bank_name}%' limit 1`
    conn.query(newSql, function (err, result) {
        if (err) {
            return res.json({
                message: "银行数据获取失败",
                code: 202
            });
        }
        console.log(JSON.stringify(result))
        if (result) {
            let data = result;
            return res.json({
                message: "银行数据获取成功",
                code: 200,
                data: result[0]
            });
        } else {
            return res.json({
                message: "银行数据获取失败",
                code: 201
            });
        }
    });
});

module.exports = router;