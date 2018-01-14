var defaultZones = {
  'Inn': {
    area: 'Village',
    type: 'urban',
    unlocked: true,
    skills: {
      'labour': 1
    }
  },
  'Wheat Fields': {
    area: 'Village',
    type: 'urban',
    unlocked: true,
    skills: {
      'labour': 1,
      'herbalism': 3,
    }
  },
  'Nearby Woods': {
    area: 'Village',
    type: 'wilderness',
    unlocked: true,
    skills: {
      'combat': 3,
      'scouting': 1,
    }
  },
  'Town Square': {
    area: 'Village',
    type: 'urban',
    unlocked: true,
    skills: {
      'diplomacy': 1,
      'guile': 2,
    }
  },
  'Small Shrine': {
    area: 'Village',
    type: 'urban',
    unlocked: true,
    skills: {
      'divinity': 1,
      'labour': 5,
    }
  },
  'Druid Grove': {
    area: 'Village',
    type: 'wilderness',
    unlocked: false,
    hint: 'The druids keep the location of their home a close secret.',
    check: function(self) {
      return self.jobs.druid.unlocked;
    },
    skills: {
      'whiteMagic': 3,
      'herbalism': 3,
      'diplomacy': 3,
    }
  },
  'Lightning Rock': {
    area: 'Village',
    type: 'dungeon',
    unlocked: false,
    hint: 'Trained mages can find sources of magic that the common folk miss.',
    unlock: 'Retire a character with Black Magic skill higher than 15',
    check: function(self) {
      return self.graveyard.some(function(ret) {
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
  'Main Road': {
    area: 'Great Plains',
    type: 'urban',
    unlocked: true,
    skills: {
      'labour': 3,
      'scouting': 8,
    }
  },
  'Savannah': {
    area: 'Great Plains',
    type: 'wilderness',
    unlocked: true,
    skills: {
      'scouting': 5,
      'archery': 7,
    }
  },
  'Abandoned Caves': {
    area: 'Great Plains',
    type: 'dungeon',
    unlocked: true,
    skills: {
      'combat': 5,
      'herbalism': 10,
    }
  },
  'Ancient Ruins': {
    area: 'Great Plains',
    type: 'dungeon',
    unlocked: true,
    skills: {
      'whiteMagic': 10,
      'blackMagic': 5,
      'combat': 10,
    }
  },
  'Barbarian Camp': {
    area: 'Great Plains',
    type: 'urban',
    unlocked: false,
    hint: 'The barbarian horde roams ceaselessly across the plains, but are difficult to find; trespass in their lands and eventually find you.',
    unlock: 'Complete Over 100 quests in the Great Plains Area',
    check: function(self) {
      return (self.stats.areas['Great Plains'].completions > 100);
    },
    skills: {
      'diplomacy': 10,
      'guile': 15,
      'combat': 8,
    }
  },
  'World Tree': {
    area: 'Great Plains',
    type: 'wilderness',
    unlocked: false,
    hint: 'The world tree is a symbol and sanctuary of all races, creeds and religions. All spirits reside there in time.',
    unlock: 'Retire at least 10 characters to the Hall of Heroes',
    check: function(self) {
      return (self.graveyard.length > 9);
    },
    skills: {
      'blackMagic': 12,
      'divinity': 15,
      'herbalism': 7,
      'whiteMagic': 5,
      'diplomacy': 10,
    }
  },
  'Training Yard': {
    area: 'City',
    type: 'urban',
    unlocked: true,
    skills: {
      'combat': 10,
    }
  },
  'Marketplace': {
    area: 'City',
    type: 'urban',
    unlocked: true,
    skills: {
      'guile': 7,
      'diplomacy': 7,
      'herbalism': 5,
    }
  },
  'Docks': {
    area: 'City',
    type: 'urban',
    unlocked: true,
    skills: {
      'guile': 20,
      'labour': 10,
      'combat': 7,
    }
  },
  'Temple Quarter': {
    area: 'City',
    type: 'urban',
    unlocked: false,
    hint: 'You must prove your divinity before being allowed free passage through the temple district.',
    unlock: 'Either have or  a character with at least level 20 in divinity',
    check: function(self) {
      if (self.player.skills.divinity > 20) {
          return true;
      } else {
        return self.graveyard.some(function(ret) {
          if (ret.skills.divinity > 20) {
            return true;
          }
        });
      }

    },
    skills: {
      'divinity': 20,
      'diplomacy': 10,
    }
  },
  'Sewers': {
    area: 'City',
    type: 'dungeon',
    unlocked: false,
    hint: 'The sewers beneath the city contain endless tunnels full of hidden secrets, drawing cuthroats and adventurers in equal measure.',
    unlock: 'Retire an Adventurer or Thief character to the Hall of Heroes',
    check: function(self) {
      return self.graveyard.some(function(ret) {
        if (ret.job == 'adventurer' || ret.job == 'thief') {
          return true;
        }
      });
    },
    skills: {
      'scouting': 15,
      'whiteMagic': 15,
      'herbalism': 10,
      'combat': 20,
    }
  },
  'High Pass': {
    area: 'Mountains',
    type: 'wilderness',
    unlocked: true,
    skills: {
      'labour': 20,
      'scouting': 35,
    }
  },
  'Orc Camp': {
    area: 'Mountains',
    type: 'dungeon',
    unlocked: true,
    skills: {
      'combat': 45,
      'diplomacy': 20,
    }
  },
  'Spider Tunnels': {
    area: 'Mountains',
    type: 'dungeon',
    unlocked: true,
    skills: {
      'scouting': 40,
      'herbalism': 40,
      'blackMagic': 15,
    }
  },
  'Hidden City': {
    area: 'Mountains',
    type: 'urban',
    unlocked: false,
    hint: 'The deep dwarves are untrustworthy of strangers, but respect great warriors. Prove yourself against their enemies, and the mead shall flow',
    unlock: 'Complete over 20 quests in the Orc Camp',
    check: function(self) {
      return (self.stats.zones['Orc Camp'].completions > 20);
    },
    skills: {
      'combat': 40,
      'diplomacy': 25,
      'labour': 30,
      'guile': 25,
    }
  },
  'Frozen Temple': {
    area: 'Mountains',
    type: 'wilderness',
    unlocked: true,
    skills: {
      'blackMagic': 30,
      'whiteMagic': 30,
      'divinity': 50,
    }
  },
  'Walled Camp': {
    area: 'Desert',
    type: 'urban',
    unlocked: true,
    skills: {
      'diplomacy': 50,
      'guile': 70,
    }
  },
  'Endless Sands': {
    area: 'Desert',
    type: 'wilderness',
    unlocked: true,
    skills: {
      'scouting': 50,
      'whiteMagic': 50,
      'archery': 85,
    }
  },
  'Sandworm Lair': {
    area: 'Desert',
    type: 'dungeon',
    unlocked: true,
    skills: {
      'combat': 100,
      'archery': 35,
    }
  },
  'Oasis': {
    area: 'Desert',
    type: 'wilderness',
    unlocked: true,
    skills: {
      'herbalism': 90,
    }
  },
  'Mirage Palace': {
    area: 'Desert',
    type: 'dungeon',
    unlocked: false,
    hint: 'Wander the desert long enough and the Mirage Palace will present itself',
    unlock: 'Each time you complete a quest in the desert are, there is a 5% chance to unlock the Follow the Mirage quest ',
    check: function(self) {
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
    type: 'urban',
    unlocked: true,
    skills: {
      'whiteMagic': 45,
      'blackMagic': 45,
      'scouting': 100,
    }
  },
  'Blasted Wasteland': {
    area: 'Wildlands',
    type: 'wilderness',
    unlocked: true,
    skills: {
      'combat': 45,
      'archery': 100,
      'scouting': 30,
    }
  },
  'The Chasm': {
    area: 'Wildlands',
    type: 'wilderness',
    unlocked: true,
    skills: {
      'archery': 40,
      'labour': 75,
    }
  },
  'Cannibal Forest': {
    area: 'Wildlands',
    type: 'dungeon',
    unlocked: true,
    skills: {
      'herbalism': 45,
      'diplomacy': 45,
      'guile': 90,
    }
  },
  'Cursed Battlefeild': {
    area: 'Wildlands',
    type: 'dungeon',
    unlocked: true,
    skills: {
      'combat': 120,
      'divinity': 120,
      'whiteMagic': 45,
    }
  },


};
// sprinkle the default values for all the zones in here so we don't have to have them above.
Object.keys(defaultZones).map(function(key, index) {
  defaultZones[key].level = 1;  
  defaultZones[key].questCountdown = 0;  
  if (!('maxQuests' in defaultZones[key])) { defaultZones[key].maxQuests = 3; }
  if (!('questCountdownDefault' in defaultZones[key])) { defaultZones[key].questCountdownDefault = 15; }
  defaultZones[key].quests = defaultZones[key].maxQuests;  
  defaultZones[key].completeCount = 1;
  defaultZones[key].progress = 0;
  defaultZones[key].current = 0;
  defaultZones[key].max = 5;
  // container for the totalled mltiplier of the skill. Effects progress
  defaultZones[key].multis = {};
  // continer for the calculated difficulty based on zone level and player level. Effect exp
  defaultZones[key].difficulty = {};
  // container for rate of progress, used in calculatiosn and shown on frontend
  defaultZones[key].rates = {};
});

var zoneDescriptions = [];
// calculate the default areas for use later on
var defaultAreas = function() {
  var a = [];
  Object.keys(defaultZones).map(function(key, index) {
    if (!(a.includes(defaultZones[key].area))) {
      a.push(defaultZones[key].area)
    }
  });
  return a;
}