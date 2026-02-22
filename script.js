// ============= GLOBAL VARIABLES =============
let currentUser = null;
let selectedProduct = null;
let products = [];
let transactions = [];
let users = [];
let promos = [];
let appStats = {
    totalUsers: 1247,
    totalTransactions: 8923,
    totalDiamonds: 456789,
    totalRevenue: 189750000
};

// Debug mode
const DEBUG = true;

// ============= INITIALIZATION =============
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded - initializing app...');
    loadData();
    loadProducts();
    setupEventListeners();
    checkAuthStatus();
    updateLiveStats();
    updateNotificationBadge();
});

// ============= DATA LOADING =============
function loadData() {
    console.log('Loading data from localStorage...');
    
    // Load users - PASTIKAN ADMIN ADA
    const savedUsers = localStorage.getItem('users');
    if (savedUsers) {
        users = JSON.parse(savedUsers);
        console.log('Users loaded:', users.length);
        
        // Cek apakah admin sudah ada, jika belum tambahkan
        const adminExists = users.some(u => u.role === 'admin');
        if (!adminExists) {
            console.log('Admin not found, adding default admin...');
            users.push({
                id: users.length + 1,
                name: 'Admin Benoy',
                email: 'admin@benoystore.com',
                password: 'admin123',
                role: 'admin',
                createdAt: new Date().toISOString()
            });
            localStorage.setItem('users', JSON.stringify(users));
        }
    } else {
        console.log('No users found, creating default users...');
        // Data default dengan admin
        users = [
            { 
                id: 1, 
                name: 'Admin Benoy', 
                email: 'admin@benoystore.com', 
                password: 'admin123', 
                role: 'admin',
                createdAt: new Date().toISOString()
            },
            { 
                id: 2, 
                name: 'User Demo', 
                email: 'user@demo.com', 
                password: 'user123', 
                role: 'user',
                createdAt: new Date().toISOString()
            }
        ];
        localStorage.setItem('users', JSON.stringify(users));
    }
    
    // Load products
    const savedProducts = localStorage.getItem('products');
    if (savedProducts) {
        products = JSON.parse(savedProducts);
        console.log('Products loaded:', products.length);
    } else {
        console.log('No products found, creating default products...');
        products = [
            { id: 1, game: 'ml', name: '86 Diamonds', diamond: 86, price: 17000, bonus: '', status: 'active' },
            { id: 2, game: 'ml', name: '172 Diamonds', diamond: 172, price: 33000, bonus: '', status: 'active' },
            { id: 3, game: 'ml', name: '257 Diamonds', diamond: 257, price: 48000, bonus: '', status: 'active' },
            { id: 4, game: 'ff', name: '70 Diamonds', diamond: 70, price: 12000, bonus: '', status: 'active' },
            { id: 5, game: 'ff', name: '140 Diamonds', diamond: 140, price: 23000, bonus: '', status: 'active' },
            { id: 6, game: 'pubg', name: '60 UC', diamond: 60, price: 17000, bonus: '', status: 'active' },
            { id: 7, game: 'pubg', name: '180 UC', diamond: 180, price: 48000, bonus: '+25 Bonus', status: 'active' },
            { id: 8, game: 'cod', name: '80 CP', diamond: 80, price: 19000, bonus: '', status: 'active' },
            { id: 9, game: 'cod', name: '220 CP', diamond: 220, price: 50000, bonus: '+25 Bonus', status: 'active' }
        ];
        localStorage.setItem('products', JSON.stringify(products));
    }
    
    // Load transactions
    const savedTransactions = localStorage.getItem('transactions');
    if (savedTransactions) {
        transactions = JSON.parse(savedTransactions);
        console.log('Transactions loaded:', transactions.length);
    } else {
        transactions = [];
        localStorage.setItem('transactions', JSON.stringify(transactions));
    }
    
    // Load promos
    const savedPromos = localStorage.getItem('promos');
    if (savedPromos) {
        promos = JSON.parse(savedPromos);
        console.log('Promos loaded:', promos.length);
    } else {
        promos = [
            { code: 'WELCOME10', discount: 10, minPurchase: 20000, expiry: '2024-12-31' },
            { code: 'DIAMOND20', discount: 20, minPurchase: 50000, expiry: '2024-12-31' }
        ];
        localStorage.setItem('promos', JSON.stringify(promos));
    }
    
    // Load app stats
    const savedStats = localStorage.getItem('appStats');
    if (savedStats) {
        appStats = JSON.parse(savedStats);
    } else {
        // Update stats based on data
        appStats.totalUsers = users.length;
        appStats.totalTransactions = transactions.length;
        appStats.totalDiamonds = transactions.reduce((sum, t) => sum + (t.product?.diamond || 0), 0);
        appStats.totalRevenue = transactions.reduce((sum, t) => sum + (t.total || 0), 0);
        localStorage.setItem('appStats', JSON.stringify(appStats));
    }
}

