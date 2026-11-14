// A small pretend Roblox world: enough Instances, services and events to run beginner exercises.
import { Host, LuaTable, LuaFunction, LuaError } from './interpreter.js';

const fmt = (n) => String(Number(n.toFixed(3)));

export class Vec3 extends Host {
  constructor(x = 0, y = 0, z = 0) { super(); this.x = x; this.y = y; this.z = z; }
  typeofName() { return 'Vector3'; }
  toString() { return `${fmt(this.x)}, ${fmt(this.y)}, ${fmt(this.z)}`; }
  equals(o) { return o instanceof Vec3 && o.x === this.x && o.y === this.y && o.z === this.z; }
  get(k) {
    switch (k) {
      case 'X': return this.x; case 'Y': return this.y; case 'Z': return this.z;
      case 'Magnitude': return Math.hypot(this.x, this.y, this.z);
      case 'Unit': { const m = Math.hypot(this.x, this.y, this.z) || 1; return new Vec3(this.x / m, this.y / m, this.z / m); }
      case 'Dot': return (a) => [this.x * a[1].x + this.y * a[1].y + this.z * a[1].z];
      default: throw new LuaError(`${k} is not a valid member of Vector3`);
    }
  }
  set() { throw new LuaError('Vector3 values cannot be changed. Create a new Vector3 instead'); }
  arith(op, a, b, interp) {
    const A = a instanceof Vec3, B = b instanceof Vec3;
    if (A && B) { if (op === '+') return new Vec3(a.x + b.x, a.y + b.y, a.z + b.z); if (op === '-') return new Vec3(a.x - b.x, a.y - b.y, a.z - b.z); if (op === '*') return new Vec3(a.x * b.x, a.y * b.y, a.z * b.z); }
    if (A && typeof b === 'number') { if (op === '*') return new Vec3(a.x * b, a.y * b, a.z * b); if (op === '/') return new Vec3(a.x / b, a.y / b, a.z / b); }
    if (B && typeof a === 'number' && op === '*') return new Vec3(b.x * a, b.y * a, b.z * a);
    throw interp.err(`attempt to perform arithmetic (${op}) on ${interp.typeOf(a)} and ${interp.typeOf(b)}`);
  }
}
class Col extends Host {
  constructor(r, g, b) { super(); this.r = r; this.g = g; this.b = b; }
  typeofName() { return 'Color3'; }
  toString() { return `${fmt(this.r)}, ${fmt(this.g)}, ${fmt(this.b)}`; }
  equals(o) { return o instanceof Col && o.r === this.r && o.g === this.g && o.b === this.b; }
  get(k) { if (k === 'R') return this.r; if (k === 'G') return this.g; if (k === 'B') return this.b; throw new LuaError(`${k} is not a valid member of Color3`); }
  set() { throw new LuaError('Color3 values cannot be changed. Create a new Color3 instead'); }
}
class Brick extends Host {
  constructor(name) { super(); this.name = name; }
  typeofName() { return 'BrickColor'; }
  toString() { return this.name; }
  equals(o) { return o instanceof Brick && o.name === this.name; }
  get(k) { if (k === 'Name') return this.name; throw new LuaError(`${k} is not a valid member of BrickColor`); }
}
class UDim extends Host {
  constructor(s, o) { super(); this.s = s; this.o = o; }
  typeofName() { return 'UDim'; }
  toString() { return `${fmt(this.s)}, ${fmt(this.o)}`; }
  get(k) { if (k === 'Scale') return this.s; if (k === 'Offset') return this.o; throw new LuaError(`${k} is not a valid member of UDim`); }
}
export class UDim2 extends Host {
  constructor(xs, xo, ys, yo) { super(); this.xs = xs; this.xo = xo; this.ys = ys; this.yo = yo; }
  typeofName() { return 'UDim2'; }
  toString() { return `{${fmt(this.xs)}, ${fmt(this.xo)}}, {${fmt(this.ys)}, ${fmt(this.yo)}}`; }
  equals(o) { return o instanceof UDim2 && this.toString() === o.toString(); }
  get(k) { if (k === 'X') return new UDim(this.xs, this.xo); if (k === 'Y') return new UDim(this.ys, this.yo); throw new LuaError(`${k} is not a valid member of UDim2`); }
}
class EnumItem extends Host {
  constructor(type, name) { super(); this.type = type; this.name = name; }
  typeofName() { return 'EnumItem'; }
  toString() { return `Enum.${this.type}.${this.name}`; }
  get(k) { if (k === 'Name') return this.name; if (k === 'EnumType') return this.type; throw new LuaError(`${k} is not a valid member of EnumItem`); }
}
const enumCache = new Map();
const enumItem = (type, name) => { const k = `${type}.${name}`; if (!enumCache.has(k)) enumCache.set(k, new EnumItem(type, name)); return enumCache.get(k); };
class EnumNamespace extends Host {
  constructor(type) { super(); this.type = type; }
  get(k) { return enumItem(this.type, k); }
}
class EnumRoot extends Host {
  get(k) { return new EnumNamespace(k); }
}
class Static extends Host {
  constructor(name, members) { super(); this.name = name; this.members = members; }
  toString() { return this.name; }
  get(k) { if (k in this.members) return this.members[k]; throw new LuaError(`${k} is not a valid member of ${this.name}`); }
}

