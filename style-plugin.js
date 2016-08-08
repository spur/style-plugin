var objectAssign = require('object-assign');

var simpleProperties = [
	'width',
	'height',
	'opacity',
	'border',
	'borderWidth',
	'transition',
	'display',
	'position',
	'zIndex',
	'top',
	'right',
	'bottom',
	'left',
	'backgroundColor',
	'backgroundImage',
	'transformOrigin',
	'margin',
	'marginTop',
	'marginRight',
	'marginBottom',
	'marginLeft',
	'padding',
	'paddingTop',
	'paddingRight',
	'paddingBottom',
	'paddingLeft',
	'pointerEvent'
];

var javascriptToCss = {
	zIndex: 'z-index',
	borderWidth: 'border-width',
	backgroundColor: 'background-color',
	backgroundImage: 'background-image',
	transformOrigin: 'transform-origin',
	marginTop: 'margin-top',
	marginLeft: 'margin-right',
	marginBottom: 'margin-bottom',
	marginLeft: 'margin-left',
	paddingTop: 'padding-top',
	paddingRight: 'padding-right',
	paddingBottom: 'padding-bottom',
	paddingLeft: 'padding-left',
	pointerEvent: 'pointer-event'
};

function toCssProperty(property) {
	return javascriptToCss[property] || property;
}

function StylePlugin(component) {
	this.component = component;
	this.speed = 1.7;

	this.mutateDOM = false;

	this.unit = {
		top: 'px',
		right: 'px',
		bottom: 'px',
		left: 'px',
		x: 'px',
		y: 'px',
		z: 'px',
		width: 'px',
		height: 'px',
		rotate: 'rad',
		marginTop: 'px',
		marginRight: 'px',
		marginBottom: 'px',
		marginLeft: 'px',
		paddingTop: 'px',
		paddingRight: 'px',
		paddingBottom: 'px',
		paddingLeft: 'px'
	};
}

StylePlugin.plugName = 'style';

StylePlugin.prototype.setCustomStyle = function (style, silently) {
	this.customStyle = style;
	if (!silently) { this.updateStyleState(); }
};

StylePlugin.prototype.getStyleState = function () {
	var style = objectAssign({}, (this.customStyle || {}));
	var unit = this.unit;

	for (var i = 0, len = simpleProperties.length; i < len; i += 1) {
		var key = simpleProperties[i];
		var value = this[key];
		if (value !== undefined) { style[key] = value + (unit[key] || '') }
	}

	var transform = '';
	if (this.x !== undefined || this.y !== undefined) {
		transform += 'translate3d(' + (this.x || 0) + unit.x + ',' + (this.y || 0) + unit.y + ',' + (this.z || 0) + unit.z + ')';
	}
	if (this.scale !== undefined) { transform += 'scale(' + (this.scale) + ') '; }
	if (this.rotate !== undefined) { transform += 'rotate(' + (this.rotate) + unit.rotate + ')'; }
	if (transform !== '') {
		style.transform = transform;
	}

	return style;
};

StylePlugin.prototype.getStyleText = function () {
	var style = '';

	var customStyle = this.customStyle;
	if (customStyle) {
		var customStyleKeys = Object.keys(customStyle);
		for (var i = 0, len = customStyleKeys.length; i < len; i += 1) {
			const key = customStyleKeys[i];
			style += toCssProperty(key) + ':' + this.customStyle[key] + ';';
		}
	}

	var unit = this.unit;
	for (var i = 0, len = simpleProperties.length; i < len; i += 1) {
		var key = simpleProperties[i];
		var value = this[key];
		if (value !== undefined) { style += toCssProperty(key) + ':' + value + (unit[key] || '') + ';' }
	}

	var transform = '';
	if (this.x !== undefined || this.y !== undefined) {
		transform += 'translate3d(' + (this.x || 0) + unit.x + ',' + (this.y || 0) + unit.y + ',' + (this.z || 0) + unit.z + ')';
	}
	if (this.scale !== undefined) { transform += 'scale(' + (this.scale) + ') '; }
	if (this.rotate !== undefined) { transform += 'rotate(' + (this.rotate) + unit.rotate + ')'; }

	if (transform !== '') {
		style += 'transform:' + transform + ';';
	}

	return style;
};

StylePlugin.prototype.updateStyleState = function () {
	if (this.component && !this.mutateDOM) {
		this.component.setState({ style: this.getStyleState() });
	}

	if (this.DOMNode && this.mutateDOM) {
		this.DOMNode.style.cssText = this.getStyleText();
	}
};

StylePlugin.prototype.updateFromProps = function (style) {
	var changed = false;
	for (var property in style) {
		var styleValue = style[property];
		if (style.hasOwnProperty(property) && this[property] !== styleValue) {
			if (styleValue === null) {
				delete this[property];
			} else {
				this[property] = styleValue;
			}
			changed = true;
		}
	}

	if (changed) {
		this.updateStyleState();
	}
};

StylePlugin.prototype.componentWillMount = function () {
	if (this.component.props.style) {
		this.updateFromProps(this.component.props.style);
	} else {
		this.updateStyleState();
	}
};

StylePlugin.prototype.componentDidMount = function (DOMNode) {
	if (this.manualNode) {
		return;
	}
	this.DOMNode = DOMNode;
	if (this.mutateDOM) { this.updateStyleState(); }
};

