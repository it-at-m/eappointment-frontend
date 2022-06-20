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
    reset (state) {
        state = {
            service: null,
            appointment: null,
            appointmentCounts: {},
            appointmentCount: 1
        }
    },
    setService (state, service) {
        if (! service) {
            return
        }

        state.appointmentCounts = {}
        state.appointmentCount = 1

        if (! service.subServices) {
            service.subServices = [
                {
                    'id': service.id,
                    'name': service.name
                }
            ]
        }

        service.subServices.forEach((service) => {
                state.appointmentCounts[service.id] = 1
        })

        state.service = service
    },
    setAppointment (state, appointment) {
        state.appointment = appointment
    },
    setCustomerData (state, customer) {
        state.customer.firstName = customer.firstName
        state.customer.lastName = customer.lastName
        state.customer.email = customer.email
        state.customer.dataProtection = customer.dataProtection
    }
}