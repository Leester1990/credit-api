let CryptoJS = require("crypto-js");
const crypto = require('crypto')
exports.base = {
	LOGIN_VALID_TIME: 100,
	// 获取顶级分类
	createFirstArr(arr, id) {
		let childs = [];
		arr.forEach(v => {
			if (v.parent_id == id) {
				childs.push(v);
			}
		});
		return childs;
	},
	// 单级分类数据重置为多级数据
	createResetCate: function (data, id) {
		let childs = this.createFirstArr(data, id);
		if (childs.length == 0) return null;

		childs.forEach((v, k) => {
			let buildTree = this.createResetCate(data, v.id);
			if (null != buildTree) {
				v['children'] = buildTree;
			}
		});

		return childs;
	},
	// 删除一些数据
	delSomeData: function (data, regData) {
		let res = {};
		let regD = regData.join("|");
		let reg = new RegExp("(" + regD + ")", "gi");
		for (let key in data) {
			if (!reg.test(key)) {
				res[key] = data[key]
			}
		}
		return res;
	},
	// 获取用户授权分类
	getUserAuthCate(auth, cate) {
		let getUserAuth = [];
		let authArr = auth.split(",");
		let userCate = [];
		for (let key in cate) {
			if (authArr.indexOf(cate[key].sort_key) >= 0) {
				getUserAuth.push(cate[key]);
			}
		}
		return getUserAuth;
	},
	// 无限级分类
	infiniteClassify(data, id, pid) {
		let map = {};
		let resData = [];
		//生成数据对象集合
		data.forEach(it => {
			map[it[id]] = it;
		})
		//生成结果集
		data.forEach(it => {
			let parent = map[it[pid]];
			if (parent) {
				if (!Array.isArray(parent.children)) parent.children = [];
				parent.children.push(it);
			} else {
				resData.push(it);
			}
		})
		return resData;
	},
	// 共用返回数据
	commonReqResult(res, code, data, msg) {
		return res.json({
			code: code,
			data: this.APIEncrypt(JSON.stringify(data)),
			msg: msg
		});
	},
	// 密钥
	cryptoJSKey() {
		return CryptoJS.enc.Utf8.parse("KSLFJDSKALFD")
	},
	// 密钥偏移是
	cryptoJSIv() {
		return CryptoJS.enc.Utf8.parse('DFSAFDSAFJDKSHAFJKD')
	},
	// 解密
	APIDecrypt(string) {
		let encryptedHexStr = CryptoJS.enc.Hex.parse(string);
		let srcs = CryptoJS.enc.Base64.stringify(encryptedHexStr);
		let decrypt = CryptoJS.AES.decrypt(srcs, this.cryptoJSKey(), {
			iv: this.cryptoJSIv(),
			mode: CryptoJS.mode.CBC,
			padding: CryptoJS.pad.Pkcs7
		});
		return decrypt.toString(CryptoJS.enc.Utf8).toString();
	},
	// 加密
	APIEncrypt(string) {
		let srcs = CryptoJS.enc.Utf8.parse(string);
		let encrypted = CryptoJS.AES.encrypt(srcs, this.cryptoJSKey(), {
			iv: this.cryptoJSIv(),
			mode: CryptoJS.mode.CBC,
			padding: CryptoJS.pad.Pkcs7
		});
		return encrypted.ciphertext.toString().toUpperCase();
	},
	// token混淆字符串
	tokenKey: "c7f504e276aa62480482a705c7d70036",
	// token加密
	tokenEncrypt(data, mobile) {
		data = data.toString()
		const cipher = crypto.createCipher('aes192', this.tokenKey)
		var crypted = cipher.update(data, 'utf8', 'hex')
		crypted += cipher.final('hex')
		return crypted
	},
	// token解码
	tokenDecrypt(encrypted, key) {
		const decipher = crypto.createDecipher('aes192', key)
		var decrypted = decipher.update(encrypted, 'hex', 'utf8')
		decrypted += decipher.final('utf8')
		return decrypted
	},
	// 创建token
	createToken(req, data) {
		let one = this.tokenEncrypt(data.username)
		let phoneTime = `phone=${data.mobile},time=${new Date().getTime()}`
		let two = this.tokenEncrypt(phoneTime)
		let three = this.tokenEncrypt([req.deviceSource, req.appVersion].join(","))
		return `${one}.${two}.${three}`
	},
	// 解码token
	deCodeToken(token) {
		let tokenArr = token.split(".")
		let one = this.tokenDecrypt(tokenArr[0], this.tokenKey)
		let two = this.tokenDecrypt(tokenArr[1], this.tokenKey)
		let three = this.tokenDecrypt(tokenArr[2], this.tokenKey)
		let twoArr = two.split(",")
		return {
			username: one,
			userId: one.replace(/(60136|00000)/gi, ''),
			customerNo: one.replace(/(00000)/gi, ''),
			phone: twoArr[0].replace("phone=", ""),
			loginTime: twoArr[1].replace("time=", ""),
			deviceSource: three.split(",")[0],
			appVersion: three.split(",")[1]
		}
	},
	// 检查用户token状态
	checkUserTokenValid(token) {
		console.log(token)
		let deToken = this.deCodeToken(token)
		let obj = {
			status: false,
			code: 9001,
			data: deToken
		}
		return obj
	}
};