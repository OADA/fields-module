"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.createNewField = exports.updateField = exports.deleteField = exports.selectField = exports.init = exports.getFetchWatch = exports.setFetchWatch = exports.fetch = undefined;

var _templateObject = _taggedTemplateLiteral(["oada.", ".bookmarks.fields"], ["oada.", ".bookmarks.fields"]),
    _templateObject2 = _taggedTemplateLiteral(["connection_id"], ["connection_id"]),
    _templateObject3 = _taggedTemplateLiteral(["fields.connection_id"], ["fields.connection_id"]),
    _templateObject4 = _taggedTemplateLiteral(["fields.loading"], ["fields.loading"]),
    _templateObject5 = _taggedTemplateLiteral(["type"], ["type"]);

exports.mapOadaToRecords = mapOadaToRecords;
exports.mapOadaToFields = mapOadaToFields;
exports.setCurrentField = setCurrentField;
exports.addNewFarm = addNewFarm;
exports.addNewField = addNewField;
exports.farmTextChanged = farmTextChanged;
exports.fieldTextChanged = fieldTextChanged;

var _cerebral = require("cerebral");

var _operators = require("cerebral/operators");

var _tags = require("cerebral/tags");

var _uuid = require("uuid");

var _uuid2 = _interopRequireDefault(_uuid);

var _bluebird = require("bluebird");

var _bluebird2 = _interopRequireDefault(_bluebird);

var _sequences = require("@oada/cerebral-module/sequences");

var _sequences2 = _interopRequireDefault(_sequences);

var _geojsonArea = require("@mapbox/geojson-area");

var _geojsonArea2 = _interopRequireDefault(_geojsonArea);

var _centroid = require("@turf/centroid");

var _centroid2 = _interopRequireDefault(_centroid);

var _bbox = require("@turf/bbox");

var _bbox2 = _interopRequireDefault(_bbox);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _taggedTemplateLiteral(strings, raw) { return Object.freeze(Object.defineProperties(strings, { raw: { value: Object.freeze(raw) } })); }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

//TODO: create transform from field to notes.fields entry
//TODO: need a string that says "loading fields"
//
var signals = [];

var tree = {
  bookmarks: {
    _type: "application/vnd.oada.bookmarks.1+json",
    _rev: "0-0",
    fields: {
      _type: "application/vnd.oada.fields.1+json",
      _rev: "0-0",
      "fields-index": {
        "*": {
          _type: "application/vnd.oada.field.1+json",
          _rev: "0-0",
          "fields-index": {
            "*": {
              _type: "application/vnd.oada.field.1+json"
            }
          }
        }
      }
    }
  }
};

/* internal local variables */
var _METERS_TO_ACRES = 0.000247105;

var fetch = exports.fetch = (0, _cerebral.sequence)("fields.fetch", [function (_ref) {
  var state = _ref.state,
      props = _ref.props;

  var signals = props.signals ? props.signals : [];
  var watch = { signals: [].concat(_toConsumableArray(signals)) };
  var requests = [{
    tree: tree,
    path: "/bookmarks/fields",
    watch: watch
  }];
  return { requests: requests };
}, _sequences2.default.get, (0, _operators.when)((0, _tags.state)(_templateObject, (0, _tags.props)(_templateObject2))), {
  true: (0, _cerebral.sequence)("fetchFieldsSuccess", [mapOadaToRecords]),
  false: (0, _cerebral.sequence)("fetchFieldsFailed", [])
}]);

var setFetchWatch = exports.setFetchWatch = (0, _cerebral.sequence)("fields.updateFetchWatch", [function (_ref2) {
  var props = _ref2.props;

  signals = props.signals;
}]);

var getFetchWatch = exports.getFetchWatch = (0, _cerebral.sequence)("fields.updateFetchWatch", [function (_ref3) {
  var props = _ref3.props;
  return { signals: signals };
}]);

