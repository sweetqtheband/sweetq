export const scrap = async (username: string) => {
  /**
   * Initialized like this so we can still run it from browsers, but also use typescript on a code editor for intellisense.
   */
  let followers = [{ username: '', full_name: '' }];
  let followings = [{ username: '', full_name: '' }];

  followers = [];
  followings = [];

  try {
    console.log(`Process started! Give it a couple of seconds`);

    const userQueryRes = await fetch(
      `https://www.instagram.com/web/search/topsearch/?query=${username}`
    );

    const userQueryJson = await userQueryRes.json();

    const userId = userQueryJson.users
      .map((u: any) => u.user)
      .filter((u: any) => u.username === username)[0].pk;

    let after = null;
    let has_next = true;

    while (has_next) {
      await fetch(
        `https://www.instagram.com/graphql/query/?query_hash=c76146de99bb02f6415203be841dd25a&variables=` +
          encodeURIComponent(
            JSON.stringify({
              id: userId,
              include_reel: false,
              fetch_mutual: true,
              first: 50,
              after: after,
            })
          )
      )
        .then((res) => res.json())
        .then((res) => {
          has_next = res.data.user.edge_followed_by.page_info.has_next_page;
          after = res.data.user.edge_followed_by.page_info.end_cursor;
          followers = followers.concat(
            res.data.user.edge_followed_by.edges.map(
              ({ node }: { node: any }) => {
                return { ...node };
              }
            )
          );
        });
    }

    console.log(`Followers: ${followers.length}`);

    after = null;
    has_next = true;

    while (has_next) {
      await fetch(
        `https://www.instagram.com/graphql/query/?query_hash=d04b0a864b4b54837c0d870b0e77e076&variables=` +
          encodeURIComponent(
            JSON.stringify({
              id: userId,
              include_reel: false,
              fetch_mutual: true,
              first: 50,
              after: after,
            })
          )
      )
        .then((res) => res.json())
        .then((res) => {
          has_next = res.data.user.edge_follow.page_info.has_next_page;
          after = res.data.user.edge_follow.page_info.end_cursor;
          followings = followings.concat(
            res.data.user.edge_follow.edges.map(({ node }: { node: any }) => {
              return { ...node };
            })
          );
        });
    }
  } catch (err) {
    return { err };
  }

  console.log(`Followings: ${followings.length}`);

  return { followings, followers };
};
