var objectAssign = require('object-assign');

function StylePlugin(component) {
	this.component = component;
	this.x = null;
	this.y = null;
	this.offsetX = 0;
	this.offsetY = 0;
	this.scale = null;
	this.width = null;
	this.height = null;
	this.opacity = null;
	this.speed = 1.7;
	this.rotation = null;
	this.transition = null;
	this.display = null;
	this.customStyle = {};

	this.unit = {
		x: 'px',
		y: 'px',
		width: 'px',
		height: 'px',
		rotation: 'rad'
	};
};

StylePlugin.prototype.setCustomStyle = function (style, silently) {
	this.customStyle = style;
	if (!silently) { this.updateStyleState(); }
};

StylePlugin.prototype.getStyleState = function () {
	var style = objectAssign({}, this.customStyle);
	var unit = this.unit;
	if (this.width !== null) { style['width'] = this.width + unit.width; }
	if (this.height !== null) { style['height'] = this.height + unit.width; }
	if (this.opacity !== null) { style['opacity'] = this.opacity; }
	if (this.transition !== null) { style['transition'] = this.transition; }
	if (this.display !== null) { style['display'] = this.display; }

	var transform = '';
	if (this.x !== null || this.y !== null) { transform += 'translate3d(' + (this.x || 0) + unit.x + ',' + (this.y || 0) + unit.y + ',0px) '; }
	if (this.scale !== null ) { transform += 'scale(' + (this.scale) + ') '; }
	if (this.rotation !== null ) { transform += 'rotate(' + (this.rotation) + unit.rotation + ')'; }
	if (transform !== '') {
		style['transform'] = transform;
	}

	return style;
};

StylePlugin.prototype.updateStyleState = function () {
	if (this.component) {
		this.component.setState({ style: this.getStyleState() });
	}
};

StylePlugin.prototype.updateFromProps = function (style) {
	var changed = false;
	for (var property in style) {
		var styleValue = style[property];
		if (style.hasOwnProperty(property) && this[property] !== styleValue) {
			this[property] = style[property];
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

StylePlugin.prototype.componentWillUnmount = function () {
	this.component = null;
};

StylePlugin.prototype.componentWillReceiveProps = function (nextProps) {
	if (nextProps.style) {
		this.updateFromProps(nextProps.style);
	}
};

StylePlugin.prototype.setUnits = function (units) {
	for (var property in units) {
		this.unit[property] = units[property];
	}
};

StylePlugin.prototype.setUnit = function (property, unit) {
	this.unit[property] = unit;
};

StylePlugin.prototype.setTransition = function (transition, silently) {
	this.transition = transition;
	if (!silently) { this.updateStyleState(); }
};

StylePlugin.prototype.setDimensions = function (width, height, silently) {
	this.width = width;
	this.height = height;
	if (!silently) { this.updateStyleState(); }
};

StylePlugin.prototype.setWidth = function (width, silently) {
	this.width = width;
	if (!silently) { this.updateStyleState(); }
};

StylePlugin.prototype.setHeight = function (height, silently) {
	this.height = height;
	if (!silently) { this.updateStyleState(); }
};

StylePlugin.prototype.setOpacity = function (opacity, silently) {
	this.opacity = opacity;
	if (!silently) { this.updateStyleState(); }
};

StylePlugin.prototype.setPositionOffset = function (offsetX, offsetY) {
	this.offsetX = offsetX;
	this.offsetY = offsetY;
};

StylePlugin.prototype.setPosition = function (x, y, silently) {
	this.x = x;
	this.y = y;
	if (!silently) { this.updateStyleState(); }
};

StylePlugin.prototype.setScale = function (scale, silently) {
	this.scale = scale;
	if (!silently) { this.updateStyleState(); }
};

StylePlugin.prototype.setRotation = function (rotation, silently) {
	this.rotation = rotation;
	if (!silently) { this.updateStyleState(); }
};

StylePlugin.prototype.setProperty = function (property, value, silently) {
	if (this.hasOwnProperty(property) && this[property] !== value) {
		this[property] = value;
		if (!silently) { this.updateStyleState(); }
	}
};

StylePlugin.prototype.setProperties = function (properties, silently) {
	var changed = false;
	for (var property in properties) {
		var value = properties[property];
		if (properties.hasOwnProperty(property) && this[property] !== value) {
			this[property] = value;
			changed = true;
		}
	}

	if (!silently && changed) { this.updateStyleState(); }
};

StylePlugin.prototype.transform = function (transform, silently) {
	this.setProperties(transform, silently);
};

StylePlugin.prototype.transformTo = function (transform) {
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

	this.setTransition('transform ' + duration + 'ms linear', true);
	this.transform(transform);

	var self = this;
	return new Promise(function (resolve) {
		self.transformToResolve = resolve;
		self.transformToTimeout = window.setTimeout(function () {
			self.isTransitioning = false;
			self.setTransition(self.backupTransition);
			self.transformToResolve = null;
			resolve();
		}, duration);
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
	})
};

StylePlugin.prototype.hide = function (silently) {
	this.display = 'none';
	if (!silently) { this.updateStyleState(); }
};

module.exports = StylePlugin;