import { useEffect, useMemo, useRef, useState } from 'react'
import './App.css'

const navItems = [
  { id: 'Home', label: 'Home' },
  { id: 'Downtime', label: 'Downtime' },
  { id: 'Quality', label: 'Quality' },
  { id: 'PM', label: 'PM' },
  { id: 'Improvement', label: 'Improvement Log' },
]

const storageKeys = {
  downtime: 'productionOS.v0.3.downtime',
  quality: 'productionOS.v0.3.quality',
  pm: 'productionOS.v0.3.pm',
  improvement: 'productionOS.v0.3.improvement',
}

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
  Planned: 'good',
  Scheduled: 'good',
  'Due soon': 'warning',
  'In progress': 'warning',
  Review: 'warning',
  Open: 'alert',
  Hold: 'alert',
  Investigating: 'alert',
}

const allStatuses = ['All', 'Open', 'In progress', 'Due soon', 'Planned', 'Scheduled', 'Resolved', 'Review', 'Hold', 'Investigating']

function loadStoredData(key, fallback) {
  if (typeof window === 'undefined') return fallback
  const stored = window.localStorage.getItem(storageKeys[key])
  if (!stored) return fallback
  try {
    const parsed = JSON.parse(stored)
    return Array.isArray(parsed) ? parsed : fallback
  } catch {
    return fallback
  }
}

function saveStoredData(key, data) {
  if (typeof window === 'undefined') return
  window.localStorage.setItem(storageKeys[key], JSON.stringify(data))
}

function csvEscape(value) {
  const text = String(value ?? '')
  return text.includes(',') || text.includes('\n') || text.includes('"')
    ? `"${text.replace(/"/g, '""')}"`
    : text
}

