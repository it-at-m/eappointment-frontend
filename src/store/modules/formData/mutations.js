export default {
    increaseAppointmentCount (state, serviceId) {
        if (state.appointmentCounts[serviceId] < state.service.maxQuantity)
        {
            state.appointmentCounts[serviceId]++
            state.appointmentCount++
        }
    },
    decreaseAppointmentCount (state, serviceId) {
        if (state.appointmentCounts[serviceId] > 0) {
            state.appointmentCounts[serviceId]--
            state.appointmentCount--
        }
    },
    // eslint-disable-next-line no-unused-vars
    reset (state) {
        // eslint-disable-next-line no-unused-vars
        state = {
            service: null,
            appointment: null,
            appointmentCounts: {},
            appointmentCount: 1
        }
    },
    setService (state, service) {
        state.appointmentCounts = {}
        state.appointmentCount = service.count !== undefined ? service.count : 1

        if (! service) {
            state.service = service
            return
        }

        if (! service.subServices) {
            service.subServices = [
                {
                    'id': service.id,
                    'name': service.name,
                    'count': service.count
                }
            ]
        }

        service.subServices.forEach((service) => {
            state.appointmentCounts[service.id] = service.count !== undefined ? service.count : 1
        })

        state.service = service
    },
    setAppointment (state, appointment) {
        state.appointment = appointment
    },
    setCustomerData (state, customer) {
        state.customer.name = customer ? customer.name : null
        state.customer.email = customer ? customer.email : null
        state.customer.dataProtection = customer ? customer.dataProtection : null
    }
}