import { useState, useCallback, useEffect, useRef } from 'react'

/* ════════════════════════════════════════════════════════════
   PEGA VERSION DATA
   ════════════════════════════════════════════════════════════ */
const PEGA_VERSIONS = [
  { id: '23', label: "Pega '23", branch: 'release/1.x.x', version: '1.x', node: '18.x', npm: '9.x' },
  { id: '24.1', label: "Pega '24.1", branch: 'release/2.0', version: '2.x', node: '18.x', npm: '9.x' },
  { id: '24.2', label: "Pega '24.2", branch: 'release/3.0', version: '3.x', node: '20.x', npm: '10.x' },
  { id: '25.1', label: "Pega '25.1", branch: 'release/4.0', version: '4.x', node: '20.x', npm: '10.x' },
  { id: '26.1', label: "Pega '26.1", branch: 'master', version: '5.x', node: '24.x', npm: '10.x' },
]

const ACCESS_GROUP_ITEMS = {
  portals: [
    { id: 'pxAdminPortal', name: 'pxAdminPortal', desc: 'Enables access to the Pega Admin Portal for system administration, security, and operator management.' },
    { id: 'pxAdminStudio', name: 'pxAdminStudio', desc: 'Grants access to Admin Studio for managing application settings, rulesets, and deployment configurations.' },
  ],
  roles: [
    { id: 'PegaAPI', name: 'PegaRULES:PegaAPI', desc: 'Provides access to Pega REST APIs — required for the DX Component Builder CLI to communicate with your Pega instance.' },
    { id: 'PegaAPIDX', name: 'PegaRULES:PegaAPIDX', desc: 'Grants access to the DX API endpoints specifically used for publishing Constellation DX components.' },
    { id: 'SysAdm4', name: 'PegaRULES:SysAdm4', desc: 'System Administrator role — allows you to import rulesets, manage component packages, and publish custom components.' },
  ],
}

/* ════════════════════════════════════════════════════════════
   HELPER: Copy to Clipboard Button
   ════════════════════════════════════════════════════════════ */
function CopyCmd({ text }) {
  const [copied, setCopied] = useState(false)
  const copy = useCallback(() => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2200)
    })
  }, [text])
  return (
    <button className={`guide-copy-btn ${copied ? 'is-copied' : ''}`} onClick={copy} aria-label="Copy command">
      {copied ? '✓ Copied!' : '⧉ Copy'}
    </button>
  )
}

/* ════════════════════════════════════════════════════════════
   HELPER: Terminal Code Block
   ════════════════════════════════════════════════════════════ */
function TerminalBlock({ commands, title, badge }) {
  const text = Array.isArray(commands) ? commands.join('\n') : commands
  return (
    <div className="guide-terminal">
      <div className="guide-terminal-bar">
        <div className="guide-terminal-dots">
          <i className="window-dot dot-red" />
          <i className="window-dot dot-yellow" />
          <i className="window-dot dot-green" />
        </div>
        <span className="guide-terminal-title">{title || 'Terminal'}</span>
        {badge && <span className="guide-terminal-badge">{badge}</span>}
        <CopyCmd text={text} />
      </div>
      <pre className="guide-terminal-body">
        {(Array.isArray(commands) ? commands : [commands]).map((cmd, i) => (
          <code key={i} className="guide-terminal-line">
            <span className="guide-prompt">$</span> {cmd}
          </code>
        ))}
      </pre>
    </div>
  )
}

/* ════════════════════════════════════════════════════════════
   HELPER: Analogy / Callout Cards
   ════════════════════════════════════════════════════════════ */
function AnalogyCard({ icon, title, children, variant = 'info' }) {
  return (
    <div className={`guide-analogy guide-analogy-${variant}`}>
      <div className="guide-analogy-icon">{icon}</div>
      <div className="guide-analogy-body">
        <strong className="guide-analogy-title">{title}</strong>
        <div className="guide-analogy-text">{children}</div>
      </div>
    </div>
  )
}

/* ════════════════════════════════════════════════════════════
   HELPER: Step Card wrapper
   ════════════════════════════════════════════════════════════ */
function StepSection({ stepNumber, title, subtitle, icon, children, id }) {
  return (
    <section className="guide-step" id={id}>
      <div className="guide-step-header">
        <div className="guide-step-number-ring">{stepNumber}</div>
        <div>
          <h2 className="guide-step-title">
            {icon && <span className="guide-step-icon">{icon}</span>}
            {title}
          </h2>
          {subtitle && <p className="guide-step-subtitle">{subtitle}</p>}
        </div>
      </div>
      <div className="guide-step-content">{children}</div>
    </section>
  )
}

