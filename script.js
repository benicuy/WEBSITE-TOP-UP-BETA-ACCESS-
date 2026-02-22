// ============= GLOBAL VARIABLES =============
let currentUser = null;
let selectedProduct = null;
let products = [];
let transactions = [];
let users = [];
let promos = [];
let vouchers = [];
let appliedVoucher = null;
let appStats = {
    totalUsers: 0,
    totalTransactions: 0,
    totalDiamonds: 0,
    totalRevenue: 0,
    totalVouchers: 0
};

// Debug mode
const DEBUG = true;

// ============= INITIALIZATION =============
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded - initializing app...');
    loadData();
    loadProducts();
    loadVouchers();
    setupEventListeners();
    checkAuthStatus();
    updateLiveStats();
    updateNotificationBadge();
});

// ============= DATA LOADING =============
function loadData() {
    console.log('Loading data from localStorage...');
    
    // Load users
    const savedUsers = localStorage.getItem('users');
    if (savedUsers) {
        users = JSON.parse(savedUsers);
        console.log('Users loaded:', users.length);
    } else {
        console.log('No users found, creating default users...');
        users = [
            { 
                id: 1, 
                name: 'Admin Benoy', 
                email: 'admin@warungmurah.com', 
                password: 'warungmurah122', 
                role: 'admin',
                vouchers: [],
                createdAt: new Date().toISOString()
            },
            { 
                id: 2, 
                name: 'User Demo', 
                email: 'user@demo.com', 
                password: 'user123', 
                role: 'user',
                vouchers: [],
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
    } else {
        promos = [
            { code: 'WELCOME10', discount: 10, minPurchase: 20000, expiry: '2040-12-31' },
            { code: 'DIAMOND20', discount: 20, minPurchase: 50000, expiry: '2040-12-31' }
        ];
        localStorage.setItem('promos', JSON.stringify(promos));
    }
    
    // Update app stats
    appStats.totalUsers = users.length;
    appStats.totalTransactions = transactions.length;
    appStats.totalDiamonds = transactions.reduce((sum, t) => sum + (t.product?.diamond || 0), 0);
    appStats.totalRevenue = transactions.reduce((sum, t) => sum + (t.total || 0), 0);
    appStats.totalVouchers = vouchers.reduce((sum, v) => sum + (v.claimedBy?.length || 0), 0);
    
    localStorage.setItem('appStats', JSON.stringify(appStats));
}

// Load vouchers
function loadVouchers() {
    const savedVouchers = localStorage.getItem('vouchers');
    if (savedVouchers) {
        vouchers = JSON.parse(savedVouchers);
    } else {
        vouchers = [
            { 
                id: 'VCH001', 
                code: 'VOUCHER10', 
                name: 'Voucher Diskon 10%', 
                description: 'Dapatkan diskon 10% untuk semua pembelian',
                discount: 10, 
                minPurchase: 20000,
                type: 'discount',
                forGame: 'all',
                expiresAt: '2024-12-31',
                claimedBy: [],
                maxClaims: 100,
                active: true,
                createdAt: new Date().toISOString()
            },
            { 
                id: 'VCH002', 
                code: 'FF15', 
                name: 'Voucher Free Fire 15%', 
                description: 'Diskon 15% khusus Free Fire',
                discount: 15, 
                minPurchase: 30000,
                type: 'discount',
                forGame: 'ff',
                expiresAt: '2024-12-31',
                claimedBy: [],
                maxClaims: 50,
                active: true,
                createdAt: new Date().toISOString()
            },
            { 
                id: 'VCH003', 
                code: 'CASHBACK5', 
                name: 'Cashback 5%', 
                description: 'Dapatkan cashback 5%',
                discount: 5,
                type: 'cashback',
                forGame: 'all',
                minPurchase: 50000,
                expiresAt: '2024-12-31',
                claimedBy: [],
                maxClaims: 200,
                active: true,
                createdAt: new Date().toISOString()
            }
        ];
        localStorage.setItem('vouchers', JSON.stringify(vouchers));
    }
    
    displayVouchers();
}

// ============= PRODUCT FUNCTIONS =============
function loadProducts() {
    const productGrid = document.getElementById('productGrid');
    if (!productGrid) return;
    
    const activeProducts = products.filter(p => p.status === 'active');
    
    productGrid.innerHTML = activeProducts.map(product => {
        const gameNames = {
            'ml': 'Mobile Legends',
            'ff': 'Free Fire',
            'pubg': 'PUBG Mobile',
            'cod': 'COD Mobile'
        };
        
        return `
            <div class="product-card">
                <div class="product-badge">${gameNames[product.game]}</div>
                <div class="product-name">${product.name}</div>
                <div class="product-price">Rp ${formatRupiah(product.price)}</div>
                <button class="btn-buy" onclick="openOrderModal(${product.id})" ${!currentUser ? 'disabled' : ''}>
                    ${currentUser ? 'Beli Sekarang' : 'Login untuk Membeli'}
                </button>
            </div>
        `;
    }).join('');
}

function filterProducts(game) {
    const productGrid = document.getElementById('productGrid');
    if (!productGrid) return;
    
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
    
    productGrid.innerHTML = filteredProducts.map(product => `
        <div class="product-card">
            <div class="product-badge">${gameNames[product.game]}</div>
            <div class="product-name">${product.name}</div>
            <div class="product-price">Rp ${formatRupiah(product.price)}</div>
            <button class="btn-buy" onclick="openOrderModal(${product.id})" ${!currentUser ? 'disabled' : ''}>
                ${currentUser ? 'Beli Sekarang' : 'Login untuk Membeli'}
            </button>
        </div>
    `).join('');
}

// ============= VOUCHER FUNCTIONS =============
function displayVouchers() {
    const voucherGrid = document.getElementById('voucherGrid');
    if (!voucherGrid) return;
    
    const now = new Date();
    const availableVouchers = vouchers.filter(v => {
        const expiryDate = new Date(v.expiresAt);
        return expiryDate > now && v.active && v.claimedBy.length < v.maxClaims;
    });
    
    voucherGrid.innerHTML = availableVouchers.map(v => {
        const gameText = v.forGame === 'all' ? 'Semua Game' : getGameName(v.forGame);
        const claimed = v.claimedBy.length;
        const remaining = v.maxClaims - claimed;
        const expiryDate = new Date(v.expiresAt).toLocaleDateString('id-ID');
        
        return `
            <div class="voucher-card">
                <div class="voucher-code">${v.code}</div>
                <div class="voucher-name">${v.name}</div>
                <div class="voucher-desc">${v.description}</div>
                <div class="voucher-detail">
                    <span class="voucher-min">Min. Rp ${formatRupiah(v.minPurchase)}</span>
                    <span class="voucher-expiry">Exp: ${expiryDate}</span>
                </div>
                <div class="voucher-game">${gameText}</div>
                <div style="font-size:11px; color:#666; margin:5px 0;">Tersisa: ${remaining} dari ${v.maxClaims}</div>
                <button class="btn-claim" onclick="claimVoucher('${v.id}')" ${!currentUser ? 'disabled' : ''}>
                    ${currentUser ? 'Klaim Voucher' : 'Login untuk Klaim'}
                </button>
            </div>
        `;
    }).join('');
    
    if (availableVouchers.length === 0) {
        voucherGrid.innerHTML = '<p style="text-align:center; padding:40px; color:#666;">Belum ada voucher tersedia</p>';
    }
}

function claimVoucher(voucherId) {
    if (!currentUser) {
        showToast('warning', 'Silakan login untuk klaim voucher!');
        return;
    }
    
    const voucher = vouchers.find(v => v.id === voucherId);
    if (!voucher) {
        showToast('error', 'Voucher tidak ditemukan!');
        return;
    }
    
    // Cek masa berlaku
    const expiryDate = new Date(voucher.expiresAt);
    if (expiryDate < new Date()) {
        showToast('error', 'Voucher sudah kadaluarsa!');
        return;
    }
    
    // Cek kuota
    if (voucher.claimedBy.length >= voucher.maxClaims) {
        showToast('error', 'Voucher sudah habis!');
        return;
    }
    
    // Cek apakah user sudah pernah klaim
    if (voucher.claimedBy.includes(currentUser.id)) {
        showToast('error', 'Anda sudah pernah mengklaim voucher ini!');
        return;
    }
    
    // Tambahkan ke user
    const user = users.find(u => u.id === currentUser.id);
    if (!user) return;
    
    if (!user.vouchers) user.vouchers = [];
    
    const userVoucher = {
        id: voucher.id,
        code: voucher.code,
        name: voucher.name,
        discount: voucher.discount,
        minPurchase: voucher.minPurchase,
        type: voucher.type,
        forGame: voucher.forGame,
        expiresAt: voucher.expiresAt,
        claimedAt: new Date().toISOString(),
        used: false
    };
    
    user.vouchers.push(userVoucher);
    
    // Update database voucher
    voucher.claimedBy.push(currentUser.id);
    
    // Simpan ke localStorage
    localStorage.setItem('users', JSON.stringify(users));
    localStorage.setItem('vouchers', JSON.stringify(vouchers));
    
    showToast('success', `Voucher ${voucher.code} berhasil diklaim!`);
    displayVouchers();
    updateUserVoucherCount();
}

function showUserVouchers() {
    if (!currentUser) {
        showToast('warning', 'Silakan login terlebih dahulu!');
        return;
    }
    
    const user = users.find(u => u.id === currentUser.id);
    if (!user) return;
    
    const userVouchers = user.vouchers || [];
    const now = new Date();
    
    const activeVouchers = userVouchers.filter(v => {
        const expiryDate = new Date(v.expiresAt);
        return expiryDate > now && !v.used;
    });
    
    if (activeVouchers.length === 0) {
        showToast('info', 'Anda belum memiliki voucher aktif. Klaim voucher di halaman voucher!');
        return;
    }
    
    let message = '🎫 VOUCHER AKTIF ANDA:\n\n';
    activeVouchers.forEach((v, index) => {
        const expiryDate = new Date(v.expiresAt).toLocaleDateString('id-ID');
        const gameInfo = v.forGame !== 'all' ? ` (Khusus ${getGameName(v.forGame)})` : '';
        message += `${index+1}. ${v.code}\n`;
        message += `   ${v.name}${gameInfo}\n`;
        message += `   Diskon ${v.discount}% - Min Rp ${formatRupiah(v.minPurchase)}\n`;
        message += `   Berlaku s/d: ${expiryDate}\n\n`;
    });
    
    showToast('info', message);
    document.getElementById('userMenu')?.classList.add('hidden');
}

function showAvailableVouchers() {
    if (!currentUser) {
        showToast('warning', 'Silakan login untuk lihat voucher!');
        return;
    }
    
    const now = new Date();
    const availableVouchers = vouchers.filter(v => {
        const expiryDate = new Date(v.expiresAt);
        return expiryDate > now && 
               v.active && 
               v.claimedBy.length < v.maxClaims && 
               !v.claimedBy.includes(currentUser.id);
    });
    
    if (availableVouchers.length === 0) {
        showToast('info', 'Tidak ada voucher yang tersedia saat ini');
        return;
    }
    
    let message = '🎫 VOUCHER TERSEDIA:\n\n';
    availableVouchers.forEach((v, index) => {
        const gameInfo = v.forGame !== 'all' ? ` (Khusus ${getGameName(v.forGame)})` : '';
        const remaining = v.maxClaims - v.claimedBy.length;
        message += `${index+1}. ${v.code} - ${v.name}${gameInfo}\n`;
        message += `   Diskon ${v.discount}% - Min Rp ${formatRupiah(v.minPurchase)}\n`;
        message += `   Sisa: ${remaining} dari ${v.maxClaims}\n\n`;
    });
    message += 'Kunjungi halaman Voucher untuk klaim';
    
    showToast('info', message);
    document.getElementById('userMenu')?.classList.add('hidden');
}

function applyVoucher(voucherCode) {
    if (!currentUser) {
        showToast('warning', 'Silakan login terlebih dahulu!');
        return;
    }
    
    if (!selectedProduct) {
        showToast('error', 'Pilih produk terlebih dahulu!');
        return;
    }
    
    const user = users.find(u => u.id === currentUser.id);
    if (!user || !user.vouchers) {
        showToast('error', 'Anda tidak memiliki voucher!');
        return;
    }
    
    const now = new Date();
    const voucher = user.vouchers.find(v => 
        v.code === voucherCode && 
        !v.used && 
        new Date(v.expiresAt) > now
    );
    
    if (!voucher) {
        showToast('error', 'Voucher tidak valid, sudah digunakan, atau kadaluarsa!');
        return;
    }
    
    // Cek minimal pembelian
    const totalBeforeDiscount = selectedProduct.price + 1000;
    if (totalBeforeDiscount < voucher.minPurchase) {
        showToast('error', `Minimal pembelian Rp ${formatRupiah(voucher.minPurchase)} untuk voucher ini!`);
        return;
    }
    
    // Cek khusus game
    if (voucher.forGame && voucher.forGame !== 'all' && voucher.forGame !== selectedProduct.game) {
        showToast('error', `Voucher ini hanya untuk game ${getGameName(voucher.forGame)}!`);
        return;
    }
    
    // Apply voucher
    appliedVoucher = voucher;
    
    // Hitung diskon
    const discountAmount = totalBeforeDiscount * (voucher.discount / 100);
    const totalAfterDiscount = totalBeforeDiscount - discountAmount;
    
    // Update UI
    const voucherInfoBox = document.getElementById('voucherInfoBox');
    const discountRow = document.getElementById('discountRow');
    const totalPayment = document.getElementById('totalPayment');
    const paymentTotal = document.getElementById('paymentTotal');
    
    if (voucherInfoBox) {
        voucherInfoBox.classList.remove('hidden');
        document.getElementById('voucherAppliedInfo').innerHTML = `
            <strong>${voucher.code}</strong> - Diskon ${voucher.discount}%
        `;
    }
    
    if (discountRow) {
        discountRow.classList.remove('hidden');
        document.getElementById('discountAmount').textContent = `-Rp ${formatRupiah(Math.round(discountAmount))}`;
    }
    
    if (totalPayment) totalPayment.textContent = `Rp ${formatRupiah(Math.round(totalAfterDiscount))}`;
    if (paymentTotal) paymentTotal.textContent = `Rp ${formatRupiah(Math.round(totalAfterDiscount))}`;
    
    showToast('success', `Voucher ${voucher.code} berhasil digunakan! Diskon ${voucher.discount}%`);
    
    const promoMessage = document.getElementById('promoMessage');
    if (promoMessage) {
        promoMessage.innerHTML = `
            <div class="promo-message success">
                <i class="fas fa-check-circle"></i> Voucher ${voucher.code} applied! Diskon ${voucher.discount}%
            </div>
        `;
    }
}

function removeVoucher() {
    appliedVoucher = null;
    
    if (!selectedProduct) return;
    
    const totalBeforeDiscount = selectedProduct.price + 1000;
    
    const totalPayment = document.getElementById('totalPayment');
    const paymentTotal = document.getElementById('paymentTotal');
    const voucherInfoBox = document.getElementById('voucherInfoBox');
    const discountRow = document.getElementById('discountRow');
    
    if (totalPayment) totalPayment.textContent = `Rp ${formatRupiah(totalBeforeDiscount)}`;
    if (paymentTotal) paymentTotal.textContent = `Rp ${formatRupiah(totalBeforeDiscount)}`;
    if (voucherInfoBox) voucherInfoBox.classList.add('hidden');
    if (discountRow) discountRow.classList.add('hidden');
    
    const promoMessage = document.getElementById('promoMessage');
    if (promoMessage) promoMessage.innerHTML = '';
    
    showToast('info', 'Voucher dibatalkan');
}

function markVoucherAsUsed() {
    if (!currentUser || !appliedVoucher) return;
    
    const user = users.find(u => u.id === currentUser.id);
    if (!user || !user.vouchers) return;
    
    const voucher = user.vouchers.find(v => v.code === appliedVoucher.code);
    if (voucher) {
        voucher.used = true;
        voucher.usedAt = new Date().toISOString();
        localStorage.setItem('users', JSON.stringify(users));
    }
    
    appliedVoucher = null;
}

function updateUserVoucherCount() {
    if (!currentUser) return;
    
    const user = users.find(u => u.id === currentUser.id);
    if (!user || !user.vouchers) return;
    
    const now = new Date();
    const activeCount = user.vouchers.filter(v => 
        !v.used && new Date(v.expiresAt) > now
    ).length;
    
    const badge = document.querySelector('#userMenu .badge');
    if (badge) {
        badge.textContent = activeCount;
        badge.style.display = activeCount > 0 ? 'inline-block' : 'none';
    }
}

// ============= AUTHENTICATION =============
function checkAuthStatus() {
    const user = localStorage.getItem('currentUser');
    if (user) {
        currentUser = JSON.parse(user);
        console.log('User logged in:', currentUser);
        updateUIForLoggedInUser();
    }
}

function updateUIForLoggedInUser() {
    const loginBtn = document.getElementById('loginBtn');
    const registerBtn = document.getElementById('registerBtn');
    const userProfile = document.getElementById('userProfile');
    const usernameDisplay = document.getElementById('usernameDisplay');
    const adminMenu = document.getElementById('adminMenu');
    
    if (loginBtn) loginBtn.classList.add('hidden');
    if (registerBtn) registerBtn.classList.add('hidden');
    if (userProfile) userProfile.classList.remove('hidden');
    if (usernameDisplay) usernameDisplay.textContent = currentUser.name.split(' ')[0];
    
    if (currentUser.role === 'admin' && adminMenu) {
        adminMenu.classList.remove('hidden');
    }
    
    const avatar = document.querySelector('#userProfile img');
    if (avatar) {
        avatar.src = `https://ui-avatars.com/api/?name=${currentUser.name.replace(' ', '+')}&background=3b82f6&color=fff`;
    }
    
    // Enable buy buttons
    document.querySelectorAll('.btn-buy').forEach(btn => {
        btn.disabled = false;
        btn.textContent = 'Beli Sekarang';
    });
    
    // Enable claim buttons
    document.querySelectorAll('.btn-claim').forEach(btn => {
        btn.disabled = false;
        btn.textContent = 'Klaim Voucher';
    });
    
    updateUserVoucherCount();
}

// ============= LOGIN HANDLER =============
function handleLogin(event) {
    event.preventDefault();
    
    const email = document.getElementById('loginEmail').value.trim();
    const password = document.getElementById('loginPassword').value.trim();
    
    const user = users.find(u => u.email.toLowerCase() === email.toLowerCase() && u.password === password);
    
    if (user) {
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
        
        document.getElementById('loginForm')?.reset();
        
        if (user.role === 'admin') {
            setTimeout(() => {
                openAdminDashboard();
            }, 500);
        }
    } else {
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
        vouchers: [],
        createdAt: new Date().toISOString()
    };
    
    users.push(newUser);
    localStorage.setItem('users', JSON.stringify(users));
    
    currentUser = {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        role: 'user'
    };
    
    localStorage.setItem('currentUser', JSON.stringify(currentUser));
    
    appStats.totalUsers = users.length;
    localStorage.setItem('appStats', JSON.stringify(appStats));
    updateLiveStats();
    
    showToast('success', 'Registrasi berhasil! Selamat datang.');
    closeModal('registerModal');
    updateUIForLoggedInUser();
    
    document.getElementById('registerForm')?.reset();
}

// ============= LOGOUT =============
function logout() {
    localStorage.removeItem('currentUser');
    currentUser = null;
    appliedVoucher = null;
    
    const loginBtn = document.getElementById('loginBtn');
    const registerBtn = document.getElementById('registerBtn');
    const userProfile = document.getElementById('userProfile');
    const adminMenu = document.getElementById('adminMenu');
    const userMenu = document.getElementById('userMenu');
    
    if (loginBtn) loginBtn.classList.remove('hidden');
    if (registerBtn) registerBtn.classList.remove('hidden');
    if (userProfile) userProfile.classList.add('hidden');
    if (adminMenu) adminMenu.classList.add('hidden');
    if (userMenu) userMenu.classList.add('hidden');
    
    showToast('success', 'Berhasil logout!');
    
    loadProducts();
    displayVouchers();
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
    
    const orderProductDetail = document.getElementById('orderProductDetail');
    if (orderProductDetail) {
        orderProductDetail.innerHTML = `
            <h4>${gameNames[selectedProduct.game]}</h4>
            <p>${selectedProduct.name}</p>
            <p class="product-price">Rp ${formatRupiah(selectedProduct.price)}</p>
        `;
    }
    
    const productPrice = document.getElementById('productPrice');
    const totalPayment = document.getElementById('totalPayment');
    const paymentTotal = document.getElementById('paymentTotal');
    
    if (productPrice) productPrice.textContent = `Rp ${formatRupiah(selectedProduct.price)}`;
    
    const total = selectedProduct.price + 1000;
    if (totalPayment) totalPayment.textContent = `Rp ${formatRupiah(total)}`;
    if (paymentTotal) paymentTotal.textContent = `Rp ${formatRupiah(total)}`;
    
    // Reset voucher
    appliedVoucher = null;
    
    const voucherInfoBox = document.getElementById('voucherInfoBox');
    const discountRow = document.getElementById('discountRow');
    const promoMessage = document.getElementById('promoMessage');
    
    if (voucherInfoBox) voucherInfoBox.classList.add('hidden');
    if (discountRow) discountRow.classList.add('hidden');
    if (promoMessage) promoMessage.innerHTML = '';
    
    openModal('orderModal');
}

function selectPayment(method) {
    const instructions = document.getElementById('paymentInstructions');
    const qrisDisplay = document.getElementById('qrisDisplay');
    const uploadProof = document.getElementById('uploadProof');
    
    if (instructions) instructions.classList.add('hidden');
    if (qrisDisplay) qrisDisplay.classList.add('hidden');
    if (uploadProof) uploadProof.classList.add('hidden');
    
    if (method === 'qris') {
        if (qrisDisplay) qrisDisplay.classList.remove('hidden');
        if (uploadProof) uploadProof.classList.remove('hidden');
    } else {
        if (instructions) instructions.classList.remove('hidden');
        if (uploadProof) uploadProof.classList.remove('hidden');
        
        const instructionBox = document.getElementById('instructionBox');
        const totalPayment = document.getElementById('totalPayment');
        
        if (instructionBox) {
            instructionBox.innerHTML = `
                <h4><i class="fas fa-info-circle"></i> Instruksi Pembayaran</h4>
                <div class="bank-detail">
                    <p>Transfer ke:</p>
                    <h3>0822 1075 6431</h3>
                    <p>a.n <strong>Benoy</strong></p>
                    <p>Via <strong>${method.toUpperCase()}</strong></p>
                </div>
                <div class="total-payment">
                    <span>Total yang harus dibayar:</span>
                    <strong>${totalPayment ? totalPayment.textContent : 'Rp 0'}</strong>
                </div>
            `;
        }
    }
}

function submitOrder() {
    const gameId = document.getElementById('gameId')?.value.trim();
    const zoneId = document.getElementById('zoneId')?.value.trim();
    const paymentMethod = document.querySelector('input[name="payment"]:checked')?.value;
    const paymentProof = document.getElementById('paymentProof')?.files[0];
    
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
    
    // Hitung total dengan voucher
    let total = selectedProduct.price + 1000;
    let discountAmount = 0;
    let usedVoucher = null;
    
    if (appliedVoucher) {
        discountAmount = total * (appliedVoucher.discount / 100);
        total = total - discountAmount;
        usedVoucher = appliedVoucher.code;
    }
    
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
            subtotal: selectedProduct.price + 1000,
            discount: Math.round(discountAmount),
            voucherUsed: usedVoucher,
            total: Math.round(total),
            status: 'pending',
            createdAt: new Date().toISOString()
        };
        
        transactions.push(transaction);
        localStorage.setItem('transactions', JSON.stringify(transactions));
        
        if (appliedVoucher) {
            markVoucherAsUsed();
        }
        
        appStats.totalTransactions = transactions.length;
        appStats.totalDiamonds += selectedProduct.diamond;
        appStats.totalRevenue += transaction.total;
        localStorage.setItem('appStats', JSON.stringify(appStats));
        updateLiveStats();
        
        showToast('success', 'Pesanan berhasil dikirim! Admin akan segera memproses.');
        closeModal('orderModal');
        
        // Reset form
        const gameIdInput = document.getElementById('gameId');
        const zoneIdInput = document.getElementById('zoneId');
        const fileName = document.getElementById('fileName');
        
        if (gameIdInput) gameIdInput.value = '';
        if (zoneIdInput) zoneIdInput.value = '';
        if (fileName) fileName.textContent = '';
        
        document.querySelectorAll('input[name="payment"]').forEach(r => r.checked = false);
        
        const paymentInstructions = document.getElementById('paymentInstructions');
        const qrisDisplay = document.getElementById('qrisDisplay');
        const uploadProof = document.getElementById('uploadProof');
        const promoMessage = document.getElementById('promoMessage');
        const voucherInfoBox = document.getElementById('voucherInfoBox');
        
        if (paymentInstructions) paymentInstructions.classList.add('hidden');
        if (qrisDisplay) qrisDisplay.classList.add('hidden');
        if (uploadProof) uploadProof.classList.add('hidden');
        if (promoMessage) promoMessage.innerHTML = '';
        if (voucherInfoBox) voucherInfoBox.classList.add('hidden');
        
        appliedVoucher = null;
        
        updateNotificationBadge();
        updateUserVoucherCount();
    };
    
    reader.readAsDataURL(paymentProof);
}

