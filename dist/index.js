'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

require('./styles.css');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var MyComponent = function MyComponent() {
    return _react2.default.createElement(
        'h1',
        null,
        'Hello from my First Component'
    );
};

exports.default = MyComponent;