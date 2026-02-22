// Global variables
let currentUser = null;
let selectedProduct = null;
let appliedPromo = null;
let products = [];
let usedPromoCodes = {};
let appStats = {
    totalUsers: 0,
    totalTransactions: 0,
    totalDiamonds: 0,
    totalRevenue: 0,
    recentActivities: [],
    topSpenders: [],
    dailyStats: {
        users: 0,
        transactions: 0,
        diamonds: 0,
        revenue: 0
    }
};

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    loadProducts();
    setupEventListeners();
    checkAuthStatus();
    loadUserData();
    loadUsedPromoCodes();
    loadAppStats();
    updateLiveStats();
    startLiveUpdates();
    loadRecentActivities();
    loadTopSpenders();
    loadTestimonials();
});

// Load app statistics from localStorage
function loadAppStats() {
    const savedStats = localStorage.getItem('appStats');
    if (savedStats) {
        appStats = JSON.parse(savedStats);
    } else {
        // Initialize with sample data
        appStats = {
            totalUsers: 1247,
            totalTransactions: 8923,
            totalDiamonds: 456789,
            totalRevenue: 189750000,
            recentActivities: [],
            topSpenders: [],
            dailyStats: {
                users: 12,
                transactions: 45,
                diamonds: 2500,
                revenue: 5250000
            }
        };
        saveAppStats();
    }
}

// Save app statistics to localStorage
function saveAppStats() {
    localStorage.setItem('appStats', JSON.stringify(appStats));
}

// Update live statistics on page
function updateLiveStats() {
    // Update hero stats
    document.getElementById('totalUsers').textContent = appStats.totalUsers.toLocaleString();
    document.getElementById('totalTransactions').textContent = appStats.totalTransactions.toLocaleString();
    document.getElementById('totalDiamonds').textContent = appStats.totalDiamonds.toLocaleString();
    
    // Update stat cards
    document.getElementById('liveUserCount').textContent = appStats.totalUsers.toLocaleString();
    document.getElementById('liveTransactionCount').textContent = appStats.totalTransactions.toLocaleString();
    document.getElementById('liveDiamondCount').textContent = appStats.totalDiamonds.toLocaleString();
    document.getElementById('liveRevenue').textContent = `Rp ${formatRupiah(appStats.totalRevenue)}`;
    
    // Update trends
    document.getElementById('userTrend').textContent = `+${appStats.dailyStats.users} hari ini`;
    document.getElementById('transactionTrend').textContent = `+${appStats.dailyStats.transactions} hari ini`;
    document.getElementById('diamondTrend').textContent = `+${appStats.dailyStats.diamonds.toLocaleString()} hari ini`;
    document.getElementById('revenueTrend').textContent = `+${formatRupiah(appStats.dailyStats.revenue)} hari ini`;
    
    // Update footer stats
    document.getElementById('footerUserCount').textContent = appStats.totalUsers.toLocaleString();
    document.getElementById('footerTransactionCount').textContent = appStats.totalTransactions.toLocaleString();
    document.getElementById('footerDiamondCount').textContent = appStats.totalDiamonds.toLocaleString();
}

// Start live updates simulation
function startLiveUpdates() {
    setInterval(() => {
        // Simulate random activity
        if (Math.random() > 0.7) {
            simulateNewActivity();
        }
    }, 10000); // Every 10 seconds
}

// Simulate new activity
function simulateNewActivity() {
    const activities = [
        { type: 'register', user: 'User' + Math.floor(Math.random() * 1000), desc: 'Bergabung sebagai member baru' },
        { type: 'topup', user: 'User' + Math.floor(Math.random() * 1000), desc: 'Melakukan top up diamond' },
        { type: 'promo', user: 'User' + Math.floor(Math.random() * 1000), desc: 'Menggunakan kode promo' }
    ];
    
    const activity = activities[Math.floor(Math.random() * activities.length)];
    addActivity(activity.type, activity.user, activity.desc);
}

// Add new activity
function addActivity(type, user, desc) {
    const activity = {
        type: type,
        user: user,
        desc: desc,
        time: new Date().toLocaleTimeString()
    };
    
    appStats.recentActivities.unshift(activity);
    if (appStats.recentActivities.length > 10) {
        appStats.recentActivities.pop();
    }
    
    saveAppStats();
    loadRecentActivities();
}

// Load recent activities
function loadRecentActivities() {
    const activityList = document.getElementById('activityList');
    if (!activityList) return;
    
    activityList.innerHTML = '';
    
    appStats.recentActivities.forEach(activity => {
        const item = document.createElement('div');
        item.className = 'activity-item';
        item.innerHTML = `
            <div class="activity-icon ${activity.type}">
                <i class="fas ${getActivityIcon(activity.type)}"></i>
            </div>
            <div class="activity-details">
                <div class="activity-user">${activity.user}</div>
                <div class="activity-desc">${activity.desc}</div>
                <div class="activity-time">${activity.time}</div>
            </div>
        `;
        activityList.appendChild(item);
    });
}

