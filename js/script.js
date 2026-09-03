// Shared behaviour for StudentBloom demo
(function(){
  // Profile handling
  function loadProfile(){
    const p = JSON.parse(localStorage.getItem('studentbloom_profile')||'{}');
    const defaults = {name:'Mia',full:'Mia Aurelia Hope',email:'Mia@student.com',phone:'01-2345 6789',semester:'1',semLabel:'Diploma Sem 1'};
    return Object.assign({},defaults,p);
  }
  function saveProfile(p){ localStorage.setItem('studentbloom_profile',JSON.stringify(p)); }

  const profile = loadProfile();
  // populate UI if present
  document.addEventListener('DOMContentLoaded', ()=>{
    const welcome = document.getElementById('welcome-msg');
    if(welcome) welcome.textContent = `Welcome back, ${profile.name}!`;
    const nameEl = document.getElementById('profile-name'); if(nameEl) nameEl.textContent = profile.name;
    const semEl = document.getElementById('profile-sem'); if(semEl) semEl.textContent = profile.semLabel;
    const fullEl = document.getElementById('full-name'); if(fullEl) fullEl.textContent = profile.full;
    const emailEl = document.getElementById('email'); if(emailEl) emailEl.textContent = profile.email;
    const phoneEl = document.getElementById('phone'); if(phoneEl) phoneEl.textContent = profile.phone;
    const semesterEl = document.getElementById('semester'); if(semesterEl) semesterEl.textContent = profile.semester;

    // Edit profile
    const editBtn = document.getElementById('edit-profile');
    if(editBtn){
      const form = document.getElementById('edit-form');
      const inputFull = document.getElementById('input-fullname');
      const inputEmail = document.getElementById('input-email');
      const inputPhone = document.getElementById('input-phone');
      const inputSem = document.getElementById('input-sem');
      editBtn.addEventListener('click', ()=>{
        form.classList.remove('hidden');
        inputFull.value = profile.full; inputEmail.value = profile.email; inputPhone.value = profile.phone; inputSem.value = profile.semester;
      });
      document.getElementById('cancel-profile').addEventListener('click', ()=>{ form.classList.add('hidden'); });
      document.getElementById('save-profile').addEventListener('click',(e)=>{
        e.preventDefault();
        profile.full = inputFull.value||profile.full;
        profile.email = inputEmail.value||profile.email;
        profile.phone = inputPhone.value||profile.phone;
        profile.semester = inputSem.value||profile.semester;
        profile.name = profile.full.split(' ')[0] || profile.name;
        profile.semLabel = 'Diploma Sem '+profile.semester;
        saveProfile(profile);
        location.reload();
      });
    }

    // Mood interactions
    const moodBtns = document.querySelectorAll('.mood-btn');
    let current = null;
    moodBtns.forEach(b=>b.addEventListener('click', ()=>{
      moodBtns.forEach(x=>x.classList.remove('active'));
      b.classList.add('active'); current = b.dataset.mood;
      const s = document.querySelector('.mood-selected'); if(s) s.textContent = `You selected: ${current}`;
    }));

    const saveBtn = document.getElementById('save-mood');
    if(saveBtn){
      saveBtn.addEventListener('click', ()=>{
        if(!current){ alert('Please select a mood first.'); return; }
        const note = document.getElementById('mood-note')?document.getElementById('mood-note').value:'';
        const today = new Date().toISOString().slice(0,10);
        const store = JSON.parse(localStorage.getItem('studentbloom_moods')||'{}');
        store[today] = {mood:current,note:note,ts:new Date().toISOString()};
        localStorage.setItem('studentbloom_moods',JSON.stringify(store));
        alert('Mood saved — great job checking in today!');
        // update streak UI if visible
        updateStreak();
        updateWeek();
      });
    }

    // Booking modal
    const bookBtn = document.getElementById('book-now');
    const modal = document.getElementById('booking-modal');
    if(bookBtn && modal){
      bookBtn.addEventListener('click', ()=>{ modal.setAttribute('aria-hidden','false'); });
      modal.querySelector('.modal-close').addEventListener('click', ()=>{ modal.setAttribute('aria-hidden','true'); });
      modal.querySelector('form').addEventListener('submit',(e)=>{
        e.preventDefault(); alert('Appointment request sent (demo).'); modal.setAttribute('aria-hidden','true');
      });
    }

    // initialize streak and week view
    updateStreak();
    updateWeek();
  });

  function getMoodStore(){ return JSON.parse(localStorage.getItem('studentbloom_moods')||'{}'); }

  function updateStreak(){
    const store = getMoodStore();
    const dates = Object.keys(store).sort().reverse(); // newest first
    if(dates.length===0){ setStreakText('No check-ins yet.'); return; }
    // compute consecutive days ending today
    let streak=0; let day = new Date();
    for(;;){
      const key = day.toISOString().slice(0,10);
      if(store[key]){ streak++; day.setDate(day.getDate()-1); } else break;
    }
    setStreakText(`${streak} Days in a row! Great Job! Keep it up!`);
  }
  function setStreakText(t){ const el = document.getElementById('streak-text'); if(el) el.textContent = t; }

  function updateWeek(){
    const el = document.getElementById('week-moods');
    if(!el) return;
    el.innerHTML='';
    const store = getMoodStore();
    // get last 7 days Monday->Sunday sequence
    const bars = [];
    const today = new Date();
    for(let i=6;i>=0;i--){ const d = new Date(); d.setDate(today.getDate()-i); const k=d.toISOString().slice(0,10); bars.push(store[k]?store[k].mood:null); }
    bars.forEach(m=>{
      const div = document.createElement('div'); div.className='bar';
      const h = m? 40 + (m==='Happy'?50:(m==='Okay'?40:(m==='Tired'?30:(m==='Stressed'?25:20)))):6;
      div.style.height = h + 'px'; div.title = m||'No entry'; el.appendChild(div);
    });
  }

})();
