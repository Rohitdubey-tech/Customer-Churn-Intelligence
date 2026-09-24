import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('churnly_user');
    return saved ? JSON.parse(saved) : {
      email: 'demo@churnintelligence.ai',
      name: 'Demo CSM User',
      role: 'CSM',
      mode: 'demo' // 'demo' or 'custom'
    };
  });

  const [customDataset, setCustomDataset] = useState(() => {
    const saved = localStorage.getItem('churnly_custom_data');
    return saved ? JSON.parse(saved) : null;
  });

  useEffect(() => {
    if (user) {
      localStorage.setItem('churnly_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('churnly_user');
    }
  }, [user]);

  useEffect(() => {
    if (customDataset) {
      localStorage.setItem('churnly_custom_data', JSON.stringify(customDataset));
    } else {
      localStorage.removeItem('churnly_custom_data');
    }
  }, [customDataset]);

  const loginDemo = () => {
    setUser({
      email: 'demo@churnintelligence.ai',
      name: 'Demo CSM User',
      role: 'CSM',
      mode: 'demo'
    });
  };

  const loginCustom = (email, name = "Enterprise Executive") => {
    setUser({
      email: email,
      name: name,
      role: 'CSM',
      mode: 'custom'
    });
    setCustomDataset(null); // Clear custom dataset on new custom login
  };

  const logout = () => {
    setUser(null);
    setCustomDataset(null);
    localStorage.removeItem('churnly_user');
    localStorage.removeItem('churnly_custom_data');
  };

  const updateCustomDataset = (data) => {
    setCustomDataset(data);
  };

  return (
    <AuthContext.Provider value={{
      user,
      isLoggedIn: !!user,
      isDemo: user?.mode === 'demo',
      customDataset,
      loginDemo,
      loginCustom,
      logout,
      updateCustomDataset
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
