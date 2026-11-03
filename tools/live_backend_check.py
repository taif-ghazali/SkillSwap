"""Explicitly authorized disposable live tests. Never logs the key or endpoint."""
import datetime as dt
import json, pathlib, re, urllib.parse, urllib.request

ROOT = pathlib.Path(__file__).resolve().parents[1]
RESULT = ROOT / 'output/live-test-results.json'
ENDPOINT = json.loads((ROOT / '.live-endpoint.local').read_text())['endpoint']
KEY = re.search(r"const KEY = '([^']+)';", (ROOT / 'backend/Code.gs').read_text()).group(1)
TZ = dt.timezone(dt.timedelta(hours=5, minutes=30))

def save(state): RESULT.write_text(json.dumps(state, indent=2), encoding='utf8')
def api(state, action, **params):
    url = ENDPOINT + '?' + urllib.parse.urlencode(dict(params, action=action, key=KEY))
    with urllib.request.urlopen(url, timeout=30) as response:
        payload = json.loads(response.read().decode())
    if payload.get('action') != action or 'data' not in payload: raise ValueError('Unexpected response envelope')
    state['requests'].append({'action':action, 'params':params, 'data':payload['data']})
    save(state)
    return payload['data']

def check(state, name, condition):
    state['checks'].append({'name':name, 'result':'PASS' if condition else 'FAIL'})
    save(state); print(name, 'PASS' if condition else 'FAIL', flush=True)
    if not condition: raise AssertionError(name)

def setup():
    now = dt.datetime.now(TZ)
    tag = now.strftime('%Y%m%d%H%M%S')
    state = {'run':tag, 'requests':[], 'checks':[], 'slots':{}, 'tutor':f'skillswap.qa.{tag}.tutor@uohyd.ac.in', 'learner':f'skillswap.qa.{tag}.learner@uohyd.ac.in'}
    check(state, 'External authenticated ping', api(state,'ping').get('status') == 'healthy')
    for role in ['tutor','learner']:
        data = api(state,'login',email=state[role],nick=f'DISPOSABLE QA {role} {tag}')
        check(state, 'T1 '+role+' starts with 2 credits', data.get('credits') == 2 and data.get('isNew') is True)
    api(state,'profile',email=state['tutor'],nick=f'DISPOSABLE QA Tutor {tag}',offers='QA Python, QA Excel',wants='QA Figma')
    profile = api(state,'login',email=state['tutor'])
    check(state,'Profile persisted across a separate read', profile.get('offers') == ['QA Python','QA Excel'] and profile.get('wants') == ['QA Figma'])
    for name, minutes in [('long',240),('near',60),('completion',2),('spare',300)]:
        start = dt.datetime.now(TZ) + dt.timedelta(minutes=minutes)
        skill = f'DISPOSABLE QA {tag} {name}'
        data = api(state,'publish',email=state['tutor'],skill=skill,date=start.strftime('%Y-%m-%d'),time=start.strftime('%H:%M'),place='Online - disposable QA test, no real meeting')
        check(state,'Publish '+name, isinstance(data.get('slotId'),str))
        state['slots'][name]={'id':data['slotId'],'start':start.replace(second=0,microsecond=0).isoformat()};save(state)
    save(state)
    exercise()

def exercise():
    state=json.loads(RESULT.read_text())
    # Replace a missed near-start fixture through publish, never backdate a row.
    old=dt.datetime.fromisoformat(state['slots']['completion']['start'])
    if dt.datetime.now(TZ) >= old:
        start=dt.datetime.now(TZ)+dt.timedelta(minutes=3)
        data=api(state,'publish',email=state['tutor'],skill='DISPOSABLE QA '+state['run']+' completion replacement',date=start.strftime('%Y-%m-%d'),time=start.strftime('%H:%M'),place='Online - disposable QA test, no real meeting')
        state['expired_completion']=state['slots']['completion']
        state['slots']['completion']={'id':data['slotId'],'start':start.replace(second=0,microsecond=0).isoformat()};save(state)
    tag=state['run']
    found = api(state,'search',email=state['learner'],skill=tag)
    check(state,'Discovery returns four published test slots', isinstance(found,list) and len(found)==4)
    own = api(state,'search',email=state['tutor'],skill=tag)
    check(state,'Discovery excludes own slots', own == [])
    check(state,'T3 own booking denied', bool(api(state,'book',email=state['tutor'],slot=state['slots']['long']['id']).get('error')))
    for name in ['long','near']:
        check(state,'Book '+name,api(state,'book',email=state['learner'],slot=state['slots'][name]['id']).get('ok') is True)
    blocked = api(state,'book',email=state['learner'],slot=state['slots']['spare']['id'])
    check(state,'T2 third booking denied with two reservations', 'not enough' in blocked.get('error','').lower())
    check(state,'T4 early cancellation succeeds',api(state,'cancel',email=state['learner'],slot=state['slots']['long']['id']).get('ok') is True)
    mine = api(state,'mine',email=state['tutor'])
    check(state,'Cancelled slot reopens with no learner',any(s['slotId']==state['slots']['long']['id'] and s['status']=='open' and not s.get('learner') for s in mine['slots']))
    check(state,'T5 cancellation within two hours denied',bool(api(state,'cancel',email=state['learner'],slot=state['slots']['near']['id']).get('error')))
    check(state,'Book completion after reservation released',api(state,'book',email=state['learner'],slot=state['slots']['completion']['id']).get('ok') is True)
    mine = api(state,'mine',email=state['learner'])
    check(state,'Booking reserves credits without transferring',float(mine['credits'])==2 and sum(s['status']=='booked' for s in mine['slots'])==2)
    print('Completion slot start:',state['slots']['completion']['start'],flush=True)
    save(state)

def complete():
    state=json.loads(RESULT.read_text())
    start=dt.datetime.fromisoformat(state['slots']['completion']['start'])
    if dt.datetime.now(TZ) < start: print('WAIT_UNTIL',start.isoformat());return
    slot=state['slots']['completion']['id']
    first=api(state,'confirm',email=state['learner'],slot=slot)
    check(state,'T6 first confirmation does not transfer',first.get('ok') is True and first.get('transferred') is False)
    learner=api(state,'mine',email=state['learner']);tutor=api(state,'mine',email=state['tutor'])
    check(state,'T6 balances unchanged',float(learner['credits'])==2 and float(tutor['credits'])==2)
    second=api(state,'confirm',email=state['tutor'],slot=slot)
    check(state,'T7 both confirmations report transfer',second.get('ok') is True and second.get('transferred') is True)
    learner=api(state,'mine',email=state['learner']);tutor=api(state,'mine',email=state['tutor'])
    check(state,'T7 learner debited tutor credited and session done',float(learner['credits'])==1 and float(tutor['credits'])==3 and any(s['slotId']==slot and s['status']=='done' for s in tutor['slots']))
    check(state,'T8 repeated confirmation denied',bool(api(state,'confirm',email=state['tutor'],slot=slot).get('error')))
    check(state,'Rating completed session',api(state,'rate',email=state['learner'],slot=slot,stars=5).get('ok') is True)
    check(state,'Duplicate rating denied',bool(api(state,'rate',email=state['learner'],slot=slot,stars=5).get('error')))
    save(state)

if __name__=='__main__':
    import sys
    setup() if sys.argv[1:] == ['setup'] else exercise() if sys.argv[1:] == ['exercise'] else complete()
