import React from 'react';

interface SkeletonProps {
    className?: string;
    variant?: 'text' | 'rect' | 'circle';
}

const Skeleton: React.FC<SkeletonProps> = ({ className = '', variant = 'rect' }) => {
    const baseClass = "animate-pulse bg-slate-800/50";
    const variantClass = variant === 'text' ? 'h-4 w-full rounded' :
        variant === 'circle' ? 'rounded-full' :
            'rounded-xl';

    return <div className={`${baseClass} ${variantClass} ${className}`} />;
};

export default Skeleton;
