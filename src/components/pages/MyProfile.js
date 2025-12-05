import React, { useEffect, useRef, useState } from 'react';
import { changePassword, PASSWORD_HELPER, validatePassword, updateProfile } from '../../services/usersService';


const MyProfile = ({ user, onUpdateUser }) => {
  const [profile, setProfile] = useState({
    name: '',
    email: '',
    username: '',
    age: '',
    gender: '',
    mobile: '',
    hobbies: '',
    interests: '',
    avatar: ''
  });
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [passwordForm, setPasswordForm] = useState({ newPassword: '', confirmPassword: '' });
  const [passwordError, setPasswordError] = useState('');
  const [isPasswordSaving, setIsPasswordSaving] = useState(false);
  const [isAvatarMenuOpen, setIsAvatarMenuOpen] = useState(false);
  const [isAvatarPreviewOpen, setIsAvatarPreviewOpen] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (!user) return;
  
    setProfile({
      name: user.name || '',
      email: user.email || '',
      username: user.username || '',
      age: user.age || '',
      gender: user.gender || '',
      mobile: user.mobile || '',
      hobbies: user.hobbies || '',
      interests: user.interests || '',
      avatar: user.avatar || ''
    });
  }, [user]);


  if (!user) {
    return (
      <div className="container">
        <div className="card p-4" style={{ marginTop: 24 }}>
          <h2>Please login to view your profile.</h2>
        </div>
      </div>
    );
  }

  const followersCount = user?.followers?.length || 0;

  const handleChange = (e) => {
    const { name, value, files } = e.target;
  
    if (name === 'avatar' && files && files[0]) {
      const reader = new FileReader();
      reader.onload = () => {
        const next = { ...profile, avatar: reader.result };
        setProfile(next);
  
        // ✅ only update UI now; DB update happens on SAVE
        if (onUpdateUser) {
          onUpdateUser({ avatar: reader.result });
        }
  
        setIsAvatarMenuOpen(false);
      };
      reader.readAsDataURL(files[0]);
      return;
    }
  
    setProfile({ ...profile, [name]: value });
  };


