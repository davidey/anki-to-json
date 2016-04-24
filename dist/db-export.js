'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _sqlite = require('sqlite3');

var _sqlite2 = _interopRequireDefault(_sqlite);

var _bluebird = require('bluebird');

var _bluebird2 = _interopRequireDefault(_bluebird);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

_bluebird2.default.promisifyAll(_sqlite2.default);

_sqlite2.default.verbose();

var output = {
  decks: {},
  models: {},
  notes: {},
  cards: {}
};

function dbExport(file, callback) {
  var db = new _sqlite2.default.Database(file);

  db.serialize(function () {
    db.getAsync('SELECT * FROM col').then(function (results) {
      var decks = JSON.parse(results.decks);
      var models = JSON.parse(results.models);

      // Parse the decks
      Object.keys(decks).forEach(function (key) {
        var value = decks[key];

        output.decks[value.id] = {
          id: value.id,
          name: value.name,
          models: {}
        };
      });

      // Parse the models
      Object.keys(models).forEach(function (key) {
        var value = models[key];

        output.models[value.id] = {
          id: value.id,
          name: value.name,
          deck: value.did,
          tags: value.tags,
          fields: value.flds.map(function (field) {
            return {
              name: field.name
            };
          })
        };

        if (typeof output.decks[value.did] === "undefined") {
          return;
        }

        output.decks[value.did].models[value.id] = output.models[value.id];
      });
    });

    db.allAsync('SELECT * FROM notes').then(function (results) {
      Object.keys(results).forEach(function (key) {
        var value = results[key];
        var fieldValues = value.flds.split(String.fromCharCode(31));
        var fields = {};

        output.models[value.mid].fields.forEach(function (field) {
          var fieldName = field.name;
          fields[fieldName] = fieldValues.shift();
        });

        output.notes[value.id] = {
          id: value.id,
          model: value.mid,
          updatedAt: value.mod,
          tags: value.tags,
          fields: fields
        };
      });
    });

    db.allAsync('SELECT * FROM cards').then(function (results) {
      Object.keys(results).forEach(function (key) {
        var value = results[key];
        var note = output.notes[value.nid];

        output.cards[value.id] = Object.assign({}, note, {
          id: value.id,
          nid: value.nid,
          deck: value.did,
          updatedAt: value.mod,
          type: value.type,
          queue: value.queue,
          due: value.due,
          interval: value.ivl,
          factor: value.factor,
          reps: value.reps,
          lapses: value.lapses,
          left: value.left
        });
      });

      callback(false, output);
    });
  });
}

exports.default = dbExport;