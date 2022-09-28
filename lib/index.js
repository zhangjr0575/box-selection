import { opacityColor, isCrossRect } from "../utils";

const _defConfig = {
	modifierKey: "",
	// 选框尺寸阈值
	sizeThreshold: 20,
	borderColor: "#409EFF",
	classSelector: "",
	draggable: true
};
// 临时缓存
const tempCache = {};

// 生成框选对象
function createSelectionBoxEl({ borderColor }) {
	const el = document.createElement("div");
	// 使用窗口定位
	el.style.position = "fixed";
	// 设置边框
	el.style.border = `1px solid ${borderColor}`;
	// 设置背景色
	el.style.backgroundColor = opacityColor(borderColor, 0.1);

	return el;
}

export default class SelectionBox {
	constructor(params = {}) {
		this.config = Object.assign(_defConfig, params);
		// modifierKey格式化
		this.config.modifierKey = this.config.modifierKey.toLowerCase();
		// classSelector必填
		if (!this.config.classSelector) throw TypeError(`classSelector参数必填`);
		// 设置框选对象布局信息
		this.$rect = {
			top: null,
			left: null,
			right: null,
			bottom: null
		};
		// 生成框选对象
		this.$el = createSelectionBoxEl(this.config);
		// 将框选对象添加到body中
		document.body.appendChild(this.$el);
		// 关闭user-select
		document.body.style["user-select"] = "none";
		// 事件批量注册
		this.addEventListener();
	}
	mouseDown(evt) {
		if (this.config.modifierKey && !evt[`${this.config.modifierKey}Key`]) return;

		tempCache.mouseStartPoint = { x: evt.clientX, y: evt.clientY, timeStamp: evt.timeStamp };
	}
	rectMouseDown(evt) {
		evt.preventDefault();
		evt.stopPropagation();
		// 检查是否允许拖动选框
		if (this.config.draggable) {
			tempCache.rectStartPoint = {
				origin: { ...this.$rect },
				start: { x: evt.clientX, y: evt.clientY }
			};
			this.emit("onBeforeMove", tempCache.rectStartPoint, evt);
		}
	}
	mouseMove(evt) {
		if (tempCache.mouseStartPoint) {
			this.updateSelectionBoxRect(tempCache.mouseStartPoint.x, tempCache.mouseStartPoint.y, evt.clientX, evt.clientY);
		} else if (tempCache.rectStartPoint) {
			const diff = {
				x: evt.clientX - tempCache.rectStartPoint.start.x,
				y: evt.clientY - tempCache.rectStartPoint.start.y
			};
			const { left, top, right, bottom } = tempCache.rectStartPoint.origin;
			// prettier-ignore
			const _left = left + diff.x, _right = right + diff.x, _top = top + diff.y, _bottom = bottom + diff.y;
			// 控制x方向的移动距离
			if (_left <= 0) diff.x -= _left;
			else if (_right >= innerWidth) diff.x -= _right - innerWidth;
			// 控制y方向的移动距离
			if (_top <= 0) diff.y -= _top;
			else if (_bottom >= innerHeight) diff.y -= _bottom - innerHeight;

			this.updateSelectionBoxRect(left + diff.x, top + diff.y, right + diff.x, bottom + diff.y);

			this.emit("onMove", { diff }, evt);
		}
	}
	mouseUp(evt) {
		if (tempCache.rectStartPoint) {
			evt.preventDefault();
			evt.stopPropagation();
			delete tempCache.rectStartPoint;
			this.emit("onAfterMove", undefined, evt);
		} else if (tempCache.mouseStartPoint) {
			const width = this.$rect.right - this.$rect.left;
			const height = this.$rect.bottom - this.$rect.top;
			// 当选框达不到阈值要求或点击事件时,设置当前选框无效
			if (width < this.config.sizeThreshold && height < this.config.sizeThreshold) {
				this.clearSelectionBox();
				this.emit("onSelection", [], evt);
			} else {
				this.emit("onSelection", this.getBoxSelectionTargets(), evt);
			}
			delete tempCache.mouseStartPoint;
		} else if (this.$rect.top !== null) {
			this.clearSelectionBox();
			this.emit("onSelection", []);
		}
	}
	getBoxSelectionTargets() {
		const selectionTargets = [];
		const _elements = document.getElementsByClassName(this.config.classSelector);

		for (let i = 0; i < _elements.length; i++) {
			const _rect = _elements[i].getBoundingClientRect();
			// 判断当前元素与选框是否相交
			isCrossRect(this.$rect, _rect) && selectionTargets.push(_elements[i]);
		}
		return selectionTargets;
	}
	clearSelectionBox() {
		this.$rect.top = null;
		this.$rect.left = null;
		this.$rect.right = null;
		this.$rect.bottom = null;

		this.updateselectionBoxPos();
	}
	// prettier-ignore
	updateSelectionBoxRect(x1, y1, x2, y2, shape = false) {
		let left = x1, right = x2, top = y1, bottom = y2;
		// 当结束点的x坐标位于开始点的左侧时, x坐标互换
		if (x2 < x1) { left = x2; right = x1; }
		// 当结束点的y坐标位于开始点的上方时, y坐标互换
		if (y2 < y1) { top = y2; bottom = y1; }
		// 检查是否允许选框形变
		if (shape) {
			if (left <= 0) {
				left = 0; right = this.$rect.right;
			} else  if (right >= innerWidth) {
				right = innerWidth; left = this.$rect.left;
			}
			if (top <= 0) {
				top = 0; bottom = this.$rect.bottom;
			} else if (bottom >= innerHeight) {
				bottom = innerHeight; top = this.$rect.top;
			}
		}
		this.$rect.top = Math.max(top, 0);
		this.$rect.left = Math.max(left, 0);
		this.$rect.right = Math.min(right, innerWidth);
		this.$rect.bottom = Math.min(bottom, innerHeight);

		this.updateselectionBoxPos();
	}
	updateselectionBoxPos() {
		if (this.$rect.top === null) {
			this.$el.style.display = "none";
		} else {
			this.$el.style.display = "block";
			// 使用top, left, right, bottom设置位置时会受到滚动条的干扰(滚动条默认会挤压页面空间)
			this.$el.style.top = this.$rect.top + "px";
			this.$el.style.left = this.$rect.left + "px";
			this.$el.style.width = this.$rect.right - this.$rect.left + "px";
			this.$el.style.height = this.$rect.bottom - this.$rect.top + "px";
		}
	}
	// prettier-ignore
	addEventListener() {
		tempCache.mouseDown = this.mouseDown.bind(this);
		tempCache.mouseMove = this.mouseMove.bind(this);
		tempCache.mouseUp = this.mouseUp.bind(this);
		tempCache.contextmenu = function (evt) { evt.preventDefault(); evt.stopPropagation() };
		tempCache.rectMouseDown = this.rectMouseDown.bind(this);

		document.addEventListener("mousedown", tempCache.mouseDown);
		document.addEventListener("mousemove", tempCache.mouseMove);
		document.addEventListener("mouseup", tempCache.mouseUp);
		document.addEventListener("contextmenu", tempCache.contextmenu);
		this.$el.addEventListener("mousedown", tempCache.rectMouseDown);
	}
	emit(eventName, params1, params2) {
		typeof this.config[eventName] === "function" && this.config[eventName](params1, params2);
	}
	dispose() {
		document.removeEventListener("mousedown", tempCache.mouseDown);
		document.removeEventListener("mousemove", tempCache.mouseMove);
		document.removeEventListener("mouseup", tempCache.mouseUp);
		document.removeEventListener("contextmenu", tempCache.contextmenu);
		this.$el.removeEventListener("mousedown", tempCache.rectMouseDown);
		// 释放临时缓存对象
		for (let key in tempCache) delete tempCache[key];
	}
}
