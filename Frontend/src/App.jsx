import { useHashLocation } from './router'
import { useAuth } from './auth/AuthContext'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import { Loader } from './components/UI'
import Home from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register'
import Profile from './pages/Profile'
import Courses from './pages/courses/Courses'
import Learn from './pages/learn/Learn'
import Challenges from './pages/challenges/Challenges'
import CodeLab from './pages/code/CodeLab'
import SkillsPage from './pages/skills/Skills'
import Notifications from './pages/notifications/Notifications'
import Messages from './pages/Messages/Messages'
import InternJobs from './pages/internships/InternJobs'
import Community from './pages/community/Community'
import Projects from './pages/Projects'
import ProjectDetail from './pages/ProjectDetail'
import Exams from './pages/Exams'
import ExamDetail from './pages/ExamDetail'
import TakeExam from './pages/TakeExam'
import Results from './pages/Results'
import ResultDetail from './pages/ResultDetail'
import Jobs from './pages/Jobs'
import JobDetail from './pages/JobDetail'
import ApplyJob from './pages/ApplyJob'
import Applications from './pages/Applications'
import MyEnrollments from './pages/MyEnrollments'
import MyHallTickets from './pages/MyHallTickets'
import News from './pages/News'
import Portfolio from './pages/Portfolio'
import Leaderboard from './pages/Leaderboard'
import Achievements from './pages/Achievements'
import NotFound from './pages/NotFound'
import AdminDashboard from './pages/admin/AdminDashboard'
import AdminExams from './pages/admin/AdminExams'
import AdminQuestions from './pages/admin/AdminQuestions'
import AdminJobs from './pages/admin/AdminJobs'
import AdminApplications from './pages/admin/AdminApplications'
import AdminNews from './pages/admin/AdminNews'
import AdminResults from './pages/admin/AdminResults'
import AdminEnrollments from './pages/admin/AdminEnrollments'
import AdminCenters from './pages/admin/AdminCenters'
import AdminHallTickets from './pages/admin/AdminHallTickets'
import AdminPapers from './pages/admin/AdminPapers'
import AdminGrading from './pages/admin/AdminGrading'
import AdminAdmins from './pages/admin/AdminAdmins'

function App() {
  const { loading } = useAuth()
  const path = useHashLocation()
  const segs = path.split('/').filter(Boolean)

  if (loading) {
    return (
      <div className="app-layout">
        <Navbar />
        <main className="page-container">
          <Loader />
        </main>
        <Footer />
      </div>
    )
  }

  let view
  const a = segs[0]
  const b = segs[1]
  const c = segs[2]
  const id = b

  if (segs.length === 0) view = <Home />
  else if (a === 'home') view = <Home />
  else if (a === 'login') view = <Login />
  else if (a === 'register') view = <Register />
  else if (a === 'profile') view = <Profile />
  else if (a === 'exams') {
    if (!b) view = <Exams />
    else if (c === 'take') view = <TakeExam id={b} />
    else view = <ExamDetail id={b} />
  } else if (a === 'results') {
    if (!b) view = <Results />
    else view = <ResultDetail id={b} />
  } else if (a === 'jobs') {
    if (!b) view = <Jobs />
    else if (c === 'apply') view = <ApplyJob id={b} />
    else view = <JobDetail id={b} />
  } else if (a === 'applications') view = <Applications />
  else if (a === 'enrollments') view = <MyEnrollments />
  else if (a === 'hall-tickets') view = <MyHallTickets />
  else if (a === 'courses') view = <Courses />
  else if (a === 'learn') view = <Learn />
  else if (a === 'challenges') view = <Challenges />
  else if (a === 'code') view = <CodeLab />
  else if (a === 'skills') view = <SkillsPage />
  else if (a === 'notifications') view = <Notifications />
  else if (a === 'messages') view = id ? <Messages /> : <Messages />
  else if (a === 'internships') view = id ? <InternJobs /> : <InternJobs />
  else if (a === 'community') view = <Community />
  else if (a === 'projects') {
    if (!b) view = <Projects />
    else view = <ProjectDetail slug={b} />
  }
  else if (a === 'leaderboard') view = <Leaderboard />
  else if (a === 'achievements') view = <Achievements />
  else if (a === 'portfolio') view = <Portfolio />
  else if (a === 'news') view = <News />
  else if (a === 'admin') {
    if (!b) view = <AdminDashboard />
    else if (b === 'exams') view = segs[3] === 'questions' ? <AdminQuestions id={c} /> : <AdminExams />
    else if (b === 'jobs') view = <AdminJobs />
    else if (b === 'applications') view = <AdminApplications />
    else if (b === 'news') view = <AdminNews />
    else if (b === 'results') view = <AdminResults />
    else if (b === 'enrollments') view = <AdminEnrollments />
    else if (b === 'centers') view = <AdminCenters />
    else if (b === 'hall-tickets') view = <AdminHallTickets />
    else if (b === 'papers') view = <AdminPapers />
    else if (b === 'grading') view = <AdminGrading />
    else if (b === 'admins') view = <AdminAdmins />
    else view = <NotFound />
  } else view = <NotFound />

  return (
    <div className="app-layout">
      <Navbar />
      <main className="container page-container">{view}</main>
      <Footer />
    </div>
  )
}

export default App