StylePlugin.prototype.componentWillUnmount = function () {
	this.DOMNode = null;
};

StylePlugin.prototype.componentWillReceiveProps = function (nextProps) {
	if (nextProps.style) {
		this.updateFromProps(nextProps.style);
	}
};

StylePlugin.prototype.setDOMNode = function (DOMNode) {
	this.DOMNode = DOMNode;
	this.manualNode = true;
	if (this.mutateDOM) { this.updateStyleState(); }
};

StylePlugin.prototype.setUnits = function (units) {
	for (var property in units) {
		this.unit[property] = units[property];
	}
};

StylePlugin.prototype.setDisplay = function (display, silently) {
	this.setProperty('display', display, silently);
};

StylePlugin.prototype.setZIndex = function (zIndex, silently) {
	this.setProperty('zIndex', zIndex, silently);
};

StylePlugin.prototype.setUnit = function (property, unit) {
	this.unit[property] = unit;
};

StylePlugin.prototype.setTransition = function (transition, silently) {
	this.setProperty('transition', transition, silently);
};

StylePlugin.prototype.moveBy2D = function (x, y, silently) {
	if (this.x === undefined) { this.x = 0; }
	if (this.y === undefined) { this.y = 0; }
	this.x += x;
	this.y += y;
	if (!silently) { this.updateStyleState(); }
};

StylePlugin.prototype.setDimensions = function (width, height, silently) {
	if (width === null) {
		delete this.width;
	} else {
		this.width = width;
	}
	if (height === null) {
		delete this.height;
	} else {
		this.height = height;
	}
	if (!silently) { this.updateStyleState(); }
};

StylePlugin.prototype.setWidth = function (width, silently) {
	this.setProperty('width', width, silently);
};

StylePlugin.prototype.setHeight = function (height, silently) {
	this.setProperty('height', height, silently);
};

StylePlugin.prototype.setOpacity = function (opacity, silently) {
	this.setProperty('opacity', opacity, silently);
};

StylePlugin.prototype.setPosition = function (x, y, silently) {
	if (x === null) {
		delete this.x;
	} else {
		this.x = x;
	}

	if (y === null) {
		delete this.y;
	} else {
		this.y = y;
	}
	if (!silently) { this.updateStyleState(); }
};

StylePlugin.prototype.setScale = function (scale, silently) {
	this.setProperty('scale', scale, silently);
};

StylePlugin.prototype.setRotation = function (rotate, silently) {
	this.setProperty('rotate', rotate, silently);
};

StylePlugin.prototype.setProperty = function (property, value, silently) {
	if (this[property] !== value) {
		if (value === null) {
			delete this[property];
		} else {
			this[property] = value;
		}
		if (!silently) { this.updateStyleState(); }
	}
};

StylePlugin.prototype.setProperties = function (properties, silently) {
	var changed = false;
	for (var property in properties) {
		var value = properties[property];
		if (properties.hasOwnProperty(property) && this[property] !== value && property !== 'duration') {
			if (value === null) {
				delete this[property];
			} else {
				this[property] = value;
			}
			changed = true;
		}
	}

	if (!silently && changed) { this.updateStyleState(); }
	return changed;
};

StylePlugin.prototype.transform = function (transform, silently) {
	this.setProperties(transform, silently);
};

StylePlugin.prototype.transformTo = function (transform, silently) {
	var duration = transform.duration;
	if (!transform.hasOwnProperty('duration')) {
		var x = transform.hasOwnProperty('x') ? transform.x : this.x;
		var y = transform.hasOwnProperty('y') ? transform.y : this.y;

		var deltaX = this.x - x;
		var deltaY = this.y - y;
		var distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
		duration = Math.floor(distance / this.speed);
	}

	if (this.isTransitioning) {
		window.clearTimeout(this.transformToTimeout);
		this.transformToResolve(true);
	} else {
		this.isTransitioning = true;
		this.backupTransition = this.transition;
	}

	this.setTransition('all ' + duration + 'ms linear', true);
	var changed = this.setProperties(transform, silently);

	var self = this;
	return new Promise(function (resolve) {
		self.transformToResolve = resolve;
		if (self.DOMNode && changed) {
			self.DOMNode.removeEventListener('transitionend', self.transformToListener, false);
			self.transformToListener = function (e) {
				if (e.target !== self.DOMNode) { return; }
				self.isTransitioning = false;
				self.setTransition(self.backupTransition, true);
				self.DOMNode.removeEventListener('transitionend', self.transformToListener, false);
				self.transformToListener = null;
				self.transformToResolve = null;
				resolve();
			}
			self.DOMNode.addEventListener('transitionend', self.transformToListener, false);
		} else {
			self.transformToTimeout = window.setTimeout(function () {
				self.isTransitioning = false;
				self.setTransition(self.backupTransition, true);
				self.transformToResolve = null;
				resolve();
			}, duration);
		}
	}).catch(function (e) {
		console.error('StylePlugin.transformTo', e);
	});
};

StylePlugin.prototype.show = function (silently) {
	var self = this;
	return new Promise(function (fulfill) {
		self.display = '';
		if (!silently) { self.updateStyleState(); }
		fulfill();
	});
};

StylePlugin.prototype.hide = function (silently) {
	this.display = 'none';
	if (!silently) { this.updateStyleState(); }
};

module.exports = StylePlugin;
