import { Settings as SettingsIcon, Server, Database, Cloud, Key } from 'lucide-react';

export default function Settings() {
  return (
    <div className="animate-fadeIn">
      <div className="page-header"><h1>Settings</h1></div>

      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(320px, 1fr))', gap:16 }}>
        <div className="card">
          <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:16 }}>
            <div className="kpi-icon gold"><Server size={20}/></div>
            <div><h3 style={{ fontSize:15, fontWeight:600 }}>API Configuration</h3><p style={{fontSize:12,color:'var(--text-muted)'}}>Backend server settings</p></div>
          </div>
          <div className="form-group" style={{marginBottom:12}}>
            <label className="form-label">API Base URL</label>
            <input className="form-input" value={import.meta.env.VITE_API_URL || 'http://localhost:8000/api'} readOnly style={{color:'var(--text-muted)'}}/>
          </div>
          <div className="form-group"><label className="form-label">Environment</label><input className="form-input" value="Development" readOnly style={{color:'var(--text-muted)'}}/></div>
        </div>

        <div className="card">
          <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:16 }}>
            <div className="kpi-icon blue"><Database size={20}/></div>
            <div><h3 style={{ fontSize:15, fontWeight:600 }}>Database</h3><p style={{fontSize:12,color:'var(--text-muted)'}}>MongoDB connection</p></div>
          </div>
          <div className="detail-row"><span className="label">Engine</span><span className="value">MongoDB (Mongoose v8)</span></div>
          <div className="detail-row"><span className="label">Status</span><span className="value" style={{color:'var(--success)'}}>● Connected</span></div>
        </div>

        <div className="card">
          <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:16 }}>
            <div className="kpi-icon green"><Cloud size={20}/></div>
            <div><h3 style={{ fontSize:15, fontWeight:600 }}>Storage</h3><p style={{fontSize:12,color:'var(--text-muted)'}}>AWS S3 configuration</p></div>
          </div>
          <div className="detail-row"><span className="label">Bucket</span><span className="value">goldenhive-prod-assets</span></div>
          <div className="detail-row"><span className="label">Region</span><span className="value">ap-south-1</span></div>
        </div>

        <div className="card">
          <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:16 }}>
            <div className="kpi-icon purple"><Key size={20}/></div>
            <div><h3 style={{ fontSize:15, fontWeight:600 }}>Authentication</h3><p style={{fontSize:12,color:'var(--text-muted)'}}>JWT settings</p></div>
          </div>
          <div className="detail-row"><span className="label">Algorithm</span><span className="value">HS256</span></div>
          <div className="detail-row"><span className="label">Token Expiry</span><span className="value">7 days</span></div>
          <div className="detail-row"><span className="label">Roles</span><span className="value">USER, ADMIN, SALES_AGENT</span></div>
        </div>
      </div>
    </div>
  );
}
