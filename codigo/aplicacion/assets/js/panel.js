// El objeto PANEL va a tener los datos del panel.
let PANEL = {
  telescopio: {
    latitud: 0,
    longitud: 0,
    altitud: 0,
    pais: "",
    angulo: 1,
    velocidad: 0,
  },
  stellarium: {
    online: false,
  },
  objeto: {
    tipo: "SolarSystem:planet",
    nombre: "Earth",
    visible: false,
    azimut: 0,
    elevacion: 0,
    iluminado: 0,
    distancia: 0,
  },
  // TODO rever nombres variables serial
  serial: {
    seguimiento: 0,
    intervalo: 0,
  },
};

/* ->->->->->->->->->->->-> */
/* ->->->->->->->->->->->-> */
/* ->->->->->->->->->->->-> */

// FUNCIONES STELLARIUM
// API main status
async function stellarium_main_status() {
  const url = "http://localhost:8090/api/main/status";
  try {
    const respuesta = await fetch(url);
    const datos = await respuesta.json();
    PANEL.telescopio.latitud = datos.location.latitude;
    PANEL.telescopio.longitud = datos.location.longitude;
    PANEL.telescopio.altitud = datos.location.altitude;
    PANEL.telescopio.pais = datos.location.country;
    PANEL.stellarium.online = true;
  } catch (error) {
    //TODO mostrar el error en pantalla y link a instrucciones para setear stellarium
    console.log("error stellarium_main_status");
  }
  return true;
}

// obtiene los datos del objeto seleccionado y los pone en PANEL
async function stellarium_object_info() {
  const url = "http://localhost:8090/api/objects/info?name=" + PANEL.objeto.nombre + "&format=json";
  try {
    const respuesta = await fetch(url);
    const datos = await respuesta.json();

    // Si el objeto está debajo del horizonte pone la elevación en 90
    if (datos.altitude <= 5) {
      PANEL.objeto.visible = false;
    } else {
      PANEL.objeto.visible = true;
    }
    PANEL.objeto.azimut = datos.azimuth;
    PANEL.objeto.elevacion = datos.altitude;
    PANEL.objeto.iluminado = "illumination" in datos ? datos.illumination.toFixed(2) : false;
    PANEL.objeto.distancia = "distance" in datos ? datos.distance.toFixed(4) : false;
  } catch (error) {
    //TODO mostrar el error en pantalla y link a instrucciones para setear stellarium
    console.log(error);
  }
}

// actualiza locacion con datos de PANEL
function panel_actualiza_locacion() {
  document.getElementById("LATITUD").setAttribute("value", PANEL.telescopio.latitud);
  document.getElementById("LONGITUD").setAttribute("value", PANEL.telescopio.longitud);
  document.getElementById("ALTITUD").setAttribute("value", PANEL.telescopio.altitud);
}

// actualiza la lista de tipos de elementos celeste
async function panel_lista_tipos_objetos_celestes() {
  const url = "http://localhost:8090/api/objects/listobjecttypes";

  let listaTipoObjetosCelestes = document.getElementById("LISTA_TIPO_OBJETOS");
  try {
    const respuesta = await fetch(url);
    const datos = await respuesta.json();
    datos.forEach(function (elemento) {
      var opcion = document.createElement("option");
      opcion.text = elemento.name;
      opcion.value = elemento.key;
      elemento.name == "Planets" // selecciono planetas de una para su mayor confort
        ? (opcion.selected = true)
        : (opcion.selected = false);
      listaTipoObjetosCelestes.appendChild(opcion);
    });
  } catch (error) {
    //TODO mostrar el error en pantalla y link a instrucciones para setear stellarium
    console.log("error lista Tipo Objetos Celestes");
  }
}

// actualiza la lista de objeto celestes
async function panel_lista_objetos_celestes() {
  const url = "http://localhost:8090/api/objects/listobjectsbytype?type=" + PANEL.objeto.tipo;

  let listaObjetosCelestes = document.getElementById("LISTA_OBJETOS");
  listaObjetosCelestes.innerText = ""; // vacia la lista

  try {
    const respuesta = await fetch(url);
    const datos = await respuesta.json();

    datos.forEach(function (elemento) {
      var opcion = document.createElement("option");
      opcion.text = elemento;
      opcion.value = elemento;
      listaObjetosCelestes.appendChild(opcion);
    });
  } catch (error) {
    //TODO mostrar el error en pantalla y link a instrucciones para setear stellarium
    console.log("error lista objetos");
  }
}

