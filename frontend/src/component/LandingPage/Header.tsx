import React from "react";
import { Link } from "react-router-dom";
import logo from "../../assets/logo.png";

const LandingHeader: React.FC = () => {
	return (
		<header
			className="lp-header py-2"
			style={{
				backgroundColor: "#5E3C86",
				color: "#fff",
				position: "sticky",
				top: 0,
				zIndex: 1000,
			}}
		>
			<div className="container d-flex justify-content-between align-items-center">
				<div className="d-flex align-items-center">
                    <a href="/landing"><img
						src={logo}
						alt="PocketLingo Logo"
						style={{ height: 50, objectFit: "contain" }}
					/></a>
				</div>
				<div className="d-flex align-items-center gap-2">
					<Link to="/login" className="btn btn-outline-light" aria-label="Đăng nhập">
						Đăng nhập
					</Link>
					<Link to="/signup" className="btn btn-outline-light" aria-label="Đăng ký">
						Đăng ký
					</Link>
				</div>
			</div>
		</header>
	);
};

export default LandingHeader;

