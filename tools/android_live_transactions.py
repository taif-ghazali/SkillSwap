"""Single-run checks restricted to the two user-authorized accounts. No deletion/reset."""
import datetime,json,pathlib,urllib.request,urllib.parse,sys
ROOT=pathlib.Path(__file__).resolve().parents[1];OUT=ROOT/'output/android/release.local'
record=OUT/'live-transaction-evidence.json'
if record.exists():sys.exit('Evidence already exists. Inspect it before any further live mutations; no automatic rerun.')
key=json.loads((ROOT/'.production.local/credential.json').read_text())['key']
url='https://script.google.com/macros/s/AKfycbwtRFTbUZZrLX73aj39NUMU42B9I5ObUWGMrn91Wq3RWN5rvmgulMHwdTT7CJpX-3y2YA/exec'
tutor='kkit@uohyd.ac.in';learner='ttis@uohyd.ac.in';evidence={'checks':[],'createdSlots':[],'accounts':[tutor,learner]}
def save():record.write_text(json.dumps(evidence,indent=2),encoding='utf8')
def api(action,email=tutor,**params):
 payload=urllib.parse.urlencode(dict(key=key,action=action,email=email,**params)).encode()
 req=urllib.request.Request(url,data=payload,headers={'Content-Type':'application/x-www-form-urlencoded'})
 with urllib.request.urlopen(req,timeout=45) as response:r=json.load(response)
 assert r.get('action')==action,'Unexpected action'
 return r['data']
def check(name,passed,details=None):
 evidence['checks'].append({'name':name,'status':'PASS' if passed else 'FAIL','evidence':details});save();print(name, 'PASS' if passed else 'FAIL',flush=True)
save()
try:
 original={email:api('login',email,nick='Android QA '+role) for email,role in [(tutor,'Tutor'),(learner,'Learner')]}
 evidence['initialAccounts']=original;save()
 for email,d in original.items():
  assert 'error' not in d
  check('initial allocation '+('tutor' if email==tutor else 'learner'),d['credits']==2 if d.get('isNew') else isinstance(d.get('credits'),(int,float)),{'isNew':d.get('isNew'),'credits':d['credits']})
  again=api('login',email);check('repeat login preserves balance',again.get('credits')==d['credits'] and not again.get('isNew'))
 invalid=api('login','invalid@example.org');check('university email rejected','error' in invalid)
 p=api('profile',tutor,nick='Android QA Tutor',offers='Android testing, Guitar',wants='French, Sketching')
 persisted=api('login',tutor);check('profile persistence',p.get('ok') and persisted.get('nick')=='Android QA Tutor' and persisted.get('offers')==['Android testing','Guitar'] and persisted.get('wants')==['French','Sketching'])
 day=(datetime.datetime.now(datetime.timezone(datetime.timedelta(hours=5,minutes=30)))+datetime.timedelta(days=3)).date().isoformat()
 for time,place in [('02:45','IGM Library'),('09:05','Campus Shopping Complex Cafe')]:
  result=api('publish',skill='ANDROID QA DISPOSABLE '+time,date=day,time=time,place=place)
  assert result.get('slotId'),'Publish rejected'
  sid=result['slotId'];evidence['createdSlots'].append(sid);save()
  found=api('search',learner,skill='ANDROID QA DISPOSABLE');slot=next((s for s in found if s['slotId']==sid),{})
  check('publish and discovery '+time,slot.get('time')==time and slot.get('date')==day and slot.get('place')==place,{'slotId':sid,'date':slot.get('date'),'time':slot.get('time'),'place':slot.get('place')})
 ids=evidence['createdSlots'];own=api('search',tutor,skill='ANDROID QA DISPOSABLE');check('own slots excluded',not any(s['slotId'] in ids for s in own))
 check('self booking rejected','error' in api('book',tutor,slot=ids[0]))
 for sid in ids:
  booked=api('book',learner,slot=sid);check('booking',booked.get('ok') is True,{'slotId':sid})
  check('duplicate booking rejected','error' in api('book',learner,slot=sid))
 mine=api('mine',learner);reserved=sum(s['status']=='booked' and s.get('learner')==learner for s in mine['slots']);check('two reservations with unchanged total balance',reserved==2 and mine['credits']==original[learner]['credits'],{'reserved':reserved,'totalCredits':mine['credits']})
 blocked=api('book',learner,slot=ids[0]);check('insufficient available credit', 'Not enough credits' in blocked.get('error',''))
 check('future confirmation rejected','error' in api('confirm',tutor,slot=ids[0]))
 check('incomplete session rating rejected','error' in api('rate',learner,slot=ids[0],stars=5))
 for sid in ids:
  check('cancellation outside two hours',api('cancel',learner,slot=sid).get('ok') is True,{'slotId':sid})
 final=api('mine',learner);remaining=[s for s in api('mine',tutor)['slots'] if s['slotId'] in ids]
 check('reservation restored and slots reopened',all(s['status']=='open' and not s.get('learner') for s in remaining) and final['credits']==original[learner]['credits'],{'statuses':[s['status'] for s in remaining],'credits':final['credits']})
 # Restore prior profile if this designated account was already present.
 if not original[tutor].get('isNew'):
  old=original[tutor];api('profile',tutor,nick=old['nick'],offers=', '.join(old['offers']),wants=', '.join(old['wants']))
 evidence['completed']=True;save()
except Exception as ex:
 evidence['interrupted']=type(ex).__name__;save();print('Stopped safely:',type(ex).__name__,flush=True);sys.exit(1)