var init = exports.init = (0, _cerebral.sequence)("fields.init", [_sequences2.default.connect, (0, _operators.set)((0, _tags.state)(_templateObject3), (0, _tags.props)(_templateObject2)), (0, _operators.set)((0, _tags.state)(_templateObject4), true), fetch, (0, _operators.set)((0, _tags.state)(_templateObject4), false), (0, _operators.set)((0, _tags.props)(_templateObject5), "fields")]);

var selectField = exports.selectField = (0, _cerebral.sequence)("fields.selectField", []);

function mapOadaToRecords(_ref4) {
  var props = _ref4.props,
      state = _ref4.state;

  var curFields = state.get("fields.records");
  return _bluebird2.default.map(Object.keys(curFields || {}), function (field) {
    return state.unset("fields.records." + field);
  }).then(function () {
    var fields = state.get("oada." + props.connection_id + ".bookmarks.fields");
    if (fields) {
      return _bluebird2.default.map(Object.keys(fields["fields-index"] || {}), function (fieldGroup) {
        return _bluebird2.default.map(Object.keys(fields["fields-index"][fieldGroup]["fields-index"] || {}), function (field) {
          return state.set("fields.records." + field, {
            boundary: fields["fields-index"][fieldGroup]["fields-index"][field].boundary,
            id: field,
            name: fields["fields-index"][fieldGroup]["fields-index"][field].name,
            farm: {
              id: fieldGroup,
              name: fields["fields-index"][fieldGroup].name
            }
          });
        });
      });
    } else return;
  }).then(function () {
    return;
  });
}

/**
 * Maps fields records
 * @param props
 * @param state
 * @returns {*}
 */
function mapOadaToFields(_ref5) {
  var props = _ref5.props,
      state = _ref5.state;

  var connection_id = state.get("fields.connection_id");
  var curFields = state.get("fields.records");

  //console.log(" ===== map oada to fields ===== ");

  return _bluebird2.default.map(Object.keys(curFields || {}), function (field) {
    return state.unset("fields.records." + field);
  }).then(function () {
    var fields = state.get("oada." + connection_id + ".bookmarks.fields");
    if (fields) {
      return _bluebird2.default.map(Object.keys(fields["fields-index"] || {}), function (fieldGroup) {
        if (fields["fields-index"][fieldGroup]) {
          return _bluebird2.default.map(Object.keys(fields["fields-index"][fieldGroup]["fields-index"] || {}), function (field) {
            var field_object = fields["fields-index"][fieldGroup]["fields-index"][field];
            var record = {
              id: field,
              name: field_object.name,
              farm: {
                id: fieldGroup,
                name: fields["fields-index"][fieldGroup].name
              }
            };

            if (field_object.boundary) {
              var centroid_object = (0, _centroid2.default)(field_object.boundary.geojson);
              record.boundary = {
                geojson: field_object.boundary.geojson,
                area: _geojsonArea2.default.geometry(field_object.boundary.geojson) * _METERS_TO_ACRES,
                centroid: centroid_object.geometry.coordinates.reverse(),
                bbox: (0, _bbox2.default)(field_object.boundary.geojson),
                visible: true
              };
            }

            return state.set("fields.records." + field, record);
          });
        } else {
          return;
        }
      });
    } else return;
  }).then(function () {
    return;
  });
}

var deleteField = exports.deleteField = (0, _cerebral.sequence)("fields.deleteField", [function (_ref6) {
  var props = _ref6.props,
      state = _ref6.state;
  return {
    connection_id: state.get("fields.connection_id"),
    tree: tree,
    path: "/bookmarks/fields"
  };
}]);

var updateField = exports.updateField = (0, _cerebral.sequence)("fields.updateField", [function (_ref7) {
  var props = _ref7.props,
      state = _ref7.state;
  return {
    connection_id: state.get("fields.connection_id"),
    tree: tree,
    path: "/bookmarks/fields",
    data: props.data
  };
}, _sequences2.default.put]);

