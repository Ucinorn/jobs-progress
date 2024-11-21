<script setup>
import store from '../js/store'
import { toRef } from 'vue'

const messages = toRef(store, 'messages')
</script>

<template>
<div>
    <div id="messages">
      <template v-for="(message, name, index) in messages">
        <div v-if="message.visible">
          <span style="background-color:grey; padding: 5px" v-html="generateIcon(message.type)"></span>{{message.text}}
          <a class="closeButton" @click="message.visible = false">X</a>
        </div>
      </template>
    </div>
</div>
</template>

<style scoped>

</style>
