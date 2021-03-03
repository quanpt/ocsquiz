// Import deps
import React from 'react'

// Import components
import { GradeListRow } from './grade-list-row'

// Import styles
// import './../styles/Grade-list.css'

// Create interfaces
interface GradeUI {
  position: number;
  grade: string;
}

interface GradeListUI {
  grades: GradeUI[];
  loading: boolean;
  handleGradeClick: (grade: string) => void;
}

// Create GradeList component
export const GradeList = (props: GradeListUI) => {
  // Show loading message
  if (props.loading) return <p>GradeList table is loading...</p>

  return (
    <table className="table">
        <thead>
          <tr>
            <th className="table-head-item" />

            <th className="table-head-item">Grade</th>

            <th className="table-head-item" />
          </tr>
        </thead>

        <tbody className="table-body">
          {props.grades.length > 0 ? (
            props.grades.map((grade: GradeUI, idx) => (
              <GradeListRow
                key={idx + 1}
                position={idx + 1}
                grade={grade.grade}
                handleGradeClick={props.handleGradeClick}
              />
              )
            )
          ) : (
            <tr className="table-row">
              <td className="table-item" style={{ textAlign: 'center' }} colSpan={6}>There are no grade to show. Create one!</td>
            </tr>
          )
        }
        </tbody>
    </table>
  )
}