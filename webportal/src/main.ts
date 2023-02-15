import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import firebase from 'firebase/compat/app'
import 'firebase/compat/firestore'


firebase.initializeApp({
    apiKey: 'AIzaSyCpUi6mawNxc11eaq-i33pKcTnkT_mUnLg',
    authDomain: 'digitaltwinnft.firebaseapp.com',
    projectId: 'digitaltwinnft',
    storageBucket: 'digitaltwinnft.appspot.com',
    appId: "1:961207404435:web:35322b43d4f47771e80a66",
    messagingSenderId: '961207404435'
  });
  
const db = firebase.firestore();

createApp(App).mount('#app')
