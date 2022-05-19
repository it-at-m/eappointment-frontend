import Vuex from 'vuex'
import Vue from "vue";
import FormData from "./modules/formData/index.js"
import Api from "./modules/api/index.js"

Vue.use(Vuex)

const store = new Vuex.Store({
    state: {
        services: [],
        locale: 'de',
        step: 1,
        preselectedProvider: null,
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
            store.dispatch('API/fetchServicesAndProviders')
                .then(data => {
                    store.commit('setProviders', data.providers)

                    let requests = data.requests.map(request => {
                        request.providers = []
                        data.requestrelation.forEach(relation => {
                            if (relation.request.id === request.id) {
                                relation.provider.name = data.providers.filter(provider => {
                                    return provider.id === relation.provider.id
                                })[0].name
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
        }
    },
    modules: {
        data: FormData,
        API: Api
    }
})

export default store;