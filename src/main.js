import { createApp } from 'vue'
import App from './App.vue'
const app = createApp(App);

import FloatingVue from 'floating-vue'
import 'floating-vue/dist/style.css'


app.use(FloatingVue)

app.mount('#app')
