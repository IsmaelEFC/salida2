// Cargar datos dinámicamente al iniciar la página
document.addEventListener("DOMContentLoaded", function () {
  cargarVehiculos();
  cargarFuncionarios();
  cargarRadiales();
  cargarTiposServicio();
  cargarObservaciones();
  setFechaActual();

  setTimeout(() => {
    document.getElementById("fecha").focus();
  }, 500);
});

let contadorAcompanantes = 1;
let contadorRadios = 1;

// ─────────────────────────────────────────────
// CARGA DE DATOS DESDE JSON
// ─────────────────────────────────────────────

async function cargarVehiculos() {
  try {
    const response = await fetch("listado_vehiculos.json");
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    const vehiculos = await response.json();
    const select = document.getElementById("vehiculo");

    vehiculos.forEach((vehiculo) => {
      const option = document.createElement("option");
      const valorCompleto = `${vehiculo.codigo} - ${vehiculo.PPU}`;
      option.value = valorCompleto;
      option.textContent = valorCompleto;
      select.appendChild(option);
    });

    const manualOption = document.createElement("option");
    manualOption.value = "MANUAL";
    manualOption.textContent = "OTRO (Ingreso manual)";
    select.appendChild(manualOption);
  } catch (error) {
    console.error("Error al cargar vehículos:", error);
    const select = document.getElementById("vehiculo");
    const option = document.createElement("option");
    option.value = "MANUAL";
    option.textContent = "OTRO (Ingreso manual)";
    select.appendChild(option);
  }
}

async function cargarFuncionarios() {
  try {
    const response = await fetch("listado_funcionarios.json");
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    const funcionarios = await response.json();
    const datalist = document.getElementById("funcionarios");

    funcionarios.forEach((funcionario) => {
      const option = document.createElement("option");
      option.value = `${funcionario.grado} ${funcionario.nombre}`;
      option.setAttribute("data-armamento", funcionario.armamento || "");
      option.setAttribute("data-casco", funcionario.casco || "");
      datalist.appendChild(option);
    });
  } catch (error) {
    console.error("Error al cargar funcionarios:", error);
  }
}

async function cargarRadiales() {
  try {
    const response = await fetch("listado_equipamiento.json");
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    const equipos = await response.json();
    const radialesDatalist = document.getElementById("radiales");
    const accesoriosDatalist = document.getElementById("accesorios-list");
    const accesorioSelect = document.getElementById("accesorio-select");

    equipos.forEach((equipo) => {
      const option = document.createElement("option");
      option.value = `${equipo.codigo} - ${equipo.descripcion}`;
      option.setAttribute("data-tipo", equipo.tipo);
      option.setAttribute("data-series", JSON.stringify(equipo.series || []));

      if (equipo.tipo === "radial") {
        radialesDatalist.appendChild(option);
      } else if (equipo.tipo === "accesorio") {
        accesoriosDatalist.appendChild(option.cloneNode(true));
        const optionSelect = document.createElement("option");
        optionSelect.value = `${equipo.codigo} - ${equipo.descripcion}`;
        optionSelect.setAttribute("data-tipo", equipo.tipo);
        optionSelect.setAttribute("data-series", JSON.stringify(equipo.series || []));
        accesorioSelect.appendChild(optionSelect);
      }
    });
  } catch (error) {
    console.error("Error al cargar equipos:", error);
  }
}

function setFechaActual() {
  const fechaInput = document.getElementById("fecha");
  const hoy = new Date();
  const año = hoy.getFullYear();
  const mes = String(hoy.getMonth() + 1).padStart(2, "0");
  const dia = String(hoy.getDate()).padStart(2, "0");
  fechaInput.value = `${año}-${mes}-${dia}`;
}

// ─────────────────────────────────────────────
// TOGGLE GROUPS (fix: usa data-value en lugar de texto)
// ─────────────────────────────────────────────

