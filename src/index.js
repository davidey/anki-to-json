import dbExport from './db-export';

dbExport('./collection.anki2', (err, result) => {
  console.log(JSON.stringify(result, null, 2));
});
