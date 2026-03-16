"use client"

import React from "react"

interface SkeletonProps {
  width?: string | number
  height?: string | number
  borderRadius?: string | number
  style?: React.CSSProperties
  className?: string
}

export const Skeleton = ({ width, height, borderRadius = "8px", style, className }: SkeletonProps) => {
  return (
    <div 
      className={`skeleton-shimmer ${className || ""}`}
      style={{
        width: width || "100%",
        height: height || "1em",
        borderRadius,
        background: "#e2e8f0",
        position: "relative",
        overflow: "hidden",
        ...style
      }}
    >
      <style jsx>{`
        .skeleton-shimmer::after {
          content: "";
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: linear-gradient(
            90deg,
            transparent,
            rgba(255, 255, 255, 0.4),
            transparent
          );
          animation: shimmer 1.5s infinite;
        }

        @keyframes shimmer {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(100%);
          }
        }
      `}</style>
    </div>
  )
}

export const SkeletonCard = () => (
  <div style={{ background: "white", borderRadius: "16px", padding: "20px", border: "1px solid #e2e8f0", marginBottom: "16px" }}>
    <div style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: "20px" }}>
      <Skeleton width={64} height={64} borderRadius="14px" />
      <div style={{ flex: 1 }}>
        <Skeleton width="60%" height={24} style={{ marginBottom: "8px" }} />
        <Skeleton width="40%" height={16} />
      </div>
    </div>
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
      <Skeleton height={40} borderRadius="12px" />
      <Skeleton height={40} borderRadius="12px" />
    </div>
  </div>
)

export const SkeletonRow = () => (
  <div style={{ display: "flex", alignItems: "center", gap: "12px", padding: "16px", background: "white", borderRadius: "12px", border: "1px solid #e2e8f0" }}>
    <Skeleton width={40} height={40} borderRadius="10px" />
    <div style={{ flex: 1 }}>
      <Skeleton width="50%" height={18} style={{ marginBottom: "6px" }} />
      <Skeleton width="30%" height={14} />
    </div>
  </div>
)
