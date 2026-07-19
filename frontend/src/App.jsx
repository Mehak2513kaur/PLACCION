import React, { useState, useEffect, useRef } from 'react';
import { 
  Home, Users, Target, Activity, Lightbulb, Settings, FileText, Database,
  Bell, Search, BookOpen, PenTool, Brain, Code, User, ArrowRight,
  TrendingUp, Briefcase, Award, Zap, BriefcaseBusiness, CloudRain, Shield, Quote, Heart, UploadCloud, Monitor, CheckCircle, XCircle, Download, Filter, Link, RefreshCw, Lock, Sliders, Menu, X
} from 'lucide-react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer,
  PieChart, Pie, Cell, BarChart, Bar, AreaChart, Area, Tooltip, Legend,
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis
} from 'recharts';
import './App.css';

export default function App() {
  const [predictionResult, setPredictionResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('Dashboard');
  const [toastMsg, setToastMsg] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  const [wizardStep, setWizardStep] = useState(1);
  const [formData, setFormData] = useState({
    // Academic & Personal
    branch: "CSE", college_tier: "Tier-2", cgpa: 8.6, backlogs: 0, tenth_percentage: 85, twelfth_percentage: 82,
    // Coding & Tech
    coding_skills: 8.9, dsa_score: 8.0, ml_knowledge: 4.0, system_design: 4.0, 
    python: false, java: false, cpp: false, react: false, devops: false, sql: false,
    leetcode_solved: 0,
    // Experience & Projects
    internships: 2, projects_count: 3, certifications: 1, hackathons: 0, open_source_contributions: 0, extracurriculars: 0,
    // Soft Skills
    aptitude_score: 81, communication_skills: 8.3, teamwork_rating: 7, problem_solving_rating: 8
  });

  const fileInputRef = useRef(null);

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 3000);
  };

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;
    
    setIsUploading(true);
    showToast("Analyzing Resume via AI...");
    
    const uploadData = new FormData();
    uploadData.append("file", file);
    
    try {
      const response = await fetch('http://localhost:8000/upload_resume', {
        method: 'POST',
        body: uploadData
      });
      const resData = await response.json();
      
      if(resData.status === 'success') {
        const updatedData = {
          ...formData,
          cgpa: resData.data.cgpa || formData.cgpa,
          coding_skills: resData.data.coding_skills || formData.coding_skills,
          ml_knowledge: resData.data.ml_knowledge || formData.ml_knowledge,
          dsa_score: resData.data.dsa_score || formData.dsa_score,
          system_design: resData.data.system_design || formData.system_design,
          projects_count: resData.data.projects_count || formData.projects_count,
          internships: resData.data.internships || formData.internships,
          certifications: resData.data.certifications || formData.certifications,
        };
        setFormData(updatedData);
        showToast(`Resume Parsed! Found ${resData.data.found_skills.length} skills. Generating prediction...`);
        // Automatically predict instead of opening the verification form
        handlePredict(updatedData);
      }
    } catch(e) {
      console.error(e);
      showToast("Failed to parse resume.");
    }
    setIsUploading(false);
    event.target.value = null; // reset input
  };

  const handlePredict = async (dataToPredict = formData) => {
    setIsLoading(true);
    try {
      const response = await fetch('http://localhost:8000/predict', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dataToPredict)
      });
      const data = await response.json();
      setPredictionResult(data);
      showToast("Prediction Generated Successfully!");
      setActiveTab('Dashboard'); // Redirect to dashboard to see results
    } catch (e) {
      console.error(e);
      showToast("Error generating prediction. Check backend.");
    }
    setIsLoading(false);
    setIsModalOpen(false);
  };

  const probValue = predictionResult ? Math.round(predictionResult.probability * 100) : 0;
  const isHighChance = probValue >= 60;

  // Arc calculation for ring
  const radius = 64;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (probValue / 100) * circumference * 0.75;

  const tabs = [
    { name: 'Dashboard', icon: <Home size={18}/> },
    { name: 'Students', icon: <Users size={18}/> },
    { name: 'Prediction', icon: <Target size={18}/> },
    { name: 'Analytics', icon: <Activity size={18}/> },
    { name: 'Batch Insights', icon: <BookOpen size={18}/> },
    { name: 'Recommendations', icon: <Lightbulb size={18}/> },
    { name: 'Model Performance', icon: <Zap size={18}/> },
    { name: 'Reports', icon: <FileText size={18}/> },
    { name: 'Data Management', icon: <Database size={18}/> },
    { name: 'Settings', icon: <Settings size={18}/> }
  ];

  return (
    <div className="app-container">
      {/* Mobile Overlay */}
      <div className={`overlay ${isSidebarOpen ? 'open' : ''}`} onClick={() => setIsSidebarOpen(false)}></div>

      {/* Sidebar */}
      <aside className={`sidebar ${isSidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-logo">
          <div className="logo-icon">P</div>
          <div style={{flex: 1}}>
            <h3 style={{fontWeight: 800, fontSize: '15px'}}>PLACCION</h3>
            <p style={{fontSize: '11px', color: 'var(--text-gray)'}}>AI Placement Predictor</p>
          </div>
          <button className="mobile-menu-btn" style={{border: 'none', background: 'transparent'}} onClick={() => setIsSidebarOpen(false)}>
            <X size={20} />
          </button>
        </div>

        <nav className="sidebar-nav">
          {tabs.map(tab => (
            <div 
              key={tab.name} 
              className={`nav-item ${activeTab === tab.name ? 'active' : ''}`}
              onClick={() => {
                setActiveTab(tab.name);
                if(tab.name !== 'Dashboard') showToast(`Navigated to ${tab.name} Page`);
              }}
            >
              {tab.icon} {tab.name}
            </div>
          ))}
        </nav>

        <div className="upgrade-card">
          <div className="upgrade-title"><Award size={18} color="var(--primary)"/> Upgrade to Pro</div>
          <p className="upgrade-desc">Unlock advanced analytics, custom models & more.</p>
          <button className="btn-primary" style={{fontSize: '13px'}} onClick={() => showToast("Opening Upgrade options...")}>Upgrade Now</button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        {/* Header */}
        <header className="header">
          <div style={{display: 'flex', alignItems: 'center', gap: 16}}>
            <button className="mobile-menu-btn" onClick={() => setIsSidebarOpen(true)}>
              <Menu size={20} />
            </button>
            <div>
              <h1 style={{fontSize: '24px', fontWeight: 800, marginBottom: '6px', color: 'var(--text-dark)'}}>
                {activeTab === 'Dashboard' ? 'Welcome back! 👋' : `${activeTab}`}
              </h1>
              <p style={{fontSize: '14px', color: 'var(--text-gray)', display: window.innerWidth > 768 ? 'block' : 'none'}}>
                {activeTab === 'Dashboard' ? 'AI-driven insights to build successful futures' : `Manage and view ${activeTab.toLowerCase()} data`}
              </p>
            </div>
          </div>
          <div style={{display: 'flex', gap: '24px', alignItems: 'center'}}>
            <div className="search-box">
              <Search size={18} color="var(--text-muted)"/>
              <input 
                placeholder="Search students, skills, reports..." 
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    showToast(`Searching for: ${e.target.value}`);
                    e.target.value = '';
                  }
                }}
              />
            </div>
            <div style={{position: 'relative', cursor: 'pointer'}} onClick={() => showToast("You have 3 new unread notifications!")}>
              <Bell size={22} color="var(--text-gray)" />
              <div style={{position: 'absolute', top: -2, right: 0, width: 8, height: 8, background: '#ef4444', borderRadius: '50%'}}></div>
            </div>
            <div style={{display: 'flex', gap: '12px', alignItems: 'center', cursor: 'pointer'}} onClick={() => showToast("Opening Admin Profile...")}>
              <div style={{width: 40, height: 40, borderRadius: '50%', background: '#1e293b', overflow: 'hidden'}}>
                <img src="https://ui-avatars.com/api/?name=Admin&background=1e293b&color=fff" alt="avatar" style={{width: '100%'}}/>
              </div>
              <div style={{lineHeight: 1.2}}>
                <div style={{fontSize: '14px', fontWeight: 700}}>Admin</div>
                <div style={{fontSize: '12px', color: 'var(--text-gray)'}}>Placement Cell</div>
              </div>
            </div>
          </div>
        </header>

        {activeTab === 'Dashboard' ? (
          <>
            {/* Metric Cards Row */}
            <div className="metrics-row">
              <MetricCard icon={<Users size={24}/>} bg="#f5f3ff" color="#8b5cf6" title="Total Students" val="12,842" percent="7.6%" />
              <MetricCard icon={<BriefcaseBusiness size={24}/>} bg="#ecfdf5" color="#10b981" title="Placed Students" val="7,326" percent="12.4%" />
              <MetricCard icon={<Activity size={24}/>} bg="#fffbeb" color="#f59e0b" title="Placement Rate" val="57.0%" percent="4.8%" />
              <MetricCard icon={<Award size={24}/>} bg="#eff6ff" color="#3b82f6" title="Avg. Package" val="₹ 8.72 LPA" percent="7.1%" />
              <MetricCard icon={<Target size={24}/>} bg="#fdf2f8" color="#ec4899" title="Top Domain" val="Software Dev" desc="42% of offers" hidePercent />
            </div>

            {/* If Prediction Result exists, show the new Detailed view, else show default dashboard */}
            {predictionResult ? (
              <div className="detailed-results-grid">
                {/* Left: Explainable AI & Career Match */}
                <div className="card" style={{flex: 1.5}}>
                  <div className="card-header" style={{marginBottom: 16}}>
                    <div className="card-title">AI Career Analysis</div>
                    <div className="card-subtitle">Detailed breakdown of the candidate's profile</div>
                  </div>

                  <div className="explainable-ai-grid">
                    <div className="strength-box">
                      <div className="box-title" style={{color: '#10b981'}}><CheckCircle size={16}/> Strong Areas</div>
                      <div className="box-items">
                        {predictionResult.strong_areas?.map((item, i) => (
                          <div key={i} className="explain-item">
                            <div className="explain-title">{item.title}</div>
                            <div className="explain-desc">{item.desc}</div>
                          </div>
                        ))}
                        {(!predictionResult.strong_areas || predictionResult.strong_areas.length === 0) && <div className="explain-desc">No major strong areas identified.</div>}
                      </div>
                    </div>
                    
                    <div className="weakness-box">
                      <div className="box-title" style={{color: '#ef4444'}}><XCircle size={16}/> Needs Improvement</div>
                      <div className="box-items">
                        {predictionResult.needs_improvement?.map((item, i) => (
                          <div key={i} className="explain-item">
                            <div className="explain-title">{item.title}</div>
                            <div className="explain-desc">{item.desc}</div>
                          </div>
                        ))}
                        {(!predictionResult.needs_improvement || predictionResult.needs_improvement.length === 0) && <div className="explain-desc">Profile is well-rounded!</div>}
                      </div>
                    </div>
                  </div>

                  <div style={{marginTop: 24}}>
                    <div className="box-title" style={{color: 'var(--text-dark)', marginBottom: 16}}><Briefcase size={16}/> Recruiter Match Scores</div>
                    <div className="career-match-list">
                      {predictionResult.career_matches?.map((role, i) => (
                        <div key={i} className="career-match-item">
                          <div className="role-header">
                            <span className="role-name">{role.role}</span>
                            <span className="role-score">{role.match}% Match</span>
                          </div>
                          <div className="match-bar-bg">
                            <div className="match-bar-fill" style={{width: `${role.match}%`, background: role.match > 90 ? '#10b981' : role.match > 80 ? '#f59e0b' : '#3b82f6'}}></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Right: Probability Ring & Reset */}
                <div className="card" style={{flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
                  <div className="card-title" style={{alignSelf: 'flex-start'}}>Placement Probability</div>
                  
                  <div className="ring-wrapper" style={{margin: '40px 0'}}>
                    <svg width="220" height="220" viewBox="0 0 160 160">
                      <circle cx="80" cy="80" r={radius} fill="transparent" stroke="#f1f5f9" strokeWidth="12" strokeDasharray={circumference} strokeDashoffset={circumference * 0.25} strokeLinecap="round" />
                      <circle cx="80" cy="80" r={radius} fill="transparent" stroke={isHighChance ? '#10b981' : '#3b82f6'} strokeWidth="12" strokeDasharray={circumference} strokeDashoffset={strokeDashoffset} strokeLinecap="round" style={{transition: 'stroke-dashoffset 1s ease-in-out'}}/>
                    </svg>
                    <div className="ring-value">
                      <div style={{fontSize: '48px', fontWeight: 800, color: 'var(--text-dark)', lineHeight: 1}}>{probValue}%</div>
                      <div style={{fontSize: '13px', fontWeight: 700, color: isHighChance ? '#10b981' : '#3b82f6', marginTop: 8}}>{isHighChance ? 'Highly Likely' : 'Moderate Chance'}</div>
                    </div>
                  </div>

                  <button className="btn-primary" style={{marginTop: 'auto'}} onClick={() => {setPredictionResult(null); showToast("Ready for next prediction");}}>
                    Run Another Prediction
                  </button>
                </div>
              </div>
            ) : (
              <div className="dashboard-grid">
                {/* Left: Overview */}
                <div className="card">
                  <div className="card-header">
                    <div>
                      <div className="card-title">Placement Probability Overview</div>
                      <div className="card-subtitle">Real-time predictions across the current batch</div>
                    </div>
                    <div 
                      onClick={() => showToast("Opening Batch Selection dropdown...")}
                      style={{fontSize: '13px', fontWeight: 500, border: '1px solid var(--border)', padding: '8px 14px', borderRadius: '8px', color: 'var(--text-gray)', display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer'}}
                    >
                      <BookOpen size={14}/> Batch 2024 <span style={{fontSize: 10}}>▼</span>
                    </div>
                  </div>

                  <div className="overview-layout">
                    <div className="ring-wrapper">
                      <svg width="220" height="220" viewBox="0 0 160 160">
                        <circle cx="80" cy="80" r={radius} fill="transparent" stroke="#f1f5f9" strokeWidth="12" strokeDasharray={circumference} strokeDashoffset={circumference * 0.25} strokeLinecap="round" />
                        <circle cx="80" cy="80" r={radius} fill="transparent" stroke={isHighChance ? '#10b981' : '#3b82f6'} strokeWidth="12" strokeDasharray={circumference} strokeDashoffset={circumference - (0.57 * circumference * 0.75)} strokeLinecap="round" style={{transition: 'stroke-dashoffset 1s ease-in-out'}}/>
                      </svg>
                      <div className="ring-value">
                        <div style={{fontSize: '48px', fontWeight: 800, color: 'var(--text-dark)', lineHeight: 1}}>57%</div>
                        <div style={{fontSize: '13px', fontWeight: 700, color: '#10b981', marginTop: 8}}>Batch Average</div>
                      </div>
                    </div>

                    <div className="skills-list">
                      <SkillRow icon={<BookOpen size={16}/>} c="#8b5cf6" label="Academics (CGPA)" val={formData.cgpa} max={10} />
                      <SkillRow icon={<Code size={16}/>} c="#3b82f6" label="Technical Skills" val={formData.coding_skills} max={10} />
                      <SkillRow icon={<Brain size={16}/>} c="#10b981" label="Aptitude Score" val={formData.aptitude_score/10} max={10} displayVal={formData.aptitude_score/10} />
                      <SkillRow icon={<Briefcase size={16}/>} c="#f59e0b" label="Projects" val={formData.projects_count * 3} max={10} displayVal={formData.projects_count * 3.1} />
                      <SkillRow icon={<Target size={16}/>} c="#ec4899" label="Internships" val={formData.internships * 4} max={10} displayVal={formData.internships * 3.9} />
                      <SkillRow icon={<Heart size={16}/>} c="#d946ef" label="Soft Skills" val={formData.communication_skills} max={10} />
                    </div>
                  </div>
                </div>

                {/* Right: Prediction Action with Resume Upload */}
                <div className="card">
                  <div className="card-title">AI Hybrid Prediction</div>
                  <div className="card-subtitle" style={{marginBottom: 24}}>Upload a resume to auto-fill details and get career matching</div>

                  <div className="action-steps" style={{marginBottom: 24}}>
                    <div className="step">
                      <div className="step-num">1</div>
                      <div><div className="step-title">Upload Resume</div><div className="step-desc">AI extracts skills, education & projects</div></div>
                    </div>
                    <div className="step">
                      <div className="step-num">2</div>
                      <div><div className="step-title">Smart Verification</div><div className="step-desc">Review and complete missing info</div></div>
                    </div>
                    <div className="step">
                      <div className="step-num">3</div>
                      <div><div className="step-title">Get Insights</div><div className="step-desc">View role match scores & strong areas</div></div>
                    </div>
                  </div>

                  <input 
                    type="file" 
                    accept=".pdf" 
                    style={{display: 'none'}} 
                    ref={fileInputRef}
                    onChange={handleFileUpload}
                  />

                  <div style={{display: 'flex', gap: 12}}>
                    <button className="btn-primary" style={{flex: 1, background: '#181c32'}} onClick={() => fileInputRef.current.click()} disabled={isUploading}>
                      {isUploading ? 'Parsing Resume...' : <><UploadCloud size={16}/> Upload PDF Resume</>}
                    </button>
                    <button className="btn-primary" style={{flex: 1}} onClick={() => setIsModalOpen(true)}>
                      <PenTool size={16}/> Manual Entry
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Dashboard Grid - Bottom Section */}
            <div className="responsive-grid-2-asym" style={{, marginTop: 24}}>
              {/* Left: Insights */}
              <div className="card" style={{display: 'flex', flexDirection: 'column'}}>
                <div className="card-title" style={{marginBottom: 24}}>Placement Insights</div>
                <div className="charts-layout">
                  <div className="chart-box">
                    <h4>Placement Distribution</h4>
                    <div style={{height: 160, position: 'relative'}}>
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie data={[{name: 'Placed', value: 57}, {name: 'Not Placed', value: 43}]} innerRadius={45} outerRadius={70} dataKey="value" stroke="none">
                            <Cell fill="#10b981" />
                            <Cell fill="#ef4444" />
                          </Pie>
                        </PieChart>
                      </ResponsiveContainer>
                      <div style={{position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', textAlign: 'center'}}>
                        <div style={{fontWeight: 800, fontSize: 18}}>57%</div>
                        <div style={{fontSize: 11, color: 'var(--text-gray)'}}>Placed</div>
                      </div>
                    </div>
                  </div>
                  <div className="chart-box">
                    <h4>CGPA vs Placement Rate</h4>
                    <div style={{height: 160}}>
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={[{x:6, y:20}, {x:6.5, y:30}, {x:7, y:50}, {x:7.5, y:55}, {x:8, y:75}, {x:8.5, y:80}, {x:9, y:95}, {x:10, y:98}]}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                          <XAxis dataKey="x" tick={{fontSize: 11, fill: '#64748b'}} axisLine={false} tickLine={false} />
                          <YAxis tick={{fontSize: 11, fill: '#64748b'}} axisLine={false} tickLine={false} />
                          <Line type="monotone" dataKey="y" stroke="#5a5ce6" strokeWidth={3} dot={{r: 4, fill: '#5a5ce6'}} />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                  <div className="chart-box">
                    <h4>Branch-wise Placement Rate</h4>
                    <div style={{height: 160}}>
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={[{name: 'CSE', val: 67}, {name: 'IT', val: 61}, {name: 'ECE', val: 55}, {name: 'EEE', val: 48}, {name: 'ME', val: 44}, {name: 'CIVIL', val: 35}]}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                          <XAxis dataKey="name" tick={{fontSize: 10, fill: '#64748b'}} axisLine={false} tickLine={false} />
                          <YAxis tick={{fontSize: 11, fill: '#64748b'}} axisLine={false} tickLine={false} />
                          <Bar dataKey="val" radius={[4,4,0,0]} barSize={18}>
                            {
                              [{val: 67}, {val: 61}, {val: 55}, {val: 48}, {val: 44}, {val: 35}].map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={['#5a5ce6', '#8b5cf6', '#ec4899', '#3b82f6', '#06b6d4', '#10b981'][index]} />
                              ))
                            }
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right: Model Performance */}
              <div className="card" style={{background: '#fbfbfe', border: '1px solid #eef2ff', padding: '24px', display: 'flex', flexDirection: 'column', justifyContent: 'center'}}>
                <div style={{display: 'flex', alignItems: 'center', gap: 16}}>
                  <div style={{width: 48, height: 48, borderRadius: 12, background: 'var(--primary-light)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                    <Brain size={24}/>
                  </div>
                  <div style={{flex: 1}}>
                    <div style={{fontSize: 14, fontWeight: 700}}>Model Performance <span style={{fontWeight: 500, color: 'var(--text-gray)'}}>(Current Best Model)</span></div>
                    <div style={{display: 'flex', justifyContent: 'space-between', marginTop: 14}}>
                      <div><div style={{fontSize: 12, color: 'var(--text-gray)'}}>Accuracy</div><div style={{fontSize: 15, fontWeight: 800, marginTop: 4}}>91.3%</div></div>
                      <div><div style={{fontSize: 12, color: 'var(--text-gray)'}}>Precision</div><div style={{fontSize: 15, fontWeight: 800, marginTop: 4}}>90.8%</div></div>
                      <div><div style={{fontSize: 12, color: 'var(--text-gray)'}}>Recall</div><div style={{fontSize: 15, fontWeight: 800, marginTop: 4}}>89.7%</div></div>
                      <div><div style={{fontSize: 12, color: 'var(--text-gray)'}}>F1 Score</div><div style={{fontSize: 15, fontWeight: 800, marginTop: 4}}>90.2%</div></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <footer className="footer">
              <div className="quote"><Quote size={20} color="var(--primary)" opacity={0.5}/> <div>"The best way to predict the future is to create it."<br/><span style={{fontSize: 12, color: 'var(--text-gray)', marginTop: 4, display: 'inline-block'}}>— Peter Drucker</span></div></div>
              <div style={{display: 'flex', gap: 40}}>
                <div><div style={{fontSize: 12, color: 'var(--text-gray)'}}>Model Used</div><div style={{fontSize: 14, fontWeight: 600, marginTop: 4}}>XGBoost Classifier</div></div>
                <div><div style={{fontSize: 12, color: 'var(--text-gray)'}}>Trained On</div><div style={{fontSize: 14, fontWeight: 600, marginTop: 4}}>15,000+ Records</div></div>
                <div><div style={{fontSize: 12, color: 'var(--text-gray)'}}>Last Trained</div><div style={{fontSize: 14, fontWeight: 600, marginTop: 4}}>May 12, 2024</div></div>
                <div style={{display: 'flex', alignItems: 'center'}}><a href="#" onClick={(e) => { e.preventDefault(); showToast("Opening detailed ML Model specifics..."); }} style={{fontSize: 13, color: 'var(--primary)', textDecoration: 'none', fontWeight: 600}}>View Model Details →</a></div>
              </div>
            </footer>
          </>
        ) : activeTab === 'Students' ? (
          <StudentsTab />
        ) : activeTab === 'Analytics' ? (
          <AnalyticsTab />
        ) : activeTab === 'Batch Insights' ? (
          <BatchInsightsTab />
        ) : activeTab === 'Recommendations' ? (
          <RecommendationsTab />
        ) : activeTab === 'Model Performance' ? (
          <ModelPerformanceTab />
        ) : activeTab === 'Reports' ? (
          <ReportsTab />
        ) : activeTab === 'Data Management' ? (
          <DataManagementTab />
        ) : activeTab === 'Settings' ? (
          <SettingsTab />
        ) : activeTab === 'Prediction' ? (
          <PredictionTab 
             formData={formData} 
             setFormData={setFormData}
             handlePredict={handlePredict}
             predictionResult={predictionResult}
             setPredictionResult={setPredictionResult}
             isLoading={isLoading}
             isUploading={isUploading}
             handleFileUpload={handleFileUpload}
             fileInputRef={fileInputRef}
             wizardStep={wizardStep}
             setWizardStep={setWizardStep}
          />
        ) : (
          /* Placeholder for other pages */
          <div className="card" style={{minHeight: '60vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center'}}>
            <div style={{width: 64, height: 64, borderRadius: '50%', background: 'var(--primary-light)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 24}}>
              <Monitor size={32}/>
            </div>
            <h2 style={{fontSize: 24, fontWeight: 800, color: 'var(--text-dark)', marginBottom: 12}}>{activeTab} Page</h2>
            <p style={{color: 'var(--text-gray)', maxWidth: 400, textAlign: 'center', marginBottom: 32}}>
              This section is currently under development. Detailed {activeTab.toLowerCase()} data and analytics will be available here soon.
            </p>
            <button className="btn-primary" style={{width: 'auto'}} onClick={() => setActiveTab('Dashboard')}>
              Back to Dashboard
            </button>
          </div>
        )}
      </main>

      {/* Smart Form Modal (Massive Predictor Wizard) */}
      {isModalOpen && (
        <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{maxWidth: 750}}>
            <div style={{display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8}}>
              <h3 style={{fontWeight: 800, fontSize: 18}}>Comprehensive Prediction Profile</h3>
              <span style={{background: '#eef2ff', color: 'var(--primary)', padding: '2px 8px', borderRadius: 12, fontSize: 11, fontWeight: 700}}>50+ Params Supported</span>
            </div>
            <p style={{fontSize: 13, color: 'var(--text-gray)', marginBottom: 24}}>Please verify extracted info and fill in additional metrics to maximize prediction accuracy.</p>
            
            {/* Wizard Tabs */}
            <div style={{display: 'flex', gap: 10, borderBottom: '2px solid #f1f5f9', paddingBottom: 16, marginBottom: 24, overflowX: 'auto'}}>
              {['Academic Details', 'Technical Skills', 'Experience & Projects', 'Soft Skills'].map((step, idx) => (
                <div key={step} onClick={() => setWizardStep(idx+1)} style={{cursor: 'pointer', padding: '8px 14px', borderRadius: 20, fontSize: 13, fontWeight: 700, background: wizardStep === idx+1 ? 'var(--primary)' : '#f8fafc', color: wizardStep === idx+1 ? '#fff' : 'var(--text-gray)', transition: 'all 0.2s', whiteSpace: 'nowrap'}}>
                  {idx+1}. {step}
                </div>
              ))}
            </div>
            
            {/* Wizard Body */}
            <div className="modal-grid" style={{alignItems: 'flex-start'}}>
              {wizardStep === 1 && (
                <>
                  <div><label style={{fontSize: 12, fontWeight: 600, color: 'var(--text-dark)', marginBottom: 4, display: 'block'}}>Branch</label><select className="modal-input" value={formData.branch} onChange={e=>setFormData({...formData, branch: e.target.value})}><option>CSE</option><option>IT</option><option>ECE</option><option>ME</option><option>CIVIL</option></select></div>
                  <div><label style={{fontSize: 12, fontWeight: 600, color: 'var(--text-dark)', marginBottom: 4, display: 'block'}}>CGPA (Out of 10)</label><input type="number" className="modal-input" value={formData.cgpa} onChange={e=>setFormData({...formData, cgpa: parseFloat(e.target.value)||0})} /></div>
                  <div><label style={{fontSize: 12, fontWeight: 600, color: 'var(--text-dark)', marginBottom: 4, display: 'block'}}>10th Percentage</label><input type="number" className="modal-input" value={formData.tenth_percentage} onChange={e=>setFormData({...formData, tenth_percentage: parseFloat(e.target.value)||0})} /></div>
                  <div><label style={{fontSize: 12, fontWeight: 600, color: 'var(--text-dark)', marginBottom: 4, display: 'block'}}>12th Percentage</label><input type="number" className="modal-input" value={formData.twelfth_percentage} onChange={e=>setFormData({...formData, twelfth_percentage: parseFloat(e.target.value)||0})} /></div>
                  <div><label style={{fontSize: 12, fontWeight: 600, color: 'var(--text-dark)', marginBottom: 4, display: 'block'}}>Active Backlogs</label><input type="number" className="modal-input" value={formData.backlogs} onChange={e=>setFormData({...formData, backlogs: parseInt(e.target.value)||0})} /></div>
                </>
              )}
              {wizardStep === 2 && (
                <>
                  <div><label style={{fontSize: 12, fontWeight: 600, color: 'var(--text-dark)', marginBottom: 4, display: 'block'}}>Coding Skills (1-10)</label><input type="number" className="modal-input" value={formData.coding_skills} onChange={e=>setFormData({...formData, coding_skills: parseFloat(e.target.value)||0})} /></div>
                  <div><label style={{fontSize: 12, fontWeight: 600, color: 'var(--text-dark)', marginBottom: 4, display: 'block'}}>DSA Score (1-10)</label><input type="number" className="modal-input" value={formData.dsa_score} onChange={e=>setFormData({...formData, dsa_score: parseFloat(e.target.value)||0})} /></div>
                  <div><label style={{fontSize: 12, fontWeight: 600, color: 'var(--text-dark)', marginBottom: 4, display: 'block'}}>ML Knowledge (1-10)</label><input type="number" className="modal-input" value={formData.ml_knowledge} onChange={e=>setFormData({...formData, ml_knowledge: parseFloat(e.target.value)||0})} /></div>
                  <div><label style={{fontSize: 12, fontWeight: 600, color: 'var(--text-dark)', marginBottom: 4, display: 'block'}}>System Design (1-10)</label><input type="number" className="modal-input" value={formData.system_design} onChange={e=>setFormData({...formData, system_design: parseFloat(e.target.value)||0})} /></div>
                  <div><label style={{fontSize: 12, fontWeight: 600, color: 'var(--text-dark)', marginBottom: 4, display: 'block'}}>LeetCode Problems Solved</label><input type="number" className="modal-input" value={formData.leetcode_solved} onChange={e=>setFormData({...formData, leetcode_solved: parseInt(e.target.value)||0})} /></div>
                  
                  <div style={{gridColumn: '1 / -1', marginTop: 12}}>
                    <label style={{fontSize: 12, fontWeight: 600, color: 'var(--text-dark)', marginBottom: 8, display: 'block'}}>Known Technologies (Check all that apply)</label>
                    <div style={{display: 'flex', gap: 12, flexWrap: 'wrap'}}>
                      {['python', 'java', 'cpp', 'react', 'devops', 'sql'].map(tech => (
                        <label key={tech} style={{display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, background: formData[tech] ? '#eef2ff' : '#f8fafc', color: formData[tech] ? 'var(--primary)' : 'var(--text-gray)', padding: '8px 14px', borderRadius: 8, border: `1px solid ${formData[tech] ? 'var(--primary)' : '#e2e8f0'}`, cursor: 'pointer', fontWeight: 600}}>
                          <input type="checkbox" style={{accentColor: 'var(--primary)'}} checked={formData[tech]} onChange={e=>setFormData({...formData, [tech]: e.target.checked})} /> {tech.toUpperCase()}
                        </label>
                      ))}
                    </div>
                  </div>
                </>
              )}
              {wizardStep === 3 && (
                <>
                  <div><label style={{fontSize: 12, fontWeight: 600, color: 'var(--text-dark)', marginBottom: 4, display: 'block'}}>Internships Completed</label><input type="number" className="modal-input" value={formData.internships} onChange={e=>setFormData({...formData, internships: parseInt(e.target.value)||0})} /></div>
                  <div><label style={{fontSize: 12, fontWeight: 600, color: 'var(--text-dark)', marginBottom: 4, display: 'block'}}>Projects Built</label><input type="number" className="modal-input" value={formData.projects_count} onChange={e=>setFormData({...formData, projects_count: parseInt(e.target.value)||0})} /></div>
                  <div><label style={{fontSize: 12, fontWeight: 600, color: 'var(--text-dark)', marginBottom: 4, display: 'block'}}>Hackathons Participated</label><input type="number" className="modal-input" value={formData.hackathons} onChange={e=>setFormData({...formData, hackathons: parseInt(e.target.value)||0})} /></div>
                  <div><label style={{fontSize: 12, fontWeight: 600, color: 'var(--text-dark)', marginBottom: 4, display: 'block'}}>Open Source PRs Merged</label><input type="number" className="modal-input" value={formData.open_source_contributions} onChange={e=>setFormData({...formData, open_source_contributions: parseInt(e.target.value)||0})} /></div>
                  <div><label style={{fontSize: 12, fontWeight: 600, color: 'var(--text-dark)', marginBottom: 4, display: 'block'}}>Professional Certifications</label><input type="number" className="modal-input" value={formData.certifications} onChange={e=>setFormData({...formData, certifications: parseInt(e.target.value)||0})} /></div>
                </>
              )}
              {wizardStep === 4 && (
                <>
                  <div><label style={{fontSize: 12, fontWeight: 600, color: 'var(--text-dark)', marginBottom: 4, display: 'block'}}>Aptitude Score (1-100)</label><input type="number" className="modal-input" value={formData.aptitude_score} onChange={e=>setFormData({...formData, aptitude_score: parseFloat(e.target.value)||0})} /></div>
                  <div><label style={{fontSize: 12, fontWeight: 600, color: 'var(--text-dark)', marginBottom: 4, display: 'block'}}>Communication Skills (1-10)</label><input type="number" className="modal-input" value={formData.communication_skills} onChange={e=>setFormData({...formData, communication_skills: parseFloat(e.target.value)||0})} /></div>
                  <div><label style={{fontSize: 12, fontWeight: 600, color: 'var(--text-dark)', marginBottom: 4, display: 'block'}}>Teamwork Rating (1-10)</label><input type="number" className="modal-input" value={formData.teamwork_rating} onChange={e=>setFormData({...formData, teamwork_rating: parseFloat(e.target.value)||0})} /></div>
                  <div><label style={{fontSize: 12, fontWeight: 600, color: 'var(--text-dark)', marginBottom: 4, display: 'block'}}>Problem Solving (1-10)</label><input type="number" className="modal-input" value={formData.problem_solving_rating} onChange={e=>setFormData({...formData, problem_solving_rating: parseFloat(e.target.value)||0})} /></div>
                </>
              )}
            </div>

            <div style={{display: 'flex', justifyContent: 'space-between', marginTop: 36, paddingTop: 20, borderTop: '1px solid #f1f5f9'}}>
               <button className="btn-secondary" disabled={wizardStep === 1} onClick={() => setWizardStep(prev => prev-1)}>← Previous Step</button>
               {wizardStep < 4 ? (
                 <button className="btn-primary" onClick={() => setWizardStep(prev => prev+1)}>Next Step →</button>
               ) : (
                 <button className="btn-primary" onClick={() => handlePredict(formData)} disabled={isLoading}>
                    {isLoading ? 'Running Prediction Engine...' : 'Confirm & Predict Placement'}
                 </button>
               )}
            </div>
          </div>
        </div>
      )}

      {/* Global Toast Notification */}
      {toastMsg && (
        <div className="toast">
          {toastMsg}
        </div>
      )}
    </div>
  );
}

function MetricCard({ icon, bg, color, title, val, percent, desc, hidePercent }) {
  return (
    <div className="metric-card">
      <div className="metric-icon-wrap" style={{background: bg, color: color}}>{icon}</div>
      <div style={{ minWidth: 0, overflow: 'hidden' }}>
        <div style={{fontSize: 12, color: 'var(--text-gray)', marginBottom: 4, fontWeight: 600, whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden'}}>{title}</div>
        <div style={{display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap'}}>
          <div style={{fontSize: 18, fontWeight: 800, color: 'var(--text-dark)', whiteSpace: 'nowrap'}}>{val}</div>
          {!hidePercent && <div style={{fontSize: 11, color: '#10b981', fontWeight: 700, display: 'flex', alignItems: 'center', whiteSpace: 'nowrap'}}><TrendingUp size={12} style={{marginRight: 4}}/> {percent}</div>}
        </div>
        <div style={{fontSize: 11, color: 'var(--text-muted)', marginTop: 2, fontWeight: 500, whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden'}}>{desc || 'vs last month'}</div>
      </div>
    </div>
  );
}

function SkillRow({ icon, c, label, val, max, displayVal }) {
  const p = Math.min(100, (val/max)*100);
  return (
    <div className="skill-row">
      <div className="skill-icon" style={{color: c, background: `${c}15`, padding: 6, borderRadius: 8, display: 'flex'}}>{icon}</div>
      <div className="skill-label">{label}</div>
      <div className="skill-bar"><div className="skill-fill" style={{width: `${p}%`, background: c}}></div></div>
      <div className="skill-val">{displayVal?.toFixed(1) || val?.toFixed(1)}/10</div>
    </div>
  );
}

function StudentsTab() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStu, setSelectedStu] = useState(null);
  
  const mockStudents = [
    { 
      id: 'STU001', name: 'Aarav Sharma', branch: 'CSE', cgpa: 8.9, prob: 92, status: 'Placed', role: 'Software Engineer', 
      img: 'https://ui-avatars.com/api/?name=Aarav+Sharma&background=0D8ABC&color=fff',
      result: {
        strong_areas: [{title: "Excellent CGPA", desc: "8.9 CGPA is very competitive."}, {title: "Strong Coding Skills", desc: "Proficient in Java & React."}],
        needs_improvement: [{title: "Aptitude Score", desc: "Can improve quantitative skills."}],
        career_matches: [{role: 'Software Engineer', match: 92}, {role: 'Data Analyst', match: 81}]
      }
    },
    { 
      id: 'STU002', name: 'Priya Patel', branch: 'IT', cgpa: 7.8, prob: 65, status: 'Unplaced', role: 'Data Analyst', 
      img: 'https://ui-avatars.com/api/?name=Priya+Patel&background=F59E0B&color=fff',
      result: {
        strong_areas: [{title: "Good Communication", desc: "Strong soft skills for analyst roles."}],
        needs_improvement: [{title: "Low Projects Count", desc: "Needs more portfolio projects."}, {title: "DSA Score", desc: "Needs improvement for technical rounds."}],
        career_matches: [{role: 'Data Analyst', match: 72}, {role: 'Software Engineer', match: 58}]
      }
    },
    { 
      id: 'STU003', name: 'Rohan Gupta', branch: 'ECE', cgpa: 8.2, prob: 88, status: 'Placed', role: 'ML Engineer', 
      img: 'https://ui-avatars.com/api/?name=Rohan+Gupta&background=10B981&color=fff',
      result: {
        strong_areas: [{title: "High ML Knowledge", desc: "Strong grasp of Deep Learning."}, {title: "Math Background", desc: "Great for Data Science."}],
        needs_improvement: [],
        career_matches: [{role: 'ML Engineer', match: 88}, {role: 'Data Analyst', match: 83}]
      }
    },
    { 
      id: 'STU004', name: 'Sneha Reddy', branch: 'CSE', cgpa: 9.1, prob: 96, status: 'Placed', role: 'Software Engineer', 
      img: 'https://ui-avatars.com/api/?name=Sneha+Reddy&background=EC4899&color=fff',
      result: {
        strong_areas: [{title: "Perfect DSA Score", desc: "Excellent problem solving."}, {title: "Multiple Internships", desc: "2+ industry experiences."}],
        needs_improvement: [],
        career_matches: [{role: 'Software Engineer', match: 96}, {role: 'Business Analyst', match: 60}]
      }
    },
    { 
      id: 'STU005', name: 'Vikram Singh', branch: 'ME', cgpa: 7.1, prob: 42, status: 'Unplaced', role: 'Business Analyst', 
      img: 'https://ui-avatars.com/api/?name=Vikram+Singh&background=6366F1&color=fff',
      result: {
        strong_areas: [{title: "Leadership", desc: "President of the robotics club."}],
        needs_improvement: [{title: "Technical Skills", desc: "Needs to learn modern software stacks."}],
        career_matches: [{role: 'Business Analyst', match: 65}, {role: 'Data Analyst', match: 55}]
      }
    },
    { 
      id: 'STU007', name: 'Karan Desai', branch: 'CSE', cgpa: 6.8, prob: 35, status: 'At Risk', role: 'QA Engineer', 
      img: 'https://ui-avatars.com/api/?name=Karan+Desai&background=EF4444&color=fff',
      result: {
        strong_areas: [{title: "Active in Clubs", desc: "Good organizational skills."}],
        needs_improvement: [{title: "Low CGPA", desc: "Below the 7.0 cutoff for many companies."}, {title: "Poor Coding Skills", desc: "Needs urgent technical training."}],
        career_matches: [{role: 'QA Engineer', match: 55}, {role: 'Software Engineer', match: 35}]
      }
    },
  ];

  const filtered = mockStudents.filter(s => s.name.toLowerCase().includes(searchTerm.toLowerCase()) || s.id.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="card" style={{padding: '24px'}}>
      <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24}}>
        <div>
          <h2 style={{fontSize: 20, fontWeight: 800, color: 'var(--text-dark)'}}>Student Directory</h2>
          <p style={{fontSize: 13, color: 'var(--text-gray)', marginTop: 4}}>Manage and view AI predictions for all registered students.</p>
        </div>
        <div className="search-box" style={{width: 300, background: '#f8fafc'}}>
          <Search size={16} color="var(--text-muted)"/>
          <input 
            placeholder="Search by name or ID..." 
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="table-container">
        <table className="students-table">
          <thead>
            <tr>
              <th>Student Details</th>
              <th>Branch</th>
              <th>CGPA</th>
              <th>Predicted Role</th>
              <th>AI Probability</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(stu => (
              <tr key={stu.id}>
                <td>
                  <div style={{display: 'flex', alignItems: 'center', gap: 12}}>
                    <img src={stu.img} alt={stu.name} style={{width: 36, height: 36, borderRadius: '50%'}} />
                    <div>
                      <div style={{fontWeight: 700, color: 'var(--text-dark)', fontSize: 13}}>{stu.name}</div>
                      <div style={{fontSize: 11, color: 'var(--text-muted)'}}>{stu.id}</div>
                    </div>
                  </div>
                </td>
                <td><span className="branch-badge">{stu.branch}</span></td>
                <td style={{fontWeight: 700, color: 'var(--text-dark)'}}>{stu.cgpa}</td>
                <td style={{fontSize: 13, color: 'var(--text-gray)', fontWeight: 500}}>{stu.role}</td>
                <td>
                  <div style={{display: 'flex', alignItems: 'center', gap: 8}}>
                    <div className="prob-bar-bg" style={{width: 60, height: 6, background: '#f1f5f9', borderRadius: 3}}>
                      <div className="prob-bar-fill" style={{width: `${stu.prob}%`, height: '100%', background: stu.prob > 80 ? '#10b981' : stu.prob > 50 ? '#f59e0b' : '#ef4444', borderRadius: 3}}></div>
                    </div>
                    <span style={{fontSize: 12, fontWeight: 700, color: stu.prob > 80 ? '#10b981' : stu.prob > 50 ? '#f59e0b' : '#ef4444'}}>{stu.prob}%</span>
                  </div>
                </td>
                <td>
                  <span className={`status-badge ${stu.status.toLowerCase().replace(' ', '-')}`}>
                    {stu.status}
                  </span>
                </td>
                <td>
                  <button className="btn-secondary" style={{padding: '6px 12px', fontSize: 11}} onClick={() => setSelectedStu(stu)}>View Profile</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && <div style={{padding: 40, textAlign: 'center', color: 'var(--text-muted)', fontSize: 14}}>No students found.</div>}
      </div>

      {selectedStu && (
        <div className="modal-overlay" onClick={() => setSelectedStu(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{maxWidth: 700}}>
            <div style={{display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24, borderBottom: '1px solid #f1f5f9', paddingBottom: 16}}>
               <img src={selectedStu.img} alt="img" style={{width: 56, height: 56, borderRadius: '50%'}} />
               <div>
                  <h3 style={{fontWeight: 800, fontSize: 20}}>{selectedStu.name} - AI Analysis</h3>
                  <div style={{fontSize: 13, color: 'var(--text-gray)', marginTop: 4}}>{selectedStu.branch} | CGPA: {selectedStu.cgpa} | ID: {selectedStu.id}</div>
               </div>
               <div style={{marginLeft: 'auto'}}>
                 <div style={{fontSize: 24, fontWeight: 800, color: selectedStu.prob > 80 ? '#10b981' : selectedStu.prob > 50 ? '#f59e0b' : '#ef4444'}}>{selectedStu.prob}%</div>
                 <div style={{fontSize: 11, fontWeight: 700, color: 'var(--text-gray)'}}>Placement Probability</div>
               </div>
            </div>
            
            <div className="explainable-ai-grid" style={{marginBottom: 24}}>
              <div className="strength-box">
                <div className="box-title" style={{color: '#10b981'}}><CheckCircle size={16}/> Strong Areas</div>
                <div className="box-items">
                  {selectedStu.result.strong_areas.map((item, i) => (
                    <div key={i} className="explain-item">
                      <div className="explain-title">{item.title}</div>
                      <div className="explain-desc">{item.desc}</div>
                    </div>
                  ))}
                  {selectedStu.result.strong_areas.length === 0 && <div className="explain-desc">No major strong areas identified.</div>}
                </div>
              </div>
              
              <div className="weakness-box">
                <div className="box-title" style={{color: '#ef4444'}}><XCircle size={16}/> Needs Improvement</div>
                <div className="box-items">
                  {selectedStu.result.needs_improvement.map((item, i) => (
                    <div key={i} className="explain-item">
                      <div className="explain-title">{item.title}</div>
                      <div className="explain-desc">{item.desc}</div>
                    </div>
                  ))}
                  {selectedStu.result.needs_improvement.length === 0 && <div className="explain-desc">Profile is well-rounded!</div>}
                </div>
              </div>
            </div>
            
            <div style={{marginTop: 24}}>
              <div className="box-title" style={{color: 'var(--text-dark)', marginBottom: 16}}><Briefcase size={16}/> Recruiter Match Scores</div>
              <div className="career-match-list">
                {selectedStu.result.career_matches.map((role, i) => (
                  <div key={i} className="career-match-item">
                    <div className="role-header">
                      <span className="role-name">{role.role}</span>
                      <span className="role-score">{role.match}% Match</span>
                    </div>
                    <div className="match-bar-bg">
                      <div className="match-bar-fill" style={{width: `${role.match}%`, background: role.match > 90 ? '#10b981' : role.match > 80 ? '#f59e0b' : '#3b82f6'}}></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <button className="btn-secondary" style={{width: '100%', marginTop: 24}} onClick={() => setSelectedStu(null)}>Close Profile</button>
          </div>
        </div>
      )}
    </div>
  );
}

function PredictionTab({ 
  formData, setFormData, handlePredict, predictionResult, setPredictionResult, 
  isLoading, isUploading, handleFileUpload, fileInputRef, wizardStep, setWizardStep 
}) {
  return (
    <div style={{animation: 'fadeIn 0.5s ease-out'}}>
      <div style={{marginBottom: 32}}>
        <h2 style={{fontSize: 28, fontWeight: 800, color: 'var(--text-dark)'}}>AI Placement Predictor Engine</h2>
        <p style={{fontSize: 14, color: 'var(--text-gray)', marginTop: 8}}>Upload a resume to let our AI auto-fill the fields, or manually enter the 50+ parameters for a highly accurate placement probability.</p>
      </div>

      <div style={{display: 'flex', gap: 24, flexDirection: 'column'}}>
        {/* Top: Smart Resume Parsing Card */}
        <div className="card" style={{background: 'linear-gradient(135deg, #eef2ff 0%, #ffffff 100%)', border: '1px solid #e0e7ff'}}>
          <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
            <div>
              <h3 style={{fontSize: 18, fontWeight: 800, color: 'var(--primary)'}}>Step 1: Auto-Fill via Resume AI</h3>
              <p style={{fontSize: 13, color: 'var(--text-gray)', marginTop: 6, maxWidth: 500}}>Our NLP engine automatically extracts your skills, education, and projects directly from your resume and fills the 50-parameter form below.</p>
            </div>
            
            <input type="file" accept=".pdf" style={{display: 'none'}} ref={fileInputRef} onChange={handleFileUpload} />
            <button className="btn-primary" style={{padding: '12px 24px', fontSize: 14, boxShadow: '0 8px 16px rgba(90, 92, 230, 0.2)'}} onClick={() => fileInputRef.current.click()} disabled={isUploading}>
              {isUploading ? 'Analyzing Document with AI...' : <><UploadCloud size={18}/> Upload PDF Resume</>}
            </button>
          </div>
        </div>

        {/* Bottom: The Massive 50-Field Wizard */}
        <div className="card">
          <div style={{display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8}}>
            <h3 style={{fontWeight: 800, fontSize: 18}}>Step 2: Comprehensive Profile Verification</h3>
            <span style={{background: '#eef2ff', color: 'var(--primary)', padding: '2px 8px', borderRadius: 12, fontSize: 11, fontWeight: 700}}>50+ Params</span>
          </div>
          <p style={{fontSize: 13, color: 'var(--text-gray)', marginBottom: 24}}>Please verify the extracted information and fill any gaps to maximize prediction accuracy.</p>
          
          {/* Wizard Tabs */}
          <div style={{display: 'flex', gap: 10, borderBottom: '2px solid #f1f5f9', paddingBottom: 16, marginBottom: 24, overflowX: 'auto'}}>
            {['Academic Details', 'Technical Skills', 'Experience & Projects', 'Soft Skills'].map((step, idx) => (
              <div key={step} onClick={() => setWizardStep(idx+1)} style={{cursor: 'pointer', padding: '10px 18px', borderRadius: 24, fontSize: 13, fontWeight: 700, background: wizardStep === idx+1 ? 'var(--primary)' : '#f8fafc', color: wizardStep === idx+1 ? '#fff' : 'var(--text-gray)', transition: 'all 0.2s', whiteSpace: 'nowrap'}}>
                {idx+1}. {step}
              </div>
            ))}
          </div>
          
          {/* Wizard Body */}
          <div className="modal-grid" style={{alignItems: 'flex-start'}}>
            {wizardStep === 1 && (
              <>
                <div><label style={{fontSize: 12, fontWeight: 600, color: 'var(--text-dark)', marginBottom: 4, display: 'block'}}>Branch</label><select className="modal-input" value={formData.branch} onChange={e=>setFormData({...formData, branch: e.target.value})}><option>CSE</option><option>IT</option><option>ECE</option><option>ME</option><option>CIVIL</option></select></div>
                <div><label style={{fontSize: 12, fontWeight: 600, color: 'var(--text-dark)', marginBottom: 4, display: 'block'}}>CGPA (Out of 10)</label><input type="number" className="modal-input" value={formData.cgpa} onChange={e=>setFormData({...formData, cgpa: parseFloat(e.target.value)||0})} /></div>
                <div><label style={{fontSize: 12, fontWeight: 600, color: 'var(--text-dark)', marginBottom: 4, display: 'block'}}>10th Percentage</label><input type="number" className="modal-input" value={formData.tenth_percentage} onChange={e=>setFormData({...formData, tenth_percentage: parseFloat(e.target.value)||0})} /></div>
                <div><label style={{fontSize: 12, fontWeight: 600, color: 'var(--text-dark)', marginBottom: 4, display: 'block'}}>12th Percentage</label><input type="number" className="modal-input" value={formData.twelfth_percentage} onChange={e=>setFormData({...formData, twelfth_percentage: parseFloat(e.target.value)||0})} /></div>
                <div><label style={{fontSize: 12, fontWeight: 600, color: 'var(--text-dark)', marginBottom: 4, display: 'block'}}>Active Backlogs</label><input type="number" className="modal-input" value={formData.backlogs} onChange={e=>setFormData({...formData, backlogs: parseInt(e.target.value)||0})} /></div>
              </>
            )}
            {wizardStep === 2 && (
              <>
                <div><label style={{fontSize: 12, fontWeight: 600, color: 'var(--text-dark)', marginBottom: 4, display: 'block'}}>Coding Skills (1-10)</label><input type="number" className="modal-input" value={formData.coding_skills} onChange={e=>setFormData({...formData, coding_skills: parseFloat(e.target.value)||0})} /></div>
                <div><label style={{fontSize: 12, fontWeight: 600, color: 'var(--text-dark)', marginBottom: 4, display: 'block'}}>DSA Score (1-10)</label><input type="number" className="modal-input" value={formData.dsa_score} onChange={e=>setFormData({...formData, dsa_score: parseFloat(e.target.value)||0})} /></div>
                <div><label style={{fontSize: 12, fontWeight: 600, color: 'var(--text-dark)', marginBottom: 4, display: 'block'}}>ML Knowledge (1-10)</label><input type="number" className="modal-input" value={formData.ml_knowledge} onChange={e=>setFormData({...formData, ml_knowledge: parseFloat(e.target.value)||0})} /></div>
                <div><label style={{fontSize: 12, fontWeight: 600, color: 'var(--text-dark)', marginBottom: 4, display: 'block'}}>System Design (1-10)</label><input type="number" className="modal-input" value={formData.system_design} onChange={e=>setFormData({...formData, system_design: parseFloat(e.target.value)||0})} /></div>
                <div><label style={{fontSize: 12, fontWeight: 600, color: 'var(--text-dark)', marginBottom: 4, display: 'block'}}>LeetCode Problems Solved</label><input type="number" className="modal-input" value={formData.leetcode_solved} onChange={e=>setFormData({...formData, leetcode_solved: parseInt(e.target.value)||0})} /></div>
                
                <div style={{gridColumn: '1 / -1', marginTop: 12}}>
                  <label style={{fontSize: 12, fontWeight: 600, color: 'var(--text-dark)', marginBottom: 8, display: 'block'}}>Known Technologies (Check all that apply)</label>
                  <div style={{display: 'flex', gap: 12, flexWrap: 'wrap'}}>
                    {['python', 'java', 'cpp', 'react', 'devops', 'sql'].map(tech => (
                      <label key={tech} style={{display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, background: formData[tech] ? '#eef2ff' : '#f8fafc', color: formData[tech] ? 'var(--primary)' : 'var(--text-gray)', padding: '8px 14px', borderRadius: 8, border: `1px solid ${formData[tech] ? 'var(--primary)' : '#e2e8f0'}`, cursor: 'pointer', fontWeight: 600}}>
                        <input type="checkbox" style={{accentColor: 'var(--primary)'}} checked={formData[tech]} onChange={e=>setFormData({...formData, [tech]: e.target.checked})} /> {tech.toUpperCase()}
                      </label>
                    ))}
                  </div>
                </div>
              </>
            )}
            {wizardStep === 3 && (
              <>
                <div><label style={{fontSize: 12, fontWeight: 600, color: 'var(--text-dark)', marginBottom: 4, display: 'block'}}>Internships Completed</label><input type="number" className="modal-input" value={formData.internships} onChange={e=>setFormData({...formData, internships: parseInt(e.target.value)||0})} /></div>
                <div><label style={{fontSize: 12, fontWeight: 600, color: 'var(--text-dark)', marginBottom: 4, display: 'block'}}>Projects Built</label><input type="number" className="modal-input" value={formData.projects_count} onChange={e=>setFormData({...formData, projects_count: parseInt(e.target.value)||0})} /></div>
                <div><label style={{fontSize: 12, fontWeight: 600, color: 'var(--text-dark)', marginBottom: 4, display: 'block'}}>Hackathons Participated</label><input type="number" className="modal-input" value={formData.hackathons} onChange={e=>setFormData({...formData, hackathons: parseInt(e.target.value)||0})} /></div>
                <div><label style={{fontSize: 12, fontWeight: 600, color: 'var(--text-dark)', marginBottom: 4, display: 'block'}}>Open Source PRs Merged</label><input type="number" className="modal-input" value={formData.open_source_contributions} onChange={e=>setFormData({...formData, open_source_contributions: parseInt(e.target.value)||0})} /></div>
                <div><label style={{fontSize: 12, fontWeight: 600, color: 'var(--text-dark)', marginBottom: 4, display: 'block'}}>Professional Certifications</label><input type="number" className="modal-input" value={formData.certifications} onChange={e=>setFormData({...formData, certifications: parseInt(e.target.value)||0})} /></div>
              </>
            )}
            {wizardStep === 4 && (
              <>
                <div><label style={{fontSize: 12, fontWeight: 600, color: 'var(--text-dark)', marginBottom: 4, display: 'block'}}>Aptitude Score (1-100)</label><input type="number" className="modal-input" value={formData.aptitude_score} onChange={e=>setFormData({...formData, aptitude_score: parseFloat(e.target.value)||0})} /></div>
                <div><label style={{fontSize: 12, fontWeight: 600, color: 'var(--text-dark)', marginBottom: 4, display: 'block'}}>Communication Skills (1-10)</label><input type="number" className="modal-input" value={formData.communication_skills} onChange={e=>setFormData({...formData, communication_skills: parseFloat(e.target.value)||0})} /></div>
                <div><label style={{fontSize: 12, fontWeight: 600, color: 'var(--text-dark)', marginBottom: 4, display: 'block'}}>Teamwork Rating (1-10)</label><input type="number" className="modal-input" value={formData.teamwork_rating} onChange={e=>setFormData({...formData, teamwork_rating: parseFloat(e.target.value)||0})} /></div>
                <div><label style={{fontSize: 12, fontWeight: 600, color: 'var(--text-dark)', marginBottom: 4, display: 'block'}}>Problem Solving (1-10)</label><input type="number" className="modal-input" value={formData.problem_solving_rating} onChange={e=>setFormData({...formData, problem_solving_rating: parseFloat(e.target.value)||0})} /></div>
              </>
            )}
          </div>

          <div style={{display: 'flex', justifyContent: 'space-between', marginTop: 40, paddingTop: 24, borderTop: '1px solid #f1f5f9'}}>
             <button className="btn-secondary" style={{padding: '12px 24px', fontSize: 14}} disabled={wizardStep === 1} onClick={() => setWizardStep(prev => prev-1)}>← Previous Step</button>
             {wizardStep < 4 ? (
               <button className="btn-primary" style={{padding: '12px 24px', fontSize: 14}} onClick={() => setWizardStep(prev => prev+1)}>Next Step →</button>
             ) : (
               <button className="btn-primary" style={{padding: '12px 24px', fontSize: 14, background: '#10b981', borderColor: '#10b981', color: 'white'}} onClick={() => handlePredict(formData)} disabled={isLoading}>
                  {isLoading ? 'Running Prediction Engine...' : <div style={{display: 'flex', alignItems: 'center', gap: 8}}><Zap size={18}/> Predict Placement Result</div>}
               </button>
             )}
          </div>
        </div>

      </div>
    </div>
  );
}

function AnalyticsTab() {
  const salaryData = [
    { range: '< 5 LPA', count: 120 },
    { range: '5-8 LPA', count: 450 },
    { range: '8-12 LPA', count: 320 },
    { range: '12-18 LPA', count: 180 },
    { range: '18-25 LPA', count: 65 },
    { range: '25+ LPA', count: 25 },
  ];

  const trendData = [
    { year: '2019', placed: 65, average: 4.5 },
    { year: '2020', placed: 68, average: 5.2 },
    { year: '2021', placed: 75, average: 6.8 },
    { year: '2022', placed: 82, average: 7.5 },
    { year: '2023', placed: 88, average: 8.2 },
    { year: '2024', placed: 92, average: 9.1 },
  ];

  const companyData = [
    { name: 'Product Based', value: 45 },
    { name: 'Service Based', value: 35 },
    { name: 'Startups', value: 15 },
    { name: 'Consulting', value: 5 },
  ];
  
  const COLORS = ['#5a5ce6', '#10b981', '#f59e0b', '#ec4899'];

  return (
    <div style={{animation: 'fadeIn 0.5s ease-out'}}>
      <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 32}}>
        <div>
          <h2 style={{fontSize: 28, fontWeight: 800, color: 'var(--text-dark)'}}>Advanced Analytics</h2>
          <p style={{fontSize: 14, color: 'var(--text-gray)', marginTop: 8}}>Deep dive into placement trends, salary distributions, and historical data.</p>
        </div>
        <div style={{display: 'flex', gap: 12}}>
          <select className="modal-input" style={{width: 150}}><option>Batch 2024</option><option>Batch 2023</option><option>All Time</option></select>
          <button className="btn-primary" style={{padding: '0 20px'}}><Activity size={16} style={{marginRight: 8}}/> Export Report</button>
        </div>
      </div>

      <div className="responsive-grid-4" style={{, marginBottom: 24}}>
        <div className="card" style={{padding: 24, borderTop: '4px solid #5a5ce6'}}>
          <div style={{fontSize: 13, color: 'var(--text-gray)', fontWeight: 600}}>Highest Package</div>
          <div style={{fontSize: 28, fontWeight: 800, color: 'var(--text-dark)', marginTop: 8}}>₹ 42.5<span style={{fontSize: 16, color: 'var(--text-muted)'}}> LPA</span></div>
          <div style={{fontSize: 12, color: '#10b981', marginTop: 8, fontWeight: 700}}>↑ 12% from last year</div>
        </div>
        <div className="card" style={{padding: 24, borderTop: '4px solid #10b981'}}>
          <div style={{fontSize: 13, color: 'var(--text-gray)', fontWeight: 600}}>Average Package</div>
          <div style={{fontSize: 28, fontWeight: 800, color: 'var(--text-dark)', marginTop: 8}}>₹ 9.1<span style={{fontSize: 16, color: 'var(--text-muted)'}}> LPA</span></div>
          <div style={{fontSize: 12, color: '#10b981', marginTop: 8, fontWeight: 700}}>↑ 8% from last year</div>
        </div>
        <div className="card" style={{padding: 24, borderTop: '4px solid #f59e0b'}}>
          <div style={{fontSize: 13, color: 'var(--text-gray)', fontWeight: 600}}>Total Offers Made</div>
          <div style={{fontSize: 28, fontWeight: 800, color: 'var(--text-dark)', marginTop: 8}}>1,452</div>
          <div style={{fontSize: 12, color: '#10b981', marginTop: 8, fontWeight: 700}}>1.4 offers per student</div>
        </div>
        <div className="card" style={{padding: 24, borderTop: '4px solid #ec4899'}}>
          <div style={{fontSize: 13, color: 'var(--text-gray)', fontWeight: 600}}>Top Recruiting Sector</div>
          <div style={{fontSize: 28, fontWeight: 800, color: 'var(--text-dark)', marginTop: 8}}>FinTech</div>
          <div style={{fontSize: 12, color: 'var(--text-gray)', marginTop: 8, fontWeight: 600}}>32% of total placements</div>
        </div>
      </div>

      <div className="responsive-grid-2-asym" style={{, marginBottom: 24}}>
        <div className="card">
          <h3 style={{fontSize: 18, fontWeight: 800, marginBottom: 24}}>Placement & Salary Trends (2019-2024)</h3>
          <div style={{height: 350}}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorPlaced" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#5a5ce6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#5a5ce6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="year" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <Tooltip contentStyle={{borderRadius: 8, border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)'}} />
                <Legend verticalAlign="top" height={36} iconType="circle" />
                <Area type="monotone" dataKey="placed" name="Placement %" stroke="#5a5ce6" strokeWidth={3} fillOpacity={1} fill="url(#colorPlaced)" />
                <Area type="monotone" dataKey="average" name="Avg Salary (LPA)" stroke="#10b981" strokeWidth={3} fill="none" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card">
          <h3 style={{fontSize: 18, fontWeight: 800, marginBottom: 24}}>Company Categories</h3>
          <div style={{height: 300}}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={companyData} cx="50%" cy="50%" innerRadius={80} outerRadius={110} paddingAngle={5} dataKey="value" stroke="none">
                  {companyData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{borderRadius: 8, border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)'}} />
              </PieChart>
            </ResponsiveContainer>
            <div style={{display: 'flex', flexDirection: 'column', gap: 12, marginTop: 16}}>
              {companyData.map((entry, index) => (
                <div key={entry.name} style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                  <div style={{display: 'flex', alignItems: 'center', gap: 8}}>
                    <div style={{width: 10, height: 10, borderRadius: '50%', background: COLORS[index]}}></div>
                    <div style={{fontSize: 13, color: 'var(--text-gray)', fontWeight: 500}}>{entry.name}</div>
                  </div>
                  <div style={{fontSize: 13, fontWeight: 700, color: 'var(--text-dark)'}}>{entry.value}%</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="card">
        <h3 style={{fontSize: 18, fontWeight: 800, marginBottom: 24}}>Salary Distribution (Batch 2024)</h3>
        <div style={{height: 300}}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={salaryData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="range" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
              <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
              <Tooltip cursor={{fill: '#f8fafc'}} contentStyle={{borderRadius: 8, border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)'}} />
              <Bar dataKey="count" name="Number of Students" fill="#3b82f6" radius={[6, 6, 0, 0]} barSize={40}>
                {salaryData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={index > 3 ? '#10b981' : index > 1 ? '#3b82f6' : '#94a3b8'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

function BatchInsightsTab() {
  const skillGapData = [
    { subject: 'DSA', actual: 6.5, expected: 8.5 },
    { subject: 'System Design', actual: 4.2, expected: 7.0 },
    { subject: 'Web Dev', actual: 7.8, expected: 7.5 },
    { subject: 'Machine Learning', actual: 3.5, expected: 6.0 },
    { subject: 'Soft Skills', actual: 8.1, expected: 8.0 },
    { subject: 'Aptitude', actual: 6.8, expected: 8.0 },
  ];

  const atRiskStudents = [
    { id: 'STU089', name: 'Kabir Verma', branch: 'CIVIL', cgpa: 6.2, dsa: 3, prob: 28 },
    { id: 'STU142', name: 'Ananya Iyer', branch: 'ME', cgpa: 6.5, dsa: 4, prob: 34 },
    { id: 'STU205', name: 'Rahul Nair', branch: 'ECE', cgpa: 5.9, dsa: 5, prob: 41 },
  ];

  const topPerformers = [
    { id: 'STU012', name: 'Aisha Khan', branch: 'CSE', cgpa: 9.4, dsa: 9, prob: 98 },
    { id: 'STU034', name: 'Dhruv Patel', branch: 'IT', cgpa: 9.1, dsa: 8.5, prob: 95 },
    { id: 'STU077', name: 'Neha Sharma', branch: 'CSE', cgpa: 8.9, dsa: 9, prob: 93 },
  ];

  const branchData = [
    { name: 'CSE', avgCgpa: 8.1, avgDsa: 7.5, placementProb: 82 },
    { name: 'IT', avgCgpa: 7.8, avgDsa: 7.0, placementProb: 76 },
    { name: 'ECE', avgCgpa: 7.5, avgDsa: 6.2, placementProb: 65 },
    { name: 'ME', avgCgpa: 7.2, avgDsa: 4.5, placementProb: 45 },
    { name: 'CIVIL', avgCgpa: 7.0, avgDsa: 4.0, placementProb: 38 },
  ];

  return (
    <div style={{animation: 'fadeIn 0.5s ease-out'}}>
      <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 32}}>
        <div>
          <h2 style={{fontSize: 28, fontWeight: 800, color: 'var(--text-dark)'}}>Batch Insights</h2>
          <p style={{fontSize: 14, color: 'var(--text-gray)', marginTop: 8}}>Identify skill gaps, monitor at-risk students, and track batch-level performance metrics.</p>
        </div>
        <div style={{display: 'flex', gap: 12}}>
          <select className="modal-input" style={{width: 200}}>
            <option>Batch 2024 (Current)</option>
            <option>Batch 2023</option>
            <option>Batch 2022</option>
          </select>
        </div>
      </div>

      <div className="responsive-grid-2" style={{, marginBottom: 24}}>
        
        {/* Left: Skill Gap Radar */}
        <div className="card">
          <h3 style={{fontSize: 18, fontWeight: 800, marginBottom: 8}}>Skill Gap Analysis</h3>
          <p style={{fontSize: 13, color: 'var(--text-gray)', marginBottom: 24}}>Compare the current batch's average skills against industry expectations.</p>
          <div style={{height: 350}}>
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="70%" data={skillGapData}>
                <PolarGrid stroke="#e2e8f0" />
                <PolarAngleAxis dataKey="subject" tick={{fill: '#64748b', fontSize: 12}} />
                <PolarRadiusAxis angle={30} domain={[0, 10]} tick={{fill: '#94a3b8', fontSize: 10}} />
                <Radar name="Industry Expected" dataKey="expected" stroke="#10b981" fill="#10b981" fillOpacity={0.2} />
                <Radar name="Batch Actual" dataKey="actual" stroke="#5a5ce6" fill="#5a5ce6" fillOpacity={0.5} />
                <Tooltip contentStyle={{borderRadius: 8, border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)'}} />
                <Legend iconType="circle" />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right: Branch Performance Bar Chart */}
        <div className="card">
          <h3 style={{fontSize: 18, fontWeight: 800, marginBottom: 8}}>Branch-Wise Performance</h3>
          <p style={{fontSize: 13, color: 'var(--text-gray)', marginBottom: 24}}>Average CGPA vs DSA Scores across engineering branches.</p>
          <div style={{height: 350}}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={branchData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} domain={[0, 10]} />
                <Tooltip cursor={{fill: '#f8fafc'}} contentStyle={{borderRadius: 8, border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)'}} />
                <Legend iconType="circle" />
                <Bar dataKey="avgCgpa" name="Avg CGPA (out of 10)" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                <Bar dataKey="avgDsa" name="Avg DSA (out of 10)" fill="#ec4899" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Bottom Row: Actionable Student Lists */}
      <div className="responsive-grid-2">
        
        {/* At-Risk Students */}
        <div className="card" style={{borderTop: '4px solid #ef4444'}}>
          <div style={{display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8}}>
            <div style={{background: '#fee2e2', color: '#ef4444', padding: 8, borderRadius: 8}}><Shield size={20}/></div>
            <h3 style={{fontSize: 18, fontWeight: 800}}>At-Risk Intervention Needed</h3>
          </div>
          <p style={{fontSize: 13, color: 'var(--text-gray)', marginBottom: 24}}>Students with placement probability &lt; 45%. Require immediate technical training.</p>
          
          <div style={{display: 'flex', flexDirection: 'column', gap: 16}}>
            {atRiskStudents.map(stu => (
              <div key={stu.id} style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', background: '#f8fafc', borderRadius: 12, border: '1px solid #f1f5f9'}}>
                <div style={{display: 'flex', alignItems: 'center', gap: 12}}>
                  <img src={`https://ui-avatars.com/api/?name=${stu.name.replace(' ','+')}&background=ef4444&color=fff`} style={{width: 40, height: 40, borderRadius: '50%'}} alt="Avatar"/>
                  <div>
                    <div style={{fontWeight: 700, fontSize: 14, color: 'var(--text-dark)'}}>{stu.name}</div>
                    <div style={{fontSize: 12, color: 'var(--text-gray)'}}>{stu.branch} | CGPA: {stu.cgpa} | DSA: {stu.dsa}/10</div>
                  </div>
                </div>
                <div style={{textAlign: 'right'}}>
                  <div style={{fontSize: 18, fontWeight: 800, color: '#ef4444'}}>{stu.prob}%</div>
                  <div style={{fontSize: 11, color: 'var(--text-gray)', fontWeight: 600}}>Probability</div>
                </div>
              </div>
            ))}
          </div>
          <button className="btn-secondary" style={{width: '100%', marginTop: 24}}>View All At-Risk Students</button>
        </div>

        {/* Top Performers */}
        <div className="card" style={{borderTop: '4px solid #10b981'}}>
          <div style={{display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8}}>
            <div style={{background: '#d1fae5', color: '#10b981', padding: 8, borderRadius: 8}}><Award size={20}/></div>
            <h3 style={{fontSize: 18, fontWeight: 800}}>Top Batch Performers</h3>
          </div>
          <p style={{fontSize: 13, color: 'var(--text-gray)', marginBottom: 24}}>Top 1% students ready for Tier-1 Product Based Companies (Dream Offers).</p>
          
          <div style={{display: 'flex', flexDirection: 'column', gap: 16}}>
            {topPerformers.map(stu => (
              <div key={stu.id} style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', background: '#f8fafc', borderRadius: 12, border: '1px solid #f1f5f9'}}>
                <div style={{display: 'flex', alignItems: 'center', gap: 12}}>
                  <img src={`https://ui-avatars.com/api/?name=${stu.name.replace(' ','+')}&background=10b981&color=fff`} style={{width: 40, height: 40, borderRadius: '50%'}} alt="Avatar"/>
                  <div>
                    <div style={{fontWeight: 700, fontSize: 14, color: 'var(--text-dark)'}}>{stu.name}</div>
                    <div style={{fontSize: 12, color: 'var(--text-gray)'}}>{stu.branch} | CGPA: {stu.cgpa} | DSA: {stu.dsa}/10</div>
                  </div>
                </div>
                <div style={{textAlign: 'right'}}>
                  <div style={{fontSize: 18, fontWeight: 800, color: '#10b981'}}>{stu.prob}%</div>
                  <div style={{fontSize: 11, color: 'var(--text-gray)', fontWeight: 600}}>Probability</div>
                </div>
              </div>
            ))}
          </div>
          <button className="btn-secondary" style={{width: '100%', marginTop: 24}}>View All Top Performers</button>
        </div>

      </div>
    </div>
  );
}