// ============= PRODUCT FUNCTIONS =============
function loadProducts() {
    const productGrid = document.getElementById('productGrid');
    if (!productGrid) return;
    
    productGrid.innerHTML = '';
    
    const activeProducts = products.filter(p => p.status === 'active');
    
    activeProducts.forEach(product => {
        const gameNames = {
            'ml': 'Mobile Legends',
            'ff': 'Free Fire',
            'pubg': 'PUBG Mobile',
            'cod': 'COD Mobile'
        };
        
        const card = document.createElement('div');
        card.className = 'product-card';
        card.innerHTML = `
            <div class="product-badge">${gameNames[product.game]}</div>
            <div class="product-name">${product.name}</div>
            <div class="product-price">Rp ${formatRupiah(product.price)}</div>
            <button class="btn-buy" onclick="openOrderModal(${product.id})" ${!currentUser ? 'disabled' : ''}>
                ${currentUser ? 'Beli Sekarang' : 'Login untuk Membeli'}
            </button>
        `;
        productGrid.appendChild(card);
    });
}

function filterProducts(game) {
    const productGrid = document.getElementById('productGrid');
    productGrid.innerHTML = '';
    
    let filteredProducts = products.filter(p => p.status === 'active');
    if (game !== 'all') {
        filteredProducts = filteredProducts.filter(p => p.game === game);
    }
    
    const gameNames = {
        'ml': 'Mobile Legends',
        'ff': 'Free Fire',
        'pubg': 'PUBG Mobile',
        'cod': 'COD Mobile'
    };
    
    filteredProducts.forEach(product => {
        const card = document.createElement('div');
        card.className = 'product-card';
        card.innerHTML = `
            <div class="product-badge">${gameNames[product.game]}</div>
            <div class="product-name">${product.name}</div>
            <div class="product-price">Rp ${formatRupiah(product.price)}</div>
            <button class="btn-buy" onclick="openOrderModal(${product.id})" ${!currentUser ? 'disabled' : ''}>
                ${currentUser ? 'Beli Sekarang' : 'Login untuk Membeli'}
            </button>
        `;
        productGrid.appendChild(card);
    });
}

// ============= AUTHENTICATION =============
function checkAuthStatus() {
    const user = localStorage.getItem('currentUser');
    if (user) {
        currentUser = JSON.parse(user);
        console.log('User logged in:', currentUser);
        updateUIForLoggedInUser();
    } else {
        console.log('No user logged in');
    }
}

function updateUIForLoggedInUser() {
    document.getElementById('loginBtn').classList.add('hidden');
    document.getElementById('registerBtn').classList.add('hidden');
    document.getElementById('userProfile').classList.remove('hidden');
    document.getElementById('usernameDisplay').textContent = currentUser.name.split(' ')[0];
    
    // Tampilkan menu admin jika role = admin
    if (currentUser.role === 'admin') {
        document.getElementById('adminMenu').classList.remove('hidden');
        console.log('Admin menu shown');
    } else {
        document.getElementById('adminMenu').classList.add('hidden');
    }
    
    // Update avatar
    const avatar = document.querySelector('#userProfile img');
    avatar.src = `https://ui-avatars.com/api/?name=${currentUser.name.replace(' ', '+')}&background=3b82f6&color=fff`;
    
    // Enable buy buttons
    document.querySelectorAll('.btn-buy').forEach(btn => {
        btn.disabled = false;
        btn.textContent = 'Beli Sekarang';
    });
}

// ============= LOGIN HANDLER =============
function handleLogin(event) {
    event.preventDefault();
    
    const email = document.getElementById('loginEmail').value.trim();
    const password = document.getElementById('loginPassword').value.trim();
    
    console.log('Login attempt - Email:', email, 'Password:', password);
    console.log('Available users:', users);
    
    // Validasi input
    if (!email || !password) {
        showToast('error', 'Email dan password harus diisi!');
        return;
    }
    
    // Cari user di array users (case insensitive email)
    const user = users.find(u => u.email.toLowerCase() === email.toLowerCase() && u.password === password);
    
    if (user) {
        console.log('User found:', user);
        
        // Simpan ke currentUser
        currentUser = {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role || 'user'
        };
        
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
        
        showToast('success', `Selamat datang, ${user.name}!`);
        closeModal('loginModal');
        updateUIForLoggedInUser();
        
        // Reset form
        document.getElementById('loginForm').reset();
        
        // Jika admin, buka dashboard
        if (user.role === 'admin') {
            setTimeout(() => {
                openAdminDashboard();
            }, 500);
        }
    } else {
        console.log('User not found with email:', email);
        showToast('error', 'Email atau password salah!');
    }
}

