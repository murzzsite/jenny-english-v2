(() => {
  const LEAD_ENDPOINT = 'https://lead-relay.leestygpt.workers.dev/lead/FS4WULPEF4';
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fmt = n => n.toLocaleString('ru-RU').replace(/ /g, ' ');

  $('#year').textContent = new Date().getFullYear();

  /* меню */
  const burger = $('#burger'), nav = $('#nav');
  burger.addEventListener('click', () => {
    const o = burger.getAttribute('aria-expanded') !== 'true';
    burger.setAttribute('aria-expanded', o);
    nav.classList.toggle('is-open', o);
  });
  $$('a', nav).forEach(a => a.addEventListener('click', () => { burger.setAttribute('aria-expanded', false); nav.classList.remove('is-open'); }));

  /* часы городов: реальное местное время */
  const clocks = $$('time[data-tz]');
  const tick = () => clocks.forEach(t => {
    t.textContent = new Intl.DateTimeFormat('ru-RU', { hour: '2-digit', minute: '2-digit', timeZone: t.dataset.tz, hour12: false }).format(new Date());
  });
  tick(); setInterval(tick, 15000);

  /* чат в hero */
  const opts = $('#chatOpts'), tail = $('#chatTail'), chat = $('#chat');
  $$('.opt', opts).forEach(b => b.addEventListener('click', () => {
    const me = document.createElement('div');
    me.className = 'chat__row chat__row--me';
    me.innerHTML = '<p class="bub bub--me"></p>';
    const p = $('p', me); p.textContent = b.dataset.say;
    const sm = document.createElement('small'); sm.textContent = b.dataset.tr; p.appendChild(sm);
    chat.insertBefore(me, opts);
    opts.hidden = true;
    setTimeout(() => {
      tail.hidden = false;
      tail.innerHTML = '<div class="chat__row chat__row--them"><img class="chat__av" src="img/jenny-avatar.jpg" width="40" height="40" alt=""><p class="bub bub--them">Great! Let\'s book your first lesson.<small>Отлично! Давайте запишем вас на первый урок.</small></p></div><a class="btn btn--sm" href="#lead">Записаться на бесплатный урок</a>';
    }, reduce ? 0 : 700);
  }));

  /* цена: переключатель + точки */
  const dots = $('#dots');
  for (let i = 0; i < 8; i++) dots.appendChild(document.createElement('i'));
  const priceNum = $('#priceNum'), pricePer = $('#pricePer'), priceTxt = $('#priceTxt');
  const kinds = {
    t: { sum: 12000, per: '1 500', txt: 'Русскоговорящий педагог: удобно на старте, объясняет грамматику понятным языком.' },
    n: { sum: 16000, per: '2 000', txt: 'Носитель языка: живое произношение и разговорная речь, когда база уже есть.' }
  };
  let shown = 12000;
  const setKind = k => {
    const d = kinds[k];
    pricePer.textContent = '8 занятий по ' + d.per + ' ₽';
    priceTxt.textContent = d.txt;
    if (reduce || !window.gsap) { shown = d.sum; priceNum.textContent = fmt(d.sum); return; }
    const o = { v: shown };
    gsap.to(o, { v: d.sum, duration: .7, ease: 'power3.out', onUpdate: () => { shown = Math.round(o.v / 10) * 10; priceNum.textContent = fmt(shown); }, onComplete: () => { shown = d.sum; priceNum.textContent = fmt(d.sum); } });
    gsap.fromTo($$('i', dots), { scale: 0 }, { scale: 1, duration: .5, ease: 'back.out(2)', stagger: .04 });
  };
  $$('#who2 button').forEach(b => b.addEventListener('click', () => {
    $$('#who2 button').forEach(x => { x.classList.toggle('is-active', x === b); x.setAttribute('aria-selected', x === b); });
    setKind(b.dataset.kind);
  }));

  /* кейсы: переключатель */
  const caseImgs = ['img/case-alisa.jpg', 'img/case-kseniya.jpg', 'img/case-yaroslav.jpg'];
  const caseAlt = ['Кейс: Алиса, 7 лет, до и после', 'Кейс: Ксения, 23 года, до и после', 'Кейс: Ярослав, 9 лет, до и после'];
  const caseTabs = $$('#caseTabs button');
  const showCase = i => {
    caseTabs.forEach((b, k) => { b.classList.toggle('is-active', k === i); b.setAttribute('aria-selected', k === i); });
    $$('.cs').forEach((c, k) => { c.hidden = k !== i; });
    const img = $('#caseImg'); img.src = caseImgs[i]; img.alt = caseAlt[i]; $('#casePic').href = caseImgs[i];
    if (!reduce && window.gsap) {
      gsap.fromTo('.cs:not([hidden]) > *', { y: 16, opacity: 0 }, { y: 0, opacity: 1, duration: .5, ease: 'power3.out', stagger: .05, clearProps: 'all' });
      gsap.fromTo(img, { opacity: 0, scale: .97 }, { opacity: 1, scale: 1, duration: .5, ease: 'power3.out', clearProps: 'all' });
    }
  };
  caseTabs.forEach((b, k) => b.addEventListener('click', () => showCase(k)));

  /* форма */
  $$('input[type="tel"]').forEach(input => input.addEventListener('input', e => {
    let v = e.target.value.replace(/\D/g, '');
    if (v.startsWith('8')) v = '7' + v.slice(1);
    if (!v.startsWith('7')) v = '7' + v;
    v = v.slice(0, 11);
    let out = '+7';
    if (v.length > 1) out += ' (' + v.slice(1, 4);
    if (v.length >= 4) out += ') ' + v.slice(4, 7);
    if (v.length >= 7) out += '-' + v.slice(7, 9);
    if (v.length >= 9) out += '-' + v.slice(9, 11);
    e.target.value = out;
  }));
  const form = $('#leadForm');
  form.addEventListener('submit', async e => {
    e.preventDefault();
    const btn = $('button[type="submit"]', form), orig = btn.textContent;
    const payload = {}; new FormData(form).forEach((v, k) => { payload[k] = v; });
    if (payload._gotcha) return;
    if (!payload.consent) { alert('Поставьте отметку о согласии на обработку персональных данных'); return; }
    delete payload.consent;
    if (!payload.name || !payload.phone) { alert('Заполните имя и контактные данные'); return; }
    btn.disabled = true; btn.textContent = 'Отправляем...';
    try {
      const r = await fetch(LEAD_ENDPOINT, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      if (!r.ok) throw new Error('HTTP ' + r.status);
      btn.textContent = 'Заявка отправлена, спасибо!'; form.reset();
    } catch (err) { console.error(err); btn.textContent = 'Ошибка, попробуйте ещё раз'; }
    finally { setTimeout(() => { btn.textContent = orig; btn.disabled = false; }, 3500); }
  });

  /* cookie */
  const ck = $('#cookie');
  if (ck) {
    let seen = false; try { seen = localStorage.getItem('cookie-ok') === '1'; } catch (e) {}
    if (!seen) ck.hidden = false;
    $('#cookie-ok').addEventListener('click', () => { ck.hidden = true; try { localStorage.setItem('cookie-ok', '1'); } catch (e) {} });
  }

  /* календарь месяца: подписи этапов */
  const stages = [
    'Знакомство и оценка уровня: педагог узнаёт, зачем вам английский.',
    'Говорим о том, что нужно именно вам: работа, поездки, школа.',
    'Больше разговора, меньше правил: педагог поправляет по ходу.',
    'Первая неделя позади, речь становится заметно увереннее.',
    'Закрепляем лексику и грамматику на живых примерах.',
    'Отрабатываем сложные места, которые мешают говорить свободно.',
    'Практика без подсказок: вы ведёте разговор сами.',
    'Итоги месяца: что получилось и план на следующий.'
  ];
  const cells = $$('.cell.is-lesson', $('#calGrid'));
  const monthN = $('#monthN'), monthCap = $('#monthCap');
  let cur = -1;
  const setLesson = i => {
    if (i === cur) return; cur = i;
    cells.forEach((c, k) => { c.classList.toggle('is-wait', k > i); c.classList.toggle('is-now', k === i); });
    monthN.textContent = i + 1; monthCap.textContent = stages[i];
  };

  /* без анимации или без GSAP: всё видно сразу */
  if (reduce || !window.gsap || !window.ScrollTrigger) {
    cells.forEach(c => c.classList.remove('is-wait'));
    monthN.textContent = 8; monthCap.textContent = stages[7];
    return;
  }

  gsap.registerPlugin(ScrollTrigger);
  const lenis = window.Lenis ? new Lenis({ lerp: 0.1 }) : null;
  if (lenis) {
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add(t => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
    $$('a[href^="#"]').forEach(a => a.addEventListener('click', e => {
      const id = a.getAttribute('href'); if (id.length < 2) return;
      const t = $(id); if (!t) return; e.preventDefault(); lenis.scrollTo(t, { offset: -64, duration: 1.2 });
    }));
  }

  /* заголовки: слова выезжают из маски */
  $$('[data-split]').forEach(h => {
    const words = h.textContent.trim().split(/\s+/);
    h.setAttribute('aria-label', h.textContent.trim());
    h.innerHTML = words.map(w => `<span class="m" aria-hidden="true"><span class="mi">${w}</span></span>`).join(' ');
    gsap.fromTo($$('.mi', h),
      { clipPath: 'inset(0% -6% 100% -6%)', y: 22 },
      { clipPath: 'inset(-20% -6% -35% -6%)', y: 0, duration: 1.05, ease: 'expo.out', stagger: .05, clearProps: 'clipPath,transform', scrollTrigger: { trigger: h, start: 'top 88%', once: true } });
  });

  /* манифест: слова проявляются по скроллу */
  const idea = $('#idea');
  idea.setAttribute('aria-label', idea.textContent.trim());
  idea.innerHTML = idea.textContent.trim().split(/\s+/).map(w => `<span class="w" aria-hidden="true">${w}</span>`).join(' ');
  gsap.to($$('.w', idea), { opacity: 1, ease: 'none', stagger: .12, scrollTrigger: { trigger: idea, start: 'top 82%', end: 'bottom 45%', scrub: true } });

  /* бегущая строка: скорость зависит от скролла */
  const belt = $('#belt');
  belt.innerHTML += belt.innerHTML;
  let bx = 0, half = 0;
  const measure = () => { half = belt.scrollWidth / 2; };
  measure(); addEventListener('resize', measure);
  gsap.ticker.add(() => {
    const v = lenis ? Math.abs(lenis.velocity) : 0;
    bx -= .6 + Math.min(v * .35, 14);
    if (-bx >= half) bx += half;
    belt.style.transform = `translate3d(${bx}px,0,0)`;
  });

  /* месяц: календарь заполняется по скроллу */
  ScrollTrigger.matchMedia({
    '(min-width: 901px)': () => {
      const pin = $('.month__pin');
      ScrollTrigger.create({
        trigger: '.month', start: 'top top', end: '+=170%', pin: pin, scrub: true,
        onUpdate: s => setLesson(Math.min(7, Math.floor(s.progress * 8)))
      });
    },
    '(max-width: 900px)': () => {
      ScrollTrigger.create({
        trigger: '#cal', start: 'top 75%', end: 'bottom 35%', scrub: true,
        onUpdate: s => setLesson(Math.min(7, Math.floor(s.progress * 8)))
      });
    }
  });
  setLesson(0);

  /* точки и цифра цены появляются при входе в секцию */
  gsap.from($$('i', dots), { scale: 0, duration: .5, ease: 'back.out(2)', stagger: .05, scrollTrigger: { trigger: dots, start: 'top 90%', once: true } });
  gsap.from('.price__num', { yPercent: 40, opacity: 0, duration: 1.2, ease: 'expo.out', scrollTrigger: { trigger: '.price__num', start: 'top 88%', once: true } });

  /* полосы «Кому подходят»: крупные знаки собираются при входе */
  $$('.band__big').forEach(el => gsap.from(el, { opacity: 0, scale: .86, transformOrigin: 'left bottom', duration: 1.2, ease: 'expo.out', scrollTrigger: { trigger: el, start: 'top 85%', once: true } }));
  gsap.from('.clocks p', { y: 40, opacity: 0, duration: .9, ease: 'power3.out', stagger: .07, scrollTrigger: { trigger: '.clocks', start: 'top 85%', once: true } });

  /* картинки грузятся лениво и сдвигают страницу: пересчитываем позиции */
  const refresh = () => ScrollTrigger.refresh();
  addEventListener('load', refresh);
  $$('img[loading="lazy"]').forEach(im => { if (!im.complete) im.addEventListener('load', refresh, { once: true }); });

  /* hero: появление */
  gsap.from('.lede, .hero__act, .hero__fact', { y: 28, opacity: 0, duration: 1, ease: 'power3.out', stagger: .12, delay: .35 });
  gsap.from('.hero__pic > img', { clipPath: 'inset(0 0 100% 0)', duration: 1.4, ease: 'expo.out', delay: .1 });
  gsap.from('.chat', { y: 36, opacity: 0, duration: 1, ease: 'power3.out', delay: .9 });
})();