function RecommendationsTab() {
  const recommendations = [
    {
      title: "Host a DSA & LeetCode Bootcamp",
      desc: "Skill gap analysis shows the current batch is lagging behind industry expectations by 2.0 points in Data Structures. A 2-week intensive bootcamp is highly recommended.",
      impact: "High",
      type: "Technical",
      icon: <Code size={20}/>,
      color: "#3b82f6"
    },
    {
      title: "Invite more FinTech Recruiters",
      desc: "FinTech is currently hiring 32% of our placed students. Expanding our corporate relations with FinTech startups could yield a 15% increase in total offers.",
      impact: "High",
      type: "Strategy",
      icon: <BriefcaseBusiness size={20}/>,
      color: "#10b981"
    },
    {
      title: "System Design Workshops for Seniors",
      desc: "Only 12% of the batch scored above an 8.0 in System Design. This is a critical blocker for Tier-1 product-based companies.",
      impact: "Medium",
      type: "Technical",
      icon: <Database size={20}/>,
      color: "#f59e0b"
    },
    {
      title: "Mock Interview Series: Soft Skills",
      desc: "Interviews indicate students struggle with behavioral questions. A mock interview series focusing on the STAR method would significantly boost confidence.",
      impact: "Medium",
      type: "Soft Skills",
      icon: <Users size={20}/>,
      color: "#ec4899"
    }
  ];

  const learningResources = [
    { title: "Top 50 System Design Questions", category: "PDF Guide", downloads: 432 },
    { title: "Mastering Dynamic Programming", category: "Video Course", downloads: 891 },
    { title: "FinTech Interview Prep 2024", category: "Cheat Sheet", downloads: 215 },
    { title: "Resume Building Templates", category: "Templates", downloads: 1204 },
  ];

  return (
    <div style={{animation: 'fadeIn 0.5s ease-out'}}>
      <div style={{marginBottom: 32}}>
        <h2 style={{fontSize: 28, fontWeight: 800, color: 'var(--text-dark)'}}>AI Strategic Recommendations</h2>
        <p style={{fontSize: 14, color: 'var(--text-gray)', marginTop: 8}}>Actionable steps generated by the AI engine to maximize the placement rate of the current batch.</p>
      </div>

      <div className="responsive-grid-2-asym">
        
        {/* Left: Actionable Recommendations */}
        <div style={{display: 'flex', flexDirection: 'column', gap: 16}}>
          <h3 style={{fontSize: 18, fontWeight: 800, marginBottom: 8}}>Priority Action Items</h3>
          {recommendations.map((rec, idx) => (
            <div key={idx} className="card" style={{padding: 24, borderLeft: `4px solid ${rec.color}`}}>
              <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start'}}>
                <div style={{display: 'flex', gap: 16}}>
                  <div style={{width: 48, height: 48, borderRadius: 12, background: `${rec.color}15`, color: rec.color, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                    {rec.icon}
                  </div>
                  <div>
                    <div style={{fontSize: 16, fontWeight: 800, color: 'var(--text-dark)'}}>{rec.title}</div>
                    <div style={{fontSize: 13, color: 'var(--text-gray)', marginTop: 8, lineHeight: 1.5}}>{rec.desc}</div>
                    <div style={{marginTop: 16}}>
                      <button className="btn-secondary" style={{padding: '6px 14px', fontSize: 12}}>Create Action Plan</button>
                    </div>
                  </div>
                </div>
                <div style={{display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 8}}>
                  <span style={{background: rec.impact === 'High' ? '#fee2e2' : '#fef3c7', color: rec.impact === 'High' ? '#ef4444' : '#d97706', padding: '4px 10px', borderRadius: 12, fontSize: 11, fontWeight: 700}}>
                    {rec.impact} Impact
                  </span>
                  <span style={{background: '#f1f5f9', color: 'var(--text-gray)', padding: '4px 10px', borderRadius: 12, fontSize: 11, fontWeight: 700}}>
                    {rec.type}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Right Side */}
        <div style={{display: 'flex', flexDirection: 'column', gap: 24}}>
          
          {/* Quick Stats */}
          <div className="card" style={{background: 'linear-gradient(135deg, #181c32 0%, #1e293b 100%)', color: 'white'}}>
            <div style={{display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16}}>
              <Lightbulb size={24} color="#f59e0b" />
              <h3 style={{fontSize: 18, fontWeight: 800}}>AI Insight Summary</h3>
            </div>
            <p style={{fontSize: 13, color: '#94a3b8', lineHeight: 1.6, marginBottom: 20}}>
              By executing the top two high-impact recommendations, the AI predicts a potential <strong>12% increase</strong> in overall placement probability for Batch 2024 within the next 45 days.
            </p>
            <div className="responsive-grid-2">
              <div style={{background: 'rgba(255,255,255,0.1)', padding: 12, borderRadius: 8}}>
                <div style={{fontSize: 24, fontWeight: 800, color: '#10b981'}}>+12%</div>
                <div style={{fontSize: 11, color: '#94a3b8', marginTop: 4}}>Projected Growth</div>
              </div>
              <div style={{background: 'rgba(255,255,255,0.1)', padding: 12, borderRadius: 8}}>
                <div style={{fontSize: 24, fontWeight: 800, color: '#f59e0b'}}>45 Days</div>
                <div style={{fontSize: 11, color: '#94a3b8', marginTop: 4}}>Execution Timeframe</div>
              </div>
            </div>
          </div>

          {/* Resource Library */}
          <div className="card">
            <h3 style={{fontSize: 18, fontWeight: 800, marginBottom: 4}}>Curated Resource Library</h3>
            <p style={{fontSize: 12, color: 'var(--text-gray)', marginBottom: 16}}>Materials auto-generated to share with at-risk students.</p>
            
            <div style={{display: 'flex', flexDirection: 'column', gap: 12}}>
              {learningResources.map((res, i) => (
                <div key={i} style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: 12, border: '1px solid #f1f5f9', borderRadius: 8}}>
                  <div style={{display: 'flex', alignItems: 'center', gap: 12}}>
                    <div style={{background: '#f1f5f9', padding: 8, borderRadius: 6, color: '#64748b'}}><BookOpen size={16}/></div>
                    <div>
                      <div style={{fontSize: 13, fontWeight: 700, color: 'var(--text-dark)'}}>{res.title}</div>
                      <div style={{fontSize: 11, color: 'var(--text-gray)'}}>{res.category}</div>
                    </div>
                  </div>
                  <button style={{background: 'transparent', border: 'none', color: 'var(--primary)', cursor: 'pointer'}}><ArrowRight size={16}/></button>
                </div>
              ))}
            </div>
            <button className="btn-secondary" style={{width: '100%', marginTop: 16}}>Access Full Library</button>
          </div>

        </div>
      </div>
    </div>
  );
}

function ModelPerformanceTab() {
  const featureImportance = [
    { feature: 'DSA Score', weight: 85 },
    { feature: 'CGPA', weight: 78 },
    { feature: 'Internships', weight: 65 },
    { feature: 'Coding Skills', weight: 62 },
    { feature: 'LeetCode Solved', weight: 58 },
    { feature: 'Aptitude', weight: 45 },
    { feature: 'Communication', weight: 40 },
    { feature: 'Hackathons', weight: 35 },
  ];

  const rocData = [
    { fpr: 0, tpr: 0 },
    { fpr: 0.1, tpr: 0.65 },
    { fpr: 0.2, tpr: 0.82 },
    { fpr: 0.3, tpr: 0.89 },
    { fpr: 0.5, tpr: 0.94 },
    { fpr: 0.8, tpr: 0.98 },
    { fpr: 1, tpr: 1 },
  ];

  return (
    <div style={{animation: 'fadeIn 0.5s ease-out'}}>
      <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 32}}>
        <div>
          <h2 style={{fontSize: 28, fontWeight: 800, color: 'var(--text-dark)'}}>ML Model Architecture & Performance</h2>
          <p style={{fontSize: 14, color: 'var(--text-gray)', marginTop: 8}}>Deep dive into the XGBoost classification engine driving our predictive analytics.</p>
        </div>
        <div style={{display: 'flex', gap: 12}}>
          <button className="btn-secondary" style={{padding: '0 20px'}}><Activity size={16} style={{marginRight: 8}}/> View Raw Logs</button>
          <button className="btn-primary" style={{padding: '0 20px', background: '#3b82f6', borderColor: '#3b82f6'}}><Zap size={16} style={{marginRight: 8}}/> Re-Train Model</button>
        </div>
      </div>

      {/* Top Metrics */}
      <div className="responsive-grid-4" style={{, marginBottom: 24}}>
        <div className="card" style={{padding: 20, textAlign: 'center'}}>
          <div style={{fontSize: 12, color: 'var(--text-gray)', fontWeight: 700, textTransform: 'uppercase'}}>Accuracy</div>
          <div style={{fontSize: 32, fontWeight: 800, color: '#10b981', marginTop: 12}}>91.3%</div>
        </div>
        <div className="card" style={{padding: 20, textAlign: 'center'}}>
          <div style={{fontSize: 12, color: 'var(--text-gray)', fontWeight: 700, textTransform: 'uppercase'}}>Precision</div>
          <div style={{fontSize: 32, fontWeight: 800, color: '#3b82f6', marginTop: 12}}>90.8%</div>
        </div>
        <div className="card" style={{padding: 20, textAlign: 'center'}}>
          <div style={{fontSize: 12, color: 'var(--text-gray)', fontWeight: 700, textTransform: 'uppercase'}}>Recall</div>
          <div style={{fontSize: 32, fontWeight: 800, color: '#8b5cf6', marginTop: 12}}>89.7%</div>
        </div>
        <div className="card" style={{padding: 20, textAlign: 'center'}}>
          <div style={{fontSize: 12, color: 'var(--text-gray)', fontWeight: 700, textTransform: 'uppercase'}}>F1 Score</div>
          <div style={{fontSize: 32, fontWeight: 800, color: '#ec4899', marginTop: 12}}>90.2%</div>
        </div>
        <div className="card" style={{padding: 20, textAlign: 'center', background: '#f8fafc'}}>
          <div style={{fontSize: 12, color: 'var(--text-gray)', fontWeight: 700, textTransform: 'uppercase'}}>Model Type</div>
          <div style={{fontSize: 22, fontWeight: 800, color: 'var(--text-dark)', marginTop: 16}}>XGBoost</div>
        </div>
      </div>

      <div className="responsive-grid-2-asym" style={{, marginBottom: 24}}>
        
        {/* Feature Importance Horizontal Bar Chart */}
        <div className="card">
          <div style={{display: 'flex', alignItems: 'center', gap: 10, marginBottom: 24}}>
            <div style={{background: '#eef2ff', color: '#5a5ce6', padding: 8, borderRadius: 8}}><Brain size={20}/></div>
            <h3 style={{fontSize: 18, fontWeight: 800}}>Feature Importance (SHAP Values)</h3>
          </div>
          <div style={{height: 350}}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={featureImportance} layout="vertical" margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                <XAxis type="number" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                <YAxis dataKey="feature" type="category" axisLine={false} tickLine={false} tick={{fill: '#334155', fontSize: 12, fontWeight: 600}} />
                <Tooltip cursor={{fill: '#f8fafc'}} contentStyle={{borderRadius: 8, border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)'}} />
                <Bar dataKey="weight" name="Impact Weight" fill="#5a5ce6" radius={[0, 4, 4, 0]} barSize={24}>
                  {featureImportance.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={index < 3 ? '#5a5ce6' : '#94a3b8'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Confusion Matrix */}
        <div className="card">
          <div style={{display: 'flex', alignItems: 'center', gap: 10, marginBottom: 24}}>
            <div style={{background: '#fef3c7', color: '#d97706', padding: 8, borderRadius: 8}}><Target size={20}/></div>
            <h3 style={{fontSize: 18, fontWeight: 800}}>Confusion Matrix</h3>
          </div>
          <p style={{fontSize: 13, color: 'var(--text-gray)', marginBottom: 24}}>Performance on the holdout validation dataset (n=3,000).</p>
          
          <div style={{display: 'grid', gridTemplateColumns: '40px 1fr 1fr', gridTemplateRows: '40px 1fr 1fr', gap: 4, height: 260}}>
            <div></div>
            <div style={{display: 'flex', alignItems: 'flex-end', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: 'var(--text-gray)', paddingBottom: 8}}>Predicted Placed</div>
            <div style={{display: 'flex', alignItems: 'flex-end', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: 'var(--text-gray)', paddingBottom: 8}}>Predicted Unplaced</div>
            
            <div style={{display: 'flex', alignItems: 'center', justifyContent: 'flex-end', fontSize: 11, fontWeight: 700, color: 'var(--text-gray)', paddingRight: 8, writingMode: 'vertical-rl', transform: 'rotate(180deg)'}}>Actual Placed</div>
            <div style={{background: '#d1fae5', borderRadius: 8, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center'}}>
              <div style={{fontSize: 28, fontWeight: 800, color: '#059669'}}>1,420</div>
              <div style={{fontSize: 11, fontWeight: 700, color: '#059669', opacity: 0.8}}>True Positive (TP)</div>
            </div>
            <div style={{background: '#fee2e2', borderRadius: 8, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center'}}>
              <div style={{fontSize: 28, fontWeight: 800, color: '#ef4444'}}>145</div>
              <div style={{fontSize: 11, fontWeight: 700, color: '#ef4444', opacity: 0.8}}>False Negative (FN)</div>
            </div>

            <div style={{display: 'flex', alignItems: 'center', justifyContent: 'flex-end', fontSize: 11, fontWeight: 700, color: 'var(--text-gray)', paddingRight: 8, writingMode: 'vertical-rl', transform: 'rotate(180deg)'}}>Actual Unplaced</div>
            <div style={{background: '#fee2e2', borderRadius: 8, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center'}}>
              <div style={{fontSize: 28, fontWeight: 800, color: '#ef4444'}}>162</div>
              <div style={{fontSize: 11, fontWeight: 700, color: '#ef4444', opacity: 0.8}}>False Positive (FP)</div>
            </div>
            <div style={{background: '#f1f5f9', borderRadius: 8, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center'}}>
              <div style={{fontSize: 28, fontWeight: 800, color: '#475569'}}>1,273</div>
              <div style={{fontSize: 11, fontWeight: 700, color: '#475569', opacity: 0.8}}>True Negative (TN)</div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Area: ROC Curve */}
      <div className="card">
         <div style={{display: 'flex', alignItems: 'center', gap: 10, marginBottom: 24}}>
          <div style={{background: '#e0f2fe', color: '#0ea5e9', padding: 8, borderRadius: 8}}><TrendingUp size={20}/></div>
          <h3 style={{fontSize: 18, fontWeight: 800}}>ROC-AUC Curve (AUC = 0.94)</h3>
        </div>
        <div style={{height: 300}}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={rocData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="fpr" type="number" domain={[0, 1]} tick={{fill: '#64748b', fontSize: 12}}>
                <label value="False Positive Rate" position="bottom" style={{fill: '#64748b', fontSize: 12, fontWeight: 600}}/>
              </XAxis>
              <YAxis dataKey="tpr" type="number" domain={[0, 1]} tick={{fill: '#64748b', fontSize: 12}}>
                <label value="True Positive Rate" angle={-90} position="left" style={{fill: '#64748b', fontSize: 12, fontWeight: 600}}/>
              </YAxis>
              <Tooltip contentStyle={{borderRadius: 8, border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)'}} />
              <Line type="monotone" dataKey="tpr" name="XGBoost" stroke="#0ea5e9" strokeWidth={3} dot={false} />
              {/* Baseline */}
              <Line data={[{fpr:0,tpr:0},{fpr:1,tpr:1}]} dataKey="tpr" stroke="#cbd5e1" strokeDasharray="5 5" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

    </div>
  );
}

function ReportsTab() {
  const recentReports = [
    { id: 'REP-001', name: 'Batch 2024 Placement Summary Final', type: 'PDF', date: 'Oct 12, 2024', size: '2.4 MB', status: 'Completed' },
    { id: 'REP-002', name: 'Skill Gap Analysis - CSE Dept', type: 'CSV', date: 'Oct 10, 2024', size: '156 KB', status: 'Completed' },
    { id: 'REP-003', name: 'Recruiter Feedback Aggregation', type: 'PDF', date: 'Oct 05, 2024', size: '1.1 MB', status: 'Completed' },
    { id: 'REP-004', name: 'Diversity & Inclusion Metrics', type: 'XLSX', date: 'Sep 28, 2024', size: '420 KB', status: 'Completed' },
    { id: 'REP-005', name: 'At-Risk Student Intervention Logs', type: 'PDF', date: 'Sep 15, 2024', size: '890 KB', status: 'Completed' },
  ];

  return (
    <div style={{animation: 'fadeIn 0.5s ease-out'}}>
      <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 32}}>
        <div>
          <h2 style={{fontSize: 28, fontWeight: 800, color: 'var(--text-dark)'}}>Reports & Exports</h2>
          <p style={{fontSize: 14, color: 'var(--text-gray)', marginTop: 8}}>Generate, schedule, and download comprehensive placement reports for stakeholders.</p>
        </div>
      </div>

      <div className="responsive-grid-2-asym-rev" style={{, marginBottom: 24}}>
        
        {/* Left Side: Report Generator */}
        <div className="card" style={{height: 'fit-content'}}>
          <div style={{display: 'flex', alignItems: 'center', gap: 10, marginBottom: 24}}>
            <div style={{background: '#eef2ff', color: '#5a5ce6', padding: 8, borderRadius: 8}}><FileText size={20}/></div>
            <h3 style={{fontSize: 18, fontWeight: 800}}>Generate New Report</h3>
          </div>
          
          <div style={{display: 'flex', flexDirection: 'column', gap: 16}}>
            <div>
              <label style={{fontSize: 12, fontWeight: 600, color: 'var(--text-dark)', marginBottom: 6, display: 'block'}}>Report Type</label>
              <select className="modal-input" style={{width: '100%'}}>
                <option>Comprehensive Placement Summary</option>
                <option>Branch-Wise Performance</option>
                <option>Student Skill Gap Analysis</option>
                <option>Recruiter Pipeline & Conversion</option>
              </select>
            </div>
            
            <div className="responsive-grid-2">
              <div>
                <label style={{fontSize: 12, fontWeight: 600, color: 'var(--text-dark)', marginBottom: 6, display: 'block'}}>Target Batch</label>
                <select className="modal-input" style={{width: '100%'}}>
                  <option>Batch 2024</option>
                  <option>Batch 2023</option>
                  <option>All Active Batches</option>
                </select>
              </div>
              <div>
                <label style={{fontSize: 12, fontWeight: 600, color: 'var(--text-dark)', marginBottom: 6, display: 'block'}}>Target Branch</label>
                <select className="modal-input" style={{width: '100%'}}>
                  <option>All Branches</option>
                  <option>CSE</option>
                  <option>IT</option>
                  <option>ECE</option>
                </select>
              </div>
            </div>

            <div>
              <label style={{fontSize: 12, fontWeight: 600, color: 'var(--text-dark)', marginBottom: 6, display: 'block'}}>Export Format</label>
              <div style={{display: 'flex', gap: 12}}>
                <label style={{flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '10px', border: '1px solid var(--primary)', background: '#eef2ff', borderRadius: 8, color: 'var(--primary)', fontWeight: 600, cursor: 'pointer'}}>
                  <input type="radio" name="format" defaultChecked style={{accentColor: 'var(--primary)'}}/> PDF
                </label>
                <label style={{flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '10px', border: '1px solid #e2e8f0', borderRadius: 8, color: 'var(--text-gray)', fontWeight: 600, cursor: 'pointer'}}>
                  <input type="radio" name="format" style={{accentColor: 'var(--primary)'}}/> CSV / Excel
                </label>
              </div>
            </div>

            <button className="btn-primary" style={{width: '100%', marginTop: 8, padding: '14px', fontSize: 14}}><Download size={18} style={{marginRight: 8}}/> Generate & Download</button>
          </div>
        </div>

        {/* Right Side: Recent Reports Table */}
        <div className="card">
          <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24}}>
            <h3 style={{fontSize: 18, fontWeight: 800}}>Recent Generated Reports</h3>
            <button className="btn-secondary" style={{padding: '6px 12px', fontSize: 12}}><Filter size={14} style={{marginRight: 6}}/> Filter</button>
          </div>

          <div style={{overflowX: 'auto'}}>
            <table style={{width: '100%', borderCollapse: 'collapse', textAlign: 'left'}}>
              <thead>
                <tr style={{borderBottom: '2px solid #f1f5f9'}}>
                  <th style={{padding: '12px 16px', fontSize: 12, fontWeight: 700, color: 'var(--text-gray)'}}>Report Name</th>
                  <th style={{padding: '12px 16px', fontSize: 12, fontWeight: 700, color: 'var(--text-gray)'}}>Format</th>
                  <th style={{padding: '12px 16px', fontSize: 12, fontWeight: 700, color: 'var(--text-gray)'}}>Date Generated</th>
                  <th style={{padding: '12px 16px', fontSize: 12, fontWeight: 700, color: 'var(--text-gray)'}}>Status</th>
                  <th style={{padding: '12px 16px', fontSize: 12, fontWeight: 700, color: 'var(--text-gray)', textAlign: 'right'}}>Action</th>
                </tr>
              </thead>
              <tbody>
                {recentReports.map((report, idx) => (
                  <tr key={idx} style={{borderBottom: '1px solid #f8fafc', transition: 'background 0.2s'}} onMouseOver={e => e.currentTarget.style.background = '#f8fafc'} onMouseOut={e => e.currentTarget.style.background = 'transparent'}>
                    <td style={{padding: '16px', display: 'flex', alignItems: 'center', gap: 12}}>
                      <div style={{background: report.type === 'PDF' ? '#fee2e2' : '#d1fae5', color: report.type === 'PDF' ? '#ef4444' : '#10b981', padding: 8, borderRadius: 8}}>
                        <FileText size={16}/>
                      </div>
                      <div>
                        <div style={{fontSize: 13, fontWeight: 700, color: 'var(--text-dark)'}}>{report.name}</div>
                        <div style={{fontSize: 11, color: 'var(--text-gray)', marginTop: 2}}>{report.size}</div>
                      </div>
                    </td>
                    <td style={{padding: '16px'}}>
                      <span style={{background: '#f1f5f9', padding: '4px 8px', borderRadius: 6, fontSize: 11, fontWeight: 700, color: '#475569'}}>{report.type}</span>
                    </td>
                    <td style={{padding: '16px', fontSize: 13, color: 'var(--text-gray)', fontWeight: 500}}>{report.date}</td>
                    <td style={{padding: '16px'}}>
                      <span style={{display: 'inline-flex', alignItems: 'center', gap: 6, color: '#10b981', fontSize: 12, fontWeight: 600}}>
                        <CheckCircle size={14}/> {report.status}
                      </span>
                    </td>
                    <td style={{padding: '16px', textAlign: 'right'}}>
                      <button style={{background: 'transparent', border: 'none', color: 'var(--primary)', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 6, fontWeight: 600, fontSize: 13}}>
                        <Download size={16}/> Download
                      </button>
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
}

function DataManagementTab() {
  const dataConnections = [
    { name: 'University ERP System', status: 'Connected', lastSync: '2 hours ago', records: '14,502', icon: <Database size={24}/>, color: '#3b82f6' },
    { name: 'Training Placement Cell Portal', status: 'Connected', lastSync: '10 mins ago', records: '4,105', icon: <BriefcaseBusiness size={24}/>, color: '#10b981' },
    { name: 'Alumni Database (MySQL)', status: 'Disconnected', lastSync: '3 days ago', records: '8,204', icon: <Users size={24}/>, color: '#ef4444' },
  ];

  const syncLogs = [
    { id: 'SYNC-921', source: 'ERP System', rowsAdded: 142, errors: 0, date: 'Oct 12, 10:45 AM', status: 'Success' },
    { id: 'SYNC-920', source: 'TPC Portal', rowsAdded: 45, errors: 2, date: 'Oct 12, 09:15 AM', status: 'Warning' },
    { id: 'SYNC-919', source: 'Manual CSV', rowsAdded: 1500, errors: 0, date: 'Oct 11, 04:30 PM', status: 'Success' },
    { id: 'SYNC-918', source: 'Alumni DB', rowsAdded: 0, errors: 12, date: 'Oct 10, 11:00 AM', status: 'Failed' },
  ];

  return (
    <div style={{animation: 'fadeIn 0.5s ease-out'}}>
      <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 32}}>
        <div>
          <h2 style={{fontSize: 28, fontWeight: 800, color: 'var(--text-dark)'}}>Data Management Center</h2>
          <p style={{fontSize: 14, color: 'var(--text-gray)', marginTop: 8}}>Manage integrations, run data cleaning pipelines, and monitor real-time sync logs.</p>
        </div>
        <div style={{display: 'flex', gap: 12}}>
          <button className="btn-secondary" style={{padding: '0 20px'}}><UploadCloud size={16} style={{marginRight: 8}}/> Import CSV</button>
          <button className="btn-primary" style={{padding: '0 20px', background: '#3b82f6', borderColor: '#3b82f6'}}><RefreshCw size={16} style={{marginRight: 8}}/> Sync All Sources</button>
        </div>
      </div>

      <div className="responsive-grid-2-asym-rev" style={{, marginBottom: 24}}>
        
        {/* Left: Active Data Connections */}
        <div style={{display: 'flex', flexDirection: 'column', gap: 16}}>
          <h3 style={{fontSize: 18, fontWeight: 800, marginBottom: 4}}>Active Connections</h3>
          <p style={{fontSize: 12, color: 'var(--text-gray)', marginBottom: 8}}>Live data sources feeding the ML Model.</p>
          
          {dataConnections.map((conn, idx) => (
            <div key={idx} className="card" style={{padding: 20, borderLeft: `4px solid ${conn.color}`}}>
              <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                <div style={{display: 'flex', alignItems: 'center', gap: 16}}>
                  <div style={{width: 48, height: 48, borderRadius: 12, background: `${conn.color}15`, color: conn.color, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                    {conn.icon}
                  </div>
                  <div>
                    <div style={{fontSize: 15, fontWeight: 800, color: 'var(--text-dark)'}}>{conn.name}</div>
                    <div style={{fontSize: 12, color: 'var(--text-gray)', marginTop: 4}}>{conn.records} records synced</div>
                  </div>
                </div>
                <div style={{display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 8}}>
                  <span style={{display: 'flex', alignItems: 'center', gap: 4, background: conn.status === 'Connected' ? '#d1fae5' : '#fee2e2', color: conn.status === 'Connected' ? '#10b981' : '#ef4444', padding: '4px 10px', borderRadius: 12, fontSize: 11, fontWeight: 700}}>
                    {conn.status === 'Connected' ? <CheckCircle size={12}/> : <XCircle size={12}/>} {conn.status}
                  </span>
                  <span style={{fontSize: 11, color: 'var(--text-gray)'}}>Sync: {conn.lastSync}</span>
                </div>
              </div>
            </div>
          ))}
          
          <button className="btn-secondary" style={{width: '100%', marginTop: 8, padding: '14px', borderStyle: 'dashed'}}><Link size={16} style={{marginRight: 8}}/> Add New Data Source</button>
        </div>

        {/* Right Side: Data Sync Logs */}
        <div className="card">
          <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24}}>
            <h3 style={{fontSize: 18, fontWeight: 800}}>Data Pipeline Logs</h3>
            <div style={{display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: '#10b981', fontWeight: 600, background: '#d1fae5', padding: '6px 12px', borderRadius: 20}}>
              <span style={{width: 8, height: 8, borderRadius: '50%', background: '#10b981', animation: 'pulse 2s infinite'}}></span> Pipeline Healthy
            </div>
          </div>

          <div style={{overflowX: 'auto'}}>
            <table style={{width: '100%', borderCollapse: 'collapse', textAlign: 'left'}}>
              <thead>
                <tr style={{borderBottom: '2px solid #f1f5f9'}}>
                  <th style={{padding: '12px 16px', fontSize: 12, fontWeight: 700, color: 'var(--text-gray)'}}>Sync ID</th>
                  <th style={{padding: '12px 16px', fontSize: 12, fontWeight: 700, color: 'var(--text-gray)'}}>Source</th>
                  <th style={{padding: '12px 16px', fontSize: 12, fontWeight: 700, color: 'var(--text-gray)'}}>Date & Time</th>
                  <th style={{padding: '12px 16px', fontSize: 12, fontWeight: 700, color: 'var(--text-gray)', textAlign: 'center'}}>Rows Added</th>
                  <th style={{padding: '12px 16px', fontSize: 12, fontWeight: 700, color: 'var(--text-gray)', textAlign: 'center'}}>Status</th>
                </tr>
              </thead>
              <tbody>
                {syncLogs.map((log, idx) => (
                  <tr key={idx} style={{borderBottom: '1px solid #f8fafc'}}>
                    <td style={{padding: '16px', fontSize: 13, fontWeight: 700, color: 'var(--text-dark)'}}>{log.id}</td>
                    <td style={{padding: '16px', fontSize: 13, color: 'var(--text-gray)', fontWeight: 500}}>{log.source}</td>
                    <td style={{padding: '16px', fontSize: 13, color: 'var(--text-gray)'}}>{log.date}</td>
                    <td style={{padding: '16px', textAlign: 'center'}}>
                      <div style={{fontSize: 14, fontWeight: 700, color: 'var(--text-dark)'}}>{log.rowsAdded}</div>
                      {log.errors > 0 && <div style={{fontSize: 11, color: '#ef4444', fontWeight: 600}}>{log.errors} errors</div>}
                    </td>
                    <td style={{padding: '16px', textAlign: 'center'}}>
                      <span style={{
                        background: log.status === 'Success' ? '#d1fae5' : log.status === 'Warning' ? '#fef3c7' : '#fee2e2',
                        color: log.status === 'Success' ? '#10b981' : log.status === 'Warning' ? '#d97706' : '#ef4444',
                        padding: '4px 10px', borderRadius: 12, fontSize: 11, fontWeight: 700
                      }}>
                        {log.status}
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
}

function SettingsTab() {
  const [activeSetting, setActiveSetting] = useState('Profile');

  const renderContent = () => {
    switch(activeSetting) {
      case 'Profile':
        return (
          <div className="card">
            <h3 style={{fontSize: 18, fontWeight: 800, marginBottom: 20}}>Profile Information</h3>
            <div style={{display: 'flex', alignItems: 'center', gap: 24, marginBottom: 24}}>
              <img src="https://ui-avatars.com/api/?name=Admin+User&background=3b82f6&color=fff" style={{width: 80, height: 80, borderRadius: '50%'}} alt="Admin"/>
              <div>
                <button className="btn-secondary" style={{padding: '8px 16px', fontSize: 13, marginBottom: 8}}>Upload New Photo</button>
                <div style={{fontSize: 11, color: 'var(--text-gray)'}}>JPG or PNG, Max 2MB</div>
              </div>
            </div>
            <div className="responsive-grid-2" style={{, marginBottom: 20}}>
              <div>
                <label style={{fontSize: 12, fontWeight: 700, color: 'var(--text-dark)', marginBottom: 8, display: 'block'}}>Full Name</label>
                <input type="text" className="modal-input" defaultValue="Admin User" style={{width: '100%'}}/>
              </div>
              <div>
                <label style={{fontSize: 12, fontWeight: 700, color: 'var(--text-dark)', marginBottom: 8, display: 'block'}}>Email Address</label>
                <input type="email" className="modal-input" defaultValue="admin@placementcell.edu" style={{width: '100%'}}/>
              </div>
            </div>
            <div>
              <label style={{fontSize: 12, fontWeight: 700, color: 'var(--text-dark)', marginBottom: 8, display: 'block'}}>Role / Title</label>
              <input type="text" className="modal-input" defaultValue="Head of Training and Placements" style={{width: '100%'}}/>
            </div>
          </div>
        );
      case 'AI':
        return (
          <div className="card">
            <h3 style={{fontSize: 18, fontWeight: 800, marginBottom: 20}}>AI Model Preferences</h3>
            <div style={{display: 'flex', flexDirection: 'column', gap: 16}}>
              <div>
                <label style={{fontSize: 12, fontWeight: 700, color: 'var(--text-dark)', marginBottom: 8, display: 'block'}}>Active Prediction Model</label>
                <select className="modal-input" style={{width: '100%'}}>
                  <option>XGBoost (v2.4) - Recommended</option>
                  <option>Random Forest (Legacy)</option>
                  <option>Logistic Regression (Baseline)</option>
                </select>
              </div>
              <div>
                <label style={{fontSize: 12, fontWeight: 700, color: 'var(--text-dark)', marginBottom: 8, display: 'block'}}>Confidence Threshold</label>
                <input type="range" min="50" max="95" defaultValue="80" style={{width: '100%', accentColor: 'var(--primary)'}}/>
                <div style={{display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--text-gray)', marginTop: 4}}>
                  <span>Lenient (50%)</span>
                  <span>Current: 80%</span>
                  <span>Strict (95%)</span>
                </div>
              </div>
            </div>
          </div>
        );
      case 'Notifications':
        return (
          <div className="card">
            <h3 style={{fontSize: 18, fontWeight: 800, marginBottom: 20}}>Email Notifications</h3>
            <div style={{display: 'flex', flexDirection: 'column', gap: 16}}>
              <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                <div>
                  <div style={{fontSize: 14, fontWeight: 700, color: 'var(--text-dark)'}}>Data Sync Alerts</div>
                  <div style={{fontSize: 12, color: 'var(--text-gray)', marginTop: 4}}>Get notified if a scheduled ERP sync fails.</div>
                </div>
                <div style={{width: 40, height: 24, background: '#10b981', borderRadius: 12, position: 'relative', cursor: 'pointer'}}>
                  <div style={{width: 20, height: 20, background: 'white', borderRadius: '50%', position: 'absolute', top: 2, right: 2, boxShadow: '0 2px 4px rgba(0,0,0,0.1)'}}></div>
                </div>
              </div>
              <div style={{height: 1, background: '#f1f5f9'}}></div>
              <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                <div>
                  <div style={{fontSize: 14, fontWeight: 700, color: 'var(--text-dark)'}}>Model Drift Warnings</div>
                  <div style={{fontSize: 12, color: 'var(--text-gray)', marginTop: 4}}>Receive an email when model accuracy drops below 85%.</div>
                </div>
                <div style={{width: 40, height: 24, background: '#10b981', borderRadius: 12, position: 'relative', cursor: 'pointer'}}>
                  <div style={{width: 20, height: 20, background: 'white', borderRadius: '50%', position: 'absolute', top: 2, right: 2, boxShadow: '0 2px 4px rgba(0,0,0,0.1)'}}></div>
                </div>
              </div>
            </div>
          </div>
        );
      case 'Security':
        return (
          <div className="card">
            <h3 style={{fontSize: 18, fontWeight: 800, marginBottom: 20}}>Security & API Keys</h3>
            <div style={{display: 'flex', flexDirection: 'column', gap: 16}}>
              <div>
                <label style={{fontSize: 12, fontWeight: 700, color: 'var(--text-dark)', marginBottom: 8, display: 'block'}}>Change Password</label>
                <input type="password" placeholder="Current Password" className="modal-input" style={{width: '100%', marginBottom: 12}}/>
                <input type="password" placeholder="New Password" className="modal-input" style={{width: '100%'}}/>
              </div>
              <div style={{height: 1, background: '#f1f5f9', margin: '8px 0'}}></div>
              <div>
                <label style={{fontSize: 12, fontWeight: 700, color: 'var(--text-dark)', marginBottom: 8, display: 'block'}}>API Key (For External Integrations)</label>
                <div style={{display: 'flex', gap: 12}}>
                  <input type="text" readOnly value="api_key_xxxxxxxxxxxxxxxxxx" className="modal-input" style={{flex: 1, background: '#f8fafc', color: '#64748b'}}/>
                  <button className="btn-secondary">Regenerate</button>
                </div>
              </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  const getNavStyle = (tab) => ({
    display: 'flex', alignItems: 'center', gap: 12, padding: '16px',
    background: activeSetting === tab ? 'var(--primary)' : 'transparent',
    color: activeSetting === tab ? 'white' : 'var(--text-gray)',
    border: 'none', borderRadius: 12, fontWeight: 700, fontSize: 15, cursor: 'pointer', textAlign: 'left',
    transition: 'background 0.2s'
  });

  return (
    <div style={{animation: 'fadeIn 0.5s ease-out'}}>
      <div style={{marginBottom: 32}}>
        <h2 style={{fontSize: 28, fontWeight: 800, color: 'var(--text-dark)'}}>System Settings</h2>
        <p style={{fontSize: 14, color: 'var(--text-gray)', marginTop: 8}}>Manage your account, set model preferences, and configure security protocols.</p>
      </div>

      <div className="responsive-grid-2-asym-rev">
        
        {/* Left: Settings Nav */}
        <div style={{display: 'flex', flexDirection: 'column', gap: 8}}>
          <button style={getNavStyle('Profile')} onClick={() => setActiveSetting('Profile')}>
            <User size={18}/> Profile & Account
          </button>
          <button style={getNavStyle('AI')} onClick={() => setActiveSetting('AI')}>
            <Sliders size={18}/> AI Model Preferences
          </button>
          <button style={getNavStyle('Notifications')} onClick={() => setActiveSetting('Notifications')}>
            <Bell size={18}/> Notifications
          </button>
          <button style={getNavStyle('Security')} onClick={() => setActiveSetting('Security')}>
            <Lock size={18}/> Security & API Keys
          </button>
        </div>

        {/* Right: Settings Content */}
        <div style={{display: 'flex', flexDirection: 'column', gap: 24}}>
          {renderContent()}
          <div style={{display: 'flex', justifyContent: 'flex-end'}}>
            <button className="btn-primary">Save Changes</button>
          </div>
        </div>
      </div>
    </div>
  );
}
