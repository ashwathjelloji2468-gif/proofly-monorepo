'use client';

import React, { useState, useEffect } from 'react';
import { useStore } from '@/store/useStore';
import { 
  BarChart3, 
  Eye, 
  TrendingUp, 
  Share2, 
  Calendar,
  Globe,
  Monitor,
  Sparkles,
  Smartphone,
  ChevronDown,
  Activity,
  Plus,
  Trash2,
  CheckCircle2,
  AlertCircle,
  FileSpreadsheet,
  Download,
  Settings2,
  MousePointer,
  Play
} from 'lucide-react';

export default function AdvancedAnalyticsPage() {
  const user = useStore(state => state.user);
  const collections = useStore(state => state.collections); // spaces
  
  const advancedAnalytics = useStore(state => state.advancedAnalytics);
  const funnelData = useStore(state => state.funnelData);
  const goals = useStore(state => state.goals);
  const reports = useStore(state => state.reports);

  const fetchAdvancedAnalytics = useStore(state => state.fetchAdvancedAnalytics);
  const fetchFunnelData = useStore(state => state.fetchFunnelData);
  const fetchGoals = useStore(state => state.fetchGoals);
  const createGoal = useStore(state => state.createGoal);
  const generateReport = useStore(state => state.generateReport);

  const [selectedSpaceId, setSelectedSpaceId] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'overview' | 'funnels' | 'attribution' | 'goals' | 'reports'>('overview');

  // Goal Form state
  const [newGoalName, setNewGoalName] = useState('');
  const [newGoalDescription, setNewGoalDescription] = useState('');
  const [triggerType, setTriggerType] = useState('CUSTOM');
  const [category, setCategory] = useState('LEAD');
  const [value, setValue] = useState('0.0');

  // Report state
  const [reportRange, setReportRange] = useState('MONTHLY');
  const [reportFormat, setReportFormat] = useState('CSV');

  const [saveSuccess, setSaveSuccess] = useState(false);
  const [errorToast, setErrorToast] = useState<string | null>(null);

  // Sync workspace select
  useEffect(() => {
    if (collections.length > 0) {
      const defaultSpace = collections[0].id;
      setSelectedSpaceId(defaultSpace);
      loadAnalyticsData(defaultSpace);
    }
  }, [collections]);

  const loadAnalyticsData = (spaceId: string) => {
    fetchAdvancedAnalytics(spaceId);
    fetchFunnelData(spaceId);
    fetchGoals(spaceId);
  };

  const handleSpaceChange = (spaceId: string) => {
    setSelectedSpaceId(spaceId);
    loadAnalyticsData(spaceId);
  };

  const handleCreateGoal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGoalName.trim()) {
      setErrorToast('Goal name is required.');
      setTimeout(() => setErrorToast(null), 3000);
      return;
    }
    const valFloat = parseFloat(value) || 0.0;
    const goal = await createGoal(selectedSpaceId, newGoalName, newGoalDescription || null, triggerType, category, valFloat);
    if (goal) {
      setNewGoalName('');
      setNewGoalDescription('');
      setValue('0.0');
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2000);
    }
  };

  const handleGenerateReport = async () => {
    const report = await generateReport(selectedSpaceId, reportRange, reportFormat);
    if (report) {
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2000);
    }
  };

  // SVG Line/Area paths
  const calculateSvgPath = (pointsArray: { date: string; views: number; conversions: number }[], metric: 'views' | 'conversions', height: number, width: number) => {
    if (pointsArray.length < 2) return `M 0,${height} L ${width},${height}`;
    const maxVal = Math.max(...pointsArray.map(p => p[metric])) * 1.2 || 10;
    const points = pointsArray.map((pt, idx) => {
      const x = (idx / (pointsArray.length - 1)) * width;
      const y = height - (pt[metric] / maxVal) * height;
      return `${x},${y}`;
    });
    return `M ${points.join(' L ')}`;
  };

  const calculateAreaPath = (pointsArray: { date: string; views: number; conversions: number }[], metric: 'views' | 'conversions', height: number, width: number) => {
    if (pointsArray.length < 2) return `M 0,${height} L ${width},${height} Z`;
    const maxVal = Math.max(...pointsArray.map(p => p[metric])) * 1.2 || 10;
    const points = pointsArray.map((pt, idx) => {
      const x = (idx / (pointsArray.length - 1)) * width;
      const y = height - (pt[metric] / maxVal) * height;
      return `${x},${y}`;
    });
    return `M 0,${height} L ${points.join(' L ')} L ${width},${height} Z`;
  };

  const parsedTraffic = advancedAnalytics?.traffic ? JSON.parse(advancedAnalytics.traffic) : [];

  return (
    <div className="flex-1 bg-[#09090B] flex flex-col min-w-0 text-slate-100 font-sans">
      
      {/* Toast Alert */}
      {saveSuccess && (
        <div className="fixed top-5 right-5 z-50 bg-brand-emerald text-white font-bold text-xs px-4 py-3 rounded-lg flex items-center space-x-2 shadow-2xl transition animate-pulse">
          <CheckCircle2 className="w-4 h-4" />
          <span>Goal Created & Verified!</span>
        </div>
      )}
      {errorToast && (
        <div className="fixed top-5 right-5 z-50 bg-red-600 text-white font-bold text-xs px-4 py-3 rounded-lg flex items-center space-x-2 shadow-2xl transition animate-pulse">
          <AlertCircle className="w-4 h-4" />
          <span>{errorToast}</span>
        </div>
      )}

      {/* Header */}
      <header className="border-b border-border-primary bg-[#09090B]/80 backdrop-blur sticky top-0 z-30 px-8 py-5 flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="font-extrabold text-lg text-white flex items-center space-x-2">
            <BarChart3 className="w-5 h-5 text-brand-emerald" />
            <span>Conversion Analytics Dashboard</span>
          </h1>
          <p className="text-[11px] text-muted-foreground">Monitor funnel dropoffs, custom goals conversion events, and testimonial revenue influence.</p>
        </div>
      </header>

      <main className="p-8 space-y-6 max-w-6xl w-full text-left">
        
        {/* Workspace select block */}
        <div className="flex items-center space-x-3 bg-[#18181B] border border-border-primary p-4 rounded-xl shadow-md w-full max-w-md">
          <label className="text-xs font-black uppercase text-slate-400 tracking-wider">Select Space:</label>
          <select
            value={selectedSpaceId}
            onChange={(e) => handleSpaceChange(e.target.value)}
            className="flex-1 bg-[#09090B] border border-border-primary rounded-lg text-xs font-semibold py-2 px-3 text-slate-200 focus:border-brand-emerald outline-none cursor-pointer"
          >
            {collections.map(c => (
              <option key={c.id} value={c.id}>{c.title}</option>
            ))}
          </select>
        </div>

        {/* Multi-Tab Navigation */}
        <div className="flex space-x-2 border-b border-border-primary/50 pb-2 ">
          {[
            { id: 'overview', label: 'Overview Metrics' },
            { id: 'funnels', label: 'Conversion Funnels' },
            { id: 'attribution', label: 'Revenue Attribution' },
            { id: 'goals', label: 'Goals' },
            { id: 'reports', label: 'Export Reports' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`text-xs font-black uppercase px-4 py-2 border rounded-lg transition cursor-pointer ${
                activeTab === tab.id
                  ? 'bg-brand-emerald/10 text-brand-emerald border-brand-emerald/20'
                  : 'bg-[#18181B] text-slate-400 border-border-primary hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* TAB 1: OVERVIEW */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {advancedAnalytics ? (
              <>
                {/* Metric scorecards */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[
                    { label: 'Total Page Views', value: advancedAnalytics.views, sub: '+8.4% vs last week', color: 'text-brand-emerald' },
                    { label: 'Unique Visitors', value: advancedAnalytics.visitors, sub: '92% unique sessions', color: 'text-brand-teal' },
                    { label: 'Conversions Logged', value: advancedAnalytics.conversions, sub: '+4.2% rate increase', color: 'text-[#8B5CF6]' },
                    { label: 'Revenue Influenced', value: '$' + advancedAnalytics.revenueInfluenced.toFixed(2), sub: 'AOV: $49.50', color: 'text-[#EC4899]' }
                  ].map(card => (
                    <div key={card.label} className="bg-[#18181B] border border-border-primary p-5 rounded-xl flex flex-col justify-between h-28 hover:border-zinc-800 transition">
                      <div className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">{card.label}</div>
                      <div className={`text-2xl font-black ${card.color}`}>{card.value}</div>
                      <div className="text-[11px] text-slate-500 font-bold">{card.sub}</div>
                    </div>
                  ))}
                </div>

                {/* SVG Line chart trend */}
                <div className="bg-[#18181B] border border-border-primary p-6 rounded-xl space-y-4 shadow-xl">
                  <h3 className="text-white text-xs font-black uppercase tracking-wider">Traffic Impressions Trends</h3>
                  <div className="h-48 w-full relative">
                    <svg className="w-full h-full" preserveAspectRatio="none">
                      {/* Grid background lines */}
                      <line x1="0" y1="20" x2="800" y2="20" stroke="#27272a" strokeWidth="0.5" strokeDasharray="3" />
                      <line x1="0" y1="80" x2="800" y2="80" stroke="#27272a" strokeWidth="0.5" strokeDasharray="3" />
                      <line x1="0" y1="140" x2="800" y2="140" stroke="#27272a" strokeWidth="0.5" strokeDasharray="3" />

                      {/* Views Area Path */}
                      <path 
                        d={calculateAreaPath(parsedTraffic, 'views', 192, 800)} 
                        fill="url(#gradient-views)" 
                        opacity="0.12" 
                      />
                      {/* Views Line */}
                      <path 
                        d={calculateSvgPath(parsedTraffic, 'views', 192, 800)} 
                        fill="none" 
                        stroke="#10B981" 
                        strokeWidth="2.5" 
                      />

                      {/* Conversions Area Path */}
                      <path 
                        d={calculateAreaPath(parsedTraffic, 'conversions', 192, 800)} 
                        fill="url(#gradient-conversions)" 
                        opacity="0.15" 
                      />
                      {/* Conversions Line */}
                      <path 
                        d={calculateSvgPath(parsedTraffic, 'conversions', 192, 800)} 
                        fill="none" 
                        stroke="#8B5CF6" 
                        strokeWidth="2.5" 
                      />

                      <defs>
                        <linearGradient id="gradient-views" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#10B981" />
                          <stop offset="100%" stopColor="#10B981" stopOpacity="0" />
                        </linearGradient>
                        <linearGradient id="gradient-conversions" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#8B5CF6" />
                          <stop offset="100%" stopColor="#8B5CF6" stopOpacity="0" />
                        </linearGradient>
                      </defs>
                    </svg>
                  </div>
                  <div className="flex justify-between text-[10px] text-slate-500 font-bold">
                    <span>{parsedTraffic[0]?.date || 'Start'}</span>
                    <span>{parsedTraffic[parsedTraffic.length - 1]?.date || 'End'}</span>
                  </div>
                </div>

                {/* Country, browser columns */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Browser configuration */}
                  <div className="bg-[#18181B] border border-border-primary p-6 rounded-xl space-y-4 shadow-xl">
                    <h3 className="text-white text-xs font-black uppercase tracking-wider border-b border-border-primary/50 pb-2">Devices & Browsers</h3>
                    <div className="space-y-3">
                      {advancedAnalytics.browsers.map(b => (
                        <div key={b.browser} className="space-y-1">
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-slate-350">{b.browser}</span>
                            <span className="text-slate-200 font-bold">{b.count} views</span>
                          </div>
                          <div className="h-2 w-full bg-zinc-800 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-brand-emerald" 
                              style={{ width: `${Math.min((b.count / Math.max(...advancedAnalytics.browsers.map(d => d.count), 1)) * 100, 100)}%` }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Top Countries */}
                  <div className="bg-[#18181B] border border-border-primary p-6 rounded-xl space-y-4 shadow-xl">
                    <h3 className="text-white text-xs font-black uppercase tracking-wider border-b border-border-primary/50 pb-2">Top Country Referrals</h3>
                    <div className="space-y-3">
                      {advancedAnalytics.countries.map(c => (
                        <div key={c.country} className="space-y-1">
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-slate-350">{c.country}</span>
                            <span className="text-slate-200 font-bold">{c.count} visitors</span>
                          </div>
                          <div className="h-2 w-full bg-zinc-800 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-brand-teal" 
                              style={{ width: `${Math.min((c.count / Math.max(...advancedAnalytics.countries.map(d => d.count), 1)) * 100, 100)}%` }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="py-24 text-center text-xs text-slate-500 font-bold">Loading advanced analytics scorecards...</div>
            )}
          </div>
        )}

        {/* TAB 2: FUNNELS */}
        {activeTab === 'funnels' && (
          <div className="bg-[#18181B] border border-border-primary rounded-2xl p-6 md:p-8 space-y-8 shadow-xl">
            <div className="space-y-2">
              <h3 className="text-white text-sm font-black uppercase">Visitor Conversion Funnel</h3>
              <p className="text-xs text-muted-foreground">Trace dropoffs along each stage from initial page landing to widget clicks and signup goals.</p>
            </div>

            <div className="space-y-4 pt-4">
              {funnelData.map((step, idx) => (
                <div key={step.step} className="space-y-1.5">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-300 font-bold">{step.step}</span>
                    <div className="space-x-3 text-slate-400">
                      <span>{step.count} sessions</span>
                      <span className="text-brand-emerald font-black">{step.percentage}%</span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <div className="flex-1 h-3.5 bg-zinc-900 rounded-full overflow-hidden border border-zinc-800">
                      <div 
                        className="h-full bg-gradient-to-r from-brand-emerald to-brand-teal"
                        style={{ width: `${step.percentage}%` }}
                      />
                    </div>
                    {idx < funnelData.length - 1 && (
                      <span className="text-[10px] text-slate-500 font-black">
                        ↓ {Math.max(0, (step.percentage - (funnelData[idx + 1]?.percentage || 0))).toFixed(1)}% Drop
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: ATTRIBUTION */}
        {activeTab === 'attribution' && (
          <div className="bg-[#18181B] border border-border-primary rounded-2xl p-6 space-y-4 shadow-xl text-left">
            <div className="space-y-1 border-b border-border-primary/50 pb-3">
              <h3 className="text-white text-xs font-black uppercase tracking-wider flex items-center space-x-1">
                <Sparkles className="w-4 h-4 text-[#8B5CF6]" />
                <span>Revenue Influenced per Channel</span>
              </h3>
              <p className="text-[10px] text-muted-foreground">List of channels showing direct purchase influences.</p>
            </div>

            <div className="overflow-x-auto ">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-border-primary text-[10px] text-slate-400 font-black uppercase tracking-wider">
                    <th className="py-3 px-2">Channel Name</th>
                    <th className="py-3 px-2">Type</th>
                    <th className="py-3 px-2">Conversions</th>
                    <th className="py-3 px-2">Influenced Sales</th>
                  </tr>
                </thead>
                <tbody className="text-xs">
                  {[
                    { name: 'Home Widget Carousel', type: 'WIDGET', count: 18, revenue: 891.00 },
                    { name: 'Public Wall Apple Showcase', type: 'SHOWCASE', count: 12, revenue: 594.00 },
                    { name: 'Email Collection Footer Link', type: 'COLLECTION', count: 3, revenue: 148.50 }
                  ].map(channel => (
                    <tr key={channel.name} className="border-b border-border-primary/40 hover:bg-[#202024] transition">
                      <td className="py-3.5 px-2 text-white font-bold">{channel.name}</td>
                      <td className="py-3.5 px-2 text-slate-400 font-mono text-[10px]">{channel.type}</td>
                      <td className="py-3.5 px-2 font-mono text-slate-350">{channel.count}</td>
                      <td className="py-3.5 px-2 font-mono text-brand-emerald font-black">${channel.revenue.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 4: GOALS CREATOR */}
        {activeTab === 'goals' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Goal List */}
            <div className="lg:col-span-2 bg-[#18181B] border border-border-primary rounded-2xl p-6 space-y-4 shadow-xl">
              <h3 className="text-white text-xs font-black uppercase tracking-wider border-b border-border-primary/50 pb-2">Active Conversion Goals</h3>
              <div className="space-y-3">
                {goals.length === 0 ? (
                  <div className="py-12 text-center text-xs text-slate-500 font-bold border border-dashed border-border-primary rounded-xl">
                    No conversion goals declared yet. Create one below to begin attribution tracking.
                  </div>
                ) : (
                  goals.map(g => (
                    <div key={g.id} className="bg-[#09090B] border border-border-primary rounded-xl p-4 flex items-center justify-between hover:border-zinc-800 transition">
                      <div className="space-y-1">
                        <span className="text-xs font-bold text-white leading-none">{g.name}</span>
                        {g.description && <p className="text-[10px] text-muted-foreground">{g.description}</p>}
                        <div className="flex gap-2.5 pt-1">
                          <span className="text-[11px] bg-zinc-900 px-2 py-0.5 rounded text-slate-400 font-mono border border-zinc-800">{g.triggerType}</span>
                          <span className="text-[11px] bg-brand-emerald/10 px-2 py-0.5 rounded text-brand-emerald font-bold border border-brand-emerald/20">{g.category}</span>
                        </div>
                      </div>
                      <div className="text-sm font-black text-brand-teal font-mono">${g.value.toFixed(2)}</div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Creator Form */}
            <div className="bg-[#18181B] border border-border-primary rounded-2xl p-6 space-y-4 shadow-xl">
              <h3 className="text-white text-xs font-black uppercase tracking-wider border-b border-border-primary/50 pb-2">Create Conversion Goal</h3>
              <form onSubmit={handleCreateGoal} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Goal Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Completed Checkout Purchase"
                    value={newGoalName}
                    onChange={(e) => setNewGoalName(e.target.value)}
                    className="w-full bg-[#09090B] border border-border-primary rounded-lg text-xs py-2 px-3 text-slate-200 focus:border-brand-emerald outline-none"
                  />
                </div>
                
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Description</label>
                  <input
                    type="text"
                    placeholder="Brief objective summary..."
                    value={newGoalDescription}
                    onChange={(e) => setNewGoalDescription(e.target.value)}
                    className="w-full bg-[#09090B] border border-border-primary rounded-lg text-xs py-2 px-3 text-slate-200 focus:border-brand-emerald outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase">Trigger Event</label>
                    <select
                      value={triggerType}
                      onChange={(e) => setTriggerType(e.target.value)}
                      className="w-full bg-[#09090B] border border-border-primary rounded-lg text-xs py-2 px-2 text-slate-200 focus:border-brand-emerald outline-none cursor-pointer"
                    >
                      <option value="CUSTOM">Custom API Trigger</option>
                      <option value="CLICK">Click Widget Element</option>
                      <option value="VIEW">Widget Load View</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase">Category</label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full bg-[#09090B] border border-border-primary rounded-lg text-xs py-2 px-2 text-slate-200 focus:border-brand-emerald outline-none cursor-pointer"
                    >
                      <option value="LEAD">Lead Generation</option>
                      <option value="SIGNUP">User Signup</option>
                      <option value="PURCHASE">Completed Checkout</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Estimated Value (USD)</label>
                  <input
                    type="text"
                    placeholder="49.00"
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    className="w-full bg-[#09090B] border border-border-primary rounded-lg text-xs py-2 px-3 text-slate-200 focus:border-brand-emerald outline-none font-mono"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-brand-emerald text-white hover:opacity-95 font-black text-xs py-2.5 rounded-lg flex items-center justify-center space-x-1 cursor-pointer transition shadow-md shadow-brand-emerald/10"
                >
                  <Plus className="w-4 h-4" />
                  <span>Register Goal</span>
                </button>
              </form>
            </div>

          </div>
        )}

        {/* TAB 5: REPORTS EXPORTER */}
        {activeTab === 'reports' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Generate Trigger */}
            <div className="bg-[#18181B] border border-border-primary rounded-2xl p-6 space-y-4 shadow-xl">
              <h3 className="text-white text-xs font-black uppercase tracking-wider border-b border-border-primary/50 pb-2">Generate Report</h3>
              <div className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Report Scope Range</label>
                  <select
                    value={reportRange}
                    onChange={(e) => setReportRange(e.target.value)}
                    className="w-full bg-[#09090B] border border-border-primary rounded-lg text-xs py-2 px-3 text-slate-200 focus:border-brand-emerald outline-none cursor-pointer"
                  >
                    <option value="DAILY">Daily Breakdown</option>
                    <option value="WEEKLY">Weekly Scope</option>
                    <option value="MONTHLY">Monthly Overview</option>
                    <option value="YEARLY">Yearly Scope</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">File Format</label>
                  <select
                    value={reportFormat}
                    onChange={(e) => setReportFormat(e.target.value)}
                    className="w-full bg-[#09090B] border border-border-primary rounded-lg text-xs py-2 px-3 text-slate-200 focus:border-brand-emerald outline-none cursor-pointer"
                  >
                    <option value="CSV">Comma Separated (CSV)</option>
                    <option value="EXCEL">Microsoft Excel (XLSX)</option>
                    <option value="PDF">Portable Document (PDF)</option>
                  </select>
                </div>

                <button
                  onClick={handleGenerateReport}
                  className="w-full bg-brand-emerald text-white hover:opacity-95 font-black text-xs py-3 rounded-lg flex items-center justify-center space-x-1.5 cursor-pointer transition shadow-md shadow-brand-emerald/10"
                >
                  <FileSpreadsheet className="w-4 h-4" />
                  <span>Generate Export File</span>
                </button>
              </div>
            </div>

            {/* Reports List */}
            <div className="lg:col-span-2 bg-[#18181B] border border-border-primary rounded-2xl p-6 space-y-4 shadow-xl">
              <h3 className="text-white text-xs font-black uppercase tracking-wider border-b border-border-primary/50 pb-2">Generated Reports Repository</h3>
              <div className="space-y-3">
                {reports.length === 0 ? (
                  <div className="py-12 text-center text-xs text-slate-500 font-bold border border-dashed border-border-primary rounded-xl">
                    No reports generated yet. Configure and generate your first export on the left.
                  </div>
                ) : (
                  reports.map(r => (
                    <div key={r.id} className="bg-[#09090B] border border-border-primary rounded-xl p-4 flex items-center justify-between hover:border-zinc-800 transition">
                      <div className="space-y-1">
                        <span className="text-xs font-bold text-white">{r.name}</span>
                        <div className="flex gap-2 pt-1">
                          <span className="text-[11px] bg-zinc-900 border border-zinc-800 px-2 py-0.5 rounded text-slate-400 font-mono">{r.range}</span>
                          <span className="text-[11px] bg-zinc-900 border border-zinc-800 px-2 py-0.5 rounded text-brand-teal font-black">{r.format}</span>
                        </div>
                      </div>
                      <a
                        href={r.fileUrl || '#'}
                        download
                        className="bg-zinc-800 hover:bg-zinc-750 text-slate-300 hover:text-white p-2 rounded-lg border border-zinc-700 transition"
                      >
                        <Download className="w-4 h-4" />
                      </a>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

      </main>

    </div>
  );
}
