import React from 'react';
import ReactDOM from 'react-dom';
import createDOMPurify from 'dompurify'
import { JSDOM } from 'jsdom'

import { Formik, Field, Form } from 'formik';

let reImage1 = new RegExp(/\$image1\$/g);

function onKeyDown(keyEvent) {
  if ((keyEvent.charCode || keyEvent.keyCode) === 13 && keyEvent.target.nodeName === 'INPUT') {
    keyEvent.preventDefault();
  }
  // allow Enter on BUTTON
}

function CorrectAnswer(props) {
  let secondSpent = Math.floor(props.question.timeSpent / 1000)
  let timeClassName = secondSpent < 50 ? 'goodTime' : (secondSpent < 65 ? 'okTime' : 'badTime')
  let className = "answer " + (props.isAnsweredCorrect ? "correctAnswer" : "incorrectAnswer")
  return <div>
      <span className={className}> {props.answer.toUpperCase()}: {props.isAnsweredCorrect ? 'Correct' : 'Incorrect'}</span>
      <span>Time spent: <span className={timeClassName}>{secondSpent}</span> </span>
      {props.isAnsweredCorrect ? '' : <span>Solution: __<span className="invisible">{props.providedAnswer}</span>__</span>}
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

  var answer = <span />
  if (props.isSubmitted) {
    answer = <span
      >
      <CorrectAnswer isAnsweredCorrect={q.isAnsweredCorrect} 
        providedAnswer={q.providedAnswer ? q.providedAnswer : q.answer}
        answer={q.userAnswer ? q.userAnswer : q.answer}
        question={q}/>
    </span>
  }
  return (
    <div id={key}>
      <h3>Question #{key}</h3>
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
            if (question.answer) {
              question.isAnsweredCorrect = question.providedAnswer.toUpperCase() === question.answer.toUpperCase();
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
            this.setState({
              isLoaded: true,
              questions: result.questions,
              quizId: result.quizId
            });
          },
          (error) => {
            this.setState({
              error: true,
            });
          }
        )
  }

  renderQuestions() {
    return (
      <div>
        {this.state.questions.map((question, index) => {
          return <Question key={question.id}
            question={question}
            isSubmitted={this.state.isSubmitted}
            answerOnKeyUp={() => this.answerOnKeyUp(question)} />
        })}
      </div>
    );
  }

  answerOnKeyUp(question) {
    let newQuestions = this.state.questions.slice();
    newQuestions.filter((element, index, array) => { return element === question })[0].timestamp = Date.now()
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
                  question.isAnsweredCorrect = question.userAnswer.toUpperCase() === question.answer.toUpperCase();
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
                      answer: question.userAnswer,
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