import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import axios from '../../api/Config';
import Navbar from '../../components/navbar';
import Foot from '../../components/Foot';
import { MessageSquare, CheckCircle, XCircle, Star } from 'lucide-react';

function ReviewsModeration() {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated || user?.role !== 'ADMIN') {
      alert('Access denied. Admin privileges required.');
      navigate('/');
      return;
    }
    fetchPendingReviews();
  }, [isAuthenticated, user, navigate]);

  const fetchPendingReviews = async () => {
    try {
      const response = await axios.get('/admin/reviews/pending');
      setReviews(response.data);
    } catch (error) {
      console.error('Failed to fetch pending reviews:', error);
      alert('Failed to load pending reviews');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (reviewId) => {
    try {
      await axios.put(`/admin/reviews/${reviewId}/approve`);
      alert('Review approved successfully');
      fetchPendingReviews();
    } catch (error) {
      console.error('Failed to approve review:', error);
      alert(error.response?.data?.message || 'Failed to approve review');
    }
  };

  const handleReject = async (reviewId) => {
    if (!confirm('Are you sure you want to reject this review?')) return;

    try {
      await axios.put(`/admin/reviews/${reviewId}/reject`);
      alert('Review rejected successfully');
      fetchPendingReviews();
    } catch (error) {
      console.error('Failed to reject review:', error);
      alert(error.response?.data?.message || 'Failed to reject review');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="loading loading-spinner loading-lg"></div>
      </div>
    );
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-base-200 py-8">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-4xl font-bold flex items-center gap-2">
              <MessageSquare size={40} />
              Reviews Moderation
            </h1>
            <button
              className="btn btn-ghost"
              onClick={() => navigate('/admin')}
            >
              ← Back to Dashboard
            </button>
          </div>

          <div className="stats shadow mb-8">
            <div className="stat">
              <div className="stat-title">Pending Reviews</div>
              <div className="stat-value text-warning">{reviews.length}</div>
              <div className="stat-desc">Awaiting moderation</div>
            </div>
          </div>

          {reviews.length === 0 ? (
            <div className="card bg-base-100 shadow-xl">
              <div className="card-body text-center">
                <CheckCircle size={64} className="mx-auto text-success mb-4" />
                <h2 className="card-title justify-center">No Pending Reviews</h2>
                <p>All reviews have been moderated. Great job!</p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {reviews.map((review) => (
                <div key={review.id} className="card bg-base-100 shadow-xl">
                  <div className="card-body">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h2 className="card-title">{review.company.name}</h2>
                          <div className="badge badge-warning">{review.status}</div>
                        </div>
                        
                        <div className="flex items-center gap-2 mb-3">
                          <div className="flex items-center">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                size={20}
                                className={i < review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}
                              />
                            ))}
                          </div>
                          <span className="font-semibold">{review.rating}/5</span>
                        </div>

                        <p className="text-base mb-4">{review.comment}</p>

                        <div className="flex gap-4 text-sm text-base-content/70">
                          <div>
                            <span className="font-semibold">By:</span> {review.user.username} ({review.user.email})
                          </div>
                          <div>
                            <span className="font-semibold">Context:</span>{' '}
                            <span className="badge badge-sm">{review.context}</span>
                          </div>
                          <div>
                            <span className="font-semibold">Date:</span>{' '}
                            {new Date(review.createdAt).toLocaleString()}
                          </div>
                        </div>

                        {review.upvotes > 0 || review.downvotes > 0 ? (
                          <div className="mt-2 text-sm">
                            <span className="font-semibold">Votes:</span>{' '}
                            <span className="text-success">↑ {review.upvotes}</span>
                            {' / '}
                            <span className="text-error">↓ {review.downvotes}</span>
                          </div>
                        ) : null}
                      </div>

                      <div className="flex gap-2">
                        <button
                          className="btn btn-success gap-2"
                          onClick={() => handleApprove(review.id)}
                        >
                          <CheckCircle size={20} />
                          Approve
                        </button>
                        <button
                          className="btn btn-error gap-2"
                          onClick={() => handleReject(review.id)}
                        >
                          <XCircle size={20} />
                          Reject
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      <Foot />
    </>
  );
}

export default ReviewsModeration;
