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
  decks: {}
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

        if (typeof output.decks[value.did] === "undefined") {
          return;
        }

        output.decks[value.did].models[value.id] = {
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
      });

      callback(false, output);
    });
  });
}

exports.default = dbExport;
//# sourceMappingURL=db-export.js.map