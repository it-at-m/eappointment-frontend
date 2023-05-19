import {mount, shallowMount} from '@vue/test-utils'
import Vuex from 'vuex'
import Calendar from './../../src/components/Calendar.vue'
import Calendar2 from './../../src/components/Calendar.vue'
import Vuetify from 'vuetify'
import VueI18n from 'vue-i18n'
import translations from './../../src/translations'
import store from './../../src/store'
import Vue from 'vue'

Vue.use(VueI18n)
Vue.use(Vuetify)
Vue.use(Vuex)

const i18n = new VueI18n({
    locale: store.state.locale,
    messages: translations,
})

store.dispatch = jest.fn()
store.state.services = [
    {
        id: 1,
        name: "Meldebescheinigung",
        maxQuantity: 3,
        providers: [
            {
                id: 1,
                name: "Provider 1"
            },
            {
                id: 2,
                name: "Provider 2"
            }
        ]
    },
    {
        id: 2,
        name: "Haushaltsbescheinigung",
        maxQuantity: 2,
        providers: [
            {
                id: 1,
                name: "Provider 1"
            },
            {
                id: 2,
                name: "Provider 2"
            }
        ]
    },
    {
        id: 3,
        name: "Fahrzeug wieder anmelden",
        maxQuantity: 2,
        providers: [
            {
                id: 1,
                name: "Provider 1"
            },
            {
                id: 2,
                name: "Provider 2"
            }
        ]
    }
]

store.state.data.servce = {
    id: 1,
    name: "Meldebescheinigung",
    maxQuantity: 3,
    providers: [
        {
            id: 1,
            name: "Provider 1"
        },
        {
            id: 2,
            name: "Provider 2"
        }
    ]
}

