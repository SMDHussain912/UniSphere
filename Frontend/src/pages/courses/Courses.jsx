import { useEffect, useState } from 'react'
import { api } from '../../api'
import { Loader, EmptyState, Badge, formatDate } from '../../components/UI'

export default function Courses() {
  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api
      .get('/courses')
      .then((res) => setCourses(res.data.courses || []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <Loader />

  return (
    <div>
      <h2 className="heading">Learning Paths</h2>
      <p className="sub">Structured courses to master in-demand technologies.</p>
      {courses.length === 0 ? (
        <EmptyState text="No courses available yet. Check back soon!" />
      ) : (
        <div className="grid">
          {courses.map((c) => (
            <CourseCard key={c._id} course={c} />
          ))}
        </div>
      )}
    </div>
  )
}

function CourseCard({ course }) {
  const progress = course.progress || 0
  return (
    <a href={`#/learn/${course.slug}`} className="card card-hover">
      <div className="card-header">
        <h3 className="card-title">{course.title}</h3>
        <Badge kind="info">{course.category}</Badge>
      </div>
      <p className="card-text">{course.description?.slice(0, 120)}...</p>
      <div className="mt">
        <div className="progress-bar">
          <div className="progress-fill" style={{ width: `${progress}%` }} />
        </div>
        <div className="row-between mt-sm">
          <span className="muted small">{progress}% complete</span>
          <span className="muted small">{course.duration} • {course.level}</span>
        </div>
      </div>
      <div className="mt">
        <Badge kind="muted">{course.modules?.length || 0} modules</Badge>
      </div>
    </a>
  )
}
