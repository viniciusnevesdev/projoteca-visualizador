// Consistent local SVGs; imported content is never used as icon markup.
const paths = {
  catalog: '<rect x="3" y="3" width="7" height="7" rx="2"/><rect x="14" y="3" width="7" height="7" rx="2"/><rect x="3" y="14" width="7" height="7" rx="2"/><rect x="14" y="14" width="7" height="7" rx="2"/>',
  projects: '<rect x="4" y="4" width="16" height="17" rx="2"/><path d="M8 4V2m8 2V2M8 10h8m-8 4h8m-8 4h4"/>',
  pending: '<path d="m4 6 1 1 2-2m3 1h10M4 12l1 1 2-2m3 1h10M4 18l1 1 2-2m3 1h10"/>',
  folder: '<path d="M3 7V5a2 2 0 0 1 2-2h5l2 3h7a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2Z"/>',
  file: '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Zm0 0v6h6M8 13h8m-8 4h6"/>',
  upload: '<path d="M12 16V3m-5 5 5-5 5 5M4 16v4a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-4"/>',
  download: '<path d="M12 3v13m-5-5 5 5 5-5M4 16v4a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-4"/>',
  chevron: '<path d="m9 5 7 7-7 7"/>',
  back: '<path d="m15 5-7 7 7 7"/>',
  branch: '<path d="M6 3v10a4 4 0 0 0 4 4h10m-4-4 4 4-4 4"/>',
  code: '<path d="m8 6-6 6 6 6m8-12 6 6-6 6m-3-15-2 18"/>',
  shield: '<path d="m12 2 8 3v6c0 5-4 9-8 11-4-2-8-6-8-11V5Zm-4 10 3 3 5-6"/>',
  search: '<circle cx="10.5" cy="10.5" r="7"/><path d="m16 16 5 5"/>',
  plus: '<path d="M12 4v16M4 12h16"/>',
  edit: '<path d="m15 4 5 5M4 20l5-1L21 7a2 2 0 0 0-5-5L4 14Z"/>',
  check: '<path d="m4 12 5 5L20 6"/>',
  close: '<path d="m6 6 12 12M6 18 18 6"/>',
  clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
  github: '<path d="M9 19c-4 1-4-2-6-2m12 5v-4c0-1-.3-2-1-2 4 0 6-2 6-6 0-1-.4-3-1-3 0-1 0-3-1-4-2 0-3 1-4 1-2-1-4-1-6 0-1 0-2-1-4-1-1 1-1 3-1 4-1 1-1 2-1 3 0 4 2 6 6 6-1 0-1 1-1 2v4"/>',
  laptop: '<rect x="4" y="3" width="16" height="13" rx="2"/><path d="m4 16-2 5h20l-2-5Z"/>',
  compare: '<path d="M8 3v18m8-18v18M4 7l4-4 4 4m0 10 4 4 4-4"/>',
  restore: '<path d="M3 10a9 9 0 1 1 2 8M3 3v7h7m2-3v5l3 2"/>'
};
export function icon(name, className = '') {
  return `<svg class="icon ${className}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">${paths[name] || paths.file}</svg>`;
}
