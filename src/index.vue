<template>
	<div class="box-selection" @mousedown="mouseDown" @contextmenu.prevent>
		<slot></slot>
		<div class="box-selection-rect" v-if="rect.top !== null" :style="[selectionRectStyle, {backgroundColor: rectBgcolor}]"
			@mousedown.stop="rectMouseDown" @mouseup.stop="rectMouseUp" @click.stop>
		</div>
	</div>
</template>

<script>
import { opacityColor, isCrossRect } from "./utils";

export default {
	name: "box-selection",
	props: {
		// 修饰键, 为了规避和部分鼠标事件相互冲突
		modifierKey: {
			type: String,
			default: ""
		},
		// 选框尺寸阈值
		sizeThreshold: {
			type: Number,
			default: 20
		},
		borderColor: {
			type: String,
			default: "#409EFF"
		},
		classSelector: {
			type: String,
			default: ""
		},
		draggable: {
			type: Boolean,
			default: false
		}
	},
	data() {
		return {
			rect: {
				top: null,
				left: null,
				right: null,
				bottom: null
			}
		};
	},
	computed: {
		selectionRectStyle() {
			return {
				top: this.rect.top + "px",
				left: this.rect.left + "px",
				right: this._clientWidth - this.rect.right + "px",
				bottom: this._clientHeight - this.rect.bottom + "px",
				borderColor: this.borderColor,
				backgroundColor: this.rectBg
			};
		},
		rectBgcolor() {
			return opacityColor(this.borderColor, 0.1);
		}
	},
	mounted() {
		this._clientWidth = this.$el.clientWidth;
		this._clientHeight = this.$el.clientHeight;

		this.addMouseListener();
	},
	beforeDestroy() {
		this.removeMouseListener();
	},
	methods: {
		addMouseListener() {
			this._mouseMove = this.mouseMove.bind(this);
			this._mouseUp = this.mouseUp.bind(this);
			this._rectMouseMove = this.rectMouseMove.bind(this);
			this._click = this.clearSelectionBox.bind(this);

			document.addEventListener("mousemove", this._mouseMove);
			document.addEventListener("mouseup", this._mouseUp);
			this.draggable && document.addEventListener("mousemove", this._rectMouseMove);
			document.addEventListener("click", this._click);
		},
		removeMouseListener() {
			document.removeEventListener("mousemove", this._mouseMove);
			document.removeEventListener("mouseup", this._mouseUp);
			document.removeEventListener("mousemove", this._rectMouseMove);
			document.removeEventListener("click", this._click);
		},
		updateSelectionBoxRect(x1, y1, x2, y2) {
			// 当结束点的x坐标位于开始点的左侧时, x坐标互换
			if (x2 < x1) {
				this.rect.left = x2;
				this.rect.right = x1;
			} else {
				this.rect.left = x1;
				this.rect.right = x2;
			}
			// 当结束点的y坐标位于开始点的上方时, y坐标互换
			if (y2 < y1) {
				this.rect.top = y2;
				this.rect.bottom = y1;
			} else {
				this.rect.top = y1;
				this.rect.bottom = y2;
			}
		},
		getBoxSelectionTargets() {
			const selectionTargets = [];

			for (let i = 0; i < this.$slots.default.length; i++) {
				const _elm = this.$slots.default[i].elm;
				const _rect = _elm.getBoundingClientRect();
				// 过滤掉不满足的dom
				if (this.classSelector && !_elm.classList.contains(this.classSelector)) continue;
				// 判断当前元素与选框是否相交
				isCrossRect(this.rect, _rect) && selectionTargets.push(this.$slots.default[i].elm);
			}
			return selectionTargets;
		},
		rectMouseDown(evt) {
			if (!this.draggable) return;

			this._rectStartPoint = {
				origin: { ...this.rect },
				start: { x: evt.clientX, y: evt.clientY }
			};
			this.$emit("beforeMove");
		},
		rectMouseMove(evt) {
			if (!this._rectStartPoint || !this.draggable) return;

			const diff = {
				x: evt.clientX - this._rectStartPoint.start.x,
				y: evt.clientY - this._rectStartPoint.start.y
			};
			this.rect.left = this._rectStartPoint.origin.left + diff.x;
			this.rect.right = this._rectStartPoint.origin.right + diff.x;
			this.rect.top = this._rectStartPoint.origin.top + diff.y;
			this.rect.bottom = this._rectStartPoint.origin.bottom + diff.y;

			this.$emit("move", { diff });
		},
		rectMouseUp(evt) {
			if (!this._rectStartPoint || !this.draggable) return;

			this._rectStartPoint = null;
			this.$emit("afterMove");
		},
		// 鼠标按下回调事件
		mouseDown(evt) {
			if (this.modifierKey && !evt[`${this.modifierKey.toLowerCase()}Key`]) return;

			this.mouseStartPoint = { x: evt.clientX, y: evt.clientY, timeStamp: evt.timeStamp };
		},
		mouseMove(evt) {
			this.mouseStartPoint && this.updateSelectionBoxRect(this.mouseStartPoint.x, this.mouseStartPoint.y, evt.clientX, evt.clientY);
		},
		// 鼠标抬起
		mouseUp() {
			const width = this.rect.right - this.rect.left;
			const height = this.rect.bottom - this.rect.top;
			// 当选框达不到阈值要求或点击事件时,设置当前选框无效
			if (width < this.sizeThreshold && height < this.sizeThreshold) {
				this.clearSelectionBox();
			} else {
				this.$emit("selection", this.getBoxSelectionTargets());
			}
			this.mouseStartPoint = null;
		},
		clearSelectionBox() {
			if (this.rect.top === null) return;

			this.rect.top = null;
			this.rect.left = null;
			this.rect.right = null;
			this.rect.bottom = null;
			this.$emit("selection", []);
		}
	}
};
</script>

<style lang="scss" scoped>
.box-selection {
	user-select: none;
}
.box-selection-rect {
	position: fixed;
	border-width: 1px;
	border-style: solid;
	z-index: 9999;
}
</style>