function portrait(file){
 return `<div class="speech-portrait"><img alt="" src="assets/${file}.png?v=10" draggable="false"></div>`;
}
function speechPanel(who,words,file){return `<div class="speech">${portrait(file)}<div class="speech-copy"><div class="person">${who}</div><p class="dialogue">${words}</p></div></div>`}
function showAnswerReview(i,action,actions,original){
 const selected=actions[i].label;
 const fresh=reviewQuestion(original.html);
 const options=original.options||{};
 const reviewMsg=action.review;
 // The question is preserved: students can reread what they selected before continuing.
 popup(original.title,fresh+`<div class="review-answered"><b>${texte("commun.interface.votre_reponse")}</b><span class="chosen">${selected}</span>${reviewMsg}</div>`,[
  {...libelleAction("commun.interface.actions.revoir_propositions"),alt:true,fn:()=>popup(original.title,fresh,actions,options)},
  {...libelleAction("commun.interface.actions.continuer"),gold:true,fn:action.fn}
 ],options);
}



'use strict';
const $=s=>document.querySelector(s), canvas=$('#world'),ctx=canvas.getContext('2d'),overlay=$('#overlay'),modal=$('#modal');ctx.imageSmoothingEnabled=false;
const symbols=['circle','cross','waves','square','star'], names=contenu("commun.cartes.symboles");
const pred=Array.from({length:20},(_,i)=>symbols[(i*3+Math.floor(i/5))%5]);
function shuffledIndices(n){const a=Array.from({length:n},(_,i)=>i);for(let i=n-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a}
const goodIndices=new Set(shuffledIndices(20).slice(0,8));
const draws=pred.map((p,i)=>goodIndices.has(i)?p:symbols[(symbols.indexOf(p)+1+Math.floor(Math.random()*4))%5]);
const exactTail=Array.from({length:13},(_,i)=>i+8).reduce((sum,k)=>sum+choose(20,k)*(.2**k)*(.8**(20-k)),0);
function choose(n,k){let v=1;for(let i=1;i<=k;i++)v=v*(n-i+1)/i;return v}
const S={started:false,stage:0,player:{x:155,y:325},keys:{},locked:true,opinion:'',revealed:0,total:0,last:null,counts:Array(21).fill(0),simOpened:false,tailDefined:false,histogramUnderstood:false,reportDone:false};
const ri=n=>Math.floor(Math.random()*n),fint=n=>n.toLocaleString('fr-FR'),percent=(n,d)=>d?100*n/d:0;
function symSVG(id){const core={circle:'<circle cx="30" cy="30" r="19"/>',cross:'<path d="M30 10V50M10 30H50"/>',waves:'<path d="M7 15 Q15 5 23 15 T39 15 T55 15 M7 30 Q15 20 23 30 T39 30 T55 30 M7 45 Q15 35 23 45 T39 45 T55 45"/>',square:'<rect x="12" y="12" width="36" height="36"/>',star:'<path d="M30 7 L36 23 L53 23 L40 34 L45 51 L30 41 L15 51 L20 34 L7 23 L24 23 Z"/>'}[id];return `<svg class="symbol" viewBox="0 0 60 60" fill="none" stroke="#29433e" stroke-width="4" stroke-linejoin="round" stroke-linecap="round">${core}</svg>`}
function cardLabel(id, classes) {
 const result = classes.split(' ');
 const status = result.includes('good') ? texte("commun.cartes.correspondance") : result.includes('bad') ? texte("commun.cartes.ecart") : '';
 return (names[id] || texte("commun.cartes.masquee")) + status;
}
function card(id,cls=''){return `<div class="card ${cls} ${!id?'back':''}" role="img" aria-label="${cardLabel(id, cls)}">${id?symSVG(id):'✦'}</div>`}
function rowCards(arr,clsFn=()=>'',n=5){return `<div class="cards">${Array.from({length:n},(_,i)=>card(arr[i],clsFn(i))).join('')}</div>`}

const dialogFocus = createDialogFocus(overlay, [...document.querySelectorAll(
 '.head, #world, .scene-actions, .hud, .toolbar, .bottom'
)]);

function setObj(text, next) {
 const objective = ' — ' + text;
 $('#objective').textContent = objective;
 $('#dialog-objective').textContent = 'Objectif' + objective;
 document.querySelectorAll('[data-hotspot]').forEach(button => {
  const active = button.dataset.hotspot === next;
  button.classList.toggle('is-next', active);
  const label = button.textContent.trim();
  button.setAttribute('aria-label', label);
  button.title = (active ? texte("commun.interface.prochaine_etape") : '') + label;
  if (active) button.setAttribute('aria-current', 'step');
  else button.removeAttribute('aria-current');
 });
}


const answerOrderCache=new Map();
function questionKey(actions){return actions.map(action=>action.id).join("|")}
function orderQuestionActions(actions){
 if(actions.__ordered)return actions;
 if(!actions.some(a=>Object.hasOwn(a,"review")))return actions;
 const key=questionKey(actions);
 if(!answerOrderCache.has(key)){
  const ids=actions.map((a,i)=>a.alt?-1:i).filter(i=>i>=0);
  for(let i=ids.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[ids[i],ids[j]]=[ids[j],ids[i]]}
  answerOrderCache.set(key,ids)
 }
 const result=[...answerOrderCache.get(key).map(i=>actions[i]),...actions.filter(a=>a.alt)];result.__ordered=true;return result;
}

function popup(title,html,actions=[],options={}){overlay.classList.remove('hidden');overlay.classList.toggle('intro',!!options.intro);modal.classList.toggle('sim-screen',!!options.simScreen);overlay.classList.toggle('dialog-mode',!!options.dialogue);actions=orderQuestionActions(actions);const original={title,html,options};const activeSeries=document.activeElement?.dataset.series;modal.innerHTML=`<h2 id="dialog-title" tabindex="-1">${title}</h2>${html}<div class="actions ${options.compact?'compact':actions.length>3?'':'row'}">${actions.map((a,i)=>`<button class="btn ${a.alt?'alt':''} ${a.gold?'gold':''} ${a.small?'small':''}" data-action="${i}" data-action-id="${a.id}" ${a.disabled?'disabled':''}>${a.label}</button>`).join('')}</div>`;modal.querySelectorAll('[data-action]').forEach(b=>b.addEventListener('click',()=>{const i=Number(b.dataset.action),a=actions[i];Object.hasOwn(a,"review")?showAnswerReview(i,a,actions,original):a.fn()}));S.locked=true;modal.scrollTop=0;
 $('#dialog-objective').textContent=texte("commun.interface.objectif")+$('#objective').textContent;
 const seriesButton=activeSeries !== undefined && modal.querySelector(`[data-series="${activeSeries}"]:enabled`);
 dialogFocus.render(seriesButton || $('#dialog-title'));
}
function close(){overlay.classList.add('hidden');S.locked=false;dialogFocus.dismiss($('.is-next') || $('[data-hotspot]'))}
function speak(who,words,actions,file){popup(texte("commun.interface.titre_dialogue"),speechPanel(who,words,file),actions||[{...libelleAction("commun.interface.actions.continuer"),fn:close}],{dialogue:true})}
function toast(t){let el=$('#toast');el.textContent=t;el.classList.remove('hidden');clearTimeout(toast.timeout);toast.timeout=setTimeout(()=>el.classList.add('hidden'),2000)}
function intro(){popup(texte("ecrans.dossier_salome.titre"),texte("ecrans.dossier_salome.texte"),[{...libelleAction("ecrans.dossier_salome.actions.ouvrir_dossier"),fn:()=>{S.started=true;setObj(texte("objectifs.rencontrer_professeur_sig_nificatif_bureau_gauche"), 'null');close();toast(texte("notifications.nouveau_dossier_ouvert"))}}],{intro:true})}
function nullTalk(){if(S.stage===0){speak(texte("dialogues.mission_salome.personnage"),texte("dialogues.mission_salome.texte"),[{...libelleAction("dialogues.mission_salome.actions.aller_rencontrer_salome_salle_droite"),fn:()=>{S.stage=1;close();setObj(texte("objectifs.parler_salome_salle_droite"), 'candidate')}}], "null");return}
if(S.stage===3){speak(texte("dialogues.invitation_au_simulateur.personnage"),texte("dialogues.invitation_au_simulateur.texte"),[{...libelleAction("dialogues.invitation_au_simulateur.actions.aller_simulateur_s_03"),fn:()=>{close();setObj(texte("objectifs.trouver_simulateur_s_03_haut_gauche"), 'sim')}}], "null");return}
if(S.stage===4){speak(texte("dialogues.lecture_parties_virtuelles.personnage"),texte("dialogues.lecture_parties_virtuelles.texte"), undefined, "null");return}
if(S.stage===5){speak(texte("dialogues.invitation_au_rapport.personnage"),texte("dialogues.invitation_au_rapport.texte"), undefined, "null");return}
if(S.stage>=6){ending();return}
speak(texte("dialogues.invitation_au_terminal.personnage"),texte("dialogues.invitation_au_terminal.texte"), undefined, "null")}
function candidate(){if(S.stage<1){speak(texte("dialogues.attente_salome.personnage"),texte("dialogues.attente_salome.texte"), undefined, "salome");return}
if(S.stage===1){speak(texte("dialogues.protocole_salome.personnage"),texte("dialogues.protocole_salome.texte"),[{...libelleAction("dialogues.protocole_salome.actions.allons_terminal_tirage"),fn:()=>{S.stage=2;close();setObj(texte("objectifs.lancer_4_series_5_cartes_terminal_bas"), 'experiment')}}], "salome");return}
speak(texte("dialogues.commentaire_salome.personnage"),(S.stage===2 ? texte("dialogues.commentaire_salome.texte.avant_tirages") : texte("dialogues.commentaire_salome.texte.apres_tirages")), undefined, "salome")}
function zener(){popup(texte("ecrans.panneau_zener.titre"),texte("ecrans.panneau_zener.texte", { cartes: rowCards(symbols) }),[{...libelleAction("ecrans.panneau_zener.actions.revenir_salle"),fn:close}])}
function experiment(){if(S.stage<2){speak(texte("dialogues.terminal_verrouille.personnage"),texte("dialogues.terminal_verrouille.texte"), undefined, "null");return}expUI()}
function expUI(){
 const revealed=S.revealed;
 const shownSeries=Math.max(0,Math.min(3,S.viewSeries??Math.floor(Math.max(0,revealed-1)/5)));
 const from=shownSeries*5, predicted=pred.slice(from,from+5), actual=draws.slice(from,from+5);
 const visible=Math.max(0,Math.min(5,revealed-from));
 const hits=pred.slice(0,revealed).filter((p,i)=>p===draws[i]).length;
 const tabs=Array.from({length:4},(_,i)=>{
   const count=Math.min(5,Math.max(0,revealed-i*5)),h=pred.slice(i*5,i*5+count).filter((p,j)=>p===draws[i*5+j]).length;
   return `<button class="${shownSeries===i?'current':''}" data-series="${i}" aria-pressed="${i===shownSeries}" ${i>0&&revealed<i*5?'disabled':''}>${texte("commun.interface.serie", {numero:i+1})}${count===5?` · ${h}/5`:''}</button>`;
 }).join('');
 const flip=shownSeries===S.justRevealed;
 const cardsGenerated=rowCards(actual.map((d,i)=>i<visible?d:null),i=>i<visible?(predicted[i]===actual[i]?'good':'bad')+(flip?' flip-in':''):'');
 const recap=Array.from({length:4},(_,i)=>{
  const count=Math.max(0,Math.min(5,revealed-i*5));
  const h=pred.slice(i*5,i*5+count).filter((p,j)=>p===draws[i*5+j]).length;
  return `S${i+1} : ${count===5?`${h}/5`:'—'}`;
 }).join('　');
 popup((revealed===20 ? texte("ecrans.series_salome.titre.apres_tirages") : texte("ecrans.series_salome.titre.avant_tirages")),
 texte("ecrans.series_salome.texte", { onglets_series: tabs, numero_serie: shownSeries+1, predictions: rowCards(predicted), numero_serie_2: shownSeries+1, cartes_tirees: cardsGenerated, resume_series: recap, pluriel: (revealed===0 ? texte("ecrans.series_salome.variantes.texte_pluriel.avant_tirages") : texte("ecrans.series_salome.variantes.texte_pluriel.tirages_en_cours", { reussites: hits, pluriel: hits>1?'s':'', cartes_revelees: revealed })), resultat_final: (revealed===20 ? texte("ecrans.series_salome.variantes.texte_resultat_final.apres_tirages") : '') }),
 revealed===20?[...(S.stage===2?[{...libelleAction("ecrans.series_salome.actions.penser_ce_resultat"),gold:true,fn:initialReaction}]:[{...libelleAction("ecrans.series_salome.actions.revenir_salle"),fn:close}]),{...libelleAction("ecrans.series_salome.actions.revoir_toutes_series"),alt:true,fn:()=>{S.viewSeries=0;S.justRevealed=-1;expUI()}}]:[
 {...libelleAction("ecrans.series_salome.actions.reveler_serie", { numero_serie: Math.floor(revealed/5)+1 }),gold:true,fn:()=>{S.revealed+=5;S.viewSeries=Math.floor((S.revealed-1)/5);S.justRevealed=S.viewSeries;expUI()}},
 {...libelleAction("ecrans.series_salome.actions.revenir_salle"),alt:true,fn:close}]);
 modal.querySelectorAll('[data-series]').forEach(b=>b.onclick=()=>{S.viewSeries=Number(b.dataset.series);S.justRevealed=-1;expUI()});
 S.justRevealed=-1;
}

function initialReaction(msg=''){
 popup(texte("questions.interpretation_salome.titre"),texte("questions.interpretation_salome.texte", { feedback: encadreFeedback(msg, "note") }), [
 {...libelleAction("questions.interpretation_salome.reponses.comparaison_au_hasard"),review:texte("questions.interpretation_salome.reponses.comparaison_au_hasard.feedback"),fn:()=>{S.stage=3;speak(texte("dialogues.orientation_simulateur.personnage"),texte("dialogues.orientation_simulateur.texte"),[{...libelleAction("dialogues.orientation_simulateur.actions.aller_simulateur"),fn:()=>{close();setObj(texte("objectifs.trouver_simulateur_s_03_haut_gauche"), 'sim')}}], "null")}},
 {...libelleAction("questions.interpretation_salome.reponses.preuve_pouvoir"),fn:()=>initialReaction(texte("questions.interpretation_salome.reponses.preuve_pouvoir.feedback"))},
 {...libelleAction("questions.interpretation_salome.reponses.resultat_forcement_ordinaire"),fn:()=>initialReaction(texte("questions.interpretation_salome.reponses.resultat_forcement_ordinaire.feedback"))},
 {...libelleAction("questions.interpretation_salome.actions.revoir_cartes_salome"),alt:true,fn:expUI}
 ]);
}

function simMachine(){if(S.stage<3){speak(texte("dialogues.simulateur_verrouille.personnage"),texte("dialogues.simulateur_verrouille.texte"), undefined, "null");return}if(S.stage===3&&!S.simOpened){S.simOpened=true;simIntro();return}simUI()}
function simIntro(){popup(texte("ecrans.mode_emploi_simulateur.titre"),texte("ecrans.mode_emploi_simulateur.texte"),[{...libelleAction("ecrans.mode_emploi_simulateur.actions.lancer_premieres_parties_virtuelles"),fn:()=>{S.stage=4;setObj(texte("objectifs.simuler_series_20_cartes_observer_repartition"), 'sim');simUI()}}])}
function generate(){let g=Array.from({length:20},()=>ri(5)),d=Array.from({length:20},()=>ri(5));let k=g.reduce((sum,v,i)=>sum+(v===d[i]?1:0),0);S.counts[k]++;S.total++;S.last={g,d,k}}
function run(n){for(let i=0;i<n;i++)generate();simUI()}
function histogram(){const m=Math.max(...S.counts,1);return `<div class="hist" role="img" aria-label="${texte("commun.interface.histogramme_alt", {effectifs:S.counts.map((count, score)=>`${score} : ${fint(count)}`).join(" / ")})}">${S.counts.map((c,i)=>`<div class="hcol" title="${texte("ecrans.simulateur.effectif_barre", {score:i,effectif:fint(c)})}"><div class="hbar ${S.tailDefined&&i>=8?'tail':''}" style="height:${100*c/m}%"></div>${[0,4,8,12,16,20].includes(i)?`<span class="hlabel">${i}</span>`:''}</div>`).join('')}</div>`}
function simUI(msg=''){const n=S.total,tail=S.counts.slice(8).reduce((a,b)=>a+b,0),eq=S.counts[8],p=percent(tail,n),countText=texte("ecrans.simulateur.resume_effectifs", { parties_rares: fint(tail), pluriel: tail>1?'s':'', parties: fint(n), frequence_en_pourcent: p.toFixed(2).replace('.',',') }),last=S.last;
let lastDisplay=(last ? texte("ecrans.simulateur.derniere_partie.oui", { reussites: last.k }) : texte("ecrans.simulateur.derniere_partie.non"));
popup(texte("ecrans.simulateur.titre"),texte("ecrans.simulateur.texte", { derniere_partie: lastDisplay, parties: fint(n), moyenne: n?(S.counts.reduce((sum,c,i)=>sum+c*i,0)/n).toFixed(2).replace('.',','):'—', parties_exactement_8: fint(eq), histogramme: histogram(), explication_comparaison: (S.tailDefined ? texte("ecrans.simulateur.variantes.texte_explication_comparaison.comparaison_definie") : ''), resume_comparaison: (S.tailDefined ? texte("ecrans.simulateur.variantes.texte_resume_comparaison.comparaison_definie", { resume_effectifs: countText }) : ''), message: msg?`<p class="note">${msg}</p>`:'', indication_progression: (n<1000 ? texte("ecrans.simulateur.variantes.texte_indication_progression.simulation_insuffisante") : texte("ecrans.simulateur.variantes.texte_indication_progression.simulation_suffisante")) }),[
{...libelleAction("ecrans.simulateur.actions.1_partie"),small:true,fn:()=>run(1)},
{...libelleAction("ecrans.simulateur.actions.20_parties"),small:true,fn:()=>run(20)},
{...libelleAction("ecrans.simulateur.actions.200_parties"),small:true,fn:()=>run(200)},
{...libelleAction("ecrans.simulateur.actions.2_000_parties"),small:true,fn:()=>run(2000)},
{...libelleAction("ecrans.simulateur.actions.10_000_parties"),small:true,fn:()=>run(10000)},
...(n>=1000&&!S.histogramUnderstood?[{...libelleAction("ecrans.simulateur.actions.comprendre_histogramme"),gold:true,fn:histogramStep1}]:[]),
 ...(n>=1000&&S.histogramUnderstood&&!S.tailDefined?[{...libelleAction("ecrans.simulateur.actions.quelles_performances_compter"),gold:true,fn:rangeChallenge}]:[]),
...(S.tailDefined&&S.stage<6?[{...libelleAction("ecrans.simulateur.actions.faire_bilan_enquete"),gold:true,fn:reflection}]:[]),
{...libelleAction("ecrans.simulateur.actions.quitter_simulateur"),alt:true,fn:close}
],{compact:true,simScreen:true});}
function histogramStep1(msg=''){
 popup(texte("questions.lecture_barre_histogramme.titre"),texte("questions.lecture_barre_histogramme.texte", { histogramme: histogram(), feedback: encadreFeedback(msg, "feedback-wrong") }),[
 {...libelleAction("questions.lecture_barre_histogramme.reponses.effectif_exactement_quatre"),review:texte("questions.lecture_barre_histogramme.reponses.effectif_exactement_quatre.feedback"),fn:histogramStep2},
 {...libelleAction("questions.lecture_barre_histogramme.reponses.quatre_premieres_cartes"),fn:()=>histogramStep1(texte("questions.lecture_barre_histogramme.reponses.quatre_premieres_cartes.feedback"))},
 {...libelleAction("questions.lecture_barre_histogramme.reponses.probabilite_du_pouvoir"),fn:()=>histogramStep1(texte("questions.lecture_barre_histogramme.reponses.probabilite_du_pouvoir.feedback"))},
 {...libelleAction("questions.lecture_barre_histogramme.reponses.effectif_au_moins_quatre"),fn:()=>histogramStep1(texte("questions.lecture_barre_histogramme.reponses.effectif_au_moins_quatre.feedback"))}
 ])
}
function histogramStep2(msg=''){
 popup(texte("questions.lecture_repartition_histogramme.titre"),texte("questions.lecture_repartition_histogramme.texte", { histogramme: histogram(), feedback: encadreFeedback(msg, "feedback-wrong") }),[
 {...libelleAction("questions.lecture_repartition_histogramme.reponses.scores_eleves_rares"),review:texte("questions.lecture_repartition_histogramme.reponses.scores_eleves_rares.feedback"),fn:()=>{S.histogramUnderstood=true;simUI(texte("questions.lecture_repartition_histogramme.reponses.scores_eleves_rares.feedback_erreur"))}},
 {...libelleAction("questions.lecture_repartition_histogramme.reponses.frequences_egales"),fn:()=>histogramStep2(texte("questions.lecture_repartition_histogramme.reponses.frequences_egales.feedback"))},
 {...libelleAction("questions.lecture_repartition_histogramme.reponses.impossibilite_huit"),fn:()=>histogramStep2(texte("questions.lecture_repartition_histogramme.reponses.impossibilite_huit.feedback"))},
 {...libelleAction("questions.lecture_repartition_histogramme.reponses.score_constant"),fn:()=>histogramStep2(texte("questions.lecture_repartition_histogramme.reponses.score_constant.feedback"))}
 ])
}
function rangeChallenge(msg=''){
 popup(texte("questions.compter_les_meilleures_performances.titre"),texte("questions.compter_les_meilleures_performances.texte", { feedback: encadreFeedback(msg, "note") }), [
 {...libelleAction("questions.compter_les_meilleures_performances.reponses.exactement_huit"),fn:()=>rangeChallenge(texte("questions.compter_les_meilleures_performances.reponses.exactement_huit.feedback"))},
 {...libelleAction("questions.compter_les_meilleures_performances.reponses.inclure_neuf"),review:texte("questions.compter_les_meilleures_performances.reponses.inclure_neuf.feedback"),fn:rangeFollowUp},
 {...libelleAction("questions.compter_les_meilleures_performances.reponses.au_plus_huit"),fn:()=>rangeChallenge(texte("questions.compter_les_meilleures_performances.reponses.au_plus_huit.feedback"))},
 {...libelleAction("questions.compter_les_meilleures_performances.actions.revoir_histogramme"),alt:true,fn:simUI}
 ]);
}
function rangeFollowUp(msg=''){
 popup(texte("questions.definir_la_comparaison.titre"),texte("questions.definir_la_comparaison.texte", { feedback: encadreFeedback(msg, "note") }), [
 {...libelleAction("questions.definir_la_comparaison.reponses.exactement_huit"),fn:()=>rangeFollowUp(texte("questions.definir_la_comparaison.reponses.exactement_huit.feedback"))},
 {...libelleAction("questions.definir_la_comparaison.reponses.de_huit_a_vingt"),review:texte("questions.definir_la_comparaison.reponses.de_huit_a_vingt.feedback"),fn:()=>{S.tailDefined=true;simUI(texte("questions.definir_la_comparaison.reponses.de_huit_a_vingt.feedback_erreur"))}},
 {...libelleAction("questions.definir_la_comparaison.reponses.de_zero_a_huit"),fn:()=>rangeFollowUp(texte("questions.definir_la_comparaison.reponses.de_zero_a_huit.feedback"))},
 {...libelleAction("questions.definir_la_comparaison.actions.retour_question_precedente"),alt:true,fn:rangeChallenge}
 ]);
}

function reflection(msg=''){const tail=S.counts.slice(8).reduce((a,b)=>a+b,0);popup(texte("questions.interpretation_rarete.titre"),texte("questions.interpretation_rarete.texte", { parties_rares: fint(tail), parties: fint(S.total), probabilite: percent(tail,S.total).toFixed(2).replace('.',','), feedback: encadreFeedback(msg, "note") }), [
{...libelleAction("questions.interpretation_rarete.reponses.rarete_sans_preuve"),review:texte("questions.interpretation_rarete.reponses.rarete_sans_preuve.feedback"),fn:()=>{S.stage=Math.max(S.stage,5);speak(texte("dialogues.explication_rarete.personnage"),texte("dialogues.explication_rarete.texte"),[{...libelleAction("dialogues.explication_rarete.actions.aller_rediger_rapport"),fn:()=>{close();setObj(texte("objectifs.rapport_piece_gauche_grande_feuille_claire_bas"), 'report')}}], "null")}},
{...libelleAction("questions.interpretation_rarete.reponses.preuve_pouvoir"),fn:()=>reflection(texte("questions.interpretation_rarete.reponses.preuve_pouvoir.feedback"))},
{...libelleAction("questions.interpretation_rarete.reponses.preuve_absence_pouvoir"),fn:()=>reflection(texte("questions.interpretation_rarete.reponses.preuve_absence_pouvoir.feedback"))},
{...libelleAction("questions.interpretation_rarete.actions.revoir_simulations"),alt:true,fn:simUI}
]);}
function report(){if(S.stage<5){speak(texte("dialogues.rapport_indisponible.personnage"),texte("dialogues.rapport_indisponible.texte"), undefined, "null");return}if(S.stage>=6){ending();return}reportUI()}
function reportUI(msg=''){const tail=S.counts.slice(8).reduce((a,b)=>a+b,0);popup(texte("questions.rapport_salome.titre"),texte("questions.rapport_salome.texte", { parties: fint(S.total), parties_rares: fint(tail), feedback: encadreFeedback(msg, "note") }), [
{...libelleAction("questions.rapport_salome.reponses.meilleures_performances"),review:texte("questions.rapport_salome.reponses.meilleures_performances.feedback"),fn:()=>{S.stage=6;S.reportDone=true;ending()}},
{...libelleAction("questions.rapport_salome.reponses.toutes_les_performances"),fn:()=>reportUI(texte("questions.rapport_salome.reponses.toutes_les_performances.feedback"))},
{...libelleAction("questions.rapport_salome.reponses.preuve_pouvoir"),fn:()=>reportUI(texte("questions.rapport_salome.reponses.preuve_pouvoir.feedback"))},
{...libelleAction("questions.rapport_salome.reponses.meilleures_plus_frequentes"),fn:()=>reportUI(texte("questions.rapport_salome.reponses.meilleures_plus_frequentes.feedback"))},
{...libelleAction("questions.rapport_salome.actions.revoir_simulateur"),alt:true,fn:simUI}
]);}
function ending(){popup(texte("ecrans.fin_chapitre.titre"),texte("ecrans.fin_chapitre.texte", { probabilite: (100*exactTail).toFixed(2).replace('.',',') }),[
{...libelleAction("ecrans.fin_chapitre.actions.continuer_chapitre_4_reglement_bureau"),gold:true,fn:()=>location.href='chapitre4.html'},
{...libelleAction("ecrans.fin_chapitre.actions.retourner_laboratoire"),fn:()=>{close();setObj(texte("objectifs.chapitre_3_termine_dossier_valide"))}},
{...libelleAction("ecrans.fin_chapitre.actions.recommencer_chapitre"),alt:true,fn:()=>location.reload()}
]);}
function help(){popup(texte("ecrans.aide.titre"),texte("ecrans.aide.texte"),[{...libelleAction("ecrans.aide.actions.reprendre"),fn:close}]);}
function about(){popup(texte("commun.a_propos.chapitre.titre"),texte("commun.a_propos.texte")+texte("commun.a_propos.chapitre.note"),[{...libelleAction("commun.a_propos.chapitre.actions.revenir_jeu"),fn:close}])}

function licence(){popup(texte("commun.licence.chapitre.titre"),texte("commun.licence.chapitre.texte"),[{...libelleAction("commun.licence.chapitre.actions.revenir_jeu"),fn:close}])}
document.getElementById('licence').onclick=licence;

// Exploration : deux pièces reliées par un passage central.
const objects=[{id:'null',x:168,y:176,rx:35,ry:36,label:'Professeur Sig. Nificatif'},{id:'candidate',x:565,y:163,rx:35,ry:36,label:'Salomé'},{id:'zener',x:706,y:95,rx:42,ry:38,label:'Panneau des cartes'},{id:'experiment',x:626,y:301,rx:41,ry:39,label:'Terminal de tirage'},{id:'sim',x:93,y:95,rx:44,ry:39,label:'Simulateur S-03'},{id:'report',x:278,y:306,rx:43,ry:37,label:'Rapport d’enquête'}];
function px(x,y,w,h,c){ctx.fillStyle=c;ctx.fillRect(x|0,y|0,w|0,h|0)}
function txt(t,x,y,color='#dce8d0',size=12){ctx.fillStyle=color;ctx.font=`bold ${size}px monospace`;ctx.fillText(t,x,y)}
function monitor(x,y,glow){px(x,y,60,46,'#0b1419');px(x+4,y+4,52,32,'#777a63');px(x+8,y+7,44,25,glow);px(x+13,y+13,29,2,'#bce4b6');px(x+13,y+19,18,2,'#8fb4a5');px(x+24,y+36,12,7,'#767c70');px(x+13,y+43,35,4,'#666959')}
function room(){px(0,0,800,450,'#111f25');for(let i=0;i<40;i++)for(let j=0;j<23;j++)px(i*20,j*20,19,19,(i+j)%2?'#25383a':'#293e3d');px(0,0,800,18,'#63746a');px(0,431,800,19,'#63746a');px(0,0,18,450,'#63746a');px(782,0,18,450,'#63746a');px(384,0,20,165,'#63746a');px(384,265,20,185,'#63746a');px(385,165,20,100,'#304643');for(let y=26;y<431;y+=42)px(382,y,3,9,'#92a28b');txt(texte("decor.bureau_archives"),100,30,'#ccd6b0',13);txt(texte("decor.rapport"),242,269,'#f8db99',11);txt(texte("decor.salle_experimentation"),485,30,'#ccd6b0',13);px(35,51,127,71,'#4a3d31');px(38,54,121,66,'#89755a');px(49,60,100,55,'#2b3d39');monitor(65,66,'#24634f');txt('S-03',78,87,'#bbe5ad',10);px(218,53,115,59,'#644e39');px(222,57,107,52,'#94734f');px(240,65,40,27,'#d2c9ab');for(let i=0;i<4;i++)px(245,70+i*5,31,2,'#6f6754');txt(texte("decor.rapport"),242,269,'#f8db99',11);px(240,274,99,76,'#634a39');px(244,278,91,68,'#897451');px(248,282,83,61,'#ded0a6');for(let i=0;i<6;i++)px(253,290+i*8,62,2,'#796b55');px(23,285,81,116,'#313d40');for(let i=0;i<4;i++){px(27,291+i*27,73,21,'#65706b');px(55,299+i*27,18,2,'#273230')}px(450,66,160,73,'#6c553d');px(454,70,152,65,'#937451');px(458,74,144,56,'#ad9268');px(482,92,38,24,'#e7ddc6');px(532,92,38,24,'#e7ddc6');px(689,45,75,84,'#e0d7b7');txt(texte("commun.interface.decor_zener"),700,60,'#273d3a',11);const points=[[707,75],[727,75],[748,75],[717,98],[739,98]];for(let k=0;k<5;k++){ctx.fillStyle='#2d5147';ctx.beginPath();ctx.arc(points[k][0],points[k][1],8,0,Math.PI*2);ctx.fill()}monitor(607,259,'#2c675a');px(586,304,104,21,'#816348');px(591,325,10,42,'#634e3e');px(677,325,10,42,'#634e3e');px(433,319,86,80,'#394848');px(440,330,72,21,'#8d775e');px(440,356,72,22,'#8d775e');px(452,384,46,4,'#92a590');px(18,199,348,10,'#354945');px(417,199,346,10,'#354945');}
function character(x,y,shirt,hair='#443832',skin='#cf9f76'){px(x-12,y-8,24,26,'#0d1418');px(x-10,y-6,20,21,shirt);px(x-8,y+14,7,11,'#26383e');px(x+1,y+14,7,11,'#26383e');px(x-9,y-26,18,19,skin);px(x-11,y-28,22,9,hair);px(x-5,y-14,3,3,'#2d2a29');px(x+3,y-14,3,3,'#2d2a29')}
function nearest(){return objects.find(o=>Math.abs(S.player.x-o.x)<o.rx+20&&Math.abs(S.player.y-o.y)<o.ry+14)}
function draw(){ctx.clearRect(0,0,800,450);room();character(168,176,'#728e78','#c5c6c0','#edb795');character(565,163,'#9d5782','#25232b','#684637');character(S.player.x,S.player.y,'#b98a56','#283e40','#e5be97');let o=nearest();if(o&&!S.locked){px(o.x-34,o.y-51,74,15,'#101d23');txt('Cliquer',o.x-24,o.y-40,'#f2df9a',10)}requestAnimationFrame(draw)}
function interact(){if(!S.started||S.locked)return;let o=nearest();if(!o){toast(texte("notifications.approchez_vous_element_interactif"));return}({null:nullTalk,candidate,zener,experiment,sim:simMachine,report})[o.id]()}
function move(dx,dy){if(!S.started||S.locked)return;let x=Math.min(758,Math.max(41,S.player.x+dx)),y=Math.min(407,Math.max(49,S.player.y+dy));if((S.player.x<380&&x>380||S.player.x>408&&x<408)&&!(y>160&&y<274))return;if(x>=380&&x<=408&&!(y>160&&y<274))return;S.player.x=x;S.player.y=y}
let lastTime=0;function tick(t){if(t-lastTime>20){let k=S.keys;if(k.arrowup||k.w||k.z)move(0,-4);if(k.arrowdown||k.s)move(0,4);if(k.arrowleft||k.a||k.q)move(-4,0);if(k.arrowright||k.d)move(4,0);lastTime=t}requestAnimationFrame(tick)}

canvas.addEventListener('click',e=>{if(S.locked)return;const r=canvas.getBoundingClientRect(),x=(e.clientX-r.left)/r.width*800,y=(e.clientY-r.top)/r.height*450;let o=objects.find(obj=>Math.abs(x-obj.x)<obj.rx+20&&Math.abs(y-obj.y)<obj.ry+20);if(o){S.player.x=Math.max(50,Math.min(754,o.x+(o.id==='null'?45:0)));S.player.y=Math.max(55,Math.min(405,o.y+30));interact()}else{S.player.x=Math.max(45,Math.min(755,x));S.player.y=Math.max(55,Math.min(405,y))}});


function zenerCanvasSymbol(id,cx,cy,scale=1){
 ctx.save();ctx.strokeStyle='#264b44';ctx.fillStyle='#264b44';ctx.lineWidth=Math.max(1.7,2.5*scale);ctx.lineCap='round';ctx.lineJoin='round';
 const x=cx,y=cy,r=5.6*scale;ctx.beginPath();
 if(id===0){ctx.arc(x,y,r,0,Math.PI*2)}
 if(id===1){ctx.moveTo(x-r,y);ctx.lineTo(x+r,y);ctx.moveTo(x,y-r);ctx.lineTo(x,y+r)}
 if(id===2){for(let j=-1;j<=1;j++){const yy=y+j*r*.66;ctx.moveTo(x-r,yy);ctx.quadraticCurveTo(x-r/2,yy-r/2,x,yy);ctx.quadraticCurveTo(x+r/2,yy+r/2,x+r,yy)}}
 if(id===3){ctx.rect(x-r,y-r,r*2,r*2)}
 if(id===4){for(let i=0;i<10;i++){const a=-Math.PI/2+i*Math.PI/5,rr=i%2?r*.46:r;const px=x+Math.cos(a)*rr,py=y+Math.sin(a)*rr;if(i===0)ctx.moveTo(px,py);else ctx.lineTo(px,py)}ctx.closePath()}
 ctx.stroke();ctx.restore();
}
function upgradedRoom(){
 const caption=(s,x,y,col='#d9e2d6',size=12)=>{ctx.fillStyle=col;ctx.font=`bold ${size}px monospace`;ctx.fillText(s,x,y)};
 // Minimaliste : deux zones lisibles, de grandes masses de couleur et peu de mobilier.
 px(0,0,800,450,'#111f25');
 px(14,15,770,419,'#55726c');
 px(20,21,758,407,'#1a3438');
 px(25,57,350,362,'#203a3e');
 px(408,57,365,362,'#233d40');
 px(25,47,350,6,'#334f4f');
 px(408,47,365,6,'#334f4f');
 px(375,47,33,113,'#627c76');
 px(375,271,33,148,'#627c76');
 px(380,160,23,111,'#29494a');
 // En-têtes : repérage simple, pas de textures décoratives.
 px(25,21,350,35,'#152c31');
 px(408,21,365,35,'#152c31');
 caption(texte('decor.bureau_dossiers'),68,43,'#f5dfaa',13);
 caption(texte('decor.salle_experimentation'),457,43,'#f5dfaa',13);
 // Simulateur, à gauche : un écran et un socle, sans accessoires parasites.
 px(48,70,130,69,'#435b54');
 px(54,76,118,52,'#0e2026');
 px(60,82,106,40,'#173e3c');
 px(68,91,26,22,'#69bd9d');
 px(99,103,28,10,'#69bd9d');
 px(132,96,24,4,'#bbd0b6');
 px(132,105,18,4,'#bbd0b6');
 px(89,139,47,6,'#6e8378');
 // Table des rapports : dossier fermé avec un onglet, aucune feuille géante.
 px(208,281,148,100,'#4e5448');
 px(215,288,134,85,'#876f55');
 px(241,300,77,61,'#eadbb7');
 px(241,294,34,9,'#c8a86d');
 px(250,311,57,7,'#385e59');
 px(250,324,46,4,'#ada38a');
 px(250,333,51,4,'#ada38a');
 px(250,342,39,4,'#ada38a');
 // À droite : plateau d'essai, juste cinq cartes (suppression des meubles ambigus).
 px(466,74,174,71,'#725d49');
 px(474,82,158,54,'#af9470');
 for(let i=0;i<5;i++){
  const x=483+i*29;
  px(x,93,24,33,'#e9dfc5');
  px(x+3,96,18,27,'#f8efd9');
  zenerCanvasSymbol(i,x+12,110,.77);
 }
 // Tableau Zener : cinq symboles, une fonction explicite et aucune décoration supplémentaire.
 px(667,70,101,101,'#5c756e');
 px(672,75,91,91,'#eee4ca');
 caption('ZENER',687,89,'#2a514a',10);
 for(let i=0;i<5;i++){
  const x=681+(i%3)*27, y=97+Math.floor(i/3)*30;
  px(x,y,23,27,'#fdf6e7');
  zenerCanvasSymbol(i,x+11.5,y+13.5,.72);
 }
 // Terminal de tirage : écran, clavier simple, aucun autre équipement.
 px(577,285,136,87,'#695746');
 px(584,292,122,74,'#8a775d');
 px(602,268,88,61,'#27393a');
 px(608,274,76,44,'#153d3b');
 zenerCanvasSymbol(4,644,295,1.20);
 px(624,321,43,6,'#4a5751');
 px(598,345,84,11,'#d5caa7');
 for(let i=0;i<5;i++)px(603+i*15,348,9,4,'#8b987f');
 // Petit repère de circulation entre les deux pièces.
 px(388,215,7,15,'#6f8d7d');
}
function upgradedCharacter(x,y,shirt='#789083',hair='#4c392f',skin='#dca985'){
 // Silhouette simple et volontairement peu détaillée, dessinée sans anti-aliasing.
 const isProfessor=(hair==='#c5c6c0'||hair==='#c1c3b8'||shirt==='#728e78');
 px(x-12,y-8,24,26,'#13282b');
 px(x-10,y-6,20,24,shirt);
 px(x-9,y+18,7,12,'#2c4247');px(x+2,y+18,7,12,'#2c4247');
 px(x-9,y-30,18,23,skin);
 px(x-11,y-32,22,8,isProfessor?'#dcded6':hair);
 px(x-11,y-23,4,13,isProfessor?'#dcded6':hair);
 px(x+7,y-23,4,13,isProfessor?'#dcded6':hair);
 px(x-5,y-21,3,3,'#29363a');px(x+3,y-21,3,3,'#29363a');
 if(isProfessor){
  px(x-9,y-13,18,8,'#e8e7df');
  px(x-6,y-22,7,6,'#2f4244');px(x+2,y-22,7,6,'#2f4244');
  px(x-4,y-22,3,2,'#e8dcb9');px(x+4,y-22,3,2,'#e8dcb9');
 }
}
room=upgradedRoom;
if(typeof char!=='undefined')char=upgradedCharacter;
if(typeof character!=='undefined')character=upgradedCharacter;

function initialiserJeu() {
 intro();
 requestAnimationFrame(draw);
 requestAnimationFrame(tick);
}



// Toolbar actions, kept independent of movement controls.
document.getElementById('about').addEventListener('click',about);
document.getElementById('help').addEventListener('click',help);
document.getElementById('reset').addEventListener('click',()=>{if(confirm(texte("commun.interface.confirmer_recommencer")))location.reload()});
document.getElementById('back').addEventListener('click',()=>location.href='chapitre2.html');

// Direct mouse/touch interaction: no keyboard or E key required.
document.querySelectorAll('[data-hotspot]').forEach(button=>{
 button.addEventListener('click',()=>{
  if(!S.started || S.locked)return;
  const id=button.dataset.hotspot;
  const target=objects.find(o=>o.id===id);
  if(target){S.player.x=target.x;S.player.y=target.y+22;}
  const go={null:nullTalk,candidate:candidate,zener:zener,experiment:experiment,sim:simMachine,report:report};
  go[id]?.();
 });
});
