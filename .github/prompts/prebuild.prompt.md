---
description: "Ejecuta prebuild en el scope correcto: detecta paquete, corre pnpm build y corrige errores/warnings"
name: "Prebuild"
argument-hint: "Ruta opcional del paquete (por ejemplo: dashboard)"
agent: "agent"
---
Realiza un prebuild completo del proyecto y no te detengas hasta terminar.

Objetivo:
- Ejecutar `pnpm build`.
- Corregir todos los errores que aparezcan.
- Corregir todos los warnings que aparezcan en la salida del build.
- Repetir el ciclo hasta que el build termine sin errores ni warnings visibles.

Parámetros:
- Si se recibe un argumento, úsalo como ruta de trabajo relativa al workspace (por ejemplo dashboard o www).
- Si no se recibe argumento, no asumas la carpeta actual sin validar antes el scope.

Resolución de scope (obligatoria antes del build):
1. Determinar carpeta objetivo inicial:
- Con argumento: usar esa ruta.
- Sin argumento: usar la carpeta actual como candidata.
2. Verificar que exista package.json en la carpeta candidata.
3. Verificar que package.json tenga script build.
4. Si falta package.json o script build:
- Buscar en subcarpetas del workspace un package.json que sí tenga script build.
- Si hay más de uno, priorizar el más cercano al contexto activo del usuario (archivo abierto/ruta de trabajo).
5. Hacer cd explícito a la carpeta elegida y confirmar el scope antes de construir.
6. Si no se encuentra ningún script build válido, detener y reportar el bloqueo con rutas revisadas.

Flujo obligatorio:
1. Resolver scope con el bloque anterior.
2. Ejecutar pnpm build en la carpeta validada.
3. Analizar salida del comando y panel de problemas (get_errors) para detectar errores y warnings.
4. Aplicar correcciones mínimas y seguras en el código.
5. Volver a ejecutar pnpm build en el mismo scope validado.
6. Repetir hasta que no queden errores ni warnings reportados por el build.

Reglas:
- No ocultar warnings desactivando reglas sin justificación.
- No degradar funcionalidad para silenciar errores.
- Mantener estilo y arquitectura existente.
- Si hay bloqueo externo (credenciales, servicio caído, dependencia rota), reportarlo claramente.

Entrega final:
- Lista de archivos modificados.
- Resumen breve de correcciones aplicadas.
- Último resultado de `pnpm build` (indicando que quedó limpio).