const handleSave = async () => {
  try {
    const updatedUser = await updateProfile(user.id, profile);

    if (onUpdateUser) {
      onUpdateUser(updatedUser); // ✅ update global state only
    }

    // ❌ DO NOT STORE USER IN LOCALSTORAGE (AVATAR IS TOO LARGE)
    // localStorage.setItem('user', JSON.stringify(updatedUser));

    alert('Profile saved successfully');
  } catch (err) {
    alert(err.message || 'Failed to save profile');
  }
};



  const handleAvatarClick = () => {
    if (!profile.avatar) {
      // If no avatar yet, trigger file picker directly
      if (fileInputRef.current) {
        fileInputRef.current.click();
      }
      return;
    }
    setIsAvatarMenuOpen((open) => !open);
  };

  const handleViewAvatar = () => {
    setIsAvatarPreviewOpen(true);
    setIsAvatarMenuOpen(false);
  };

  const handleChangeAvatar = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
    setIsAvatarMenuOpen(false);
  };

  const handleOpenPasswordModal = () => {
    setPasswordForm({ newPassword: '', confirmPassword: '' });
    setPasswordError('');
    setIsPasswordModalOpen(true);
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordForm((prev) => ({ ...prev, [name]: value }));
    setPasswordError('');
  };

  const handlePasswordSave = async () => {
    if (!passwordForm.newPassword) {
      setPasswordError('New password is required');
      return;
    }
    if (!validatePassword(passwordForm.newPassword)) {
      setPasswordError(PASSWORD_HELPER);
      return;
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordError('Passwords do not match');
      return;
    }
    setIsPasswordSaving(true);
    try {
      await changePassword(user.id, passwordForm.newPassword);
      alert('Password updated successfully');
      setIsPasswordModalOpen(false);
    } catch (err) {
      setPasswordError(err.message || 'Failed to update password');
    } finally {
      setIsPasswordSaving(false);
    }
  };

  return (
    <div className="container">
      <div className="card p-4" style={{ marginTop: 24, background: 'rgba(15,23,42,0.7)', border: '1px solid #334155', color: '#e5e7eb', borderRadius: 16 }}>
        <h2 style={{ marginBottom: 16, color: '#a7f3d0' }}>My Profile</h2>

        <div
          style={{
            display: 'flex',
            gap: 24,
            alignItems: 'flex-start',
            flexWrap: 'wrap',
            flexDirection: window.innerWidth < 768 ? 'column' : 'row'
          }}
        >

          <div
            style={{
              width: window.innerWidth < 768 ? '100%' : 120,
              position: 'relative',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center'
            }}
          >

            <button
              type="button"
              onClick={handleAvatarClick}
              style={{
                width: 120,
                height: 120,
                borderRadius: '50%',
                overflow: 'hidden',
                border: '2px solid #334155',
                background: '#0f172a',
                padding: 0,
                cursor: 'pointer'
              }}
            >
              {profile.avatar ? (
                <img src={profile.avatar} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8' }}>No Photo</div>
              )}
            </button>
            {!profile.avatar && (
              <label className="btn btn-secondary" style={{ marginTop: 12, display: 'inline-block' }}>
                Upload Photo
                <input
                  ref={fileInputRef}
                  type="file"
                  name="avatar"
                  accept="image/*"
                  onChange={handleChange}
                  style={{ display: 'none' }}
                />
              </label>
            )}
            {/* hidden input used when changing avatar after it exists */}
            {profile.avatar && (
              <input
                ref={fileInputRef}
                type="file"
                name="avatar"
                accept="image/*"
                onChange={handleChange}
                style={{ display: 'none' }}
              />
            )}
            {isAvatarMenuOpen && profile.avatar && (
              <div
                style={{
                  position: 'absolute',
                  top: 130,
                  left: 0,
                  background: 'rgba(15,23,42,0.98)',
                  border: '1px solid #334155',
                  borderRadius: 12,
                  padding: 8,
                  boxShadow: '0 12px 24px rgba(0,0,0,0.45)',
                  zIndex: 20,
                  minWidth: 160
                }}
              >
                <button
                  type="button"
                  className="btn btn-secondary"
                  style={{ width: '100%', marginBottom: 6 }}
                  onClick={handleViewAvatar}
                >
                  View profile picture
                </button>
                <button
                  type="button"
                  className="btn btn-primary"
                  style={{ width: '100%' }}
                  onClick={handleChangeAvatar}
                >
                  Change picture
                </button>
              </div>
            )}
            {profile.username && (
              <p style={{ marginTop: 12, textAlign: 'center', color: '#facc15', fontWeight: 600 }}>
                @{profile.username}
              </p>
            )}
            <p style={{ marginTop: 4, textAlign: 'center', color: '#a5b4fc', fontSize: 14 }}>
              Followers: {followersCount}
            </p>
          </div>

          <div
            style={{
              flex: 1,
              minWidth: 260,
              display: 'grid',
              gridTemplateColumns: window.innerWidth < 768
                ? '1fr'
                : 'repeat(2, minmax(220px, 1fr))',
              gap: 16,
              width: '100%'
            }}
          >

            <div>
              <label className="form-label" style={{ color: '#93c5fd' }}>Name</label>
              <input className="form-input" name="name" value={profile.name} onChange={handleChange} />
            </div>
            <div>
              <label className="form-label" style={{ color: '#93c5fd' }}>Email</label>
              <input className="form-input" name="email" value={profile.email} onChange={handleChange} />
            </div>
            <div>
              <label className="form-label" style={{ color: '#93c5fd' }}>Age</label>
              <input className="form-input" name="age" value={profile.age} onChange={handleChange} placeholder="e.g., 24" />
            </div>
            <div>
              <label className="form-label" style={{ color: '#93c5fd' }}>Gender</label>
              <select className="form-input" name="gender" value={profile.gender} onChange={handleChange}>
                <option value="">Select</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
                <option value="Prefer not to say">Prefer not to say</option>
              </select>
            </div>
            <div>
              <label className="form-label" style={{ color: '#93c5fd' }}>Mobile</label>
              <input className="form-input" name="mobile" value={profile.mobile} onChange={handleChange} placeholder="e.g., +91 98765 43210" />
            </div>
            <div>
              <label className="form-label" style={{ color: '#93c5fd' }}>Hobbies</label>
              <input className="form-input" name="hobbies" value={profile.hobbies} onChange={handleChange} placeholder="Reading, Travel..." />
            </div>
            <div style={{ gridColumn: '1 / -1' }}>
              <label className="form-label" style={{ color: '#93c5fd' }}>Interests</label>
              <textarea className="form-textarea" rows={3} name="interests" value={profile.interests} onChange={handleChange} placeholder="Tell us more about your interests..." />
            </div>
          </div>
        </div>
        <div style={{ marginTop: 16, display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <button className="btn btn-primary" onClick={handleSave}>Save</button>
          <button className="btn btn-secondary" onClick={handleOpenPasswordModal}>
            Change Password
          </button>
        </div>
      </div>

      {isPasswordModalOpen && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            background: 'rgba(0,0,0,0.6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: 16,
          }}
        >
          <div
            style={{
              background: 'rgba(15,23,42,0.95)',
              border: '1px solid #334155',
              borderRadius: 16,
              padding: 24,
              width: '100%',
              maxWidth: 420,
              color: '#e5e7eb',
              boxShadow: '0 20px 40px rgba(0,0,0,0.4)',
            }}
          >
            <h3 style={{ marginTop: 0, marginBottom: 16 }}>Change Password</h3>
            <p style={{ marginTop: 0, marginBottom: 16, color: '#94a3b8', fontSize: 14 }}>
              {PASSWORD_HELPER}
            </p>
            <div className="form-group" style={{ marginBottom: 16 }}>
              <label className="form-label">New Password</label>
              <input
                type="password"
                name="newPassword"
                className="form-input"
                value={passwordForm.newPassword}
                onChange={handlePasswordChange}
                disabled={isPasswordSaving}
              />
            </div>
            <div className="form-group" style={{ marginBottom: 16 }}>
              <label className="form-label">Confirm New Password</label>
              <input
                type="password"
                name="confirmPassword"
                className="form-input"
                value={passwordForm.confirmPassword}
                onChange={handlePasswordChange}
                disabled={isPasswordSaving}
              />
            </div>
            {passwordError && (
              <div style={{ color: '#fecaca', marginBottom: 12 }}>{passwordError}</div>
            )}
            <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
              <button
                className="btn btn-secondary"
                onClick={() => setIsPasswordModalOpen(false)}
                disabled={isPasswordSaving}
              >
                Cancel
              </button>
              <button
                className="btn btn-primary"
                onClick={handlePasswordSave}
                disabled={isPasswordSaving}
              >
                {isPasswordSaving ? 'Saving...' : 'Update Password'}
              </button>
            </div>
          </div>
        </div>
      )}

      {isAvatarPreviewOpen && profile.avatar && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.85)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: 16
          }}
          onClick={() => setIsAvatarPreviewOpen(false)}
        >
          <div
            style={{
              position: 'relative',
              width: '90vw',
              maxWidth: 480,
              aspectRatio: '1 / 1',
              background: '#020617',
              borderRadius: 24,
              overflow: 'hidden',
              border: '1px solid #334155',
              boxShadow: '0 20px 40px rgba(0,0,0,0.8)'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setIsAvatarPreviewOpen(false)}
              style={{
                position: 'absolute',
                top: 12,
                right: 12,
                width: 32,
                height: 32,
                borderRadius: '999px',
                border: '1px solid #64748b',
                background: 'rgba(15,23,42,0.9)',
                color: '#e5e7eb',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 2
              }}
              aria-label="Close"
            >
              ✕
            </button>
            <img
              src={profile.avatar}
              alt="Profile preview"
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default MyProfile;







