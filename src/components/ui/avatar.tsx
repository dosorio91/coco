import * as React from "react";

export interface AvatarProps {
  src?: string;
  alt?: string;
  size?: number;
  className?: string;
}

export const Avatar: React.FC<AvatarProps> = ({ src, alt, size = 40, className }) => {
  return (
    <div
      className={`rounded-full overflow-hidden bg-gray-200 flex items-center justify-center border border-gray-300 ${className || ""}`}
      style={{ width: size, height: size }}
    >
      {src ? (
        <img
          src={src}
          alt={alt || "Avatar"}
          style={{ width: size, height: size, objectFit: "cover" }}
        />
      ) : (
        <span style={{ fontSize: size * 0.5, color: '#888' }}>👤</span>
      )}
    </div>
  );
};
