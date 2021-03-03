// Import express
const express = require('express')

// Import books-controller
const routes = require('../controllers/controller.js')

// Create router
const router = express.Router()

router.get('/grades/all', routes.gradesAll)
router.post('/grades/get', routes.gradeGet)

router.get('/questions/all', routes.questionsAll)

router.post('/quizes/create', routes.quizesCreate)

router.put('/answers/create', routes.answersCreate)


// Export router
module.exports = router