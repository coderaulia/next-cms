(function(){
var d=document,$=function(s,c){return(c||d).querySelector(s)},$$=function(s,c){return Array.prototype.slice.call((c||d).querySelectorAll(s))};
var body=d.body,WA=(body.getAttribute('data-wa-number')||'').replace(/\D/g,''),MAIL=body.getAttribute('data-mail')||'';
/* header: solid on scroll + mobile menu */
var hdr=$('.hdr');function onScroll(){hdr.classList.toggle('solid',window.scrollY>24)}onScroll();window.addEventListener('scroll',onScroll,{passive:true});
var burger=$('.burger');burger&&burger.addEventListener('click',function(){var o=hdr.classList.toggle('menu-open');burger.setAttribute('aria-expanded',o)});
$$('.links a').forEach(function(a){a.addEventListener('click',function(){hdr.classList.remove('menu-open');burger&&burger.setAttribute('aria-expanded','false')})});
/* active link */
var secs=$$('main section[id]'),links=$$('.links a[href^="#"]');
if('IntersectionObserver'in window){var so=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){links.forEach(function(l){l.classList.toggle('on',l.getAttribute('href')==='#'+e.target.id)})}})},{rootMargin:'-45% 0px -50% 0px'});secs.forEach(function(s){so.observe(s)})}
/* reveal + counters */
function count(el){var to=parseFloat(el.getAttribute('data-count')),suf=el.getAttribute('data-suf')||'',t0=null,dur=1400;function f(t){if(!t0)t0=t;var p=Math.min((t-t0)/dur,1),e=1-Math.pow(1-p,3);el.textContent=Math.round(to*e).toLocaleString('id-ID')+suf;if(p<1)requestAnimationFrame(f)}requestAnimationFrame(f)}
if('IntersectionObserver'in window){var ro=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){e.target.classList.add('in');$$('[data-count]',e.target).forEach(count);if(e.target.hasAttribute('data-count'))count(e.target);ro.unobserve(e.target)}})},{threshold:.12});$$('.rv').forEach(function(el){ro.observe(el)});$$('[data-count]').forEach(function(el){if(!el.closest('.rv'))ro.observe(el)})}else{$$('.rv').forEach(function(el){el.classList.add('in')})}
/* showcase tabs */
$$('[data-tabs]').forEach(function(box){var tabs=$$('.tab',box),items=$$('.item',box);tabs.forEach(function(t){t.addEventListener('click',function(){tabs.forEach(function(x){x.classList.toggle('on',x===t)});var c=t.getAttribute('data-cat');items.forEach(function(i){i.hidden=c!=='all'&&i.getAttribute('data-cat')!==c})})})});
/* pricing toggle */
$$('[data-pricing]').forEach(function(box){var bs=$$('.toggle button',box);bs.forEach(function(b){b.addEventListener('click',function(){bs.forEach(function(x){x.classList.toggle('on',x===b)});var k=b.getAttribute('data-k');$$('[data-m]',box).forEach(function(p){p.textContent=p.getAttribute('data-'+k);var u=$('small',p.parentNode);if(u)u.textContent=k==='y'?'/ tahun':'/ bulan'})})})});
/* testimonial slider */
$$('.tm').forEach(function(tm){var s=$$('.tm-slide',tm),dots=$('.dots',tm),i=0,timer;s.forEach(function(_,k){var b=d.createElement('i');b.addEventListener('click',function(){go(k)});dots.appendChild(b)});function go(n){i=(n+s.length)%s.length;s.forEach(function(x,k){x.classList.toggle('on',k===i)});$$('i',dots).forEach(function(x,k){x.classList.toggle('on',k===i)})}go(0);$('.prev',tm).addEventListener('click',function(){go(i-1);reset()});$('.next',tm).addEventListener('click',function(){go(i+1);reset()});function reset(){clearInterval(timer);timer=setInterval(function(){go(i+1)},6500)}reset()});
/* WhatsApp buttons */
function wa(text){var u='https://wa.me/'+WA+'?text='+encodeURIComponent(text);window.open(u,'_blank','noopener')}
$$('[data-wa]').forEach(function(b){b.addEventListener('click',function(e){e.preventDefault();wa(b.getAttribute('data-wa'))})});
/* forms: validate, then open WhatsApp (or mail) with the details */
$$('form[data-form]').forEach(function(f){f.addEventListener('submit',function(e){e.preventDefault();var ok=true,lines=[];$$('.fld',f).forEach(function(w){var i=$('input,select,textarea',w),v=(i.value||'').trim(),bad=i.required&&!v;w.classList.toggle('bad',bad);if(bad)ok=false;if(v)lines.push($('label',w).textContent.replace('*','').trim()+': '+v)});if(!ok)return;var msg=(f.getAttribute('data-intro')||'Halo, saya ingin bertanya.')+'\n\n'+lines.join('\n'),t=$('.ok',f);if(WA){wa(msg)}else if(MAIL){location.href='mailto:'+MAIL+'?subject='+encodeURIComponent(f.getAttribute('data-subject')||'Pesan dari website')+'&body='+encodeURIComponent(msg)}if(t){t.classList.add('show');t.textContent='Terima kasih! Pesanmu sudah disiapkan di WhatsApp, tinggal kirim.'}f.reset()})});
/* footer year */
$$('[data-year]').forEach(function(y){y.textContent=new Date().getFullYear()});
/* min date for date inputs */
$$('input[type=date]').forEach(function(i){var t=new Date(),m=t.getMonth()+1,dd=t.getDate();i.min=t.getFullYear()+'-'+(m<10?'0':'')+m+'-'+(dd<10?'0':'')+dd});
})();
