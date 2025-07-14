import {
  createRouter,
  createWebHistory,
  type RouteRecordRaw,
  type NavigationGuardNext,
  type RouteLocationNormalized,
  type NavigationFailure,
  type RouteMeta as VueRouteMeta,
} from 'vue-router'

// Union types dla route names
type RouteName = 'home' | 'planner' | 'flights' | 'accommodations' | 'attractions'

// POPRAWKA: Custom RouteMeta interface bez konfliktów z Vue Router
interface RouteMeta {
  title: string
  description: string
  requiresAuth?: boolean
  requiresGuest?: boolean
  layout?: 'default' | 'minimal' | 'full'
  breadcrumb?: string[]
  keywords?: string[]
  canonical?: string
  noIndex?: boolean
  preloadData?: boolean
}

// Interface dla route params validation
interface RouteParams {
  [key: string]: string | number
}

// Interface dla route query validation
interface RouteQuery {
  [key: string]: string | string[] | undefined
}

// POPRAWKA: Używamy standardowego RouteRecordRaw z custom meta
type AppRouteRecord = RouteRecordRaw & {
  name: RouteName
  meta: RouteMeta
}

// Type guard dla walidacji route names
const isValidRouteName = (name: string): name is RouteName => {
  const validNames: RouteName[] = ['home', 'planner', 'flights', 'accommodations', 'attractions']
  return validNames.includes(name as RouteName)
}

// Type guard dla walidacji route params
const isValidRouteParams = (params: unknown): params is RouteParams => {
  if (!params || typeof params !== 'object') return true // Empty params are valid

  return Object.values(params as Record<string, unknown>).every(
    (value) => typeof value === 'string' || typeof value === 'number',
  )
}

// Type guard dla walidacji route query
const isValidRouteQuery = (query: unknown): query is RouteQuery => {
  if (!query || typeof query !== 'object') return true // Empty query is valid

  return Object.values(query as Record<string, unknown>).every(
    (value) =>
      value === undefined ||
      typeof value === 'string' ||
      (Array.isArray(value) && value.every((v) => typeof v === 'string')),
  )
}

