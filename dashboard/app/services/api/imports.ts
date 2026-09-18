import { InstagramProfile } from "@/types/instagram-profile";
import { getCollection } from "./_db";
import { ObjectId, type Collection } from "mongodb";
import { FactorySvc } from "./factory";
import { pipe, randomWait } from "@/app/utils";
import { Import } from "@/types/import";

import { getImportFromStore, setImportInStore } from "./importStore";
import { revalidatePath } from "next/cache";

export const getImport = (importId: string) => {
    return getImportFromStore(importId);
};

export const startImport = (importId: string, data: Record<string, any>, total: number) => {
    setImportInStore(importId, {
        data,
        total,
        processed: 0,
        log: [],
        status: "running",
    });
};

export const startInstagramImport = (importId: string, data: Import) => {

    let total = data.newFollowers?.length || 0;
    total += data.newFollowings?.length || 0;
    total += data.sameFollowers?.length || 0;
    total += data.sameFollowings?.length || 0;
    total += data.unfollow?.length || 0;
    total += data.notFollowing?.length || 0;

    startImport(importId, data, total);

};

export const startInstagramSync = (syncId: string, data: Record<string, any>) => {
    const total = data.userIds?.length || 0;
    startImport(syncId, data, total);
};

/**
 * Update existing users
 * @param obj Object containing importId, collection, usernames, users, comparison, and logProcess function.
 * @param obj.importId The ID of the import process.
 * @param obj.collection The MongoDB collection to update.
 * @param obj.usernames The list of usernames to fetch and update.
 * @param obj.users The list of user data to compare against.
 * @param obj.comparison The list of comparison data.
 * @param obj.logProcess The function to log progress messages.
 * @returns 
 */
export const updateExistingUsers = async ({
    importId,
    collection,
    usernames = [],
    users = [],
    comparison = [],
    logProcess = () => { }
}: {
    importId: string;
    collection: Collection;
    usernames?: string[];
    users?: Record<string, any>[];
    comparison?: Record<string, any>[];
    logProcess?: (str: string) => void;
}) => {
    const currentImport = getImport(importId);
    if (!currentImport) {
        return;
    }
    const instagramSvc = FactorySvc("instagram", await getCollection("instagram"));
    if (!instagramSvc) {
        console.error("Failed to initialize Instagram service");
        return;
    }
    const cb = async (result: InstagramProfile) => {
        if (result && result.username) {
            currentImport.processed += 1;

            try {
                const fol = await collection.findOne({ username: result.username });

                const userData = {
                    ...fol,
                    ...(result || {})
                };
                await instagramSvc.updateUser(userData, users, collection, comparison, logProcess).catch((err: any) => {
                    console.error(`Error updating follower ${result.username}:`, err);
                });
            } catch (err) {
                console.error(`Error finding user ${result.username}:`, err);
            }
        }
    }
    await instagramSvc.fetchInstagramProfileData(usernames, cb);
};


const createNewUsersFull = async ({
    importId,
    collection,
    usernames = [],
    users = [],
    comparison = [],
    logProcess = () => { }
}: {
    importId: string;
    collection: Collection;
    usernames?: string[];
    users?: Record<string, any>[];
    comparison?: Record<string, any>[];
    logProcess?: (str: string) => void;
}) => {
    const currentImport = getImport(importId);
    if (!currentImport) {
        return;
    }
    const instagramSvc = FactorySvc("instagram", await getCollection("instagram"));
    if (!instagramSvc) {
        console.error("Failed to initialize Instagram service");
        return;
    }

    const cb = async (result: InstagramProfile) => {
        if (result && result.username) {
            currentImport.processed += 1;

            try {
                const user = await instagramSvc.updateUser(result, users, collection, comparison, logProcess);
                users.push(user);
            } catch (err: any) {
                console.error(`Error creating new user ${result.username}:`, err);
            }
        }
    }
    await instagramSvc.fetchInstagramData(usernames, cb);
};

const createNewUsers = async ({
    importId,
    collection,
    usernames = [],
    users = [],
    comparison = [],
    logProcess = () => { }
}: {
    importId: string;
    collection: Collection;
    usernames?: string[];
    users?: Record<string, any>[];
    comparison?: Record<string, any>[];
    logProcess?: (str: string) => void;
}) => {

    const currentImport = getImport(importId);
    if (!currentImport) {
        return;
    }
    const instagramSvc = FactorySvc("instagram", await getCollection("instagram"));
    if (!instagramSvc) {
        console.error("Failed to initialize Instagram service");
        return;
    }

    for (const username of usernames) {
        currentImport.processed += 1;

        try {
            const user = await instagramSvc.updateUser({ username }, users, collection, comparison, logProcess);
            users.push(user);
        } catch (err: any) {
            console.error(`Error creating new user ${username}:`, err);
        }
    }
};

