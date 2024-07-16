const APP_ID = "c534d1fdfefa48238b31354fd4ec6d58"

let uid = sessionStorage.getItem('uid')

if (!uid) {
    uid = String(Math.floor(Math.random()*10000))
    sessionStorage.setItem('uid', uid)
}

let token = null

//Variable que permite el inicio de sesion (cliente) para tener acceso a enviar mensajes (canal)
let client;

//Variables que recuperan desde la url el id que colocamos para crear la sala, Ej: room.html?room=123
let queryString = window.location.search
let urlParams = new URLSearchParams(queryString)
let roomId = urlParams.get('room')

if (!roomId) {
    roomId = 'main'
}

let localTracks = []
let remoteUsers = {}

//Funcion que inicia una reunion creando un objeto Cliente que contiene el codec del video, webrtc y los demas parametros para crear una sala
let joinRoomInit = async () => {
    client = AgoraRTC.createClient({mode: 'rtc', codec:'vp8'})
    await client.join(APP_ID, roomId, token, uid)

    client.on('user-published'. handleUserPublished)

    joinStream()
}

//Funcion que activa el micro y la cam, ademas agg el recuadro de la persona que entra a la sala con la var player
let joinStream = async () => {
    localTracks = await AgoraRTC.createMicrophoneAndCameraTracks()

    let player = `<div class="video__container" id="user-container-${uid}">
                    <div class="video-player" id="user-${uid}"><div/>
                </div>`

    document.getElementById('streams__container').insertAdjacentHTML('beforeend', player)

    localTracks[1].play(`user-${uid}`)
    
    await client.publish([localTracks[0], localTracks[1]])
}


let handleUserPublished = async (user, mediaType) => {
    remoteUsers[user.uid] = user

    await client.subscribe(user, mediaType)

    let player = document.getElementById(`user-container-${user.uid}`)

    if (player === null) {
        player = `<div class="video__container" id="user-container-${user.uid}">
                        <div class="video-player" id="user-${user.uid}"><div/>
                </div>`
        document.getElementById('streams__container').insertAdjacentHTML('beforeend', player)
    }

    if (mediaType === 'video') {
        user.videoTrack.play(`user-${user.uid}`)
    }

    if (mediaType === 'audio') {
        user.audioTrack.play()
    }
}


joinRoomInit()
