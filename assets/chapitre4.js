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
// CHAPITRE 4 : un seuil commun pour les rapports.
const pred=Array.from({length:20},(_,i)=>symbols[(i*3+Math.floor(i/5))%5]);
function choose(n,k){let v=1;for(let i=1;i<=k;i++)v=v*(n-i+1)/i;return v}
function exactTail(k){let a=0;for(let i=k;i<=20;i++)a+=choose(20,i)*Math.pow(.2,i)*Math.pow(.8,20-i);return a}
const goodIndices=new Set([1,4,6,10,13,16,19]);
const draws=pred.map((v,i)=>goodIndices.has(i)?v:symbols[(symbols.indexOf(v)+2+i%3)%5||1]);
// Ensure non-matching cards (indices cyclically shifted by 1..4).
for(let i=0;i<20;i++)if(!goodIndices.has(i))draws[i]=symbols[(symbols.indexOf(pred[i])+1+(i%4))%5];
const S={started:false,stage:0,player:{x:155,y:325},keys:{},locked:true,revealed:0,viewSeries:0,counts:Array(21).fill(0),total:0,last:null,policyAnswered:false,thresholdAnswered:false,firstVerdict:false,secondVerdict:false};
const ri=n=>Math.floor(Math.random()*n), fint=n=>n.toLocaleString('fr-FR');
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

function popup(title,html,actions=[],options={}){overlay.classList.remove('hidden');overlay.classList.toggle('intro',!!options.intro);modal.classList.toggle('sim-screen',!!options.simScreen);overlay.classList.toggle('dialog-mode',!!options.dialogue);actions=orderQuestionActions(actions);const original={title,html,options};const activeSeries=document.activeElement?.dataset.series;modal.innerHTML=`<h2 id="dialog-title" tabindex="-1">${title}</h2>${html}<div class="actions ${options.compact?'compact':actions.length>3?'':'row'}">${actions.map((a,i)=>`<button class="btn ${a.alt?'alt':''} ${a.gold?'gold':''}" data-action="${i}" data-action-id="${a.id}" ${a.disabled?'disabled':''}>${a.label}</button>`).join('')}</div>`;modal.querySelectorAll('[data-action]').forEach(b=>b.addEventListener('click',()=>{const i=Number(b.dataset.action),a=actions[i];Object.hasOwn(a,"review")?showAnswerReview(i,a,actions,original):a.fn()}));S.locked=true;modal.scrollTop=0;
 $('#dialog-objective').textContent=texte("commun.interface.objectif")+$('#objective').textContent;
 const seriesButton=activeSeries !== undefined && modal.querySelector(`[data-series="${activeSeries}"]:enabled`);
 dialogFocus.render(seriesButton || $('#dialog-title'));
}
function close(){overlay.classList.add('hidden');S.locked=false;dialogFocus.dismiss($('.is-next') || $('[data-hotspot]'))}
function speak(who,words,actions,file){popup(texte("commun.interface.titre_dialogue"),speechPanel(who,words,file),actions||[{...libelleAction("commun.interface.actions.continuer"),fn:close}],{dialogue:true})}
function toast(t){let el=$('#toast');el.textContent=t;el.classList.remove('hidden');clearTimeout(toast.timeout);toast.timeout=setTimeout(()=>el.classList.add('hidden'),2000)}
function intro(){popup(texte("ecrans.dossier_ines.titre"),texte("ecrans.dossier_ines.texte"),[{...libelleAction("ecrans.dossier_ines.actions.ouvrir_dossier"),gold:true,fn:()=>{S.started=true;setObj(texte("objectifs.parler_professeur_sig_nificatif_piece_gauche"), 'null');close()}}],{intro:true})}
function nullTalk(){if(S.stage===0){speak(texte("dialogues.mission_ines.personnage"),texte("dialogues.mission_ines.texte"),[{...libelleAction("dialogues.mission_ines.actions.rencontrer_ines_droite"),fn:()=>{S.stage=1;close();setObj(texte("objectifs.parler_ines_salle_droite"), 'candidate')}}], "null");return}
 if(S.stage===3){speak(texte("dialogues.invitation_au_simulateur.personnage"),texte("dialogues.invitation_au_simulateur.texte"), undefined, "null");return}
 if(S.stage===4){speak(texte("dialogues.comparaison_deux_dossiers.personnage"),texte("dialogues.comparaison_deux_dossiers.texte"), undefined, "null");return}
 if(S.stage===5){ruleQuestion();return}
 if(S.stage===6){speak(texte("dialogues.invitation_au_rapport.personnage"),texte("dialogues.invitation_au_rapport.texte"), undefined, "null");return}
 if(S.stage>6){ending();return}
 speak(texte("dialogues.invitation_au_terminal.personnage"),texte("dialogues.invitation_au_terminal.texte"), undefined, "null")}
