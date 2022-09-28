<template>
	<div class="layout">
		<h2 class="layout-header">选框工具</h2>
		<div class="layout-content">
			<div class="selection-item" v-for="(item, index) in selectionItems" :id="item.id" :key="index"
				:style="{top: item.top + 'px', left: item.left + 'px'}">
				{{item.label}}
			</div>
		</div>
	</div>
</template>

<script>
// import SelectionBox from "../../../package/SelectionBox";
import SelectionBox from "../../../lib";

export default {
	name: "Layout",
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
	mounted() {
		this.init();
	},
	methods: {
		init() {
			this.selectionBoxInstance = new SelectionBox({
				modifierKey: "ctrl",
				classSelector: "selection-item",
				onSelection: this.onSelectionChange,
				onBeforeMove: this.onRectBeforeMove,
				onMove: this.onRectMove
			});
		},
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

<style lang="scss" scoped>
.layout {
	height: 100%;
	display: flex;
	flex-direction: column;

	&-header {
		height: 44px;
		line-height: 44px;
		text-align: center;
	}

	&-content {
		flex: 1;
	}

	&-main {
		width: 5000px;
		height: 5000px;
	}
}
.selection-box {
	position: relative;
	width: 100%;
	height: 100%;
	max-width: 100%;
	max-height: 100%;
	overflow: scroll;
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