// ---- signals ----
class Connection extends Host {
  constructor(signal, fn) { super(); this.signal = signal; this.fn = fn; this.connected = true; }
  typeofName() { return 'RBXScriptConnection'; }
  get(k) {
    if (k === 'Connected') return this.connected;
    if (k === 'Disconnect') return (a) => { a[0].connected = false; a[0].signal.handlers = a[0].signal.handlers.filter((h) => h !== a[0]); };
    throw new LuaError(`${k} is not a valid member of RBXScriptConnection`);
  }
}
export class Signal extends Host {
  constructor(world) { super(); this.world = world; this.handlers = []; }
  typeofName() { return 'RBXScriptSignal'; }
  get(k) {
    if (k === 'Connect') return (a) => { const c = new Connection(this, a[1]); this.handlers.push(c); return [c]; };
    if (k === 'Once') return (a) => { const c = new Connection(this, null); c.fn = (args) => { c.connected = false; this.handlers = this.handlers.filter((h) => h !== c); return this.world.interp.call(a[1], args); }; this.handlers.push(c); return [c]; };
    throw new LuaError(`${k} is not a valid member of RBXScriptSignal`);
  }
  fire(...args) {
    for (const h of [...this.handlers]) {
      if (!h.connected) continue;
      try { this.world.interp.call(h.fn, args); } catch (e) { if (e instanceof LuaError) this.world.errors.push(typeof e.value === 'string' ? e.value : 'error'); else throw e; }
    }
  }
}

const EVENTS = new Set(['ChildAdded', 'ChildRemoved', 'DescendantAdded', 'Touched', 'TouchEnded', 'Changed', 'Destroying', 'MouseButton1Click', 'MouseButton1Down',
  'Activated', 'MouseEnter', 'MouseLeave', 'Died', 'HealthChanged', 'PlayerAdded', 'PlayerRemoving', 'CharacterAdded', 'OnServerEvent', 'OnClientEvent',
  'Event', 'Heartbeat', 'Stepped', 'RenderStepped', 'InputBegan', 'InputEnded', 'Equipped', 'Unequipped', 'Triggered', 'FocusLost', 'AncestryChanged']);

