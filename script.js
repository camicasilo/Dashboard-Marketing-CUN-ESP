// ==========================================================================
// ROVER'S - MISIÓN A MARTE: SISTEMAS DE INFORMACIÓN EN MARKETING (SIM v3.0)
// TABLERO DE TELEMETRÍA Y SIMULADOR ESTRATÉGICO DIRECTIVO
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
let currentTheme = 'marte';
let chartInstance = null;

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
const boxInterpretacion = document.getElementById('box-interpretacion-grafica');
const tabDescripcion = document.getElementById('tab-descripcion');
const txtExplicacionCorta = document.getElementById('txt-explicacion-corta');

const btnThemeToggle = document.getElementById('btn-theme-toggle');
const themeIcon = document.getElementById('theme-icon');
const themeLabel = document.getElementById('theme-label');

function toggleTheme() {
  if (currentTheme === 'marte') {
    currentTheme = 'gerencial';
    appBody.classList.remove('theme-marte');
    appBody.classList.add('theme-gerencial');
    themeIcon.textContent = '🪐';
    themeLabel.textContent = 'Modo Marte';
    btnThemeToggle.className = 'text-[11px] px-2.5 py-1 rounded font-bold transition flex items-center gap-1.5 border border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-200';
  } else {
    currentTheme = 'marte';
    appBody.classList.remove('theme-gerencial');
    appBody.classList.add('theme-marte');
    themeIcon.textContent = '👔';
    themeLabel.textContent = 'Modo Gerencial';
    btnThemeToggle.className = 'text-[11px] px-2.5 py-1 rounded font-bold transition flex items-center gap-1.5 border border-[#571C1D] bg-[#2A0E13] hover:bg-[#3D141B] text-[#FFD8B0]';
  }
  actualizarUI();
}

function calcularParametros() {
  const gasto = parseFloat(rngGasto.value);
  const soporte = parseFloat(rngSoporte.value);
  const visitas = parseFloat(rngVisitas.value);

  const factorSaturacion = Math.max(0.85, 1 - (visitas - 1100) * 0.0001);
  const tasaConv = Math.min(6.2, Math.max(4.5, (5.2 * factorSaturacion)));
  const clientes = Math.round(visitas * (tasaConv / 100));

  const gastoCX = Math.round(gasto * (soporte / 100));
  const pautaNeta = gasto - gastoCX;
  const cpa = clientes > 0 ? (pautaNeta / clientes) : 0;
  const precioUnitario = 101.5;
  const ventas = Math.round(clientes * precioUnitario);
  const margen = precioUnitario - cpa;
  const roas = gasto > 0 ? (ventas / gasto).toFixed(2) : 0;

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
  txtGasto.textContent = `$${simState.gasto.toLocaleString('es-CO')}`;
  txtSoporte.textContent = `${simState.soporte} %`;
  txtVisitas.textContent = simState.visitas.toLocaleString('es-CO');

  kpiVentas.textContent = `$${simState.ventas.toLocaleString('es-CO')}`;
  kpiRoas.textContent = `ROAS: ${simState.roas}x`;
  kpiClientes.textContent = simState.clientes;
  kpiTasaConv.textContent = `CR: ${simState.tasaConv.toFixed(2)}%`;
  kpiCpa.textContent = `$${simState.cpa.toFixed(2)}`;
  kpiCsat.textContent = `${simState.csat.toFixed(1)} / 10`;
  kpiMargen.textContent = `$${simState.margen.toFixed(2)}`;
  kpiRatio.textContent = simState.ratio;

  lblMiniMargen.textContent = `$${simState.margen.toFixed(2)} USD`;
  lblMiniCX.textContent = `$${simState.gastoCX} USD`;
  lblMiniPauta.textContent = `$${simState.pautaNeta} USD`;

  if (simState.csat >= 8.5) {
    kpiCsatStatus.textContent = '🟢 Excelente (Óptimo ≥ 8.5)';
    kpiCsatStatus.className = 'text-[9px] text-emerald-400 font-semibold';
    kpiCsat.className = 'text-base font-black text-emerald-400 mt-0.5';
  } else if (simState.csat >= 7.0) {
    kpiCsatStatus.textContent = '🟡 Aceptable (7.0 - 8.4)';
    kpiCsatStatus.className = 'text-[9px] text-amber-400 font-semibold';
    kpiCsat.className = 'text-base font-black text-amber-400 mt-0.5';
  } else {
    kpiCsatStatus.textContent = '🔴 ¡Crisis Operativa (< 7.0)!';
    kpiCsatStatus.className = 'text-[9px] text-rose-400 font-semibold animate-pulse';
    kpiCsat.className = 'text-base font-black text-rose-400 mt-0.5';
  }

  actualizarDiagnostico();
  actualizarInterpretacionGrafica();
  renderizarGraficaActiva();
}

