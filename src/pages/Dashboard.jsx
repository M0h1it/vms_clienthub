import { useEffect, useState } from "react";
import api from "../api/api";
import { 
  FaUsers, 
  FaUserCheck, 
  FaBuilding, 
  FaCalendarAlt,
  FaExclamationTriangle,
} from "react-icons/fa";

import {
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Area,
  AreaChart
} from "recharts";

export default function Dashboard() {
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);

  const loadStats = async () => {
    try {
      setLoading(true);
      const res = await api.get("/dashboard/stats");
      setStats(res?.data?.data || {});
    } catch (error) {
      console.error("Dashboard error:", error);
      setStats({});
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStats();
  }, []);

  const today = new Date().toLocaleDateString("en-US", {
    weekday: "short",
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  const isExpiring = stats.daysLeft <= 5;

  return (
    <div className="dashboard-wrapper">
      <div className="container-fluid p-3 p-md-4">
        
        {/* HEADER SECTION */}
        <header className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4 gap-3">
          <div>
            <h2 className="fw-bold text-dark mb-1">Dashboard Overview</h2>
            <p className="text-muted mb-0 d-flex align-items-center gap-2">
              <FaCalendarAlt className="text-primary" /> {today}
            </p>
          </div>
        </header>

        {/* STATS GRID */}
        <div className="row g-3 g-md-4 mb-4">
          <StatCard
            icon={<FaUsers />}
            title="Total Visitors"
            subtitle="Today"
            value={loading ? "..." : stats.todayVisitors || 0}
            theme="primary"
          />
          <StatCard
            icon={<FaUserCheck />}
            title="Active Now"
            subtitle="Inside Building"
            value={loading ? "..." : stats.insideVisitors || 0}
            theme="success"
            pulse
          />
          <StatCard
            icon={<FaBuilding />}
            title="Employees"
            subtitle="Registered"
            value={loading ? "..." : stats.totalEmployees || 0}
            theme="warning"
          />
          
          {/* Subscription Card */}
          <div className="col-12 col-sm-6 col-xl-3">
            <div className={`card h-100 border-0 shadow-sm p-4 ${isExpiring ? 'bg-danger-subtle border-start border-danger border-4' : ''}`}>
              <div className="d-flex align-items-center gap-2 mb-3">
                 <div className={`icon-box ${isExpiring ? 'bg-danger text-white' : 'bg-info bg-opacity-10 text-info'}`}>
                    <FaExclamationTriangle />
                 </div>
                 <span className="fw-bold text-uppercase small text-muted">Subscription</span>
              </div>
              <h3 className="fw-bold mb-1">
                {stats.subscriptionEnd ? new Date(stats.subscriptionEnd).toLocaleDateString() : "N/A"}
              </h3>
              <p className={`fw-bold mb-0 ${isExpiring ? "text-danger" : "text-success"}`}>
                {stats.daysLeft || 0} Days Remaining
              </p>
            </div>
          </div>
        </div>

        {/* CHART SECTION */}
        <div className="row">
          <div className="col-12">
            <div className="card border-0 shadow-sm p-3 p-md-4 mb-4">
              <div className="d-flex justify-content-between align-items-center mb-4">
                <h5 className="fw-bold mb-0">Visitor Analytics</h5>
              </div>
              
              <div style={{ width: '100%', height: 350 }}>
                <ResponsiveContainer>
                  <AreaChart data={stats.monthlyVisitors || []}>
                    <defs>
                      <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#4e73df" stopOpacity={0.1}/>
                        <stop offset="95%" stopColor="#4e73df" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                    <XAxis 
                        dataKey="date" 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{ fill: '#999', fontSize: 12 }} 
                        dy={10}
                    />
                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#999', fontSize: 12 }} />
                    <Tooltip 
                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 5px 15px rgba(0,0,0,0.1)' }}
                    />
                    <Area 
                        type="monotone" 
                        dataKey="count" 
                        stroke="#4e73df" 
                        strokeWidth={3} 
                        fillOpacity={1} 
                        fill="url(#colorCount)" 
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>

      </div>

      <style>{`
        :root {
            --bs-body-bg: #f8f9fc;
        }

        .dashboard-wrapper {
          background-color: #f8f9fc;
          min-height: 100vh;
          font-family: 'Inter', sans-serif;
        }

        .card {
          border-radius: 20px;
          transition: transform 0.3s ease, box-shadow 0.3s ease;
        }

        .card:hover {
          transform: translateY(-5px);
          box-shadow: 0 15px 30px rgba(0,0,0,0.08) !important;
        }

        .icon-box {
          width: 42px;
          height: 42px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 12px;
          font-size: 1.2rem;
        }

        .btn-white {
            background: #fff;
            color: #555;
        }

        .pulse-dot {
          width: 8px;
          height: 8px;
          background: #198754;
          border-radius: 50%;
          position: absolute;
          top: 20px;
          right: 20px;
        }

        .pulse-animation {
          animation: pulse-ring 1.5s cubic-bezier(0.455, 0.03, 0.515, 0.955) infinite;
        }

        @keyframes pulse-ring {
          0% { transform: scale(0.33); opacity: 1; }
          80%, 100% { transform: scale(2.5); opacity: 0; }
        }

        @media (max-width: 576px) {
            h2 { font-size: 1.5rem; }
            .card { padding: 1.5rem !important; }
        }
      `}</style>
    </div>
  );
}

function StatCard({ icon, title, subtitle, value, theme, pulse }) {
  return (
    <div className="col-12 col-sm-6 col-xl-3">
      <div className="card h-100 border-0 shadow-sm p-4 position-relative">
        {pulse && (
          <div className="pulse-dot">
             <div className="pulse-dot pulse-animation" style={{top:0, right:0}}></div>
          </div>
        )}
        
        <div className="d-flex align-items-center gap-3 mb-3">
          <div className={`icon-box bg-${theme} bg-opacity-10 text-${theme}`}>
            {icon}
          </div>
          <div>
            <h6 className="text-muted small mb-0 fw-bold text-uppercase">{title}</h6>
            <span className="text-muted" style={{fontSize: '0.75rem'}}>{subtitle}</span>
          </div>
        </div>

        <div className="d-flex align-items-baseline">
          <h2 className="fw-bold mb-0">{value}</h2>
        </div>
      </div>
    </div>
  );
}