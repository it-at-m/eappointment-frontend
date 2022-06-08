<template>
  <div id="app">
    <v-app>
      <v-container>
        <v-row class="content">
          <v-col cols="12">
            <SwitchLanguage />
          </v-col>
        </v-row>

        <v-row class="content">
          <v-col cols="12">
            <v-expansion-panels
                v-model="openedPanel"
                accordion
            >
              <v-expansion-panel
                  :disabled="this.confirmedAppointment"
              >
                <v-expansion-panel-header>
                  <template v-slot:default="{ open }">
                    <v-row no-gutters>
                      <v-col cols="12" md="2">
                        {{ $t('services') }}
                      </v-col>
                      <v-col
                          cols="12"
                          md="10"
                          class="text--secondary"
                      >
                        <v-fade-transition leave-absolute>
                          <span
                              v-if="! open"
                              key="1"
                          >
                            {{ getSelectedServices() }}
                          </span>
                        </v-fade-transition>
                      </v-col>
                    </v-row>
                  </template>

                  {{ $t('services') }}
                </v-expansion-panel-header>
                <v-expansion-panel-content>
                  <ServiceFinder @next="openPanel(2)" @changed="openPanel(1)" :serviceId="$route.params.id" />
                </v-expansion-panel-content>
              </v-expansion-panel>

              <v-expansion-panel
                  :disabled="$store.state.step < 2 || ! $store.state.data.service || $store.state.data.appointmentCount === 0 || this.confirmedAppointment"
              >
                <v-expansion-panel-header>
                  <template v-slot:default="{ open }">
                    <v-row no-gutters>
                      <v-col cols="12" md="2">
                        {{ $t('appointment') }}
                      </v-col>
                      <v-col
                          cols="12"
                          md="10"
                          class="text--secondary"
                      >
                        <v-fade-transition leave-absolute>
                          <span
                              v-if="! open"
                              key="1"
                          >
                            {{ getSelectedAppointment() }}
                          </span>
                        </v-fade-transition>
                      </v-col>
                    </v-row>
                  </template>

                  {{ $t('appointment') }}
                </v-expansion-panel-header>
                <v-expansion-panel-content>
                  <Calendar @next="openPanel(3)" :key="$store.state.data.service && $store.state.step === 2 ? $store.state.data.service.id : 0" />
                </v-expansion-panel-content>
              </v-expansion-panel>

              <v-expansion-panel
                  :disabled="$store.state.step < 3 || this.confirmedAppointment"
              >
                <v-expansion-panel-header>
                  <template v-slot:default="{ open }">
                    <v-row no-gutters>
                      <v-col cols="12" md="2">
                        {{ $t('contactData') }}
                      </v-col>
                      <v-col
                          cols="12"
                          md="10"
                          class="text--secondary"
                      >
                        <v-fade-transition leave-absolute>
                          <span
                              v-if="! open"
                              key="1"
                          >
                            <span v-if="$store.state.data.appointment && $store.state.data.appointment.client">
                              {{ $store.state.data.appointment.client.firstName }} {{ $store.state.data.appointment.client.lastName }} ({{ $store.state.data.appointment.client.email }})
                            </span>
                          </span>
                        </v-fade-transition>
                      </v-col>
                    </v-row>
                  </template>

                  {{ $t('contactData') }}
                </v-expansion-panel-header>
                <v-expansion-panel-content>
                  <CustomerInfo @next="openPanel(4)" @changed="openPanel(3)" />
                </v-expansion-panel-content>
              </v-expansion-panel>
            </v-expansion-panels>

            <div class="confirm-action">
              <div v-if="appointmentCanBeConfirmed">
                <v-alert
                    border="right"
                    color="blue-grey"
                    dark
                >
                  {{ $t('pleaseCheckOnceAgain') }}
                </v-alert>

                <v-btn
                    class="button-submit"
                    elevation="2"
                    depressed
                    color="primary"
                    @click="submit"
                >{{ $t('confirmAppointment') }}</v-btn>
              </div>

              <v-alert
                  v-if="confirmedAppointment !== null"
                  :color="confirmedAppointment ? $store.state.settings.theme.success : $store.state.settings.theme.error"
              >
                {{ confirmedAppointment ? $t('appointmentIsConfirmed') : $t('errorTryAgainLater') }}
              </v-alert>
            </div>

          </v-col>
        </v-row>
      </v-container>

    </v-app>
  </div>
</template>

<script>
import SwitchLanguage from './SwitchLanguage.vue'
import ServiceFinder from './ServiceFinder.vue'
import Calendar from './Calnedar.vue'
import CustomerInfo from './CustomerInfo.vue'

export default {
  name: 'AppointmentForm',
  components: {
    SwitchLanguage,
    ServiceFinder,
    Calendar,
    CustomerInfo
  },
  data: () => ({
    openedPanel: 0,
    confirmedAppointment: null
  }),
  computed: {
    appointmentCanBeConfirmed() {
      return this.$store.state.step === 4 && this.confirmedAppointment === null
    }
  },
  methods: {
    submit() {
      this.$store.dispatch('API/confirmReservation', { appointmentData: this.$store.state.data.appointment.data })
          .then(() => {
            this.confirmedAppointment = true
            this.$store.dispatch('API/sendConfirmationEmail', { appointmentData: this.$store.state.data.appointment.data })
          })
          .catch(() => {
            this.confirmedAppointment = false
          })
    },
    openPanel (step) {
      this.$store.commit('goToStep', step)
      this.openedPanel = step - 1
    },
    getSelectedServices() {
      let services = []

      this.$store.state.data.service.subServices.forEach((subService) => {
        if (this.$store.state.data.appointmentCounts[subService.id]) {
          services.push(this.$store.state.data.appointmentCounts[subService.id] + ' x ' + subService.name)
        }
      })

      return services.join(', ')
    },
    getSelectedAppointment() {
      const appointment = this.$store.state.data.appointment

      if (!appointment) {
        return ''
      }

      return appointment.dateFrom.format('DD.MM.YYYY H:mm') + ' ' + this.getProviderName(appointment.locationId)
    },
    getProviderName (id) {
      let providerName = ''
      this.$store.state.providers.forEach((provider) => {
        if (provider.id === id) {
          providerName = provider.name
        }
      })

      return providerName
    },
    preselectService (id) {
      this.$store.commit('data/reset')
      this.$store.commit('selectServiceWithId', id)
      this.openPanel(1)
      this.confirmedAppointment = null
    }
  },
  watch: {
    $route(to) {
      this.preselectService(to.params.serviceId)
    }
  }
}
</script>

<style scoped>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
}

.content {
  margin-top: 20px;
}

.confirm-action {
  margin-top: 2rem;
}
</style>