// Funkcja sanityzacji route params
const sanitizeRouteParams = (params: RouteParams): RouteParams => {
  const sanitized: RouteParams = {}

  Object.entries(params).forEach(([key, value]) => {
    if (typeof value === 'string') {
      // Remove potential XSS vectors
      sanitized[key] = value.replace(/[<>'"]/g, '').trim()
    } else if (typeof value === 'number') {
      sanitized[key] = Math.max(0, Math.floor(value)) // Ensure positive integers
    }
  })

  return sanitized
}

// Funkcja generowania page title
const generatePageTitle = (routeTitle: string): string => {
  const baseTitle = 'TravelMate'
  return routeTitle === 'Strona główna' ? baseTitle : `${routeTitle} | ${baseTitle}`
}

// Funkcja ustawiania meta tags
const setPageMeta = (meta: RouteMeta): void => {
  // Title
  document.title = generatePageTitle(meta.title)

  // Meta description
  const descriptionMeta = document.querySelector('meta[name="description"]')
  if (descriptionMeta) {
    descriptionMeta.setAttribute('content', meta.description)
  } else {
    const newDescMeta = document.createElement('meta')
    newDescMeta.name = 'description'
    newDescMeta.content = meta.description
    document.head.appendChild(newDescMeta)
  }

  // Meta keywords
  if (meta.keywords && meta.keywords.length > 0) {
    const keywordsMeta = document.querySelector('meta[name="keywords"]')
    if (keywordsMeta) {
      keywordsMeta.setAttribute('content', meta.keywords.join(', '))
    } else {
      const newKeywordsMeta = document.createElement('meta')
      newKeywordsMeta.name = 'keywords'
      newKeywordsMeta.content = meta.keywords.join(', ')
      document.head.appendChild(newKeywordsMeta)
    }
  }

  // Canonical URL
  if (meta.canonical) {
    const canonicalLink = document.querySelector('link[rel="canonical"]') as HTMLLinkElement
    if (canonicalLink) {
      canonicalLink.href = meta.canonical
    } else {
      const newCanonical = document.createElement('link')
      newCanonical.rel = 'canonical'
      newCanonical.href = meta.canonical
      document.head.appendChild(newCanonical)
    }
  }

  // No-index
  if (meta.noIndex) {
    const robotsMeta = document.querySelector('meta[name="robots"]')
    if (robotsMeta) {
      robotsMeta.setAttribute('content', 'noindex, nofollow')
    } else {
      const newRobotsMeta = document.createElement('meta')
      newRobotsMeta.name = 'robots'
      newRobotsMeta.content = 'noindex, nofollow'
      document.head.appendChild(newRobotsMeta)
    }
  }
}

// Funkcja focus management dla accessibility
const manageFocus = (to: RouteLocationNormalized): void => {
  // Scroll to top
  window.scrollTo({ top: 0, behavior: 'smooth' })

  // Focus main content dla screen readers
  setTimeout(() => {
    const mainContent = document.querySelector('main, [role="main"], #main-content')
    if (mainContent && mainContent instanceof HTMLElement) {
      mainContent.focus({ preventScroll: true })

      // Announce page change dla screen readers
      const announcement = document.createElement('div')
      announcement.setAttribute('aria-live', 'polite')
      announcement.setAttribute('aria-atomic', 'true')
      announcement.className = 'sr-only'

      // POPRAWKA: Bezpieczne dostęp do meta.title
      const routeMeta = isValidRouteMeta(to.meta) ? to.meta : null
      const pageTitle = routeMeta?.title || 'Strona'
      announcement.textContent = `Załadowano stronę: ${pageTitle}`

      document.body.appendChild(announcement)

      // Remove announcement after screen reader processes it
      setTimeout(() => {
        document.body.removeChild(announcement)
      }, 1000)
    }
  }, 100)
}

// POPRAWKA: Routes configuration - używamy RouteRecordRaw z type assertion
const routes: AppRouteRecord[] = [
  {
    path: '/',
    name: 'home',
    component: () => import('@/pages/HomePage.vue'),
    meta: {
      title: 'Strona główna',
      description:
        'TravelMate - Twój przewodnik po najlepszych podróżach. Znajdź loty, noclegi i atrakcje w jednym miejscu.',
      keywords: ['podróże', 'loty', 'noclegi', 'atrakcje', 'wakacje', 'turystyka'],
      layout: 'default',
      breadcrumb: ['Strona główna'],
      preloadData: false,
    },
  },
  {
    path: '/planner',
    name: 'planner',
    component: () => import('@/pages/PlannerPage.vue'),
    meta: {
      title: 'Planer podróży',
      description:
        'Zaplanuj swoją idealną podróż z TravelMate. Twórz itineraria, dodawaj atrakcje i zarządzaj budżetem.',
      keywords: ['planer podróży', 'itinerarium', 'organizacja podróży', 'budżet podróży'],
      layout: 'default',
      breadcrumb: ['Strona główna', 'Planer podróży'],
      preloadData: true,
    },
  },
  {
    path: '/flights',
    name: 'flights',
    component: () => import('@/pages/FlightsPage.vue'),
    meta: {
      title: 'Wyszukiwanie lotów',
      description:
        'Znajdź najlepsze oferty lotów w TravelMate. Porównaj ceny, wybieraj linie lotnicze i rezerwuj bilety.',
      keywords: [
        'loty',
        'bilety lotnicze',
        'rezerwacja lotów',
        'linie lotnicze',
        'podróże lotnicze',
      ],
      layout: 'default',
      breadcrumb: ['Strona główna', 'Loty'],
      preloadData: true,
    },
  },
  {
    path: '/accommodations',
    name: 'accommodations',
    component: () => import('@/pages/AccommodationsPage.vue'),
    meta: {
      title: 'Zakwaterowanie',
      description:
        'Odkryj najlepsze noclegi z TravelMate. Hotele, apartamenty, pensjonaty - znajdź idealne miejsce na pobyt.',
      keywords: [
        'noclegi',
        'hotele',
        'apartamenty',
        'pensjonaty',
        'rezerwacja noclegów',
        'zakwaterowanie',
      ],
      layout: 'default',
      breadcrumb: ['Strona główna', 'Noclegi'],
      preloadData: true,
    },
  },
  {
    path: '/attractions',
    name: 'attractions',
    component: () => import('@/pages/AttractionsPage.vue'),
    meta: {
      title: 'Atrakcje turystyczne',
      description:
        'Poznaj najciekawsze atrakcje z TravelMate. Muzea, zabytki, parki rozrywki i lokalne perełki.',
      keywords: ['atrakcje', 'zabytki', 'muzea', 'turystyka', 'zwiedzanie', 'kultura'],
      layout: 'default',
      breadcrumb: ['Strona główna', 'Atrakcje'],
      preloadData: true,
    },
  },
]

// Router instance z proper configuration
const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  // POPRAWKA: Type assertion dla kompatybilności z Vue Router
  routes: routes as RouteRecordRaw[],
  scrollBehavior(to, from, savedPosition) {
    // Restore saved position dla back/forward
    if (savedPosition) {
      return savedPosition
    }

    // Smooth scroll to hash
    if (to.hash) {
      return {
        el: to.hash,
        behavior: 'smooth',
      }
    }

    // Scroll to top dla nowych routes
    return { top: 0, behavior: 'smooth' }
  },
})