// ============= REGISTER HANDLER =============
function handleRegister(event) {
    event.preventDefault();
    
    const name = document.getElementById('registerName').value.trim();
    const email = document.getElementById('registerEmail').value.trim();
    const password = document.getElementById('registerPassword').value.trim();
    const confirmPassword = document.getElementById('confirmPassword').value.trim();
    
    if (!name || !email || !password || !confirmPassword) {
        showToast('error', 'Semua field harus diisi!');
        return;
    }
    
    if (password !== confirmPassword) {
        showToast('error', 'Password tidak cocok!');
        return;
    }
    
    if (password.length < 6) {
        showToast('error', 'Password minimal 6 karakter!');
        return;
    }
    
    // Cek email sudah terdaftar
    if (users.some(u => u.email.toLowerCase() === email.toLowerCase())) {
        showToast('error', 'Email sudah terdaftar!');
        return;
    }
    
    const newUser = {
        id: users.length + 1,
        name: name,
        email: email,
        password: password,
        role: 'user',
        createdAt: new Date().toISOString()
    };
    
    users.push(newUser);
    localStorage.setItem('users', JSON.stringify(users));
    
    // Auto login setelah register
    currentUser = {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        role: 'user'
    };
    
    localStorage.setItem('currentUser', JSON.stringify(currentUser));
    
    // Update stats
    appStats.totalUsers++;
    localStorage.setItem('appStats', JSON.stringify(appStats));
    updateLiveStats();
    
    showToast('success', 'Registrasi berhasil! Selamat datang.');
    closeModal('registerModal');
    updateUIForLoggedInUser();
    
    // Reset form
    document.getElementById('registerForm').reset();
}

// ============= LOGOUT =============
function logout() {
    localStorage.removeItem('currentUser');
    currentUser = null;
    
    document.getElementById('loginBtn').classList.remove('hidden');
    document.getElementById('registerBtn').classList.remove('hidden');
    document.getElementById('userProfile').classList.add('hidden');
    document.getElementById('adminMenu').classList.add('hidden');
    document.getElementById('userMenu').classList.add('hidden');
    
    showToast('success', 'Berhasil logout!');
    
    // Reload products to disable buy buttons
    loadProducts();
}

// ============= ORDER FUNCTIONS =============
function openOrderModal(productId) {
    if (!currentUser) {
        showToast('warning', 'Silakan login terlebih dahulu!');
        openModal('loginModal');
        return;
    }
    
    selectedProduct = products.find(p => p.id === productId);
    if (!selectedProduct) return;
    
    const gameNames = {
        'ml': 'Mobile Legends',
        'ff': 'Free Fire',
        'pubg': 'PUBG Mobile',
        'cod': 'COD Mobile'
    };
    
    document.getElementById('orderProductDetail').innerHTML = `
        <h4>${gameNames[selectedProduct.game]}</h4>
        <p>${selectedProduct.name}</p>
        <p class="product-price">Rp ${formatRupiah(selectedProduct.price)}</p>
    `;
    
    document.getElementById('productPrice').textContent = `Rp ${formatRupiah(selectedProduct.price)}`;
    document.getElementById('totalPayment').textContent = `Rp ${formatRupiah(selectedProduct.price + 1000)}`;
    document.getElementById('paymentTotal').textContent = `Rp ${formatRupiah(selectedProduct.price + 1000)}`;
    
    openModal('orderModal');
}

function selectPayment(method) {
    const instructions = document.getElementById('paymentInstructions');
    const qrisDisplay = document.getElementById('qrisDisplay');
    const uploadProof = document.getElementById('uploadProof');
    
    instructions.classList.add('hidden');
    qrisDisplay.classList.add('hidden');
    uploadProof.classList.add('hidden');
    
    if (method === 'qris') {
        qrisDisplay.classList.remove('hidden');
        uploadProof.classList.remove('hidden');
    } else {
        instructions.classList.remove('hidden');
        uploadProof.classList.remove('hidden');
        document.getElementById('instructionBox').innerHTML = `
            <h4><i class="fas fa-info-circle"></i> Instruksi Pembayaran</h4>
            <div class="bank-detail">
                <p>Transfer ke:</p>
                <h3>0822 1075 6431</h3>
                <p>a.n <strong>Benoy</strong></p>
                <p>Via <strong>${method.toUpperCase()}</strong></p>
            </div>
            <div class="total-payment">
                <span>Total yang harus dibayar:</span>
                <strong>${document.getElementById('totalPayment').textContent}</strong>
            </div>
        `;
    }
}

function submitOrder() {
    const gameId = document.getElementById('gameId').value.trim();
    const zoneId = document.getElementById('zoneId').value.trim();
    const paymentMethod = document.querySelector('input[name="payment"]:checked')?.value;
    const paymentProof = document.getElementById('paymentProof').files[0];
    
    if (!gameId) {
        showToast('error', 'Masukkan User ID!');
        return;
    }
    
    if (!paymentMethod) {
        showToast('error', 'Pilih metode pembayaran!');
        return;
    }
    
    if (!paymentProof) {
        showToast('error', 'Upload bukti pembayaran!');
        return;
    }
    
    // Simulate file reading
    const reader = new FileReader();
    reader.onload = function(e) {
        const transaction = {
            id: 'TRX' + Date.now(),
            userId: currentUser.id,
            userName: currentUser.name,
            product: selectedProduct,
            gameId: gameId,
            zoneId: zoneId,
            paymentMethod: paymentMethod,
            paymentProof: e.target.result,
            total: selectedProduct.price + 1000,
            status: 'pending',
            createdAt: new Date().toISOString()
        };
        
        transactions.push(transaction);
        localStorage.setItem('transactions', JSON.stringify(transactions));
        
        // Update stats
        appStats.totalTransactions++;
        appStats.totalDiamonds += selectedProduct.diamond;
        appStats.totalRevenue += transaction.total;
        localStorage.setItem('appStats', JSON.stringify(appStats));
        updateLiveStats();
        
        showToast('success', 'Pesanan berhasil dikirim! Admin akan segera memproses.');
        closeModal('orderModal');
        
        // Reset form
        document.getElementById('gameId').value = '';
        document.getElementById('zoneId').value = '';
        document.getElementById('fileName').textContent = '';
        document.querySelectorAll('input[name="payment"]').forEach(r => r.checked = false);
        document.getElementById('paymentInstructions').classList.add('hidden');
        document.getElementById('qrisDisplay').classList.add('hidden');
        document.getElementById('uploadProof').classList.add('hidden');
        
        // Update notification badge
        updateNotificationBadge();
    };
    
    reader.readAsDataURL(paymentProof);
}

