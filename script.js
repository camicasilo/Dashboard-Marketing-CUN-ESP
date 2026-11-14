// ==========================================================================
// DATOS HISTÓRICOS REALES CANÓNICOS (ENERO - MAYO 2026)
// ==========================================================================
const datosReales = {
  meses: ['Ene', 'Feb', 'Mar', 'Abr', 'May'],
  ventas: [5500, 8800, 6700, 7900, 10200],
  pauta: [2200, 3300, 2700, 3100, 3900],
  visitas: [1100, 1650, 1350, 1480, 1580],
  adquiridos: [55, 85, 65, 78, 92],
  csat: [7.5, 4.2, 6.8, 9.4, 8.1],
  encuestas: [110, 145, 135, 165, 158],
  clientes_ini: [1000, 1100, 1250, 1400, 1550],
  clientes_fin: [1100, 1250, 1400, 1550, 1700],
  total_clientes: [1155, 1335, 1465, 1628, 1792],
  cpa: [40.00, 38.82, 41.54, 39.74, 42.39],
  margen: [60.00, 64.71, 61.54, 61.54, 68.48],
  cr: [5.00, 5.15, 4.81, 5.27, 5.82],
  retencion: [110.0, 113.64, 112.0, 110.71, 109.68],
  ratio: [0.1875, 0.1082, 0.1637, 0.2365, 0.1911],
  roas: [2.50, 2.67, 2.48, 2.55, 2.62]
};

// ESTADO DE LA SIMULACIÓN
let simState = {
  gasto: 3100,
  soporte: 15,
  visitas: 1480,
  tasaConv: 5.27,
  clientes: 78,
  pautaNeta: 2635,
  gastoCX: 465,
  cpa: 33.78,
  ventas: 7917,
  csat: 9.4,
  margen: 67.72,
  roas: 2.55,
  ratio: 0.2783
};

let tabActiva = 1;
// Tema persistido o por defecto oscuro
let currentTheme = localStorage.getItem('sim_theme') || 'dark';
var isMarte = (currentTheme === 'marte' || currentTheme === 'dark');
let chartInstance = null;
let presetOrigen = 'recomendado';

// Elementos DOM
const appBody = document.getElementById('app-body');
const rngGasto = document.getElementById('rng-gasto');
const rngSoporte = document.getElementById('rng-soporte');
const rngVisitas = document.getElementById('rng-visitas');

const txtGasto = document.getElementById('txt-gasto');
const txtSoporte = document.getElementById('txt-soporte');
const txtVisitas = document.getElementById('txt-visitas');

const kpiVentas = document.getElementById('kpi-ventas');
const kpiRoas = document.getElementById('kpi-roas');
const kpiClientes = document.getElementById('kpi-clientes');
const kpiTasaConv = document.getElementById('kpi-tasa-conv');
const kpiCpa = document.getElementById('kpi-cpa');
const kpiCpaStatus = document.getElementById('kpi-cpa-status');
const kpiCsat = document.getElementById('kpi-csat');
const kpiCsatStatus = document.getElementById('kpi-csat-status');
const kpiMargen = document.getElementById('kpi-margen');
const kpiRatio = document.getElementById('kpi-ratio');

const lblMiniMargen = document.getElementById('lbl-mini-margen');
const lblMiniCX = document.getElementById('lbl-mini-cx');
const lblMiniPauta = document.getElementById('lbl-mini-pauta');

const badgeEstado = document.getElementById('badge-estado');
const boxDiagnostico = document.getElementById('box-diagnostico');
const badgeEscenarioActivo = document.getElementById('badge-escenario-activo');
const boxExplicacionEscenarios = document.getElementById('box-explicacion-escenarios');
const btnEscCanon1 = document.getElementById('btn-esc-canon-1');
const btnEscCanon2 = document.getElementById('btn-esc-canon-2');
const btnEscCanon3 = document.getElementById('btn-esc-canon-3');
const btnEscCanon4 = document.getElementById('btn-esc-canon-4');
const boxInterpretacion = document.getElementById('box-interpretacion-grafica');
const tabDescripcion = document.getElementById('tab-descripcion');
const txtExplicacionCorta = document.getElementById('txt-explicacion-corta');

const btnThemeToggle = document.getElementById('btn-theme-toggle');
const themeIcon = document.getElementById('theme-icon');
const themeLabel = document.getElementById('theme-label');

// ==========================================================================
// FUNCIÓN PARA ALTERNAR ENTRE MODO CLARO Y MODO OSCURO (CON PERSISTENCIA)
// ==========================================================================
function aplicarTema(tema) {
  currentTheme = tema;
  isMarte = (tema === 'marte' || tema === 'dark');
  localStorage.setItem('sim_theme', tema);

  const mobIcon = document.querySelector('.theme-icon-mob');

  if (tema === 'light') {
    appBody.classList.remove('theme-dark', 'theme-marte');
    appBody.classList.add('theme-light');
    if (themeIcon) themeIcon.textContent = '🌙';
    if (themeLabel) themeLabel.textContent = 'Modo Oscuro';
    if (mobIcon) mobIcon.textContent = '🌙';
    if (btnThemeToggle) {
      btnThemeToggle.className = 'btn-interactive text-xs px-3 py-1.5 rounded-lg font-bold transition flex items-center gap-1.5 border border-slate-300 bg-white hover:bg-slate-100 text-slate-800 shadow-sm';
    }
  } else {
    appBody.classList.remove('theme-light');
    appBody.classList.add('theme-dark', 'theme-marte');
    if (themeIcon) themeIcon.textContent = '☀️';
    if (themeLabel) themeLabel.textContent = 'Modo Claro';
    if (mobIcon) mobIcon.textContent = '☀️';
    if (btnThemeToggle) {
      btnThemeToggle.className = 'btn-interactive text-xs px-3 py-1.5 rounded-lg font-bold transition flex items-center gap-1.5 border border-[#571C1D] bg-[#2A0E13] hover:bg-[#3D141B] text-[#FFD8B0] shadow-sm';
    }
  }

  if (chartInstance) {
    renderizarGraficaActiva();
  }
}

function toggleTheme() {
  const nuevoTema = (currentTheme === 'light') ? 'dark' : 'light';
  aplicarTema(nuevoTema);
}

// ==========================================================================
// MODELO PARAMÉTRICO DE SIMULACIÓN EN TIEMPO REAL
// ==========================================================================

// ==========================================================================
// BANCO DE 20 DILEMAS GERENCIALES DETERMINISTAS (PREGUNTAS DE NEGOCIO BI)
// ==========================================================================
const dilemasGerenciales = [
  // --- BLOQUE 1: RIESGO Y QUIEBRA (QUÉ NO HACER) ---
  {
    id: 1,
    cat: 'crisis',
    pregunta: '1. ¿Qué pasa si quemo $6.000 USD en pauta con 0% a soporte?',
    gasto: 6000, soporte: 0, visitas: 2500,
    titulo: 'Colapso Dual: Quiebra Financiera y Satisfacción Destruida',
    explicacion: 'Al meter $6.000 USD a tráfico frío sin un solo dólar en repuestos, el ROAS se hunde a 1.91x (insolvencia) y la satisfacción colapsa a 3.2/10.',
    veredicto: 'RECHAZADO ROTUNDAMENTE ❌ (Destruye caja y flota)',
    tipoVeredicto: 'danger'
  },
  {
    id: 2,
    cat: 'crisis',
    pregunta: '2. ¿Qué pasa si repito el error de Febrero (0% CX para captar barato)?',
    gasto: 3300, soporte: 0, visitas: 1650,
    titulo: 'Crisis de Febrero: Falsa Eficiencia Publicitaria',
    explicacion: 'El CPA parece barato ($38.82 USD) pero el taller colapsa y el CSAT cae a 4.2/10. Los 85 clientes nuevos jamás renovarán sus contratos.',
    veredicto: 'RECHAZADO ❌ (La pauta ciega destruye el valor de vida del cliente)',
    tipoVeredicto: 'danger'
  },
  {
    id: 3,
    cat: 'crisis',
    pregunta: '3. ¿Qué ocurre si saturo de pauta ($4.500) en tráfico frío sin soporte?',
    gasto: 4500, soporte: 0, visitas: 1900,
    titulo: 'Efecto Mayo Extremo: Ley de Rendimientos Decrecientes',
    explicacion: 'El CPA se dispara a $42.39 USD (Zona Roja) y 91 clientes quedan sin alistamiento mecánico, llevando el CSAT a 4.4/10.',
    veredicto: 'RECHAZADO ❌ (Inversión sobrepagada e ineficiente)',
    tipoVeredicto: 'danger'
  },
  {
    id: 4,
    cat: 'crisis',
    pregunta: '4. ¿Qué pasa si opero con presupuesto enano ($1.500 USD)?',
    gasto: 1500, soporte: 5, visitas: 900,
    titulo: 'Sub-inversión Crítica: Incapacidad de Cubrir Costos Fijos',
    explicacion: 'Apenas captas 47 clientes y facturas $4.771 USD. Aunque el ROAS dé 3.18x, el volumen absoluto no cubre la estructura operativa en Marte.',
    veredicto: 'RIESGOSO ⚠️ (Incapaz de sostener la presencia marciana)',
    tipoVeredicto: 'warning'
  },
  {
    id: 5,
    cat: 'crisis',
    pregunta: '5. ¿Qué pasa si el tráfico sube a 2.500 visitas con solo 5% a soporte?',
    gasto: 3500, soporte: 5, visitas: 2500,
    titulo: 'Cuello de Botella Operativo en Talleres Mecánicos',
    explicacion: 'Entran 113 clientes pero solo asignas $175 USD de soporte. Cada taller recibe avalanchas de quejas y el CSAT cae a 5.8/10.',
    veredicto: 'RECHAZADO ❌ (El embudo captó bien pero el taller murió)',
    tipoVeredicto: 'danger'
  },

  // --- BLOQUE 2: RENTABILIDAD Y ROAS ---
  {
    id: 6,
    cat: 'finanzas',
    pregunta: '6. ¿Cuál es el presupuesto antes de que el ROAS caiga de 2.50x?',
    gasto: 4200, soporte: 10, visitas: 1600,
    titulo: 'Límite de Solvencia Financiera (Umbral Break-Even)',
    explicacion: 'Al superar los $4.100 USD en pauta directa sin soporte coordinado, el ROAS cae a 2.38x. Cada dólar adicional genera pérdidas netas.',
    veredicto: 'PUNTO DE CORTE FINANCIERO ⚠️ (No superar $4.000 USD)',
    tipoVeredicto: 'warning'
  },
  {
    id: 7,
    cat: 'finanzas',
    pregunta: '7. ¿Cómo maximizar el Margen Limpio por Rover (> $68 USD)?',
    gasto: 2500, soporte: 12, visitas: 1300,
    titulo: 'Economía Unitaria Sostenible: Margen Neto de Alta Rentabilidad',
    explicacion: 'Pauta moderada con tráfico altamente calificado mantiene el CPA en $33.10 USD, dejando un margen limpio récord de $68.40 USD (67.4%).',
    veredicto: 'APROBADO PARA EFICIENCIA UNITARIA ⭐',
    tipoVeredicto: 'success'
  },
  {
    id: 8,
    cat: 'finanzas',
    pregunta: '8. ¿Qué nivel de gasto hace que el CPA supere los $42 USD de alarma?',
    gasto: 3900, soporte: 8, visitas: 1580,
    titulo: 'Límite de Saturación de Audiencias (Caso Mayo Real)',
    explicacion: 'Con $3.900 USD y 8% a posventa, el CPA llega exactamente a $42.39 USD. Es el techo histórico de tolerancia antes del sobrecosto.',
    veredicto: 'ALERTA DE SATURACIÓN ⚠️ (Pauta al borde de la ineficiencia)',
    tipoVeredicto: 'warning'
  },
  {
    id: 9,
    cat: 'finanzas',
    pregunta: '9. ¿Es rentable gastar $5.000 USD mensuales en este modelo?',
    gasto: 5000, soporte: 15, visitas: 2000,
    titulo: 'Sobreinversión Innecesaria en Audiencias Marcianas',
    explicacion: 'Facturas $10.252 USD pero gastaste $5.000 USD. El ROAS cae a 2.05x (muy por debajo de 2.50x). El mercado marciano no asimila tanta pauta.',
    veredicto: 'RECHAZADO ❌ (Destruye margen neto por volumen forzado)',
    tipoVeredicto: 'danger'
  },
  {
    id: 10,
    cat: 'finanzas',
    pregunta: '10. ¿Cómo garantizar que cada $1 invertido retorne al menos $2.55?',
    gasto: 3100, soporte: 16, visitas: 1480,
    titulo: 'Multiplicador Empírico Exacto: El Retorno de Abril (2.55x)',
    explicacion: 'Inversión de $3.100 USD genera exactamente $7.917 USD en ventas brutas, devolviendo $2.55 USD por cada dólar con CSAT de 9.4.',
    veredicto: 'APROBADO POR JUNTA DIRECTIVA ⭐',
    tipoVeredicto: 'success'
  },

  // --- BLOQUE 3: RETENCIÓN, FIDELIZACIÓN Y POSVENTA (CX) ---
  {
    id: 11,
    cat: 'retencion',
    pregunta: '11. ¿Por qué la retención de flota supera el 100% en el caso?',
    gasto: 3100, soporte: 16, visitas: 1480,
    titulo: 'Expansión Neta de Flota: Ecuación con Crecimiento de Cartera',
    explicacion: 'La base inició en 1.700 contratos y terminó en 1.778. Como los nuevos superaron a las bajas (churn 0%), la retención matemática da 113.6%.',
    veredicto: 'COMPROBADO Y JUSTIFICADO ANTE EL PROFESOR ⭐',
    tipoVeredicto: 'success'
  },
  {
    id: 12,
    cat: 'retencion',
    pregunta: '12. ¿Cuánto soporte se requiere para asegurar CSAT > 9.0 permanente?',
    gasto: 3400, soporte: 15, visitas: 1550,
    titulo: 'Regla del 15% de Soporte: Salvaguarda de la Calidad Percibida',
    explicacion: 'Al destinar $510 USD a talleres mecánicos (15%), la atención es inmediata y el CSAT se estabiliza sólidamente en 9.1/10.',
    veredicto: 'APROBADO CANÓNICO ⭐',
    tipoVeredicto: 'success'
  },
  {
    id: 13,
    cat: 'retencion',
    pregunta: '13. ¿Qué pasa si destino el 30% del presupuesto a posventa?',
    gasto: 3500, soporte: 30, visitas: 1500,
    titulo: 'Hiper-Fidelización VIP: Excelente Calidad con Pauta Sacrificada',
    explicacion: 'El CSAT vuela a 9.5/10, pero dejas solo $2.450 USD a captación (68 rovers). Excelente para lealtad pero desacelera la expansión.',
    veredicto: 'ESTRATEGIA DEFENSIVA VÁLIDA 🛡️ (Prioriza fidelizar sobre captar)',
    tipoVeredicto: 'warning'
  },
  {
    id: 14,
    cat: 'retencion',
    pregunta: '14. ¿Qué ocurre si el CSAT cae a la zona tibia (6.5 a 7.5)?',
    gasto: 2800, soporte: 8, visitas: 1300,
    titulo: 'Zona de Indiferencia y Vulnerabilidad Competitiva',
    explicacion: 'Con solo 8% de soporte ($224 USD), el CSAT se queda en 7.5. Los clientes operan pero 1 de cada 4 evaluará rescindir en el próximo ciclo.',
    veredicto: 'RIESGO LATENTE ⚠️ (Subir soporte a mínimo 12%)',
    tipoVeredicto: 'warning'
  },
  {
    id: 15,
    cat: 'retencion',
    pregunta: '15. ¿Por qué Abril fue el mes de mayor equilibrio operativo y calidad histórica de la compañía?',
    gasto: 3100, soporte: 16, visitas: 1480,
    titulo: 'El Hito de Abril: 16% CX, CSAT 9.4 y CPA $39.74 USD',
    explicacion: 'Reasignar $496 USD a soporte logró el récord de satisfacción con costo de captación controlado y Ratio Maestro supremo de 0.2365.',
    veredicto: 'MODELO DE REFERENCIA HISTÓRICA ⭐',
    tipoVeredicto: 'success'
  },

  // --- BLOQUE 4: ESCALA Y PLAN JUNIO (ESTRATEGIA ÓPTIMA) ---
  {
    id: 16,
    cat: 'escala',
    pregunta: '16. ¿Por qué el SIM recomienda 15% CX ($600) para el Plan Junio?',
    gasto: 4000, soporte: 15, visitas: 1700,
    titulo: 'Propuesta Canónica del SIM para Junio ($4.000 USD / 15% CX)',
    explicacion: 'Destina $3.400 USD a captar 87 rovers y $600 USD a posventa. Logra ROAS de 2.50x, CSAT de 9.1/10 y Margen Limpio de $66.37 USD.',
    veredicto: 'PROPUESTA OFICIAL A DEFENDER EN EL ACA ⭐⭐⭐',
    tipoVeredicto: 'success'
  },
  {
    id: 17,
    cat: 'escala',
    pregunta: '17. ¿Cómo absorber 90 nuevos clientes sin colapsar el taller?',
    gasto: 3800, soporte: 18, visitas: 1650,
    titulo: 'Escalamiento Equilibrado con Absorción Operativa Óptima',
    explicacion: 'Se captan 86 clientes y se inyectan $684 USD a talleres mecánicos. La satisfacción se mantiene en 9.3/10 sin demoras de alistamiento.',
    veredicto: 'APROBADO PARA CRECIMIENTO RÁPIDO ⭐',
    tipoVeredicto: 'success'
  },
  {
    id: 18,
    cat: 'escala',
    pregunta: '18. ¿Qué nivel de visitas mantiene una tasa CR por encima de 5.2%?',
    gasto: 3000, soporte: 14, visitas: 1400,
    titulo: 'Tráfico Web Calificado vs Tráfico Frío de Relleno',
    explicacion: 'Con 1.400 visitas de alta intención de compra, el CR se ubica en 5.24% y el CPA baja a $35.15 USD, evitando el desperdicio de clics.',
    veredicto: 'ALTA EFICIENCIA EN EMBUDO ⭐',
    tipoVeredicto: 'success'
  },
  {
    id: 19,
    cat: 'escala',
    pregunta: '19. ¿Cómo lograr un Ratio Maestro superior a 0.22 puntos/USD?',
    gasto: 3200, soporte: 16, visitas: 1500,
    titulo: 'Productividad Directiva de 360°: Felicidad por Dólar Invertido',
    explicacion: 'Genera 0.2310 puntos de satisfacción por cada $1 USD gastado en pauta neta ($36.80 CPA / 8.5 CSAT), superando el umbral de excelencia.',
    veredicto: 'EXCELENCIA DIRECTIVA TOTAL ⭐',
    tipoVeredicto: 'success'
  },
  {
    id: 20,
    cat: 'escala',
    pregunta: '20. ¿Cuál es la sustentación óptima para defender ante la Junta?',
    gasto: 4000, soporte: 15, visitas: 1700,
    titulo: 'Dictamen de Cierre: El Equilibrio que Salva y Expande la Empresa',
    explicacion: 'Demuestra con los 8 KPIs en mano que no se puede pautar a ciegas: el 15% en posventa protege la cartera y maximiza el EBITDA.',
    veredicto: 'ESTRATEGIA MAESTRA APROBADA CON HONORES 🏆',
    tipoVeredicto: 'success'
  }
];

