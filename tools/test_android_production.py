"""Structural checks and a small block interpreter; not an Android/device test."""
import copy,json,pathlib,unittest,urllib.parse,zipfile,xml.etree.ElementTree as E
ROOT=pathlib.Path(__file__).resolve().parents[1]
NS='{https://developers.google.com/blockly/xml}'
def field(b,n): return b.findtext(NS+"field[@name='"+n+"']")
def child(b,t,n): return b.find(NS+t+"[@name='"+n+"']")
def mutation(b): return next((c for c in b if c.tag.endswith('mutation')),None)
class Blocks:
 def __init__(self):
  with zipfile.ZipFile(ROOT/'output/android/release.local/SkillSwap_Production.aia') as z:
   self.files={n:z.read(n) for n in z.namelist()}
  self.xml=E.fromstring(next(v for n,v in self.files.items() if n.endswith('.bky')))
  self.scm=json.loads(next(v for n,v in self.files.items() if n.endswith('.scm')).decode().split('$JSON\n')[1].split('\n|#')[0])
  self.procs={field(b,'NAME'):b for b in self.xml if b.get('type','').startswith('procedures_def')}
  self.components={}
  def walk(c):
   self.components[c['$Name']]=copy.deepcopy(c)
   for sub in c.get('$Components',[]):walk(sub)
  walk(self.scm['Properties']);self.g={};self.requests=[];self.alerts=[];self.db={}
  for b in self.xml:
   if b.get('type')=='global_declaration':self.g['global '+field(b,'NAME')]=self.val(b,'VALUE',{})
 def val(self,b,n,env):
  c=child(b,'value',n);return self.run(c[0],env) if c is not None and len(c) else None
 def stack(self,b,n,env):
  c=child(b,'statement',n)
  if c is not None and len(c): self.run(c[0],env)
 def call(self,name,*args):
  p=self.procs[name];env={field(p,'VAR'+str(i)):v for i,v in enumerate(args)}
  self.stack(p,'STACK',env)
  return self.val(p,'RETURN',env)
 def event(self,instance,name,**env):
  b=next(b for b in self.xml if b.get('type')=='component_event' and mutation(b).get('instance_name')==instance and mutation(b).get('event_name')==name)
  self.stack(b,'DO',env)
 def run(self,b,env):
  t=b.get('type');v=lambda n:self.val(b,n,env);m=mutation(b);out=None
  if t=='text':out=field(b,'TEXT') or ''
  elif t=='math_number':out=float(field(b,'NUM'));out=int(out) if out.is_integer() else out
  elif t in ['logic_boolean','logic_false']:out=field(b,'BOOL')=='TRUE'
  elif t=='lexical_variable_get':out=self.g[field(b,'VAR')] if field(b,'VAR').startswith('global ') else env[field(b,'VAR')]
  elif t=='lexical_variable_set':
   target=self.g if field(b,'VAR').startswith('global ') else env;target[field(b,'VAR')]=v('VALUE')
  elif t=='text_join':out=''.join(str(v('ADD'+str(i))) for i in range(int(m.get('items'))))
  elif t=='text_trim':out=str(v('TEXT')).strip()
  elif t=='text_isEmpty':out=not v('VALUE')
  elif t=='text_starts_at':out=str(v('TEXT')).find(str(v('PIECE')))+1
  elif t in ['logic_compare','math_compare']:
   a,c=v('A'),v('B');op=field(b,'OP');out={'EQ':lambda:a==c,'NEQ':lambda:a!=c,'GT':lambda:a>c,'GTE':lambda:a>=c,'LT':lambda:a<c,'LTE':lambda:a<=c}[op]()
  elif t=='logic_negate':out=not v('BOOL')
  elif t in ['logic_operation','logic_or']:out=(v('A') and v('B')) if field(b,'OP')=='AND' else (v('A') or v('B'))
  elif t=='math_add':out=sum(v('NUM'+str(i)) for i in range(int(m.get('items'))))
  elif t=='math_subtract':out=v('A')-v('B')
  elif t=='controls_forEach':
   for item in v('LIST'):
    local=dict(env);local[field(b,'VAR')]=item;self.stack(b,'DO',local)
  elif t=='controls_choose':out=v('THENRETURN') if v('TEST') else v('ELSERETURN')
  elif t=='controls_if':
   i=0
   while child(b,'value','IF'+str(i)) is not None:
    if v('IF'+str(i)):self.stack(b,'DO'+str(i),env);break
    i+=1
   else:self.stack(b,'ELSE',env)
  elif t=='local_declaration_statement':
   local=dict(env);i=0
   while child(b,'value','DECL'+str(i)) is not None:local[field(b,'VAR'+str(i))]=v('DECL'+str(i));i+=1
   self.stack(b,'STACK',local)
  elif t=='dictionaries_lookup':out=v('DICT').get(v('KEY'),v('NOTFOUND'))
  elif t=='dictionaries_is_dict':out=isinstance(v('THING'),dict)
  elif t=='dictionaries_is_key_in':out=v('KEY') in v('DICT')
  elif t=='lists_create_with':out=[v('ADD'+str(i)) for i in range(int(m.get('items')))]
  elif t=='lists_join_with_separator':out=str(v('SEPARATOR')).join(v('LIST'))
  elif t.startswith('procedures_call'):
   out=self.call(field(b,'PROCNAME'),*[v('ARG'+str(i)) for i in range(len([c for c in b if c.tag==NS+'value']))])
  elif t=='component_set_get':
   c=self.components[m.get('instance_name')];p=m.get('property_name')
   if m.get('set_or_get')=='set':c[p]=v('VALUE')
   else:out=c.get(p,'')
  elif t=='component_method':
   method=m.get('method_name');args=[v('ARG'+str(i)) for i in range(len([c for c in b if c.tag==NS+'value']))]
   if method=='UriEncode':out=urllib.parse.quote(str(args[0]),safe='')
   elif method=='Get':self.requests.append(self.components['webApi']['Url'])
   elif method=='ShowAlert':self.alerts.append(args[0])
   elif method=='JsonTextDecodeWithDictionaries':out=json.loads(args[0])
   elif method=='StoreValue':self.db[args[0]]=args[1]
   elif method=='ClearTag':self.db.pop(args[0],None)
   elif method=='RequestFocus':pass
   elif method in ['FormatDate','FormatDateTime']:out=args[0].strftime('%Y-%m-%d' if args[1]=='yyyy-MM-dd' else '%H:%M')
   else:raise AssertionError('Unsupported method '+method)
  else:raise AssertionError('Unsupported block '+str(t))
  nxt=b.find(NS+'next')
  if nxt is not None and len(nxt):self.run(nxt[0],env)
  return out
