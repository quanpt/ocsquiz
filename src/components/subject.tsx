// Import deps
import React, { useEffect, useState } from 'react'
import { BrowserRouter as Route, Link } from "react-router-dom";
import axios from 'axios'
import { Year } from './year'

export interface SubjectUI extends Year {
  subject: string;
  year: string;
}

interface SubjectListUI {
  subjects: SubjectUI[];
  year: string;
  loading: boolean;
}

const SubjectListRow = (props: SubjectUI) => (
  <tr className="table-row">
    <td className="table-item">
      <Link to={"/year/" + props.year + "/subject/" + props.subject}>{props.subject}</Link>
    </td>
  </tr>
)

export const SubjectList = (props: SubjectListUI) => {
  // Show loading message
  if (props.loading) return <p>SubjectList table is loading...</p>

  return (
    <table className="table">
        <tbody className="table-body">
          {props.subjects.length > 0 ? (
            props.subjects.map((item, idx) => (
              <SubjectListRow
                key={idx + 1}
                subject={item.subject}
                year={props.year}
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
export function SubjectListPage (props: Year) {
  // Prepare states
  const [subjects, setSubjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [year, setYear] = useState(props.year)

  useEffect(() => {
    fetchSubjects()
  }, [])

  // Fetch all subject of given year
  const fetchSubjects = async () => {
    axios
      .post('/data/subject/get', { year: year })
      .then((response) => {
        setSubjects(response.data)

        // Update loading state
        setLoading(false)
      })
      .catch(error => console.error(`There was an error getting subject of the year ${year}: ${error}`))
  }

  return (
    <div className="quiz-list-wrapper">
      <h1>Subjects</h1>
      <SubjectList year={year} subjects={subjects} loading={loading} />
    </div>
  )
}