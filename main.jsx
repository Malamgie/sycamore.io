import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  Wallet, 
  ArrowRightLeft, 
  Package, 
  Bitcoin, 
  LogOut, 
  Plus, 
  CheckCircle2, 
  Clock, 
  AlertTriangle,
  LayoutDashboard,
  Users,
  Search,
  Lock,
  Leaf
} from 'lucide-react';

// --- SYCAMORE LOGO COMPONENT ---
const SycamoreLogo = ({ className = "w-10 h-10" }) => (
  <div className={`relative flex items-center justify-center ${className}`}>
    <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-lg">
      <defs>
        <linearGradient id="shieldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#22c55e" /> {/* Green-500 */}
          <stop offset="100%" stopColor="#3b82f6" /> {/* Blue-500 */}
        </linearGradient>
      </defs>
      {/* Shield Background */}
      <path d="M50 5 L90 20 L90 50 C90 75 50 95 50 95 C50 95 10 75 10 50 L10 20 Z" fill="url(#shieldGrad)" />
      {/* Abstract Leaf Pattern */}
      <path d="M50 20 L65 45 L80 40 L60 65 L50 85 L40 65 L20 40 L35 45 Z" fill="#000000" opacity="0.8" />
      {/* Lock Icon */}
      <rect x="40" y="65" width="20" height="15" rx="3" fill="#0f172a" />
      <path d="M45 65 V58 C45 54 55 54 55 58 V65" fill="none" stroke="#0f172a" strokeWidth="4" />
      <circle cx="50" cy="72" r="2" fill="#3b82f6" />
    </svg>
  </div>
);

// --- INITIAL MOCK DATA ---
const INITIAL_ADMIN = {
  id: 'admin-1',
  username: 'MetaGie',
  password: 'Aliyoux@1',
  role: 'ADMIN',
  balance: 0
};

