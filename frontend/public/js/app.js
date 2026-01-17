// API Base URL
const API_BASE = window.location.origin;
let authToken = localStorage.getItem('authToken');

// API Helper Functions
async function apiRequest(endpoint, options = {}) {
    try {
        const url = `${API_BASE}${endpoint}`;
        const headers = {
            'Content-Type': 'application/json',
            ...options.headers
        };

        if (authToken) {
            headers['Authorization'] = `Bearer ${authToken}`;
        }

        const response = await fetch(url, {
            ...options,
            headers
        });

        if (response.status === 401) {
            logout();
            return null;
        }

        if (!response.ok && response.status !== 404) {
            const errorData = await response.json().catch(() => ({ error: 'Server error' }));
            throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error('API Request Error:', error);
        if (error.message) {
            throw error;
        }
        throw new Error('Network error or server unreachable');
    }
}

// Login
async function login(username, password) {
    try {
        if (!username || !password) {
            throw new Error('Username va password kiritilishi shart');
        }

        const data = await apiRequest('/api/v1/auth/login', {
            method: 'POST',
            body: JSON.stringify({ username: username.trim(), password })
        });

        if (data && data.success && data.data && data.data.token) {
            authToken = data.data.token;
            localStorage.setItem('authToken', authToken);
            localStorage.setItem('user', JSON.stringify(data.data.user));
            return { success: true };
        }
        
        return { 
            success: false, 
            error: data?.error || 'Login muvaffaqiyatsiz. Username yoki password noto\'g\'ri.' 
        };
    } catch (error) {
        console.error('Login error:', error);
        return { 
            success: false, 
            error: error.message || 'Login jarayonida xato yuz berdi' 
        };
    }
}

// Logout
function logout() {
    authToken = null;
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    showPage('login');
}

// Page Navigation
function showPage(page) {
    console.log('showPage called with:', page);
    
    // Security: Hide dashboard completely when showing login
    const dashboardPage = document.getElementById('dashboard-page');
    const loginPage = document.getElementById('login-page');
    
    if (page === 'login') {
        // Hide dashboard completely for security
        if (dashboardPage) {
            dashboardPage.classList.add('hidden');
            dashboardPage.style.display = 'none';
            dashboardPage.style.visibility = 'hidden';
            dashboardPage.style.position = 'absolute';
            dashboardPage.style.left = '-9999px';
            dashboardPage.style.top = '-9999px';
            dashboardPage.style.width = '0';
            dashboardPage.style.height = '0';
            dashboardPage.style.overflow = 'hidden';
        }
        
        // Show login page
        if (loginPage) {
            loginPage.classList.remove('hidden');
            loginPage.style.display = 'flex';
            loginPage.style.visibility = 'visible';
            loginPage.style.position = 'relative';
            loginPage.style.left = 'auto';
            loginPage.style.top = 'auto';
            loginPage.style.width = 'auto';
            loginPage.style.height = 'auto';
            loginPage.style.overflow = 'visible';
        }
        
        // Remove logged-in class from body
        document.body.classList.remove('logged-in');
        
        // Scroll to top when showing login page
        setTimeout(() => {
            window.scrollTo({ top: 0, behavior: 'instant' });
            document.body.scrollTop = 0;
            document.documentElement.scrollTop = 0;
        }, 0);
        return;
    }
    
    // Hide login page completely when showing dashboard
    if (loginPage) {
        loginPage.classList.add('hidden');
        loginPage.style.display = 'none';
        loginPage.style.visibility = 'hidden';
        loginPage.style.position = 'absolute';
        loginPage.style.left = '-9999px';
        loginPage.style.top = '-9999px';
        loginPage.style.width = '0';
        loginPage.style.height = '0';
        loginPage.style.overflow = 'hidden';
    }
    
    // Show dashboard and add logged-in class to body
    if (dashboardPage) {
        dashboardPage.classList.remove('hidden');
        dashboardPage.style.display = '';
        dashboardPage.style.visibility = '';
        dashboardPage.style.position = '';
        dashboardPage.style.left = '';
        dashboardPage.style.top = '';
        dashboardPage.style.width = '';
        dashboardPage.style.height = '';
        dashboardPage.style.overflow = '';
    }
    
    document.body.classList.add('logged-in');
    
    // Hide all content sections first
    document.querySelectorAll('.content-section').forEach(s => {
        if (s) s.classList.add('hidden');
    });
    
    // Remove active class from all menu items
    document.querySelectorAll('.menu-item').forEach(m => {
        if (m) m.classList.remove('active');
    });
    
    // Show selected content section or page
    let pageElement = document.getElementById(page + '-content');
    if (!pageElement) {
        pageElement = document.getElementById(page + '-page');
    }
    if (!pageElement) {
        pageElement = document.getElementById(page);
    }
    
    if (pageElement) {
        pageElement.classList.remove('hidden');
        console.log('Page element found and shown:', page, pageElement.id);
    } else {
        console.error('Page element not found:', page);
        // Show dashboard content as fallback
        const dashboardContent = document.getElementById('dashboard-content');
        if (dashboardContent) {
            dashboardContent.classList.remove('hidden');
        }
    }
    
    // Set active menu item
    const menuItem = document.querySelector(`[data-page="${page}"]`);
    if (menuItem) {
        menuItem.classList.add('active');
    }
    
    // Scroll to top when changing pages - use timeout to ensure DOM is ready
    setTimeout(() => {
        window.scrollTo({ top: 0, behavior: 'instant' });
        // Also scroll document body and html elements
        document.body.scrollTop = 0;
        document.documentElement.scrollTop = 0;
    }, 0);
    
    // Load page-specific data
    loadPageData(page);
}

// Load Page Data
async function loadPageData(page) {
    switch(page) {
        case 'dashboard':
            await loadDashboard();
            // Auto refresh every 30 seconds
            if (window.dashboardInterval) clearInterval(window.dashboardInterval);
            window.dashboardInterval = setInterval(loadDashboard, 30000);
            break;
        case 'extensions':
            await loadExtensions();
            break;
        case 'calls':
            await loadCalls();
            break;
        case 'recordings':
            await loadRecordings();
            break;
        case 'ivr':
            await loadIVR();
            break;
        case 'queues':
            await loadQueues();
            break;
        case 'did-numbers':
            await loadDIDNumbers();
            break;
        case 'phone':
            await loadPhone();
            break;
        case 'stats':
            await loadStats();
            break;
    }
}

// Dashboard
async function loadDashboard() {
    const stats = await apiRequest('/api/v1/stats/dashboard');
    if (stats && stats.success) {
        document.getElementById('stat-total-calls').textContent = stats.data.totalCalls || 0;
        document.getElementById('stat-active-calls').textContent = stats.data.activeCalls || 0;
        document.getElementById('stat-extensions').textContent = stats.data.totalExtensions || 0;
        document.getElementById('stat-online-extensions').textContent = stats.data.onlineExtensions || 0;
    }
}

// Extensions
async function loadExtensions() {
    try {
        const tbody = document.getElementById('extensions-table-body');
        if (!tbody) {
            console.error('Extensions table body not found');
            return;
        }

        tbody.innerHTML = '<tr><td colspan="5" style="text-align: center; padding: 20px;">Yuklanmoqda...</td></tr>';

        const extensions = await apiRequest('/api/v1/extensions');
        
        if (extensions && extensions.success) {
            if (extensions.data && extensions.data.length > 0) {
                tbody.innerHTML = extensions.data.map(ext => `
                    <tr>
                        <td><strong>${escapeHtml(ext.username)}</strong></td>
                        <td>${escapeHtml(ext.displayName || '-')}</td>
                        <td>${escapeHtml(ext.email || '-')}</td>
                        <td>
                            <span class="status-badge ${ext.enabled ? 'status-enabled' : 'status-disabled'}">
                                ${ext.enabled ? 'Faol' : 'Nofaol'}
                            </span>
                        </td>
                        <td>
                            <button class="btn btn-sm view-ext-btn" data-id="${ext.id}" title="Ko'rish">👁️</button>
                            <button class="btn btn-sm edit-ext-btn" data-id="${ext.id}" title="Tahrirlash">✏️</button>
                            <button class="btn btn-sm btn-danger delete-ext-btn" data-id="${ext.id}" title="O'chirish">🗑️</button>
                        </td>
                    </tr>
                `).join('');
            } else {
                tbody.innerHTML = '<tr><td colspan="5" style="text-align: center; padding: 20px;">Extensions topilmadi. Birinchi extensionni yarating.</td></tr>';
            }
        } else {
            tbody.innerHTML = '<tr><td colspan="5" style="text-align: center; padding: 20px; color: red;">Xato: ' + (extensions?.error || 'Noma\'lum xato') + '</td></tr>';
        }
    } catch (error) {
        console.error('Load extensions error:', error);
        const tbody = document.getElementById('extensions-table-body');
        if (tbody) {
            tbody.innerHTML = '<tr><td colspan="5" style="text-align: center; padding: 20px; color: red;">Xato: ' + error.message + '</td></tr>';
        }
    }
}

// Calls
async function loadCalls() {
    const calls = await apiRequest('/api/v1/calls?limit=50');
    const tbody = document.getElementById('calls-table-body');
    
    if (calls && calls.success && calls.data.length > 0) {
        tbody.innerHTML = calls.data.map(call => `
            <tr>
                <td>${call.fromNumber || '-'}</td>
                <td>${call.toNumber || '-'}</td>
                <td><span class="badge badge-${call.direction}">${call.direction}</span></td>
                <td><span class="status-badge status-${call.status}">${call.status}</span></td>
                <td>${formatDuration(call.duration || 0)}</td>
                <td>${new Date(call.startedAt).toLocaleString()}</td>
                <td><button class="btn btn-sm view-call-btn" data-id="${call.id}" title="Ko'rish">👁️</button></td>
            </tr>
        `).join('');
    } else {
        tbody.innerHTML = '<tr><td colspan="7" style="text-align: center; padding: 20px;">Qo\'ng\'iroqlar topilmadi.</td></tr>';
    }
}

// Recordings
async function loadRecordings() {
    const recordings = await apiRequest('/api/v1/recordings?limit=50');
    const tbody = document.getElementById('recordings-table-body');
    
    if (recordings && recordings.success && recordings.data.length > 0) {
        tbody.innerHTML = recordings.data.map(rec => `
            <tr>
                <td>${rec.fileName}</td>
                <td>${formatDuration(rec.duration || 0)}</td>
                <td>${formatFileSize(rec.fileSize || 0)}</td>
                <td>${new Date(rec.createdAt).toLocaleString()}</td>
                <td>
                    <button class="btn btn-sm download-rec-btn" data-id="${rec.id}" title="Yuklab olish">⬇️</button>
                    <button class="btn btn-sm btn-danger delete-rec-btn" data-id="${rec.id}" title="O'chirish">🗑️</button>
                </td>
            </tr>
        `).join('');
    } else {
        tbody.innerHTML = '<tr><td colspan="5" style="text-align: center; padding: 20px;">Recordinglar topilmadi.</td></tr>';
    }
}

// IVR Menus
async function loadIVR() {
    const ivrMenus = await apiRequest('/api/v1/ivr-menus');
    const tbody = document.getElementById('ivr-table-body');
    
    if (ivrMenus && ivrMenus.success && ivrMenus.data.length > 0) {
        tbody.innerHTML = ivrMenus.data.map(ivr => `
            <tr>
                <td>${ivr.name}</td>
                <td>${ivr.description || '-'}</td>
                <td><span class="status-badge ${ivr.enabled ? 'status-enabled' : 'status-disabled'}">${ivr.enabled ? 'Enabled' : 'Disabled'}</span></td>
                <td>
                    <button class="btn btn-sm edit-ivr-btn" data-id="${ivr.id}" title="Tahrirlash">✏️</button>
                    <button class="btn btn-sm btn-danger delete-ivr-btn" data-id="${ivr.id}" title="O'chirish">🗑️</button>
                </td>
            </tr>
        `).join('');
    } else {
        tbody.innerHTML = '<tr><td colspan="4" style="text-align: center; padding: 20px;">IVR menular topilmadi.</td></tr>';
    }
}

// Queues
async function loadQueues() {
    const queues = await apiRequest('/api/v1/queues');
    const tbody = document.getElementById('queues-table-body');
    
    if (queues && queues.success && queues.data.length > 0) {
        tbody.innerHTML = queues.data.map(queue => `
            <tr>
                <td>${queue.name}</td>
                <td>${queue.description || '-'}</td>
                <td>${queue.strategy}</td>
                <td><span class="status-badge ${queue.enabled ? 'status-enabled' : 'status-disabled'}">${queue.enabled ? 'Enabled' : 'Disabled'}</span></td>
                <td>
                    <button class="btn btn-sm view-queue-btn" data-id="${queue.id}" title="Ko'rish">👁️</button>
                    <button class="btn btn-sm edit-queue-btn" data-id="${queue.id}" title="Tahrirlash">✏️</button>
                    <button class="btn btn-sm btn-danger delete-queue-btn" data-id="${queue.id}" title="O'chirish">🗑️</button>
                </td>
            </tr>
        `).join('');
    } else {
        tbody.innerHTML = '<tr><td colspan="5" style="text-align: center; padding: 20px;">Queuelar topilmadi.</td></tr>';
    }
}

// Statistics
async function loadStats() {
    const stats = await apiRequest('/api/v1/stats/dashboard');
    if (stats && stats.success) {
        document.getElementById('stats-total-calls').textContent = stats.data.totalCalls || 0;
        document.getElementById('stats-today-calls').textContent = stats.data.todayCalls || 0;
        document.getElementById('stats-today-duration').textContent = formatDuration(stats.data.todayDuration || 0);
    }
}

// Helper Functions
function formatDuration(seconds) {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    if (hours > 0) {
        return `${hours}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    }
    return `${minutes}:${String(secs).padStart(2, '0')}`;
}

function formatFileSize(bytes) {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}

function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Extension Modal Functions
function openExtensionModal(mode = 'add', extensionId = null) {
    const modal = document.getElementById('extension-modal');
    const form = document.getElementById('extension-form');
    const title = document.getElementById('extension-modal-title');
    const submitBtn = document.getElementById('extension-modal-submit');
    
    // Reset form
    form.reset();
    document.getElementById('extension-id').value = '';
    document.getElementById('extension-enabled').checked = true;
    
    if (mode === 'add') {
        title.textContent = 'Extension Qo\'shish';
        submitBtn.textContent = 'Qo\'shish';
        document.getElementById('extension-password').required = true;
    } else if (mode === 'edit') {
        title.textContent = 'Extension Tahrirlash';
        submitBtn.textContent = 'Saqlash';
        document.getElementById('extension-password').required = false;
        document.getElementById('extension-username').readOnly = true;
        
        // Load extension data
        loadExtensionForEdit(extensionId);
    }
    
    modal.classList.remove('hidden');
}

function closeExtensionModal() {
    const modal = document.getElementById('extension-modal');
    modal.classList.add('hidden');
    document.getElementById('extension-form').reset();
    document.getElementById('extension-username').readOnly = false;
}

async function loadExtensionForEdit(id) {
    try {
        const extension = await apiRequest(`/api/v1/extensions/${id}`);
        if (extension && extension.success) {
            const ext = extension.data;
            document.getElementById('extension-id').value = ext.id;
            document.getElementById('extension-username').value = ext.username || '';
            document.getElementById('extension-display-name').value = ext.displayName || '';
            document.getElementById('extension-email').value = ext.email || '';
            document.getElementById('extension-enabled').checked = ext.enabled !== false;
        }
    } catch (error) {
        alert('Xato: ' + error.message);
        closeExtensionModal();
    }
}

// Extension Functions
async function addExtension() {
    openExtensionModal('add');
}

async function handleExtensionFormSubmit(e) {
    e.preventDefault();
    
    const form = e.target;
    const formData = new FormData(form);
    const extensionId = document.getElementById('extension-id').value;
    const mode = extensionId ? 'edit' : 'add';
    
    const payload = {};
    
    // Edit rejimida username yuborilmaydi (username o'zgarmaydi)
    if (mode === 'add') {
        payload.username = formData.get('username').trim();
    }
    
    // Boshqa maydonlar
    const displayName = formData.get('displayName')?.trim();
    const email = formData.get('email')?.trim();
    
    if (displayName) payload.displayName = displayName;
    else payload.displayName = null;
    
    if (email) payload.email = email;
    else payload.email = null;
    
    payload.enabled = formData.get('enabled') === 'on';
    
    // Validation (faqat add rejimida)
    if (mode === 'add') {
        if (!payload.username || payload.username.length < 3 || payload.username.length > 50) {
            alert('Username 3-50 belgi orasida bo\'lishi kerak');
            return;
        }
        
        if (!/^[0-9A-Za-z]+$/.test(payload.username)) {
            alert('Username faqat raqam va harflardan iborat bo\'lishi kerak');
            return;
        }
    }
    
    const password = formData.get('password');
    if (mode === 'add') {
        if (!password || password.length < 6) {
            alert('Parol kamida 6 belgi bo\'lishi kerak');
            return;
        }
        payload.password = password;
    } else if (mode === 'edit' && password && password.length > 0) {
        if (password.length < 6) {
            alert('Parol kamida 6 belgi bo\'lishi kerak');
            return;
        }
        payload.password = password;
    }
    
    const submitBtn = document.getElementById('extension-modal-submit');
    const originalText = submitBtn.textContent;
    submitBtn.disabled = true;
    submitBtn.textContent = 'Saqlanmoqda...';
    
    try {
        const url = mode === 'add' 
            ? '/api/v1/extensions' 
            : `/api/v1/extensions/${extensionId}`;
        const method = mode === 'add' ? 'POST' : 'PUT';
        
        const data = await apiRequest(url, {
            method: method,
            body: JSON.stringify(payload)
        });
        
        if (data && data.success) {
            if (mode === 'add' && data.data.sipAccount) {
                const sipInfo = `
Extension yaratildi!

SIP Account Ma'lumotlari:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Username: ${payload.username}
Password: ${payload.password}
Server: ${data.data.sipAccount.server}
Port: ${data.data.sipAccount.port}
Transport: ${data.data.sipAccount.transport || 'UDP'}
Domain: ${data.data.sipAccount.domain}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Bu ma'lumotlarni SIP telefon sozlamalariga kiriting.
                `;
                alert(sipInfo);
            } else {
                alert('Extension muvaffaqiyatli ' + (mode === 'add' ? 'yaratildi' : 'yangilandi'));
            }
            closeExtensionModal();
            await loadExtensions();
        } else {
            // Validation xatolarini batafsil ko'rsatish
            let errorMsg = data?.error || 'Noma\'lum xato';
            if (data?.details && Array.isArray(data.details) && data.details.length > 0) {
                errorMsg += '\n\nBatafsil:\n' + data.details.map(d => `- ${d.field}: ${d.message}`).join('\n');
            }
            alert('Xato: ' + errorMsg);
        }
    } catch (error) {
        console.error('Extension save error:', error);
        let errorMsg = error.message || 'Noma\'lum xato';
        
        // Validation xatolarini batafsil ko'rsatish
        if (error.errorData && error.errorData.details && Array.isArray(error.errorData.details)) {
            errorMsg += '\n\nBatafsil:\n' + error.errorData.details.map(d => `- ${d.field}: ${d.message}`).join('\n');
        } else if (error.errorData && error.errorData.error) {
            if (error.errorData.details && Array.isArray(error.errorData.details)) {
                errorMsg = error.errorData.error + '\n\nBatafsil:\n' + error.errorData.details.map(d => `- ${d.field}: ${d.message}`).join('\n');
            } else {
                errorMsg = error.errorData.error;
            }
        }
        
        alert('Xato: ' + errorMsg);
    } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = originalText;
    }
}

async function deleteExtension(id) {
    if (!confirm('Bu extensionni o\'chirishni xohlaysizmi?\n\nEslatma: Barcha ma\'lumotlar o\'chib ketadi!')) return;
    
    try {
        const data = await apiRequest(`/api/v1/extensions/${id}`, {
            method: 'DELETE'
        });
        
        if (data && data.success) {
            alert('Extension muvaffaqiyatli o\'chirildi');
            await loadExtensions();
        } else {
            alert('Xato: ' + (data?.error || 'Noma\'lum xato'));
        }
    } catch (error) {
        console.error('Delete extension error:', error);
        alert('Xato: ' + error.message);
    }
}

async function viewExtension(id) {
    const extension = await apiRequest(`/api/v1/extensions/${id}`);
    if (extension && extension.success) {
        const ext = extension.data;
        const status = await apiRequest(`/api/v1/extensions/${id}/status`);
        const onlineStatus = status && status.data ? (status.data.online ? 'Online' : 'Offline') : 'Unknown';
        
        const info = `
Extension Ma'lumotlari:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Username: ${ext.username}
Display Name: ${ext.displayName || '-'}
Email: ${ext.email || '-'}
Status: ${ext.enabled ? 'Enabled' : 'Disabled'}
Online: ${onlineStatus}
Call Forward: ${ext.callForwardEnabled ? 'Enabled → ' + ext.callForwardNumber : 'Disabled'}
Voicemail: ${ext.voicemailEnabled ? 'Enabled' : 'Disabled'}
Recording: ${ext.recordingEnabled ? 'Enabled' : 'Disabled'}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        `;
        alert(info);
    }
}

// Recording Functions
async function downloadRecording(id) {
    const token = localStorage.getItem('authToken');
    const url = `${API_BASE}/api/v1/recordings/${id}/download`;
    
    // Fetch bilan yuklab olish
    try {
        const response = await fetch(url, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (response.ok) {
            const blob = await response.blob();
            const recording = await apiRequest(`/api/v1/recordings/${id}`);
            const fileName = recording && recording.success ? recording.data.fileName : `recording-${id}.wav`;
            
            const link = document.createElement('a');
            link.href = window.URL.createObjectURL(blob);
            link.download = fileName;
            link.click();
        } else {
            alert('Recording yuklab olishda xato');
        }
    } catch (error) {
        alert('Xato: ' + error.message);
    }
}

async function deleteRecording(id) {
    if (!confirm('Bu recordingni o\'chirishni xohlaysizmi?')) return;
    
    try {
        const data = await apiRequest(`/api/v1/recordings/${id}`, {
            method: 'DELETE'
        });
        
        if (data && data.success) {
            alert('Recording o\'chirildi');
            loadRecordings();
        } else {
            alert('Xato: ' + (data?.error || 'Noma\'lum xato'));
        }
    } catch (error) {
        alert('Xato: ' + error.message);
    }
}

// IVR Functions
async function addIVR() {
    const name = prompt('IVR nomi kiriting:');
    if (!name) return;
    
    const description = prompt('Tavsif (ixtiyoriy):') || '';
    const timeout = parseInt(prompt('Timeout (sekund, default: 10):') || '10');
    const maxAttempts = parseInt(prompt('Maksimal urinishlar (default: 3):') || '3');
    
    // Oddiy config - keyinchalik yaxshilash mumkin
    const config = {
        "0": { "action": "extension", "target": "1001" },
        "1": { "action": "queue", "target": "1" },
        "2": { "action": "voicemail", "target": "1001" }
    };
    
    try {
        const data = await apiRequest('/api/v1/ivr-menus', {
            method: 'POST',
            body: JSON.stringify({ name, description, timeout, maxAttempts, config })
        });
        
        if (data && data.success) {
            alert('IVR menu muvaffaqiyatli yaratildi!');
            loadIVR();
        } else {
            alert('Xato: ' + (data?.error || 'Noma\'lum xato'));
        }
    } catch (error) {
        alert('Xato: ' + error.message);
    }
}

async function editIVR(id) {
    const ivr = await apiRequest(`/api/v1/ivr-menus/${id}`);
    if (!ivr || !ivr.success) {
        alert('IVR menu topilmadi');
        return;
    }
    
    const name = prompt('IVR nomi:', ivr.data.name);
    if (name === null) return;
    
    const description = prompt('Tavsif:', ivr.data.description || '');
    const enabled = confirm('IVR faolmi?', ivr.data.enabled);
    
    try {
        const data = await apiRequest(`/api/v1/ivr-menus/${id}`, {
            method: 'PUT',
            body: JSON.stringify({ name, description, enabled })
        });
        
        if (data && data.success) {
            alert('IVR menu yangilandi');
            loadIVR();
        } else {
            alert('Xato: ' + (data?.error || 'Noma\'lum xato'));
        }
    } catch (error) {
        alert('Xato: ' + error.message);
    }
}

async function deleteIVR(id) {
    if (!confirm('Bu IVR menuni o\'chirishni xohlaysizmi?')) return;
    
    try {
        const data = await apiRequest(`/api/v1/ivr-menus/${id}`, {
            method: 'DELETE'
        });
        
        if (data && data.success) {
            alert('IVR menu o\'chirildi');
            loadIVR();
        } else {
            alert('Xato: ' + (data?.error || 'Noma\'lum xato'));
        }
    } catch (error) {
        alert('Xato: ' + error.message);
    }
}

// Queue Functions
async function addQueue() {
    const name = prompt('Queue nomi kiriting:');
    if (!name) return;
    
    const description = prompt('Tavsif (ixtiyoriy):') || '';
    const strategy = prompt('Strategy (ringall/leastrecent/fewestcalls/random, default: ringall):', 'ringall') || 'ringall';
    const timeout = parseInt(prompt('Timeout (sekund, default: 30):') || '30');
    const maxWait = parseInt(prompt('Maksimal kutish vaqti (sekund, default: 300):') || '300');
    
    try {
        const data = await apiRequest('/api/v1/queues', {
            method: 'POST',
            body: JSON.stringify({ name, description, strategy, timeout, maxWait })
        });
        
        if (data && data.success) {
            alert('Queue muvaffaqiyatli yaratildi!\n\nKeyingi qadam: Queue ga extension qo\'shing.');
            loadQueues();
        } else {
            alert('Xato: ' + (data?.error || 'Noma\'lum xato'));
        }
    } catch (error) {
        alert('Xato: ' + error.message);
    }
}

async function viewQueue(id) {
    const queue = await apiRequest(`/api/v1/queues/${id}`);
    if (queue && queue.success) {
        const q = queue.data;
        const members = q.members || [];
        const membersList = members.length > 0 
            ? members.map(m => `  - ${m.username} (${m.display_name || '-'})`).join('\n')
            : '  Hech kim qo\'shilmagan';
        
        const info = `
Queue Ma'lumotlari:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Nomi: ${q.name}
Tavsif: ${q.description || '-'}
Strategy: ${q.strategy}
Timeout: ${q.timeout} sekund
Max Wait: ${q.maxWait} sekund
Status: ${q.enabled ? 'Faol' : 'Nofaol'}

Members (${members.length}):
${membersList}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        `;
        alert(info);
    }
}

async function editQueue(id) {
    const queue = await apiRequest(`/api/v1/queues/${id}`);
    if (!queue || !queue.success) {
        alert('Queue topilmadi');
        return;
    }
    
    const q = queue.data;
    const name = prompt('Queue nomi:', q.name);
    if (name === null) return;
    
    const description = prompt('Tavsif:', q.description || '');
    const strategy = prompt('Strategy (ringall/leastrecent/fewestcalls/random):', q.strategy) || q.strategy;
    const timeout = parseInt(prompt('Timeout (sekund):', q.timeout) || q.timeout);
    const enabled = confirm('Queue faolmi?', q.enabled);
    
    try {
        const data = await apiRequest(`/api/v1/queues/${id}`, {
            method: 'PUT',
            body: JSON.stringify({ name, description, strategy, timeout, enabled })
        });
        
        if (data && data.success) {
            alert('Queue yangilandi');
            loadQueues();
        } else {
            alert('Xato: ' + (data?.error || 'Noma\'lum xato'));
        }
    } catch (error) {
        alert('Xato: ' + error.message);
    }
}

async function deleteQueue(id) {
    if (!confirm('Bu queueni o\'chirishni xohlaysizmi?\n\nEslatma: Barcha ma\'lumotlar o\'chib ketadi!')) return;
    
    try {
        const data = await apiRequest(`/api/v1/queues/${id}`, {
            method: 'DELETE'
        });
        
        if (data && data.success) {
            alert('Queue muvaffaqiyatli o\'chirildi');
            loadQueues();
        } else {
            alert('Xato: ' + (data?.error || 'Noma\'lum xato'));
        }
    } catch (error) {
        alert('Xato: ' + error.message);
    }
}

// Extension Edit
async function editExtension(id) {
    openExtensionModal('edit', id);
}

// Call Functions
async function viewCall(id) {
    const call = await apiRequest(`/api/v1/calls/${id}`);
    if (call && call.success) {
        const c = call.data;
        const info = `
Qo'ng'iroq Ma'lumotlari:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
ID: ${c.id}
From: ${c.fromNumber || '-'}
To: ${c.toNumber || '-'}
Direction: ${c.direction}
Status: ${c.status}
Duration: ${formatDuration(c.duration || 0)}
Started: ${new Date(c.startedAt).toLocaleString()}
${c.answeredAt ? 'Answered: ' + new Date(c.answeredAt).toLocaleString() : ''}
${c.endedAt ? 'Ended: ' + new Date(c.endedAt).toLocaleString() : ''}
${c.hangupCause ? 'Hangup Cause: ' + c.hangupCause : ''}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        `;
        alert(info);
    }
}

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    // Security: Initially hide dashboard completely until authentication
    const dashboardPage = document.getElementById('dashboard-page');
    const loginPage = document.getElementById('login-page');
    
    if (dashboardPage) {
        dashboardPage.classList.add('hidden');
        dashboardPage.style.display = 'none';
        dashboardPage.style.visibility = 'hidden';
        dashboardPage.style.position = 'absolute';
        dashboardPage.style.left = '-9999px';
        dashboardPage.style.top = '-9999px';
        dashboardPage.style.width = '0';
        dashboardPage.style.height = '0';
        dashboardPage.style.overflow = 'hidden';
    }
    
    // Scroll to top on page load
    window.scrollTo({ top: 0, behavior: 'instant' });
    document.body.scrollTop = 0;
    document.documentElement.scrollTop = 0;
    
    // Check if logged in
    if (authToken) {
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        const userNameEl = document.getElementById('user-name');
        if (userNameEl) {
            userNameEl.textContent = user.username || 'Admin';
        }
        document.body.classList.add('logged-in');
        showPage('dashboard');
    } else {
        document.body.classList.remove('logged-in');
        if (loginPage) {
            loginPage.style.display = 'flex';
            loginPage.style.visibility = 'visible';
            loginPage.style.position = 'relative';
            loginPage.style.left = 'auto';
            loginPage.style.top = 'auto';
            loginPage.style.width = 'auto';
            loginPage.style.height = 'auto';
            loginPage.style.overflow = 'visible';
        }
        showPage('login');
    }

    // Login form
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const username = document.getElementById('username').value;
            const password = document.getElementById('password').value;
            const errorDiv = document.getElementById('login-error');
            const submitBtn = loginForm.querySelector('button[type="submit"]');

            errorDiv.textContent = '';
            
            // Disable button during login
            if (submitBtn) {
                submitBtn.disabled = true;
                submitBtn.textContent = 'Kirilmoqda...';
            }
            
            try {
                const result = await login(username, password);
                if (result.success) {
                    const user = JSON.parse(localStorage.getItem('user') || '{}');
                    const userNameEl = document.getElementById('user-name');
                    if (userNameEl) {
                        userNameEl.textContent = user.username || 'Admin';
                    }
                    // Clear login form first
                    loginForm.reset();
                    // Show dashboard page first
                    showPage('dashboard');
                    // Scroll to top after page is shown - use timeout to ensure DOM is updated
                    setTimeout(() => {
                        window.scrollTo({ top: 0, behavior: 'instant' });
                        document.body.scrollTop = 0;
                        document.documentElement.scrollTop = 0;
                    }, 100);
                } else {
                    errorDiv.textContent = result.error || 'Noto\'g\'ri username yoki password';
                    errorDiv.style.color = '#e74c3c';
                }
            } catch (error) {
                errorDiv.textContent = error.message || 'Xato yuz berdi';
                errorDiv.style.color = '#e74c3c';
            } finally {
                // Re-enable button
                if (submitBtn) {
                    submitBtn.disabled = false;
                    submitBtn.textContent = 'Login';
                }
            }
        });
    }

    // Logout
    document.getElementById('logout-btn').addEventListener('click', logout);

    // Menu navigation
    document.querySelectorAll('.menu-item').forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const page = item.getAttribute('data-page');
            showPage(page);
        });
    });

    // Extension Modal Event Listeners
    const extensionModal = document.getElementById('extension-modal');
    const extensionForm = document.getElementById('extension-form');
    const extensionModalClose = document.getElementById('extension-modal-close');
    const extensionModalCancel = document.getElementById('extension-modal-cancel');
    
    if (extensionForm) {
        extensionForm.addEventListener('submit', handleExtensionFormSubmit);
    }
    
    if (extensionModalClose) {
        extensionModalClose.addEventListener('click', closeExtensionModal);
    }
    
    if (extensionModalCancel) {
        extensionModalCancel.addEventListener('click', closeExtensionModal);
    }
    
    // Close modal when clicking outside
    if (extensionModal) {
        extensionModal.addEventListener('click', (e) => {
            if (e.target === extensionModal) {
                closeExtensionModal();
            }
        });
    }

    // Quick actions
    const quickAddExtBtn = document.getElementById('quick-add-extension-btn');
    if (quickAddExtBtn) {
        quickAddExtBtn.addEventListener('click', () => {
            showPage('extensions');
            setTimeout(() => addExtension(), 100);
        });
    }

    const quickViewCallsBtn = document.getElementById('quick-view-calls-btn');
    if (quickViewCallsBtn) {
        quickViewCallsBtn.addEventListener('click', () => {
            showPage('calls');
        });
    }

    const quickViewExtBtn = document.getElementById('quick-view-extensions-btn');
    if (quickViewExtBtn) {
        quickViewExtBtn.addEventListener('click', () => {
            showPage('extensions');
        });
    }

    // Page action buttons
    const addExtBtn = document.getElementById('add-extension-btn');
    if (addExtBtn) {
        addExtBtn.addEventListener('click', addExtension);
    }

    const refreshCallsBtn = document.getElementById('refresh-calls-btn');
    if (refreshCallsBtn) {
        refreshCallsBtn.addEventListener('click', loadCalls);
    }

    const refreshRecordingsBtn = document.getElementById('refresh-recordings-btn');
    if (refreshRecordingsBtn) {
        refreshRecordingsBtn.addEventListener('click', loadRecordings);
    }

    const addIvrBtn = document.getElementById('add-ivr-btn');
    if (addIvrBtn) {
        addIvrBtn.addEventListener('click', addIVR);
    }

    const addQueueBtn = document.getElementById('add-queue-btn');
    if (addQueueBtn) {
        addQueueBtn.addEventListener('click', addQueue);
    }

    const addDidBtn = document.getElementById('add-did-btn');
    if (addDidBtn) {
        addDidBtn.addEventListener('click', addDID);
    }

    // DID Modal Event Listeners
    const didModal = document.getElementById('did-modal');
    const didForm = document.getElementById('did-form');
    const didModalClose = document.getElementById('did-modal-close');
    const didModalCancel = document.getElementById('did-modal-cancel');
    const didRouteType = document.getElementById('did-route-type');
    
    if (didForm) {
        didForm.addEventListener('submit', handleDIDFormSubmit);
    }
    
    if (didModalClose) {
        didModalClose.addEventListener('click', closeDIDModal);
    }
    
    if (didModalCancel) {
        didModalCancel.addEventListener('click', closeDIDModal);
    }
    
    // Close modal when clicking outside
    if (didModal) {
        didModal.addEventListener('click', (e) => {
            if (e.target === didModal) {
                closeDIDModal();
            }
        });
    }
    
    // Route Type change handler - update Route Target dropdown
    if (didRouteType) {
        didRouteType.addEventListener('change', (e) => {
            const routeType = e.target.value;
            updateRouteTargetDropdown(routeType);
        });
    }

    // Event delegation for dynamic buttons
    document.addEventListener('click', (e) => {
        // Extension buttons
        if (e.target.classList.contains('view-ext-btn') || e.target.closest('.view-ext-btn')) {
            const btn = e.target.classList.contains('view-ext-btn') ? e.target : e.target.closest('.view-ext-btn');
            viewExtension(parseInt(btn.getAttribute('data-id')));
        }
        if (e.target.classList.contains('edit-ext-btn') || e.target.closest('.edit-ext-btn')) {
            const btn = e.target.classList.contains('edit-ext-btn') ? e.target : e.target.closest('.edit-ext-btn');
            editExtension(parseInt(btn.getAttribute('data-id')));
        }
        if (e.target.classList.contains('delete-ext-btn') || e.target.closest('.delete-ext-btn')) {
            const btn = e.target.classList.contains('delete-ext-btn') ? e.target : e.target.closest('.delete-ext-btn');
            deleteExtension(parseInt(btn.getAttribute('data-id')));
        }

        // Call buttons
        if (e.target.classList.contains('view-call-btn') || e.target.closest('.view-call-btn')) {
            const btn = e.target.classList.contains('view-call-btn') ? e.target : e.target.closest('.view-call-btn');
            viewCall(parseInt(btn.getAttribute('data-id')));
        }

        // Recording buttons
        if (e.target.classList.contains('download-rec-btn') || e.target.closest('.download-rec-btn')) {
            const btn = e.target.classList.contains('download-rec-btn') ? e.target : e.target.closest('.download-rec-btn');
            downloadRecording(parseInt(btn.getAttribute('data-id')));
        }
        if (e.target.classList.contains('delete-rec-btn') || e.target.closest('.delete-rec-btn')) {
            const btn = e.target.classList.contains('delete-rec-btn') ? e.target : e.target.closest('.delete-rec-btn');
            deleteRecording(parseInt(btn.getAttribute('data-id')));
        }

        // IVR buttons
        if (e.target.classList.contains('edit-ivr-btn') || e.target.closest('.edit-ivr-btn')) {
            const btn = e.target.classList.contains('edit-ivr-btn') ? e.target : e.target.closest('.edit-ivr-btn');
            editIVR(parseInt(btn.getAttribute('data-id')));
        }
        if (e.target.classList.contains('delete-ivr-btn') || e.target.closest('.delete-ivr-btn')) {
            const btn = e.target.classList.contains('delete-ivr-btn') ? e.target : e.target.closest('.delete-ivr-btn');
            deleteIVR(parseInt(btn.getAttribute('data-id')));
        }

        // Queue buttons
        if (e.target.classList.contains('view-queue-btn') || e.target.closest('.view-queue-btn')) {
            const btn = e.target.classList.contains('view-queue-btn') ? e.target : e.target.closest('.view-queue-btn');
            viewQueue(parseInt(btn.getAttribute('data-id')));
        }
        if (e.target.classList.contains('edit-queue-btn') || e.target.closest('.edit-queue-btn')) {
            const btn = e.target.classList.contains('edit-queue-btn') ? e.target : e.target.closest('.edit-queue-btn');
            editQueue(parseInt(btn.getAttribute('data-id')));
        }
        if (e.target.classList.contains('delete-queue-btn') || e.target.closest('.delete-queue-btn')) {
            const btn = e.target.classList.contains('delete-queue-btn') ? e.target : e.target.closest('.delete-queue-btn');
            deleteQueue(parseInt(btn.getAttribute('data-id')));
        }

        // DID buttons
        if (e.target.classList.contains('edit-did-btn') || e.target.closest('.edit-did-btn')) {
            const btn = e.target.classList.contains('edit-did-btn') ? e.target : e.target.closest('.edit-did-btn');
            editDID(parseInt(btn.getAttribute('data-id')));
        }
        if (e.target.classList.contains('delete-did-btn') || e.target.closest('.delete-did-btn')) {
            const btn = e.target.classList.contains('delete-did-btn') ? e.target : e.target.closest('.delete-did-btn');
            deleteDID(parseInt(btn.getAttribute('data-id')));
        }
    });
});

// DID Modal Functions
let extensionsCache = [];
let ivrCache = [];
let queuesCache = [];

async function loadRouteTargets() {
    try {
        // Load extensions
        const extData = await apiRequest('/api/v1/extensions');
        if (extData && extData.success && extData.data) {
            extensionsCache = extData.data;
        }
        
        // Load IVR menus
        const ivrData = await apiRequest('/api/v1/ivr-menus');
        if (ivrData && ivrData.success && ivrData.data) {
            ivrCache = ivrData.data;
        }
        
        // Load queues
        const queueData = await apiRequest('/api/v1/queues');
        if (queueData && queueData.success && queueData.data) {
            queuesCache = queueData.data;
        }
    } catch (error) {
        console.warn('Route targets yuklashda xato:', error);
    }
}

function updateRouteTargetDropdown(routeType, currentValue = null) {
    const routeTargetSelect = document.getElementById('did-route-target');
    if (!routeTargetSelect) return;
    
    routeTargetSelect.innerHTML = '<option value="">Tanlang...</option>';
    
    if (!routeType) {
        routeTargetSelect.disabled = true;
        return;
    }
    
    routeTargetSelect.disabled = false;
    
    let options = [];
    
    if (routeType === 'extension') {
        options = extensionsCache.map(ext => ({
            value: ext.id,
            text: `${ext.username} (ID: ${ext.id})`
        }));
    } else if (routeType === 'ivr') {
        options = ivrCache.map(ivr => ({
            value: ivr.id,
            text: `${ivr.name} (ID: ${ivr.id})`
        }));
    } else if (routeType === 'queue') {
        options = queuesCache.map(queue => ({
            value: queue.id,
            text: `${queue.name} (ID: ${queue.id})`
        }));
    } else if (routeType === 'voicemail') {
        // Voicemail uchun faqat ID kerak
        options = [];
    }
    
    options.forEach(opt => {
        const option = document.createElement('option');
        option.value = opt.value;
        option.textContent = opt.text;
        if (currentValue && parseInt(currentValue) === opt.value) {
            option.selected = true;
        }
        routeTargetSelect.appendChild(option);
    });
    
    // Agar voicemail bo'lsa yoki currentValue bo'lsa
    if (routeType === 'voicemail' && currentValue) {
        const option = document.createElement('option');
        option.value = currentValue;
        option.textContent = `Voicemail (ID: ${currentValue})`;
        option.selected = true;
        routeTargetSelect.appendChild(option);
    }
}

function openDIDModal(mode = 'add', didId = null) {
    const modal = document.getElementById('did-modal');
    const form = document.getElementById('did-form');
    const title = document.getElementById('did-modal-title');
    const submitBtn = document.getElementById('did-modal-submit');
    
    // Reset form
    form.reset();
    document.getElementById('did-id').value = '';
    document.getElementById('did-provider').value = 'bell.uz';
    document.getElementById('did-enabled').checked = true;
    document.getElementById('did-route-type').value = '';
    updateRouteTargetDropdown('', null);
    
    // Load route targets
    loadRouteTargets();
    
    if (mode === 'add') {
        title.textContent = 'DID Qo\'shish';
        submitBtn.textContent = 'Qo\'shish';
        document.getElementById('did-trunk-password').required = true;
    } else if (mode === 'edit') {
        title.textContent = 'DID Tahrirlash';
        submitBtn.textContent = 'Saqlash';
        document.getElementById('did-trunk-password').required = false;
        
        // Load DID data
        loadDIDForEdit(didId);
    }
    
    modal.classList.remove('hidden');
}

function closeDIDModal() {
    const modal = document.getElementById('did-modal');
    modal.classList.add('hidden');
    document.getElementById('did-form').reset();
}

async function loadDIDForEdit(id) {
    try {
        const did = await apiRequest(`/api/v1/did-numbers/${id}`);
        if (did && did.success) {
            const d = did.data;
            document.getElementById('did-id').value = d.id;
            document.getElementById('did-number').value = d.number || '';
            document.getElementById('did-provider').value = d.provider || 'bell.uz';
            document.getElementById('did-trunk-username').value = d.trunkUsername || '';
            document.getElementById('did-enabled').checked = d.enabled !== false;
            document.getElementById('did-route-type').value = d.routeType || '';
            
            // Update route target dropdown based on route type
            await loadRouteTargets();
            updateRouteTargetDropdown(d.routeType, d.routeTargetId);
        }
    } catch (error) {
        alert('Xato: ' + error.message);
        closeDIDModal();
    }
}

// DID Numbers Functions
async function loadDIDNumbers() {
    try {
        const tbody = document.getElementById('did-numbers-table-body');
        if (!tbody) {
            console.error('DID numbers table body not found');
            return;
        }

        tbody.innerHTML = '<tr><td colspan="7" style="text-align: center; padding: 20px;">Yuklanmoqda...</td></tr>';

        const didNumbers = await apiRequest('/api/v1/did-numbers');
        
        if (didNumbers && didNumbers.success) {
            // Load extensions for route target names
            let extensions = [];
            try {
                const extData = await apiRequest('/api/v1/extensions');
                if (extData && extData.success && extData.data) {
                    extensions = extData.data;
                }
            } catch (extError) {
                console.warn('Extensions yuklashda xato:', extError);
            }

            // Create extension map by ID
            const extensionMap = {};
            extensions.forEach(ext => {
                extensionMap[ext.id] = ext;
            });

            if (didNumbers.data && didNumbers.data.length > 0) {
                tbody.innerHTML = didNumbers.data.map(did => {
                    let routeTargetDisplay = did.routeTargetId ? `ID: ${did.routeTargetId}` : '-';
                    
                    // If route type is extension, try to show username
                    if (did.routeType === 'extension' && did.routeTargetId) {
                        const ext = extensionMap[did.routeTargetId];
                        if (ext) {
                            routeTargetDisplay = `${ext.username} (ID: ${did.routeTargetId})`;
                        }
                    }
                    
                    const routeTypeLabels = {
                        'extension': 'Extension',
                        'ivr': 'IVR',
                        'queue': 'Queue',
                        'voicemail': 'Voicemail'
                    };
                    
                    return `
                        <tr>
                            <td><strong>${escapeHtml(did.number)}</strong></td>
                            <td>${escapeHtml(did.provider || 'bell.uz')}</td>
                            <td>${escapeHtml(did.trunkUsername || '-')}</td>
                            <td><span class="badge">${routeTypeLabels[did.routeType] || escapeHtml(did.routeType || '-')}</span></td>
                            <td>${escapeHtml(routeTargetDisplay)}</td>
                            <td>
                                <span class="status-badge ${did.enabled ? 'status-enabled' : 'status-disabled'}">
                                    ${did.enabled ? 'Faol' : 'Nofaol'}
                                </span>
                            </td>
                            <td>
                                <button class="btn btn-sm edit-did-btn" data-id="${did.id}" title="Tahrirlash">✏️</button>
                                <button class="btn btn-sm btn-danger delete-did-btn" data-id="${did.id}" title="O'chirish">🗑️</button>
                            </td>
                        </tr>
                    `;
                }).join('');
            } else {
                tbody.innerHTML = '<tr><td colspan="7" style="text-align: center; padding: 20px;">DID raqamlar topilmadi. Birinchi DID ni yarating.</td></tr>';
            }
        } else {
            tbody.innerHTML = '<tr><td colspan="7" style="text-align: center; padding: 20px; color: red;">Xato: ' + (didNumbers?.error || 'Noma\'lum xato') + '</td></tr>';
        }
    } catch (error) {
        console.error('DID Numbers yuklash xatosi:', error);
        const tbody = document.getElementById('did-numbers-table-body');
        if (tbody) {
            tbody.innerHTML = '<tr><td colspan="7" style="text-align: center; padding: 20px; color: red;">Xato: ' + escapeHtml(error.message) + '</td></tr>';
        }
    }
}

async function addDID() {
    openDIDModal('add');
}

async function handleDIDFormSubmit(e) {
    e.preventDefault();
    
    const form = e.target;
    const formData = new FormData(form);
    const didId = document.getElementById('did-id').value;
    const mode = didId ? 'edit' : 'add';
    
    const payload = {
        number: formData.get('number').trim(),
        provider: formData.get('provider')?.trim() || 'bell.uz',
        trunkUsername: formData.get('trunkUsername')?.trim() || formData.get('number').trim(),
        routeType: formData.get('routeType'),
        routeTargetId: parseInt(formData.get('routeTargetId')),
        enabled: formData.get('enabled') === 'on'
    };
    
    // Validation
    if (!payload.number || !/^[0-9+]+$/.test(payload.number)) {
        alert('DID Raqam faqat raqamlar va + belgisidan iborat bo\'lishi kerak');
        return;
    }
    
    if (!payload.routeType) {
        alert('Route Type tanlanishi kerak');
        return;
    }
    
    if (!payload.routeTargetId || isNaN(payload.routeTargetId)) {
        alert('Route Target tanlanishi kerak');
        return;
    }
    
    const trunkPassword = formData.get('trunkPassword');
    if (mode === 'add') {
        if (!trunkPassword || trunkPassword.length === 0) {
            alert('Trunk Password kiritilishi shart!');
            return;
        }
        payload.trunkPassword = trunkPassword;
    } else if (mode === 'edit' && trunkPassword && trunkPassword.length > 0) {
        payload.trunkPassword = trunkPassword;
    }
    
    const submitBtn = document.getElementById('did-modal-submit');
    const originalText = submitBtn.textContent;
    submitBtn.disabled = true;
    submitBtn.textContent = 'Saqlanmoqda...';
    
    try {
        let url, method;
        if (mode === 'add') {
            url = '/api/v1/did-numbers';
            method = 'POST';
        } else {
            // Edit mode - use full update endpoint to update all fields
            url = `/api/v1/did-numbers/${didId}`;
            method = 'PUT';
        }
        
        const data = await apiRequest(url, {
            method: method,
            body: JSON.stringify(payload)
        });
        
        if (data && data.success) {
            alert('DID muvaffaqiyatli ' + (mode === 'add' ? 'yaratildi' : 'yangilandi'));
            closeDIDModal();
            await loadDIDNumbers();
        } else {
            let errorMsg = data?.error || 'Noma\'lum xato';
            if (data?.details && Array.isArray(data.details) && data.details.length > 0) {
                errorMsg += '\n\nBatafsil:\n' + data.details.map(d => `- ${d.field}: ${d.message}`).join('\n');
            }
            alert('Xato: ' + errorMsg);
        }
    } catch (error) {
        console.error('DID save error:', error);
        let errorMsg = error.message || 'Noma\'lum xato';
        if (error.errorData && error.errorData.details && Array.isArray(error.errorData.details)) {
            errorMsg += '\n\nBatafsil:\n' + error.errorData.details.map(d => `- ${d.field}: ${d.message}`).join('\n');
        } else if (error.errorData && error.errorData.error) {
            errorMsg = error.errorData.error;
        }
        alert('Xato: ' + errorMsg);
    } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = originalText;
    }
}

async function editDID(id) {
    openDIDModal('edit', id);
}

async function deleteDID(id) {
    if (!confirm('Bu DID ni o\'chirishni xohlaysizmi?\n\nEslatma: Barcha ma\'lumotlar o\'chib ketadi!')) return;
    
    try {
        const data = await apiRequest(`/api/v1/did-numbers/${id}`, {
            method: 'DELETE'
        });
        
        if (data && data.success) {
            alert('DID muvaffaqiyatli o\'chirildi');
            await loadDIDNumbers();
        } else {
            alert('Xato: ' + (data?.error || 'Noma\'lum xato'));
        }
    } catch (error) {
        alert('Xato: ' + error.message);
    }
}

// Web Phone Functions
let sipUserAgent = null;
let currentSession = null;
let callDurationInterval = null;
let callStartTime = null;

async function loadPhone() {
    // Load extensions for dropdown
    try {
        const extensions = await apiRequest('/api/v1/extensions');
        const extensionSelect = document.getElementById('phone-extension');
        
        if (extensions && extensions.success && extensions.data) {
            extensionSelect.innerHTML = '<option value="">Tanlang...</option>';
            extensions.data.forEach(ext => {
                const option = document.createElement('option');
                option.value = ext.id;
                option.textContent = `${ext.username}${ext.displayName ? ' - ' + ext.displayName : ''}`;
                option.dataset.username = ext.username;
                extensionSelect.appendChild(option);
            });
        }
    } catch (error) {
        console.error('Extensions yuklashda xato:', error);
    }
    
    // Initialize event listeners if not already initialized
    initPhoneEventListeners();
}

function initPhoneEventListeners() {
    // Dial pad buttons
    document.querySelectorAll('.dial-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const number = e.target.dataset.number;
            const phoneNumberInput = document.getElementById('phone-number');
            phoneNumberInput.value += number;
        });
    });
    
    // Phone number input (keyboard input)
    const phoneNumberInput = document.getElementById('phone-number');
    if (phoneNumberInput && !phoneNumberInput.dataset.listenersAdded) {
        phoneNumberInput.addEventListener('input', (e) => {
            // Allow only numbers, +, *, #
            e.target.value = e.target.value.replace(/[^0-9+*#]/g, '');
        });
        phoneNumberInput.dataset.listenersAdded = 'true';
    }
    
    // Call button
    const callBtn = document.getElementById('phone-call-btn');
    if (callBtn && !callBtn.dataset.listenersAdded) {
        callBtn.addEventListener('click', makeCall);
        callBtn.dataset.listenersAdded = 'true';
    }
    
    // Answer button
    const answerBtn = document.getElementById('phone-answer-btn');
    if (answerBtn && !answerBtn.dataset.listenersAdded) {
        answerBtn.addEventListener('click', answerCall);
        answerBtn.dataset.listenersAdded = 'true';
    }
    
    // Hangup button
    const hangupBtn = document.getElementById('phone-hangup-btn');
    if (hangupBtn && !hangupBtn.dataset.listenersAdded) {
        hangupBtn.addEventListener('click', hangupCall);
        hangupBtn.dataset.listenersAdded = 'true';
    }
    
    // Clear button
    const clearBtn = document.getElementById('phone-clear-btn');
    if (clearBtn && !clearBtn.dataset.listenersAdded) {
        clearBtn.addEventListener('click', () => {
            document.getElementById('phone-number').value = '';
        });
        clearBtn.dataset.listenersAdded = 'true';
    }
    
    // Extension selection change
    const extensionSelect = document.getElementById('phone-extension');
    if (extensionSelect && !extensionSelect.dataset.listenersAdded) {
        extensionSelect.addEventListener('change', async (e) => {
            const extensionId = e.target.value;
            if (extensionId) {
                await connectSIP(extensionId);
            } else {
                disconnectSIP();
            }
        });
        extensionSelect.dataset.listenersAdded = 'true';
    }
}

async function connectSIP(extensionId) {
    try {
        // Get extension details
        const extension = await apiRequest(`/api/v1/extensions/${extensionId}`);
        if (!extension || !extension.success) {
            alert('Extension topilmadi');
            return;
        }
        
        const ext = extension.data;
        
        // Get extension password from API (we need to get it from cache or reset it)
        // For now, we'll use a placeholder - in production, get from secure source
        const password = prompt(`Extension password kiriting (${ext.username}):`);
        if (!password) {
            document.getElementById('phone-extension').value = '';
            return;
        }
        
        // Get SIP configuration
        const config = {
            uri: `sip:${ext.username}@call.soundz.uz`,
            password: password,
            wsServers: `wss://call.soundz.uz:5060`, // WebSocket server (if available)
            // For UDP, we'll use SIP.js UserAgent which supports WebSocket or UDP over WebRTC
            displayName: ext.displayName || ext.username,
            authorizationUsername: ext.username,
            authorizationPassword: password,
            registrar: `sip:call.soundz.uz:5060`,
            transportOptions: {
                wsServers: [`wss://call.soundz.uz:5060`],
                traceSip: true
            }
        };
        
        // Note: SIP.js requires WebSocket server for browser use
        // For direct UDP, we need a WebRTC gateway or use server-side SIP proxy
        // For now, we'll show a message that this requires WebSocket SIP server
        
        updatePhoneStatus('Disconnected', 'WebSocket SIP server kerak. Server sozlamalarini tekshiring.');
        alert('⚠️ Web-based telefon funksiyasi uchun WebSocket SIP server kerak.\n\nHozirgi vaqtda MicroSIP yoki boshqa SIP client orqali telefon qilish mumkin.\n\nWeb-based telefon funksiyasi keyingi versiyada qo\'shiladi.');
        
    } catch (error) {
        console.error('SIP ulanish xatosi:', error);
        updatePhoneStatus('Error', error.message);
        alert('Xato: ' + error.message);
    }
}