// ============= PROMO FUNCTIONS =============
function applyPromo() {
    const code = document.getElementById('promoCode')?.value.toUpperCase().trim();
    const promoMessage = document.getElementById('promoMessage');
    
    if (!code) {
        if (promoMessage) {
            promoMessage.innerHTML = `
                <div class="promo-message error">
                    <i class="fas fa-times-circle"></i> Masukkan kode promo!
                </div>
            `;
        }
        return;
    }
    
    // Cek di voucher user dulu
    if (currentUser) {
        const user = users.find(u => u.id === currentUser.id);
        if (user && user.vouchers) {
            const userVoucher = user.vouchers.find(v => v.code === code && !v.used);
            if (userVoucher) {
                applyVoucher(code);
                return;
            }
        }
    }
    
    // Cek di promo umum
    const promo = promos.find(p => p.code === code);
    
    if (promo) {
        showToast('success', `Promo ${code} berhasil! Diskon ${promo.discount}%`);
        if (promoMessage) {
            promoMessage.innerHTML = `
                <div class="promo-message success">
                    <i class="fas fa-check-circle"></i> Promo berhasil! Diskon ${promo.discount}%
                </div>
            `;
        }
    } else {
        if (promoMessage) {
            promoMessage.innerHTML = `
                <div class="promo-message error">
                    <i class="fas fa-times-circle"></i> Kode tidak valid!
                </div>
            `;
        }
    }
}