let dilemaActivoId = null;

function inicializarConsolaDilemas() {
  const selPregunta = document.getElementById('sel-pregunta-dilema');
  const selCategoria = document.getElementById('sel-categoria-dilema');
  if (!selPregunta || !selCategoria) return;

  filtrarPreguntasDilema();
}

function filtrarPreguntasDilema() {
  const selPregunta = document.getElementById('sel-pregunta-dilema');
  const selCategoria = document.getElementById('sel-categoria-dilema');
  if (!selPregunta || !selCategoria) return;

  const cat = selCategoria.value;
  const lista = (cat === 'todas') 
    ? dilemasGerenciales 
    : dilemasGerenciales.filter(d => d.cat === cat);

  selPregunta.innerHTML = '';
  lista.forEach(d => {
    const opt = document.createElement('option');
    opt.value = d.id;
    opt.textContent = d.pregunta;
    selPregunta.appendChild(opt);
  });
}

function ejecutarDilemaSeleccionado() {
  const selPregunta = document.getElementById('sel-pregunta-dilema');
  if (!selPregunta) return;

  const id = parseInt(selPregunta.value);
  const dilema = dilemasGerenciales.find(d => d.id === id);
  if (!dilema) return;

  dilemaActivoId = id;
  presetOrigen = `dilema_${id}`;

  rngGasto.value = dilema.gasto;
  rngSoporte.value = dilema.soporte;
  rngVisitas.value = dilema.visitas;

  calcularParametros();
}

function calcularParametros() {
  const gasto = parseFloat(rngGasto.value);
  const soporte = parseFloat(rngSoporte.value);
  const visitas = parseFloat(rngVisitas.value);

  // Conversión calibrada con los datos reales empíricos (Ene-May + Plan Junio)
  const factorSaturacion = Math.max(0.82, 1 - Math.max(0, visitas - 1300) * 0.00012);
  const tasaConv = Math.min(6.2, Math.max(4.5, (5.35 * factorSaturacion)));
  const clientes = Math.round(visitas * (tasaConv / 100));

  const gastoCX = Math.round(gasto * (soporte / 100));
  const pautaNeta = gasto - gastoCX;
  const cpa = clientes > 0 ? (pautaNeta / clientes) : 0;
  const precioUnitario = 101.5;
  const ventas = Math.round(clientes * precioUnitario);
  const margen = precioUnitario - cpa;
  const roas = gasto > 0 ? (ventas / gasto).toFixed(2) : 0;

  // Modelo dinámico de Satisfacción
  let csatBase = 7.5;
  const sobrecarga = (clientes - 55) * 0.085;
  const alivioSoporte = (soporte / 15) * 3.3;
  let csat = Math.min(9.8, Math.max(3.2, csatBase - sobrecarga + alivioSoporte));
  const ratio = cpa > 0 ? (csat / cpa).toFixed(4) : 0;

  simState = {
    gasto, soporte, visitas, tasaConv, clientes, pautaNeta, gastoCX,
    cpa, ventas, csat, margen, roas, ratio
  };

  actualizarUI();
}

function actualizarUI() {
  if (txtGasto) txtGasto.textContent = `$${simState.gasto.toLocaleString('es-CO')}`;
  if (txtSoporte) txtSoporte.textContent = `${simState.soporte} %`;
  if (txtVisitas) txtVisitas.textContent = simState.visitas.toLocaleString('es-CO');

  if (kpiVentas) kpiVentas.textContent = `$${simState.ventas.toLocaleString('es-CO')}`;
  if (kpiRoas) kpiRoas.textContent = `ROAS: ${simState.roas}x`;
  if (kpiClientes) kpiClientes.textContent = simState.clientes;
  if (kpiTasaConv) kpiTasaConv.textContent = `CR: ${simState.tasaConv.toFixed(2)}%`;
  if (kpiCpa) kpiCpa.textContent = `$${simState.cpa.toFixed(2)}`;
  if (kpiCsat) kpiCsat.textContent = `${simState.csat.toFixed(1)} / 10`;
  if (kpiMargen) kpiMargen.textContent = `$${simState.margen.toFixed(2)}`;
  if (kpiRatio) kpiRatio.textContent = simState.ratio;

  if (lblMiniMargen) lblMiniMargen.textContent = `$${simState.margen.toFixed(2)} USD`;
  if (lblMiniCX) lblMiniCX.textContent = `$${simState.gastoCX} USD`;
  if (lblMiniPauta) lblMiniPauta.textContent = `$${simState.pautaNeta} USD`;

  if (kpiCsatStatus) {
    if (simState.csat >= 8.5) {
      kpiCsatStatus.textContent = 'Excelente (Óptimo)';
      kpiCsatStatus.className = 'text-[9px] text-emerald-400 font-semibold';
      if (kpiCsat) kpiCsat.className = 'text-base font-black text-emerald-400 mt-0.5';
    } else if (simState.csat >= 6.5) {
      kpiCsatStatus.textContent = 'Aceptable';
      kpiCsatStatus.className = 'text-[9px] text-amber-400 font-semibold';
      if (kpiCsat) kpiCsat.className = 'text-base font-black text-amber-400 mt-0.5';
    } else {
      kpiCsatStatus.textContent = '¡Alerta de Colapso!';
      kpiCsatStatus.className = 'text-[9px] text-rose-400 font-semibold animate-pulse';
      if (kpiCsat) kpiCsat.className = 'text-base font-black text-rose-400 mt-0.5';
    }
  }

  actualizarDiagnostico();
  actualizarExplicacionEscenarios();
  actualizarInterpretacionGrafica();
  renderizarGraficaActiva();
}

function actualizarDiagnostico() {
  if (!boxDiagnostico) return;
  let badge = 'EQUILIBRIO SALUDABLE';
  let badgeClase = 'badge-exito';
  let html = '';

  // 1. SI HAY UN DILEMA GERENCIAL ACTIVO SELECCIONADO: RESPONDER DIRECTAMENTE LA PREGUNTA
  const dilema = dilemaActivoId ? dilemasGerenciales.find(d => d.id === dilemaActivoId) : null;
  if (dilema && (simState.gasto === dilema.gasto && simState.soporte === dilema.soporte && simState.visitas === dilema.visitas)) {
    badge = (dilema.tipoVeredicto === 'danger') ? 'PELIGRO DETECTADO' : (dilema.tipoVeredicto === 'warning' ? 'ALERTA DIRECTIVA' : 'DECISIÓN RECOMENDADA');
    badgeClase = (dilema.tipoVeredicto === 'danger') ? 'badge-alerta' : (dilema.tipoVeredicto === 'warning' ? 'badge-advertencia' : 'badge-exito');
    
    const veredictoColorClase = (dilema.tipoVeredicto === 'danger') ? 'text-rose-400' : (dilema.tipoVeredicto === 'warning' ? 'text-amber-400' : 'text-emerald-400');
    const veredictoBgClase = (dilema.tipoVeredicto === 'danger') ? 'bg-rose-950/50 border-rose-800 text-rose-300' : (dilema.tipoVeredicto === 'warning' ? 'bg-amber-950/50 border-amber-800 text-amber-300' : 'bg-emerald-950/50 border-emerald-800 text-emerald-300');

    html = `
      <p class="font-bold text-xs ${veredictoColorClase}">🎯 ${dilema.titulo}</p>
      <p class="text-slate-200 text-xs leading-normal">
        <strong>Impacto en los 8 KPIs:</strong> Ventas: $${simState.ventas.toLocaleString()} USD | ROAS: <strong>${simState.roas}x</strong> | Clientes: ${simState.clientes} | CSAT: <strong>${simState.csat.toFixed(1)}/10</strong> | CPA: $${simState.cpa.toFixed(2)} USD | Margen: $${simState.margen.toFixed(2)} USD.
      </p>
      <p class="text-slate-300 text-xs leading-normal">${dilema.explicacion}</p>
      <div class="p-1.5 rounded border text-xs font-bold ${veredictoBgClase}">
        <strong>Veredicto del Gerente:</strong> ${dilema.veredicto}
      </div>
    `;
  }
  // 2. SIMULACIÓN LIBRE: EVALUACIÓN HOLÍSTICA DE SALUD DE LOS 8 KPIS EN TIEMPO REAL
  // PRIORIDAD 1: QUIEBRA / INSOLVENCIA FINANCIERA (ROAS < 2.50x BREAK-EVEN)
  else if (simState.roas < 2.50) {
    badge = 'PELIGRO: PÉRDIDA FINANCIERA (ROAS < 2.50x)';
    badgeClase = 'badge-alerta';
    html = `
      <p class="text-rose-400 font-bold text-xs">⚠️ Quiebra Financiera: Retorno por debajo del Break-Even (2.50x).</p>
      <p class="text-slate-200 text-xs leading-normal">
        Estás invirtiendo <strong>$${simState.gasto.toLocaleString()} USD</strong> para facturar <strong>$${simState.ventas.toLocaleString()} USD</strong>, generando un ROAS deficitario de <strong>${simState.roas}x</strong>. 
        ${simState.csat >= 8.5 ? 'Aunque la satisfacción es alta (' + simState.csat.toFixed(1) + '/10) por el ' + simState.soporte + '% en soporte, la empresa está quemando caja.' : 'Operación en rojo tanto en retorno como en servicio técnico.'}
      </p>
      <div class="p-1.5 rounded bg-rose-950/50 border border-rose-800 text-rose-300 text-xs font-bold">
        <strong>Veredicto:</strong> Ajusta la inversión publicitaria a máximo $4.000 USD o aumenta las ventas para recuperar el ROAS ≥ 2.50x.
      </div>
    `;
  }
  // PRIORIDAD 2: COLAPSO OPERATIVO POR PAUTA CIEGA (CSAT < 6.5 o SOPORTE < 8% CON VOLUMEN)
  else if (simState.csat < 6.5 || (simState.soporte < 8 && simState.clientes > 60)) {
    badge = 'PELIGRO: CRISIS TIPO FEBRERO (COLAPSO CX)';
    badgeClase = 'badge-alerta';
    html = `
      <p class="text-rose-400 font-bold text-xs">⚠️ Crisis Operativa: Talleres mecánicos colapsados en Marte.</p>
      <p class="text-slate-200 text-xs leading-normal">
        Captaste <strong>${simState.clientes} rovers</strong> pero solo asignaste <strong>${simState.soporte}% a soporte ($${simState.gastoCX} USD)</strong>. 
        El CSAT se destruye a <strong>${simState.csat.toFixed(1)}/10 (Zona Roja)</strong>. Deserción masiva y pérdida de contratos garantizada.
      </p>
      <div class="p-1.5 rounded bg-rose-950/50 border border-rose-800 text-rose-300 text-xs font-bold">
        <strong>Veredicto:</strong> Reasigna entre 12% y 16% del presupuesto a posventa para salvaguardar la operación.
      </div>
    `;
  }
  // PRIORIDAD 3: SATURACIÓN PUBLICITARIA / RENDIMIENTOS DECRECIENTES (CPA > 42.0 o CR < 4.8%)
  else if (simState.cpa > 42.0 || simState.tasaConv < 4.8) {
    badge = 'ALERTA: RENDIMIENTOS DECRECIENTES (MAYO)';
    badgeClase = 'badge-advertencia';
    html = `
      <p class="text-amber-400 font-bold text-xs">⚠️ Saturación de Pauta: Costo de captación encarecido.</p>
      <p class="text-slate-200 text-xs leading-normal">
        El CPA se disparó a <strong>$${simState.cpa.toFixed(2)} USD</strong> y la conversión cayó a <strong>${simState.tasaConv.toFixed(2)}%</strong>. 
        Estás saturando las audiencias marcianas con ${simState.visitas.toLocaleString()} visitas frías. Cada cliente nuevo cuesta más de lo que aporta.
      </p>
      <div class="p-1.5 rounded bg-amber-950/50 border border-amber-800 text-amber-300 text-xs font-bold">
        <strong>Veredicto:</strong> Disminuye la pauta fría y concentra la captación en tráfico calificado.
      </div>
    `;
  }
  // PRIORIDAD 4: EXCELENCIA ESTRATÉGICA INTEGRAL (LOS 8 KPIS EN ZONA VERDE)
  else if (simState.roas >= 2.50 && simState.csat >= 8.8 && simState.cpa <= 41.0 && simState.margen >= 60.0) {
    badge = 'EXCELENCIA ESTRATÉGICA (EQUILIBRIO SIM)';
    badgeClase = 'badge-exito';
    html = `
      <p class="text-emerald-400 font-bold text-xs">⭐ Punto de Equilibrio Gerencial (Tipo Abril / Plan Junio).</p>
      <p class="text-slate-200 text-xs leading-normal">
        Armonía perfecta en los 8 KPIs: ROAS solvente de <strong>${simState.roas}x</strong>, CSAT asegurado en <strong>${simState.csat.toFixed(1)}/10</strong>, 
        CPA eficiente de <strong>$${simState.cpa.toFixed(2)} USD</strong>, margen limpio de <strong>$${simState.margen.toFixed(2)} USD</strong> y Ratio de <strong>${simState.ratio}</strong>.
      </p>
      <div class="p-1.5 rounded bg-emerald-950/50 border border-emerald-800 text-emerald-300 text-xs font-bold">
        <strong>Veredicto:</strong> Estrategia canónica a defender ante la Junta Directiva y en el informe ACA.
      </div>
    `;
  }
  // PRIORIDAD 5: OPERACIÓN ESTABLE / MARGEN DE MEJORA
  else {
    badge = 'ZONA ESTABLE DE CONTROL';
    badgeClase = 'badge-advertencia';
    html = `
      <p class="text-slate-200 font-bold text-xs">ℹ️ Operación en rango aceptable con margen de optimización.</p>
      <p class="text-slate-200 text-xs leading-normal">
        ROAS de <strong>${simState.roas}x</strong>, Margen de <strong>$${simState.margen.toFixed(2)} USD</strong> y CSAT en <strong>${simState.csat.toFixed(1)}/10</strong>. 
        Ajusta la palanca de soporte al 15% para maximizar el valor de la empresa.
      </p>
    `;
  }

  if (badgeEstado) {
    badgeEstado.textContent = badge;
    badgeEstado.className = `text-xs px-2.5 py-1 rounded-md font-extrabold border ${badgeClase}`;
  }
  boxDiagnostico.innerHTML = html;
}

