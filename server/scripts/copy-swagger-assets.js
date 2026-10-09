// Vercel only: copy Swagger UI's static assets into the static output dir so
// /api/docs/*.css|js are served by the CDN (the serverless bundle doesn't
// include swagger-ui-dist's asset files). index.* is skipped on purpose so
// /api/docs itself is still rendered by swagger-ui-express.
const fs = require('fs');
const path = require('path');

const src = path.dirname(
  require.resolve('swagger-ui-dist/package.json', {
    paths: [path.dirname(require.resolve('swagger-ui-express'))],
  }),
);
const dest = path.join(__dirname, '..', 'public', 'api', 'docs');
fs.mkdirSync(dest, { recursive: true });
for (const file of fs.readdirSync(src)) {
  if (/^(swagger-ui.*\.(css|js)|favicon-.*\.png)$/.test(file))
    fs.copyFileSync(path.join(src, file), path.join(dest, file));
}
