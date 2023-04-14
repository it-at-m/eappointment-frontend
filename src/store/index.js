import Vuex from 'vuex'
import Vue from "vue";
import FormData from "./modules/formData/index.js"
import Api from "./modules/api/index.js"
import moment from "moment";

Vue.use(Vuex)

const store = new Vuex.Store({
    state: {
        services: [],
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
                'VUE_APP_SETTINGS_ENDPOINT': '/mocks/settings.json'
            }
        }
    },
    actions: {
        updateAppointmentData(store, appointment) {
            let storedAppointment = store.state.data.appointment

            storedAppointment.familyName = appointment.client.firstName + ' ' + appointment.client.lastName
            storedAppointment.email = appointment.client.email

            store.dispatch('API/updateAppointmentData', storedAppointment)
                .then((data) => {
                    appointment.data = data
                    store.commit('data/setAppointment', appointment)
                })
        },
        setUpServicesAndProviders(store, { preselectedService, preselectedProvider }) {
            return new Promise((resolve, reject) => {
                store.dispatch('API/fetchServicesAndProviders')
                    .then(data => {
                        store.commit('setProviders', data.offices)

                        let requests = data.services.map(service => {
                            service.providers = []
                            data.relations.forEach(relation => {
                                if (relation.serviceId === service.id) {
                                    const foundProvider = data.offices.filter(office => {
                                        return office.id === relation.officeId
                                    })[0]

                                    service.providers.push(foundProvider)
                                }
                            })

                            return service
                        })
                        store.commit('setServices', requests)

                        if (typeof preselectedService !== undefined) {
                            store.commit('data/reset')
                            store.commit('selectServiceWithId', { id: preselectedService })
                        }

                        store.commit('selectProviderWithId', preselectedProvider)

                        resolve()
                    })
            })
        },
        confirmReservation(store, { appointmentHash }) {
            let appointmentData = null

            try {
                appointmentData = JSON.parse(window.atob(appointmentHash))

                if (typeof appointmentData.id === undefined || typeof appointmentData.authKey === undefined) {
                    store.state.errorCode = 'appointmentDoesntExist'
                    return
                }
            } catch (error) {
                store.state.errorCode = 'appointmentDoesntExist'
                return
            }

            return new Promise((resolve, reject) => {
                store.dispatch('API/confirmReservation', { processId: appointmentData.id, authKey: appointmentData.authKey })
                    .then(data => {
                        resolve(true)
                    }, error => {
                        resolve(false)
                    })
            })
        },
        setUpAppointment(store, { appointmentHash }) {
            let appointmentData = null

            try {
                appointmentData = JSON.parse(window.atob(appointmentHash))

                if (typeof appointmentData.id === undefined || typeof appointmentData.authKey === undefined) {
                    store.state.errorCode = 'appointmentDoesntExist'
                    return
                }
            } catch (error) {
                store.state.errorCode = 'appointmentDoesntExist'
                return
            }

            store.dispatch('API/fetchAppointment', { processId: appointmentData.id, authKey: appointmentData.authKey })
                .then(data => {
                    if (data.errorMessage) {
                        store.state.errorMessage = data.errorMessage

                        return
                    }

                    store.commit('selectServiceWithId', { id: data.serviceId, count: data.serviceCount })
                    store.commit('selectProviderWithId', data.officeId)

                    const customer = {
                        firstName: data.familyName.split(' ')[0],
                        lastName: data.familyName.split(' ')[1],
                        email: data.email,
                        dataProtection: true
                    }

                    const appointment = {
                        timestamp: data.timestamp,
                        dateFrom: moment.unix(data.timestamp),
                        locationId: data.officeId,
                        location: data.officeName,
                        processId: data.processId,
                        authKey: data.authKey,
                        serviceId: data.serviceId,
                        serviceCount: data.serviceCount,
                        ...customer
                    }

                    store.commit('data/setCustomerData', customer)
                    store.commit('preselectAppointment', appointment)
                    store.commit('data/setAppointment', appointment)

                    if (data.timestamp < moment().unix()) {
                        store.state.errorCode = 'appointmentCanNotBeCanceled'
                    }
                })
        },
        startRebooking (store) {
            store.state.isRebooking = true
            store.state.preselectedProvider = null
            store.state.step = 2
            store.state.openedPanel = 1
            store.state.confirmedAppointment = null
        },
        stopRebooking (store) {
            store.state.isRebooking = false
            store.state.step = 3
            store.state.openedPanel = 3
            store.state.confirmedAppointment = true

            store.commit('selectProviderWithId', store.state.preselectedAppointment.providerId)
            store.commit('data/setCustomerData', store.state.preselectedAppointment.customer)
            store.commit('data/setAppointment', store.state.preselectedAppointment)
        },
    },
    mutations: {
        setServices (state, services) {
            state.services = services
        },
        setProviders (state, providers) {
            state.providers = providers
        },
        setSettings (state, settings) {
            state.settings = settings
        },
        goToStep(state, step) {
            state.step = step
        },
        setAvailableDays(state, days) {
            state.days = days
        },
        selectServiceWithId (state, { id, count }) {
            state.services.forEach((service) => {
                if (service.id === id) {
                    if (count) {
                        service.count = count
                    }

                    state.preselectedService = id
                    store.commit('data/setService', service)
                }
            })
        },
        selectProviderWithId (state, id) {
            state.providers.forEach((provider) => {
                if (provider.id === id) {
                    state.preselectedProvider = provider;
                }
            })
        },
        preselectAppointment(state, preselectedAppointment) {
            state.preselectedAppointment = preselectedAppointment
            state.confirmedAppointment = true
        }
    },
    modules: {
        data: FormData,
        API: Api
    }
})

export default store;