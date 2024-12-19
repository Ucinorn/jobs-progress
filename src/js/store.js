

import jobs from './jobs'
import upgrades from './upgrades'
import { zones, roads } from './zones'
import perks from './perks'

const base = {
  debug: true,
  startup: true,
  view: 'world',
  chosenJob: "",
  questing: false,
  completingcount: 0,
  config: {
    hintcount: 3,
    wanderlust: false
  },
  constants: {
    loopspeed: 250,
    completingcount: 15,
  },
  interval: {},
  player: {},
  multis: {},
  finalMultis: {},
  boosts: {},
  finalBoosts: {},
  graveyard: [],
  prestige: {
    confirm: '',
    prestiged: false,
    next: 0,
    current: 0,
    total: 0,
    effects: {},
    lastEffects: {},
  },
  areaMovement: [], // this is the sequence of areas the player has travelled through
  // pulled from elsewhere
  jobs: jobs,
  zones: zones,
  perks: perks,
  upgrades: upgrades,
  roads: roads,
  areas: [],
  bought: [],
  stats: {},
  icons: {
    labour: "bi-wrench-adjustable-circle-fill",
    combat: 'shield',
    archery: 'bullseye',
    scouting: 'binoculars',
    whiteMagic: 'medkit',
    blackMagic: 'bolt',
    herbalism: 'leaf',
    diplomacy: 'hand-peace-o',
    guile: 'user-secret',
    divinity: 'crosshairs',
    urban: 'home',
    wilderness: 'tree',
    dungeon: 'shield',
  },
  messages: []
}

// calculate the default areas for reference later on
const calcAreas = function () {
  var a = [];
  let zones = base.zones
  Object.keys(zones).map(function (key, index) {
    if (!(a.includes(zones[key].area))) {
      a.push(zones[key].area)
    }
  });
  return a;
}

base.areas = calcAreas()

import { reactive } from 'vue'

export const store = reactive(base)

export default store