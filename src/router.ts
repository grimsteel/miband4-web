import { createRouter, createWebHistory } from 'vue-router'
import HomeView from './views/HomeView.vue'
import BandsView from './views/BandsView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
    },
    {
      path: '/faq',
      name: 'faq',
      // route level code-splitting
      // this generates a separate chunk (About.[hash].js) for this route
      // which is lazy-loaded when the route is visited.
      component: () => import('./views/FAQView.vue'),
      meta: {
        title: "Frequently Asked Questions"
      }
    },
    {
      path: '/bands',
      name: 'bands',
      component: BandsView,
      meta: {
        title: "My Bands"
      }
    },
    {
      path: '/bands/add',
      name: 'add-band',
      redirect: () => ({ path: "/bands" })
    },
    {
      path: '/bands/:id',
      name: 'band-detail',
      component: () => import('./views/BandDetailView.vue'),
      meta: {
        title: "Band Detail"
      }
    },
    {
      path: '/:pathMatch(.*)*',
      name: 'not-found',
      component: () => import('./views/NotFoundView.vue'),
      meta: {
        title: "Not Found"
      }
    }
  ]
});

router.beforeEach((to, _from, next) => {
  document.title = to.meta.title ? `${to.meta.title} - Mi Band 4 Web` : `Mi Band 4 Web`;
  document.querySelector("link[rel='canonical']")?.setAttribute("href", new URL(to.path, "https://miband4.web.app").toString());
  next();
});

export default router
