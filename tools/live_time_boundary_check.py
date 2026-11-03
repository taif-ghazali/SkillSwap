"""Fresh, authorized QA publications against the existing deployment only."""
import datetime as dt
import json
import live_backend_check as live

live.RESULT = live.ROOT / 'output/live-time-boundary-results.json'

def run():
    previous = json.loads((live.ROOT / 'output/live-test-results.json').read_text())
    tag = dt.datetime.now(live.TZ).strftime('%Y%m%d%H%M%S')
    date = (dt.datetime.now(live.TZ) + dt.timedelta(days=2)).strftime('%Y-%m-%d')
    state = {'run':tag, 'date':date, 'tutor':previous['tutor'], 'learner':f'skillswap.qa.time.{tag}@uohyd.ac.in', 'requests':[], 'checks':[], 'slots':{}}
    api = lambda action, **params: live.api(state, action, **params)
    check = lambda name, result: live.check(state, name, result)
    check('Authenticated ping after version update',api('ping').get('status')=='healthy')
    check('Disposable time-test learner starts with 2 credits',api('login',email=state['learner'],nick='DISPOSABLE QA time boundary '+tag).get('credits')==2)
    for time in ['02:45','09:05','12:30','18:45']:
        published=api('publish',email=state['tutor'],skill='DISPOSABLE TIME '+tag+' '+time,date=date,time=time,place='Online - disposable QA, no real meeting')
        check('Publish '+time,isinstance(published.get('slotId'),str))
        slot=published['slotId'];state['slots'][time]=slot;live.save(state)
        mine=api('mine',email=state['tutor']);stored=next((s for s in mine.get('slots',[]) if s['slotId']==slot),None)
        check('Read '+time+' exactly',stored is not None and stored['time']==time and stored['date']==date)
        found=api('search',email=state['learner'],skill=tag)
        check('Discover '+time+' exactly',any(s['slotId']==slot and s['time']==time for s in found))
        check('Book '+time,api('book',email=state['learner'],slot=slot).get('ok') is True)
        learner=api('mine',email=state['learner'])
        check('Booked state and time '+time,any(s['slotId']==slot and s['time']==time and s['status']=='booked' for s in learner['slots']) and float(learner['credits'])==2)
        check('Premature confirmation denied '+time,bool(api('confirm',email=state['learner'],slot=slot).get('error')))
        check('Cancel '+time+' to release reservation',api('cancel',email=state['learner'],slot=slot).get('ok') is True)
    found=api('search',email=state['learner'],skill=tag)
    check('All four new publications are discoverable together',len(found)==4 and {s['time'] for s in found}==set(state['slots']))
    learner=api('mine',email=state['learner'])
    check('Learner ends with unchanged balance and no reservations',float(learner['credits'])==2 and not any(s['status']=='booked' for s in learner['slots']))
    original=previous['slots']['completion']['id']
    check('Existing completed session remains idempotent',bool(api('confirm',email=previous['tutor'],slot=original).get('error')))
    tutor=api('mine',email=previous['tutor']);original_learner=api('mine',email=previous['learner'])
    check('Original transaction balances preserved',float(tutor['credits'])==3 and float(original_learner['credits'])==1)
    live.save(state)

if __name__ == '__main__': run()
