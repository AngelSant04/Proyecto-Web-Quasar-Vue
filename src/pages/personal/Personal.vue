<template>
  <div>
    <div class="q-pa-lg">
      <q-card flat bordered>
        <q-card-section class="cols-12 col-md-12 col-sm-12 q-px-md">
          <q-form ref="refForm" v-model="validForm" greedy>
            <div class="q-px-md">
              <div class="q-ma-sm text-h6">
                Datos Generales
              </div>
              <q-separator class="q-my-sm" />
              <div class="row">
                <div class="cols-12 col-md-4 col-sm-4 col-xs-12 q-px-md">
                  <q-input v-model="alumno.nombre" label="Nombre" />
                </div>
                <div class="cols-12 col-md-4 col-sm-4 col-xs-12 q-px-md">
                  <q-input v-model="alumno.escuelaProfesional" label="Escuela Profesional" />
                </div>
                <div class="cols-12 col-md-4 col-sm-4 col-xs-12 q-px-md">
                  <q-input v-model="alumno.codigo" label="Codigo" />
                </div>
                <div class="cols-12 col-md-4 col-sm-4 col-xs-12 q-px-md q-pt-md">
                  <q-input v-model="alumno.emailInstitucional" label="Correo Institucional" />
                </div>
                <div class="cols-12 col-md-4 col-sm-4 col-xs-12 q-px-md q-pt-md">
                  <q-input v-model="alumno.email" label="Correo Personal" />
                </div>
                <div class="cols-12 col-md-4 col-sm-4 col-xs-12 q-px-md q-pt-md">
                  <q-input v-model="alumno.dni" label="DNI" />
                </div>
                <div class="cols-12 col-md-4 col-sm-4 col-xs-12 q-px-md q-pt-md">
                  <q-input v-model="alumno.fechaNacimiento" mask="date" :rules="['date']">
                    <template v-slot:append>
                      <q-icon name="event" class="cursor-pointer">
                        <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                          <q-date v-model="alumno.fechaNacimiento">
                            <div class="row items-center justify-end">
                              <q-btn v-close-popup label="Close" color="primary" flat />
                            </div>
                          </q-date>
                        </q-popup-proxy>
                      </q-icon>
                    </template>
                  </q-input>
                </div>
                <div class="cols-12 col-md-4 col-sm-4 col-xs-12 q-px-md q-pt-md">
                  <q-select v-model="alumno.sexo" :options="listSexo" label="Sexo" option-value="value"
                    option-label="label" />
                </div>
                <div class="cols-12 col-md-4 col-sm-4 col-xs-12 q-px-md q-pt-md">
                  <q-input v-model="recognizedFace" label="Reconocimiento Facial">
                    <template v-slot:append>
                      <q-icon name="mdi-camera" color="grey" @click="openCamera" class="cursor-pointer" />
                      <q-icon name="mdi-close" color="grey" @click="closeCamera" class="cursor-pointer" />
                    </template>
                  </q-input>
                  <video v-if="isCameraOpen" ref="cameraRef" autoplay></video>
                  <img v-if="capturedPhoto" :src="capturedPhoto" alt="Captured Photo" style="max-width: 100%;height: auto;">
                </div>
              </div>
            </div>
          </q-form>
        </q-card-section>
        <q-card-actions align="right">
          <q-btn class="q-mx-sm" flat color="primary" label="Aceptar" @click="aceptar" />
        </q-card-actions>
      </q-card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, capitalize, onUnmounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { getStorage, ref as storageRef, uploadString, getDownloadURL } from 'firebase/storage';
import { getFirestore, collection, addDoc, doc, updateDoc, query, where, getDocs } from 'firebase/firestore';
import { Loading } from 'quasar';
import { storage, db } from '../../boot/firebase';