class Tests(unittest.TestCase):
 def setUp(self):self.b=Blocks()
 def test_archive_and_references(self):
  b=self.b;allowed=set(json.loads((ROOT/'tools/appinventor-block-types.json').read_text()))|{'component_event','component_method','component_set_get','global_declaration','lexical_variable_get','lexical_variable_set','local_declaration_statement'}
  ids=[]
  for x in b.xml.iter(NS+'block'):
   self.assertIn(x.get('type'),allowed);ids.append(x.get('id'))
   comp=field(x,'COMPONENT_SELECTOR')
   if comp:self.assertIn(comp,b.components)
   proc=field(x,'PROCNAME')
   if proc:self.assertIn(proc,b.procs)
  self.assertEqual(len(ids),len(set(ids)))
  for name,data in b.files.items():self.assertNotIn('\\',name)
  self.assertFalse(any(b'html:' in d for n,d in b.files.items() if n.endswith('.bky')))
  with zipfile.ZipFile(ROOT/'output/android/SkillSwap_MiniProject_Team_Reviewed.aia') as z:
   for n in z.namelist():
    if n.startswith('assets/'):self.assertEqual(z.read(n),b.files[n])
  self.assertEqual(b.scm['Properties']['PrimaryColor'],'&HFF1F5240')
 def test_production_binding(self):
  self.assertEqual(self.b.g['global apiKey'],json.loads((ROOT/'.production.local/credential.json').read_text())['key'])
  self.assertIn('AKfycbwtRFTbUZZrLX73aj39',self.b.g['global apiUrl'])
 def test_duplicate_and_stale_requests(self):
  b=self.b;b.call('callApi','mine','');old=b.requests[-1];b.call('callApi','mine','');self.assertEqual(len(b.requests),1)
  b.event('webApi','TimedOut',url=old);self.assertFalse(b.g['global requestBusy'])
  b.call('callApi','mine','');new=b.requests[-1];self.assertNotEqual(old,new)
  b.event('webApi','GotText',url=old,responseCode=200,responseContent='{}');self.assertTrue(b.g['global requestBusy'])
  b.event('webApi','TimedOut',url=old);self.assertTrue(b.g['global requestBusy'])
  b.event('webApi','GotText',url=new,responseCode=503,responseContent='unavailable');self.assertFalse(b.g['global requestBusy'])
 def test_error_redacts_transport_key(self):
  self.b.call('callApi','mine','');self.b.event('Screen1','ErrorOccurred',message=self.b.requests[-1]);self.assertFalse(self.b.g['global requestBusy']);self.assertNotIn(self.b.g['global apiKey'],self.b.alerts[-1])
 def test_profile_from_live_response(self):
  b=self.b;b.call('handleReply','login',{'credits':2,'nick':'Live Nick','offers':['Guitar','Python'],'wants':['French']})
  self.assertEqual(b.components['txtProfileNick']['Text'],'Live Nick');self.assertEqual(b.components['txtOffers']['Text'],'Guitar, Python');self.assertEqual(b.components['txtWants']['Text'],'French')
 def test_profile_save_includes_nickname_and_empty_skills(self):
  b=self.b;b.components['txtProfileNick']['Text']='New & Name';b.components['txtOffers']['Text']='';b.components['txtWants']['Text']='';b.event('btnSave','Click')
  q=urllib.parse.parse_qs(urllib.parse.urlsplit(b.requests[-1]).query,keep_blank_values=True);self.assertEqual(q['nick'],['New & Name']);self.assertEqual(q['offers'],[''])
 def test_time_padding(self):
  import datetime
  for h,m in [(2,45),(9,5),(0,0)]:
   b=self.b;b.components['tpTime']['Instant']=datetime.datetime(2030,1,1,h,m);b.event('tpTime','AfterTimeSet');self.assertEqual(b.components['tpTime']['Text'],f'{h:02}:{m:02}')
 def test_venue_picker_custom(self):
  b=self.b;b.components['lpVenue']['Selection']='Sports Pavilion';b.event('lpVenue','AfterPicking');self.assertEqual(b.components['txtPlace']['Text'],'Sports Pavilion')
  b.components['lpVenue']['Selection']='Other - type below';b.event('lpVenue','AfterPicking');self.assertEqual(b.components['txtPlace']['Text'],'')
 def test_signout_clears_identity(self):
  b=self.b;b.g['global userEmail']='test@example.org';b.event('btnSignOut','Click');self.assertEqual(b.g['global userEmail'],'');self.assertFalse(b.components['haNav']['Visible']);self.assertTrue(b.components['vaLogin']['Visible'])
 def test_wrong_action_rejected(self):
  b=self.b;b.call('callApi','mine','');b.event('webApi','GotText',url=b.requests[-1],responseCode=200,responseContent=json.dumps({'action':'login','data':{'credits':99}}));self.assertIn('Unexpected response action',b.alerts[-1]);self.assertNotEqual(b.g['global userCredits'],99)
 def test_wallet_reservations(self):
  b=self.b;b.g['global userEmail']='student';b.g['global userCredits']=2;b.g['global sessionsList']=[{'status':'booked','learner':'student'},{'status':'done','learner':'student'},{'status':'booked','learner':'other'}];b.call('updateWallet');self.assertEqual(b.g['global reservedCredits'],1);self.assertIn('Available: 1',b.components['lblWallet']['Text'])
if __name__=='__main__':unittest.main(verbosity=2)