// Global navigation guards z typowaniem
router.beforeEach(
  async (
    to: RouteLocationNormalized,
    from: RouteLocationNormalized,
    next: NavigationGuardNext,
  ): Promise<void> => {
    try {
      // Walidacja route name
      if (to.name && !isValidRouteName(to.name as string)) {
        console.warn('Router: Nieprawidłowa nazwa route:', to.name)
        next({ name: 'home', replace: true })
        return
      }

      // Walidacja params i query
      if (!isValidRouteParams(to.params) || !isValidRouteQuery(to.query)) {
        console.warn('Router: Nieprawidłowe parametry route:', {
          params: to.params,
          query: to.query,
        })
        next({ name: 'home', replace: true })
        return
      }

      // POPRAWKA: Sanityzacja params - użyj prawidłowej składni dla next()
      if (Object.keys(to.params).length > 0) {
        const sanitizedParams = sanitizeRouteParams(to.params as RouteParams)
        if (JSON.stringify(sanitizedParams) !== JSON.stringify(to.params)) {
          // POPRAWKA: Użyj path zamiast spread operator
          next({
            name: to.name as RouteName,
            params: sanitizedParams,
            query: to.query,
            replace: true,
          })
          return
        }
      }

      // POPRAWKA: Bezpieczne castowanie meta properties
      const routeMeta = isValidRouteMeta(to.meta) ? to.meta : null

      // Auth guards (jeśli wymagane w przyszłości)
      if (routeMeta?.requiresAuth) {
        // TODO: Implementacja sprawdzania autoryzacji
        console.info('Router: Route wymaga autoryzacji:', to.name)
      }

      if (routeMeta?.requiresGuest) {
        // TODO: Implementacja sprawdzania czy user nie jest zalogowany
        console.info('Router: Route wymaga braku autoryzacji:', to.name)
      }

      // Preload data jeśli wymagane
      if (routeMeta?.preloadData && import.meta.env.PROD) {
        // TODO: Implementacja preloadingu danych
        console.info('Router: Preloading data dla route:', to.name)
      }

      next()
    } catch (error) {
      console.error('Router: Błąd w navigation guard:', error)
      next({ name: 'home', replace: true })
    }
  },
)

