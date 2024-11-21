var jobs = {
  peasant: {
    name: "Peasant",
    description: "A humble villager with nothing but hopes and dreams",
    unlocked: true,
    aptitudes: {
      labour: 5,
      combat: 5 ,
      archery: 5,
      scouting: 5,
      whiteMagic: 5,
      blackMagic: 5,
      herbalism: 5,
      diplomacy: 5,
      guile: 5,
      divinity: 5,
    },
    perks: ['Chosen One']
  },
  farmer: {
    name: "Farmer",
    description: "The farmer works hard to support their family and community. When called upon, they will defend their land with spear and bow",
    unlocked: true,
    aptitudes: {
      labour: 15,
      combat: 10,
      archery: 10,
      scouting: 5,
      whiteMagic: 1,
      blackMagic: 1,
      herbalism: 5,
      diplomacy: 2,
      guile: 3,
      divinity: 2,
    },
    unlocked: false,
    unlock: "Retire at least 1 character to the Hall of Heroes",
    check: function (self) {
      return (self.graveyard.length > 0);
    },
    perks: ['Salt of the Earth']
  },
  woodsman: {
    name: "Woodsman",
    description: "A woodsman is the caretaker of their forest. They walk softly, guide the village in forestry and cull the forest herds from afar with handmade bows.",
    unlocked: true,
    aptitudes: {
      labour: 5,
      combat: 12,
      archery: 1,
      scouting: 10,
      whiteMagic: 10,
      blackMagic: 1,
      herbalism: 4,
      diplomacy: 2,
      guile: 2,
      divinity: 5,
    },
    unlocked: false,
    unlock: "Retire at least 1 character to the Hall of Heroes",
    check: function (self) {
      return (self.graveyard.length > 0);
    },
    perks: ['Forest Dweller']
  },
  student: {
    name: "Student",
    description: "The student has demonstrated a talent for books, numbers and magic. They rely on their wits and capacity to absorb knowledge to get by.",
    unlocked: true,
    aptitudes: {
      labour: 2,
      combat: 2,
      archery: 1,
      scouting: 2,
      whiteMagic: 10,
      blackMagic: 10,
      herbalism: 5,
      diplomacy: 10,
      guile: 2,
      divinity: 5,
    },
    unlocked: false,
    unlock: "Acheive an average max skill level of 10 across all skills",
    check: function (self) {
      var total = 0;
      Object.keys(self.stats.skills).map(function (skillname, i) {
        total += self.stats.skills[skillname];
      });
      return (total / Object.keys(self.stats.skills).length >= 10);
    },
    perks: ['Constant Learner']
  },
  grifter: {
    name: "Grifter",
    description: "A petty thief and conman that lives hand to mouth most days, with the occasional big score that is spent just as quickly as it came. They are the first target for anyone wanting to find infomration in the city; but only the right price.",
    aptitudes: {
      labour: 2,
      combat: 12,
      archery: 3,
      scouting: 10,
      whiteMagic: 7,
      blackMagic: 7,
      herbalism: 5,
      diplomacy: 10,
      guile: 15,
      divinity: 1,
    },
    unlocked: false,
    hint: "The grifter weasels their way into every whispered conversation, side job and scheme in the city. Everyone meets him after spending enough time in the city.",
    unlock: "Complete over 200 quests in in the City area.",
    check: function (self) {
      return (self.stats.areas.City.completions > 200);
    },
    perks: ['Good Connections']
  },
  fighter: {
    name: "Fighter",
    description: "Whether they fight for king, country or gold, there will always be those who think violence is the first and only solution to all of life's problems. ",
    aptitudes: {
      labour: 10,
      combat: 25,
      archery: 15,
      scouting: 10,
      whiteMagic: 1,
      blackMagic: 1,
      herbalism: 1,
      diplomacy: 1,
      guile: 1,
      divinity: 1,
    },
    unlocked: false,
    check: function (self) {
      var state = false;
      self.graveyard.forEach(function (ret) {
        if (ret.skills.combat >= 25) { state = true; }
      });
      return state;
    },
    hint: "Sometimes all you need in life is to be bigger and stronger than the other guy.",
    unlock: "Retire a character with a Combat level of 25 or above",
    perks: ['Jack Of All Trades']
  },
  witch: {
    name: "Witch",
    description: "A healer, herbalist and keeper of ancient magic, feared by men and revered by women. Witches answer to no-one and can be both a scourge and saviour to nearby villages.",
    aptitudes: {
      labour: 5,
      combat: 2,
      archery: 10,
      scouting: 5,
      whiteMagic: 15,
      blackMagic: 10,
      herbalism: 25,
      diplomacy: 5,
      guile: 20,
      divinity: 1,
    },
    unlocked: false,
    check: function (self) {
      var state = false;
      self.graveyard.forEach(function (ret) {
        if (ret.skills.herbalism >= 25) { state = true; }
      });
      return state;
    },
    hint: "While magic is powerful, it is rare and attracts deadly attention. A knowledge of nature and it's effects are always in need by the people.",
    unlock: "Retire a character with a Herbalism level of 25 or above",
    perks: ['Bubbling Cauldron']
  },
  druid: {
    name: "Druid",
    description: "Druids have their reputation for defending nature, but in truth they view all beings as equals. They ensure no plant or animal takes more than their share of nature's bountry, including mankind.",
    aptitudes: {
      labour: 7,
      combat: 7,
      archery: 7,
      scouting: 7,
      whiteMagic: 7,
      blackMagic: 7,
      herbalism: 7,
      diplomacy: 7,
      guile: 7,
      divinity: 7,
    },
    unlocked: false,
    check: function (self) {
      var state = false;
      self.graveyard.forEach(function (ret) {
        var highest = 0;
        var lowest = 999;
        Object.keys(ret.skills).map(function (key, i) {
          if (ret.skills[key] > highest) { highest = ret.skills[key] }
          if (ret.skills[key] < lowest) { lowest = ret.skills[key] }
        });
        if ((highest - lowest) < 5) {
          return true;
        }
      });
      return state;
    },
    hint: "Druids are neutral, seeking only balance, and favour no skill over another.",
    unlock: "Retire a character with no skills more than five levels difference from another.",
    perks: ['Bear Strength', 'Hawk Vision', 'Owl Wisdom']
  },
  adventurer: {
    name: "Adventurer",
    description: "An experienced wanderer and jack-of-all-trades seeking fame, fortune and glory. Will take any job for the right price and the chance to be enscribed in history's pages.",
    aptitudes: {
      labour: 5,
      combat: 10,
      archery: 7,
      scouting: 5,
      whiteMagic: 5,
      blackMagic: 10,
      herbalism: 7,
      diplomacy: 8,
      guile: 10,
      divinity: 5,
    },
    unlocked: false,
    check: function (self) {
      var count = 0;
      var state = false;
      self.graveyard.forEach(function (ret) {
        if (['peasant', 'woodsman', 'student', 'farmer'].indexOf(ret.job) >= 0) { count++ }
        if (count >= 3) { state = true; }
      });
      return state;
    },
    hint: "Adventure calls and some will always answer, from the feilds, village and woods.",
    unlock: "Retire three characters with one of the starting jobs (Peasant, Woodsman, Student or Farmer) to the Hall of Heroes",
    perks: ['Dungeon Diver', 'Blaze of Glory']
  },
  thief: {
    name: "Thief",
    description: "People steal for many reasons; wealth, fame, love, or sometimes just to feed their family. Most lose a hand or eye in short order, but for some talented individuals, nothing is truly nailed down.",
    aptitudes: {
      labour: 1,
      combat: 7,
      archery: 15,
      scouting: 20,
      whiteMagic: 7,
      blackMagic: 3,
      herbalism: 10,
      diplomacy: 10,
      guile: 20,
      divinity: 5,
    },
    unlocked: false,
    hint: "The theif must be competent in all aspects, patiently watching for opportubnity, slipping unseen through the shadows, and prepared to fight from near or far if needed.",
    unlock: "Retire a character with at least 10 in scouting, guile, combat and archery",
    check: function (self) {
      var state = false;
      self.graveyard.forEach(function (ret) {
        if ((ret.skills.scouting > 10) &&
          (ret.skills.guile > 10) &&
          (ret.skills.combat > 10) &&
          (ret.skills.archery > 10)
        ) { state = true; }
      });
      return state;
    },
    perks: ['Lost in the Crowd', 'Wanted']
  },
  pirate: {
    name: "Pirate",
    description: "An opportunistic cutthroat that loves mothing more than drinking, fighting and gambling, ideally all at once.",
    aptitudes: {
      labour: 10,
      combat: 10,
      archery: 3,
      scouting: 10,
      whiteMagic: 5,
      blackMagic: 5,
      herbalism: 5,
      diplomacy: 10,
      guile: 25,
      divinity: 3,
    },
    unlocked: false,
    check: function (self) {
      return (self.stats.zones.Docks.completions > 300);
    },
    hint: "All sailors eventually come to port, rarely straying further than the tavern nearest their ship.",
    unlock: "Finish over 300 quests in the Docks area",
    perks: ['Swashbuckler', 'Pillager']
  },
  warlock: {
    name: "Warlock",
    description: "In moments of desperation, men can be tempted to make pacts with the underworld in exchange for great power. The price is high, and the underworld always collects it's debts.",
    aptitudes: {
      labour: 1,
      combat: 1,
      archery: 0.5,
      scouting: 1,
      whiteMagic: 0,
      blackMagic: 1,
      herbalism: 1,
      diplomacy: 1,
      guile: 3,
      divinity: 0,
    },
    unlocked: false,
    check: function (self) {
      return self.bought.includes('Deal with the Devil');
    },
    hint: "The demons are always waiting for those desperate enough to ask for their help.",
    unlock: "Do a deal with the devil",
    perks: ['Infernal Blood', 'Latent Power']
  },
  ranger: {
    name: "Ranger",
    description: "A ranger is an expert scout and hardened traveler, ranging far and wide, helping where needed, seeing more than most.",
    aptitudes: {
      labour: 2,
      combat: 1,
      archery: 2,
      scouting: 3,
      whiteMagic: 1,
      blackMagic: 1,
      herbalism: 2,
      diplomacy: 1,
      guile: 1,
      divinity: 0.2,
    },
    unlocked: false,
    check: function (self) {
      var state = false
      self.graveyard.forEach(function (ret) {
        if (ret.skills.scouting > 30) {
          var total = 0;
          Object.keys(ret.skills).map(function (skillname, i) {
            total += ret.skills[skillname];
          });
          if (total / Object.keys(ret.skills).length > 15) {
            state = true;
          }
        }
      });
      return state;
    },
    hint: "With a talent for observation one can complete any task, and be proficent in all skills",
    unlock: "Retire a character with a Scouting skill above 30 and an average skill level higher than 15",
    perks: ['Effective Scout']
  },
  sniper: {
    name: "Sniper",
    description: "A sniper is a deadly scout and marksman, trained to hunt men across worlds. If ever you are unfortunate enough to encounter one, you were not their intended target.",
    aptitudes: {
      labour: 1,
      combat: 0.5,
      archery: 5,
      scouting: 2,
      whiteMagic: 0.5,
      blackMagic: 0.5,
      herbalism: 0.5,
      diplomacy: 0.5,
      guile: 3,
      divinity: 0.5,
    },
    unlocked: false,
    check: function (self) {
      var state = false;
      self.graveyard.forEach(function (ret) {
        if (ret.skills.archery >= 40) { state = true; }
      });
      return state;
    },
    hint: "The bow is a formidable weapon at the best of times, but for some it becomes and extension of their will; a means to reach across great distances and command another to die.",
    unlock: "Retire any character with an Archery level of 40 or above",
    perks: ['Expert Marksman']
  },
  priest: {
    name: "Priest",
    description: "A community leader who shuns violence, resolves conflicts through diplomacy and works to increase the infuence of the church.",
    aptitudes: {
      labour: 0.5,
      combat: 0.1,
      archery: 0.5,
      scouting: 1,
      whiteMagic: 2,
      blackMagic: 0,
      herbalism: 1,
      diplomacy: 3,
      guile: 3,
      divinity: 3,
    },
    unlocked: false,
    check: function (self) {
      if (self.player.level >= 10) {
        var pacifist = true;
        return self.graveyard.forEach(function (ret) {
          if (self.player.skills.blackMagic === 0) { return true; }
        });
      }
      return false;
    },
    hint: "The church abhors the power of black magic, for the damage it can do, and political influence of those who weild it. Only the church should have the ear of the king.",
    unlock: "Retire a character without training in Black Magic",
    perks: ['Diplomat', 'Dogmatic']
  },
  monk: {
    name: "Monk",
    description: "",
    aptitudes: {
      labour: 4,
      combat: 0,
      archery: 0,
      scouting: 1,
      whiteMagic: 2,
      blackMagic: 0,
      herbalism: 1,
      diplomacy: 2,
      guile: 3,
      divinity: 5,
    },
    unlocked: false,
    check: function (self) {
      if (self.player.level >= 10) {
        var pacifist = true;
        return self.graveyard.forEach(function (ret) {
          if (self.player.skills.combat === 0 && self.player.skills.archery === 0 && self.player.skills.blackMagic === 0) { return true; }
        });
      }
      return false;
    },
    hint: "Violence is never the answer, the only the absence of one.",
    unlock: "Reach level 10 with any character without training any combat skill (ie. Combat, Archery, Black Magic)",
    perks: ['Pacifist']
  },
  cleric: {
    name: "Cleric",
    description: "Clerics are dedicated healers, mending wounds and tending to the ill. They serve the people above their church or king, lending their hands, sword or advice where it is needed",
    aptitudes: {
      labour: 2,
      combat: 1.5,
      archery: 1,
      scouting: 0.5,
      whiteMagic: 5,
      blackMagic: 0,
      herbalism: 3,
      diplomacy: 1.5,
      guile: 1.5,
      divinity: 2,
    },
    unlocked: false,
    check: function (self) {
      var count = 0;
      var state = false
      Object.keys(self.stats.zones).map(function (zonename, i) {
        if (self.stats.zones[zonename].currentCompletions > 0) { count++; }
        if (count => 15) { state = false; }
      });
      return state;
    },
    hint: "Kings and gods come and go but the people remain, in every village, city and feild, always carrying on.",
    unlock: "Complete a quest in over 15 zones with a single character",
    perks: ['Servant of the People']
  },
  paladin: {
    name: "Paladin",
    description: "The paladin walks openly in heavy armour, healing the sick, defending the weak and fighting evil wherever it lies. They dispense justice to all men, from the lowest peasant to lords and kings.",
    aptitudes: {
      labour: 5,
      combat: 10,
      archery: 5,
      scouting: 2,
      whiteMagic: 15,
      blackMagic: 2,
      herbalism: 5,
      diplomacy: 15,
      guile: 0,
      divinity: 25,
    },
    unlocked: false,
    check: function (self) {
      var state = false
      self.graveyard.forEach(function (ret) {
        if (ret.skills.combat >= 20 && ret.skills.divinity >= 20) { state = true; }
      });
      return state;
    },
    hint: "Justice answers to no man; it is sent from on high, and dispensed by the sword.",
    unlock: "Retire a character with at least level 20 skill in combat and divinity",
    perks: ['Righteous Fury']
  },
}
// sprinkle the default values in here so we don't have to have them above.
Object.keys(jobs).map(function (key, index) {
  // assign the current aptitudes to defaults so we have a point of reference in multiplier calculations
  jobs[key].defaultAptitudes = {};
  Object.assign(jobs[key].defaultAptitudes, jobs[key].aptitudes);
  jobs[key].multis = {};
  jobs[key].powerLevel = Object.values(jobs[key].defaultAptitudes).reduce(function (a, b) { return a + b; }, 0);
});

