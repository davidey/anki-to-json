import sqlite3 from 'sqlite3';
import Promise from 'bluebird';

Promise.promisifyAll(sqlite3);

sqlite3.verbose();

let output = {
  decks: {},
  models: {},
  notes: {},
  cards: {}
};

function dbExport(file, callback) {
  const db = new sqlite3.Database(file);

  db.serialize(() => {
    db.getAsync('SELECT * FROM col').then(function(results) {
      const decks = JSON.parse(results.decks);
      const models = JSON.parse(results.models);

      // Parse the decks
      Object.keys(decks).forEach((key) => {
        const value = decks[key];

        output.decks[value.id] = {
          id: value.id,
          name: value.name,
          models: {}
        };
      });

      // Parse the models
      Object.keys(models).forEach((key) => {
        const value = models[key];

        output.models[value.id] = {
          id: value.id,
          name: value.name,
          deck: value.did,
          tags: value.tags,
          fields: value.flds.map((field) => {
            return {
              name: field.name,
            };
          })
        };

        if (typeof output.decks[value.did] === "undefined") {
          return;
        }

        output.decks[value.did].models[value.id] = output.models[value.id];
      });
    });

    db.allAsync('SELECT * FROM notes').then(function(results) {
      Object.keys(results).forEach((key) => {
        const value = results[key];
        const fieldValues = value.flds.split(String.fromCharCode(31));
        let fields = {};

        output.models[value.mid].fields.forEach((field) => {
          const fieldName = field.name;
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

    db.allAsync('SELECT * FROM cards').then(function(results) {
      Object.keys(results).forEach((key) => {
        const value = results[key];
        const note = output.notes[value.nid];

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

export default dbExport;
