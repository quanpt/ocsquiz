import React from 'react';
import ReactDOM from 'react-dom';
import Cookies from 'js-cookie';
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
          <Switch>
            <Route path="/year/:year/subject/:subject/title/:title/state/:questionState">
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
              <Results/>
            </Route>
            <Route path="/user">
              <UserPage />
            </Route>
            <Route path="/">
              <Years/>
            </Route>
          </Switch>
        </div>
      </Router>
    );
  }
}

function QuizView() {
  let { id } = useParams<{ id: string }>();
  return <div>
      <Navigator year='' subject='' link='results' />
      <Quiz isViewMode={true} id={id} />
    </div>
}

function Quizes() {
  let { year, subject, title, questionState } = useParams<{ year: string, subject: string, title: string, questionState: string }>();
  return <div>
      <Navigator year={year} subject={subject} />
      <Quiz year={year} subject={subject} title={title} questionState={questionState}/>
    </div>
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

function Years() {
  return <div>
    <Navigator year="" subject="" />
    <YearListPage />
  </div>
}

function Results() {
  return <div>
      <Navigator year='' subject='' link='results' />
      <ResultListPage/>
    </div>
}

function UserPage() {
  return <div>
    {Cookies.set('user', 'admin')}
    <span>User set</span>
  </div>
}

function Navigator(props: any) {
  return <span>
      <span><Link to='/'>Home</Link></span>&gt;
      {props.year != '' && <span><Link to={"/year/" + props.year}>{props.year}</Link> &gt;</span>}
      {props.subject != '' && <span><Link to={"/year/" + props.year + "/subject/" + props.subject}>{props.subject}</Link> &gt;</span>}
      {props.link != '' && <Link to={"/" + props.link}><span>{props.link}</span></Link>}
    </span>
}

ReactDOM.render(<App />, document.getElementById('root'))