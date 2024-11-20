<script setup>
import store from '../js/store'
import { toRefs } from 'vue'

const { player, multis, jobs, perks } = toRefs(store)

</script>

<template>
  <div class="col-xs-12 col-sm-6">
    <h1>Select Your Job</h1>
    <div class="row">
      <template v-for="(job, name, index) in jobs">
        <div class="col-xs-6 col-sm-4">
          <div class="card">
            <div class="card-body">
              <icon></icon>
            </div>
            <button :disabled="!job.unlocked" @click="$emit('selectJob', job.name)">{{job.name}}</button>
          </div>
        </div>
      </template>
    </div>
  </div>
</template>