// Import deps
import React, { useEffect, useState } from 'react'
import { BrowserRouter as Route, Link } from "react-router-dom";
import axios from 'axios'
import { SubjectUI } from './subject'

interface TitleUI extends SubjectUI {
  fullTitle: string;
}

interface TitleListUI {
  titles: TitleUI[];
  year: string;
  subject: string;
  loading: boolean;
}

const TitleRow = (props: TitleUI) => (
  <tr className="table-row">
    <td className="table-item">
      <Link to={"/year/" + props.year + "/subject/" + props.subject + "/title/" + encodeURIComponent(props.fullTitle)}>{props.fullTitle.replace(' result', '')}</Link>
    </td>
  </tr>
)

export const TitleList = (props: TitleListUI) => {
  // Show loading message
  if (props.loading) return <p>SubjectList table is loading...</p>

  return (
    <table className="table">
        <tbody className="table-body">
          {props.titles.length > 0 ? (
            props.titles.map((item, idx) => (
              <TitleRow
                key={idx + 1}
                subject={props.subject}
                year={props.year}
                fullTitle={item.fullTitle}
              />
              )
            )
          ) : (
            <tr className="table-row">
              <td className="table-item" style={{ textAlign: 'center' }} colSpan={6}>There are no subject to show. Create one!</td>
            </tr>
          )
        }
        </tbody>
    </table>
  )
}

// Create SubjectListPage component
export function TitleListPage (props: SubjectUI) {
  // Prepare states
  const [titles, setTitles] = useState([])
  const [loading, setLoading] = useState(true)
  const [year, setYear] = useState(props.year)
  const [subject, setSubject] = useState(props.subject)

  useEffect(() => {
    document.title = "Quiz - Titles"
    fetchTitles()
  }, [])

  // Fetch all subject of given year
  const fetchTitles = async () => {
    axios
      .post('/data/title/get', { year: year, subject: subject })
      .then((response) => {
        setTitles(response.data)

        // Update loading state
        setLoading(false)
      })
      .catch(error => console.error(`There was an error getting title of the year '${year}' and subject '${subject}': ${error}`))
  }

  return (
    <div className="quiz-list-wrapper">
      <h1>Titles</h1>
      <TitleList year={year} titles={titles} subject={subject} loading={loading} />
    </div>
  )
}