function setToggle(id, value) {
  const input = document.getElementById(id);
  if (!input) return;
  input.value = value;

  // Buscar el grupo por convención de ID: group-{id}
  const group = document.getElementById(`group-${id}`);
  if (group) {
    group.querySelectorAll(".toggle-btn").forEach((btn) => {
      btn.classList.toggle("active", btn.dataset.value === value);
    });
  }

  // Efectos secundarios
  if (id === "desplazamiento") toggleVehiculo();
  if (id === "accesorios") mostrarCampoSerie();
  if (id === "equipamiento") mostrarCamposEquipamiento();
}

function toggleVehiculo() {
  const desplazamiento = document.getElementById("desplazamiento").value;
  const sectionVehiculo = document.getElementById("section-vehiculo");
  const vehiculoSelect = document.getElementById("vehiculo");

  if (desplazamiento === "INFANTERIA") {
    sectionVehiculo.classList.add("hidden");
    if (vehiculoSelect) {
      vehiculoSelect.removeAttribute("required");
      vehiculoSelect.value = "";
      mostrarCampoManualVehiculo();
    }
  } else {
    sectionVehiculo.classList.remove("hidden");
    if (vehiculoSelect) vehiculoSelect.setAttribute("required", "required");
  }
}

function mostrarCampoManualVehiculo() {
  const vehiculoSelect = document.getElementById("vehiculo");
  const manualVehiculoGroup = document.getElementById("manual-vehiculo-group");

  if (vehiculoSelect.value === "MANUAL") {
    manualVehiculoGroup.classList.remove("hidden");
  } else {
    manualVehiculoGroup.classList.add("hidden");
    document.getElementById("manual-vehiculo").value = "";
  }
}

// ─────────────────────────────────────────────
// MODO EXTERNO (personal fuera del listado)
// ─────────────────────────────────────────────

// ─────────────────────────────────────────────
// MODO EXTERNO PARA RADIOS
// ─────────────────────────────────────────────

function toggleExternoMode(inputId) {
  if (inputId === 'radio') {
    // Manejar modo externo para radio
    const input = document.getElementById(inputId);
    const externoHidden = document.getElementById(`${inputId}-externo`);
    const btn = document.getElementById(`btn-externo-${inputId}`);
    const externoBadge = document.getElementById(`${inputId}-externo-badge`);

    const esExterno = externoHidden && externoHidden.value === "SI";

    if (esExterno) {
      // Volver al modo listado
      externoHidden.value = "NO";
      input.setAttribute("list", "radiales");
      input.placeholder = "Seleccionar radio...";
      input.value = "";
      input.classList.remove("modo-externo");
      if (btn) { btn.textContent = "📋 Listado"; btn.classList.remove("activo"); }
      if (externoBadge) externoBadge.classList.add("hidden");
    } else {
      // Activar modo externo
      externoHidden.value = "SI";
      input.removeAttribute("list");
      input.placeholder = "Ingresar radio manualmente...";
      input.value = "";
      input.classList.add("modo-externo");
      if (btn) { btn.textContent = "Externo"; btn.classList.add("activo"); }
      if (externoBadge) externoBadge.classList.remove("hidden");
      input.focus();
    }
  } else {
    // Manejar modo externo para personal
    const input = document.getElementById(inputId);
    const externoHidden = document.getElementById(`${inputId}-externo`);
    const btn = document.getElementById(`btn-externo-${inputId}`);
    const infoBadge = document.getElementById(`${inputId}-info`);
    const externoBadge = document.getElementById(`${inputId}-externo-badge`);
    const externoCampos = document.getElementById(`${inputId}-externo-campos`);

    const esExterno = externoHidden && externoHidden.value === "SI";

    if (esExterno) {
      // Volver al modo listado
      externoHidden.value = "NO";
      input.setAttribute("list", "funcionarios");
      input.placeholder = "Grado y Nombre";
      input.value = "";
      input.classList.remove("modo-externo");
      if (btn) { btn.textContent = "📋 Listado"; btn.classList.remove("activo"); }
      if (infoBadge) infoBadge.classList.add("hidden");
      if (externoBadge) externoBadge.classList.add("hidden");
      if (externoCampos) externoCampos.classList.add("hidden");
      // Limpiar armamento/casco
      const armInput = document.getElementById(`${inputId}-armamento`);
      const cascoInput = document.getElementById(`${inputId}-casco`);
      if (armInput) armInput.value = "";
      if (cascoInput) cascoInput.value = "";
    } else {
      // Activar modo externo
      externoHidden.value = "SI";
      input.removeAttribute("list");
      input.placeholder = "Nombre completo (externo)";
      input.value = "";
      input.classList.add("modo-externo");
      if (btn) { btn.textContent = "Externo"; btn.classList.add("activo"); }
      if (infoBadge) infoBadge.classList.add("hidden");
      if (externoBadge) externoBadge.classList.remove("hidden");
      if (externoCampos) externoCampos.classList.remove("hidden");
      // Limpiar armamento/casco
      const armInput = document.getElementById(`${inputId}-armamento`);
      const cascoInput = document.getElementById(`${inputId}-casco`);
      if (armInput) armInput.value = "";
      if (cascoInput) cascoInput.value = "";
      // Foco en el input
      input.focus();
    }
  }
}

