"""Patch the supplied master AIA without recreating its Designer or existing logic."""
import copy, json, pathlib, re, zipfile
import xml.etree.ElementTree as E

ROOT = pathlib.Path(__file__).resolve().parents[1]
SOURCE = ROOT / 'SkillSwap_MiniProject_Team.aia'
OUT = ROOT / 'output/android/SkillSwap_MiniProject_Team_Reviewed.aia'
NS = 'https://developers.google.com/blockly/xml'
MNS = 'http://www.w3.org/1999/xhtml'
E.register_namespace('', NS)
E.register_namespace('html', MNS)
counter = 0
def el(tag, **attrs): return E.Element('{'+NS+'}'+tag, attrs)
def block(kind, fields=None, values=None, mutation=None):
    global counter
    counter += 1
    b = el('block', type=kind, id='repair%05d' % counter)
    if mutation is not None: E.SubElement(b, '{'+MNS+'}mutation', mutation)
    for k,v in (fields or {}).items(): E.SubElement(b,'{'+NS+'}field',name=k).text=str(v)
    for k,v in (values or {}).items(): child(b,'value',k,v)
    return b
def child(b, tag, name, value):
    c=E.SubElement(b,'{'+NS+'}'+tag,name=name); c.append(value); return c
def getchild(b,tag,name): return b.find('{'+NS+'}'+tag+"[@name='"+name+"']")
def text(s): return block('text',{'TEXT':s})
def var(s): return block('lexical_variable_get',{'VAR':s})
def boolean(v): return block('logic_boolean',{'BOOL':'TRUE' if v else 'FALSE'})
def assign(s,v): return block('lexical_variable_set',{'VAR':s},{'VALUE':v})
def chain(*bs):
    for a,b in zip(bs,bs[1:]): E.SubElement(a,'{'+NS+'}next').append(b)
    return bs[0]
def method(instance,typ,name,*args):
    return block('component_method',{'COMPONENT_SELECTOR':instance},{'ARG'+str(i):v for i,v in enumerate(args)}, {'component_type':typ,'method_name':name,'is_generic':'false','instance_name':instance})
def prop(instance,typ,name,value=None):
    return block('component_set_get',{'COMPONENT_SELECTOR':instance,'PROP':name}, {'VALUE':value} if value is not None else {}, {'component_type':typ,'set_or_get':'set' if value is not None else 'get','property_name':name,'is_generic':'false','instance_name':instance})
def call(name,*args):
    b=block('procedures_callnoreturn',{'PROCNAME':name},{'ARG'+str(i):v for i,v in enumerate(args)},{'name':name})
    names={'setBusy':['busy'],'callApi':['action','params'],'showPage':['pageName']}.get(name,[])
    for n in names: E.SubElement(b[0],'{'+MNS+'}arg',name=n)
    return b
def lookup(key,d=None,default=None): return block('dictionaries_lookup',values={'KEY':text(key),'DICT':d if d is not None else var('d'),'NOTFOUND':default if default is not None else text('')})
def compare(a,b,op='EQ'): return block('logic_compare',{'OP':op},{'A':a,'B':b})
def conditional(test,yes,no=None):
    b=block('controls_if',values={'IF0':test},mutation={'else':'1'} if no is not None else None)
    child(b,'statement','DO0',yes)
    if no is not None: child(b,'statement','ELSE',no)
    return b
def prepend(container,new):
    old=list(container)
    for c in old: container.remove(c)
    if old: chain(new,old[0])
    container.append(new)
def replace_value(b,name,v):
    c=getchild(b,'value',name); c.clear(); c.set('name',name); c.append(v)

with zipfile.ZipFile(SOURCE) as z: files={n:z.read(n) for n in z.namelist()}
bky=next(n for n in files if n.endswith('.bky')); scm=next(n for n in files if n.endswith('.scm'))
r=E.fromstring(files[bky])
def find_proc(name): return next(b for b in r if b.findtext('{'+NS+'}field[@name="NAME"]')==name)
def event(instance,name):
    return next(b for b in r if any(x.tag.endswith('mutation') and x.get('instance_name')==instance and x.get('event_name')==name for x in b))

# Keep source names/procedures and set only the key and endpoint that actually exist in the live environment.
endpoint=json.loads((ROOT/'.live-endpoint.local').read_text())['endpoint']
key=re.search(r"const KEY = '([^']+)';",(ROOT/'backend/Code.gs').read_text()).group(1)
replace_value(find_proc('apiKey'),'VALUE',text(key))
replace_value(find_proc('apiUrl'),'VALUE',text(endpoint))
r.append(block('global_declaration',{'NAME':'requestBusy'},{'VALUE':boolean(False)}))

# Disable interactive state changes until the outstanding reply has been processed.
busy=block('procedures_defnoreturn',{'NAME':'setBusy','VAR0':'busy'},mutation={})
E.SubElement(busy[0],'{'+MNS+'}arg',name='busy')
scm_data=json.loads(files[scm].decode().split('$JSON\n',1)[1].rsplit('|#',1)[0])
components=[]
def walk(c):
    components.append(c)
    for sub in c.get('$Components',[]): walk(sub)