function mapNoteToField(_ref8) {
  var props = _ref8.props,
      state = _ref8.state;

  var note;
  var field = {
    _context: {
      farm: "AultFarms",
      grower: "Aaron Ault"
    },

    name: note.text,
    boundary: { geojson: note.geometry.geojson }
  };
}

function createField(_ref9) {
  var props = _ref9.props,
      state = _ref9.state;

  var field = {
    name: "",
    _id: (0, _uuid2.default)(),
    _context: {
      farm: "AultFarms",
      grower: "AaronAult"
    },
    boundary: {}
  };
  return { field: field };
}

var createNewField = exports.createNewField = (0, _cerebral.sequence)("fields.createNewField", [createField, function (_ref10) {
  var props = _ref10.props,
      state = _ref10.state;
  return {
    data: props.field,
    type: "application/vnd.oada.field.1+json",
    path: "/bookmarks/fields/fields-index/AultFarms/" + props.field._id,
    connection_id: state.get("fields.connection_id"),
    tree: tree
  };
}, _sequences2.default.put, fetch]);

function setCurrentField(_ref11) {
  var props = _ref11.props,
      state = _ref11.state;

  state.set("fields.selectedId", props.field.id);
  if (!state.get("fields.editing")) {
    state.set("fields.new_field.field.suggestionsOpen", false);
  }
}

/**
 * Creates the template for the field record with a random UUID
 * @returns {{id: *, label: *, boundary: {area: null, geojson: {type: string, coordinates: *[]}, bbox: null, centroid: *[], visible: boolean}}}
 */
function createFieldRecord() {
  return {
    id: (0, _uuid2.default)(),
    name: "",
    farm: {
      name: "",
      id: (0, _uuid2.default)()
    },
    boundary: {
      geojson: {
        type: "Polygon",
        coordinates: [[]]
      },
      visible: true
    }
  };
} //createFieldRecord

/**
 *
 * @param props
 * @param state
 * @returns {{item: any}}
 */
function addNewFarm(_ref12) {
  var props = _ref12.props,
      state = _ref12.state;

  var _inputText = state.get("fields.new_field.farm.name");
  var farmRecord = createFieldRecord(_inputText);
  state.set("fields.selectedId", farmRecord.id);
  state.set("fields.records." + farmRecord.id, farmRecord);

  return { item: farmRecord };
}

/**
 *
 * @param props
 * @param state
 * @returns {{item: any}}
 */
function addNewField(_ref13) {
  var props = _ref13.props,
      state = _ref13.state;

  var _inputText = state.get("fields.new_field.field.name");
  var field = createFieldRecord(_inputText);
  state.set("fields.new_field", field);

  return { field: field };
}

/**
 * Farm's input text changed
 * @param props
 * @param state
 */
function farmTextChanged(_ref14) {
  var props = _ref14.props,
      state = _ref14.state;

  state.set("fields.new_field.farm.name", props.value);
  state.set("fields.new_field.farm.suggestionsOpen", true);
  validateNewFieldButton({ props: props, state: state });
}

/**
 * Field's input text changed
 * @param props
 * @param state
 */
function fieldTextChanged(_ref15) {
  var props = _ref15.props,
      state = _ref15.state;

  state.set("fields.new_field.name", props.value);
  state.set("fields.new_field.field.suggestionsOpen", true);
  validateNewFieldButton({ props: props, state: state });
}

/**
 * Generates a timestamp in the format 'YYYY-MM-DD'
 * @returns {string}
 */
function timestamp() {
  var today = new Date();
  var dd = today.getDate();
  var mm = today.getMonth() + 1; //January is 0!
  var yyyy = today.getFullYear();
  if (dd < 10) {
    dd = "0" + dd;
  }
  if (mm < 10) {
    mm = "0" + mm;
  }

  return yyyy + "-" + mm + "-" + dd;
}