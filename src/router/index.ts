import { createRouter, createWebHistory } from 'vue-router'
import { routeConfig } from '../config/routes'
import HomePageContent from '../views/Homepage.vue'
import NotFound from '../views/NotFound.vue'
import i18n from '../i18n'

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

router.beforeEach((to, from, next) => {
  if (to.name === 'homepage') {
    document.title = i18n.global.t('navigation.title')
  } else {
    document.title = i18n.global.t(`tools.${to.name}.title`)
  }
  next()
})

export default router
