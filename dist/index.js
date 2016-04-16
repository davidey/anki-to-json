'use strict';

var _dbExport = require('./db-export');

var _dbExport2 = _interopRequireDefault(_dbExport);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

(0, _dbExport2.default)('./collection.anki2', function (err, result) {
  console.log(JSON.stringify(result, null, 2));
});
//# sourceMappingURL=index.js.map