// actualiza los valores del objeto seleccionado
function panel_objeto_seleccionado() {
  try {
    var visible = PANEL.objeto.visible ? "SI" : "NO";
    var info = '<dl class="row">';
    info += '<dt class="col-4">Visible</dt> <dd class="col-8">' + visible + "</dd>";
    info += '<dt class="col-4">AZ</dt> <dd class="col-8">' + PANEL.objeto.azimut.toFixed(4) + "&#176;</dd>";
    info += '<dt class="col-4">EL</dt> <dd class="col-8">' + PANEL.objeto.elevacion.toFixed(4) + "&#176;</dd>";
    if (PANEL.objeto.iluminado) info += '<dt class="col-4">Iluminado</dt> <dd class="col-8">' + PANEL.objeto.iluminado + " %</dd>";
    if (PANEL.objeto.distancia) info += '<dt class="col-4">Distancia</dt> <dd class="col-8">' + PANEL.objeto.distancia + " AU</dd>";
    if (PANEL.objeto.distancia) info += '<dt class="col-4">Distancia</dt> <dd class="col-8">' + commify(ua_a_km()) + " km</dd>";

    info += "</dl>";

    //console.log(info);
    let objetoInfo = document.getElementById("OBJETO_INFO");
    objetoInfo.innerHTML = info;
    //console.log(datos);
  } catch (error) {
    //TODO mostrar el error en pantalla y link a instrucciones para setear stellarium
    console.log(error);
  }
}

// setea la distancia angular en PANEL
function panel_distancia_angular() {
  PANEL.telescopio.angulo = document.querySelector('input[name="ANGULO"]:checked').value;
}

// agrega la clase modo noche al tag html
function panel_modo_noche() {
  var html = document.getElementById("HTML");
  html.classList.contains("modo_noche") ? html.removeAttribute("class", "modo_noche") : html.setAttribute("class", "modo_noche");
}

// setea el nombre del objeto seleccionado en PANEL
function panel_set_objeto(evento) {
  PANEL.objeto.nombre = evento.target.value;
  const objeto = document.getElementById("OBJETO");
  objeto.innerHTML = evento.target.value;
}
//function setTipoObjetoPanel(evento) {
//PANEL.objeto.tipo = evento.target.value;
//}

// chequea que estemos conectados a STELLARIUM
function panel_stellarium_online() {
  let STELLARIUM = document.getElementById("STELLARIUM");
  if (PANEL.stellarium.online) {
    STELLARIUM.innerHTML = '<i class="me-2 fa-solid fa-star"></i>STELLARIUM conectado';
    STELLARIUM.classList.add("disabled");
    clearInterval(intervalo_stellarium_online);
  }
}

// transforma UA a Km
function ua_a_km() {
  var distKM = parseFloat(PANEL.objeto.distancia) * 149597870.7;
  distKM = distKM.toFixed(0);
  return distKM;
}

// https://www.codingem.com/comma-thousand-separator-in-javascript/
function commify(n) {
  var parts = n.toString().split(".");
  const numberPart = parts[0];
  const decimalPart = parts[1];
  const thousands = /\B(?=(\d{3})+(?!\d))/g;
  return numberPart.replace(thousands, ".") + (decimalPart ? "," + decimalPart : "");
}

/* ->->->->->->->->->->->-> */
/* ->->->->->->->->->->->-> */
/* ->->->->->->->->->->->-> */