function candidate(){if(S.stage<1){speak(texte("dialogues.attente_ines.personnage"),texte("dialogues.attente_ines.texte"), undefined, "ines");return}if(S.stage===1){speak(texte("dialogues.protocole_ines.personnage"),texte("dialogues.protocole_ines.texte"),[{...libelleAction("dialogues.protocole_ines.actions.passer_terminal"),fn:()=>{S.stage=2;close();setObj(texte("objectifs.reveler_quatre_series_cartes_terminal_bas_droite"), 'experiment')}}], "ines");return}if(S.revealed<20){speak(texte("dialogues.predictions_pretes.personnage"),texte("dialogues.predictions_pretes.texte"), undefined, "ines");return}speak(texte("dialogues.commentaire_ines.personnage"),texte("dialogues.commentaire_ines.texte"), undefined, "ines")}
function zener(){popup(texte("ecrans.panneau_zener.titre"),texte("ecrans.panneau_zener.texte", { cartes: rowCards(symbols) }),[{...libelleAction("ecrans.panneau_zener.actions.revenir"),fn:close}])}
function experiment(){if(S.stage<2){speak(texte("dialogues.terminal_verrouille.personnage"),texte("dialogues.terminal_verrouille.texte"), undefined, "null");return}experimentUI()}
function experimentUI(){const r=S.revealed,j=S.viewSeries,from=j*5,visibility=Math.max(0,Math.min(5,r-from)),hits=pred.slice(0,r).filter((v,i)=>v===draws[i]).length;
 const tabs=Array.from({length:4},(_,i)=>`<button data-series="${i}" aria-pressed="${i===j}" class="${j===i?'current':''}" ${i>0&&r<i*5?'disabled':''}>${texte("commun.interface.serie", {numero:i+1})}</button>`).join('');
 popup((r===20 ? texte("ecrans.series_ines.titre.apres_tirages") : texte("ecrans.series_ines.titre.avant_tirages")),texte("ecrans.series_ines.texte", { onglets_series: tabs, predictions: rowCards(pred.slice(from,from+5)), cartes_tirees: rowCards(draws.slice(from,from+5).map((v,i)=>i<visibility?v:null),i=>i<visibility?(pred[from+i]===draws[from+i]?'good':'bad'):''), cartes_revelees: r, reussites: hits }),
 r===20?[...(S.stage===2?[{...libelleAction("ecrans.series_ines.actions.comparer_cette_performance"),gold:true,fn:()=>{S.stage=3;S.viewSeries=3;initialReaction()}}]:[{...libelleAction("ecrans.series_ines.actions.revenir_salle"),fn:close}]),{...libelleAction("ecrans.series_ines.actions.revoir_series"),alt:true,fn:()=>{S.viewSeries=0;experimentUI()}}]:[{...libelleAction("ecrans.series_ines.actions.reveler_serie", { numero_serie: Math.floor(r/5)+1 }),gold:true,fn:()=>{S.revealed+=5;S.viewSeries=Math.floor((S.revealed-1)/5);experimentUI()}},{...libelleAction("ecrans.series_ines.actions.revenir_salle"),alt:true,fn:close}]);
 modal.querySelectorAll('[data-series]').forEach(b=>b.onclick=()=>{S.viewSeries=Number(b.dataset.series);experimentUI()})}
