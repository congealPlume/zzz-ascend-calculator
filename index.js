var 初始数据 = {
	角色初始数据: {
		key: 0,
		name: "猫又",
		等级: [1, 60],
		技能: [
			[1, 1],
			[1, 1],
			[1, 1],
			[1, 1],
		],
		稀有度: "S",
		核心技能材料: "高维数据：格莱特",
		核心技能材料2: "源代码：狂如恶雨",
		特性: "强攻",
		属性: "物理",
		素材: { 见习调查员记录: 0, 正式调查员记录: 0, 资深调查员记录: 300, 初阶强攻认证章: 4, 高阶强攻认证章: 32, 先行者认证章: 30, 丁尼: 800000 },
		技能素材: { 基础物理芯片: 0, 进阶物理芯片: 0, 特化物理芯片: 0, "高维数据：提丰·重击者型": 0, "源代码：狂如恶雨": 0, "「仓鼠笼」访问器": 0, 丁尼: 0 },
		计算相关: [false, false, true, false], // 前突破,后突破,是否计算,是否计算技能,
		显示: [false, false, true, false], // 前突破,后突破,显示详细消耗,角色列表
		列表属性: "物理",
	},
	武器初始数据: {
		key: 0,
		name: "钢铁肉垫",
		等级: [1, 60],
		稀有度: "S",
		特性: "击破",
		素材: { 音擎蓄电池: 6, 变频音擎电源: 4, 音擎能源模块: 199, 音擎振膜: 5, 增强型音擎振膜: 40, 复合式音擎振膜: 37, 丁尼: 370000 },
		计算相关: [false, false, true], // 前突破,后突破,是否计算
		显示: [false, false, true, false], // 前突破,后突破,显示详细消耗,武器列表
		列表属性: "击破",
	},
};
var 角色列表 = { 冰结: [], 引燃: [], 电击: [], 物理: [], 以太: [] };
$.each(originalData.角色, function (index, item) {
	if (!角色列表[item.属性]) return true;
	角色列表[item.属性].push([item.name, item.稀有度]);
});
var 武器列表 = { 击破: [], 强攻: [], 异常: [], 支援: [], 防护: [] };
$.each(originalData.武器, function (index, item) {
	if (!武器列表[item.特性]) return true;
	武器列表[item.特性].push([item.name, item.稀有度]);
});
var 背包素材 = {};
$.each(originalData.bagData, function (index, item) {
	背包素材[item] = 0;
});
// 整合同种素材 数据需低星到高星排列
var 材料系列 = [];
$.each([originalData.角色突破材料系列, originalData.角色技能升级系列, originalData.音擎突破材料系列], function (allIndex, allItem) {
	$.each(allItem, function (index, item) {
		材料系列.push({ [item.C级]: 1, [item.B级]: 3, [item.A级]: 9 });
	});
});
$.each([originalData.角色经验素材, originalData.音擎经验素材], function (index, item) {
	材料系列.push({ [Object.keys(item)[2]]: item[Object.keys(item)[2]], [Object.keys(item)[1]]: item[Object.keys(item)[1]], [Object.keys(item)[0]]: item[Object.keys(item)[0]] });
});
var comFun = {
	// 减去背包素材
	背包素材相减: function (总计素材, 现有素材, 消耗的素材 = {}) {
		// 减去背包有的素材数量
		$.each(总计素材, function (index, item) {
			if (现有素材[index] - item < 0) {
				消耗的素材[index] = 消耗的素材[index] + 现有素材[index] || 现有素材[index];
				总计素材[index] = item - 现有素材[index];
				现有素材[index] = 0;
			} else {
				消耗的素材[index] = 消耗的素材[index] + item || item;
				现有素材[index] = 现有素材[index] - item;
				总计素材[index] = 0;
			}
		});
	},
	// 使用低级素材合成高级的相减
	素材转换: function (总计素材, 现有素材, 素材名称, typeBox, 类别 = "合成", 消耗的素材 = {}) {
		let 需要总计素材 = JSON.parse(JSON.stringify(总计素材));
		let 背包现有素材 = JSON.parse(JSON.stringify(现有素材));
		if (!typeBox) return false;
		// 倒序排列系列材料
		if (类别 == "分解") {
			newTypeBox = {};
			$.each(Object.keys(typeBox).reverse(), function (index, item) {
				newTypeBox[item] = typeBox[item];
			});
			typeBox = newTypeBox;
		}
		// console.log(typeBox);
		let rank = Object.keys(typeBox).findIndex((i) => i == 素材名称);
		if (rank == 0) return false;
		// 开始合成低级素材
		let 需要素材基数 = typeBox[素材名称];
		for (i = 0; i < rank; i++) {
			let 消耗素材名称 = Object.keys(typeBox)[i];
			let 消耗素材基数 = typeBox[消耗素材名称];
			let 消耗素材个数 = Math.floor((背包现有素材[消耗素材名称] * 消耗素材基数) / 需要素材基数);
			if (消耗素材个数 >= 需要总计素材[素材名称]) {
				// 背包素材大于需要素材
				let 消耗掉的数量 = Math.ceil((需要总计素材[素材名称] * 需要素材基数) / 消耗素材基数);
				if (类别 == "分解") {
					背包现有素材[素材名称] = 背包现有素材[素材名称] + 消耗掉的数量 * 消耗素材基数 - 需要总计素材[素材名称];
				}
				背包现有素材[消耗素材名称] = 背包现有素材[消耗素材名称] - 消耗掉的数量;
				需要总计素材[素材名称] = 0;
				消耗的素材[消耗素材名称] = 消耗的素材[消耗素材名称] + 消耗掉的数量 || 消耗掉的数量;
			} else if (消耗素材个数 < 需要总计素材[素材名称]) {
				// 背包素材小于需要素材
				let 消耗掉的数量 = Math.ceil((消耗素材个数 * 需要素材基数) / 消耗素材基数);
				需要总计素材[素材名称] = 需要总计素材[素材名称] - 消耗素材个数;
				背包现有素材[消耗素材名称] = 背包现有素材[消耗素材名称] - 消耗掉的数量;
				消耗的素材[消耗素材名称] = 消耗的素材[消耗素材名称] + 消耗掉的数量 || 消耗掉的数量;
			}
		}
		return [需要总计素材, 背包现有素材, 消耗的素材];
	},
	// 更改排序
	moveKeysToEnd: function (obj, keys) {
		let entries = Object.entries(obj);
		let entriesToMove = entries.filter(([key, value]) => keys.includes(key));
		let remainingEntries = entries.filter(([key, value]) => !keys.includes(key));
		let sortedEntries = remainingEntries.concat(entriesToMove);
		return Object.fromEntries(sortedEntries);
	},
	// ture false转换
	布尔转换: function (booleanArray, type = "boolean") {
		if (type == "boolean") {
			return booleanArray.map((i) => (i ? 1 : 0));
		} else {
			return booleanArray.map((i) => (i ? true : false));
		}
	},
	// 压缩数据
	压缩数据: function (data) {
		let newData = { 角色: [], 武器: [] };
		$.each(data.角色box, function (index, item) {
			newData.角色.push({
				名称: item.name,
				等级: item.等级,
				技能: item.技能,
				列表属性: item.列表属性,
				显示: comFun.布尔转换(item.显示),
				计算相关: comFun.布尔转换(item.计算相关),
			});
		});
		$.each(data.武器box, function (index, item) {
			newData.武器.push({
				名称: item.name,
				等级: item.等级,
				列表属性: item.列表属性,
				显示: comFun.布尔转换(item.显示),
				计算相关: comFun.布尔转换(item.计算相关),
			});
		});
		return newData;
	},
	// 添加缓存
	添加缓存: function (data) {
		let that = data;
		let newData = { versions: originalData.参数设置.缓存数据版本 };
		let comData = comFun.压缩数据(data);
		newData.data = comData;
		newData.data.背包素材 = that.背包素材;
		newData.data.设置 = that.设置;
		//  newData = JSON.stringify(data);
		localStorage.setItem("cp_zzz_computeData", JSON.stringify(newData));
	},
	// 读取缓存数据
	读取缓存: function (that, localData) {
		// let localData = JSON.parse(localStorage.getItem("cp_zzz_computeData"));
		that.角色box = [];
		that.武器box = [];
		$.each(localData.data.角色, function (index, item) {
			let newData = {
				key: index,
				name: item.名称,
				等级: item.等级,
				技能: item.技能,
				列表属性: item.列表属性,
				计算相关: comFun.布尔转换(item.计算相关, "number"),
				显示: comFun.布尔转换(item.显示, "number"),
			};
			that.角色box.push(newData);
			that.选择角色(index, item.名称, false);
		});
		$.each(localData.data.武器, function (index, item) {
			let newData = {
				key: index,
				name: item.名称,
				等级: item.等级,
				技能: item.技能,
				列表属性: item.列表属性,
				计算相关: comFun.布尔转换(item.计算相关, "number"),
				显示: comFun.布尔转换(item.显示, "number"),
			};
			that.武器box.push(newData);
			that.选择武器(index, item.名称, false);
		});
		that.背包素材 = localData.data.背包素材;
		that.设置 = localData.data.设置;
	},
};
var Counter = {
	data() {
		return {
			遮罩开关: false,
			角色box: [],
			武器box: [],
			角色列表,
			武器列表,
			背包素材,
			选中素材: [false, { 见习调查员记录: 100, 正式调查员记录: 600, 资深调查员记录: 3000 }],
			Wiki储存: "",
			设置: {
				背包素材显示: false,
				详细设置: false,
				设置: false,
				关卡等级: 6,
				角色默认等级: [0, 60],
				武器默认等级: [0, 60],
			},
		};
	},
	created() {
		var that = this;
		// 获取缓存
		if (localStorage.getItem("cp_zzz_computeData")) {
			comFun.读取缓存(that, JSON.parse(localStorage.getItem("cp_zzz_computeData")));
		} else {
			that.角色box.push(JSON.parse(JSON.stringify(初始数据.角色初始数据)));
			that.武器box.push(JSON.parse(JSON.stringify(初始数据.武器初始数据)));
		}
		if (localStorage.getItem("cp_zzz_computeHelp") != originalData.参数设置.帮助版本) {
			$("body").css("overflow", "hidden");
			that.遮罩开关 = true;
			that.设置.帮助 = true;
		}
	},
	computed: {
		roleNeedMaterial() {
			var that = this;
			allNeed = {
				见习调查员记录: 0,
				正式调查员记录: 0,
				资深调查员记录: 0,
				音擎蓄电池: 0,
				变频音擎电源: 0,
				音擎能源模块: 0,
			};
			$.each(that.角色box, function (roleIndex, roleItem) {
				if (roleItem.计算相关[2] == false) return true;
				$.each(roleItem.素材, function (index, item) {
					allNeed[index] = item + allNeed[index] || item;
				});
				$.each(roleItem.技能素材, function (index, item) {
					allNeed[index] = item + allNeed[index] || item;
				});
			});
			$.each(that.武器box, function (roleIndex, roleItem) {
				if (roleItem.计算相关[2] == false) return true;
				$.each(roleItem.素材, function (index, item) {
					allNeed[index] = item + allNeed[index] || item;
				});
			});
			// 排序
			let initData = {};
			$.each(originalData.bagData, function (index, item) {
				if (allNeed[item] == 0) return true;
				initData[item] = allNeed[item];
			});
			initData = comFun.moveKeysToEnd(initData, ["丁尼"]);
			// 复制背包素材数量
			let 背包新素材 = JSON.parse(JSON.stringify(that.背包素材));
			// 减去背包有的素材数量
			comFun.背包素材相减(initData, 背包新素材);
			// 低级材料合成为高级
			$.each(initData, function (index, item) {
				if (item == 0) return true;
				let typeBox = 材料系列.find((i) => Object.keys(i).includes(index));
				let 合成素材后 = comFun.素材转换(initData, 背包新素材, index, typeBox);
				if (合成素材后) {
					initData = 合成素材后[0];
					背包新素材 = 合成素材后[1];
				}
			});
			// 高级材料分解为低级
			$.each(initData, function (index, item) {
				if (item == 0) return true;
				let typeBox = 材料系列.find((i) => Object.keys(i).includes(index));
				let 分解素材后 = comFun.素材转换(initData, 背包新素材, index, typeBox, "分解");
				if (分解素材后) {
					initData = 分解素材后[0];
					背包新素材 = 分解素材后[1];
				}
			});
			// console.table(背包新素材);
			// console.table(initData);

			// console.table(背包新素材);
			comFun.添加缓存(that);
			return initData;
		},
		体力计算() {
			let that = this;
			let needBox = that.roleNeedMaterial;
			let comend = [];
			let 体力需求 = 0;
			let 体力需求box = [];
			let 期望box = originalData.掉落期望[that.设置.关卡等级];
			$.each(needBox, function (fIndex, fItem) {
				if (comend.indexOf(fIndex) != -1) return true;
				let 材料新系列 = 材料系列.find((i) => Object.keys(i).includes(fIndex));
				if (!材料新系列) 材料新系列 = { [fIndex]: 1 };
				let 总共需要材料基数 = 0;
				$.each(材料新系列, function (index, item) {
					总共需要材料基数 = 总共需要材料基数 + (needBox[index] || 0) * item;
					comend.push(index);
				});
				let 种类;
				let 体力 = 20;
				if (fIndex == "音擎能源模块" || fIndex == "变频音擎电源" || fIndex == "音擎蓄电池") {
					种类 = "音擎经验";
				} else if (fIndex.indexOf("调查员记录") != -1) {
					种类 = "角色经验";
				} else if (fIndex == "丁尼") {
					种类 = "丁尼";
				} else if (fIndex.indexOf("认证章") != -1) {
					种类 = "角色突破材料";
				} else if (fIndex.indexOf("芯片") != -1) {
					种类 = "角色技能";
				} else if (fIndex.indexOf("音擎") != -1) {
					种类 = "音擎突破材料";
				} else if (fIndex.indexOf("高维数据") != -1 || fIndex.indexOf("源代码") != -1) {
					种类 = "角色核心技能";
					体力 = 40;
				}
				let 期望 = 期望box[种类];
				体力需求 = 体力需求 + Math.ceil(总共需要材料基数 / 期望) * 体力;
				体力需求box.push([材料新系列, 总共需要材料基数, 期望, Math.ceil(总共需要材料基数 / 期望) * 体力]);
			});
			// console.log(体力需求box);
			return [体力需求, Math.ceil(体力需求 / originalData.参数设置.每天体力), 体力需求box];
		},
	},
	methods: {
		计算开关(key, type = "角色") {
			let that = this;
			let nowData = that[`${type}box`].find((i) => i.key == key);
			nowData.计算相关[2] = !nowData.计算相关[2];
		},
		角色计算(key) {
			let that = this;
			let nowData = that.角色box.find((i) => i.key == key);
			// 控制等級
			if (nowData.等级[0] < 1) {
				nowData.等级[0] = 1;
			} else if (nowData.等级[0] > 60) {
				nowData.等级[0] = 60;
			}
			if (nowData.等级[1] > 60) {
				nowData.等级[1] = 60;
			} else if (nowData.等级[1] < 1) {
				nowData.等级[1] = 1;
			}
			// 显示按钮
			if (nowData.等级[0] % 10 !== 0 || nowData.等级[0] == 60) {
				nowData.显示[0] = false;
			} else {
				nowData.显示[0] = true;
			}
			if (nowData.等级[1] % 10 !== 0 || nowData.等级[1] == 60) {
				nowData.显示[1] = false;
			} else {
				nowData.显示[1] = true;
			}
			if (nowData.等级[0] == nowData.等级[1]) {
				nowData.计算相关[0] = true;
				nowData.显示[0] = false;
			}
			// 计算突破
			const beforeLevel = nowData.等级[0];
			const afterLevel = nowData.等级[1];
			let beforeUpLevel;
			let afterUpLevel;
			if (nowData.计算相关[0] && nowData.等级[0] % 10 == 0) {
				beforeUpLevel = Math.floor(nowData.等级[0] / 10);
			} else {
				beforeUpLevel = Math.floor(nowData.等级[0] / 10) + 1;
			}
			if (!nowData.计算相关[1] && nowData.等级[1] % 10 == 0) {
				afterUpLevel = Math.floor(nowData.等级[1] / 10) - 1;
			} else {
				afterUpLevel = Math.floor(nowData.等级[1] / 10);
			}
			// 计算经验和
			let expSum = 0;
			for (let i = beforeLevel; i < afterLevel; i++) {
				expSum = expSum + originalData.角色经验需求[i];
			}
			//计算消耗的经验书
			let expBox = {};
			// roleExpNeed = originalData.角色经验素材
			$.each(originalData.角色经验素材, function (index, item) {
				if (index == "见习调查员记录") {
					expBox = Object.assign({ [index]: Math.ceil(expSum / item) }, expBox);
				} else {
					expBox = Object.assign({ [index]: Math.floor(expSum / item) }, expBox);
				}
				expSum = expSum % item;
			});
			// 计算突破材料
			let materialsBox = { C级: 0, B级: 0, A级: 0, 丁尼: 0 };
			for (let i = beforeUpLevel; i < afterUpLevel + 1; i++) {
				$.each(materialsBox, function (index, item) {
					materialsBox[index] = item + originalData.角色等级进阶[i][index];
				});
			}
			outData = expBox;
			$.each(materialsBox, function (index, item) {
				if (originalData.角色突破材料系列[nowData.特性][index]) {
					outData[originalData.角色突破材料系列[nowData.特性][index]] = item;
				} else {
					outData[index] = item;
				}
			});
			// outData.经验 = expSum;
			nowData.素材 = outData;
			that.roleNeedMaterial;
		},
		技能计算(key) {
			let that = this;
			let nowData = that.角色box.find((i) => i.key == key);
			// 控制等級
			$.each(nowData.技能, function (index, item) {
				let maxLevel = 12;
				if (index == 3) maxLevel = 6;
				if (item[0] < 1) {
					nowData.技能[index][0] = 1;
				} else if (item[0] > maxLevel) {
					nowData.技能[index][0] = maxLevel;
				}
				if (item[1] > maxLevel) {
					nowData.技能[index][1] = maxLevel;
				} else if (item[1] < 1) {
					nowData.技能[index][1] = 1;
				}
			});

			// 计算技能材料
			let materialsBox = { C级: 0, B级: 0, A级: 0, A级2: 0, S级: 0, "「仓鼠笼」访问器": 0, 丁尼: 0 };
			$.each(nowData.技能, function (jnIndex, jnItem) {
				const beforeLevel = jnItem[0];
				const afterLevel = jnItem[1];
				let cailiaoData = originalData.角色技能升级;
				if (jnIndex == 3) cailiaoData = originalData.角色核心技能升级;
				for (let i = beforeLevel; i < afterLevel; i++) {
					$.each(materialsBox, function (index, item) {
						materialsBox[index] = item + cailiaoData[i][index] || item;
					});
					if (i == 11) {
						materialsBox["「仓鼠笼」访问器"] = materialsBox["「仓鼠笼」访问器"] + 1;
					}
				}
			});
			outData = {};
			$.each(materialsBox, function (index, item) {
				if (originalData.角色技能升级系列[nowData.属性][index]) {
					outData[originalData.角色技能升级系列[nowData.属性][index]] = item;
				} else if (index == "A级2") {
					outData[nowData.核心技能材料] = item;
				} else if (index == "S级") {
					outData[nowData.核心技能材料2] = item;
				} else {
					outData[index] = item;
				}
			});
			nowData.技能素材 = outData;
			that.roleNeedMaterial;
		},
		技能开关(key) {
			let that = this;
			let nowData = that.角色box.find((i) => i.key == key);
			nowData.计算相关[3] = !nowData.计算相关[3];
			nowData.技能 = [
				[1, 1],
				[1, 1],
				[1, 1],
				[1, 1],
			];
			that.技能计算(key);
		},
		武器计算(key) {
			let that = this;
			let nowData = that.武器box.find((i) => i.key == key);
			// 控制等級
			if (nowData.等级[0] < 1) {
				nowData.等级[0] = 1;
			} else if (nowData.等级[0] > 60) {
				nowData.等级[0] = 60;
			}
			if (nowData.等级[1] > 60) {
				nowData.等级[1] = 60;
			} else if (nowData.等级[1] < 1) {
				nowData.等级[1] = 1;
			}
			// 显示按钮
			if (nowData.等级[0] % 10 !== 0 || nowData.等级[0] == 60) {
				nowData.显示[0] = false;
			} else {
				nowData.显示[0] = true;
			}
			if (nowData.等级[1] % 10 !== 0 || nowData.等级[1] == 60) {
				nowData.显示[1] = false;
			} else {
				nowData.显示[1] = true;
			}
			if (nowData.等级[0] == nowData.等级[1]) {
				nowData.计算相关[0] = true;
				nowData.显示[0] = false;
			}
			// 计算突破
			const beforeLevel = nowData.等级[0];
			const afterLevel = nowData.等级[1];
			let beforeUpLevel;
			let afterUpLevel;
			if (nowData.计算相关[0] && nowData.等级[0] % 10 == 0) {
				beforeUpLevel = Math.floor(nowData.等级[0] / 10);
			} else {
				beforeUpLevel = Math.floor(nowData.等级[0] / 10) + 1;
			}
			if (!nowData.计算相关[1] && nowData.等级[1] % 10 == 0) {
				afterUpLevel = Math.floor(nowData.等级[1] / 10) - 1;
			} else {
				afterUpLevel = Math.floor(nowData.等级[1] / 10);
			}
			// 计算经验和
			let expSum = 0;
			for (let i = beforeLevel; i < afterLevel; i++) {
				expSum = expSum + originalData.音擎经验需求[nowData.稀有度][i];
			}
			//计算消耗的经验书
			let expBox = {};
			// roleExpNeed = originalData.音擎经验素材
			$.each(originalData.音擎经验素材, function (index, item) {
				if (index == "音擎蓄电池") {
					expBox = Object.assign({ [index]: Math.ceil(expSum / item) }, expBox);
				} else {
					expBox = Object.assign({ [index]: Math.floor(expSum / item) }, expBox);
				}
				expSum = expSum % item;
			});
			// 计算突破材料
			let materialsBox = { C级: 0, B级: 0, A级: 0, 丁尼: 0 };
			for (let i = beforeUpLevel; i < afterUpLevel + 1; i++) {
				$.each(materialsBox, function (index, item) {
					materialsBox[index] = item + originalData.音擎等级进阶[nowData.稀有度][i][index];
				});
			}
			outData = expBox;
			$.each(materialsBox, function (index, item) {
				if (originalData.音擎突破材料系列[nowData.特性][index]) {
					outData[originalData.音擎突破材料系列[nowData.特性][index]] = item;
				} else {
					outData[index] = item;
				}
			});
			nowData.素材 = outData;
			// that.roleNeedMaterial;
		},
		养成完毕(key, type) {
			if (!confirm("是否确定养成完毕\n此操作会清除该角色并且减少相应的背包素材")) return;
			let that = this;
			let nowData = that[`${type}box`].find((i) => i.key == key);
			let 素材合计;
			if (type == "武器") {
				素材合计 = nowData.素材;
			} else {
				素材合计 = that.素材合计(key);
			}
			let 素材新合计 = JSON.parse(JSON.stringify(素材合计));
			let 背包新素材 = JSON.parse(JSON.stringify(that.背包素材));
			// 消耗素材暂时无用
			let 消耗掉的素材 = {};
			// 减去背包有的素材数量
			comFun.背包素材相减(素材新合计, 背包新素材, 消耗掉的素材);
			$.each(素材新合计, function (index, item) {
				let typeBox = 材料系列.find((i) => Object.keys(i).includes(index));
				let 素材计算 = comFun.素材转换(素材新合计, 背包新素材, index, typeBox, "合成", 消耗掉的素材);
				if (素材计算) {
					素材新合计 = 素材计算[0];
					背包新素材 = 素材计算[1];
				}
			});
			$.each(素材新合计, function (index, item) {
				let typeBox = 材料系列.find((i) => Object.keys(i).includes(index));
				let 素材计算 = comFun.素材转换(素材新合计, 背包新素材, index, typeBox, "分解", 消耗掉的素材);
				if (素材计算) {
					素材新合计 = 素材计算[0];
					背包新素材 = 素材计算[1];
				}
			});
			if (Object.values(素材新合计).every((i) => i == 0)) {
				// $.each(消耗掉的素材, function (index, item) {
				// 	that.背包素材[index] = that.背包素材[index] - item;
				// });
				that.背包素材 = 背包新素材;
				that.delBtn(key, type);
			} else {
				let 提示 = "背包素材不足以覆盖消耗";
				$.each(素材新合计, function (index, item) {
					if (item == 0) return true;
					提示 = `${提示}\n“${index}” 缺少：${item} 个`;
				});
				alert(提示);
			}
			// console.table(素材新合计);
			// console.table(消耗掉的素材);
		},
		是否突破(key, index, type) {
			let that = this;
			let nowData = that[`${type}box`].find((i) => i.key == key);
			nowData.计算相关[index] = !nowData.计算相关[index];
			that.角色计算(key);
		},
		打开列表(key, type) {
			let that = this;
			let nowData = that[`${type}box`].find((i) => i.key == key);
			nowData.显示[3] = true;
			that.遮罩();
		},
		更改列表属性(key, type, name) {
			let that = this;
			let nowData = that[`${type}box`].find((i) => i.key == key);
			nowData.列表属性 = name;
		},
		显示详细消耗(key, type) {
			let that = this;
			let nowData = that[`${type}box`].find((i) => i.key == key);
			nowData.显示[2] = !nowData.显示[2];
		},
		选择角色(key, roleName, shade = true) {
			let that = this;
			let nowData = that.角色box.find((i) => i.key == key);
			roleData = originalData.角色.find((i) => i.name == roleName);
			$.each(roleData, function (index, item) {
				nowData[index] = item;
			});
			that.角色计算(key);
			that.技能计算(key);
			nowData.显示[3] = false;
			if (shade) that.遮罩();
		},
		选择武器(key, name, shade = true) {
			let that = this;
			let nowData = that.武器box.find((i) => i.key == key);
			weaponData = originalData.武器.find((i) => i.name == name);
			$.each(weaponData, function (index, item) {
				nowData[index] = item;
			});
			that.武器计算(key);
			nowData.显示[3] = false;
			if (shade) that.遮罩();
		},
		文字角标(text) {
			let showText = false;
			let outText;
			function findKeyByValue(data, value) {
				for (const [key, levels] of Object.entries(data)) {
					if (Object.values(levels).includes(value)) {
						return key;
					}
				}
				return Array(2);
			}
			if (text.indexOf("认证章") != -1) {
				showText = true;
				outText = findKeyByValue(originalData.角色突破材料系列, text);
			} else if (text.indexOf("：") != -1) {
				showText = true;
				const regex = new RegExp(`：(.*)`);
				if (text.match(regex)) {
					outText = text.match(regex)[1];
				} else {
					outText = null;
				}
			}
			return [showText, outText];
		},
		数字转换(num) {
			if (num <= 10000) {
				return num.toString();
			}
			let result = (num / 10000).toFixed(2);
			result = Math.ceil(result * 100) / 100;
			return result.toFixed(2) + "万";
		},
		素材合计(key) {
			let that = this;
			let nowData = that.角色box.find((i) => i.key == key);
			allNeed = {};
			$.each(nowData.素材, function (index, item) {
				if (item == 0) return true;
				allNeed[index] = item + allNeed[index] || item;
			});
			$.each(nowData.技能素材, function (index, item) {
				if (item == 0) return true;
				allNeed[index] = item + allNeed[index] || item;
			});
			return comFun.moveKeysToEnd(allNeed, ["经验", "丁尼"]);
		},
		// 添加
		addBtn(type = "角色") {
			let that = this;
			let newData = JSON.parse(JSON.stringify(初始数据[`${type}初始数据`]));
			newData.等级 = that.设置[`${type}默认等级`];
			if (that[`${type}box`].at(-1)) {
				newData.key = that[`${type}box`].at(-1).key + 1;
			} else {
				newData.key = 0;
			}
			that[`${type}box`].push(newData);
		},
		// 删除
		delBtn(key, type = "角色") {
			this[`${type}box`] = this[`${type}box`].filter((t) => t.key !== key);
		},
		获取图片(imgName, imgType = "imgUrlData") {
			return originalData[imgType][imgName] || originalData.UIimgData.缺失;
		},
		打开同类素材(name) {
			let that = this;
			that.选中素材[0] = true;
			let 材料新系列 = 材料系列.find((i) => Object.keys(i).includes(name));
			if (!材料新系列) 材料新系列 = { [name]: 1 };
			that.选中素材[1] = 材料新系列;
			that.遮罩();
		},
		清空背包素材() {
			if (!confirm("是否确定清空背包素材")) return;
			let that = this;
			$.each(that.背包素材, function (index, item) {
				that.背包素材[index] = 0;
			});
		},
		清空角色武器() {
			if (!confirm("是否确定清空角色武器")) return;
			let that = this;
			let roleData = JSON.parse(JSON.stringify(初始数据.角色初始数据));
			roleData.等级 = that.设置.角色默认等级;
			that.角色box = [roleData];
			let weaponData = JSON.parse(JSON.stringify(初始数据.武器初始数据));
			weaponData.等级 = that.设置.武器默认等级;
			that.武器box = [weaponData];
			that.角色计算(0);
			that.武器计算(0);
		},
		是否全部计算() {
			let that = this;
			let newShow;
			if (that.角色box[0]) {
				newShow = that.角色box[0].计算相关[2];
			} else if (that.武器box[0]) {
				newShow = that.武器box[0].计算相关[2];
			} else {
				return;
			}
			$.each([that.角色box, that.武器box], function (mainIndex, mainItem) {
				$.each(mainItem, function (index, item) {
					item.计算相关[2] = !newShow;
				});
			});
		},
		打开帮助(type) {
			var that = this;
			that.设置.帮助 = !that.设置.帮助;
			that.遮罩();
			if (type == "close") {
				localStorage.setItem("cp_zzz_computeHelp", originalData.参数设置.帮助版本);
			}
		},
		导出数据() {
			let localData = localStorage.getItem("cp_zzz_computeData");

			var blob = new Blob([localData], {
				type: "application/json",
			});
			var date = new Date();
			time = date.getFullYear() + "-" + date.getMonth() + 1 + "-" + date.getDate() + " " + date.getHours() + "_" + date.getMinutes() + "_" + date.getSeconds();
			var fileName = "Wiki消耗计算器数据-绝区零-" + time;
			// 构建下载链接
			var url = window.URL.createObjectURL(blob);
			var link = document.createElement("a");
			link.href = url;
			link.setAttribute("download", fileName + ".json");
			link.click();
		},
		导入数据(e) {
			if (confirm("这将会清除现有的角色武器！！\n确定么")) {
				let that = this;

				var fileList = e.target.files;
				var reader = new FileReader();
				reader.onload = function (fileList) {
					var importData = JSON.parse(fileList.target.result);
					if (importData.versions == 1) {
						comFun.读取缓存(that, importData);
					}
				};
				reader.onloadend = function () {
					// that.设置包.设置 = false;
					// that.bgOn = false;
				};
				reader.readAsText(fileList[0], "UTF-8");
			}
		},
		加载Wiki数据() {
			if (this.Wiki储存 == "") {
				var that = this;
				var allData = [];
				new mw.Api()
					.get({
						action: "query",
						format: "json",
						meta: "userinfo",
						formatversion: "2",
						uiprop: "options",
						userId: (document.cookie.match(/DedeUserID=([^;]+)/) || [])[1] || "",
					})
					.then(function (data) {
						var options = data.query.userinfo.options;
						$.each([0, 1, 2], function (index, item) {
							var loadData = options["userjs-conputedData-zzz-" + item];
							if (loadData == undefined) {
								allData.push({
									name: "没有数据，请保存",
								});
							} else {
								var exportData = loadData.replace(/\^/g, '"');
								// var exportData = exportData.slice(1);
								// var exportData = exportData.slice(0, exportData.length - 1);
								exportData = JSON.parse(exportData);
								allData.push(exportData);
							}
						});
						that.Wiki储存 = allData;
					});
			}
		},
		导入Wiki数据(key) {
			var that = this;
			var wikiData = that.Wiki储存[key].data;
			if (wikiData !== undefined) {
				if (confirm("确定要读取“" + that.Wiki储存[key].name + "”么\n这会覆盖现有数据")) {
					comFun.读取缓存(that, JSON.parse(wikiData));
				}
			} else {
				alert("未储存数据");
			}
		},
		保存Wiki数据(name, key) {
			var that = this;
			var exportData = {};
			if (name == "没有数据，请保存") {
				exportData.name = "未命名数据";
			} else {
				exportData.name = name;
			}
			exportData.versions = originalData.参数设置.缓存数据版本;
			exportData.data = localStorage.getItem("cp_zzz_computeData");

			if (confirm("确定要覆盖这个插槽么")) {
				exportData = JSON.stringify(exportData).replace(/"/g, "^");
				new mw.Api()
					.postWithToken("csrf", {
						action: "options",
						format: "json",
						optionname: "userjs-conputedData-zzz-" + key,
						optionvalue: exportData,
					})
					.then(function (message) {
						alert("储存成功");
						exportData = JSON.parse(exportData.replace(/\^/g, '"'));
						that.Wiki储存[key] = exportData;
					})
					.catch(function (err) {
						if (err == "notloggedin") {
							alert("储存失败，请登录账号");
						} else {
							console.log(err);
							alert("储存失败");
						}
					});
			}
		},
		显示(type, shade = true) {
			this.设置[type] = !this.设置[type];
			if (shade) this.遮罩();
		},
		遮罩() {
			this.遮罩开关 = !this.遮罩开关;
			if (this.遮罩开关) {
				$("body").css("overflow", "hidden");
				$("#content").css("z-index", "5");
			} else {
				$("body").css("overflow", "");
			}
		},
		关闭遮罩() {
			var that = this;
			that.遮罩开关 = !that.遮罩开关;
			$.each(that.角色box, function (index, item) {
				item.显示[3] = false;
			});
			$.each(that.武器box, function (index, item) {
				item.显示[3] = false;
			});
			that.选中素材[0] = false;
			that.设置.背包素材显示 = false;
			that.设置.帮助 = false;
			$("body").css("overflow", "");
			$("#content").removeAttr("style", "z-index");
		},
	},
	mounted() {
		$("#onload").hide();
		$("#app").show();
	},
};
function onload() {
	app.mount("#app");
	console.log(`%c加载消耗计算器 %cBY:congeal_Plulme V_${originalData.参数设置.版本}`, "background: #4a5366;padding:4px 8px;color:#fff", " background: #d3bc8e;padding:4px 8px;");
}
var app = Vue.createApp(Counter);
onload();
