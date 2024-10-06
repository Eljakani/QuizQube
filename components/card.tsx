import React from 'react';

interface CardProps {
    step: number;
    title: string;
    content: string;
    icon: React.ReactNode;
}

const HomeCard: React.FC<CardProps> = ({ step, title, content, icon }) => {
    return (
        <div className="bg-white rounded-lg p-3 py-4 border border-gray-400 border-opacity-20 relative flex items-center space-x-4 overflow-hidden">
            <div className="select-none text-[160px] font-bold text-main absolute left-5 top-1/2 transform -translate-y-1/2 -rotate-6 opacity-20">
                {step}
            </div>
            <div className='relative'>
                <h2 className="text-lg font-semibold text-black">{title}</h2>
                <p className="text-sm text-black font-light">{content}</p>
            </div>
            <div className="relative min-w-24 min-h-24 flex justify-center items-center">
                {icon}
            </div>
      </div>
    );
};


export default HomeCard;