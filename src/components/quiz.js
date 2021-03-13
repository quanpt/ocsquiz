import React from 'react';
import ReactDOM from 'react-dom';
import createDOMPurify from 'dompurify'
import { JSDOM } from 'jsdom'

import { Formik, Field, Form } from 'formik';

function Question(props) {
  const window = (new JSDOM('')).window
  const DOMPurify = createDOMPurify(window)
  let key = props.question.id
  var rawHtml = props.question.question
  rawHtml = '<div>#' + props.question.id + ". " + rawHtml.replace(/\r?\n|\r/g,'')
    .replace(/^.*\s*<hr\s*size="1"\/>/gi, '')
    .replace('<br/> <br/> <br/></div>','</div>')
  var answer=""
  if (props.isSubmitted) {
    answer = <span 
        className={"answer " + (props.question.isAnsweredCorrect ? "correctAnswer" : "incorrectAnswer")}>
         {props.question.isAnsweredCorrect ? " Correct" : " INcorrect"}
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


      {/* <div role="group" aria-labelledby={key}>
        {'ABCD'.split('').map((answer, index) => {
          return <Answer key={key + "_" + index} answer={answer} 
            questionKey={key} index={index} 
            isSubmitted={props.isSubmitted} isCorrect={props.question.answer === answer}/>
        })}
      </div> */}
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
      title: null,
      questions: [],
      year: props.year,
      subject: props.subject,
      title: props.title
    };
    this.state = state;
  }

  componentDidMount() {
    fetch("http://localhost:4001/data/questions/get", {
      method: 'POST',
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
        // Note: it's important to handle errors here
        // instead of a catch() block so that we don't swallow
        // exceptions from actual bugs in components.
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
          return <Question key={index} question={question} isSubmitted={this.state.isSubmitted} />
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
                  question.isAnsweredCorrect = question.userAnswer.toUpperCase() === question.answer;
                  countCorrect += question.isAnsweredCorrect ? 1 : 0;
                  countAnswer ++
                }
              }
              this.setState({
                isSubmitted: true,
                questions: newQuestions,
                datetime: new Date(),
              });

              // const response = await fetch(process.env.PUBLIC_URL + "/mock_response.json", {
              //   method: 'POST',
              //   body: JSON.stringify(this.state, null, 2),
              //   headers: { 'Content-Type': 'application/json; charset=UTF-8' }
              // });

              // if (!response.ok) { /* Handle */ }

              // // If you care about a response:
              // if (response.body !== null) {
              //   // body is ReadableStream<Uint8Array>
              //   // parse as needed, e.g. reading directly, or
              //   const asString = new TextDecoder("utf-8").decode(response.body);
              //   // and further:
              //   const asJSON = JSON.parse(asString);  // implicitly 'any', make sure to verify type on runtime.
              //   console.log(asJSON);
              // }

              alert("Total: " + this.state.questions.length + "\nAttempt: " + countAnswer + "\nCorrect: " + countCorrect);
            }}
          >
            {({ answers }) => (
              <Form>
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