// ============= UI FUNCTIONS =============
function formatRupiah(amount) {
    return amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}

function getGameName(gameCode) {
    const names = {
        'ml': 'Mobile Legends',
        'ff': 'Free Fire',
        'pubg': 'PUBG Mobile',
        'cod': 'COD Mobile',
        'all': 'Semua Game'
    };
    return names[gameCode] || gameCode;
}

function updateLiveStats() {
    const totalUsers = document.getElementById('totalUsers');
    const totalTransactions = document.getElementById('totalTransactions');
    const totalVouchers = document.getElementById('totalVouchers');
    
    if (totalUsers) totalUsers.textContent = appStats.totalUsers.toLocaleString();
    if (totalTransactions) totalTransactions.textContent = appStats.totalTransactions.toLocaleString();
    if (totalVouchers) totalVouchers.textContent = appStats.totalVouchers.toLocaleString();
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
    if (!container) return;
    
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
    if (fileName && input.files && input.files[0]) {
        fileName.textContent = input.files[0].name;
    }
}

function toggleUserMenu() {
    const menu = document.getElementById('userMenu');
    if (menu) menu.classList.toggle('hidden');
}

function toggleMenu() {
    const menu = document.getElementById('navMenu');
    if (menu) menu.classList.toggle('show');
}

