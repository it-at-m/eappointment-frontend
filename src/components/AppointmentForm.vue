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

            <div class="appointment-number" v-if="$store.state.preselectedAppointment">
              {{ $t('yourAppointmentNumber') }}: <b>{{ $store.state.preselectedAppointment.id }}</b>
            </div>
            <v-alert
                v-if="$store.state.error"
                border="right"
                color="red"
                dark
            >
              {{ $t($store.state.error) }}
            </v-alert>

            <v-expansion-panels
                v-model="$store.state.openedPanel"
                accordion
            >
              <v-expansion-panel
                  :disabled="confirmedAppointment"
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
                            <b>{{ getSelectedServices() }}</b>
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
                            <b>{{ getSelectedAppointment() }}</b>
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
                            <span v-if="$store.state.data.customer.firstName">
                              <b>{{ $store.state.data.customer.firstName }} {{ $store.state.data.customer.lastName }} ({{ $store.state.data.customer.email }})</b>
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
                  class="appointment-confirmation"
                  v-if="confirmedAppointment !== null && $store.state.preselectedAppointment === null"
                  :color="confirmedAppointment ? $store.state.settings.theme.success : $store.state.settings.theme.error"
              >
                {{ confirmedAppointment ? $t('appointmentIsConfirmed') : $t('errorTryAgainLater') }}
              </v-alert>

              <v-alert
                  class="appointment-cancel"
                  v-if="appointmentCancelled !== null"
                  :color="appointmentCancelled ? $store.state.settings.theme.success : $store.state.settings.theme.error"
              >
                {{ appointmentCancelled ? $t('appointmentCanceled') : $t('appointmentCanNotBeCanceled') }}
              </v-alert>

              <div v-if="$store.state.preselectedAppointment !== null && $store.state.error === null">
                <v-dialog
                    v-model="cancelDialog"
                    persistent
                    max-width="290"
                >
                  <template v-slot:activator="{ on, attrs }">
                    <v-btn
                        v-if="appointmentCancelled === null"
                        class="button-submit"
                        elevation="2"
                        depressed
                        color="primary"
                        v-bind="attrs"
                        v-on="on"
                    >{{ $t('cancelAppointment') }}</v-btn>
                  </template>
                  <v-card>
                    <div class="popup-content">
                      {{ $t('wantToCancelAppointment') }}
                    </div>
                    <v-card-actions>
                      <v-spacer></v-spacer>
                      <v-btn
                          color="green"
                          text
                          @click="cancelDialog = false"
                      >
                        {{ $t('no') }}
                      </v-btn>
                      <v-btn
                          color="primary"
                          text
                          @click="cancelAppointment"
                      >
                        {{ $t('yes') }}
                      </v-btn>
                    </v-card-actions>
                  </v-card>
                </v-dialog>
              </div>
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
    cancelDialog: false,
    appointmentCancelled: null
  }),
  computed: {
    appointmentCanBeConfirmed() {
      return this.$store.state.step === 4 && this.$store.state.confirmedAppointment === null
    },
    confirmedAppointment() {
      return this.$store.state.confirmedAppointment
    }
  },
  methods: {
    cancelAppointment() {
      this.cancelDialog = false;

      this.$store.dispatch('API/cancelAppointment', { appointmentData: this.$store.state.preselectedAppointment })
          .then(() => {
            this.appointmentCancelled = true
            this.$store.dispatch('API/sendCancellationEmail', { appointmentData: this.$store.state.preselectedAppointment })
          })
          .catch(() => {
            this.appointmentCancelled = false
          })
    },
    submit() {
      this.desabled = true
      this.$store.dispatch('API/confirmReservation', { appointmentData: this.$store.state.data.appointment.data })
          .then(() => {
            this.$store.state.confirmedAppointment = true
            this.$store.dispatch('API/sendConfirmationEmail', { appointmentData: this.$store.state.data.appointment.data })
          })
          .catch(() => {
            this.desabled = false
            this.$store.state.confirmedAppointment = false
          })
    },
    openPanel (step) {
      this.$store.commit('goToStep', step)
      this.$store.state.openedPanel = step - 1
    },
    getSelectedServices() {
      let services = []

      if (! this.$store.state.data.service) {
        return ''
      }

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
      this.$store.state.confirmedAppointment = null
    },
    preselectAppointment (appointmentHash) {
      this.$store.commit('data/reset')
      this.$store.commit('setUpAppointment', { appointmentHash: appointmentHash })
      this.openPanel(3)
      this.$store.state.confirmedAppointment = true
    }
  },
  watch: {
    $route(to) {
      if (to.params.serviceId) {
        this.preselectService(to.params.serviceId)
      }

      if (to.params.appointmentHash) {
        this.preselectAppointment(to.params.appointmentHash)
      }
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

.v-alert {
  margin: 0 0 20px 0;
}

.appointment-number {
  font-size: 20px;
  padding: 10px 0;
}

.popup-content {
  font-size: 18px;
  padding: 20px;
}
</style>
