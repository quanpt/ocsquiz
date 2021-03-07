// Import deps
import React, { useEffect, useState } from 'react'
import axios from 'axios'

// Import styles
// import './../styles/bookshelf.css'

// Create SubjectListPage component
export function SubjectListPage (props:any) {
  // Prepare states
  const [subjects, setSubjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [year, setYear] = useState(props.getYear())

  useEffect(() => {
    fetchSubjects()
  }, [])

  // Fetch all subject of given year
  const fetchSubjects = async () => {
    axios
      .post('http://localhost:4001/data/subject/get', { year: year })
      .then((response) => {
        setSubjects(response.data)

        // Update loading state
        setLoading(false)
      })
      .catch(error => console.error(`There was an error getting subject of the year ${year}: ${error}`))
  }

  // Year click
  const handleSubjectClick = (subject: string) => {
    axios
      .post('http://localhost:4001/data/subject/get', { year: year })
      .then(() => {
        // fetchSubjects()
      })
      .catch(error => console.error(`There was an error getting subject of the year ${year}: ${error}`))
  }

  return (
    <div className="quiz-list-wrapper">
      {/* <SubjectList year={year} loading={loading} handleSubjectClick={handleSubjectClick} /> */}
    </div>
  )
}