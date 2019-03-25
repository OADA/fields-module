"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _templateObject = _taggedTemplateLiteral(["fields.new_field.name"], ["fields.new_field.name"]),
    _templateObject2 = _taggedTemplateLiteral(["fields.new_field.farm.name"], ["fields.new_field.farm.name"]),
    _templateObject3 = _taggedTemplateLiteral(["fields.records"], ["fields.records"]),
    _templateObject4 = _taggedTemplateLiteral(["fields.new_field.field.suggestionsOpen"], ["fields.new_field.field.suggestionsOpen"]),
    _templateObject5 = _taggedTemplateLiteral(["fields.new_field.farm.suggestionsOpen"], ["fields.new_field.farm.suggestionsOpen"]),
    _templateObject6 = _taggedTemplateLiteral(["fields.new_field.id"], ["fields.new_field.id"]),
    _templateObject7 = _taggedTemplateLiteral(["fields.new_field.farm.id"], ["fields.new_field.farm.id"]),
    _templateObject8 = _taggedTemplateLiteral(["fields.newFieldDisabled"], ["fields.newFieldDisabled"]),
    _templateObject9 = _taggedTemplateLiteral(["fields.fieldTextChanged"], ["fields.fieldTextChanged"]),
    _templateObject10 = _taggedTemplateLiteral(["fields.farmTextChanged"], ["fields.farmTextChanged"]),
    _templateObject11 = _taggedTemplateLiteral(["fields.saveEditedField"], ["fields.saveEditedField"]),
    _templateObject12 = _taggedTemplateLiteral(["fields.cancelNewField"], ["fields.cancelNewField"]);

var _react = require("react");

var _react2 = _interopRequireDefault(_react);

var _styles = require("material-ui/styles");

var _react3 = require("@cerebral/react");

var _tags = require("cerebral/tags");

var _materialUi = require("material-ui");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _taggedTemplateLiteral(strings, raw) { return Object.freeze(Object.defineProperties(strings, { raw: { value: Object.freeze(raw) } })); }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var styles = function styles(theme) {
  return {
    title: {
      //backgroundColor: "#3F52B5"
    },
    drawerHeader: {
      display: "flex",
      flexDirection: "row",
      flexGrow: 2,
      alignItems: "center",
      backgroundColor: "#3f51b5",
      color: "white",
      justifyContent: "center",
      width: "100%",
      padding: "10px"
    },
    hide: {
      display: "none"
    },
    editFieldButtons: {
      display: "flex",
      justifyContent: "space-evenly",
      alignItems: "center",
      flexDirection: "column"
    },
    editFieldText: {
      display: "flex",
      flexDirection: "column",
      justifyContent: "space-evenly",
      alignItems: "center",
      height: "128px"
    },
    editFieldDrawerBottom: {
      display: "flex",
      flexDirection: "row",
      justifyContent: "space-evenly",
      width: "100%"
    },
    editFieldDrawer: {
      display: "flex",
      flexDirection: "column",
      order: 3,
      alignItems: "center"
    },
    textField: {
      display: "flex",
      flexDirection: "row",
      justifyContent: "flex-start",
      //marginLeft: theme.spacing.unit * 2,
      marginRight: theme.spacing.unit * 0.25,
      minWidth: "200px",
      width: "20%",
      color: "#FAFAFA",
      rightPadding: 10
    }
  };
};

var EditFieldDrawer = function (_React$Component) {
  _inherits(EditFieldDrawer, _React$Component);

  function EditFieldDrawer() {
    _classCallCheck(this, EditFieldDrawer);

    return _possibleConstructorReturn(this, (EditFieldDrawer.__proto__ || Object.getPrototypeOf(EditFieldDrawer)).apply(this, arguments));
  }

  _createClass(EditFieldDrawer, [{
    key: "render",
    value: function render() {
      var _this2 = this;

      var classes = this.props.classes;


      return _react2.default.createElement(
        "div",
        { className: classes.editFieldDrawer },
        _react2.default.createElement(
          "div",
          { className: classes.drawerHeader },
          _react2.default.createElement(
            "label",
            { htmlFor: "Instructions" },
            "(1) Enter names (2) Draw field on the map (3) Save"
          )
        ),
        _react2.default.createElement(
          "div",
          { className: classes.editFieldDrawerBottom },
          _react2.default.createElement(
            "div",
            { className: classes.editFieldText },
            _react2.default.createElement(_materialUi.TextField, {
              label: "Field name",
              placeholder: "e.g., \"Baker 135\"...",
              value: this.props.fieldText,
              onChange: function onChange(evt) {
                return _this2.props.fieldTextChanged({ value: evt.target.value });
              }
            }),
            _react2.default.createElement(_materialUi.TextField, {
              label: "Farm Name",
              placeholder: "e.g., \"Baker\"",
              type: "farm",
              value: this.props.farmText,
              onChange: function onChange(evt) {
                return _this2.props.farmTextChanged({ value: evt.target.value });
              }
            })
          ),
          _react2.default.createElement(
            "div",
            { className: classes.editFieldButtons },
            _react2.default.createElement(
              _materialUi.Button,
              {
                className: classes.editFieldButton,
                variant: "raised",
                color: "primary",
                onClick: function onClick() {
                  _this2.props.saveEdited({ confirm: true });
                },
                disabled: this.props.disabledNewField
              },
              "Save"
            ),
            _react2.default.createElement(
              _materialUi.Button,
              {
                className: classes.editFieldButton,
                variant: "raised",
                color: "secondary",
                onClick: function onClick() {
                  _this2.props.cancelNewField();
                }
              },
              "Discard"
            )
          )
        )
      );
    }
  }]);

  return EditFieldDrawer;
}(_react2.default.Component);

exports.default = (0, _react3.connect)({
  fieldText: (0, _tags.state)(_templateObject),
  farmText: (0, _tags.state)(_templateObject2),
  fields: (0, _tags.state)(_templateObject3),
  fieldSuggestionsOpen: (0, _tags.state)(_templateObject4),
  farmSuggestionsOpen: (0, _tags.state)(_templateObject5),
  fieldId: (0, _tags.state)(_templateObject6),
  farmId: (0, _tags.state)(_templateObject7),
  disabledNewField: (0, _tags.state)(_templateObject8),

  fieldTextChanged: (0, _tags.signal)(_templateObject9),
  farmTextChanged: (0, _tags.signal)(_templateObject10),
  saveEdited: (0, _tags.signal)(_templateObject11),
  cancelNewField: (0, _tags.signal)(_templateObject12)
}, (0, _styles.withStyles)(styles, { withTheme: true })(EditFieldDrawer));