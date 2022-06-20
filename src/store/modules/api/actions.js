import moment from "moment";

const DB_SOURCE = 'dldb';

export default {
    confirmReservation(store, { appointmentData }) {
        return new Promise((resolve, reject) => {
            const requestOptions = {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(appointmentData)
            };

            fetch(process.env.VUE_APP_ZMS_API_BASE + process.env.VUE_APP_ZMS_API_CONFIRM_RESERVATION_ENDPOINT, requestOptions)
                .then((response) => {
                    return response.json();
                })
                .then(data => {
                    resolve(data.data)
                }, error => {
                    reject(error)
                })
        })
    },
    sendConfirmationEmail(store, { appointmentData }) {
        return new Promise((resolve, reject) => {
            const requestOptions = {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(appointmentData)
            };

            fetch(process.env.VUE_APP_ZMS_API_BASE + process.env.VUE_APP_ZMS_API_SEND_CONFIRMATION_MAIL_ENDPOINT
                .replace('{appointmentId}', appointmentData.id)
                .replace('{authKey}', appointmentData.authKey)
                , requestOptions
            )
                .then((response) => {
                    return response.json();
                })
                .then(data => {
                    resolve(data.data)
                }, error => {
                    reject(error)
                })
        })
    },
    getSettings() {
        return new Promise((resolve, reject) => {
            fetch(process.env.VUE_APP_SETTINGS_ENDPOINT)
                .then((response) => {
                    return response.json();
                })
                .then(data => {
                    resolve(data)
                }, error => {
                    reject(error.response.data.meta)
                })
        })
    },
    fetchAvailableDays(state, { provider, serviceId }) {
        return new Promise((resolve, reject) => {
            const dateIn3Months = moment().add(3, 'M')

            const requestOptions = {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    "firstDay": {
                        "year": moment().year(),
                        "month": moment().month(),
                        "day": moment().day()
                    },
                    "lastDay": {
                        "year": dateIn3Months.year(),
                        "month": dateIn3Months.month(),
                        "day": dateIn3Months.day()
                    },
                    "requests": [
                        {
                            "id": serviceId,
                            "source": DB_SOURCE
                        }
                    ],
                    "providers": [
                        provider
                    ]
                })
            };

            fetch(process.env.VUE_APP_ZMS_API_BASE + process.env.VUE_APP_ZMS_API_CALENDAR_ENDPOINT, requestOptions)
                .then((response) => {
                    return response.json();
                })
                .then(data => {
                    resolve(data.data)
                }, error => {
                    reject(error)
                })
        })
    },
    fetchServicesAndProviders() {
        return new Promise((resolve, reject) => {
            fetch(process.env.VUE_APP_ZMS_API_BASE
                + process.env.VUE_APP_ZMS_API_PROVIDERS_AND_SERVICES_ENDPOINT.replace('{dbSource}', DB_SOURCE)
            )
                .then((response) => {
                    return response.json();
                })
                .then(data => {
                    resolve(data.data)
                }, error => {
                    reject(error)
                })
        })
    },
    fetchAppointment(state, { processId, authKey }) {
        return new Promise((resolve, reject) => {
            fetch(process.env.VUE_APP_ZMS_API_BASE + process.env.VUE_APP_ZMS_API_APPOINTMENT_ENDPOINT
                .replace('{appointmentId}', processId)
                .replace('{authKey}', authKey)
            )
                .then((response) => {
                    return response.json();
                })
                .then(data => {
                    resolve(data.data)
                }, error => {
                    reject(error)
                })
        })
    },
    fetchAvailableTimeSlots(store, { date, provider, serviceId }) {
        return new Promise((resolve, reject) => {
            const requestOptions = {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    "firstDay": {
                        "year": date.format('YYYY'),
                        "month": date.format('MM'),
                        "day": date.format('DD'),
                    },
                    "lastDay": {
                        "year": date.format('YYYY'),
                        "month": date.format('MM'),
                        "day": date.format('DD'),
                    },
                    "requests": [
                        {
                            "id": serviceId,
                            "source": DB_SOURCE
                        }
                    ],
                    "providers": [ provider ]
                })
            };

            fetch(process.env.VUE_APP_ZMS_API_BASE + process.env.VUE_APP_ZMS_API_AVAILABLE_TIME_SLOTS_ENDPOINT, requestOptions)
                .then((response) => {
                    return response.json();
                })
                .then(data => {
                    resolve(data.data)
                }, error => {
                    reject(error)
                })
        })
    },
    updateAppointmentData(store, appointment) {
        return new Promise((resolve, reject) => {
            const requestOptions = {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(appointment)
            };

            fetch(process.env.VUE_APP_ZMS_API_BASE + process.env.VUE_APP_ZMS_API_APPOINTMENT_ENDPOINT
                .replace('{appointmentId}', appointment.id)
                .replace('{authKey}', appointment.authKey),
                requestOptions
            )
            .then((response) => {
                return response.json();
            })
            .then(data => {
                resolve(data.data)
            }, error => {
                reject(error.response.data.meta)
            })
        })
    },
    reserveAppointment(store, { appointment, count, serviceId }) {
        let requests = new Array(count)
            .fill({
                "id": serviceId,
                "source": DB_SOURCE
            });

        return new Promise((resolve, reject) => {
            const requestOptions = {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    "appointments": [
                        {
                            "date": appointment.dateFrom.unix(),
                            "slotCount": count,
                            "scope": {
                                "id": appointment.scopeId,
                                "source": DB_SOURCE
                            }
                        }
                    ],
                    "requests": requests,
                    "scope": {
                        "id": appointment.scopeId,
                        "source": DB_SOURCE,
                        "provider": {
                            "id": appointment.locationId,
                            "source": DB_SOURCE
                        }
                    }
                })
            };

            fetch(process.env.VUE_APP_ZMS_API_BASE + process.env.VUE_APP_ZMS_API_RESERVE_APPOINTMENT_ENDPOINT, requestOptions)
                .then((response) => {
                    return response.json();
                })
                .then(data => {
                    resolve(data.data)
                }, error => {
                    reject(error.response.data.meta)
                })
        })
    },
    deleteAppointment(store, appointment) {
        return new Promise((resolve, reject) => {
            const requestOptions = {
                method: "DELETE",
                body: JSON.stringify(appointment)
            };

            fetch(process.env.VUE_APP_ZMS_API_BASE + process.env.VUE_APP_ZMS_API_APPOINTMENT_ENDPOINT
                .replace('{appointmentId}', appointment.id)
                .replace('{authKey}', appointment.authKey),
                requestOptions
            )
                .then((response) => {
                    return response.json();
                })
                .then(data => {
                    resolve(data.data)
                }, error => {
                    reject(error.response.data.meta)
                })
        })
    }
}