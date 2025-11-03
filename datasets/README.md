## Origen de los Datos

Los datasets fueron obtenidos a través de la **API pública de HookTheory** (https://api.hooktheory.com/v1/), una plataforma educativa y analítica de progresiones armónicas.  
Mediante solicitudes HTTP autenticadas con el usuario y contraseña de hooktheory.com, se descargaron progresiones **en modo mayor**, incluyendo información sobre los acordes, sus funciones armónicas y la tonalidad base.  

La documentación de la API se encuentra en https://www.hooktheory.com/api/trends/docs

Cada progresión fue almacenada en formato `.csv`, en un dataset con las siguientes columnas:
- cp (Chord Progression): Las progresiones de acordes de las canciones en notación romana.
- artist: Artista compositor de la canción.
- song: Canción a la cual pertenece la progresión de acordes.
- section: Sección de la canción a la cual pertenece la progresión de acordes (Estribillo, Verso, Puente, etc).

## Proceso de Conversión a Modo Menor

Dado que la API de HookTheory provee progresiones en **modo mayor**, se desarrolló un script de conversión que genera el **dataset en modo menor** aplicando la relación de **relativo menor**:

- Cada progresión en modo mayor fue desplazada **una tercera menor descendente (−3 semitonos)** para obtener su relativa menor.  
- Ejemplo:  
  - Progresión en C Mayor: C - F - G - Am 
  - Relativa menor: A menor → Am - Dm - Em - F

El resultado final es un dataset nuevo con progresiones menores únicamente las cuales son utilizadas para entrenar el modelo de progresiones de acordes menores.

---

## Licencia de Uso

Los datos utilizados en este proyecto provienen del dataset oficial de HookTheory, accedido mediante su API pública y autorizada (https://api.hooktheory.com/v1/).
El acceso se realizó respetando los términos de servicio y las limitaciones de uso establecidas por HookTheory, sin realizar prácticas de scraping, extracción masiva o redistribución no autorizada de datos.

De acuerdo con la Anti-Scraping Policy – Public Display and Use, HookTheory prohíbe expresamente la copia, descarga masiva, minería de texto y datos, o redistribución del contenido del sitio o de la base de datos TheoryTab, excepto cuando sea autorizado mediante una licencia o el uso legítimo de su API.

Este proyecto cumple con dichas condiciones mediante las siguientes medidas:
	• Se utilizaron únicamente los endpoints oficiales de la API de HookTheory.
	• No se redistribuyen los datos originales ni se incluyen archivos con progresiones musicales provenientes directamente de la API en este repositorio.
	• La aplicación web SimpleChord no expone públicamente el contenido del dataset original; los datos se utilizan internamente para el entrenamiento y evaluación de modelos generativos.

Por lo tanto, el uso de los datos en este proyecto respeta íntegramente los términos de HookTheory y no infringe su política de acceso o redistribución.
Los resultados derivados (modelos entrenados, gráficos y análisis) se publican bajo licencia Creative Commons Attribution-NonCommercial 4.0 International (CC BY-NC 4.0).

---

## Referencia

HookTheory API - https://api.hooktheory.com/v1/
Creative Commons License - https://creativecommons.org/licenses/by-nc/4.0/