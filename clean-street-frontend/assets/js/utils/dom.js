export const $  = (s,sc=document)=>sc.querySelector(s);
export const $$ = (s,sc=document)=>[...sc.querySelectorAll(s)];
export const on = (el,ev,fn)=>el && el.addEventListener(ev,fn);