// ==========================================================================
// NUEVO PANEL DINÁMICO: EXPLICACIÓN DE ESCENARIOS
// ==========================================================================
function actualizarExplicacionEscenarios() {
  if (!boxExplicacionEscenarios || !badgeEscenarioActivo) return;

  let activeCanonId = 0;
  let activeHeaderId = null;
  let badgeTexto = '';
  let badgeClase = '';
  let contenido = '';

  // 1. PRIORIDAD MÁXIMA: SATURACIÓN DE PAUTA (Botón 4: $4.500 USD, 0% CX, 1.900 Visitas)
  if (presetOrigen === 'saturacion' || (simState.gasto === 4500 && simState.soporte === 0 && simState.visitas === 1900) || (simState.gasto >= 4500 && simState.soporte === 0)) {
    activeCanonId = 4;
    activeHeaderId = null;
    badgeTexto = 'SATURACIÓN DE PAUTA';
    badgeClase = 'badge-alerta';
    contenido = `
      <div class="space-y-1">
        <p class="font-bold text-amber-400 flex items-center justify-between">
          <span>🟡 Escenario 4: Saturación de Pauta ($4.500 USD | 0% CX | 1.900 Visitas)</span>
          <span class="text-[11px] font-bold px-1.5 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-800">Saturación Crítica</span>
        </p>
        <p class="text-slate-200 text-xs leading-normal">
          <strong>Diagnóstico Directivo:</strong> Arquetipo de <strong>rendimientos decrecientes extremos y colapso dual</strong>. 
          Al forzar la inversión a $4.500 USD con 0% en soporte y 1.900 visitas, el tráfico frío se dispersa, el <strong>CPA sube a $${simState.cpa.toFixed(2)} USD</strong> y la avalancha de ${simState.clientes} clientes sin servicio técnico hunde el <strong>CSAT a un crítico ${simState.csat.toFixed(1)}/10 (Zona Roja)</strong>. 
          Prueba contundente de que inyectar más presupuesto a tráfico frío sin soporte acelera la quiebra del modelo.
        </p>
      </div>
    `;
  }
  // 2. Mes de Enero: Línea Base Histórica
  else if (presetOrigen === 'enero' || (simState.gasto === 2200 && simState.soporte === 8 && simState.visitas === 1100)) {
    activeHeaderId = 'enero';
    activeCanonId = 0;
    badgeTexto = 'Enero (Línea Base Histórica)';
    badgeClase = 'badge-neutro';
    contenido = `
      <div class="space-y-1">
        <p class="font-bold text-blue-400 flex items-center justify-between">
          <span>🔵 Enero (Línea Base Histórica)</span>
          <span class="text-[11px] font-bold px-1.5 py-0.5 rounded bg-blue-950 text-blue-300 border border-blue-800">Calibración Inicial</span>
        </p>
        <p class="text-slate-200 text-xs leading-normal">
          <strong>Significado Real:</strong> Punto de partida empírico de Ares Rover Dynamics en Marte. Inversión inicial moderada de $2.200 USD con 8% en soporte ($176 USD) y 1.100 visitas, manteniendo una operación equilibrada: <strong>CSAT de 7.5/10</strong> y <strong>CPA de $40.00 USD</strong> antes de experimentar el estrés del escalamiento comercial.
        </p>
      </div>
    `;
  }
  // 3. Mes de Febrero / Arquetipo 1: Crisis Pauta Ciega
  else if (presetOrigen === 'febrero' || presetOrigen === 'canon1' || (simState.gasto === 3300 && simState.soporte === 0 && simState.visitas === 1650)) {
    activeCanonId = 1;
    activeHeaderId = 'febrero';
    badgeTexto = 'Febrero (Crisis Operativa por Pauta Ciega)';
    badgeClase = 'badge-alerta';
    contenido = `
      <div class="space-y-1">
        <p class="font-bold text-rose-400 flex items-center justify-between">
          <span>🔴 Febrero (Crisis Operativa por Pauta Ciega - 0% CX)</span>
          <span class="text-[11px] font-bold px-1.5 py-0.5 rounded bg-rose-950 text-rose-300 border border-rose-800">Crisis Febrero</span>
        </p>
        <p class="text-slate-200 text-xs leading-normal">
          <strong>Significado Real:</strong> El error directivo de canalizar el 100% del presupuesto ($3.300 USD) a captación publicitaria sin asignar $1 a posventa. Se captaron 85 clientes (1.650 visitas), pero el colapso del taller técnico hundió la satisfacción al nivel más bajo del semestre: <strong>CSAT de 4.2/10 (Zona Roja)</strong>. Evidencia empírica de que captar sin cuidar destruye el valor de vida del cliente.
        </p>
      </div>
    `;
  }
  // 4. Mes de Abril: Punto Óptimo - Equilibrio Virtuoso
  else if (presetOrigen === 'abril' || (simState.gasto === 3100 && simState.soporte === 16 && simState.visitas === 1480)) {
    activeHeaderId = 'abril';
    activeCanonId = 0;
    badgeTexto = 'Abril (Punto Óptimo - Equilibrio Virtuoso)';
    badgeClase = 'badge-exito';
    contenido = `
      <div class="space-y-1">
        <p class="font-bold text-emerald-400 flex items-center justify-between">
          <span>⭐ Abril (Equilibrio Virtuoso y Récord de Calidad)</span>
          <span class="text-[11px] font-bold px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800">Récord de Calidad</span>
        </p>
        <p class="text-slate-200 text-xs leading-normal">
          <strong>Significado Real:</strong> El mes de mayor excelencia operativa y eficiencia histórica. Con $3.100 USD y un 16% reasignado a soporte posventa ($496 USD), los ingenieros garantizaron alistamiento óptimo de cada Rover, logrando el <strong>récord histórico de CSAT en 9.4/10</strong>, CPA de <strong>$39.74 USD</strong> y Ratio Maestro supremo de <strong>0.2365 pts/USD</strong>.
        </p>
      </div>
    `;
  }
  // 5. Mes de Mayo: Saturación y Rendimientos Decrecientes
  else if (presetOrigen === 'mayo' || (simState.gasto === 3900 && simState.soporte === 8 && simState.visitas === 1580)) {
    activeHeaderId = 'mayo';
    activeCanonId = 4;
    badgeTexto = 'Mayo (Saturación y Rendimientos Decrecientes)';
    badgeClase = 'badge-advertencia';
    contenido = `
      <div class="space-y-1">
        <p class="font-bold text-amber-400 flex items-center justify-between">
          <span>📈 Mayo (Saturación y Rendimientos Decrecientes)</span>
          <span class="text-[11px] font-bold px-1.5 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-800">Efecto Mayo</span>
        </p>
        <p class="text-slate-200 text-xs leading-normal">
          <strong>Significado Real:</strong> Demostración de saturación de audiencias marcianas. Al subir la pauta a $3.900 USD con solo 8% a soporte, el tráfico frío se dispersó y el <strong>CPA se disparó a $42.39 USD (Zona Roja > $42)</strong>. Aunque se captaron 92 clientes, cada adquisición marginal fue sustancialmente más costosa, comprobando la ley de rendimientos decrecientes.
        </p>
      </div>
    `;
  }
  // 6. Estrategia SIM Recomendada (Plan Junio $4.000 USD / 15% CX)
  else if (presetOrigen === 'recomendado' || presetOrigen === 'canon2' || (simState.gasto === 4000 && simState.soporte === 15 && simState.visitas === 1700)) {
    activeCanonId = 2;
    activeHeaderId = 'recomendado';
    badgeTexto = 'Escenario 2: SIM Óptimo';
    badgeClase = 'badge-exito';
    contenido = `
      <div class="space-y-1">
        <p class="font-bold text-emerald-400 flex items-center justify-between">
          <span>🟢 Escenario 2: Estrategia SIM / Equilibrio Óptimo (15% CX = $600 USD)</span>
          <span class="text-[11px] font-bold px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800">Plan Junio Recomendado</span>
        </p>
        <p class="text-slate-200 text-xs leading-normal">
          <strong>Diagnóstico Directivo:</strong> La propuesta canónica del Sistema de Información de Marketing para el Plan Junio ($4.000 USD). Reasigna $600 USD (15%) a posventa y $3.400 USD a pauta neta, logrando <strong>CSAT asegurado en Zona Verde (${simState.csat.toFixed(1)}/10 &gt; 9.0)</strong>, CPA optimizado de <strong>$${simState.cpa.toFixed(2)} USD</strong> y <strong>margen limpio de $${simState.margen.toFixed(2)} USD</strong> por unidad.
        </p>
      </div>
    `;
  }
  // 7. Escenario 3: Hiper-Fidelización (20% - 30% CX)
  else if (presetOrigen === 'canon3' || simState.soporte >= 20) {
    activeCanonId = 3;
    activeHeaderId = null;
    badgeTexto = 'Escenario 3: Fidelización Total';
    badgeClase = 'badge-exito';
    contenido = `
      <div class="space-y-1">
        <p class="font-bold text-cyan-300 flex items-center justify-between">
          <span>🔵 Escenario 3: Hiper-Fidelización y Salvaguarda de Cartera (20-30% CX)</span>
          <span class="text-[11px] font-bold px-1.5 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800">Lealtad VIP</span>
        </p>
        <p class="text-slate-200 text-xs leading-normal">
          <strong>Diagnóstico Directivo:</strong> Arquetipo de máxima lealtad y retención acumulada (&gt; 113%). Al destinar $${simState.gastoCX} USD (${simState.soporte}%) a posventa, el equipo técnico brinda atención personalizada y mantenimiento preventivo continuo, elevando el <strong>CSAT a ${simState.csat.toFixed(1)}/10</strong> y asegurando recompra garantizada de contratos en Marte.
        </p>
      </div>
    `;
  }
  // 8. Expansión Agresiva ($5K)
  else if (presetOrigen === 'agresivo' || (simState.gasto >= 5000 && simState.soporte <= 5)) {
    activeHeaderId = 'agresivo';
    badgeTexto = 'Expansión Agresiva ($5K)';
    badgeClase = 'badge-advertencia';
    contenido = `
      <div class="space-y-1">
        <p class="font-bold text-purple-300 flex items-center justify-between">
          <span>🚀 Expansión Agresiva de Mercado ($5.200 USD | 2% CX)</span>
          <span class="text-[11px] font-bold px-1.5 py-0.5 rounded bg-purple-950 text-purple-300 border border-purple-800">Alto Riesgo</span>
        </p>
        <p class="text-slate-200 text-xs leading-normal">
          <strong>Diagnóstico Directivo:</strong> Gran volumen bruto de ventas (${simState.clientes} unidades), pero con sobrecosto publicitario por saturación y grave riesgo de deterioro de CSAT (${simState.csat.toFixed(1)}/10) por cuello de botella técnico.
        </p>
      </div>
    `;
  }
  // 9. Detección genérica por sliders (Modo Manual)
  else if (simState.soporte === 0 || (simState.soporte < 5 && simState.gasto >= 3000)) {
    activeCanonId = 1;
    badgeTexto = 'Escenario 1: Pauta Ciega';
    badgeClase = 'badge-alerta';
    contenido = `
      <div class="space-y-1">
        <p class="font-bold text-rose-400 flex items-center justify-between">
          <span>🔴 Escenario 1: Status Quo / Pauta Ciega (0% CX)</span>
          <span class="text-[11px] font-bold px-1.5 py-0.5 rounded bg-rose-950 text-rose-300 border border-rose-800">Crisis Febrero</span>
        </p>
        <p class="text-slate-200 text-xs leading-normal">
          <strong>Diagnóstico:</strong> El 100% del presupuesto ($${simState.gasto.toLocaleString()} USD) se consume en anuncios sin soporte postventa. 
          Desencadena saturación técnica y colapso del <strong>CSAT en Zona Roja (${simState.csat.toFixed(1)}/10)</strong>.
        </p>
      </div>
    `;
  }
  else if (simState.gasto >= 3900 && simState.soporte < 12) {
    activeCanonId = 4;
    badgeTexto = 'Escenario 4: Saturación';
    badgeClase = 'badge-advertencia';
    contenido = `
      <div class="space-y-1">
        <p class="font-bold text-amber-400 flex items-center justify-between">
          <span>🟡 Escenario 4: Saturación de Audiencias (&gt; $3.900 USD)</span>
          <span class="text-[11px] font-bold px-1.5 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-800">Efecto Mayo</span>
        </p>
        <p class="text-slate-200 text-xs leading-normal">
          <strong>Diagnóstico:</strong> Entrada en la ley de rendimientos decrecientes. Al forzar la inversión con tráfico frío, el <strong>CPA se eleva a $${simState.cpa.toFixed(2)} USD</strong>.
        </p>
      </div>
    `;
  }
  else if (simState.soporte >= 12 && simState.soporte <= 18) {
    activeCanonId = 2;
    badgeTexto = 'Escenario 2: SIM Óptimo';
    badgeClase = 'badge-exito';
    contenido = `
      <div class="space-y-1">
        <p class="font-bold text-emerald-400 flex items-center justify-between">
          <span>🟢 Escenario 2: Estrategia SIM / Equilibrio Óptimo (15% CX)</span>
          <span class="text-[11px] font-bold px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800">Punto Óptimo</span>
        </p>
        <p class="text-slate-200 text-xs leading-normal">
          <strong>Diagnóstico:</strong> CSAT asegurado en Zona Verde (${simState.csat.toFixed(1)}/10), CPA optimizado en $${simState.cpa.toFixed(2)} USD y margen limpio de $${simState.margen.toFixed(2)} USD.
        </p>
      </div>
    `;
  }
  else {
    badgeTexto = `Transición (${simState.soporte}% CX)`;
    badgeClase = 'badge-advertencia';
    contenido = `
      <div class="space-y-1">
        <p class="font-bold text-slate-200">ℹ️ Configuración Paramétrica Intermedia</p>
        <p class="text-slate-200 text-xs leading-normal">
          Inversión de $${simState.gasto.toLocaleString()} USD con $${simState.gastoCX} USD a CX (${simState.soporte}%) y $${simState.pautaNeta.toLocaleString()} USD a pauta. 
          CSAT: <strong>${simState.csat.toFixed(1)}/10</strong>, CPA: <strong>$${simState.cpa.toFixed(2)} USD</strong> y Margen: <strong>$${simState.margen.toFixed(2)} USD</strong>.
        </p>
      </div>
    `;
  }

  badgeEscenarioActivo.textContent = badgeTexto;
  badgeEscenarioActivo.className = `text-xs md:text-[13px] px-2.5 py-1 rounded-md font-extrabold border ${badgeClase}`;
  boxExplicacionEscenarios.innerHTML = contenido;

  // Sincronización de los 4 botones canónicos preservando siempre su estilo neón brillante
  const botonesCanon = [
    { btn: btnEscCanon1, id: 1 },
    { btn: btnEscCanon2, id: 2 },
    { btn: btnEscCanon3, id: 3 },
    { btn: btnEscCanon4, id: 4 }
  ];

  botonesCanon.forEach(item => {
    if (!item.btn) return;
    if (item.id === activeCanonId) {
      item.btn.classList.add('ring-2', 'ring-white', 'scale-105', 'shadow-xl');
    } else {
      item.btn.classList.remove('ring-2', 'ring-white', 'scale-105', 'shadow-xl');
    }
  });

  // Sincronización visual con los botones de la barra superior
  const headerBtns = [
    { btn: document.getElementById('btn-hdr-enero'), id: 'enero' },
    { btn: document.getElementById('btn-hdr-febrero'), id: 'febrero' },
    { btn: document.getElementById('btn-hdr-abril'), id: 'abril' },
    { btn: document.getElementById('btn-hdr-mayo'), id: 'mayo' },
    { btn: document.getElementById('btn-hdr-recomendado'), id: 'recomendado' },
    { btn: document.getElementById('btn-hdr-agresivo'), id: 'agresivo' }
  ];

  headerBtns.forEach(item => {
    if (!item.btn) return;
    if (item.id === activeHeaderId) {
      item.btn.classList.add('ring-2', 'ring-white/80', 'font-bold', 'scale-[1.03]', 'shadow-md');
    } else {
      item.btn.classList.remove('ring-2', 'ring-white/80', 'scale-[1.03]', 'shadow-md');
    }
  });
}

