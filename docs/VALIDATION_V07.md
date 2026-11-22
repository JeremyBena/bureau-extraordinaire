# Vérifications du prototype v0.7

Les scénarios des chapitres 1 à 5 ont été parcourus via Chromium (Playwright), y compris les clics directs sur les objets, les nouveaux exercices de lecture de l’histogramme du chapitre 3, les décisions des chapitres 4 et 5, la révélation des capacités fictives, les nouvelles questions de transfert et les onglets À propos et Licence.

Tests supplémentaires : ordre des réponses correctes sur plusieurs chargements, suppression du feedback précédent après sélection de la bonne réponse, contrôle de la navigation entre les écrans et chargement des portraits.

Les calculs de simulation de base sont identiques à ceux vérifiés dans AUDIT_SIMULATIONS.md et verification_simulations.R. Le chapitre 5 utilise volontairement des cas scénarisés dont les paramètres sont fixés en secret avant le tirage, et distingue explicitement cette connaissance fictive de l'incertitude d’une enquête scientifique réelle.

À vérifier avant publication officielle : lecture à froid par des étudiants, durée réelle, affichage sur téléphones et tablettes, revue orthographique et accessibilité (notamment usage sans souris). Les tests automatisés ne remplacent pas ces essais utilisateurs.
