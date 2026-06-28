"use client";

import { LikeButton } from "@/components/dashboard/LikeButton";
import { LikeStat } from "@/components/LikeStat";

type Props = {
  sourceId: string;
  likesCount: number;
  likedByMe: boolean;
  isAuthenticated: boolean;
};

export function PublicSourceLike({
  sourceId,
  likesCount,
  likedByMe,
  isAuthenticated,
}: Props) {
  if (isAuthenticated) {
    return (
      <LikeButton
        sourceId={sourceId}
        initialLiked={likedByMe}
        initialCount={likesCount}
        layout="inline"
      />
    );
  }

  return (
    <LikeStat
      count={likesCount}
      highlighted={likesCount > 0}
      readonly
      layout="inline"
    />
  );
}
