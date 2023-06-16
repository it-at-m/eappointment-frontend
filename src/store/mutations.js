export default {
    setServices (state, services) {
        state.services = services

        services.forEach((service) => {
            state.servicesById[service.id] = service
        })

        state.data.servicesById = state.servicesById
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
    selectServiceWithId (state, { id, count, subServiceCounts = null }) {
        const subServiceCountsById = {}

        subServiceCounts.forEach(subService => {
            subServiceCountsById[subService.id] = subServiceCountsById.count
        })

        state.services.forEach((service) => {
            if (service.id === id) {
                if (count) {
                    service.count = count
                }

                state.preselectedService = id
                service.subServiceCounts = subServiceCounts
                this.commit('data/setService', service)
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
}