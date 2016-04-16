'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _sqlite = require('sqlite3');

var _sqlite2 = _interopRequireDefault(_sqlite);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

_sqlite2.default.verbose();

var output = {
  decks: {}
};

function dbExport(file) {
  var db = new _sqlite2.default.Database(file);

  db.serialize(function () {
    db.get('SELECT * FROM col', function (err, results) {
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

      console.log(JSON.stringify(output, null, 2));
    });
  });

  return output;
}

exports.default = dbExport;
//# sourceMappingURL=db-export.js.map