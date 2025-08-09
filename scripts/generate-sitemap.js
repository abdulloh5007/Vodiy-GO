const fs = require('fs');

(async () => {
  const { globby } = await import('globby'); // ✅ правильный импорт
  
  // Ищем все страницы в папке pages
  const pages = await globby([
    'pages/**/*.js',
    'pages/**/*.tsx',
    '!pages/_*.js',
    '!pages/_*.tsx',
    '!pages/api/**'
  ]);

  const domain = 'https://vodiy-go.vercel.app/';

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${pages
  .map(page => {
    const path = page
      .replace('pages', '')
      .replace(/(\.js|\.tsx)$/, '')
      .replace('/index', '');
    const route = path === '/index' ? '' : path;
    return `<url><loc>${domain}${route}</loc></url>`;
  })
  .join('\n')}
</urlset>`;

  fs.writeFileSync('public/sitemap.xml', sitemap);
  console.log('✅ Sitemap создан: public/sitemap.xml');
})();
