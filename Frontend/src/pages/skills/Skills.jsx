import { useEffect, useState } from 'react'
import { api } from '../../api'
import { Loader, EmptyState, ProgressBar, Badge } from '../../components/UI'

export default function SkillsPage() {
  const [skills, setSkills] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api
      .get('/skills')
      .then((res) => setSkills(res.data || []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <Loader />

  return (
    <div>
      <h2 className="heading">Skill Graph</h2>
      <p className="sub">Your verified skills and learning progress across the entire technology landscape.</p>
      {skills.length === 0 ? (
        <EmptyState text="No skills yet. Start learning to build your skill graph." />
      ) : (
        <div className="skills-grid">
          {skills.map((node) => (
            <SkillNode key={node.key} node={node} />
          ))}
        </div>
      )}
    </div>
  )
}

function SkillNode({ node }) {
  return (
    <div className="card card-hover">
      <div className="card-header">
        <h3 className="card-title">{node.name}</h3>
        <Badge kind="info">{node.children?.length || 0} sub-skills</Badge>
      </div>
      <ProgressBar value={node.level || 0} label={`${node.level || 0}% mastered`} />
      {node.children && (
        <div className="mt">
          {node.children.map((child) => (
            <ProgressBar key={child.key} value={child.level || 0} label={child.name} small />
          ))}
        </div>
      )}
    </div>
  )
}
