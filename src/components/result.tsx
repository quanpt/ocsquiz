// Import deps
import React, { useEffect, useState } from 'react'
import { BrowserRouter as Route, Link } from "react-router-dom"
import axios from 'axios'

interface ResultUI {
  id: string
  title: string
  timestamp: number
  lastUpdate: number
  questionCount: number
  answerCount: number
  correctAnswerCount: number
}

interface ResultListUI {
  results: ResultUI[]
  loading: boolean
}

const ResultRow = (props: ResultUI) => (
  <tr className="table-row">
    <td className="table-item" style={{textAlign: "left"}}>
      {props.answerCount > 0 ?
      (<Link to={"/results/" + props.id}>{props.title.replace(' result', '')}</Link>)
      : (<div>{props.title.replace(' result', '')}</div>)
      }
    </td>
    <td className="table-item">{new Date(props.timestamp).toLocaleString('en-AU')}</td>
    <td className="table-item">{((props.lastUpdate - props.timestamp)/60000).toFixed(2)}</td>
    <td className="table-item-number">{props.correctAnswerCount}</td>
    <td className="table-item-number">{props.answerCount}</td>
    <td className="table-item-number">{props.questionCount}</td>
  </tr>
)

export const ResultList = (props: ResultListUI) => {
  // Show loading message
  if (props.loading) return <p>ResultList table is loading...</p>

  return (
    <table className="table content">
        <thead>
          <tr><th className='titleTh'>Title</th><th>Date Time</th><th>Time (m)</th><th>Correct</th><th>Attempt</th><th>Question</th></tr>
        </thead>
        <tbody className="table-body">
          {props.results.length > 0 ? (
            props.results.map((item, idx) => (
              <ResultRow
                key={idx + 1}
                {...item}
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
export function ResultListPage () {

  const [loading, setLoading] = useState(true)
  const [results, setResults] = useState([])

  useEffect(() => {
    document.title = "Quiz - Results"
    fetchResults()
  }, [])

  // Fetch all subject of given year
  const fetchResults = async () => {
    axios
      .get('/data/quizes')
      .then((response) => {
        setResults(response.data)

        // Update loading state
        setLoading(false)
      })
      .catch(error => console.error(`There was an error getting result list`))
  }

  return (
    <div className="quiz-list-wrapper">
      <ResultList loading={loading} results={results} />
    </div>
  )
}