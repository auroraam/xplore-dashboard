import React, { useState } from 'react';
import Sidebar from '../components/sidebar';
import FilterBar from '../components/filterBar';
import DashboardContent from '../components/dashboard';
import DashboardSentimen from '@/components/sentimen';
import DashboardAktor from '@/components/aktor';
import DashboardBerita from '@/components/berita';
import DashboardTren from '@/components/tren';
import LandingPage from '@/components/home';

export default function DashboardHome() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [activeOrg, setActiveOrg] = useState('Main Org.');
  const [activeMenu, setActiveMenu] = useState('Home');
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [showPlans, setShowPlans] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [searchInput, setSearchInput] = useState("");
  const [luceneQuery, setLuceneQuery] = useState("*");

  const [organizations, setOrganizations] = useState([
    { name: 'Main Org.', role: 'Guest' }
    // { name: 'Softplay', role: 'Paid Member' } // Bawaan awal (nanti bisa kamu kosongkan kalau mau default-nya belum login)
  ]);

  const handleLoginSubmit = (e) => {
    e.preventDefault();
    
    // Ambil nilai dari input
    const email = e.target[0].value;
    const password = e.target[1].value;

    // Cek pura-pura credential-nya
    if (email === "admin@gmail.com" && password === "12345") {
      setShowLogin(false);
      handleSimulateLogin();
    } else {
      alert("Email atau password salah! (Coba: admin@gmail.com / 12345)");
    }
  };
  
  const handleSimulateLogin = () => {
    setOrganizations([
      { name: 'Main Org.', role: 'Guest' },
      { name: 'softplay', role: 'Paid Member' }
    ]);
    // 2. Set akun aktif ke Paid Member
    setActiveOrg('softplay'); // Mengubah organisasi otomatis mengubah role menjadi Editor!
  };

  const [filters, setFilters] = useState({
    from: "now-7d",
    to: "now",
    topik: "$__all",
    sentimen: "$__all",
    sdg: "$__all",
    lucene: "*",
  });

  const handleSearch = (e) => {
    if (e.key === 'Enter') {
      const query = searchInput.trim() === "" ? "*" : searchInput;
      setFilters(prev => ({ ...prev, lucene: query }));
    }
  };

  const currentUserRole = organizations.find((org) => org.name === activeOrg)?.role || 'Guest';

  const renderActiveTab = () => {
    switch (activeMenu) {
      case 'Home':
        //return <LandingPage setActiveMenu={setActiveMenu} />;
      case 'Utama':
        return <DashboardContent filters={filters} userRole={currentUserRole} onOpenPlans={() => setShowPlans(true)} onOpenLogin={() => setShowLogin(true)} />;
      case 'Sentimen':
        return <DashboardSentimen filters={filters} userRole={currentUserRole} onSimulateLogin={handleSimulateLogin} />;
      case 'Aktor & Jaringan':
        return <DashboardAktor filters={filters} userRole={currentUserRole} onSimulateLogin={handleSimulateLogin} />;
      case 'Tren Isu':
        return <DashboardTren filters={filters} userRole={currentUserRole} onSimulateLogin={handleSimulateLogin} />;
      case 'Sumber Media':
        return <DashboardBerita filters={filters} userRole={currentUserRole} onSimulateLogin={handleSimulateLogin} />;
      default:
        return <DashboardContent filters={filters} userRole={currentUserRole} onSimulateLogin={handleSimulateLogin} />;
    }
  };

  console.log("STATUS RENDER: activeMenu saat ini adalah ->", activeMenu);

  return (
      <div className="flex h-screen print:!block print:!h-auto print:!overflow-visible print:bg-white bg-gray-50 font-sans">
        <div className='print:hidden'>
          <Sidebar isOpen={isSidebarOpen} activeMenu={activeMenu} setActiveMenu={setActiveMenu} /* ...props */ />
        </div>
        
        <div className="flex-1 flex flex-col overflow-hidden print:!block print:!h-auto print:!overflow-visible">
  
          <div className="flex items-center justify-between px-6 py-3 bg-white border-b border-gray-100 print:hidden">
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
              <div className="flex items-center bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 w-56 focus-within:border-violet-400 focus-within:ring-2 focus-within:ring-violet-100 transition-all">
                <svg className="w-4 h-4 text-gray-400 mr-2 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input 
                  type="text" 
                  placeholder="Search..." 
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  onKeyDown={handleSearch}
                  className="bg-transparent border-none outline-none text-sm w-full text-gray-700 placeholder-gray-400" 
                />
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
                    <p className="text-xs text-gray-400 mt-0.5">
                      {currentUserRole}
                    </p>
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
                      <li 
                        onClick={() => {
                          setActiveOrg('Main Org.'); // 1. Kembalikan status menjadi Guest
                          setOrganizations([{ name: 'Main Org.', role: 'Guest' }]); // 2. Hapus akun Paid Member dari list!
                          setIsProfileOpen(false);   // 3. Tutup menu pop-up profil
                        }}
                        className="flex items-center gap-3 px-4 py-2 hover:bg-red-50 cursor-pointer transition-colors text-red-500 hover:text-red-600 text-sm list-none"
                      >
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
  
          <div className="flex-1 overflow-auto print:!block print:!h-auto print:!overflow-visible print:bg-white bg-slate-50 relative">
            <div className="absolute top-0 left-0 w-full h-24"
              style={{ background: "linear-gradient(45deg, #7C3AED, #A78BFA)"}}
            ></div>

            {/* Konten Utama (z-10 agar posisinya di atas banner) */}
            <div className="relative z-10">
              {renderActiveTab()}
            </div>
          </div>
        </div>

        {/* --- MODAL LOGIN --- */}
        {showLogin && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 text-left animate-in fade-in zoom-in-95">
              <div className="flex justify-between items-center mb-5">
                <h3 className="text-xl font-bold text-slate-800">Masuk ke Akun</h3>
                <button onClick={() => setShowLogin(false)} className="text-slate-400 hover:text-slate-600">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>

              <form onSubmit={handleLoginSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                  <input type="email" required placeholder="email@perusahaan.com" className="w-full border border-slate-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none placeholder-slate-500 text-black" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
                  <input type="password" required placeholder="••••••••" className="w-full border border-slate-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none placeholder-slate-500 text-black" />
                </div>
                <button type="submit" className="w-full bg-slate-800 text-white font-medium rounded-lg px-4 py-2.5 hover:bg-slate-900 transition-colors mt-2">
                  Masuk
                </button>
              </form>
            </div>
          </div>
        )}


        {/* --- MODAL PRICING PLANS --- */}
        {showPlans && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl p-8 animate-in fade-in zoom-in-95">

              <div className="flex justify-between items-center mb-8">
                <div>
                  <h3 className="text-2xl font-bold text-slate-800">Pilih Paket Langganan</h3>
                  <p className="text-slate-500 text-sm mt-1">Buka semua fitur analitik premium kami.</p>
                </div>
                <button onClick={() => setShowPlans(false)} className="p-2 bg-slate-100 rounded-full text-slate-500 hover:text-slate-800">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>

              {/* Grid Kartu Pricing */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">

                {/* Plan 1 */}
                <div className="border border-slate-200 rounded-2xl p-6 hover:border-indigo-400 transition-colors bg-slate-50">
                  <h4 className="text-lg font-semibold text-slate-800">Pro Analytics</h4>
                  <div className="mt-2 mb-4">
                    <span className="text-3xl font-bold text-black">Rp 499k</span><span className="text-slate-500">/bln</span>
                  </div>
                  <ul className="space-y-3 mb-6 text-sm text-slate-600">
                    <li className="flex gap-2"><span>✅</span> Akses Peta Aktor Penuh</li>
                    <li className="flex gap-2"><span>✅</span> Kustomisasi Dashboard</li>
                    <li className="flex gap-2"><span>✅</span> Export Data (CSV/PDF)</li>
                  </ul>
                  <button className="w-full py-2 border border-slate-300 rounded-lg font-medium text-slate-700 hover:bg-slate-100">
                    Pilih Paket Pro
                  </button>
                </div>

                {/* Plan 2 (Rekomendasi) */}
                <div className="border-2 border-indigo-500 rounded-2xl p-6 relative bg-white shadow-lg transform md:-translate-y-2">
                  <div className="absolute top-0 right-6 -translate-y-1/2 bg-indigo-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                    Paling Populer
                  </div>
                  <h4 className="text-lg font-semibold text-indigo-600">Enterprise</h4>
                  <div className="mt-2 mb-4">
                    <span className="text-3xl font-bold text-black">Rp 1.2M</span><span className="text-slate-500">/bln</span>
                  </div>
                  <ul className="space-y-3 mb-6 text-sm text-slate-600">
                    <li className="flex gap-2"><span>✅</span> Semua Fitur Pro</li>
                    <li className="flex gap-2"><span>✅</span> Data Real-time Twitter & Berita</li>
                    <li className="flex gap-2"><span>✅</span> AI Sentimen Analisis</li>
                  </ul>
                  <button 
                    onClick={() => {
                      setShowPlans(false); // Tutup pop-up harga
                      setShowSuccess(true); // Buka pop-up berhasil
                    }}
                    className="w-full py-2 bg-indigo-500 rounded-lg font-medium text-white hover:bg-indigo-600 shadow-md"
                  >
                    Hubungi Sales
                  </button>
                </div>

              </div>
            </div>
          </div>
        )}

        {/* --- MODAL DAFTAR BERHASIL --- */}
        {showSuccess && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm p-8 text-center animate-in fade-in zoom-in-95">

              {/* Ikon Pesta/Berhasil */}
              <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-5 text-3xl">
                🎉
              </div>

              <h3 className="text-xl font-bold text-slate-800 mb-2">Selamat Bergabung!</h3>
              <p className="text-sm text-slate-500 mb-6 leading-relaxed">
                Anda telah terdaftar di paket <span className="font-semibold text-slate-700">Enterprise</span>. Berikut adalah detail akun Anda:
              </p>

              {/* Kotak Username & Password */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 text-left mb-6 space-y-3">
                <div>
                  <span className="text-xs text-slate-400 font-medium uppercase tracking-wider">Email / Username</span>
                  <p className="font-semibold text-slate-800 mt-0.5">admin@gmail.com</p>
                </div>
                <div>
                  <span className="text-xs text-slate-400 font-medium uppercase tracking-wider">Password</span>
                  <p className="font-semibold text-slate-800 mt-0.5">12345</p>
                </div>
              </div>

              {/* Tombol yang langsung otomatis login */}
              <button 
                onClick={() => {
                  setShowSuccess(false);
                  handleSimulateLogin(); // Langsung eksekusi login!
                }}
                className="w-full bg-slate-800 text-white font-medium rounded-xl px-4 py-3 hover:bg-slate-900 transition-colors shadow-md"
              >
                Masuk Sekarang
              </button>
              
            </div>
          </div>
        )}

        {isHelpOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
            <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl flex flex-col max-h-[85vh] animate-in fade-in zoom-in duration-200">

              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                <h3 className="text-lg font-semibold text-gray-800">Panduan Penggunaan Dashboard</h3>
                <button 
                  onClick={() => setIsHelpOpen(false)}
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="px-6 py-4 overflow-y-auto text-gray-600 text-sm space-y-4">
                <p>
                  Selamat datang di antarmuka analitik berita. Anda dapat menggunakan panel ini untuk menyaring ratusan ribu data berita dari Elasticsearch secara <span className="italic">real-time</span>.
                </p>

                <div>
                  <h4 className="font-semibold text-gray-800 mb-1">1. Pencarian Kata Kunci</h4>
                  <ul className="list-disc pl-5 space-y-1">
                    <li>Gunakan bilah pencarian (bawaan <code className="bg-gray-100 px-1 rounded">*</code>) untuk mencari konten berita spesifik. Hasil pencarian akan memperbarui seluruh panel secara otomatis.</li>
                    <li>Contoh kueri bebas: <code className="bg-gray-100 px-1 rounded">Jokowi OR Anies</code> (pencarian di seluruh kolom).</li>
                    <li>Contoh kueri spesifik: <code className="bg-gray-100 px-1 rounded">title: Jokowi OR Anies</code> (pencarian khusus pada kolom judul).</li>
                    <li>Panduan sintaks pencarian lengkap (Lucene) dapat diakses melalui: <a href="http://ugm.id/cari" target="_blank" rel="noopener noreferrer" className="text-[#7C3AED] hover:underline">http://ugm.id/cari</a>.</li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-800 mb-1">2. Penyaringan Data (Filter)</h4>
                  <p>
                    Anda dapat memfilter berita berdasarkan waktu, topik, target SDG, dan klasifikasi yang diproses oleh <span className="italic">machine learning</span>. Setiap penyesuaian filter akan langsung memengaruhi data pada seluruh panel visualisasi.
                  </p>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-800 mb-1">3. AI Insight</h4>
                  <p>
                    Sistem dilengkapi dengan agen AI yang akan merangkum poin-poin penting dari data yang sedang Anda lihat. Hasil rangkuman akan di-cache untuk mempercepat pemuatan ulang.
                  </p>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-800 mb-1">4. Unduh Data (CSV)</h4>
                  <ul className="list-disc pl-5 space-y-1">
                    <li>Untuk mengekspor data metrik tertentu, klik <strong>Judul panel &gt; Inspect &gt; Data &gt; Download CSV</strong>.</li>
                    <li>Untuk melihat struktur kolom paling lengkap (berguna sebagai acuan saat pencarian), silakan merujuk pada panel <strong>Raw Data</strong>.</li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-800 mb-1">5. Ketersediaan Data</h4>
                  <ul className="list-disc pl-5 space-y-1">
                    <li>Dashboard ini memuat data dari rentang waktu 2 bulan kalender terakhir.</li>
                    <li>Untuk mengakses riwayat data penuh (termasuk data Twitter yang dikumpulkan sejak 2018), silakan gunakan dashboard <strong>Media Analytic Full</strong>.</li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-800 mb-1">6. Lisensi & Bantuan</h4>
                  <ul className="list-disc pl-5 space-y-1">
                    <li><strong>Lisensi:</strong> Creative Commons BY-NC.</li>
                    <li><strong>Kontak:</strong> <a href="mailto:bigdata@ugm.ac.id" className="text-[#7C3AED] hover:underline">bigdata@ugm.ac.id</a>.</li>
                  </ul>
                </div>
              </div>

              <div className="px-6 py-4 border-t border-gray-100 flex justify-end">
                <button 
                  onClick={() => setIsHelpOpen(false)}
                  className="px-4 py-2 bg-[#7C3AED] hover:bg-[#6D28D9] text-white text-sm font-medium rounded-lg transition-colors"
                >
                  Mengerti
                </button>
              </div>

            </div>
          </div>
        )}

      </div>
    );
}