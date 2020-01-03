#!/usr/bin/env node

const { GITHUB_LINK, NPM_LINK } = require('../../constants');

const messages = {
  answerNotFoundErrorWhileRunningScript: {
    message:
      '\nAn error occurred while running <primary>{scriptName}<primary> script. Could not find <secondary>{answer}<secondary>.\n\nPlease report this at <primary>{githubLink}<primary> or <primary>{npmLink}<primary>',
    defaultOptions: {
      npmLink: NPM_LINK,
      githubLink: GITHUB_LINK,
    },
  },
};

module.exports = messages;
