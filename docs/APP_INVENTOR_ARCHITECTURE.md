# SkillSwap UoH &mdash; MIT App Inventor Architecture & Blocks Reference
**Course**: IE209 Skill Development Mini-Project &bull; Specifications 4B & 5C  
**School of Computer and Information Sciences (SCIS), University of Hyderabad**  
**Role R3**: App Developer (Blocks)

---

## 1. Single-Screen Multi-Page Architecture (One VerticalArrangement per Page)

Per Section 4B of the IE209 specification, to avoid screen switching overhead and memory issues in MIT App Inventor, the mobile application uses a **Single Screen Architecture (`Screen1`)** with 6 stacked full-width `VerticalArrangement` containers toggled by visibility:

| Page Name | Container Name | Purpose | Key Visible Components |
| :--- | :--- | :--- | :--- |
| **Login** | `vaLogin` | University Authentication | `txtEmail`, `txtNick`, `btnLogin`, `lblLoginError` |
| **Profile** | `vaProfile` | Manage Skills & Credits | `txtOffers`, `txtWants`, `lblCredits`, `btnSave` |
| **Search** | `vaSearch` | Find Peer Mentors | `txtSkill`, `btnSearch`, `lvSlots` |
| **Slot** | `vaSlot` | Session Details & Booking | `lblSkill`, `lblTutor`, `lblWhen`, `lblPlace`, `btnBook` |
| **Teach** | `vaTeach` | Publish Mentoring Slot | `txtSlotSkill`, `dpDate`, `tpTime`, `txtPlace`, `btnPublish` |
| **Sessions** | `vaSessions` | Active & Completed Sessions | `lvSessions`, `btnConfirm`, `btnCancel`, `btnRate` |
| **Non-Visible** | &mdash; | Logic, Networking & Alerts | `webApi` (Web component), `TinyDB1`, `Notifier1` |

---

## 2. API Communication Blocks Pattern (Section 5C Step 1)

### Global Variables
```blocks
initialize global apiUrl to "https://script.google.com/macros/s/.../exec"
initialize global apiKey to "team-secret-123"
initialize global currentEmail to ""
initialize global slots to create empty list
initialize global selectedSlot to create empty dictionary
```

### Procedure: `callApi(action, params)`
```blocks
to callApi (action, params)
  set webApi.Url to join(
    get global apiUrl,
    "?key=", get global apiKey,
    "&action=", get action,
    get params
  )
  call webApi.Get
```

### Event: `webApi.GotText(url, responseCode, responseType, responseContent)`
```blocks
when webApi.GotText (url, responseCode, responseType, responseContent)
  if get responseCode != 200 then
    call Notifier1.ShowAlert("Network problem, try again")
  else
    initialize local r to call webApi.JsonTextDecodeWithDictionaries(get responseContent)
    initialize local a to get value for key "action" in dictionary (get r)
    initialize local d to get value for key "data" in dictionary (get r)
    call handleReply(get a, get d)
```

---

## 3. Page Switching Procedure (Section 5C Step 2)

```blocks
to showPage (p)
  set vaLogin.Visible to (get p = "login")
  set vaProfile.Visible to (get p = "profile")
  set vaSearch.Visible to (get p = "search")
  set vaSlot.Visible to (get p = "slot")
  set vaTeach.Visible to (get p = "teach")
  set vaSessions.Visible to (get p = "sessions")
```

---

## 4. Feature Blocks Mappings

### 4.1 Search & Slot Selection (Section 5C Step 3)
```blocks
when btnSearch.Click
  call callApi("search", join("&email=", UriEncode(get global currentEmail), "&skill=", UriEncode(txtSkill.Text)))

when lvSlots.AfterPicking
  set global selectedSlot to select list item (get global slots, lvSlots.SelectionIndex)
  set lblSkill.Text to get value for key "skill" in dictionary (get global selectedSlot)
  set lblTutor.Text to get value for key "tutor" in dictionary (get global selectedSlot)
  set lblWhen.Text to join(get value for key "date" in dictionary (get global selectedSlot), " ", get value for key "time" in dictionary (get global selectedSlot))
  set lblPlace.Text to get value for key "place" in dictionary (get global selectedSlot)
  call showPage("slot")
```

### 4.2 Booking with Academic Integrity Dialog (Section 5C Step 4)
```blocks
when btnBook.Click
  call Notifier1.ShowChooseDialog(
    "Book this session for 1 credit? (Learning only, no assignment help)",
    "Campus Honor Code",
    "Book",
    "Cancel",
    false
  )

when Notifier1.AfterChoosing (choice)
  if get choice = "Book" then
    call callApi(
      "book",
      join(
        "&email=", UriEncode(get global currentEmail),
        "&slot=", get value for key "slotId" in dictionary (get global selectedSlot)
      )
    )
```

### 4.3 Mutual Confirmation & Credit Transfer (Section 5C Step 5)
```blocks
when btnConfirm.Click
  call callApi(
    "confirm",
    join(
      "&email=", UriEncode(get global currentEmail),
      "&slot=", get value for key "slotId" in dictionary (get global selectedSlot)
    )
  )

// In handleReply for action = "confirm":
if get a = "confirm" then
  if get value for key "transferred" in dictionary (get d) = true then
    call Notifier1.ShowAlert("Both confirmed: 1 credit moved ✔")
  else
    call Notifier1.ShowAlert("Waiting for the other person to confirm")
```

---

## 5. Daily Export & Team Workflow Guideline

- **Master AIA Owner**: R3 (App Developer).
- **PNG Block Sharing**: To share block logic across teammates without project overwrite, right-click any block canvas &rarr; **Download Blocks as PNG**, send via WhatsApp/Drive, and drag PNG directly into the other workspace.
- **Daily Backup**: R3 exports `SkillSwap_DayN.aia` to the shared Google Drive folder every evening after standup.
