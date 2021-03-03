// Import deps
import React from 'react'

// Create interfaces
interface GradeListRowUI {
  position: number;
  grade: string;
  handleGradeClick: (grade: string) => void;
}

// Create GradeListRow component
export const GradeListRow = (props: GradeListRowUI) => (
  <tr className="table-row">
    <td className="table-item">
      {props.position}.
    </td>

    <td className="table-item">
      {props.grade}
    </td>

    <td className="table-item">
      <button
        className="btn btn-list"
        onClick={() => props.handleGradeClick(props.grade)}>
        View Quizes in Grade
      </button>
    </td>
  </tr>
)