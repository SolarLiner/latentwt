if(!self.define){let e,t={};const n=(n,s)=>(n=new URL(n+".js",s).href,t[n]||new Promise((t=>{if("document"in self){const e=document.createElement("script");e.src=n,e.onload=t,document.head.appendChild(e)}else e=n,importScripts(n),t()})).then((()=>{let e=t[n];if(!e)throw new Error(`Module ${n} didn’t register its module`);return e})));self.define=(s,i)=>{const o=e||("document"in self?document.currentScript.src:"")||location.href;if(t[o])return;let r={};const d=e=>n(e,o),c={module:{uri:o},exports:r,require:d};t[o]=Promise.all(s.map((e=>c[e]||d(e)))).then((e=>(i(...e),r)))}}define(["./workbox-74eda642"],(function(e){"use strict";self.addEventListener("message",(e=>{e.data&&"SKIP_WAITING"===e.data.type&&self.skipWaiting()})),e.precacheAndRoute([{url:"manifest.webmanifest",revision:"41b1edce6b92884a1b33ef779eddc81d"}],{}),e.cleanupOutdatedCaches(),e.registerRoute(new e.NavigationRoute(e.createHandlerBoundToURL("index.html")))}));