export type Import = {
    importId?: string;
    newFollowers?: string[];
    newFollowings?: string[];
    sameFollowers?: string[];
    sameFollowings?: string[];
    unfollow?: string[];
    notFollowing?: string[];
};

export type Sync = {
    syncId?: string;
    userIds?: string[];
};