const alumno: any = ref({
  nombre: '',
  escuelaProfesional: '',
  codigo: '',
  emailInstitucional: '',
  email: '',
  dni: '',
  fechaNacimiento: '',
  sexo: ''
});
const isCameraOpen = ref(false);
const refForm: any = ref(null);
const validForm = ref(false);
const recognizedFace = ref('');
const cameraRef = ref(null);
//Datos de los selected
const listSexo = ref<any[]>([
  { value: 'M', label: 'Masculino' },
  { value: 'F', label: 'Feminino' }
]);
//FORM PERMISOS
const capturedPhoto:any = ref('');

const aceptar = async() => {
  Loading.show();
  if (capturedPhoto.value && alumno.value.codigo) {
    const storageRefAux = storageRef(storage, `fotos/${alumno.value.codigo}.jpg`);
    const photoData = capturedPhoto.value.replace(/^data:image\/jpeg;base64,/, '');
    try {
      await uploadString(storageRefAux, photoData, 'base64');
      const downloadURL = await getDownloadURL(storageRefAux);
      
      const alumnoCollection = collection(db, 'Estudiante');
      const queryAux = query(alumnoCollection, where('codigo', '==', alumno.value.codigo));
      const querySnapshot = await getDocs(queryAux);

      // console.log(querySnapshot.docs[0].id);
      

      const alumnoDocRef = doc(db, 'Estudiante', querySnapshot.docs[0].id);
      await updateDoc(alumnoDocRef, {
        codigoFacial: downloadURL,
      });

      console.log('Foto guardada en Firebase Storage y Firestore');
    } catch (error) {
      console.error('Error al guardar la foto:', error);
    }
  }
  Loading.hide()
}

//Controlador de eventos
window.addEventListener('keydown', handleKeyDown);

function handleKeyDown(event: KeyboardEvent) {
  if (event.key === 'Escape') {
    takePhoto();
  }
}

async function takePhoto() {
  if (isCameraOpen.value && cameraRef.value) {
    const canvas = document.createElement('canvas');
    canvas.width = cameraRef.value.videoWidth;
    canvas.height = cameraRef.value.videoHeight;
    const context = canvas.getContext('2d');
    context.drawImage(cameraRef.value, 0, 0, canvas.width, canvas.height);
    const photoDataUrl = canvas.toDataURL('image/jpeg');
    capturedPhoto.value = photoDataUrl;
    closeCamera();
  }
}

const openCamera = async () => {
  try {
    isCameraOpen.value = true
    const stream = await navigator.mediaDevices.getUserMedia({ video: true });
    cameraRef.value.srcObject = stream;
  } catch (error) {
    console.error('Error al acceder a la cámara: ', error);
  }
};

const closeCamera = () => {
  if (cameraRef.value && cameraRef.value.srcObject) {
    const tracks = cameraRef.value.srcObject.getTracks();
    tracks.forEach(track => track.stop());
  }
  isCameraOpen.value = false
};

onMounted(() => {
  const userLocal = JSON.parse(localStorage.getItem('user')!)
  alumno.value.nombre = userLocal.nombre;
  alumno.value.escuelaProfesional = userLocal.escuela;
  alumno.value.codigo = userLocal.codigo;
  alumno.value.emailInstitucional = userLocal.correo;
  alumno.value.email = userLocal.correoPersonal;
  alumno.value.dni = userLocal.nroDocumento;
  const fechaMilisegundos = userLocal.fechaNacimiento.seconds * 1000 + Math.round(userLocal.fechaNacimiento.nanoseconds / 1000000);
  const fecha = new Date(fechaMilisegundos);
  // console.log(fecha);
  const year = fecha.getFullYear();
  const month = String(fecha.getMonth() + 1).padStart(2, '0');
  const day = String(fecha.getDate()).padStart(2, '0');
  const fechaFormateada = `${year}/${month}/${day}`;
  alumno.value.fechaNacimiento = fechaFormateada
  alumno.value.sexo = userLocal.sexo;
  alumno.value.reconocimientoFacial = userLocal.codigoFacial;
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeyDown);
});

</script>


<style scoped>
/* Estilos opcionales para el video */
video {
  max-width: 100%;
  height: auto;
}
</style>