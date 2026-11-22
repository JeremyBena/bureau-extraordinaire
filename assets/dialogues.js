// Gestion du focus pour les panneaux de l’accueil et des chapitres.
function createDialogFocus(panel, background) {
  const controls = 'button:enabled, a[href]';
  let opener = null;
  let active = false;

  panel.addEventListener('keydown', event => {
    if (event.key !== 'Tab') return;
    const items = [...panel.querySelectorAll(controls)].filter(item => item.getClientRects().length);
    const current = document.activeElement;
    const first = items[0];
    const last = items.at(-1);
    if (event.shiftKey ? current === first || !items.includes(current) : current === last) {
      event.preventDefault();
      (event.shiftKey ? last : first)?.focus();
    }
  });

  return {
    render(target) {
      if (!active) {
        opener = document.activeElement;
        background.forEach(element => { element.inert = true; });
        document.documentElement.classList.add('dialog-open');
        active = true;
      }
      target?.focus({ preventScroll: true });
    },
    dismiss(fallback) {
      if (!active) return;
      active = false;
      background.forEach(element => { element.inert = false; });
      document.documentElement.classList.remove('dialog-open');
      const target = opener?.isConnected && opener !== document.body ? opener : fallback;
      target?.focus({ preventScroll: true });
      opener = null;
    }
  };
}

function reviewQuestion(html) {
  const template = document.createElement('template');
  template.innerHTML = html;
  template.content.querySelectorAll('[data-feedback]').forEach(element => element.remove());
  return template.innerHTML;
}
