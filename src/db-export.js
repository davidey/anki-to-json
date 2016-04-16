import sqlite3 from 'sqlite3';

sqlite3.verbose();

let output = {
  decks: {}
};

function dbExport(file) {
  const db = new sqlite3.Database(file);

  db.serialize(() => {
    db.get('SELECT * FROM col', function(err, results) {
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

        if (typeof output.decks[value.did] === "undefined") {
          return;
        }

        output.decks[value.did].models[value.id] = {
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
      });

      console.log(JSON.stringify(output, null, 2));
    });
  });

  return output;
}

export default dbExport;
