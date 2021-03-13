import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Link,
  useRouteMatch,
  useParams
} from "react-router-dom";
import './index.css';

import { SubjectListPage } from './components/subject'
import { YearListPage } from './components/year'
import { TitleListPage } from './components/title'

import { Quiz } from './components/quiz'

// ========================================

// ReactDOM.render(<Quiz />, document.getElementById('root'));
// ReactDOM.render(<YearListPage />, document.getElementById('root'))

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      year: 0,
      subject: null,
      title: null,
      questions: [],
      answers: [],
    };
  }

  render() {
    return (
      <Router>
        <div>
        <Link to="/"><h1>Home</h1></Link>

          <Switch>
            <Route path="/year/:year/subject/:subject/title/:title">
              <Quizes/>
            </Route>
            <Route path="/year/:year/subject/:subject">
              <Titles/>
            </Route>
            <Route path="/year/:year">
              <Subjects/>
            </Route>
            <Route path="/">
              <YearListPage />
            </Route>
          </Switch>
        </div>
      </Router>
    );
  }
}

function Quizes(props) {
  let { year, subject, title } = useParams();
  return <Quiz year={year} subject={subject} title={title}/>
}

function Titles(props) {
  let { year, subject } = useParams();
  return <TitleListPage year={year} subject={subject} />
}

function Subjects(props) {
  let { year } = useParams();
  return <SubjectListPage year={year}/>
}

ReactDOM.render(<App />, document.getElementById('root'))