// ─────────────────────────────────────────────
// AUTOCOMPLETAR ARMAMENTO / CASCO
// ─────────────────────────────────────────────

function autocompletarArmamento(inputId) {
  const externoHidden = document.getElementById(`${inputId}-externo`);
  // Si está en modo externo, no autocompletar
  if (externoHidden && externoHidden.value === "SI") return;

  const input = document.getElementById(inputId);
  const datalist = document.getElementById("funcionarios");
  const infoBadge = document.getElementById(`${inputId}-info`);
  const valorInput = input.value.trim();

  const opciones = datalist.querySelectorAll("option");
  let encontrado = false;

  for (let option of opciones) {
    if (option.value === valorInput) {
      const armamento = option.getAttribute("data-armamento");
      const casco = option.getAttribute("data-casco");

      const armamentoInput = document.getElementById(`${inputId}-armamento`);
      const cascoInput = document.getElementById(`${inputId}-casco`);
      if (armamentoInput) armamentoInput.value = armamento || "";
      if (cascoInput) cascoInput.value = casco || "";

      if (infoBadge) {
        infoBadge.innerHTML = `<span>Armamento: ${armamento || "Sin arma"}</span><span>Casco: ${casco || "Sin casco"}</span>`;
        infoBadge.classList.remove("hidden");
      }

      encontrado = true;
      break;
    }
  }

  if (!encontrado && infoBadge) {
    infoBadge.classList.add("hidden");
    // Limpiar si no hay coincidencia
    const armamentoInput = document.getElementById(`${inputId}-armamento`);
    const cascoInput = document.getElementById(`${inputId}-casco`);
    if (armamentoInput) armamentoInput.value = "";
    if (cascoInput) cascoInput.value = "";
  }
}

// ─────────────────────────────────────────────
// RADIOS ADICIONALES
// ─────────────────────────────────────────────

function agregarRadioAdicional() {
  contadorRadios++;
  const n = contadorRadios;
  const container = document.getElementById("radios-adicionales");

  const div = document.createElement("div");
  div.className = "form-group";
  div.id = `grupo-radio${n}`;
  div.innerHTML = `
    <label for="radio${n}">Radio Adicional ${n}</label>
    <div class="input-row">
      <input type="text" id="radio${n}" list="radiales" placeholder="Seleccionar radio...">
      <button type="button" class="btn-externo" id="btn-externo-radio${n}"
        onclick="toggleExternoMode('radio${n}')" title="Ingresar radio manualmente">
        Listado
      </button>
      <button type="button" class="btn-danger" onclick="eliminarRadioAdicional(${n})"
        style="padding: 10px 12px;" title="Eliminar radio">×</button>
    </div>
    <div id="radio${n}-externo-badge" class="badge-externo hidden">Radio ingresado manualmente</div>
    <input type="hidden" id="radio${n}-externo" value="NO">
  `;

  container.appendChild(div);
}

