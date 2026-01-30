import React, { useState, useRef, useEffect } from 'react';
import ChatPanel from './ChatPanel';

const AgentCommandCenter = () => {
  const [currentView, setCurrentView] = useState('command-center');
  const [selectedProject, setSelectedProject] = useState(null);
  const [selectedAgent, setSelectedAgent] = useState(null);
  const [selectedTool, setSelectedTool] = useState(null);

  // Accessibility: Focus management
  const mainHeadingRef = useRef(null);

  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

  // Loading states for async operations
  const [loadingStates, setLoadingStates] = useState({});

  // Confirmation dialog state
  const [confirmDialog, setConfirmDialog] = useState(null);

  // Toast notification state
  const [toast, setToast] = useState(null);

  // Project Wizard State
  const [wizardStep, setWizardStep] = useState(1);
  const [wizardMode, setWizardMode] = useState('guided'); // 'guided' or 'advanced'
  const [newProject, setNewProject] = useState({
    name: '',
    goal: '',
    template: null,
    status: 'draft',
    agents: [],
    sops: [],
    tools: [],
    people: [],
    workflow: {
      nodes: [],
      connections: [],
      triggers: []
    }
  });

  // Project Dashboard State
  const [dashboardView, setDashboardView] = useState('flowchart'); // 'flowchart', 'timeline', 'kanban'
  const [editProject, setEditProject] = useState(null);
  const [editTab, setEditTab] = useState('overview');

  // Focus management on view changes
  useEffect(() => {
    if (mainHeadingRef.current) {
      mainHeadingRef.current.focus();
    }
  }, [currentView]);

  // Helper to set loading state
  const setLoading = (key, value) => {
    setLoadingStates(prev => ({ ...prev, [key]: value }));
  };

  // Helper to show toast
  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  // Search handler
  const handleSearch = (query) => {
    setSearchQuery(query);
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }
    setIsSearching(true);
    // Simulate search
    setTimeout(() => {
      const results = [
        ...allTeamMembers.agents.filter(a => a.name.toLowerCase().includes(query.toLowerCase())),
        ...projects.filter(p => p.name.toLowerCase().includes(query.toLowerCase())),
      ].slice(0, 5);
      setSearchResults(results);
      setIsSearching(false);
    }, 200);
  };

  // Sample data
  const stats = { active: 8, pending: 3, errors: 1, completed: 47 };
  
  const projects = [
    { id: 1, name: 'Sales Ops', agents: 3, humans: 2, active: 2 },
    { id: 2, name: 'Finance', agents: 2, humans: 1, active: 1 },
    { id: 3, name: 'HR Onboarding', agents: 2, humans: 2, active: 0 },
  ];

  const inboxItems = [
    { id: 1, type: 'approval', title: 'Send outreach to Acme Corp', agent: 'Outreach Sender', project: 'Sales Ops', time: '5m ago', reason: 'External email requires approval' },
    { id: 2, type: 'handoff', title: 'Qualified lead needs pricing review', agent: 'Lead Qualifier', project: 'Sales Ops', time: '12m ago', reason: 'Custom pricing required' },
    { id: 3, type: 'error', title: 'Invoice processing failed', agent: 'Invoice Processor', project: 'Finance', time: '1h ago', reason: 'Missing vendor information' },
  ];

  const allTeamMembers = {
    agents: [
      { id: 1, name: 'Lead Qualifier', status: 'active', autonomy: 'assisted', approvalRate: 94, tasksCompleted: 47, project: 'Sales Ops' },
      { id: 2, name: 'Pipeline Tracker', status: 'idle', autonomy: 'supervised', approvalRate: 87, tasksCompleted: 23, project: 'Sales Ops' },
      { id: 3, name: 'Outreach Sender', status: 'active', autonomy: 'autonomous', approvalRate: 98, tasksCompleted: 156, project: 'Sales Ops' },
      { id: 4, name: 'Invoice Processor', status: 'error', autonomy: 'assisted', approvalRate: 91, tasksCompleted: 89, project: 'Finance' },
      { id: 5, name: 'Expense Auditor', status: 'idle', autonomy: 'supervised', approvalRate: 85, tasksCompleted: 34, project: 'Finance' },
      { id: 6, name: 'Onboarding Guide', status: 'idle', autonomy: 'assisted', approvalRate: 96, tasksCompleted: 12, project: 'HR Onboarding' },
      { id: 7, name: 'Document Collector', status: 'idle', autonomy: 'supervised', approvalRate: 88, tasksCompleted: 18, project: 'HR Onboarding' },
    ],
    humans: [
      { id: 1, name: 'Jamie Chen', role: 'Sales Lead', project: 'Sales Ops', tasksCompleted: 34, avatar: 'JC' },
      { id: 2, name: 'Morgan Torres', role: 'SDR Manager', project: 'Sales Ops', tasksCompleted: 28, avatar: 'MT' },
      { id: 3, name: 'Alex Kim', role: 'Finance Manager', project: 'Finance', tasksCompleted: 45, avatar: 'AK' },
      { id: 4, name: 'Sam Rivera', role: 'HR Coordinator', project: 'HR Onboarding', tasksCompleted: 22, avatar: 'SR' },
      { id: 5, name: 'Jordan Lee', role: 'HR Specialist', project: 'HR Onboarding', tasksCompleted: 19, avatar: 'JL' },
    ]
  };

  const tools = [
    { id: 1, name: 'Google Workspace', icon: '📧', status: 'connected', description: 'Gmail, Docs, Sheets, Calendar', lastSync: '2 min ago', usedBy: 5 },
    { id: 2, name: 'Salesforce', icon: '☁️', status: 'connected', description: 'CRM and sales data', lastSync: '5 min ago', usedBy: 3 },
    { id: 3, name: 'Slack', icon: '💬', status: 'connected', description: 'Team messaging', lastSync: '1 min ago', usedBy: 4 },
    { id: 4, name: 'QuickBooks', icon: '📊', status: 'connected', description: 'Accounting and invoicing', lastSync: '15 min ago', usedBy: 2 },
    { id: 5, name: 'Notion', icon: '📝', status: 'disconnected', description: 'Documentation and wikis', lastSync: null, usedBy: 0 },
    { id: 6, name: 'HubSpot', icon: '🎯', status: 'disconnected', description: 'Marketing automation', lastSync: null, usedBy: 0 },
  ];

  const availableTools = [
    { id: 'google', name: 'Google Workspace', icon: '📧', category: 'Productivity', description: 'Connect Gmail, Google Docs, Sheets, and Calendar for document creation, email automation, and scheduling.' },
    { id: 'microsoft', name: 'Microsoft 365', icon: '🪟', category: 'Productivity', description: 'Connect Outlook, Word, Excel, and Teams for document creation and communication.' },
    { id: 'salesforce', name: 'Salesforce', icon: '☁️', category: 'CRM', description: 'Access customer data, manage leads, update opportunities, and automate sales workflows.' },
    { id: 'hubspot', name: 'HubSpot', icon: '🎯', category: 'CRM', description: 'Marketing automation, contact management, and sales pipeline tracking.' },
    { id: 'slack', name: 'Slack', icon: '💬', category: 'Communication', description: 'Send messages, create channels, post updates, and integrate with workflows.' },
    { id: 'notion', name: 'Notion', icon: '📝', category: 'Productivity', description: 'Create and update documentation, manage databases, and organize team knowledge.' },
    { id: 'quickbooks', name: 'QuickBooks', icon: '📊', category: 'Finance', description: 'Process invoices, track expenses, manage accounts payable and receivable.' },
    { id: 'stripe', name: 'Stripe', icon: '💳', category: 'Finance', description: 'Process payments, manage subscriptions, and handle billing automation.' },
    { id: 'zendesk', name: 'Zendesk', icon: '🎧', category: 'Support', description: 'Manage support tickets, automate responses, and track customer issues.' },
    { id: 'jira', name: 'Jira', icon: '📋', category: 'Project Management', description: 'Create and update issues, manage sprints, and track project progress.' },
    { id: 'github', name: 'GitHub', icon: '🐙', category: 'Development', description: 'Manage repositories, create issues, review pull requests, and automate workflows.' },
    { id: 'airtable', name: 'Airtable', icon: '📑', category: 'Database', description: 'Create and manage databases, automate data workflows, and sync records.' },
  ];

  // Project Templates
  const projectTemplates = [
    { id: 'sales-pipeline', name: 'Sales Pipeline', icon: '📈', description: 'Qualify leads, track opportunities, and automate outreach' },
    { id: 'invoice-processing', name: 'Invoice Processing', icon: '📄', description: 'Extract data, validate, and process invoices automatically' },
    { id: 'customer-support', name: 'Customer Support', icon: '💬', description: 'Triage tickets, generate responses, and escalate issues' },
    { id: 'hr-onboarding', name: 'HR Onboarding', icon: '👋', description: 'Coordinate new hire paperwork and orientation tasks' },
  ];

  // Standard Operating Procedures Library
  const sopLibrary = [
    { id: 1, name: 'Lead Qualification', description: 'Score and qualify incoming leads based on fit criteria', steps: 5, usedBy: 2, category: 'Sales' },
    { id: 2, name: 'Email Outreach', description: 'Send personalized outreach emails with approval workflow', steps: 4, usedBy: 1, category: 'Sales' },
    { id: 3, name: 'Invoice Data Extraction', description: 'Extract key fields from invoice documents', steps: 3, usedBy: 1, category: 'Finance' },
    { id: 4, name: 'Expense Validation', description: 'Validate expense reports against company policy', steps: 6, usedBy: 1, category: 'Finance' },
    { id: 5, name: 'Document Collection', description: 'Request and track required documents from new hires', steps: 4, usedBy: 1, category: 'HR' },
    { id: 6, name: 'Ticket Triage', description: 'Categorize and route support tickets to appropriate team', steps: 3, usedBy: 0, category: 'Support' },
  ];

  const scheduleItems = [
    { id: 1, time: '09:00', agent: 'Lead Qualifier', task: 'Morning lead batch processing', project: 'Sales Ops', type: 'recurring', days: ['M', 'T', 'W', 'Th', 'F'] },
    { id: 2, time: '09:30', agent: 'Pipeline Tracker', task: 'Daily pipeline sync', project: 'Sales Ops', type: 'recurring', days: ['M', 'T', 'W', 'Th', 'F'] },
    { id: 3, time: '10:00', agent: 'Invoice Processor', task: 'Process pending invoices', project: 'Finance', type: 'recurring', days: ['M', 'W', 'F'] },
    { id: 4, time: '14:00', agent: 'Outreach Sender', task: 'Afternoon email batch', project: 'Sales Ops', type: 'recurring', days: ['M', 'T', 'W', 'Th', 'F'] },
    { id: 5, time: '16:00', agent: 'Expense Auditor', task: 'Weekly expense review', project: 'Finance', type: 'recurring', days: ['F'] },
    { id: 6, time: '17:00', agent: 'Pipeline Tracker', task: 'End of day summary', project: 'Sales Ops', type: 'recurring', days: ['M', 'T', 'W', 'Th', 'F'] },
  ];

  const activityLog = [
    { time: '9:04am', type: 'handoff', text: 'Lead Qualifier → Jamie Chen', detail: 'Requires human judgment on pricing', project: 'Sales Ops' },
    { time: '9:03am', type: 'action', text: 'Lead Qualifier generated qualification summary', project: 'Sales Ops' },
    { time: '9:02am', type: 'action', text: 'Lead Qualifier scored lead: 72/100 (qualified)', project: 'Sales Ops' },
    { time: '9:00am', type: 'start', text: 'Lead Qualifier started processing Acme Corp', project: 'Sales Ops' },
    { time: '8:55am', type: 'error', text: 'Invoice Processor failed: Missing vendor info', project: 'Finance' },
    { time: '8:45am', type: 'complete', text: 'Outreach Sender completed batch of 12 emails', project: 'Sales Ops' },
    { time: '8:30am', type: 'approval', text: 'Morgan Torres approved outreach sequence', project: 'Sales Ops' },
    { time: '8:15am', type: 'start', text: 'Expense Auditor began weekly review', project: 'Finance' },
    { time: '8:00am', type: 'complete', text: 'Pipeline Tracker completed daily sync', project: 'Sales Ops' },
    { time: '7:45am', type: 'action', text: 'Document Collector sent reminder to new hire', project: 'HR Onboarding' },
  ];

  const projectTeam = {
    agents: [
      { id: 1, name: 'Lead Qualifier', status: 'active', autonomy: 'assisted', approvalRate: 94, tasksCompleted: 47 },
      { id: 2, name: 'Pipeline Tracker', status: 'idle', autonomy: 'supervised', approvalRate: 87, tasksCompleted: 23 },
      { id: 3, name: 'Outreach Sender', status: 'active', autonomy: 'autonomous', approvalRate: 98, tasksCompleted: 156 },
    ],
    humans: [
      { id: 1, name: 'Jamie Chen', role: 'Sales Lead' },
      { id: 2, name: 'Morgan Torres', role: 'SDR Manager' },
    ]
  };

  const StatusBadge = ({ status }) => {
    const config = {
      active: { color: 'bg-sage', label: 'Active' },
      idle: { color: 'bg-muted', label: 'Idle' },
      error: { color: 'bg-red-600', label: 'Error' },
      pending: { color: 'bg-amber', label: 'Pending' },
      connected: { color: 'bg-sage', label: 'Connected' },
      disconnected: { color: 'bg-border', label: 'Disconnected' }
    };
    const { color, label } = config[status] || config.idle;
    return (
      <span
        className={`inline-block w-2 h-2 rounded-full ${color}`}
        role="status"
        aria-label={label}
      />
    );
  };

  const AutonomyIndicator = ({ level }) => {
    const config = {
      supervised: { label: 'Supervised', fill: 1, color: 'text-amber', description: '1 of 3 autonomy level' },
      assisted: { label: 'Assisted', fill: 2, color: 'text-teal', description: '2 of 3 autonomy level' },
      autonomous: { label: 'Autonomous', fill: 3, color: 'text-sage', description: '3 of 3 autonomy level' }
    };
    const { label, fill, color, description } = config[level] || config.supervised;
    return (
      <div
        className={`flex items-center gap-1.5 text-xs ${color}`}
        role="meter"
        aria-label={`Autonomy level: ${label}`}
        aria-valuenow={fill}
        aria-valuemin={1}
        aria-valuemax={3}
        aria-valuetext={description}
      >
        <div className="flex gap-0.5" aria-hidden="true">
          {[1,2,3].map(i => (
            <div key={i} className={`w-1.5 h-3 rounded-sm ${i <= fill ? 'bg-current' : 'bg-border-light'}`} />
          ))}
        </div>
        <span>{label}</span>
      </div>
    );
  };

  const TypeBadge = ({ type }) => {
    const config = {
      approval: { label: 'Approval', bg: 'bg-teal-tint', text: 'text-teal-dark', border: 'border-teal/30' },
      handoff: { label: 'Handoff', bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200' },
      error: { label: 'Error', bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200' },
      review: { label: 'Review', bg: 'bg-amber-light/20', text: 'text-amber', border: 'border-amber/30' },
    };
    const { label, bg, text, border } = config[type] || config.approval;
    return (
      <span className={`px-2 py-0.5 text-xs font-medium rounded border ${bg} ${text} ${border}`}>
        {label}
      </span>
    );
  };

  // Wizard Progress Component
  const WizardProgress = ({ currentStep, totalSteps = 7 }) => {
    const steps = [
      { num: 1, label: 'Basics' },
      { num: 2, label: 'Agents' },
      { num: 3, label: 'SOPs' },
      { num: 4, label: 'Tools' },
      { num: 5, label: 'People' },
      { num: 6, label: 'Workflow' },
      { num: 7, label: 'Review' },
    ];

    return (
      <nav aria-label="Project setup progress" className="mb-8">
        <ol className="flex items-center justify-between">
          {steps.map((step, i) => {
            const isCompleted = currentStep > step.num;
            const isCurrent = currentStep === step.num;
            return (
              <li key={step.num} className="flex items-center">
                <button
                  onClick={() => isCompleted && setWizardStep(step.num)}
                  disabled={!isCompleted}
                  className={`flex flex-col items-center ${isCompleted ? 'cursor-pointer' : 'cursor-default'}`}
                  aria-current={isCurrent ? 'step' : undefined}
                >
                  <span
                    className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
                      isCompleted
                        ? 'bg-sage text-white'
                        : isCurrent
                        ? 'bg-teal text-white'
                        : 'bg-border-light text-muted'
                    }`}
                  >
                    {isCompleted ? (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    ) : (
                      step.num
                    )}
                  </span>
                  <span className={`mt-2 text-xs font-medium ${isCurrent ? 'text-teal' : 'text-muted'}`}>
                    {step.label}
                  </span>
                </button>
                {i < steps.length - 1 && (
                  <div
                    className={`w-full h-0.5 mx-2 ${
                      currentStep > step.num ? 'bg-sage' : 'bg-border-light'
                    }`}
                    style={{ minWidth: '40px' }}
                    aria-hidden="true"
                  />
                )}
              </li>
            );
          })}
        </ol>
      </nav>
    );
  };

  // SOP Card Component
  const SOPCard = ({ sop, selected, onToggle }) => (
    <div
      onClick={() => onToggle(sop.id)}
      className={`p-4 rounded-xl border cursor-pointer transition-all ${
        selected
          ? 'border-teal bg-teal-tint ring-2 ring-teal/20'
          : 'border-border-light bg-white hover:border-border'
      }`}
    >
      <div className="flex items-start justify-between mb-2">
        <span className="text-sm font-medium text-charcoal">{sop.name}</span>
        <span className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
          selected ? 'border-teal bg-teal' : 'border-border'
        }`}>
          {selected && (
            <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          )}
        </span>
      </div>
      <p className="text-xs text-muted mb-2">{sop.description}</p>
      <div className="flex items-center gap-3 text-xs text-muted">
        <span>{sop.steps} steps</span>
        <span className="px-1.5 py-0.5 bg-cream rounded">{sop.category}</span>
      </div>
    </div>
  );

  // Workflow Node Component
  const WorkflowNode = ({ node, selected, onSelect, onDrag }) => {
    const typeConfig = {
      agent: { bg: 'bg-teal-tint', border: 'border-teal/50', icon: '🤖' },
      person: { bg: 'bg-purple-50', border: 'border-purple-200', icon: '👤' },
      decision: { bg: 'bg-amber-light/20', border: 'border-amber/50', icon: '◇' },
      start: { bg: 'bg-sage-tint', border: 'border-sage/50', icon: '▶' },
      end: { bg: 'bg-cream', border: 'border-border', icon: '■' },
    };
    const config = typeConfig[node.type] || typeConfig.agent;

    return (
      <div
        className={`absolute p-3 rounded-xl border-2 cursor-move transition-shadow ${config.bg} ${config.border} ${
          selected ? 'ring-2 ring-teal shadow-soft-md' : 'hover:shadow-soft'
        }`}
        style={{ left: node.position.x, top: node.position.y, minWidth: '120px' }}
        onClick={() => onSelect(node.id)}
        draggable
        onDragStart={(e) => onDrag(e, node.id)}
      >
        <div className="flex items-center gap-2">
          <span className="text-lg">{config.icon}</span>
          <span className="text-sm font-medium text-charcoal">{node.name || node.type}</span>
        </div>
        {node.description && (
          <p className="text-xs text-muted mt-1">{node.description}</p>
        )}
      </div>
    );
  };

  // Connection Line Component (SVG path between nodes)
  const ConnectionLine = ({ from, to, selected }) => {
    const fromX = from.x + 60;
    const fromY = from.y + 25;
    const toX = to.x + 60;
    const toY = to.y + 25;
    const midX = (fromX + toX) / 2;

    const path = `M ${fromX} ${fromY} C ${midX} ${fromY}, ${midX} ${toY}, ${toX} ${toY}`;

    return (
      <path
        d={path}
        fill="none"
        stroke={selected ? '#008b8b' : '#d4cfc4'}
        strokeWidth={selected ? 3 : 2}
        markerEnd="url(#arrowhead)"
        className="transition-colors"
      />
    );
  };

  // Header Component
  const Header = () => (
    <header className="h-14 bg-cream-darker border-b border-border flex items-center justify-between px-4" role="banner">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 bg-gradient-to-br from-sage to-teal rounded-lg flex items-center justify-center">
          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        </div>
        <span className="text-charcoal font-semibold tracking-tight">AgentOS</span>
      </div>

      <div className="flex items-center gap-6">
        <div className="flex items-center gap-4">
          <MetricPill label="Active" value={stats.active} color="sage" />
          <MetricPill label="Pending" value={stats.pending} color="amber" />
          <MetricPill label="Errors" value={stats.errors} color="red" />
          <MetricPill label="Completed" value={stats.completed} color="muted" />
        </div>

        <div className="relative">
          <label className="sr-only" htmlFor="global-search">Search agents and tasks</label>
          <input
            id="global-search"
            type="text"
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            placeholder="Search agents, tasks..."
            aria-label="Search agents and tasks"
            aria-expanded={searchResults.length > 0 || isSearching}
            aria-controls="search-results"
            className="w-64 h-8 bg-white border border-border rounded-lg px-3 pr-8 text-sm text-charcoal placeholder-muted focus:outline-none focus:border-teal"
          />
          <svg className="w-4 h-4 text-muted absolute right-3 top-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>

          {searchQuery && (
            <div
              id="search-results"
              role="listbox"
              aria-label="Search results"
              className="absolute top-full mt-2 w-80 bg-white rounded-lg shadow-soft-md border border-border-light z-50"
            >
              {isSearching ? (
                <div className="p-4 text-center text-muted">Searching...</div>
              ) : searchResults.length > 0 ? (
                searchResults.map((result, i) => (
                  <button
                    key={result.id || i}
                    role="option"
                    onClick={() => {
                      if (result.agents !== undefined) {
                        setSelectedProject(result);
                        setCurrentView('project-dashboard');
                      } else {
                        setSelectedAgent(result);
                        setCurrentView('agent-detail');
                      }
                      setSearchQuery('');
                      setSearchResults([]);
                    }}
                    className="w-full p-3 text-left hover:bg-cream cursor-pointer flex items-center gap-3 border-b border-border-light last:border-b-0"
                  >
                    <span className="text-lg">{result.agents !== undefined ? '📁' : '🤖'}</span>
                    <span className="text-sm text-charcoal">{result.name}</span>
                  </button>
                ))
              ) : (
                <div className="p-4 text-center text-muted">
                  No results for "{searchQuery}"
                </div>
              )}
            </div>
          )}
        </div>

        {/* Quick Action Button */}
        <div className="relative group">
          <button
            aria-label="Quick actions menu"
            aria-haspopup="menu"
            className="w-8 h-8 bg-sage rounded-lg flex items-center justify-center text-white font-bold hover:bg-sage-dark focus:outline-none focus:ring-2 focus:ring-sage focus:ring-offset-2 focus:ring-offset-cream-dark"
          >
            <span aria-hidden="true">+</span>
          </button>
          <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-lg shadow-soft-md border border-border-light z-50 hidden group-hover:block">
            <div className="py-1">
              <button
                onClick={() => {
                  setWizardStep(1);
                  setNewProject({
                    name: '',
                    goal: '',
                    template: null,
                    status: 'draft',
                    agents: [],
                    sops: [],
                    tools: [],
                    people: [],
                    workflow: { nodes: [], connections: [], triggers: [] }
                  });
                  setCurrentView('project-wizard');
                }}
                className="w-full px-4 py-2 text-left text-sm text-charcoal hover:bg-cream flex items-center gap-2"
              >
                <span>📁</span> New Project
              </button>
              <button
                className="w-full px-4 py-2 text-left text-sm text-charcoal hover:bg-cream flex items-center gap-2"
              >
                <span>🤖</span> New Agent
              </button>
              <button
                onClick={() => setCurrentView('tools-add')}
                className="w-full px-4 py-2 text-left text-sm text-charcoal hover:bg-cream flex items-center gap-2"
              >
                <span>🔧</span> Connect Tool
              </button>
            </div>
          </div>
        </div>

        <button
          aria-label="User menu for John Doe"
          aria-haspopup="menu"
          className="w-8 h-8 bg-muted rounded-full flex items-center justify-center text-cream text-sm font-medium hover:bg-charcoal-light focus:outline-none focus:ring-2 focus:ring-teal focus:ring-offset-2 focus:ring-offset-charcoal"
        >
          <span aria-hidden="true">JD</span>
        </button>
      </div>
    </header>
  );

  const MetricPill = ({ label, value, color }) => {
    const colors = {
      sage: 'bg-sage text-white',
      amber: 'bg-amber text-white',
      red: 'bg-red-600 text-white',
      muted: 'bg-charcoal text-white'
    };
    return (
      <div className={`px-2.5 py-1 rounded-md text-xs font-medium ${colors[color]}`}>
        <span className="opacity-80">{label}</span> <span className="ml-1">{value}</span>
      </div>
    );
  };

  // Sidebar Component
  const Sidebar = () => (
    <aside className="w-56 bg-cream border-r border-border-light flex flex-col overflow-y-auto shadow-soft-lg z-10 relative">
      <nav className="p-3 space-y-1" aria-label="Main navigation">
        <SidebarItem
          icon="◉"
          label="Command Center"
          active={currentView === 'command-center'}
          onClick={() => { setCurrentView('command-center'); setSelectedProject(null); setSelectedAgent(null); }}
        />
        <SidebarItem
          icon="📬"
          label="Inbox"
          badge={stats.pending}
          active={currentView === 'inbox'}
          onClick={() => { setCurrentView('inbox'); setSelectedProject(null); setSelectedAgent(null); }}
        />
      </nav>

      <div className="px-3 pt-4">
        <h2 className="text-xs font-semibold text-muted uppercase tracking-wider mb-2">Projects</h2>
        <div className="space-y-0.5">
          {projects.map(project => (
            <button
              key={project.id}
              onClick={() => { setSelectedProject(project); setCurrentView('project-dashboard'); setSelectedAgent(null); }}
              className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-md text-sm transition-colors ${
                selectedProject?.id === project.id && (currentView === 'project-dashboard' || currentView === 'project-edit')
                  ? 'bg-cream-dark text-charcoal font-medium'
                  : 'text-charcoal-light hover:bg-cream-dark/50'
              }`}
            >
              <span>{project.name}</span>
              {project.active > 0 && (
                <span className="flex items-center gap-1 text-xs text-sage">
                  <StatusBadge status="active" />
                  {project.active}
                </span>
              )}
            </button>
          ))}
        </div>
        <button
          onClick={() => {
            setWizardStep(1);
            setNewProject({
              name: '',
              goal: '',
              template: null,
              status: 'draft',
              agents: [],
              sops: [],
              tools: [],
              people: [],
              workflow: { nodes: [], connections: [], triggers: [] }
            });
            setCurrentView('project-wizard');
          }}
          className="w-full mt-2 px-2.5 py-1.5 text-sm text-muted hover:text-charcoal text-left flex items-center gap-1.5"
        >
          <span className="text-lg leading-none">+</span> New Project
        </button>
      </div>

      <div className="px-3 pt-6">
        <h2 className="text-xs font-semibold text-muted uppercase tracking-wider mb-2">Operations</h2>
        <div className="space-y-0.5">
          <SidebarItem
            icon="📅"
            label="Schedule"
            active={currentView === 'schedule'}
            onClick={() => { setCurrentView('schedule'); setSelectedProject(null); }}
          />
          <SidebarItem
            icon="👥"
            label="Team"
            active={currentView === 'team'}
            onClick={() => { setCurrentView('team'); setSelectedProject(null); }}
          />
          <SidebarItem
            icon="📜"
            label="Activity"
            active={currentView === 'activity'}
            onClick={() => { setCurrentView('activity'); setSelectedProject(null); }}
          />
          <SidebarItem
            icon="🔔"
            label="Alerts"
            active={currentView === 'alerts'}
            onClick={() => { setCurrentView('alerts'); setSelectedProject(null); }}
          />
        </div>
      </div>

      <div className="px-3 pt-6">
        <h2 className="text-xs font-semibold text-muted uppercase tracking-wider mb-2">Analytics</h2>
        <div className="space-y-0.5">
          <SidebarItem
            icon="📊"
            label="Performance"
            active={currentView === 'analytics-performance'}
            onClick={() => { setCurrentView('analytics-performance'); setSelectedProject(null); }}
          />
          <SidebarItem
            icon="💰"
            label="Cost & Efficiency"
            active={currentView === 'analytics-cost'}
            onClick={() => { setCurrentView('analytics-cost'); setSelectedProject(null); }}
          />
          <SidebarItem
            icon="✅"
            label="Quality Metrics"
            active={currentView === 'analytics-quality'}
            onClick={() => { setCurrentView('analytics-quality'); setSelectedProject(null); }}
          />
          <SidebarItem
            icon="⚖️"
            label="Comparisons"
            active={currentView === 'analytics-compare'}
            onClick={() => { setCurrentView('analytics-compare'); setSelectedProject(null); }}
          />
        </div>
      </div>

      <div className="px-3 pt-6">
        <h2 className="text-xs font-semibold text-muted uppercase tracking-wider mb-2">Settings</h2>
        <div className="space-y-0.5">
          <SidebarItem
            icon="🔌"
            label="Connected Tools"
            active={currentView === 'tools'}
            onClick={() => { setCurrentView('tools'); setSelectedProject(null); setSelectedTool(null); }}
          />
          <SidebarItem
            icon="🎯"
            label="SLAs & Thresholds"
            active={currentView === 'settings-sla'}
            onClick={() => { setCurrentView('settings-sla'); setSelectedProject(null); }}
          />
          <SidebarItem
            icon="📤"
            label="Export & Integrations"
            active={currentView === 'settings-export'}
            onClick={() => { setCurrentView('settings-export'); setSelectedProject(null); }}
          />
        </div>
      </div>

      <div className="mt-auto p-3 border-t border-border-light">
        <button className="w-full py-2 px-3 bg-sage text-white text-sm font-medium rounded-lg hover:bg-sage-dark transition-colors flex items-center justify-center gap-2">
          <span className="text-lg">+</span> Create Agent
        </button>
      </div>
    </aside>
  );

  const SidebarItem = ({ icon, label, badge, active, onClick }) => (
    <button
      onClick={onClick}
      className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-md text-sm transition-colors ${
        active ? 'bg-cream-dark text-charcoal font-medium' : 'text-charcoal-light hover:bg-cream-dark/50'
      }`}
    >
      <span className="flex items-center gap-2">
        <span className="opacity-70">{icon}</span>
        {label}
      </span>
      {badge && (
        <span className="px-1.5 py-0.5 bg-amber-light/20 text-amber text-xs font-medium rounded">
          {badge}
        </span>
      )}
    </button>
  );

  // Command Center View
  const CommandCenterView = () => (
    <div className="flex-1 p-6 overflow-auto bg-cream-light">
      <div className="max-w-5xl">
        <h1 ref={mainHeadingRef} tabIndex={-1} className="text-2xl font-semibold text-charcoal mb-6 outline-none">Command Center</h1>

        {/* Alert Banner */}
        <div
          className="mb-4 bg-amber-light/10 border border-amber/30 rounded-lg p-3 flex items-center justify-between"
          role="alert"
          aria-live="polite"
        >
          <div className="flex items-center gap-3">
            <span className="text-amber text-lg">⚠️</span>
            <div>
              <span className="font-medium text-amber">2 agents below SLA threshold</span>
              <span className="text-charcoal-light text-sm ml-2">Invoice Processor error rate at 18%, Pipeline Tracker approval rate at 82%</span>
            </div>
          </div>
          <button
            onClick={() => setCurrentView('alerts')}
            className="text-sm font-medium text-teal hover:text-teal-dark whitespace-nowrap"
          >
            View Alerts →
          </button>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-4">
          <div className="bg-white rounded-xl border border-border-light p-4 shadow-soft">
            <div className="text-sm text-muted mb-1">Active Now</div>
            <div className="flex items-end justify-between">
              <div className="text-3xl font-semibold text-charcoal">{stats.active}</div>
              {/* Sparkline */}
              <svg className="w-16 h-8" viewBox="0 0 64 32" aria-hidden="true">
                <polyline
                  fill="none"
                  stroke="#6b9b37"
                  strokeWidth="2"
                  points="0,24 10,20 20,22 30,16 40,18 50,12 64,8"
                />
              </svg>
            </div>
            <div className="text-xs text-sage mt-1">↑ 2 from yesterday</div>
          </div>
          <div className="bg-white rounded-xl border border-border-light p-4 shadow-soft">
            <div className="text-sm text-muted mb-1">Completed Today</div>
            <div className="flex items-end justify-between">
              <div className="text-3xl font-semibold text-charcoal">{stats.completed}</div>
              {/* Sparkline */}
              <svg className="w-16 h-8" viewBox="0 0 64 32" aria-hidden="true">
                <polyline
                  fill="none"
                  stroke="#008b8b"
                  strokeWidth="2"
                  points="0,28 10,24 20,20 30,22 40,16 50,12 64,10"
                />
              </svg>
            </div>
            <div className="text-xs text-muted mt-1">23 by agents · 24 by humans</div>
          </div>
          <div className="bg-white rounded-xl border border-border-light p-4 shadow-soft">
            <div className="text-sm text-muted mb-1">Intervention Rate</div>
            <div className="flex items-end justify-between">
              <div className="text-3xl font-semibold text-charcoal">12%</div>
              {/* Sparkline */}
              <svg className="w-16 h-8" viewBox="0 0 64 32" aria-hidden="true">
                <polyline
                  fill="none"
                  stroke="#6b9b37"
                  strokeWidth="2"
                  points="0,8 10,12 20,10 30,14 40,16 50,20 64,24"
                />
              </svg>
            </div>
            <div className="text-xs text-sage mt-1">↓ 3% from last week</div>
          </div>
        </div>

        {/* Secondary metrics row */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-xl border border-border-light p-4 shadow-soft">
            <div className="text-sm text-muted mb-1">Cost Today</div>
            <div className="text-2xl font-semibold text-charcoal">$45.20</div>
            <div className="text-xs text-muted mt-1">Avg $0.42/task</div>
          </div>
          <div className="bg-white rounded-xl border border-border-light p-4 shadow-soft">
            <div className="text-sm text-muted mb-1">Quality Score</div>
            <div className="text-2xl font-semibold text-sage">94%</div>
            <div className="text-xs text-muted mt-1">First-time accuracy</div>
          </div>
          <div className="bg-white rounded-xl border border-border-light p-4 shadow-soft">
            <div className="text-sm text-muted mb-1">Time Saved</div>
            <div className="text-2xl font-semibold text-teal">+47h</div>
            <div className="text-xs text-muted mt-1">≈ $2,350 value this week</div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6">
          <div className="bg-white rounded-xl border border-border-light shadow-soft">
            <div className="px-4 py-3 border-b border-border-light flex items-center justify-between">
              <h2 className="font-medium text-charcoal">Needs Attention</h2>
              <button 
                onClick={() => setCurrentView('inbox')}
                className="text-sm text-teal hover:text-teal-dark"
              >
                View all →
              </button>
            </div>
            <div className="divide-y divide-border-light">
              {inboxItems.slice(0, 3).map(item => (
                <div key={item.id} className="px-4 py-3 hover:bg-cream cursor-pointer">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <TypeBadge type={item.type} />
                        <span className="text-xs text-muted">{item.time}</span>
                      </div>
                      <div className="text-sm font-medium text-charcoal truncate">{item.title}</div>
                      <div className="text-xs text-muted">{item.agent} · {item.project}</div>
                    </div>
                    <button className="px-2.5 py-1 text-xs font-medium text-teal bg-teal-tint rounded-md hover:bg-teal-tint">
                      Review Request
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-xl border border-border-light shadow-soft">
            <div className="px-4 py-3 border-b border-border-light">
              <h2 className="font-medium text-charcoal">Currently Running</h2>
            </div>
            <div className="divide-y divide-border-light">
              {[
                { name: 'Lead Qualifier', task: 'Processing Acme Corp lead', progress: 65 },
                { name: 'Outreach Sender', task: 'Sending batch emails', progress: 40 },
                { name: 'Invoice Processor', task: 'Extracting invoice data', progress: 80 },
              ].map((item, i) => (
                <div key={i} className="px-4 py-3">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <StatusBadge status="active" />
                      <span className="text-sm font-medium text-charcoal">{item.name}</span>
                    </div>
                    <span className="text-xs text-muted">{item.progress}%</span>
                  </div>
                  <div className="text-xs text-muted mb-2">{item.task}</div>
                  <div
                    className="h-1.5 bg-cream-dark rounded-full overflow-hidden"
                    role="progressbar"
                    aria-valuenow={item.progress}
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-label={`${item.name}: ${item.progress}% complete`}
                  >
                    <div
                      className="h-full bg-teal rounded-full transition-all duration-500"
                      style={{ width: `${item.progress}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-6 bg-white rounded-xl border border-border-light shadow-soft">
          <div className="px-4 py-3 border-b border-border-light flex items-center justify-between">
            <h2 className="font-medium text-charcoal">Upcoming Schedule</h2>
            <button onClick={() => setCurrentView('schedule')} className="text-sm text-teal hover:text-teal-dark">View calendar →</button>
          </div>
          <div className="divide-y divide-border-light">
            {[
              { time: 'In 30 min', agent: 'Pipeline Tracker', task: 'Daily pipeline sync', project: 'Sales Ops' },
              { time: 'In 2 hours', agent: 'Report Generator', task: 'Weekly finance summary', project: 'Finance' },
              { time: 'Tomorrow 9am', agent: 'Onboarding Bot', task: 'New hire orientation prep', project: 'HR Onboarding' },
            ].map((item, i) => (
              <div key={i} className="px-4 py-3 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="text-xs font-medium text-muted w-20">{item.time}</div>
                  <div>
                    <div className="text-sm text-charcoal">{item.task}</div>
                    <div className="text-xs text-muted">{item.agent} · {item.project}</div>
                  </div>
                </div>
                <button className="text-xs text-muted hover:text-charcoal">Edit Schedule</button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  // Inbox View
  const InboxView = () => (
    <div className="flex-1 p-6 overflow-auto bg-cream-light">
      <div className="max-w-3xl">
        <div className="flex items-center justify-between mb-6">
          <h1 ref={mainHeadingRef} tabIndex={-1} className="text-2xl font-semibold text-charcoal outline-none">Inbox</h1>
          <div className="flex items-center gap-2">
            <label className="sr-only" htmlFor="inbox-type-filter">Filter by type</label>
            <select id="inbox-type-filter" aria-label="Filter by type" className="h-8 px-3 text-sm border border-border-light rounded-lg bg-white">
              <option>All types</option>
              <option>Approvals</option>
              <option>Handoffs</option>
              <option>Errors</option>
            </select>
            <label className="sr-only" htmlFor="inbox-project-filter">Filter by project</label>
            <select id="inbox-project-filter" aria-label="Filter by project" className="h-8 px-3 text-sm border border-border-light rounded-lg bg-white">
              <option>All projects</option>
              {projects.map(p => <option key={p.id}>{p.name}</option>)}
            </select>
          </div>
        </div>

        {inboxItems.length === 0 ? (
          <div className="bg-white rounded-xl border border-border-light p-12 text-center">
            <div className="w-16 h-16 bg-sage-tint rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-sage" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-charcoal mb-2">All caught up!</h3>
            <p className="text-sm text-muted mb-4">
              No pending approvals, handoffs, or errors require your attention.
            </p>
            <button
              onClick={() => setCurrentView('command-center')}
              className="text-sm text-teal hover:text-teal-dark"
            >
              Return to Command Center
            </button>
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-border-light shadow-soft divide-y divide-border-light">
            {inboxItems.map(item => (
              <div key={item.id} className="p-4 hover:bg-cream">
                <div className="flex items-start gap-4">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                    item.type === 'error' ? 'bg-red-100' : item.type === 'handoff' ? 'bg-purple-100' : 'bg-teal-tint'
                  }`} aria-hidden="true">
                    {item.type === 'approval' && <span className="text-teal">✓</span>}
                    {item.type === 'handoff' && <span className="text-purple-600">⤳</span>}
                    {item.type === 'error' && <span className="text-red-600">!</span>}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <TypeBadge type={item.type} />
                      <span className="text-xs text-muted">{item.time}</span>
                    </div>
                    <h3 className="text-sm font-medium text-charcoal mb-1">{item.title}</h3>
                    <p className="text-xs text-muted mb-3">{item.reason}</p>

                    {item.type === 'error' && (
                      <div className="mt-3 mb-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                        <p className="text-sm text-red-800 mb-2">
                          <strong>What to try:</strong> Check the vendor information in your CRM and ensure all required fields are filled.
                        </p>
                      </div>
                    )}

                    <div className="flex items-center justify-between">
                      <div className="text-xs text-muted">
                        From <span className="text-charcoal-light">{item.agent}</span> in <span className="text-charcoal-light">{item.project}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        {item.type === 'approval' && (
                          <>
                            <button
                              onClick={() => setConfirmDialog({
                                title: 'Reject Request',
                                message: `Are you sure you want to reject "${item.title}"?`,
                                confirmLabel: 'Reject',
                                confirmStyle: 'destructive',
                                onConfirm: () => {
                                  showToast('Request rejected', 'success');
                                  setConfirmDialog(null);
                                }
                              })}
                              className="px-3 py-1.5 text-xs font-medium text-red-600 bg-red-50 rounded-md hover:bg-red-100"
                            >
                              Reject Request
                            </button>
                            <button
                              onClick={async () => {
                                setLoading(`approve-${item.id}`, true);
                                await new Promise(r => setTimeout(r, 1000));
                                setLoading(`approve-${item.id}`, false);
                                showToast('Request approved successfully', 'success');
                              }}
                              disabled={loadingStates[`approve-${item.id}`]}
                              aria-busy={loadingStates[`approve-${item.id}`]}
                              className={`px-3 py-1.5 text-xs font-medium text-white rounded-md ${
                                loadingStates[`approve-${item.id}`]
                                  ? 'bg-teal-light cursor-not-allowed'
                                  : 'bg-teal hover:bg-teal-dark'
                              }`}
                            >
                              {loadingStates[`approve-${item.id}`] ? (
                                <>
                                  <svg className="animate-spin -ml-1 mr-2 h-3 w-3 text-white inline" fill="none" viewBox="0 0 24 24" aria-hidden="true">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                                  </svg>
                                  Approving...
                                </>
                              ) : 'Approve Request'}
                            </button>
                          </>
                        )}
                        {item.type === 'handoff' && (
                          <button
                            onClick={async () => {
                              setLoading(`takeover-${item.id}`, true);
                              await new Promise(r => setTimeout(r, 1000));
                              setLoading(`takeover-${item.id}`, false);
                              showToast('Task taken over successfully', 'success');
                            }}
                            disabled={loadingStates[`takeover-${item.id}`]}
                            aria-busy={loadingStates[`takeover-${item.id}`]}
                            className={`px-3 py-1.5 text-xs font-medium text-white rounded-md ${
                              loadingStates[`takeover-${item.id}`]
                                ? 'bg-purple-400 cursor-not-allowed'
                                : 'bg-purple-600 hover:bg-purple-700'
                            }`}
                          >
                            {loadingStates[`takeover-${item.id}`] ? 'Taking over...' : 'Take Over Task'}
                          </button>
                        )}
                        {item.type === 'error' && (
                          <>
                            <button className="px-3 py-1.5 text-xs font-medium text-charcoal-light bg-cream-dark rounded-md hover:bg-border-light">
                              View Full Error
                            </button>
                            <button
                              onClick={async () => {
                                setLoading(`retry-${item.id}`, true);
                                await new Promise(r => setTimeout(r, 1000));
                                setLoading(`retry-${item.id}`, false);
                                showToast('Task retried successfully', 'success');
                              }}
                              disabled={loadingStates[`retry-${item.id}`]}
                              aria-busy={loadingStates[`retry-${item.id}`]}
                              className={`px-3 py-1.5 text-xs font-medium text-white rounded-md ${
                                loadingStates[`retry-${item.id}`]
                                  ? 'bg-muted cursor-not-allowed'
                                  : 'bg-charcoal hover:bg-charcoal-light'
                              }`}
                            >
                              {loadingStates[`retry-${item.id}`] ? 'Retrying...' : 'Retry Task'}
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  // Schedule View
  const ScheduleView = () => {
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const dayMap = { 'M': 0, 'T': 1, 'W': 2, 'Th': 3, 'F': 4, 'Sa': 5, 'Su': 6 };

    return (
      <div className="flex-1 p-6 overflow-auto bg-cream-light">
        <div className="max-w-6xl">
          <div className="flex items-center justify-between mb-6">
            <h1 ref={mainHeadingRef} tabIndex={-1} className="text-2xl font-semibold text-charcoal outline-none">Schedule</h1>
            <div className="flex items-center gap-2">
              <button className="px-3 py-1.5 text-sm text-charcoal-light border border-border-light rounded-lg hover:bg-cream">
                ← Previous Week
              </button>
              <button className="px-3 py-1.5 text-sm text-charcoal-light border border-border-light rounded-lg hover:bg-cream">
                This Week
              </button>
              <button className="px-3 py-1.5 text-sm text-charcoal-light border border-border-light rounded-lg hover:bg-cream">
                Next Week →
              </button>
              <button className="px-3 py-1.5 text-sm text-white bg-charcoal rounded-lg hover:bg-charcoal-light ml-2">
                + Add Schedule
              </button>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-border-light shadow-soft overflow-hidden">
            <div className="grid grid-cols-8 border-b border-border-light">
              <div className="p-3 text-xs font-medium text-muted uppercase tracking-wider bg-cream">Time</div>
              {days.map(day => (
                <div key={day} className="p-3 text-xs font-medium text-muted uppercase tracking-wider text-center bg-cream border-l border-border-light">
                  {day}
                </div>
              ))}
            </div>
            
            {['09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00'].map(time => (
              <div key={time} className="grid grid-cols-8 border-b border-border-light last:border-b-0">
                <div className="p-3 text-xs text-muted bg-cream">{time}</div>
                {days.map((day, dayIndex) => {
                  const scheduled = scheduleItems.filter(item => 
                    item.time === time && item.days.some(d => dayMap[d] === dayIndex)
                  );
                  return (
                    <div key={day} className="p-1 border-l border-border-light min-h-[60px]">
                      {scheduled.map(item => (
                        <div 
                          key={item.id}
                          className="p-2 bg-teal-tint border border-teal/30 rounded-md text-xs cursor-pointer hover:bg-teal-tint transition-colors"
                        >
                          <div className="font-medium text-teal-dark truncate">{item.agent}</div>
                          <div className="text-teal truncate">{item.task}</div>
                        </div>
                      ))}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>

          <div className="mt-6 bg-white rounded-xl border border-border-light shadow-soft">
            <div className="px-4 py-3 border-b border-border-light">
              <h2 className="font-medium text-charcoal">All Scheduled Tasks</h2>
            </div>
            <div className="divide-y divide-border-light">
              {scheduleItems.map(item => (
                <div key={item.id} className="px-4 py-3 flex items-center justify-between hover:bg-cream">
                  <div className="flex items-center gap-4">
                    <div className="w-16 text-sm font-mono text-charcoal-light">{item.time}</div>
                    <div>
                      <div className="text-sm font-medium text-charcoal">{item.task}</div>
                      <div className="text-xs text-muted">{item.agent} · {item.project}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex gap-1" role="group" aria-label={`Days scheduled: ${item.days.join(', ')}`}>
                      {['M', 'T', 'W', 'Th', 'F'].map(d => (
                        <span
                          key={d}
                          className={`w-6 h-6 rounded text-xs flex items-center justify-center ${
                            item.days.includes(d)
                              ? 'bg-teal-tint text-teal-dark'
                              : 'bg-cream-dark text-muted'
                          }`}
                          aria-label={`${d}${item.days.includes(d) ? ' (scheduled)' : ''}`}
                        >
                          {d}
                        </span>
                      ))}
                    </div>
                    <button className="text-xs text-muted hover:text-charcoal">Edit Schedule</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Team View
  const TeamView = () => (
    <div className="flex-1 p-6 overflow-auto bg-cream-light">
      <div className="max-w-5xl">
        <div className="flex items-center justify-between mb-6">
          <h1 ref={mainHeadingRef} tabIndex={-1} className="text-2xl font-semibold text-charcoal outline-none">Team</h1>
          <div className="flex items-center gap-2">
            <label className="sr-only" htmlFor="team-project-filter">Filter by project</label>
            <select id="team-project-filter" aria-label="Filter by project" className="h-8 px-3 text-sm border border-border-light rounded-lg bg-white">
              <option>All projects</option>
              {projects.map(p => <option key={p.id}>{p.name}</option>)}
            </select>
            <label className="sr-only" htmlFor="team-type-filter">Filter by team type</label>
            <select id="team-type-filter" aria-label="Filter by team type" className="h-8 px-3 text-sm border border-border-light rounded-lg bg-white">
              <option>All types</option>
              <option>Agents only</option>
              <option>Humans only</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-xl border border-border-light p-4 shadow-soft">
            <div className="text-sm text-muted mb-1">Total Team Members</div>
            <div className="text-3xl font-semibold text-charcoal">{allTeamMembers.agents.length + allTeamMembers.humans.length}</div>
            <div className="text-xs text-muted mt-1">{allTeamMembers.agents.length} agents · {allTeamMembers.humans.length} humans</div>
          </div>
          <div className="bg-white rounded-xl border border-border-light p-4 shadow-soft">
            <div className="text-sm text-muted mb-1">Agents Active Now</div>
            <div className="text-3xl font-semibold text-charcoal">{allTeamMembers.agents.filter(a => a.status === 'active').length}</div>
            <div className="text-xs text-sage mt-1">of {allTeamMembers.agents.length} total agents</div>
          </div>
          <div className="bg-white rounded-xl border border-border-light p-4 shadow-soft">
            <div className="text-sm text-muted mb-1">Avg. Autonomy</div>
            <div className="text-3xl font-semibold text-charcoal">Assisted</div>
            <div className="text-xs text-teal mt-1">Trending toward Autonomous</div>
          </div>
        </div>

        <div className="mb-8">
          <h2 className="text-sm font-semibold text-muted uppercase tracking-wider mb-4">Agents ({allTeamMembers.agents.length})</h2>
          <div className="bg-white rounded-xl border border-border-light shadow-soft overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="bg-cream border-b border-border-light">
                  <th className="text-left text-xs font-medium text-muted uppercase tracking-wider px-4 py-3">Agent</th>
                  <th className="text-left text-xs font-medium text-muted uppercase tracking-wider px-4 py-3">Project</th>
                  <th className="text-left text-xs font-medium text-muted uppercase tracking-wider px-4 py-3">Status</th>
                  <th className="text-left text-xs font-medium text-muted uppercase tracking-wider px-4 py-3">Autonomy</th>
                  <th className="text-left text-xs font-medium text-muted uppercase tracking-wider px-4 py-3">Approval Rate</th>
                  <th className="text-left text-xs font-medium text-muted uppercase tracking-wider px-4 py-3">Tasks</th>
                  <th className="text-right text-xs font-medium text-muted uppercase tracking-wider px-4 py-3"><span className="sr-only">Actions</span></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-light">
                {allTeamMembers.agents.map(agent => (
                  <tr
                    key={agent.id}
                    onClick={() => { setSelectedAgent(agent); setCurrentView('agent-detail'); }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        setSelectedAgent(agent);
                        setCurrentView('agent-detail');
                      }
                    }}
                    tabIndex={0}
                    role="row"
                    aria-label={`${agent.name}, ${agent.status}, ${agent.autonomy} autonomy`}
                    className="hover:bg-cream cursor-pointer focus:outline-none focus:bg-teal-tint"
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-gradient-to-br from-cream to-cream-dark rounded-lg flex items-center justify-center" aria-hidden="true">
                          <span className="text-sm">🤖</span>
                        </div>
                        <span className="text-sm font-medium text-charcoal">{agent.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-charcoal-light">{agent.project}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <StatusBadge status={agent.status} />
                        <span className={`text-xs capitalize ${
                          agent.status === 'active' ? 'text-sage' :
                          agent.status === 'error' ? 'text-red-600' : 'text-muted'
                        }`}>
                          {agent.status}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <AutonomyIndicator level={agent.autonomy} />
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm text-charcoal-light">{agent.approvalRate}%</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm text-charcoal-light">{agent.tasksCompleted}</span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span className="text-xs text-teal">
                        View Agent Details →
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div>
          <h2 className="text-sm font-semibold text-muted uppercase tracking-wider mb-4">Humans ({allTeamMembers.humans.length})</h2>
          <div className="bg-white rounded-xl border border-border-light shadow-soft overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="bg-cream border-b border-border-light">
                  <th className="text-left text-xs font-medium text-muted uppercase tracking-wider px-4 py-3">Name</th>
                  <th className="text-left text-xs font-medium text-muted uppercase tracking-wider px-4 py-3">Role</th>
                  <th className="text-left text-xs font-medium text-muted uppercase tracking-wider px-4 py-3">Project</th>
                  <th className="text-left text-xs font-medium text-muted uppercase tracking-wider px-4 py-3">Tasks Completed</th>
                  <th className="text-right text-xs font-medium text-muted uppercase tracking-wider px-4 py-3"><span className="sr-only">Actions</span></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-light">
                {allTeamMembers.humans.map(human => (
                  <tr
                    key={human.id}
                    tabIndex={0}
                    role="row"
                    aria-label={`${human.name}, ${human.role}, ${human.project}`}
                    className="hover:bg-cream cursor-pointer focus:outline-none focus:bg-teal-tint"
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-gradient-to-br from-teal-tint to-teal/20 rounded-full flex items-center justify-center text-xs font-medium text-teal-dark" aria-hidden="true">
                          {human.avatar}
                        </div>
                        <span className="text-sm font-medium text-charcoal">{human.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-charcoal-light">{human.role}</td>
                    <td className="px-4 py-3 text-sm text-charcoal-light">{human.project}</td>
                    <td className="px-4 py-3 text-sm text-charcoal-light">{human.tasksCompleted}</td>
                    <td className="px-4 py-3 text-right">
                      <span className="text-xs text-teal">
                        View Profile →
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );

  // Reports View
  const ReportsView = () => (
    <div className="flex-1 p-6 overflow-auto bg-cream-light">
      <div className="max-w-6xl">
        <div className="flex items-center justify-between mb-6">
          <h1 ref={mainHeadingRef} tabIndex={-1} className="text-2xl font-semibold text-charcoal outline-none">Reports</h1>
          <div className="flex items-center gap-2">
            <label className="sr-only" htmlFor="reports-date-filter">Filter by date range</label>
            <select id="reports-date-filter" aria-label="Filter by date range" className="h-8 px-3 text-sm border border-border-light rounded-lg bg-white">
              <option>Last 7 days</option>
              <option>Last 30 days</option>
              <option>Last 90 days</option>
              <option>This month</option>
              <option>Last month</option>
            </select>
            <button className="px-3 py-1.5 text-sm text-charcoal-light border border-border-light rounded-lg hover:bg-cream">
              Export PDF
            </button>
          </div>
        </div>

        <div className="grid grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Total Tasks', value: '247', change: '+12%', positive: true },
            { label: 'Agent Tasks', value: '189', change: '+18%', positive: true },
            { label: 'Human Tasks', value: '58', change: '-8%', positive: true },
            { label: 'Intervention Rate', value: '12%', change: '-3%', positive: true },
          ].map((stat, i) => (
            <div key={i} className="bg-white rounded-xl border border-border-light p-4 shadow-soft">
              <div className="text-sm text-muted mb-1">{stat.label}</div>
              <div className="text-3xl font-semibold text-charcoal">{stat.value}</div>
              <div className={`text-xs mt-1 ${stat.positive ? 'text-sage' : 'text-red-600'}`}>
                {stat.change} from last period
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-6 mb-6">
          <div className="bg-white rounded-xl border border-border-light shadow-soft">
            <div className="px-4 py-3 border-b border-border-light">
              <h2 className="font-medium text-charcoal">Task Completion Trend</h2>
            </div>
            <div className="p-4">
              <div className="h-48 flex items-end justify-between gap-2">
                {[45, 52, 38, 65, 58, 72, 47].map((value, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center gap-2">
                    <div className="w-full flex flex-col gap-1">
                      <div 
                        className="w-full bg-teal rounded-t"
                        style={{ height: `${value * 1.5}px` }}
                      />
                      <div 
                        className="w-full bg-teal/20 rounded-b"
                        style={{ height: `${(100-value) * 0.3}px` }}
                      />
                    </div>
                    <span className="text-xs text-muted">
                      {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][i]}
                    </span>
                  </div>
                ))}
              </div>
              <div className="flex items-center justify-center gap-6 mt-4 pt-4 border-t border-border-light">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-teal rounded" />
                  <span className="text-xs text-muted">Agent tasks</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-teal/20 rounded" />
                  <span className="text-xs text-muted">Human tasks</span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-border-light shadow-soft">
            <div className="px-4 py-3 border-b border-border-light">
              <h2 className="font-medium text-charcoal">Tasks by Project</h2>
            </div>
            <div className="p-4">
              {projects.map((project, i) => {
                const values = [120, 78, 49];
                const maxValue = 120;
                return (
                  <div key={project.id} className="mb-4 last:mb-0">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-charcoal">{project.name}</span>
                      <span className="text-sm font-medium text-charcoal">{values[i]}</span>
                    </div>
                    <div className="h-2 bg-cream-dark rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-teal to-teal-light rounded-full"
                        style={{ width: `${(values[i] / maxValue) * 100}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6 mb-6">
          <div className="bg-white rounded-xl border border-border-light shadow-soft">
            <div className="px-4 py-3 border-b border-border-light">
              <h2 className="font-medium text-charcoal">Top Performing Agents</h2>
            </div>
            <div className="divide-y divide-border-light">
              {allTeamMembers.agents
                .sort((a, b) => b.tasksCompleted - a.tasksCompleted)
                .slice(0, 5)
                .map((agent, i) => (
                <div key={agent.id} className="px-4 py-3 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-full bg-cream-dark flex items-center justify-center text-xs font-medium text-muted">
                      {i + 1}
                    </span>
                    <div>
                      <div className="text-sm font-medium text-charcoal">{agent.name}</div>
                      <div className="text-xs text-muted">{agent.project}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium text-charcoal">{agent.tasksCompleted}</div>
                    <div className="text-xs text-muted">tasks</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-xl border border-border-light shadow-soft">
            <div className="px-4 py-3 border-b border-border-light">
              <h2 className="font-medium text-charcoal">Autonomy Progression</h2>
            </div>
            <div className="p-4">
              <div className="space-y-4">
                {[
                  { level: 'Autonomous', count: 1, color: 'bg-sage' },
                  { level: 'Assisted', count: 4, color: 'bg-teal' },
                  { level: 'Supervised', count: 2, color: 'bg-amber-500' },
                ].map(item => (
                  <div key={item.level}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm text-charcoal">{item.level}</span>
                      <span className="text-sm font-medium text-charcoal">{item.count} agents</span>
                    </div>
                    <div className="h-2 bg-cream-dark rounded-full overflow-hidden">
                      <div 
                        className={`h-full ${item.color} rounded-full`}
                        style={{ width: `${(item.count / 7) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-6 p-3 bg-sage-tint/50 border border-sage/30 rounded-lg">
                <div className="flex items-start gap-2">
                  <span className="text-sage">↑</span>
                  <div>
                    <div className="text-sm font-medium text-sage-dark">2 agents ready for promotion</div>
                    <div className="text-xs text-sage mt-0.5">Based on approval rates above 95%</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-border-light shadow-soft">
          <div className="px-4 py-3 border-b border-border-light">
            <h2 className="font-medium text-charcoal">Time Saved Estimate</h2>
          </div>
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-4xl font-semibold text-charcoal">47.5 hours</div>
                <div className="text-sm text-muted mt-1">estimated time saved this week</div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-semibold text-sage">$2,375</div>
                <div className="text-sm text-muted mt-1">estimated value (at $50/hr)</div>
              </div>
            </div>
            <div className="mt-6 grid grid-cols-3 gap-4 pt-6 border-t border-border-light">
              <div className="text-center">
                <div className="text-xl font-semibold text-charcoal">189</div>
                <div className="text-xs text-muted">tasks automated</div>
              </div>
              <div className="text-center">
                <div className="text-xl font-semibold text-charcoal">15 min</div>
                <div className="text-xs text-muted">avg. time per task</div>
              </div>
              <div className="text-center">
                <div className="text-xl font-semibold text-charcoal">94%</div>
                <div className="text-xs text-muted">success rate</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // Activity View
  const ActivityView = () => (
    <div className="flex-1 p-6 overflow-auto bg-cream-light">
      <div className="max-w-4xl">
        <div className="flex items-center justify-between mb-6">
          <h1 ref={mainHeadingRef} tabIndex={-1} className="text-2xl font-semibold text-charcoal outline-none">Activity</h1>
          <div className="flex items-center gap-2">
            <label className="sr-only" htmlFor="activity-type-filter">Filter by activity type</label>
            <select id="activity-type-filter" aria-label="Filter by activity type" className="h-8 px-3 text-sm border border-border-light rounded-lg bg-white">
              <option>All activity</option>
              <option>Agent actions</option>
              <option>Human actions</option>
              <option>Handoffs</option>
              <option>Errors</option>
            </select>
            <label className="sr-only" htmlFor="activity-project-filter">Filter by project</label>
            <select id="activity-project-filter" aria-label="Filter by project" className="h-8 px-3 text-sm border border-border-light rounded-lg bg-white">
              <option>All projects</option>
              {projects.map(p => <option key={p.id}>{p.name}</option>)}
            </select>
            <label className="sr-only" htmlFor="activity-date-filter">Filter by date</label>
            <select id="activity-date-filter" aria-label="Filter by date" className="h-8 px-3 text-sm border border-border-light rounded-lg bg-white">
              <option>Today</option>
              <option>Yesterday</option>
              <option>Last 7 days</option>
              <option>Last 30 days</option>
            </select>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-border-light shadow-soft">
          <div className="divide-y divide-border-light">
            {activityLog.map((entry, i) => (
              <div key={i} className="px-4 py-3 flex items-start gap-4 hover:bg-cream">
                <div className="text-xs text-muted w-16 pt-0.5 shrink-0">{entry.time}</div>
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                  entry.type === 'start' ? 'bg-teal-tint text-teal' :
                  entry.type === 'handoff' ? 'bg-purple-100 text-purple-600' :
                  entry.type === 'complete' ? 'bg-sage-tint text-sage' :
                  entry.type === 'approval' ? 'bg-green-100 text-green-600' :
                  entry.type === 'error' ? 'bg-red-100 text-red-600' :
                  'bg-cream-dark text-muted'
                }`} aria-hidden="true">
                  {entry.type === 'start' && '→'}
                  {entry.type === 'action' && '•'}
                  {entry.type === 'handoff' && '⤳'}
                  {entry.type === 'complete' && '✓'}
                  {entry.type === 'approval' && '✓'}
                  {entry.type === 'error' && '!'}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm text-charcoal">{entry.text}</div>
                  {entry.detail && <div className="text-xs text-muted mt-0.5">{entry.detail}</div>}
                  <div className="text-xs text-muted mt-1">{entry.project}</div>
                </div>
                <button className="text-xs text-muted hover:text-charcoal shrink-0">
                  View Details
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-4 flex items-center justify-center">
          <button className="px-4 py-2 text-sm text-charcoal-light hover:text-charcoal">
            Load more activity
          </button>
        </div>
      </div>
    </div>
  );

  // Tools View (Connected Tools)
  const ToolsView = () => (
    <div className="flex-1 p-6 overflow-auto bg-cream-light">
      <div className="max-w-4xl">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 ref={mainHeadingRef} tabIndex={-1} className="text-2xl font-semibold text-charcoal outline-none">Connected Tools</h1>
            <p className="text-sm text-muted mt-1">Manage integrations that your agents can use</p>
          </div>
          <button
            onClick={() => setCurrentView('tools-add')}
            className="px-3 py-1.5 text-sm text-white bg-charcoal rounded-lg hover:bg-charcoal-light"
          >
            + Add New Tool
          </button>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-xl border border-border-light p-4 shadow-soft">
            <div className="text-sm text-muted mb-1">Connected Tools</div>
            <div className="text-3xl font-semibold text-charcoal">{tools.filter(t => t.status === 'connected').length}</div>
            <div className="text-xs text-muted mt-1">of {tools.length} available</div>
          </div>
          <div className="bg-white rounded-xl border border-border-light p-4 shadow-soft">
            <div className="text-sm text-muted mb-1">Active Integrations</div>
            <div className="text-3xl font-semibold text-charcoal">14</div>
            <div className="text-xs text-sage mt-1">All healthy</div>
          </div>
          <div className="bg-white rounded-xl border border-border-light p-4 shadow-soft">
            <div className="text-sm text-muted mb-1">API Calls Today</div>
            <div className="text-3xl font-semibold text-charcoal">1,247</div>
            <div className="text-xs text-muted mt-1">Within limits</div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-border-light shadow-soft">
          <div className="px-4 py-3 border-b border-border-light">
            <h2 className="font-medium text-charcoal">Your Tools</h2>
          </div>
          <div className="divide-y divide-border-light">
            {tools.map(tool => (
              <button
                key={tool.id}
                onClick={() => { setSelectedTool(tool); setCurrentView('tool-settings'); }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    setSelectedTool(tool);
                    setCurrentView('tool-settings');
                  }
                }}
                className="w-full p-4 flex items-center justify-between hover:bg-cream cursor-pointer text-left focus:outline-none focus:ring-2 focus:ring-inset focus:ring-teal"
                aria-label={`${tool.name} - ${tool.status === 'connected' ? 'Connected' : 'Not connected'}`}
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-cream-dark rounded-xl flex items-center justify-center text-2xl" aria-hidden="true">
                    {tool.icon}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-charcoal">{tool.name}</span>
                      <StatusBadge status={tool.status} />
                      <span className={`text-xs ${tool.status === 'connected' ? 'text-sage' : 'text-muted'}`}>
                        {tool.status === 'connected' ? 'Connected' : 'Not connected'}
                      </span>
                    </div>
                    <div className="text-xs text-muted mt-0.5">{tool.description}</div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  {tool.status === 'connected' && (
                    <div className="text-right">
                      <div className="text-xs text-muted">Used by {tool.usedBy} agents</div>
                      <div className="text-xs text-muted">Last sync: {tool.lastSync}</div>
                    </div>
                  )}
                  <span className="text-xs text-teal">
                    {tool.status === 'connected' ? 'View Settings →' : 'Connect Tool →'}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  // Add New Tool View
  const AddToolView = () => {
    const categories = [...new Set(availableTools.map(t => t.category))];

    return (
      <div className="flex-1 p-6 overflow-auto bg-cream-light">
        <div className="max-w-4xl">
          <button
            onClick={() => setCurrentView('tools')}
            className="text-sm text-muted hover:text-charcoal mb-4 flex items-center gap-1"
          >
            ← Back to Connected Tools
          </button>

          <div className="mb-6">
            <h1 ref={mainHeadingRef} tabIndex={-1} className="text-2xl font-semibold text-charcoal outline-none">Add New Tool</h1>
            <p className="text-sm text-muted mt-1">Connect a service to enable your agents to interact with it</p>
          </div>

          <div className="relative mb-6">
            <label className="sr-only" htmlFor="tools-search">Search available tools</label>
            <input
              id="tools-search"
              type="text"
              placeholder="Search tools..."
              aria-label="Search available tools"
              className="w-full h-10 px-4 pl-10 border border-border-light rounded-lg bg-white text-sm focus:outline-none focus:border-teal"
            />
            <svg className="w-4 h-4 text-muted absolute left-3 top-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>

          {categories.map(category => (
            <div key={category} className="mb-8">
              <h2 className="text-sm font-semibold text-muted uppercase tracking-wider mb-4">{category}</h2>
              <div className="grid grid-cols-2 gap-4">
                {availableTools.filter(t => t.category === category).map(tool => {
                  const isConnected = tools.find(t => t.name === tool.name)?.status === 'connected';
                  return (
                    <div 
                      key={tool.id}
                      className={`bg-white rounded-xl border p-4 cursor-pointer transition-all ${
                        isConnected 
                          ? 'border-sage/30 bg-sage-tint/50/50' 
                          : 'border-border-light hover:border-border hover:shadow-soft'
                      }`}
                      onClick={() => { setSelectedTool(tool); setCurrentView('tool-setup'); }}
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 bg-cream-dark rounded-lg flex items-center justify-center text-xl shrink-0">
                          {tool.icon}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-charcoal">{tool.name}</span>
                            {isConnected && (
                              <span className="px-1.5 py-0.5 bg-sage-tint text-sage text-xs rounded">
                                Connected
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-muted mt-1 line-clamp-2">{tool.description}</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}

          <div className="bg-cream rounded-xl border border-border-light p-6 text-center">
            <div className="text-2xl mb-2">🔧</div>
            <div className="text-sm font-medium text-charcoal mb-1">Need a custom integration?</div>
            <p className="text-xs text-muted mb-4">Connect any service using our API or request a new integration</p>
            <div className="flex items-center justify-center gap-3">
              <button className="px-3 py-1.5 text-sm text-charcoal-light border border-border rounded-lg hover:bg-white">
                API Documentation
              </button>
              <button className="px-3 py-1.5 text-sm text-white bg-charcoal rounded-lg hover:bg-charcoal-light">
                Request Integration
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Tool Setup View (for new connections)
  const ToolSetupView = () => (
    <div className="flex-1 p-6 overflow-auto bg-cream-light">
      <div className="max-w-2xl">
        <button 
          onClick={() => setCurrentView('tools-add')}
          className="text-sm text-muted hover:text-charcoal mb-4 flex items-center gap-1"
        >
          ← Back to Add Tool
        </button>

        <div className="bg-white rounded-xl border border-border-light shadow-soft">
          <div className="p-6 border-b border-border-light">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-cream-dark rounded-xl flex items-center justify-center text-2xl">
                {selectedTool?.icon}
              </div>
              <div>
                <h1 className="text-xl font-semibold text-charcoal">Connect {selectedTool?.name}</h1>
                <p className="text-sm text-muted mt-0.5">{selectedTool?.description}</p>
              </div>
            </div>
          </div>

          <div className="p-6">
            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-medium text-charcoal mb-3">Step 1: Authorize Access</h3>
                <p className="text-sm text-muted mb-4">
                  Click the button below to authorize AgentOS to access your {selectedTool?.name} account. 
                  You'll be redirected to {selectedTool?.name} to grant permissions.
                </p>
                <button className="w-full py-3 bg-teal text-white text-sm font-medium rounded-lg hover:bg-teal-dark flex items-center justify-center gap-2">
                  <span>{selectedTool?.icon}</span>
                  Connect with {selectedTool?.name}
                </button>
              </div>

              <div className="border-t border-border-light pt-6">
                <h3 className="text-sm font-medium text-charcoal mb-3">Step 2: Configure Permissions</h3>
                <p className="text-sm text-muted mb-4">
                  After connecting, choose what your agents can do with {selectedTool?.name}:
                </p>
                <div className="space-y-3">
                  {[
                    { label: 'Read data', description: 'View files, records, and information', default: true },
                    { label: 'Create items', description: 'Create new documents, records, or entries', default: true },
                    { label: 'Update items', description: 'Modify existing content and records', default: false },
                    { label: 'Delete items', description: 'Remove content and records', default: false },
                    { label: 'Send messages', description: 'Send emails, notifications, or messages', default: false },
                  ].map((perm, i) => (
                    <label key={i} className="flex items-start gap-3 p-3 bg-cream rounded-lg cursor-pointer hover:bg-cream-dark">
                      <input 
                        type="checkbox" 
                        defaultChecked={perm.default}
                        className="mt-0.5 w-4 h-4 rounded border-border text-teal focus:ring-teal"
                      />
                      <div>
                        <div className="text-sm font-medium text-charcoal">{perm.label}</div>
                        <div className="text-xs text-muted">{perm.description}</div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              <div className="border-t border-border-light pt-6">
                <h3 className="text-sm font-medium text-charcoal mb-3">Step 3: Assign to Agents</h3>
                <p className="text-sm text-muted mb-4">
                  Choose which agents should have access to this tool:
                </p>
                <div className="space-y-2">
                  {allTeamMembers.agents.slice(0, 4).map(agent => (
                    <label key={agent.id} className="flex items-center gap-3 p-2 hover:bg-cream rounded-lg cursor-pointer">
                      <input 
                        type="checkbox" 
                        className="w-4 h-4 rounded border-border text-teal focus:ring-teal"
                      />
                      <div className="w-6 h-6 bg-gradient-to-br from-cream to-cream-dark rounded flex items-center justify-center text-xs">
                        🤖
                      </div>
                      <span className="text-sm text-charcoal">{agent.name}</span>
                      <span className="text-xs text-muted">({agent.project})</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="p-4 bg-cream border-t border-border-light flex items-center justify-end gap-3">
            <button 
              onClick={() => setCurrentView('tools-add')}
              className="px-4 py-2 text-sm text-charcoal-light hover:text-charcoal"
            >
              Cancel
            </button>
            <button className="px-4 py-2 text-sm text-white bg-charcoal rounded-lg hover:bg-charcoal-light">
              Complete Setup
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  // Toggle switch component with proper accessibility
  const Toggle = ({ id, enabled, onChange, label }) => (
    <button
      role="switch"
      aria-checked={enabled}
      aria-labelledby={`${id}-label`}
      onClick={() => onChange(!enabled)}
      onKeyDown={(e) => {
        if (e.key === ' ' || e.key === 'Enter') {
          e.preventDefault();
          onChange(!enabled);
        }
      }}
      className={`relative w-10 h-6 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-teal focus:ring-offset-2 ${
        enabled ? 'bg-teal' : 'bg-border-light'
      }`}
    >
      <span
        className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${
          enabled ? 'translate-x-5' : 'translate-x-1'
        }`}
        aria-hidden="true"
      />
    </button>
  );

  // Tool Settings View (for connected tools)
  const ToolSettingsView = () => {
    const [permissions, setPermissions] = useState({
      read: true,
      create: true,
      update: true,
      delete: false,
      send: true
    });

    const permissionsList = [
      { key: 'read', label: 'Read data' },
      { key: 'create', label: 'Create items' },
      { key: 'update', label: 'Update items' },
      { key: 'delete', label: 'Delete items' },
      { key: 'send', label: 'Send messages' },
    ];

    return (
      <div className="flex-1 p-6 overflow-auto bg-cream-light">
        <div className="max-w-3xl">
          <button
            onClick={() => setCurrentView('tools')}
            className="text-sm text-muted hover:text-charcoal mb-4 flex items-center gap-1"
          >
            ← Back to Connected Tools
          </button>

          <div className="bg-white rounded-xl border border-border-light shadow-soft mb-6">
            <div className="p-6 border-b border-border-light">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-cream-dark rounded-xl flex items-center justify-center text-2xl" aria-hidden="true">
                    {selectedTool?.icon}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h1 ref={mainHeadingRef} tabIndex={-1} className="text-xl font-semibold text-charcoal outline-none">{selectedTool?.name}</h1>
                      <StatusBadge status="connected" />
                      <span className="text-xs text-sage">Connected</span>
                    </div>
                    <p className="text-sm text-muted mt-0.5">{selectedTool?.description}</p>
                  </div>
                </div>
                <button
                  onClick={() => setConfirmDialog({
                    title: `Disconnect ${selectedTool?.name}?`,
                    message: `This will remove access for all ${selectedTool?.usedBy || 3} agents using this tool. You can reconnect later.`,
                    confirmLabel: 'Disconnect',
                    confirmStyle: 'destructive',
                    onConfirm: () => {
                      showToast(`${selectedTool?.name} disconnected successfully`, 'success');
                      setConfirmDialog(null);
                      setCurrentView('tools');
                    }
                  })}
                  className="px-3 py-1.5 text-sm text-red-600 border border-red-200 rounded-lg hover:bg-red-50"
                >
                  Disconnect Tool
                </button>
              </div>
            </div>

            <div className="grid grid-cols-3 divide-x divide-border-light border-b border-border-light">
              <div className="p-4 text-center">
                <div className="text-xl font-semibold text-charcoal">{selectedTool?.usedBy || 3}</div>
                <div className="text-xs text-muted">Agents using</div>
              </div>
              <div className="p-4 text-center">
                <div className="text-xl font-semibold text-charcoal">247</div>
                <div className="text-xs text-muted">API calls today</div>
              </div>
              <div className="p-4 text-center">
                <div className="text-xl font-semibold text-charcoal">{selectedTool?.lastSync || '2m ago'}</div>
                <div className="text-xs text-muted">Last sync</div>
              </div>
            </div>

            <div className="p-6">
              <h2 className="text-sm font-medium text-charcoal mb-4">Permissions</h2>
              <div className="space-y-3">
                {permissionsList.map((perm) => (
                  <div key={perm.key} className="flex items-center justify-between py-2">
                    <span id={`perm-${perm.key}-label`} className="text-sm text-charcoal">{perm.label}</span>
                    <Toggle
                      id={`perm-${perm.key}`}
                      enabled={permissions[perm.key]}
                      onChange={(value) => setPermissions(prev => ({ ...prev, [perm.key]: value }))}
                      label={perm.label}
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-border-light shadow-soft mb-6">
            <div className="px-4 py-3 border-b border-border-light">
              <h2 className="font-medium text-charcoal">Agents Using This Tool</h2>
            </div>
            <div className="divide-y divide-border-light">
              {allTeamMembers.agents.slice(0, 3).map(agent => (
                <div key={agent.id} className="px-4 py-3 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-cream to-cream-dark rounded-lg flex items-center justify-center text-sm" aria-hidden="true">
                      🤖
                    </div>
                    <div>
                      <div className="text-sm font-medium text-charcoal">{agent.name}</div>
                      <div className="text-xs text-muted">{agent.project}</div>
                    </div>
                  </div>
                  <button
                    onClick={() => setConfirmDialog({
                      title: `Remove ${agent.name}'s access?`,
                      message: `This agent will no longer be able to use ${selectedTool?.name}.`,
                      confirmLabel: 'Remove Access',
                      confirmStyle: 'destructive',
                      onConfirm: () => {
                        showToast(`Access removed for ${agent.name}`, 'success');
                        setConfirmDialog(null);
                      }
                    })}
                    className="text-xs text-red-500 hover:text-red-700"
                  >
                    Remove Access
                  </button>
                </div>
              ))}
              <div className="px-4 py-3">
                <button className="text-sm text-teal hover:text-teal-dark">+ Add Agent to Tool</button>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-border-light shadow-soft">
            <div className="px-4 py-3 border-b border-border-light">
              <h2 className="font-medium text-charcoal">Recent Activity</h2>
            </div>
            <div className="divide-y divide-border-light">
              {[
                { time: '2m ago', agent: 'Lead Qualifier', action: 'Read contact from CRM' },
                { time: '5m ago', agent: 'Outreach Sender', action: 'Created email draft' },
                { time: '12m ago', agent: 'Lead Qualifier', action: 'Updated lead status' },
                { time: '18m ago', agent: 'Pipeline Tracker', action: 'Read opportunity data' },
              ].map((item, i) => (
                <div key={i} className="px-4 py-3 flex items-center gap-4">
                  <span className="text-xs text-muted w-14">{item.time}</span>
                  <div>
                    <span className="text-sm text-charcoal">{item.action}</span>
                    <span className="text-sm text-muted"> by </span>
                    <span className="text-sm text-charcoal-light">{item.agent}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Project View
  const ProjectView = () => (
    <div className="flex-1 p-6 overflow-auto bg-cream-light">
      <div className="max-w-5xl">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 ref={mainHeadingRef} tabIndex={-1} className="text-2xl font-semibold text-charcoal outline-none">{selectedProject?.name}</h1>
            <p className="text-sm text-muted mt-1">{selectedProject?.agents} agents · {selectedProject?.humans} humans</p>
          </div>
          <button className="px-3 py-1.5 text-sm text-charcoal-light border border-border-light rounded-lg hover:bg-cream">
            Project Settings
          </button>
        </div>

        <div className="mb-8">
          <h2 className="text-sm font-semibold text-muted uppercase tracking-wider mb-3">Team</h2>
          <div className="grid grid-cols-5 gap-3">
            {projectTeam.agents.map(agent => (
              <button
                key={agent.id}
                onClick={() => { setSelectedAgent(agent); setCurrentView('agent-detail'); }}
                className="bg-white rounded-xl border border-border-light p-4 text-left hover:border-border hover:shadow-soft transition-all"
              >
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 bg-gradient-to-br from-cream to-cream-dark rounded-lg flex items-center justify-center">
                    <span className="text-sm">🤖</span>
                  </div>
                  <StatusBadge status={agent.status} />
                </div>
                <div className="text-sm font-medium text-charcoal mb-1">{agent.name}</div>
                <AutonomyIndicator level={agent.autonomy} />
              </button>
            ))}
            {projectTeam.humans.map(human => (
              <div
                key={human.id}
                className="bg-white rounded-xl border border-border-light p-4"
              >
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 bg-gradient-to-br from-teal-tint to-teal/20 rounded-lg flex items-center justify-center">
                    <span className="text-sm">👤</span>
                  </div>
                </div>
                <div className="text-sm font-medium text-charcoal">{human.name}</div>
                <div className="text-xs text-muted">{human.role}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6">
          <div className="bg-white rounded-xl border border-border-light shadow-soft">
            <div className="px-4 py-3 border-b border-border-light">
              <h2 className="font-medium text-charcoal">Active Work</h2>
            </div>
            <table className="w-full">
              <thead>
                <tr className="text-xs text-muted border-b border-border-light">
                  <th className="text-left font-medium px-4 py-2">Task</th>
                  <th className="text-left font-medium px-4 py-2">Assigned</th>
                  <th className="text-left font-medium px-4 py-2">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-light">
                {[
                  { task: 'Qualify Acme lead', assignee: 'Lead Qualifier', status: 'running' },
                  { task: 'Weekly pipeline sync', assignee: 'Pipeline Tracker', status: 'scheduled' },
                  { task: 'Follow-up batch', assignee: '→ Jamie Chen', status: 'handoff' },
                  { task: 'Contoso outreach', assignee: 'Outreach Sender', status: 'pending' },
                ].map((row, i) => (
                  <tr key={i} className="text-sm hover:bg-cream">
                    <td className="px-4 py-2.5 text-charcoal">{row.task}</td>
                    <td className="px-4 py-2.5 text-charcoal-light">{row.assignee}</td>
                    <td className="px-4 py-2.5">
                      <span className={`inline-flex items-center gap-1.5 text-xs ${
                        row.status === 'running' ? 'text-sage' :
                        row.status === 'handoff' ? 'text-purple-600' :
                        row.status === 'pending' ? 'text-amber-600' : 'text-muted'
                      }`}>
                        <StatusBadge status={row.status === 'running' ? 'active' : row.status === 'pending' ? 'pending' : 'idle'} />
                        {row.status.charAt(0).toUpperCase() + row.status.slice(1)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="bg-white rounded-xl border border-border-light shadow-soft">
            <div className="px-4 py-3 border-b border-border-light">
              <h2 className="font-medium text-charcoal">Recent Activity</h2>
            </div>
            <div className="p-4 space-y-3">
              {activityLog.slice(0, 6).map((entry, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className="text-xs text-muted w-14 pt-0.5">{entry.time}</div>
                  <div className={`w-5 h-5 rounded flex items-center justify-center text-xs ${
                    entry.type === 'start' ? 'bg-teal-tint text-teal' :
                    entry.type === 'handoff' ? 'bg-purple-100 text-purple-600' :
                    entry.type === 'complete' ? 'bg-sage-tint text-sage' :
                    entry.type === 'approval' ? 'bg-green-100 text-green-600' :
                    'bg-cream-dark text-muted'
                  }`} aria-hidden="true">
                    {entry.type === 'start' && '→'}
                    {entry.type === 'action' && '•'}
                    {entry.type === 'handoff' && '⤳'}
                    {entry.type === 'complete' && '✓'}
                    {entry.type === 'approval' && '✓'}
                  </div>
                  <div className="flex-1">
                    <div className="text-sm text-charcoal">{entry.text}</div>
                    {entry.detail && <div className="text-xs text-muted mt-0.5">{entry.detail}</div>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // Agent Detail View
  const AgentDetailView = () => (
    <div className="flex-1 p-6 overflow-auto bg-cream-light">
      <div className="max-w-4xl">
        <button
          onClick={() => setCurrentView('project')}
          className="text-sm text-muted hover:text-charcoal mb-4 flex items-center gap-1"
        >
          ← Back to {selectedProject?.name}
        </button>

        <div className="bg-white rounded-xl border border-border-light shadow-soft mb-6">
          <div className="p-6 border-b border-border-light">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-gradient-to-br from-cream to-cream-dark rounded-xl flex items-center justify-center" aria-hidden="true">
                  <span className="text-2xl">🤖</span>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h1 ref={mainHeadingRef} tabIndex={-1} className="text-xl font-semibold text-charcoal outline-none">{selectedAgent?.name}</h1>
                    <StatusBadge status={selectedAgent?.status} />
                  </div>
                  <div className="flex items-center gap-3 mt-1">
                    <AutonomyIndicator level={selectedAgent?.autonomy} />
                    <span className="text-xs text-muted" aria-hidden="true">·</span>
                    <span className="text-xs text-muted">{selectedAgent?.tasksCompleted} tasks completed</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button className="px-3 py-1.5 text-sm text-charcoal-light border border-border-light rounded-lg hover:bg-cream">
                  Edit Agent
                </button>
                <button
                  onClick={async () => {
                    setLoading('run-agent', true);
                    await new Promise(r => setTimeout(r, 1500));
                    setLoading('run-agent', false);
                    showToast(`${selectedAgent?.name} started successfully`, 'success');
                  }}
                  disabled={loadingStates['run-agent']}
                  aria-busy={loadingStates['run-agent']}
                  className={`px-3 py-1.5 text-sm text-white rounded-lg ${
                    loadingStates['run-agent']
                      ? 'bg-muted cursor-not-allowed'
                      : 'bg-charcoal hover:bg-charcoal-light'
                  }`}
                >
                  {loadingStates['run-agent'] ? 'Starting...' : 'Run Agent Now'}
                </button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-4 divide-x divide-border-light">
            {[
              { label: 'Tasks Completed', value: selectedAgent?.tasksCompleted },
              { label: 'Approval Rate', value: `${selectedAgent?.approvalRate}%` },
              { label: 'Avg. Duration', value: '2.3 min' },
              { label: 'Error Rate', value: '2%' },
            ].map((stat, i) => (
              <div key={i} className="p-4 text-center">
                <div className="text-2xl font-semibold text-charcoal">{stat.value}</div>
                <div className="text-xs text-muted mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-3 gap-6">
          <div className="col-span-2 space-y-6">
            <div className="bg-white rounded-xl border border-border-light shadow-soft">
              <div className="px-4 py-3 border-b border-border-light">
                <h2 className="font-medium text-charcoal">Objective</h2>
              </div>
              <div className="p-4">
                <p className="text-sm text-charcoal-light leading-relaxed">
                  Evaluate incoming sales leads by analyzing company data, engagement signals, and fit criteria. 
                  Score each lead and route qualified opportunities to the appropriate sales rep for follow-up.
                </p>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-border-light shadow-soft">
              <div className="px-4 py-3 border-b border-border-light">
                <h2 className="font-medium text-charcoal">Instructions</h2>
              </div>
              <div className="p-4">
                <ol className="text-sm text-charcoal-light space-y-3">
                  <li className="flex gap-3">
                    <span className="flex-shrink-0 w-5 h-5 bg-cream-dark rounded text-xs flex items-center justify-center text-muted">1</span>
                    <span>When a new lead is received, pull company information from CRM and enrichment sources</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="flex-shrink-0 w-5 h-5 bg-cream-dark rounded text-xs flex items-center justify-center text-muted">2</span>
                    <span>Calculate lead score based on: company size (25%), industry fit (25%), engagement level (30%), timing signals (20%)</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="flex-shrink-0 w-5 h-5 bg-cream-dark rounded text-xs flex items-center justify-center text-muted">3</span>
                    <span>If score ≥ 70: mark as qualified and generate summary for sales team</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="flex-shrink-0 w-5 h-5 bg-cream-dark rounded text-xs flex items-center justify-center text-muted">4</span>
                    <span>If custom pricing is likely needed, hand off to Jamie Chen for review</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="flex-shrink-0 w-5 h-5 bg-cream-dark rounded text-xs flex items-center justify-center text-muted">5</span>
                    <span>Update CRM with qualification status and notes</span>
                  </li>
                </ol>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-border-light shadow-soft">
              <div className="px-4 py-3 border-b border-border-light">
                <h2 className="font-medium text-charcoal">Activity Log</h2>
              </div>
              <div className="p-4 space-y-3 max-h-64 overflow-auto">
                {activityLog.map((entry, i) => (
                  <div key={i} className="flex items-start gap-3 text-sm">
                    <span className="text-xs text-muted w-14">{entry.time}</span>
                    <span className={`${
                      entry.type === 'handoff' ? 'text-purple-600' :
                      entry.type === 'complete' ? 'text-sage' : 'text-charcoal-light'
                    }`}>
                      {entry.type === 'start' && '→ '}
                      {entry.type === 'action' && '• '}
                      {entry.type === 'handoff' && '⤳ '}
                      {entry.text}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-white rounded-xl border border-border-light shadow-soft">
              <div className="px-4 py-3 border-b border-border-light">
                <h2 className="font-medium text-charcoal">Triggers</h2>
              </div>
              <div className="p-4 space-y-3">
                <div className="flex items-center gap-2 text-sm">
                  <span className="w-6 h-6 bg-teal-tint rounded flex items-center justify-center text-teal text-xs">⚡</span>
                  <span className="text-charcoal-light">New lead in CRM</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <span className="w-6 h-6 bg-cream-dark rounded flex items-center justify-center text-muted text-xs">📅</span>
                  <span className="text-charcoal-light">Daily at 9:00 AM</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <span className="w-6 h-6 bg-cream-dark rounded flex items-center justify-center text-muted text-xs">👆</span>
                  <span className="text-charcoal-light">Manual trigger</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-border-light shadow-soft">
              <div className="px-4 py-3 border-b border-border-light">
                <h2 className="font-medium text-charcoal">Tools</h2>
              </div>
              <div className="p-4 space-y-2">
                {['Salesforce CRM', 'Clearbit Enrichment', 'Slack', 'Google Sheets'].map((tool, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm">
                    <span className="w-2 h-2 bg-sage rounded-full"></span>
                    <span className="text-charcoal-light">{tool}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-xl border border-border-light shadow-soft">
              <div className="px-4 py-3 border-b border-border-light">
                <h2 className="font-medium text-charcoal">Autonomy Settings</h2>
              </div>
              <div className="p-4 space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-charcoal-light">Read CRM data</span>
                  <span className="text-sage">✓ Allowed</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-charcoal-light">Update CRM records</span>
                  <span className="text-sage">✓ Allowed</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-charcoal-light">Send Slack messages</span>
                  <span className="text-amber-600">⏸ Approval</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-charcoal-light">Custom pricing leads</span>
                  <span className="text-purple-600">⤳ Handoff</span>
                </div>
                <div className="mt-4 pt-3 border-t border-border-light">
                  <div className="text-xs text-muted mb-2">Based on 47 tasks with 94% approval rate:</div>
                  <button className="w-full py-2 text-sm text-teal bg-teal-tint rounded-lg hover:bg-teal-tint">
                    Suggest expanding autonomy →
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // Performance Dashboard View (Analytics)
  const PerformanceDashboardView = () => {
    const [projectFilter, setProjectFilter] = useState('all');

    const filteredAgents = projectFilter === 'all'
      ? allTeamMembers.agents
      : allTeamMembers.agents.filter(a => a.project === projectFilter);

    const filteredHumans = projectFilter === 'all'
      ? allTeamMembers.humans
      : allTeamMembers.humans.filter(h => h.project === projectFilter);

    const totalAgentTasks = filteredAgents.reduce((sum, a) => sum + a.tasksCompleted, 0);
    const totalHumanTasks = filteredHumans.reduce((sum, h) => sum + h.tasksCompleted, 0);
    const totalTasks = totalAgentTasks + totalHumanTasks;
    const interventionRate = totalTasks > 0 ? Math.round((totalHumanTasks / totalTasks) * 100) : 0;

    const autonomyCounts = {
      autonomous: filteredAgents.filter(a => a.autonomy === 'autonomous').length,
      assisted: filteredAgents.filter(a => a.autonomy === 'assisted').length,
      supervised: filteredAgents.filter(a => a.autonomy === 'supervised').length,
    };

    return (
    <div className="flex-1 p-6 overflow-auto bg-cream-light">
      <div className="max-w-6xl">
        <div className="flex items-center justify-between mb-6">
          <h1 ref={mainHeadingRef} tabIndex={-1} className="text-2xl font-semibold text-charcoal outline-none">Performance Dashboard</h1>
          <div className="flex items-center gap-2">
            <label className="sr-only" htmlFor="perf-project-filter">Filter by project</label>
            <select
              id="perf-project-filter"
              value={projectFilter}
              onChange={(e) => setProjectFilter(e.target.value)}
              className="h-8 px-3 text-sm border border-border-light rounded-lg bg-white"
            >
              <option value="all">All Projects</option>
              {projects.map(p => (
                <option key={p.id} value={p.name}>{p.name}</option>
              ))}
            </select>
            <label className="sr-only" htmlFor="perf-date-filter">Filter by date range</label>
            <select id="perf-date-filter" className="h-8 px-3 text-sm border border-border-light rounded-lg bg-white">
              <option>Last 7 days</option>
              <option>Last 30 days</option>
              <option>Last 90 days</option>
            </select>
            <button className="px-3 py-1.5 text-sm text-charcoal-light border border-border-light rounded-lg hover:bg-cream">
              Export PDF
            </button>
          </div>
        </div>

        <div className="grid grid-cols-4 gap-4 mb-6">
          {[
            { label: 'Total Tasks', value: totalTasks.toString(), change: '+12%', trend: 'up' },
            { label: 'Agent Tasks', value: totalAgentTasks.toString(), change: '+18%', trend: 'up' },
            { label: 'Human Tasks', value: totalHumanTasks.toString(), change: '-8%', trend: 'down' },
            { label: 'Intervention Rate', value: `${interventionRate}%`, change: '-3%', trend: 'down' },
          ].map((stat, i) => (
            <div key={i} className="bg-white rounded-xl border border-border-light p-4 shadow-soft">
              <div className="text-sm text-muted mb-1">{stat.label}</div>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-semibold text-charcoal">{stat.value}</span>
                <span className={`text-xs ${stat.trend === 'up' ? 'text-sage' : 'text-amber-600'}`}>
                  {stat.change}
                </span>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-6 mb-6">
          <div className="bg-white rounded-xl border border-border-light shadow-soft">
            <div className="px-4 py-3 border-b border-border-light">
              <h2 className="font-medium text-charcoal">Task Completion Trend</h2>
            </div>
            <div className="p-4">
              <div className="h-48 flex items-end justify-between gap-2">
                {[45, 52, 38, 65, 58, 72, 47].map((value, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center gap-2">
                    <div className="w-full flex flex-col gap-1">
                      <div
                        className="w-full bg-teal rounded-t"
                        style={{ height: `${value * 1.5}px` }}
                        role="img"
                        aria-label={`Agent tasks: ${value}`}
                      />
                      <div
                        className="w-full bg-teal/20 rounded-b"
                        style={{ height: `${(100-value) * 0.3}px` }}
                        role="img"
                        aria-label={`Human tasks: ${100-value}`}
                      />
                    </div>
                    <span className="text-xs text-muted">
                      {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][i]}
                    </span>
                  </div>
                ))}
              </div>
              <div className="flex items-center justify-center gap-6 mt-4 pt-4 border-t border-border-light">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-teal rounded" aria-hidden="true" />
                  <span className="text-xs text-muted">Agent tasks</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-teal/20 rounded" aria-hidden="true" />
                  <span className="text-xs text-muted">Human tasks</span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-border-light shadow-soft">
            <div className="px-4 py-3 border-b border-border-light">
              <h2 className="font-medium text-charcoal">Top Performing Agents</h2>
            </div>
            <div className="divide-y divide-border-light">
              {filteredAgents
                .sort((a, b) => b.tasksCompleted - a.tasksCompleted)
                .slice(0, 5)
                .map((agent, i) => (
                <div key={agent.id} className="px-4 py-3 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-full bg-cream-dark flex items-center justify-center text-xs font-medium text-muted">
                      {i + 1}
                    </span>
                    <div>
                      <div className="text-sm font-medium text-charcoal">{agent.name}</div>
                      <div className="text-xs text-muted">{agent.project}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium text-charcoal">{agent.tasksCompleted}</div>
                    <div className="text-xs text-muted">tasks</div>
                  </div>
                </div>
              ))}
              {filteredAgents.length === 0 && (
                <div className="px-4 py-6 text-center text-sm text-muted">
                  No agents in this project
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6 mb-6">
          <div className="bg-white rounded-xl border border-border-light shadow-soft">
            <div className="px-4 py-3 border-b border-border-light">
              <h2 className="font-medium text-charcoal">Autonomy Progression</h2>
            </div>
            <div className="p-4">
              <div className="space-y-4">
                {[
                  { level: 'Autonomous', count: autonomyCounts.autonomous, color: 'bg-sage' },
                  { level: 'Assisted', count: autonomyCounts.assisted, color: 'bg-teal' },
                  { level: 'Supervised', count: autonomyCounts.supervised, color: 'bg-amber-500' },
                ].map(item => (
                  <div key={item.level}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm text-charcoal">{item.level}</span>
                      <span className="text-sm font-medium text-charcoal">{item.count} agents</span>
                    </div>
                    <div
                      className="h-2 bg-cream-dark rounded-full overflow-hidden"
                      role="progressbar"
                      aria-valuenow={item.count}
                      aria-valuemin={0}
                      aria-valuemax={filteredAgents.length || 1}
                      aria-label={`${item.level}: ${item.count} of ${filteredAgents.length} agents`}
                    >
                      <div
                        className={`h-full ${item.color} rounded-full`}
                        style={{ width: `${filteredAgents.length > 0 ? (item.count / filteredAgents.length) * 100 : 0}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-border-light shadow-soft">
            <div className="px-4 py-3 border-b border-border-light">
              <h2 className="font-medium text-charcoal">Time Saved This Week</h2>
            </div>
            <div className="p-6">
              <div className="text-center">
                <div className="text-4xl font-semibold text-charcoal">{projectFilter === 'all' ? '47.5' : (totalAgentTasks * 0.5).toFixed(1)} hours</div>
                <div className="text-sm text-muted mt-1">estimated time saved</div>
                <div className="text-2xl font-semibold text-sage mt-4">${projectFilter === 'all' ? '2,375' : (totalAgentTasks * 25).toLocaleString()}</div>
                <div className="text-sm text-muted">estimated value (at $50/hr)</div>
              </div>
              <div className="mt-6 grid grid-cols-3 gap-4 pt-4 border-t border-border-light">
                <div className="text-center">
                  <div className="text-lg font-semibold text-charcoal">189</div>
                  <div className="text-xs text-muted">tasks automated</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-semibold text-charcoal">15 min</div>
                  <div className="text-xs text-muted">avg. time/task</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-semibold text-charcoal">94%</div>
                  <div className="text-xs text-muted">success rate</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-sage-tint/50 border border-sage/30 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-2xl">🎉</span>
              <div>
                <div className="text-sm font-medium text-sage-dark">2 agents ready for promotion</div>
                <div className="text-xs text-sage">Based on approval rates above 95%</div>
              </div>
            </div>
            <button className="px-3 py-1.5 text-sm text-sage bg-sage-tint rounded-lg hover:bg-sage-tint">
              Review Agents
            </button>
          </div>
        </div>
      </div>
    </div>
  );
  };

  // Cost & Efficiency View (Analytics)
  const CostEfficiencyView = () => {
    const [projectFilter, setProjectFilter] = useState('all');

    const filteredAgents = projectFilter === 'all'
      ? allTeamMembers.agents
      : allTeamMembers.agents.filter(a => a.project === projectFilter);

    // Mock cost data per agent (in real app would come from backend)
    const agentCosts = {
      'Lead Qualifier': 45.20,
      'Pipeline Tracker': 22.30,
      'Outreach Sender': 52.30,
      'Invoice Processor': 28.90,
      'Expense Auditor': 18.50,
      'Onboarding Guide': 15.80,
      'Document Collector': 12.40,
    };

    const totalSpend = filteredAgents.reduce((sum, a) => sum + (agentCosts[a.name] || 0), 0);
    const totalTasks = filteredAgents.reduce((sum, a) => sum + a.tasksCompleted, 0);
    const avgCostPerTask = totalTasks > 0 ? (totalSpend / totalTasks).toFixed(2) : '0.00';

    return (
    <div className="flex-1 p-6 overflow-auto bg-cream-light">
      <div className="max-w-6xl">
        <div className="flex items-center justify-between mb-6">
          <h1 ref={mainHeadingRef} tabIndex={-1} className="text-2xl font-semibold text-charcoal outline-none">Cost & Efficiency</h1>
          <div className="flex items-center gap-2">
            <label className="sr-only" htmlFor="cost-project-filter">Filter by project</label>
            <select
              id="cost-project-filter"
              value={projectFilter}
              onChange={(e) => setProjectFilter(e.target.value)}
              className="h-8 px-3 text-sm border border-border-light rounded-lg bg-white"
            >
              <option value="all">All Projects</option>
              {projects.map(p => (
                <option key={p.id} value={p.name}>{p.name}</option>
              ))}
            </select>
            <label className="sr-only" htmlFor="cost-date-filter">Filter by date range</label>
            <select id="cost-date-filter" className="h-8 px-3 text-sm border border-border-light rounded-lg bg-white">
              <option>Last 7 days</option>
              <option>Last 30 days</option>
              <option>Last 90 days</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-4 gap-4 mb-6">
          {[
            { label: 'Total Spend', value: `$${totalSpend.toFixed(2)}`, change: '+5%', trend: 'up' },
            { label: 'Avg Cost/Task', value: `$${avgCostPerTask}`, change: '-12%', trend: 'down' },
            { label: 'Token Usage', value: projectFilter === 'all' ? '1.2M' : `${Math.round(totalTasks * 6.3)}K`, change: '+8%', trend: 'up' },
            { label: 'ROI', value: '7.6x', change: '+15%', trend: 'up' },
          ].map((stat, i) => (
            <div key={i} className="bg-white rounded-xl border border-border-light p-4 shadow-soft">
              <div className="text-sm text-muted mb-1">{stat.label}</div>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-semibold text-charcoal">{stat.value}</span>
                <span className={`text-xs ${stat.label === 'Total Spend' && stat.trend === 'up' ? 'text-amber-600' : stat.trend === 'up' ? 'text-sage' : 'text-sage'}`}>
                  {stat.change}
                </span>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-6 mb-6">
          <div className="bg-white rounded-xl border border-border-light shadow-soft">
            <div className="px-4 py-3 border-b border-border-light">
              <h2 className="font-medium text-charcoal">Cost Trend</h2>
            </div>
            <div className="p-4">
              <div className="h-48 flex items-end justify-between gap-3">
                {[42, 38, 45, 41, 39, 44, 40].map((value, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center gap-2">
                    <div
                      className="w-full bg-gradient-to-t from-teal to-teal-light rounded-t"
                      style={{ height: `${value * 3}px` }}
                    />
                    <span className="text-xs text-muted">
                      {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][i]}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-border-light shadow-soft">
            <div className="px-4 py-3 border-b border-border-light">
              <h2 className="font-medium text-charcoal">Cost by Agent</h2>
            </div>
            <div className="divide-y divide-border-light">
              {filteredAgents.slice(0, 5).map((agent) => {
                const cost = agentCosts[agent.name] || 0;
                return (
                  <div key={agent.id} className="px-4 py-3 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-medium text-charcoal">{agent.name}</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="w-24 h-2 bg-cream-dark rounded-full overflow-hidden">
                        <div
                          className="h-full bg-teal rounded-full"
                          style={{ width: `${(cost / 60) * 100}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium text-charcoal w-16 text-right">${cost.toFixed(2)}</span>
                    </div>
                  </div>
                );
              })}
              {filteredAgents.length === 0 && (
                <div className="px-4 py-6 text-center text-sm text-muted">
                  No agents in this project
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6">
          <div className="bg-white rounded-xl border border-border-light shadow-soft">
            <div className="px-4 py-3 border-b border-border-light">
              <h2 className="font-medium text-charcoal">Token Usage Breakdown</h2>
            </div>
            <div className="p-4">
              <div className="space-y-4">
                {[
                  { label: 'Input tokens', value: '820K', percentage: 68, color: 'bg-teal' },
                  { label: 'Output tokens', value: '380K', percentage: 32, color: 'bg-sage' },
                ].map(item => (
                  <div key={item.label}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm text-charcoal">{item.label}</span>
                      <span className="text-sm font-medium text-charcoal">{item.value}</span>
                    </div>
                    <div className="h-2 bg-cream-dark rounded-full overflow-hidden">
                      <div className={`h-full ${item.color} rounded-full`} style={{ width: `${item.percentage}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-border-light shadow-soft">
            <div className="px-4 py-3 border-b border-border-light">
              <h2 className="font-medium text-charcoal">Cost by Project</h2>
            </div>
            <div className="divide-y divide-border-light">
              {projects.map((project, i) => {
                const costs = [145.20, 98.50, 68.75];
                return (
                  <div key={project.id} className="px-4 py-3 flex items-center justify-between">
                    <span className="text-sm text-charcoal">{project.name}</span>
                    <span className="text-sm font-medium text-charcoal">${costs[i]}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="mt-6 bg-amber-50 border border-amber-200 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <span className="text-2xl">⚠️</span>
            <div>
              <div className="text-sm font-medium text-amber-900">Cost anomaly detected</div>
              <div className="text-xs text-amber-700">Lead Qualifier used 3x normal tokens on Tuesday. <button className="underline hover:no-underline">View details</button></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
  };

  // Quality Metrics View (Analytics)
  const QualityMetricsView = () => {
    const [projectFilter, setProjectFilter] = useState('all');

    const filteredAgents = projectFilter === 'all'
      ? allTeamMembers.agents
      : allTeamMembers.agents.filter(a => a.project === projectFilter);

    const avgApprovalRate = filteredAgents.length > 0
      ? Math.round(filteredAgents.reduce((sum, a) => sum + a.approvalRate, 0) / filteredAgents.length)
      : 0;
    const revisionRate = 100 - avgApprovalRate;

    return (
    <div className="flex-1 p-6 overflow-auto bg-cream-light">
      <div className="max-w-6xl">
        <div className="flex items-center justify-between mb-6">
          <h1 ref={mainHeadingRef} tabIndex={-1} className="text-2xl font-semibold text-charcoal outline-none">Quality Metrics</h1>
          <div className="flex items-center gap-2">
            <label className="sr-only" htmlFor="quality-project-filter">Filter by project</label>
            <select
              id="quality-project-filter"
              value={projectFilter}
              onChange={(e) => setProjectFilter(e.target.value)}
              className="h-8 px-3 text-sm border border-border-light rounded-lg bg-white"
            >
              <option value="all">All Projects</option>
              {projects.map(p => (
                <option key={p.id} value={p.name}>{p.name}</option>
              ))}
            </select>
            <label className="sr-only" htmlFor="quality-date-filter">Filter by date range</label>
            <select id="quality-date-filter" className="h-8 px-3 text-sm border border-border-light rounded-lg bg-white">
              <option>Last 7 days</option>
              <option>Last 30 days</option>
              <option>Last 90 days</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-6">
          {[
            { label: 'First-Time Accuracy', value: `${avgApprovalRate}%`, change: '+2%', description: 'Tasks completed correctly on first attempt' },
            { label: 'Revision Rate', value: `${revisionRate}%`, change: '-2%', description: 'Tasks requiring human edits' },
            { label: 'Satisfaction Score', value: '4.2/5', change: '+0.3', description: 'Average rating from task recipients' },
          ].map((stat, i) => (
            <div key={i} className="bg-white rounded-xl border border-border-light p-4 shadow-soft">
              <div className="text-sm text-muted mb-1">{stat.label}</div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-semibold text-charcoal">{stat.value}</span>
                <span className="text-xs text-sage">{stat.change}</span>
              </div>
              <div className="text-xs text-muted mt-2">{stat.description}</div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-6 mb-6">
          <div className="bg-white rounded-xl border border-border-light shadow-soft">
            <div className="px-4 py-3 border-b border-border-light">
              <h2 className="font-medium text-charcoal">Quality by Agent</h2>
            </div>
            <div className="p-4">
              <div className="space-y-3">
                {filteredAgents.map((agent) => (
                  <div key={agent.id} className="flex items-center gap-3">
                    <span className="text-sm text-charcoal w-32 truncate">{agent.name}</span>
                    <div className="flex-1 h-6 bg-cream-dark rounded-lg overflow-hidden flex">
                      <div
                        className="h-full bg-sage"
                        style={{ width: `${agent.approvalRate}%` }}
                        title={`${agent.approvalRate}% approved`}
                      />
                      <div
                        className="h-full bg-amber-500"
                        style={{ width: `${100 - agent.approvalRate - 2}%` }}
                        title="Revised"
                      />
                      <div className="h-full bg-red-500" style={{ width: '2%' }} title="Failed" />
                    </div>
                    <span className="text-sm font-medium text-charcoal w-12 text-right">{agent.approvalRate}%</span>
                  </div>
                ))}
                {filteredAgents.length === 0 && (
                  <div className="py-4 text-center text-sm text-muted">
                    No agents in this project
                  </div>
                )}
              </div>
              <div className="flex items-center justify-center gap-6 mt-4 pt-4 border-t border-border-light">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-sage rounded" aria-hidden="true" />
                  <span className="text-xs text-muted">Approved</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-amber-500 rounded" aria-hidden="true" />
                  <span className="text-xs text-muted">Revised</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-red-500 rounded" aria-hidden="true" />
                  <span className="text-xs text-muted">Failed</span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-border-light shadow-soft">
            <div className="px-4 py-3 border-b border-border-light">
              <h2 className="font-medium text-charcoal">Common Revision Types</h2>
            </div>
            <div className="p-4">
              <div className="space-y-3">
                {[
                  { type: 'Formatting issues', count: 12, percentage: 35 },
                  { type: 'Missing information', count: 8, percentage: 24 },
                  { type: 'Incorrect data', count: 6, percentage: 18 },
                  { type: 'Tone adjustments', count: 5, percentage: 15 },
                  { type: 'Other', count: 3, percentage: 8 },
                ].map((item) => (
                  <div key={item.type}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm text-charcoal">{item.type}</span>
                      <span className="text-sm text-muted">{item.count} tasks</span>
                    </div>
                    <div className="h-2 bg-cream-dark rounded-full overflow-hidden">
                      <div className="h-full bg-amber-500 rounded-full" style={{ width: `${item.percentage}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-border-light shadow-soft">
          <div className="px-4 py-3 border-b border-border-light">
            <h2 className="font-medium text-charcoal">Quality Trend Over Time</h2>
          </div>
          <div className="p-4">
            <div className="h-48 flex items-end justify-between gap-3">
              {[89, 90, 88, 91, 92, 90, 91].map((value, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-2">
                  <div
                    className="w-full bg-sage rounded"
                    style={{ height: `${(value - 80) * 10}px` }}
                  />
                  <span className="text-xs text-muted">
                    {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][i]}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-6 bg-white rounded-xl border border-border-light shadow-soft">
          <div className="px-4 py-3 border-b border-border-light flex items-center justify-between">
            <h2 className="font-medium text-charcoal">Low Quality Tasks</h2>
            <span className="text-xs text-muted">Requires review</span>
          </div>
          <div className="divide-y divide-border-light">
            {[
              { task: 'Contoso follow-up email', agent: 'Outreach Sender', issue: 'Tone too formal', time: '2h ago' },
              { task: 'Invoice #4521 processing', agent: 'Invoice Processor', issue: 'Missing line items', time: '5h ago' },
            ].map((item, i) => (
              <div key={i} className="px-4 py-3 flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium text-charcoal">{item.task}</div>
                  <div className="text-xs text-muted">{item.agent} · {item.issue}</div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-muted">{item.time}</span>
                  <button className="text-xs text-teal hover:text-teal-dark">Review</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
  };

  // Comparisons View (Analytics)
  const ComparisonsView = () => {
    const [compareAgent1, setCompareAgent1] = useState(allTeamMembers.agents[0]);
    const [compareAgent2, setCompareAgent2] = useState(allTeamMembers.agents[1]);

    return (
      <div className="flex-1 p-6 overflow-auto bg-cream-light">
        <div className="max-w-4xl">
          <h1 ref={mainHeadingRef} tabIndex={-1} className="text-2xl font-semibold text-charcoal mb-6 outline-none">Agent Comparisons</h1>

          <div className="bg-white rounded-xl border border-border-light shadow-soft mb-6">
            <div className="px-4 py-3 border-b border-border-light">
              <div className="flex items-center gap-4">
                <span className="text-sm text-muted">Compare:</span>
                <label className="sr-only" htmlFor="compare-agent-1">First agent to compare</label>
                <select
                  id="compare-agent-1"
                  value={compareAgent1?.id}
                  onChange={(e) => setCompareAgent1(allTeamMembers.agents.find(a => a.id === parseInt(e.target.value)))}
                  className="h-8 px-3 text-sm border border-border-light rounded-lg bg-white"
                >
                  {allTeamMembers.agents.map(agent => (
                    <option key={agent.id} value={agent.id}>{agent.name}</option>
                  ))}
                </select>
                <span className="text-sm text-muted">vs</span>
                <label className="sr-only" htmlFor="compare-agent-2">Second agent to compare</label>
                <select
                  id="compare-agent-2"
                  value={compareAgent2?.id}
                  onChange={(e) => setCompareAgent2(allTeamMembers.agents.find(a => a.id === parseInt(e.target.value)))}
                  className="h-8 px-3 text-sm border border-border-light rounded-lg bg-white"
                >
                  {allTeamMembers.agents.map(agent => (
                    <option key={agent.id} value={agent.id}>{agent.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="divide-y divide-border-light">
              {[
                { metric: 'Tasks Completed', key: 'tasksCompleted' },
                { metric: 'Approval Rate', key: 'approvalRate', suffix: '%' },
                { metric: 'Autonomy Level', key: 'autonomy' },
                { metric: 'Status', key: 'status' },
              ].map(({ metric, key, suffix = '' }) => {
                const val1 = compareAgent1?.[key];
                const val2 = compareAgent2?.[key];
                const winner = typeof val1 === 'number' && typeof val2 === 'number'
                  ? val1 > val2 ? 1 : val1 < val2 ? 2 : 0
                  : 0;
                return (
                  <div key={metric} className="px-4 py-3 grid grid-cols-3 gap-4 items-center">
                    <div className={`text-sm text-right ${winner === 1 ? 'font-semibold text-sage' : 'text-charcoal'}`}>
                      {val1}{suffix}
                    </div>
                    <div className="text-sm text-center text-muted">{metric}</div>
                    <div className={`text-sm ${winner === 2 ? 'font-semibold text-sage' : 'text-charcoal'}`}>
                      {val2}{suffix}
                    </div>
                  </div>
                );
              })}
              <div className="px-4 py-3 grid grid-cols-3 gap-4 items-center">
                <div className="text-sm text-right text-charcoal">$0.38</div>
                <div className="text-sm text-center text-muted">Cost Per Task</div>
                <div className="text-sm text-charcoal">$0.52</div>
              </div>
              <div className="px-4 py-3 grid grid-cols-3 gap-4 items-center">
                <div className="text-sm text-right text-charcoal">2.1 min</div>
                <div className="text-sm text-center text-muted">Avg Duration</div>
                <div className="text-sm text-charcoal">3.4 min</div>
              </div>
              <div className="px-4 py-3 grid grid-cols-3 gap-4 items-center">
                <div className="text-sm text-right text-sage font-semibold">2%</div>
                <div className="text-sm text-center text-muted">Error Rate</div>
                <div className="text-sm text-charcoal">5%</div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-border-light shadow-soft">
            <div className="px-4 py-3 border-b border-border-light">
              <h2 className="font-medium text-charcoal">Performance Over Time</h2>
            </div>
            <div className="p-4">
              <div className="h-48 flex items-end justify-between gap-2">
                {[1,2,3,4,5,6,7].map((_, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center gap-1">
                    <div className="w-full flex gap-1 justify-center items-end h-36">
                      <div
                        className="w-1/3 bg-teal rounded-t"
                        style={{ height: `${[85, 88, 90, 89, 91, 92, 94][i]}%` }}
                      />
                      <div
                        className="w-1/3 bg-purple-500 rounded-t"
                        style={{ height: `${[80, 82, 81, 85, 84, 86, 87][i]}%` }}
                      />
                    </div>
                    <span className="text-xs text-muted">
                      {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][i]}
                    </span>
                  </div>
                ))}
              </div>
              <div className="flex items-center justify-center gap-6 mt-4 pt-4 border-t border-border-light">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-teal rounded" aria-hidden="true" />
                  <span className="text-xs text-muted">{compareAgent1?.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-purple-500 rounded" aria-hidden="true" />
                  <span className="text-xs text-muted">{compareAgent2?.name}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Alerts View (Operations)
  const AlertsView = () => {
    const alerts = [
      { id: 1, severity: 'critical', title: 'Agent "Invoice Processor" error rate >20%', time: '10:32am', trigger: 'Triggered by SLA: Max Error Rate', read: false },
      { id: 2, severity: 'warning', title: 'Cost spike: Lead Qualifier +150%', time: '9:15am', trigger: 'Unusual token usage detected', read: false },
      { id: 3, severity: 'warning', title: 'Queue depth exceeded 50 tasks', time: 'Yesterday', trigger: 'Triggered by SLA: Max Queue Depth', read: true },
      { id: 4, severity: 'info', title: '"Outreach Sender" ready for promotion', time: 'Yesterday', trigger: 'Approval rate exceeded 95% for 30 days', read: true },
      { id: 5, severity: 'info', title: 'Weekly performance report available', time: '2 days ago', trigger: 'Scheduled report', read: true },
    ];

    return (
      <div className="flex-1 p-6 overflow-auto bg-cream-light">
        <div className="max-w-4xl">
          <div className="flex items-center justify-between mb-6">
            <h1 ref={mainHeadingRef} tabIndex={-1} className="text-2xl font-semibold text-charcoal outline-none">Alerts</h1>
            <div className="flex items-center gap-2">
              <label className="sr-only" htmlFor="alerts-severity-filter">Filter by severity</label>
              <select id="alerts-severity-filter" aria-label="Filter by severity" className="h-8 px-3 text-sm border border-border-light rounded-lg bg-white">
                <option>All alerts</option>
                <option>Critical</option>
                <option>Warning</option>
                <option>Info</option>
              </select>
              <label className="sr-only" htmlFor="alerts-time-filter">Filter by time</label>
              <select id="alerts-time-filter" aria-label="Filter by time" className="h-8 px-3 text-sm border border-border-light rounded-lg bg-white">
                <option>Last 24 hours</option>
                <option>Last 7 days</option>
                <option>Last 30 days</option>
              </select>
              <button className="px-3 py-1.5 text-sm text-charcoal-light border border-border-light rounded-lg hover:bg-cream">
                Mark All Read
              </button>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-border-light shadow-soft divide-y divide-border-light">
            {alerts.map(alert => (
              <div key={alert.id} className={`px-4 py-4 ${!alert.read ? 'bg-cream' : ''}`}>
                <div className="flex items-start gap-4">
                  <div className={`w-3 h-3 rounded-full mt-1.5 ${
                    alert.severity === 'critical' ? 'bg-red-500' :
                    alert.severity === 'warning' ? 'bg-amber-500' : 'bg-sage'
                  }`} aria-hidden="true" />
                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <div>
                        <span className={`text-xs font-medium uppercase ${
                          alert.severity === 'critical' ? 'text-red-600' :
                          alert.severity === 'warning' ? 'text-amber-600' : 'text-sage'
                        }`}>
                          {alert.severity}
                        </span>
                        <h3 className="text-sm font-medium text-charcoal mt-0.5">{alert.title}</h3>
                        <p className="text-xs text-muted mt-1">{alert.time} · {alert.trigger}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button className="px-2.5 py-1 text-xs text-teal hover:text-teal-dark">View</button>
                        <button className="px-2.5 py-1 text-xs text-muted hover:text-charcoal">Dismiss</button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {alerts.length === 0 && (
            <div className="bg-white rounded-xl border border-border-light p-12 text-center">
              <div className="w-16 h-16 bg-sage-tint rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">✓</span>
              </div>
              <h3 className="text-lg font-medium text-charcoal mb-2">All clear!</h3>
              <p className="text-sm text-muted">No alerts require your attention.</p>
            </div>
          )}
        </div>
      </div>
    );
  };

  // SLA Settings View (Settings)
  const SLASettingsView = () => {
    const [slaSettings, setSlaSettings] = useState({
      minApprovalRate: 85,
      maxErrorRate: 15,
      maxCostPerTask: 1.00,
      maxQueueWait: 30,
      autoPromoteEnabled: true,
      autoPromoteApprovalRate: 95,
      autoPromoteDays: 30,
      autoPromoteTasksMin: 50,
      manualApprovalRequired: false,
    });

    return (
      <div className="flex-1 p-6 overflow-auto bg-cream-light">
        <div className="max-w-2xl">
          <h1 ref={mainHeadingRef} tabIndex={-1} className="text-2xl font-semibold text-charcoal mb-6 outline-none">SLAs & Thresholds</h1>

          <div className="bg-white rounded-xl border border-border-light shadow-soft mb-6">
            <div className="px-4 py-3 border-b border-border-light">
              <h2 className="font-medium text-charcoal">Performance Thresholds</h2>
            </div>
            <div className="p-4 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <label htmlFor="minApprovalRate" className="text-sm text-charcoal">Min Approval Rate</label>
                  <p className="text-xs text-muted">Alert when agent drops below this rate</p>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    id="minApprovalRate"
                    type="number"
                    value={slaSettings.minApprovalRate}
                    onChange={(e) => setSlaSettings({...slaSettings, minApprovalRate: parseInt(e.target.value)})}
                    className="w-20 h-8 px-2 text-sm border border-border-light rounded-lg text-right"
                  />
                  <span className="text-sm text-muted">%</span>
                  <select className="h-8 px-2 text-sm border border-border-light rounded-lg bg-white">
                    <option>Warning</option>
                    <option>Critical</option>
                  </select>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <label htmlFor="maxErrorRate" className="text-sm text-charcoal">Max Error Rate</label>
                  <p className="text-xs text-muted">Alert when agent exceeds this rate</p>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    id="maxErrorRate"
                    type="number"
                    value={slaSettings.maxErrorRate}
                    onChange={(e) => setSlaSettings({...slaSettings, maxErrorRate: parseInt(e.target.value)})}
                    className="w-20 h-8 px-2 text-sm border border-border-light rounded-lg text-right"
                  />
                  <span className="text-sm text-muted">%</span>
                  <select className="h-8 px-2 text-sm border border-border-light rounded-lg bg-white">
                    <option>Critical</option>
                    <option>Warning</option>
                  </select>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <label htmlFor="maxCostPerTask" className="text-sm text-charcoal">Max Cost Per Task</label>
                  <p className="text-xs text-muted">Alert when task cost exceeds this amount</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted">$</span>
                  <input
                    id="maxCostPerTask"
                    type="number"
                    step="0.01"
                    value={slaSettings.maxCostPerTask}
                    onChange={(e) => setSlaSettings({...slaSettings, maxCostPerTask: parseFloat(e.target.value)})}
                    className="w-20 h-8 px-2 text-sm border border-border-light rounded-lg text-right"
                  />
                  <select className="h-8 px-2 text-sm border border-border-light rounded-lg bg-white">
                    <option>Warning</option>
                    <option>Critical</option>
                  </select>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <label htmlFor="maxQueueWait" className="text-sm text-charcoal">Max Queue Wait</label>
                  <p className="text-xs text-muted">Alert when tasks wait longer than this</p>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    id="maxQueueWait"
                    type="number"
                    value={slaSettings.maxQueueWait}
                    onChange={(e) => setSlaSettings({...slaSettings, maxQueueWait: parseInt(e.target.value)})}
                    className="w-20 h-8 px-2 text-sm border border-border-light rounded-lg text-right"
                  />
                  <span className="text-sm text-muted">min</span>
                  <select className="h-8 px-2 text-sm border border-border-light rounded-lg bg-white">
                    <option>Warning</option>
                    <option>Critical</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-border-light shadow-soft mb-6">
            <div className="px-4 py-3 border-b border-border-light">
              <h2 className="font-medium text-charcoal">Autonomy Promotion Rules</h2>
            </div>
            <div className="p-4 space-y-4">
              <p className="text-sm text-muted">Auto-promote agents when they meet these criteria:</p>
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={slaSettings.autoPromoteEnabled}
                  onChange={(e) => setSlaSettings({...slaSettings, autoPromoteEnabled: e.target.checked})}
                  className="mt-0.5 w-4 h-4 rounded border-border text-teal"
                />
                <div className="flex-1">
                  <span className="text-sm text-charcoal">
                    Approval rate above
                    <input
                      type="number"
                      value={slaSettings.autoPromoteApprovalRate}
                      onChange={(e) => setSlaSettings({...slaSettings, autoPromoteApprovalRate: parseInt(e.target.value)})}
                      className="w-14 h-6 px-1 mx-1 text-sm border border-border-light rounded text-center"
                      disabled={!slaSettings.autoPromoteEnabled}
                    />
                    % for
                    <input
                      type="number"
                      value={slaSettings.autoPromoteDays}
                      onChange={(e) => setSlaSettings({...slaSettings, autoPromoteDays: parseInt(e.target.value)})}
                      className="w-14 h-6 px-1 mx-1 text-sm border border-border-light rounded text-center"
                      disabled={!slaSettings.autoPromoteEnabled}
                    />
                    days
                  </span>
                </div>
              </label>
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={slaSettings.autoPromoteTasksMin > 0}
                  onChange={(e) => setSlaSettings({...slaSettings, autoPromoteTasksMin: e.target.checked ? 50 : 0})}
                  className="mt-0.5 w-4 h-4 rounded border-border text-teal"
                />
                <span className="text-sm text-charcoal">
                  Tasks completed above
                  <input
                    type="number"
                    value={slaSettings.autoPromoteTasksMin}
                    onChange={(e) => setSlaSettings({...slaSettings, autoPromoteTasksMin: parseInt(e.target.value)})}
                    className="w-14 h-6 px-1 mx-1 text-sm border border-border-light rounded text-center"
                  />
                </span>
              </label>
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={slaSettings.manualApprovalRequired}
                  onChange={(e) => setSlaSettings({...slaSettings, manualApprovalRequired: e.target.checked})}
                  className="mt-0.5 w-4 h-4 rounded border-border text-teal"
                />
                <span className="text-sm text-charcoal">Require manual approval for promotions</span>
              </label>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              onClick={() => showToast('Settings saved successfully', 'success')}
              className="px-4 py-2 text-sm text-white bg-charcoal rounded-lg hover:bg-charcoal-light"
            >
              Save Changes
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Export & Integrations View (Settings)
  const ExportSettingsView = () => (
    <div className="flex-1 p-6 overflow-auto bg-cream-light">
      <div className="max-w-2xl">
        <h1 ref={mainHeadingRef} tabIndex={-1} className="text-2xl font-semibold text-charcoal mb-6 outline-none">Export & Integrations</h1>

        <div className="bg-white rounded-xl border border-border-light shadow-soft mb-6">
          <div className="px-4 py-3 border-b border-border-light">
            <h2 className="font-medium text-charcoal">Export Reports</h2>
          </div>
          <div className="p-4 space-y-4">
            <div className="flex items-center justify-between p-3 bg-cream rounded-lg">
              <div>
                <div className="text-sm font-medium text-charcoal">Performance Report</div>
                <div className="text-xs text-muted">Tasks, approval rates, and trends</div>
              </div>
              <button className="px-3 py-1.5 text-sm text-charcoal-light border border-border-light rounded-lg hover:bg-white">
                Export PDF
              </button>
            </div>
            <div className="flex items-center justify-between p-3 bg-cream rounded-lg">
              <div>
                <div className="text-sm font-medium text-charcoal">Cost Report</div>
                <div className="text-xs text-muted">Spending, token usage, and ROI</div>
              </div>
              <button className="px-3 py-1.5 text-sm text-charcoal-light border border-border-light rounded-lg hover:bg-white">
                Export CSV
              </button>
            </div>
            <div className="flex items-center justify-between p-3 bg-cream rounded-lg">
              <div>
                <div className="text-sm font-medium text-charcoal">Activity Log</div>
                <div className="text-xs text-muted">Complete audit trail of all actions</div>
              </div>
              <button className="px-3 py-1.5 text-sm text-charcoal-light border border-border-light rounded-lg hover:bg-white">
                Export JSON
              </button>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-border-light shadow-soft mb-6">
          <div className="px-4 py-3 border-b border-border-light">
            <h2 className="font-medium text-charcoal">Scheduled Reports</h2>
          </div>
          <div className="p-4 space-y-4">
            <label className="flex items-center justify-between">
              <div>
                <div className="text-sm text-charcoal">Daily Summary</div>
                <div className="text-xs text-muted">Sent at 9:00 AM</div>
              </div>
              <Toggle id="daily-report" enabled={true} onChange={() => {}} label="Enable daily report" />
            </label>
            <label className="flex items-center justify-between">
              <div>
                <div className="text-sm text-charcoal">Weekly Report</div>
                <div className="text-xs text-muted">Sent every Monday</div>
              </div>
              <Toggle id="weekly-report" enabled={true} onChange={() => {}} label="Enable weekly report" />
            </label>
            <label className="flex items-center justify-between">
              <div>
                <div className="text-sm text-charcoal">Monthly Report</div>
                <div className="text-xs text-muted">Sent on the 1st of each month</div>
              </div>
              <Toggle id="monthly-report" enabled={false} onChange={() => {}} label="Enable monthly report" />
            </label>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-border-light shadow-soft">
          <div className="px-4 py-3 border-b border-border-light">
            <h2 className="font-medium text-charcoal">External Integrations</h2>
          </div>
          <div className="p-4 space-y-4">
            {[
              { name: 'Datadog', icon: '📊', status: 'Not connected', description: 'Push metrics to Datadog dashboards' },
              { name: 'Slack', icon: '💬', status: 'Connected', description: 'Send alerts and reports to Slack' },
              { name: 'Webhook', icon: '🔗', status: 'Not connected', description: 'Send data to custom endpoints' },
            ].map((integration) => (
              <div key={integration.name} className="flex items-center justify-between p-3 bg-cream rounded-lg">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{integration.icon}</span>
                  <div>
                    <div className="text-sm font-medium text-charcoal">{integration.name}</div>
                    <div className="text-xs text-muted">{integration.description}</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`text-xs ${integration.status === 'Connected' ? 'text-sage' : 'text-muted'}`}>
                    {integration.status}
                  </span>
                  <button className="px-3 py-1.5 text-sm text-teal hover:text-teal-dark">
                    {integration.status === 'Connected' ? 'Configure' : 'Connect'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  // Project Wizard Component - manages its own state to prevent focus loss
  const ProjectWizard = () => {
    const [step, setStep] = useState(1);
    const [mode, setMode] = useState('guided');
    const [project, setProject] = useState({
      name: '',
      goal: '',
      template: null,
      status: 'draft',
      agents: [],
      sops: [],
      tools: [],
      people: [],
      workflow: { nodes: [], connections: [], triggers: [] }
    });

    const selectedAgents = allTeamMembers.agents.filter(a => project.agents.includes(a.id));
    const selectedPeople = allTeamMembers.humans.filter(p => project.people.includes(p.id));
    const selectedTools = tools.filter(t => project.tools.includes(t.id));
    const selectedSOPs = sopLibrary.filter(s => project.sops.includes(s.id));

    // Wizard Progress Sub-component
    const Progress = () => {
      const steps = [
        { num: 1, label: 'Basics' },
        { num: 2, label: 'Agents' },
        { num: 3, label: 'SOPs' },
        { num: 4, label: 'Tools' },
        { num: 5, label: 'People' },
        { num: 6, label: 'Workflow' },
        { num: 7, label: 'Review' },
      ];

      return (
        <nav aria-label="Project setup progress" className="mb-8">
          <ol className="flex items-center">
            {steps.map((s, i) => {
              const isCompleted = step > s.num;
              const isCurrent = step === s.num;
              return (
                <li key={s.num} className="flex items-center flex-1 last:flex-none">
                  <button
                    onClick={() => isCompleted && setStep(s.num)}
                    disabled={!isCompleted}
                    className={`flex flex-col items-center ${isCompleted ? 'cursor-pointer' : 'cursor-default'}`}
                    aria-current={isCurrent ? 'step' : undefined}
                  >
                    <span
                      className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
                        isCompleted ? 'bg-sage text-white' : isCurrent ? 'bg-teal text-white' : 'bg-border-light text-muted'
                      }`}
                    >
                      {isCompleted ? (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                      ) : s.num}
                    </span>
                    <span className={`mt-2 text-xs font-medium ${isCurrent ? 'text-teal' : 'text-muted'}`}>{s.label}</span>
                  </button>
                  {i < steps.length - 1 && (
                    <div className={`flex-1 h-0.5 mx-3 -mt-6 ${step > s.num ? 'bg-sage' : 'bg-border-light'}`} />
                  )}
                </li>
              );
            })}
          </ol>
        </nav>
      );
    };

    const initializeWorkflow = () => {
      const nodes = [
        { id: 'start', type: 'start', name: 'Start', position: { x: 50, y: 150 } },
        ...selectedAgents.map((agent, i) => ({
          id: `agent-${agent.id}`, type: 'agent', entityId: agent.id, name: agent.name,
          position: { x: 200 + i * 180, y: 100 + (i % 2) * 100 }
        })),
        ...selectedPeople.slice(0, 1).map((person) => ({
          id: `person-${person.id}`, type: 'person', entityId: person.id, name: person.name,
          position: { x: 200 + selectedAgents.length * 180, y: 150 }
        })),
        { id: 'end', type: 'end', name: 'Complete', position: { x: 200 + (selectedAgents.length + 1) * 180, y: 150 } }
      ];
      setProject({ ...project, workflow: { ...project.workflow, nodes } });
    };

    const handleLaunch = async () => {
      setLoading('launch-project', true);
      await new Promise(r => setTimeout(r, 1500));
      setLoading('launch-project', false);
      showToast(`Project "${project.name}" created successfully!`, 'success');
      setCurrentView('command-center');
    };

    const handleSaveDraft = async () => {
      setLoading('save-draft', true);
      await new Promise(r => setTimeout(r, 1000));
      setLoading('save-draft', false);
      showToast('Project saved as draft', 'success');
      setCurrentView('command-center');
    };

    return (
      <div className="flex-1 p-6 overflow-auto bg-cream-light">
        <div className="max-w-3xl mx-auto">
          <button onClick={() => setCurrentView('command-center')} className="text-sm text-muted hover:text-charcoal mb-4 flex items-center gap-1">
            ← Cancel
          </button>

          <h1 ref={mainHeadingRef} tabIndex={-1} className="text-2xl font-semibold text-charcoal mb-2 outline-none">Create New Project</h1>
          <p className="text-sm text-muted mb-6">
            {step === 1 && 'Set up a new project to organize your agents, SOPs, and workflows.'}
            {step === 2 && 'Step 2: Select the agents that will work on this project.'}
            {step === 3 && 'Step 3: Assign Standard Operating Procedures to guide your agents.'}
            {step === 4 && 'Step 4: Select the tools your agents will use.'}
            {step === 5 && 'Step 5: Assign team members for handoffs and supervision.'}
            {step === 6 && 'Step 6: Design how work flows between agents and people.'}
            {step === 7 && 'Step 7: Review your configuration and launch.'}
          </p>

          <Progress />

          {/* Step 1: Basics */}
          {step === 1 && (
            <div className="bg-white rounded-xl border border-border-light shadow-soft p-6">
              <h2 className="text-lg font-medium text-charcoal mb-4">Project Basics</h2>
              <div className="space-y-6">
                <div>
                  <label htmlFor="project-name" className="block text-sm font-medium text-charcoal mb-2">
                    Project Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="project-name"
                    type="text"
                    value={project.name}
                    onChange={(e) => setProject({ ...project, name: e.target.value })}
                    placeholder="e.g., Sales Pipeline Automation"
                    className="w-full h-10 px-3 border border-border-light rounded-lg text-sm focus:outline-none focus:border-teal"
                  />
                </div>
                <div>
                  <label htmlFor="project-goal" className="block text-sm font-medium text-charcoal mb-2">
                    Project Goal <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    id="project-goal"
                    value={project.goal}
                    onChange={(e) => setProject({ ...project, goal: e.target.value })}
                    placeholder="Describe what you want to achieve with this project."
                    rows={4}
                    className="w-full px-3 py-2 border border-border-light rounded-lg text-sm focus:outline-none focus:border-teal resize-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-charcoal mb-3">Start from a Template (Optional)</label>
                  <div className="grid grid-cols-2 gap-3">
                    {projectTemplates.map((template) => (
                      <button
                        key={template.id}
                        onClick={() => setProject({ ...project, template: template.id })}
                        className={`p-4 rounded-xl border text-left transition-all ${
                          project.template === template.id ? 'border-teal bg-teal-tint ring-2 ring-teal/20' : 'border-border-light hover:border-border'
                        }`}
                      >
                        <div className="flex items-center gap-3 mb-2">
                          <span className="text-2xl">{template.icon}</span>
                          <span className="font-medium text-charcoal">{template.name}</span>
                        </div>
                        <p className="text-xs text-muted">{template.description}</p>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Agents */}
          {step === 2 && (
            <div className="bg-white rounded-xl border border-border-light shadow-soft p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-medium text-charcoal">Add Agents</h2>
                <button className="text-sm text-teal hover:text-teal-dark">+ Create New Agent</button>
              </div>
              <p className="text-sm text-muted mb-4">Select at least one agent for this project.</p>
              <div className="space-y-3">
                {allTeamMembers.agents.map((agent) => {
                  const isSelected = project.agents.includes(agent.id);
                  return (
                    <div
                      key={agent.id}
                      onClick={() => setProject({
                        ...project,
                        agents: isSelected ? project.agents.filter((id) => id !== agent.id) : [...project.agents, agent.id]
                      })}
                      className={`p-4 rounded-xl border cursor-pointer transition-all ${
                        isSelected ? 'border-teal bg-teal-tint ring-2 ring-teal/20' : 'border-border-light hover:border-border'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-cream to-cream-dark rounded-lg flex items-center justify-center"><span className="text-lg">🤖</span></div>
                          <div>
                            <div className="text-sm font-medium text-charcoal">{agent.name}</div>
                            <div className="flex items-center gap-2 mt-0.5">
                              <AutonomyIndicator level={agent.autonomy} />
                              <span className="text-xs text-muted">·</span>
                              <span className="text-xs text-muted">{agent.tasksCompleted} tasks</span>
                            </div>
                          </div>
                        </div>
                        <span className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${isSelected ? 'border-teal bg-teal' : 'border-border'}`}>
                          {isSelected && <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
              {project.agents.length > 0 && (
                <div className="mt-4 p-3 bg-teal-tint border border-teal/30 rounded-lg">
                  <div className="text-sm text-teal-dark"><strong>{project.agents.length}</strong> agent{project.agents.length !== 1 ? 's' : ''} selected</div>
                </div>
              )}
            </div>
          )}

          {/* Step 3: SOPs */}
          {step === 3 && (
            <div className="bg-white rounded-xl border border-border-light shadow-soft p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-medium text-charcoal">Define SOPs</h2>
                <button className="text-sm text-teal hover:text-teal-dark">+ Create New SOP</button>
              </div>
              <p className="text-sm text-muted mb-4">SOPs define how agents should complete tasks. This step is optional.</p>
              <div className="grid grid-cols-2 gap-3">
                {sopLibrary.map((sop) => (
                  <SOPCard
                    key={sop.id}
                    sop={sop}
                    selected={project.sops.includes(sop.id)}
                    onToggle={(id) => setProject({
                      ...project,
                      sops: project.sops.includes(id) ? project.sops.filter((s) => s !== id) : [...project.sops, id]
                    })}
                  />
                ))}
              </div>
              {project.sops.length > 0 && (
                <div className="mt-4 p-3 bg-teal-tint border border-teal/30 rounded-lg">
                  <div className="text-sm text-teal-dark"><strong>{project.sops.length}</strong> SOP{project.sops.length !== 1 ? 's' : ''} selected</div>
                </div>
              )}
            </div>
          )}

          {/* Step 4: Tools */}
          {step === 4 && (
            <div className="bg-white rounded-xl border border-border-light shadow-soft p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-medium text-charcoal">Connect Tools</h2>
                <button onClick={() => setCurrentView('tools-add')} className="text-sm text-teal hover:text-teal-dark">+ Connect New Tool</button>
              </div>
              <p className="text-sm text-muted mb-4">Select which connected tools this project's agents can use.</p>
              <div className="space-y-3">
                {tools.filter(t => t.status === 'connected').map((tool) => {
                  const isSelected = project.tools.includes(tool.id);
                  return (
                    <div
                      key={tool.id}
                      onClick={() => setProject({
                        ...project,
                        tools: isSelected ? project.tools.filter((id) => id !== tool.id) : [...project.tools, tool.id]
                      })}
                      className={`p-4 rounded-xl border cursor-pointer transition-all ${
                        isSelected ? 'border-teal bg-teal-tint ring-2 ring-teal/20' : 'border-border-light hover:border-border'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-cream-dark rounded-lg flex items-center justify-center text-xl">{tool.icon}</div>
                          <div>
                            <div className="text-sm font-medium text-charcoal">{tool.name}</div>
                            <div className="text-xs text-muted">{tool.description}</div>
                          </div>
                        </div>
                        <span className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${isSelected ? 'border-teal bg-teal' : 'border-border'}`}>
                          {isSelected && <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
              {tools.filter(t => t.status === 'connected').length === 0 && (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-cream-dark rounded-full flex items-center justify-center mx-auto mb-4"><span className="text-2xl">🔌</span></div>
                  <p className="text-sm text-muted mb-4">No tools connected yet.</p>
                </div>
              )}
            </div>
          )}

          {/* Step 5: People */}
          {step === 5 && (
            <div className="bg-white rounded-xl border border-border-light shadow-soft p-6">
              <h2 className="text-lg font-medium text-charcoal mb-4">Assign People</h2>
              <p className="text-sm text-muted mb-4">Select at least one person to supervise this project.</p>
              <div className="space-y-3">
                {allTeamMembers.humans.map((person) => {
                  const isSelected = project.people.includes(person.id);
                  const isSupervisor = project.people[0] === person.id;
                  return (
                    <div
                      key={person.id}
                      onClick={() => setProject({
                        ...project,
                        people: isSelected ? project.people.filter((id) => id !== person.id) : [...project.people, person.id]
                      })}
                      className={`p-4 rounded-xl border cursor-pointer transition-all ${
                        isSelected ? 'border-teal bg-teal-tint ring-2 ring-teal/20' : 'border-border-light hover:border-border'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-teal-tint to-teal/20 rounded-full flex items-center justify-center text-sm font-medium text-teal-dark">{person.avatar}</div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-medium text-charcoal">{person.name}</span>
                              {isSupervisor && <span className="px-1.5 py-0.5 bg-amber-100 text-amber-700 text-xs rounded">Supervisor</span>}
                            </div>
                            <div className="text-xs text-muted">{person.role}</div>
                          </div>
                        </div>
                        <span className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${isSelected ? 'border-teal bg-teal' : 'border-border'}`}>
                          {isSelected && <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
              {project.people.length > 0 && (
                <div className="mt-4 p-3 bg-teal-tint border border-teal/30 rounded-lg">
                  <div className="text-sm text-teal-dark"><strong>{project.people.length}</strong> person{project.people.length !== 1 ? 's' : ''} assigned. First selected is supervisor.</div>
                </div>
              )}
            </div>
          )}

          {/* Step 6: Workflow */}
          {step === 6 && (
            <div className="bg-white rounded-xl border border-border-light shadow-soft p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-medium text-charcoal">Design Workflow</h2>
                <div className="flex items-center gap-2 bg-cream-dark rounded-lg p-1">
                  <button onClick={() => setMode('guided')} className={`px-3 py-1 text-sm rounded-md transition-colors ${mode === 'guided' ? 'bg-white shadow text-charcoal' : 'text-charcoal-light'}`}>Guided</button>
                  <button onClick={() => { setMode('advanced'); if (project.workflow.nodes.length === 0) initializeWorkflow(); }} className={`px-3 py-1 text-sm rounded-md transition-colors ${mode === 'advanced' ? 'bg-white shadow text-charcoal' : 'text-charcoal-light'}`}>Advanced</button>
                </div>
              </div>

              {mode === 'guided' ? (
                <div className="space-y-6">
                  <div className="p-4 bg-cream rounded-lg">
                    <label className="block text-sm font-medium text-charcoal mb-2">What triggers this workflow?</label>
                    <div className="space-y-2">
                      {[{ id: 'manual', label: 'Manual trigger', desc: 'Started by a team member' }, { id: 'schedule', label: 'On a schedule', desc: 'Runs at specific times' }, { id: 'event', label: 'When data arrives', desc: 'New lead, invoice, or record' }].map((t) => (
                        <label key={t.id} className="flex items-center gap-3 p-3 bg-white rounded-lg border border-border-light cursor-pointer hover:border-border">
                          <input type="radio" name="trigger" value={t.id} className="w-4 h-4 text-teal" />
                          <div><div className="text-sm font-medium text-charcoal">{t.label}</div><div className="text-xs text-muted">{t.desc}</div></div>
                        </label>
                      ))}
                    </div>
                  </div>
                  <div className="p-4 bg-cream rounded-lg">
                    <label className="block text-sm font-medium text-charcoal mb-2">Which agent handles the work first?</label>
                    <select className="w-full h-10 px-3 border border-border-light rounded-lg bg-white text-sm">
                      <option value="">Select an agent...</option>
                      {selectedAgents.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                    </select>
                  </div>
                  <div className="p-4 bg-cream rounded-lg">
                    <label className="block text-sm font-medium text-charcoal mb-2">When should a human be involved?</label>
                    <div className="space-y-2">
                      {['Before sending external communications', 'When an error occurs', 'When agent confidence is low', 'Review all outputs'].map((opt, i) => (
                        <label key={i} className="flex items-center gap-3 cursor-pointer"><input type="checkbox" className="w-4 h-4 rounded text-teal" /><span className="text-sm text-charcoal">{opt}</span></label>
                      ))}
                    </div>
                  </div>
                  <div className="p-4 bg-teal-tint border border-teal/30 rounded-lg">
                    <div className="flex items-start gap-3"><span className="text-teal">💡</span><div className="text-sm text-teal-dark">Based on your selections, we'll create a workflow that can be refined later.</div></div>
                  </div>
                </div>
              ) : (
                <div>
                  <p className="text-sm text-muted mb-4">Drag and position nodes to design your workflow.</p>
                  <div className="relative h-96 bg-cream rounded-lg border-2 border-dashed border-border-light overflow-hidden" style={{ backgroundImage: 'radial-gradient(circle, #e2e8f0 1px, transparent 1px)', backgroundSize: '20px 20px' }}>
                    <svg className="absolute inset-0 w-full h-full pointer-events-none">
                      <defs><marker id="arrowhead" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto"><polygon points="0 0, 10 3.5, 0 7" fill="#94a3b8" /></marker></defs>
                    </svg>
                    {project.workflow.nodes.map((node) => <WorkflowNode key={node.id} node={node} selected={false} onSelect={() => {}} onDrag={() => {}} />)}
                    {project.workflow.nodes.length === 0 && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <button onClick={initializeWorkflow} className="px-4 py-2 bg-white border border-border-light rounded-lg text-sm text-charcoal-light hover:border-border">Initialize Workflow</button>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Step 7: Review */}
          {step === 7 && (
            <div className="bg-white rounded-xl border border-border-light shadow-soft p-6 mb-6">
              <h2 className="text-lg font-medium text-charcoal mb-4">Review Your Project</h2>
              <div className="space-y-6">
                <div className="p-4 bg-cream rounded-lg">
                  <div className="flex items-center justify-between mb-2"><h3 className="text-sm font-medium text-charcoal">Project Details</h3><button onClick={() => setStep(1)} className="text-xs text-teal">Edit</button></div>
                  <div className="space-y-2">
                    <div><span className="text-xs text-muted">Name:</span><span className="text-sm text-charcoal ml-2">{project.name}</span></div>
                    <div><span className="text-xs text-muted">Goal:</span><p className="text-sm text-charcoal mt-1">{project.goal}</p></div>
                  </div>
                </div>
                <div className="p-4 bg-cream rounded-lg">
                  <div className="flex items-center justify-between mb-2"><h3 className="text-sm font-medium text-charcoal">Agents ({selectedAgents.length})</h3><button onClick={() => setStep(2)} className="text-xs text-teal">Edit</button></div>
                  <div className="flex flex-wrap gap-2">{selectedAgents.map(a => <span key={a.id} className="px-2 py-1 bg-white border border-border-light rounded text-xs">🤖 {a.name}</span>)}</div>
                </div>
                <div className="p-4 bg-cream rounded-lg">
                  <div className="flex items-center justify-between mb-2"><h3 className="text-sm font-medium text-charcoal">SOPs ({selectedSOPs.length})</h3><button onClick={() => setStep(3)} className="text-xs text-teal">Edit</button></div>
                  {selectedSOPs.length > 0 ? <div className="flex flex-wrap gap-2">{selectedSOPs.map(s => <span key={s.id} className="px-2 py-1 bg-white border border-border-light rounded text-xs">📋 {s.name}</span>)}</div> : <span className="text-xs text-muted">None</span>}
                </div>
                <div className="p-4 bg-cream rounded-lg">
                  <div className="flex items-center justify-between mb-2"><h3 className="text-sm font-medium text-charcoal">Tools ({selectedTools.length})</h3><button onClick={() => setStep(4)} className="text-xs text-teal">Edit</button></div>
                  {selectedTools.length > 0 ? <div className="flex flex-wrap gap-2">{selectedTools.map(t => <span key={t.id} className="px-2 py-1 bg-white border border-border-light rounded text-xs">{t.icon} {t.name}</span>)}</div> : <span className="text-xs text-muted">None</span>}
                </div>
                <div className="p-4 bg-cream rounded-lg">
                  <div className="flex items-center justify-between mb-2"><h3 className="text-sm font-medium text-charcoal">People ({selectedPeople.length})</h3><button onClick={() => setStep(5)} className="text-xs text-teal">Edit</button></div>
                  <div className="flex flex-wrap gap-2">{selectedPeople.map((p, i) => <span key={p.id} className="px-2 py-1 bg-white border border-border-light rounded text-xs">👤 {p.name} {i === 0 && <span className="text-amber-600">(Supervisor)</span>}</span>)}</div>
                </div>
              </div>
            </div>
          )}

          {/* Validation warnings */}
          {step === 7 && (selectedAgents.length === 0 || selectedPeople.length === 0) && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
              <div className="flex items-start gap-3">
                <span className="text-amber-500">⚠️</span>
                <div>
                  <div className="text-sm font-medium text-amber-800">Missing requirements</div>
                  <ul className="text-xs text-amber-700 mt-1 list-disc list-inside">
                    {selectedAgents.length === 0 && <li>At least one agent is required</li>}
                    {selectedPeople.length === 0 && <li>At least one supervisor is required</li>}
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="mt-6 flex items-center justify-between">
            <button onClick={() => step === 1 ? setCurrentView('command-center') : setStep(step - 1)} className="px-4 py-2 text-sm text-charcoal-light hover:text-charcoal">
              {step === 1 ? 'Cancel' : '← Back'}
            </button>
            <div className="flex items-center gap-3">
              {(step === 3 || step === 4) && <button onClick={() => setStep(step + 1)} className="px-4 py-2 text-sm text-charcoal-light">Skip</button>}
              {step === 7 ? (
                <>
                  <button onClick={handleSaveDraft} disabled={loadingStates['save-draft']} className="px-4 py-2 text-sm text-charcoal-light border border-border-light rounded-lg hover:bg-cream">
                    {loadingStates['save-draft'] ? 'Saving...' : 'Save Draft'}
                  </button>
                  <button
                    onClick={handleLaunch}
                    disabled={loadingStates['launch-project'] || selectedAgents.length === 0 || selectedPeople.length === 0}
                    className={`px-6 py-2 text-sm font-medium rounded-lg ${
                      selectedAgents.length > 0 && selectedPeople.length > 0 && !loadingStates['launch-project']
                        ? 'bg-sage text-white hover:bg-sage-dark' : 'bg-border-light text-muted cursor-not-allowed'
                    }`}
                  >
                    {loadingStates['launch-project'] ? 'Launching...' : 'Launch Project'}
                  </button>
                </>
              ) : (
                <button
                  onClick={() => setStep(step + 1)}
                  disabled={(step === 1 && (!project.name || !project.goal)) || (step === 2 && project.agents.length === 0) || (step === 5 && project.people.length === 0)}
                  className={`px-6 py-2 text-sm font-medium rounded-lg ${
                    (step === 1 && project.name && project.goal) || (step === 2 && project.agents.length > 0) || (step === 5 && project.people.length > 0) || step === 3 || step === 4 || step === 6
                      ? 'bg-teal text-white hover:bg-teal-dark' : 'bg-border-light text-muted cursor-not-allowed'
                  }`}
                >
                  {step === 6 ? 'Continue to Review' : 'Continue'}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Old wizard steps removed - ProjectWizard now handles all steps internally
  // The following placeholder will be deleted:
  const _UnusedWizardStep2 = () => (
    <div className="flex-1 p-6 overflow-auto bg-cream-light">
      <div className="max-w-3xl mx-auto">
        <button
          onClick={() => setCurrentView('command-center')}
          className="text-sm text-muted hover:text-charcoal mb-4 flex items-center gap-1"
        >
          ← Cancel
        </button>

        <h1 className="text-2xl font-semibold text-charcoal mb-2">Create New Project</h1>
        <p className="text-sm text-muted mb-6">Step 2: Select the agents that will work on this project.</p>

        <WizardProgress currentStep={wizardStep} />

        <div className="bg-white rounded-xl border border-border-light shadow-soft p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-medium text-charcoal">Add Agents</h2>
            <button className="text-sm text-teal hover:text-teal-dark">+ Create New Agent</button>
          </div>

          <p className="text-sm text-muted mb-4">Select at least one agent for this project. You can change this later.</p>

          <div className="space-y-3">
            {allTeamMembers.agents.map((agent) => {
              const isSelected = newProject.agents.includes(agent.id);
              return (
                <div
                  key={agent.id}
                  onClick={() => {
                    setNewProject({
                      ...newProject,
                      agents: isSelected
                        ? newProject.agents.filter((id) => id !== agent.id)
                        : [...newProject.agents, agent.id]
                    });
                  }}
                  className={`p-4 rounded-xl border cursor-pointer transition-all ${
                    isSelected
                      ? 'border-teal bg-teal-tint ring-2 ring-teal/20'
                      : 'border-border-light hover:border-border'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-cream to-cream-dark rounded-lg flex items-center justify-center">
                        <span className="text-lg">🤖</span>
                      </div>
                      <div>
                        <div className="text-sm font-medium text-charcoal">{agent.name}</div>
                        <div className="flex items-center gap-2 mt-0.5">
                          <AutonomyIndicator level={agent.autonomy} />
                          <span className="text-xs text-muted">·</span>
                          <span className="text-xs text-muted">{agent.tasksCompleted} tasks</span>
                        </div>
                      </div>
                    </div>
                    <span className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                      isSelected ? 'border-teal bg-teal' : 'border-border'
                    }`}>
                      {isSelected && (
                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {newProject.agents.length > 0 && (
            <div className="mt-4 p-3 bg-teal-tint border border-teal/30 rounded-lg">
              <div className="text-sm text-teal-dark">
                <strong>{newProject.agents.length}</strong> agent{newProject.agents.length !== 1 ? 's' : ''} selected
              </div>
            </div>
          )}
        </div>

        <div className="mt-6 flex items-center justify-between">
          <button
            onClick={() => setWizardStep(1)}
            className="px-4 py-2 text-sm text-charcoal-light hover:text-charcoal"
          >
            ← Back
          </button>
          <button
            onClick={() => setWizardStep(3)}
            disabled={newProject.agents.length === 0}
            className={`px-6 py-2 text-sm font-medium rounded-lg transition-colors ${
              newProject.agents.length > 0
                ? 'bg-teal text-white hover:bg-teal-dark'
                : 'bg-border-light text-muted cursor-not-allowed'
            }`}
          >
            Continue
          </button>
        </div>
      </div>
    </div>
  );

  // Project Wizard - Step 3: Define SOPs
  const ProjectWizardStep3 = () => (
    <div className="flex-1 p-6 overflow-auto bg-cream-light">
      <div className="max-w-3xl mx-auto">
        <button
          onClick={() => setCurrentView('command-center')}
          className="text-sm text-muted hover:text-charcoal mb-4 flex items-center gap-1"
        >
          ← Cancel
        </button>

        <h1 className="text-2xl font-semibold text-charcoal mb-2">Create New Project</h1>
        <p className="text-sm text-muted mb-6">Step 3: Assign Standard Operating Procedures to guide your agents.</p>

        <WizardProgress currentStep={wizardStep} />

        <div className="bg-white rounded-xl border border-border-light shadow-soft p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-medium text-charcoal">Define SOPs</h2>
            <button className="text-sm text-teal hover:text-teal-dark">+ Create New SOP</button>
          </div>

          <p className="text-sm text-muted mb-4">
            SOPs define how agents should complete tasks. This step is optional but recommended.
          </p>

          <div className="grid grid-cols-2 gap-3">
            {sopLibrary.map((sop) => (
              <SOPCard
                key={sop.id}
                sop={sop}
                selected={newProject.sops.includes(sop.id)}
                onToggle={(id) => {
                  setNewProject({
                    ...newProject,
                    sops: newProject.sops.includes(id)
                      ? newProject.sops.filter((s) => s !== id)
                      : [...newProject.sops, id]
                  });
                }}
              />
            ))}
          </div>

          {newProject.sops.length > 0 && (
            <div className="mt-4 p-3 bg-teal-tint border border-teal/30 rounded-lg">
              <div className="text-sm text-teal-dark">
                <strong>{newProject.sops.length}</strong> SOP{newProject.sops.length !== 1 ? 's' : ''} selected
              </div>
            </div>
          )}
        </div>

        <div className="mt-6 flex items-center justify-between">
          <button
            onClick={() => setWizardStep(2)}
            className="px-4 py-2 text-sm text-charcoal-light hover:text-charcoal"
          >
            ← Back
          </button>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setWizardStep(4)}
              className="px-4 py-2 text-sm text-charcoal-light hover:text-charcoal"
            >
              Skip for now
            </button>
            <button
              onClick={() => setWizardStep(4)}
              className="px-6 py-2 text-sm font-medium bg-teal text-white rounded-lg hover:bg-teal-dark"
            >
              Continue
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  // Project Wizard - Step 4: Connect Tools
  const ProjectWizardStep4 = () => (
    <div className="flex-1 p-6 overflow-auto bg-cream-light">
      <div className="max-w-3xl mx-auto">
        <button
          onClick={() => setCurrentView('command-center')}
          className="text-sm text-muted hover:text-charcoal mb-4 flex items-center gap-1"
        >
          ← Cancel
        </button>

        <h1 className="text-2xl font-semibold text-charcoal mb-2">Create New Project</h1>
        <p className="text-sm text-muted mb-6">Step 4: Select the tools your agents will use.</p>

        <WizardProgress currentStep={wizardStep} />

        <div className="bg-white rounded-xl border border-border-light shadow-soft p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-medium text-charcoal">Connect Tools</h2>
            <button
              onClick={() => setCurrentView('tools-add')}
              className="text-sm text-teal hover:text-teal-dark"
            >
              + Connect New Tool
            </button>
          </div>

          <p className="text-sm text-muted mb-4">
            Select which connected tools this project's agents can use. This step is optional.
          </p>

          <div className="space-y-3">
            {tools.filter(t => t.status === 'connected').map((tool) => {
              const isSelected = newProject.tools.includes(tool.id);
              return (
                <div
                  key={tool.id}
                  onClick={() => {
                    setNewProject({
                      ...newProject,
                      tools: isSelected
                        ? newProject.tools.filter((id) => id !== tool.id)
                        : [...newProject.tools, tool.id]
                    });
                  }}
                  className={`p-4 rounded-xl border cursor-pointer transition-all ${
                    isSelected
                      ? 'border-teal bg-teal-tint ring-2 ring-teal/20'
                      : 'border-border-light hover:border-border'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-cream-dark rounded-lg flex items-center justify-center text-xl">
                        {tool.icon}
                      </div>
                      <div>
                        <div className="text-sm font-medium text-charcoal">{tool.name}</div>
                        <div className="text-xs text-muted">{tool.description}</div>
                      </div>
                    </div>
                    <span className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                      isSelected ? 'border-teal bg-teal' : 'border-border'
                    }`}>
                      {isSelected && (
                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {tools.filter(t => t.status === 'connected').length === 0 && (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-cream-dark rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🔌</span>
              </div>
              <p className="text-sm text-muted mb-4">No tools connected yet.</p>
              <button
                onClick={() => setCurrentView('tools-add')}
                className="text-sm text-teal hover:text-teal-dark"
              >
                Connect your first tool →
              </button>
            </div>
          )}

          {newProject.tools.length > 0 && (
            <div className="mt-4 p-3 bg-teal-tint border border-teal/30 rounded-lg">
              <div className="text-sm text-teal-dark">
                <strong>{newProject.tools.length}</strong> tool{newProject.tools.length !== 1 ? 's' : ''} selected
              </div>
            </div>
          )}
        </div>

        <div className="mt-6 flex items-center justify-between">
          <button
            onClick={() => setWizardStep(3)}
            className="px-4 py-2 text-sm text-charcoal-light hover:text-charcoal"
          >
            ← Back
          </button>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setWizardStep(5)}
              className="px-4 py-2 text-sm text-charcoal-light hover:text-charcoal"
            >
              Skip for now
            </button>
            <button
              onClick={() => setWizardStep(5)}
              className="px-6 py-2 text-sm font-medium bg-teal text-white rounded-lg hover:bg-teal-dark"
            >
              Continue
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  // Project Wizard - Step 5: Assign People
  const ProjectWizardStep5 = () => (
    <div className="flex-1 p-6 overflow-auto bg-cream-light">
      <div className="max-w-3xl mx-auto">
        <button
          onClick={() => setCurrentView('command-center')}
          className="text-sm text-muted hover:text-charcoal mb-4 flex items-center gap-1"
        >
          ← Cancel
        </button>

        <h1 className="text-2xl font-semibold text-charcoal mb-2">Create New Project</h1>
        <p className="text-sm text-muted mb-6">Step 5: Assign team members for handoffs and supervision.</p>

        <WizardProgress currentStep={wizardStep} />

        <div className="bg-white rounded-xl border border-border-light shadow-soft p-6">
          <h2 className="text-lg font-medium text-charcoal mb-4">Assign People</h2>

          <p className="text-sm text-muted mb-4">
            Select at least one person to supervise this project and handle handoffs from agents.
          </p>

          <div className="space-y-3">
            {allTeamMembers.humans.map((person) => {
              const isSelected = newProject.people.includes(person.id);
              const isSupervisor = newProject.people[0] === person.id;
              return (
                <div
                  key={person.id}
                  onClick={() => {
                    setNewProject({
                      ...newProject,
                      people: isSelected
                        ? newProject.people.filter((id) => id !== person.id)
                        : [...newProject.people, person.id]
                    });
                  }}
                  className={`p-4 rounded-xl border cursor-pointer transition-all ${
                    isSelected
                      ? 'border-teal bg-teal-tint ring-2 ring-teal/20'
                      : 'border-border-light hover:border-border'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-teal-tint to-teal/20 rounded-full flex items-center justify-center text-sm font-medium text-teal-dark">
                        {person.avatar}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-charcoal">{person.name}</span>
                          {isSupervisor && (
                            <span className="px-1.5 py-0.5 bg-amber-100 text-amber-700 text-xs rounded">
                              Supervisor
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-muted">{person.role}</div>
                      </div>
                    </div>
                    <span className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                      isSelected ? 'border-teal bg-teal' : 'border-border'
                    }`}>
                      {isSelected && (
                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {newProject.people.length > 0 && (
            <div className="mt-4 p-3 bg-teal-tint border border-teal/30 rounded-lg">
              <div className="text-sm text-teal-dark">
                <strong>{newProject.people.length}</strong> person{newProject.people.length !== 1 ? 's' : ''} assigned.
                First selected person will be the project supervisor.
              </div>
            </div>
          )}
        </div>

        <div className="mt-6 flex items-center justify-between">
          <button
            onClick={() => setWizardStep(4)}
            className="px-4 py-2 text-sm text-charcoal-light hover:text-charcoal"
          >
            ← Back
          </button>
          <button
            onClick={() => setWizardStep(6)}
            disabled={newProject.people.length === 0}
            className={`px-6 py-2 text-sm font-medium rounded-lg transition-colors ${
              newProject.people.length > 0
                ? 'bg-teal text-white hover:bg-teal-dark'
                : 'bg-border-light text-muted cursor-not-allowed'
            }`}
          >
            Continue
          </button>
        </div>
      </div>
    </div>
  );

  // Project Wizard - Step 6: Design Workflow
  const ProjectWizardStep6 = () => {
    const selectedAgents = allTeamMembers.agents.filter(a => newProject.agents.includes(a.id));
    const selectedPeople = allTeamMembers.humans.filter(p => newProject.people.includes(p.id));

    // Initialize workflow nodes if empty
    const initializeWorkflow = () => {
      const nodes = [
        { id: 'start', type: 'start', name: 'Start', position: { x: 50, y: 150 } },
        ...selectedAgents.map((agent, i) => ({
          id: `agent-${agent.id}`,
          type: 'agent',
          entityId: agent.id,
          name: agent.name,
          position: { x: 200 + i * 180, y: 100 + (i % 2) * 100 }
        })),
        ...selectedPeople.slice(0, 1).map((person, i) => ({
          id: `person-${person.id}`,
          type: 'person',
          entityId: person.id,
          name: person.name,
          position: { x: 200 + selectedAgents.length * 180, y: 150 }
        })),
        { id: 'end', type: 'end', name: 'Complete', position: { x: 200 + (selectedAgents.length + 1) * 180, y: 150 } }
      ];
      setNewProject({
        ...newProject,
        workflow: { ...newProject.workflow, nodes }
      });
    };

    return (
      <div className="flex-1 p-6 overflow-auto bg-cream-light">
        <div className="max-w-4xl mx-auto">
          <button
            onClick={() => setCurrentView('command-center')}
            className="text-sm text-muted hover:text-charcoal mb-4 flex items-center gap-1"
          >
            ← Cancel
          </button>

          <h1 className="text-2xl font-semibold text-charcoal mb-2">Create New Project</h1>
          <p className="text-sm text-muted mb-6">Step 6: Design how work flows between agents and people.</p>

          <WizardProgress currentStep={wizardStep} />

          <div className="bg-white rounded-xl border border-border-light shadow-soft p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-medium text-charcoal">Design Workflow</h2>
              <div className="flex items-center gap-2 bg-cream-dark rounded-lg p-1">
                <button
                  onClick={() => setWizardMode('guided')}
                  className={`px-3 py-1 text-sm rounded-md transition-colors ${
                    wizardMode === 'guided' ? 'bg-white shadow text-charcoal' : 'text-charcoal-light'
                  }`}
                >
                  Guided
                </button>
                <button
                  onClick={() => {
                    setWizardMode('advanced');
                    if (newProject.workflow.nodes.length === 0) initializeWorkflow();
                  }}
                  className={`px-3 py-1 text-sm rounded-md transition-colors ${
                    wizardMode === 'advanced' ? 'bg-white shadow text-charcoal' : 'text-charcoal-light'
                  }`}
                >
                  Advanced
                </button>
              </div>
            </div>

            {wizardMode === 'guided' ? (
              <div className="space-y-6">
                <div className="p-4 bg-cream rounded-lg">
                  <label className="block text-sm font-medium text-charcoal mb-2">
                    What triggers this workflow?
                  </label>
                  <div className="space-y-2">
                    {[
                      { id: 'manual', label: 'Manual trigger', description: 'Started by a team member' },
                      { id: 'schedule', label: 'On a schedule', description: 'Runs at specific times' },
                      { id: 'event', label: 'When data arrives', description: 'New lead, invoice, or record' },
                    ].map((trigger) => (
                      <label
                        key={trigger.id}
                        className="flex items-center gap-3 p-3 bg-white rounded-lg border border-border-light cursor-pointer hover:border-border"
                      >
                        <input
                          type="radio"
                          name="trigger"
                          value={trigger.id}
                          className="w-4 h-4 text-teal"
                        />
                        <div>
                          <div className="text-sm font-medium text-charcoal">{trigger.label}</div>
                          <div className="text-xs text-muted">{trigger.description}</div>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="p-4 bg-cream rounded-lg">
                  <label className="block text-sm font-medium text-charcoal mb-2">
                    Which agent handles the work first?
                  </label>
                  <select className="w-full h-10 px-3 border border-border-light rounded-lg bg-white text-sm">
                    <option value="">Select an agent...</option>
                    {selectedAgents.map(agent => (
                      <option key={agent.id} value={agent.id}>{agent.name}</option>
                    ))}
                  </select>
                </div>

                <div className="p-4 bg-cream rounded-lg">
                  <label className="block text-sm font-medium text-charcoal mb-2">
                    When should a human be involved?
                  </label>
                  <div className="space-y-2">
                    {[
                      { id: 'approval', label: 'Before sending external communications' },
                      { id: 'error', label: 'When an error occurs' },
                      { id: 'confidence', label: 'When agent confidence is low' },
                      { id: 'always', label: 'Review all outputs before completion' },
                    ].map((option) => (
                      <label key={option.id} className="flex items-center gap-3 cursor-pointer">
                        <input type="checkbox" className="w-4 h-4 rounded text-teal" />
                        <span className="text-sm text-charcoal">{option.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="p-4 bg-teal-tint border border-teal/30 rounded-lg">
                  <div className="flex items-start gap-3">
                    <span className="text-teal">💡</span>
                    <div className="text-sm text-teal-dark">
                      Based on your selections, we'll create a workflow that can be refined later in the project settings.
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div>
                <p className="text-sm text-muted mb-4">
                  Drag and position nodes to design your workflow. Click nodes to select and connect them.
                </p>

                <div
                  className="relative h-96 bg-cream rounded-lg border-2 border-dashed border-border-light overflow-hidden"
                  style={{ backgroundImage: 'radial-gradient(circle, #e2e8f0 1px, transparent 1px)', backgroundSize: '20px 20px' }}
                >
                  <svg className="absolute inset-0 w-full h-full pointer-events-none">
                    <defs>
                      <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
                        <polygon points="0 0, 10 3.5, 0 7" fill="#94a3b8" />
                      </marker>
                    </defs>
                    {newProject.workflow.connections.map((conn, i) => {
                      const fromNode = newProject.workflow.nodes.find(n => n.id === conn.from);
                      const toNode = newProject.workflow.nodes.find(n => n.id === conn.to);
                      if (!fromNode || !toNode) return null;
                      return (
                        <ConnectionLine
                          key={i}
                          from={fromNode.position}
                          to={toNode.position}
                          selected={false}
                        />
                      );
                    })}
                  </svg>

                  {newProject.workflow.nodes.map((node) => (
                    <WorkflowNode
                      key={node.id}
                      node={node}
                      selected={false}
                      onSelect={() => {}}
                      onDrag={() => {}}
                    />
                  ))}

                  {newProject.workflow.nodes.length === 0 && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <button
                        onClick={initializeWorkflow}
                        className="px-4 py-2 bg-white border border-border-light rounded-lg text-sm text-charcoal-light hover:border-border hover:shadow-soft"
                      >
                        Initialize Workflow from Selected Agents
                      </button>
                    </div>
                  )}
                </div>

                <div className="mt-4 flex items-center gap-4 text-xs text-muted">
                  <span className="flex items-center gap-1"><span className="w-3 h-3 bg-sage-tint border border-sage/50 rounded"></span> Start/End</span>
                  <span className="flex items-center gap-1"><span className="w-3 h-3 bg-teal-tint border border-teal/50 rounded"></span> Agent</span>
                  <span className="flex items-center gap-1"><span className="w-3 h-3 bg-purple-100 border border-purple-300 rounded"></span> Person</span>
                  <span className="flex items-center gap-1"><span className="w-3 h-3 bg-amber-100 border border-amber-300 rounded"></span> Decision</span>
                </div>
              </div>
            )}
          </div>

          <div className="mt-6 flex items-center justify-between">
            <button
              onClick={() => setWizardStep(5)}
              className="px-4 py-2 text-sm text-charcoal-light hover:text-charcoal"
            >
              ← Back
            </button>
            <button
              onClick={() => setWizardStep(7)}
              className="px-6 py-2 text-sm font-medium bg-teal text-white rounded-lg hover:bg-teal-dark"
            >
              Continue to Review
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Project Wizard - Step 7: Review & Launch
  const ProjectWizardStep7 = () => {
    const selectedAgents = allTeamMembers.agents.filter(a => newProject.agents.includes(a.id));
    const selectedPeople = allTeamMembers.humans.filter(p => newProject.people.includes(p.id));
    const selectedTools = tools.filter(t => newProject.tools.includes(t.id));
    const selectedSOPs = sopLibrary.filter(s => newProject.sops.includes(s.id));

    const handleLaunch = async () => {
      setLoading('launch-project', true);
      await new Promise(r => setTimeout(r, 1500));
      setLoading('launch-project', false);
      showToast(`Project "${newProject.name}" created successfully!`, 'success');
      // Reset wizard
      setWizardStep(1);
      setNewProject({
        name: '',
        goal: '',
        template: null,
        status: 'draft',
        agents: [],
        sops: [],
        tools: [],
        people: [],
        workflow: { nodes: [], connections: [], triggers: [] }
      });
      setCurrentView('command-center');
    };

    const handleSaveDraft = async () => {
      setLoading('save-draft', true);
      await new Promise(r => setTimeout(r, 1000));
      setLoading('save-draft', false);
      showToast('Project saved as draft', 'success');
      setCurrentView('command-center');
    };

    return (
      <div className="flex-1 p-6 overflow-auto bg-cream-light">
        <div className="max-w-3xl mx-auto">
          <button
            onClick={() => setCurrentView('command-center')}
            className="text-sm text-muted hover:text-charcoal mb-4 flex items-center gap-1"
          >
            ← Cancel
          </button>

          <h1 className="text-2xl font-semibold text-charcoal mb-2">Create New Project</h1>
          <p className="text-sm text-muted mb-6">Step 7: Review your configuration and launch.</p>

          <WizardProgress currentStep={wizardStep} />

          <div className="bg-white rounded-xl border border-border-light shadow-soft p-6 mb-6">
            <h2 className="text-lg font-medium text-charcoal mb-4">Review Your Project</h2>

            <div className="space-y-6">
              {/* Project Info */}
              <div className="p-4 bg-cream rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-medium text-charcoal">Project Details</h3>
                  <button onClick={() => setWizardStep(1)} className="text-xs text-teal hover:text-teal-dark">Edit</button>
                </div>
                <div className="space-y-2">
                  <div>
                    <span className="text-xs text-muted">Name:</span>
                    <span className="text-sm text-charcoal ml-2">{newProject.name}</span>
                  </div>
                  <div>
                    <span className="text-xs text-muted">Goal:</span>
                    <p className="text-sm text-charcoal mt-1">{newProject.goal}</p>
                  </div>
                </div>
              </div>

              {/* Agents */}
              <div className="p-4 bg-cream rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-medium text-charcoal">Agents ({selectedAgents.length})</h3>
                  <button onClick={() => setWizardStep(2)} className="text-xs text-teal hover:text-teal-dark">Edit</button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {selectedAgents.map(agent => (
                    <span key={agent.id} className="px-2 py-1 bg-white border border-border-light rounded text-xs text-charcoal">
                      🤖 {agent.name}
                    </span>
                  ))}
                </div>
              </div>

              {/* SOPs */}
              <div className="p-4 bg-cream rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-medium text-charcoal">SOPs ({selectedSOPs.length})</h3>
                  <button onClick={() => setWizardStep(3)} className="text-xs text-teal hover:text-teal-dark">Edit</button>
                </div>
                {selectedSOPs.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {selectedSOPs.map(sop => (
                      <span key={sop.id} className="px-2 py-1 bg-white border border-border-light rounded text-xs text-charcoal">
                        📋 {sop.name}
                      </span>
                    ))}
                  </div>
                ) : (
                  <span className="text-xs text-muted">No SOPs selected</span>
                )}
              </div>

              {/* Tools */}
              <div className="p-4 bg-cream rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-medium text-charcoal">Tools ({selectedTools.length})</h3>
                  <button onClick={() => setWizardStep(4)} className="text-xs text-teal hover:text-teal-dark">Edit</button>
                </div>
                {selectedTools.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {selectedTools.map(tool => (
                      <span key={tool.id} className="px-2 py-1 bg-white border border-border-light rounded text-xs text-charcoal">
                        {tool.icon} {tool.name}
                      </span>
                    ))}
                  </div>
                ) : (
                  <span className="text-xs text-muted">No tools selected</span>
                )}
              </div>

              {/* People */}
              <div className="p-4 bg-cream rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-medium text-charcoal">People ({selectedPeople.length})</h3>
                  <button onClick={() => setWizardStep(5)} className="text-xs text-teal hover:text-teal-dark">Edit</button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {selectedPeople.map((person, i) => (
                    <span key={person.id} className="px-2 py-1 bg-white border border-border-light rounded text-xs text-charcoal">
                      👤 {person.name} {i === 0 && <span className="text-amber-600">(Supervisor)</span>}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Validation warnings */}
          {(selectedAgents.length === 0 || selectedPeople.length === 0) && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
              <div className="flex items-start gap-3">
                <span className="text-amber-500">⚠️</span>
                <div>
                  <div className="text-sm font-medium text-amber-800">Missing requirements</div>
                  <ul className="text-xs text-amber-700 mt-1 list-disc list-inside">
                    {selectedAgents.length === 0 && <li>At least one agent is required</li>}
                    {selectedPeople.length === 0 && <li>At least one supervisor is required</li>}
                  </ul>
                </div>
              </div>
            </div>
          )}

          <div className="flex items-center justify-between">
            <button
              onClick={() => setWizardStep(6)}
              className="px-4 py-2 text-sm text-charcoal-light hover:text-charcoal"
            >
              ← Back
            </button>
            <div className="flex items-center gap-3">
              <button
                onClick={handleSaveDraft}
                disabled={loadingStates['save-draft']}
                className="px-4 py-2 text-sm text-charcoal-light border border-border-light rounded-lg hover:bg-cream"
              >
                {loadingStates['save-draft'] ? 'Saving...' : 'Save as Draft'}
              </button>
              <button
                onClick={handleLaunch}
                disabled={loadingStates['launch-project'] || selectedAgents.length === 0 || selectedPeople.length === 0}
                className={`px-6 py-2 text-sm font-medium rounded-lg transition-colors ${
                  selectedAgents.length > 0 && selectedPeople.length > 0 && !loadingStates['launch-project']
                    ? 'bg-sage text-white hover:bg-sage-dark'
                    : 'bg-border-light text-muted cursor-not-allowed'
                }`}
              >
                {loadingStates['launch-project'] ? 'Launching...' : 'Launch Project'}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Project Dashboard View
  const ProjectDashboardView = () => {
    const project = selectedProject;
    if (!project) return null;

    // Mock data for project dashboard
    const dashboardStats = {
      activeTasks: 5,
      awaitingApproval: 2,
      completedToday: 12,
      errorRate: 3
    };

    const workflowTasks = [
      { id: 1, name: 'Process lead: Acme Corp', status: 'in_progress', agent: 'Lead Qualifier', progress: 65 },
      { id: 2, name: 'Review pricing request', status: 'awaiting_approval', agent: 'Lead Qualifier', assignedTo: 'Jamie Chen' },
      { id: 3, name: 'Send follow-up email', status: 'queued', agent: 'Outreach Sender' },
      { id: 4, name: 'Update CRM record', status: 'completed', agent: 'Pipeline Tracker' },
    ];

    const handoffs = [
      { id: 1, from: 'Lead Qualifier', to: 'Jamie Chen', task: 'Custom pricing review', time: '5m ago', status: 'pending' },
      { id: 2, from: 'Invoice Processor', to: 'Alex Kim', task: 'Missing vendor info', time: '1h ago', status: 'pending' },
    ];

    return (
      <div className="flex-1 p-6 overflow-auto bg-cream-light">
        <div className="max-w-6xl">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 ref={mainHeadingRef} tabIndex={-1} className="text-2xl font-semibold text-charcoal outline-none">
                {project.name}
              </h1>
              <p className="text-sm text-muted mt-1">{project.agents} agents · {project.humans} humans</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  setEditProject(project);
                  setCurrentView('project-edit');
                }}
                className="px-3 py-1.5 text-sm text-charcoal-light border border-border-light rounded-lg hover:bg-cream"
              >
                Edit Project
              </button>
              <button className="px-3 py-1.5 text-sm text-white bg-charcoal rounded-lg hover:bg-charcoal-light">
                + Add Task
              </button>
            </div>
          </div>

          {/* Status Panel - 4 metric cards */}
          <div className="grid grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-xl border border-border-light p-4 shadow-soft">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted">Active Tasks</span>
                <StatusBadge status="active" />
              </div>
              <div className="text-3xl font-semibold text-charcoal">{dashboardStats.activeTasks}</div>
            </div>
            <div className="bg-white rounded-xl border border-amber-200 bg-amber-50/50 p-4 shadow-soft">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-amber-700">Awaiting Approval</span>
                <span className="w-2 h-2 bg-amber-500 rounded-full animate-pulse"></span>
              </div>
              <div className="text-3xl font-semibold text-amber-700">{dashboardStats.awaitingApproval}</div>
            </div>
            <div className="bg-white rounded-xl border border-border-light p-4 shadow-soft">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted">Completed Today</span>
                <span className="text-xs text-sage">92% on-time</span>
              </div>
              <div className="text-3xl font-semibold text-charcoal">{dashboardStats.completedToday}</div>
            </div>
            <div className="bg-white rounded-xl border border-border-light p-4 shadow-soft">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted">Error Rate</span>
                <span className={`text-xs ${dashboardStats.errorRate > 5 ? 'text-red-600' : 'text-sage'}`}>
                  {dashboardStats.errorRate > 5 ? 'Above threshold' : 'Normal'}
                </span>
              </div>
              <div className="text-3xl font-semibold text-charcoal">{dashboardStats.errorRate}%</div>
            </div>
          </div>

          {/* Workflow Visualization */}
          <div className="bg-white rounded-xl border border-border-light shadow-soft mb-6">
            <div className="px-4 py-3 border-b border-border-light flex items-center justify-between">
              <h2 className="font-medium text-charcoal">Workflow</h2>
              <div className="flex items-center gap-2 bg-cream-dark rounded-lg p-1">
                {['flowchart', 'timeline', 'kanban'].map((view) => (
                  <button
                    key={view}
                    onClick={() => setDashboardView(view)}
                    className={`px-3 py-1 text-xs rounded-md transition-colors capitalize ${
                      dashboardView === view ? 'bg-white shadow text-charcoal' : 'text-charcoal-light'
                    }`}
                  >
                    {view}
                  </button>
                ))}
              </div>
            </div>

            <div className="p-4">
              {dashboardView === 'flowchart' && (
                <div
                  className="h-64 bg-cream rounded-lg border border-border-light relative"
                  style={{ backgroundImage: 'radial-gradient(circle, #e2e8f0 1px, transparent 1px)', backgroundSize: '20px 20px' }}
                >
                  {/* Sample flowchart nodes */}
                  <div className="absolute left-8 top-1/2 -translate-y-1/2 p-3 bg-sage-tint border-2 border-sage/50 rounded-xl">
                    <div className="flex items-center gap-2">
                      <span>▶</span>
                      <span className="text-sm font-medium">Start</span>
                    </div>
                  </div>
                  <div className="absolute left-40 top-1/3 -translate-y-1/2 p-3 bg-teal-tint border-2 border-teal/50 rounded-xl">
                    <div className="flex items-center gap-2">
                      <span>🤖</span>
                      <div>
                        <span className="text-sm font-medium">Lead Qualifier</span>
                        <div className="text-xs text-teal">Active</div>
                      </div>
                    </div>
                  </div>
                  <div className="absolute left-40 top-2/3 -translate-y-1/2 p-3 bg-teal-tint border-2 border-teal/50 rounded-xl">
                    <div className="flex items-center gap-2">
                      <span>🤖</span>
                      <div>
                        <span className="text-sm font-medium">Outreach Sender</span>
                        <div className="text-xs text-muted">Idle</div>
                      </div>
                    </div>
                  </div>
                  <div className="absolute left-80 top-1/2 -translate-y-1/2 p-3 bg-purple-100 border-2 border-purple-300 rounded-xl">
                    <div className="flex items-center gap-2">
                      <span>👤</span>
                      <div>
                        <span className="text-sm font-medium">Jamie Chen</span>
                        <div className="text-xs text-amber-600">2 pending</div>
                      </div>
                    </div>
                  </div>
                  <div className="absolute right-8 top-1/2 -translate-y-1/2 p-3 bg-cream-dark border-2 border-border rounded-xl">
                    <div className="flex items-center gap-2">
                      <span>■</span>
                      <span className="text-sm font-medium">Complete</span>
                    </div>
                  </div>
                </div>
              )}

              {dashboardView === 'timeline' && (
                <div className="h-64 flex items-center">
                  <div className="w-full">
                    <div className="relative pt-8">
                      <div className="h-1 bg-border-light rounded-full"></div>
                      <div className="h-1 bg-teal rounded-full absolute top-8 left-0" style={{ width: '60%' }}></div>

                      {/* Milestones */}
                      <div className="absolute left-0 top-4 -translate-x-1/2 flex flex-col items-center">
                        <div className="w-4 h-4 bg-sage rounded-full border-2 border-white shadow"></div>
                        <span className="text-xs text-charcoal-light mt-2">Start</span>
                      </div>
                      <div className="absolute left-1/4 top-4 -translate-x-1/2 flex flex-col items-center">
                        <div className="w-4 h-4 bg-sage rounded-full border-2 border-white shadow"></div>
                        <span className="text-xs text-charcoal-light mt-2">Lead Qualified</span>
                      </div>
                      <div className="absolute left-1/2 top-4 -translate-x-1/2 flex flex-col items-center">
                        <div className="w-4 h-4 bg-teal rounded-full border-2 border-white shadow animate-pulse"></div>
                        <span className="text-xs text-teal mt-2 font-medium">Pending Review</span>
                      </div>
                      <div className="absolute left-3/4 top-4 -translate-x-1/2 flex flex-col items-center">
                        <div className="w-4 h-4 bg-border rounded-full border-2 border-white shadow"></div>
                        <span className="text-xs text-muted mt-2">Outreach</span>
                      </div>
                      <div className="absolute right-0 top-4 translate-x-1/2 flex flex-col items-center">
                        <div className="w-4 h-4 bg-border rounded-full border-2 border-white shadow"></div>
                        <span className="text-xs text-muted mt-2">Complete</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {dashboardView === 'kanban' && (
                <div className="grid grid-cols-4 gap-4 h-64">
                  {[
                    { title: 'Queued', color: 'muted', tasks: workflowTasks.filter(t => t.status === 'queued') },
                    { title: 'In Progress', color: 'blue', tasks: workflowTasks.filter(t => t.status === 'in_progress') },
                    { title: 'Awaiting Approval', color: 'amber', tasks: workflowTasks.filter(t => t.status === 'awaiting_approval') },
                    { title: 'Completed', color: 'sage', tasks: workflowTasks.filter(t => t.status === 'completed') },
                  ].map((column) => (
                    <div key={column.title} className="bg-cream rounded-lg p-3">
                      <div className="flex items-center justify-between mb-3">
                        <span className={`text-xs font-medium text-${column.color}-700`}>{column.title}</span>
                        <span className="text-xs text-muted">{column.tasks.length}</span>
                      </div>
                      <div className="space-y-2">
                        {column.tasks.map((task) => (
                          <div key={task.id} className="p-2 bg-white rounded border border-border-light text-xs">
                            <div className="font-medium text-charcoal truncate">{task.name}</div>
                            <div className="text-muted mt-1">{task.agent}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            {/* Handoff Tracker */}
            <div className="bg-white rounded-xl border border-border-light shadow-soft">
              <div className="px-4 py-3 border-b border-border-light flex items-center justify-between">
                <h2 className="font-medium text-charcoal">Pending Handoffs</h2>
                <span className="text-xs text-amber-600 bg-amber-50 px-2 py-0.5 rounded">{handoffs.length} pending</span>
              </div>
              <div className="divide-y divide-border-light">
                {handoffs.map((handoff) => (
                  <div key={handoff.id} className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2 text-sm">
                        <span className="text-muted">🤖 {handoff.from}</span>
                        <span className="text-purple-500">→</span>
                        <span className="text-charcoal font-medium">👤 {handoff.to}</span>
                      </div>
                      <span className="text-xs text-muted">{handoff.time}</span>
                    </div>
                    <p className="text-sm text-charcoal mb-3">{handoff.task}</p>
                    <div className="flex items-center gap-2">
                      <button className="px-3 py-1 text-xs font-medium text-purple-600 bg-purple-50 rounded hover:bg-purple-100">
                        Take Over
                      </button>
                      <button className="px-3 py-1 text-xs text-muted hover:text-charcoal">
                        View Details
                      </button>
                    </div>
                  </div>
                ))}
                {handoffs.length === 0 && (
                  <div className="p-6 text-center text-sm text-muted">
                    No pending handoffs
                  </div>
                )}
              </div>
            </div>

            {/* Activity Log */}
            <div className="bg-white rounded-xl border border-border-light shadow-soft">
              <div className="px-4 py-3 border-b border-border-light flex items-center justify-between">
                <h2 className="font-medium text-charcoal">Recent Activity</h2>
                <button className="text-xs text-teal hover:text-teal-dark">View All</button>
              </div>
              <div className="divide-y divide-border-light max-h-64 overflow-auto">
                {activityLog.filter(a => a.project === project.name).slice(0, 6).map((entry, i) => (
                  <div key={i} className="px-4 py-3 flex items-start gap-3">
                    <span className="text-xs text-muted w-14 pt-0.5">{entry.time}</span>
                    <div className={`w-6 h-6 rounded flex items-center justify-center text-xs ${
                      entry.type === 'start' ? 'bg-teal-tint text-teal' :
                      entry.type === 'handoff' ? 'bg-purple-100 text-purple-600' :
                      entry.type === 'complete' ? 'bg-sage-tint text-sage' :
                      entry.type === 'error' ? 'bg-red-100 text-red-600' :
                      'bg-cream-dark text-muted'
                    }`}>
                      {entry.type === 'start' && '→'}
                      {entry.type === 'action' && '•'}
                      {entry.type === 'handoff' && '⤳'}
                      {entry.type === 'complete' && '✓'}
                      {entry.type === 'error' && '!'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm text-charcoal">{entry.text}</div>
                      {entry.detail && <div className="text-xs text-muted mt-0.5">{entry.detail}</div>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Project Edit View
  const ProjectEditView = () => {
    const project = editProject || selectedProject;
    if (!project) return null;

    const tabs = [
      { id: 'overview', label: 'Overview', icon: '📋' },
      { id: 'agents', label: 'Agents', icon: '🤖' },
      { id: 'sops', label: 'SOPs', icon: '📜' },
      { id: 'tools', label: 'Tools', icon: '🔧' },
      { id: 'people', label: 'People', icon: '👥' },
      { id: 'workflow', label: 'Workflow', icon: '🔀' },
      { id: 'settings', label: 'Settings', icon: '⚙️' },
    ];

    return (
      <div className="flex-1 p-6 overflow-auto bg-cream-light">
        <div className="max-w-4xl">
          <button
            onClick={() => {
              setCurrentView('project-dashboard');
              setEditProject(null);
            }}
            className="text-sm text-muted hover:text-charcoal mb-4 flex items-center gap-1"
          >
            ← Back to Dashboard
          </button>

          <div className="flex items-center justify-between mb-6">
            <h1 ref={mainHeadingRef} tabIndex={-1} className="text-2xl font-semibold text-charcoal outline-none">
              Edit: {project.name}
            </h1>
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  showToast('Changes saved', 'success');
                  setCurrentView('project-dashboard');
                }}
                className="px-4 py-2 text-sm font-medium text-white bg-teal rounded-lg hover:bg-teal-dark"
              >
                Save Changes
              </button>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="border-b border-border-light mb-6">
            <nav className="flex gap-1" aria-label="Project sections">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setEditTab(tab.id)}
                  className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
                    editTab === tab.id
                      ? 'border-teal text-teal'
                      : 'border-transparent text-muted hover:text-charcoal'
                  }`}
                >
                  <span className="mr-1.5">{tab.icon}</span>
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          {/* Tab Content */}
          <div className="bg-white rounded-xl border border-border-light shadow-soft">
            {editTab === 'overview' && (
              <div className="p-6">
                <h2 className="text-lg font-medium text-charcoal mb-4">Project Overview</h2>
                <div className="space-y-4">
                  <div>
                    <label htmlFor="edit-name" className="block text-sm font-medium text-charcoal mb-2">
                      Project Name
                    </label>
                    <input
                      id="edit-name"
                      type="text"
                      defaultValue={project.name}
                      className="w-full h-10 px-3 border border-border-light rounded-lg text-sm focus:outline-none focus:border-teal"
                    />
                  </div>
                  <div>
                    <label htmlFor="edit-goal" className="block text-sm font-medium text-charcoal mb-2">
                      Project Goal
                    </label>
                    <textarea
                      id="edit-goal"
                      defaultValue="Automate sales pipeline qualification and outreach"
                      rows={3}
                      className="w-full px-3 py-2 border border-border-light rounded-lg text-sm focus:outline-none focus:border-teal"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-charcoal mb-2">Status</label>
                    <div className="flex items-center gap-3">
                      {['draft', 'active', 'paused', 'completed'].map((status) => (
                        <button
                          key={status}
                          className={`px-3 py-1.5 text-sm rounded-lg border ${
                            status === 'active'
                              ? 'border-sage bg-sage-tint/50 text-sage'
                              : 'border-border-light text-charcoal-light hover:bg-cream'
                          }`}
                        >
                          {status.charAt(0).toUpperCase() + status.slice(1)}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {editTab === 'agents' && (
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-medium text-charcoal">Project Agents</h2>
                  <button className="text-sm text-teal hover:text-teal-dark">+ Add Agent</button>
                </div>
                <div className="space-y-3">
                  {projectTeam.agents.map((agent) => (
                    <div key={agent.id} className="p-4 border border-border-light rounded-lg flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-cream to-cream-dark rounded-lg flex items-center justify-center">
                          <span>🤖</span>
                        </div>
                        <div>
                          <div className="text-sm font-medium text-charcoal">{agent.name}</div>
                          <AutonomyIndicator level={agent.autonomy} />
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button className="text-xs text-teal hover:text-teal-dark">Configure</button>
                        <button className="text-xs text-red-500 hover:text-red-700">Remove</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {editTab === 'sops' && (
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-medium text-charcoal">Standard Operating Procedures</h2>
                  <button className="text-sm text-teal hover:text-teal-dark">+ Create SOP</button>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {sopLibrary.slice(0, 4).map((sop) => (
                    <div key={sop.id} className="p-4 border border-border-light rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-charcoal">{sop.name}</span>
                        <span className="px-1.5 py-0.5 bg-cream-dark text-muted text-xs rounded">
                          {sop.steps} steps
                        </span>
                      </div>
                      <p className="text-xs text-muted mb-3">{sop.description}</p>
                      <div className="flex items-center gap-2">
                        <button className="text-xs text-teal hover:text-teal-dark">Edit</button>
                        <button className="text-xs text-muted hover:text-charcoal">Assign</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {editTab === 'tools' && (
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-medium text-charcoal">Connected Tools</h2>
                  <button className="text-sm text-teal hover:text-teal-dark">+ Add Tool</button>
                </div>
                <div className="space-y-3">
                  {tools.filter(t => t.status === 'connected').slice(0, 3).map((tool) => (
                    <div key={tool.id} className="p-4 border border-border-light rounded-lg flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-cream-dark rounded-lg flex items-center justify-center text-xl">
                          {tool.icon}
                        </div>
                        <div>
                          <div className="text-sm font-medium text-charcoal">{tool.name}</div>
                          <div className="text-xs text-muted">{tool.description}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button className="text-xs text-teal hover:text-teal-dark">Permissions</button>
                        <button className="text-xs text-red-500 hover:text-red-700">Remove</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {editTab === 'people' && (
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-medium text-charcoal">Team Members</h2>
                  <button className="text-sm text-teal hover:text-teal-dark">+ Add Person</button>
                </div>
                <div className="space-y-3">
                  {projectTeam.humans.map((person, i) => (
                    <div key={person.id} className="p-4 border border-border-light rounded-lg flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-teal-tint to-teal/20 rounded-full flex items-center justify-center text-sm font-medium text-teal-dark">
                          👤
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-charcoal">{person.name}</span>
                            {i === 0 && (
                              <span className="px-1.5 py-0.5 bg-amber-100 text-amber-700 text-xs rounded">Supervisor</span>
                            )}
                          </div>
                          <div className="text-xs text-muted">{person.role}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button className="text-xs text-teal hover:text-teal-dark">Edit Role</button>
                        <button className="text-xs text-red-500 hover:text-red-700">Remove</button>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-6 p-4 bg-cream rounded-lg">
                  <h3 className="text-sm font-medium text-charcoal mb-3">Escalation Path</h3>
                  <div className="flex items-center gap-2 text-sm text-charcoal-light">
                    <span>Agent error →</span>
                    <span className="font-medium">{projectTeam.humans[0]?.name}</span>
                    <span>→</span>
                    <span className="font-medium">{projectTeam.humans[1]?.name || 'Admin'}</span>
                  </div>
                </div>
              </div>
            )}

            {editTab === 'workflow' && (
              <div className="p-6">
                <h2 className="text-lg font-medium text-charcoal mb-4">Workflow Editor</h2>
                <div
                  className="h-80 bg-cream rounded-lg border-2 border-dashed border-border-light"
                  style={{ backgroundImage: 'radial-gradient(circle, #e2e8f0 1px, transparent 1px)', backgroundSize: '20px 20px' }}
                >
                  <div className="h-full flex items-center justify-center">
                    <div className="text-center">
                      <span className="text-3xl mb-2 block">🔀</span>
                      <p className="text-sm text-muted">Drag and drop to design your workflow</p>
                      <button className="mt-3 text-sm text-teal hover:text-teal-dark">
                        Open Full Editor
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {editTab === 'settings' && (
              <div className="p-6">
                <h2 className="text-lg font-medium text-charcoal mb-4">Project Settings</h2>
                <div className="space-y-6">
                  <div>
                    <h3 className="text-sm font-medium text-charcoal mb-3">Notifications</h3>
                    <div className="space-y-2">
                      <label className="flex items-center justify-between p-3 bg-cream rounded-lg">
                        <span className="text-sm text-charcoal">Email on task completion</span>
                        <Toggle id="notify-complete" enabled={true} onChange={() => {}} label="Email on completion" />
                      </label>
                      <label className="flex items-center justify-between p-3 bg-cream rounded-lg">
                        <span className="text-sm text-charcoal">Slack on handoffs</span>
                        <Toggle id="notify-handoff" enabled={true} onChange={() => {}} label="Slack on handoff" />
                      </label>
                      <label className="flex items-center justify-between p-3 bg-cream rounded-lg">
                        <span className="text-sm text-charcoal">Alert on errors</span>
                        <Toggle id="notify-error" enabled={true} onChange={() => {}} label="Alert on error" />
                      </label>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-sm font-medium text-charcoal mb-3">SLA Thresholds</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs text-muted mb-1">Max task duration</label>
                        <input
                          type="number"
                          defaultValue={30}
                          className="w-full h-9 px-3 text-sm border border-border-light rounded-lg"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-muted mb-1">Target approval rate</label>
                        <input
                          type="number"
                          defaultValue={90}
                          className="w-full h-9 px-3 text-sm border border-border-light rounded-lg"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-border-light">
                    <button
                      onClick={() => setConfirmDialog({
                        title: 'Delete Project?',
                        message: 'This will permanently delete this project and all its data. This action cannot be undone.',
                        confirmLabel: 'Delete Project',
                        confirmStyle: 'destructive',
                        onConfirm: () => {
                          showToast('Project deleted', 'success');
                          setConfirmDialog(null);
                          setCurrentView('command-center');
                        }
                      })}
                      className="text-sm text-red-600 hover:text-red-700"
                    >
                      Delete Project
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  // Main render
  const renderView = () => {
    switch(currentView) {
      case 'command-center': return <CommandCenterView />;
      case 'inbox': return <InboxView />;
      case 'schedule': return <ScheduleView />;
      case 'team': return <TeamView />;
      case 'reports': return <ReportsView />;
      case 'activity': return <ActivityView />;
      case 'tools': return <ToolsView />;
      case 'tools-add': return <AddToolView />;
      case 'tool-setup': return <ToolSetupView />;
      case 'tool-settings': return <ToolSettingsView />;
      case 'project': return <ProjectView />;
      case 'agent-detail': return <AgentDetailView />;
      // Analytics Views
      case 'analytics-performance': return <PerformanceDashboardView />;
      case 'analytics-cost': return <CostEfficiencyView />;
      case 'analytics-quality': return <QualityMetricsView />;
      case 'analytics-compare': return <ComparisonsView />;
      // Operations Views
      case 'alerts': return <AlertsView />;
      // Settings Views
      case 'settings-sla': return <SLASettingsView />;
      case 'settings-export': return <ExportSettingsView />;
      // Project Wizard View
      case 'project-wizard': return <ProjectWizard />;
      // Project Management Views
      case 'project-dashboard': return <ProjectDashboardView />;
      case 'project-edit': return <ProjectEditView />;
      default: return <CommandCenterView />;
    }
  };

  // Confirmation Dialog Component
  const ConfirmDialog = () => {
    if (!confirmDialog) return null;
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        <div
          className="absolute inset-0 bg-black/50"
          onClick={() => setConfirmDialog(null)}
          aria-hidden="true"
        />
        <div
          role="alertdialog"
          aria-modal="true"
          aria-labelledby="confirm-dialog-title"
          aria-describedby="confirm-dialog-description"
          className="relative bg-white rounded-xl shadow-xl w-full max-w-md p-6 z-10"
        >
          <h2 id="confirm-dialog-title" className="text-lg font-semibold text-charcoal mb-2">
            {confirmDialog.title}
          </h2>
          <p id="confirm-dialog-description" className="text-sm text-charcoal-light mb-6">
            {confirmDialog.message}
          </p>
          <div className="flex items-center justify-end gap-3">
            <button
              onClick={() => setConfirmDialog(null)}
              className="px-4 py-2 text-sm text-charcoal-light hover:text-charcoal"
            >
              Cancel
            </button>
            <button
              onClick={confirmDialog.onConfirm}
              className={`px-4 py-2 text-sm font-medium rounded-lg ${
                confirmDialog.confirmStyle === 'destructive'
                  ? 'text-white bg-red-600 hover:bg-red-700'
                  : 'text-white bg-teal hover:bg-teal-dark'
              }`}
              autoFocus
            >
              {confirmDialog.confirmLabel}
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Toast Notification Component
  const Toast = () => {
    if (!toast) return null;
    return (
      <div
        role="status"
        aria-live="polite"
        className={`fixed bottom-6 right-6 z-50 px-4 py-3 rounded-lg shadow-soft-lg flex items-center gap-3 ${
          toast.type === 'success'
            ? 'bg-sage text-white'
            : toast.type === 'error'
            ? 'bg-red-600 text-white'
            : 'bg-charcoal-light text-white'
        }`}
      >
        {toast.type === 'success' && (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        )}
        <span className="text-sm font-medium">{toast.message}</span>
        <button
          onClick={() => setToast(null)}
          className="ml-2 hover:opacity-75"
          aria-label="Dismiss notification"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    );
  };

  return (
    <div className="h-screen flex flex-col bg-cream-dark" style={{ fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif" }}>
      <Header />
      <div className="flex-1 flex overflow-hidden">
        <Sidebar />
        <main className="flex-1 flex flex-col overflow-hidden" role="main" aria-label="Main content">
          {renderView()}
        </main>
        <ChatPanel
          title="Agent Assistant"
          subtitle="Ready to help"
          placeholder="Ask about agents, projects..."
          accentColor="sage"
          quickActions={[
            { label: 'Agent status', icon: '🤖' },
            { label: 'Create project', icon: '📁' },
            { label: 'View analytics', icon: '📊' },
          ]}
          onSendMessage={(message) => console.log('User message:', message)}
        />
      </div>

      {/* Confirmation Dialog */}
      <ConfirmDialog />

      {/* Toast Notifications */}
      <Toast />
    </div>
  );
};

export default AgentCommandCenter;
