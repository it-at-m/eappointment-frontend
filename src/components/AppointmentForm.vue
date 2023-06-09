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
              {{ $t('yourAppointmentNumber') }}: <b>{{ $store.state.preselectedAppointment.processId }}</b>
            </div>
            <v-alert
                v-if="$store.state.errorCode || $store.state.errorMessage"
                border="right"
                color="red"
                dark
            >
              {{ $store.state.errorMessage ? $store.state.errorMessage : $t($store.state.errorCode) }}
            </v-alert>

            <v-expansion-panels
                v-model="$store.state.openedPanel"
                accordion
            >
              <v-expansion-panel
                  id="panel1"
                  :disabled="confirmedAppointment || $store.state.isRebooking"
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
                  <ServiceFinder @next="openPanel(2)" @changed="openPanel(1)" />
                </v-expansion-panel-content>
              </v-expansion-panel>

              <v-expansion-panel
                  id="panel2"
                  :disabled="$store.state.step < 2
                    || ! $store.state.data.service
                    || $store.state.data.appointmentCount === 0
                    || this.confirmedAppointment
                  "
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
                  id="panel3"
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
                            <span v-if="$store.state.data.customer.name">
                              <b>{{ $store.state.data.customer.name }} ({{ $store.state.data.customer.email }})</b>
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
              <span v-if="appointmentCanBeConfirmed">
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
                >{{ $store.state.isRebooking ? $t('rebookAppointment') : $t('confirmAppointment') }}</v-btn>
              </span>

              <span v-if="appointmentCanBeStartedOver">
                <v-dialog
                    v-model="starOverDialog"
                    persistent
                    max-width="290"
                >
                  <template v-slot:activator="{ on, attrs }">
                    <v-btn
                        v-if="!$store.state.isRebooking"
                        class="button-submit"
                        elevation="2"
                        depressed
                        color="primary"
                        v-bind="attrs"
                        v-on="on"
                    >{{ $t('cancel') }}</v-btn>
                  </template>
                  <v-card>
                    <div class="popup-content">
                      {{ $t('wantToStartOverAppointment') }}
                    </div>
                    <v-card-actions>
                      <v-spacer></v-spacer>
                      <v-btn
                          color="primary"
                          text
                          @click="startOver"
                      >
                        {{ $t('yes') }}
                      </v-btn>
                      <v-btn
                          color="green"
                          text
                          @click="starOverDialog = false"
                      >
                        {{ $t('no') }}
                      </v-btn>
                    </v-card-actions>
                  </v-card>
                </v-dialog>
              </span>

              <v-alert
                  class="appointment-confirmation"
                  v-if="!appointmentCancelled && confirmedAppointment !== null && $store.state.preselectedAppointment === null && $store.state.data.appointment !== null"
                  :color="confirmedAppointment ? $store.state.settings.theme.success : $store.state.settings.theme.error"
              >
                {{ confirmedAppointment ? $t('appointmentIsPreconfirmed') : $t('errorTryAgainLater') }}
              </v-alert>

              <v-alert
                  class="appointment-activated"
                  v-if="activatedAppointment && !appointmentCancelled"
                  :color="$store.state.settings.theme.success"
              >
                {{ $t('appointmentIsConfirmed') }}
              </v-alert>

              <v-alert
                  class="appointment-confirmation-notice"
                  v-if="!appointmentCancelled && confirmedAppointment !== null && $store.state.preselectedAppointment === null && $store.state.data.appointment !== null"
                  :color="confirmedAppointment ? $store.state.settings.theme.notice : $store.state.settings.theme.error"
              >
                {{ confirmedAppointment ? $t('appointmentPreconfirmedNotice') : $t('errorTryAgainLater') }}
              </v-alert>

              <v-alert
                  class="appointment-cancel"
                  v-if="appointmentCancelled !== null"
                  :color="appointmentCancelled ? $store.state.settings.theme.success : $store.state.settings.theme.error"
              >
                {{ appointmentCancelled ? $t('appointmentCanceled') : $t('appointmentCanNotBeCanceled') }}
              </v-alert>

              <v-btn
                  v-if="$store.state.isRebooking"
                  class="button-submit"
                  elevation="2"
                  depressed
                  color="primary"
                  @click="stopRebooking"
              >{{ $t('cancel') }}</v-btn>

              <div v-if="$store.state.preselectedAppointment !== null && $store.state.errorMessage === null && !$store.state.isRebooking">
                <v-dialog
                    v-model="rebookDialog"
                    persistent
                    max-width="290"
                >
                  <template v-slot:activator="{ on, attrs }">
                    <v-btn
                        v-if="appointmentCancelled === null && $store.state.errorCode !== 'appointmentCanNotBeCanceled'"
                        class="button-submit"
                        elevation="2"
                        depressed
                        color="primary"
                        v-bind="attrs"
                        v-on="on"
                    >{{ $t('rebookAppointment') }}</v-btn>
                  </template>
                  <v-card>
                    <div class="popup-content">
                      {{ $t('wantToRebookAppointment') }}
                    </div>
                    <v-card-actions>
                      <v-spacer></v-spacer>
                      <v-btn
                          color="primary"
                          text
                          @click="startRebooking"
                      >
                        {{ $t('yes') }}
                      </v-btn>
                      <v-btn
                          color="green"
                          text
                          @click="rebookDialog = false"
                      >
                        {{ $t('no') }}
                      </v-btn>
                    </v-card-actions>
                  </v-card>
                </v-dialog>

                <v-dialog
                    v-model="cancelDialog"
                    persistent
                    max-width="290"
                >
                  <template v-slot:activator="{ on, attrs }">
                    <v-btn
                        v-if="appointmentCancelled === null && $store.state.errorCode !== 'appointmentCanNotBeCanceled'"
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
                          color="primary"
                          text
                          @click="cancelAppointment"
                      >
                        {{ $t('yes') }}
                      </v-btn>
                      <v-btn
                          color="green"
                          text
                          @click="cancelDialog = false"
                      >
                        {{ $t('no') }}
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
import Calendar from './Calendar.vue'
import CustomerInfo from './CustomerInfo.vue'
import moment from "moment";