function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) modal.classList.add('show');
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) modal.classList.remove('show');
}

function switchModal(type) {
    closeModal(type === 'login' ? 'registerModal' : 'loginModal');
    openModal(type === 'login' ? 'loginModal' : 'registerModal');
}

function scrollToProducts() {
    document.getElementById('products')?.scrollIntoView({ behavior: 'smooth' });
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
    document.getElementById('userMenu')?.classList.add('hidden');
}

function showUserProfile() {
    if (!currentUser) return;
    
    const user = users.find(u => u.id === currentUser.id);
    if (!user) return;
    
    const userTransactions = transactions.filter(t => t.userId === currentUser.id);
    const totalSpent = userTransactions.reduce((sum, t) => sum + (t.total || 0), 0);
    const voucherCount = user.vouchers?.filter(v => !v.used).length || 0;
    
    let message = `👤 PROFIL ANDA:\n\n`;
    message += `Nama: ${user.name}\n`;
    message += `Email: ${user.email}\n`;
    message += `Member sejak: ${new Date(user.createdAt).toLocaleDateString('id-ID')}\n\n`;
    message += `📊 STATISTIK:\n`;
    message += `Transaksi: ${userTransactions.length}\n`;
    message += `Total Belanja: Rp ${formatRupiah(totalSpent)}\n`;
    message += `Voucher Aktif: ${voucherCount}`;
    
    showToast('info', message);
    document.getElementById('userMenu')?.classList.add('hidden');
}

