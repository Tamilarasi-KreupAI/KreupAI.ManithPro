// Debug utility to check authentication status

export const checkAuthStatus = () => {
  const token = localStorage.getItem('token');
  const user = localStorage.getItem('user');

  console.group('🔐 Authentication Debug');
  console.log('Token exists:', !!token);
  console.log('Token preview:', token ? `${token.substring(0, 20)}...` : 'No token');
  console.log('User data:', user ? JSON.parse(user) : 'No user data');
  console.groupEnd();

  return {
    hasToken: !!token,
    hasUser: !!user,
    token: token || null,
    user: user ? JSON.parse(user) : null,
  };
};

export const testMessageAPI = async () => {
  const auth = checkAuthStatus();

  if (!auth.hasToken) {
    console.error('❌ No token found. Please login first.');
    return;
  }

  console.log('🧪 Testing message API...');

  try {
    const response = await fetch('http://localhost:5001/api/messages/conversations', {
      headers: {
        'Authorization': `Bearer ${auth.token}`,
        'Content-Type': 'application/json',
      },
    });

    console.log('Response status:', response.status);
    const data = await response.json();
    console.log('Response data:', data);

    if (response.ok) {
      console.log('✅ Message API working!');
    } else {
      console.error('❌ Message API error:', data);
    }
  } catch (error) {
    console.error('❌ Network error:', error);
  }
};

// Quick test function you can run in console
(window as any).checkAuth = checkAuthStatus;
(window as any).testMessages = testMessageAPI;
