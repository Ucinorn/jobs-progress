<script setup>

</script>

<template>
      <div class="col">
          <div class="row" v-if="Object.keys(player.currentZone ).length != 0">
            <div class="col-5 row no-gutters">
              <div class="col-7">
                <h6><span style="padding: 5px" v-html="generateIcon(player.currentZone.type)"></span>&nbsp;{{player.zone}}</h6>
              </div>
              <div class="col-5">
                <!--<button style="float: right; width: 90px;" @click="boostUp()" v-bind:disabled="boost.count > 0">Boost <span v-if="'Boosted' in multis">{{Number((multis.Boosted.val).toFixed(2))}}</span></button>-->
                <button v-if="!player.currentZone.finished" v-bind:disabled="player.currentZone.finished" @click="quest(player.zone)">Quest</button>
                <button  v-if="player.currentZone.finished" v-bind:disabled="completingcount > 0" @click="completeQuest(player.zone)">Complete</button>
              </div>
              <div class="col-12">
                <div>
                  Progress: {{player.currentZone.current}} / {{player.currentZone.max}} <strong>{{player.currentZone.rates.total}}</strong> per tick | CC: {{completingcount}}
                </div>
                <div class="progress">
                  <div v-bind:style="{width: player.currentZone.progress + '%'}" v-bind:aria-valuenow="player.currentZone.progress" class="progress-bar" role="progressbar" aria-valuemin="0" aria-valuemax="100">
                    {{player.currentZone.progress}}%
                  </div>
                </div>
              </div>
            </div>
            <div class="col-7 row no-gutters">
              <template v-for="(skill, name, index) in player.currentZone.skills">
               <div class="col-4"> 
                <span style="width:20px; display: inline-block" v-html="generateIcon(name)"></span>{{name}}
               </div>
               <div class="col-4 tool">
                {{Number((player.currentZone.rates[name] - skill).toFixed(2))}} per tick
                 <div class="tooltiptext">
                <div v-for="(multi, multiname, index) in multis" v-if="multi.type == 'progress' && multi.skill == name"> {{multiname}}: {{Math.round(multi.val * 100)}}%</div>
                <div v-for="(multi, multiname, index) in multis" v-if="multi.type == 'progress' && multi.skill == 'all'"> {{multiname}}: {{Math.round(multi.val * 100)}}%</div>
                   <hr>
                    = {{player.currentZone.rates[name]}} - {{skill}}
                 </div>
               </div>
               <div class="col-4" style="text-align: right;">EXP Multi: {{Math.round(player.currentZone.difficulty[name] * 100)}}%</div>
             </template>
            </div>
          </div>
          <hr>
          <!-- menu -->
          <div class="row" id="menu">
            <div class="col"><button class='btn btn-block' @click="view = 'world'" v-bind:disabled="view == 'world'">WORLD</button></div>
            <div class="col"><button class='btn btn-block' @click="view = 'jobs'" v-bind:disabled="view == 'jobs'">JOBS</button></div>
            <div class="col"><button class='btn btn-block' @click="view = 'upgrades'" v-bind:disabled="view == 'upgrades' || prestige.total < 1">UPGRADES</button></div>
            <div class="col"><button class='btn btn-block' @click="view = 'stats'" v-bind:disabled="view == 'stats' || prestige.total < 1">HALL OF HEROES</button></div>
            <div class="col-12">
              <hr>
            </div>
          </div>
          <!-- world -->
          <div class="row" v-if="view == 'world'">
            <!--area selector -->
            <div class="col-3"><strong>AREAS</strong></div>
            <div class="col-9"><strong>ZONES</strong></div>
            <div class="col-12">
              <hr>
            </div>
            <div class="col-3" id="areas">
              <div v-for="area in areas">
                <button class="btn btn-block" @click="player.area = area" v-bind:disabled="player.area === area">
                  {{area}}
                </button>
                <hr>
              </div>
            </div>
            <!-- zone selector -->
            <div class="col-9 " id="zones" v-if="Object.keys(player.currentZone ).length != 0">
                <div v-for="(zone, name, index) in zones" v-if="zone.area === player.area && zone.unlocked">
                   <div class="col zone row justify-content-start" v-bind:class="{ negative: zone.rates.total <= 0, active: name === player.zone }" @click="player.zone = name">
                    <div class="col-3">
                      {{name}} <br> ( <span v-if="zone.rates.total  > 0 ">+</span>{{zone.rates.total}} ) <br> q: {{zone.quests}}
                    </div>
                    <div class="col-9">
                      <div class="skillSquare" v-for="(skill, skillname, skillindex) in zone.skills">
                        <span v-html="generateIcon(skillname, 1, zone.difficulty[skillname])"></span><span>{{skill}}</span>
                      </div>
                    </div>
                    <div class="col-12" >
                      <div class="progress" style="height: 3px;">
                        <div v-bind:style="{width: zone.progress + '%'}" v-bind:aria-valuenow="zone.progress" class="progress-bar" role="progressbar" aria-valuemin="0" aria-valuemax="100">
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              <hr>
              <div class="row">
                <template v-for="(zone, name, index) in zones" v-if="zone.area === player.area && !zone.unlocked">
                 <div class="col-4" v-bind:class="{ locked: !zone.unlocked }">
                   <div class="zoneBox tool">
                     <i class="fa fa-lock" aria-hidden="true"></i> {{name}}
                     <div class="tooltiptext">
                       {{zone.hint}}
                     </div>
                   </div>
                </div>
              </template>
              </div>
            </div>
          </div>
          <!-- jobs -->
          <div class="row align-items-start" v-if="view == 'jobs'">
            <div class="col-8 row justify-content-start">
              <template v-for="(job, key, index) in jobs" v-if="job.unlocked">
                <div class="col-4" v-bind:class="{'active': (chosenJob == key)}" @click="chosenJob = key">
                  <div class="zoneBox">{{job.name}}</div>
                </div>
              </template>
              <div class="col-12">
                <hr>
              </div>
              <template v-for="(job, key, index) in jobs" v-if="!job.unlocked">
                <div class="col-4" @click="chosenJob = key">
                  <div class="zoneBox locked"><i class="fa fa-lock" aria-hidden="true"></i>&nbsp;{{job.name}}</div>
                </div>
              </template>
            </div>
            <div class="col-4 zoneBox" v-if="chosenJob in jobs && jobs[chosenJob].unlocked">
              <h3>{{jobs[chosenJob].name}}</h3>
              <div>{{jobs[chosenJob].description}}</div>
              <hr>
              <div v-if="prestige.next > 0">
                Retiring this character to the Hall of Heroes will recieve {{prestige.next}} ancestry points.
              </div>
              <div v-if="prestige.confirm === chosenJob">
                <div class="alert alert-danger" role="alert" v-if="prestige.next == 0">
                  <strong>Warning!</strong>
                  <hr>Reach <strong>level 10</strong> to have your character recorded in the Hall of Heroes<br> Starting a new life now will not earn you any ancestry points or count towards unlocks.
                  <hr> Are you sure you want to start a new game with this job?<br>
                  <button @click="reset(chosenJob)">Yes I'm sure. </button>
                </div>
                <div v-else>
                  Are you sure you want to retire this character to the Hall of Heroes?<br>
                  <button @click="reincarnate(chosenJob)">Yes I'm sure. </button>
                </div>
              </div>
              <button v-if="prestige.confirm != chosenJob" @click="prestige.confirm = chosenJob">Reincarnate</button>
              <hr>
              <h6>Aptitudes (Total: {{Math.round(jobs[chosenJob].powerLevel)}})</h6>
              <div class="row">
                <div class="col-6" v-for="(apt, skill, index) in jobs[chosenJob].aptitudes">
                  <div>{{skill}} : {{apt}}</div>
                  <div style="height: 5px;" v-bind:style="{width: Math.round((apt / 5) * 100) + '%'}" v-bind:aria-valuenow="Math.round((apt / 5) * 100)" class="progress-bar col-12" role="progressbar" aria-valuemin="0" aria-valuemax="100">
                  </div>
                </div>
              </div>
              <hr>
              <h6>Perks</h6>
              <div v-for="perk in jobs[chosenJob].perks">
                <strong>{{perk}}</strong>
                <div v-if="perk in perks">{{perks[perk].description}}</div>
              </div>
            </div>
            <div class="col-4" v-if="chosenJob in jobs && !jobs[chosenJob].unlocked" style="">
              <h3>{{jobs[chosenJob].name}}</h3>
              <div>{{jobs[chosenJob].description}}</div>
              <hr>
              <strong>HINT:</strong>
              <div>{{jobs[chosenJob].hint}}</div>
            </div>
          </div>
          <!-- upgrades -->
          <div class="row justify-content-start align-items-center" v-if="view == 'upgrades'">
            <div class="col-6">Prestige Currency: {{prestige.current}} / {{prestige.total}}</div>
            <div class="col-6">Earned Next Reset: {{prestige.next}}</div>
            <div class="col-12">
              <hr>
            </div>
            <div class="col-3">
              <strong>Upgrades</strong>
            </div>
            <div class="col-3" v-for="(up, name, index) in upgrades" v-if="up.unlocked && !(bought.includes(name)) && up.type != 'perk'">
              <div class="tool zoneBox" >
                <div>{{name}} ({{up.cost}} P)</div>
                <button @click="buy(name)" :disabled="up.cost >= prestige.current ? true : false">
                  Buy
                </button>
                <div class="tooltiptext">{{up.description}}</div>
              </div>
            </div>
            <div class="col-12"><hr></div>
            <div class="col-3">
              <strong>Perk Upgrades</strong>
            </div>
            <div class="col-3" v-for="(up, name, index) in upgrades" v-if="up.unlocked && !(bought.includes(name)) && up.type == 'perk'">
              <div class="tool zoneBox" >
                <div>{{name}} ({{up.cost}} P)</div>
                <button @click="buy(name)" :disabled="up.cost >= prestige.current ? true : false">
                  Buy
                </button>
                <div class="tooltiptext">{{up.description}}</div>
              </div>
            </div>
            <hr>
            <div class="col-12"><strong>BOUGHT UPGRADES</strong>
              <hr>
            </div>
            <div class="col-3" v-for="name in bought" v-if="name in upgrades">
              <div class="tool zoneBox">
                <div>{{name}} ({{upgrades[name].cost}} P)</div>
                <div class="tooltiptext">{{upgrades[name].description}}</div>
              </div>
            </div>
          </div>
          <!-- stats -->
          <div class="row" v-if="view == 'stats'">
            <div class="col-12 row" v-if="graveyard.length > 0">
              <div class="col-12"><strong>HALL OF HEROES</strong></div>
              <div class="col-12">
                <hr>
              </div>
              <div class="col-4"><strong>Level</strong></div>
              <div class="col-4"><strong>Zone</strong></div>
              <div class="col-4"><strong>Job</strong></div>
              <div class="col-12">
                <hr>
              </div>
              <template v-for="ret in graveyard">
                <div class="col-4">{{ret.level}}</div>
                <div class="col-4">{{ret.zone}}</div>
                <div class="col-4">{{ret.job}}</div>
              </template>
            </div>
            <div class="col-12"><strong>STATS</strong></div>
            <div class="col-6 row">
              <div class="col-12">
                <hr>
              </div>
              <div class="col-5"><strong>Zones</strong></div>
              <div class="col-4"><strong>Total Complete</strong></div>
              <div class="col-3"><strong>Highest Reached</strong></div>
              <div class="col-12">
                <hr>
              </div>
              <template v-for="(zone, name, index) in stats.zones">
                <div class="col-5">{{name}}</div>
                <div class="col-4">{{zone.completions}}</div>
                <div class="col-3">{{zone.highest}}</div>
              </template>
            </div>
          </div>
        </div>
</template>

<style scoped>

</style>
