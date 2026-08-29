# UniSphere Exam & Jobs Selection Platform

UniSphere Exam and Jobs Selection Platform built by UniSphere. Provides competitive exam management, enrollment, hall tickets, online test taking, question papers with official answer keys, answer sheet verification with manual marking, job listings, applications, news, and role based admin workspaces.

## Staff Roles

| Role | Email (seed) | Responsibilities |
| --- | --- | --- |
| Super Admin | superadmin@unisphere.com | Everything, plus creating and managing admin accounts |
| Administrator | admin@unisphere.com | Full operations access except admin account management |
| Exam Officer | exam@unisphere.com | Exams, exam centers, enrollment review and confirmation |
| Hall Ticket Officer | hallticket@unisphere.com | Hall ticket generation, reprinting and issuing for confirmed enrollments |
| Question Setter | question_admin | Question banks, question papers, official answer key upload and publication |
| Answer Evaluator | grader@unisphere.com | Answer sheet verification, descriptive marking and result publication |

All seeded staff accounts use the password UniSphere@123.

## Selection Workflow

1. Candidate registers and enrolls for an exam and receives a registration number.
2. Exam Officer confirms the enrollment, assigns an exam center and records fee payment.
3. Hall Ticket Officer generates the hall ticket with roll number, venue and reporting time.
4. Candidate takes the exam online; MCQs are auto scored and descriptive answers are stored.
5. Answer Evaluator verifies the sheet against the official answer key, awards descriptive marks and publishes the final result with pass or fail status.
6. Question Setter manages question papers and publishes official answer keys after the exam.

## Learning Platform (Courses and Quizzes)

Course content lives in YAML files under `content/courses/`. Each file defines a course with modules, lessons and module quizzes. The server validates, caches and hot-reloads the catalog on file change, so a new course file appears without a restart.

- `GET /api/v1/courses` public catalog with search, category and level filters plus pagination.
- `GET /api/v1/courses/:slug` full course detail with modules, lessons and starter code.
- `POST /api/v1/courses/:slug/lessons/:lessonId/complete` records progress and awards learning points (+5 per lesson, +50 on completion).
- `GET /api/v1/courses/my/progress` lists the signed-in learner's progress.
- `GET /api/v1/quizzes/course/:slug` module quizzes for a course; correct answers are never exposed.
- `POST /api/v1/quizzes/:id/attempt` submits and auto-grades an attempt; retakes are allowed and the best score counts. Points equal half the improvement over your previous best score.
- `GET /api/v1/quizzes/:id/attempts/mine` attempt history.

Learning points accumulate on the user and will power the leaderboard and learner directory.

## Development

Backend: npm run seed, npm start (port 3000). Frontend: cd Frontend && npm run dev (port 5173 with /api proxy). Tests: npm test.
