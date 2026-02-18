import React, { useState, useRef, useEffect } from 'react';
import ChatPanel from './ChatPanel';

const AgentCommandCenter = () => {
  const [currentView, setCurrentView] = useState('command-center');
  const [selectedProject, setSelectedProject] = useState(null);
  const [selectedAgent, setSelectedAgent] = useState(null);
  const [selectedTool, setSelectedTool] = useState(null);

  // Empty mode toggle - simulates first-time user with no data
  const [isEmptyMode, setIsEmptyMode] = useState(true);

  // Accessibility: Focus management
  const mainHeadingRef = useRef(null);

  // SOP Modal file input ref
  const sopFileInputRef = useRef(null);

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

  // Agent Form State
  const [editingAgent, setEditingAgent] = useState(null);

  // Projects List State
  const [projectsSortConfig, setProjectsSortConfig] = useState({
    key: 'dateModified',
    direction: 'desc'
  });

  // SOP Creation Modal State
  const [sopModalOpen, setSopModalOpen] = useState(false);
  const [sopModalState, setSopModalState] = useState('input'); // 'input' | 'processing' | 'review'
  const [sopProcessingStep, setSopProcessingStep] = useState(0);
  const [sopForm, setSopForm] = useState({
    name: '',
    description: '',
    category: 'Sales',
    files: []
  });
  const [generatedSop, setGeneratedSop] = useState(null);

  // AI Project Creator State
  const [aiCreatorState, setAICreatorState] = useState({
    phase: 'greeting',
    messages: [],
    responses: {},
    generatedBlocks: { agents: [], sops: [] },
    project: {
      name: '',
      goal: '',
      agents: [],
      sops: [],
      tools: [],
      people: [],
      workflow: { nodes: [], connections: [], triggers: [] }
    },
    isProcessing: false,
    editingBlock: null // { type: 'agent'|'sop', index: number } for inline editing
  });

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

  // Get Most Recently Used projects (sorted by lastAccessed, limited to N)
  const getMRUProjects = (allProjects, limit = 5) => {
    return [...allProjects]
      .sort((a, b) => new Date(b.lastAccessed) - new Date(a.lastAccessed))
      .slice(0, limit);
  };

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return '—';
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;

    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
    });
  };

  // Reusable Empty State Component
  const EmptyState = ({
    icon,
    title,
    description,
    primaryAction,
    primaryLabel,
    secondaryAction,
    secondaryLabel,
    children
  }) => (
    <div className="flex flex-col items-center justify-center text-center py-12 px-6">
      {icon && (
        <div className="w-16 h-16 bg-sage-tint rounded-2xl flex items-center justify-center mb-4">
          <span className="text-3xl">{icon}</span>
        </div>
      )}
      <h3 className="text-lg font-semibold text-charcoal mb-2">{title}</h3>
      {description && (
        <p className="text-sm text-muted max-w-md mb-6">{description}</p>
      )}
      {children}
      {(primaryAction || secondaryAction) && (
        <div className="flex items-center gap-3 mt-6">
          {primaryAction && (
            <button
              onClick={primaryAction}
              className="px-4 py-2 text-sm font-medium text-white bg-sage rounded-lg hover:bg-sage-dark transition-colors"
            >
              {primaryLabel}
            </button>
          )}
          {secondaryAction && (
            <button
              onClick={secondaryAction}
              className="px-4 py-2 text-sm text-charcoal-light hover:text-charcoal transition-colors"
            >
              {secondaryLabel}
            </button>
          )}
        </div>
      )}
    </div>
  );

  // Sample data
  const stats = { active: 8, pending: 3, errors: 1, completed: 47 };
  
  const projects = [
    { id: 1, name: 'Sales Ops', agents: 3, humans: 2, active: 2, status: 'running', dateAdded: '2024-01-15', dateModified: '2024-02-10', lastAccessed: '2024-02-13', notifications: 3 },
    { id: 2, name: 'Finance', agents: 2, humans: 1, active: 1, status: 'waiting', dateAdded: '2024-01-20', dateModified: '2024-02-08', lastAccessed: '2024-02-11', notifications: 1 },
    { id: 3, name: 'HR Onboarding', agents: 2, humans: 2, active: 0, status: 'halted', dateAdded: '2024-02-01', dateModified: '2024-02-05', lastAccessed: '2024-02-09', notifications: 0 },
    { id: 4, name: 'Customer Support', agents: 4, humans: 3, active: 3, status: 'running', dateAdded: '2023-11-10', dateModified: '2024-02-12', lastAccessed: '2024-02-12', notifications: 5 },
    { id: 5, name: 'Marketing Automation', agents: 2, humans: 1, active: 0, status: 'halted', dateAdded: '2023-12-05', dateModified: '2024-01-15', lastAccessed: '2024-01-20', notifications: 0 },
    { id: 6, name: 'Data Analytics', agents: 3, humans: 2, active: 1, status: 'running', dateAdded: '2024-01-08', dateModified: '2024-02-13', lastAccessed: '2024-02-13', notifications: 2 },
    { id: 7, name: 'Inventory Management', agents: 1, humans: 1, active: 0, status: 'waiting', dateAdded: '2024-02-05', dateModified: '2024-02-07', lastAccessed: '2024-02-07', notifications: 1 },
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

  // ============================================
  // AI PROJECT CREATOR - Constants & Templates
  // ============================================

  const CONVERSATION_PHASES = {
    GREETING: 'greeting',
    GOAL_DISCOVERY: 'goal_discovery',
    SCOPE_CLARIFICATION: 'scope_clarification',
    TOOL_SELECTION: 'tool_selection',
    WORKFLOW_DESIGN: 'workflow_design',
    AUTONOMY_LEVEL: 'autonomy_level',
    HUMAN_TOUCHPOINTS: 'human_touchpoints',
    REVIEW: 'review',
    COMPLETE: 'complete'
  };

  const GOAL_PATTERNS = {
    sales: {
      keywords: ['lead', 'sales', 'outreach', 'prospect', 'pipeline', 'crm', 'deal', 'opportunity', 'qualify'],
      suggestedName: 'Sales Pipeline Automation',
      suggestedAgents: [
        { name: 'Lead Qualifier', objective: 'Score and qualify incoming leads based on fit criteria', autonomy: 'assisted' },
        { name: 'Outreach Sender', objective: 'Send personalized outreach emails to qualified leads', autonomy: 'supervised' },
        { name: 'Pipeline Tracker', objective: 'Update CRM and track deal progress automatically', autonomy: 'autonomous' }
      ],
      suggestedSOPs: [
        { name: 'Lead Qualification', category: 'Sales', description: 'Score and qualify incoming leads', steps: [
          { id: 1, name: 'Receive lead data', description: 'Capture incoming lead information from forms or integrations' },
          { id: 2, name: 'Enrich lead profile', description: 'Pull additional data from CRM and external sources' },
          { id: 3, name: 'Apply scoring criteria', description: 'Evaluate lead against qualification rules' },
          { id: 4, name: 'Determine qualification status', description: 'Mark as qualified, nurture, or disqualify' },
          { id: 5, name: 'Route to owner', description: 'Assign to appropriate sales rep or queue' }
        ]},
        { name: 'Email Outreach', category: 'Sales', description: 'Send personalized outreach with approval', steps: [
          { id: 1, name: 'Select recipients', description: 'Identify leads ready for outreach' },
          { id: 2, name: 'Generate email content', description: 'Create personalized email using templates' },
          { id: 3, name: 'Queue for approval', description: 'Submit email for human review if required' },
          { id: 4, name: 'Send and track', description: 'Deliver email and monitor engagement' }
        ]}
      ],
      suggestedTools: ['salesforce', 'hubspot', 'google', 'slack'],
      workflowPattern: 'sequential-with-handoff'
    },
    finance: {
      keywords: ['invoice', 'payment', 'expense', 'accounting', 'budget', 'financial', 'billing', 'ap', 'ar'],
      suggestedName: 'Finance Automation',
      suggestedAgents: [
        { name: 'Invoice Processor', objective: 'Extract and validate invoice data automatically', autonomy: 'assisted' },
        { name: 'Expense Auditor', objective: 'Review expenses against company policy', autonomy: 'supervised' }
      ],
      suggestedSOPs: [
        { name: 'Invoice Processing', category: 'Finance', description: 'Extract and validate invoice data', steps: [
          { id: 1, name: 'Receive invoice', description: 'Capture incoming invoice document' },
          { id: 2, name: 'Extract data', description: 'Parse vendor, amount, date, and line items' },
          { id: 3, name: 'Validate against PO', description: 'Match to purchase order if applicable' },
          { id: 4, name: 'Route for approval', description: 'Send to approver based on amount threshold' }
        ]},
        { name: 'Expense Validation', category: 'Finance', description: 'Validate expenses against policy', steps: [
          { id: 1, name: 'Receive expense report', description: 'Capture submitted expense' },
          { id: 2, name: 'Check policy compliance', description: 'Validate against expense policy rules' },
          { id: 3, name: 'Flag exceptions', description: 'Identify out-of-policy items' },
          { id: 4, name: 'Route for review', description: 'Send to manager for approval' }
        ]}
      ],
      suggestedTools: ['quickbooks', 'stripe', 'google', 'slack'],
      workflowPattern: 'validation-chain'
    },
    support: {
      keywords: ['ticket', 'support', 'customer', 'help', 'issue', 'complaint', 'service', 'helpdesk'],
      suggestedName: 'Customer Support Automation',
      suggestedAgents: [
        { name: 'Ticket Triager', objective: 'Categorize and route support tickets automatically', autonomy: 'autonomous' },
        { name: 'Response Drafter', objective: 'Generate initial response drafts for agents', autonomy: 'supervised' }
      ],
      suggestedSOPs: [
        { name: 'Ticket Triage', category: 'Support', description: 'Categorize and route support tickets', steps: [
          { id: 1, name: 'Receive ticket', description: 'Capture incoming support request' },
          { id: 2, name: 'Analyze content', description: 'Determine category and priority' },
          { id: 3, name: 'Route to team', description: 'Assign to appropriate support queue' }
        ]},
        { name: 'Response Generation', category: 'Support', description: 'Draft responses for review', steps: [
          { id: 1, name: 'Analyze ticket', description: 'Understand customer issue' },
          { id: 2, name: 'Search knowledge base', description: 'Find relevant articles and solutions' },
          { id: 3, name: 'Draft response', description: 'Generate personalized response' },
          { id: 4, name: 'Queue for review', description: 'Send to agent for approval and sending' }
        ]}
      ],
      suggestedTools: ['zendesk', 'slack', 'notion'],
      workflowPattern: 'triage-and-escalate'
    },
    hr: {
      keywords: ['onboarding', 'hire', 'employee', 'hr', 'document', 'orientation', 'recruitment', 'new hire'],
      suggestedName: 'HR Onboarding Automation',
      suggestedAgents: [
        { name: 'Onboarding Guide', objective: 'Coordinate onboarding tasks and timeline', autonomy: 'assisted' },
        { name: 'Document Collector', objective: 'Request and track required documents', autonomy: 'supervised' }
      ],
      suggestedSOPs: [
        { name: 'Document Collection', category: 'HR', description: 'Request and track new hire documents', steps: [
          { id: 1, name: 'Identify requirements', description: 'Determine required documents for role' },
          { id: 2, name: 'Send requests', description: 'Email new hire with document checklist' },
          { id: 3, name: 'Track submissions', description: 'Monitor received documents' },
          { id: 4, name: 'Verify completeness', description: 'Confirm all documents received and valid' }
        ]},
        { name: 'Onboarding Coordination', category: 'HR', description: 'Coordinate onboarding activities', steps: [
          { id: 1, name: 'Create schedule', description: 'Build onboarding timeline' },
          { id: 2, name: 'Assign tasks', description: 'Distribute tasks to relevant teams' },
          { id: 3, name: 'Send reminders', description: 'Notify stakeholders of upcoming tasks' },
          { id: 4, name: 'Track completion', description: 'Monitor onboarding progress' }
        ]}
      ],
      suggestedTools: ['google', 'slack', 'notion'],
      workflowPattern: 'checklist-driven'
    }
  };

  // Helper to match user goal to pattern
  const matchGoalPattern = (userInput) => {
    const input = userInput.toLowerCase();
    let bestMatch = null;
    let highestScore = 0;

    Object.entries(GOAL_PATTERNS).forEach(([key, pattern]) => {
      const score = pattern.keywords.filter(kw => input.includes(kw)).length;
      if (score > highestScore) {
        highestScore = score;
        bestMatch = { key, ...pattern };
      }
    });

    return bestMatch || GOAL_PATTERNS.sales; // Default fallback
  };

  // Generate unique IDs for building blocks
  const generateId = () => `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

  // Agent Objective Patterns - for conversational agent creation
  const AGENT_OBJECTIVE_PATTERNS = {
    lead_qualification: {
      keywords: ['lead', 'qualify', 'score', 'prospect', 'inbound', 'crm', 'pipeline'],
      suggestedName: 'Lead Qualifier',
      suggestedInstructions: [
        'Receive incoming lead data from CRM or web forms',
        'Enrich lead profile with available external data',
        'Apply scoring criteria against qualification rules',
        'Determine qualification status (qualified, nurture, disqualify)',
        'Route qualified leads to the appropriate sales owner'
      ],
      suggestedAutonomy: 'assisted',
      suggestedTriggers: ['new-lead', 'form-submission'],
      suggestedTools: ['salesforce', 'hubspot', 'slack'],
      suggestedSOPs: [1]
    },
    outreach: {
      keywords: ['outreach', 'email', 'send', 'campaign', 'follow-up', 'sequence', 'nurture'],
      suggestedName: 'Outreach Sender',
      suggestedInstructions: [
        'Select recipients from qualified lead pool',
        'Generate personalized email content using templates',
        'Queue draft emails for human review if required',
        'Send approved emails and track delivery',
        'Monitor engagement metrics and flag responses'
      ],
      suggestedAutonomy: 'supervised',
      suggestedTriggers: ['schedule-daily', 'manual'],
      suggestedTools: ['google', 'hubspot', 'slack'],
      suggestedSOPs: [2]
    },
    invoice_processing: {
      keywords: ['invoice', 'payment', 'process', 'extract', 'validate', 'billing', 'ap'],
      suggestedName: 'Invoice Processor',
      suggestedInstructions: [
        'Receive incoming invoice documents from email or uploads',
        'Extract vendor, amount, date, and line item data',
        'Validate extracted data against purchase orders',
        'Flag discrepancies for human review',
        'Route approved invoices for payment processing'
      ],
      suggestedAutonomy: 'assisted',
      suggestedTriggers: ['email-received', 'schedule-daily'],
      suggestedTools: ['quickbooks', 'google', 'slack'],
      suggestedSOPs: [3]
    },
    expense_audit: {
      keywords: ['expense', 'audit', 'review', 'policy', 'compliance', 'reimburse'],
      suggestedName: 'Expense Auditor',
      suggestedInstructions: [
        'Receive submitted expense reports',
        'Check each line item against company expense policy',
        'Flag out-of-policy items with specific violations',
        'Calculate reimbursement totals for compliant items',
        'Route flagged reports to manager for review'
      ],
      suggestedAutonomy: 'supervised',
      suggestedTriggers: ['schedule-weekly', 'manual'],
      suggestedTools: ['quickbooks', 'google', 'slack'],
      suggestedSOPs: [4]
    },
    ticket_triage: {
      keywords: ['ticket', 'triage', 'support', 'customer', 'helpdesk', 'categorize', 'route'],
      suggestedName: 'Ticket Triager',
      suggestedInstructions: [
        'Receive incoming support ticket from helpdesk',
        'Analyze ticket content to determine category and urgency',
        'Apply priority scoring based on customer tier and issue type',
        'Assign ticket to the appropriate support queue',
        'Send acknowledgment to customer with estimated response time'
      ],
      suggestedAutonomy: 'autonomous',
      suggestedTriggers: ['new-lead', 'email-received'],
      suggestedTools: ['zendesk', 'slack', 'notion'],
      suggestedSOPs: [6]
    },
    response_drafting: {
      keywords: ['respond', 'reply', 'draft', 'answer', 'knowledge', 'template'],
      suggestedName: 'Response Drafter',
      suggestedInstructions: [
        'Analyze incoming customer ticket or inquiry',
        'Search knowledge base for relevant articles and solutions',
        'Draft a personalized response addressing the issue',
        'Include relevant links and next steps',
        'Queue response for human agent review before sending'
      ],
      suggestedAutonomy: 'supervised',
      suggestedTriggers: ['manual'],
      suggestedTools: ['zendesk', 'notion', 'slack'],
      suggestedSOPs: [6]
    },
    onboarding: {
      keywords: ['onboard', 'hire', 'new employee', 'orientation', 'document', 'checklist'],
      suggestedName: 'Onboarding Guide',
      suggestedInstructions: [
        'Receive new hire notification from HR system',
        'Generate personalized onboarding checklist based on role',
        'Send welcome email with first-day instructions',
        'Track document submission progress',
        'Notify relevant stakeholders of onboarding milestones'
      ],
      suggestedAutonomy: 'assisted',
      suggestedTriggers: ['manual', 'form-submission'],
      suggestedTools: ['google', 'slack', 'notion'],
      suggestedSOPs: [5]
    },
    data_sync: {
      keywords: ['sync', 'update', 'track', 'monitor', 'report', 'dashboard', 'data'],
      suggestedName: 'Data Sync Agent',
      suggestedInstructions: [
        'Connect to configured data sources on schedule',
        'Pull latest records and compare with previous state',
        'Identify new, modified, or deleted entries',
        'Update target system with synchronized data',
        'Generate sync summary report and notify team'
      ],
      suggestedAutonomy: 'autonomous',
      suggestedTriggers: ['schedule-daily', 'schedule-weekly'],
      suggestedTools: ['google', 'airtable', 'slack'],
      suggestedSOPs: []
    }
  };

  const matchAgentObjective = (userInput) => {
    const input = userInput.toLowerCase();
    let bestMatch = null;
    let highestScore = 0;

    Object.entries(AGENT_OBJECTIVE_PATTERNS).forEach(([key, pattern]) => {
      const score = pattern.keywords.filter(kw => input.includes(kw)).length;
      if (score > highestScore) {
        highestScore = score;
        bestMatch = { key, ...pattern };
      }
    });

    return bestMatch || AGENT_OBJECTIVE_PATTERNS.lead_qualification;
  };

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

  const ProjectStatusBadge = ({ status }) => {
    const styles = {
      running: {
        dot: 'bg-sage',
        text: 'text-sage-dark',
        bg: 'bg-sage-tint',
        label: 'Running'
      },
      halted: {
        dot: 'bg-charcoal-light',
        text: 'text-charcoal-light',
        bg: 'bg-cream-dark',
        label: 'Halted'
      },
      waiting: {
        dot: 'bg-amber',
        text: 'text-amber',
        bg: 'bg-amber-light/20',
        label: 'Waiting'
      }
    };

    const style = styles[status] || styles.halted;

    return (
      <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-medium ${style.bg}`}>
        <span className={`w-1.5 h-1.5 rounded-full ${style.dot}`}></span>
        <span className={style.text}>{style.label}</span>
      </span>
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
        <span className="text-charcoal font-semibold tracking-tight">Taiso Zen</span>
      </div>

      <div className="flex items-center gap-6">
        {/* Empty mode toggle for testing */}
        <button
          onClick={() => setIsEmptyMode(!isEmptyMode)}
          className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
            isEmptyMode
              ? 'bg-amber-light/20 text-amber border border-amber/30'
              : 'bg-sage-tint text-sage border border-sage/30'
          }`}
          title="Toggle between empty state and demo data"
        >
          {isEmptyMode ? 'Empty Mode' : 'Demo Mode'}
        </button>

        {!isEmptyMode && (
          <div className="flex items-center gap-4">
            <MetricPill label="Active" value={stats.active} color="sage" />
            <MetricPill label="Pending" value={stats.pending} color="amber" />
            <MetricPill label="Errors" value={stats.errors} color="red" />
            <MetricPill label="Completed" value={stats.completed} color="muted" />
          </div>
        )}

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
          badge={isEmptyMode ? null : stats.pending}
          active={currentView === 'inbox'}
          onClick={() => { setCurrentView('inbox'); setSelectedProject(null); setSelectedAgent(null); }}
        />
      </nav>

      <div className="px-3 pt-4">
        <h2 className="text-xs font-semibold text-muted uppercase tracking-wider mb-2">Projects</h2>
        {isEmptyMode ? (
          <div className="py-3 px-2.5 text-center">
            <p className="text-xs text-muted mb-2">No projects yet</p>
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
              className="w-full px-2.5 py-1.5 text-sm text-white bg-sage rounded-lg hover:bg-sage-dark transition-colors flex items-center justify-center gap-1.5"
            >
              <span className="text-lg leading-none">+</span> Create Project
            </button>
          </div>
        ) : (
          <>
            {/* MRU Projects List - max 5 */}
            <div className="space-y-0.5">
              {getMRUProjects(projects, 5).map(project => (
                <button
                  key={project.id}
                  onClick={() => { setSelectedProject(project); setCurrentView('project-dashboard'); setSelectedAgent(null); }}
                  className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-md text-sm transition-colors ${
                    selectedProject?.id === project.id && (currentView === 'project-dashboard' || currentView === 'project-edit')
                      ? 'bg-cream-dark text-charcoal font-medium'
                      : 'text-charcoal-light hover:bg-cream-dark/50'
                  }`}
                >
                  <span className="truncate">{project.name}</span>
                  {project.active > 0 && (
                    <span className="flex items-center gap-1 text-xs text-sage">
                      <StatusBadge status="active" />
                      {project.active}
                    </span>
                  )}
                </button>
              ))}
            </div>

            {/* Divider */}
            <div className="border-t border-border-light my-2"></div>

            {/* All Projects Action */}
            <button
              onClick={() => { setCurrentView('projects-list'); setSelectedProject(null); }}
              className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-md text-sm transition-colors ${
                currentView === 'projects-list'
                  ? 'bg-cream-dark text-charcoal font-medium'
                  : 'text-charcoal-light hover:bg-cream-dark/50'
              }`}
            >
              <span className="flex items-center gap-2">
                <span className="opacity-70">📁</span>
                All Projects
              </span>
              <span className="text-xs text-muted">{projects.length}</span>
            </button>

            {/* New Project Button */}
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
              className="w-full mt-1 px-2.5 py-1.5 text-sm text-muted hover:text-charcoal text-left flex items-center gap-1.5"
            >
              <span className="text-lg leading-none">+</span> New Project
            </button>
          </>
        )}
      </div>

      {/* Building Blocks Section */}
      <div className="px-3 pt-6">
        <h2 className="text-xs font-semibold text-muted uppercase tracking-wider mb-2">Building Blocks</h2>
        <div className="space-y-0.5">
          <SidebarItem
            icon="🤖"
            label="Agents"
            badge={allTeamMembers.agents.length}
            active={currentView === 'building-blocks-agents'}
            onClick={() => { setCurrentView('building-blocks-agents'); setSelectedProject(null); }}
          />
          <SidebarItem
            icon="👤"
            label="Humans"
            badge={allTeamMembers.humans.length}
            active={currentView === 'building-blocks-humans'}
            onClick={() => { setCurrentView('building-blocks-humans'); setSelectedProject(null); }}
          />
          <SidebarItem
            icon="📋"
            label="SOPs"
            badge={sopLibrary.length}
            active={currentView === 'building-blocks-sops'}
            onClick={() => { setCurrentView('building-blocks-sops'); setSelectedProject(null); }}
          />
          <SidebarItem
            icon="🔌"
            label="Connected Tools"
            badge={availableTools.length}
            active={currentView === 'tools'}
            onClick={() => { setCurrentView('tools'); setSelectedProject(null); setSelectedTool(null); }}
          />
        </div>
      </div>

      {/* Execution monitoring - hidden in empty mode */}
      {!isEmptyMode && (
        <div className="px-3 pt-6">
          <h2 className="text-xs font-semibold text-muted uppercase tracking-wider mb-2">Execution monitoring</h2>
          <div className="space-y-0.5">
            <SidebarItem
              icon="📅"
              label="Schedule"
              active={currentView === 'schedule'}
              onClick={() => { setCurrentView('schedule'); setSelectedProject(null); }}
            />
            {/* Active Team Section - shows team members assigned to projects */}
            <div className="space-y-0.5">
              <div className="flex items-center gap-2 px-2.5 py-1.5 text-sm text-muted">
                <span className="opacity-70">👥</span>
                <span className="font-medium">Active Team</span>
              </div>
              <div className="pl-4 space-y-0.5">
                <button
                  onClick={() => { setCurrentView('team-agents'); setSelectedProject(null); }}
                  className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-md text-sm transition-colors ${
                    currentView === 'team-agents'
                      ? 'bg-cream-dark text-charcoal font-medium'
                      : 'text-charcoal-light hover:bg-cream-dark/50'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <span className="opacity-70">🤖</span>
                    Agents
                  </span>
                  <span className="text-xs text-muted">{allTeamMembers.agents.filter(a => a.project).length}</span>
                </button>
                <button
                  onClick={() => { setCurrentView('team-humans'); setSelectedProject(null); }}
                  className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-md text-sm transition-colors ${
                    currentView === 'team-humans'
                      ? 'bg-cream-dark text-charcoal font-medium'
                      : 'text-charcoal-light hover:bg-cream-dark/50'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <span className="opacity-70">👤</span>
                    Humans
                  </span>
                  <span className="text-xs text-muted">{allTeamMembers.humans.filter(h => h.project).length}</span>
                </button>
              </div>
            </div>
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
      )}

      {/* Analytics - hidden in empty mode */}
      {!isEmptyMode && (
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
      )}

      <div className="px-3 pt-6">
        <h2 className="text-xs font-semibold text-muted uppercase tracking-wider mb-2">Settings</h2>
        <div className="space-y-0.5">
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
  const CommandCenterView = () => {
    // Empty state for first-time users
    if (isEmptyMode) {
      return (
        <div className="flex-1 p-6 overflow-auto bg-cream-light">
          <div className="max-w-4xl mx-auto">
            <h1 ref={mainHeadingRef} tabIndex={-1} className="text-2xl font-semibold text-charcoal mb-6 outline-none">Command Center</h1>

            {/* Welcome Hero */}
            <div className="bg-white rounded-xl border border-border-light shadow-soft p-8 mb-6">
              <div className="flex items-start gap-6">
                <div className="w-16 h-16 bg-sage-tint rounded-2xl flex items-center justify-center flex-shrink-0">
                  <span className="text-4xl">🚀</span>
                </div>
                <div className="flex-1">
                  <h2 className="text-xl font-semibold text-charcoal mb-2">Welcome to Agent Command Center</h2>
                  <p className="text-muted mb-4">
                    Build intelligent workflows by combining AI agents with human oversight.
                    Tell us your goal and we'll help you set everything up.
                  </p>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setCurrentView('project-creator-ai')}
                      className="px-5 py-2.5 text-sm font-medium text-white bg-sage rounded-lg hover:bg-sage-dark transition-colors inline-flex items-center gap-2"
                    >
                      <span>✨</span> Create with AI Assistant
                    </button>
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
                      className="px-4 py-2.5 text-sm text-charcoal-light hover:text-charcoal transition-colors"
                    >
                      Advanced Setup →
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Getting Started Checklist */}
            <div className="bg-white rounded-xl border border-border-light shadow-soft p-6 mb-6">
              <h3 className="text-sm font-semibold text-charcoal mb-4">Getting Started</h3>
              <div className="space-y-3">
                {[
                  { step: 1, label: 'Create your first project', description: 'Describe your goal and let AI set it up', icon: '✨', done: false, action: () => setCurrentView('project-creator-ai') },
                  { step: 2, label: 'Add AI agents', description: 'Configure agents for your workflows', icon: '🤖', done: false },
                  { step: 3, label: 'Connect your tools', description: 'Integrate with Slack, Google, Salesforce, and more', icon: '🔌', done: false, action: () => setCurrentView('tools') },
                  { step: 4, label: 'Create or import SOPs', description: 'Define standard operating procedures for your workflows', icon: '📋', done: false, action: () => setCurrentView('building-blocks-sops') },
                  { step: 5, label: 'Invite your team', description: 'Add team members for human-in-the-loop tasks', icon: '👥', done: false, action: () => setCurrentView('team') },
                ].map((item) => (
                  <button
                    key={item.step}
                    onClick={item.action}
                    className="w-full flex items-center gap-4 p-3 rounded-lg hover:bg-cream transition-colors text-left"
                  >
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${item.done ? 'bg-sage-tint' : 'bg-cream-dark'}`}>
                      {item.done ? (
                        <svg className="w-5 h-5 text-sage" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      ) : (
                        <span className="text-lg">{item.icon}</span>
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-medium text-charcoal">{item.label}</div>
                      <div className="text-xs text-muted">{item.description}</div>
                    </div>
                    <svg className="w-4 h-4 text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                ))}
              </div>
            </div>

            {/* Quick Start Templates */}
            <div className="bg-white rounded-xl border border-border-light shadow-soft p-6">
              <h3 className="text-sm font-semibold text-charcoal mb-4">Quick Start Templates</h3>
              <div className="grid grid-cols-2 gap-4">
                {projectTemplates.slice(0, 4).map((template) => (
                  <button
                    key={template.id}
                    onClick={() => {
                      setWizardStep(1);
                      setNewProject({
                        name: '',
                        goal: '',
                        template: template,
                        status: 'draft',
                        agents: [],
                        sops: [],
                        tools: [],
                        people: [],
                        workflow: { nodes: [], connections: [], triggers: [] }
                      });
                      setCurrentView('project-wizard');
                    }}
                    className="flex items-start gap-3 p-4 rounded-lg border border-border-light hover:border-sage hover:bg-sage-tint/30 transition-colors text-left"
                  >
                    <span className="text-2xl">{template.icon}</span>
                    <div>
                      <div className="text-sm font-medium text-charcoal">{template.name}</div>
                      <div className="text-xs text-muted mt-0.5">{template.description}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Demo mode toggle - for testing */}
            <div className="mt-6 flex items-center justify-center">
              <button
                onClick={() => setIsEmptyMode(false)}
                className="text-xs text-muted hover:text-charcoal transition-colors"
              >
                View demo with sample data →
              </button>
            </div>
          </div>
        </div>
      );
    }

    return (
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
  };

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

  // Team Agents View
  const TeamAgentsView = () => (
    <div className="flex-1 p-6 overflow-auto bg-cream-light">
      <div className="max-w-5xl">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 ref={mainHeadingRef} tabIndex={-1} className="text-2xl font-semibold text-charcoal outline-none">Agents</h1>
            <p className="text-sm text-muted mt-1">{allTeamMembers.agents.length} agents across all projects</p>
          </div>
          <div className="flex items-center gap-2">
            <label className="sr-only" htmlFor="agents-project-filter">Filter by project</label>
            <select id="agents-project-filter" aria-label="Filter by project" className="h-8 px-3 text-sm border border-border-light rounded-lg bg-white">
              <option>All projects</option>
              {projects.map(p => <option key={p.id}>{p.name}</option>)}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-xl border border-border-light p-4 shadow-soft">
            <div className="text-sm text-muted mb-1">Total Agents</div>
            <div className="text-3xl font-semibold text-charcoal">{allTeamMembers.agents.length}</div>
          </div>
          <div className="bg-white rounded-xl border border-border-light p-4 shadow-soft">
            <div className="text-sm text-muted mb-1">Active Now</div>
            <div className="text-3xl font-semibold text-sage">{allTeamMembers.agents.filter(a => a.status === 'active').length}</div>
          </div>
          <div className="bg-white rounded-xl border border-border-light p-4 shadow-soft">
            <div className="text-sm text-muted mb-1">Errors</div>
            <div className="text-3xl font-semibold text-red-600">{allTeamMembers.agents.filter(a => a.status === 'error').length}</div>
          </div>
        </div>

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
                    <span className="text-xs text-teal">View →</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  // Team Humans View
  const TeamHumansView = () => (
    <div className="flex-1 p-6 overflow-auto bg-cream-light">
      <div className="max-w-5xl">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 ref={mainHeadingRef} tabIndex={-1} className="text-2xl font-semibold text-charcoal outline-none">Humans</h1>
            <p className="text-sm text-muted mt-1">{allTeamMembers.humans.length} team members across all projects</p>
          </div>
          <div className="flex items-center gap-2">
            <label className="sr-only" htmlFor="humans-project-filter">Filter by project</label>
            <select id="humans-project-filter" aria-label="Filter by project" className="h-8 px-3 text-sm border border-border-light rounded-lg bg-white">
              <option>All projects</option>
              {projects.map(p => <option key={p.id}>{p.name}</option>)}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-xl border border-border-light p-4 shadow-soft">
            <div className="text-sm text-muted mb-1">Total Humans</div>
            <div className="text-3xl font-semibold text-charcoal">{allTeamMembers.humans.length}</div>
          </div>
          <div className="bg-white rounded-xl border border-border-light p-4 shadow-soft">
            <div className="text-sm text-muted mb-1">Total Tasks Completed</div>
            <div className="text-3xl font-semibold text-sage">{allTeamMembers.humans.reduce((sum, h) => sum + h.tasksCompleted, 0)}</div>
          </div>
          <div className="bg-white rounded-xl border border-border-light p-4 shadow-soft">
            <div className="text-sm text-muted mb-1">Projects</div>
            <div className="text-3xl font-semibold text-teal">{[...new Set(allTeamMembers.humans.map(h => h.project))].length}</div>
          </div>
        </div>

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
                    <span className="text-xs text-teal">View Profile →</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  // Building Blocks - All Agents View
  const BuildingBlocksAgentsView = () => (
    <div className="flex-1 p-6 overflow-auto bg-cream-light">
      <div className="max-w-5xl">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 ref={mainHeadingRef} tabIndex={-1} className="text-2xl font-semibold text-charcoal outline-none">All Agents</h1>
            <p className="text-sm text-muted mt-1">{allTeamMembers.agents.length} agents configured in the system</p>
          </div>
          <button
            onClick={() => {
              setEditingAgent(null);
              setCurrentView('agent-creator-ai');
            }}
            className="px-4 py-2 bg-sage text-white text-sm font-medium rounded-lg hover:bg-sage-dark transition-colors flex items-center gap-2"
          >
            <span className="text-lg leading-none">+</span> New Agent
          </button>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-xl border border-border-light p-4 shadow-soft">
            <div className="text-sm text-muted mb-1">Total Agents</div>
            <div className="text-3xl font-semibold text-charcoal">{allTeamMembers.agents.length}</div>
          </div>
          <div className="bg-white rounded-xl border border-border-light p-4 shadow-soft">
            <div className="text-sm text-muted mb-1">Assigned to Projects</div>
            <div className="text-3xl font-semibold text-sage">{allTeamMembers.agents.filter(a => a.project).length}</div>
          </div>
          <div className="bg-white rounded-xl border border-border-light p-4 shadow-soft">
            <div className="text-sm text-muted mb-1">Unassigned</div>
            <div className="text-3xl font-semibold text-muted">{allTeamMembers.agents.filter(a => !a.project).length}</div>
          </div>
        </div>

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
                  <td className="px-4 py-3 text-sm text-charcoal-light">{agent.project || <span className="text-muted italic">Unassigned</span>}</td>
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
                    <span className="text-xs text-teal">View →</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  // Building Blocks - All Humans View
  const BuildingBlocksHumansView = () => (
    <div className="flex-1 p-6 overflow-auto bg-cream-light">
      <div className="max-w-5xl">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 ref={mainHeadingRef} tabIndex={-1} className="text-2xl font-semibold text-charcoal outline-none">All Humans</h1>
            <p className="text-sm text-muted mt-1">{allTeamMembers.humans.length} team members configured in the system</p>
          </div>
          <button className="px-4 py-2 bg-sage text-white text-sm font-medium rounded-lg hover:bg-sage-dark transition-colors flex items-center gap-2">
            <span className="text-lg leading-none">+</span> Add Team Member
          </button>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-xl border border-border-light p-4 shadow-soft">
            <div className="text-sm text-muted mb-1">Total Humans</div>
            <div className="text-3xl font-semibold text-charcoal">{allTeamMembers.humans.length}</div>
          </div>
          <div className="bg-white rounded-xl border border-border-light p-4 shadow-soft">
            <div className="text-sm text-muted mb-1">Assigned to Projects</div>
            <div className="text-3xl font-semibold text-sage">{allTeamMembers.humans.filter(h => h.project).length}</div>
          </div>
          <div className="bg-white rounded-xl border border-border-light p-4 shadow-soft">
            <div className="text-sm text-muted mb-1">Unassigned</div>
            <div className="text-3xl font-semibold text-muted">{allTeamMembers.humans.filter(h => !h.project).length}</div>
          </div>
        </div>

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
                  aria-label={`${human.name}, ${human.role}, ${human.project || 'Unassigned'}`}
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
                  <td className="px-4 py-3 text-sm text-charcoal-light">{human.project || <span className="text-muted italic">Unassigned</span>}</td>
                  <td className="px-4 py-3 text-sm text-charcoal-light">{human.tasksCompleted}</td>
                  <td className="px-4 py-3 text-right">
                    <span className="text-xs text-teal">View Profile →</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  // Building Blocks - All SOPs View
  const BuildingBlocksSOPsView = () => (
    <div className="flex-1 p-6 overflow-auto bg-cream-light">
      <div className="max-w-5xl">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 ref={mainHeadingRef} tabIndex={-1} className="text-2xl font-semibold text-charcoal outline-none">All SOPs</h1>
            <p className="text-sm text-muted mt-1">{sopLibrary.length} Standard Operating Procedures configured in the system</p>
          </div>
          <div className="flex items-center gap-2">
            <button className="px-4 py-2 text-sm font-medium text-teal border border-teal rounded-lg hover:bg-teal-tint transition-colors flex items-center gap-2">
              Browse SOP Marketplace
            </button>
            <button
              onClick={() => {
                setSopModalOpen(true);
                setSopModalState('input');
                setSopForm({ name: '', description: '', category: 'Sales', files: [] });
              }}
              className="px-4 py-2 bg-sage text-white text-sm font-medium rounded-lg hover:bg-sage-dark transition-colors"
            >
              Create custom SOP
            </button>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-xl border border-border-light p-4 shadow-soft">
            <div className="text-sm text-muted mb-1">Total SOPs</div>
            <div className="text-3xl font-semibold text-charcoal">{sopLibrary.length}</div>
          </div>
          <div className="bg-white rounded-xl border border-border-light p-4 shadow-soft">
            <div className="text-sm text-muted mb-1">In Use</div>
            <div className="text-3xl font-semibold text-sage">{sopLibrary.filter(s => s.usedBy > 0).length}</div>
          </div>
          <div className="bg-white rounded-xl border border-border-light p-4 shadow-soft">
            <div className="text-sm text-muted mb-1">Categories</div>
            <div className="text-3xl font-semibold text-teal">{[...new Set(sopLibrary.map(s => s.category))].length}</div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-border-light shadow-soft overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="bg-cream border-b border-border-light">
                <th className="text-left text-xs font-medium text-muted uppercase tracking-wider px-4 py-3">SOP</th>
                <th className="text-left text-xs font-medium text-muted uppercase tracking-wider px-4 py-3">Description</th>
                <th className="text-left text-xs font-medium text-muted uppercase tracking-wider px-4 py-3">Category</th>
                <th className="text-left text-xs font-medium text-muted uppercase tracking-wider px-4 py-3">Steps</th>
                <th className="text-left text-xs font-medium text-muted uppercase tracking-wider px-4 py-3">Used By</th>
                <th className="text-right text-xs font-medium text-muted uppercase tracking-wider px-4 py-3"><span className="sr-only">Actions</span></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-light">
              {sopLibrary.map(sop => (
                <tr
                  key={sop.id}
                  tabIndex={0}
                  role="row"
                  aria-label={`${sop.name}, ${sop.category}, ${sop.steps} steps`}
                  className="hover:bg-cream cursor-pointer focus:outline-none focus:bg-teal-tint"
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-gradient-to-br from-cream to-cream-dark rounded-lg flex items-center justify-center" aria-hidden="true">
                        <span className="text-sm">📋</span>
                      </div>
                      <span className="text-sm font-medium text-charcoal">{sop.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-charcoal-light max-w-xs truncate">{sop.description}</td>
                  <td className="px-4 py-3">
                    <span className="inline-flex px-2 py-0.5 bg-cream-dark rounded text-xs text-charcoal">{sop.category}</span>
                  </td>
                  <td className="px-4 py-3 text-sm text-charcoal-light">{sop.steps}</td>
                  <td className="px-4 py-3">
                    <span className="text-sm text-charcoal-light">{sop.usedBy} {sop.usedBy === 1 ? 'agent' : 'agents'}</span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <span className="text-xs text-teal">View →</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  // SOP Modal constants
  const sopProcessingSteps = [
    { label: 'Analyzing documents', icon: '📄' },
    { label: 'Extracting steps', icon: '📝' },
    { label: 'Building workflow', icon: '⚙️' },
    { label: 'Done', icon: '✓' }
  ];

  const sopCategories = ['Sales', 'Finance', 'HR', 'Support', 'Operations', 'Marketing'];

  // SOP Modal handlers
  const handleSopModalClose = () => {
    setSopModalOpen(false);
    setSopModalState('input');
    setSopProcessingStep(0);
    setSopForm({ name: '', description: '', category: 'Sales', files: [] });
    setGeneratedSop(null);
  };

  const handleSopFileUpload = (e) => {
    const newFiles = Array.from(e.target.files);
    setSopForm(prev => ({
      ...prev,
      files: [...prev.files, ...newFiles]
    }));
  };

  const removeSopFile = (index) => {
    setSopForm(prev => ({
      ...prev,
      files: prev.files.filter((_, i) => i !== index)
    }));
  };

  const handleSopGenerate = async () => {
    setSopModalState('processing');
    setSopProcessingStep(0);

    // Simulate multi-step processing
    for (let step = 0; step < 3; step++) {
      await new Promise(r => setTimeout(r, 1500));
      setSopProcessingStep(step + 1);
    }

    // Generate mock SOP based on form input
    const mockSop = {
      id: Date.now(),
      name: sopForm.name,
      description: sopForm.description || `Automated procedure for ${sopForm.name.toLowerCase()}`,
      category: sopForm.category,
      steps: [
        { id: 1, name: 'Receive input data', description: 'Capture and validate incoming information' },
        { id: 2, name: 'Process information', description: 'Apply business rules and transformations' },
        { id: 3, name: 'Validate results', description: 'Check output against quality criteria' },
        { id: 4, name: 'Route or complete', description: 'Send to next step or mark as complete' }
      ],
      inputs: [
        { name: 'Primary data source', type: 'data', required: true },
        { name: 'Configuration parameters', type: 'config', required: false }
      ],
      outputs: [
        { name: 'Processed result', type: 'data' },
        { name: 'Status report', type: 'text' }
      ],
      tools: [1, 2], // Google Workspace, Salesforce
      usedBy: 0,
      sourceFiles: sopForm.files.map(f => f.name)
    };

    await new Promise(r => setTimeout(r, 500));
    setSopProcessingStep(3);
    setGeneratedSop(mockSop);

    await new Promise(r => setTimeout(r, 500));
    setSopModalState('review');
  };

  const handleSopSave = () => {
    showToast(`SOP "${generatedSop.name}" created successfully`, 'success');
    handleSopModalClose();
  };

  const handleSopEditDetails = () => {
    setSopModalState('input');
    setSopProcessingStep(0);
  };

  // All Projects View
  const ProjectsListView = () => {
    // Sorting logic
    const sortedProjects = [...projects].sort((a, b) => {
      const { key, direction } = projectsSortConfig;
      let aVal = a[key];
      let bVal = b[key];

      // Handle date comparisons
      if (key === 'dateAdded' || key === 'dateModified' || key === 'lastAccessed') {
        aVal = new Date(aVal);
        bVal = new Date(bVal);
      }

      // Handle string comparisons
      if (typeof aVal === 'string' && typeof bVal === 'string') {
        aVal = aVal.toLowerCase();
        bVal = bVal.toLowerCase();
      }

      if (aVal < bVal) return direction === 'asc' ? -1 : 1;
      if (aVal > bVal) return direction === 'asc' ? 1 : -1;
      return 0;
    });

    const handleSort = (key) => {
      setProjectsSortConfig(prev => ({
        key,
        direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
      }));
    };

    // Sort indicator component
    const SortIndicator = ({ columnKey }) => {
      if (projectsSortConfig.key !== columnKey) {
        return <span className="ml-1 text-muted opacity-50">↕</span>;
      }
      return (
        <span className="ml-1 text-sage">
          {projectsSortConfig.direction === 'asc' ? '↑' : '↓'}
        </span>
      );
    };

    return (
      <div className="flex-1 p-6 overflow-auto bg-cream-light">
        <div className="max-w-5xl">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 ref={mainHeadingRef} tabIndex={-1} className="text-2xl font-semibold text-charcoal outline-none">
                All Projects
              </h1>
              <p className="text-sm text-muted mt-1">{projects.length} projects</p>
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
              className="px-3 py-1.5 text-sm text-white bg-sage rounded-lg hover:bg-sage-dark flex items-center gap-1.5"
            >
              <span className="text-lg leading-none">+</span> New Project
            </button>
          </div>

          {/* Stats Row */}
          <div className="grid grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-xl border border-border-light p-4 shadow-soft">
              <div className="text-sm text-muted mb-1">Total Projects</div>
              <div className="text-3xl font-semibold text-charcoal">{projects.length}</div>
            </div>
            <div className="bg-white rounded-xl border border-border-light p-4 shadow-soft">
              <div className="text-sm text-muted mb-1">Running</div>
              <div className="text-3xl font-semibold text-sage">
                {projects.filter(p => p.status === 'running').length}
              </div>
            </div>
            <div className="bg-white rounded-xl border border-border-light p-4 shadow-soft">
              <div className="text-sm text-muted mb-1">Waiting</div>
              <div className="text-3xl font-semibold text-amber">
                {projects.filter(p => p.status === 'waiting').length}
              </div>
            </div>
            <div className="bg-white rounded-xl border border-border-light p-4 shadow-soft">
              <div className="text-sm text-muted mb-1">Halted</div>
              <div className="text-3xl font-semibold text-muted">
                {projects.filter(p => p.status === 'halted').length}
              </div>
            </div>
          </div>

          {/* Projects Table */}
          <div className="bg-white rounded-xl border border-border-light shadow-soft overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="bg-cream border-b border-border-light">
                  <th
                    onClick={() => handleSort('name')}
                    className="text-left text-xs font-medium text-muted uppercase tracking-wider px-4 py-3 cursor-pointer hover:bg-cream-dark select-none"
                  >
                    <span className="flex items-center">
                      Name <SortIndicator columnKey="name" />
                    </span>
                  </th>
                  <th
                    onClick={() => handleSort('status')}
                    className="text-left text-xs font-medium text-muted uppercase tracking-wider px-4 py-3 cursor-pointer hover:bg-cream-dark select-none"
                  >
                    <span className="flex items-center">
                      Status <SortIndicator columnKey="status" />
                    </span>
                  </th>
                  <th
                    onClick={() => handleSort('dateAdded')}
                    className="text-left text-xs font-medium text-muted uppercase tracking-wider px-4 py-3 cursor-pointer hover:bg-cream-dark select-none"
                  >
                    <span className="flex items-center">
                      Date Added <SortIndicator columnKey="dateAdded" />
                    </span>
                  </th>
                  <th
                    onClick={() => handleSort('dateModified')}
                    className="text-left text-xs font-medium text-muted uppercase tracking-wider px-4 py-3 cursor-pointer hover:bg-cream-dark select-none"
                  >
                    <span className="flex items-center">
                      Last Modified <SortIndicator columnKey="dateModified" />
                    </span>
                  </th>
                  <th
                    onClick={() => handleSort('notifications')}
                    className="text-left text-xs font-medium text-muted uppercase tracking-wider px-4 py-3 cursor-pointer hover:bg-cream-dark select-none"
                  >
                    <span className="flex items-center">
                      Notifications <SortIndicator columnKey="notifications" />
                    </span>
                  </th>
                  <th className="text-right text-xs font-medium text-muted uppercase tracking-wider px-4 py-3">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-light">
                {sortedProjects.map(project => (
                  <tr
                    key={project.id}
                    onClick={() => {
                      setSelectedProject(project);
                      setCurrentView('project-dashboard');
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        setSelectedProject(project);
                        setCurrentView('project-dashboard');
                      }
                    }}
                    tabIndex={0}
                    role="row"
                    aria-label={`${project.name}, ${project.status}`}
                    className="hover:bg-cream cursor-pointer focus:outline-none focus:bg-teal-tint"
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-gradient-to-br from-cream to-cream-dark rounded-lg flex items-center justify-center" aria-hidden="true">
                          <span className="text-sm">📁</span>
                        </div>
                        <div>
                          <span className="text-sm font-medium text-charcoal">{project.name}</span>
                          <div className="text-xs text-muted">{project.agents} agents · {project.humans} humans</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <ProjectStatusBadge status={project.status} />
                    </td>
                    <td className="px-4 py-3 text-sm text-charcoal-light">
                      {formatDate(project.dateAdded)}
                    </td>
                    <td className="px-4 py-3 text-sm text-charcoal-light">
                      {formatDate(project.dateModified)}
                    </td>
                    <td className="px-4 py-3">
                      {project.notifications > 0 ? (
                        <span className="px-2 py-0.5 text-xs font-medium bg-amber-light/20 text-amber rounded">
                          {project.notifications}
                        </span>
                      ) : (
                        <span className="text-xs text-muted">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span className="text-xs text-teal">View →</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  };

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
                  Click the button below to authorize Taiso Zen to access your {selectedTool?.name} account. 
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
              {/* Action Buttons - Icon with Caption */}
              <div className="flex items-center gap-1">
                {/* Run Agent */}
                <button
                  onClick={async () => {
                    setLoading('run-agent', true);
                    await new Promise(r => setTimeout(r, 1500));
                    setLoading('run-agent', false);
                    showToast(`${selectedAgent?.name} started successfully`, 'success');
                  }}
                  disabled={loadingStates['run-agent']}
                  aria-busy={loadingStates['run-agent']}
                  className={`flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-colors ${
                    loadingStates['run-agent']
                      ? 'text-muted cursor-not-allowed'
                      : 'text-sage hover:bg-sage-tint'
                  }`}
                >
                  <svg className="w-10 h-10" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z"/>
                  </svg>
                  <span className="text-xs font-medium">{loadingStates['run-agent'] ? 'Starting...' : 'Run'}</span>
                </button>

                {/* Edit Agent */}
                <button
                  onClick={() => {
                    setEditingAgent(selectedAgent);
                    setCurrentView('agent-creator-ai');
                  }}
                  className="flex flex-col items-center gap-1 px-3 py-2 rounded-lg text-charcoal-light hover:bg-cream transition-colors"
                >
                  <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931z" />
                  </svg>
                  <span className="text-xs font-medium">Edit</span>
                </button>

                {/* Delete Agent */}
                <button
                  onClick={() => {
                    setConfirmDialog({
                      title: 'Delete Agent?',
                      message: `This will permanently delete "${selectedAgent?.name}" and all its configuration. This action cannot be undone.`,
                      confirmLabel: 'Delete Agent',
                      confirmStyle: 'destructive',
                      onConfirm: () => {
                        showToast(`Agent "${selectedAgent?.name}" deleted`, 'success');
                        setSelectedAgent(null);
                        setCurrentView('team-agents');
                        setConfirmDialog(null);
                      }
                    });
                  }}
                  className="flex flex-col items-center gap-1 px-3 py-2 rounded-lg text-red-500 hover:bg-red-50 transition-colors"
                >
                  <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  <span className="text-xs font-medium">Delete</span>
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

  // Agent Create/Edit Form View
  const AgentFormView = () => {
    const isEditMode = currentView === 'agent-edit' && editingAgent !== null;

    // Initialize form state
    const [agentForm, setAgentForm] = useState(() => {
      if (isEditMode && editingAgent) {
        return {
          name: editingAgent.name || '',
          project: editingAgent.project || '',
          autonomy: editingAgent.autonomy || 'supervised',
          objective: editingAgent.objective || '',
          instructions: editingAgent.instructions || [''],
          triggers: editingAgent.triggers || [],
          tools: editingAgent.tools || [],
          sops: editingAgent.sops || []
        };
      }
      return {
        name: '',
        project: '',
        autonomy: 'supervised',
        objective: '',
        instructions: [''],
        triggers: [],
        tools: [],
        sops: []
      };
    });

    // Available trigger options
    const triggerOptions = [
      { id: 'new-lead', label: 'New lead arrives in CRM', icon: '📥' },
      { id: 'schedule-daily', label: 'Scheduled (daily)', icon: '📅' },
      { id: 'schedule-weekly', label: 'Scheduled (weekly)', icon: '📆' },
      { id: 'manual', label: 'Manual trigger only', icon: '👆' },
      { id: 'form-submission', label: 'On form submission', icon: '📝' },
      { id: 'email-received', label: 'Email received', icon: '📧' },
    ];

    // Autonomy level options with descriptions
    const autonomyLevels = [
      { value: 'supervised', label: 'Supervised', description: 'Agent requires human approval for all actions', icon: '👀' },
      { value: 'assisted', label: 'Assisted', description: 'Agent can act independently but escalates complex decisions', icon: '🤝' },
      { value: 'autonomous', label: 'Autonomous', description: 'Agent operates fully independently within defined bounds', icon: '🚀' },
    ];

    // Validation
    const isValid = agentForm.name.trim() !== '' &&
                    agentForm.project !== '' &&
                    agentForm.instructions.filter(i => i.trim()).length > 0;

    // Handle instruction changes
    const updateInstruction = (index, value) => {
      const newInstructions = [...agentForm.instructions];
      newInstructions[index] = value;
      setAgentForm({ ...agentForm, instructions: newInstructions });
    };

    const addInstruction = () => {
      setAgentForm({ ...agentForm, instructions: [...agentForm.instructions, ''] });
    };

    const removeInstruction = (index) => {
      if (agentForm.instructions.length > 1) {
        const newInstructions = agentForm.instructions.filter((_, i) => i !== index);
        setAgentForm({ ...agentForm, instructions: newInstructions });
      }
    };

    // Handle trigger toggle
    const toggleTrigger = (triggerId) => {
      const newTriggers = agentForm.triggers.includes(triggerId)
        ? agentForm.triggers.filter(t => t !== triggerId)
        : [...agentForm.triggers, triggerId];
      setAgentForm({ ...agentForm, triggers: newTriggers });
    };

    // Handle tool toggle
    const toggleTool = (toolId) => {
      const newTools = agentForm.tools.includes(toolId)
        ? agentForm.tools.filter(t => t !== toolId)
        : [...agentForm.tools, toolId];
      setAgentForm({ ...agentForm, tools: newTools });
    };

    // Handle SOP toggle
    const toggleSOP = (sopId) => {
      const newSOPs = agentForm.sops.includes(sopId)
        ? agentForm.sops.filter(s => s !== sopId)
        : [...agentForm.sops, sopId];
      setAgentForm({ ...agentForm, sops: newSOPs });
    };

    // Handle form submission
    const handleSubmit = () => {
      if (!isValid) return;

      const agentData = {
        ...agentForm,
        id: isEditMode ? editingAgent.id : Date.now(),
        status: isEditMode ? editingAgent.status : 'idle',
        approvalRate: isEditMode ? editingAgent.approvalRate : 0,
        tasksCompleted: isEditMode ? editingAgent.tasksCompleted : 0,
        instructions: agentForm.instructions.filter(i => i.trim()),
      };

      if (isEditMode) {
        // Update existing agent in allTeamMembers (in a real app, this would be an API call)
        showToast(`Agent "${agentData.name}" updated successfully`);
      } else {
        // Add new agent (in a real app, this would be an API call)
        showToast(`Agent "${agentData.name}" created successfully`);
      }

      // Navigate back
      if (isEditMode) {
        setSelectedAgent(agentData);
        setCurrentView('agent-detail');
      } else {
        setCurrentView('team-agents');
      }
      setEditingAgent(null);
    };

    // Handle cancel
    const handleCancel = () => {
      if (isEditMode) {
        setCurrentView('agent-detail');
      } else {
        setCurrentView('team-agents');
      }
      setEditingAgent(null);
    };

    return (
      <div className="flex-1 p-6 overflow-auto bg-cream-light">
        <div className="max-w-5xl mx-auto">
          {/* Cancel Link */}
          <button
            onClick={handleCancel}
            className="text-sm text-muted hover:text-charcoal mb-4 flex items-center gap-1"
          >
            ← Cancel
          </button>

          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 ref={mainHeadingRef} tabIndex={-1} className="text-2xl font-semibold text-charcoal outline-none">
                {isEditMode ? `Edit Agent: ${editingAgent?.name}` : 'Create New Agent'}
              </h1>
              <p className="text-sm text-muted mt-1">
                {isEditMode ? 'Modify agent configuration and behavior.' : 'Configure a new AI agent to automate tasks.'}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={handleCancel}
                className="px-4 py-2 text-sm text-charcoal-light hover:text-charcoal"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={!isValid}
                className={`px-6 py-2 text-sm font-medium rounded-lg transition-colors ${
                  isValid
                    ? 'bg-teal text-white hover:bg-teal-dark'
                    : 'bg-border-light text-muted cursor-not-allowed'
                }`}
              >
                {isEditMode ? 'Save Changes' : 'Create Agent'}
              </button>
            </div>
          </div>

          {/* Form Content - Two Column Layout */}
          <div className="grid grid-cols-3 gap-6">
            {/* Left Column - Main Form (2/3 width) */}
            <div className="col-span-2 space-y-6">
              {/* Basic Information Card */}
              <div className="bg-white rounded-xl border border-border-light shadow-soft p-6">
                <h2 className="text-lg font-medium text-charcoal mb-4">Basic Information</h2>
                <div className="space-y-6">
                  {/* Agent Name */}
                  <div>
                    <label htmlFor="agent-name" className="block text-sm font-medium text-charcoal mb-2">
                      Agent Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="agent-name"
                      type="text"
                      value={agentForm.name}
                      onChange={(e) => setAgentForm({ ...agentForm, name: e.target.value })}
                      placeholder="e.g., Lead Qualifier, Invoice Processor"
                      className="w-full h-10 px-3 border border-border-light rounded-lg text-sm focus:outline-none focus:border-teal"
                    />
                  </div>

                  {/* Project Assignment */}
                  <div>
                    <label htmlFor="agent-project" className="block text-sm font-medium text-charcoal mb-2">
                      Project Assignment <span className="text-red-500">*</span>
                    </label>
                    <select
                      id="agent-project"
                      value={agentForm.project}
                      onChange={(e) => setAgentForm({ ...agentForm, project: e.target.value })}
                      className="w-full h-10 px-3 border border-border-light rounded-lg text-sm focus:outline-none focus:border-teal bg-white"
                    >
                      <option value="">Select a project...</option>
                      {projects.map(p => (
                        <option key={p.id} value={p.name}>{p.name}</option>
                      ))}
                    </select>
                  </div>

                  {/* Autonomy Level */}
                  <div>
                    <label className="block text-sm font-medium text-charcoal mb-3">
                      Autonomy Level <span className="text-red-500">*</span>
                    </label>
                    <div className="space-y-2">
                      {autonomyLevels.map((level) => (
                        <label
                          key={level.value}
                          className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-all ${
                            agentForm.autonomy === level.value
                              ? 'border-teal bg-teal-tint ring-2 ring-teal/20'
                              : 'border-border-light hover:border-border'
                          }`}
                        >
                          <input
                            type="radio"
                            name="autonomy"
                            value={level.value}
                            checked={agentForm.autonomy === level.value}
                            onChange={(e) => setAgentForm({ ...agentForm, autonomy: e.target.value })}
                            className="sr-only"
                          />
                          <span className="text-lg">{level.icon}</span>
                          <div className="flex-1">
                            <div className="text-sm font-medium text-charcoal">{level.label}</div>
                            <div className="text-xs text-muted mt-0.5">{level.description}</div>
                          </div>
                          <span className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5 ${
                            agentForm.autonomy === level.value ? 'border-teal bg-teal' : 'border-border'
                          }`}>
                            {agentForm.autonomy === level.value && (
                              <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                              </svg>
                            )}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Objective & Instructions Card */}
              <div className="bg-white rounded-xl border border-border-light shadow-soft p-6">
                <h2 className="text-lg font-medium text-charcoal mb-4">Objective & Instructions</h2>
                <div className="space-y-6">
                  {/* Objective */}
                  <div>
                    <label htmlFor="agent-objective" className="block text-sm font-medium text-charcoal mb-2">
                      Objective
                    </label>
                    <textarea
                      id="agent-objective"
                      value={agentForm.objective}
                      onChange={(e) => setAgentForm({ ...agentForm, objective: e.target.value })}
                      placeholder="Describe what this agent should accomplish..."
                      rows={3}
                      className="w-full px-3 py-2 border border-border-light rounded-lg text-sm focus:outline-none focus:border-teal resize-none"
                    />
                  </div>

                  {/* Instructions */}
                  <div>
                    <label className="block text-sm font-medium text-charcoal mb-2">
                      Instructions <span className="text-red-500">*</span>
                    </label>
                    <p className="text-xs text-muted mb-3">Define the step-by-step procedure this agent should follow.</p>
                    <div className="space-y-2">
                      {agentForm.instructions.map((instruction, index) => (
                        <div key={index} className="flex items-start gap-2">
                          <span className="w-6 h-8 flex items-center justify-center text-xs text-muted font-medium">
                            {index + 1}.
                          </span>
                          <input
                            type="text"
                            value={instruction}
                            onChange={(e) => updateInstruction(index, e.target.value)}
                            placeholder={`Step ${index + 1}...`}
                            className="flex-1 h-8 px-3 border border-border-light rounded-lg text-sm focus:outline-none focus:border-teal"
                          />
                          {agentForm.instructions.length > 1 && (
                            <button
                              onClick={() => removeInstruction(index)}
                              className="w-8 h-8 flex items-center justify-center text-muted hover:text-red-500 transition-colors"
                              title="Remove step"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                    <button
                      onClick={addInstruction}
                      className="mt-3 text-sm text-teal hover:text-teal-dark flex items-center gap-1"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                      Add Step
                    </button>
                  </div>
                </div>
              </div>

              {/* Edit Mode: Read-only Stats */}
              {isEditMode && editingAgent && (
                <div className="bg-white rounded-xl border border-border-light shadow-soft p-6">
                  <h2 className="text-lg font-medium text-charcoal mb-4">Performance Stats</h2>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="p-4 bg-cream rounded-lg">
                      <div className="text-2xl font-semibold text-charcoal">{editingAgent.tasksCompleted}</div>
                      <div className="text-xs text-muted mt-1">Tasks Completed</div>
                    </div>
                    <div className="p-4 bg-cream rounded-lg">
                      <div className="text-2xl font-semibold text-charcoal">{editingAgent.approvalRate}%</div>
                      <div className="text-xs text-muted mt-1">Approval Rate</div>
                    </div>
                    <div className="p-4 bg-cream rounded-lg">
                      <div className="flex items-center gap-2">
                        <StatusBadge status={editingAgent.status} />
                        <span className="text-sm font-medium text-charcoal capitalize">{editingAgent.status}</span>
                      </div>
                      <div className="text-xs text-muted mt-1">Current Status</div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Right Column - Configuration (1/3 width) */}
            <div className="space-y-6">
              {/* Triggers Card */}
              <div className="bg-white rounded-xl border border-border-light shadow-soft p-6">
                <h2 className="text-sm font-medium text-charcoal mb-3">Triggers</h2>
                <p className="text-xs text-muted mb-4">When should this agent run?</p>
                <div className="space-y-2">
                  {triggerOptions.map((trigger) => {
                    const isSelected = agentForm.triggers.includes(trigger.id);
                    return (
                      <label
                        key={trigger.id}
                        className={`flex items-center gap-3 p-2.5 rounded-lg border cursor-pointer transition-all ${
                          isSelected
                            ? 'border-teal bg-teal-tint'
                            : 'border-border-light hover:border-border'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleTrigger(trigger.id)}
                          className="sr-only"
                        />
                        <span className="text-sm">{trigger.icon}</span>
                        <span className="text-sm text-charcoal flex-1">{trigger.label}</span>
                        <span className={`w-4 h-4 rounded border flex items-center justify-center ${
                          isSelected ? 'border-teal bg-teal' : 'border-border'
                        }`}>
                          {isSelected && (
                            <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                            </svg>
                          )}
                        </span>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Tools Card */}
              <div className="bg-white rounded-xl border border-border-light shadow-soft p-6">
                <h2 className="text-sm font-medium text-charcoal mb-3">Tools</h2>
                <p className="text-xs text-muted mb-4">Which tools can this agent use?</p>
                <div className="space-y-2">
                  {tools.filter(t => t.status === 'connected').map((tool) => {
                    const isSelected = agentForm.tools.includes(tool.id);
                    return (
                      <label
                        key={tool.id}
                        className={`flex items-center gap-3 p-2.5 rounded-lg border cursor-pointer transition-all ${
                          isSelected
                            ? 'border-teal bg-teal-tint'
                            : 'border-border-light hover:border-border'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleTool(tool.id)}
                          className="sr-only"
                        />
                        <span className="text-sm">{tool.icon}</span>
                        <span className="text-sm text-charcoal flex-1">{tool.name}</span>
                        <span className={`w-4 h-4 rounded border flex items-center justify-center ${
                          isSelected ? 'border-teal bg-teal' : 'border-border'
                        }`}>
                          {isSelected && (
                            <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                            </svg>
                          )}
                        </span>
                      </label>
                    );
                  })}
                  {tools.filter(t => t.status === 'connected').length === 0 && (
                    <p className="text-xs text-muted italic">No tools connected. Connect tools in Settings.</p>
                  )}
                </div>
              </div>

              {/* SOPs Card */}
              <div className="bg-white rounded-xl border border-border-light shadow-soft p-6">
                <h2 className="text-sm font-medium text-charcoal mb-3">SOPs</h2>
                <p className="text-xs text-muted mb-4">Which procedures should this agent follow?</p>
                <div className="space-y-2">
                  {sopLibrary.map((sop) => {
                    const isSelected = agentForm.sops.includes(sop.id);
                    return (
                      <label
                        key={sop.id}
                        className={`flex items-center gap-3 p-2.5 rounded-lg border cursor-pointer transition-all ${
                          isSelected
                            ? 'border-teal bg-teal-tint'
                            : 'border-border-light hover:border-border'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleSOP(sop.id)}
                          className="sr-only"
                        />
                        <span className="text-sm">📋</span>
                        <div className="flex-1 min-w-0">
                          <span className="text-sm text-charcoal block truncate">{sop.name}</span>
                          <span className="text-xs text-muted">{sop.steps} steps</span>
                        </div>
                        <span className={`w-4 h-4 rounded border flex items-center justify-center flex-shrink-0 ${
                          isSelected ? 'border-teal bg-teal' : 'border-border'
                        }`}>
                          {isSelected && (
                            <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                            </svg>
                          )}
                        </span>
                      </label>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

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

  // ============================================
  // AI PROJECT CREATOR VIEW
  // ============================================

  const AIProjectCreatorView = () => {
    const [messages, setMessages] = useState([
      {
        role: 'assistant',
        content: "Hi! I'm here to help you create a new project. Tell me about what you're trying to accomplish — what's the main goal or problem you want to solve?",
        type: 'greeting'
      }
    ]);
    const [inputValue, setInputValue] = useState('');
    const [phase, setPhase] = useState(CONVERSATION_PHASES.GREETING);
    const [isProcessing, setIsProcessing] = useState(false);
    const [responses, setResponses] = useState({});
    const [generatedBlocks, setGeneratedBlocks] = useState({ agents: [], sops: [] });
    const [project, setProject] = useState({
      name: '',
      goal: '',
      agents: [],
      sops: [],
      tools: [],
      people: [],
      workflow: { nodes: [], connections: [], triggers: [] }
    });
    const [editingBlock, setEditingBlock] = useState(null);
    const [selectedOptions, setSelectedOptions] = useState([]);
    const messagesEndRef = useRef(null);

    // Auto-scroll to bottom when new messages arrive
    useEffect(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    // Process user input based on current phase
    const handleSendMessage = async (text) => {
      if (!text.trim() || isProcessing) return;

      // Add user message
      setMessages(prev => [...prev, { role: 'user', content: text }]);
      setInputValue('');
      setIsProcessing(true);

      // Simulate AI processing delay
      await new Promise(r => setTimeout(r, 800));

      // Handle based on phase
      if (phase === CONVERSATION_PHASES.GREETING || phase === CONVERSATION_PHASES.GOAL_DISCOVERY) {
        // Parse goal and move to scope clarification
        const matchedPattern = matchGoalPattern(text);
        setResponses(prev => ({ ...prev, projectGoal: text, matchedPattern }));
        setProject(prev => ({
          ...prev,
          name: matchedPattern.suggestedName,
          goal: text
        }));

        // Generate building blocks based on pattern
        const newAgents = matchedPattern.suggestedAgents.map((a, i) => ({
          id: generateId(),
          ...a,
          status: 'idle',
          approvalRate: 0,
          tasksCompleted: 0,
          tools: matchedPattern.suggestedTools,
          sops: [],
          instructions: [`Primary objective: ${a.objective}`],
          triggers: []
        }));

        const newSOPs = matchedPattern.suggestedSOPs.map((s, i) => ({
          id: generateId(),
          ...s,
          inputs: [{ name: 'Primary input', type: 'data', required: true }],
          outputs: [{ name: 'Processed result', type: 'data' }],
          tools: matchedPattern.suggestedTools,
          usedBy: 0,
          sourceFiles: []
        }));

        setGeneratedBlocks({ agents: newAgents, sops: newSOPs });

        // Add AI response
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: `Great! Based on your goal, I've drafted a **${matchedPattern.suggestedName}** project. I've suggested ${newAgents.length} agents and ${newSOPs.length} SOPs to get you started.\n\nTake a look at the preview on the right — you can click any item to edit it. When you're ready, let's choose which tools your agents should use.`,
          type: 'scope_response'
        }]);

        setPhase(CONVERSATION_PHASES.TOOL_SELECTION);
        setSelectedOptions(matchedPattern.suggestedTools);

        // Add tool selection question
        setTimeout(() => {
          setMessages(prev => [...prev, {
            role: 'assistant',
            content: 'Which tools should your agents have access to?',
            type: 'question',
            questionType: 'multi-select',
            options: availableTools.map(t => ({
              id: t.id,
              label: t.name,
              icon: t.icon,
              description: t.category,
              recommended: matchedPattern.suggestedTools.includes(t.id)
            }))
          }]);
        }, 500);
      }

      setIsProcessing(false);
    };

    // Handle option selection for questions
    const handleOptionSelect = async (optionId) => {
      if (phase === CONVERSATION_PHASES.TOOL_SELECTION) {
        setSelectedOptions(prev =>
          prev.includes(optionId)
            ? prev.filter(id => id !== optionId)
            : [...prev, optionId]
        );
      } else if (phase === CONVERSATION_PHASES.AUTONOMY_LEVEL) {
        // Single select - immediately proceed
        setResponses(prev => ({ ...prev, autonomyLevel: optionId }));

        // Update all agents with selected autonomy
        setGeneratedBlocks(prev => ({
          ...prev,
          agents: prev.agents.map(a => ({ ...a, autonomy: optionId }))
        }));

        setMessages(prev => [...prev,
          { role: 'user', content: optionId === 'supervised' ? 'Supervised - approve all actions' : optionId === 'assisted' ? 'Assisted - escalate complex decisions' : 'Autonomous - work independently' }
        ]);

        setIsProcessing(true);
        await new Promise(r => setTimeout(r, 600));

        // Move to human touchpoints
        setPhase(CONVERSATION_PHASES.HUMAN_TOUCHPOINTS);
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: 'When should a human get involved? Select the checkpoints that make sense for your workflow:',
          type: 'question',
          questionType: 'multi-select',
          options: [
            { id: 'external-comms', label: 'Before external communications', icon: '📧', description: 'Review emails before sending' },
            { id: 'errors', label: 'When errors occur', icon: '⚠️', description: 'Escalate issues for resolution' },
            { id: 'low-confidence', label: 'Low confidence decisions', icon: '🤔', description: 'When agent is uncertain' },
            { id: 'final-approval', label: 'Final approval', icon: '✅', description: 'Review before completing tasks' }
          ]
        }]);
        setSelectedOptions(['external-comms', 'errors']);
        setIsProcessing(false);
      }
    };

    // Handle multi-select confirmation
    const handleConfirmSelection = async () => {
      if (phase === CONVERSATION_PHASES.TOOL_SELECTION) {
        setResponses(prev => ({ ...prev, selectedTools: selectedOptions }));
        setProject(prev => ({ ...prev, tools: selectedOptions }));

        // Update agents with selected tools
        setGeneratedBlocks(prev => ({
          ...prev,
          agents: prev.agents.map(a => ({ ...a, tools: selectedOptions }))
        }));

        const selectedToolNames = availableTools
          .filter(t => selectedOptions.includes(t.id))
          .map(t => t.name)
          .join(', ');

        setMessages(prev => [...prev,
          { role: 'user', content: `Selected: ${selectedToolNames}` }
        ]);

        setIsProcessing(true);
        await new Promise(r => setTimeout(r, 600));

        // Move to autonomy level
        setPhase(CONVERSATION_PHASES.AUTONOMY_LEVEL);
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: 'How much independence should your AI agents have?',
          type: 'question',
          questionType: 'single-select',
          options: [
            { id: 'supervised', label: 'Supervised', icon: '👀', description: 'Human approves all agent actions' },
            { id: 'assisted', label: 'Assisted', icon: '🤝', description: 'Agents escalate complex decisions' },
            { id: 'autonomous', label: 'Autonomous', icon: '🚀', description: 'Agents work independently within bounds' }
          ]
        }]);
        setSelectedOptions([]);
        setIsProcessing(false);

      } else if (phase === CONVERSATION_PHASES.HUMAN_TOUCHPOINTS) {
        setResponses(prev => ({ ...prev, humanTouchpoints: selectedOptions }));

        setMessages(prev => [...prev,
          { role: 'user', content: `Selected: ${selectedOptions.map(o => o === 'external-comms' ? 'Before external comms' : o === 'errors' ? 'On errors' : o === 'low-confidence' ? 'Low confidence' : 'Final approval').join(', ')}` }
        ]);

        setIsProcessing(true);
        await new Promise(r => setTimeout(r, 800));

        // Build workflow
        const workflow = buildWorkflow(generatedBlocks.agents, selectedOptions);
        setProject(prev => ({
          ...prev,
          workflow,
          agents: generatedBlocks.agents.map(a => a.id),
          sops: generatedBlocks.sops.map(s => s.id)
        }));

        // Move to review
        setPhase(CONVERSATION_PHASES.REVIEW);
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: `Your project is ready! I've created **${project.name || 'your project'}** with ${generatedBlocks.agents.length} agents and ${generatedBlocks.sops.length} SOPs.\n\nReview everything in the preview panel. You can click any item to make changes. When you're satisfied, hit **Create Project** to launch!`,
          type: 'review'
        }]);
        setIsProcessing(false);
      }
    };

    // Build workflow from agents and touchpoints
    const buildWorkflow = (agents, touchpoints) => {
      const nodes = [
        { id: 'start', type: 'start', name: 'Start', position: { x: 50, y: 150 } }
      ];
      const connections = [];
      let xOffset = 200;
      let lastNodeId = 'start';

      agents.forEach((agent, i) => {
        const nodeId = `agent-${agent.id}`;
        nodes.push({
          id: nodeId,
          type: 'agent',
          entityId: agent.id,
          name: agent.name,
          position: { x: xOffset, y: 100 + (i % 2) * 100 }
        });
        connections.push({ from: lastNodeId, to: nodeId });
        lastNodeId = nodeId;
        xOffset += 180;
      });

      // Add human node if touchpoints selected
      if (touchpoints.length > 0) {
        const humanNode = {
          id: 'human-review',
          type: 'person',
          name: 'Human Review',
          position: { x: xOffset, y: 150 }
        };
        nodes.push(humanNode);
        connections.push({ from: lastNodeId, to: 'human-review' });
        lastNodeId = 'human-review';
        xOffset += 180;
      }

      nodes.push({
        id: 'end',
        type: 'end',
        name: 'Complete',
        position: { x: xOffset, y: 150 }
      });
      connections.push({ from: lastNodeId, to: 'end' });

      return { nodes, connections, triggers: [] };
    };

    // Handle project creation
    const handleCreateProject = () => {
      showToast(`Project "${project.name}" created successfully!`, 'success');
      // Reset state and navigate
      setCurrentView('command-center');
    };

    // Handle inline editing
    const handleEditBlock = (type, index) => {
      setEditingBlock({ type, index });
    };

    const handleSaveBlockEdit = (type, index, updatedBlock) => {
      if (type === 'agent') {
        setGeneratedBlocks(prev => ({
          ...prev,
          agents: prev.agents.map((a, i) => i === index ? { ...a, ...updatedBlock } : a)
        }));
      } else if (type === 'sop') {
        setGeneratedBlocks(prev => ({
          ...prev,
          sops: prev.sops.map((s, i) => i === index ? { ...s, ...updatedBlock } : s)
        }));
      }
      setEditingBlock(null);
    };

    const handleDeleteBlock = (type, index) => {
      if (type === 'agent') {
        setGeneratedBlocks(prev => ({
          ...prev,
          agents: prev.agents.filter((_, i) => i !== index)
        }));
      } else if (type === 'sop') {
        setGeneratedBlocks(prev => ({
          ...prev,
          sops: prev.sops.filter((_, i) => i !== index)
        }));
      }
      setEditingBlock(null);
    };

    // Quick suggestions for initial prompt
    const quickSuggestions = [
      'Automate sales lead qualification',
      'Process invoices automatically',
      'Handle customer support tickets',
      'Streamline HR onboarding'
    ];

    return (
      <div className="flex-1 flex bg-cream-light overflow-hidden">
        {/* Left Panel - Conversation */}
        <div className="w-2/5 flex flex-col border-r border-border-light bg-white">
          {/* Header */}
          <div className="px-6 py-4 border-b border-border-light">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setCurrentView('command-center')}
                className="p-1.5 text-muted hover:text-charcoal rounded-lg hover:bg-cream transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <div>
                <h1 className="text-lg font-semibold text-charcoal">Create Project</h1>
                <p className="text-xs text-muted">AI-assisted setup</p>
              </div>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                {msg.role === 'assistant' ? (
                  <div className="max-w-[90%] space-y-3">
                    <div className="flex items-start gap-2">
                      <div className="w-7 h-7 rounded-full bg-gradient-to-br from-teal to-sage flex items-center justify-center flex-shrink-0">
                        <span className="text-white text-xs">✨</span>
                      </div>
                      <div className="bg-cream rounded-2xl rounded-tl-sm px-4 py-2.5">
                        <p className="text-sm text-charcoal whitespace-pre-wrap">
                          {msg.content.split('**').map((part, j) =>
                            j % 2 === 1 ? <strong key={j}>{part}</strong> : part
                          )}
                        </p>
                      </div>
                    </div>

                    {/* Question options */}
                    {msg.type === 'question' && msg.questionType === 'multi-select' && (
                      <div className="ml-9 space-y-2">
                        {msg.options.map((opt) => (
                          <button
                            key={opt.id}
                            onClick={() => handleOptionSelect(opt.id)}
                            className={`w-full p-3 rounded-xl border text-left transition-all ${
                              selectedOptions.includes(opt.id)
                                ? 'border-teal bg-teal-tint'
                                : 'border-border-light hover:border-border bg-white'
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <span className="text-lg">{opt.icon}</span>
                                <div>
                                  <div className="text-sm font-medium text-charcoal">
                                    {opt.label}
                                    {opt.recommended && (
                                      <span className="ml-2 px-1.5 py-0.5 bg-sage-tint text-sage text-xs rounded">
                                        Recommended
                                      </span>
                                    )}
                                  </div>
                                  <div className="text-xs text-muted">{opt.description}</div>
                                </div>
                              </div>
                              <span className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                                selectedOptions.includes(opt.id) ? 'border-teal bg-teal' : 'border-border'
                              }`}>
                                {selectedOptions.includes(opt.id) && (
                                  <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                  </svg>
                                )}
                              </span>
                            </div>
                          </button>
                        ))}
                        <button
                          onClick={handleConfirmSelection}
                          disabled={selectedOptions.length === 0}
                          className="w-full mt-2 px-4 py-2 text-sm font-medium text-white bg-teal rounded-lg hover:bg-teal-dark disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                          Continue with {selectedOptions.length} selected
                        </button>
                      </div>
                    )}

                    {msg.type === 'question' && msg.questionType === 'single-select' && (
                      <div className="ml-9 space-y-2">
                        {msg.options.map((opt) => (
                          <button
                            key={opt.id}
                            onClick={() => handleOptionSelect(opt.id)}
                            className="w-full p-3 rounded-xl border border-border-light hover:border-teal hover:bg-teal-tint/30 text-left transition-all bg-white"
                          >
                            <div className="flex items-center gap-3">
                              <span className="text-lg">{opt.icon}</span>
                              <div>
                                <div className="text-sm font-medium text-charcoal">{opt.label}</div>
                                <div className="text-xs text-muted">{opt.description}</div>
                              </div>
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="max-w-[80%] bg-charcoal text-white rounded-2xl rounded-br-sm px-4 py-2.5">
                    <p className="text-sm">{msg.content}</p>
                  </div>
                )}
              </div>
            ))}

            {/* Processing indicator */}
            {isProcessing && (
              <div className="flex items-center gap-2 p-3">
                <div className="flex gap-1">
                  <span className="w-2 h-2 bg-teal rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-2 h-2 bg-teal rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-2 h-2 bg-teal rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
                <span className="text-sm text-muted">Thinking...</span>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="p-4 border-t border-border-light">
            {/* Quick suggestions - only show at start */}
            {phase === CONVERSATION_PHASES.GREETING && messages.length === 1 && (
              <div className="flex flex-wrap gap-2 mb-3">
                {quickSuggestions.map((suggestion, i) => (
                  <button
                    key={i}
                    onClick={() => setInputValue(suggestion)}
                    className="px-3 py-1.5 text-xs bg-cream-dark rounded-full hover:bg-cream text-charcoal-light transition-colors"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            )}

            {phase !== CONVERSATION_PHASES.REVIEW ? (
              <div className="flex gap-2">
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSendMessage(inputValue)}
                  placeholder="Type your response..."
                  className="flex-1 px-4 py-2.5 text-sm border border-border-light rounded-xl focus:outline-none focus:border-teal focus:ring-1 focus:ring-teal/30"
                  disabled={isProcessing || (phase !== CONVERSATION_PHASES.GREETING && phase !== CONVERSATION_PHASES.GOAL_DISCOVERY)}
                />
                <button
                  onClick={() => handleSendMessage(inputValue)}
                  disabled={!inputValue.trim() || isProcessing}
                  className="px-4 py-2.5 bg-teal text-white rounded-xl hover:bg-teal-dark disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                </button>
              </div>
            ) : (
              <button
                onClick={handleCreateProject}
                className="w-full px-4 py-3 text-sm font-medium text-white bg-sage rounded-xl hover:bg-sage-dark transition-colors flex items-center justify-center gap-2"
              >
                <span>🚀</span> Create Project
              </button>
            )}
          </div>
        </div>

        {/* Right Panel - Preview */}
        <div className="flex-1 p-6 overflow-y-auto">
          <div className="max-w-2xl mx-auto space-y-6">
            {/* Project Header */}
            {project.name && (
              <div className="bg-white rounded-xl border border-border-light shadow-soft p-5 animate-fadeIn">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-sage-tint rounded-xl flex items-center justify-center">
                    <span className="text-2xl">📁</span>
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-charcoal">{project.name}</h2>
                    <p className="text-sm text-muted mt-0.5">{project.goal}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Building Blocks */}
            {(generatedBlocks.agents.length > 0 || generatedBlocks.sops.length > 0) && (
              <div className="grid grid-cols-2 gap-4">
                {/* Agents */}
                <div className="bg-white rounded-xl border border-border-light shadow-soft p-4">
                  <h3 className="text-sm font-semibold text-charcoal mb-3 flex items-center gap-2">
                    <span>🤖</span> Agents ({generatedBlocks.agents.length})
                  </h3>
                  <div className="space-y-2">
                    {generatedBlocks.agents.map((agent, i) => (
                      <button
                        key={agent.id}
                        onClick={() => handleEditBlock('agent', i)}
                        className="w-full p-3 rounded-lg border border-border-light hover:border-teal hover:bg-teal-tint/20 text-left transition-all group"
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="text-sm font-medium text-charcoal">{agent.name}</div>
                            <div className="text-xs text-muted capitalize">{agent.autonomy}</div>
                          </div>
                          <svg className="w-4 h-4 text-muted opacity-0 group-hover:opacity-100 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                          </svg>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* SOPs */}
                <div className="bg-white rounded-xl border border-border-light shadow-soft p-4">
                  <h3 className="text-sm font-semibold text-charcoal mb-3 flex items-center gap-2">
                    <span>📋</span> SOPs ({generatedBlocks.sops.length})
                  </h3>
                  <div className="space-y-2">
                    {generatedBlocks.sops.map((sop, i) => (
                      <button
                        key={sop.id}
                        onClick={() => handleEditBlock('sop', i)}
                        className="w-full p-3 rounded-lg border border-border-light hover:border-teal hover:bg-teal-tint/20 text-left transition-all group"
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="text-sm font-medium text-charcoal">{sop.name}</div>
                            <div className="text-xs text-muted">{sop.steps?.length || 0} steps</div>
                          </div>
                          <svg className="w-4 h-4 text-muted opacity-0 group-hover:opacity-100 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                          </svg>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Tools */}
            {project.tools.length > 0 && (
              <div className="bg-white rounded-xl border border-border-light shadow-soft p-4">
                <h3 className="text-sm font-semibold text-charcoal mb-3 flex items-center gap-2">
                  <span>🔌</span> Connected Tools ({project.tools.length})
                </h3>
                <div className="flex flex-wrap gap-2">
                  {project.tools.map(toolId => {
                    const tool = availableTools.find(t => t.id === toolId);
                    return tool ? (
                      <span key={toolId} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-cream rounded-lg text-sm">
                        <span>{tool.icon}</span>
                        <span className="text-charcoal">{tool.name}</span>
                      </span>
                    ) : null;
                  })}
                </div>
              </div>
            )}

            {/* Mini Workflow Preview */}
            {project.workflow.nodes.length > 0 && (
              <div className="bg-white rounded-xl border border-border-light shadow-soft p-4">
                <h3 className="text-sm font-semibold text-charcoal mb-3 flex items-center gap-2">
                  <span>⚡</span> Workflow
                </h3>
                <div className="flex items-center gap-2 overflow-x-auto py-2">
                  {project.workflow.nodes.map((node, i) => (
                    <React.Fragment key={node.id}>
                      <div className={`flex-shrink-0 px-3 py-2 rounded-lg text-sm ${
                        node.type === 'start' ? 'bg-cream-dark text-charcoal' :
                        node.type === 'end' ? 'bg-cream-dark text-charcoal' :
                        node.type === 'agent' ? 'bg-teal-tint text-teal-dark' :
                        'bg-purple-tint text-purple-dark'
                      }`}>
                        <span className="mr-1">
                          {node.type === 'start' ? '○' : node.type === 'end' ? '●' : node.type === 'agent' ? '🤖' : '👤'}
                        </span>
                        {node.name}
                      </div>
                      {i < project.workflow.nodes.length - 1 && (
                        <svg className="w-4 h-4 text-muted flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      )}
                    </React.Fragment>
                  ))}
                </div>
              </div>
            )}

            {/* Empty state */}
            {!project.name && generatedBlocks.agents.length === 0 && (
              <div className="flex flex-col items-center justify-center h-64 text-center">
                <div className="w-16 h-16 bg-cream rounded-2xl flex items-center justify-center mb-4">
                  <span className="text-3xl opacity-50">✨</span>
                </div>
                <h3 className="text-lg font-medium text-charcoal mb-2">Your project will appear here</h3>
                <p className="text-sm text-muted max-w-sm">
                  Start by telling the AI assistant what you want to accomplish, and watch your project take shape.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Inline Edit Modal */}
        {editingBlock && (
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="absolute inset-0 bg-black/50" onClick={() => setEditingBlock(null)} />
            <div className="relative bg-white rounded-xl shadow-xl w-full max-w-md p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-charcoal">
                  Edit {editingBlock.type === 'agent' ? 'Agent' : 'SOP'}
                </h3>
                <button
                  onClick={() => setEditingBlock(null)}
                  className="p-1 text-muted hover:text-charcoal rounded transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {editingBlock.type === 'agent' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-charcoal mb-1">Name</label>
                    <input
                      type="text"
                      defaultValue={generatedBlocks.agents[editingBlock.index]?.name}
                      onChange={(e) => {
                        const updated = { ...generatedBlocks.agents[editingBlock.index], name: e.target.value };
                        handleSaveBlockEdit('agent', editingBlock.index, updated);
                      }}
                      className="w-full px-3 py-2 text-sm border border-border-light rounded-lg focus:outline-none focus:border-teal"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-charcoal mb-1">Objective</label>
                    <textarea
                      defaultValue={generatedBlocks.agents[editingBlock.index]?.objective}
                      onChange={(e) => {
                        const updated = { ...generatedBlocks.agents[editingBlock.index], objective: e.target.value };
                        handleSaveBlockEdit('agent', editingBlock.index, updated);
                      }}
                      rows={3}
                      className="w-full px-3 py-2 text-sm border border-border-light rounded-lg focus:outline-none focus:border-teal resize-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-charcoal mb-1">Autonomy Level</label>
                    <select
                      defaultValue={generatedBlocks.agents[editingBlock.index]?.autonomy}
                      onChange={(e) => {
                        const updated = { ...generatedBlocks.agents[editingBlock.index], autonomy: e.target.value };
                        handleSaveBlockEdit('agent', editingBlock.index, updated);
                      }}
                      className="w-full px-3 py-2 text-sm border border-border-light rounded-lg focus:outline-none focus:border-teal bg-white"
                    >
                      <option value="supervised">Supervised</option>
                      <option value="assisted">Assisted</option>
                      <option value="autonomous">Autonomous</option>
                    </select>
                  </div>
                </div>
              )}

              {editingBlock.type === 'sop' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-charcoal mb-1">Name</label>
                    <input
                      type="text"
                      defaultValue={generatedBlocks.sops[editingBlock.index]?.name}
                      onChange={(e) => {
                        const updated = { ...generatedBlocks.sops[editingBlock.index], name: e.target.value };
                        handleSaveBlockEdit('sop', editingBlock.index, updated);
                      }}
                      className="w-full px-3 py-2 text-sm border border-border-light rounded-lg focus:outline-none focus:border-teal"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-charcoal mb-1">Description</label>
                    <textarea
                      defaultValue={generatedBlocks.sops[editingBlock.index]?.description}
                      onChange={(e) => {
                        const updated = { ...generatedBlocks.sops[editingBlock.index], description: e.target.value };
                        handleSaveBlockEdit('sop', editingBlock.index, updated);
                      }}
                      rows={3}
                      className="w-full px-3 py-2 text-sm border border-border-light rounded-lg focus:outline-none focus:border-teal resize-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-charcoal mb-1">Category</label>
                    <select
                      defaultValue={generatedBlocks.sops[editingBlock.index]?.category}
                      onChange={(e) => {
                        const updated = { ...generatedBlocks.sops[editingBlock.index], category: e.target.value };
                        handleSaveBlockEdit('sop', editingBlock.index, updated);
                      }}
                      className="w-full px-3 py-2 text-sm border border-border-light rounded-lg focus:outline-none focus:border-teal bg-white"
                    >
                      <option value="Sales">Sales</option>
                      <option value="Finance">Finance</option>
                      <option value="HR">HR</option>
                      <option value="Support">Support</option>
                      <option value="Operations">Operations</option>
                    </select>
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between mt-6 pt-4 border-t border-border-light">
                <button
                  onClick={() => handleDeleteBlock(editingBlock.type, editingBlock.index)}
                  className="px-3 py-1.5 text-sm text-rust hover:text-rust-dark transition-colors"
                >
                  Delete
                </button>
                <button
                  onClick={() => setEditingBlock(null)}
                  className="px-4 py-2 text-sm font-medium text-white bg-teal rounded-lg hover:bg-teal-dark transition-colors"
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  // ============================================
  // AI AGENT CREATOR VIEW
  // ============================================

  const AIAgentCreatorView = () => {
    const isEditMode = editingAgent !== null;

    const triggerOptionsList = [
      { id: 'new-lead', label: 'New lead arrives in CRM', icon: '📥' },
      { id: 'schedule-daily', label: 'Scheduled (daily)', icon: '📅' },
      { id: 'schedule-weekly', label: 'Scheduled (weekly)', icon: '📆' },
      { id: 'manual', label: 'Manual trigger only', icon: '👆' },
      { id: 'form-submission', label: 'On form submission', icon: '📝' },
      { id: 'email-received', label: 'Email received', icon: '📧' }
    ];

    const [messages, setMessages] = useState(() => {
      if (isEditMode) {
        return [{
          role: 'assistant',
          content: `Here's your current configuration for **${editingAgent.name}**. Click any field in the preview to edit it, or tell me what you'd like to change.`,
          type: 'review'
        }];
      }
      return [{
        role: 'assistant',
        content: "Hi! I'm here to help you create a new AI agent. Describe what you want this agent to do — what task or process should it handle?",
        type: 'greeting'
      }];
    });

    const [inputValue, setInputValue] = useState('');
    const [phase, setPhase] = useState(isEditMode ? 'review' : 'greeting');
    const [isProcessing, setIsProcessing] = useState(false);
    const [selectedOptions, setSelectedOptions] = useState([]);
    const [toolsAndSopsSubPhase, setToolsAndSopsSubPhase] = useState('tools');
    const messagesEndRef = useRef(null);

    const [agent, setAgent] = useState(() => {
      if (isEditMode) {
        return {
          name: editingAgent.name || '',
          objective: editingAgent.objective || '',
          autonomy: editingAgent.autonomy || 'supervised',
          instructions: editingAgent.instructions || [''],
          triggers: editingAgent.triggers || [],
          tools: editingAgent.tools || [],
          sops: editingAgent.sops || []
        };
      }
      return {
        name: '',
        objective: '',
        autonomy: 'supervised',
        instructions: [],
        triggers: [],
        tools: [],
        sops: []
      };
    });

    const [editingField, setEditingField] = useState(null);
    const [completedPhases, setCompletedPhases] = useState(
      isEditMode ? new Set(['greeting', 'autonomy_level', 'triggers', 'tools', 'sops']) : new Set()
    );
    const [matchedPattern, setMatchedPattern] = useState(null);
    const [editingSection, setEditingSection] = useState(null); // 'triggers' | 'tools' | 'sops' | null
    const [pickerSelections, setPickerSelections] = useState([]);

    useEffect(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    // Handle free-text input (greeting/objective phase)
    const handleSendMessage = async (text) => {
      if (!text.trim() || isProcessing) return;

      setMessages(prev => [...prev, { role: 'user', content: text }]);
      setInputValue('');
      setIsProcessing(true);

      await new Promise(r => setTimeout(r, 800));

      if (phase === 'greeting') {
        const matched = matchAgentObjective(text);
        setMatchedPattern(matched);

        setAgent({
          name: matched.suggestedName,
          objective: text,
          autonomy: 'supervised',
          instructions: matched.suggestedInstructions,
          triggers: [],
          tools: [],
          sops: []
        });

        setCompletedPhases(prev => new Set([...prev, 'greeting']));

        setMessages(prev => [...prev, {
          role: 'assistant',
          content: `I've drafted a **${matched.suggestedName}** agent with ${matched.suggestedInstructions.length} instruction steps. You can see the preview on the right — click any field to edit it.\n\nHow much independence should this agent have?`,
          type: 'question',
          questionType: 'single-select',
          options: [
            { id: 'supervised', label: 'Supervised', icon: '👀', description: 'Human approves all agent actions' },
            { id: 'assisted', label: 'Assisted', icon: '🤝', description: 'Agent escalates complex decisions' },
            { id: 'autonomous', label: 'Autonomous', icon: '🚀', description: 'Agent works independently within bounds' }
          ]
        }]);

        setPhase('autonomy_level');
        setIsProcessing(false);
        return;
      }

      // In review/edit mode, handle natural language change requests
      if (phase === 'review') {
        const lower = text.toLowerCase();
        if (lower.includes('autonomy') || lower.includes('independence') || lower.includes('supervised') || lower.includes('assisted') || lower.includes('autonomous')) {
          setMessages(prev => [...prev, {
            role: 'assistant',
            content: 'Sure, pick the new autonomy level:',
            type: 'question',
            questionType: 'single-select',
            options: [
              { id: 'supervised', label: 'Supervised', icon: '👀', description: 'Human approves all agent actions' },
              { id: 'assisted', label: 'Assisted', icon: '🤝', description: 'Agent escalates complex decisions' },
              { id: 'autonomous', label: 'Autonomous', icon: '🚀', description: 'Agent works independently within bounds' }
            ]
          }]);
          setPhase('autonomy_level');
        } else if (lower.includes('trigger')) {
          setMessages(prev => [...prev, {
            role: 'assistant',
            content: 'Select the triggers for this agent:',
            type: 'question',
            questionType: 'multi-select',
            options: triggerOptionsList.map(t => ({ ...t, description: '' }))
          }]);
          setSelectedOptions([...agent.triggers]);
          setPhase('triggers');
        } else if (lower.includes('tool')) {
          setMessages(prev => [...prev, {
            role: 'assistant',
            content: 'Select the tools this agent should use:',
            type: 'question',
            questionType: 'multi-select',
            options: availableTools.map(t => ({ id: t.id, label: t.name, icon: t.icon, description: t.category }))
          }]);
          setSelectedOptions([...agent.tools]);
          setToolsAndSopsSubPhase('tools');
          setPhase('tools_and_sops');
        } else if (lower.includes('sop') || lower.includes('procedure')) {
          setMessages(prev => [...prev, {
            role: 'assistant',
            content: 'Select the SOPs this agent should follow:',
            type: 'question',
            questionType: 'multi-select-sops',
            options: sopLibrary.map(s => ({ id: s.id, label: s.name, icon: '📋', description: `${s.steps} steps · ${s.category}` }))
          }]);
          setSelectedOptions([...agent.sops]);
          setToolsAndSopsSubPhase('sops');
          setPhase('tools_and_sops');
        } else {
          setMessages(prev => [...prev, {
            role: 'assistant',
            content: "You can click any field in the preview to edit it directly. Or tell me specifically what you'd like to change — like \"change the autonomy level\" or \"update the triggers\".",
            type: 'info'
          }]);
        }
        setIsProcessing(false);
        return;
      }

      setIsProcessing(false);
    };

    // Handle single-select option click
    const handleOptionSelect = async (optionId) => {
      if (phase === 'autonomy_level') {
        const labels = { supervised: 'Supervised', assisted: 'Assisted', autonomous: 'Autonomous' };
        setAgent(prev => ({ ...prev, autonomy: optionId }));
        setCompletedPhases(prev => new Set([...prev, 'autonomy_level']));
        setMessages(prev => [...prev, { role: 'user', content: labels[optionId] }]);
        setIsProcessing(true);
        await new Promise(r => setTimeout(r, 600));

        // Move to triggers
        setPhase('triggers');
        setSelectedOptions(matchedPattern?.suggestedTriggers || []);
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: 'What should trigger this agent to run? Select all that apply:',
          type: 'question',
          questionType: 'multi-select',
          options: triggerOptionsList.map(t => ({
            ...t,
            description: '',
            recommended: (matchedPattern?.suggestedTriggers || []).includes(t.id)
          }))
        }]);
        setIsProcessing(false);

      } else if (phase === 'tools_and_sops' && toolsAndSopsSubPhase === 'tools') {
        setSelectedOptions(prev =>
          prev.includes(optionId) ? prev.filter(id => id !== optionId) : [...prev, optionId]
        );
      } else if (phase === 'tools_and_sops' && toolsAndSopsSubPhase === 'sops') {
        setSelectedOptions(prev =>
          prev.includes(optionId) ? prev.filter(id => id !== optionId) : [...prev, optionId]
        );
      } else if (phase === 'triggers') {
        setSelectedOptions(prev =>
          prev.includes(optionId) ? prev.filter(id => id !== optionId) : [...prev, optionId]
        );
      }
    };

    // Handle multi-select confirm
    const handleConfirmSelection = async () => {
      if (phase === 'triggers') {
        setAgent(prev => ({ ...prev, triggers: selectedOptions }));
        setCompletedPhases(prev => new Set([...prev, 'triggers']));
        const triggerNames = selectedOptions.map(id => triggerOptionsList.find(t => t.id === id)?.label || id).join(', ');
        setMessages(prev => [...prev, { role: 'user', content: triggerNames || 'No triggers selected' }]);
        setIsProcessing(true);
        await new Promise(r => setTimeout(r, 600));

        // Move to tools
        setPhase('tools_and_sops');
        setToolsAndSopsSubPhase('tools');
        setSelectedOptions(matchedPattern?.suggestedTools || []);
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: 'Which tools should this agent have access to?',
          type: 'question',
          questionType: 'multi-select',
          options: availableTools.map(t => ({
            id: t.id,
            label: t.name,
            icon: t.icon,
            description: t.category,
            recommended: (matchedPattern?.suggestedTools || []).includes(t.id)
          }))
        }]);
        setIsProcessing(false);

      } else if (phase === 'tools_and_sops' && toolsAndSopsSubPhase === 'tools') {
        setAgent(prev => ({ ...prev, tools: selectedOptions }));
        setCompletedPhases(prev => new Set([...prev, 'tools']));
        const toolNames = selectedOptions.map(id => availableTools.find(t => t.id === id)?.name || id).join(', ');
        setMessages(prev => [...prev, { role: 'user', content: toolNames || 'No tools selected' }]);
        setIsProcessing(true);
        await new Promise(r => setTimeout(r, 600));

        // Move to SOPs
        setToolsAndSopsSubPhase('sops');
        setSelectedOptions(matchedPattern?.suggestedSOPs || []);
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: 'Which SOPs should this agent follow?',
          type: 'question',
          questionType: 'multi-select-sops',
          options: sopLibrary.map(s => ({
            id: s.id,
            label: s.name,
            icon: '📋',
            description: `${s.steps} steps · ${s.category}`,
            recommended: (matchedPattern?.suggestedSOPs || []).includes(s.id)
          }))
        }]);
        setIsProcessing(false);

      } else if (phase === 'tools_and_sops' && toolsAndSopsSubPhase === 'sops') {
        setAgent(prev => ({ ...prev, sops: selectedOptions }));
        setCompletedPhases(prev => new Set([...prev, 'sops']));
        const sopNames = selectedOptions.map(id => sopLibrary.find(s => s.id === id)?.name || id).join(', ');
        setMessages(prev => [...prev, { role: 'user', content: sopNames || 'No SOPs selected' }]);
        setIsProcessing(true);
        await new Promise(r => setTimeout(r, 800));

        // Move to review
        setPhase('review');
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: `Your agent is ready! I've configured **${agent.name}** with ${agent.instructions.length} instructions.\n\nReview everything in the preview panel — click any field to edit it. When you're satisfied, hit **${isEditMode ? 'Save Changes' : 'Create Agent'}** below.`,
          type: 'review'
        }]);
        setIsProcessing(false);
      }
    };

    // Save agent
    const handleSaveAgent = () => {
      const agentData = {
        ...agent,
        id: isEditMode ? editingAgent.id : Date.now(),
        status: isEditMode ? editingAgent.status : 'idle',
        approvalRate: isEditMode ? editingAgent.approvalRate : 0,
        tasksCompleted: isEditMode ? editingAgent.tasksCompleted : 0,
        project: isEditMode ? editingAgent.project : '',
        instructions: agent.instructions.filter(i => i.trim())
      };

      if (isEditMode) {
        showToast(`Agent "${agentData.name}" updated successfully`, 'success');
        setSelectedAgent(agentData);
        setCurrentView('agent-detail');
      } else {
        showToast(`Agent "${agentData.name}" created successfully`, 'success');
        setCurrentView('building-blocks-agents');
      }
      setEditingAgent(null);
    };

    // Inline edit handlers for preview
    const handleInlineEdit = (field, value) => {
      setAgent(prev => ({ ...prev, [field]: value }));
    };

    const handleInstructionEdit = (index, value) => {
      setAgent(prev => {
        const newInstructions = [...prev.instructions];
        newInstructions[index] = value;
        return { ...prev, instructions: newInstructions };
      });
    };

    const handleAddInstruction = () => {
      setAgent(prev => ({ ...prev, instructions: [...prev.instructions, ''] }));
    };

    const handleRemoveInstruction = (index) => {
      if (agent.instructions.length > 1) {
        setAgent(prev => ({ ...prev, instructions: prev.instructions.filter((_, i) => i !== index) }));
      }
    };

    // Picker dialog handlers for editing Triggers/Tools/SOPs from preview
    const handlePickerToggle = (id) => {
      setPickerSelections(prev =>
        prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
      );
    };

    const handlePickerSave = () => {
      if (editingSection === 'triggers') {
        setAgent(prev => ({ ...prev, triggers: pickerSelections }));
      } else if (editingSection === 'tools') {
        setAgent(prev => ({ ...prev, tools: pickerSelections }));
      } else if (editingSection === 'sops') {
        setAgent(prev => ({ ...prev, sops: pickerSelections }));
      }
      setEditingSection(null);
      setPickerSelections([]);
    };

    const handlePickerClose = () => {
      setEditingSection(null);
      setPickerSelections([]);
    };

    const getPickerItems = () => {
      if (editingSection === 'triggers') {
        return triggerOptionsList.map(t => ({ id: t.id, label: t.label, icon: t.icon, description: '' }));
      } else if (editingSection === 'tools') {
        return availableTools.map(t => ({ id: t.id, label: t.name, icon: t.icon, description: t.category }));
      } else if (editingSection === 'sops') {
        return sopLibrary.map(s => ({ id: s.id, label: s.name, icon: '📋', description: `${s.steps} steps · ${s.category}` }));
      }
      return [];
    };

    const getPickerTitle = () => {
      if (editingSection === 'triggers') return 'Edit Triggers';
      if (editingSection === 'tools') return 'Edit Tools';
      if (editingSection === 'sops') return 'Edit SOPs';
      return '';
    };

    const quickSuggestions = [
      'Qualify incoming sales leads',
      'Process and validate invoices',
      'Triage customer support tickets',
      'Send personalized outreach emails',
      'Track and sync pipeline data',
      'Coordinate new hire onboarding'
    ];

    return (
      <div className="flex-1 flex bg-cream-light overflow-hidden">
        {/* Left Panel - Conversation */}
        <div className="w-2/5 flex flex-col border-r border-border-light bg-white">
          {/* Header */}
          <div className="px-6 py-4 border-b border-border-light">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => {
                    setEditingAgent(null);
                    setCurrentView('building-blocks-agents');
                  }}
                  className="p-1.5 text-muted hover:text-charcoal rounded-lg hover:bg-cream transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <div>
                  <h1 className="text-lg font-semibold text-charcoal">{isEditMode ? 'Edit Agent' : 'Create Agent'}</h1>
                  <p className="text-xs text-muted">AI-assisted setup</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setEditingAgent(null);
                  setCurrentView(isEditMode ? 'agent-edit' : 'agent-create');
                }}
                className="text-xs text-muted hover:text-charcoal transition-colors"
              >
                Switch to manual mode →
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                {msg.role === 'assistant' ? (
                  <div className="max-w-[90%] space-y-3">
                    <div className="flex items-start gap-2">
                      <div className="w-7 h-7 rounded-full bg-gradient-to-br from-teal to-sage flex items-center justify-center flex-shrink-0">
                        <span className="text-white text-xs">✨</span>
                      </div>
                      <div className="bg-cream rounded-2xl rounded-tl-sm px-4 py-2.5">
                        <p className="text-sm text-charcoal whitespace-pre-wrap">
                          {msg.content.split('**').map((part, j) =>
                            j % 2 === 1 ? <strong key={j}>{part}</strong> : part
                          )}
                        </p>
                      </div>
                    </div>

                    {/* Single-select question */}
                    {msg.type === 'question' && msg.questionType === 'single-select' && (
                      <div className="ml-9 space-y-2">
                        {msg.options.map((opt) => (
                          <button
                            key={opt.id}
                            onClick={() => handleOptionSelect(opt.id)}
                            className="w-full p-3 rounded-xl border border-border-light hover:border-teal hover:bg-teal-tint/30 text-left transition-all bg-white"
                          >
                            <div className="flex items-center gap-3">
                              <span className="text-lg">{opt.icon}</span>
                              <div>
                                <div className="text-sm font-medium text-charcoal">{opt.label}</div>
                                <div className="text-xs text-muted">{opt.description}</div>
                              </div>
                            </div>
                          </button>
                        ))}
                      </div>
                    )}

                    {/* Multi-select question */}
                    {msg.type === 'question' && (msg.questionType === 'multi-select' || msg.questionType === 'multi-select-sops') && (
                      <div className="ml-9 space-y-2">
                        {msg.options.map((opt) => (
                          <button
                            key={opt.id}
                            onClick={() => handleOptionSelect(opt.id)}
                            className={`w-full p-3 rounded-xl border text-left transition-all ${
                              selectedOptions.includes(opt.id)
                                ? 'border-teal bg-teal-tint'
                                : 'border-border-light hover:border-border bg-white'
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <span className="text-lg">{opt.icon}</span>
                                <div>
                                  <div className="text-sm font-medium text-charcoal">
                                    {opt.label}
                                    {opt.recommended && (
                                      <span className="ml-2 px-1.5 py-0.5 bg-sage-tint text-sage text-xs rounded">
                                        Recommended
                                      </span>
                                    )}
                                  </div>
                                  {opt.description && <div className="text-xs text-muted">{opt.description}</div>}
                                </div>
                              </div>
                              <span className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                                selectedOptions.includes(opt.id) ? 'border-teal bg-teal' : 'border-border'
                              }`}>
                                {selectedOptions.includes(opt.id) && (
                                  <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                  </svg>
                                )}
                              </span>
                            </div>
                          </button>
                        ))}
                        {/* SOP Marketplace button */}
                        {msg.questionType === 'multi-select-sops' && (
                          <button
                            className="w-full p-3 rounded-xl border border-dashed border-border text-left transition-all hover:border-sage hover:bg-sage-tint/20"
                          >
                            <div className="flex items-center gap-2">
                              <span className="text-lg">🏪</span>
                              <div>
                                <div className="text-sm font-medium text-charcoal">Browse SOP Marketplace</div>
                                <div className="text-xs text-muted">Discover pre-built SOPs from the community</div>
                              </div>
                            </div>
                          </button>
                        )}
                        <button
                          onClick={handleConfirmSelection}
                          className="w-full mt-2 px-4 py-2 text-sm font-medium text-white bg-teal rounded-lg hover:bg-teal-dark transition-colors"
                        >
                          Continue{selectedOptions.length > 0 ? ` with ${selectedOptions.length} selected` : ''}
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="max-w-[80%] bg-charcoal text-white rounded-2xl rounded-br-sm px-4 py-2.5">
                    <p className="text-sm">{msg.content}</p>
                  </div>
                )}
              </div>
            ))}

            {/* Processing indicator */}
            {isProcessing && (
              <div className="flex items-center gap-2 p-3">
                <div className="flex gap-1">
                  <span className="w-2 h-2 bg-teal rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-2 h-2 bg-teal rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-2 h-2 bg-teal rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
                <span className="text-sm text-muted">Thinking...</span>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="p-4 border-t border-border-light">
            {/* Quick suggestions at start */}
            {phase === 'greeting' && messages.length === 1 && (
              <div className="flex flex-wrap gap-2 mb-3">
                {quickSuggestions.map((suggestion, i) => (
                  <button
                    key={i}
                    onClick={() => setInputValue(suggestion)}
                    className="px-3 py-1.5 text-xs bg-cream-dark rounded-full hover:bg-cream text-charcoal-light transition-colors"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            )}

            {phase === 'review' ? (
              <div className="space-y-2">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSendMessage(inputValue)}
                    placeholder="Tell me what to change..."
                    className="flex-1 px-4 py-2.5 text-sm border border-border-light rounded-xl focus:outline-none focus:border-teal focus:ring-1 focus:ring-teal/30"
                  />
                  <button
                    onClick={() => handleSendMessage(inputValue)}
                    disabled={!inputValue.trim()}
                    className="px-4 py-2.5 bg-charcoal-light text-white rounded-xl hover:bg-charcoal disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                    </svg>
                  </button>
                </div>
                <button
                  onClick={handleSaveAgent}
                  className="w-full px-4 py-3 text-sm font-medium text-white bg-sage rounded-xl hover:bg-sage-dark transition-colors flex items-center justify-center gap-2"
                >
                  <span>🚀</span> {isEditMode ? 'Save Changes' : 'Create Agent'}
                </button>
              </div>
            ) : phase === 'greeting' ? (
              <div className="flex gap-2">
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSendMessage(inputValue)}
                  placeholder="Describe what this agent should do..."
                  className="flex-1 px-4 py-2.5 text-sm border border-border-light rounded-xl focus:outline-none focus:border-teal focus:ring-1 focus:ring-teal/30"
                />
                <button
                  onClick={() => handleSendMessage(inputValue)}
                  disabled={!inputValue.trim() || isProcessing}
                  className="px-4 py-2.5 bg-teal text-white rounded-xl hover:bg-teal-dark disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                </button>
              </div>
            ) : (
              <div className="text-center text-sm text-muted py-2">
                Select an option above to continue
              </div>
            )}
          </div>
        </div>

        {/* Right Panel - Agent Preview */}
        <div className="flex-1 p-6 overflow-y-auto relative">
          <div className="max-w-xl mx-auto">
            {agent.name ? (
              <div className="space-y-4">
                {/* Agent Header Card */}
                <div className="bg-white rounded-xl border border-border-light shadow-soft p-5">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-teal-tint rounded-xl flex items-center justify-center flex-shrink-0">
                      <span className="text-2xl">🤖</span>
                    </div>
                    <div className="flex-1">
                      {editingField === 'name' ? (
                        <input
                          type="text"
                          value={agent.name}
                          onChange={(e) => handleInlineEdit('name', e.target.value)}
                          onBlur={() => setEditingField(null)}
                          onKeyDown={(e) => e.key === 'Enter' && setEditingField(null)}
                          autoFocus
                          className="text-xl font-semibold text-charcoal w-full px-2 py-1 -ml-2 border border-teal rounded-lg focus:outline-none"
                        />
                      ) : (
                        <h2
                          onClick={() => setEditingField('name')}
                          className="text-xl font-semibold text-charcoal cursor-pointer hover:text-teal transition-colors"
                        >
                          {agent.name}
                        </h2>
                      )}

                      {editingField === 'objective' ? (
                        <textarea
                          value={agent.objective}
                          onChange={(e) => handleInlineEdit('objective', e.target.value)}
                          onBlur={() => setEditingField(null)}
                          autoFocus
                          rows={2}
                          className="text-sm text-muted mt-1 w-full px-2 py-1 -ml-2 border border-teal rounded-lg focus:outline-none resize-none"
                        />
                      ) : (
                        <p
                          onClick={() => setEditingField('objective')}
                          className="text-sm text-muted mt-1 cursor-pointer hover:text-charcoal transition-colors"
                        >
                          {agent.objective || 'Click to add objective...'}
                        </p>
                      )}

                      {/* Autonomy Badge */}
                      {completedPhases.has('autonomy_level') && (
                        <div className="mt-3">
                          <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${
                            agent.autonomy === 'autonomous' ? 'bg-sage-tint text-sage' :
                            agent.autonomy === 'assisted' ? 'bg-amber-light/20 text-amber' :
                            'bg-cream-dark text-charcoal-light'
                          }`}>
                            {agent.autonomy === 'autonomous' ? '🚀' : agent.autonomy === 'assisted' ? '🤝' : '👀'}
                            {agent.autonomy.charAt(0).toUpperCase() + agent.autonomy.slice(1)}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Instructions Card */}
                <div className="bg-white rounded-xl border border-border-light shadow-soft p-5">
                  <h3 className="text-sm font-semibold text-charcoal mb-3 flex items-center gap-2">
                    <span>📝</span> Instructions ({agent.instructions.length})
                  </h3>
                  <div className="space-y-2">
                    {agent.instructions.map((instruction, i) => (
                      <div key={i} className="flex items-start gap-2 group">
                        <span className="text-xs font-medium text-teal mt-2 w-5 text-right flex-shrink-0">{i + 1}.</span>
                        {editingField === `instruction-${i}` ? (
                          <input
                            type="text"
                            value={instruction}
                            onChange={(e) => handleInstructionEdit(i, e.target.value)}
                            onBlur={() => setEditingField(null)}
                            onKeyDown={(e) => e.key === 'Enter' && setEditingField(null)}
                            autoFocus
                            className="flex-1 text-sm px-2 py-1 border border-teal rounded-lg focus:outline-none"
                          />
                        ) : (
                          <div className="flex-1 flex items-center gap-1">
                            <span
                              onClick={() => setEditingField(`instruction-${i}`)}
                              className="flex-1 text-sm text-charcoal cursor-pointer hover:text-teal py-1 transition-colors"
                            >
                              {instruction || 'Click to edit...'}
                            </span>
                            {agent.instructions.length > 1 && (
                              <button
                                onClick={() => handleRemoveInstruction(i)}
                                className="opacity-0 group-hover:opacity-100 p-1 text-muted hover:text-rust transition-all"
                              >
                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                    <button
                      onClick={handleAddInstruction}
                      className="flex items-center gap-1 text-xs text-teal hover:text-teal-dark transition-colors mt-1 ml-7"
                    >
                      <span>+</span> Add step
                    </button>
                  </div>
                </div>

                {/* Triggers */}
                {completedPhases.has('triggers') && (
                  <div className="bg-white rounded-xl border border-border-light shadow-soft p-5">
                    <h3 className="text-sm font-semibold text-charcoal mb-3 flex items-center gap-2">
                      <span>⚡</span> Triggers
                      <button
                        onClick={() => { setEditingSection('triggers'); setPickerSelections([...agent.triggers]); }}
                        className="ml-auto p-1 text-muted hover:text-teal transition-colors"
                        aria-label="Edit triggers"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                        </svg>
                      </button>
                    </h3>
                    {agent.triggers.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {agent.triggers.map(triggerId => {
                          const trigger = triggerOptionsList.find(t => t.id === triggerId);
                          return trigger ? (
                            <span key={triggerId} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-cream rounded-lg text-sm">
                              <span>{trigger.icon}</span>
                              <span className="text-charcoal">{trigger.label}</span>
                            </span>
                          ) : null;
                        })}
                      </div>
                    ) : (
                      <p className="text-sm text-muted italic">No triggers selected</p>
                    )}
                  </div>
                )}

                {/* Tools */}
                {completedPhases.has('tools') && (
                  <div className="bg-white rounded-xl border border-border-light shadow-soft p-5">
                    <h3 className="text-sm font-semibold text-charcoal mb-3 flex items-center gap-2">
                      <span>🔌</span> Tools
                      <button
                        onClick={() => { setEditingSection('tools'); setPickerSelections([...agent.tools]); }}
                        className="ml-auto p-1 text-muted hover:text-teal transition-colors"
                        aria-label="Edit tools"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                        </svg>
                      </button>
                    </h3>
                    {agent.tools.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {agent.tools.map(toolId => {
                          const tool = availableTools.find(t => t.id === toolId);
                          return tool ? (
                            <span key={toolId} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-cream rounded-lg text-sm">
                              <span>{tool.icon}</span>
                              <span className="text-charcoal">{tool.name}</span>
                            </span>
                          ) : null;
                        })}
                      </div>
                    ) : (
                      <p className="text-sm text-muted italic">No tools selected</p>
                    )}
                  </div>
                )}

                {/* SOPs */}
                {completedPhases.has('sops') && (
                  <div className="bg-white rounded-xl border border-border-light shadow-soft p-5">
                    <h3 className="text-sm font-semibold text-charcoal mb-3 flex items-center gap-2">
                      <span>📋</span> SOPs
                      <button
                        onClick={() => { setEditingSection('sops'); setPickerSelections([...agent.sops]); }}
                        className="ml-auto p-1 text-muted hover:text-teal transition-colors"
                        aria-label="Edit SOPs"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                        </svg>
                      </button>
                    </h3>
                    {agent.sops.length > 0 ? (
                      <div className="space-y-2">
                        {agent.sops.map(sopId => {
                          const sop = sopLibrary.find(s => s.id === sopId);
                          return sop ? (
                            <div key={sopId} className="flex items-center gap-2 p-2 bg-cream rounded-lg">
                              <span>📋</span>
                              <div>
                                <div className="text-sm font-medium text-charcoal">{sop.name}</div>
                                <div className="text-xs text-muted">{sop.steps} steps · {sop.category}</div>
                              </div>
                            </div>
                          ) : null;
                        })}
                      </div>
                    ) : (
                      <p className="text-sm text-muted italic">No SOPs selected</p>
                    )}
                  </div>
                )}
              </div>
            ) : (
              /* Empty state */
              <div className="flex flex-col items-center justify-center h-64 text-center">
                <div className="w-16 h-16 bg-cream rounded-2xl flex items-center justify-center mb-4">
                  <span className="text-3xl opacity-50">🤖</span>
                </div>
                <h3 className="text-lg font-medium text-charcoal mb-2">Your agent will appear here</h3>
                <p className="text-sm text-muted max-w-sm">
                  Describe what you want this agent to do, and I'll help you configure it step by step.
                </p>
              </div>
            )}
          </div>

          {/* Picker Dialog Overlay */}
          {editingSection && (
            <div className="absolute inset-0 bg-charcoal/20 backdrop-blur-sm flex items-center justify-center p-6 z-10">
              <div className="bg-white rounded-xl border border-border-light shadow-soft-lg w-full max-w-md max-h-[80vh] flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between px-5 py-4 border-b border-border-light">
                  <h3 className="text-base font-semibold text-charcoal">{getPickerTitle()}</h3>
                  <button
                    onClick={handlePickerClose}
                    className="p-1 text-muted hover:text-charcoal transition-colors"
                    aria-label="Close picker"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                {/* Items */}
                <div className="flex-1 overflow-y-auto p-4 space-y-2">
                  {getPickerItems().map(item => (
                    <button
                      key={item.id}
                      onClick={() => handlePickerToggle(item.id)}
                      className={`w-full flex items-center gap-3 p-3 rounded-lg border transition-all text-left ${
                        pickerSelections.includes(item.id)
                          ? 'border-teal bg-teal-tint/50'
                          : 'border-border-light hover:border-teal/30 bg-white'
                      }`}
                    >
                      <div className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
                        pickerSelections.includes(item.id)
                          ? 'border-teal bg-teal'
                          : 'border-gray-300'
                      }`}>
                        {pickerSelections.includes(item.id) && (
                          <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={3}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </div>
                      <span className="text-lg flex-shrink-0">{item.icon}</span>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-charcoal">{item.label}</div>
                        {item.description && (
                          <div className="text-xs text-muted">{item.description}</div>
                        )}
                      </div>
                    </button>
                  ))}

                  {/* Browse SOP Marketplace button for SOPs picker */}
                  {editingSection === 'sops' && (
                    <button className="w-full flex items-center justify-center gap-2 p-3 rounded-lg border-2 border-dashed border-border-light hover:border-teal/30 text-muted hover:text-teal transition-all">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                      <span className="text-sm font-medium">Browse SOP Marketplace</span>
                    </button>
                  )}
                </div>

                {/* Footer */}
                <div className="px-5 py-4 border-t border-border-light flex items-center justify-between">
                  <span className="text-xs text-muted">{pickerSelections.length} selected</span>
                  <div className="flex gap-2">
                    <button
                      onClick={handlePickerClose}
                      className="px-4 py-2 text-sm font-medium text-charcoal hover:bg-cream rounded-lg transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handlePickerSave}
                      className="px-4 py-2 text-sm font-medium text-white bg-teal hover:bg-teal-dark rounded-lg transition-colors"
                    >
                      Save Changes
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

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
                <button
                  onClick={() => {
                    setEditingAgent(null);
                    setCurrentView('agent-create');
                  }}
                  className="text-sm text-teal hover:text-teal-dark"
                >
                  + Create New Agent
                </button>
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
            <button
              onClick={() => {
                setEditingAgent(null);
                setCurrentView('agent-create');
              }}
              className="text-sm text-teal hover:text-teal-dark"
            >
              + Create New Agent
            </button>
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
    if (!project) {
      return (
        <div className="flex-1 p-6 overflow-auto bg-cream-light">
          <div className="max-w-2xl mx-auto">
            <h1 ref={mainHeadingRef} tabIndex={-1} className="text-2xl font-semibold text-charcoal mb-6 outline-none">Project Dashboard</h1>
            <div className="bg-white rounded-xl border border-border-light shadow-soft">
              <EmptyState
                icon="📁"
                title="No project selected"
                description="Select a project from the sidebar or create a new one to view its dashboard."
                primaryAction={() => {
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
                primaryLabel="Create New Project"
                secondaryAction={() => setCurrentView('command-center')}
                secondaryLabel="Back to Command Center"
              />
            </div>
          </div>
        </div>
      );
    }

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
      case 'team-agents': return <TeamAgentsView />;
      case 'team-humans': return <TeamHumansView />;
      // Building Blocks Views
      case 'building-blocks-agents': return <BuildingBlocksAgentsView />;
      case 'building-blocks-humans': return <BuildingBlocksHumansView />;
      case 'building-blocks-sops': return <BuildingBlocksSOPsView />;
      case 'reports': return <ReportsView />;
      case 'activity': return <ActivityView />;
      case 'tools': return <ToolsView />;
      case 'tools-add': return <AddToolView />;
      case 'tool-setup': return <ToolSetupView />;
      case 'tool-settings': return <ToolSettingsView />;
      case 'project': return <ProjectView />;
      case 'agent-detail': return <AgentDetailView />;
      case 'agent-create': return <AgentFormView />;
      case 'agent-edit': return <AgentFormView />;
      case 'agent-creator-ai': return <AIAgentCreatorView />;
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
      // AI Project Creator View
      case 'project-creator-ai': return <AIProjectCreatorView />;
      // Project Management Views
      case 'projects-list': return <ProjectsListView />;
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

      {/* Create SOP Modal */}
      {sopModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/50"
            onClick={handleSopModalClose}
          />

          {/* Modal */}
          <div className="relative bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
            {/* Input Form State */}
            {sopModalState === 'input' && (
              <>
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-border-light">
                  <h2 className="text-lg font-semibold text-charcoal">Create SOP</h2>
                  <button
                    onClick={handleSopModalClose}
                    className="p-1 text-muted hover:text-charcoal rounded transition-colors"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                {/* Form Content */}
                <div className="p-6 space-y-5 overflow-y-auto max-h-[calc(90vh-140px)]">
                  {/* SOP Name */}
                  <div>
                    <label className="block text-sm font-medium text-charcoal mb-1.5">
                      SOP Name <span className="text-rust">*</span>
                    </label>
                    <input
                      type="text"
                      value={sopForm.name}
                      onChange={(e) => setSopForm(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="e.g., Invoice Processing"
                      className="w-full px-3 py-2 text-sm border border-border-light rounded-lg focus:outline-none focus:ring-2 focus:ring-sage/30 focus:border-sage"
                    />
                  </div>

                  {/* Description */}
                  <div>
                    <label className="block text-sm font-medium text-charcoal mb-1.5">
                      Description
                    </label>
                    <textarea
                      value={sopForm.description}
                      onChange={(e) => setSopForm(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="What does this SOP accomplish?"
                      rows={3}
                      className="w-full px-3 py-2 text-sm border border-border-light rounded-lg focus:outline-none focus:ring-2 focus:ring-sage/30 focus:border-sage resize-none"
                    />
                  </div>

                  {/* Category */}
                  <div>
                    <label className="block text-sm font-medium text-charcoal mb-1.5">
                      Category
                    </label>
                    <select
                      value={sopForm.category}
                      onChange={(e) => setSopForm(prev => ({ ...prev, category: e.target.value }))}
                      className="w-full px-3 py-2 text-sm border border-border-light rounded-lg focus:outline-none focus:ring-2 focus:ring-sage/30 focus:border-sage bg-white"
                    >
                      {sopCategories.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>

                  {/* File Upload */}
                  <div>
                    <label className="block text-sm font-medium text-charcoal mb-1.5">
                      Reference Documents <span className="text-muted font-normal">(optional)</span>
                    </label>

                    {/* Drop Zone */}
                    <div
                      onClick={() => sopFileInputRef.current?.click()}
                      className="border-2 border-dashed border-border-light rounded-lg p-6 text-center cursor-pointer hover:border-sage hover:bg-sage-tint/30 transition-colors"
                    >
                      <div className="text-2xl mb-2">📄</div>
                      <p className="text-sm text-charcoal">Drop files here or click to upload</p>
                      <p className="text-xs text-muted mt-1">PDF, DOCX, TXT up to 10MB</p>
                    </div>
                    <input
                      ref={sopFileInputRef}
                      type="file"
                      multiple
                      accept=".pdf,.docx,.doc,.txt"
                      onChange={handleSopFileUpload}
                      className="hidden"
                    />

                    {/* Uploaded Files List */}
                    {sopForm.files.length > 0 && (
                      <div className="mt-3 space-y-2">
                        {sopForm.files.map((file, index) => (
                          <div key={index} className="flex items-center justify-between bg-cream rounded-lg px-3 py-2">
                            <div className="flex items-center gap-2">
                              <span className="text-lg">📄</span>
                              <span className="text-sm text-charcoal truncate max-w-[300px]">{file.name}</span>
                            </div>
                            <button
                              onClick={() => removeSopFile(index)}
                              className="p-1 text-muted hover:text-rust rounded transition-colors"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-border-light bg-cream-light">
                  <button
                    onClick={handleSopModalClose}
                    className="px-4 py-2 text-sm text-charcoal-light hover:text-charcoal transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSopGenerate}
                    disabled={!sopForm.name.trim()}
                    className="px-4 py-2 text-sm font-medium text-white bg-sage rounded-lg hover:bg-sage-dark disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                  >
                    Generate SOP
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>
              </>
            )}

            {/* Processing State */}
            {sopModalState === 'processing' && (
              <>
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-border-light">
                  <h2 className="text-lg font-semibold text-charcoal">Generating SOP</h2>
                </div>

                {/* Progress Content */}
                <div className="p-6 py-12">
                  {/* Progress Steps */}
                  <div className="flex items-center justify-center mb-8">
                    {sopProcessingSteps.map((step, index) => (
                      <React.Fragment key={index}>
                        <div className="flex flex-col items-center">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
                            index < sopProcessingStep
                              ? 'bg-sage text-white'
                              : index === sopProcessingStep
                                ? 'bg-sage text-white animate-pulse'
                                : 'bg-border-light text-muted'
                          }`}>
                            {index < sopProcessingStep ? '✓' : step.icon}
                          </div>
                          <span className={`text-xs mt-2 ${
                            index <= sopProcessingStep ? 'text-charcoal' : 'text-muted'
                          }`}>
                            {step.label}
                          </span>
                        </div>
                        {index < sopProcessingSteps.length - 1 && (
                          <div className={`w-16 h-0.5 mx-2 transition-colors ${
                            index < sopProcessingStep ? 'bg-sage' : 'bg-border-light'
                          }`} />
                        )}
                      </React.Fragment>
                    ))}
                  </div>

                  {/* Current Step Indicator */}
                  <div className="text-center">
                    <div className="inline-flex items-center gap-2 bg-cream rounded-lg px-4 py-3">
                      <div className="w-5 h-5 border-2 border-sage border-t-transparent rounded-full animate-spin" />
                      <span className="text-sm text-charcoal">
                        {sopProcessingSteps[Math.min(sopProcessingStep, sopProcessingSteps.length - 1)]?.label}...
                      </span>
                    </div>
                    {sopForm.files.length > 0 && (
                      <p className="text-xs text-muted mt-3">
                        Processing {sopForm.files.length} file{sopForm.files.length > 1 ? 's' : ''}
                      </p>
                    )}
                  </div>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-end px-6 py-4 border-t border-border-light bg-cream-light">
                  <button
                    onClick={handleSopModalClose}
                    className="px-4 py-2 text-sm text-charcoal-light hover:text-charcoal transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </>
            )}

            {/* Review State */}
            {sopModalState === 'review' && generatedSop && (
              <>
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-border-light">
                  <h2 className="text-lg font-semibold text-charcoal">Review SOP</h2>
                  <button
                    onClick={handleSopModalClose}
                    className="p-1 text-muted hover:text-charcoal rounded transition-colors"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                {/* Review Content */}
                <div className="p-6 space-y-5 overflow-y-auto max-h-[calc(90vh-140px)]">
                  {/* Success Message */}
                  <div className="flex items-center gap-2 text-sage">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span className="text-sm font-medium">SOP Generated Successfully</span>
                  </div>

                  {/* SOP Summary Card */}
                  <div className="bg-cream rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 bg-sage-tint rounded-lg flex items-center justify-center">
                        <span className="text-xl">📋</span>
                      </div>
                      <div>
                        <h3 className="font-semibold text-charcoal">{generatedSop.name}</h3>
                        <p className="text-sm text-muted mt-0.5">{generatedSop.description}</p>
                        <p className="text-xs text-muted mt-1">Category: {generatedSop.category}</p>
                      </div>
                    </div>
                  </div>

                  {/* Steps */}
                  <div>
                    <h4 className="text-sm font-medium text-charcoal mb-2">
                      Steps ({generatedSop.steps.length})
                    </h4>
                    <div className="bg-cream rounded-lg p-3 space-y-2">
                      {generatedSop.steps.map((step, index) => (
                        <div key={step.id} className="flex gap-3 text-sm">
                          <span className="text-sage font-medium">{index + 1}.</span>
                          <span className="text-charcoal">{step.name}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Inputs & Outputs */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h4 className="text-sm font-medium text-charcoal mb-2">Inputs</h4>
                      <div className="bg-cream rounded-lg p-3">
                        <ul className="text-sm text-charcoal space-y-1">
                          {generatedSop.inputs.map((input, i) => (
                            <li key={i} className="flex items-center gap-2">
                              <span className="w-1.5 h-1.5 rounded-full bg-sage" />
                              {input.name}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-charcoal mb-2">Outputs</h4>
                      <div className="bg-cream rounded-lg p-3">
                        <ul className="text-sm text-charcoal space-y-1">
                          {generatedSop.outputs.map((output, i) => (
                            <li key={i} className="flex items-center gap-2">
                              <span className="w-1.5 h-1.5 rounded-full bg-teal" />
                              {output.name}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>

                  {/* Tools */}
                  <div>
                    <h4 className="text-sm font-medium text-charcoal mb-2">Recommended Tools</h4>
                    <div className="flex flex-wrap gap-2">
                      {availableTools.filter(t => generatedSop.tools.includes(t.id)).map(tool => (
                        <span key={tool.id} className="inline-flex items-center gap-1.5 bg-cream rounded-lg px-3 py-1.5 text-sm">
                          <span>{tool.icon}</span>
                          <span className="text-charcoal">{tool.name}</span>
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-border-light bg-cream-light">
                  <button
                    onClick={handleSopModalClose}
                    className="px-4 py-2 text-sm text-rust hover:text-rust-dark transition-colors"
                  >
                    Discard
                  </button>
                  <button
                    onClick={handleSopEditDetails}
                    className="px-4 py-2 text-sm text-charcoal-light hover:text-charcoal transition-colors"
                  >
                    Edit Details
                  </button>
                  <button
                    onClick={handleSopSave}
                    className="px-4 py-2 text-sm font-medium text-white bg-sage rounded-lg hover:bg-sage-dark transition-colors"
                  >
                    Save SOP
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Toast Notifications */}
      <Toast />
    </div>
  );
};

export default AgentCommandCenter;
