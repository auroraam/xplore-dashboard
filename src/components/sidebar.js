import React, { useState } from 'react';

export default function Sidebar({ isOpen, activeMenu, setActiveMenu }) {
  const [isDashboardOpen, setIsDashboardOpen] = useState(true);

  const [menus, setMenus] = useState([
    { name: 'Utama', isBookmarked: false },
    { name: 'Sentimen', isBookmarked: false },
    { name: 'Peta Aktor', isBookmarked: false },
    { name: 'Tren Isu', isBookmarked: false },
    { name: 'Arus Berita', isBookmarked: false },
    { name: 'Media Sosial', isBookmarked: false },
  ]);

  const toggleBookmark = (e, menuName) => {
    e.stopPropagation();
    setMenus(menus.map(menu => 
      menu.name === menuName ? { ...menu, isBookmarked: !menu.isBookmarked } : menu
    ));
  };

  return (
    <div className={`bg-white h-screen flex flex-col font-sans z-20 transition-all duration-300 ease-in-out
                     ${isOpen ? 'w-64 border-r border-gray-100' : 'w-0 overflow-hidden opacity-0 border-none'}`}
         style={{ boxShadow: isOpen ? "2px 0 20px rgba(0,0,0,0.04)" : "none" }}>
      <div className="w-64 h-full flex flex-col">

        <div className="px-6 py-5 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center"
               style={{ background: "linear-gradient(135deg, #F59E0B, #EF4444)" }}>
            <img src="/grafana_icon.svg" alt="" className="w-5 h-5 brightness-200" />
          </div>
          <h1 className="text-base font-bold text-gray-900">xPlore</h1>
        </div>

        <div className="flex-1 overflow-y-auto px-3">

          <div className="mb-6">
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 px-3">Bookmarks</h3>
            <ul className="space-y-1">
              {menus.filter(m => m.isBookmarked).map(menu => (
                <li
                  key={menu.name}
                  onClick={() => setActiveMenu(menu.name)}
                  className="flex items-center gap-3 px-3 py-2 rounded-xl cursor-pointer hover:bg-red-50 transition-colors"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0" />
                  <span className={`text-sm ${activeMenu === menu.name ? 'text-red-700 font-semibold' : 'text-gray-600'}`}>
                    {menu.name}
                  </span>
                </li>
              ))}
              {menus.filter(m => m.isBookmarked).length === 0 && (
                <li className="flex gap-3 px-3">
                  <span className="w-1.5 h-1.5 rounded-full bg-gray-200 mt-1.5 shrink-0" />
                  <span className="text-xs text-gray-400 leading-relaxed">
                    Other bookmarked pages will appear here
                  </span>
                </li>
              )}
            </ul>
          </div>

          <div>
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 px-3">Pages</h3>
            <ul className="space-y-1">
              <li
                onClick={() => setActiveMenu('Home')}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer transition-all duration-150 ${
                  activeMenu === 'Home'
                    ? 'text-white font-semibold'
                    : 'text-gray-500 hover:bg-red-50 hover:text-red-700'
                }`}
                style={activeMenu === 'Home'
                  ? { background: "linear-gradient(135deg, #F59E0B, #EF4444)", boxShadow: "0 4px 12px rgba(124,58,237,0.25)" }
                  : {}}
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" className="w-5 h-5 shrink-0" viewBox="0 0 640 640">
                  <path d="M304 70.1C313.1 61.9 326.9 61.9 336 70.1L568 278.1C577.9 286.9 578.7 302.1 569.8 312C560.9 321.9 545.8 322.7 535.9 313.8L527.9 306.6L527.9 511.9C527.9 547.2 499.2 575.9 463.9 575.9L175.9 575.9C140.6 575.9 111.9 547.2 111.9 511.9L111.9 306.6L103.9 313.8C94 322.6 78.9 321.8 70 312C61.1 302.2 62 287 71.8 278.1L304 70.1zM320 120.2L160 263.7L160 512C160 520.8 167.2 528 176 528L224 528L224 424C224 384.2 256.2 352 296 352L344 352C383.8 352 416 384.2 416 424L416 528L464 528C472.8 528 480 520.8 480 512L480 263.7L320 120.3zM272 528L368 528L368 424C368 410.7 357.3 400 344 400L296 400C282.7 400 272 410.7 272 424L272 528z"/>
                </svg>
                <span className="text-sm">Home</span>
              </li>

              <li>
                <div
                  onClick={() => setIsDashboardOpen(!isDashboardOpen)}
                  className={`flex items-center justify-between px-3 py-2.5 cursor-pointer rounded-xl transition-colors ${
                    isDashboardOpen ? 'bg-red-50 text-red-700' : 'text-gray-500 hover:bg-red-50 hover:text-red-700'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1v-4zM14 5a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1V5zM14 13a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z" />
                    </svg>
                    <span className="text-sm font-medium">Dashboard</span>
                  </div>
                  <svg className={`w-4 h-4 transition-transform duration-200 ${isDashboardOpen ? 'rotate-90' : ''}`}
                       fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>

                {isDashboardOpen && (
                  <ul className="mt-1 mb-2 space-y-0.5 pl-4">
                    {menus.map((item) => (
                      <li
                        key={item.name}
                        onClick={() => setActiveMenu(item.name)}
                        className={`group flex items-center justify-between py-2 pl-4 pr-3 rounded-xl cursor-pointer text-sm transition-all ${
                          activeMenu === item.name
                            ? 'text-red-700 font-semibold bg-red-50'
                            : 'text-gray-500 hover:text-red-700 hover:bg-red-50/60'
                        }`}
                      >
                        <span>{item.name}</span>
                        <button
                          onClick={(e) => toggleBookmark(e, item.name)}
                          className="p-1 hover:bg-red-100 rounded-lg transition-colors"
                        >
                          {item.isBookmarked ? (
                            <svg className="w-3.5 h-3.5 text-red-600" fill="currentColor" viewBox="0 0 24 24">
                              <path fillRule="evenodd" d="M5 4a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 20V4z" clipRule="evenodd" />
                            </svg>
                          ) : (
                            <svg className="w-3.5 h-3.5 text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity"
                                 fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                    d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                            </svg>
                          )}
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            </ul>
          </div>
        </div>

        <div className="p-4">
          <div className="rounded-2xl p-4 text-white text-xs"
               style={{ background: "linear-gradient(135deg, #F59E0B, #EF4444)" }}>
            <p className="font-semibold mb-1">xPlore Pro</p>
            <p className="text-white/70 mb-3">Unlock full data access & analytics.</p>
            <button className="bg-white text-red-700 font-semibold text-xs px-3 py-1.5 rounded-lg hover:bg-red-50 transition-colors">
              Upgrade
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}