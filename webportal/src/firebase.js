import firebase from 'firebase'
import {ref,onUnmounted} from 'vue'

const config = {
    apiKey: "AIzaSyCpUi6mawNxc11eaq-i33pKcTnkT_mUnLg",
    authDomain: "digitaltwinnft.firebaseapp.com",
    projectId: "digitaltwinnft",
    storageBucket: "digitaltwinnft.appspot.com",
    messagingSenderId: "961207404435",
    appId: "1:961207404435:web:35322b43d4f47771e80a66",
    measurementId: "G-FZNDDS3MX1"
  };

const firebaseapp = firebase.initializeApp(config)

const db = firebaseapp.firestore()
const userCollection = db.collection('users')

export const createUser = user => {
    return userCollection.add(user)
}

export const getUser = async id => {
    const user = await userCollection.doc(id).get()
    return user.exists ? user.data() : null
}

export const updateUser = (id, user) => {
    return userCollection.doc(id).update(user)
}

export const deleteUser = id => {
    return userCollection.doc(id).delete()
}

export const useLoadUsers = () => {
    const users = ref([])
    const close = userCollection.onSnapshot(snapshot => {
        users.value = snapshot.doc.map(doc => ({id: doc.id, ...doc.data()}))
    })
    onUnmounted(close)
    return users
}