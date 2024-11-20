const zones = {
  "Traveler's Inn": {
    area: 'Coast',
    locale: 'urban',
    skills: {
      'labour': 1,
      'herbalism': 2,
    }
  },
  'Wheat Fields': {
    area: 'Coast',
    locale: 'urban',
    skills: {
      'labour': 3,
    }
  },
  'Nearby Woods': {
    area: 'Coast',
    locale: 'wilderness',
    skills: {
      'combat': 1,
      'scouting': 3,
    }
  },
  'Swamp': {
    area: 'Coast',
    locale: 'wilderness',
    skills: {
      'scouting': 1,
      'herbalism': 4,
    }
  },
  'Town Square': {
    area: 'Coast',
    locale: 'urban',
    skills: {
      'diplomacy': 1,
      'guile': 2,
      'labour': 1,
    }
  },
  'Druid Grove': {
    area: 'Coast',
    locale: 'wilderness',
    locked: true,
    hint: 'The druids keep the location of their home a close secret.',
    check: function (self) {
      return self.jobs.druid.unlocked;
    },
    skills: {
      'whiteMagic': 3,
      'herbalism': 3,
      'diplomacy': 3,
    }
  },
  'Quiet Forest': {
    area: 'Steppes',
    locale: 'wilderness',
    skills: {
      'scouting': 2,
      'herbalism': 2,
      'whiteMagic': 1,
    }
  },
  'Hillside Caves': {
    area: 'Steppes',
    locale: 'dungeon',
    skills: {
      'combat': 3,
      'scouting': 1,
      'guile': 2,
    }
  },
  'Small Shrine': {
    area: 'Steppes',
    locale: 'urban',
    skills: {
      'divinity': 1,
      'labour': 4,
      'diplomacy': 2,
    }
  },
  'Mining Camp': {
    area: 'Steppes',
    locale: 'urban',
    skills: {
      'labour': 5,
    }
  },
  'Wide Tundra': {
    area: 'Steppes',
    locale: 'wilderness',
    skills: {
      'scouting': 2,
      'archery': 4,
    }
  },
  'Lightning Rock': {
    area: 'Steppes',
    locale: 'dungeon',
    locked: true,
    hint: 'Trained mages can find sources of magic that the common folk miss.',
    unlock: 'Retire a character with Black Magic skill higher than 15',
    check: function (self) {
      return self.graveyard.some(function (ret) {
        if (ret.skills.blackMagic > 15) {
          return true;
        }
      });
    },
    skills: {
      'blackMagic': 5,
      'archery': 4,
      'guile': 3,
    }
  }, 
  // start great plains
  'Trading Post': {
    area: 'Great Plains',
    locale: 'urban',
    skills: {
      'diplomacy': 1,
      'guile': 1,
      'herbalism': 1,
      'labour': 1,
      'archery': 1,
    }
  },
  'Rolling Hills': {
    area: 'Great Plains',
    locale: 'wilderness',
    skills: {
      'labour': 3,
      'scouting': 1,
    }
  },
  'Savannah': {
    area: 'Great Plains',
    locale: 'wilderness',
    skills: {
      'scouting': 2,
      'archery': 3,
    }
  },
  'Obelisk': {
    area: 'Great Plains',
    locale: 'wilderness',
    skills: {
      'divinity': 1,
      'blackMagic': 4,
    }
  },
  'Abandoned Caves': {
    area: 'Great Plains',
    locale: 'dungeon',
    skills: {
      'combat': 4,
      'herbalism': 1,
      'scouting': 2,
    }
  },
  'Ancient Ruins': {
    area: 'Great Plains',
    locale: 'dungeon',

    skills: {
      'whiteMagic': 10,
      'blackMagic': 5,
      'combat': 10,
    }
  },
  'Barbarian Camp': {
    area: 'Great Plains',
    locale: 'urban',
    locked: true,
    hint: 'The barbarian horde roams ceaselessly across the plains, but are difficult to find; trespass in their lands and eventually find you.',
    unlock: 'Complete Over 100 quests in the Great Plains Area',
    check: function (self) {
      return (self.stats.areas['Great Plains'].completions > 100);
    },
    skills: {
      'diplomacy': 4,
      'guile': 1,
      'combat': 3,
    }
  },
  'World Tree': {
    area: 'Great Plains',
    locale: 'wilderness',
    locked: true,
    hint: 'The world tree is a symbol and sanctuary of all races, creeds and religions. All spirits reside there in time.',
    unlock: 'Retire at least 10 characters to the Hall of Heroes',
    check: function (self) {
      return (self.graveyard.length > 9);
    },
    skills: {
      'blackMagic': 3,
      'divinity': 4,
      'herbalism': 1,
      'whiteMagic': 2,
      'diplomacy': 3,
    }
  },
  // start city
  'Guild Hall': {
    area: 'City',
    locale: 'urban',

    skills: {
      'guile': 1,
      'diplomacy': 1,
      'labour': 4,
    }
  },
  'Marketplace': {
    area: 'City',
    locale: 'urban',

    skills: {
      'guile': 2,
      'diplomacy': 2,
      'herbalism': 1,
    }
  },
  'Docks': {
    area: 'City',
    locale: 'urban',
    skills: {
      'guile': 5,
      'labour': 4,
      'combat': 1,
    }
  },
  'Temple Quarter': {
    area: 'City',
    locale: 'urban',
    locked: true,
    hint: 'You must prove your divinity before being allowed free passage through the temple district.',
    unlock: 'Either have or  a character with at least level 20 in divinity',
    check: function (self) {
      if (self.player.skills.divinity > 20) {
        return true;
      } else {
        return self.graveyard.some(function (ret) {
          if (ret.skills.divinity > 20) {
            return true;
          }
        });
      }

    },
    skills: {
      'divinity': 5,
      'diplomacy': 3,
    }
  },
  'Sewers': {
    area: 'City',
    locale: 'dungeon',
    locked: true,
    hint: 'The sewers beneath the city contain endless tunnels full of hidden secrets, drawing cuthroats and adventurers in equal measure.',
    unlock: 'Retire an Adventurer or Thief character to the Hall of Heroes',
    check: function (self) {
      return self.graveyard.some(function (ret) {
        if (ret.job == 'adventurer' || ret.job == 'thief') {
          return true;
        }
      });
    },
    skills: {
      'scouting': 4,
      'whiteMagic': 3,
      'herbalism': 1,
      'combat': 2,
    }
  },
  // start mountains
  'High Pass': {
    area: 'Mountains',
    locale: 'wilderness',
    skills: {
      'labour': 4,
      'scouting': 4,
    }
  },
  'Monastery': {
    area: 'Mountains',
    locale: 'wilderness',
    skills: {
      'divinity': 4,
      'whiteMagic': 2,
      'blackMagic': 2,
    }
  },
  'Orc Camp': {
    area: 'Mountains',
    locale: 'urban',
    skills: {
      'combat': 5,
      'diplomacy': 2,
      'archery': 2,
    }
  },
  'Spider Tunnels': {
    area: 'Mountains',
    locale: 'dungeon',

    skills: {
      'scouting': 40,
      'herbalism': 40,
      'blackMagic': 15,
    }
  },
  'Hidden Dwaven Enclave': {
    area: 'Mountains',
    locale: 'urban',
    locked: true,
    hint: 'The deep dwarves are untrustworthy of strangers, but respect great warriors. Prove yourself against their enemies, and the mead shall flow',
    unlock: 'Complete over 20 quests in the Orc Camp',
    check: function (self) {
      return (self.stats.zones['Orc Camp'].completions > 20);
    },
    skills: {
      'diplomacy': 5,
      'combat': 4,
      'guile': 3,
      'labour': 1,
    }
  },
  'Frozen Temple': {
    area: 'Mountains',
    locale: 'wilderness',
    skills: {
      'archery': 4,
      'blackMagic': 3,
      'divinity': 1,
    }
  },
  // start desert
  'Walled Camp': {
    area: 'Desert',
    locale: 'urban',
    skills: {
      'guile': 3,
      'diplomacy': 2,
      'whiteMagic': 1,
    }
  },
  'Endless Sands': {
    area: 'Desert',
    locale: 'wilderness',
    skills: {
      'scouting': 5,
      'whiteMagic': 1,
      'herbalism': 2,
      'archery': 2,
    }
  },
  'Sandworm Lair': {
    area: 'Desert',
    locale: 'dungeon',
    skills: {
      'combat': 4,
      'archery': 5,
    }
  },
  'Oasis': {
    area: 'Desert',
    locale: 'wilderness',
    skills: {
      'herbalism': 4,
      'diplomacy': 2,
    }
  },
  'Ziggurat': {
    area: 'Desert',
    locale: 'dungeon',
    skills: {
      'blackMagic': 1,
      'scouting': 3,
    }
  },
  'Mirage Palace': {
    area: 'Desert',
    locale: 'dungeon',
    locked: true,
    hint: 'Wander the desert long enough and the Mirage Palace will present itself',
    unlock: 'Each time you complete a quest in the desert are, there is a 5% chance to unlock the Follow the Mirage quest ',
    check: function (self) {
      self.bought.includes('Follow the Mirage');
    },
    skills: {
      'blackMagic': 80,
      'guile': 50,
      'divinity': 40,
    }
  },
  'Border Keep': {
    area: 'Wildlands',
    locale: 'urban',
    skills: {
      'whiteMagic': 1,
      'blackMagic': 4,
      'scouting': 2,
    }
  },
  'Blasted Wasteland': {
    area: 'Wildlands',
    locale: 'wilderness',
    skills: {
      'combat': 3,
      'archery': 5,
      'scouting': 1,
    }
  },
  'Whistling Ravine': {
    area: 'Wildlands',
    locale: 'wilderness',
    skills: {
      'archery': 1,
      'labour': 4,
    }
  },
  'Wretched Forest': {
    area: 'Wildlands',
    locale: 'wilderness',
    skills: {
      'herbalism': 4,
      'diplomacy': 1,
      'guile': 5,
    }
  },
  'Cursed Battlefeild': {
    area: 'Wildlands',
    locale: 'wilderness',
    skills: {
      'combat': 1,
      'divinity': 5,
      'whiteMagic': 4,
    }
  },
  'Obsidian Fields': {
    area: 'Wildlands',
    locale: 'wilderness',
    skills: {
      'labour': 2,
      'guile': 2,
      'whiteMagic': 3,
    }
  },
  'The Hole': {
    area: 'Wildlands',
    locale: 'dungeon',
    skills: {
      'combat': 5,
      'scouting': 4,
      'whiteMagic': 3,
      'guile': 2,
      'labour': 1,
    }
  }


};
// sprinkle the default values for all the zones in here so we don't have to have them above.
Object.keys(zones).map(function (key, index) {
  if (!('unlocked' in zones[key])) {
    zones[key].unlocked = true
  }
  if (!('area' in zones[key])) {
    zones[key].area = 'none'
  }
  if (!('skills' in zones[key])) {
    zones[key].skills = {}
  }
  zones[key].level = 1;
  zones[key].completeCount = 1;
  zones[key].progress = 0;
  zones[key].current = 0;
  zones[key].max = 5;
  // container for the totalled mltiplier of the skill. Effects progress
  zones[key].multis = {};
  // container for rate of progress, used in calculatiosn and shown on frontend
  zones[key].rates = {};
});


export default zones;
