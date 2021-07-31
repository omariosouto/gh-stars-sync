require('dotenv').config();
const fetch = require('node-fetch');
const xmlParser = require('fast-xml-parser');
const core = require('@actions/core');
const github = require('@actions/github');

async function main() {
  try {
    const GH_USER = process.env.GH_USER || 'omariosouto';
    const YOUTUBE_CHANNEL_FEED = process.env.YOUTUBE_CHANNEL_FEED || 'https://www.youtube.com/feeds/videos.xml?channel_id=UCzR2u5RWXWjUh7CwLSvbitA';

    console.log(GH_USER, YOUTUBE_CHANNEL_FEED);

    const response = await fetch(YOUTUBE_CHANNEL_FEED)
      .then(async (res) => {
        const response = await res.text();
        const parsedResponse = xmlParser.parse(response);
        return parsedResponse.feed.entry.map((video) => {
          const description = video['media:group']['media:description']
            .split('\n')[0]
            .replace(/\\\\o/g, '')
            .replace(/\\o/g, '');

          return {
            id: video['yt:videoId'],
            date: new Date(video.published).toISOString(),
            link: `https://youtu.be/${video['yt:videoId']}`,
            title: video.title,
            description,
            thumbnail: `http://i1.ytimg.com/vi/${video['yt:videoId']}/hqdefault.jpg`,
          };
        });
      })

    const totalYouTubeVideos = response.length;

    // ======================================
    // [OUTPUT] =============================
    // ======================================
    core.setOutput("yt_total", totalYouTubeVideos);
    const time = (new Date()).toTimeString();
    core.setOutput("time", time);
    core.setOutput("time", time);
    core.setOutput("status", "success");
    const payload = JSON.stringify(github.context.payload, undefined, 2)
    console.log(`The event payload: ${payload}`);
  } catch (error) {
    core.setFailed(error.message);
  }
}

main();