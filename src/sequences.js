import { sequence } from 'cerebral'
import { set, when } from 'cerebral/operators'
import { state, props } from 'cerebral/tags'
import Promise from 'bluebird';
import * as oada from '@oada/cerebral-module/sequences'

//TODO: create transform from field to notes.fields entry
//TODO: need a string that says "loading fields"
//
let signals = [];

let tree = {
  'bookmarks': {
    '_type': "application/vnd.oada.bookmarks.1+json",
    '_rev': '0-0',
    'fields': {
      '_type': "application/vnd.oada.fields.1+json",
      '_rev': '0-0',
      'fields-index': {
        '*': {
          '_type': "application/vnd.oada.field.1+json",
          '_rev': '0-0',
          'fields-index': {
            '*': {
              '_type': "application/vnd.oada.field.1+json"
            }
          }
        }
      }
    }
  }
}

export const fetch = sequence('fields.fetch', [
  ({state, props}) => {
    let signals = (props.signals ? props.signals : [])
    let watch = {signals: [...signals]};
    return {
      tree,
      path: '/bookmarks/fields',
      watch,
    }
  },
  oada.get,
	when(state`oada.${props`connection_id`}.bookmarks.fields`), {
		true: sequence('fetchFieldsSuccess', [
      mapOadaToRecords,
		]),
		false: sequence('fetchFieldsFailed', []),
  },
])

export const setFetchWatch = sequence('fields.updateFetchWatch', [
  ({props}) => {
    signals = props.signals;
  }
])

export const getFetchWatch = sequence('fields.updateFetchWatch', [
  ({props}) => ({signals})
])

export const init = sequence('fields.init', [
  oada.connect,
  set(state`fields.connection_id`, props`connection_id`),
	set(state`fields.loading`, true),
	fetch,
	set(state`fields.loading`, false),
	set(props`type`, 'fields'),
])

export const selectField = sequence('fields.selectField', []);

export function mapOadaToRecords({props, state}) {
  var curFields = state.get('fields.records')
  return Promise.map(Object.keys(curFields || {}), (field) => {
    return state.unset(`fields.records.${field}`)
  }).then(() => {
    let fields = state.get(`oada.${props.connection_id}.bookmarks.fields`)
    if (fields) {
      return Promise.map(Object.keys(fields['fields-index'] || {}), (fieldGroup) => {
        return Promise.map(Object.keys(fields['fields-index'][fieldGroup]['fields-index'] || {}), (field) => {
          return state.set(`fields.records.${field}`, { 
            boundary: fields['fields-index'][fieldGroup]['fields-index'][field].boundary,
            id: field,
            name: fields['fields-index'][fieldGroup]['fields-index'][field].name,
            farm: {
              id: fieldGroup,
              name: fields['fields-index'][fieldGroup].name
            }
          });
        })
      })
    } else return
  }).then(() => {
    return
  })
}

export const deleteField = sequence('fields.deleteField', [
  ({props, state}) => ({
    connection_id: state.get('fields.connection_id'),
    tree,
    path: '/bookmarks/fields',
  }),
])

export const updateField = sequence('fields.updateField', [
  ({props, state}) => ({
    connection_id: state.get('fields.connection_id'),
    tree,
    path: '/bookmarks/fields',
    data: props.data,
  }),
  oada.put
]);

function mapNoteToField({props, state}) {
  var note;
  var field = {
    _context: {
      farm: "AultFarms",
      grower: "Aaron Ault"
    },
    
    name: note.text,
    boundary: { geojson: note.geometry.geojson },
  }
}

function createField({props, state}) {
  var field = {
    name: '',
    _id: uuid(),
    _context: {
      farm: "AultFarms",
      grower: "AaronAult"
    },
    boundary: {},
  };
	return { field }
};

export const createNewField = sequence('fields.createNewField', [
	createField, 
	({props, state}) => ({
		data: props.field,
		type: 'application/vnd.oada.field.1+json',
    path: '/bookmarks/fields/fields-index/AultFarms/'+props.field._id,
    connection_id: state.get('fields.connection_id'),
		tree,
	}),
  oada.put,
  fetch,
])


