import { useNavigate } from 'react-router-dom';

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center py-32 text-center gap-8">
      <div className="relative">
        <h1 className="text-[12rem] font-bold text-slate-100 leading-none">404</h1>
        <p className="text-4xl font-bold text-slate-900 absolute inset-0 flex items-center justify-center mt-8">
          Page Not Found
        </p>
      </div>
      <p className="text-slate-500 max-w-md mx-auto text-lg">
        The page you are looking for doesn't exist or has been moved to another route.
      </p>
      <button
        className="btn-primary py-4 px-12 text-lg shadow-indigo-200"
        onClick={() => navigate('/')}
      >
        Return Home
      </button>
    </div>
  )
}

export default NotFound;
