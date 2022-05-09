import Vue from 'vue'
import App from './serve.vue'
import Vuetify from 'vuetify'
import VueI18n from 'vue-i18n'
import translations from './../src/translations'
import VueRouter from 'vue-router'
import store from './../src/store/index'

Vue.use(VueI18n)
Vue.use(Vuetify)
Vue.use(VueRouter)

const i18n = new VueI18n({
  locale: store.state.locale,
  messages: translations,
})

Vue.config.productionTip = false

const router = new VueRouter({
  routes: [
    { path: '/services/:id', component: App},
  ]
});

new Vue({
  el: '#app',
  store: store,
  i18n,
  router,
  render: h => h(App),
  vuetify: new Vuetify({
    icons: {
      iconfont: 'mdiSvg'
    }
  }),
  mounted () {

    this.$store.dispatch('API/getSettings')
      .then(data => {
        this.$store.commit('setSettings', data.settings)
        this.$vuetify.theme.themes.light = data.settings.theme
      })

      this.$store.dispatch('setUpServicesAndProviders', this.$route.params.id)
  }
}).$mount('#app')
