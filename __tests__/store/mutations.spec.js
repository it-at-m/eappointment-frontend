import mutations from './../../src/store/mutations'
import store from './../../src/store/index'

describe('Mutations', () => {
    it('setServices sets services', async () => {
        await mutations.setServices(store.state, [
            {
                id: 1,
                name: 'Service 1'
            },
            {
                id: 2,
                name: 'Service 2'
            },
        ])

        expect(store.state.services).toStrictEqual([
            {
                id: 1,
                name: 'Service 1'
            },
            {
                id: 2,
                name: 'Service 2'
            },
        ])
    })

    it('setProviders sets providers', async () => {
        await mutations.setProviders(store.state, [
            {
                id: 1,
                name: 'Provider 1'
            },
            {
                id: 2,
                name: 'Provider 2'
            },
        ])

        expect(store.state.providers).toStrictEqual([
            {
                id: 1,
                name: 'Provider 1'
            },
            {
                id: 2,
                name: 'Provider 2'
            },
        ])
    })

    it('setSettings sets settings', async () => {
        await mutations.setSettings(store.state, {
            key1: 'value1',
            key2: 'value2'
        })

        expect(store.state.settings).toStrictEqual({
            key1: 'value1',
            key2: 'value2'
        })
    })

    it('goToStep sets step', async () => {
        await mutations.goToStep(store.state, 2)

        expect(store.state.step).toStrictEqual(2)
    })

    it('selectServiceWithId sets service', async () => {
        const commitMethods = jest.fn()
        mutations.commit = commitMethods
        store.state.services = [
            {
                id: 1,
                name: 'Service 1'
            },
            {
                id: 2,
                name: 'Service 2'
            },
        ]

        await mutations.selectServiceWithId(store.state, {
            id: 1,
            count: 3
        })

        expect(store.state.services).toStrictEqual([
            {
                id: 1,
                name: 'Service 1',
                count: 3
            },
            {
                id: 2,
                name: 'Service 2'
            },
        ])
        expect(store.state.preselectedService).toBe(1)
        expect(commitMethods).toHaveBeenCalledTimes(1)
        expect(commitMethods.mock.calls[0]).toStrictEqual(['data/setService', {
            id: 1,
            name: 'Service 1',
            count: 3
        }])
    })

    it('selectProviderWithId sets provider', async () => {
        store.state.providers = [
            {
                id: 1,
                name: 'Provider 1'
            },
            {
                id: 2,
                name: 'Provider 2'
            },
        ]

        await mutations.selectProviderWithId(store.state, 1)

        expect(store.state.preselectedProvider).toStrictEqual({
            id: 1,
            name: 'Provider 1'
        })
    })

    it('preselectAppointment sets appointment', async () => {
        await mutations.preselectAppointment(store.state, {
            processId: 'aaa',
            authKey: 'bbb'
        })

        expect(store.state.preselectedAppointment).toStrictEqual({
            processId: 'aaa',
            authKey: 'bbb'
        })
        expect(store.state.confirmedAppointment).toBeTruthy()
    })
})