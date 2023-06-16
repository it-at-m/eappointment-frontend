import mutations from './../../../../src/store/modules/formData/mutations'

describe('Form data mutations', () => {
    const state = {}

    it('increaseAppointmentCount handle increase of appointment count', async () => {
        state.appointmentCounts = {
            1: 2
        }
        state.appointmentCount = 2

        state.servicesById = {
            1: {
                id: 1,
                name: 'Service 1',
                maxQuantity: 4
            }
        }

        mutations.increaseAppointmentCount(state, 1)

        expect(state.appointmentCounts[1]).toBe(3)
        expect(state.appointmentCount).toBe(3)
    })

    it('increaseAppointmentCount could not increase appointment count because it hits maximum count', async () => {
        state.appointmentCounts = {
            1: 2
        }
        state.appointmentCount = 2

        state.servicesById = {
            1: {
                id: 1,
                name: 'Service 1',
                maxQuantity: 2
            }
        }

        mutations.increaseAppointmentCount(state, 1)

        expect(state.appointmentCounts[1]).toBe(2)
        expect(state.appointmentCount).toBe(2)
    })

    it('decreaseAppointmentCount handle decrease of appointment count', async () => {
        state.appointmentCounts = {
            1: 2
        }
        state.appointmentCount = 2

        state.service = {
            maxQuantity: 4
        }

        mutations.decreaseAppointmentCount(state, 1)

        expect(state.appointmentCounts[1]).toBe(1)
        expect(state.appointmentCount).toBe(1)
    })

    it('decreaseAppointmentCount could not decrease appointment count because it is already zero', async () => {
        state.appointmentCounts = {
            1: 0
        }
        state.appointmentCount = 0

        state.service = {
            maxQuantity: 2
        }

        mutations.decreaseAppointmentCount(state, 1)

        expect(state.appointmentCounts[1]).toBe(0)
        expect(state.appointmentCount).toBe(0)
    })

    it('reset method sets default values', async () => {
        const state = {
            service: {
                id: 1,
                name: 'Service',
                maxQuantity: 2
            },
            appointment: {
                authKey: 'aaa',
                processId: 'bbb'
            },
            appointmentCounts: {
                1: 2
            },
            appointmentCount: 2
        }

        mutations.reset(state)

        expect(state).toStrictEqual({
            service: null,
            appointment: null,
            appointmentCounts: {},
            appointmentCount: 1
        })
    })

    it('setService reset service if null is provided', async () => {
        const state = {
            service: {
                id: 1,
                name: 'Service',
                maxQuantity: 2,
                combinable: []
            },
            appointment: {
                authKey: 'aaa',
                processId: 'bbb'
            },
            appointmentCounts: {
                1: 2
            },
            appointmentCount: 2
        }

        mutations.setService(state, null)

        expect(state.appointmentCounts).toStrictEqual({})
        expect(state.appointmentCount).toBe(1)
        expect(state.service).toBeNull()
    })

    it('setService sets service in store', async () => {
        const state = {
            service: {
                id: 1,
                name: 'Service',
                maxQuantity: 3,
                combinable: [
                    2,
                    3
                ]
            },
            appointment: {
                authKey: 'aaa',
                processId: 'bbb'
            },
            appointmentCounts: {
                1: 3
            },
            appointmentCount: 3
        }

        mutations.setService(state, {
            id: 1,
            name: 'Service 1',
            count: 2,
            combinable: [
                1,
                2,
                3
            ],
            subServiceCounts: {
                2: 1
            }
        })

        expect(state.appointmentCounts).toStrictEqual({
            1: 2,
            2: 1,
            3: 0
        })
        expect(state.appointmentCount).toBe(2)
        expect(state.service).toStrictEqual({
            id: 1,
            name: 'Service 1',
            count: 2,
            combinable: [
                2,
                3
            ],
            subServiceCounts: {
                2: 1
            },
            subServices: [
                {
                    id: 2,
                    count: 1
                },
                {
                    id: 3,
                    count: 0
                }
            ]
        })
    })

    it('setAppointment sets appointment in store', async () => {
        state.appointment = {
            authKey: 'aaa',
            processId: 'bbb'
        }

        mutations.setAppointment(state, {
            authKey: 'zzz',
            processId: 'xxx'
        })

        expect(state.appointment).toStrictEqual({
            authKey: 'zzz',
            processId: 'xxx'
        })
    })

    it('setCustomerData sets customer data in store', async () => {
        state.customer = {}

        mutations.setCustomerData(state, {
            name: 'Max',
            email: 'max@gmail.com',
            dataProtection: true
        })

        expect(state.customer).toStrictEqual({
            name: 'Max',
            email: 'max@gmail.com',
            dataProtection: true
        })
    })
})