export default function App() {
  // --- STATE MANAGEMENT ---
  const [isLoaded, setIsLoaded] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [users, setUsers] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [activeTab, setActiveTab] = useState('dashboard');
  
  // Modals
  const [showNewEscrow, setShowNewEscrow] = useState(false);
  const [showFundWallet, setShowFundWallet] = useState(false);

  // --- LOCAL STORAGE ENGINE ---
  useEffect(() => {
    const loadData = () => {
      const storedUsers = JSON.parse(localStorage.getItem('sycamore_users')) || [INITIAL_ADMIN];
      const storedTx = JSON.parse(localStorage.getItem('sycamore_transactions')) || [];
      const activeSession = JSON.parse(localStorage.getItem('sycamore_session'));

      setUsers(storedUsers);
      setTransactions(storedTx);
      if (activeSession) setCurrentUser(activeSession);
      setIsLoaded(true);
    };
    loadData();
  }, []);

  const saveData = (newUsers, newTx) => {
    localStorage.setItem('sycamore_users', JSON.stringify(newUsers));
    localStorage.setItem('sycamore_transactions', JSON.stringify(newTx));
    setUsers(newUsers);
    setTransactions(newTx);
  };

  // --- AUTH METHODS ---
  const login = (username, password) => {
    const user = users.find(u => u.username === username && u.password === password);
    if (user) {
      setCurrentUser(user);
      localStorage.setItem('sycamore_session', JSON.stringify(user));
      setActiveTab('dashboard');
      return true;
    }
    return false;
  };

  const register = (username, password) => {
    if (users.find(u => u.username === username)) return false;
    const newUser = {
      id: `user-${Date.now()}`,
      username,
      password,
      role: 'USER',
      balance: 0
    };
    const updatedUsers = [...users, newUser];
    saveData(updatedUsers, transactions);
    setCurrentUser(newUser);
    localStorage.setItem('sycamore_session', JSON.stringify(newUser));
    return true;
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem('sycamore_session');
  };

  // --- TRANSACTION METHODS ---
  const createTransaction = (data) => {
    const newTx = {
      id: `TX-${Math.floor(Math.random() * 1000000)}`,
      createdAt: new Date().toISOString(),
      status: 'PENDING',
      buyerId: currentUser.id,
      buyerName: currentUser.username,
      ...data
    };
    saveData(users, [newTx, ...transactions]);
    setShowNewEscrow(false);
  };

  const updateTxStatus = (txId, newStatus) => {
    const updated = transactions.map(tx => tx.id === txId ? { ...tx, status: newStatus } : tx);
    saveData(users, updated);
  };

  if (!isLoaded) return <div className="min-h-screen bg-[#0B0F19] flex items-center justify-center text-white">Loading Sycamore...</div>;

  // --- RENDER ROUTING ---
  return (
    <div className="min-h-screen bg-[#0B0F19] text-gray-200 font-sans selection:bg-blue-500 selection:text-white">
      {!currentUser ? (
        <AuthScreen onLogin={login} onRegister={register} />
      ) : (
        <div className="flex h-screen overflow-hidden">
          {/* Sidebar */}
          <aside className="w-64 bg-[#111827] border-r border-gray-800 flex flex-col hidden md:flex">
            <div className="p-6 flex items-center gap-3">
              <SycamoreLogo />
              <div className="flex flex-col">
                <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-green-400 to-blue-500 tracking-tight">Sycamore</span>
                <span className="text-[10px] uppercase tracking-widest text-gray-500 font-semibold">Secure Escrow</span>
              </div>
            </div>
            
            <nav className="flex-1 px-4 space-y-2 mt-6">
              <NavItem icon={<LayoutDashboard />} label="Dashboard" active={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')} />
              <NavItem icon={<ArrowRightLeft />} label="Transactions" active={activeTab === 'transactions'} onClick={() => setActiveTab('transactions')} />
              {currentUser.role === 'ADMIN' && (
                <NavItem icon={<Users />} label="Users" active={activeTab === 'users'} onClick={() => setActiveTab('users')} />
              )}
            </nav>

            <div className="p-4 border-t border-gray-800">
              <div className="flex items-center gap-3 mb-4 px-2">
                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-green-500 to-blue-600 flex items-center justify-center text-white font-bold">
                  {currentUser.username.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="text-sm font-medium text-white">{currentUser.username}</p>
                  <p className="text-xs text-gray-500">{currentUser.role}</p>
                </div>
              </div>
              <button onClick={logout} className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-400 hover:bg-red-500/10 rounded-lg transition-colors">
                <LogOut size={16} /> Logout
              </button>
            </div>
          </aside>

          {/* Main Content */}
          <main className="flex-1 overflow-y-auto">
            <header className="flex md:hidden items-center justify-between p-4 border-b border-gray-800 bg-[#111827]">
               <SycamoreLogo className="w-8 h-8" />
               <button onClick={logout} className="text-gray-400"><LogOut size={20}/></button>
            </header>

            <div className="p-6 lg:p-10 max-w-7xl mx-auto">
              {currentUser.role === 'ADMIN' ? (
                <AdminView transactions={transactions} updateTxStatus={updateTxStatus} />
              ) : (
                <UserView 
                  user={currentUser} 
                  transactions={transactions.filter(t => t.buyerId === currentUser.id || t.sellerId === currentUser.id)}
                  onNewEscrow={() => setShowNewEscrow(true)}
                  onFundWallet={() => setShowFundWallet(true)}
                  updateTxStatus={updateTxStatus}
                />
              )}
            </div>
          </main>
        </div>
      )}

      {/* Modals */}
      {showNewEscrow && <NewEscrowModal onClose={() => setShowNewEscrow(false)} onCreate={createTransaction} />}
      {showFundWallet && <FundWalletModal onClose={() => setShowFundWallet(false)} />}
    </div>
  );
}

// --- SUB-COMPONENTS ---

const NavItem = ({ icon, label, active, onClick }) => (
  <button 
    onClick={onClick}
    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
      active ? 'bg-gradient-to-r from-green-500/10 to-blue-500/10 text-blue-400 border border-blue-500/20' : 'text-gray-400 hover:bg-gray-800 hover:text-gray-200'
    }`}
  >
    {React.cloneElement(icon, { size: 20 })}
    <span className="font-medium text-sm">{label}</span>
  </button>
);

const AuthScreen = ({ onLogin, onRegister }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    if (isLogin) {
      if (!onLogin(username, password)) setError('Invalid credentials');
    } else {
      if (!onRegister(username, password)) setError('Username already exists');
    }
  };

  return (
    <div className="flex min-h-screen">
      <div className="flex-1 flex flex-col justify-center px-4 sm:px-6 lg:flex-none lg:px-20 xl:px-24">
        <div className="mx-auto w-full max-w-sm lg:w-96">
          <div className="flex flex-col items-center mb-10">
            <SycamoreLogo className="w-16 h-16 mb-4" />
            <h2 className="text-3xl font-extrabold tracking-tight text-white">
              {isLogin ? 'Welcome back' : 'Create an account'}
            </h2>
            <p className="mt-2 text-sm text-gray-400">
              The premium escrow protocol for Goods & Crypto.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && <div className="p-3 bg-red-500/10 border border-red-500/50 text-red-400 text-sm rounded-lg text-center">{error}</div>}
            
            <div>
              <label className="block text-sm font-medium text-gray-300">Username</label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Users className="h-5 w-5 text-gray-500" />
                </div>
                <input 
                  type="text" 
                  required 
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  className="appearance-none block w-full pl-10 px-3 py-3 border border-gray-700 rounded-xl shadow-sm bg-[#111827] text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors sm:text-sm" 
                  placeholder="Enter your username"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300">Password</label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-500" />
                </div>
                <input 
                  type="password" 
                  required 
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="appearance-none block w-full pl-10 px-3 py-3 border border-gray-700 rounded-xl shadow-sm bg-[#111827] text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors sm:text-sm" 
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button 
              type="submit" 
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-lg text-sm font-medium text-white bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-400 hover:to-blue-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 focus:ring-offset-[#0B0F19] transition-all"
            >
              {isLogin ? 'Sign in to Sycamore' : 'Register Securely'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <button onClick={() => setIsLogin(!isLogin)} className="text-sm font-medium text-blue-400 hover:text-blue-300 transition-colors">
              {isLogin ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
            </button>
          </div>
          
          {/* Admin Hint for Prototype */}
          <div className="mt-12 p-4 border border-gray-800 rounded-xl bg-[#111827] text-xs text-gray-500 text-center">
            <p>Prototype Admin Access:</p>
            <p>User: <span className="text-gray-300">MetaGie</span> | Pass: <span className="text-gray-300">Aliyoux@1</span></p>
          </div>
        </div>
      </div>
      
      {/* Decorative Right Side */}
      <div className="hidden lg:flex flex-1 relative bg-[#111827] items-center justify-center overflow-hidden border-l border-gray-800">
        <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-blue-600/10"></div>
        <div className="relative z-10 text-center">
           <SycamoreLogo className="w-48 h-48 mx-auto mb-8 opacity-80" />
           <h1 className="text-4xl font-bold text-white tracking-tight mb-4">Trust, Code, and Capital.</h1>
           <p className="text-xl text-gray-400 max-w-md mx-auto">The infrastructure for secure physical and digital asset exchange.</p>
        </div>
        {/* Abstract shapes */}
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 rounded-full bg-blue-500/10 blur-3xl"></div>
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-96 h-96 rounded-full bg-green-500/10 blur-3xl"></div>
      </div>
    </div>
  );
};

const UserView = ({ user, transactions, onNewEscrow, onFundWallet, updateTxStatus }) => {
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Overview</h1>
          <p className="text-gray-400 mt-1">Manage your active escrows and wallet balance.</p>
        </div>
        <button onClick={onNewEscrow} className="flex items-center justify-center gap-2 bg-white text-gray-900 px-5 py-2.5 rounded-xl font-medium hover:bg-gray-100 transition-colors shadow-lg shadow-white/5">
          <Plus size={18} /> New Escrow
        </button>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-[#111827] border border-gray-800 p-6 rounded-2xl relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-gray-800/50 rounded-lg text-gray-400"><Wallet size={24} /></div>
            <button onClick={onFundWallet} className="text-xs font-medium text-blue-400 hover:text-blue-300 bg-blue-500/10 px-3 py-1.5 rounded-full transition-colors">
              Fund Wallet
            </button>
          </div>
          <p className="text-gray-400 text-sm font-medium">Available Balance</p>
          <h3 className="text-3xl font-bold text-white mt-1">₦ {user.balance.toLocaleString()}</h3>
        </div>

        <div className="bg-[#111827] border border-gray-800 p-6 rounded-2xl">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-blue-500/10 rounded-lg text-blue-400"><ShieldCheck size={24} /></div>
          </div>
          <p className="text-gray-400 text-sm font-medium">Active Escrows</p>
          <h3 className="text-3xl font-bold text-white mt-1">{transactions.filter(t => t.status !== 'COMPLETED').length}</h3>
        </div>

        <div className="bg-[#111827] border border-gray-800 p-6 rounded-2xl">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-green-500/10 rounded-lg text-green-400"><CheckCircle2 size={24} /></div>
          </div>
          <p className="text-gray-400 text-sm font-medium">Completed Transactions</p>
          <h3 className="text-3xl font-bold text-white mt-1">{transactions.filter(t => t.status === 'COMPLETED').length}</h3>
        </div>
      </div>

      {/* Transactions List */}
      <div>
        <h2 className="text-xl font-bold text-white mb-4">Recent Transactions</h2>
        <div className="bg-[#111827] border border-gray-800 rounded-2xl overflow-hidden">
          {transactions.length === 0 ? (
            <div className="p-12 text-center text-gray-500 flex flex-col items-center">
              <Package size={48} className="mb-4 opacity-20" />
              <p>No transactions yet.</p>
              <p className="text-sm">Click 'New Escrow' to secure a payment.</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-800">
              {transactions.map(tx => (
                <TransactionRow key={tx.id} tx={tx} updateStatus={updateTxStatus} isBuyer={tx.buyerId === user.id} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const AdminView = ({ transactions, updateTxStatus }) => {
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
          <ShieldCheck className="text-green-400" size={32} /> Admin Command Center
        </h1>
        <p className="text-gray-400 mt-1">Platform-wide overview and dispute resolution.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Volume', value: `₦ ${transactions.reduce((acc, curr) => acc + (curr.type === 'GOODS' ? curr.amount : 0), 0).toLocaleString()}` },
          { label: 'Active Escrows', value: transactions.filter(t => t.status === 'FUNDED').length },
          { label: 'Disputes', value: transactions.filter(t => t.status === 'DISPUTED').length, alert: true },
          { label: 'Completed', value: transactions.filter(t => t.status === 'COMPLETED').length }
        ].map((stat, i) => (
          <div key={i} className={`bg-[#111827] border ${stat.alert ? 'border-red-500/50 bg-red-500/5' : 'border-gray-800'} p-5 rounded-2xl`}>
            <p className="text-gray-400 text-sm font-medium">{stat.label}</p>
            <h3 className={`text-2xl font-bold mt-1 ${stat.alert && stat.value > 0 ? 'text-red-400' : 'text-white'}`}>{stat.value}</h3>
          </div>
        ))}
      </div>

      <div className="bg-[#111827] border border-gray-800 rounded-2xl overflow-hidden">
        <div className="p-4 border-b border-gray-800 flex justify-between items-center bg-gray-800/30">
          <h3 className="font-semibold text-white">All Platform Transactions</h3>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" size={16} />
            <input type="text" placeholder="Search ID..." className="bg-[#0B0F19] border border-gray-700 text-sm rounded-lg pl-9 pr-3 py-1.5 focus:outline-none focus:border-blue-500" />
          </div>
        </div>
        <div className="divide-y divide-gray-800">
          {transactions.map(tx => (
            <TransactionRow key={tx.id} tx={tx} updateStatus={updateTxStatus} isAdmin={true} />
          ))}
        </div>
      </div>
    </div>
  );
}

