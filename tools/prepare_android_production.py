"""Patch the supplied master AIA without recreating its Designer or existing logic."""
import copy, json, pathlib, re, zipfile
import xml.etree.ElementTree as E

ROOT = pathlib.Path(__file__).resolve().parents[1]
SOURCE = ROOT / 'output/android/SkillSwap_MiniProject_Team_Reviewed.aia'
OUT = ROOT / 'output/android/release.local/SkillSwap_Production.aia'
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
    if old:
        tail=new
        while tail.find('{'+NS+'}next') is not None: tail=tail.find('{'+NS+'}next')[0]
        chain(tail,old[0])
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
endpoint='https://script.google.com/macros/s/AKfycbwtRFTbUZZrLX73aj39NUMU42B9I5ObUWGMrn91Wq3RWN5rvmgulMHwdTT7CJpX-3y2YA/exec'
key=json.loads((ROOT/'.production.local/credential.json').read_text())['key']
production=(ROOT/'.production.local/Code.gs').read_text(encoding='utf8')
assert re.search(r"const KEY = '([^']+)';",production).group(1)==key
assert "SpreadsheetApp.openById('190vT9WqEuo-JC7qY1ojLSlKZsNnsjs9zoJ8dfEG8afY')" in production
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
# Request generation prevents a late reply to an identical retry matching the new request.
def join(*parts): return block('text_join',values={'ADD'+str(i):v for i,v in enumerate(parts)},mutation={'items':str(len(parts))})
def number(n): return block('math_number',{'NUM':str(n)})
def both(a,b): return block('logic_operation',{'OP':'AND'},{'A':a,'B':b}, {'items':'2'})
r.append(block('global_declaration',{'NAME':'requestSerial'},{'VALUE':number(0)}))
prepend(send,assign('global requestSerial',block('math_add',values={'NUM0':var('global requestSerial'),'NUM1':number(1)},mutation={'items':'2'})))
urlsetter=next(b for b in proc.iter('{'+NS+'}block') if b.get('type')=='component_set_get' and b.findtext('{'+NS+'}field[@name="PROP"]')=='Url')
oldurl=getchild(urlsetter,'value','VALUE')[0]
replace_value(urlsetter,'VALUE',join(oldurl,text('&requestId='),var('global requestSerial')))
for instance,evt in [('webApi','GotText'),('webApi','TimedOut')]:
    gate=getchild(event(instance,evt),'statement','DO')[0]
    test=getchild(gate,'value','IF0')[0]
    replace_value(gate,'IF0',both(var('global requestBusy'),test))

# Runtime transport errors can contain the entire request URL; never show that URL/key.
errors.clear(); errors.set('name','DO')
errors.append(chain(call('setBusy',boolean(False)),method('Notifier1','Notifier','ShowAlert',text('Unable to complete this request. Refresh My Sessions before retrying a booking or publication.'))))
for b in event('webApi','TimedOut').iter('{'+NS+'}field'):
    if b.get('name')=='TEXT': b.text='Connection timed out. The server may still have saved your change. Refresh My Sessions before retrying.'

