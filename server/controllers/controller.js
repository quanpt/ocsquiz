// Import database
const knex = require('./../db')

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
    .from('FullQuestions')
    .where('titleId', decodeURIComponent(req.body.title))
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

exports.getQuizImages = async (req, res) => {
  knex
    .select('*')
    .from('QuizImages')
    .where('titleId', decodeURIComponent(req.body.title))
    .then(items => {
      res.json(items)
    })
    .catch(err => {
      console.error(err);
      res.json({ message: `There was an error retrieving data: ${err}` })
    })
}

exports.getQuestionCategories = async(req, res) => {
  knex
    .select('qgroup', 'mmfgroup', 
      knex.raw('SUM(CASE WHEN UPPER(a.userAnswer) <> UPPER(q.questionAnswer) THEN 1 ELSE 0 END) as errorCount'),
      knex.raw('SUM(CASE WHEN UPPER(a.userAnswer) = UPPER(q.questionAnswer) THEN 1 ELSE 0 END) as correctCount'))
    .from({a: 'Answers'})
    .join({ q: 'Questions' }, { 'q.id': 'a.questionId' })
    .whereIn('quizId', req.body.quizIds)
    .groupBy('qgroup', 'mmfgroup')
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

  const dictQuestionLimit = {} // { 'English': 25 }
  const titleId = decodeURIComponent(req.body.title)
  const lowerTitle = decodeURIComponent(titleId).toLowerCase()
  const isFull = lowerTitle.indexOf('cloze') >= 0 || lowerTitle.indexOf('english') >= 0 || req.body.isFull
  const questionLimit = isFull ? 100 : (req.body.subject in dictQuestionLimit ? dictQuestionLimit[req.body.subject] : 10)
  const currTimestamp = new Date().getTime()

  const ids = await knex
    .insert({
      'titleId': titleId,
      'timestamp': currTimestamp,
      'lastUpdate': currTimestamp
    }, 'id')
    .into('Quizes')
  var quizId = ids[0]

  if (req.body.isRedoMode) {
    const subquerySubjectTitle = knex("TitleView")
      .select("id")
      .where({year: req.body.year, subject: req.body.subject})
      .andWhere('correctAnswerCount' ,'>', 0)
      .andWhere('correctAnswerCount', '<', 'questionCount')
    
    const subqueryPassedQuestionId = knex("FullAnswers")
      .select("questionId")
      .where('titleId', 'in', subquerySubjectTitle)
      .andWhereRaw('upper(userAnswer) = upper(questionAnswer)')

    knex("Questions")
      .select('*')
      .where('titleId', 'in', subquerySubjectTitle)
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
      .where('titleId', titleId)
      .catch(err => {
        console.error(err);
        res.json({ message: `There was an error retrieving data: ${err}` })
      })

    if (isFull) {
      knex.select('*')
        .from('FullQuestions')
        .where('titleId', titleId)
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
        .where('titleId', '=', titleId)
        .andWhereRaw('upper(userAnswer) = upper(questionAnswer)')

      const questions = await knex
        .select('*')
        .from('FullQuestions')
        .where('titleId', titleId)
        .where('id', 'not in', subqueryTriedSuccess)
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
          .where('q.titleId', '=', titleId)
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
      .from({q: 'Quizes'})
      .join({t: 'TitleCat'}, { 'q.titleId': 't.id' })
      .where('q.id', '=', req.params.id)
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
      .where('titleId', quiz.title)
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