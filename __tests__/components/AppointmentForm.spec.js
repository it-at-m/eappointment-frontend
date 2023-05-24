import { mount } from '@vue/test-utils'
import Vuex from 'vuex'
import AppointmentForm from './../../src/components/AppointmentForm.vue'
import Vuetify from 'vuetify'
import VueI18n from 'vue-i18n'
import translations from './../../src/translations'
import store from './../../src/store'
import Vue from 'vue'
import moment from "moment";

Vue.use(VueI18n)
Vue.use(Vuetify)
Vue.use(Vuex)

const i18n = new VueI18n({
    locale: store.state.locale,
    messages: translations,
})

const wrapper = mount(AppointmentForm, {
    Vue,
    store,
    i18n,
    vuetify: new Vuetify({
        icons: {
            iconfont: 'mdiSvg'
        }
    }),
    propsData: {}
})

describe('AppointmentForm', () => {
    it('All components are shown', async () => {
        const panel1 = wrapper.find('#panel1')
        const panel2 = wrapper.find('#panel2')
        const panel3 = wrapper.find('#panel3')

        expect(wrapper.exists()).toBe(true)

        await wrapper.vm.$nextTick()

        expect(panel1.html()).toContain('v-expansion-panel--active')
        expect(panel2.html()).not.toContain('v-expansion-panel--active')
        expect(panel3.html()).not.toContain('v-expansion-panel--active')
    })

    it('First panel is disabled', async () => {
        wrapper.vm.$store.state.confirmedAppointment = true

        await wrapper.vm.$nextTick()

        const panel1 = wrapper.find('#panel1')

        expect(panel1.html()).toContain('v-expansion-panel--disabled')

        wrapper.vm.$store.state.confirmedAppointment = false
        wrapper.vm.$store.state.isRebooking = true

        await wrapper.vm.$nextTick()

        expect(panel1.html()).toContain('v-expansion-panel--disabled')
    })

    it('Second panel is disabled', async () => {
        wrapper.vm.$store.state.step = 1

        await wrapper.vm.$nextTick()

        const panel1 = wrapper.find('#panel2')

        expect(panel1.html()).toContain('v-expansion-panel--disabled')

        wrapper.vm.$store.state.step = 2
        wrapper.vm.$store.state.service = null

        await wrapper.vm.$nextTick()

        expect(panel1.html()).toContain('v-expansion-panel--disabled')

        wrapper.vm.$store.state.step = 2
        wrapper.vm.$store.state.data.service = {}
        wrapper.vm.$store.state.data.appointmentCount = 0

        await wrapper.vm.$nextTick()

        expect(panel1.html()).toContain('v-expansion-panel--disabled')

        wrapper.vm.$store.state.step = 2
        wrapper.vm.$store.state.data.service = {}
        wrapper.vm.$store.state.data.appointmentCount = 1
        wrapper.vm.$store.state.confirmedAppointment = true

        await wrapper.vm.$nextTick()

        expect(panel1.html()).toContain('v-expansion-panel--disabled')
    })

    it('Third panel is disabled', async () => {
        wrapper.vm.$store.state.step = 2

        await wrapper.vm.$nextTick()

        const panel3 = wrapper.find('#panel3')

        expect(panel3.html()).toContain('v-expansion-panel--disabled')

        wrapper.vm.$store.state.step = 3
        wrapper.vm.$store.state.confirmedAppointment = true

        await wrapper.vm.$nextTick()

        expect(panel3.html()).toContain('v-expansion-panel--disabled')
    })

    it('Appointment number is shown', async () => {
        wrapper.vm.$store.state.preselectedAppointment = {
            processId: 'ABCDEFG'
        }

        await wrapper.vm.$nextTick()

        expect(wrapper.html()).toContain('ABCDEFG')
    })

    it('Error message is shown', async () => {
        wrapper.vm.$store.state.errorMessage = 'Ooops something went wrong'
        await wrapper.vm.$nextTick()

        expect(wrapper.html()).toContain('Ooops something went wrong')

        wrapper.vm.$store.state.errorMessage = null
        wrapper.vm.$store.state.errorCode = 'appointmentDoesntExist'
        await wrapper.vm.$nextTick()

        expect(wrapper.html()).toContain('Der Termin konnte nicht gefunden werden')
    })

    it('Show message that appointment can be confirmed', async () => {
        wrapper.vm.$store.state.step = 4
        wrapper.vm.$store.state.confirmedAppointment = null

        await wrapper.vm.$nextTick()

        expect(wrapper.vm.appointmentCanBeConfirmed).toBeTruthy()
        expect(wrapper.html()).toContain('Bitte überprüfen Sie noch einmal Ihre Daten und schließen Sie die Reservierung ab')
    })

    it('Appointment can be started over', async () => {
        wrapper.vm.$store.state.step = 4
        wrapper.vm.$store.state.confirmedAppointment = null
        wrapper.starOverDialog = true

        await wrapper.vm.$nextTick()

        expect(wrapper.vm.appointmentCanBeStartedOver).toBeTruthy()
        expect(wrapper.html()).toContain('<span class="v-btn__content">Termin umbuchen</span>')
    })

    it('confirmedAppointment return right value', async () => {
        wrapper.vm.$store.state.confirmedAppointment = true
        expect(wrapper.vm.confirmedAppointment).toBeTruthy()

        wrapper.vm.$store.state.confirmedAppointment = false
        expect(wrapper.vm.confirmedAppointment).toBeFalsy()
    })

    it('activatedAppointment return right value', async () => {
        wrapper.vm.$store.state.activatedAppointment = true
        expect(wrapper.vm.activatedAppointment).toBeTruthy()

        wrapper.vm.$store.state.activatedAppointment = false
        expect(wrapper.vm.activatedAppointment).toBeFalsy()
    })

    it('cancelAppointment is not possible if appointment time is in past', async () => {
        wrapper.vm.$store.state.preselectedAppointment = {
            dateFrom: moment().subtract(6, 'M')
        }

        wrapper.vm.cancelAppointment()
        await wrapper.vm.$nextTick()

        expect(wrapper.vm.$store.state.errorCode).toBe('appointmentCanNotBeCanceled')
    })

    it('cancelAppointment method cancels appointment', async () => {
        const commitMethods = jest.fn()
        wrapper.vm.$store.dispatch = jest.fn(() => {
            return new Promise((resolve, reject) => {
                resolve({})
            })
        })
        wrapper.vm.$store.commit = commitMethods

        wrapper.vm.$store.state.preselectedAppointment = {
            dateFrom: moment().add(6, 'M')
        }

        wrapper.vm.cancelAppointment()
        await wrapper.vm.$nextTick()

        expect(commitMethods).toHaveBeenCalledTimes(1)
        expect(commitMethods.mock.calls[0]).toStrictEqual(['preselectAppointment', null])

        expect(wrapper.vm.appointmentCancelled).toBeTruthy()
    })

    it('cancelAppointment method cancels appointment by rebooking', async () => {
        const commitMethods = jest.fn()
        wrapper.vm.$store.dispatch = jest.fn(() => {
            return new Promise((resolve, reject) => {
                resolve({})
            })
        })
        wrapper.vm.$store.commit = commitMethods

        wrapper.vm.$store.state.preselectedAppointment = {
            dateFrom: moment().add(6, 'M')
        }

        wrapper.vm.cancelAppointment(true)
        await wrapper.vm.$nextTick()

        expect(commitMethods).toHaveBeenCalledTimes(1)
        expect(commitMethods.mock.calls[0]).toStrictEqual(['preselectAppointment', null])

        expect(wrapper.vm.appointmentCancelled).toBeNull()
        expect(wrapper.vm.$store.state.isRebooking).toBeFalsy()
    })

    it('cancelAppointment method fails to cancel appointment', async () => {
        const commitMethods = jest.fn()
        wrapper.vm.$store.dispatch = jest.fn(() => {
            return new Promise((resolve, reject) => {
                reject({})
            })
        })
        wrapper.vm.$store.commit = commitMethods

        wrapper.vm.$store.state.preselectedAppointment = {
            dateFrom: moment().add(6, 'M')
        }

        wrapper.vm.cancelAppointment()
        await wrapper.vm.$nextTick()

        expect(commitMethods).toHaveBeenCalledTimes(0)
        expect(wrapper.vm.appointmentCancelled).toBeFalsy()
    })

    it('startRebooking is not possible because appointment is in the past', async () => {
        const mockCallback = jest.fn()
        wrapper.vm.$store.state.errorCode = null
        wrapper.vm.$store.dispatch = mockCallback

        wrapper.vm.$store.state.preselectedAppointment = {
            dateFrom: moment().subtract(6, 'M')
        }

        wrapper.vm.startRebooking()
        await wrapper.vm.$nextTick()

        expect(mockCallback).toHaveBeenCalledTimes(0)
        expect(wrapper.vm.$store.state.errorCode).toBe('appointmentCanNotBeCanceled')
        expect(wrapper.vm.rebookDialog).toBeFalsy()
    })

    it('startRebooking method starts rebooking', async () => {
        const mockCallback = jest.fn()
        wrapper.vm.$store.state.errorCode = null
        wrapper.vm.$store.dispatch = mockCallback

        wrapper.vm.$store.state.preselectedAppointment = {
            dateFrom: moment().add(6, 'M')
        }

        wrapper.vm.startRebooking()
        await wrapper.vm.$nextTick()

        expect(mockCallback).toHaveBeenCalledTimes(1)
        expect(mockCallback.mock.calls[0][0]).toBe('startRebooking')
        expect(wrapper.vm.$store.state.errorCode).toBeNull()
        expect(wrapper.vm.rebookDialog).toBeFalsy()
    })

    it('stopRebooking method stops rebooking', async () => {
        const mockCallback = jest.fn()
        wrapper.vm.$store.dispatch = mockCallback

        wrapper.vm.stopRebooking()
        await wrapper.vm.$nextTick()

        expect(mockCallback).toHaveBeenCalledTimes(1)
        expect(mockCallback.mock.calls[0][0]).toBe('stopRebooking')
    })

    it('startOver method resets all data', async () => {
        wrapper.vm.$store.state.confirmedAppointment = true
        wrapper.vm.starOverDialog = true
        const realOpenPanelMethod = wrapper.vm.openPanel
        const mockCallback = jest.fn()
        const openPanelMock = jest.fn()
        wrapper.vm.$store.commit = mockCallback
        wrapper.vm.openPanel = openPanelMock

        wrapper.vm.startOver()
        await wrapper.vm.$nextTick()

        expect(mockCallback).toHaveBeenCalledTimes(4)
        expect(mockCallback.mock.calls[0][0]).toBe('data/setCustomerData')
        expect(mockCallback.mock.calls[0][1]).toStrictEqual({})
        expect(mockCallback.mock.calls[1][0]).toBe('preselectAppointment')
        expect(mockCallback.mock.calls[1][1]).toBeNull()
        expect(mockCallback.mock.calls[2][0]).toBe('data/setAppointment')
        expect(mockCallback.mock.calls[2][1]).toBeNull()
        expect(mockCallback.mock.calls[3][0]).toBe('data/setService')
        expect(mockCallback.mock.calls[3][1]).toBeNull()
        expect(openPanelMock.mock.calls[0][0]).toBe(1)
        expect(wrapper.vm.$store.state.confirmedAppointment).toBeNull()
        expect(wrapper.vm.starOverDialog).toBeFalsy()
        wrapper.vm.openPanel = realOpenPanelMethod
    })

    it('submit method does preconfirm', async () => {
        wrapper.vm.$store.dispatch = jest.fn((method) => {
            if (method === 'API/preconfirmReservation') {
                return new Promise((resolve, reject) => {
                    resolve({})
                })
            }
        })

        wrapper.vm.submit()
        await wrapper.vm.$nextTick()

        expect(wrapper.vm.$store.state.confirmedAppointment).toBeTruthy()
    })

    it('submit method does pre-confirm and cencels previous appointment by rebooking', async () => {
        const cancelAppointmentMock = jest.fn()
        wrapper.vm.$store.dispatch = jest.fn((method) => {
            if (method === 'API/preconfirmReservation') {
                return new Promise((resolve, reject) => {
                    resolve({})
                })
            }
        })
        wrapper.vm.cancelAppointment = cancelAppointmentMock
        wrapper.vm.$store.state.isRebooking = true

        wrapper.vm.submit()
        await wrapper.vm.$nextTick()

        expect(cancelAppointmentMock.mock.calls[0][0]).toBeTruthy()
        expect(wrapper.vm.$store.state.confirmedAppointment).toBeTruthy()
    })

    it('submit method fails because pre-confirm fails', async () => {
        wrapper.vm.$store.dispatch = jest.fn((method) => {
            if (method === 'API/preconfirmReservation') {
                return new Promise((resolve, reject) => {
                    reject({})
                })
            }
        })

        wrapper.vm.submit()
        await wrapper.vm.$nextTick()

        expect(wrapper.vm.$store.state.confirmedAppointment).toBeFalsy()
    })

    it('openPanel method sets step and opens panel', async () => {
        wrapper.vm.$store.state.openedPanel = 2

        const commitMethods = jest.fn()
        wrapper.vm.$store.commit = commitMethods

        wrapper.vm.openPanel(1)
        await wrapper.vm.$nextTick()

        expect(commitMethods).toHaveBeenCalledTimes(1)
        expect(commitMethods.mock.calls[0]).toStrictEqual(['goToStep', 1])
        expect(wrapper.vm.$store.state.openedPanel).toBe(0)
    })

    it('getSelectedServices returns empty string because there is no service selected', async () => {
        wrapper.vm.$store.state.data.service = null

        const selectedServices = wrapper.vm.getSelectedServices()
        await wrapper.vm.$nextTick()

        expect(selectedServices).toBe('')
    })

    it('getSelectedServices returns comma separated services', async () => {
        wrapper.vm.$store.state.data.appointmentCounts = {
            333: 2,
            444: 1
        }
        wrapper.vm.$store.state.data.service = {
            subServices: [
                {
                    id: 333,
                    name: 'Service 1'
                },
                {
                    id: 444,
                    name: 'Service 2'
                }
            ]
        }

        const selectedServices = wrapper.vm.getSelectedServices()
        await wrapper.vm.$nextTick()

        expect(selectedServices).toBe('2 x Service 1, 1 x Service 2')
    })

    it('getSelectedAppointment returns empty string because there is no appointment selected', async () => {
        wrapper.vm.$store.state.data.appointment = null

        const selectedAppointment = wrapper.vm.getSelectedAppointment()
        await wrapper.vm.$nextTick()

        expect(selectedAppointment).toBe('')
    })

    it('getProviderName returns empty string because there is provider with id', async () => {
        wrapper.vm.$store.state.providers = [
            {
                id: 1,
                name: 'Service 1'
            }
        ]

        const providerName = wrapper.vm.getProviderName(999)
        await wrapper.vm.$nextTick()

        expect(providerName).toBe('')
    })

    it('getProviderName returns provider name', async () => {
        wrapper.vm.$store.state.providers = [
            {
                id: 1,
                name: 'Service 1'
            }
        ]

        const providerName = wrapper.vm.getProviderName(1)
        await wrapper.vm.$nextTick()

        expect(providerName).toBe('Service 1')
    })

    it('getSelectedAppointment returns selected appointment', async () => {
        const realGetProviderName = wrapper.vm.getProviderName
        wrapper.vm.getProviderName = jest.fn(() => {
            return 'Service Name 1'
        })
        const time = moment.unix(1684830081)

        wrapper.vm.$store.state.data.appointment = {
            timestamp: time.unix(),
            locationId: 1
        }

        const selectedAppointment = wrapper.vm.getSelectedAppointment()
        await wrapper.vm.$nextTick()

        expect(selectedAppointment).toBe(time.format('DD.MM.YYYY H:mm') + ' Service Name 1')

        wrapper.vm.getProviderName = realGetProviderName
    })

    it('preselectService set up service and reset other data', async () => {
        const commitMethods = jest.fn()
        const openPanelMock = jest.fn()
        wrapper.vm.$store.commit = commitMethods
        wrapper.vm.openPanel = openPanelMock
        wrapper.vm.$store.state.confirmedAppointment = {}

        const service = {
            id: 1,
            name: 'Service 1'
        }

        wrapper.vm.preselectService(service)
        await wrapper.vm.$nextTick()

        expect(commitMethods).toHaveBeenCalledTimes(2)
        expect(openPanelMock).toHaveBeenCalledTimes(1)
        expect(wrapper.vm.$store.state.confirmedAppointment).toBeNull()
    })
})