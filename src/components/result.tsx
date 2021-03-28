// Import deps
import React, { useEffect, useState } from 'react'
import { BrowserRouter as Route, Link } from "react-router-dom"
import axios from 'axios'

interface ResultUI {
  quizId: string
  quizTitle: string
  quizTime: Date
}

interface ResultListUI {
  results: ResultUI[]
  loading: boolean
}

const ResultRow = (props: ResultUI) => (
  <tr className="table-row">
    <td className="table-item">
      <Link to={"/result/" + props.quizId}>{props.quizTitle} ({props.quizTime})</Link>
    </td>
  </tr>
)

export const ResultList = (props: ResultListUI) => {
  // Show loading message
  if (props.loading) return <p>ResultList table is loading...</p>

  return (
    <table className="table">
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
export function ResultListPage (props: ResultListUI) {

  const [loading, setLoading] = useState(true)
  const [results, setResults] = useState([])

  useEffect(() => {
    fetchResults()
  }, [])

  // Fetch all subject of given year
  const fetchResults = async () => {
    axios
      .post('http://localhost:4001/data/results/get')
      .then((response) => {
        setResults(response.data)

        // Update loading state
        setLoading(false)
      })
      .catch(error => console.error(`There was an error getting result list`))
  }

  return (
    <div className="quiz-list-wrapper">
      <h1>Titles</h1>
      {/* <TitleList year={year} titles={titles} subject={subject} loading={loading} /> */}
    </div>
  )
}