router.afterEach((to: RouteLocationNormalized, from: RouteLocationNormalized): void => {
  try {
    // POPRAWKA: Bezpieczne type casting dla meta
    if (to.meta && isValidRouteMeta(to.meta)) {
      setPageMeta(to.meta)
    }

    // Focus management
    manageFocus(to)

    // Analytics tracking (jeśli używane)
    if (import.meta.env.PROD && to.name !== from.name) {
      // TODO: Implementacja analytics tracking
      console.info('Router: Page view tracked:', to.name)
    }

    // Clear any loading states
    const loadingElements = document.querySelectorAll('[data-loading="true"]')
    loadingElements.forEach((el) => {
      el.removeAttribute('data-loading')
    })
  } catch (error) {
    console.error('Router: Błąd w afterEach hook:', error)
  }
})

// Error handling dla route errors
router.onError((error: Error): void => {
  console.error('Router: Navigation error:', error)

  // TODO: Implementacja error reporting
  if (import.meta.env.PROD) {
    // Report to error tracking service
  }

  // Fallback navigation
  router.push({ name: 'home' }).catch((err) => {
    console.error('Router: Fallback navigation failed:', err)
  })
})

// POPRAWKA: Helper functions dla typed navigation z właściwymi typami return
export const navigateToRoute = (
  name: RouteName,
  params?: RouteParams,
  query?: RouteQuery,
): Promise<void | NavigationFailure | undefined> => {
  if (!isValidRouteName(name)) {
    throw new Error(`Invalid route name: ${name}`)
  }

  const routeLocation: {
    name: RouteName
    params?: RouteParams
    query?: RouteQuery
  } = { name }

  if (params && isValidRouteParams(params)) {
    routeLocation.params = sanitizeRouteParams(params)
  }

  if (query && isValidRouteQuery(query)) {
    routeLocation.query = query
  }

  return router.push(routeLocation)
}

// POPRAWKA: Helper dla getting current route meta z bezpiecznym typowaniem
export const getCurrentRouteMeta = (): RouteMeta | null => {
  const meta = router.currentRoute.value.meta
  return isValidRouteMeta(meta) ? meta : null
}

// Helper dla checking if route exists
export const routeExists = (name: RouteName): boolean => {
  return router.hasRoute(name)
}

// POPRAWKA: Type guard dla sprawdzania czy meta ma wymagane pola
export const isValidRouteMeta = (meta: unknown): meta is RouteMeta => {
  return (
    typeof meta === 'object' &&
    meta !== null &&
    'title' in meta &&
    'description' in meta &&
    typeof (meta as any).title === 'string' &&
    typeof (meta as any).description === 'string'
  )
}

// Type exports dla użycia w komponentach
export type { RouteName, RouteMeta, RouteParams, RouteQuery }

// Walidacja route configuration przy developmencie
if (import.meta.env.DEV) {
  // Sprawdzenie czy wszystkie routes mają wymagane meta fields
  routes.forEach((route, index) => {
    if (!route.meta.title) {
      console.warn(`Router: Brak title w meta dla route ${index}:`, route.name)
    }

    if (!route.meta.description) {
      console.warn(`Router: Brak description w meta dla route ${index}:`, route.name)
    }

    if (!route.meta.breadcrumb || route.meta.breadcrumb.length === 0) {
      console.warn(`Router: Brak breadcrumb w meta dla route ${index}:`, route.name)
    }
  })

  // Sprawdzenie unikalności route names
  const routeNames = routes.map((route) => route.name)
  const duplicateNames = routeNames.filter((name, index) => routeNames.indexOf(name) !== index)
  if (duplicateNames.length > 0) {
    console.error('Router: Znaleziono duplikaty nazw routes:', duplicateNames)
  }

  console.info('Router: Załadowano', routes.length, 'routes z proper typing')
}

export default router
