const BottomBar = () => {
  return (
    <div className="bg-slate-900 text-white py-12 px-6">
      <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-8 items-center">
        <div className="flex flex-col gap-4">
          <h2 className="text-2xl font-bold flex items-center gap-2 italic">
            <span className="text-indigo-400">Divyanshi</span> Road Lines
          </h2>
          <p className="text-slate-400 max-w-sm text-sm leading-relaxed">
            Your trusted partner in logistics and supply chain management across India.
          </p>
        </div>
        <div className="flex flex-col md:items-end gap-6 text-sm text-slate-400">
          <div className="flex gap-6">
            <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-white transition-colors">Sitemap</a>
          </div>
          <p>© {new Date().getFullYear()} Divyanshi Road Lines. All rights reserved.</p>
        </div>
      </div>
    </div>
  )
}

export default BottomBar;