function showOrderHistory() {
    if (!currentUser) return;
    
    const userTransactions = transactions.filter(t => t.userId === currentUser.id);
    
    if (userTransactions.length === 0) {
        showToast('info', 'Belum ada riwayat transaksi');
    } else {
        let message = `📜 RIWAYAT TRANSAKSI (${userTransactions.length}):\n\n`;
        userTransactions.slice(0, 5).forEach((t, i) => {
            const status = t.status === 'pending' ? '⏳' : t.status === 'success' ? '✅' : '❌';
            const date = new Date(t.createdAt).toLocaleDateString('id-ID');
            message += `${i+1}. ${status} ${t.product.name}\n`;
            message += `   Rp ${formatRupiah(t.total)} - ${date}\n`;
            if (t.voucherUsed) message += `   Voucher: ${t.voucherUsed}\n`;
        });
        showToast('info', message);
    }
    document.getElementById('userMenu')?.classList.add('hidden');
}

// ============= ADMIN FUNCTIONS =============
function openAdminDashboard() {
    if (!currentUser || currentUser.role !== 'admin') {
        showToast('error', 'Akses ditolak! Hanya untuk admin.');
        return;
    }
    
    loadAdminData();
    openModal('adminDashboardModal');
    document.getElementById('userMenu')?.classList.add('hidden');
}

function loadAdminData() {
    loadTransactions();
    loadAdminProducts();
    loadUsers();
    loadPayments();
    loadAdminVouchers();
    updateNotificationBadge();
    
    // Update dashboard stats
    const dashboardUsers = document.getElementById('dashboardUsers');
    const dashboardTransactions = document.getElementById('dashboardTransactions');
    const dashboardDiamonds = document.getElementById('dashboardDiamonds');
    const dashboardVouchers = document.getElementById('dashboardVouchers');
    const dashboardRevenue = document.getElementById('dashboardRevenue');
    
    if (dashboardUsers) dashboardUsers.textContent = appStats.totalUsers.toLocaleString();
    if (dashboardTransactions) dashboardTransactions.textContent = appStats.totalTransactions.toLocaleString();
    if (dashboardDiamonds) dashboardDiamonds.textContent = appStats.totalDiamonds.toLocaleString();
    if (dashboardVouchers) dashboardVouchers.textContent = appStats.totalVouchers.toLocaleString();
    if (dashboardRevenue) dashboardRevenue.textContent = `Rp ${formatRupiah(appStats.totalRevenue)}`;
}

