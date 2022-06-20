<script setup>
</script>

<template>
<div>
    <div id="messages">
      <div v-for="(message, name, index) in messages" v-if="message.visible">
        <span style="background-color:grey; padding: 5px" v-html="generateIcon(message.type)"></span>{{message.text}}
        <a class="closeButton" @click="message.visible = false">X</a>
      </div>
    </div>
    <div id="debug" style="font-size: 10px;" v-if="debug">
      <hr>
      <button @click="reset()">Reset</button>
      <button @click="player.level++">LVL+</button>
      <button @click="player.level--">LVL-</button>
      <button @click="completeQuest()">COMPLETE</button>
      <button @click="logData()">LogData()</button>
      <button @click="message('testing', 'general')">Test message</button>
      <hr>messages: {{messages}}
      <hr>multis: {{multis}}
      <hr>displayMultis: {{displayMultis}}
      <hr>player: {{player}}
      <hr>perks: {{perks}}
      <hr>bought: {{bought}}
    </div>
</div>
</template>

<style scoped>

</style>