// Get activity icon
function getActivityIcon(type) {
    const icons = {
        'register': 'fa-user-plus',
        'topup': 'fa-shopping-cart',
        'promo': 'fa-tag'
    };
    return icons[type] || 'fa-bell';
}

// Load top spenders
function loadTopSpenders() {
    const rankingList = document.getElementById('rankingList');
    if (!rankingList) return;
    
    // Sample top spenders
    const topSpenders = [
        { name: 'Andi Pratama', avatar: 'AP', amount: 12500000, transactions: 45 },
        { name: 'Budi Santoso', avatar: 'BS', amount: 9870000, transactions: 38 },
        { name: 'Citra Dewi', avatar: 'CD', amount: 7650000, transactions: 29 },
        { name: 'Dian Permata', avatar: 'DP', amount: 6540000, transactions: 24 },
        { name: 'Eko Saputra', avatar: 'ES', amount: 5430000, transactions: 21 }
    ];
    
    rankingList.innerHTML = '';
    
    topSpenders.forEach((spender, index) => {
        const rank = index + 1;
        const item = document.createElement('div');
        item.className = 'ranking-item';
        item.innerHTML = `
            <div class="ranking-position ${rank <= 3 ? 'top' + rank : ''}">${rank}</div>
            <img src="https://ui-avatars.com/api/?name=${spender.avatar}&background=6366f1&color=fff" alt="${spender.name}" class="ranking-avatar">
            <div class="ranking-info">
                <div class="ranking-name">${spender.name}</div>
                <div class="ranking-stats">${spender.transactions} transaksi</div>
            </div>
            <div class="ranking-amount">Rp ${formatRupiah(spender.amount)}</div>
        `;
        rankingList.appendChild(item);
    });
}

// Load testimonials
function loadTestimonials() {
    const testimonialList = document.getElementById('testimonialList');
    if (!testimonialList) return;
    
    const testimonials = [
        {
            name: 'Andi Pratama',
            avatar: 'AP',
            rating: 5,
            text: 'Prosesnya cepat banget! Baru 5 menit diamond langsung masuk. Recommended banget!',
            game: 'Mobile Legends Player'
        },
        {
            name: 'Siti Nurhaliza',
            avatar: 'SN',
            rating: 5,
            text: 'Harga termurah dibanding toko lain. Pelayanan ramah, admin fast respon!',
            game: 'Free Fire Player'
        },
        {
            name: 'Budi Santoso',
            avatar: 'BS',
            rating: 5,
            text: 'Sudah langganan 1 tahun, selalu puas. Proses cepat dan aman, recommended!',
            game: 'PUBG Player'
        }
    ];
    
    testimonialList.innerHTML = '';
    
    testimonials.forEach(testimonial => {
        const card = document.createElement('div');
        card.className = 'testimonial-card';
        
        let stars = '';
        for (let i = 0; i < testimonial.rating; i++) {
            stars += '<i class="fas fa-star"></i>';
        }
        
        card.innerHTML = `
            <div class="testimonial-rating">${stars}</div>
            <p>"${testimonial.text}"</p>
            <div class="testimonial-user">
                <img src="https://ui-avatars.com/api/?name=${testimonial.avatar}&background=6366f1&color=fff" alt="${testimonial.name}">
                <div>
                    <h4>${testimonial.name}</h4>
                    <span>${testimonial.game}</span>
                </div>
            </div>
        `;
        testimonialList.appendChild(card);
    });
}

// Product data
function loadProducts() {
    products = [
        // Mobile Legends
        { id: 1, game: 'ml', name: '86 Diamonds', price: 17000, diamond: 86, features: ['86 Diamonds', 'Bonus 0-5 Diamonds'] },
        { id: 2, game: 'ml', name: '172 Diamonds', price: 33000, diamond: 172, features: ['172 Diamonds', 'Bonus 0-10 Diamonds'] },
        { id: 3, game: 'ml', name: '257 Diamonds', price: 48000, diamond: 257, features: ['257 Diamonds', 'Bonus 0-15 Diamonds'] },
        { id: 4, game: 'ml', name: '344 Diamonds', price: 64000, diamond: 344, features: ['344 Diamonds', 'Bonus 0-20 Diamonds'] },
        { id: 5, game: 'ml', name: '429 Diamonds', price: 79000, diamond: 429, features: ['429 Diamonds', 'Bonus 0-25 Diamonds'] },
        { id: 6, game: 'ml', name: '514 Diamonds', price: 95000, diamond: 514, features: ['514 Diamonds', 'Bonus 0-30 Diamonds'] },
        
        // Free Fire
        { id: 7, game: 'ff', name: '70 Diamonds', price: 12000, diamond: 70, features: ['70 Diamonds', 'No Bonus'] },
        { id: 8, game: 'ff', name: '140 Diamonds', price: 23000, diamond: 140, features: ['140 Diamonds', 'No Bonus'] },
        { id: 9, game: 'ff', name: '355 Diamonds', price: 57000, diamond: 355, features: ['355 Diamonds', 'No Bonus'] },
        { id: 10, game: 'ff', name: '720 Diamonds', price: 114000, diamond: 720, features: ['720 Diamonds', 'No Bonus'] },
        
        // PUBG Mobile
        { id: 11, game: 'pubg', name: '60 UC', price: 17000, diamond: 60, features: ['60 UC', 'No Bonus'] },
        { id: 12, game: 'pubg', name: '180 UC', price: 48000, diamond: 180, features: ['180 UC + 25 Bonus'] },
        { id: 13, game: 'pubg', name: '325 UC', price: 85000, diamond: 325, features: ['325 UC + 60 Bonus'] },
        { id: 14, game: 'pubg', name: '660 UC', price: 170000, diamond: 660, features: ['660 UC + 150 Bonus'] },
        
        // COD Mobile
        { id: 15, game: 'cod', name: '80 CP', price: 19000, diamond: 80, features: ['80 CP', 'No Bonus'] },
        { id: 16, game: 'cod', name: '220 CP', price: 50000, diamond: 220, features: ['220 CP + 25 Bonus'] },
        { id: 17, game: 'cod', name: '440 CP', price: 99000, diamond: 440, features: ['440 CP + 50 Bonus'] },
        { id: 18, game: 'cod', name: '880 CP', price: 195000, diamond: 880, features: ['880 CP + 100 Bonus'] }
    ];
    
    displayProducts(products);
}