function cargarEscenarioCanónico(id) {
  if (id === 1) {
    presetOrigen = 'febrero';
    rngGasto.value = 3300; rngSoporte.value = 0; rngVisitas.value = 1650;
  } else if (id === 2) {
    presetOrigen = 'recomendado';
    rngGasto.value = 4000; rngSoporte.value = 15; rngVisitas.value = 1700;
  } else if (id === 3) {
    presetOrigen = 'canon3';
    rngGasto.value = 3500; rngSoporte.value = 25; rngVisitas.value = 1500;
  } else if (id === 4) {
    presetOrigen = 'saturacion';
    rngGasto.value = 4500; rngSoporte.value = 0; rngVisitas.value = 1900;
  }
  calcularParametros();
}

function actualizarInterpretacionGrafica() {
  if (!boxInterpretacion) return;
  const isMarte = (currentTheme === 'marte' || currentTheme === 'dark');
  const tagColor = isMarte ? 'text-[#FF9E4A]' : 'text-[#00F0FF]';
  const colorNeonNombre = isMarte ? 'Naranja Neón Marciano' : 'Cyan Neón Eléctrico';
  let html = '';

  switch (tabActiva) {
    // ------------------------------------------------------------------------
    case 1:
      html = `
        <div class="space-y-1.5">
          <div class="border-b border-slate-700/60 pb-1">
            <strong class="${tagColor} text-xs font-bold uppercase font-black tracking-wide">Gráfica 1: El Dilema Central (CPA vs CSAT)</strong>
          </div>
          <div class="text-xs space-y-1 text-slate-200 leading-normal">
            <p><strong>📐 ¿Cómo leer los ejes (Palitos y Piedritas)?</strong></p>
            <ul class="list-disc pl-3.5 space-y-0.5">
              <li><strong>Eje X (Horizontal):</strong> Costo de Adquisición (CPA) en dólares ($30 a $48 USD). <em>Hacia la izquierda es más barato, hacia la derecha es más caro.</em></li>
              <li><strong>Eje Y (Vertical):</strong> Índice de Satisfacción del Cliente (CSAT) de 2 a 10 puntos. <em>Hacia arriba es mayor calidad y felicidad del cliente.</em></li>
              <li><strong>Elementos del Gráfico:</strong> Los círculos son los meses reales (Enero a Mayo). El <span class="${tagColor} font-bold">Triángulo ${colorNeonNombre}</span> es tu simulación actual.</li>
            </ul>
            <p class="mt-1"><strong>🎯 Qué muestra y para qué sirve:</strong></p>
            <p>Destaca con círculos de colores el peligro de febrero (punto rojo abajo a la izquierda: adquisición barata pero satisfacción destruida en 4.2) frente a abril (punto verde arriba: el equilibrio perfecto entre costo y calidad en 9.4).</p>
            <p class="mt-1 p-1 rounded bg-slate-900/80 border border-slate-700/60">
              👉 <strong>Tu resultado actual:</strong> Tu triángulo se ubica en <strong class="text-white">CPA $${simState.cpa.toFixed(2)} USD</strong> y <strong class="text-white">CSAT ${simState.csat.toFixed(1)}/10</strong>. El objetivo del gerente es mantener el triángulo en el cuadrante superior izquierdo (bajo costo y máxima satisfacción).
            </p>
          </div>
        </div>
      `;
      break;

    // ------------------------------------------------------------------------
    case 2:
      html = `
        <div class="space-y-1.5">
          <div class="border-b border-slate-700/60 pb-1">
            <strong class="${tagColor} text-xs font-bold uppercase font-black tracking-wide">Gráfica 2: La Trampa de la Ecuación de Satisfacción</strong>
          </div>
          <div class="text-xs space-y-1 text-slate-200 leading-normal">
            <p><strong>📐 ¿Cómo leer los ejes (Palitos y Piedritas)?</strong></p>
            <ul class="list-disc pl-3.5 space-y-0.5">
              <li><strong>Eje X (Horizontal):</strong> Los meses analizados (Enero a Mayo + Columna de Simulación).</li>
              <li><strong>Eje Y Izquierdo (Barras):</strong> Cantidad de encuestas de satisfacción respondidas (0 a 200).</li>
              <li><strong>Eje Y Derecho (Línea):</strong> Calificación promedio de satisfacción de 0 a 10 puntos.</li>
              <li><strong>Elementos:</strong> Barras grises = volumen de quejas/encuestas. <span class="${tagColor} font-bold">Elemento ${colorNeonNombre}</span> = tu proyección.</li>
            </ul>
            <p class="mt-1"><strong>🎯 La ecuación en cuestión:</strong> <em>Promedio = ∑ calificaciones / total encuestas</em>.</p>
            <p><strong>Por qué no aplica calcularla:</strong> La tabla del profesor ya entrega el promedio calculado (7.5, 4.2, 6.8, 9.4, 8.1). En febrero contestaron 145 personas con un doloroso 4.2. Intentar "hacer la fórmula" es una pérdida de tiempo; lo que importa es explicar que la avalancha de clientes colapsó el canal de atención.</p>
            <p class="mt-1 p-1 rounded bg-slate-900/80 border border-slate-700/60">
              👉 <strong>Tu proyección actual:</strong> Proyectas 160 encuestas con una nota de <strong class="text-white">${simState.csat.toFixed(1)}/10</strong>. Con ${simState.soporte}% en soporte garantizas atención rápida y evitas la crisis de febrero.
            </p>
          </div>
        </div>
      `;
      break;

    // ------------------------------------------------------------------------
    case 3:
      html = `
        <div class="space-y-1.5">
          <div class="border-b border-slate-700/60 pb-1">
            <strong class="${tagColor} text-xs font-bold uppercase font-black tracking-wide">Gráfica 3: La Trampa de la Ecuación de Retención (>100 %)</strong>
          </div>
          <div class="text-xs space-y-1 text-slate-200 leading-normal">
            <p><strong>📐 ¿Cómo leer los ejes (Palitos y Piedritas)?</strong></p>
            <ul class="list-disc pl-3.5 space-y-0.5">
              <li><strong>Eje X (Horizontal):</strong> Meses de operación comercial.</li>
              <li><strong>Eje Y (Vertical):</strong> Cantidad total de vehículos/clientes en la flota (0 a 2.000 unidades).</li>
              <li><strong>Elementos:</strong> Barra gris = Clientes al inicio del mes. Barra de color = Clientes retenidos al final del mes. <span class="${tagColor} font-bold">Barra ${colorNeonNombre}</span> = tu proyección.</li>
            </ul>
            <p class="mt-1"><strong>🎯 La ecuación en cuestión:</strong> <em>Retención = (Clientes Fin - Adquiridos) / Clientes Inicio</em>.</p>
            <p><strong>Por qué da resultados extraños:</strong> En los libros de texto la retención nunca supera el 100 %. Pero en la tabla del profesor da 110%, 113.6%, 112%... La gráfica demuestra que la empresa no está perdiendo clientes netos, sino expandiendo su base instalada (de 1.000 a 1.700 clientes).</p>
            <p class="mt-1 p-1 rounded bg-slate-900/80 border border-slate-700/60">
              👉 <strong>Tu proyección:</strong> Con <strong class="text-white">${simState.clientes} nuevos clientes</strong>, la flota total retenida supera las 1.770 unidades sin riesgo de deserción si mantienes el soporte activo.
            </p>
          </div>
        </div>
      `;
      break;

    // ------------------------------------------------------------------------
    case 4:
      html = `
        <div class="space-y-1.5">
          <div class="border-b border-slate-700/60 pb-1">
            <strong class="${tagColor} text-xs font-bold uppercase font-black tracking-wide">Gráfica 4: Ley de Rendimientos Decrecientes en Pauta</strong>
          </div>
          <div class="text-xs space-y-1 text-slate-200 leading-normal">
            <p><strong>📐 ¿Cómo leer los ejes (Palitos y Piedritas)?</strong></p>
            <ul class="list-disc pl-3.5 space-y-0.5">
              <li><strong>Eje X (Horizontal):</strong> Cronología de meses.</li>
              <li><strong>Eje Y Izquierdo (Línea continua):</strong> Dólares gastados en marketing ($1.500 a $4.500 USD).</li>
              <li><strong>Eje Y Derecho (Línea punteada):</strong> Costo por Adquisición unitario pagado ($30 a $48 USD).</li>
              <li><strong>Elementos:</strong> El punto final <span class="${tagColor} font-bold">${colorNeonNombre}</span> muestra tu CPA simulado frente al presupuesto.</li>
            </ul>
            <p class="mt-1"><strong>🎯 Qué muestra y el mensaje gerencial:</strong></p>
            <p>Muestra la curva de inversión publicitaria frente al costo de adquirir cada cliente. En enero invertimos $2.200 USD y cada cliente costó $40,00. En mayo metimos $3.900 USD (casi el doble) y el costo por cliente se disparó a $42,39 USD. Demuestra que seguir aumentando el gasto en marketing en frío se vuelve cada vez más ineficiente.</p>
            <p class="mt-1 p-1 rounded bg-slate-900/80 border border-slate-700/60">
              👉 <strong>Tu presupuesto actual:</strong> Con <strong class="text-white">$${simState.gasto} USD</strong> pagas un CPA de <strong class="text-white">$${simState.cpa.toFixed(2)} USD</strong>. Si superas los $3.800 USD, cada cliente nuevo te saldrá más caro por saturación.
            </p>
          </div>
        </div>
      `;
      break;

    // ------------------------------------------------------------------------
    case 5:
      html = `
        <div class="space-y-1.5">
          <div class="border-b border-slate-700/60 pb-1">
            <strong class="${tagColor} text-xs font-bold uppercase font-black tracking-wide">Gráfica 5: Dinámica del Embudo de Conversión (Visitas vs Compras)</strong>
          </div>
          <div class="text-xs space-y-1 text-slate-200 leading-normal">
            <p><strong>📐 ¿Cómo leer los ejes (Palitos y Piedritas)?</strong></p>
            <ul class="list-disc pl-3.5 space-y-0.5">
              <li><strong>Eje X (Horizontal):</strong> Meses evaluados.</li>
              <li><strong>Eje Y Izquierdo (Columnas):</strong> Sesiones web / visitas que llegaron a la web (0 a 2.600).</li>
              <li><strong>Eje Y Derecho (Línea flotante):</strong> Porcentaje de visitantes que compraron (3% a 7%).</li>
              <li><strong>Elementos:</strong> Las barras de fondo son el tráfico. La <span class="${tagColor} font-bold">Línea ${colorNeonNombre}</span> flota por encima mostrando la conversión.</li>
            </ul>
            <p class="mt-1"><strong>🎯 La ecuación en cuestión:</strong> <em>Conversión = Clientes Compradores / Visitas Web</em>.</p>
            <p><strong>Qué revela:</strong> En marzo el porcentaje de conversión bajó a 4,81 % porque la empresa desaceleró la pauta para corregir los errores de febrero. En mayo subió al 5,82 %. La gráfica demuestra que el embudo de ventas maduró y aprendió a seleccionar mejor a los interesados.</p>
            <p class="mt-1 p-1 rounded bg-slate-900/80 border border-slate-700/60">
              👉 <strong>Tu embudo hoy:</strong> Con <strong class="text-white">${simState.visitas} visitas</strong> conviertes al <strong class="text-white">${simState.tasaConv.toFixed(2)}%</strong>, cerrando <strong class="text-white">${simState.clientes} Rovers</strong> vendidos.
            </p>
          </div>
        </div>
      `;
      break;

    // ------------------------------------------------------------------------
    case 6:
      html = `
        <div class="space-y-1.5">
          <div class="border-b border-slate-700/60 pb-1">
            <strong class="${tagColor} text-xs font-bold uppercase font-black tracking-wide">Gráfica 6: Economía Unitaria y Margen Limpio por Rover</strong>
          </div>
          <div class="text-xs space-y-1 text-slate-200 leading-normal">
            <p><strong>📐 ¿Cómo leer los ejes (Palitos y Piedritas)?</strong></p>
            <ul class="list-disc pl-3.5 space-y-0.5">
              <li><strong>Eje Y (Vertical):</strong> Las 3 variables clave: Precio de venta, Costo de adquisición (CPA) y Ganancia limpia.</li>
              <li><strong>Eje X (Horizontal):</strong> Valor en dólares ($0 a $120 USD por cliente).</li>
              <li><strong>Elementos:</strong> Barra superior = Precio facturado ($101.5 USD). Barra media = Lo que se gasta en pauta. <span class="${tagColor} font-bold">Barra inferior ${colorNeonNombre}</span> = Ganancia neta libre en bolsillo.</li>
            </ul>
            <p class="mt-1"><strong>🎯 La prueba de viabilidad financiera:</strong></p>
            <p>Cada cliente que compra un Rover paga entre $100 y $110 USD. Muestra en color carmesí lo que nos cuesta captarlo ($38 a $42 USD) y en color neón lo que nos queda libre en el bolsillo: entre $60 y $68,48 USD por cliente. Esto demuestra numéricamente al profesor que el proyecto es un éxito financiero rotundo.</p>
            <p class="mt-1 p-1 rounded bg-slate-900/80 border border-slate-700/60">
              👉 <strong>Tu margen limpio:</strong> Pagando un CPA de $${simState.cpa.toFixed(2)} USD, le quedan a la empresa <strong class="text-emerald-400 font-bold">$${simState.margen.toFixed(2)} USD limpios</strong> por cada Rover (un saludable ${((simState.margen/101.5)*100).toFixed(1)}% de margen).
            </p>
          </div>
        </div>
      `;
      break;

    // ------------------------------------------------------------------------
    case 7:
      html = `
        <div class="space-y-1.5">
          <div class="border-b border-slate-700/60 pb-1">
            <strong class="${tagColor} text-xs font-bold uppercase font-black tracking-wide">Gráfica 7: El Ratio Maestro (CSAT / CPA)</strong>
          </div>
          <div class="text-xs space-y-1 text-slate-200 leading-normal">
            <p><strong>📐 ¿Cómo leer los ejes (Palitos y Piedritas)?</strong></p>
            <ul class="list-disc pl-3.5 space-y-0.5">
              <li><strong>Eje X (Horizontal):</strong> Meses evaluados.</li>
              <li><strong>Eje Y (Vertical):</strong> Puntos de satisfacción ganados por cada $1 dólar invertido (0.00 a 0.35).</li>
              <li><strong>Elementos:</strong> Columnas por mes. La columna <span class="${tagColor} font-bold">${colorNeonNombre}</span> es tu simulación actual.</li>
            </ul>
            <p class="mt-1"><strong>🎯 El indicador creado y qué significa:</strong></p>
            <p>Divide la calificación de satisfacción entre el costo de captación. Mide cuántos "puntos de felicidad" compramos por cada dólar gastado. Febrero se desploma a 0,10 (un desastre de gestión), mientras que abril salta a 0,23 (el mes de máxima productividad gerencial).</p>
            <p class="mt-1 p-1 rounded bg-slate-900/80 border border-slate-700/60">
              👉 <strong>Tu ratio actual:</strong> Generas <strong class="text-white">${simState.ratio} puntos/USD</strong>. Superar 0.22 demuestra excelencia directiva.
            </p>
          </div>
        </div>
      `;
      break;

    // ------------------------------------------------------------------------
    case 8:
      html = `
        <div class="space-y-1.5">
          <div class="border-b border-slate-700/60 pb-1">
            <strong class="${tagColor} text-xs font-bold uppercase font-black tracking-wide">Gráfica 8: Correlación Causal de Crecimiento (Ventas vs Gasto y ROAS)</strong>
          </div>
          <div class="text-xs space-y-1 text-slate-200 leading-normal">
            <p><strong>📐 ¿Cómo leer los ejes (Palitos y Piedritas)?</strong></p>
            <ul class="list-disc pl-3.5 space-y-0.5">
              <li><strong>Eje X (Horizontal):</strong> Meses de facturación.</li>
              <li><strong>Eje Y (Vertical):</strong> Dólares ($0 a $12.000 USD).</li>
              <li><strong>Elementos:</strong> Barra principal = Ventas totales facturadas. Barra secundaria = Dinero invertido en publicidad. <span class="${tagColor} font-bold">Barra ${colorNeonNombre}</span> = tu proyección.</li>
            </ul>
            <p class="mt-1"><strong>🎯 El ROAS (Return On Ad Spend):</strong></p>
            <p>Demuestra que el negocio tiene un multiplicador estable de 2,56: por cada $1 dólar invertido en pauta publicitaria, ingresan $2,56 dólares en ventas.</p>
            <p class="mt-1 p-1 rounded bg-slate-900/80 border border-slate-700/60">
              👉 <strong>Tu proyección de ventas:</strong> Inviertes <strong class="text-white">$${simState.gasto} USD</strong> y facturas <strong class="text-white">$${simState.ventas} USD</strong>, logrando un ROAS de <strong class="text-white">${simState.roas}x</strong>.
            </p>
          </div>
        </div>
      `;
      break;

    // ------------------------------------------------------------------------
    case 9:
      html = `
        <div class="space-y-1.5">
          <div class="border-b border-slate-700/60 pb-1">
            <strong class="${tagColor} text-xs font-bold uppercase font-black tracking-wide">Gráfica 9: Evolución de Cartera Total de la Misión</strong>
          </div>
          <div class="text-xs space-y-1 text-slate-200 leading-normal">
            <p><strong>📐 ¿Cómo leer los ejes (Palitos y Piedritas)?</strong></p>
            <ul class="list-disc pl-3.5 space-y-0.5">
              <li><strong>Eje X (Horizontal):</strong> Meses de acumulación de clientes.</li>
              <li><strong>Eje Y (Vertical):</strong> Masa crítica acumulada de clientes en Marte (1.000 a 2.000 clientes).</li>
              <li><strong>Elementos:</strong> Línea punteada = Cartera base retenida. <span class="${tagColor} font-bold">Línea sólida ${colorNeonNombre}</span> = Cartera total con tu 6.º punto proyectado.</li>
            </ul>
            <p class="mt-1"><strong>🎯 Qué muestra la acumulación:</strong></p>
            <p>El crecimiento acumulado de la empresa, pasando de 1.155 clientes en enero a 1.792 clientes en mayo (+55 % de expansión institucional en el mercado aeroespacial).</p>
            <p class="mt-1 p-1 rounded bg-slate-900/80 border border-slate-700/60">
              👉 <strong>Tu impacto acumulado:</strong> Sumando tus <strong class="text-white">${simState.clientes} nuevos clientes</strong> a los 1.792 de mayo, la empresa alcanza una flota histórica de <strong class="text-white">${1792 + simState.clientes} clientes</strong> en Marte.
            </p>
          </div>
        </div>
      `;
      break;

    // ------------------------------------------------------------------------
    case 10:
      html = `
        <div class="space-y-1.5">
          <div class="border-b border-slate-700/60 pb-1">
            <strong class="${tagColor} text-xs font-bold uppercase font-black tracking-wide">Gráfica 10: La Decisión Estratégica Directiva (Reasignación del 15 %)</strong>
          </div>
          <div class="text-xs space-y-1 text-slate-200 leading-normal">
            <p><strong>📐 ¿Cómo leer los ejes (Palitos y Piedritas)?</strong></p>
            <ul class="list-disc pl-3.5 space-y-0.5">
              <li><strong>Eje X (Horizontal):</strong> Dos escenarios comparados: Estrategia Actual (Gasto ciego) vs Estrategia Optimizada SIM.</li>
              <li><strong>Eje Y (Vertical):</strong> Presupuesto total de marketing en dólares ($0 a $4.500 USD).</li>
              <li><strong>Elementos:</strong> Barra apilada: Segmento oscuro = Pauta en captación. <span class="${tagColor} font-bold">Segmento ${colorNeonNombre}</span> = Dinero reasignado a salvaguardar el soporte técnico y posventa (CX).</li>
            </ul>
            <p class="mt-1"><strong>🎯 La propuesta final que aprueba el ACA:</strong></p>
            <p>Muestra el escenario actual (gastar los $3.900 USD completos en pauta ciega arriesgando saturación) versus la estrategia recomendada: $3.315 USD a captación y $585 USD (15 %) destinados a salvaguardar el soporte técnico y posventa, asegurando que la satisfacción nunca vuelva a caer de 9,0.</p>
            <p class="mt-1 p-1 rounded bg-slate-900/80 border border-slate-700/60">
              👉 <strong>Tu decisión hoy:</strong> Destinas <strong class="text-white">$${simState.pautaNeta} USD</strong> a captación y <strong class="text-white">$${simState.gastoCX} USD (${simState.soporte}%)</strong> a soporte, asegurando la lealtad de la marca.
            </p>
          </div>
        </div>
      `;
      break;
  }

  if (boxInterpretacion) boxInterpretacion.innerHTML = html;
}

