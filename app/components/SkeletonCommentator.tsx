"use client";

import React from "react";

interface SkeletonCommentatorProps {
  visible: boolean;
  comment: string;
}

export default function SkeletonCommentator({ visible, comment }: SkeletonCommentatorProps) {
  if (!visible) return null;

  return (
    <div className="skeleton-commentator">
      <div className="skeleton-avatar">
        <div className="skeleton-head">💀</div>
        <div className="skeleton-body">☠️</div>
      </div>
      <div className="skeleton-speech-bubble">
        <div className="skeleton-speech-text">{comment}</div>
      </div>
    </div>
  );
}
