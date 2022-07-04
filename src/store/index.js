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
        preselectedProvider: null,
        preselectedAppointment: null,
        providers: [],
        error: null,
        settings: {
            theme: {
                primary: '#ff9900',
                secondary: '#b0bec5',
                accent: '#8c9eff',
                success: '#90D19C',
                error: '#b71c1c',
            }
        }
    },
    actions: {
        updateAppointmentData(store, appointment) {
            let storedAppointment = store.state.data.appointment.data

            storedAppointment.clients[0].familyName = appointment.client.firstName + ' ' + appointment.client.lastName
            storedAppointment.clients[0].email = appointment.client.email

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
                        store.commit('setProviders', data.providers)

                        let requests = data.requests.map(request => {
                            request.providers = []
                            data.requestrelation.forEach(relation => {
                                if (relation.request.id === request.id) {
                                    const foundProvider = data.providers.filter(provider => {
                                        return provider.id === relation.provider.id
                                    })[0]

                                    foundProvider.name = foundProvider.data.displayName
                                        ? foundProvider.data.displayName
                                        : foundProvider.name
                                    relation.provider.name = foundProvider.name
                                    relation.provider.slots = relation.slots

                                    request.providers.push(relation.provider)
                                }
                            })

                            request.maxQuantity = request.data.maxQuantity ? request.data.maxQuantity : 1
                            delete request.data

                            return request
                        })
                        store.commit('setServices', requests)

                        if (typeof preselectedService !== undefined) {
                            store.commit('data/reset')
                            store.commit('selectServiceWithId', preselectedService)
                        }

                        store.commit('selectProviderWithId', preselectedProvider)

                        resolve()
                    })
            })
        },
        setUpAppointment(store, { appointmentHash }) {
            let appointmentData = null

            try {
                appointmentData = JSON.parse(window.atob(appointmentHash))

                if (typeof appointmentData.id === undefined || typeof appointmentData.authKey === undefined) {
                    store.state.error = 'appointmentDoesntExist'
                    return
                }
            } catch (error) {
                store.state.error = 'appointmentDoesntExist'
                return
            }

            store.dispatch('API/fetchAppointment', { processId: appointmentData.id, authKey: appointmentData.authKey })
                .then(data => {
                    if (!data) {
                        store.state.error = 'appointmentDoesntExist'
                        return
                    }

                    store.commit('selectServiceWithId', data.requests[0].id)
                    store.commit('selectProviderWithId', data.scope.provider.id)

                    const appointment = {
                        dateFrom: moment.unix(data.appointments[0].date),
                        locationId: data.scope.provider.id,
                        scopeId: data.scope.id,
                        location: data.scope.provider.name,
                        id: appointmentData.id,
                        authKey: appointmentData.authKey
                    }

                    const customer = {
                        firstName: data.clients[0].familyName.split(' ')[0],
                        lastName: data.clients[0].familyName.split(' ')[1],
                        email: data.clients[0].email,
                        dataProtection: true
                    }

                    store.commit('data/setCustomerData', customer)
                    store.commit('preselectAppointment', appointment)
                    store.commit('data/setAppointment', appointment)

                    if (data.appointments[0].date < moment().unix()) {
                        store.state.error = 'appointmentCanNotBeCanceled'
                    }
                })
        }
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
        selectServiceWithId (state, id) {
            state.services.forEach((service) => {
                if (service.id === id) {
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