// ---- classes ----
const U = () => undefined;
const CLASSES = {
  Instance: { props: {} },
  Folder: { ext: 'Instance' }, Configuration: { ext: 'Instance' }, Backpack: { ext: 'Instance' }, PlayerGui: { ext: 'Instance' },
  Model: { ext: 'Instance', props: { PrimaryPart: U } },
  BasePart: { ext: 'Instance', props: { Anchored: () => false, CanCollide: () => true, CanTouch: () => true, Size: () => new Vec3(4, 1, 2), Position: () => new Vec3(0, 0, 0), Color: () => new Col(0.63, 0.64, 0.64), BrickColor: () => new Brick('Medium stone grey'), Material: () => enumItem('Material', 'Plastic'), Transparency: () => 0 } },
  Part: { ext: 'BasePart', props: { Shape: () => enumItem('PartType', 'Block') } },
  MeshPart: { ext: 'BasePart' }, SpawnLocation: { ext: 'Part' },
  Script: { ext: 'Instance', props: { Enabled: () => true } }, LocalScript: { ext: 'Instance', props: { Enabled: () => true } }, ModuleScript: { ext: 'Instance', props: { Source: () => '' } },
  IntValue: { ext: 'Instance', props: { Value: () => 0 } }, NumberValue: { ext: 'Instance', props: { Value: () => 0 } },
  StringValue: { ext: 'Instance', props: { Value: () => '' } }, BoolValue: { ext: 'Instance', props: { Value: () => false } }, ObjectValue: { ext: 'Instance', props: { Value: U } },
  Humanoid: { ext: 'Instance', props: { Health: () => 100, MaxHealth: () => 100, WalkSpeed: () => 16, JumpPower: () => 50, JumpHeight: () => 7.2, DisplayName: () => '' } },
  Tool: { ext: 'Instance', props: { CanBeDropped: () => true, RequiresHandle: () => true, ToolTip: () => '' } },
  RemoteEvent: { ext: 'Instance' }, RemoteFunction: { ext: 'Instance' }, BindableEvent: { ext: 'Instance' },
  ProximityPrompt: { ext: 'Instance', props: { ActionText: () => '', ObjectText: () => '' } },
  GuiObject: { ext: 'Instance', props: { Size: () => new UDim2(0, 100, 0, 100), Position: () => new UDim2(0, 0, 0, 0), BackgroundColor3: () => new Col(1, 1, 1), BackgroundTransparency: () => 0, Visible: () => true } },
  ScreenGui: { ext: 'Instance', props: { Enabled: () => true, ResetOnSpawn: () => true } },
  Frame: { ext: 'GuiObject' },
  TextLabel: { ext: 'GuiObject', props: { Text: () => '', TextColor3: () => new Col(0, 0, 0), TextSize: () => 14, TextScaled: () => false } },
  TextButton: { ext: 'GuiObject', props: { Text: () => '', TextColor3: () => new Col(0, 0, 0), TextSize: () => 14, TextScaled: () => false, AutoButtonColor: () => true } },
  ImageLabel: { ext: 'GuiObject', props: { Image: () => '' } },
  UIListLayout: { ext: 'Instance', props: { Padding: U } },
  Workspace: { ext: 'Instance', props: { Gravity: () => 196.2 } }, Players: { ext: 'Instance' }, ReplicatedStorage: { ext: 'Instance' }, ServerScriptService: { ext: 'Instance' },
  ServerStorage: { ext: 'Instance' }, StarterGui: { ext: 'Instance' }, Lighting: { ext: 'Instance' }, RunService: { ext: 'Instance' }, DataStoreService: { ext: 'Instance' },
  UserInputService: { ext: 'Instance' }, Debris: { ext: 'Instance' }, DataModel: { ext: 'Instance' }, TweenService: { ext: 'Instance' },
  Player: { ext: 'Instance', props: { Character: U, UserId: () => 1 } },
};
const SERVICES = ['Workspace', 'Players', 'ReplicatedStorage', 'ServerScriptService', 'ServerStorage', 'StarterGui', 'Lighting', 'RunService', 'DataStoreService', 'UserInputService', 'Debris', 'TweenService'];
const GUI = new Set(['Frame', 'TextLabel', 'TextButton', 'ImageLabel']);

function chain(cls) { const out = []; for (let c = cls; c; c = CLASSES[c]?.ext) out.push(c); return out; }

function typeName(v, interp) { return v === undefined ? 'nil' : interp.typeOf(v); }

