// Import express
const express = require('express')

// Import books-controller
const routes = require('../controllers/controller.js')

// Create router
const router = express.Router()

router.get('/year/get', routes.getYears)

router.post('/subject/get', routes.getSubjects)
router.post('/title/get', routes.getFullTitles)

router.post('/questions/get', routes.getQuestions)

router.put('/quizes/put', routes.createQuiz)
router.post('/quizes/update', routes.completeQuiz)
router.post('/quizes/ping', routes.pingQuiz)
router.post('/quiz/images/get', routes.getQuizImages)
router.get('/quizes', routes.getQuizes)
router.get('/quizes/:id', routes.getQuizes)
router.post('/quiz/question/category/get', routes.getQuestionCategories)

router.put('/answers/put', routes.createAnswers)
router.post('/answers/update', routes.updateAnswer)


// Export router
module.exports = router