// ============= PROMO FUNCTIONS =============
function applyPromo() {
    const code = document.getElementById('promoCode').value.toUpperCase().trim();
    const promoMessage = document.getElementById('promoMessage');
    
    if (!code) {
        promoMessage.innerHTML = `
            <div class="promo-message error">
                <i class="fas fa-times-circle"></i> Masukkan kode promo!
            </div>
        `;
        return;
    }
    
    const promo = promos.find(p => p.code === code);
    
    if (promo) {
        showToast('success', `Promo ${code} berhasil! Diskon ${promo.discount}%`);
        promoMessage.innerHTML = `
            <div class="promo-message success">
                <i class="fas fa-check-circle"></i> Promo berhasil! Diskon ${promo.discount}%
            </div>
        `;
    } else {
        promoMessage.innerHTML = `
            <div class="promo-message error">
                <i class="fas fa-times-circle"></i> Kode promo tidak valid!
            </div>
        `;
    }
}

// ============= UI FUNCTIONS =============
function formatRupiah(amount) {
    return amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}

function updateLiveStats() {
    document.getElementById('totalUsers').textContent = appStats.totalUsers.toLocaleString();
    document.getElementById('totalTransactions').textContent = appStats.totalTransactions.toLocaleString();
    document.getElementById('totalDiamonds').textContent = appStats.totalDiamonds.toLocaleString();
}

function updateNotificationBadge() {
    const pendingCount = transactions.filter(t => t.status === 'pending').length;
    const badge = document.getElementById('notificationBadge');
    const adminBadge = document.getElementById('adminPendingCount');
    
    if (badge) {
        badge.textContent = pendingCount;
        badge.style.display = pendingCount > 0 ? 'block' : 'none';
    }
    
    if (adminBadge) {
        adminBadge.textContent = pendingCount;
    }
}

function showToast(type, message) {
    const container = document.getElementById('toastContainer');
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    
    const icons = {
        success: 'fa-check-circle',
        error: 'fa-exclamation-circle',
        warning: 'fa-exclamation-triangle',
        info: 'fa-info-circle'
    };
    
    toast.innerHTML = `
        <i class="fas ${icons[type]}"></i>
        <span>${message}</span>
    `;
    
    container.appendChild(toast);
    
    setTimeout(() => {
        toast.remove();
    }, 3000);
}

function updateFileName(input) {
    const fileName = document.getElementById('fileName');
    if (input.files && input.files[0]) {
        fileName.textContent = input.files[0].name;
    }
}

function toggleUserMenu() {
    document.getElementById('userMenu').classList.toggle('hidden');
}

function toggleMenu() {
    document.getElementById('navMenu').classList.toggle('show');
}

function openModal(modalId) {
    document.getElementById(modalId).classList.add('show');
}

function closeModal(modalId) {
    document.getElementById(modalId).classList.remove('show');
}

function switchModal(type) {
    closeModal(type === 'login' ? 'registerModal' : 'loginModal');
    openModal(type === 'login' ? 'loginModal' : 'registerModal');
}

function scrollToProducts() {
    document.getElementById('products').scrollIntoView({ behavior: 'smooth' });
}

// ============= USER MENU FUNCTIONS =============
function showNotifications() {
    const pending = transactions.filter(t => t.status === 'pending').length;
    if (pending > 0) {
        showToast('info', `Ada ${pending} transaksi pending`);
        if (currentUser?.role === 'admin') {
            openAdminDashboard();
        }
    } else {
        showToast('info', 'Tidak ada notifikasi');
    }
    document.getElementById('userMenu').classList.add('hidden');
}

function showUserProfile() {
    showToast('info', 'Fitur profil akan segera hadir');
    document.getElementById('userMenu').classList.add('hidden');
}

function showOrderHistory() {
    const userTransactions = transactions.filter(t => t.userId === currentUser?.id);
    
    if (userTransactions.length === 0) {
        showToast('info', 'Belum ada riwayat transaksi');
    } else {
        let message = `Riwayat transaksi (${userTransactions.length}):\n`;
        userTransactions.slice(0, 3).forEach(t => {
            const status = t.status === 'pending' ? '⏳' : t.status === 'success' ? '✅' : '❌';
            message += `${status} ${t.product.name}: Rp ${formatRupiah(t.total)}\n`;
        });
        showToast('info', message);
    }
    document.getElementById('userMenu').classList.add('hidden');
}

