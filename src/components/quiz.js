import React from 'react';
import ReactDOM from 'react-dom';
import createDOMPurify from 'dompurify'
import { JSDOM } from 'jsdom'
import { Timer } from './timer'

import { Formik, Field, Form } from 'formik';

const window = (new JSDOM('')).window
const DOMPurify = createDOMPurify(window)

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

class Solution extends React.Component{

  constructor(props) {
    super(props);
    let state = {
      showMessage: false,
      questionAnswer: props.questionAnswer
    }
    this.state = state;
  }

  onButtonClickHandler = () => {
   this.setState({ showMessage: !this.state.showMessage });
  };

  render(){ 
    return(<span>Solution: 
      <span className="questionAnswer">&nbsp;{this.state.showMessage && this.state.questionAnswer}&nbsp;</span>
      <button className="smallButon" onClick={this.onButtonClickHandler}>{this.state.showMessage ? 'Hide' : 'Show'}</button>
    </span>);

  }
}

function CorrectAnswer(props) {
  let question = props.question
  let secondSpent = Math.floor(question.timeSpent / 1000)
  let timeClassName = secondSpent <= 60 ? 'goodTime' : (secondSpent <= 65 ? 'okTime' : (secondSpent <= 75 ? 'warningTime' : 'badTime'))
  let className = "answer " + (question.isAnsweredCorrect ? "correctAnswer" : "incorrectAnswer")
  return <div>
      <span className={className}> {question.userAnswer.toUpperCase()}: {question.isAnsweredCorrect ? 'Correct' : 'Incorrect'}</span>
      <span>Time spent: <span className={timeClassName}>{secondSpent}</span> </span>
      {!question.isAnsweredCorrect && <Solution questionAnswer={question.questionAnswer}/>}
    </div>
}

function Question(props) {
  let q = props.question
  let key = q.id
  var rawHtml = q.question
  rawHtml = rawHtml.replace(/\r?\n|\r/g, '')
    .replace(/^.*\s*<hr\s*size="1"\/>/gi, '')
    .replace('<br/> <br/> <br/></div>', '</div>')
    .replace(/\ssrc="/g, ' src="/assets/')
    .replace(reImage1, '<img src="/assets/figures/' + props.question.mmfid + '_1.jpg" />')
    .replace('<a href="show_image.html?name=', '<a href="/assets/')
    .replace('target="ReadingText"', 'target="_blank"')
  if (q.imageId) {
    rawHtml = '<img src="/assets/articles/bigfish/' + q.imageId + '.jpg" />' + rawHtml;
  }

  var answer = props.isSubmitted ? <CorrectAnswer question={q}/> : <span />

  return (
    <div id={key} className={q.isFocus ? 'focusDiv' : 'blurDiv'} onClick={props.answerOnFocus}>
      <h3>Question {props.position} <span className='invisible'>#{key}</span></h3>
      <div>
        {<div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(rawHtml, { ADD_ATTR: ['target'] }) }}/>}
        {/* {<div dangerouslySetInnerHTML={{ __html: rawHtml}}/>} */}
      </div>
      <label htmlFor={props.question.id}>Answer </label>
      <Field id={props.question.id} name={props.question.id}
        placeholder="A, B, C, D or other text"
        disabled={props.isSubmitted} autoComplete="off"
        onKeyUp={props.answerOnKeyUp}
        onFocus={props.answerOnFocus} />
      <br/>
      {answer}
      <hr />
    </div>
  );
}

export class Quiz extends React.Component {
  intervalID;

  constructor(props) {
    super(props);
    let state = {
      isFull: props.isFull,
      isSubmitted: false,
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
            lastAnsweredTime = new Date().getTime()
            this.pingQuiz()
          },
          (error) => {
            this.setState({
              error: true,
            });
          }
        )
  }

  componentWillUnmount() {
    clearTimeout(this.intervalID);
  }

  renderQuestions() {
    let state = this.state
    return (
      <div>
      {this.state.isViewMode ? '' : 
        <span className='timer'>
          <Timer minutes={state.minutes} seconds={state.seconds} isStopped={() => this.state.isSubmitted}/>
        </span>}
        {state.questions.map((question, index) => {
          return <Question key={question.id}
            question={question}
            isSubmitted={state.isSubmitted}
            position={index + 1}
            answerOnKeyUp={() => this.answerOnKeyUp(question)}
            answerOnFocus={() => this.answerOnFocus(question, true)}/>
        })}
      </div>
    );
  }

  pingQuiz() {
    fetch("/data/quizes/ping", {
      method: 'POST',
      headers: { 'Content-Type': 'application/json; charset=UTF-8' },
      body: JSON.stringify({
        id: this.state.quizId
      })
    })
    this.intervalID = setTimeout(this.pingQuiz.bind(this), 10000);
  }

  answerOnKeyUp(question) {
    // update but no re-render
    let newQuestions = this.state.questions.slice();
    let currQuestion = newQuestions.filter((element, index, array) => { return element === question })[0];
    currQuestion.timestamp = Date.now();
    currQuestion.timeSpent = currQuestion.timestamp - lastAnsweredTime;
    lastAnsweredTime = currQuestion.timestamp;
    this.setState({
      questions: newQuestions
    });
  }

  answerOnFocus(question, isFocus) {
    let newQuestions = this.state.questions.slice();
    for (let key in newQuestions) {
        newQuestions[key].isFocus = question === newQuestions[key] ? isFocus : (! isFocus);
    }
    this.setState({
      questions: newQuestions
    });
  }

  render() {
    const { error, isLoaded } = this.state;
    console.log('re-render')
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

              if (countAnswer < newQuestions.length * 3/4) {
                alert('Too many empty answers, please keep trying!');
                return;
              }

              if (countCorrect * 3 < countAnswer) {
                alert('Less than a third answers are correct, please think and change your answers!');
                return;
              }

              this.setState({
                isSubmitted: true,
                questions: newQuestions,
                timestamp: Date.now()
              });
              fetch("/data//quizes/update", {
                method: 'POST',
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
                {this.state.isSubmitted ? null : <button type="submit" className="formSubmit">Submit</button>}
              </Form>
            )}
          </Formik>
        </div>
      );
    }
  }
}