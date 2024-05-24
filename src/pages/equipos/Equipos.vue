<template>
  <div>
    <div class="q-pa-lg">
      <q-card flat bordered>
        <q-card-section class="cols-12 col-md-12 col-sm-12 q-px-md">
          <div class="q-px-md">
            <div class="q-ma-sm text-h6">
              Equipos
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
              <div class="cols-12 col-md-12 col-sm-12 col-xs-12 q-py-md q-px-md">
                <q-table flat bordered ref="tableRef" tabindex="0" title="Equipos" :rows="rows" :filter="filter"
                  :columns="columns" row-key="name">
                  <template v-slot:top>
                    <q-btn round color="primary" @click="dialogEquipo = true" icon="add" />
                    <q-space />
                    <q-input borderless dense debounce="300" color="primary" v-model="filter">
                      <template v-slot:append>
                        <q-icon name="search" />
                      </template>
                    </q-input>
                  </template>
                  <template v-slot:body-cell-estado="props">
                    <q-td :props="props">
                      <q-icon :color="props.value == 1 ? 'green' : 'red'" :name="props.value == 1 ? 'check' : 'close'" />
                    </q-td>
                  </template>
                  <template v-slot:body-cell-qr="props">
                    <q-td :props="props">
                      <div v-if="props.row.codigoQR" v-html="props.row.codigoQR" />
                      <!-- <q-icon :color="props.value == 1 ? 'green' : 'red'" :name="props.value == 1 ? 'check' : 'close'" /> -->
                    </q-td>
                  </template>
                </q-table>
              </div>
            </div>
          </div>
        </q-card-section>
      </q-card>
    </div>
  </div>
  <q-dialog v-model="dialogEquipo" persistent>
    <q-card>
      <q-card-section class="bg-primary text-white">
        <div class="text-h5">
          {{
            tipo == 0 ? 'Nuevo Equipo' : `Editar Equipo`
          }}
        </div>
      </q-card-section>
      <q-card-section class="q-pt-md">
        <q-form ref="refForm" greedy>
          <div class="q-px-md">
            <div class="row">
              <div class="cols-12 col-md-12 col-sm-12 col-xs-12 q-px-md q-pb-md">
                <q-select v-model="equipo.idTipo" :options="listTipoEquipo" label="Tipo Equipo" option-value="id"
                  option-label="descripcion" />
              </div>
              <div class="cols-12 col-md-12 col-sm-12 col-xs-12 q-px-md q-py-xs">
                <q-input dense label="Marca" class="txtuppercase" v-model="equipo.marca"
                  :rules="[val => !!val || 'Marca es Obligatoria']"></q-input>
              </div>
              <div class="cols-12 col-md-12 col-sm-12 col-xs-12 q-px-md q-py-xs">
                <q-input dense label="Color" class="txtuppercase" v-model="equipo.color"
                  :rules="[val => !!val || 'Color es Obligatorio']"></q-input>
              </div>
            </div>
          </div>
        </q-form>
      </q-card-section>
      <q-card-actions align="right">
        <q-btn flat label="Cancelar" color="negative" @click="closeDialog()" />
        <q-btn flat label="Aceptar" color="primary" @click="agregarEquipo()" />
      </q-card-actions>
    </q-card>
  </q-dialog>
  <q-dialog v-model="dialogQR" persistent style="height: 200px;">
    <q-card>
      <q-card-section class="bg-primary text-white">
        <div class="text-h5">
          QR ASIGNADO
        </div>
      </q-card-section>
      <q-card-section class="q-pt-md">
        <div class="q-px-md">
          <div class="row">
            <div class="cols-12 col-md-12 col-sm-12 col-xs-12 q-px-md">
              <div class="text-h6">
                Este codigo QR se ha asignado a tu Equipo, muestralo al ingresar.
              </div>
            </div>
            <div class="cols-12 col-md-12 col-sm-12 col-xs-12 q-px-md">
              <div v-if="qrCodeSVGDialog" v-html="qrCodeSVGDialog" />
            </div>
          </div>
        </div>
      </q-card-section>
      <q-card-actions align="right">
        <q-btn flat label="Aceptar" color="negative" @click="closeDialogQR()" />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, capitalize } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { getFirestore, collection, getDocs, query, where, getDoc, addDoc, doc } from 'firebase/firestore';
import { db } from 'src/boot/firebase';
import { Loading } from 'quasar';
import qrcodeGenerator from 'qrcode-generator';

