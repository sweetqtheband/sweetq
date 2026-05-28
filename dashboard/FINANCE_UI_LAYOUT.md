# Finance Dashboard - UI/UX Layout

## 📊 Visión General

El dashboard se estructura en **3 niveles de detalle** que trabajan juntos:

1. **Nivel 1: Tabla Principal** - Vista tipo Excel de todos los gastos/ingresos
2. **Nivel 2: Panel Detalle** - Desglose de obligaciones y pagos de un gasto
3. **Nivel 3: Dashboard Consolidado** - Balance final por usuario

---

## 🎯 Nivel 1: Tabla Principal (Vista Tipo Excel)

### Layout

```
┌────────────────────────────────────────────────────────────────────────────┐
│ FINANZAS - Panel de Control                                               │
├─ Filtros: [Tipo ▼] [Estado ▼] [Mes ▼]  [+ Nuevo Gasto] [+ Nuevo Ingreso]─┤
├────────────────────────────────────────────────────────────────────────────┤
│                                                                            │
│  📊 GASTOS                                                                 │
│  ┌──────────────────────────────────────────────────────────────────────┐ │
│  │ Nombre    │ Tipo       │ Total │ % Cobr │ Pendiente │ Estado │ Acciones
│  ├──────────────────────────────────────────────────────────────────────┤ │
│  │ Alquiler  │ OPERATIONAL│ 100€  │ 100%   │ 0€        │ ✅ Pagado [...]  │
│  │ Gasolina  │ OPERATIONAL│ 60€   │ 100%   │ 15€       │ ⚠️ Partial [...]  │
│  │ Publicidad│ CORE       │ 200€  │ 100%   │ 100€      │ ❌ Pending [...]  │
│  └──────────────────────────────────────────────────────────────────────┘ │
│                                                                            │
│  💵 INGRESOS                                                               │
│  ┌──────────────────────────────────────────────────────────────────────┐ │
│  │ Nombre    │ Fuente     │ Monto │ Fecha │ Concepto   │ Acciones      │
│  ├──────────────────────────────────────────────────────────────────────┤ │
│  │ Concierto │ Sala Black │ 800€  │ 30/04 │ Black BB   │ [Ver Dist...] │
│  │ Festivalje│ Festival   │ 500€  │ 29/04 │ Festival   │ [Ver Dist...] │
│  └──────────────────────────────────────────────────────────────────────┘ │
│                                                                            │
└────────────────────────────────────────────────────────────────────────────┘
```

**Características:**

- Cada fila es un gasto/ingreso
- **Color de estado**: 🟢 Verde (pagado), 🟡 Amarillo (parcial), 🔴 Rojo (pendiente)
- **Columna "Pendiente"**: Calcula automáticamente `amountDue - sumaPagos`
- **Botón "..."**: Abre el Panel Detalle

---

## 🎯 Nivel 2: Panel Detalle - Desglose de Gasto

Se abre al hacer clic en una fila o en "...". Hay 2 vistas:

### 2A: Panel de Obligaciones (ExpensePayments)

```
┌─────────────────────────────────────────────────────┐
│ Gasto: Alquiler Sala Black Bourbon                  │
├─────────────────────────────────────────────────────┤
│ Total: 100€ | % a cobrar: 100% | A Cobrar: 100€   │
│ Estado: ⚠️ PARTIAL                                  │
├─────────────────────────────────────────────────────┤
│                                                     │
│ OBLIGACIONES INDIVIDUALES                           │
│ ┌────────────────────────────────────────────────┐ │
│ │ Usuario   │ Cuota │ Pagado │ Pendiente │ Estado│
│ ├────────────────────────────────────────────────┤ │
│ │ Jesus     │ 25€   │ 25€    │ 0€        │ ✅   │
│ │ Sara      │ 25€   │ 20€    │ 5€        │ ⚠️   │
│ │ Joaquín   │ 25€   │ 0€     │ 25€       │ ❌   │
│ │ Otro      │ 25€   │ 0€     │ 25€       │ ❌   │
│ └────────────────────────────────────────────────┘ │
│ TOTAL:      100€  45€     55€                      │
│                                                     │
│ ┌────────────────────────────────────────────────┐ │
│ │ [Registrar Pago] [Ver Historial]              │ │
│ └────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────┘
```

**Dinámica:**

- La tabla se **actualiza en tiempo real** cada vez que se registra un pago
- El estado global cambia de RED → YELLOW → GREEN automáticamente
- La columna "Pendiente" recalcula: `Cuota - Pagado`

---

### 2B: Modal Registrar Pago

Se abre al hacer clic en "[Registrar Pago]":

