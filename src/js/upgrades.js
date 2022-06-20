var upgrades = {
  'Wanderlust': {
    description: "Enable the option to move on to other areas once the average difficulty is less than 50%",
    type: "general",
    persistent: true,
    cost: 10,
    unlocked: false,
    effect: function (self) {
      self.config.wanderlust = true;
    }
  },
  'Follow the Mirage': {
    description: "Unlock the Mirage Palace zone.",
    type: "general",
    persistent: true,
    cost: 1,
    unlocked: false,
    check: function (self) {
      return (self.player.area == 'desert' && Math.Random() > 0.95);
    },
  },
  'Reincarnator': {
    description: "Permanently apply the Ancestral Spirit perk to your character",
    type: "perk",
    persistent: false,
    cost: 1,
    unlocked: true,
    effect: function (self) {
      self.setPerk('Ancestral Spirit');
    }
  },
}

// generate unlocks for all perks with a set cost.
Object.keys(perks).map(function (key, index) {
  if ('cost' in perks[key] && perks[key].cost > 0) {
    baseUpgrades[key] = {
      description: "Permanently apply the " + key + " perk to your character",
      type: "perk",
      persistent: false,
      cost: perks[key].cost,
      unlocked: false,
      check: function (self) {
        return self.graveyard.some(function (element, index, array) {
          if (element.job in self.jobs) {
            var perks = self.jobs[element.job].perks
            return perks.includes(key);
          }
        });
      },
      effect: function (self) {
        self.setPerk(key);
      }
    }
  }
});

export default upgrades;