export default jobs




/* 

  goblin: {
    name: "Goblin",
    description: "A feral race warped by ancient magic and centuries of inbreeding, Goblins lead poor, short lives that often end at the hands of questing adventurers. Every once in a while, though, a goblin lives long enough to fulfil their true potential...",
    aptitudes: {
      labour: 0.5,
      combat: 0.5,
      archery: 0.5,
      scouting: 0.5,
      whiteMagic: 0.5,
      blackMagic: 0.5,
      herbalism: 0.5,
      diplomacy: 0.5,
      guile: 0.5,
      divinity: 0.5,
    },
    perks: ['Despite a cursed life...', 'Some survive the odds...'],
    unlocked: false,
    check: function (self) {
      var total = 0;
      Object.keys(self.zones).map(function (zonename, i) {
        if (self.zones.type == 'dungeon' && zonename in self.stats.zones) {
          total += self.stats.zones[zonename].completions;
        }
      });
      return (total > 300);
    },
    hint: "Goblins avoid  humans at all costs, gravitating towards dark caves and  abandoned castles in an effort to scrape together an existence. Unfortunately these locations also draw adventurers and do-gooders looking for loot and amusement, justifying their genocide in the name of 'clearing dungeons'.",
    unlock: "Complete over 300 quests in dungeon zones.",
  },

*/