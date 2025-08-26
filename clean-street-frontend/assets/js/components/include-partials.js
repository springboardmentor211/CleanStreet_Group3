export async function include(selector, url){
  const host = document.querySelector(selector);
  if(!host) return;
  const html = await fetch(url).then(r=>r.text());
  host.innerHTML = html;
}