// Display products in grid
function displayProducts(productsToShow) {
    const productGrid = document.getElementById('productGrid');
    if (!productGrid) return;
    
    productGrid.innerHTML = '';
    
    productsToShow.forEach(product => {
        const gameNames = {
            'ml': 'Mobile Legends',
            'ff': 'Free Fire',
            'pubg': 'PUBG Mobile',
            'cod': 'COD Mobile'
        };
        
        const isBelowMinPrice = product.price < 20000;
        
        const card = document.createElement('div');
        card.className = 'product-card';
        if (isBelowMinPrice) {
            card.classList.add('min-price-warning');
        }
        
        card.innerHTML = `
            <div class="product-badge">${gameNames[product.game]}</div>
            ${isBelowMinPrice ? '<div class="product-warning"><i class="fas fa-info-circle"></i> Min. Pembelian Rp 20rb untuk promo</div>' : ''}
            <div class="product-name">${product.name}</div>
            <div class="product-price">Rp ${formatRupiah(product.price)}</div>
            <ul class="product-features">
                ${product.features.map(f => `<li><i class="fas fa-check-circle"></i>${f}</li>`).join('')}
            </ul>
            <button class="btn-buy" onclick="openOrderModal(${product.id})" ${!currentUser ? 'disabled' : ''}>
                ${currentUser ? 'Beli Sekarang' : 'Login untuk Membeli'}
            </button>
        `;
        productGrid.appendChild(card);
    });
}

// Format Rupiah
function formatRupiah(amount) {
    return amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}

