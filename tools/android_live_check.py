"""Read-only production checks; never print request URLs or credentials."""
import urllib.request, urllib.parse, json, pathlib
ROOT=pathlib.Path(__file__).resolve().parents[1]
OUT=ROOT/'output/android/release.local'
key=json.loads((ROOT/'.production.local/credential.json').read_text())['key']
url='https://script.google.com/macros/s/AKfycbwtRFTbUZZrLX73aj39NUMU42B9I5ObUWGMrn91Wq3RWN5rvmgulMHwdTT7CJpX-3y2YA/exec'
results={}
for action in ['ping','mine','search','dashboard']:
    try:
        query=urllib.parse.urlencode(dict(key=key,action=action,email='25mcce36@uohyd.ac.in',skill=''))
        with urllib.request.urlopen(url+'?'+query,timeout=45) as response: data=json.load(response)
        d=data.get('data'); ok=data.get('action')==action and isinstance(d,(dict,list)) and not (isinstance(d,dict) and 'error' in d)
        summary={'status':'PASS' if ok else 'FAIL','actionMatches':data.get('action')==action,'schema':list(d.keys()) if isinstance(d,dict) else 'array'}
        if action=='dashboard' and ok: summary['aggregates']=d
        if action=='mine' and ok:
            summary['slotStatuses']=[s.get('status') for s in d['slots']]
            summary['credits']=d['credits']
        if isinstance(d,list): summary['count']=len(d)
        results[action]=summary
    except Exception as e: results[action]={'status':'BLOCKED','errorType':type(e).__name__}
    print(action,results[action]['status'])
(OUT/'live-read-checks.json').write_text(json.dumps(results,indent=2))