function initialReaction(){speak(texte("questions.comparaison_ines_salome.personnage"),texte("questions.comparaison_ines_salome.texte"),[
 {...libelleAction("questions.comparaison_ines_salome.reponses.frequence_sans_pouvoir"),review:texte("questions.comparaison_ines_salome.reponses.frequence_sans_pouvoir.feedback"),fn:()=>{S.stage=4;setObj(texte("objectifs.utiliser_simulateur_s_04_haut_gauche"), 'sim');close()}},
 {...libelleAction("questions.comparaison_ines_salome.reponses.preuve_pouvoir_salome"),fn:()=>initialReactionFeedback(texte("questions.comparaison_ines_salome.reponses.preuve_pouvoir_salome.feedback"))},
 {...libelleAction("questions.comparaison_ines_salome.reponses.preuve_absence_pouvoir"),fn:()=>initialReactionFeedback(texte("questions.comparaison_ines_salome.reponses.preuve_absence_pouvoir.feedback"))}
 ], "null")}
function initialReactionFeedback(t){speak(texte("dialogues.orientation_simulateur.personnage"),t,[{...libelleAction("dialogues.orientation_simulateur.actions.ouvrir_simulateur"),fn:()=>{S.stage=4;setObj(texte("objectifs.utiliser_simulateur_s_04_haut_gauche"), 'sim');close()}},{...libelleAction("dialogues.orientation_simulateur.actions.revoir_reponses"),alt:true,fn:initialReaction}], "null")}
function simMachine(){if(S.stage<3){speak(texte("dialogues.simulateur_verrouille.personnage"),texte("dialogues.simulateur_verrouille.texte"), undefined, "null");return}if(S.stage===3){initialReaction();return}simUI()}
function simOne(){let k=0;for(let i=0;i<20;i++)k+=Math.random()<.2?1:0;S.counts[k]++;S.total++;S.last=k}
function run(n){for(let i=0;i<n;i++)simOne();simUI()}
function histogram(){const max=Math.max(1,...S.counts);return `<div class="hist" role="img" aria-label="${texte("commun.interface.histogramme_alt", {effectifs:S.counts.map((count, score)=>`${score} : ${fint(count)}`).join(" / ")})}">${S.counts.map((c,i)=>`<div class="hcol" title="${texte("ecrans.simulateur.effectif_barre", {score:i,effectif:fint(c)})}"><div class="hbar ${i>=8?'tail':''}" style="height:${100*c/max}%"></div>${[0,4,7,8,12,16,20].includes(i)?`<span class="hlabel">${i}</span>`:''}</div>`).join('')}</div>`}
function simUI(){const n=S.total,c7=S.counts.slice(7).reduce((a,b)=>a+b,0),c8=S.counts.slice(8).reduce((a,b)=>a+b,0);const f=(v)=>n?(100*v/n).toFixed(2).replace('.',',')+' %':'—';
 popup(texte("ecrans.simulateur.titre"),texte("ecrans.simulateur.texte", { histogramme: histogram(), parties: fint(n), frequence_au_moins_7: f(c7), frequence_au_moins_8: f(c8), resume_parties: (n ? texte("ecrans.simulateur.variantes.texte_resume_parties.avec_parties", { parties: fint(n), parties_au_moins_7: fint(c7), parties_au_moins_8: fint(c8) }) : texte("ecrans.simulateur.variantes.texte_resume_parties.sans_partie")) }),[
 ...(n===0?[{...libelleAction("ecrans.simulateur.actions.generer_100_parties"),gold:true,fn:()=>run(100)}]:[]),
 ...(n>=100&&n<10000?[{...libelleAction("ecrans.simulateur.actions.generer_10_000_parties"),gold:true,fn:()=>run(10000)}]:[]),
 ...(n>=10000&&S.stage<6?[{...libelleAction("ecrans.simulateur.actions.etablir_regle_commune"),gold:true,fn:()=>{S.stage=5;ruleQuestion()}}]:[]),
 ...(n>=10000?[{...libelleAction("ecrans.simulateur.actions.creer_20_000_autres_parties"),alt:true,fn:()=>run(20000)}]:[]),
 {...libelleAction("ecrans.simulateur.actions.revenir_laboratoire"),alt:true,fn:close}
 ],{simScreen:true,compact:true})}
