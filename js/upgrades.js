var defaultUpgrades = {
  'Wanderlust': {
    description: "Enable the option to move on to other areas once the average difficulty is less than 50%",
    type: "general",
    persistent: true,
    cost: 10,
    unlocked: false,
    effect: function(self) {
     self.config.wanderlust = true;
    }
  },
  'Deal with the Devil': {
    description: "Add a level 50 Demon in your Hall of Heroes, immediately gaining prestige currency. But be warned... the power of the seven hells comes at a price.",
    type: "quest",
    persistent: true,
    cost: 1,
    unlocked: false,
    hint: "",
    check: function(self) {
      return (self.graveyard.length > 10);
    },
    effect: function(self) {
      return false;
      if (self.graveyard.some(function(ret){return (ret.name === 'Soggoth The All Consuming')})) { return; }
      var newRet = {
        name: 'Soggoth The All Consuming',
        level: 50,
        skills: {},
        zone: 'hell',
        job: 'demon',
      };
      Object.keys(self.player.skills).map(function(skillname, i) {
        newRet.skills[skillname] = 0;
      });
      self.graveyard.push(newRet);
      self.calculatePrestige();
    }
  },
  'Follow the Mirage' : {
    description: "Unlock the Mirage Palace zone.",
    type: "general",
    persistent: true,
    cost: 1,
    unlocked: false,
    check: function(self) {
      return (self.player.area == 'desert' && Math.Random() > 0.95);
    },
  },
  'Reincarnator': {
    description: "Permanently apply the Ancestral Spirit perk to your character",
    type: "perk",
    persistent: false,
    cost: 1,
    unlocked: true,
    effect: function(self) {
      self.setPerk('Ancestral Spirit');
    }
  },
}

// generate unlocks for all perks with a set cost.
Object.keys(defaultPerks).map(function(key, index) {
  if ('cost' in defaultPerks[key] && defaultPerks[key].cost > 0) {
    defaultUpgrades[key] = {
      description: "Permanently apply the " + key + " perk to your character",
      type: "perk",
      persistent: false,
      cost: defaultPerks[key].cost,
      unlocked: false,
      check: function(self) {
        return self.graveyard.some(function(element, index, array){
          if (element.job in self.jobs) {
            var perks = self.jobs[element.job].perks
            return perks.includes(key);
          }
        });
      },
      effect: function(self) {
        self.setPerk(key);
      }
    }
  }
});