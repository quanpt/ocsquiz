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
CREATE VIEW "FullAnswers" AS SELECT a.*, q.mmfid, q.question, q.questionAnswer, q.title FROM Answers a LEFT JOIN Questions q ON a.questionId = q.id
CREATE VIEW "FullQuizes" AS SELECT q.id, q.title, q.timestamp,
COUNT(questionId) AS questionCount,
SUM(CASE WHEN userAnswer IS NULL THEN 0 ELSE 1 END) AS answerCount, 
SUM(CASE WHEN UPPER(userAnswer) == UPPER(questionAnswer) THEN 1 ELSE 0 END) AS correctAnswerCount 
FROM FullAnswers a LEFT JOIN Quizes q ON a.quizId = q.id GROUP BY q.id
UNION ALL
SELECT * FROM (
SELECT q.id, q.title, q.timestamp,
NULL AS questionCount,
SUM(CASE WHEN userAnswer IS NULL THEN 0 ELSE 1 END) AS answerCount,
NULL AS correctAnswerCount 
FROM Quizes q LEFT JOIN FullAnswers a ON a.quizId = q.id
GROUP BY q.id)
WHERE AnswerCount = 0
CREATE VIEW "FullQuestions" AS SELECT q.*, i.id AS imageId FROM Questions q LEFT JOIN TitleCat t ON q.title = t.fullTitle LEFT JOIN Images i ON q.mmfid = i.id
CREATE VIEW "TitleView" AS SELECT t1.*, t2.questionCount 
FROM 
	(SELECT tc.fullTitle, tc.year, tc.subject, count(DISTINCT fa.questionId) AS correctAnswerCount 
	FROM TitleCat tc LEFT JOIN FullAnswers fa
	ON tc.fullTitle = fa.title AND upper(fa.userAnswer) = upper(fa.questionAnswer)
	GROUP BY tc.fullTitle) t1 
		JOIN
	(SELECT DISTINCT tc.fullTitle, count(q.id) AS questionCount FROM TitleCat tc LEFT JOIN Questions q
	ON tc.fullTitle = q.title
	GROUP BY tc.fullTitle) t2 
		ON t1.fullTitle = t2.fullTitle