const importStart = async ({ data, logProcess = () => { } }: { data: Import, logProcess?: (str: string) => void, shared?: Record<string, any> }) => {
    // Implement the logic for processing Instagram import here
    logProcess(`Import starts now`);

    const pipeObject = await getPipeObject({ data, logProcess });
    return pipeObject;
};

const syncStart = (data: Record<string, any>) => {
    const { logProcess = () => { } } = data;
    // Implement the logic for processing Instagram import here
    logProcess(`Sync starts now`);
    const currentImport = getImport(data.syncId);
    if (!currentImport) {
        return;
    }

    currentImport.results = {};

    return data;
};

const updateFollowStatus = async ({ data, followersCol, followingsCol, logProcess = () => { } }: { data: Import, followersCol: Collection, followingsCol: Collection, logProcess?: (str: string) => void }) => {
    if (data.importId) {
        const currentImport = getImport(data.importId);
        if (!currentImport) {
            return;
        }

        // First of all, we need to mark all as unfollow: true mark from followers before processing new data
        logProcess(`Marking all followers as unfollow`);
        await followersCol.updateMany({}, { $set: { unfollow: true, updateDate: new Date() } });
        logProcess(`Marked all followers as unfollow`);

        // Then, we need to mark the followers that are still following as unfollow: false
        logProcess(`Marking same followers as unfollow: false`);
        await followersCol.updateMany({ username: { $in: data.sameFollowers || [] } }, { $set: { unfollow: false, updateDate: new Date() } });
        logProcess(`Marked same followers`);

        // Followings
        logProcess(`Marking all followings as unfollow`);
        await followingsCol.updateMany({}, { $set: { unfollow: true, updateDate: new Date() } });
        logProcess(`Marked all followings as unfollow`);

        logProcess(`Marking same followings as unfollow: false`);
        await followingsCol.updateMany({ username: { $in: data.sameFollowings || [] } }, { $set: { unfollow: false, updateDate: new Date() } });
        logProcess(`Marked same followings`);
    }

    const pipeObject = await getPipeObject({ data, logProcess });
    return pipeObject;
};

const updateSameFollowers = async ({ data, followersCol, followers, logProcess = () => { } }: { data: Import, followersCol: Collection, followers: Record<string, any>[], logProcess?: (str: string) => void }) => {
    if (!data.importId) {
        return;
    }
    const currentImport = getImport(data.importId);
    if (currentImport) {
        currentImport.processed += data.sameFollowers?.length || 0;
    }
    const pipeObject = await getPipeObject({ data, logProcess });
    return pipeObject;
};

const createNewFollowers = async ({ data, followersCol, followers, logProcess = () => { } }: { data: Import, followersCol: Collection, followers: Record<string, any>[], logProcess?: (str: string) => void }) => {
    // Create new followers
    if (data.newFollowers?.length && data.importId) {

        await createNewUsers({
            importId: data.importId,
            collection: followersCol,
            usernames: data.newFollowers,
            users: followers,
            comparison: [],
            logProcess
        });

        logProcess(`Imported new followers`);
    }
    const pipeObject = await getPipeObject({ data, logProcess });
    return pipeObject;
};



const updateSameFollowings = async ({ data, followingsCol, followings, followers, logProcess = () => { } }: { data: Import, followingsCol: Collection, followings: Record<string, any>[], followers: Record<string, any>[], logProcess?: (str: string) => void }) => {
    if (!data.importId) {
        return;
    }
    const currentImport = getImport(data.importId);
    if (currentImport) {
        currentImport.processed += data.sameFollowings?.length || 0;
    }
    const pipeObject = await getPipeObject({ data, logProcess });
    return pipeObject;
};
const createNewFollowings = async ({ data, followingsCol, followings, followers, logProcess = () => { } }: { data: Import, followingsCol: Collection, followings: Record<string, any>[], followers: Record<string, any>[], logProcess?: (str: string) => void }) => {
    // Create new followings
    if (data.newFollowings?.length && data.importId) {

        await createNewUsers({
            importId: data.importId,
            collection: followingsCol,
            usernames: data.newFollowings,
            users: followings,
            comparison: followers,
            logProcess
        });

        logProcess(`Imported new followings`);
    }
    const pipeObject = await getPipeObject({ data, logProcess });
    return pipeObject;
};

const deleteNotFollowing = async ({ data, followingsCol, logProcess = () => { } }: { data: Import, followingsCol: Collection, logProcess?: (str: string) => void }) => {
    if (data.notFollowing?.length && data.importId) {

        await followingsCol.deleteMany({ username: { $in: data.notFollowing } });
        logProcess(`Removed not following users`);
    }
    const pipeObject = await getPipeObject({ data, logProcess });
    return pipeObject;
};