```
┌──────────────────────────────────────────────┐
│ Registrar Pago - Gasto: Alquiler             │
├──────────────────────────────────────────────┤
│                                              │
│ ¿Quién paga?         [Dropdown ▼]           │
│ └─ Jesus                                     │
│ └─ Sara (cuota: 25€, pendiente: 5€)         │
│ └─ Joaquín (cuota: 25€, pendiente: 25€)     │
│ └─ Otro (cuota: 25€, pendiente: 25€)        │
│                                              │
│ ¿Cuánto paga?        [______ €]             │
│                      (validación: ≤ pendiente)
│                                              │
│ ¿Quién adelantó?     [Dropdown - Opcional] │
│ └─ Nadie (pago normal)                       │
│ └─ Jesus (pago va a crédito de Jesus)       │
│ └─ Sara                                      │
│                                              │
│ Fecha                [30/04/2026]            │
│                                              │
│          [Cancelar]  [Registrar Pago] ✓     │
└──────────────────────────────────────────────┘

FLUJO:
1. Usuario selecciona quién paga (ej: Sara)
2. Ingresa monto (ej: 5€ - su pendiente)
3. Si es adelanto: Selecciona quién adelantó (ej: "Nadie" = adelanto de Sara)
4. Click "Registrar": Crea ExpensePaymentRecord y actualiza ExpensePayments
```

---

### 2C: Historial de Pagos

```
┌──────────────────────────────────────────────┐
│ Historial de Pagos - Alquiler                │
├──────────────────────────────────────────────┤
│                                              │
│ ┌────────────────────────────────────────┐  │
│ │ Fecha  │ Pagó    │ Monto │ Asignado a │ │
│ ├────────────────────────────────────────┤  │
│ │ 30/04  │ Jesus   │ 25€   │ Su cuota   │ │
│ │ 30/04  │ Sara    │ 20€   │ Su cuota   │ │
│ │ 29/04  │ Jesus   │ 50€   │ Adelanto ◀ │ │
│ │        │         │       │  (cubre su │ │
│ │        │         │       │  + 25 de   │ │
│ │        │         │       │  otro)     │ │
│ └────────────────────────────────────────┘  │
│                                              │
│ [Deshacer último pago]                      │
└──────────────────────────────────────────────┘
```

---

## 🎯 Nivel 3: Dashboard Consolidado (Balances Finales)

Se muestra en la pestaña "Resumen" o al ver un ingreso:

```
┌────────────────────────────────────────────────────────┐
│ DISTRIBUCIÓN - Ingreso: Concierto Black Bourbon (800€) │
├────────────────────────────────────────────────────────┤
│                                                        │
│ FASE 1: Deuda Cubierta                                 │
│ ┌──────────────────────────────────────────────────┐  │
│ │ Deuda núcleo cubierta:      360€                 │  │
│ │ Deuda operativa cubierta:   200€                 │  │
│ │ TOTAL DEUDA CUBIERTA:       560€                 │  │
│ └──────────────────────────────────────────────────┘  │
│                                                        │
│ BENEFICIO NETO: 240€                                   │
│                                                        │
│ FASE 2: Reserva Núcleo (30%)                           │
│ ┌──────────────────────────────────────────────────┐  │
│ │ Jesus:    22.5€ (62.5%)                          │  │
│ │ Sara:     11.25€ (31.25%)                        │  │
│ │ Joaquín:  2.25€ (6.25%)                          │  │
│ │ TOTAL:    36€                                    │  │
│ └──────────────────────────────────────────────────┘  │
│                                                        │
│ FASE 3: Beneficio Neto (70%)                           │
│ ┌──────────────────────────────────────────────────┐  │
│ │ Parte Igual (50%):           84€                 │  │
│ │   Cada uno: 21€                                  │  │
│ │                                                  │  │
│ │ Parte Variable (50%):        84€                 │  │
│ │   Jesus (30%):  25.2€                            │  │
│ │   Sara (30%):   25.2€                            │  │
│ │   Joaquín (20%): 16.8€                           │  │
│ │   Otro (20%):   16.8€                            │  │
│ └──────────────────────────────────────────────────┘  │
│                                                        │
│ TOTAL POR USUARIO                                      │
│ ┌──────────────────────────────────────────────────┐  │
│ │ Jesus:    +69.7€                        [→]      │  │
│ │ Sara:     +57.45€                       [→]      │  │
│ │ Joaquín:  +40.05€                       [→]      │  │
│ │ Otro:     +37.8€                        [→]      │  │
│ └──────────────────────────────────────────────────┘  │
│                                                        │
│ [✓ Confirmar distribución] [Editar config] [Export] │
└────────────────────────────────────────────────────────┘
```

---

## 🔄 Flujo de Interacción Completo

### Caso 1: Registrar un Gasto y Pagarlo

