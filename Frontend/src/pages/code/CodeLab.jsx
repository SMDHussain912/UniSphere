import { useState, useEffect } from 'react'
import { api } from '../../api'
import { Badge, Editor, VirtualTerminal } from '../../components/UI'

export default function CodeLab() {
  const [code, setCode] = useState('// Write your code here\nfunction greet() {\n  return "Hello, UniSphere!";\n}\n\nconsole.log(greet());')
  const [language, setLanguage] = useState('javascript')
  const [output, setOutput] = useState('')
  const [running, setRunning] = useState(false)
  const [error, setError] = useState('')

  const run = async () => {
    setRunning(true)
    setOutput('')
    setError('')
    try {
      const res = await api.post('/code/run', { code, language })
      setOutput(res.data.output || '')
      setError(res.data.error || '')
    } catch (err) {
      setError(err.message)
    } finally {
      setRunning(false)
    }
  }

  return (
    <div className="code-layout">
      <main className="code-main">
        <div className="row-between mb">
          <h2 className="heading">Cloud Practice Labs</h2>
          <select className="select" value={language} onChange={(e) => setLanguage(e.target.value)} style={{ width: 'auto' }}>
            <option value="javascript">JavaScript (Node.js)</option>
            <option value="python">Python</option>
            <option value="cpp">C++</option>
            <option value="java">Java</option>
            <option value="c">C</option>
            <option value="go">Go</option>
            <option value="rust">Rust</option>
          </select>
        </div>
        <div className="editor-panel">
          <Editor code={code} onChange={(e) => setCode(e)} language={language} />
          <button className="btn btn-primary" onClick={run} disabled={running}>
            {running ? 'Running...' : 'Run in Lab'}
          </button>
        </div>
        {(output || error) && (
          <div className="output-panel">
            <h4>Output</h4>
            <pre className={error ? 'error' : ''}>{output}{error}</pre>
          </div>
        )}
      </main>
      <aside className="code-sidebar">
        <Badge kind="info">Live Terminal</Badge>
        <div className="terminal-container">
          <VirtualTerminal />
        </div>
      </aside>
    </div>
  )
}
