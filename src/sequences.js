import { sequence } from "cerebral";
import { set, when } from "cerebral/operators";
import { state, props } from "cerebral/tags";
import Promise from "bluebird";
import oada from "@oada/cerebral-module/sequences";
import geojson_area from "@mapbox/geojson-area";
import centroid from "@turf/centroid";
import bbox from "@turf/bbox";

//TODO: create transform from field to notes.fields entry
//TODO: need a string that says "loading fields"
//
let signals = [];

let tree = {
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
const _METERS_TO_ACRES = 0.000247105;

export const fetch = sequence("fields.fetch", [
  ({ state, props }) => {
    let signals = props.signals ? props.signals : [];
    let watch = { signals: [...signals] };
    let requests = [
      {
        tree: tree,
        path: "/bookmarks/fields",
        watch: watch
      }
    ];
    return { requests };
  },
  oada.get,
  when(state`oada.${props`connection_id`}.bookmarks.fields`),
  {
    true: sequence("fetchFieldsSuccess", [mapOadaToRecords]),
    false: sequence("fetchFieldsFailed", [])
  }
]);

export const setFetchWatch = sequence("fields.updateFetchWatch", [
  ({ props }) => {
    signals = props.signals;
  }
]);

export const getFetchWatch = sequence("fields.updateFetchWatch", [
  ({ props }) => ({ signals })
]);

export const init = sequence("fields.init", [
  oada.connect,
  set(state`fields.connection_id`, props`connection_id`),
  set(state`fields.loading`, true),
  fetch,
  set(state`fields.loading`, false),
  set(props`type`, "fields")
]);

export const selectField = sequence("fields.selectField", []);

export function mapOadaToRecords({ props, state }) {
  var curFields = state.get("fields.records");
  return Promise.map(Object.keys(curFields || {}), field => {
    return state.unset(`fields.records.${field}`);
  })
    .then(() => {
      let fields = state.get(`oada.${props.connection_id}.bookmarks.fields`);
      if (fields) {
        return Promise.map(
          Object.keys(fields["fields-index"] || {}),
          fieldGroup => {
            return Promise.map(
              Object.keys(
                fields["fields-index"][fieldGroup]["fields-index"] || {}
              ),
              field => {
                return state.set(`fields.records.${field}`, {
                  boundary:
                    fields["fields-index"][fieldGroup]["fields-index"][field]
                      .boundary,
                  id: field,
                  name:
                    fields["fields-index"][fieldGroup]["fields-index"][field]
                      .name,
                  farm: {
                    id: fieldGroup,
                    name: fields["fields-index"][fieldGroup].name
                  }
                });
              }
            );
          }
        );
      } else return;
    })
    .then(() => {
      return;
    });
}

/**
 * Maps fields records
 * @param props
 * @param state
 * @returns {*}
 */
export function mapOadaToFields({ props, state }) {
  let connection_id = state.get("fields.connection_id");
  let curFields = state.get("fields.records");

  //console.log(" ===== map oada to fields ===== ");

  return Promise.map(Object.keys(curFields || {}), field => {
    return state.unset(`fields.records.${field}`);
  })
    .then(() => {
      let fields = state.get(`oada.${connection_id}.bookmarks.fields`);
      if (fields) {
        return Promise.map(
          Object.keys(fields["fields-index"] || {}),
          fieldGroup => {
            if (fields["fields-index"][fieldGroup]) {
              return Promise.map(
                Object.keys(
                  fields["fields-index"][fieldGroup]["fields-index"] || {}
                ),
                field => {
                  let field_object =
                    fields["fields-index"][fieldGroup]["fields-index"][field];
                  let record = {
                    id: field,
                    name: field_object.name,
                    farm: {
                      id: fieldGroup,
                      name: fields["fields-index"][fieldGroup].name
                    }
                  };

                  if (field_object.boundary) {
                    let centroid_object = centroid(
                      field_object.boundary.geojson
                    );
                    record.boundary = {
                      geojson: field_object.boundary.geojson,
                      area:
                        geojson_area.geometry(field_object.boundary.geojson) *
                        _METERS_TO_ACRES,
                      centroid: centroid_object.geometry.coordinates.reverse(),
                      bbox: bbox(field_object.boundary.geojson),
                      visible: true
                    };
                  }

                  return state.set(`fields.records.${field}`, record);
                }
              );
            } else {
              return;
            }
          }
        );
      } else return;
    })
    .then(() => {
      return;
    });
}

export const deleteField = sequence("fields.deleteField", [
  ({ props, state }) => ({
    connection_id: state.get("fields.connection_id"),
    tree,
    path: "/bookmarks/fields"
  })
]);

export const updateField = sequence("fields.updateField", [
  ({ props, state }) => ({
    connection_id: state.get("fields.connection_id"),
    tree,
    path: "/bookmarks/fields",
    data: props.data
  }),
  oada.put
]);

function mapNoteToField({ props, state }) {
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

function createField({ props, state }) {
  var field = {
    name: "",
    _id: uuid(),
    _context: {
      farm: "AultFarms",
      grower: "AaronAult"
    },
    boundary: {}
  };
  return { field };
}

export const createNewField = sequence("fields.createNewField", [
  createField,
  ({ props, state }) => ({
    data: props.field,
    type: "application/vnd.oada.field.1+json",
    path: "/bookmarks/fields/fields-index/AultFarms/" + props.field._id,
    connection_id: state.get("fields.connection_id"),
    tree
  }),
  oada.put,
  fetch
]);

export function setCurrentField({ props, state }) {
  state.set("fields.selectedId", props.field.id);
  if (!state.get("fields.editing")) {
    state.set(`fields.new_field.field.suggestionsOpen`, false);
  }
}

/**
 * Creates the template for the field record with a random UUID
 * @returns {{id: *, label: *, boundary: {area: null, geojson: {type: string, coordinates: *[]}, bbox: null, centroid: *[], visible: boolean}}}
 */
function createFieldRecord() {
  return {
    id: uuid(),
    name: "",
    farm: {
      name: "",
      id: uuid()
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
export function addNewFarm({ props, state }) {
  let _inputText = state.get("fields.new_field.farm.name");
  let farmRecord = createFieldRecord(_inputText);
  state.set(`fields.selectedId`, farmRecord.id);
  state.set(`fields.records.${farmRecord.id}`, farmRecord);

  return { item: farmRecord };
}

/**
 *
 * @param props
 * @param state
 * @returns {{item: any}}
 */
export function addNewField({ props, state }) {
  let _inputText = state.get("fields.new_field.field.name");
  let field = createFieldRecord(_inputText);
  state.set(`fields.new_field`, field);

  return { field };
}

/**
 * Farm's input text changed
 * @param props
 * @param state
 */
export function farmTextChanged({ props, state }) {
  state.set(`fields.new_field.farm.name`, props.value);
  state.set("fields.new_field.farm.suggestionsOpen", true);
  validateNewFieldButton({ props, state });
}

/**
 * Field's input text changed
 * @param props
 * @param state
 */
export function fieldTextChanged({ props, state }) {
  state.set(`fields.new_field.name`, props.value);
  state.set("fields.new_field.field.suggestionsOpen", true);
  validateNewFieldButton({ props, state });
}


/**
 * Generates a timestamp in the format 'YYYY-MM-DD'
 * @returns {string}
 */
function timestamp() {
  let today = new Date();
  let dd = today.getDate();
  let mm = today.getMonth() + 1; //January is 0!
  let yyyy = today.getFullYear();
  if (dd < 10) {
    dd = "0" + dd;
  }
  if (mm < 10) {
    mm = "0" + mm;
  }

  return yyyy + "-" + mm + "-" + dd;
}

