import { createRouter, createWebHistory } from 'vue-router'
import HomePage from '@/pages/HomePage.vue'
import PlannerPage from '@/pages/PlannerPage.vue'
import FlightsPage from '@/pages/FlightsPage.vue'
import AccommodationsPage from '@/pages/AccommodationsPage.vue'
import AttractionsPage from '@/pages/AttractionsPage.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomePage,
    },
    {
      path: '/planner',
      name: 'planner',
      component: PlannerPage,
    },
    {
      path: '/flights',
      name: 'flights',
      component: FlightsPage,
    },
    {
      path: '/accommodations',
      name: 'accommodations',
      component: AccommodationsPage,
    },
    {
      path: '/attractions',
      name: 'attractions',
      component: AttractionsPage,
    },
  ],
})

export default router
