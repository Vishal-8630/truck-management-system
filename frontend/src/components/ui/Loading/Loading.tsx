const Loading = () => {
  return (
    <div className="fixed inset-0 bg-white/60 backdrop-blur-md z-[99999] flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="relative">
          <div className="w-16 h-16 rounded-full border-4 border-indigo-100"></div>
          <div className="w-16 h-16 rounded-full border-4 border-indigo-600 border-t-transparent animate-spin absolute top-0 left-0"></div>
        </div>
        <p className="text-indigo-600 font-bold tracking-widest uppercase text-sm animate-pulse">
          Loading
        </p>
      </div>
    </div>
  );
};

export default Loading;