function actualizarDiagnostico() {
  let badge = 'EQUILIBRIO SALUDABLE';
  let badgeClase = 'badge-exito';
  let html = '';

  if (simState.csat < 6.5) {
    badge = '🔴 CRISIS TIPO FEBRERO (DESPLOME CSAT)';
    badgeClase = 'badge-alerta';
    html = `
      <div class="space-y-1 text-slate-300">
        <p class="text-rose-400 font-bold">⚠️ ALERTA DE COLAPSO: Violación del Umbral Mínimo de Calidad</p>
        <p>Captaste <strong>${simState.clientes} clientes</strong> pero con solo <strong>${simState.soporte}% en soporte</strong>, la satisfacción cayó a <strong>${simState.csat.toFixed(1)}/10</strong> (umbral crítico < 7.0). El CPA parece bajo ($${simState.cpa.toFixed(2)}), pero estás destruyendo el valor de vida del cliente (LTV).</p>
        <div class="p-1.5 rounded bg-rose-950/50 border border-rose-800 text-rose-200 text-[10px]">
          <strong>⚖️ Dictamen Directivo:</strong> Ordenar de inmediato la reasignación de mínimo 12-15% del presupuesto a soporte técnico y posventa. Detener incrementos de pauta ciega.
        </div>
      </div>
    `;
  } else if (simState.cpa > 42.0) {
    badge = '🟡 ALERTA: SATURACIÓN PUBLICITARIA (EFECTO MAYO)';
    badgeClase = 'badge-advertencia';
    html = `
      <div class="space-y-1 text-slate-300">
        <p class="text-amber-400 font-bold">⚠️ PRECAUCIÓN: Rendimientos Marginales Decrecientes</p>
        <p>El CPA se elevó a <strong>$${simState.cpa.toFixed(2)} USD</strong> (sobrepasa el umbral óptimo de $40.00). La pauta agresiva atrae tráfico frío que encarece la adquisición marginal.</p>
        <div class="p-1.5 rounded bg-amber-950/50 border border-amber-800 text-amber-200 text-[10px]">
          <strong>⚖️ Dictamen Directivo:</strong> Calificar audiencias previas y optimizar la tasa de conversión en la landing page antes de subir presupuesto.
        </div>
      </div>
    `;
  } else if (simState.csat >= 8.5 && simState.cpa <= 40.5) {
    badge = '🟢 EXCELENCIA DIRECTIVA (ZONA ÓPTIMA TIPO ABRIL)';
    badgeClase = 'badge-exito';
    html = `
      <div class="space-y-1 text-slate-300">
        <p class="text-emerald-400 font-bold">⭐ OPERACIÓN EN PUNTO ÓPTIMO DE EQUILIBRIO</p>
        <p>Con <strong>${simState.soporte}% asignado a CX</strong> mantienes la satisfacción en <strong>${simState.csat.toFixed(1)}/10</strong> (Zona Verde), CPA eficiente de <strong>$${simState.cpa.toFixed(2)} USD</strong> y margen neto de <strong>$${simState.margen.toFixed(2)} USD</strong> por unidad.</p>
        <div class="p-1.5 rounded bg-emerald-950/50 border border-emerald-800 text-emerald-200 text-[10px]">
          <strong>⚖️ Dictamen Directivo:</strong> Aprobar y defender este escenario como la recomendación oficial del plan gerencial de junio ($4.000 USD de inversión con $600 USD para soporte).
        </div>
      </div>
    `;
  } else {
    badge = '🟡 ZONA DE CONTROL MODERADO';
    badgeClase = 'badge-advertencia';
    html = `
      <div class="space-y-1 text-slate-300">
        <p class="text-slate-200 font-bold">ℹ️ Operación en rango aceptable con margen de mejora.</p>
        <p>Margen unitario en <strong>$${simState.margen.toFixed(2)} USD</strong> y satisfacción en <strong>${simState.csat.toFixed(1)}/10</strong>. ROAS de <strong>${simState.roas}x</strong> por encima del umbral de equilibrio (2.50x).</p>
      </div>
    `;
  }

  badgeEstado.textContent = badge;
  badgeEstado.className = `text-[9px] px-2 py-0.5 rounded font-bold border ${badgeClase}`;
  boxDiagnostico.innerHTML = html;
}

function cambiarTab(num) {
  tabActiva = num;
  for (let i = 1; i <= 10; i++) {
    const btn = document.getElementById(`tab-btn-${i}`);
    if (btn) {
      if (i === num) {
        btn.className = 'tab-btn active px-2 py-1 text-[11px] font-bold rounded transition border border-orange-500 bg-orange-600/30 text-orange-200';
      } else {
        btn.className = 'tab-btn px-2 py-1 text-[11px] font-medium rounded transition border border-slate-700/60 bg-slate-800/40 hover:bg-slate-700/60 text-slate-300';
      }
    }
  }

  const descripciones = {
    1: 'El Dilema Central: Mapa de dispersión entre CPA y CSAT con zonas de semáforo de telemetría.',
    2: 'La Ecuación CSAT: Por qué el promedio ya estaba resuelto y la alerta del volumen de quejas.',
    3: 'La Ecuación de Retención: Modelo de Expansión Neta (> 100%) vs Churn de manual.',
    4: 'Rendimientos Decrecientes: Umbrales de saturación publicitaria e impacto en el CPA.',
    5: 'Embudo de Conversión: Relación entre tráfico web y tasa de conversión efectiva (CR).',
    6: 'Economía Unitaria: Margen de contribución limpio ($60-$68 USD) por Rover contratado.',
    7: 'El Ratio Maestro: Puntos de satisfacción generados por cada $1 USD de adquisición.',
    8: 'Correlación Causal: Facturación vs Inversión y multiplicador ROAS (Break-even 2.50x).',
    9: 'Evolución de Cartera: Acumulación de contratos activos (+55% expansión en Marte).',
    10: 'Dictamen Directivo: Reasignación estratégica del 15% del presupuesto a soporte técnico/CX.'
  };

  if (tabDescripcion) tabDescripcion.textContent = descripciones[num] || '';
  actualizarInterpretacionGrafica();
  renderizarGraficaActiva();
}

