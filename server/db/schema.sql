BEGIN TRANSACTION;
DROP TABLE IF EXISTS "Images";
CREATE TABLE IF NOT EXISTS "Images" (
	"id"	INTEGER
);
DROP TABLE IF EXISTS "processedTitle";
CREATE TABLE IF NOT EXISTS "processedTitle" (
	"fullTitle"	TEXT,
	"index"	INTEGER,
	"subject"	TEXT,
	"year"	TEXT,
	"topic"	TEXT,
	"subTopic"	TEXT,
	"subSubTopic"	TEXT
);
DROP TABLE IF EXISTS "Answers";
CREATE TABLE IF NOT EXISTS "Answers" (
	"id"	INTEGER NOT NULL UNIQUE,
	"quizId"	INTEGER NOT NULL,
	"questionId"	INTEGER NOT NULL,
	"userAnswer"	TEXT,
	"timestamp"	INTEGER,
	"isReviewed"	INTEGER,
	PRIMARY KEY("id" AUTOINCREMENT),
	FOREIGN KEY("questionId") REFERENCES "Questions"("id") ON UPDATE CASCADE,
	FOREIGN KEY("quizId") REFERENCES "Quizes"("id") ON UPDATE CASCADE ON DELETE CASCADE
);
DROP TABLE IF EXISTS "TitleCat";
CREATE TABLE IF NOT EXISTS "TitleCat" (
	"id"	INTEGER NOT NULL UNIQUE,
	"title"	TEXT,
	"index"	TEXT,
	"subject"	TEXT NOT NULL,
	"year"	TEXT,
	"topic"	TEXT,
	"subTopic"	TEXT,
	"subSubTopic"	TEXT,
	PRIMARY KEY("id" AUTOINCREMENT)
);
DROP TABLE IF EXISTS "Quizes";
CREATE TABLE IF NOT EXISTS "Quizes" (
	"id"	INTEGER NOT NULL UNIQUE,
	"titleId"	INTEGER,
	"timestamp"	INTEGER NOT NULL,
	"lastUpdate"	INTEGER,
	PRIMARY KEY("id" AUTOINCREMENT)
);
DROP TABLE IF EXISTS "QuizImages";
CREATE TABLE IF NOT EXISTS "QuizImages" (
	"titleId"	INTEGER NOT NULL,
	"imageURL"	TEXT NOT NULL,
	"questionCount"	INTEGER,
	"questionStart"	INTEGER,
	"position"	INTEGER DEFAULT 0
);
DROP TABLE IF EXISTS "Questions";
CREATE TABLE IF NOT EXISTS "Questions" (
	"id"	INTEGER NOT NULL UNIQUE,
	"mmfid"	INTEGER,
	"question"	TEXT,
	"questionAnswer"	TEXT,
	"qgroup"	TEXT,
	"mmfgroup"	TEXT,
	"preText"	TEXT,
	"comment"	TEXT,
	"rid"	INTEGER,
	"displayOrder"	INTEGER,
	PRIMARY KEY("id" AUTOINCREMENT)
);
DROP TABLE IF EXISTS "TitleQuestion";
CREATE TABLE IF NOT EXISTS "TitleQuestion" (
	"titleId"	INTEGER NOT NULL,
	"questionId"	INTEGER NOT NULL,
	PRIMARY KEY("titleId","questionId")
);
DROP INDEX IF EXISTS "idxTitleCat";
CREATE UNIQUE INDEX IF NOT EXISTS "idxTitleCat" ON "TitleCat" (
	"title"	ASC
);
DROP INDEX IF EXISTS "idxQuestionTitle";
CREATE INDEX IF NOT EXISTS "idxQuestionTitle" ON "Questions" (
	"titleId"	ASC
);
DROP INDEX IF EXISTS "idxQuestionsId";
CREATE UNIQUE INDEX IF NOT EXISTS "idxQuestionsId" ON "Questions" (
	"id",
	"mmfid"
);
DROP VIEW IF EXISTS "FullQuestions";
CREATE VIEW "FullQuestions" AS SELECT q.*, tc.title, i.id AS imageId , tc.id AS titleId
FROM Questions q JOIN TitleQuestion tq ON q.id = tq.questionId 
JOIN TitleCat tc ON tq.titleId = tc.id
LEFT JOIN Images i ON q.mmfid = i.id;
DROP VIEW IF EXISTS "FullQuizes";
CREATE VIEW "FullQuizes" AS 
SELECT q.id, tc.title, q.timestamp, q.lastUpdate,
COUNT(questionId) AS questionCount,
SUM(CASE WHEN userAnswer IS NULL or UPPER(userAnswer) == 'X' THEN 0 ELSE 1 END) AS answerCount, 
SUM(CASE WHEN UPPER(userAnswer) == UPPER(questionAnswer) THEN 1 ELSE 0 END) AS correctAnswerCount 
FROM FullAnswers a LEFT JOIN Quizes q ON a.quizId = q.id 
     JOIN TitleCat tc ON q.titleId = tc.id 
GROUP BY q.id
UNION ALL
SELECT * FROM (
SELECT q.id, tc.title, q.timestamp, q.lastUpdate,
NULL AS questionCount,
SUM(CASE WHEN userAnswer IS NULL or UPPER(userAnswer) == 'X' THEN 0 ELSE 1 END) AS answerCount,
NULL AS correctAnswerCount 
FROM Quizes q LEFT JOIN FullAnswers a ON a.quizId = q.id
     JOIN TitleCat tc ON q.titleId = tc.id
GROUP BY q.id)
WHERE AnswerCount = 0;
DROP VIEW IF EXISTS "TitleView";
CREATE VIEW "TitleView" AS 
SELECT t1.*, t2.questionCount 
FROM 
    (SELECT tc.id, tc.title as fullTitle, tc.year, tc.subject, count(DISTINCT fa.questionId) AS correctAnswerCount 
    FROM TitleCat tc LEFT JOIN FullAnswers fa
    ON tc.id = fa.titleId AND upper(fa.userAnswer) = upper(fa.questionAnswer)
    GROUP BY tc.title) t1 
        JOIN
    (SELECT DISTINCT tc.id, tc.title as fullTitle, count(q.id) AS questionCount 
    FROM TitleCat tc JOIN TitleQuestion tq ON tc.id = tq.titleId
        LEFT JOIN Questions q ON tq.questionId = q.id
    GROUP BY tc.title) t2 
        ON t1.fullTitle = t2.fullTitle;
DROP VIEW IF EXISTS "ErrorQuestionGroupView";
CREATE VIEW "ErrorQuestionGroupView" AS SELECT quizId, qgroup, mmfgroup, COUNT(qgroup) AS groupCount
FROM Answers a LEFT JOIN Questions q ON a.questionId = q.id
WHERE UPPER(a.userAnswer) <> UPPER(q.questionAnswer)
GROUP BY quizId, qgroup, mmfgroup;
DROP VIEW IF EXISTS "FullAnswers";
CREATE VIEW "FullAnswers" AS 
SELECT a.*, qz.titleId, q.mmfid, q.question, q.questionAnswer, q.comment, i.id AS imageId 
FROM Answers a LEFT JOIN Questions q ON a.questionId = q.id
     JOIN Quizes qz ON qz.id = a.quizId
LEFT JOIN Images i ON q.mmfid = i.id;
COMMIT;