const isMounted: any = ref(0);
const alumno: any = ref({
  nombre: '',
  escuelaProfesional: '',
  codigo: '',
  emailInstitucional: '',
  email: '',
  dni: '',
  fechaNacimiento: '',
  sexo: '',
  reconocimientoFacial: '',
});
const refForm: any = ref(null);
const columns: any = ref([
  {
    name: 'tipo',
    required: true,
    label: 'Tipo',
    field: 'tipo',
    align: 'center',
    sortable: false,
  },
  {
    name: 'marca',
    required: true,
    label: 'Marca',
    field: 'marca',
    align: 'center',
    sortable: false,
  },
  {
    name: 'color',
    required: true,
    label: 'Color',
    field: 'color',
    align: 'center',
    sortable: false,
  },
  {
    name: 'qr',
    required: true,
    label: 'QR',
    field: 'qr',
    align: 'center',
    sortable: false
  },
  {
    name: 'estado',
    required: false,
    label: 'Estado',
    field: 'estado',
    align: 'center',
    sortable: false
  },
  {
    name: 'action',
    required: false,
    label: 'Action',
    field: 'action',
    align: 'center',
    sortable: false
  }
]);
const rows = ref<Array<any>>([]);
const dialogEquipo = ref(false);
const dialogQR = ref(false)
//FORM PERMISOS
const refFormPermisos: any = ref(null);
const qrCodeSVGDialog: any = ref(null);
const filter = ref('');
const tipo = ref(0);
const equipo: any = ref({
  idTipo: '',
  marca: '',
  color: ''
})
const listTipoEquipo = ref([]);
const closeDialog = () => {
  equipo.value = {
    idTipo: '',
    marca: '',
    color: ''
  }
  dialogEquipo.value = false;
}
const closeDialogQR = () => {
  listar();
  dialogQR.value = false;
}

const generateRandomId = (length: any) => {
  const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let randomId = "";
  for (let i = 0; i < length; i++) {
    randomId += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return randomId;
}

const agregarEquipo = async () => {
  Loading.show();
  const randomId = generateRandomId(10);
  const qrcode = qrcodeGenerator(0, "L");
  qrcode.addData(randomId);
  qrcode.make();

  const qrcodeSvg = qrcode.createSvgTag({ scalable: true });

  qrCodeSVGDialog.value = qrcodeSvg

  // const tipoEquipoRef = doc(db, '')

  const data = {
    codigo: alumno.value.codigo,
    codigoQR: qrcodeSvg,
    color: equipo.value.color,
    estado: 1,
    idTipo: equipo.value.idTipo,
    marca: equipo.value.marca,
    nroDocumento: '',
    tipoPersona: 0
  }

  const equiposCollection = collection(db, 'Equipo');
  await addDoc(equiposCollection, data)

  Loading.hide();
  closeDialog();
  dialogQR.value = true


  // this.db.collection("codigos_qr").add({
  //   contenido: randomId,
  //   svg: qrcodeSvg,
  //   fecha: new Date(),
  // });
}

const cargarEquipos = async (codigo: any) => {
  try {
    const equiposCollection = collection(db, 'Equipo');
    const querySnapshot = await getDocs(query(equiposCollection, where('codigo', '==', codigo), where('estado', '==', 1)));
    const equipos: any = [];
    for (const doc of querySnapshot.docs) {
      const equipoData = doc.data();
      equipos.push({
        id: doc.id,
        ...equipoData
      });
    }
    return equipos;
  } catch (error) {
    console.error('Error obteniendo equipos por código:', error);
    return [];
  }
}

const cargarTipoEquipos = async () => {
  try {
    const tipoEquiposCollection = collection(db, 'tipoEquipo');
    const queryFirebase = await getDocs(query(tipoEquiposCollection, where('estado', '==', true)));
    const tipoEquipos: any = [];
    queryFirebase.forEach((doc) => {
      tipoEquipos.push({ id: doc.id, ...doc.data() });
    });
    return tipoEquipos;
  } catch (error) {
    console.error('Error obteniendo tipo de equipos:', error);
    return [];
  }
}

const listar = async () => {
  if (isMounted.value == 1) Loading.show()
  const equipos = await cargarEquipos(alumno.value.codigo);
  rows.value = equipos.map((equipo: any) => {
    equipo.tipo = equipo.idTipo.descripcion
    return equipo;
  });
  if (isMounted.value == 1) Loading.hide()
}

onMounted(async () => {
  Loading.show()
  const userLocal = JSON.parse(localStorage.getItem('user')!)
  alumno.value.nombre = userLocal.nombre;
  alumno.value.escuelaProfesional = userLocal.escuela;
  alumno.value.codigo = userLocal.codigo;
  alumno.value.emailInstitucional = userLocal.correo;
  alumno.value.email = userLocal.correoPersonal;
  alumno.value.dni = userLocal.nroDocumento;
  const fechaMilisegundos = userLocal.fechaNacimiento.seconds * 1000 + Math.round(userLocal.fechaNacimiento.nanoseconds / 1000000);
  const fecha = new Date(fechaMilisegundos);
  const year = fecha.getFullYear();
  const month = String(fecha.getMonth() + 1).padStart(2, '0');
  const day = String(fecha.getDate()).padStart(2, '0');
  const fechaFormateada = `${year}/${month}/${day}`;
  alumno.value.fechaNacimiento = fechaFormateada
  alumno.value.sexo = userLocal.sexo;
  alumno.value.reconocimientoFacial = userLocal.codigoFacial;
  listTipoEquipo.value = await cargarTipoEquipos();
  await listar();
  isMounted.value = 1;
  Loading.hide();
})

</script>
