import { useEffect, useState } from 'react'
import { useHashLocation } from '../../router'
import { api } from '../../api'
import { Loader, EmptyState } from '../../components/UI'

export default function Learn() {
  const location = useHashLocation()
  const segs = location.split('/').filter(Boolean)
  const id = segs[1]
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

  if (id) {
    const course = courses.find((c) => c.slug === id || c._id === id)
    if (!course) return <EmptyState text="Course not found." />
    return (
      <div className="learn-layout">
        <main className="learn-main">
          <h1 className="heading">{course.title}</h1>
          <p className="sub">{course.description}</p>
          <div className="mt">
            {course.modules?.map((mod, i) => (
              <div key={i} className="card">
                <h3 className="card-title">{mod.title || `Module ${i + 1}`}</h3>
                <ul className="list">
                  {mod.lessons?.map((l, j) => (
                    <li key={j}>{l.title || `Lesson ${j + 1}`}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="learn-layout">
      <main className="learn-main">
        <h1 className="heading">Courses</h1>
        <p className="sub">Browse all UniSphere learning courses.</p>
      </main>
    </div>
  )
}
