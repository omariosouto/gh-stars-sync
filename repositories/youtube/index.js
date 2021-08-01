const fetch = require('node-fetch');
const xmlParser = require('fast-xml-parser');

const YOUTUBE_CHANNEL_FEED = process.env.YOUTUBE_CHANNEL_FEED || 'https://www.youtube.com/feeds/videos.xml?channel_id=UCzR2u5RWXWjUh7CwLSvbitA';

module.exports = {
  async getLast15Uploads() {
    return await fetch(YOUTUBE_CHANNEL_FEED)
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
            url: `https://youtu.be/${video['yt:videoId']}`,
            title: video.title,
            description,
            thumbnail: `http://i1.ytimg.com/vi/${video['yt:videoId']}/hqdefault.jpg`,
          };
        });
      })
  }
}
