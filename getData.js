let imgUrlData = {};
let bagData = [];
let 核心技能材料 = [];
let 角色 = [];
let 武器 = [];

let 额外数据 = {
	丁尼: "https://patchwiki.biligame.com/images/zzz/6/6e/dn2u1isydrh5m1a6qq88bknbqv751wf.png",
};
$.each(额外数据, function (index, item) {
	imgUrlData[index] = item;
	bagData.push(index);
});
$(".wiki-data").each(function (iIndex, iItem) {
	let newData = {};
	let urlData;
	let that = $(this);
	let dataType = that.attr("data-type").split(",");
	// 表格是否需要倒序排列
	if (that.attr("data-order") == "desc") {
		urlData = that.find("tr").toArray().reverse();
	} else {
		urlData = that.find("tr");
	}
	$.each(urlData, function (index, item) {
		let name = $(this).find("td").eq(0).text();
		let url = $(this).find("td").eq(1).text();
		let urlHead = $(this).find("td").eq(2).text();
		if (dataType.indexOf("role") != -1) {
			let 稀有度 = $(this).find("td").eq(3).text();
			let 属性 = $(this).find("td").eq(4).text();
			let 特性 = $(this).find("td").eq(5).text();
			// let 核心技能材料 = $(this).find("td").eq(6).text()||"高维数据：提丰·重击者型";
			// let 核心技能材料2 = $(this).find("td").eq(7).text()||"源代码：狂如恶雨";
			let 核心技能材料 = $(this).find("td").eq(6).text();
			let 核心技能材料2 = $(this).find("td").eq(7).text();
			switch (属性) {
				case "冰":
					属性 = "冰结";
					break;
				case "火":
					属性 = "引燃";
					break;
				case "电":
					属性 = "电击";
					break;
			}
			角色.push({
				name,
				特性,
				属性,
				稀有度,
				核心技能材料,
				核心技能材料2,
			});
		} else if (dataType.indexOf("weapon") != -1) {
			let 稀有度 = $(this).find("td").eq(2).text();
			let 特性 = $(this).find("td").eq(3).text();
			武器.push({
				name,
				特性,
				稀有度,
			});
		} else if (dataType.indexOf("bag") != -1) {
			bagData.push(name);
		}
		if (dataType.indexOf("skill") != -1) {
			if (name.indexOf("：") == -1 && name.indexOf("芯片") == -1) {
				核心技能材料.push(name);
			}
		}
		if (that.attr("data-img") == "true") {
			if (url != "") imgUrlData[name] = url;
			if (urlHead != "") imgUrlData[`${name}头像`] = urlHead;
		}
	});
});

// originalData.imgUrlData = imgUrlData;
// originalData.bagData = bagData;
// originalData.核心技能材料 = 核心技能材料;
// originalData.角色 = 角色;
// originalData.武器 = 武器;
