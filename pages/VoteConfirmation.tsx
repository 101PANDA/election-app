
import React from 'react';
import Header from '../components/Header';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const VoteConfirmationPage: React.FC = () => {
    const { logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <div className="flex items-center justify-center min-h-screen">
            <div className="w-full max-w-lg bg-white rounded-2xl shadow-xl p-8 m-4 text-center">
                <Header />
                <svg className="w-20 h-20 text-green-500 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                <h1 className="text-3xl font-bold text-gray-800 mt-4">Vote Submitted!</h1>
                <p className="text-gray-600 mt-2">Thank you for participating in the election. Your vote has been recorded successfully.</p>
                <button
                    onClick={handleLogout}
                    className="mt-8 bg-green-800 text-white font-bold py-3 px-8 rounded-xl hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-800 transition"
                >
                    Logout
                </button>
            </div>
        </div>
    );
};

export default VoteConfirmationPage;