/* ════════════════════════════════════════════════════════════
   SUB-COMPONENT: Version Selector
   ════════════════════════════════════════════════════════════ */
function VersionSelector({ selected, onSelect }) {
  return (
    <div className="guide-version-selector">
      <span className="guide-version-label">Select your Pega Platform version:</span>
      <div className="guide-version-cards">
        {PEGA_VERSIONS.map((v) => (
          <button
            key={v.id}
            className={`guide-version-card ${selected.id === v.id ? 'is-active' : ''}`}
            onClick={() => onSelect(v)}
          >
            <span className="guide-version-card-label">{v.label}</span>
            <span className="guide-version-card-branch">{v.branch}</span>
            <span className="guide-version-card-ver">v{v.version}</span>
          </button>
        ))}
      </div>
      <div className="guide-version-detail">
        <div className="guide-version-detail-item">
          <span className="guide-version-detail-key">Git Branch</span>
          <code className="guide-version-detail-val">{selected.branch}</code>
        </div>
        <div className="guide-version-detail-item">
          <span className="guide-version-detail-key">Node.js</span>
          <code className="guide-version-detail-val">{selected.node}</code>
        </div>
        <div className="guide-version-detail-item">
          <span className="guide-version-detail-key">npm</span>
          <code className="guide-version-detail-val">{selected.npm}</code>
        </div>
        <div className="guide-version-detail-item">
          <span className="guide-version-detail-key">Component Version</span>
          <code className="guide-version-detail-val">{selected.version}</code>
        </div>
      </div>
    </div>
  )
}

/* ════════════════════════════════════════════════════════════
   SUB-COMPONENT: Access Group Checklist
   ════════════════════════════════════════════════════════════ */
function AccessGroupChecklist() {
  const [checked, setChecked] = useState({})
  const toggle = (id) => setChecked((prev) => ({ ...prev, [id]: !prev[id] }))

  const allPortals = ACCESS_GROUP_ITEMS.portals.every((p) => checked[p.id])
  const allRoles = ACCESS_GROUP_ITEMS.roles.every((r) => checked[r.id])
  const allReady = allPortals && allRoles

  return (
    <div className="guide-ag-check">
      <div className="guide-ag-status-bar">
        <span className={`guide-ag-status ${allReady ? 'is-ready' : ''}`}>
          <span className={`guide-ag-dot ${allReady ? 'dot-green' : 'dot-amber'}`} />
          {allReady
            ? '✅ All prerequisites configured! You are ready to authenticate & publish.'
            : '⚠️ Configure all items below before running npm run authenticate.'}
        </span>
      </div>

      <div className="guide-ag-section">
        <h4 className="guide-ag-section-title">
          <span className={`guide-ag-section-badge ${allPortals ? 'is-done' : ''}`}>
            {allPortals ? '✓' : '○'}
          </span>
          Available Portals
        </h4>
        {ACCESS_GROUP_ITEMS.portals.map((item) => (
          <label key={item.id} className={`guide-ag-item ${checked[item.id] ? 'is-checked' : ''}`}>
            <input
              type="checkbox"
              checked={!!checked[item.id]}
              onChange={() => toggle(item.id)}
              className="guide-ag-checkbox"
            />
            <div className="guide-ag-item-info">
              <code className="guide-ag-item-name">{item.name}</code>
              <span className="guide-ag-item-desc">{item.desc}</span>
            </div>
          </label>
        ))}
      </div>

      <div className="guide-ag-section">
        <h4 className="guide-ag-section-title">
          <span className={`guide-ag-section-badge ${allRoles ? 'is-done' : ''}`}>
            {allRoles ? '✓' : '○'}
          </span>
          Available Roles
        </h4>
        {ACCESS_GROUP_ITEMS.roles.map((item) => (
          <label key={item.id} className={`guide-ag-item ${checked[item.id] ? 'is-checked' : ''}`}>
            <input
              type="checkbox"
              checked={!!checked[item.id]}
              onChange={() => toggle(item.id)}
              className="guide-ag-checkbox"
            />
            <div className="guide-ag-item-info">
              <code className="guide-ag-item-name">{item.name}</code>
              <span className="guide-ag-item-desc">{item.desc}</span>
            </div>
          </label>
        ))}
      </div>
    </div>
  )
}

/* ════════════════════════════════════════════════════════════
   SUB-COMPONENT: Progress Sidebar / Stepper
   ════════════════════════════════════════════════════════════ */
