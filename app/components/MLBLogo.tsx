'use client';

export default function MLBLogo({ className = '' }: { className?: string }) {
  return (
    <div className={`relative ${className}`}>
      <svg
        viewBox="0 0 300 150"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full"
      >
        <text
          x="150"
          y="110"
          textAnchor="middle"
          fontFamily="Georgia, serif"
          fontSize="135"
          fontWeight="bold"
          fill="#FFFFFF"
        >
          MLB
        </text>
      </svg>
    </div>
  );
}