function cambiarTab(num) {
  tabActiva = num;

  for (let i = 1; i <= 10; i++) {
    const btn = document.getElementById(`tab-${i}`);
    if (!btn) continue;
    if (i === num) {
      btn.className = "tab-btn btn-accent active text-xs px-2 py-1.5 rounded-lg font-bold text-center truncate";
    } else {
      btn.className = "tab-btn btn-accent text-xs px-2 py-1.5 rounded-lg font-bold text-center truncate";
    }
  }

  const btnActivo = document.getElementById(`tab-${num}`);
  const nombreTab = btnActivo ? btnActivo.textContent : `Gráfica ${num}`;
  tabDescripcion.innerHTML = `<span>📊</span> Gráfica ${num}: ${nombreTab}`;
  txtExplicacionCorta.innerHTML = `📌 <strong>Lectura Ejecutiva:</strong> El elemento neón resalta tu decisión simulada frente a los datos históricos reales.`;
  actualizarInterpretacionGrafica();
  renderizarGraficaActiva();
}

// ==========================================================================
// RENDERIZADO DE LAS 10 GRÁFICAS ADAPTADAS AL TEMA (CON RESALTADO NEÓN ÚNICO)
// ==========================================================================

// ==========================================================================
// PLUGIN Y RENDERIZADO DE UMBRALES EN PRIMER PLANO (afterDatasetsDraw)
// ==========================================================================
function obtenerDiagnosticoTooltip(tab, items) {
  if (!items || !items.length) return '';
  const item = items[0];

  switch (tab) {
    case 1: {
      const x = item.parsed.x;
      const y = item.parsed.y;
      let lines = [];
      if (y >= 8.5) lines.push('✓ Meta CSAT Cumplida (≥ 8.5 pts)');
      else if (y <= 7.0) lines.push('⚠ Alerta Crítica CSAT (≤ 7.0 pts)');
      else lines.push('ℹ CSAT Aceptable (7.0 - 8.4 pts)');

      if (x <= 40.0) lines.push('✓ CPA Eficiente (≤ $40.00 USD)');
      else if (x >= 42.0) lines.push('⚠ CPA Saturado (≥ $42.00 USD)');
      else lines.push('ℹ CPA Moderado ($40 - $42 USD)');
      return lines.join('\n');
    }
    case 2:
      return 'Umbrales CSAT: Meta ≥ 8.5 pts (Verde) | Alerta Crítica ≤ 6.5 pts (Rojo)';
    case 3:
      return 'Línea de Paridad: 100% Retención. Valores > 100% prueban Expansión Neta de flota.';
    case 4:
      return 'Umbrales: Saturación Pauta > $3.500 USD | CPA Óptimo ≤ $40.00 | Alerta ≥ $42.00';
    case 5:
      return 'Umbrales Conversión: Meta Eficiencia ≥ 5.50% | Base Histórica 5.00%';
    case 6:
      return 'Umbral Normativo: Mínimo $60.00 USD de Margen Limpio por Rover vendido.';
    case 7:
      return 'Ratio Maestro: Meta Excelencia ≥ 0.2000 pts/USD | Alerta Crítica < 0.1500';
    case 8:
      return 'Umbrales Financieros: Break-Even 2.50x | Multiplicador Base Empírico ~2.56x';
    case 9:
      return 'Expansión de Flota: Crecimiento compuesto proyectado (+55% sobre base Enero).';
    case 10:
      return 'Regla SIM: Reasignar 15% ($600 USD) a Soporte Técnico CX para salvaguardar las operaciones.';
    default:
      return '';
  }
}

// ==========================================================================
// SISTEMA DE UMBRALES INTERACTIVOS Y BADGES DE ALTO CONTRASTE
// ==========================================================================
let chartThresholds = [];
let hoveredThreshold = null;
let thresholdInteractivityInitialized = false;

function drawRoundedRect(ctx, x, y, width, height, radius) {
  ctx.beginPath();
  if (typeof ctx.roundRect === 'function') {
    ctx.roundRect(x, y, width, height, radius);
  } else {
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    ctx.lineTo(x + radius, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
  }
  ctx.closePath();
}

function wrapCanvasLines(ctx, text, maxWidth) {
  const words = text.split(' ');
  const lines = [];
  let currentLine = words[0];

  for (let i = 1; i < words.length; i++) {
    const word = words[i];
    const width = ctx.measureText(currentLine + ' ' + word).width;
    if (width < maxWidth) {
      currentLine += ' ' + word;
    } else {
      lines.push(currentLine);
      currentLine = word;
    }
  }
  lines.push(currentLine);
  return lines;
}

function initThresholdCanvasListener(canvas) {
  if (thresholdInteractivityInitialized || !canvas) return;
  thresholdInteractivityInitialized = true;

  canvas.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    let match = null;
    for (let i = chartThresholds.length - 1; i >= 0; i--) {
      const t = chartThresholds[i];
      // 1. Detección sobre la pastilla/badge con margen de captura
      const inBadge = (mouseX >= t.bbox.x - 2 && mouseX <= t.bbox.x + t.bbox.w + 2 &&
                       mouseY >= t.bbox.y - 2 && mouseY <= t.bbox.y + t.bbox.h + 2);
      
      // 2. Detección sobre la línea punteada (tolerancia ±6px)
      let onLine = false;
      if (t.type === 'H') {
        onLine = (Math.abs(mouseY - t.lineY) <= 6 && mouseX >= t.lineX1 && mouseX <= t.lineX2);
      } else if (t.type === 'V') {
        onLine = (Math.abs(mouseX - t.lineX) <= 6 && mouseY >= t.lineY1 && mouseY <= t.lineY2);
      }

      if (inBadge || onLine) {
        match = { ...t, mouseX, mouseY };
        break;
      }
    }

    const prevId = hoveredThreshold ? hoveredThreshold.id : null;
    const newId = match ? match.id : null;

    if (prevId !== newId) {
      hoveredThreshold = match;
      canvas.style.cursor = match ? 'pointer' : 'default';
      if (chartInstance) chartInstance.draw();
    }
  });

  canvas.addEventListener('mouseleave', () => {
    if (hoveredThreshold) {
      hoveredThreshold = null;
      canvas.style.cursor = 'default';
      if (chartInstance) chartInstance.draw();
    }
  });
}

