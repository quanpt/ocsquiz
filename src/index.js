import React from 'react';
import ReactDOM from 'react-dom';
import { Formik, Field, Form } from 'formik';
import './index.css';
import { YearListPage } from './components/year'

function Answer(props) {
  var { answer, questionKey, index, isSubmitted } = props;
  return (
      <label>
        <Field type="Radio" name={questionKey} value={("" + index)} disabled={isSubmitted}/>
        <span className={
          "answer " + (
            isSubmitted ? (
              answer.isSelected ? (
                answer.isCorrect ? "correctAnswer" : "incorrectAnswer"
              ) : ""
            ) : ""
          )
        }>
          {String.fromCharCode(65 + index)}. {answer.title}
        </span>
      </label>
  );
}

function Question(props) {
  let key = props.question.id;
  return (
    <div id={key}>
      <p>Question: {props.question.title}</p>
      <div role="group" aria-labelledby={key}>
        {props.question.answers.map((answer, index) => {
          return <Answer key={key + "_" + index} answer={answer} questionKey={key} index={index} isSubmitted={props.isSubmitted}/>
        })}
      </div>
      <hr/>
    </div>
  );
}

class Quiz extends React.Component {
  constructor(props){
    super(props);
    let state = {
      error: null,
      isLoaded: false,
      title: null,
      questions: [],
    };

    this.state = state;
  }

  componentDidMount() {
    fetch(process.env.PUBLIC_URL + "/mock.json")
      .then(res => res.json())
      .then(
        (result) => {
          this.setState({
            isLoaded: true,
            title: result.title,
            questions: result.questions,
          });
        },
        // Note: it's important to handle errors here
        // instead of a catch() block so that we don't swallow
        // exceptions from actual bugs in components.
        (error) => {
          this.setState({
            isLoaded: true,
            error
          });
        }
      )
  }

  renderQuestions() {
    return (
      <div>
        {this.state.questions.map((question, index) => {
          return <Question key={index} question={question} isSubmitted={this.state.isSubmitted}/>
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
      return (
        <div>
          <h1>Quiz</h1>
          <Formik
            initialValues={{}}
            onSubmit={async (answers) => {
              
              if (this.state.isSubmitted)
                return;

              console.log(JSON.stringify(answers, null, 2));
              let newQuestions = this.state.questions.slice();
              let countCorrect = 0;

              for (let key in newQuestions) {
                let question = newQuestions[key];
                console.log(question.id + " " + answers[question.id]);
                if (answers[question.id]) {
                  question.answers[answers[question.id]].isSelected = true;
                  countCorrect += question.answers[answers[question.id]].isCorrect ? 1 : 0;
                }
              }
              this.setState({
                isSubmitted: true,
                questions: newQuestions,
                datetime: new Date(),
              });

              const response = await fetch(process.env.PUBLIC_URL + "/mock_response.json", {
                method: 'POST',
                body: JSON.stringify(this.state, null, 2),
                headers: {'Content-Type': 'application/json; charset=UTF-8'} });

              if (!response.ok) { /* Handle */ }

              // If you care about a response:
              if (response.body !== null) {
                // body is ReadableStream<Uint8Array>
                // parse as needed, e.g. reading directly, or
                const asString = new TextDecoder("utf-8").decode(response.body);
                // and further:
                const asJSON = JSON.parse(asString);  // implicitly 'any', make sure to verify type on runtime.
                console.log(asJSON);
              }

              alert("Total: " + this.state.questions.length + "\nAttempt: " + Object.keys(answers).length + "\nCorrect: " + countCorrect);
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

// ========================================

// ReactDOM.render(<Quiz />, document.getElementById('root'));

ReactDOM.render(<YearListPage />, document.getElementById('root'))