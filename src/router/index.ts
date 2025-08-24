import { createRouter, createWebHistory } from 'vue-router'
import { routeConfig } from '../config/routes'
import HomePageContent from '../views/Homepage.vue'
import NotFound from '../views/NotFound.vue'

// Flatten the routeConfig to get all individual tool routes
const flattenRoutes = routeConfig.flatMap(
  (category) =>
    category.children?.map((child) => ({
      ...child,
      path: `/${category.path}/${child.path}`,
    })) || [],
)

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'landing',
      children: [
        {
          path: '',
          name: 'homepage',
          component: HomePageContent,
        },
        // Include all tool routes from the configuration
        ...flattenRoutes,
      ],
    },
    // 404 catch-all route
    {
      path: '/:pathMatch(.*)*',
      name: 'not-found',
      component: NotFound,
    },
  ],
})

export default router
