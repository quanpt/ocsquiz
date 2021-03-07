// Import deps
import React from 'react'
import {YearUI} from './year-list'

// Create interfaces
interface YearListRowUI extends YearUI {
  handleYearClick: (grade: string) => void;
}

// Create YearListRow component
export const YearListRow = (props: YearListRowUI) => (
  <tr className="table-row">
    <td className="table-item">
      {props.position}.
    </td>

    <td className="table-item">
      {props.year}
    </td>

    <td className="table-item">
      <button
        className="btn btn-list"
        onClick={() => props.handleYearClick(props.year)}>
        View Quizes in Year
      </button>
    </td>
  </tr>
)