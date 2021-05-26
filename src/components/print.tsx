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

function PrintCoverPage(props: {title: string}) {
    return <div className="stl_ stl_02" key="page01">
        <div w3-include-html={"/html/header" + getTestType(props.title) + ".html"} />
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
        <div className="stl_ stl_02_online" key={"pagex_" + props.index}>
            <div className="stl_view">
                <div className="stl_05">
                    <span className="QuestionText">
                        <img alt={props.pair[0].articleImageURL} src={props.pair[0].articleImageURL} className="fulltextImage"/>
                    </span>
                </div>
                <div className="stl_01" style={CSStoJSON("left:24.5309em;top:66.0238em;")}>
                    <span className="stl_24 stl_08 stl_11">{props.index + 3}{props.pair[0].articleImageURL ? ' (image)' : ''}</span>
                </div>
            </div>
        </div>}
        {props.pair[0].imageURL && 
        <div className="stl_ stl_02_online" key={"pagex_" + props.index}>
            <div className="stl_view">
                <div className="stl_05">
                    <span className="QuestionText">
                        <img alt={props.pair[0].imageURL} src={"/assets/articles/" + props.pair[0].imageURL} className="fulltextImage"/>
                    </span>
                </div>
                <div className="stl_01" style={CSStoJSON("left:24.5309em;top:66.0238em;")}>
                    <span className="stl_24 stl_08 stl_11">{props.index + 3}{props.pair[0].imageURL ? ' (image)' : ''}</span>
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
                    <span className="stl_24 stl_08 stl_11">{props.index + 3}{props.pair[0].articleImageURL ? ' (continued)' : ''}</span>
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
        .replace(/ <br\/>\s([A-G])\.{0,1}\s(((?!(<br\/>|@@@BR@@@)).)*)\s<br\/>/g, ' <br/> <span class="stl_07 stl_08 stl_11" style="word-spacing:0.775em;">$1 </span> $2 <br/>')
        .replace(/ <br\/>\s([B-G])\.{0,1}\s(((?!(<br\/>|@@@BR@@@)).)*)\s<br\/>/g, ' <br/> <span class="stl_07 stl_08 stl_11" style="word-spacing:0.775em;">$1 </span> $2 <br/>')
        .replace(/ <br\/>\s([C-G])\.{0,1}\s(((?!(<br\/>|@@@BR@@@)).)*)\s<br\/>/g, ' <br/> <span class="stl_07 stl_08 stl_11" style="word-spacing:0.775em;">$1 </span> $2 <br/>')
        .replace(/ <br\/>\s([D-G])\.{0,1}\s(((?!(<br\/>|@@@BR@@@)).)*)\s<br\/>/g, ' <br/> <span class="stl_07 stl_08 stl_11" style="word-spacing:0.775em;">$1 </span> $2 <br/>')
        .replace(/ <br\/>\s([E-G])\.{0,1}\s(((?!(<br\/>|@@@BR@@@)).)*)\s<br\/>/g, ' <br/> <span class="stl_07 stl_08 stl_11" style="word-spacing:0.775em;">$1 </span> $2 <br/>')
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

function getTestType(title: string) {
    var lowerTitle = title.toLowerCase()
    var types = 'english,thinking,math'.split(',')
    for (var i=0; i < types.length; i++) {
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
    const [questionSets, setQuestionSets] = useState([[]])
    const [images, setImages] = useState([])
    // const [startQuestion, setStartQuestion] = useState([])

    useEffect(() => {
        document.title = title
        document.body.style.backgroundColor = "white"

        fetch("/data/quiz/images/get", {
            method: 'POST',
            headers: { 'Content-Type': 'application/json; charset=UTF-8' },
            body: JSON.stringify({title: title})
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
                            var newQs = questions.map((q: any, i: number) => {q.pos = i; return q})
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

                            // grouping questions into sets for each pages
                            var newQuestionSets = [];
                            for (i = 0; i < newQs.length; i += 1) {
                                var size = 1;
                                if (i+size < newQs.length) {
                                    var lineCount = 0
                                    var tags = "<img ,$image1$".split(',')
                                    var j
                                    for (j=0; j<7; j++) {
                                        if (i+j < newQs.length) {
                                            for (let index = 0; index < tags.length; index++) {
                                                let pattern = tags[index]
                                                // each image adds 8 lines
                                                lineCount += (newQs[i+j].html.split(pattern).length - 1) * 8
                                            }
                                            // each image adds 8 lines
                                            lineCount += newQs[i+j].imageId ? 8 : 0

                                            // full text image add maximum
                                            lineCount += (j > 0 && newQs[i+j].articleImageURL) ? 100 : 0

                                            // starting question add maximum
                                            lineCount += (j > 0 && newQs[i+j].imageURL) ? 100 : 0

                                            // each line length adds a bit
                                            lineCount += newQs[i+j].html.split('<br/>').reduce(
                                                (accumulator: number, currentValue: string) => 
                                                accumulator + Math.ceil(
                                                    currentValue.replace('<span class="stl_07 stl_08 stl_11" style="word-spacing:0.775em;">', '').length / 75)
                                                , 0) + 1

                                            console.log('__' + i + '_' + j + '_' + lineCount);
                                            
                                            if (lineCount >= 33) break
                                        }
                                    }
                                    size = j > size ? j + (lineCount >= 33 ? 0 : 1) : size
                                }
                                newQuestionSets.push(newQs.slice(i, size + i));
                                i += size - 1
                            }
                            setQuestionSets(newQuestionSets)
                        }
                    )
            })
    }, [title])

    useScript('/assets/html/includeHTML.js');

    return (
        <>
            <PrintCoverPage title={title}/>
            <PrintBlankPage page={2} />
            <PrintQuestionSets questionSets={questionSets} />
            <PrintBlankPage page={questionSets.length + 3} />
        </>
    )
}