/*
// FUNCIONES STELLARIUM
// chequea que el servidor de stellarium esté andando
// toma los datos de LAT LONG ALT etc y los pone en PANEL y en el DOM
async function conectar() {
  const url = "http://localhost:8090/api/main/status";
  try {
    const respuesta = await fetch(url);
    const datos = await respuesta.json();
    //console.log(datos);
    PANEL.telescopio.latitud = datos.location.latitude;
    PANEL.telescopio.longitud = datos.location.longitude;
    PANEL.telescopio.altitud = datos.location.altitude;
    PANEL.telescopio.pais = datos.location.country;

    document.getElementById("LATITUD").setAttribute("value", datos.location.latitude);
    document.getElementById("LONGITUD").setAttribute("value", datos.location.longitude);
    document.getElementById("ALTITUD").setAttribute("value", datos.location.altitude);
  } catch (error) {
    //TODO mostrar el error en pantalla y link a instrucciones para setear stellarium
    console.log("error");
  }
  listaTiposObjetosCelestes();
}

// listado de TIPOS de objeto
async function listaTiposObjetosCelestes() {
  const url = "http://localhost:8090/api/objects/listobjecttypes";

  let listaTipoObjetosCelestes = document.getElementById("LISTA_TIPO_OBJETOS");
  var seleccionar = document.createElement("option");
  seleccionar.text = "Seleccione...";
  listaTipoObjetosCelestes.appendChild(seleccionar);
  try {
    const respuesta = await fetch(url);
    const datos = await respuesta.json();

    datos.forEach(function (elemento) {
      //console.log(elemento.name);
      //console.log(elemento.key);
      var opcion = document.createElement("option");
      opcion.text = elemento.name;
      opcion.value = elemento.key;
      elemento.name == "Planets" // selecciono planetas de una para su mayor confort
        ? (opcion.selected = true)
        : (opcion.selected = false);
      listaTipoObjetosCelestes.appendChild(opcion);
    });
  } catch (error) {
    //TODO mostrar el error en pantalla y link a instrucciones para setear stellarium
    console.log("error");
  }
  listaObjetosCelestes(PANEL.objeto.tipo);
}

// listado de OBJETO segun tipo
async function listaObjetosCelestes() {
  const url = "http://localhost:8090/api/objects/listobjectsbytype?type=" + PANEL.objeto.tipo;

  let listaObjetosCelestes = document.getElementById("LISTA_OBJETOS");
  listaObjetosCelestes.innerText = "";

  try {
    const respuesta = await fetch(url);
    const datos = await respuesta.json();

    var seleccionar = document.createElement("option");
    seleccionar.text = "Seleccione...";
    listaObjetosCelestes.appendChild(seleccionar);

    datos.forEach(function (elemento) {
      //console.log(elemento.key);
      var opcion = document.createElement("option");
      opcion.text = elemento;
      opcion.value = elemento;
      listaObjetosCelestes.appendChild(opcion);
    });
  } catch (error) {
    //TODO mostrar el error en pantalla y link a instrucciones para setear stellarium
    console.log("error");
  }
}

// obtiene coordenadas del objeto
// @param string nombre del objeto
//
async function datosObjeto() {
  const url = "http://localhost:8090/api/objects/info?name=" + PANEL.objeto.nombre + "&format=json";
  try {
    const respuesta = await fetch(url);
    const datos = await respuesta.json();

    // Si el objeto está debajo del horizonte pone la elevación en 0
    //console.log(datos);
    if (datos.altitude <= 0) {
      //localhost:8090/api/main/status
      http: PANEL.objeto.azimut = datos.azimuth;
      PANEL.objeto.elevacion = 0;
    } else {
      PANEL.objeto.azimut = datos.azimuth;
      PANEL.objeto.elevacion = datos.altitude;
    }

    var visible = datos.altitude > 0 ? "SI" : "NO";
    var info = '<dl class="row">';
    info += '<dt class="col-4">Visible</dt> <dd class="col-8">' + visible + "</dd>";
    info += '<dt class="col-4">AZ</dt> <dd class="col-8">' + datos.azimuth.toFixed(3) + "&#176;</dd>";
    info += '<dt class="col-4">EL</dt> <dd class="col-8">' + datos.altitude.toFixed(3) + "&#176;</dd>";
    if ("illumination" in datos) info += '<dt class="col-4">Iluminado</dt> <dd class="col-8">' + datos.illumination.toFixed(2) + " %</dd>";
    if ("distance" in datos) info += '<dt class="col-4">Distancia</dt> <dd class="col-8">' + datos.distance.toFixed(4) + " AU</dd>";
    if ("distance" in datos) {
      var distKM = parseFloat(datos.distance) * 149597870.7;
      distKM = distKM.toFixed(0);
      info += '<dt class="col-4">Distancia</dt> <dd class="col-8">' + commify(distKM) + " km</dd>";
    }
    info += "</dl>";

    //console.log(info);
    let objetoInfo = document.getElementById("OBJETO_INFO");
    objetoInfo.innerHTML = info;
    //console.log(datos);
  } catch (error) {
    //TODO mostrar el error en pantalla y link a instrucciones para setear stellarium
    console.log(error);
  }
}

function angulo() {
  PANEL.telescopio.angulo = document.querySelector('input[name="ANGULO"]:checked').value;
  console.log(PANEL.telescopio.angulo);
}

// FUNCIONES PANTALLA
// TODO agregar boton para activar/desactivar
function modoNoche() {
  //var html = document.getElementsByTagName("html")[0]; // '0' to assign the first (and only `HTML` tag)
  var html = document.getElementById("HTML");
  html.classList.contains("modo_noche") ? html.removeAttribute("class", "modo_noche") : html.setAttribute("class", "modo_noche");
}

// setea el nombre del objeto seleccionado en PANEL
function setNombreObjetoPanel(evento) {
  PANEL.objeto.nombre = evento.target.value;
  const objeto = document.getElementById("OBJETO");
  objeto.innerHTML = evento.target.value;
}


// setea el tipo del objeto seleccionado en PANEL
function setTipoObjetoPanel(evento) {
  PANEL.objeto.tipo = evento.target.value;
}
*/
// ->->->->->->->
// SERIAL WEB API
// ->->->->->->->