const thresholdPlugin = {
  id: 'thresholdPlugin',
  afterDatasetsDraw(chart) {
    const { ctx, chartArea, scales } = chart;
    if (!chartArea) return;
    const { top, bottom, left, right } = chartArea;

    chartThresholds = []; // Reset en cada ciclo de render
    ctx.save();

    function drawHLine(yScale, val, label, color, options = {}) {
      if (!yScale || typeof yScale.getPixelForValue !== 'function') return;
      const yPx = yScale.getPixelForValue(val);
      if (yPx < top - 2 || yPx > bottom + 2) return;

      const {
        dash = [5, 5],
        align = 'right',
        zone = 'Normativa Directiva',
        desc = 'Umbral de referencia para control y gobernanza.'
      } = options;

      const thresholdId = `H_${yScale.id}_${val}_${label}`;
      const isHovered = hoveredThreshold && hoveredThreshold.id === thresholdId;
      const isLight = (currentTheme === 'light');
  const isMarte = (currentTheme === 'marte' || currentTheme === 'dark');

      // 1. Línea punteada horizontal limpia
      ctx.beginPath();
      ctx.setLineDash(dash);
      ctx.strokeStyle = color;
      ctx.lineWidth = isHovered ? 2.6 : 1.6;
      if (isHovered) {
        ctx.shadowColor = color;
        ctx.shadowBlur = 10;
      } else {
        ctx.shadowColor = 'transparent';
        ctx.shadowBlur = 0;
      }
      ctx.moveTo(left, yPx);
      ctx.lineTo(right, yPx);
      ctx.stroke();

      ctx.setLineDash([]);
      ctx.shadowBlur = 0;

      // 2. Pastilla / Badge de Alto Contraste con Separación Vertical Limpia
      ctx.font = 'bold 11px "Plus Jakarta Sans", sans-serif';
      const tw = ctx.measureText(label).width;
      const padX = 10;
      const badgeH = 22;
      const badgeW = tw + padX * 2;

      // Posición vertical: Separada de la línea por 8px de aire (JAMÁS pegada ni cortando el texto)
      const placeBelow = (yPx < top + 36);
      const badgeY = placeBelow ? (yPx + 8) : (yPx - badgeH - 8);
      const textY = badgeY + 15;

      // Posición horizontal con margen de respiro
      const badgeX = (align === 'right') ? (right - badgeW - 10) : (left + 10);
      const textX = badgeX + padX;

      // Dibujar caja del badge con bordes redondeados y fondo 100% opaco
      drawRoundedRect(ctx, badgeX, badgeY, badgeW, badgeH, 6);
      if (isLight) {
        ctx.fillStyle = isHovered ? '#FFFFFF' : '#F8FAFC';
      } else {
        ctx.fillStyle = isHovered ? 'rgba(38, 16, 24, 0.98)' : 'rgba(18, 8, 13, 0.95)';
      }
      ctx.fill();

      // Borde del badge con color del semáforo
      ctx.strokeStyle = color;
      ctx.lineWidth = isHovered ? 2.0 : 1.2;
      if (isHovered) {
        ctx.shadowColor = color;
        ctx.shadowBlur = 12;
      } else {
        ctx.shadowColor = isLight ? 'rgba(0, 0, 0, 0.08)' : 'rgba(0, 0, 0, 0.85)';
        ctx.shadowBlur = 4;
      }
      ctx.stroke();
      ctx.shadowBlur = 0;

      // Texto nítido de alto contraste
      ctx.fillStyle = isLight ? '#0F172A' : '#FFFFFF';
      ctx.fillText(label, textX, textY);

      // Registrar para interactividad
      chartThresholds.push({
        id: thresholdId,
        type: 'H',
        val,
        label,
        color,
        zone,
        desc,
        bbox: { x: badgeX, y: badgeY, w: badgeW, h: badgeH },
        lineY: yPx,
        lineX1: left,
        lineX2: right
      });
    }

    function drawVLine(xScale, val, label, color, options = {}) {
      if (!xScale || typeof xScale.getPixelForValue !== 'function') return;
      const xPx = xScale.getPixelForValue(val);
      if (xPx < left - 2 || xPx > right + 2) return;

      const {
        dash = [5, 5],
        align = 'top',
        zone = 'Normativa Directiva',
        desc = 'Umbral de referencia para control y gobernanza.'
      } = options;

      const thresholdId = `V_${xScale.id}_${val}_${label}`;
      const isHovered = hoveredThreshold && hoveredThreshold.id === thresholdId;
      const isLight = (currentTheme === 'light');
  const isMarte = (currentTheme === 'marte' || currentTheme === 'dark');

      // 1. Línea punteada vertical
      ctx.beginPath();
      ctx.setLineDash(dash);
      ctx.strokeStyle = color;
      ctx.lineWidth = isHovered ? 2.6 : 1.6;
      if (isHovered) {
        ctx.shadowColor = color;
        ctx.shadowBlur = 10;
      } else {
        ctx.shadowColor = 'transparent';
        ctx.shadowBlur = 0;
      }
      ctx.moveTo(xPx, top);
      ctx.lineTo(xPx, bottom);
      ctx.stroke();

      ctx.setLineDash([]);
      ctx.shadowBlur = 0;

      // 2. Pastilla de Alto Contraste Separada Horizontalmente
      ctx.font = 'bold 11px "Plus Jakarta Sans", sans-serif';
      const tw = ctx.measureText(label).width;
      const padX = 10;
      const badgeH = 22;
      const badgeW = tw + padX * 2;

      // Posición vertical
      const badgeY = (align === 'top') ? (top + 10) : (bottom - badgeH - 10);
      const textY = badgeY + 15;

      // Posición horizontal separada 8px de la línea vertical
      const placeLeft = (xPx > right - badgeW - 25);
      const badgeX = placeLeft ? (xPx - badgeW - 8) : (xPx + 8);
      const textX = badgeX + padX;

      drawRoundedRect(ctx, badgeX, badgeY, badgeW, badgeH, 6);
      if (isLight) {
        ctx.fillStyle = isHovered ? '#FFFFFF' : '#F8FAFC';
      } else {
        ctx.fillStyle = isHovered ? 'rgba(38, 16, 24, 0.98)' : 'rgba(18, 8, 13, 0.95)';
      }
      ctx.fill();

      ctx.strokeStyle = color;
      ctx.lineWidth = isHovered ? 2.0 : 1.2;
      if (isHovered) {
        ctx.shadowColor = color;
        ctx.shadowBlur = 12;
      } else {
        ctx.shadowColor = isLight ? 'rgba(0, 0, 0, 0.08)' : 'rgba(0, 0, 0, 0.85)';
        ctx.shadowBlur = 4;
      }
      ctx.stroke();
      ctx.shadowBlur = 0;

      ctx.fillStyle = isLight ? '#0F172A' : '#FFFFFF';
      ctx.fillText(label, textX, textY);

      chartThresholds.push({
        id: thresholdId,
        type: 'V',
        val,
        label,
        color,
        zone,
        desc,
        bbox: { x: badgeX, y: badgeY, w: badgeW, h: badgeH },
        lineX: xPx,
        lineY1: top,
        lineY2: bottom
      });
    }

    // Dibujado de umbrales según la gráfica activa
    switch (tabActiva) {
      case 1:
        // Gráfica 1: Scatter CPA vs CSAT
        drawHLine(scales.y, 8.5, '✓ Meta CSAT (≥ 8.5)', '#10B981', {
          zone: 'Zona Verde (Meta Directiva)',
          desc: 'Garantiza la retención neta de la flota corporativa en Marte y recompra recurrente de repuestos.'
        });
        drawHLine(scales.y, 7.0, '⚠ Alerta Crítica CSAT (< 7.0)', '#F43F5E', {
          zone: 'Zona Roja (Mandato de Crisis)',
          desc: 'Activa el freno inmediato de pauta publicitaria para evitar el colapso operativo en talleres mecánicos.'
        });
        drawVLine(scales.x, 40.0, '✓ CPA Óptimo ($40)', '#10B981', {
          align: 'top',
          zone: 'Zona Verde (Eficiencia)',
          desc: 'Rango de captación eficiente antes de incurrir en saturación por audiencias frías.'
        });
        drawVLine(scales.x, 42.0, '⚠ CPA Alerta ($42)', '#F43F5E', {
          align: 'bottom',
          zone: 'Zona Roja (Saturación)',
          desc: 'Costo por adquisición en zona de rendimientos decrecientes; encarecimiento de ventas.'
        });
        break;

      case 2:
        // Gráfica 2: Ecuación CSAT
        drawHLine(scales.y1, 8.5, '✓ Umbral Meta CSAT (≥ 8.5 pts)', '#10B981', {
          zone: 'Zona Verde (Excelencia)',
          desc: 'Nivel óptimo de satisfacción del cliente con soporte posventa garantizado (caso Abril: 9.4 pts).'
        });
        drawHLine(scales.y1, 6.5, '⚠ Alerta Crítica CSAT (≤ 6.5 pts)', '#F43F5E', {
          zone: 'Zona Roja (Tensión Técnica)',
          desc: 'Sobrecarga severa de talleres mecánicos por exceso de rovers sin personal de alistamiento.'
        });
        break;

      case 3:
        // Gráfica 3: Retención > 100%
        drawHLine(scales.y, 1700, 'ℹ Paridad Base Flota (100% Retención)', '#F59E0B', {
          align: 'left',
          zone: 'Línea Base de Paridad',
          desc: 'Punto de equilibrio donde el churn es 0%. Valores superiores a 1.700 certifican expansión neta acumulada.'
        });
        break;

      case 4:
        // Gráfica 4: Rendimientos Decrecientes
        drawHLine(scales.y, 3500, '⚠ Umbral Saturación Pauta ($3.500 USD)', '#F59E0B', {
          align: 'left',
          zone: 'Límite de Inversión Óptima',
          desc: 'A partir de $3.500 USD en pauta ciega, cada dólar adicional incrementa drásticamente el CPA unitario.'
        });
        drawHLine(scales.y1, 40.0, '✓ CPA Óptimo ($40.00 USD)', '#10B981', {
          zone: 'Zona Verde',
          desc: 'Costo de adquisición controlado alcanzado en Abril ($39.74 USD).'
        });
        drawHLine(scales.y1, 42.0, '⚠ CPA Alerta ($42.00 USD)', '#F43F5E', {
          zone: 'Zona Roja',
          desc: 'Nivel crítico de saturación publicitaria registrado en Mayo ($42.39 USD).'
        });
        break;

      case 5:
        // Gráfica 5: Embudo Visitas vs Conversión
        drawHLine(scales.y1, 5.5, '✓ Meta Eficiencia CR (≥ 5.50%)', '#10B981', {
          zone: 'Zona Verde (Conversión Alta)',
          desc: 'Excelente desempeño del landing page marciano convirtiendo tráfico calificado.'
        });
        drawHLine(scales.y1, 5.0, 'ℹ Base Histórica CR (5.00%)', '#94A3B8', {
          zone: 'Línea Base Promedio',
          desc: 'Tasa promedio histórica de transformación de visitantes a compradores de rovers.'
        });
        break;

      case 6:
        // Gráfica 6: Margen Limpio por Rover
        drawVLine(scales.x, 60.0, '✓ Umbral Mínimo Viabilidad ($60 USD)', '#10B981', {
          align: 'top',
          zone: 'Mínimo Financiero',
          desc: 'Garantiza una utilidad libre neta superior al 60% por cada rover vendido tras descontar el CPA.'
        });
        break;

      case 7:
        // Gráfica 7: Ratio Maestro CSAT/CPA
        drawHLine(scales.y, 0.20, '✓ Meta Excelencia (≥ 0.2000 pts/USD)', '#10B981', {
          zone: 'Zona Verde (Alta Eficiencia)',
          desc: 'Devuelve más de 0.20 puntos de satisfacción por cada dólar gastado (logrado en Abril: 0.2365).'
        });
        drawHLine(scales.y, 0.15, '⚠ Alerta Crítica (< 0.1500 pts/USD)', '#F43F5E', {
          zone: 'Zona Roja (Desperdicio)',
          desc: 'Volumen desordenado con alta captación pero satisfacción destruida (caso Febrero: 0.1082).'
        });
        break;

      case 8:
        // Gráfica 8: ROAS 2.56x
        drawHLine(scales.y1, 2.50, '⚠ Umbral Break-Even (2.50x)', '#F59E0B', {
          zone: 'Punto de Equilibrio',
          desc: 'Retorno publicitario mínimo requerido para cubrir costos totales de la operación.'
        });
        drawHLine(scales.y1, 2.56, 'ℹ Multiplicador Empírico (~2.56x)', '#38BDF8', {
          align: 'left',
          zone: 'Constante Calibrada',
          desc: 'Por cada $1 invertido en pauta directa se generan $2.56 USD en ventas brutas de vehículos.'
        });
        break;

      case 9:
        // Gráfica 9: Cartera Total
        drawHLine(scales.y, 1750, '✓ Trayectoria Base Expansión (+55%)', '#10B981', {
          align: 'left',
          zone: 'Meta de Crecimiento',
          desc: 'Crecimiento acumulado sostenido de la flota corporativa activa en el mercado marciano.'
        });
        break;

      case 10:
        // Gráfica 10: Reasignación 15%
        drawHLine(scales.y, 4000, '🎯 Presupuesto Plan Junio ($4.000 USD)', '#10B981', {
          align: 'left',
          zone: 'Presupuesto Estratégico',
          desc: 'Distribución equilibrada: $3.400 USD a Pauta Neta (85%) y $600 USD a Soporte Posventa (15%).'
        });
        break;
    }

    // 3. Renderizado de Tooltip Flotante Ejecutivo al hacer Hover
    if (hoveredThreshold) {
      const ht = hoveredThreshold;
      const isLightTip = (currentTheme === 'light');
      const tipW = 290;
      const pad = 12;
      ctx.font = 'normal 11px "Plus Jakarta Sans", sans-serif';
      const descLines = wrapCanvasLines(ctx, ht.desc, tipW - pad * 2);
      const tipH = 54 + (descLines.length * 15);

      let tipX = ht.mouseX ? (ht.mouseX + 16) : (ht.bbox.x);
      let tipY = ht.mouseY ? (ht.mouseY - tipH - 12) : (ht.bbox.y - tipH - 10);

      // Limitar a los bordes visibles del canvas
      if (tipX + tipW > right) tipX = right - tipW - 8;
      if (tipX < left + 8) tipX = left + 8;
      if (tipY < top + 8) tipY = (ht.mouseY ? ht.mouseY + 20 : ht.bbox.y + ht.bbox.h + 10);
      if (tipY + tipH > bottom) tipY = bottom - tipH - 8;

      // Caja del Tooltip Flotante adaptado al tema (Modo Claro vs Modo Oscuro)
      drawRoundedRect(ctx, tipX, tipY, tipW, tipH, 8);
      if (isLightTip) {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.98)';
        ctx.fill();
        ctx.strokeStyle = ht.color;
        ctx.lineWidth = 1.8;
        ctx.shadowColor = 'rgba(0, 0, 0, 0.14)';
        ctx.shadowBlur = 14;
        ctx.stroke();
      } else {
        ctx.fillStyle = 'rgba(14, 10, 16, 0.98)';
        ctx.fill();
        ctx.strokeStyle = ht.color;
        ctx.lineWidth = 1.8;
        ctx.shadowColor = ht.color;
        ctx.shadowBlur = 14;
        ctx.stroke();
      }
      ctx.shadowBlur = 0;

      // Encabezado del Tooltip
      ctx.font = 'bold 11.5px "Plus Jakarta Sans", sans-serif';
      ctx.fillStyle = ht.color;
      ctx.fillText(ht.label, tipX + pad, tipY + 18);

      // Subtítulo de Zona
      ctx.font = 'bold 10px "Plus Jakarta Sans", sans-serif';
      ctx.fillStyle = isLightTip ? '#475569' : '#94A3B8';
      ctx.fillText(ht.zone.toUpperCase(), tipX + pad, tipY + 32);

      // Línea divisoria fina
      ctx.beginPath();
      ctx.strokeStyle = isLightTip ? '#E2E8F0' : 'rgba(255, 255, 255, 0.14)';
      ctx.lineWidth = 1;
      ctx.moveTo(tipX + pad, tipY + 39);
      ctx.lineTo(tipX + tipW - pad, tipY + 39);
      ctx.stroke();

      // Descripción legible
      ctx.font = 'normal 11px "Plus Jakarta Sans", sans-serif';
      ctx.fillStyle = isLightTip ? '#1E293B' : '#E2E8F0';
      let lineY = tipY + 53;
      for (const line of descLines) {
        ctx.fillText(line, tipX + pad, lineY);
        lineY += 15;
      }
    }

    ctx.restore();
  }
};

