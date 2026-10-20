import {readFileSync} from 'node:fs';
import {runInNewContext} from 'node:vm';
import test from 'node:test';
import assert from 'node:assert/strict';

const html=readFileSync(new URL('../public/social-oauth-callback.html',import.meta.url),'utf8');
const code=html.match(/<script>([\s\S]*?)<\/script>/)[1];
const state='instagram.'+'a'.repeat(43);
function run(query){
  const elements={message:{textContent:''},back:{href:'http://127.0.0.1:8770/reels-bank/publishing.html'}};
  const calls=[];
  const context={URL,URLSearchParams,document:{getElementById:id=>elements[id]},
    history:{replaceState:(_a,_b,path)=>calls.push(['clean',path])},
    location:{search:query,pathname:'/social-oauth-callback',replace:url=>calls.push(['redirect',url])}};
  runInNewContext(code,context);
  return {calls,elements};
}
test('returns only to fixed loopback and clears query before redirect',()=>{
  const result=run('?'+new URLSearchParams({state,code:'one-use+code&x=1'}));
  assert.equal(result.calls[0][0],'clean');
  const target=new URL(result.calls[1][1]);
  assert.equal(target.origin,'http://127.0.0.1:8770');
  assert.equal(target.pathname,'/publisher/oauth/callback/instagram');
  assert.equal(target.searchParams.get('code'),'one-use+code&x=1');
});
test('foreign platform or malformed state cannot select another destination',()=>{
  for(const bad of ['https://evil.example','facebook.'+'a'.repeat(43),'instagram.evil.example']){
    const r=run('?'+new URLSearchParams({state:bad,code:'code'}));
    assert.equal(r.calls.filter(x=>x[0]==='redirect').length,0);
  }
});
test('duplicate state or code is rejected',()=>{
  for(const q of [`?state=${state}&state=${state}&code=one`,`?state=${state}&code=one&code=two`]){
    assert.equal(run(q).calls.filter(x=>x[0]==='redirect').length,0);
  }
});
test('oversized code and empty callback rejected',()=>{
  assert.equal(run('?'+new URLSearchParams({state,code:'a'.repeat(4097)})).calls.length,1);
  assert.equal(run('').calls.length,1);
});
test('denial forwards no provider text or code',()=>{
  const r=run('?'+new URLSearchParams({state,code:'SECRET',error:'private-error',error_description:'SENSITIVE'}));
  const target=new URL(r.calls[1][1]);
  assert.equal(target.searchParams.get('error'),'access_denied');
  assert.equal(target.searchParams.get('code'),null);
  assert.equal(target.href.includes('SENSITIVE'),false);
});
test('return page has no third-party assets, tracking or storage',()=>{
  assert.match(html,/name="referrer" content="no-referrer"/);
  assert.match(html,/default-src 'none'/);
  assert.doesNotMatch(html,/<script[^>]+src=|<img|localStorage|sessionStorage|fetch\(/);
});
