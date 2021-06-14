import { useEffect, useState } from 'react'
import useScript from '../hooks/useScript';

// interfaces
export interface QuizI {
    year: string;
    subject: string;
    title: string;
    print: string;
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
        .replace(/<br\/>\s*<br\/>/g, '@@@BR@@@')
        .replace(/ *@@@BR@@@ *A\.{0,1}\s(((?!(<br\/>|@@@BR@@@)).)*)\s<br\/>/g, ' <br/><br/> <span class="AnswerOption">A </span><span class="AnswerText"> $1 </span><br/>')
        .replace(/ *<br\/>\s*([A-G])\.{0,1}\s(((?!(<br\/>|@@@BR@@@)).)*)\s*<br\/>/g, ' <br/> <span class="AnswerOption">$1 </span><span class="AnswerText"> $2 </span><br/>')
        .replace(/ *<br\/>\s*([B-G])\.{0,1}\s(((?!(<br\/>|@@@BR@@@)).)*)\s*<br\/>/g, ' <br/> <span class="AnswerOption">$1 </span><span class="AnswerText"> $2 </span><br/>')
        .replace(/ *<br\/>\s*([C-G])\.{0,1}\s(((?!(<br\/>|@@@BR@@@)).)*)\s*<br\/>/g, ' <br/> <span class="AnswerOption">$1 </span><span class="AnswerText"> $2 </span><br/>')
        .replace(/ *<br\/>\s*([D-G])\.{0,1}\s(((?!(<br\/>|@@@BR@@@)).)*)\s*<br\/>/g, ' <br/> <span class="AnswerOption">$1 </span><span class="AnswerText"> $2 </span><br/>')
        .replace(/ *<br\/>\s*([E-G])\.{0,1}\s(((?!(<br\/>|@@@BR@@@)).)*)\s*<br\/>/g, ' <br/> <span class="AnswerOption">$1 </span><span class="AnswerText"> $2 </span><br/>')
        .replace(/ *<br\/>\s*([D-G])\.{0,1}\s(((?!(<br\/>|@@@BR@@@)).)*)\s*@@@BR@@@/g, ' <br/> <span class="AnswerOption">$1 </span><span class="AnswerText"> $2 </span><br/>')
        .replace('BoxClozeSentences">A. ', 'BoxClozeSentences"><span class="AnswerOption">A </span>' )
        .replace(/\ssrc="/g, '  class="questionImage" src="/assets/')
        .replace(reImage1, '<img src="/assets/figures/' + mmfid + '_1.jpg" class="questionImage" />')
        .replace('<a href="show_image.html?name=', '<a href="/assets/')
        .replace('target="ReadingText"', 'target="_blank"')
        .replace('style="color: blue"', '')
        .replace('</p><br/>', '</p>')
        .replace(/^ *<p>/, '')

    if (rawHtml.indexOf('Some sentences have been taken out of the reading text') >= 0)
        rawHtml = rawHtml
            .replace(/ @@@BR@@@ ([A-Z])\.{0,1}\s(((?!(<br\/>|@@@BR@@@)).)*)\s@@@BR@@@/g, ' @@@BR@@@ <span class="AnswerOption">$1 </span> $2 @@@BR@@@')
            .replace(/ @@@BR@@@ ([A-Z])\.{0,1}\s(((?!(<br\/>|@@@BR@@@)).)*)\s@@@BR@@@/g, ' @@@BR@@@ <span class="AnswerOption">$1 </span> $2 @@@BR@@@')
            .replace('Some sentences have been taken out of the reading text. Your task is to identify where these sentences will go back into the text.', 'Some sentences have been removed from the text. Choose from the sentences (A, B, C, …) the one which fits each gap. There is one extra sentence which you do not need to use.')
    
    // if (rawHtml.indexOf('sentences have been removed from the text.') >= 0)
    //     rawHtml = rawHtml.split('</h2><hr/>')[1].split('<hr/><h3><em><strong>')[0]
    // if (rawHtml.indexOf('Read the following four extracts') >= 0)
    //     rawHtml = rawHtml.split('</strong></span></h2><hr/>')[1]

    rawHtml = rawHtml.replace(/@@@BR@@@/g, '<br/>')

    if (imageId > 0) {
        rawHtml = '<img src="/assets/articles/bigfish/' + imageId + '.jpg" />' + rawHtml;
    }

    return rawHtml
}

export function PrintQuestion(props: { question: any, n: number }) {
    let q = props.question
    let html = q.html.replace(/<br\/> This set has \d+ questions. <b>.*answer all questions. <\/b> <br\/> *<br\/>/, '')
    if (q.preText) {
        if (["101","2"].includes(q.mmfgroup)) {
            q.preText = '<i>Read the text below then answer the questions.</i><p/>'
                + FormatQuestionText(q.preText, 0, 0)
                + '<p/>For questions below, choose the answer (<b>A</b>, <b>B</b>, <b>C</b> or <b>D</b>) which you think best answers the question.'
        } else
        if (["110"].includes(q.mmfgroup)) {
            q.preText = FormatQuestionText(q.preText, 0, 0)
        } else
        if (["109"].includes(q.mmfgroup)) {
            q.preText = FormatQuestionText(q.preText, 0, 0)
        }
    }

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
                {q.mmfgroup !== "110" && <span className="QuestionNumber">{q.pos + 1}</span>}
                <span className="QuestionText" dangerouslySetInnerHTML={{ __html: html }} />
            </div>}
        {q.postText  &&
            <div className="Question109" key={"pagex_" + props.n} dangerouslySetInnerHTML={{ __html: q.postText }}>
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
    return 'english'
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

                                if (newQs[i].mmfgroup === "109" && i > 0 && newQs[i-1].mmfgroup !== "109") {
                                    newQs[i].preText = "<i>Read the four extracts below.</i><p/>For below questions, choose the option (<b>A</b>, <b>B</b>, <b>C</b> or <b>D</b>) which you think best answers the question.<p/>Which extract…"
                                }

                                if (newQs[i].mmfgroup === "109" && (i === (newQs.length - 1) || newQs[i+1].mmfgroup !== "109")) {
                                    newQs[i].postText = newQs[i].preText
                                    newQs[i].preText = null
                                }
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