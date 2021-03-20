import React from 'react';
import ReactDOM from 'react-dom';
import createDOMPurify from 'dompurify'
import { JSDOM } from 'jsdom'

import { Formik, Field, Form } from 'formik';

let reImage1 = new RegExp(/\$image1\$/g);

function onKeyDown(keyEvent) {
  if ((keyEvent.charCode || keyEvent.keyCode) === 13) {
    keyEvent.preventDefault();
  }
}

function CorrectAnswer(props) {
  if (props.isAnsweredCorrect)
    return <span> Correct</span>
  else
    return <span> INcorrect, please retry first then double click here: __<span className={"invisible"}>{props.answer}</span>__</span>
}

function Question(props) {
  const window = (new JSDOM('')).window
  const DOMPurify = createDOMPurify(window)
  let key = props.question.id
  var rawHtml = props.question.question
  rawHtml = '<div>#' + key + ". " + rawHtml.replace(/\r?\n|\r/g,'')
    .replace(/^.*\s*<hr\s*size="1"\/>/gi, '')
    .replace('<br/> <br/> <br/></div>','</div>')
    .replace(' src="', ' src="/assets/')
    .replace(reImage1, '<img src="/assets/figures/'+ props.question.mmfid +'_1.jpg" />')

  var answer=<span/>
  if (props.isSubmitted) {
    answer = <span 
        className={"answer " + (props.question.isAnsweredCorrect ? "correctAnswer" : "incorrectAnswer")}>
        <CorrectAnswer isAnsweredCorrect={props.question.isAnsweredCorrect} answer={props.question.answer}/>
      </span>
  }
  return (
    <div id={key}>
      <div>
        { <div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(rawHtml) }} /> }
      </div>
      <label htmlFor={props.question.id}>Answer </label>
      <Field id={props.question.id} name={props.question.id} 
        placeholder="A, B, C, D or other text" 
        disabled={props.isSubmitted} autoComplete="off" />
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
      year: props.year,
      subject: props.subject,
      title: props.title
    };
    this.state = state;
  }

  componentDidMount() {
    fetch("http://localhost:4001/data/quizes/put", {
      method: 'PUT',
      headers: {'Content-Type': 'application/json; charset=UTF-8'},
      body: JSON.stringify(this.state)})
      .then(res => res.json())
      .then(
        (result) => {
          this.setState({
            isLoaded: true,
            questions: result,
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
          return <Question key={question.id} question={question} isSubmitted={this.state.isSubmitted} />
        })}
      </div>
    );
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
          <h2>{this.state.title}</h2>
          <Formik
            initialValues={dict}
            onSubmit={async (answers) => {

              if (this.state.isSubmitted)
                return;

              // console.log(JSON.stringify(answers, null, 2));
              let countCorrect = 0
              let countAnswer = 0

              for (let key in newQuestions) {
                let question = newQuestions[key];
                if (answers[question.id] !== '') {
                  question.userAnswer = answers[question.id];
                  question.isAnsweredCorrect = question.userAnswer.toUpperCase() === question.providedAnswer.toUpperCase();
                  countCorrect += question.isAnsweredCorrect ? 1 : 0;
                  countAnswer ++
                }
              }
              this.setState({
                isSubmitted: true,
                questions: newQuestions,
                datetime: new Date(),
              });
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