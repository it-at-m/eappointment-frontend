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
        v-model="date"
        :allowed-dates="allowedDates"
        class="mt-0"
        :min="currentDate"
        :first-day-of-week="1"
        :locale="$i18n.locale"
        :no-title="true"
        @click:date="getAppointmentsOfDay(date)"
    ></v-date-picker>

    <v-alert
        v-if="dateError"
        :color="$store.state.settings.theme.error"
    >
      {{ dateError }}
    </v-alert>

    <div id="appointments"
      tabindex="0"
    >
      <div
          v-if="timeDialog"
          class="appointment-container"
          activator="parent"
          width="500"
      >
        <div>
          <div class="appointment-container-title">
            <h2 tabindex="0">{{ $t('availableTimes') }}</h2>
          </div>

          <div class="appointment-container-subtitle grey lighten-2">
            <h4 tabindex="0">{{ formatDay(date) }}</h4>
          </div>

          <div>
            <v-alert
                v-if="timeSlotError"
                :color="$store.state.settings.theme.error"
            >
              {{ timeSlotError }}
            </v-alert>
          </div>

          <div
              v-for="times in timeSlotsInHours()"
          >
            <div class="appointments-in-hours">
              <div class="time-hour" tabindex="0">
                {{ times[0].format('H') }}:00-{{ times[0].format('H') }}:59
              </div>
              <div
                  class="select-appointment"
                  tabindex="0"
                  v-for="timeSlot in times" :key="timeSlot.unix()"
                  v-on:keyup.enter="chooseAppointment(timeSlot)"
                  v-on:keyup.space="chooseAppointment(timeSlot)"
                  @click="chooseAppointment(timeSlot)"
              >
                {{ timeSlot.format('H:mm') }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
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
      return moment(date).locale('de').format('dddd, DD.MM.YYYY')
    },
    timeSlotsInHours: function() {
      const timesByHours = {}

      this.timeSlots.forEach((time) => {
        if (!timesByHours.hasOwnProperty(time.format('H'))) {
          timesByHours[time.format('H')] = [];
        }

        timesByHours[time.format('H')].push(time)
      })

      return timesByHours
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
    getAppointmentsOfDay: function(date, focus = true) {
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
            this.date = date

            if (focus) {
              window.location.hash = '#appointments'
            }
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

      const oldAppointment = this.$store.state.data.appointment

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

      if (! this.timeSlotError && oldAppointment && ! this.$store.state.isRebooking) {
        this.$store.dispatch('API/cancelAppointment', oldAppointment)
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

            this.getAppointmentsOfDay(availableDays[0], false)
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
  border: #1b98d5 solid 1px;
  color: #1b98d5;
  padding: 4px 6px;
  margin-right: 8px;
  margin-bottom: 8px;
  float: left;
}

.v-picker {
  margin-top: 0 !important;
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

.appointment-container {
  padding: 12px;
}

.appointment-container-title {
  padding: 12px 0;
}

.appointment-container-subtitle {
  padding: 6px;
  margin-bottom: 12px;
}

.time-hour {
  position: absolute;
  left: 12px;
  font-size: 14px;
  line-height: 34px;
}

@media only screen and (max-width: 600px) {
  .time-hour {
    font-size: 12px;
  }
}

.appointments-in-hours {
  width: 100%;
  padding-left: 22%;
  float: left;
}
</style>