export class Inst extends Host {
  constructor(world, className) {
    super();
    this.world = world; this.className = className; this.name = className; this.parent = null; this.children = [];
    this.props = new Map(); this.signals = new Map(); this.attrs = new Map(); this.destroyed = false; this.dead = false;
    for (const c of chain(className).reverse()) for (const [k, f] of Object.entries(CLASSES[c].props ?? {})) this.props.set(k, f());
    if (GUI.has(className)) for (const [k, f] of Object.entries(CLASSES.GuiObject.props)) if (!this.props.has(k)) this.props.set(k, f());
  }
  typeofName() { return 'Instance'; }
  toString() { return this.name; }
  fullName() { return this.parent && this.parent.className !== 'DataModel' ? `${this.parent.fullName()}.${this.name}` : this.name; }
  signal(name) { if (!this.signals.has(name)) this.signals.set(name, new Signal(this.world)); return this.signals.get(name); }
  fire(name, ...args) { this.signals.get(name)?.fire(...args); }
  isA(cls) {
    const c = chain(this.className);
    if (c.includes(cls)) return true;
    if (cls === 'GuiObject') return GUI.has(this.className);
    if (cls === 'LuaSourceContainer') return ['Script', 'LocalScript', 'ModuleScript'].includes(this.className);
    if (cls === 'ValueBase') return /Value$/.test(this.className);
    return false;
  }
  descendants() { return this.children.flatMap((c) => [c, ...c.descendants()]); }
  setParent(p) {
    if (this.parent === p) return;
    const old = this.parent;
    if (old) { old.children = old.children.filter((c) => c !== this); old.fire('ChildRemoved', this); }
    this.parent = p;
    if (p) { p.children.push(this); p.fire('ChildAdded', this); for (let a = p; a; a = a.parent) a.fire('DescendantAdded', this); }
    this.fire('AncestryChanged', this, p);
  }
  clone() {
    const c = new Inst(this.world, this.className);
    c.name = this.name; this.props.forEach((v, k) => c.props.set(k, v)); this.attrs.forEach((v, k) => c.attrs.set(k, v));
    this.children.forEach((ch) => { const cc = ch.clone(); cc.setParent(c); });
    return c;
  }
  destroy() {
    if (this.destroyed) return;
    this.fire('Destroying');
    this.children.slice().forEach((c) => c.destroy());
    this.setParent(null); this.destroyed = true;
  }
  find(name, recursive) {
    const direct = this.children.find((c) => c.name === name);
    if (direct || !recursive) return direct;
    for (const c of this.children) { const r = c.find(name, true); if (r) return r; }
    return undefined;
  }
  tbl(list) { const t = new LuaTable(); list.forEach((x, i) => t.set(i + 1, x)); return t; }

