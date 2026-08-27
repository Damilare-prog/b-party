(function(){
  const cfg=window.BPARTY_CONFIG||{}; const api=(cfg.API_BASE_URL||'').replace(/\/$/,'');
  const ref=new URLSearchParams(location.search).get('ref');
  window.BParty={api,ref};
  document.querySelectorAll('[data-ref-link]').forEach(a=>{const base=a.getAttribute('href'); if(ref && base) a.href=base+(base.includes('?')?'&':'?')+'ref='+encodeURIComponent(ref);});
})();
