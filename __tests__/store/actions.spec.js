import actions from './../../src/store/actions'
import store from './../../src/store/index'
import moment from "moment";

describe('Actions', () => {
    it('updateAppointmentData sets customer data and updates appointment', async () => {
        const commitMethods = jest.fn()
        store.dispatch = jest.fn(() => {
            return new Promise((resolve) => {
                resolve({'test': 'test'})
            })
        })
        store.commit = commitMethods
        await actions.updateAppointmentData(store, {
            authKey: 'aaa',
            processId: 'bbb',
            client: {
                name: 'Max',
                email: 'max@gmail.com'
            }
        })

        expect(commitMethods).toHaveBeenCalledTimes(2)
        expect(commitMethods.mock.calls[0]).toStrictEqual(['data/setCustomerData', {
            name: 'Max',
            email: 'max@gmail.com'
        }])
        expect(commitMethods.mock.calls[1]).toStrictEqual(['data/setAppointment', {
            authKey: 'aaa',
            processId: 'bbb',
            client: {
                name: 'Max',
                email: 'max@gmail.com'
            },
            data: {
                'test': 'test'
            },
            familyName: 'Max',
            email: 'max@gmail.com'
        }])
    })

    it('setUpServicesAndProviders sets services and providers', async () => {
        const commitMethods = jest.fn()
        const services = [
            {
                id: 1,
                name: 'Service 1'
            },
            {
                id: 2,
                name: 'Service 2'
            }
        ]

        const offices = [
            {
                id: 1,
                name: 'Office 1'
            },
            {
                id: 2,
                name: 'Office 2'
            }
        ]

        store.dispatch = jest.fn(() => {
            return new Promise((resolve) => {
                resolve({
                    services,
                    offices,
                    relations: [
                        {
                            officeId: 1,
                            serviceId: 1
                        },
                        {
                            officeId: 1,
                            serviceId: 2
                        },
                        {
                            officeId: 2,
                            serviceId: 1
                        }
                    ]
                })
            })
        })
        store.commit = commitMethods
        await actions.setUpServicesAndProviders(store, {
            preselectedProvider: null,
            preselectedService: null
        })

        expect(commitMethods).toHaveBeenCalledTimes(3)
        expect(commitMethods.mock.calls[0]).toStrictEqual(['setProviders', offices])
        expect(commitMethods.mock.calls[1]).toStrictEqual(['setServices', services])
        expect(commitMethods.mock.calls[2]).toStrictEqual(['selectProviderWithId', null])
    })

    it('setUpServicesAndProviders sets services and providers with preselections', async () => {
        const commitMethods = jest.fn()
        const services = [
            {
                id: 1,
                name: 'Service 1'
            },
            {
                id: 2,
                name: 'Service 2'
            }
        ]

        const offices = [
            {
                id: 1,
                name: 'Office 1'
            },
            {
                id: 2,
                name: 'Office 2'
            }
        ]

        store.dispatch = jest.fn(() => {
            return new Promise((resolve) => {
                resolve({
                    services,
                    offices,
                    relations: [
                        {
                            officeId: 1,
                            serviceId: 1
                        },
                        {
                            officeId: 1,
                            serviceId: 2
                        },
                        {
                            officeId: 2,
                            serviceId: 1
                        }
                    ]
                })
            })
        })
        store.commit = commitMethods
        await actions.setUpServicesAndProviders(store, {
            preselectedProvider: 1,
            preselectedService: 2
        })

        expect(commitMethods).toHaveBeenCalledTimes(5)
        expect(commitMethods.mock.calls[0]).toStrictEqual(['setProviders', offices])
        expect(commitMethods.mock.calls[1]).toStrictEqual(['setServices', services])
        expect(commitMethods.mock.calls[2]).toStrictEqual(['data/reset'])
        expect(commitMethods.mock.calls[3]).toStrictEqual(['selectServiceWithId', { id: 2 }])
        expect(commitMethods.mock.calls[4]).toStrictEqual(['selectProviderWithId', 1])
    })

    it('confirmReservation fails because of wrong appointment hash', async () => {
        await actions.confirmReservation(store, {
            appointmentHash: 'invalid hash'
        })

        expect(store.state.errorCode).toBe('appointmentDoesntExist')
    })

    it('confirmReservation calls API to confirm reservation', async () => {
        const mockMethods = jest.fn(() => {
            return new Promise((resolve) => {
                resolve({})
            })
        })
        store.dispatch = mockMethods

        const result = await actions.confirmReservation(store, {
            appointmentHash: 'eyJpZCI6IDEyMzQ1LCJhdXRoS2V5IjogImJiYmIifQ=='
        })

        expect(result).toBeTruthy()
        expect(mockMethods).toHaveBeenCalledTimes(1)
        expect(mockMethods.mock.calls[0]).toStrictEqual(['API/confirmReservation', {"processId": 12345,"authKey": "bbbb"}])
    })

    it('setUpAppointment fails because wrong appointment hash', async () => {
        await actions.setUpAppointment(store, {
            appointmentHash: 'invalid hash'
        })

        expect(store.state.errorCode).toBe('appointmentDoesntExist')
    })

    it('setUpAppointment fails because API returned no appointment', async () => {
        const mockMethods = jest.fn(() => {
            return new Promise((resolve) => {
                resolve({
                    errorMessage: 'Not valid appointment'
                })
            })
        })
        store.dispatch = mockMethods

        await actions.setUpAppointment(store, {
            appointmentHash: 'eyJpZCI6IDEyMzQ1LCJhdXRoS2V5IjogImJiYmIifQ=='
        })

        expect(store.state.errorMessage).toBe('Not valid appointment')
    })

    it('setUpAppointment fetch appointment from API and set up in store', async () => {
        const commitMethods = jest.fn()
        const mockMethods = jest.fn(() => {
            return new Promise((resolve) => {
                resolve({
                    serviceId: 1,
                    serviceCount: 2,
                    officeId: 1111,
                    officeName: 'Office name',
                    familyName: 'Max',
                    email: 'max@gmail.com',
                    timestamp: 1589373217,
                    processId: 111,
                    authKey: 'abc'
                })
            })
        })
        store.dispatch = mockMethods
        store.commit = commitMethods
        const expectedAppointment = {
            timestamp: 1589373217,
            dateFrom: moment.unix(1589373217),
            locationId: 1111,
            location: 'Office name',
            processId: 111,
            authKey: 'abc',
            serviceId: 1,
            serviceCount: 2,
            name: 'Max',
            email: 'max@gmail.com',
            dataProtection: true
        }

        await actions.setUpAppointment(store, {
            appointmentHash: 'eyJpZCI6IDEyMzQ1LCJhdXRoS2V5IjogImJiYmIifQ=='
        })

        expect(commitMethods).toHaveBeenCalledTimes(5)
        expect(commitMethods.mock.calls[0]).toStrictEqual(['selectServiceWithId', {
            id: 1,
            count: 2
        }])
        expect(commitMethods.mock.calls[1]).toStrictEqual(['selectProviderWithId', 1111])
        expect(commitMethods.mock.calls[2]).toStrictEqual(['data/setCustomerData', {
            name: 'Max',
            email: 'max@gmail.com',
            dataProtection: true
        }])
        expect(commitMethods.mock.calls[3]).toStrictEqual(['preselectAppointment', expectedAppointment])
        expect(commitMethods.mock.calls[4]).toStrictEqual(['data/setAppointment', expectedAppointment])
        expect(store.state.errorCode).toBe('appointmentCanNotBeCanceled')
    })

    it('startRebooking starts rebooking', async () => {
        await actions.startRebooking(store)

        expect(store.state.isRebooking).toBeTruthy()
        expect(store.state.preselectedProvider).toBeNull()
        expect(store.state.step).toBe(2)
        expect(store.state.openedPanel).toBe(1)
        expect(store.state.confirmedAppointment).toBeNull()
    })

    it('stopRebooking stops rebooking', async () => {
        const commitMethods = jest.fn()
        store.commit = commitMethods
        store.state.preselectedAppointment = {
            providerId: 111,
            customer: {
                name: 'Max'
            }
        }
        await actions.stopRebooking(store)

        expect(store.state.isRebooking).toBeFalsy()
        expect(store.state.step).toBe(3)
        expect(store.state.openedPanel).toBe(3)
        expect(store.state.confirmedAppointment).toBeTruthy()

        expect(commitMethods.mock.calls[0]).toStrictEqual(['selectProviderWithId', 111])
        expect(commitMethods.mock.calls[1]).toStrictEqual(['data/setCustomerData', {
            name: 'Max'
        }])
        expect(commitMethods.mock.calls[2]).toStrictEqual(['data/setAppointment', {
            providerId: 111,
            customer: {
                name: 'Max'
            }
        }])
    })


})