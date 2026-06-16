import { useState } from 'react'
import './App.css'

const navItems = [
  { id: 'Home', label: 'Home' },
  { id: 'Downtime', label: 'Downtime' },
  { id: 'Quality', label: 'Quality' },
  { id: 'PM', label: 'PM' },
  { id: 'Improvement', label: 'Improvement Log' },
]

const kpiCards = [
  { label: 'OEE', value: '78.4%', note: 'Machining line efficiency' },
  { label: 'Downtime', value: '3h 24m', note: 'Today across all lines' },
  { label: 'Quality Yield', value: '96.8%', note: 'Good units out' },
  { label: 'Actions Open', value: '12', note: 'Issues pending review' },
]

const linePerformance = [
  { label: 'Line A', value: 'Running', state: 'good' },
  { label: 'Line B', value: 'Review', state: 'warning' },
  { label: 'Line C', value: 'Idle', state: 'alert' },
]

const downtimeRecords = [
  {
    machine: 'Robot 42',
    line: 'Line A',
    duration: '1h 12m',
    cause: 'Tool change delay',
    action: 'Adjust schedule',
    owner: 'M. Singh',
    status: 'In progress',
  },
  {
    machine: 'Press 7',
    line: 'Line C',
    duration: '52m',
    cause: 'Hydraulic leak',
    action: 'Replace seal',
    owner: 'L. Parker',
    status: 'Open',
  },
  {
    machine: 'CNC 14',
    line: 'Line B',
    duration: '35m',
    cause: 'Quality stop',
    action: 'Inspect run',
    owner: 'D. Wu',
    status: 'Hold',
  },
]

const qualityRecords = [
  {
    defect: 'Surface crack',
    engine: 'ENG-2319',
    process: 'Final grind',
    cause: 'Abrasive feed',
    containment: 'Scrap part',
    status: 'Investigating',
  },
  {
    defect: 'Misfeed',
    engine: 'ENG-2402',
    process: 'Load station',
    cause: 'Sensor error',
    containment: 'Manual reset',
    status: 'Resolved',
  },
  {
    defect: 'Bolt torque',
    engine: 'ENG-2448',
    process: 'Assembly',
    cause: 'Calibration drift',
    containment: 'Re-check torque',
    status: 'Open',
  },
]

const pmRecords = [
  {
    machine: 'Lathe 11',
    task: 'Coolant service',
    last: '2026-06-05',
    next: '2026-06-19',
    owner: 'C. Turner',
    status: 'Due soon',
  },
  {
    machine: 'Paint Booth 2',
    task: 'Filter change',
    last: '2026-05-28',
    next: '2026-06-21',
    owner: 'S. Ramirez',
    status: 'Scheduled',
  },
  {
    machine: 'Weld Cell 3',
    task: 'Safety inspection',
    last: '2026-04-30',
    next: '2026-06-24',
    owner: 'N. Jones',
    status: 'Open',
  },
]

const improvementRecords = [
  {
    problem: 'Excess cycle time at line B',
    idea: 'Optimize robot path',
    benefit: 'Reduce cycle by 9%',
    owner: 'A. Patel',
    due: '2026-06-30',
    status: 'Planned',
  },
  {
    problem: 'High rework in assembly',
    idea: '3D scan alignment',
    benefit: 'Improve first-pass yield',
    owner: 'R. Kim',
    due: '2026-07-05',
    status: 'In progress',
  },
  {
    problem: 'Untracked downtime',
    idea: 'Add line-level dashboard',
    benefit: 'Faster root cause',
    owner: 'M. Carter',
    due: '2026-07-12',
    status: 'Open',
  },
]

const statusStyles = {
  Good: 'good',
  Running: 'good',
  Resolved: 'good',
  'Due soon': 'warning',
  'In progress': 'warning',
  Warning: 'warning',
  Open: 'alert',
  Hold: 'alert',
  Investigating: 'alert',
}

