// Los textos viven en el HTML. Este archivo solo agrega comportamiento mediante data-attributes.
const $=(s,r=document)=>r.querySelector(s), $$=(s,r=document)=>[...r.querySelectorAll(s)];
const money=n=>'S/ '+n.toFixed(2);
const MAIL='equipo@wuf.pe';

/* Menú móvil y sección activa */
const burger=$('.burger'),menu=$('#menu');
burger.onclick=()=>burger.setAttribute('aria-expanded',menu.classList.toggle('open'));
menu.addEventListener('click',e=>{if(e.target.matches('a')){menu.classList.remove('open');burger.setAttribute('aria-expanded',false)}});
const spy=new IntersectionObserver(es=>es.forEach(en=>{
  if(en.isIntersecting)$$('#menu a').forEach(a=>a.setAttribute('aria-current',a.getAttribute('href')==='#'+en.target.id))
}),{rootMargin:'-45% 0px -50% 0px'});
$$('main section[id]').forEach(s=>spy.observe(s));

/* Calculadora del hero: S/ 5 = 1 kg; ~10 kg alimenta a un perro un mes (referencial) */
const range=$('#cRange');
function calc(){const v=+range.value,kg=v/5,d=kg/10;
  $('#cAmt').textContent='S/ '+v;$('#cKg').textContent=(kg%1?kg.toFixed(1):kg)+' kg';
  const dn=d<1?'menos de 1 perro':(Math.floor(d)===1?'1 perro':Math.floor(d)+' perros');$('#cDogs').textContent=dn;
  $('#fill').setAttribute('y',212-(v-10)/290*62);}
range.addEventListener('input',calc);calc();

/* Planes: frecuencia */
let period=1;const PER={1:'mensual',2:'bimestral',12:'anual'};
function renderPlans(){$$('.plan').forEach(p=>{
  const base=+p.dataset.price,annual=p.hasAttribute('data-annual'),m=annual?12:period,total=annual?base:base*m;
  $('.js-price',p).textContent=money(annual?base:base);
  $('.js-per',p).textContent=annual?'al año':'al mes';
  if(!annual)$('.js-note',p).textContent=m>1?`Pagas ${money(total)} cada ${m} meses`:'Cobro mensual';
  p.dataset.total=total;p.dataset.freq=annual?'anual':PER[period];});}
$('#period').addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;
  period=+b.dataset.p;$$('#period button').forEach(x=>x.classList.toggle('on',x===b));renderPlans();});
renderPlans();

/* Plan libre y donación única */
const fa=$('#freeAmt'),oa=$('#oneAmt');
const kgTxt=()=>{const k=(+fa.value||0)/5;$('#freeKg').textContent=`Equivale a ${k%1?k.toFixed(1):k} kg de comida al mes`};
fa.addEventListener('input',kgTxt);kgTxt();
$('#chips').addEventListener('click',e=>{if(e.target.matches('button'))oa.value=e.target.textContent});

/* Checkout / formulario */
const dlg=$('#dlg'),form=$('#form'),done=$('#done');let ctx=null;
function open(c){ctx=c;$('#dTitle').textContent=c.title;$('#dSum').textContent=c.sum;form.hidden=false;done.hidden=true;form.reset();$('#dOk').textContent=c.mail?'Enviar solicitud':'Continuar al pago';dlg.showModal();}
document.addEventListener('click',e=>{
  const pb=e.target.closest('.plan [data-checkout]');
  if(pb){const p=pb.closest('.plan');if(pb.dataset.url)return window.open(pb.dataset.url,'_blank','noopener');
    return open({title:'Afiliarme: '+p.dataset.name,sum:`Pagarás ${money(+p.dataset.total)} (${p.dataset.freq}).`,label:`${p.dataset.name} ${money(+p.dataset.total)}`});}
  if(e.target.id==='freeBtn'){const v=+fa.value;if(v<5)return fa.focus(),alert('El mínimo es S/ 5.00');
    if(e.target.dataset.url)return window.open(e.target.dataset.url,'_blank','noopener');
    return open({title:'Plan libre',sum:`Donarás ${money(v)} cada mes.`,label:`Plan libre ${money(v)}/mes`});}
  if(e.target.id==='oneBtn'){const v=+oa.value;if(!(v>0))return oa.focus(),alert('Ingresa un monto válido');
    if(e.target.dataset.url)return window.open(e.target.dataset.url,'_blank','noopener');
    return open({title:'Donación única',sum:`Donarás ${money(v)} por única vez.`,label:`Donación única ${money(v)}`});}
  const ad=e.target.closest('[data-adopt]');
  if(ad){const n=ad.closest('.pet').dataset.name;open({title:'Quiero conocer a '+n,sum:'Déjanos tus datos y te contactaremos.',mail:true,label:n});}
});
form.addEventListener('submit',e=>{
  if(e.submitter&&e.submitter.value==='cancel')return;
  e.preventDefault();if(!form.reportValidity())return;
  const n=form.nombre.value,c=form.correo.value;
  if(ctx.mail){location.href=`mailto:${MAIL}?subject=${encodeURIComponent('Adopción: '+ctx.label)}&body=${encodeURIComponent(`Hola, soy ${n} (${c}) y quiero conocer a ${ctx.label}.`)}`;}
  $('#doneMsg').textContent=ctx.mail?`${n}, abrimos tu correo para enviar la solicitud.`:`${n}, registramos: ${ctx.label}. Demostración: no se realizó ningún cobro.`;
  form.hidden=true;done.hidden=false;});
$('#doneClose').onclick=()=>dlg.close();

/* Adopta: filtro (usa el atributo hidden, no depende del orden del HTML) */
$('#filter').addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;
  $$('#filter button').forEach(x=>x.classList.toggle('on',x===b));
  $$('.pet').forEach(p=>p.hidden=b.dataset.f!=='all'&&p.dataset.type!==b.dataset.f);});

/* Contadores */
const io=new IntersectionObserver(es=>es.forEach(en=>{if(!en.isIntersecting)return;io.unobserve(en.target);
  const el=en.target,end=+el.dataset.n;let t0;
  const f=t=>{t0??=t;const k=Math.min((t-t0)/1300,1);el.textContent=Math.round(end*(1-Math.pow(1-k,3)));if(k<1)requestAnimationFrame(f)};requestAnimationFrame(f);}),{threshold:.6});
$$('[data-n]').forEach(el=>io.observe(el));
