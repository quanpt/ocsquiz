import React from 'react';
import ReactDOM from 'react-dom';
import createDOMPurify from 'dompurify'
import { JSDOM } from 'jsdom'
import { Timer } from './timer'

import { Formik, Field, Form } from 'formik';

let reImage1 = new RegExp(/\$image1\$/g);
let lastAnsweredTime = 0
let timeDict = {OC: {English: 72,
  Mathematics: 68.5,
  'Thinking Skills': 60,
  'Computer Skill': 60,
  'General Ability': 60,
  'General Academic Knowledge': 60,
  'Eng-Maths-GA': 65,
  'Science and General Problem Solving': 60,
  'non-verbal/visual reasoning': 60,
  'Language Convention': 60,
  Science: 60,
  'Maths Olympiad': 60,
  'Non-verbal Reasoning': 60,
  Other: 60}}

function onKeyDown(keyEvent) {
  if ((keyEvent.charCode || keyEvent.keyCode) === 13 && keyEvent.target.nodeName === 'INPUT') {
    keyEvent.preventDefault();
  }
  // allow Enter on BUTTON
}

function CorrectAnswer(props) {
  let question = props.question
  let secondSpent = Math.floor(question.timeSpent / 1000)
  let timeClassName = secondSpent <= 60 ? 'goodTime' : (secondSpent <= 65 ? 'okTime' : (secondSpent <= 75 ? 'warningTime' : 'badTime'))
  let className = "answer " + (question.isAnsweredCorrect ? "correctAnswer" : "incorrectAnswer")
  return <div>
      <span className={className}> {question.userAnswer.toUpperCase()}: {question.isAnsweredCorrect ? 'Correct' : 'Incorrect'}</span>
      <span>Time spent: <span className={timeClassName}>{secondSpent}</span> </span>
      {question.isAnsweredCorrect ? '' : <span>Solution: __<span className="invisible">{question.questionAnswer}</span>__</span>}
    </div>
}

function Question(props) {
  const window = (new JSDOM('')).window
  const DOMPurify = createDOMPurify(window)
  let q = props.question
  let key = q.id
  var rawHtml = q.question
  rawHtml = rawHtml.replace(/\r?\n|\r/g, '')
    .replace(/^.*\s*<hr\s*size="1"\/>/gi, '')
    .replace('<br/> <br/> <br/></div>', '</div>')
    .replace(' src="', ' src="/assets/')
    .replace(reImage1, '<img src="/assets/figures/' + props.question.mmfid + '_1.jpg" />')
    .replace('<a href="show_image.html?name=', '<a href="/assets/')
    .replace('target="ReadingText"', 'target="_blank"')
  if (q.imageId) {
    rawHtml = '<img src="/assets/articles/bigfish/' + q.imageId + '.jpg" />' + rawHtml;
  }

  var answer = props.isSubmitted ? <CorrectAnswer question={q}/> : <span />

  return (
    <div id={key}>
      <h3>Question {props.position} <span className='invisible'>#{key}</span></h3>
      <div>
        {<div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(rawHtml, { ADD_ATTR: ['target'] }) }} />}
      </div>
      <label htmlFor={props.question.id}>Answer </label>
      <Field id={props.question.id} name={props.question.id}
        placeholder="A, B, C, D or other text"
        disabled={props.isSubmitted} autoComplete="off"
        onKeyUp={props.answerOnKeyUp} />
      <br/>
      {answer}
      <hr />
    </div>
  );
}

export class Quiz extends React.Component {
  constructor(props) {
    super(props);
    let state = {
      error: null,
      isLoaded: false,
      questions: [],
      quizId: props.id ? props.id : null,
      year: props.year,
      subject: props.subject,
      title: decodeURIComponent(props.title),
      isViewMode: props.isViewMode
    };
    this.state = state;
  }