function eliminarRadioAdicional(numero) {
  const grupo = document.getElementById(`grupo-radio${numero}`);
  if (grupo) grupo.remove();
}

// ─────────────────────────────────────────────
// ACOMPAÑANTES ADICIONALES
// ─────────────────────────────────────────────

function agregarAcompanante() {
  contadorAcompanantes++;
  const n = contadorAcompanantes;
  const container = document.getElementById("acompanantes-adicionales");

  const div = document.createElement("div");
  div.className = "form-group";
  div.id = `grupo-acomp${n}`;
  div.innerHTML = `
    <label for="acomp${n}">Acompañante ${n}</label>
      <div style="display: flex; gap: 8px; flex-direction: column;">
      <div class="input-row">
        <input type="text" id="acomp${n}" list="funcionarios" placeholder="Grado y Nombre"
          onchange="autocompletarArmamento('acomp${n}')" onfocus="this.select()">
        <button type="button" class="btn-externo" id="btn-externo-acomp${n}"
          onclick="toggleExternoMode('acomp${n}')" title="Marcar como personal externo al listado">
          Listado
        </button>
        <button type="button" class="btn-danger" onclick="eliminarAcompanante(${n})"
          style="padding: 10px 12px;" title="Eliminar acompañante">×</button>
      </div>
      <div id="acomp${n}-info" class="badge-info hidden"></div>
      <div id="acomp${n}-externo-badge" class="badge-externo hidden">Personal externo al listado</div>
      
      <!-- Campos para personal externo -->
      <div id="acomp${n}-externo-campos" class="hidden">
        <div class="grid-2">
          <div class="form-group">
            <label for="acomp${n}-armamento-manual">Armamento</label>
            <input type="text" id="acomp${n}-armamento-manual" placeholder="Ej: TBX12345">
          </div>
          <div class="form-group">
            <label for="acomp${n}-casco-manual">Casco</label>
            <input type="text" id="acomp${n}-casco-manual" placeholder="Ej: 71900">
          </div>
        </div>
        <div class="form-group" id="acomp${n}-chaleco-group" class="hidden">
          <label for="acomp${n}-chaleco-manual">Chaleco</label>
          <input type="text" id="acomp${n}-chaleco-manual" placeholder="Ej: CH-${String(n + 1).padStart(3, "0")}">
        </div>
      </div>
      
      <input type="hidden" id="acomp${n}-armamento">
      <input type="hidden" id="acomp${n}-casco">
      <input type="hidden" id="acomp${n}-externo" value="NO">
    </div>
  `;

  container.appendChild(div);

  if (document.getElementById("equipamiento").value === "Sí") {
    agregarCampoChalecoAdicional(n);
  }
}

function eliminarAcompanante(numero) {
  const grupo = document.getElementById(`grupo-acomp${numero}`);
  if (grupo) grupo.remove();

  const campoChaleco = document.getElementById(`chaleco-acomp${numero}`);
  if (campoChaleco) {
    const parent = campoChaleco.closest(".form-group");
    if (parent) parent.remove();
  }
}

// ─────────────────────────────────────────────
// VALIDACIÓN
// ─────────────────────────────────────────────