```
1. [+ Nuevo Gasto]
   ↓ Modal: Crear gasto
   └─ Nombre: "Alquiler"
   └─ Tipo: OPERATIONAL
   └─ Total: 100€
   └─ % a cobrar: 100%
   └─ [Crear]

2. Gasto aparece en tabla (ROJO - Pendiente)
   ↓ Clic en fila

3. Se abre Panel Detalle
   ├─ Muestra obligaciones (100€ / 4 = 25€ c/u)
   ├─ Todos en estado RED (0€ pagado)
   ↓ [Registrar Pago]

4. Modal: Registrar Pago
   ├─ Quién paga: Jesus
   ├─ Cuánto: 25€
   ├─ Adelantó: (Nadie - pago normal)
   ↓ [Registrar]

5. Tabla se actualiza automáticamente
   ├─ Jesus: 25€ (pagado)
   ├─ Estado: YELLOW (Parcial)

6. Usuario registra otros 3 pagos
   ↓ Tabla se actualiza cada vez

7. Último pago → Estado: GREEN (Pagado)
```

---

### Caso 2: Adelanto + Pagos Diferidos

```
1. Gasto: Gasolina 60€ (cada uno: 15€)

2. Panel Detalle (todos en RED)
   ↓ [Registrar Pago]

3. Modal:
   ├─ Quién paga: Jesus
   ├─ Cuánto: 60€ (adelanta TODO)
   ├─ Adelantó: Jesus ✓
   ↓ [Registrar]

4. Tabla se actualiza:
   ├─ Jesus: 60€ pagado (pero su cuota es 15€) → Indicador de adelanto
   ├─ Otros: 0€ pagado
   ├─ Estado: YELLOW (Parcial)

5. Después, Sara paga sus 15€
   ↓ [Registrar Pago]

6. Modal:
   ├─ Quién paga: Sara
   ├─ Cuánto: 15€
   ├─ Adelantó: Jesus (dropdown muestra que Jesus adelantó)
   ↓ [Registrar]

7. Tabla se actualiza:
   ├─ Dinero de Sara (15€) se asigna a Jesus
   ├─ Jesus: 60€ - 15€ = 45€ por recuperar
   ├─ Status visual: muestra el flujo de dinero

8. Joaquín paga sus 15€
   ↓ Jesus: 45€ - 15€ = 30€ por recuperar

9. Otro paga sus 15€
   ↓ Jesus: 30€ - 15€ = 0€ (PAGADO)
   ↓ Estado: GREEN
```

---

## 🎨 Componentes Carbon React a Usar

| Componente            | Uso                                    |
| --------------------- | -------------------------------------- |
| `DataTable`           | Tabla principal de gastos/ingresos     |
| `Modal`               | Crear/Editar gasto, registrar pago     |
| `Button`              | Acciones (Nuevo, Registrar, Confirmar) |
| `Dropdown` / `Select` | Filtros, seleccionar usuario           |
| `NumberInput`         | Montos, porcentajes                    |
| `Tabs`                | Gastos / Ingresos / Resumen            |
| `Tag`                 | Estados (Pagado, Pendiente, Parcial)   |
| `ProgressIndicator`   | Progreso de pago (15€/25€)             |
| `Tooltip`             | Info adicional en hover                |
| `TextInput`           | Búsqueda, nombre de gasto              |
| `DatePicker`          | Seleccionar fecha                      |
| `StructuredList`      | Desglose de distribución               |

---

## 📱 Responsividad

- **Desktop (>1024px)**: Tabla principal + Panel detalle lado a lado
- **Tablet (768-1024px)**: Tabla principal apilada, panel detalle modal
- **Mobile (<768px)**: Todo modal/stacked, acordeones para gastos

---

## 🔄 Actualización en Tiempo Real

### Cuando se registra un pago:

```javascript
1. API POST /api/finance/expenses/:id/payment-records
   └─ Crea ExpensePaymentRecord

2. Sistema calcula:
   └─ suma pagos del usuario
   └─ actualiza ExpensePayments.status
   └─ recalcula campo "Pendiente" de tabla

3. UI re-renderiza:
   └─ Fila se actualiza con nuevo estado
   └─ Tag de color cambia si es necesario
   └─ Panel detalle muestra dinero actualizado
   └─ Animación visual (ej: check/fade)
```

---

## 🎯 Estados Visuales

```
ESTADO GASTO    COLOR   ICONO   TOOLTIP
Pagado          🟢      ✅      "Todo pagado"
Parcial         🟡      ⏳      "15€ de 100€"
Pendiente       🔴      ⏳      "Sin pagos"

ADELANTO
- Usuario con adelanto: Muestra badge especial
- Dinero que recupera: Contador visual
```

---

Este es el concepto. ¿Te queda más claro? ¿Ajustamos algo del layout o empezamos a generar OpenAPI + código?
