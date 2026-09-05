import './permission'
import './styles/index.scss'
import 'virtual:svg-icons-register'

import { createApp } from 'vue'

import { getConfig } from './api/app'
import App from './App.vue'
import install from './install'

const app = createApp(App)
app.use(install)
app.mount('#app')

getConfig()
