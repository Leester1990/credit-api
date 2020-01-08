let CryptoJS = require("crypto-js");
exports.base = {
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
	}
};