const STEPS = [
  { id: 'intro', label: 'Introduction', icon: '🚀' },
  { id: 'step-version', label: 'Choose Version', icon: '🎯' },
  { id: 'step-toolbelt', label: 'Install Tools', icon: '🧰' },
  { id: 'step-clone', label: 'Clone Repository', icon: '📥' },
  { id: 'step-setup', label: 'Setup & Storybook', icon: '⚡' },
  { id: 'step-add', label: 'Add Components', icon: '🧩' },
  { id: 'step-validate', label: 'Validate & Test', icon: '✅' },
  { id: 'step-access', label: 'Access Group Setup', icon: '🔐' },
  { id: 'step-publish', label: 'Authenticate & Publish', icon: '🚢' },
  { id: 'step-use', label: 'Use in App Studio', icon: '🎉' },
  { id: 'step-troubleshoot', label: 'Troubleshooting', icon: '🔧' },
]

function GuideSidebar({ activeStep }) {
  return (
    <aside className="guide-sidebar">
      <div className="guide-sidebar-title">Journey Map</div>
      <nav className="guide-sidebar-nav">
        {STEPS.map((step, i) => (
          <a
            key={step.id}
            href={`#${step.id}`}
            className={`guide-sidebar-link ${activeStep === step.id ? 'is-active' : ''}`}
          >
            <span className="guide-sidebar-icon">{step.icon}</span>
            <span className="guide-sidebar-label">{step.label}</span>
          </a>
        ))}
      </nav>
    </aside>
  )
}

/* ════════════════════════════════════════════════════════════
   MAIN EXPORT: IntegrationGuide
   ════════════════════════════════════════════════════════════ */
