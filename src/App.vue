<script>
// imports a global reactive object used as the whole app store
import store from './js/store'
import { toRefs } from 'vue'

export default {
  data: () => store,
  created: function () {
    // calculate initial zone totals
    this.calculateZones();
    // load the game state from localStorage
    this.load();
    // set the rates and display numbers for the game
    this.calculateRates();
    // start the game loop
    this.startGame();
  },
  watch: {
    'player': (p) => { console.log('self.player changed', p) },
    'player.job': function () {
      console.log('changing job via watcher');
      var self = this;
      if (this.player.job in this.jobs) {
        this.player.currentJob = this.jobs[this.player.job];
        // reset perks and build them again from scratch
        this.player.perks = {};
        this.player.currentJob.perks.forEach(function (perk) {
          console.log('setting perk from job');
          self.setPerk(perk);
        });
        // loop through bought upgrades to add them to your perks list
        // relies on perk upgrades being generated entirely by code
        this.applyBought();
        this.checkPerks();
      } else {
        console.log('could not find job: ' + this.player.job)
        this.setDefaultPlayer()
      }
    },
    'player.zone': function () {
      console.log('setting zone via watcher');
      if (this.player.zone in this.zones) {
        this.player.currentZone = this.zones[this.player.zone];
        this.player.area = this.zones[this.player.zone].area;
        this.checkPerks();
        this.calculateRates();
        this.quest();
      }
    },
    'player.area': function () {
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
    'constants.loopspeed': function () {
      this.endLoop();
      this.startLoop();
    },
    'player.level': function () {
      this.checkPerks();
      this.calculatePrestige();
    }
  },
  methods: {
    setDefaultPlayer() {
      let newPlayer = {
        name: "",
        job: "spirit",
        currentJob: {},
        zone: "limbo",
        currentZone: {},
        area: "limbo",
        level: 1,
        exp: 0,
        next: 5,
        perks: {},
        bought: [],
        skills: {
          labour: { level: 1, exp: 0, multi: 1, next: 10, progress: 0, rate: 0 },
          combat: { level: 1, exp: 0, multi: 1, next: 10, progress: 0, rate: 0 },
          archery: { level: 1, exp: 0, multi: 1, next: 10, progress: 0, rate: 0 },
          scouting: { level: 1, exp: 0, multi: 1, next: 10, progress: 0, rate: 0 },
          whiteMagic: { level: 1, exp: 0, multi: 1, next: 10, progress: 0, rate: 0 },
          blackMagic: { level: 1, exp: 0, multi: 1, next: 10, progress: 0, rate: 0 },
          herbalism: { level: 1, exp: 0, multi: 1, next: 10, progress: 0, rate: 0 },
          diplomacy: { level: 1, exp: 0, multi: 1, next: 10, progress: 0, rate: 0 },
          guile: { level: 1, exp: 0, multi: 1, next: 10, progress: 0, rate: 0 },
          divinity: { level: 1, exp: 0, multi: 1, next: 10, progress: 0, rate: 0 },
        },
      }
      this.player = Object.assign({}, newPlayer)
    },
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
      this.bought.forEach(function (name) {
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
      setTimeout(function () {
        self.messages[time].visible = false
      }, 10000);
    },
    checkUnlocks() {
      var self = this;
      Object.keys(self.jobs).map(function (key, i) {
        if (!self.jobs[key].unlocked && typeof self.jobs[key].check != 'undefined') {
          if (self.jobs[key].check(self)) {
            self.jobs[key].unlocked = true;
            self.message('Unlocked a new job: ' + key, 'jobunlock')
          }
        }
      });
      Object.keys(self.zones).map(function (key, i) {
        if (!self.zones[key].unlocked && typeof self.zones[key].check != 'undefined') {
          if (self.zones[key].check(self)) {
            self.zones[key].unlocked = true;
            self.message('Unlocked a new zone: ' + key, 'zoneunlock')
          }
        }
      });
      Object.keys(self.upgrades).map(function (key, i) {
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
      var calcPres = function (level) {
        if (level > 10) {
          return Math.ceil(Math.pow(2, Number(level / 10).toFixed(2)))
        } else {
          return 0
        }
      }
      this.prestige.next = calcPres(this.player.level);
      var total = 0;
      this.graveyard.forEach(function (ret) {
        var num = 0;
        num = calcPres(ret.level);
        total += num;
      })
      this.prestige.total = total;
      var spent = 0;
      this.bought.forEach(function (name) {
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
    checkPerks: function () {
      var self = this;
      console.log('checkPerks self.player.perks', self.player.perks, self.player)
      Object.keys(self.player.perks).map(function (perk, i) {
        if (perk in self.perks) {
          //console.log('checking perk: ' + perk);
          self.perks[perk].check(self);
        }
      });
      this.calculateMultis();
      this.checkUnlocks();
      this.$forceUpdate();
    },
    calculateMultis: function () {
      // multis look like this
      /*
      { 
        type: 'apt', 
        skill: 'all', 
        val: 0.2, 
        area:'areaname', 
        zone:'zonename', 
        name:'someidentifier', 
        time: "", 
        boost: false
      }
      */
      // type, skill and val are mandatory; all the rest are optional params
      // if either area or zone are specified, the multi is applied there
      // zone and area do not double up, ie specifying a n area in a zone will not apply twice
      // name is a special value that allows you to group multis together.
      // unnamed mutlis will be added together in a 'base' name, 
      // while every named multi will be added together to form an additive multi
      // then all the different groups are multiplied togetehr to get a final multi

      console.log('calculating multis');

      var self = this;
      // start with the difficulty multiplier for all skills in all zones. This effects the total EXP you receive
      // This is a master multiplier applied after other multis.
      Object.keys(self.zones).map(function (zone, i) {
        Object.keys(self.zones[zone].skills).map(function (skill, j) {
          self.zones[zone].difficulty[skill] = Number((self.zones[zone].skills[skill] / (self.player.skills[skill].level + 1)).toFixed(3));
        });
      });

      // run the boosts calculation as they are used below
      self.calculateBoosts();

      // check first if any multis have expired (ie. are temporary)
      Object.keys(self.multis).map(function (key, i) {
        var time = new Date();
        if (self.multis[key].expiry > 0 && self.multis[key].expiry < time.getTime()) {
          delete self.multis[key];
        }
      });
      // loop through multi array, assigning any multis found to their appropriate location
      var tempmultis = {
        exp: {},
        progress: {},
        apt: {}
      }

      // reset all to 1 (ie. 100% multiplier)
      Object.keys(self.player.skills).map(function (skill, i) {
        tempmultis.exp[skill] = {};
        tempmultis.progress[skill] = {};
        tempmultis.apt[skill] = {};
        Object.keys(self.zones).map(function (zonename, z) {
          tempmultis.exp[skill][zonename] = { base: 1, final: 1 };
          tempmultis.progress[skill][zonename] = { base: 1, final: 1 };
          tempmultis.apt[skill][zonename] = { base: 1, final: 1 };
        });
      });
      // loop through multis, then all the zones, then all the skills, 
      // adding up the value if they match or have the 'all' zone or skill
      // the behaviour of multis is as follows:
      // all multis are assigned

      Object.keys(self.multis).map(function (name, i) {
        Object.keys(self.zones).map(function (zonename, z) {
          Object.keys(self.player.skills).map(function (skillname, s) {
            // if a zone or area is explicitly set, validate for it here
            if ('zone' in self.multis[name] && self.multis[name].zone != zonename) {
              return;
            }
            if ('area' in self.multis[name] && self.multis[name].area != self.zones[zonename].area) {
              return;
            }
            var ref = tempmultis[self.multis[name].type][skillname][zonename];
            if (self.multis[name].skill == skillname || self.multis[name].skill == 'all') {
              if (self.multis[name].type in tempmultis) {
                if (name in self.multis[name]) { // any named multis are multiplicative
                  if (!(name in ref)) { ref[name] = 1 }
                  ref[name] += self.multis[name].val;
                } else {
                  ref.base += self.multis[name].val; // unnamed multis are added together at the base level
                }
              } else {
                console.log('Multi Type does not exist!');
                console.log(self.multis[name]);
              }
            }
            // calculate a final multi value by multipliying
            // all the different multi groups together, including base
            var final = 1;
            Object.keys(ref).forEach(function (key) {
              if (key != 'final') {
                final = final * ref[key];
              }
            });
            ref.final = final;
          });
        });
      });
      // map all multis to their respective locations
      Object.keys(self.player.skills).map(function (skill, i) {
        Object.keys(self.zones).map(function (zone, j) {
          // we calculate the per-zone aptitude value here to add its multiplier to the progress and exp as a multiplicative multi
          // the apititudes used for display are later on.
          var apt = self.jobs[self.player.job].defaultAptitudes[skill] * tempmultis.apt[skill][zone].final;
          apt = + Number(apt + self.finalBoosts.apt).toFixed(2);
          // do exp multis including aptitude modifier
          self.player.skills[skill].multi = Number(tempmultis.exp[skill][zone].final * apt).toFixed(2);
          // do progress multis including aptitude modifier
          self.zones[zone].multis[skill] = Number(tempmultis.progress[skill][zone].final * apt).toFixed(2);
        });
        // may as well set the aptitudes for display while we are here.
        var currentZoneApt = self.jobs[self.player.job].defaultAptitudes[skill] * tempmultis.apt[skill][self.player.zone].final;
        currentZoneApt = Number(currentZoneApt + self.finalBoosts.apt).toFixed(2);
        self.jobs[self.player.job].aptitudes[skill] = currentZoneApt;
      });

      self.finalMultis = tempmultis;
    },
    calculateBoosts() {
      var self = this;
      var boosts = {
        exp: 0,
        progress: 0,
        apt: 0
      }

      Object.keys(self.boosts).map(function (key, i) {
        var time = new Date();
        if (self.boosts[key].expiry > 0 && self.boosts[key].expiry < time.getTime()) {
          delete self.boosts[key];
        }
      });

      Object.keys(self.boosts).map(function (name, i) {
        Object.keys(self.zones).map(function (zonename, z) {
          Object.keys(self.player.skills).map(function (skillname, s) {
            if ('zone' in self.boosts[name] && self.boosts[name].zone != zonename) { return; }
            if ('area' in self.boosts[name] && self.boosts[name].area != self.zones[zonename].area) { return; }
            if (self.boosts[name].skill == skillname || self.boosts[name].skill == 'all') {
              if (self.boosts[name].type in boosts) {
                boosts[self.boosts[name].type] = + self.boosts[name].val
              }
            }
          })
        })
      })
      self.finalBoosts = boosts;

    },
    calculateZones: function () {
      var self = this;
      //console.log('calcing zones');
      Object.keys(self.zones).map(function (key, index) {
        var total = 0;
        Object.keys(self.zones[key].skills).map(function (skill, index) {
          total += self.zones[key].skills[skill];
        });

        total = Math.ceil(Math.pow(total * (10), 1.5));
        self.zones[key].max = total;
        //console.log('max is: ' + total);
      });
    },
    calculateQuests: function () {
      var self = this;
      //console.log('calcing quest counts');
      Object.keys(self.zones).map(function (key, index) {
        if (self.zones[key].questCountdown <= 0) {
          if (self.zones[key].quests < self.zones[key].maxQuests) {
            self.zones[key].quests++;
            self.zones[key].questCountdown = self.zones[key].questCountdownDefault;
          }
        } else {
          self.zones[key].questCountdown--;
        }
      });
    },
    calculateRates: function () {
      var self = this;
      Object.keys(self.zones).map(function (zonename, index) {
        // loop through zones, setting progress rates for each.
        var total = 0;
        Object.keys(self.zones[zonename].skills).map(function (skill, index) {
          // calculate progress based on player skill
          var amount = self.player.skills[skill].level + 1;
          // multiply the result by the total progress multiplier
          if (self.zones[zonename].multis[skill] > 1) {
            amount = amount * self.zones[zonename].multis[skill];
          }
          // add any static boosts AFTER multiplier
          // TODO maybe split boosts into pre and post multi
          amount = + self.finalBoosts.progress;
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
      Object.keys(self.player.skills).map(function (key, index) {
        var exprate = 0
        if (key in self.player.currentZone.skills) {
          var baseIncrease = self.player.currentZone.skills[key] + 10;
          var increase = Math.round((baseIncrease * (1 + (self.player.currentZone.difficulty[key])) / 2));
          self.player.skills[key].rate = increase;
        }
        // add any static boosts AFTER multiplier
        // TODO maybe split boosts into pre and post multi
        exprate = + Math.floor(self.finalBoosts.exp);
        self.player.skills[key].rate = exprate;
      });
    },
    quest: function (zone) {
      if (this.player.currentZone.finished) {
        this.completeQuest();
        return;
      }
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
    completeQuest: function (zone) {
      if (typeof zone == 'undefined') {
        zone = this.player.zone
      }

      this.player.currentZone.quests--;
      this.player.currentZone.finished = false;
      this.player.currentZone.progress = 0;
      this.player.currentZone.current = 0;
      // gain EXP for each skill in the zone.
      var self = this;
      self.calculateMultis();
      Object.keys(this.player.currentZone.skills).map(function (key, index) {
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
      Object.keys(self.player.perks).map(function (perk, i) {
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
    increaseXP: function (key, amount) {
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
    increasePlayerXP: function (amount) {
      var remainder = this.player.exp + amount - this.player.next;
      if (this.player.exp + amount >= this.player.next) {
        this.player.level++;
        this.player.exp = 0;
        // another compounding exp formula, this time EXP is equal to all the player levels added up (ie. 1 + 2 + 3 + 4 etc.)
        var tempnext = 1;
        for (var i = 0; i < this.player.level; i++) {
          tempnext += i;
        }
        this.player.next = tempnext;
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
      Object.keys(self.player.perks).map(function (perk, i) {
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
    startGame: function () {
      this.startup = false;
      this.startLoop();
      this.$forceUpdate();
    },
    startLoop: function () {
      console.log('starting Loop');
      var self = this;
      if (this.constants.loopspeed > 0) {
        this.interval.game = setInterval(function () {
          self.loop();
        }, this.constants.loopspeed);
      }
      this.interval.save = setInterval(function () {
        self.save();
      }, 60000);
    },
    loop: function () {
      if (this.startup) {
        return;
      }
      if (this.player.zone.length > 0) {
        this.quest();
      }
      this.calculateQuests();
      this.checkPerks();
    },
    endLoop: function () {
      console.log('ending Loop');
      clearInterval(this.interval.game);
      clearInterval(this.interval.save);
    },
    save: function () {
      localStorage.setItem('jobs_player_save', JSON.stringify(this.player));
      localStorage.setItem('jobs_stats_save', JSON.stringify(this.stats));
      localStorage.setItem('jobs_upgrade_save', JSON.stringify(this.bought));
      localStorage.setItem('jobs_graveyard_save', JSON.stringify(this.graveyard));
      console.log('game saved');
    },
    load: function () {
      var self = this;

      if (localStorage.getItem('jobs_graveyard_save') != null) {
        Object.assign(this.graveyard, JSON.parse(localStorage.getItem('jobs_graveyard_save')));
        console.log('graveyard data loaded from localstorage');
      }

      if (localStorage.getItem('jobs_player_save') != null) {
        Object.assign(this.player, JSON.parse(localStorage.getItem('jobs_player_save')));
        console.log('player data loaded from localstorage');
      } else {
        this.setDefaultPlayer()
        console.log('new player data loaded');
      }

      if (localStorage.getItem('jobs_stats_save') != null) {
        Object.assign(this.stats, JSON.parse(localStorage.getItem('jobs_stats_save')));
        console.log('stats data loaded from localstorage');
      }
      // set up the stats object based on the existing zones, jobs and player
      this.buildStats();
      if (localStorage.getItem('jobs_upgrade_save') != null) {
        this.calculatePrestige();
        var savedbought = JSON.parse(localStorage.getItem('jobs_upgrade_save'));
        if (!(savedbought.length)) {
          console.log('No upgrades found in save');
          return;
        }
        savedbought.forEach(function (name) {
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
      Object.keys(this.player.skills).map(function (skillname, i) {
        newRet.skills[skillname] = self.player.skills[skillname].level;
      });
      this.graveyard.push(newRet)
      this.calculatePrestige();
      this.calculateRates();
      this.stats.totalRetirements++;
      this.reset(newjob);
    },
    reset: function (job) {
      console.log('resetting to job:', job)
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
      this.setDefaultPlayer();
      this.multis = {},
        // sprinkle stuff into the new player data
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
    generateIcon: function (key, size, diff) {
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
    generateColor: function (diff) {
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
      Object.keys(self.zones).map(function (zonename, i) {
        if (zonename in self.stats.zones && self.stats.zones[zonename].currentCompletions > 0) {
          self.stats.zones[zonename].currentCompletions = 0;
        }
      });
      self.areas.forEach(function (area) {
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
      Object.keys(self.zones).map(function (zonename, i) {
        self.stats.zones[zonename] = {
          currentCompletions: 0,
          completions: 0,
          highest: 0,
        }
      });
      self.areas.forEach(function (area) {
        self.stats.areas[area] = {
          currentCompletions: 0,
          completions: 0,
          highest: 0,
        }
      })
      Object.keys(self.jobs).map(function (jobname, i) {
        self.stats.jobs[jobname] = {
          highest: 0,
          total: 0,
          retirements: 0,
        }
      });
      console.log(self.jobs, self.player)
      if ('skills' in self.player) {
        Object.keys(self.player.skills).map(function (skillname, i) {
          self.stats.skills[skillname] = {
            total: 0,
            highest: 0,
          }
        });
      }

    },
  }
}
</script>

<script setup>

import Sidebar from './components/Sidebar.vue'
import Main from './components/Main.vue'
import Footer from './components/Footer.vue'
</script>

<template>
  <div class="container" style="min-height: 100vh;">
    <div class="row" v-if="startup">
      <div class="col-xs-12 col-sm-6" v-if="graveyard.length > 1">
        Welcome back.
        <button @click="startGame()">
          Resume Your Quest
        </button>
      </div>
      <div class="col-xs-12 col-sm-6" v-if="graveyard.length <= 1">
        All great journeys start with humble beginnings.
        <button @click="startGame()">
          Start Your Quest
        </button>
      </div>
    </div>
    <div class="row" v-else>
      <Sidebar />
      <Main />
      <Footer />
    </div>
  </div>
</template>

<style>
</style>
