import { useEffect, useState } from 'react'

import '../oc.css';

// interfaces
export interface QuizI {
    year: string;
    subject: string;
    title: string;
}

export function PrintableQuiz(props: QuizI) {
    // Prepare states
    const [year, setYear] = useState(props.year)
    const [subject, setSubject] = useState(props.subject)
    const [title, setTitle] = useState(props.title)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        document.title = title
        // fetchSubjects()
    }, [])

    return (
        <div>
            <h1>PrintableQuiz</h1>
        </div>
    )
}