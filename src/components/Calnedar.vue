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
              v-if="$store.state.data.service && $store.state.data.service.providers.length > 0"
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
          && currentDate < this.maxDate
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
      this.timeSlots = []
      const momentDate = moment(date, 'YYYY-MM-DD')

      this.$store.dispatch('API/fetchAvailableTimeSlots', { date: momentDate, provider: {...this.provider, slots: 1}, count: this.$store.state.data.appointmentCount, serviceId: this.$store.state.data.service.id })
          .then(timeSlots => {
            this.timeSlots = timeSlots

            if (this.timeSlots.length === 0) {
              this.selectableDates = this.selectableDates.filter(selectableDate => {
                return selectableDate !== date
              })

              this.dateError = true

              return
            }

            this.timeSlots = this.timeSlots.map((time) => moment.unix(time))

            console.log(this.timeSlots)

            this.timeDialog = true
          })
    },
    chooseAppointment: function(timeSlot) {
      this.timeSlotError = false

      if (this.$store.state.data.appointment && ! this.$store.state.isRebooking) {
        this.$store.dispatch('API/cancelAppointment', { appointmentData: this.$store.state.data.appointment })
      }

      this.$store.dispatch('API/reserveAppointment', { timeSlot, count: this.$store.state.data.appointmentCount, serviceId: this.$store.state.data.service.id, providerId: this.provider.id })
          .then(data => {
            const appointment = data
            appointment.provider = this.provider
            appointment.officeName = this.provider.name

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
          .then(dates => {
            this.$store.commit('setAvailableDays', dates)
            this.selectableDates = dates

            this.timeSlotError = false
          })
    }
  },
  mounted: function() {
    if (this.$store.state.preselectedProvider) {
      this.show(this.$store.state.preselectedProvider)

      return
    }

    if (this.$store.state.data.service) {
      this.show(this.$store.state.data.service.providers[0])
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