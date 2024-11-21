<script setup>
import store from '../js/store'
import { toRef } from 'vue'

const player = toRef(store, 'player')
const multis = toRef(store, 'multis')
const jobs = toRef(store, 'jobs')
const perks = toRef(store, 'perks')

</script>

<template>
         <div class="col" id="sidebar">
          <VMenu placement="right-end">
            <div class="d-flex justify-content-between mb-4">
                <strong>{{jobs[player.job].name}}</strong>
                <div class="">LVL: {{player.level}}</div>
                <div class="">EXP: <strong>{{player.exp}} / {{player.next}}</strong></div>
            </div>
            <template #popper>
                <div class="p-4">
                  {{ player.currentJob.description }}
                </div>
              </template>
          </VMenu>
          <div>
            <template v-for="( skill, skillname, index) in player.skills">
              <div class="mb-2">

                <div class="d-flex justify-content-between">
                  <i class="bi bi-hammer"></i>
                  <div>{{skillname}}</div>
                  <div>APT:{{player.currentJob.aptitudes?.[skillname] || 0}}</div>
                  <div>LVL:{{skill.level}}</div>
                </div>
                <div class="w-100">
                  <progress :value="skill.exp" :max="skill.next" class="w-100"> 
                    {{ skill.exp }} / {{ skill.next }} 
                  </progress>
                </div>
              </div>
            </template>
          </div>
          <hr>
          <div>
            <template v-for="( perk, perkname, index) in player.perks">
              <VMenu placement="right-end" :distance="20">
                <!-- This will be the popover target (for the events and position) -->
                <div class="d-flex justify-content-between">
                  <i class="bi bi-star"></i>
                  <div>{{perkname}}</div>
                </div>
                <!-- This will be the content of the popover -->
                <template #popper>
                  <div  class="p-4">
                    <div>
                      <strong>{{perkname}}</strong>
                    </div>
                    {{ perk.description }}
                  </div>
                </template>
              </VMenu>
            </template>
          </div>
          <!-- end col -->
        </div>
</template>

<style scoped>

</style>