const wrapper = mount(Calendar, {
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

describe('Calendar', () => {
    it('Component is shown', () => {
        expect(wrapper.exists()).toBe(true)
    })

    it('providers are shown', async () => {
        wrapper.vm.$store.state.data.service = {
            id: 1,
            name: "Meldebescheinigung",
            maxQuantity: 3,
            providers: [
                {
                    id: 1,
                    name: "Provider 1"
                },
                {
                    id: 2,
                    name: "Provider 2"
                }
            ]
        }

        await wrapper.vm.$nextTick()

        expect(wrapper.html()).toContain('Provider 1')
        expect(wrapper.html()).toContain('tabindex="0" aria-selected="true" role="tab" class="v-tab v-tab--active"')
        expect(wrapper.html()).toContain('Provider 2')
        expect(wrapper.html()).toContain('tabindex="0" aria-selected="false" role="tab" class="v-tab"')
        expect(wrapper.find('.v-tab--active').html()).toContain('Provider 1')
    })

    it('right month is shown', async () => {
        wrapper.vm.date = '2023-04-02'

        await wrapper.vm.$nextTick()
        const weeks = wrapper.findAll('tbody tr')

        expect(wrapper.html()).toContain('So., 2. Apr.')
        expect(weeks.at(0).text()).toContain('12')
        expect(weeks.at(1).text()).toContain('3456789')
        expect(weeks.at(2).text()).toContain('10111213141516')
        expect(weeks.at(3).text()).toContain('17181920212223')
        expect(weeks.at(4).text()).toContain('24252627282930')
    })

    it('right days are available', async () => {
        wrapper.vm.maxDate = new Date('2023-05-30T01:00:00')
        wrapper.vm.selectableDates = [
            '2023-05-20',
            '2023-05-21',
            '2023-05-22'
        ]

        await wrapper.vm.$nextTick()

        expect(wrapper.vm.allowedDates(new Date('2023-05-15T01:00:00'))).toBeFalsy()
        expect(wrapper.vm.allowedDates(new Date('2023-05-20T01:00:00'))).toBeTruthy()
        expect(wrapper.vm.allowedDates(new Date('2023-05-31T01:00:00'))).toBeFalsy()
    })

    it('formatDay returns date in right format', async () => {
        expect(wrapper.vm.formatDay(new Date('2023-05-15T01:00:00'))).toBe('15.05.2023')
    })

    it('shouldShowProvider returns true if there is no preselected provider', async () => {
        const provider = {
            id: 1,
            name: "Provider 1"
        }

        expect(wrapper.vm.shouldShowProvider(provider)).toBeTruthy()
    })

    it('shouldShowProvider returns true if there is same preselected provider', async () => {
        const provider = {
            id: 1,
            name: "Provider 1"
        }

        wrapper.vm.$store.state.preselectedProvider = provider

        expect(wrapper.vm.shouldShowProvider(provider)).toBeTruthy()
    })

    it('shouldShowProvider returns false if there is different preselected provider', async () => {
        const provider = {
            id: 1,
            name: "Provider 1"
        }

        wrapper.vm.$store.state.preselectedProvider = {
            id: 2,
            name: "Provider 2"
        }

        expect(wrapper.vm.shouldShowProvider(provider)).toBeFalsy()
    })

    it('getAppointmentsOfDay shows dialog with time slots', async () => {
        document.body.setAttribute('data-app', true)
        const mockCallback = jest.fn(() => {
            return new Promise((resolve, reject) => {
                resolve({
                    "appointmentTimestamps": [
                        1684386000,
                        1684386900,
                        1684387800
                    ]
                })
            })
        })

        wrapper.vm.$store.dispatch = mockCallback
        wrapper.vm.getAppointmentsOfDay('2023-05-18')

        await wrapper.vm.$nextTick()

        expect(mockCallback).toHaveBeenCalledTimes(1)
        expect(wrapper.vm.timeSlots.length).toBe(3)
        expect(wrapper.vm.timeSlots[0].format('HH:mm')).toBe('07:00')
        expect(wrapper.vm.timeSlots[1].format('HH:mm')).toBe('07:15')
        expect(wrapper.vm.timeSlots[2].format('HH:mm')).toBe('07:30')
        expect(wrapper.vm.timeDialog).toBeTruthy()
    })

    it('getAppointmentsOfDay shows error', async () => {
        document.body.setAttribute('data-app', true)
        const mockCallback = jest.fn(() => {
            return new Promise((resolve, reject) => {
                resolve({
                    'errorMessage': 'Something went wrong'
                })
            })
        })

        wrapper.vm.$store.dispatch = mockCallback
        wrapper.vm.getAppointmentsOfDay('2023-05-18')

        await wrapper.vm.$nextTick()

        expect(wrapper.vm.dateError).toBe('Something went wrong')
        expect(wrapper.vm.timeDialog).toBeFalsy()
    })

    it('getAppointmentsOfDay shows error', async () => {
        document.body.setAttribute('data-app', true)
        const mockCallback = jest.fn(() => {
            return new Promise((resolve, reject) => {
                resolve({
                    'errorMessage': 'Something went wrong'
                })
            })
        })

        wrapper.vm.$store.dispatch = mockCallback
        wrapper.vm.getAppointmentsOfDay('2023-05-18')

        await wrapper.vm.$nextTick()

        expect(wrapper.vm.dateError).toBe('Something went wrong')
        expect(wrapper.vm.timeDialog).toBeFalsy()
    })

    it('showForProvider method fetch and save available days for provider', async () => {
        const mockCallback = jest.fn((method, parameters) => {
            return new Promise((resolve, reject) => {
                resolve({
                    'availableDays': [
                        '2023-05-10',
                        '2023-05-11',
                        '2023-05-12'
                    ]
                })
            })
        })

        wrapper.vm.$store.dispatch = mockCallback
        wrapper.vm.showForProvider({
            id: 1,
            name: "Provider 1"
        })

        await wrapper.vm.$nextTick()

        expect(mockCallback).toHaveBeenCalledTimes(1)
        expect(wrapper.vm.selectableDates).toEqual([
            '2023-05-10',
            '2023-05-11',
            '2023-05-12'
        ])
    })

    it('showForProvider method set error message', async () => {
        const mockCallback = jest.fn((method, parameters) => {
            return new Promise((resolve, reject) => {
                resolve({
                    'errorMessage': 'Ooops. Something went wrong'
                })
            })
        })

        wrapper.vm.$store.dispatch = mockCallback
        wrapper.vm.showForProvider({
            id: 1,
            name: "Provider 1"
        })

        await wrapper.vm.$nextTick()

        expect(mockCallback).toHaveBeenCalledTimes(1)
        expect(wrapper.vm.selectableDates).toEqual([])
        expect(wrapper.vm.dateError).toBe('Ooops. Something went wrong')
    })

    it('chooseAppointment method fails to reserve appointment', async () => {
        const mockCallback = jest.fn((method, parameters) => {
            if (method === 'API/reserveAppointment') {
                return new Promise((resolve, reject) => {
                    resolve({
                        'errorMessage': 'Failed.'
                    })
                })
            }
        })

        wrapper.vm.$store.dispatch = mockCallback
        wrapper.vm.chooseAppointment(1684386000)

        await wrapper.vm.$nextTick()

        expect(mockCallback).toHaveBeenCalledTimes(1)
        expect(wrapper.vm.timeSlotError).toBe('Failed.')
    })

    it('chooseAppointment method fails to reserve appointment because time slot is not available', async () => {
        const mockCallback = jest.fn((method, parameters) => {
            if (method === 'API/reserveAppointment') {
                return new Promise((resolve, reject) => {
                    reject({
                        'errorMessage': 'Failed.'
                    })
                })
            }
        })

        wrapper.vm.$store.dispatch = mockCallback
        wrapper.vm.chooseAppointment(1684386000)

        await wrapper.vm.$nextTick()

        expect(mockCallback).toHaveBeenCalledTimes(1)
        expect(wrapper.vm.timeSlotError).toBe('Der von Ihnen gewählte Termin ist leider nicht mehr verfügbar')
        expect(wrapper.emitted().next).not.toBeDefined()
    })

    it('chooseAppointment method reserves appointment', async () => {
        const mockCallback = jest.fn((method, parameters) => {
            if (method === 'API/reserveAppointment') {
                return new Promise((resolve, reject) => {
                    resolve({
                        'provider': 111,
                        'officeName': 'Office name',
                        'locationId': 222,
                    })
                })
            }
        })

        wrapper.vm.timeDialog = true
        wrapper.vm.$store.state.data.appointment = {}
        wrapper.vm.$store.dispatch = mockCallback
        wrapper.vm.chooseAppointment(1684386000)

        await wrapper.vm.$nextTick()

        expect(mockCallback).toHaveBeenCalledTimes(2)
        expect(mockCallback.mock.calls[1][0]).toBe('API/cancelAppointment')
        expect(wrapper.vm.timeDialog).toBeFalsy()
        expect(wrapper.emitted().next).toBeDefined()
    })

    it('chooseAppointment method reserves appointment by rebooking', async () => {
        const mockCallback = jest.fn((method, parameters) => {
            if (method === 'API/reserveAppointment') {
                return new Promise((resolve, reject) => {
                    resolve({
                        'provider': 111,
                        'officeName': 'Office name',
                        'locationId': 222,
                    })
                })
            }
        })

        wrapper.vm.timeDialog = true
        wrapper.vm.$store.state.isRebooking = true
        wrapper.vm.$store.state.data.appointment = {}
        wrapper.vm.$store.dispatch = mockCallback
        wrapper.vm.chooseAppointment(1684386000)

        await wrapper.vm.$nextTick()

        expect(mockCallback).toHaveBeenCalledTimes(1)
        expect(wrapper.vm.timeDialog).toBeFalsy()
        expect(wrapper.emitted().next).toBeDefined()
    })
})