# Profile nickname must be editable on the profile page, not only on the login screen.
byname={c['$Name']:c for c in components}
nick=copy.deepcopy(byname['txtNick']); nick.update({'$Name':'txtProfileNick','Uuid':'-90001'})
label=copy.deepcopy(byname['lblNick']); label.update({'$Name':'lblProfileNick','Uuid':'-90002'})
logout=copy.deepcopy(byname['btnSave']); logout.update({'$Name':'btnSignOut','Uuid':'-90003','Text':'Sign Out'})
byname['vaProfile']['$Components'][1:1]=[label,nick]
byname['vaProfile']['$Components'].append(logout)
prepend(ok,prop('txtProfileNick','TextBox','Text',lookup('nick')))
save=getchild(event('btnSave','Click'),'statement','DO')
savecall=next(b for b in save.iter('{'+NS+'}block') if b.get('type')=='procedures_callnoreturn' and b.findtext('{'+NS+'}field[@name="PROCNAME"]')=='callApi')
params=getchild(savecall,'value','ARG1')[0]
replace_value(savecall,'ARG1',join(params,text('&nick='),method('webApi','Web','UriEncode',prop('txtProfileNick','TextBox','Text'))))
# Empty skills are valid: users can clear their preferences or save only a nickname.
save.clear(); save.set('name','DO'); save.append(savecall)
profileok=getchild(getchild(dispatch,'statement','DO2')[0],'statement','DO0')
prepend(profileok,chain(assign('global userNick',lookup('nick')),prop('txtProfileNick','TextBox','Text',var('global userNick')),prop('txtNick','TextBox','Text',var('global userNick'))))
busybody=getchild(busy,'statement','STACK')[0]
tail=busybody
while tail.find('{'+NS+'}next') is not None: tail=tail.find('{'+NS+'}next')[0]
chain(tail,prop('txtProfileNick','TextBox','Enabled',block('logic_negate',values={'BOOL':var('busy')})),prop('btnSignOut','Button','Enabled',block('logic_negate',values={'BOOL':var('busy')})))
logoutEvent=block('component_event',{'COMPONENT_SELECTOR':'btnSignOut'},mutation={'component_type':'Button','is_generic':'false','instance_name':'btnSignOut','event_name':'Click'})
logoutSteps=[call('clearSessionSelection')]
for name in ['userEmail','userNick','selectedSlotId','lastAction','serverResponse']: logoutSteps.append(assign('global '+name,text('')))
for name in ['searchResults','sessionsList']: logoutSteps.append(assign('global '+name,block('lists_create_with',mutation={'items':'0'})))
logoutSteps.append(assign('global userCredits',number(0)))
for name in ['txtEmail','txtNick','txtProfileNick','txtOffers','txtWants']: logoutSteps.append(prop(name,'TextBox','Text',text('')))
for name in ['lvSlots','lvSessions']: logoutSteps.append(prop(name,'ListView','Elements',block('lists_create_with',mutation={'items':'0'})))
for tag in ['email','nick','offers','wants']: logoutSteps.append(method('TinyDB1','TinyDB','ClearTag',text(tag)))
logoutSteps.extend([prop('lblWallet','Label','Visible',boolean(False)),prop('haNav','HorizontalArrangement','Visible',boolean(False)),call('showPage',text('login'))])
child(logoutEvent,'statement','DO',conditional(block('logic_negate',values={'BOOL':var('global requestBusy')}),chain(*logoutSteps))); r.append(logoutEvent)
byname['TinyDB1']['Namespace']='SkillSwapProduction'
byname['webApi']['Timeout']='30000'
# Show spendable credits separately from the balance reserved by booked sessions.
r.append(block('global_declaration',{'NAME':'reservedCredits'},{'VALUE':number(0)}))
reserve=block('controls_forEach',{'VAR':'session'},{'LIST':var('global sessionsList')})
child(reserve,'statement','DO',conditional(both(compare(lookup('status',var('session')),text('booked')),compare(lookup('learner',var('session')),var('global userEmail'))),assign('global reservedCredits',block('math_add',values={'NUM0':var('global reservedCredits'),'NUM1':number(1)},mutation={'items':'2'}))))
wallet=getchild(find_proc('updateWallet'),'statement','STACK');wallet.clear();wallet.set('name','STACK')
def wallettext():return join(text('Credits: '),var('global userCredits'),text(' | Available: '),block('math_subtract',values={'A':var('global userCredits'),'B':var('global reservedCredits')}),text(' | Reserved: '),var('global reservedCredits'))
wallet.append(chain(assign('global reservedCredits',number(0)),reserve,prop('lblWallet','Label','Text',wallettext()),prop('lblCredits','Label','Text',wallettext())))
mineok=getchild(mine,'statement','DO0')[0]
tail=mineok
while tail.find('{'+NS+'}next') is not None:tail=tail.find('{'+NS+'}next')[0]
chain(tail,call('updateWallet'))
# Login refreshes reservations from the server without navigating away from Profile.
tail=ok[0]
while tail.find('{'+NS+'}next') is not None:tail=tail.find('{'+NS+'}next')[0]
chain(tail,call('callApi',text('mine'),text('')))
byname['txtPlace']['Hint']='Choose a suggestion or type any meeting location / online link'
byname['lblTeachNote']['Text']='Choose a mutually agreed location. Session times use campus IST (HH:mm).'
venue=copy.deepcopy(byname['dpDate'])
venue.update({'$Name':'lpVenue','$Type':'ListPicker','$Version':'9','Uuid':'-90004','Text':'Choose a venue (or type below)','ElementsFromString':'SCIS - Computer Lab 1,SCIS - Ground Floor Reading Lounge,IGM Library,Campus Shopping Complex Cafe,Campus Lake Gazebo / Open Greenery,Student Centre,Sports Pavilion,Hostel Common Room,Online - Google Meet,Online - Zoom,Other - type below'})
teach=byname['vaTeach']['$Components']; teach.insert(teach.index(byname['txtPlace']),venue)
venueEvent=block('component_event',{'COMPONENT_SELECTOR':'lpVenue'},mutation={'component_type':'ListPicker','is_generic':'false','instance_name':'lpVenue','event_name':'AfterPicking'})
child(venueEvent,'statement','DO',conditional(compare(prop('lpVenue','ListPicker','Selection'),text('Other - type below')),chain(prop('txtPlace','TextBox','Text',text('')),method('txtPlace','TextBox','RequestFocus')),prop('txtPlace','TextBox','Text',prop('lpVenue','ListPicker','Selection'))))
r.append(venueEvent)
tail=busybody
while tail.find('{'+NS+'}next') is not None: tail=tail.find('{'+NS+'}next')[0]
chain(tail,prop('lpVenue','ListPicker','Enabled',block('logic_negate',values={'BOOL':var('busy')})))
files[scm]=('#|\n$JSON\n'+json.dumps(scm_data,separators=(',',':'))+'\n|#\n').encode()
# App Inventor mutations must serialize unprefixed with the XHTML default namespace.
files[bky]=E.tostring(r,encoding='utf-8',xml_declaration=False)
serialized=files[bky].decode().replace(' xmlns:html="'+MNS+'"','')
serialized=re.sub(r'<html:(\w+)',lambda m:'<'+m.group(1)+' xmlns="'+MNS+'"',serialized)
serialized=re.sub(r'</html:(\w+)>',r'</\1>',serialized)
files[bky]=serialized.encode()
OUT.parent.mkdir(parents=True,exist_ok=True)
import shutil, hashlib
for original,name in [(SOURCE,'Original_Reviewed_Backup.aia'),(ROOT/'SkillSwap_MiniProject_Team.aia','Original_Team_Backup.aia')]:
    backup=OUT.parent/name
    if backup.exists(): assert backup.read_bytes()==original.read_bytes(), 'Backup differs; refusing overwrite'
    else: shutil.copy2(original,backup)
with zipfile.ZipFile(OUT,'w',zipfile.ZIP_DEFLATED) as z:
    for n,data in files.items(): z.writestr(n,data)
print('Production AIA prepared privately; no credentials printed.')
