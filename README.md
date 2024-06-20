<div align="center">
绝区零计算 角色 武器 升级所需材料的计算器

[BWiki地址](https://wiki.biligame.com/zzz/?curid=710)
</div>

## 功能一览
* 角色
  * 计算角色升级所需材料
  * 计算角色突破所需材料
  * 计算技能升级所需材料
* 武器
  * 计算武器升级所需材料
  * 计算武器突破所需材料
* 统计所需的所有材料
* 计算获取材料所需的体力与时间（需要完善副本掉落期望 [统计表格](https://docs.qq.com/sheet/DRFR6a3ZTRHhjUXp2?tab=BB08J2)

## 开发
请使用 [getData.js](getData.js) 去 [BWiki](https://wiki.biligame.com/zzz/?curid=710)手动获取实时数据 手搓 data-2.js 进行开发

data-2结构
```
window.originalData.角色 = []
window.originalData.武器 = []
window.originalData.bagData = []
window.originalData.imgUrlData = {}
```