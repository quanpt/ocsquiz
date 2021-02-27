import React from 'react';
import ReactDOM from 'react-dom';
import { Formik, Field, Form } from 'formik';
import './index.css';

const CORRECT_LABEL = "@@@";


function Answer(props) {
  var answer = props.answer;
  var isSubmitted = props.isSubmitted;
  return (
      <label>
        <Field type="Radio" name={props.questionKey} value={("" + props.index)} disabled={isSubmitted}/>
        <span className={
          "answer " + (
            isSubmitted ? (
              answer.isSelected ? (
                answer.isCorrect ? "correctAnswer" : "incorrectAnswer"
              ) : ""
            ) : ""
          )
        }>
          {String.fromCharCode(65 + props.index)}. {props.answer.title}
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
      title: 'Quiz title',
      questions: Array(5),
    };

    for (let i = 0; i < state.questions.length; i ++) {
      state.questions[i] = {
        title: 'question text ' + (i+1),
        id: "q" + (i+1),
        answers: [
          {
            title: 'a1' + (i+1), 
            isCorrect: false,
          },
          {
            title: 'a2' + (i+1), 
            isCorrect: true,
          },
          {
            title: 'a3' + (i+1), 
            isCorrect: false,
          },
        ],
      };
    }

    this.state = state;
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
    return (
      <div>
        <h1>Quiz</h1>
        <Formik
          initialValues={{}}
          onSubmit={async (answers) => {
            
            if (this.state.isSubmitted)
              return;
            
            await new Promise((r) => setTimeout(r, 0));
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
            });

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

// ========================================

ReactDOM.render(<Quiz />, document.getElementById('root'));