import { test, expect } from '@playwright/test';

test('debug z-index and overflow', async ({ page }) => {
  await page.goto('/');
  await page.waitForTimeout(5000);

  const results = await page.evaluate(() => {
    const info: Record<string, string> = {};
    
    const mapboxMap = document.querySelector('.mapboxgl-map') as HTMLElement;
    if (mapboxMap) {
      const cs = window.getComputedStyle(mapboxMap);
      info['mapboxgl-map overflow'] = cs.overflow;
      info['mapboxgl-map position'] = cs.position;
      info['mapboxgl-map zIndex'] = cs.zIndex;
    }

    const mapContainer = document.querySelector('[class*="mapContainer"]') as HTMLElement;
    if (mapContainer) {
      const cs = window.getComputedStyle(mapContainer);
      info['mapContainer overflow'] = cs.overflow;
      info['mapContainer position'] = cs.position;
      info['mapContainer zIndex'] = cs.zIndex;
    }

    const header = document.querySelector('header') as HTMLElement;
    if (header) {
      const cs = window.getComputedStyle(header);
      info['header position'] = cs.position;
      info['header zIndex'] = cs.zIndex;
      const rect = header.getBoundingClientRect();
      info['header bottom'] = String(rect.bottom);
    }

    const mapWrapper = mapContainer?.parentElement;
    if (mapWrapper) {
      const cs = window.getComputedStyle(mapWrapper);
      info['mapWrapper overflow'] = cs.overflow;
      info['mapWrapper position'] = cs.position;
      info['mapWrapper zIndex'] = cs.zIndex;
      const rect = mapWrapper.getBoundingClientRect();
      info['mapWrapper top'] = String(rect.top);
    }

    return info;
  });

  console.log('DEBUG z-index info:', JSON.stringify(results, null, 2));
  expect(true).toBe(true);
});