// Setup event listeners
function setupEventListeners() {
    // Mobile menu toggle
    document.getElementById('menuToggle').addEventListener('click', function() {
        document.getElementById('navMenu').classList.toggle('show');
    });
    
    // Filter buttons
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            
            const game = this.dataset.game;
            if (game === 'all') {
                displayProducts(products);
            } else {
                const filtered = products.filter(p => p.game === game);
                displayProducts(filtered);
            }
        });
    });
    
    // Login button
    document.getElementById('loginBtn').addEventListener('click', function() {
        openModal('loginModal');
    });
    
    // Register button
    document.getElementById('registerBtn').addEventListener('click', function() {
        openModal('registerModal');
    });
    
    // Apply promo button
    document.getElementById('applyPromoBtn').addEventListener('click', applyPromo);
    
    // Close modals when clicking outside
    window.addEventListener('click', function(e) {
        if (e.target.classList.contains('modal')) {
            closeAllModals();
        }
    });
    
    // Scroll spy
    window.addEventListener('scroll', function() {
        const navLinks = document.querySelectorAll('.nav-link');
        const sections = ['home', 'products', 'how-it-works', 'promo', 'stats', 'contact'];
        
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

// Check authentication status
function checkAuthStatus() {
    const user = localStorage.getItem('currentUser');
    if (user) {
        currentUser = JSON.parse(user);
        updateUIForLoggedInUser();
    }
}

// Update UI for logged in user
function updateUIForLoggedInUser() {
    document.getElementById('loginBtn').classList.add('hidden');
    document.getElementById('registerBtn').classList.add('hidden');
    const userProfile = document.getElementById('userProfile');
    userProfile.classList.remove('hidden');
    document.getElementById('usernameDisplay').textContent = currentUser.name.split(' ')[0];
    
    // Update profile avatar
    const avatar = document.querySelector('#userProfile img');
    avatar.src = `https://ui-avatars.com/api/?name=${currentUser.name.replace(' ', '+')}&background=6366f1&color=fff`;
    
    // Enable buy buttons
    document.querySelectorAll('.btn-buy').forEach(btn => {
        btn.disabled = false;
        btn.textContent = 'Beli Sekarang';
    });
}

// Toggle user menu
function toggleUserMenu() {
    const menu = document.getElementById('userMenu');
    menu.classList.toggle('hidden');
}

// Show user profile
function showUserProfile() {
    closeAllModals();
    const profileContent = document.getElementById('profileContent');
    
    // Get user transactions
    const orders = JSON.parse(localStorage.getItem('orders')) || [];
    const userOrders = orders.filter(o => o.userId === currentUser.id);
    const totalSpent = userOrders.reduce((sum, order) => sum + order.total, 0);
    const totalDiamonds = userOrders.reduce((sum, order) => sum + (order.product.diamond || 0), 0);
    
    profileContent.innerHTML = `
        <div class="profile-header">
            <img src="https://ui-avatars.com/api/?name=${currentUser.name.replace(' ', '+')}&background=6366f1&color=fff&size=128" alt="${currentUser.name}" class="profile-avatar">
            <div class="profile-name">${currentUser.name}</div>
            <div class="profile-email">${currentUser.email}</div>
            <div class="profile-member">Member sejak ${new Date(currentUser.createdAt || Date.now()).toLocaleDateString('id-ID')}</div>
        </div>
        <div class="profile-stats">
            <div>
                <div class="profile-stat-value">${userOrders.length}</div>
                <div class="profile-stat-label">Transaksi</div>
            </div>
            <div>
                <div class="profile-stat-value">${totalDiamonds}</div>
                <div class="profile-stat-label">Diamond</div>
            </div>
            <div>
                <div class="profile-stat-value">Rp ${formatRupiah(totalSpent)}</div>
                <div class="profile-stat-label">Total Belanja</div>
            </div>
        </div>
        <div class="profile-info">
            <div class="info-row">
                <span class="info-label">User ID</span>
                <span class="info-value">#${currentUser.id}</span>
            </div>
            <div class="info-row">
                <span class="info-label">Email</span>
                <span class="info-value">${currentUser.email}</span>
            </div>
            <div class="info-row">
                <span class="info-label">Terdaftar</span>
                <span class="info-value">${new Date(currentUser.createdAt || Date.now()).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
            </div>
        </div>
    `;
    
    openModal('profileModal');
    document.getElementById('userMenu').classList.add('hidden');
}

// Show order history
function showOrderHistory() {
    closeAllModals();
    const historyContent = document.getElementById('historyContent');
    
    const orders = JSON.parse(localStorage.getItem('orders')) || [];
    const userOrders = orders.filter(o => o.userId === currentUser.id).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    
    if (userOrders.length === 0) {
        historyContent.innerHTML = '<p class="no-history">Belum ada riwayat top up</p>';
    } else {
        historyContent.innerHTML = userOrders.map(order => {
            const gameNames = {
                'ml': 'Mobile Legends',
                'ff': 'Free Fire',
                'pubg': 'PUBG Mobile',
                'cod': 'COD Mobile'
            };
            
            return `
                <div class="history-item">
                    <div class="history-icon ${order.status}">
                        <i class="fas ${order.status === 'success' ? 'fa-check-circle' : 'fa-clock'}"></i>
                    </div>
                    <div class="history-details">
                        <div class="history-title">${gameNames[order.product.game]} - ${order.product.name}</div>
                        <div class="history-meta">ID: ${order.gameId} | ${new Date(order.createdAt).toLocaleDateString('id-ID')}</div>
                    </div>
                    <div class="history-amount">Rp ${formatRupiah(order.total)}</div>
                    <div class="history-status ${order.status}">${order.status === 'success' ? 'Berhasil' : 'Proses'}</div>
                </div>
            `;
        }).join('');
    }
    
    openModal('historyModal');
    document.getElementById('userMenu').classList.add('hidden');
}

// Show voucher
function showVoucher() {
    showToast('info', 'Fitur voucher akan segera hadir!');
    document.getElementById('userMenu').classList.add('hidden');
}

// Load user data
function loadUserData() {
    if (!localStorage.getItem('users')) {
        const defaultUsers = [
            {
                id: 1,
                name: 'Admin',
                email: 'admin@diamondstore.com',
                password: 'admin123',
                isAdmin: true,
                createdAt: new Date().toISOString()
            },
            {
                id: 2,
                name: 'Andi Pratama',
                email: 'andi@example.com',
                password: 'password123',
                isAdmin: false,
                createdAt: new Date().toISOString()
            }
        ];
        localStorage.setItem('users', JSON.stringify(defaultUsers));
        
        // Update stats
        appStats.totalUsers = defaultUsers.length;
        appStats.dailyStats.users += defaultUsers.length;
        saveAppStats();
    }
}

// Handle login
function handleLogin(event) {
    event.preventDefault();
    
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    
    const users = JSON.parse(localStorage.getItem('users')) || [];
    const user = users.find(u => u.email === email && u.password === password);
    
    if (user) {
        currentUser = {
            id: user.id,
            name: user.name,
            email: user.email,
            isAdmin: user.isAdmin || false,
            createdAt: user.createdAt
        };
        
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
        
        showToast('success', 'Login berhasil! Selamat datang kembali.');
        closeModal('loginModal');
        updateUIForLoggedInUser();
        
        // Add activity
        addActivity('login', currentUser.name, 'Login ke akun');
        
        // Reset form
        document.getElementById('loginForm').reset();
    } else {
        showToast('error', 'Email atau password salah!');
    }
}

// Handle register
function handleRegister(event) {
    event.preventDefault();
    
    const name = document.getElementById('registerName').value;
    const email = document.getElementById('registerEmail').value;
    const password = document.getElementById('registerPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    const referralCode = document.getElementById('referralCode').value;
    
    if (password !== confirmPassword) {
        showToast('error', 'Password tidak cocok!');
        return;
    }
    
    if (password.length < 6) {
        showToast('error', 'Password minimal 6 karakter!');
        return;
    }
    
    const users = JSON.parse(localStorage.getItem('users')) || [];
    
    if (users.some(u => u.email === email)) {
        showToast('error', 'Email sudah terdaftar!');
        return;
    }
    
    const newUser = {
        id: users.length + 1,
        name: name,
        email: email,
        password: password,
        isAdmin: false,
        createdAt: new Date().toISOString(),
        referralUsed: referralCode || null
    };
    
    users.push(newUser);
    localStorage.setItem('users', JSON.stringify(users));
    
    currentUser = {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        isAdmin: false,
        createdAt: newUser.createdAt
    };
    
    localStorage.setItem('currentUser', JSON.stringify(currentUser));
    
    // Update stats
    appStats.totalUsers++;
    appStats.dailyStats.users++;
    saveAppStats();
    updateLiveStats();
    
    // Add activity
    addActivity('register', currentUser.name, 'Bergabung sebagai member baru');
    
    showToast('success', 'Registrasi berhasil! Selamat datang.');
    closeModal('registerModal');
    updateUIForLoggedInUser();
    
    // Reset form
    document.getElementById('registerForm').reset();
}

// Open order modal
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
    
    const orderDetail = document.getElementById('orderProductDetail');
    orderDetail.innerHTML = `
        <h4>${gameNames[selectedProduct.game]}</h4>
        <p>${selectedProduct.name}</p>
        <p class="product-price">Rp ${formatRupiah(selectedProduct.price)}</p>
        ${selectedProduct.price < 20000 ? '<p class="warning-text"><i class="fas fa-exclamation-triangle"></i> Minimal pembelian Rp 20.000 untuk menggunakan promo</p>' : ''}
    `;
    
    document.getElementById('productPrice').textContent = `Rp ${formatRupiah(selectedProduct.price)}`;
    document.getElementById('gameName').textContent = gameNames[selectedProduct.game];
    updateTotalPayment();
    
    // Reset payment steps
    resetPaymentSteps();
    
    openModal('orderModal');
}

// Reset payment steps
function resetPaymentSteps() {
    document.getElementById('step1').classList.add('active');
    document.getElementById('step2').classList.remove('active');
    document.getElementById('step3').classList.remove('active');
    document.getElementById('step4').classList.remove('active');
    document.getElementById('ewalletPaymentContainer').classList.add('hidden');
    document.getElementById('verificationStatus').innerHTML = '<i class="fas fa-spinner fa-spin"></i> <span>Menunggu verifikasi</span>';
    document.getElementById('verifyBtn').disabled = false;
}

// Handle e-wallet selection
function handleEwalletSelection() {
    const method = document.getElementById('paymentMethod').value;
    const container = document.getElementById('ewalletPaymentContainer');
    const ewalletName = document.getElementById('selectedEwalletName');
    const paymentEwallet = document.getElementById('paymentEwalletName');
    const payEwallet = document.getElementById('payEwalletName');
    const redirectEwallet = document.getElementById('redirectEwalletName');
    const ewalletHeader = document.getElementById('ewalletHeader');
    
    const walletNames = {
        'dana': 'DANA',
        'gopay': 'GoPay',
        'ovo': 'OVO'
    };
    
    const walletColors = {
        'dana': '#0088cc',
        'gopay': '#00a63f',
        'ovo': '#8a2be2'
    };
    
    if (method && walletNames[method]) {
        container.classList.remove('hidden');
        ewalletName.textContent = walletNames[method];
        paymentEwallet.textContent = walletNames[method];
        payEwallet.textContent = walletNames[method];
        redirectEwallet.textContent = walletNames[method];
        ewalletHeader.style.borderBottomColor = walletColors[method];
        
        // Update total payment
        document.getElementById('paymentTotal').textContent = document.getElementById('totalPayment').textContent;
    } else {
        container.classList.add('hidden');
    }
}

// Verify game account
function verifyGameAccount() {
    const gameId = document.getElementById('gameId').value;
    const zoneId = document.getElementById('zoneId').value;
    const verifyBtn = document.getElementById('verifyBtn');
    const verificationStatus = document.getElementById('verificationStatus');
    
    if (!gameId) {
        showToast('error', 'Masukkan User ID game terlebih dahulu!');
        return;
    }
    
    // Simulate verification
    verificationStatus.innerHTML = '<i class="fas fa-spinner fa-spin"></i> <span>Memverifikasi akun...</span>';
    verifyBtn.disabled = true;
    
    setTimeout(() => {
        // Random success/fail for demo
        const success = Math.random() > 0.2;
        
        if (success) {
            verificationStatus.innerHTML = '<i class="fas fa-check-circle" style="color: #4caf50;"></i> <span>Akun ditemukan!</span>';
            showToast('success', 'Akun game berhasil diverifikasi');
            
            // Move to step 2
            document.getElementById('step1').classList.remove('active');
            document.getElementById('step2').classList.add('active');
        } else {
            verificationStatus.innerHTML = '<i class="fas fa-times-circle" style="color: #dc3545;"></i> <span>Akun tidak ditemukan. Periksa kembali ID Anda.</span>';
            verifyBtn.disabled = false;
            showToast('error', 'Verifikasi gagal. Pastikan ID game benar.');
        }
    }, 2000);
}

// Process e-wallet payment
function processEwalletPayment() {
    const method = document.getElementById('paymentMethod').value;
    const total = calculateTotal();
    
    const walletDeepLinks = {
        'dana': {
            android: 'intent://danain/id/#Intent;package=id.dana;end',
            ios: 'dana://',
            web: 'https://dana.id'
        },
        'gopay': {
            android: 'gopay://',
            ios: 'gopay://',
            web: 'https://gopay.co.id'
        },
        'ovo': {
            android: 'ovo://',
            ios: 'ovo://',
            web: 'https://ovo.id'
        }
    };
    
    const walletNames = {
        'dana': 'DANA',
        'gopay': 'GoPay',
        'ovo': 'OVO'
    };
    
    // Show processing
    document.getElementById('step2').classList.remove('active');
    document.getElementById('step3').classList.add('active');
    
    // Try to open e-wallet app
    const deepLink = walletDeepLinks[method];
    const isAndroid = /Android/i.test(navigator.userAgent);
    const isIOS = /iPhone|iPad|iPod/i.test(navigator.userAgent);
    
    let link = '';
    if (isAndroid) {
        link = deepLink.android;
    } else if (isIOS) {
        link = deepLink.ios;
    } else {
        link = deepLink.web;
    }
    
    // Open app or fallback to web
    window.location.href = link;
    
    // Simulate payment process
    setTimeout(() => {
        // Random success/fail for demo
        const success = Math.random() > 0.1;
        
        if (success) {
            // Payment successful
            document.getElementById('processingDetail').classList.remove('hidden');
            document.getElementById('processingGameId').textContent = document.getElementById('gameId').value;
            document.getElementById('processingProduct').textContent = selectedProduct.name;
            
            setTimeout(() => {
                // Move to success step
                document.getElementById('step3').classList.remove('active');
                document.getElementById('step4').classList.add('active');
                
                // Update success details
                document.getElementById('successGameId').textContent = document.getElementById('gameId').value;
                document.getElementById('successProduct').textContent = selectedProduct.name;
                document.getElementById('successDiamond').textContent = selectedProduct.diamond;
                document.getElementById('successTime').textContent = new Date().toLocaleTimeString('id-ID');
                
                // Record transaction
                recordTransaction();
                
                showToast('success', `Pembayaran via ${walletNames[method]} berhasil! Diamond sedang dikirim.`);
            }, 2000);
        } else {
            // Payment failed
            showToast('error', 'Pembayaran gagal. Silakan coba lagi.');
            document.getElementById('step3').classList.remove('active');
            document.getElementById('step2').classList.add('active');
            document.getElementById('processingDetail').classList.add('hidden');
        }
    }, 3000);
}

// Record transaction
function recordTransaction() {
    // Create order record
    const orderData = {
        id: Date.now(),
        userId: currentUser.id,
        userName: currentUser.name,
        userEmail: currentUser.email,
        product: selectedProduct,
        gameId: document.getElementById('gameId').value,
        zoneId: document.getElementById('zoneId').value,
        paymentMethod: document.getElementById('paymentMethod').value,
        total: calculateTotal(),
        promoCode: appliedPromo ? appliedPromo.code : null,
        discount: appliedPromo ? appliedPromo.discount : 0,
        status: 'success',
        diamondAmount: selectedProduct.diamond,
        createdAt: new Date().toISOString()
    };
    
    // Save to localStorage
    const orders = JSON.parse(localStorage.getItem('orders')) || [];
    orders.push(orderData);
    localStorage.setItem('orders', JSON.stringify(orders));
    
    // Mark promo code as used if applied
    if (appliedPromo) {
        markPromoAsUsed(appliedPromo.code);
    }
    
    // Update stats
    appStats.totalTransactions++;
    appStats.totalDiamonds += selectedProduct.diamond || 0;
    appStats.totalRevenue += orderData.total;
    appStats.dailyStats.transactions++;
    appStats.dailyStats.diamonds += selectedProduct.diamond || 0;
    appStats.dailyStats.revenue += orderData.total;
    saveAppStats();
    updateLiveStats();
    
    // Add activity
    addActivity('topup', currentUser.name, `Top up ${selectedProduct.name} untuk ${selectedProduct.game}`);
    
    // Update notification badge
    updateNotificationBadge();
}

// Update stats after transaction
function updateStatsAfterTransaction() {
    updateLiveStats();
}

// Handle order (fallback for manual orders)
function handleOrder(event) {
    event.preventDefault();
    // This is for manual orders, but we're using auto top up
    showToast('info', 'Gunakan fitur Auto Top Up dengan memilih e-wallet di atas');
}

// Select wallet from homepage
function selectWallet(wallet) {
    if (!currentUser) {
        showToast('warning', 'Silakan login terlebih dahulu!');
        openModal('loginModal');
        return;
    }
    
    // Scroll to products
    scrollToProducts();
    
    // Show toast
    const walletNames = {
        'dana': 'DANA',
        'gopay': 'GoPay',
        'ovo': 'OVO'
    };
    
    showToast('success', `Pilih paket diamond untuk top up via ${walletNames[wallet]}`);
}

// Calculate total payment
function calculateTotal() {
    let total = selectedProduct ? selectedProduct.price : 0;
    total += 1000; // Service fee
    
    if (appliedPromo && selectedProduct && selectedProduct.price >= 20000) {
        total = total - (total * appliedPromo.discount / 100);
    }
    
    return Math.round(total);
}

// Update total payment display
function updateTotalPayment() {
    const total = calculateTotal();
    document.getElementById('totalPayment').textContent = `Rp ${formatRupiah(total)}`;
    document.getElementById('paymentTotal').textContent = `Rp ${formatRupiah(total)}`;
    
    // Update discount row
    if (appliedPromo) {
        const discountAmount = selectedProduct ? (selectedProduct.price + 1000) * (appliedPromo.discount / 100) : 0;
        document.getElementById('discountAmount').textContent = `-Rp ${formatRupiah(Math.round(discountAmount))}`;
        document.getElementById('discountRow').classList.remove('hidden');
    } else {
        document.getElementById('discountRow').classList.add('hidden');
    }
}

// Apply promo code
function applyPromo() {
    const promoCode = document.getElementById('promoCode').value.toUpperCase();
    const promoMessage = document.getElementById('promoMessage');
    
    // Validasi user harus login
    if (!currentUser) {
        promoMessage.className = 'promo-message error';
        promoMessage.innerHTML = '<i class="fas fa-exclamation-circle"></i> Silakan login terlebih dahulu untuk menggunakan promo!';
        return;
    }
    
    // Cek apakah produk sudah dipilih
    if (!selectedProduct) {
        promoMessage.className = 'promo-message error';
        promoMessage.innerHTML = '<i class="fas fa-exclamation-circle"></i> Pilih produk terlebih dahulu!';
        return;
    }
    
    // Validasi minimal pembelian Rp 20.000
    if (selectedProduct.price < 20000) {
        promoMessage.className = 'promo-message error';
        promoMessage.innerHTML = '<i class="fas fa-exclamation-circle"></i> Minimal pembelian Rp 20.000 untuk menggunakan promo!';
        return;
    }
    
    // Promo codes
    const validPromos = [
        { code: 'WELCOME10', discount: 10, description: 'Diskon 10% untuk member baru' },
        { code: 'DIAMOND20', discount: 20, description: 'Diskon 20% spesial diamond' },
        { code: 'NEWUSER30', discount: 30, description: 'Diskon 30% untuk pengguna baru' },
        { code: 'FLASHSALE25', discount: 25, description: 'Flash sale 25% terbatas' }
    ];
    
    const promo = validPromos.find(p => p.code === promoCode);
    
    if (promo) {
        // Cek apakah kode promo sudah pernah dipakai
        if (isPromoUsed(promoCode)) {
            promoMessage.className = 'promo-message error';
            promoMessage.innerHTML = '<i class="fas fa-times-circle"></i> Kode promo sudah pernah digunakan!';
            return;
        }
        
        appliedPromo = promo;
        promoMessage.className = 'promo-message success';
        promoMessage.innerHTML = `
            <i class="fas fa-check-circle"></i>
            <strong>Promo berhasil!</strong><br>
            ${promo.description}<br>
            Diskon ${promo.discount}% (Sekali Pakai)
        `;
        
        // Update total
        updateTotalPayment();
        
        showToast('success', `Promo ${promo.code} berhasil diaplikasikan!`);
        
        // Disable promo input
        document.getElementById('promoCode').disabled = true;
        document.getElementById('applyPromoBtn').disabled = true;
        document.getElementById('applyPromoBtn').textContent = 'Promo Applied';
        
        // Add activity
        addActivity('promo', currentUser.name, `Menggunakan promo ${promo.code}`);
    } else {
        promoMessage.className = 'promo-message error';
        promoMessage.innerHTML = '<i class="fas fa-times-circle"></i> Kode promo tidak valid!';
    }
}

// Load used promo codes
function loadUsedPromoCodes() {
    const used = localStorage.getItem('usedPromoCodes');
    if (used) {
        usedPromoCodes = JSON.parse(used);
    } else {
        usedPromoCodes = {};
        localStorage.setItem('usedPromoCodes', JSON.stringify(usedPromoCodes));
    }
}

// Save used promo codes
function saveUsedPromoCodes() {
    localStorage.setItem('usedPromoCodes', JSON.stringify(usedPromoCodes));
}

// Mark promo as used
function markPromoAsUsed(promoCode) {
    if (!currentUser) return;
    
    if (!usedPromoCodes[currentUser.id]) {
        usedPromoCodes[currentUser.id] = [];
    }
    
    if (!usedPromoCodes[currentUser.id].includes(promoCode)) {
        usedPromoCodes[currentUser.id].push(promoCode);
        saveUsedPromoCodes();
    }
}

// Check if promo is used
function isPromoUsed(promoCode) {
    if (!currentUser) return false;
    return usedPromoCodes[currentUser.id] && usedPromoCodes[currentUser.id].includes(promoCode);
}

// Open modal
function openModal(modalId) {
    closeAllModals();
    document.getElementById(modalId).classList.add('show');
    document.body.style.overflow = 'hidden';
}

// Close modal
function closeModal(modalId) {
    document.getElementById(modalId).classList.remove('show');
    document.body.style.overflow = 'auto';
}

// Close all modals
function closeAllModals() {
    document.querySelectorAll('.modal').forEach(modal => {
        modal.classList.remove('show');
    });
    document.body.style.overflow = 'auto';
}

// Switch between login and register
function switchModal(type) {
    closeAllModals();
    if (type === 'login') {
        openModal('loginModal');
    } else {
        openModal('registerModal');
    }
}

// Scroll to products
function scrollToProducts() {
    document.getElementById('products').scrollIntoView({ behavior: 'smooth' });
}

// Show toast notification
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
        <span class="toast-message">${message}</span>
        <button class="toast-close" onclick="this.parentElement.remove()">&times;</button>
    `;
    
    container.appendChild(toast);
    
    setTimeout(() => {
        if (toast.parentElement) {
            toast.remove();
        }
    }, 3000);
}

// Logout
function logout() {
    localStorage.removeItem('currentUser');
    currentUser = null;
    appliedPromo = null;
    
    // Reset UI
    document.getElementById('loginBtn').classList.remove('hidden');
    document.getElementById('registerBtn').classList.remove('hidden');
    document.getElementById('userProfile').classList.add('hidden');
    document.getElementById('userMenu').classList.add('hidden');
    
    // Disable buy buttons
    document.querySelectorAll('.btn-buy').forEach(btn => {
        btn.disabled = true;
        btn.textContent = 'Login untuk Membeli';
    });
    
    // Reset promo input
    document.getElementById('promoCode').disabled = false;
    document.getElementById('applyPromoBtn').disabled = false;
    document.getElementById('applyPromoBtn').textContent = 'Apply';
    document.getElementById('promoMessage').innerHTML = '';
    
    showToast('success', 'Berhasil logout!');
}

// Update notification badge
function updateNotificationBadge() {
    const orders = JSON.parse(localStorage.getItem('orders')) || [];
    const pendingOrders = orders.filter(o => o.status === 'pending').length;
    
    const badge = document.querySelector('.notification-badge');
    if (badge) {
        if (pendingOrders > 0) {
            badge.textContent = pendingOrders;
            badge.style.display = 'block';
        } else {
            badge.style.display = 'none';
        }
    }
}

// View all activities
function viewAllActivities() {
    showToast('info', 'Fitur lihat semua aktivitas akan segera hadir!');
}

// Initialize notification badge
updateNotificationBadge();

// Auto-refresh notification badge
setInterval(updateNotificationBadge, 30000);

// Export functions
window.openOrderModal = openOrderModal;
window.handleLogin = handleLogin;
window.handleRegister = handleRegister;
window.handleOrder = handleOrder;
window.openModal = openModal;
window.closeModal = closeModal;
window.switchModal = switchModal;
window.scrollToProducts = scrollToProducts;
window.logout = logout;
window.toggleUserMenu = toggleUserMenu;
window.showUserProfile = showUserProfile;
window.showOrderHistory = showOrderHistory;
window.showVoucher = showVoucher;
window.handleEwalletSelection = handleEwalletSelection;
window.verifyGameAccount = verifyGameAccount;
window.processEwalletPayment = processEwalletPayment;
window.selectWallet = selectWallet;
window.updateStatsAfterTransaction = updateStatsAfterTransaction;
window.viewAllActivities = viewAllActivities;
