// Import database
const knex = require('./../db')

// Retrieve all questions
exports.getQuestionsAll = async (req, res) => {
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
exports.getSubjects = async (req, res) => {
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
exports.getFullTitles = async (req, res) => {
  knex
    .select('*')
    .from('TitleView')
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
    ``.from('FullQuestions')
    .where('title', req.body.title)
    //.orderByRaw('RANDOM()')
    //.limit(10)
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
exports.createQuiz = async (req, res) => {

  const dictQuestionLimit = {} // { 'General Ability': 3 }
  const questionLimit = req.body.isFull ? 100 : (req.body.subject in dictQuestionLimit ? dictQuestionLimit[req.body.subject] : 10)

  const ids = await knex
    .insert({
      'title': req.body.title,
      'timestamp': new Date().getTime()
    }, 'id')
    .into('Quizes')
  var quizId = ids[0]

  const subqueryTriedSuccess = knex("FullAnswers")
    .select("questionId")
    .where('title', '=', req.body.title)
    .andWhereRaw('upper(userAnswer) = upper(questionAnswer)')

  const questions = await knex
    .select('*')
    .from('FullQuestions')
    .where('title', req.body.title)
    .where('id', 'not in', subqueryTriedSuccess)
    //.orderByRaw('RANDOM()')
    .limit(questionLimit)
    .catch(err => {
      console.error(err);
      res.json({ message: `There was an error retrieving data: ${err}` })
    })

  if (questions.length == questionLimit) {
    res.json({ quizId: quizId, questions: questions })
  } else {
    console.log("only got " + questions.length + "questions")
    const questionsTriedSuccess = await knex
      .select('q.*')
      .from({ q: 'FullQuestions' })
      .join({ a: 'Answers' }, { 'q.id': 'a.questionId' })
      .where('q.title', '=', req.body.title)
      .andWhereRaw('upper(a.userAnswer) = upper(q.questionAnswer)')
      //.orderByRaw('RANDOM()')
      .limit(questionLimit - questions.length)
      .then(items => {
        res.json({ quizId: quizId, questions: [].concat(questions, items) })
      })
      .catch(err => {
        console.error(err);
        res.json({ message: `There was an error retrieving data: ${err}` })
      })
  }
}

// Create new answer
exports.createAnswers = async (req, res) => {
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


// Retrieve all quizes
// curl 'http://localhost:4001/data/quizes' | jq .
exports.getQuizes = async (req, res) => {
  if (req.params.id) {
    new Promise((resolve, reject) => {
      let data = {};

      Promise.all([
        knex
          .select('*')
          .from('FullAnswers')
          .where('quizId', '=', req.params.id),
        knex
          .select('*')
          .from('Quizes')
          .join('TitleCat', { title: 'fullTitle' })
          .where('id', '=', req.params.id)
      ]).then((result) => {
        data = result[1][0];
        data.questions = result[0];
        resolve(data);
      }).catch((err) => {
        reject(err);
      })
    }).then(item => {
      res.json(item)
    })
      .catch(err => {
        res.json({ message: `There was an error retrieving data: ${err}` })
      })
  } else
    knex
      .select('*')
      .from('FullQuizes')
      .where('answerCount', '>', 0)
      .orderBy('id', 'desc')
      .limit(25)
      .then(items => {
        res.json(items)
      })
      .catch(err => {
        res.json({ message: `There was an error retrieving data: ${err}` })
      })
}