function renderizarGraficaActiva() {
  const canvas = document.getElementById('lienzo-grafico');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  initThresholdCanvasListener(canvas);
  if (chartInstance) chartInstance.destroy();

  const isLight = (currentTheme === 'light');
  const isMarte = (currentTheme === 'marte' || currentTheme === 'dark');

  // Colores dinámicos adaptados a modo claro / modo oscuro
  const colorSimulacion = isLight ? '#EA580C' : '#FF6B00';
  const colorSimulacionTrans = isLight ? 'rgba(234, 88, 12, 0.25)' : 'rgba(255, 107, 0, 0.25)';

  // Paleta base para datos históricos
  const barHistoricoColor = isLight ? '#94A3B8' : '#451D24';
  const lineHistoricoColor = isLight ? '#2563EB' : '#EA580C';
  const gridColor = isLight ? '#E2E8F0' : '#3A1418';
  const textColor = isLight ? '#334155' : '#FDBA74';

  const commonOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { labels: { color: textColor, font: { size: 11.5, weight: 'bold' } } },
      tooltip: {
        backgroundColor: isLight ? '#FFFFFF' : '#0F172A',
        titleColor: isLight ? '#0F172A' : '#F8FAFC',
        bodyColor: isLight ? '#334155' : '#E2E8F0',
        borderColor: isLight ? '#CBD5E1' : '#334155',
        borderWidth: 1,
        padding: 10,
        titleFont: { size: 12, weight: 'bold' },
        bodyFont: { size: 11.5 },
        callbacks: {
          footer: function(tooltipItems) {
            return obtenerDiagnosticoTooltip(tabActiva, tooltipItems);
          }
        }
      }
    },
    scales: {
      x: { ticks: { color: textColor, font: { size: 11, weight: '600' } }, grid: { color: gridColor } },
      y: { ticks: { color: textColor, font: { size: 11, weight: '600' } }, grid: { color: gridColor } }
    }
  };

  switch (tabActiva) {
    // 1. Dilema Central: CPA vs CSAT
    case 1:
      chartInstance = new Chart(ctx, {
        type: 'scatter',
        data: {
          datasets: [
            {
              label: 'Meses Reales (Ene - May)',
              data: [
                { x: 40.00, y: 7.5, label: 'Enero' },
                { x: 38.82, y: 4.2, label: 'Febrero (Colapso 4.2)' },
                { x: 41.54, y: 6.8, label: 'Marzo' },
                { x: 39.74, y: 9.4, label: 'Abril (Óptimo 9.4)' },
                { x: 42.39, y: 8.1, label: 'Mayo' }
              ],
              backgroundColor: ['#64748B', '#F43F5E', '#64748B', '#10B981', '#F59E0B'],
              pointRadius: 8,
              order: 0
            },
            {
              label: 'Tu Simulación Actual (Resaltado)',
              data: [{ x: simState.cpa, y: simState.csat, label: 'Tu Simulación' }],
              backgroundColor: colorSimulacion,
              borderColor: '#FFFFFF',
              borderWidth: 2.5,
              pointRadius: 14,
              pointStyle: 'triangle',
              order: -5
            }
          ]
        },
        plugins: [thresholdPlugin],
        options: {
          ...commonOptions,
          scales: {
            x: { title: { display: true, text: 'CPA ($ USD)', color: textColor }, min: 30, max: 48, ticks: { color: textColor }, grid: { color: gridColor } },
            y: { title: { display: true, text: 'CSAT (0-10)', color: textColor }, min: 2, max: 10.5, ticks: { color: textColor }, grid: { color: gridColor } }
          }
        }
      });
      break;

    // 2. Ecuación CSAT (LÍNEA FLOTANDO POR ENCIMA DE LAS BARRAS CON UMBRALES)
    case 2:
      chartInstance = new Chart(ctx, {
        type: 'bar',
        data: {
          labels: [...datosReales.meses, 'Simulación'],
          datasets: [
            // Línea CSAT con order: -5 (se dibuja POR ENCIMA de las barras)
            {
              type: 'line',
              label: 'CSAT Promedio (0-10)',
              data: [...datosReales.csat, simState.csat],
              borderColor: colorSimulacion,
              backgroundColor: colorSimulacion,
              borderWidth: 3.5,
              pointRadius: [6, 6, 6, 6, 6, 9],
              pointBackgroundColor: ['#10B981', '#F43F5E', '#10B981', '#10B981', '#F59E0B', colorSimulacion],
              order: -5,
              yAxisID: 'y1'
            },
            // Barras de volumen con order: 2 (se dibujan POR DEBAJO)
            {
              type: 'bar',
              label: 'Volumen de Encuestas (n)',
              data: [...datosReales.encuestas, 160],
              backgroundColor: [barHistoricoColor, barHistoricoColor, barHistoricoColor, barHistoricoColor, barHistoricoColor, colorSimulacionTrans],
              borderColor: [barHistoricoColor, barHistoricoColor, barHistoricoColor, barHistoricoColor, barHistoricoColor, colorSimulacion],
              borderWidth: 1.5,
              borderRadius: 4,
              order: 2,
              yAxisID: 'y'
            }
          ]
        },
        plugins: [thresholdPlugin],
        options: {
          ...commonOptions,
          scales: {
            y: { position: 'left', min: 0, max: 200, ticks: { color: textColor }, grid: { color: gridColor } },
            y1: { position: 'right', min: 0, max: 10.5, ticks: { color: colorSimulacion }, grid: { drawOnChartArea: false } }
          }
        }
      });
      break;

    // 3. Ecuación Retención (>100%) CON PARIDAD BASE 100%
    case 3:
      chartInstance = new Chart(ctx, {
        type: 'bar',
        data: {
          labels: [...datosReales.meses, 'Simulación'],
          datasets: [
            { label: 'Clientes Inicio (Base Flota)', data: [...datosReales.clientes_ini, 1700], backgroundColor: barHistoricoColor, borderRadius: 4, order: 2 },
            { label: 'Clientes Fin Retenidos', data: [...datosReales.clientes_fin, 1700 + Math.round(simState.clientes * 0.9)], backgroundColor: [lineHistoricoColor, lineHistoricoColor, lineHistoricoColor, lineHistoricoColor, lineHistoricoColor, colorSimulacion], borderRadius: 4, order: 2 }
          ]
        },
        plugins: [thresholdPlugin],
        options: commonOptions
      });
      break;

    // 4. Rendimientos Decrecientes CON UMBRALES DE SATURACIÓN Y CPA
    case 4:
      chartInstance = new Chart(ctx, {
        type: 'line',
        data: {
          labels: [...datosReales.meses, 'Simulación'],
          datasets: [
            { label: 'Gasto Marketing ($ USD)', data: [...datosReales.pauta, simState.gasto], borderColor: lineHistoricoColor, borderWidth: 2, pointRadius: [4,4,4,4,4,8], pointBackgroundColor: lineHistoricoColor, yAxisID: 'y', order: 0 },
            { label: 'CPA Resultante ($ USD)', data: [...datosReales.cpa, simState.cpa], borderColor: colorSimulacion, borderWidth: 2.5, borderDash: [4, 4], pointRadius: [4,4,4,4,4,9], pointBackgroundColor: colorSimulacion, yAxisID: 'y1', order: -5 }
          ]
        },
        plugins: [thresholdPlugin],
        options: {
          ...commonOptions,
          scales: {
            y: { position: 'left', ticks: { color: lineHistoricoColor, callback: v => '$' + v }, grid: { color: gridColor } },
            y1: { position: 'right', min: 30, max: 48, ticks: { color: colorSimulacion, callback: v => '$' + v }, grid: { drawOnChartArea: false } }
          }
        }
      });
      break;

    // 5. Embudo Visitas vs Conversión (CON UMBRALES HISTÓRICOS Y METAS CR)
    case 5:
      chartInstance = new Chart(ctx, {
        type: 'bar',
        data: {
          labels: [...datosReales.meses, 'Simulación'],
          datasets: [
            // Línea con order: -5 (se dibuja POR ENCIMA)
            {
              type: 'line',
              label: 'Tasa Conversión (CR %)',
              data: [...datosReales.cr, simState.tasaConv],
              borderColor: colorSimulacion,
              borderWidth: 3.5,
              pointRadius: [5, 5, 5, 5, 5, 9],
              pointBackgroundColor: colorSimulacion,
              order: -5,
              yAxisID: 'y1'
            },
            // Barras con order: 2 (se dibujan POR DEBAJO)
            {
              type: 'bar',
              label: 'Visitas Web (Tráfico)',
              data: [...datosReales.visitas, simState.visitas],
              backgroundColor: [barHistoricoColor, barHistoricoColor, barHistoricoColor, barHistoricoColor, barHistoricoColor, colorSimulacionTrans],
              borderColor: [barHistoricoColor, barHistoricoColor, barHistoricoColor, barHistoricoColor, barHistoricoColor, colorSimulacion],
              borderWidth: 1.5,
              borderRadius: 4,
              order: 2,
              yAxisID: 'y'
            }
          ]
        },
        plugins: [thresholdPlugin],
        options: {
          ...commonOptions,
          scales: {
            y: { position: 'left', min: 0, max: 2600, ticks: { color: textColor }, grid: { color: gridColor } },
            y1: { position: 'right', min: 3, max: 7, ticks: { color: colorSimulacion, callback: v => v + '%' }, grid: { drawOnChartArea: false } }
          }
        }
      });
      break;

    // 6. Margen Limpio por Rover (CON LÍNEA DE UMBRAL MÍNIMO DE VIABILIDAD $60 USD)
    case 6:
      chartInstance = new Chart(ctx, {
        type: 'bar',
        data: {
          labels: ['Precio Rover ($ USD)', 'CPA (Costo Pauta)', 'Margen Limpio a la Empresa'],
          datasets: [{
            label: 'Dólares ($ USD)',
            data: [101.50, simState.cpa, simState.margen],
            backgroundColor: [isMarte ? '#991B1B' : '#4B5563', '#F43F5E', colorSimulacion],
            borderColor: [isMarte ? '#EF4444' : '#6B7280', '#FB7185', colorSimulacion],
            borderWidth: 1.5,
            borderRadius: 6,
            order: 2
          }]
        },
        plugins: [thresholdPlugin],
        options: {
          ...commonOptions,
          indexAxis: 'y',
          scales: {
            x: { min: 0, max: 115, ticks: { color: textColor, callback: v => '$' + v }, grid: { color: gridColor } }
          }
        }
      });
      break;

    // 7. Ratio Maestro CSAT/CPA (CON UMBRALES DE EXCELENCIA Y ALERTA)
    case 7:
      chartInstance = new Chart(ctx, {
        type: 'bar',
        data: {
          labels: [...datosReales.meses, 'Simulación'],
          datasets: [
            {
              label: 'Puntos de Satisfacción por $1 USD',
              data: [...datosReales.ratio, parseFloat(simState.ratio)],
              backgroundColor: [barHistoricoColor, '#F43F5E', barHistoricoColor, '#10B981', barHistoricoColor, colorSimulacion],
              borderColor: [barHistoricoColor, '#FB7185', barHistoricoColor, '#34D399', barHistoricoColor, colorSimulacion],
              borderWidth: 1.5,
              borderRadius: 4,
              order: 2
            }
          ]
        },
        plugins: [thresholdPlugin],
        options: {
          ...commonOptions,
          scales: { y: { min: 0, max: 0.35, ticks: { color: textColor }, grid: { color: gridColor } } }
        }
      });
      break;

    // 8. ROAS 2.56x (CON LÍNEA ROAS Y UMBRAL BREAK-EVEN 2.50x)
    case 8:
      chartInstance = new Chart(ctx, {
        type: 'bar',
        data: {
          labels: [...datosReales.meses, 'Simulación'],
          datasets: [
            {
              label: 'Ventas Totales ($ USD)',
              data: [...datosReales.ventas, simState.ventas],
              backgroundColor: [barHistoricoColor, barHistoricoColor, barHistoricoColor, barHistoricoColor, barHistoricoColor, colorSimulacion],
              borderRadius: 4,
              order: 2,
              yAxisID: 'y'
            },
            {
              label: 'Gasto Marketing ($ USD)',
              data: [...datosReales.pauta, simState.gasto],
              backgroundColor: isMarte ? '#3A1418' : '#1F2430',
              borderRadius: 4,
              order: 2,
              yAxisID: 'y'
            },
            {
              type: 'line',
              label: 'ROAS Real vs Simulado (x)',
              data: [...datosReales.roas, parseFloat(simState.roas)],
              borderColor: colorSimulacion,
              borderWidth: 2.5,
              pointRadius: 5,
              pointBackgroundColor: colorSimulacion,
              order: -5,
              yAxisID: 'y1'
            }
          ]
        },
        plugins: [thresholdPlugin],
        options: {
          ...commonOptions,
          scales: {
            y: { position: 'left', ticks: { color: textColor, callback: v => '$' + v }, grid: { color: gridColor } },
            y1: { position: 'right', min: 1.5, max: 3.2, ticks: { color: '#F59E0B', callback: v => v + 'x' }, grid: { drawOnChartArea: false } }
          }
        }
      });
      break;

    // 9. Cartera Total (CON TRAYECTORIA BASE +55% EXPANSIÓN)
    case 9:
      const carteraProyectada = 1792 + simState.clientes;
      chartInstance = new Chart(ctx, {
        type: 'line',
        data: {
          labels: [...datosReales.meses, 'Simulación'],
          datasets: [
            {
              label: 'Total Clientes Acumulados',
              data: [...datosReales.total_clientes, carteraProyectada],
              borderColor: colorSimulacion,
              backgroundColor: colorSimulacion,
              borderWidth: 3,
              pointRadius: [4, 4, 4, 4, 4, 9],
              pointBackgroundColor: [lineHistoricoColor, lineHistoricoColor, lineHistoricoColor, lineHistoricoColor, lineHistoricoColor, colorSimulacion],
              order: -5
            },
            {
              label: 'Clientes Retenidos Base',
              data: [...datosReales.clientes_fin, 1700],
              borderColor: isMarte ? '#7C2D12' : '#4B5563',
              borderDash: [4, 4],
              borderWidth: 2,
              pointRadius: 3,
              order: -2
            },
            {
              label: 'Trayectoria Base (+55% Expansión)',
              data: [1155, 1280, 1420, 1590, 1750, 1900],
              borderColor: '#10B981',
              borderDash: [2, 2],
              borderWidth: 1.5,
              pointRadius: 0,
              order: -10
            }
          ]
        },
        plugins: [thresholdPlugin],
        options: commonOptions
      });
      break;

    // 10. Reasignación 15% (CON COMPARACIÓN VISUAL DIRECTA)
    case 10:
      chartInstance = new Chart(ctx, {
        type: 'bar',
        data: {
          labels: ['Estrategia Actual (Gasto Ciego)', 'Estrategia Recomendada SIM (15% CX)'],
          datasets: [
            { label: 'Inversión en Captación (Pauta Neta)', data: [3900, simState.pautaNeta], backgroundColor: isMarte ? '#381216' : '#1E232F', order: 2 },
            { label: 'Inversión en Posventa y CX (Soporte)', data: [0, simState.gastoCX], backgroundColor: colorSimulacion, order: 2 }
          ]
        },
        plugins: [thresholdPlugin],
        options: {
          ...commonOptions,
          scales: {
            x: { stacked: true },
            y: { stacked: true, ticks: { callback: v => '$' + v } }
          }
        }
      });
      break;
  }
}

