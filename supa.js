/* Client Supabase partagé (boutique + /admin). sb = null tant que config.js n'est pas rempli. */
window.sb=null;
(function(){
  const c=window.ISO_CONFIG||{};
  if(!window.supabase||!c.url||!c.key||/VOTRE/.test(c.url+c.key))return;
  try{window.sb=window.supabase.createClient(c.url,c.key)}catch(e){console.error(e)}
})();
