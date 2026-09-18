export const scrap = async ({ headers, username }: { headers: Record<string, string>, username: string }) => {
  debugger;

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
        `https://www.instagram.com/api/v1/friendships/${userId}/followers/${after ? `?max_id=${after}` : ''}`,
        {
          headers: headers || {}
        }
      )
        .then((res) => res.json())
        .then((res) => {
          has_next = res.has_more;
          after = res.next_max_id;
          followers = followers.concat(
            res.users
          );
        });
    }

    console.log(`Followers: ${followers.length}`);

    after = null;
    has_next = true;

    while (has_next) {
      await fetch(
        `https://www.instagram.com/api/v1/friendships/${userId}/following/${after ? `?max_id=${after}` : ''}`,
        {
          headers: headers || {}
        }
      )
        .then((res) => res.json())
        .then((res) => {
          has_next = res.has_more;
          after = res.next_max_id;
          followings = followings.concat(
            res.users
          );
        });
    }
  } catch (err) {
    debugger;
    console.log(`Error occurred while scraping data for username: ${username}`);
    console.log(err);

    return { err };
  }

  console.log(`Followings: ${followings.length}`);

  return { followings, followers };
};
