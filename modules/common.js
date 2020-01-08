const express = require('express');
const router = express.Router();
const svgCaptcha = require('svg-captcha');
const session = require('express-session');

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

module.exports = router;