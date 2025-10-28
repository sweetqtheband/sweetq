import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const QUESTIONS = {
  INFO: `En base a una serie de mensajes que te voy a pasar, deduce cual es el país, la ciudad y la provincia del siguiente usuario. Además, en base al contenido de los mensajes, si consideras que las conversaciones denotan un claro interés por lo que hacemos (somos una banda de música, infiere si en base a todo lo que diga la persona podría considerarse un superfan, un fan o no muestra demasiado interés) añade la catalogación "superfan", "fan" en un campo "typeUser". Devuelve únicamente en una linea lo que consideres, en formato json {"country":, "state":, "city":, "typeUser":}. Te muestro un ejemplo:
      Ejemplo 1 (typeUser:"superfan"): 
      ['Jajjajajaja, vamos!!!','🔥','B noches 😘','Claro que si','Como me alegro','Ole!!','Estaré atenta si!! Vais a tope❤️','Vamos!!!','Poneros a trabajar que la necesito jajajaj','O sea q en casita con mucha misica de fondo','Está todo bien 🙌🏻🙌🏻 pero lo vi jodido… accidente de tráfico, mi niño y mi marido. Pero están bien','Además de músicazos sois un amor','Me ha dado un golpe la vida… pero sigo con mucha musica! ❤️ sois geniales!','Bravo chicos!!! 👏👏👏','👏','Favorita, sorry🙌🏻🙌🏻🙌🏻','👏','🤣🤣🤣','A saber… que me sorprendan!!! 🤣🤣🤣','😂','🤦🏽‍♀️','Jajajaj… buen dato','Os lo voy a recordar ….🤣🤣🤣','Jajajajaaj. Pues no tengo programación de enero, pero si me pilla en mad fijo!!!','Jajajaja. Que detallazo!!! \n' +'Ya la he escuchado, y me encanta… además soy bastante especial en temas de navidad. La habéis bordado. Y la tengo en mis listas. \n' +'A ver si os veo pronto, que me encantaría volver a veros en Madrid . \n' +'Feliz navidad para vosotros tb. Y mejor año. Claro que me encantará lo que está por venir. 💙 hasta pronto','👏','🔥','👏','👏','👏','👏','👏','Fijo','Será genial','Jajajaja','No estoy… porque iba fijo','Me pilla fuera… que pena… vais como\nUn tiro….🎉🎉','👏','👏','A ver siiiii!!!','🤣🤣','Que bien, estáis viento en popa!🎉🎉','Enhorabuena!!!! 💙','👏','!!','Lo dicho, mucha suerte','Pues estamos en contacto','En septiembre mis veo, tb me encantan','Ah sisiii','Me encantó !!! Mucho, a ver si cuelgo algún vídeo','https://open.spotify.com/track/7xlkgRk0rDGHEpYtRKrrbc?si=sEES8L8OTw6kEDPrgzwG8Q','A FULL','Ya os dicho','🍻🍻👏👏','🙋🏽‍♀️','Aqui estoy','FULL','Ya se a quien me recordáis tb','Abrazooo!!','Os lo diré por aquí','No soy mucho de eso, me da palillo, pero lo haré','Jajajaj','Pero mañana voy a intentarlo','Si plis.','Que cuando los vi la primera vez no los conocía nin di… y el sábado 16000 en el Wizink','Os vais a hacer como viva Suecia','Jajajaja','Yo en Madrid estoy por trabajo','Venid a La Coruña','Me j… no poder ir, pero os sigo y os veré fijo','Buff, pero tengo madrugón el sábado','Jajajajaj','Pues igual si puedo ir mañana','Oh, Que me confundí con el número de la Calle🤣🤣🤣','Pues no me acuerdo ahora donde os he escuchado, pero me flipais, no descarto ir el 29 a veros , pero aún no lo sé seguro , canción?? Enganchada a ATRAPADO EN EL TIEMPO.❤️, me recordáis a la sonrisa de Julia , os deseo lo\n' +'Mejor'
] => {country: "España", state: "A Coruña", city: "A Coruña", typeUser: "superfan"}
 Ejemplo 2 (typeUser: "superfan"):
 ["Hola, pues ví vuestra versión de zorra y me gustó mucho, soy zorra y eurofan. Suerte chicos","Me recordáis a Arde Bogotá","Seguro que es cuestión de tiempo que triunfeis, el boca👄👂 funcionará","También sonáis a los Piratas en sus mejores álbumes","Yo soy muy rockera y a mis 3 hijos se lo he metido en vena, aunque la mayor se me ha descarrilado con el Ŕauw Alejandro 😄.Con 20  años fuí la primera punk en mi pueblo, ahora con 50 lo sigo disfrutando y bailando encima de las barras de los bares, contando los días para El Madcool 😅","Sonáis muy bien, muy limpio y sois muy jóvenes, llegará vuestra recompensa si sois constantes y no perdéis la ilusión","Oye me ha encantado hablar contigo este ratito,  nunca había contestado a estas cosas de Instagram porque siempre he pensado que son circulares publicitarias.","Es chica, no tengo esperanza en ella, el mediano es muy fan de Acdc y la pequeña es muy mocatriz le gustan los smashing Pumpkins. Me la llevo al Madcool a verlos ( y a dua lipa, pero eso no lo digo muy alto)😃","La música en directo es lo mejor. Yo voy a muchos conciertos y festivales, cuando mi hermana se queda con los niños, es difícil conciliar cuando estás sola. Vivo en León. Pero a veces voy a Madrid a ver a mi hermano y a mi sobrino","Eso estaría bien","Joder! Parecéis unos críos, yo 48 pero me siento veinteañera 😂","Claro , o al gran café, ahí voy mucho, molan mucho los conciertos allí, al último que fui fue a la despedida de Havalina, acabé llorando con Manolo, me dió mucha pena","Si, son unos tíos muy majos, les sigo desde que tenían pelo jajaja","Si, o a Asturias que subo una vez al mes a escuchar algo y a por sidras 😏","Me molan mucho León Benavente, me los encuentro por el plaza de Gijón, también corizonas me flipan, el vacas es alucinante","Yo soy un poco grupie, siempre acabo pidiendo baquetas y hablando con los del grupo. La gente del rock es muy maja 😁","Fijo","Cuando vengáis al norte avisarme, que allí estaré pidiendo la púa 😄","En primera fila","Claro, siempre me Dan las peores, los pobres, tengo colección pongo fecha y nombre del grupo! Bueno a los de Calavento se la guindé (shhhh)","Si la bad guial mete 🎸  igual lo conseguimos","Nunca se fué","Aunque a mi hay grupos tontipop, que no los soporto aunque mueven masas","Joder, yo he tenido que aprender a perrear para poder bailar algo en las fiestas de verano 😂","Siii, donde esté una buena cumbia jeje","Buen nombre para un grupo","Jajajajajajaj","Me desorino  jajajajaja no lo había visto","Vaya Hit","Me lo apunto para mi lista de petardadas, cuando pincho mi nombre artístico es Lady Faja. \nPongo de Mary trini a kortatu para fiestas y despedidas de solter@s 😄","Mi amigos esperan ansiosos a que haga mi performan cuando pincho y saco las plumas con este grandisimo tema","https://youtu.be/5KkUOvpePmM?si=NwbMATP2JRmYfNVv","Ahora es cuando me bloqueas 😄","A qué te dedicas a parte de la música 🎶?","Eso sí que es un clásico jajajaja","Yo me llevo fatal con los aparatos electrónicos y el ordenador lo estrellaría un par de veces al día","Lo mío son los dientes","Lo se, a mí me putea hasta la lavadora","Trabajo con ultrasonidos y turbinas que me dañan la cóclea  y estoy perdiendo audición","La mutua piensa que es por trabajar en la clínica, lo que no sabe es que siempre estoy cerca de un altavoz 🔊","Tendré que hablar con mi contacto en La salvaje de Oviedo y en el gran café a ver si puedo disfrutaros en directo","Yo pongo la sidra o la cecina, depende de donde sea el concierto","Hola! En este festival buscan bandas","Un 👋","Si, pregunto a ver","Os contactaran por instagram a ver si os cuadra lo que os ofrecen","Saludos","Y suerte"] => {country: "España", state: "León", city: "León", typeUser: "superfan"}

 Ejemplo 3 (typeUser: "fan"):
 ["Hola. Gracias por escribir y por saludarme y gracias por hacer tan buena música.  ¿Como os conocí? Pues una vez al mes me gusta escuchar cosas nuevas, descubrir grupos que para mí eran desconocidos... Aparecisteis como sugerencia en Spotify, Youtube y en Instagram y os di una oportunidad y sorpresa!: me habéis gustado un montón. \n Existe una canción especial: atrapado en el tiempo, me parece un mensaje estupendo, una forma de vida, una historia personal muy larga...y porque además el 2 de febrero es mi cumpleaños. Me recordáis a los Piratas y los Piratas me encantan. Estaré pendientes de vosotros y espero veros pronto en algún directo. Muchas gracias por hacer música y un abrazo muy grande para todos .","Grandísima Canción. !!!"] => {"country":"España","state":null,"city":null,"typeUser":"fan"}

 Ejemplo 4 (typeUser: null)
["Hola\nSimplemente me salió vuestra versión de Zorra y ya os he empezado a seguir 😜","Me gustó pero si soy sincera no he podido de momento escuchar nada más vuestro","Pues entonces os conocen en casa porque son todos eurofanes menos yo😅","Si os habéis presentado al Benidorm fest","Pues os voy escuchando ☺️","Aaahj","Eso está hecho 👍🏼","🤣","Daré mi opinión sincera"] => {"country":"España","state":null,"city":null,"typeUser":null}

  Discriminar entre fan, superfan y null, depende de lo que interpretes en la conversación. Si hay un ánimo de ir a vernos, se le ve emocionado/a, hay muchos mensajes... pueden ser indicativos de ser un superfan. Si hay pocos mensajes, la conversación es escueta pero nos dicen de donde son... podría considerarse fan. Si los mensajes son secantes, typeUser será null. También tener en cuenta que existe un festival llamado Benidorm fest, esto no quiere decir que la persona sea de Benidorm. Debes de ser capaz de discriminar la ciudad y la provincia sin tener en cuenta este dato. Si alguna vez detectas una ciudad, siempre escribe el estado. Por ejemplo, si te dice que es de Tudela, state sería Navarra y city sería Tudela. Si no hay ciudad, state puede ir relleno si existe una provincia con ese nombre (o una comunidad autónoma) y city sería null. Si no hay nada, state sería null y city sería null.

  Y sobre todo, si la conclusión a la que llegas cuando devuelvas los datos es que state y city son Unknown o null, nunca jamás typeUser podrá ser ni fan ni superfan. MUY IMPORTANTE.  Siempre a la hora de determinar la procedencia (country o city), a no ser que sea de forma explícita primará el state. Si infieres que la persona es de Madrid en el campo state, el campo country nunca podrá ser Qatar, ni la ciudad Doha. El country será España y la ciudad Madrid.
  Cualquier campo Unknown lo conviertes a null en la respuesta.

	Y ahora devuelveme tu el objeto que te pedí en base a estos datos:
	`,
  USER: `En base a estos dos campos que te voy a pasar, y teniendo en cuenta estos ejemplos que te envío, devuelve el nombre de pila más posible para el usuario. 
	Quiero que devuelvas dos campos, el nombre de pila (short_name) y el tipo de usuario (treatment): (si crees que es una persona, treament = 1 y si crees que es un colectivo o indeterminado, treatment: 2. Devuelve únicamente en una línea lo que consideres, en formato json: {username:, full_name:, short_name:, treament:}. A continuación te envío unos ejemplos, y luego infiere tú el nombre:
	Ejemplo 1: {full_name: "Paty Palosamigos", username: "patypalosamigos"} => {username: "patypalosamigos", full_name: "Paty Palosamigos", short_name: "Paty", treatment: 1}
	Ejemplo 2: {full_name: "📸🎬🇯 🇴 🇸 🇪 🇱 🇺📸🎬This is magic", username: "joselu005"} => {username: "joselu005", full_name: "📸🎬🇯 🇴 🇸 🇪 🇱 🇺📸🎬This is magic", short_name: "Joselu", treatment: 1}
	Ejemplo 3: {full_name: "Eva A. ⚡️", username: "entrelucesyacordes"} => {username: "entrelucesyacordes", full_name: "Eva A. ⚡️", short_name: "Eva", treatment: 1}
	Ejemplo 4: {full_name: "", username: "mumy_08"} => {username: "mumy_08", full_name: "", short_name: "Mumy", treatment: 1}
	Ejemplo 5: {full_name: "Saca tu foie", username: "saca_tu_foie"} => {username: "saca_tu_foie", full_name: "Saca tu foie", short_name: "Saca tu foie", treatment: 2}
	Ejemplo 6: {full_name: "©a®men", username: "carmenjorquera33"} => {username: "carmenjorquera33", full_name: "©a®men", short_name: "Carmen", treatment: 1}
	Ejemplo 7: {full_name: "ɑӀҽյɑղժɾɑ", username: "godellaesbella"} => {username: "godellaesbella", full_name: "ɑӀҽյɑղժɾɑ", short_name: "Alejandra", treatment: 1}
	Ejemplo 8: {full_name: "ℝ𝕒𝕔𝕙𝕖𝕖𝕖𝕖𝕝", username: "bass_rpm"} => {username: "ℝ𝕒𝕔𝕙𝕖𝕖𝕖𝕖𝕝", full_name: "bass_rpm", short_name: "Rachel", treatment: 1}
	Ejemplo 9: {full_name: "🅰🅻🅻 🆂🅾🆄🅽🅳🆂", username: "allsoundspromo"} => {username: "allsoundspromo", full_name: "🅰🅻🅻 🆂🅾🆄🅽🅳🆂", short_name: "All Sounds", treatment: 2}
	Ejemplo 10: {full_name: "NSPECIAL MUSIC", username: "nspecialmusic"} => {username: "nspecialmusic", full_name: "NSPECIAL MUSIC", short_name: "Nspecial", treatment: 2}
	Ejemplo 11: {full_name: "yo", username: "lydi2m"} => {username: "lydi2n", full_name: "yo", short_name: "Lydia", treatment: 1}

	Y ahora sigue tu en base a estos datos:
	`,
};

