import Vuex from 'vuex'
import Vue from "vue";
import FormData from "./modules/formData/index.js"
import Api from "./modules/api/index.js"
import actions from './actions.js'
import mutations from './mutations.js'

Vue.use(Vuex)

const store = new Vuex.Store({
    state: {
        services: [],
        servicesById: {},
        locale: 'de',
        step: 1,
        openedPanel: 0,
        confirmedAppointment: null,
        activatedAppointment: null,
        isRebooking: false,
        preselectedProvider: null,
        preselectedService: null,
        preselectedAppointment: null,
        providers: [],
        error: null,
        errorMessage: null,
        settings: {
            theme: {
                primary: '#005A9F',
                secondary: '#337BB2',
                accent: '#FFE400',
                success: '#90D19C',
                error: '#B71C1C',
                notice: '#607D8B'
            },
            endpoints: {
                'VUE_APP_ZMS_API_BASE': 'http://localhost:3001',
                'VUE_APP_ZMS_API_PROVIDERS_AND_SERVICES_ENDPOINT': '/api/offices-and-services',
                'VUE_APP_ZMS_API_CALENDAR_ENDPOINT': '/api/available-days',
                'VUE_APP_ZMS_API_AVAILABLE_TIME_SLOTS_ENDPOINT': '/api/available-appointments',
                'VUE_APP_ZMS_API_RESERVE_APPOINTMENT_ENDPOINT': '/api/reserve-appointment',
                'VUE_APP_ZMS_API_APPOINTMENT_ENDPOINT': '/api/appointment',
                'VUE_APP_ZMS_API_UPDATE_APPOINTMENT_ENDPOINT': '/api/update-appointment',
                'VUE_APP_ZMS_API_CONFIRM_RESERVATION_ENDPOINT': '/api/confirm-appointment',
                'VUE_APP_ZMS_API_CANCEL_APPOINTMENT_ENDPOINT': '/api/cancel-appointment',
                'VUE_APP_ZMS_API_PRECONFIRM_RESERVATION_ENDPOINT': '/api/preconfirm-appointment'
            }
        }
    },
    actions,
    mutations,
    modules: {
        data: FormData,
        API: Api
    }
})

export default store;