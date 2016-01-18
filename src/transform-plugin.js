var objectAssign = require('object-assign');

function TransformPlugin(component) {
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

TransformPlugin.prototype.setCustomStyle = function (style, silently) {
  this.customStyle = style;
  if (!silently) { this.updateStyleState(); }
};

TransformPlugin.prototype.getStyleState = function () {
  var style = objectAssign({}, this.customStyle);
  if (this.width !== null) { style['width'] = this.width + this.unit.width; }
  if (this.height !== null) { style['height'] = this.height + this.unit.width; }
  if (this.opacity !== null) { style['opacity'] = this.opacity; }
  if (this.transition !== null) { style['transition'] = this.transition; }
  if (this.display !== null) { style['display'] = this.display; }

  var transform = '';
  if (this.x !== null || this.y !== null) { transform += 'translate3d(' + (this.x || 0) + this.unit.x + ',' + (this.y || 0) + this.unit.y + ',0px)'; }
  if (this.scale !== null ) { transform += 'scale(' + (this.scale) + ')'; }
  if (this.rotation !== null ) { transform += 'rotation(' + (this.rotation) + this.unit.rotation + ')'; }
  if (transform !== '') {
    style['transform'] = transform;
  }

  return style;
};

TransformPlugin.prototype.updateStyleState = function () {
  this.component.setState({ transformStyle: this.getStyleState() });
};

TransformPlugin.prototype.updateFromProps = function (transform) {
  if (transform.x !== undefined) { this.x = transform.x; }
  if (transform.y !== undefined) { this.y = transform.y; }
  if (transform.scale !== undefined) { this.scale = transform.scale; }
  if (transform.rotation !== undefined) { this.rotation = transform.rotation; }
  if (transform.opacity !== undefined) { this.opacity = transform.opacity; }
  if (transform.width !== undefined) { this.width = transform.width; }
  if (transform.height !== undefined) { this.height = transform.height; }
  if (transform.transition !== undefined) { this.transition = transform.transition; }
  if (transform.display !== undefined) { this.display = transform.display; }
};

TransformPlugin.prototype.componentWillMount = function () {
  if (this.component.props.transform) {
    this.updateFromProps(this.component.props.transform);
  }
  this.updateStyleState();
};

TransformPlugin.prototype.componentWillReceiveProps = function (nextProps) {
  if (nextProps.transform) {
    this.updateFromProps(nextProps.transform);
    this.updateStyleState();
  }
};

TransformPlugin.prototype.setUnits = function (units) {
  for (var property in units) {
    this.unit[property] = units[property];
  }
};

TransformPlugin.prototype.setUnit = function (property, unit) {
  this.unit[property] = unit;
};

TransformPlugin.prototype.setTransition = function (transition, silently) {
  this.transition = transition;
  if (!silently) { this.updateStyleState(); }
};

TransformPlugin.prototype.setDimensions = function (width, height, silently) {
  this.width = width;
  this.height = height;
  if (!silently) { this.updateStyleState(); }
};

TransformPlugin.prototype.setWidth = function (width, silently) {
  this.width = width;
  if (!silently) { this.updateStyleState(); }
};

TransformPlugin.prototype.setHeight = function (height, silently) {
  this.height = height;
  if (!silently) { this.updateStyleState(); }
};

TransformPlugin.prototype.setOpacity = function (opacity, silently) {
  this.opacity = opacity;
  if (!silently) { this.updateStyleState(); }
};

TransformPlugin.prototype.setPositionOffset = function (offsetX, offsetY) {
  this.offsetX = offsetX;
  this.offsetY = offsetY;
};

TransformPlugin.prototype.setPosition = function (x, y, silently) {
  this.x = x;
  this.y = y;
  if (!silently) { this.updateStyleState(); }
};

TransformPlugin.prototype.setScale = function (scale, silently) {
  this.scale = scale;
  if (!silently) { this.updateStyleState(); }
};

TransformPlugin.prototype.setRotation = function (rotation, silently) {
  this.rotation = rotation;
  if (!silently) { this.updateStyleState(); }
};

TransformPlugin.prototype.scaleTo = function (scale, time) {
  time = time || 200;

  this.isTransitioning = true;
  window.clearTimeout(this.transformToTimeout);
  var backupTransition = this.transition;
  this.transition = 'transform ' + time + 'ms linear';
  this.setScale(scale);

  var self = this;
  return new Promise(function (resolve, reject) {
    self.transformToTimeout = window.setTimeout(function () {
      window.clearTimeout(self.transformToTimeout);
      self.isTransitioning = false;
      self.transition = backupTransition;
      self.updateStyleState();
      resolve();
    }, time);
  });
};

TransformPlugin.prototype.transform = function (transform, silently) {
  if (transform.x !== undefined) { this.x = transform.x; }
  if (transform.y !== undefined) { this.y = transform.y; }
  if (transform.scale !== undefined) { this.scale = transform.scale; }
  if (transform.rotation !== undefined) { this.rotation = transform.rotation; }
  if (!silently) { this.updateStyleState(); }
};

TransformPlugin.prototype.transformTo = function (transform) {
  var x = transform.hasOwnProperty('x') ? transform.x : this.x;
  var y = transform.hasOwnProperty('y') ? transform.y : this.y;

  var time = transform.time;
  if (!transform.hasOwnProperty('time')) {
    var deltaX = this.x - x;
    var deltaY = this.y - y;
    var distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
    time = Math.floor(distance / this.speed);
  }

  this.isTransitioning = true;
  window.clearTimeout(this.transformToTimeout);

  var backupTransition = this.transition;
  this.setTransition('transform ' + time + 'ms linear', true);
  this.transform(transform);

  var self = this;
  return new Promise(function (resolve) {
    self.transformToTimeout = window.setTimeout(function () {
      self.isTransitioning = false;
      self.transformCallback = null;
      self.setTransition(backupTransition);
      resolve();
    }, time);
  }).catch(function (e) {
    console.error('TransformPlugin.transformTo', e);
  });
};

TransformPlugin.prototype.show = function (silently) {
  var self = this;
  return new Promise(function (fulfill) {
    self.display = '';
    if (!silently) { self.updateStyleState(); }
    fulfill();
  })
};

TransformPlugin.prototype.hide = function (silently) {
  this.display = 'none';
  if (!silently) { this.updateStyleState(); }
};

module.exports = TransformPlugin;
