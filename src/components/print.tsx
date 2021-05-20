import { useEffect, useState } from 'react'
import { toJSON } from 'cssjson';
import useScript from '../hooks/useScript';

// interfaces
export interface QuizI {
    year: string;
    subject: string;
    title: string;
}

function CSStoJSON(css:string) {
    return toJSON(css).attributes
}

export function PrintableQuiz(props: QuizI) {
    // Prepare states
    const [year, setYear] = useState(props.year)
    const [subject, setSubject] = useState(props.subject)
    const [title, setTitle] = useState(props.title)
    const [loading, setLoading] = useState(true)
    const [questions, setQuestions] = useState([])
    const [images, setImages] = useState([])

    useEffect(() => {
        document.title = title
        fetch("/data/questions/get", {
            method: 'POST',
            headers: { 'Content-Type': 'application/json; charset=UTF-8' },
            body: JSON.stringify(props)
        })
            .then(res => res.json())
            .then(
                (result) => {
                    setQuestions(result)
                    console.log(result)
                }
            )
        fetch("/data/quiz/images/get", {
            method: 'POST',
            headers: { 'Content-Type': 'application/json; charset=UTF-8' },
            body: JSON.stringify(props)
        })
            .then(res => res.json())
            .then(
                (result) => {
                    setImages(result)
                    console.log(result)
                }
            )
    }, [])

    useScript('/assets/html/includeHTML.js');
    
    return (
        <>
            <div className="stl_ stl_02">
                <div w3-include-html="/assets/html/page01.html" />
            </div>
            <div className="stl_ stl_02">
                <div className="stl_view">
                    <div className="stl_05 stl_06">
                        <div className="stl_01" style={CSStoJSON("left:21.5015em;top:21.0262em;")}><span className="stl_07 stl_08 stl_42" style={CSStoJSON("word-spacing:0.0031em;")}>BLANK PAGE &nbsp;</span></div>
                        <div className="stl_01" style={CSStoJSON("left:24.5309em;top:66.0238em;")}>
                            <span className="stl_24 stl_08 stl_11">2</span>
                        </div>
                    </div>
                </div>
            </div>
            <div className="stl_ stl_02">
                <div className="stl_view">
                    <span className="HeadSpace">&nbsp;</span>
                    <div className="stl_05">
                        <span className="QuestionNumber">1</span>
                        <span className="QuestionText">
                            What is the approximate total mass of the objects on the tray?
                        </span>
                    </div>
                    <span className="AnswerOption">&nbsp; </span>
                    <div className="stl_05">
                        <span className="QuestionNumber">2</span>
                        <span className="QuestionText">Whenever Clara enters a 2-digit number into her calculator
                        </span>
                    </div>
                    <div className="stl_01" style={CSStoJSON("left:24.5309em;top:66.0238em;")}><span className="stl_24 stl_08 stl_11">3</span></div>
                </div>
            </div>
            <div className="stl_ stl_02">
                <div className="stl_view">
                    <div className="stl_05 stl_06">
                        <div className="stl_01" style={CSStoJSON("left:21.5015em;top:21.0262em;")}><span className="stl_07 stl_08 stl_42" style={CSStoJSON("word-spacing:0.0031em;")}>BLANK PAGE &nbsp;</span></div>
                        <div className="stl_01" style={CSStoJSON("left:24.251em;top:66.0232em;")}><span className="stl_118 stl_08 stl_101">32 &nbsp;</span></div>
                    </div>
                </div>
            </div>
        </>
    )
}