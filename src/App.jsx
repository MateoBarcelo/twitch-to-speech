import { useState, useEffect, useRef } from 'react'
import connectTMI from './tmi.mjs'
import VolumeSlider from './VolumeSlider'
import Checkbox from './Checkbox'

function App() {

  const [voice, setVoice] = useState(window.localStorage.getItem('voice') || 'Microsoft Helena - Spanish (Spain)')
  const [sayUser, setSayUser] = useState(window.localStorage.getItem('sayUser') || false)

  const [isListening, setIsListening] = useState(false)

  let spanishVoices = window.speechSynthesis.getVoices().filter((voice) => voice.lang.includes('es'))

  const handleVoiceSelect = (e) => {
    setVoice(e.target.value)
    window.localStorage.setItem('voice', e.target.value)
  }

  let client = useRef(null)

  const handleListening = (e) => {
    e.preventDefault()
    const formData = Object.fromEntries(new FormData(e.target))

    if (!isListening) {
      setIsListening(true)
      connectTMI(formData.channel).then((clie) => {
        client.current = clie
        client.current.on('message', (channel, tags, message, self) => {

          const utterance = new window.SpeechSynthesisUtterance(sayUser ? `${tags.username} dice: ${message}` : message)
    
          let isMuted = window.localStorage.getItem('muted') === 'true' //string conversion to bool from localstorage
       
          utterance.volume= isMuted ? 0.0 : window.localStorage.getItem('volume')/100
    
          utterance.voice = spanishVoices.find((voic) => voic.name === voice) || spanishVoices[0]
          window.speechSynthesis.speak(utterance)
      
        });
      })

    } else {
      window.speechSynthesis.cancel()
      setIsListening(false)
      client.current.removeAllListeners()
      client.current.disconnect()
    }

    
  }

  return (
    <div className='bg-[#15191c] h-screen w-auto flex flex-col justify-center items-center'>

    <form onSubmit={handleListening} className='flex flex-col w-[50%] justify-start'>
      <h1 className='text-white text-6xl tracking-wider font-upheaval [text-shadow:_-2px_2px_0px_rgb(233_124_41)]'>Twitch to Speech</h1>
      <h2 className='text-[#fefc5b] [text-shadow:_-1px_1px_0px_rgb(233_124_41)] opacity-85 font-semibold py-2 text-xl font-gilroy'>Conéctate a un canal y disfruta escuchar gente escribir!</h2>
      <div className="grid grid-cols-5 grid-rows-1 gap-4 place-content-center py-8">
          <div className="col-span-5 row-span-1 flex">
            <input name='channel' className='focus:ring w-[70%] h-10 bg-[#24292c] p-3 text-white text-opacity-85'/>
            <button type='submit' className={`h-10 px-4 font-semibold ml-3 transition-colors ${isListening ? 'bg-red-400' : 'bg-[#fefc5b]'}`}>
              {isListening ? 'Dejar de escuchar' : 'Escuchar'}
            </button>
          </div>
          <div className="col-span-2 col-start-1 row-start-3">
            <p className='text-white opacity-85 mb-4'>Volumen</p>
            <VolumeSlider></VolumeSlider>
          </div>
          <div className="col-span-2 col-start-4 row-start-3 mr-6">
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
        window.localStorage.setItem('sayUser', e.target.checked)
      }}>Reproducir nombres de usuario</Checkbox>
    </form>
    
    </div>
  )
}

export default App
