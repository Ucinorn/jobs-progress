var defaultPerks = {
   'Ancestral Spirit': {
     description: "The knowledge of ancient heroes guides you. Increases all your aptitudes by 0.5% for every prestige point you have unspent.",
     check: function(self) {
       if (self.prestige.current > 0) {
         self.multis['Ancestral Spirit'] = {type: 'apt', skill: 'all', val: Number((self.prestige.current * 0.005).toFixed(3))};
       } else {
         delete self.multis['Ancestral Spirit'];
       }
     },
   },
   'Chosen One': {
     description: "You are destined for greatness. All aptitudes are increased by 100% while adventuring in the starting area.",
     cost: 10,
     check: function(self) {
        if (self.player.currentZone.area == 'Village') {
          self.multis['Chosen One'] = {type: 'apt', skill: 'all', val: 1};
        } else {
          delete self.multis['Chosen One'];
        }
     }
   },
   'Constant Learner': {
     description: "Always increase the aptitude of your lowest level skill by 200%.",
     cost: 20,
     check: function(self) {
        var lowest = 'combat';
        Object.keys(self.player.skills).map(function(skill, i) {
          if (self.player.skills[skill].level > 0 && self.player.skills[skill].level < self.player.skills[lowest].level) {
            lowest = skill;
          }  
        });
        self.multis['Constant Learner'] = {type: 'apt', skill: lowest, val: 2};
     }
   },
   'Masochist': {
     description: "Completing quests in zones with skill levels higher than your character's grants even more EXP.",
     cost: 5,
     check: function(self) {
        var state = Object.keys(self.player.currentZone.skills).some(function(skill, i) {
          return (self.player.currentZone.skills[skill] < self.player.skills[skill]);
        });
        if (state) {
          self.multis.Masochistic = {type: 'exp', skill: 'all', val: 1};
        } else {
          delete self.multis.Masochistic;
        }
     }
   },
   'Specialist': {
     description: "Grants 50% more progress if the current zone has only one skill type.",
     cost: 5,
     check: function(self) {
        var keys = Object.keys(self.currentZone.skills);
        if (keys.length == 1) {
          self.multis.Specialist = {type: 'progress', skill: keys[0], val: 0.5};
        } else {
          delete self.multis.Specialist;
        }
     }
   },
   'Jack of All Trades': {
     description: "If the current zone has more than 2 skill types, increase EXP gain for all skills by 50% ",
     cost: 5,
     check: function(self) {
        if (Object.keys(self.currentZone.skills).length > 2) {
          self.multis.Specialist = {type: 'exp', skill: 'all', val: 0.5};
        } else {
          delete self.multis.Specialist;
        }
     }
   },
   'Salt of the Earth': {
     description: "Questing in zones that include a Labour component applies a temporary 50% boost to all progress.",
     cost: 10,
     check: function(self) {
       var hasLabour = false;
       Object.keys(self.player.currentZone.skills).map(function(skillname, i) {
         if (skillname == 'labour') {
           hasLabour = true;
         }
       });
       if (hasLabour)  {
        var time = new Date().getTime() + 60000;
        self.multis['Salt of the Earth'] = {type: 'progress', skill: 'all', val: 0.5, expiry: time};
       }
     }
   },
   'Forest Dweller': {
     description: "Gain EXP 50% faster when questing in the wilderness",
     cost: 10,
     check: function(self) {
       if (self.player.currentZone.type == 'wilderness') {
          self.multis['Forest Dweller'] = {type: 'exp', skill: 'all', val: 0.5};
       } else {
          delete self.multis['Forest Dweller'];
       }
     }
   },
   'Bubbling Cauldron': {
     description: "5% chance with each quest completion to craft and drink a random potion, granting boosts to your stats.",
     cost: 25,
     onQuestComplete: function(self) {
       // 5% chance of crafting
        if (Math.random() < 0.95) {return;}
        var types = ['progress','exp','apt'];
        var type = types[Math.floor(Math.random() * types.length)];
        var skill = Object.keys(self.player.skills)[Math.floor(Math.random() * Object.keys(self.player.skills).length)];
        var val = Math.ceil(5 * Math.random());
        var potion = type + ' potion of ' + skill + ' +' + val;
        self.message('Crafted a ' + potion)
        self.multis[potion] = {type: type, skill: skill, val: val, expiry: (new Date().getTime() + 60000)};
     }
   },
   'Dungeon Diver': {
     description: "Gain additional 100% more EXP in dungeon zones.",
     cost: 10,
     check: function(self) {
       if (self.player.currentZone.type == 'dungeon') {
          self.multis['Dungeon Diver'] = {type: 'exp', skill: 'all', val: 1};
       } else {
          delete self.multis['Dungeon Diver'];
       }
     }
   },
   'Blaze of Glory': {
     description: "You are destined to perish in an epic fashion, etched forever in the pages of history. You have a small chance to 'retire' painfully when completing dungeon quests, and are recorded at double your level in the Hall of Heroes, receiving double the prestige currency.",
     onQuestComplete: function(self) {
      if (self.player.currentZone.type == 'dungeon' && self.prestige.next > 0) {
          if (Math.random() > 0.99) {
            self.player.level = Math.round(self.player.level * 2);
            self.message('You died fighting an epic battle to save the world... you think. Your greatly inflated deeds are etched in the Hall of Heroes.', 'modal', true)
            self.reset('adventurer');
          }
      }
     }
   },
   'Lost in the Crowd': {
     description: "Your skills truly shine in the crowded alleyways of the city. Your combat, guile and scouting aptitude is increase in urban zones.",
     cost: 10,
     check: function(self) {
       if (self.player.currentZone.type == 'urban') {
          self.multis['Lost in the Crowd guile'] = {type: 'apt', skill: 'guile', val: 1};
          self.multis['Lost in the Crowd combat'] = {type: 'apt', skill: 'combat', val: 0.5};
          self.multis['Lost in the Crowd scouting'] = {type: 'apt', skill: 'scouting', val: 1};
       } else {
          delete self.multis['Lost in the Crowd guile'];
          delete self.multis['Lost in the Crowd combat'];
          delete self.multis['Lost in the Crowd scouting'];
       }
     }
   },
   'Wanted': {
     description: "Your renown grows with every heist. Your EXP multiplier grows with every level, with every level up there is a chance to be caught and tried, written to the Hall of Heroes as an criminal mastermind",
     onQuestComplete: function(self) {
      var chance = Number((self.player.level * 0.05).toFixed(2))
      self.multis.Wanted = {type: 'exp', skill: 'all', val: chance};
      if (self.player.currentZone.type == 'urban' && self.prestige.next > 0) {
          if ((Math.random() * 100) < chance) {
            self.message('Caught!', 'modal', true)
            self.reset('thief');
          }
      }
     }
   },
   'Expert Marksman': {
     description: "Zones that include an Archery component progress four times faster.",
     cost: 30,
     check: function(self) {
       var hasArchery = false;
       Object.keys(self.player.currentZone.skills).map(function(skillname, i) {
         if (skillname == 'archery') {
           hasArchery = true;
         }
       });
       if (hasArchery)  {
        self.multis['Expert Marksman'] = {type: 'progress', skill: 'all', val: 3};
       } else {
        delete self.multis['Expert Marksman'];
       }
     }
   },
   'Effective Scout': {
     description: "Your aptitude for skills increases by 50% in zones with a scouting component.",
     cost: 10,
     check: function(self) {
      var hasScouting = false;
      Object.keys(self.player.currentZone.skills).map(function(skillname, i) {
         if (skillname == 'scouting') {
           hasScouting = true;
         }
      });
      Object.keys(self.player.currentZone.skills).map(function(skillname, i) {
         var multiname = 'Scouting: ' + skillname;
         if (skillname != 'scouting' && hasScouting) {
           self.multis[multiname] = {type: 'apt', skill: skillname, val: 0.5};
         } else {
            delete self.multis[multiname];
         }
       });
     }
   },
   'Pacifist': {
     description: "Completing quests in non-combat zones rewards 100% more EXP.",
     cost: 10,
     check: function(self) {
       var pacifist = true;
       Object.keys(self.player.currentZone.skills).map(function(skillname, i) {
         if (skillname == 'combat' || skillname == 'archery' || skillname == 'blackMagic') {
           pacifist = false;
         }
       });
       if (pacifist)  {
        self.multis.Pacifist = {type: 'exp', skill: 'all', val: 1};
       } else {
        delete self.multis.Pacifist;
       }
     }
   },
   'Diplomat': {
     description: "Progress in zones with a Diplomacy element is increased by 200%.",
     cost: 15,
     check: function(self) {
        var hasSkill = false;
        Object.keys(self.player.currentZone.skills).map(function(skillname, i) {
          if (skillname == 'diplomacy') {
            hasSkill = true;
          }
        });
        if (hasSkill) {
          self.multis.Diplomat = {type: 'progress', skill: 'all', val: 2};
        } else {
          delete self.multis.Diplomat;
        }
     }
   },
   'Dogmatic': {
     description: "You cannot resist the urge to foil the work of the sorcerer's guild, no matter the task at hand. Progress in zones with a Black Magic component progress slower, but your guile and diplomacy aptitude is boosted. ",
     check: function(self) {
        var hasSkill = false;
        Object.keys(self.player.currentZone.skills).map(function(skillname, i) {
          if (skillname == 'blackMagic') {
            hasSkill = true;
          }
        });
        if (hasSkill) {
          self.multis['Dogmatic Pursuit'] = {type: 'progress', skill: 'all', val: -1};
          self.multis['Dogmatic Surveillance'] = {type: 'apt', skill: 'guile', val: 3};
          self.multis['Dogmatic Interference'] = {type: 'apt', skill: 'diplomacy', val: 3};
        } else {
          delete self.multis['Dogmatic Fervour'];
          delete self.multis['Dogmatic Surveillance'];
          delete self.multis['Dogmatic Interference'];
        }
     }
   },
   'Good Connections': {
     description: "When completing quests in the City, your aptitudes are raised.",
     cost: 10,
     check: function(self) {
      if (self.player.currentZone.area == 'City') {
          self.multis['Good Connections'] = {type: 'apt', skill: 'all', val: 1};
      } else {
          delete self.multis['Good Connections'] 
      }
     }
   },
   'Servant of the People': {
     description: "Gain a small amount of EXP towards a random skill when you complete a quest in an urban zone",
     cost: 10,
     onQuestComplete: function(self, zone) {
        if (zone in self.zones && self.zones[zone].type == 'urban') {
          var skillArray = Object.keys(self.player.skills);
          var key = skillArray[Math.floor(Math.random() * skillArray.length)];
          self.increaseXP(key, 2  * (self.player.skills[key].level + 1));
        }
     }
   },
   'Swashbuckler': {
     description: "Greatly all your aptitudes in zones that include a guile component",
     cost: 25,
     check: function(self) {
        var hasGuile = false;
        Object.keys(self.player.currentZone.skills).map(function(skillname, i) {
          if (skillname == 'guile') {
             hasGuile = true;
           }
        });
       if (hasGuile) {
         self.multis.Swashbuckler = {type: 'apt', skill: 'all', val: 3};
       } else {
          delete self.multis.Swashbuckler;
       }
     }
   },
   'Pillager': {
     description: "You live from victim to victim, and don't fare well outside of human settlements. Your progress and exp gain in non-urban zones is reduced.",
     check: function(self) {
        if (self.currentZone.type != 'urban') {
          self.multis['Pillager Progress'] = {type: 'progress', skill: 'all', val: -1};
          self.multis['Pillager EXP'] = {type: 'exp', skill: 'all', val: -1};
       } else {
          delete self.multis.Pillager;
       }
     }
   },
   'Infernal Blood': {
     description: "You have exchanged your soul for the power in demon blood, granting terrifying powers. All quest completions contribute exp towards your combat, black magic and guile skills.",
     onQuestComplete: function(self, zone) {
        ['combat', 'blackMagic', 'guile'].forEach(function(key) {
           self.increaseXP(key, Math.ceil(1.5  * (self.player.skills[key].level + 1)));
        });
     }
   },
   'Corruptor': {
     description: "Completing quests in zones with a divinity component slowly corrupts it, add and building up the guile level until it matches divinity.",
     cost: 50,
     onQuestComplete: function(self, zone) {
      // copy paladin system and add dynamic level adding. 
     }
   },
  'Latent Power': {
     description: "You are learning to bring forth and control the formidable magical power within as you grow in power. Multiply progress in Black Magic by 0.05% for every player level.",
     cost: 10,
     check: function(self) {
        var value = Number((self.player.level * 0.05).toFixed(2));
        self.multis['Latent Power'] = {type: 'progress', skill: 'blackMagic', val: value};
     }
   },
   'Bear Strength': {
     description: "Gain slightly increased aptitude for combat skills in dungeon zones",
     cost: 5,
     check: function(self) {
       var skills = ['combat', 'archery', 'blackMagic']
       if (self.player.currentZone.type == 'dungeon') {
         skills.forEach(function(skill){
            self.multis['Bear Strength: ' + skill] = {type: 'apt', skill: skill, val: 0.5};
         }) 
       } else {
         skills.forEach(function(skill){
          delete self.multis['Bear Strength: ' + skill];
         }) 
       }
     }
   },
    'Hawk Vision': {
     description: "Gain slightly increased aptitude for survival skills in wilderness zones",
     cost: 5,
     check: function(self) {
       var skills = ['labour', 'scouting', 'whiteMagic', 'herbalism']
       if (self.player.currentZone.type == 'dungeon') {
         skills.forEach(function(skill){
            self.multis['Hawk Vision: ' + skill] = {type: 'apt', skill: skill, val: 0.5};
         }) 
       } else {
         skills.forEach(function(skill){
          delete self.multis['Hawk Vision: ' + skill];
         }) 
       }
     }
   },
     'Owl Wisdom': {
     description: "Gain slightly increased aptitude for social skills in urban zones",
     cost: 5,
     check: function(self) {
       var skills = ['diplomacy', 'guile', 'divinity']
       if (self.player.currentZone.type == 'dungeon') {
         skills.forEach(function(skill){
            self.multis['Owl Wisdom: ' + skill] = {type: 'apt', skill: skill, val: 0.5};
         }) 
       } else {
         skills.forEach(function(skill){
          delete self.multis['Owl Wisdom: ' + skill];
         }) 
       }
     }
   },
   'Righteous Fury': {
     description: "Completing quests in zones with a Guile component builds fury over time, which multiplies combat aptitude. Fury decays half as quickly as it builds",
     cost: 50,
     onQuestComplete: function(self, zone) {
       var hasGuile = false;
       Object.keys(self.player.currentZone.skills).map(function(skillname, i) {
         if (skillname == 'guile') {
           hasGuile = true;
         }
       });
       if (hasGuile)  {
          if ('Righteous Fury' in self.multis) {  // if Righteous Fury  is already active, build on it up to a max of 500%
            var current =  self.multis['Righteous Fury'].val;
            if (current < 5) {
                 self.multis['Righteous Fury'] = {type: 'apt', skill: 'combat', val: Number((current + 0.2).toFixed(1))};
            }
          } else {
             self.multis['Righteous Fury'] = {type: 'apt', skill: 'combat', val: 0.2};
          }
       } else { // when inactive, it will decay over time 
          if ('Righteous Fury' in self.multis && self.multis['Righteous Fury'].val > 0) {
            var currenthigh =  self.multis['Righteous Fury'].val;
            self.multis['Righteous Fury'] = {type: 'apt', skill: 'combat', val: Number((currenthigh - 0.1).toFixed(1))};
          } else {
            delete self.multis['Righteous Fury'];
          }
       }
     }
   },
   'Despite a cursed life...': {
     description: "No amount of talent can make up for the disability of Goblin blood. You gain experience at half the normal rate.",
     check: function(self) {
       self.multis['Despite a cursed life...'] = {type: 'exp', skill: 'all', val: -0.5};
     }
   },
  'Some survive the odds...': {
     description: "Reach an average skill level of 15 to become a Goblin General",
     check: function(self) {
       var average = 0;
        Object.keys(self.player.skills).map(function(skillname, i) {
          average += self.player.skills[skillname].level;
        });
       average = Math.round(average / Object.keys(self.player.skills).length);
       console.log('average: ' + average);
       console.log('name: ' + self.jobs.goblin.name);
       // transform into the Goblin General
       if (average >= 15 && self.jobs.goblin.name === "Goblin") {
         self.jobs.goblin.name = "Goblin Chieftan";
         self.jobs.goblin.description = "The sniveling Goblin has survived despite the odds, and has risen to rank of Goblin Chieftan. It leads a small group of families and stunted goblin soldiers, attempting to scrape together a life away from the eyes of do-gooder adventurers looking for a target.";
         self.jobs.goblin.defaultAptitudes = {
              labour: 2,
              combat: 2,
              archery: 2,
              scouting: 2,
              whiteMagic: 1,
              blackMagic: 1,
              herbalism: 1,
              diplomacy: 2,
              guile: 4,
              divinity: 0.5,
         };
         self.jobs.goblin.perks =  ['Despite a cursed life...', 'Some survive the odds...', 'Through death, disease and persecution...', 'Leaders can rise to give hope...'];
       }
       self.$forceUpdate();
     }
   },
   'Through death, disease and persecution...': {
     description: "Your ragtag army and new repsonsibility to your people are more hindrance than help; all quest progress is reduced by 50%.",
     check: function(self) {
       self.multis['Leaders can rise to give hope...'] = {type: 'progress', skill: 'all', val: -0.5};
     }
   },
   'Leaders can rise to give hope...': {
     description: "Reach an average skill level of 30 to become the Goblin King",
     check: function(self) {
       var average = 0;
        Object.keys(self.player.skills).map(function(skillname, i) {
          average += self.player.skills[skillname].level;
        });
       average = Math.round(average / Object.keys(self.player.skills).length);
       // transform into the Goblin King
       if (average >= 30 && self.jobs.goblin.name === "Goblin Chieftan") {
         self.jobs.goblin.name = "Goblin King";
         self.jobs.goblin.description = "You are the Goblin King, raised here by decades of blood, sweat and tears. You rule your people with grace, wit and strength, leading them to a glorious invasion of the human lands, at last finding a place for your people to call home.";
         self.jobs.goblin.defaultAptitudes = {
              labour: 0.1,
              combat: 0.1,
              archery: 0.1,
              scouting: 0.1,
              whiteMagic: 0.1,
              blackMagic: 0.1,
              herbalism: 0.1,
              diplomacy: 0.1,
              guile: 0.1,
              divinity: 0.1,
         };
         self.jobs.goblin.perks =  ['Despite a cursed life...', 'Some survive the odds...', 'Through death, disease and persecution...', 'Leaders can rise to give hope...', 'And rewrite history.'];
       }
     }
   },
   'And rewrite history': {
     description: "You are old and frail, but have done what none could ever have dreamed. Your people are prosperous and forging a new civilisation thanks to your efforts. Retire this character to unlock special upgrades.",
   },
};

// loop through perks, adding empty functions where they are not defined. Saves us having to try catch for their existence elsewhere in the code
Object.keys(defaultPerks).map(function(key, index) {
  if (typeof defaultPerks[key].check == 'undefined') {
    defaultPerks[key].check = function(self) {};
  }
  if (typeof defaultPerks[key].onQuestComplete == 'undefined') {
    defaultPerks[key].onQuestComplete = function(self) {};
  }
  if (typeof defaultPerks[key].onLevelUp == 'undefined') {
    defaultPerks[key].onLevelUp = function(self) {};
  }
  if (typeof defaultPerks[key].onPlayerLevelUp == 'undefined') {
    defaultPerks[key].onPlayerLevelUp = function(self) {};
  }
});