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
            appointmentCount: 0
        }
    },
    setService (state, service) {
        if (! service) {
            return
        }

        state.appointmentCounts = {}
        state.appointmentCount = 0

        if (! service.subServices) {
            service.subServices = [
                {
                    'id': service.id,
                    'name': service.name
                }
            ]
        }

        service.subServices.forEach((service) => {
            state.appointmentCounts[service.id] = 0
        })

        state.service = service
    },
    setAppointment (state, appointment) {
        state.appointment = appointment
    }
}