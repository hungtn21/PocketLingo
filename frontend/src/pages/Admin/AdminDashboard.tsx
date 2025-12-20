import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, CartesianGrid, LineChart, Line } from 'recharts';
import { Search } from 'lucide-react';
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
    const navigate = useNavigate();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [stats, setStats] = useState<OverviewStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [learningStats, setLearningStats] = useState<{ total_sessions: number, quiz_attempts: number, flashcard_sessions: number } | null>(null);
    const [loadingLearning, setLoadingLearning] = useState(true);

    // State cho biểu đồ theo thời gian
    const [chartType, setChartType] = useState<'all' | 'quiz' | 'flashcard'>('all');
    const [granularity, setGranularity] = useState<'day' | 'week' | 'month'>('day');
    const [dateRange, setDateRange] = useState<{ start: string, end: string }>(() => {
        const end = new Date();
        const start = new Date();
        start.setDate(end.getDate() - 30);
        return {
            start: start.toISOString().slice(0, 10),
            end: end.toISOString().slice(0, 10),
        };
    });
    const [chartData, setChartData] = useState<{ period: string, count: number }[]>([]);
    const [loadingChart, setLoadingChart] = useState(false);

    // State cho bảng thống kê khóa học
    const [courses, setCourses] = useState<any[]>([]);
    const [loadingCourses, setLoadingCourses] = useState(false);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [search, setSearch] = useState("");

    useEffect(() => {
        const fetchChartData = async () => {
            setLoadingChart(true);
            try {
                const res = await api.get('/admins/stats/learning-sessions-over-time/', {
                    params: {
                        start: dateRange.start,
                        end: dateRange.end,
                        granularity,
                        type: chartType,
                    },
                });
                setChartData(res.data.data || []);
            } catch (err) {
                setChartData([]);
            } finally {
                setLoadingChart(false);
            }
        };
        fetchChartData();
    }, [chartType, granularity, dateRange]);

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
        const fetchLearningStats = async () => {
            try {
                const response = await api.get('/admins/stats/total-learning-sessions/');
                setLearningStats(response.data);
            } catch (error) {
                console.error('Error fetching learning stats:', error);
            } finally {
                setLoadingLearning(false);
            }
        };
        const fetchCourses = async (targetPage = 1) => {
            setLoadingCourses(true);
            try {
                const res = await api.get('/admins/stats/courses/', {
                    params: { 
                        page: targetPage, 
                        page_size: 10, 
                        search: search.trim() || undefined
                    },
                });
                setCourses(res.data.results || []);
                setPage(res.data.page || targetPage);
                setTotalPages(Math.ceil(res.data.total / 10));
            } catch (e: any) {
                console.error('Error fetching courses:', e);
            } finally {
                setLoadingCourses(false);
            }
        };
        fetchStats();
        fetchLearningStats();
        fetchCourses();
    }, []);

    useEffect(() => {
        const fetchCourses = async () => {
            setLoadingCourses(true);
            try {
                const res = await api.get('/admins/stats/courses/', {
                    params: { 
                        page: 1, 
                        page_size: 10, 
                        search: search.trim() || undefined
                    },
                });
                setCourses(res.data.results || []);
                setPage(1);
                setTotalPages(Math.ceil(res.data.total / 10));
            } catch (e: any) {
                console.error('Error fetching courses:', e);
            } finally {
                setLoadingCourses(false);
            }
        };
        fetchCourses();
    }, [search]);

    const formatScore = (score: number) => {
        return score.toFixed(2);
    };

    const formatPercentage = (rate: number) => {
        return `${rate}%`;
    };

    const handleSearch = () => {
        // Search is handled in useEffect
    };

    const handlePageChange = async (targetPage: number) => {
        setLoadingCourses(true);
        try {
            const res = await api.get('/admins/stats/courses/', {
                params: { 
                    page: targetPage, 
                    page_size: 10, 
                    search: search.trim() || undefined
                },
            });
            setCourses(res.data.results || []);
            setPage(targetPage);
        } catch (e: any) {
            console.error('Error fetching courses:', e);
        } finally {
            setLoadingCourses(false);
        }
    };

    return (
        <div className="admin-dashboard-page">
            <style>{`
                .table-custom-header th {
                    background-color: #5E3C86 !important;
                    color: white !important;
                }
            `}</style>
            <AdminHeader onHamburgerClick={() => setIsSidebarOpen(!isSidebarOpen)} />
            <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
            <div className="container-fluid px-2" style={{ marginTop: '40px', maxWidth: '900px', margin: '20px auto 0' }}>
                {loading ? (
                    <div className="text-center">
                        <div className="spinner-border text-primary" role="status">
                            <span className="visually-hidden">Loading...</span>
                        </div>
                    </div>
                ) : (
                    <div>
                        {/* Top row: 3 cards */}
                        <div className="row g-3 justify-content-center" style={{ marginBottom: '10px' }}>
                            <div className="col-md-4 d-flex justify-content-center">
                                <div className="card text-center h-100 w-100" style={{ backgroundColor: '#f8f9fa', border: 'none', minHeight: '120px', boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)', borderRadius: '12px' }}>
                                    <div className="card-body p-3 d-flex flex-column justify-content-center">
                                        <h6 className="card-title text-muted mb-3" style={{ fontSize: '0.9rem' }}>Tổng số học viên</h6>
                                        <h2 className="fw-bold mb-0" style={{ color: '#5E3C86', fontSize: '2.2rem' }}>{stats?.total_learners || 0}</h2>
                                    </div>
                                </div>
                            </div>
                            <div className="col-md-4 d-flex justify-content-center">
                                <div className="card text-center h-100 w-100" style={{ backgroundColor: '#f8f9fa', border: 'none', minHeight: '120px', boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)', borderRadius: '12px' }}>
                                    <div className="card-body p-3 d-flex flex-column justify-content-center">
                                        <h6 className="card-title text-muted mb-3" style={{ fontSize: '0.9rem' }}>Tổng số khóa học</h6>
                                        <h2 className="fw-bold mb-0" style={{ color: '#5E3C86', fontSize: '2.2rem' }}>{stats?.total_courses || 0}</h2>
                                    </div>
                                </div>
                            </div>
                            <div className="col-md-4 d-flex justify-content-center">
                                <div className="card text-center h-100 w-100" style={{ backgroundColor: '#f8f9fa', border: 'none', minHeight: '120px', boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)', borderRadius: '12px' }}>
                                    <div className="card-body p-3 d-flex flex-column justify-content-center">
                                        <h6 className="card-title text-muted mb-3" style={{ fontSize: '0.9rem' }}>Tổng số bài học</h6>
                                        <h2 className="fw-bold mb-0" style={{ color: '#5E3C86', fontSize: '2.2rem' }}>{stats?.total_lessons || 0}</h2>
                                    </div>
                                </div>
                            </div>
                        </div>
                        {/* Bottom row: 2 cards, same size as above, centered */}
                        <div className="row g-3 justify-content-center" style={{ marginTop: '10px' }}>
                            <div className="col-md-4 d-flex justify-content-center">
                                <div className="card text-center h-100 w-100" style={{ backgroundColor: '#f8f9fa', border: 'none', minHeight: '120px', boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)', borderRadius: '12px' }}>
                                    <div className="card-body p-3 d-flex flex-column justify-content-center">
                                        <h6 className="card-title text-muted mb-3" style={{ fontSize: '0.9rem' }}>Điểm trung bình quiz</h6>
                                        <h2 className="fw-bold mb-0" style={{ color: '#5E3C86', fontSize: '2.2rem' }}>{stats ? formatScore(stats.avg_quiz_score) : '0.00'}</h2>
                                    </div>
                                </div>
                            </div>
                            <div className="col-md-4 d-flex justify-content-center">
                                <div className="card text-center h-100 w-100" style={{ backgroundColor: '#f8f9fa', border: 'none', minHeight: '120px', boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)', borderRadius: '12px' }}>
                                    <div className="card-body p-3 d-flex flex-column justify-content-center">
                                        <h6 className="card-title text-muted mb-3" style={{ fontSize: '0.9rem' }}>Tỉ lệ hoàn thành khóa học</h6>
                                        <h2 className="fw-bold mb-0" style={{ color: '#5E3C86', fontSize: '2.2rem' }}>{stats ? formatPercentage(stats.course_completion_rate) : '0%'}</h2>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Biểu đồ lượt học theo thời gian */}
                        <div className="row justify-content-center" style={{ margin: '30px 0' }}>
                            <div className="col-12" style={{ maxWidth: '1200px' }}>
                                <div className="card p-4" style={{ background: '#fff', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.07)' }}>
                                    <h4 className="mb-2 fw-bold" style={{ color: '#5E3C86', fontWeight: 700 }}>Biểu đồ lượt học theo thời gian</h4>
                                    <div className="d-flex flex-wrap align-items-center mb-3 gap-2">
                                        <select className="form-select w-auto" value={chartType} onChange={e => setChartType(e.target.value as any)}>
                                            <option value="all">Tổng</option>
                                            <option value="quiz">Làm quiz</option>
                                            <option value="flashcard">Học flashcard</option>
                                        </select>
                                        <select className="form-select w-auto" value={granularity} onChange={e => setGranularity(e.target.value as any)}>
                                            <option value="day">Theo ngày</option>
                                            <option value="week">Theo tuần</option>
                                            <option value="month">Theo tháng</option>
                                        </select>
                                        <input type="date" className="form-control w-auto" value={dateRange.start} max={dateRange.end} onChange={e => setDateRange(r => ({ ...r, start: e.target.value }))} />
                                        <span className="mx-1">-</span>
                                        <input type="date" className="form-control w-auto" value={dateRange.end} min={dateRange.start} onChange={e => setDateRange(r => ({ ...r, end: e.target.value }))} />
                                    </div>
                                    <div style={{ width: 870, maxWidth: '100%', margin: '0 auto' }}>
                                        {loadingChart ? (
                                            <div className="text-center">Đang tải biểu đồ...</div>
                                        ) : (
                                            <ResponsiveContainer width="100%" height={350}>
                                                <LineChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                                                    <CartesianGrid strokeDasharray="3 3" />
                                                    <XAxis dataKey="period" tickFormatter={d => d?.slice(0, 10)} />
                                                    <YAxis allowDecimals={false} />
                                                    <Tooltip labelFormatter={d => `Ngày: ${d?.slice(0, 10)}`} />
                                                    <Legend />
                                                    <Line type="monotone" dataKey="count" stroke="#5E3C86" strokeWidth={3} dot={{ r: 4 }} />
                                                </LineChart>
                                            </ResponsiveContainer>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                    {/* Thống kê chi tiết theo khóa học */}
                    <div className="row justify-content-center" style={{ margin: '0 0 40px 0' }}>
                        <div className="col-12" style={{ maxWidth: '1200px' }}>
                            <div className="card p-4" style={{ background: '#fff', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.07)', marginTop: 24 }}>
                                <h4 className="mb-3 fw-bold" style={{ color: '#5E3C86', fontWeight: 700 }}>Thống kê chi tiết theo khóa học</h4>
                                
                                <div className="d-flex align-items-center mb-3" style={{ gap: 10 }}>
                                    <div className="d-flex align-items-center" style={{ border: "1px solid #e0e0e0", borderRadius: 24, padding: "6px 10px", width: 300, background: "#f5f6f8", height: 40 }}>
                                        <Search size={18} color="#777" style={{ marginRight: 6 }} />
                                        <input
                                            type="text"
                                            placeholder="Nhập tên khóa học"
                                            className="form-control"
                                            value={search}
                                            onChange={(e) => setSearch(e.target.value)}
                                            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                                            style={{ border: "none", background: "transparent", boxShadow: "none", height: 28 }}
                                        />
                                    </div>
                                </div>

                                {loadingCourses ? (
                                    <div className="text-center py-4">Đang tải...</div>
                                ) : (
                                    <div className="card shadow-sm" style={{ borderRadius: 12, overflow: "hidden", border: "1px solid #e7e7e7", borderTop: "4px solid #5E3C86" }}>
                                        <div className="table-responsive">
                                            <table className="table mb-0 align-middle">
                                                <thead className="table-custom-header">
                                                    <tr>
                                                        <th style={{ backgroundColor: "#5E3C86", color: "white", fontWeight: 700, fontSize: "0.9rem", borderBottom: "none", width: 60 }}>STT</th>
                                                        <th style={{ backgroundColor: "#5E3C86", color: "white", fontWeight: 700, fontSize: "0.9rem", borderBottom: "none" }}>Tên khóa học</th>
                                                        <th style={{ backgroundColor: "#5E3C86", color: "white", fontWeight: 700, fontSize: "0.9rem", borderBottom: "none", textAlign: "center" }}>Tổng số lượt học</th>
                                                        <th style={{ backgroundColor: "#5E3C86", color: "white", fontWeight: 700, fontSize: "0.9rem", borderBottom: "none", textAlign: "center" }}>Tỷ lệ hoàn thành</th>
                                                        <th style={{ backgroundColor: "#5E3C86", color: "white", fontWeight: 700, fontSize: "0.9rem", borderBottom: "none", textAlign: "center" }}>Điểm trung bình</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {courses.length === 0 ? (
                                                        <tr><td colSpan={5} className="text-center py-4">Không có khóa học nào</td></tr>
                                                    ) : (
                                                        courses.map((c, idx) => (
                                                            <tr key={c.id}>
                                                                <td>{(page - 1) * 10 + idx + 1}</td>
                                                                <td className="fw-semibold">
                                                                    <span
                                                                        style={{ cursor: 'pointer', color: 'inherit', textDecoration: 'none' }}
                                                                        onClick={() => navigate(`/admin/courses/${c.id}`)}
                                                                        title="Xem chi tiết khóa học"
                                                                    >
                                                                        {c.title}
                                                                    </span>
                                                                </td>
                                                                <td className="text-center">{c.attempts_count}</td>
                                                                <td className="text-center">{c.completion_rate}%</td>
                                                                <td className="text-center">{c.avg_score.toFixed(2)}</td>
                                                            </tr>
                                                        ))
                                                    )}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                )}
                                
                                {/* Pagination */}
                                {totalPages > 1 && (
                                    <div className="d-flex justify-content-center mt-4 gap-2">
                                        {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                                            <button 
                                                key={p} 
                                                className={`btn btn-sm ${p === page ? 'btn-primary' : 'btn-light'}`}
                                                style={p === page ? { backgroundColor: "#5E3C86", borderColor: "#5E3C86" } : {}}
                                                onClick={() => handlePageChange(p)}
                                            >
                                                {p}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    </div>
);
}

export default AdminDashboard;
