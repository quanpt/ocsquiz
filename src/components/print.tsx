import { useEffect, useState } from 'react'
import { toJSON } from 'cssjson';
import useScript from '../hooks/useScript';

// interfaces
export interface QuizI {
    year: string;
    subject: string;
    title: string;
    print: string;
}

function CSStoJSON(css: string) {
    return toJSON(css).attributes
}

function PrintCoverPage(props: { title: string }) {
    return <>
        <div w3-include-html={"/html/header" + getTestType(props.title) + ".html"} />
    </>
}

function PrintBlankPage() {
    return <div className="BlankPage">
        <div>BLANK PAGE</div>
    </div>
}

function PrintQuestionSets(props: { questions: any }) {
    return <>
        {props.questions.map((q: any, index: number) => {
            return <PrintQuestion question={q} n={index} key={"set_" + index} />
        })}
    </>
}

// function PrintQuestionPage(props: { pair: any, index: number }) {
//     if (props.pair.length === 0)
//         return null
//     return <>
//         {props.pair[0].articleImageURL &&
//             <div className="xxx" key={"pagex_" + props.index}>
//                         <span className="QuestionText">
//                             <img alt={props.pair[0].articleImageURL} src={props.pair[0].articleImageURL} className="fulltextImage" />
//                         </span>
//             </div>}
//         {props.pair[0].imageURL &&
//             <div className="xxx" key={"pagex_" + props.index}>
//                         <span className="QuestionText">
//                             <img alt={props.pair[0].imageURL} src={"/assets/articles/" + props.pair[0].imageURL} className="fulltextImage" />
//                         </span>
//             </div>}
//         {props.pair[0].html.indexOf('Which of the above sentences will go into location ') < 0 &&
//             <div className="xxx" key={"page_" + props.index}>
//                     {
//                         [...new Array(props.pair.length)].map((_, i) => i).map((i) => {
//                             return <PrintQuestion question={props.pair[i]} n={i} key={props.pair[i].id} />
//                         })
//                     }
//             </div>}
//     </>
// }

let reImage1 = new RegExp(/\$image1\$/g);

