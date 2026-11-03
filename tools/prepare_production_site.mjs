import fs from 'node:fs';
import path from 'node:path';
const root = path.resolve(import.meta.dirname, '..');
const target = path.join(root, 'production-site');
for (const name of ['src','index.html','package.json','package-lock.json','tsconfig.json','tsconfig.node.json','vite.config.ts','tailwind.config.js','postcss.config.js']) {
  fs.cpSync(path.join(root,name),path.join(target,name),{recursive:true,filter:p=>!p.includes('__tests__')});
}
const change = (name,fn)=>{const p=path.join(target,'src',name);fs.writeFileSync(p,fn(fs.readFileSync(p,'utf8')));};
change('services/appService.ts',s=>s.replace("stored('skillswap_mode') !== 'demo'",'true'));
change('pages/LoginPage.tsx',s=>{
  s=s.replace(/      <BackendConfigModal[^\n]+\n/,'').replace(/      <button type="button" onClick=\{\(\) => setShowConfig\(true\)\}[^\n]+\n/,'');
  s=s.replace(/      <p className="relative z-10 text-center mb-4">[^\n]+\n/,'');
  const begin=s.indexOf('          {/* Quick Demo Switcher */}');
  const end=s.indexOf('        </Card>',begin);
  return s.slice(0,begin)+s.slice(end);
});
change('components/layout/Header.tsx',s=>{
 const a=s.indexOf('          {/* Backend Connection Status Badge / Button */}');
 const b=s.indexOf('          {/* Prominent Time Wallet',a);
 return s.slice(0,a)+s.slice(b);
});
change('components/layout/AppShell.tsx',s=>s.replace(/          <p className="mb-3 text-sm">[^\n]+\n/,''));
fs.writeFileSync(path.join(target,'src/services/apiClient.ts'),`export class AppsScriptApiClient {
  getStoredUrl() { return '/api'; }
  getStoredKey() { return ''; }
  isConfigured() { return true; }
  saveConfig(_url: string, _key?: string) { throw Error('Production connection is managed by the server.'); }
  clearConfig() { throw Error('Production connection is managed by the server.'); }
  async call<T = any>(action: string, params: Record<string,string|number> = {}): Promise<{success:boolean;data?:T;error?:string}> {
    try {
      const response = await fetch('/api', {method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({action,...params}), signal:AbortSignal.timeout(25000)});
      if (!response.ok) return {success:false,error:'Service unavailable. Please try again later.'};
      const result = await response.json();
      if (result.action !== action || result.data == null) return {success:false,error:'Unexpected server response.'};
      if (result.data.error) return {success:false,error:String(result.data.error)};
      return {success:true,data:result.data};
    } catch { return {success:false,error:'Unable to connect. Refresh before retrying an action.'}; }
  }
  async testConnection(_url:string,_key?:string) { return {success:false,message:'Production connection is managed by the server.'}; }
}
export const apiClient = new AppsScriptApiClient();
`);
console.log('Separate production website source prepared. No QA endpoint or browser credential included.');