function loadTransactions() {
    const list = document.getElementById('transactionsList');
    const recentList = document.getElementById('recentTransactionsList');
    
    if (!list) return;
    
    const sorted = [...transactions].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    
    list.innerHTML = sorted.map(t => `
        <div class="transaction-item">
            <div class="transaction-info">
                <div><strong>${t.userName || 'Unknown'}</strong> - ${t.product?.name || 'Unknown'}</div>
                <div class="transaction-meta">ID: ${t.gameId} | ${new Date(t.createdAt).toLocaleString('id-ID')}</div>
                ${t.voucherUsed ? `<div class="transaction-meta">Voucher: ${t.voucherUsed} (Diskon Rp ${formatRupiah(t.discount || 0)})</div>` : ''}
            </div>
            <div class="transaction-amount">Rp ${formatRupiah(t.total || 0)}</div>
            <div class="transaction-status status-${t.status || 'pending'}">${t.status || 'pending'}</div>
            <div class="transaction-actions">
                <button class="btn-view" onclick="viewTransaction('${t.id}')">Detail</button>
                ${t.paymentProof ? `<button class="btn-view" onclick="viewPaymentProof('${t.id}')">Bukti</button>` : ''}
            </div>
        </div>
    `).join('');
    
    if (recentList) {
        recentList.innerHTML = sorted.slice(0, 5).map(t => `
            <div class="transaction-item">
                <div class="transaction-info">
                    <div><strong>${t.userName || 'Unknown'}</strong> - ${t.product?.name || 'Unknown'}</div>
                    <div class="transaction-meta">${new Date(t.createdAt).toLocaleString('id-ID')}</div>
                </div>
                <div class="transaction-amount">Rp ${formatRupiah(t.total || 0)}</div>
                <div class="transaction-status status-${t.status || 'pending'}">${t.status || 'pending'}</div>
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
            <td><span class="status-${p.status || 'active'}">${p.status || 'active'}</span></td>
            <td>
                <button class="btn-edit" onclick="editProduct(${p.id})">Edit</button>
                <button class="btn-delete" onclick="deleteProduct(${p.id})">Hapus</button>
            </td>
        </tr>
    `).join('');
}

function loadAdminVouchers() {
    const list = document.getElementById('vouchersList');
    if (!list) return;
    
    list.innerHTML = vouchers.map(v => {
        const claimedCount = v.claimedBy?.length || 0;
        const remaining = v.maxClaims - claimedCount;
        const expiryDate = new Date(v.expiresAt);
        const status = expiryDate < new Date() ? 'expired' : (v.active ? 'active' : 'inactive');
        
        return `
            <tr>
                <td><strong>${v.code}</strong></td>
                <td>${v.name}</td>
                <td>${v.discount}%</td>
                <td>Rp ${formatRupiah(v.minPurchase)}</td>
                <td>${v.forGame === 'all' ? 'Semua' : getGameName(v.forGame)}</td>
                <td>${claimedCount}</td>
                <td>${remaining}</td>
                <td><span class="status-${status}">${status}</span></td>
                <td>${expiryDate.toLocaleDateString('id-ID')}</td>
                <td>
                    <button class="btn-edit" onclick="editVoucher('${v.id}')">Edit</button>
                    <button class="btn-delete" onclick="deleteVoucher('${v.id}')">Hapus</button>
                </td>
            </tr>
        `;
    }).join('');
}

function loadUsers() {
    const list = document.getElementById('usersList');
    if (!list) return;
    
    list.innerHTML = users.map(u => {
        const userTransactions = transactions.filter(t => t.userId === u.id);
        const totalSpent = userTransactions.reduce((sum, t) => sum + (t.total || 0), 0);
        const voucherCount = u.vouchers?.length || 0;
        
        return `
            <tr>
                <td>${u.id}</td>
                <td>${u.name}</td>
                <td>${u.email}</td>
                <td>${userTransactions.length}</td>
                <td>Rp ${formatRupiah(totalSpent)}</td>
                <td>${voucherCount}</td>
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

// ============= ADMIN CRUD FUNCTIONS =============
function showAddProductModal() {
    const modalTitle = document.getElementById('productModalTitle');
    const productId = document.getElementById('productId');
    const productGame = document.getElementById('productGame');
    const productName = document.getElementById('productName');
    const productDiamond = document.getElementById('productDiamond');
    const productPrice = document.getElementById('productPrice');
    const productBonus = document.getElementById('productBonus');
    const productStatus = document.getElementById('productStatus');
    
    if (modalTitle) modalTitle.textContent = 'Tambah Produk';
    if (productId) productId.value = '';
    if (productGame) productGame.value = 'ml';
    if (productName) productName.value = '';
    if (productDiamond) productDiamond.value = '';
    if (productPrice) productPrice.value = '';
    if (productBonus) productBonus.value = '';
    if (productStatus) productStatus.value = 'active';
    
    openModal('productModal');
}

function editProduct(id) {
    const product = products.find(p => p.id === id);
    if (!product) return;
    
    const modalTitle = document.getElementById('productModalTitle');
    const productId = document.getElementById('productId');
    const productGame = document.getElementById('productGame');
    const productName = document.getElementById('productName');
    const productDiamond = document.getElementById('productDiamond');
    const productPrice = document.getElementById('productPrice');
    const productBonus = document.getElementById('productBonus');
    const productStatus = document.getElementById('productStatus');
    
    if (modalTitle) modalTitle.textContent = 'Edit Produk';
    if (productId) productId.value = product.id;
    if (productGame) productGame.value = product.game;
    if (productName) productName.value = product.name;
    if (productDiamond) productDiamond.value = product.diamond;
    if (productPrice) productPrice.value = product.price;
    if (productBonus) productBonus.value = product.bonus || '';
    if (productStatus) productStatus.value = product.status;
    
    openModal('productModal');
}

function saveProduct(event) {
    event.preventDefault();
    
    const productId = document.getElementById('productId')?.value;
    const productGame = document.getElementById('productGame')?.value;
    const productName = document.getElementById('productName')?.value;
    const productDiamond = document.getElementById('productDiamond')?.value;
    const productPrice = document.getElementById('productPrice')?.value;
    const productBonus = document.getElementById('productBonus')?.value;
    const productStatus = document.getElementById('productStatus')?.value;
    
    const product = {
        id: productId ? parseInt(productId) : products.length + 1,
        game: productGame,
        name: productName,
        diamond: parseInt(productDiamond),
        price: parseInt(productPrice),
        bonus: productBonus || '',
        status: productStatus
    };
    
    if (productId) {
        const index = products.findIndex(p => p.id === parseInt(productId));
        if (index !== -1) products[index] = product;
    } else {
        products.push(product);
    }
    
    localStorage.setItem('products', JSON.stringify(products));
    
    closeModal('productModal');
    loadAdminProducts();
    loadProducts();
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

function showAddVoucherModal() {
    const modalTitle = document.getElementById('voucherModalTitle');
    const voucherId = document.getElementById('voucherId');
    const voucherCode = document.getElementById('voucherCode');
    const voucherName = document.getElementById('voucherName');
    const voucherDescription = document.getElementById('voucherDescription');
    const voucherDiscount = document.getElementById('voucherDiscount');
    const voucherMinPurchase = document.getElementById('voucherMinPurchase');
    const voucherType = document.getElementById('voucherType');
    const voucherForGame = document.getElementById('voucherForGame');
    const voucherMaxClaims = document.getElementById('voucherMaxClaims');
    const voucherExpiry = document.getElementById('voucherExpiry');
    
    if (modalTitle) modalTitle.textContent = 'Tambah Voucher';
    if (voucherId) voucherId.value = '';
    if (voucherCode) voucherCode.value = '';
    if (voucherName) voucherName.value = '';
    if (voucherDescription) voucherDescription.value = '';
    if (voucherDiscount) voucherDiscount.value = '';
    if (voucherMinPurchase) voucherMinPurchase.value = '20000';
    if (voucherType) voucherType.value = 'discount';
    if (voucherForGame) voucherForGame.value = 'all';
    if (voucherMaxClaims) voucherMaxClaims.value = '100';
    
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 30);
    if (voucherExpiry) voucherExpiry.value = tomorrow.toISOString().split('T')[0];
    
    openModal('voucherModal');
}

function editVoucher(id) {
    const voucher = vouchers.find(v => v.id === id);
    if (!voucher) return;
    
    const modalTitle = document.getElementById('voucherModalTitle');
    const voucherId = document.getElementById('voucherId');
    const voucherCode = document.getElementById('voucherCode');
    const voucherName = document.getElementById('voucherName');
    const voucherDescription = document.getElementById('voucherDescription');
    const voucherDiscount = document.getElementById('voucherDiscount');
    const voucherMinPurchase = document.getElementById('voucherMinPurchase');
    const voucherType = document.getElementById('voucherType');
    const voucherForGame = document.getElementById('voucherForGame');
    const voucherMaxClaims = document.getElementById('voucherMaxClaims');
    const voucherExpiry = document.getElementById('voucherExpiry');
    
    if (modalTitle) modalTitle.textContent = 'Edit Voucher';
    if (voucherId) voucherId.value = voucher.id;
    if (voucherCode) voucherCode.value = voucher.code;
    if (voucherName) voucherName.value = voucher.name;
    if (voucherDescription) voucherDescription.value = voucher.description || '';
    if (voucherDiscount) voucherDiscount.value = voucher.discount;
    if (voucherMinPurchase) voucherMinPurchase.value = voucher.minPurchase;
    if (voucherType) voucherType.value = voucher.type;
    if (voucherForGame) voucherForGame.value = voucher.forGame;
    if (voucherMaxClaims) voucherMaxClaims.value = voucher.maxClaims;
    if (voucherExpiry) voucherExpiry.value = voucher.expiresAt;
    
    openModal('voucherModal');
}

function saveVoucher(event) {
    event.preventDefault();
    
    const voucherId = document.getElementById('voucherId')?.value;
    const voucherCode = document.getElementById('voucherCode')?.value;
    const voucherName = document.getElementById('voucherName')?.value;
    const voucherDescription = document.getElementById('voucherDescription')?.value;
    const voucherDiscount = document.getElementById('voucherDiscount')?.value;
    const voucherMinPurchase = document.getElementById('voucherMinPurchase')?.value;
    const voucherType = document.getElementById('voucherType')?.value;
    const voucherForGame = document.getElementById('voucherForGame')?.value;
    const voucherMaxClaims = document.getElementById('voucherMaxClaims')?.value;
    const voucherExpiry = document.getElementById('voucherExpiry')?.value;
    
    const voucher = {
        id: voucherId || 'VCH' + Date.now(),
        code: voucherCode.toUpperCase(),
        name: voucherName,
        description: voucherDescription || voucherName,
        discount: parseInt(voucherDiscount),
        minPurchase: parseInt(voucherMinPurchase),
        type: voucherType,
        forGame: voucherForGame,
        maxClaims: parseInt(voucherMaxClaims),
        expiresAt: voucherExpiry,
        claimedBy: voucherId ? (vouchers.find(v => v.id === voucherId)?.claimedBy || []) : [],
        active: true,
        createdAt: voucherId ? (vouchers.find(v => v.id === voucherId)?.createdAt || new Date().toISOString()) : new Date().toISOString()
    };
    
    if (voucherId) {
        const index = vouchers.findIndex(v => v.id === voucherId);
        if (index !== -1) vouchers[index] = {...vouchers[index], ...voucher};
    } else {
        vouchers.push(voucher);
    }
    
    localStorage.setItem('vouchers', JSON.stringify(vouchers));
    
    closeModal('voucherModal');
    loadAdminVouchers();
    displayVouchers();
    showToast('success', 'Voucher berhasil disimpan!');
}

function deleteVoucher(id) {
    if (!confirm('Yakin ingin menghapus voucher ini?')) return;
    
    vouchers = vouchers.filter(v => v.id !== id);
    localStorage.setItem('vouchers', JSON.stringify(vouchers));
    
    loadAdminVouchers();
    displayVouchers();
    showToast('success', 'Voucher berhasil dihapus!');
}

function deleteUser(id) {
    if (!confirm('Yakin ingin menghapus user ini?')) return;
    
    users = users.filter(u => u.id !== id);
    localStorage.setItem('users', JSON.stringify(users));
    
    appStats.totalUsers = users.length;
    localStorage.setItem('appStats', JSON.stringify(appStats));
    
    loadUsers();
    showToast('success', 'User berhasil dihapus!');
}

function viewTransaction(id) {
    const transaction = transactions.find(t => t.id === id);
    if (!transaction) return;
    
    const detail = document.getElementById('transactionDetail');
    if (!detail) return;
    
    detail.innerHTML = `
        <div style="padding: 20px;">
            <p><strong>ID Transaksi:</strong> ${transaction.id}</p>
            <p><strong>User:</strong> ${transaction.userName}</p>
            <p><strong>Produk:</strong> ${transaction.product?.name || 'Unknown'}</p>
            <p><strong>Game ID:</strong> ${transaction.gameId}</p>
            <p><strong>Zone ID:</strong> ${transaction.zoneId || '-'}</p>
            <p><strong>Metode:</strong> ${transaction.paymentMethod}</p>
            <p><strong>Subtotal:</strong> Rp ${formatRupiah(transaction.subtotal || transaction.total)}</p>
            ${transaction.discount ? `<p><strong>Diskon:</strong> Rp ${formatRupiah(transaction.discount)}</p>` : ''}
            ${transaction.voucherUsed ? `<p><strong>Voucher:</strong> ${transaction.voucherUsed}</p>` : ''}
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
    
    const proofImage = document.getElementById('proofImage');
    if (proofImage) {
        proofImage.src = transaction.paymentProof;
        proofImage.dataset.id = id;
    }
    
    openModal('paymentProofModal');
}

function updateTransactionStatus(status) {
    const proofImage = document.getElementById('proofImage');
    if (!proofImage) return;
    
    const id = proofImage.dataset.id;
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
    if (game !== 'all') filtered = products.filter(p => p.game === game);
    
    list.innerHTML = filtered.map(p => `
        <tr>
            <td>${p.id}</td>
            <td>${gameNames[p.game]}</td>
            <td>${p.name}</td>
            <td>${p.diamond}</td>
            <td>Rp ${formatRupiah(p.price)}</td>
            <td><span class="status-${p.status || 'active'}">${p.status || 'active'}</span></td>
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
                <div><strong>${t.userName || 'Unknown'}</strong> - ${t.product?.name || 'Unknown'}</div>
                <div class="transaction-meta">ID: ${t.gameId} | ${new Date(t.createdAt).toLocaleString('id-ID')}</div>
            </div>
            <div class="transaction-amount">Rp ${formatRupiah(t.total || 0)}</div>
            <div class="transaction-status status-${t.status || 'pending'}">${t.status || 'pending'}</div>
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
        const voucherCount = u.vouchers?.length || 0;
        
        return `
            <tr>
                <td>${u.id}</td>
                <td>${u.name}</td>
                <td>${u.email}</td>
                <td>${userTransactions.length}</td>
                <td>Rp ${formatRupiah(totalSpent)}</td>
                <td>${voucherCount}</td>
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

function showAdminTab(tab) {
    // Update sidebar
    document.querySelectorAll('.admin-menu a').forEach(a => a.classList.remove('active'));
    if (event && event.target) {
        event.target.closest('a').classList.add('active');
    }
    
    // Show tab
    document.querySelectorAll('.admin-tab').forEach(t => t.classList.remove('active'));
    const selectedTab = document.getElementById(`tab-${tab}`);
    if (selectedTab) selectedTab.classList.add('active');
    
    // Load data if needed
    if (tab === 'transactions') loadTransactions();
    if (tab === 'payments') loadPayments();
    if (tab === 'products') loadAdminProducts();
    if (tab === 'vouchers') loadAdminVouchers();
    if (tab === 'users') loadUsers();
}

function showAddPromoModal() {
    openModal('promoModal');
}

function savePromo(event) {
    event.preventDefault();
    
    const promoCode = document.getElementById('promoCode')?.value;
    const promoDiscount = document.getElementById('promoDiscount')?.value;
    const promoMin = document.getElementById('promoMin')?.value;
    const promoExpiry = document.getElementById('promoExpiry')?.value;
    
    const promo = {
        code: promoCode.toUpperCase(),
        discount: parseInt(promoDiscount),
        minPurchase: parseInt(promoMin),
        expiry: promoExpiry
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
    
    console.log('=== DATA VOUCHER ===');
    console.log('Semua vouchers:', vouchers);
    
    console.log('=== DATA CURRENT USER ===');
    console.log('Current user:', currentUser);
    
    showToast('info', 'Cek console browser (F12) untuk detail');
}

function resetAdminData() {
    if (!confirm('RESET DATA ADMIN? Semua data akan direset!')) return;
    
    localStorage.clear();
    
    users = [
        { 
            id: 1, 
            name: 'Admin Benoy', 
            email: 'admin@benoystore.com', 
            password: 'admin123', 
            role: 'admin',
            vouchers: [],
            createdAt: new Date().toISOString()
        },
        { 
            id: 2, 
            name: 'User Demo', 
            email: 'user@demo.com', 
            password: 'user123', 
            role: 'user',
            vouchers: [],
            createdAt: new Date().toISOString()
        }
    ];
    
    localStorage.setItem('users', JSON.stringify(users));
    
    showToast('success', 'Data telah direset!');
    showToast('info', 'Admin: admin@benoystore.com / admin123');
    
    setTimeout(() => location.reload(), 1000);
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
        const sections = ['home', 'products', 'vouchers', 'how-it-works', 'promo', 'contact'];
        
        let current = '';
        sections.forEach(section => {
            const element = document.getElementById(section);
            if (element) {
                const rect = element.getBoundingClientRect();
                if (rect.top <= 100) current = section;
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
// User functions
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

// Voucher functions
window.showUserVouchers = showUserVouchers;
window.showAvailableVouchers = showAvailableVouchers;
window.claimVoucher = claimVoucher;
window.applyVoucher = applyVoucher;
window.removeVoucher = removeVoucher;

// Admin functions
window.openAdminDashboard = openAdminDashboard;
window.showAdminTab = showAdminTab;
window.showAddProductModal = showAddProductModal;
window.editProduct = editProduct;
window.saveProduct = saveProduct;
window.deleteProduct = deleteProduct;
window.showAddVoucherModal = showAddVoucherModal;
window.editVoucher = editVoucher;
window.saveVoucher = saveVoucher;
window.deleteVoucher = deleteVoucher;
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

// Debug functions
window.checkAdminData = checkAdminData;
window.resetAdminData = resetAdminData;

// Auto refresh
setInterval(updateNotificationBadge, 5000);
setInterval(updateUserVoucherCount, 10000);

console.log('Script loaded successfully with FIXED admin panel!');
