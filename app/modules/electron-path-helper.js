const path = require('path')

exports.getHtmlAbsolutePath = (filename) => {
  // return `app/renderer/html/${filename}.html`;
  return path.join('app/renderer/html', `${filename}.html`);
}