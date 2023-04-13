import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import './assets/main.css'
import { createPinia } from 'pinia';
import { indexedDbPlugin } from './idb-store';

const app = createApp(App);
const pinia = createPinia();
pinia.use(indexedDbPlugin);

app.use(router)
app.use(pinia);

app.mount('#app')