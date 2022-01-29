# OC Selective Quizes

This project was setup to provide a local server with quizes based on gathered OC Selective questions.

Database schema is specified in /server/db/schema.sql.
Require /server/db/database.sqlite file in place.
Clear `quizes` table to reset the quiz attempts.

Command to run the project:
`HOST=0.0.0.0 DEBUG=knex:query npm run start`