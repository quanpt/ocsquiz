// Import express
const express = require('express')

// Import books-controller
const routes = require('../controllers/controller.js')

// Create router
const router = express.Router()

router.get('/year/get', routes.getYears)

router.post('/subject/get', routes.getSubject)
router.post('/title/get', routes.getFullTitle)

router.get('/questions/all', routes.questionsAll)
router.post('/questions/get', routes.getQuestions)

router.put('/quizes/put', routes.quizCreate)

router.put('/answers/put', routes.answersCreate)


// Export router
module.exports = router