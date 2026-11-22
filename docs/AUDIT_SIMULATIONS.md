# Audit des simulations — Le Bureau de l’extraordinaire v0.6

Vérifications effectuées sur le code JavaScript de la v0.6, indépendamment des affichages du jeu.

## Modèles de référence

- Chaque carte parmi cinq symboles équiprobables : succès avec p = 0,2.
- Chapitre 1 : un essai ; réussite scénarisée pour déclencher la réflexion, simulateur réellement aléatoire.
- Chapitre 2 : cinq essais indépendants ; probabilité de 5/5 = 0,2^5 = 0,00032 (0,032 %, soit 1/3 125).
- Chapitres 3–5 : K ~ Binomiale(n = 20, p = 0,2) sous absence de pouvoirs. P(K ≥ 7) = 8.66925 % ; P(K ≥ 8) = 3.21427 %.
- Les scénarios de Salomé (8/20), Inès (7/20), Basile (8/20 sans pouvoir), Noor (5/20 malgré un pouvoir) sont volontairement scénarisés.
- Dans les enquêtes libres du chapitre 5, la réalité du pouvoir est tirée au sort, puis les vingt essais sont générés avec p = 0,2 sans pouvoir et p compris entre 0,37 et 0,57 avec pouvoir.

## Tests directs du code dans Chromium

| Chapitre | Nombre de simulations | Mesure empirique | Théorie |
|---|---:|---:|---:|
| 1 | 200,000 | 19.98700% (1 carte) | 20 % |
| 2 | 500,000 | 20.00840% (première carte) | 20 % |
| 2 | 500,000 | 0.03140% (5 sur 5) | 0,032 % |
| 3 | 100,000 | 3.23600% (8 ou plus) | 3.21427% |
| 4 | 100,000 | 8.63100% (7 ou plus) | 8.66925% |
| 4 | 100,000 | 3.25900% (8 ou plus) | 3.21427% |
| 5 | 10,000 dossiers avec p = 0,38 | 7.6361 réussites en moyenne | 7,6 |

Les fréquences simulées sont proches des probabilités attendues, avec les fluctuations d’échantillonnage normales. Les tests ont validé les expressions JavaScript `exactTail`, les générateurs de parties et les fenêtres du nouvel épilogue. Les cinq chapitres se chargent sans erreur JavaScript lors du test des fonctions ; les tests complets de comportement utilisateur sur appareils variés restent à réaliser avant une diffusion à grande échelle.

## Points de vigilance

1. L’épilogue présente un **exemple fictif** de 42 sur 1 000 réattributions aléatoires : ce nombre n’est pas produit par une simulation exécutée à chaque lecture. Il sert de support pour le transfert et est clairement signalé comme tel.
2. Les cas scénarisés garantissent que tous les étudiants rencontrent les phénomènes pédagogiques visés ; ils ne sont pas à confondre avec des observations obtenues aléatoirement.
3. Les évaluations sont unilatérales (performances plus élevées que prévu au hasard) pour les cartes. L’épilogue utilisant les moyennes de groupes présente un exemple bilatéral (différence en valeur absolue). Il faut expliciter cette distinction lors du débriefing.
4. Les simulations sont pseudo-aléatoires (`Math.random`), appropriées pour illustrer des modèles simples ; elles ne sont pas un outil de randomisation cryptographique ou une source d’aléa scientifique auditée.
5. La conformité des calculs ne constitue pas une validation de l’efficacité pédagogique ; un pilote auprès des étudiants et une évaluation du transfert restent nécessaires.

## Vérification indépendante en R

Exécuter `source("verification_simulations.R")`. Le script calcule les valeurs de référence avec `pbinom` et compare ces valeurs à une simulation en R. Il ne dépend pas du JavaScript du jeu.