export default function IntegrationGuide({ onBack }) {
  const [pegaVersion, setPegaVersion] = useState(PEGA_VERSIONS[PEGA_VERSIONS.length - 1])
  const [activeStep, setActiveStep] = useState('intro')
  const observerRef = useRef(null)

  // Intersection observer for sidebar highlighting
  useEffect(() => {
    const sections = STEPS.map((s) => document.getElementById(s.id)).filter(Boolean)
    if (sections.length === 0) return

    observerRef.current = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveStep(entry.target.id)
            break
          }
        }
      },
      { rootMargin: '-80px 0px -60% 0px', threshold: 0.1 }
    )

    sections.forEach((el) => observerRef.current.observe(el))
    return () => observerRef.current?.disconnect()
  }, [])

  return (
    <div className="guide-page shell">
      <button className="back-btn" onClick={onBack}>
        <span className="back-arrow">←</span> Back to Component Hub
      </button>

      <GuideSidebar activeStep={activeStep} />

      <div className="guide-main">
        {/* ══════ HERO / INTRO ══════ */}
        <section className="guide-hero" id="intro">
          <div className="guide-hero-badge">
            <span className="guide-hero-badge-dot" />
            Step-by-Step Integration & Publishing Guide
          </div>
          <h1 className="guide-hero-title">
            From <span className="gradient-text">React code</span> to{' '}
            <span className="gradient-text">Pega Constellation</span>
            <br />in production.
          </h1>
          <p className="guide-hero-subtitle">
            This guide walks you through the complete journey of extending Pega Constellation with custom DX components.
            Whether you&apos;re a computer science expert or an engineer from any discipline —
            <strong> if you can follow a recipe, you can publish to Pega.</strong>
          </p>

          <AnalogyCard icon="💡" title="What are Constellation DX Components?" variant="info">
            <p>
              Think of Pega Constellation as a pre-built kitchen with standard appliances (buttons, forms, tables).
              <strong> DX Components</strong> let you bring your own custom appliances — built with React —
              and plug them right into the kitchen. You get the power of React&apos;s ecosystem while Pega handles
              your case data, security, and workflow.
            </p>
          </AnalogyCard>

          <div className="guide-resources-row">
            <a href="https://github.com/pegasystems/constellation-ui-gallery" target="_blank" rel="noopener noreferrer" className="guide-resource-card">
              <span className="guide-resource-icon">📦</span>
              <span className="guide-resource-label">Official GitHub Repository</span>
              <span className="guide-resource-url">pegasystems/constellation-ui-gallery</span>
            </a>
            <a href="https://pegasystems.github.io/constellation-ui-gallery/" target="_blank" rel="noopener noreferrer" className="guide-resource-card">
              <span className="guide-resource-icon">🌐</span>
              <span className="guide-resource-label">Live Component Gallery</span>
              <span className="guide-resource-url">pegasystems.github.io</span>
            </a>
            <a href="https://docs.pega.com/bundle/constellation-dx-components/page/constellation-dx-components/custom-components/initialize-project.html" target="_blank" rel="noopener noreferrer" className="guide-resource-card">
              <span className="guide-resource-icon">📖</span>
              <span className="guide-resource-label">Pega Official Documentation</span>
              <span className="guide-resource-url">docs.pega.com</span>
            </a>
            <a href="https://github.com/pegasystems/constellation-ui-gallery/releases" target="_blank" rel="noopener noreferrer" className="guide-resource-card">
              <span className="guide-resource-icon">📋</span>
              <span className="guide-resource-label">Pre-built RAP Releases</span>
              <span className="guide-resource-url">GitHub Releases</span>
            </a>
          </div>
        </section>

        {/* ══════ STEP 1: VERSION SELECTOR ══════ */}
        <StepSection
          stepNumber="1"
          title="Choose Your Pega Platform Version"
          subtitle="Different Pega versions require different branches and Node.js versions. Pick yours below."
          icon="🎯"
          id="step-version"
        >
          <VersionSelector selected={pegaVersion} onSelect={setPegaVersion} />

          <AnalogyCard icon="⚠️" title="Important: Version Compatibility" variant="warning">
            <p>
              Using the wrong branch for your Pega version will cause build failures.
              Always match your Pega Platform version to the correct branch.
              Older versions of the Pega Platform have not been tested and are not supported.
            </p>
          </AnalogyCard>
        </StepSection>

        {/* ══════ STEP 2: THE NON-CS TOOLBELT ══════ */}
        <StepSection
          stepNumber="2"
          title="Install Your Developer Toolbelt"
          subtitle="Even if you've never coded before — these three free tools are all you need to get started."
          icon="🧰"
          id="step-toolbelt"
        >
          <div className="guide-tools-grid">
            {/* VS Code */}
            <div className="guide-tool-card">
              <div className="guide-tool-card-icon">💻</div>
              <h3 className="guide-tool-card-title">Visual Studio Code</h3>
              <p className="guide-tool-card-desc">
                Your code editor — think of it as Microsoft Word, but for code.
                It has a built-in <strong>Terminal</strong> where you&apos;ll type commands.
              </p>
              <a href="https://code.visualstudio.com/download" target="_blank" rel="noopener noreferrer" className="guide-tool-card-link">
                ↗ Download VS Code
              </a>
              <div className="guide-tool-card-tip">
                <strong>Pro tip:</strong> Press <kbd>Ctrl</kbd> + <kbd>`</kbd> (backtick) to open the Terminal inside VS Code.
              </div>
            </div>

            {/* Node.js */}
            <div className="guide-tool-card">
              <div className="guide-tool-card-icon">⬢</div>
              <h3 className="guide-tool-card-title">Node.js & npm</h3>
              <p className="guide-tool-card-desc">
                Node.js runs JavaScript outside the browser. <strong>npm</strong> (Node Package Manager)
                installs all the libraries your component needs — like an app store for code packages.
              </p>
              <a href="https://nodejs.org/en/download/" target="_blank" rel="noopener noreferrer" className="guide-tool-card-link">
                ↗ Download Node.js
              </a>
              <div className="guide-tool-card-tip">
                <strong>Required for {pegaVersion.label}:</strong> Node <code>{pegaVersion.node}</code>, npm <code>{pegaVersion.npm}+</code>
              </div>
            </div>

            {/* Git */}
            <div className="guide-tool-card">
              <div className="guide-tool-card-icon">🔀</div>
              <h3 className="guide-tool-card-title">Git</h3>
              <p className="guide-tool-card-desc">
                Git tracks changes to your code — like "Track Changes" in Word, but for entire projects.
                It also lets you download (clone) the official Pega repository.
              </p>
              <a href="https://git-scm.com/downloads" target="_blank" rel="noopener noreferrer" className="guide-tool-card-link">
                ↗ Download Git
              </a>
              <div className="guide-tool-card-tip">
                During installation on Windows, accept all defaults. Git will be available in your VS Code terminal automatically.
              </div>
            </div>
          </div>

          <AnalogyCard icon="🔍" title="Verify Your Installation" variant="info">
            <p>Open VS Code, press <kbd>Ctrl</kbd> + <kbd>`</kbd> to open the terminal, and type these commands. Each should print a version number:</p>
          </AnalogyCard>

          <TerminalBlock
            commands={['node -v', 'npm -v', 'git --version']}
            title="VS Code Terminal"
            badge="Verification"
          />
        </StepSection>

        {/* ══════ STEP 3: CLONE & BRANCHING ══════ */}
        <StepSection
          stepNumber="3"
          title="Clone the Official Repository"
          subtitle="Download the Pega Constellation UI Gallery source code using Git."
          icon="📥"
          id="step-clone"
        >
          <AnalogyCard icon="🚨" title="Critical: Always use git clone — NEVER use 'Download ZIP'" variant="warning">
            <p>
              If you download the code as a ZIP file, the hidden <code>.git</code> folder will be missing.
              This folder is <strong>required</strong> by Pega&apos;s DX Component Builder to track your code and publish components.
              Without it, you will get the error: <code>&quot;Git needs to be installed&quot;</code> — even if Git is already installed!
            </p>
            <p style={{ marginTop: 8 }}>
              If you accidentally downloaded ZIP, navigate into the folder and run <code>git init</code> to create the missing <code>.git</code> folder.
            </p>
          </AnalogyCard>

          <TerminalBlock
            commands={['git clone https://github.com/pegasystems/constellation-ui-gallery.git', 'cd constellation-ui-gallery']}
            title="VS Code Terminal"
            badge="Step 3a"
          />

          {pegaVersion.branch !== 'master' && (
            <>
              <AnalogyCard icon="🌿" title={`Switch to ${pegaVersion.label} Branch`} variant="info">
                <p>Since you selected <strong>{pegaVersion.label}</strong>, you need to switch to the <code>{pegaVersion.branch}</code> branch:</p>
              </AnalogyCard>
              <TerminalBlock
                commands={[`git checkout ${pegaVersion.branch}`]}
                title="VS Code Terminal"
                badge="Step 3b — Branch"
              />
            </>
          )}
          {pegaVersion.branch === 'master' && (
            <AnalogyCard icon="✅" title="You're on the latest!" variant="success">
              <p>
                Since you selected <strong>{pegaVersion.label}</strong>, you&apos;re already on the <code>master</code> branch.
                No branch switching needed!
              </p>
            </AnalogyCard>
          )}

          <AnalogyCard icon="📦" title="Alternative: Pre-built RAP File" variant="info">
            <p>
              Don&apos;t want to build from source? Download a pre-built RAP file from{' '}
              <a href="https://github.com/pegasystems/constellation-ui-gallery/releases" target="_blank" rel="noopener noreferrer">
                GitHub Releases
              </a>{' '}
              and import it directly into your Pega application through Admin Studio.
            </p>
          </AnalogyCard>
        </StepSection>

        {/* ══════ STEP 4: SETUP & STORYBOOK ══════ */}
        <StepSection
          stepNumber="4"
          title="Install Dependencies & Launch Storybook"
          subtitle="Install all required packages, then open the visual component playground."
          icon="⚡"
          id="step-setup"
        >
          <TerminalBlock
            commands={['npm install']}
            title="VS Code Terminal"
            badge="Install"
          />

          <AnalogyCard icon="⏳" title="This may take a few minutes" variant="info">
            <p>
              <code>npm install</code> downloads hundreds of packages from the internet.
              On a typical connection, this takes 2-5 minutes. You&apos;ll see a progress bar.
              Don&apos;t worry about warning messages — they are normal.
            </p>
          </AnalogyCard>

          <TerminalBlock
            commands={['npm run start']}
            title="VS Code Terminal"
            badge="Launch Storybook"
          />

          <AnalogyCard icon="🎨" title="Storybook: Your Component Playground" variant="success">
            <p>
              After running the command above, a browser window will open automatically at <code>http://localhost:6006</code>.
              This is <strong>Storybook</strong> — a visual catalogue where you can interact with every component in isolation.
              Browse it to understand how existing Pega components work!
            </p>
          </AnalogyCard>
        </StepSection>

        {/* ══════ STEP 5: ADD COMPONENTS FROM THIS HUB ══════ */}
        <StepSection
          stepNumber="5"
          title="Add Components from This Hub"
          subtitle="Copy source files from the Constellation Hub into the official Pega project structure."
          icon="🧩"
          id="step-add"
        >
          <AnalogyCard icon="📁" title="Folder Structure — Where to put your files" variant="info">
            <p>
              Each component lives in its own folder inside <code>src/components/</code>.
              The folder name <strong>must</strong> match the component key exactly (e.g. <code>Pega_Extensions_SplitFlapText</code>).
            </p>
          </AnalogyCard>

          <div className="guide-folder-tree">
            <div className="guide-folder-line"><span className="guide-folder-icon">📂</span> constellation-ui-gallery/</div>
            <div className="guide-folder-line guide-folder-indent-1"><span className="guide-folder-icon">📂</span> src/</div>
            <div className="guide-folder-line guide-folder-indent-2"><span className="guide-folder-icon">📂</span> components/</div>
            <div className="guide-folder-line guide-folder-indent-3 guide-folder-highlight"><span className="guide-folder-icon">📂</span> Pega_Extensions_SplitFlapText/  <span className="guide-folder-tag">← Your component folder</span></div>
            <div className="guide-folder-line guide-folder-indent-4"><span className="guide-folder-icon">📄</span> index.tsx</div>
            <div className="guide-folder-line guide-folder-indent-4"><span className="guide-folder-icon">📄</span> styles.ts</div>
            <div className="guide-folder-line guide-folder-indent-4"><span className="guide-folder-icon">📄</span> config.json</div>
            <div className="guide-folder-line guide-folder-indent-4"><span className="guide-folder-icon">📄</span> Docs.mdx</div>
            <div className="guide-folder-line guide-folder-indent-4"><span className="guide-folder-icon">📄</span> demo.stories.tsx</div>
            <div className="guide-folder-line guide-folder-indent-4"><span className="guide-folder-icon">📄</span> demo.test.tsx</div>
          </div>

          <AnalogyCard icon="📋" title="How to copy files from this website" variant="info">
            <ol style={{ margin: 0, paddingLeft: 20, lineHeight: 2 }}>
              <li>Go to any component&apos;s <strong>Detail Page</strong> on this Hub.</li>
              <li>Click the <strong>&quot;Code &amp; Files&quot;</strong> tab.</li>
              <li>Click through each file tab (<code>index.tsx</code>, <code>styles.ts</code>, <code>config.json</code>, etc.).</li>
              <li>Use the <strong>⧉ Copy</strong> button to copy the file content.</li>
              <li>Create the matching file in your local <code>src/components/Pega_Extensions_ComponentName/</code> folder and paste.</li>
            </ol>
          </AnalogyCard>
        </StepSection>

        {/* ══════ STEP 6: VALIDATE & TEST ══════ */}
        <StepSection
          stepNumber="6"
          title="Validate, Lint & Test"
          subtitle="Make sure your component compiles cleanly before publishing."
          icon="✅"
          id="step-validate"
        >
          <h3 className="guide-sub-heading">Linting (Code Quality Check)</h3>
          <TerminalBlock commands={['npm run lint']} title="VS Code Terminal" badge="Lint" />
          <TerminalBlock commands={['npm run fix']} title="VS Code Terminal" badge="Auto-fix" />

          <h3 className="guide-sub-heading">Unit Tests</h3>
          <TerminalBlock commands={['npm run test']} title="VS Code Terminal" badge="Test" />
          <TerminalBlock commands={['npm run coverage']} title="VS Code Terminal" badge="Coverage" />

          <h3 className="guide-sub-heading">End-to-End Testing with Playwright</h3>
          <TerminalBlock
            commands={[
              'npm run build-storybook',
              'npx playwright install',
              'npx serve -p 6006 storybook-static',
            ]}
            title="Terminal 1 — Build & Serve"
            badge="E2E Setup"
          />
          <TerminalBlock commands={['npm run test-storybook']} title="Terminal 2 — Run Tests" badge="E2E Run" />

          <h3 className="guide-sub-heading">Full Validation</h3>
          <AnalogyCard icon="🏁" title="The Final Checkpoint" variant="success">
            <p>
              This single command runs lint + build validation. If it passes, your component is ready for publishing!
            </p>
          </AnalogyCard>
          <TerminalBlock commands={['npm run validate']} title="VS Code Terminal" badge="✓ Validate" />
        </StepSection>

        {/* ══════ STEP 7: PEGA ACCESS GROUP SETUP ══════ */}
        <StepSection
          stepNumber="7"
          title="Configure Pega Access Group & Roles"
          subtitle="Before publishing, your Pega operator must have the right permissions. Check each item below."
          icon="🔐"
          id="step-access"
        >
          <AnalogyCard icon="🏢" title="Think of this as getting your building security badge" variant="info">
            <p>
              Before you can enter the server room (publish components), you need the right access badges (roles) on your security card (Access Group).
              Without these, the CLI tool will fail with <strong>HTTP 401 or 403 errors</strong>.
            </p>
            <p style={{ marginTop: 8 }}>
              Ask your <strong>Pega System Administrator</strong> to add these to your operator&apos;s Access Group:
            </p>
          </AnalogyCard>

          <AccessGroupChecklist />

          <AnalogyCard icon="📍" title="Where to find this in Pega" variant="info">
            <ol style={{ margin: 0, paddingLeft: 20, lineHeight: 2 }}>
              <li>Log into Pega as an administrator.</li>
              <li>Go to <strong>Dev Studio</strong> → <strong>Records</strong> → <strong>Security</strong> → <strong>Access Group</strong>.</li>
              <li>Open the Access Group your operator uses.</li>
              <li>In the <strong>Available Portals</strong> section, add <code>pxAdminPortal</code> and <code>pxAdminStudio</code>.</li>
              <li>In the <strong>Available Roles</strong> section, add all three roles listed above.</li>
              <li>Save the Access Group.</li>
            </ol>
          </AnalogyCard>
        </StepSection>

        {/* ══════ STEP 8: AUTHENTICATE & PUBLISH ══════ */}
        <StepSection
          stepNumber="8"
          title="Authenticate & Publish to Pega"
          subtitle="Connect to your Pega instance and push your component live."
          icon="🚢"
          id="step-publish"
        >
          <AnalogyCard icon="🔑" title="Step 8a: Configure the keys folder" variant="info">
            <p>
              The Constellation DX Component Builder package provides a <code>keys</code> folder.
              Install this folder in your project root. Then edit <code>tasks.config.json</code> with your:
            </p>
            <ul style={{ margin: '8px 0 0', paddingLeft: 20, lineHeight: 2 }}>
              <li><strong>Ruleset Name</strong> — e.g. <code>MyAppComponents</code></li>
              <li><strong>Ruleset Version</strong> — e.g. <code>01-01-01</code></li>
              <li><strong>Server URL</strong> — your Pega instance URL</li>
              <li><strong>Client ID</strong> — from your OAuth client registration</li>
              <li><strong>User &amp; Password</strong> — your Pega operator credentials</li>
            </ul>
          </AnalogyCard>

          <h3 className="guide-sub-heading">Authenticate</h3>
          <TerminalBlock commands={['npm run authenticate']} title="VS Code Terminal" badge="Auth" />

          <AnalogyCard icon="✅" title="Authentication Successful?" variant="success">
            <p>
              If authentication succeeds, you&apos;ll see a success message with your operator ID.
              If it fails, check your <code>tasks.config.json</code>, ensure your Access Group roles are correct (Step 7),
              and verify your server URL and OAuth client ID.
            </p>
          </AnalogyCard>

          <h3 className="guide-sub-heading">Build All Components</h3>
          <TerminalBlock commands={['npm run buildAllComponents']} title="VS Code Terminal" badge="Build" />

          <h3 className="guide-sub-heading">Publish</h3>
          <TerminalBlock commands={['npm run publishAll']} title="VS Code Terminal" badge="🚀 Publish" />

          <AnalogyCard icon="📦" title="What happens during publishing?" variant="info">
            <p>
              The CLI will ask you to confirm the <strong>Ruleset Name</strong> and <strong>Ruleset Version</strong> you&apos;re publishing to.
              Once confirmed, it uploads your compiled components to your Pega instance.
              They will appear in App Studio&apos;s component library automatically.
            </p>
          </AnalogyCard>
        </StepSection>

        {/* ══════ STEP 9: USE IN APP STUDIO ══════ */}
        <StepSection
          stepNumber="9"
          title="Use Your Component in App Studio"
          subtitle="Your published component is now available in Pega Constellation!"
          icon="🎉"
          id="step-use"
        >
          <AnalogyCard icon="🎊" title="Congratulations!" variant="success">
            <p>
              Your custom DX component is now live in your Pega application!
              Open <strong>App Studio</strong>, navigate to a Case Type or Page,
              and you&apos;ll find your new component in the component picker.
            </p>
          </AnalogyCard>

          <div className="guide-final-steps-grid">
            <div className="guide-final-step-card">
              <span className="guide-final-step-num">1</span>
              <strong>Open App Studio</strong>
              <p>Navigate to your application in Pega and open App Studio.</p>
            </div>
            <div className="guide-final-step-card">
              <span className="guide-final-step-num">2</span>
              <strong>Edit a Case View</strong>
              <p>Open any Case Type and click &quot;Edit&quot; on a View (e.g., Create, Confirm, Details).</p>
            </div>
            <div className="guide-final-step-card">
              <span className="guide-final-step-num">3</span>
              <strong>Add Your Component</strong>
              <p>Click &quot;+ Add&quot; in the view editor, search for your component name, and drag it in.</p>
            </div>
            <div className="guide-final-step-card">
              <span className="guide-final-step-num">4</span>
              <strong>Configure Properties</strong>
              <p>Map case properties, set labels, and configure behavior using the component&apos;s settings panel.</p>
            </div>
          </div>
        </StepSection>

        {/* ══════ STEP 10: TROUBLESHOOTING ══════ */}
        <StepSection
          stepNumber="10"
          title="Troubleshooting & Common Issues"
          subtitle="Solutions to the most frequently encountered problems."
          icon="🔧"
          id="step-troubleshoot"
        >
          <div className="guide-faq-list">
            <details className="guide-faq">
              <summary className="guide-faq-q">
                <span className="guide-faq-icon">❓</span>
                <strong>&quot;Git needs to be installed&quot;</strong> even though Git IS installed
              </summary>
              <div className="guide-faq-a">
                <p>
                  This happens when you downloaded the code as a ZIP instead of using <code>git clone</code>.
                  The <code>.git</code> folder is missing.
                </p>
                <strong>Fix:</strong>
                <TerminalBlock commands={['git init']} title="Fix" badge="Quick Fix" />
              </div>
            </details>

            <details className="guide-faq">
              <summary className="guide-faq-q">
                <span className="guide-faq-icon">❓</span>
                <strong>HTTP 401 / 403 Unauthorized</strong> when running <code>npm run authenticate</code>
              </summary>
              <div className="guide-faq-a">
                <p>Your Pega operator doesn&apos;t have the required roles. Go back to <strong>Step 7</strong> and ensure all five items are checked in your Access Group.</p>
                <p>Also verify that your <code>tasks.config.json</code> has the correct <strong>Server URL</strong>, <strong>Client ID</strong>, <strong>User</strong>, and <strong>Password</strong>.</p>
              </div>
            </details>

            <details className="guide-faq">
              <summary className="guide-faq-q">
                <span className="guide-faq-icon">❓</span>
                <strong>Node version mismatch</strong> — wrong version of Node.js installed
              </summary>
              <div className="guide-faq-a">
                <p>Different Pega versions require different Node.js versions. You selected <strong>{pegaVersion.label}</strong>, which requires <strong>Node {pegaVersion.node}</strong>.</p>
                <p>
                  Install <a href="https://github.com/nvm-sh/nvm" target="_blank" rel="noopener noreferrer">nvm</a> (Node Version Manager) to easily switch between Node versions:
                </p>
                <TerminalBlock commands={[`nvm install ${pegaVersion.node.replace('.x', '')}`, `nvm use ${pegaVersion.node.replace('.x', '')}`]} title="Fix" badge="nvm" />
              </div>
            </details>

            <details className="guide-faq">
              <summary className="guide-faq-q">
                <span className="guide-faq-icon">❓</span>
                <strong>npm run validate fails</strong> with lint errors
              </summary>
              <div className="guide-faq-a">
                <p>Run <code>npm run fix</code> first to auto-fix formatting issues. Then run <code>npm run validate</code> again.</p>
                <p>If errors persist, review the specific error messages — they usually point to exact file and line numbers.</p>
                <TerminalBlock commands={['npm run fix', 'npm run validate']} title="Fix" badge="Lint Fix" />
              </div>
            </details>

            <details className="guide-faq">
              <summary className="guide-faq-q">
                <span className="guide-faq-icon">❓</span>
                <strong>Component not appearing</strong> in App Studio after publishing
              </summary>
              <div className="guide-faq-a">
                <p>Verify the component was published successfully (check CLI output for errors). Then:</p>
                <ol style={{ paddingLeft: 20, lineHeight: 2 }}>
                  <li>Clear your browser cache and reload App Studio.</li>
                  <li>Ensure the ruleset containing your component is included in your application&apos;s ruleset stack.</li>
                  <li>Check that the Ruleset Version matches what you published.</li>
                </ol>
              </div>
            </details>
          </div>

          <AnalogyCard icon="🆘" title="Still stuck?" variant="info">
            <p>
              Check the official Pega documentation at{' '}
              <a href="https://docs.pega.com/bundle/constellation-dx-components/page/constellation-dx-components/custom-components/command-line-references-constellation-dx-components.html" target="_blank" rel="noopener noreferrer">
                docs.pega.com — CLI References
              </a>.
            </p>
          </AnalogyCard>
        </StepSection>

        {/* ══════ FOOTER ══════ */}
        <div className="guide-footer">
          <button className="btn btn-primary btn-large" onClick={onBack}>
            ← Back to Component Hub
          </button>
        </div>
      </div>
    </div>
  )
}
