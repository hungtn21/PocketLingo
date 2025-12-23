import React, { useEffect, useState } from "react";
import { Trophy, Crown, Medal } from "lucide-react";
import api from "../../../../api";
import ChristmasLoader from "../../../../component/ChristmasTheme/ChristmasLoader";
import "./LeaderboardTab.css";

interface LeaderboardEntry {
  rank: number;
  user_id: number;
  name: string;
  xp: number;
  is_current_user: boolean;
}

interface LeaderboardData {
  top_users: LeaderboardEntry[];
  my_rank: {
    rank: number;
    name: string;
    xp: number;
  } | null;
}

interface LeaderboardTabProps {
  courses: any[];
}

const LeaderboardTab: React.FC<LeaderboardTabProps> = ({ courses }) => {
  const [selectedCourse, setSelectedCourse] = useState<number | null>(
    courses.length > 0 ? courses[0].course_id : null
  );
  const [leaderboardData, setLeaderboardData] = useState<LeaderboardData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (selectedCourse) {
      fetchLeaderboard(selectedCourse);
    }
  }, [selectedCourse]);

  const fetchLeaderboard = async (courseId: number) => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get(`/leaderboard/?course_id=${courseId}`);
      setLeaderboardData(res.data);
    } catch (err: any) {
      setError(err?.response?.data?.error || "Không thể tải bảng xếp hạng");
    } finally {
      setLoading(false);
    }
  };

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <span style={{ fontSize: '20px' }}>🎄</span>; // Christmas tree for #1
    if (rank === 2) return <span style={{ fontSize: '20px' }}>🎅</span>; // Santa for #2
    if (rank === 3) return <span style={{ fontSize: '20px' }}>🎅</span>; // Santa for #3
    return null;
  };

  if (courses.length === 0) {
    return (
      <div className="leaderboard-empty">
        <Trophy size={64} strokeWidth={1} />
        <h3>Chưa có khóa học</h3>
        <p>Bạn cần đăng ký ít nhất một khóa học để xem bảng xếp hạng.</p>
      </div>
    );
  }

  return (
    <div className="leaderboard-container">
      <div className="leaderboard-header">
        <h3>
          <Trophy size={24} />
          Bảng xếp hạng
        </h3>
        <select
          className="course-select"
          value={selectedCourse || ""}
          onChange={(e) => setSelectedCourse(Number(e.target.value))}
        >
          {courses.map((course) => (
            <option key={course.course_id} value={course.course_id}>
              {course.course_name}
            </option>
          ))}
        </select>
      </div>

      {loading ? (
        <ChristmasLoader size="medium" text="Đang tải bảng xếp hạng..." />
      ) : error ? (
        <div className="leaderboard-error">
          <p>{error}</p>
          <button className="retry-button" onClick={() => selectedCourse && fetchLeaderboard(selectedCourse)}>
            Thử lại
          </button>
        </div>
      ) : leaderboardData && leaderboardData.top_users.length > 0 ? (
        <div className="leaderboard-table-wrapper">
          <table className="leaderboard-table">
            <thead>
              <tr>
                <th>Hạng</th>
                <th>Tên học viên</th>
                <th>Điểm XP</th>
              </tr>
            </thead>
            <tbody>
              {leaderboardData.top_users.map((entry) => (
                <tr
                  key={entry.user_id}
                  className={entry.is_current_user ? "current-user-row" : ""}
                >
                  <td className="rank-cell">
                    <div className="rank-display">
                      {getRankIcon(entry.rank)}
                      <span className={entry.rank <= 3 ? "top-rank" : ""}>
                        #{entry.rank}
                      </span>
                    </div>
                  </td>
                  <td className="name-cell">
                    {entry.is_current_user ? (
                      <strong>{entry.name} (Bạn)</strong>
                    ) : (
                      entry.name
                    )}
                  </td>
                  <td className="xp-cell">
                    <span className="xp-badge">{entry.xp} XP</span>
                  </td>
                </tr>
              ))}
              
              {leaderboardData.my_rank && leaderboardData.my_rank.rank > 20 && (
                <>
                  <tr className="separator-row">
                    <td colSpan={3}>...</td>
                  </tr>
                  <tr className="current-user-row">
                    <td className="rank-cell">
                      <span>#{leaderboardData.my_rank.rank}</span>
                    </td>
                    <td className="name-cell">
                      <strong>{leaderboardData.my_rank.name} (Bạn)</strong>
                    </td>
                    <td className="xp-cell">
                      <span className="xp-badge">{leaderboardData.my_rank.xp} XP</span>
                    </td>
                  </tr>
                </>
              )}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="leaderboard-empty">
          <Trophy size={64} strokeWidth={1} />
          <h3>Chưa có dữ liệu xếp hạng</h3>
          <p>Hãy bắt đầu học và làm bài tập để xuất hiện trên bảng xếp hạng!</p>
        </div>
      )}
    </div>
  );
};

export default LeaderboardTab;
