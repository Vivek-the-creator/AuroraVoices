import React, { useEffect, useState } from 'react';

const Settings = ({ user, onLogout }) => {
  const [settings, setSettings] = useState({
    emailNotifications: true,
    showProfilePublic: true,
    language: 'en'
  });

  useEffect(() => {
    const key = user ? `settings:${user.id}` : 'settings:guest';
    const saved = localStorage.getItem(key);
    if (saved) setSettings(JSON.parse(saved));
  }, [user]);

  const persist = (next) => {
    const key = user ? `settings:${user.id}` : 'settings:guest';
    localStorage.setItem(key, JSON.stringify(next));
  };

  const handleToggle = (name) => {
    const next = { ...settings, [name]: !settings[name] };
    setSettings(next);
    persist(next);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    const next = { ...settings, [name]: value };
    setSettings(next);
    persist(next);
  };

  return (
    <div className="container" style={{ paddingTop: 24 }}>
      <div className="card p-4" style={{ background: 'rgba(15,23,42,0.7)', border: '1px solid #334155', color: '#e5e7eb', borderRadius: 16 }}>
        <h2 style={{ color: '#a7f3d0', marginBottom: 16 }}>Settings</h2>

        <div style={{ display: 'grid', gap: 16 }}>

          <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <input type="checkbox" checked={settings.emailNotifications} onChange={() => handleToggle('emailNotifications')} />
            Email notifications
          </label>

          <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <input type="checkbox" checked={settings.showProfilePublic} onChange={() => handleToggle('showProfilePublic')} />
            Show my profile publicly
          </label>

          <div>
            <label className="form-label" style={{ color: '#93c5fd' }}>Language</label>
            <select className="form-input" name="language" value={settings.language} onChange={handleChange}>
              <option value="en">English</option>
              <option value="hi">Hindi</option>
              <option value="ta">Tamil</option>
              <option value="te">Telugu</option>
            </select>
          </div>

          <div style={{ display: 'flex', gap: 12, marginTop: 12, flexWrap: 'wrap' }}>
            <button className="btn btn-secondary" onClick={() => { localStorage.clear(); window.location.reload(); }}>Clear local data</button>
            <button className="btn btn-danger" onClick={onLogout}>Logout</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;







