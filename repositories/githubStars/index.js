const fetch = require('node-fetch');
const { getYouTubeVideoId } = require('../../infra/getYouTubeVideoId');
const youtubeService = require('../youtube');
const notionService = require('../notion');
const { differenceBy } = require('lodash');
const { types } = require('./types');

const GH_STARS_TOKEN = process.env.GH_STARS_TOKEN;
const GH_STARS_ENDPOINT = 'https://github-stars-api.herokuapp.com/';

const service = {
  types,
  async addNewContributions() {
    const allContributions = await service.getAllContributions();
    // [Notion]
    const allNotionContributions = await notionService.getAllContributions();
    const newNotionContributions = differenceBy(allNotionContributions, allContributions, 'url');
    // ======================================

    // [YouTube Channel VideoContributions]
    const last15youtubeVideos = await youtubeService.getLast15Uploads();
    const newYouTubeContributions = differenceBy(last15youtubeVideos, allContributions, 'url').map((video) => {
      return {
        title: video.title,
        url: video.url,
        description: video.description,
        type: types.VIDEO_PODCAST,
        date: video.date
      }
    });
    // ======================================

    const newContributions = [
      ...newYouTubeContributions,
      ...newNotionContributions,
    ]

    if (newContributions.length) {
      const query = `
      mutation {
        createContributions(data: [
          ${newContributions.map((contribution) => {
        return `{
              title: "${contribution.title}"
              url: "${contribution.url}"
              description: "${contribution.description}"
              type: ${contribution.type}
              date: "${contribution.date}"
            }`
      }).join('')}
        ]) {
          id
        }
      }
    `;
      console.log(query);
      await fetch('https://github-stars-api.herokuapp.com/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          authorization: GH_STARS_TOKEN,
        },
        body: JSON.stringify({
          query,
        }),
      })
        .then((res) => res.json())
        .then((response) => {
          if (response.errors) {
            console.log(JSON.stringify(response.errors, null, 4));
            throw new Error(response.errors.message);
          };
          console.log('GH_REGISTRY', response)
        });
    }

    return {
      newContributions
    };

  },
  async getAllContributions() {
    return await fetch(GH_STARS_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        authorization: GH_STARS_TOKEN,
      },
      body: JSON.stringify({
        query: `
          query {
            contributions {
              title
              url
            }
          }        
        `,
      }),
    })
      .then((res) => res.json())
      .then((res) => {
        return res.data.contributions.map(({ url }) => {
          if (url.includes('youtu')) {
            return {
              url: `https://youtu.be/${getYouTubeVideoId(url)}`,
            };
          }

          return { url }
        })
      })
  }
};

module.exports = service;
