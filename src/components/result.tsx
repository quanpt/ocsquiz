// Import deps
import { useEffect, useState } from 'react'
import { Link } from "react-router-dom"

import {stringLooseMatched} from "../common/string"

interface ResultUI {
  id: string
  title: string
  timestamp: number
  lastUpdate: number
  questionCount: number
  answerCount: number
  correctAnswerCount: number
  isSelected: boolean
  onQuizSelectionChangeHandler: any
}

interface ResultListUI {
  results: ResultUI[]
  loading: boolean
  filter: string
  onQuizSelectionChangeHandler: any
  onClickSelectAll: any
}

const ResultRow = (props: ResultUI) => (
  <tr className="table-row">
    <td className="table-item" style={{ textAlign: "left" }}>
      {props.answerCount > 0 ?
        (<Link to={"/results/" + props.id}>{props.title.replace(' result', '')}</Link>)
        : (<div>{props.title.replace(' result', '')} - {props.id}</div>)
      }
    </td>
    <td className="table-item">{new Date(props.timestamp).toLocaleString('en-AU')}</td>
    <td className="table-item">{((props.lastUpdate - props.timestamp) / 60000).toFixed(2)}</td>
    <td className="table-item-number">{props.correctAnswerCount}</td>
    <td className="table-item-number">{props.answerCount}</td>
    <td className="table-item-number">{props.questionCount}</td>
    <td className="table-item">
      <input name="isQuizSelected" value={props.id}
        type="checkbox" checked={props.isSelected} onChange={props.onQuizSelectionChangeHandler} />
    </td>
  </tr>
)

const QuestionTypeList = (props: { quizList: Array<any> }) => {
  const [results, setResults] = useState([])

  function weight(e: any) {
    return e.errorCount + e.errorCount / (e.errorCount + e.correctCount)
  }

  useEffect(() => {
    var quizIds = props.quizList.filter((item: any) => (item.isSelected)).map((item: any) => {return item.id})
    if (quizIds.length > 0)
      fetch("/data/quiz/question/category/get", {
        method: 'POST',
        headers: { 'Content-Type': 'application/json; charset=UTF-8' },
        body: JSON.stringify({quizIds: quizIds})
      })
        .then(res => res.json())
        .then((response) => {
          var newResults = response
            .filter((item: any) => item.errorCount > 0)
            .map((item: any) => { item.percent = Math.round(100 * item.errorCount / (item.errorCount + item.correctCount)); return item })
          newResults.sort((e1: any, e2: any) => { return weight(e2) - weight(e1)})
          setResults(newResults)
        })
    else
      setResults([])
  }, [props.quizList])

  return <div>
    {results.length > 0 && <table className="table content">
      <thead>
        <tr>
          <th className='titleTh'>Category</th>
          <th>Error</th><th>Correct</th>
        </tr>
      </thead>
      <tbody className="table-body">
        {results.map((item: any, idx) => <tr key={idx}>
          <td>{item.qgroup}</td>
          <td className="table-item-number">{item.errorCount} ({item.percent}%)</td>
          <td className="table-item-number">{item.correctCount}</td>
        </tr>)}
      </tbody></table>}
  </div>
}

const ResultList = (props: ResultListUI) => {
  // Show loading message
  if (props.loading) return <p>ResultList table is loading...</p>

  return (
    <table className="table content">
      <thead>
        <tr>
          <th className='titleTh'>Title</th>
          <th style={{ width: '200px' }}>Date Time</th>
          <th>Time (m)</th><th>Correct</th><th>Attempt</th><th>Question</th>
          <th>Selected
            <button onClick={() => props.onClickSelectAll(true)}>All</button>
            <button onClick={() => props.onClickSelectAll(false)}>None</button>
          </th>
        </tr>
      </thead>
      <tbody className="table-body">
        {props.results.length > 0 ? (
          props.results
            .filter(d => stringLooseMatched(d.title, props.filter))
            .map((item, idx) => (
              <ResultRow
                key={idx + 1}
                {...item}
                onQuizSelectionChangeHandler={props.onQuizSelectionChangeHandler}
              />
            )
            )
        ) : (
          <tr className="table-row">
            <td className="table-item" style={{ textAlign: 'center' }} colSpan={6}>There are no result to show. Create one!</td>
          </tr>
        )
        }
      </tbody>
    </table>
  )
}

// Create SubjectListPage component
export function ResultListPage() {

  const [loading, setLoading] = useState(true)
  const [results, setResults] = useState<Array<any>>([])
  const [filter, setFilter] = useState('')

  useEffect(() => {
    document.title = "Quiz - Results"
    fetchResults()
  }, [])

  function onFilterChangeHandler(e: any) {
    setFilter(e.target.value)
  }

  function onQuizSelectionChangeHandler(e: any) {
    let newResults = [...results];
    setResults(newResults
      .map((item: any) => {
        if (item.id === parseInt(e.target.value)) {
          item.isSelected = e.target.checked; 
        }
        return item
      }))
  }

  function onClickSelectAll(isSelected: boolean) {
    let newResults = [...results]
    setResults(newResults
      .filter(d => stringLooseMatched(d.title, filter))
      .map((item: any) => {item.isSelected = isSelected; return item}))
  }

  // Fetch all subject of given year
  const fetchResults = async () => {
    fetch("/data/quizes", {
      method: 'GET',
      headers: { 'Content-Type': 'application/json; charset=UTF-8' },
    })
      .then(res => res.json())
      .then((response) => {

        setResults(response.map((item: any) => {item.isSelected = false; return item}))

        // Update loading state
        setLoading(false)
      })
      .catch(error => console.error(`There was an error getting result list`))
  }

  return (
    <div className="quiz-list-wrapper">
      <QuestionTypeList quizList={results} />
      <input placeholder='filter value' value={filter} type="text" onChange={onFilterChangeHandler} />
      <ResultList loading={loading} results={results} filter={filter} 
        onQuizSelectionChangeHandler={onQuizSelectionChangeHandler} 
        onClickSelectAll={onClickSelectAll}/>
    </div>
  )
}