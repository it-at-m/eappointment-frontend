<template>
  <div class="calendar-container">
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
              v-if="$store.state.data.service.providers.length > 1"
              color="primary"
              :show-arrows="true"
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
      {{ $t('appointmentNotAvailable') }}
    </v-alert>

    <v-dialog
        v-model="timeDialog"
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
              v-for="(timeSlot) in timeSlots" :key="timeSlot.dateFrom.unix() + timeSlot.locationId"
              @click="chooseAppointment(timeSlot)"
          >
            {{ timeSlot.dateFrom.format('H:mm') }}
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
  </div>
</template>
<script>
import moment from 'moment'
import { mdiCalendarClock } from '@mdi/js';

export default {
  name: 'Calendar',
  data: () => ({
    date: moment().format("YYYY-MM-DD"),
    currentDate: moment().format("YYYY-MM-DD"),
    maxDate: moment().add(3, 'M'),
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
    showForProvider: function(provider) {
      this.show(provider)
    },
    formatDay: function(date) {
      return moment(date).format('DD.MM.YYYY')
    },
    allowedDates: function(val) {
      const currentDate = moment(val, 'YYYY-MM-DD')
      return currentDate.day() !== 0
          && currentDate.day() !== 6
          && currentDate < moment().add(3, 'M')
          && this.selectableDates.includes(currentDate.format('YYYY-MM-DD'))
    },
    shouldShowProvider: function(provider) {
      if (!this.$store.state.preselectedProvider) {
        return true
      }

      return provider.id === this.$store.state.preselectedProvider.id
    },
    filterTimeSlots: function(timeSlots) {
      const now = moment().unix()
      const slots = this.provider.slots
      const appointmentCount = this.$store.state.data.appointmentCount
      let times = []

      timeSlots = timeSlots.filter((date) => {
        if (times.includes(parseInt(date.appointments[0].date))
            || moment.unix(date.appointments[0].date) < now) {
          return false
        }

        times.push(parseInt(date.appointments[0].date))

        return true
      })
          .map((date) => {
            return {
              dateFrom: moment.unix(date.appointments[0].date),
              locationId: date.scope.provider.id,
              scopeId: date.scope.id,
              location: date.scope.provider.name
            }
          })

      const minDuration = this.timeSlotDuration(times)

      let slotOffset = 0
      if (slots > 1) {
        slotOffset = appointmentCount - 1
      }

      return timeSlots.filter((timeSlot) => {
        for (let timeDiff = timeSlot.dateFrom.unix(); timeDiff < timeSlot.dateFrom.unix() + (appointmentCount + slotOffset) * minDuration; timeDiff = timeDiff + minDuration) {
          if (! times.includes(timeDiff)) {
            this.missingSlotsInARow = true
            return false
          }
        }

        return true
      })
    },
    getAppointmentsOfDay: function(date) {
      this.timeSlotError = false
      this.dateError = false
      this.timeSlots = []
      const momentDate = moment(date, 'YYYY-MM-DD')

      this.$store.dispatch('API/fetchAvailableTimeSlots', { date: momentDate, provider: {...this.provider, slots: 1}, serviceId: this.$store.state.data.service.id })
          .then(timeSlots => {
            const groupedTimeSlots = {}
            this.missingSlotsInARow = false

            timeSlots.forEach(timeSlot => {
              if (typeof groupedTimeSlots[timeSlot.scope.id] === 'undefined') {
                groupedTimeSlots[timeSlot.scope.id] = []
              }

              groupedTimeSlots[timeSlot.scope.id].push(timeSlot)
            })

            for (const [key, value] of Object.entries(groupedTimeSlots)) {
              this.timeSlots = this.timeSlots.concat(this.filterTimeSlots(groupedTimeSlots[key]))
            }

            if (this.timeSlots.length === 0) {
              this.selectableDates = this.selectableDates.filter(selectableDate => {
                return selectableDate !== date
              })

              if (this.missingSlotsInARow) {
                this.timeSlotError = this.$t('missingSlotInARow')
                this.timeDialog = true
                return
              }

              this.dateError = true

              return
            }

            this.timeSlots.sort((a,b) => (a.dateFrom > b.dateFrom) ? 1 : ((b.dateFrom > a.dateFrom) ? -1 : 0))

            this.timeDialog = true
          })
    },
    timeSlotDuration: function(times) {
      let minDuration = 10000000
      let lastTimeSlot = null

      times.forEach((time) => {
        if (lastTimeSlot !== null) {
          minDuration = Math.min(minDuration, time - lastTimeSlot)
        }

        lastTimeSlot = time
      })

      return minDuration
    },
    chooseAppointment: function(appointment) {
      this.timeSlotError = false

      if (typeof this.$store.state.data.appointment?.data !== 'undefined') {
        this.$store.dispatch('API/deleteAppointment', this.$store.state.data.appointment.data)
      }

      this.$store.dispatch('API/reserveAppointment', { appointment, count: this.$store.state.data.appointmentCount, serviceId: this.$store.state.data.service.id })
          .then(data => {
            appointment.data = data

            this.$store.commit('data/setAppointment', appointment)
            this.timeDialog = false
            this.$emit('next')
          }, error => {
            if (error.exception.includes('ProcessReserveFailed')) {
              this.timeSlotError = this.$t('appointmentNotAvailable')
            }
          })
    },
    show: function(provider) {
      this.provider = provider
      this.$store.dispatch('API/fetchAvailableDays', { provider: provider, serviceId: this.$store.state.data.service.id })
          .then(data => {
            let days = data.days.filter((day) => {
              return day.status === 'bookable'
                  && parseInt(day.freeAppointments.public) >= this.$store.state.data.appointmentCount
            })
            this.$store.commit('setAvailableDays', days)
            this.selectableDates = days.map((date) => {
              return date.year + '-' + date.month + '-' + date.day
            })

            this.timeSlotError = false
          })
    }
  },
  mounted: function() {
    if (this.$store.state.preselectedProvider) {
      this.show(this.$store.state.preselectedProvider)

      return
    }

    this.show(this.$store.state.data.service.providers[0])
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