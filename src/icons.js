const paths={
 leaf:'<path d="M19.5 3.5c.5 9-3.5 15.5-10 14C3 16 3.5 9 8 7c4-2 7-1.5 11.5-3.5Z"/><path d="M4 21c1-6 5-9 10-12"/>',
 sun:'<circle cx="12" cy="12" r="4"/><path d="M12 2v2m0 16v2M2 12h2m16 0h2M5 5l1.5 1.5m11 11L19 19M5 19l1.5-1.5m11-11L19 5"/>',
 moon:'<path d="M20.5 13A8.5 8.5 0 0 1 11 3.5 8.5 8.5 0 1 0 20.5 13Z"/><path d="m18 3 .7 2.3L21 6l-2.3.7L18 9l-.7-2.3L15 6l2.3-.7Z"/>',
 spark:'<path d="m12 3 2.5 6.5L21 12l-6.5 2.5L12 21l-2.5-6.5L3 12l6.5-2.5Z"/>',
 check:'<path d="m5 12 4.5 4.5L19 7"/>',
 camera:'<path d="m8 5 1-2h6l1 2h4a1 1 0 0 1 1 1v13H3V6a1 1 0 0 1 1-1Z"/><circle cx="12" cy="12" r="4"/>',
 arrow:'<path d="M5 12h14m-6-6 6 6-6 6"/>',
 sprout:'<path d="M12 21v-9M12 15C5 16 3 12 3 7c6 0 9 3 9 8Zm0-3c0-6 3-8 9-8 0 5-3 8-9 8Z"/>',
 plus:'<path d="M12 5v14M5 12h14"/>',minus:'<path d="M5 12h14"/>',
 rotate:'<path d="M19 8a8 8 0 1 0 1 8M19 3v5h-5"/>',
 focus:'<path d="M8 3H3v5m13-5h5v5M3 16v5h5m13-5v5h-5"/><circle cx="12" cy="12" r="3"/>',
 edit:'<path d="m14 5 5 5M4 20l1-6L16 3l5 5-11 11Z"/>',
 walk:'<path d="M7 3c-2 0-3 3-3 5s1 4 3 4 3-1 3-3-1-6-3-6Zm-.5 12h3v5h-3ZM17 9c-2 0-3 4-3 6s1 3 3 3 3-2 3-4-1-5-3-5Zm-1.5-6h3v3h-3Z"/>',
 chair:'<path d="M6 13V5a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v8M4 13h16v4H4Zm2 4v4m12-4v4M6 8h12"/>',
 people:'<circle cx="9" cy="7" r="3"/><path d="M3 21v-4a6 6 0 0 1 12 0v4m1-17a3 3 0 0 1 0 6m2 3c3 0 4 3 4 5v3"/>',
 book:'<path d="M4 3h13a2 2 0 0 1 2 2v16H6a2 2 0 0 1-2-2Zm0 14h15M8 3v14m3-9h5m-5 4h4"/>',
 map:'<path d="m3 5 6-2 6 2 6-2v16l-6 2-6-2-6 2ZM9 3v16m6-14v16"/>',
 'sound-off':'<path d="M3 10h4l5-5v14l-5-5H3Zm13 0 5 5m0-5-5 5"/>',
 sound:'<path d="M3 10h4l5-5v14l-5-5H3Zm13-2c3 2 3 6 0 8m3-11c5 4 5 10 0 14"/>',
 undo:'<path d="M4 4v6h6M4 10c2-7 15-6 15 2 0 6-6 8-10 6"/>',redo:'<path d="M20 4v6h-6m6 0C18 3 5 4 5 12c0 6 6 8 10 6"/>',
 close:'<path d="m6 6 12 12M6 18 18 6"/>',
 grid:'<rect x="3" y="3" width="18" height="18" rx="3"/><path d="M3 9h18M3 15h18M9 3v18m6-18v18"/>',
 heart:'<path d="M12 21S2 15 2 8a5 5 0 0 1 10-1 5 5 0 0 1 10 1c0 7-10 13-10 13Z"/>',
 download:'<path d="M12 3v12m-5-5 5 5 5-5M4 17v4h16v-4"/>'
};
export const icon=name=>`<svg class="icon" viewBox="0 0 24 24" aria-hidden="true">${paths[name]||paths.leaf}</svg>`;
export function hydrateIcons(root=document){root.querySelectorAll('[data-icon]').forEach(el=>el.innerHTML=icon(el.dataset.icon));}