export function FormatQuestionText(text: string, mmfid: number, imageId: number) {
    var rawHtml = text ? text : ''

    rawHtml = rawHtml.replace(/\r?\n|\r/g, '')
        .replace(/^.*\s*<hr\s*size="1"\/>/gi, '')
        .replace(/(<br\/> *)*<\/div>$/g, '<br/></div>')
        .replace(/<br\/> <br\/>/g, '@@@BR@@@')
        .replace(/ @@@BR@@@ A\.{0,1}\s(((?!(<br\/>|@@@BR@@@)).)*)\s<br\/>/g, ' <br/><br/> <span class="AnswerOption" style="word-spacing:0.775em;">A </span> $1 <br/>')
        .replace(/ <br\/>\s([B-G])\.{0,1}\s(((?!(<br\/>|@@@BR@@@)).)*)\s<br\/>/g, ' <br/> <span class="AnswerOption" style="word-spacing:0.775em;">$1 </span> $2 <br/>')
        .replace(/ <br\/>\s([B-G])\.{0,1}\s(((?!(<br\/>|@@@BR@@@)).)*)\s<br\/>/g, ' <br/> <span class="AnswerOption" style="word-spacing:0.775em;">$1 </span> $2 <br/>')
        .replace(/ <br\/>\s([C-G])\.{0,1}\s(((?!(<br\/>|@@@BR@@@)).)*)\s<br\/>/g, ' <br/> <span class="AnswerOption" style="word-spacing:0.775em;">$1 </span> $2 <br/>')
        .replace(/ <br\/>\s([D-G])\.{0,1}\s(((?!(<br\/>|@@@BR@@@)).)*)\s<br\/>/g, ' <br/> <span class="AnswerOption" style="word-spacing:0.775em;">$1 </span> $2 <br/>')
        .replace(/ <br\/>\s([E-G])\.{0,1}\s(((?!(<br\/>|@@@BR@@@)).)*)\s<br\/>/g, ' <br/> <span class="AnswerOption" style="word-spacing:0.775em;">$1 </span> $2 <br/>')
        .replace(/ <br\/>\s([D-G])\.{0,1}\s(((?!(<br\/>|@@@BR@@@)).)*)\s@@@BR@@@/g, ' <br/> <span class="AnswerOption" style="word-spacing:0.775em;">$1 </span> $2 <br/>')
        .replace(/\ssrc="/g, '  class="questionImage" src="/assets/')
        .replace(reImage1, '<img src="/assets/figures/' + mmfid + '_1.jpg" class="questionImage" />')
        .replace('<a href="show_image.html?name=', '<a href="/assets/')
        .replace('target="ReadingText"', 'target="_blank"')

    if (rawHtml.indexOf('Some sentences have been taken out of the reading text') >= 0)
        rawHtml = rawHtml
            .replace(/ @@@BR@@@ ([A-Z])\.{0,1}\s(((?!(<br\/>|@@@BR@@@)).)*)\s@@@BR@@@/g, ' @@@BR@@@ <span class="AnswerOption" style="word-spacing:0.775em;">$1 </span> $2 @@@BR@@@')
            .replace(/ @@@BR@@@ ([A-Z])\.{0,1}\s(((?!(<br\/>|@@@BR@@@)).)*)\s@@@BR@@@/g, ' @@@BR@@@ <span class="AnswerOption" style="word-spacing:0.775em;">$1 </span> $2 @@@BR@@@')
            .replace('Some sentences have been taken out of the reading text. Your task is to identify where these sentences will go back into the text.', 'Some sentences have been removed from the text. Choose from the sentences (A, B, C, …) the one which fits each gap. There is one extra sentence which you do not need to use.')

    rawHtml = rawHtml.replace(/@@@BR@@@/g, '<br/>')


    if (imageId > 0) {
        rawHtml = '<img src="/assets/articles/bigfish/' + imageId + '.jpg" />' + rawHtml;
    }

    return rawHtml
}

export function PrintQuestion(props: { question: any, n: number }) {
    let q = props.question
    let html = q.html.replace(/<br\/> This set has \d+ questions. <b>  It's best to work out all \d+ places where the sentences will go and then quickly answer all questions. <\/b> <br\/>  <br\/>/, '')

    return <>
        {q.articleImageURL &&
            <div className="QuestionText" key={"pagex_" + props.n}>
                    <img alt={q.articleImageURL} src={q.articleImageURL} className="fulltextImage" />
            </div>}
        {q.imageURL &&
            <div className="QuestionText" key={"pagex_" + props.n}>
                    <img alt={q.imageURL} src={"/assets/articles/" + q.imageURL} className="fulltextImage" />
            </div>}
        {q.preText &&
            <div className="QuestionPreText" key={"pagex_" + props.n} dangerouslySetInnerHTML={{ __html: q.preText }}>
            </div>}
        {q.html.indexOf('Which of the above sentences will go into location ') < 0 && q.html !== "" &&
            <div className="OneQuestion" key={q.id}>
                <span className="QuestionNumber">{q.pos + 1}</span>
                <span className="QuestionText" dangerouslySetInnerHTML={{ __html: html }} />
                {props.n === 0 && <span className="AnswerOption">&nbsp; </span>}
            </div>}
    </>
}

function getTestType(title: string) {
    var lowerTitle = title.toLowerCase()
    var types = 'english,thinking,math'.split(',')
    for (var i = 0; i < types.length; i++) {
        if (lowerTitle.indexOf(types[i]) >= 0)
            return types[i]
    }
    return 'math'
}

export function PrintableQuiz(props: QuizI) {
    // Prepare states
    // const [year, setYear] = useState(props.year)
    // const [subject, setSubject] = useState(props.subject)
    const [title] = useState(props.title)
    const [questions, setQuestions] = useState([])
    const [images, setImages] = useState([])
    const [printType] = useState(props.print)
    // const [startQuestion, setStartQuestion] = useState([])

    useEffect(() => {
        document.title = title
        document.body.style.backgroundColor = "white"

        fetch("/data/quiz/images/get", {
            method: 'POST',
            headers: { 'Content-Type': 'application/json; charset=UTF-8' },
            body: JSON.stringify({ title: title })
        })
            .then(res => res.json())
            .then((images) => {
                setImages(images)

                fetch("/data/questions/get", {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json; charset=UTF-8' },
                    body: JSON.stringify({ title: title })
                })
                    .then(res => res.json())
                    .then(
                        (questions) => {
                            var newQs = questions.map((q: any, i: number) => { q.pos = i; return q })
                            images.reduce((agg: number, img: any) => {
                                img.questionStart = agg
                                newQs[agg].imageURL = img.imageURL
                                return agg + img.questionCount
                            }, 0)

                            // grouping questions with the same full text
                            var lastArticle = ""
                            for (var i = 0; i < newQs.length; i++) {
                                var q = newQs[i]
                                let html = FormatQuestionText(q.question, q.mmfid, q.imageId ? q.imageId : 0)

                                if (html.indexOf('Which of the above sentences will go into location 1?') >= 0)
                                    html = html.replace('Which of the above sentences will go into location 1?', '')

                                if (html.match(/^\s*Refer to the (poem|article):* (<br\/> <img|<a) /))
                                    html = html.replace(/ class="questionImage"/g, '')

                                var matches = html.match(/^\s*Refer to the article:* <a href="([^"]*)" /)
                                if (matches) {
                                    if (matches[1] !== lastArticle) {
                                        // new article
                                        q.articleImageURL = matches[1]
                                        if (q.articleImageURL.indexOf(q.imageURL) >= 0)
                                            q.imageURL = null
                                        lastArticle = matches[1]
                                    } else {
                                        // existing article
                                    }
                                    html = html.replace(/^\s*Refer to the article:* <a href="([^"]*)" .* <img border="0" +src="\/assets\/images\/reading\.gif" width="48"\/> <\/a> <br\/>/, '')
                                }
                                newQs[i].html = html
                            }

                            setQuestions(newQs)
                        }
                    )
            })
    }, [title])

    useScript('/html/includeHTML.js');

    return (
        <>
            {printType === 'full' && <>
                <PrintCoverPage title={title} />
                <PrintBlankPage />
            </>}
            <div className="PageCenter">
                <PrintQuestionSets questions={questions} />
            </div>
            {printType === 'full' && <PrintBlankPage />}
        </>
    )
}