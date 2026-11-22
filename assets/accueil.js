const home = document.querySelector('.container');
const aboutPane = document.querySelector('#about-pane');
const finPane = document.querySelector('#fin-pane');
const aboutFocus = createDialogFocus(aboutPane, [home]);
const finFocus = createDialogFocus(finPane, [home]);

function closeAbout() {
 aboutPane.classList.remove('show');
 aboutFocus.dismiss(document.querySelector('#about-open'));
}

function closeFin() {
 finPane.classList.remove('show');
 const url = new URL(location.href);
 url.searchParams.delete('fin');
 try { history.replaceState(null, '', url.pathname + url.search + url.hash); } catch (error) {
  // Certains navigateurs limitent History API lorsque le jeu est ouvert depuis le disque.
  if (location.protocol !== 'file:') throw error;
 }
 finFocus.dismiss(document.querySelector('.chapters a'));
}

document.querySelector('#about-open').addEventListener('click', () => {
 aboutPane.classList.add('show');
 aboutFocus.render(document.querySelector('#about-title'));
});
document.querySelector('#about-close').addEventListener('click', closeAbout);
document.querySelector('#fin-close').addEventListener('click', closeFin);
aboutPane.addEventListener('click', event => { if (event.target === aboutPane) closeAbout(); });
finPane.addEventListener('click', event => { if (event.target === finPane) closeFin(); });
aboutPane.addEventListener('keydown', event => { if (event.key === 'Escape') closeAbout(); });
finPane.addEventListener('keydown', event => { if (event.key === 'Escape') closeFin(); });

function initialiserJeu() {
 if (new URLSearchParams(location.search).get('fin') === '1') {
  finPane.classList.add('show');
  finFocus.render(document.querySelector('#fin-title'));
 }
}
