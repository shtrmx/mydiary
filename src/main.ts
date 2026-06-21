import '@/assets/index.css'

import { createApp } from 'vue'
import App from './App.vue'
import { router } from './utils/router'
import { createPinia } from "pinia"
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'

const app = createApp(App)
const pinia = createPinia().use(piniaPluginPersistedstate)

app.use(router).use(pinia)
app.mount('#app')
