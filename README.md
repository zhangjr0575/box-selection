## Describe

vue版本框选工具, 支持移动框选工具

## Installation

```
$ npm i @zhangjr0575/box-selection
```

## screenshot

![screenshot](https://i.postimg.cc/jdCXzb2s/Wechat-IMG65.png)

## 在 vue2 中使用

```vue
<template>
	<BoxSelection class="selection-box" classSelector="selection-item" modifierKey="ctrl" draggable
		@selection="onSelectionChange" @beforeMove="onRectBeforeMove" @move="onRectMove">
		<h2 class="title">选框工具</h2>
		<div class="selection-item" v-for="(item, index) in selectionItems" :id="item.id" :key="index"
			:style="{top: item.top + 'px', left: item.left + 'px'}">
			{{item.label}}
		</div>
	</BoxSelection>
</template>

<script>
import BoxSelection from "../../src";
export default {
	name: "App",
	components: { BoxSelection },
	data() {
		return {
			selectionItems: [
				{ id: "item1", label: "元素1", top: 50, left: 60 },
				{ id: "item2", label: "元素2", top: 233, left: 120 },
				{ id: "item3", label: "元素3", top: 258, left: 454 },
				{ id: "item4", label: "元素4", top: 786, left: 1457 },
				{ id: "item5", label: "元素5", top: 984, left: 277 },
				{ id: "item6", label: "元素6", top: 353, left: 787 },
				{ id: "item7", label: "元素7", top: 249, left: 1324 },
				{ id: "item8", label: "元素8", top: 456, left: 455 },
				{ id: "item9", label: "元素9", top: 951, left: 245 },
				{ id: "item10", label: "元素10", top: 357, left: 243 },
				{ id: "item11", label: "元素11", top: 258, left: 775 },
				{ id: "item12", label: "元素12", top: 741, left: 358 }
			]
		};
	},
	methods: {
		onSelectionChange(els) {
			this._selectionEls = els;
		},
		onRectBeforeMove() {
			this._selection = this._selectionEls.map(el => {
				return { ...this.selectionItems.find(item => item.id === el.id) };
			});
		},
		onRectMove({ diff }) {
			this._selection.forEach(node => {
				const _target = this.selectionItems.find(item => item.id === node.id);

				if (_target) {
					_target.top = node.top + diff.y;
					_target.left = node.left + diff.x;
				}
			});
		}
	}
};
</script>

<style>
html, body {
	margin: 0;
	height: 100%;
}
.selection-box {
	position: relative;
	width: 100%;
	height: 100%;
}
.title {
	text-align: center;
}
.selection-item {
	position: absolute;
	width: 80px;
	height: 40px;
	line-height: 40px;
	text-align: center;
	background-color: beige;
}
</style>
```

## props属性表
| 属性名          | 数据类型 | 默认值  | 说明 |
| ---------------| -------| ------- | ---- |
| modifierKey    | String | 无     | 某些时候我们可能已经监听了鼠标的相关事件, 为避免事件冲突, 我们可以使用添加修饰键形成组合键的方式来规避冲突 |
| sizeThreshold  | Number | 20     | 选框尺寸最小阈值,尺寸在阈值内的选框将不会生效 |
| borderColor    | String | #409EFF| 选框的边框色,选框的背景色将会对选框边框色做透明0.1倍处理,请使用16进制或rgb或rgba, 暂不支持类似red的颜色值 |
| classSelector  | String | 无     | 某些时候我们可能只需要框选指定的元素, 那class选择器将会有用处 |
| draggable      | Boolean| false  | 选框是否允许被拖动, 在同时选中多个元素并拖动它们的业务中它将至关重要 |

## 事件
-   @selection 当选框发生变化时触发, 参数为当前选框下的所有dom元素
-   @beforeMove 选框开始移动时触发
-   @move 选框移动时触发
-   @afterMove 选框结束移动时触发
