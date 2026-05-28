# Finance Module - Especificaciones Técnicas

## 📋 Tabla de Contenidos

1. [Propósito](#propósito)
2. [Conceptos Base](#conceptos-base)
3. [Modelos de Datos](#modelos-de-datos)
4. [Lógica de Gastos](#lógica-de-gastos)
5. [Lógica de Ingresos](#lógica-de-ingresos)
6. [Endpoints API](#endpoints-api)
7. [Configuración](#configuración)

---

## 🎯 Propósito

Crear un sistema potente de calculadora de ingresos/gastos y reparto inteligente de beneficios entre los miembros de la banda (finance-users).

---

## 🔑 Conceptos Base

### Enumeraciones

```typescript
enum UserFinanceType {
  CORE = "core", // Miembro CORE (pagador de gastos núcleo)
  OPERATIVE = "operative", // Miembro OPERATIVE (solo gastos operativos)
}
```

### Entidades Principales

1. **Finance Users** (Intervinientes): Miembros de la banda que pueden participar en repartos
2. **Expenses** (Gastos): Operaciones de gasto categorizadas
3. **Expense Payments** (Pagos de Gastos): Registro de quién paga qué y cuándo
4. **Incomes** (Ingresos): Operaciones de ingreso
5. **Income Distribution** (Distribución de Ingresos): Cálculo automático del reparto al recibir ingresos
6. **Finance Config** (Configuración): Parámetros globales del sistema

---

## 📊 Modelos de Datos

### 1. FinanceUsers (YA EXISTE - EXPANDIR)

```typescript
type FinanceUsers = {
  _id: string;
  name: string;
  userId: string | null; // Referencia a Users de la aplicación (opcional)
  percentage: number; // % para reparto variable (50% del 70%)
  ordering: number; // Orden de visualización
  memberType: UserFinanceType; // CORE | OPERATIVE (tipo de miembro)
  createdAt: Date;
  updatedAt: Date;
};
```

**Cambios necesarios:**

- Agregar `memberType` (enum) para clasificar a los usuarios como miembros CORE y OPERATIVE
- Agregar `userId` (opcional) para vincular FinanceUsers con Users de la aplicación

---

### 2. ExpenseType (NUEVA - Enumeración)

```typescript
enum ExpenseType {
  OPERATIONAL = "operational", // Gasto operativo (sala, gasolina, etc)
  CORE = "core", // Gasto núcleo (publicidad, playlists, etc)
}
```

---

### 3. Expenses (NUEVA)

```typescript
type Expenses = {
  _id: string;
  name: string; // "Alquiler Sala Black Bourbon"
  type: ExpenseType; // OPERATIONAL | CORE
  concept: string; // Concepto vinculado (ej: "Concierto Black Bourbon")
  totalAmount: number; // Monto total del gasto (ej: 200€)
  percentageToCharge: number; // % a cobrar del total (ej: 50 = 100€)
  amountToCharge: number; // Calculado: totalAmount * (percentageToCharge/100)
  description: string; // Descripción adicional
  valueDate: Date | null; // Fecha contable del gasto (opcional)
  status: "pending" | "partial" | "paid"; // Estado de pago
  createdBy: string; // ID del finance-user que lo creó
  createdAt: Date;
  updatedAt: Date;
};
```

---

### 4. ExpensePayments (NUEVA - Obligaciones/Cuotas)

```typescript
type ExpensePayments = {
  _id: string;
  expenseId: string; // Referencia a Expenses
  userId: string; // ID del finance-user que debe pagar
  amountDue: number; // Cuota individual a pagar
  status: "pending" | "partial" | "paid"; // Estado de pago
  createdAt: Date;
  updatedAt: Date;
};
```

### 5. ExpensePaymentRecord (NUEVA - Pagos Reales)

```typescript
type ExpensePaymentRecord = {
  _id: string;
  expenseId: string; // Referencia a Expenses
  paidBy: string; // ID del usuario que pagó
  paidTo: string | null; // ID del usuario que adelantó (null si pago normal)
  amount: number; // Monto pagado
  paymentDate: Date; // Fecha del pago
  createdAt: Date;
};
```

**Nota:** Los gastos operativos se dividen a partes iguales entre TODOS los finance-users.
Los gastos núcleo solo incluyen miembros CORE (pero miembros OPERATIVE pueden participar voluntariamente).

**Lógica de pagos:**

- `ExpensePayments` registra la obligación/cuota de cada usuario
- `ExpensePaymentRecord` registra cada pago real
- Si alguien adelanta el 100%, se indica en `paidTo`
- Los pagos posteriores de otros usuarios se asignan al que adelantó

---

### 6. Incomes (NUEVA)

```typescript
type Incomes = {
  _id: string;
  name: string; // "Concierto Black Bourbon"
  concept: string; // Concepto vinculado a gastos
  amount: number; // Monto recibido
  source: string; // Fuente del ingreso (concierto, premio, etc)
  description: string;
  valueDate: Date | null; // Fecha contable del ingreso (opcional)
  receivedAt: Date;
  createdAt: Date;
  updatedAt: Date;
};
```

---

### 7. IncomeDistribution (NUEVA - Calculada)

```typescript
type IncomeDistribution = {
  _id: string;
  incomeId: string; // Referencia a Incomes
  concept: string; // Concepto asociado
  distributionDate: Date;

  // Fase 1: Deudas pendientes
  debtCovered: number; // Deuda de gastos núcleo cubierta
  operationalExpenseCovered: number; // Gastos operativos cubiertos

  // Fase 2: Reserva para futuros gastos núcleo
  coreReservationPercentage: number; // 30% (configurable)
  coreReservationAmount: number; // 30% del beneficio neto
  coreReservationByUser: Record<string, number>; // Distribución 30%

  // Fase 3: Beneficio neto (70%)
  netBenefitAmount: number; // 70% del beneficio neto
  equalSharePercentage: number; // 50% del beneficio neto (33.3% c/u)
  variableSharePercentage: number; // 50% del beneficio neto (según %)

  // Distribución final por usuario
  distributionByUser: Record<
    string,
    {
      userId: string;
      userName: string;
      debtCoverage: number;
      coreReservation: number;
      equalShare: number;
      variableShare: number;
      total: number;
    }
  >;

  createdAt: Date;
};
```

---

### 8. FinanceConfig (NUEVA)

```typescript
type FinanceConfig = {
  _id: string;
  coreReservationPercentage: number; // Default: 30
  equalSharePercentage: number; // Default: 50 (del 70% beneficio)
  variableSharePercentage: number; // Default: 50 (del 70% beneficio)
  createdAt: Date;
  updatedAt: Date;
};
```

---

## 💰 Lógica de Gastos

### Ciclo de Vida de un Gasto

1. **Crear Gasto**
   - Seleccionar tipo: OPERATIONAL o CORE
   - Ingresar monto total
   - Ingresar % a cobrar
   - Sistema calcula: `amountToCharge = totalAmount * (percentageToCharge / 100)`

2. **Distribuir Gasto**
   - **OPERATIONAL**: Se divide a partes iguales entre TODOS los finance-users (tanto CORE como OPERATIVE)
     - `amountPerPerson = amountToCharge / totalFinanceUsers`
   - **CORE**: Se divide entre miembros CORE (+ miembros OPERATIVE que se adhieran voluntariamente)
     - `amountPerPerson = amountToCharge / participantCount`

3. **Crear Obligaciones**
   - Se crea una entrada `ExpensePayments` por usuario
   - `amountDue` = cuota individual
   - `status: "pending"` inicialmente
   - UI muestra botón de pago (rojo = no pagado, verde = pagado)

4. **Registrar Pago**
   - Usuario paga su cuota
   - Se crea entrada en `ExpensePaymentRecord`:
     - `paidBy`: ID del usuario que pagó
     - `paidTo`: null (pago normal) o ID del que adelantó
     - `amount`: cuota + extras si adelanta
   - Sistema recalcula `ExpensePayments.status`:
     - Suma todos los pagos del usuario → `amountPaid`
     - Si `amountPaid >= amountDue`: `status = "paid"`
     - Si `amountPaid > 0`: `status = "partial"`
     - Si `amountPaid = 0`: `status = "pending"`

5. **Caso: Adelanto (Coverage)**
   - Usuario A adelanta 100€ (total del gasto)
   - Se crea `ExpensePaymentRecord` con `paidBy: A`, `paidTo: null`, `amount: 100`
   - Cuando Usuario B paga sus 25€:
     - Se crea `ExpensePaymentRecord` con `paidBy: B`, `paidTo: A`, `amount: 25`
     - El dinero se asigna a Usuario A (reduce su adelanto)

---

## 💵 Lógica de Ingresos (Distribución Inteligente)

### Escenario Base

Asumimos:

- Gastos operativos acumulados: 360€
- Gastos núcleo pendientes: 200€ (Jesus) + 100€ (Sara) + 20€ (Joaquín) = 320€
- **Total deuda**: 680€
- **Ingreso recibido**: 800€

### Algoritmo de Distribución

**FASE 1: Cubrir Deudas**

```
1. Deuda total = Gastos operativos pendientes + Gastos núcleo pendientes
2. Deuda a cubrir = min(ingreso, deuda_total)
3. Si ingreso >= deuda_total:
     - Cubrir 100% de la deuda
     - Pasar a FASE 2
   Si ingreso < deuda_total:
     - Cubrir deuda proporcionalmente (repartida a partes iguales)
     - Fin (no hay beneficio)
```

**En el ejemplo:**

- Deuda total: 680€
- Ingreso: 800€
- Se cubre 100% de la deuda: 680€
- **Sobrante (Beneficio)**: 800€ - 680€ = 120€

---

**FASE 2: Reserva para Gastos Núcleo Futuros (30% del beneficio)**

```
1. reservationAmount = beneficio * 0.30  // Configurable
2. Distribuir entre TODOS los usuarios que hayan incurrido en gastos CORE
   (sin importar si son CORE u OPERATIVE)
   Proporcionalmente según su deuda individual en gastos CORE

   Ejemplo:
   - Deuda núcleo total: 320€
   - Jesus (CORE): 200/320 = 62.5%
   - Sara (CORE): 100/320 = 31.25%
   - Joaquín (OPERATIVE - participó voluntariamente): 20/320 = 6.25%

   - Reserva disponible: 120 * 0.30 = 36€
   - Jesus recibe: 36 * 0.625 = 22.5€
   - Sara recibe: 36 * 0.3125 = 11.25€
   - Joaquín recibe: 36 * 0.0625 = 2.25€
```

**En el ejemplo:**

- Reserva: 120€ \* 30% = 36€
- Distribución reserva:
  - Jesus: 22.5€
  - Sara: 11.25€
  - Joaquín: 2.25€

---

**FASE 3: Reparto del Beneficio Neto (70% del beneficio)**

```
beneficio_neto = beneficio * 0.70

Se divide en 2:
  - 50% a partes iguales
  - 50% según porcentajes de FinanceUsers
```

Asumiendo 4 finance-users (Jesus, Sara, Joaquín, Otro):

```
1. PARTE IGUAL (50% del 70% = 35% del beneficio)
   - Cada usuario recibe: (120 * 0.70 * 0.50) / 4 = 10.5€
   - Todos: 10.5€

2. PARTE VARIABLE (50% del 70% = 35% del beneficio)
   - Distribuir según porcentajes de FinanceUsers

   Ejemplo porcentajes:
   - Jesus: 30%
   - Sara: 30%
   - Joaquín: 20%
   - Otro: 20%

   Disponible: 120 * 0.70 * 0.50 = 42€
   - Jesus: 42 * 0.30 = 12.6€
   - Sara: 42 * 0.30 = 12.6€
   - Joaquín: 42 * 0.20 = 8.4€
   - Otro: 42 * 0.20 = 8.4€
```

---

### Distribución Final Consolidada

```
JESUS:
  - Cobertura deuda: 200€ (núcleo)
  - Cobertura gastos operativos: 90€ (360€/4)
  - Reserva núcleo: 22.5€
  - Parte igual: 10.5€
  - Parte variable: 12.6€
  - TOTAL: 335.6€

SARA:
  - Cobertura deuda: 100€ (núcleo)
  - Cobertura gastos operativos: 90€
  - Reserva núcleo: 11.25€
  - Parte igual: 10.5€
  - Parte variable: 12.6€
  - TOTAL: 224.35€

JOAQUÍN:
  - Cobertura deuda: 20€ (núcleo)
  - Cobertura gastos operativos: 90€
  - Reserva núcleo: 2.25€
  - Parte igual: 10.5€
  - Parte variable: 8.4€
  - TOTAL: 131.15€

OTRO:
  - Cobertura deuda: 0€
  - Cobertura gastos operativos: 90€
  - Reserva núcleo: 0€
  - Parte igual: 10.5€
  - Parte variable: 8.4€
  - TOTAL: 108.9€

TOTAL DISTRIBUIDO: 800€ ✓
```

---

### Casos Especiales

**Caso: Deuda > Ingreso**

Si el ingreso no cubre toda la deuda:

```
Deuda total: 680€
Ingreso: 500€

Sobrante: -180€ (déficit)

Acción: Repartir el ingreso solo entre gastos operativos
(Los gastos núcleo quedan pendientes)

Distribución simple a partes iguales entre todos los users
```

---

## 🔌 Endpoints API

### Expenses

```
GET    /api/finance/expenses              # Listar gastos
POST   /api/finance/expenses              # Crear gasto
PUT    /api/finance/expenses/:id          # Actualizar gasto
DELETE /api/finance/expenses/:id          # Eliminar gasto
GET    /api/finance/expenses/:id          # Obtener detalle
```

### Expense Payments (Obligaciones)

```
GET    /api/finance/expenses/:id/payments              # Listar cuotas de un gasto
PUT    /api/finance/expenses/:id/payments/:paymentId   # Actualizar estado de cuota
```

### Expense Payment Records (Pagos Reales)

```
GET    /api/finance/expenses/:id/payment-records       # Listar pagos de un gasto
POST   /api/finance/expenses/:id/payment-records       # Registrar nuevo pago
GET    /api/finance/expenses/:id/payment-records/:recordId  # Obtener detalle
```

### Incomes

```
GET    /api/finance/incomes               # Listar ingresos
POST   /api/finance/incomes               # Crear ingreso (TRIGGER: calcula distribución)
PUT    /api/finance/incomes/:id           # Actualizar ingreso
DELETE /api/finance/incomes/:id           # Eliminar ingreso
GET    /api/finance/incomes/:id           # Obtener detalle
```

### Income Distribution

```
GET    /api/finance/distributions        # Listar distribuciones
GET    /api/finance/distributions/:id     # Obtener detalle de distribución
GET    /api/finance/incomes/:id/distribution  # Distribución de un ingreso
```

### Finance Config

```
GET    /api/finance/config               # Obtener configuración
PUT    /api/finance/config               # Actualizar configuración
```

### Dashboard / Resumen

```
GET    /api/finance/summary              # Dashboard con totales
GET    /api/finance/balance/user/:userId # Balance individual por usuario
```

---

## ⚙️ Configuración

### FinanceConfig - Valores por Defecto

```json
{
  "coreReservationPercentage": 30,
  "equalSharePercentage": 50,
  "variableSharePercentage": 50
}
```

**Explicación:**

- `coreReservationPercentage`: % del beneficio reservado para cubrir gastos núcleo (30%)
- `equalSharePercentage`: % del beneficio neto para reparto igual (50%)
- `variableSharePercentage`: % del beneficio neto para reparto variable (50%)

---

## 🎨 UI - Vista Conceptual

### Dashboard Principal

```
┌─────────────────────────────────────────────┐
│  FINANZAS - PANEL DE CONTROL                │
├─────────────────────────────────────────────┤
│                                             │
│  GASTOS OPERATIVOS      GASTOS NÚCLEO       │
│  ┌──────────────────┐   ┌──────────────────┐│
│  │ Alquiler 100€    │   │ Publicidad 200€  ││
│  │ [✓] Jesus        │   │ [✗] Jesus        ││
│  │ [✓] Sara         │   │ [✓] Sara         ││
│  │ [✗] Joaquín      │   │ [✗] Joaquín      ││
│  │ [✗] Otro         │   │                  ││
│  └──────────────────┘   └──────────────────┘│
│                                             │
│  INGRESOS                                   │
│  ┌─────────────────────────────────────────┐│
│  │ Concierto Black: 800€ [VER DISTRIBUCIÓN]││
│  │ Festivalaje: 500€    [VER DISTRIBUCIÓN]││
│  └─────────────────────────────────────────┘│
│                                             │
│  BALANCE INDIVIDUAL                         │
│  ┌─────────────────────────────────────────┐│
│  │ Jesus:    +335.6€                       ││
│  │ Sara:     +224.35€                      ││
│  │ Joaquín:  +131.15€                      ││
│  │ Otro:     +108.9€                       ││
│  └─────────────────────────────────────────┘│
└─────────────────────────────────────────────┘
```

---

## 📝 Notas de Implementación

1. **Cálculo de Distribuciones**: Cuando se crea un Ingreso, el sistema debe ejecutar automáticamente el algoritmo de distribución y crear un registro en `IncomeDistribution`.

2. **Sistema de Pagos con Adelantos**:
   - `ExpensePayments` almacena las obligaciones/cuotas
   - `ExpensePaymentRecord` almacena cada transacción de pago
   - Cuando alguien adelanta dinero, se registra con `paidTo: null`
   - Cuando otros pagan después, se registran con `paidTo: <idDelQueAdelantó>`
   - El sistema calcula automáticamente cuánto debe a cada usuario y ajusta saldos

3. **Atomicidad**: Los cálculos deben ser transaccionales. Si algo falla, no crear registros parciales.

4. **Auditoría**: Registrar quién creó cada gasto/ingreso y cuándo.

5. **Validaciones**:
   - No permitir porcentajes > 100%
   - No permitir crear gastos/ingresos con montos negativos
   - No permitir eliminar financeUsers que tienen pagos asociados
   - `ExpensePaymentRecord.amount` no puede ser mayor que la cuota pendiente

6. **UI Responsiva**: La matriz de gastos/ingresos debe ser adaptable a mobile.

7. **Export**: Permitir exportar reportes en PDF/Excel con distribuciones detalladas.

---

**Estado**: Especificación completada - Lista para migrar a OpenSpec
