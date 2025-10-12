import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import i18n from './i18n'
import VueEasyLightbox from 'vue-easy-lightbox'
import './main.css'

const app = createApp(App)

app.use(router)
app.use(i18n)
app.use(VueEasyLightbox)

app.mount('#app')