function actualizarInterpretacionGrafica() {
  const isMarte = (currentTheme === 'marte');
  const tagColor = isMarte ? 'text-[#FF9E4A]' : 'text-[#00F0FF]';
  const colorNeonNombre = isMarte ? 'Naranja Marciano' : 'Cyan Neón';
  let html = '';

  switch (tabActiva) {
    case 1:
      html = `
        <div class="space-y-1.5 text-[10px] text-slate-300">
          <div class="border-b border-slate-700/60 pb-1">
            <strong class="${tagColor} text-xs uppercase font-extrabold">Gráfica 1: El Dilema Central (CPA vs CSAT)</strong>
          </div>
          <p><strong>📐 ¿Cómo leer los ejes?</strong></p>
          <ul class="list-disc pl-3.5 space-y-0.5">
            <li><strong>Eje X (Horizontal):</strong> Costo de Adquisición (CPA en USD). <em>Izquierda es más económico, derecha más costoso.</em></li>
            <li><strong>Eje Y (Vertical):</strong> Satisfacción CSAT (0 a 10). <em>Arriba es máxima calidad y fidelidad.</em></li>
            <li><strong>Tu Posición:</strong> El <span class="${tagColor} font-bold">Triángulo ${colorNeonNombre}</span> marca tu simulación actual.</li>
          </ul>
          <div class="p-1.5 rounded bg-slate-900/90 border border-amber-500/30 space-y-0.5">
            <p class="font-bold text-amber-300">🎯 Umbrales de Control & Semáforo:</p>
            <p>🟢 <strong>Zona Verde (Óptimo):</strong> CSAT ≥ 8.5 y CPA ≤ $40.00 USD (Punto de Oro, tipo Abril).</p>
            <p>🟡 <strong>Zona Amarilla (Precaución):</strong> CSAT entre 7.0 y 8.4; CPA entre $40.00 y $42.00 USD.</p>
            <p>🔴 <strong>Zona Roja (Crisis Operativa):</strong> CSAT < 7.0 (Colapso de Febrero a 4.2/10).</p>
          </div>
          <div class="p-1.5 rounded bg-emerald-950/40 border border-emerald-800/40 text-emerald-200">
            <strong>⚖️ Dictamen Directivo:</strong> No perseguir un CPA engañosamente barato si destruye la satisfacción. Mantener la operación en la Zona Verde.
          </div>
        </div>
      `;
      break;

    case 2:
      html = `
        <div class="space-y-1.5 text-[10px] text-slate-300">
          <div class="border-b border-slate-700/60 pb-1">
            <strong class="${tagColor} text-xs uppercase font-extrabold">Gráfica 2: La Ecuación CSAT y el Volumen de Encuestas</strong>
          </div>
          <p><strong>📐 ¿Cómo leer los ejes?</strong></p>
          <ul class="list-disc pl-3.5 space-y-0.5">
            <li><strong>Barras (Eje Izq):</strong> Volumen de encuestas recibidas ($n = 110$ a $165$).</li>
            <li><strong>Línea (Eje Der):</strong> Calificación promedio CSAT (0 a 10).</li>
          </ul>
          <div class="p-1.5 rounded bg-slate-900/90 border border-amber-500/30 space-y-0.5">
            <p class="font-bold text-amber-300">🎯 Umbrales de Control & Semáforo:</p>
            <p>🟢 <strong>Línea Verde (Umbral Meta):</strong> CSAT ≥ 8.5 (Estándar de calidad aeroespacial).</p>
            <p>🔴 <strong>Línea Roja (Umbral de Alerta):</strong> CSAT ≤ 6.5 (Riesgo inminente de cancelación de contratos).</p>
          </div>
          <div class="p-1.5 rounded bg-emerald-950/40 border border-emerald-800/40 text-emerald-200">
            <strong>⚖️ Dictamen Directivo:</strong> El dato del docente ya venía calculado. La labor directiva es interpretar que en febrero 145 encuestas reprobaron el servicio por falta de capacidad instalada.
          </div>
        </div>
      `;
      break;

    case 3:
      html = `
        <div class="space-y-1.5 text-[10px] text-slate-300">
          <div class="border-b border-slate-700/60 pb-1">
            <strong class="${tagColor} text-xs uppercase font-extrabold">Gráfica 3: Ecuación de Retención y Expansión de Cartera</strong>
          </div>
          <p><strong>📐 ¿Cómo leer los ejes?</strong></p>
          <ul class="list-disc pl-3.5 space-y-0.5">
            <li><strong>Barras Grises:</strong> Clientes activos al inicio de cada mes.</li>
            <li><strong>Barras Verdes:</strong> Clientes al cierre de mes (con tasa > 100%).</li>
          </ul>
          <div class="p-1.5 rounded bg-slate-900/90 border border-amber-500/30 space-y-0.5">
            <p class="font-bold text-amber-300">🎯 Umbrales de Control & Semáforo:</p>
            <p>🟡 <strong>Línea Amarilla (Umbral Base 100%):</strong> Retención pura con Churn = 0 (1.000 clientes retenidos).</p>
            <p>🟢 <strong>Zona Verde (> 100%):</strong> Expansión neta de cartera corporativa mediante contratos ampliados.</p>
          </div>
          <div class="p-1.5 rounded bg-emerald-950/40 border border-emerald-800/40 text-emerald-200">
            <strong>⚖️ Dictamen Directivo:</strong> Explicar al comité que la tasa > 100% no es un error de cálculo, sino un indicador de expansión de cuentas corporativas sin deserción.
          </div>
        </div>
      `;
      break;

    case 4:
      html = `
        <div class="space-y-1.5 text-[10px] text-slate-300">
          <div class="border-b border-slate-700/60 pb-1">
            <strong class="${tagColor} text-xs uppercase font-extrabold">Gráfica 4: Rendimientos Decrecientes en Pauta Publicitaria</strong>
          </div>
          <p><strong>📐 ¿Cómo leer los ejes?</strong></p>
          <ul class="list-disc pl-3.5 space-y-0.5">
            <li><strong>Línea Azul (Eje Izq):</strong> Inversión en publicidad ($1.500 a $4.500 USD).</li>
            <li><strong>Línea Punteada (Eje Der):</strong> Costo por Adquisición CPA ($35 a $45 USD).</li>
          </ul>
          <div class="p-1.5 rounded bg-slate-900/90 border border-amber-500/30 space-y-0.5">
            <p class="font-bold text-amber-300">🎯 Umbrales de Control & Semáforo:</p>
            <p>🟢 <strong>Línea Verde (Umbral Eficiente):</strong> CPA ≤ $40.00 USD.</p>
            <p>🔴 <strong>Línea Roja (Umbral de Saturación):</strong> CPA ≥ $42.00 USD (ocurrido en mayo con $3.900 USD de gasto).</p>
          </div>
          <div class="p-1.5 rounded bg-emerald-950/40 border border-emerald-800/40 text-emerald-200">
            <strong>⚖️ Dictamen Directivo:</strong> Fijar un techo presupuestal de pauta neta en $3.400 USD. Todo excedente debe ir a CX para no quemar capital.
          </div>
        </div>
      `;
      break;

    case 5:
      html = `
        <div class="space-y-1.5 text-[10px] text-slate-300">
          <div class="border-b border-slate-700/60 pb-1">
            <strong class="${tagColor} text-xs uppercase font-extrabold">Gráfica 5: Embudo de Conversión Web (CR %)</strong>
          </div>
          <p><strong>📐 ¿Cómo leer los ejes?</strong></p>
          <ul class="list-disc pl-3.5 space-y-0.5">
            <li><strong>Barras:</strong> Sesiones web registradas en la plataforma de la misión.</li>
            <li><strong>Línea:</strong> Tasa de conversión efectiva (CR = Adquiridos / Visitas).</li>
          </ul>
          <div class="p-1.5 rounded bg-slate-900/90 border border-amber-500/30 space-y-0.5">
            <p class="font-bold text-amber-300">🎯 Umbrales de Control & Semáforo:</p>
            <p>🔵 <strong>Umbral Base:</strong> CR = 5.00% (eficiencia comercial estándar).</p>
            <p>🟢 <strong>Umbral Meta:</strong> CR ≥ 5.50% (alcanzado con tráfico cualificado).</p>
          </div>
          <div class="p-1.5 rounded bg-emerald-950/40 border border-emerald-800/40 text-emerald-200">
            <strong>⚖️ Dictamen Directivo:</strong> Pearson $r = 0,894$ demuestra que el tráfico web es el impulsor de las compras. La optimización web es prioridad estratégica.
          </div>
        </div>
      `;
      break;

    case 6:
      html = `
        <div class="space-y-1.5 text-[10px] text-slate-300">
          <div class="border-b border-slate-700/60 pb-1">
            <strong class="${tagColor} text-xs uppercase font-extrabold">Gráfica 6: Economía Unitaria y Margen por Rover</strong>
          </div>
          <p><strong>📐 ¿Cómo leer los ejes?</strong></p>
          <ul class="list-disc pl-3.5 space-y-0.5">
            <li><strong>Barras Apiladas:</strong> CPA (rojo) + Margen Limpio (verde) = Precio Facturado ($100-$110 USD).</li>
          </ul>
          <div class="p-1.5 rounded bg-slate-900/90 border border-amber-500/30 space-y-0.5">
            <p class="font-bold text-amber-300">🎯 Umbrales de Control & Semáforo:</p>
            <p>🟢 <strong>Umbral Margen Mínimo:</strong> Margen ≥ $60.00 USD limpios por Rover.</p>
            <p>🔴 <strong>Umbral Crítico:</strong> Margen < $50.00 USD (inviabilidad financiera unitaria).</p>
          </div>
          <div class="p-1.5 rounded bg-emerald-950/40 border border-emerald-800/40 text-emerald-200">
            <strong>⚖️ Dictamen Directivo:</strong> Cada Rover vendido aporta entre $60 y $68 USD de flujo neto a la misión. La adquisición es altamente rentable.
          </div>
        </div>
      `;
      break;

    case 7:
      html = `
        <div class="space-y-1.5 text-[10px] text-slate-300">
          <div class="border-b border-slate-700/60 pb-1">
            <strong class="${tagColor} text-xs uppercase font-extrabold">Gráfica 7: El Ratio Maestro (CSAT / CPA)</strong>
          </div>
          <p><strong>📐 ¿Cómo leer los ejes?</strong></p>
          <ul class="list-disc pl-3.5 space-y-0.5">
            <li><strong>Barras:</strong> Puntos de satisfacción generados por cada $1 USD invertido en adquisición.</li>
          </ul>
          <div class="p-1.5 rounded bg-slate-900/90 border border-amber-500/30 space-y-0.5">
            <p class="font-bold text-amber-300">🎯 Umbrales de Control & Semáforo:</p>
            <p>🟢 <strong>Umbral Meta:</strong> Ratio ≥ 0.2000 pts/USD (Logrado en Abril con 0.2365).</p>
            <p>🔴 <strong>Umbral de Crisis:</strong> Ratio ≤ 0.1500 pts/USD (Desplome de Febrero a 0.1082).</p>
          </div>
          <div class="p-1.5 rounded bg-emerald-950/40 border border-emerald-800/40 text-emerald-200">
            <strong>⚖️ Dictamen Directivo:</strong> Utilizar el Ratio Maestro como KPI insignia de gobernanza de marketing: mide el retorno en satisfacción por dólar erogado.
          </div>
        </div>
      `;
      break;

    case 8:
      html = `
        <div class="space-y-1.5 text-[10px] text-slate-300">
          <div class="border-b border-slate-700/60 pb-1">
            <strong class="${tagColor} text-xs uppercase font-extrabold">Gráfica 8: Correlación Causal de Crecimiento y ROAS</strong>
          </div>
          <p><strong>📐 ¿Cómo leer los ejes?</strong></p>
          <ul class="list-disc pl-3.5 space-y-0.5">
            <li><strong>Barras:</strong> Ventas brutas ($5.500 a $10.200) vs Gasto en pauta ($2.200 a $3.900).</li>
            <li><strong>Línea:</strong> ROAS (Multiplicador de retorno publicitario).</li>
          </ul>
          <div class="p-1.5 rounded bg-slate-900/90 border border-amber-500/30 space-y-0.5">
            <p class="font-bold text-amber-300">🎯 Umbrales de Control & Semáforo:</p>
            <p>🔴 <strong>Línea Roja (Break-Even ROAS):</strong> 2.50x (Margen neto cero; bajo 2.50x se pierde dinero).</p>
            <p>🟢 <strong>Zona Verde (> 2.50x):</strong> Multiplicador rentable. Promedio histórico estable en 2.56x.</p>
          </div>
          <div class="p-1.5 rounded bg-emerald-950/40 border border-emerald-800/40 text-emerald-200">
            <strong>⚖️ Dictamen Directivo:</strong> La pauta tiene tracción probada y se autofinancia. Mantener el ROAS por encima de 2.55x.
          </div>
        </div>
      `;
      break;

    case 9:
      html = `
        <div class="space-y-1.5 text-[10px] text-slate-300">
          <div class="border-b border-slate-700/60 pb-1">
            <strong class="${tagColor} text-xs uppercase font-extrabold">Gráfica 9: Evolución de Cartera Total (+55% Expansión)</strong>
          </div>
          <p><strong>📐 ¿Cómo leer los ejes?</strong></p>
          <ul class="list-disc pl-3.5 space-y-0.5">
            <li><strong>Línea Sólida:</strong> Cartera total acumulada al cierre de cada mes (1.155 a 1.792).</li>
            <li><strong>Línea Punteada:</strong> Clientes retenidos de la base activa.</li>
          </ul>
          <div class="p-1.5 rounded bg-slate-900/90 border border-amber-500/30 space-y-0.5">
            <p class="font-bold text-amber-300">🎯 Umbrales de Control & Semáforo:</p>
            <p>🟡 <strong>Umbral Escala Crítica:</strong> 1.500 contratos activos.</p>
            <p>🟢 <strong>Umbral Meta Cierre Mayo:</strong> 1.700 contratos de teleoperación en Marte.</p>
          </div>
          <div class="p-1.5 rounded bg-emerald-950/40 border border-emerald-800/40 text-emerald-200">
            <strong>⚖️ Dictamen Directivo:</strong> La cartera corporativa es sólida. La retención acumulada protege el flujo de caja recurrente.
          </div>
        </div>
      `;
      break;

    case 10:
      html = `
        <div class="space-y-1.5 text-[10px] text-slate-300">
          <div class="border-b border-slate-700/60 pb-1">
            <strong class="${tagColor} text-xs uppercase font-extrabold">Gráfica 10: Dictamen Directivo - Reasignación del 15%</strong>
          </div>
          <p><strong>📐 ¿Cómo leer los ejes?</strong></p>
          <ul class="list-disc pl-3.5 space-y-0.5">
            <li><strong>Barra Izquierda:</strong> Gasto ciego en pauta ($4.000 USD al 100%). Riesgo de saturación.</li>
            <li><strong>Barra Derecha:</strong> Plan Óptimo SIM: $3.400 en pauta neta + $600 en Soporte/CX (15%).</li>
          </ul>
          <div class="p-1.5 rounded bg-slate-900/90 border border-amber-500/30 space-y-0.5">
            <p class="font-bold text-amber-300">🎯 Umbrales de Control & Semáforo:</p>
            <p>🟢 <strong>Línea Azul (Pauta Neta Óptima):</strong> $3.400 USD (evita rendimientos decrecientes).</p>
            <p>🟢 <strong>Blindaje de Calidad:</strong> CSAT garantizado ≥ 9.0/10 mediante $600 USD de soporte.</p>
          </div>
          <div class="p-1.5 rounded bg-emerald-950/40 border border-emerald-800/40 text-emerald-200">
            <strong>⚖️ Dictamen Directivo:</strong> Ejecutar la reasignación formal del 15% del presupuesto para el mes de junio de 2026.
          </div>
        </div>
      `;
      break;
  }

  boxInterpretacion.innerHTML = html;
}