walk(scm_data['Properties'])
steps=[assign('global requestBusy',var('busy'))]
for c in components:
    if c['$Type'] in ['Button','DatePicker','TimePicker','TextBox']:
        steps.append(prop(c['$Name'],c['$Type'],'Enabled',block('logic_negate',values={'BOOL':var('busy')})))
steps.append(prop('lblLoginInfo','Label','Text',block('controls_choose',values={'TEST':var('busy'),'THENRETURN':text('Connecting to server...'),'ELSERETURN':text('Sign in with your university email to get started.')})))
child(busy,'statement','STACK',chain(*steps)); r.append(busy)
proc=find_proc('callApi'); stack=getchild(proc,'statement','STACK'); old=stack[0]; stack.remove(old)
stack.append(conditional(var('global requestBusy'), method('Notifier1','Notifier','ShowAlert',text('Please wait for the current request to finish.')),old))
send=getchild(old,'statement','ELSE'); prepend(send,call('setBusy',boolean(True)))
# Every URL value, including action, is encoded.
for b in proc.iter('{'+NS+'}block'):
    if b.get('type')=='text_join':
        c=getchild(b,'value','ADD4')
        if c is not None: replace_value(b,'ADD4',method('webApi','Web','UriEncode',var('action')))

# Only current request replies can release the request gate; followup mine calls remain possible.
got=getchild(event('webApi','GotText'),'statement','DO'); old=got[0]; got.remove(old)
got.append(conditional(compare(var('url'),prop('webApi','Web','Url')),chain(call('setBusy',boolean(False)),old)))
timeout=getchild(event('webApi','TimedOut'),'statement','DO'); old=timeout[0]; timeout.remove(old)
timeout.append(conditional(compare(var('url'),prop('webApi','Web','Url')),chain(call('setBusy',boolean(False)),old)))
errors=getchild(event('Screen1','ErrorOccurred'),'statement','DO')
prepend(errors,call('setBusy',boolean(False)))
for instance in ['lvSlots','lvSessions']:
    st=getchild(event(instance,'AfterPicking'),'statement','DO'); old=st[0]; st.remove(old)
    st.append(conditional(block('logic_negate',values={'BOOL':var('global requestBusy')}),old))
# Reject mismatched action envelopes before dispatching any followup request.
for parent in list(event('webApi','GotText').iter()):
    for b in list(parent):
        if b.get('type')=='procedures_callnoreturn' and b.findtext('{'+NS+'}field[@name="PROCNAME"]')=='handleReply':
            idx=list(parent).index(b); parent.remove(b)
            parent.insert(idx,conditional(compare(var('act'),var('global lastAction')),b,method('Notifier1','Notifier','ShowAlert',text('Unexpected response action. Please retry.'))))

# Refresh profile fields from the real login response rather than stale shared TinyDB values.
reply=find_proc('handleReply'); dispatch=next(b for b in reply.iter('{'+NS+'}block') if b.get('type')=='controls_if' and getchild(b,'statement','DO8') is not None)
loginbranch=getchild(dispatch,'statement','DO0')[0]
ok=getchild(loginbranch,'statement','DO0')
def skills(key): return block('lists_join_with_separator',values={'LIST':lookup(key,default=block('lists_create_with',mutation={'items':'0'})),'SEPARATOR':text(', ')})
prepend(ok,chain(assign('global userNick',lookup('nick',default=var('global userNick'))),prop('txtNick','TextBox','Text',var('global userNick')),prop('txtOffers','TextBox','Text',skills('offers')),prop('txtWants','TextBox','Text',skills('wants'))))

# Picker labels use the same strict formats as transmitted data.
for inst,evt,fmt,methodname in [('dpDate','AfterDateSet','yyyy-MM-dd','FormatDate'),('tpTime','AfterTimeSet','HH:mm','FormatDateTime')]:
    ev=event(inst,evt)
    setter=next(b for b in ev.iter('{'+NS+'}block') if b.get('type')=='component_set_get' and b.findtext('{'+NS+'}field[@name="PROP"]')=='Text')
    replace_value(setter,'VALUE',method('Clock1','Clock',methodname,prop(inst,'DatePicker' if inst=='dpDate' else 'TimePicker','Instant'),text(fmt)))

# Prevent navigation from losing an outstanding session selection; clear it after refresh.
mine=getchild(dispatch,'statement','DO7')[0]
prepend(getchild(mine,'statement','DO0'),call('clearSessionSelection'))
# Client-side venue guidance; authoritative check stays on the backend.
for c in components:
    if c['$Name']=='txtPlace': c['Hint']='Library, lab, canteen, foyer, seminar hall, amphitheatre, Online or https:// link'
    if c['$Name']=='lblCredits': c['Text']='Credits: sign in to refresh'
    if c['$Name']=='lblTeachNote': c['Text']='Public campus locations or online only. Campus time: IST (HH:mm).'
files[scm]=('#|\n$JSON\n'+json.dumps(scm_data,separators=(',',':'))+'\n|#\n').encode()
files[bky]=E.tostring(r,encoding='utf-8',xml_declaration=True)
OUT.parent.mkdir(parents=True,exist_ok=True)
with zipfile.ZipFile(OUT,'w',zipfile.ZIP_DEFLATED) as z:
    for n,data in files.items(): z.writestr(n,data)
print(OUT)