async function conectarTelescopio() {
  port = await navigator.serial.requestPort({});
  await port.open({ baudRate: 115200 });

  //document.querySelector("input").disabled = false;
  TELESCOPIO.innerText = "🔌 Desconectar Telescopio";

  const encoder = new TextEncoderStream();
  outputDone = encoder.readable.pipeTo(port.writable);
  outputStream = encoder.writable;

  //OBJETO_INFO.addEventListener("change", () => {
  //if (port && port.writable) {
  //const value = parseInt(PANEL.objeto.azimut);
  //const bytes = new Uint8Array([value]);
  //const writer = port.writable.getWriter();

  //console.log(bytes);
  //writer.write(bytes);
  //writer.releaseLock();
  //}
  //});
}

async function enviarComandoTelescopio() {
  try {
    if (port) {
      //const value = parseInt(PANEL.objeto.azimut);
      let comando = "AZp ";
      comando += PANEL.objeto.azimut;
      comando += " 5000 \r\n";
      //const encoder = new TextEncoderStream();
      //const writer = port.writable.getWriter();
      //await writer.write(encoder.encode(comando));
      //writer.releaseLock();

      //const bytes = new Uint8Array([value]);
      //const writer = port.writable.getWriter();
      //const encoder = new TextEncoder();
      //writer.write(encoder.encode(comando));
      //writer.releaseLock();

      //console.log(encoder.encode(comando));
      //const textEncoder = new TextEncoderStream();
      //const writableStreamClosed = textEncoder.readable.pipeTo(port.writable);
      //const writer = textEncoder.writable.getWriter();
      //await writer.write(comando);
      //await writableStreamClosed;

      //writer.releaseLock();
      const writer = outputStream.getWriter();
      console.log("[SEND]", comando);
      writer.write(comando);
      writer.releaseLock();
    } else {
      console.log("ERROR PORT");
    }
  } catch (error) {
    console.log(error);
  }
}
// EVENT LISTENERS

//const OBJETO_INFO = document.querySelector("#OBJETO_INFO");

const TELESCOPIO = document.getElementById("TELESCOPIO");
let port;
TELESCOPIO.addEventListener("click", function () {
  if (port) {
    port.close();
    port = undefined;
    TELESCOPIO.innerText = "🔌 Conectar con el Telescopio";
  } else {
    conectarTelescopio();
  }
});

const NOCHE = document.querySelector("#NOCHE");
NOCHE.addEventListener("click", panel_modo_noche);

const STELLARIUM = document.querySelector("#STELLARIUM");
STELLARIUM.addEventListener("click", stellarium_main_status);
STELLARIUM.addEventListener("click", panel_lista_tipos_objetos_celestes);
STELLARIUM.addEventListener("click", panel_lista_objetos_celestes);

const LISTA_OBJETOS = document.querySelector("#LISTA_OBJETOS");
LISTA_OBJETOS.addEventListener("change", panel_set_objeto);
LISTA_OBJETOS.addEventListener("change", stellarium_object_info);
LISTA_OBJETOS.addEventListener("change", panel_objeto_seleccionado);

/*
const LISTA_TIPO_OBJETOS = document.querySelector("#LISTA_TIPO_OBJETOS");
LISTA_TIPO_OBJETOS.addEventListener("change", setTipoObjetoPanel);
LISTA_TIPO_OBJETOS.addEventListener("change", listaObjetosCelestes);

const SEGUIMIENTO = document.querySelector("#SEGUIMIENTO");
SEGUIMIENTO.addEventListener("click", () => {
  PANEL.serial.seguimiento = PANEL.serial.seguimiento == 0 ? setInterval(datosObjeto, 200) : PANEL.serial.seguimiento;
  PANEL.serial.intervalo = PANEL.serial.intervalo == 0 ? setInterval(enviarComandoTelescopio, 200) : PANEL.serial.intervalo;
});

const STOP = document.querySelector("#STOP");
STOP.addEventListener("click", () => {
  clearInterval(PANEL.serial.seguimiento);
  PANEL.serial.seguimiento = 0;
  clearInterval(PANEL.serial.intervalo);
  PANEL.serial.intervalo = 0;
  console.log("STOP");
});

const ANGULO = document.querySelector("#ANGULO");
ANGULO.addEventListener("click", angulo);
*/

// corre panel_stellarium_online hasta que conecta
const intervalo_stellarium_online = setInterval(panel_stellarium_online, 200);
