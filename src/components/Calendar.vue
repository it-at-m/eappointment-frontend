<template>
  <v-app class="calendar-container">
    <v-container>
      <v-row>
        <v-col
          class="col-sm-12 col-lg-2 pl-0"
        >
          {{ $t('location') }}:
        </v-col>
        <v-col
            class="col-sm-12 col-lg-10 p-0"
        >
          <v-tabs
              v-if="$store.state.data.service && $store.state.data.service.providers.length > 0"
              color="primary"
              show-arrows="mobile"
              id="location-tabs"
              ref="locationTabs"
          >
            <v-tab
                v-for="provider in $store.state.data.service.providers"
                v-if="shouldShowProvider(provider)"
                :key="provider.id + provider.name"
                @change="showForProvider(provider)"
            >
              {{ provider.name }}
            </v-tab>

            <v-tab-item
                v-for="provider in $store.state.data.service.providers"
                :key="provider.id"
            >
            </v-tab-item>
          </v-tabs>
        </v-col>
      </v-row>
    </v-container>

    <v-date-picker
        full-width
        v-model="date"
        :allowed-dates="allowedDates"
        class="mt-0"
        :min="currentDate"
        :first-day-of-week="1"
        :locale="$i18n.locale"
        @click:date="getAppointmentsOfDay(date)"
    ></v-date-picker>

    <v-alert
        v-if="dateError"
        :color="$store.state.settings.theme.error"
    >
      {{ dateError }}
    </v-alert>

    <v-dialog
        v-model="timeDialog"
        activator="parent"
        width="500"
    >
      <v-card>
        <v-card-title class="text-h5 grey lighten-2">
          {{ $t('choseOneAppointment', { date: formatDay(date) }) }}
        </v-card-title>

        <v-card-text>
          <v-alert
              v-if="timeSlotError"
              :color="$store.state.settings.theme.error"
          >
            {{ timeSlotError }}
          </v-alert>

          <div
              class="select-appointment"
              v-for="timeSlot in timeSlots" :key="timeSlot.unix()"
              @click="chooseAppointment(timeSlot)"
          >
            {{ timeSlot.format('H:mm') }}
          </div>
        </v-card-text>

        <v-divider></v-divider>

        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn
              color="primary"
              text
              @click="timeDialog = false"
          >
            {{ $t('cancel') }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-app>
</template>
<script>
import moment from 'moment'
import { mdiCalendarClock } from '@mdi/js';

export default {
  name: 'Calendar',
  data: () => ({
    date: moment().format("YYYY-MM-DD"),
    currentDate: moment().format("YYYY-MM-DD"),
    maxDate: moment().add(6, 'M'),
    selectableDates: [],
    calendarSvg: mdiCalendarClock,
    timeDialog: false,
    timeSlots: [],
    timeSlotError: false,
    dateError: false,
    provider: null,
    missingSlotsInARow: false
  }),
  methods: {
    formatDay: function(date) {
      return moment(date).format('DD.MM.YYYY')
    },
    allowedDates: function(val) {
      const currentDate = moment(val, 'YYYY-MM-DD')
      return currentDate < this.maxDate
          && this.selectableDates.includes(currentDate.format('YYYY-MM-DD'))
    },
    shouldShowProvider: function(provider) {
      if (!this.$store.state.preselectedProvider) {
        return true
      }

      return provider.id === this.$store.state.preselectedProvider.id
    },
    getAppointmentsOfDay: function(date) {
      this.timeSlotError = false
      this.dateError = false
      this.timeDialog = false
      this.timeSlots = []
      const momentDate = moment(date, 'YYYY-MM-DD')
      const selectedServices = {}

      Object.keys(this.$store.state.data.appointmentCounts).forEach((serviceId) => {
        if (this.$store.state.data.appointmentCounts[serviceId] > 0) {
          selectedServices[serviceId] = this.$store.state.data.appointmentCounts[serviceId]
        }
      })

      this.$store.dispatch('API/fetchAvailableTimeSlots', { date: momentDate, provider: {...this.provider, slots: 1}, serviceIds: Object.keys(selectedServices), serviceCounts: Object.values(selectedServices) })
          .then(data => {
            if (data.errorMessage) {
              this.selectableDates = this.selectableDates.filter(selectableDate => {
                return selectableDate !== date
              })

              this.dateError = data.errorMessage

              return
            }

            if (data.appointmentTimestamps) {
              this.timeSlots = data.appointmentTimestamps
            }

            this.timeSlots = this.timeSlots.map((time) => moment.unix(time))

            this.timeDialog = true
          })
    },
    chooseAppointment: function(timeSlot) {
      this.timeSlotError = false
      const selectedServices = {}

      Object.keys(this.$store.state.data.appointmentCounts).forEach((serviceId) => {
        if (this.$store.state.data.appointmentCounts[serviceId] > 0) {
          selectedServices[serviceId] = this.$store.state.data.appointmentCounts[serviceId]
        }
      })

      this.$store.dispatch('API/reserveAppointment', { timeSlot, serviceIds: Object.keys(selectedServices), serviceCounts: Object.values(selectedServices), providerId: this.provider.id })
          .then(data => {
            if (data.errorMessage) {
              this.timeSlotError = data.errorMessage
              return
            }

            const appointment = data
            appointment.provider = this.provider
            appointment.officeName = this.provider.name
            appointment.locationId = appointment.officeId

            this.$store.commit('data/setAppointment', appointment)
            this.timeDialog = false
            this.$emit('next')
          }, () => {
            this.timeSlotError = this.$t('appointmentNotAvailable')
          })

      if (! this.timeSlotError && this.$store.state.data.appointment && ! this.$store.state.isRebooking) {
        this.$store.dispatch('API/cancelAppointment', this.$store.state.data.appointment)
      }
    },
    showForProvider: function(provider) {
      this.dateError = false
      this.timeSlotError = false
      this.provider = provider
      const selectedServices = {}

      Object.keys(this.$store.state.data.appointmentCounts).forEach((serviceId) => {
        if (this.$store.state.data.appointmentCounts[serviceId] > 0) {
          selectedServices[serviceId] = this.$store.state.data.appointmentCounts[serviceId]
        }
      })

      this.$store.dispatch('API/fetchAvailableDays', { provider: provider, serviceIds: Object.keys(selectedServices), serviceCounts: Object.values(selectedServices) })
          .then(data => {
            let availableDays = data.availableDays ?? []
            if (data.errorMessage) {
              this.dateError = data.errorMessage
            }

            this.selectableDates = availableDays
          })
    }
  },
  mounted: function() {
    if (this.$store.state.preselectedProvider) {
      this.showForProvider(this.$store.state.preselectedProvider)

      return
    }

    if (this.$store.state.data.service) {
      this.showForProvider(this.$store.state.data.service.providers[0])
    }
  }
}
</script>
<style>
.calendar-container {
}
.v-btn--rounded {
  border-radius: 0.25rem;
  width: 100% !important;
}
.v-date-picker-table tbody .v-btn {
  background: #32a852;
  color: #fff;
}
.v-date-picker-table tbody .v-btn.v-btn--disabled  {
  background: #cccccc;
}
.v-card {
  text-align: center;
}
.v-card__text {
  overflow-y: scroll;
  padding: 0 !important;
  max-height: 12rem;
}
.select-appointment {
  padding: 0.5rem 0;
}

.v-picker {
  margin-top: 0 !important;
}
.select-appointment:hover {
  background: #cccccc;
}
.preselected-appointment, .select-appointment {
  cursor: pointer;
}

.v-alert {
  color: #fff !important;
  margin: 10px;
}

.p-0 {
  padding: 0;
}
</style>