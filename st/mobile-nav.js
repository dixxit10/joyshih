const toggle = document.querySelector('.menu-toggle');
if (toggle) {
 const nav = document.getElementById(toggle.getAttribute('aria-controls'));
 const mobile = matchMedia('(max-width:860px)');
 function setOpen(open) {
  toggle.setAttribute('aria-expanded', String(open));
  nav.classList.toggle('is-open', open);
 }
 toggle.addEventListener('click', () => setOpen(toggle.getAttribute('aria-expanded') !== 'true'));
 nav.addEventListener('click', event => {
  if (event.target.closest('a')) setOpen(false);
 });
 document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && toggle.getAttribute('aria-expanded') === 'true') {
   setOpen(false);
   toggle.focus();
  }
 });
 document.addEventListener('click', event => {
  if (!event.target.closest('.bar')) setOpen(false);
 });
 mobile.addEventListener('change', () => setOpen(false));
}
