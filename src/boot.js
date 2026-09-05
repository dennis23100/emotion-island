function showBootError(message){const box=document.getElementById('boot-error');if(!box)return;box.hidden=false;document.getElementById('boot-error-message').textContent=message;document.getElementById('loading').hidden=true;}
window.addEventListener('error',e=>{if(!window.islandReady)showBootError(e.message||'有一個本機資源未能載入，請重新整理。');});
window.addEventListener('unhandledrejection',e=>{if(!window.islandReady)showBootError(String(e.reason?.message||e.reason||'小島初始化失敗。'));});
