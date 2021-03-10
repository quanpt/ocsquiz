import React from 'react';
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
        <Link to="/"><h1>Year</h1></Link>

          <Switch>
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

function Subjects(props) {
  let match = useRouteMatch();
  let { year } = useParams();
  return <SubjectListPage year={year}/>
}

ReactDOM.render(<App />, document.getElementById('root'))