  get(key, interp) {
    const w = this.world;
    switch (key) {
      case 'Name': return this.name;
      case 'ClassName': return this.className;
      case 'Parent': return this.parent ?? undefined;
      case 'Destroy': case 'Remove': return (a) => { a[0].destroy(); };
      case 'Clone': return (a) => [a[0].clone()];
      case 'ClearAllChildren': return (a) => { a[0].children.slice().forEach((c) => c.destroy()); };
      case 'GetChildren': return (a) => [this.tbl(a[0].children)];
      case 'GetDescendants': return (a) => [this.tbl(a[0].descendants())];
      case 'GetFullName': return (a) => [a[0].fullName()];
      case 'FindFirstChild': return (a) => [a[0].find(a[1], interp.truthy(a[2]))];
      case 'FindFirstChildOfClass': return (a) => [a[0].children.find((c) => c.className === a[1])];
      case 'FindFirstChildWhichIsA': return (a) => [a[0].children.find((c) => c.isA(a[1]))];
      case 'IsA': return (a) => [a[0].isA(a[1])];
      case 'IsDescendantOf': return (a) => { for (let p = a[0].parent; p; p = p.parent) if (p === a[1]) return [true]; return [false]; };
      case 'WaitForChild': return (a) => {
        const c = a[0].find(a[1]);
        if (c) return [c];
        if (a[2] !== undefined) return [undefined];
        throw new LuaError(`Infinite yield possible: WaitForChild("${a[1]}") never found a child with that name inside ${a[0].name}. Check the spelling`);
      };
      case 'SetAttribute': return (a) => { a[0].attrs.set(a[1], a[2]); };
      case 'GetAttribute': return (a) => [a[0].attrs.get(a[1])];
      case 'GetPropertyChangedSignal': return (a) => [a[0].signal(`prop:${a[1]}`)];
      default:
    }
    if (this.className === 'DataModel' && key === 'GetService') return (a) => {
      const s = a[0].children.find((c) => c.className === a[1]);
      if (!s) throw new LuaError(`${a[1]} is not a valid Service name`);
      return [s];
    };
    if (this.className === 'Players') {
      if (key === 'GetPlayers') return () => [this.tbl(this.children.filter((c) => c.className === 'Player'))];
      if (key === 'LocalPlayer') return w.localPlayer;
      if (key === 'GetPlayerFromCharacter') return (a) => [this.children.find((p) => p.props.get('Character') === a[1])];
    }
    if (this.className === 'DataStoreService' && key === 'GetDataStore') return (a) => [w.dataStore(a[1])];
    if (this.className === 'RunService') {
      if (key === 'IsServer') return () => [true]; if (key === 'IsClient') return () => [false]; if (key === 'IsStudio') return () => [true];
    }
    if (this.className === 'Debris' && key === 'AddItem') return (a) => { w.delay(a[2] ?? 10, () => a[1].destroy()); };
    if (this.className === 'Humanoid' && key === 'TakeDamage') return (a) => { a[0].set('Health', a[0].props.get('Health') - a[1], interp); };
    if (this.className === 'BindableEvent' && key === 'Fire') return (a) => { a[0].fire('Event', ...a.slice(1)); };
    if (this.className === 'RemoteEvent') {
      if (key === 'FireServer') return (a) => { a[0].fire('OnServerEvent', w.localPlayer, ...a.slice(1)); };
      if (key === 'FireClient') return (a) => { a[0].fire('OnClientEvent', ...a.slice(2)); w.clientEvents.push({ remote: a[0], player: a[1], args: a.slice(2) }); };
      if (key === 'FireAllClients') return (a) => { a[0].fire('OnClientEvent', ...a.slice(1)); w.clientEvents.push({ remote: a[0], player: null, args: a.slice(1) }); };
    }
    if (this.className === 'RemoteFunction') {
      if (key === 'InvokeServer') return (a) => { const f = a[0].attrs.get('__onServerInvoke'); if (!f) throw new LuaError('InvokeServer was called but nothing set OnServerInvoke on the server'); return interp.call(f, [w.localPlayer, ...a.slice(1)]); };
      if (key === 'InvokeClient') return (a) => { const f = a[0].attrs.get('__onClientInvoke'); if (!f) throw new LuaError('InvokeClient was called but nothing set OnClientInvoke'); return interp.call(f, a.slice(2)); };
      if (key === 'OnServerInvoke') return this.attrs.get('__onServerInvoke');
      if (key === 'OnClientInvoke') return this.attrs.get('__onClientInvoke');
    }
    if (EVENTS.has(key)) return this.signal(key);
    if (this.props.has(key)) return this.props.get(key);
    const child = this.find(key);
    if (child) return child;
    throw new LuaError(`${key} is not a valid member of ${this.className} "${this.fullName()}". Check the spelling and capital letters`);
  }

  set(key, value, interp) {
    if (key === 'Name') { if (typeof value !== 'string') throw new LuaError(`Unable to assign property Name. string expected, got ${typeName(value, interp)}`); this.name = value; return; }
    if (key === 'Parent') {
      if (value !== undefined && !(value instanceof Inst)) throw new LuaError(`Unable to assign property Parent. Object expected, got ${typeName(value, interp)}`);
      this.setParent(value ?? null); return;
    }
    if (this.className === 'RemoteFunction' && (key === 'OnServerInvoke' || key === 'OnClientInvoke')) { this.attrs.set(`__${key[0].toLowerCase()}${key.slice(1)}`, value); return; }
    if (!this.props.has(key)) throw new LuaError(`${key} is not a valid member of ${this.className} "${this.fullName()}". Check the spelling and capital letters`);
    const old = this.props.get(key);
    if (old !== undefined && !(old instanceof EnumItem) && interp.typeOf(old) !== interp.typeOf(value)) {
      throw new LuaError(`Unable to assign property ${key}. ${interp.typeOf(old)} expected, got ${typeName(value, interp)}`);
    }
    if (this.className === 'Humanoid' && key === 'Health') {
      const v = Math.min(Math.max(value, 0), this.props.get('MaxHealth'));
      this.props.set('Health', v);
      this.fire('HealthChanged', v); this.fire('prop:Health');
      if (v <= 0 && !this.dead) { this.dead = true; this.fire('Died'); }
      return;
    }
    this.props.set(key, value);
    if (old !== value) { this.fire(`prop:${key}`); this.fire('Changed', key === 'Value' && /Value$/.test(this.className) ? value : key); }
  }
}

