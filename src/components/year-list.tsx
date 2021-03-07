// Import deps
import React from 'react'

// Import components
import { YearListRow } from './year-list-row'

// Import styles
// import './../styles/Grade-list.css'

// Create interfaces
export interface YearUI {
  position: number;
  year: string;
}

interface YearListUI {
  years: YearUI[];
  loading: boolean;
  handleYearClick: (year: string) => void;
}

// Create GradeList component
export const YearList = (props: YearListUI) => {
  // Show loading message
  if (props.loading) return <p>YearList table is loading...</p>

  return (
    <table className="table">
        <thead>
          <tr>
            <th className="table-head-item" />

            <th className="table-head-item">Year</th>

            <th className="table-head-item" />
          </tr>
        </thead>

        <tbody className="table-body">
          {props.years.length > 0 ? (
            props.years.map((year: YearUI, idx) => (
              <YearListRow
                key={idx + 1}
                position={idx + 1}
                year={year.year}
                handleYearClick={props.handleYearClick}
              />
              )
            )
          ) : (
            <tr className="table-row">
              <td className="table-item" style={{ textAlign: 'center' }} colSpan={6}>There are no year to show. Create one!</td>
            </tr>
          )
        }
        </tbody>
    </table>
  )
}