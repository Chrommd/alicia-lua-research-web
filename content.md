# Alicia Lua research

## Goal
Short reference for the currently known Alicia Lua-facing APIs/functions/tables.

This is not a full state dump.
This is not an SDK yet.
This is just the smallest useful command-style reference based on tested behavior so far.

---

# Global API: `mgr`

**Full name:** `AcMissionMgr`  
**Kind:** global API table/object  
**Available on state/scene:** Ranch

## `mgr:CreateMob(arg1, arg2, arg3, arg4, arg5)`

Creates a mob/entity and returns a mob userdata handle.

**Arguments**
- `arg1` - template/body name (confirmed)
- `arg2` - logic name / script category (best guess)
- `arg3` - position userdata (confirmed)
- `arg4` - mob type / relation flag (best guess)
- `arg5` - object ID (confirmed)

**Return value**
mob userdata handle

**Example**
```lua
mgr:CreateMob("balloon", "balloon", util:GetMyPos(), MONSTER_TYPE_FRIENDLY, 31002)
```

---

# Global API: `util`

**Full name:** `RcMissionScriptUtil`  
**Kind:** global API table/object  
**Available on state/scene:** Ranch

## `util:GetMyPos()`

Returns the player's current world position.

**Arguments**
none

**Return value**
position userdata with `x`, `y`, `z` fields

**Example**
```lua
local p = util:GetMyPos()
return p.x, p.y, p.z
```

---

## `util:GetRanchNodeList(arg1)`

Returns a list of ranch scene node positions for a named category.

**Arguments**
- `arg1` - ranch node category name (confirmed: `"balloon"`)

**Return value**
Lua table containing position userdata entries

**Example**
```lua
local nodes = util:GetRanchNodeList("balloon")
return table.getn(nodes)
```

---

## `util:InsertNoticeMsg(arg1)`

Displays a raw chat message in the game UI.

**Arguments**
- `arg1` - text string (confirmed)

**Return value**
none / not important

**Example**
```lua
util:InsertNoticeMsg("spawned")
```

---

# Global Ranch Functions

**Available on state/scene:** Ranch

These functions are available globally and are not part of a specific API object. There are more global functions/tables available, but these are the ones currently tested and confirmed to be exposed only in the ranch state/scene.

## `CreateNPC(arg1, arg2, arg3, arg4, arg5)`

Creates an NPC and returns a usable NPC/mob handle.

**Arguments**
- `arg1` - runtime instance name (confirmed)
- `arg2` - template/body name (confirmed)
- `arg3` - logic/script/category name (best guess)
- `arg4` - spawn locator string or position userdata (confirmed)
- `arg5` - object ID (confirmed)

**Return value**
userdata handle

**Example**
```lua
CreateNPC("stato", "stato_ranch", "stato_ranch", util:GetMyPos(), 34902)
```

---

## `GetMobByName(arg1)`

Returns a mob/NPC by its runtime name.

**Arguments**
- `arg1` - runtime name used at spawn time (confirmed)

**Return value**
userdata handle if found

**Example**
```lua
local m = GetMobByName("bigstato2")
if m then m:Scale(8,8,8) end
```

---

## `CreateAnimals()`

Spawns all ranch animals using built-in ranch state/config.

**Arguments**
none

**Return value**
none / not important

**Example**
```lua
CreateAnimals()
```

**Warning** Repeated calls duplicate the ranch animals.

---

## `CreateAnimal(...)`

Lower-level animal creation helper.

**Arguments**
unknown

**Return value**
unknown

**Warning** Direct blind probe caused a hard process exit. Do not use without a known signature.

---

# `userdata`

## What `userdata` is
In this project, `userdata` is usually a Lua wrapper around a native engine object.

Common meanings so far:
- position object
- mob handle
- NPC handle
- manager backing object

`userdata` is important because many of the useful engine objects are exposed this way instead of as plain Lua tables.

---

## What `userdata` looks like

### Printed form
If you print or stringify it, it often looks like:

```lua
userdata: 0ABC1234
```

That is only an identity-like marker.
It does not reveal the internal fields or native memory layout.

---

## How to inspect `userdata`

### Check the type
```lua
local v = util:GetMyPos()
return type(v), tostring(v)
```

### Check for exposed fields
```lua
local v = util:GetMyPos()
return v.x, v.y, v.z
```

### Check the metatable
```lua
local v = util:GetMyPos()
local mt = getmetatable(v)
return type(mt), tostring(mt)
```

### List metatable keys
```lua
local v = util:GetMyPos()
local mt = getmetatable(v)
if mt then
  for k,val in pairs(mt) do
    print(k, type(val))
  end
end
```

This is usually the cleanest way to discover methods safely.

---

## How to use `userdata`

### Treat it as a native handle
Do this:
- pass it directly to other engine functions
- call known methods on it
- read known exposed fields from it

Do not do this:
- assume it is a normal Lua table
- assume you can fully reconstruct or serialize it from Lua alone
- blindly pass it into unrelated functions just because it is userdata

### Position userdata example
```lua
local p = util:GetMyPos()
p.x = p.x + 3
```

This shows the tested position userdata supports at least practical field reads and writes for spawn offset use.

### Mob userdata example
```lua
local mob = mgr:CreateMob("balloon","balloon",util:GetMyPos(),MONSTER_TYPE_FRIENDLY,34001)
mob:Scale(3,3,3)
```

This shows returned mob userdata can expose callable methods through its metatable/proxy.

---

## Best mental model
- `userdata` is usually a native engine object handle
- `tostring(userdata)` is not a structural dump
- the real useful information is usually in:
  - exposed fields
  - metatable methods
  - known engine functions that accept it

---

## Safety levels

### Low risk
- `type(v)`
- `tostring(v)`
- `getmetatable(v)`
- reading already proven fields like `x`, `y`, `z`

### Medium risk
- writing to proven fields like `p.x = p.x + 3`
- calling already observed safe methods like `Scale(...)`

### High risk
- blind-calling unknown native methods
- assuming one userdata type behaves the same in every scene
- trying unknown creation/destruction methods with no known signature
