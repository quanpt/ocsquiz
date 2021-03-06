// Import database
const knex = require('./../db')

// Retrieve all questions
exports.questionsAll = async (req, res) => {
  // Get all Questions from database
  knex
    .select('*') // select all records
    .from('Questions') // from 'Questions' table
    .limit(10)
    .then(questions => {
      // Send questions extracted from database in response
      res.json(questions)
    })
    .catch(err => {
      // Send a error message in response
      res.json({ message: `There was an error retrieving data: ${err}` })
    })
}

// Retrieve all grades
// http://localhost:4001/data/grades/all
exports.gradesAll = async (req, res) => {
  knex
    .select('Year') // select all records
    .from('TitleCat') // from 'TitleCat' table
    .distinct('Year')
    .then(items => {
      res.json(items)
    })
    .catch(err => {
      // Send a error message in response
      res.json({ message: `There was an error retrieving data: ${err}` })
    })
}

// Retrieve all subject on a grade
// curl 'http://localhost:4001/data/subject/get' --data "year=3"
exports.getSubject = async (req, res) => {
  knex
    .select('Subject') // select all records
    .from('TitleCat') // from 'TitleCat' table
    .distinct('Subject')
    .where('Year', req.body.year)
    .then(items => {
      res.json(items)
    })
    .catch(err => {
      res.json({ message: `There was an error retrieving data: ${err}` })
    })
}

// Retrieve all title on a grade, subject
// curl 'http://localhost:4001/data/title/get' --data "year=3&subject=English" | jq .
exports.getFullTitle = async (req, res) => {
  knex
    .select('FullTitle')
    .from('TitleCat')
    .where('Year', req.body.year)
    .where('Subject', req.body.subject)
    .then(items => {
      res.json(items)
    })
    .catch(err => {
      res.json({ message: `There was an error retrieving data: ${err}` })
    })
}

// Retrieve all question on a title
// curl 'http://localhost:4001/data/questions/get' --data "title=18%20-%20English%20Comprehension%20Grade%203%20result%20%20" | jq .
exports.getQuestions = async (req, res) => {
  knex
    .select('*')
    .from('FullQuestion')
    .where('title', req.body.title)
    .then(items => {
      res.json(items)
    })
    .catch(err => {
      console.error(err);
      res.json({ message: `There was an error retrieving data: ${err}` })
    })
}

// Create new quiz
// curl 'http://localhost:4001/data/quizes/put' -X PUT --data "title=18%20-%20English%20Comprehension%20Grade%203%20result%20%20&questionId=16637&questionId=16639&questionId=16642&questionId=16645"
exports.quizCreate = async (req, res) => {

  const answers = [];
  for (var questionId of req.body.questionId) {
    var answer = {questionId: questionId}
    answers.push(answer)
  }

  var quizId

  try {
    await knex.transaction(async trx => {

      const ids = await trx
        .insert({ 
          'title': req.body.title,
          'timestamp': new Date().getTime()
        }, 'id')
        .into('Quizes')
      quizId = ids[0]

      answers.forEach((answer) => answer.quizId = quizId)
      await trx('Answers').insert(answers)
    })
  } catch(err) {
    console.error(err);
    res.json({ message: `There was an error creating ${req.body.title} quiz: ${err}` })
  };

  knex.select('id, quizId, questionId'.split(', '))
    .from('Answers')
    .where('quizId', quizId)
    .then(items => {
      res.json(items)
    })
    .catch(err => {
      console.error(err);
      res.json({ message: `There was an error retrieving data: ${err}` })
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