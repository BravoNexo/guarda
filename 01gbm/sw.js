'use strict';
// No API, identity, config or personal response is cached.
self.addEventListener('fetch',event=>{if(event.request.method!=='GET')return;const url=new URL(event.request.url);if(url.origin!==self.location.origin)return;/* Network-only while cutover is pending. */});
