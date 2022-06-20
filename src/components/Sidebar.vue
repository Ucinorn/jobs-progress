<script setup>

</script>

<template>
         <div class="col" id="sidebar">
          <h4>JOB LEGACY</h4>
          <hr>
          <div class="row align-items-right">
              <div class="col-auto">Lvl {{player.level}} <strong>{{jobs[player.job].name}}</strong></div>
              <div class="col">EXP: <strong>{{player.exp}} / {{player.next}}</strong></div>
          </div>
          <hr>
            <div class="row align-items-right no-gutters">
            <div class="col-2"></div>
            <div class="col-4" style="text-align: center"><strong>SKILL</strong></div>
            <div class="col-3" style="text-align: right"><strong>LVL</strong></div>
            <div class="col-3" style="text-align: right"><strong>APT</strong></div>
          </div>
          <div class="row no-gutters align-items-center tool statline" v-for="(skill, name, index) in player.skills" v-bind:class="{ current: skill.rate > 0 }">
            <div class="tooltiptext">
              <div><strong>APT:   {{Number(player.currentJob.defaultAptitudes[name]).toFixed(2)}} + {{Number(player.currentJob.aptitudes[name] - player.currentJob.defaultAptitudes[name]).toFixed(2)}} </strong> </div>
              <div v-for="(multi, multiname, index) in multis" v-if="multi.type == 'apt' && multi.skill == name"> {{multiname}}: {{Math.round(multi.val * 100)}}%</div>
              <div v-for="(multi, multiname, index) in multis" v-if="multi.type == 'apt' && multi.skill == 'all'"> {{multiname}}: {{Math.round(multi.val * 100)}}%</div>
              <div><strong>Total: {{Math.round(player.currentJob.multis[name] * 100)}}%</strong></div>
              <hr>
              <div><strong>EXP:  {{skill.exp}} / {{skill.next}} </strong> </div>
              <div v-for="(multi, multiname, index) in multis" v-if="multi.type == 'exp' && multi.skill == name"> {{multiname}}: {{Math.round(multi.val * 100)}}%</div>
              <div v-for="(multi, multiname, index) in multis" v-if="multi.type == 'exp' && multi.skill == 'all'"> {{multiname}}: {{Math.round(multi.val * 100)}}%</div>
              <div><strong>Total: {{Math.round(skill.multi * 100)}}%</strong></div>
            </div>
            <div class="col-2">
              <span class="skillSquare" style="width: 100%;" v-html="generateIcon(name, 1)"></span>
            </div>
            <div class="col-5">
              <span>&nbsp;{{name}}</span>
            </div>
            <div class="col-3">
              {{skill.level}}
              <sup v-if="skill.rate > 0">+ {{skill.rate}}</sup>
            </div>
            <div class="col-2" style="text-align: right">
              {{Number(player.currentJob.aptitudes[name]).toFixed(1)}}
            </div>
            <div class="col-12 progress" style="text-align: center;">
              <div style="height: 1px;" v-bind:style="{width: skill.progress + '%'}" v-bind:aria-valuenow="skill.progress" class="progress-bar" role="progressbar" aria-valuemin="0" aria-valuemax="100">
              </div>
            </div>
          </div>
          <hr>        
          <div class="row no-gutters align-items-center">
            <div class="col-6" v-for="(perk, name, index) in player.perks" v-if="player.currentJob.perks.includes(name)">
              <div class="bordered tool">
                <strong>{{name}}</strong>
                <div class="tooltiptext">
                  {{perks[name].description}}
                </div>
              </div>
            </div>
          </div>
          <hr>
          <div class="row no-gutters align-items-center justify-content-center" >
            <div class="col-4 tool" v-for="(perk, name, index) in player.perks" v-if="!player.currentJob.perks.includes(name)">
              <small>{{name}}</small>
              <div class="tooltiptext">
                {{perks[name].description}}
              </div>
            </div>
          </div>
        </div>
</template>

<style scoped>

</style>