class DataStore extends Host {
  constructor(world, name) { super(); this.world = world; this.name = name; this.data = world.stores.get(name) ?? new Map(); world.stores.set(name, this.data); }
  typeofName() { return 'Instance'; }
  guard() {
    if (this.world.dsFail > 0) { this.world.dsFail--; throw new LuaError('DataStore request was rejected. (Simulated outage: try again or handle the error with pcall)'); }
  }
  get(k, interp) {
    const clone = (v) => { if (!(v instanceof LuaTable)) return v; const t = new LuaTable(); v.entries().forEach(([a, b]) => t.set(a, clone(b))); return t; };
    const key = (a) => { if (typeof a[1] !== 'string') throw new LuaError('DataStore key must be a string'); return a[1]; };
    switch (k) {
      case 'GetAsync': return (a) => { this.guard(); return [clone(this.data.get(key(a)))]; };
      case 'SetAsync': return (a) => { this.guard(); key(a); this.data.set(a[1], clone(a[2])); return [a[2] === undefined ? undefined : 'version']; };
      case 'RemoveAsync': return (a) => { this.guard(); const o = this.data.get(key(a)); this.data.delete(a[1]); return [o]; };
      case 'IncrementAsync': return (a) => { this.guard(); const n = (this.data.get(key(a)) ?? 0) + (a[2] ?? 1); this.data.set(a[1], n); return [n]; };
      case 'UpdateAsync': return (a) => { this.guard(); const r = interp.call(a[2], [clone(this.data.get(key(a)))])[0]; if (r !== undefined) this.data.set(a[1], clone(r)); return [r]; };
      default: throw new LuaError(`${k} is not a valid member of DataStore`);
    }
  }
}

