import { Outlet } from 'react-router-dom';

const PagesOutlet = () => {
  return (
    <div className="w-full max-w-7xl mx-auto">
      <Outlet />
    </div>
  )
}

export default PagesOutlet;
