import React, { useState, useEffect, useRef } from 'react';
import {
  Users,
  Clock,
  Trash2,
  MessageSquare,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  RefreshCw,
  Search,
  Check,
  Send,
  Radio,
  Activity,
  ArrowUpRight,
  LogOut,
  Mail,
  UserCheck,
  UserX,
  Sparkles,
  ChevronDown,
  UserPlus,
  Key,
  Eye,
  EyeOff,
  Copy,
  X,
  Shield,
  Phone,
  Globe,
} from 'lucide-react';
import {
  adminService,
  AdminStats,
  UserRecord,
  UserSessionRecord,
  DeletionRequestRecord,
  ConversationThread,
  ChatMessageRecord,
} from '../../services/adminService';
import { authService } from '../../services/authService';
import { useToast } from '../../components/common/Toast';
import { useNavigate } from 'react-router-dom';

export const AdminDashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const toast = useToast();

  const [activeTab, setActiveTab] = useState<
    'overview' | 'approvals' | 'sessions' | 'deletions' | 'chatbot'
  >('overview');

  const [stats, setStats] = useState<AdminStats | null>(null);
  const [users, setUsers] = useState<UserRecord[]>([]);
  const [pendingUsers, setPendingUsers] = useState<UserRecord[]>([]);
  const [sessions, setSessions] = useState<UserSessionRecord[]>([]);
  const [deletions, setDeletions] = useState<DeletionRequestRecord[]>([]);
  const [conversations, setConversations] = useState<ConversationThread[]>([]);

  // Chat console state
  const [selectedChatUser, setSelectedChatUser] = useState<string | null>(null);
  const [chatThread, setChatThread] = useState<ChatMessageRecord[]>([]);
  const [adminReplyText, setAdminReplyText] = useState('');
  const [isSendingReply, setIsSendingReply] = useState(false);
  const [showAdminScrollBottom, setShowAdminScrollBottom] = useState(false);
  const adminChatContainerRef = useRef<HTMLDivElement>(null);
  const adminMessagesEndRef = useRef<HTMLDivElement>(null);
  const isAdminAtBottomRef = useRef(true);

  const scrollAdminChatToBottom = (behavior: ScrollBehavior = 'smooth') => {
    if (adminChatContainerRef.current) {
      adminChatContainerRef.current.scrollTo({
        top: adminChatContainerRef.current.scrollHeight,
        behavior,
      });
    }
    adminMessagesEndRef.current?.scrollIntoView({ behavior, block: 'end' });
  };

  const handleAdminChatScroll = () => {
    if (!adminChatContainerRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = adminChatContainerRef.current;
    const atBottom = scrollHeight - scrollTop - clientHeight < 80;
    isAdminAtBottomRef.current = atBottom;
    setShowAdminScrollBottom(!atBottom);
  };

  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [actionInProgressId, setActionInProgressId] = useState<number | null>(null);
  const [selectedUserForIp, setSelectedUserForIp] = useState<UserRecord | null>(null);

  // Create User Modal state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createUserForm, setCreateUserForm] = useState({
    fullName: '',
    username: '',
    email: '',
    mobileNumber: '',
    password: '',
    role: 'USER',
    accountStatus: 'ACTIVE',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmittingUser, setIsSubmittingUser] = useState(false);
  const [createdUserSuccess, setCreatedUserSuccess] = useState<{
    user: UserRecord;
    rawPassword: string;
  } | null>(null);
  const [copiedCredentials, setCopiedCredentials] = useState(false);

  const currentUser = authService.getCurrentUser();

  const loadAllData = async () => {
    try {
      const [statsData, allUsers, pending, sessionList, deletionList, chatThreads] =
        await Promise.all([
          adminService.getStats(),
          adminService.getUsers(),
          adminService.getPendingUsers(),
          adminService.getSessions(),
          adminService.getDataDeletions(),
          adminService.getChatConversations(),
        ]);

      setStats(statsData);
      setUsers(allUsers);
      setPendingUsers(pending);
      setSessions(sessionList);
      setDeletions(deletionList);
      setConversations(chatThreads);

      if (!selectedChatUser && chatThreads.length > 0) {
        setSelectedChatUser(chatThreads[0].userEmail);
      }
    } catch (err: any) {
      console.error('Failed to load admin data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!authService.isAdmin()) {
      toast.error('Access Denied: Admin Console is strictly restricted to Administrators.');
      navigate('/');
      return;
    }
    loadAllData();
    const interval = setInterval(loadAllData, 5000);
    return () => clearInterval(interval);
  }, []);

  // Load chat thread when selected user changes
  useEffect(() => {
    if (!selectedChatUser) return;
    const loadThread = async () => {
      try {
        const msgs = await adminService.getChatThread(selectedChatUser);
        setChatThread((prev) => {
          if (
            prev.length === msgs.length &&
            (prev.length === 0 || prev[prev.length - 1]?.id === msgs[msgs.length - 1]?.id)
          ) {
            return prev;
          }
          return msgs;
        });
      } catch (err) {
        console.error('Failed to load thread:', err);
      }
    };
    loadThread();
    const chatInterval = setInterval(loadThread, 3000);
    return () => clearInterval(chatInterval);
  }, [selectedChatUser]);

  // When conversation opens, automatically scroll to the latest message at the bottom (like Instagram)
  useEffect(() => {
    if (selectedChatUser) {
      isAdminAtBottomRef.current = true;
      setShowAdminScrollBottom(false);
      const t1 = setTimeout(() => scrollAdminChatToBottom('auto'), 50);
      const t2 = setTimeout(() => scrollAdminChatToBottom('auto'), 150);
      return () => {
        clearTimeout(t1);
        clearTimeout(t2);
      };
    }
  }, [selectedChatUser]);

  // When new messages arrive, auto-scroll to bottom only if admin is already viewing the latest messages
  useEffect(() => {
    if (isAdminAtBottomRef.current) {
      const timer = setTimeout(() => {
        scrollAdminChatToBottom('smooth');
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [chatThread]);

  // Handle User Approval
  const handleApproveUser = async (user: UserRecord) => {
    setActionInProgressId(user.id);
    try {
      await adminService.approveUser(user.id);
      toast.success(`User ${user.fullName || user.username} approved! Account is now active.`);
      await loadAllData();
    } catch (err: any) {
      toast.error(err.message || 'Failed to approve user');
    } finally {
      setActionInProgressId(null);
    }
  };

  // Handle User Rejection
  const handleRejectUser = async (user: UserRecord) => {
    if (!window.confirm(`Reject registration for ${user.fullName || user.username}?`)) return;
    setActionInProgressId(user.id);
    try {
      await adminService.rejectUser(user.id);
      toast.info(`User ${user.fullName || user.username} registration was rejected.`);
      await loadAllData();
    } catch (err: any) {
      toast.error(err.message || 'Failed to reject user');
    } finally {
      setActionInProgressId(null);
    }
  };

  // Handle Data Deletion Approval (AUTOMATIC DELETION)
  const handleApproveDeletion = async (req: DeletionRequestRecord) => {
    setActionInProgressId(req.id);
    try {
      const res = await adminService.approveDataDeletion(req.id);
      toast.success(
        `Deletion Request #${req.id} approved! Target [${req.dataType} #${req.dataId}] automatically deleted from DA Centre.`
      );
      await loadAllData();
    } catch (err: any) {
      toast.error(err.message || 'Failed to approve deletion');
    } finally {
      setActionInProgressId(null);
    }
  };

  // Handle Data Deletion Rejection
  const handleRejectDeletion = async (req: DeletionRequestRecord) => {
    const reason = window.prompt('Enter reason for rejecting deletion (optional):', '');
    if (reason === null) return;

    setActionInProgressId(req.id);
    try {
      await adminService.rejectDataDeletion(req.id, 'dacentreadmin@gmail.com', reason);
      toast.info(`Deletion request #${req.id} rejected. Data record preserved.`);
      await loadAllData();
    } catch (err: any) {
      toast.error(err.message || 'Failed to reject deletion');
    } finally {
      setActionInProgressId(null);
    }
  };

  // Send Admin Chat Reply directly to User
  const handleSendAdminReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedChatUser || !adminReplyText.trim() || isSendingReply) return;

    const reply = adminReplyText.trim();
    setAdminReplyText('');
    setIsSendingReply(true);

    try {
      const sent = await adminService.sendChatReply(selectedChatUser, reply, 'dacentreadmin@gmail.com');
      isAdminAtBottomRef.current = true;
      setShowAdminScrollBottom(false);
      setChatThread((prev) => [...prev, sent]);
      setTimeout(() => {
        scrollAdminChatToBottom('smooth');
      }, 40);
      toast.success('Reply dispatched directly to user!');
      await loadAllData();
    } catch (err: any) {
      toast.error(err.message || 'Failed to send reply to user');
    } finally {
      setIsSendingReply(false);
    }
  };

  const handleLogout = async () => {
    await authService.logout();
    toast.info('Logged out from DA Centre Admin Console');
    navigate('/login');
  };

  const handleGeneratePassword = () => {
    const chars = 'abcdefghjkmnpqrstuvwxyzABCDEFGHJKMNPQRSTUVWXYZ23456789!@#$%&*';
    let pwd = '';
    pwd += 'ABCDEFGHJKMNPQRSTUVWXYZ'[Math.floor(Math.random() * 24)];
    pwd += 'abcdefghjkmnpqrstuvwxyz'[Math.floor(Math.random() * 24)];
    pwd += '23456789'[Math.floor(Math.random() * 8)];
    pwd += '!@#$%&*'[Math.floor(Math.random() * 7)];
    for (let i = 0; i < 6; i++) {
      pwd += chars[Math.floor(Math.random() * chars.length)];
    }
    const shuffled = pwd.split('').sort(() => 0.5 - Math.random()).join('');
    setCreateUserForm((prev) => ({ ...prev, password: shuffled }));
    setShowPassword(true);
  };

  const handleFullNameChange = (name: string) => {
    setCreateUserForm((prev) => {
      const autoUsername =
        prev.username === '' ||
          prev.username === prev.fullName.toLowerCase().replace(/[^a-z0-9]/g, '_')
          ? name.toLowerCase().replace(/[^a-z0-9]/g, '_').slice(0, 30)
          : prev.username;
      return { ...prev, fullName: name, username: autoUsername };
    });
  };

  const handleCreateUserSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!createUserForm.username.trim()) {
      toast.error('Username is required');
      return;
    }
    if (!createUserForm.email.trim()) {
      toast.error('Email address is required');
      return;
    }
    if (!createUserForm.password.trim()) {
      toast.error('Password is required');
      return;
    }

    setIsSubmittingUser(true);
    try {
      const created = await adminService.createUser({
        fullName: createUserForm.fullName.trim() || undefined,
        username: createUserForm.username.trim(),
        email: createUserForm.email.trim(),
        mobileNumber: createUserForm.mobileNumber.trim() || undefined,
        password: createUserForm.password,
        role: createUserForm.role,
        accountStatus: createUserForm.accountStatus,
      });

      toast.success(`User account for ${created.fullName || created.username} created successfully!`);
      setCreatedUserSuccess({
        user: created,
        rawPassword: createUserForm.password,
      });
      await loadAllData();
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || 'Failed to create user account';
      toast.error(msg);
    } finally {
      setIsSubmittingUser(false);
    }
  };

  const handleCopyCredentials = () => {
    if (!createdUserSuccess) return;
    const creds = `=== DA CENTRE ACCOUNT CREDENTIALS ===
User ID: ${createdUserSuccess.user.customUserId || 'DAC-USR-' + createdUserSuccess.user.id}
Full Name: ${createdUserSuccess.user.fullName || createdUserSuccess.user.username}
Role: ${createdUserSuccess.user.role}
Account Status: ${createdUserSuccess.user.accountStatus}
Username: ${createdUserSuccess.user.username}
Email: ${createdUserSuccess.user.email}
Password: ${createdUserSuccess.rawPassword}
Portal Login: ${window.location.origin}/login
======================================`;
    navigator.clipboard.writeText(creds);
    setCopiedCredentials(true);
    toast.success('User credentials copied to clipboard!');
    setTimeout(() => setCopiedCredentials(false), 2500);
  };

  const handleResetCreateForm = () => {
    setCreateUserForm({
      fullName: '',
      username: '',
      email: '',
      mobileNumber: '',
      password: '',
      role: 'USER',
      accountStatus: 'ACTIVE',
    });
    setCreatedUserSuccess(null);
    setShowPassword(false);
    setCopiedCredentials(false);
  };

  const handleDeleteUser = async (user: UserRecord) => {
    if (user.email === 'dacentreadmin@gmail.com') {
      toast.error('The root administrator account cannot be deleted.');
      return;
    }
    if (
      !window.confirm(
        `Permanently delete account for ${user.fullName || user.username} (${user.email})? This action cannot be undone.`
      )
    ) {
      return;
    }
    setActionInProgressId(user.id);
    try {
      await adminService.deleteUser(user.id);
      toast.success(`User account for ${user.fullName || user.username} has been deleted.`);
      await loadAllData();
    } catch (err: any) {
      toast.error(err.response?.data?.message || err.message || 'Failed to delete user');
    } finally {
      setActionInProgressId(null);
    }
  };

  const handleToggleUserStatus = async (user: UserRecord) => {
    if (user.email === 'dacentreadmin@gmail.com') {
      toast.error('Root administrator cannot be deactivated.');
      return;
    }
    const newStatus = user.accountStatus === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';
    setActionInProgressId(user.id);
    try {
      await adminService.updateUserStatus(user.id, newStatus);
      toast.success(`User ${user.fullName || user.username} status updated to ${newStatus}.`);
      await loadAllData();
    } catch (err: any) {
      toast.error(err.response?.data?.message || err.message || 'Failed to update user status');
    } finally {
      setActionInProgressId(null);
    }
  };

  const filteredUsers = users.filter((u) => {
    const q = searchQuery.toLowerCase();
    return (
      u.username?.toLowerCase().includes(q) ||
      u.email?.toLowerCase().includes(q) ||
      u.fullName?.toLowerCase().includes(q) ||
      u.customUserId?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col select-none">
      {/* Top Admin Navigation Header */}
      <header className="h-16 border-b border-slate-800 bg-slate-900/80 backdrop-blur-xl px-6 flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-600 to-teal-500 p-0.5 flex items-center justify-center shadow-lg shadow-cyan-500/20">
            <ShieldCheck className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-black tracking-tight text-white">
                DA Centre <span className="text-cyan-400">Admin Console</span>
              </h1>
              <span className="px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 text-[10px] font-bold tracking-wider uppercase border border-cyan-400/30">
                Central Control
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              Authenticated Admin: <strong className="text-slate-200">dacentreadmin@gmail.com</strong>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Live Sync Pulse */}
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-800/80 border border-slate-700/80 text-xs text-slate-300">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span className="font-semibold text-emerald-400">Live Auto-Sync</span>
          </div>

          <button
            onClick={() => {
              handleResetCreateForm();
              setShowCreateModal(true);
            }}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-gradient-to-r from-cyan-500 via-teal-500 to-emerald-500 hover:brightness-110 text-white text-xs font-bold shadow-lg shadow-cyan-500/20 transition-all cursor-pointer"
          >
            <UserPlus className="w-4 h-4" />
            <span className="hidden sm:inline">Create User Account</span>
            <span className="sm:hidden">New User</span>
          </button>

          <button
            onClick={() => loadAllData()}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
            title="Refresh Dashboard Data"
          >
            <RefreshCw className="w-4 h-4" />
          </button>

          <button
            onClick={() => navigate('/')}
            className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300 hover:text-white transition-all cursor-pointer"
          >
            <span>View DA Centre Portal</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/30 text-rose-400 text-xs font-bold transition-all cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        {/* KPI Summary Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {/* 1. Total Users */}
          <div className="rounded-2xl p-4 sm:p-5 bg-gradient-to-br from-slate-900 to-slate-900/90 border border-cyan-500/20 shadow-lg shadow-slate-950/40 relative overflow-hidden">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Total Users
              </span>
              <div className="w-8 h-8 rounded-xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center">
                <Users className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              {stats?.totalUsers ?? '...'}
            </div>
            <div className="flex items-center gap-2 mt-2 text-[11px]">
              <span className="text-emerald-400 font-bold">{stats?.activeUsers ?? 0} Active</span>
              <span className="text-slate-500">•</span>
              <span className="text-amber-400 font-bold">{stats?.pendingUsers ?? 0} Pending</span>
            </div>
          </div>

          {/* 2. Platform Spend Time */}
          <div className="rounded-2xl p-4 sm:p-5 bg-gradient-to-br from-slate-900 to-slate-900/90 border border-teal-500/20 shadow-lg shadow-slate-950/40 relative overflow-hidden">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Total User Spend Time
              </span>
              <div className="w-8 h-8 rounded-xl bg-teal-500/10 text-teal-400 flex items-center justify-center">
                <Clock className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-black text-teal-300 tracking-tight">
              {stats?.formattedSpendTime ?? '0 mins'}
            </div>
            <div className="flex items-center gap-2 mt-2 text-[11px] text-slate-400">
              <span className="text-emerald-400 font-semibold flex items-center gap-1">
                <Radio className="w-3 h-3 animate-pulse" />
                {stats?.activeSessionsNow ?? 0} users online now
              </span>
            </div>
          </div>

          {/* 3. Pending Account Approvals */}
          <div
            onClick={() => setActiveTab('approvals')}
            className="rounded-2xl p-4 sm:p-5 bg-gradient-to-br from-slate-900 to-slate-900/90 border border-amber-500/20 shadow-lg shadow-slate-950/40 relative overflow-hidden cursor-pointer hover:border-amber-400/40 transition-all"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                User Approvals
              </span>
              <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center">
                <UserCheck className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-black text-amber-400 tracking-tight flex items-center gap-2">
              <span>{stats?.pendingUsers ?? 0}</span>
              {(stats?.pendingUsers ?? 0) > 0 && (
                <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 animate-pulse">
                  Action Required
                </span>
              )}
            </div>
            <div className="text-[11px] text-slate-400 mt-2">
              Registrations awaiting admin authorization
            </div>
          </div>

          {/* 4. Data Deletion Approvals */}
          <div
            onClick={() => setActiveTab('deletions')}
            className="rounded-2xl p-4 sm:p-5 bg-gradient-to-br from-slate-900 to-slate-900/90 border border-rose-500/20 shadow-lg shadow-slate-950/40 relative overflow-hidden cursor-pointer hover:border-rose-400/40 transition-all"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Data Deletion Requests
              </span>
              <div className="w-8 h-8 rounded-xl bg-rose-500/10 text-rose-400 flex items-center justify-center">
                <Trash2 className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-black text-rose-400 tracking-tight flex items-center gap-2">
              <span>{stats?.pendingDeletions ?? 0}</span>
              {(stats?.pendingDeletions ?? 0) > 0 && (
                <span className="text-xs px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30 animate-pulse">
                  Auto-Delete Ready
                </span>
              )}
            </div>
            <div className="text-[11px] text-slate-400 mt-2">
              User requested purges with stated reason
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 border-b border-slate-800 pb-2 overflow-x-auto">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 cursor-pointer ${activeTab === 'overview'
              ? 'bg-gradient-to-r from-cyan-600 to-teal-600 text-white shadow-md shadow-cyan-500/20'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
          >
            <Activity className="w-4 h-4" />
            <span>Executive Overview</span>
          </button>

          <button
            onClick={() => setActiveTab('approvals')}
            className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 cursor-pointer ${activeTab === 'approvals'
              ? 'bg-gradient-to-r from-amber-600 to-amber-500 text-white shadow-md shadow-amber-500/20'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
          >
            <UserCheck className="w-4 h-4" />
            <span>User Account Approvals</span>
            {(stats?.pendingUsers ?? 0) > 0 && (
              <span className="px-1.5 py-0.2 rounded-full bg-white text-slate-950 text-[10px] font-black">
                {stats?.pendingUsers}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('sessions')}
            className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 cursor-pointer ${activeTab === 'sessions'
              ? 'bg-gradient-to-r from-teal-600 to-emerald-600 text-white shadow-md shadow-teal-500/20'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
          >
            <Clock className="w-4 h-4" />
            <span>User Activities &amp; Spend Time</span>
          </button>

          <button
            onClick={() => setActiveTab('deletions')}
            className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 cursor-pointer ${activeTab === 'deletions'
              ? 'bg-gradient-to-r from-rose-600 to-rose-500 text-white shadow-md shadow-rose-500/20'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
          >
            <Trash2 className="w-4 h-4" />
            <span>Data Deletion Approvals</span>
            {(stats?.pendingDeletions ?? 0) > 0 && (
              <span className="px-1.5 py-0.2 rounded-full bg-white text-slate-950 text-[10px] font-black">
                {stats?.pendingDeletions}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('chatbot')}
            className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 cursor-pointer ${activeTab === 'chatbot'
              ? 'bg-gradient-to-r from-sky-600 to-indigo-600 text-white shadow-md shadow-sky-500/20'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
          >
            <MessageSquare className="w-4 h-4" />
            <span>Live Chatbot Console</span>
            {(stats?.unreadQueries ?? 0) > 0 && (
              <span className="px-1.5 py-0.2 rounded-full bg-rose-500 text-white text-[10px] font-black animate-pulse">
                {stats?.unreadQueries}
              </span>
            )}
          </button>
        </div>

        {/* TAB 1: EXECUTIVE OVERVIEW */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Quick Summary Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Left: Pending User Approvals Priority Box */}
              <div className="rounded-3xl p-6 bg-slate-900/80 border border-amber-500/30 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <UserCheck className="w-5 h-5 text-amber-400" />
                    <h3 className="font-bold text-white text-base">Pending Account Approvals</h3>
                  </div>
                  <span className="text-xs text-amber-400 font-bold">
                    {pendingUsers.length} waiting for approval
                  </span>
                </div>

                {pendingUsers.length === 0 ? (
                  <div className="p-8 text-center rounded-2xl bg-slate-950/60 border border-slate-800 text-slate-400 text-xs space-y-3">
                    <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto" />
                    <p>All user account creations have been reviewed and approved.</p>
                    <button
                      type="button"
                      onClick={() => {
                        handleResetCreateForm();
                        setShowCreateModal(true);
                      }}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-cyan-500/15 hover:bg-cyan-500/25 border border-cyan-500/30 text-cyan-300 font-bold text-xs transition-all cursor-pointer"
                    >
                      <UserPlus className="w-3.5 h-3.5" />
                      <span>Create New User Account</span>
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {pendingUsers.slice(0, 3).map((u) => (
                      <div
                        key={u.id}
                        className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800 flex items-center justify-between gap-3"
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-bold text-sm text-white">{u.fullName || u.username}</h4>
                            <span className="font-mono text-[10px] text-teal-300">
                              {u.customUserId || `DAC-USR-${u.id}`}
                            </span>
                          </div>
                          <p className="text-xs text-slate-400">{u.email}</p>
                          <p className="text-[10px] text-amber-400 font-semibold mt-0.5">
                            Status: PENDING_APPROVAL
                          </p>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            onClick={() => handleApproveUser(u)}
                            disabled={actionInProgressId === u.id}
                            className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-md flex items-center gap-1 cursor-pointer"
                          >
                            <Check className="w-3.5 h-3.5" />
                            <span>Approve</span>
                          </button>
                          <button
                            onClick={() => handleRejectUser(u)}
                            disabled={actionInProgressId === u.id}
                            className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-rose-900/60 text-slate-400 hover:text-rose-300 text-xs font-semibold transition-all cursor-pointer"
                          >
                            Reject
                          </button>
                        </div>
                      </div>
                    ))}

                    {pendingUsers.length > 3 && (
                      <button
                        onClick={() => setActiveTab('approvals')}
                        className="w-full py-2 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 text-xs text-amber-300 font-bold transition-all cursor-pointer"
                      >
                        View all {pendingUsers.length} pending user approvals →
                      </button>
                    )}
                  </div>
                )}
              </div>

              {/* Right: Pending Data Deletions Priority Box */}
              <div className="rounded-3xl p-6 bg-slate-900/80 border border-rose-500/30 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <Trash2 className="w-5 h-5 text-rose-400" />
                    <h3 className="font-bold text-white text-base">Data Deletion Requests</h3>
                  </div>
                  <span className="text-xs text-rose-400 font-bold">
                    {deletions.filter((d) => d.status === 'PENDING').length} pending review
                  </span>
                </div>

                {deletions.filter((d) => d.status === 'PENDING').length === 0 ? (
                  <div className="p-8 text-center rounded-2xl bg-slate-950/60 border border-slate-800 text-slate-400 text-xs">
                    <CheckCircle2 className="w-8 h-8 text-teal-400 mx-auto mb-2" />
                    No pending deletion requests from users.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {deletions
                      .filter((d) => d.status === 'PENDING')
                      .slice(0, 3)
                      .map((del) => (
                        <div
                          key={del.id}
                          className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-2"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="px-2 py-0.5 rounded-md bg-rose-500/20 text-rose-300 text-[10px] font-bold uppercase">
                                  {del.dataType}
                                </span>
                                <h4 className="font-bold text-xs text-white">
                                  {del.dataTitle || `Item #${del.dataId}`}
                                </h4>
                              </div>
                              <p className="text-[11px] text-slate-400 mt-1">
                                Requested by: <strong className="text-slate-300">{del.userEmail}</strong>
                              </p>
                            </div>

                            <div className="flex items-center gap-2 shrink-0">
                              <button
                                onClick={() => handleApproveDeletion(del)}
                                disabled={actionInProgressId === del.id}
                                className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-rose-600 to-amber-600 hover:brightness-110 text-white text-xs font-bold transition-all shadow-md flex items-center gap-1 cursor-pointer"
                                title="Approve and trigger automatic permanent deletion from DA Centre"
                              >
                                <Check className="w-3.5 h-3.5" />
                                <span>Approve &amp; Auto-Delete</span>
                              </button>
                            </div>
                          </div>

                          <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-300 italic">
                            &quot;{del.reason}&quot;
                          </div>
                        </div>
                      ))}
                  </div>
                )}
              </div>
            </div>

            {/* Quick Live Chatbot Snippet */}
            <div className="rounded-3xl p-6 bg-slate-900/80 border border-slate-800 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <MessageSquare className="w-5 h-5 text-sky-400" />
                  <h3 className="font-bold text-white text-base">Direct User Query Chatbot Stream</h3>
                </div>
                <button
                  onClick={() => setActiveTab('chatbot')}
                  className="text-xs text-cyan-400 font-bold hover:underline"
                >
                  Open Live Chat Console →
                </button>
              </div>

              {conversations.length === 0 ? (
                <p className="text-xs text-slate-400">No active user query conversations.</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {conversations.slice(0, 3).map((conv) => (
                    <div
                      key={conv.userEmail}
                      onClick={() => {
                        setSelectedChatUser(conv.userEmail);
                        setActiveTab('chatbot');
                      }}
                      className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800 hover:border-cyan-500/40 cursor-pointer transition-all space-y-1.5"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-xs text-white truncate max-w-[150px]">
                          {conv.userName || conv.userEmail}
                        </span>
                        {conv.unreadCount > 0 && (
                          <span className="px-1.5 py-0.5 rounded-full bg-rose-500 text-white text-[9px] font-black animate-pulse">
                            {conv.unreadCount} new
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-400 line-clamp-2 italic">
                        &quot;{conv.lastMessage}&quot;
                      </p>
                      <span className="text-[10px] text-slate-500">
                        {conv.lastTimestamp ? new Date(conv.lastTimestamp).toLocaleTimeString() : ''}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 2: USER ACCOUNT APPROVALS */}
        {activeTab === 'approvals' && (
          <div className="rounded-3xl p-6 bg-slate-900/80 border border-slate-800 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-lg font-black text-white">
                  User Accounts &amp; Registration Approvals
                </h3>
                <p className="text-xs text-slate-400">
                  Directly provision user credentials, manage role privileges, and review registration requests.
                </p>
              </div>

              <div className="flex items-center gap-2.5 w-full sm:w-auto">
                {/* Search */}
                <div className="relative w-full sm:w-64">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Filter users..."
                    className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-slate-800 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <button
                  type="button"
                  onClick={() => {
                    handleResetCreateForm();
                    setShowCreateModal(true);
                  }}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-teal-500 hover:brightness-110 text-white font-bold text-xs shadow-md shadow-cyan-500/20 flex items-center gap-1.5 transition-all cursor-pointer shrink-0"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>+ Create User</span>
                </button>
              </div>
            </div>

            {/* Pending Approvals Table */}
            <div>
              <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                <UserCheck className="w-4 h-4" />
                <span>Pending Approvals Queue ({pendingUsers.length})</span>
              </h4>

              {pendingUsers.length === 0 ? (
                <div className="p-8 text-center rounded-2xl bg-slate-950/60 border border-slate-800 text-slate-400 text-xs">
                  <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
                  There are currently no accounts waiting for administrator review.
                </div>
              ) : (
                <div className="overflow-x-auto rounded-2xl border border-amber-500/30">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-amber-950/30 text-amber-300 font-bold border-b border-amber-500/20">
                      <tr>
                        <th className="p-3">User ID</th>
                        <th className="p-3">Name</th>
                        <th className="p-3">Email Address</th>
                        <th className="p-3">Mobile Number</th>
                        <th className="p-3">Registered At</th>
                        <th className="p-3 text-right">Administrative Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800 bg-slate-950/60">
                      {pendingUsers.map((u) => (
                        <tr key={u.id} className="hover:bg-slate-900/60 transition-colors">
                          <td className="p-3 font-mono font-bold text-teal-300">
                            {u.customUserId || `DAC-USR-${u.id}`}
                          </td>
                          <td className="p-3 font-bold text-white">{u.fullName || u.username}</td>
                          <td className="p-3 text-slate-300">{u.email}</td>
                          <td className="p-3 text-slate-400">{u.mobileNumber || '—'}</td>
                          <td className="p-3 text-slate-400">
                            {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : '—'}
                          </td>
                          <td className="p-3 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => handleApproveUser(u)}
                                disabled={actionInProgressId === u.id}
                                className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold transition-all shadow-md flex items-center gap-1 cursor-pointer"
                              >
                                <Check className="w-3.5 h-3.5" />
                                <span>Approve User</span>
                              </button>
                              <button
                                onClick={() => handleRejectUser(u)}
                                disabled={actionInProgressId === u.id}
                                className="px-3 py-1.5 rounded-xl bg-rose-600/20 hover:bg-rose-600/40 text-rose-300 border border-rose-500/30 font-semibold transition-all cursor-pointer"
                              >
                                <XCircle className="w-3.5 h-3.5" />
                                <span>Reject</span>
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* All Registered Users Directory */}
            <div className="pt-4">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                  <Users className="w-4 h-4 text-cyan-400" />
                  <span>All Users Directory ({filteredUsers.length})</span>
                </h4>
                <button
                  type="button"
                  onClick={() => {
                    handleResetCreateForm();
                    setShowCreateModal(true);
                  }}
                  className="text-xs text-cyan-400 hover:text-cyan-300 font-bold flex items-center gap-1.5 cursor-pointer transition-colors"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>+ Add New User</span>
                </button>
              </div>

              <div className="overflow-x-auto rounded-2xl border border-slate-800">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-950 text-slate-400 font-bold border-b border-slate-800">
                    <tr>
                      <th className="p-3">User ID</th>
                      <th className="p-3">User</th>
                      <th className="p-3">Email</th>
                      <th className="p-3">Role</th>
                      <th className="p-3">Account Status</th>
                      <th className="p-3">Logins</th>
                      <th className="p-3">Last Active</th>
                      <th className="p-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/80 bg-slate-950/40">
                    {filteredUsers.map((u) => {
                      const isPending = u.accountStatus === 'PENDING_APPROVAL';
                      const isActive = u.active && u.accountStatus === 'ACTIVE';
                      const isRejected = u.accountStatus === 'REJECTED';
                      const isSuspended = u.accountStatus === 'SUSPENDED';

                      return (
                        <tr key={u.id} className="hover:bg-slate-900/60 transition-colors">
                          <td className="p-3 font-mono font-bold text-slate-300">
                            {u.customUserId || `DAC-USR-${u.id}`}
                          </td>
                          <td className="p-3">
                            <div className="font-bold text-white">{u.fullName || u.username}</div>
                            <div className="text-[10px] text-slate-500">@{u.username}</div>
                          </td>
                          <td className="p-3 text-slate-300">{u.email}</td>
                          <td className="p-3">
                            <span
                              className={`px-2 py-0.5 rounded-md font-bold text-[10px] ${u.role?.includes('ADMIN')
                                  ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                                  : 'bg-slate-800 text-slate-300'
                                }`}
                            >
                              {u.role || 'ROLE_USER'}
                            </span>
                          </td>
                          <td className="p-3">
                            {isActive && (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                                ACTIVE
                              </span>
                            )}
                            {isPending && (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-bold">
                                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                                PENDING_APPROVAL
                              </span>
                            )}
                            {isRejected && (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-rose-500/20 text-rose-300 text-[10px] font-bold">
                                REJECTED
                              </span>
                            )}
                            {isSuspended && (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-bold">
                                SUSPENDED
                              </span>
                            )}
                          </td>
                          <td className="p-3 font-mono text-slate-300">{u.totalLoginCount ?? 0}</td>
                          <td className="p-3 text-slate-400">
                            {u.lastLoginAt ? new Date(u.lastLoginAt).toLocaleString() : 'Never'}
                          </td>
                          <td className="p-3 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              {u.email !== 'dacentreadmin@gmail.com' ? (
                                <>
                                  <button
                                    onClick={() => handleToggleUserStatus(u)}
                                    disabled={actionInProgressId === u.id}
                                    className={`px-2 py-1 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${isActive
                                        ? 'bg-amber-500/15 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30'
                                        : 'bg-emerald-500/15 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/30'
                                      }`}
                                    title={isActive ? 'Deactivate / Suspend Account' : 'Reactivate Account'}
                                  >
                                    {isActive ? 'Suspend' : 'Activate'}
                                  </button>

                                  <button
                                    onClick={() => handleDeleteUser(u)}
                                    disabled={actionInProgressId === u.id}
                                    className="p-1 rounded-lg bg-rose-500/15 hover:bg-rose-500/30 text-rose-300 border border-rose-500/30 transition-colors cursor-pointer"
                                    title="Delete User Account"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </>
                              ) : (
                                <span className="text-[10px] text-slate-500 font-semibold px-2 py-0.5 rounded bg-slate-900 border border-slate-800">
                                  Primary Admin
                                </span>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: USER ACTIVITIES & SPEND TIME */}
        {activeTab === 'sessions' && (
          <div className="rounded-3xl p-6 bg-slate-900/80 border border-slate-800 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-black text-white">
                  User Activities &amp; Spend Time Tracking
                </h3>
                <p className="text-xs text-slate-400">
                  Granular audit logs of login sessions, platform engagement duration, and live status.
                </p>
              </div>

              <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-teal-500/10 border border-teal-500/30 text-teal-300 text-xs font-bold">
                <Clock className="w-4 h-4" />
                <span>Total Accumulated: {stats?.formattedSpendTime}</span>
              </div>
            </div>

            <div className="overflow-x-auto rounded-2xl border border-slate-800">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950 text-slate-400 font-bold border-b border-slate-800">
                  <tr>
                    <th className="p-3">Session Token</th>
                    <th className="p-3">User Email</th>
                    <th className="p-3">Login Time</th>
                    <th className="p-3">Last Active</th>
                    <th className="p-3">Time Spent in DA Centre</th>
                    <th className="p-3">IP Address</th>
                    <th className="p-3">Session Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80 bg-slate-950/40 font-mono">
                  {sessions.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="p-6 text-center text-slate-500 font-sans">
                        No user login session activity recorded yet.
                      </td>
                    </tr>
                  ) : (
                    sessions.map((s) => {
                      const minutes = Math.floor(s.durationSeconds / 60);
                      const seconds = s.durationSeconds % 60;
                      const timeStr = `${minutes}m ${seconds}s`;
                      const isLive = s.status === 'ACTIVE';

                      return (
                        <tr key={s.id} className="hover:bg-slate-900/60 transition-colors">
                          <td className="p-3 text-slate-500 truncate max-w-[120px]">
                            {s.sessionToken.slice(0, 12)}...
                          </td>
                          <td className="p-3 font-sans font-bold text-white">
                            {s.userEmail}
                          </td>
                          <td className="p-3 text-slate-400 font-sans">
                            {new Date(s.loginTime).toLocaleTimeString()}
                          </td>
                          <td className="p-3 text-slate-400 font-sans">
                            {new Date(s.lastActiveTime).toLocaleTimeString()}
                          </td>
                          <td className="p-3">
                            <span className="font-bold text-teal-300 bg-teal-500/10 px-2 py-1 rounded-md border border-teal-500/20">
                              {timeStr}
                            </span>
                          </td>
                          <td className="p-3 text-slate-400">{s.ipAddress || '—'}</td>
                          <td className="p-3 font-sans">
                            {isLive ? (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                                ACTIVE ONLINE
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-400 text-[10px] font-semibold">
                                CLOSED
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 4: DATA DELETION APPROVALS */}
        {activeTab === 'deletions' && (
          <div className="rounded-3xl p-6 bg-slate-900/80 border border-slate-800 space-y-6">
            <div>
              <h3 className="text-lg font-black text-white">
                Data Deletion Requests &amp; Automatic Execution
              </h3>
              <p className="text-xs text-slate-400">
                When users request to delete any data with a stated reason, Admin approval triggers automatic permanent deletion from DA Centre.
              </p>
            </div>

            <div className="overflow-x-auto rounded-2xl border border-slate-800">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950 text-slate-400 font-bold border-b border-slate-800">
                  <tr>
                    <th className="p-3">Category</th>
                    <th className="p-3">Item Details</th>
                    <th className="p-3">Requested By</th>
                    <th className="p-3">User Reason</th>
                    <th className="p-3">Status</th>
                    <th className="p-3 text-right">Admin Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80 bg-slate-950/40">
                  {deletions.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="p-8 text-center text-slate-500">
                        No deletion requests submitted yet.
                      </td>
                    </tr>
                  ) : (
                    deletions.map((del) => {
                      const isPending = del.status === 'PENDING';
                      const isApproved = del.status === 'APPROVED';
                      const isRejected = del.status === 'REJECTED';

                      return (
                        <tr key={del.id} className="hover:bg-slate-900/60 transition-colors">
                          <td className="p-3">
                            <span className="px-2.5 py-1 rounded-md bg-rose-500/15 text-rose-300 font-bold text-[10px] uppercase border border-rose-500/20">
                              {del.dataType}
                            </span>
                          </td>
                          <td className="p-3">
                            <div className="font-bold text-white">{del.dataTitle || `Item #${del.dataId}`}</div>
                            <div className="text-[10px] text-slate-500 font-mono">ID #{del.dataId}</div>
                          </td>
                          <td className="p-3">
                            <div className="font-bold text-white">{del.userName || del.userEmail || '—'}</div>
                            <div className="text-[10px] text-slate-400">{del.userEmail}</div>
                          </td>
                          <td className="p-3 max-w-[280px]">
                            <p className="text-slate-300 italic line-clamp-2">
                              &quot;{del.reason}&quot;
                            </p>
                            <span className="text-[9px] text-slate-500">
                              {del.requestedAt ? new Date(del.requestedAt).toLocaleString() : ''}
                            </span>
                          </td>
                          <td className="p-3">
                            {isPending && (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-bold">
                                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                                PENDING
                              </span>
                            )}
                            {isApproved && (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold">
                                <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                                AUTO-DELETED
                              </span>
                            )}
                            {isRejected && (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-rose-500/20 text-rose-300 text-[10px] font-bold">
                                REJECTED
                              </span>
                            )}
                          </td>
                          <td className="p-3 text-right">
                            {isPending ? (
                              <div className="flex items-center justify-end gap-2">
                                <button
                                  onClick={() => handleApproveDeletion(del)}
                                  disabled={actionInProgressId === del.id}
                                  className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-rose-600 via-rose-500 to-amber-600 hover:brightness-110 text-white font-bold transition-all shadow-md flex items-center gap-1 cursor-pointer"
                                  title="Approve request and automatically delete the record from DA Centre database"
                                >
                                  <Check className="w-3.5 h-3.5" />
                                  <span>Approve &amp; Auto-Delete</span>
                                </button>
                                <button
                                  onClick={() => handleRejectDeletion(del)}
                                  disabled={actionInProgressId === del.id}
                                  className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white font-semibold transition-all cursor-pointer"
                                >
                                  Reject
                                </button>
                              </div>
                            ) : (
                              <span className="text-[11px] text-slate-500 italic">
                                Action Completed
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 5: LIVE CHATBOT CONSOLE */}
        {activeTab === 'chatbot' && (
          <div className="rounded-3xl p-6 bg-slate-900/80 border border-slate-800 space-y-4">
            <div>
              <h3 className="text-lg font-black text-white">
                Live User Query Chatbot Console
              </h3>
              <p className="text-xs text-slate-400">
                Direct live connection between users and the Administrator. Reply in real time to inquiries.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 h-[600px] border border-slate-800 rounded-2xl overflow-hidden bg-slate-950">
              {/* Left Column: User Conversations List */}
              <div className="border-r border-slate-800 flex flex-col h-full min-h-0 bg-slate-900/40 overflow-hidden">
                <div className="p-3 border-b border-slate-800 font-bold text-xs text-slate-300 uppercase tracking-wider flex items-center justify-between shrink-0">
                  <span>Inquiries ({conversations.length})</span>
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                </div>

                <div className="flex-1 min-h-0 overflow-y-auto divide-y divide-slate-800/60">
                  {conversations.length === 0 ? (
                    <div className="p-6 text-center text-xs text-slate-500">
                      No user conversations yet.
                    </div>
                  ) : (
                    conversations.map((c) => {
                      const isSelected = selectedChatUser === c.userEmail;
                      return (
                        <div
                          key={c.userEmail}
                          onClick={() => setSelectedChatUser(c.userEmail)}
                          className={`p-3.5 transition-all cursor-pointer ${isSelected
                            ? 'bg-slate-800/90 border-l-4 border-cyan-400'
                            : 'hover:bg-slate-900/80'
                            }`}
                        >
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-bold text-xs text-white truncate max-w-[160px]">
                              {c.userName || c.userEmail}
                            </span>
                            {c.unreadCount > 0 && (
                              <span className="px-1.5 py-0.5 rounded-full bg-rose-500 text-white text-[9px] font-black animate-pulse">
                                {c.unreadCount}
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-slate-400 truncate italic">
                            &quot;{c.lastMessage}&quot;
                          </p>
                          <div className="text-[10px] text-slate-500 mt-1">
                            {c.lastTimestamp ? new Date(c.lastTimestamp).toLocaleTimeString() : ''}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              {/* Right Column: Chat Transcript & Direct Reply */}
              <div className="md:col-span-2 flex flex-col h-full min-h-0 bg-slate-950 relative overflow-hidden">
                {selectedChatUser ? (
                  <>
                    {/* Thread Header - Fixed at Top */}
                    <div className="p-3.5 border-b border-slate-800 bg-slate-900/80 flex items-center justify-between shrink-0">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-teal-500/20 text-teal-300 border border-teal-500/30 flex items-center justify-center font-bold text-xs">
                          {selectedChatUser.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <h4 className="font-bold text-xs text-white">{selectedChatUser}</h4>
                          <span className="text-[10px] text-emerald-400 font-semibold">
                            ● Direct Channel to User
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Messages Scroll Area - Like Instagram: Smooth, Occupies Space, Pinned Input */}
                    <div
                      ref={adminChatContainerRef}
                      onScroll={handleAdminChatScroll}
                      className="flex-1 min-h-0 p-4 overflow-y-auto space-y-3 overscroll-contain"
                      style={{
                        scrollbarWidth: 'thin',
                        scrollbarColor: 'rgba(6, 182, 212, 0.4) rgba(15, 23, 42, 0.5)',
                      }}
                    >
                      {chatThread.length === 0 ? (
                        <div className="h-full flex items-center justify-center text-xs text-slate-500">
                          No messages in this thread yet.
                        </div>
                      ) : (
                        chatThread.map((m) => {
                          const isAdmin = m.sender === 'ADMIN';
                          return (
                            <div
                              key={m.id}
                              className={`flex flex-col ${isAdmin ? 'items-end' : 'items-start'}`}
                            >
                              <div className="flex items-center gap-1.5 mb-1 text-[10px] text-slate-400">
                                <span className="font-bold">
                                  {isAdmin ? 'DA Centre Administrator (You)' : m.userName || m.userEmail}
                                </span>
                                <span>•</span>
                                <span>
                                  {m.timestamp ? new Date(m.timestamp).toLocaleTimeString() : ''}
                                </span>
                              </div>
                              <div
                                className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-xs sm:text-sm leading-relaxed ${isAdmin
                                  ? 'bg-gradient-to-r from-cyan-600 to-teal-600 text-white rounded-tr-sm'
                                  : 'bg-slate-800 text-slate-100 border border-slate-700 rounded-tl-sm'
                                  }`}
                              >
                                {m.message}
                              </div>
                            </div>
                          );
                        })
                      )}
                      <div ref={adminMessagesEndRef} className="h-1" />
                    </div>

                    {/* Floating Scroll to Bottom Button */}
                    {showAdminScrollBottom && (
                      <button
                        type="button"
                        onClick={() => {
                          scrollAdminChatToBottom('smooth');
                          isAdminAtBottomRef.current = true;
                          setShowAdminScrollBottom(false);
                        }}
                        className="absolute bottom-16 left-1/2 -translate-x-1/2 px-3.5 py-1.5 rounded-full bg-slate-800/95 hover:bg-cyan-600 text-cyan-300 hover:text-white text-[11px] font-bold shadow-xl shadow-black/70 border border-cyan-500/40 backdrop-blur-md flex items-center gap-1.5 transition-all cursor-pointer z-20 group animate-in fade-in slide-in-from-bottom-2 duration-200"
                      >
                        <span>Scroll to bottom</span>
                        <ChevronDown className="w-3.5 h-3.5 group-hover:translate-y-0.5 transition-transform" />
                      </button>
                    )}

                    {/* Admin Direct Reply Bar - Fixed at Bottom */}
                    <form
                      onSubmit={handleSendAdminReply}
                      className="p-3 border-t border-slate-800 bg-slate-900/95 flex items-center gap-2 shrink-0"
                    >
                      <input
                        type="text"
                        value={adminReplyText}
                        onChange={(e) => setAdminReplyText(e.target.value)}
                        placeholder={`Directly reply to ${selectedChatUser}...`}
                        disabled={isSendingReply}
                        className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
                      />
                      <button
                        type="submit"
                        disabled={!adminReplyText.trim() || isSendingReply}
                        className="h-10 px-4 rounded-xl bg-gradient-to-r from-cyan-500 to-teal-500 hover:brightness-110 text-white font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-50"
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span>Send Reply</span>
                      </button>
                    </form>
                  </>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-slate-500 text-xs">
                    <MessageSquare className="w-10 h-10 mb-2 opacity-50" />
                    <span>Select a conversation from the left to view user queries and reply.</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </main>

      {/* ========================================================================= */}
      {/* CREATE NEW USER ACCOUNT MODAL */}
      {/* ========================================================================= */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-700/80 rounded-3xl max-w-2xl w-full shadow-2xl p-6 sm:p-8 space-y-6 relative overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Background ambient glow */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

            {/* Modal Header */}
            <div className="flex items-start justify-between relative z-10">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-cyan-500 to-teal-500 text-white flex items-center justify-center shadow-lg shadow-cyan-500/25">
                  <UserPlus className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg sm:text-xl font-black text-white tracking-tight">
                    Create New User Account
                  </h3>
                  <p className="text-xs text-slate-400">
                    Directly provision credentials with instant access or queued approval
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  setShowCreateModal(false);
                  handleResetCreateForm();
                }}
                className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* If successfully created, display credentials card */}
            {createdUserSuccess ? (
              <div className="space-y-6 py-2 relative z-10 animate-in fade-in duration-200">
                <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-emerald-300">
                      User Account Successfully Created!
                    </h4>
                    <p className="text-xs text-slate-300">
                      The account is ready in DA Centre. You can copy the credentials below to deliver to the user.
                    </p>
                  </div>
                </div>

                <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-4 font-sans text-xs">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                    <span className="text-slate-400">User Identification</span>
                    <span className="font-mono font-bold text-teal-300 text-sm">
                      {createdUserSuccess.user.customUserId || `DAC-USR-${createdUserSuccess.user.id}`}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-4 border-b border-slate-800 pb-3">
                    <div>
                      <span className="text-slate-400 block mb-0.5">Full Name</span>
                      <span className="font-bold text-white text-sm">
                        {createdUserSuccess.user.fullName || createdUserSuccess.user.username}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 block mb-0.5">Username</span>
                      <span className="font-mono font-bold text-cyan-300">
                        @{createdUserSuccess.user.username}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 border-b border-slate-800 pb-3">
                    <div>
                      <span className="text-slate-400 block mb-0.5">Assigned Role</span>
                      <span className="inline-flex items-center gap-1 font-bold px-2 py-0.5 rounded-md bg-purple-500/20 text-purple-300 border border-purple-500/30 text-[11px]">
                        <Shield className="w-3 h-3" />
                        {createdUserSuccess.user.role}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 block mb-0.5">Account Status</span>
                      <span className="inline-flex items-center gap-1 font-bold px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[11px]">
                        <Check className="w-3 h-3" />
                        {createdUserSuccess.user.accountStatus}
                      </span>
                    </div>
                  </div>

                  <div>
                    <span className="text-slate-400 block mb-1">Email Address</span>
                    <span className="font-mono text-white bg-slate-900 px-3 py-1.5 rounded-xl border border-slate-800 block">
                      {createdUserSuccess.user.email}
                    </span>
                  </div>

                  <div>
                    <span className="text-slate-400 block mb-1">Temporary Initial Password</span>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-emerald-300 bg-slate-900 px-3 py-2 rounded-xl border border-slate-800 flex-1 font-bold text-sm tracking-wider">
                        {createdUserSuccess.rawPassword}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-3">
                  <button
                    type="button"
                    onClick={handleCopyCredentials}
                    className="w-full sm:flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-cyan-500 to-teal-500 hover:brightness-110 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-lg shadow-cyan-500/20 cursor-pointer"
                  >
                    {copiedCredentials ? (
                      <>
                        <Check className="w-4 h-4 text-emerald-300" />
                        <span>Credentials Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4" />
                        <span>Copy Full Credentials</span>
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={handleResetCreateForm}
                    className="w-full sm:w-auto py-3 px-5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs transition-colors cursor-pointer"
                  >
                    + Create Another
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setShowCreateModal(false);
                      handleResetCreateForm();
                    }}
                    className="w-full sm:w-auto py-3 px-5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white font-semibold text-xs transition-colors cursor-pointer"
                  >
                    Done &amp; Close
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleCreateUserSubmit} className="space-y-5 relative z-10">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Full Name */}
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1.5">
                      Full Name
                    </label>
                    <div className="relative">
                      <Users className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                      <input
                        type="text"
                        value={createUserForm.fullName}
                        onChange={(e) => handleFullNameChange(e.target.value)}
                        placeholder="Dr. Sarah Jenkins"
                        className="w-full pl-9 pr-3 py-2.5 text-xs rounded-xl bg-slate-950 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 transition-all"
                      />
                    </div>
                  </div>

                  {/* Username */}
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1.5">
                      Username <span className="text-rose-400">*</span>
                    </label>
                    <div className="relative">
                      <span className="text-slate-500 font-mono absolute left-3.5 top-2.5 text-xs font-bold">@</span>
                      <input
                        type="text"
                        required
                        value={createUserForm.username}
                        onChange={(e) =>
                          setCreateUserForm({ ...createUserForm, username: e.target.value.toLowerCase().replace(/[^a-z0-9_.-]/g, '') })
                        }
                        placeholder="sarah_jenkins"
                        className="w-full pl-9 pr-3 py-2.5 text-xs rounded-xl bg-slate-950 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 font-mono transition-all"
                      />
                    </div>
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1.5">
                      Email Address <span className="text-rose-400">*</span>
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                      <input
                        type="email"
                        required
                        value={createUserForm.email}
                        onChange={(e) => setCreateUserForm({ ...createUserForm, email: e.target.value })}
                        placeholder="sarah.jenkins@vetclinic.com"
                        className="w-full pl-9 pr-3 py-2.5 text-xs rounded-xl bg-slate-950 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 transition-all"
                      />
                    </div>
                  </div>

                  {/* Mobile Number */}
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1.5">
                      Mobile Number <span className="text-slate-500 font-normal">(optional)</span>
                    </label>
                    <div className="relative">
                      <Phone className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                      <input
                        type="text"
                        value={createUserForm.mobileNumber}
                        onChange={(e) => setCreateUserForm({ ...createUserForm, mobileNumber: e.target.value })}
                        placeholder="+91 98765 43210"
                        className="w-full pl-9 pr-3 py-2.5 text-xs rounded-xl bg-slate-950 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 transition-all"
                      />
                    </div>
                  </div>
                </div>

                {/* Password with Auto-Generator */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-bold text-slate-300">
                      Initial Password <span className="text-rose-400">*</span>
                    </label>
                    <button
                      type="button"
                      onClick={handleGeneratePassword}
                      className="text-[11px] text-teal-400 hover:text-teal-300 font-bold flex items-center gap-1 cursor-pointer transition-colors"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Auto-Generate Strong Password</span>
                    </button>
                  </div>
                  <div className="relative">
                    <Key className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={createUserForm.password}
                      onChange={(e) => setCreateUserForm({ ...createUserForm, password: e.target.value })}
                      placeholder="Enter or generate temporary password"
                      className="w-full pl-9 pr-10 py-2.5 text-xs rounded-xl bg-slate-950 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 font-mono transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-3 text-slate-400 hover:text-white transition-colors cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Role Selection */}
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-2">
                    Assign Role &amp; Permission Level
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div
                      onClick={() => setCreateUserForm({ ...createUserForm, role: 'USER' })}
                      className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-start gap-3 ${createUserForm.role === 'USER'
                          ? 'bg-slate-800/90 border-cyan-400 shadow-md shadow-cyan-500/10 ring-1 ring-cyan-400/40'
                          : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                        }`}
                    >
                      <div className="w-8 h-8 rounded-xl bg-slate-800 text-cyan-300 flex items-center justify-center shrink-0 mt-0.5">
                        <Users className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="font-bold text-xs text-white flex items-center gap-2">
                          <span>Standard User</span>
                          <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-400">ROLE_USER</span>
                        </div>
                        <p className="text-[11px] text-slate-400 mt-1 leading-snug">
                          Access research datasets, doctors, marketplace catalogs, and direct inquiry chatbot.
                        </p>
                      </div>
                    </div>

                    <div
                      onClick={() => setCreateUserForm({ ...createUserForm, role: 'ADMIN' })}
                      className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-start gap-3 ${createUserForm.role === 'ADMIN'
                          ? 'bg-purple-950/30 border-purple-400 shadow-md shadow-purple-500/10 ring-1 ring-purple-400/40'
                          : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                        }`}
                    >
                      <div className="w-8 h-8 rounded-xl bg-purple-500/20 text-purple-300 flex items-center justify-center shrink-0 mt-0.5">
                        <ShieldCheck className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="font-bold text-xs text-white flex items-center gap-2">
                          <span>Administrator</span>
                          <span className="text-[10px] px-1.5 py-0.2 rounded bg-purple-500/20 text-purple-300 font-bold">
                            ROLE_ADMIN
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400 mt-1 leading-snug">
                          Full admin console privileges: approve users, auto-purge data, and direct user live replies.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Account Status */}
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-2">
                    Initial Account Status
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <label
                      onClick={() => setCreateUserForm({ ...createUserForm, accountStatus: 'ACTIVE' })}
                      className={`p-3 rounded-xl border flex items-center gap-2.5 cursor-pointer text-xs transition-all ${createUserForm.accountStatus === 'ACTIVE'
                          ? 'bg-emerald-950/30 border-emerald-500/50 text-emerald-300 font-bold'
                          : 'bg-slate-950 border-slate-800 text-slate-400'
                        }`}
                    >
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                      <span>Active Immediately (Recommended)</span>
                    </label>

                    <label
                      onClick={() => setCreateUserForm({ ...createUserForm, accountStatus: 'PENDING_APPROVAL' })}
                      className={`p-3 rounded-xl border flex items-center gap-2.5 cursor-pointer text-xs transition-all ${createUserForm.accountStatus === 'PENDING_APPROVAL'
                          ? 'bg-amber-950/30 border-amber-500/50 text-amber-300 font-bold'
                          : 'bg-slate-950 border-slate-800 text-slate-400'
                        }`}
                    >
                      <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                      <span>Queued (Pending Approval)</span>
                    </label>
                  </div>
                </div>

                {/* Form Footer */}
                <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setShowCreateModal(false);
                      handleResetCreateForm();
                    }}
                    disabled={isSubmittingUser}
                    className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white font-semibold text-xs transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={isSubmittingUser}
                    className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 via-teal-500 to-emerald-500 hover:brightness-110 text-white font-bold text-xs shadow-lg shadow-cyan-500/20 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {isSubmittingUser ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>Provisioning Account...</span>
                      </>
                    ) : (
                      <>
                        <UserPlus className="w-4 h-4" />
                        <span>Create &amp; Provision User Account</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* USER IP & SECURITY TELEMETRY MODAL */}
      {selectedUserForIp && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-cyan-500/30 rounded-3xl max-w-lg w-full p-6 shadow-2xl shadow-cyan-950/50 space-y-5 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shadow-sm">
                  <Globe className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-white">User Network &amp; IP Telemetry</h3>
                  <p className="text-xs text-slate-400">Connection footprint and security audit log</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedUserForIp(null)}
                className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              {/* User Identity banner */}
              <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800 flex items-center justify-between gap-3">
                <div>
                  <div className="font-bold text-sm text-white">{selectedUserForIp.fullName || selectedUserForIp.username}</div>
                  <div className="text-slate-400 font-mono">{selectedUserForIp.email}</div>
                </div>
                <span className="font-mono font-bold text-xs px-2.5 py-1 rounded-lg bg-teal-500/15 border border-teal-500/30 text-teal-300">
                  {selectedUserForIp.customUserId || `DAC-USR-${selectedUserForIp.id}`}
                </span>
              </div>

              {/* IP Information Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Current / Last Active IP */}
                <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-2">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Activity className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Current / Last Active IP</span>
                  </span>
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-sm font-bold text-cyan-300">
                      {selectedUserForIp.lastIpAddress || selectedUserForIp.registrationIpAddress || '127.0.0.1'}
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        const ip = selectedUserForIp.lastIpAddress || selectedUserForIp.registrationIpAddress || '127.0.0.1';
                        navigator.clipboard.writeText(ip);
                        toast.success(`Copied IP ${ip} to clipboard!`);
                      }}
                      className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
                      title="Copy IP"
                    >
                      <Copy className="w-3 h-3" />
                    </button>
                  </div>
                  <div className="text-[10px] text-slate-500">
                    Network Type: <strong className="text-slate-300">
                      {selectedUserForIp.lastIpAddress === '127.0.0.1' ? 'Localhost (Dev)' : selectedUserForIp.lastIpAddress?.startsWith('192.168.') ? 'Private LAN' : 'Public IPv4/IPv6'}
                    </strong>
                  </div>
                </div>

                {/* Registration Origin IP */}
                <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-2">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Shield className="w-3.5 h-3.5 text-amber-400" />
                    <span>Registration Origin IP</span>
                  </span>
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-sm font-bold text-amber-300">
                      {selectedUserForIp.registrationIpAddress || selectedUserForIp.lastIpAddress || '127.0.0.1'}
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        const ip = selectedUserForIp.registrationIpAddress || selectedUserForIp.lastIpAddress || '127.0.0.1';
                        navigator.clipboard.writeText(ip);
                        toast.success(`Copied Registration IP ${ip} to clipboard!`);
                      }}
                      className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
                      title="Copy Registration IP"
                    >
                      <Copy className="w-3 h-3" />
                    </button>
                  </div>
                  <div className="text-[10px] text-slate-500">
                    Account Created: <strong className="text-slate-300">
                      {selectedUserForIp.createdAt ? new Date(selectedUserForIp.createdAt).toLocaleDateString() : '—'}
                    </strong>
                  </div>
                </div>
              </div>

              {/* Login Telemetry Details */}
              <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-2">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  Session Statistics &amp; Status
                </span>
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="p-2 rounded-xl bg-slate-900 border border-slate-800">
                    <div className="text-slate-400 text-[10px]">Total Logins</div>
                    <div className="font-mono font-bold text-white text-sm">{selectedUserForIp.totalLoginCount ?? 0}</div>
                  </div>
                  <div className="p-2 rounded-xl bg-slate-900 border border-slate-800">
                    <div className="text-slate-400 text-[10px]">Role Status</div>
                    <div className="font-mono font-bold text-cyan-300 text-xs mt-0.5">{selectedUserForIp.role}</div>
                  </div>
                  <div className="p-2 rounded-xl bg-slate-900 border border-slate-800">
                    <div className="text-slate-400 text-[10px]">Account</div>
                    <div className="font-mono font-bold text-emerald-300 text-xs mt-0.5">{selectedUserForIp.accountStatus}</div>
                  </div>
                </div>
                <div className="text-[11px] text-slate-400 pt-1">
                  Last login recorded: <strong className="text-slate-200">
                    {selectedUserForIp.lastLoginAt ? new Date(selectedUserForIp.lastLoginAt).toLocaleString() : 'Never'}
                  </strong>
                </div>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedUserForIp(null)}
                className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs transition-colors cursor-pointer"
              >
                Close Telemetry
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