function StatusPill({ children }) {
  const base = statusStyles[children] || 'neutral'
  return <span className={`status-pill ${base}`}>{children}</span>
}

function Sidebar({ active, onSelect }) {
  return (
    <aside className="sidebar">
      <div className="brand-block">
        <div className="brand-mark">PE</div>
        <div>
          <p className="brand-label">Production Engineer OS</p>
          <p className="brand-note">v0.1 dashboard suite</p>
        </div>
      </div>
      <nav className="sidebar-nav" aria-label="Main navigation">
        {navItems.map((item) => (
          <button
            key={item.id}
            type="button"
            className={`nav-item ${active === item.id ? 'active' : ''}`}
            onClick={() => onSelect(item.id)}
            aria-current={active === item.id ? 'page' : undefined}
          >
            {item.label}
          </button>
        ))}
      </nav>
    </aside>
  )
}

function HomePage() {
  return (
    <>
      <section className="dashboard-header">
        <div>
          <p className="eyebrow">Factory Operations</p>
          <h1>Production command center</h1>
        </div>
        <div className="header-chip">Last update: 10 mins ago</div>
      </section>

      <section className="kpi-grid">
        {kpiCards.map((card) => (
          <article key={card.label} className="card stat-card">
            <p className="stat-label">{card.label}</p>
            <p className="stat-value">{card.value}</p>
            <p className="stat-note">{card.note}</p>
          </article>
        ))}
      </section>

      <section className="home-grid">
        <article className="card line-card">
          <div className="card-heading">
            <p>Line status</p>
            <strong>Real-time view</strong>
          </div>
          <div className="line-status-list">
            {linePerformance.map((entry) => (
              <div key={entry.label} className="line-item">
                <div>
                  <p className="line-name">{entry.label}</p>
                  <p className="line-detail">{entry.value}</p>
                </div>
                <StatusPill>{entry.value}</StatusPill>
              </div>
            ))}
          </div>
        </article>

        <article className="card mini-card">
          <div className="card-heading">
            <p>Downtime today</p>
            <strong>3h 24m</strong>
          </div>
          <div className="card-metrics">
            <div>
              <p className="metric-value">2</p>
              <p className="metric-label">Line stops</p>
            </div>
            <div>
              <p className="metric-value">1</p>
              <p className="metric-label">Critical events</p>
            </div>
          </div>
        </article>

        <article className="card mini-card">
          <div className="card-heading">
            <p>Defects today</p>
            <strong>8</strong>
          </div>
          <div className="card-metrics">
            <div>
              <p className="metric-value">4</p>
              <p className="metric-label">Assembly</p>
            </div>
            <div>
              <p className="metric-value">2</p>
              <p className="metric-label">Machining</p>
            </div>
          </div>
        </article>

        <article className="card mini-card">
          <div className="card-heading">
            <p>PM due this week</p>
            <strong>5 items</strong>
          </div>
          <ul className="small-list">
            <li>Lathe 11 coolant service</li>
            <li>Paint Booth 2 filter change</li>
          </ul>
        </article>

        <article className="card mini-card">
          <div className="card-heading">
            <p>Open actions</p>
            <strong>12</strong>
          </div>
          <ul className="small-list">
            <li>Hydraulic seal replacement</li>
            <li>Alignment check, Line B</li>
          </ul>
        </article>
      </section>

      <article className="card priority-card">
        <div className="card-heading">
          <p>Top 3 priorities</p>
          <strong>Factory focus</strong>
        </div>
        <ol className="priority-list">
          <li>Resolve Line A bottleneck and stabilize cycle time.</li>
          <li>Complete paint booth filter replacement by end of day.</li>
          <li>Launch quality containment review for cracked housings.</li>
        </ol>
      </article>
    </>
  )
}

function DataTable({ headers, rows, rowMapper }) {
  return (
    <div className="table-panel">
      <div className="table-scroll">
        <table className="data-table">
          <thead>
            <tr>
              {headers.map((header) => (
                <th key={header}>{header}</th>
              ))}
            </tr>
          </thead>
          <tbody>{rows.map(rowMapper)}</tbody>
        </table>
      </div>
    </div>
  )
}

