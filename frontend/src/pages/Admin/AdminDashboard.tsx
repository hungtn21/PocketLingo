import React, { useState, useEffect } from 'react';
import AdminHeader from '../../component/AdminDashboard/AdminHeader';
import Sidebar from '../../component/Sidebar/Sidebar';
import api from '../../api';

interface OverviewStats {
    total_learners: number;
    total_courses: number;
    total_lessons: number;
    avg_quiz_score: number;
    course_completion_rate: number;
}

const AdminDashboard: React.FC = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [stats, setStats] = useState<OverviewStats | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const response = await api.get('/admins/stats/overview/');
                setStats(response.data);
            } catch (error) {
                console.error('Error fetching stats:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, []);

    const formatScore = (score: number) => {
        return score.toFixed(2);
    };

    const formatPercentage = (rate: number) => {
        return `${rate}%`;
    };

    return (
        <div className="admin-dashboard-page">
            <AdminHeader onHamburgerClick={() => setIsSidebarOpen(!isSidebarOpen)} />
            <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
            
            <div className="container-fluid px-2" style={{ marginTop: '40px', maxWidth: '1400px', margin: '20px auto 0' }}>
                {loading ? (
                    <div className="text-center">
                        <div className="spinner-border text-primary" role="status">
                            <span className="visually-hidden">Loading...</span>
                        </div>
                    </div>
                ) : (
                    <div className="row g-3 justify-content-center">
                        {/* All 5 cards in a single row */}
                        <div className="col-md-6 col-lg-2-4" style={{ flex: '0 0 auto', width: '19%' }}>
                            <div className="card text-center h-100" style={{ 
                                backgroundColor: '#f8f9fa', 
                                border: 'none', 
                                minHeight: '100px',
                                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                                borderRadius: '12px'
                            }}>
                                <div className="card-body p-3 d-flex flex-column justify-content-center">
                                    <h6 className="card-title text-muted mb-3" style={{ fontSize: '0.9rem' }}>Tổng số học viên</h6>
                                    <h2 className="fw-bold mb-0" style={{ color: '#6f42c1', fontSize: '2.2rem' }}>
                                        {stats?.total_learners || 0}
                                    </h2>
                                </div>
                            </div>
                        </div>
                        
                        <div className="col-md-6 col-lg-2-4" style={{ flex: '0 0 auto', width: '19%' }}>
                            <div className="card text-center h-100" style={{ 
                                backgroundColor: '#f8f9fa', 
                                border: 'none', 
                                minHeight: '140px',
                                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                                borderRadius: '12px'
                            }}>
                                <div className="card-body p-3  d-flex flex-column justify-content-center">
                                    <h6 className="card-title text-muted mb-3" style={{ fontSize: '0.9rem' }}>Tổng số khóa học</h6>
                                    <h2 className="fw-bold mb-0" style={{ color: '#6f42c1', fontSize: '2.2rem' }}>
                                        {stats?.total_courses || 0}
                                    </h2>
                                </div>
                            </div>
                        </div>
                        
                        <div className="col-md-6 col-lg-2-4" style={{ flex: '0 0 auto', width: '19%' }}>
                            <div className="card text-center h-100" style={{ 
                                backgroundColor: '#f8f9fa', 
                                border: 'none', 
                                minHeight: '140px',
                                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                                borderRadius: '12px'
                            }}>
                                <div className="card-body p-3 d-flex flex-column justify-content-center">
                                    <h6 className="card-title text-muted mb-3" style={{ fontSize: '0.9rem' }}>Tổng số bài học</h6>
                                    <h2 className="fw-bold mb-0" style={{ color: '#6f42c1', fontSize: '2.2rem' }}>
                                        {stats?.total_lessons || 0}
                                    </h2>
                                </div>
                            </div>
                        </div>
                        
                        <div className="col-md-6 col-lg-2-4" style={{ flex: '0 0 auto', width: '19%' }}>
                            <div className="card text-center h-100" style={{ 
                                backgroundColor: '#f8f9fa', 
                                border: 'none', 
                                minHeight: '140px',
                                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                                borderRadius: '12px'
                            }}>
                                <div className="card-body p-3 d-flex flex-column justify-content-center">
                                    <h6 className="card-title text-muted mb-3" style={{ fontSize: '0.9rem' }}>Điểm trung bình quiz</h6>
                                    <h2 className="fw-bold mb-0" style={{ color: '#6f42c1', fontSize: '2.2rem' }}>
                                        {stats ? formatScore(stats.avg_quiz_score) : '0.00'}
                                    </h2>
                                </div>
                            </div>
                        </div>
                        
                        <div className="col-md-6 col-lg-2-4" style={{ flex: '0 0 auto', width: '19%' }}>
                            <div className="card text-center h-100" style={{ 
                                backgroundColor: '#f8f9fa', 
                                border: 'none', 
                                minHeight: '140px',
                                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                                borderRadius: '12px'
                            }}>
                                <div className="card-body p-3 d-flex flex-column justify-content-center">
                                    <h6 className="card-title text-muted mb-3" style={{ fontSize: '0.9rem' }}>Tỉ lệ hoàn thành khóa học</h6>
                                    <h2 className="fw-bold mb-0" style={{ color: '#6f42c1', fontSize: '2.2rem' }}>
                                        {stats ? formatPercentage(stats.course_completion_rate) : '0%'}
                                    </h2>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminDashboard;