function disconnectSIP() {
    if (currentSession) {
        currentSession.bye();
        currentSession = null;
    }
    
    if (sipUserAgent) {
        sipUserAgent.unregister();
        sipUserAgent.stop();
        sipUserAgent = null;
    }
    
    if (callDurationInterval) {
        clearInterval(callDurationInterval);
        callDurationInterval = null;
    }
    
    callStartTime = null;
    updatePhoneStatus('Disconnected', '');
    resetCallUI();
}

function makeCall() {
    const phoneNumber = document.getElementById('phone-number').value.trim();
    if (!phoneNumber) {
        alert('Telefon raqamini kiriting');
        return;
    }
    
    if (!sipUserAgent || !currentSession) {
        alert('Avval extension tanlang va ulanishni kutayapsiz');
        return;
    }
    
    // Make call using SIP.js
    // Note: This requires WebSocket SIP server
    alert('Web-based telefon funksiyasi uchun WebSocket SIP server kerak.\n\nHozirgi vaqtda MicroSIP orqali telefon qilish mumkin.');
}

function answerCall() {
    if (currentSession && currentSession.status === 'Incoming') {
        currentSession.accept();
        startCallDuration();
        updateCallUI('Connected', 'Qo\'ng\'iroq qabul qilindi');
    }
}

