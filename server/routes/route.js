// Import express
const express = require('express')

// Import books-controller
const routes = require('../controllers/controller.js')

// Create router
const router = express.Router()

router.get('/year/get', routes.getYears)

router.post('/subject/get', routes.getSubjects)
router.post('/title/get', routes.getFullTitles)

router.get('/questions/all', routes.getQuestionsAll)
router.post('/questions/get', routes.getQuestions)

router.put('/quizes/put', routes.createQuiz)
router.post('/quizes/update', routes.completeQuiz)
router.get('/quizes', routes.getQuizes)
router.get('/quizes/:id', routes.getQuizes)

router.put('/answers/put', routes.createAnswers)


// Export router
module.exports = router