function renderizarGraficaActiva() {
  const canvas = document.getElementById('chart-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  if (chartInstance) chartInstance.destroy();

  const isMarte = (currentTheme === 'marte');
  const colorSimulacion = isMarte ? '#FF6B00' : '#00F0FF';
  const colorSimulacionTrans = isMarte ? 'rgba(255, 107, 0, 0.25)' : 'rgba(0, 240, 255, 0.25)';
  const barHistoricoColor = isMarte ? '#451D24' : '#333A48';
  const lineHistoricoColor = isMarte ? '#EA580C' : '#94A3B8';
  const gridColor = isMarte ? '#3A1418' : '#1E232F';
  const textColor = isMarte ? '#FDBA74' : '#94A3B8';

  const commonOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { labels: { color: textColor, font: { size: 10 } } }
    },
    scales: {
      x: { ticks: { color: textColor, font: { size: 9 } }, grid: { color: gridColor } },
      y: { ticks: { color: textColor, font: { size: 9 } }, grid: { color: gridColor } }
    }
  };

  switch (tabActiva) {
    // 1. Dilema Central: CPA vs CSAT con líneas de umbral en scatter
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
              pointRadius: 8
            },
            {
              label: 'Tu Simulación (Resaltado)',
              data: [{ x: simState.cpa, y: simState.csat, label: 'Tu Simulación' }],
              backgroundColor: colorSimulacion,
              borderColor: '#FFFFFF',
              borderWidth: 2.5,
              pointRadius: 14,
              pointStyle: 'triangle'
            },
            // Línea de Umbral Verde: CSAT 8.5
            {
              type: 'line',
              label: 'Umbral Verde: CSAT ≥ 8.5',
              data: [{ x: 30, y: 8.5 }, { x: 48, y: 8.5 }],
              borderColor: '#10B981',
              borderWidth: 2,
              borderDash: [6, 4],
              pointRadius: 0,
              fill: false
            },
            // Línea de Umbral Rojo: CSAT 7.0
            {
              type: 'line',
              label: 'Umbral Rojo: CSAT < 7.0',
              data: [{ x: 30, y: 7.0 }, { x: 48, y: 7.0 }],
              borderColor: '#F43F5E',
              borderWidth: 2,
              borderDash: [6, 4],
              pointRadius: 0,
              fill: false
            },
            // Línea de Umbral CPA $40 USD
            {
              type: 'line',
              label: 'Umbral CPA: $40.00 USD',
              data: [{ x: 40.0, y: 2 }, { x: 40.0, y: 10.5 }],
              borderColor: '#3B82F6',
              borderWidth: 1.5,
              borderDash: [4, 4],
              pointRadius: 0,
              fill: false
            }
          ]
        },
        options: {
          ...commonOptions,
          scales: {
            x: { title: { display: true, text: 'CPA ($ USD)', color: textColor }, min: 30, max: 48, ticks: { color: textColor }, grid: { color: gridColor } },
            y: { title: { display: true, text: 'CSAT (0-10)', color: textColor }, min: 2, max: 10.5, ticks: { color: textColor }, grid: { color: gridColor } }
          }
        }
      });
      break;

    // 2. Ecuación CSAT con líneas de umbral
    case 2:
      chartInstance = new Chart(ctx, {
        type: 'bar',
        data: {
          labels: [...datosReales.meses, 'Simulación'],
          datasets: [
            {
              type: 'line',
              label: 'CSAT Promedio (0-10)',
              data: [...datosReales.csat, simState.csat],
              borderColor: colorSimulacion,
              backgroundColor: colorSimulacion,
              borderWidth: 3.5,
              pointRadius: [6, 6, 6, 6, 6, 9],
              pointBackgroundColor: ['#10B981', '#F43F5E', '#10B981', '#10B981', '#F59E0B', colorSimulacion],
              order: 1,
              yAxisID: 'y1'
            },
            {
              type: 'line',
              label: 'Umbral Meta CSAT (8.5)',
              data: [8.5, 8.5, 8.5, 8.5, 8.5, 8.5],
              borderColor: '#10B981',
              borderWidth: 2,
              borderDash: [6, 4],
              pointRadius: 0,
              order: 2,
              yAxisID: 'y1'
            },
            {
              type: 'line',
              label: 'Umbral Crisis CSAT (6.5)',
              data: [6.5, 6.5, 6.5, 6.5, 6.5, 6.5],
              borderColor: '#F43F5E',
              borderWidth: 2,
              borderDash: [6, 4],
              pointRadius: 0,
              order: 3,
              yAxisID: 'y1'
            },
            {
              type: 'bar',
              label: 'Volumen de Encuestas (n)',
              data: [...datosReales.encuestas, 160],
              backgroundColor: [barHistoricoColor, barHistoricoColor, barHistoricoColor, barHistoricoColor, barHistoricoColor, colorSimulacionTrans],
              borderColor: [barHistoricoColor, barHistoricoColor, barHistoricoColor, barHistoricoColor, barHistoricoColor, colorSimulacion],
              borderWidth: 1.5,
              borderRadius: 4,
              order: 4,
              yAxisID: 'y'
            }
          ]
        },
        options: {
          ...commonOptions,
          scales: {
            y: { position: 'left', min: 0, max: 200, ticks: { color: textColor }, grid: { color: gridColor } },
            y1: { position: 'right', min: 0, max: 10.5, ticks: { color: colorSimulacion }, grid: { drawOnChartArea: false } }
          }
        }
      });
      break;

    // 3. Ecuación Retención (>100%) con umbral base 100%
    case 3:
      chartInstance = new Chart(ctx, {
        type: 'bar',
        data: {
          labels: [...datosReales.meses, 'Simulación'],
          datasets: [
            { label: 'Clientes Inicio', data: [...datosReales.clientes_ini, 1700], backgroundColor: barHistoricoColor, borderRadius: 4 },
            { label: 'Clientes Fin Retenidos', data: [...datosReales.clientes_fin, 1700 + Math.round(simState.clientes*0.9)], backgroundColor: [lineHistoricoColor, lineHistoricoColor, lineHistoricoColor, lineHistoricoColor, lineHistoricoColor, colorSimulacion], borderRadius: 4 },
            {
              type: 'line',
              label: 'Umbral Base Retención Pura (100%)',
              data: [1000, 1100, 1250, 1400, 1550, 1700],
              borderColor: '#F59E0B',
              borderWidth: 2,
              borderDash: [6, 4],
              pointRadius: 0
            }
          ]
        },
        options: commonOptions
      });
      break;

    // 4. Rendimientos Decrecientes con umbrales CPA
    case 4:
      chartInstance = new Chart(ctx, {
        type: 'line',
        data: {
          labels: [...datosReales.meses, 'Simulación'],
          datasets: [
            { label: 'Gasto Marketing ($ USD)', data: [...datosReales.pauta, simState.gasto], borderColor: lineHistoricoColor, borderWidth: 2, pointRadius: [4,4,4,4,4,8], pointBackgroundColor: lineHistoricoColor, yAxisID: 'y' },
            { label: 'CPA Resultante ($ USD)', data: [...datosReales.cpa, simState.cpa], borderColor: colorSimulacion, borderWidth: 2.5, borderDash: [4, 4], pointRadius: [4,4,4,4,4,9], pointBackgroundColor: colorSimulacion, yAxisID: 'y1' },
            {
              type: 'line',
              label: 'Umbral CPA Eficiente ($40)',
              data: [40, 40, 40, 40, 40, 40],
              borderColor: '#10B981',
              borderWidth: 1.8,
              borderDash: [5, 5],
              pointRadius: 0,
              yAxisID: 'y1'
            },
            {
              type: 'line',
              label: 'Umbral Saturación CPA ($42)',
              data: [42, 42, 42, 42, 42, 42],
              borderColor: '#F43F5E',
              borderWidth: 1.8,
              borderDash: [5, 5],
              pointRadius: 0,
              yAxisID: 'y1'
            }
          ]
        },
        options: {
          ...commonOptions,
          scales: {
            y: { position: 'left', ticks: { color: lineHistoricoColor, callback: v => '$' + v }, grid: { color: gridColor } },
            y1: { position: 'right', min: 30, max: 48, ticks: { color: colorSimulacion, callback: v => '$' + v }, grid: { drawOnChartArea: false } }
          }
        }
      });
      break;

    // 5. Embudo Visitas vs Conversión con umbrales CR
    case 5:
      chartInstance = new Chart(ctx, {
        type: 'bar',
        data: {
          labels: [...datosReales.meses, 'Simulación'],
          datasets: [
            {
              type: 'line',
              label: 'Tasa Conversión (CR %)',
              data: [...datosReales.cr, simState.tasaConv],
              borderColor: colorSimulacion,
              borderWidth: 3.5,
              pointRadius: [5, 5, 5, 5, 5, 9],
              pointBackgroundColor: colorSimulacion,
              order: 1,
              yAxisID: 'y1'
            },
            {
              type: 'line',
              label: 'Umbral Meta CR (5.5%)',
              data: [5.5, 5.5, 5.5, 5.5, 5.5, 5.5],
              borderColor: '#10B981',
              borderWidth: 2,
              borderDash: [5, 5],
              pointRadius: 0,
              order: 2,
              yAxisID: 'y1'
            },
            {
              type: 'line',
              label: 'Umbral Base CR (5.0%)',
              data: [5.0, 5.0, 5.0, 5.0, 5.0, 5.0],
              borderColor: '#3B82F6',
              borderWidth: 1.5,
              borderDash: [5, 5],
              pointRadius: 0,
              order: 3,
              yAxisID: 'y1'
            },
            {
              type: 'bar',
              label: 'Visitas Web (Tráfico)',
              data: [...datosReales.visitas, simState.visitas],
              backgroundColor: [barHistoricoColor, barHistoricoColor, barHistoricoColor, barHistoricoColor, barHistoricoColor, colorSimulacionTrans],
              borderColor: [barHistoricoColor, barHistoricoColor, barHistoricoColor, barHistoricoColor, barHistoricoColor, colorSimulacion],
              borderWidth: 1.5,
              borderRadius: 4,
              order: 4,
              yAxisID: 'y'
            }
          ]
        },
        options: {
          ...commonOptions,
          scales: {
            y: { position: 'left', min: 0, max: 2600, ticks: { color: textColor }, grid: { color: gridColor } },
            y1: { position: 'right', min: 3, max: 7, ticks: { color: colorSimulacion, callback: v => v + '%' }, grid: { drawOnChartArea: false } }
          }
        }
      });
      break;

    // 6. Margen Limpio por Rover con umbral de viabilidad
    case 6:
      chartInstance = new Chart(ctx, {
        type: 'bar',
        data: {
          labels: ['Precio Rover ($ USD)', 'CPA (Costo Pauta)', 'Margen Limpio a la Empresa'],
          datasets: [{
            data: [101.50, simState.cpa, simState.margen],
            backgroundColor: [isMarte ? '#991B1B' : '#4B5563', '#F43F5E', colorSimulacion],
            borderColor: [isMarte ? '#EF4444' : '#6B7280', '#FB7185', colorSimulacion],
            borderWidth: 1.5,
            borderRadius: 6
          }]
        },
        options: {
          ...commonOptions, indexAxis: 'y',
          scales: { x: { ticks: { color: textColor, callback: v => '$' + v }, grid: { color: gridColor } } }
        }
      });
      break;

    // 7. Ratio Maestro CSAT/CPA con umbrales
    case 7:
      chartInstance = new Chart(ctx, {
        type: 'bar',
        data: {
          labels: [...datosReales.meses, 'Simulación'],
          datasets: [
            {
              type: 'bar',
              label: 'Puntos de Satisfacción por $1 USD',
              data: [...datosReales.ratio, parseFloat(simState.ratio)],
              backgroundColor: [barHistoricoColor, '#F43F5E', barHistoricoColor, '#10B981', barHistoricoColor, colorSimulacion],
              borderColor: [barHistoricoColor, '#FB7185', barHistoricoColor, '#34D399', barHistoricoColor, colorSimulacion],
              borderWidth: 1.5,
              borderRadius: 4
            },
            {
              type: 'line',
              label: 'Umbral Meta Ratio (0.2000)',
              data: [0.20, 0.20, 0.20, 0.20, 0.20, 0.20],
              borderColor: '#10B981',
              borderWidth: 2,
              borderDash: [5, 5],
              pointRadius: 0
            },
            {
              type: 'line',
              label: 'Umbral Alerta Ratio (0.1500)',
              data: [0.15, 0.15, 0.15, 0.15, 0.15, 0.15],
              borderColor: '#F43F5E',
              borderWidth: 2,
              borderDash: [5, 5],
              pointRadius: 0
            }
          ]
        },
        options: {
          ...commonOptions,
          scales: { y: { min: 0, max: 0.35, ticks: { color: textColor }, grid: { color: gridColor } } }
        }
      });
      break;

    // 8. ROAS con umbral Break-Even (2.50x)
    case 8:
      chartInstance = new Chart(ctx, {
        type: 'bar',
        data: {
          labels: [...datosReales.meses, 'Simulación'],
          datasets: [
            {
              type: 'line',
              label: 'ROAS (Multiplicador Ventas / Pauta)',
              data: [...datosReales.roas, parseFloat(simState.roas)],
              borderColor: '#F59E0B',
              backgroundColor: '#F59E0B',
              borderWidth: 3,
              pointRadius: 6,
              yAxisID: 'y1'
            },
            {
              type: 'line',
              label: 'Umbral Break-Even ROAS (2.50x)',
              data: [2.50, 2.50, 2.50, 2.50, 2.50, 2.50],
              borderColor: '#F43F5E',
              borderWidth: 2,
              borderDash: [6, 4],
              pointRadius: 0,
              yAxisID: 'y1'
            },
            {
              type: 'bar',
              label: 'Ventas Totales ($ USD)',
              data: [...datosReales.ventas, simState.ventas],
              backgroundColor: [barHistoricoColor, barHistoricoColor, barHistoricoColor, barHistoricoColor, barHistoricoColor, colorSimulacion],
              borderRadius: 4,
              yAxisID: 'y'
            },
            {
              type: 'bar',
              label: 'Gasto Marketing ($ USD)',
              data: [...datosReales.pauta, simState.gasto],
              backgroundColor: isMarte ? '#3A1418' : '#1F2430',
              borderRadius: 4,
              yAxisID: 'y'
            }
          ]
        },
        options: {
          ...commonOptions,
          scales: {
            y: { position: 'left', ticks: { color: textColor, callback: v => '$' + v }, grid: { color: gridColor } },
            y1: { position: 'right', min: 1.8, max: 3.2, ticks: { color: '#F59E0B', callback: v => v + 'x' }, grid: { drawOnChartArea: false } }
          }
        }
      });
      break;

    // 9. Cartera Total con meta de 1.700 contratos
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
              pointBackgroundColor: [lineHistoricoColor, lineHistoricoColor, lineHistoricoColor, lineHistoricoColor, lineHistoricoColor, colorSimulacion]
            },
            {
              label: 'Clientes Retenidos Base',
              data: [...datosReales.clientes_fin, 1700],
              borderColor: isMarte ? '#7C2D12' : '#4B5563',
              borderDash: [4, 4],
              borderWidth: 2,
              pointRadius: 3
            },
            {
              label: 'Umbral Meta Misión (1.700 contratos)',
              data: [1700, 1700, 1700, 1700, 1700, 1700],
              borderColor: '#10B981',
              borderDash: [6, 4],
              borderWidth: 2,
              pointRadius: 0
            }
          ]
        },
        options: commonOptions
      });
      break;

    // 10. Reasignación 15%
    case 10:
      chartInstance = new Chart(ctx, {
        type: 'bar',
        data: {
          labels: ['Estrategia Actual (Gasto Ciego)', 'Estrategia Recomendada SIM (15% CX)'],
          datasets: [
            { label: 'Inversión en Captación (Pauta)', data: [4000, simState.pautaNeta], backgroundColor: isMarte ? '#381216' : '#1E232F' },
            { label: 'Inversión en Posventa y CX ($ USD)', data: [0, simState.gastoCX], backgroundColor: colorSimulacion }
          ]
        },
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
// CARGA RÁPIDA DE ESCENARIOS CON DICTAMEN INTEGRADO
// ==========================================================================
function cargarEscenario(tipo) {
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

function toggleModalCalculo() {
  const modal = document.getElementById('modal-calculo');
  if (modal) modal.classList.toggle('hidden');
}

function toggleModalAyuda() {
  const modal = document.getElementById('modal-ayuda');
  modal.classList.toggle('hidden');
}

rngGasto.addEventListener('input', calcularParametros);
rngSoporte.addEventListener('input', calcularParametros);
rngVisitas.addEventListener('input', calcularParametros);

window.addEventListener('DOMContentLoaded', () => {
  calcularParametros();
  cambiarTab(1);
});
