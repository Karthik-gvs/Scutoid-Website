/* Placeholder sign-in. It checks nothing and stores nothing. Connect the real product login here. */
const $ = id => document.getElementById(id);
const form = $('loginForm'), msg = $('lMsg');

$('lShow').addEventListener('click', () => {
  const show = $('lPass').type === 'password';
  $('lPass').type = show ? 'text' : 'password';
  $('lShow').textContent = show ? 'Hide' : 'Show';
  $('lShow').setAttribute('aria-label', show ? 'Hide password' : 'Show password');
});

$('lForgot').addEventListener('click', e => {
  e.preventDefault();
  msg.className = 'form-msg';
  msg.textContent = 'Placeholder only. Password reset will be connected with the real sign-in.';
});

form.addEventListener('submit', e => {
  e.preventDefault();
  const emailOk = /^\S+@\S+\.\S+$/.test($('lEmail').value.trim());
  const passOk = $('lPass').value.length > 0;
  $('lEmail').classList.toggle('bad', !emailOk); $('lEmailErr').hidden = emailOk;
  $('lPass').classList.toggle('bad', !passOk); $('lPassErr').hidden = passOk;
  if (!emailOk || !passOk) { msg.textContent = ''; return; }
  msg.className = 'form-msg';
  msg.textContent = 'Placeholder only. Nothing was checked. The real product sign-in will open here.';
  form.reset();
});