function exportToCsv(filename, headers, rows) {
  const headerLine = headers.map(csvEscape).join(',')
  const lines = rows.map((row) =>
    headers
      .map((key) => csvEscape(row[key] ?? row[key.toLowerCase()] ?? ''))
      .join(','),
  )
  const csv = [headerLine, ...lines].join('\n')
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

function filterRows(rows, query, status) {
  const normalized = query.trim().toLowerCase()
  return rows.filter((row) => {
    const statusMatch = status === 'All' || !status || Object.values(row).some((value) => String(value).toLowerCase() === status.toLowerCase())
    const searchMatch =
      !normalized ||
      Object.values(row).some((value) => String(value).toLowerCase().includes(normalized))
    return statusMatch && searchMatch
  })
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
          <p className="brand-note">v0.3 dashboard suite</p>
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

function BottomNav({ active, onSelect }) {
  return (
    <div className="bottom-nav" role="navigation" aria-label="Mobile navigation">
      {navItems.map((item) => (
        <button
          key={item.id}
          type="button"
          className={`nav-item bottom ${active === item.id ? 'active' : ''}`}
          onClick={() => onSelect(item.id)}
        >
          {item.label}
        </button>
      ))}
    </div>
  )
}

function PageToolbar({
  searchValue,
  onSearch,
  statusValue,
  onStatusChange,
  statusOptions,
  onExport,
  exportLabel,
  onOpenForm,
  createLabel,
  showCreate,
}) {
  return (
    <div className="toolbar-row">
      <div className="toolbar-group">
        <label className="field-label">
          Search
          <input
            type="search"
            className="input-field"
            placeholder="Search records..."
            value={searchValue}
            onChange={(event) => onSearch(event.target.value)}
          />
        </label>
        <label className="field-label">
          Status
          <select className="select-field" value={statusValue} onChange={(event) => onStatusChange(event.target.value)}>
            {statusOptions.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
        </label>
      </div>
      <div className="toolbar-actions">
        {showCreate ? (
          <button type="button" className="button secondary" onClick={onOpenForm}>
            {createLabel}
          </button>
        ) : null}
        <button type="button" className="button primary" onClick={onExport}>
          {exportLabel}
        </button>
      </div>
    </div>
  )
}

function FormPanel({ title, children, onCancel, onSave, saveLabel }) {
  return (
    <section className="card form-panel">
      <div className="form-panel-heading">
        <div>
          <p className="eyebrow">New record</p>
          <h2>{title}</h2>
        </div>
        <button type="button" className="button secondary small" onClick={onCancel}>
          Cancel
        </button>
      </div>
      <div className="form-grid">{children}</div>
      <div className="form-footer">
        <button type="button" className="button primary" onClick={onSave}>
          {saveLabel}
        </button>
      </div>
    </section>
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

function HomePage() {
  const lineFiltered = useMemo(
    () =>
      linePerformance.filter(() => {
        return true
      }),
    [],
  )

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
            {lineFiltered.map((entry) => (
              <div key={entry.label} className="line-item">
                <div>
                  <p className="line-name">{entry.label}</p>
                  <p className="line-detail">{entry.value}</p>
                </div>
                <StatusPill>{entry.value}</StatusPill>
              </div>
            ))}
            {lineFiltered.length === 0 ? <p className="empty-state">No matching line status</p> : null}
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

function DowntimePage({
  data,
  searchValue,
  onSearch,
  statusValue,
  onStatusChange,
  onExport,
  showForm,
  onToggleForm,
  formData,
  onFormChange,
  onFormSubmit,
}) {
  const filteredRows = useMemo(() => filterRows(data, searchValue, statusValue), [data, searchValue, statusValue])

  return (
    <>
      <section className="dashboard-header">
        <div>
          <p className="eyebrow">Downtime management</p>
          <h1>Recent equipment stops</h1>
        </div>
        <div className="header-chip">{filteredRows.length} records</div>
      </section>

      <PageToolbar
        searchValue={searchValue}
        onSearch={onSearch}
        statusValue={statusValue}
        onStatusChange={onStatusChange}
        statusOptions={allStatuses}
        onExport={() => onExport('downtime.csv', data)}
        exportLabel="Export CSV"
        onOpenForm={onToggleForm}
        createLabel="New downtime"
        showCreate
      />

      {showForm ? (
        <FormPanel title="Add Downtime" onCancel={onToggleForm} onSave={onFormSubmit} saveLabel="Save downtime">
          <label className="field-label">
            Machine
            <input type="text" className="input-field" value={formData.machine} onChange={(e) => onFormChange('machine', e.target.value)} />
          </label>
          <label className="field-label">
            Line
            <input type="text" className="input-field" value={formData.line} onChange={(e) => onFormChange('line', e.target.value)} />
          </label>
          <label className="field-label">
            Duration
            <input type="text" className="input-field" value={formData.duration} onChange={(e) => onFormChange('duration', e.target.value)} placeholder="e.g. 45m" />
          </label>
          <label className="field-label">
            Cause
            <input type="text" className="input-field" value={formData.cause} onChange={(e) => onFormChange('cause', e.target.value)} />
          </label>
          <label className="field-label">
            Action
            <input type="text" className="input-field" value={formData.action} onChange={(e) => onFormChange('action', e.target.value)} />
          </label>
          <label className="field-label">
            Owner
            <input type="text" className="input-field" value={formData.owner} onChange={(e) => onFormChange('owner', e.target.value)} />
          </label>
          <label className="field-label">
            Status
            <select className="select-field" value={formData.status} onChange={(e) => onFormChange('status', e.target.value)}>
              {allStatuses.filter((status) => status !== 'All').map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </label>
        </FormPanel>
      ) : null}

      <DataTable
        headers={['Machine', 'Line', 'Duration', 'Cause', 'Action', 'Owner', 'Status']}
        rows={filteredRows}
        rowMapper={(row, index) => (
          <tr key={`${row.machine}-${row.line}-${index}`}>
            <td>{row.machine}</td>
            <td>{row.line}</td>
            <td>{row.duration}</td>
            <td>{row.cause}</td>
            <td>{row.action}</td>
            <td>{row.owner}</td>
            <td>
              <StatusPill>{row.status}</StatusPill>
            </td>
          </tr>
        )}
      />
    </>
  )
}

function QualityPage({
  data,
  searchValue,
  onSearch,
  statusValue,
  onStatusChange,
  onExport,
  showForm,
  onToggleForm,
  formData,
  onFormChange,
  onFormSubmit,
}) {
  const filteredRows = useMemo(() => filterRows(data, searchValue, statusValue), [data, searchValue, statusValue])

  return (
    <>
      <section className="dashboard-header">
        <div>
          <p className="eyebrow">Quality oversight</p>
          <h1>Defect tracking</h1>
        </div>
        <div className="header-chip">{filteredRows.length} records</div>
      </section>

      <PageToolbar
        searchValue={searchValue}
        onSearch={onSearch}
        statusValue={statusValue}
        onStatusChange={onStatusChange}
        statusOptions={allStatuses}
        onExport={() => onExport('quality.csv', data)}
        exportLabel="Export CSV"
        onOpenForm={onToggleForm}
        createLabel="New quality issue"
        showCreate
      />

      {showForm ? (
        <FormPanel title="Add Quality Issue" onCancel={onToggleForm} onSave={onFormSubmit} saveLabel="Save issue">
          <label className="field-label">
            Defect Type
            <input type="text" className="input-field" value={formData.defect} onChange={(e) => onFormChange('defect', e.target.value)} />
          </label>
          <label className="field-label">
            Engine Number
            <input type="text" className="input-field" value={formData.engine} onChange={(e) => onFormChange('engine', e.target.value)} />
          </label>
          <label className="field-label">
            Process
            <input type="text" className="input-field" value={formData.process} onChange={(e) => onFormChange('process', e.target.value)} />
          </label>
          <label className="field-label">
            Cause
            <input type="text" className="input-field" value={formData.cause} onChange={(e) => onFormChange('cause', e.target.value)} />
          </label>
          <label className="field-label">
            Containment
            <input type="text" className="input-field" value={formData.containment} onChange={(e) => onFormChange('containment', e.target.value)} />
          </label>
          <label className="field-label">
            Status
            <select className="select-field" value={formData.status} onChange={(e) => onFormChange('status', e.target.value)}>
              {allStatuses.filter((status) => status !== 'All').map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </label>
        </FormPanel>
      ) : null}

      <DataTable
        headers={['Defect Type', 'Engine Number', 'Process', 'Cause', 'Containment', 'Status']}
        rows={filteredRows}
        rowMapper={(row, index) => (
          <tr key={`${row.engine}-${index}`}>
            <td>{row.defect}</td>
            <td>{row.engine}</td>
            <td>{row.process}</td>
            <td>{row.cause}</td>
            <td>{row.containment}</td>
            <td>
              <StatusPill>{row.status}</StatusPill>
            </td>
          </tr>
        )}
      />
    </>
  )
}

function PMPage({
  data,
  searchValue,
  onSearch,
  statusValue,
  onStatusChange,
  onExport,
  showForm,
  onToggleForm,
  formData,
  onFormChange,
  onFormSubmit,
}) {
  const filteredRows = useMemo(() => filterRows(data, searchValue, statusValue), [data, searchValue, statusValue])

  return (
    <>
      <section className="dashboard-header">
        <div>
          <p className="eyebrow">Preventive maintenance</p>
          <h1>Maintenance schedule</h1>
        </div>
        <div className="header-chip">{filteredRows.length} records</div>
      </section>

      <PageToolbar
        searchValue={searchValue}
        onSearch={onSearch}
        statusValue={statusValue}
        onStatusChange={onStatusChange}
        statusOptions={allStatuses}
        onExport={() => onExport('pm.csv', data)}
        exportLabel="Export CSV"
        onOpenForm={onToggleForm}
        createLabel="New PM task"
        showCreate
      />

      {showForm ? (
        <FormPanel title="Add PM Task" onCancel={onToggleForm} onSave={onFormSubmit} saveLabel="Save task">
          <label className="field-label">
            Machine
            <input type="text" className="input-field" value={formData.machine} onChange={(e) => onFormChange('machine', e.target.value)} />
          </label>
          <label className="field-label">
            PM Item
            <input type="text" className="input-field" value={formData.task} onChange={(e) => onFormChange('task', e.target.value)} />
          </label>
          <label className="field-label">
            Last PM
            <input type="date" className="input-field" value={formData.last} onChange={(e) => onFormChange('last', e.target.value)} />
          </label>
          <label className="field-label">
            Next PM
            <input type="date" className="input-field" value={formData.next} onChange={(e) => onFormChange('next', e.target.value)} />
          </label>
          <label className="field-label">
            Responsible
            <input type="text" className="input-field" value={formData.owner} onChange={(e) => onFormChange('owner', e.target.value)} />
          </label>
          <label className="field-label">
            Status
            <select className="select-field" value={formData.status} onChange={(e) => onFormChange('status', e.target.value)}>
              {allStatuses.filter((status) => status !== 'All').map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </label>
        </FormPanel>
      ) : null}

      <DataTable
        headers={['Machine', 'PM Item', 'Last PM', 'Next PM', 'Responsible', 'Status']}
        rows={filteredRows}
        rowMapper={(row, index) => (
          <tr key={`${row.machine}-${row.task}-${index}`}>
            <td>{row.machine}</td>
            <td>{row.task}</td>
            <td>{row.last}</td>
            <td>{row.next}</td>
            <td>{row.owner}</td>
            <td>
              <StatusPill>{row.status}</StatusPill>
            </td>
          </tr>
        )}
      />
    </>
  )
}

function ImprovementPage({
  data,
  searchValue,
  onSearch,
  statusValue,
  onStatusChange,
  onExport,
  showForm,
  onToggleForm,
  formData,
  onFormChange,
  onFormSubmit,
}) {
  const filteredRows = useMemo(() => filterRows(data, searchValue, statusValue), [data, searchValue, statusValue])

  return (
    <>
      <section className="dashboard-header">
        <div>
          <p className="eyebrow">Continuous improvement</p>
          <h1>Improvement log</h1>
        </div>
        <div className="header-chip">{filteredRows.length} opportunities</div>
      </section>

      <PageToolbar
        searchValue={searchValue}
        onSearch={onSearch}
        statusValue={statusValue}
        onStatusChange={onStatusChange}
        statusOptions={allStatuses}
        onExport={() => onExport('improvement.csv', data)}
        exportLabel="Export CSV"
        onOpenForm={onToggleForm}
        createLabel="New improvement"
        showCreate
      />

      {showForm ? (
        <FormPanel title="Add Improvement" onCancel={onToggleForm} onSave={onFormSubmit} saveLabel="Save improvement">
          <label className="field-label">
            Problem
            <input type="text" className="input-field" value={formData.problem} onChange={(e) => onFormChange('problem', e.target.value)} />
          </label>
          <label className="field-label">
            Idea
            <input type="text" className="input-field" value={formData.idea} onChange={(e) => onFormChange('idea', e.target.value)} />
          </label>
          <label className="field-label">
            Benefit
            <input type="text" className="input-field" value={formData.benefit} onChange={(e) => onFormChange('benefit', e.target.value)} />
          </label>
          <label className="field-label">
            Owner
            <input type="text" className="input-field" value={formData.owner} onChange={(e) => onFormChange('owner', e.target.value)} />
          </label>
          <label className="field-label">
            Due Date
            <input type="date" className="input-field" value={formData.due} onChange={(e) => onFormChange('due', e.target.value)} />
          </label>
          <label className="field-label">
            Status
            <select className="select-field" value={formData.status} onChange={(e) => onFormChange('status', e.target.value)}>
              {allStatuses.filter((status) => status !== 'All').map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </label>
        </FormPanel>
      ) : null}

      <DataTable
        headers={['Problem', 'Idea', 'Benefit', 'Owner', 'Due Date', 'Status']}
        rows={filteredRows}
        rowMapper={(row, index) => (
          <tr key={`${row.owner}-${index}`}>
            <td>{row.problem}</td>
            <td>{row.idea}</td>
            <td>{row.benefit}</td>
            <td>{row.owner}</td>
            <td>{row.due}</td>
            <td>
              <StatusPill>{row.status}</StatusPill>
            </td>
          </tr>
        )}
      />
    </>
  )
}

function App() {
  const [activePage, setActivePage] = useState('Home')
  const [searchValue, setSearchValue] = useState('')
  const [statusFilter, setStatusFilter] = useState('All')
  const [downtimeData, setDowntimeData] = useState(() => loadStoredData('downtime', downtimeRecords))
  const [qualityData, setQualityData] = useState(() => loadStoredData('quality', qualityRecords))
  const [pmData, setPmData] = useState(() => loadStoredData('pm', pmRecords))
  const [improvementData, setImprovementData] = useState(() => loadStoredData('improvement', improvementRecords))
  const [showDowntimeForm, setShowDowntimeForm] = useState(false)
  const [showQualityForm, setShowQualityForm] = useState(false)
  const [showPmForm, setShowPmForm] = useState(false)
  const [showImprovementForm, setShowImprovementForm] = useState(false)
  const [downtimeForm, setDowntimeForm] = useState({
    machine: '',
    line: '',
    duration: '',
    cause: '',
    action: '',
    owner: '',
    status: 'Open',
  })
  const [qualityForm, setQualityForm] = useState({
    defect: '',
    engine: '',
    process: '',
    cause: '',
    containment: '',
    status: 'Open',
  })
  const [pmForm, setPmForm] = useState({
    machine: '',
    task: '',
    last: '',
    next: '',
    owner: '',
    status: 'Due soon',
  })
  const [improvementForm, setImprovementForm] = useState({
    problem: '',
    idea: '',
    benefit: '',
    owner: '',
    due: '',
    status: 'Open',
  })

  useEffect(() => {
    saveStoredData('downtime', downtimeData)
  }, [downtimeData])

  useEffect(() => {
    saveStoredData('quality', qualityData)
  }, [qualityData])

  useEffect(() => {
    saveStoredData('pm', pmData)
  }, [pmData])

  useEffect(() => {
    saveStoredData('improvement', improvementData)
  }, [improvementData])

  function handleFormChange(setter, field, value) {
    setter((current) => ({ ...current, [field]: value }))
  }

  function handleDowntimeSubmit() {
    setDowntimeData((current) => [downtimeForm, ...current])
    setDowntimeForm({ machine: '', line: '', duration: '', cause: '', action: '', owner: '', status: 'Open' })
    setShowDowntimeForm(false)
  }

  function handleQualitySubmit() {
    setQualityData((current) => [qualityForm, ...current])
    setQualityForm({ defect: '', engine: '', process: '', cause: '', containment: '', status: 'Open' })
    setShowQualityForm(false)
  }

  function handlePmSubmit() {
    setPmData((current) => [pmForm, ...current])
    setPmForm({ machine: '', task: '', last: '', next: '', owner: '', status: 'Due soon' })
    setShowPmForm(false)
  }

  function handleImprovementSubmit() {
    setImprovementData((current) => [improvementForm, ...current])
    setImprovementForm({ problem: '', idea: '', benefit: '', owner: '', due: '', status: 'Open' })
    setShowImprovementForm(false)
  }

  function renderPage() {
    switch (activePage) {
      case 'Downtime':
        return (
          <DowntimePage
            data={downtimeData}
            searchValue={searchValue}
            onSearch={setSearchValue}
            statusValue={statusFilter}
            onStatusChange={setStatusFilter}
            onExport={(filename, rows) => exportToCsv(filename, ['Machine', 'Line', 'Duration', 'Cause', 'Action', 'Owner', 'Status'], rows)}
            showForm={showDowntimeForm}
            onToggleForm={() => setShowDowntimeForm((current) => !current)}
            formData={downtimeForm}
            onFormChange={(field, value) => handleFormChange(setDowntimeForm, field, value)}
            onFormSubmit={handleDowntimeSubmit}
          />
        )
      case 'Quality':
        return (
          <QualityPage
            data={qualityData}
            searchValue={searchValue}
            onSearch={setSearchValue}
            statusValue={statusFilter}
            onStatusChange={setStatusFilter}
            onExport={(filename, rows) => exportToCsv(filename, ['Defect Type', 'Engine Number', 'Process', 'Cause', 'Containment', 'Status'], rows)}
            showForm={showQualityForm}
            onToggleForm={() => setShowQualityForm((current) => !current)}
            formData={qualityForm}
            onFormChange={(field, value) => handleFormChange(setQualityForm, field, value)}
            onFormSubmit={handleQualitySubmit}
          />
        )
      case 'PM':
        return (
          <PMPage
            data={pmData}
            searchValue={searchValue}
            onSearch={setSearchValue}
            statusValue={statusFilter}
            onStatusChange={setStatusFilter}
            onExport={(filename, rows) => exportToCsv(filename, ['Machine', 'PM Item', 'Last PM', 'Next PM', 'Responsible', 'Status'], rows)}
            showForm={showPmForm}
            onToggleForm={() => setShowPmForm((current) => !current)}
            formData={pmForm}
            onFormChange={(field, value) => handleFormChange(setPmForm, field, value)}
            onFormSubmit={handlePmSubmit}
          />
        )
      case 'Improvement':
        return (
          <ImprovementPage
            data={improvementData}
            searchValue={searchValue}
            onSearch={setSearchValue}
            statusValue={statusFilter}
            onStatusChange={setStatusFilter}
            onExport={(filename, rows) => exportToCsv(filename, ['Problem', 'Idea', 'Benefit', 'Owner', 'Due Date', 'Status'], rows)}
            showForm={showImprovementForm}
            onToggleForm={() => setShowImprovementForm((current) => !current)}
            formData={improvementForm}
            onFormChange={(field, value) => handleFormChange(setImprovementForm, field, value)}
            onFormSubmit={handleImprovementSubmit}
          />
        )
      default:
        return (
          <HomePage />
        )
    }
  }

  const previousPageRef = useRef(activePage)

  useEffect(() => {
    if (previousPageRef.current !== 'Home' && activePage !== 'Home') {
      setSearchValue('')
      setStatusFilter('All')
    }
    previousPageRef.current = activePage
  }, [activePage])

  return (
    <div className="dashboard-shell">
      <Sidebar active={activePage} onSelect={setActivePage} />
      <main className="dashboard-main">{renderPage()}</main>
      <BottomNav active={activePage} onSelect={setActivePage} />
    </div>
  )
}

export default App
