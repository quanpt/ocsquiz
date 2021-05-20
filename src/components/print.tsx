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

function PrintCoverPage() {
    return <div className="stl_ stl_02" key="page01">
        <div w3-include-html="/assets/html/page01.html" />
    </div>
}

function PrintBlankPage(props: {page: number}) {
    return <div className="stl_ stl_02"  key="page02">
        {/* blank page */}
        <div className="stl_view">
            <div className="stl_05 stl_06">
                <div className="stl_01" style={CSStoJSON("left:21.5015em;top:21.0262em;")}><span className="stl_07 stl_08 stl_42" style={CSStoJSON("wordSpacing:0.0031em;")}>BLANK PAGE &nbsp;</span></div>
                <div className="stl_01" style={CSStoJSON("left:24.5309em;top:66.0238em;")}>
                    <span className="stl_24 stl_08 stl_11">{props.page}</span>
                </div>
            </div>
        </div>
    </div>
}

function PrintQuestionSets(props: {questionSets: any}) {
    return <>
        {props.questionSets.map((pair: any, index: number) => {
        return <PrintQuestionPage pair={pair} index={index} key={"set_" + index} />
        })}
    </>
}

function PrintQuestionPage(props: {pair: any, index: number}) {
    return <div className="stl_ stl_02" key={"page_" + props.index}>
                <div className="stl_view">
                    <span className="HeadSpace">&nbsp;</span>
                    {
                        [...new Array(props.pair.length)].map((_,i) => i).map((i) => {
                            return <PrintQuestion question={props.pair[i]} index={props.index} n={i} key={props.index * 2 + i} />
                        })
                    }
                    <div className="stl_01" style={CSStoJSON("left:24.5309em;top:66.0238em;")}>
                        <span className="stl_24 stl_08 stl_11">{props.index + 3}</span>
                    </div>
                </div>
            </div>
}

function PrintQuestion(props: {question: any, index: number, n: number}) {
    
    return <div className="stl_05" key={"question_" + props.index + "_" + props.n}>
            <span className="QuestionNumber">{props.index * 2 + props.n + 1}</span>
            <span className="QuestionText">
                {JSON.stringify(props.question.qgroup)}
            </span>
            { props.n === 1 && <span className="AnswerOption">&nbsp; </span> }
        </div>
}

export function PrintableQuiz(props: QuizI) {
    // Prepare states
    // const [year, setYear] = useState(props.year)
    // const [subject, setSubject] = useState(props.subject)
    const [title] = useState(props.title)
    // const [loading, setLoading] = useState(true)
    const [questionSets, setQuestionSets] = useState([[]])
    // const [images, setImages] = useState([])

    useEffect(() => {
        document.title = title
        fetch("/data/questions/get", {
            method: 'POST',
            headers: { 'Content-Type': 'application/json; charset=UTF-8' },
            body: JSON.stringify({title: title})
        })
            .then(res => res.json())
            .then(
                (questions) => {
                    var newQuestionSets = [];
                    var size = 2;
                    for (var i = 0; i < questions.length; i += size) {
                        newQuestionSets.push(questions.slice(i, size + i));
                    }
                    setQuestionSets(newQuestionSets)
                }
            )
        // fetch("/data/quiz/images/get", {
        //     method: 'POST',
        //     headers: { 'Content-Type': 'application/json; charset=UTF-8' },
        //     body: JSON.stringify(props)
        // })
        //     .then(res => res.json())
        //     .then(
        //         (result) => {
        //             setImages(result)
        //             // console.log(result)
        //         }
        //     )
    }, [title])

    useScript('/assets/html/includeHTML.js');

    return (
        <>
            <PrintCoverPage />
            <PrintBlankPage page={2} />
            <PrintQuestionSets questionSets={questionSets} />
            <PrintBlankPage page={32}/>
        </>
    )
}