import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';

function Question(props) {
  return (
    <div>
      Question: {props.title}
      Answer: xxx
    </div>
  );
}

class Quiz extends React.Component {
  constructor(props){
    super(props);
    this.state = {
      title: 'Quiz title',
      questions: Array(5).fill({
        title: 'question text',
        answers: [
          {
            title: 'a1', 
            isCorrect: false,
          },
          {
            title: 'a2', 
            isCorrect: true,
          },
          {
            title: 'a3', 
            isCorrect: false,
          },
        ],
      }),
    };
  }
  renderQuestions() {

    return (
      <ul>
        {this.state.questions.map((question, index) => {
          return <li key={index}><Question question={question}/></li>
        })}
      </ul>
    );
  }

  render() {
    return (
      <div>
        <h1>Quiz</h1>
        <div>
          {this.renderQuestions()}
        </div>
      </div>
    );
  }
}


// ========================================

ReactDOM.render(
  <Quiz />,
  document.getElementById('root')
);