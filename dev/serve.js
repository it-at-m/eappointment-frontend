import Vue from 'vue'
import App from '@/components/AppointmentForm'
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
    { path: '/services/:serviceId/locations/:locationId', component: App},
    { path: '/services/:serviceId', component: App},
    { path: '/appointment/:appointmentHash', component: App},
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

      if (this.$route.params.appointmentHash) {
        this.$store.state.openedPanel = 3
        this.$store.state.confirmedAppointment = true
      }

      this.$store.dispatch('setUpServicesAndProviders', {
        preselectedService: this.$route.params.serviceId,
        preselectedProvider: this.$route.params.locationId
      }).then(() => {
        if (this.$route.params.appointmentHash) {
          this.$store.dispatch('setUpAppointment', {
            appointmentHash: this.$route.params.appointmentHash
          })
        }
      })
  }
})
