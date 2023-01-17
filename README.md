<!-- PROJECT SHIELDS -->
[![Contributors][contributors-shield]][contributors-url]
[![Forks][forks-shield]][forks-url]
[![Stargazers][stars-shield]][stars-url]
[![Issues][issues-shield]][issues-url]
[![MIT License][license-shield]][license-url]


## About The Project

This project is frontend client for Appointment system (Zeit Managemenet System - ZMS). It provides various functionalities that would otherwise have to be created by the user:

- Detailed configuration of the rollup-config
- Preconfigured build and release pipeline
- Dev server for local development
- Instructions to use the package locally with `npm pack`


### Built With

This project is built with:

* [Vue.js](https://vuejs.org)
* [Vuetify](https://vuetifyjs.com/en/)
* [Rollup](https://github.com/rollup/rollup)
* [vue-sfc-rollup](https://github.com/team-innovation/vue-sfc-rollup)

## Getting Started

_Below is an example of how you can installing and setup up your service_

1. `git clone `
2. `npm install`
3. `npm run build`

### Developing the library locally

1. Start the dev server with `npm run serve`

### Use your library in another project locally

Run the following commands in your library:

1. `npm run build`
2. `npm run pack`

Make sure you have provided all the necessary dependencies in your vuetify project and add the library vai `file path`:
 
```
"eappointment-frontend": "file:../eappointment-frontend-1.0.1.tgz"
```


## Contributing

Contributions are what make the open source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

If you have a suggestion that would make this better, please fork the repo and create a pull request. You can also simply open an issue with the tag "enhancement".
Don't forget to give the project a star! Thanks again!

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

Distributed under the MIT License. See [LICENSE](LICENSE) for more information.


## Contact

it@m - opensource@muenchendigital.io


[contributors-shield]: https://img.shields.io/github/contributors/it-at-m/eappointment-frontend.svg?style=for-the-badge
[contributors-url]: https://github.com/it-at-m/eappointment-frontend/graphs/contributors
[forks-shield]: https://img.shields.io/github/forks/it-at-m/eappointment-frontend.svg?style=for-the-badge
[forks-url]: https://github.com/it-at-m/eappointment-frontend/network/members
[stars-shield]: https://img.shields.io/github/stars/it-at-m/eappointment-frontend.svg?style=for-the-badge
[stars-url]: https://github.com/it-at-m/eappointment-frontend/stargazers
[issues-shield]: https://img.shields.io/github/issues/it-at-m/eappointment-frontend.svg?style=for-the-badge
[issues-url]: https://github.com/it-at-m/eappointment-frontend/issues
[license-shield]: https://img.shields.io/github/license/it-at-m/eappointment-frontend.svg?style=for-the-badge
[license-url]: https://github.com/it-at-m/eappointment-frontend/blob/master/LICENSE
[product-screenshot]: images/screenshot.png
