import perks from './perks'

var upgrades = {
  'Follow the Mirage': {
    description: "Unlock the Mirage Palace zone.",
    type: "general",
    persistent: true,
    cost: 1,
    unlocked: false,
    check: function (self) {
      return (self.player.area == 'desert' && Math.Random() > 0.99);
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
    upgrades[key] = {
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