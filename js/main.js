  new Vue({
    el: '#app',
    name: 'game',
    data: {
      debug: false,
      startup: true,
      view: 'world',
      chosenJob: "",
      questing: false,
      completingcount: 0,
      config: {
        hintcount: 3,
        wanderlust: false
      },
      boost: {
        amount: 1,
        count: 0,
        decay: 0.005,
        max: 5,
      },
      interval: {},
      loopspeed: 250,
      player: getDefaultPlayer(),
      multis: {},
      displayMultis: {},
      stats: {},
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
      jobs: defaultJobs,
      zones: defaultZones,
      areas: defaultAreas(),
      perks: defaultPerks,
      upgrades: defaultUpgrades,
      bought: [],
      icons: {
        labour: "industry",
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
    },
    created: function() {
      // calculate initial zone totals
      this.calculateZones();
      // load the game state from localStorage
      this.load();
      // if the player location is not set after load, it is a new game or something went wrong
      if (!Object.keys(this.player.currentJob).length) {
        this.startup = true;
        this.player.job = 'peasant';
        //this.player.currentJob = this.jobs[this.player.job];
        this.player.zone = 'Training Yard';
        //this.player.currentZone = this.zones[this.player.zone];
        this.player.area = 'Village'
      }
      // set the rates and display numbers for the game
      this.calculateRates();
      // start the game loop
      this.startGame();
    },
    watch: {
      'player.job': function() {
        console.log('changing job via watcher');
        var self = this;
        if (this.player.job in this.jobs) {
          this.player.currentJob = this.jobs[this.player.job];
          // reset perks and build them again from scratch
          this.player.perks = {};
          this.player.currentJob.perks.forEach(function(perk) {
            console.log('setting perk from job');
            self.setPerk(perk);
          });
          // loop through bought upgrades to add them to your perks list
          // relies on perk upgrades being generated entirely by code
          this.applyBought();
          this.checkPerks();
        } else {
          console.log('could not find job: ' + this.player.job)
        }
      },
      'player.zone': function() {
        console.log('setting zone via watcher');
        if (this.player.zone in this.zones) {
          this.player.currentZone = this.zones[this.player.zone];
          this.player.area = this.zones[this.player.zone].area;
          this.checkPerks();
          this.calculateRates();
          this.quest();
        }
      },
      'player.area': function() {
        /*
        if (this.player.area !== "" && this.player.currentZone.area !== this.player.area) {
          console.log('incorrect area for location, setting to first');
          var self = this;
          var first = Object.keys(self.zones).find(function(zone, i) {
            return self.zones[zone].area == self.player.area;
          });
          console.log(first);
          this.player.zone = first;
          this.checkPerks();
        }
        */
      },
      'loopspeed': function() {
        this.endLoop();
        this.startLoop();
      },
      'player.level': function() {
        this.checkPerks();
        this.calculatePrestige();
      }
    },
    methods: {
      buy(name) {
        if (!(name in this.upgrades)) {
          console.log('upgrade not found: ' + name);
          return;
        }
        var cost = this.upgrades[name].cost;
        if (cost >= this.prestige.current) {
          console.log('you cannot afford upgrade: ' + name + ' with currency amount: ' + this.prestige.current);
          return;
        }
        if (!(this.bought.includes(name))) {
          this.bought.push(name);
        }
        this.calculatePrestige();
        // if an upgrade has an effect (most should), run its effect function
        if (typeof this.upgrades[name].effect == 'function') {
          this.upgrades[name].effect(this);
        }
        this.message('You purchased ' + name + ' for ' + cost, 'upgrade');
      },
      applyBought() {
        console.log('applying non-persistent bought upgrades');
        var self = this;
        this.bought.forEach(function(name) {
          if (typeof self.upgrades[name].effect == 'function') {
            if (!self.upgrades[name].persistent) {
              self.upgrades[name].effect(self);
            }
          }
        })
      },
      message(text, type, permanent) {
        // supress message at startup so we can 'buy' upgrades and unlock stuff without blasting the user with messages.
        if (this.startup) {
          return;
        }
        if (typeof type == 'undefined') {
          type = "";
        }
        var time = new Date().getTime();
        console.log(type + ' message:' + text);
        console.log(this.messages);
        this.messages[time] = {
          text,
          type,
          visible: true
        }
        var self = this;
        if (typeof permanent != 'undefined') {
          return
        }
        setTimeout(function() {
          self.messages[time].visible = false
        }, 10000);
      },
      checkUnlocks() {
        var self = this;
        Object.keys(self.jobs).map(function(key, i) {
          if (!self.jobs[key].unlocked && typeof self.jobs[key].check != 'undefined') {
            if (self.jobs[key].check(self)) {
              self.jobs[key].unlocked = true;
              self.message('Unlocked a new job: ' + key, 'jobunlock')
            }
          }
        });
        Object.keys(self.zones).map(function(key, i) {
          if (!self.zones[key].unlocked && typeof self.zones[key].check != 'undefined') {
            if (self.zones[key].check(self)) {
              self.zones[key].unlocked = true;
              self.message('Unlocked a new zone: ' + key, 'zoneunlock')
            }
          }
        });
        Object.keys(self.upgrades).map(function(key, i) {
          if (!self.upgrades[key].unlocked && typeof self.upgrades[key].check != 'undefined') {
            if (self.upgrades[key].check(self)) {
              self.upgrades[key].unlocked = true;
              self.message('Unlocked a new zone: ' + key, 'zoneunlock')
            }
          }
        });
      },
      calculatePrestige() {
        // calculate total and current prestige freshly based on the graveyard history and bought upgrades
        // this is so we can change the algorithm later if prestige currency it is too fast or slow. also prevents cheating :)
        //console.log('calculating prestige');
        var self = this;
        var calcPres = function(level) {
          if (level > 10) {
            return Math.ceil(Math.pow(2, Number(level / 10).toFixed(2)))
          } else {
            return 0
          }
        }
        this.prestige.next = calcPres(this.player.level);
        var total = 0;
        this.graveyard.forEach(function(ret) {
          var num = 0;
          num = calcPres(ret.level);
          total += num;
        })
        this.prestige.total = total;
        var spent = 0;
        this.bought.forEach(function(name) {
          if (name in self.upgrades && typeof self.upgrades[name].cost != 'undefined') {
            spent += self.upgrades[name].cost;
          }
        })
        this.prestige.current = this.prestige.total - spent;
        //console.log('current prestige is: ' + this.prestige.current);
      },
      setPerk(name) {
        if (name in this.perks) {
          console.log('setting perk: ' + name);
          this.player.perks[name] = this.perks[name];
        } else {
          console.log('perk not found: ' + name);
        }
        this.checkPerks();
      },
      checkPerks: function() {
        var self = this;
        Object.keys(self.player.perks).map(function(perk, i) {
          if (perk in self.perks) {
            //console.log('checking perk: ' + perk);
            self.perks[perk].check(self);
          }
        });
        this.calculateMultis();
        this.checkUnlocks();
        this.$forceUpdate();
      },
      calculateMultis: function() {
        //console.log('calculating multis');
        var self = this;
        // start with the difficulty multiplier for all skills in all zones. This effects the total EXP you receive 
        // This is a master multiplier applied after other multis. 
        Object.keys(self.zones).map(function(zone, i) {
          Object.keys(self.zones[zone].skills).map(function(skill, j) {
            self.zones[zone].difficulty[skill] = Number((self.zones[zone].skills[skill] / (self.player.skills[skill].level + 1)).toFixed(3));
          });
        });
        // check first if any multis have expired (ie. are temporary)
        Object.keys(self.multis).map(function(key, i) {
          var time = new Date();
          if (self.multis[key].expiry > 0 && self.multis[key].expiry < time.getTime()) {
            delete self.multis[key];
          }
        });
        // loop through multi array, assigning any multis found to their appropriate location
        var exp = {};
        var progress = {};
        var aptitudes = {};
        // reset all to 1 (ie. 100% multiplier)
        Object.keys(self.player.skills).map(function(skill, i) {
          exp[skill] = 1;
          progress[skill] = 1;
          aptitudes[skill] = 1;
        });
        // loop through multis, then all the skills, adding up the value if they match or have the 'all skill'
        Object.keys(self.multis).map(function(name, i) {
          Object.keys(self.player.skills).map(function(skillname, j) {
            if (self.multis[name].type == "exp") {
              if (self.multis[name].skill == skillname || self.multis[name].skill == 'all') {
                exp[skillname] += self.multis[name].val;
              }
            } else if (self.multis[name].type == 'progress') {
              if (self.multis[name].skill == skillname || self.multis[name].skill == 'all') {
                progress[skillname] += self.multis[name].val;
              }
            } else if (self.multis[name].type == 'apt') {
              if (self.multis[name].skill == skillname || self.multis[name].skill == 'all') {
                aptitudes[skillname] += self.multis[name].val;
              }
            } else {
              console.log('multi type not found:');
              console.log(self.multis[name]);
            }
          });
        });
        // map all multis to their repective locations
        Object.keys(self.player.skills).map(function(skill, i) {
          // do exp multis first, they look like:  player.skills[skill].multi and effect EXP gain
          self.player.skills[skill].multi = exp[skill];
          // progress multis look like: zones[zone].multis[skill] and effect the rate of gaining progress in zones PER SKILL
          Object.keys(self.zones).map(function(zone, j) {
            self.zones[zone].multis[skill] = progress[skill];
          });
          // aptitude multis are in jobs[job].multis[skill] and effect the final aptitude value, which are generated by multi * default aptitude
          // be careful with this, as aptitude effects progress gains as well as exp gains (to a small degree). Stacking it could be OP
          Object.keys(self.jobs).map(function(job, j) {
            self.jobs[job].multis[skill] = aptitudes[skill];
            self.jobs[job].aptitudes[skill] = Number(self.jobs[job].defaultAptitudes[skill] * self.jobs[job].multis[skill]).toFixed(2);
          });
        });
        self.displayMultis = {
          exp,
          progress,
          aptitudes
        };
      },
      calculateZones: function() {
        var self = this;
        //console.log('calcing zones');
        Object.keys(self.zones).map(function(key, index) {
          var total = 0;
          Object.keys(self.zones[key].skills).map(function(skill, index) {
            total += self.zones[key].skills[skill];
          });

          total = Math.ceil(Math.pow(total * (10), 1.5));
          self.zones[key].max = total;
          //console.log('max is: ' + total);
        });
      },
      boostUp: function() {
        if ('Boosted' in this.multis) {
          var next = this.multis.Boosted.val + this.boost.amount;
          if (next <= this.boost.max) {
            this.multis.Boosted = {
              type: 'progress',
              skill: 'all',
              val: Math.round(next)
            };
          } else {
            this.multis.Boosted = {
              type: 'progress',
              skill: 'all',
              val: 5
            };
          }
        } else {
          this.multis.Boosted = {
            type: 'progress',
            skill: 'all',
            val: this.boost.amount
          };
        }
        this.boost.count = 5;
      },
      calculateRates: function() {
        var self = this;
        Object.keys(self.zones).map(function(zonename, index) {
          // loop through zones, setting increase rates for each.
          var total = 0;
          Object.keys(self.zones[zonename].skills).map(function(skill, index) {
            // calculate progress based on player skill times aptitude
            var amount = self.player.skills[skill].level + 1;
            if (self.player.currentJob.aptitudes[skill] > 1) {
              amount = amount * self.player.currentJob.aptitudes[skill];
            }
            // multiply the result by the total progress multiplier
            if (self.zones[zonename].multis[skill] > 1) {
              amount = amount * self.zones[zonename].multis[skill];
            }
            // set the rate per zone for display
            self.zones[zonename].rates[skill] = Number((amount).toFixed(2));
            // minus the skill value for the zone. This can result in negative progress
            amount = Math.ceil(amount) - self.zones[zonename].skills[skill];
            total += amount;
          });
          // set the total rate for the zone
          self.zones[zonename].rates.total = Number((total).toFixed(2));
        })
        // set the EXP rate of the current zone while we are here
          Object.keys(self.player.skills).map(function(key, index) {
            if (key in self.player.currentZone.skills) {
              var baseIncrease = self.player.currentZone.skills[key] + 1;
              var increase = Math.round((baseIncrease * self.player.currentJob.aptitudes[key]) * (1 + (self.player.currentZone.difficulty[key])) / 2);
              self.player.skills[key].rate = increase;
            } else {
              self.player.skills[key].rate = 0;
            }
          });
        
      },
      quest: function(zone) {
       if (this.player.currentZone.finished) {
            this.completeQuest();
            return;
        }
        /* removing this for now, it slowed the game down too much
        if (this.player.currentZone.finished) {
          // check if the quest is finished. if it is, use the progress bar to track back and complete the quest
          if (this.player.currentZone.progress <= 10) {
            this.completeQuest();
          } else {
            this.player.currentZone.progress -= 10; // MAGIC NUMBER hardcoded trackab of 10 times (100/10)
          }
          return;
        }
        */
        // get the total increase from the rate;
        var total = this.player.currentZone.rates.total;
        // progress must always be at least 1. if not, just return and nothing happens.
        if (total < 1) {
          total = 0;
        }
        if ((this.player.currentZone.current + total) >= this.player.currentZone.max) {
          this.player.currentZone.progress = 100;
          this.player.currentZone.current = this.player.currentZone.max;
          this.player.currentZone.finished = true;
        } else {
          this.player.currentZone.current += total;
          this.player.currentZone.progress = Math.round((this.player.currentZone.current / this.player.currentZone.max) * 100);
        }
      },
      completeQuest: function(zone) {
        if (typeof zone == 'undefined') {
          zone = this.player.zone
        }

        this.completingcount = 5;
        this.player.currentZone.finished = false;
        this.player.currentZone.progress = 0;
        this.player.currentZone.current = 0;
        // gain EXP for each skill in the zone.
        var self = this;
        self.calculateMultis();
        Object.keys(this.player.currentZone.skills).map(function(key, index) {
          if (key in self.player.currentJob.aptitudes) {
            if (key in self.player.skills) {
              var increase = self.player.skills[key].rate;
              //console.log(key + ' increase is : ' + increase);
              self.increaseXP(key, increase);
            } else {
              console.log('could not improve: ' + key + ' it was not found on the player')
            }
          } else {
            console.log('could not improve: ' + key + ' it is not in this jobs aptitude list')
          }
        });
        // check perks for oncomplete Quest effects
        Object.keys(self.player.perks).map(function(perk, i) {
          if (perk in self.perks) {
            //console.log('checking perk: ' + perk);
            self.perks[perk].onQuestComplete(self, zone);
          }
        });
        // calculate rates afresh
        this.calculateRates();
        // update stats
        if (zone in this.stats.zones) {
          this.stats.zones[zone].completions++;
          this.stats.zones[zone].currentCompletions++;
          if (this.stats.zones[zone].currentCompletions > this.stats.zones[zone].highest) {
            this.stats.zones[zone].highest++;
          }
        }
      },
      increaseXP: function(key, amount) {
        // recursive function that adds the exp amounts, levels up if needed and then calls itself with any remaining XP
        var total = this.player.skills[key].exp + amount;
        var remainder = total - this.player.skills[key].next;
        if (total >= this.player.skills[key].next) {
          //console.log('level up! ' + key + '  remainder is ' + remainder);
          this.levelUp(key);
          if (remainder > 0) {
            this.increaseXP(key, remainder);
          }
        } else {
          this.player.skills[key].exp += amount;
        }
        this.player.skills[key].progress = Math.round((this.player.skills[key].exp / this.player.skills[key].next) * 100);
      },
      increasePlayerXP: function(amount) {
        var remainder = this.player.exp + amount - this.player.next;
        if (this.player.exp + amount >= this.player.next) {
          this.player.level++;
          this.player.exp = 0;
          // another compounding exp formula
          this.player.next = 10;
          if (remainder > 0) {
            this.increasePlayerXP(remainder);
          }
        } else {
          this.player.exp += amount;
        }
      },
      levelUp(key) {
        // increase player xp by 1 for each skill level up
        this.increasePlayerXP(1);
        // reset to next level
        // call level up event to trigger any other stuff
        this.player.skills[key].level++;
        this.player.skills[key].exp = 0;
        // use compounding interest formula to calculate the EXP limit for our new level.  
        this.player.skills[key].next = Math.round(10 * (Math.pow(1 + 0.025, this.player.skills[key].level) - 1) / 0.025);
        var self = this;
        // go through perks, calling onLevelUp functions if they exist
        Object.keys(self.player.perks).map(function(perk, i) {
          if (perk in self.perks) {
            //console.log('checking perk: ' + perk);
            self.perks[perk].onLevelUp(self, key);
          }
        });
        // update stats
        this.stats.skills[key].total++;
        if (this.player.skills[key].level > this.stats.skills[key].highest) {
          this.stats.skills[key].highest++;
        }
      },
      startGame: function() {
        this.startup = false;
        this.startLoop();
        this.$forceUpdate();
      },
      startLoop: function() {
        console.log('starting Loop');
        var self = this;
        if (this.loopspeed > 0) {
          this.interval.game = setInterval(function() {
            self.loop();
          }, this.loopspeed);
        }
        this.interval.save = setInterval(function() {
          self.save();
        }, 60000);
      },
      loop: function() {
        if (this.startup) {
          return;
        }
        if ('Boosted' in this.multis) {
          var current = this.multis.Boosted.val;
          if (current > 0.1) {
            this.multis.Boosted = {
              type: 'progress',
              skill: 'all',
              val: Math.ceil(current * (1 - this.boost.decay))
            };
          } else {
            delete this.multis.Boosted;
          }
          var self = this;
        }
        if (this.player.zone.length > 0) {
          this.quest();
        }
        if (this.completingcount > 0) {
          this.completingcount--;
        }
        if (this.boost.count > 0) {
          this.boost.count--;
        }
        this.checkPerks();
      },
      endLoop: function() {
        console.log('ending Loop');
        clearInterval(this.interval.game);
        clearInterval(this.interval.save);
      },
      save: function() {
        localStorage.setItem('jobs_player_save', JSON.stringify(this.player));
        localStorage.setItem('jobs_stats_save', JSON.stringify(this.stats));
        localStorage.setItem('jobs_upgrade_save', JSON.stringify(this.bought));
        localStorage.setItem('jobs_graveyard_save', JSON.stringify(this.graveyard));
        console.log('game saved');
      },
      load: function() {
        var self = this;
        // set up the stats object based on the existing zones, jobs and player
        this.buildStats();
        if (localStorage.getItem('jobs_graveyard_save') != null) {
          Object.assign(this.graveyard, JSON.parse(localStorage.getItem('jobs_graveyard_save')));
          console.log('graveyard data loaded from localstorage');
        }
        if (localStorage.getItem('jobs_player_save') != null) {
          Object.assign(this.player, JSON.parse(localStorage.getItem('jobs_player_save')));
          console.log('player data loaded from localstorage');
        }
        if (localStorage.getItem('jobs_stats_save') != null) {
          Object.assign(this.stats, JSON.parse(localStorage.getItem('jobs_stats_save')));
          console.log('stats data loaded from localstorage');
        }
        if (localStorage.getItem('jobs_upgrade_save') != null) {
          this.calculatePrestige();
          var savedbought = JSON.parse(localStorage.getItem('jobs_upgrade_save'));
          if (!(savedbought.length)) {
            console.log('No upgrades found in save');
            return;
          }
          savedbought.forEach(function(name) {
            self.buy(name);
          });
          this.calculatePrestige();
          console.log('upgrade data loaded from localstorage');
        }
        this.$forceUpdate();
      },
      reincarnate(newjob) {
        this.endLoop();
        var newRet = {
          name: this.player.name,
          level: this.player.level,
          skills: {},
          zone: this.player.zone,
          job: this.player.job,
        };
        var self = this;
        Object.keys(this.player.skills).map(function(skillname, i) {
          newRet.skills[skillname] = self.player.skills[skillname].level;
        });
        this.graveyard.push(newRet)
        this.calculatePrestige();
        this.calculateRates();
        this.stats.totalRetirements++;
        this.reset(newjob);
      },
      reset: function(job) {
        // check for the right
        this.prestige.confirm = '';
        if (typeof job == 'undefined') {
          job = this.player.job;
          if (!(job in this.jobs)) {
            console.log('Job not found, could not reset to it: ' + job)
            this.player.job = 'peasant';
          }
        }
        this.endLoop();
        localStorage.removeItem('player_save');
        var newData = getDefaultPlayer();
        this.multis = {},
          // sprinkle stuff into the new player data 
          this.player.level = newData.level;
        this.player.exp = newData.exp;
        this.player.next = newData.next;
        if (job !== this.player.job) {
          this.player.perks = newData.perks;
        }
        console.log('setting job to: ' + job);
        this.player.job = job;
        this.player.zone = 'Inn';
        Object.assign(this.player.skills, newData.skills);
        this.view = 'world';
        this.stats.totalCharacters++;
        this.resetStats();
        this.startLoop();
      },
      logData() {
        console.log(this.$data);
      },
      generateIcon: function(key, size, diff) {
        if (!(key in this.icons)) {
          return;
        }
        var color = "";
        if (typeof diff != 'undefined') {
          color = 'style="background: ' + this.generateColor(diff) + '"';
        }
        if (size == 1) {
          return "<i " + color + " class='fa fa-" + this.icons[key] + " fa-lg'></i>";
        } else if (size > 1) {
          return "<i " + color + " class='fa fa-" + this.icons[key] + " fa-" + size + "x'></i>";
        } else {
          return "<i " + color + " class='fa fa-" + this.icons[key] + "'></i>";
        }
      },
      generateColor: function(diff) {
        var red = 255;
        var green = 255;
        // between 100 and 300% difficultry, show red scale
        if (diff <= 0) {
          red = 0;
        } else if (diff < 1) {
          red = Math.round(red * diff);
        } else if (diff >= 1 && diff <= 3) {
          green = 255 - Math.round(green * ((diff - 1) / 2));
        } else {
          green = 0;
        }
        // beyond 500% difficultry, we start fading down to black
        if (diff >= 10) {
          red = 0;
        } else if (diff > 5) {
          red = 255 - Math.round(255 * ((diff - 5) / 5));
        }
        return 'rgb(' + red + ',' + green + ',0)'
      },
      resetStats() {
        var self = this;
        Object.keys(self.zones).map(function(zonename, i) {
          if (zonename in self.stats.zones && self.stats.zones[zonename].currentCompletions > 0) {
            self.stats.zones[zonename].currentCompletions = 0;
          }
        });
        self.areas.forEach(function(area) {
          self.stats.areas[area].currentCompletions = 0;
        })
      },
      buildStats() {
        var self = this;
        this.stats = {
          totalCharacters: 0,
          totalRetirements: 0,
          zones: {},
          areas: {},
          jobs: {},
          skills: {},
        }
        Object.keys(self.zones).map(function(zonename, i) {
          self.stats.zones[zonename] = {
            currentCompletions: 0,
            completions: 0,
            highest: 0,
          }
        });
        self.areas.forEach(function(area) {
          self.stats.areas[area] = {
            currentCompletions: 0,
            completions: 0,
            highest: 0,
          }
        })
        Object.keys(self.jobs).map(function(jobname, i) {
          self.stats.jobs[jobname] = {
            highest: 0,
            total: 0,
            retirements: 0,
          }
        });
        Object.keys(self.player.skills).map(function(skillname, i) {
          self.stats.skills[skillname] = {
            total: 0,
            highest: 0,
          }
        });
      },
    }
  })