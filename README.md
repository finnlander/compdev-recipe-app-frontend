# RecipeApp (frontend)

This is an example frontend application made with Angular (15.x), Typescript, Angular Material UI and some additional libraries.

## About

This is a learning project to familiarize myself with the Angular framework and its' latest practices. The solution is based on Maximilian Schwarzmüller's course ["Angular - The Complete Guide (2023 Edition)"](https://www.udemy.com/course/the-complete-guide-to-angular-2) that I've developed further to deepen my understanding, to test different things and to apply some practices I think are better fitting.

The solution is not meant to be used in any production system. I've put it into github just for myself and others to see as an example of an Angular project with some of the basic building blocks needed by many of the common web apps.

## Development

This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 15.0.4. Angular CLI can be used to create new components, directives, etc.

The used language is Typescript and the UI styles are done with a Angular Material with some extra styling changes.

The project structure follows mainly the practices provided by the official Angular documentation where each component is placed in `src/app/[feature]/[component-specific-dir]`. E.g. Services, directives and models are placed under subdirectories (e.g. `services` for services, etc.). There is also a feature-level directory named as `shared` that contains functionality shared between different features.

### Prerequisites

- Angular CLI (used v15.0.4)
- Node.js (used v18.12.1)

### Development server

Run `ng serve` for a dev server. Navigate to `http://localhost:4200/`. The application will automatically reload if you change any of the source files.

You may either run the frontend application using a mock backend server (check that `environments/environment.ts` has `enableBackendMock` flag set to `true`), or using a sample backend provided in a separate [`recipe-app-backend`](https://github.com/finnlander/compdev-recipe-app-backend) repository. If using the backend, remember to set `enableBackendMock` flag to `false`. In addition, consider setting `generateSampleData` flag to `false` as well (to let the backend provide all the data).

### Build

Run `ng build` to build the project. The build artifacts will be stored in the `dist/` directory.

## Todo's

- The components are lacking unit tests (learning writing tests was not a goal for this project).

## Acknowledgements

The code, structure and architecture is largely based on the Udemy course ["Angular - The Complete Guide (2023 Edition)"](https://www.udemy.com/course/the-complete-guide-to-angular-2) by Maximilian Schwarzmüller. As the content and logic generated by the course does not include anything too complex, and the concepts and such are adapted mostly from the official Angular documentation, I'm assuming he has no objection for me to have this code (I've wrote following the course lectures) published to the public in the open source manner.

## License (MIT)

Copyright 2023 Janne Suomalainen

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
