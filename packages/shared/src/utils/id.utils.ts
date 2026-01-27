export function slugify(text: string): string {
  return text
    .toString()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function generateObjectId(city: string, country: string): string {
  const citySlug = slugify(city);
  const countrySlug = slugify(country);
  return `${citySlug}-${countrySlug}`;
}
