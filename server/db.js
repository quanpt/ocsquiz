// Import path module
const path = require('path')

// Get the location of database.sqlite file
const dbPath = path.resolve(__dirname, 'db/database.sqlite')

// Create connection to SQLite database
const knex = require('knex')({
  client: 'sqlite3',
  connection: {
    filename: dbPath,
  },
  useNullAsDefault: true
})

// Create a table in the database called "Questions"
knex.schema
  // Make sure no table exists
  // before trying to create new table
  .hasTable('Questions')
    .then((exists) => {
      if (!exists) {
        // If no "Questions" table exists
        return knex.schema.createTable('Questions', (table)  => {
          table.increments('id').primary()
          table.integer('mmfid')
          table.string('question')
          table.string('answer')
          table.string('qgroup')
          table.string('mmfgroup')
          table.string('title')
        })
        .then(() => {
          // Log success message
          console.log('Table \'Questions\' created')
        })
        .catch((error) => {
          console.error(`There was an error creating table: ${error}`)
        })
      }
    })
    .then(() => {
      // Log success message
      console.log('done')
    })
    .catch((error) => {
      console.error(`There was an error setting up the database: ${error}`)
    })

// Export the database
module.exports = knex

// CREATE TABLE sqlite_sequence(name,seq)

// CREATE TABLE "Questions" (
//   id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
//   mmfid INTEGER UNIQUE,
//   question TEXT,
//   answer TEXT,
//   qgroup TEXT,
//   mmfgroup TEXT,
//   title TEXT
// )

// CREATE TABLE "Quizes" (
// 	"id"	INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT UNIQUE,
// 	"timestamp"	INTEGER NOT NULL,
// 	"title"	INTEGER NOT NULL
// )

// CREATE TABLE "Answers" (
// 	"id"	INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT UNIQUE,
// 	"quizId"	INTEGER NOT NULL,
// 	"questionId"	INTEGER NOT NULL,
// 	"answer"	TEXT,
// 	"timestamp"	INTEGER,
// 	FOREIGN KEY("quizId") REFERENCES "Quiz"("id") ON UPDATE CASCADE,
// 	FOREIGN KEY("questionId") REFERENCES "Questions"("id") ON UPDATE CASCADE
// )

// CREATE VIEW "TitleView" AS select "id", "mmfid", "question", "answer", "qgroup", "mmfgroup", replace(replace(ltrim(substr(title, instr(title, ' - ') + 1), ' -'), ' result', ''), ',', '') as title from "Questions"