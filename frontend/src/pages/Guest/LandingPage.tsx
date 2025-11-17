import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import LandingHeader from "../../component/LandingPage/Header";
import CourseCard from "../../component/Homepage/CourseCard";
import "./LandingPage.css";
import HighlightCarousel from "../../component/LandingPage/HighlightCarousel";
import { api } from "../../api";

type Course = {
	id: number;
	title: string;
	image_url?: string;
	lesson_count: number;
	level: string;
	language: string;
	rating: number;
};

const HERO_LOGO_URL =
	"https://res.cloudinary.com/dytfwdgzc/image/upload/v1763300982/logo_pbhiqx.png"; 

const HIGHLIGHTS: { image: string; title: string; desc: string }[] = [
	{
		image:
			"https://res.cloudinary.com/dytfwdgzc/image/upload/v1763305039/highlight1_haa3hk.jpg",
		title: "🧠 Phương pháp học khoa học",
		desc: "Áp dụng kỹ thuật Spaced Repetition - phương pháp được chứng minh hiệu quả nhất để ghi nhớ từ vựng và ngữ pháp vào trí nhớ dài hạn.",
	},
	{
		image:
			"https://res.cloudinary.com/dytfwdgzc/image/upload/v1763305096/highlight2_mx3lnt.png",
		title: "🎯 Học thông minh với AI",
		desc: "AI phân tích và đề xuất khóa học phù hợp mục tiêu của bạn. Ngoài ra, bạn còn có thể hỏi đáp thắc mắc về bài học với trợ lý ảo.",
	},
	{
		image:
			"https://res.cloudinary.com/dytfwdgzc/image/upload/v1763305241/highlight3_jphz4u.jpg",
		title: "🎮 Tích điểm XP & Xếp hạng",
		desc: "Hệ thống tích điểm và bảng xếp hạng giúp bạn duy trì động lực học tập mỗi ngày",
	},
	{
		image:
			"https://res.cloudinary.com/dytfwdgzc/image/upload/v1763305338/%E1%BA%A2nh_ch%E1%BB%A5p_m%C3%A0n_h%C3%ACnh_2025-11-16_220201_ltziy0.png",
		title: "📱 Học mọi lúc mọi nơi",
		desc: "Flashcard tương tác, quiz đa dạng và AI trợ giảng 24/7. Học ở bất cứ đâu, bất cứ khi nào với PocketLingo.",
	},
];


const FAQ_ITEMS = [
	{
		q: "PocketLingo có miễn phí không?",
		a: "PocketLingo hoàn toàn miễn phí. Bạn có thể sử dụng tất cả các tính năng mà không phải trả bất kỳ khoản phí nào. Dùng thử ngay hôm nay để trải nghiệm nền tảng học ngôn ngữ hiệu quả và tiện lợi!",
	},
	{
		q: "Tôi cần học bao lâu mỗi ngày?",
		a: "Chỉ cần 15-30 phút mỗi ngày! PocketLingo được thiết kế để học tập hiệu quả trong thời gian ngắn cùng cơ chế ôn tập thông minh.",
	},
	{
		q: "PocketLingo khác gì với các ứng dụng khác?",
		a: "Kết hợp AI cá nhân hoá, Spaced Repetition và nội dung thực tế dành cho người Việt học Anh - Nhật.",
	},
	{
		q: "Tôi có thể học những ngôn ngữ nào?",
		a: "Hiện hỗ trợ tiếng Anh và tiếng Nhật, sẽ mở rộng thêm trong tương lai dựa trên phản hồi người dùng.",
	},
	{
		q: "Làm sao theo dõi tiến độ học?",
		a: "Có dashboard: điểm XP, từ đã học, lịch sử quiz, bảng xếp hạng và tiến độ từng khóa trong mục Hồ sơ học tập.",
	},
];

