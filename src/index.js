import React from 'react';
import ReactDOM from 'react-dom';
import { Formik, Field, Form } from 'formik';
import './index.css';



function Answer(props) {
  return (
    <p>
      <label>
        <Field type="radio" name={props.questionKey} value={props.answer.title}/>
        {props.index}: {props.answer.title}
      </label>
    </p>
  );
}

function Question(props) {
  let key = "question-" + props.question.id;
  return (
    <div id={key}>
      <p>Question: {props.question.title}</p>
      <div role="group" aria-labelledby={key}>
        {props.question.answers.map((answer, index) => {
          return <Answer key={key + "_" + index} answer={answer} questionKey={key} index={index + 1}/>
        })}
      </div>
      <div>Selected answer: TODO</div>
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
        id: i+1,
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
          return <div key={"q_"+index}><Question question={question}/></div>
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
          onSubmit={async (values) => {
            await new Promise((r) => setTimeout(r, 500));
            alert(JSON.stringify(values, null, 2));
          }}
        >
          {({ values }) => (
            <Form>
              {this.renderQuestions()}
              <button type="submit">Submit</button>
            </Form>
          )}
        </Formik>
      </div>
    );
  }
}

// ========================================

ReactDOM.render(<Quiz />, document.getElementById('root'));