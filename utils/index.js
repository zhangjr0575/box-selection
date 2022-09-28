/**
 * 透明颜色
 * @param {string} color - 待转换的颜色
 * @param {string} opacity - 透明度
 */
export function opacityColor(color, opacity = 0.7) {
	const _color = color.replace(/\s/g, "").toLowerCase();

	if (/^\#/.test(_color)) {
		const r = parseInt("0x" + _color.substring(1, 3));
		const g = parseInt("0x" + _color.substring(3, 5));
		const b = parseInt("0x" + _color.substring(5, 7));

		return `rgba(${r},${g},${b},${opacity})`;
	} else if (/^rgb/.test(_color)) {
		const colorParts = _color.slice(~_color.indexOf("rgba") ? 5 : 4, -1).split(",");

		return `rgba(${colorParts[0]},${colorParts[1]},${colorParts[2]},${(colorParts[3] || 1) * opacity})`;
	}
	return color;
}

/**
 * 检查两组矩形框是否相交, 采用顶点检测
 * @param {Object} rect1 - 第一个矩形框
 * @param {Object} rect2 - 第二个矩形框
 * @param {Boolean} reverse - 是否颠倒两个举行框检查
 * @returns {Boolean}
 */
export function isCrossRect(rect1, rect2, reverse = true) {
	function isInside(x, y) {
		// x方向相交性
		const _xInside = x === rect1.left || x === rect1.right || (x > rect1.left && x < rect1.right);
		// y方向相交性
		const _yInside = y === rect1.top || y === rect1.bottom || (y > rect1.top && y < rect1.bottom);

		return _xInside && _yInside;
	}
	const { left, top, right, bottom } = rect2;
	// 四组顶点只要一组顶点在目标矩形内即有效
	if (isInside(left, top) || isInside(left, bottom) || isInside(right, top) || isInside(right, bottom)) {
		return true;
	} else if (reverse) {
		return isCrossRect(rect2, rect1, false);
	}
	return false;
}