function ruleQuestion(t=''){popup(texte("questions.choix_regle_commune.titre"),texte("questions.choix_regle_commune.texte", { feedback: encadreFeedback(t, "note") }), [
 {...libelleAction("questions.choix_regle_commune.reponses.regle_identique"),review:texte("questions.choix_regle_commune.reponses.regle_identique.feedback"),fn:ruleThreshold},
 {...libelleAction("questions.choix_regle_commune.reponses.regle_par_candidat"),fn:()=>ruleQuestion(texte("questions.choix_regle_commune.reponses.regle_par_candidat.feedback"))},
 {...libelleAction("questions.choix_regle_commune.reponses.declaration_du_candidat"),fn:()=>ruleQuestion(texte("questions.choix_regle_commune.reponses.declaration_du_candidat.feedback"))},
 {...libelleAction("questions.choix_regle_commune.actions.revoir_parties_simulees"),alt:true,fn:simUI}
 ])}
function ruleThreshold(t=''){popup(texte("questions.interpretation_seuil.titre"),texte("questions.interpretation_seuil.texte", { feedback: encadreFeedback(t, "note") }), [
 {...libelleAction("questions.interpretation_seuil.reponses.frequence_performances_sans_pouvoir"),review:texte("questions.interpretation_seuil.reponses.frequence_performances_sans_pouvoir.feedback"),fn:()=>{S.stage=Math.max(S.stage,6);setObj(texte("objectifs.rediger_deux_rapports_table_bas_gauche"), 'report');speak(texte("dialogues.explication_reglement.personnage"),texte("dialogues.explication_reglement.texte"),[{...libelleAction("dialogues.explication_reglement.actions.aller_bureau_rapports"),fn:close}], "null")}},
 {...libelleAction("questions.interpretation_seuil.reponses.probabilite_absence_pouvoir"),fn:()=>ruleThreshold(texte("questions.interpretation_seuil.reponses.probabilite_absence_pouvoir.feedback"))},
 {...libelleAction("questions.interpretation_seuil.reponses.tolerance_erreurs"),fn:()=>ruleThreshold(texte("questions.interpretation_seuil.reponses.tolerance_erreurs.feedback"))},
 {...libelleAction("questions.interpretation_seuil.actions.retour_question_precedente"),alt:true,fn:ruleQuestion}
 ])}
function report(){if(S.stage<6){speak(texte("dialogues.rapport_indisponible.personnage"),texte("dialogues.rapport_indisponible.texte"), undefined, "null");return}if(S.stage>=7){ending();return}if(!S.firstVerdict){reportInes();return}reportSalome()}
function reportInes(t=''){popup(texte("questions.decision_ines.titre"),texte("questions.decision_ines.texte", { probabilite: (100*exactTail(7)).toFixed(2).replace('.',','), feedback: encadreFeedback(t, "note") }), [
 {...libelleAction("questions.decision_ines.reponses.maintenir_absence_pouvoir"),review:texte("questions.decision_ines.reponses.maintenir_absence_pouvoir.feedback"),fn:()=>{S.firstVerdict=true;reportSalome()}},
 {...libelleAction("questions.decision_ines.reponses.rejeter_car_au_dessus_moyenne"),fn:()=>reportInes(texte("questions.decision_ines.reponses.rejeter_car_au_dessus_moyenne.feedback"))},
 {...libelleAction("questions.decision_ines.reponses.certitude_absence_pouvoir"),fn:()=>reportInes(texte("questions.decision_ines.reponses.certitude_absence_pouvoir.feedback"))},
 {...libelleAction("questions.decision_ines.actions.retourner_simulateur"),alt:true,fn:simUI}
 ])}