function validarFormulario() {
  let isValid = true;
  const desplazamiento = document.getElementById("desplazamiento").value;

  // Limpiar bordes anteriores
  document.querySelectorAll("input, select, textarea").forEach((el) => {
    el.style.borderColor = "";
  });

  // Campos siempre requeridos
  const camposRequeridos = ["fecha", "jp", "acomp1", "tipo"];
  camposRequeridos.forEach((campo) => {
    const input = document.getElementById(campo);
    if (input && !input.value.trim()) {
      input.style.borderColor = "#ef4444";
      isValid = false;
    }
  });

  // Validación vehículo si es motorizado
  if (desplazamiento === "MOTORIZADO") {
    const vehiculoSelect = document.getElementById("vehiculo");
    if (vehiculoSelect && !vehiculoSelect.value.trim()) {
      vehiculoSelect.style.borderColor = "#ef4444";
      isValid = false;
    } else if (vehiculoSelect && vehiculoSelect.value === "MANUAL") {
      const manualVehiculo = document.getElementById("manual-vehiculo");
      if (manualVehiculo && !manualVehiculo.value.trim()) {
        manualVehiculo.style.borderColor = "#ef4444";
        isValid = false;
      }
    }

    const kmInput = document.getElementById("km");
    if (kmInput && !String(kmInput.value).trim()) {
      kmInput.style.borderColor = "#ef4444";
      isValid = false;
    }
  }

  if (!isValid) {
    alert("Por favor, complete los campos obligatorios marcados en rojo.");
  }

  return isValid;
}

// ─────────────────────────────────────────────
// GENERAR Y ENVIAR MENSAJE WHATSAPP
// ─────────────────────────────────────────────

