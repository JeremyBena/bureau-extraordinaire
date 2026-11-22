// Les fichiers JSON fournissent le texte et les emplacements {{nom}}.
const contenus = Object.create(null);

function contenu(chemin) {
  let valeur = chemin.startsWith('commun.') ? contenus.commun : contenus.page;
  const cles = chemin.replace(/^commun\./, '').split('.');
  for (const cle of cles) {
    if (!valeur || !Object.hasOwn(valeur, cle)) {
      throw new Error(`Clé de contenu introuvable « ${chemin} »`);
    }
    valeur = valeur[cle];
  }
  return valeur;
}

function texte(chemin, valeurs = {}) {
  const source = contenu(chemin);
  const chaine = Array.isArray(source) ? source.join('') : source;
  if (typeof chaine !== 'string') {
    throw new Error(`Texte attendu pour « ${chemin} »`);
  }
  return chaine.replace(/\{\{([a-z0-9_]+)\}\}/gi, (_, nom) => {
    if (!Object.hasOwn(valeurs, nom)) {
      throw new Error(`Variable « ${nom} » manquante dans « ${chemin} »`);
    }
    return valeurs[nom];
  });
}

function libelleAction(id, valeurs = {}) {
  return {id, label: texte(id + '.libelle', valeurs)};
}

function encadreFeedback(message, classe) {
  return message ? `<div class="${classe}" data-feedback>${message}</div>` : '';
}

async function lireContenus(nom) {
  const fichier = `contenus/${nom}.json`;
  const reponse = await fetch(fichier, {cache: 'no-cache'});
  if (!reponse.ok) throw new Error(`${fichier} · HTTP ${reponse.status}`);
  return reponse.json();
}

function remplirPage() {
  for (const element of document.querySelectorAll('[data-texte]')) {
    element.textContent = texte(element.dataset.texte);
  }
  for (const element of document.querySelectorAll('[data-html]')) {
    element.innerHTML = texte(element.dataset.html);
  }
  for (const element of document.querySelectorAll('[data-inserer]')) {
    element.insertAdjacentHTML('beforebegin', texte(element.dataset.inserer));
    element.remove();
  }
  for (const element of document.querySelectorAll('[data-texte-alt], [data-texte-aria]')) {
    if (element.dataset.texteAlt) element.setAttribute('alt', texte(element.dataset.texteAlt));
    if (element.dataset.texteAria) element.setAttribute('aria-label', texte(element.dataset.texteAria));
  }
}

function chargerJeu(fichier) {
  if (!fichier) return Promise.resolve();
  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = fichier;
    script.onload = resolve;
    script.onerror = () => reject(new Error(`Chargement impossible de ${fichier}`));
    document.body.append(script);
  });
}

async function preparerPage(page, script) {
  try {
    if (location.protocol === 'file:') {
      throw new Error('Ouvrez le jeu via GitHub Pages ou un serveur de fichiers local (voir README.md).');
    }
    [contenus.commun, contenus.page] = await Promise.all([
      lireContenus('commun'),
      page ? lireContenus(page) : Promise.resolve(null)
    ]);
    remplirPage();
    await chargerJeu(script);
    document.querySelector('[data-attente-contenu]').hidden = false;
    if (script) initialiserJeu();
    document.documentElement.dataset.contenuPret = 'true';
  } catch (erreur) {
    console.error(erreur);
    document.querySelector('[data-attente-contenu]').hidden = true;
    const alerte = document.createElement('p');
    alerte.setAttribute('role', 'alert');
    alerte.textContent = `Impossible de charger les textes du jeu. ${erreur.message}`;
    document.body.append(alerte);
  }
}

preparerPage(document.currentScript.dataset.page, document.currentScript.dataset.jeu);
