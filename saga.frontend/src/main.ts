import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { createAuth0 } from '@auth0/auth0-vue'
import App from './App.vue'
import router from './router'
import { i18n } from './i18n'
import { isDevMode } from './composables/useDevAuth'
import './assets/index.css'

const app = createApp(App)

app.use(createPinia())
app.use(router)
app.use(i18n)

// Skip Auth0 plugin on localhost dev — uses dev auth bypass instead
if (!isDevMode()) {
  app.use(
    createAuth0({
      domain: import.meta.env.VITE_AUTH0_DOMAIN,
      clientId: import.meta.env.VITE_AUTH0_CLIENT_ID,
      authorizationParams: {
        redirect_uri: window.location.origin,
        audience: import.meta.env.VITE_AUTH0_API_IDENTIFIER,
      },
    })
  )
}

app.mount('#app')
