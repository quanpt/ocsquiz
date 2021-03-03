// Import database
const knex = require('./../db')

// Retrieve all questions
exports.questionsAll = async (req, res) => {
  // Get all TestQuestions from database
  knex
    .select('*') // select all records
    .from('Questions') // from 'TestQuestion' table
    .limit(10)
    .then(questions => {
      // Send questions extracted from database in response
      res.json(questions)
    })
    .catch(err => {
      // Send a error message in response
      res.json({ message: `There was an error retrieving books: ${err}` })
    })
}

// Create new quiz
exports.quizesCreate = async (req, res) => {
  // Add new quiz to database
  knex('Quizes')
    .insert({ // insert new record, a quiz
      'title': req.body.title,
      'timestamp': new Date().getTime()
    })
    .then(() => {
      // Send a success message in response
      res.json({ message: `Quiz \'${req.body.title}\' at ${new Date().getTime()} created.` })
    })
    .catch(err => {
      // Send a error message in response
      res.json({ message: `There was an error creating ${req.body.title} quiz: ${err}` })
    })
}

// Create new answer
exports.answersCreate = async (req, res) => {
    // Add new quiz to database
    knex('Answers')
      .insert({ // insert new record, a quiz
        'quizId': req.body.quizId,
        'questionId': req.body.questionId,
        'answer': req.body.answer,
        'timestamp': new Date().getTime()
      })
      .then(() => {
        // Send a success message in response
        res.json({ message: `Answer (\'${req.body.quizId}\', \'${req.body.questionId}\', \'${req.body.answer}\')  at ${new Date().getTime()} created.` })
      })
      .catch(err => {
        // Send a error message in response
        res.json({ message: `There was an error creating (\'${req.body.quizId}\', \'${req.body.questionId}\', \'${req.body.answer}\') answer: ${err}` })
      })
  }

// Remove specific quiz
exports.quizesDelete = async (req, res) => {
  // Find specific book in the database and remove it
  knex('Quizes')
    .where('id', req.body.id) // find correct record based on id
    .del() // delete the record
    .then(() => {
      // Send a success message in response
      res.json({ message: `Quiz ${req.body.id} deleted.` })
    })
    .catch(err => {
      // Send a error message in response
      res.json({ message: `There was an error deleting ${req.body.id} quiz: ${err}` })
    })
}