  componentDidMount() {
    if (this.state.isViewMode) {
      fetch("/data/quizes/" + this.state.quizId)
        .then(res => res.json())
        .then((result) => {
          let countCorrect = 0
          let countAnswer = 0
          let newQuestions = result.questions.slice();
          var dict = newQuestions.reduce(
            (dict, el, index) => (dict[el.id] = "", dict), {});
          let prevTimestamp = result.timestamp;
          for (let key in newQuestions) {
            let question = newQuestions[key];
            question.timeSpent = question.timestamp - prevTimestamp;
            prevTimestamp = question.timestamp
            if (question.userAnswer) {
              question.isAnsweredCorrect = question.questionAnswer.toUpperCase() === question.userAnswer.toUpperCase();
              countCorrect += question.isAnsweredCorrect ? 1 : 0;
              countAnswer++
            }
          }
          this.setState(result)
          this.setState({
            isLoaded: true,
            isSubmitted: true,
            questions: newQuestions,
            countCorrect: countCorrect,
            countAnswer: countAnswer
          });
        },
          (error) => {
            this.setState({
              error: true,
            });
          });
    } else
      fetch("/data/quizes/put", {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json; charset=UTF-8' },
        body: JSON.stringify(this.state)
      })
        .then(res => res.json())
        .then(
          (result) => {
            let totalTime = (this.state.subject in timeDict.OC ? timeDict.OC[this.state.subject] : 600) * result.questions.length
            this.setState({
              isLoaded: true,
              questions: result.questions,
              quizId: result.quizId,
              minutes: Math.floor(totalTime / 60),
              seconds: totalTime % 60,
            });
            lastAnsweredTime = result.timestamp
          },
          (error) => {
            this.setState({
              error: true,
            });
          }
        )
  }

  renderQuestions() {
    let state = this.state
    return (
      <div>
      {this.state.isViewMode ? '' : <span className='timer'><Timer minutes={state.minutes} seconds={state.seconds} isStopped={() => this.state.isSubmitted}/></span>}
        {state.questions.map((question, index) => {
          return <Question key={question.id}
            question={question}
            isSubmitted={state.isSubmitted}
            position={index + 1}
            answerOnKeyUp={() => this.answerOnKeyUp(question)} />
        })}
      </div>
    );
  }

  answerOnKeyUp(question) {
    let newQuestions = this.state.questions.slice();
    let currQuestion = newQuestions.filter((element, index, array) => { return element === question })[0];
    currQuestion.timestamp = Date.now();
    currQuestion.timeSpent = currQuestion.timestamp - lastAnsweredTime;
    lastAnsweredTime = currQuestion.timestamp;
    this.setState({
      questions: newQuestions
    });
  }

  render() {
    const { error, isLoaded } = this.state;
    if (error) {
      return <div>Error: {error.message}</div>;
    } else if (!isLoaded) {
      return <div>Loading...</div>;
    } else {
      let newQuestions = this.state.questions.slice();
      var dict = newQuestions.reduce(
        (dict, el, index) => (dict[el.id] = "", dict), {})
      return (
        <div>
          <h1>Quiz</h1>
          <h2>{this.state.title.replace(' result', '')}</h2>
          {this.state.isViewMode ? <div>Total: {this.state.questions.length} - Attempt: {this.state.countAnswer} - Correct: {this.state.countCorrect}</div> : ""}
          <Formik
            initialValues={dict}
            onSubmit={async (answers) => {

              if (this.state.isSubmitted || this.state.isViewMode)
                return;

              // console.log(JSON.stringify(answers, null, 2));
              let countCorrect = 0
              let countAnswer = 0

              for (let key in newQuestions) {
                let question = newQuestions[key];
                if (answers[question.id] !== '') {
                  question.userAnswer = answers[question.id];
                  question.isAnsweredCorrect = question.userAnswer.toUpperCase() === question.questionAnswer.toUpperCase();
                  countCorrect += question.isAnsweredCorrect ? 1 : 0;
                  countAnswer++
                }
              }

              if (countAnswer < 3*newQuestions.length/4) {
                alert('Too many empty answers, please keep trying!');
                return;
              }

              if (countCorrect * 2 < countAnswer) {
                alert('Less than half answers are correct, please think and change your answers!');
                return;
              }

              this.setState({
                isSubmitted: true,
                questions: newQuestions,
                timestamp: Date.now()
              });
              fetch("/data/answers/put", {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json; charset=UTF-8' },
                body: JSON.stringify({
                  answers: newQuestions.map((question) => {
                    return {
                      quizId: this.state.quizId,
                      questionId: question.id,
                      userAnswer: question.userAnswer,
                      timestamp: question.timestamp
                    }
                  })
                })
              })
                .then(res => res.json())
                .then(
                  (result) => { },
                  (error) => {
                    this.setState({
                      error: true,
                    });
                  }
                )
              alert("Total: " + this.state.questions.length + "\nAttempt: " + countAnswer + "\nCorrect: " + countCorrect);
            }}
          >
            {({ answers }) => (
              <Form onKeyDown={onKeyDown}>
                {this.renderQuestions()}
                {this.state.isSubmitted ? null : <button type="submit">Submit</button>}
              </Form>
            )}
          </Formik>
        </div>
      );
    }
  }
}