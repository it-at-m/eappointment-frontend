import actions from './actions.js'

export default {
    namespaced: true,
    state: {
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
            'VUE_APP_SETTINGS_ENDPOINT': '/mocks/settings.json'
        }
    },
    actions,
    mutations: {},
    getters: {}
}