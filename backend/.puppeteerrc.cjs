/**
 * Puppeteer config — stores Chrome INSIDE the project dir so it persists
 * across Render build → deploy phases.
 */
const { join } = require('path');

module.exports = {
    cacheDirectory: join(__dirname, '.cache', 'puppeteer'),
};
