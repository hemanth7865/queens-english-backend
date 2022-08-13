const axios = require("axios");

/**
 * List Of Zoom Licenses That Should Get Deleted IDS Only
 */

const licenses = [];

const server = "https://admin.thequeensenglish.co/be/zoom-user/{{USER_ID}}";

const token = "AUTH_TOKEN_HERE";

const results = [];

const start = async () => {
  for (const license of licenses) {
    try {
      const response = await axios.delete(
        server.replace("{{USER_ID}}", license),
        {
          withCredentials: true,
          headers: {
            Cookie: `qe-admin-token=${token};`,
          },
        }
      );
      results.push({ response: JSON.stringify(response.data), license });
    } catch (e) {
      results.push({ message: e.message, e });
    }
  }
  console.log(results);
};

start();
