const CFG = window.BPARTY_CONFIG || {};
const API = (CFG.API_BASE_URL || '').replace(/\/$/, '');
const REF = new URLSearchParams(location.search).get('ref') || sessionStorage.getItem('bparty_ref') || 'direct';
if (REF !== 'direct') sessionStorage.setItem('bparty_ref', REF);

const modal = document.getElementById('checkoutModal');
const typeEl = document.getElementById('selectedType');
const priceEl = document.getElementById('selectedPrice');
let selectedPrice = 7000, selectedType = 'Early Bird';
let currentWave = null;

function naira(n){return new Intl.NumberFormat('en-NG',{style:'currency',currency:'NGN',maximumFractionDigits:0}).format(n)}
function moneyKobo(kobo){return naira(kobo/100)}

async function loadConfig(){
  if(!API) return;
  try{
    const r=await fetch(`${API}/api/config`); const data=await r.json();
    currentWave=data.wave;
    document.querySelectorAll('.buy-btn').forEach(btn=>{
      const price=Number(btn.dataset.price); const active=data.wave.active && price*100===data.wave.price;
      btn.disabled=!active;
      if(active){btn.textContent='GET TICKET'; btn.dataset.type=data.wave.name;}
    });
    document.querySelectorAll('[data-live-wave]').forEach(el=>el.textContent=data.wave.name);
    document.querySelectorAll('[data-live-price]').forEach(el=>el.textContent=moneyKobo(data.wave.price));
  }catch(e){console.warn('Could not load live ticket config',e)}
}

loadConfig();

document.querySelectorAll('.buy-btn').forEach(btn => btn.addEventListener('click', () => {
  if(btn.disabled) return;
  selectedPrice = Number(btn.dataset.price); selectedType = btn.dataset.type;
  typeEl.textContent = selectedType.toUpperCase(); priceEl.textContent = naira(selectedPrice);
  modal.showModal();
}));

document.getElementById('checkoutForm').addEventListener('submit', async e => {
  e.preventDefault();
  const name=document.getElementById('buyerName').value.trim();
  const email=document.getElementById('buyerEmail').value.trim();
  const phone=document.getElementById('buyerPhone').value.trim();
  const quantity=Math.max(1,Math.min(10,Number(document.getElementById('quantity').value)||1));
  const submit=e.target.querySelector('button[type=submit]'); submit.disabled=true; submit.textContent='Opening Paystack…';
  try{
    if(!API || !CFG.PAYSTACK_PUBLIC_KEY || CFG.PAYSTACK_PUBLIC_KEY.includes('REPLACE')) throw new Error('Add the Worker URL and Paystack public key in config.js first.');
    const init=await fetch(`${API}/api/initialize`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({name,email,phone,quantity,ref:REF,callback_url:`${location.origin}${location.pathname.replace(/[^/]*$/,'')}success.html`})});
    const data=await init.json(); if(!init.ok) throw new Error(data.error||'Could not initialize payment.');
    const popup=new PaystackPop();
    popup.resumeTransaction(data.access_code);
    sessionStorage.setItem('bparty_pending_reference',data.reference);
    modal.close();
  }catch(err){alert(err.message)}finally{submit.disabled=false;submit.textContent='CONTINUE TO PAYMENT';}
});

const saveB=document.getElementById('saveB');
if(saveB) saveB.addEventListener('click',()=>{const v=document.getElementById('yourB').value.trim();if(v){localStorage.setItem('bparty_b',v);document.getElementById('bSaved').textContent=`Your 🅱️ is ${v}. We like that.`;}});
const oldB=localStorage.getItem('bparty_b'); if(oldB && document.getElementById('bSaved')) document.getElementById('bSaved').textContent=`Your 🅱️ is ${oldB}. We like that.`;
