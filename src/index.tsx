import React from 'react';
import ReactDOM from 'react-dom';
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Link,
  useParams
} from "react-router-dom";
import './index.css';

import { SubjectListPage } from './components/subject'
import { YearListPage } from './components/year'
import { TitleListPage } from './components/title'

import { Quiz } from './components/quiz'
import { ResultListPage } from './components/result'

// ========================================

// ReactDOM.render(<Quiz />, document.getElementById('root'));
// ReactDOM.render(<YearListPage />, document.getElementById('root'))

class App extends React.Component {
  constructor(props: any) {
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
        <div className="wrapper bg-white rounded">
          <Link to="/"><h1>Home</h1></Link>
          <Switch>
            <Route path="/year/:year/subject/:subject/title/:title/full/:isFull">
              <Quizes/>
            </Route>
            <Route path="/year/:year/subject/:subject">
              <Titles />
            </Route>
            <Route path="/year/:year">
              <Subjects />
            </Route><Route path="/results/:id">
              <QuizView />
            </Route>
            <Route path="/results">
              <ResultListPage />
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

function QuizView() {
  let { id } = useParams<{ id: string }>();
  return <Quiz isViewMode={true} id={id} />
}

function Quizes() {
  let { year, subject, title, isFull } = useParams<{ year: string, subject: string, title: string, isFull: string }>();
  return <Quiz year={year} subject={subject} title={title} isFull={isFull=='1'}/>
}

function Titles() {
  let { year, subject } = useParams<{ year: string, subject: string }>();
  return <div>
      <Navigator year={year} subject={subject} />  
      <TitleListPage year={year} subject={subject} />
    </div>
}

function Subjects() {
  let { year } = useParams<{ year: string }>();
  return <div>
      <Navigator year={year} subject="" />
      <SubjectListPage year={year} />
    </div>
}

function Navigator(props: any) {
  if (props.subject === "") {
    return <Link to={"/year/" + props.year}><span>{props.year}</span></Link>
  } else {
    return <span>
        <Link to={"/year/" + props.year}><span>{props.year}</span></Link>
        <Link to={"/year/" + props.year + "/subject/" + props.subject}><span>{props.subject}</span></Link>
      </span>
  }
  
}

ReactDOM.render(<App />, document.getElementById('root'))