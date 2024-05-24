<template>
  <q-layout view="hHh Lpr lff" class="row items-center">
    <div class="col-12 col-md-8 col-lg-8 col-xl-8 background-login gt-sm" style="height: 100vh"></div>
    <div class="col-12 col-md-4 col-lg-4 col-xl-4" style="height: 100%">
      <div class="row justify-center">
        <div class="col-9">
          <div style="text-align: center">
            <div style="max-height: 120px !important" class="mt-6">
              <img width="100" src="../../assets/logo_unprg.png" />
            </div>
          </div>

          <div class="q-ma-md text-h6 text-center text-weight-bold text-grey-10">
            BIENVENIDO
          </div>

          <q-form ref="refFormLogin" @submit="login" greedy>
            <q-input outlined dense v-model="usuario" value @blur="usuario = usuario.toUpperCase()" label="Codigo"
              :rules="[val => !!val || 'Codigo es Obligatorio']" />
            <q-input class="q-mt-sm" :type="viewPassword ? 'text' : 'password'" outlined dense v-model="password"
              label="Password" :rules="[val => !!val || 'Password es Obligatorio']">
              <template v-slot:append>
                <q-icon name="mdi-eye" color="grey" @click="viewPassword = !viewPassword" class="cursor-pointer" />
              </template>
            </q-input>
            <q-btn class="q-mx-sm full-width q-mt-sm" color="primary" label="Ingresar" type="submit" />
            <div class="full-width text-center q-mt-sm">
              <span class="text-negative text-center">{{
                messageErrorLogin
              }}</span>
            </div>
          </q-form>
        </div>
      </div>
    </div>
  </q-layout>
</template>

<script setup lang="ts">
import { useRouter, useRoute } from 'vue-router';
import { ref, Ref, onMounted } from 'vue';
import { Loading } from 'quasar';
import { getFirestore, collection, getDocs, query, where } from 'firebase/firestore';
import { db } from 'src/boot/firebase';


/****************************************************************************/
/*                              DATA                                        */
/****************************************************************************/

// Datos de Usuario y Responsable
// const item = ref({
//   // Datos Personales
//   usuario: '',
//   tipoDoc: { value: '', label: '' },
//   nroDoc: '',
//   empresa: [],
//   nombre: '',
//   paterno: '',
//   materno: '',
//   fechaNac: '',
//   sexo: '',
//   celPersonal: '',
//   correoPersonal: '',
//   // Datos de Empresa
//   datosEmpresa: [],
// });
const viewPassword = ref(false);
const usuario = ref('');
const password = ref('');
// Datos de Formulario
const validForm = ref(false);
const messageErrorLogin = ref('');
// Referencia del formulario
// const refForm = ref(null);
const refFormLogin: any = ref(null);
const usuarios: any = ref([]);

/****************************************************************************/
/*                       	    	ROUTER     	                                */
/****************************************************************************/

const route = useRoute();
const router = useRouter();

/****************************************************************************/
/*                           COMPOSABLE                                     */
/****************************************************************************/

/****************************************************************************/
/*                           COMPUTED                                       */
/****************************************************************************/

/****************************************************************************/
/*                             WATCH                                        */
/****************************************************************************/

/****************************************************************************/
/*                         	  APIS    	                                    */
/****************************************************************************/

/****************************************************************************/
/*                           METHODS                                        */
/****************************************************************************/

const validarUser = async (codigo: any, password: any) => {
  try {
    const studentsCollection = collection(db, 'Estudiante');
    const querySnapshot = await getDocs(query(studentsCollection, where('codigo', '==', codigo.toLowerCase()), where('password', '==', password)));
    if (!querySnapshot.empty) {
      messageErrorLogin.value = ''
      const userDocument = querySnapshot.docs[0];
      return userDocument.data();
    } else {
      messageErrorLogin.value = 'Codigo o Constraseña Invalida'
    }
  } catch (error) {
    console.error('Error getting user by code:', error);
    return null;
  }
}

const login = async () => {
  Loading.show();
  refFormLogin.value.validate().then((success: any) => {
    if (success) {
      validForm.value = true;
    }
    else {
      validForm.value = false;
    }
  })
  if (validForm.value) {
    const user = await validarUser(usuario.value, password.value);
    if (user) {
      localStorage.setItem('user', JSON.stringify(user));
      Loading.hide();
      router.push({ path: '/home' });
    }
  }
  Loading.hide();
}

/****************************************************************************/
/*                           LIFECYCLE                                      */
/****************************************************************************/

onMounted(async () => {
  // await verificarLogin();
  console.log("mounted");

});
</script>

<style lang="sass">
.tableHeight .q-page
    min-height: 400px !important
.txtuppercase input
    text-transform: uppercase
.background-login
    background: url('src/assets/logo.png') no-repeat
    background-size: cover
</style>
