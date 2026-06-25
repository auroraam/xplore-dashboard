import React, { useState } from 'react';
import Sidebar from '../components/sidebar';
import FilterBar from '../components/filterBar';
import DashboardContent from '../components/dashboard';
import DashboardSentimen from '@/components/sentimen';
import DashboardAktor from '@/components/aktor';
import DashboardBerita from '@/components/berita';
import DashboardTren from '@/components/tren';

export default function DashboardHome() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [activeOrg, setActiveOrg] = useState('Main Org.');
  const [activeMenu, setActiveMenu] = useState('Home');
  const [isHelpOpen, setIsHelpOpen] = useState(false);

  const organizations = [
    { name: 'Main Org.', role: 'Viewer' },
    { name: 'softplay', role: 'Editor' }
  ];

  const [filters, setFilters] = useState({
  from: "now-7d",
  to: "now",
  topik: "$__all",
  sentimen: "$__all",
  lucene: "*",
});

  const renderActiveTab = () => {
    switch (activeMenu) {
      case 'Utama':
      case 'Home':
        return <DashboardContent filters={filters} />;
      case 'Sentimen':
        return <DashboardSentimen filters={filters} />;
      case 'Peta Aktor':
        return <DashboardAktor filters={filters} />;
      case 'Tren Isu':
        return <DashboardTren filters={filters} />;
      case 'Arus Berita':
        return <DashboardBerita filters={filters} />;
      default:
        return <DashboardContent filters={filters} />;
    }
  };

  console.log("STATUS RENDER: activeMenu saat ini adalah ->", activeMenu);

  return (
      <div className="flex h-screen bg-gray-50 font-sans">
        <Sidebar isOpen={isSidebarOpen} activeMenu={activeMenu} setActiveMenu={setActiveMenu} /* ...props */ />
  
        <div className="flex-1 flex flex-col overflow-hidden">
  
          <div className="flex items-center justify-between px-6 py-3 bg-white border-b border-gray-100">
            <div className="flex items-center gap-3">
  
              <button
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className="p-2 rounded-xl text-gray-500 hover:bg-gray-100 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
  
              <div className="flex items-center gap-2 text-sm">
                {activeMenu === 'Home' ? (
                  <span className="font-semibold text-gray-800">Home</span>
                ) : (
                  <>
                    <span className="text-gray-400">Dashboard</span>
                    <span className="text-gray-300">/</span>
                    <span className="font-semibold text-gray-800">{activeMenu}</span>
                  </>
                )}
              </div>
            </div>
  
            <div className="flex items-center gap-2">
              <div className="flex items-center bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 w-56
                              focus-within:border-violet-400 focus-within:ring-2 focus-within:ring-violet-100 transition-all">
                <svg className="w-4 h-4 text-gray-400 mr-2 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input type="text" placeholder="Search..." className="bg-transparent border-none outline-none text-sm w-full text-gray-700 placeholder-gray-400" />
                <span className="text-xs text-gray-300 border border-gray-200 rounded px-1 py-0.5 ml-2">⌘K</span>
              </div>
  
              <button
                onClick={() => setIsHelpOpen(true)}
                className="w-9 h-9 flex items-center justify-center rounded-xl text-gray-500 hover:bg-gray-100 border border-gray-200 transition-colors"
              >
                <svg className="w-5 h-5" fill="currentColor" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640">
                  <path d="M528 320C528 205.1 434.9 112 320 112C205.1 112 112 205.1 112 320C112 434.9 205.1 528 320 528C434.9 528 528 434.9 528 320zM64 320C64 178.6 178.6 64 320 64C461.4 64 576 178.6 576 320C576 461.4 461.4 576 320 576C178.6 576 64 461.4 64 320zM320 240C302.3 240 288 254.3 288 272C288 285.3 277.3 296 264 296C250.7 296 240 285.3 240 272C240 227.8 275.8 192 320 192C364.2 192 400 227.8 400 272C400 319.2 364 339.2 344 346.5L344 350.3C344 363.6 333.3 374.3 320 374.3C306.7 374.3 296 363.6 296 350.3L296 342.2C296 321.7 310.8 307 326.1 302C332.5 299.9 339.3 296.5 344.3 291.7C348.6 287.5 352 281.7 352 272.1C352 254.4 337.7 240.1 320 240.1zM288 432C288 414.3 302.3 400 320 400C337.7 400 352 414.3 352 432C352 449.7 337.7 464 320 464C302.3 464 288 449.7 288 432z"/>
                </svg>
              </button>
  
              <div className="relative">
                <button
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                  className="flex items-center gap-2 hover:bg-gray-100 px-2 py-1.5 rounded-xl transition-colors"
                >
                  <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-semibold"
                       style={{ background: "linear-gradient(135deg, #7C3AED, #A78BFA)" }}>
                    AM
                  </div>
                  <div className="text-left hidden sm:block">
                    <p className="text-xs font-semibold text-gray-800 leading-none">Aurora Ma'isyah</p>
                    <p className="text-xs text-gray-400 mt-0.5">Admin</p>
                  </div>
                </button>
  
                {isProfileOpen && (
                  <div className="absolute right-0 mt-2 w-60 bg-white border border-gray-100 rounded-2xl z-50 py-2 overflow-hidden"
                       style={{ boxShadow: "0 16px 40px rgba(0,0,0,0.12)" }}>
  
                    <div className="px-4 py-3 border-b border-gray-50">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-bold"
                             style={{ background: "linear-gradient(135deg, #7C3AED, #A78BFA)" }}>AM</div>
                        <div>
                          <p className="text-sm font-semibold text-gray-800">Aurora Ma'isyah</p>
                          <p className="text-xs text-gray-400">XPLORE</p>
                        </div>
                      </div>
                    </div>
  
                    <ul className="py-1 text-sm text-gray-700">
                      {[
                        { icon: "M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4", label: "Preferences" },
                        { icon: "M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9", label: "Notifikasi" },
                        { icon: "M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z", label: "Ganti Password" },
                        { icon: "M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01", label: "Ganti Tema" },
                      ].map(({ icon, label }) => (
                        <li key={label} className="flex items-center gap-3 px-4 py-2 hover:bg-violet-50 hover:text-violet-700 cursor-pointer transition-colors">
                          <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={icon} />
                          </svg>
                          {label}
                        </li>
                      ))}
                    </ul>
  
                    <div className="border-t border-gray-50 pt-2 pb-1">
                      {organizations.map((org) => (
                        <div
                          key={org.name}
                          onClick={() => setActiveOrg(org.name)}
                          className={`relative mx-2 mb-1 px-3 py-2 rounded-xl cursor-pointer transition-colors ${
                            activeOrg === org.name ? 'bg-violet-50' : 'hover:bg-gray-50'
                          }`}
                        >
                          {activeOrg === org.name && (
                            <div className="absolute left-0 top-1 bottom-1 w-1 rounded-full bg-violet-500" />
                          )}
                          <p className={`text-sm font-medium ${activeOrg === org.name ? 'text-violet-700' : 'text-gray-700'}`}>{org.name}</p>
                          <p className="text-xs text-gray-400">{org.role}</p>
                        </div>
                      ))}
                    </div>
  
                    <div className="border-t border-gray-50 pt-1">
                      <li className="flex items-center gap-3 px-4 py-2 hover:bg-red-50 cursor-pointer transition-colors text-red-500 hover:text-red-600 text-sm list-none">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                        Sign out
                      </li>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
  
          <FilterBar filters={filters} setFilters={setFilters} />
  
          <div className="flex-1 overflow-auto bg-gray-50 p-6">
            {renderActiveTab()}
          </div>
        </div>
      </div>
    );
}