function enviarWhatsApp() {
  if (!validarFormulario()) return;

  const fechaInput = document.getElementById("fecha").value;
  const [año, mes, dia] = fechaInput.split("-");
  const fechaFormateada = `${dia}-${mes}-${año}`;

  const desplazamiento = document.getElementById("desplazamiento").value;
  const jp = document.getElementById("jp").value;
  const jpArmamento = document.getElementById("jp-armamento").value;
  const jpCasco = document.getElementById("jp-casco").value;
  const jpChaleco = document.getElementById("chaleco-jp").value;
  const jpExterno = document.getElementById("jp-externo").value === "SI";
  const equipamiento = document.getElementById("equipamiento").value;
  const tipo = document.getElementById("tipo").value;
  const obs = document.getElementById("obs").value;

  let mensaje = `*SALIDA OS9*\n\n`;
  mensaje += `*Fecha:* ${fechaFormateada}\n`;

  if (desplazamiento === "INFANTERIA") {
    mensaje += `*Modo:* INFANTERÍA\n`;
  }

  if (desplazamiento === "MOTORIZADO") {
    const vehiculoSelect = document.getElementById("vehiculo").value;
    const manualVehiculo = document.getElementById("manual-vehiculo").value.trim();
    const km = document.getElementById("km").value;
    const tarjeta = document.getElementById("tarjeta-combustible").value;

    let vehiculoCompleto = vehiculoSelect === "MANUAL" ? manualVehiculo : vehiculoSelect;
    let vehiculoCodigo = vehiculoCompleto;
    let vehiculoPatente = "";
    if (vehiculoCompleto.includes(" - ")) {
      [vehiculoCodigo, vehiculoPatente] = vehiculoCompleto.split(" - ");
    }

    mensaje += `*Vehículo:* ${vehiculoCodigo}\n`;
    if (vehiculoPatente) mensaje += `*Patente:* ${vehiculoPatente}\n`;
    if (km) mensaje += `*KM:* ${km}\n`;
    mensaje += `*Tarjeta Comb.:* ${tarjeta}\n`;
  }

  mensaje += `\n*Personal:*\n`;

  // JP
  mensaje += `• *JP:* ${jpExterno ? "[EXTERNO] " : ""}${jp}`;
  
  // Obtener armamento, casco y chaleco para JP
  let jpArmamentoTxt = "";
  let jpCascoTxt = "";
  let jpChalecoTxt = "";
  
  if (jpExterno) {
    jpArmamentoTxt = document.getElementById("jp-armamento-manual")?.value || "";
    jpCascoTxt = document.getElementById("jp-casco-manual")?.value || "";
    jpChalecoTxt = document.getElementById("jp-chaleco-manual")?.value || "";
  } else {
    jpArmamentoTxt = jpArmamento;
    jpCascoTxt = jpCasco;
    jpChalecoTxt = jpChaleco;
  }
  
  if (jpArmamentoTxt) mensaje += ` (Arm: ${jpArmamentoTxt})`;
  if (equipamiento === "Sí") {
    if (jpCascoTxt) mensaje += ` (Casco: ${jpCascoTxt})`;
    if (jpChalecoTxt) mensaje += ` (Chaleco: ${jpChalecoTxt})`;
  }
  mensaje += `\n`;

  // Acompañantes
  for (let i = 1; i <= contadorAcompanantes; i++) {
    const acomp = document.getElementById(`acomp${i}`);
    if (!acomp || !acomp.value.trim()) continue;

    const esExterno = document.getElementById(`acomp${i}-externo`)?.value === "SI";
    
    // Obtener armamento, casco y chaleco para acompañante
    let armamentoTxt = "";
    let cascoTxt = "";
    let chalecoTxt = "";
    
    if (esExterno) {
      armamentoTxt = document.getElementById(`acomp${i}-armamento-manual`)?.value || "";
      cascoTxt = document.getElementById(`acomp${i}-casco-manual`)?.value || "";
      chalecoTxt = document.getElementById(`acomp${i}-chaleco-manual`)?.value || "";
    } else {
      armamentoTxt = document.getElementById(`acomp${i}-armamento`)?.value || "";
      cascoTxt = document.getElementById(`acomp${i}-casco`)?.value || "";
      chalecoTxt = document.getElementById(`chaleco-acomp${i}`)?.value || "";
    }

    mensaje += `• *Acomp ${i}:* ${esExterno ? "[EXTERNO] " : ""}${acomp.value}`;
    if (armamentoTxt) mensaje += ` (Arm: ${armamentoTxt})`;
    if (equipamiento === "Sí") {
      if (cascoTxt) mensaje += ` (Casco: ${cascoTxt})`;
      if (chalecoTxt) mensaje += ` (Chaleco: ${chalecoTxt})`;
    }
    mensaje += `\n`;
  }

  // Radio y accesorios
  const radios = [];
  
  // Radio principal
  const radio = document.getElementById("radio").value;
  const radioExterno = document.getElementById("radio-externo").value === "SI";
  if (radio) {
    radios.push(`${radioExterno ? "[MANUAL] " : ""}${radio}`);
  }
  
  // Radios adicionales
  for (let i = 2; i <= contadorRadios; i++) {
    const radioAdicional = document.getElementById(`radio${i}`)?.value;
    const radioAdicionalExterno = document.getElementById(`radio${i}-externo`)?.value === "SI";
    if (radioAdicional) {
      radios.push(`${radioAdicionalExterno ? "[MANUAL] " : ""}${radioAdicional}`);
    }
  }
  
  if (radios.length > 0) {
    mensaje += `\n*Radio(s):*\n`;
    radios.forEach((radio, index) => {
      mensaje += `• ${radio}\n`;
    });
  }

  if (document.getElementById("accesorios").value === "SI") {
    const acc = document.getElementById("accesorio-select").value;
    const manual = document.getElementById("manual-accesorio").value;
    const accFinal = acc === "MANUAL" ? manual : acc;
    if (accFinal) {
      mensaje += `*Accesorio:* ${accFinal}`;
      if (acc !== "MANUAL") {
        const serie = obtenerSerieDelAccesorio(acc);
        if (serie) mensaje += ` (Serie: ${serie})`;
      }
      mensaje += `\n`;
    }
  }

  mensaje += `\n*Servicio:* ${tipo}\n`;
  if (obs) mensaje += `*Obs:* ${obs}\n`;
  mensaje += `\n_Sección OS9 Araucanía 2026_`;

  // Guardar tipo de servicio y observación para autocompletar futuro
  guardarTipoServicio(tipo);
  if (obs) guardarObservacion(obs);

  window.open(`https://wa.me/?text=${encodeURIComponent(mensaje)}`, "_blank");
}

