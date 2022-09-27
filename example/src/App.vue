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
html,
body {
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
