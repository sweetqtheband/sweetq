import type { Adapter, AdapterPayload } from "oidc-provider";
import type { Collection, Db, Filter } from "mongodb";
import { getDb } from "@/app/services/api/_db";

type Stored = {
  _id: string;
  payload: AdapterPayload;
  expiresAt?: Date;
};

export function createMongoAdapter(connect: () => Promise<Db> = getDb, namespace = "") {
  const collections = new Map<string, Promise<Collection<Stored>>>();

  function collection(name: string): Promise<Collection<Stored>> {
    let pending = collections.get(name);
    if (!pending) {
      pending = (async () => {
        const db = await connect();
        const result = db.collection<Stored>(`mcp_oauth_${namespace}${name}`);
        await Promise.all([
          result.createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 }),
          result.createIndex({ "payload.uid": 1 }),
          result.createIndex({ "payload.userCode": 1 }),
          result.createIndex({ "payload.grantId": 1 }),
        ]);
        return result;
      })();
      collections.set(name, pending);
      pending.catch(() => collections.delete(name));
    }
    return pending;
  }

  return (name: string): Adapter => {
    async function find(query: Filter<Stored>): Promise<AdapterPayload | undefined> {
      const store = await collection(name);
      const result = await store.findOne({
        $and: [
          query,
          { $or: [{ expiresAt: { $exists: false } }, { expiresAt: { $gt: new Date() } }] },
        ],
      });
      return result?.payload;
    }

    return {
    async upsert(id, payload, expiresIn) {
      const store = await collection(name);
      await store.updateOne(
        { _id: id },
        {
          $set: {
            payload,
            ...(expiresIn === undefined
              ? {}
              : { expiresAt: new Date(Date.now() + expiresIn * 1000) }),
          },
          ...(expiresIn === undefined
            ? { $unset: { expiresAt: "" } }
            : {}),
        },
        { upsert: true },
      );
    },
    async find(id) {
      return find({ _id: id });
    },
    async findByUid(uid) {
      return find({ "payload.uid": uid });
    },
    async findByUserCode(userCode) {
      return find({ "payload.userCode": userCode });
    },
    async consume(id) {
      const store = await collection(name);
      const result = await store.updateOne(
        { _id: id, "payload.consumed": { $exists: false }, expiresAt: { $gt: new Date() } },
        { $set: { "payload.consumed": Math.floor(Date.now() / 1000) } },
      );
      if (result.modifiedCount !== 1) throw new Error("OAuth grant already consumed or expired");
    },
    async destroy(id) {
      await (await collection(name)).deleteOne({ _id: id });
    },
    async revokeByGrantId(grantId) {
      await (await collection(name)).deleteMany({ "payload.grantId": grantId });
    },
    };
  };
}
