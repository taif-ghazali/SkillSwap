// Executes the real Code.gs in an isolated Apps Script/Sheets test adapter.
// These are local contract tests, not live endpoint or Google Sheets tests.
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const crypto=require('node:crypto');
function fixture(){
  const tables={Users:[['email','nick','offers','wants','credits']],Slots:[['slotId','tutor','skill','date','time','place','status','learner','tutorOk','learnerOk']],Ledger:[['time','from','to','credits','slotId']],Ratings:[['slotId','from','stars','time']]};
  const ids={Users:1,Slots:2,Ledger:3,Ratings:4};
  const sheet=name=>({getSheetId:()=>ids[name],getDataRange:()=>({getDisplayValues:()=>tables[name].map(r=>r.map(String)),getValues:()=>structuredClone(tables[name])}),appendRow:r=>tables[name].push(r),getRange:(row,col,n=1,m=1)=>({setValue:v=>tables[name][row-1][col-1]=v,setValues:values=>{for(let i=0;i<n;i++)for(let j=0;j<m;j++)tables[name][row+i-1][col+j-1]=values[i][j];}})});
  const ss={getId:()=>'test-sheet',getSpreadsheetTimeZone:()=>'Asia/Kolkata',getSheetByName:name=>tables[name]?sheet(name):null,insertSheet:name=>{tables[name]=[];return sheet(name)}};
  let held=false, acquisitions=0;
  const lock={waitLock(){assert.equal(held,false,'no nested lock');held=true;acquisitions++},hasLock:()=>held,releaseLock(){assert.equal(held,true);held=false}};
  const batches=[];
  const sheets={batchUpdate(body){
    batches.push(structuredClone(body));
    const draft=structuredClone(tables);
    for(const req of body.requests){
      const change=req.updateCells||req.appendCells;
      const id=req.updateCells?change.range.sheetId:change.sheetId;
      const name=Object.keys(ids).find(n=>ids[n]===id);assert.ok(name);
      const values=change.rows[0].values.map(c=>c.userEnteredValue.numberValue??c.userEnteredValue.stringValue);
      if(req.updateCells)draft[name][change.range.startRowIndex][change.range.startColumnIndex]=values[0];else draft[name].push(values);
    }
    Object.assign(tables,draft);
  }};
  const context={Sheets:{Spreadsheets:sheets},SpreadsheetApp:{getActiveSpreadsheet:()=>ss,flush(){}},LockService:{getScriptLock:()=>lock},Utilities:{getUuid:()=>crypto.randomUUID(),formatDate:(date,timezone,pattern)=>{assert.equal(timezone,'Asia/Kolkata');const iso=new Date(date.getTime()+330*60000).toISOString();return pattern==='HH:mm'?iso.slice(11,16):iso.slice(0,10)}},ContentService:{MimeType:{JSON:'json'},createTextOutput:body=>({body,setMimeType(){return this}})},console};
  vm.createContext(context);vm.runInContext(fs.readFileSync('backend/Code.gs','utf8'),context);
  const api=(action,params={})=>JSON.parse(context.handleRequest({key:'team-secret-123',action,...params}).body).data;
  const tutor='tutor@uohyd.ac.in', learner='learner@uohyd.ac.in';
  api('login',{email:tutor,nick:'Tutor'});api('login',{email:learner,nick:'Learner'});
  const slot=(hours=24)=>{const iso=new Date(Date.now()+hours*36e5+330*6e4).toISOString(); const result=api('publish',{email:tutor,skill:'Python & Excel',date:iso.slice(0,10),time:iso.slice(11,16),place:'SCIS Lab 1'});assert.ok(result.slotId,result.error);return result.slotId};
  const past=id=>{const row=tables.Slots.find(r=>r[0]===id);row[3]='2020-01-01';row[4]='10:00'};
  return {api,tables,slot,past,tutor,learner,context,batches,acquisitions:()=>acquisitions,held:()=>held};
}
test('T1 new user gets exactly two credits, repeated login preserves balance',()=>{const f=fixture();assert.equal(f.api('login',{email:f.learner}).credits,2);assert.equal(f.tables.Users.length,3)});
test('T2 two pending bookings exhaust available credits',()=>{const f=fixture();for(let i=0;i<2;i++)assert.equal(f.api('book',{email:f.learner,slot:f.slot()}).ok,true);assert.match(f.api('book',{email:f.learner,slot:f.slot()}).error,/Not enough/)});
test('T3 cannot book own slot',()=>{const f=fixture();assert.ok(f.api('book',{email:f.tutor,slot:f.slot()}).error)});
test('T4 cancel three hours before reopens slot',()=>{const f=fixture(),id=f.slot(3);f.api('book',{email:f.learner,slot:id});assert.equal(f.api('cancel',{email:f.learner,slot:id}).ok,true);assert.equal(f.tables.Slots[1][6],'open');assert.equal(f.tables.Slots[1][7],'')});
test('T5 cancellation one hour before is rejected',()=>{const f=fixture(),id=f.slot(1);f.api('book',{email:f.learner,slot:id});assert.ok(f.api('cancel',{email:f.learner,slot:id}).error)});
test('T6 one confirmation leaves balances and ledger unchanged',()=>{const f=fixture(),id=f.slot();f.api('book',{email:f.learner,slot:id});f.past(id);assert.equal(f.api('confirm',{email:f.learner,slot:id}).transferred,false);assert.equal(f.tables.Users[1][4],2);assert.equal(f.tables.Users[2][4],2);assert.equal(f.tables.Ledger.length,1)});
test('T7 both confirm: debit, credit and exactly one ledger row',()=>{const f=fixture(),id=f.slot();f.api('book',{email:f.learner,slot:id});f.past(id);f.api('confirm',{email:f.learner,slot:id});assert.equal(f.api('confirm',{email:f.tutor,slot:id}).transferred,true);assert.equal(f.tables.Users[1][4],3);assert.equal(f.tables.Users[2][4],1);assert.equal(f.tables.Ledger.length,2)});
test('T8 repeated confirmation cannot transfer again',()=>{const f=fixture(),id=f.slot();f.api('book',{email:f.learner,slot:id});f.past(id);f.api('confirm',{email:f.learner,slot:id});f.api('confirm',{email:f.tutor,slot:id});assert.match(f.api('confirm',{email:f.tutor,slot:id}).error,/not in booked/);assert.equal(f.tables.Ledger.length,2)});
test('profile, search and mine preserve the existing API shape',()=>{const f=fixture();assert.equal(f.api('profile',{email:f.tutor,offers:'Python, Excel',wants:'Figma'}).ok,true);assert.deepEqual(f.api('login',{email:f.tutor}).offers,['Python','Excel']);f.slot();assert.equal(f.api('search',{email:f.learner,skill:'python'}).length,1);assert.equal(f.api('search',{email:f.tutor}).length,0);assert.equal(f.api('mine',{email:f.tutor}).slots.length,1)});
test('invalid key, malformed emails, dates, times and unsafe venues fail',()=>{const f=fixture();assert.equal(JSON.parse(f.context.handleRequest({key:'wrong',action:'ping'}).body).data.error,'bad key');for(const email of ['@uohyd.ac.in','a@b@uohyd.ac.in','a@elsewhere.com'])assert.ok(f.api('login',{email}).error);for(const patch of [{date:'2030-02-30'},{time:'9:5'},{place:'hostel room'},{place:'home'},{place:'anywhere'}])assert.ok(f.api('publish',{email:f.tutor,skill:'Python',date:'2030-01-01',time:'10:00',place:'Library',...patch}).error)});
test('expired slots cannot be booked; future sessions cannot be confirmed',()=>{const f=fixture(),id=f.slot();f.api('book',{email:f.learner,slot:id});assert.ok(f.api('confirm',{email:f.tutor,slot:id}).error);const expired=f.slot();f.past(expired);assert.ok(f.api('book',{email:f.learner,slot:expired}).error)});
test('ratings require completion, participants, integer stars, and no duplicate',()=>{const f=fixture(),id=f.slot();f.api('book',{email:f.learner,slot:id});assert.ok(f.api('rate',{email:f.learner,slot:id,stars:5}).error);f.past(id);f.api('confirm',{email:f.learner,slot:id});f.api('confirm',{email:f.tutor,slot:id});for(const stars of ['x',2.5,0,6])assert.ok(f.api('rate',{email:f.learner,slot:id,stars}).error);assert.equal(f.api('rate',{email:f.learner,slot:id,stars:5}).ok,true);assert.ok(f.api('rate',{email:f.learner,slot:id,stars:5}).error);f.api('login',{email:'other@uohyd.ac.in'});assert.ok(f.api('rate',{email:'other@uohyd.ac.in',slot:id,stars:5}).error)});
test('requests release locks on route errors and preserve report/dashboard actions',()=>{const f=fixture();assert.ok(f.api('unknown',{email:f.learner}).error);assert.equal(f.held(),false);assert.equal(f.api('report',{email:f.learner,target:f.tutor,reason:'Test only'}).ok,true);assert.equal(f.api('dashboard',{email:f.learner}).usersCount,2);assert.ok(f.acquisitions()>0)});
test('failed atomic transfer leaves balances/status/ledger unchanged and can retry',()=>{const f=fixture(),id=f.slot();f.api('book',{email:f.learner,slot:id});f.past(id);f.api('confirm',{email:f.learner,slot:id});const batch=f.context.Sheets.Spreadsheets.batchUpdate;f.context.Sheets.Spreadsheets.batchUpdate=()=>{throw Error('service unavailable')};assert.match(f.api('confirm',{email:f.tutor,slot:id}).error,/service unavailable/);assert.equal(f.tables.Users[1][4],2);assert.equal(f.tables.Users[2][4],2);assert.equal(f.tables.Slots[1][6],'booked');assert.equal(f.tables.Ledger.length,1);f.context.Sheets.Spreadsheets.batchUpdate=batch;assert.equal(f.api('confirm',{email:f.tutor,slot:id}).transferred,true);assert.equal(f.tables.Ledger.length,2)});
test('exact two-hour cancellation boundary is allowed',()=>{const f=fixture(),id=f.slot(3),now=Date.now();f.api('book',{email:f.learner,slot:id});const row=f.tables.Slots[1];const instant=f.context.slotInstant(row[3],row[4]);const frozen=instant.getTime()-2*36e5;f.context.Date=class extends Date{constructor(...a){super(...(a.length?a:[frozen]))}static now(){return frozen}};assert.equal(f.api('cancel',{email:f.learner,slot:id}).ok,true)});
test('GET and both POST encodings keep the same envelope',()=>{const f=fixture(),p={key:'team-secret-123',action:'mine',email:f.learner};for(const response of [f.context.doGet({parameter:p}),f.context.doPost({postData:{contents:JSON.stringify(p)}}),f.context.doPost({postData:{contents:'action=mine'},parameter:p})]){const result=JSON.parse(response.body);assert.equal(result.action,'mine');assert.equal(result.data.credits,2)}});
function preparation(existing={}){
  const tables=structuredClone(existing);let held=false;
  const sheet=name=>({getLastRow:()=>tables[name].length,appendRow:r=>tables[name].push(r),setFrozenRows(){},getRange:(row,col,n,m)=>({getDisplayValues:()=>[tables[name][row-1].slice(col-1,col-1+m)],setNumberFormat(){}})});
  const ss={getSheetByName:n=>tables[n]?sheet(n):null,insertSheet:n=>{tables[n]=[];return sheet(n)},setSpreadsheetTimeZone(){},getUrl:()=>'(test)'};
  const context={SpreadsheetApp:{getActiveSpreadsheet:()=>ss},LockService:{getScriptLock:()=>({waitLock(){held=true},releaseLock(){held=false}})},console:{log(){}}};vm.createContext(context);vm.runInContext(fs.readFileSync('backend/PrepareDeployment.gs','utf8'),context);return {tables,run:()=>context.prepareDeployment(),held:()=>held};
}
test('production preparation is idempotent and preserves existing rows',()=>{const f=preparation({Users:[['email','nick','offers','wants','credits'],['keep@uohyd.ac.in','Keep','','',7]]});f.run();const first=JSON.stringify(f.tables);f.run();assert.equal(JSON.stringify(f.tables),first);assert.equal(f.tables.Users[1][4],7);assert.equal(f.tables.Slots.length,1);assert.equal(f.held(),false)});
test('production preparation rejects wrong headers before creating tabs',()=>{const f=preparation({Users:[['wrong']]});assert.throws(f.run,/Header mismatch/);assert.deepEqual(Object.keys(f.tables),['Users']);assert.equal(f.held(),false)});