const TransactionRow = ({ tx, updateStatus, isBuyer, isAdmin }) => {
  const isCrypto = tx.type === 'CRYPTO';
  
  const getStatusColor = (status) => {
    switch(status) {
      case 'PENDING': return 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20';
      case 'FUNDED': return 'text-blue-400 bg-blue-400/10 border-blue-400/20';
      case 'COMPLETED': return 'text-green-400 bg-green-400/10 border-green-400/20';
      case 'DISPUTED': return 'text-red-400 bg-red-400/10 border-red-400/20';
      default: return 'text-gray-400 bg-gray-800 border-gray-700';
    }
  };

  return (
    <div className="p-4 sm:p-5 hover:bg-gray-800/30 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div className="flex items-center gap-4">
        <div className={`p-3 rounded-full ${isCrypto ? 'bg-orange-500/10 text-orange-400' : 'bg-blue-500/10 text-blue-400'}`}>
          {isCrypto ? <Bitcoin size={20} /> : <Package size={20} />}
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h4 className="font-semibold text-white">{tx.title}</h4>
            <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded border ${getStatusColor(tx.status)}`}>
              {tx.status}
            </span>
          </div>
          <p className="text-sm text-gray-400 mt-0.5">
            ID: {tx.id} • {new Date(tx.createdAt).toLocaleDateString()}
          </p>
        </div>
      </div>

      <div className="flex items-center justify-between sm:justify-end gap-6 sm:w-1/3">
        <div className="text-left sm:text-right">
          <p className="text-xs text-gray-500 mb-0.5">{isCrypto ? 'Asset Amount' : 'Fiat Value'}</p>
          <p className="font-bold text-white">
            {isCrypto ? `${tx.amount} ${tx.asset}` : `₦ ${tx.amount.toLocaleString()}`}
          </p>
        </div>
        
        {/* Action Buttons based on Role & Status */}
        <div className="flex gap-2">
           {isAdmin && tx.status === 'FUNDED' && (
             <button onClick={() => updateStatus(tx.id, 'COMPLETED')} className="px-3 py-1.5 text-xs font-medium bg-green-500/10 text-green-400 hover:bg-green-500/20 rounded-lg transition-colors border border-green-500/20">
               Force Release
             </button>
           )}
           {isBuyer && tx.status === 'PENDING' && (
             <button onClick={() => updateStatus(tx.id, 'FUNDED')} className="px-3 py-1.5 text-xs font-medium bg-blue-600 text-white hover:bg-blue-500 rounded-lg transition-colors shadow-lg shadow-blue-500/20">
               Pay Escrow
             </button>
           )}
           {isBuyer && tx.status === 'FUNDED' && (
             <button onClick={() => updateStatus(tx.id, 'COMPLETED')} className="px-3 py-1.5 text-xs font-medium bg-green-600 text-white hover:bg-green-500 rounded-lg transition-colors shadow-lg shadow-green-500/20">
               Confirm Receipt
             </button>
           )}
        </div>
      </div>
    </div>
  );
};


// --- MODALS ---

const NewEscrowModal = ({ onClose, onCreate }) => {
  const [type, setType] = useState('GOODS'); // GOODS or CRYPTO
  const [formData, setFormData] = useState({ title: '', amount: '', sellerUsername: '', asset: 'USDT' });

  const handleSubmit = (e) => {
    e.preventDefault();
    onCreate({
      type,
      title: formData.title,
      amount: parseFloat(formData.amount),
      sellerUsername: formData.sellerUsername,
      asset: type === 'CRYPTO' ? formData.asset : 'NGN',
    });
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-[#111827] border border-gray-800 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
        <div className="p-5 border-b border-gray-800 flex justify-between items-center bg-gray-800/30">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <ShieldCheck className="text-blue-500" size={20} /> Create Escrow
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">&times;</button>
        </div>

        <div className="p-6">
          {/* Engine Toggle */}
          <div className="flex bg-[#0B0F19] rounded-xl p-1 mb-6 border border-gray-800">
            <button 
              onClick={() => setType('GOODS')}
              className={`flex-1 py-2 text-sm font-medium rounded-lg flex items-center justify-center gap-2 transition-all ${type === 'GOODS' ? 'bg-[#1A2235] text-white shadow' : 'text-gray-500 hover:text-gray-300'}`}
            >
              <Package size={16} /> Physical Goods
            </button>
            <button 
              onClick={() => setType('CRYPTO')}
              className={`flex-1 py-2 text-sm font-medium rounded-lg flex items-center justify-center gap-2 transition-all ${type === 'CRYPTO' ? 'bg-[#1A2235] text-white shadow' : 'text-gray-500 hover:text-gray-300'}`}
            >
              <Bitcoin size={16} /> Crypto P2P
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Transaction Title</label>
              <input required type="text" placeholder={type === 'GOODS' ? "e.g. Macbook Pro M3" : "e.g. P2P Trade 500 USDT"} className="w-full bg-[#0B0F19] border border-gray-700 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-blue-500" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Seller Username</label>
              <input required type="text" placeholder="@username" className="w-full bg-[#0B0F19] border border-gray-700 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-blue-500" value={formData.sellerUsername} onChange={e => setFormData({...formData, sellerUsername: e.target.value})} />
            </div>

            <div className="flex gap-4">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-400 mb-1">{type === 'CRYPTO' ? 'Crypto Amount' : 'Amount (NGN)'}</label>
                <input required type="number" min="1" placeholder="0.00" className="w-full bg-[#0B0F19] border border-gray-700 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-blue-500" value={formData.amount} onChange={e => setFormData({...formData, amount: e.target.value})} />
              </div>
              {type === 'CRYPTO' && (
                <div className="w-1/3">
                  <label className="block text-sm font-medium text-gray-400 mb-1">Asset</label>
                  <select className="w-full bg-[#0B0F19] border border-gray-700 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-blue-500 appearance-none" value={formData.asset} onChange={e => setFormData({...formData, asset: e.target.value})}>
                    <option>USDT</option>
                    <option>BTC</option>
                    <option>ETH</option>
                  </select>
                </div>
              )}
            </div>

            <div className="bg-blue-500/10 border border-blue-500/20 p-3 rounded-xl flex gap-3 mt-6">
              <ShieldCheck className="text-blue-400 shrink-0 mt-0.5" size={16} />
              <p className="text-xs text-blue-300 leading-relaxed">
                Funds will be locked in the Sycamore Smart Contract. They are only released to the seller when you confirm receipt.
              </p>
            </div>

            <button type="submit" className="w-full bg-white text-gray-900 font-bold py-3 rounded-xl mt-6 hover:bg-gray-200 transition-colors">
              Initialize Escrow
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

const FundWalletModal = ({ onClose }) => {
  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    alert('Account number copied to clipboard!'); // Simple prototype alert
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-[#111827] border border-gray-800 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
        <div className="p-6 text-center border-b border-gray-800">
          <div className="w-16 h-16 bg-blue-500/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-blue-500/20">
            <Wallet className="text-blue-400" size={32} />
          </div>
          <h3 className="text-xl font-bold text-white">Fund Your Escrow Wallet</h3>
          <p className="text-sm text-gray-400 mt-2">Transfer funds to your unique virtual account below to begin trading on Sycamore.</p>
        </div>

        <div className="p-6 bg-[#0B0F19]">
          <div className="space-y-4">
            <div className="flex justify-between items-center border-b border-gray-800 pb-3">
              <span className="text-gray-500 text-sm">Bank Name</span>
              <span className="font-semibold text-white">OPay Digital Services</span>
            </div>
            <div className="flex justify-between items-center border-b border-gray-800 pb-3">
              <span className="text-gray-500 text-sm">Account Name</span>
              <span className="font-semibold text-white">Aliyu Garba Musa</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-500 text-sm">Account Number</span>
              <div className="flex items-center gap-2">
                <span className="font-bold text-2xl text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-blue-500">7086676866</span>
              </div>
            </div>
          </div>

          <button onClick={() => copyToClipboard('7086676866')} className="w-full mt-6 bg-[#1A2235] border border-gray-700 text-white font-medium py-3 rounded-xl hover:bg-gray-800 transition-colors">
            Copy Account Number
          </button>
          
          <button onClick={onClose} className="w-full mt-3 text-gray-500 text-sm hover:text-white transition-colors">
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