// ─────────────────────────────────────────────
// ACCESORIOS
// ─────────────────────────────────────────────

function mostrarCampoSerie() {
  const accesoriosVal = document.getElementById("accesorios").value;
  const grupoAccesorios = document.getElementById("grupo-accesorios");

  if (accesoriosVal === "SI") {
    grupoAccesorios.classList.remove("hidden");
    cargarAccesoriosDisponibles();
  } else {
    grupoAccesorios.classList.add("hidden");
  }
}

function cargarAccesoriosDisponibles() {
  const accesorioSelect = document.getElementById("accesorio-select");
  accesorioSelect.innerHTML = '<option value="">Seleccionar accesorio...</option>';

  const datalist = document.getElementById("accesorios-list");
  datalist.querySelectorAll("option").forEach((option) => {
    if (option.getAttribute("data-tipo") === "accesorio") {
      const opt = document.createElement("option");
      opt.value = option.value;
      opt.textContent = option.value;
      accesorioSelect.appendChild(opt);
    }
  });

  const manualOption = document.createElement("option");
  manualOption.value = "MANUAL";
  manualOption.textContent = "Otro (Ingreso manual)";
  accesorioSelect.appendChild(manualOption);
}

function mostrarCampoManualAccesorio() {
  const accesorioSelect = document.getElementById("accesorio-select");
  const manualAccesorioGroup = document.getElementById("manual-accesorio-group");

  if (accesorioSelect.value === "MANUAL") {
    manualAccesorioGroup.classList.remove("hidden");
  } else {
    manualAccesorioGroup.classList.add("hidden");
    document.getElementById("manual-accesorio").value = "";
  }
}

function obtenerSerieDelAccesorio(valorAccesorio) {
  const datalist = document.getElementById("accesorios-list");
  for (let option of datalist.querySelectorAll("option")) {
    if (option.value === valorAccesorio) {
      let series = option.getAttribute("data-series");
      if (series) {
        try {
          series = JSON.parse(series);
          return series.length > 0 ? series[0] : "";
        } catch (e) {
          console.warn("Error al parsear series:", e);
        }
      }
      return "";
    }
  }
  return "";
}

// ─────────────────────────────────────────────
// EQUIPAMIENTO COMPLETO (chalecos)
// ─────────────────────────────────────────────

function mostrarCamposEquipamiento() {
  const equipamiento = document.getElementById("equipamiento").value;
  const camposEquipamiento = document.getElementById("campos-equipamiento");

  if (equipamiento === "Sí") {
    camposEquipamiento.classList.remove("hidden");
    sincronizarChalecos();
    // Mostrar campos de chaleco para personal externo
    mostrarChalecosExternos();
  } else {
    camposEquipamiento.classList.add("hidden");
    limpiarCamposChalecos();
    // Ocultar campos de chaleco para personal externo
    ocultarChalecosExternos();
  }
}

function mostrarChalecosExternos() {
  // Mostrar campos de chaleco para JP si es externo
  const jpExterno = document.getElementById("jp-externo").value === "SI";
  if (jpExterno) {
    const jpChalecoGroup = document.getElementById("jp-chaleco-group");
    if (jpChalecoGroup) jpChalecoGroup.classList.remove("hidden");
  }
  
  // Mostrar campos de chaleco para Acompañante 1 si es externo
  const acomp1Externo = document.getElementById("acomp1-externo").value === "SI";
  if (acomp1Externo) {
    const acomp1ChalecoGroup = document.getElementById("acomp1-chaleco-group");
    if (acomp1ChalecoGroup) acomp1ChalecoGroup.classList.remove("hidden");
  }
  
  // Mostrar campos de chaleco para acompañantes adicionales si son externos
  for (let i = 2; i <= contadorAcompanantes; i++) {
    const acompExterno = document.getElementById(`acomp${i}-externo`)?.value === "SI";
    if (acompExterno) {
      const chalecoGroup = document.getElementById(`acomp${i}-chaleco-group`);
      if (chalecoGroup) chalecoGroup.classList.remove("hidden");
    }
  }
}

