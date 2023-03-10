import Cors from "cors";
import type { NextApiRequest, NextApiResponse } from "next";
import axios from "axios";

// Initializing the cors middleware
// You can read more about the available options here: https://github.com/expressjs/cors#configuration-options
const cors = Cors({
  methods: ["POST", "GET", "HEAD"],
});

// Helper method to wait for a middleware to execute before continuing
// And to throw an error when an error happens in a middleware
function runMiddleware(req: NextApiRequest, res: NextApiResponse, fn: Function) {
  return new Promise((resolve, reject) => {
    fn(req, res, (result: any) => {
      if (result instanceof Error) {
        return reject(result);
      }

      return resolve(result);
    });
  });
}

export default async function handler(req: any, res: any) {
  // Run the middleware
  await runMiddleware(req, res, cors);
  res.setHeader("Cache-Control", "s-maxage=604800000");
  const { query, passkey } = req.query;
  const isAuthorized: boolean = passkey === process.env.PASSKEY;

  if (!isAuthorized) {
    return res.status(401).json({
      error: "Unauthorized. Make sure you have the correct passkey.",
    });
  }

  const tweetMetadata = await axios.get(
    `https://api.twitter.com/1.1/statuses/show.json?id=${query}&tweet_mode=extended`,
    {
      headers: {
        Authorization: `Bearer ${process.env.TWITTER_TOKEN}`,
      },
    }
  );

  res.status(200).json(tweetMetadata.data);
}