function showVoucher() {
    showToast('info', 'Fitur voucher akan segera hadir');
    document.getElementById('userMenu').classList.add('hidden');
}

// ============= ADMIN FUNCTIONS =============
function openAdminDashboard() {
    if (!currentUser || currentUser.role !== 'admin') {
        showToast('error', 'Akses ditolak! Hanya untuk admin.');
        return;
    }
    
    console.log('Opening admin dashboard for:', currentUser);
    loadAdminData();
    openModal('adminDashboardModal');
    document.getElementById('userMenu').classList.add('hidden');
}

function loadAdminData() {
    loadTransactions();
    loadAdminProducts();
    loadUsers();
    loadPayments();
    updateNotificationBadge();
    
    // Update dashboard stats
    if (document.getElementById('dashboardUsers')) {
        document.getElementById('dashboardUsers').textContent = appStats.totalUsers.toLocaleString();
        document.getElementById('dashboardTransactions').textContent = appStats.totalTransactions.toLocaleString();
        document.getElementById('dashboardDiamonds').textContent = appStats.totalDiamonds.toLocaleString();
        document.getElementById('dashboardRevenue').textContent = `Rp ${formatRupiah(appStats.totalRevenue)}`;
    }
}

function loadTransactions() {
    const list = document.getElementById('transactionsList');
    const recentList = document.getElementById('recentTransactionsList');
    
    if (!list) return;
    
    const sorted = [...transactions].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    
    // Main transactions list
    list.innerHTML = sorted.map(t => `
        <div class="transaction-item">
            <div class="transaction-info">
                <div><strong>${t.userName}</strong> - ${t.product?.name || 'Unknown'}</div>
                <div class="transaction-meta">ID: ${t.gameId} | ${new Date(t.createdAt).toLocaleString('id-ID')}</div>
            </div>
            <div class="transaction-amount">Rp ${formatRupiah(t.total)}</div>
            <div class="transaction-status status-${t.status}">${t.status}</div>
            <div class="transaction-actions">
                <button class="btn-view" onclick="viewTransaction('${t.id}')">Detail</button>
                ${t.paymentProof ? `<button class="btn-view" onclick="viewPaymentProof('${t.id}')">Bukti</button>` : ''}
            </div>
        </div>
    `).join('');
    
    // Recent transactions for dashboard
    if (recentList) {
        recentList.innerHTML = sorted.slice(0, 5).map(t => `
            <div class="transaction-item">
                <div class="transaction-info">
                    <div><strong>${t.userName}</strong> - ${t.product?.name || 'Unknown'}</div>
                    <div class="transaction-meta">${new Date(t.createdAt).toLocaleString('id-ID')}</div>
                </div>
                <div class="transaction-amount">Rp ${formatRupiah(t.total)}</div>
                <div class="transaction-status status-${t.status}">${t.status}</div>
            </div>
        `).join('');
    }
}

function loadAdminProducts() {
    const list = document.getElementById('adminProductsList');
    if (!list) return;
    
    const gameNames = {
        'ml': 'Mobile Legends',
        'ff': 'Free Fire',
        'pubg': 'PUBG Mobile',
        'cod': 'COD Mobile'
    };
    
    list.innerHTML = products.map(p => `
        <tr>
            <td>${p.id}</td>
            <td>${gameNames[p.game]}</td>
            <td>${p.name}</td>
            <td>${p.diamond}</td>
            <td>Rp ${formatRupiah(p.price)}</td>
            <td><span class="status-${p.status}">${p.status}</span></td>
            <td>
                <button class="btn-edit" onclick="editProduct(${p.id})">Edit</button>
                <button class="btn-delete" onclick="deleteProduct(${p.id})">Hapus</button>
            </td>
        </tr>
    `).join('');
}

function loadUsers() {
    const list = document.getElementById('usersList');
    if (!list) return;
    
    list.innerHTML = users.map(u => {
        const userTransactions = transactions.filter(t => t.userId === u.id);
        const totalSpent = userTransactions.reduce((sum, t) => sum + (t.total || 0), 0);
        
        return `
            <tr>
                <td>${u.id}</td>
                <td>${u.name}</td>
                <td>${u.email}</td>
                <td>${userTransactions.length}</td>
                <td>Rp ${formatRupiah(totalSpent)}</td>
                <td>${u.role || 'user'}</td>
                <td>
                    ${u.role !== 'admin' ? `<button class="btn-delete" onclick="deleteUser(${u.id})">Hapus</button>` : '-'}
                </td>
            </tr>
        `;
    }).join('');
}

function loadPayments() {
    const grid = document.getElementById('paymentsGrid');
    if (!grid) return;
    
    const pendingTransactions = transactions.filter(t => t.paymentProof && t.status === 'pending');
    
    if (pendingTransactions.length === 0) {
        grid.innerHTML = '<p style="text-align: center; padding: 40px; color: #666;">Tidak ada bukti pembayaran pending</p>';
        return;
    }
    
    grid.innerHTML = pendingTransactions.map(t => `
        <div class="payment-card" onclick="viewPaymentProof('${t.id}')">
            <img src="${t.paymentProof}" alt="Bukti Pembayaran" style="width:100%; height:150px; object-fit:cover; border-radius:4px;">
            <div style="padding:10px;">
                <div><strong>${t.userName}</strong></div>
                <div>Rp ${formatRupiah(t.total)}</div>
                <div class="transaction-status status-pending" style="display:inline-block; margin-top:5px;">Pending</div>
            </div>
        </div>
    `).join('');
}