export default {
  name: 'AppointmentForm',
  components: {
    SwitchLanguage,
    ServiceFinder,
    Calendar,
    CustomerInfo
  },
  data: () => ({
    rebookDialog: false,
    cancelDialog: false,
    starOverDialog: false,
    appointmentCancelled: null
  }),
  computed: {
    appointmentCanBeConfirmed() {
      return this.$store.state.step === 4 && this.confirmedAppointment === null
    },
    appointmentCanBeStartedOver() {
      return this.$store.state.step === 4 && this.confirmedAppointment === null
    },
    confirmedAppointment() {
      return this.$store.state.confirmedAppointment
    },
    activatedAppointment() {
      return this.$store.state.activatedAppointment
    }
  },
  methods: {
    cancelAppointment(byRebooking = false) {
      if (this.$store.state.preselectedAppointment.dateFrom.unix() < moment().unix()) {
        this.$store.state.errorCode = 'appointmentCanNotBeCanceled'
        return
      }

      this.cancelDialog = false;

      this.$store.dispatch('API/cancelAppointment', this.$store.state.preselectedAppointment)
          .then(() => {
            this.$store.commit('preselectAppointment', null)
            this.appointmentCancelled = byRebooking === true ? null : true

            if (byRebooking) {
              this.$store.state.isRebooking = false
            }
          }, () => {
            this.appointmentCancelled = false
          })
    },
    startRebooking() {
      this.rebookDialog = false

      if (this.$store.state.preselectedAppointment.dateFrom.unix() < moment().unix()) {
        this.$store.state.errorCode = 'appointmentCanNotBeCanceled'
        return
      }

      this.$store.dispatch('startRebooking')
    },
    stopRebooking() {
      this.$store.dispatch('stopRebooking')
    },
    startOver() {
      this.$store.commit('data/setCustomerData', {})
      this.$store.commit('preselectAppointment', null)
      this.$store.commit('data/setAppointment', null)
      this.$store.commit('data/setService', null)
      this.$store.state.confirmedAppointment = null
      this.starOverDialog = false

      this.openPanel(1)
    },
    submit() {
      this.desabled = true
      this.$store.dispatch('API/preconfirmReservation', this.$store.state.data.appointment)
          .then(() => {
            if (this.$store.state.isRebooking) {
              this.cancelAppointment(true)
            }
          })
          .then(() => {
            this.$store.state.confirmedAppointment = true
          }, () => {
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

      services.push(this.$store.state.data.appointmentCounts[this.$store.state.data.service.id] + ' x ' + this.$store.state.servicesById[this.$store.state.data.service.id].name)

      this.$store.state.data.service.subServices.forEach((subService) => {
        if (this.$store.state.data.appointmentCounts[subService.id]) {
          services.push(this.$store.state.data.appointmentCounts[subService.id] + ' x ' + this.$store.state.servicesById[subService.id].name)
        }
      })

      return services.join(', ')
    },
    getSelectedAppointment() {
      const appointment = this.$store.state.data.appointment

      if (!appointment) {
        return ''
      }

      return moment.unix(appointment.timestamp).format('DD.MM.YYYY H:mm') + ' ' + this.getProviderName(appointment.locationId)
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
      this.$store.commit('selectServiceWithId', { id: id })
      this.openPanel(1)
      this.$store.state.confirmedAppointment = null
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

.button-submit {
  margin-right: 1rem;
  margin-top: 1rem;
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
