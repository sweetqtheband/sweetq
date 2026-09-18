---
name: traducir-ficheros
description: "Sincroniza y traduce archivos de localización. Completa claves faltantes en en.json con traducciones al inglés basadas en es.json como referencia, y elimina claves huérfanas."
---

# Traductor de Ficheros de Localización

Necesito que sincronices los archivos de localización en `dashboard/app/locales/`:

## Tarea

1. **Abre** `dashboard/app/locales/es.json` como referencia
2. **Abre** `dashboard/app/locales/en.json`
3. **Completa** todas las claves que existan en `es.json` pero no en `en.json`
   - Traduce al inglés los valores
   - Mantén la estructura y jerarquía de objetos
4. **Elimina** todas las claves que existan en `en.json` pero no en `es.json`
5. **Verifica y valida** la estructura JSON
   - Asegúrate de que el JSON es válido después de cada cambio
   - Comprueba que todas las comillas, comas y llaves están correctas
   - Valida que la estructura sea idéntica a la de `es.json`
6. **Guarda** los cambios

## Notas

- Usa el contexto del proyecto (Sweet Q) para traducciones contextualmente correctas
- Las claves de rutas/estructura deben ser idénticas en ambos ficheros
- Si hay dudas de traducción, usa el contexto del código del proyecto
- **IMPORTANTE**: Siempre valida el JSON después de completar las traducciones. No guardes cambios sin verificar que el JSON es válido

¿Empezamos?