function filterAdminProducts() {
    const game = document.getElementById('filterGameAdmin')?.value || 'all';
    const list = document.getElementById('adminProductsList');
    if (!list) return;
    
    const gameNames = {
        'ml': 'Mobile Legends',
        'ff': 'Free Fire',
        'pubg': 'PUBG Mobile',
        'cod': 'COD Mobile'
    };
    
    let filtered = products;
    if (game !== 'all') {
        filtered = products.filter(p => p.game === game);
    }
    
    list.innerHTML = filtered.map(p => `
        <tr>
            <td>${p.id}</td>
            <td>${gameNames[p.game]}</td>
            <td>${p.name}</td>
            <td>${p.diamond}</td>
            <td>Rp ${formatRupiah(p.price)}</td>
            <td><span class="status-${p.status}">${p.status}</span></td>
            <td>
                <button class="btn-edit" onclick="editProduct(${p.id})">Edit</button>
                <button class="btn-delete" onclick="deleteProduct(${p.id})">Hapus</button>
            </td>
        </tr>
    `).join('');
}

function filterTransactions() {
    const search = document.getElementById('searchTransaction')?.value.toLowerCase() || '';
    const status = document.getElementById('filterStatus')?.value || 'all';
    
    const filtered = transactions.filter(t => {
        const matchesSearch = (t.userName?.toLowerCase().includes(search) || 
                              t.gameId?.toLowerCase().includes(search) ||
                              t.id?.toLowerCase().includes(search));
        const matchesStatus = status === 'all' || t.status === status;
        return matchesSearch && matchesStatus;
    });
    
    const list = document.getElementById('transactionsList');
    if (!list) return;
    
    list.innerHTML = filtered.map(t => `
        <div class="transaction-item">
            <div class="transaction-info">
                <div><strong>${t.userName}</strong> - ${t.product?.name || 'Unknown'}</div>
                <div class="transaction-meta">ID: ${t.gameId} | ${new Date(t.createdAt).toLocaleString('id-ID')}</div>
            </div>
            <div class="transaction-amount">Rp ${formatRupiah(t.total)}</div>
            <div class="transaction-status status-${t.status}">${t.status}</div>
            <div class="transaction-actions">
                <button class="btn-view" onclick="viewTransaction('${t.id}')">Detail</button>
                ${t.paymentProof ? `<button class="btn-view" onclick="viewPaymentProof('${t.id}')">Bukti</button>` : ''}
            </div>
        </div>
    `).join('');
}

function filterUsers() {
    const search = document.getElementById('searchUser')?.value.toLowerCase() || '';
    
    const filtered = users.filter(u => 
        u.name?.toLowerCase().includes(search) || 
        u.email?.toLowerCase().includes(search)
    );
    
    const list = document.getElementById('usersList');
    if (!list) return;
    
    list.innerHTML = filtered.map(u => {
        const userTransactions = transactions.filter(t => t.userId === u.id);
        const totalSpent = userTransactions.reduce((sum, t) => sum + (t.total || 0), 0);
        
        return `
            <tr>
                <td>${u.id}</td>
                <td>${u.name}</td>
                <td>${u.email}</td>
                <td>${userTransactions.length}</td>
                <td>Rp ${formatRupiah(totalSpent)}</td>
                <td>${u.role || 'user'}</td>
                <td>
                    ${u.role !== 'admin' ? `<button class="btn-delete" onclick="deleteUser(${u.id})">Hapus</button>` : '-'}
                </td>
            </tr>
        `;
    }).join('');
}

function filterPayments() {
    const search = document.getElementById('searchPayment')?.value.toLowerCase() || '';
    
    const filtered = transactions.filter(t => 
        t.paymentProof && 
        t.status === 'pending' &&
        (t.userName?.toLowerCase().includes(search) || 
         t.id?.toLowerCase().includes(search))
    );
    
    const grid = document.getElementById('paymentsGrid');
    if (!grid) return;
    
    if (filtered.length === 0) {
        grid.innerHTML = '<p style="text-align: center; padding: 40px; color: #666;">Tidak ada bukti pembayaran</p>';
        return;
    }
    
    grid.innerHTML = filtered.map(t => `
        <div class="payment-card" onclick="viewPaymentProof('${t.id}')">
            <img src="${t.paymentProof}" alt="Bukti Pembayaran" style="width:100%; height:150px; object-fit:cover; border-radius:4px;">
            <div style="padding:10px;">
                <div><strong>${t.userName}</strong></div>
                <div>Rp ${formatRupiah(t.total)}</div>
                <div class="transaction-status status-pending" style="display:inline-block; margin-top:5px;">Pending</div>
            </div>
        </div>
    `).join('');
}

