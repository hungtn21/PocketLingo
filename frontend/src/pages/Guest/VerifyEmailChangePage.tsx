import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import api from '../../api';

const VerifyEmailChangePage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');
  const [status, setStatus] = useState<'pending'|'success'|'error'>('pending');
  const [message, setMessage] = useState('Đang xác minh email mới...');

  useEffect(()=>{
    const verify = async () => {
      if(!token){
        setStatus('error');
        setMessage('Thiếu token xác minh.');
        return;
      }
      try {
        const res = await api.get(`/users/verify-email-change/?token=${encodeURIComponent(token)}`);
        if(res.data?.message){
          setStatus('success');
          setMessage(res.data.message + '\nBạn sẽ được chuyển hướng...');
          setTimeout(()=> navigate('/login'), 2000); // sau xác minh yêu cầu login lại
        }
      } catch(err:any){
        setStatus('error');
        setMessage(err?.response?.data?.error || 'Xác minh thất bại. Token có thể đã hết hạn.');
      }
    };
    verify();
  }, [token, navigate]);

  return (
    <div className="container py-5" style={{maxWidth:'640px'}}>
      <h2 className="mb-4 fw-bold text-center">Xác minh thay đổi email</h2>
      <div className={`alert alert-${status==='success'?'success': status==='error'?'danger':'info'}`}> 
        {message}
      </div>
      {status==='success' && (
        <div className="text-center text-muted">Đang chuyển hướng về trang đăng nhập...</div>
      )}
    </div>
  );
};

export default VerifyEmailChangePage;
