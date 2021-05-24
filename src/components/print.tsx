import { useEffect, useState } from 'react'
import { toJSON } from 'cssjson';
import useScript from '../hooks/useScript';

// interfaces
export interface QuizI {
    year: string;
    subject: string;
    title: string;
}

function CSStoJSON(css: string) {
    return toJSON(css).attributes
}

function PrintCoverPage() {
    return <div className="stl_ stl_02" key="page01">
        <div w3-include-html="/assets/html/page01.html" />
    </div>
}

function PrintBlankPage(props: { page: number }) {
    return <div className="stl_ stl_02" key="page02">
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

function PrintQuestionSets(props: { questionSets: any }) {
    return <>
        {props.questionSets.map((pair: any, index: number) => {
            return <PrintQuestionPage pair={pair} index={index} key={"set_" + index} />
        })}
    </>
}

function PrintQuestionPage(props: { pair: any, index: number }) {
    if (props.pair.length === 0)
        return null
    return <>
        {props.pair[0].articleImageURL && 
        <div className="stl_ stl_02" key={"pagex_" + props.index}>
            <div className="stl_view">
                <span className="HeadSpace">&nbsp;</span>
                <div className="stl_05">
                    <span className="QuestionText">
                        <img src={props.pair[0].articleImageURL} className="fulltextImage"/>
                    </span>
                </div>
            </div>
        </div>}
        <div className="stl_ stl_02" key={"page_" + props.index}>
            <div className="stl_view">
                <span className="HeadSpace">&nbsp;</span>
                {
                    [...new Array(props.pair.length)].map((_, i) => i).map((i) => {
                        return <PrintQuestion question={props.pair[i]} n={i} key={props.pair[i].id} />
                    })
                }
                <div className="stl_01" style={CSStoJSON("left:24.5309em;top:66.0238em;")}>
                    <span className="stl_24 stl_08 stl_11">{props.index + 3}</span>
                </div>
            </div>
        </div>
    </>
}

let reImage1 = new RegExp(/\$image1\$/g);

export function FormatQuestionText(text: string, mmfid: number, imageId: number) {
    var rawHtml = text
    rawHtml = rawHtml.replace(/\r?\n|\r/g, '')
        .replace(/^.*\s*<hr\s*size="1"\/>/gi, '')
        .replace('<br/> <br/> <br/></div>', '</div>')
        .replace(/<br\/> <br\/>/g, '@@@BR@@@')
        .replace(/ @@@BR@@@ A\.{0,1}\s(((?!(<br\/>|@@@BR@@@)).)*)\s<br\/>/g, ' <br/> <span class="stl_07 stl_08 stl_11" style="word-spacing:0.775em;">A </span> $1 <br/>')
        .replace(/ <br\/>\s([B-G])\.{0,1}\s(((?!(<br\/>|@@@BR@@@)).)*)\s<br\/>/g, ' <br/> <span class="stl_07 stl_08 stl_11" style="word-spacing:0.775em;">$1 </span> $2 <br/>')
        .replace(/ <br\/>\s([B-G])\.{0,1}\s(((?!(<br\/>|@@@BR@@@)).)*)\s<br\/>/g, ' <br/> <span class="stl_07 stl_08 stl_11" style="word-spacing:0.775em;">$1 </span> $2 <br/>')
        .replace(/ <br\/>\s([B-G])\.{0,1}\s(((?!(<br\/>|@@@BR@@@)).)*)\s<br\/>/g, ' <br/> <span class="stl_07 stl_08 stl_11" style="word-spacing:0.775em;">$1 </span> $2 <br/>')
        .replace(/ <br\/>\s([B-G])\.{0,1}\s(((?!(<br\/>|@@@BR@@@)).)*)\s<br\/>/g, ' <br/> <span class="stl_07 stl_08 stl_11" style="word-spacing:0.775em;">$1 </span> $2 <br/>')
        .replace(/ <br\/>\s([B-G])\.{0,1}\s(((?!(<br\/>|@@@BR@@@)).)*)\s<br\/>/g, ' <br/> <span class="stl_07 stl_08 stl_11" style="word-spacing:0.775em;">$1 </span> $2 <br/>')
        .replace(/@@@BR@@@/g, '<br/>')
        .replace(/\ssrc="/g, '  class="questionImage" src="/assets/')
        .replace(reImage1, '<img src="/assets/figures/' + mmfid + '_1.jpg" class="questionImage" />')
        .replace('<a href="show_image.html?name=', '<a href="/assets/')
        .replace('target="ReadingText"', 'target="_blank"')
    if (imageId > 0) {
        rawHtml = '<img src="/assets/articles/bigfish/' + imageId + '.jpg" />' + rawHtml;
    }

    return rawHtml
}

export function PrintQuestion(props: { question: any, n: number }) {
    let q = props.question
    return <div className="stl_05" key={q.id}>
        <span className="QuestionNumber">{q.pos + 1}</span>
        <span className="QuestionText" dangerouslySetInnerHTML={{ __html: q.html}} />
        {props.n === 0 && <span className="AnswerOption">&nbsp; </span>}
    </div>
}

export function PrintableQuiz(props: QuizI) {
    // Prepare states
    // const [year, setYear] = useState(props.year)
    // const [subject, setSubject] = useState(props.subject)
    const [title] = useState(props.title)
    const [questionSets, setQuestionSets] = useState([[]])
    // const [images, setImages] = useState([])

    useEffect(() => {
        document.title = title
        document.body.style.backgroundColor = "white"

        fetch("/data/questions/get", {
            method: 'POST',
            headers: { 'Content-Type': 'application/json; charset=UTF-8' },
            body: JSON.stringify({ title: title })
        })
            .then(res => res.json())
            .then(
                (questions) => {
                    var newQs = questions.map((q: any, i: number) => {q.pos = i; return q})

                    // grouping questions with the same full text
                    var lastArticle = ""
                    for (var i = 0; i < newQs.length; i++) {
                        var q = newQs[i]
                        let html = FormatQuestionText(q.question, q.mmfid, q.imageId ? q.imageId : 0)
                        if (html.match(/^\s*Refer to the (poem|article):* (<br\/> <img|<a) /))
                            html = html.replace(/ class="questionImage"/g, '')
                        
                        var matches = html.match(/^\s*Refer to the article:* <a href="([^"]*)" /)
                        if (matches) {
                            if (matches[1] !== lastArticle) {
                                // new article
                                q.articleImageURL = matches[1]
                                lastArticle = matches[1]
                            } else {
                                // existing article
                            }
                            html = html.replace(/^\s*Refer to the article:* <a href="([^"]*)" .* <img border="0" +src="\/assets\/images\/reading\.gif" width="48"\/> <\/a> <br\/>/, '')
                        }
                        newQs[i].html = html
                    }
                    console.log(newQs);
                    

                    // grouping questions into sets for each pages
                    var newQuestionSets = [];
                    for (i = 0; i < newQs.length; i += 1) {
                        var size = 1;
                        if (i+size < newQs.length) {
                            var imageCount = 0
                            var tags = "<img ,$image1$".split(',')
                            var j
                            for (j=0; j<3; j++) {
                                if (i+j < newQs.length) {
                                    for (let index = 0; index < tags.length; index++) {
                                        let pattern = tags[index]
                                        imageCount += (newQs[i+j].html.split(pattern).length - 1) * 2
                                    }
                                    imageCount += newQs[i+j].imageId ? 2 : 0
                                    imageCount += (j > 0 && newQs[i+j].articleImageURL) ? 20 : 0
                                    console.log('__' + i + '_' + j + '_' + imageCount);
                                    
                                    if (imageCount + j > 3) break
                                }
                            }
                            size = j > size ? j : size
                        }
                        newQuestionSets.push(newQs.slice(i, size + i));
                        console.log(newQuestionSets);
                        i += size - 1
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
            <PrintBlankPage page={questionSets.length + 3} />
        </>
    )
}