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

// Retrieve all years
exports.getYears = async (req, res) => {
  knex
    .select('year') // select all records
    .from('TitleCat') // from 'TitleCat' table
    .distinct('year')
    .then(items => {
      res.json(items)
    })
    .catch(err => {
      // Send a error message in response
      res.json({ message: `There was an error retrieving data: ${err}` })
    })
}

// Retrieve all subject on a year
// curl 'http://localhost:4001/data/subject/get' --data "year=3"
exports.getSubject = async (req, res) => {
  knex
    .select('subject') // select all records
    .from('TitleCat') // from 'TitleCat' table
    .distinct('subject')
    .where('year', req.body.year)
    .then(items => {
      res.json(items)
    })
    .catch(err => {
      res.json({ message: `There was an error retrieving data: ${err}` })
    })
}

// Retrieve all title on a year, subject
// curl 'http://localhost:4001/data/title/get' --data "year=3&subject=English" | jq .
exports.getFullTitle = async (req, res) => {
  knex
    .select('fullTitle')
    .from('TitleCat')
    .where('year', req.body.year)
    .where('subject', req.body.subject)
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
``    .from('FullQuestions')
    .where('title', req.body.title)
    .orderByRaw('RANDOM()')
    .limit(10)
    .then(items => {
      res.json(items)
    })
    .catch(err => {
      console.error(err);
      res.json({ message: `There was an error retrieving data: ${err}` })
    })
}

// Create new quiz
// curl 'http://localhost:4001/data/quizes/put' -X PUT --data "title=18%20-%20English%20Comprehension%20Grade%203%20result%20%20"
exports.quizCreate = async (req, res) => {

  const ids = await knex
    .insert({
      'title': req.body.title,
      'timestamp': new Date().getTime()
    }, 'id')
    .into('Quizes')
  var quizId = ids[0]

  knex
    .select('*')
    .from('FullQuestions')
    .where('title', req.body.title)
    .orderByRaw('RANDOM()')
    .limit(10)
    .then(items => {
      res.json({quizId: quizId, questions: items})
    })
    .catch(err => {
      console.error(err);
      res.json({ message: `There was an error retrieving data: ${err}` })
    })
}

// Create new answer
exports.answersCreate = async (req, res) => {
  knex('Answers')
    .insert(req.body.answers)
    .then(results => {
      res.json(results)
    })
    .catch(err => {
      console.error(err);
      res.json({ message: `There was an error creating answer from request body: ${req.body} error: ${err}` })
    })
}
