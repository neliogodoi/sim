import { generatedEnvironment } from './environment.generated';

export const environment = {
  production: true,
  firebase: {
    apiKey: 'AIzaSyCoeZyCs-aM6EZtRbE_MU-ycr6_04Eybko',
    authDomain: 'draw-holy.firebaseapp.com',
    projectId: 'draw-holy',
    messagingSenderId: '850533286648',
    appId: '1:850533286648:web:4fce1c0ff847436107710d',
    measurementId: 'G-K4B6NT8W3Z',
  },
  r2Upload: generatedEnvironment.r2Upload,
};
