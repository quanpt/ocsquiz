CREATE INDEX "idxQuestionTitle" ON "Questions" (
	"title"	ASC
)
CREATE UNIQUE INDEX "idxQuestionsId" ON "Questions" (
	"id",
	"mmfid"
)

CREATE UNIQUE INDEX "idxTitleCat" ON "TitleCat" (
	"fullTitle"	ASC
)
CREATE TABLE "Questions" (
	"id"	INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT UNIQUE,
	"mmfid"	INTEGER,
	"question"	TEXT,
	"answer"	TEXT,
	"qgroup"	TEXT,
	"mmfgroup"	TEXT,
	"title"	TEXT
)
CREATE TABLE sqlite_sequence(name,seq)
CREATE TABLE "Quizes" (
	"id"	INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT UNIQUE,
	"title"	TEXT NOT NULL,
	"timestamp"	INTEGER NOT NULL
)
CREATE TABLE "Answers" (
	"id"	INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT UNIQUE,
	"quizId"	INTEGER NOT NULL,
	"questionId"	INTEGER NOT NULL,
	"answer"	TEXT,
	"timestamp"	INTEGER,
	FOREIGN KEY("quizId") REFERENCES "Quizes"("id") ON UPDATE CASCADE ON DELETE CASCADE,
	FOREIGN KEY("questionId") REFERENCES "Questions"("id") ON UPDATE CASCADE
)
CREATE TABLE "TitleCat" (
	"fullTitle"	TEXT NOT NULL UNIQUE,
	"index"	TEXT,
	"subject"	TEXT NOT NULL,
	"year"	TEXT,
	"topic"	TEXT,
	"subTopic"	TEXT,
	"subSubTopic"	TEXT,
	PRIMARY KEY("fullTitle")
)
CREATE TABLE "Images" (
	"id"	INTEGER
)
CREATE VIEW "TitleView" AS select "id", "mmfid", "question", "answer", "qgroup", "mmfgroup", replace(replace(ltrim(substr(title, instr(title, ' - ') + 1), ' -'), ' result', ''), ',', '') as title from "Questions"
CREATE VIEW "Grade" AS SELECT DISTINCT title, shortTitle, substr(strRemoveYear, 0, instr(strRemoveYear, ' ')) AS grade
FROM (SELECT *, replace(substr(strRemoveGrade, instr(strRemoveGrade, ' Year ')), ' Year ', '') as strRemoveYear
FROM (SELECT *, replace(substr(shortTitle, instr(shortTitle, ' Grade ')), ' Grade ', '') as strRemoveGrade
FROM (SELECT *, replace(replace(ltrim(substr(title, instr(title, ' - ') + 1), ' -'), ' result', ''), ',', '') AS shortTitle FROM "Questions")))
CREATE VIEW "FullAnswers" AS SELECT a.*, q.mmfid, q.question, q.answer AS providedAnswer, q.title FROM Answers a LEFT JOIN Questions q ON a.questionId = q.id
CREATE VIEW "FullQuizes" AS SELECT q.id, q.title, q.timestamp,
COUNT(questionId) AS questionCount,
SUM(CASE WHEN answer IS NULL THEN 0 ELSE 1 END) AS answerCount, 
SUM(CASE WHEN UPPER(answer) == UPPER(providedAnswer) THEN 1 ELSE 0 END) AS correctAnswerCount 
FROM FullAnswers a LEFT JOIN Quizes q ON a.quizId = q.id GROUP BY q.id
UNION ALL
SELECT * FROM (
SELECT q.id, q.title, q.timestamp,
NULL AS questionCount,
SUM(CASE WHEN answer IS NULL THEN 0 ELSE 1 END) AS answerCount,
NULL AS correctAnswerCount 
FROM Quizes q LEFT JOIN FullAnswers a ON a.quizId = q.id
GROUP BY q.id)
WHERE AnswerCount = 0
CREATE VIEW "FullQuestions" AS SELECT q.*, i.id AS imageId FROM Questions q LEFT JOIN TitleCat t ON q.title = t.fullTitle LEFT JOIN Images i ON q.mmfid = i.id