function showAddProductModal() {
    document.getElementById('productModalTitle').textContent = 'Tambah Produk';
    document.getElementById('productId').value = '';
    document.getElementById('productGame').value = 'ml';
    document.getElementById('productName').value = '';
    document.getElementById('productDiamond').value = '';
    document.getElementById('productPrice').value = '';
    document.getElementById('productBonus').value = '';
    document.getElementById('productStatus').value = 'active';
    
    openModal('productModal');
}

function editProduct(id) {
    const product = products.find(p => p.id === id);
    if (!product) return;
    
    document.getElementById('productModalTitle').textContent = 'Edit Produk';
    document.getElementById('productId').value = product.id;
    document.getElementById('productGame').value = product.game;
    document.getElementById('productName').value = product.name;
    document.getElementById('productDiamond').value = product.diamond;
    document.getElementById('productPrice').value = product.price;
    document.getElementById('productBonus').value = product.bonus || '';
    document.getElementById('productStatus').value = product.status;
    
    openModal('productModal');
}

function saveProduct(event) {
    event.preventDefault();
    
    const id = document.getElementById('productId').value;
    const product = {
        id: id ? parseInt(id) : products.length + 1,
        game: document.getElementById('productGame').value,
        name: document.getElementById('productName').value,
        diamond: parseInt(document.getElementById('productDiamond').value),
        price: parseInt(document.getElementById('productPrice').value),
        bonus: document.getElementById('productBonus').value,
        status: document.getElementById('productStatus').value
    };
    
    if (id) {
        // Edit existing
        const index = products.findIndex(p => p.id === parseInt(id));
        if (index !== -1) {
            products[index] = product;
        }
    } else {
        // Add new
        products.push(product);
    }
    
    localStorage.setItem('products', JSON.stringify(products));
    
    closeModal('productModal');
    loadAdminProducts();
    loadProducts(); // Reload frontend products
    showToast('success', 'Produk berhasil disimpan!');
}

function deleteProduct(id) {
    if (!confirm('Yakin ingin menghapus produk ini?')) return;
    
    products = products.filter(p => p.id !== id);
    localStorage.setItem('products', JSON.stringify(products));
    
    loadAdminProducts();
    loadProducts();
    showToast('success', 'Produk berhasil dihapus!');
}

function deleteUser(id) {
    if (!confirm('Yakin ingin menghapus user ini?')) return;
    
    users = users.filter(u => u.id !== id);
    localStorage.setItem('users', JSON.stringify(users));
    
    loadUsers();
    showToast('success', 'User berhasil dihapus!');
}

function viewTransaction(id) {
    const transaction = transactions.find(t => t.id === id);
    if (!transaction) return;
    
    const detail = document.getElementById('transactionDetail');
    detail.innerHTML = `
        <div style="padding: 20px;">
            <p><strong>ID Transaksi:</strong> ${transaction.id}</p>
            <p><strong>User:</strong> ${transaction.userName}</p>
            <p><strong>Produk:</strong> ${transaction.product?.name || 'Unknown'}</p>
            <p><strong>Game ID:</strong> ${transaction.gameId}</p>
            <p><strong>Zone ID:</strong> ${transaction.zoneId || '-'}</p>
            <p><strong>Metode:</strong> ${transaction.paymentMethod}</p>
            <p><strong>Total:</strong> Rp ${formatRupiah(transaction.total)}</p>
            <p><strong>Status:</strong> ${transaction.status}</p>
            <p><strong>Waktu:</strong> ${new Date(transaction.createdAt).toLocaleString('id-ID')}</p>
        </div>
    `;
    
    openModal('transactionDetailModal');
}

function viewPaymentProof(id) {
    const transaction = transactions.find(t => t.id === id);
    if (!transaction || !transaction.paymentProof) return;
    
    document.getElementById('proofImage').src = transaction.paymentProof;
    document.getElementById('proofImage').dataset.id = id;
    
    openModal('paymentProofModal');
}

function updateTransactionStatus(status) {
    const img = document.getElementById('proofImage');
    const id = img.dataset.id;
    
    const transaction = transactions.find(t => t.id === id);
    if (transaction) {
        transaction.status = status;
        localStorage.setItem('transactions', JSON.stringify(transactions));
        
        closeModal('paymentProofModal');
        loadTransactions();
        loadPayments();
        updateNotificationBadge();
        
        showToast('success', `Transaksi ${status === 'success' ? 'diterima' : 'ditolak'}!`);
    }
}

function showAdminTab(tab) {
    // Update sidebar
    document.querySelectorAll('.admin-menu a').forEach(a => a.classList.remove('active'));
    event.target.closest('a').classList.add('active');
    
    // Show tab
    document.querySelectorAll('.admin-tab').forEach(t => t.classList.remove('active'));
    document.getElementById(`tab-${tab}`).classList.add('active');
    
    // Load data if needed
    if (tab === 'transactions') loadTransactions();
    if (tab === 'payments') loadPayments();
    if (tab === 'products') loadAdminProducts();
    if (tab === 'users') loadUsers();
}

function showAddPromoModal() {
    openModal('promoModal');
}

