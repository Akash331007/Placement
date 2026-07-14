import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import api from '../services/api';
import { 
  LayoutDashboard, 
  UploadCloud, 
  FileText, 
  BarChart3, 
  Target, 
  Briefcase, 
  Map, 
  User, 
  Settings, 
  ShieldAlert, 
  LogOut, 
  Bell, 
  Sun, 
  Moon, 
  Menu, 
  X,
  CheckCircle,
  AlertCircle
} from 'lucide-react';

interface Notification {
  id: number;
  message: string;
  is_read: boolean;
  type: string;
  created_at: string;
}

export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    if (user) {
      fetchNotifications();
      const interval = setInterval(fetchNotifications, 20000); // poll notifications every 20 seconds
      return () => clearInterval(interval);
    }
  }, [user]);

  const fetchNotifications = async () => {
    try {
      const data = await api.get<Notification[]>('/notifications');
      setNotifications(data);
    } catch (err) {
      console.error("Failed to load notifications:", err);
    }
  };

  const markAllAsRead = async () => {
    try {
      await api.put('/notifications/read-all');
      fetchNotifications();
    } catch (err) {
      console.error(err);
    }
  };

  const markAsRead = async (id: number) => {
    try {
      await api.put(`/notifications/${id}/read`);
      fetchNotifications();
    } catch (err) {
      console.error(err);
    }
  };

  const deleteNotif = async (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await api.delete(`/notifications/${id}`);
      fetchNotifications();
    } catch (err) {
      console.error(err);
    }
  };

  const unreadCount = notifications.filter(n => !n.is_read).length;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const menuItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Upload Resume', path: '/upload', icon: UploadCloud },
    { name: 'Resume Analysis', path: '/analysis', icon: FileText },
    { name: 'ATS Score', path: '/ats-score', icon: BarChart3 },
    { name: 'Skill Gap Analysis', path: '/skill-gap', icon: Target },
    { name: 'Learning Roadmap', path: '/roadmap', icon: Map },
  ];

  const renderSidebarLinks = () => {
    return menuItems.map((item) => {
      const Icon = item.icon;
      const isActive = location.pathname === item.path;
      return (
        <Link
          key={item.name}
          to={item.path}
          onClick={() => setMobileMenuOpen(false)}
          className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
            isActive
              ? 'bg-primary-600 text-white shadow-lg shadow-primary-600/30'
              : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/60'
          }`}
        >
          <Icon size={20} />
          <span className="font-medium text-sm">{item.name}</span>
        </Link>
      );
    });
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-dark-950 flex flex-col md:flex-row bg-grid transition-colors duration-200">
      
      {/* Sidebar for Desktop */}
      <aside className="hidden md:flex flex-col w-64 bg-white/70 dark:bg-slate-900/60 backdrop-blur-md border-r border-slate-200/50 dark:border-slate-850/40 p-5 fixed h-screen z-10">
        <div className="flex items-center gap-2 mb-8 px-2">
          <div className="w-8 h-8 rounded-lg bg-primary-600 flex items-center justify-center text-white font-extrabold text-lg shadow-md shadow-primary-650/30">
            A
          </div>
          <span className="font-bold text-lg text-slate-800 dark:text-white leading-none">
            Resume<span className="text-primary-600">AI</span>
          </span>
        </div>
        
        <nav className="flex-1 flex flex-col gap-1.5 overflow-y-auto pr-1">
          {renderSidebarLinks()}
        </nav>
        
        <div className="pt-5 border-t border-slate-200/50 dark:border-slate-800/40 flex flex-col gap-3">
          <div className="flex items-center gap-3 px-2">
            <div className="w-10 h-10 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center text-primary-600 dark:text-primary-400 font-bold">
              {user?.full_name?.charAt(0) || user?.email.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-slate-800 dark:text-white truncate">{user?.full_name || 'Candidate'}</p>
              <p className="text-xs text-slate-500 truncate">{user?.email}</p>
            </div>
          </div>
          <button 
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-4 py-2.5 rounded-xl text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 font-medium text-sm transition-colors"
          >
            <LogOut size={18} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Header / Top Navigation */}
      <div className="flex-1 md:pl-64 flex flex-col min-w-0">
        <header className="h-16 bg-white/70 dark:bg-slate-900/60 backdrop-blur-md border-b border-slate-200/50 dark:border-slate-850/40 px-5 flex items-center justify-between sticky top-0 z-20">
          <button 
            onClick={() => setMobileMenuOpen(true)}
            className="md:hidden text-slate-600 dark:text-slate-300 p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <Menu size={24} />
          </button>
          
          <div className="hidden md:block">
            <h1 className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              {location.pathname.substring(1).replace('-', ' ') || 'Dashboard'}
            </h1>
          </div>

          <div className="flex items-center gap-3">
            {/* Theme Toggle */}
            <button 
              onClick={toggleTheme}
              className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
            </button>

            {/* Notification Bell */}
            <div className="relative">
              <button 
                onClick={() => setNotificationsOpen(!notificationsOpen)}
                className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors relative"
              >
                <Bell size={20} />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 w-4 h-4 bg-primary-600 rounded-full text-[10px] text-white flex items-center justify-center font-bold">
                    {unreadCount}
                  </span>
                )}
              </button>

              {/* Notification Dropdown Panel */}
              {notificationsOpen && (
                <>
                  <div className="fixed inset-0 z-30" onClick={() => setNotificationsOpen(false)}></div>
                  <div className="absolute right-0 mt-2 w-80 max-h-[400px] overflow-y-auto glass-card rounded-2xl p-4 z-40 border border-slate-200 dark:border-slate-800 shadow-2xl animate-float-quick">
                    <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 mb-2">
                      <span className="font-bold text-sm text-slate-800 dark:text-white">Notifications</span>
                      {unreadCount > 0 && (
                        <button 
                          onClick={markAllAsRead}
                          className="text-xs text-primary-600 hover:underline font-medium"
                        >
                          Mark all as read
                        </button>
                      )}
                    </div>
                    {notifications.length === 0 ? (
                      <div className="py-8 text-center text-slate-400 text-xs">
                        No notifications yet.
                      </div>
                    ) : (
                      <div className="flex flex-col gap-2">
                        {notifications.map((notif) => (
                          <div 
                            key={notif.id}
                            onClick={() => markAsRead(notif.id)}
                            className={`flex gap-3 p-2.5 rounded-xl cursor-pointer transition-colors ${
                              notif.is_read ? 'hover:bg-slate-100/50 dark:hover:bg-slate-800/40' : 'bg-primary-50/50 dark:bg-primary-950/10 border-l-2 border-primary-500'
                            }`}
                          >
                            <div className="pt-0.5">
                              {notif.type === 'score_update' ? (
                                <CheckCircle size={16} className="text-emerald-500" />
                              ) : (
                                <AlertCircle size={16} className="text-primary-500" />
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-xs text-slate-700 dark:text-slate-300 font-medium leading-relaxed leading-normal">{notif.message}</p>
                              <span className="text-[10px] text-slate-400 mt-1 block">
                                {new Date(notif.created_at).toLocaleDateString()}
                              </span>
                            </div>
                            <button 
                              onClick={(e) => deleteNotif(notif.id, e)}
                              className="text-slate-400 hover:text-red-500 p-0.5 self-center"
                            >
                              <X size={12} />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-grow p-4 md:p-6 lg:p-8 max-w-7xl w-full mx-auto overflow-y-auto">
          {children}
        </main>
      </div>

      {/* Mobile Drawer Navigation */}
      {mobileMenuOpen && (
        <>
          <div 
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-30 md:hidden"
            onClick={() => setMobileMenuOpen(false)}
          ></div>
          <aside className="fixed top-0 bottom-0 left-0 w-64 bg-white dark:bg-slate-900 z-40 p-5 flex flex-col md:hidden animate-slide-in shadow-2xl">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-primary-600 flex items-center justify-center text-white font-extrabold text-lg shadow-md shadow-primary-650/30">
                  A
                </div>
                <span className="font-bold text-lg text-slate-800 dark:text-white">Resume<span className="text-primary-600">AI</span></span>
              </div>
              <button 
                onClick={() => setMobileMenuOpen(false)}
                className="text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
              >
                <X size={20} />
              </button>
            </div>
            
            <nav className="flex-1 flex flex-col gap-1.5 overflow-y-auto pr-1">
              {renderSidebarLinks()}
            </nav>
            
            <div className="pt-5 border-t border-slate-200 dark:border-slate-850 flex flex-col gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center text-primary-600 dark:text-primary-400 font-bold">
                  {user?.full_name?.charAt(0) || user?.email.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-800 dark:text-white truncate">{user?.full_name || 'Candidate'}</p>
                  <p className="text-xs text-slate-500 truncate">{user?.email}</p>
                </div>
              </div>
              <button 
                onClick={handleLogout}
                className="flex items-center gap-3 w-full px-4 py-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 font-medium text-sm rounded-xl transition-colors"
              >
                <LogOut size={18} />
                <span>Logout</span>
              </button>
            </div>
          </aside>
        </>
      )}
    </div>
  );
};
export default Layout;
