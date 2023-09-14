import { useState, useEffect, useCallback } from 'react'
import connectTMI from './tmi.mjs'
import VolumeSlider from './VolumeSlider'
import Checkbox from './Checkbox'
function App() {

  const [voice, setVoice] = useState(() => window.localStorage.getItem('voice') || 'Microsoft Helena - Spanish (Spain)');
  const [sayUser, setSayUser] = useState(() => window.localStorage.getItem('sayUser') === 'true' || false);
  const [volume, setVolume] = useState(() => parseFloat(window.localStorage.getItem('volume')) || 0.7);
  const [muted, setMuted] = useState(() => window.localStorage.getItem('muted') === 'true' || false);
  const [isListening, setIsListening] = useState(false);
  const [isTemporized, setIsTemporized] = useState(false);
  const [time, setTime] = useState(0)
  const [timeRemaining, setTimeRemaining] = useState('')
  const [timeUnit, setTimeUnit] = useState('min')

  const [form, setForm] = useState({})
  const [client, setClient] = useState(null);

  const spanishVoices = window.speechSynthesis.getVoices().filter((voice) => voice.lang.includes('es'))

  const handleVolumeChange = useCallback((e) => {
    const newValue = e.target.valueAsNumber / 100;
    window.localStorage.setItem('volume', newValue);
    setVolume(newValue);
  }, []);

  const handleVoiceSelect = useCallback((e) => {
    const selectedVoice = e.target.value;
    window.localStorage.setItem('voice', selectedVoice);
    setVoice(selectedVoice);
  }, []);

  const handleMuted = useCallback((e) => {
    const isMuted = e.target.checked;
    setMuted(isMuted);
    setVolume(isMuted ? 0 : parseFloat(window.localStorage.getItem('volume')) || 0.5);
    window.localStorage.setItem('muted', isMuted);
  }, []);

  const handleListening = useCallback((e) => {
    e.preventDefault();
    const formData = Object.fromEntries(new FormData(e.target));
    setForm(formData)

    if (!isListening) {
      setIsListening(true);
      connectTMI(formData.channel).then((clie) => {
        setClient(clie);
      });
    } else {
      window.speechSynthesis.cancel();
      setIsListening(false);
      client.disconnect();
      setClient(null);
    }
  }, [isListening, client]);


  useEffect(() => {
    if (client && isListening) {

      //MessageHandler created for updating the speech properties at speak time, that's why it's not inside the message event directly
      const messageHandler = (channel, tags, message, self) => {
        const utterance = new window.SpeechSynthesisUtterance(
          sayUser ? `${tags.username} dice: ${message}` : message
        );

        utterance.volume = muted ? 0.0 : volume
        utterance.voice =
          spanishVoices.find((voic) => voic.name === voice) || spanishVoices[0]

        window.speechSynthesis.speak(utterance)

        //TIMER INTERVAL: fixes the bug of speechSynthesis stop working after 14secs (only with google voices)

        if(voice.includes('Google')) {
            let r = setInterval(() => {
              if (!speechSynthesis.speaking) {
                clearInterval(r)
              } else {
                speechSynthesis.pause()
                speechSynthesis.resume()
              }
          }, 14000)
        }

      }

      client.on('message', messageHandler);

      return () => {
        client.removeAllListeners();
        window.speechSynthesis.cancel();
      };
    }
  }, [client, volume, sayUser, muted, voice, isListening]);
  
  function getTime() {
    let timed = 0
    switch(timeUnit) {
      case 'min':
        timed = time * 60
        break;
      case 'hs':
        timed = time * 3600
        break;
      default:
        timed = time
    }
    return timed
  }
  //TIMER: stops listening after a certain time
  useEffect(() => {
    if(isTemporized && isListening) {

      let timer = getTime(), minutes, seconds;

      const intervalId = setInterval(function () {
        minutes = parseInt(timer / 60, 10);
        seconds = parseInt(timer % 60, 10);

        minutes = minutes < 10 ? "0" + minutes : minutes;
        seconds = seconds < 10 ? "0" + seconds : seconds;

        setTimeRemaining(minutes + ":" + seconds);

        if (--timer < 0) {
            timer = duration;
        }
    }, 1000);

      let interval = setTimeout(() => {
          setIsListening(false)
          window.speechSynthesis.cancel();
          client.disconnect();
          setClient(null); 
      }, getTime() * 1000)



      return () =>  {
        clearTimeout(interval)
        setTimeRemaining('')
        clearInterval(intervalId)
      }
    }
  },[isTemporized, isListening, time, timeUnit])

  return (
    <div className='bg-[#15191c] h-screen w-full flex flex-col justify-center items-center'>
      <form onSubmit={handleListening} className='flex flex-col w-1/2 justify-start'>
        <h1 className='text-white text-6xl tracking-wider font-upheaval [text-shadow:_-2px_2px_0px_rgb(233_124_41)]'>Twitch to Speech</h1>
        <h2 className='text-[#fefc5b] [text-shadow:_-1px_1px_0px_rgb(233_124_41)] opacity-85 font-semibold py-2 text-xl font-gilroy'>Conéctate a un canal y disfruta escuchar gente escribir!</h2>
        <div className="grid grid-cols-5 grid-rows-1 gap-4 place-content-center py-8">
            <div className="col-span-5 row-span-1 flex">
              <input name='channel' placeholder='Nombre del canal' className='focus:ring w-[90%] md:w-[70%] h-10 bg-[#24292c] p-3 text-gray-400 text-opacity-100'/>
              <div className='flex flex-col items-center'>
                <button type='submit' className={`h-10 px-2 md:px-4 font-semibold ml-3 mr-3 transition-colors ${isListening ? 'bg-red-400' : 'bg-[#fefc5b]'}`}>
                  {isListening ? 'Dejar de escuchar' : 'Escuchar'}
                </button>
                {(isListening && isTemporized) && <p className='text-white opacity-75 pt-2'>{timeRemaining}</p>}
              </div>
            </div>
            <div className="col-span-5 md:col-span-2 col-start-1 row-start-3">
              <p className='text-white opacity-85 mb-4'>Volumen</p>
              <VolumeSlider handleMute={handleMuted} onChange={handleVolumeChange} volumen={volume*100}></VolumeSlider>
            </div>
            <div className="col-span-5 col-start-1 row-start-4 md:col-span-2 md:col-start-4 md:row-start-3 mr-6">
              <label for="voices" class="text-white dark:text-white">Selecciona una voz</label>
              <select id="voices" name='voice' onChange={handleVoiceSelect} className="bg-[#24292c] w-[70%] mt-2 text-gray-400 text-sm border-none">
                {spanishVoices.map((voice, key) => (
                  <option key={key} value={voice.name}>{voice.name}</option>
                ))}
              </select>
            </div>
        </div>
        <div className='space-y-3'>
          <Checkbox onChange={function(e) {
            setSayUser(e.target.checked)
            window.localStorage.setItem('sayUser', e.target.checked)
          }}>Reproducir nombres de usuario</Checkbox>
          
          <div className='flex space-x-3 items-center'>
            <Checkbox onChange={(e) => setIsTemporized(e.target.checked)}>Temporizador</Checkbox>
            {isTemporized && 
              <div>
                <input name='temporizer' type='number' value={time} onChange={(e) => setTime(e.target.valueAsNumber)} className='bg-[#24292c] w-[60px] text-white text-sm px-2 border-none'/>
                <select id="timer" name='timer' onChange={(e) => setTimeUnit(e.target.value)} className="bg-[#24292c] w-[75px] text-gray-400 ml-3 text-sm border-none">
                  <option value={'min'}>Minutos</option>
                  <option value={'seg'}>Segundos</option>
                  <option value={'hs'}>Horas</option>
                </select>
              </div>}
          </div>
        </div> 
    </form>   
  </div>
  )
}

export default App