// ==========================================================================
// CARGA RÁPIDA DE ESCENARIOS (HISTÓRICOS Y DE DECISIÓN GERENCIAL)
// ==========================================================================
function cargarEscenario(tipo) {
  presetOrigen = tipo;
  if (tipo === 'enero') {
    rngGasto.value = 2200; rngSoporte.value = 8; rngVisitas.value = 1100;
  } else if (tipo === 'febrero') {
    rngGasto.value = 3300; rngSoporte.value = 0; rngVisitas.value = 1650;
  } else if (tipo === 'marzo') {
    rngGasto.value = 2700; rngSoporte.value = 6; rngVisitas.value = 1350;
  } else if (tipo === 'abril') {
    rngGasto.value = 3100; rngSoporte.value = 16; rngVisitas.value = 1480;
  } else if (tipo === 'mayo') {
    rngGasto.value = 3900; rngSoporte.value = 8; rngVisitas.value = 1580;
  } else if (tipo === 'recomendado') {
    rngGasto.value = 4000; rngSoporte.value = 15; rngVisitas.value = 1700;
  } else if (tipo === 'agresivo') {
    rngGasto.value = 5200; rngSoporte.value = 2; rngVisitas.value = 2200;
  }
  calcularParametros();
}

// ==========================================================================
// INTEGRACIÓN DE KATEX: RENDERIZADOR MATEMÁTICO REAL
// ==========================================================================
function renderKatexMath(targetElement) {
  const container = targetElement || document.getElementById('modal-calculo') || document.body;
  const config = {
    delimiters: [
      { left: '$$', right: '$$', display: true },
      { left: '\\(', right: '\\)', display: false }
    ],
    throwOnError: false,
    ignoredTags: ['script', 'noscript', 'style', 'textarea', 'pre', 'table'],
    ignoredClasses: ['has-tooltip', 'tooltip-content', 'kpi-tooltip', 'control-tooltip', 'tabla-umbrales', 'financial-breakdown']
  };

  if (typeof renderMathInElement === 'function') {
    renderMathInElement(container, config);
  } else {
    // Si aún no ha terminado de cargar el script defer, reintentar brevemente
    setTimeout(() => {
      if (typeof renderMathInElement === 'function') {
        renderMathInElement(container, config);
      }
    }, 150);
  }
}

function toggleModalCalculo() {
  const modal = document.getElementById('modal-calculo');
  if (modal) {
    modal.classList.toggle('hidden');
    if (!modal.classList.contains('hidden')) {
      renderKatexMath(modal);
    }
  }
}

function toggleModalAyuda() {
  const modal = document.getElementById('modal-ayuda');
  if (modal) modal.classList.toggle('hidden');
}

// ==========================================================================
// EVENT LISTENERS Y ARRANQUE CONTROLADO
// ==========================================================================
function onSliderInput() {
  presetOrigen = null; // Cambio manual desvincula preset fijo
  calcularParametros();
}

rngGasto.addEventListener('input', onSliderInput);
rngSoporte.addEventListener('input', onSliderInput);
rngVisitas.addEventListener('input', onSliderInput);

let dashboardIniciado = false;
function inicializarDashboard() {
  if (dashboardIniciado) return;
  dashboardIniciado = true;

  const temaGuardado = localStorage.getItem('sim_theme') || 'dark';
  aplicarTema(temaGuardado);
  calcularParametros();
  cambiarTab(1);
  inicializarConsolaDilemas();
  renderKatexMath();

  // El tour SIEMPRE se inicia de primeras automáticamente al cargar el dashboard
  localStorage.removeItem('sim_tour_completed');
  setTimeout(iniciarTour, 250);
}

// Arranque dual infalible: si el DOM ya estaba listo, arranca de inmediato; si no, espera DOMContentLoaded
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', inicializarDashboard);
} else {
  inicializarDashboard();
}

window.addEventListener('load', () => {
  inicializarDashboard();
  renderKatexMath();
});


// ==========================================================================
// GUÍA DE USO DE INICIO E INDUCCIÓN GERENCIAL (TOUR GUIADO INTERACTIVO - 7 PASOS)
// ==========================================================================
function seleccionarModoDesdeTour(tema) {
  aplicarTema(tema);
  actualizarCardsTourTheme();
}

function actualizarCardsTourTheme() {
  const optDark = document.getElementById('tour-opt-dark');
  const optLight = document.getElementById('tour-opt-light');
  const badgeDark = document.getElementById('tour-badge-dark');
  const badgeLight = document.getElementById('tour-badge-light');
  
  const isLight = (currentTheme === 'light');
  
  if (optDark && optLight && badgeDark && badgeLight) {
    if (isLight) {
      optLight.className = "tour-theme-opt p-3 rounded-xl border-2 transition-all flex flex-col items-center text-center gap-1 cursor-pointer bg-orange-50 border-orange-600 ring-2 ring-orange-400 shadow-md";
      badgeLight.className = "mt-1 text-[10px] uppercase font-black px-2 py-0.5 rounded-full bg-orange-600 text-white block";
      badgeLight.textContent = "Activo ✓";
      
      optDark.className = "tour-theme-opt p-3 rounded-xl border-2 transition-all flex flex-col items-center text-center gap-1 cursor-pointer bg-slate-800 border-slate-700 text-slate-300 hover:border-slate-500 opacity-60";
      badgeDark.className = "mt-1 text-[10px] uppercase font-black px-2 py-0.5 rounded-full hidden bg-slate-700 text-slate-400";
      badgeDark.textContent = "Elegir";
    } else {
      optDark.className = "tour-theme-opt p-3 rounded-xl border-2 transition-all flex flex-col items-center text-center gap-1 cursor-pointer bg-[#2A0E13] border-orange-500 ring-2 ring-orange-500/50 shadow-md shadow-orange-500/30";
      badgeDark.className = "mt-1 text-[10px] uppercase font-black px-2 py-0.5 rounded-full bg-orange-500/30 text-orange-300 border border-orange-500/50 block";
      badgeDark.textContent = "Activo ✓";
      
      optLight.className = "tour-theme-opt p-3 rounded-xl border-2 transition-all flex flex-col items-center text-center gap-1 cursor-pointer bg-slate-800 border-slate-700 text-slate-300 opacity-60 hover:opacity-90";
      badgeLight.className = "mt-1 text-[10px] uppercase font-black px-2 py-0.5 rounded-full hidden bg-slate-800 text-white";
      badgeLight.textContent = "Elegir";
    }
  }
}

const tourPasos = [
  {
    titulo: "1. Experiencia Visual: Seleccione su Modo de Trabajo",
    targetId: null,
    contenido: `
      <p class="font-bold text-orange-400 text-xs">Personalice su entorno de comando directivo:</p>
      <p class="text-xs">Para comenzar la simulación de <strong>Ares Rover Dynamics</strong>, elija la paleta visual de su preferencia. El simulador adaptará todos los contrastes, textos y gráficas en tiempo real:</p>
      
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-2.5 my-2">
        <!-- Opción Modo Oscuro -->
        <div onclick="seleccionarModoDesdeTour('dark')" id="tour-opt-dark" class="tour-theme-opt p-3 rounded-xl border-2 transition-all flex flex-col items-center text-center gap-1 cursor-pointer bg-[#2A0E13] border-orange-500 ring-2 ring-orange-500/50 shadow-md shadow-orange-500/30">
          <span class="text-2xl">🌙</span>
          <span class="font-extrabold text-xs text-orange-200">Modo Oscuro (Marte)</span>
          <span class="text-[11px] text-slate-300 leading-tight">Entorno inmersivo espacial de baja fatiga visual. Recomendado para trabajo extendido.</span>
          <span id="tour-badge-dark" class="mt-1 text-[10px] uppercase font-black px-2 py-0.5 rounded-full bg-orange-500/30 text-orange-300 border border-orange-500/50">Activo ✓</span>
        </div>

        <!-- Opción Modo Claro -->
        <div onclick="seleccionarModoDesdeTour('light')" id="tour-opt-light" class="tour-theme-opt p-3 rounded-xl border-2 transition-all flex flex-col items-center text-center gap-1 cursor-pointer bg-slate-800 border-slate-700 text-slate-300 opacity-60 hover:opacity-90">
          <span class="text-2xl">☀️</span>
          <span class="font-extrabold text-xs text-slate-100">Modo Claro (Corporativo)</span>
          <span class="text-[11px] text-slate-300 leading-tight">Fondo blanco pulcro y alto contraste ejecutivo para juntas directivas e informes.</span>
          <span id="tour-badge-light" class="mt-1 text-[10px] uppercase font-black px-2 py-0.5 rounded-full hidden bg-slate-800 text-white">Elegir</span>
        </div>
      </div>

      <p class="text-[11px] text-slate-400 italic">💡 Podrá alternar este modo en cualquier momento con el botón «☀️/🌙 Modo» en la barra superior.</p>
    `
  },
  {
    titulo: "2. Misión Ejecutiva: Flota Corporativa en Marte",
    targetId: null,
    contenido: `
      <p class="font-bold text-orange-400 text-xs">Bienvenido al Simulador de Información de Marketing (SIM), Señor Gerente General.</p>
      <p class="text-xs">Usted lidera la dirección de <strong>Ares Rover Dynamics</strong>. A mayo de 2026, la empresa cuenta con una <strong>base acumulada de 1.792 contratos corporativos de rovers</strong> operando en Marte (1.700 contratos vigentes de meses anteriores + 92 nuevos clientes adquiridos).</p>
      <p class="text-xs">El desafío directivo no es captar rovers a ciegas, sino <strong>equilibrar la pauta publicitaria con la capacidad operativa de los talleres mecánicos posventa</strong> para evitar cancelaciones masivas y maximizar el margen neto.</p>
    `
  },
  {
    titulo: "3. Palancas Estratégicas de Decisión (Controles)",
    targetId: "tour-palancas",
    contenido: `
      <p class="text-xs">En este cuadrante usted comanda las <strong>3 variables maestras</strong> de la estrategia empresarial:</p>
      <ul class="list-disc list-inside space-y-1 text-slate-300 text-xs">
        <li><strong>Presupuesto de Marketing ($ USD):</strong> Inversión total mensual asignada.</li>
        <li><strong>Soporte Posventa / CX (%):</strong> Porcentaje del presupuesto reservado para ingenieros y repuestos en talleres marcianos.</li>
        <li><strong>Visitas Estimadas:</strong> Volumen de tráfico proyectado en el portal corporativo.</li>
      </ul>
      <p class="text-orange-300 text-xs mt-1">💡 Al mover cualquier control, el modelo paramétrico recalcula en tiempo real todas las ecuaciones de conversión, costos y rentabilidad.</p>
    `
  },
  {
    titulo: "4. Laboratorio de Escenarios Históricos",
    targetId: "tour-escenarios-panel",
    contenido: `
      <p class="text-xs">Evalúe su propuesta frente a los hitos reales auditados durante el primer semestre de 2026:</p>
      <div class="grid grid-cols-2 gap-2 text-xs my-2">
        <div class="p-2 rounded bg-slate-800/80 border border-slate-700">
          <span class="text-rose-400 font-bold">⚠️ Febrero 2026:</span>
          <p class="text-[11px] text-slate-300">Cero soporte posventa. Captación récord pero satisfacción destruida (CSAT 4.2) por talleres colapsados.</p>
        </div>
        <div class="p-2 rounded bg-slate-800/80 border border-slate-700">
          <span class="text-emerald-400 font-bold">⭐ Abril 2026:</span>
          <p class="text-[11px] text-slate-300">16% a soporte. Récord histórico de satisfacción (CSAT 9.4) con CPA eficiente de $39.74 USD.</p>
        </div>
      </div>
      <p class="text-xs">Haga clic en cualquiera de los 4 botones para cargar instantáneamente esos parámetros.</p>
    `
  },
  {
    titulo: "5. Tablero de Control Directivo (KPIs)",
    targetId: "tour-kpis",
    contenido: `
      <p class="text-xs">Monitoreo continuo de los 6 indicadores vitales para la Junta Directiva:</p>
      <ul class="list-disc list-inside space-y-1 text-slate-300 text-xs">
        <li><strong>Ventas Totales & ROAS:</strong> Facturación estimada y retorno bruto de inversión.</li>
        <li><strong>Nuevos Clientes & Tasa CR:</strong> Eficiencia de transformación en embudo.</li>
        <li><strong>CPA (Costo por Adquisición):</strong> Semáforo de eficiencia en captación.</li>
        <li><strong>CSAT (Satisfacción del Cliente):</strong> Alerta temprana para salvaguardar la retención de la flota corporativa.</li>
      </ul>
    `
  },
  {
    titulo: "6. Analítica Visual de 10 Gráficas con Umbrales",
    targetId: "tour-graficas",
    contenido: `
      <p class="text-xs">Navegue a través de las <strong>10 perspectivas analíticas</strong> del SIM para fundamentar sus decisiones.</p>
      <p class="text-xs"><strong>Novedad Interactiva:</strong> Cada gráfica incorpora líneas de umbral gerencial (Meta CSAT, Alerta Crítica, Break-Even, etc.).</p>
      <p class="text-emerald-400 font-bold text-xs mt-1">👉 Pase el cursor sobre cualquiera de las pastillas de umbral para abrir la justificación estratégica detallada.</p>
    `
  },
  {
    titulo: "7. Auditoría de Fórmulas y Cierre",
    targetId: "btn-theme-toggle",
    contenido: `
      <p class="text-xs">El botón <strong>«Fórmulas Matemáticas»</strong> le despliega la memoria de cálculo completa auditada en LaTeX con sus 5 fuentes bibliográficas del ACA.</p>
      <p class="text-xs">Además, recuerde que puede alternar en cualquier momento entre el <strong>Modo Oscuro</strong> y el <strong>Modo Claro</strong> con el botón superior.</p>
      <p class="text-orange-400 font-bold text-xs mt-2">¡Listo para comenzar! Explore el simulador y tome el control de Ares Rover Dynamics.</p>
    `
  }
];

let tourPasoActual = 0;

function iniciarTour() {
  tourPasoActual = 0;
  const overlay = document.getElementById('tour-overlay');
  if (overlay) {
    overlay.classList.remove('hidden');
    mostrarPasoTour(0);
  }
}

function mostrarPasoTour(index) {
  if (index < 0 || index >= tourPasos.length) return;
  tourPasoActual = index;
  const paso = tourPasos[index];

  const titleEl = document.getElementById('tour-step-title');
  const indEl = document.getElementById('tour-step-indicator');
  const contentEl = document.getElementById('tour-step-content');
  const barEl = document.getElementById('tour-progress-bar');

  if (titleEl) titleEl.textContent = paso.titulo;
  if (indEl) indEl.textContent = `Paso ${index + 1} de ${tourPasos.length}`;
  if (contentEl) contentEl.innerHTML = paso.contenido;
  
  const pct = ((index + 1) / tourPasos.length) * 100;
  if (barEl) barEl.style.width = `${pct}%`;

  const btnPrev = document.getElementById('btn-tour-prev');
  if (btnPrev) btnPrev.disabled = (index === 0);

  const btnNextText = document.getElementById('btn-tour-next-text');
  if (btnNextText) {
    btnNextText.textContent = (index === tourPasos.length - 1) ? 'Finalizar Guía' : 'Siguiente';
  }

  if (index === 0) {
    setTimeout(actualizarCardsTourTheme, 20);
  }

  // Limpiar spotlights previos
  document.querySelectorAll('.tour-spotlight').forEach(el => el.classList.remove('tour-spotlight'));

  // Aplicar spotlight al elemento objetivo si existe
  if (paso.targetId) {
    const targetEl = document.getElementById(paso.targetId);
    if (targetEl) {
      targetEl.classList.add('tour-spotlight');
      targetEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }
}

function siguientePasoTour() {
  if (tourPasoActual < tourPasos.length - 1) {
    mostrarPasoTour(tourPasoActual + 1);
  } else {
    finalizarTour();
  }
}

function anteriorPasoTour() {
  if (tourPasoActual > 0) {
    mostrarPasoTour(tourPasoActual - 1);
  }
}

function finalizarTour() {
  const overlay = document.getElementById('tour-overlay');
  if (overlay) overlay.classList.add('hidden');
  document.querySelectorAll('.tour-spotlight').forEach(el => el.classList.remove('tour-spotlight'));
}
