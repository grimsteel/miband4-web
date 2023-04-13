import { createRouter, createWebHistory } from 'vue-router'
import HomeView from './views/HomeView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
    },
    {
      path: '/about',
      name: 'about',
      // route level code-splitting
      // this generates a separate chunk (About.[hash].js) for this route
      // which is lazy-loaded when the route is visited.
      component: () => import('./views/AboutView.vue'),
      meta: {
        title: "About"
      }
    }
  ]
});

router.beforeEach((to, _from, next) => {
  document.title = to.meta.title ? `${to.meta.title} - Mi Band 4 Web` : `Mi Band 4 Web`;
  next();
});

export default router
