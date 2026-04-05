// Countdown Timer
function updateCountdown() {
  const wedding = new Date('2027-03-13T16:30:00');
  const now = new Date();
  const diff = wedding - now;
  if (diff <= 0) {
    document.getElementById('cd-days').textContent = '0';
    document.getElementById('cd-hours').textContent = '0';
    document.getElementById('cd-mins').textContent = '0';
    document.getElementById('cd-secs').textContent = '0';
    return;
  }
  const d = Math.floor(diff / 86400000);
  const h = Math.floor((diff % 86400000) / 3600000);
  const m = Math.floor((diff % 3600000) / 60000);
  const s = Math.floor((diff % 60000) / 1000);
  document.getElementById('cd-days').textContent = d;
  document.getElementById('cd-hours').textContent = String(h).padStart(2,'0');
  document.getElementById('cd-mins').textContent = String(m).padStart(2,'0');
  document.getElementById('cd-secs').textContent = String(s).padStart(2,'0');
}
updateCountdown();
setInterval(updateCountdown, 1000);

// ── RSVP SYSTEM ──
const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbwqelWv1lYUvM7ZOQSlSN_omIlESt6h-LsyHG-VxsTrMPGZ18K72Srf_r0y2fdhQolc/exec';
let currentCode = '';
let guestData = [];

async function lookupCode() {
  const code = document.getElementById('rsvp-code').value.trim().toUpperCase();
  if (!code) return;
  document.getElementById('rsvp-code-error').style.display = 'none';

  document.getElementById('rsvp-code-step').style.display = 'none';
  document.getElementById('rsvp-guests-step').style.display = 'block';
  document.getElementById('rsvp-loading').style.display = 'block';
  document.getElementById('rsvp-guest-cards').style.display = 'none';

  try {
    const res = await fetch(`${SCRIPT_URL}?code=${encodeURIComponent(code)}`);
    const data = await res.json();

    if (!data.found) {
      document.getElementById('rsvp-guests-step').style.display = 'none';
      document.getElementById('rsvp-code-step').style.display = 'block';
      document.getElementById('rsvp-code-error').style.display = 'block';
      return;
    }

    currentCode = data.code;
    guestData = data.attendees;
    renderGuestCards(data.attendees);

    document.getElementById('rsvp-loading').style.display = 'none';
    document.getElementById('rsvp-guest-cards').style.display = 'block';

  } catch (err) {
    document.getElementById('rsvp-guests-step').style.display = 'none';
    document.getElementById('rsvp-code-step').style.display = 'block';
    document.getElementById('rsvp-code-error').textContent = 'Something went wrong. Please try again.';
    document.getElementById('rsvp-code-error').style.display = 'block';
  }
}

function renderGuestCards(attendees) {
  const container = document.getElementById('guest-cards-container');
  container.innerHTML = '';
  attendees.forEach((name, i) => {
    const isPlus = name.toString().toUpperCase() === 'PLUS1' || name === '';
    const card = document.createElement('div');
    card.className = 'guest-card';
    card.innerHTML = `
      <div class="guest-card-name">
        ${isPlus
          ? `<input type="text" id="guest-name-${i}" placeholder="Guest name (plus-one)" />`
          : `<span>${name}</span><input type="hidden" id="guest-name-${i}" value="${name}" />`
        }
      </div>
      <div class="guest-card-fields">
        <span class="attending-label">Attending?</span>
        <div class="attending-toggle">
          <button type="button" class="attend-btn" id="btn-yes-${i}" onclick="setAttending(${i}, 'Yes')">✓ Yes</button>
          <button type="button" class="attend-btn" id="btn-no-${i}"  onclick="setAttending(${i}, 'No')">✗ No</button>
        </div>
        <span class="attending-label">Dietary</span>
        <input type="text" id="dietary-${i}" placeholder="None, vegetarian, gluten-free…"
          style="background:rgba(255,255,255,0.05); border:1px solid rgba(196,169,125,0.2); border-radius:1px; padding:0.5rem 0.8rem; color:var(--blush); font-family:'Jost',sans-serif; font-size:0.85rem; outline:none;">
      </div>
    `;
    container.appendChild(card);
  });
}

function setAttending(i, value) {
  document.getElementById(`btn-yes-${i}`).className = 'attend-btn' + (value === 'Yes' ? ' selected-yes' : '');
  document.getElementById(`btn-no-${i}`).className  = 'attend-btn' + (value === 'No'  ? ' selected-no'  : '');
}

async function submitRsvp() {
  const guests = [];
  let valid = true;

  guestData.forEach((_, i) => {
    const nameEl = document.getElementById(`guest-name-${i}`);
    const name = nameEl.value.trim();
    const yesBtn = document.getElementById(`btn-yes-${i}`);
    const noBtn  = document.getElementById(`btn-no-${i}`);
    const attending = yesBtn.classList.contains('selected-yes') ? 'Yes'
                    : noBtn.classList.contains('selected-no')   ? 'No'
                    : '';
    const dietary = document.getElementById(`dietary-${i}`).value.trim();

    if (!name || !attending) { valid = false; }
    guests.push({ name, attending, dietary });
  });

  if (!valid) {
    alert('Please make sure every guest has a name and an attending response before submitting.');
    return;
  }

  const message = document.getElementById('group-message').value.trim();
  const submitBtn = document.querySelector('#rsvp-guests-step .rsvp-submit');
  submitBtn.textContent = 'Sending…';
  submitBtn.disabled = true;

  try {
    await fetch(SCRIPT_URL, {
      method: 'POST',
      mode: 'no-cors',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code: currentCode, guests, message })
    });

    document.getElementById('rsvp-guests-step').style.display = 'none';
    document.getElementById('rsvp-success').style.display = 'block';

  } catch (err) {
    submitBtn.textContent = 'Send Our RSVPs';
    submitBtn.disabled = false;
    alert('Something went wrong. Please try again or contact us directly.');
  }
}

// FAQ Accordion
function toggleFaq(btn) {
  const item = btn.closest('.faq-item');
  const isOpen = item.classList.contains('open');
  document.querySelectorAll('.faq-item').forEach(i => i.classList.remove('open'));
  if (!isOpen) item.classList.add('open');
}

// Floating Petals
function createPetal() {
  const petal = document.createElement('div');
  petal.className = 'petal';
  const size = Math.random() * 12 + 6;
  const hue = Math.random() > 0.5 ? '#f0c5bb' : '#c9d8b6';
  petal.style.cssText = `
    width:${size}px; height:${size}px;
    background:${hue};
    left:${Math.random()*100}vw;
    top:-20px;
    animation-duration:${Math.random()*8+6}s;
    animation-delay:${Math.random()*4}s;
  `;
  document.body.appendChild(petal);
  setTimeout(() => petal.remove(), 14000);
}
setInterval(createPetal, 800);