function savePromo(event) {
    event.preventDefault();
    
    const promo = {
        code: document.getElementById('promoCode').value.toUpperCase(),
        discount: parseInt(document.getElementById('promoDiscount').value),
        minPurchase: parseInt(document.getElementById('promoMin').value),
        expiry: document.getElementById('promoExpiry').value
    };
    
    promos.push(promo);
    localStorage.setItem('promos', JSON.stringify(promos));
    
    closeModal('promoModal');
    showToast('success', 'Promo berhasil ditambahkan!');
}

function exportReport(type) {
    showToast('info', `Mengekspor laporan ${type}...`);
}

function saveSettings() {
    showToast('success', 'Pengaturan berhasil disimpan!');
}

// ============= DEBUG FUNCTIONS =============
function checkAdminData() {
    console.log('=== DATA USER ===');
    console.log('Semua users:', users);
    
    const admin = users.find(u => u.role === 'admin');
    console.log('Admin ditemukan:', admin);
    
    if (admin) {
        console.log('Email admin:', admin.email);
        console.log('Password admin:', admin.password);
    } else {
        console.log('⚠️ Admin TIDAK DITEMUKAN!');
    }
    
    console.log('=== DATA CURRENT USER ===');
    console.log('Current user:', currentUser);
    
    console.log('=== LOCALSTORAGE ===');
    console.log('localStorage users:', localStorage.getItem('users'));
    console.log('localStorage currentUser:', localStorage.getItem('currentUser'));
    
    showToast('info', 'Cek console browser (F12) untuk detail');
}

function resetAdminData() {
    if (!confirm('RESET DATA ADMIN? Semua data pengguna akan direset!')) return;
    
    // Hapus semua data
    localStorage.removeItem('users');
    localStorage.removeItem('currentUser');
    
    // Buat ulang users dengan admin
    users = [
        { 
            id: 1, 
            name: 'Admin Benoy', 
            email: 'admin@benoystore.com', 
            password: 'admin123', 
            role: 'admin',
            createdAt: new Date().toISOString()
        },
        { 
            id: 2, 
            name: 'User Demo', 
            email: 'user@demo.com', 
            password: 'user123', 
            role: 'user',
            createdAt: new Date().toISOString()
        }
    ];
    
    localStorage.setItem('users', JSON.stringify(users));
    localStorage.removeItem('currentUser');
    currentUser = null;
    
    // Reset UI
    document.getElementById('loginBtn').classList.remove('hidden');
    document.getElementById('registerBtn').classList.remove('hidden');
    document.getElementById('userProfile').classList.add('hidden');
    
    showToast('success', 'Data admin telah direset!');
    showToast('info', 'Email: admin@benoystore.com | Password: admin123');
    
    console.log('Data admin telah direset!');
}

// ============= EVENT LISTENERS =============
function setupEventListeners() {
    // Filter buttons
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            filterProducts(this.dataset.game);
        });
    });
    
    // Close modals when clicking outside
    window.addEventListener('click', function(event) {
        if (event.target.classList.contains('modal')) {
            event.target.classList.remove('show');
        }
    });
    
    // Scroll spy
    window.addEventListener('scroll', function() {
        const navLinks = document.querySelectorAll('.nav-link');
        const sections = ['home', 'products', 'how-it-works', 'promo', 'contact'];
        
        let current = '';
        sections.forEach(section => {
            const element = document.getElementById(section);
            if (element) {
                const rect = element.getBoundingClientRect();
                if (rect.top <= 100) {
                    current = section;
                }
            }
        });
        
        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href').slice(1) === current) {
                link.classList.add('active');
            }
        });
    });
}

// ============= EXPORT FUNCTIONS =============
window.openOrderModal = openOrderModal;
window.handleLogin = handleLogin;
window.handleRegister = handleRegister;
window.openModal = openModal;
window.closeModal = closeModal;
window.switchModal = switchModal;
window.scrollToProducts = scrollToProducts;
window.toggleUserMenu = toggleUserMenu;
window.toggleMenu = toggleMenu;
window.logout = logout;
window.selectPayment = selectPayment;
window.submitOrder = submitOrder;
window.updateFileName = updateFileName;
window.applyPromo = applyPromo;
window.showNotifications = showNotifications;
window.showUserProfile = showUserProfile;
window.showOrderHistory = showOrderHistory;
window.showVoucher = showVoucher;
window.openAdminDashboard = openAdminDashboard;
window.showAdminTab = showAdminTab;
window.showAddProductModal = showAddProductModal;
window.editProduct = editProduct;
window.saveProduct = saveProduct;
window.deleteProduct = deleteProduct;
window.viewTransaction = viewTransaction;
window.viewPaymentProof = viewPaymentProof;
window.updateTransactionStatus = updateTransactionStatus;
window.filterTransactions = filterTransactions;
window.filterUsers = filterUsers;
window.filterPayments = filterPayments;
window.filterAdminProducts = filterAdminProducts;
window.showAddPromoModal = showAddPromoModal;
window.savePromo = savePromo;
window.exportReport = exportReport;
window.saveSettings = saveSettings;
window.checkAdminData = checkAdminData;
window.resetAdminData = resetAdminData;

// Auto refresh notifications
setInterval(updateNotificationBadge, 5000);

console.log('Script loaded successfully!');
