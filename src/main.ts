import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import './assets/main.css'
import { createPinia } from 'pinia';
import { indexedDbPlugin } from './pinia-stores';

const app = createApp(App);
const pinia = createPinia();
// @ts-ignore
pinia.use(indexedDbPlugin);

app.use(router)
app.use(pinia);

app.mount('#app')