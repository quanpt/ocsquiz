import React from 'react';
import Cookies from 'js-cookie';
import { Timer } from './timer'
import { FormatQuestionText } from './print'

import { Formik, Field, Form } from 'formik';

let lastAnsweredTime = 0
let timeDict = {
  OC: {
    English: 72,
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
    Other: 60
  }
}

function onKeyDown(keyEvent) {
  if ((keyEvent.charCode || keyEvent.keyCode) === 13 && keyEvent.target.nodeName === 'INPUT') {
    keyEvent.preventDefault();
  }
  // allow Enter on BUTTON
}

class Solution extends React.Component {

  constructor(props) {
    super(props);
    let state = {
      showMessage: false,
      questionAnswer: props.questionAnswer,
      answerId: props.answerId,
      comment: props.comment,
      user: Cookies.get('user')
    }
    this.state = state;
  }

  onButtonClickHandler = () => {
    this.setState({ showMessage: !this.state.showMessage });
  };

  onButtonReviewClickHandler = () => {
    alert(JSON.stringify(this.state))
    fetch("/data/answers/update", {
      method: 'POST',
      headers: { 'Content-Type': 'application/json; charset=UTF-8' },
      body: JSON.stringify(this.state)
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
  }

  render() {
    return <>
      <span>Solution:
        <span className="questionAnswer">&nbsp;{this.state.showMessage && this.state.questionAnswer}&nbsp;</span>
        <button className="smallButon" onClick={this.onButtonClickHandler}>{this.state.showMessage ? 'Hide' : 'Show'}</button>&nbsp;
        {this.state.user === 'admin' && <button type="submit" className="smallButon" onClick={this.onButtonReviewClickHandler}>V</button>}
      </span>
      {this.state.showMessage && <span className="QuestionText" dangerouslySetInnerHTML={{ __html: FormatQuestionText(this.state.comment) }} />}
      </>;

  }
}

function CorrectAnswer(props) {
  let question = props.question
  let secondSpent = Math.floor(question.timeSpent / 1000)
  let timeClassName = secondSpent <= 60 ? 'goodTime' : (secondSpent <= 65 ? 'okTime' : (secondSpent <= 75 ? 'warningTime' : 'badTime'))
  let className = "answer " + (question.isAnsweredCorrect ? "correctAnswer" : "incorrectAnswer")
  let isSkipped = question.userAnswer.toUpperCase() === 'X'
  return <div className="QuestionText">
    <span className={className}> {question.userAnswer ? question.userAnswer.toUpperCase() : "Not answered"}: {question.isAnsweredCorrect ? 'Correct' : (isSkipped ? 'Skipped' : 'Incorrect')}</span>
    <span>Time spent: <span className={timeClassName}>{secondSpent}</span> </span>
    {(!question.isAnsweredCorrect && !isSkipped) && <Solution {...question} />}
    {question.isAnsweredCorrect && <span className="QuestionText" dangerouslySetInnerHTML={{ __html: FormatQuestionText(question.comment) }} />}
  </div>
}

function OnlineQuestion(props) {

  let q = props.question
  let html = FormatQuestionText(q.question, q.mmfid, q.imageId ? q.imageId : 0)
  if (html.match(/^\s*Refer to the (poem|article):* (<br\/> <img|<a) /))
    html = html.replace(/ class="questionImage"/g, '')
  // console.log(html);

  return <>
    <span className="QuestionNumber">{props.question.pos + 1}</span>
    <span className="QuestionText" dangerouslySetInnerHTML={{ __html: html }} />
  </>
}

function Question(props) {
  let q = props.question
  let key = q.id

  var answer = props.isSubmitted ? <CorrectAnswer question={q} /> : <div />
  q.pos = props.position - 1

  return (
    <div id={key} className={"OneQuestion " + (q.isFocus ? 'focusDiv' : 'blurDiv')} onClick={props.answerOnFocus}>
      <OnlineQuestion question={q} />
      <div className="AnswerLine"><label htmlFor={props.question.id}>Answer </label>
        <Field id={props.question.id} name={props.question.id}
          placeholder="A, B, C, D or other text"
          disabled={props.isSubmitted} autoComplete="off"
          onKeyUp={props.answerOnKeyUp}
          onFocus={props.answerOnFocus} />
        <br />
        {answer}
      </div>
    </div>
  );
}

function ImageURLs(props) {
  let imageURLs = props.imageURLs
  return (
    <div className="ImageURLs">
      {imageURLs.length > 0 && <>
        <span className="IntroText">Images the questions refering to:</span>
        {imageURLs.map((item, index) => {
          return <>
            <span className="QuestionImageLink">
              <a target='_blank' rel="noreferrer" href={'/assets/articles/' + item.imageURL}>{item.imageURL}</a> - {item.questionCount} questions
                </span></>
        })}
      </>}
    </div>
  );
}

export class Quiz extends React.Component {
  intervalID;

  constructor(props) {
    super(props);
    let state = {
      isFull: props.questionState === "1",
      isSubmitted: false,
      error: null,
      isLoaded: false,
      questions: [],
      imageURLs: [],
      quizId: props.id ? props.id : null,
      year: props.year,
      subject: props.subject,
      title: decodeURIComponent(props.title),
      isRedoMode: props.questionState === 2,
      isViewMode: props.isViewMode,
      blankCount: -1
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
          let prevTimestamp = result.timestamp;
          for (let key in newQuestions) {
            let question = newQuestions[key];
            question.answerId = question.id
            question.id = question.questionId
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
            if (result.questions.length === 0) {
              this.setState({
                isLoaded: true,
                error: { message: "No questions for review, please go back" },
              });
            } else {
              let totalTime = (this.state.subject in timeDict.OC ? timeDict.OC[this.state.subject] : 60) * result.questions.length
              this.setState({
                isLoaded: true,
                questions: result.questions,
                quizId: result.quizId,
                imageURLs: result.imageURLs,
                minutes: Math.floor(totalTime / 60),
                seconds: totalTime % 60,
              });
              lastAnsweredTime = new Date().getTime()
              this.pingQuiz()
            }
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

  onButtonSkipClickHandler = () => {
    let state = this.state;
    console.log(state);
  }

  renderQuestions() {
    let state = this.state
    return (
      <>
        {this.state.isViewMode ? '' :
          <span className='timer'>
            <Timer minutes={state.minutes} seconds={state.seconds} isStopped={() => this.state.isSubmitted} />
          </span>}
        <div className="QuestionList">
          {state.questions.map((question, index) => {
            return <Question key={question.id}
              question={question}
              isSubmitted={state.isSubmitted}
              position={index + 1}
              answerOnKeyUp={() => this.answerOnKeyUp(question)}
              answerOnFocus={() => this.answerOnFocus(question, true)} />
          })}
        </div>
        {this.state.isSubmitted ? null : <>
          {/* <div className="DivSubmit"><button type="button" className="formSubmit" onClick={this.onButtonSkipClickHandler}>Skip {this.state.blankCount}</button></div>&nbsp; */}
          <div className="DivSubmit"><button type="submit" className="formSubmit">Submit</button></div>
        </>}
      </>
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
      newQuestions[key].isFocus = question === newQuestions[key] ? isFocus : (!isFocus);
    }
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
        (dict, el) => {
          dict[el.id] = ""
          return dict
        }, {})
      return (
        <>
          <h1>Quiz - {this.state.title.replace(' result', '')}</h1>
          {this.state.isViewMode ? <div>Total: {this.state.questions.length} - Attempt: {this.state.countAnswer} - Correct: {this.state.countCorrect}</div> : ""}
          <Formik
            initialValues={dict}
            onSubmit={async (answers) => {

              if (this.state.isSubmitted || this.state.isViewMode)
                return;

              // console.log(JSON.stringify(answers, null, 2));
              let countCorrect = 0
              let countAnswer = 0
              let countSkip = 0

              for (let key in newQuestions) {
                let question = newQuestions[key];
                if (answers[question.id] !== '') {
                  question.userAnswer = answers[question.id];
                  question.isAnsweredCorrect = question.userAnswer.toUpperCase() === question.questionAnswer.toUpperCase();
                  countCorrect += question.isAnsweredCorrect ? 1 : 0;
                  countAnswer++
                  countSkip += question.userAnswer.toUpperCase() === 'X' ? 1 : 0;
                }
              }

              if (countAnswer < newQuestions.length * 3 / 4) {
                alert('Too many empty answers, please keep trying!');
                return;
              }

              if (countCorrect * 4 < (countAnswer - countSkip)) {
                alert('Less than one forth answers are correct, please think and change your answers!');
                return;
              }

              clearTimeout(this.intervalID);

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
                <ImageURLs imageURLs={this.state.imageURLs} />
                {this.renderQuestions()}
              </Form>
            )}
          </Formik>
        </>);
    }
  }
}