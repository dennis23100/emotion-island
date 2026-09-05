// An explicit in-page choice also works in browsers that suppress beforeunload dialogs.
export function installNavigation({dirty, save, prompt, isPlacing=()=>false, beforeGo=()=>{}, go=url=>location.assign(url)}) {
  let leaving=false;
  const leave=url=>{beforeGo();leaving=true;go(url);};
  document.addEventListener('click',event=>{
    const link=event.target.closest?.('a[href]');
    if(!link||link.hasAttribute('download')||link.target==='_blank'||event.button!==0||event.ctrlKey||event.metaKey||event.shiftKey||event.altKey)return;
    const url=new URL(link.href,location.href);
    if(url.origin!==location.origin||!/^https?:$/.test(url.protocol))return;
    if(!dirty()&&!isPlacing())return;
    event.preventDefault();
    prompt({save:async()=>{if(await save())leave(url.href);},discard:()=>leave(url.href)});
  });
  window.addEventListener('beforeunload',event=>{if(!leaving&&(dirty()||isPlacing())){event.preventDefault();event.returnValue='';}});
}