const LandingPage: React.FC = () => {
	const [courses, setCourses] = useState<Course[]>([]);
	const [loading, setLoading] = useState(false);

	useEffect(() => {
		const fetchFeatured = async () => {
			setLoading(true);
			try {
				const params = { page: 1, page_size: 6 };
				const res = await api.get(`$/courses/`, { params });
				if (res.data?.success) {
					setCourses(res.data.data.courses);
				}
			} catch (e) {
				console.error("Lỗi khi tải khóa học nổi bật", e);
			} finally {
				setLoading(false);
			}
		};
		fetchFeatured();
	}, []);

	return (
			<div className="landing-page">
				{/* Header có sẵn */}
				<LandingHeader />

				{/* Hero */}
				<section className="container py-3 border-bottom">
					<div className="d-flex flex-column align-items-center gap-3">
						<div className="hero-logo-wrapper">
							<img className="hero-logo" src={HERO_LOGO_URL} alt="Logo" />
						</div>
                        <div>
                            <h2 className="section-title">Học ngôn ngữ dễ dàng với PocketLingo</h2>
                            <p className="hero-subtitle text-center text-muted">Nền tảng học ngôn ngữ trực tuyến hiệu quả, tiện lợi</p>
                        </div>
						<div className="d-flex gap-2">
							<Link to="/login" className="btn btn-purple-outline" aria-label="Đăng nhập">
								Đăng nhập
							</Link>
							<Link to="/signup" className="btn btn-purple-outline" aria-label="Đăng ký">
								Đăng ký
							</Link>
						</div>
					</div>
				</section>

				{/* Highlight */}
				<section className="container py-3 border-bottom">
					<h2 className="section-title">Tại sao nên chọn PocketLingo?</h2>
					<HighlightCarousel items={HIGHLIGHTS} />
				</section>

				{/* Giới thiệu */}
                <section className="container py-3 border-bottom">
                <div className="row g-4 align-items-center">
                    {/* Ảnh */}
                    <div className="col-12 col-lg-7 text-center text-lg-start">
                    <div className="intro-img mb-3 mb-lg-0">
                        <img
                        src="https://res.cloudinary.com/dytfwdgzc/image/upload/v1763300982/logo_pbhiqx.png"
                        alt="Giới thiệu"
                        />
                    </div>
                    </div>

                    {/* Nội dung */}
                    <div className="col-12 col-lg-5">
                    <div className="intro-content">
                        <h2 className="section-title mb-3">Giới thiệu PocketLingo</h2>
                        <p className="text-muted mb-3">
                        PocketLingo là nền tảng học ngôn ngữ trực tuyến hiện đại. Chúng tôi kết hợp 
                        <strong> công nghệ AI tiên tiến </strong> với phương pháp học tập được chứng minh khoa học, giúp bạn:
                        </p>
                        <ul className="list-unstyled text-muted mb-3">
                        <li>✅ Ghi nhớ từ vựng nhanh gấp 3 lần</li>
                        <li>✅ Tự tin giao tiếp trong tình huống thực tế</li>
                        <li>✅ Tiết kiệm thời gian với lộ trình cá nhân hóa</li>
                        <li>✅ Duy trì động lực học tập dài hạn</li>
                        </ul>
                        <p className="text-muted mb-3">
                        Với hơn <strong>100+ khóa học</strong> từ cơ bản đến nâng cao, PocketLingo là người bạn đồng hành đáng tin cậy trên hành trình chinh phục ngôn ngữ của bạn.
                        </p>
                        <Link to="/signup" className="btn btn-purple-outline">
                        Đăng ký ngay!
                        </Link>
                    </div>
                    </div>
                </div>
                </section>

				{/* Khóa học nổi bật */}
				<section className="container py-3 border-bottom">
					<h2 className="section-title">Khóa học nổi bật</h2>
					{loading ? (
						<div className="text-center my-3">Đang tải...</div>
					) : (
						<div className="row g-3">
							{courses.map((c) => (
								<div className="col-12 col-md-6 col-lg-4" key={c.id}>
									<CourseCard course={c as any} />
								</div>
							))}
						</div>
					)}
				</section>

				{/* FAQ Accordion */}
				<section className="container py-3 border-bottom">
					<h2 className="section-title">FAQ</h2>
					<div className="accordion" id="faqAccordion">
						{FAQ_ITEMS.map((item, idx) => {
							const headingId = `faq-heading-${idx}`;
							const collapseId = `faq-collapse-${idx}`;
							return (
								<div className="accordion-item" key={idx}>
									<h2 className="accordion-header" id={headingId}>
										<button
											className={`accordion-button ${idx !== 0 ? "collapsed" : ""}`}
											type="button"
											data-bs-toggle="collapse"
											data-bs-target={`#${collapseId}`}
											aria-expanded={idx === 0 ? "true" : "false"}
											aria-controls={collapseId}
										>
											{item.q}
										</button>
									</h2>
									<div
										id={collapseId}
										className={`accordion-collapse collapse ${idx === 0 ? "show" : ""}`}
										aria-labelledby={headingId}
										data-bs-parent="#faqAccordion"
									>
										<div className="accordion-body text-muted">{item.a}</div>
									</div>
								</div>
							);
						})}
					</div>
				</section>

				<footer className="footer text-white text-center py-3 mt-3">
					Copyright © PocketLingo
				</footer>
			</div>
	);
};

export default LandingPage;
