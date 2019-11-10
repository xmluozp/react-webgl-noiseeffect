'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _effect = require('./utils/effect.js');

var _effect2 = _interopRequireDefault(_effect);

require('./styles.css');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var NoiseEffectComponent = function NoiseEffectComponent(_ref) {
    var images = _ref.images,
        _ref$id = _ref.id,
        id = _ref$id === undefined ? 'canvas_noiseeffect' : _ref$id,
        index = _ref.index,
        color = _ref.color,
        display = _ref.display,
        density = _ref.density,
        onLoad = _ref.onLoad,
        speed = _ref.speed;


    var effect = new _effect2.default(images);

    (0, _react.useEffect)(function () {

        effect.load(id, index, color, display, density, onLoad);

        return function () {
            effect.unload();
        };
    }, []);

    (0, _react.useEffect)(function () {
        effect.imgSwitch(index, 0.2 * speed);
    }, [index]);

    (0, _react.useEffect)(function () {

        if (display) {
            effect.fadeIn();
        } else {
            effect.fadeOut();
        }
    }, [display]);

    return _react2.default.createElement('canvas', { id: id });
};

exports.default = NoiseEffectComponent;