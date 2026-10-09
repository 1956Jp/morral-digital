// Catálogo: [0 título, 1 autor, 2 corriente, 3 precio USD (0 = enlace gratuito, no se vende),
//            4 color, 5 descripción, 6 archivo en books/, 7 fuente (URL de origen), 8 licencia]
// Corrientes: Bolivariano, Antiimperialista, Latinoamericano, Martiano, Zapatista, Marxista
// Regla: solo dominio público estricto; verificar cada edición en books/MANIFIESTO.md
const B=[
["Carta de Jamaica","Simón Bolívar","Bolivariano",1.5,"#1f7a8c","Visión de una América unida frente al dominio colonial (1815).","","","Dominio público"],
["Discurso de Angostura","Simón Bolívar","Bolivariano",1.5,"#17607a","Ideas de república, educación y unidad ante el Congreso de 1819.","","","Dominio público"],
["Inventamos o erramos","Simón Rodríguez","Bolivariano",2,"#2c6e49","El maestro de Bolívar y su apuesta por una América original.","","","Dominio público"],
["Nuestra América","José Martí","Martiano",1,"#1d5f9e","Ensayo clave contra la mirada colonial y por la identidad americana (1891).","","","Dominio público"],
["El imperialismo, fase superior del capitalismo","V. I. Lenin","Marxista",2,"#0f766e","Análisis clásico del imperialismo económico (1917).","","","Dominio público"],
["Manifiesto del Partido Comunista","Marx y Engels","Marxista",1,"#3b8f6b","El texto fundacional del pensamiento socialista (1848).","","","Dominio público"],
["Ariel","José Enrique Rodó","Latinoamericano",2,"#2f6fb0","Defensa de la identidad cultural latinoamericana (1900).","ariel.pdf","https://archive.org/details/arielrod00roduoft","Dominio público"],
["Primera Declaración de la Selva Lacandona","EZLN","Zapatista",0,"#7a4a2f","Comunicado fundacional del EZLN (1994). Texto original, sin venta: solo enlace.","","https://enlacezapatista.ezln.org.mx/1994/01/01/primera-declaracion-de-la-selva-lacandona","Enlace libre (copyright EZLN)"],
["Al pueblo de México: las demandas del EZLN","EZLN","Zapatista",0,"#8a5a3f","Pliego de demandas del levantamiento de 1994. Texto original, sin venta: solo enlace.","","https://enlacezapatista.ezln.org.mx/1994/03/01/al-pueblo-de-mexico-las-demandas-del-ezln","Enlace libre (copyright EZLN)"],
["La palabra del EZLN (archivo de comunicados)","EZLN","Zapatista",0,"#5a3a2f","Archivo de comunicados desde 2011. Radio Zapatista publica bajo CC BY-NC-SA: enlace gratuito.","","https://radiozapatista.org/?page_id=3365","Enlace libre (CC BY-NC-SA)"],
["Facundo","Domingo F. Sarmiento","Latinoamericano",2,"#35608f","Civilización o barbarie: radiografía de la Argentina del siglo XIX y del caudillismo (1845).","facundo.pdf","https://archive.org/details/facundos00sarmuoft","Dominio público"]];
