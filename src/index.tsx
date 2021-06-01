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
import './styles/index.css';
import './styles/oc.css';

import { SubjectListPage } from './components/subject'
import { YearListPage } from './components/year'
import { TitleListPage } from './components/title'

import { Quiz } from './components/quiz'
import { PrintableQuiz } from './components/print'
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
        <Switch>
          <Route path="/year/:year/subject/:subject/title/:title/state/:questionState">
            <Quizes />
          </Route>
          <Route path="/year/:year/subject/:subject/title/:title/print/:print">
            <PrintableQuizes />
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
            <Results />
          </Route>
          <Route path="/user">
            <UserPage />
          </Route>
          <Route path="/">
            <Years />
          </Route>
        </Switch>
      </Router>
    );
  }
}

function QuizView() {
  let { id } = useParams<{ id: string }>();
  return <>
    <div className="online wrapper bg-white rounded">
    <Navigator year='' subject='' link='results' />
    <Quiz isViewMode={true} id={id} />
    </div>
  </>
}

function Quizes() {
  let { year, subject, title, questionState } = useParams<{ year: string, subject: string, title: string, questionState: string }>();
  return <div className="outer">
    <div className="middle">
      <div className="inner">
        <Navigator year={year} subject={subject} />
        <Quiz year={year} subject={subject} title={title} questionState={questionState} />
        {/* </div> */}
      </div></div></div>
}

function Titles() {
  let { year, subject } = useParams<{ year: string, subject: string }>();
  return <div className="online wrapper bg-white rounded">
    <Navigator year={year} subject={subject} />
    <TitleListPage year={year} subject={subject} />
  </div>
}

function Subjects() {
  let { year } = useParams<{ year: string }>();
  return <div className="online wrapper bg-white rounded">
    <Navigator year={year} subject="" />
    <SubjectListPage year={year} />
  </div>
}

function Years() {
  return <div className="online wrapper bg-white rounded">
    <Navigator year="" subject="" />
    <YearListPage />
  </div>
}

function Results() {
  return <div className="online wrapper bg-white rounded">
    <Navigator year='' subject='' link='results' />
    <ResultListPage />
  </div>
}

function UserPage() {
  return <div>
    {Cookies.set('user', 'admin')}
    <span>User set</span>
  </div>
}

function PrintableQuizes() {
  let { year, subject, title, print } = useParams<{ year: string, subject: string, title: string, print: string }>();
  return <PrintableQuiz year={year} subject={subject} title={title} print={print} />
}

function Navigator(props: any) {
  return <span>
    <span><Link to='/'>Home</Link></span>&nbsp;&gt;&nbsp;
      {props.year !== '' && <span><Link to={"/year/" + props.year}>{props.year}</Link>&nbsp;&gt;&nbsp;</span>}
    {props.subject !== '' && <span><Link to={"/year/" + props.year + "/subject/" + props.subject}>{props.subject}</Link>&nbsp;&gt;&nbsp;</span>}
    {props.link !== '' && <Link to={"/" + props.link}><span>{props.link}</span></Link>}
  </span>
}

ReactDOM.render(<App />, document.getElementById('root'))