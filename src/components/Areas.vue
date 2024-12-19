<script setup>
import store from '../js/store'
import { toRefs } from 'vue'

const { zones, areas, roads, player, icons } = toRefs(store)

// we need to calculate both the starting area for the player
// and possible areas to ttravel to. Areas are joined by roads, which are 
// tuples of (area1, area2). If two areas are joined by a road, then the player can travel between them.
// every time the player travels to a new area, 
const startingArea = player?.currentJob?.area || areas[0];
// set up layer of areas
const areaLayers = [ [startingArea] ];

const canTravel = (area) => {
  const currentArea = player?.area;
  if (!currentArea) return false;
  return roads.some(road => road.includes(currentArea) && road.includes(area));
}

const clickArea = (area) => {
  if (canTravel(area)) {
    player.area = area;
  }
}

// set up pastel background colors for areas
const backgrounds = {
  'Coast': 'bg-primary',
  'Steppes': 'bg-secondary',
  'Great Plains': 'bg-success',
}

</script>

<template>
  <div class="container">
    <template v-for="area in areas">
      <div class="card bg-light mb-4 p-4" :class="{'bg-primary': area === player?.area }">
        <div class="d-flex gap-3 justify-content-between align-items-center">
          <strong class="w-20">{{area}}</strong>
          <div class="mr-auto"></div>
          <template v-for="zone in Object.values(zones)?.filter(z => z.area === area)">
            <div class="card bg-light p-2 py-4">
              <div class="text-muted">{{zone.name}}</div>
              <div class="d-flex gap-1 justify-content-center py-2">
                <template v-for="skill in zone.skills">
                  <div class="badge bg-dark">
                    <div>
                      <i class="bi" :class="icons[skill]"></i>
                    </div>
                    <div>{{skill}}</div>
                  </div>
                </template>
              </div>
            </div>
          </template>
        </div>
      </div>
    </template> 
  </div>

</template>