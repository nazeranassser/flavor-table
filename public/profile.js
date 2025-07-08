// profile.js

const token = localStorage.getItem('token');

if (!token) {
  alert('You must be logged in to view your profile.');
  window.location.href = 'login.html'; // إعادة توجيه لصفحة تسجيل الدخول
}

axios.get('/api/auth/profile', {
  headers: {
    Authorization: `Bearer ${token}`,
  },
})
.then(response => {
  const user = response.data;
  document.getElementById('profileInfo').innerHTML = `
    <p><strong>Username:</strong> ${user.username}</p>
    <p><strong>Email:</strong> ${user.email}</p>
  `;
})
.catch(error => {
  console.error('Error loading profile:', error);
  alert('Failed to load profile. Please login again.');
  localStorage.removeItem('token');
  window.location.href = 'login.html';
});

// Logout functionality
document.getElementById('logoutBtn').addEventListener('click', () => {
  localStorage.removeItem('token');
  window.location.href = 'login.html';
});