function DowntimePage() {
  return (
    <>
      <section className="dashboard-header">
        <div>
          <p className="eyebrow">Downtime management</p>
          <h1>Recent equipment stops</h1>
        </div>
        <div className="header-chip">3 open incidents</div>
      </section>

      <DataTable
        headers={['Machine', 'Line', 'Duration', 'Cause', 'Action', 'Owner', 'Status']}
        rows={downtimeRecords}
        rowMapper={(row) => (
          <tr key={`${row.machine}-${row.line}`}>
            <td>{row.machine}</td>
            <td>{row.line}</td>
            <td>{row.duration}</td>
            <td>{row.cause}</td>
            <td>{row.action}</td>
            <td>{row.owner}</td>
            <td><StatusPill>{row.status}</StatusPill></td>
          </tr>
        )}
      />
    </>
  )
}

function QualityPage() {
  return (
    <>
      <section className="dashboard-header">
        <div>
          <p className="eyebrow">Quality oversight</p>
          <h1>Defect tracking</h1>
        </div>
        <div className="header-chip">2 items requiring follow-up</div>
      </section>

      <DataTable
        headers={['Defect Type', 'Engine Number', 'Process', 'Cause', 'Containment', 'Status']}
        rows={qualityRecords}
        rowMapper={(row) => (
          <tr key={row.engine}>
            <td>{row.defect}</td>
            <td>{row.engine}</td>
            <td>{row.process}</td>
            <td>{row.cause}</td>
            <td>{row.containment}</td>
            <td><StatusPill>{row.status}</StatusPill></td>
          </tr>
        )}
      />
    </>
  )
}

function PMPage() {
  return (
    <>
      <section className="dashboard-header">
        <div>
          <p className="eyebrow">Preventive maintenance</p>
          <h1>Maintenance schedule</h1>
        </div>
        <div className="header-chip">5 due this week</div>
      </section>

      <DataTable
        headers={['Machine', 'PM Item', 'Last PM', 'Next PM', 'Responsible', 'Status']}
        rows={pmRecords}
        rowMapper={(row) => (
          <tr key={`${row.machine}-${row.task}`}>
            <td>{row.machine}</td>
            <td>{row.task}</td>
            <td>{row.last}</td>
            <td>{row.next}</td>
            <td>{row.owner}</td>
            <td><StatusPill>{row.status}</StatusPill></td>
          </tr>
        )}
      />
    </>
  )
}

function ImprovementPage() {
  return (
    <>
      <section className="dashboard-header">
        <div>
          <p className="eyebrow">Continuous improvement</p>
          <h1>Improvement log</h1>
        </div>
        <div className="header-chip">3 opportunities</div>
      </section>

      <DataTable
        headers={['Problem', 'Idea', 'Benefit', 'Owner', 'Due Date', 'Status']}
        rows={improvementRecords}
        rowMapper={(row, index) => (
          <tr key={`${row.owner}-${index}`}>
            <td>{row.problem}</td>
            <td>{row.idea}</td>
            <td>{row.benefit}</td>
            <td>{row.owner}</td>
            <td>{row.due}</td>
            <td><StatusPill>{row.status}</StatusPill></td>
          </tr>
        )}
      />
    </>
  )
}

function App() {
  const [activePage, setActivePage] = useState('Home')

  const renderPage = () => {
    switch (activePage) {
      case 'Downtime':
        return <DowntimePage />
      case 'Quality':
        return <QualityPage />
      case 'PM':
        return <PMPage />
      case 'Improvement':
        return <ImprovementPage />
      default:
        return <HomePage />
    }
  }

  return (
    <div className="dashboard-shell">
      <Sidebar active={activePage} onSelect={setActivePage} />
      <main className="dashboard-main">{renderPage()}</main>
    </div>
  )
}

export default App
