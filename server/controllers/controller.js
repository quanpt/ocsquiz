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
    .where(function() {
      this.whereRaw('? = ?', [req.body.year, 'All']).orWhere('year', req.body.year)
    })
    .andWhere(function() {
      this.whereRaw('? = ? or ? = ?', [req.body.subject, 'All', req.body.year, 'All']).orWhere('subject', req.body.subject)
    })
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
  const isFull = req.body.title.indexOf('cloze') >= 0 || req.body.isFull
  const questionLimit = isFull ? 100 : (req.body.subject in dictQuestionLimit ? dictQuestionLimit[req.body.subject] : 10)
  const currTimestamp = new Date().getTime()

  const ids = await knex
    .insert({
      'title': req.body.title,
      'timestamp': currTimestamp,
      'lastUpdate': currTimestamp
    }, 'id')
    .into('Quizes')
  var quizId = ids[0]

  if (req.body.isRedoMode) {
    const subquerySubjectTitle = knex("TitleView")
      .select("fullTitle")
      .where({year: req.body.year, subject: req.body.subject})
      .andWhere('correctAnswerCount' ,'>', 0)
      .andWhere('correctAnswerCount', '<', 'questionCount')
    
    const subqueryPassedQuestionId = knex("FullAnswers")
      .select("questionId")
      .where('title', 'in', subquerySubjectTitle)
      .andWhereRaw('upper(userAnswer) = upper(questionAnswer)')

    knex("Questions")
      .select('*')
      .where('title', 'in', subquerySubjectTitle)
      .andWhere('id', 'not in', subqueryPassedQuestionId)
      .limit(questionLimit)
      .then(questions => {
        res.json({ quizId: quizId, questions: questions })
      })
      .catch(err => {
        res.json({ message: `There was an error retrieving data: ${err}` })
      })
  } else {
    const imageURLs = await knex
      .select('*')
      .from('QuizImages')
      .where('title', req.body.title)
      .catch(err => {
        console.error(err);
        res.json({ message: `There was an error retrieving data: ${err}` })
      })

    if (isFull) {
      knex.select('*')
        .from('FullQuestions')
        .where('title', req.body.title)
        .limit(questionLimit)
        .then(questions => {
          res.json({ quizId: quizId, questions: questions, imageURLs: imageURLs })
        })
        .catch(err => {
          res.json({ message: `There was an error retrieving data: ${err}` })
        })
    } else {

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
        res.json({ quizId: quizId, questions: questions, imageURLs: imageURLs })
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
            res.json({ quizId: quizId, questions: [].concat(questions, items), imageURLs: imageURLs })
          })
          .catch(err => {
            console.error(err);
            res.json({ message: `There was an error retrieving data: ${err}` })
          })
      }
    }
  }
}

exports.pingQuiz = async(req, res) => {
  knex('Quizes').where({ id: req.body.id }).update({lastUpdate: new Date().getTime()})
  .then(function(resp) {
    res.json({result: 'ok'})
  })
  .catch(function(err) {
    console.error(err);
    res.json({ message: `There was an error creating answer from request body: ${req.body} error: ${err}` })
  });
}

// complete quiz
exports.completeQuiz = async (req, res) => {
  knex.transaction(function(trx) {
    trx('Answers').insert(req.body.answers)
      .then(function(resp) {
        return trx('Quizes').where({ id: req.body.answers[0].quizId }).update({lastUpdate: new Date().getTime()})
      })
      .then(trx.commit)
      .catch(trx.rollback);
  })
  .then(function(resp) {
    res.json({result: 'ok'})
  })
  .catch(function(err) {
    console.error(err);
    res.json({ message: `There was an error creating answer from request body: ${req.body} error: ${err}` })
  });
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

// Update one answer
exports.updateAnswer = async (req, res) => {
  knex('Answers').where({ id: req.body.answerId }).update({userAnswer: req.body.questionAnswer, isReviewed: 1})
    .then(results => {
      res.json(results)
    })
    .catch(err => {
      console.error(err);
      res.json({ message: `There was an error updating answer from request body: ${req.body} error: ${err}` })
    })
}


// Retrieve all quizes
// curl 'http://localhost:4001/data/quizes' | jq .
exports.getQuizes = async (req, res) => {
  if (req.params.id) {
    
    const quiz = await knex
      .select('*')
      .from('Quizes')
      .join('TitleCat', { title: 'fullTitle' })
      .where('id', '=', req.params.id)
      .first()
      .catch(err => {
        console.error(err);
        res.json({ message: `There was an error retrieving data: ${err}` })
        return
      })
    console.log(quiz)

    const imageURLs = await knex
      .select('*')
      .from('QuizImages')
      .where('title', quiz.title)
      .catch(err => {
        console.error(err);
        res.json({ message: `There was an error retrieving data: ${err}` })
        return
      })

    knex
      .select('*')
      .from('FullAnswers')
      .where('quizId', '=', req.params.id)
      .then((result) => {
        res.json(
          Object.assign({}, quiz, {
            questions: result,
            imageURLs: imageURLs
          })
        )
      })
      .catch(err => {
        console.error(err);
        res.json({ message: `There was an error retrieving data: ${err}` })
        return
      })
  } else
    knex
      .select('*')
      .from('FullQuizes')
      .whereRaw('lastUpdate > timestamp + 30000')
      .orWhere('answerCount', '>', 0)
      .orderBy('id', 'desc')
      .limit(25)
      .then(items => {
        res.json(items)
      })
      .catch(err => {
        res.json({ message: `There was an error retrieving data: ${err}` })
      })
}