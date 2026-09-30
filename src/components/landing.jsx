import React, { useState } from 'react';

export default function PremiumPaywall({ onSimulateLogin }) {
  const [showLogin, setShowLogin] = useState(false);
  const [showPlans, setShowPlans] = useState(false);

  const [showSuccess, setShowSuccess] = useState(false);

  // Fungsi pura-pura login
  const handleLoginSubmit = (e) => {
  e.preventDefault();
  
  // Ambil nilai dari input
  const email = e.target[0].value;
  const password = e.target[1].value;

  // Cek pura-pura credential-nya
  if (email === "admin@gmail.com" && password === "12345") {
    setShowLogin(false);
    if (onSimulateLogin) onSimulateLogin();
  } else {
    alert("Email atau password salah! (Coba: admin@gmail.com / 12345)");
  }
};

  return (
    <div className="flex flex-col items-center justify-center h-[70vh] bg-white border border-slate-200 rounded-2xl shadow-sm p-8 text-center relative">
      
      {/* --- KONTEN UTAMA PAYWALL --- */}
      <div className="w-20 h-20 bg-purple-50 rounded-full flex items-center justify-center mb-6">
        <span className="text-4xl">🔒</span>
      </div>
      <h2 className="text-2xl font-bold text-slate-800 mb-3">Konten Eksklusif Premium</h2>
      <p className="text-slate-500 max-w-md mb-8 leading-relaxed">
        Fitur Peta Aktor dan Analisis AI Mendalam hanya tersedia untuk pengguna dengan paket langganan. Upgrade akunmu sekarang untuk membuka semua fitur.
      </p>

      <div className="flex gap-4 mb-4">
        <button className="px-6 py-2.5 bg-slate-100 text-slate-700 font-medium rounded-lg hover:bg-slate-200 transition-colors">
          Pelajari Fitur
        </button>
        <button 
          onClick={() => setShowPlans(true)} // Buka pop-up plans
          className="px-6 py-2.5 bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-medium rounded-lg hover:opacity-90 transition-opacity shadow-md"
        >
          Upgrade Sekarang ✨
        </button>
      </div>

      {/* Tombol Teks untuk Login */}
      <button 
        onClick={() => setShowLogin(true)} 
        className="text-sm text-slate-500 hover:text-indigo-500 font-medium transition-colors underline underline-offset-4 mt-2"
      >
        Sudah memiliki akun berbayar? Masuk di sini
      </button>


      {/* --- MODAL LOGIN --- */}
      {showLogin && (
        <div className="fixed inset-0 z-100 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm">
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
        <div className="fixed inset-0 z-100 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl p-6 animate-in fade-in zoom-in-95">
            
            <div className="flex justify-between items-center mb-8">
              <div>
                <h3 className="text-xl font-bold text-slate-800">Pilih Paket Langganan</h3>
                <p className="text-slate-500 text-sm mt-1">Buka semua fitur analitik premium kami.</p>
              </div>
              <button onClick={() => setShowPlans(false)} className="p-2 bg-slate-100 rounded-full text-slate-500 hover:text-slate-800">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>

            {/* Grid Kartu Pricing */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
              
              {/* Plan 1 */}
              {/* Plan 1 */}
                <div className="border border-slate-200 rounded-xl p-5 hover:border-indigo-400 transition-colors bg-slate-50">
                  <h4 className="text-base font-semibold text-slate-800">Pro Analytics</h4>
                  <div className="mt-1 mb-3">
                    <span className="text-2xl font-bold text-black">Rp 499k</span><span className="text-slate-500 text-xs">/bln</span>
                  </div>
                  <ul className="space-y-2 mb-4 text-xs text-slate-600">
                    <li className="flex gap-2"><span>✅</span> Akses Peta Aktor Penuh</li>
                    <li className="flex gap-2"><span>✅</span> Data Real-time Twitter</li>
                  </ul>
                  <button className="w-full py-2 border border-slate-300 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-100">
                    Pilih Paket
                  </button>
                </div>

                {/* Plan 2 */}
                <div className="border-2 border-indigo-500 rounded-xl p-5 relative bg-white shadow-md transform md:-translate-y-1">
                  <div className="absolute top-0 right-4 -translate-y-1/2 bg-indigo-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                    Populer
                  </div>
                  <h4 className="text-base font-semibold text-indigo-600">Enterprise</h4>
                  <div className="mt-1 mb-3">
                    <span className="text-2xl font-bold text-black">Rp 1.2M</span><span className="text-slate-500 text-xs">/bln</span>
                  </div>
                  <ul className="space-y-2 mb-4 text-xs text-slate-600">
                    <li className="flex gap-2"><span>✅</span> Semua Fitur Pro</li>
                    <li className="flex gap-2"><span>✅</span> AI Sentimen Analisis</li>
                  </ul>
                  <button 
                    onClick={() => {
                      setShowPlans(false); 
                      setShowSuccess(true); 
                    }}
                    className="w-full py-2 bg-indigo-500 rounded-lg text-sm font-medium text-white hover:bg-indigo-600 shadow-sm"
                  >
                    Beli Sekarang
                  </button>
                </div>

              </div>
            </div>
        </div>
      )}

      {/* --- MODAL DAFTAR BERHASIL --- */}
      {showSuccess && (
        <div className="fixed inset-0 z-100 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm">
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
                if (onSimulateLogin) onSimulateLogin(); // Langsung eksekusi login!
              }}
              className="w-full bg-slate-800 text-white font-medium rounded-xl px-4 py-3 hover:bg-slate-900 transition-colors shadow-md"
            >
              Masuk Sekarang
            </button>
            
          </div>
        </div>
      )}

    </div>
  );
}