const importEnd = async ({ data, followersCol, followingsCol, logProcess = () => { } }: { data: Import, followersCol: Collection, followingsCol: Collection, updateDate: Date, logProcess?: (str: string) => void }) => {
    logProcess(`Import process completed`);

    if (!data.importId) {
        return { data, logProcess };
    }
    const currentImport = getImport(data.importId);
    if (!currentImport) {
        return { data, logProcess };
    }
    const updateDate = new Date();

    // Finally, add created date if not exist
    await followersCol.updateMany({ created: { $exists: false } }, { $set: { created: updateDate } });
    await followingsCol.updateMany({ created: { $exists: false } }, { $set: { created: updateDate } });

    currentImport.processed = currentImport.total;
    currentImport.status = "completed";


    const pipeObject = await getPipeObject({ data, logProcess });
    return pipeObject;
};

const syncEnd = (data: Record<string, any>) => {
    const { logProcess = () => { } } = data;
    logProcess(`Sync process completed`);


    if (!data.syncId) {
        return data;
    }
    const currentImport = getImport(data.syncId);
    if (!currentImport) {
        return data;
    }

    currentImport.processed = currentImport.total;
    if (currentImport.status !== "error") {
        currentImport.status = "completed";
    }

    revalidatePath(`/admin/instagram/${data.origin}`);

    return data;
};

export const getPipeObject = async ({ data, logProcess = () => { } }: { data: Import, logProcess?: (str: string) => void }) => {
    const followersCol = await getCollection("followers");
    const followingsCol = await getCollection("followings");

    const followers = (await followersCol.find().toArray());
    const followings = (await followingsCol.find().toArray());

    return {
        data,
        logProcess,
        followersCol,
        followingsCol,
        followers,
        followings
    };
};
export const processInstagramImport = async (importId: string, data: any) => {
    const currentImport = getImport(importId);
    if (!currentImport) {
        return;
    }
    // Create logger
    const logProcess = (str: string) => {
        currentImport.log.push(str);
    };

    data.importId = importId;

    const pipeObject = await getPipeObject({ data, logProcess });

    try {
        pipe(
            importStart,
            updateFollowStatus,
            updateSameFollowers,
            createNewFollowers,
            updateSameFollowings,
            createNewFollowings,
            deleteNotFollowing,
            importEnd
        )(pipeObject);

        return true;
    } catch (error: any) {
        logProcess(`Import process failed: ${error.message}`);
        currentImport.status = "error";
        return false;
    }
};

export const fetchUsers = async (data: Record<string, any>) => {
    const { syncId, origin, logProcess, userIds } = data;
    const currentImport = getImport(syncId);
    if (!currentImport) {
        return;
    }

    const col = await getCollection(origin === 'followers' ? "followers" : "followings");

    // Find all users with Object.id included in userIds
    const users = await col.find({ _id: { $in: userIds.map((id: string) => new ObjectId(id)) } }).toArray();

    logProcess(`Fetched ${users.length} users from ${origin}`);
    data.users = users;
    return { ...data, users };
};

export const syncUsers = async (data: Record<string, any>) => {
    const { syncId, origin, logProcess, userIds } = data;
    const currentImport = getImport(syncId);
    if (!currentImport) {
        return;
    }
    const users = data.users || [];

    const instagramSvc = FactorySvc("instagram", await getCollection("instagram"));
    const collection = await getCollection(origin === 'followers' ? "followers" : "followings");
    const comparison = origin === 'followings' ? await (await getCollection("followers")).find({}).toArray() : [];

    await instagramSvc.getPuppeteerEnvironment();

    for (const user of users) {
        const instagramData = await instagramSvc.fetchInstagramData(user);

        if (instagramData) {
            try {
                const updatedUser = await instagramSvc.updateUser(instagramData, users, collection, comparison, logProcess);
                Object.assign(user, updatedUser);
                if (currentImport.results) {
                    currentImport.results[updatedUser._id] = updatedUser;
                }

            } catch (err: any) {
                console.error(`Error creating new user ${user}:`, err);
                currentImport.status = "error";
                return data;
            } finally {
                currentImport.processed += 1;
            }
        } else {
            await collection.updateOne({ _id: new ObjectId(user._id) }, { $set: { unfollow: true } });
            currentImport.processed += 1;
            if (currentImport.results) {
                currentImport.results[user._id] = null;
            }
        }
        await randomWait(2);
    }
    return data;
};

export const processInstagramSync = async (syncId: string, data: any) => {
    const currentImport = getImport(syncId);
    if (!currentImport) {
        return;
    }
    // Create logger
    const logProcess = (str: string) => {
        currentImport.log.push(str);
    };

    data.syncId = syncId;

    try {
        pipe(
            syncStart,
            fetchUsers,
            syncUsers,
            syncEnd
        )({ ...data, logProcess });
    } catch (error: any) {
        logProcess(`Sync process failed: ${error.message}`);
        currentImport.status = "error";
        return false;
    }
};