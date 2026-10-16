import assert from 'node:assert/strict';
import fs from 'node:fs';
import { getOptimizedImageUrl } from '../frontend/src/utils/imageUtils.ts';

console.log('--- Testing Milestone M3 Frontend Deliverables ---');

// 1. Test getOptimizedImageUrl logic
assert.equal(getOptimizedImageUrl(null), '', 'null url should return empty string');
assert.equal(getOptimizedImageUrl(undefined), '', 'undefined url should return empty string');
assert.equal(getOptimizedImageUrl(''), '', 'empty url should return empty string');

const unsplashUrl = 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format';
assert.equal(getOptimizedImageUrl(unsplashUrl), unsplashUrl, 'non-cloudinary url should return unchanged');

const cloudUrl = 'https://res.cloudinary.com/dormispace/image/upload/v1712345678/rooms/room_101.jpg';
const optDefault = getOptimizedImageUrl(cloudUrl);
assert.equal(
  optDefault,
  'https://res.cloudinary.com/dormispace/image/upload/f_auto,q_auto,w_600,c_limit/v1712345678/rooms/room_101.jpg',
  'Default optimization should insert f_auto,q_auto,w_600,c_limit'
);

const optCustomPos = getOptimizedImageUrl(cloudUrl, 1200, 'low');
assert.equal(
  optCustomPos,
  'https://res.cloudinary.com/dormispace/image/upload/f_auto,q_low,w_1200,c_limit/v1712345678/rooms/room_101.jpg',
  'Custom width and quality positional args'
);

const optOptionsObj = getOptimizedImageUrl(cloudUrl, { width: 800, height: 600, quality: 'auto' });
assert.equal(
  optOptionsObj,
  'https://res.cloudinary.com/dormispace/image/upload/f_auto,q_auto,w_800,c_limit,h_600/v1712345678/rooms/room_101.jpg',
  'Options object support'
);

const alreadyOpt = 'https://res.cloudinary.com/dormispace/image/upload/f_auto,q_auto,w_600,c_limit/v1712345678/rooms/room_101.jpg';
assert.equal(getOptimizedImageUrl(alreadyOpt, 800), alreadyOpt, 'Should not duplicate transform if already optimized');

console.log('✓ getOptimizedImageUrl passed all 7 test cases');

// 2. Test index.css for removal of render-blocking @import
const indexCss = fs.readFileSync('frontend/src/index.css', 'utf8');
assert.ok(!indexCss.includes('@import url(\'https://fonts.googleapis.com'), 'index.css must not contain Google Fonts @import');
console.log('✓ index.css Google Fonts @import successfully removed');

// 3. Test index.html for SEO, OpenGraph, Canonical, Theme-color, Preconnects
const indexHtml = fs.readFileSync('frontend/index.html', 'utf8');
assert.ok(indexHtml.includes('<link rel="preconnect" href="https://fonts.googleapis.com"'), 'preconnect to fonts.googleapis.com missing');
assert.ok(indexHtml.includes('<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin'), 'preconnect to fonts.gstatic.com missing');
assert.ok(indexHtml.includes('family=Plus+Jakarta+Sans'), 'Plus Jakarta Sans font stylesheet missing in index.html');
assert.ok(indexHtml.includes('<meta name="theme-color" content="#2563EB"'), 'theme-color meta tag missing');
assert.ok(indexHtml.includes('<link rel="canonical" href="https://www.dormi.space"'), 'canonical link missing');
assert.ok(indexHtml.includes('property="og:title"'), 'OpenGraph og:title missing');
assert.ok(indexHtml.includes('name="twitter:card"'), 'Twitter card tag missing');
console.log('✓ index.html SEO, OG, Twitter, canonical, theme-color, and font preconnects verified');

// 4. Test public/robots.txt and public/sitemap.xml
assert.ok(fs.existsSync('frontend/public/robots.txt'), 'robots.txt missing');
const robots = fs.readFileSync('frontend/public/robots.txt', 'utf8');
assert.ok(robots.includes('User-agent: *') && robots.includes('Allow: /') && robots.includes('sitemap.xml'), 'robots.txt invalid content');

assert.ok(fs.existsSync('frontend/public/sitemap.xml'), 'sitemap.xml missing');
const sitemap = fs.readFileSync('frontend/public/sitemap.xml', 'utf8');
assert.ok(sitemap.includes('https://www.dormi.space/'), 'sitemap.xml missing root URL');
assert.ok(sitemap.includes('https://www.dormi.space/search'), 'sitemap.xml missing search URL');
assert.ok(sitemap.includes('https://www.dormi.space/roommates'), 'sitemap.xml missing roommates URL');
assert.ok(sitemap.includes('https://www.dormi.space/pricing'), 'sitemap.xml missing pricing URL');
assert.ok(sitemap.includes('https://www.dormi.space/about'), 'sitemap.xml missing about URL');
console.log('✓ robots.txt and sitemap.xml verified');

// 5. Test package.json pruned dependencies
const pkg = JSON.parse(fs.readFileSync('frontend/package.json', 'utf8'));
const deps = { ...pkg.dependencies, ...pkg.devDependencies };
assert.ok(!deps['@phosphor-icons/react'], '@phosphor-icons/react must be removed');
assert.ok(!deps['three'], 'three must be removed');
assert.ok(!deps['@react-three/fiber'], '@react-three/fiber must be removed');
assert.ok(!deps['@react-three/drei'], '@react-three/drei must be removed');
console.log('✓ package.json 4 dead dependencies pruned');

// 6. Test vercel.json caching headers
const vercel = JSON.parse(fs.readFileSync('frontend/vercel.json', 'utf8'));
assert.ok(Array.isArray(vercel.headers), 'vercel.json must have headers array');
const assetHeader = vercel.headers.find(h => h.source.includes('/assets/'));
assert.ok(assetHeader, 'vercel.json must configure /assets/ header');
const cacheControl = assetHeader.headers.find(h => h.key === 'Cache-Control');
assert.ok(cacheControl && cacheControl.value.includes('immutable'), 'Cache-Control must specify immutable');
console.log('✓ vercel.json static asset caching headers verified');

// 7. Test HeroSearch aria-label
const heroSearch = fs.readFileSync('frontend/src/components/landing/HeroSearch.tsx', 'utf8');
assert.ok(heroSearch.includes('aria-label="Tìm kiếm phòng theo khu vực, trường đại học, địa chỉ"'), 'HeroSearch query input aria-label missing');
assert.ok(heroSearch.includes('aria-label="Chọn khu vực, quận huyện"'), 'HeroSearch district select aria-label missing');
assert.ok(heroSearch.includes('aria-label="Chọn khoảng giá thuê phòng"'), 'HeroSearch price select aria-label missing');
console.log('✓ HeroSearch aria-labels verified');

console.log('--- ALL M3 FRONTEND CHECKS PASSED SUCCESSFULLY ---');