function reportSalome(t=''){popup(texte("questions.decision_salome.titre"),texte("questions.decision_salome.texte", { probabilite: (100*exactTail(8)).toFixed(2).replace('.',','), feedback: encadreFeedback(t, "note") }), [
 {...libelleAction("questions.decision_salome.reponses.rejeter_absence_pouvoir"),review:texte("questions.decision_salome.reponses.rejeter_absence_pouvoir.feedback"),fn:()=>{S.secondVerdict=true;S.stage=7;ending()}},
 {...libelleAction("questions.decision_salome.reponses.maintenir_car_douze_erreurs"),fn:()=>reportSalome(texte("questions.decision_salome.reponses.maintenir_car_douze_erreurs.feedback"))},
 {...libelleAction("questions.decision_salome.reponses.probabilite_du_pouvoir"),fn:()=>reportSalome(texte("questions.decision_salome.reponses.probabilite_du_pouvoir.feedback"))},
 {...libelleAction("questions.decision_salome.actions.relire_rapport_ines"),alt:true,fn:reportInes}
 ])}
function ending(){setObj(texte("objectifs.chapitre_4_termine_deux_rapports_sont_valides"));popup(texte("ecrans.fin_chapitre.titre"),texte("ecrans.fin_chapitre.texte"),[
 {...libelleAction("ecrans.fin_chapitre.actions.passer_chapitre_5_prix_incertitude"),gold:true,fn:()=>location.href='chapitre5.html'},
 {...libelleAction("ecrans.fin_chapitre.actions.revenir_laboratoire"),alt:true,fn:()=>{close();setObj(texte("objectifs.chapitre_4_termine_rapports_valides"))}}
 ])}
function help(){popup(texte("ecrans.aide.titre"),texte("ecrans.aide.texte"),[{...libelleAction("ecrans.aide.actions.reprendre"),fn:close}])}

function about(){popup(texte("commun.a_propos.chapitre.titre"),texte("commun.a_propos.texte")+texte("commun.a_propos.chapitre.note"),[{...libelleAction("commun.a_propos.chapitre.actions.revenir_jeu"),fn:close}])}

function licence(){popup(texte("commun.licence.chapitre.titre"),texte("commun.licence.chapitre.texte"),[{...libelleAction("commun.licence.chapitre.actions.revenir_jeu"),fn:close}])}
document.getElementById('licence').onclick=licence;

