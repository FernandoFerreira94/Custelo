export const CHAVE_SPLASH = "pz-splash-visto";

/**
 * Roda no HTML, logo depois do splash e antes da pintura. Esconde o splash se a
 * sessão já o viu ou se há movimento reduzido; senão marca como visto. Fica fora
 * do React para o splash existir já no primeiro quadro, sem esperar a hidratação.
 */
export const SCRIPT_SPLASH = `(function(){var s=document.currentScript&&document.currentScript.previousElementSibling;if(!s)return;try{if(matchMedia("(prefers-reduced-motion: reduce)").matches||sessionStorage.getItem("${CHAVE_SPLASH}")){s.hidden=true}else{sessionStorage.setItem("${CHAVE_SPLASH}","1")}}catch(e){s.hidden=true}})()`;
