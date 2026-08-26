/* Боковая навигация. Меняешь здесь — меняется на всех страницах. */
var PAGES = [
  {f:"index.html",n:"01",t:"Первые 7 дней",todo:false},
  {f:"pages/2-biznes.html",n:"02",t:"Бизнес и продукты",todo:false},
  {f:"pages/3-cikl.html",n:"03",t:"Годовой цикл",todo:false},
  {f:"pages/4-sistemy.html",n:"04",t:"Системы",todo:false},
  {f:"pages/6-ritm.html",n:"05",t:"Ритм CMO",todo:false},
  {f:"pages/7-cifry.html",n:"06",t:"Сквозная аналитика",todo:true},
  {f:"pages/8-vyvody.html",n:"07",t:"Выводы",todo:false}
];

(function(){
  var file = (location.pathname.split('/').pop() || 'index.html');
  if(!file) file = 'index.html';
  var inPages = location.pathname.indexOf('/pages/') > -1;
  var base = inPages ? '../' : '';
  var here = inPages ? 'pages/' + file : file;

  var links = PAGES.map(function(p){
    var on = p.f === here ? ' class="on"' : '';
    var todo = p.todo ? '<span class="rn-todo">•</span>' : '<span></span>';
    return '<a href="' + base + p.f + '"' + on + '><span class="rn-num">' + p.n +
           '</span><span>' + p.t + '</span>' + todo + '</a>';
  }).join('');

  var rail = document.getElementById('rail');
  if(rail){
    rail.innerHTML =
      '<div class="rail-mark">' +
        '<span class="rail-logo" aria-hidden="true"></span>' +
        '<div class="rail-word">Передача<br>маркетинга<span>iHub Admissions</span></div>' +
      '</div>' +
      '<nav class="rail-nav">' + links + '</nav>' +
      '<div class="rail-foot">Жёлтым отмечено то,<br>что осталось заполнить.</div>';
  }

  var i = PAGES.findIndex(function(p){ return p.f === here; });
  var foot = document.getElementById('pagenav');
  if(foot && i > -1){
    var out = '';
    if(i > 0) out += '<a href="' + base + PAGES[i-1].f + '"><span>← Назад</span><b>' + PAGES[i-1].t + '</b></a>';
    if(i < PAGES.length-1) out += '<a class="nx" href="' + base + PAGES[i+1].f + '"><span>Дальше →</span><b>' + PAGES[i+1].t + '</b></a>';
    foot.innerHTML = out;
  }
})();

/* Кнопка «наверх» — появляется после прокрутки на экран вниз. */
(function(){
  var btn = document.createElement('button');
  btn.className = 'totop';
  btn.type = 'button';
  btn.setAttribute('aria-label','Наверх');
  btn.title = 'Наверх';
  btn.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 19V5M5 12l7-7 7 7"/></svg>';
  document.body.appendChild(btn);

  var soft = !window.matchMedia || !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  btn.addEventListener('click', function(){
    window.scrollTo({ top: 0, behavior: soft ? 'smooth' : 'auto' });
  });

  var tick = false;
  function check(){
    btn.classList.toggle('on', window.scrollY > window.innerHeight * 0.6);
    tick = false;
  }
  window.addEventListener('scroll', function(){
    if(!tick){ tick = true; window.requestAnimationFrame(check); }
  }, { passive: true });
  check();
})();

/* Увеличение скриншотов по клику. */
(function(){
  var box = document.createElement('div');
  box.className = 'lb';
  box.innerHTML = '<button class="lb-close" type="button" aria-label="Закрыть">\u00d7</button>' +
                  '<img alt=""><p class="lb-cap"></p>';
  document.body.appendChild(box);

  var pic = box.querySelector('img');
  var cap = box.querySelector('.lb-cap');
  var last = null;

  function open(src, alt, text){
    pic.src = src;
    pic.alt = alt || '';
    cap.textContent = text || '';
    cap.style.display = text ? '' : 'none';
    box.classList.add('on');
    document.body.style.overflow = 'hidden';
    box.querySelector('.lb-close').focus();
  }
  function close(){
    box.classList.remove('on');
    document.body.style.overflow = '';
    if(last) last.focus();
  }

  document.addEventListener('click', function(e){
    var img = e.target.closest && e.target.closest('.shot img, .shots img');
    if(img){
      last = img;
      var fig = img.closest('figure');
      var t = fig && fig.querySelector('.shot-cap b');
      open(img.currentSrc || img.src, img.alt, t ? t.textContent : '');
      return;
    }
    if(box.classList.contains('on') && (e.target === box || e.target.closest('.lb-close'))) close();
  });

  document.addEventListener('keydown', function(e){
    if(e.key === 'Escape' && box.classList.contains('on')) close();
  });
})();

/* Календарь месяца в секции «Ритм CMO». Данные правятся здесь, разметка собирается сама. */
var RITM_KEYS = {
  mtg:   'Собрания',
  shoot: 'Съёмочные дни',
  dl:    'Дедлайны',
  key:   'Встреча с Азимом'
};

/* Повторяется каждую неделю. Ключ — день недели: 1 = понедельник, 7 = воскресенье. */
var RITM_WEEKLY = {
  1: [{k:'mtg', t:'10:00', b:'Общее собрание маркетинга и продаж',
       p:'Оба отдела вместе. С этого начинается неделя: сверяем, что делает маркетинг и что происходит в продажах.'}],
  4: [{k:'shoot', b:'Съёмочный день',
       p:'Четверг и пятница — обычные дни съёмок. Сценарии и ТЗ должны быть готовы до четверга, иначе день уходит впустую.'}],
  5: [{k:'mtg', t:'10:00', b:'Итоги недели с отделом маркетинга',
       p:'Разбор недели: какие таски закрыты, какие нет и почему. Проводится один на один с каждым подчинённым, а не общим кругом.'},
      {k:'shoot', b:'Съёмочный день',
       p:'Второй съёмочный день недели.'}]
};