function hangupCall() {
    if (currentSession) {
        currentSession.bye();
        currentSession = null;
    }
    
    if (callDurationInterval) {
        clearInterval(callDurationInterval);
        callDurationInterval = null;
    }
    
    callStartTime = null;
    resetCallUI();
}

function updatePhoneStatus(status, details = '') {
    const statusText = document.getElementById('phone-status-text');
    const statusDetails = document.getElementById('phone-status-details');
    
    if (statusText) {
        const statusLabels = {
            'Connected': { text: '✅ Ulangan', color: '#2e7d32' },
            'Connecting': { text: '⏳ Ulanmoqda...', color: '#f57c00' },
            'Disconnected': { text: '❌ Ulanish yo\'q', color: '#c62828' },
            'Error': { text: '❌ Xato', color: '#c62828' },
            'Registered': { text: '✅ Ro\'yxatdan o\'tilgan', color: '#2e7d32' }
        };
        
        const statusInfo = statusLabels[status] || { text: status, color: '#666' };
        statusText.textContent = statusInfo.text;
        statusText.style.color = statusInfo.color;
    }
    
    if (statusDetails) {
        statusDetails.textContent = details;
    }
}

function resetCallUI() {
    document.getElementById('phone-call-btn').classList.remove('hidden');
    document.getElementById('phone-answer-btn').classList.add('hidden');
    document.getElementById('phone-hangup-btn').classList.add('hidden');
    document.getElementById('active-call-info').classList.add('hidden');
}

function updateCallUI(status, text) {
    const callInfo = document.getElementById('active-call-info');
    const callStatusText = document.getElementById('call-status-text');
    const hangupBtn = document.getElementById('phone-hangup-btn');
    
    if (status === 'Connected' || status === 'Ringing') {
        callInfo.classList.remove('hidden');
        document.getElementById('phone-call-btn').classList.add('hidden');
        hangupBtn.classList.remove('hidden');
        
        if (callStatusText) {
            callStatusText.textContent = text;
        }
    } else {
        resetCallUI();
    }
}

function startCallDuration() {
    callStartTime = Date.now();
    callDurationInterval = setInterval(() => {
        if (callStartTime) {
            const elapsed = Math.floor((Date.now() - callStartTime) / 1000);
            const minutes = Math.floor(elapsed / 60);
            const seconds = elapsed % 60;
            const durationText = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
            document.getElementById('call-duration').textContent = durationText;
        }
    }, 1000);
}