/**
 * Gemini service
 */
export const geminiSvc: any = {
  models: [
    "gemini-2.0-flash",
    "gemini-2.5-flash",
    "gemini-2.5-flash-lite",
    "gemini-2.5-flash-lite",
  ],

  currentModel: null,

  setCurrentModel: () => {
    if (!geminiSvc.currentModel) {
      const index = Math.floor(Math.random() * geminiSvc.models.length);
      geminiSvc.currentModel = geminiSvc.models[index];
    } else {
      const currentIndex = geminiSvc.models.indexOf(geminiSvc.currentModel);
      const nextIndex = (currentIndex + 1) % geminiSvc.models.length;
      geminiSvc.currentModel = geminiSvc.models[nextIndex];
    }
  },

  ask: async (question: string) => {
    if (!geminiSvc.currentModel) {
      geminiSvc.setCurrentModel();
    }
    const response = await ai.models.generateContent({
      model: geminiSvc.currentModel,
      contents: question,
    });
    return response.candidates?.[0]?.content;
  },

  getUserInfo: async (data: string) => {
    const response = await geminiSvc.ask(`${QUESTIONS.INFO} ${data}`);
    try {
      return (
        JSON.parse(
          response.parts?.[0]?.text
            .trim()
            .replace(/```json/, "")
            .replace(/```/, "")
            .trim()
        ) ?? {}
      );
    } catch (error) {
      console.error("Error en getUserInfo:", response);
      return {};
    }
  },

  getUserData: async (data: string) => {
    const response = await geminiSvc.ask(`${QUESTIONS.USER} ${data}`);
    return JSON.parse(response.parts?.[0]?.text.replace(/```json/, "").replace(/```/, "")) ?? {};
  },
};
