// Import deps
import React, { useEffect, useState } from 'react'
import axios from 'axios'

import { BrowserRouter as Route, Link } from "react-router-dom";
import { SubjectListRow } from './subject'

// interfaces
export interface Year {
  year: string;
}

interface YearUI extends Year {
  position: number;
  year: string;
}

interface YearListUI {
  years: YearUI[];
  loading: boolean;
}

const YearListRow = (props: YearUI) => (
  <tr className="table-row">
    <td className="table-item">
      <Link to={"/year/" + props.year}>{props.year}</Link>
    </td>
  </tr>
)

export const YearList = (props: YearListUI) => {
  // Show loading message
  if (props.loading) return <p>YearList table is loading...</p>

  return (
    <table className="table">
        <tbody className="table-body">
          {props.years.length > 0 ? (
            props.years.map((year: YearUI, idx) => (
              <YearListRow
                key={idx + 1}
                position={idx + 1}
                year={year.year}
              />
              )
            )
          ) : (
            <tr className="table-row">
              <td className="table-item" style={{ textAlign: 'center' }} colSpan={6}>There are no year to show. Create one!</td>
            </tr>
          )
        }
        <SubjectListRow
            key={9999}
            subject='All'
            year='All'
          />
        </tbody>
    </table>
  )
}

export const YearListPage = () => {
  // Prepare states
  const [years, setYears] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    document.title = "Quiz - Years"
    fetchYears()
  }, [])

  const fetchYears = async () => {
    axios
      .get('/data/year/get')
      .then(response => {
        var resYears = response.data
        resYears.sort((a: Year, b: Year) => (a.year < b.year ? -1 : 1))
        setYears(resYears)
        setLoading(false)
      })
      .catch(error => console.error(`There was an error retrieving the year list: ${error}`))
  }

  return (
    <div className="quiz-list-wrapper">
      <h1>Year</h1>
      <YearList years={years} loading={loading} />
      <Link to="/results"><h2>Result</h2></Link>
    </div>
  )
}