function ocultarChalecosExternos() {
  // Ocultar todos los campos de chaleco para personal externo
  document.querySelectorAll('[id$="-chaleco-group"]').forEach(group => {
    group.classList.add("hidden");
  });
}

function sincronizarChalecos() {
  for (let i = 2; i <= contadorAcompanantes; i++) {
    const acompInput = document.getElementById(`acomp${i}`);
    if (acompInput && !document.getElementById(`chaleco-acomp${i}`)) {
      agregarCampoChalecoAdicional(i);
    }
  }
}

function limpiarCamposChalecos() {
  const chalecoJP = document.getElementById("chaleco-jp");
  const chalecoAcomp1 = document.getElementById("chaleco-acomp1");
  if (chalecoJP) chalecoJP.value = "";
  if (chalecoAcomp1) chalecoAcomp1.value = "";

  const containerAdicionales = document.getElementById("chalecos-adicionales");
  if (containerAdicionales) containerAdicionales.innerHTML = "";
}

function agregarCampoChalecoAdicional(numeroAcompanante) {
  const container = document.getElementById("chalecos-adicionales");
  const div = document.createElement("div");
  div.className = "form-group";
  div.innerHTML = `
    <label for="chaleco-acomp${numeroAcompanante}">Chaleco - Acompañante ${numeroAcompanante}</label>
    <input type="text" id="chaleco-acomp${numeroAcompanante}" placeholder="Ej: CH-${String(numeroAcompanante + 1).padStart(3, "0")}">
  `;
  container.appendChild(div);
}

// ─────────────────────────────────────────────
// TIPOS DE SERVICIO Y OBSERVACIONES (localStorage)
// ─────────────────────────────────────────────

function cargarTiposServicio() {
  const tipos = JSON.parse(localStorage.getItem("tiposServicio") || "[]");
  const datalist = document.getElementById("tipos-servicio");
  datalist.innerHTML = "";
  tipos.forEach((tipo) => {
    const option = document.createElement("option");
    option.value = tipo;
    datalist.appendChild(option);
  });
}

function guardarTipoServicio(tipo) {
  if (!tipo.trim()) return;
  let tipos = JSON.parse(localStorage.getItem("tiposServicio") || "[]");
  if (!tipos.includes(tipo.trim())) {
    tipos.unshift(tipo.trim());
    if (tipos.length > 20) tipos = tipos.slice(0, 20);
    localStorage.setItem("tiposServicio", JSON.stringify(tipos));
    cargarTiposServicio();
  }
}

function cargarObservaciones() {
  const observaciones = JSON.parse(localStorage.getItem("observaciones") || "[]");
  const datalist = document.getElementById("observaciones");
  datalist.innerHTML = "";
  observaciones.forEach((obs) => {
    const option = document.createElement("option");
    option.value = obs;
    datalist.appendChild(option);
  });
}

function guardarObservacion(observacion) {
  if (!observacion.trim()) return;
  let observaciones = JSON.parse(localStorage.getItem("observaciones") || "[]");
  if (!observaciones.includes(observacion.trim())) {
    observaciones.unshift(observacion.trim());
    if (observaciones.length > 15) observaciones = observaciones.slice(0, 15);
    localStorage.setItem("observaciones", JSON.stringify(observaciones));
    cargarObservaciones();
  }
}