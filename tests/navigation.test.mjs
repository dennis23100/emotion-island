import test from 'node:test';
import assert from 'node:assert/strict';
import {installNavigation} from '../src/navigation.js';

test('dirty navigation uses an explicit save choice, and failed saves never leave',async()=>{
  const doc=new Map(),win=new Map(),old={document:globalThis.document,window:globalThis.window,location:globalThis.location};
  globalThis.document={addEventListener:(name,fn)=>doc.set(name,fn)};
  globalThis.window={addEventListener:(name,fn)=>win.set(name,fn)};
  globalThis.location={href:'https://test/island.html',origin:'https://test'};
  try{
    let dirty=true,actions,moved=null,saveSucceeds=false;
    installNavigation({dirty:()=>dirty,save:async()=>{if(saveSucceeds)dirty=false;return saveSucceeds;},prompt:a=>actions=a,go:url=>moved=url});
    let blocked=false;
    const click=()=>doc.get('click')({button:0,target:{closest:()=>({href:'https://test/visit.html',target:'',hasAttribute:()=>false})},preventDefault:()=>blocked=true});
    click();assert.equal(blocked,true);assert.equal(moved,null);
    await actions.save();assert.equal(moved,null);assert.equal(dirty,true);
    saveSucceeds=true;await actions.save();assert.equal(moved,'https://test/visit.html');
    let leaveBlocked=false;win.get('beforeunload')({preventDefault:()=>leaveBlocked=true});assert.equal(leaveBlocked,false);
  }finally{for(const [key,value]of Object.entries(old))if(value===undefined)delete globalThis[key];else globalThis[key]=value;}
});
