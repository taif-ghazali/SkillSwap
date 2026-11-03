"""Structural checks only: importing/compiling in App Inventor is still required."""
import json,pathlib,re,zipfile,xml.etree.ElementTree as E
ROOT=pathlib.Path(__file__).resolve().parents[1]
NS={'b':'https://developers.google.com/blockly/xml'}
target=ROOT/'output/android/SkillSwap_MiniProject_Team_Reviewed.aia'
with zipfile.ZipFile(target) as z:
    assert z.testzip() is None
    names=z.namelist()
    root=E.fromstring(z.read(next(n for n in names if n.endswith('.bky'))))
    scm=json.loads(z.read(next(n for n in names if n.endswith('.scm'))).decode().split('$JSON\n',1)[1].rsplit('|#',1)[0])
    with zipfile.ZipFile(ROOT/'SkillSwap_MiniProject_Team.aia') as source:
        assert set(names)==set(source.namelist())
        for n in names:
            if not n.endswith(('.bky','.scm')): assert z.read(n)==source.read(n)
components={}
def walk(c):
    components[c['$Name']]=c
    for sub in c.get('$Components',[]):walk(sub)
walk(scm['Properties'])
for name in ['vaLogin','vaProfile','vaSearch','vaSlot','vaTeach','vaSessions']: assert components[name]['$Type']=='VerticalArrangement'
blocks=list(root.iter('{'+NS['b']+'}block'))
ids=[b.get('id') for b in blocks];assert len(ids)==len(set(ids))
procedures={b.findtext('b:field[@name="NAME"]',namespaces=NS):b for b in blocks if b.get('type') in ['procedures_defnoreturn','procedures_defreturn']}
assert {'callApi','handleReply','showPage','slotLine','sessionLine','updateWallet','clearSessionSelection'}<=set(procedures)
events=[]
for b in blocks:
    for x in b:
        tag=x.tag.split('}')[-1]
        if tag in ['value','statement']:assert x.get('name'),E.tostring(b).decode()[:100]
        if tag=='mutation' and x.get('instance_name'):
            assert x.get('instance_name') in components
            assert x.get('component_type')==components[x.get('instance_name')]['$Type']
            if x.get('event_name'):events.append((x.get('instance_name'),x.get('event_name')))
    if b.get('type','').startswith('procedures_call'):
        name=b.findtext('b:field[@name="PROCNAME"]',namespaces=NS);assert name in procedures,name
        definition=procedures[name]
        expected=len([x for x in definition if x.tag.endswith('field') and x.get('name','').startswith('VAR')])
        actual=len([x for x in b if x.tag.endswith('value')]);assert actual==expected,(name,actual,expected)
assert len(events)==len(set(events))
for instance,event in [('webApi','GotText'),('webApi','TimedOut'),('Screen1','ErrorOccurred'),('btnLogin','Click'),('btnPublish','Click'),('btnBook','Click'),('btnConfirm','Click'),('btnCancel','Click'),('btnRate','Click')]:assert (instance,event) in events
globals={b.findtext('b:field[@name="NAME"]',namespaces=NS):b for b in root if b.get('type')=='global_declaration'}
endpoint=json.loads((ROOT/'.live-endpoint.local').read_text())['endpoint']
assert globals['apiUrl'].findtext('.//b:field[@name="TEXT"]',namespaces=NS)==endpoint
assert globals['apiKey'].findtext('.//b:field[@name="TEXT"]',namespaces=NS)=='team-secret-123'
known=set(json.loads((ROOT/'tools/appinventor-block-types.json').read_text()))
custom={'global_declaration','lexical_variable_get','lexical_variable_set','local_declaration_statement','component_event','component_method','component_set_get'}
unknown={b.get('type') for b in blocks}-known-custom
assert not unknown,unknown
print(f'PASS: ZIP, preserved assets/project settings, six pages, {len(blocks)} unique blocks, {len(events)} events, procedure calls and component references. No APK/runtime claim.')
