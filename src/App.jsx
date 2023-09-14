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
  const [client, setClient] = useState(null);

  let spanishVoices = window.speechSynthesis.getVoices().filter((voice) => voice.lang.includes('es'))


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
    if (client) {
      const messageHandler = (channel, tags, message, self) => {
        const utterance = new window.SpeechSynthesisUtterance(
          sayUser ? `${tags.username} dice: ${message}` : message
        );

        utterance.volume = muted ? 0.0 : volume
        utterance.voice =
          spanishVoices.find((voic) => voic.name === voice) || spanishVoices[0]

        window.speechSynthesis.speak(utterance)

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
  }, [client, volume, sayUser, muted, voice]);

  return (
    <div className='bg-[#15191c] h-screen w-full flex flex-col justify-center items-center'>
      <form onSubmit={handleListening} className='flex flex-col w-[50%] justify-start'>
        <h1 className='text-white text-6xl tracking-wider font-upheaval [text-shadow:_-2px_2px_0px_rgb(233_124_41)]'>Twitch to Speech</h1>
        <h2 className='text-[#fefc5b] [text-shadow:_-1px_1px_0px_rgb(233_124_41)] opacity-85 font-semibold py-2 text-xl font-gilroy'>Conéctate a un canal y disfruta escuchar gente escribir!</h2>
        <div className="grid grid-cols-5 grid-rows-1 gap-4 place-content-center py-8">
            <div className="col-span-5 row-span-1 flex">
              <input name='channel' placeholder='Nombre del canal' className='focus:ring w-[90%] md:w-[70%] h-10 bg-[#24292c] p-3 text-gray-400 text-opacity-100'/>
              <button type='submit' className={`h-10 px-2 md:px-4 font-semibold ml-3 transition-colors ${isListening ? 'bg-red-400' : 'bg-[#fefc5b]'}`}>
                {isListening ? 'Dejar de escuchar' : 'Escuchar'}
              </button>
            </div>
            <div className="col-span-5 md:col-span-2 col-start-1 row-start-3">
              <p className='text-white opacity-85 mb-4'>Volumen</p>
              <VolumeSlider handleMute={handleMuted} onChange={handleVolumeChange} volumen={volume*100}></VolumeSlider>
            </div>
            <div className="col-span-5 col-start-1 row-start-4 md:col-span-2 md:col-start-4 md:row-start-3 mr-6">
              <label for="voices" class="text-white dark:text-white">Selecciona una voz</label>
              <select id="voices" name='voice' onChange={handleVoiceSelect} class="bg-[#24292c] w-[70%] mt-2 text-gray-400 text-sm border-none">
                {spanishVoices.map((voice) => (
                  <option value={voice.name}>{voice.name}</option>
                ))}
              </select>
            </div>
        </div>
        <Checkbox onChange={function(e) {
          setSayUser(e.target.checked)
          console.log(sayUser)
          window.localStorage.setItem('sayUser', e.target.checked)
        }}>Reproducir nombres de usuario</Checkbox>
    </form>   
  </div>
  )
}

export default App
