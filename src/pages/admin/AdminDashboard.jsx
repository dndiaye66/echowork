import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import Navbar from '../../components/navbar';
import Foot from '../../components/Foot';

function AdminDashboard() {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated || user?.role !== 'ADMIN') {
      alert('Access denied. Admin privileges required.');
      navigate('/');
    }
  }, [isAuthenticated, user, navigate]);

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-base-200 py-8">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl font-bold mb-8">Admin Dashboard</h1>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div 
              className="card bg-base-100 shadow-xl cursor-pointer hover:shadow-2xl transition-shadow"
              onClick={() => navigate('/admin/companies')}
            >
              <div className="card-body">
                <h2 className="card-title text-2xl">Companies</h2>
                <p>Manage companies, add images, update information</p>
                <div className="card-actions justify-end">
                  <button className="btn btn-primary">Manage</button>
                </div>
              </div>
            </div>

            <div 
              className="card bg-base-100 shadow-xl cursor-pointer hover:shadow-2xl transition-shadow"
              onClick={() => navigate('/admin/job-offers')}
            >
              <div className="card-body">
                <h2 className="card-title text-2xl">Job Offers</h2>
                <p>Create and manage job offers for companies</p>
                <div className="card-actions justify-end">
                  <button className="btn btn-primary">Manage</button>
                </div>
              </div>
            </div>

            <div 
              className="card bg-base-100 shadow-xl cursor-pointer hover:shadow-2xl transition-shadow"
              onClick={() => navigate('/admin/advertisements')}
            >
              <div className="card-body">
                <h2 className="card-title text-2xl">Advertisements</h2>
                <p>Manage advertisements and promotions</p>
                <div className="card-actions justify-end">
                  <button className="btn btn-primary">Manage</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Foot />
    </>
  );
}

export default AdminDashboard;