// Exploration : deux pièces reliées par un passage central.
const objects=[{id:'null',x:168,y:176,rx:35,ry:36,label:'Professeur Sig. Nificatif'},{id:'candidate',x:565,y:163,rx:35,ry:36,label:'Inès'},{id:'zener',x:706,y:95,rx:42,ry:38,label:'Panneau des cartes'},{id:'experiment',x:626,y:301,rx:41,ry:39,label:'Terminal de tirage'},{id:'sim',x:93,y:95,rx:44,ry:39,label:'Simulateur S-04'},{id:'report',x:278,y:306,rx:43,ry:37,label:'Rapport d’enquête'}];
function px(x,y,w,h,c){ctx.fillStyle=c;ctx.fillRect(x|0,y|0,w|0,h|0)}
function txt(t,x,y,color='#dce8d0',size=12){ctx.fillStyle=color;ctx.font=`bold ${size}px monospace`;ctx.fillText(t,x,y)}
function monitor(x,y,glow){px(x,y,60,46,'#0b1419');px(x+4,y+4,52,32,'#777a63');px(x+8,y+7,44,25,glow);px(x+13,y+13,29,2,'#bce4b6');px(x+13,y+19,18,2,'#8fb4a5');px(x+24,y+36,12,7,'#767c70');px(x+13,y+43,35,4,'#666959')}
function room(){px(0,0,800,450,'#111f25');for(let i=0;i<40;i++)for(let j=0;j<23;j++)px(i*20,j*20,19,19,(i+j)%2?'#25383a':'#293e3d');px(0,0,800,18,'#63746a');px(0,431,800,19,'#63746a');px(0,0,18,450,'#63746a');px(782,0,18,450,'#63746a');px(384,0,20,165,'#63746a');px(384,265,20,185,'#63746a');px(385,165,20,100,'#304643');for(let y=26;y<431;y+=42)px(382,y,3,9,'#92a28b');txt(texte("decor.bureau_archives"),100,30,'#ccd6b0',13);txt(texte("decor.rapport"),242,269,'#f8db99',11);txt(texte("decor.salle_experimentation"),485,30,'#ccd6b0',13);px(35,51,127,71,'#4a3d31');px(38,54,121,66,'#89755a');px(49,60,100,55,'#2b3d39');monitor(65,66,'#24634f');txt('S-04',78,87,'#bbe5ad',10);px(218,53,115,59,'#644e39');px(222,57,107,52,'#94734f');px(240,65,40,27,'#d2c9ab');for(let i=0;i<4;i++)px(245,70+i*5,31,2,'#6f6754');txt(texte("decor.rapport"),242,269,'#f8db99',11);px(240,274,99,76,'#634a39');px(244,278,91,68,'#897451');px(248,282,83,61,'#ded0a6');for(let i=0;i<6;i++)px(253,290+i*8,62,2,'#796b55');px(23,285,81,116,'#313d40');for(let i=0;i<4;i++){px(27,291+i*27,73,21,'#65706b');px(55,299+i*27,18,2,'#273230')}px(450,66,160,73,'#6c553d');px(454,70,152,65,'#937451');px(458,74,144,56,'#ad9268');px(482,92,38,24,'#e7ddc6');px(532,92,38,24,'#e7ddc6');px(689,45,75,84,'#e0d7b7');txt(texte("commun.interface.decor_zener"),700,60,'#273d3a',11);const points=[[707,75],[727,75],[748,75],[717,98],[739,98]];for(let k=0;k<5;k++){ctx.fillStyle='#2d5147';ctx.beginPath();ctx.arc(points[k][0],points[k][1],8,0,Math.PI*2);ctx.fill()}monitor(607,259,'#2c675a');px(586,304,104,21,'#816348');px(591,325,10,42,'#634e3e');px(677,325,10,42,'#634e3e');px(433,319,86,80,'#394848');px(440,330,72,21,'#8d775e');px(440,356,72,22,'#8d775e');px(452,384,46,4,'#92a590');px(18,199,348,10,'#354945');px(417,199,346,10,'#354945');}
function character(x,y,shirt,hair='#443832',skin='#cf9f76'){px(x-12,y-8,24,26,'#0d1418');px(x-10,y-6,20,21,shirt);px(x-8,y+14,7,11,'#26383e');px(x+1,y+14,7,11,'#26383e');px(x-9,y-26,18,19,skin);px(x-11,y-28,22,9,hair);px(x-5,y-14,3,3,'#2d2a29');px(x+3,y-14,3,3,'#2d2a29')}
function nearest(){return objects.find(o=>Math.abs(S.player.x-o.x)<o.rx+20&&Math.abs(S.player.y-o.y)<o.ry+14)}
function draw(){ctx.clearRect(0,0,800,450);room();character(168,176,'#728e78','#c5c6c0','#edb795');character(565,163,'#3c8c83','#ac5941','#dfb08b');character(S.player.x,S.player.y,'#b98a56','#283e40','#e5be97');let o=nearest();if(o&&!S.locked){px(o.x-34,o.y-51,74,15,'#101d23');txt('Cliquer',o.x-24,o.y-40,'#f2df9a',10)}requestAnimationFrame(draw)}
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
document.getElementById('back').addEventListener('click',()=>location.href='chapitre3.html');

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
