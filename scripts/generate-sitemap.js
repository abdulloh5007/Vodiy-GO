const fs = require('fs');
const { globby } = require('globby');

(async () => {
  const domain = 'https://vodiy-go.vercel.app';

  const pages = await globby([
    'src/app/**/*.{js,jsx,ts,tsx}',
    '!src/app/api/**',
    '!src/app/**/layout.{js,jsx,ts,tsx}',
    '!src/app/**/page.module.css',
  ]);

  const urls = pages
    .map(page => {
      let path = page
        .replace('src/app', '')
        .replace(/(page)?\.(js|jsx|ts|tsx)$/, '')
        .replace(/\/index$/, '');

      // Убираем layout-группы (папки в скобках) и динамические параметры
      if (path.includes('(') || path.includes('[')) return null;

      return `${domain}${path}`;
    })
    .filter(Boolean); // убираем null

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map(url => `  <url><loc>${url}</loc></url>`).join('\n')}
</urlset>`;

  fs.writeFileSync('public/sitemap.xml', sitemap);
  console.log('✅ Sitemap создан: public/sitemap.xml');
})();