for(const time of ['02:45','09:05','12:30','18:45']) {
  test('fresh publish '+time+' writes a typed string, discovers, books and cancels',()=>{
    const f=fixture(),data=f.api('publish',{email:f.tutor,skill:'Time regression',date:'2030-01-02',time,place:'Library'});
    assert.ok(data.slotId,data.error);
    const appended=f.batches.at(-1).requests[0].appendCells;
    assert.deepEqual(appended.rows[0].values[4].userEnteredValue,{stringValue:time});
    assert.equal(appended.rows[0].values[4].userEnteredFormat.numberFormat.type,'TEXT');
    assert.equal(typeof f.tables.Slots[1][4],'string');assert.equal(f.tables.Slots[1][4],time);
    const found=f.api('search',{email:f.learner,skill:'Time regression'});
    assert.equal(found.length,1);assert.equal(found[0].time,time);
    assert.equal(f.api('book',{email:f.learner,slot:data.slotId}).ok,true);
    assert.equal(f.api('mine',{email:f.learner}).slots[0].time,time);
    assert.equal(f.api('cancel',{email:f.learner,slot:data.slotId}).ok,true);
  });
}
test('legacy raw strings, serial fractions and Date cells normalize without display formatting',()=>{
  for(const [raw,expected] of [['2:45','02:45'],['9:05','09:05'],['12:30:00','12:30'],[(2*60+45)/1440,'02:45'],[(9*60+5)/1440,'09:05'],[new Date('2030-01-01T21:15:00Z'),'02:45']]){
    const f=fixture(),id=f.slot();f.tables.Slots[1][3]=new Date('2030-01-01T18:30:00Z');f.tables.Slots[1][4]=raw;
    const found=f.api('search',{email:f.learner});assert.equal(found[0].time,expected);assert.equal(found[0].date,'2030-01-02');
    assert.equal(f.api('book',{email:f.learner,slot:id}).ok,true);
    assert.equal(f.api('cancel',{email:f.learner,slot:id}).ok,true);
  }
});
test('invalid legacy clock values never become bookable slots',()=>{
  for(const raw of ['24:00','2:75','garbage','',-0.5,NaN]){
    const f=fixture(),id=f.slot();f.tables.Slots[1][4]=raw;
    assert.equal(f.api('search',{email:f.learner}).length,0);
    assert.ok(f.api('book',{email:f.learner,slot:id}).error);
  }
});
