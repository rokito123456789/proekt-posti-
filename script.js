document.addEventListener('DOMContentLoaded',()=>{
  const sendBtn=document.getElementById('switch');
  const lampToggle = document.getElementById('lamp-toggle');
  const lampElem = document.querySelector('.lamp');
  const lampArea = document.querySelector('.lamp-area');
  let lampOn = false;
  const zone=document.getElementById('drop-zone');
  const msgInput=document.getElementById('message');

  let audioCtx = null;
  function getAudioCtx(){
    if(!audioCtx){
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    if(audioCtx.state === 'suspended') audioCtx.resume();
    return audioCtx;
  }

  function playBeep(freq = 880, duration = 0.12, type = 'sine'){
    try{
      const ctx = getAudioCtx();
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.type = type;
      o.frequency.value = freq;
      g.gain.setValueAtTime(0.0001, ctx.currentTime);
      g.gain.exponentialRampToValueAtTime(0.25, ctx.currentTime + 0.01);
      o.connect(g);
      g.connect(ctx.destination);
      o.start();
      g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + duration);
      o.stop(ctx.currentTime + duration + 0.02);
    }catch(e){
      // Audio may be blocked; fail silently
    }
  }

  lampToggle.addEventListener('click', ()=>{
    lampOn = !lampOn;
    setLampState(lampOn);
  });

  const modeToggle = document.getElementById('mode-toggle');
  let isDay = false;
  modeToggle.addEventListener('click', ()=>{
    isDay = !isDay;
    setMode(isDay ? 'day' : 'night');
  });

  sendBtn.addEventListener('click',()=>{
    // play a short switch-on beep for sending
    playBeep(950, 0.10, 'triangle');
    const text = msgInput.value.trim() || 'Активност!';
    const env = createEnvelope(text);
    zone.appendChild(env);
    // Allow pointer events so user can click to open
    env.style.pointerEvents='auto';
    // Remove after some time
    setTimeout(()=>{
      env.classList.add('open');
      // softer tone when envelope opens
      playBeep(620, 0.16, 'sine');
    },900);
    setTimeout(()=>{
      env.addEventListener('click', ()=>{
        alert(text);
      }, {once:true});
    },950);
    // cleanup after 8s
    setTimeout(()=>{
      env.remove();
    },8000);
  });

  function createEnvelope(text){
    const el=document.createElement('div');
    el.className='envelope drop';
    el.style.left = (50 + (Math.random()*18-9)) + '%';
    const flap=document.createElement('div');
    flap.className='flap';
    const body=document.createElement('div');
    body.className='body';
    const t=document.createElement('div');
    t.className='text';
    t.textContent = text;
    body.appendChild(t);
    // Add date
    const dateEl = document.createElement('div');
    dateEl.className = 'date';
    const now = new Date();
    const options = { day: 'numeric', month: 'long', year: 'numeric' };
    dateEl.textContent = now.toLocaleDateString('bg-BG', options);
    body.appendChild(dateEl);
    // create a note that will pop out when envelope opens
    const note = document.createElement('div');
    note.className = 'note';
    note.textContent = text;
    el.appendChild(note);
    el.appendChild(flap);
    el.appendChild(body);
    return el;
  }

  function setLampState(on){
    lampOn = !!on;
    if(lampOn){
      lampElem.classList.remove('off');
      lampElem.classList.add('on');
      lampArea.classList.add('light');
      lampToggle.textContent = 'Изключи лампата';
      playBeep(1200, 0.09, 'sawtooth');
    }else{
      lampElem.classList.remove('on');
      lampElem.classList.add('off');
      lampArea.classList.remove('light');
      lampToggle.textContent = 'Включи лампата';
      playBeep(320, 0.08, 'sine');
    }
  }

  function setMode(mode){
    const stage = document.querySelector('.stage');
    if(mode === 'day'){
      lampArea.classList.add('day');
      lampArea.classList.remove('night');
      stage.classList.add('day');
      modeToggle.textContent = 'Нощ';
      // during day, ensure lamp looks off
      lampElem.classList.remove('on');
      lampElem.classList.add('off');
      lampArea.classList.remove('light');
    }else{
      lampArea.classList.remove('day');
      lampArea.classList.add('night');
      stage.classList.remove('day');
      modeToggle.textContent = 'Ден';
    }
  }

  // initialize mode (night by default)
  setMode('night');
});