export function installRoblox(interp) {
  const G = interp.globals;
  const world = { interp, errors: [], time: 0, timers: [], stores: new Map(), dsFail: 0, clientEvents: [], Vec3, Col, UDim2 };
  interp.clock = () => world.time;

  const game = new Inst(world, 'DataModel'); game.name = 'Game';
  const services = {};
  for (const s of SERVICES) { const i = new Inst(world, s); i.setParent(game); services[s] = i; }
  Object.assign(world, { game, workspace: services.Workspace, players: services.Players, replicatedStorage: services.ReplicatedStorage, serverScriptService: services.ServerScriptService, serverStorage: services.ServerStorage, services });
  world.dataStore = (name) => new DataStore(world, name);

  world.makePlayer = (name, inWorld = true) => {
    const p = new Inst(world, 'Player'); p.name = name;
    const gui = new Inst(world, 'PlayerGui'); gui.name = 'PlayerGui'; gui.setParent(p);
    const bp = new Inst(world, 'Backpack'); bp.name = 'Backpack'; bp.setParent(p);
    world.spawnCharacter(p, inWorld);
    return p;
  };
  world.spawnCharacter = (p, inWorld = true) => {
    const m = new Inst(world, 'Model'); m.name = p.name;
    const h = new Inst(world, 'Humanoid'); h.name = 'Humanoid'; h.setParent(m);
    const root = new Inst(world, 'Part'); root.name = 'HumanoidRootPart'; root.setParent(m);
    m.props.set('PrimaryPart', root);
    if (inWorld) m.setParent(world.workspace);
    p.props.set('Character', m);
    p.fire('CharacterAdded', m);
    return m;
  };
  /** Pretend a player joins: they appear in Players and PlayerAdded fires. */
  world.addPlayer = (name = 'Player') => { const p = world.makePlayer(name); p.setParent(world.players); world.players.fire('PlayerAdded', p); return p; };
  world.removePlayer = (p) => { world.players.fire('PlayerRemoving', p); p.setParent(null); };
  world.localPlayer = world.makePlayer('Player1', false);
  world.localPlayer.setParent(world.players);
  world.find = (path) => path.split('.').reduce((n, part) => n && n.find(part), game);
  world.make = (cls, name) => { const i = new Inst(world, cls); if (name) i.name = name; return i; };
  world.Inst = Inst;
  world.part = (name = 'Part') => { const p = new Inst(world, 'Part'); p.name = name; return p; };

  world.delay = (t, fn) => { world.timers.push({ at: world.time + t, fn }); };
  world.advance = (dt) => {
    world.time += dt;
    for (let guard = 0; guard < 1000; guard++) {
      const due = world.timers.filter((t) => t.at <= world.time).sort((a, b) => a.at - b.at)[0];
      if (!due) break;
      world.timers.splice(world.timers.indexOf(due), 1);
      due.fn();
    }
  };
  world.heartbeat = (dt = 1 / 60) => { world.time += dt; services.RunService.fire('Heartbeat', dt); };

  const wait = (a) => { const t = typeof a[0] === 'number' ? a[0] : 0.03; world.advance(t); return [t, world.time]; };
  const callGuarded = (fn, args) => { try { interp.call(fn, args); } catch (e) { if (e instanceof LuaError) world.errors.push(typeof e.value === 'string' ? e.value : 'error'); else throw e; } };
  const task = new LuaTable();
  task.set('wait', wait);
  task.set('spawn', (a) => { callGuarded(a[0], a.slice(1)); });
  task.set('defer', (a) => { callGuarded(a[0], a.slice(1)); });
  task.set('delay', (a) => { world.delay(a[0], () => callGuarded(a[1], a.slice(2))); });
  task.set('cancel', () => {});
  G.set('task', task);
  G.set('wait', wait); G.set('delay', (a) => { world.delay(a[0], () => callGuarded(a[1], [])); }); G.set('spawn', (a) => { callGuarded(a[0], []); });
  G.set('tick', () => [1700000000 + world.time]); G.set('time', () => [world.time]);

  G.set('game', game); G.set('workspace', world.workspace);
  const script = new Inst(world, 'Script'); script.name = 'Script'; script.setParent(world.serverScriptService);
  world.script = script; G.set('script', script);
  G.set('Instance', new Static('Instance', {
    new: (a) => {
      if (typeof a[0] !== 'string' || !CLASSES[a[0]] || SERVICES.includes(a[0]) || ['DataModel', 'Player', 'GuiObject', 'BasePart'].includes(a[0])) throw new LuaError(`Unable to create an Instance of type "${interp.tostr(a[0])}". Check the spelling and capital letters`);
      const i = new Inst(world, a[0]);
      if (a[1] !== undefined) i.setParent(a[1]);
      return [i];
    },
  }));
  const n = (v, i) => { if (typeof v !== 'number') throw new LuaError(`Argument ${i} must be a number, got ${interp.type(v)}`); return v; };
  G.set('Vector3', new Static('Vector3', { new: (a) => [new Vec3(n(a[0] ?? 0, 1), n(a[1] ?? 0, 2), n(a[2] ?? 0, 3))], zero: new Vec3(0, 0, 0), one: new Vec3(1, 1, 1) }));
  G.set('Color3', new Static('Color3', { fromRGB: (a) => [new Col(n(a[0] ?? 0, 1) / 255, n(a[1] ?? 0, 2) / 255, n(a[2] ?? 0, 3) / 255)], new: (a) => [new Col(a[0] ?? 0, a[1] ?? 0, a[2] ?? 0)] }));
  G.set('BrickColor', new Static('BrickColor', { new: (a) => [new Brick(String(a[0]))] }));
  G.set('UDim2', new Static('UDim2', {
    new: (a) => [new UDim2(a[0] ?? 0, a[1] ?? 0, a[2] ?? 0, a[3] ?? 0)],
    fromScale: (a) => [new UDim2(a[0] ?? 0, 0, a[1] ?? 0, 0)], fromOffset: (a) => [new UDim2(0, a[0] ?? 0, 0, a[1] ?? 0)],
  }));
  G.set('Enum', new EnumRoot());
  return world;
}