/* Привязано к числу месяца. */
var RITM_DATES = {
  5:  [{k:'dl', b:'Отчёт за прошлый месяц',
        p:'Крайний срок сдачи. Шаблон ежемесячного отчёта — в секции 04.'}],
  15: [{k:'key', b:'Один на один с Азимом',
        p:'Отчёт о проделанной работе плюс планы на следующие месяцы и кварталы. Азим ждёт цифры, конкретику и выводы. Прийти неподготовленным и говорить только о планах — худший вариант этой встречи.'}],
  25: [{k:'dl', b:'Контент-план на следующий месяц',
        p:'До 25-го выложить в общий чат: сам план, дни съёмок и примерные сценарии для рилсов.'}]
};

(function(){
  var host = document.getElementById('ritm-cal');
  if(!host) return;

  var WD = ['Пн','Вт','Ср','Чт','Пт','Сб','Вс'];
  var DAYS = 31;

  function eventsFor(d){
    var wd = ((d - 1) % 7) + 1;
    return (RITM_DATES[d] || []).concat(RITM_WEEKLY[wd] || []);
  }
  function esc(s){
    return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
  }

  var legend = Object.keys(RITM_KEYS).map(function(k){
    return '<span class="cal-key"><i class="k-' + k + '"></i>' + esc(RITM_KEYS[k]) + '</span>';
  }).join('');

  var head = WD.map(function(w){ return '<div class="cal-wd">' + w + '</div>'; }).join('');

  var cells = '';
  for(var d = 1; d <= DAYS; d++){
    var ev = eventsFor(d);
    var seen = {}, dots = '';
    ev.forEach(function(e){
      if(seen[e.k]) return;
      seen[e.k] = 1;
      dots += '<i class="k-' + e.k + '"></i>';
    });
    var wd = WD[(d - 1) % 7];
    cells += '<div class="cal-day' + (ev.length ? ' has' : '') + '" data-d="' + d + '"' +
             (ev.length ? ' tabindex="0" role="button" aria-label="' + wd + ', ' + d + ' число"' : '') +
             '><span class="cal-num">' + d + '</span><span class="cal-dots">' + dots + '</span></div>';
  }

  host.innerHTML =
    '<div class="cal-legend">' + legend + '</div>' +
    '<div class="cal-wrap">' +
      '<div class="cal-grid">' + head + cells + '</div>' +
      '<div class="cal-pop" role="tooltip"></div>' +
    '</div>';

  var wrap = host.querySelector('.cal-wrap');
  var pop  = host.querySelector('.cal-pop');
  var open = null;

  function show(cell){
    var d = +cell.getAttribute('data-d');
    var ev = eventsFor(d);
    if(!ev.length) return;

    pop.innerHTML =
      '<p class="cal-pop-d">' + WD[(d - 1) % 7] + ' · ' + d + ' число</p>' +
      ev.map(function(e){
        return '<div class="cal-ev"><i class="k-' + e.k + '"></i><div><b>' + esc(e.b) +
               (e.t ? '<em>' + esc(e.t) + '</em>' : '') + '</b><span>' + esc(e.p) + '</span></div></div>';
      }).join('');

    if(open) open.classList.remove('on');
    open = cell;
    cell.classList.add('on');
    pop.classList.add('on');

    var l = cell.offsetLeft + cell.offsetWidth / 2 - pop.offsetWidth / 2;
    if(l < 0) l = 0;
    if(l + pop.offsetWidth > wrap.clientWidth) l = wrap.clientWidth - pop.offsetWidth;
    pop.style.left = l + 'px';

    var below = cell.offsetTop + cell.offsetHeight + 9;
    var above = cell.offsetTop - pop.offsetHeight - 9;
    var fits  = below + pop.offsetHeight <= wrap.clientHeight;
    pop.style.top = (fits || above < 0 ? below : above) + 'px';
  }

  function hide(){
    pop.classList.remove('on');
    if(open) open.classList.remove('on');
    open = null;
  }

  var hoverable = !window.matchMedia || window.matchMedia('(hover: hover)').matches;

  if(hoverable){
    wrap.addEventListener('mouseover', function(e){
      var cell = e.target.closest && e.target.closest('.cal-day.has');
      if(cell && cell !== open) show(cell);
    });
    wrap.addEventListener('mouseleave', hide);
  } else {
    var wasOpen = null;
    wrap.addEventListener('pointerdown', function(e){
      var cell = e.target.closest && e.target.closest('.cal-day.has');
      wasOpen = (cell && cell === open) ? cell : null;
    });
    wrap.addEventListener('click', function(e){
      var cell = e.target.closest && e.target.closest('.cal-day.has');
      if(!cell){ hide(); return; }
      if(cell === wasOpen) hide(); else show(cell);
    });
  }

  wrap.addEventListener('focusin', function(e){
    var cell = e.target.closest && e.target.closest('.cal-day.has');
    if(cell) show(cell);
  });
  document.addEventListener('keydown', function(e){
    if(e.key === 'Escape') hide();
  });
  window.addEventListener('resize', hide, { passive: true });
})();
