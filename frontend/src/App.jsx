import React, { useState, useEffect, useRef } from 'react';
import { 
  Home, Users, Target, Activity, Lightbulb, Settings, FileText, Database,
  Bell, Search, BookOpen, PenTool, Brain, Code, User, ArrowRight,
  TrendingUp, Briefcase, Award, Zap, BriefcaseBusiness, CloudRain, Shield, Quote, Heart, UploadCloud, Monitor, CheckCircle, XCircle
} from 'lucide-react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer,
  PieChart, Pie, Cell, BarChart, Bar
} from 'recharts';
import './App.css';

export default function App() {
  const [predictionResult, setPredictionResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('Dashboard');
  const [toastMsg, setToastMsg] = useState('');
  
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
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-logo">
          <div className="logo-icon">P</div>
          <div>
            <h3 style={{fontWeight: 800, fontSize: '15px'}}>PLACCION</h3>
            <p style={{fontSize: '11px', color: 'var(--text-gray)'}}>AI Placement Predictor</p>
          </div>
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
          <div>
            <h1 style={{fontSize: '24px', fontWeight: 800, marginBottom: '6px', color: 'var(--text-dark)'}}>
              {activeTab === 'Dashboard' ? 'Welcome back, Placement Team! 👋' : `${activeTab} Dashboard`}
            </h1>
            <p style={{fontSize: '14px', color: 'var(--text-gray)'}}>
              {activeTab === 'Dashboard' ? 'AI-driven insights to build successful futures' : `Manage and view ${activeTab.toLowerCase()} data`}
            </p>
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
            <div style={{display: 'grid', gridTemplateColumns: '1.3fr 1fr', gap: 24, marginTop: 24}}>
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
