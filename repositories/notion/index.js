require('dotenv').config();
const { Client } = require('@notionhq/client');
const { types } = require('../githubStars/types')
// https://developers.notion.com/reference/get-database
const ID_CONTRIBUTIONS_DB = 'a3f56bec1a214c058f7d7f2ccfb63d49';

const notion = new Client({
  auth: process.env.NOTION_TOKEN,
});

const repository = {
  async getAllContributions() {
    const contributionsFromNotion = await notion.databases.query({
      database_id: ID_CONTRIBUTIONS_DB,
    });

    const contributions = contributionsFromNotion.results
      .map((contribution) => {
        const fields = contribution.properties;
        
        const title = fields.Title.title.reduce((acc, item) => `${acc}${item.text.content}`, '');
        if(!title) return null;

        const status = fields.Status.select.name;
        const contributionDTO = {
          title,
          url: fields.URL.url,
          description: fields.Description.rich_text.reduce((acc, item) => `${acc}${item.text.content}`, ''),
          type: fields.Type.select.name,
          date: new Date(fields.Date.date.start).toISOString(),
        };
        
        if(status !== 'DONE') return null;

        const hasValidType = types[contributionDTO.type] !== undefined;
        if (!hasValidType) return null;

        return contributionDTO;
      })
      .filter(Boolean);

    return contributions;
  },
};

module.exports = repository;